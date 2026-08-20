import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getCustomers,
  createCustomer,
} from "../Services/customerService";

import { getAllProducts } from "../Services/productService";

import {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
} from "../Services/orderService";

import { logoutUser } from "../Services/authService";

import "./Orders.css";

function Orders() {
  const navigate = useNavigate();

  // =====================================================
  // ORDER STATUS
  // =====================================================

  const ORDER_STATUSES = [
    "NEW",
    "PRINTING",
    "READY",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
  ];

  // =====================================================
  // STATE
  // =====================================================

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const [error, setError] = useState("");

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  // =====================================================
  // ORDER FILTERS
  // =====================================================

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  // =====================================================
  // ORDER FORM
  // =====================================================

  const [orderForm, setOrderForm] = useState({
    customer_id: "",
    customer_mobile: "",
    notes: "",
    discount: 0,
    paid_amount: 0,
    status: "NEW",
  });

  // =====================================================
  // CUSTOMER FORM
  // =====================================================

  const [customerForm, setCustomerForm] = useState({
    mobile: "",
    name: "",
    email: "",
  });

  // =====================================================
  // ORDER ITEMS
  // =====================================================

  const [orderItems, setOrderItems] = useState([]);

  const [newItem, setNewItem] = useState({
    product_id: "",
    quantity: 1,
    width: "",
    height: "",
  });

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        ordersData,
        customersData,
        productsData,
      ] = await Promise.all([
        getOrders(),
        getCustomers(),
        getAllProducts(),
      ]);

      console.log("ORDERS FROM DATABASE:", ordersData);

      setOrders(ordersData || []);

      setCustomers(customersData || []);

      setProducts(
        (productsData || []).filter(
          (product) => product.is_active !== false,
        ),
      );
    } catch (err) {
      console.error("LOAD ORDERS ERROR:", err);

      setError(
        err.message || "Unable to load order data.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FILTER HANDLERS
  // =====================================================

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      fromDate: "",
      toDate: "",
    });
  };

  // =====================================================
  // FILTERED ORDERS
  // =====================================================

  const filteredOrders = orders.filter((order) => {
    const searchText = filters.search
      .toLowerCase()
      .trim();

    const orderNumber = String(
      order.order_number || "",
    ).toLowerCase();

    const customerName = String(
      order.customers?.name || "",
    ).toLowerCase();

    const customerMobile = String(
      order.customers?.mobile || "",
    ).toLowerCase();

    const orderStatus = String(
      order.status || "",
    ).toUpperCase();

    // ---------------------------------------------
    // SEARCH
    // Order Number
    // Customer Name
    // Customer Mobile
    // ---------------------------------------------

    const matchesSearch =
      !searchText ||
      orderNumber.includes(searchText) ||
      customerName.includes(searchText) ||
      customerMobile.includes(searchText);

    // ---------------------------------------------
    // STATUS
    // ---------------------------------------------

    const matchesStatus =
      !filters.status ||
      orderStatus === filters.status;

    // ---------------------------------------------
    // DATE FILTER
    // ---------------------------------------------

    let matchesFromDate = true;
    let matchesToDate = true;

    if (order.created_at) {
      const orderDate = new Date(order.created_at);

      // Local YYYY-MM-DD
      const orderDateString = [
        orderDate.getFullYear(),
        String(
          orderDate.getMonth() + 1,
        ).padStart(2, "0"),
        String(
          orderDate.getDate(),
        ).padStart(2, "0"),
      ].join("-");

      if (filters.fromDate) {
        matchesFromDate =
          orderDateString >= filters.fromDate;
      }

      if (filters.toDate) {
        matchesToDate =
          orderDateString <= filters.toDate;
      }
    } else {
      // If date filtering is being used and
      // order has no created_at, don't display it.
      if (
        filters.fromDate ||
        filters.toDate
      ) {
        return false;
      }
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesFromDate &&
      matchesToDate
    );
  });

  // =====================================================
  // OPEN ORDER MODAL
  // =====================================================

  const openOrderModal = () => {
    setOrderForm({
      customer_id: "",
      customer_mobile: "",
      notes: "",
      discount: 0,
      paid_amount: 0,
      status: "NEW",
    });

    setOrderItems([]);

    setNewItem({
      product_id: "",
      quantity: 1,
      width: "",
      height: "",
    });

    setCustomerForm({
      mobile: "",
      name: "",
      email: "",
    });

    setShowCustomerForm(false);
    setError("");
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    if (saving) {
      return;
    }

    setShowOrderModal(false);
    setShowCustomerForm(false);
    setError("");
  };

  // =====================================================
  // CUSTOMER
  // =====================================================

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;

    const customer = customers.find(
      (item) =>
        String(item.id) ===
        String(customerId),
    );

    setOrderForm((prev) => ({
      ...prev,
      customer_id: customerId,
      customer_mobile:
        customer?.mobile || "",
    }));
  };

  const handleCustomerFormChange = (e) => {
    const { name, value } = e.target;

    setCustomerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();

    setError("");

    const mobile =
      customerForm.mobile.trim();

    if (!mobile) {
      setError(
        "Customer mobile number is required.",
      );
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setError(
        "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    try {
      setSaving(true);

      const customer =
        await createCustomer({
          mobile,
          name:
            customerForm.name.trim() ||
            null,
          email:
            customerForm.email.trim() ||
            null,
        });

      setCustomers((prev) => [
        ...prev,
        customer,
      ]);

      setOrderForm((prev) => ({
        ...prev,
        customer_id: customer.id,
        customer_mobile:
          customer.mobile,
      }));

      setCustomerForm({
        mobile: "",
        name: "",
        email: "",
      });

      setShowCustomerForm(false);
    } catch (err) {
      console.error(
        "CREATE CUSTOMER ERROR:",
        err,
      );

      if (err.code === "23505") {
        setError(
          "This mobile number already exists.",
        );
      } else {
        setError(
          err.message ||
            "Unable to create customer.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // PRODUCT
  // =====================================================

  const selectedProduct = products.find(
    (product) =>
      String(product.id) ===
      String(newItem.product_id),
  );

  const handleProductChange = (e) => {
    const productId = e.target.value;

    setNewItem((prev) => ({
      ...prev,
      product_id: productId,
      width: "",
      height: "",
    }));
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;

    setNewItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // PRICE CALCULATION
  // =====================================================

  const calculateItemTotal = (
    product,
    item,
  ) => {
    if (!product) {
      return 0;
    }

    const price =
      Number(product.price) || 0;

    const quantity =
      Number(item.quantity) || 0;

    switch (product.pricing_type) {
      case "PER_SQ_FT": {
        const width =
          Number(item.width) || 0;

        const height =
          Number(item.height) || 0;

        return (
          width *
          height *
          price *
          quantity
        );
      }

      case "PER_SQ_METER": {
        const width =
          Number(item.width) || 0;

        const height =
          Number(item.height) || 0;

        return (
          width *
          height *
          price *
          quantity
        );
      }

      case "PER_PIECE":
        return price * quantity;

      case "PER_100":
        return price * (quantity / 100);

      case "PER_1000":
        return price * (quantity / 1000);

      case "FIXED":
      default:
        return price * quantity;
    }
  };

  // =====================================================
  // ADD ITEM
  // =====================================================

  const addItem = () => {
    setError("");

    if (!newItem.product_id) {
      setError(
        "Please select a product.",
      );
      return;
    }

    const quantity =
      Number(newItem.quantity);

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      setError(
        "Please enter a valid quantity.",
      );
      return;
    }

    if (selectedProduct?.allow_size) {
      const width =
        Number(newItem.width);

      const height =
        Number(newItem.height);

      if (
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        width <= 0 ||
        height <= 0
      ) {
        setError(
          "Please enter valid width and height.",
        );
        return;
      }
    }

    const total =
      calculateItemTotal(
        selectedProduct,
        newItem,
      );

    if (
      !Number.isFinite(total) ||
      total < 0
    ) {
      setError(
        "Unable to calculate product price.",
      );
      return;
    }

    const item = {
      id: Date.now(),

      product_id:
        selectedProduct.id,

      product_name:
        selectedProduct.name,

      pricing_type:
        selectedProduct.pricing_type,

      price:
        Number(
          selectedProduct.price,
        ) || 0,

      quantity,

      width:
        selectedProduct.allow_size
          ? Number(newItem.width)
          : null,

      height:
        selectedProduct.allow_size
          ? Number(newItem.height)
          : null,

      unit:
        selectedProduct.unit ||
        null,

      total,
    };

    console.log(
      "ADDING ORDER ITEM:",
      item,
    );

    setOrderItems((prev) => [
      ...prev,
      item,
    ]);

    setNewItem({
      product_id: "",
      quantity: 1,
      width: "",
      height: "",
    });
  };

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  const removeItem = (itemId) => {
    setOrderItems((prev) =>
      prev.filter(
        (item) => item.id !== itemId,
      ),
    );
  };

  // =====================================================
  // TOTALS
  // =====================================================

  const subtotal = orderItems.reduce(
    (sum, item) =>
      sum +
      (Number(item.total) || 0),
    0,
  );

  const discount = Math.max(
    0,
    Number(orderForm.discount) || 0,
  );

  const grandTotal = Math.max(
    subtotal - discount,
    0,
  );

  const paidAmount = Math.max(
    0,
    Number(orderForm.paid_amount) || 0,
  );

  const balance = Math.max(
    grandTotal - paidAmount,
    0,
  );

  // =====================================================
  // PAYMENT STATUS
  // =====================================================

  const getPaymentStatus = (
    total,
    paid,
  ) => {
    const totalAmount =
      Number(total) || 0;

    const paidAmountValue =
      Number(paid) || 0;

    if (paidAmountValue <= 0) {
      return "UNPAID";
    }

    if (
      paidAmountValue >=
      totalAmount
    ) {
      return "PAID";
    }

    return "PARTIAL";
  };

  // =====================================================
  // ORDER STATUS
  // =====================================================

  const getOrderStatus = (order) => {
    const status = String(
      order?.status || "NEW",
    ).toUpperCase();

    if (
      ORDER_STATUSES.includes(status)
    ) {
      return status;
    }

    return "NEW";
  };

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  const handleStatusChange = async (
    orderId,
    newStatus,
  ) => {
    if (!orderId || !newStatus) {
      return;
    }

    if (
      !ORDER_STATUSES.includes(
        newStatus,
      )
    ) {
      setError(
        "Invalid order status.",
      );
      return;
    }

    try {
      setError("");
      setUpdatingStatus(orderId);

      console.log(
        "UPDATING ORDER STATUS:",
        orderId,
        newStatus,
      );

      const updatedOrder =
        await updateOrderStatus(
          orderId,
          newStatus,
        );

      console.log(
        "UPDATED ORDER:",
        updatedOrder,
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (
            order.id !== orderId
          ) {
            return order;
          }

          if (
            updatedOrder &&
            typeof updatedOrder ===
              "object"
          ) {
            return {
              ...order,
              ...updatedOrder,
              status:
                updatedOrder.status ||
                newStatus,
            };
          }

          return {
            ...order,
            status: newStatus,
          };
        }),
      );
    } catch (err) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        err,
      );

      setError(
        err.message ||
          "Unable to update order status.",
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // =====================================================
  // CREATE ORDER
  // =====================================================

  const handleCreateOrder = async (
    e,
  ) => {
    e.preventDefault();

    setError("");

    // ---------------------------------------------
    // CUSTOMER
    // ---------------------------------------------

    if (!orderForm.customer_id) {
      setError(
        "Please select a customer.",
      );
      return;
    }

    // ---------------------------------------------
    // ITEMS
    // ---------------------------------------------

    if (orderItems.length === 0) {
      setError(
        "Please add at least one product.",
      );
      return;
    }

    // ---------------------------------------------
    // STATUS
    // ---------------------------------------------

    const orderStatus =
      ORDER_STATUSES.includes(
        orderForm.status,
      )
        ? orderForm.status
        : "NEW";

    // ---------------------------------------------
    // TOTALS
    // ---------------------------------------------

    const subtotalAmount =
      orderItems.reduce(
        (sum, item) =>
          sum +
          (Number(item.total) || 0),
        0,
      );

    const discountAmount =
      Math.max(
        0,
        Number(orderForm.discount) ||
          0,
      );

    const totalAmount = Math.max(
      subtotalAmount -
        discountAmount,
      0,
    );

    const paidAmountValue =
      Math.max(
        0,
        Number(
          orderForm.paid_amount,
        ) || 0,
      );

    const balanceAmount =
      Math.max(
        totalAmount -
          paidAmountValue,
        0,
      );

    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------

    if (
      discountAmount >
      subtotalAmount
    ) {
      setError(
        "Discount cannot be greater than subtotal.",
      );
      return;
    }

    if (
      paidAmountValue >
      totalAmount
    ) {
      setError(
        "Paid amount cannot be greater than total.",
      );
      return;
    }

    try {
      setSaving(true);

      console.log(
        "=================================",
      );

      console.log(
        "CREATING ORDER",
      );

      console.log(
        "Customer:",
        orderForm.customer_id,
      );

      console.log(
        "Subtotal:",
        subtotalAmount,
      );

      console.log(
        "Discount:",
        discountAmount,
      );

      console.log(
        "Total:",
        totalAmount,
      );

      console.log(
        "Paid:",
        paidAmountValue,
      );

      console.log(
        "Balance:",
        balanceAmount,
      );

      console.log(
        "Status:",
        orderStatus,
      );

      console.log(
        "Items:",
        orderItems,
      );

      console.log(
        "=================================",
      );

      // ---------------------------------------------
      // ORDER DATA
      // ---------------------------------------------

      const orderData = {
        customer_id:
          orderForm.customer_id,

        subtotal:
          subtotalAmount,

        discount:
          discountAmount,

        total_amount:
          totalAmount,

        paid_amount:
          paidAmountValue,

        balance:
          balanceAmount,

        status:
          orderStatus,

        notes:
          orderForm.notes?.trim() ||
          null,

        items: orderItems.map(
          (item) => ({
            product_id:
              item.product_id,

            product_name:
              item.product_name,

            pricing_type:
              item.pricing_type,

            size: null,

            width:
              item.width !== null
                ? Number(item.width)
                : null,

            height:
              item.height !== null
                ? Number(item.height)
                : null,

            size_unit:
              item.unit || null,

            quantity:
              Number(item.quantity) ||
              0,

            unit_price:
              Number(item.price) ||
              0,

            total:
              Number(item.total) ||
              0,
          }),
        ),
      };

      console.log(
        "ORDER DATA SENT TO SERVICE:",
        orderData,
      );

      // ---------------------------------------------
      // CREATE
      // ---------------------------------------------

      const createdOrder =
        await createOrder(
          orderData,
        );

      console.log(
        "ORDER CREATED:",
        createdOrder,
      );

      // ---------------------------------------------
      // CLOSE
      // ---------------------------------------------

      setShowOrderModal(false);

      // ---------------------------------------------
      // RESET
      // ---------------------------------------------

      setOrderForm({
        customer_id: "",
        customer_mobile: "",
        notes: "",
        discount: 0,
        paid_amount: 0,
        status: "NEW",
      });

      setOrderItems([]);

      setNewItem({
        product_id: "",
        quantity: 1,
        width: "",
        height: "",
      });

      // ---------------------------------------------
      // RELOAD
      // ---------------------------------------------

      await loadData();
    } catch (err) {
      console.error(
        "CREATE ORDER ERROR:",
        err,
      );

      setError(
        err.message ||
          "Unable to create order.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CURRENCY
  // =====================================================

  const currency = (value) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
      },
    ).format(Number(value) || 0);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      await logoutUser();

      navigate(
        "/siridigitals/login",
      );
    } catch (err) {
      console.error(
        "LOGOUT ERROR:",
        err,
      );
    }
  };

  // =====================================================
  // DELETE ORDER
  // =====================================================

  const handleDeleteOrder = async (
    e,
    orderId,
  ) => {
    e.stopPropagation();

    if (
      !window.confirm(
        "Are you sure you want to delete this order? This cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setError("");

      await deleteOrder(orderId);

      setOrders((prevOrders) =>
        prevOrders.filter(
          (order) =>
            order.id !== orderId,
        ),
      );
    } catch (err) {
      console.error(
        "DELETE ORDER ERROR:",
        err,
      );

      setError(
        err.message ||
          "Unable to delete order.",
      );
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="siri-orders-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="siri-orders-sidebar">

        <div className="siri-orders-logo">
          <h2>Siri Digitals</h2>
          <span>Management</span>
        </div>

        <nav className="siri-orders-menu">

          <button
            onClick={() =>
              navigate(
                "/siridigitals/dashboard",
              )
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button className="active">
            <span>▣</span>
            Orders
          </button>

          <button
            onClick={() =>
              navigate(
                "/siridigitals/customers",
              )
            }
          >
            <span>♙</span>
            Customers
          </button>

          <button
            onClick={() =>
              navigate(
                "/siridigitals/products",
              )
            }
          >
            <span>▤</span>
            Products & Prices
          </button>

          <button
            onClick={() =>
              navigate(
                "/siridigitals/payments",
              )
            }
          >
            <span>₹</span>
            Payments
          </button>

        </nav>

        <div className="siri-orders-sidebar-bottom">

          <button
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="siri-orders-main">

        {/* HEADER */}

        <div className="orders-header">

          <div>
            <h1>Orders</h1>

            <p>
              Manage customer orders
              and billing
            </p>
          </div>

          <button
            className="add-order-button"
            onClick={openOrderModal}
          >
            + New Order
          </button>

        </div>

        {/* ERROR */}

        {error &&
          !showOrderModal && (
            <div className="orders-error">
              {error}
            </div>
          )}

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="orders-filters">

          {/* SEARCH */}

          <div className="orders-filter-group orders-search-filter">

            <label>
              Search
            </label>

            <div className="orders-search">

              <span>🔍</span>

              <input
                type="text"
                name="search"
                placeholder="Order No., customer name or mobile..."
                value={filters.search}
                onChange={
                  handleFilterChange
                }
              />

            </div>

          </div>

          {/* STATUS */}

          <div className="orders-filter-group">

            <label>
              Status
            </label>

            <select
              name="status"
              value={filters.status}
              onChange={
                handleFilterChange
              }
            >

              <option value="">
                All Statuses
              </option>

              {ORDER_STATUSES.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ),
              )}

            </select>

          </div>

          {/* FROM DATE */}

          <div className="orders-filter-group">

            <label>
              From Date
            </label>

            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={
                handleFilterChange
              }
            />

          </div>

          {/* TO DATE */}

          <div className="orders-filter-group">

            <label>
              To Date
            </label>

            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              min={
                filters.fromDate ||
                undefined
              }
              onChange={
                handleFilterChange
              }
            />

          </div>

          {/* CLEAR FILTERS */}

          <div className="orders-filter-actions">

            <button
              type="button"
              onClick={
                clearFilters
              }
              className="clear-filters-button"
            >
              Clear
            </button>

          </div>

          {/* ORDER COUNT */}

          <span className="orders-count">
            {filteredOrders.length}{" "}
            Orders
          </span>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="orders-card">

          {loading ? (

            <div className="orders-loading">
              Loading orders...
            </div>

          ) : filteredOrders.length ===
            0 ? (

            <div className="orders-empty">

              <div>▣</div>

              <h3>
                No orders found
              </h3>

              <p>
                {filters.search ||
                filters.status ||
                filters.fromDate ||
                filters.toDate
                  ? "Try changing or clearing your filters."
                  : "Create your first customer order."}
              </p>

              {!(
                filters.search ||
                filters.status ||
                filters.fromDate ||
                filters.toDate
              ) && (
                <button
                  onClick={
                    openOrderModal
                  }
                >
                  + New Order
                </button>
              )}

            </div>

          ) : (

            <div className="orders-table-wrapper">

              <table className="orders-table">

                <thead>

                  <tr>

                    <th>
                      Order No.
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Total
                    </th>

                    <th>
                      Paid
                    </th>

                    <th>
                      Balance
                    </th>

                    <th>
                      Payment
                    </th>

                    <th>
                      Order Status
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredOrders.map(
                    (order) => {

                      const orderTotal =
                        Number(
                          order.total ??
                            order.total_amount,
                        ) || 0;

                      const orderPaid =
                        Number(
                          order.paid ??
                            order.paid_amount,
                        ) || 0;

                      const orderBalance =
                        Number(
                          order.balance,
                        ) ||
                        Math.max(
                          orderTotal -
                            orderPaid,
                          0,
                        );

                      const paymentStatus =
                        getPaymentStatus(
                          orderTotal,
                          orderPaid,
                        );

                      const orderStatus =
                        getOrderStatus(
                          order,
                        );

                      return (

                        <tr
                          key={order.id}
                          onClick={() =>
                            navigate(
                              `/siridigitals/orders/${order.id}`,
                            )
                          }
                          style={{
                            cursor:
                              "pointer",
                          }}
                        >

                          {/* ORDER NUMBER */}

                          <td>
                            <strong>
                              {
                                order.order_number
                              }
                            </strong>
                          </td>

                          {/* CUSTOMER */}

                          <td>

                            <strong>
                              {
                                order
                                  .customers
                                  ?.name ||
                                "Customer"
                              }
                            </strong>

                            <small>
                              {
                                order
                                  .customers
                                  ?.mobile ||
                                "-"
                              }
                            </small>

                          </td>

                          {/* DATE */}

                          <td>

                            {order.created_at
                              ? new Date(
                                  order.created_at,
                                ).toLocaleDateString(
                                  "en-IN",
                                )
                              : "-"}

                          </td>

                          {/* TOTAL */}

                          <td>
                            {currency(
                              orderTotal,
                            )}
                          </td>

                          {/* PAID */}

                          <td>
                            {currency(
                              orderPaid,
                            )}
                          </td>

                          {/* BALANCE */}

                          <td>
                            {currency(
                              orderBalance,
                            )}
                          </td>

                          {/* PAYMENT STATUS */}

                          <td>

                            <span
                              className={`order-status payment-${paymentStatus.toLowerCase()}`}
                            >
                              {
                                paymentStatus
                              }
                            </span>

                          </td>

                          {/* ORDER STATUS */}

                          <td>

                            <select
                              className={`order-status-select status-${orderStatus.toLowerCase()}`}
                              value={
                                orderStatus
                              }
                              disabled={
                                updatingStatus ===
                                order.id
                              }
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                              onChange={(e) =>
                                handleStatusChange(
                                  order.id,
                                  e.target
                                    .value,
                                )
                              }
                            >

                              {ORDER_STATUSES.map(
                                (
                                  status,
                                ) => (

                                  <option
                                    key={
                                      status
                                    }
                                    value={
                                      status
                                    }
                                  >
                                    {
                                      status
                                    }
                                  </option>

                                ),
                              )}

                            </select>

                          </td>

                          {/* ACTIONS */}

                          <td>

                            <button
                              className="delete-order-btn"
                              onClick={(e) =>
                                handleDeleteOrder(
                                  e,
                                  order.id,
                                )
                              }
                              style={{
                                backgroundColor:
                                  "#ff4d4f",
                                color:
                                  "white",
                                border:
                                  "none",
                                padding:
                                  "4px 8px",
                                borderRadius:
                                  "4px",
                                cursor:
                                  "pointer",
                              }}
                            >
                              Delete
                            </button>

                          </td>

                        </tr>

                      );
                    },
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

      {/* =================================================
          NEW ORDER MODAL
      ================================================= */}

      {showOrderModal && (

        <div
          className="order-modal-overlay"
          onClick={closeOrderModal}
        >

          <div
            className="order-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="order-modal-header">

              <div>

                <h2>
                  New Order
                </h2>

                <p>
                  Create a new customer
                  order
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeOrderModal
                }
              >
                ×
              </button>

            </div>

            {/* ORDER FORM */}

            <form
              onSubmit={
                handleCreateOrder
              }
              className="order-form"
            >

              {/* =================================================
                  CUSTOMER
              ================================================= */}

              <div className="order-section">

                <div className="section-title">

                  <h3>
                    Customer
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      setShowCustomerForm(
                        !showCustomerForm,
                      )
                    }
                  >
                    + New Customer
                  </button>

                </div>

                {!showCustomerForm ? (

                  <div className="order-form-group">

                    <label>
                      Select Customer
                      <span>*</span>
                    </label>

                    <select
                      value={
                        orderForm.customer_id
                      }
                      onChange={
                        handleCustomerChange
                      }
                    >

                      <option value="">
                        Select customer
                      </option>

                      {customers.map(
                        (customer) => (

                          <option
                            key={
                              customer.id
                            }
                            value={
                              customer.id
                            }
                          >
                            {
                              customer.mobile
                            }

                            {customer.name
                              ? ` - ${customer.name}`
                              : ""}

                          </option>

                        ),
                      )}

                    </select>

                  </div>

                ) : (

                  <div className="new-customer-box">

                    <div className="order-form-group">

                      <label>
                        Mobile
                        <span>*</span>
                      </label>

                      <input
                        type="tel"
                        name="mobile"
                        maxLength="10"
                        value={
                          customerForm.mobile
                        }
                        onChange={
                          handleCustomerFormChange
                        }
                        placeholder="Mobile number"
                      />

                    </div>

                    <div className="order-form-group">

                      <label>
                        Name
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={
                          customerForm.name
                        }
                        onChange={
                          handleCustomerFormChange
                        }
                        placeholder="Customer name"
                      />

                    </div>

                    <div className="order-form-group">

                      <label>
                        Email
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={
                          customerForm.email
                        }
                        onChange={
                          handleCustomerFormChange
                        }
                        placeholder="Email"
                      />

                    </div>

                    <button
                      type="button"
                      className="save-new-customer"
                      onClick={
                        handleCreateCustomer
                      }
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : "Save Customer"}
                    </button>

                  </div>

                )}

              </div>

              {/* =================================================
                  PRODUCTS
              ================================================= */}

              <div className="order-section">

                <div className="section-title">

                  <h3>
                    Products
                  </h3>

                </div>

                <div className="add-item-grid">

                  <div className="order-form-group">

                    <label>
                      Product
                    </label>

                    <select
                      name="product_id"
                      value={
                        newItem.product_id
                      }
                      onChange={
                        handleProductChange
                      }
                    >

                      <option value="">
                        Select product
                      </option>

                      {products.map(
                        (product) => (

                          <option
                            key={
                              product.id
                            }
                            value={
                              product.id
                            }
                          >
                            {
                              product.name
                            }
                            {" - "}₹
                            {
                              product.price
                            }
                            {" / "}
                            {
                              product.unit ||
                              "Fixed"
                            }
                          </option>

                        ),
                      )}

                    </select>

                  </div>

                  <div className="order-form-group">

                    <label>
                      Quantity
                    </label>

                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      step="1"
                      value={
                        newItem.quantity
                      }
                      onChange={
                        handleNewItemChange
                      }
                    />

                  </div>

                  {selectedProduct?.allow_size && (
                    <>

                      <div className="order-form-group">

                        <label>
                          Width
                        </label>

                        <input
                          type="number"
                          name="width"
                          min="0"
                          step="0.01"
                          placeholder="Width"
                          value={
                            newItem.width
                          }
                          onChange={
                            handleNewItemChange
                          }
                        />

                      </div>

                      <div className="order-form-group">

                        <label>
                          Height
                        </label>

                        <input
                          type="number"
                          name="height"
                          min="0"
                          step="0.01"
                          placeholder="Height"
                          value={
                            newItem.height
                          }
                          onChange={
                            handleNewItemChange
                          }
                        />

                      </div>

                    </>
                  )}

                  <button
                    type="button"
                    className="add-item-button"
                    onClick={addItem}
                  >
                    + Add
                  </button>

                </div>

                {/* ITEMS */}

                {orderItems.length > 0 && (

                  <div className="order-items">

                    {orderItems.map(
                      (item) => (

                        <div
                          className="order-item"
                          key={item.id}
                        >

                          <div>

                            <strong>
                              {
                                item.product_name
                              }
                            </strong>

                            <small>

                              {item.width &&
                              item.height
                                ? `${item.width} × ${item.height}`
                                : ""}

                              {" × "}

                              {
                                item.quantity
                              }

                            </small>

                          </div>

                          <strong>
                            {currency(
                              item.total,
                            )}
                          </strong>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.id,
                              )
                            }
                          >
                            ×
                          </button>

                        </div>

                      ),
                    )}

                  </div>

                )}

              </div>

              {/* =================================================
                  BILL
              ================================================= */}

              <div className="order-bill">

                <div>

                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {currency(
                      subtotal,
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Discount
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      orderForm.discount
                    }
                    onChange={(e) =>
                      setOrderForm(
                        (prev) => ({
                          ...prev,
                          discount:
                            e.target
                              .value ===
                            ""
                              ? 0
                              : Number(
                                  e.target
                                    .value,
                                ),
                        }),
                      )
                    }
                  />

                </div>

                <div className="grand-total">

                  <span>
                    Grand Total
                  </span>

                  <strong>
                    {currency(
                      grandTotal,
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Paid Amount
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      orderForm.paid_amount
                    }
                    onChange={(e) =>
                      setOrderForm(
                        (prev) => ({
                          ...prev,
                          paid_amount:
                            e.target
                              .value ===
                            ""
                              ? 0
                              : Number(
                                  e.target
                                    .value,
                                ),
                        }),
                      )
                    }
                  />

                </div>

                <div className="balance-row">

                  <span>
                    Balance
                  </span>

                  <strong>
                    {currency(
                      balance,
                    )}
                  </strong>

                </div>

              </div>

              {/* =================================================
                  ORDER STATUS
              ================================================= */}

              <div className="order-form-group">

                <label>
                  Order Status
                </label>

                <select
                  value={
                    orderForm.status
                  }
                  onChange={(e) =>
                    setOrderForm(
                      (prev) => ({
                        ...prev,
                        status:
                          e.target.value,
                      }),
                    )
                  }
                >

                  {ORDER_STATUSES.map(
                    (status) => (

                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>

                    ),
                  )}

                </select>

              </div>

              {/* =================================================
                  NOTES
              ================================================= */}

              <div className="order-form-group">

                <label>
                  Notes
                </label>

                <textarea
                  rows="3"
                  placeholder="Optional order notes..."
                  value={
                    orderForm.notes
                  }
                  onChange={(e) =>
                    setOrderForm(
                      (prev) => ({
                        ...prev,
                        notes:
                          e.target.value,
                      }),
                    )
                  }
                />

              </div>

              {/* ERROR */}

              {error && (
                <div className="order-form-error">
                  {error}
                </div>
              )}

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="order-form-actions">

                <button
                  type="button"
                  className="cancel-order-button"
                  onClick={
                    closeOrderModal
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-order-button"
                  disabled={saving}
                >
                  {saving
                    ? "Creating..."
                    : "Create Order"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Orders;