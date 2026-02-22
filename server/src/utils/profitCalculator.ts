/**
 * Profit Calculator Engine
 * Computes revenue at MSP & market price, net profit/loss, ROI%.
 */

import type { IProfitEstimate } from "../types";

/**
 * Calculate profitability
 */
const calculateProfitability = (
  totalYield: number,
  mspPerQuintal: number,
  marketPricePerQuintal: number,
  totalCost: number,
): IProfitEstimate => {
  const revenueAtMSP: number = totalYield * mspPerQuintal;
  const revenueAtMarket: number = totalYield * marketPricePerQuintal;

  const profitAtMSP: number = revenueAtMSP - totalCost;
  const profitAtMarket: number = revenueAtMarket - totalCost;

  const roiAtMSP: number = totalCost > 0 ? (profitAtMSP / totalCost) * 100 : 0;
  const roiAtMarket: number =
    totalCost > 0 ? (profitAtMarket / totalCost) * 100 : 0;

  return {
    revenueAtMSP: Math.round(revenueAtMSP),
    revenueAtMarket: Math.round(revenueAtMarket),
    totalCost: Math.round(totalCost),
    profitAtMSP: Math.round(profitAtMSP),
    profitAtMarket: Math.round(profitAtMarket),
    roiAtMSP: Math.round(roiAtMSP * 100) / 100,
    roiAtMarket: Math.round(roiAtMarket * 100) / 100,
    isProfitableAtMSP: profitAtMSP > 0,
    isProfitableAtMarket: profitAtMarket > 0,
    mspPerQuintal,
    marketPricePerQuintal,
    priceDifference: Math.round(marketPricePerQuintal - mspPerQuintal),
    priceDifferencePercent:
      Math.round(
        ((marketPricePerQuintal - mspPerQuintal) / mspPerQuintal) * 10000,
      ) / 100,
  };
};

export { calculateProfitability };
