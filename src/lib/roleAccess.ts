// ─── Role-based access control ───────────────────────────────────────────────
import type { AdminRole } from "./adminApi";

// ── Which paths each role may visit ──────────────────────────────────────────
export const ROLE_ROUTES: Record<AdminRole, readonly string[]> = {
  /** Full access — financial data is ADMIN ONLY */
  admin: [
    "/memo/dashboard",
    "/memo/balance",          // confidential
    "/memo/budget",
    "/memo/revenue",
    "/memo/expenses",
    "/memo/contract-value",   // confidential
    "/memo/contracts",
    "/memo/partners",
    "/memo/pipeline",
    "/memo/tickets",
    "/memo/staff",            // confidential
    "/memo/clients",
    "/memo/permissions",      // confidential
    "/memo/company",
    "/memo/announcements",
    "/memo/logs",             // confidential
    "/memo/agent",
    "/memo/agent/work",
    "/memo/dept/tech",
    "/memo/dept/consulting",
    "/memo/dept/travel",
  ],
  /** Read-only overview — no financial/staff management */
  viewer: [
    "/memo/dashboard",
    "/memo/budget",
    "/memo/contracts",
    "/memo/partners",
    "/memo/pipeline",
    "/memo/tickets",
    "/memo/clients",
    "/memo/announcements",
    "/memo/agent",
    "/memo/agent/work",
    "/memo/dept/tech",
    "/memo/dept/consulting",
    "/memo/dept/travel",
  ],
  /** Tech department staff */
  tech_staff: [
    "/memo/dashboard",
    "/memo/expenses",
    "/memo/clients",
    "/memo/tickets",
    "/memo/announcements",
    "/memo/agent",
    "/memo/agent/work",
    "/memo/dept/tech",
  ],
  /** Consulting department staff */
  consulting_staff: [
    "/memo/dashboard",
    "/memo/expenses",
    "/memo/clients",
    "/memo/tickets",
    "/memo/announcements",
    "/memo/agent",
    "/memo/agent/work",
    "/memo/dept/consulting",
  ],
  /** Travel department staff */
  travel_staff: [
    "/memo/dashboard",
    "/memo/expenses",
    "/memo/clients",
    "/memo/tickets",
    "/memo/announcements",
    "/memo/agent",
    "/memo/agent/work",
    "/memo/dept/travel",
  ],
};

/**
 * Returns true if the user (primary role + any additional roles) may access
 * the given pathname. Pass extraRoles from AdminUser.roles.
 */
export function canAccess(
  role: AdminRole | null | undefined,
  pathname: string,
  extraRoles: AdminRole[] = [],
): boolean {
  if (!role) return false;
  const allRoles = [role, ...extraRoles];
  return allRoles.some((r) => {
    const allowed = ROLE_ROUTES[r] ?? [];
    return allowed.some((p) => pathname === p || pathname.startsWith(p + "/"));
  });
}

/** Human-readable label for each role */
export const ROLE_LABEL: Record<AdminRole, string> = {
  admin:            "Administrator",
  tech_staff:       "Tech Staff",
  consulting_staff: "Consulting Staff",
  travel_staff:     "Travel Staff",
  viewer:           "Viewer",
};

/** Department string for a dept-staff role, or null for admin/viewer */
export function roleDept(
  role: AdminRole | null | undefined,
): "tech" | "consulting" | "travel" | null {
  if (role === "tech_staff")       return "tech";
  if (role === "consulting_staff") return "consulting";
  if (role === "travel_staff")     return "travel";
  return null;
}

/** Returns true for the three department-staff roles */
export function isDeptStaff(role: AdminRole | null | undefined): boolean {
  return (
    role === "tech_staff" ||
    role === "consulting_staff" ||
    role === "travel_staff"
  );
}
