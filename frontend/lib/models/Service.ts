import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IService {
  name: string;
  category: "hair" | "skin" | "nails" | "spa" | "bridal" | "packages";
  duration: number;
  price: number;
  description?: string;
  applicableBranches: Types.ObjectId[];
  isActive: boolean;
  consumables: {
    inventoryItemId: Types.ObjectId;
    quantity: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ConsumableSchema = new Schema(
  {
    inventoryItemId: { type: Schema.Types.ObjectId, ref: "Inventory", required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["hair", "skin", "nails", "spa", "bridal", "packages"],
      required: true,
    },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    applicableBranches: { type: [Schema.Types.ObjectId], ref: "Branch", default: [] },
    isActive: { type: Boolean, default: true },
    consumables: { type: [ConsumableSchema], default: [] },
  },
  { timestamps: true }
);

const Service =
  (mongoose.models.Service as Model<IService>) ||
  mongoose.model<IService>("Service", ServiceSchema);

export default Service;
