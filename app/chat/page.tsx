"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import WelcomeScreen from "@/components/chat/WelcomeScreen";
import { useSocket } from "@/hooks/useSocket";

export default function ChatPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { activeConversation, setConversations } = useChatStore();

  // Initialize socket
  useSocket();

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    // Load conversations
    const loadConversations = async () => {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations);
        } else if (res.status === 401) {
          router.push("/");
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
      }
    };

    loadConversations();
  }, [user, router, setConversations]);

  if (!user) return null;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#111b21",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "380px",
          minWidth: "380px",
          borderRight: "1px solid #222d34",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <Sidebar />
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh" }}>
        {activeConversation ? <ChatWindow /> : <WelcomeScreen />}
      </div>
    </div>
  );
}
