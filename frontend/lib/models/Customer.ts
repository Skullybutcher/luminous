import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface ICustomer {
  name: string;
  phone: string;
  email?: string;
  membershipTier: "none" | "bronze" | "silver" | "gold";
  membershipDiscount: number;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpend: number;
  preferredBranchId?: Types.ObjectId;
  preferredStaffId?: Types.ObjectId;
  notes?: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    membershipTier: {
      type: String,
      enum: ["none", "bronze", "silver", "gold"],
      default: "none",
    },
    membershipDiscount: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 },
    totalVisits: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
    preferredBranchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    preferredStaffId: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Customer =
  (mongoose.models.Customer as Model<ICustomer>) ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;
