import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface CostParameter {
  _id: string;
  name: string;
  category: string;
  defaultUnit: string;
  active: boolean;
}

const CostParameterManager: React.FC = () => {
  const [items, setItems] = useState<CostParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({
    id: "",
    name: "",
    category: "Input",
    defaultUnit: "₹/Acre",
    active: true,
  });
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5001/api/admin/costs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data.data);
    } catch (err: any) {
      setError("Failed to fetch cost parameters.");
      if (err.response?.status === 401) navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openModal = (item?: CostParameter) => {
    if (item) {
      setFormData({
        id: item._id,
        name: item.name,
        category: item.category,
        defaultUnit: item.defaultUnit,
        active: item.active,
      });
    } else {
      setFormData({
        id: "",
        name: "",
        category: "Input",
        defaultUnit: "₹/Acre",
        active: true,
      });
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
          `http://localhost:5001/api/admin/costs/${formData.id}`,
          payload,
          config,
        );
      } else {
        await axios.post(
          `http://localhost:5001/api/admin/costs`,
          payload,
          config,
        );
      }
      setShowModal(false);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error saving parameter");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5001/api/admin/costs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error deleting parameter");
    }
  };

  if (loading)
    return <div style={{ padding: "2rem", color: "#fff" }}>Loading...</div>;

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
        <h2>💰 Cost Parameters Master</h2>
        <button onClick={() => openModal()} className="btn btn-primary">
          + Add Parameter
        </button>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Parameter Name</th>
              <th>Category</th>
              <th>Default Unit</th>
              <th style={{ width: "120px" }}>Status</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td style={{ fontWeight: "600", color: "#fff" }}>
                  {item.name}
                </td>
                <td>
                  <span className="badge category-badge">{item.category}</span>
                </td>
                <td style={{ color: "var(--text-muted)" }}>
                  {item.defaultUnit}
                </td>
                <td>
                  <span
                    className={`badge ${item.active ? "status-active" : "status-inactive"}`}
                    style={
                      !item.active
                        ? {
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                          }
                        : {}
                    }
                  >
                    {item.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="admin-table-actions">
                  <button
                    onClick={() => openModal(item)}
                    className="btn-table-action view"
                    title="Edit Parameter"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.name)}
                    className="btn-table-action delete"
                    title="Delete Parameter"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  No cost parameters found. Click "+ Add Parameter" to create
                  one.
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
            <h3>{formData.id ? "✏️ Edit Parameter" : "✨ Add Parameter"}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Parameter Name *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Seeds, Labor"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="Input">Input</option>
                  <option value="Labor">Labor</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                  <option value="Fixed">Fixed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Default Unit</label>
                <input
                  required
                  value={formData.defaultUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultUnit: e.target.value })
                  }
                  placeholder="e.g. ₹/Acre, ₹/kg"
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
                <label style={{ marginBottom: 0 }}>Active Parameter</label>
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
                  {saving ? "Saving..." : "Save Parameter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostParameterManager;
