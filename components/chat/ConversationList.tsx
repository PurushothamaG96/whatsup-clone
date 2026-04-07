"use client";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { formatDistanceToNow } from "date-fns";
import { joinConversation, leaveConversation } from "@/hooks/useSocket";

export default function ConversationList() {
  const { user } = useAuthStore();
  const { conversations, activeConversation, setActiveConversation, setMessages, resetUnread } = useChatStore();

  const handleSelect = async (conv: (typeof conversations)[0]) => {
    if (activeConversation?._id) {
      leaveConversation(activeConversation._id);
    }

    setActiveConversation(conv);
    resetUnread(conv._id);
    joinConversation(conv._id);

    // Load messages
    try {
      const res = await fetch(`/api/messages?conversationId=${conv._id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(conv._id, data.messages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const getConversationName = (conv: (typeof conversations)[0]) => {
    if (conv.isGroup) return conv.groupName || "Group";
    const other = conv.participants.find((p) => p._id !== user?._id);
    return other?.name || "Unknown";
  };

  const getConversationAvatar = (conv: (typeof conversations)[0]) => {
    if (conv.isGroup) return conv.groupAvatar;
    const other = conv.participants.find((p) => p._id !== user?._id);
    return other?.avatar;
  };

  const isOnline = (conv: (typeof conversations)[0]) => {
    if (conv.isGroup) return false;
    const other = conv.participants.find((p) => p._id !== user?._id);
    return other?.isOnline;
  };

  const getLastMessagePreview = (conv: (typeof conversations)[0]) => {
    const msg = conv.lastMessage;
    if (!msg) return "";
    if (msg.isDeleted) return "🚫 This message was deleted";
    switch (msg.type) {
      case "image": return "📷 Photo";
      case "video": return "🎥 Video";
      case "audio": return "🎵 Audio";
      case "document": return `📄 ${msg.fileName || "Document"}`;
      default: return msg.content;
    }
  };

  if (conversations.length === 0) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "#8696a0" }}>
        <p style={{ fontSize: "14px" }}>No conversations yet</p>
        <p style={{ fontSize: "12px", marginTop: "4px" }}>Search for contacts to start chatting</p>
      </div>
    );
  }

  return (
    <div>
      {conversations.map((conv) => {
        const isActive = activeConversation?._id === conv._id;
        const name = getConversationName(conv);
        const avatar = getConversationAvatar(conv);
        const online = isOnline(conv);
        const lastMsg = getLastMessagePreview(conv);
        const time = conv.lastMessageAt
          ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false })
          : "";

        return (
          <div
            key={conv._id}
            onClick={() => handleSelect(conv)}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 16px", cursor: "pointer",
              background: isActive ? "#2a3942" : "transparent",
              borderBottom: "1px solid #222d34",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = "#202c33";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = "transparent";
            }}
          >
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: "49px", height: "49px", borderRadius: "50%",
                background: "#2a3942", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {avatar ? (
                  <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <svg viewBox="0 0 24 24" style={{ width: "28px", height: "28px", fill: "#8696a0" }}>
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                )}
              </div>
              {online && (
                <div style={{
                  position: "absolute", bottom: "1px", right: "1px",
                  width: "12px", height: "12px", borderRadius: "50%",
                  background: "#00a884", border: "2px solid #111b21",
                }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 500, fontSize: "16px", color: "#e9edef", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {name}
                </span>
                <span style={{ fontSize: "11px", color: conv.unreadCount > 0 ? "#00a884" : "#8696a0", flexShrink: 0, marginLeft: "8px" }}>
                  {time}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                <span style={{
                  fontSize: "13px", color: "#8696a0",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                }}>
                  {lastMsg}
                </span>
                {conv.unreadCount > 0 && (
                  <div style={{
                    background: "#00a884", color: "#fff", borderRadius: "50%",
                    minWidth: "20px", height: "20px", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: 600, marginLeft: "8px", padding: "0 4px",
                  }}>
                    {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
