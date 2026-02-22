import mongoose, { Schema } from "mongoose";
import type { ICrop } from "../types";

const cropSchema = new Schema<ICrop>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ["Cereal", "Cash Crop", "Oilseed", "Pulse", "Millet"],
      required: true,
    },
    baseYieldPerAcre: {
      type: Number, // in quintals
      required: true,
    },
    growthDurationDays: {
      type: Number,
      required: true,
    },
    waterRequirement: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    mspPerQuintal: {
      type: Number, // MSP in INR
      required: true,
    },
    marketPricePerQuintal: {
      type: Number, // Avg market price in INR
      required: true,
    },
    defaultCosts: {
      seeds: { type: Number, default: 0 }, // per acre in INR
      fertilizer: { type: Number, default: 0 },
      pesticide: { type: Number, default: 0 },
      labor: { type: Number, default: 0 },
      irrigation: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      misc: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

export default mongoose.model<ICrop>("Crop", cropSchema);
