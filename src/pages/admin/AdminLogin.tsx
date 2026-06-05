import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/memo/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#cfc8b9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter Tight', 'Inter', sans-serif",
      }}
    >
      <div
        style={{
          background: "#f3efe7",
          borderRadius: 16,
          padding: "48px 40px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 8px 40px rgba(26,26,26,0.12)",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <span
            style={{
              fontFamily: "'Geist', ui-sans-serif, -apple-system, sans-serif",
              fontWeight: 600,
              fontStyle: "italic",
              fontSize: 32,
              color: "#16213E",
              letterSpacing: "-1px",
            }}
          >
            Kayrosco
          </span>
          <p
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "#8892A4",
              fontFamily: "'Geist Mono', ui-monospace, monospace",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Admin Portal
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "#8892A4",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1.5px solid #cfc8b9",
                background: "#faf8f5",
                fontSize: 15,
                color: "#16213E",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#16213E")}
              onBlur={(e) => (e.target.style.borderColor = "#cfc8b9")}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "#8892A4",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1.5px solid #cfc8b9",
                background: "#faf8f5",
                fontSize: 15,
                color: "#16213E",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#16213E")}
              onBlur={(e) => (e.target.style.borderColor = "#cfc8b9")}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(239,68,68,0.10)",
                border: "1px solid #f5c6c2",
                fontSize: 13,
                color: "#EF4444",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: loading ? "#8892A4" : "#16213E",
              color: "#f3efe7",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.04em",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 11,
            color: "#8892A4",
            fontFamily: "'Geist Mono', ui-monospace, monospace",
          }}
        >
          Restricted access — authorised personnel only
        </p>
      </div>
    </div>
  );
}
