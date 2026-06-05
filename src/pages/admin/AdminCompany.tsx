import { useEffect, useRef, useState } from "react";
import {
  CompanyInfo, CompanyContact, CompanyDoc,
  getCompanyInfo, upsertCompanyInfo,
  logActivity,
} from "@/lib/adminApi";
import { supabase } from "@/lib/supabaseClient";
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

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: `1.5px solid ${C.hair}`, background: C.surface,
  fontSize: 13, fontFamily: SANS, color: C.ink, outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontFamily: MONO,
  color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 14, color: C.ink, margin: "0 0 16px", paddingBottom: 10, borderBottom: `1px solid ${C.hair}` }}>
      {children}
    </h3>
  );
}

function Field({ label, value, onChange, multiline, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; type?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />}
    </div>
  );
}

// Upload a doc to Supabase company-docs bucket
async function uploadCompanyDoc(file: File): Promise<string> {
  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error } = await supabase.storage.from("company-docs").upload(path, file, { upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from("company-docs").getPublicUrl(path);
  return data.publicUrl;
}

export default function AdminCompany() {
  const { admin } = useAdminAuth();
  const [info, setInfo]       = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  // Core company fields
  const [fields, setFields] = useState({
    company_name:        "",
    nip_number:          "",
    registration_number: "",
    vat_number:          "",
    address:             "",
    bank_account:        "",
    founder_name:        "",
    phone:               "",
    email:               "",
    website:             "",
    industry:            "",
    important_notes:     "",
  });

  // Contacts
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", role: "", phone: "", email: "" });

  // Docs
  const [docs, setDocs] = useState<CompanyDoc[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const docFileRef = useRef<HTMLInputElement>(null);

  const loadInfo = async () => {
    try {
      const data = await getCompanyInfo();
      if (data) {
        setInfo(data);
        setFields({
          company_name:        data.company_name        ?? "",
          nip_number:          data.nip_number          ?? "",
          registration_number: data.registration_number ?? "",
          vat_number:          data.vat_number          ?? "",
          address:             data.address             ?? "",
          bank_account:        data.bank_account        ?? "",
          founder_name:        data.founder_name        ?? "",
          phone:               data.phone               ?? "",
          email:               data.email               ?? "",
          website:             data.website             ?? "",
          industry:            data.industry            ?? "",
          important_notes:     data.important_notes     ?? "",
        });
        setContacts(Array.isArray(data.contacts) ? data.contacts : []);
        setDocs(Array.isArray(data.docs) ? data.docs : []);
      }
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to load."); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadInfo(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess(""); setSaving(true);
    try {
      await upsertCompanyInfo({ ...fields, contacts, docs, id: info?.id });
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", "Updated company information", "edit", admin?.department);
      setSuccess("Company information saved.");
      await loadInfo();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Save failed."); }
    finally { setSaving(false); }
  };

  // Add contact
  const addContact = () => {
    if (!contactForm.name.trim()) return;
    const newContact: CompanyContact = { id: crypto.randomUUID(), ...contactForm };
    setContacts(prev => [...prev, newContact]);
    setContactForm({ name: "", role: "", phone: "", email: "" });
    setShowAddContact(false);
  };

  const removeContact = (id: string) => setContacts(prev => prev.filter(c => c.id !== id));

  // Upload doc
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingDoc(true); setError("");
    try {
      const url = await uploadCompanyDoc(file);
      const newDoc: CompanyDoc = { name: file.name, url, uploaded_at: new Date().toISOString() };
      const newDocs = [...docs, newDoc];
      setDocs(newDocs);
      // Save immediately
      await upsertCompanyInfo({ docs: newDocs, contacts, id: info?.id });
      setSuccess("Document uploaded.");
      await loadInfo();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Upload failed."); }
    finally { setUploadingDoc(false); if (docFileRef.current) docFileRef.current.value = ""; }
  };

  const removeDoc = async (doc: CompanyDoc) => {
    if (!confirm(`Remove "${doc.name}"?`)) return;
    const newDocs = docs.filter(d => d.url !== doc.url);
    setDocs(newDocs);
    await upsertCompanyInfo({ docs: newDocs, contacts, id: info?.id });
    setSuccess("Document removed.");
  };

  if (loading) return <div style={{ padding: 40, color: C.muted, textAlign: "center" }}>Loading…</div>;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.ink, margin: 0 }}>Company Information</h1>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
          {info?.updated_at ? `Last updated: ${new Date(info.updated_at).toLocaleString()}` : "Set up your company details."}
        </p>
      </div>

      {error   && <div style={{ padding: "10px 14px", borderRadius: 8, background: C.dangerTint, border: "1px solid #f5c6c2", color: C.danger, fontSize: 13, marginBottom: 16 }}>{error}</div>}
      {success && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.10)", border: "1px solid #a9dfbf", color: C.positive, fontSize: 13, marginBottom: 16 }}>{success}</div>}

      <form onSubmit={handleSave}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* ── Left column ── */}
          <div>
            <div style={{ background: C.surface2, borderRadius: 14, padding: "24px", border: `1px solid ${C.hair}`, marginBottom: 20 }}>
              <SectionTitle>Company Details</SectionTitle>
              <Field label="Company Name"    value={fields.company_name}    onChange={v => setFields(f => ({ ...f, company_name: v }))} />
              <Field label="Industry"        value={fields.industry}        onChange={v => setFields(f => ({ ...f, industry: v }))} />
              <Field label="Founder / CEO"   value={fields.founder_name}    onChange={v => setFields(f => ({ ...f, founder_name: v }))} />
              <Field label="Website"         value={fields.website}         onChange={v => setFields(f => ({ ...f, website: v }))} type="url" />
            </div>

            <div style={{ background: C.surface2, borderRadius: 14, padding: "24px", border: `1px solid ${C.hair}`, marginBottom: 20 }}>
              <SectionTitle>Legal & Tax</SectionTitle>
              <Field label="NIP / Tax ID"          value={fields.nip_number}          onChange={v => setFields(f => ({ ...f, nip_number: v }))} />
              <Field label="Registration Number"   value={fields.registration_number} onChange={v => setFields(f => ({ ...f, registration_number: v }))} />
              <Field label="VAT Number"            value={fields.vat_number}          onChange={v => setFields(f => ({ ...f, vat_number: v }))} />
            </div>

            <div style={{ background: C.surface2, borderRadius: 14, padding: "24px", border: `1px solid ${C.hair}` }}>
              <SectionTitle>Contact & Banking</SectionTitle>
              <Field label="Phone"        value={fields.phone}        onChange={v => setFields(f => ({ ...f, phone: v }))} />
              <Field label="Email"        value={fields.email}        onChange={v => setFields(f => ({ ...f, email: v }))} type="email" />
              <Field label="Bank Account" value={fields.bank_account} onChange={v => setFields(f => ({ ...f, bank_account: v }))} />
              <Field label="Address"      value={fields.address}      onChange={v => setFields(f => ({ ...f, address: v }))} multiline />
            </div>
          </div>

          {/* ── Right column ── */}
          <div>
            <div style={{ background: C.surface2, borderRadius: 14, padding: "24px", border: `1px solid ${C.hair}`, marginBottom: 20 }}>
              <SectionTitle>Important Notes</SectionTitle>
              <textarea
                value={fields.important_notes}
                onChange={e => setFields(f => ({ ...f, important_notes: e.target.value }))}
                placeholder="Internal notes, reminders, key dates…"
                style={{ ...inputStyle, minHeight: 160, resize: "vertical" }}
              />
            </div>

            {/* Contacts */}
            <div style={{ background: C.surface2, borderRadius: 14, padding: "24px", border: `1px solid ${C.hair}`, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 14, color: C.ink, margin: 0 }}>Contacts</h3>
                <button type="button" onClick={() => setShowAddContact(v => !v)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: C.ink, color: C.bg, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                  + Add
                </button>
              </div>

              {showAddContact && (
                <div style={{ background: C.bg, borderRadius: 10, padding: 16, marginBottom: 14, border: `1px solid ${C.accent}30` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={labelStyle}>Name *</label>
                      <input style={inputStyle} value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
                    </div>
                    <div>
                      <label style={labelStyle}>Role / Title</label>
                      <input style={inputStyle} value={contactForm.role} onChange={e => setContactForm(f => ({ ...f, role: e.target.value }))} placeholder="CEO, Lawyer…" />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone</label>
                      <input style={inputStyle} value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email</label>
                      <input type="email" style={inputStyle} value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={addContact} style={{ flex: 1, padding: "7px", borderRadius: 6, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                      Add Contact
                    </button>
                    <button type="button" onClick={() => setShowAddContact(false)} style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${C.hair}`, background: C.surface, color: C.muted, fontSize: 13, cursor: "pointer", fontFamily: SANS }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {contacts.length === 0 ? (
                <p style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "12px 0" }}>No contacts yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {contacts.map(ct => (
                    <div key={ct.id} style={{ background: C.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.hair}`, display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: 13, color: C.ink, margin: 0 }}>{ct.name}</p>
                        {ct.role  && <p style={{ fontSize: 11, color: C.accent, margin: "2px 0 0", fontFamily: MONO }}>{ct.role}</p>}
                        {ct.phone && <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 0" }}>{ct.phone}</p>}
                        {ct.email && <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 0" }}>{ct.email}</p>}
                      </div>
                      <button type="button" onClick={() => removeContact(ct.id)} style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 16, lineHeight: 1, flexShrink: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents */}
            <div style={{ background: C.surface2, borderRadius: 14, padding: "24px", border: `1px solid ${C.hair}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 14, color: C.ink, margin: 0 }}>Documents</h3>
                <button type="button" onClick={() => docFileRef.current?.click()} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: C.ink, color: C.bg, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                  {uploadingDoc ? "Uploading…" : "+ Upload"}
                </button>
                <input ref={docFileRef} type="file" style={{ display: "none" }} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt" onChange={handleDocUpload} />
              </div>

              {docs.length === 0 ? (
                <p style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "12px 0" }}>No documents uploaded yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {docs.map(doc => (
                    <div key={doc.url} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: C.surface, borderRadius: 8, border: `1px solid ${C.hair}` }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: 12, color: C.ink, textDecoration: "none", fontFamily: SANS, fontWeight: 500 }}>
                        {doc.name}
                      </a>
                      <span style={{ fontSize: 10, color: C.muted, fontFamily: MONO, flexShrink: 0 }}>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      <button type="button" onClick={() => removeDoc(doc)} style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 16, lineHeight: 1, flexShrink: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <button type="submit" disabled={saving} style={{ padding: "12px 32px", borderRadius: 8, border: "none", background: saving ? C.muted : C.ink, color: C.bg, fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", transition: "background 0.2s" }}>
            {saving ? "Saving…" : "Save All Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
