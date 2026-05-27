import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Service from "@/lib/models/Service";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");

    const filter = category ? { category } : {};
    const services = await Service.find(filter).sort({ name: 1 });

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch services";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
