import axios from "axios";
import type {
  Crop,
  Region,
  EstimateResult,
  CropRecommendation,
  FormData,
} from "../types";

const API = axios.create({ baseURL: "http://localhost:5001/api" });

// Crops
export const fetchCrops = () =>
  API.get<{ success: boolean; data: Crop[] }>("/crops");
export const fetchCropById = (id: string) =>
  API.get<{ success: boolean; data: Crop }>(`/crops/${id}`);
export const fetchMspTrend = (id: string) => API.get(`/crops/${id}/msp-trend`);

// Regions
export const fetchRegions = () =>
  API.get<{ success: boolean; data: Region[] }>("/regions");

// Estimate
export const submitEstimate = (data: FormData) =>
  API.post<{ success: boolean; data: EstimateResult }>("/estimate", data);

// AI Insights
export const generateAIInsights = (data: {
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
}) =>
  API.post<{ success: boolean; data: { insights: string } }>(
    "/ai/insights",
    data,
  );

export const generateRecommendationInsights = (data: {
  region: Region;
  topCrops: CropRecommendation[];
}) =>
  API.post<{ success: boolean; data: { insights: string } }>(
    "/ai/recommendations",
    data,
  );

export const generateComparisonInsights = (data: {
  cropName: string;
  regionName: string;
  scenarioA: any;
  scenarioB: any;
  winner: string;
  profitDifference: number;
}) =>
  API.post<{ success: boolean; data: { insights: string } }>(
    "/ai/compare",
    data,
  );

export const generateHeatmapInsights = (data: {
  cropName: string;
  regionName: string;
  data: any[];
}) =>
  API.post<{ success: boolean; data: { insights: string } }>(
    "/ai/heatmap",
    data,
  );

export const generateSensitivityInsights = (data: {
  cropName: string;
  regionName: string;
  variations: { price: number; yield: number; cost: number };
  baseProfit: number;
  adjustedProfit: number;
  baseRoi: number;
  adjustedRoi: number;
}) =>
  API.post<{ success: boolean; data: { insights: string } }>(
    "/ai/sensitivity",
    data,
  );

export const chatWithKrishiMitra = (data: {
  history: { role: string; parts: [{ text: string }] }[];
  message: string;
}) => API.post<{ success: boolean; data: { reply: string } }>("/ai/chat", data);

// Recommendations
export const fetchRecommendations = (regionId: string) =>
  API.get<{ success: boolean; data: CropRecommendation[] }>(
    `/estimate/recommendations/${regionId}`,
  );

// Scenario Comparison
export const compareScenarios = (data: {
  cropId: string;
  regionId: string;
  scenarioA: {
    landSize: number;
    irrigationType: string;
    farmingType?: "open_field" | "protected" | "hydroponic";
  };
  scenarioB: {
    landSize: number;
    irrigationType: string;
    farmingType?: "open_field" | "protected" | "hydroponic";
  };
}) => API.post("/estimate/compare", data);

// Land Size Heatmap
export const fetchHeatmap = (data: {
  cropId: string;
  regionId: string;
  irrigationType: string;
  farmingType?: "open_field" | "protected" | "hydroponic";
}) => API.post("/estimate/heatmap", data);

// Sensitivity Analysis
export const fetchSensitivity = (data: {
  cropId: string;
  regionId: string;
  landSize: number;
  irrigationType: string;
  farmingType?: "open_field" | "protected" | "hydroponic";
  priceVariation: number;
  yieldVariation: number;
  costVariation: number;
}) => API.post("/estimate/sensitivity", data);

// Master Data
export const fetchMasterCategories = () => API.get("/master/categories");
export const fetchMasterStates = () => API.get("/master/states");
export const fetchMasterIrrigations = () => API.get("/master/irrigations");
export const fetchMasterCosts = () => API.get("/master/costs");

export default API;
