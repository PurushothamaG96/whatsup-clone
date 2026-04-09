"use client";

export default function WelcomeScreen() {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#222e35",
      borderLeft: "1px solid #222d34",
    }}>
      {/* Lock icon area */}
      <div style={{ textAlign: "center", maxWidth: "380px", padding: "0 20px" }}>
        <div style={{
          width: "220px", height: "220px", borderRadius: "50%",
          background: "#2a3942",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 32px",
        }}>
          <svg viewBox="0 0 303 172" style={{ width: "160px", height: "auto" }} fill="none">
            <rect x="10" y="10" width="120" height="152" rx="12" fill="#374045" />
            <rect x="20" y="40" width="100" height="10" rx="5" fill="#4a5568" />
            <rect x="20" y="60" width="80" height="8" rx="4" fill="#2d3748" />
            <rect x="20" y="78" width="90" height="8" rx="4" fill="#2d3748" />
            <rect x="10" y="10" width="120" height="152" rx="12" fill="url(#grad)" opacity="0.3" />
            <rect x="173" y="10" width="120" height="152" rx="12" fill="#374045" />
            <rect x="183" y="60" width="100" height="10" rx="5" fill="#4a5568" />
            <rect x="183" y="80" width="80" height="8" rx="4" fill="#2d3748" />
            <rect x="183" y="98" width="90" height="8" rx="4" fill="#2d3748" />
            <rect x="183" y="130" width="60" height="20" rx="10" fill="#00a884" />
            <circle cx="152" cy="86" r="30" fill="#00a884" opacity="0.15" />
            <circle cx="152" cy="86" r="20" fill="#00a884" opacity="0.3" />
            <path d="M144 86l5 5 10-10" stroke="#00a884" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="grad" x1="10" y1="10" x2="130" y2="162" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00a884" />
                <stop offset="1" stopColor="#00a884" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h2 style={{ fontSize: "32px", fontWeight: 300, color: "#e9edef", marginBottom: "12px" }}>
          WhatsApp Clone
        </h2>

        <p style={{ fontSize: "14px", color: "#8696a0", lineHeight: 1.6, marginBottom: "24px" }}>
          Send and receive messages without keeping your phone online.
          <br />
          Use WhatsApp Clone on up to 4 linked devices and 1 phone.
        </p>

        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          justifyContent: "center", color: "#8696a0", fontSize: "13px",
        }}>
          <svg viewBox="0 0 24 24" style={{ width: "14px", height: "14px", fill: "#8696a0" }}>
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
          Your personal messages are end-to-end encrypted
        </div>
      </div>
    </div>
  );
}
