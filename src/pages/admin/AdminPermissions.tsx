import { useEffect, useState } from "react";
import { RolePermission, getRolePermissions, updateRolePermission } from "@/lib/adminApi";
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

const ROLES = ["admin", "tech_staff", "consulting_staff", "travel_staff", "viewer"] as const;
const ROLE_COLORS: Record<string, string> = {
  admin: "#DC2626",
  tech_staff: "#3B82F6",
  consulting_staff: "#7C3AED",
  travel_staff: "#16A34A",
  viewer: "#71717A",
};

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onChange}
      title={disabled ? "Admin always has full access" : (checked ? "Click to revoke" : "Click to grant")}
      style={{
        width: 36, height: 20, borderRadius: 10, border: "none", cursor: disabled ? "not-allowed" : "pointer",
        background: checked ? C.positive : C.hair, position: "relative", transition: "background 0.2s",
        opacity: disabled ? 0.5 : 1, padding: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: checked ? 18 : 3,
        width: 14, height: 14, borderRadius: "50%", background: C.surface,
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

export default function AdminPermissions() {
  const { admin } = useAdminAuth();
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getRolePermissions().then(setPermissions).catch(e => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const resources = [...new Set(permissions.map(p => p.resource))].sort();
  const PERMS: Array<keyof Pick<RolePermission, "can_view" | "can_create" | "can_edit" | "can_delete">> = ["can_view", "can_create", "can_edit", "can_delete"];

  const getPermission = (role: string, resource: string) =>
    permissions.find(p => p.role === role && p.resource === resource);

  const handleToggle = async (perm: RolePermission, field: typeof PERMS[number]) => {
    if (admin?.role !== "admin") return;
    if (perm.role === "admin") return; // admin always has full access
    setSaving(`${perm.id}-${field}`);
    try {
      await updateRolePermission(perm.id, { [field]: !perm[field] });
      logActivity(admin?.id ?? null, admin?.username ?? "admin", `Updated permission: ${perm.role} / ${perm.resource} / ${field} = ${!perm[field]}`, "edit", admin?.department);
      setPermissions(prev => prev.map(p => p.id === perm.id ? { ...p, [field]: !p[field] } : p));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setSaving(null);
    }
  };

  if (admin?.role !== "admin") {
    return (
      <div style={{ padding: 40, textAlign: "center", color: C.muted }}>
        <p style={{ fontFamily: "'Geist', ui-sans-serif, -apple-system, sans-serif", fontSize: 22, color: C.ink, marginBottom: 8 }}>Access Restricted</p>
        <p style={{ fontSize: 14 }}>Only admins can view and edit role permissions.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Geist', ui-sans-serif, -apple-system, sans-serif", fontWeight: 600, fontSize: 28, color: C.ink, margin: 0 }}>Role Permissions</h1>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Toggle what each role can view, create, edit, or delete across all modules</p>
      </div>

      {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.10)", border: "1px solid #f5c6c2", color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <div style={{ background: C.surface2, borderRadius: 12, border: `1px solid ${C.hair}`, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.bg }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: C.muted, fontSize: 11, fontFamily: "'Geist Mono', ui-monospace, monospace", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${C.hair}`, minWidth: 120 }}>Resource</th>
              {ROLES.flatMap(role => PERMS.map(perm => (
                <th key={`${role}-${perm}`} style={{ padding: "8px 6px", textAlign: "center", fontWeight: 600, borderBottom: `1px solid ${C.hair}`, minWidth: 56 }}>
                  {PERMS.indexOf(perm) === 0 && (
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 10, fontFamily: "'Geist Mono', ui-monospace, monospace", fontWeight: 700, background: `${ROLE_COLORS[role]}18`, color: ROLE_COLORS[role] }}>
                        {role.replace("_staff", "")}
                      </span>
                    </div>
                  )}
                  <span style={{ fontSize: 9, fontFamily: "'Geist Mono', ui-monospace, monospace", color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {perm.replace("can_", "")}
                  </span>
                </th>
              )))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={1 + ROLES.length * 4} style={{ padding: 20, color: C.muted, textAlign: "center" }}>Loading…</td></tr>
            ) : resources.map((resource, ri) => (
              <tr key={resource} style={{ borderTop: ri === 0 ? "none" : `1px solid ${C.hair}` }}>
                <td style={{ padding: "11px 16px", fontWeight: 600, color: C.ink, fontFamily: "'Geist Mono', ui-monospace, monospace", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{resource}</td>
                {ROLES.flatMap(role => {
                  const perm = getPermission(role, resource);
                  return PERMS.map(field => (
                    <td key={`${role}-${field}`} style={{ padding: "11px 6px", textAlign: "center" }}>
                      {perm ? (
                        <div style={{ display: "flex", justifyContent: "center", opacity: saving === `${perm.id}-${field}` ? 0.5 : 1 }}>
                          <Toggle
                            checked={perm[field]}
                            onChange={() => handleToggle(perm, field)}
                            disabled={role === "admin"}
                          />
                        </div>
                      ) : <span style={{ color: C.hair, fontSize: 16 }}>—</span>}
                    </td>
                  ));
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 11, color: C.muted, fontFamily: "'Geist Mono', ui-monospace, monospace", marginTop: 12 }}>
        Admin role always has full access and cannot be restricted. Changes are saved immediately.
      </p>
    </div>
  );
}
