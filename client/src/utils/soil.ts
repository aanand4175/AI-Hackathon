import type { Crop, Region } from "../types";

const normalizeSoilKey = (soilType: string): string =>
  soilType.toLowerCase().replace(/[^a-z]/g, "");

export const getSoilSuitabilityScore = (crop: Crop, region: Region): number => {
  const soilSuitability = crop.soilSuitability || {};

  if (typeof soilSuitability[region.soilType] === "number") {
    return soilSuitability[region.soilType];
  }

  const normalizedRegionSoil = normalizeSoilKey(region.soilType);

  for (const [soilName, score] of Object.entries(soilSuitability)) {
    if (normalizeSoilKey(soilName) === normalizedRegionSoil) return score;
  }

  const candidates: number[] = [];
  if (normalizedRegionSoil.includes("black") && typeof soilSuitability["Black Cotton Soil"] === "number") {
    candidates.push(soilSuitability["Black Cotton Soil"]);
  }
  if (normalizedRegionSoil.includes("red") && typeof soilSuitability["Red Laterite"] === "number") {
    candidates.push(soilSuitability["Red Laterite"]);
  }
  if (normalizedRegionSoil.includes("alluvial")) {
    if (typeof soilSuitability["Alluvial"] === "number") candidates.push(soilSuitability["Alluvial"]);
    if (typeof soilSuitability["Alluvial (Delta)"] === "number") {
      candidates.push(soilSuitability["Alluvial (Delta)"]);
    }
  }

  if (candidates.length > 0) return Math.max(...candidates);

  return 0;
};
