"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

type AuthMode = "login" | "register" | "forgot";

export default function AuthPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [resetLink, setResetLink] = useState("");

  const isLogin = authMode === "login";
  const isRegister = authMode === "register";
  const isForgot = authMode === "forgot";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResetLink("");

    try {
      const endpoint = isLogin
        ? "/api/auth/login"
        : isRegister
        ? "/api/auth/register"
        : "/api/auth/forgot-password";

      const body = isLogin
        ? { email: form.email, password: form.password }
        : isRegister
        ? form
        : { email: form.email };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      if (isForgot) {
        toast.success(data.message || "Password reset instructions sent");
        if (data.resetUrl) {
          setResetLink(data.resetUrl);
        }
        return;
      }

      setUser(data.user);
      toast.success(isLogin ? "Welcome back!" : "Account created!");
      router.push(isRegister ? "/setup" : "/chat");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "#2a3942",
    color: "#e9edef",
    border: "1px solid transparent",
    borderRadius: "8px",
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    outline: "none",
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
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "#202c33",
              marginBottom: "16px",
            }}
          >
            <svg viewBox="0 0 32 32" style={{ width: "48px", height: "48px" }} fill="#00a884">
              <path d="M16 2C8.28 2 2 8.28 2 16c0 2.45.64 4.86 1.85 6.97L2 30l7.26-1.9A13.93 13.93 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.4c-2.2 0-4.37-.59-6.28-1.7l-.45-.27-4.65 1.22 1.23-4.52-.3-.47A11.37 11.37 0 014.6 16c0-6.28 5.12-11.4 11.4-11.4 6.28 0 11.4 5.12 11.4 11.4 0 6.28-5.12 11.4-11.4 11.4zm6.26-8.54c-.34-.17-2.02-.99-2.34-1.1-.31-.12-.54-.17-.77.17-.23.34-.88 1.1-1.08 1.33-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.74-1.69a10.27 10.27 0 01-1.9-2.36c-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.12-.23.06-.43-.03-.6-.09-.17-.77-1.85-1.05-2.53-.28-.66-.56-.57-.77-.58h-.66c-.23 0-.6.09-.91.43-.31.34-1.2 1.17-1.2 2.85 0 1.68 1.22 3.3 1.4 3.53.17.23 2.4 3.66 5.81 5.13.81.35 1.44.56 1.93.71.81.26 1.55.22 2.13.13.65-.1 2.02-.83 2.3-1.62.29-.8.29-1.48.2-1.62-.08-.14-.31-.23-.65-.4z" />
            </svg>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 300, color: "#e9edef" }}>WhatsApp Clone</h1>
          <p style={{ fontSize: "14px", color: "#8696a0", marginTop: "4px" }}>
            {isLogin
              ? "Sign in to continue"
              : isRegister
              ? "Create your account"
              : "Enter your email to get a password reset link"}
          </p>
        </div>
        <div style={{ background: "#202c33", borderRadius: "12px", padding: "32px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#8696a0", marginBottom: "8px" }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00a884")}
                  onBlur={(e) => (e.target.style.borderColor = "transparent")}
                />
              </div>
            )}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#8696a0", marginBottom: "8px" }}>Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#00a884")}
                onBlur={(e) => (e.target.style.borderColor = "transparent")}
              />
            </div>
            {!isForgot && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#8696a0", marginBottom: "8px" }}>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00a884")}
                  onBlur={(e) => (e.target.style.borderColor = "transparent")}
                />
              </div>
            )}
            {isRegister && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#8696a0", marginBottom: "8px" }}>Phone (optional)</label>
                <input
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00a884")}
                  onBlur={(e) => (e.target.style.borderColor = "transparent")}
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "#00a884",
                color: "#fff",
                fontWeight: 500,
                fontSize: "14px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Sign In"
                : isRegister
                ? "Create Account"
                : "Send reset link"}
            </button>
          </form>

          {resetLink && (
            <div style={{ marginTop: "20px", padding: "16px", background: "#111b21", borderRadius: "10px", color: "#e9edef", wordBreak: "break-word" }}>
              <p style={{ marginBottom: "8px", fontSize: "14px", color: "#8696a0" }}>Reset link:</p>
              <a href={resetLink} style={{ color: "#00a884", fontSize: "14px" }}>{resetLink}</a>
            </div>
          )}

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            {isForgot ? (
              <>
                <span style={{ fontSize: "14px", color: "#8696a0" }}>Remembered your password? </span>
                <button
                  onClick={() => setAuthMode("login")}
                  style={{ fontSize: "14px", color: "#00a884", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                <div style={{ marginBottom: "12px" }}>
                  <button
                    onClick={() => setAuthMode("forgot")}
                    style={{ fontSize: "14px", color: "#00a884", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <span style={{ fontSize: "14px", color: "#8696a0" }}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button
                  onClick={() => setAuthMode(isLogin ? "register" : "login")}
                  style={{ fontSize: "14px", color: "#00a884", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
