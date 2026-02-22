/**
 * Risk Scoring Engine
 * Evaluates risk factors based on crop type, region, and irrigation dependency.
 * Returns a risk score (1-10) and detailed risk factors.
 */

import type {
  ICrop,
  IRegion,
  IRiskFactorDetail,
  IRiskAssessment,
} from "../types";

/**
 * Calculate risk score and factors
 */
const calculateRiskScore = (
  crop: ICrop,
  region: IRegion,
  irrigationType: string,
): IRiskAssessment => {
  let riskScore: number = 0;
  const riskFactors: IRiskFactorDetail[] = [];

  // 1. Weather / Rainfall risk
  if (region.avgRainfallMM < 500) {
    riskScore += 2;
    riskFactors.push({
      factor: "Low Rainfall",
      severity: "High",
      description: `Region receives only ${region.avgRainfallMM}mm avg rainfall. Drought risk is significant.`,
      impact: 2,
    });
  } else if (region.avgRainfallMM < 800) {
    riskScore += 1;
    riskFactors.push({
      factor: "Moderate Rainfall",
      severity: "Medium",
      description: `Region receives ${region.avgRainfallMM}mm avg rainfall. Supplementary irrigation recommended.`,
      impact: 1,
    });
  }

  // 2. Irrigation dependency
  if (irrigationType === "rainfed") {
    riskScore += 2.5;
    riskFactors.push({
      factor: "Rainfed Dependency",
      severity: "High",
      description:
        "Completely dependent on rainfall. Yield highly variable year-to-year.",
      impact: 2.5,
    });
  } else if (irrigationType === "flood") {
    riskScore += 1;
    riskFactors.push({
      factor: "Flood Irrigation",
      severity: "Medium",
      description:
        "Flood irrigation is less efficient. Water wastage and soil salinity risks.",
      impact: 1,
    });
  }

  // 3. Crop water requirement vs irrigation
  if (
    crop.waterRequirement === "High" &&
    (irrigationType === "rainfed" || region.irrigationAvailability === "Poor")
  ) {
    riskScore += 2;
    riskFactors.push({
      factor: "Water Mismatch",
      severity: "High",
      description: `${crop.name} requires high water but irrigation availability is limited.`,
      impact: 2,
    });
  }

  // 4. Price volatility
  if (crop.category === "Cash Crop") {
    riskScore += 1.5;
    riskFactors.push({
      factor: "Price Volatility",
      severity: "Medium",
      description:
        "Cash crops are subject to market price fluctuations. MSP may not cover costs in bad years.",
      impact: 1.5,
    });
  } else if (crop.category === "Oilseed") {
    riskScore += 1;
    riskFactors.push({
      factor: "Import Competition",
      severity: "Medium",
      description:
        "Oilseed prices affected by international imports and global market trends.",
      impact: 1,
    });
  }

  // 5. Region-specific risk factors from DB
  if (region.riskFactors && region.riskFactors.length > 0) {
    region.riskFactors.forEach((rf) => {
      const severityScore: number =
        rf.severity === "High" ? 1.5 : rf.severity === "Medium" ? 1 : 0.5;
      riskScore += severityScore;
      riskFactors.push({
        factor: rf.factor,
        severity: rf.severity,
        description: rf.description,
        impact: severityScore,
      });
    });
  }

  // Cap risk score at 10
  riskScore = Math.min(Math.round(riskScore * 10) / 10, 10);

  // Determine risk level
  let riskLevel: "Low" | "Moderate" | "High";
  if (riskScore <= 3) riskLevel = "Low";
  else if (riskScore <= 6) riskLevel = "Moderate";
  else riskLevel = "High";

  return {
    riskScore,
    riskLevel,
    riskFactors,
    totalFactors: riskFactors.length,
  };
};

export { calculateRiskScore };
