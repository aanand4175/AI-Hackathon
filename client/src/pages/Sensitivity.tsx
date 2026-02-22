import { useState, useEffect } from "react";
import { fetchCrops, fetchRegions, fetchSensitivity } from "../services/api";
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

const IRRIGATION_TYPES = [
  { value: "canal", label: "Canal" },
  { value: "tubewell", label: "Tubewell" },
  { value: "borewell", label: "Borewell" },
  { value: "drip", label: "Drip" },
  { value: "sprinkler", label: "Sprinkler" },
  { value: "rainfed", label: "Rainfed" },
  { value: "flood", label: "Flood" },
];

const Sensitivity: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cropId, setCropId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [landSize, setLandSize] = useState(2);
  const [irrigationType, setIrrigationType] = useState("drip");

  // Variations (Sliders from -50 to +50)
  const [priceVariation, setPriceVariation] = useState(0);
  const [yieldVariation, setYieldVariation] = useState(0);
  const [costVariation, setCostVariation] = useState(0);

  const [baseResult, setBaseResult] = useState<any>(null);
  const [adjustedResult, setAdjustedResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Load initial crops & regions
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

  // Fetch Base Sensitivity (0 variations) when parameters change
  useEffect(() => {
    if (!cropId || !regionId) return;
    const fetchBase = async () => {
      setLoading(true);
      try {
        const res = await fetchSensitivity({
          cropId,
          regionId,
          landSize,
          irrigationType,
          priceVariation: 0,
          yieldVariation: 0,
          costVariation: 0,
        });
        setBaseResult(res.data.data);
        setAdjustedResult(res.data.data); // Initialize adjusted with base
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchBase();
  }, [cropId, regionId, landSize, irrigationType]);

  // Fetch Adjusted Sensitivity when sliders change (Debounced)
  useEffect(() => {
    if (!cropId || !regionId) return;

    // Default to 0 values if nothing moved to avoid unnecessary calls initially
    if (
      priceVariation === 0 &&
      yieldVariation === 0 &&
      costVariation === 0 &&
      baseResult
    ) {
      setAdjustedResult(baseResult);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetchSensitivity({
          cropId,
          regionId,
          landSize,
          irrigationType,
          priceVariation,
          yieldVariation,
          costVariation,
        });
        setAdjustedResult(res.data.data);
      } catch {
        /* ignore */
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [
    priceVariation,
    yieldVariation,
    costVariation,
    cropId,
    regionId,
    landSize,
    irrigationType,
    baseResult,
  ]);

  const formatINR = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

  if (dataLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading sensitivity tools...</p>
      </div>
    );
  }

  const chartData =
    baseResult && adjustedResult
      ? [
          {
            name: "Revenue",
            Base: baseResult.profit.revenueAtMSP,
            Adjusted: adjustedResult.profit.revenueAtMSP,
          },
          {
            name: "Cost",
            Base: baseResult.adjustedCost,
            Adjusted: adjustedResult.adjustedCost,
          },
          {
            name: "Net Profit",
            Base: baseResult.profit.profitAtMSP,
            Adjusted: adjustedResult.profit.profitAtMSP,
          },
        ]
      : [];

  return (
    <main className="tools-page">
      <div className="container">
        <div className="tools-header">
          <h1>🎛️ Profit Sensitivity Analysis</h1>
          <p>
            Use the sliders below to see how changes in price, yield, and costs
            affect your bottom line in real-time.
          </p>
        </div>

        {/* Configuration Row */}
        <div
          className="tools-controls"
          style={{ flexWrap: "wrap", marginBottom: "2rem" }}
        >
          <div className="form-group" style={{ flex: 1, minWidth: "150px" }}>
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
          <div className="form-group" style={{ flex: 1, minWidth: "150px" }}>
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
          <div className="form-group" style={{ flex: 1, minWidth: "100px" }}>
            <label>Land (acres)</label>
            <input
              type="number"
              className="form-control"
              value={landSize}
              onChange={(e) => setLandSize(Number(e.target.value))}
              min="0.5"
              step="0.5"
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: "150px" }}>
            <label>Irrigation</label>
            <select
              className="form-control"
              value={irrigationType}
              onChange={(e) => setIrrigationType(e.target.value)}
            >
              {IRRIGATION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!baseResult && !loading && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
            }}
          >
            <p>Please select a Crop and Region to begin analysis.</p>
          </div>
        )}

        {loading && !baseResult && (
          <div className="spinner" style={{ margin: "2rem auto" }}></div>
        )}

        {/* Sliders & Results Row */}
        {baseResult && adjustedResult && (
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {/* Sliders Column */}
            <div
              style={{
                flex: 1,
                minWidth: "300px",
                background: "rgba(255,255,255,0.05)",
                padding: "2rem",
                borderRadius: "16px",
              }}
            >
              <h3 style={{ marginBottom: "1.5rem", color: "var(--blue-400)" }}>
                Adjust Parameters
              </h3>

              <div className="slider-group" style={{ marginBottom: "2rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <label>Price Variation</label>
                  <span
                    className={
                      priceVariation > 0
                        ? "text-green"
                        : priceVariation < 0
                          ? "text-red"
                          : ""
                    }
                  >
                    {priceVariation > 0 ? "+" : ""}
                    {priceVariation}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={priceVariation}
                  onChange={(e) => setPriceVariation(Number(e.target.value))}
                  style={{ width: "100%", cursor: "pointer" }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    color: "#888",
                    marginTop: "0.3rem",
                  }}
                >
                  <span>-50%</span>
                  <span>0%</span>
                  <span>+50%</span>
                </div>
              </div>

              <div className="slider-group" style={{ marginBottom: "2rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <label>Yield Variation</label>
                  <span
                    className={
                      yieldVariation > 0
                        ? "text-green"
                        : yieldVariation < 0
                          ? "text-red"
                          : ""
                    }
                  >
                    {yieldVariation > 0 ? "+" : ""}
                    {yieldVariation}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={yieldVariation}
                  onChange={(e) => setYieldVariation(Number(e.target.value))}
                  style={{ width: "100%", cursor: "pointer" }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    color: "#888",
                    marginTop: "0.3rem",
                  }}
                >
                  <span>-50%</span>
                  <span>0%</span>
                  <span>+50%</span>
                </div>
              </div>

              <div className="slider-group">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <label>Cost Variation</label>
                  <span
                    className={
                      costVariation > 0
                        ? "text-red"
                        : costVariation < 0
                          ? "text-green"
                          : ""
                    }
                  >
                    {costVariation > 0 ? "+" : ""}
                    {costVariation}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={costVariation}
                  onChange={(e) => setCostVariation(Number(e.target.value))}
                  style={{ width: "100%", cursor: "pointer" }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    color: "#888",
                    marginTop: "0.3rem",
                  }}
                >
                  <span>-50%</span>
                  <span>0%</span>
                  <span>+50%</span>
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#aaa",
                    marginTop: "1rem",
                  }}
                >
                  * Positive cost variation means costs increased (bad for
                  profit).
                </p>
              </div>

              <button
                className="btn btn-secondary"
                style={{ width: "100%", marginTop: "2rem" }}
                onClick={() => {
                  setPriceVariation(0);
                  setYieldVariation(0);
                  setCostVariation(0);
                }}
              >
                Reset Sliders
              </button>
            </div>

            {/* Chart & Metrics Column */}
            <div style={{ flex: 2, minWidth: "350px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                <div
                  className="stat-card"
                  style={{ background: "var(--bg-card)" }}
                >
                  <h4 style={{ color: "#aaa", fontSize: "0.9rem" }}>
                    Base Profit
                  </h4>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      margin: "0.5rem 0",
                    }}
                  >
                    {formatINR(baseResult.profit.profitAtMSP)}
                  </div>
                  <div
                    style={{ fontSize: "0.9rem", color: "var(--green-400)" }}
                  >
                    ROI: {baseResult.profit.roiAtMSP}%
                  </div>
                </div>

                <div
                  className="stat-card"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--blue-400)",
                  }}
                >
                  <h4 style={{ color: "#aaa", fontSize: "0.9rem" }}>
                    Adjusted Profit
                  </h4>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      margin: "0.5rem 0",
                      color:
                        adjustedResult.profit.profitAtMSP >= 0
                          ? "var(--green-400)"
                          : "var(--red-400)",
                    }}
                  >
                    {formatINR(adjustedResult.profit.profitAtMSP)}
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color:
                        adjustedResult.profit.roiAtMSP >= 0
                          ? "var(--green-400)"
                          : "var(--red-400)",
                    }}
                  >
                    ROI: {adjustedResult.profit.roiAtMSP}%
                  </div>
                </div>

                <div
                  className="stat-card"
                  style={{ background: "var(--bg-card)" }}
                >
                  <h4 style={{ color: "#aaa", fontSize: "0.9rem" }}>
                    Difference
                  </h4>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      margin: "0.5rem 0",
                    }}
                  >
                    {(() => {
                      const diff =
                        adjustedResult.profit.profitAtMSP -
                        baseResult.profit.profitAtMSP;
                      return (
                        <span
                          className={
                            diff > 0 ? "text-green" : diff < 0 ? "text-red" : ""
                          }
                        >
                          {diff > 0 ? "+" : ""}
                          {formatINR(diff)}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div
                style={{
                  background: "var(--bg-card)",
                  padding: "1.5rem",
                  borderRadius: "16px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "1rem",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Impact Visualization
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData} barGap={12}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis dataKey="name" stroke="#aaa" fontSize={12} />
                    <YAxis
                      stroke="#aaa"
                      fontSize={11}
                      tickFormatter={(v: number) =>
                        `₹${(v / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a2e",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      formatter={(v: any) => formatINR(Number(v) || 0)}
                    />
                    <Legend />
                    <Bar dataKey="Base" fill="#888" radius={[4, 4, 0, 0]} />
                    <Bar
                      dataKey="Adjusted"
                      fill="#4dabf7"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Sensitivity;
