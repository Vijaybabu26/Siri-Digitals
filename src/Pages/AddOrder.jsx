import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCustomers, createCustomer } from "../Services/customerService";
import { getAllProducts } from "../Services/productService";
import { createOrder } from "../Services/orderService";

import "./AddOrder.css";

function AddOrder() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const [customerForm, setCustomerForm] = useState({
    mobile: "",
    name: "",
    email: "",
  });

  const [order, setOrder] = useState({
    customer_id: "",
    discount: 0,
    paid_amount: 0,
    notes: "",
  });

  const [item, setItem] = useState({
    product_id: "",
    quantity: 1,
    width: "",
    height: "",
  });

  const [items, setItems] = useState([]);

  // =====================================================
  // LOAD CUSTOMERS + PRODUCTS
  // =====================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [customersData, productsData] = await Promise.all([
        getCustomers(),
        getAllProducts(),
      ]);

      setCustomers(customersData || []);

      setProducts(
        (productsData || []).filter(
          (product) => product.is_active !== false
        )
      );
    } catch (err) {
      console.error("LOAD DATA ERROR:", err);
      setError(err.message || "Unable to load data.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CUSTOMER
  // =====================================================

  const handleCustomerChange = (e) => {
    setOrder((prev) => ({
      ...prev,
      customer_id: e.target.value,
    }));
  };

  const handleCustomerInput = (e) => {
    const { name, value } = e.target;

    setCustomerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCustomer = async () => {
    setError("");

    const mobile = customerForm.mobile.trim();

    if (!mobile) {
      setError("Mobile number is required.");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setSaving(true);

      const customer = await createCustomer({
        mobile,
        name: customerForm.name.trim() || null,
        email: customerForm.email.trim() || null,
      });

      setCustomers((prev) => [...prev, customer]);

      setOrder((prev) => ({
        ...prev,
        customer_id: customer.id,
      }));

      setCustomerForm({
        mobile: "",
        name: "",
        email: "",
      });

      setShowNewCustomer(false);
    } catch (err) {
      console.error("CREATE CUSTOMER ERROR:", err);

      if (err.code === "23505") {
        setError(
          "Customer with this mobile number already exists."
        );
      } else {
        setError(
          err.message || "Unable to add customer."
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
    (product) => product.id === item.product_id
  );

  const handleItemChange = (e) => {
    const { name, value } = e.target;

    setItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // PRICE CALCULATION
  // =====================================================

  const calculatePrice = (product, currentItem) => {
    if (!product) {
      return 0;
    }

    const price = Number(product.price) || 0;
    const quantity = Number(currentItem.quantity) || 0;

    switch (product.pricing_type) {
      case "FIXED":
        return price * quantity;

      case "PER_PIECE":
        return price * quantity;

      case "PER_SQ_FT": {
        const width = Number(currentItem.width) || 0;
        const height = Number(currentItem.height) || 0;

        return width * height * price * quantity;
      }

      case "PER_SQ_METER": {
        const width = Number(currentItem.width) || 0;
        const height = Number(currentItem.height) || 0;

        return width * height * price * quantity;
      }

      case "PER_100":
        return (quantity / 100) * price;

      case "PER_1000":
        return (quantity / 1000) * price;

      default:
        return price * quantity;
    }
  };

  // =====================================================
  // ADD PRODUCT TO ORDER
  // =====================================================

  const addItem = () => {
    setError("");

    if (!item.product_id) {
      setError("Please select a product.");
      return;
    }

    const quantity = Number(item.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (
      selectedProduct?.allow_size &&
      (!item.width || !item.height)
    ) {
      setError("Please enter width and height.");
      return;
    }

    const width = selectedProduct?.allow_size
      ? Number(item.width)
      : null;

    const height = selectedProduct?.allow_size
      ? Number(item.height)
      : null;

    if (
      selectedProduct?.allow_size &&
      (width <= 0 || height <= 0)
    ) {
      setError("Width and height must be greater than zero.");
      return;
    }

    const total = calculatePrice(
      selectedProduct,
      item
    );

    if (!Number.isFinite(total) || total < 0) {
      setError("Unable to calculate product price.");
      return;
    }

    const orderItem = {
      id: Date.now(),

      product_id: selectedProduct.id,

      product_name: selectedProduct.name,

      pricing_type: selectedProduct.pricing_type,

      price: Number(selectedProduct.price) || 0,

      quantity,

      width,

      height,

      unit: selectedProduct.unit || null,

      total,
    };

    setItems((prev) => [
      ...prev,
      orderItem,
    ]);

    setItem({
      product_id: "",
      quantity: 1,
      width: "",
      height: "",
    });
  };

  const removeItem = (id) => {
    setItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  // =====================================================
  // TOTALS
  // =====================================================

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0
  );

  const discount = Math.max(
    0,
    Number(order.discount) || 0
  );

  const total = Math.max(
    0,
    subtotal - discount
  );

  const paidAmount = Math.max(
    0,
    Number(order.paid_amount) || 0
  );

  const balance = Math.max(
    0,
    total - paidAmount
  );

  // =====================================================
  // CREATE ORDER
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Customer validation
    if (!order.customer_id) {
      setError("Please select a customer.");
      return;
    }

    // Product validation
    if (items.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    // Discount validation
    if (discount > subtotal) {
      setError(
        "Discount cannot be greater than subtotal."
      );
      return;
    }

    // Payment validation
    if (paidAmount > total) {
      setError(
        "Paid amount cannot be greater than total."
      );
      return;
    }

    try {
      setSaving(true);

      console.log("CREATING ORDER:", {
        customer_id: order.customer_id,
        subtotal,
        discount,
        total_amount: total,
        paid_amount: paidAmount,
        balance_amount: balance,
        items,
      });

      await createOrder({
        customer_id: order.customer_id,

        subtotal,

        discount,

        total_amount: total,

        paid_amount: paidAmount,

        notes: order.notes.trim() || null,

        items: items.map((item) => ({
          product_id: item.product_id,

          product_name: item.product_name,

          pricing_type: item.pricing_type,

          quantity: item.quantity,

          width: item.width,

          height: item.height,

          unit: item.unit,

          unit_price: item.price,

          total: item.total,
        })),
      });

      // Success
      navigate("/siridigitals/orders");
    } catch (err) {
      console.error(
        "CREATE ORDER ERROR:",
        err
      );

      setError(
        err.message ||
        "Unable to create order."
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
      }
    ).format(Number(value) || 0);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="add-order-loading">
        Loading...
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="add-order-page">

      {/* HEADER */}

      <div className="add-order-header">
        <div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/siridigitals/orders")
            }
          >
            ← Orders
          </button>

          <h1>Create New Order</h1>

          <p>
            Add customer and products to create an order.
          </p>

        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="add-order-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* =================================================
            CUSTOMER
        ================================================= */}

        <section className="add-order-card">

          <div className="card-header">

            <div>
              <h2>Customer</h2>

              <p>
                Select existing customer or add a new one.
              </p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setShowNewCustomer(
                  !showNewCustomer
                )
              }
            >
              + New Customer
            </button>

          </div>

          {!showNewCustomer ? (

            <div className="form-group">

              <label>
                Customer
                <span>*</span>
              </label>

              <select
                value={order.customer_id}
                onChange={handleCustomerChange}
              >
                <option value="">
                  Select customer
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.mobile}
                    {customer.name
                      ? ` - ${customer.name}`
                      : ""}
                  </option>
                ))}
              </select>

            </div>

          ) : (

            <div className="new-customer">

              <div className="form-group">

                <label>
                  Mobile
                  <span>*</span>
                </label>

                <input
                  type="tel"
                  name="mobile"
                  maxLength="10"
                  value={customerForm.mobile}
                  onChange={handleCustomerInput}
                  placeholder="Enter mobile number"
                />

              </div>

              <div className="form-group">

                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  value={customerForm.name}
                  onChange={handleCustomerInput}
                  placeholder="Customer name"
                />

              </div>

              <div className="form-group">

                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={customerForm.email}
                  onChange={handleCustomerInput}
                  placeholder="Email"
                />

              </div>

              <button
                type="button"
                className="primary-button"
                onClick={handleAddCustomer}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Customer"}
              </button>

            </div>
          )}

        </section>

        {/* =================================================
            PRODUCTS
        ================================================= */}

        <section className="add-order-card">

          <div className="card-header">

            <div>
              <h2>Products</h2>

              <p>
                Select a product and add it to the order.
              </p>
            </div>

          </div>

          <div className="product-entry">

            <div className="form-group product-select">

              <label>
                Product
              </label>

              <select
                name="product_id"
                value={item.product_id}
                onChange={handleItemChange}
              >
                <option value="">
                  Select product
                </option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name}
                    {" - "}
                    {currency(product.price)}
                    {" / "}
                    {product.pricing_type}
                  </option>
                ))}
              </select>

            </div>

            <div className="form-group">

              <label>
                Quantity
              </label>

              <input
                type="number"
                name="quantity"
                min="1"
                step="1"
                value={item.quantity}
                onChange={handleItemChange}
              />

            </div>

            {selectedProduct?.allow_size && (
              <>
                <div className="form-group">

                  <label>
                    Width
                  </label>

                  <input
                    type="number"
                    name="width"
                    min="0"
                    step="0.01"
                    value={item.width}
                    onChange={handleItemChange}
                    placeholder="Width"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Height
                  </label>

                  <input
                    type="number"
                    name="height"
                    min="0"
                    step="0.01"
                    value={item.height}
                    onChange={handleItemChange}
                    placeholder="Height"
                  />

                </div>
              </>
            )}

            <button
              type="button"
              className="primary-button add-product-button"
              onClick={addItem}
            >
              + Add
            </button>

          </div>

          {/* ADDED ITEMS */}

          {items.length > 0 && (

            <div className="added-items">

              {items.map((orderItem) => (

                <div
                  className="added-item"
                  key={orderItem.id}
                >

                  <div className="item-info">

                    <strong>
                      {orderItem.product_name}
                    </strong>

                    <span>

                      {orderItem.width &&
                      orderItem.height
                        ? `${orderItem.width} × ${orderItem.height}`
                        : ""}

                      {" × "}

                      {orderItem.quantity}

                    </span>

                  </div>

                  <strong>
                    {currency(orderItem.total)}
                  </strong>

                  <button
                    type="button"
                    className="remove-item"
                    onClick={() =>
                      removeItem(orderItem.id)
                    }
                  >
                    ×
                  </button>

                </div>

              ))}

            </div>
          )}

        </section>

        {/* =================================================
            BILL
        ================================================= */}

        <section className="add-order-card">

          <div className="card-header">

            <div>
              <h2>Order Summary</h2>
            </div>

          </div>

          <div className="summary">

            <div>
              <span>Subtotal</span>

              <strong>
                {currency(subtotal)}
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
                value={order.discount}
                onChange={(e) =>
                  setOrder((prev) => ({
                    ...prev,
                    discount: e.target.value,
                  }))
                }
              />

            </div>

            <div className="total-row">

              <span>
                Total
              </span>

              <strong>
                {currency(total)}
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
                value={order.paid_amount}
                onChange={(e) =>
                  setOrder((prev) => ({
                    ...prev,
                    paid_amount: e.target.value,
                  }))
                }
              />

            </div>

            <div className="balance-row">

              <span>
                Balance
              </span>

              <strong>
                {currency(balance)}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            NOTES
        ================================================= */}

        <section className="add-order-card">

          <div className="form-group">

            <label>
              Notes
            </label>

            <textarea
              rows="4"
              value={order.notes}
              onChange={(e) =>
                setOrder((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              placeholder="Enter any notes for this order..."
            />

          </div>

        </section>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="order-actions">

          <button
            type="button"
            className="cancel-button"
            onClick={() =>
              navigate("/siridigitals/orders")
            }
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving
              ? "Creating Order..."
              : "Create Order"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default AddOrder;
