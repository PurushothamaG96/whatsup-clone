"use client";
import { useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { joinConversation } from "@/hooks/useSocket";

interface SearchUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function NewGroupPanel({ onClose }: { onClose: () => void }) {
  const { addConversation, setActiveConversation, setMessages } = useChatStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState<"select" | "name">("select");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [selected, setSelected] = useState<SearchUser[]>([]);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);

  const search = async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.users.filter((u: SearchUser) => !selected.find((s) => s._id === u._id)));
      }
    } catch {}
  };

  const toggleSelect = (u: SearchUser) => {
    setSelected((prev) =>
      prev.find((s) => s._id === u._id) ? prev.filter((s) => s._id !== u._id) : [...prev, u]
    );
  };

  const createGroup = async () => {
    if (!groupName.trim() || selected.length < 1) return;
    setCreating(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isGroup: true,
          groupName: groupName.trim(),
          participants: selected.map((u) => u._id),
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const conv = { ...data.conversation, unreadCount: 0 };
      addConversation(conv);
      setActiveConversation(conv);
      setMessages(conv._id, []);
      joinConversation(conv._id);
      toast.success("Group created!");
      onClose();
    } catch {
      toast.error("Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#111b21" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "16px",
        padding: "16px", background: "#202c33", borderBottom: "1px solid #222d34",
      }}>
        <button onClick={step === "name" ? () => setStep("select") : onClose}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
          <svg viewBox="0 0 24 24" style={{ width: "22px", height: "22px", fill: "#aebac1" }}>
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <span style={{ fontSize: "19px", color: "#e9edef", fontWeight: 500 }}>
          {step === "select" ? "Add group participants" : "New group"}
        </span>
      </div>

      {step === "select" && (
        <>
          {/* Search */}
          <div style={{ padding: "8px 12px", background: "#111b21" }}>
            <div style={{ background: "#202c33", borderRadius: "8px", padding: "8px 12px", display: "flex", gap: "8px", alignItems: "center" }}>
              <svg viewBox="0 0 24 24" style={{ width: "16px", height: "16px", fill: "#8696a0" }}>
                <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input value={query} onChange={(e) => search(e.target.value)}
                placeholder="Search contacts"
                style={{ background: "none", border: "none", outline: "none", flex: 1, color: "#e9edef", fontSize: "14px" }} />
            </div>
          </div>

          {/* Selected chips */}
          {selected.length > 0 && (
            <div style={{ display: "flex", gap: "8px", padding: "8px 12px", flexWrap: "wrap" }}>
              {selected.map((u) => (
                <div key={u._id} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: "#2a3942", borderRadius: "20px", padding: "4px 10px",
                }}>
                  <span style={{ fontSize: "13px", color: "#e9edef" }}>{u.name}</span>
                  <button onClick={() => toggleSelect(u)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#8696a0", lineHeight: 1, fontSize: "16px" }}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {results.map((u) => (
              <div key={u._id} onClick={() => toggleSelect(u)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #222d34",
                  background: selected.find((s) => s._id === u._id) ? "#2a3942" : "transparent",
                }}
                onMouseEnter={(e) => { if (!selected.find((s) => s._id === u._id)) e.currentTarget.style.background = "#202c33"; }}
                onMouseLeave={(e) => { if (!selected.find((s) => s._id === u._id)) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{
                  width: "42px", height: "42px", borderRadius: "50%",
                  background: "#2a3942", overflow: "hidden", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {u.avatar ? <img src={u.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
                    <svg viewBox="0 0 24 24" style={{ width: "24px", height: "24px", fill: "#8696a0" }}>
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", color: "#e9edef" }}>{u.name}</div>
                  <div style={{ fontSize: "12px", color: "#8696a0" }}>{u.email}</div>
                </div>
                {selected.find((s) => s._id === u._id) && (
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#00a884", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg viewBox="0 0 24 24" style={{ width: "14px", height: "14px", fill: "#fff" }}>
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Next button */}
          {selected.length > 0 && (
            <div style={{ padding: "16px" }}>
              <button onClick={() => setStep("name")}
                style={{
                  width: "100%", padding: "14px", borderRadius: "8px",
                  background: "#00a884", color: "#fff", border: "none",
                  cursor: "pointer", fontSize: "15px", fontWeight: 500,
                }}>
                Next ({selected.length} selected)
              </button>
            </div>
          )}
        </>
      )}

      {step === "name" && (
        <div style={{ flex: 1, padding: "24px 20px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "#2a3942", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" style={{ width: "40px", height: "40px", fill: "#8696a0" }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
            </div>
          </div>
          <label style={{ display: "block", fontSize: "13px", color: "#00a884", marginBottom: "8px" }}>Group name</label>
          <div style={{ borderBottom: "2px solid #00a884", paddingBottom: "8px", marginBottom: "24px" }}>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              autoFocus
              style={{ width: "100%", background: "none", border: "none", outline: "none", color: "#e9edef", fontSize: "17px" }}
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "13px", color: "#8696a0", marginBottom: "8px" }}>Members: {selected.map(u => u.name).join(", ")}</div>
          </div>
          <button onClick={createGroup} disabled={!groupName.trim() || creating}
            style={{
              width: "100%", padding: "14px", borderRadius: "8px",
              background: "#00a884", color: "#fff", border: "none",
              cursor: !groupName.trim() || creating ? "not-allowed" : "pointer",
              fontSize: "15px", fontWeight: 500,
              opacity: !groupName.trim() || creating ? 0.6 : 1,
            }}>
            {creating ? "Creating..." : "Create Group"}
          </button>
        </div>
      )}
    </div>
  );
}
