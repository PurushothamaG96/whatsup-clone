import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyResetToken, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    const payload = verifyResetToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      _id: payload.userId,
      email: payload.email,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Unable to reset password" },
        { status: 400 }
      );
    }

    user.password = password;
    await user.save();

    const authToken = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const response = NextResponse.json(
      { message: "Password has been reset successfully" },
      { status: 200 }
    );

    response.cookies.set("token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    // Non-httpOnly token for socket.io client authentication
    response.cookies.set("client_token", authToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
