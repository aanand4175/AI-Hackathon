import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface StateModel {
  _id: string;
  name: string;
  code: string;
  active: boolean;
}

const StateManager: React.FC = () => {
  const [states, setStates] = useState<StateModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    code: "",
    active: true,
  });
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const fetchStates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5001/api/admin/states", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStates(res.data.data);
    } catch (err: any) {
      setError("Failed to fetch states.");
      if (err.response?.status === 401) navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  const openModal = (st?: StateModel) => {
    if (st) {
      setFormData({
        id: st._id,
        name: st.name,
        code: st.code,
        active: st.active,
      });
    } else {
      setFormData({ id: "", name: "", code: "", active: true });
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
          `http://localhost:5001/api/admin/states/${formData.id}`,
          payload,
          config,
        );
      } else {
        await axios.post(
          `http://localhost:5001/api/admin/states`,
          payload,
          config,
        );
      }
      setShowModal(false);
      fetchStates();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error saving state");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5001/api/admin/states/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStates();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error deleting state");
    }
  };

  if (loading)
    return (
      <div style={{ padding: "2rem", color: "#fff" }}>Loading states...</div>
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
        <h2>🗺️ State Master</h2>
        <button onClick={() => openModal()} className="btn btn-primary">
          + Add State
        </button>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>State Name</th>
              <th>Code</th>
              <th style={{ width: "120px" }}>Status</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {states.map((st) => (
              <tr key={st._id}>
                <td style={{ fontWeight: "600", color: "#fff" }}>{st.name}</td>
                <td
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "monospace",
                    letterSpacing: "1px",
                  }}
                >
                  {st.code}
                </td>
                <td>
                  <span
                    className={`badge ${st.active ? "status-active" : "status-inactive"}`}
                    style={
                      !st.active
                        ? {
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                          }
                        : {}
                    }
                  >
                    {st.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="admin-table-actions">
                  <button
                    onClick={() => openModal(st)}
                    className="btn-table-action view"
                    title="Edit State"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(st._id, st.name)}
                    className="btn-table-action delete"
                    title="Delete State"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
            {states.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  No states found. Click "+ Add State" to create one.
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
            <h3>{formData.id ? "✏️ Edit State" : "✨ Add State"}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>State Name *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Maharashtra, Punjab"
                />
              </div>
              <div className="form-group">
                <label>State Code *</label>
                <input
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="e.g. MH, PB"
                  maxLength={5}
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
                <label style={{ marginBottom: 0 }}>Active State</label>
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
                  {saving ? "Saving..." : "Save State"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StateManager;
