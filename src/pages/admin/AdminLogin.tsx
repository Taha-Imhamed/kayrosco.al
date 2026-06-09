import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const SANS = "'Geist', ui-sans-serif, -apple-system, sans-serif";
const MONO = "'Geist Mono', ui-monospace, monospace";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0B",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: SANS,
      padding: "24px 16px",
    }}>
      {/* Background grid texture */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.02) 0%, transparent 50%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 400,
      }}>
        {/* Card */}
        <div style={{
          background: "#111113",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "40px 36px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}>
          {/* Logo */}
          <div style={{ marginBottom: 36, textAlign: "center" }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "linear-gradient(135deg, #1a1a1c, #2a2a2e)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" fill="rgba(255,255,255,0.9)"/>
                <rect x="13" y="3" width="8" height="8" rx="2" fill="rgba(255,255,255,0.5)"/>
                <rect x="3" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,0.5)"/>
                <rect x="13" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,0.2)"/>
              </svg>
            </div>
            <span style={{
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 26,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              display: "block",
              lineHeight: 1,
            }}>
              Kayrosco
            </span>
            <p style={{
              marginTop: 6,
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              fontFamily: MONO,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}>
              Admin Portal
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                display: "block",
                fontSize: 11,
                fontWeight: 500,
                color: "rgba(255,255,255,0.45)",
                marginBottom: 7,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontFamily: MONO,
              }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                onFocus={() => setFocusedField("user")}
                onBlur={() => setFocusedField(null)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${focusedField === "user" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)"}`,
                  background: "rgba(255,255,255,0.04)",
                  fontSize: 14,
                  color: "#FFFFFF",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: SANS,
                  transition: "border-color 0.2s",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: "block",
                fontSize: 11,
                fontWeight: 500,
                color: "rgba(255,255,255,0.45)",
                marginBottom: 7,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontFamily: MONO,
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                onFocus={() => setFocusedField("pass")}
                onBlur={() => setFocusedField(null)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${focusedField === "pass" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)"}`,
                  background: "rgba(255,255,255,0.04)",
                  fontSize: 14,
                  color: "#FFFFFF",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: SANS,
                  transition: "border-color 0.2s",
                }}
              />
            </div>

            {error && (
              <div style={{
                marginBottom: 16,
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.25)",
                fontSize: 13,
                color: "#F87171",
                fontFamily: SANS,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 10,
                border: "none",
                background: loading ? "rgba(255,255,255,0.08)" : "#FFFFFF",
                color: loading ? "rgba(255,255,255,0.35)" : "#09090B",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "-0.01em",
                transition: "all 0.2s",
                fontFamily: SANS,
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 11,
            color: "rgba(255,255,255,0.2)",
            fontFamily: MONO,
            letterSpacing: "0.04em",
          }}>
            Restricted access — authorised personnel only
          </p>
        </div>
      </div>
    </div>
  );
}
