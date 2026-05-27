import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "stylist" | "receptionist";
  branchId?: Types.ObjectId;
  commissionRate: number;
  specializations: string[];
  isActive: boolean;
  avatar?: string;
  joiningDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "manager", "stylist", "receptionist"],
      required: true,
    },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    commissionRate: { type: Number, default: 10 },
    specializations: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    avatar: { type: String },
    joiningDate: { type: Date },
  },
  { timestamps: true }
);

const User =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
