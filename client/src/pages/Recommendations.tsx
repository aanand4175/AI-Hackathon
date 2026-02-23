import { useState, useEffect } from "react";
import Select from "react-select";
import {
  fetchRegions,
  fetchRecommendations,
  generateRecommendationInsights,
} from "../services/api";
import type { Region, CropRecommendation } from "../types";
import AIInsightsCard from "../components/AIInsightsCard";

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
  const [error, setError] = useState<string>("");
  const [hasFetched, setHasFetched] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

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
    setHasFetched(false);
    setError("");
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

  const handleFetch = async (regionId: string) => {
    if (!regionId) return;
    setLoading(true);
    setError("");
    setAiInsights("");
    try {
      const res = await fetchRecommendations(regionId);
      const recs = res.data.data || [];
      setRecommendations(recs);
      setHasFetched(true);

      const rObj = regions.find((r) => r._id === regionId);
      if (recs.length > 0 && rObj) {
        fetchAiInsights(rObj, recs);
      }
    } catch {
      setRecommendations([]);
      setError("Recommendations fetch nahi ho paayi. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsights = async (
    regionObj: Region,
    recs: CropRecommendation[],
  ) => {
    setAiLoading(true);
    try {
      const { data } = await generateRecommendationInsights({
        region: regionObj,
        topCrops: recs.slice(0, 5),
      });
      setAiInsights(data.data.insights);
    } catch (err) {
      console.error("AI check fail:", err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedRegion) {
      setRecommendations([]);
      setHasFetched(false);
      setError("");
      return;
    }
    handleFetch(selectedRegion);
  }, [selectedRegion]);

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
            onClick={() => handleFetch(selectedRegion)}
            disabled={!selectedRegion || loading}
            style={{ height: "45px" }}
          >
            {loading ? "Analyzing..." : "🔄 Refresh"}
          </button>
        </div>

        {stateId && selectedRegion && (
          <div className="recommendation-meta-bar">
            <span>
              Showing top {recommendations.length || 0} crops for this district
            </span>
            <span>Ranking: Suitability + Risk + ROI + Confidence</span>
          </div>
        )}

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
        {(aiLoading || aiInsights) && (
          <div style={{ marginBottom: "2rem" }}>
            <AIInsightsCard insights={aiInsights} isLoading={aiLoading} />
          </div>
        )}

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

                {rec.recommendationScore !== undefined && (
                  <p className="rec-score-line">
                    Recommendation Score: {rec.recommendationScore}/100
                  </p>
                )}

                {rec.matchHighlights && rec.matchHighlights.length > 0 && (
                  <p className="rec-highlights">
                    Why: {rec.matchHighlights.slice(0, 3).join(" | ")}
                  </p>
                )}

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

        {error && <div className="recommendation-status error">{error}</div>}

        {recommendations.length === 0 &&
          selectedRegion &&
          !loading &&
          hasFetched &&
          !error && (
            <div className="recommendation-status">
              <p>
                Is region ke liye enough matching crops nahi mile. Dusra
                district try karein.
              </p>
            </div>
          )}
      </div>
    </main>
  );
};

export default Recommendations;
