import { Router } from "express";
import {
  CategoryController,
  StateController,
  IrrigationController,
  CostParameterController,
} from "../controllers/masterDataController";

const router: Router = Router();

// Public Master Data - Category
router.get("/categories", CategoryController.getAll);
router.get("/categories/:id", CategoryController.getById);

// Public Master Data - State
router.get("/states", StateController.getAll);
router.get("/states/:id", StateController.getById);

// Public Master Data - Irrigation
router.get("/irrigations", IrrigationController.getAll);
router.get("/irrigations/:id", IrrigationController.getById);

// Public Master Data - CostParameter
router.get("/costs", CostParameterController.getAll);
router.get("/costs/:id", CostParameterController.getById);

export default router;
