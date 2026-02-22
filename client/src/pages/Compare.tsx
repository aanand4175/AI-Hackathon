import { useState, useEffect } from "react";
import Select from "react-select";
import {
  fetchCrops,
  fetchRegions,
  compareScenarios,
  fetchMasterCategories,
  fetchMasterIrrigations,
} from "../services/api";
import type { Crop, Region } from "../types";
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
}

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
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? "rgba(6, 214, 160, 0.2)" : "transparent",
    color: "#fff",
    cursor: "pointer",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  }),
  singleValue: (base: any) => ({ ...base, color: "#fff" }),
  input: (base: any) => ({ ...base, color: "#fff" }),
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
  });
  const [scenarioB, setScenarioB] = useState<ScenarioConfig>({
    landSize: 5,
    irrigationType: "drip",
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

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
        setIrrigations(activeIrrs);
        if (activeIrrs.length > 0) {
          setScenarioA((p) => ({
            ...p,
            irrigationType: activeIrrs[0].typeName,
          }));
          setScenarioB((p) => ({
            ...p,
            irrigationType: activeIrrs[1]?.typeName || activeIrrs[0].typeName,
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
    setLoading(true);
    try {
      const res = await compareScenarios({
        cropId,
        regionId,
        scenarioA,
        scenarioB,
      });
      setResult(res.data.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
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

  // 3. States
  const getValidRegionsForCrop = () => {
    if (!selectedCrop) return regions;
    return regions.filter((region) => {
      const suitability = selectedCrop.soilSuitability?.[region.soilType] || 0;
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

  // Auto-clear
  useEffect(() => {
    setCropId("");
    setRegionId("");
    setStateId("");
    setResult(null);
  }, [categoryId]);

  useEffect(() => {
    setRegionId("");
    setStateId("");
    setResult(null);
  }, [cropId]);

  useEffect(() => {
    setRegionId("");
    setResult(null);
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
              options={cropOptions}
              placeholder="Crop"
              isDisabled={!categoryId}
              isSearchable={true}
              formatOptionLabel={(option: any) =>
                formatCropLabel(option.cropObj)
              }
              value={cropOptions.find((o) => o.value === cropId) || null}
              onChange={(s) => setCropId(s?.value || "")}
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: "150px" }}>
            <label>3. State</label>
            <Select
              styles={customSelectStyles}
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
              options={regionOptions}
              placeholder="District"
              isDisabled={!stateId}
              value={regionOptions.find((o) => o.value === regionId) || null}
              onChange={(s) => setRegionId(s?.value || "")}
            />
          </div>
        </div>

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
                {[1, 2, 5, 10].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScenarioA((p) => ({ ...p, landSize: s }))}
                  >
                    {s}A
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Irrigation</label>
              <select
                className="form-control"
                value={scenarioA.irrigationType}
                onChange={(e) =>
                  setScenarioA((p) => ({
                    ...p,
                    irrigationType: e.target.value,
                  }))
                }
              >
                {irrigations.map((t) => (
                  <option key={t._id} value={t.typeName}>
                    {t.typeName}
                  </option>
                ))}
              </select>
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
                {[1, 2, 5, 10].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScenarioB((p) => ({ ...p, landSize: s }))}
                  >
                    {s}A
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Irrigation</label>
              <select
                className="form-control"
                value={scenarioB.irrigationType}
                onChange={(e) =>
                  setScenarioB((p) => ({
                    ...p,
                    irrigationType: e.target.value,
                  }))
                }
              >
                {irrigations.map((t) => (
                  <option key={t._id} value={t.typeName}>
                    {t.typeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", margin: "1.5rem 0" }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleCompare}
            disabled={!cropId || !regionId || loading}
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
                    <td>{result.scenarioA.irrigationType}</td>
                    <td>{result.scenarioB.irrigationType}</td>
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
