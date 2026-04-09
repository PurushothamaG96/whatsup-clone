"use client";
import { useState, useRef, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { sendSocketMessage, emitTypingStart, emitTypingStop } from "@/hooks/useSocket";
import toast from "react-hot-toast";

export default function MessageInput() {
  const { user } = useAuthStore();
  const { activeConversation, addMessage, updateConversation } = useChatStore();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const convId = activeConversation?._id || "";

  const handleTyping = useCallback(() => {
    if (!convId || !user) return;
    emitTypingStart(convId, user.name);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTypingStop(convId), 2000);
  }, [convId, user]);

  const sendMessage = async (
    content: string,
    type: string = "text",
    mediaData?: string,
    fileName?: string,
    fileSize?: number
  ) => {
    if (!convId || (!content.trim() && !mediaData)) return;

    setSending(true);
    emitTypingStop(convId);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, content, type, mediaData, fileName, fileSize }),
      });

      if (!res.ok) throw new Error("Failed to send");

      const data = await res.json();
      const message = data.message;

      addMessage(convId, message);
      updateConversation(convId, { lastMessage: message, lastMessageAt: message.createdAt });
      sendSocketMessage(convId, message);
      setText("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) sendMessage(text.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) sendMessage(text.trim());
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }

    const toastId = toast.loading("Uploading...");
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await sendMessage("", type, base64, file.name, file.size);
        toast.dismiss(toastId);
        toast.success("File sent!");
      };
      reader.readAsDataURL(file);
    } catch {
      toast.dismiss(toastId);
      toast.error("Upload failed");
    }

    e.target.value = "";
    setShowAttachMenu(false);
  };

  const quickEmojis = ["😀", "😂", "❤️", "👍", "🎉", "😊", "🔥", "😍", "🙏", "😢", "😮", "🤔"];

  if (!activeConversation) return null;

  return (
    <div style={{ background: "#202c33", padding: "8px 16px", borderTop: "1px solid #222d34" }}>
      {/* Emoji bar */}
      {showEmojiBar && (
        <div style={{
          display: "flex", gap: "4px", padding: "8px 0", flexWrap: "wrap",
          borderBottom: "1px solid #2a3942", marginBottom: "8px",
        }}>
          {quickEmojis.map((emoji) => (
            <button key={emoji} onClick={() => { setText((t) => t + emoji); setShowEmojiBar(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", padding: "4px", borderRadius: "6px" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2a3942")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >{emoji}</button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
        {/* Emoji button */}
        <ActionBtn title="Emoji" onClick={() => { setShowEmojiBar(!showEmojiBar); setShowAttachMenu(false); }}>
          <svg viewBox="0 0 24 24" style={{ width: "24px", height: "24px", fill: showEmojiBar ? "#00a884" : "#8696a0" }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm2.77-5.23c-.22.07-.45.1-.69.1H6.92C6.05 9.57 6 9.29 6 9c0-3.31 2.69-6 6-6s6 2.69 6 6c0 .71-.13 1.39-.35 2.02-.03.1-.06.19-.1.27z" opacity=".3"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.5-10.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-9 0c-.83 0-1.5-.67-1.5-1.5S6.67 8 7.5 8 9 8.67 9 9.5 8.33 11 7.5 11zm4.5 7c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
          </svg>
        </ActionBtn>

        {/* Attach button */}
        <div style={{ position: "relative" }}>
          <ActionBtn title="Attach" onClick={() => { setShowAttachMenu(!showAttachMenu); setShowEmojiBar(false); }}>
            <svg viewBox="0 0 24 24" style={{ width: "24px", height: "24px", fill: showAttachMenu ? "#00a884" : "#8696a0" }}>
              <path d="M21.586 10.461l-10.05 10.075a6.5 6.5 0 0 1-9.192-9.192l10.05-10.075a4.5 4.5 0 0 1 6.364 6.364L8.707 17.696a2.5 2.5 0 0 1-3.536-3.536L14.757 4.875a1 1 0 0 1 1.414 1.414L6.586 15.574a.5.5 0 0 0 .707.707L17.343 6.204a2.5 2.5 0 0 0-3.536-3.536L3.757 12.743a4.5 4.5 0 0 0 6.364 6.364l10.05-10.075a1 1 0 0 1 1.415 1.429z"/>
            </svg>
          </ActionBtn>

          {showAttachMenu && (
            <div style={{
              position: "absolute", bottom: "50px", left: 0,
              background: "#233138", borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              padding: "8px", zIndex: 100, minWidth: "180px",
            }}>
              {[
                { label: "Image", icon: "📷", ref: imageInputRef, accept: "image/*", type: "image" },
                { label: "Video", icon: "🎥", ref: videoInputRef, accept: "video/*", type: "video" },
                { label: "Document", icon: "📄", ref: fileInputRef, accept: ".pdf,.doc,.docx,.txt,.zip", type: "document" },
              ].map((item) => (
                <div key={item.type}>
                  <button
                    onClick={() => item.ref.current?.click()}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      width: "100%", padding: "10px 12px", background: "none",
                      border: "none", cursor: "pointer", borderRadius: "8px",
                      color: "#e9edef", fontSize: "14px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#2a3942")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <span>{item.icon}</span> {item.label}
                  </button>
                  <input
                    ref={item.ref}
                    type="file"
                    accept={item.accept}
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e, item.type)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Text area */}
        <div style={{ flex: 1, background: "#2a3942", borderRadius: "10px", padding: "9px 14px" }}>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); handleTyping(); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            rows={1}
            style={{
              width: "100%", background: "none", border: "none", outline: "none",
              color: "#e9edef", fontSize: "15px", resize: "none",
              fontFamily: "inherit", lineHeight: 1.5, maxHeight: "120px", overflowY: "auto",
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={() => sendMessage(text.trim())}
          disabled={!text.trim() || sending}
          style={{
            width: "48px", height: "48px", borderRadius: "50%",
            background: "#00a884", border: "none", cursor: sending || !text.trim() ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: sending || !text.trim() ? 0.6 : 1, transition: "opacity 0.2s, transform 0.1s",
            flexShrink: 0,
          }}
          onMouseDown={(e) => { if (text.trim()) e.currentTarget.style.transform = "scale(0.92)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <svg viewBox="0 0 24 24" style={{ width: "22px", height: "22px", fill: "#fff" }}>
            <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button onClick={onClick} title={title}
      style={{
        background: "none", border: "none", cursor: "pointer",
        padding: "8px", borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s", flexShrink: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#2a3942")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >{children}</button>
  );
}
