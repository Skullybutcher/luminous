import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface ISession {
  phone: string;
  customerId?: Types.ObjectId;
  step:
    | "init"
    | "branch_selected"
    | "service_selected"
    | "date_selected"
    | "slot_selected"
    | "details_collected"
    | "completed";
  context?: {
    branchId?: Types.ObjectId;
    serviceId?: Types.ObjectId;
    staffId?: Types.ObjectId;
    selectedDate?: Date;
    selectedSlot?: Date;
    customerName?: string;
    [key: string]: unknown;
  };
  isActive: boolean;
  lastMessageAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    phone: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    step: {
      type: String,
      enum: [
        "init",
        "branch_selected",
        "service_selected",
        "date_selected",
        "slot_selected",
        "details_collected",
        "completed",
      ],
      default: "init",
    },
    context: { type: Schema.Types.Mixed },
    isActive: { type: Boolean, default: true },
    lastMessageAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session =
  (mongoose.models.Session as Model<ISession>) ||
  mongoose.model<ISession>("Session", SessionSchema);

export default Session;
