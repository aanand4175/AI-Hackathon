/**
 * Yield Calculator Engine
 * Calculates expected crop yield based on base yield, region multiplier,
 * land size, and irrigation type.
 */

import type { ICrop, IRegion, IYieldEstimate, IrrigationType } from "../types";

const IRRIGATION_MULTIPLIERS: Record<IrrigationType, number> = {
  canal: 1.15,
  tubewell: 1.1,
  borewell: 1.05,
  drip: 1.2,
  sprinkler: 1.12,
  rainfed: 0.75,
  flood: 1.0,
};

/**
 * Calculate expected yield
 */
const calculateExpectedYield = (
  crop: ICrop,
  region: IRegion,
  landSize: number,
  irrigationType: string,
): IYieldEstimate => {
  const baseYield: number = crop.baseYieldPerAcre; // quintals per acre
  const regionMultiplier: number = region.yieldMultiplier || 1.0;
  const irrigationMultiplier: number =
    IRRIGATION_MULTIPLIERS[irrigationType as IrrigationType] || 1.0;

  const yieldPerAcre: number =
    baseYield * regionMultiplier * irrigationMultiplier;
  const totalYield: number = yieldPerAcre * landSize;

  return {
    baseYieldPerAcre: baseYield,
    regionMultiplier,
    irrigationMultiplier,
    adjustedYieldPerAcre: Math.round(yieldPerAcre * 100) / 100,
    totalYield: Math.round(totalYield * 100) / 100,
    unit: "quintals",
  };
};

export { calculateExpectedYield, IRRIGATION_MULTIPLIERS };
