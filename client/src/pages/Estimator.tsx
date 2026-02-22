import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

const Estimator: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState<number>(1);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    cropId: "",
    regionId: "",
    landSize: 0,
    irrigationType: "canal",
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
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const canProceedStep1 = !!formData.cropId && !!formData.regionId;
  const canProceedStep2 = formData.landSize > 0 && !!formData.irrigationType;

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
        <p>
          Fill in your farming details to get a comprehensive profit estimate.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div
          className={`step ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}
        >
          <div className="step-number">{step > 1 ? "✓" : "1"}</div>
          <span className="step-label">{t("estimator.step1")}</span>
        </div>
        <div className={`step-line ${step > 1 ? "active" : ""}`}></div>
        <div
          className={`step ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}
        >
          <div className="step-number">{step > 2 ? "✓" : "2"}</div>
          <span className="step-label">{t("estimator.step2")}</span>
        </div>
        <div className={`step-line ${step > 2 ? "active" : ""}`}></div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <span className="step-label">{t("estimator.step3")}</span>
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="form-card">
          <h2>🌾 Select Crop & Region</h2>
          <p className="form-description">
            Choose the crop you want to grow and the region where your farm is
            located.
          </p>

          <div className="form-group">
            <label>
              {t("estimator.crop_label")} <span className="required">*</span>
            </label>
            <select
              name="cropId"
              className="form-control"
              value={formData.cropId}
              onChange={handleChange}
            >
              <option value="">-- Select a crop --</option>
              {crops.map((crop) => (
                <option key={crop._id} value={crop._id}>
                  {crop.name} ({crop.category}) — MSP: ₹{crop.mspPerQuintal}/qtl
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              {t("estimator.region_label")} <span className="required">*</span>
            </label>
            <select
              name="regionId"
              className="form-control"
              value={formData.regionId}
              onChange={handleChange}
            >
              <option value="">-- Select a region --</option>
              {regions.map((region) => (
                <option key={region._id} value={region._id}>
                  {region.district}, {region.state} — Soil: {region.soilType}
                </option>
              ))}
            </select>
          </div>

          {selectedCrop && (
            <div className="info-grid" style={{ marginTop: "1rem" }}>
              <div className="info-item">
                <div className="info-label">MSP</div>
                <div
                  className="info-value"
                  style={{ color: "var(--green-400)" }}
                >
                  ₹{selectedCrop.mspPerQuintal}/qtl
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">Market Price</div>
                <div
                  className="info-value"
                  style={{ color: "var(--blue-400)" }}
                >
                  ₹{selectedCrop.marketPricePerQuintal}/qtl
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">Base Yield</div>
                <div className="info-value">
                  {selectedCrop.baseYieldPerAcre} qtl/acre
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">Water Need</div>
                <div className="info-value">
                  {selectedCrop.waterRequirement}
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <div></div>
            <button
              className="btn btn-primary"
              disabled={!canProceedStep1}
              onClick={nextStep}
            >
              Next Step →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="form-card">
          <h2>🏞️ Land & Irrigation Details</h2>
          <p className="form-description">
            Enter your land size and the type of irrigation available on your
            farm.
          </p>

          <div className="form-row">
            <div className="form-group">
              <label>
                {t("estimator.land_size_label")}{" "}
                <span className="required">*</span>
              </label>
              <input
                type="number"
                name="landSize"
                className="form-control"
                placeholder="e.g. 5"
                value={formData.landSize || ""}
                onChange={handleChange}
                min="0.1"
                step="0.1"
              />
              <p className="form-hint">
                Enter total cultivable land area in acres
              </p>
            </div>
            <div className="form-group">
              <label>
                {t("estimator.irrigation_label")}{" "}
                <span className="required">*</span>
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
              <p className="form-hint">
                Drip irrigation gives the highest yield multiplier
              </p>
            </div>
          </div>

          {/* Price Source Toggle */}
          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label>💰 Price Source</label>
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
            <p className="form-hint">
              Select which price to use for revenue calculation
            </p>
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" onClick={prevStep}>
              ← Back
            </button>
            <button
              className="btn btn-primary"
              disabled={!canProceedStep2}
              onClick={nextStep}
            >
              Next Step →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="form-card">
          <h2>💸 Cost Inputs (Per Acre)</h2>
          <p className="form-description">
            Enter your estimated costs per acre in INR. Leave as 0 to use
            default values.
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
                  {field.charAt(0).toUpperCase() + field.slice(1)} (₹/acre)
                </label>
                <input
                  type="number"
                  name={field}
                  className="form-control"
                  placeholder="Default used if 0"
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
            <p
              style={{
                color: "var(--red-400)",
                marginTop: "1rem",
                fontSize: "0.9rem",
              }}
            >
              ⚠️ {error}
            </p>
          )}

          <div className="form-actions">
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
                  {t("estimator.generating")}
                </>
              ) : (
                `📊 ${t("estimator.generate_btn")}`
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Estimator;
