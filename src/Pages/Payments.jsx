import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getPaymentSummary } from "../Services/paymentService";
import { logoutUser } from "../Services/authService";

import "./Payments.css";

function Payments() {
  const navigate = useNavigate();

  /* =========================================
     STATE
  ========================================= */

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  /* =========================================
     LOAD PAYMENTS
  ========================================= */

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPaymentSummary();

      setOrders(data || []);
    } catch (err) {
      console.error("Payments loading error:", err);
      setError(err.message || "Unable to load payments.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     LOGOUT HANDLER
  ========================================= */

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/siridigitals/login");
    } catch (err) {
      console.error("LOGOUT ERROR:", err);
    }
  };

  /* =========================================
     CURRENCY
  ========================================= */

  const currency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  /* =========================================
     DATE
  ========================================= */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================
     DYNAMIC STATUS LIST FROM FETCHED DATA
  ========================================= */

  const availableStatuses = Array.from(
    new Set(orders.map((order) => order.status).filter(Boolean))
  );

  /* =========================================
     FILTER
  ========================================= */

  const filteredOrders = orders.filter((order) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      (order.order_number || "").toLowerCase().includes(searchText) ||
      (order.customers?.mobile || "").toLowerCase().includes(searchText) ||
      (order.customers?.name || "").toLowerCase().includes(searchText);

    const matchesStatus = status === "ALL" || order.status === status;

    return matchesSearch && matchesStatus;
  });

  /* =========================================
     TOTALS
  ========================================= */

  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0,
  );

  const totalPaid = orders.reduce(
    (sum, order) => sum + Number(order.paid_amount || 0),
    0,
  );

  const totalBalance = orders.reduce(
    (sum, order) => sum + Number(order.balance_amount || 0),
    0,
  );

  /* =========================================
     OPEN ORDER
  ========================================= */

  const openOrder = (id) => {
    navigate(`/siridigitals/orders/${id}`);
  };

  /* =========================================
     REFRESH
  ========================================= */

  const refreshPayments = () => {
    loadPayments();
  };

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="siri-payments-page-layout">
      {/* SIDEBAR */}
      <aside className="siri-payments-sidebar">
        <div className="siri-payments-logo">
          <h2>Siri Digitals</h2>
          <span>Management</span>
        </div>

        <nav className="siri-payments-menu">
          <button onClick={() => navigate("/siridigitals/dashboard")}>
            <span>⌂</span>
            Dashboard
          </button>

          <button onClick={() => navigate("/siridigitals/orders")}>
            <span>▣</span>
            Orders
          </button>

          <button onClick={() => navigate("/siridigitals/customers")}>
            <span>♙</span>
            Customers
          </button>

          <button onClick={() => navigate("/siridigitals/products")}>
            <span>▤</span>
            Products & Prices
          </button>

          <button className="active">
            <span>₹</span>
            Payments
          </button>
        </nav>

        <div className="siri-payments-sidebar-bottom">
          <button onClick={handleLogout}>
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="siri-payments-main">
        {/* HEADER */}
        <div className="siri-payments-header">
          <div>
            <h1>Payments</h1>
            <p>Track customer payments and outstanding balances.</p>
          </div>

          <button className="siri-payment-refresh-btn" onClick={refreshPayments}>
            ↻ Refresh
          </button>
        </div>

        {/* SUMMARY */}
        <div className="siri-payment-summary-grid">
          <div className="siri-payment-summary-card">
            <span>Total Sales</span>
            <strong>{currency(totalSales)}</strong>
          </div>

          <div className="siri-payment-summary-card">
            <span>Total Received</span>
            <strong className="received">{currency(totalPaid)}</strong>
          </div>

          <div className="siri-payment-summary-card">
            <span>Outstanding</span>
            <strong className="outstanding">{currency(totalBalance)}</strong>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="siri-payments-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* TOOLBAR */}
        <div className="siri-payments-toolbar">
          <div className="siri-payment-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search order or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            {availableStatuses.map((stat) => (
              <option key={stat} value={stat}>
                {stat.charAt(0) + stat.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <div className="siri-payments-card">
          {loading ? (
            <div className="siri-payments-loading">Loading payments...</div>
          ) : error ? (
            <div className="siri-payments-empty">
              <div>⚠️</div>
              <h3>Unable to load payments</h3>
              <p>Please check your database configuration.</p>
              <button
                className="siri-payment-retry-btn"
                onClick={refreshPayments}
              >
                Try Again
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="siri-payments-empty">
              <div>₹</div>
              <h3>No payments found</h3>
              <p>
                Payment information will appear here after orders are created.
              </p>
            </div>
          ) : (
            <div className="siri-payments-table-wrapper">
              <table className="siri-payments-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <button
                          className="siri-payment-order-link"
                          onClick={() => openOrder(order.id)}
                        >
                          {order.order_number}
                        </button>
                      </td>

                      <td>
                        <strong>
                          {order.customers?.name || "Customer"}
                        </strong>
                        <small>{order.customers?.mobile || "-"}</small>
                      </td>

                      <td>{formatDate(order.created_at)}</td>

                      <td>{currency(order.total_amount)}</td>

                      <td className="siri-paid-cell">
                        {currency(order.paid_amount)}
                      </td>

                      <td className="siri-balance-cell">
                        {currency(order.balance_amount)}
                      </td>

                      <td>
                        <span
                          className={`siri-payment-status ${(
                            order.payment_status || ""
                          ).toLowerCase()}`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Payments;