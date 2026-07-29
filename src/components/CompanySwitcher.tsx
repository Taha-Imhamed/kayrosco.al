import React, { useEffect, useRef, useState } from "react";
import { Plane, Scale, Cpu, ChevronDown, type LucideIcon } from "lucide-react";

type CompanyKey = "travel" | "consulting" | "tech";

const COMPANIES: {
  key: CompanyKey;
  href: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}[] = [
  { key: "travel", href: "/travel", title: "Travel", desc: "Trips, transfers & stays in Albania", icon: Plane, color: "#2dd4bf", bg: "rgba(20,184,166,0.15)" },
  { key: "consulting", href: "/consulting", title: "Consulting", desc: "Public services, permits & residency", icon: Scale, color: "#c084fc", bg: "rgba(168,85,247,0.15)" },
  { key: "tech", href: "/tech", title: "Tech", desc: "Software & cloud systems", icon: Cpu, color: "#60a5fa", bg: "rgba(59,130,246,0.15)" },
];

export default function CompanySwitcher({
  current,
  variant = "light",
}: {
  current: CompanyKey;
  variant?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const dark = variant === "dark";
  const others = COMPANIES.filter((c) => c.key !== current);

  return (
    <div ref={ref} style={{ position: "relative", fontFamily: "inherit" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 12px",
          borderRadius: 8,
          border: `1.5px solid ${dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)"}`,
          background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
          color: dark ? "#e5e7eb" : "#334155",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Our Companies
        <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 260,
            background: dark ? "#111827" : "#ffffff",
            border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
            borderRadius: 12,
            boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
            padding: 8,
            zIndex: 500,
          }}
        >
          <a
            href="/"
            style={{
              display: "block",
              padding: "8px 10px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: dark ? "#9ca3af" : "#94a3b8",
              textDecoration: "none",
            }}
          >
            ← Back to Kayrosco Group
          </a>
          {others.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.key}
                href={c.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 8,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: c.bg,
                    color: c.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </span>
                <span>
                  <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: dark ? "#f3f4f6" : "#1e293b" }}>
                    Kayrosco {c.title}
                  </span>
                  <span style={{ display: "block", fontSize: 11.5, color: dark ? "#9ca3af" : "#64748b" }}>{c.desc}</span>
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
