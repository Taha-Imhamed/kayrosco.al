import { useEffect, useState } from "react";
import {
  BalanceAccount, BalanceCategoryKey,
  getAccounts, addAccount, updateAccount, deleteAccount,
  applyTx, getAccountTxs, BalanceTx, exportBalanceCSV,
} from "@/lib/balanceStore";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const C = {
  bg:           "#F4F4F5",
  surface:      "#FFFFFF",
  surface2:     "#FAFAFA",
  ink:          "#09090B",
  ink2:         "#18181B",
  ink3:         "#3F3F46",
  muted:        "#71717A",
  hair:         "rgba(0,0,0,0.07)",
  accent:       "#2563EB",
  accentTint:   "rgba(37,99,235,0.10)",
  positive:     "#16A34A",
  positiveTint: "rgba(22,163,74,0.10)",
  warning:      "#D97706",
  info:         "#3B82F6",
  danger:       "#DC2626",
  dangerTint:   "rgba(220,38,38,0.10)",
};
const SANS = "'Geist', ui-sans-serif, -apple-system, sans-serif";
const MONO = "'Geist Mono', ui-monospace, monospace";

// ── Category SVG icons ────────────────────────────────────────────────────────
const CatIcon = {
  assets: ({ color }: { color: string }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  liquid: ({ color }: { color: string }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  stocks: ({ color }: { color: string }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  bank: ({ color }: { color: string }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22"/>
      <line x1="6" y1="18" x2="6" y2="11"/>
      <line x1="10" y1="18" x2="10" y2="11"/>
      <line x1="14" y1="18" x2="14" y2="11"/>
      <line x1="18" y1="18" x2="18" y2="11"/>
      <polygon points="12 2 20 7 4 7"/>
    </svg>
  ),
  other: ({ color }: { color: string }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
};

interface CatConfig {
  key:    BalanceCategoryKey;
  label:  string;
  Icon:   (props: { color: string }) => JSX.Element;
  color:  string;
  tint:   string;
  border: string;
}

const CATS: CatConfig[] = [
  { key: "assets", label: "Assets",  Icon: CatIcon.assets, color: "#3B82F6", tint: "#EFF6FF", border: "rgba(59,130,246,0.20)"  },
  { key: "liquid", label: "Liquid",  Icon: CatIcon.liquid, color: "#16A34A", tint: "#ECFDF5", border: "rgba(16,185,129,0.20)"  },
  { key: "stocks", label: "Stocks",  Icon: CatIcon.stocks, color: "#D97706", tint: "#FFFBEB", border: "rgba(245,158,11,0.20)"  },
  { key: "bank",   label: "Bank",    Icon: CatIcon.bank,   color: "#2563EB", tint: "rgba(37,99,235,0.10)", border: "rgba(37,99,235,0.20)"  },
  { key: "other",  label: "Other",   Icon: CatIcon.other,  color: "#71717A", tint: "#FAFAFA", border: "rgba(136,146,164,0.20)" },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 7,
  border: `1.5px solid ${C.hair}`, background: C.surface,
  fontSize: 13, fontFamily: SANS, color: C.ink, outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontFamily: MONO,
  color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5,
};

// ── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: C.bg, borderRadius: 14, padding: "28px 28px 24px", width: "100%", maxWidth: 420, boxShadow: "0 12px 48px rgba(26,26,26,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, color: C.ink, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: C.muted, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Tx row ───────────────────────────────────────────────────────────────────
function TxRow({ tx }: { tx: BalanceTx }) {
  const isCredit = tx.type === "credit";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${C.hair}` }}>
      <span style={{
        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        background: isCredit ? C.positiveTint : C.dangerTint,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, color: isCredit ? C.positive : C.danger,
      }}>
        {isCredit ? "+" : "−"}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, color: C.ink, margin: 0, fontFamily: SANS, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.label}</p>
        <p style={{ fontSize: 10, color: C.muted, margin: 0, fontFamily: MONO }}>{new Date(tx.created_at).toLocaleString()} · {tx.created_by}</p>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: isCredit ? C.positive : C.danger, whiteSpace: "nowrap" }}>
        {isCredit ? "+" : "−"}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AdminBalance() {
  const { admin } = useAdminAuth();
  const [accounts, setAccounts] = useState<BalanceAccount[]>([]);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  // ── Add account modal
  const [showAdd, setShowAdd]   = useState(false);
  const [addForm, setAddForm]   = useState({ name: "", category: "liquid" as BalanceCategoryKey, note: "", initialBalance: "" });

  // ── Transaction modal
  const [txAccount, setTxAccount]   = useState<BalanceAccount | null>(null);
  const [txType, setTxType]         = useState<"credit" | "debit">("credit");
  const [txAmount, setTxAmount]     = useState("");
  const [txLabel, setTxLabel]       = useState("");

  // ── Tx history modal
  const [histAccount, setHistAccount]   = useState<BalanceAccount | null>(null);
  const [histTxs, setHistTxs]           = useState<BalanceTx[]>([]);

  // ── Edit account
  const [editAccount, setEditAccount]   = useState<BalanceAccount | null>(null);
  const [editName, setEditName]         = useState("");
  const [editNote, setEditNote]         = useState("");

  // ── Expanded category
  const [expandedCat, setExpandedCat]   = useState<BalanceCategoryKey | null>(null);

  const load = () => setAccounts(getAccounts());
  useEffect(() => { load(); }, []);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const catTotal = (key: BalanceCategoryKey) =>
    accounts.filter((a) => a.category === key).reduce((s, a) => s + a.balance, 0);

  const openAddForCategory = (category: BalanceCategoryKey) => {
    setAddForm((current) => ({ ...current, category }));
    setShowAdd(true);
  };

  const openTxModal = (account: BalanceAccount, type: "credit" | "debit") => {
    setTxAccount(account);
    setTxType(type);
    setTxAmount("");
    setTxLabel("");
  };

  // ── Add account
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      addAccount(
        { name: addForm.name, category: addForm.category, note: addForm.note },
        addForm.initialBalance ? Number(addForm.initialBalance) : 0,
        admin?.username ?? "admin",
      );
      setSuccess("Account created."); setShowAdd(false);
      setAddForm({ name: "", category: "liquid", note: "", initialBalance: "" });
      load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
  };

  // ── Apply transaction
  const handleTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAccount) return;
    setError("");
    try {
      applyTx(txAccount.id, txType, Number(txAmount), txLabel, admin?.username ?? "admin");
      setSuccess(`${txType === "credit" ? "Credit" : "Debit"} applied.`);
      setTxAccount(null); setTxAmount(""); setTxLabel(""); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
  };

  // ── Delete account
  const handleDelete = (account: BalanceAccount) => {
    if (!confirm(`Delete account "${account.name}"? All its transactions will also be deleted.`)) return;
    deleteAccount(account.id); setSuccess("Deleted."); load();
  };

  // ── Edit account
  const openEdit = (a: BalanceAccount) => { setEditAccount(a); setEditName(a.name); setEditNote(a.note); };
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccount) return;
    updateAccount(editAccount.id, { name: editName, note: editNote });
    setSuccess("Updated."); setEditAccount(null); load();
  };

  // ── History
  const openHistory = (a: BalanceAccount) => { setHistAccount(a); setHistTxs(getAccountTxs(a.id, 50)); };

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.ink, margin: 0 }}>Balance</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Financial accounts overview</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportBalanceCSV} style={{ padding: "9px 16px", borderRadius: 8, border: `1px solid ${C.hair}`, background: C.surface2, color: C.muted, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: SANS }}>
            Export CSV
          </button>
          <button onClick={() => setShowAdd(true)} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
            + Account
          </button>
        </div>
      </div>

      {error   && <div style={{ padding: "10px 14px", borderRadius: 8, background: C.dangerTint, border: "1px solid #f5c6c2", color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.10)", border: "1px solid #a9dfbf", color: C.positive, fontSize: 13, marginBottom: 12 }}>{success}</div>}

      {/* ── Grand total ── */}
      <div style={{
        background: C.surface, borderRadius: 14, padding: "22px 26px", marginBottom: 20,
        boxShadow: "0 4px 20px rgba(37,99,235,0.10)",
        borderTop: `4px solid ${C.accent}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <p style={{ fontSize: 11, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Total Balance</p>
          <p style={{ fontSize: 38, fontWeight: 800, color: C.ink, fontFamily: SANS, letterSpacing: "-0.02em", margin: 0 }}>
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <p style={{ fontSize: 11, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.10em" }}>{accounts.length} accounts</p>
        </div>
      </div>

      {/* ── Category sections ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CATS.map((cat) => {
          const catAccounts = accounts.filter((a) => a.category === cat.key);
          const total       = catTotal(cat.key);
          const expanded    = expandedCat === cat.key;

          return (
            <div key={cat.key} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.hair}`, overflow: "hidden" }}>
              {/* Category header */}
              <div
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", cursor: "pointer", userSelect: "none" }}
                onClick={() => setExpandedCat(expanded ? null : cat.key)}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: cat.tint, border: `1px solid ${cat.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <cat.Icon color={cat.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: 14, color: C.ink, margin: 0 }}>{cat.label}</p>
                  <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{catAccounts.length} account{catAccounts.length !== 1 ? "s" : ""}</p>
                </div>
                <p style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, color: cat.color }}>
                  ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); openAddForCategory(cat.key); }}
                  style={{
                    padding: "7px 10px",
                    borderRadius: 7,
                    border: `1px solid ${cat.border}`,
                    background: cat.tint,
                    color: cat.color,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: SANS,
                    whiteSpace: "nowrap",
                  }}
                >
                  + {cat.label}
                </button>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round"
                  style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Expanded account list */}
              {expanded && (
                <div style={{ borderTop: `1px solid ${C.hair}` }}>
                  {catAccounts.length === 0 ? (
                    <div style={{ padding: "16px 18px", textAlign: "center" }}>
                      <p style={{ color: C.muted, fontSize: 13, margin: "0 0 10px" }}>No accounts in this category.</p>
                      <button
                        onClick={() => openAddForCategory(cat.key)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: `1px solid ${cat.border}`,
                          background: cat.tint,
                          color: cat.color,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: SANS,
                        }}
                      >
                        Create {cat.label} account
                      </button>
                    </div>
                  ) : (
                    catAccounts.map((acc, i) => (
                      <div key={acc.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderTop: i === 0 ? "none" : `1px solid ${C.hair}`, background: i % 2 === 0 ? "transparent" : "rgba(207,200,185,0.07)", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: 13, color: C.ink, margin: 0 }}>{acc.name}</p>
                          {acc.note && <p style={{ fontSize: 11, color: C.muted, margin: 0, marginTop: 1 }}>{acc.note}</p>}
                        </div>
                        <p style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: acc.balance >= 0 ? C.ink : C.danger, whiteSpace: "nowrap" }}>
                          {acc.balance < 0 ? "−" : ""}${Math.abs(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <button onClick={() => openHistory(acc)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 11, textDecoration: "underline", fontFamily: SANS }}>History</button>
                          <button onClick={() => openTxModal(acc, "credit")} style={{ padding: "6px 10px", borderRadius: 7, border: `1px solid ${C.positive}`, background: C.positiveTint, color: C.positive, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: SANS }}>+ Add</button>
                          <button onClick={() => { setTxAccount(acc); setTxType("debit"); setTxAmount(""); setTxLabel(""); }} style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 11, textDecoration: "underline", fontFamily: SANS }}>− Debit</button>
                          <button onClick={() => openTxModal(acc, "debit")} style={{ padding: "6px 10px", borderRadius: 7, border: `1px solid ${C.danger}`, background: C.dangerTint, color: C.danger, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: SANS }}>- Subtract</button>
                          <button onClick={() => openEdit(acc)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 11, textDecoration: "underline", fontFamily: SANS }}>Edit</button>
                          <button onClick={() => handleDelete(acc)} style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 11, textDecoration: "underline", fontFamily: SANS }}>Del</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Add Account Modal ── */}
      {showAdd && (
        <Modal title="New Account" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Account Name *</label>
              <input required style={inputStyle} value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="e.g. Chase Business Checking" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value as BalanceCategoryKey })}>
                {CATS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Opening Balance ($)</label>
              <input type="number" step="0.01" style={inputStyle} value={addForm.initialBalance} onChange={(e) => setAddForm({ ...addForm, initialBalance: e.target.value })} placeholder="0.00" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Note</label>
              <input style={inputStyle} value={addForm.note} onChange={(e) => setAddForm({ ...addForm, note: e.target.value })} placeholder="Optional description" />
            </div>
            <button type="submit" style={{ width: "100%", padding: 11, borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Create Account
            </button>
          </form>
        </Modal>
      )}

      {/* ── Transaction Modal ── */}
      {txAccount && (
        <Modal title={txType === "credit" ? `Credit: ${txAccount.name}` : `Debit: ${txAccount.name}`} onClose={() => setTxAccount(null)}>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {(["credit", "debit"] as const).map((t) => (
              <button key={t} onClick={() => setTxType(t)} style={{
                flex: 1, padding: "8px", borderRadius: 7, border: "none", cursor: "pointer",
                background: txType === t ? (t === "credit" ? C.positive : C.danger) : C.surface2,
                color: txType === t ? "#fff" : C.muted, fontSize: 13, fontWeight: 600, fontFamily: SANS,
              }}>
                {t === "credit" ? "+ Credit" : "− Debit"}
              </button>
            ))}
          </div>
          <form onSubmit={handleTx}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Amount ($) *</label>
              <input required type="number" min={0.01} step="0.01" style={inputStyle} value={txAmount} onChange={(e) => setTxAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Description *</label>
              <input required style={inputStyle} value={txLabel} onChange={(e) => setTxLabel(e.target.value)} placeholder="e.g. Client payment — May 2026" />
            </div>
            <button type="submit" style={{ width: "100%", padding: 11, borderRadius: 8, border: "none", background: txType === "credit" ? C.positive : C.danger, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Apply {txType === "credit" ? "Credit" : "Debit"}
            </button>
          </form>
        </Modal>
      )}

      {/* ── History Modal ── */}
      {histAccount && (
        <Modal title={`History: ${histAccount.name}`} onClose={() => setHistAccount(null)}>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
            Current balance: <strong style={{ color: C.ink }}>
              ${histAccount.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </p>
          {histTxs.length === 0 ? (
            <p style={{ textAlign: "center", color: C.muted, padding: "20px 0" }}>No transactions yet.</p>
          ) : (
            histTxs.map((tx) => <TxRow key={tx.id} tx={tx} />)
          )}
        </Modal>
      )}

      {/* ── Edit Account Modal ── */}
      {editAccount && (
        <Modal title={`Edit: ${editAccount.name}`} onClose={() => setEditAccount(null)}>
          <form onSubmit={handleEdit}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Account Name *</label>
              <input required style={inputStyle} value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Note</label>
              <input style={inputStyle} value={editNote} onChange={(e) => setEditNote(e.target.value)} />
            </div>
            <button type="submit" style={{ width: "100%", padding: 11, borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Save Changes
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
