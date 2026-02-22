/**
 * Risk Scoring Engine (Enhanced)
 * Returns per-category risk percentages + overall score.
 */

import type {
  ICrop,
  IRegion,
  IRiskFactorDetail,
  IRiskCategoryScore,
  IRiskAssessment,
} from "../types";

const calculateRiskScore = (
  crop: ICrop,
  region: IRegion,
  irrigationType: string,
): IRiskAssessment => {
  let riskScore: number = 0;
  const riskFactors: IRiskFactorDetail[] = [];
  const categories: Record<string, { score: number; reason: string }> = {
    "Weather Risk": { score: 0, reason: "" },
    "Price Risk": { score: 0, reason: "" },
    "Pest Risk": { score: 0, reason: "" },
    "Water Risk": { score: 0, reason: "" },
    "Infrastructure Risk": { score: 0, reason: "" },
  };

  // 1. Weather / Rainfall risk
  if (region.avgRainfallMM < 500) {
    riskScore += 2;
    categories["Weather Risk"].score = 70;
    categories["Weather Risk"].reason =
      `Low rainfall (${region.avgRainfallMM}mm). Drought-prone region.`;
    riskFactors.push({
      factor: "Low Rainfall",
      severity: "High",
      description: `Region receives only ${region.avgRainfallMM}mm avg rainfall. Drought risk is significant.`,
      impact: 2,
    });
  } else if (region.avgRainfallMM < 800) {
    riskScore += 1;
    categories["Weather Risk"].score = 40;
    categories["Weather Risk"].reason =
      `Moderate rainfall (${region.avgRainfallMM}mm). Supplementary irrigation needed.`;
    riskFactors.push({
      factor: "Moderate Rainfall",
      severity: "Medium",
      description: `Region receives ${region.avgRainfallMM}mm avg rainfall. Supplementary irrigation recommended.`,
      impact: 1,
    });
  } else {
    categories["Weather Risk"].score = 15;
    categories["Weather Risk"].reason =
      `Good rainfall (${region.avgRainfallMM}mm). Generally favorable.`;
  }

  // 2. Irrigation dependency
  if (irrigationType === "rainfed") {
    riskScore += 2.5;
    categories["Water Risk"].score = 80;
    categories["Water Risk"].reason =
      "Completely rainfed. High yield variability.";
    riskFactors.push({
      factor: "Rainfed Dependency",
      severity: "High",
      description:
        "Completely dependent on rainfall. Yield highly variable year-to-year.",
      impact: 2.5,
    });
  } else if (irrigationType === "flood") {
    riskScore += 1;
    categories["Water Risk"].score = 45;
    categories["Water Risk"].reason =
      "Flood irrigation — water wastage and salinity risks.";
    riskFactors.push({
      factor: "Flood Irrigation",
      severity: "Medium",
      description:
        "Flood irrigation is less efficient. Water wastage and soil salinity risks.",
      impact: 1,
    });
  } else {
    categories["Water Risk"].score = 20;
    categories["Water Risk"].reason = "Good irrigation method. Low water risk.";
  }

  // 3. Crop water requirement vs irrigation
  if (
    crop.waterRequirement === "High" &&
    (irrigationType === "rainfed" || region.irrigationAvailability === "Poor")
  ) {
    riskScore += 2;
    categories["Water Risk"].score = Math.max(
      categories["Water Risk"].score,
      75,
    );
    categories["Water Risk"].reason =
      `${crop.name} needs high water but availability is limited.`;
    riskFactors.push({
      factor: "Water Mismatch",
      severity: "High",
      description: `${crop.name} requires high water but irrigation availability is limited.`,
      impact: 2,
    });
  }

  // 4. Price volatility
  if (crop.category === "Cash Crop" || crop.category === "Horticulture") {
    riskScore += 1.5;
    categories["Price Risk"].score = 55;
    categories["Price Risk"].reason =
      `${crop.category} prices fluctuate with market conditions.`;
    riskFactors.push({
      factor: "Price Volatility",
      severity: "Medium",
      description: `${crop.category}s are subject to market price fluctuations.`,
      impact: 1.5,
    });
  } else if (crop.category === "Oilseed") {
    riskScore += 1;
    categories["Price Risk"].score = 40;
    categories["Price Risk"].reason =
      "Oilseed prices affected by international imports.";
    riskFactors.push({
      factor: "Import Competition",
      severity: "Medium",
      description:
        "Oilseed prices affected by international imports and global market trends.",
      impact: 1,
    });
  } else {
    categories["Price Risk"].score = 20;
    categories["Price Risk"].reason =
      "Stable MSP-backed crop with low price risk.";
  }

  // 5. Pest risk from crop data
  if (crop.pestRules && crop.pestRules.length > 0) {
    const avgPestProb =
      crop.pestRules.reduce((s, p) => s + p.probability, 0) /
      crop.pestRules.length;
    categories["Pest Risk"].score = Math.round(avgPestProb);
    categories["Pest Risk"].reason =
      `${crop.pestRules.length} known pest/disease threats for ${crop.name}.`;
    const highPest = crop.pestRules.filter((p) => p.probability > 40);
    if (highPest.length > 0) {
      riskScore += 1.5;
      riskFactors.push({
        factor: "High Pest Probability",
        severity: "High",
        description: `${highPest.length} pests with >40% attack probability.`,
        impact: 1.5,
      });
    }
  } else {
    categories["Pest Risk"].score = 15;
    categories["Pest Risk"].reason = "Low pest risk for this crop.";
  }

  // 6. Region-specific risk factors from DB
  if (region.riskFactors && region.riskFactors.length > 0) {
    region.riskFactors.forEach((rf) => {
      const severityScore: number =
        rf.severity === "High" ? 1.5 : rf.severity === "Medium" ? 1 : 0.5;
      riskScore += severityScore;
      if (rf.factor.includes("Infrastructure") || rf.factor.includes("Poor")) {
        categories["Infrastructure Risk"].score = Math.max(
          categories["Infrastructure Risk"].score,
          rf.severity === "High" ? 65 : 40,
        );
        categories["Infrastructure Risk"].reason = rf.description;
      }
      riskFactors.push({
        factor: rf.factor,
        severity: rf.severity,
        description: rf.description,
        impact: severityScore,
      });
    });
  }
  if (categories["Infrastructure Risk"].score === 0) {
    categories["Infrastructure Risk"].score = 10;
    categories["Infrastructure Risk"].reason =
      "Adequate infrastructure in the region.";
  }

  riskScore = Math.min(Math.round(riskScore * 10) / 10, 10);

  let riskLevel: "Low" | "Moderate" | "High";
  if (riskScore <= 3) riskLevel = "Low";
  else if (riskScore <= 6) riskLevel = "Moderate";
  else riskLevel = "High";

  const riskCategories: IRiskCategoryScore[] = Object.entries(categories).map(
    ([cat, data]) => ({
      category: cat,
      score: data.score,
      reason: data.reason,
    }),
  );

  return {
    riskScore,
    riskLevel,
    riskFactors,
    riskCategories,
    totalFactors: riskFactors.length,
  };
};

export { calculateRiskScore };
