import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getOrderById, addOrderPayment } from "../Services/orderService";

import "./OrderDetails.css";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [paymentAmount, setPaymentAmount] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const [referenceNumber, setReferenceNumber] = useState("");

  const [paymentNotes, setPaymentNotes] = useState("");

  const [savingPayment, setSavingPayment] = useState(false);

  const [showPaymentForm, setShowPaymentForm] = useState(false);

  /* =========================================
     LOAD ORDER
  ========================================= */

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getOrderById(id);

      if (!data) {
        throw new Error("Order not found.");
      }

      setOrder(data);
    } catch (err) {
      console.error("LOAD ORDER ERROR:", err);

      setError(err.message || "Unable to load order.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     CURRENCY
  ========================================= */

  const currency = (value) => {
    const amount = Number(value) || 0;

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  /* =========================================
     DATE
  ========================================= */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /* =========================================
     PAYMENT VALUES
  ========================================= */

  const totalAmount = Number(order?.total) || 0;

  const paidAmount = Number(order?.paid) || 0;

  const remainingBalance = Math.max(totalAmount - paidAmount, 0);

  const paymentStatus =
    paidAmount <= 0 ? "UNPAID" : paidAmount >= totalAmount ? "PAID" : "PARTIAL";

  /* =========================================
     ADD PAYMENT
  ========================================= */

  const handleAddPayment = async (e) => {
    e.preventDefault();

    setError("");

    const amount = Number(paymentAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter a valid payment amount.");

      return;
    }

    if (amount > remainingBalance) {
      setError(
        `Payment cannot be greater than remaining balance ${currency(
          remainingBalance,
        )}.`,
      );

      return;
    }

    try {
      setSavingPayment(true);

      const result = await addOrderPayment({
        orderId: id,

        amount,

        paymentMethod,

        referenceNumber: referenceNumber.trim() || null,

        notes: paymentNotes.trim() || null,
      });

      console.log("PAYMENT CREATED:", result);

      // Reset payment form

      setPaymentAmount("");

      setPaymentMethod("CASH");

      setReferenceNumber("");

      setPaymentNotes("");

      setShowPaymentForm(false);

      // Reload latest order

      await loadOrder();
    } catch (err) {
      console.error("ADD PAYMENT ERROR:", err);

      setError(err.message || "Unable to add payment.");
    } finally {
      setSavingPayment(false);
    }
  };

  /* =========================================
     PAY FULL BALANCE
  ========================================= */

  const payFullBalance = () => {
    setPaymentAmount(remainingBalance.toFixed(2));
  };

  /* =========================================
     PRINT INVOICE
  ========================================= */

  const generateInvoice = () => {
    window.print();
  };

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return <div className="order-details-loading">Loading order...</div>;
  }

  /* =========================================
     ERROR
  ========================================= */

  if (error && !order) {
    return (
      <div className="order-details-error">
        <h2>Order Not Found</h2>

        <p>{error}</p>

        <button onClick={() => navigate("/siridigitals/orders")}>
          ← Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const customer = order.customers || {};

  const subtotal = Number(order.subtotal) || 0;

  const discount = Number(order.discount) || 0;

  return (
    <div className="order-details-page">
      {/* =====================================
          HEADER
      ===================================== */}

      <div className="order-details-header no-print">
        <div>
          <button
            className="order-back-button"
            onClick={() => navigate("/siridigitals/orders")}
          >
            ← Orders
          </button>

          <div className="order-title-row">
            <div>
              <h1>{order.order_number || "Order"}</h1>

              <p>Created on {formatDate(order.created_at)}</p>
            </div>

            <span className={`details-status ${paymentStatus.toLowerCase()}`}>
              {paymentStatus}
            </span>
          </div>
        </div>

        <div className="details-header-actions">
          <button className="primary-action" onClick={generateInvoice}>
            🖨 Generate Invoice
          </button>
        </div>
      </div>

      {/* =====================================
          INVOICE HEADER
      ===================================== */}

      <div className="invoice-print-header">
        <div>
          <h1>Siri Digitals</h1>

          <p>Digital Printing & Design</p>
        </div>

        <div className="invoice-title">
          <h2>INVOICE</h2>

          <p>
            Invoice No: <strong>{order.order_number}</strong>
          </p>

          <p>Date: {formatDate(order.created_at)}</p>
        </div>
      </div>

      {/* =====================================
          CUSTOMER
      ===================================== */}

      <section className="details-card">
        <div className="details-card-header">
          <div>
            <h2>Customer Details</h2>

            <p>Customer information</p>
          </div>
        </div>

        <div className="customer-details-grid">
          <div>
            <span>Mobile</span>

            <strong>{customer.mobile || "-"}</strong>
          </div>

          <div>
            <span>Name</span>

            <strong>{customer.name || "-"}</strong>
          </div>

          <div>
            <span>Email</span>

            <strong>{customer.email || "-"}</strong>
          </div>
        </div>
      </section>

      {/* =====================================
          ORDER ITEMS
      ===================================== */}

      <section className="details-card">
        <div className="details-card-header">
          <div>
            <h2>Order Items</h2>

            <p>Products included in this order</p>
          </div>

          <span>{order.order_items?.length || 0} Items</span>
        </div>

        <div className="details-table-wrapper">
          <table className="details-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Pricing</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {order.order_items?.length > 0 ? (
                order.order_items.map((item) => {
                  const productName =
                    item.product_name || item.products?.name || "Product";

                  const pricingType =
                    item.pricing_type || item.products?.pricing_type || "-";

                  const rate = Number(item.rate) || 0;

                  const amount = Number(item.amount) || 0;

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{productName}</strong>
                      </td>

                      <td>{pricingType}</td>

                      <td>
                        {item.width !== null &&
                        item.width !== undefined &&
                        item.height !== null &&
                        item.height !== undefined ? (
                          <>
                            {item.width}
                            {" × "}
                            {item.height}

                            {item.size_unit ? ` ${item.size_unit}` : ""}
                          </>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>{item.quantity}</td>

                      <td>{currency(rate)}</td>

                      <td>
                        <strong>{currency(amount)}</strong>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6">No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================
          BILL + PAYMENT
      ===================================== */}

      <div className="details-bottom-grid">
        {/* BILL */}

        <section className="details-card">
          <div className="details-card-header">
            <h2>Bill Summary</h2>
          </div>

          <div className="bill-summary">
            <div>
              <span>Subtotal</span>

              <strong>{currency(subtotal)}</strong>
            </div>

            <div>
              <span>Discount</span>

              <strong>- {currency(discount)}</strong>
            </div>

            <div className="bill-total">
              <span>Total</span>

              <strong>{currency(totalAmount)}</strong>
            </div>
          </div>
        </section>

        {/* PAYMENT */}

        <section className="details-card">
          <div className="details-card-header">
            <div>
              <h2>Payment</h2>

              <p>Payment summary</p>
            </div>
          </div>

          <div className="bill-summary">
            <div>
              <span>Total</span>

              <strong>{currency(totalAmount)}</strong>
            </div>

            <div>
              <span>Paid</span>

              <strong className="paid-amount">{currency(paidAmount)}</strong>
            </div>

            <div className="balance-amount">
              <span>Remaining Balance</span>

              <strong>{currency(remainingBalance)}</strong>
            </div>
          </div>

          {/* PAYMENT BUTTON */}

          {remainingBalance > 0 && (
            <div className="payment-action-box no-print">
              {!showPaymentForm ? (
                <button
                  className="primary-action"
                  onClick={() => setShowPaymentForm(true)}
                >
                  + Add Payment
                </button>
              ) : (
                <form onSubmit={handleAddPayment} className="payment-form">
                  <div className="payment-form-title">
                    <strong>Add Payment</strong>

                    <span>Balance: {currency(remainingBalance)}</span>
                  </div>

                  <div className="order-form-group">
                    <label>Payment Amount</label>

                    <input
                      type="number"
                      min="0"
                      max={remainingBalance}
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>

                  <button
                    type="button"
                    className="secondary-action"
                    onClick={payFullBalance}
                  >
                    Pay Full Balance
                  </button>

                  <div className="order-form-group">
                    <label>Payment Method</label>

                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="CASH">Cash</option>

                      <option value="UPI">UPI</option>

                      <option value="CARD">Card</option>

                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>

                  <div className="order-form-group">
                    <label>Reference Number</label>

                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="order-form-group">
                    <label>Notes</label>

                    <textarea
                      rows="2"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>

                  {error && <div className="order-form-error">{error}</div>}

                  <div className="payment-form-actions">
                    <button
                      type="button"
                      className="secondary-action"
                      onClick={() => {
                        setShowPaymentForm(false);
                        setError("");
                      }}
                      disabled={savingPayment}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="primary-action"
                      disabled={savingPayment}
                    >
                      {savingPayment ? "Saving..." : "Save Payment"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {remainingBalance <= 0 && (
            <div className="payment-paid-message no-print">✓ Fully Paid</div>
          )}
        </section>
      </div>

      {/* =====================================
          PAYMENT HISTORY
      ===================================== */}

      <section className="details-card no-print">
        <div className="details-card-header">
          <div>
            <h2>Payment History</h2>

            <p>All payments received for this order</p>
          </div>

          <span>{order.payments?.length || 0} Payments</span>
        </div>

        {order.payments?.length > 0 ? (
          <div className="details-table-wrapper">
            <table className="details-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Notes</th>
                </tr>
              </thead>

              <tbody>
                {order.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.created_at)}</td>

                    <td>
                      <strong>{currency(payment.amount)}</strong>
                    </td>

                    <td>{payment.payment_method}</td>

                    <td>{payment.reference_number || "-"}</td>

                    <td>{payment.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="payment-empty">No payments recorded.</div>
        )}
      </section>

      {/* =====================================
          NOTES
      ===================================== */}

      {order.notes && (
        <section className="details-card">
          <div className="details-card-header">
            <h2>Notes</h2>
          </div>

          <div className="order-notes">{order.notes}</div>
        </section>
      )}

      {/* =====================================
          INVOICE FOOTER
      ===================================== */}

      <div className="invoice-footer">
        <div>
          <strong>Thank you for your business!</strong>

          <p>This is a computer-generated invoice.</p>
        </div>

        <div>
          <strong>Amount Due</strong>

          <span>{currency(remainingBalance)}</span>
        </div>
      </div>

      {/* =====================================
          ACTIONS
      ===================================== */}

      <div className="details-actions no-print">
        <button
          className="secondary-action"
          onClick={() => navigate("/siridigitals/orders")}
        >
          ← Back to Orders
        </button>

        <button className="primary-action" onClick={generateInvoice}>
          🖨 Generate Invoice
        </button>
      </div>
    </div>
  );
}

export default OrderDetails;
