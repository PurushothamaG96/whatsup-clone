import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const user = await User.findById(id).select(
      "name email phone avatar status about isOnline lastSeen"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (authUser.userId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { name, status, about, phone, avatar } = body;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle avatar upload
    if (avatar && avatar.startsWith("data:")) {
      if (user.avatarPublicId) {
        await deleteFromCloudinary(user.avatarPublicId);
      }
      const { url, public_id } = await uploadToCloudinary(
        avatar,
        "whatsapp-clone/avatars"
      );
      user.avatar = url;
      user.avatarPublicId = public_id;
    }

    if (name) user.name = name;
    if (status !== undefined) user.status = status;
    if (about !== undefined) user.about = about;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
        about: user.about,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
