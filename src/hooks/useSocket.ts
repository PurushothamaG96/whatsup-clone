"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import Cookies from "js-cookie";

let socket: Socket | null = null;

export function useSocket() {
  const { user } = useAuthStore();
  const {
    addMessage,
    updateMessage,
    setTypingUser,
    removeTypingUser,
    updateUserOnlineStatus,
    updateConversation,
    incrementUnread,
    activeConversation,
  } = useChatStore();

  const activeConversationRef = useRef(activeConversation);
  activeConversationRef.current = activeConversation;

  useEffect(() => {
    if (!user) return;

    // Get token from cookie (we'll use a client-accessible token approach)
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("client_token="))
      ?.split("=")[1];

    if (!token) return;

    socket = io(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("message:new", (message) => {
      addMessage(message.conversationId, message);
      updateConversation(message.conversationId, {
        lastMessage: message,
        lastMessageAt: message.createdAt,
      });

      // Increment unread if not in active conversation
      if (activeConversationRef.current?._id !== message.conversationId) {
        incrementUnread(message.conversationId);
      }
    });

    socket.on("message:deleted", ({ messageId, conversationId }) => {
      updateMessage(conversationId, messageId, { isDeleted: true, content: "" });
    });

    socket.on("message:reacted", ({ messageId, conversationId, emoji, userId }) => {
      // Trigger a re-fetch or update reactions
    });

    socket.on("typing:start", (data) => {
      setTypingUser(data);
    });

    socket.on("typing:stop", ({ userId, conversationId }) => {
      removeTypingUser(userId, conversationId);
    });

    socket.on("message:read", ({ userId, messageIds, conversationId }) => {
      messageIds?.forEach((id: string) => {
        updateMessage(conversationId, id, { status: "read" });
      });
    });

    socket.on("user:status", ({ userId, isOnline, lastSeen }) => {
      updateUserOnlineStatus(userId, isOnline, lastSeen);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [user]);

  return socket;
}

export function getSocket() {
  return socket;
}

export function joinConversation(conversationId: string) {
  socket?.emit("join:conversation", conversationId);
}

export function leaveConversation(conversationId: string) {
  socket?.emit("leave:conversation", conversationId);
}

export function sendSocketMessage(conversationId: string, message: unknown) {
  socket?.emit("message:send", { conversationId, message });
}

export function emitTypingStart(conversationId: string, userName: string) {
  socket?.emit("typing:start", { conversationId, userName });
}

export function emitTypingStop(conversationId: string) {
  socket?.emit("typing:stop", { conversationId });
}

export function emitMessageRead(conversationId: string, messageIds: string[]) {
  socket?.emit("message:read", { conversationId, messageIds });
}
