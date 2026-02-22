// ============================================
// Farmer Profitability Estimator — Backend TypeScript Types
// ============================================

import { Document } from "mongoose";

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

export interface ICrop extends Document {
  name: string;
  category: "Cereal" | "Cash Crop" | "Oilseed" | "Pulse" | "Millet";
  baseYieldPerAcre: number;
  growthDurationDays: number;
  waterRequirement: "Low" | "Medium" | "High";
  mspPerQuintal: number;
  marketPricePerQuintal: number;
  defaultCosts: ICropDefaultCosts;
}

// --- Region Types ---
export interface IRiskFactor {
  factor: string;
  severity: "Low" | "Medium" | "High";
  description: string;
}

export interface IRegion extends Document {
  district: string;
  state: string;
  soilType: string;
  avgRainfallMM: number;
  yieldMultiplier: number;
  irrigationAvailability: "Good" | "Moderate" | "Poor";
  riskFactors: IRiskFactor[];
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

export interface IRiskAssessment {
  riskScore: number;
  riskLevel: "Low" | "Moderate" | "High";
  riskFactors: IRiskFactorDetail[];
  totalFactors: number;
}

// --- Recommendation ---
export interface IRecommendation {
  verdict: string;
  recommendation: string;
  profitableAtMSP: boolean;
  profitableAtMarket: boolean;
  riskLevel: string;
}

// --- Estimate Request Body ---
export interface IEstimateRequestBody {
  cropId: string;
  regionId: string;
  landSize: number;
  irrigationType: string;
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
    growthDuration: string;
  };
  yield: IYieldEstimate;
  cost: ICostEstimate;
  profit: IProfitEstimate;
  risk: IRiskAssessment;
  recommendation: IRecommendation;
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
