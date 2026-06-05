import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { canAccess, ROLE_LABEL, roleDept, isDeptStaff } from "@/lib/roleAccess";
import type { AdminRole } from "@/lib/adminApi";

// ─── Fasto-style purple design tokens ────────────────────────────────────────
const C = {
  bg:               "#EEF0F7",            // light purple-gray page background
  surface:          "#FFFFFF",
  surface2:         "#F5F6FF",
  ink:              "#16213E",            // deep navy text
  muted:            "#8892A4",
  hair:             "rgba(0,0,0,0.07)",
  accent:           "#6C5CE7",            // primary purple
  sidebarBg:        "#27136B",            // deep violet sidebar
  sidebarText:      "rgba(255,255,255,0.55)",
  sidebarActive:    "rgba(108,92,231,0.22)",
  sidebarActiveText:"#FFFFFF",
};

const SERIF = "'Instrument Serif', 'Times New Roman', serif";
const SANS  = "'Geist', ui-sans-serif, -apple-system, sans-serif";
const MONO  = "'Geist Mono', ui-monospace, monospace";

// ─── Icons — accept a `size` prop so the same SVG works at 14px (sidebar),
//     16px (drawer) and 22px (bottom bar). ────────────────────────────────────
type IconProps = { size?: number };

const Ico = {
  Dashboard: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Staff: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Budget: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v1m0 6v1M9.5 10a2.5 2.5 0 0 1 5 0c0 2-2.5 3-2.5 3s-2.5 1-2.5 3a2.5 2.5 0 0 0 5 0"/>
    </svg>
  ),
  Revenue: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Tickets: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"/>
    </svg>
  ),
  Company: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Contracts: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Pipeline: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  ContractValue: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Expenses: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Clients: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Partners: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="7" height="7" rx="1.5"/>
      <rect x="14" y="4" width="7" height="7" rx="1.5"/>
      <path d="M6.5 20c0-2.5 2-4.5 4.5-4.5S15.5 17.5 15.5 20"/>
      <path d="M2.5 20c0-1.7 1.4-3 3-3"/>
      <path d="M18.5 17c1.6 0 3 1.3 3 3"/>
      <circle cx="11" cy="13" r="2.5"/>
    </svg>
  ),
  Announcements: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Permissions: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Logs: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  Tech: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  Consulting: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Travel: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Agent: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="4"/>
      <circle cx="9" cy="10" r="1"/>
      <circle cx="15" cy="10" r="1"/>
      <path d="M8 15c1 .8 2.3 1.2 4 1.2s3-.4 4-1.2"/>
    </svg>
  ),
  // Desktop menu toggle
  Menu: ({ size = 16 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  // Mobile "More" — 3×3 dot grid
  More: ({ size = 22 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <circle cx="5"  cy="5"  r="1.6"/><circle cx="12" cy="5"  r="1.6"/><circle cx="19" cy="5"  r="1.6"/>
      <circle cx="5"  cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>
      <circle cx="5"  cy="19" r="1.6"/><circle cx="12" cy="19" r="1.6"/><circle cx="19" cy="19" r="1.6"/>
    </svg>
  ),
  // Close ×
  Close: ({ size = 16 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  // Sign out arrow
  SignOut: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  // Balance / Wallet
  Balance: ({ size = 14 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
      <path d="M16 14a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" fill="currentColor" stroke="none"/>
      <path d="M2 10h20"/>
      <path d="M6 3l3-3h6l3 3" opacity="0.5"/>
    </svg>
  ),
};

// ─── Categorised nav (used by sidebar + mobile drawer) ────────────────────────
const NAV_CATEGORIES = [
  {
    label: "Overview",
    items: [
      { to: "/memo/dashboard",      label: "Dashboard",      Icon: Ico.Dashboard,      end: true },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/memo/balance",        label: "Balance",        Icon: Ico.Balance },
      { to: "/memo/budget",         label: "Budget",         Icon: Ico.Budget },
      { to: "/memo/revenue",        label: "Revenue",        Icon: Ico.Revenue },
      { to: "/memo/expenses",       label: "Expenses",       Icon: Ico.Expenses },
      { to: "/memo/contract-value", label: "Contract Deals", Icon: Ico.ContractValue },
    ],
  },
  {
    label: "Contracts",
    items: [
      { to: "/memo/contracts",      label: "Contracts",      Icon: Ico.Contracts },
      { to: "/memo/partners",       label: "Partners",       Icon: Ico.Partners },
      { to: "/memo/pipeline",       label: "Pipeline",       Icon: Ico.Pipeline },
      { to: "/memo/tickets",        label: "Tickets",        Icon: Ico.Tickets },
    ],
  },
  {
    label: "People",
    items: [
      { to: "/memo/staff",          label: "Staff",          Icon: Ico.Staff },
      { to: "/memo/clients",        label: "Clients",        Icon: Ico.Clients },
      { to: "/memo/permissions",    label: "Permissions",    Icon: Ico.Permissions },
    ],
  },
  {
    label: "Agent",
    items: [
      { to: "/memo/agent",      label: "Agent",      Icon: Ico.Agent },
      { to: "/memo/agent/work", label: "Agent Work", Icon: Ico.Agent },
    ],
  },
  {
    label: "Company",
    items: [
      { to: "/memo/company",        label: "Company Info",   Icon: Ico.Company },
      { to: "/memo/announcements",  label: "Announcements",  Icon: Ico.Announcements },
      { to: "/memo/logs",           label: "Activity Logs",  Icon: Ico.Logs },
    ],
  },
  {
    label: "Departments",
    items: [
      { to: "/memo/dept/tech",        label: "Tech",       Icon: Ico.Tech },
      { to: "/memo/dept/consulting",  label: "Consulting", Icon: Ico.Consulting },
      { to: "/memo/dept/travel",      label: "Travel",     Icon: Ico.Travel },
    ],
  },
] as const;

// ─── Mobile bottom-bar tabs — role-aware ─────────────────────────────────────
type BottomTab = {
  label:   string;
  Icon:    (props: IconProps) => React.ReactElement;
  to:      string | null;
  matches: string[];
};

function getBottomTabs(role: AdminRole | undefined): BottomTab[] {
  // Dept-staff: minimal set relevant to their work
  if (isDeptStaff(role)) {
    const dept      = roleDept(role);
    const deptPath  = `/memo/dept/${dept}`;
    const DeptIcon  = dept === "tech" ? Ico.Tech : dept === "consulting" ? Ico.Consulting : Ico.Travel;
    const deptLabel = dept
      ? dept.charAt(0).toUpperCase() + dept.slice(1)
      : "Dept";
    return [
      { label: "Home",         Icon: Ico.Dashboard,     to: "/memo/dashboard",    matches: ["/memo/dashboard"]  },
      { label: "Expenses",     Icon: Ico.Expenses,      to: "/memo/expenses",     matches: ["/memo/expenses"]   },
      { label: "Clients",      Icon: Ico.Clients,       to: "/memo/clients",      matches: ["/memo/clients"]    },
      { label: deptLabel,      Icon: DeptIcon,          to: deptPath,              matches: [deptPath]            },
      { label: "More",         Icon: Ico.More,          to: null,                  matches: []                    },
    ];
  }
  // Viewer: financial read-only set
  if (role === "viewer") {
    return [
      { label: "Home",      Icon: Ico.Dashboard, to: "/memo/dashboard", matches: ["/memo/dashboard"]                                                   },
      { label: "Finance",   Icon: Ico.Budget,    to: "/memo/budget",    matches: ["/memo/budget", "/memo/revenue", "/memo/contract-value"]            },
      { label: "Contracts", Icon: Ico.Contracts, to: "/memo/contracts", matches: ["/memo/contracts", "/memo/pipeline"]                                 },
      { label: "Partners",  Icon: Ico.Partners,  to: "/memo/partners",  matches: ["/memo/partners"]                                                    },
      { label: "More",      Icon: Ico.More,      to: null,               matches: []                                                                      },
    ];
  }
  // Admin: full set
  return [
    { label: "Home",      Icon: Ico.Dashboard, to: "/memo/dashboard", matches: ["/memo/dashboard"]                                                                              },
    { label: "Finance",   Icon: Ico.Budget,    to: "/memo/balance",   matches: ["/memo/balance", "/memo/budget", "/memo/revenue", "/memo/expenses", "/memo/contract-value"] },
    { label: "Contracts", Icon: Ico.Contracts, to: "/memo/contracts", matches: ["/memo/contracts", "/memo/partners", "/memo/pipeline", "/memo/tickets"]                      },
    { label: "People",    Icon: Ico.Staff,     to: "/memo/staff",     matches: ["/memo/staff", "/memo/clients", "/memo/permissions"]                                           },
    { label: "More",      Icon: Ico.More,      to: null,               matches: []                                                                                                },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate           = useNavigate();
  const location           = useLocation();

  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile,       setIsMobile]       = useState(false);

  // ── Role-based access guard ────────────────────────────────────────────────
  // Redirect to dashboard if the current path is not allowed for this role.
  // Only fires once admin is loaded (admin !== null).
  if (admin?.role && !canAccess(admin.role, location.pathname, admin.roles ?? [])) {
    return <Navigate to="/memo/dashboard" replace />;
  }

  // Track breakpoint
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-close mobile drawer when route changes
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate("/memo/login"); };

  // ── Role-filtered nav categories ──────────────────────────────────────────
  const filteredCategories = NAV_CATEGORIES
    .map((cat) => ({
      label: cat.label,
      items: (cat.items as ReadonlyArray<{ to: string; label: string; Icon: (p: IconProps) => React.ReactElement; end?: boolean }>)
        .filter((item) => canAccess(admin?.role, item.to, admin?.roles ?? [])),
    }))
    .filter((cat) => cat.items.length > 0);

  // ── Role-aware bottom tabs ────────────────────────────────────────────────
  const bottomTabs = getBottomTabs(admin?.role);

  // Active check for a bottom tab
  const isTabActive = (tab: BottomTab) =>
    tab.to
      ? tab.matches.some((m) => location.pathname === m || location.pathname.startsWith(m + "/"))
      : mobileMenuOpen;

  // Shared NavLink style (sidebar + drawer)
  const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    display:        "flex",
    alignItems:     "center",
    gap:            10,
    padding:        "7px 10px",
    borderRadius:   8,
    textDecoration: "none",
    fontSize:       13.5,
    fontFamily:     SANS,
    fontWeight:     500,
    color:          isActive ? C.sidebarActiveText : C.sidebarText,
    background:     isActive ? C.sidebarActive     : "transparent",
    transition:     "background 0.15s, color 0.15s",
    cursor:         "pointer",
  });

  const hoverIn  = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    if (!el.style.background.includes("108,92,231")) {
      el.style.background = "rgba(255,255,255,0.08)";
      el.style.color      = C.sidebarActiveText;
    }
  };
  const hoverOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    if (!el.style.background.includes("108,92,231")) {
      el.style.background = "transparent";
      el.style.color      = C.sidebarText;
    }
  };

  // Sidebar nav section rendered shared between desktop + mobile drawer
  const SidebarNav = ({ onItemClick, className }: { onItemClick?: () => void; className?: string }) => (
    <nav className={className} style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
      {filteredCategories.map((cat, ci) => (
        <div key={cat.label} style={{ marginBottom: 4 }}>
          {/* Category eyebrow label */}
          <p style={{
            padding:       ci === 0 ? "4px 10px 6px" : "14px 10px 6px",
            fontSize:      9.5,
            fontFamily:    MONO,
            color:         C.sidebarText,
            textTransform: "uppercase",
            letterSpacing: "0.20em",
            fontWeight:    500,
            opacity:       0.45,
          }}>
            {cat.label}
          </p>

          {/* Items */}
          {cat.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={navLinkStyle}
              end={"end" in item ? item.end : false}
              onClick={onItemClick}
              onMouseEnter={hoverIn}
              onMouseLeave={hoverOut}
            >
              <span style={{ display: "flex", opacity: 0.75 }}>
                <item.Icon />
              </span>
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <div style={{
      display:    "flex",
      minHeight:  "100vh",
      background: C.bg,
      fontFamily: SANS,
      color:      C.ink,
    }}>

      {/* ════════════════════════════════════════════════════════════════════
          DESKTOP SIDEBAR  (hidden on mobile)
      ════════════════════════════════════════════════════════════════════ */}
      {!isMobile && (
        <aside style={{
          width:      sidebarOpen ? 248 : 0,
          minWidth:   sidebarOpen ? 248 : 0,
          background: C.sidebarBg,
          display:    "flex",
          flexDirection: "column",
          overflow:   "hidden",
          transition: "width 0.2s, min-width 0.2s",
          flexShrink: 0,
          position:   "sticky",
          top:        0,
          height:     "100vh",
        }}>

          {/* Wordmark */}
          <div style={{ padding: "22px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{
              fontFamily: SANS, fontWeight: 800,
              fontSize:      28,
              color:         C.sidebarActiveText,
              letterSpacing: "-0.02em",
              display:       "block",
              lineHeight:    1,
            }}>
              Kayrosco
            </span>
            <p style={{
              marginTop:     4,
              fontSize:      10,
              color:         C.sidebarText,
              fontFamily:    MONO,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              opacity:       0.7,
            }}>
              Admin
            </p>
          </div>

          {/* Categorised nav */}
          <SidebarNav className="no-scrollbar" />

          {/* User strip */}
          <div style={{ padding: "12px 16px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontFamily: SANS, fontWeight: 600, color: C.sidebarActiveText, fontSize: 13, marginBottom: 2 }}>
              {admin?.username ?? "—"}
            </p>
            <p style={{ fontSize: 10, color: C.sidebarText, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.14em", opacity: 0.65 }}>
              {admin?.role ? ROLE_LABEL[admin.role] : ""}
              {admin?.department && admin.department !== "admin" ? ` · ${admin.department}` : ""}
            </p>
            <button
              onClick={handleLogout}
              style={{
                marginTop:  10,
                width:      "100%",
                padding:    "7px",
                borderRadius: 6,
                border:     "1px solid rgba(184,176,162,0.20)",
                background: "transparent",
                color:      C.sidebarText,
                fontFamily: SANS,
                fontSize:   12,
                fontWeight: 500,
                cursor:     "pointer",
                transition: "background 0.15s, color 0.15s",
                display:    "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "rgba(108,92,231,0.22)"; (e.target as HTMLButtonElement).style.color = C.sidebarActiveText; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "transparent";           (e.target as HTMLButtonElement).style.color = C.sidebarText; }}
            >
              <Ico.SignOut /> Sign out
            </button>
          </div>
        </aside>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{
        flex:           1,
        display:        "flex",
        flexDirection:  "column",
        overflow:       "hidden",
        // leave room for mobile bottom bar
        paddingBottom:  isMobile ? 64 : 0,
      }}>

        {/* Desktop header bar (hidden on mobile) */}
        {!isMobile && (
          <header style={{
            height:    52,
            background:C.surface,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            display:   "flex",
            alignItems:"center",
            padding:   "0 36px",
            gap:       12,
            flexShrink:0,
            zIndex:    10,
          }}>
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              style={{
                width: 28, height: 28, background: "none", border: "none",
                cursor: "pointer", color: C.muted, padding: 0, borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s, color 0.15s",
              }}
              title="Toggle sidebar"
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(108,92,231,0.10)"; (e.currentTarget as HTMLButtonElement).style.color = C.accent; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none";                   (e.currentTarget as HTMLButtonElement).style.color = C.muted; }}
            >
              <Ico.Menu />
            </button>
            <span style={{ fontSize: 15, fontFamily: SANS, fontWeight: 600, color: C.ink, letterSpacing: "-0.01em" }}>
              Dashboard
            </span>
          </header>
        )}

        {/* Mobile top bar */}
        {isMobile && (
          <header style={{
            height:       52,
            background:   C.sidebarBg,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            flexShrink:   0,
            position:     "sticky",
            top:          0,
            zIndex:       50,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <span style={{
              fontFamily: SANS, fontWeight: 800,
              fontSize:      22,
              color:         C.sidebarActiveText,
              letterSpacing: "-0.02em",
            }}>
              Kayrosco
            </span>
          </header>
        )}

        {/* Page content */}
        <main className="no-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
          <div style={{
            maxWidth:     1440,
            margin:       "0 auto",
            padding:      isMobile ? "20px 16px 32px" : "28px 36px 48px",
            boxSizing:    "border-box",
            width:        "100%",
          }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION BAR
      ════════════════════════════════════════════════════════════════════ */}
      {isMobile && (
        <nav
          className="bottom-bar-safe"
          style={{
            position:       "fixed",
            bottom:         0,
            left:           0,
            right:          0,
            zIndex:         100,
            minHeight:      64,
            background:     C.sidebarBg,
            borderTop:      "1px solid rgba(255,255,255,0.08)",
            display:        "flex",
            alignItems:     "stretch",
          }}
        >
          {bottomTabs.map((tab) => {
            const active = isTabActive(tab);
            return (
              <button
                key={tab.label}
                onClick={() => {
                  if (tab.to) { navigate(tab.to); setMobileMenuOpen(false); }
                  else        { setMobileMenuOpen((v) => !v); }
                }}
                style={{
                  flex:           1,
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            4,
                  paddingTop:     10,
                  paddingBottom:  10,
                  background:     "none",
                  border:         "none",
                  cursor:         "pointer",
                  color:          active ? C.accent : C.sidebarText,
                  transition:     "color 0.15s",
                  position:       "relative",
                }}
              >
                {/* Active dot indicator */}
                {active && (
                  <span style={{
                    position:     "absolute",
                    top:          6,
                    width:        4,
                    height:       4,
                    borderRadius: "50%",
                    background:   C.accent,
                  }} />
                )}
                <tab.Icon size={22} />
                <span style={{
                  fontSize:      10,
                  fontFamily:    SANS,
                  fontWeight:    active ? 600 : 500,
                  letterSpacing: "0.01em",
                  lineHeight:    1,
                }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MOBILE MENU DRAWER  (slide-up sheet)
      ════════════════════════════════════════════════════════════════════ */}
      {isMobile && mobileMenuOpen && (
        <>
          {/* Dark backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position:       "fixed",
              inset:          0,
              zIndex:         150,
              background:     "rgba(16,14,10,0.65)",
              backdropFilter: "blur(3px)",
            }}
          />

          {/* Sheet */}
          <div
            className="mobile-drawer-sheet"
            style={{
              position:       "fixed",
              bottom:         0,
              left:           0,
              right:          0,
              zIndex:         200,
              background:     C.sidebarBg,
              borderRadius:   "18px 18px 0 0",
              maxHeight:      "85vh",
              display:        "flex",
              flexDirection:  "column",
              overflow:       "hidden",
            }}
          >
            {/* Drag handle pill */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 4 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
            </div>

            {/* Sheet header */}
            <div style={{
              padding:        "8px 20px 12px",
              borderBottom:   "1px solid rgba(255,255,255,0.06)",
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
            }}>
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 22, color: C.sidebarActiveText, letterSpacing: "-0.02em" }}>
                Kayrosco
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "none", cursor: "pointer",
                  color: C.sidebarText,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Ico.Close size={14} />
              </button>
            </div>

            {/* Scrollable categorised nav */}
            <div className="no-scrollbar" style={{ overflowY: "auto", flex: 1 }}>
              <SidebarNav onItemClick={() => setMobileMenuOpen(false)} />
            </div>

            {/* User strip + sign out */}
            <div style={{
              padding:    "12px 16px",
              borderTop:  "1px solid rgba(255,255,255,0.06)",
              paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontFamily: SANS, fontWeight: 600, color: C.sidebarActiveText, fontSize: 13, marginBottom: 2 }}>
                    {admin?.username ?? "—"}
                  </p>
                  <p style={{ fontSize: 10, color: C.sidebarText, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.14em", opacity: 0.65 }}>
                    {admin?.role ? ROLE_LABEL[admin.role] : ""}
                    {admin?.department && admin.department !== "admin" ? ` · ${admin.department}` : ""}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    padding:      "8px 14px",
                    borderRadius: 8,
                    border:       "1px solid rgba(255,255,255,0.20)",
                    background:   "transparent",
                    color:        C.sidebarText,
                    fontFamily:   SANS,
                    fontSize:     13,
                    fontWeight:   500,
                    cursor:       "pointer",
                    display:      "flex",
                    alignItems:   "center",
                    gap:          6,
                  }}
                >
                  <Ico.SignOut size={13} /> Sign out
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
