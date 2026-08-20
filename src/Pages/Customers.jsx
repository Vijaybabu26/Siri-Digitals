import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../Services/customerService";

import { logoutUser } from "../Services/authService";

import "./Customers.css";

function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState(null);

  const [form, setForm] = useState({
    mobile: "",
    name: "",
    email: "",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomers();

      setCustomers(data || []);
    } catch (err) {
      console.error(err);

      setError("Unable to load customers.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCustomer(null);

    setForm({
      mobile: "",
      name: "",
      email: "",
    });

    setError("");

    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);

    setForm({
      mobile: customer.mobile || "",
      name: customer.name || "",
      email: customer.email || "",
    });

    setError("");

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);

    setEditingCustomer(null);

    setForm({
      mobile: "",
      name: "",
      email: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.mobile.trim()) {
      setError("Mobile number is required.");

      return;
    }

    if (form.mobile.trim().length < 10) {
      setError("Please enter a valid mobile number.");

      return;
    }

    try {
      setSaving(true);

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, {
          mobile: form.mobile.trim(),

          name: form.name.trim(),

          email: form.email.trim(),
        });
      } else {
        await createCustomer({
          mobile: form.mobile.trim(),

          name: form.name.trim(),

          email: form.email.trim(),
        });
      }

      closeModal();

      await loadCustomers();
    } catch (err) {
      console.error(err);

      if (err.code === "23505") {
        setError("This mobile number already exists.");
      } else {
        setError(err.message || "Unable to save customer.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(`Delete customer ${customer.mobile}?`);

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteCustomer(customer.id);

      await loadCustomers();
    } catch (err) {
      console.error(err);

      setError("Unable to delete customer.");
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

  const filteredCustomers = customers.filter((customer) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    return (
      (customer.mobile || "").toLowerCase().includes(searchText) ||
      (customer.name || "").toLowerCase().includes(searchText) ||
      (customer.email || "").toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="siri-customers-page">
      {/* =====================================
                SIDEBAR
            ===================================== */}

      <aside className="siri-sidebar">
        <div className="siri-sidebar-logo">
          <h2>Siri Digitals</h2>

          <span>Management</span>
        </div>

        <nav className="siri-sidebar-menu">
          <button
            className="sidebar-menu-item"
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

          <button className="sidebar-menu-item active">
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

      {/* =====================================
                MAIN
            ===================================== */}

      <main className="siri-customers-main">
        {/* Header */}

        <div className="customers-header">
          <div>
            <h1>Customers</h1>

            <p>Manage your customer details</p>
          </div>

          <button className="add-customer-button" onClick={openAddModal}>
            + Add Customer
          </button>
        </div>

        {/* Error */}

        {error && !showModal && <div className="customers-error">{error}</div>}

        {/* Search */}

        <div className="customers-toolbar">
          <div className="customer-search">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search mobile, name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="customer-count">
            {filteredCustomers.length} Customers
          </div>
        </div>

        {/* Customer List */}

        <div className="customers-card">
          {loading ? (
            <div className="customers-loading">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="customers-empty">
              <div className="empty-icon">♙</div>

              <h3>No customers found</h3>

              <p>Add your first customer to get started.</p>

              <button onClick={openAddModal}>+ Add Customer</button>
            </div>
          ) : (
            <div className="customers-table-wrapper">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Mobile</th>

                    <th>Name</th>

                    <th>Email</th>

                    <th>Added On</th>

                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <strong>{customer.mobile}</strong>
                      </td>

                      <td>{customer.name || "-"}</td>

                      <td>{customer.email || "-"}</td>

                      <td>
                        {customer.created_at
                          ? new Date(customer.created_at).toLocaleDateString(
                              "en-IN",
                            )
                          : "-"}
                      </td>

                      <td>
                        <div className="customer-actions">
                          <button
                            className="edit-button"
                            onClick={() => openEditModal(customer)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handleDelete(customer)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* =====================================
                ADD / EDIT MODAL
            ===================================== */}

      {showModal && (
        <div className="customer-modal-overlay" onClick={closeModal}>
          <div className="customer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="customer-modal-header">
              <div>
                <h2>{editingCustomer ? "Edit Customer" : "Add Customer"}</h2>

                <p>Enter customer details</p>
              </div>

              <button className="close-modal-button" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="customer-form">
              {/* Mobile */}

              <div className="customer-form-group">
                <label>
                  Mobile Number
                  <span>*</span>
                </label>

                <input
                  type="tel"
                  name="mobile"
                  placeholder="Enter mobile number"
                  value={form.mobile}
                  onChange={handleChange}
                  maxLength="10"
                />
              </div>

              {/* Name */}

              <div className="customer-form-group">
                <label>
                  Name
                  <small>Optional</small>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter customer name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}

              <div className="customer-form-group">
                <label>
                  Email
                  <small>Optional</small>
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              {error && <div className="customer-form-error">{error}</div>}

              <div className="customer-form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-customer-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCustomer
                      ? "Update Customer"
                      : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
