import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";

export async function POST() {
  try {
    const authUser = await getAuthUser();
    if (authUser) {
      await connectDB();
      await User.findByIdAndUpdate(authUser.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
    }

    const response = NextResponse.json({ message: "Logged out successfully" });
    response.cookies.delete("token");
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
