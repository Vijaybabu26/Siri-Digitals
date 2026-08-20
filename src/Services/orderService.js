import { supabase } from "../supabase";

/* =========================================================
   PAYMENT STATUS
========================================================= */

export const getPaymentStatus = (total, paid) => {
  const totalAmount = Number(total) || 0;
  const paidAmount = Number(paid) || 0;

  if (paidAmount <= 0) {
    return "UNPAID";
  }

  if (paidAmount >= totalAmount) {
    return "PAID";
  }

  return "PARTIAL";
};


/* =========================================================
   CREATE ORDER
========================================================= */

export const createOrder = async ({
  customer_id,
  items,
  subtotal = 0,
  discount = 0,
  total_amount = 0,
  paid_amount = 0,
  notes = null,
}) => {

  if (!customer_id) {
    throw new Error("Customer is required.");
  }

  if (!items || items.length === 0) {
    throw new Error("At least one product is required.");
  }

  const subtotalAmount = Number(subtotal) || 0;
  const discountAmount = Number(discount) || 0;
  const totalAmount = Number(total_amount) || 0;
  const paidAmount = Number(paid_amount) || 0;

  /* =======================================================
     VALIDATION
  ======================================================= */

  if (subtotalAmount < 0) {
    throw new Error("Subtotal cannot be negative.");
  }

  if (discountAmount < 0) {
    throw new Error("Discount cannot be negative.");
  }

  if (discountAmount > subtotalAmount) {
    throw new Error(
      "Discount cannot be greater than subtotal."
    );
  }

  if (totalAmount < 0) {
    throw new Error("Order total cannot be negative.");
  }

  if (paidAmount < 0) {
    throw new Error("Paid amount cannot be negative.");
  }

  if (paidAmount > totalAmount) {
    throw new Error(
      "Paid amount cannot be greater than order total."
    );
  }

  /* =======================================================
     BALANCE
  ======================================================= */

  const balanceAmount = Math.max(
    totalAmount - paidAmount,
    0
  );

  /* =======================================================
     GENERATE ORDER NUMBER
  ======================================================= */

  const {
    data: orderNumber,
    error: numberError,
  } = await supabase.rpc(
    "generate_order_number"
  );

  if (numberError) {
    console.error(
      "GENERATE ORDER NUMBER ERROR:",
      numberError
    );

    throw numberError;
  }

  if (!orderNumber) {
    throw new Error(
      "Unable to generate order number."
    );
  }

  /* =======================================================
     CREATE ORDER
     
     IMPORTANT:
     status is WORKFLOW status.
     Do NOT use PAID / PARTIAL / UNPAID here.
  ======================================================= */

  const {
    data: order,
    error: orderError,
  } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id,

      total: totalAmount,
      paid: paidAmount,
      balance: balanceAmount,

      // Workflow status only
      status: "NEW",

      notes,
    })
    .select()
    .single();

  if (orderError) {
    console.error(
      "CREATE ORDER ERROR:",
      orderError
    );

    throw orderError;
  }

  /* =======================================================
     ORDER ITEMS
  ======================================================= */

  const orderItems = items.map((item) => ({
    order_id: order.id,

    product_id:
      item.product_id || null,

    product_name:
      item.product_name || "Product",

    pricing_type:
      item.pricing_type || "FIXED",

    size:
      item.size || null,

    width:
      item.width !== null &&
      item.width !== undefined &&
      item.width !== ""
        ? Number(item.width)
        : null,

    height:
      item.height !== null &&
      item.height !== undefined &&
      item.height !== ""
        ? Number(item.height)
        : null,

    size_unit:
      item.size_unit ||
      item.unit ||
      null,

    quantity:
      Number(item.quantity) || 0,

    rate:
      Number(item.unit_price) || 0,

    amount:
      Number(item.total) || 0,
  }));

  console.log(
    "ORDER ITEMS:",
    orderItems
  );

  /* =======================================================
     INSERT ORDER ITEMS
  ======================================================= */

  const {
    error: itemError,
  } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemError) {

    console.error(
      "ORDER ITEM ERROR:",
      itemError
    );

    await supabase
      .from("orders")
      .delete()
      .eq("id", order.id);

    throw itemError;
  }

  /* =======================================================
     INITIAL PAYMENT
  ======================================================= */

  if (paidAmount > 0) {

    const {
      error: paymentError,
    } = await supabase
      .from("payments")
      .insert({
        order_id: order.id,

        amount: paidAmount,

        payment_method: "CASH",

        reference_number: null,

        notes: null,
      });

    if (paymentError) {

      console.error(
        "PAYMENT ERROR:",
        paymentError
      );

      await supabase
        .from("order_items")
        .delete()
        .eq("order_id", order.id);

      await supabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      throw paymentError;
    }
  }

  /* =======================================================
     RETURN CREATED ORDER
  ======================================================= */

  return {
    ...order,

    subtotal: subtotalAmount,
    discount: discountAmount,

    total: totalAmount,
    paid: paidAmount,
    balance: balanceAmount,

    payment_status:
      getPaymentStatus(
        totalAmount,
        paidAmount
      ),
  };
};


/* =========================================================
   GET ALL ORDERS
========================================================= */

export const getOrders = async () => {

  const {
    data,
    error,
  } = await supabase
    .from("orders")
    .select(`
      *,
      customers (
        id,
        mobile,
        name,
        email
      )
    `)
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {
    throw error;
  }

  return (data || []).map((order) => {

    const total =
      Number(order.total) || 0;

    const paid =
      Number(order.paid) || 0;

    const balance = Math.max(
      total - paid,
      0
    );

    return {
      ...order,

      balance,

      payment_status:
        getPaymentStatus(
          total,
          paid
        ),
    };
  });
};


/* =========================================================
   GET ORDER BY ID
========================================================= */

export const getOrderById = async (id) => {

  if (!id) {
    throw new Error(
      "Order ID is required."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("orders")
    .select(`
      *,
      customers (
        id,
        mobile,
        name,
        email
      ),
      order_items (
        id,
        order_id,
        product_id,
        product_name,
        pricing_type,
        size,
        width,
        height,
        size_unit,
        quantity,
        rate,
        amount,
        created_at
      ),
      payments (
        id,
        order_id,
        amount,
        payment_method,
        reference_number,
        notes,
        created_at
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  const total =
    Number(data.total) || 0;

  const paid =
    Number(data.paid) || 0;

  const balance = Math.max(
    total - paid,
    0
  );

  return {
    ...data,

    balance,

    payment_status:
      getPaymentStatus(
        total,
        paid
      ),
  };
};


/* =========================================================
   ADD PAYMENT TO ORDER
========================================================= */

export const addOrderPayment = async ({
  orderId,
  amount,
  paymentMethod = "CASH",
  referenceNumber = null,
  notes = null,
}) => {

  if (!orderId) {
    throw new Error(
      "Order ID is required."
    );
  }

  const paymentAmount =
    Number(amount);

  if (
    !Number.isFinite(paymentAmount) ||
    paymentAmount <= 0
  ) {
    throw new Error(
      "Payment amount must be greater than 0."
    );
  }

  /* =======================================================
     GET ORDER
  ======================================================= */

  const {
    data: order,
    error: orderError,
  } = await supabase
    .from("orders")
    .select(`
      id,
      total,
      paid,
      balance,
      status
    `)
    .eq("id", orderId)
    .single();

  if (orderError) {
    throw orderError;
  }

  const totalAmount =
    Number(order.total) || 0;

  const currentPaid =
    Number(order.paid) || 0;

  const currentBalance =
    Math.max(
      totalAmount - currentPaid,
      0
    );

  /* =======================================================
     VALIDATE PAYMENT
  ======================================================= */

  if (paymentAmount > currentBalance) {
    throw new Error(
      `Payment cannot be greater than remaining balance of ₹${currentBalance.toFixed(
        2
      )}.`
    );
  }

  /* =======================================================
     NEW PAYMENT VALUES
  ======================================================= */

  const newPaidAmount =
    currentPaid + paymentAmount;

  const newBalance =
    Math.max(
      totalAmount - newPaidAmount,
      0
    );

  /* =======================================================
     CREATE PAYMENT
  ======================================================= */

  const {
    data: payment,
    error: paymentError,
  } = await supabase
    .from("payments")
    .insert({
      order_id: orderId,

      amount: paymentAmount,

      payment_method:
        paymentMethod,

      reference_number:
        referenceNumber,

      notes,
    })
    .select()
    .single();

  if (paymentError) {
    throw paymentError;
  }

  /* =======================================================
     UPDATE ORDER

     IMPORTANT:
     DO NOT UPDATE status here.

     The existing order.status remains:
       NEW
       PRINTING
       READY
       DELIVERED
       COMPLETED
       CANCELLED

     Payment status is calculated separately.
  ======================================================= */

  const {
    data: updatedOrder,
    error: updateError,
  } = await supabase
    .from("orders")
    .update({
      paid: newPaidAmount,

      balance: newBalance,

      updated_at:
        new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  /* =======================================================
     ROLLBACK PAYMENT IF ORDER UPDATE FAILED
  ======================================================= */

  if (updateError) {

    await supabase
      .from("payments")
      .delete()
      .eq("id", payment.id);

    throw updateError;
  }

  return {
    payment,

    order: {
      ...updatedOrder,

      balance: newBalance,

      payment_status:
        getPaymentStatus(
          totalAmount,
          newPaidAmount
        ),
    },
  };
};


/* =========================================================
   UPDATE ORDER WORKFLOW STATUS
========================================================= */

export const updateOrderStatus = async (
  id,
  status
) => {

  if (!id) {
    throw new Error(
      "Order ID is required."
    );
  }

  if (!status) {
    throw new Error(
      "Order status is required."
    );
  }

  const allowedStatuses = [
    "NEW",
    "PRINTING",
    "READY",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error(
      `Invalid order status: ${status}`
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("orders")
    .update({
      status,

      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};


/* =========================================================
   DELETE ORDER
========================================================= */

export const deleteOrder = async (id) => {

  if (!id) {
    throw new Error(
      "Order ID is required."
    );
  }

  /* Delete payments */

  const {
    error: paymentError,
  } = await supabase
    .from("payments")
    .delete()
    .eq("order_id", id);

  if (paymentError) {
    throw paymentError;
  }

  /* Delete order items */

  const {
    error: itemError,
  } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", id);

  if (itemError) {
    throw itemError;
  }

  /* Delete order */

  const {
    error: orderError,
  } = await supabase
    .from("orders")
    .delete()
    .eq("id", id);

  if (orderError) {
    throw orderError;
  }

  return true;
};