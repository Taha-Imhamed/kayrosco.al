import { useEffect, useState } from "react";
import {
  AdminUser, AdminRole, Department,
  getAdminUsers, createAdminUser, updateAdminUser, deactivateAdminUser,
  logActivity,
} from "@/lib/adminApi";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { ROLE_LABEL } from "@/lib/roleAccess";

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

const ROLE_COLOR: Record<AdminRole, string> = {
  admin:            C.ink,
  tech_staff:       C.info,
  consulting_staff: "#7C3AED",
  travel_staff:     C.positive,
  viewer:           C.muted,
};

const ALL_ROLES: AdminRole[] = ["admin", "tech_staff", "consulting_staff", "travel_staff", "viewer"];
const DEPTS: Department[]    = ["admin", "tech", "consulting", "travel"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 7,
  border: `1.5px solid ${C.hair}`, background: C.surface,
  fontSize: 13, fontFamily: SANS, color: C.ink, outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontFamily: MONO,
  color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5,
};

function RolePill({ role }: { role: AdminRole }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 100, fontSize: 10,
      fontFamily: MONO, fontWeight: 600, letterSpacing: "0.05em",
      border: `1px solid ${ROLE_COLOR[role]}`, color: ROLE_COLOR[role],
    }}>
      {role}
    </span>
  );
}

// Multi-role checkbox group
function RoleCheckboxes({
  primary, extra, onChange,
}: {
  primary:  AdminRole;
  extra:    AdminRole[];
  onChange: (extra: AdminRole[]) => void;
}) {
  const toggleExtra = (r: AdminRole) => {
    if (r === primary) return; // can't toggle primary this way
    onChange(extra.includes(r) ? extra.filter(x => x !== r) : [...extra, r]);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {ALL_ROLES.map(r => {
        const isPrimary = r === primary;
        const checked   = isPrimary || extra.includes(r);
        return (
          <label key={r} style={{ display: "flex", alignItems: "center", gap: 6, cursor: isPrimary ? "default" : "pointer", userSelect: "none" }}>
            <div
              onClick={() => !isPrimary && toggleExtra(r)}
              style={{
                width: 16, height: 16, borderRadius: 4,
                border: `2px solid ${checked ? ROLE_COLOR[r] : C.hair}`,
                background: checked ? ROLE_COLOR[r] : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, cursor: isPrimary ? "default" : "pointer",
              }}
            >
              {checked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <span style={{ fontSize: 12, color: checked ? ROLE_COLOR[r] : C.muted, fontFamily: SANS }}>
              {ROLE_LABEL[r]}{isPrimary && <span style={{ fontSize: 10, color: C.muted }}> (primary)</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.bg, borderRadius: 14, padding: "28px 28px 24px", width: "100%", maxWidth: 480, boxShadow: "0 12px 48px rgba(26,26,26,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, color: C.ink, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: C.muted, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminStaff() {
  const { admin } = useAdminAuth();
  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser]     = useState<AdminUser | null>(null);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  // Create form
  const [form, setForm] = useState({
    username: "", email: "", password: "",
    role: "viewer" as AdminRole,
    extraRoles: [] as AdminRole[],
    department: "admin" as Department,
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    email: "",
    role: "viewer" as AdminRole,
    extraRoles: [] as AdminRole[],
    department: "admin" as Department,
    is_active: true,
  });

  const load = () => {
    setLoading(true);
    getAdminUsers().then(setUsers).catch(e => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    try {
      await createAdminUser({ username: form.username, password: form.password, email: form.email, role: form.role, department: form.department });
      // Separately set extra roles
      if (form.extraRoles.length > 0) {
        const allUsers = await getAdminUsers();
        const created  = allUsers.find(u => u.username === form.username);
        if (created) await updateAdminUser(created.id, { roles: form.extraRoles });
      }
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Created account: ${form.username}`, "create", admin?.department);
      setSuccess(`Account "${form.username}" created.`); setShowCreate(false);
      setForm({ username: "", email: "", password: "", role: "viewer", extraRoles: [], department: "admin" });
      load();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to create account."); }
  };

  const openEdit = (user: AdminUser) => {
    setEditUser(user);
    setEditForm({
      email:      user.email ?? "",
      role:       user.role,
      extraRoles: user.roles ?? [],
      department: (user.department ?? "admin") as Department,
      is_active:  user.is_active,
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setError(""); setSuccess("");
    if (editUser.id === admin?.id && editForm.role !== "admin") {
      setError("Cannot change your own admin role."); return;
    }
    try {
      await updateAdminUser(editUser.id, {
        email:      editForm.email,
        role:       editForm.role,
        roles:      editForm.extraRoles,
        department: editForm.department,
        is_active:  editForm.is_active,
      });
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Edited account: ${editUser.username}`, "edit", admin?.department);
      setSuccess(`Account "${editUser.username}" updated.`); setEditUser(null); load();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Update failed."); }
  };

  const handleDeactivate = async (user: AdminUser) => {
    if (!confirm(`Deactivate "${user.username}"?`)) return;
    if (user.id === admin?.id) { setError("Cannot deactivate your own account."); return; }
    try {
      await deactivateAdminUser(user.id);
      await logActivity(admin?.id ?? null, admin?.username ?? "admin", `Deactivated account: ${user.username}`, "delete", admin?.department);
      setSuccess(`"${user.username}" deactivated.`); load();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed."); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.ink, margin: 0 }}>Staff Management</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{users.filter(u => u.is_active).length} active accounts</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + New Account
        </button>
      </div>

      {error   && <div style={{ padding: "10px 14px", borderRadius: 8, background: C.dangerTint, border: "1px solid #f5c6c2", color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.10)", border: "1px solid #a9dfbf", color: C.positive, fontSize: 13, marginBottom: 12 }}>{success}</div>}

      <input type="text" placeholder="Search by name, email, or role…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: 340, marginBottom: 16 }} />

      <div style={{ background: C.surface2, borderRadius: 12, border: `1px solid ${C.hair}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bg, textAlign: "left" }}>
              {["Username", "Email", "Primary Role", "Extra Roles", "Dept", "Last Login", "Status", ""].map(h => (
                <th key={h} style={{ padding: "10px 16px", fontWeight: 600, color: C.muted, fontSize: 11, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${C.hair}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 20, color: C.muted, textAlign: "center" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 20, color: C.muted, textAlign: "center" }}>No accounts found.</td></tr>
            ) : filtered.map((user, i) => (
              <tr key={user.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.hair}`, background: i % 2 === 0 ? "transparent" : "rgba(207,200,185,0.08)" }}>
                <td style={{ padding: "11px 16px", fontWeight: 600, color: C.ink }}>{user.username}</td>
                <td style={{ padding: "11px 16px", color: C.muted }}>{user.email ?? "—"}</td>
                <td style={{ padding: "11px 16px" }}><RolePill role={user.role} /></td>
                <td style={{ padding: "11px 16px" }}>
                  {(user.roles ?? []).length > 0
                    ? <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{(user.roles ?? []).map(r => <RolePill key={r} role={r} />)}</div>
                    : <span style={{ color: C.muted, fontSize: 12 }}>—</span>}
                </td>
                <td style={{ padding: "11px 16px", color: C.muted }}>{user.department ?? "—"}</td>
                <td style={{ padding: "11px 16px", color: C.muted, fontSize: 11, fontFamily: MONO }}>
                  {user.last_login ? new Date(user.last_login).toLocaleString() : "Never"}
                </td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{ padding: "2px 9px", borderRadius: 100, fontSize: 10, fontFamily: MONO, fontWeight: 600, border: `1px solid ${user.is_active ? C.positive : C.muted}`, color: user.is_active ? C.positive : C.muted }}>
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                  <button onClick={() => openEdit(user)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, marginRight: 8, textDecoration: "underline", fontFamily: SANS }}>Edit</button>
                  {user.is_active && user.id !== admin?.id && (
                    <button onClick={() => handleDeactivate(user)} style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 12, textDecoration: "underline", fontFamily: SANS }}>Deactivate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Modal title="New Account" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Username *</label>
              <input required style={inputStyle} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email *</label>
              <input required type="email" style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Password *</label>
              <input required minLength={8} type="password" style={inputStyle} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Primary Role</label>
                <select style={inputStyle} value={form.role} onChange={e => setForm({ ...form, role: e.target.value as AdminRole, extraRoles: form.extraRoles.filter(r => r !== e.target.value) })}>
                  {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Department</label>
                <select style={inputStyle} value={form.department} onChange={e => setForm({ ...form, department: e.target.value as Department })}>
                  {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Additional Roles</label>
              <p style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Staff can hold multiple roles. Primary role sets their main dept. Additional roles expand their access.</p>
              <RoleCheckboxes primary={form.role} extra={form.extraRoles} onChange={extra => setForm({ ...form, extraRoles: extra })} />
            </div>
            <button type="submit" style={{ width: "100%", padding: 11, borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>
              Create Account
            </button>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editUser && (
        <Modal title={`Edit: ${editUser.username}`} onClose={() => setEditUser(null)}>
          <form onSubmit={handleEdit}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email</label>
              <input type="email" style={inputStyle} value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Primary Role</label>
                <select style={inputStyle} value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value as AdminRole, extraRoles: editForm.extraRoles.filter(r => r !== e.target.value) })}>
                  {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Department</label>
                <select style={inputStyle} value={editForm.department} onChange={e => setEditForm({ ...editForm, department: e.target.value as Department })}>
                  {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Additional Roles</label>
              <RoleCheckboxes primary={editForm.role} extra={editForm.extraRoles} onChange={extra => setEditForm({ ...editForm, extraRoles: extra })} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={editForm.is_active ? "active" : "inactive"} onChange={e => setEditForm({ ...editForm, is_active: e.target.value === "active" })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button type="submit" style={{ width: "100%", padding: 11, borderRadius: 8, border: "none", background: C.ink, color: C.bg, fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>
              Save Changes
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
