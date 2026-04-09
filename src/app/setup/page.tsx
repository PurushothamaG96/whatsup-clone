"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function SetupPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [about, setAbout] = useState("");
  const [status, setStatus] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) {
    router.push("/");
    return null;
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (about) body.about = about;
      if (status) body.status = status;
      if (avatar) body.avatar = avatar;

      if (Object.keys(body).length > 0) {
        const res = await fetch(`/api/users/${user._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error("Failed to update profile");

        const data = await res.json();
        setUser(data.user);
        toast.success("Profile set up!");
      }

      router.push("/chat");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "none",
    border: "none",
    borderBottom: "2px solid #2a3942",
    outline: "none",
    color: "#e9edef",
    fontSize: "16px",
    padding: "10px 0",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#111b21",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "256px", background: "#00a884" }} />
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "420px", margin: "0 16px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 300, color: "#e9edef" }}>Set up your profile</h1>
          <p style={{ fontSize: "14px", color: "#8696a0", marginTop: "4px" }}>
            Welcome, {user.name}! Add a photo and tell people about yourself.
          </p>
        </div>

        <div style={{ background: "#202c33", borderRadius: "12px", padding: "32px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          {/* Avatar */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "128px",
                  height: "128px",
                  borderRadius: "50%",
                  background: "#2a3942",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                onClick={() => fileRef.current?.click()}
              >
                {avatar ? (
                  <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <svg viewBox="0 0 24 24" style={{ width: "48px", height: "48px", fill: "#8696a0" }}>
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                    <div style={{ fontSize: "11px", color: "#8696a0", marginTop: "4px" }}>ADD PHOTO</div>
                  </div>
                )}
              </div>
              {avatar && (
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#00a884",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg viewBox="0 0 24 24" style={{ width: "18px", height: "18px", fill: "#fff" }}>
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
            </div>
          </div>

          {/* About */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "#00a884", marginBottom: "4px", fontWeight: 500 }}>
              About
            </label>
            <input
              type="text"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Hey there! I am using WhatsApp Clone"
              maxLength={139}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderBottomColor = "#00a884")}
              onBlur={(e) => (e.target.style.borderBottomColor = "#2a3942")}
            />
          </div>

          {/* Status */}
          <div style={{ marginBottom: "32px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "#00a884", marginBottom: "4px", fontWeight: 500 }}>
              Status
            </label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Available"
              maxLength={139}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderBottomColor = "#00a884")}
              onBlur={(e) => (e.target.style.borderBottomColor = "#2a3942")}
            />
          </div>

          {/* Buttons */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              background: "#00a884",
              color: "#fff",
              fontWeight: 500,
              fontSize: "14px",
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              marginBottom: "12px",
            }}
          >
            {saving ? "Saving..." : "Continue to Chat"}
          </button>

          <button
            onClick={() => router.push("/chat")}
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              background: "transparent",
              color: "#8696a0",
              fontWeight: 500,
              fontSize: "14px",
              border: "1px solid #2a3942",
              cursor: "pointer",
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
