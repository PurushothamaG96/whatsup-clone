import { create } from "zustand";

export interface Message {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  type: "text" | "image" | "video" | "audio" | "document" | "emoji";
  mediaUrl?: string;
  mediaThumbnail?: string;
  fileName?: string;
  fileSize?: number;
  status: "sent" | "delivered" | "read";
  readBy: string[];
  replyTo?: {
    _id: string;
    content: string;
    type: string;
    sender: { _id: string; name: string };
  };
  isDeleted: boolean;
  reactions: { emoji: string; users: string[] }[];
  createdAt: string;
}

export interface Participant {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Conversation {
  _id: string;
  participants: Participant[];
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupDescription?: string;
  admin?: string;
  lastMessage?: Message;
  lastMessageAt: string;
  unreadCount: number;
  mutedBy: string[];
  pinnedBy: string[];
}

interface TypingUser {
  userId: string;
  userName: string;
  conversationId: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Record<string, Message[]>;
  typingUsers: TypingUser[];
  searchQuery: string;
  sidebarView: "chats" | "contacts" | "profile" | "newGroup";

  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, data: Partial<Conversation>) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, data: Partial<Message>) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  setTypingUser: (data: TypingUser) => void;
  removeTypingUser: (userId: string, conversationId: string) => void;
  setSearchQuery: (query: string) => void;
  setSidebarView: (view: "chats" | "contacts" | "profile" | "newGroup") => void;
  incrementUnread: (conversationId: string) => void;
  resetUnread: (conversationId: string) => void;
  updateUserOnlineStatus: (userId: string, isOnline: boolean, lastSeen?: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  typingUsers: [],
  searchQuery: "",
  sidebarView: "chats",

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  updateConversation: (conversationId, data) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === conversationId ? { ...c, ...data } : c
      ),
      activeConversation:
        state.activeConversation?._id === conversationId
          ? { ...state.activeConversation, ...data }
          : state.activeConversation,
    })),

  setActiveConversation: (conversation) =>
    set({ activeConversation: conversation }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),

  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      },
    })),

  updateMessage: (conversationId, messageId, data) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((m) =>
          m._id === messageId ? { ...m, ...data } : m
        ),
      },
    })),

  deleteMessage: (conversationId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).filter(
          (m) => m._id !== messageId
        ),
      },
    })),

  setTypingUser: (data) =>
    set((state) => ({
      typingUsers: [
        ...state.typingUsers.filter(
          (t) =>
            !(t.userId === data.userId && t.conversationId === data.conversationId)
        ),
        data,
      ],
    })),

  removeTypingUser: (userId, conversationId) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter(
        (t) => !(t.userId === userId && t.conversationId === conversationId)
      ),
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSidebarView: (view) => set({ sidebarView: view }),

  incrementUnread: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === conversationId
          ? { ...c, unreadCount: c.unreadCount + 1 }
          : c
      ),
    })),

  resetUnread: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    })),

  updateUserOnlineStatus: (userId, isOnline, lastSeen) =>
    set((state) => ({
      conversations: state.conversations.map((c) => ({
        ...c,
        participants: c.participants.map((p) =>
          p._id === userId ? { ...p, isOnline, lastSeen: lastSeen || p.lastSeen } : p
        ),
      })),
      activeConversation: state.activeConversation
        ? {
            ...state.activeConversation,
            participants: state.activeConversation.participants.map((p) =>
              p._id === userId
                ? { ...p, isOnline, lastSeen: lastSeen || p.lastSeen }
                : p
            ),
          }
        : null,
    })),
}));
