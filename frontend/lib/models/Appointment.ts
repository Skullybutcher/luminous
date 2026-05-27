import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IAppointment {
  customerId: Types.ObjectId;
  branchId: Types.ObjectId;
  staffId: Types.ObjectId;
  serviceId: Types.ObjectId;
  slot: Date;
  duration?: number;
  status:
    | "pending"
    | "confirmed"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "no-show";
  channel: "web" | "whatsapp" | "walkin" | "call";
  price?: number;
  notes?: string;
  cancellationReason?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    staffId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    slot: { type: Date, required: true },
    duration: { type: Number },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "pending",
    },
    channel: { type: String, enum: ["web", "whatsapp", "walkin", "call"], default: "web" },
    price: { type: Number },
    notes: { type: String },
    cancellationReason: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

AppointmentSchema.index({ branchId: 1, slot: 1, status: 1 });
AppointmentSchema.index({ staffId: 1, slot: 1 });
AppointmentSchema.index({ customerId: 1 });
AppointmentSchema.index({ branchId: 1, status: 1 });

const Appointment =
  (mongoose.models.Appointment as Model<IAppointment>) ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;
