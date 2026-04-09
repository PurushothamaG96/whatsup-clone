"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import ConversationList from "./ConversationList";
import SearchUsers from "./SearchUsers";
import ProfilePanel from "./ProfilePanel";
import NewGroupPanel from "./NewGroupPanel";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { sidebarView, setSidebarView, searchQuery, setSearchQuery } = useChatStore();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      logout();
      router.push("/");
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed");
    }
  };

  if (sidebarView === "profile") {
    return <ProfilePanel onClose={() => setSidebarView("chats")} />;
  }

  if (sidebarView === "newGroup") {
    return <NewGroupPanel onClose={() => setSidebarView("chats")} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#111b21" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", background: "#202c33", minHeight: "60px",
      }}>
        {/* Avatar */}
        <button
          onClick={() => setSidebarView("profile")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <div style={{
            width: "40px", height: "40px", borderRadius: "50%",
            background: "#2a3942", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <svg viewBox="0 0 24 24" style={{ width: "24px", height: "24px", fill: "#8696a0" }}>
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            )}
          </div>
        </button>

        {/* Icons */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <IconBtn title="New group" onClick={() => setSidebarView("newGroup")}>
            <svg viewBox="0 0 24 24" style={{ width: "20px", height: "20px", fill: "#aebac1" }}>
              <path d="M9 12A4 4 0 1 0 9 4a4 4 0 0 0 0 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm6.25-4.5a.75.75 0 0 0-1.5 0V11h-1.5a.75.75 0 0 0 0 1.5h1.5v1.5a.75.75 0 0 0 1.5 0V12.5h1.5a.75.75 0 0 0 0-1.5h-1.5V9.5z"/>
            </svg>
          </IconBtn>

          <div style={{ position: "relative" }}>
            <IconBtn title="Menu" onClick={() => setShowMenu(!showMenu)}>
              <svg viewBox="0 0 24 24" style={{ width: "20px", height: "20px", fill: "#aebac1" }}>
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </IconBtn>
            {showMenu && (
              <div style={{
                position: "absolute", right: 0, top: "40px", background: "#233138",
                borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                zIndex: 100, minWidth: "160px", overflow: "hidden",
              }}>
                {[
                  { label: "New group", action: () => { setSidebarView("newGroup"); setShowMenu(false); } },
                  { label: "Profile", action: () => { setSidebarView("profile"); setShowMenu(false); } },
                  { label: "Log out", action: handleLogout },
                ].map((item) => (
                  <button key={item.label} onClick={item.action}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "12px 20px", background: "none", border: "none",
                      color: "#e9edef", fontSize: "14px", cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#2a3942")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ padding: "8px 12px", background: "#111b21" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "#202c33", borderRadius: "8px", padding: "8px 12px",
        }}>
          <svg viewBox="0 0 24 24" style={{ width: "16px", height: "16px", fill: "#8696a0", flexShrink: 0 }}>
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: "none", border: "none", outline: "none", flex: 1,
              color: "#e9edef", fontSize: "14px",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {searchQuery ? <SearchUsers query={searchQuery} /> : <ConversationList />}
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button onClick={onClick} title={title}
      style={{
        background: "none", border: "none", cursor: "pointer",
        padding: "8px", borderRadius: "50%", display: "flex",
        alignItems: "center", justifyContent: "center", transition: "background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#2a3942")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      {children}
    </button>
  );
}
