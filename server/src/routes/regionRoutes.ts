import { Router } from "express";
import { getAllRegions, getRegionById } from "../controllers/regionController";

const router: Router = Router();

router.get("/", getAllRegions);
router.get("/:id", getRegionById);

export default router;
