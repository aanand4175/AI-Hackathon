import { Request, Response } from "express";
import Region from "../models/Region";

// @desc    Get all regions
// @route   GET /api/regions
const getAllRegions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const regions = await Region.find().select(
      "district state soilType avgRainfallMM yieldMultiplier irrigationAvailability",
    );
    res.json({ success: true, count: regions.length, data: regions });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get region by ID
// @route   GET /api/regions/:id
const getRegionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const region = await Region.findById(req.params.id);
    if (!region) {
      res.status(404).json({ success: false, message: "Region not found" });
      return;
    }
    res.json({ success: true, data: region });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export { getAllRegions, getRegionById };
