import { useEffect, useState } from "react";
import {
  BudgetEntry,
  getBudget,
  createBudgetEntry,
  adjustBudgetSpent,
  updateBudgetEntry,
  deleteBudgetEntry,
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

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CATEGORIES = ["General","Marketing","Operations","Technology","Travel","Consulting","Salaries","Other"];

function pct(spent: number, allocated: number) {
  if (!allocated) return 0;
  return Math.round((spent / allocated) * 100);
}

function BudgetBar({ spent, allocated }: { spent: number; allocated: number }) {
  const p = Math.min(pct(spent, allocated), 100);
  const color = p >= 100 ? "#EF4444" : p >= 80 ? "#F59E0B" : "#10B981";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.hair, overflow: "hidden" }}>
        <div style={{ width: `${p}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.3s" }} />
      </div>
      <span style={{ fontSize: 10, fontFamily: "'Geist Mono', ui-monospace, monospace", color, minWidth: 30 }}>{p}%</span>
    </div>
  );
}

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

export default function AdminBudget() {
  const { admin } = useAdminAuth();
  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ month: filterMonth, year: filterYear, category: "General", allocated_amount: "", notes: "" });
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [adjustDelta, setAdjustDelta] = useState("");

  const load = () => {
    setLoading(true);
    getBudget(filterYear, filterMonth)
      .then(setEntries)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterYear, filterMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalAllocated = entries.reduce((s, e) => s + Number(e.allocated_amount), 0);
  const totalSpent = entries.reduce((s, e) => s + Number(e.spent_amount), 0);

  const handleAdd = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(""); setSuccess("");
    try {
      await createBudgetEntry({
        month: Number(form.month),
        year: Number(form.year),
        category: form.category,
        allocated_amount: Number(form.allocated_amount),
        notes: form.notes || undefined,
      });
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Added budget entry: ${form.category} ${MONTHS[Number(form.month) - 1]} ${form.year}`, "create", admin?.department);
      setSuccess("Budget entry added.");
      setShowAdd(false);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed.");
    }
  };

  const handleAdjust = async (id: string, sign: 1 | -1) => {
    const delta = Number(adjustDelta);
    if (!delta || isNaN(delta)) { setError("Enter a valid amount."); return; }
    setError(""); setSuccess("");
    try {
      await adjustBudgetSpent(id, sign * delta);
      const entry = entries.find((e) => e.id === id);
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Adjusted budget spent: ${sign > 0 ? "+" : "-"}$${delta} (${entry?.category})`, "edit", admin?.department);
      setSuccess("Budget updated.");
      setAdjustId(null);
      setAdjustDelta("");
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed.");
    }
  };

  const handleDelete = async (id: string, category: string) => {
    if (!confirm(`Delete budget entry "${category}"?`)) return;
    try {
      await deleteBudgetEntry(id);
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Deleted budget entry: ${category}`, "delete", admin?.department);
      setSuccess("Entry deleted.");
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed.");
    }
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontFamily: "'Geist Mono', ui-monospace, monospace",
    color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5,
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Geist', ui-sans-serif, -apple-system, sans-serif", fontWeight: 600, fontSize: 28, color: C.ink, margin: 0 }}>Budget</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            {MONTHS[filterMonth - 1]} {filterYear} — Allocated: ${totalAllocated.toLocaleString()} / Spent: ${totalSpent.toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          + Add Entry
        </button>
      </div>

      {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.10)", border: "1px solid #f5c6c2", color: "#EF4444", fontSize: 13, marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.10)", border: "1px solid #a9dfbf", color: "#10B981", fontSize: 13, marginBottom: 12 }}>{success}</div>}

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))} style={{ ...inputStyle, width: 120 }}>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} style={{ ...inputStyle, width: 100 }}>
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Allocated", value: `$${totalAllocated.toLocaleString()}` },
          { label: "Total Spent", value: `$${totalSpent.toLocaleString()}` },
          { label: "Balance", value: `$${(totalAllocated - totalSpent).toLocaleString()}` },
        ].map((card) => (
          <div key={card.label} style={{ background: C.surface2, borderRadius: 10, padding: "16px 18px", border: `1px solid ${C.hair}` }}>
            <p style={{ fontSize: 10, fontFamily: "'Geist Mono', ui-monospace, monospace", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{card.label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: C.ink }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: C.surface2, borderRadius: 12, border: `1px solid ${C.hair}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["Category", "Allocated", "Spent", "Balance", "Variance", "Progress", "Notes", ""].map((h) => (
                <th key={h} style={{ padding: "10px 16px", fontWeight: 600, color: C.muted, fontSize: 11, fontFamily: "'Geist Mono', ui-monospace, monospace", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${C.hair}`, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 20, color: C.muted, textAlign: "center" }}>Loading…</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 20, color: C.muted, textAlign: "center" }}>No entries for this period.</td></tr>
            ) : (
              entries.map((entry, i) => {
                const balance = Number(entry.allocated_amount) - Number(entry.spent_amount);
                const p = pct(Number(entry.spent_amount), Number(entry.allocated_amount));
                return (
                  <tr key={entry.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.hair}` }}>
                    <td style={{ padding: "11px 16px", fontWeight: 600, color: C.ink }}>{entry.category}</td>
                    <td style={{ padding: "11px 16px", color: C.muted }}>${Number(entry.allocated_amount).toLocaleString()}</td>
                    <td style={{ padding: "11px 16px", color: C.muted }}>${Number(entry.spent_amount).toLocaleString()}</td>
                    <td style={{ padding: "11px 16px", color: balance >= 0 ? "#10B981" : "#EF4444", fontWeight: 600 }}>${balance.toLocaleString()}</td>
                    <td style={{ padding: "11px 16px", color: p >= 100 ? "#EF4444" : p >= 80 ? "#F59E0B" : "#10B981" }}>{p}%</td>
                    <td style={{ padding: "11px 16px", minWidth: 140 }}>
                      <BudgetBar spent={Number(entry.spent_amount)} allocated={Number(entry.allocated_amount)} />
                    </td>
                    <td style={{ padding: "11px 16px", color: C.muted, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.notes ?? "—"}</td>
                    <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                      {adjustId === entry.id ? (
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <input
                            type="number"
                            min={0}
                            value={adjustDelta}
                            onChange={(e) => setAdjustDelta(e.target.value)}
                            placeholder="Amount"
                            style={{ ...inputStyle, width: 80, padding: "5px 8px", fontSize: 12 }}
                          />
                          <button onClick={() => handleAdjust(entry.id, 1)} style={{ padding: "4px 8px", borderRadius: 5, border: "none", background: "#10B981", color: "#fff", cursor: "pointer", fontSize: 11 }}>+</button>
                          <button onClick={() => handleAdjust(entry.id, -1)} style={{ padding: "4px 8px", borderRadius: 5, border: "none", background: "#EF4444", color: "#fff", cursor: "pointer", fontSize: 11 }}>−</button>
                          <button onClick={() => { setAdjustId(null); setAdjustDelta(""); }} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12 }}>✕</button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => setAdjustId(entry.id)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, textDecoration: "underline", marginRight: 8 }}>Adjust</button>
                          <button onClick={() => handleDelete(entry.id, entry.category)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAdd(false); }}
        >
          <div style={{ background: C.bg, borderRadius: 14, padding: "28px 28px 24px", width: "100%", maxWidth: 420, boxShadow: "0 12px 48px rgba(26,26,26,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Geist', ui-sans-serif, -apple-system, sans-serif", fontWeight: 600, fontSize: 20, color: C.ink, margin: 0 }}>Add Budget Entry</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", fontSize: 20, color: C.muted, cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleAdd}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Month</label>
                  <select style={inputStyle} value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}>
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Year</label>
                  <input type="number" style={inputStyle} value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Category</label>
                <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Allocated Amount ($)</label>
                <input required type="number" min={0} style={inputStyle} value={form.allocated_amount} onChange={(e) => setForm({ ...form, allocated_amount: e.target.value })} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Notes</label>
                <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <button type="submit" style={{ width: "100%", padding: "11px", borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Save Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

