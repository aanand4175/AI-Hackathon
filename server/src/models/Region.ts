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
      type: Number,
      default: 1.0,
    },
    irrigationAvailability: {
      type: String,
      enum: ["Good", "Moderate", "Poor"],
      default: "Moderate",
    },
    waterAvailabilityMM: {
      type: Number,
      default: 600,
    },
    supportedFarmingTypes: {
      type: [String],
      default: ["open_field"],
    },
    recommendedIrrigationTypes: {
      type: [String],
      default: [],
    },
    costAdjustmentByCategory: {
      type: Object,
      default: {},
    },
    costAdjustmentByFarmingType: {
      type: Object,
      default: {},
    },
    riskFactors: [
      {
        factor: String,
        severity: { type: String, enum: ["Low", "Medium", "High"] },
        description: String,
      },
    ],
    govSchemes: [
      {
        name: { type: String },
        schemeType: { type: String },
        description: { type: String },
        benefit: { type: String },
      },
    ],
    weatherMock: {
      avgTempC: { type: Number, default: 30 },
      forecast: [
        {
          day: String,
          tempC: Number,
          rainfallMM: Number,
          condition: String,
        },
      ],
    },
  },
  { timestamps: true },
);

export default mongoose.model<IRegion>("Region", regionSchema);
