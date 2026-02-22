import { Request, Response } from "express";
import Crop from "../models/Crop";
import Region from "../models/Region";
import { calculateExpectedYield } from "../utils/yieldCalculator";
import { calculateTotalCost } from "../utils/costModeling";
import { calculateProfitability } from "../utils/profitCalculator";
import { calculateRiskScore } from "../utils/riskScoring";
import {
  calculateConfidence,
  calculateWaterMatch,
  calculateSuitability,
  calculateMultiYear,
  calculateSensitivity,
  getPestPredictions,
} from "../utils/advancedEngines";
import type {
  IEstimateRequestBody,
  IEstimateResult,
  IProfitEstimate,
  IRiskAssessment,
  IRecommendation,
  FarmingType,
} from "../types";

const getYieldMultiplierByFarmingType = (
  farmingType: FarmingType,
  cropCategory: string,
): number => {
  const normalizedCategory = cropCategory.toLowerCase();
  if (farmingType === "protected") {
    return normalizedCategory.includes("horticulture") ? 1.2 : 1.1;
  }
  if (farmingType === "hydroponic") {
    return normalizedCategory.includes("horticulture") ? 1.35 : 1.15;
  }
  return 1;
};

const applyFarmingTypeYield = (
  yieldEstimate: ReturnType<typeof calculateExpectedYield>,
  farmingType: FarmingType,
  cropCategory: string,
) => {
  const multiplier = getYieldMultiplierByFarmingType(farmingType, cropCategory);
  return {
    ...yieldEstimate,
    adjustedYieldPerAcre:
      Math.round(yieldEstimate.adjustedYieldPerAcre * multiplier * 100) / 100,
    totalYield: Math.round(yieldEstimate.totalYield * multiplier * 100) / 100,
  };
};

// @desc    Calculate full profitability estimate (ENHANCED)
// @route   POST /api/estimate
const calculateEstimate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      cropId,
      regionId,
      landSize,
      irrigationType,
      farmingType = "open_field",
      priceSource,
      costs,
    } = req.body as IEstimateRequestBody;

    if (!cropId || !regionId || !landSize || !irrigationType) {
      res.status(400).json({
        success: false,
        message:
          "Please provide cropId, regionId, landSize, and irrigationType",
      });
      return;
    }
    if (landSize <= 0) {
      res
        .status(400)
        .json({ success: false, message: "Land size must be greater than 0" });
      return;
    }

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

    // Determine price based on source
    let activeMarketPrice = crop.marketPricePerQuintal;
    if (priceSource === "mandi")
      activeMarketPrice = crop.mandiPrice || crop.marketPricePerQuintal;
    else if (priceSource === "online")
      activeMarketPrice = crop.onlinePrice || crop.marketPricePerQuintal;

    // 1. Yield
    const yieldEstimate = calculateExpectedYield(
      crop,
      region,
      landSize,
      irrigationType,
    );
    const adjustedYieldEstimate = applyFarmingTypeYield(
      yieldEstimate,
      farmingType,
      crop.category,
    );

    // 2. Cost
    const costEstimate = calculateTotalCost(crop, landSize, costs || {}, {
      region,
      farmingType,
    });

    // 3. Profit
    const profitEstimate = calculateProfitability(
      adjustedYieldEstimate.totalYield,
      crop.mspPerQuintal,
      activeMarketPrice,
      costEstimate.totalCost,
    );

    // 4. Risk (enhanced with categories)
    const riskAssessment = calculateRiskScore(crop, region, irrigationType);

    // 5. Confidence Score
    const confidence = calculateConfidence(
      crop,
      region,
      irrigationType,
      riskAssessment,
    );

    // 6. Water Match
    const waterMatch = calculateWaterMatch(crop, region);

    // 7. Crop Suitability
    const cropSuitability = calculateSuitability(crop, region, irrigationType);

    // 8. Multi-Year Projection
    const multiYear = calculateMultiYear(
      profitEstimate.profitAtMSP,
      crop.mspPerQuintal,
      costEstimate.totalCost,
      crop.mspHistory || [],
      landSize,
      adjustedYieldEstimate.totalYield,
    );

    // 9. Sensitivity Analysis
    const sensitivity = calculateSensitivity(
      adjustedYieldEstimate.totalYield,
      crop.mspPerQuintal,
      activeMarketPrice,
      costEstimate.totalCost,
      landSize,
    );

    // 10. Pest Predictions
    const pestPredictions = getPestPredictions(crop);

    // Build full response
    const estimate: IEstimateResult = {
      summary: {
        crop: crop.name,
        category: crop.category,
        region: `${region.district}, ${region.state}`,
        landSize: `${landSize} acres`,
        irrigationType,
        farmingType,
        growthDuration: `${crop.growthDurationDays} days`,
      },
      yield: adjustedYieldEstimate,
      cost: costEstimate,
      profit: profitEstimate,
      risk: riskAssessment,
      recommendation: generateRecommendation(profitEstimate, riskAssessment),
      confidence,
      waterMatch,
      pestPredictions,
      cropSuitability,
      cropRotation: crop.cropRotation || [],
      govSchemes: region.govSchemes || [],
      costTips: crop.costTips || [],
      multiYear,
      sensitivity,
      mspHistory: crop.mspHistory || [],
      marketDemand: crop.marketDemand || "Medium",
    };

    res.json({ success: true, data: estimate });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Estimate error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

function generateRecommendation(
  profit: IProfitEstimate,
  risk: IRiskAssessment,
): IRecommendation {
  let recommendation = "";
  let verdict = "";

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

// @desc    Get top crop recommendations for a region
// @route   GET /api/estimate/recommendations/:regionId
const getRecommendations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const region = await Region.findById(req.params.regionId);
    if (!region) {
      res.status(404).json({ success: false, message: "Region not found" });
      return;
    }

    const crops = await Crop.find();
    const riskLevelToScore: Record<string, number> = {
      Low: 100,
      Moderate: 65,
      High: 30,
    };

    const normalizeRoi = (roi: number): number => {
      const bounded = Math.max(-50, Math.min(roi, 250));
      return Math.round(((bounded + 50) / 300) * 100);
    };

    const recommendations = crops
      .map((crop) => {
        const yieldEst = calculateExpectedYield(crop, region, 1, "drip");
        const costEst = calculateTotalCost(crop, 1, {}, {
          region,
          farmingType: "open_field",
        });
        const profitEst = calculateProfitability(
          yieldEst.totalYield,
          crop.mspPerQuintal,
          crop.marketPricePerQuintal,
          costEst.totalCost,
        );
        const riskAss = calculateRiskScore(crop, region, "drip");
        const confidence = calculateConfidence(crop, region, "drip", riskAss);
        const suitability = calculateSuitability(crop, region, "drip");
        const riskScore = riskLevelToScore[riskAss.riskLevel] ?? 50;
        const roiScore = normalizeRoi(profitEst.roiAtMSP);
        const recommendationScore = Math.round(
          suitability.overall * 0.45 +
            confidence.overall * 0.25 +
            roiScore * 0.2 +
            riskScore * 0.1,
        );

        return {
          cropId: crop._id,
          cropName: crop.name,
          category: crop.category,
          estimatedProfit: profitEst.profitAtMSP,
          roi: profitEst.roiAtMSP,
          riskLevel: riskAss.riskLevel,
          confidence: confidence.overall,
          suitabilityScore: suitability.overall,
          marketDemand: crop.marketDemand || "Medium",
          recommendationScore,
          matchHighlights: [
            `Soil match ${suitability.soilMatch}/100`,
            `Rainfall fit ${suitability.rainfallMatch}/100`,
            `Risk ${riskAss.riskLevel}`,
          ],
        };
      })
      .filter((item) => item.suitabilityScore >= 35);

    recommendations.sort((a, b) => {
      if ((b.recommendationScore || 0) !== (a.recommendationScore || 0)) {
        return (b.recommendationScore || 0) - (a.recommendationScore || 0);
      }
      return b.estimatedProfit - a.estimatedProfit;
    });

    res.json({ success: true, data: recommendations.slice(0, 5) });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Compare two scenarios
// @route   POST /api/estimate/compare
const compareScenarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cropId, regionId, scenarioA, scenarioB } = req.body;
    if (!cropId || !regionId || !scenarioA || !scenarioB) {
      res.status(400).json({
        success: false,
        message: "Provide cropId, regionId, scenarioA, scenarioB",
      });
      return;
    }

    const crop = await Crop.findById(cropId);
    const region = await Region.findById(regionId);
    if (!crop || !region) {
      res
        .status(404)
        .json({ success: false, message: "Crop or Region not found" });
      return;
    }

    const calcScenario = (s: {
      landSize: number;
      irrigationType: string;
      farmingType?: FarmingType;
      costs?: Record<string, number>;
    }) => {
      const scenarioFarmingType = s.farmingType || "open_field";
      const y = calculateExpectedYield(crop, region, s.landSize, s.irrigationType);
      const adjustedY = applyFarmingTypeYield(y, scenarioFarmingType, crop.category);
      const c = calculateTotalCost(crop, s.landSize, s.costs || {}, {
        region,
        farmingType: scenarioFarmingType,
      });
      const p = calculateProfitability(
        adjustedY.totalYield,
        crop.mspPerQuintal,
        crop.marketPricePerQuintal,
        c.totalCost,
      );
      const r = calculateRiskScore(crop, region, s.irrigationType);
      const conf = calculateConfidence(crop, region, s.irrigationType, r);
      return { yield: adjustedY, cost: c, profit: p, risk: r, confidence: conf };
    };

    const resultA = calcScenario(scenarioA);
    const resultB = calcScenario(scenarioB);

    res.json({
      success: true,
      data: {
        crop: crop.name,
        region: `${region.district}, ${region.state}`,
        scenarioA: { ...scenarioA, ...resultA },
        scenarioB: { ...scenarioB, ...resultB },
        winner:
          resultA.profit.profitAtMSP >= resultB.profit.profitAtMSP ? "A" : "B",
        profitDifference: Math.abs(
          resultA.profit.profitAtMSP - resultB.profit.profitAtMSP,
        ),
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get MSP trend for a crop
// @route   GET /api/crops/:id/msp-trend
const getMspTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      res.status(404).json({ success: false, message: "Crop not found" });
      return;
    }

    res.json({
      success: true,
      data: {
        cropName: crop.name,
        currentMSP: crop.mspPerQuintal,
        currentMarket: crop.marketPricePerQuintal,
        mandiPrice: crop.mandiPrice,
        onlinePrice: crop.onlinePrice,
        mspHistory: crop.mspHistory || [],
        marketDemand: crop.marketDemand,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Land size profit heatmap
// @route   POST /api/estimate/heatmap
const landSizeHeatmap = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cropId, regionId, irrigationType, farmingType = "open_field" } =
      req.body;
    const crop = await Crop.findById(cropId);
    const region = await Region.findById(regionId);
    if (!crop || !region) {
      res
        .status(404)
        .json({ success: false, message: "Crop or Region not found" });
      return;
    }

    const sizes = [0.5, 1, 2, 3, 5, 7, 10, 15, 20];
    const data = sizes.map((size) => {
      const y = calculateExpectedYield(crop, region, size, irrigationType || "drip");
      const adjustedY = applyFarmingTypeYield(y, farmingType, crop.category);
      const c = calculateTotalCost(crop, size, {}, { region, farmingType });
      const p = calculateProfitability(
        adjustedY.totalYield,
        crop.mspPerQuintal,
        crop.marketPricePerQuintal,
        c.totalCost,
      );
      return {
        landSize: size,
        profit: p.profitAtMSP,
        revenue: p.revenueAtMSP,
        cost: p.totalCost,
        roi: p.roiAtMSP,
      };
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Calculate sensitivity based on variation parameters
// @route   POST /api/estimate/sensitivity
const getSensitivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      cropId,
      regionId,
      landSize,
      irrigationType,
      farmingType = "open_field",
      priceVariation = 0,
      yieldVariation = 0,
      costVariation = 0,
    } = req.body;
    const crop = await Crop.findById(cropId);
    const region = await Region.findById(regionId);
    if (!crop || !region) {
      res
        .status(404)
        .json({ success: false, message: "Crop or Region not found" });
      return;
    }

    const baseYield = calculateExpectedYield(
      crop,
      region,
      landSize,
      irrigationType || "drip",
    );
    const adjustedBaseYield = applyFarmingTypeYield(
      baseYield,
      farmingType,
      crop.category,
    );
    const baseCost = calculateTotalCost(crop, landSize, {}, {
      region,
      farmingType,
    });

    // Apply variations
    const adjustedYield = adjustedBaseYield.totalYield * (1 + yieldVariation / 100);
    const adjustedCost = baseCost.totalCost * (1 + costVariation / 100);
    const adjustedMarketPrice =
      crop.marketPricePerQuintal * (1 + priceVariation / 100);
    const adjustedMSPPrice = crop.mspPerQuintal * (1 + priceVariation / 100);

    const profit = calculateProfitability(
      adjustedYield,
      adjustedMSPPrice,
      adjustedMarketPrice,
      adjustedCost,
    );

    res.json({
      success: true,
      data: {
        adjustedYield,
        adjustedCost,
        adjustedMarketPrice,
        profit,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export {
  calculateEstimate,
  getRecommendations,
  compareScenarios,
  getMspTrend,
  landSizeHeatmap,
  getSensitivity,
};
