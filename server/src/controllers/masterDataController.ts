import { Request, Response } from "express";
import Category from "../models/Category";
import State from "../models/State";
import Irrigation from "../models/Irrigation";
import CostParameter from "../models/CostParameter";

// --- GENERIC CRUD GENERATOR ---
const createCrudController = (Model: any, modelName: string) => {
  return {
    getAll: async (req: Request, res: Response): Promise<void> => {
      try {
        const items = await Model.find().sort({ name: 1, typeName: 1 });
        res.json({ success: true, data: items });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    },
    getById: async (req: Request, res: Response): Promise<void> => {
      try {
        const item = await Model.findById(req.params.id);
        if (!item) {
          res
            .status(404)
            .json({ success: false, error: `${modelName} not found` });
          return;
        }
        res.json({ success: true, data: item });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    },
    create: async (req: Request, res: Response): Promise<void> => {
      try {
        const newItem = new Model(req.body);
        await newItem.save();
        res.status(201).json({ success: true, data: newItem });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    },
    update: async (req: Request, res: Response): Promise<void> => {
      try {
        const updatedItem = await Model.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true, runValidators: true },
        );
        if (!updatedItem) {
          res
            .status(404)
            .json({ success: false, error: `${modelName} not found` });
          return;
        }
        res.json({ success: true, data: updatedItem });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    },
    remove: async (req: Request, res: Response): Promise<void> => {
      try {
        const deletedItem = await Model.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
          res
            .status(404)
            .json({ success: false, error: `${modelName} not found` });
          return;
        }
        res.json({ success: true, data: {} });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    },
  };
};

export const CategoryController = createCrudController(Category, "Category");
export const StateController = createCrudController(State, "State");
export const IrrigationController = createCrudController(
  Irrigation,
  "Irrigation Setup",
);
export const CostParameterController = createCrudController(
  CostParameter,
  "Cost Parameter",
);
