import { useEffect, useState } from "react";

const STORAGE_KEY = "kayrosco-cookie-consent";
export const COOKIE_CONSENT_EVENT = "kayrosco-cookie-consent-changed";

export type ConsentValue = "accepted" | "declined";

export function getCookieConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return null;
  }
}

function setCookieConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // localStorage unavailable (private mode, etc.) — consent just won't persist across visits.
  }
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);
  }, []);

  if (!visible) return null;

  const handleChoice = (value: ConsentValue) => {
    setCookieConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="kayrosco-cookie-consent"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        zIndex: 2000,
        maxWidth: 640,
        margin: "0 auto",
        background: "linear-gradient(180deg, rgba(20,20,20,0.98) 0%, rgba(10,10,10,0.98) 100%)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 16,
        padding: "20px 22px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        color: "#EAEAEA",
        fontFamily: "'Manrope', sans-serif",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 16,
      }}
    >
      <p style={{ flex: "1 1 320px", margin: 0, fontSize: "0.9rem", lineHeight: 1.5, color: "#B0BEC5" }}>
        We use cookies to run this site and to understand traffic through Google Analytics. See our{" "}
        <a href="/privacy-policy" style={{ color: "#C0C0C0", textDecoration: "underline" }}>
          Privacy Policy
        </a>{" "}
        for details.
      </p>
      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => handleChoice("declined")}
          style={{
            padding: "10px 18px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "transparent",
            color: "#EAEAEA",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => handleChoice("accepted")}
          style={{
            padding: "10px 18px",
            borderRadius: 999,
            border: "1px solid #C0C0C0",
            background: "#C0C0C0",
            color: "#0A0A0A",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          Accept
        </button>
      </div>
      <style>{`
        .kayrosco-cookie-consent { bottom: 16px; }
        @media (max-width: 768px) {
          .kayrosco-cookie-consent { bottom: 112px; }
        }
      `}</style>
    </div>
  );
}
