"use client";

interface TypingUser {
  userId: string;
  userName: string;
  conversationId: string;
}

export default function TypingIndicator({ users }: { users: TypingUser[] }) {
  const label = users.length === 1 ? `${users[0].userName} is typing` : `${users.length} people are typing`;

  return (
    <div style={{ display: "flex", justifyContent: "flex-start", padding: "4px 16px 8px" }}>
      <div style={{
        background: "#202c33",
        borderRadius: "0 8px 8px 8px",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="typing-dot"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <span style={{ fontSize: "12px", color: "#8696a0" }}>{label}</span>
      </div>
    </div>
  );
}
