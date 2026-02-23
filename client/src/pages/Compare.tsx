import { useState, useEffect } from "react";
import Select from "react-select";
import {
  fetchCrops,
  fetchRegions,
  compareScenarios,
  fetchMasterCategories,
  fetchMasterIrrigations,
  generateComparisonInsights,
} from "../services/api";
import type { Crop, Region } from "../types";
import { getSoilSuitabilityScore } from "../utils/soil";
import AIInsightsCard from "../components/AIInsightsCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ScenarioConfig {
  landSize: number;
  irrigationType: string;
  farmingType: "open_field" | "protected" | "hydroponic";
}

interface BestScenarioSnapshot {
  landSize: number;
  irrigationType: string;
  profit: number;
  roi: number;
  riskLevel: string;
  confidence: number;
}

const LAND_SIZE_PRESETS = [1, 2, 5, 10];
const FARMING_TYPE_OPTIONS = [
  { value: "open_field", label: "Open Field" },
  { value: "protected", label: "Protected" },
  { value: "hydroponic", label: "Hydroponic" },
];

const CROP_ICONS: Record<string, string> = {
  Wheat: "🌾",
  Rice: "🍚",
  Paddy: "🌾",
  Corn: "🌽",
  Maize: "🌽",
  Cotton: "☁️",
  Sugarcane: "🎋",
  Soybean: "🌱",
  Potato: "🥔",
  Tomato: "🍅",
  Onion: "🧅",
  "Green Gram": "🌿",
  "Black Gram": "🌿",
  Mustard: "🌼",
  Groundnut: "🥜",
  Jute: "📜",
  Banana: "🍌",
  Mango: "🥭",
};

const formatCropLabel = (crop: Crop, context: "menu" | "value") => {
  const icon = CROP_ICONS[crop.name] || "🌱";
  if (context === "value") {
    return (
      <span className="crop-select-value">
        <span>{icon}</span> {crop.name}
      </span>
    );
  }
  return (
    <div className="crop-option-row">
      <span className="crop-option-name">
        <span>{icon}</span> {crop.name}
      </span>
      <span className="crop-option-msp">₹{crop.mspPerQuintal}</span>
    </div>
  );
};

// Irrigation types will be dynamically loaded from Master Data API

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
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? "rgba(6, 214, 160, 0.2)" : "transparent",
    color: "#fff",
    cursor: "pointer",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  }),
  singleValue: (base: any) => ({ ...base, color: "#fff" }),
  input: (base: any) => ({ ...base, color: "#fff" }),
  valueContainer: (base: any) => ({
    ...base,
    paddingRight: "10px",
  }),
};

const Compare: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [irrigations, setIrrigations] = useState<any[]>([]);

  const [categoryId, setCategoryId] = useState("");
  const [cropId, setCropId] = useState("");
  const [stateId, setStateId] = useState("");
  const [regionId, setRegionId] = useState("");

  const [scenarioA, setScenarioA] = useState<ScenarioConfig>({
    landSize: 2,
    irrigationType: "canal",
    farmingType: "open_field",
  });
  const [scenarioB, setScenarioB] = useState<ScenarioConfig>({
    landSize: 5,
    irrigationType: "drip",
    farmingType: "open_field",
  });
  const [result, setResult] = useState<any>(null);
  const [bestScenarioByProfit, setBestScenarioByProfit] =
    useState<BestScenarioSnapshot | null>(null);
  const [bestScenarioByRoi, setBestScenarioByRoi] =
    useState<BestScenarioSnapshot | null>(null);
  const [bestCheckCount, setBestCheckCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [bestLoading, setBestLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiInsights, setAiInsights] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const selectOverlayProps = {
    menuPortalTarget: document.body,
    menuPosition: "fixed" as const,
  };

  const normalizeIrrigationType = (raw: string): string => {
    const cleaned = raw
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, "");
    if (cleaned.includes("tubewell") || cleaned.includes("tubewell"))
      return "tubewell";
    if (cleaned.includes("borewell")) return "borewell";
    if (cleaned.includes("sprinkler")) return "sprinkler";
    if (cleaned.includes("drip")) return "drip";
    if (cleaned.includes("rainfed")) return "rainfed";
    if (cleaned.includes("canal")) return "canal";
    if (cleaned.includes("flood")) return "flood";
    return cleaned || "canal";
  };

  const formatIrrigationLabel = (value: string): string =>
    value.charAt(0).toUpperCase() + value.slice(1);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, r, catRes, irrRes] = await Promise.all([
          fetchCrops(),
          fetchRegions(),
          fetchMasterCategories(),
          fetchMasterIrrigations(),
        ]);
        setCrops(c.data.data || []);
        setRegions(r.data.data || []);
        setCategories((catRes.data.data || []).filter((i: any) => i.active));
        const activeIrrs = (irrRes.data.data || []).filter(
          (i: any) => i.active,
        );
        const normalizedIrrs = activeIrrs
          .map((i: any) => ({
            ...i,
            normalizedType: normalizeIrrigationType(i.typeName),
          }))
          .filter(
            (irr: any, idx: number, arr: any[]) =>
              idx ===
              arr.findIndex(
                (x: any) => x.normalizedType === irr.normalizedType,
              ),
          );
        setIrrigations(normalizedIrrs);
        if (normalizedIrrs.length > 0) {
          setScenarioA((p) => ({
            ...p,
            irrigationType: normalizedIrrs[0].normalizedType,
          }));
          setScenarioB((p) => ({
            ...p,
            irrigationType:
              normalizedIrrs[1]?.normalizedType ||
              normalizedIrrs[0].normalizedType,
          }));
        }
      } catch {
        /* ignore */
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, []);

  const handleCompare = async () => {
    if (!cropId || !regionId) return;
    setError("");
    setLoading(true);
    setAiInsights("");
    try {
      const res = await compareScenarios({
        cropId,
        regionId,
        scenarioA,
        scenarioB,
      });
      const data = res.data.data;
      setResult(data);

      const sCrop = crops.find((c) => c._id === cropId);
      const sRegion = regions.find((r) => r._id === regionId);

      if (sCrop && sRegion) {
        fetchAiInsights(sCrop.name, sRegion.district, data);
      }
    } catch {
      setError("Comparison fetch nahi ho paaya. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsights = async (
    cName: string,
    rName: string,
    compData: any,
  ) => {
    setAiLoading(true);
    try {
      const sA = {
        landSize: scenarioA.landSize,
        irrigationType: formatIrrigationLabel(scenarioA.irrigationType),
        profitAtMSP: compData.scenarioA.profit.profitAtMSP,
        roiAtMSP: compData.scenarioA.profit.roiAtMSP,
      };

      const sB = {
        landSize: scenarioB.landSize,
        irrigationType: formatIrrigationLabel(scenarioB.irrigationType),
        profitAtMSP: compData.scenarioB.profit.profitAtMSP,
        roiAtMSP: compData.scenarioB.profit.roiAtMSP,
      };

      const { data } = await generateComparisonInsights({
        cropName: cName,
        regionName: rName,
        scenarioA: sA,
        scenarioB: sB,
        winner: compData.winner,
        profitDifference: compData.profitDifference,
      });
      setAiInsights(data.data.insights);
    } catch (err) {
      console.error("AI insights query failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const formatINR = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

  // 1. Categories
  const categoryOptions = categories.map((cat) => ({
    value: cat.name,
    label: cat.name,
  }));

  // 2. Crops
  const filteredCrops = categoryId
    ? crops.filter((c) => c.category === categoryId)
    : crops;
  const cropOptions = filteredCrops.map((crop) => ({
    value: crop._id,
    label: crop.name,
    cropObj: crop,
  }));

  const selectedCrop = crops.find((c) => c._id === cropId);
  const selectedRegion = regions.find((r) => r._id === regionId);
  const farmingTypeOptionsForRegion = selectedRegion?.supportedFarmingTypes
    ?.length
    ? FARMING_TYPE_OPTIONS.filter((opt) =>
        selectedRegion.supportedFarmingTypes?.includes(opt.value),
      )
    : FARMING_TYPE_OPTIONS;

  useEffect(() => {
    const fallback =
      (farmingTypeOptionsForRegion[0]
        ?.value as ScenarioConfig["farmingType"]) || "open_field";
    setScenarioA((prev) => ({
      ...prev,
      farmingType: farmingTypeOptionsForRegion.find(
        (ft) => ft.value === prev.farmingType,
      )
        ? prev.farmingType
        : fallback,
    }));
    setScenarioB((prev) => ({
      ...prev,
      farmingType: farmingTypeOptionsForRegion.find(
        (ft) => ft.value === prev.farmingType,
      )
        ? prev.farmingType
        : fallback,
    }));
  }, [regionId]);

  // 3. States
  const getValidRegionsForCrop = () => {
    if (!selectedCrop) return regions;
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

  // 4. Region
  const filteredRegions = stateId
    ? cropValidRegions.filter((r) => r.state === stateId)
    : cropValidRegions;
  const regionOptions = filteredRegions.map((r) => ({
    value: r._id,
    label: r.district,
  }));
  const irrigationOptions = irrigations.map((i) => ({
    value: i.normalizedType,
    label: i.typeName,
  }));

  const isSameScenario =
    scenarioA.landSize === scenarioB.landSize &&
    scenarioA.irrigationType === scenarioB.irrigationType &&
    scenarioA.farmingType === scenarioB.farmingType;

  const handleFindBestScenario = async () => {
    if (!cropId || !regionId || irrigationOptions.length === 0) return;
    setError("");
    setBestLoading(true);
    setBestScenarioByProfit(null);
    setBestScenarioByRoi(null);
    setBestCheckCount(0);

    try {
      const baseline = {
        landSize: 1,
        irrigationType: irrigationOptions[0].value,
        farmingType: "open_field" as const,
      };

      const snapshots: BestScenarioSnapshot[] = [];

      for (const irrigation of irrigationOptions) {
        for (const landSize of LAND_SIZE_PRESETS) {
          const response = await compareScenarios({
            cropId,
            regionId,
            scenarioA: baseline,
            scenarioB: {
              landSize,
              irrigationType: irrigation.value,
              farmingType: "open_field",
            },
          });

          const data = response.data.data;
          const s = data.scenarioB;
          snapshots.push({
            landSize,
            irrigationType: s.irrigationType,
            profit: s.profit.profitAtMSP,
            roi: s.profit.roiAtMSP,
            riskLevel: s.risk.riskLevel,
            confidence: s.confidence.overall,
          });
        }
      }

      const bestProfit = [...snapshots].sort((a, b) => b.profit - a.profit)[0];
      const bestRoi = [...snapshots].sort((a, b) => {
        if (b.roi !== a.roi) return b.roi - a.roi;
        return b.profit - a.profit;
      })[0];

      setBestScenarioByProfit(bestProfit || null);
      setBestScenarioByRoi(bestRoi || null);
      setBestCheckCount(snapshots.length);
    } catch {
      setError("Best scenario data-check fail hua. Please retry.");
    } finally {
      setBestLoading(false);
    }
  };

  // Auto-clear
  useEffect(() => {
    setCropId("");
    setRegionId("");
    setStateId("");
    setResult(null);
    setBestScenarioByProfit(null);
    setBestScenarioByRoi(null);
    setBestCheckCount(0);
    setError("");
  }, [categoryId]);

  useEffect(() => {
    setRegionId("");
    setStateId("");
    setResult(null);
    setBestScenarioByProfit(null);
    setBestScenarioByRoi(null);
    setBestCheckCount(0);
    setError("");
  }, [cropId]);

  useEffect(() => {
    setRegionId("");
    setResult(null);
    setBestScenarioByProfit(null);
    setBestScenarioByRoi(null);
    setBestCheckCount(0);
    setError("");
  }, [stateId]);

  if (dataLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading data...</p>
      </div>
    );
  }

  const chartData = result
    ? [
        {
          name: "Revenue",
          A: result.scenarioA.profit.revenueAtMSP,
          B: result.scenarioB.profit.revenueAtMSP,
        },
        {
          name: "Cost",
          A: result.scenarioA.cost.totalCost,
          B: result.scenarioB.cost.totalCost,
        },
        {
          name: "Profit",
          A: result.scenarioA.profit.profitAtMSP,
          B: result.scenarioB.profit.profitAtMSP,
        },
      ]
    : [];

  return (
    <main className="tools-page">
      <div className="container">
        <div className="tools-header">
          <h1>⚖️ Scenario Comparison Tool</h1>
          <p>
            Compare two farming strategies side-by-side to find the optimal
            approach.
          </p>
        </div>

        <div
          className="tools-controls"
          style={{ flexWrap: "wrap", alignItems: "flex-end" }}
        >
          <div className="form-group" style={{ flex: 1, minWidth: "150px" }}>
            <label>1. Category</label>
            <Select
              styles={customSelectStyles}
              {...selectOverlayProps}
              options={categoryOptions}
              placeholder="Category"
              value={
                categoryOptions.find((o) => o.value === categoryId) || null
              }
              onChange={(s) => setCategoryId(s?.value || "")}
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: "150px" }}>
            <label>2. Crop</label>
            <Select
              styles={customSelectStyles}
              {...selectOverlayProps}
              options={cropOptions}
              placeholder="Crop"
              isDisabled={!categoryId}
              isSearchable={true}
              formatOptionLabel={(option: any, meta: any) =>
                formatCropLabel(
                  option.cropObj,
                  meta.context === "value" ? "value" : "menu",
                )
              }
              value={cropOptions.find((o) => o.value === cropId) || null}
              onChange={(s) => setCropId(s?.value || "")}
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: "150px" }}>
            <label>3. State</label>
            <Select
              styles={customSelectStyles}
              {...selectOverlayProps}
              options={stateOptions}
              placeholder="State"
              isDisabled={!cropId}
              value={stateOptions.find((o) => o.value === stateId) || null}
              onChange={(s) => setStateId(s?.value || "")}
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: "150px" }}>
            <label>4. Region</label>
            <Select
              styles={customSelectStyles}
              {...selectOverlayProps}
              options={regionOptions}
              placeholder="District"
              isDisabled={!stateId}
              value={regionOptions.find((o) => o.value === regionId) || null}
              onChange={(s) => setRegionId(s?.value || "")}
            />
          </div>
        </div>

        {selectedCrop && selectedRegion && (
          <div className="compare-insight-bar">
            <span>
              Soil fit: {getSoilSuitabilityScore(selectedCrop, selectedRegion)}
              /100
            </span>
            <span>Rainfall: {selectedRegion.avgRainfallMM}mm</span>
            <span>
              Irrigation availability: {selectedRegion.irrigationAvailability}
            </span>
          </div>
        )}

        {/* Scenarios */}
        <div className="scenario-row">
          <div className="scenario-card scenario-a">
            <h3>🅰️ Scenario A</h3>
            <div className="form-group">
              <label>Land Size (acres)</label>
              <input
                type="number"
                className="form-control"
                value={scenarioA.landSize}
                onChange={(e) =>
                  setScenarioA((p) => ({
                    ...p,
                    landSize: Number(e.target.value),
                  }))
                }
                min="0.5"
                step="0.5"
              />
              <div className="land-size-presets">
                {LAND_SIZE_PRESETS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={
                      scenarioA.landSize === s
                        ? "land-preset-btn active"
                        : "land-preset-btn"
                    }
                    onClick={() => setScenarioA((p) => ({ ...p, landSize: s }))}
                  >
                    {s}A
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Irrigation</label>
              <Select
                styles={customSelectStyles}
                {...selectOverlayProps}
                options={irrigationOptions}
                value={
                  irrigationOptions.find(
                    (o) => o.value === scenarioA.irrigationType,
                  ) || null
                }
                onChange={(s) =>
                  setScenarioA((p) => ({
                    ...p,
                    irrigationType: s?.value || p.irrigationType,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>Farming Type</label>
              <Select
                styles={customSelectStyles}
                {...selectOverlayProps}
                options={farmingTypeOptionsForRegion}
                value={
                  farmingTypeOptionsForRegion.find(
                    (o) => o.value === scenarioA.farmingType,
                  ) || null
                }
                onChange={(s) =>
                  setScenarioA((p) => ({
                    ...p,
                    farmingType: (s?.value ||
                      p.farmingType) as ScenarioConfig["farmingType"],
                  }))
                }
              />
            </div>
          </div>

          <div className="scenario-vs">VS</div>

          <div className="scenario-card scenario-b">
            <h3>🅱️ Scenario B</h3>
            <div className="form-group">
              <label>Land Size (acres)</label>
              <input
                type="number"
                className="form-control"
                value={scenarioB.landSize}
                onChange={(e) =>
                  setScenarioB((p) => ({
                    ...p,
                    landSize: Number(e.target.value),
                  }))
                }
                min="0.5"
                step="0.5"
              />
              <div className="land-size-presets">
                {LAND_SIZE_PRESETS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={
                      scenarioB.landSize === s
                        ? "land-preset-btn active"
                        : "land-preset-btn"
                    }
                    onClick={() => setScenarioB((p) => ({ ...p, landSize: s }))}
                  >
                    {s}A
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Irrigation</label>
              <Select
                styles={customSelectStyles}
                {...selectOverlayProps}
                options={irrigationOptions}
                value={
                  irrigationOptions.find(
                    (o) => o.value === scenarioB.irrigationType,
                  ) || null
                }
                onChange={(s) =>
                  setScenarioB((p) => ({
                    ...p,
                    irrigationType: s?.value || p.irrigationType,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>Farming Type</label>
              <Select
                styles={customSelectStyles}
                {...selectOverlayProps}
                options={farmingTypeOptionsForRegion}
                value={
                  farmingTypeOptionsForRegion.find(
                    (o) => o.value === scenarioB.farmingType,
                  ) || null
                }
                onChange={(s) =>
                  setScenarioB((p) => ({
                    ...p,
                    farmingType: (s?.value ||
                      p.farmingType) as ScenarioConfig["farmingType"],
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div className="compare-actions-row">
          <button
            className="btn btn-secondary"
            onClick={handleFindBestScenario}
            disabled={!cropId || !regionId || bestLoading}
          >
            {bestLoading ? "Checking best..." : "🧪 Data Check: Best Scenario"}
          </button>
          {isSameScenario && (
            <span className="compare-warning">
              Scenario A aur B same hain, meaningful difference nahi aayega.
            </span>
          )}
        </div>

        {bestScenarioByProfit && bestScenarioByRoi && (
          <div className="best-scenario-panel">
            <div className="best-scenario-block">
              <h4>Best by Profit</h4>
              <p>
                {bestScenarioByProfit.landSize}A,{" "}
                {formatIrrigationLabel(bestScenarioByProfit.irrigationType)}
              </p>
              <small>
                Profit: {formatINR(bestScenarioByProfit.profit)} | ROI:{" "}
                {bestScenarioByProfit.roi}%
              </small>
            </div>
            <div className="best-scenario-block">
              <h4>Best by ROI</h4>
              <p>
                {bestScenarioByRoi.landSize}A,{" "}
                {formatIrrigationLabel(bestScenarioByRoi.irrigationType)}
              </p>
              <small>
                ROI: {bestScenarioByRoi.roi}% | Profit:{" "}
                {formatINR(bestScenarioByRoi.profit)}
              </small>
            </div>
            <div className="best-scenario-cta">
              <small>{bestCheckCount} scenarios checked</small>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  setScenarioB({
                    landSize: bestScenarioByProfit.landSize,
                    irrigationType: bestScenarioByProfit.irrigationType,
                    farmingType: "open_field",
                  })
                }
              >
                Apply to Scenario B
              </button>
            </div>
          </div>
        )}

        {error && <div className="recommendation-status error">{error}</div>}

        <div style={{ textAlign: "center", margin: "1.5rem 0" }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleCompare}
            disabled={!cropId || !regionId || loading || isSameScenario}
          >
            {loading ? "Comparing..." : "⚖️ Compare Scenarios"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="compare-results">
            <div className="compare-winner">
              <span className="winner-label">🏆 Winner:</span>
              <span className="winner-name">Scenario {result.winner}</span>
              <span className="winner-diff">
                by {formatINR(result.profitDifference)}
              </span>
            </div>

            {(aiLoading || aiInsights) && (
              <div style={{ marginBottom: "2rem" }}>
                <AIInsightsCard insights={aiInsights} isLoading={aiLoading} />
              </div>
            )}

            <div className="compare-chart">
              <h3>📊 Side-by-Side Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} barGap={8}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="name" stroke="#aaa" fontSize={12} />
                  <YAxis
                    stroke="#aaa"
                    fontSize={11}
                    tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a2e",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    formatter={(v: any) => formatINR(Number(v) || 0)}
                  />
                  <Legend />
                  <Bar
                    dataKey="A"
                    name="Scenario A"
                    fill="#06d6a0"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="B"
                    name="Scenario B"
                    fill="#118ab2"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="compare-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Scenario A</th>
                    <th>Scenario B</th>
                    <th>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Land Size</td>
                    <td>{result.scenarioA.landSize} acres</td>
                    <td>{result.scenarioB.landSize} acres</td>
                    <td>
                      {Math.abs(
                        result.scenarioA.landSize - result.scenarioB.landSize,
                      )}{" "}
                      acres
                    </td>
                  </tr>
                  <tr>
                    <td>Irrigation</td>
                    <td>
                      {formatIrrigationLabel(result.scenarioA.irrigationType)}
                    </td>
                    <td>
                      {formatIrrigationLabel(result.scenarioB.irrigationType)}
                    </td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>Farming Type</td>
                    <td>{result.scenarioA.farmingType || "open_field"}</td>
                    <td>{result.scenarioB.farmingType || "open_field"}</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>Total Yield (per cycle)</td>
                    <td>{result.scenarioA.yield.totalYield} qtl</td>
                    <td>{result.scenarioB.yield.totalYield} qtl</td>
                    <td>
                      {Math.abs(
                        result.scenarioA.yield.totalYield -
                          result.scenarioB.yield.totalYield,
                      ).toFixed(2)}{" "}
                      qtl
                    </td>
                  </tr>
                  <tr>
                    <td>Revenue (MSP)</td>
                    <td className="green">
                      {formatINR(result.scenarioA.profit.revenueAtMSP)}
                    </td>
                    <td className="green">
                      {formatINR(result.scenarioB.profit.revenueAtMSP)}
                    </td>
                    <td>
                      {formatINR(
                        Math.abs(
                          result.scenarioA.profit.revenueAtMSP -
                            result.scenarioB.profit.revenueAtMSP,
                        ),
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Total Cost</td>
                    <td className="red">
                      {formatINR(result.scenarioA.cost.totalCost)}
                    </td>
                    <td className="red">
                      {formatINR(result.scenarioB.cost.totalCost)}
                    </td>
                    <td>
                      {formatINR(
                        Math.abs(
                          result.scenarioA.cost.totalCost -
                            result.scenarioB.cost.totalCost,
                        ),
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Net Profit (per cycle)</strong>
                    </td>
                    <td
                      className={
                        result.scenarioA.profit.profitAtMSP >= 0
                          ? "green"
                          : "red"
                      }
                    >
                      <strong>
                        {formatINR(result.scenarioA.profit.profitAtMSP)}
                      </strong>
                    </td>
                    <td
                      className={
                        result.scenarioB.profit.profitAtMSP >= 0
                          ? "green"
                          : "red"
                      }
                    >
                      <strong>
                        {formatINR(result.scenarioB.profit.profitAtMSP)}
                      </strong>
                    </td>
                    <td>
                      <strong>{formatINR(result.profitDifference)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>ROI</td>
                    <td>{result.scenarioA.profit.roiAtMSP}%</td>
                    <td>{result.scenarioB.profit.roiAtMSP}%</td>
                    <td>
                      {Math.abs(
                        result.scenarioA.profit.roiAtMSP -
                          result.scenarioB.profit.roiAtMSP,
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                  <tr>
                    <td>Risk Level</td>
                    <td>
                      <span
                        className="verdict-badge"
                        style={{
                          background:
                            result.scenarioA.risk.riskLevel === "Low"
                              ? "#06d6a022"
                              : "#ffd16622",
                          color:
                            result.scenarioA.risk.riskLevel === "Low"
                              ? "#06d6a0"
                              : "#ffd166",
                        }}
                      >
                        {result.scenarioA.risk.riskLevel}
                      </span>
                    </td>
                    <td>
                      <span
                        className="verdict-badge"
                        style={{
                          background:
                            result.scenarioB.risk.riskLevel === "Low"
                              ? "#06d6a022"
                              : "#ffd16622",
                          color:
                            result.scenarioB.risk.riskLevel === "Low"
                              ? "#06d6a0"
                              : "#ffd166",
                        }}
                      >
                        {result.scenarioB.risk.riskLevel}
                      </span>
                    </td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>Confidence</td>
                    <td>{result.scenarioA.confidence.overall}%</td>
                    <td>{result.scenarioB.confidence.overall}%</td>
                    <td>
                      {Math.abs(
                        result.scenarioA.confidence.overall -
                          result.scenarioB.confidence.overall,
                      )}
                      %
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Compare;
