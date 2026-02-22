import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Irrigation {
  _id: string;
  typeName: string;
  description: string;
  efficiencyRating: "Low" | "Medium" | "High";
  costPerAcre: number;
  active: boolean;
}

const IrrigationManager: React.FC = () => {
  const [items, setItems] = useState<Irrigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({
    id: "",
    typeName: "",
    description: "",
    efficiencyRating: "Medium",
    costPerAcre: 0,
    active: true,
  });
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        "http://localhost:5001/api/admin/irrigations",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setItems(res.data.data);
    } catch (err: any) {
      setError("Failed to fetch irrigations.");
      if (err.response?.status === 401) navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openModal = (item?: Irrigation) => {
    if (item) {
      setFormData({
        id: item._id,
        typeName: item.typeName,
        description: item.description,
        efficiencyRating: item.efficiencyRating,
        costPerAcre: item.costPerAcre,
        active: item.active,
      });
    } else {
      setFormData({
        id: "",
        typeName: "",
        description: "",
        efficiencyRating: "Medium",
        costPerAcre: 0,
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
          `http://localhost:5001/api/admin/irrigations/${formData.id}`,
          payload,
          config,
        );
      } else {
        await axios.post(
          `http://localhost:5001/api/admin/irrigations`,
          payload,
          config,
        );
      }
      setShowModal(false);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error saving item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5001/api/admin/irrigations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error deleting item");
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
        <h2>💧 Irrigation Setups Master</h2>
        <button onClick={() => openModal()} className="btn btn-primary">
          + Add Irrigation
        </button>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Type Name</th>
              <th>Efficiency</th>
              <th>Cost / Acre</th>
              <th style={{ width: "120px" }}>Status</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td style={{ fontWeight: "600", color: "#fff" }}>
                  {item.typeName}
                </td>
                <td>
                  <span
                    className={`badge efficiency-${item.efficiencyRating.toLowerCase()}`}
                    style={{
                      background:
                        item.efficiencyRating === "High"
                          ? "rgba(6, 214, 160, 0.1)"
                          : item.efficiencyRating === "Medium"
                            ? "rgba(255, 209, 102, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                      color:
                        item.efficiencyRating === "High"
                          ? "#06d6a0"
                          : item.efficiencyRating === "Medium"
                            ? "#ffd166"
                            : "#ef4444",
                    }}
                  >
                    {item.efficiencyRating}
                  </span>
                </td>
                <td style={{ color: "var(--text-muted)" }}>
                  ₹ {item.costPerAcre}
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
                    title="Edit Irrigation"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.typeName)}
                    className="btn-table-action delete"
                    title="Delete Irrigation"
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
                  No irrigations found. Click "+ Add Irrigation" to create one.
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
            <h3>{formData.id ? "✏️ Edit Irrigation" : "✨ Add Irrigation"}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Type Name *</label>
                <input
                  required
                  value={formData.typeName}
                  onChange={(e) =>
                    setFormData({ ...formData, typeName: e.target.value })
                  }
                  placeholder="e.g. Drip Irrigation, Sprinkler"
                />
              </div>
              <div className="form-group">
                <label>Efficiency Rating</label>
                <select
                  value={formData.efficiencyRating}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      efficiencyRating: e.target.value,
                    })
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Cost Per Acre (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.costPerAcre}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      costPerAcre: Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 5000"
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
                <label style={{ marginBottom: 0 }}>
                  Active Irrigation Type
                </label>
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
                  {saving ? "Saving..." : "Save Irrigation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IrrigationManager;
