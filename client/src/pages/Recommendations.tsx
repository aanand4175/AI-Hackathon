import { useState, useEffect } from "react";
import Select from "react-select";
import { fetchRegions, fetchRecommendations } from "../services/api";
import type { Region, CropRecommendation } from "../types";

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
  placeholder: (base: any) => ({
    ...base,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
};

const Recommendations: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [stateId, setStateId] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const uniqueStates = Array.from(new Set(regions.map((r) => r.state))).sort();
  const stateOptions = uniqueStates.map((st) => ({ value: st, label: st }));

  const filteredRegions = stateId
    ? regions.filter((r) => r.state === stateId)
    : regions;

  const regionOptions = filteredRegions.map((r) => ({
    value: r._id,
    label: `${r.district}`,
    regionObj: r,
  }));

  useEffect(() => {
    setSelectedRegion("");
    setRecommendations([]);
  }, [stateId]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchRegions();
        setRegions(res.data.data || []);
      } catch {
        /* Ignore */
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, []);

  const handleFetch = async () => {
    if (!selectedRegion) return;
    setLoading(true);
    try {
      const res = await fetchRecommendations(selectedRegion);
      setRecommendations(res.data.data || []);
    } catch {
      /* Ignore */
    } finally {
      setLoading(false);
    }
  };

  const regionObj = regions.find((r) => r._id === selectedRegion);

  const getRiskColor = (level: string) =>
    level === "Low" ? "#06d6a0" : level === "High" ? "#ef476f" : "#ffd166";
  const getDemandColor = (d: string) =>
    d === "High" ? "#06d6a0" : d === "Low" ? "#ef476f" : "#ffd166";
  const formatINR = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

  if (dataLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading regions...</p>
      </div>
    );
  }

  return (
    <main className="tools-page">
      <div className="container">
        <div className="tools-header">
          <h1>🌾 Smart Crop Recommendations</h1>
          <p>
            Get top crop recommendations based on your region's soil, rainfall,
            and market conditions.
          </p>
        </div>

        {/* Region Selection */}
        <div className="tools-controls" style={{ alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>1. Select State</label>
            <Select
              styles={customSelectStyles}
              options={stateOptions}
              isSearchable={true}
              placeholder="🔍 Select State..."
              value={stateOptions.find((o) => o.value === stateId) || null}
              onChange={(selected) => setStateId(selected?.value || "")}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>2. Select Region</label>
            <Select
              styles={customSelectStyles}
              options={regionOptions}
              isSearchable={true}
              isDisabled={!stateId}
              placeholder={
                stateId ? "🔍 Select district..." : "Select State first"
              }
              value={
                regionOptions.find((o) => o.value === selectedRegion) || null
              }
              onChange={(selected) => setSelectedRegion(selected?.value || "")}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleFetch}
            disabled={!selectedRegion || loading}
            style={{ height: "45px" }}
          >
            {loading ? "Analyzing..." : "🔍 Get Recommendations"}
          </button>
        </div>

        {regionObj && (
          <div className="region-info-bar">
            <span>
              📍 {regionObj.district}, {regionObj.state}
            </span>
            <span>🌍 Soil: {regionObj.soilType}</span>
            <span>🌧️ Annual Rainfall: {regionObj.avgRainfallMM}mm</span>
            <span>💧 Irrigation: {regionObj.irrigationAvailability}</span>
          </div>
        )}

        {/* Results */}
        {recommendations.length > 0 && (
          <div className="recommendations-grid">
            {recommendations.map((rec, index) => (
              <div
                key={rec.cropId}
                className={`recommendation-card-v2 ${index === 0 ? "top-pick" : ""}`}
              >
                {index === 0 && (
                  <div className="top-pick-badge">⭐ Top Pick</div>
                )}
                <div className="rec-header">
                  <div>
                    <h3 className="rec-crop-name">{rec.cropName}</h3>
                    <span className="rec-category">{rec.category}</span>
                  </div>
                  <div className="rec-rank">#{index + 1}</div>
                </div>

                <div className="rec-stats">
                  <div className="rec-stat">
                    <span className="rec-stat-label">
                      Est. Profit/Acre <br /> (per cycle)
                    </span>
                    <span
                      className={`rec-stat-value ${rec.estimatedProfit >= 0 ? "green" : "red"}`}
                    >
                      {formatINR(rec.estimatedProfit)}
                    </span>
                  </div>
                  <div className="rec-stat">
                    <span className="rec-stat-label">ROI</span>
                    <span className="rec-stat-value">{rec.roi}%</span>
                  </div>
                  <div className="rec-stat">
                    <span className="rec-stat-label">Confidence</span>
                    <span className="rec-stat-value">{rec.confidence}%</span>
                  </div>
                  <div className="rec-stat">
                    <span className="rec-stat-label">Suitability</span>
                    <span className="rec-stat-value">
                      {rec.suitabilityScore}/100
                    </span>
                  </div>
                </div>

                <div className="rec-badges">
                  <span
                    className="verdict-badge"
                    style={{
                      background: `${getRiskColor(rec.riskLevel)}22`,
                      color: getRiskColor(rec.riskLevel),
                      border: `1px solid ${getRiskColor(rec.riskLevel)}44`,
                    }}
                  >
                    Risk: {rec.riskLevel}
                  </span>
                  <span
                    className="verdict-badge"
                    style={{
                      background: `${getDemandColor(rec.marketDemand)}22`,
                      color: getDemandColor(rec.marketDemand),
                      border: `1px solid ${getDemandColor(rec.marketDemand)}44`,
                    }}
                  >
                    Demand: {rec.marketDemand}
                  </span>
                </div>

                {/* Suitability bar */}
                <div className="rec-suitability-bar">
                  <div className="rec-suit-track">
                    <div
                      className="rec-suit-fill"
                      style={{
                        width: `${rec.suitabilityScore}%`,
                        background:
                          rec.suitabilityScore >= 70
                            ? "#06d6a0"
                            : rec.suitabilityScore >= 45
                              ? "#ffd166"
                              : "#ef476f",
                      }}
                    ></div>
                  </div>
                  <span className="rec-suit-label">
                    Suitability: {rec.suitabilityScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {recommendations.length === 0 && selectedRegion && !loading && (
          <div style={{ textAlign: "center", padding: "3rem", opacity: 0.6 }}>
            <p>
              Click "Get Recommendations" to see the best crops for your region.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Recommendations;
