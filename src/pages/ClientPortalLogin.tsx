import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginClientPortal } from "@/lib/clientPortalStore";

const C = {
  bg: "#0A0A0A",
  panel: "#141414",
  panel2: "#1C1C1C",
  ink: "#F5F5F5",
  muted: "#9CA3AF",
  accent: "#8B5CF6",
  hair: "rgba(255,255,255,0.10)",
  danger: "#EF4444",
  dangerBg: "rgba(239,68,68,0.10)",
};

const SANS = "'Geist', ui-sans-serif, -apple-system, sans-serif";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: `1px solid ${C.hair}`,
  background: C.panel2,
  color: C.ink,
  fontSize: 14,
  fontFamily: SANS,
  outline: "none",
  boxSizing: "border-box",
};

export default function ClientPortalLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      loginClientPortal(username.trim(), password);
      navigate("/client/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, background: C.panel, borderRadius: 18, border: `1px solid ${C.hair}`, padding: "30px 28px", boxShadow: "0 18px 60px rgba(0,0,0,0.35)" }}>
        <p style={{ margin: "0 0 10px", color: C.accent, fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: SANS }}>
          Client Portal
        </p>
        <h1 style={{ margin: "0 0 8px", color: C.ink, fontSize: 30, fontWeight: 800, fontFamily: SANS }}>
          Sign in
        </h1>
        <p style={{ margin: "0 0 22px", color: C.muted, fontSize: 14, lineHeight: 1.6, fontFamily: SANS }}>
          Use the account created for you by Kayrosco to track your applications, messages, and files.
        </p>

        {error && (
          <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 10, background: C.dangerBg, border: `1px solid ${C.danger}`, color: C.danger, fontSize: 13, fontFamily: SANS }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontFamily: SANS }}>
              Username
            </label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontFamily: SANS }}>
              Password
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "none",
              background: loading ? "#6D28D9" : C.accent,
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 800,
              fontFamily: SANS,
            }}
          >
            {loading ? "Signing in..." : "Open Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
