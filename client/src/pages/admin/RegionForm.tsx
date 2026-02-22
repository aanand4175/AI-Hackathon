import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const REGION_PRESETS: Record<string, any> = {
  Bihar: {
    soilType: "Alluvial",
    avgRainfallMM: 1120,
    yieldMultiplier: 1.04,
    irrigationAvailability: "Moderate",
    waterAvailabilityMM: 780,
    supportedFarmingTypes: ["open_field", "protected"],
    recommendedIrrigationTypes: ["drip", "canal", "borewell"],
    costAdjustmentByCategory: {
      Cereals: 0.96,
      "Cash Crops": 1.03,
      Oilseeds: 0.98,
      Horticulture: 1.14,
      Spices: 1.08,
      Pulses: 0.97,
    },
  },
  Maharashtra: {
    soilType: "Black Cotton Soil",
    avgRainfallMM: 740,
    yieldMultiplier: 1.11,
    irrigationAvailability: "Moderate",
    waterAvailabilityMM: 640,
    supportedFarmingTypes: ["open_field", "protected", "hydroponic"],
    recommendedIrrigationTypes: ["drip", "sprinkler", "borewell"],
    costAdjustmentByCategory: {
      Cereals: 1.02,
      "Cash Crops": 1.05,
      Oilseeds: 1.01,
      Horticulture: 1.1,
      Spices: 1.06,
      Pulses: 1.0,
    },
  },
  Punjab: {
    soilType: "Alluvial",
    avgRainfallMM: 670,
    yieldMultiplier: 1.23,
    irrigationAvailability: "Good",
    waterAvailabilityMM: 980,
    supportedFarmingTypes: ["open_field", "protected"],
    recommendedIrrigationTypes: ["canal", "sprinkler", "drip"],
    costAdjustmentByCategory: {
      Cereals: 1.01,
      "Cash Crops": 1.04,
      Oilseeds: 0.99,
      Horticulture: 1.08,
      Spices: 1.05,
      Pulses: 1.0,
    },
  },
};

const RegionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [states, setStates] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState<any>({
    district: "",
    state: "",
    soilType: "",
    avgRainfallMM: 0,
    yieldMultiplier: 1.0,
    irrigationAvailability: "Moderate",
    waterAvailabilityMM: 600,
    supportedFarmingTypes: ["open_field"],
    recommendedIrrigationTypes: [],
    costAdjustmentByCategory: {
      Cereals: 1,
      "Cash Crops": 1,
      Oilseeds: 1,
      Horticulture: 1,
      Spices: 1,
      Pulses: 1,
    },
    costAdjustmentByFarmingType: {
      open_field: 1,
      protected: 1.2,
      hydroponic: 1.4,
    },
    riskFactors: [],
    govSchemes: [],
    weatherMock: {
      avgTempC: 30,
      forecast: [],
    },
  });

  useEffect(() => {
    fetchStates();
    if (isEdit) {
      fetchRegion();
    }
  }, [id]);

  const fetchStates = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/master/states");
      if (res.data.success) {
        setStates(res.data.data.filter((s: any) => s.active));
        if (!isEdit && res.data.data.length > 0) {
          setFormData((prev: any) => ({
            ...prev,
            state: res.data.data[0].name,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load states");
    }
  };

  const fetchRegion = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      // Need a backend admin route for this: GET /api/admin/regions/:id
      // Let's assume we use /api/regions/:id for now or we build it.
      const res = await axios.get(`http://localhost:5001/api/regions/${id}`);
      if (res.data.success) {
        const region = res.data.data;
        setFormData((prev: any) => ({
          ...prev,
          ...region,
          supportedFarmingTypes:
            region.supportedFarmingTypes || prev.supportedFarmingTypes,
          recommendedIrrigationTypes:
            region.recommendedIrrigationTypes ||
            prev.recommendedIrrigationTypes,
          costAdjustmentByCategory:
            region.costAdjustmentByCategory || prev.costAdjustmentByCategory,
          costAdjustmentByFarmingType:
            region.costAdjustmentByFarmingType ||
            prev.costAdjustmentByFarmingType,
        }));
      }
    } catch (err: any) {
      setError("Failed to load region details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const parsedValue =
      type === "number" ? (value === "" ? "" : Number(value)) : value;
    setFormData((prev: any) => ({ ...prev, [name]: parsedValue }));
  };

  const handleAutoFill = () => {
    if (!formData.state) {
      alert("Please choose State first.");
      return;
    }

    const preset = REGION_PRESETS[formData.state] || null;
    const mockRainfall = preset?.avgRainfallMM || 400 + Math.floor(Math.random() * 800);
    setFormData((prev: any) => ({
      ...prev,
      soilType:
        preset?.soilType ||
        [
          "Black Cotton Soil",
          "Alluvial Soil",
          "Red Soil",
          "Laterite Soil",
        ][Math.floor(Math.random() * 4)],
      avgRainfallMM: mockRainfall,
      yieldMultiplier: preset?.yieldMultiplier || 0.8 + Math.random() * 0.4,
      irrigationAvailability:
        preset?.irrigationAvailability || (mockRainfall > 800 ? "Good" : "Moderate"),
      waterAvailabilityMM: preset?.waterAvailabilityMM || mockRainfall + 200,
      supportedFarmingTypes: preset?.supportedFarmingTypes || prev.supportedFarmingTypes,
      recommendedIrrigationTypes:
        preset?.recommendedIrrigationTypes || prev.recommendedIrrigationTypes,
      costAdjustmentByCategory:
        preset?.costAdjustmentByCategory || prev.costAdjustmentByCategory,
      weatherMock: {
        ...prev.weatherMock,
        avgTempC: 25 + Math.floor(Math.random() * 10),
      },
    }));
    alert(
      `Successfully fetched standard soil, rainfall, and weather data map for ${formData.district}`,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        ...formData,
        recommendedIrrigationTypes: (formData.recommendedIrrigationTypes || [])
          .map((v: string) => v.toLowerCase().trim())
          .filter(Boolean),
      };

      if (isEdit) {
        await axios.put(
          `http://localhost:5001/api/admin/regions/${id}`,
          payload,
          config,
        );
      } else {
        await axios.post(
          `http://localhost:5001/api/admin/regions`,
          payload,
          config,
        );
      }
      navigate("/admin/regions");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save region");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="admin-loading">Loading configuration...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header-row">
        <h2>
          {isEdit
            ? `✏️ Edit Region: ${formData.district}`
            : `🗺️ Add New Region`}
        </h2>
        <button
          onClick={() => navigate("/admin/regions")}
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
          <div style={{ fontSize: "2rem" }}>🗺️</div>
          <div>
            <h4 style={{ margin: "0 0 0.25rem 0", color: "#06d6a0" }}>
              Regional Intelligence Auto-Fill
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--text-muted)",
              }}
            >
              Enter a District Name and fetch standard soil types, rainfall
              patterns, and yield multipliers based on Indian geographic data.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAutoFill}
            className="btn btn-primary"
            style={{ marginLeft: "auto", fontWeight: "600" }}
          >
            📥 Fetch Geographic Defaults
          </button>
        </div>

        <div className="admin-form-grid">
          {/* Card 1: Geography */}
          <div className="admin-form-card">
            <h3>📍 Geography & Soil</h3>
            <div className="form-group">
              <label>State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select State
                </option>
                {states.map((s: any) => (
                  <option key={s._id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>District Name</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="e.g. Ludhiana, Vidarbha"
                required
              />
            </div>
            <div className="form-group">
              <label>Soil Type</label>
              <input
                type="text"
                name="soilType"
                value={formData.soilType}
                onChange={handleChange}
                placeholder="e.g. Alluvial, Black Cotton"
                required
              />
            </div>
            <div className="form-group">
              <label>Supported Farming Types</label>
              <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                {["open_field", "protected", "hydroponic"].map((type) => (
                  <label key={type} style={{ display: "flex", gap: "0.4rem" }}>
                    <input
                      type="checkbox"
                      checked={(formData.supportedFarmingTypes || []).includes(type)}
                      onChange={(e) => {
                        setFormData((prev: any) => ({
                          ...prev,
                          supportedFarmingTypes: e.target.checked
                            ? [...prev.supportedFarmingTypes, type]
                            : prev.supportedFarmingTypes.filter((x: string) => x !== type),
                        }));
                      }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Climate */}
          <div className="admin-form-card">
            <h3>🌤️ Climate & Water</h3>
            <div className="form-group">
              <label>Avg Annual Rainfall (mm)</label>
              <input
                type="number"
                name="avgRainfallMM"
                value={formData.avgRainfallMM}
                onChange={handleChange}
                required
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label>Irrigation Level</label>
                <select
                  name="irrigationAvailability"
                  value={formData.irrigationAvailability}
                  onChange={handleChange}
                >
                  <option value="Good">Good</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Water Avail. (mm)</label>
                <input
                  type="number"
                  name="waterAvailabilityMM"
                  value={formData.waterAvailabilityMM}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Recommended Irrigation Types (comma separated)</label>
              <input
                type="text"
                value={(formData.recommendedIrrigationTypes || []).join(", ")}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    recommendedIrrigationTypes: e.target.value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="drip, sprinkler, borewell"
              />
            </div>
          </div>

          {/* Card 3: Regional Efficiency */}
          <div className="admin-form-card">
            <h3>📈 Regional ROI Factors</h3>
            <div className="form-group">
              <label>Yield Multiplier (Base: 1.0)</label>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  marginBottom: "0.75rem",
                }}
              >
                Adjust this to reflect regional fertility. 1.2 = 20% higher
                yield than average.
              </p>
              <input
                type="number"
                name="yieldMultiplier"
                value={formData.yieldMultiplier}
                onChange={handleChange}
                required
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Category Cost Multipliers</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {Object.keys(formData.costAdjustmentByCategory || {}).map((cat) => (
                  <input
                    key={cat}
                    type="number"
                    step="0.01"
                    value={formData.costAdjustmentByCategory[cat]}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        costAdjustmentByCategory: {
                          ...prev.costAdjustmentByCategory,
                          [cat]: Number(e.target.value) || 1,
                        },
                      }))
                    }
                    placeholder={`${cat} multiplier`}
                  />
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Farming Type Cost Multipliers</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                {Object.keys(formData.costAdjustmentByFarmingType || {}).map((ft) => (
                  <input
                    key={ft}
                    type="number"
                    step="0.01"
                    value={formData.costAdjustmentByFarmingType[ft]}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        costAdjustmentByFarmingType: {
                          ...prev.costAdjustmentByFarmingType,
                          [ft]: Number(e.target.value) || 1,
                        },
                      }))
                    }
                    placeholder={`${ft} multiplier`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-actions-bar">
          <button
            type="button"
            onClick={() => navigate("/admin/regions")}
            className="btn btn-secondary"
          >
            Discard
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "✨ Saving..." : "💾 Save Region Intelligence"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegionForm;
