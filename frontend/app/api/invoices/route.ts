import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/lib/models/Invoice";
import Appointment from "@/lib/models/Appointment";
import Customer from "@/lib/models/Customer";
import Service from "@/lib/models/Service";
import User from "@/lib/models/User";

const TAX_RATE = 0.18;

export async function GET() {
  try {
    await connectDB();
    const invoices = await Invoice.find()
      .populate("customerId", "name phone")
      .populate("branchId", "name")
      .populate("appointmentId", "slot status")
      .populate("lineItems.serviceId", "name duration category")
      .populate("lineItems.staffId", "name");

    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch invoices";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      appointmentId,
      customerId,
      branchId,
      lineItems,
      discountType,
      discountValue,
      loyaltyPointsRedeemed,
      paymentMethod,
      paymentSplit,
    } = body ?? {};

    if (!customerId || !branchId || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "customerId, branchId, and lineItems are required" },
        { status: 400 }
      );
    }

    const staffIds = [...new Set(lineItems.map((item) => item.staffId).filter(Boolean))];
    const serviceIds = [...new Set(lineItems.map((item) => item.serviceId).filter(Boolean))];

    const [staffList, serviceList] = await Promise.all([
      User.find({ _id: { $in: staffIds } }),
      Service.find({ _id: { $in: serviceIds } }),
    ]);

    const staffMap = new Map(staffList.map((staff) => [staff._id.toString(), staff]));
    const serviceMap = new Map(serviceList.map((service) => [service._id.toString(), service]));

    const normalizedItems = lineItems.map((item) => {
      const staff = item.staffId ? staffMap.get(item.staffId.toString()) : undefined;
      const service = item.serviceId ? serviceMap.get(item.serviceId.toString()) : undefined;
      const commissionRate = staff?.commissionRate ?? 0;
      const price = Number(item.price ?? 0);
      const commissionAmount = Math.round(price * (commissionRate / 100));

      return {
        serviceId: item.serviceId,
        serviceName: service?.name ?? item.serviceName ?? "Service",
        staffId: item.staffId,
        staffName: staff?.name ?? item.staffName ?? "Staff",
        price,
        commissionRate,
        commissionAmount,
      };
    });

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.price, 0);
    const normalizedDiscountValue = Number(discountValue ?? 0);
    const redeemedPoints = Number(loyaltyPointsRedeemed ?? 0);

    let discountAmount = 0;
    if (discountType === "flat") {
      discountAmount = normalizedDiscountValue;
    } else if (discountType === "percentage") {
      discountAmount = Math.round(subtotal * (normalizedDiscountValue / 100));
    } else if (discountType === "loyalty") {
      discountAmount = Math.round(redeemedPoints * 0.5);
    }

    const taxable = subtotal - discountAmount;
    const taxAmount = Math.round(taxable * TAX_RATE);
    const total = taxable + taxAmount;

    const invoice = await Invoice.create({
      appointmentId,
      customerId,
      branchId,
      lineItems: normalizedItems,
      subtotal,
      discountType,
      discountValue: normalizedDiscountValue,
      discountAmount,
      loyaltyPointsRedeemed: redeemedPoints,
      taxRate: TAX_RATE * 100,
      taxAmount,
      total,
      paymentMethod,
      paymentSplit,
      status: "paid",
      sentToWhatsApp: false,
    });

    if (appointmentId) {
      await Appointment.updateOne(
        { _id: appointmentId },
        { $set: { status: "completed", completedAt: new Date() } }
      );
    }

    const earnedPoints = Math.floor(total / 100);
    await Customer.updateOne(
      { _id: customerId },
      { $inc: { totalSpend: total, loyaltyPoints: earnedPoints - redeemedPoints } }
    );

    const populated = await Invoice.findById(invoice._id)
      .populate("customerId", "name phone")
      .populate("branchId", "name")
      .populate("appointmentId", "slot status")
      .populate("lineItems.serviceId", "name duration")
      .populate("lineItems.staffId", "name");

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create invoice";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
