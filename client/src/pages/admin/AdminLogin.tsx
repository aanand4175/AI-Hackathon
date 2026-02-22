import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DEMO_ADMIN_USERNAME = "admin";
const DEMO_ADMIN_PASSWORD = "adminpassword123";

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState(DEMO_ADMIN_USERNAME);
  const [password, setPassword] = useState(DEMO_ADMIN_PASSWORD);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5001/api/admin/login", {
        username,
        password,
      });
      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);
        navigate("/admin/dashboard");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Login failed. Please check credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-brand">
          <h2>🌾 FarmProfit Admin</h2>
          <p>Secure Portal</p>
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          Demo login prefilled hai. Bas "Secure Login" click karein.
        </p>

        {error && <div className="admin-error-box">{error}</div>}

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter admin username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Secure Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
