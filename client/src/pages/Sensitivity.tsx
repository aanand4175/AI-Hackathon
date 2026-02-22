import { useState, useEffect } from "react";
import Select from "react-select";
import {
  fetchCrops,
  fetchRegions,
  fetchSensitivity,
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

const Sensitivity: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [irrigations, setIrrigations] = useState<any[]>([]);

  const [categoryId, setCategoryId] = useState("");
  const [cropId, setCropId] = useState("");
  const [stateId, setStateId] = useState("");
  const [regionId, setRegionId] = useState("");

  const [landSize, setLandSize] = useState(2);
  const [irrigationType, setIrrigationType] = useState("");

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
        if (activeIrrs.length > 0 && !irrigationType) {
          setIrrigationType(activeIrrs[0].typeName);
        }
      } catch {
        /* ignore */
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, []);

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
    setBaseResult(null);
    setAdjustedResult(null);
  }, [categoryId]);

  useEffect(() => {
    setRegionId("");
    setStateId("");
    setBaseResult(null);
    setAdjustedResult(null);
  }, [cropId]);

  useEffect(() => {
    setRegionId("");
    setBaseResult(null);
    setAdjustedResult(null);
  }, [stateId]);

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
            name: "Net Profit (per cycle)",
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
          style={{
            flexWrap: "wrap",
            marginBottom: "2rem",
            alignItems: "flex-end",
          }}
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

        {/* Second Row for Land Size & Irrigation */}
        <div
          className="tools-controls"
          style={{
            flexWrap: "wrap",
            marginBottom: "2rem",
            alignItems: "flex-end",
          }}
        >
          <div className="form-group" style={{ flex: 1, minWidth: "150px" }}>
            <label>Land (acres)</label>
            <input
              type="number"
              className="form-control"
              style={{ height: "45px" }}
              value={landSize}
              onChange={(e) => setLandSize(Number(e.target.value))}
              min="0.5"
              step="0.5"
            />
            <div className="land-size-presets">
              {[1, 2, 5, 10].map((s) => (
                <button key={s} type="button" onClick={() => setLandSize(s)}>
                  {s}A
                </button>
              ))}
            </div>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: "150px" }}>
            <label>Irrigation</label>
            <select
              className="form-control"
              style={{ height: "45px" }}
              value={irrigationType}
              onChange={(e) => setIrrigationType(e.target.value)}
            >
              {irrigations.map((t) => (
                <option key={t._id} value={t.typeName}>
                  {t.typeName}
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
                    Base Profit (per cycle)
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
                    Adjusted Profit (per cycle)
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
