import { Request, Response } from "express";
import Crop from "../models/Crop";
import Region from "../models/Region";
import { calculateExpectedYield } from "../utils/yieldCalculator";
import { calculateTotalCost } from "../utils/costModeling";
import { calculateProfitability } from "../utils/profitCalculator";
import { calculateRiskScore } from "../utils/riskScoring";
import type {
  IEstimateRequestBody,
  IEstimateResult,
  IProfitEstimate,
  IRiskAssessment,
  IRecommendation,
} from "../types";

// @desc    Calculate full profitability estimate
// @route   POST /api/estimate
const calculateEstimate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cropId, regionId, landSize, irrigationType, costs } =
      req.body as IEstimateRequestBody;

    // Validate required fields
    if (!cropId || !regionId || !landSize || !irrigationType) {
      res.status(400).json({
        success: false,
        message:
          "Please provide cropId, regionId, landSize, and irrigationType",
      });
      return;
    }

    if (landSize <= 0) {
      res.status(400).json({
        success: false,
        message: "Land size must be greater than 0",
      });
      return;
    }

    // Fetch crop and region data
    const crop = await Crop.findById(cropId);
    const region = await Region.findById(regionId);

    if (!crop) {
      res.status(404).json({ success: false, message: "Crop not found" });
      return;
    }
    if (!region) {
      res.status(404).json({ success: false, message: "Region not found" });
      return;
    }

    // 1. Calculate expected yield
    const yieldEstimate = calculateExpectedYield(
      crop,
      region,
      landSize,
      irrigationType,
    );

    // 2. Calculate total cost
    const costEstimate = calculateTotalCost(crop, landSize, costs || {});

    // 3. Calculate profitability
    const profitEstimate = calculateProfitability(
      yieldEstimate.totalYield,
      crop.mspPerQuintal,
      crop.marketPricePerQuintal,
      costEstimate.totalCost,
    );

    // 4. Calculate risk score
    const riskAssessment = calculateRiskScore(crop, region, irrigationType);

    // 5. Build full estimate response
    const estimate: IEstimateResult = {
      summary: {
        crop: crop.name,
        category: crop.category,
        region: `${region.district}, ${region.state}`,
        landSize: `${landSize} acres`,
        irrigationType,
        growthDuration: `${crop.growthDurationDays} days`,
      },
      yield: yieldEstimate,
      cost: costEstimate,
      profit: profitEstimate,
      risk: riskAssessment,
      recommendation: generateRecommendation(profitEstimate, riskAssessment),
    };

    res.json({ success: true, data: estimate });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Estimate error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Generate a text recommendation based on profit and risk
 */
function generateRecommendation(
  profit: IProfitEstimate,
  risk: IRiskAssessment,
): IRecommendation {
  let recommendation: string = "";
  let verdict: string = "";

  if (profit.isProfitableAtMSP && risk.riskLevel === "Low") {
    verdict = "Highly Recommended";
    recommendation =
      "This crop is expected to be profitable with low risk. Excellent choice for your region and conditions.";
  } else if (profit.isProfitableAtMSP && risk.riskLevel === "Moderate") {
    verdict = "Recommended with Caution";
    recommendation =
      "This crop should be profitable but carries moderate risks. Consider risk mitigation measures like crop insurance.";
  } else if (profit.isProfitableAtMSP && risk.riskLevel === "High") {
    verdict = "Proceed with Caution";
    recommendation =
      "While potentially profitable, the high risk factors could impact returns. Ensure you have irrigation backup and consider crop insurance.";
  } else if (!profit.isProfitableAtMSP && profit.isProfitableAtMarket) {
    verdict = "Market Dependent";
    recommendation =
      "Profitability depends on getting market prices above MSP. Consider forward contracts or direct market access to secure better prices.";
  } else {
    verdict = "Not Recommended";
    recommendation =
      "Based on current estimates, this crop may not be profitable. Consider alternative crops or cost reduction strategies.";
  }

  return {
    verdict,
    recommendation,
    profitableAtMSP: profit.isProfitableAtMSP,
    profitableAtMarket: profit.isProfitableAtMarket,
    riskLevel: risk.riskLevel,
  };
}

export { calculateEstimate };
