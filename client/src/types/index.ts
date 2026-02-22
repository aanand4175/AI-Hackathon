// ============================================
// Farmer Profitability Estimator — Frontend Types
// ============================================

export interface Crop {
  _id: string;
  name: string;
  category: string;
  imageUrl?: string;
  baseYieldPerAcre: number;
  mspPerQuintal: number;
  marketPricePerQuintal: number;
  waterRequirement: string;
  marketDemand?: string;
  soilSuitability: Record<string, number>;
  defaultCosts: Record<string, number>;
}

export interface Region {
  _id: string;
  district: string;
  state: string;
  soilType: string;
  avgRainfallMM: number;
  yieldMultiplier: number;
  irrigationAvailability: string;
  supportedFarmingTypes?: string[];
  recommendedIrrigationTypes?: string[];
  costAdjustmentByCategory?: Record<string, number>;
  costAdjustmentByFarmingType?: Record<string, number>;
}

export interface FormData {
  cropId: string;
  regionId: string;
  landSize: number;
  irrigationType: string;
  farmingType?: "open_field" | "protected" | "hydroponic";
  priceSource: string;
  costs: Record<string, number>;
}

// --- Enhanced Result Types ---

export interface YieldEstimate {
  baseYieldPerAcre: number;
  regionMultiplier: number;
  irrigationMultiplier: number;
  adjustedYieldPerAcre: number;
  totalYield: number;
  unit: string;
}

export interface CostBreakdownItem {
  perAcre: number;
  total: number;
}

export interface CostEstimate {
  costsPerAcre: Record<string, number>;
  totalPerAcre: number;
  totalCost: number;
  costBreakdown: Record<string, CostBreakdownItem>;
  landSize: number;
  categoryCostMultiplier?: number;
  farmingTypeCostMultiplier?: number;
}

export interface ProfitEstimate {
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

export interface RiskCategoryScore {
  category: string;
  score: number;
  reason: string;
}

export interface RiskFactorDetail {
  factor: string;
  severity: string;
  description: string;
  impact: number;
}

export interface RiskAssessment {
  riskScore: number;
  riskLevel: string;
  riskFactors: RiskFactorDetail[];
  riskCategories: RiskCategoryScore[];
  totalFactors: number;
}

export interface ConfidenceScore {
  overall: number;
  breakdown: {
    weatherStability: number;
    marketPriceStability: number;
    soilCondition: number;
    irrigationReliability: number;
  };
  label: string;
}

export interface WaterMatch {
  cropWaterNeedMM: number;
  regionWaterAvailableMM: number;
  deficitMM: number;
  matchPercent: number;
  status: string;
}

export interface PestPrediction {
  name: string;
  probability: number;
  severity: string;
  season: string;
  description: string;
}

export interface CropSuitability {
  overall: number;
  soilMatch: number;
  rainfallMatch: number;
  temperatureMatch: number;
  irrigationMatch: number;
  pestResistance: number;
}

export interface CropRotation {
  nextCrop: string;
  benefit: string;
}

export interface GovScheme {
  name: string;
  schemeType: string;
  description: string;
  benefit: string;
}

export interface MspHistory {
  year: number;
  msp: number;
}

export interface YearProjection {
  year: number;
  projectedMSP: number;
  projectedCost: number;
  projectedProfit: number;
  projectedROI: number;
}

export interface SensitivityResult {
  label: string;
  change: string;
  originalProfit: number;
  newProfit: number;
  impact: number;
  impactPercent: number;
}

export interface Recommendation {
  verdict: string;
  recommendation: string;
  profitableAtMSP: boolean;
  profitableAtMarket: boolean;
  riskLevel: string;
}

export interface EstimateResult {
  summary: {
    crop: string;
    category: string;
    region: string;
    landSize: string;
    irrigationType: string;
    farmingType?: string;
    growthDuration: string;
  };
  yield: YieldEstimate;
  cost: CostEstimate;
  profit: ProfitEstimate;
  risk: RiskAssessment;
  recommendation: Recommendation;
  confidence: ConfidenceScore;
  waterMatch: WaterMatch;
  pestPredictions: PestPrediction[];
  cropSuitability: CropSuitability;
  cropRotation: CropRotation[];
  govSchemes: GovScheme[];
  costTips: string[];
  multiYear: YearProjection[];
  sensitivity: SensitivityResult[];
  mspHistory: MspHistory[];
  marketDemand: string;
}

export interface CropRecommendation {
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
