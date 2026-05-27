import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Session from "@/lib/models/Session";

export async function GET() {
  try {
    await connectDB();
    const sessions = await Session.find()
      .populate("customerId", "name phone membershipTier")
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch sessions";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
