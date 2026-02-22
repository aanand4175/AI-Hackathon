import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalCrops: number;
  totalRegions: number;
  recentEstimates: number;
  activeUsers: number;
  statesCovered: number;
  totalHighDemandCrops: number;
  avgYieldMultiplier: number;
  protectedReadyRegions: number;
  topStateByCoverage: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          navigate("/admin/login");
          return;
        }

        const res = await axios.get("http://localhost:5001/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
        } else {
          setError("Failed to load dashboard statistics.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) return <div className="admin-loading">Loading Dashboard...</div>;
  if (error) return <div className="admin-error-box">{error}</div>;
  if (!stats) return null;

  return (
    <div className="admin-dashboard">
      <div className="admin-header-row">
        <h2>🚀 System Overview</h2>
        <p className="admin-dashboard-sub">
          Master data health, regional coverage, and production-readiness status.
        </p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(6, 214, 160, 0.1)", color: "#06d6a0" }}
          >
            🌱
          </div>
          <div className="stat-details">
            <h3>Total Crops</h3>
            <p className="stat-value">{stats.totalCrops}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(255, 209, 102, 0.1)", color: "#ffd166" }}
          >
            🗺️
          </div>
          <div className="stat-details">
            <h3>Total Regions</h3>
            <p className="stat-value">{stats.totalRegions}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(17, 138, 178, 0.1)", color: "#118ab2" }}
          >
            📊
          </div>
          <div className="stat-details">
            <h3>Estimates Run</h3>
            <p className="stat-value">{stats.recentEstimates}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(239, 71, 111, 0.1)", color: "#ef476f" }}
          >
            👥
          </div>
          <div className="stat-details">
            <h3>States Covered</h3>
            <p className="stat-value">{stats.statesCovered}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(149, 117, 255, 0.1)", color: "#9575ff" }}
          >
            📦
          </div>
          <div className="stat-details">
            <h3>High Demand Crops</h3>
            <p className="stat-value">{stats.totalHighDemandCrops}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(255, 159, 67, 0.1)", color: "#ff9f43" }}
          >
            🌾
          </div>
          <div className="stat-details">
            <h3>Avg Yield Multiplier</h3>
            <p className="stat-value">{stats.avgYieldMultiplier}x</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(0, 205, 172, 0.1)", color: "#00cdac" }}
          >
            🏗️
          </div>
          <div className="stat-details">
            <h3>Protected-Ready Regions</h3>
            <p className="stat-value">{stats.protectedReadyRegions}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(239, 71, 111, 0.1)", color: "#ef476f" }}
          >
            📍
          </div>
          <div className="stat-details">
            <h3>Top Coverage State</h3>
            <p className="stat-value">{stats.topStateByCoverage}</p>
          </div>
        </div>
      </div>

      <div className="admin-insight-panel">
        <h3>Operational Summary</h3>
        <ul>
          <li>
            {stats.totalRegions} regions mapped across {stats.statesCovered} states.
          </li>
          <li>
            {stats.protectedReadyRegions} regions already configured for protected farming.
          </li>
          <li>
            Highest regional coverage currently in <strong>{stats.topStateByCoverage}</strong>.
          </li>
          <li>
            Keep category-wise cost multipliers updated for realistic estimator output.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
