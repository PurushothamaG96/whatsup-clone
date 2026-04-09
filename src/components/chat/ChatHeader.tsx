"use client";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { formatDistanceToNow } from "date-fns";

export default function ChatHeader() {
  const { user } = useAuthStore();
  const { activeConversation, typingUsers } = useChatStore();

  if (!activeConversation) return null;

  const isGroup = activeConversation.isGroup;
  const other = !isGroup
    ? activeConversation.participants.find((p) => p._id !== user?._id)
    : null;

  const name = isGroup ? activeConversation.groupName : other?.name;
  const avatar = isGroup ? activeConversation.groupAvatar : other?.avatar;
  const isOnline = !isGroup && other?.isOnline;

  const typingInConv = typingUsers.filter(
    (t) => t.conversationId === activeConversation._id && t.userId !== user?._id
  );

  const statusText = () => {
    if (typingInConv.length > 0) {
      if (isGroup) return `${typingInConv.map(t => t.userName).join(", ")} typing...`;
      return "typing...";
    }
    if (isOnline) return "online";
    if (other?.lastSeen) {
      return `last seen ${formatDistanceToNow(new Date(other.lastSeen), { addSuffix: true })}`;
    }
    if (isGroup) {
      return activeConversation.participants.map((p) => p.name).join(", ");
    }
    return "";
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 16px", background: "#202c33", borderBottom: "1px solid #222d34",
      minHeight: "60px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
        {/* Avatar */}
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          background: "#2a3942", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {avatar ? (
            <img src={avatar} alt={name || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <svg viewBox="0 0 24 24" style={{ width: "22px", height: "22px", fill: "#8696a0" }}>
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ fontWeight: 500, fontSize: "16px", color: "#e9edef" }}>{name}</div>
          <div style={{
            fontSize: "12px",
            color: typingInConv.length > 0 ? "#00a884" : "#8696a0",
          }}>
            {statusText()}
          </div>
        </div>
      </div>

      {/* Action icons */}
      <div style={{ display: "flex", gap: "4px" }}>
        <HeaderIcon title="Search">
          <svg viewBox="0 0 24 24" style={{ width: "20px", height: "20px", fill: "#aebac1" }}>
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </HeaderIcon>
        <HeaderIcon title="More options">
          <svg viewBox="0 0 24 24" style={{ width: "20px", height: "20px", fill: "#aebac1" }}>
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </HeaderIcon>
      </div>
    </div>
  );
}

function HeaderIcon({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <button title={title}
      style={{
        background: "none", border: "none", cursor: "pointer",
        padding: "8px", borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#2a3942")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      {children}
    </button>
  );
}
