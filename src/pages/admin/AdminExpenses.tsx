import { useEffect, useRef, useState } from "react";
import {
  ExpenseClaim, ExpenseStatus,
  getExpenseClaims, createExpenseClaim, reviewExpenseClaim, deleteExpenseClaim,
  logActivity,
} from "@/lib/adminApi";
import { applyTx, getAccounts, addAccount, BalanceCategoryKey } from "@/lib/balanceStore";
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

const CATEGORIES = ["General", "Travel", "Meals", "Equipment", "Software", "Marketing", "Training", "Other"];
const DEPTS = ["tech", "consulting", "travel", "admin"] as const;

// Fixed balance categories — always available regardless of how many accounts exist
const BALANCE_CATS: { key: BalanceCategoryKey; label: string }[] = [
  { key: "assets", label: "Assets" },
  { key: "liquid", label: "Liquid / Cash" },
  { key: "stocks", label: "Stocks" },
  { key: "bank",   label: "Bank" },
  { key: "other",  label: "Other" },
];

/** Resolve a category key to a real account ID, creating one if needed. */
function resolveOrCreateAccount(catKey: BalanceCategoryKey, catLabel: string, username: string): string {
  const accounts = getAccounts();
  const found = accounts.find(a => a.category === catKey);
  if (found) return found.id;
  const created = addAccount({ name: catLabel, category: catKey, note: "Auto-created from expense" }, 0, username);
  return created.id;
}

const STATUS_STYLE: Record<ExpenseStatus, { bg: string; color: string }> = {
  pending:  { bg: "rgba(245,158,11,0.08)", color: "#F59E0B" },
  approved: { bg: "rgba(16,185,129,0.10)", color: "#10B981" },
  rejected: { bg: "rgba(239,68,68,0.10)", color: "#EF4444" },
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 7,
  border: `1.5px solid ${C.hair}`, background: C.surface,
  fontSize: 13, fontFamily: SANS, color: C.ink, outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontFamily: MONO,
  color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5,
};

export default function AdminExpenses() {
  const { admin } = useAdminAuth();
  const [claims, setClaims]         = useState<ExpenseClaim[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [filterStatus, setFilterStatus] = useState<ExpenseStatus | "">("");
  const [filterDept, setFilterDept]     = useState<string>("");
  const [showAdd, setShowAdd]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // "" = no deduction; otherwise one of the 5 category keys
  const [form, setForm] = useState({
    title: "", amount: "", category: "General",
    department: "admin" as typeof DEPTS[number],
    notes: "",
    balanceCat: "" as BalanceCategoryKey | "",
  });

  const load = () => {
    setLoading(true);
    getExpenseClaims({
      status: filterStatus || undefined,
      department: filterDept as typeof DEPTS[number] || undefined,
    }).then(setClaims).catch(e => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filterStatus, filterDept]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPending  = claims.filter(c => c.status === "pending").reduce((s, c) => s + Number(c.amount), 0);
  const totalApproved = claims.filter(c => c.status === "approved").reduce((s, c) => s + Number(c.amount), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess(""); setSubmitting(true);
    try {
      const chosenCat = BALANCE_CATS.find(c => c.key === form.balanceCat);
      await createExpenseClaim({
        title: form.title, amount: Number(form.amount),
        category: form.category, department: form.department,
        submittedBy: admin?.id ?? null, submittedByUsername: admin?.username ?? "admin",
        notes: form.notes || undefined,
        // Store category key as account-id so handleReview can resolve it later
        balanceAccountId:   chosenCat?.key,
        balanceAccountName: chosenCat?.label,
      }, selectedFile ?? undefined);
      logActivity(admin?.id ?? null, admin?.username ?? "admin", `Submitted expense claim: ${form.title} $${form.amount}`, "create", admin?.department);
      setSuccess("Expense claim submitted."); setShowAdd(false);
      setForm({ title: "", amount: "", category: "General", department: "admin", notes: "", balanceCat: "" });
      setSelectedFile(null); if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
    finally { setSubmitting(false); }
  };

  const handleReview = async (claim: ExpenseClaim, status: "approved" | "rejected") => {
    if (!confirm(`${status === "approved" ? "Approve" : "Reject"} claim "${claim.title}"?`)) return;
    try {
      // Deduct from balance when approving if an account was specified
      let didDeduct = false;
      if (status === "approved" && claim.balance_account_id && !claim.balance_deducted) {
        // balance_account_id stores the category key — resolve to a real account ID
        const realAccountId = resolveOrCreateAccount(
          claim.balance_account_id as BalanceCategoryKey,
          claim.balance_account_name ?? claim.balance_account_id,
          admin?.username ?? "admin",
        );
        applyTx(
          realAccountId,
          "debit",
          Number(claim.amount),
          `Expense: ${claim.title}`,
          admin?.username ?? "admin",
        );
        didDeduct = true;
      }
      await reviewExpenseClaim(
        claim.id, status,
        { id: admin?.id ?? "", username: admin?.username ?? "admin" },
        didDeduct,
      );
      logActivity(admin?.id ?? null, admin?.username ?? "admin", `${status} expense claim: ${claim.title}`, "edit", admin?.department);
      setSuccess(`Claim ${status}${didDeduct ? ` — $${Number(claim.amount).toLocaleString()} deducted from ${claim.balance_account_name}` : ""}.`);
      load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
  };

  const handleDelete = async (claim: ExpenseClaim) => {
    if (!confirm(`Delete claim "${claim.title}"?`)) return;
    try {
      await deleteExpenseClaim(claim.id);
      logActivity(admin?.id ?? null, admin?.username ?? "admin", `Deleted expense claim: ${claim.title}`, "delete", admin?.department);
      setSuccess("Deleted."); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.ink, margin: 0 }}>Expense Claims</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Submit, review, and approve expense claims</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Submit Claim
        </button>
      </div>

      {error   && <div style={{ padding: "10px 14px", borderRadius: 8, background: C.dangerTint, border: "1px solid #f5c6c2", color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.10)", border: "1px solid #a9dfbf", color: C.positive, fontSize: 13, marginBottom: 12 }}>{success}</div>}

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Pending Claims", value: `$${totalPending.toLocaleString()}`,  color: C.warning, bg: "rgba(245,158,11,0.08)"  },
          { label: "Approved",       value: `$${totalApproved.toLocaleString()}`, color: C.positive,bg: "rgba(16,185,129,0.10)"  },
          { label: "Total Claims",   value: String(claims.length),                color: C.ink,    bg: C.surface2                },
        ].map(card => (
          <div key={card.label} style={{ background: card.bg, borderRadius: 10, padding: "16px 18px", border: `1px solid ${C.hair}`, borderTop: `3px solid ${card.color}` }}>
            <p style={{ fontSize: 10, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{card.label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as ExpenseStatus | "")} style={{ ...inputStyle, width: 140 }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ ...inputStyle, width: 160 }}>
          <option value="">All Departments</option>
          {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: C.surface2, borderRadius: 12, border: `1px solid ${C.hair}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["Title", "Amount", "Category", "Dept", "From Account", "Submitted By", "Status", "Reviewed By", "Date", ""].map(h => (
                <th key={h} style={{ padding: "10px 16px", fontWeight: 600, color: C.muted, fontSize: 11, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${C.hair}`, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={{ padding: 20, color: C.muted, textAlign: "center" }}>Loading…</td></tr>
            ) : claims.length === 0 ? (
              <tr><td colSpan={10} style={{ padding: 20, color: C.muted, textAlign: "center" }}>No expense claims found.</td></tr>
            ) : claims.map((claim, i) => (
              <tr key={claim.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.hair}` }}>
                <td style={{ padding: "11px 16px", fontWeight: 600, color: C.ink }}>
                  {claim.title}
                  {claim.notes && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{claim.notes}</div>}
                </td>
                <td style={{ padding: "11px 16px", fontWeight: 700, color: C.ink }}>${Number(claim.amount).toLocaleString()}</td>
                <td style={{ padding: "11px 16px", color: C.muted }}>{claim.category}</td>
                <td style={{ padding: "11px 16px", color: C.muted, fontFamily: MONO, fontSize: 11 }}>{claim.department ?? "—"}</td>
                <td style={{ padding: "11px 16px" }}>
                  {claim.balance_account_name ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: MONO }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: claim.balance_deducted ? C.positive : C.warning, flexShrink: 0 }} />
                      <span style={{ color: C.ink }}>{claim.balance_account_name}</span>
                      {claim.balance_deducted && <span style={{ color: C.positive, fontSize: 10 }}>✓</span>}
                    </span>
                  ) : <span style={{ color: C.muted }}>—</span>}
                </td>
                <td style={{ padding: "11px 16px", color: C.muted, fontSize: 12 }}>{claim.submitted_by_username ?? "—"}</td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{ padding: "3px 9px", borderRadius: 100, fontSize: 11, fontFamily: MONO, fontWeight: 600, background: STATUS_STYLE[claim.status].bg, color: STATUS_STYLE[claim.status].color }}>{claim.status}</span>
                </td>
                <td style={{ padding: "11px 16px", color: C.muted, fontSize: 12 }}>{claim.reviewed_by_username ?? "—"}</td>
                <td style={{ padding: "11px 16px", fontSize: 11, fontFamily: MONO, color: C.muted }}>{new Date(claim.created_at).toLocaleDateString()}</td>
                <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                  {admin?.role === "admin" && claim.status === "pending" && (
                    <>
                      <button onClick={() => handleReview(claim, "approved")} style={{ background: "none", border: "none", color: C.positive, cursor: "pointer", fontSize: 12, textDecoration: "underline", marginRight: 6, fontFamily: SANS }}>Approve</button>
                      <button onClick={() => handleReview(claim, "rejected")} style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 12, textDecoration: "underline", marginRight: 6, fontFamily: SANS }}>Reject</button>
                    </>
                  )}
                  {admin?.role === "admin" && (
                    <button onClick={() => handleDelete(claim)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, textDecoration: "underline", fontFamily: SANS }}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submit Modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div style={{ background: C.bg, borderRadius: 14, padding: "28px 28px 24px", width: "100%", maxWidth: 460, boxShadow: "0 12px 48px rgba(26,26,26,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, color: C.ink, margin: 0 }}>Submit Expense Claim</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", fontSize: 20, color: C.muted, cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Title *</label>
                <input required style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Flight to Tirana — Q2 conference" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Amount ($) *</label>
                  <input required type="number" min={0} step="0.01" style={inputStyle} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Department</label>
                <select style={inputStyle} value={form.department} onChange={e => setForm({ ...form, department: e.target.value as typeof DEPTS[number] })}>
                  {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Balance category picker */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Deduct from account</label>
                <select
                  style={inputStyle}
                  value={form.balanceCat}
                  onChange={e => setForm({ ...form, balanceCat: e.target.value as BalanceCategoryKey | "" })}
                >
                  <option value="">— No deduction —</option>
                  {BALANCE_CATS.map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
                {form.balanceCat && (
                  <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                    Amount will be debited from <strong>{BALANCE_CATS.find(c => c.key === form.balanceCat)?.label}</strong> when the claim is approved.
                  </p>
                )}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Notes</label>
                <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional details…" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Receipt (optional)</label>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setSelectedFile(e.target.files?.[0] ?? null)} style={{ fontSize: 13, color: C.muted }} />
              </div>
              <button type="submit" disabled={submitting} style={{ width: "100%", padding: 11, borderRadius: 8, border: "none", background: submitting ? C.muted : C.ink, color: C.bg, fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}>
                {submitting ? "Submitting…" : "Submit Claim"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
