import { Router } from "express";
import { getAllCrops, getCropById } from "../controllers/cropController";
import { getMspTrend } from "../controllers/estimateController";

const router: Router = Router();

router.get("/", getAllCrops);
router.get("/:id", getCropById);
router.get("/:id/msp-trend", getMspTrend);

export default router;
