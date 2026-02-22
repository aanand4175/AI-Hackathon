import { Router } from "express";
import { calculateEstimate } from "../controllers/estimateController";

const router: Router = Router();

router.post("/", calculateEstimate);

export default router;
