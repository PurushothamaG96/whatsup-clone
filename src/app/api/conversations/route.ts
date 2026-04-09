import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const conversations = await Conversation.find({
      participants: authUser.userId,
      archivedBy: { $ne: authUser.userId },
    })
      .populate("participants", "name email avatar status isOnline lastSeen")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name" },
      })
      .sort({ lastMessageAt: -1 });

    // Get unread counts
    const conversationsWithCounts = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          sender: { $ne: authUser.userId },
          readBy: { $ne: authUser.userId },
          isDeleted: false,
        });

        return {
          ...conv.toObject(),
          unreadCount,
        };
      })
    );

    return NextResponse.json({ conversations: conversationsWithCounts });
  } catch (error) {
    console.error("Get conversations error:", error);
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

    const { participantId, isGroup, groupName, participants } = await req.json();

    if (isGroup) {
      // Create group conversation
      if (!groupName || !participants || participants.length < 2) {
        return NextResponse.json(
          { error: "Group name and at least 2 participants required" },
          { status: 400 }
        );
      }

      const conversation = await Conversation.create({
        participants: [authUser.userId, ...participants],
        isGroup: true,
        groupName,
        admin: authUser.userId,
      });

      await conversation.populate(
        "participants",
        "name email avatar status isOnline lastSeen"
      );

      return NextResponse.json({ conversation }, { status: 201 });
    } else {
      // Find or create 1-on-1 conversation
      const existingConversation = await Conversation.findOne({
        isGroup: false,
        participants: { $all: [authUser.userId, participantId], $size: 2 },
      }).populate("participants", "name email avatar status isOnline lastSeen");

      if (existingConversation) {
        return NextResponse.json({ conversation: existingConversation });
      }

      const conversation = await Conversation.create({
        participants: [authUser.userId, participantId],
        isGroup: false,
      });

      await conversation.populate(
        "participants",
        "name email avatar status isOnline lastSeen"
      );

      return NextResponse.json({ conversation }, { status: 201 });
    }
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
