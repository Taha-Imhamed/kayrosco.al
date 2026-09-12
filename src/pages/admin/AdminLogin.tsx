import { useState, useEffect } from "react";
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

  useEffect(() => {
    document.documentElement.classList.add("no-site-zoom");
    return () => document.documentElement.classList.remove("no-site-zoom");
  }, []);

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
      background: "linear-gradient(190deg, #150F33 0%, #0C0920 60%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: SANS,
      padding: "24px 16px",
    }}>
      {/* Background glow texture */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "radial-gradient(circle at 22% 20%, rgba(139,124,255,0.16) 0%, transparent 45%), radial-gradient(circle at 80% 78%, rgba(139,124,255,0.14) 0%, transparent 50%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 400,
      }}>
        {/* Card */}
        <div style={{
          background: "rgba(21,15,51,0.72)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "40px 36px",
          boxShadow: "0 24px 80px rgba(5,2,20,0.55), 0 0 0 1px rgba(139,124,255,0.04)",
        }}>
          {/* Logo */}
          <div style={{ marginBottom: 36, textAlign: "center" }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "linear-gradient(135deg, #8B7CFF, #4338CA)",
              boxShadow: "0 8px 24px -6px rgba(139,124,255,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" fill="rgba(255,255,255,0.95)"/>
                <rect x="13" y="3" width="8" height="8" rx="2" fill="rgba(255,255,255,0.55)"/>
                <rect x="3" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,0.55)"/>
                <rect x="13" y="13" width="8" height="8" rx="2" fill="rgba(255,255,255,0.25)"/>
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
              color: "#8B7CFF",
              fontFamily: MONO,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}>
              Staff OS
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
                  border: `1.5px solid ${focusedField === "user" ? "#8B7CFF" : "rgba(255,255,255,0.09)"}`,
                  background: "rgba(255,255,255,0.05)",
                  fontSize: 14,
                  color: "#FFFFFF",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: SANS,
                  boxShadow: focusedField === "user" ? "0 0 0 3px rgba(139,124,255,0.22)" : "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
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
                  border: `1.5px solid ${focusedField === "pass" ? "#8B7CFF" : "rgba(255,255,255,0.09)"}`,
                  background: "rgba(255,255,255,0.05)",
                  fontSize: 14,
                  color: "#FFFFFF",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: SANS,
                  boxShadow: focusedField === "pass" ? "0 0 0 3px rgba(139,124,255,0.22)" : "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
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
                background: loading ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #8B7CFF, #8B7CFF)",
                color: loading ? "rgba(255,255,255,0.35)" : "#FFFFFF",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "-0.01em",
                boxShadow: loading ? "none" : "0 10px 28px -8px rgba(139,124,255,0.55)",
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
