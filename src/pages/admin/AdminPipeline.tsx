import { useEffect, useState } from "react";
import { Contract, getContracts, updateContractMeta } from "@/lib/adminApi";
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

type PipelineStatus = "draft" | "review" | "signed" | "active" | "expired";

const STAGES: PipelineStatus[] = ["draft", "review", "signed", "active", "expired"];

const STAGE_CONFIG: Record<PipelineStatus, { label: string; color: string; bg: string }> = {
  draft:   { label: "Draft",   color: "#8892A4", bg: "rgba(0,0,0,0.04)" },
  review:  { label: "Review",  color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
  signed:  { label: "Signed",  color: "#3B82F6", bg: "rgba(59,130,246,0.10)" },
  active:  { label: "Active",  color: "#10B981", bg: "rgba(16,185,129,0.10)" },
  expired: { label: "Expired", color: "#EF4444", bg: "rgba(239,68,68,0.10)" },
};

const CAT_COLORS: Record<string, string> = { tech: C.info, consulting: C.accent, travel: C.positive };

export default function AdminPipeline() {
  const { admin } = useAdminAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterCat, setFilterCat] = useState<"" | "tech" | "consulting" | "travel">("");
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getContracts(filterCat ? { category: filterCat } : undefined)
      .then(setContracts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filterCat]); // eslint-disable-line react-hooks/exhaustive-deps

  const statusOf = (c: Contract): PipelineStatus =>
    ((c as Contract & { status?: string }).status as PipelineStatus) ?? "active";

  const byStatus = (status: PipelineStatus) => contracts.filter(c => statusOf(c) === status);

  const valueOf = (c: Contract) => Number((c as Contract & { value?: number }).value ?? 0);

  const handleMoveToStage = async (contractId: string, newStatus: PipelineStatus) => {
    setError(""); setSuccess("");
    try {
      await updateContractMeta(contractId, { status: newStatus });
      const c = contracts.find(x => x.id === contractId);
      logActivity(admin?.id ?? null, admin?.username ?? "admin", `Moved contract "${c?.title}" to ${newStatus}`, "edit", admin?.department);
      setSuccess(`Moved to ${newStatus}.`);
      setContracts(prev => prev.map(x => x.id === contractId ? { ...x, status: newStatus } as typeof x : x));
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); }
  };

  // Drag and drop
  const handleDragStart = (contractId: string) => setDraggingId(contractId);
  const handleDrop = (status: PipelineStatus) => {
    if (draggingId && admin?.role === "admin") handleMoveToStage(draggingId, status);
    setDraggingId(null);
  };

  const totalValue = contracts.reduce((s, c) => s + valueOf(c), 0);
  const activeValue = contracts.filter(c => statusOf(c) === "active").reduce((s, c) => s + valueOf(c), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Geist', ui-sans-serif, -apple-system, sans-serif", fontWeight: 600, fontSize: 28, color: C.ink, margin: 0 }}>Contract Pipeline</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Kanban view — drag cards to move between stages (admin only)</p>
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value as typeof filterCat)} style={{ padding: "9px 12px", borderRadius: 7, border: `1.5px solid ${C.hair}`, background: C.surface, fontSize: 13, fontFamily: SANS, color: C.ink, outline: "none" }}>
          <option value="">All Categories</option>
          <option value="tech">Tech</option>
          <option value="consulting">Consulting</option>
          <option value="travel">Travel</option>
        </select>
      </div>

      {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.10)", border: "1px solid #f5c6c2", color: "#EF4444", fontSize: 13, marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.10)", border: "1px solid #a9dfbf", color: "#10B981", fontSize: 13, marginBottom: 12 }}>{success}</div>}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Contracts", value: String(contracts.length) },
          { label: "Total Pipeline Value", value: `$${totalValue.toLocaleString()}` },
          { label: "Active Value", value: `$${activeValue.toLocaleString()}` },
        ].map(card => (
          <div key={card.label} style={{ background: C.surface2, borderRadius: 10, padding: "16px 18px", border: `1px solid ${C.hair}` }}>
            <p style={{ fontSize: 10, fontFamily: "'Geist Mono', ui-monospace, monospace", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{card.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>{card.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Loading…</div>
      ) : (
        /* Kanban board */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, alignItems: "start" }}>
          {STAGES.map(stage => {
            const stageContracts = byStatus(stage);
            const stageValue = stageContracts.reduce((s, c) => s + valueOf(c), 0);
            const cfg = STAGE_CONFIG[stage];
            return (
              <div
                key={stage}
                onDragOver={e => { e.preventDefault(); }}
                onDrop={() => handleDrop(stage)}
                style={{
                  background: cfg.bg,
                  borderRadius: 10,
                  border: `1px solid ${C.hair}`,
                  borderTop: `3px solid ${cfg.color}`,
                  minHeight: 200,
                  padding: "12px 10px",
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontFamily: "'Geist Mono', ui-monospace, monospace", fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                    {cfg.label} <span style={{ opacity: 0.7 }}>({stageContracts.length})</span>
                  </p>
                  {stageValue > 0 && <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>${stageValue.toLocaleString()}</p>}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {stageContracts.map(c => (
                    <div
                      key={c.id}
                      draggable={admin?.role === "admin"}
                      onDragStart={() => handleDragStart(c.id)}
                      style={{
                        background: C.bg,
                        borderRadius: 8,
                        border: `1px solid ${C.hair}`,
                        padding: "10px 12px",
                        cursor: admin?.role === "admin" ? "grab" : "default",
                        transition: "box-shadow 0.15s",
                        boxShadow: draggingId === c.id ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                        opacity: draggingId === c.id ? 0.5 : 1,
                      }}
                    >
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, margin: "0 0 4px" }}>{c.title}</p>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: valueOf(c) > 0 ? 6 : 0 }}>
                        <span style={{ padding: "1px 7px", borderRadius: 100, fontSize: 9, fontFamily: "'Geist Mono', ui-monospace, monospace", fontWeight: 600, border: `1px solid ${CAT_COLORS[c.category]}`, color: CAT_COLORS[c.category] }}>{c.category}</span>
                        <span style={{ fontSize: 10, color: C.muted }}>{c.type}</span>
                      </div>
                      {valueOf(c) > 0 && <p style={{ fontSize: 11, fontWeight: 700, color: C.ink, margin: 0 }}>${valueOf(c).toLocaleString()}</p>}
                      {admin?.role === "admin" && (
                        <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {STAGES.filter(s => s !== stage).map(s => (
                            <button
                              key={s}
                              onClick={() => handleMoveToStage(c.id, s)}
                              style={{
                                padding: "2px 7px", borderRadius: 5, border: `1px solid ${STAGE_CONFIG[s].color}`,
                                background: "transparent", color: STAGE_CONFIG[s].color,
                                fontSize: 9, fontFamily: "'Geist Mono', ui-monospace, monospace", cursor: "pointer",
                                textTransform: "uppercase", letterSpacing: "0.04em",
                              }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {stageContracts.length === 0 && (
                    <div style={{ textAlign: "center", color: C.hair, fontSize: 11, fontFamily: "'Geist Mono', ui-monospace, monospace", padding: "20px 0" }}>
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
