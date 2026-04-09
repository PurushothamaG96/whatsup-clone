"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Missing reset token.");
      return;
    }
    if (!password || !confirmPassword) {
      toast.error("Please enter and confirm your new password.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to reset password");
      toast.success(data.message || "Password reset successfully");
      router.push("/");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111b21" }}>
      <div style={{ width: "100%", maxWidth: "420px", margin: "0 16px" }}>
        <div style={{ background: "#202c33", borderRadius: "12px", padding: "32px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 300, color: "#e9edef", marginBottom: "12px" }}>Reset password</h1>
          <p style={{ fontSize: "14px", color: "#8696a0", marginBottom: "24px" }}>
            Enter your new password to complete the password reset.
          </p>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#8696a0", marginBottom: "8px" }}>New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ background: "#2a3942", color: "#e9edef", border: "1px solid transparent", borderRadius: "8px", width: "100%", padding: "12px 16px", fontSize: "14px", outline: "none" }}
                onFocus={(e) => (e.target.style.borderColor = "#00a884")}
                onBlur={(e) => (e.target.style.borderColor = "transparent")}
              />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#8696a0", marginBottom: "8px" }}>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{ background: "#2a3942", color: "#e9edef", border: "1px solid transparent", borderRadius: "8px", width: "100%", padding: "12px 16px", fontSize: "14px", outline: "none" }}
                onFocus={(e) => (e.target.style.borderColor = "#00a884")}
                onBlur={(e) => (e.target.style.borderColor = "transparent")}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#00a884", color: "#fff", fontWeight: 500, fontSize: "14px", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Please wait..." : "Reset password"}
            </button>
          </form>
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <button
              onClick={() => router.push("/")}
              style={{ fontSize: "14px", color: "#00a884", background: "none", border: "none", cursor: "pointer" }}
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
