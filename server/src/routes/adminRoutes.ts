import { Router } from "express";
import {
  loginAdmin,
  getDashboardStats,
  getAdminCrops,
  getAdminCropById,
  createAdminCrop,
  updateAdminCrop,
  deleteAdminCrop,
  getAdminRegions,
  getAdminRegionById,
  createAdminRegion,
  updateAdminRegion,
  deleteAdminRegion,
} from "../controllers/adminController";

import { adminAuth } from "../middleware/auth";

const router: Router = Router();

// Public route for login
router.post("/login", loginAdmin);

// Protected Dashboard route
router.get("/stats", adminAuth, getDashboardStats);

import {
  CategoryController,
  StateController,
  IrrigationController,
  CostParameterController,
} from "../controllers/masterDataController";

// Protected Crop CRUD routes
router.get("/crops", adminAuth, getAdminCrops);
router.get("/crops/:id", adminAuth, getAdminCropById);
router.post("/crops", adminAuth, createAdminCrop);
router.put("/crops/:id", adminAuth, updateAdminCrop);
router.delete("/crops/:id", adminAuth, deleteAdminCrop);

// Protected Region CRUD routes
router.get("/regions", adminAuth, getAdminRegions);
router.get("/regions/:id", adminAuth, getAdminRegionById);
router.post("/regions", adminAuth, createAdminRegion);
router.put("/regions/:id", adminAuth, updateAdminRegion);
router.delete("/regions/:id", adminAuth, deleteAdminRegion);

// Master Data - Category
router.get("/categories", adminAuth, CategoryController.getAll);
router.get("/categories/:id", adminAuth, CategoryController.getById);
router.post("/categories", adminAuth, CategoryController.create);
router.put("/categories/:id", adminAuth, CategoryController.update);
router.delete("/categories/:id", adminAuth, CategoryController.remove);

// Master Data - State
router.get("/states", adminAuth, StateController.getAll);
router.get("/states/:id", adminAuth, StateController.getById);
router.post("/states", adminAuth, StateController.create);
router.put("/states/:id", adminAuth, StateController.update);
router.delete("/states/:id", adminAuth, StateController.remove);

// Master Data - Irrigation
router.get("/irrigations", adminAuth, IrrigationController.getAll);
router.get("/irrigations/:id", adminAuth, IrrigationController.getById);
router.post("/irrigations", adminAuth, IrrigationController.create);
router.put("/irrigations/:id", adminAuth, IrrigationController.update);
router.delete("/irrigations/:id", adminAuth, IrrigationController.remove);

// Master Data - CostParameter
router.get("/costs", adminAuth, CostParameterController.getAll);
router.get("/costs/:id", adminAuth, CostParameterController.getById);
router.post("/costs", adminAuth, CostParameterController.create);
router.put("/costs/:id", adminAuth, CostParameterController.update);
router.delete("/costs/:id", adminAuth, CostParameterController.remove);

export default router;
