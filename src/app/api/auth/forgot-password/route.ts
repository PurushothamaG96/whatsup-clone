import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { signResetToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        {
          message:
            "If that email is registered, you will receive password reset instructions shortly.",
        },
        { status: 200 }
      );
    }

    const resetToken = signResetToken({
      userId: user._id.toString(),
      email: user.email,
    });
    const origin = new URL(req.url).origin;
    const resetUrl = `${origin}/reset-password?token=${resetToken}`;

    return NextResponse.json(
      {
        message:
          "Password reset instructions have been generated.",
        resetUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
