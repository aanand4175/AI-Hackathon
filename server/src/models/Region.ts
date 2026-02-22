import mongoose, { Schema } from "mongoose";
import type { IRegion } from "../types";

const regionSchema = new Schema<IRegion>(
  {
    district: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    soilType: {
      type: String,
      required: true,
    },
    avgRainfallMM: {
      type: Number,
      required: true,
    },
    yieldMultiplier: {
      type: Number, // 0.5 to 1.5 — multiplied to base yield
      default: 1.0,
    },
    irrigationAvailability: {
      type: String,
      enum: ["Good", "Moderate", "Poor"],
      default: "Moderate",
    },
    riskFactors: [
      {
        factor: String,
        severity: { type: String, enum: ["Low", "Medium", "High"] },
        description: String,
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model<IRegion>("Region", regionSchema);
