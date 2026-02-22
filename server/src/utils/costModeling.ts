/**
 * Cost Modeling Engine
 * Merges user-provided costs with crop defaults, scales by land size.
 */

import type {
  ICrop,
  ICostEstimate,
  ICostBreakdownItem,
  IRegion,
  FarmingType,
} from "../types";

interface CostContext {
  region?: IRegion;
  farmingType?: FarmingType;
}

const normalizeCategory = (category: string): string =>
  category.toLowerCase().replace(/[^a-z]/g, "");

const getCategoryMultiplier = (
  crop: ICrop,
  region?: IRegion,
): number => {
  if (!region?.costAdjustmentByCategory) return 1;
  const normalizedCropCategory = normalizeCategory(crop.category || "");
  for (const [key, value] of Object.entries(region.costAdjustmentByCategory)) {
    if (normalizeCategory(key) === normalizedCropCategory) return value || 1;
  }
  return 1;
};

const getFarmingTypeMultiplier = (
  crop: ICrop,
  farmingType: FarmingType,
  region?: IRegion,
): number => {
  const normalizedCategory = normalizeCategory(crop.category || "");
  let defaultMultiplier = 1;
  if (farmingType === "protected") {
    defaultMultiplier =
      normalizedCategory.includes("horticulture") ||
      normalizedCategory.includes("vegetable")
        ? 1.22
        : 1.12;
  } else if (farmingType === "hydroponic") {
    defaultMultiplier = 1.42;
  }

  const override = region?.costAdjustmentByFarmingType?.[farmingType];
  return typeof override === "number" && override > 0
    ? override
    : defaultMultiplier;
};

/**
 * Calculate total production cost
 */
const calculateTotalCost = (
  crop: ICrop,
  landSize: number,
  userCosts: Partial<Record<string, number>> = {},
  context: CostContext = {},
): ICostEstimate => {
  const defaults = crop.defaultCosts || ({} as Record<string, number>);
  const farmingType = context.farmingType || "open_field";
  const categoryCostMultiplier = getCategoryMultiplier(crop, context.region);
  const farmingTypeCostMultiplier = getFarmingTypeMultiplier(
    crop,
    farmingType,
    context.region,
  );
  const combinedMultiplier = categoryCostMultiplier * farmingTypeCostMultiplier;

  // Merge: user-provided costs take priority over defaults
  const costsPerAcre: Record<string, number> = {
    seeds: Math.round((userCosts.seeds ?? defaults.seeds ?? 0) * combinedMultiplier),
    fertilizer: Math.round(
      (userCosts.fertilizer ?? defaults.fertilizer ?? 0) * combinedMultiplier,
    ),
    pesticide: Math.round(
      (userCosts.pesticide ?? defaults.pesticide ?? 0) * combinedMultiplier,
    ),
    labor: Math.round((userCosts.labor ?? defaults.labor ?? 0) * combinedMultiplier),
    irrigation: Math.round(
      (userCosts.irrigation ?? defaults.irrigation ?? 0) * combinedMultiplier,
    ),
    transport: Math.round(
      (userCosts.transport ?? defaults.transport ?? 0) * combinedMultiplier,
    ),
    misc: Math.round((userCosts.misc ?? defaults.misc ?? 0) * combinedMultiplier),
  };

  const totalPerAcre: number = Object.values(costsPerAcre).reduce(
    (sum: number, val: number) => sum + val,
    0,
  );
  const totalCost: number = totalPerAcre * landSize;

  // Cost breakdown scaled by land size
  const costBreakdown: Record<string, ICostBreakdownItem> = {};
  for (const [key, value] of Object.entries(costsPerAcre)) {
    costBreakdown[key] = {
      perAcre: value,
      total: Math.round(value * landSize * 100) / 100,
    };
  }

  return {
    costsPerAcre,
    totalPerAcre: Math.round(totalPerAcre * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    costBreakdown,
    landSize,
    categoryCostMultiplier: Math.round(categoryCostMultiplier * 100) / 100,
    farmingTypeCostMultiplier: Math.round(farmingTypeCostMultiplier * 100) / 100,
  };
};

export { calculateTotalCost };
