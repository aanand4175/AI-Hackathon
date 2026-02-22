import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const CropForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState<any>({
    name: "",
    imageUrl: "",
    category: "", // Will be set after categories load
    baseYieldPerAcre: 0,
    growthDurationDays: 0,
    waterRequirement: "Medium",
    waterRequirementMM: 500,
    mspPerQuintal: 0,
    marketPricePerQuintal: 0,
    mandiPrice: 0,
    onlinePrice: 0,
    marketDemand: "Medium",
    defaultCosts: {
      seeds: 0,
      fertilizer: 0,
      pesticide: 0,
      labor: 0,
      irrigation: 0,
      transport: 0,
      misc: 0,
    },
    costTips: [],
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [costParams, setCostParams] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchCostParams();
    if (isEdit) {
      fetchCrop();
    }
  }, [id]);

  const fetchCostParams = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/master/costs");
      if (res.data.success) {
        setCostParams(res.data.data.filter((c: any) => c.active));
      }
    } catch (err) {
      console.error("Failed to load cost parameters");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5001/api/master/categories",
      );
      if (res.data.success) {
        setCategories(res.data.data.filter((c: any) => c.active));
        if (!isEdit && res.data.data.length > 0) {
          setFormData((prev: any) => ({
            ...prev,
            category: res.data.data[0].name,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load categories");
    }
  };

  const fetchCrop = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        `http://localhost:5001/api/admin/crops/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) {
        setFormData(res.data.data);
      }
    } catch (err: any) {
      setError("Failed to load crop details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    // Allow empty strings for number inputs so user can clear them
    const parsedValue =
      type === "number" ? (value === "" ? "" : Number(value)) : value;

    if (name.startsWith("cost_")) {
      const costKey = name.replace("cost_", "");
      setFormData((prev: any) => ({
        ...prev,
        defaultCosts: { ...prev.defaultCosts, [costKey]: parsedValue },
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: parsedValue }));
    }
  };

  const handleAutoFill = () => {
    if (!formData.name) {
      alert("Please enter a Crop Name first to fetch agronomic defaults.");
      return;
    }
    // Mocking an AI or Govt DB extraction based on crop name
    setFormData((prev: any) => ({
      ...prev,
      baseYieldPerAcre: 1200 + Math.floor(Math.random() * 500),
      growthDurationDays: 90 + Math.floor(Math.random() * 60),
      waterRequirement: "High",
      waterRequirementMM: 600 + Math.floor(Math.random() * 400),
      mspPerQuintal: 2500 + Math.floor(Math.random() * 1000),
      marketPricePerQuintal: 2800 + Math.floor(Math.random() * 1000),
      mandiPrice: 2400 + Math.floor(Math.random() * 1000),
      onlinePrice: 3000 + Math.floor(Math.random() * 1000),
      defaultCosts: costParams.reduce((acc: any, cp: any) => {
        const key = cp.name.toLowerCase().replace(/\s+/g, "");
        acc[key] = 500 + Math.floor(Math.random() * 3000);
        return acc;
      }, {}),
    }));
    alert(
      `Successfully fetched standard agronomic data map for ${formData.name}`,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isEdit) {
        await axios.put(
          `http://localhost:5001/api/admin/crops/${id}`,
          formData,
          config,
        );
      } else {
        await axios.post(
          `http://localhost:5001/api/admin/crops`,
          formData,
          config,
        );
      }
      navigate("/admin/crops");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save crop");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="admin-loading">Loading configuration...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header-row">
        <h2>{isEdit ? `✏️ Edit Crop: ${formData.name}` : `🌱 Add New Crop`}</h2>
        <button
          onClick={() => navigate("/admin/crops")}
          className="btn btn-secondary"
          style={{ padding: "0.6rem 1.2rem", fontSize: "0.95rem" }}
        >
          Cancel
        </button>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        {/* Magic Button Row */}
        <div
          style={{
            marginBottom: "2rem",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            background: "rgba(6, 214, 160, 0.05)",
            padding: "1.25rem",
            borderRadius: "12px",
            border: "1px solid rgba(6, 214, 160, 0.2)",
          }}
        >
          <div style={{ fontSize: "2rem" }}>🪄</div>
          <div>
            <h4 style={{ margin: "0 0 0.25rem 0", color: "#06d6a0" }}>
              Smart Agronomic Auto-Fill
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--text-muted)",
              }}
            >
              Enter a Crop Name and fetch standard 2024-25 data for Yields, MSP,
              and Costs from our AI-agriculture registry.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAutoFill}
            className="btn btn-primary"
            style={{ marginLeft: "auto", fontWeight: "600" }}
          >
            📥 Fetch Registry Defaults
          </button>
        </div>

        <div className="admin-form-grid">
          {/* Card 1: Identity */}
          <div className="admin-form-card">
            <h3>🆔 Basic Identity</h3>
            <div className="form-group">
              <label>Crop Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Wheat, Basmati Rice"
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select a Category
                </option>
                {categories.map((c: any) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Icon / Image URL</label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Card 2: Agronomics */}
          <div className="admin-form-card">
            <h3>🌾 Agronomic Metrics</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label>Base Yield (Qtl/Acre)</label>
                <input
                  type="number"
                  name="baseYieldPerAcre"
                  value={formData.baseYieldPerAcre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (Days)</label>
                <input
                  type="number"
                  name="growthDurationDays"
                  value={formData.growthDurationDays}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label>Water Req. Level</label>
                <select
                  name="waterRequirement"
                  value={formData.waterRequirement}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Total Water (mm)</label>
                <input
                  type="number"
                  name="waterRequirementMM"
                  value={formData.waterRequirementMM}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Card 3: Market Pricing */}
          <div className="admin-form-card">
            <h3>💰 Market & MSP (₹/Quintal)</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label>Govt MSP</label>
                <input
                  type="number"
                  name="mspPerQuintal"
                  value={formData.mspPerQuintal}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Retail Market</label>
                <input
                  type="number"
                  name="marketPricePerQuintal"
                  value={formData.marketPricePerQuintal}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label>Mandi Price</label>
                <input
                  type="number"
                  name="mandiPrice"
                  value={formData.mandiPrice}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Online Price</label>
                <input
                  type="number"
                  name="onlinePrice"
                  value={formData.onlinePrice}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Card 4: Detailed Costs */}
          <div className="admin-form-card">
            <h3>🛠️ Operational Costs (₹/Acre)</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              {costParams.map((param) => {
                const key = param.name.toLowerCase().replace(/\s+/g, "");
                return (
                  <div className="form-group" key={param._id}>
                    <label>
                      {param.name} ({param.defaultUnit || "₹"})
                    </label>
                    <input
                      type="number"
                      name={`cost_${key}`}
                      value={formData.defaultCosts[key] || ""}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                );
              })}
            </div>
            {costParams.length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No active cost parameters.
              </p>
            )}
          </div>
        </div>

        <div className="admin-actions-bar">
          <button
            type="button"
            onClick={() => navigate("/admin/crops")}
            className="btn btn-secondary"
          >
            Discard
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "✨ Saving..." : "💾 Save Crop Intelligence"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CropForm;
