import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const CropsManager: React.FC = () => {
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      const res = await axios.get("http://localhost:5001/api/admin/crops", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setCrops(res.data.data);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate("/admin/login");
      } else {
        setError("Failed to fetch crops.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [navigate]);

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${name}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5001/api/admin/crops/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh list
      fetchCrops();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete crop");
    }
  };

  if (loading) return <div className="admin-loading">Loading Crops...</div>;

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
        <h2>🌱 Crops Manager</h2>
        <Link
          to="/admin/crops/new"
          className="btn btn-primary"
          style={{ padding: "0.6rem 1.2rem", fontSize: "0.95rem" }}
        >
          + Add New Crop
        </Link>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>Icon</th>
              <th>Crop Name</th>
              <th>Category</th>
              <th>Base Yield</th>
              <th>Current MSP</th>
              <th>Updated</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {crops.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  No crops found in the database.
                </td>
              </tr>
            ) : (
              crops.map((crop) => (
                <tr key={crop._id}>
                  <td style={{ textAlign: "center" }}>
                    {crop.imageUrl ? (
                      <img
                        src={crop.imageUrl}
                        alt={crop.name}
                        style={{
                          width: "35px",
                          height: "35px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "1.2rem" }}>
                        {crop.icon || "🌱"}
                      </span>
                    )}
                  </td>
                  <td style={{ fontWeight: "600", color: "#fff" }}>
                    {crop.name}
                  </td>
                  <td>
                    <span className="badge category-badge">
                      {crop.category}
                    </span>
                  </td>
                  <td>{crop.baseYieldPerAcre} Qtl</td>
                  <td style={{ color: "#06d6a0", fontWeight: "600" }}>
                    ₹{crop.mspPerQuintal}
                  </td>
                  <td
                    style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}
                  >
                    {new Date(crop.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="admin-table-actions">
                    <Link
                      to={`/admin/crops/${crop._id}`}
                      className="btn-table-action view"
                      title="Edit Crop"
                    >
                      ✎
                    </Link>
                    <button
                      onClick={() => handleDelete(crop._id, crop.name)}
                      className="btn-table-action delete"
                      title="Delete Crop"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CropsManager;
