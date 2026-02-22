import { Router } from "express";
import { getAllCrops, getCropById } from "../controllers/cropController";

const router: Router = Router();

router.get("/", getAllCrops);
router.get("/:id", getCropById);

export default router;
