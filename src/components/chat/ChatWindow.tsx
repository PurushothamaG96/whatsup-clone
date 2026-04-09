"use client";
import { useState, useEffect, useRef } from "react";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import TypingIndicator from "./TypingIndicator";
import { emitMessageRead } from "@/hooks/useSocket";

export default function ChatWindow() {
  const { user } = useAuthStore();
  const { activeConversation, messages, typingUsers } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const convId = activeConversation?._id || "";
  const convMessages = messages[convId] || [];

  const typingInThisConv = typingUsers.filter(
    (t) => t.conversationId === convId && t.userId !== user?._id
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convMessages, typingInThisConv]);

  // Mark unread messages as read
  useEffect(() => {
    if (!user || !convId || convMessages.length === 0) return;
    const unreadIds = convMessages
      .filter((m) => m.sender._id !== user._id && !m.readBy.includes(user._id))
      .map((m) => m._id);
    if (unreadIds.length > 0) {
      emitMessageRead(convId, unreadIds);
    }
  }, [convMessages, user, convId]);

  // Group messages by date
  const groupedMessages = convMessages.reduce<{ date: string; msgs: typeof convMessages }[]>(
    (groups, msg) => {
      const date = new Date(msg.createdAt).toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === date) {
        lastGroup.msgs.push(msg);
      } else {
        groups.push({ date, msgs: [msg] });
      }
      return groups;
    },
    []
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0b141a" }}>
      {/* Header */}
      <ChatHeader />

      {/* Messages */}
      <div
        style={{
          flex: 1, overflowY: "auto", padding: "12px 0",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%230b141a'/%3E%3C/svg%3E")`,
        }}
      >
        {groupedMessages.map(({ date, msgs }) => (
          <div key={date}>
            {/* Date divider */}
            <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
              <span style={{
                background: "#182229", color: "#8696a0", fontSize: "12px",
                padding: "4px 12px", borderRadius: "8px",
              }}>
                {date}
              </span>
            </div>

            {msgs.map((msg, idx) => {
              const isOwn = msg.sender._id === user?._id;
              const prevMsg = idx > 0 ? msgs[idx - 1] : null;
              const showAvatar = !isOwn && (!prevMsg || prevMsg.sender._id !== msg.sender._id);

              return (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  isGroup={activeConversation?.isGroup || false}
                />
              );
            })}
          </div>
        ))}

        {/* Typing Indicator */}
        {typingInThisConv.length > 0 && (
          <TypingIndicator users={typingInThisConv} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput />
    </div>
  );
}
