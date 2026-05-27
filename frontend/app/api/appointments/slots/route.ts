import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAvailableSlots } from "@/lib/appointments/slots";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const branchId = searchParams.get("branchId");
    const staffId = searchParams.get("staffId");
    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date");

    if (!branchId || !staffId || !serviceId || !date) {
      return NextResponse.json(
        { success: false, error: "branchId, staffId, serviceId, and date are required" },
        { status: 400 }
      );
    }

    const day = new Date(date);
    if (Number.isNaN(day.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid date format" }, { status: 400 });
    }

    const slots = await getAvailableSlots({
      branchId,
      staffId,
      serviceId,
      date: day,
    });

    return NextResponse.json({ success: true, data: slots, date, staffId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch slots";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
