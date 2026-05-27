import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const branchId = searchParams.get("branchId");
    const role = searchParams.get("role");

    const filter: Record<string, unknown> = {};
    if (branchId) {
      filter.branchId = branchId;
    }
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter).sort({ name: 1 });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
