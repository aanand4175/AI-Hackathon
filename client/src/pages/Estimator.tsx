import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { fetchCrops, fetchRegions, submitEstimate } from "../services/api";
import type { Crop, Region, FormData } from "../types";

interface IrrigationOption {
  value: string;
  label: string;
}

const IRRIGATION_TYPES: IrrigationOption[] = [
  { value: "canal", label: "Canal Irrigation" },
  { value: "tubewell", label: "Tubewell" },
  { value: "borewell", label: "Borewell" },
  { value: "drip", label: "Drip Irrigation" },
  { value: "sprinkler", label: "Sprinkler" },
  { value: "rainfed", label: "Rainfed (No Irrigation)" },
  { value: "flood", label: "Flood Irrigation" },
];

const PRICE_SOURCES = [
  { value: "msp", label: "MSP (Govt)" },
  { value: "market", label: "Market Price" },
  { value: "mandi", label: "Local Mandi" },
  { value: "online", label: "Online Market" },
];

const CROP_ICONS: Record<string, string> = {
  "Rice (Paddy)": "🌾",
  Wheat: "🌾",
  Maize: "🌽",
  Cotton: "☁️",
  Sugarcane: "🎋",
  Soybean: "🫘",
  Mustard: "🌼",
  Groundnut: "🥜",
  "Jowar (Sorghum)": "🌾",
  "Bajra (Pearl Millet)": "🌾",
  Strawberry: "🍓",
  Tomato: "🍅",
};

// Custom styles for react-select to match our dark theme
const customSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    background: "rgba(0, 0, 0, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    color: "#fff",
    minHeight: "45px",
    boxShadow: state.isFocused ? "0 0 0 1px #06d6a0" : "none",
    "&:hover": {
      border: "1px solid rgba(255, 255, 255, 0.4)",
    },
  }),
  menu: (base: any) => ({
    ...base,
    background: "#1a1a2e",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    zIndex: 100,
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? "rgba(6, 214, 160, 0.2)" : "transparent",
    color: "#fff",
    cursor: "pointer",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "#fff",
  }),
  input: (base: any) => ({
    ...base,
    color: "#fff",
  }),
  groupHeading: (base: any) => ({
    ...base,
    color: "#888",
    textTransform: "uppercase",
    fontSize: "0.8rem",
    fontWeight: "bold",
    padding: "8px 12px",
    background: "rgba(0,0,0,0.3)",
  }),
};

const formatCropLabel = (crop: Crop) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <span>
      {CROP_ICONS[crop.name] || "🌱"} <strong>{crop.name}</strong>{" "}
      <span style={{ color: "#aaa", fontSize: "0.85rem", marginLeft: "6px" }}>
        ({crop.category})
      </span>
    </span>
    <span
      style={{
        background: "rgba(6, 214, 160, 0.1)",
        color: "#06d6a0",
        padding: "2px 8px",
        borderRadius: "12px",
        fontSize: "0.8rem",
      }}
    >
      MSP: ₹{crop.mspPerQuintal}
    </span>
  </div>
);

const Estimator: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // We're converting to a 2-step process to improve UX.
  const [step, setStep] = useState<number>(1);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    cropId: "",
    regionId: "",
    landSize: 2, // Defaulting to 2 to save time
    irrigationType: "tubewell",
    priceSource: "market",
    costs: {
      seeds: 0,
      fertilizer: 0,
      pesticide: 0,
      labor: 0,
      irrigation: 0,
      transport: 0,
      misc: 0,
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [cropsRes, regionsRes] = await Promise.all([
          fetchCrops(),
          fetchRegions(),
        ]);
        setCrops(cropsRes.data.data || []);
        setRegions(regionsRes.data.data || []);
      } catch {
        setError("Failed to load data. Please ensure the server is running.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "landSize" ? Number(value) : value,
    }));
  };

  const handleCostChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      costs: { ...prev.costs, [name]: Number(value) || 0 },
    }));
  };

  const selectedCrop = crops.find((c) => c._id === formData.cropId);
  const selectedRegion = regions.find((r) => r._id === formData.regionId);

  // UX Fix: Filter available regions dynamically based on chosen crop's soil suitability
  const getFilteredRegions = () => {
    if (!selectedCrop) return regions;
    return regions.filter((region) => {
      // Check if the crop can grow in this region's soil type
      const suitability = selectedCrop.soilSuitability?.[region.soilType] || 0;
      return suitability > 0;
    });
  };

  const validRegions = getFilteredRegions();

  // UX Fix: If the currently selected region is no longer valid for the newly selected crop, clear it
  useEffect(() => {
    if (selectedCrop && selectedRegion) {
      const isStillValid = validRegions.find(
        (r) => r._id === selectedRegion._id,
      );
      if (!isStillValid) {
        setFormData((p) => ({ ...p, regionId: "" }));
      }
    }
  }, [formData.cropId]);

  // Transform standard Crops data to react-select options
  const cropOptions = crops.map((crop) => ({
    value: crop._id,
    label: formatCropLabel(crop),
    cropObj: crop,
  }));

  // Group filtered regions by State for react-select
  const regionGroups = Object.entries(
    validRegions.reduce(
      (acc, region) => {
        if (!acc[region.state]) acc[region.state] = [];
        acc[region.state].push(region);
        return acc;
      },
      {} as Record<string, Region[]>,
    ),
  ).map(([state, stateRegions]) => ({
    label: state,
    options: stateRegions.map((r) => ({
      value: r._id,
      label: `${r.district} — Soil: ${r.soilType} — 🌧️ ${r.avgRainfallMM}mm`,
      regionObj: r,
    })),
  }));

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  const canProceedStep1 =
    !!formData.cropId &&
    !!formData.regionId &&
    formData.landSize > 0 &&
    !!formData.irrigationType;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const costs: Record<string, number> = {};
      for (const [key, val] of Object.entries(formData.costs)) {
        if (val && val > 0) costs[key] = val;
      }

      const payload = {
        cropId: formData.cropId,
        regionId: formData.regionId,
        landSize: formData.landSize,
        irrigationType: formData.irrigationType,
        priceSource: formData.priceSource,
        costs,
      };

      const response = await submitEstimate(payload as any);
      navigate("/results", { state: { result: response.data.data } });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr.response?.data?.message || "Failed to calculate estimate.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading crop and region data...</p>
      </div>
    );
  }

  if (error && crops.length === 0) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="estimator-page">
      <div className="estimator-header">
        <h1>{t("estimator.title")}</h1>
        <p>Speed up your analysis. Fill out your details below.</p>
      </div>

      {/* Modern 2-Step Indicator */}
      <div className="step-indicator">
        <div
          className={`step ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}
        >
          <div className="step-number">{step > 1 ? "✓" : "1"}</div>
          <span className="step-label">Basic Farm Details</span>
        </div>
        <div className={`step-line ${step > 1 ? "active" : ""}`}></div>
        <div
          className={`step ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}
        >
          <div className="step-number">{step > 2 ? "✓" : "2"}</div>
          <span className="step-label">Custom Cost Inputs</span>
        </div>
      </div>

      {/* Step 1: Combined Core Details */}
      {step === 1 && (
        <div className="form-card">
          <h2>🌾 Crop & Location</h2>
          <p className="form-description">
            We've grouped the essential options. Regions are automatically
            filtered based on your crop's soil requirements.
          </p>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1.5 }}>
              <label>
                Select Crop <span className="required">*</span>
              </label>
              <Select
                styles={customSelectStyles}
                options={cropOptions}
                isSearchable={true}
                placeholder="🔍 Type or search for a crop..."
                value={
                  cropOptions.find((o) => o.value === formData.cropId) || null
                }
                onChange={(selected) =>
                  setFormData((p) => ({ ...p, cropId: selected?.value || "" }))
                }
              />
              {/* Quick default options for crop selection */}
              {!formData.cropId && (
                <div
                  style={{
                    marginTop: "0.8rem",
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#888",
                      alignSelf: "center",
                    }}
                  >
                    Popular:
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        cropId:
                          crops.find((c) => c.name === "Rice (Paddy)")?._id ||
                          "",
                      }))
                    }
                  >
                    🌾 Rice
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        cropId:
                          crops.find((c) => c.name === "Wheat")?._id || "",
                      }))
                    }
                  >
                    🌾 Wheat
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        cropId:
                          crops.find((c) => c.name === "Tomato")?._id || "",
                      }))
                    }
                  >
                    🍅 Tomato
                  </button>
                </div>
              )}
            </div>

            <div className="form-group" style={{ flex: 1.5 }}>
              <label>
                Select Region <span className="required">*</span>
              </label>
              <Select
                styles={customSelectStyles}
                options={regionGroups}
                isSearchable={true}
                isDisabled={!formData.cropId}
                placeholder={
                  formData.cropId
                    ? "🔍 Search your district..."
                    : "Select crop first..."
                }
                value={
                  formData.regionId
                    ? regionGroups
                        .flatMap((g) => g.options)
                        .find((o) => o.value === formData.regionId) || null
                    : null
                }
                onChange={(selected) =>
                  setFormData((p) => ({
                    ...p,
                    regionId: selected?.value || "",
                  }))
                }
              />
              {formData.cropId && validRegions.length > 0 && (
                <p className="form-hint" style={{ color: "var(--green-400)" }}>
                  ✓ Showing regions suitable for {selectedCrop?.name}
                </p>
              )}
            </div>
          </div>

          {(selectedCrop || selectedRegion) && (
            <div
              className="info-grid"
              style={{
                marginTop: "1rem",
                marginBottom: "2rem",
                background: "rgba(0,0,0,0.1)",
              }}
            >
              {selectedCrop && (
                <>
                  <div className="info-item">
                    <div className="info-label">Base Yield</div>
                    <div className="info-value">
                      {selectedCrop.baseYieldPerAcre} qtl/ac
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Water Need</div>
                    <div className="info-value">
                      {selectedCrop.waterRequirement}
                    </div>
                  </div>
                </>
              )}
              {selectedRegion && (
                <>
                  <div className="info-item">
                    <div
                      className="info-label"
                      title={selectedRegion.soilType + " is good for this crop"}
                    >
                      Soil Type ℹ️
                    </div>
                    <div
                      className="info-value"
                      style={{ color: "var(--yellow-400)" }}
                    >
                      {selectedRegion.soilType}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Rainfall</div>
                    <div
                      className="info-value"
                      style={{ color: "var(--blue-400)" }}
                    >
                      {selectedRegion.avgRainfallMM} mm
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <hr
            style={{ borderColor: "rgba(255,255,255,0.1)", margin: "2rem 0" }}
          />

          <h2>🏞️ Farm Settings</h2>

          <div className="form-row">
            <div className="form-group">
              <label>
                Land Size (Acres) <span className="required">*</span>
              </label>

              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                {[0.5, 1, 2, 5].map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`btn ${formData.landSize === size ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "4px 12px", flex: 1 }}
                    onClick={() =>
                      setFormData((p) => ({ ...p, landSize: size }))
                    }
                  >
                    {size} Ac
                  </button>
                ))}
              </div>

              <input
                type="number"
                name="landSize"
                className="form-control"
                placeholder="Or type custom size..."
                value={formData.landSize || ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    landSize: Number(e.target.value) || 0,
                  }))
                }
                min="0.1"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>
                Irrigation Setup <span className="required">*</span>
              </label>
              <select
                name="irrigationType"
                className="form-control"
                value={formData.irrigationType}
                onChange={handleChange}
              >
                {IRRIGATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label>💰 Target Price Source</label>
            <div className="price-source-toggle">
              {PRICE_SOURCES.map((ps) => (
                <button
                  key={ps.value}
                  className={`price-toggle-btn ${formData.priceSource === ps.value ? "active" : ""}`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, priceSource: ps.value }))
                  }
                  type="button"
                >
                  {ps.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: "2rem" }}>
            <div></div>
            <button
              className="btn btn-primary btn-lg"
              disabled={!canProceedStep1}
              onClick={nextStep}
            >
              Continue to Costs →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Input Costs Configuration */}
      {step === 2 && (
        <div className="form-card">
          <h2>💸 Input Cost Adjustments</h2>
          <p className="form-description">
            Customize your estimated costs per acre in INR based on your local
            prices. Leave as 0 to use AI-recommended default values.
          </p>

          <div className="cost-inputs-grid">
            {[
              "seeds",
              "fertilizer",
              "pesticide",
              "labor",
              "irrigation",
              "transport",
              "misc",
            ].map((field) => (
              <div className="form-group" key={field}>
                <label>
                  {field.charAt(0).toUpperCase() + field.slice(1)} (₹)
                </label>
                <input
                  type="number"
                  name={field}
                  className="form-control"
                  placeholder="Auto AI default if 0"
                  value={
                    (formData.costs as Record<string, number>)[field] || ""
                  }
                  onChange={handleCostChange}
                  min="0"
                />
              </div>
            ))}
          </div>

          {error && (
            <div
              style={{
                background: "rgba(239, 71, 111, 0.1)",
                color: "var(--red-400)",
                padding: "1rem",
                borderRadius: "8px",
                marginTop: "1.5rem",
                border: "1px solid rgba(239, 71, 111, 0.3)",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <div className="form-actions" style={{ marginTop: "2rem" }}>
            <button className="btn btn-secondary" onClick={prevStep}>
              ← Back
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div
                    className="spinner"
                    style={{ width: 20, height: 20, borderWidth: 2 }}
                  ></div>
                  Generating Estimate...
                </>
              ) : (
                `📊 Generate Report`
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Estimator;
