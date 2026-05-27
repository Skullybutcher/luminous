import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/lib/models/Appointment";
import Service from "@/lib/models/Service";
import Customer from "@/lib/models/Customer";

const ACTIVE_STATUSES = ["pending", "confirmed"];

function getDayRange(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const branchId = searchParams.get("branchId");
    const staffId = searchParams.get("staffId");
    const status = searchParams.get("status");
    const date = searchParams.get("date");

    const filter: Record<string, unknown> = {};

    if (branchId) {
      filter.branchId = branchId;
    }

    if (staffId) {
      filter.staffId = staffId;
    }

    if (status) {
      filter.status = status;
    }

    if (date) {
      const range = getDayRange(date);
      if (!range) {
        return NextResponse.json(
          { success: false, error: "Invalid date format" },
          { status: 400 }
        );
      }
      filter.slot = { $gte: range.start, $lt: range.end };
    }

    const appointments = await Appointment.find(filter)
      .populate("customerId", "name phone")
      .populate("staffId", "name")
      .populate("serviceId", "name duration category")
      .populate("branchId", "name")
      .sort({ slot: 1 });

    return NextResponse.json({ success: true, data: appointments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch appointments";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { customerId, branchId, staffId, serviceId, slot, channel, notes } = body ?? {};

    if (!customerId || !branchId || !staffId || !serviceId || !slot) {
      return NextResponse.json(
        { success: false, error: "customerId, branchId, staffId, serviceId, and slot are required" },
        { status: 400 }
      );
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    const requestedSlot = new Date(slot);
    if (Number.isNaN(requestedSlot.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid slot format" }, { status: 400 });
    }

    const requestedEnd = new Date(requestedSlot.getTime() + service.duration * 60000);

    const conflict = await Appointment.findOne({
      staffId,
      status: { $in: ACTIVE_STATUSES },
      slot: { $gte: requestedSlot, $lt: requestedEnd },
    });

    if (conflict) {
      return NextResponse.json(
        { success: false, error: "Staff not available at this time" },
        { status: 409 }
      );
    }

    const appointment = await Appointment.create({
      customerId,
      branchId,
      staffId,
      serviceId,
      slot: requestedSlot,
      channel: channel ?? "web",
      notes,
      duration: service.duration,
      price: service.price,
      status: "pending",
    });

    await Customer.updateOne({ _id: customerId }, { $inc: { totalVisits: 1 } });

    const populated = await Appointment.findById(appointment._id)
      .populate("customerId", "name phone")
      .populate("staffId", "name")
      .populate("serviceId", "name duration category")
      .populate("branchId", "name");

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create appointment";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
