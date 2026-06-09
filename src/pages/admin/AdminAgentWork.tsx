import { useEffect, useMemo, useState } from "react";
import { Calendar, FileText, MessageSquarePlus, UserPlus } from "lucide-react";
import { assignAgentWork, createAgentNote, getAgentWork, updateAgentWorkStatus } from "@/lib/agentApi";
import type { AgentInternalNote, AgentWorkItem, AgentWorkStatus } from "@/lib/agentTypes";
import { getAdminUsers } from "@/lib/adminApi";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const C = {
  bg: "#F4F4F5",
  surface: "#FFFFFF",
  surface2: "#FAFAFA",
  ink: "#09090B",
  ink2: "#18181B",
  muted: "#71717A",
  hair: "rgba(0,0,0,0.07)",
  accent: "#2563EB",
  accentSoft: "rgba(37,99,235,0.10)",
  positive: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
};

const statuses: AgentWorkStatus[] = [
  "new",
  "in_progress",
  "waiting_for_client",
  "completed",
  "cancelled",
];

function statusColor(status: AgentWorkStatus) {
  if (status === "completed") return C.positive;
  if (status === "waiting_for_client") return C.warning;
  if (status === "cancelled") return C.danger;
  if (status === "in_progress") return C.accent;
  return C.ink2;
}

export default function AdminAgentWork() {
  const { admin } = useAdminAuth();
  const [items, setItems] = useState<AgentWorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AgentWorkItem | null>(null);
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [date, setDate] = useState("");
  const [staff, setStaff] = useState<{ id: string; username: string }[]>([]);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<AgentInternalNote[]>([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAgentWork({ department, status, priority, date });
      setItems(result.items);
      if (selected) {
        const next = result.items.find((item) => item.id === selected.id) ?? null;
        setSelected(next);
        setNotes(next?.notes || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agent work.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [department, status, priority, date]);

  useEffect(() => {
    setNotes(selected?.notes || []);
  }, [selected]);

  useEffect(() => {
    getAdminUsers()
      .then((users) => {
        setStaff(users.filter((user) => user.is_active).map((user) => ({ id: user.id, username: user.username })));
      })
      .catch(() => {});
  }, []);

  const totals = useMemo(
    () => ({
      total: items.length,
      newCount: items.filter((item) => item.status === "new").length,
      urgentCount: items.filter((item) => item.priority === "urgent").length,
    }),
    [items]
  );

  const handleStatusChange = async (workId: string, nextStatus: AgentWorkStatus) => {
    await updateAgentWorkStatus(workId, nextStatus);
    await load();
  };

  const handleAssign = async (workId: string, workerId: string) => {
    const worker = staff.find((item) => item.id === workerId);
    if (!worker) return;
    await assignAgentWork(workId, worker.id, worker.username, {
      id: admin?.id,
      name: admin?.username,
    });
    await load();
  };

  const handleCreateNote = async () => {
    if (!selected || !note.trim()) return;
    try {
      const result = await createAgentNote({
        workId: selected.id,
        content: note,
        actor: { id: admin?.id, name: admin?.username },
      });
      setNotes((current) => [result.note, ...current]);
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note.");
    }
  };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section
        style={{
          background: C.surface,
          borderRadius: 16,
          border: `1px solid ${C.hair}`,
          padding: 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, color: C.ink, fontSize: 28 }}>Agent Work</h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: C.muted }}>
              Saved public leads and agent-processed requests
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "Total", value: totals.total },
              { label: "New", value: totals.newCount },
              { label: "Urgent", value: totals.urgentCount },
            ].map((metric) => (
              <div
                key={metric.label}
                style={{
                  minWidth: 108,
                  borderRadius: 12,
                  border: `1px solid ${C.hair}`,
                  background: C.surface2,
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase" }}>{metric.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginTop: 4 }}>{metric.value}</div>
              </div>
            ))}
          </div>
        </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginTop: 18 }}>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} style={filterStyle}>
            <option value="">All departments</option>
            <option value="travel">Travel</option>
            <option value="consulting">Consulting</option>
            <option value="tech">Tech</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={filterStyle}>
            <option value="">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} style={filterStyle}>
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={filterStyle} />
        </div>
      </section>

      {error && (
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(220,38,38,0.10)", color: C.danger }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(300px, 0.8fr)", gap: 16 }}>
        <section
          style={{
            background: C.surface,
            borderRadius: 16,
            border: `1px solid ${C.hair}`,
            overflow: "hidden",
          }}
        >
          <div style={{ overflow: "auto", maxHeight: "calc(100vh - 280px)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead style={{ background: C.surface2 }}>
              <tr>
                {["Client", "Department", "Service", "Status", "Priority", "Files", "Created", "Assigned"].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: "left",
                      padding: "12px 14px",
                      fontSize: 11,
                      color: C.muted,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      borderBottom: `1px solid ${C.hair}`,
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: 28, textAlign: "center", color: C.muted }}>
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 28, textAlign: "center", color: C.muted }}>
                    No agent work found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelected(item)}
                    style={{
                      cursor: "pointer",
                      background: selected?.id === item.id ? C.accentSoft : C.surface,
                      borderTop: `1px solid ${C.hair}`,
                    }}
                  >
                    <td style={cellStyle}>
                      <div style={{ fontWeight: 700, color: C.ink }}>{item.clientName}</div>
                      <div style={{ color: C.muted, fontSize: 12 }}>{item.clientEmail || item.clientPhone || "No contact"}</div>
                    </td>
                    <td style={cellStyle}>{item.department}</td>
                    <td style={cellStyle}>{item.serviceType || "General"}</td>
                    <td style={cellStyle}>
                      <span style={{ ...pillStyle, color: statusColor(item.status), borderColor: `${statusColor(item.status)}40` }}>
                        {item.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td style={cellStyle}>{item.priority}</td>
                    <td style={cellStyle}>{item.uploadedFiles.length}</td>
                    <td style={cellStyle}>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td style={cellStyle}>{item.assignedWorkerName || "Unassigned"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </section>

        <section
          style={{
            background: C.surface,
            borderRadius: 16,
            border: `1px solid ${C.hair}`,
            padding: 18,
            minHeight: 480,
            maxHeight: "calc(100vh - 280px)",
            overflowY: "auto",
          }}
        >
          {!selected ? (
            <div style={{ color: C.muted, fontSize: 13 }}>Select a case to review details.</div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase" }}>Client</div>
                <h2 style={{ margin: "6px 0 0", fontSize: 24, color: C.ink }}>{selected.clientName}</h2>
                <p style={{ margin: "6px 0 0", color: C.ink2, fontSize: 13 }}>
                  {selected.serviceType || "General request"} • {selected.department}
                </p>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <label style={labelStyle}>
                  Status
                  <select
                    value={selected.status}
                    onChange={(e) => void handleStatusChange(selected.id, e.target.value as AgentWorkStatus)}
                    style={filterStyle}
                  >
                    {statuses.map((item) => (
                      <option key={item} value={item}>
                        {item.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={labelStyle}>
                  Assign worker
                  <select
                    value={selected.assignedWorkerId || ""}
                    onChange={(e) => void handleAssign(selected.id, e.target.value)}
                    style={filterStyle}
                  >
                    <option value="">Select worker</option>
                    {staff.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.username}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div style={detailCardStyle}>
                <div style={sectionTitleStyle}>
                  <FileText size={15} /> Summary
                </div>
                <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.7 }}>
                  {selected.summary || "No summary available."}
                </div>
              </div>

              <div style={detailCardStyle}>
                <div style={sectionTitleStyle}>
                  <Calendar size={15} /> Structured Data
                </div>
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    fontSize: 12,
                    color: C.ink2,
                    fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  }}
                >
                  {JSON.stringify(selected.structuredData, null, 2)}
                </pre>
              </div>

              <div style={detailCardStyle}>
                <div style={sectionTitleStyle}>
                  <UserPlus size={15} /> Uploaded Files
                </div>
                {selected.uploadedFiles.length === 0 ? (
                  <div style={{ fontSize: 13, color: C.muted }}>No files uploaded.</div>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {selected.uploadedFiles.map((file, index) => (
                      <a
                        key={`${file.name}-${index}`}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: C.accent,
                          textDecoration: "none",
                          fontSize: 13,
                          borderRadius: 10,
                          padding: "8px 10px",
                          background: C.surface2,
                        }}
                      >
                        {file.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div style={detailCardStyle}>
                <div style={sectionTitleStyle}>
                  <MessageSquarePlus size={15} /> Internal Notes
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add an internal note for this request..."
                  style={{ ...filterStyle, minHeight: 88, resize: "vertical" }}
                />
                <button
                  type="button"
                  onClick={() => void handleCreateNote()}
                  style={{
                    marginTop: 10,
                    borderRadius: 10,
                    border: "none",
                    background: C.accent,
                    color: "#fff",
                    padding: "10px 12px",
                    cursor: "pointer",
                  }}
                >
                  Add Note
                </button>
                {!!notes.length && (
                  <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                    {notes.map((entry) => (
                      <div key={entry.id} style={{ borderRadius: 10, background: C.surface2, padding: "10px 12px" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>
                          {entry.authorName || "Staff"}
                        </div>
                        <div style={{ fontSize: 12, color: C.ink2, marginTop: 4 }}>{entry.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const filterStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: `1px solid ${C.hair}`,
  background: C.surface2,
  color: C.ink2,
  padding: "10px 12px",
  outline: "none",
  fontSize: 13,
};

const cellStyle: React.CSSProperties = {
  padding: "12px 14px",
  fontSize: 13,
  color: C.ink2,
  verticalAlign: "top",
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  border: "1px solid transparent",
  padding: "4px 9px",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  color: C.muted,
};

const detailCardStyle: React.CSSProperties = {
  borderRadius: 14,
  border: `1px solid ${C.hair}`,
  background: C.surface2,
  padding: 14,
};

const sectionTitleStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: C.ink,
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 10,
};
