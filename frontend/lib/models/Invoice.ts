import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IInvoiceLineItem {
  serviceId?: Types.ObjectId;
  serviceName: string;
  staffId?: Types.ObjectId;
  staffName: string;
  price: number;
  commissionRate: number;
  commissionAmount: number;
}

export interface IInvoice {
  invoiceNumber?: string;
  appointmentId?: Types.ObjectId;
  customerId: Types.ObjectId;
  branchId: Types.ObjectId;
  lineItems: IInvoiceLineItem[];
  subtotal?: number;
  discountType?: "flat" | "percentage" | "membership" | "loyalty";
  discountValue: number;
  discountAmount: number;
  loyaltyPointsRedeemed: number;
  taxRate: number;
  taxAmount?: number;
  total?: number;
  paymentMethod?: "cash" | "card" | "upi" | "split";
  paymentSplit?: {
    cash?: number;
    card?: number;
    upi?: number;
  };
  status: "paid" | "pending" | "cancelled";
  sentToWhatsApp: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LineItemSchema = new Schema<IInvoiceLineItem>(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    serviceName: { type: String, required: true },
    staffId: { type: Schema.Types.ObjectId, ref: "User" },
    staffName: { type: String, required: true },
    price: { type: Number, required: true },
    commissionRate: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, unique: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    lineItems: { type: [LineItemSchema], default: [] },
    subtotal: { type: Number },
    discountType: {
      type: String,
      enum: ["flat", "percentage", "membership", "loyalty"],
    },
    discountValue: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    loyaltyPointsRedeemed: { type: Number, default: 0 },
    taxRate: { type: Number, default: 18 },
    taxAmount: { type: Number },
    total: { type: Number },
    paymentMethod: { type: String, enum: ["cash", "card", "upi", "split"] },
    paymentSplit: {
      cash: { type: Number },
      card: { type: Number },
      upi: { type: Number },
    },
    status: { type: String, enum: ["paid", "pending", "cancelled"], default: "paid" },
    sentToWhatsApp: { type: Boolean, default: false },
  },
  { timestamps: true }
);

InvoiceSchema.pre("save", async function (next) {
  if (this.invoiceNumber) {
    return next;
  }

  try {
    const count = await mongoose.model("Invoice").countDocuments();
    const nextNumber = String(count + 1).padStart(4, "0");
    this.invoiceNumber = `INV-${nextNumber}`;
    return next;
  } catch (error) {
    return error as Error;
  }
});

const Invoice =
  (mongoose.models.Invoice as Model<IInvoice>) ||
  mongoose.model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;
