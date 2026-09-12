import { useEffect, useState } from "react";
import {
  ActivityLog,
  ActionType,
  AdminUser,
  getActivityLogs,
  getAdminUsers,
} from "@/lib/adminApi";

const C = {
  bg:          "#0B0818",
  surface:     "#161029",
  surface2:    "#1F1840",
  ink:         "#F4F2FF",
  ink2:        "#E3DFFA",
  ink3:        "#B7B0D6",
  muted:       "#8A84A8",
  hair:        "rgba(255,255,255,0.08)",
  accent:      "#8B7CFF",
  accentTint:  "rgba(139,124,255,0.10)",
  positive:    "#34D399",
  positiveTint:"rgba(52,211,153,0.10)",
  warning:     "#FBBF24",
  info:        "#60A5FA",
  danger:      "#FB7185",
  dangerTint:  "rgba(251,113,133,0.10)",
};
const SANS = "'Geist', ui-sans-serif, -apple-system, sans-serif";
const MONO = "'Geist Mono', ui-monospace, monospace";

const ACTION_COLORS: Record<ActionType, string> = {
  login: "#34D399",
  logout: "#8A84A8",
  create: "#60A5FA",
  edit: "#FBBF24",
  delete: "#FB7185",
  download: "#A78BFA",
  upload: "#0D9488",
};

const ACTION_TYPES: ActionType[] = ["login", "logout", "create", "edit", "delete", "download", "upload"];
const DEPTS = ["admin", "tech", "consulting", "travel"];

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 7,
  border: `1.5px solid ${C.hair}`,
  background: C.surface,
  fontSize: 13,
  color: C.ink,
  outline: "none",
};

function Pill({ text, color }: { text: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 9px",
        borderRadius: 100,
        fontSize: 10,
        fontFamily: "'Geist Mono', ui-monospace, monospace",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        border: `1px solid ${color}`,
        color,
      }}
    >
      {text}
    </span>
  );
}

const PAGE_SIZE = 50;

export default function AdminLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  // Filters
  const [filterUser, setFilterUser] = useState("");
  const [filterType, setFilterType] = useState<ActionType | "">("");
  const [filterDept, setFilterDept] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const load = () => {
    setLoading(true);
    setPage(1);
    getActivityLogs({
      userId: filterUser || undefined,
      actionType: (filterType || undefined) as ActionType | undefined,
      department: filterDept || undefined,
      from: filterFrom || undefined,
      to: filterTo ? filterTo + "T23:59:59Z" : undefined,
    })
      .then(setLogs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getAdminUsers().then(setUsers).catch(() => {});
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const paginated = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(logs.length / PAGE_SIZE);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Geist', ui-sans-serif, -apple-system, sans-serif", fontWeight: 600, fontSize: 28, color: C.ink, margin: 0 }}>
          Activity Logs
        </h1>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
          {logs.length} entries — showing {PAGE_SIZE} per page
        </p>
      </div>

      {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.10)", border: "1px solid #f5c6c2", color: "#FB7185", fontSize: 13, marginBottom: 12 }}>{error}</div>}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} style={inputStyle}>
          <option value="">All Users</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as ActionType | "")} style={inputStyle}>
          <option value="">All Actions</option>
          {ACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={inputStyle}>
          <option value="">All Depts</option>
          {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: C.muted }}>From</span>
          <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: C.muted }}>To</span>
          <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} style={inputStyle} />
        </div>
        <button
          onClick={load}
          style={{ padding: "8px 18px", borderRadius: 7, border: "none", background: "linear-gradient(135deg, #8B7CFF, #4F46E5)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          Filter
        </button>
        <button
          onClick={() => {
            setFilterUser(""); setFilterType(""); setFilterDept(""); setFilterFrom(""); setFilterTo("");
            setTimeout(load, 50);
          }}
          style={{ padding: "8px 14px", borderRadius: 7, border: `1px solid ${C.hair}`, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer" }}
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div style={{ background: C.surface2, borderRadius: 12, border: `1px solid ${C.hair}`, overflow: "hidden", overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 720, borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["Timestamp", "User", "Action", "Type", "Department", "IP"].map((h) => (
                <th key={h} style={{ padding: "10px 16px", fontWeight: 600, color: C.muted, fontSize: 11, fontFamily: "'Geist Mono', ui-monospace, monospace", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${C.hair}`, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 20, color: C.muted, textAlign: "center" }}>Loading…</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 20, color: C.muted, textAlign: "center" }}>No logs found.</td></tr>
            ) : (
              paginated.map((log, i) => (
                <tr key={log.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.hair}`, background: i % 2 === 0 ? "transparent" : "rgba(207,200,185,0.15)" }}>
                  <td style={{ padding: "10px 16px", fontSize: 11, fontFamily: "'Geist Mono', ui-monospace, monospace", color: C.muted, whiteSpace: "nowrap" }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 16px", fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>{log.username ?? "—"}</td>
                  <td style={{ padding: "10px 16px", color: C.ink, whiteSpace: "nowrap" }}>{log.action}</td>
                  <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                    <Pill text={log.action_type} color={ACTION_COLORS[log.action_type] ?? C.muted} />
                  </td>
                  <td style={{ padding: "10px 16px", color: C.muted, whiteSpace: "nowrap" }}>{log.department ?? "—"}</td>
                  <td style={{ padding: "10px 16px", fontSize: 11, fontFamily: "'Geist Mono', ui-monospace, monospace", color: C.muted }}>{log.ip_address ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.hair}`, background: "transparent", color: page === 1 ? C.muted : C.ink, cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 13 }}
          >
            ←
          </button>
          <span style={{ fontSize: 13, color: C.muted }}>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.hair}`, background: "transparent", color: page === totalPages ? C.muted : C.ink, cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: 13 }}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
