import { useCallback, useEffect, useState } from "react";
import {
  AdminTask,
  AdminUser,
  Department,
  TaskPriority,
  TaskStatus,
  createTask,
  deleteTask,
  getAdminUsers,
  getTasks,
  updateTaskStatus,
} from "@/lib/adminApi";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const C = {
  bg: "#0B0818", surface: "#161029", surface2: "#1F1840", border: "rgba(255,255,255,0.10)",
  text: "#F4F2FF", text2: "#B7B0D6", muted: "#8A84A8", accent: "#8B7CFF",
  accentSoft: "rgba(139,124,255,0.10)", success: "#34D399", successSoft: "rgba(52,211,153,0.10)",
  warning: "#FBBF24", warningSoft: "rgba(251,191,36,0.10)", danger: "#FB7185", dangerSoft: "rgba(251,113,133,0.10)",
};
const FONT = "'Geist', ui-sans-serif, -apple-system, sans-serif";
const MONO = "'Geist Mono', ui-monospace, monospace";
const priorities: TaskPriority[] = ["low", "medium", "high", "urgent"];
const departments: Department[] = ["admin", "tech", "consulting", "travel"];
const statusLabels: Record<TaskStatus, string> = { open: "Open", in_progress: "In progress", done: "Done" };

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 9,
  border: `1px solid ${C.border}`, background: C.surface2, color: C.text, fontFamily: FONT,
  fontSize: 13, outline: "none",
};

function CheckIcon({ done = false }: { done?: boolean }) {
  return <span style={{ width: 20, height: 20, borderRadius: 6, border: `1.8px solid ${done ? C.success : C.border}`, background: done ? C.successSoft : C.surface2, display: "grid", placeItems: "center", color: C.success, flexShrink: 0 }}>{done ? "✓" : ""}</span>;
}

export default function AdminTasks() {
  const { admin } = useAdminAuth();
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filter, setFilter] = useState<TaskStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" as TaskPriority, department: "" as Department | "", assignedTo: "", dueDate: "", isPrivate: false });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(await getTasks({ ...(filter ? { status: filter } : {}), viewerId: admin?.id }));
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load tasks."); }
    finally { setLoading(false); }
  }, [admin?.id, filter]);

  useEffect(() => { load(); getAdminUsers().then(setUsers).catch(() => {}); }, [load]);

  const addTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || saving) return;
    setSaving(true); setError("");
    try {
      const assigned = users.find((user) => user.id === form.assignedTo);
      await createTask({
        title: form.title.trim(), description: form.description.trim() || undefined,
        isPrivate: form.isPrivate, priority: form.priority,
        department: form.department || null, assignedTo: assigned?.id ?? null,
        assignedToUsername: assigned?.username ?? null, dueDate: form.dueDate || null,
        createdBy: admin?.id ?? null, createdByUsername: admin?.username ?? "admin",
      });
      setForm({ title: "", description: "", priority: "medium", department: "", assignedTo: "", dueDate: "", isPrivate: false });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save task."); }
    finally { setSaving(false); }
  };

  const cycleStatus = async (task: AdminTask) => {
    const next: Record<TaskStatus, TaskStatus> = { open: "in_progress", in_progress: "done", done: "open" };
    try { await updateTaskStatus(task.id, next[task.status]); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not update task."); }
  };

  const remove = async (task: AdminTask) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    try { await deleteTask(task.id); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not delete task."); }
  };

  return (
    <div style={{ fontFamily: FONT, color: C.text }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ color: C.accent, fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 }}>Shared workspace</div>
        <h1 style={{ margin: 0, fontSize: 30, letterSpacing: "-0.03em", fontWeight: 650 }}>To-do</h1>
        <p style={{ margin: "8px 0 0", color: C.muted, fontSize: 14 }}>Keep work visible to the team, or make a task private when it is just for you.</p>
      </div>

      {error && <div style={{ marginBottom: 16, padding: "11px 14px", borderRadius: 9, border: `1px solid ${C.danger}`, background: C.dangerSoft, color: C.danger, fontSize: 13 }}>{error}</div>}

      <div className="admin-tasks-grid" style={{ display: "grid", gridTemplateColumns: "minmax(280px, 360px) minmax(0, 1fr)", gap: 18, alignItems: "start" }}>
        <form onSubmit={addTask} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 650 }}>New task</h2>
          <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 6 }}>TASK</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What needs doing?" style={{ ...inputStyle, marginBottom: 12 }} required />
          <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 6 }}>DETAILS</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional context" rows={3} style={{ ...inputStyle, resize: "vertical", marginBottom: 12 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })} style={inputStyle}>{priorities.map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)} priority</option>)}</select>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value as Department | "" })} style={inputStyle}><option value="">Any department</option>{departments.map((d) => <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>)}</select>
            <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} style={inputStyle}><option value="">Unassigned</option>{users.filter((u) => u.is_active).map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}</select>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 9, color: C.text2, fontSize: 13, cursor: "pointer", marginBottom: 18 }}><input type="checkbox" checked={form.isPrivate} onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })} /> Private task <span style={{ color: C.muted, fontSize: 11 }}>(only you and assignee)</span></label>
          <button disabled={saving || !form.title.trim()} style={{ width: "100%", border: 0, borderRadius: 9, padding: "10px 14px", background: C.accent, color: "#fff", fontFamily: FONT, fontWeight: 650, cursor: "pointer", opacity: saving || !form.title.trim() ? .55 : 1 }}>{saving ? "Saving..." : "Add task"}</button>
        </form>

        <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <div><h2 style={{ margin: 0, fontSize: 16, fontWeight: 650 }}>Tasks</h2><span style={{ color: C.muted, fontSize: 12 }}>{tasks.length} visible to you</span></div>
            <div style={{ display: "flex", gap: 4, background: C.surface2, padding: 3, borderRadius: 8 }}>{(["", "open", "in_progress", "done"] as const).map((value) => <button key={value || "all"} onClick={() => setFilter(value)} style={{ border: 0, borderRadius: 6, padding: "6px 9px", background: filter === value ? C.surface : "transparent", color: filter === value ? C.text : C.muted, fontFamily: FONT, fontSize: 12, cursor: "pointer" }}>{value ? statusLabels[value] : "All"}</button>)}</div>
          </div>
          {loading ? <p style={{ color: C.muted, fontSize: 13 }}>Loading tasks...</p> : tasks.length === 0 ? <div style={{ padding: "42px 16px", textAlign: "center", color: C.muted, fontSize: 13 }}>No tasks in this view.</div> : <div>{tasks.map((task) => { const done = task.status === "done"; const color = done ? C.success : task.priority === "urgent" || task.priority === "high" ? C.danger : task.priority === "medium" ? C.warning : C.accent; return <div key={task.id} style={{ display: "flex", gap: 12, padding: "14px 0", borderTop: `1px solid ${C.border}` }}><button onClick={() => cycleStatus(task)} title={`Mark ${done ? "open" : "done"}`} style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer" }}><CheckIcon done={done} /></button><div style={{ minWidth: 0, flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}><strong style={{ color: done ? C.muted : C.text, textDecoration: done ? "line-through" : "none", fontSize: 14 }}>{task.title}</strong>{task.is_private && <span style={{ color: C.accent, background: C.accentSoft, borderRadius: 5, padding: "2px 6px", fontSize: 10 }}>Private</span>}</div>{task.description && <p style={{ margin: "5px 0 7px", color: C.muted, fontSize: 12.5, lineHeight: 1.45 }}>{task.description}</p>}<div style={{ display: "flex", gap: 9, flexWrap: "wrap", color: C.muted, fontSize: 11.5 }}><span style={{ color }}>{task.priority}</span><span>{statusLabels[task.status]}</span>{task.assigned_to_username && <span>assigned to {task.assigned_to_username}</span>}{task.due_date && <span>due {task.due_date}</span>}</div></div><button onClick={() => remove(task)} title="Delete task" style={{ alignSelf: "center", border: 0, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 18 }}>×</button></div>})}</div>}
        </section>
      </div>
      <style>{`@media (max-width: 760px) { .admin-tasks-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}