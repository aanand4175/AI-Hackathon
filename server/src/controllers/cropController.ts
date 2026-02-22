import { Request, Response } from "express";
import Crop from "../models/Crop";

// @desc    Get all crops
// @route   GET /api/crops
const getAllCrops = async (_req: Request, res: Response): Promise<void> => {
  try {
    const crops = await Crop.find();
    res.json({ success: true, count: crops.length, data: crops });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single crop by ID
// @route   GET /api/crops/:id
const getCropById = async (req: Request, res: Response): Promise<void> => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      res.status(404).json({ success: false, message: "Crop not found" });
      return;
    }
    res.json({ success: true, data: crop });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export { getAllCrops, getCropById };
