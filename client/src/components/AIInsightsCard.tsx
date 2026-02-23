import React, { useState, useEffect } from "react";
import { Sparkles, AlertCircle } from "lucide-react";
import { generateAIInsights } from "../services/api";

interface AIInsightsCardProps {
  estimationData?: {
    cropName: string;
    regionName: string;
    totalCost: number;
    netProfit: number;
    profitMargin: number;
    risks: {
      weather: number;
      water: number;
      price: number;
      pest: number;
      infrastructure: number;
    };
  };
  insights?: string;
  isLoading?: boolean;
}

const AIInsightsCard: React.FC<AIInsightsCardProps> = ({
  estimationData,
  insights: propInsights,
  isLoading: propIsLoading,
}) => {
  const [internalInsights, setInternalInsights] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!estimationData) return;

    let isMounted = true;

    const fetchInsights = async () => {
      setInternalLoading(true);
      setError(null);
      try {
        const response = await generateAIInsights(estimationData);
        if (isMounted) {
          setInternalInsights(response.data.data.insights);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Could not generate AI insights at this time.",
          );
        }
      } finally {
        if (isMounted) {
          setInternalLoading(false);
        }
      }
    };

    fetchInsights();

    return () => {
      isMounted = false;
    };
  }, [estimationData]);

  // Use props if provided, otherwise fallback to internal state
  const currentInsights =
    propInsights !== undefined ? propInsights : internalInsights;
  const currentLoading =
    propIsLoading !== undefined ? propIsLoading : internalLoading;

  // Helper function to render basic markdown
  const renderMarkdownText = (text: string) => {
    // Basic substitution for bold (**text**)
    let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Basic substitution for newlines
    html = html.replace(/\n\n/g, "<br/><br/>");
    html = html.replace(/\n/g, "<br/>");
    // Basic substitution for stars bullet point
    html = html.replace(/\*\s+(.*?)<br\/>/g, "<li>$1</li>");
    // Handle inline lists
    html = html.replace(/<li>(.*?)<\/li>/g, "<ul><li>$1</li></ul>");
    html = html.replace(/<\/ul><ul>/g, ""); // Merge adjacent lists

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div
      className="card fade-in"
      style={{
        border: "1px solid var(--accent)",
        background: "rgba(16, 185, 129, 0.05)",
        marginTop: "1.5rem",
      }}
    >
      <div
        className="card-header"
        style={{ borderBottom: "1px solid rgba(16, 185, 129, 0.2)" }}
      >
        <h3
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--accent)",
          }}
        >
          <Sparkles size={20} />
          Krishi Mitra AI Insights
        </h3>
      </div>
      <div className="card-body" style={{ padding: "1rem" }}>
        {currentLoading ? (
          <div
            className="loading-state"
            style={{
              height: "100px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="spinner"></div>
            <p>Analyzing with Gemini AI...</p>
          </div>
        ) : error ? (
          <div
            className="error-state"
            style={{ padding: "1rem", color: "var(--error)" }}
          >
            <AlertCircle size={24} style={{ marginBottom: "0.5rem" }} />
            <p>{error}</p>
          </div>
        ) : (
          <div style={{ lineHeight: "1.6" }}>
            {currentInsights && renderMarkdownText(currentInsights)}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsCard;
