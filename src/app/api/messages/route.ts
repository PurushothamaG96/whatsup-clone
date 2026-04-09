import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { getAuthUser } from "@/lib/auth";
import { uploadToCloudinary, uploadVideoToCloudinary } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 50;

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: authUser.userId,
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const messages = await Message.find({
      conversationId,
      deletedFor: { $ne: authUser.userId },
    })
      .populate("sender", "name avatar")
      .populate("replyTo", "content type sender mediaUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: authUser.userId },
        readBy: { $ne: authUser.userId },
      },
      { $addToSet: { readBy: authUser.userId }, $set: { status: "read" } }
    );

    return NextResponse.json({
      messages: messages.reverse(),
      page,
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { conversationId, content, type, mediaData, fileName, fileSize, replyTo } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    // Verify participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: authUser.userId,
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    let mediaUrl: string | undefined;
    let mediaPublicId: string | undefined;
    let mediaThumbnail: string | undefined;

    // Handle media upload
    if (mediaData && type !== "text") {
      if (type === "video") {
        const result = await uploadVideoToCloudinary(
          mediaData,
          "whatsapp-clone/videos"
        );
        mediaUrl = result.url;
        mediaPublicId = result.public_id;
        mediaThumbnail = result.thumbnail;
      } else {
        const result = await uploadToCloudinary(
          mediaData,
          `whatsapp-clone/${type}s`
        );
        mediaUrl = result.url;
        mediaPublicId = result.public_id;
      }
    }

    const message = await Message.create({
      conversationId,
      sender: authUser.userId,
      content: content || "",
      type: type || "text",
      mediaUrl,
      mediaPublicId,
      mediaThumbnail,
      fileName,
      fileSize,
      replyTo: replyTo || null,
      readBy: [authUser.userId],
    });

    await message.populate("sender", "name avatar");
    if (replyTo) {
      await message.populate("replyTo", "content type sender mediaUrl");
    }

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
