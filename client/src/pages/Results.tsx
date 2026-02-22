import { useLocation, useNavigate, Link } from "react-router-dom";
import type { EstimateResult } from "../types";

const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const estimate = (location.state as { estimate?: EstimateResult })?.estimate;

  if (!estimate) {
    return (
      <div className="error-container">
        <div className="error-icon">📊</div>
        <h2>No Estimate Data</h2>
        <p>Please use the estimator form to generate a profitability report.</p>
        <Link to="/estimator" className="btn btn-primary">
          Go to Estimator
        </Link>
      </div>
    );
  }

  const {
    summary,
    yield: yieldData,
    cost,
    profit,
    risk,
    recommendation,
  } = estimate;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getVerdictClass = (): string => {
    if (recommendation.verdict === "Highly Recommended") return "positive";
    if (recommendation.verdict === "Not Recommended") return "negative";
    return "warning";
  };

  const maxPrice: number = Math.max(
    profit.mspPerQuintal,
    profit.marketPricePerQuintal,
  );

  return (
    <main className="results-page">
      <div className="results-header">
        <h1>Profitability Report</h1>
        <p>
          Detailed analysis for {summary.crop} in {summary.region}
        </p>
      </div>

      {/* Summary Info */}
      <div className="info-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="info-item">
          <div className="info-label">Crop</div>
          <div className="info-value">{summary.crop}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Region</div>
          <div className="info-value">{summary.region}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Land Size</div>
          <div className="info-value">{summary.landSize}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Irrigation</div>
          <div className="info-value" style={{ textTransform: "capitalize" }}>
            {summary.irrigationType}
          </div>
        </div>
        <div className="info-item">
          <div className="info-label">Growth Period</div>
          <div className="info-value">{summary.growthDuration}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Category</div>
          <div className="info-value">{summary.category}</div>
        </div>
      </div>

      {/* Main Profit Card */}
      <div
        className={`summary-card ${profit.isProfitableAtMSP ? "profit" : "loss"}`}
      >
        <div className={`verdict-badge ${getVerdictClass()}`}>
          {recommendation.verdict === "Highly Recommended" && "✅"}
          {recommendation.verdict === "Not Recommended" && "❌"}
          {!["Highly Recommended", "Not Recommended"].includes(
            recommendation.verdict,
          ) && "⚠️"}{" "}
          {recommendation.verdict}
        </div>

        <div
          className={`profit-amount ${profit.profitAtMSP >= 0 ? "positive" : "negative"}`}
        >
          {profit.profitAtMSP >= 0 ? "+" : ""}
          {formatCurrency(profit.profitAtMSP)}
        </div>
        <div className="profit-label">
          Net Profit/Loss at MSP (Government Rate)
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">Total Revenue (MSP)</div>
            <div className="stat-value green">
              {formatCurrency(profit.revenueAtMSP)}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Total Revenue (Market)</div>
            <div className="stat-value blue">
              {formatCurrency(profit.revenueAtMarket)}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Total Cost</div>
            <div className="stat-value red">
              {formatCurrency(profit.totalCost)}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">ROI at MSP</div>
            <div
              className={`stat-value ${profit.roiAtMSP >= 0 ? "green" : "red"}`}
            >
              {profit.roiAtMSP >= 0 ? "+" : ""}
              {profit.roiAtMSP}%
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Market Profit</div>
            <div
              className={`stat-value ${profit.profitAtMarket >= 0 ? "green" : "red"}`}
            >
              {profit.profitAtMarket >= 0 ? "+" : ""}
              {formatCurrency(profit.profitAtMarket)}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Expected Yield</div>
            <div className="stat-value">{yieldData.totalYield} qtl</div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="details-grid">
        {/* Cost Breakdown */}
        <div className="detail-card">
          <h3>💸 Cost Breakdown</h3>
          <table className="cost-table">
            <tbody>
              {Object.entries(cost.costBreakdown).map(([key, val]) => (
                <tr key={key}>
                  <td style={{ textTransform: "capitalize" }}>{key}</td>
                  <td>{formatCurrency(val.total)}</td>
                </tr>
              ))}
              <tr className="total">
                <td>Total Cost</td>
                <td>{formatCurrency(cost.totalCost)}</td>
              </tr>
            </tbody>
          </table>
          <p className="form-hint" style={{ marginTop: "0.75rem" }}>
            Cost per acre: {formatCurrency(cost.totalPerAcre)}
          </p>
        </div>

        {/* MSP vs Market Price */}
        <div className="detail-card">
          <h3>📊 Price Comparison</h3>

          <div className="price-bar">
            <div className="price-bar-label">
              <span>MSP (Govt Rate)</span>
              <span style={{ color: "var(--green-400)" }}>
                ₹{profit.mspPerQuintal}/qtl
              </span>
            </div>
            <div className="price-bar-track">
              <div
                className="price-bar-fill green"
                style={{ width: `${(profit.mspPerQuintal / maxPrice) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="price-bar">
            <div className="price-bar-label">
              <span>Market Price</span>
              <span style={{ color: "var(--blue-400)" }}>
                ₹{profit.marketPricePerQuintal}/qtl
              </span>
            </div>
            <div className="price-bar-track">
              <div
                className="price-bar-fill blue"
                style={{
                  width: `${(profit.marketPricePerQuintal / maxPrice) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              background: "var(--bg-glass)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
            }}
          >
            <p style={{ color: "var(--text-secondary)" }}>
              Market price is{" "}
              <strong
                style={{
                  color:
                    profit.priceDifference >= 0
                      ? "var(--green-400)"
                      : "var(--red-400)",
                }}
              >
                {profit.priceDifference >= 0 ? "+" : ""}₹
                {profit.priceDifference}
              </strong>{" "}
              ({profit.priceDifferencePercent}%) compared to MSP
            </p>
          </div>

          {/* Yield Info */}
          <div style={{ marginTop: "1rem" }}>
            <h4
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              🌾 Yield Details
            </h4>
            <table className="cost-table">
              <tbody>
                <tr>
                  <td>Base Yield/Acre</td>
                  <td>{yieldData.baseYieldPerAcre} qtl</td>
                </tr>
                <tr>
                  <td>Region Multiplier</td>
                  <td>×{yieldData.regionMultiplier}</td>
                </tr>
                <tr>
                  <td>Irrigation Multiplier</td>
                  <td>×{yieldData.irrigationMultiplier}</td>
                </tr>
                <tr>
                  <td>Adjusted Yield/Acre</td>
                  <td>{yieldData.adjustedYieldPerAcre} qtl</td>
                </tr>
                <tr className="total">
                  <td>Total Yield</td>
                  <td>{yieldData.totalYield} qtl</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="risk-card">
        <div className="risk-header">
          <h3>⚠️ Risk Assessment</h3>
          <div className={`risk-score-circle ${risk.riskLevel.toLowerCase()}`}>
            {risk.riskScore}
          </div>
        </div>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        >
          Risk Level:{" "}
          <strong
            style={{
              color:
                risk.riskLevel === "Low"
                  ? "var(--green-400)"
                  : risk.riskLevel === "Moderate"
                    ? "var(--amber-400)"
                    : "var(--red-400)",
            }}
          >
            {risk.riskLevel}
          </strong>{" "}
          — {risk.totalFactors} risk factor{risk.totalFactors !== 1 ? "s" : ""}{" "}
          identified
        </p>

        {risk.riskFactors.length > 0 && (
          <div className="risk-factors-list">
            {risk.riskFactors.map((rf, index) => (
              <div className="risk-factor-item" key={index}>
                <div
                  className={`risk-factor-severity ${rf.severity.toLowerCase()}`}
                ></div>
                <div className="risk-factor-content">
                  <h4>
                    {rf.factor}{" "}
                    <span
                      style={{
                        fontWeight: 400,
                        color: "var(--text-muted)",
                        fontSize: "0.8rem",
                      }}
                    >
                      ({rf.severity})
                    </span>
                  </h4>
                  <p>{rf.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendation */}
      <div className="recommendation-card">
        <h3>💡 Recommendation</h3>
        <p className="recommendation-text">{recommendation.recommendation}</p>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginTop: "2rem",
          marginBottom: "2rem",
        }}
      >
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/estimator")}
        >
          ← New Estimate
        </button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          🖨️ Print Report
        </button>
      </div>
    </main>
  );
};

export default Results;
