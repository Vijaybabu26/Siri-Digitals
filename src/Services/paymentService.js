import { supabase } from "../supabase";

/*
|--------------------------------------------------------------------------
| ADD PAYMENT
|--------------------------------------------------------------------------
*/

export const addPayment = async ({
  orderId,
  amount,
  paymentMethod,
  referenceNumber = null,
  notes = null,
}) => {
  if (!orderId) {
    throw new Error("Order is required.");
  }

  if (!amount || Number(amount) <= 0) {
    throw new Error("Payment amount must be greater than 0.");
  }

  if (!paymentMethod) {
    throw new Error("Payment method is required.");
  }

  /*
    |--------------------------------------------------------------------------
    | Get current order
    |--------------------------------------------------------------------------
    */

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
            id,
            total,
            paid,
            balance,
            status
        `,
    )
    .eq("id", orderId)
    .single();

  if (orderError) {
    throw orderError;
  }

  const paymentAmount = Number(amount);

  const currentPaid = Number(order.paid || 0);

  const total = Number(order.total || 0);

  const newPaid = currentPaid + paymentAmount;

  /*
    |--------------------------------------------------------------------------
    | Prevent over payment
    |--------------------------------------------------------------------------
    */

  if (newPaid > total) {
    throw new Error(
      `Payment cannot be greater than the remaining balance of ₹${Number(
        order.balance || 0,
      ).toFixed(2)}`,
    );
  }

  const newBalance = Math.max(total - newPaid, 0);

  /*
    |--------------------------------------------------------------------------
    | Determine status
    |--------------------------------------------------------------------------
    */

  let newStatus = "UNPAID";

  if (newPaid >= total) {
    newStatus = "PAID";
  } else if (newPaid > 0) {
    newStatus = "PARTIAL";
  }

  /*
    |--------------------------------------------------------------------------
    | Insert payment transaction
    |--------------------------------------------------------------------------
    */

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      order_id: orderId,
      amount: paymentAmount,
      payment_method: paymentMethod,
      reference_number: referenceNumber,
      notes: notes,
    })
    .select()
    .single();

  if (paymentError) {
    console.error("Add payment error:", paymentError);

    throw paymentError;
  }

  /*
    |--------------------------------------------------------------------------
    | Update order payment information
    |--------------------------------------------------------------------------
    */

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      paid: newPaid,
      balance: newBalance,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) {
    console.error("Update order payment error:", updateError);

    throw updateError;
  }

  return payment;
};

/*
|--------------------------------------------------------------------------
| GET ALL PAYMENT TRANSACTIONS
|--------------------------------------------------------------------------
*/

export const getPayments = async () => {
  const { data, error } = await supabase
    .from("payments")
    .select(
      `
            id,
            order_id,
            amount,
            payment_method,
            reference_number,
            notes,
            created_at,
            orders (
                id,
                order_number,
                total,
                paid,
                balance,
                status,
                customer_id,
                customers (
                    id,
                    name,
                    mobile,
                    email
                )
            )
        `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Get payments error:", error);

    throw error;
  }

  return data || [];
};

/*
|--------------------------------------------------------------------------
| GET PAYMENTS FOR ONE ORDER
|--------------------------------------------------------------------------
*/

export const getOrderPayments = async (orderId) => {
  if (!orderId) {
    throw new Error("Order ID is required.");
  }

  const { data, error } = await supabase
    .from("payments")
    .select(
      `
            id,
            order_id,
            amount,
            payment_method,
            reference_number,
            notes,
            created_at
        `,
    )
    .eq("order_id", orderId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Get order payments error:", error);

    throw error;
  }

  return data || [];
};

/*
|--------------------------------------------------------------------------
| GET PAYMENT SUMMARY
|--------------------------------------------------------------------------
|
| Uses the values already maintained in orders:
|
| total
| paid
| balance
| status
|
|--------------------------------------------------------------------------
*/

export const getPaymentSummary = async () => {
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
            id,
            order_number,
            customer_id,
            total,
            paid,
            balance,
            status,
            notes,
            created_at,
            updated_at,
            customers (
                id,
                name,
                mobile,
                email
            )
        `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Get payment summary error:", error);

    throw error;
  }

  return (orders || []).map((order) => ({
    id: order.id,

    order_number: order.order_number,

    total_amount: Number(order.total || 0),

    paid_amount: Number(order.paid || 0),

    balance_amount: Number(order.balance || 0),

    payment_status: order.status || "UNPAID",

    created_at: order.created_at,

    updated_at: order.updated_at,

    customers: order.customers,

    notes: order.notes,
  }));
};
