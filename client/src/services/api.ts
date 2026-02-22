import axios from "axios";
import type {
  Crop,
  Region,
  EstimateResult,
  EstimateRequest,
  ApiResponse,
} from "../types";

const API = axios.create({
  baseURL: "/api",
});

export const getCrops = () => API.get<ApiResponse<Crop[]>>("/crops");
export const getCropById = (id: string) =>
  API.get<ApiResponse<Crop>>(`/crops/${id}`);
export const getRegions = () => API.get<ApiResponse<Region[]>>("/regions");
export const getRegionById = (id: string) =>
  API.get<ApiResponse<Region>>(`/regions/${id}`);
export const getEstimate = (data: EstimateRequest) =>
  API.post<ApiResponse<EstimateResult>>("/estimate", data);

export default API;
