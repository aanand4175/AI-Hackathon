import { useLocation, useNavigate } from "react-router-dom";
import type { EstimateResult } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  AreaChart,
  Area,
} from "recharts";
// @ts-ignore
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";

const COLORS = [
  "#06d6a0",
  "#118ab2",
  "#ef476f",
  "#ffd166",
  "#073b4c",
  "#8338ec",
  "#ff6b6b",
  "#4ecdc4",
];

const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as EstimateResult | undefined;

  if (!result) {
    return (
      <div
        className="container"
        style={{ textAlign: "center", padding: "60px 20px" }}
      >
        <h2>No estimate data found</h2>
        <p>Please go back and fill out the estimator form.</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/estimator")}
        >
          Go to Estimator
        </button>
      </div>
    );
  }

  const {
    summary,
    yield: yld,
    cost,
    profit,
    risk,
    recommendation,
    confidence,
    waterMatch,
    pestPredictions,
    cropSuitability,
    cropRotation,
    govSchemes,
    costTips,
    multiYear,
    sensitivity,
    mspHistory,
    marketDemand,
  } = result;

  // Prepare chart data
  const costBreakdownData = Object.entries(cost.costBreakdown).map(
    ([key, val]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      perAcre: val.perAcre,
      total: val.total,
    }),
  );

  const revenueVsCostData = [
    { name: "Total Cost", value: profit.totalCost, fill: "#ef476f" },
    { name: "Revenue (MSP)", value: profit.revenueAtMSP, fill: "#06d6a0" },
    {
      name: "Revenue (Market)",
      value: profit.revenueAtMarket,
      fill: "#118ab2",
    },
  ];

  const suitabilityData = [
    { param: "Soil", score: cropSuitability.soilMatch },
    { param: "Rainfall", score: cropSuitability.rainfallMatch },
    { param: "Temperature", score: cropSuitability.temperatureMatch },
    { param: "Irrigation", score: cropSuitability.irrigationMatch },
    { param: "Pest Resist.", score: cropSuitability.pestResistance },
  ];

  const getRiskColor = (score: number) => {
    if (score <= 30) return "#06d6a0";
    if (score <= 60) return "#ffd166";
    return "#ef476f";
  };

  const getConfidenceColor = (label: string) => {
    if (label === "High") return "#06d6a0";
    if (label === "Medium") return "#ffd166";
    return "#ef476f";
  };

  const formatINR = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

  // PDF Export
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(6, 214, 160);
    doc.text("Farmer Profitability Report", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 30);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Summary", 14, 42);
    autoTable(doc, {
      startY: 46,
      head: [["Parameter", "Value"]],
      body: [
        ["Crop", `${summary.crop} (${summary.category})`],
        ["Region", summary.region],
        ["Land Size", summary.landSize],
        ["Irrigation", summary.irrigationType],
        ["Growth Duration", summary.growthDuration],
        ["Market Demand", marketDemand],
      ],
      theme: "striped",
    });

    doc.text("Yield & Profit", 14, (doc as any).lastAutoTable.finalY + 12);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 16,
      head: [["Metric", "Value"]],
      body: [
        ["Total Yield", `${yld.totalYield} quintals`],
        ["Revenue (MSP)", formatINR(profit.revenueAtMSP)],
        ["Revenue (Market)", formatINR(profit.revenueAtMarket)],
        ["Total Cost", formatINR(profit.totalCost)],
        ["Profit (MSP)", formatINR(profit.profitAtMSP)],
        ["Profit (Market)", formatINR(profit.profitAtMarket)],
        ["ROI (MSP)", `${profit.roiAtMSP}%`],
        ["ROI (Market)", `${profit.roiAtMarket}%`],
      ],
      theme: "striped",
    });

    doc.text("Risk Assessment", 14, (doc as any).lastAutoTable.finalY + 12);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 16,
      head: [["Risk Category", "Score", "Reason"]],
      body: risk.riskCategories.map((rc) => [
        rc.category,
        `${rc.score}%`,
        rc.reason,
      ]),
      theme: "striped",
    });

    doc.text(
      `Confidence: ${confidence.overall}% (${confidence.label})`,
      14,
      (doc as any).lastAutoTable.finalY + 12,
    );
    doc.text(
      `Verdict: ${recommendation.verdict}`,
      14,
      (doc as any).lastAutoTable.finalY + 20,
    );

    doc.addPage();
    doc.text("Cost Breakdown", 14, 22);
    autoTable(doc, {
      startY: 26,
      head: [["Item", "Per Acre (₹)", "Total (₹)"]],
      body: costBreakdownData.map((c) => [
        c.name,
        c.perAcre.toLocaleString(),
        c.total.toLocaleString(),
      ]),
      theme: "striped",
    });

    doc.text(
      "Sensitivity Analysis",
      14,
      (doc as any).lastAutoTable.finalY + 12,
    );
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 16,
      head: [["Scenario", "Original Profit", "New Profit", "Impact"]],
      body: sensitivity.map((s) => [
        s.label,
        formatINR(s.originalProfit),
        formatINR(s.newProfit),
        `${s.impactPercent > 0 ? "+" : ""}${s.impactPercent}%`,
      ]),
      theme: "striped",
    });

    if (govSchemes.length > 0) {
      doc.text(
        "Government Schemes",
        14,
        (doc as any).lastAutoTable.finalY + 12,
      );
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [["Scheme", "Type", "Benefit"]],
        body: govSchemes.map((g) => [g.name, g.schemeType, g.benefit]),
        theme: "striped",
      });
    }

    doc.text(
      `Crop Suitability: ${cropSuitability.overall}/100`,
      14,
      (doc as any).lastAutoTable.finalY + 12,
    );
    doc.text(
      `Water Match: ${waterMatch.matchPercent}% (${waterMatch.status})`,
      14,
      (doc as any).lastAutoTable.finalY + 20,
    );

    doc.save(`${summary.crop.replace(/[^a-zA-Z]/g, "_")}_Report.pdf`);
  };

  return (
    <div className="results-page">
      {/* Header */}
      <div className="results-header">
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <h1 style={{ margin: 0 }}>📊 {summary.crop}</h1>
              <p className="results-subtitle">
                {summary.region} • {summary.landSize} • {summary.irrigationType}{" "}
                irrigation
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="btn btn-outline"
                onClick={() => navigate("/estimator")}
              >
                ← New Estimate
              </button>
              <button className="btn btn-primary" onClick={downloadPDF}>
                📄 Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container results-grid">
        {/* Verdict Card */}
        <div
          className="result-card verdict-card"
          style={{ gridColumn: "1 / -1" }}
        >
          <div className="verdict-row">
            <div className="verdict-main">
              <span
                className={`verdict-badge ${recommendation.verdict === "Highly Recommended" ? "badge-green" : recommendation.verdict === "Not Recommended" ? "badge-red" : "badge-yellow"}`}
              >
                {recommendation.verdict}
              </span>
              <p style={{ marginTop: "8px", opacity: 0.85 }}>
                {recommendation.recommendation}
              </p>
            </div>
            <div className="confidence-meter">
              <div
                className="confidence-circle"
                style={{ borderColor: getConfidenceColor(confidence.label) }}
              >
                <span className="confidence-value">{confidence.overall}%</span>
                <span className="confidence-label">Confidence</span>
              </div>
            </div>
            <div className="suitability-meter">
              <div
                className="confidence-circle"
                style={{
                  borderColor:
                    cropSuitability.overall >= 70
                      ? "#06d6a0"
                      : cropSuitability.overall >= 45
                        ? "#ffd166"
                        : "#ef476f",
                }}
              >
                <span className="confidence-value">
                  {cropSuitability.overall}
                </span>
                <span className="confidence-label">Suitability</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profit Summary */}
        <div className="result-card">
          <h3>💰 Profit Summary</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Revenue (MSP)</span>
              <span className="stat-value green">
                {formatINR(profit.revenueAtMSP)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Revenue (Market)</span>
              <span className="stat-value blue">
                {formatINR(profit.revenueAtMarket)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Cost</span>
              <span className="stat-value red">
                {formatINR(profit.totalCost)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">
                Net Profit (MSP) <br /> (per cycle)
              </span>
              <span
                className={`stat-value ${profit.profitAtMSP >= 0 ? "green" : "red"}`}
              >
                {formatINR(profit.profitAtMSP)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">
                Net Profit (Market) <br /> (per cycle)
              </span>
              <span
                className={`stat-value ${profit.profitAtMarket >= 0 ? "green" : "red"}`}
              >
                {formatINR(profit.profitAtMarket)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">ROI (MSP)</span>
              <span className="stat-value">{profit.roiAtMSP}%</span>
            </div>
          </div>
        </div>

        {/* Yield Summary */}
        <div className="result-card">
          <h3>🌾 Yield Estimate</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Base Yield/Acre</span>
              <span className="stat-value">{yld.baseYieldPerAcre} qtl</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Region Multiplier</span>
              <span className="stat-value">×{yld.regionMultiplier}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Irrigation Boost</span>
              <span className="stat-value">×{yld.irrigationMultiplier}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Adjusted/Acre</span>
              <span className="stat-value">{yld.adjustedYieldPerAcre} qtl</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">
                Total Yield <br /> (per cycle)
              </span>
              <span className="stat-value green">
                {yld.totalYield} quintals
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Market Demand</span>
              <span
                className={`stat-value ${marketDemand === "High" ? "green" : marketDemand === "Low" ? "red" : ""}`}
              >
                {marketDemand}
              </span>
            </div>
          </div>
        </div>

        {/* Revenue vs Cost Chart */}
        <div className="result-card">
          <h3>📊 Revenue vs Cost</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueVsCostData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis dataKey="name" stroke="#aaa" fontSize={12} />
              <YAxis
                stroke="#aaa"
                fontSize={11}
                tickFormatter={(v: any) => `₹${(Number(v) / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: any) => formatINR(Number(v) || 0)}
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {revenueVsCostData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Breakdown Pie */}
        <div className="result-card">
          <h3>🧾 Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={costBreakdownData}
                dataKey="total"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }: any) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
                fontSize={11}
              >
                {costBreakdownData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: any) => formatINR(Number(v) || 0)}
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Analysis Table */}
        <div className="result-card">
          <h3>
            ⚠️ Risk Analysis{" "}
            <span
              className={`verdict-badge ${risk.riskLevel === "Low" ? "badge-green" : risk.riskLevel === "High" ? "badge-red" : "badge-yellow"}`}
              style={{ fontSize: "0.7em", marginLeft: "8px" }}
            >
              Score: {risk.riskScore}/10
            </span>
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Risk Category</th>
                <th>Score</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {risk.riskCategories.map((rc, i) => (
                <tr key={i}>
                  <td>{rc.category}</td>
                  <td>
                    <span className="risk-bar">
                      <span
                        className="risk-fill"
                        style={{
                          width: `${rc.score}%`,
                          background: getRiskColor(rc.score),
                        }}
                      ></span>
                      <span className="risk-text">{rc.score}%</span>
                    </span>
                  </td>
                  <td style={{ fontSize: "0.85em", opacity: 0.8 }}>
                    {rc.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Confidence Breakdown */}
        <div className="result-card">
          <h3>🎯 Confidence Breakdown</h3>
          <div className="confidence-bars">
            {Object.entries(confidence.breakdown).map(([key, val]) => (
              <div key={key} className="conf-bar-row">
                <span className="conf-label">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <div className="conf-bar-track">
                  <div
                    className="conf-bar-fill"
                    style={{
                      width: `${val}%`,
                      background:
                        val >= 70
                          ? "#06d6a0"
                          : val >= 45
                            ? "#ffd166"
                            : "#ef476f",
                    }}
                  ></div>
                </div>
                <span className="conf-val">{val}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Crop Suitability Radar */}
        <div className="result-card">
          <h3>🧬 Crop Suitability Score: {cropSuitability.overall}/100</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={suitabilityData}>
              <PolarGrid stroke="rgba(255,255,255,0.15)" />
              <PolarAngleAxis dataKey="param" stroke="#aaa" fontSize={12} />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                stroke="rgba(255,255,255,0.1)"
                fontSize={10}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#06d6a0"
                fill="#06d6a0"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Water Match */}
        <div className="result-card">
          <h3>💧 Water Requirement Match</h3>
          <div className="water-match">
            <div className="water-stat">
              <span className="stat-label">Crop Needs</span>
              <span className="stat-value">{waterMatch.cropWaterNeedMM}mm</span>
            </div>
            <div className="water-stat">
              <span className="stat-label">Available</span>
              <span className="stat-value">
                {waterMatch.regionWaterAvailableMM}mm
              </span>
            </div>
            <div className="water-stat">
              <span className="stat-label">Match</span>
              <span
                className={`stat-value ${waterMatch.matchPercent >= 80 ? "green" : waterMatch.matchPercent >= 50 ? "" : "red"}`}
              >
                {waterMatch.matchPercent}%
              </span>
            </div>
            <div className="water-stat">
              <span className="stat-label">Status</span>
              <span
                className={`verdict-badge ${waterMatch.status === "Surplus" || waterMatch.status === "Adequate" ? "badge-green" : waterMatch.status === "Deficit" ? "badge-yellow" : "badge-red"}`}
              >
                {waterMatch.status}
              </span>
            </div>
          </div>
          {waterMatch.deficitMM > 0 && (
            <p className="water-deficit-note">
              ⚠️ Water deficit of {waterMatch.deficitMM}mm — irrigation required
              to meet crop needs.
            </p>
          )}
        </div>

        {/* MSP Trend Chart */}
        {mspHistory.length > 0 && (
          <div className="result-card">
            <h3>📈 MSP Trend (5 Years)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mspHistory}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="year" stroke="#aaa" fontSize={12} />
                <YAxis
                  stroke="#aaa"
                  fontSize={11}
                  tickFormatter={(v: any) => `₹${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  formatter={(v: any) => `₹${v}`}
                />
                <Line
                  type="monotone"
                  dataKey="msp"
                  stroke="#06d6a0"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#06d6a0" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Multi-Year Projection */}
        <div className="result-card">
          <h3>📅 3-Year Profit Projection</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={multiYear}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis dataKey="year" stroke="#aaa" fontSize={12} />
              <YAxis
                stroke="#aaa"
                fontSize={11}
                tickFormatter={(v: any) => `₹${(Number(v) / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                formatter={(v: any) => formatINR(Number(v) || 0)}
              />
              <Area
                type="monotone"
                dataKey="projectedProfit"
                stroke="#118ab2"
                fill="url(#profitGrad)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#118ab2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#118ab2" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
          <table className="data-table" style={{ marginTop: "12px" }}>
            <thead>
              <tr>
                <th>Year</th>
                <th>MSP</th>
                <th>Cost</th>
                <th>Profit</th>
                <th>ROI</th>
              </tr>
            </thead>
            <tbody>
              {multiYear.map((y, i) => (
                <tr key={i}>
                  <td>{y.year}</td>
                  <td>₹{y.projectedMSP}</td>
                  <td>{formatINR(y.projectedCost)}</td>
                  <td className={y.projectedProfit >= 0 ? "green" : "red"}>
                    {formatINR(y.projectedProfit)}
                  </td>
                  <td>{y.projectedROI}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sensitivity Analysis */}
        <div className="result-card" style={{ gridColumn: "1 / -1" }}>
          <h3>🔄 Sensitivity Analysis — "What If?"</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Change</th>
                <th>Original Profit</th>
                <th>New Profit</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {sensitivity.map((s, i) => (
                <tr key={i}>
                  <td>{s.label}</td>
                  <td>{s.change}</td>
                  <td>{formatINR(s.originalProfit)}</td>
                  <td className={s.newProfit >= 0 ? "green" : "red"}>
                    {formatINR(s.newProfit)}
                  </td>
                  <td className={s.impactPercent >= 0 ? "green" : "red"}>
                    {s.impactPercent > 0 ? "+" : ""}
                    {s.impactPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pest Predictions */}
        {pestPredictions.length > 0 && (
          <div className="result-card">
            <h3>🐛 Disease & Pest Predictions</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pest/Disease</th>
                  <th>Probability</th>
                  <th>Severity</th>
                  <th>Season</th>
                </tr>
              </thead>
              <tbody>
                {pestPredictions.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td>
                      <span className="risk-bar">
                        <span
                          className="risk-fill"
                          style={{
                            width: `${p.probability}%`,
                            background: getRiskColor(p.probability),
                          }}
                        ></span>
                        <span className="risk-text">{p.probability}%</span>
                      </span>
                    </td>
                    <td>
                      <span
                        className={`verdict-badge ${p.severity === "Low" ? "badge-green" : p.severity === "High" ? "badge-red" : "badge-yellow"}`}
                      >
                        {p.severity}
                      </span>
                    </td>
                    <td>{p.season}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Crop Rotation */}
        {cropRotation.length > 0 && (
          <div className="result-card">
            <h3>🔄 Crop Rotation Suggestions</h3>
            <div className="rotation-list">
              {cropRotation.map((r, i) => (
                <div key={i} className="rotation-item">
                  <span className="rotation-crop">→ {r.nextCrop}</span>
                  <span className="rotation-benefit">{r.benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Government Schemes */}
        {govSchemes.length > 0 && (
          <div className="result-card">
            <h3>🏛️ Government Schemes Available</h3>
            <div className="scheme-list">
              {govSchemes.map((g, i) => (
                <div key={i} className="scheme-item">
                  <div className="scheme-header">
                    <span className="scheme-name">{g.name}</span>
                    <span className="scheme-type">{g.schemeType}</span>
                  </div>
                  <p className="scheme-desc">{g.description}</p>
                  <span className="scheme-benefit">✅ {g.benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost Tips */}
        {costTips.length > 0 && (
          <div className="result-card">
            <h3>💡 Cost Saving Tips</h3>
            <ul className="tips-list">
              {costTips.map((tip, i) => (
                <li key={i} className="tip-item">
                  💡 {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
