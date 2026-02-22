/**
 * Advanced Calculation Engines
 * Confidence Score, Water Match, Crop Suitability, Multi-Year Projection, Sensitivity Analysis
 */

import type {
  ICrop,
  IRegion,
  IConfidenceScore,
  IWaterMatch,
  ICropSuitability,
  IYearProjection,
  ISensitivityResult,
  IPestPrediction,
  IProfitEstimate,
  IRiskAssessment,
} from "../types";

const normalizeSoilKey = (soilType: string): string =>
  soilType.toLowerCase().replace(/[^a-z]/g, "");

const getSoilSuitabilityScore = (crop: ICrop, regionSoilType: string): number => {
  const soilSuit = crop.soilSuitability as unknown as Record<string, number>;
  if (!soilSuit || Object.keys(soilSuit).length === 0) return 50;

  if (typeof soilSuit[regionSoilType] === "number") return soilSuit[regionSoilType];

  const normalizedRegionSoil = normalizeSoilKey(regionSoilType);

  for (const [soilName, score] of Object.entries(soilSuit)) {
    if (normalizeSoilKey(soilName) === normalizedRegionSoil) return score;
  }

  const candidateScores: number[] = [];

  if (normalizedRegionSoil.includes("black") && typeof soilSuit["Black Cotton Soil"] === "number") {
    candidateScores.push(soilSuit["Black Cotton Soil"]);
  }
  if (normalizedRegionSoil.includes("red") && typeof soilSuit["Red Laterite"] === "number") {
    candidateScores.push(soilSuit["Red Laterite"]);
  }
  if (normalizedRegionSoil.includes("alluvial")) {
    if (typeof soilSuit["Alluvial"] === "number") candidateScores.push(soilSuit["Alluvial"]);
    if (typeof soilSuit["Alluvial (Delta)"] === "number") {
      candidateScores.push(soilSuit["Alluvial (Delta)"]);
    }
  }

  if (candidateScores.length > 0) return Math.max(...candidateScores);

  return 50;
};

/**
 * Profitability Confidence Score (AI-style scoring)
 */
export const calculateConfidence = (
  crop: ICrop,
  region: IRegion,
  irrigationType: string,
  riskAssessment: IRiskAssessment,
): IConfidenceScore => {
  // Weather stability (25%)
  let weatherStability = 80;
  if (region.avgRainfallMM < 500) weatherStability = 30;
  else if (region.avgRainfallMM < 800) weatherStability = 55;
  else if (region.avgRainfallMM > 1200) weatherStability = 65; // excess rain risk

  // Market price stability (30%)
  let marketPriceStability = 70;
  if (crop.category === "Cash Crop" || crop.category === "Horticulture")
    marketPriceStability = 40;
  else if (crop.category === "Spice") marketPriceStability = 50;
  else if (crop.category === "Cereal") marketPriceStability = 85; // MSP backed

  // Soil condition (25%)
  const soilCondition = getSoilSuitabilityScore(crop, region.soilType);

  // Irrigation reliability (20%)
  let irrigationReliability = 60;
  if (irrigationType === "drip") irrigationReliability = 95;
  else if (irrigationType === "sprinkler") irrigationReliability = 85;
  else if (["canal", "tubewell", "borewell"].includes(irrigationType))
    irrigationReliability = 75;
  else if (irrigationType === "rainfed") irrigationReliability = 25;
  if (region.irrigationAvailability === "Good")
    irrigationReliability = Math.min(irrigationReliability + 10, 100);
  else if (region.irrigationAvailability === "Poor")
    irrigationReliability = Math.max(irrigationReliability - 15, 10);

  const overall = Math.round(
    weatherStability * 0.25 +
      marketPriceStability * 0.3 +
      soilCondition * 0.25 +
      irrigationReliability * 0.2,
  );

  let label: string;
  if (overall >= 70) label = "High";
  else if (overall >= 45) label = "Medium";
  else label = "Low";

  return {
    overall,
    breakdown: {
      weatherStability,
      marketPriceStability,
      soilCondition,
      irrigationReliability,
    },
    label,
  };
};

/**
 * Water Requirement vs Availability Match
 */
export const calculateWaterMatch = (
  crop: ICrop,
  region: IRegion,
): IWaterMatch => {
  const cropNeed = crop.waterRequirementMM || 500;
  const regionWater = region.waterAvailabilityMM || 600;
  const deficit = Math.max(0, cropNeed - regionWater);
  const matchPercent = Math.min(
    100,
    Math.round((regionWater / cropNeed) * 100),
  );

  let status: "Surplus" | "Adequate" | "Deficit" | "Critical Deficit";
  if (matchPercent >= 120) status = "Surplus";
  else if (matchPercent >= 80) status = "Adequate";
  else if (matchPercent >= 50) status = "Deficit";
  else status = "Critical Deficit";

  return {
    cropWaterNeedMM: cropNeed,
    regionWaterAvailableMM: regionWater,
    deficitMM: deficit,
    matchPercent,
    status,
  };
};

/**
 * AI Crop Suitability Score
 */
export const calculateSuitability = (
  crop: ICrop,
  region: IRegion,
  irrigationType: string,
): ICropSuitability => {
  // Soil match
  const soilMatch = getSoilSuitabilityScore(crop, region.soilType);

  // Rainfall match
  const cropNeed = crop.waterRequirementMM || 500;
  const rainfallRatio = region.avgRainfallMM / cropNeed;
  let rainfallMatch = 50;
  if (rainfallRatio >= 0.8 && rainfallRatio <= 1.5) rainfallMatch = 90;
  else if (rainfallRatio >= 0.5) rainfallMatch = 65;
  else rainfallMatch = 30;

  // Temperature match
  const avgTemp = region.weatherMock?.avgTempC || 30;
  const { min, max } = crop.temperatureRange || { min: 15, max: 40 };
  let temperatureMatch = 50;
  if (avgTemp >= min && avgTemp <= max) temperatureMatch = 90;
  else if (avgTemp >= min - 5 && avgTemp <= max + 5) temperatureMatch = 60;
  else temperatureMatch = 25;

  // Irrigation match
  let irrigationMatch = 60;
  if (
    crop.waterRequirement === "High" &&
    ["drip", "sprinkler", "canal"].includes(irrigationType)
  )
    irrigationMatch = 85;
  else if (crop.waterRequirement === "High" && irrigationType === "rainfed")
    irrigationMatch = 20;
  else if (crop.waterRequirement === "Low") irrigationMatch = 90;
  else irrigationMatch = 70;

  // Pest resistance (inverse of avg pest probability)
  const avgPest = crop.pestRules?.length
    ? crop.pestRules.reduce((s, p) => s + p.probability, 0) /
      crop.pestRules.length
    : 30;
  const pestResistance = Math.max(10, 100 - avgPest);

  const overall = Math.round(
    soilMatch * 0.25 +
      rainfallMatch * 0.2 +
      temperatureMatch * 0.2 +
      irrigationMatch * 0.2 +
      pestResistance * 0.15,
  );

  return {
    overall,
    soilMatch,
    rainfallMatch,
    temperatureMatch,
    irrigationMatch,
    pestResistance,
  };
};

/**
 * Multi-Year Profit Projection (3 years)
 */
export const calculateMultiYear = (
  currentProfit: number,
  currentMSP: number,
  currentCost: number,
  mspHistory: Array<{ year: number; msp: number }>,
  landSize: number,
  totalYield: number,
): IYearProjection[] => {
  // Calculate MSP growth trend
  let mspGrowthRate = 0.05; // default 5%
  if (mspHistory && mspHistory.length >= 2) {
    const latest = mspHistory[mspHistory.length - 1].msp;
    const oldest = mspHistory[0].msp;
    const years = mspHistory[mspHistory.length - 1].year - mspHistory[0].year;
    if (years > 0) mspGrowthRate = Math.pow(latest / oldest, 1 / years) - 1;
  }
  const costInflation = 0.04; // 4% annual

  const projections: IYearProjection[] = [];
  for (let i = 1; i <= 3; i++) {
    const projMSP = Math.round(currentMSP * Math.pow(1 + mspGrowthRate, i));
    const projCost = Math.round(currentCost * Math.pow(1 + costInflation, i));
    const projRevenue = totalYield * projMSP;
    const projProfit = Math.round(projRevenue - projCost);
    const projROI =
      projCost > 0 ? Math.round((projProfit / projCost) * 10000) / 100 : 0;
    projections.push({
      year: new Date().getFullYear() + i,
      projectedMSP: projMSP,
      projectedCost: projCost,
      projectedProfit: projProfit,
      projectedROI: projROI,
    });
  }
  return projections;
};

/**
 * Sensitivity Analysis
 */
export const calculateSensitivity = (
  totalYield: number,
  msp: number,
  marketPrice: number,
  totalCost: number,
  landSize: number,
): ISensitivityResult[] => {
  const baseProfit = totalYield * msp - totalCost;
  const results: ISensitivityResult[] = [];

  // Price drop 10%
  const newMSP10 = msp * 0.9;
  const profit10 = totalYield * newMSP10 - totalCost;
  results.push({
    label: "MSP Drops 10%",
    change: "-10% MSP",
    originalProfit: Math.round(baseProfit),
    newProfit: Math.round(profit10),
    impact: Math.round(profit10 - baseProfit),
    impactPercent: Math.round(
      ((profit10 - baseProfit) / Math.abs(baseProfit)) * 100,
    ),
  });

  // Price increase 10%
  const newMSP10u = msp * 1.1;
  const profit10u = totalYield * newMSP10u - totalCost;
  results.push({
    label: "MSP Rises 10%",
    change: "+10% MSP",
    originalProfit: Math.round(baseProfit),
    newProfit: Math.round(profit10u),
    impact: Math.round(profit10u - baseProfit),
    impactPercent: Math.round(
      ((profit10u - baseProfit) / Math.abs(baseProfit)) * 100,
    ),
  });

  // Yield drop 20% (bad rainfall)
  const lowYield = totalYield * 0.8;
  const profitLowYield = lowYield * msp - totalCost;
  results.push({
    label: "Low Rainfall (-20% Yield)",
    change: "-20% Yield",
    originalProfit: Math.round(baseProfit),
    newProfit: Math.round(profitLowYield),
    impact: Math.round(profitLowYield - baseProfit),
    impactPercent: Math.round(
      ((profitLowYield - baseProfit) / Math.abs(baseProfit)) * 100,
    ),
  });

  // Fertilizer cost increase 30%
  const extraCost = totalCost * 0.15; // fertilizer ~30% of cost, increased by 50%
  const profitHighCost = totalYield * msp - (totalCost + extraCost);
  results.push({
    label: "Fertilizer Cost +30%",
    change: "+30% Fertilizer",
    originalProfit: Math.round(baseProfit),
    newProfit: Math.round(profitHighCost),
    impact: Math.round(profitHighCost - baseProfit),
    impactPercent: Math.round(
      ((profitHighCost - baseProfit) / Math.abs(baseProfit)) * 100,
    ),
  });

  // Best case: +15% yield + market price
  const bestYield = totalYield * 1.15;
  const bestProfit = bestYield * marketPrice - totalCost;
  results.push({
    label: "Best Case (Good Rain + Market Price)",
    change: "+15% Yield + Market",
    originalProfit: Math.round(baseProfit),
    newProfit: Math.round(bestProfit),
    impact: Math.round(bestProfit - baseProfit),
    impactPercent: Math.round(
      ((bestProfit - baseProfit) / Math.abs(baseProfit)) * 100,
    ),
  });

  return results;
};

/**
 * Pest Predictions for crop + region
 */
export const getPestPredictions = (crop: ICrop): IPestPrediction[] => {
  if (!crop.pestRules || crop.pestRules.length === 0) return [];
  return crop.pestRules.map((p) => ({
    name: p.name,
    probability: p.probability,
    severity: p.severity,
    season: p.season,
    description: p.description,
  }));
};
