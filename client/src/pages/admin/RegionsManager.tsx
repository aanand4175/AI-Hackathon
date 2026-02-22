import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Region {
  _id: string;
  state: string;
  district: string;
  soilType: string;
  avgRainfallMM: number;
}

const RegionsManager: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      // For now, let's fetch all regions. If we haven't created the admin/regions endpoint yet, we will need to.
      // Actually we have public /api/regions, but admin should use /api/admin/regions
      const res = await axios.get("http://localhost:5001/api/regions");
      setRegions(res.data.data);
    } catch (err: any) {
      setError("Failed to fetch regions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${name}? This action cannot be undone.`,
      )
    )
      return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5001/api/admin/regions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRegions();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete region");
    }
  };

  if (loading)
    return <div className="admin-loading">Loading configuration...</div>;

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
        <h2>🗺️ Regions Manager</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/regions/new")}
        >
          + Add New Region
        </button>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "150px" }}>State</th>
              <th>District/Region</th>
              <th>Soil Type</th>
              <th>Avg Rainfall</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => (
              <tr key={region._id}>
                <td>
                  <span className="badge category-badge">{region.state}</span>
                </td>
                <td style={{ fontWeight: "600", color: "#fff" }}>
                  {region.district}
                </td>
                <td>{region.soilType}</td>
                <td style={{ color: "var(--text-secondary)" }}>
                  {region.avgRainfallMM} mm
                </td>
                <td className="admin-table-actions">
                  <button
                    onClick={() => navigate(`/admin/regions/${region._id}`)}
                    className="btn-table-action view"
                    title="Edit Region"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(region._id, region.district)}
                    className="btn-table-action delete"
                    title="Delete Region"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
            {regions.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    color: "var(--text-muted)",
                  }}
                >
                  No regions found. Click "+ Add New Region" to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegionsManager;
