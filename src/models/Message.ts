import mongoose, { Schema, Document, Model } from "mongoose";

export type MessageType = "text" | "image" | "video" | "audio" | "document" | "emoji";
export type MessageStatus = "sent" | "delivered" | "read";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  type: MessageType;
  mediaUrl?: string;
  mediaPublicId?: string;
  mediaThumbnail?: string;
  fileName?: string;
  fileSize?: number;
  status: MessageStatus;
  readBy: mongoose.Types.ObjectId[];
  replyTo?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedFor: mongoose.Types.ObjectId[];
  reactions: {
    emoji: string;
    users: mongoose.Types.ObjectId[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "document", "emoji"],
      default: "text",
    },
    mediaUrl: String,
    mediaPublicId: String,
    mediaThumbnail: String,
    fileName: String,
    fileSize: Number,
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reactions: [
      {
        emoji: String,
        users: [{ type: Schema.Types.ObjectId, ref: "User" }],
      },
    ],
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
