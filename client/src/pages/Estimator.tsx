import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import {
  fetchCrops,
  fetchRegions,
  submitEstimate,
  fetchMasterCategories,
  fetchMasterCosts,
} from "../services/api";
import type { Crop, Region, FormData } from "../types";
import { getSoilSuitabilityScore } from "../utils/soil";

interface IrrigationOption {
  value: string;
  label: string;
}

const FARMING_TYPES = [
  { value: "open_field", label: "Open Field Farming" },
  { value: "protected", label: "Protected Farming (Polyhouse/Net House)" },
  { value: "hydroponic", label: "Soilless/Hydroponic Farming" },
];

// Irrigation types will be dynamically loaded from Master Data API

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
  Onion: "🧅",
  "Red Chilli": "🌶️",
  Turmeric: "🟡",
  Coriander: "🌿",
  Ashwagandha: "🌱",
  "Tulsi (Holy Basil)": "🌿",
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
};

const formatCropLabel = (crop: Crop) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {crop.imageUrl ? (
        <img
          src={crop.imageUrl}
          alt={crop.name}
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "4px",
            objectFit: "cover",
          }}
        />
      ) : (
        <span style={{ fontSize: "1.5rem" }}>
          {CROP_ICONS[crop.name] || "🌱"}
        </span>
      )}
      <strong style={{ marginLeft: "4px" }}>{crop.name}</strong>
    </div>
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

  // We're using a 2-step process for a premium UX
  const [step, setStep] = useState<number>(1);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Four-level cascading dropdowns state
  const [categoryId, setCategoryId] = useState<string>("");
  const [stateId, setStateId] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    cropId: "",
    regionId: "",
    landSize: 2,
    irrigationType: "",
    farmingType: "open_field",
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
  const [categories, setCategories] = useState<any[]>([]);
  const [costParams, setCostParams] = useState<any[]>([]);
  const [irrigations, setIrrigations] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cropsRes, regionsRes, irrigationsRes, categoriesRes, costsRes] =
          await Promise.all([
            fetchCrops(),
            fetchRegions(),
            fetch("http://localhost:5001/api/master/irrigations").then((res) =>
              res.json(),
            ),
            fetchMasterCategories(),
            fetchMasterCosts(),
          ]);

        setCrops(cropsRes.data.data || []);
        setRegions(regionsRes.data.data || []);

        const activeCategories = (categoriesRes.data.data || []).filter(
          (c: any) => c.active,
        );
        setCategories(activeCategories);

        const activeCosts = (costsRes.data.data || []).filter(
          (c: any) => c.active,
        );
        setCostParams(activeCosts);

        const activeIrrigations = (irrigationsRes?.data || []).filter(
          (i: any) => i.active,
        );
        const normalizedIrrigations = activeIrrigations
          .map((i: any) => ({
            ...i,
            normalizedType: normalizeIrrigationType(i.typeName),
          }))
          .filter(
            (irr: any, idx: number, arr: any[]) =>
              idx ===
              arr.findIndex((x: any) => x.normalizedType === irr.normalizedType),
          );
        setIrrigations(normalizedIrrigations);

        if (normalizedIrrigations.length > 0 && !formData.irrigationType) {
          setFormData((prev) => ({
            ...prev,
            irrigationType: normalizedIrrigations[0].normalizedType,
          }));
        }
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

  // --- Filtering Logic for 4 Dropdowns ---

  // 1. Categories
  const categoryOptions = categories.map((cat) => ({
    value: cat.name,
    label: cat.name,
  }));

  // 2. Crops (Filtered by Category)
  const filteredCrops = categoryId
    ? crops.filter((c) => c.category === categoryId)
    : crops;
  const cropOptions = filteredCrops.map((crop) => ({
    value: crop._id,
    label: formatCropLabel(crop),
    cropObj: crop,
  }));

  const selectedCrop = crops.find((c) => c._id === formData.cropId);

  // 3. States (Filtered by Region validness for Crop)
  // First get all regions valid for selected crop
  const getValidRegionsForCrop = () => {
    if (!selectedCrop) return regions; // if no crop selected, return all
    return regions.filter((region) => {
      const suitability = getSoilSuitabilityScore(selectedCrop, region);
      return suitability > 0;
    });
  };

  const cropValidRegions = getValidRegionsForCrop();
  const uniqueStates = Array.from(
    new Set(cropValidRegions.map((r) => r.state)),
  ).sort();
  const stateOptions = uniqueStates.map((st) => ({ value: st, label: st }));

  // 4. Region (Filtered by State and Crop Validness)
  const filteredRegions = stateId
    ? cropValidRegions.filter((r) => r.state === stateId)
    : cropValidRegions;

  const regionOptions = filteredRegions.map((r) => ({
    value: r._id,
    label: `${r.district} — Soil: ${r.soilType} — 🌧️ ${r.avgRainfallMM}mm`,
    regionObj: r,
  }));

  const selectedRegion = regions.find((r) => r._id === formData.regionId);

  useEffect(() => {
    if (!selectedRegion?.recommendedIrrigationTypes?.length) return;
    const preferred = selectedRegion.recommendedIrrigationTypes[0];
    if (!preferred) return;
    setFormData((prev) => ({ ...prev, irrigationType: preferred }));
  }, [formData.regionId]);

  // Auto-clear downstream dropdowns if parent changes
  useEffect(() => {
    setFormData((p) => ({ ...p, cropId: "", regionId: "" }));
    setStateId("");
  }, [categoryId]);

  useEffect(() => {
    setFormData((p) => ({ ...p, regionId: "" }));
    setStateId("");
  }, [formData.cropId]);

  useEffect(() => {
    setFormData((p) => ({ ...p, regionId: "" }));
  }, [stateId]);

  // --- Steps Logic ---
  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  const canProceedStep1 =
    !!categoryId &&
    !!formData.cropId &&
    !!stateId &&
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
        farmingType: formData.farmingType,
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
        <p>
          Speed up your analysis. Select your preferences to get AI-driven
          insights.
        </p>
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
            Select your Crop Category, then the specific Crop. Regions will
            intelligently filter based on the crop's soil requirements.
          </p>

          <div className="form-row">
            {/* Dropdown 1: Category */}
            <div className="form-group" style={{ flex: 1 }}>
              <label>
                1. Crop Category <span className="required">*</span>
              </label>
              <Select
                styles={customSelectStyles}
                options={categoryOptions}
                isSearchable={true}
                placeholder="🔍 Select Category..."
                value={
                  categoryOptions.find((o) => o.value === categoryId) || null
                }
                onChange={(selected) => setCategoryId(selected?.value || "")}
              />
            </div>

            {/* Dropdown 2: Crop */}
            <div className="form-group" style={{ flex: 1 }}>
              <label>
                2. Select Crop <span className="required">*</span>
              </label>
              <Select
                styles={customSelectStyles}
                options={cropOptions}
                isSearchable={true}
                isDisabled={!categoryId}
                placeholder={
                  categoryId ? "🔍 Choose a crop..." : "Select Category first"
                }
                value={
                  cropOptions.find((o) => o.value === formData.cropId) || null
                }
                onChange={(selected) => {
                  const newCropId = selected?.value || "";
                  const cropObj = crops.find((c) => c._id === newCropId);
                  const defCosts = cropObj?.defaultCosts;
                  setFormData((p) => ({
                    ...p,
                    cropId: newCropId,
                    // Auto-fill standard costs for step 2 based on AI/DB defaults
                    costs: {
                      seeds: defCosts?.seeds || 0,
                      fertilizer: defCosts?.fertilizer || 0,
                      pesticide: defCosts?.pesticide || 0,
                      labor: defCosts?.labor || 0,
                      irrigation: defCosts?.irrigation || 0,
                      transport: defCosts?.transport || 0,
                      misc: defCosts?.misc || 0,
                    },
                  }));
                }}
              />
            </div>
          </div>

          <div className="form-row" style={{ marginTop: "1rem" }}>
            {/* Dropdown 3: State */}
            <div className="form-group" style={{ flex: 1 }}>
              <label>
                3. Select State <span className="required">*</span>
              </label>
              <Select
                styles={customSelectStyles}
                options={stateOptions}
                isSearchable={true}
                isDisabled={!formData.cropId}
                placeholder={
                  formData.cropId ? "🔍 Select State..." : "Select Crop first"
                }
                value={stateOptions.find((o) => o.value === stateId) || null}
                onChange={(selected) => setStateId(selected?.value || "")}
              />
            </div>

            {/* Dropdown 4: Region */}
            <div className="form-group" style={{ flex: 1 }}>
              <label>
                4. Select Region/District <span className="required">*</span>
              </label>
              <Select
                styles={customSelectStyles}
                options={regionOptions}
                isSearchable={true}
                isDisabled={!stateId}
                placeholder={
                  stateId ? "🔍 Select district..." : "Select State first"
                }
                value={
                  regionOptions.find((o) => o.value === formData.regionId) ||
                  null
                }
                onChange={(selected) =>
                  setFormData((p) => ({
                    ...p,
                    regionId: selected?.value || "",
                  }))
                }
              />
            </div>
          </div>

          {selectedCrop && selectedRegion && categoryId && stateId && (
            <div
              className="info-grid"
              style={{
                marginTop: "1.5rem",
                marginBottom: "2rem",
                background: "rgba(0,0,0,0.1)",
                border: "1px solid rgba(6, 214, 160, 0.3)",
              }}
            >
              <div className="info-item">
                <div className="info-label">Base Yield</div>
                <div className="info-value" style={{ color: "white" }}>
                  {selectedCrop.baseYieldPerAcre} qtl/ac
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">Water Need</div>
                <div className="info-value" style={{ color: "white" }}>
                  {selectedCrop.waterRequirement}
                </div>
              </div>
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
                {irrigations.map((type) => (
                  <option key={type._id} value={type.normalizedType}>
                    {formatIrrigationLabel(type.normalizedType)} (₹
                    {type.costPerAcre}/Acre)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "0.5rem" }}>
            <label>
              Farming Method <span className="required">*</span>
            </label>
            <select
              name="farmingType"
              className="form-control"
              value={formData.farmingType || "open_field"}
              onChange={handleChange}
            >
              {FARMING_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
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
          <h2>💸 Custom Cost Inputs (AI Approximated)</h2>
          <p className="form-description">
            We have pre-filled these values based on the AI agricultural data
            for <strong>{selectedCrop?.name || "your crop"}</strong>. You can
            adjust them perfectly to your local prices per acre.
          </p>

          <div className="cost-inputs-grid">
            {costParams.map((param) => (
              <div className="form-group" key={param._id}>
                <label>
                  {param.name} ({param.defaultUnit || "₹/Acre"})
                </label>
                <input
                  type="number"
                  name={param.name.toLowerCase().replace(/\s+/g, "")}
                  className="form-control"
                  placeholder="0"
                  value={
                    formData.costs[
                      param.name.toLowerCase().replace(/\s+/g, "")
                    ] || ""
                  }
                  onChange={(e) => {
                    const { value } = e.target;
                    setFormData((prev) => ({
                      ...prev,
                      costs: {
                        ...prev.costs,
                        [param.name.toLowerCase().replace(/\s+/g, "")]:
                          Number(value) || 0,
                      },
                    }));
                  }}
                  min="0"
                />
              </div>
            ))}
            {costParams.length === 0 && (
              <p
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "2rem",
                  color: "var(--text-secondary)",
                }}
              >
                No custom cost parameters defined. Using standard defaults.
              </p>
            )}
          </div>

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
                `📊 Generate AI Report`
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Estimator;
  const normalizeIrrigationType = (raw: string): string => {
    const cleaned = raw.trim().toLowerCase().replace(/[^a-z]/g, "");
    if (cleaned.includes("tubewell")) return "tubewell";
    if (cleaned.includes("borewell")) return "borewell";
    if (cleaned.includes("sprinkler")) return "sprinkler";
    if (cleaned.includes("drip")) return "drip";
    if (cleaned.includes("rainfed")) return "rainfed";
    if (cleaned.includes("canal")) return "canal";
    if (cleaned.includes("flood")) return "flood";
    return cleaned || "canal";
  };

  const formatIrrigationLabel = (value: string): string =>
    value
      .split("_")
      .join(" ")
      .replace(/\b\w/g, (ch) => ch.toUpperCase());
