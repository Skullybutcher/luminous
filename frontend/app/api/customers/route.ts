import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const phone = searchParams.get("phone");

    const filter = phone ? { phone } : {};
    const customers = await Customer.find(filter).sort({ name: 1 });

    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch customers";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
