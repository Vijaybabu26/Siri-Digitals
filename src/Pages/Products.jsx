import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllProducts,
  createProduct,
  updateProduct,
  deactivateProduct,
  activateProduct,
} from "../Services/productService";

import { logoutUser } from "../Services/authService";

import "./Products.css";

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [showInactive, setShowInactive] = useState(false);

  const [form, setForm] = useState({
    name: "",
    pricing_type: "FIXED",
    price: "",
    unit: "",
    allow_size: false,
    description: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllProducts();

      setProducts(data || []);
    } catch (err) {
      console.error(err);

      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);

    setForm({
      name: "",
      pricing_type: "FIXED",
      price: "",
      unit: "",
      allow_size: false,
      description: "",
    });

    setError("");

    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      pricing_type: product.pricing_type || "FIXED",
      price: product.price ?? "",
      unit: product.unit || "",
      allow_size: product.allow_size || false,
      description: product.description || "",
    });

    setError("");

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);

    setEditingProduct(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePricingTypeChange = (e) => {
    const pricingType = e.target.value;

    let unit = "";

    switch (pricingType) {
      case "PER_PIECE":
        unit = "Piece";
        break;

      case "PER_SQ_FT":
        unit = "Sq.Ft";
        break;

      case "PER_SQ_METER":
        unit = "Sq.Meter";
        break;

      case "PER_100":
        unit = "100";
        break;

      default:
        unit = "";
    }

    setForm((prev) => ({
      ...prev,
      pricing_type: pricingType,
      unit,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Product name is required.");

      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError("Please enter a valid price.");

      return;
    }

    try {
      setSaving(true);

      const productData = {
        name: form.name.trim(),

        pricing_type: form.pricing_type,

        price: Number(form.price),

        unit: form.unit || null,

        allow_size: form.allow_size,

        description: form.description.trim() || null,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      setShowModal(false);

      setEditingProduct(null);

      await loadProducts();
    } catch (err) {
      console.error(err);

      if (err.code === "23505") {
        setError("A product with this name already exists.");
      } else {
        setError(err.message || "Unable to save product.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleProduct = async (product) => {
    try {
      setError("");

      if (product.is_active) {
        await deactivateProduct(product.id);
      } else {
        await activateProduct(product.id);
      }

      await loadProducts();
    } catch (err) {
      console.error(err);

      setError("Unable to update product status.");
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

  const getPricingLabel = (pricingType) => {
    switch (pricingType) {
      case "FIXED":
        return "Fixed";

      case "PER_PIECE":
        return "Per Piece";

      case "PER_SQ_FT":
        return "Per Sq.Ft";

      case "PER_SQ_METER":
        return "Per Sq.Meter";

      case "PER_100":
        return "Per 100";

      case "PER_1000":
        return "Per 1000";

      default:
        return pricingType;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const filteredProducts = products.filter((product) => {
    if (!showInactive && !product.is_active) {
      return false;
    }

    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    return (
      (product.name || "").toLowerCase().includes(searchText) ||
      getPricingLabel(product.pricing_type).toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="siri-products-page">
      {/* =================================
                SIDEBAR
            ================================= */}

      <aside className="siri-products-sidebar">
        <div className="siri-products-logo">
          <h2>Siri Digitals</h2>

          <span>Management</span>
        </div>

        <nav className="siri-products-menu">
          <button
            className="product-sidebar-item"
            onClick={() => navigate("/siridigitals/dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="product-sidebar-item"
            onClick={() => navigate("/siridigitals/orders")}
          >
            <span>▣</span>
            Orders
          </button>

          <button
            className="product-sidebar-item"
            onClick={() => navigate("/siridigitals/customers")}
          >
            <span>♙</span>
            Customers
          </button>

          <button className="product-sidebar-item active">
            <span>▤</span>
            Products & Prices
          </button>

          <button
            className="product-sidebar-item"
            onClick={() => navigate("/siridigitals/payments")}
          >
            <span>₹</span>
            Payments
          </button>
        </nav>

        <div className="siri-products-sidebar-bottom">
          <button className="product-sidebar-item" onClick={handleLogout}>
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* =================================
                MAIN
            ================================= */}

      <main className="siri-products-main">
        {/* HEADER */}

        <div className="products-header">
          <div>
            <h1>Products & Prices</h1>

            <p>Manage printing products and pricing</p>
          </div>

          <button className="add-product-button" onClick={openAddModal}>
            + Add Product
          </button>
        </div>

        {/* ERROR */}

        {error && !showModal && <div className="products-error">{error}</div>}

        {/* TOOLBAR */}

        <div className="products-toolbar">
          <div className="product-search">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <label className="inactive-toggle">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Show inactive
          </label>

          <span className="product-count">
            {filteredProducts.length} Products
          </span>
        </div>

        {/* PRODUCT TABLE */}

        <div className="products-card">
          {loading ? (
            <div className="products-loading">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="products-empty">
              <div className="product-empty-icon">▤</div>

              <h3>No products found</h3>

              <p>Add your first printing product.</p>

              <button onClick={openAddModal}>+ Add Product</button>
            </div>
          ) : (
            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>

                    <th>Pricing Type</th>

                    <th>Price</th>

                    <th>Unit</th>

                    <th>Size</th>

                    <th>Status</th>

                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <strong>{product.name}</strong>

                        {product.description && (
                          <small className="product-description">
                            {product.description}
                          </small>
                        )}
                      </td>

                      <td>
                        <span className="pricing-badge">
                          {getPricingLabel(product.pricing_type)}
                        </span>
                      </td>

                      <td>
                        <strong>{formatCurrency(product.price)}</strong>
                      </td>

                      <td>{product.unit || "-"}</td>

                      <td>
                        {product.allow_size ? (
                          <span className="yes-badge">Yes</span>
                        ) : (
                          <span className="no-badge">No</span>
                        )}
                      </td>

                      <td>
                        {product.is_active ? (
                          <span className="active-badge">Active</span>
                        ) : (
                          <span className="inactive-badge">Inactive</span>
                        )}
                      </td>

                      <td>
                        <div className="product-actions">
                          <button
                            className="edit-product-button"
                            onClick={() => openEditModal(product)}
                          >
                            Edit
                          </button>

                          <button
                            className={
                              product.is_active
                                ? "deactivate-product-button"
                                : "activate-product-button"
                            }
                            onClick={() => handleToggleProduct(product)}
                          >
                            {product.is_active ? "Deactivate" : "Activate"}
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

      {/* =================================
                ADD / EDIT MODAL
            ================================= */}

      {showModal && (
        <div className="product-modal-overlay" onClick={closeModal}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}

            <div className="product-modal-header">
              <div>
                <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>

                <p>Set product pricing</p>
              </div>

              <button className="close-product-modal" onClick={closeModal}>
                ×
              </button>
            </div>

            {/* Form */}

            <form className="product-form" onSubmit={handleSave}>
              {/* Product Name */}

              <div className="product-form-group">
                <label>
                  Product Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Example: Flex Banner"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              {/* Pricing Type */}

              <div className="product-form-group">
                <label>
                  Pricing Type
                  <span>*</span>
                </label>

                <select
                  name="pricing_type"
                  value={form.pricing_type}
                  onChange={handlePricingTypeChange}
                >
                  <option value="FIXED">Fixed</option>

                  <option value="PER_PIECE">Per Piece</option>

                  <option value="PER_SQ_FT">Per Sq.Ft</option>

                  <option value="PER_SQ_METER">Per Sq.Meter</option>

                  <option value="PER_100">Per 100</option>

                  <option value="PER_1000">Per 1000</option>
                </select>
              </div>

              {/* Price */}

              <div className="product-form-row">
                <div className="product-form-group">
                  <label>
                    Price
                    <span>*</span>
                  </label>

                  <div className="price-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.price}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="product-form-group">
                  <label>Unit</label>

                  <input
                    type="text"
                    name="unit"
                    placeholder="Sq.Ft"
                    value={form.unit}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Size */}

              <div className="product-size-option">
                <label>
                  <input
                    type="checkbox"
                    name="allow_size"
                    checked={form.allow_size}
                    onChange={handleChange}
                  />

                  <div>
                    <strong>Allow Size</strong>

                    <small>
                      Enable width and height when adding this product to an
                      order.
                    </small>
                  </div>
                </label>
              </div>

              {/* Description */}

              <div className="product-form-group">
                <label>
                  Description
                  <small>Optional</small>
                </label>

                <textarea
                  name="description"
                  rows="3"
                  placeholder="Product description..."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              {error && <div className="product-form-error">{error}</div>}

              {/* Actions */}

              <div className="product-form-actions">
                <button
                  type="button"
                  className="cancel-product-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-product-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Update Product"
                      : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
