import { useState, useEffect } from "react";
import { fetchCrops, fetchRegions, compareScenarios } from "../services/api";
import type { Crop, Region } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

interface ScenarioConfig {
  landSize: number;
  irrigationType: string;
}

const IRRIGATION_TYPES = [
  { value: "canal", label: "Canal" },
  { value: "tubewell", label: "Tubewell" },
  { value: "borewell", label: "Borewell" },
  { value: "drip", label: "Drip" },
  { value: "sprinkler", label: "Sprinkler" },
  { value: "rainfed", label: "Rainfed" },
  { value: "flood", label: "Flood" },
];

const Compare: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cropId, setCropId] = useState("");
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
        const [c, r] = await Promise.all([fetchCrops(), fetchRegions()]);
        setCrops(c.data.data || []);
        setRegions(r.data.data || []);
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

        <div className="tools-controls" style={{ flexWrap: "wrap" }}>
          <div className="form-group" style={{ flex: 1, minWidth: "200px" }}>
            <label>Crop</label>
            <select
              className="form-control"
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
            >
              <option value="">-- Select crop --</option>
              {crops.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: "200px" }}>
            <label>Region</label>
            <select
              className="form-control"
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
            >
              <option value="">-- Select region --</option>
              {regions.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.district}, {r.state}
                </option>
              ))}
            </select>
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
                {IRRIGATION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
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
                {IRRIGATION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
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
                    formatter={(v: number) => formatINR(v)}
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
                    <td>Total Yield</td>
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
                      <strong>Net Profit</strong>
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
