import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { getAuthUser } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function DELETE(
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
    const { searchParams } = new URL(req.url);
    const deleteForEveryone = searchParams.get("everyone") === "true";

    const message = await Message.findById(id);
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (deleteForEveryone && message.sender.toString() === authUser.userId) {
      // Delete for everyone
      if (message.mediaPublicId) {
        await deleteFromCloudinary(message.mediaPublicId);
      }
      message.isDeleted = true;
      message.content = "";
      message.mediaUrl = undefined;
      await message.save();
    } else {
      // Delete for me only
      await Message.findByIdAndUpdate(id, {
        $addToSet: { deletedFor: authUser.userId },
      });
    }

    return NextResponse.json({ message: "Message deleted" });
  } catch (error) {
    console.error("Delete message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
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
    const { emoji } = await req.json();

    const message = await Message.findById(id);
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const existingReaction = message.reactions.find((r) => r.emoji === emoji);
    if (existingReaction) {
      const userIndex = existingReaction.users.findIndex(
        (u) => u.toString() === authUser.userId
      );
      if (userIndex > -1) {
        existingReaction.users.splice(userIndex, 1);
        if (existingReaction.users.length === 0) {
          message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
        }
      } else {
        existingReaction.users.push(authUser.userId as unknown as import("mongoose").Types.ObjectId);
      }
    } else {
      message.reactions.push({
        emoji,
        users: [authUser.userId as unknown as import("mongoose").Types.ObjectId],
      });
    }

    await message.save();
    return NextResponse.json({ message });
  } catch (error) {
    console.error("React to message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
