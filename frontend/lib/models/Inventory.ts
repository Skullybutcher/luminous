import mongoose, { Schema, type Model } from "mongoose";

export interface IInventory {
  name: string;
  category: string;
  current: number;
  max: number;
  min: number;
  unit: string;
  cost: number;
  retail: number;
  restocked?: string;
  status: "CRITICAL" | "LOW" | "GOOD";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    current: { type: Number, required: true },
    max: { type: Number, required: true },
    min: { type: Number, required: true },
    unit: { type: String, required: true },
    cost: { type: Number, required: true },
    retail: { type: Number, required: true },
    restocked: { type: String },
    status: { type: String, enum: ["CRITICAL", "LOW", "GOOD"], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Inventory =
  (mongoose.models.Inventory as Model<IInventory>) ||
  mongoose.model<IInventory>("Inventory", InventorySchema);

export default Inventory;
