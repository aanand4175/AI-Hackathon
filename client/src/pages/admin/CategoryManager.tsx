import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Category {
  _id: string;
  name: string;
  description: string;
  active: boolean;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    active: true,
  });
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        "http://localhost:5001/api/admin/categories",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCategories(res.data.data);
    } catch (err: any) {
      setError("Failed to fetch categories.");
      if (err.response?.status === 401) navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category?: Category) => {
    if (category) {
      setFormData({
        id: category._id,
        name: category.name,
        description: category.description,
        active: category.active,
      });
    } else {
      setFormData({ id: "", name: "", description: "", active: true });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { ...formData };

      if (formData.id) {
        await axios.put(
          `http://localhost:5001/api/admin/categories/${formData.id}`,
          payload,
          config,
        );
      } else {
        await axios.post(
          `http://localhost:5001/api/admin/categories`,
          payload,
          config,
        );
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error saving category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5001/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error deleting category");
    }
  };

  if (loading)
    return (
      <div style={{ padding: "2rem", color: "#fff" }}>
        Loading categories...
      </div>
    );

  return (
    <div className="admin-dashboard">
      <div
        className="admin-header-row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>🌾 Crop Categories Master</h2>
        <button onClick={() => openModal()} className="btn btn-primary">
          + Add Category
        </button>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Description</th>
              <th style={{ width: "120px" }}>Status</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td style={{ fontWeight: "600", color: "#fff" }}>{cat.name}</td>
                <td style={{ color: "var(--text-muted)" }}>
                  {cat.description || "-"}
                </td>
                <td>
                  <span
                    className={`badge ${cat.active ? "status-active" : "status-inactive"}`}
                    style={
                      !cat.active
                        ? {
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                          }
                        : {}
                    }
                  >
                    {cat.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="admin-table-actions">
                  <button
                    onClick={() => openModal(cat)}
                    className="btn-table-action view"
                    title="Edit Category"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id, cat.name)}
                    className="btn-table-action delete"
                    title="Delete Category"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  No categories found. Click "+ Add Category" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="admin-form-card" style={{ width: "450px" }}>
            <h3>{formData.id ? "✏️ Edit Category" : "✨ Add Category"}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Cereals, Fruits"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e: any) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe this crop category..."
                  rows={3}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "0.75rem",
                  }}
                />
              </div>
              <div
                className="form-group"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginTop: "1rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  style={{ width: "auto" }}
                />
                <label style={{ marginBottom: 0 }}>Active Category</label>
              </div>
              <div
                className="admin-actions-bar"
                style={{
                  position: "relative",
                  marginTop: "2rem",
                  padding: "1rem 0 0 0",
                  background: "none",
                  border: "none",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
