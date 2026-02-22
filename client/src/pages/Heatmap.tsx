import { useState, useEffect } from "react";
import { fetchCrops, fetchRegions, fetchHeatmap } from "../services/api";
import type { Crop, Region } from "../types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

interface HeatmapPoint {
  landSize: number;
  profit: number;
  revenue: number;
  cost: number;
  roi: number;
}

const COLORS_HEAT = [
  "#ef476f",
  "#ef476f",
  "#ffd166",
  "#ffd166",
  "#06d6a0",
  "#06d6a0",
  "#06d6a0",
  "#118ab2",
  "#118ab2",
];

const Heatmap: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cropId, setCropId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [irrigationType, setIrrigationType] = useState("drip");
  const [data, setData] = useState<HeatmapPoint[]>([]);
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

  const handleGenerate = async () => {
    if (!cropId || !regionId) return;
    setLoading(true);
    try {
      const res = await fetchHeatmap({ cropId, regionId, irrigationType });
      setData(res.data.data || []);
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

  const maxProfit =
    data.length > 0 ? Math.max(...data.map((d) => d.profit)) : 0;
  const optimalSize =
    data.length > 0
      ? data.reduce((best, d) => (d.roi > best.roi ? d : best), data[0])
      : null;

  return (
    <main className="tools-page">
      <div className="container">
        <div className="tools-header">
          <h1>🗺️ Profit Heatmap by Land Size</h1>
          <p>
            See how your profit scales across different land sizes. Find the
            sweet spot for maximum ROI.
          </p>
        </div>

        <div className="tools-controls" style={{ flexWrap: "wrap" }}>
          <div className="form-group" style={{ flex: 1, minWidth: "180px" }}>
            <label>Crop</label>
            <select
              className="form-control"
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
            >
              <option value="">-- Select --</option>
              {crops.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: "180px" }}>
            <label>Region</label>
            <select
              className="form-control"
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
            >
              <option value="">-- Select --</option>
              {regions.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.district}, {r.state}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ minWidth: "140px" }}>
            <label>Irrigation</label>
            <select
              className="form-control"
              value={irrigationType}
              onChange={(e) => setIrrigationType(e.target.value)}
            >
              <option value="drip">Drip</option>
              <option value="sprinkler">Sprinkler</option>
              <option value="canal">Canal</option>
              <option value="rainfed">Rainfed</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={!cropId || !regionId || loading}
            style={{ alignSelf: "flex-end" }}
          >
            {loading ? "Generating..." : "🗺️ Generate Heatmap"}
          </button>
        </div>

        {data.length > 0 && (
          <>
            {/* Optimal info */}
            {optimalSize && (
              <div className="heatmap-optimal">
                <span>
                  🎯 <strong>Best ROI:</strong> {optimalSize.landSize} acres —
                  ROI: {optimalSize.roi}% — Profit:{" "}
                  {formatINR(optimalSize.profit)}
                </span>
              </div>
            )}

            {/* Profit Area Chart */}
            <div className="result-card" style={{ marginBottom: "1.25rem" }}>
              <h3>📈 Profit vs Land Size</h3>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="landSize"
                    stroke="#aaa"
                    fontSize={12}
                    unit=" ac"
                  />
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
                    labelFormatter={(l) => `${l} acres`}
                  />
                  <defs>
                    <linearGradient
                      id="profitHeatGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#06d6a0" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06d6a0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#06d6a0"
                    fill="url(#profitHeatGrad)"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#06d6a0" }}
                    name="Profit"
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="#ef476f"
                    fill="none"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Cost"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* ROI Bar chart — heat-colored */}
            <div className="result-card" style={{ marginBottom: "1.25rem" }}>
              <h3>🔥 ROI Heatmap</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="landSize"
                    stroke="#aaa"
                    fontSize={12}
                    unit=" ac"
                  />
                  <YAxis stroke="#aaa" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a2e",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    formatter={(v: number) => `${v}%`}
                    labelFormatter={(l) => `${l} acres`}
                  />
                  <Bar dataKey="roi" radius={[6, 6, 0, 0]} name="ROI %">
                    {data.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS_HEAT[i % COLORS_HEAT.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Data table */}
            <div className="result-card">
              <h3>📋 Detailed Breakdown</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Land (ac)</th>
                    <th>Revenue</th>
                    <th>Cost</th>
                    <th>Profit</th>
                    <th>ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, i) => (
                    <tr
                      key={i}
                      style={
                        d.landSize === optimalSize?.landSize
                          ? { background: "rgba(6,214,160,0.08)" }
                          : {}
                      }
                    >
                      <td>{d.landSize}</td>
                      <td>{formatINR(d.revenue)}</td>
                      <td>{formatINR(d.cost)}</td>
                      <td className={d.profit >= 0 ? "green" : "red"}>
                        <strong>{formatINR(d.profit)}</strong>
                      </td>
                      <td>
                        {d.roi}%{d.landSize === optimalSize?.landSize && " ⭐"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Heatmap;
