import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDashboardStats,
  getBudget,
  getTasks,
  getNotes,
  createTask,
  updateTaskStatus,
  deleteTask,
  createNote,
  toggleNotePin,
  deleteNote,
  getAdminUsers,
  AdminTask,
  AdminNote,
  AdminUser,
  TaskPriority,
  TaskStatus,
  Department,
  BudgetEntry,
} from "@/lib/adminApi";
import { getAccounts } from "@/lib/balanceStore";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { canAccess, ROLE_LABEL, roleDept, isDeptStaff as checkDeptStaff } from "@/lib/roleAccess";

// ─── Design tokens — Kayrosco reference system ───────────────────────────────
const C = {
  accent:       "#5750e6",
  accentPress:  "#4842c9",
  accentSoft:   "#eeedfb",
  accentRing:   "rgba(87,80,230,0.28)",
  bg:           "#f6f7f9",
  surface:      "#ffffff",
  surface2:     "#fbfbfd",
  border:       "#e9ebf0",
  borderStrong: "#dfe2e9",
  text:         "#141925",
  text2:        "#5b6474",
  text3:        "#8b93a3",
  textFaint:    "#aab1bf",
  pos:          "#0e9f6e",
  posSoft:      "#e4f5ee",
  neg:          "#e05260",
  negSoft:      "#fcebed",
  warn:         "#c77d12",
  warnSoft:     "#fbf0db",
};

const UI   = '"Manrope", system-ui, sans-serif';
const DISP = '"Space Grotesk", "Manrope", sans-serif';
const MONO = '"Geist Mono", "JetBrains Mono", ui-monospace, monospace';

const shSm = "0 1px 2px rgba(20,25,37,.04)";
const shMd = "0 4px 16px -6px rgba(20,25,37,.10), 0 1px 3px rgba(20,25,37,.04)";

// Shared card style
const card: React.CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 18,
  padding: 22,
  boxShadow: shSm,
};

// ─── Priority / status semantic maps ─────────────────────────────────────────
const PRIORITY_COLOR: Record<TaskPriority, { fg: string; bg: string }> = {
  low:    { fg: C.pos,  bg: C.posSoft  },
  medium: { fg: C.warn, bg: C.warnSoft },
  high:   { fg: C.neg,  bg: C.negSoft  },
  urgent: { fg: "#ef4444", bg: "#fef2f2" },
};

const STATUS_COLOR: Record<TaskStatus, { fg: string; bg: string; border: string }> = {
  open:        { fg: C.accent, bg: C.accentSoft,               border: C.accent },
  in_progress: { fg: C.warn,   bg: C.warnSoft,                 border: C.warn   },
  done:        { fg: C.pos,    bg: C.posSoft,                   border: C.pos    },
};

// ─── SVG icon set — stroke-based, 1.75 strokeWidth ───────────────────────────
type SvgProps = { size?: number; sw?: number };
const sv = (size = 18, sw = 1.75) => ({
  width: size, height: size, viewBox: "0 0 24 24",
  fill: "none", stroke: "currentColor",
  strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

const Ico = {
  Grid:     (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>,
  User:     (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></svg>,
  Users:    (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6.1"/><path d="M17 14.2a5.5 5.5 0 0 1 3.5 5.3"/></svg>,
  File:     (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 16.5h4"/></svg>,
  Check:    (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><path d="M5 12.5 10 17l9-10"/></svg>,
  Card:     (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19"/><path d="M6 14.5h4"/></svg>,
  Budget:   (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.2A2 2 0 0 1 12 8.5a2 2 0 0 1 0 4 2 2 0 0 0 0 4 2 2 0 0 1-2.4-.8"/></svg>,
  Trend:    (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><path d="M3 17l5.5-5.5 3 3L21 6"/><path d="M16 6h5v5"/></svg>,
  Pipeline: (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><path d="M3 12h3l2.5-6 4 13L16 9l1.5 3H21"/></svg>,
  Ticket:   (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z"/><path d="M14 6v12" strokeDasharray="2 2.5"/></svg>,
  Lock:     (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>,
  Building: (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/><path d="M9 21v-3h6v3"/></svg>,
  Bell:     (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><path d="M18 8.5a6 6 0 0 0-12 0c0 6.5-2.5 7.5-2.5 7.5h17S18 15 18 8.5Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>,
  Activity: (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><path d="M3 12h4l2.5-6 5 13 2.5-7H21"/></svg>,
  Monitor:  (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>,
  Chat:     (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9A1.5 1.5 0 0 1 18.5 16H9l-4 4z"/></svg>,
  Globe:    (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/></svg>,
  Plus:     (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><path d="M12 5v14M5 12h14"/></svg>,
  Chevron:  (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><path d="m9 6 6 6-6 6"/></svg>,
  Trash:    (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/></svg>,
  Clock:    (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></svg>,
  Pin:      ({ active, size = 13 }: { active?: boolean; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Close:    (p: SvgProps = {}) => <svg {...sv(p.size ?? 12, p.sw ?? 2)}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Sparkles: (p: SvgProps = {}) => <svg {...sv(p.size, p.sw)}><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>,
  // Activity log action icons
  ActCreate:   () => <svg {...sv(14)}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  ActEdit:     () => <svg {...sv(14)}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  ActLogin:    () => <svg {...sv(14)}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
  ActLogout:   () => <svg {...sv(14)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  ActDelete:   () => <svg {...sv(14)}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  ActDownload: () => <svg {...sv(14)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  ActUpload:   () => <svg {...sv(14)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
};

// ─── Activity log tile colors ────────────────────────────────────────────────
type ActionTile = { bg: string; color: string; Ic: React.FC };
const ACTION_TILE: Record<string, ActionTile> = {
  login:    { bg: C.accentSoft,              color: C.accent, Ic: Ico.ActLogin    },
  logout:   { bg: "#f1f5f9",                 color: C.text3,  Ic: Ico.ActLogout   },
  create:   { bg: C.posSoft,                 color: C.pos,    Ic: Ico.ActCreate   },
  edit:     { bg: C.warnSoft,                color: C.warn,   Ic: Ico.ActEdit     },
  delete:   { bg: C.negSoft,                 color: C.neg,    Ic: Ico.ActDelete   },
  download: { bg: C.accentSoft,              color: C.accent, Ic: Ico.ActDownload },
  upload:   { bg: C.posSoft,                 color: C.pos,    Ic: Ico.ActUpload   },
};
const DEFAULT_ACT: ActionTile = { bg: "#f1f5f9", color: C.text3, Ic: Ico.Activity };

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color = C.accent, w = 84, h = 28 }: {
  data: number[]; color?: string; w?: number; h?: number;
}) {
  if (!data || data.length < 2) return <div style={{ height: h, width: w }} />;
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((d, i): [number, number] => [
    i * step,
    h - ((d - min) / rng) * (h - 6) - 3,
  ]);
  const linePath = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${w} ${h} L0 ${h} Z`;
  const gid = `sg${Math.abs(Math.round(data[0] * 100 + data.length * 13))}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: w, height: h, display: "block", overflow: "visible" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.20" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gid})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.6" fill={color} />
    </svg>
  );
}

// ─── KPI card ────────────────────────────────────────────────────────────────
function KpiCard({
  label, IcoEl, value, sub, delta, deltaDir, spark, sparkColor,
}: {
  label: string;
  IcoEl: React.FC<SvgProps>;
  value: string | number;
  sub: string;
  delta?: string;
  deltaDir?: "up" | "down" | "flat";
  spark?: number[];
  sparkColor?: string;
}) {
  const [hov, setHov] = useState(false);
  const deltaStyle: React.CSSProperties = deltaDir === "up"
    ? { color: C.pos, background: C.posSoft }
    : deltaDir === "down"
    ? { color: C.neg, background: C.negSoft }
    : { color: C.text3, background: C.surface2, border: `1px solid ${C.border}` };

  return (
    <div
      style={{
        ...card,
        display: "flex", flexDirection: "column", gap: 14,
        transition: "box-shadow .16s, border-color .16s",
        boxShadow: hov ? shMd : shSm,
        borderColor: hov ? C.borderStrong : C.border,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <span style={{
          fontSize: 11, fontFamily: UI, fontWeight: 700,
          letterSpacing: "0.10em", color: C.text3, textTransform: "uppercase",
        }}>
          {label}
        </span>
        {/* Neutral icon chip — never colored */}
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: C.surface2, border: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.text2,
        }}>
          <IcoEl size={18} />
        </div>
      </div>

      {/* Big number */}
      <div style={{
        fontFamily: DISP, fontSize: 34, fontWeight: 600,
        letterSpacing: "-0.02em", lineHeight: 1, color: C.text,
      }}>
        {value}
      </div>

      {/* Footer: delta + sub + sparkline */}
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        {delta != null && deltaDir && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
            ...deltaStyle,
          }}>
            {deltaDir === "up" ? "▲" : deltaDir === "down" ? "▼" : "▸"} {delta}
          </span>
        )}
        <span style={{ fontSize: 12.5, color: C.text3, fontFamily: UI }}>{sub}</span>
        {spark && (
          <div style={{ marginLeft: "auto", flexShrink: 0 }}>
            <Sparkline data={spark} color={sparkColor ?? C.accent} w={84} h={28} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Finance row: budget panel + balance card ─────────────────────────────────
function FinanceRow({
  allocated, spent, totalBalance, navigate,
}: {
  allocated: number; spent: number; totalBalance: number; navigate: (to: string) => void;
}) {
  const remaining = allocated - spent;
  const pct = allocated ? Math.round((spent / allocated) * 100) : 0;
  const fmt = (n: number) => "$" + n.toLocaleString();
  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const balSpark = totalBalance !== 0 ? [
    totalBalance * 0.76,
    totalBalance * 0.82,
    totalBalance * 0.79,
    totalBalance * 0.88,
    totalBalance * 0.91,
    totalBalance * 0.95,
    totalBalance * 0.93,
    totalBalance,
  ] : null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 18 }}>

      {/* Budget panel */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <span style={{
            fontSize: 12.5, fontFamily: UI, fontWeight: 700,
            letterSpacing: ".08em", color: C.text3, textTransform: "uppercase",
          }}>
            Budget · {monthLabel}
          </span>
          <button
            onClick={() => navigate("/memo/budget")}
            style={{
              fontSize: 12.5, fontWeight: 650, color: C.accent,
              background: "none", border: "none", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 4, fontFamily: UI,
              padding: 0,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = C.accentPress)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = C.accent)}
          >
            Manage budget <Ico.Chevron size={13} />
          </button>
        </div>

        {/* Three figures */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 28, marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11.5, fontFamily: UI, fontWeight: 600, letterSpacing: ".06em", color: C.text3, textTransform: "uppercase", marginBottom: 8 }}>Allocated</div>
            <div style={{ fontFamily: DISP, fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1, color: C.text }}>
              {allocated > 0 ? fmt(allocated) : "$0"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, fontFamily: UI, fontWeight: 600, letterSpacing: ".06em", color: C.text3, textTransform: "uppercase", marginBottom: 8 }}>Spent</div>
            <div style={{ fontFamily: DISP, fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1, color: C.text2 }}>
              {fmt(spent)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, fontFamily: UI, fontWeight: 600, letterSpacing: ".06em", color: C.text3, textTransform: "uppercase", marginBottom: 8 }}>Remaining</div>
            <div style={{
              fontFamily: DISP, fontSize: 24, fontWeight: 600,
              letterSpacing: "-0.02em", lineHeight: 1,
              color: allocated > 0 ? (remaining >= 0 ? C.pos : C.neg) : C.text2,
            }}>
              {allocated > 0 ? fmt(remaining) : "$0"}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 10, borderRadius: 20, background: C.surface2, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: allocated > 0 ? `${Math.min(pct, 100)}%` : "0%",
            background: `linear-gradient(90deg, ${C.accent}, #8b86f0)`,
            borderRadius: 20,
            transition: "width .5s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9, fontSize: 12, color: C.text3, fontFamily: UI }}>
          {allocated > 0 ? (
            <>
              <span><strong style={{ color: C.text2, fontWeight: 700 }}>{pct}%</strong> of budget used</span>
              <span><strong style={{ color: C.text2, fontWeight: 700 }}>{fmt(remaining)}</strong> available</span>
            </>
          ) : (
            <>
              <span>No budget allocated yet</span>
              <button onClick={() => navigate("/memo/budget")} style={{ color: C.accent, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontFamily: UI, padding: 0 }}>
                Set up budget →
              </button>
            </>
          )}
        </div>
      </div>

      {/* Balance card */}
      <div style={{ ...card, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{
            fontSize: 12.5, fontFamily: UI, fontWeight: 700,
            letterSpacing: ".08em", color: C.text3, textTransform: "uppercase",
          }}>
            Total Balance
          </span>
          <span style={{ color: C.text3 }}><Ico.Trend size={16} /></span>
        </div>

        <div style={{ fontFamily: DISP, fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1, color: C.text, margin: "4px 0 12px" }}>
          {fmt(totalBalance)}
        </div>

        {totalBalance > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: C.pos, background: C.posSoft }}>
              ▲ Active
            </span>
            <span style={{ fontSize: 12.5, color: C.text3, fontFamily: UI }}>from all balance accounts</span>
          </div>
        ) : (
          <div style={{ fontSize: 12.5, color: C.text3, fontFamily: UI, marginBottom: 10 }}>
            No balance accounts yet
          </div>
        )}

        <div style={{ marginTop: "auto" }}>
          {balSpark ? (
            <Sparkline data={balSpark} color={C.pos} w={300} h={46} />
          ) : (
            <Sparkline data={[0, 0, 0, 0, 0, 0, 0, 0]} color={C.text3} w={300} h={46} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Quick Access — compact horizontal grid ───────────────────────────────────
function QuickAccess({ navigate, adminRole }: { navigate: (to: string) => void; adminRole: string | undefined }) {
  const ALL: { label: string; Ic: React.FC<SvgProps>; to: string }[] = [
    { label: "Contracts",     Ic: Ico.File,     to: "/memo/contracts"      },
    { label: "Partners",      Ic: Ico.Users,    to: "/memo/partners"       },
    { label: "Pipeline",      Ic: Ico.Pipeline, to: "/memo/pipeline"       },
    { label: "Agent",         Ic: Ico.Sparkles, to: "/memo/agent"          },
    { label: "Agent Work",    Ic: Ico.Chat,     to: "/memo/agent/work"     },
    { label: "Revenue",       Ic: Ico.Trend,    to: "/memo/revenue"        },
    { label: "Expenses",      Ic: Ico.Card,     to: "/memo/expenses"       },
    { label: "Clients",       Ic: Ico.Users,    to: "/memo/clients"        },
    { label: "Permissions",   Ic: Ico.Lock,     to: "/memo/permissions"    },
    { label: "Budget",        Ic: Ico.Budget,   to: "/memo/budget"         },
    { label: "Staff",         Ic: Ico.User,     to: "/memo/staff"          },
    { label: "Tech",          Ic: Ico.Monitor,  to: "/memo/dept/tech"      },
    { label: "Consulting",    Ic: Ico.Chat,     to: "/memo/dept/consulting"},
    { label: "Travel",        Ic: Ico.Globe,    to: "/memo/dept/travel"    },
    { label: "Announcements", Ic: Ico.Bell,     to: "/memo/announcements"  },
    { label: "Activity Logs", Ic: Ico.Activity, to: "/memo/logs"           },
    { label: "Company",       Ic: Ico.Building, to: "/memo/company"        },
  ];

  const items = adminRole
    ? ALL.filter((it) => canAccess(adminRole as Parameters<typeof canAccess>[0], it.to))
    : ALL;
  if (items.length === 0) return null;

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 12.5, fontFamily: UI, fontWeight: 700, letterSpacing: ".08em", color: C.text3, textTransform: "uppercase" }}>
          Quick Access
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 650, color: C.text3, fontFamily: UI }}>Customize →</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
        {items.map((it) => (
          <QaButton key={it.label} label={it.label} Ic={it.Ic} onClick={() => navigate(it.to)} />
        ))}
      </div>
    </div>
  );
}

function QaButton({ label, Ic, onClick }: { label: string; Ic: React.FC<SvgProps>; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 11,
        padding: "11px 13px", borderRadius: 13,
        border: `1px solid ${hov ? C.accent : C.border}`,
        background: hov ? C.accentSoft : C.surface,
        color: C.text, cursor: "pointer",
        transform: hov ? "translateY(-1px)" : "none",
        boxShadow: hov ? shSm : "none",
        transition: "all .14s",
        textAlign: "left",
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: hov ? C.surface : C.surface2,
        border: `1px solid ${hov ? "rgba(87,80,230,.35)" : C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hov ? C.accent : C.text2,
        transition: "all .14s",
      }}>
        <Ic size={16} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: UI, lineHeight: 1.15 }}>{label}</span>
    </button>
  );
}

// ─── Tasks widget — real Supabase data ────────────────────────────────────────
function TasksWidget({ adminUser, deptFilter }: { adminUser: AdminUser | null; deptFilter?: Department }) {
  const [tasks, setTasks]     = useState<AdminTask[]>([]);
  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [draft, setDraft]     = useState("");
  const [filter, setFilter]   = useState<TaskStatus | "">("");
  const [saving, setSaving]   = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getTasks({
      ...(filter     ? { status:     filter     as TaskStatus } : {}),
      ...(deptFilter ? { department: deptFilter as Department } : {}),
    }).then(setTasks).catch(console.error).finally(() => setLoading(false));
  }, [filter, deptFilter]);

  useEffect(() => { load(); getAdminUsers().then(setUsers).catch(() => {}); }, [load]);

  const quickAdd = async () => {
    if (!draft.trim() || saving) return;
    setSaving(true);
    try {
      await createTask({
        title: draft.trim(),
        assignedTo: null, assignedToUsername: null,
        department: deptFilter ?? null,
        priority: "medium",
        dueDate: null,
        createdBy: adminUser?.id ?? null,
        createdByUsername: adminUser?.username ?? "admin",
      });
      setDraft(""); setAdding(false); load();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const cycleStatus = async (t: AdminTask) => {
    const next: Record<TaskStatus, TaskStatus> = { open: "in_progress", in_progress: "done", done: "open" };
    await updateTaskStatus(t.id, next[t.status]);
    load();
  };

  const filterLabels: { val: TaskStatus | ""; label: string }[] = [
    { val: "",            label: "All"         },
    { val: "open",        label: "Open"        },
    { val: "in_progress", label: "In Progress" },
    { val: "done",        label: "Done"        },
  ];

  return (
    <div style={card}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontFamily: UI, fontWeight: 700, color: C.text }}>Tasks</span>
          <span style={{
            fontSize: 11, fontWeight: 700, fontFamily: UI,
            padding: "1px 7px", borderRadius: 20,
            background: C.surface2, color: C.text2, border: `1px solid ${C.border}`,
          }}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: C.accent, color: "#fff", border: "none",
            padding: "7px 13px", borderRadius: 9, cursor: "pointer",
            fontSize: 13, fontWeight: 650, fontFamily: UI,
            boxShadow: `0 4px 12px -4px ${C.accentRing}`,
          }}
        >
          <Ico.Plus size={15} /> Task
        </button>
      </div>

      {/* Segmented filter */}
      <div style={{
        display: "inline-flex", background: C.surface2,
        border: `1px solid ${C.border}`, borderRadius: 9, padding: 3, marginBottom: 14,
      }}>
        {filterLabels.map(({ val, label }) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            style={{
              border: "none", background: filter === val ? C.surface : "none",
              padding: "5px 12px", fontSize: 12.5, fontWeight: 600, fontFamily: UI,
              color: filter === val ? C.text : C.text2,
              borderRadius: 6, cursor: "pointer",
              boxShadow: filter === val ? shSm : "none",
              transition: ".12s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Inline add */}
      {adding && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input
            autoFocus
            placeholder="What needs doing?"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") quickAdd(); if (e.key === "Escape") { setAdding(false); setDraft(""); } }}
            style={{
              flex: 1, height: 40, padding: "0 13px",
              border: `1px solid ${C.border}`, borderRadius: 9,
              background: C.surface2, fontSize: 13.5, fontFamily: UI,
              color: C.text, outline: "none", boxSizing: "border-box",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.accentRing}`; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = C.border;  e.currentTarget.style.boxShadow = "none"; }}
          />
          <button
            onClick={quickAdd}
            disabled={saving || !draft.trim()}
            style={{
              background: C.accent, color: "#fff", border: "none",
              padding: "0 16px", borderRadius: 9, cursor: "pointer",
              fontSize: 13, fontWeight: 650, fontFamily: UI, opacity: saving ? 0.6 : 1,
            }}
          >
            Add
          </button>
        </div>
      )}

      {/* Task list */}
      {loading ? (
        <div style={{ padding: "24px 4px", textAlign: "center" }}>
          <span style={{ fontSize: 13, color: C.text3, fontFamily: UI }}>Loading…</span>
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "34px 20px", gap: 6, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: C.surface2, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.text3, marginBottom: 6 }}>
            <Ico.Check size={22} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 650, color: C.text2, fontFamily: UI }}>No tasks yet</div>
          <div style={{ fontSize: 12.5, color: C.text3, fontFamily: UI, maxWidth: 220, lineHeight: 1.5 }}>
            Create a task to start tracking work across contracts and finance.
          </div>
        </div>
      ) : (
        <div>
          {tasks.map((t, i) => {
            const s = STATUS_COLOR[t.status];
            const p = PRIORITY_COLOR[t.priority];
            const overdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== "done";
            return (
              <div key={t.id} style={{
                display: "flex", alignItems: "flex-start", gap: 13,
                padding: "13px 4px",
                borderTop: i === 0 ? "none" : `1px solid ${C.border}`,
              }}>
                <button
                  onClick={() => cycleStatus(t)}
                  style={{
                    width: 19, height: 19, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    border: `1.8px solid ${t.status === "done" ? C.accent : C.borderStrong}`,
                    background: t.status === "done" ? C.accent : C.surface,
                    cursor: "pointer", display: "grid", placeItems: "center",
                    color: "#fff", transition: ".14s",
                  }}
                >
                  {t.status === "done" && <Ico.Check size={12} sw={2.4} />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontFamily: UI, fontWeight: 600,
                    color: t.status === "done" ? C.text3 : C.text,
                    textDecoration: t.status === "done" ? "line-through" : "none",
                    marginBottom: 5,
                  }}>
                    {t.title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 12 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      fontSize: 11, fontWeight: 650, padding: "2px 8px", borderRadius: 20,
                      color: p.fg, background: p.bg,
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                      {t.priority}
                    </span>
                    {t.due_date && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: overdue ? C.neg : C.text3 }}>
                        <Ico.Clock size={13} /> {t.due_date}{overdue ? " · OVERDUE" : ""}
                      </span>
                    )}
                    {t.department && (
                      <span style={{ color: C.text3, textTransform: "capitalize" }}>{t.department}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(t.id).then(load)}
                  style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer", padding: 4, borderRadius: 6, display: "flex", transition: ".12s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = C.neg; (e.currentTarget as HTMLButtonElement).style.background = C.negSoft; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = C.textFaint; (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                >
                  <Ico.Trash size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Notes widget — real Supabase data ────────────────────────────────────────
function NotesWidget({ adminUser }: { adminUser: AdminUser | null }) {
  const [notes, setNotes]     = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft]     = useState("");
  const [saving, setSaving]   = useState(false);

  const load = () => {
    setLoading(true);
    getNotes().then(setNotes).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!draft.trim() || saving) return;
    setSaving(true);
    try {
      await createNote({ content: draft.trim(), authorId: adminUser?.id ?? null, authorUsername: adminUser?.username ?? "admin", pinned: false });
      setDraft(""); load();
    } finally { setSaving(false); }
  };

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontFamily: UI, fontWeight: 700, color: C.text }}>Notes</span>
          <span style={{
            fontSize: 11, fontWeight: 700, fontFamily: UI,
            padding: "1px 7px", borderRadius: 20,
            background: C.surface2, color: C.text2, border: `1px solid ${C.border}`,
          }}>
            {notes.length}
          </span>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        placeholder="Jot a quick note…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add(); }}
        rows={3}
        style={{
          width: "100%", border: `1px solid ${C.border}`, borderRadius: 13,
          background: C.surface2, padding: "11px 13px",
          fontSize: 13.5, fontFamily: UI, color: C.text, outline: "none",
          resize: "none", boxSizing: "border-box", transition: ".14s",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = C.surface; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.accentRing}`; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = C.border;  e.currentTarget.style.background = C.surface2; e.currentTarget.style.boxShadow = "none"; }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 9 }}>
        <button
          onClick={add}
          disabled={saving || !draft.trim()}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: C.accent, color: "#fff", border: "none",
            padding: "7px 13px", borderRadius: 9, cursor: saving || !draft.trim() ? "not-allowed" : "pointer",
            fontSize: 13, fontWeight: 650, fontFamily: UI, opacity: saving || !draft.trim() ? 0.5 : 1,
          }}
        >
          <Ico.Plus size={15} /> Add note
        </button>
      </div>

      {/* Notes list */}
      {loading ? (
        <div style={{ padding: "24px 4px", textAlign: "center" }}>
          <span style={{ fontSize: 13, color: C.text3, fontFamily: UI }}>Loading…</span>
        </div>
      ) : notes.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 20px", gap: 6, textAlign: "center", marginTop: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: C.surface2, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.text3, marginBottom: 6 }}>
            <Ico.Sparkles size={22} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 650, color: C.text2, fontFamily: UI }}>No notes yet</div>
          <div style={{ fontSize: 12.5, color: C.text3, fontFamily: UI, maxWidth: 200, lineHeight: 1.5 }}>
            Capture reminders and context for your team here.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
          {notes.map((n) => (
            <div key={n.id} style={{
              border: `1px solid ${C.border}`, borderRadius: 13,
              padding: "12px 13px", background: C.surface2,
              display: "flex", gap: 11, alignItems: "flex-start",
            }}>
              {/* Accent rail */}
              <div style={{ width: 3, alignSelf: "stretch", borderRadius: 4, background: C.accent, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontFamily: UI, color: C.text, lineHeight: 1.5 }}>{n.content}</div>
                <div style={{ fontSize: 11.5, color: C.text3, fontFamily: UI, marginTop: 6 }}>
                  {n.author_username} · {new Date(n.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                <button
                  onClick={() => toggleNotePin(n.id, !n.pinned).then(load)}
                  title={n.pinned ? "Unpin" : "Pin"}
                  style={{ background: "none", border: "none", padding: 4, borderRadius: 6, cursor: "pointer", color: n.pinned ? C.accent : C.textFaint, display: "flex", transition: ".12s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = C.accent; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = n.pinned ? C.accent : C.textFaint; }}
                >
                  <Ico.Pin active={n.pinned} />
                </button>
                <button
                  onClick={() => deleteNote(n.id).then(load)}
                  style={{ background: "none", border: "none", padding: 4, borderRadius: 6, cursor: "pointer", color: C.textFaint, display: "flex", transition: ".12s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = C.neg; (e.currentTarget as HTMLButtonElement).style.background = C.negSoft; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = C.textFaint; (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                >
                  <Ico.Trash size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { admin }  = useAdminAuth();
  const navigate   = useNavigate();
  const [stats, setStats]     = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);
  const [budgetEntries, setBudgetEntries] = useState<BudgetEntry[]>([]);
  const [accountBalanceTotal, setAccountBalanceTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // Inject Manrope + Space Grotesk fonts
  useEffect(() => {
    const id = "kayrosco-dash-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id; link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const now = new Date();
    const syncBalanceTotal = () => {
      setAccountBalanceTotal(
        getAccounts().reduce((sum, account) => sum + Number(account.balance), 0),
      );
    };

    Promise.all([
      getDashboardStats(),
      getBudget(now.getFullYear(), now.getMonth() + 1),
    ])
      .then(([dashboardStats, monthlyBudget]) => {
        setStats(dashboardStats);
        setBudgetEntries(monthlyBudget);
        syncBalanceTotal();
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    window.addEventListener("focus", syncBalanceTotal);
    window.addEventListener("storage", syncBalanceTotal);
    return () => {
      window.removeEventListener("focus", syncBalanceTotal);
      window.removeEventListener("storage", syncBalanceTotal);
    };
  }, []);

  const now      = new Date();
  const hour     = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr  = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const budgetAllocated = budgetEntries.reduce((sum, entry) => sum + Number(entry.allocated_amount), 0);
  const budgetSpent = budgetEntries.reduce((sum, entry) => sum + Number(entry.spent_amount), 0);
  const budgetRemaining = budgetAllocated - budgetSpent;
  const budgetPct = budgetAllocated ? Math.round((budgetSpent / budgetAllocated) * 100) : 0;

  const role       = admin?.role;
  const isAdmin    = role === "admin";
  const isViewer   = role === "viewer";
  const isDeptStaff = checkDeptStaff(role);
  const dept       = roleDept(role);

  // Spark data — TODO: wire to API time-series endpoints for real sparklines
  const staffSpark    = stats ? [
    Math.max(1, (stats.totalUsers  ?? 0) - 3), (stats.totalUsers ?? 0) - 2,
    (stats.totalUsers ?? 0) - 2, (stats.totalUsers ?? 0) - 1,
    (stats.totalUsers ?? 0) - 1, stats.totalUsers ?? 0,
    stats.totalUsers ?? 0, stats.totalUsers ?? 0,
  ] : undefined;
  const contractSpark = stats ? [
    Math.max(1, (stats.activeContracts ?? 0) - 4), (stats.activeContracts ?? 0) - 3,
    (stats.activeContracts ?? 0) - 2, (stats.activeContracts ?? 0) - 2,
    (stats.activeContracts ?? 0) - 1, (stats.activeContracts ?? 0) - 1,
    stats.activeContracts ?? 0, stats.activeContracts ?? 0,
  ] : undefined;
  const taskSpark     = stats ? [
    (stats.openTasks ?? 0) + 4, (stats.openTasks ?? 0) + 3, (stats.openTasks ?? 0) + 2,
    (stats.openTasks ?? 0) + 2, (stats.openTasks ?? 0) + 1, stats.openTasks ?? 0,
    stats.openTasks ?? 0, stats.openTasks ?? 0,
  ] : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26, fontFamily: UI }}>

      {/* ── Greeting ── */}
      <div>
        <h1 style={{
          fontFamily: DISP, fontWeight: 600, fontSize: 27,
          letterSpacing: "-0.02em", color: C.text, margin: "0 0 10px",
        }}>
          {greeting},{" "}
          <span style={{ color: C.accent }}>{admin?.username ?? "admin"}</span>
        </h1>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, fontSize: 13, color: C.text2, fontFamily: UI }}>
          <span>{dateStr}</span>
          <span style={{ color: C.textFaint }}>·</span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontSize: 11.5, fontWeight: 650, padding: "4px 10px", borderRadius: 30,
            color: C.accent, background: C.accentSoft, letterSpacing: ".08em",
          }}>
            {role ? ROLE_LABEL[role].toUpperCase() : "USER"}
            {dept ? ` · ${dept.toUpperCase()}` : ""}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontSize: 11.5, fontWeight: 650, padding: "4px 10px", borderRadius: 30,
            color: C.pos, background: C.posSoft,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: C.pos, flexShrink: 0,
              boxShadow: `0 0 0 3px rgba(14,159,110,.22)`,
            }} />
            All systems operational
          </span>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          padding: "12px 16px", borderRadius: 10,
          background: C.negSoft, border: `1px solid rgba(224,82,96,.25)`,
          color: "#b91c1c", fontSize: 13, fontFamily: UI,
        }}>
          Connection error: {error} — check Supabase and run admin_schema.sql.
        </div>
      )}

      {/* ── Announcement banners ── */}
      {stats?.activeAnnouncements && stats.activeAnnouncements.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {stats.activeAnnouncements.map((a) => {
            const colors = a.level === "urgent"
              ? { bg: C.negSoft,  border: "rgba(224,82,96,.25)",  text: C.neg,  label: "URGENT"  }
              : a.level === "warning"
              ? { bg: C.warnSoft, border: "rgba(199,125,18,.25)", text: C.warn, label: "WARNING" }
              : { bg: C.accentSoft,border: "rgba(87,80,230,.20)", text: C.accent,label: "INFO"   };
            return (
              <div key={a.id} style={{
                padding: "12px 16px", borderRadius: 10,
                background: colors.bg, border: `1px solid ${colors.border}`,
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <span style={{ fontSize: 10, fontFamily: MONO, fontWeight: 600, color: colors.text, textTransform: "uppercase", letterSpacing: ".18em", minWidth: 52, paddingTop: 1 }}>
                  {colors.label}
                </span>
                <span style={{ fontSize: 13.5, fontFamily: UI, color: C.text, flex: 1, lineHeight: 1.5 }}>{a.content}</span>
                <button
                  onClick={() => navigate("/memo/announcements")}
                  style={{ background: "none", border: `1px solid ${C.border}`, padding: "4px 10px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontFamily: UI, color: C.text2, flexShrink: 0 }}
                >
                  Manage
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── KPI row ── */}
      {isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          <KpiCard
            label="Active Staff" IcoEl={Ico.User}
            value={loading ? "—" : stats?.totalUsers ?? 0}
            sub="vs last month"
            delta={loading ? undefined : String(Math.max(0, (stats?.totalUsers ?? 0) - Math.max(0, (stats?.totalUsers ?? 0) - 3)))}
            deltaDir="up"
            spark={staffSpark} sparkColor={C.accent}
          />
          <KpiCard
            label="Contracts" IcoEl={Ico.File}
            value={loading ? "—" : stats?.activeContracts ?? 0}
            sub="active deals"
            delta={loading ? undefined : "2"}
            deltaDir="up"
            spark={contractSpark} sparkColor={C.accent}
          />
          <KpiCard
            label="Open Tasks" IcoEl={Ico.Check}
            value={loading ? "—" : stats?.openTasks ?? 0}
            sub={loading ? "" : `${stats?.doneTasks ?? 0} done`}
            delta={loading ? undefined : "1"}
            deltaDir="down"
            spark={taskSpark} sparkColor={C.warn}
          />
          <KpiCard
            label="Pending Expenses" IcoEl={Ico.Card}
            value={loading ? "—" : stats?.pendingExpenses ?? 0}
            sub="awaiting review"
            delta={loading ? undefined : "0"}
            deltaDir="flat"
          />
        </div>
      )}

      {isViewer && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          <KpiCard label="Contracts" IcoEl={Ico.File} value={loading ? "—" : stats?.activeContracts ?? 0} sub="active deals" />
          <KpiCard label="Open Tasks" IcoEl={Ico.Check} value={loading ? "—" : stats?.openTasks ?? 0} sub={`${stats?.doneTasks ?? 0} done`} />
          <KpiCard label="Budget Allocated" IcoEl={Ico.Budget} value={loading ? "—" : `$${budgetAllocated.toLocaleString()}`} sub={`${budgetPct}% used`} />
          <KpiCard label="Total Balance" IcoEl={Ico.Trend} value={loading ? "—" : `$${accountBalanceTotal.toLocaleString()}`} sub="From all balance accounts" />
        </div>
      )}

      {isDeptStaff && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <KpiCard label="Open Tasks" IcoEl={Ico.Check} value={loading ? "—" : stats?.openTasks ?? 0} sub={`${stats?.doneTasks ?? 0} completed`} />
          <KpiCard label="Pending Expenses" IcoEl={Ico.Card} value={loading ? "—" : stats?.pendingExpenses ?? 0} sub="Awaiting review" />
        </div>
      )}

      {/* ── Finance row — admin only ── */}
      {isAdmin && (
        <FinanceRow
          allocated={budgetAllocated}
          spent={budgetSpent}
          totalBalance={accountBalanceTotal}
          navigate={navigate}
        />
      )}

      {/* ── Quick Access ── */}
      <QuickAccess navigate={navigate} adminRole={role} />

      {/* ── Tasks + Notes ── */}
      {!isViewer && (
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, alignItems: "start" }}>
          <TasksWidget adminUser={admin} deptFilter={dept ? (dept as Department) : undefined} />
          <NotesWidget adminUser={admin} />
        </div>
      )}

      {/* ── Recent Activity — admin & viewer ── */}
      {(isAdmin || isViewer) && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontFamily: UI, fontWeight: 700, color: C.text }}>Recent Activity</span>
            {isAdmin && (
              <button
                onClick={() => navigate("/memo/logs")}
                style={{ background: "none", border: `1px solid ${C.border}`, padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12.5, fontFamily: UI, color: C.text2 }}
              >
                View all
              </button>
            )}
          </div>
          <div style={card}>
            {loading ? (
              <div style={{ padding: "16px 4px", color: C.text3, fontSize: 13, fontFamily: UI }}>Loading…</div>
            ) : !stats?.recentLogs?.length ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "34px 20px", gap: 6, textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, background: C.surface2, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.text3, marginBottom: 6 }}>
                  <Ico.Activity size={22} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 650, color: C.text2, fontFamily: UI }}>No activity yet</div>
                <div style={{ fontSize: 12.5, color: C.text3, fontFamily: UI }}>Actions taken by team members will appear here.</div>
              </div>
            ) : (
              stats.recentLogs.map((log, i) => {
                const tile = ACTION_TILE[log.action_type] ?? DEFAULT_ACT;
                const ts = new Date(log.created_at);
                const diffMs = Date.now() - ts.getTime();
                const diffM  = Math.floor(diffMs / 60_000);
                const diffH  = Math.floor(diffMs / 3_600_000);
                const timeLabel = diffM < 2 ? "just now" : diffM < 60 ? `${diffM}m ago` : diffH < 24 ? `${diffH}h ago` : ts.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
                const timeExact = ts.toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });
                return (
                  <div key={log.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 0",
                    borderTop: i === 0 ? "none" : `1px solid ${C.border}`,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      background: tile.bg, color: tile.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <tile.Ic />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontFamily: UI, color: C.text, lineHeight: 1.4 }}>
                        <strong style={{ fontWeight: 600 }}>{log.username ?? "Unknown"}</strong>
                        {" "}<span style={{ color: C.text3 }}>{log.action}</span>{" "}
                        <span style={{
                          display: "inline-flex", alignItems: "center",
                          fontSize: 11, fontWeight: 650, padding: "1px 7px", borderRadius: 20,
                          color: tile.color, background: tile.bg,
                        }}>
                          {log.action_type}
                        </span>
                      </span>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 11.5, fontFamily: MONO, color: C.text3, lineHeight: 1.3 }}>{timeExact}</div>
                      <div style={{ fontSize: 9.5, fontFamily: MONO, textTransform: "uppercase", letterSpacing: ".10em", color: C.textFaint, marginTop: 1 }}>{timeLabel}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
}
