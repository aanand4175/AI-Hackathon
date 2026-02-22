import { Request, Response } from "express";
import { Admin } from "../models/Admin";
import Crop from "../models/Crop";
import Region from "../models/Region";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "farmprofit_admin_secret_key_2026";

export const loginAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "24h" });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDashboardStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const totalCrops = await Crop.countDocuments();
    const totalRegions = await Region.countDocuments();

    res.json({
      success: true,
      data: {
        totalCrops,
        totalRegions,
        recentEstimates: 142, // Placeholder
        activeUsers: 85, // Placeholder
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- CROP CRUD OPERATIONS ---

export const getAdminCrops = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const crops = await Crop.find().sort({ name: 1 });
    res.json({ success: true, data: crops });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAdminCropById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      res.status(404).json({ success: false, error: "Crop not found" });
      return;
    }
    res.json({ success: true, data: crop });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createAdminCrop = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const newCrop = new Crop(req.body);
    await newCrop.save();
    res.status(201).json({ success: true, data: newCrop });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAdminCrop = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const updatedCrop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedCrop) {
      res.status(404).json({ success: false, error: "Crop not found" });
      return;
    }
    res.json({ success: true, data: updatedCrop });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAdminCrop = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const deletedCrop = await Crop.findByIdAndDelete(req.params.id);
    if (!deletedCrop) {
      res.status(404).json({ success: false, error: "Crop not found" });
      return;
    }
    res.json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- REGION CRUD OPERATIONS ---

export const getAdminRegions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const regions = await Region.find().sort({ state: 1, district: 1 });
    res.json({ success: true, data: regions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAdminRegionById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const region = await Region.findById(req.params.id);
    if (!region) {
      res.status(404).json({ success: false, error: "Region not found" });
      return;
    }
    res.json({ success: true, data: region });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createAdminRegion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const newRegion = new Region(req.body);
    await newRegion.save();
    res.status(201).json({ success: true, data: newRegion });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAdminRegion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const updatedRegion = await Region.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updatedRegion) {
      res.status(404).json({ success: false, error: "Region not found" });
      return;
    }
    res.json({ success: true, data: updatedRegion });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAdminRegion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const deletedRegion = await Region.findByIdAndDelete(req.params.id);
    if (!deletedRegion) {
      res.status(404).json({ success: false, error: "Region not found" });
      return;
    }
    res.json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
