import { useEffect, useState } from "react";
import {
  Announcement, AnnouncementLevel,
  getAnnouncements, createAnnouncement, toggleAnnouncement, deleteAnnouncement,
} from "@/lib/adminApi";
import { logActivity } from "@/lib/adminApi";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const C = {
  bg:          "#EEF0F7",
  surface:     "#FFFFFF",
  surface2:    "#F5F6FF",
  ink:         "#16213E",
  ink2:        "#2C3E62",
  ink3:        "#4A5578",
  muted:       "#8892A4",
  hair:        "rgba(0,0,0,0.07)",
  accent:      "#6C5CE7",
  accentTint:  "#EDE9FE",
  positive:    "#10B981",
  positiveTint:"#D1FAE5",
  warning:     "#F59E0B",
  info:        "#3B82F6",
  danger:      "#EF4444",
  dangerTint:  "#FEE2E2",
};
const SANS = "'Geist', ui-sans-serif, -apple-system, sans-serif";
const MONO = "'Geist Mono', ui-monospace, monospace";

const LEVEL_STYLE: Record<AnnouncementLevel, { bg: string; border: string; color: string; label: string }> = {
  info:    { bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.30)", color: "#3B82F6", label: "INFO" },
  warning: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.30)", color: "#F59E0B", label: "WARNING" },
  urgent:  { bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.30)", color: "#EF4444", label: "URGENT" },
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 7,
  border: `1.5px solid ${C.hair}`, background: C.surface,
  fontSize: 13, fontFamily: SANS, color: C.ink, outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontFamily: "'Geist Mono', ui-monospace, monospace",
  color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5,
};

export default function AdminAnnouncement() {
  const { admin } = useAdminAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [filterActive, setFilterActive] = useState<"" | "true" | "false">("");
  const [form, setForm] = useState({ content: "", level: "info" as AnnouncementLevel, expires_at: "" });

  const load = () => {
    setLoading(true);
    getAnnouncements().then(setAnnouncements).catch(e => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = announcements.filter(a => {
    if (filterActive === "true") return a.is_active;
    if (filterActive === "false") return !a.is_active;
    return true;
  });

  const activeCount = announcements.filter(a => a.is_active).length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    try {
      await createAnnouncement({
        content: form.content, level: form.level,
        expiresAt: form.expires_at || null,
        createdBy: admin?.id ?? null, createdByUsername: admin?.username ?? "admin",
      });
      logActivity(admin?.id ?? null, admin?.username ?? "admin", `Created announcement: ${form.level}`, "create", admin?.department);
      setSuccess("Announcement created."); setShowAdd(false);
      setForm({ content: "", level: "info", expires_at: "" });
      load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
  };

  const handleToggle = async (a: Announcement) => {
    try {
      await toggleAnnouncement(a.id, !a.is_active);
      logActivity(admin?.id ?? null, admin?.username ?? "admin", `${a.is_active ? "Deactivated" : "Activated"} announcement`, "edit", admin?.department);
      setSuccess(`Announcement ${a.is_active ? "deactivated" : "activated"}.`); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
  };

  const handleDelete = async (a: Announcement) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncement(a.id);
      logActivity(admin?.id ?? null, admin?.username ?? "admin", `Deleted announcement`, "delete", admin?.department);
      setSuccess("Deleted."); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Geist', ui-sans-serif, -apple-system, sans-serif", fontWeight: 600, fontSize: 28, color: C.ink, margin: 0 }}>Announcements</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{activeCount} active announcement{activeCount !== 1 ? "s" : ""} — shown at top of admin dashboard</p>
        </div>
        {admin?.role === "admin" && (
          <button onClick={() => setShowAdd(true)} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + New Announcement
          </button>
        )}
      </div>

      {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.10)", border: "1px solid #f5c6c2", color: "#EF4444", fontSize: 13, marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.10)", border: "1px solid #a9dfbf", color: "#10B981", fontSize: 13, marginBottom: 12 }}>{success}</div>}

      {/* Active preview */}
      {activeCount > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontFamily: "'Geist Mono', ui-monospace, monospace", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Live Preview</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {announcements.filter(a => a.is_active).slice(0, 3).map(a => {
              const st = LEVEL_STYLE[a.level];
              return (
                <div key={a.id} style={{ padding: "12px 16px", borderRadius: 8, background: st.bg, border: `1px solid ${st.border}`, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 10, fontFamily: "'Geist Mono', ui-monospace, monospace", fontWeight: 700, color: st.color, minWidth: 50 }}>{st.label}</span>
                  <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>{a.content}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ marginBottom: 16 }}>
        <select value={filterActive} onChange={e => setFilterActive(e.target.value as typeof filterActive)} style={{ ...inputStyle, width: 160 }}>
          <option value="">All</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          <div style={{ padding: 20, color: C.muted, textAlign: "center" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 20, color: C.muted, textAlign: "center" }}>No announcements.</div>
        ) : filtered.map(a => {
          const st = LEVEL_STYLE[a.level];
          return (
            <div key={a.id} style={{ background: C.surface2, borderRadius: 10, border: `1px solid ${C.hair}`, borderLeft: `4px solid ${st.color}`, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12, opacity: a.is_active ? 1 : 0.55 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 10, fontFamily: "'Geist Mono', ui-monospace, monospace", fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
                  {!a.is_active && <span style={{ fontSize: 10, fontFamily: "'Geist Mono', ui-monospace, monospace", color: C.muted, textTransform: "uppercase" }}>INACTIVE</span>}
                  {a.expires_at && <span style={{ fontSize: 11, color: C.muted }}>Expires: {new Date(a.expires_at).toLocaleDateString()}</span>}
                </div>
                <p style={{ fontSize: 13, color: C.ink, margin: 0 }}>{a.content}</p>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 6, fontFamily: "'Geist Mono', ui-monospace, monospace" }}>
                  {a.created_by_username ?? "system"} — {new Date(a.created_at).toLocaleDateString()}
                </p>
              </div>
              {admin?.role === "admin" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <button onClick={() => handleToggle(a)} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.hair}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer" }}>
                    {a.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => handleDelete(a)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>Delete</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div style={{ background: C.bg, borderRadius: 14, padding: "28px 28px 24px", width: "100%", maxWidth: 460, boxShadow: "0 12px 48px rgba(26,26,26,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Geist', ui-sans-serif, -apple-system, sans-serif", fontWeight: 600, fontSize: 20, color: C.ink, margin: 0 }}>New Announcement</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", fontSize: 20, color: C.muted, cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Level</label>
                <select style={inputStyle} value={form.level} onChange={e => setForm({ ...form, level: e.target.value as AnnouncementLevel })}>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Message *</label>
                <textarea required style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Announcement text shown to all admin users…" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Expires On (optional)</label>
                <input type="date" style={inputStyle} value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} />
              </div>
              {form.content && (
                <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: LEVEL_STYLE[form.level].bg, border: `1px solid ${LEVEL_STYLE[form.level].border}` }}>
                  <span style={{ fontSize: 10, fontFamily: "'Geist Mono', ui-monospace, monospace", fontWeight: 700, color: LEVEL_STYLE[form.level].color, marginRight: 8 }}>PREVIEW</span>
                  <span style={{ fontSize: 13, color: C.ink }}>{form.content}</span>
                </div>
              )}
              <button type="submit" style={{ width: "100%", padding: 11, borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Publish Announcement
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
