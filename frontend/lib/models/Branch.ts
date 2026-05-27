import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IBranch {
  name: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  operatingHours: {
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }[];
  status: "open" | "closing" | "closed";
  managerId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OperatingHoursSchema = new Schema(
  {
    day: { type: String, required: true },
    open: { type: String, required: true },
    close: { type: String, required: true },
    isOpen: { type: Boolean, required: true, default: true },
  },
  { _id: false }
);

const BranchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    operatingHours: { type: [OperatingHoursSchema], default: [] },
    status: {
      type: String,
      enum: ["open", "closing", "closed"],
      default: "open",
    },
    managerId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Branch =
  (mongoose.models.Branch as Model<IBranch>) ||
  mongoose.model<IBranch>("Branch", BranchSchema);

export default Branch;
