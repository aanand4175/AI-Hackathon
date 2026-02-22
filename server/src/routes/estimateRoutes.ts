import { Router } from "express";
import {
  calculateEstimate,
  getRecommendations,
  compareScenarios,
  getMspTrend,
  landSizeHeatmap,
  getSensitivity,
} from "../controllers/estimateController";

const router: Router = Router();

router.post("/", calculateEstimate);
router.get("/recommendations/:regionId", getRecommendations);
router.post("/compare", compareScenarios);
router.post("/heatmap", landSizeHeatmap);
router.post("/sensitivity", getSensitivity);

export default router;
