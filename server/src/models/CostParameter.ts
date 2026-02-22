import mongoose, { Schema, Document } from "mongoose";

export interface ICostParameter extends Document {
  name: string;
  category: "Input" | "Labor" | "Logistics" | "Miscellaneous" | "Fixed";
  defaultUnit: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const costParameterSchema = new Schema<ICostParameter>(
  {
    name: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ["Input", "Labor", "Logistics", "Miscellaneous", "Fixed"],
      required: true,
    },
    defaultUnit: { type: String, default: "₹/Acre" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model<ICostParameter>(
  "CostParameter",
  costParameterSchema,
);
