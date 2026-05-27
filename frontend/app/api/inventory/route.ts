import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inventory from "@/lib/models/Inventory";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const items = await Inventory.find().sort({ name: 1 });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch inventory";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
