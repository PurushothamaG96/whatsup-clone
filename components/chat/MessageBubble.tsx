"use client";
import { useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { sendSocketMessage } from "@/hooks/useSocket";

interface MessageBubbleProps {
  message: {
    _id: string;
    conversationId: string;
    sender: { _id: string; name: string; avatar?: string };
    content: string;
    type: string;
    mediaUrl?: string;
    mediaThumbnail?: string;
    fileName?: string;
    fileSize?: number;
    status: string;
    readBy: string[];
    replyTo?: { _id: string; content: string; type: string; sender: { _id: string; name: string } };
    isDeleted: boolean;
    reactions: { emoji: string; users: string[] }[];
    createdAt: string;
  };
  isOwn: boolean;
  showAvatar: boolean;
  isGroup: boolean;
}

export default function MessageBubble({ message, isOwn, showAvatar, isGroup }: MessageBubbleProps) {
  const { user } = useAuthStore();
  const { updateMessage, deleteMessage } = useChatStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showImageFull, setShowImageFull] = useState(false);

  const handleDelete = async (everyone: boolean) => {
    try {
      const res = await fetch(`/api/messages/${message._id}?everyone=${everyone}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();

      if (everyone) {
        updateMessage(message.conversationId, message._id, { isDeleted: true, content: "" });
        sendSocketMessage(message.conversationId, { ...message, isDeleted: true });
      } else {
        deleteMessage(message.conversationId, message._id);
      }
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    }
    setShowMenu(false);
  };

  const handleReact = async (emoji: string) => {
    try {
      await fetch(`/api/messages/${message._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    } catch {
      toast.error("Failed to react");
    }
  };

  const formatTime = (dateStr: string) => format(new Date(dateStr), "HH:mm");

  const renderStatus = () => {
    if (!isOwn) return null;
    if (message.status === "read") {
      return (
        <svg viewBox="0 0 18 18" style={{ width: "15px", height: "15px", fill: "#53bdeb" }}>
          <path d="M17.394 5.035l-.57-.444a.434.434 0 0 0-.609.076L8.397 14.3l-4.267-4.26a.434.434 0 0 0-.614.002l-.505.504a.434.434 0 0 0 .002.614l4.84 4.833a.434.434 0 0 0 .614-.002l.55-.552.012-.012 8.14-9.985a.434.434 0 0 0-.075-.607zM12.84 5.077l-.57-.444a.434.434 0 0 0-.608.076L7.435 10.1l-.593-.59a.434.434 0 0 0-.614.002l-.505.504a.434.434 0 0 0 .002.614l1.23 1.23a.434.434 0 0 0 .614-.002l5.347-6.574a.434.434 0 0 0-.076-.607z"/>
        </svg>
      );
    }
    if (message.status === "delivered") {
      return (
        <svg viewBox="0 0 18 18" style={{ width: "15px", height: "15px", fill: "#8696a0" }}>
          <path d="M17.394 5.035l-.57-.444a.434.434 0 0 0-.609.076L8.397 14.3l-4.267-4.26a.434.434 0 0 0-.614.002l-.505.504a.434.434 0 0 0 .002.614l4.84 4.833a.434.434 0 0 0 .614-.002l.55-.552.012-.012 8.14-9.985a.434.434 0 0 0-.075-.607zM12.84 5.077l-.57-.444a.434.434 0 0 0-.608.076L7.435 10.1l-.593-.59a.434.434 0 0 0-.614.002l-.505.504a.434.434 0 0 0 .002.614l1.23 1.23a.434.434 0 0 0 .614-.002l5.347-6.574a.434.434 0 0 0-.076-.607z"/>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 18 18" style={{ width: "15px", height: "15px", fill: "#8696a0" }}>
        <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185a.365.365 0 0 0 .514-.006l.423-.433-.024.02 5.661-7.404a.365.365 0 0 0-.081-.508z"/>
      </svg>
    );
  };

  const renderContent = () => {
    if (message.isDeleted) {
      return (
        <span style={{ color: "#8696a0", fontStyle: "italic", fontSize: "14px" }}>
          🚫 This message was deleted
        </span>
      );
    }

    switch (message.type) {
      case "image":
        return (
          <div>
            <img
              src={message.mediaUrl}
              alt="Photo"
              style={{ maxWidth: "280px", maxHeight: "280px", borderRadius: "8px", cursor: "pointer", display: "block" }}
              onClick={() => setShowImageFull(true)}
            />
            {message.content && (
              <p style={{ fontSize: "14px", color: "#e9edef", marginTop: "6px" }}>{message.content}</p>
            )}
          </div>
        );
      case "video":
        return (
          <div>
            <video
              src={message.mediaUrl}
              poster={message.mediaThumbnail}
              controls
              style={{ maxWidth: "280px", maxHeight: "200px", borderRadius: "8px", display: "block" }}
            />
            {message.content && (
              <p style={{ fontSize: "14px", color: "#e9edef", marginTop: "6px" }}>{message.content}</p>
            )}
          </div>
        );
      case "audio":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "200px" }}>
            <svg viewBox="0 0 24 24" style={{ width: "32px", height: "32px", fill: "#00a884", flexShrink: 0 }}>
              <path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9zm-1 13V8l6 4z"/>
            </svg>
            <audio src={message.mediaUrl} controls style={{ flex: 1, height: "32px" }} />
          </div>
        );
      case "document":
        return (
          <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "8px",
              background: "#0077cc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" style={{ width: "22px", height: "22px", fill: "#fff" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#e9edef", fontWeight: 500 }}>{message.fileName}</div>
              {message.fileSize && (
                <div style={{ fontSize: "11px", color: "#8696a0" }}>
                  {(message.fileSize / 1024).toFixed(1)} KB
                </div>
              )}
            </div>
          </a>
        );
      default:
        return <span style={{ fontSize: "14.2px", color: "#e9edef", lineHeight: 1.4 }}>{message.content}</span>;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        padding: "2px 16px",
        position: "relative",
      }}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Avatar for group chats */}
      {isGroup && !isOwn && (
        <div style={{ width: "32px", marginRight: "6px", flexShrink: 0, alignSelf: "flex-end" }}>
          {showAvatar && (
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "#2a3942", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {message.sender.avatar ? (
                <img src={message.sender.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <svg viewBox="0 0 24 24" style={{ width: "18px", height: "18px", fill: "#8696a0" }}>
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ maxWidth: "65%", position: "relative" }}>
        {/* Reply preview */}
        {message.replyTo && (
          <div style={{
            background: isOwn ? "#025144" : "#182229",
            borderLeft: "4px solid #00a884",
            borderRadius: "6px 6px 0 0",
            padding: "6px 10px",
            marginBottom: "2px",
          }}>
            <div style={{ fontSize: "12px", color: "#00a884", fontWeight: 600 }}>
              {message.replyTo.sender.name}
            </div>
            <div style={{ fontSize: "12px", color: "#8696a0" }}>
              {message.replyTo.type !== "text" ? `📎 ${message.replyTo.type}` : message.replyTo.content}
            </div>
          </div>
        )}

        {/* Bubble */}
        <div style={{
          background: isOwn ? "#005c4b" : "#202c33",
          borderRadius: message.replyTo ? "0 8px 8px 8px" : isOwn ? "8px 0 8px 8px" : "0 8px 8px 8px",
          padding: "6px 8px 6px 9px",
          position: "relative",
          boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
        }}>
          {/* Group sender name */}
          {isGroup && !isOwn && showAvatar && (
            <div style={{ fontSize: "12px", color: "#00a884", fontWeight: 600, marginBottom: "2px" }}>
              {message.sender.name}
            </div>
          )}

          {renderContent()}

          {/* Time + status row */}
          <div style={{
            display: "flex", alignItems: "center", gap: "4px",
            justifyContent: "flex-end", marginTop: "4px",
          }}>
            <span style={{ fontSize: "11px", color: "#8696a0" }}>{formatTime(message.createdAt)}</span>
            {renderStatus()}
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div style={{
            display: "flex", gap: "4px", flexWrap: "wrap",
            marginTop: "4px", justifyContent: isOwn ? "flex-end" : "flex-start",
          }}>
            {message.reactions.map((r) => (
              <button key={r.emoji} onClick={() => handleReact(r.emoji)}
                style={{
                  background: "#2a3942", border: "none", borderRadius: "12px",
                  padding: "2px 6px", cursor: "pointer", fontSize: "13px",
                  display: "flex", alignItems: "center", gap: "2px",
                }}>
                {r.emoji}
                <span style={{ fontSize: "11px", color: "#8696a0" }}>{r.users.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Context menu */}
        {showMenu && !message.isDeleted && (
          <div style={{
            position: "absolute", [isOwn ? "left" : "right"]: "calc(100% + 4px)", top: 0,
            background: "#233138", borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            zIndex: 50, overflow: "hidden", whiteSpace: "nowrap",
          }}>
            {["😀", "❤️", "👍", "😂", "😮", "🙏"].map((emoji) => (
              <button key={emoji} onClick={() => handleReact(emoji)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 6px", fontSize: "18px" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#2a3942")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >{emoji}</button>
            ))}
            <div style={{ height: "1px", background: "#2a3942", margin: "2px 0" }} />
            {isOwn && (
              <button onClick={() => handleDelete(true)}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "10px 16px", background: "none", border: "none",
                  color: "#ef4444", fontSize: "13px", cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#2a3942")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >Delete for everyone</button>
            )}
            <button onClick={() => handleDelete(false)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "10px 16px", background: "none", border: "none",
                color: "#e9edef", fontSize: "13px", cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2a3942")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >Delete for me</button>
          </div>
        )}
      </div>

      {/* Full image overlay */}
      {showImageFull && message.type === "image" && (
        <div
          onClick={() => setShowImageFull(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <img src={message.mediaUrl} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }} />
          <button onClick={() => setShowImageFull(false)}
            style={{
              position: "absolute", top: "20px", right: "20px",
              background: "rgba(255,255,255,0.1)", border: "none",
              color: "#fff", width: "40px", height: "40px",
              borderRadius: "50%", cursor: "pointer", fontSize: "20px",
            }}>✕</button>
        </div>
      )}
    </div>
  );
}
