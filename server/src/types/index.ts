// ============================================
// Farmer Profitability Estimator — Backend TypeScript Types
// ============================================

import { Document } from "mongoose";

export type FarmingType = "open_field" | "protected" | "hydroponic";

// --- Crop Types ---
export interface ICropDefaultCosts {
  seeds: number;
  fertilizer: number;
  pesticide: number;
  labor: number;
  irrigation: number;
  transport: number;
  misc: number;
}

export interface IMspHistory {
  year: number;
  msp: number;
}

export interface IPestRule {
  name: string;
  probability: number; // 0–100
  severity: "Low" | "Medium" | "High";
  season: string;
  description: string;
}

export interface ICropRotation {
  nextCrop: string;
  benefit: string;
}

export interface ICrop extends Document {
  name: string;
  imageUrl?: string;
  category: string;
  baseYieldPerAcre: number;
  growthDurationDays: number;
  waterRequirement: "Low" | "Medium" | "High";
  waterRequirementMM: number; // actual mm needed
  mspPerQuintal: number;
  marketPricePerQuintal: number;
  mandiPrice: number; // local mandi price
  onlinePrice: number; // online market price
  marketDemand: "High" | "Medium" | "Low";
  defaultCosts: ICropDefaultCosts;
  mspHistory: IMspHistory[];
  pestRules: IPestRule[];
  cropRotation: ICropRotation[];
  soilSuitability: Record<string, number>; // soil type → 0-100 score
  temperatureRange: { min: number; max: number };
  costTips: string[];
}

// --- Region Types ---
export interface IRiskFactor {
  factor: string;
  severity: "Low" | "Medium" | "High";
  description: string;
}

export interface IGovScheme {
  name: string;
  schemeType: string;
  description: string;
  benefit: string;
}

export interface IWeatherMock {
  avgTempC: number;
  forecast: Array<{
    day: string;
    tempC: number;
    rainfallMM: number;
    condition: string;
  }>;
}

export interface IRegion extends Document {
  district: string;
  state: string;
  soilType: string;
  avgRainfallMM: number;
  yieldMultiplier: number;
  irrigationAvailability: "Good" | "Moderate" | "Poor";
  waterAvailabilityMM: number; // total water available per season
  supportedFarmingTypes: FarmingType[];
  recommendedIrrigationTypes: string[];
  costAdjustmentByCategory: Record<string, number>;
  costAdjustmentByFarmingType: Record<string, number>;
  riskFactors: IRiskFactor[];
  govSchemes: IGovScheme[];
  weatherMock: IWeatherMock;
}

// --- Yield Types ---
export interface IYieldEstimate {
  baseYieldPerAcre: number;
  regionMultiplier: number;
  irrigationMultiplier: number;
  adjustedYieldPerAcre: number;
  totalYield: number;
  unit: string;
}

// --- Cost Types ---
export interface ICostBreakdownItem {
  perAcre: number;
  total: number;
}

export interface ICostEstimate {
  costsPerAcre: Record<string, number>;
  totalPerAcre: number;
  totalCost: number;
  costBreakdown: Record<string, ICostBreakdownItem>;
  landSize: number;
  categoryCostMultiplier: number;
  farmingTypeCostMultiplier: number;
}

// --- Profit Types ---
export interface IProfitEstimate {
  revenueAtMSP: number;
  revenueAtMarket: number;
  totalCost: number;
  profitAtMSP: number;
  profitAtMarket: number;
  roiAtMSP: number;
  roiAtMarket: number;
  isProfitableAtMSP: boolean;
  isProfitableAtMarket: boolean;
  mspPerQuintal: number;
  marketPricePerQuintal: number;
  priceDifference: number;
  priceDifferencePercent: number;
}

// --- Risk Types ---
export interface IRiskFactorDetail {
  factor: string;
  severity: "Low" | "Medium" | "High";
  description: string;
  impact: number;
}

export interface IRiskCategoryScore {
  category: string;
  score: number; // 0-100%
  reason: string;
}

export interface IRiskAssessment {
  riskScore: number;
  riskLevel: "Low" | "Moderate" | "High";
  riskFactors: IRiskFactorDetail[];
  riskCategories: IRiskCategoryScore[];
  totalFactors: number;
}

// --- Confidence Score ---
export interface IConfidenceScore {
  overall: number; // 0-100
  breakdown: {
    weatherStability: number;
    marketPriceStability: number;
    soilCondition: number;
    irrigationReliability: number;
  };
  label: string; // 'High' | 'Medium' | 'Low'
}

// --- Water Match ---
export interface IWaterMatch {
  cropWaterNeedMM: number;
  regionWaterAvailableMM: number;
  deficitMM: number;
  matchPercent: number;
  status: "Surplus" | "Adequate" | "Deficit" | "Critical Deficit";
}

// --- Pest Prediction ---
export interface IPestPrediction {
  name: string;
  probability: number;
  severity: string;
  season: string;
  description: string;
}

// --- Crop Suitability ---
export interface ICropSuitability {
  overall: number; // 0-100
  soilMatch: number;
  rainfallMatch: number;
  temperatureMatch: number;
  irrigationMatch: number;
  pestResistance: number;
}

// --- Recommendation ---
export interface IRecommendation {
  verdict: string;
  recommendation: string;
  profitableAtMSP: boolean;
  profitableAtMarket: boolean;
  riskLevel: string;
}

// --- Multi-Year Projection ---
export interface IYearProjection {
  year: number;
  projectedMSP: number;
  projectedCost: number;
  projectedProfit: number;
  projectedROI: number;
}

// --- Sensitivity ---
export interface ISensitivityResult {
  label: string;
  change: string;
  originalProfit: number;
  newProfit: number;
  impact: number;
  impactPercent: number;
}

// --- Estimate Request Body ---
export interface IEstimateRequestBody {
  cropId: string;
  regionId: string;
  landSize: number;
  irrigationType: string;
  farmingType?: FarmingType;
  priceSource?: "msp" | "market" | "mandi" | "online";
  costs?: Partial<ICropDefaultCosts>;
}

// --- Full Estimate Response ---
export interface IEstimateResult {
  summary: {
    crop: string;
    category: string;
    region: string;
    landSize: string;
    irrigationType: string;
    farmingType?: FarmingType;
    growthDuration: string;
  };
  yield: IYieldEstimate;
  cost: ICostEstimate;
  profit: IProfitEstimate;
  risk: IRiskAssessment;
  recommendation: IRecommendation;
  confidence: IConfidenceScore;
  waterMatch: IWaterMatch;
  pestPredictions: IPestPrediction[];
  cropSuitability: ICropSuitability;
  cropRotation: ICropRotation[];
  govSchemes: IGovScheme[];
  costTips: string[];
  multiYear: IYearProjection[];
  sensitivity: ISensitivityResult[];
  mspHistory: IMspHistory[];
  marketDemand: string;
}

// --- Scenario Comparison ---
export interface IScenarioRequest {
  cropId: string;
  regionId: string;
  scenarioA: {
    landSize: number;
    irrigationType: string;
    farmingType?: FarmingType;
    costs?: Partial<ICropDefaultCosts>;
  };
  scenarioB: {
    landSize: number;
    irrigationType: string;
    farmingType?: FarmingType;
    costs?: Partial<ICropDefaultCosts>;
  };
}

// --- Top Crop Recommendation ---
export interface ICropRecommendation {
  cropId: string;
  cropName: string;
  category: string;
  estimatedProfit: number;
  roi: number;
  riskLevel: string;
  confidence: number;
  suitabilityScore: number;
  marketDemand: string;
  recommendationScore?: number;
  matchHighlights?: string[];
}

// --- Irrigation Multipliers ---
export type IrrigationType =
  | "canal"
  | "tubewell"
  | "borewell"
  | "drip"
  | "sprinkler"
  | "rainfed"
  | "flood";
