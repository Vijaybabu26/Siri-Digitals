import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getDashboardData } from "../Services/dashboardService";
import { updateOrderStatus } from "../Services/orderService";
import { logoutUser } from "../Services/authService";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({
    orders: [],
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    pendingPayments: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDashboardData();

      setDashboard(data);
    } catch (err) {
      console.error(err);

      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();

      navigate("/siridigitals/login");
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "NEW":
        return "status-new";

      case "PRINTING":
        return "status-printing";

      case "READY":
        return "status-ready";

      case "DELIVERED":
        return "status-delivered";

      case "COMPLETED":
        return "status-completed";

      case "CANCELLED":
        return "status-cancelled";

      default:
        return "";
    }
  };

  const handleStatusChange = async (e, orderId) => {
    e.stopPropagation(); // Prevents the row click from navigating to order details
    const newStatus = e.target.value;

    try {
      // Optimistically update the UI so it feels instant
      setDashboard((prev) => ({
        ...prev,
        orders: prev.orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ),
      }));

      // Update in Supabase
      await updateOrderStatus(orderId, newStatus);

      // Refresh the dashboard data to update your stat cards (Pending Orders, etc.)
      loadDashboard();
    } catch (err) {
      console.error("Status update error:", err);
      setError("Failed to update order status.");
      loadDashboard(); // Revert changes if the API call fails
    }
  };

  if (loading) {
    return <div className="siri-dashboard-loading">Loading Dashboard...</div>;
  }

  return (
    <div className="siri-dashboard">
      {/* ==================================
                SIDEBAR
            ================================== */}

      <aside className="siri-sidebar">
        <div className="siri-sidebar-logo">
          <h2>Siri Digitals</h2>

          <span>Management</span>
        </div>

        <nav className="siri-sidebar-menu">
          <button
            className="sidebar-menu-item active"
            onClick={() => navigate("/siridigitals/dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="sidebar-menu-item"
            onClick={() => navigate("/siridigitals/orders")}
          >
            <span>▣</span>
            Orders
          </button>

          <button
            className="sidebar-menu-item"
            onClick={() => navigate("/siridigitals/customers")}
          >
            <span>♙</span>
            Customers
          </button>

          <button
            className="sidebar-menu-item"
            onClick={() => navigate("/siridigitals/products")}
          >
            <span>▤</span>
            Products & Prices
          </button>

          <button
            className="sidebar-menu-item"
            onClick={() => navigate("/siridigitals/payments")}
          >
            <span>₹</span>
            Payments
          </button>
        </nav>

        <div className="siri-sidebar-bottom">
          <button className="sidebar-menu-item" onClick={handleLogout}>
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ==================================
                MAIN CONTENT
            ================================== */}

      <main className="siri-dashboard-main">
        {/* Header */}

        <header className="siri-dashboard-header">
          <div>
            <h1>Dashboard</h1>

            <p>Welcome back to Siri Digitals</p>
          </div>

          <button
            className="siri-new-order-button"
            onClick={() => navigate("/siridigitals/orders/new")}
          >
            + New Order
          </button>
        </header>

        {/* Error */}

        {error && <div className="dashboard-error">{error}</div>}

        {/* ==================================
                    STAT CARDS
                ================================== */}

        <section className="siri-stat-grid">
          <div className="siri-stat-card">
            <div className="stat-icon">▣</div>

            <div>
              <p>Today's Orders</p>

              <h2>{dashboard.totalOrders}</h2>
            </div>
          </div>

          <div className="siri-stat-card">
            <div className="stat-icon">₹</div>

            <div>
              <p>Today's Sales</p>

              <h2>{formatCurrency(dashboard.totalSales)}</h2>
            </div>
          </div>

          <div className="siri-stat-card">
            <div className="stat-icon">◷</div>

            <div>
              <p>Pending Orders</p>

              <h2>{dashboard.pendingOrders}</h2>
            </div>
          </div>

          <div className="siri-stat-card">
            <div className="stat-icon">₹</div>

            <div>
              <p>Pending Payments</p>

              <h2>{formatCurrency(dashboard.pendingPayments)}</h2>
            </div>
          </div>
        </section>

        {/* ==================================
                    QUICK ACTIONS
                ================================== */}

        <section className="siri-quick-section">
          <h2>Quick Actions</h2>

          <div className="siri-quick-grid">
            <button onClick={() => navigate("/siridigitals/orders/new")}>
              <span>+</span>

              <div>
                <strong>New Order</strong>

                <small>Create a new customer order</small>
              </div>
            </button>

            <button onClick={() => navigate("/siridigitals/customers")}>
              <span>+</span>

              <div>
                <strong>Add Customer</strong>

                <small>Add customer details</small>
              </div>
            </button>

            <button onClick={() => navigate("/siridigitals/products")}>
              <span>+</span>

              <div>
                <strong>Add Product</strong>

                <small>Manage products and prices</small>
              </div>
            </button>
          </div>
        </section>

        {/* ==================================
                    RECENT ORDERS
                ================================== */}

        <section className="siri-recent-orders">
          <div className="section-header">
            <div>
              <h2>Today's Orders</h2>

              <p>Recent orders placed today</p>
            </div>

            <button onClick={() => navigate("/siridigitals/orders")}>
              View All
            </button>
          </div>

          {dashboard.orders.length === 0 ? (
            <div className="empty-orders">
              <div>No orders today</div>

              <p>Create your first order to see it here.</p>

              <button onClick={() => navigate("/siridigitals/orders/new")}>
                + Create Order
              </button>
            </div>
          ) : (
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order</th>

                    <th>Customer</th>

                    <th>Mobile</th>

                    <th>Total</th>

                    <th>Paid</th>

                    <th>Balance</th>

                    <th>Status</th>

                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboard.orders.slice(0, 10).map((order) => (
                    <tr
                      key={order.id}
                      onClick={() =>
                        navigate(`/siridigitals/orders/${order.id}`)
                      }
                    >
                      <td>
                        <strong>{order.order_number}</strong>
                      </td>

                      <td>{order.customers?.name || "Walk-in Customer"}</td>

                      <td>{order.customers?.mobile || "-"}</td>

                      <td>{formatCurrency(order.total)}</td>

                      <td>{formatCurrency(order.paid)}</td>

                      <td>
                        <strong>{formatCurrency(order.balance)}</strong>
                      </td>

                      <td>
                        <select
                          className={`order-status-select ${getStatusClass(order.status)}`}
                          value={order.status}
                          onChange={(e) => handleStatusChange(e, order.id)}
                          onClick={(e) => e.stopPropagation()} /* Prevents row click */
                        >
                          <option value="NEW">NEW</option>
                          <option value="PRINTING">PRINTING</option>
                          <option value="READY">READY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td>{formatDate(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
