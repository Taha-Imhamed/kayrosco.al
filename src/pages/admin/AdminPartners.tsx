import { useEffect, useState } from "react";
import {
  ContractStatus,
  createPartner,
  deletePartner,
  getPartners,
  PartnerCategory,
  PartnerRecord,
  updatePartner,
} from "@/lib/partnersStore";

const C = {
  bg: "#F4F4F5",
  surface: "#FFFFFF",
  surface2: "#FAFAFA",
  ink: "#09090B",
  ink2: "#18181B",
  muted: "#71717A",
  hair: "rgba(0,0,0,0.07)",
  accent: "#2563EB",
  accentTint: "rgba(37,99,235,0.10)",
  positive: "#16A34A",
  positiveTint: "rgba(22,163,74,0.10)",
  warning: "#D97706",
  warningTint: "#FFF7E8",
  danger: "#DC2626",
  dangerTint: "rgba(220,38,38,0.10)",
  info: "#3B82F6",
  infoTint: "#EFF6FF",
};

const SANS = "'Geist', ui-sans-serif, -apple-system, sans-serif";
const MONO = "'Geist Mono', ui-monospace, monospace";

const CATEGORIES: PartnerCategory[] = [
  "restaurant",
  "hotel",
  "transport",
  "legal",
  "technology",
  "supplier",
  "other",
];

const CONTRACT_STATUSES: ContractStatus[] = [
  "active",
  "pending",
  "expired",
  "draft",
];

const CATEGORY_LABEL: Record<PartnerCategory, string> = {
  restaurant: "Restaurant",
  hotel: "Hotel",
  transport: "Transport",
  legal: "Legal",
  technology: "Technology",
  supplier: "Supplier",
  other: "Other",
};

const STATUS_STYLE: Record<ContractStatus, { color: string; bg: string }> = {
  active: { color: C.positive, bg: C.positiveTint },
  pending: { color: C.warning, bg: C.warningTint },
  expired: { color: C.danger, bg: C.dangerTint },
  draft: { color: C.info, bg: C.infoTint },
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1.5px solid ${C.hair}`,
  background: C.surface,
  fontSize: 13,
  fontFamily: SANS,
  color: C.ink,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontFamily: MONO,
  color: C.muted,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 5,
};

const emptyForm = {
  name: "",
  category: "restaurant" as PartnerCategory,
  logo_url: "",
  short_description: "",
  details: "",
  contact_person: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  contract_status: "draft" as ContractStatus,
  contract_title: "",
  contract_value: "",
  notes: "",
};

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,26,26,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          maxHeight: "90vh",
          overflowY: "auto",
          background: C.bg,
          borderRadius: 16,
          padding: "26px 26px 22px",
          boxShadow: "0 14px 48px rgba(0,0,0,0.16)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 22,
              color: C.ink,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              cursor: "pointer",
              color: C.muted,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ContractStatus }) {
  const cfg = STATUS_STYLE[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        background: cfg.bg,
        color: cfg.color,
        fontSize: 11,
        fontWeight: 700,
        fontFamily: MONO,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {status}
    </span>
  );
}

export default function AdminPartners() {
  const [partners, setPartners] = useState<PartnerRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<PartnerCategory | "">("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<PartnerRecord | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => setPartners(getPartners());
  useEffect(() => { load(); }, []);

  const filtered = partners.filter((partner) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      partner.name.toLowerCase().includes(q) ||
      partner.short_description.toLowerCase().includes(q) ||
      partner.contract_title.toLowerCase().includes(q) ||
      partner.address.toLowerCase().includes(q);
    const matchesCategory = !filterCategory || partner.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => setForm(emptyForm);

  const openEdit = (partner: PartnerRecord) => {
    setEditing(partner);
    setForm({
      name: partner.name,
      category: partner.category,
      logo_url: partner.logo_url,
      short_description: partner.short_description,
      details: partner.details,
      contact_person: partner.contact_person,
      email: partner.email,
      phone: partner.phone,
      website: partner.website,
      address: partner.address,
      contract_status: partner.contract_status,
      contract_title: partner.contract_title,
      contract_value: partner.contract_value,
      notes: partner.notes,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        updatePartner(editing.id, form);
        setSuccess(`Updated "${form.name}".`);
      } else {
        createPartner(form);
        setSuccess(`Created "${form.name}".`);
      }
      setShowCreate(false);
      setEditing(null);
      resetForm();
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed.");
    }
  };

  const handleDelete = (partner: PartnerRecord) => {
    if (!confirm(`Delete partner "${partner.name}"?`)) return;
    deletePartner(partner.id);
    setSuccess(`Deleted "${partner.name}".`);
    if (expandedId === partner.id) setExpandedId(null);
    load();
  };

  const activeCount = partners.filter((partner) => partner.contract_status === "active").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: SANS, fontWeight: 700, fontSize: 28, color: C.ink }}>Partners</h1>
          <p style={{ marginTop: 4, fontSize: 13, color: C.muted }}>
            Partners, restaurants, suppliers, and contract relationships in one place.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            resetForm();
            setShowCreate(true);
          }}
          style={{
            padding: "10px 18px",
            borderRadius: 9,
            border: "none",
            background: C.ink,
            color: C.bg,
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Add Partner
        </button>
      </div>

      {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: C.dangerTint, border: "1px solid #f5c6c2", color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.10)", border: "1px solid #a9dfbf", color: C.positive, fontSize: 13, marginBottom: 12 }}>{success}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Total Partners", value: String(partners.length) },
          { label: "Active Contracts", value: String(activeCount) },
          { label: "Restaurants", value: String(partners.filter((partner) => partner.category === "restaurant").length) },
        ].map((stat) => (
          <div key={stat.label} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.hair}`, padding: "16px 18px" }}>
            <p style={{ margin: "0 0 6px", fontSize: 10, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 800, fontFamily: SANS, color: C.ink }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search partner, contract, or address..."
          style={{ ...inputStyle, maxWidth: 320 }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as PartnerCategory | "")}
          style={{ ...inputStyle, width: 180 }}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABEL[category]}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.hair}`, padding: 28, textAlign: "center", color: C.muted }}>
          No partners found yet.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {filtered.map((partner) => {
            const expanded = expandedId === partner.id;
            return (
              <div
                key={partner.id}
                style={{
                  background: C.surface,
                  borderRadius: 16,
                  border: `1px solid ${expanded ? C.accent : C.hair}`,
                  boxShadow: expanded ? "0 12px 30px rgba(37,99,235,0.12)" : "0 4px 18px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : partner.id)}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "none",
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 16,
                          background: C.surface2,
                          border: `1px solid ${C.hair}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {partner.logo_url ? (
                          <img
                            src={partner.logo_url}
                            alt={partner.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span style={{ fontSize: 22, fontWeight: 800, color: C.accent, fontFamily: SANS }}>
                            {partner.name.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, fontFamily: SANS, color: C.ink }}>{partner.name}</p>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ padding: "3px 9px", borderRadius: 999, background: C.accentTint, color: C.accent, fontSize: 10, fontWeight: 700, fontFamily: MONO, textTransform: "uppercase" }}>
                            {CATEGORY_LABEL[partner.category]}
                          </span>
                          <StatusPill status={partner.contract_status} />
                        </div>
                      </div>
                    </div>
                    <p style={{ margin: 0, color: C.ink2, fontSize: 13, lineHeight: 1.55 }}>
                      {partner.short_description || "No short description yet."}
                    </p>
                  </div>
                </button>

                {expanded && (
                  <div style={{ borderTop: `1px solid ${C.hair}`, padding: 18 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                      <div style={{ background: C.surface2, borderRadius: 10, padding: "12px 14px" }}>
                        <p style={{ margin: "0 0 5px", fontSize: 10, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Contract</p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.ink }}>{partner.contract_title || "Not set"}</p>
                        {partner.contract_value && <p style={{ margin: "6px 0 0", fontSize: 12, color: C.ink2 }}>{partner.contract_value}</p>}
                      </div>
                      <div style={{ background: C.surface2, borderRadius: 10, padding: "12px 14px" }}>
                        <p style={{ margin: "0 0 5px", fontSize: 10, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Contact</p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.ink }}>{partner.contact_person || "Not set"}</p>
                        {partner.phone && <p style={{ margin: "6px 0 0", fontSize: 12, color: C.ink2 }}>{partner.phone}</p>}
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
                      <div>
                        <p style={{ margin: "0 0 4px", fontSize: 10, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Details</p>
                        <p style={{ margin: 0, fontSize: 13, color: C.ink2, lineHeight: 1.6 }}>{partner.details || "No details added yet."}</p>
                      </div>
                      {partner.notes && (
                        <div>
                          <p style={{ margin: "0 0 4px", fontSize: 10, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Notes</p>
                          <p style={{ margin: 0, fontSize: 13, color: C.ink2, lineHeight: 1.6 }}>{partner.notes}</p>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "grid", gap: 6, marginBottom: 16 }}>
                      {partner.website && <a href={partner.website} target="_blank" rel="noreferrer" style={{ color: C.accent, fontSize: 13, textDecoration: "none" }}>{partner.website}</a>}
                      {partner.email && <p style={{ margin: 0, fontSize: 13, color: C.ink2 }}>{partner.email}</p>}
                      {partner.address && <p style={{ margin: 0, fontSize: 13, color: C.ink2 }}>{partner.address}</p>}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        onClick={() => openEdit(partner)}
                        style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.hair}`, background: C.surface2, color: C.ink, fontSize: 12, fontWeight: 700, fontFamily: SANS, cursor: "pointer" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(partner)}
                        style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.danger}`, background: C.dangerTint, color: C.danger, fontSize: 12, fontWeight: 700, fontFamily: SANS, cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {(showCreate || editing) && (
        <Modal
          title={editing ? `Edit: ${editing.name}` : "Add Partner"}
          onClose={() => {
            setShowCreate(false);
            setEditing(null);
            resetForm();
          }}
        >
          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Partner Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as PartnerCategory })} style={inputStyle}>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{CATEGORY_LABEL[category]}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Logo URL</label>
                <input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} style={inputStyle} placeholder="https://..." />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Short Description</label>
                <input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} style={inputStyle} placeholder="Quick summary shown on the card" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Details</label>
                <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>Contact Person</label>
                <input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Contract Status</label>
                <select value={form.contract_status} onChange={(e) => setForm({ ...form, contract_status: e.target.value as ContractStatus })} style={inputStyle}>
                  {CONTRACT_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Contract Value</label>
                <input value={form.contract_value} onChange={(e) => setForm({ ...form, contract_value: e.target.value })} style={inputStyle} placeholder="$ / monthly / annual" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Contract Title</label>
                <input value={form.contract_title} onChange={(e) => setForm({ ...form, contract_title: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Internal Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
              <button
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  setEditing(null);
                  resetForm();
                }}
                style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.hair}`, background: C.surface, color: C.ink, fontSize: 13, fontWeight: 700, fontFamily: SANS, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 13, fontWeight: 700, fontFamily: SANS, cursor: "pointer" }}
              >
                {editing ? "Save Changes" : "Create Partner"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
