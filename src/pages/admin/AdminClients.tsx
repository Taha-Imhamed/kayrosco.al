import { useEffect, useRef, useState } from "react";
import {
  Client, ClientDoc,
  getClients, createClient, updateClient, deleteClient,
  uploadClientDoc, deleteClientDoc,
  logActivity,
} from "@/lib/adminApi";
import {
  addClientPortalMessage,
  createClientPortalAccount,
  getClientPortalAccountByClientId,
  getClientPortalMessages,
  resetClientPortalPassword,
  setClientPortalAccountActive,
} from "@/lib/clientPortalStore";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const C = {
  bg:           "#EEF0F7",
  surface:      "#FFFFFF",
  surface2:     "#F5F6FF",
  ink:          "#16213E",
  ink2:         "#2C3E62",
  ink3:         "#4A5578",
  muted:        "#8892A4",
  hair:         "rgba(0,0,0,0.07)",
  accent:       "#6C5CE7",
  accentTint:   "#EDE9FE",
  positive:     "#10B981",
  positiveTint: "#D1FAE5",
  warning:      "#F59E0B",
  info:         "#3B82F6",
  danger:       "#EF4444",
  dangerTint:   "#FEE2E2",
};
const SANS = "'Geist', ui-sans-serif, -apple-system, sans-serif";
const MONO = "'Geist Mono', ui-monospace, monospace";

const DEPT_COLOR: Record<string, string> = {
  tech:       C.info,
  consulting: "#7C3AED",
  travel:     C.positive,
};

const DEPTS = ["tech", "consulting", "travel"] as const;
type Dept = typeof DEPTS[number];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 7,
  border: `1.5px solid ${C.hair}`, background: C.surface,
  fontSize: 13, fontFamily: SANS, color: C.ink, outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontFamily: MONO,
  color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5,
};

function DeptPill({ dept }: { dept: string | null }) {
  if (!dept) return <span style={{ color: C.muted, fontSize: 12 }}>—</span>;
  const color = DEPT_COLOR[dept] ?? C.muted;
  return (
    <span style={{
      padding: "2px 9px", borderRadius: 100, fontSize: 10, fontFamily: MONO,
      fontWeight: 600, border: `1px solid ${color}`, color,
    }}>
      {dept}
    </span>
  );
}

function DocLink({ name, url }: { name: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 100, fontSize: 11, fontFamily: MONO,
      fontWeight: 500, background: C.accentTint, color: C.accent,
      textDecoration: "none", border: `1px solid ${C.accent}30`,
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      {name}
    </a>
  );
}

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: C.bg, borderRadius: 14, padding: "28px 28px 24px",
        width: "100%", maxWidth: wide ? 640 : 440,
        boxShadow: "0 12px 48px rgba(26,26,26,0.18)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, color: C.ink, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, color: C.muted, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: MONO, fontSize: 10, color: C.muted, textTransform: "uppercase",
      letterSpacing: "0.12em", marginBottom: 10, marginTop: 20, fontWeight: 600,
      borderBottom: `1px solid ${C.hair}`, paddingBottom: 6,
    }}>
      {children}
    </p>
  );
}

export default function AdminClients() {
  const { admin } = useAdminAuth();
  const [clients, setClients]   = useState<Client[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [search, setSearch]     = useState("");
  const [filterDept, setFilterDept] = useState<Dept | "">("");

  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "", contactName: "", contactEmail: "", contactPhone: "",
    department: "" as Dept | "",
    notes: "", idNumber: "", nationality: "", dateOfBirth: "",
    address: "", city: "", country: "",
  });
  const [creating, setCreating] = useState(false);

  const [editClient, setEditClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({
    name: "", contactName: "", contactEmail: "", contactPhone: "",
    department: "" as Dept | "",
    notes: "", idNumber: "", nationality: "", dateOfBirth: "",
    address: "", city: "", country: "", is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const passportRef   = useRef<HTMLInputElement>(null);
  const idDocRef      = useRef<HTMLInputElement>(null);
  const extraDocRef   = useRef<HTMLInputElement>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [portalInfo, setPortalInfo] = useState<{ username: string; password: string; created: boolean } | null>(null);
  const [portalMessage, setPortalMessage] = useState("");

  const load = () => {
    setLoading(true);
    getClients(filterDept ? { department: filterDept } : undefined)
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filterDept]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    setPortalInfo(null);
    setPortalMessage("");
  }, [viewClient?.id]);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) ||
      (c.contact_name ?? "").toLowerCase().includes(q) ||
      (c.contact_email ?? "").toLowerCase().includes(q);
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setCreating(true);
    try {
      await createClient({
        name: form.name, contactName: form.contactName || undefined,
        contactEmail: form.contactEmail || undefined, contactPhone: form.contactPhone || undefined,
        department: (form.department as Dept) || null, notes: form.notes || undefined,
        idNumber: form.idNumber || undefined, nationality: form.nationality || undefined,
        dateOfBirth: form.dateOfBirth || undefined, address: form.address || undefined,
        city: form.city || undefined, country: form.country || undefined,
        createdBy: admin?.id ?? null, createdByUsername: admin?.username ?? "admin",
      });
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Created client: ${form.name}`, "create", admin?.department);
      setSuccess(`Client "${form.name}" created.`); setShowCreate(false);
      setForm({ name: "", contactName: "", contactEmail: "", contactPhone: "", department: "", notes: "", idNumber: "", nationality: "", dateOfBirth: "", address: "", city: "", country: "" });
      load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
    finally { setCreating(false); }
  };

  const openEdit = (c: Client) => {
    setEditClient(c);
    setEditForm({
      name: c.name, contactName: c.contact_name ?? "", contactEmail: c.contact_email ?? "",
      contactPhone: c.contact_phone ?? "", department: (c.department ?? "") as Dept | "",
      notes: c.notes ?? "", idNumber: c.id_number ?? "", nationality: c.nationality ?? "",
      dateOfBirth: c.date_of_birth ?? "", address: c.address ?? "",
      city: c.city ?? "", country: c.country ?? "", is_active: c.is_active,
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClient) return;
    setError(""); setSaving(true);
    try {
      await updateClient(editClient.id, {
        name: editForm.name, contact_name: editForm.contactName || null,
        contact_email: editForm.contactEmail || null, contact_phone: editForm.contactPhone || null,
        department: (editForm.department as Dept) || null, notes: editForm.notes || null,
        id_number: editForm.idNumber || null, nationality: editForm.nationality || null,
        date_of_birth: editForm.dateOfBirth || null, address: editForm.address || null,
        city: editForm.city || null, country: editForm.country || null, is_active: editForm.is_active,
      });
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Edited client: ${editClient.name}`, "edit", admin?.department);
      setSuccess(`Client "${editForm.name}" updated.`); setEditClient(null); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c: Client) => {
    if (!confirm(`Delete client "${c.name}"? This cannot be undone.`)) return;
    try {
      await deleteClient(c.id);
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Deleted client: ${c.name}`, "delete", admin?.department);
      setSuccess("Deleted."); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
  };

  const handleUpload = async (client: Client, file: File, slot: "passport" | "id_doc" | `extra_${number}`) => {
    setUploadingDoc(true); setError("");
    try {
      const url = await uploadClientDoc(client.id, file, slot);
      if (slot === "passport") {
        await updateClient(client.id, { passport_url: url, passport_name: file.name });
      } else if (slot === "id_doc") {
        await updateClient(client.id, { id_doc_url: url, id_doc_name: file.name });
      } else {
        await updateClient(client.id, {
          extra_docs: [...(client.extra_docs ?? []), { name: file.name, url, uploaded_at: new Date().toISOString() }],
        });
      }
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Uploaded doc for client: ${client.name}`, "edit", admin?.department);
      setSuccess("Document uploaded.");
      const fresh = await getClients();
      const found = fresh.find((x) => x.id === client.id);
      if (found) setViewClient(found);
      load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Upload failed."); }
    finally { setUploadingDoc(false); }
  };

  const handleRemoveDoc = async (client: Client, doc: ClientDoc) => {
    if (!confirm(`Remove document "${doc.name}"?`)) return;
    setError("");
    try {
      await deleteClientDoc(doc.url);
      await updateClient(client.id, { extra_docs: client.extra_docs.filter((d) => d.url !== doc.url) });
      setSuccess("Document removed.");
      const fresh = await getClients();
      const found = fresh.find((x) => x.id === client.id);
      if (found) setViewClient(found);
      load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
  };

  const refreshViewClient = async (clientId: string) => {
    const fresh = await getClients();
    const found = fresh.find((entry) => entry.id === clientId) ?? null;
    if (found) setViewClient(found);
    load();
  };

  const handleCreatePortalAccount = async (client: Client) => {
    setError("");
    try {
      const { account, password, created } = createClientPortalAccount(client);
      setPortalInfo({ username: account.username, password, created });
      setSuccess(created ? `Portal account created for ${client.name}.` : `Portal account already exists for ${client.name}.`);
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `${created ? "Created" : "Viewed"} client portal account: ${client.name}`, "edit", admin?.department);
      await refreshViewClient(client.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create client account.");
    }
  };

  const handleResetPortalPassword = async (client: Client) => {
    setError("");
    try {
      const { account, password } = resetClientPortalPassword(client);
      if (!account) throw new Error("Portal account not found.");
      setPortalInfo({ username: account.username, password, created: false });
      setSuccess(`Password reset for ${client.name}.`);
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Reset client portal password: ${client.name}`, "edit", admin?.department);
      await refreshViewClient(client.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    }
  };

  const handleTogglePortalAccess = async (client: Client, nextActive: boolean) => {
    setError("");
    try {
      setClientPortalAccountActive(client.id, nextActive);
      setSuccess(`Portal access ${nextActive ? "enabled" : "disabled"} for ${client.name}.`);
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `${nextActive ? "Activated" : "Deactivated"} client portal account: ${client.name}`, "edit", admin?.department);
      await refreshViewClient(client.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update portal access.");
    }
  };

  const handleSendPortalMessage = async (client: Client) => {
    if (!portalMessage.trim()) return;
    setError("");
    try {
      addClientPortalMessage({
        clientId: client.id,
        senderType: "admin",
        senderName: admin?.username ?? "Admin",
        body: portalMessage,
      });
      setPortalMessage("");
      setSuccess(`Message sent to ${client.name}.`);
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Sent portal message to client: ${client.name}`, "edit", admin?.department);
      await refreshViewClient(client.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.ink, margin: 0 }}>Clients</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{clients.filter((c) => c.is_active).length} active clients</p>
        </div>
        {admin?.role === "admin" && (
          <button onClick={() => setShowCreate(true)} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + New Client
          </button>
        )}
      </div>

      {error   && <div style={{ padding: "10px 14px", borderRadius: 8, background: C.dangerTint, border: "1px solid #f5c6c2", color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.10)", border: "1px solid #a9dfbf", color: C.positive, fontSize: 13, marginBottom: 12 }}>{success}</div>}

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input type="text" placeholder="Search name, contact, email…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: 300 }} />
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value as Dept | "")} style={{ ...inputStyle, width: 160 }}>
          <option value="">All Departments</option>
          {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div style={{ background: C.surface2, borderRadius: 12, border: `1px solid ${C.hair}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["Name", "Contact", "Email", "Phone", "Dept", "Status", ""].map((h) => (
                <th key={h} style={{ padding: "10px 16px", fontWeight: 600, color: C.muted, fontSize: 11, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${C.hair}`, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 20, color: C.muted, textAlign: "center" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 20, color: C.muted, textAlign: "center" }}>No clients found.</td></tr>
            ) : filtered.map((c, i) => (
              <tr key={c.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.hair}`, background: i % 2 === 0 ? "transparent" : "rgba(207,200,185,0.08)" }}>
                <td style={{ padding: "11px 16px" }}>
                  <button onClick={() => setViewClient(c)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <span style={{ fontWeight: 600, color: C.ink, fontSize: 13, fontFamily: SANS }}>{c.name}</span>
                  </button>
                </td>
                <td style={{ padding: "11px 16px", color: C.muted }}>{c.contact_name ?? "—"}</td>
                <td style={{ padding: "11px 16px", color: C.muted, fontSize: 12, fontFamily: MONO }}>{c.contact_email ?? "—"}</td>
                <td style={{ padding: "11px 16px", color: C.muted, fontSize: 12, fontFamily: MONO }}>{c.contact_phone ?? "—"}</td>
                <td style={{ padding: "11px 16px" }}><DeptPill dept={c.department} /></td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{ padding: "2px 9px", borderRadius: 100, fontSize: 10, fontFamily: MONO, fontWeight: 600, border: `1px solid ${c.is_active ? C.positive : C.muted}`, color: c.is_active ? C.positive : C.muted }}>
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                  <button onClick={() => setViewClient(c)} style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 12, textDecoration: "underline", marginRight: 8, fontFamily: SANS }}>View</button>
                  {admin?.role === "admin" && (
                    <>
                      <button onClick={() => openEdit(c)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, textDecoration: "underline", marginRight: 8, fontFamily: SANS }}>Edit</button>
                      <button onClick={() => handleDelete(c)} style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 12, textDecoration: "underline", fontFamily: SANS }}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── View Modal ── */}
      {viewClient && (
        <Modal title={viewClient.name} onClose={() => setViewClient(null)} wide>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <DeptPill dept={viewClient.department} />
            <span style={{ padding: "2px 9px", borderRadius: 100, fontSize: 10, fontFamily: MONO, fontWeight: 600, border: `1px solid ${viewClient.is_active ? C.positive : C.muted}`, color: viewClient.is_active ? C.positive : C.muted }}>
              {viewClient.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          <SectionLabel>Contact Information</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Contact Name",  value: viewClient.contact_name  },
              { label: "Email",         value: viewClient.contact_email },
              { label: "Phone",         value: viewClient.contact_phone },
              { label: "Country",       value: viewClient.country       },
              { label: "City",          value: viewClient.city          },
              { label: "Address",       value: viewClient.address       },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={labelStyle}>{label}</p>
                <p style={{ fontSize: 13, color: value ? C.ink : C.muted, margin: 0 }}>{value ?? "—"}</p>
              </div>
            ))}
          </div>

          <SectionLabel>Identity</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "ID Number",     value: viewClient.id_number     },
              { label: "Nationality",   value: viewClient.nationality   },
              { label: "Date of Birth", value: viewClient.date_of_birth },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={labelStyle}>{label}</p>
                <p style={{ fontSize: 13, color: value ? C.ink : C.muted, margin: 0, fontFamily: value ? MONO : SANS }}>{value ?? "—"}</p>
              </div>
            ))}
          </div>

          {viewClient.notes && (
            <>
              <SectionLabel>Notes</SectionLabel>
              <p style={{ fontSize: 13, color: C.ink2, lineHeight: 1.6, margin: 0 }}>{viewClient.notes}</p>
            </>
          )}

          <SectionLabel>Documents</SectionLabel>

          {/* Passport */}
          <div style={{ marginBottom: 14 }}>
            <p style={labelStyle}>Passport</p>
            {viewClient.passport_url
              ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}><DocLink name={viewClient.passport_name ?? "Passport"} url={viewClient.passport_url} />{admin?.role === "admin" && <button onClick={() => passportRef.current?.click()} style={{ background: "none", border: "none", color: C.muted, fontSize: 11, cursor: "pointer", textDecoration: "underline", fontFamily: SANS }}>Replace</button>}</div>
              : <><p style={{ fontSize: 12, color: C.muted, margin: 0 }}>No passport uploaded.</p>{admin?.role === "admin" && <button onClick={() => passportRef.current?.click()} style={{ marginTop: 6, padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.hair}`, background: C.surface2, color: C.muted, fontSize: 12, cursor: "pointer", fontFamily: SANS }}>{uploadingDoc ? "Uploading…" : "Upload Passport"}</button>}</>
            }
            {admin?.role === "admin" && <input ref={passportRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; await handleUpload(viewClient, f, "passport"); if (passportRef.current) passportRef.current.value = ""; }} />}
          </div>

          {/* ID Document */}
          <div style={{ marginBottom: 14 }}>
            <p style={labelStyle}>ID Document</p>
            {viewClient.id_doc_url
              ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}><DocLink name={viewClient.id_doc_name ?? "ID Document"} url={viewClient.id_doc_url} />{admin?.role === "admin" && <button onClick={() => idDocRef.current?.click()} style={{ background: "none", border: "none", color: C.muted, fontSize: 11, cursor: "pointer", textDecoration: "underline", fontFamily: SANS }}>Replace</button>}</div>
              : <><p style={{ fontSize: 12, color: C.muted, margin: 0 }}>No ID document uploaded.</p>{admin?.role === "admin" && <button onClick={() => idDocRef.current?.click()} style={{ marginTop: 6, padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.hair}`, background: C.surface2, color: C.muted, fontSize: 12, cursor: "pointer", fontFamily: SANS }}>{uploadingDoc ? "Uploading…" : "Upload ID"}</button>}</>
            }
            {admin?.role === "admin" && <input ref={idDocRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; await handleUpload(viewClient, f, "id_doc"); if (idDocRef.current) idDocRef.current.value = ""; }} />}
          </div>

          {/* Extra docs */}
          <div>
            <p style={labelStyle}>Extra Documents</p>
            {viewClient.extra_docs.length === 0
              ? <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>No extra documents.</p>
              : <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  {viewClient.extra_docs.map((doc) => (
                    <div key={doc.url} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <DocLink name={doc.name} url={doc.url} />
                      {admin?.role === "admin" && <button onClick={() => handleRemoveDoc(viewClient, doc)} style={{ background: "none", border: "none", color: C.danger, fontSize: 13, cursor: "pointer", fontFamily: SANS, lineHeight: 1 }}>×</button>}
                    </div>
                  ))}
                </div>
            }
            {admin?.role === "admin" && (
              <>
                <input ref={extraDocRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" style={{ display: "none" }} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; await handleUpload(viewClient, f, `extra_${Date.now()}`); if (extraDocRef.current) extraDocRef.current.value = ""; }} />
                <button onClick={() => extraDocRef.current?.click()} style={{ marginTop: 6, padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.hair}`, background: C.surface2, color: C.muted, fontSize: 12, cursor: "pointer", fontFamily: SANS }}>{uploadingDoc ? "Uploading…" : "+ Add Document"}</button>
              </>
            )}
          </div>

          <SectionLabel>Client Portal</SectionLabel>
          {!getClientPortalAccountByClientId(viewClient.id) ? (
            <div style={{ background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 12, padding: 16 }}>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: C.ink2, lineHeight: 1.6 }}>
                Create a login for this client so they can track applications, read your updates, and see the files you upload here.
              </p>
              <button onClick={() => handleCreatePortalAccount(viewClient)} style={{ padding: "9px 14px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                Create Account For Client
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div>
                    <p style={labelStyle}>Portal Username</p>
                    <p style={{ margin: 0, fontSize: 14, color: C.ink, fontFamily: MONO }}>
                      {getClientPortalAccountByClientId(viewClient.id)?.username}
                    </p>
                  </div>
                  <span style={{
                    padding: "2px 9px",
                    borderRadius: 100,
                    fontSize: 10,
                    fontFamily: MONO,
                    fontWeight: 600,
                    border: `1px solid ${getClientPortalAccountByClientId(viewClient.id)?.is_active ? C.positive : C.muted}`,
                    color: getClientPortalAccountByClientId(viewClient.id)?.is_active ? C.positive : C.muted,
                  }}>
                    {getClientPortalAccountByClientId(viewClient.id)?.is_active ? "Portal Active" : "Portal Disabled"}
                  </span>
                </div>

                {portalInfo && portalInfo.username === getClientPortalAccountByClientId(viewClient.id)?.username && (
                  <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 10, background: C.accentTint, border: `1px solid ${C.accent}30` }}>
                    <p style={{ margin: "0 0 6px", fontSize: 11, fontFamily: MONO, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Temporary Login Details
                    </p>
                    <p style={{ margin: "0 0 4px", fontSize: 13, color: C.ink2 }}>Username: <span style={{ fontFamily: MONO }}>{portalInfo.username}</span></p>
                    <p style={{ margin: 0, fontSize: 13, color: C.ink2 }}>Password: <span style={{ fontFamily: MONO }}>{portalInfo.password}</span></p>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                  <button onClick={() => handleResetPortalPassword(viewClient)} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.hair}`, background: C.surface2, color: C.ink2, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                    Reset Password
                  </button>
                  <button
                    onClick={() => handleTogglePortalAccess(viewClient, !getClientPortalAccountByClientId(viewClient.id)?.is_active)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1px solid ${getClientPortalAccountByClientId(viewClient.id)?.is_active ? C.danger : C.positive}`,
                      background: getClientPortalAccountByClientId(viewClient.id)?.is_active ? C.dangerTint : C.positiveTint,
                      color: getClientPortalAccountByClientId(viewClient.id)?.is_active ? C.danger : C.positive,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: SANS,
                    }}
                  >
                    {getClientPortalAccountByClientId(viewClient.id)?.is_active ? "Disable Portal" : "Enable Portal"}
                  </button>
                  <a href="/client/login" target="_blank" rel="noreferrer" style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.hair}`, background: C.surface2, color: C.accent, fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: SANS }}>
                    Open Client Login
                  </a>
                </div>
                <p style={{ margin: "12px 0 0", fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                  Passport, ID, extra files, and your updates in this client record will appear in the client dashboard after login.
                </p>
              </div>

              <div style={{ background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 12, padding: 16 }}>
                <p style={{ ...labelStyle, marginBottom: 8 }}>Send Update</p>
                <textarea
                  value={portalMessage}
                  onChange={(e) => setPortalMessage(e.target.value)}
                  placeholder="Write an update or request for this client..."
                  style={{ ...inputStyle, minHeight: 88, resize: "vertical" }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                  <button onClick={() => handleSendPortalMessage(viewClient)} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                    Send To Client
                  </button>
                </div>
              </div>

              <div style={{ background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 12, padding: 16 }}>
                <p style={{ ...labelStyle, marginBottom: 8 }}>Portal Messages</p>
                {getClientPortalMessages(viewClient.id).length === 0 ? (
                  <p style={{ margin: 0, fontSize: 12, color: C.muted }}>No portal messages yet.</p>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {getClientPortalMessages(viewClient.id).slice().reverse().map((message) => (
                      <div key={message.id} style={{ borderRadius: 10, border: `1px solid ${C.hair}`, background: message.sender_type === "admin" ? C.accentTint : C.surface2, padding: "10px 12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                          <strong style={{ fontSize: 12, color: C.ink }}>{message.sender_name}</strong>
                          <span style={{ fontSize: 11, color: C.muted, fontFamily: MONO }}>{new Date(message.created_at).toLocaleString()}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: C.ink2, lineHeight: 1.6 }}>{message.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${C.hair}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 11, color: C.muted, fontFamily: MONO }}>Added by {viewClient.created_by_username ?? "—"} · {new Date(viewClient.created_at).toLocaleDateString()}</p>
            {admin?.role === "admin" && (
              <button onClick={() => { setViewClient(null); openEdit(viewClient); }} style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: C.ink, color: C.bg, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>Edit Client</button>
            )}
          </div>
        </Modal>
      )}

      {/* ── Create Modal ── */}
      {showCreate && (
        <Modal title="New Client" onClose={() => setShowCreate(false)} wide>
          <form onSubmit={handleCreate}>
            <SectionLabel>Basic Info</SectionLabel>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Name *</label>
              <input required style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Acme Corp" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Department</label>
                <select style={inputStyle} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value as Dept | "" })}>
                  <option value="">— None —</option>
                  {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Contact Name</label>
                <input style={inputStyle} value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Contact Email</label>
                <input type="email" style={inputStyle} value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Contact Phone</label>
                <input style={inputStyle} value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
              </div>
            </div>
            <SectionLabel>Identity (optional)</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>ID Number</label>
                <input style={inputStyle} value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Nationality</label>
                <input style={inputStyle} value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Date of Birth</label>
                <input type="date" style={inputStyle} value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Country</label>
                <input style={inputStyle} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Address</label>
                <input style={inputStyle} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, minHeight: 64, resize: "vertical" }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button type="submit" disabled={creating} style={{ width: "100%", padding: 11, borderRadius: 8, border: "none", background: creating ? C.muted : C.ink, color: C.bg, fontSize: 14, fontWeight: 600, cursor: creating ? "not-allowed" : "pointer" }}>
              {creating ? "Creating…" : "Create Client"}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {editClient && (
        <Modal title={`Edit: ${editClient.name}`} onClose={() => setEditClient(null)} wide>
          <form onSubmit={handleEdit}>
            <SectionLabel>Basic Info</SectionLabel>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Name *</label>
              <input required style={inputStyle} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Department</label>
                <select style={inputStyle} value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value as Dept | "" })}>
                  <option value="">— None —</option>
                  {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select style={inputStyle} value={editForm.is_active ? "active" : "inactive"} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === "active" })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Contact Name</label>
                <input style={inputStyle} value={editForm.contactName} onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Contact Email</label>
                <input type="email" style={inputStyle} value={editForm.contactEmail} onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Contact Phone</label>
                <input style={inputStyle} value={editForm.contactPhone} onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Country</label>
                <input style={inputStyle} value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} />
              </div>
            </div>
            <SectionLabel>Identity</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>ID Number</label>
                <input style={inputStyle} value={editForm.idNumber} onChange={(e) => setEditForm({ ...editForm, idNumber: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Nationality</label>
                <input style={inputStyle} value={editForm.nationality} onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Date of Birth</label>
                <input type="date" style={inputStyle} value={editForm.dateOfBirth} onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Address</label>
                <input style={inputStyle} value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, minHeight: 64, resize: "vertical" }} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
            </div>
            <button type="submit" disabled={saving} style={{ width: "100%", padding: 11, borderRadius: 8, border: "none", background: saving ? C.muted : C.ink, color: C.bg, fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
