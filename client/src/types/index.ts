// ============================================
// Farmer Profitability Estimator — TypeScript Types
// ============================================

// --- Crop ---
export interface CropDefaultCosts {
  seeds: number;
  fertilizer: number;
  pesticide: number;
  labor: number;
  irrigation: number;
  transport: number;
  misc: number;
}

export interface Crop {
  _id: string;
  name: string;
  category: "Cereal" | "Cash Crop" | "Oilseed" | "Pulse" | "Millet";
  baseYieldPerAcre: number;
  growthDurationDays: number;
  waterRequirement: "Low" | "Medium" | "High";
  mspPerQuintal: number;
  marketPricePerQuintal: number;
  defaultCosts: CropDefaultCosts;
}

// --- Region ---
export interface RiskFactorItem {
  factor: string;
  severity: "Low" | "Medium" | "High";
  description: string;
}

export interface Region {
  _id: string;
  district: string;
  state: string;
  soilType: string;
  avgRainfallMM: number;
  yieldMultiplier: number;
  irrigationAvailability: "Good" | "Moderate" | "Poor";
  riskFactors: RiskFactorItem[];
}

// --- Estimate Request ---
export interface CostInputs {
  seeds?: number | "";
  fertilizer?: number | "";
  pesticide?: number | "";
  labor?: number | "";
  irrigation?: number | "";
  transport?: number | "";
  misc?: number | "";
}

export interface EstimateRequest {
  cropId: string;
  regionId: string;
  landSize: number;
  irrigationType: string;
  costs: Record<string, number>;
}

// --- Estimate Response ---
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

export interface RiskFactorDetail {
  factor: string;
  severity: "Low" | "Medium" | "High";
  description: string;
  impact: number;
}

export interface RiskAssessment {
  riskScore: number;
  riskLevel: "Low" | "Moderate" | "High";
  riskFactors: RiskFactorDetail[];
  totalFactors: number;
}

export interface Recommendation {
  verdict: string;
  recommendation: string;
  profitableAtMSP: boolean;
  profitableAtMarket: boolean;
  riskLevel: string;
}

export interface EstimateSummary {
  crop: string;
  category: string;
  region: string;
  landSize: string;
  irrigationType: string;
  growthDuration: string;
}

export interface EstimateResult {
  summary: EstimateSummary;
  yield: YieldEstimate;
  cost: CostEstimate;
  profit: ProfitEstimate;
  risk: RiskAssessment;
  recommendation: Recommendation;
}

// --- API Response ---
export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  message?: string;
}

// --- Form State ---
export interface FormData {
  cropId: string;
  regionId: string;
  landSize: string;
  irrigationType: string;
  costs: CostInputs;
}

export interface IrrigationType {
  value: string;
  label: string;
}
