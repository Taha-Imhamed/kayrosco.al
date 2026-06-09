import { useEffect, useState, useMemo } from "react";
import {
  RevenueEntry,
  getRevenue,
  createRevenueEntry,
  updateRevenueEntry,
  deleteRevenueEntry,
  logActivity,
} from "@/lib/adminApi";
import { applyTx, getAccounts, addAccount, BalanceCategoryKey } from "@/lib/balanceStore";
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

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DEPT_COLORS: Record<string, string> = { tech: C.info, consulting: C.accent, travel: C.positive };

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 7,
  border: `1.5px solid ${C.hair}`, background: C.surface,
  fontSize: 13, fontFamily: SANS, color: C.ink, outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontFamily: "'Geist Mono', ui-monospace, monospace",
  color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5,
};

type DeptKey = "tech" | "consulting" | "travel";
const DEPTS: DeptKey[] = ["tech", "consulting", "travel"];

// Fixed balance categories — always available
const BALANCE_CATS: { key: BalanceCategoryKey; label: string }[] = [
  { key: "assets", label: "Assets" },
  { key: "liquid", label: "Liquid / Cash" },
  { key: "stocks", label: "Stocks" },
  { key: "bank",   label: "Bank" },
  { key: "other",  label: "Other" },
];

function resolveOrCreateAccount(catKey: BalanceCategoryKey, catLabel: string, username: string): string {
  const accounts = getAccounts();
  const found = accounts.find(a => a.category === catKey);
  if (found) return found.id;
  const created = addAccount({ name: catLabel, category: catKey, note: "Auto-created from revenue" }, 0, username);
  return created.id;
}

function BarChart({ data }: { data: { month: number; tech: number; consulting: number; travel: number }[] }) {
  const max = Math.max(...data.flatMap(d => [d.tech, d.consulting, d.travel]), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 180, padding: "0 4px" }}>
      {data.map((d) => {
        const total = d.tech + d.consulting + d.travel;
        return (
          <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 9, color: C.muted, fontFamily: "'Geist Mono', ui-monospace, monospace" }}>
              ${total >= 1000 ? `${(total / 1000).toFixed(0)}k` : total}
            </span>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", gap: 1 }}>
              {(["travel", "consulting", "tech"] as DeptKey[]).map((dept) => {
                const h = Math.round((d[dept] / max) * 140);
                return h > 0 ? (
                  <div
                    key={dept}
                    title={`${dept}: $${d[dept].toLocaleString()}`}
                    style={{
                      height: h, background: DEPT_COLORS[dept], borderRadius: 2,
                      opacity: 0.85, transition: "height 0.3s",
                    }}
                  />
                ) : null;
              })}
            </div>
            <span style={{ fontSize: 9, color: C.muted, fontFamily: "'Geist Mono', ui-monospace, monospace" }}>
              {MONTHS[d.month - 1]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminRevenue() {
  const { admin } = useAdminAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [entries, setEntries] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editEntry, setEditEntry] = useState<RevenueEntry | null>(null);
  const [form, setForm] = useState({
    month: now.getMonth() + 1, year: now.getFullYear(),
    department: "tech" as DeptKey, amount: "", description: "",
    balanceCat: "" as BalanceCategoryKey | "",
  });

  const load = () => {
    setLoading(true);
    getRevenue(year).then(setEntries).catch(e => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [year]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build chart data: 12 months x 3 depts
  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthEntries = entries.filter(e => e.month === month && e.year === year);
      return {
        month,
        tech: monthEntries.filter(e => e.department === "tech").reduce((s, e) => s + Number(e.amount), 0),
        consulting: monthEntries.filter(e => e.department === "consulting").reduce((s, e) => s + Number(e.amount), 0),
        travel: monthEntries.filter(e => e.department === "travel").reduce((s, e) => s + Number(e.amount), 0),
      };
    });
  }, [entries, year]);

  const totalByDept = useMemo(() => ({
    tech: entries.filter(e => e.department === "tech").reduce((s, e) => s + Number(e.amount), 0),
    consulting: entries.filter(e => e.department === "consulting").reduce((s, e) => s + Number(e.amount), 0),
    travel: entries.filter(e => e.department === "travel").reduce((s, e) => s + Number(e.amount), 0),
  }), [entries]);
  const grandTotal = totalByDept.tech + totalByDept.consulting + totalByDept.travel;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    try {
      const chosenCat = BALANCE_CATS.find(c => c.key === form.balanceCat);
      await createRevenueEntry({
        month: Number(form.month), year: Number(form.year),
        department: form.department, amount: Number(form.amount),
        description: form.description || undefined,
        // Store category key as account-id so it can be looked up later
        balanceAccountId:   chosenCat?.key,
        balanceAccountName: chosenCat?.label,
        createdBy: admin?.id ?? null, createdByUsername: admin?.username ?? "admin",
      });
      // Credit balance account immediately
      if (chosenCat) {
        const realAccountId = resolveOrCreateAccount(
          chosenCat.key, chosenCat.label, admin?.username ?? "admin",
        );
        applyTx(
          realAccountId, "credit", Number(form.amount),
          `Revenue: ${form.department} ${MONTHS[Number(form.month) - 1]} ${form.year}`,
          admin?.username ?? "admin",
        );
      }
      logActivity(admin?.id ?? null, admin?.username ?? "admin", `Added revenue: ${form.department} ${MONTHS[Number(form.month) - 1]} ${form.year} $${form.amount}`, "create", admin?.department);
      setSuccess(`Revenue entry added${chosenCat ? ` — $${Number(form.amount).toLocaleString()} credited to ${chosenCat.label}` : ""}.`);
      setShowAdd(false);
      setForm({ month: now.getMonth() + 1, year: now.getFullYear(), department: "tech", amount: "", description: "", balanceCat: "" });
      load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editEntry) return;
    setError(""); setSuccess("");
    try {
      await updateRevenueEntry(editEntry.id, { amount: Number(form.amount), description: form.description || undefined });
      logActivity(admin?.id ?? null, admin?.username ?? "admin", `Updated revenue entry`, "edit", admin?.department);
      setSuccess("Updated."); setEditEntry(null); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
  };

  const handleDelete = async (entry: RevenueEntry) => {
    if (!confirm(`Delete revenue entry $${entry.amount} (${entry.department} ${MONTHS[entry.month - 1]})?`)) return;
    try {
      await deleteRevenueEntry(entry.id);
      logActivity(admin?.id ?? null, admin?.username ?? "admin", `Deleted revenue entry`, "delete", admin?.department);
      setSuccess("Deleted."); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
  };

  const openEdit = (entry: RevenueEntry) => {
    setEditEntry(entry);
    setForm({ month: entry.month, year: entry.year, department: entry.department, amount: String(entry.amount), description: entry.description ?? "", balanceCat: "" });
  };

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Geist', ui-sans-serif, -apple-system, sans-serif", fontWeight: 600, fontSize: 28, color: C.ink, margin: 0 }}>Revenue</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Monthly revenue by department — {year}</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ ...inputStyle, width: 100 }}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {admin?.role === "admin" && (
            <button onClick={() => setShowAdd(true)} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              + Add Entry
            </button>
          )}
        </div>
      </div>

      {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.10)", border: "1px solid #f5c6c2", color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.10)", border: "1px solid #a9dfbf", color: "#16A34A", fontSize: 13, marginBottom: 12 }}>{success}</div>}

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Grand Total", value: grandTotal, color: C.ink },
          { label: "Tech", value: totalByDept.tech, color: C.info },
          { label: "Consulting", value: totalByDept.consulting, color: C.accent },
          { label: "Travel", value: totalByDept.travel, color: C.positive },
        ].map(card => (
          <div key={card.label} style={{ background: C.surface2, borderRadius: 10, padding: "16px 18px", border: `1px solid ${C.hair}`, borderTop: `3px solid ${card.color}` }}>
            <p style={{ fontSize: 10, fontFamily: "'Geist Mono', ui-monospace, monospace", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{card.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: card.color }}>${card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: C.surface2, borderRadius: 12, border: `1px solid ${C.hair}`, padding: "20px 20px 16px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Monthly Revenue — {year}</p>
          <div style={{ display: "flex", gap: 16 }}>
            {DEPTS.map(d => (
              <span key={d} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.muted }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: DEPT_COLORS[d], display: "inline-block" }} />
                {d}
              </span>
            ))}
          </div>
        </div>
        {loading ? <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>Loading…</div> : <BarChart data={chartData} />}
      </div>

      {/* Table */}
      <div style={{ background: C.surface2, borderRadius: 12, border: `1px solid ${C.hair}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["Month", "Year", "Department", "Amount", "Description", "Added By", ""].map(h => (
                <th key={h} style={{ padding: "10px 16px", fontWeight: 600, color: C.muted, fontSize: 11, fontFamily: "'Geist Mono', ui-monospace, monospace", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${C.hair}`, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 20, color: C.muted, textAlign: "center" }}>Loading…</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 20, color: C.muted, textAlign: "center" }}>No revenue entries for {year}.</td></tr>
            ) : entries.map((entry, i) => (
              <tr key={entry.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.hair}` }}>
                <td style={{ padding: "11px 16px", color: C.ink }}>{MONTHS[entry.month - 1]}</td>
                <td style={{ padding: "11px 16px", color: C.muted, fontFamily: "'Geist Mono', ui-monospace, monospace" }}>{entry.year}</td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{ padding: "2px 10px", borderRadius: 100, fontSize: 11, fontFamily: "'Geist Mono', ui-monospace, monospace", fontWeight: 600, border: `1px solid ${DEPT_COLORS[entry.department]}`, color: DEPT_COLORS[entry.department] }}>{entry.department}</span>
                </td>
                <td style={{ padding: "11px 16px", fontWeight: 700, color: C.ink }}>${Number(entry.amount).toLocaleString()}</td>
                <td style={{ padding: "11px 16px", color: C.muted, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.description ?? "—"}</td>
                <td style={{ padding: "11px 16px", color: C.muted, fontSize: 12 }}>{entry.created_by_username ?? "—"}</td>
                <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                  {admin?.role === "admin" && (
                    <>
                      <button onClick={() => openEdit(entry)} style={{ background: "none", border: "none", color: C.info, cursor: "pointer", fontSize: 12, textDecoration: "underline", marginRight: 8 }}>Edit</button>
                      <button onClick={() => handleDelete(entry)} style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {(showAdd || editEntry) && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={e => { if (e.target === e.currentTarget) { setShowAdd(false); setEditEntry(null); } }}>
          <div style={{ background: C.bg, borderRadius: 14, padding: "28px 28px 24px", width: "100%", maxWidth: 420, boxShadow: "0 12px 48px rgba(26,26,26,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Geist', ui-sans-serif, -apple-system, sans-serif", fontWeight: 600, fontSize: 20, color: C.ink, margin: 0 }}>{editEntry ? "Edit Entry" : "Add Revenue Entry"}</h2>
              <button onClick={() => { setShowAdd(false); setEditEntry(null); }} style={{ background: "none", border: "none", fontSize: 20, color: C.muted, cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={editEntry ? handleEdit : handleAdd}>
              {!editEntry && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Month</label>
                    <select style={inputStyle} value={form.month} onChange={e => setForm({ ...form, month: Number(e.target.value) })}>
                      {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Year</label>
                    <input type="number" style={inputStyle} value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} />
                  </div>
                </div>
              )}
              {!editEntry && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Department</label>
                  <select style={inputStyle} value={form.department} onChange={e => setForm({ ...form, department: e.target.value as DeptKey })}>
                    {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Amount ($)</label>
                <input required type="number" min={0} step="0.01" style={inputStyle} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Description</label>
                <input type="text" style={inputStyle} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional note…" />
              </div>
              {!editEntry && (
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Credit to account</label>
                  <select
                    style={inputStyle}
                    value={form.balanceCat}
                    onChange={e => setForm({ ...form, balanceCat: e.target.value as BalanceCategoryKey | "" })}
                  >
                    <option value="">— No credit —</option>
                    {BALANCE_CATS.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                  {form.balanceCat && (
                    <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                      Amount will be credited to <strong>{BALANCE_CATS.find(c => c.key === form.balanceCat)?.label}</strong> immediately on save.
                    </p>
                  )}
                </div>
              )}
              <button type="submit" style={{ width: "100%", padding: 11, borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                {editEntry ? "Save Changes" : "Add Entry"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
