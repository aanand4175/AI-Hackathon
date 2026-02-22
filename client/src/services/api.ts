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

// Recommendations
export const fetchRecommendations = (regionId: string) =>
  API.get<{ success: boolean; data: CropRecommendation[] }>(
    `/estimate/recommendations/${regionId}`,
  );

// Scenario Comparison
export const compareScenarios = (data: {
  cropId: string;
  regionId: string;
  scenarioA: { landSize: number; irrigationType: string };
  scenarioB: { landSize: number; irrigationType: string };
}) => API.post("/estimate/compare", data);

// Land Size Heatmap
export const fetchHeatmap = (data: {
  cropId: string;
  regionId: string;
  irrigationType: string;
}) => API.post("/estimate/heatmap", data);

// Sensitivity Analysis
export const fetchSensitivity = (data: {
  cropId: string;
  regionId: string;
  landSize: number;
  irrigationType: string;
  priceVariation: number;
  yieldVariation: number;
  costVariation: number;
}) => API.post("/estimate/sensitivity", data);

export default API;
