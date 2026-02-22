import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
    }
  }, [token, location, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  // Prevent flashing the protected layout if we are unauthenticated
  if (!token) return null;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>🌾 FarmProfit Admin</h2>
        </div>
        <nav className="admin-nav">
          <Link
            to="/admin"
            className={
              location.pathname === "/admin" ||
              location.pathname === "/admin/dashboard"
                ? "active"
                : ""
            }
          >
            📊 Dashboard
          </Link>
          <Link
            to="/admin/crops"
            className={location.pathname.includes("/crops") ? "active" : ""}
          >
            🌱 Crops Manager
          </Link>
          <Link
            to="/admin/regions"
            className={location.pathname.includes("/regions") ? "active" : ""}
          >
            🗺️ Regions Manager
          </Link>

          <div
            style={{
              margin: "1.5rem 0 0.5rem 1rem",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              fontWeight: "bold",
            }}
          >
            Master Data
          </div>
          <Link
            to="/admin/categories"
            className={
              location.pathname.includes("/categories") ? "active" : ""
            }
          >
            🌾 Categories
          </Link>
          <Link
            to="/admin/states"
            className={location.pathname.includes("/states") ? "active" : ""}
          >
            📍 States
          </Link>
          <Link
            to="/admin/irrigations"
            className={
              location.pathname.includes("/irrigations") ? "active" : ""
            }
          >
            💧 Irrigations
          </Link>
          <Link
            to="/admin/costs"
            className={location.pathname.includes("/costs") ? "active" : ""}
          >
            💰 Costs
          </Link>

          <button
            onClick={handleLogout}
            className="btn-logout"
            style={{ marginTop: "1rem" }}
          >
            🚪 Logout
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h3>Welcome, Admin</h3>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
