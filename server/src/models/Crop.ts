import mongoose, { Schema } from "mongoose";
import type { ICrop } from "../types";

const cropSchema = new Schema<ICrop>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
    },
    baseYieldPerAcre: {
      type: Number,
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
    waterRequirementMM: {
      type: Number,
      default: 500,
    },
    mspPerQuintal: {
      type: Number,
      required: true,
    },
    marketPricePerQuintal: {
      type: Number,
      required: true,
    },
    mandiPrice: {
      type: Number,
      default: 0,
    },
    onlinePrice: {
      type: Number,
      default: 0,
    },
    marketDemand: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    defaultCosts: {
      seeds: { type: Number, default: 0 },
      fertilizer: { type: Number, default: 0 },
      pesticide: { type: Number, default: 0 },
      labor: { type: Number, default: 0 },
      irrigation: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      misc: { type: Number, default: 0 },
    },
    mspHistory: [
      {
        year: Number,
        msp: Number,
      },
    ],
    pestRules: [
      {
        name: String,
        probability: Number,
        severity: { type: String, enum: ["Low", "Medium", "High"] },
        season: String,
        description: String,
      },
    ],
    cropRotation: [
      {
        nextCrop: String,
        benefit: String,
      },
    ],
    soilSuitability: {
      type: Object,
      default: {},
    },
    temperatureRange: {
      min: { type: Number, default: 15 },
      max: { type: Number, default: 40 },
    },
    costTips: [String],
  },
  { timestamps: true },
);

export default mongoose.model<ICrop>("Crop", cropSchema);
