/**
 * Cost Modeling Engine
 * Merges user-provided costs with crop defaults, scales by land size.
 */

import type { ICrop, ICostEstimate, ICostBreakdownItem } from "../types";

/**
 * Calculate total production cost
 */
const calculateTotalCost = (
  crop: ICrop,
  landSize: number,
  userCosts: Partial<Record<string, number>> = {},
): ICostEstimate => {
  const defaults = crop.defaultCosts || ({} as Record<string, number>);

  // Merge: user-provided costs take priority over defaults
  const costsPerAcre: Record<string, number> = {
    seeds: userCosts.seeds ?? defaults.seeds ?? 0,
    fertilizer: userCosts.fertilizer ?? defaults.fertilizer ?? 0,
    pesticide: userCosts.pesticide ?? defaults.pesticide ?? 0,
    labor: userCosts.labor ?? defaults.labor ?? 0,
    irrigation: userCosts.irrigation ?? defaults.irrigation ?? 0,
    transport: userCosts.transport ?? defaults.transport ?? 0,
    misc: userCosts.misc ?? defaults.misc ?? 0,
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
  };
};

export { calculateTotalCost };
