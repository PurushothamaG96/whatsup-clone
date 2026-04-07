"use client";
import { useEffect, useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { joinConversation } from "@/hooks/useSocket";
import toast from "react-hot-toast";

interface SearchUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: string;
  isOnline?: boolean;
}

export default function SearchUsers({ query }: { query: string }) {
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { setActiveConversation, addConversation, conversations, setMessages, setSearchQuery } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (query.length < 2) { setUsers([]); return; }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users);
        }
      } catch {
        toast.error("Search failed");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const startChat = async (targetUser: SearchUser) => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: targetUser._id }),
      });

      if (!res.ok) throw new Error("Failed to start conversation");

      const data = await res.json();
      const conv = data.conversation;

      const exists = conversations.find((c) => c._id === conv._id);
      if (!exists) {
        addConversation({ ...conv, unreadCount: 0 });
      }

      setActiveConversation({ ...conv, unreadCount: 0 });
      joinConversation(conv._id);
      setSearchQuery("");

      // Load messages
      const msgRes = await fetch(`/api/messages?conversationId=${conv._id}`);
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        setMessages(conv._id, msgData.messages);
      }
    } catch {
      toast.error("Failed to open conversation");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#8696a0" }}>
        <div style={{ fontSize: "14px" }}>Searching...</div>
      </div>
    );
  }

  if (users.length === 0 && query.length >= 2) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "#8696a0" }}>
        <p style={{ fontSize: "14px" }}>No users found for "{query}"</p>
      </div>
    );
  }

  return (
    <div>
      {query.length >= 2 && (
        <div style={{ padding: "8px 16px", fontSize: "12px", color: "#8696a0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Contacts on WhatsApp Clone
        </div>
      )}
      {users.map((u) => (
        <div
          key={u._id}
          onClick={() => startChat(u)}
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "12px 16px", cursor: "pointer",
            borderBottom: "1px solid #222d34",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#202c33")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div style={{
            width: "49px", height: "49px", borderRadius: "50%",
            background: "#2a3942", overflow: "hidden", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {u.avatar ? (
              <img src={u.avatar} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <svg viewBox="0 0 24 24" style={{ width: "28px", height: "28px", fill: "#8696a0" }}>
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: "16px", color: "#e9edef" }}>{u.name}</div>
            <div style={{ fontSize: "13px", color: "#8696a0" }}>{u.status || u.email}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
