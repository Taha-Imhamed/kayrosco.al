import { useEffect, useRef, useState } from "react";
import {
  Contract,
  ContractCategory,
  ContractType,
  getContracts,
  createContract,
  softDeleteContract,
  getContractDownloadUrl,
} from "@/lib/adminApi";
import { logActivity } from "@/lib/adminApi";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const C = {
  bg:          "#F4F4F5",
  surface:     "#FFFFFF",
  surface2:    "#FAFAFA",
  ink:         "#09090B",
  ink2:        "#18181B",
  ink3:        "#3F3F46",
  muted:       "#71717A",
  hair:        "rgba(0,0,0,0.07)",
  accent:      "#2563EB",
  accentTint:  "rgba(37,99,235,0.10)",
  positive:    "#16A34A",
  positiveTint:"rgba(22,163,74,0.10)",
  warning:     "#D97706",
  info:        "#3B82F6",
  danger:      "#DC2626",
  dangerTint:  "rgba(220,38,38,0.10)",
};
const SANS = "'Geist', ui-sans-serif, -apple-system, sans-serif";
const MONO = "'Geist Mono', ui-monospace, monospace";

const CATS: ContractCategory[] = ["tech", "consulting", "travel"];
const TYPES: ContractType[] = ["internal", "client", "government"];

const CAT_COLORS: Record<ContractCategory, string> = {
  tech: "#3B82F6",
  consulting: "#7C3AED",
  travel: "#16A34A",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 7,
  border: `1.5px solid ${C.hair}`,
  background: C.surface,
  fontSize: 13, fontFamily: SANS, color: C.ink,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontFamily: "'Geist Mono', ui-monospace, monospace",
  color: C.muted,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 5,
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

export default function AdminContracts() {
  const { admin } = useAdminAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<ContractCategory | "">("");
  const [filterType, setFilterType] = useState<ContractType | "">("");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    category: "tech" as ContractCategory,
    type: "internal" as ContractType,
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Role-based category filter for non-admins
  const allowedCats: ContractCategory[] = admin?.role === "admin"
    ? CATS
    : admin?.department === "tech" ? ["tech"]
    : admin?.department === "consulting" ? ["consulting"]
    : admin?.department === "travel" ? ["travel"]
    : [];

  const load = () => {
    setLoading(true);
    getContracts({
      category: filterCat || undefined,
      type: filterType || undefined,
    })
      .then((data) => {
        // Non-admin: filter to own department only
        if (admin?.role !== "admin" && admin?.department) {
          setContracts(data.filter((c) => c.category === admin.department));
        } else {
          setContracts(data);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterCat, filterType]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = contracts.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setUploading(true);
    try {
      const { uploadWarning } = await createContract(
        {
          title: form.title,
          category: form.category,
          type: form.type,
          description: form.description,
          uploadedBy: admin?.id ?? "",
          uploadedByUsername: admin?.username ?? "",
        },
        selectedFile ?? undefined
      );
      logActivity(admin?.id ?? null, admin?.username ?? "admin", `Uploaded contract: ${form.title}`, "upload", form.category);
      setSuccess(uploadWarning ? `Contract saved. ⚠️ ${uploadWarning}` : `Contract "${form.title}" saved successfully.`);
      setShowUpload(false);
      setForm({ title: "", category: "tech", type: "internal", description: "" });
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (contract: Contract) => {
    if (!contract.storage_path) {
      setError("No file attached to this contract.");
      return;
    }
    try {
      const url = await getContractDownloadUrl(contract.storage_path);
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Downloaded contract: ${contract.title}`, "download", contract.category);
      window.open(url, "_blank");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Download failed.");
    }
  };

  const handleDelete = async (contract: Contract) => {
    if (!confirm(`Delete contract "${contract.title}"? (soft delete)`)) return;
    try {
      await softDeleteContract(contract.id);
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Deleted contract: ${contract.title}`, "delete", contract.category);
      setSuccess(`"${contract.title}" removed.`);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Geist', ui-sans-serif, -apple-system, sans-serif", fontWeight: 600, fontSize: 28, color: C.ink, margin: 0 }}>Contracts</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{filtered.length} contract{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          + Upload Contract
        </button>
      </div>

      {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.10)", border: "1px solid #f5c6c2", color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.10)", border: "1px solid #a9dfbf", color: "#16A34A", fontSize: 13, marginBottom: 12 }}>{success}</div>}

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search title or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 280 }}
        />
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value as ContractCategory | "")} style={{ ...inputStyle, width: 140 }}>
          <option value="">All Categories</option>
          {allowedCats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as ContractType | "")} style={{ ...inputStyle, width: 140 }}>
          <option value="">All Types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: C.surface2, borderRadius: 12, border: `1px solid ${C.hair}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["Title", "Category", "Type", "Uploaded By", "Date", "File", ""].map((h) => (
                <th key={h} style={{ padding: "10px 16px", fontWeight: 600, color: C.muted, fontSize: 11, fontFamily: "'Geist Mono', ui-monospace, monospace", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${C.hair}`, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 20, color: C.muted, textAlign: "center" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 20, color: C.muted, textAlign: "center" }}>No contracts found.</td></tr>
            ) : (
              filtered.map((contract, i) => (
                <tr key={contract.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.hair}` }}>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ fontWeight: 600, color: C.ink }}>{contract.title}</div>
                    {contract.description && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{contract.description}</div>}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <Pill text={contract.category} color={CAT_COLORS[contract.category]} />
                  </td>
                  <td style={{ padding: "11px 16px", color: C.muted }}>{contract.type}</td>
                  <td style={{ padding: "11px 16px", color: C.muted }}>{contract.uploaded_by_username ?? "—"}</td>
                  <td style={{ padding: "11px 16px", fontSize: 11, fontFamily: "'Geist Mono', ui-monospace, monospace", color: C.muted }}>
                    {new Date(contract.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 12, color: C.muted }}>
                    {contract.file_name ?? "—"}
                  </td>
                  <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                    {contract.storage_path && (
                      <button onClick={() => handleDownload(contract)} style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer", fontSize: 12, textDecoration: "underline", marginRight: 8 }}>
                        Download
                      </button>
                    )}
                    {admin?.role === "admin" && (
                      <button onClick={() => handleDelete(contract)} style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowUpload(false); }}
        >
          <div style={{ background: C.bg, borderRadius: 14, padding: "28px 28px 24px", width: "100%", maxWidth: 460, boxShadow: "0 12px 48px rgba(26,26,26,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Geist', ui-sans-serif, -apple-system, sans-serif", fontWeight: 600, fontSize: 20, color: C.ink, margin: 0 }}>Upload Contract</h2>
              <button onClick={() => setShowUpload(false)} style={{ background: "none", border: "none", fontSize: 20, color: C.muted, cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Contract Title *</label>
                <input required style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Q2 Flight Booking Agreement" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Department *</label>
                  <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ContractCategory })}>
                    {allowedCats.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Contract Type *</label>
                  <select style={inputStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ContractType })}>
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional notes about this contract…"
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>File (PDF / DOC / DOCX)</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  style={{ fontSize: 13, color: C.muted }}
                />
                {selectedFile && <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Selected: {selectedFile.name}</p>}
              </div>
              <button
                type="submit"
                disabled={uploading}
                style={{ width: "100%", padding: "11px", borderRadius: 8, border: "none", background: uploading ? C.muted : C.ink, color: C.bg, fontSize: 14, fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer" }}
              >
                {uploading ? "Uploading…" : "Upload Contract"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
