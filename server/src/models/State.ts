import mongoose, { Schema, Document } from "mongoose";

export interface IState extends Document {
  name: string;
  code: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const stateSchema = new Schema<IState>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model<IState>("State", stateSchema);
