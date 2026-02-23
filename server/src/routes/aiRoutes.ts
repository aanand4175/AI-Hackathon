import express from "express";
import {
  generateInsights,
  generateRecommendationInsights,
  generateComparisonInsights,
  generateHeatmapInsights,
  generateSensitivityInsights,
  chatWithKrishiMitra,
} from "../controllers/aiController";

const router = express.Router();

router.post("/insights", generateInsights);
router.post("/recommendations", generateRecommendationInsights);
router.post("/compare", generateComparisonInsights);
router.post("/heatmap", generateHeatmapInsights);
router.post("/sensitivity", generateSensitivityInsights);
router.post("/chat", chatWithKrishiMitra);

export default router;
