import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Branch from "@/lib/models/Branch";

export async function GET() {
  try {
    await connectDB();
    const branches = await Branch.find().sort({ name: 1 });

    return NextResponse.json({ success: true, data: branches });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch branches";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, address, city, phone, email, operatingHours, status, managerId } = body ?? {};

    if (!name || !address || !city || !phone) {
      return NextResponse.json(
        { success: false, error: "name, address, city, and phone are required" },
        { status: 400 }
      );
    }

    const branch = await Branch.create({
      name,
      address,
      city,
      phone,
      email,
      operatingHours,
      status,
      managerId,
    });

    return NextResponse.json({ success: true, data: branch }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create branch";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
