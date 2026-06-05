import { useEffect, useRef, useState } from "react";
import {
  Ticket, TicketStatus, TicketPriority, TicketAttachment,
  getTickets, createTicket, updateTicket, deleteTicket, uploadTicketFile,
  getClients, Client,
  logActivity,
} from "@/lib/adminApi";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

// ─── Design tokens (Fasto purple) ────────────────────────────────────────────
const C = {
  bg:          "#EEF0F7",
  surface:     "#FFFFFF",
  surface2:    "#F5F6FF",
  ink:         "#16213E",
  ink2:        "#2C3E62",
  ink3:        "#4A5578",
  muted:       "#8892A4",
  hair:        "rgba(0,0,0,0.07)",
  hair2:       "rgba(0,0,0,0.04)",
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

// ─── Colors ───────────────────────────────────────────────────────────────────
const STATUS_C: Record<TicketStatus, { fg: string; bg: string; label: string }> = {
  open:        { fg: C.info,     bg: "rgba(59,130,246,0.10)",  label: "Open" },
  in_progress: { fg: C.warning,  bg: "rgba(245,158,11,0.12)",  label: "In Progress" },
  done:        { fg: C.positive, bg: "rgba(16,185,129,0.12)",  label: "Done" },
};
const PRIORITY_C: Record<TicketPriority, { fg: string; bg: string }> = {
  low:    { fg: C.muted,    bg: C.hair2 },
  medium: { fg: C.warning,  bg: "rgba(245,158,11,0.10)" },
  high:   { fg: C.accent,   bg: C.accentTint },
  urgent: { fg: C.danger,   bg: C.dangerTint },
};
const DEPT_C: Record<string, { fg: string; bg: string }> = {
  tech:       { fg: "#3B82F6", bg: "rgba(59,130,246,0.10)"  },
  consulting: { fg: "#7C3AED", bg: "rgba(124,58,237,0.10)"  },
  travel:     { fg: "#10B981", bg: "rgba(16,185,129,0.10)"  },
  admin:      { fg: C.muted,   bg: C.hair2                  },
};

// ─── Shared styles ────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 8,
  border: `1.5px solid ${C.hair}`, background: C.surface,
  fontSize: 13, fontFamily: SANS, color: C.ink,
  outline: "none", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  display: "block", fontSize: 10.5, fontFamily: MONO,
  color: C.muted, textTransform: "uppercase",
  letterSpacing: "0.18em", fontWeight: 500, marginBottom: 5,
};

// ─── Small reusable components ────────────────────────────────────────────────
function Pill({ text, fg, bg }: { text: string; fg: string; bg: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 9px", borderRadius: 20,
      fontSize: 10, fontFamily: MONO, fontWeight: 600,
      textTransform: "uppercase", letterSpacing: "0.06em",
      background: bg, color: fg,
    }}>{text}</span>
  );
}

function IconBtn({ title, onClick, children, danger }: {
  title?: string; onClick: () => void; children: React.ReactNode; danger?: boolean;
}) {
  return (
    <button title={title} onClick={onClick} style={{
      width: 28, height: 28, borderRadius: 6, border: "none",
      background: "transparent", color: danger ? C.danger : C.muted,
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.12s", flexShrink: 0,
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = danger ? C.dangerTint : C.accentTint;
      (e.currentTarget as HTMLButtonElement).style.color = danger ? C.danger : C.accent;
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      (e.currentTarget as HTMLButtonElement).style.color = danger ? C.danger : C.muted;
    }}
    >{children}</button>
  );
}

// ─── Attachment pill ──────────────────────────────────────────────────────────
function AttachPill({ att, onRemove }: { att: TicketAttachment; onRemove: () => void }) {
  const isLink = att.type === "link";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px 4px 8px", borderRadius: 8,
      background: isLink ? "rgba(59,130,246,0.08)" : C.accentTint,
      border: `1px solid ${isLink ? "rgba(59,130,246,0.20)" : "rgba(108,92,231,0.20)"}`,
      maxWidth: "100%",
    }}>
      {isLink ? (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.info} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      )}
      <a href={att.url} target="_blank" rel="noopener noreferrer" style={{
        fontFamily: MONO, fontSize: 11,
        color: isLink ? C.info : C.accent,
        textDecoration: "none", maxWidth: 200,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{att.name}</a>
      <button onClick={onRemove} style={{
        background: "none", border: "none", cursor: "pointer",
        color: C.muted, padding: 0, display: "flex", lineHeight: 1, marginLeft: 2,
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

// ─── Client mini-card (shown inside ticket) ───────────────────────────────────
function ClientCard({ client, onClose }: { client: Client; onClose: () => void }) {
  const dept = client.department;
  const dc = dept ? DEPT_C[dept] : null;
  return (
    <div style={{
      background: C.surface2, borderRadius: 10,
      border: `1px solid ${C.hair}`, padding: "14px 16px", position: "relative",
    }}>
      <button onClick={onClose} style={{
        position: "absolute", top: 10, right: 10,
        background: "none", border: "none", cursor: "pointer", color: C.muted,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: C.accentTint,
          color: C.accent, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: SANS, fontWeight: 700, fontSize: 15, flexShrink: 0,
        }}>
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: 14, color: C.ink }}>{client.name}</p>
          <div style={{ display: "flex", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
            {dc && <Pill text={dept!} fg={dc.fg} bg={dc.bg} />}
            <Pill text={client.is_active ? "Active" : "Inactive"} fg={client.is_active ? C.positive : C.danger} bg={client.is_active ? C.positiveTint : C.dangerTint} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 14px", fontSize: 12, fontFamily: SANS }}>
        {client.contact_name  && <div><span style={{ color: C.muted }}>Contact: </span><span style={{ color: C.ink2 }}>{client.contact_name}</span></div>}
        {client.contact_email && <div><span style={{ color: C.muted }}>Email: </span><a href={`mailto:${client.contact_email}`} style={{ color: C.info }}>{client.contact_email}</a></div>}
        {client.contact_phone && <div><span style={{ color: C.muted }}>Phone: </span><span style={{ color: C.ink2 }}>{client.contact_phone}</span></div>}
        {client.nationality   && <div><span style={{ color: C.muted }}>Nationality: </span><span style={{ color: C.ink2 }}>{client.nationality}</span></div>}
        {client.id_number     && <div><span style={{ color: C.muted }}>ID #: </span><span style={{ color: C.ink2, fontFamily: MONO }}>{client.id_number}</span></div>}
        {client.date_of_birth && <div><span style={{ color: C.muted }}>DOB: </span><span style={{ color: C.ink2 }}>{client.date_of_birth}</span></div>}
        {client.city || client.country ? (
          <div style={{ gridColumn: "span 2" }}>
            <span style={{ color: C.muted }}>Location: </span>
            <span style={{ color: C.ink2 }}>{[client.city, client.country].filter(Boolean).join(", ")}</span>
          </div>
        ) : null}
        {client.notes && (
          <div style={{ gridColumn: "span 2" }}>
            <span style={{ color: C.muted }}>Notes: </span>
            <span style={{ color: C.ink2 }}>{client.notes}</span>
          </div>
        )}
      </div>

      {/* Documents */}
      {(client.passport_url || client.id_doc_url || client.extra_docs.length > 0) && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.hair}` }}>
          <p style={{ ...lbl, marginBottom: 6 }}>Documents</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {client.passport_url && (
              <a href={client.passport_url} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
                borderRadius: 6, background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.20)",
                fontFamily: MONO, fontSize: 11, color: C.info, textDecoration: "none",
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                {client.passport_name ?? "Passport"}
              </a>
            )}
            {client.id_doc_url && (
              <a href={client.id_doc_url} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
                borderRadius: 6, background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.20)",
                fontFamily: MONO, fontSize: 11, color: C.info, textDecoration: "none",
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                {client.id_doc_name ?? "ID Document"}
              </a>
            )}
            {client.extra_docs.map((d, i) => (
              <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
                borderRadius: 6, background: C.accentTint,
                border: "1px solid rgba(108,92,231,0.20)",
                fontFamily: MONO, fontSize: 11, color: C.accent, textDecoration: "none",
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                {d.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminTickets() {
  const { admin } = useAdminAuth();

  const [tickets,  setTickets]  = useState<Ticket[]>([]);
  const [clients,  setClients]  = useState<Client[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [err,      setErr]      = useState("");

  // filters
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "">("");
  const [filterDept,   setFilterDept]   = useState("");

  // expanded ticket
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // new ticket form
  const [showNew,    setShowNew]    = useState(false);
  const [newForm, setNewForm] = useState({
    clientId: "", title: "", description: "",
    priority: "medium" as TicketPriority, department: "",
  });
  const [newErr,   setNewErr]   = useState("");
  const [newSaving,setNewSaving]= useState(false);

  // attachment add (for expanded ticket)
  const [addingLink,    setAddingLink]    = useState<string | null>(null); // ticketId
  const [linkName,      setLinkName]      = useState("");
  const [linkUrl,       setLinkUrl]       = useState("");
  const [uploadingFile, setUploadingFile] = useState<string | null>(null); // ticketId
  const fileRef = useRef<HTMLInputElement>(null);

  // client card (inside ticket expand)
  const [viewClientId, setViewClientId] = useState<string | null>(null);

  // inline notes/description editing
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesVal,     setNotesVal]     = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      getTickets({
        status:     filterStatus || undefined,
        department: filterDept   || undefined,
      }),
      getClients(),
    ])
      .then(([t, c]) => { setTickets(t); setClients(c); })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus, filterDept]); // eslint-disable-line

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));

  // ── Create ticket ────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.title.trim()) { setNewErr("Title is required"); return; }
    setNewSaving(true); setNewErr("");
    try {
      const selectedClient = clients.find((c) => c.id === newForm.clientId);
      await createTicket({
        clientId:          newForm.clientId   || null,
        clientName:        selectedClient?.name ?? (newForm.clientId ? "" : null),
        title:             newForm.title.trim(),
        description:       newForm.description.trim() || undefined,
        priority:          newForm.priority,
        department:        newForm.department || null,
        createdBy:         admin?.id ?? null,
        createdByUsername: admin?.username ?? "admin",
      });
      logActivity(admin?.id ?? null, admin?.username ?? "admin", `Created ticket: ${newForm.title}`, "create");
      setShowNew(false);
      setNewForm({ clientId: "", title: "", description: "", priority: "medium", department: "" });
      load();
    } catch (e: unknown) { setNewErr(e instanceof Error ? e.message : "Failed"); }
    finally { setNewSaving(false); }
  };

  // ── Status cycle ────────────────────────────────────────────────────────
  const cycleStatus = async (ticket: Ticket) => {
    const next: Record<TicketStatus, TicketStatus> = {
      open: "in_progress", in_progress: "done", done: "open",
    };
    await updateTicket(ticket.id, { status: next[ticket.status] });
    load();
  };

  // ── Add link attachment ───────────────────────────────────────────────────
  const handleAddLink = async (ticket: Ticket) => {
    if (!linkName.trim() || !linkUrl.trim()) return;
    const att: TicketAttachment = {
      type: "link", name: linkName.trim(),
      url: linkUrl.startsWith("http") ? linkUrl.trim() : `https://${linkUrl.trim()}`,
      uploaded_at: new Date().toISOString(),
    };
    await updateTicket(ticket.id, { attachments: [...ticket.attachments, att] });
    setLinkName(""); setLinkUrl(""); setAddingLink(null);
    load();
  };

  // ── Upload file attachment ────────────────────────────────────────────────
  const handleUploadFile = async (ticket: Ticket, file: File) => {
    setUploadingFile(ticket.id);
    try {
      const url = await uploadTicketFile(ticket.id, file);
      const att: TicketAttachment = {
        type: "file", name: file.name, url,
        uploaded_at: new Date().toISOString(),
      };
      await updateTicket(ticket.id, { attachments: [...ticket.attachments, att] });
      logActivity(admin?.id ?? null, admin?.username ?? "admin", `Uploaded file to ticket: ${ticket.title}`, "upload");
      load();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Upload failed"); }
    finally { setUploadingFile(null); }
  };

  // ── Remove attachment ─────────────────────────────────────────────────────
  const handleRemoveAtt = async (ticket: Ticket, idx: number) => {
    const atts = ticket.attachments.filter((_, i) => i !== idx);
    await updateTicket(ticket.id, { attachments: atts });
    load();
  };

  // ── Save notes ────────────────────────────────────────────────────────────
  const handleSaveNotes = async (ticketId: string) => {
    await updateTicket(ticketId, { notes: notesVal });
    setEditingNotes(null);
    load();
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (ticket: Ticket) => {
    if (!window.confirm(`Delete ticket "${ticket.title}"? This cannot be undone.`)) return;
    await deleteTicket(ticket.id);
    logActivity(admin?.id ?? null, admin?.username ?? "admin", `Deleted ticket: ${ticket.title}`, "delete");
    if (expandedId === ticket.id) setExpandedId(null);
    load();
  };

  const viewingClient = viewClientId ? clientMap[viewClientId] : null;

  return (
    <div style={{ fontFamily: SANS, color: C.ink, maxWidth: 900 }}>

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: "-0.03em", color: C.ink, margin: 0 }}>Tickets</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
            {filterStatus ? ` · ${STATUS_C[filterStatus].label}` : ""}
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          style={{
            padding: "9px 18px", borderRadius: 8, border: "none",
            background: C.accent, color: "#fff",
            fontFamily: SANS, fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
          onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = "#4A3DB5"}
          onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = C.accent}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Ticket
        </button>
      </div>

      {err && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: C.dangerTint, color: C.danger, fontSize: 13, fontFamily: SANS, marginBottom: 16 }}>
          {err}
        </div>
      )}

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        {/* Status segmented */}
        <div style={{ display: "flex", background: C.surface, borderRadius: 8, padding: 3, gap: 2, border: `1px solid ${C.hair}` }}>
          {(["", "open", "in_progress", "done"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              style={{
                padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                fontFamily: SANS, fontSize: 12, fontWeight: 500,
                background: filterStatus === s ? C.accent : "transparent",
                color: filterStatus === s ? "#fff" : C.muted,
                transition: "all 0.12s",
              }}
            >
              {s === "" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Dept filter */}
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
          style={{ ...inp, width: "auto", padding: "6px 10px", fontSize: 12 }}>
          <option value="">All depts</option>
          {["tech", "consulting", "travel", "admin"].map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* ── New Ticket Modal ─────────────────────────────────────────── */}
      {showNew && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(22,33,62,0.5)",
          zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }} onClick={() => setShowNew(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: C.surface, borderRadius: 16, padding: 28,
            width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          }}>
            <h2 style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, color: C.ink, margin: "0 0 20px" }}>New Ticket</h2>
            {newErr && <p style={{ color: C.danger, fontSize: 12, fontFamily: SANS, marginBottom: 12 }}>{newErr}</p>}
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Title *</label>
                <input style={inp} value={newForm.title} onChange={(e) => setNewForm({ ...newForm, title: e.target.value })} placeholder="What needs to be done?" autoFocus required />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Client</label>
                <select style={inp} value={newForm.clientId} onChange={(e) => setNewForm({ ...newForm, clientId: e.target.value })}>
                  <option value="">— No client —</option>
                  {clients.filter((c) => c.is_active).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.department ? ` (${c.department})` : ""}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Description</label>
                <textarea style={{ ...inp, height: 72, resize: "vertical" }} value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })} placeholder="Optional details…" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                <div>
                  <label style={lbl}>Priority</label>
                  <select style={inp} value={newForm.priority} onChange={(e) => setNewForm({ ...newForm, priority: e.target.value as TicketPriority })}>
                    {(["low", "medium", "high", "urgent"] as TicketPriority[]).map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Department</label>
                  <select style={inp} value={newForm.department} onChange={(e) => setNewForm({ ...newForm, department: e.target.value })}>
                    <option value="">Any</option>
                    {["tech", "consulting", "travel", "admin"].map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowNew(false)} style={{
                  padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.hair}`,
                  background: "transparent", color: C.ink3, fontFamily: SANS, fontSize: 13, cursor: "pointer",
                }}>Cancel</button>
                <button type="submit" disabled={newSaving} style={{
                  padding: "8px 20px", borderRadius: 8, border: "none",
                  background: newSaving ? C.muted : C.accent, color: "#fff",
                  fontFamily: SANS, fontSize: 13, fontWeight: 600,
                  cursor: newSaving ? "default" : "pointer",
                }}>
                  {newSaving ? "Creating…" : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Ticket list ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {loading ? (
          <p style={{ padding: 20, color: C.muted, fontSize: 13, textAlign: "center" }}>Loading…</p>
        ) : tickets.length === 0 ? (
          <div style={{ background: C.surface, borderRadius: 12, padding: "40px 20px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 6 }}>No tickets yet</p>
            <p style={{ fontSize: 13, color: C.muted }}>Click "+ New Ticket" to create the first one.</p>
          </div>
        ) : tickets.map((ticket) => {
          const isExpanded = expandedId === ticket.id;
          const sc = STATUS_C[ticket.status];
          const pc = PRIORITY_C[ticket.priority];
          const client = ticket.client_id ? clientMap[ticket.client_id] : null;
          const dc = ticket.department ? DEPT_C[ticket.department] : null;

          return (
            <div key={ticket.id} style={{
              background: C.surface, borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              border: `1px solid ${isExpanded ? C.accent : C.hair}`,
              transition: "border-color 0.15s",
              overflow: "hidden",
            }}>
              {/* ── Ticket row ── */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
                {/* Status toggle button */}
                <button
                  onClick={() => cycleStatus(ticket)}
                  title="Click to advance status"
                  style={{
                    width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                    border: `2px solid ${sc.fg}`,
                    background: ticket.status === "done" ? sc.fg : "transparent",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                >
                  {ticket.status === "done" && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{
                      fontFamily: SANS, fontWeight: 600, fontSize: 14, color: ticket.status === "done" ? C.muted : C.ink,
                      textDecoration: ticket.status === "done" ? "line-through" : "none",
                    }}>{ticket.title}</span>
                    <Pill text={ticket.status.replace("_", " ")} fg={sc.fg} bg={sc.bg} />
                    <Pill text={ticket.priority} fg={pc.fg} bg={pc.bg} />
                    {dc && <Pill text={ticket.department!} fg={dc.fg} bg={dc.bg} />}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 3, flexWrap: "wrap" }}>
                    {ticket.client_name && (
                      <button
                        onClick={() => setViewClientId(isExpanded && viewClientId === ticket.client_id ? null : ticket.client_id)}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: SANS, fontSize: 12, color: C.info, fontWeight: 500 }}
                      >
                        {ticket.client_name}
                      </button>
                    )}
                    {ticket.attachments.length > 0 && (
                      <span style={{ fontSize: 12, fontFamily: SANS, color: C.muted }}>
                        {ticket.attachments.length} attachment{ticket.attachments.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    <span style={{ fontSize: 11, fontFamily: MONO, color: C.muted }}>
                      {new Date(ticket.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  <IconBtn title="Expand" onClick={() => {
                    setExpandedId(isExpanded ? null : ticket.id);
                    setViewClientId(null);
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </IconBtn>
                  <IconBtn title="Delete ticket" onClick={() => handleDelete(ticket)} danger>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </IconBtn>
                </div>
              </div>

              {/* ── Expanded panel ── */}
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${C.hair}`, padding: "16px 16px 18px", background: C.surface2 }}>

                  {/* Client card */}
                  {viewingClient && viewClientId === ticket.client_id && (
                    <div style={{ marginBottom: 14 }}>
                      <ClientCard client={viewingClient} onClose={() => setViewClientId(null)} />
                    </div>
                  )}
                  {ticket.client_name && !viewingClient && (
                    <button
                      onClick={() => setViewClientId(ticket.client_id)}
                      style={{
                        marginBottom: 12, padding: "6px 12px", borderRadius: 7,
                        border: `1px solid ${C.hair}`, background: C.surface,
                        color: C.info, fontFamily: SANS, fontSize: 12, fontWeight: 500, cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: 5,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      View {ticket.client_name}&apos;s Profile
                    </button>
                  )}

                  {/* Description */}
                  {ticket.description && (
                    <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink2, lineHeight: 1.6, marginBottom: 14 }}>
                      {ticket.description}
                    </p>
                  )}

                  {/* Notes */}
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ ...lbl, marginBottom: 6 }}>Notes</p>
                    {editingNotes === ticket.id ? (
                      <div>
                        <textarea
                          value={notesVal}
                          onChange={(e) => setNotesVal(e.target.value)}
                          rows={3}
                          style={{ ...inp, resize: "vertical", marginBottom: 6 }}
                          autoFocus
                        />
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => handleSaveNotes(ticket.id)} style={{
                            padding: "5px 14px", borderRadius: 7, border: "none",
                            background: C.accent, color: "#fff",
                            fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: "pointer",
                          }}>Save</button>
                          <button onClick={() => setEditingNotes(null)} style={{
                            padding: "5px 12px", borderRadius: 7, border: `1px solid ${C.hair}`,
                            background: "transparent", color: C.ink3, fontFamily: SANS, fontSize: 12, cursor: "pointer",
                          }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => { setEditingNotes(ticket.id); setNotesVal(ticket.notes ?? ""); }}
                        style={{
                          minHeight: 36, padding: "8px 12px", borderRadius: 8,
                          border: `1.5px dashed ${C.hair}`, cursor: "text",
                          fontFamily: SANS, fontSize: 13,
                          color: ticket.notes ? C.ink2 : C.muted,
                        }}
                      >
                        {ticket.notes || "Click to add notes…"}
                      </div>
                    )}
                  </div>

                  {/* Attachments */}
                  <div>
                    <p style={{ ...lbl, marginBottom: 8 }}>Attachments ({ticket.attachments.length})</p>
                    {ticket.attachments.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                        {ticket.attachments.map((att, idx) => (
                          <AttachPill key={idx} att={att} onRemove={() => handleRemoveAtt(ticket, idx)} />
                        ))}
                      </div>
                    )}

                    {/* Add link form */}
                    {addingLink === ticket.id ? (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8, alignItems: "flex-end" }}>
                        <input style={{ ...inp, flex: 1, minWidth: 120 }} placeholder="Label (e.g. Drive folder)" value={linkName} onChange={(e) => setLinkName(e.target.value)} autoFocus />
                        <input style={{ ...inp, flex: 2, minWidth: 180 }} placeholder="https://…" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleAddLink(ticket); }} />
                        <button onClick={() => handleAddLink(ticket)} style={{
                          padding: "8px 14px", borderRadius: 8, border: "none",
                          background: C.accent, color: "#fff", fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                        }}>Add Link</button>
                        <button onClick={() => { setAddingLink(null); setLinkName(""); setLinkUrl(""); }} style={{
                          padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.hair}`,
                          background: "transparent", color: C.ink3, fontFamily: SANS, fontSize: 12, cursor: "pointer",
                        }}>Cancel</button>
                      </div>
                    ) : null}

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        onClick={() => { setAddingLink(ticket.id); setLinkName(""); setLinkUrl(""); }}
                        style={{
                          padding: "6px 12px", borderRadius: 7,
                          border: `1px solid ${C.hair}`, background: C.surface,
                          color: C.ink3, fontFamily: SANS, fontSize: 12, cursor: "pointer",
                          display: "inline-flex", alignItems: "center", gap: 5,
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        Add Link
                      </button>
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploadingFile === ticket.id}
                        style={{
                          padding: "6px 12px", borderRadius: 7,
                          border: `1px solid ${C.hair}`, background: C.surface,
                          color: C.ink3, fontFamily: SANS, fontSize: 12, cursor: uploadingFile === ticket.id ? "default" : "pointer",
                          display: "inline-flex", alignItems: "center", gap: 5,
                          opacity: uploadingFile === ticket.id ? 0.6 : 1,
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        {uploadingFile === ticket.id ? "Uploading…" : "Upload File"}
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) { handleUploadFile(ticket, f); e.target.value = ""; }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
