"use client";
import { useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function ProfilePanel({ onClose }: { onClose: () => void }) {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [status, setStatus] = useState(user?.status || "");
  const [about, setAbout] = useState(user?.about || "");
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status, about, avatar }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser(data.user);
      toast.success("Profile updated!");
      onClose();
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const displayAvatar = avatar || user?.avatar;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#111b21" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "16px",
        padding: "16px", background: "#202c33", borderBottom: "1px solid #222d34",
      }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
          <svg viewBox="0 0 24 24" style={{ width: "22px", height: "22px", fill: "#aebac1" }}>
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <span style={{ fontSize: "19px", color: "#e9edef", fontWeight: 500 }}>Profile</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
        {/* Avatar */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: "128px", height: "128px", borderRadius: "50%",
              background: "#2a3942", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {displayAvatar ? (
                <img src={displayAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <svg viewBox="0 0 24 24" style={{ width: "64px", height: "64px", fill: "#8696a0" }}>
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              )}
            </div>
            <button onClick={() => fileRef.current?.click()}
              style={{
                position: "absolute", bottom: 0, right: 0,
                width: "36px", height: "36px", borderRadius: "50%",
                background: "#00a884", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
              <svg viewBox="0 0 24 24" style={{ width: "18px", height: "18px", fill: "#fff" }}>
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
          </div>
        </div>

        {/* Fields */}
        {[
          { label: "Your name", value: name, setter: setName, placeholder: "Enter your name" },
          { label: "About", value: about, setter: setAbout, placeholder: "Hey there! I am using WhatsApp Clone" },
          { label: "Status", value: status, setter: setStatus, placeholder: "Enter your status" },
        ].map((field) => (
          <div key={field.label} style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "#00a884", marginBottom: "8px", fontWeight: 500 }}>
              {field.label}
            </label>
            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #2a3942", paddingBottom: "8px" }}>
              <input
                type="text"
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                placeholder={field.placeholder}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "#e9edef", fontSize: "17px",
                }}
                onFocus={(e) => (e.target.parentElement!.style.borderBottomColor = "#00a884")}
                onBlur={(e) => (e.target.parentElement!.style.borderBottomColor = "#2a3942")}
              />
            </div>
          </div>
        ))}

        {/* Email display */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "13px", color: "#8696a0", marginBottom: "8px" }}>Email</label>
          <div style={{ fontSize: "15px", color: "#e9edef", padding: "4px 0" }}>{user?.email}</div>
        </div>

        <button onClick={handleSave} disabled={saving}
          style={{
            width: "100%", padding: "14px", borderRadius: "8px",
            background: "#00a884", color: "#fff", border: "none",
            cursor: saving ? "not-allowed" : "pointer", fontSize: "15px",
            fontWeight: 500, opacity: saving ? 0.7 : 1,
          }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
