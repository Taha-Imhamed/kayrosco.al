import { useEffect, useState } from "react";
import {
  Deal, getDeals, createDeal, updateDeal, deleteDeal,
  Client, getClients,
  logActivity,
} from "@/lib/adminApi";
import { applyTx, getAccounts, addAccount } from "@/lib/balanceStore";
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

const DEPTS = ["tech", "consulting", "travel", "admin"] as const;
type DeptKey = typeof DEPTS[number];

const DEPT_COLOR: Record<string, string> = {
  tech:       C.info,
  consulting: C.accent,
  travel:     C.positive,
  admin:      C.muted,
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

// ── Move payment to Balance Store ─────────────────────────────────────────────
function moveToBalance(deal: Deal, byUsername: string) {
  const amount = deal.payment_amount ?? deal.expected_value;
  const accounts = getAccounts();
  let target = accounts.find(
    (a) => a.name === "Contract Revenue" && a.category === "liquid"
  );
  if (!target) {
    target = addAccount(
      { name: "Contract Revenue", category: "liquid", note: "Auto-created for deal payments" },
      0,
      byUsername,
    );
  }
  applyTx(
    target.id,
    "credit",
    amount,
    `Deal payment: ${deal.title}`,
    byUsername,
  );
}

// ── DueBadge ─────────────────────────────────────────────────────────────────
function DueBadge({ dueDate }: { dueDate: string | null }) {
  if (!dueDate) return <span style={{ color: C.muted, fontSize: 11 }}>No due date</span>;
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  const color = days < 0 ? C.danger : days <= 7 ? "#F59E0B" : days <= 30 ? C.info : C.positive;
  const label = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `${days}d left`;
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 100, fontSize: 10, fontFamily: MONO,
      fontWeight: 600, background: `${color}18`, color, border: `1px solid ${color}40`,
    }}>
      {new Date(dueDate).toLocaleDateString()} · {label}
    </span>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.bg, borderRadius: 14, padding: "28px 28px 24px", width: "100%", maxWidth: wide ? 560 : 440, boxShadow: "0 12px 48px rgba(26,26,26,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, color: C.ink, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: C.muted, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminContractValue() {
  const { admin } = useAdminAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── New deal modal state
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({
    title: "", description: "", client_id: "", department: "admin" as DeptKey,
    expected_value: "", due_date: "",
  });
  const [saving, setSaving] = useState(false);

  // ── Payment modal state
  const [payDeal, setPayDeal] = useState<Deal | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payToBalance, setPayToBalance] = useState(true);
  const [paySubmitting, setPaySubmitting] = useState(false);

  // ── Edit modal state
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [editForm, setEditForm] = useState({
    title: "", description: "", department: "admin" as DeptKey,
    expected_value: "", due_date: "",
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      getDeals({ archived: tab === "archived" }),
      getClients(),
    ])
      .then(([d, c]) => { setDeals(d); setClients(c); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Summary stats
  const active = deals.filter((d) => !d.is_archived);
  const totalExpected = active.reduce((s, d) => s + Number(d.expected_value), 0);
  const totalReceived = active.filter((d) => d.payment_received).reduce((s, d) => s + Number(d.payment_amount ?? d.expected_value), 0);
  const pendingCount  = active.filter((d) => !d.is_done).length;

  // ── Create deal
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      const cl = clients.find((c) => c.id === newForm.client_id);
      await createDeal({
        title:          newForm.title,
        description:    newForm.description || undefined,
        client_id:      newForm.client_id || undefined,
        client_name:    cl?.name,
        department:     newForm.department,
        expected_value: Number(newForm.expected_value),
        due_date:       newForm.due_date || undefined,
        created_by:           admin?.id ?? undefined,
        created_by_username:  admin?.username,
      });
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Created deal: ${newForm.title}`, "create", admin?.department);
      setSuccess("Deal created."); setShowNew(false);
      setNewForm({ title: "", description: "", client_id: "", department: "admin", expected_value: "", due_date: "" });
      load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
    finally { setSaving(false); }
  };

  // ── Mark done
  const handleMarkDone = async (deal: Deal) => {
    if (!confirm(`Mark "${deal.title}" as done?`)) return;
    try {
      await updateDeal(deal.id, { is_done: true });
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Marked deal done: ${deal.title}`, "edit", admin?.department);
      setSuccess("Marked as done."); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
  };

  // ── Payment received
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payDeal) return;
    setError(""); setPaySubmitting(true);
    try {
      const amount = Number(payAmount) || Number(payDeal.expected_value);
      await updateDeal(payDeal.id, {
        payment_received: true,
        payment_amount:   amount,
        payment_date:     new Date().toISOString(),
      });
      if (payToBalance) {
        moveToBalance({ ...payDeal, payment_amount: amount }, admin?.username ?? "admin");
        await updateDeal(payDeal.id, { payment_added_to_balance: true });
      }
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Payment received for deal: ${payDeal.title} $${amount}`, "edit", admin?.department);
      setSuccess("Payment recorded" + (payToBalance ? " and added to balance." : ".")); setPayDeal(null);
      load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
    finally { setPaySubmitting(false); }
  };

  // ── Archive
  const handleArchive = async (deal: Deal) => {
    if (!confirm(`Archive "${deal.title}"? It will move to the archive tab.`)) return;
    try {
      await updateDeal(deal.id, { is_archived: true });
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Archived deal: ${deal.title}`, "edit", admin?.department);
      setSuccess("Archived."); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
  };

  // ── Delete
  const handleDelete = async (deal: Deal) => {
    if (!confirm(`Delete "${deal.title}"? This cannot be undone.`)) return;
    try {
      await deleteDeal(deal.id);
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Deleted deal: ${deal.title}`, "delete", admin?.department);
      setSuccess("Deleted."); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
  };

  // ── Open edit
  const openEdit = (deal: Deal) => {
    setEditDeal(deal);
    setEditForm({
      title:          deal.title,
      description:    deal.description ?? "",
      department:     (deal.department ?? "admin") as DeptKey,
      expected_value: String(deal.expected_value),
      due_date:       deal.due_date ?? "",
    });
  };

  // ── Save edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDeal) return;
    setError(""); setSaving(true);
    try {
      await updateDeal(editDeal.id, {
        title:          editForm.title,
        description:    editForm.description || undefined,
        department:     editForm.department,
        expected_value: Number(editForm.expected_value),
        due_date:       editForm.due_date || undefined,
      });
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Edited deal: ${editDeal.title}`, "edit", admin?.department);
      setSuccess("Deal updated."); setEditDeal(null); load();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
    finally { setSaving(false); }
  };

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.ink, margin: 0 }}>Contract Deals</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Track deals, payments, and revenue</p>
        </div>
        {admin?.role === "admin" && (
          <button onClick={() => setShowNew(true)} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + New Deal
          </button>
        )}
      </div>

      {error   && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.10)", border: "1px solid #f5c6c2", color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.10)", border: "1px solid #a9dfbf", color: C.positive, fontSize: 13, marginBottom: 12 }}>{success}</div>}

      {/* ── Summary cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Expected",   value: `$${totalExpected.toLocaleString()}`, color: C.ink,     bg: C.surface2 },
          { label: "Total Received",   value: `$${totalReceived.toLocaleString()}`, color: C.positive, bg: "rgba(16,185,129,0.08)" },
          { label: "Pending Deals",    value: String(pendingCount),                 color: C.warning,  bg: "rgba(245,158,11,0.08)" },
        ].map((card) => (
          <div key={card.label} style={{ background: card.bg, borderRadius: 10, padding: "16px 18px", border: `1px solid ${C.hair}`, borderTop: `3px solid ${card.color}` }}>
            <p style={{ fontSize: 10, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{card.label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tab toggle ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {(["active", "archived"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: SANS, fontSize: 13, fontWeight: 500,
              background: tab === t ? C.accent : C.surface2,
              color:      tab === t ? "#fff"    : C.muted,
              transition: "all 0.15s",
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Deal list ── */}
      {loading ? (
        <div style={{ textAlign: "center", color: C.muted, padding: 40 }}>Loading…</div>
      ) : deals.length === 0 ? (
        <div style={{ textAlign: "center", color: C.muted, padding: 40, background: C.surface2, borderRadius: 12, border: `1px solid ${C.hair}` }}>
          No {tab} deals.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {deals.map((deal) => {
            const expanded = expandedId === deal.id;
            const dept = deal.department ?? "admin";
            return (
              <div
                key={deal.id}
                style={{
                  background: C.surface, borderRadius: 12,
                  border: `1px solid ${expanded ? C.accent : C.hair}`,
                  overflow: "hidden",
                  boxShadow: expanded ? `0 0 0 3px ${C.accentTint}` : "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "border 0.15s, box-shadow 0.15s",
                }}
              >
                {/* Row header */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", cursor: "pointer" }}
                  onClick={() => setExpandedId(expanded ? null : deal.id)}
                >
                  {/* Status dot */}
                  <span style={{
                    width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                    background: deal.is_done ? C.positive : deal.payment_received ? C.info : C.warning,
                  }} />

                  {/* Title & client */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: 14, color: C.ink, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {deal.title}
                    </p>
                    {deal.client_name && (
                      <p style={{ fontSize: 11, color: C.muted, margin: 0, marginTop: 1 }}>{deal.client_name}</p>
                    )}
                  </div>

                  {/* Dept pill */}
                  <span style={{
                    padding: "2px 9px", borderRadius: 100, fontSize: 10, fontFamily: MONO,
                    fontWeight: 600, border: `1px solid ${DEPT_COLOR[dept]}`, color: DEPT_COLOR[dept],
                  }}>
                    {dept}
                  </span>

                  {/* Expected value */}
                  <p style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: C.ink, whiteSpace: "nowrap" }}>
                    ${Number(deal.expected_value).toLocaleString()}
                  </p>

                  {/* Status badges */}
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {deal.is_done && (
                      <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 10, fontFamily: MONO, fontWeight: 600, background: C.positiveTint, color: C.positive }}>Done</span>
                    )}
                    {deal.payment_received && (
                      <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 10, fontFamily: MONO, fontWeight: 600, background: "rgba(59,130,246,0.10)", color: C.info }}>Paid</span>
                    )}
                    {deal.payment_added_to_balance && (
                      <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 10, fontFamily: MONO, fontWeight: 600, background: C.accentTint, color: C.accent }}>In Balance</span>
                    )}
                  </div>

                  {/* Expand chevron */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round"
                    style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {/* Expanded panel */}
                {expanded && (
                  <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${C.hair}` }}>
                    <div style={{ paddingTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

                      {/* Description */}
                      {deal.description && (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <p style={labelStyle}>Description</p>
                          <p style={{ fontSize: 13, color: C.ink2, margin: 0, lineHeight: 1.6 }}>{deal.description}</p>
                        </div>
                      )}

                      {/* Due date */}
                      <div>
                        <p style={labelStyle}>Due Date</p>
                        <DueBadge dueDate={deal.due_date ?? null} />
                      </div>

                      {/* Payment info */}
                      {deal.payment_received && (
                        <div>
                          <p style={labelStyle}>Payment Received</p>
                          <p style={{ fontSize: 14, fontWeight: 700, color: C.positive, margin: 0 }}>
                            ${Number(deal.payment_amount ?? deal.expected_value).toLocaleString()}
                            {deal.payment_date && (
                              <span style={{ fontSize: 11, fontFamily: MONO, color: C.muted, fontWeight: 400, marginLeft: 6 }}>
                                on {new Date(deal.payment_date).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                        </div>
                      )}

                      {/* Created by */}
                      <div>
                        <p style={labelStyle}>Created by</p>
                        <p style={{ fontSize: 12, color: C.muted, margin: 0, fontFamily: MONO }}>
                          {deal.created_by_username ?? "—"} · {new Date(deal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {admin?.role === "admin" && (
                      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                        {!deal.is_done && (
                          <button onClick={() => handleMarkDone(deal)} style={{ padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.positive}`, background: C.positiveTint, color: C.positive, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                            ✓ Mark Done
                          </button>
                        )}
                        {!deal.payment_received && (
                          <button
                            onClick={() => { setPayDeal(deal); setPayAmount(String(deal.expected_value)); setPayToBalance(true); }}
                            style={{ padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.info}`, background: "rgba(59,130,246,0.08)", color: C.info, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}
                          >
                            $ Payment Received
                          </button>
                        )}
                        {!deal.is_archived && (
                          <button onClick={() => handleArchive(deal)} style={{ padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.hair}`, background: C.surface2, color: C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                            Archive
                          </button>
                        )}
                        <button onClick={() => openEdit(deal)} style={{ padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.hair}`, background: C.surface2, color: C.ink3, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(deal)} style={{ padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.danger}40`, background: C.dangerTint, color: C.danger, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── New Deal Modal ── */}
      {showNew && (
        <Modal title="New Deal" onClose={() => setShowNew(false)} wide>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Title *</label>
              <input required style={inputStyle} value={newForm.title} onChange={(e) => setNewForm({ ...newForm, title: e.target.value })} placeholder="e.g. E-commerce platform build" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })} placeholder="What is this contract about?" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Client</label>
                <select style={inputStyle} value={newForm.client_id} onChange={(e) => setNewForm({ ...newForm, client_id: e.target.value })}>
                  <option value="">— No client —</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Department</label>
                <select style={inputStyle} value={newForm.department} onChange={(e) => setNewForm({ ...newForm, department: e.target.value as DeptKey })}>
                  {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Expected Value ($) *</label>
                <input required type="number" min={0} step="0.01" style={inputStyle} value={newForm.expected_value} onChange={(e) => setNewForm({ ...newForm, expected_value: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label style={labelStyle}>Due Date</label>
                <input type="date" style={inputStyle} value={newForm.due_date} onChange={(e) => setNewForm({ ...newForm, due_date: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={saving} style={{ width: "100%", padding: 11, borderRadius: 8, border: "none", background: saving ? C.muted : C.ink, color: C.bg, fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Creating…" : "Create Deal"}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Payment Modal ── */}
      {payDeal && (
        <Modal title="Record Payment" onClose={() => setPayDeal(null)}>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
            Recording payment for <strong style={{ color: C.ink }}>{payDeal.title}</strong>
          </p>
          <form onSubmit={handlePayment}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Payment Amount ($)</label>
              <input required type="number" min={0} step="0.01" style={inputStyle} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "12px 14px", background: C.accentTint, borderRadius: 8, border: `1px solid ${C.accent}30`, cursor: "pointer" }}
              onClick={() => setPayToBalance((v) => !v)}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${C.accent}`, background: payToBalance ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {payToBalance && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.accent, margin: 0 }}>Add to Balance</p>
                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Credits the "Contract Revenue" account in the Balance sheet</p>
              </div>
            </div>
            <button type="submit" disabled={paySubmitting} style={{ width: "100%", padding: 11, borderRadius: 8, border: "none", background: paySubmitting ? C.muted : C.positive, color: "#fff", fontSize: 14, fontWeight: 600, cursor: paySubmitting ? "not-allowed" : "pointer" }}>
              {paySubmitting ? "Recording…" : "Record Payment"}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {editDeal && (
        <Modal title={`Edit: ${editDeal.title}`} onClose={() => setEditDeal(null)} wide>
          <form onSubmit={handleEdit}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Title *</label>
              <input required style={inputStyle} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Department</label>
                <select style={inputStyle} value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value as DeptKey })}>
                  {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Expected Value ($)</label>
                <input type="number" min={0} step="0.01" style={inputStyle} value={editForm.expected_value} onChange={(e) => setEditForm({ ...editForm, expected_value: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Due Date</label>
              <input type="date" style={inputStyle} value={editForm.due_date} onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })} />
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
