import mongoose, { Schema, Document } from "mongoose";

export interface IIrrigation extends Document {
  typeName: string;
  description: string;
  efficiencyRating: "Low" | "Medium" | "High";
  costPerAcre: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const irrigationSchema = new Schema<IIrrigation>(
  {
    typeName: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    efficiencyRating: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    costPerAcre: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model<IIrrigation>("Irrigation", irrigationSchema);
