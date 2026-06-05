import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ServiceRequest, RequestStatus, RequestPriority, RequestLink,
  RequestLinkType, ChecklistItem, WorkerProfile,
  updateServiceRequest, getRequestsByArea, getWorkersByArea, deleteServiceRequest,
  TechProject, TechProjectStatus, getTechProjects, createTechProject, updateTechProject, deleteTechProject,
} from "@/lib/supabaseApi";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { logActivity } from "@/lib/adminApi";

// ─── Design tokens ─────────────────────────────────────────────────────────────
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

type ServiceArea = "tech" | "ealbana" | "travel";

// ─── Department config ─────────────────────────────────────────────────────────
const DEPT_INFO: Record<string, { label: string; color: string; area: ServiceArea }> = {
  tech:       { label: "Tech",       color: C.info,     area: "tech"    },
  consulting: { label: "Consulting", color: "#7C3AED",  area: "ealbana" },
  travel:     { label: "Travel",     color: C.positive, area: "travel"  },
};

// ─── Status & priority configs ─────────────────────────────────────────────────
const STATUS_ORDER: RequestStatus[] = ["new","in_review","awaiting_docs","in_progress","completed"];
const STATUS_CFG: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  new:           { label: "New",           color: "#F59E0B", bg: "rgba(245,158,11,0.10)"  },
  in_review:     { label: "In Review",     color: "#3B82F6", bg: "rgba(59,130,246,0.10)"  },
  awaiting_docs: { label: "Awaiting Docs", color: "#F97316", bg: "rgba(249,115,22,0.10)"  },
  in_progress:   { label: "In Progress",   color: "#8B5CF6", bg: "rgba(139,92,246,0.10)"  },
  completed:     { label: "Completed",     color: "#10B981", bg: "rgba(16,185,129,0.10)"  },
};
const PRIORITY_ORDER: RequestPriority[] = ["low","medium","high","urgent"];
const PRIORITY_CFG: Record<RequestPriority, { label: string; color: string; bg: string }> = {
  low:    { label: "Low",    color: "#10B981", bg: "rgba(16,185,129,0.10)" },
  medium: { label: "Medium", color: "#3B82F6", bg: "rgba(59,130,246,0.10)" },
  high:   { label: "High",   color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  urgent: { label: "Urgent", color: "#EF4444", bg: "rgba(239,68,68,0.10)"  },
};

// ─── Department-specific link types ───────────────────────────────────────────
type LinkTypeDef = { key: RequestLinkType; label: string; color: string; icon: string };

const DEPT_LINK_TYPES: Record<string, LinkTypeDef[]> = {
  tech: [
    { key: "demo",    label: "Demo",        color: "#8B5CF6", icon: "▶"  },
    { key: "repo",    label: "Repository",  color: "#16213E", icon: "</>" },
    { key: "figma",   label: "Figma",       color: "#F24E1E", icon: "✦"  },
    { key: "staging", label: "Staging",     color: "#3B82F6", icon: "↗"  },
    { key: "doc",     label: "Docs",        color: "#6C5CE7", icon: "≡"  },
    { key: "meet",    label: "Meeting",     color: "#10B981", icon: "◎"  },
    { key: "other",   label: "Other",       color: "#8892A4", icon: "◈"  },
  ],
  travel: [
    { key: "staging", label: "Booking Ref",    color: "#8B5CF6", icon: "✈"  },
    { key: "demo",    label: "Hotel Link",     color: "#10B981", icon: "🏨" },
    { key: "repo",    label: "Flight Info",    color: "#3B82F6", icon: "🛫" },
    { key: "figma",   label: "Visa Appt",      color: "#F97316", icon: "📋" },
    { key: "doc",     label: "Document",       color: "#6C5CE7", icon: "📄" },
    { key: "meet",    label: "Meeting",        color: "#10B981", icon: "◎"  },
    { key: "other",   label: "Other",          color: "#8892A4", icon: "◈"  },
  ],
  consulting: [
    { key: "doc",     label: "Proposal",       color: "#7C3AED", icon: "📄" },
    { key: "meet",    label: "Meeting",        color: "#10B981", icon: "◎"  },
    { key: "staging", label: "Report",         color: "#3B82F6", icon: "📊" },
    { key: "demo",    label: "Presentation",   color: "#F59E0B", icon: "🎯" },
    { key: "figma",   label: "Contract",       color: "#EF4444", icon: "📝" },
    { key: "repo",    label: "Client Site",    color: "#6C5CE7", icon: "🌐" },
    { key: "other",   label: "Other",          color: "#8892A4", icon: "◈"  },
  ],
};

// ─── Department-specific checklist templates ───────────────────────────────────
const DEPT_TEMPLATES: Record<string, string[]> = {
  tech: [
    "Send initial proposal",
    "Schedule discovery call",
    "Review requirements",
    "Send contract",
    "Set up dev environment",
    "Deliver prototype",
    "Client review & feedback",
    "Final delivery",
  ],
  travel: [
    "Request passport copy",
    "Verify visa requirements",
    "Book accommodation",
    "Arrange airport pickup",
    "Process visa documentation",
    "Confirm travel dates",
    "Send itinerary to client",
    "Arrange ground transport",
    "Emergency contact confirmed",
    "Follow up on payment",
  ],
  consulting: [
    "Send initial proposal",
    "Schedule discovery call",
    "Prepare client briefing",
    "Review business requirements",
    "Prepare presentation",
    "Send engagement contract",
    "Kick-off meeting scheduled",
    "Deliver final report",
    "Client sign-off",
    "Follow up on payment",
  ],
};

// ─── Travel service labels ────────────────────────────────────────────────────
const TRAVEL_SERVICES: Record<string, string> = {
  serviceVisaSupport:  "Visa Documentation",
  serviceResidency:    "Residency Assistance",
  serviceTranslation:  "Translation Support",
  serviceItinerary:    "Custom Itinerary",
  serviceInsurance:    "Travel Insurance",
  serviceAirportPickup:"Airport Pickup",
  serviceConcierge:    "Concierge Support",
  serviceCar:          "Private Driver",
  serviceHotel:        "Hotel Booking",
  serviceAirBnB:       "Apartment Rental",
};

const BUDGET_TIERS = [
  { key: "Budget",   label: "Budget",   color: "#10B981", sub: "Under $800 · ~$40 hotel + $40 food/day" },
  { key: "Standard", label: "Standard", color: "#3B82F6", sub: "$1,000 – $2,000" },
  { key: "Comfort",  label: "Comfort",  color: "#8B5CF6", sub: "$3,000 – $4,000" },
  { key: "Luxury",   label: "Luxury",   color: "#F59E0B", sub: "Open budget" },
];

// ─── Tech Project status config ────────────────────────────────────────────────
const PROJECT_STATUS_CFG: Record<TechProjectStatus, { label: string; color: string; bg: string }> = {
  done:        { label: "Done",        color: "#10B981", bg: "rgba(16,185,129,0.10)" },
  available:   { label: "Available",   color: "#3B82F6", bg: "rgba(59,130,246,0.10)" },
  in_progress: { label: "In Progress", color: "#8B5CF6", bg: "rgba(139,92,246,0.10)" },
};

type CityItem = { cityId: string; cityName: string; days: number };

const TRANSPORT_OPTIONS = ["By Plane", "By Land", "By Ferry"];
const ENTRY_OPTIONS = [
  "Tirana Airport (TIA)", "Port of Durrës (Ferry)", "Kakavija Border (Greece)",
  "Morinë Border (Kosovo)", "Muriqan Border (Montenegro)", "Qafë Thanë Border (Macedonia)",
];

// ─── Shared styles ─────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 7,
  border: `1.5px solid ${C.hair}`, background: C.surface,
  fontSize: 13, fontFamily: SANS, color: C.ink, outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontFamily: MONO,
  color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5,
};
const alertBase: React.CSSProperties = {
  padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 12,
};

// ─── Small display components ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: RequestStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: 11, fontFamily: MONO, fontWeight: 600, background: cfg.bg, color: cfg.color, whiteSpace: "nowrap" }}>
      {cfg.label}
    </span>
  );
}
function PriorityBadge({ priority }: { priority: RequestPriority | null }) {
  if (!priority) return null;
  const cfg = PRIORITY_CFG[priority];
  return (
    <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 10, fontFamily: MONO, fontWeight: 700, background: cfg.bg, color: cfg.color, letterSpacing: "0.06em" }}>
      {cfg.label.toUpperCase()}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value || value === "false") return null;
  return (
    <div style={{ marginBottom: 9 }}>
      <p style={{ fontSize: 10, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>{label}</p>
      <p style={{ fontSize: 13, color: C.ink, wordBreak: "break-word", margin: 0, lineHeight: 1.5 }}>{value}</p>
    </div>
  );
}

function SectionHead({ label }: { label: string }) {
  return (
    <p style={{ fontSize: 10, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", margin: "16px 0 8px", borderTop: `1px solid ${C.hair}`, paddingTop: 12 }}>
      {label}
    </p>
  );
}

function fmtKey(k: string) {
  return k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()).trim();
}

function fmtDate(d: string) {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); }
  catch { return d; }
}

// ─── Department-specific submission detail renderers ───────────────────────────
function TravelDetails({ req }: { req: ServiceRequest }) {
  const d = (req.data ?? {}) as Record<string, unknown>;
  const str = (k: string) => String(d[k] ?? "");

  const selectedServices = Object.entries(TRAVEL_SERVICES)
    .filter(([k]) => d[k] === true || d[k] === "true")
    .map(([, label]) => label);

  const cityItinerary = Array.isArray(d.cityItinerary)
    ? (d.cityItinerary as { cityId: string; cityName: string; days: number }[])
    : [];

  const selectedInterests = Array.isArray(d.selectedInterests)
    ? (d.selectedInterests as string[])
    : selectedServices;

  return (
    <>
      {/* ── Route & Entry ── */}
      {(str("departureCountry") || str("entryPoint")) && (
        <>
          <SectionHead label="Route & Entry" />
          <InfoRow label="Coming From"    value={str("departureCountry")} />
          <InfoRow label="Transport"      value={str("transportMode")} />
          <InfoRow label="Entry Point"    value={str("entryPoint")} />
          <InfoRow label="Total Days"     value={str("totalTripDays") ? `${str("totalTripDays")} days` : ""} />
        </>
      )}

      {/* ── City Itinerary ── */}
      {cityItinerary.length > 0 && (
        <>
          <SectionHead label="City Itinerary" />
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {cityItinerary.map((stop, i) => (
              <div key={stop.cityId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: C.surface2, borderRadius: 8, border: `1px solid ${C.hair}` }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: C.accent, color: "#fff", fontSize: 10, fontWeight: 700, fontFamily: MONO, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.ink }}>{stop.cityName}</span>
                <span style={{ fontSize: 11, fontFamily: MONO, color: C.muted, background: C.bg, padding: "2px 7px", borderRadius: 100 }}>{stop.days}d</span>
              </div>
            ))}
          </div>
          {str("cityItineraryText") && (
            <p style={{ fontSize: 11, color: C.muted, margin: "8px 0 0", lineHeight: 1.5, fontFamily: MONO }}>
              {str("cityItineraryText")}
            </p>
          )}
        </>
      )}

      {/* ── Services Requested ── */}
      {selectedInterests.length > 0 && (
        <>
          <SectionHead label="Services Requested" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {selectedInterests.map(s => (
              <span key={s} style={{ padding: "3px 9px", borderRadius: 100, fontSize: 11, fontFamily: SANS, fontWeight: 600, background: "rgba(16,185,129,0.10)", color: C.positive, border: `1px solid rgba(16,185,129,0.25)` }}>
                ✓ {s}
              </span>
            ))}
          </div>
        </>
      )}

      {/* ── Budget ── */}
      {str("budgetRange") && (
        <>
          <SectionHead label="Budget" />
          <div style={{ padding: "8px 12px", background: C.surface2, borderRadius: 8, border: `1px solid ${C.hair}`, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent, display: "inline-block" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{str("budgetRange")}</span>
          </div>
        </>
      )}

      {/* ── Applicant ── */}
      <SectionHead label="Applicant" />
      <InfoRow label="Full Name"             value={req.full_name ?? str("fullName")} />
      <InfoRow label="Nationality"           value={str("nationality")} />
      <InfoRow label="Country of Residence"  value={str("residenceCountry")} />
      <InfoRow label="Preferred Language"    value={str("preferredLanguage")} />

      {/* ── Trip Details ── */}
      <SectionHead label="Trip Details" />
      <InfoRow label="Permit Type"     value={str("visaType")} />
      <InfoRow label="Trip Purpose"    value={str("tripPurpose")} />
      <InfoRow label="Arrival"         value={fmtDate(str("dateOfArrival"))} />
      <InfoRow label="Departure"       value={fmtDate(str("dateOfDeparture"))} />
      <InfoRow label="Travelers"       value={str("travelersCount")} />
      <InfoRow label="Accommodation"   value={str("accommodationClass")} />

      {/* ── Contact ── */}
      <SectionHead label="Contact" />
      <InfoRow label="Email"             value={req.email ?? ""} />
      <InfoRow label="Phone"             value={req.phone ?? ""} />
      <InfoRow label="Preferred Contact" value={str("preferredContact")} />

      {/* ── Emergency ── */}
      {(str("emergencyContactName") || str("emergencyContactPhone")) && (
        <>
          <SectionHead label="Emergency Contact" />
          <InfoRow label="Name"  value={str("emergencyContactName")} />
          <InfoRow label="Phone" value={str("emergencyContactPhone")} />
        </>
      )}

      {/* ── Notes ── */}
      {str("additionalNotes") && (
        <>
          <SectionHead label="Client Notes" />
          <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
            {str("additionalNotes")}
          </p>
        </>
      )}
    </>
  );
}

function ConsultingDetails({ req }: { req: ServiceRequest }) {
  const d = (req.data ?? {}) as Record<string, unknown>;
  const str = (k: string) => String(d[k] ?? "");

  // Known consulting-relevant fields (from Consulting.tsx form)
  const known = ["company", "budget", "timeline", "preferredContact", "message", "service"];
  const extra = Object.entries(d).filter(([k, v]) =>
    v && !["name", "email", "phone", "service", ...known].includes(k) && typeof v === "string"
  );

  return (
    <>
      <SectionHead label="Client" />
      <InfoRow label="Full Name" value={req.full_name ?? str("name")} />
      <InfoRow label="Company"   value={str("company")} />
      <InfoRow label="Email"     value={req.email ?? ""} />
      <InfoRow label="Phone"     value={req.phone ?? ""} />

      <SectionHead label="Engagement" />
      <InfoRow label="Service Requested" value={req.service_type} />
      <InfoRow label="Budget"            value={str("budget")} />
      <InfoRow label="Timeline"          value={str("timeline")} />
      <InfoRow label="Preferred Contact" value={str("preferredContact")} />

      {str("message") && (
        <>
          <SectionHead label="Project Details" />
          <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
            {str("message")}
          </p>
        </>
      )}

      {extra.length > 0 && (
        <>
          <SectionHead label="Additional Info" />
          {extra.map(([k, v]) => <InfoRow key={k} label={fmtKey(k)} value={String(v)} />)}
        </>
      )}
    </>
  );
}

function TechDetails({ req }: { req: ServiceRequest }) {
  const d = (req.data ?? {}) as Record<string, unknown>;
  const str = (k: string) => String(d[k] ?? "");

  return (
    <>
      <SectionHead label="Client" />
      <InfoRow label="Full Name" value={req.full_name ?? str("name")} />
      <InfoRow label="Company"   value={str("company")} />
      <InfoRow label="Email"     value={req.email ?? ""} />
      <InfoRow label="Phone"     value={req.phone ?? ""} />

      <SectionHead label="Project" />
      <InfoRow label="Service"           value={req.service_type} />
      <InfoRow label="Budget"            value={str("budget")} />
      <InfoRow label="Timeline"          value={str("timeline")} />
      <InfoRow label="Preferred Contact" value={str("preferredContact")} />

      {str("message") && (
        <>
          <SectionHead label="Project Details" />
          <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
            {str("message")}
          </p>
        </>
      )}

      {/* Any extra fields */}
      {Object.entries(d)
        .filter(([k, v]) => v && !["name","email","phone","service","company","budget","timeline","preferredContact","message"].includes(k) && typeof v === "string")
        .map(([k, v]) => <InfoRow key={k} label={fmtKey(k)} value={String(v)} />)
      }
    </>
  );
}

function SubmissionDetails({ req, dept }: { req: ServiceRequest; dept: string }) {
  if (dept === "travel")     return <TravelDetails     req={req} />;
  if (dept === "consulting") return <ConsultingDetails req={req} />;
  return <TechDetails req={req} />;
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function AdminDept() {
  const { dept } = useParams<{ dept: string }>();
  const { admin } = useAdminAuth();
  const info = DEPT_INFO[dept ?? ""] ?? { label: dept ?? "Department", color: C.muted, area: "tech" as ServiceArea };

  const linkTypes  = DEPT_LINK_TYPES[dept ?? "tech"]   ?? DEPT_LINK_TYPES.tech;
  const templates  = DEPT_TEMPLATES[dept ?? "tech"]    ?? DEPT_TEMPLATES.tech;
  const linkCfgMap = Object.fromEntries(linkTypes.map(l => [l.key, l])) as Record<string, LinkTypeDef>;

  // ── List state ──────────────────────────────────────────────────────────────
  const [requests,     setRequests]     = useState<ServiceRequest[]>([]);
  const [workers,      setWorkers]      = useState<WorkerProfile[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");
  const [filterStatus, setFilterStatus] = useState<RequestStatus | "">("");
  const [search,       setSearch]       = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null); // request id pending delete
  const [deleting,      setDeleting]    = useState(false);

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [selected,  setSelected]  = useState<ServiceRequest | null>(null);
  const [activeTab, setActiveTab] = useState<"process" | "links" | "checklist" | "customize">("process");

  // Process
  const [editStatus,   setEditStatus]   = useState<RequestStatus>("new");
  const [editPriority, setEditPriority] = useState<RequestPriority | "">("");
  const [editWorker,   setEditWorker]   = useState("");
  const [editDue,      setEditDue]      = useState("");
  const [editReport,   setEditReport]   = useState("");
  const [saving,       setSaving]       = useState(false);
  const [modalError,   setModalError]   = useState("");

  // Links
  const [links,        setLinks]        = useState<RequestLink[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl,   setNewLinkUrl]   = useState("");
  const [newLinkType,  setNewLinkType]  = useState<RequestLinkType>(linkTypes[0].key);
  const [linkSaving,   setLinkSaving]   = useState(false);
  const linkUrlRef = useRef<HTMLInputElement>(null);

  // Checklist
  const [checklist,  setChecklist]  = useState<ChecklistItem[]>([]);
  const [newTask,    setNewTask]    = useState("");
  const [taskSaving, setTaskSaving] = useState(false);

  // Customize (travel dept)
  const [customData,   setCustomData]   = useState<Record<string, unknown>>({});
  const [customSaving, setCustomSaving] = useState(false);
  const [newCityName,  setNewCityName]  = useState("");
  const [newCityDays,  setNewCityDays]  = useState(2);

  // ── Page-level tabs (tech dept only) ────────────────────────────────────────
  const [pageTab, setPageTab] = useState<"requests" | "projects">("requests");

  // ── Projects (tech dept only) ────────────────────────────────────────────────
  const [projects,              setProjects]              = useState<TechProject[]>([]);
  const [projectsLoading,       setProjectsLoading]       = useState(false);
  const [projectsError,         setProjectsError]         = useState("");
  const [projectDeleteConfirm,  setProjectDeleteConfirm]  = useState<string | null>(null);
  const [projectDeleting,       setProjectDeleting]       = useState(false);
  const [showProjectForm,       setShowProjectForm]       = useState(false);
  const [editingProject,        setEditingProject]        = useState<TechProject | null>(null);
  const [projectSaving,         setProjectSaving]         = useState(false);
  const [pForm, setPForm] = useState({
    title:       "",
    description: "",
    photo_url:   "",
    link:        "",
    status:      "done" as TechProjectStatus,
    tags:        "",
    order_index: 0,
  });

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true); setError("");
    try {
      const [reqs, wrks] = await Promise.all([
        getRequestsByArea(info.area),
        getWorkersByArea(info.area),
      ]);
      setRequests(reqs.map(r => ({
        ...r,
        links:     Array.isArray(r.links)     ? r.links     : [],
        checklist: Array.isArray(r.checklist) ? r.checklist : [],
      })));
      setWorkers(wrks);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [dept]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load tech projects ───────────────────────────────────────────────────────
  const loadProjects = async () => {
    setProjectsLoading(true); setProjectsError("");
    try {
      const data = await getTechProjects();
      setProjects(data);
    } catch (e: unknown) {
      setProjectsError(e instanceof Error ? e.message : "Failed to load projects.");
    } finally { setProjectsLoading(false); }
  };
  useEffect(() => {
    if (dept === "tech" && pageTab === "projects") loadProjects();
  }, [dept, pageTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Modal open/close ────────────────────────────────────────────────────────
  const openRequest = (req: ServiceRequest) => {
    setSelected(req);
    setActiveTab("process");
    setEditStatus(req.status);
    setEditPriority(req.priority ?? "medium");
    setEditWorker(req.assigned_worker_id ?? "");
    setEditDue(req.due_at ? req.due_at.slice(0, 10) : "");
    setEditReport(req.report ?? "");
    setLinks(Array.isArray(req.links) ? req.links : []);
    setChecklist(Array.isArray(req.checklist) ? req.checklist : []);
    setNewLinkLabel(""); setNewLinkUrl(""); setNewLinkType(linkTypes[0].key);
    setNewTask(""); setModalError("");
    setCustomData({ ...(req.data ?? {}) });
    setNewCityName(""); setNewCityDays(2);
  };
  const closeModal = () => { setSelected(null); load(); };

  // ── Save process ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selected) return;
    setSaving(true); setModalError("");
    try {
      await updateServiceRequest(selected.id, {
        status:             editStatus,
        priority:           editPriority || null,
        assigned_worker_id: editWorker || null,
        due_at:             editDue ? new Date(editDue + "T00:00:00").toISOString() : null,
        report:             editReport || null,
      });
      logActivity(admin?.id ?? null, admin?.username ?? "admin",
        `Updated ${info.label} request ${selected.tracking_id}: ${editStatus}`, "edit", admin?.department);
      setSuccess(`${selected.tracking_id} saved.`);
      closeModal();
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : "Failed.");
    } finally { setSaving(false); }
  };

  // ── Links (live save) ────────────────────────────────────────────────────────
  const persistLinks = async (updated: RequestLink[]) => {
    if (!selected) return;
    setLinkSaving(true);
    try {
      await updateServiceRequest(selected.id, { links: updated as unknown as RequestLink[] });
      setLinks(updated);
      setSelected(prev => prev ? { ...prev, links: updated } : prev);
    } catch (e: unknown) { setModalError(e instanceof Error ? e.message : "Failed."); }
    finally { setLinkSaving(false); }
  };
  const addLink = async () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    const raw = newLinkUrl.trim();
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    await persistLinks([...links, { id: crypto.randomUUID(), label: newLinkLabel.trim(), url, type: newLinkType }]);
    setNewLinkLabel(""); setNewLinkUrl("");
    linkUrlRef.current?.focus();
  };
  const removeLink = (id: string) => persistLinks(links.filter(l => l.id !== id));

  // ── Checklist (live save) ─────────────────────────────────────────────────────
  const persistChecklist = async (updated: ChecklistItem[]) => {
    if (!selected) return;
    setTaskSaving(true);
    try {
      await updateServiceRequest(selected.id, { checklist: updated as unknown as ChecklistItem[] });
      setChecklist(updated);
      setSelected(prev => prev ? { ...prev, checklist: updated } : prev);
    } catch (e: unknown) { setModalError(e instanceof Error ? e.message : "Failed."); }
    finally { setTaskSaving(false); }
  };
  const addTask    = async () => { if (!newTask.trim()) return; await persistChecklist([...checklist, { id: crypto.randomUUID(), text: newTask.trim(), done: false }]); setNewTask(""); };
  const toggleTask = (id: string) => persistChecklist(checklist.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTask = (id: string) => persistChecklist(checklist.filter(t => t.id !== id));

  // ── Quick advance ────────────────────────────────────────────────────────────
  const quickAdvance = async (req: ServiceRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = STATUS_ORDER.indexOf(req.status);
    if (idx < 0 || idx >= STATUS_ORDER.length - 1) return;
    const next = STATUS_ORDER[idx + 1];
    try {
      await updateServiceRequest(req.id, { status: next });
      logActivity(admin?.id ?? null, admin?.username ?? "admin",
        `Advanced ${info.label} request ${req.tracking_id} → ${next}`, "edit", admin?.department);
      setSuccess(`${req.tracking_id} → ${STATUS_CFG[next].label}`);
      await load();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed."); }
  };

  // ── Customize (travel) ──────────────────────────────────────────────────────
  const setCustomField = (key: string, value: unknown) =>
    setCustomData(prev => ({ ...prev, [key]: value }));

  const updateCustomItinerary = (items: CityItem[]) => {
    const text  = items.map(c => `${c.cityName} (${c.days} days)`).join(" → ");
    const total = items.reduce((sum, c) => sum + c.days, 0);
    setCustomData(prev => ({ ...prev, cityItinerary: items, cityItineraryText: text, totalTripDays: total }));
  };

  const handleCustomSave = async () => {
    if (!selected) return;
    setCustomSaving(true); setModalError("");
    try {
      // Rebuild selectedInterests from service flags
      const interests = Object.entries(TRAVEL_SERVICES)
        .filter(([k]) => customData[k] === true)
        .map(([, label]) => label);
      const toSave = { ...customData, selectedInterests: interests };
      await updateServiceRequest(selected.id, { data: toSave as Record<string, unknown> });
      setSelected(prev => prev ? { ...prev, data: toSave } : prev);
      setRequests(prev => prev.map(r => r.id === selected.id ? { ...r, data: toSave } : r));
      setSuccess(`${selected.tracking_id} — customizations saved.`);
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : "Failed to save.");
    } finally { setCustomSaving(false); }
  };

  // ── Project CRUD ─────────────────────────────────────────────────────────────
  const openNewProject = () => {
    setEditingProject(null);
    setPForm({ title: "", description: "", photo_url: "", link: "", status: "done", tags: "", order_index: projects.length });
    setProjectsError("");
    setShowProjectForm(true);
  };
  const openEditProject = (project: TechProject) => {
    setEditingProject(project);
    setPForm({
      title:       project.title,
      description: project.description ?? "",
      photo_url:   project.photo_url   ?? "",
      link:        project.link        ?? "",
      status:      project.status,
      tags:        project.tags.join(", "),
      order_index: project.order_index,
    });
    setProjectsError("");
    setShowProjectForm(true);
  };
  const handleProjectSave = async () => {
    if (!pForm.title.trim()) return;
    setProjectSaving(true); setProjectsError("");
    try {
      const payload = {
        title:       pForm.title.trim(),
        description: pForm.description.trim() || null,
        photo_url:   pForm.photo_url.trim()   || null,
        link:        pForm.link.trim()         || null,
        status:      pForm.status,
        tags:        pForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        order_index: pForm.order_index,
      };
      if (editingProject) {
        await updateTechProject(editingProject.id, payload);
        logActivity(admin?.id ?? null, admin?.username ?? "admin",
          `Updated tech project: ${pForm.title}`, "edit", admin?.department);
      } else {
        await createTechProject(payload);
        logActivity(admin?.id ?? null, admin?.username ?? "admin",
          `Created tech project: ${pForm.title}`, "create", admin?.department);
      }
      setShowProjectForm(false);
      setEditingProject(null);
      await loadProjects();
    } catch (e: unknown) {
      setProjectsError(e instanceof Error ? e.message : "Failed to save project.");
    } finally { setProjectSaving(false); }
  };
  const handleProjectDelete = async (id: string) => {
    setProjectDeleting(true);
    try {
      await deleteTechProject(id);
      logActivity(admin?.id ?? null, admin?.username ?? "admin",
        `Deleted tech project ${id}`, "delete", admin?.department);
      setProjectDeleteConfirm(null);
      await loadProjects();
    } catch (e: unknown) {
      setProjectsError(e instanceof Error ? e.message : "Failed to delete.");
      setProjectDeleteConfirm(null);
    } finally { setProjectDeleting(false); }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteServiceRequest(id);
      logActivity(admin?.id ?? null, admin?.username ?? "admin",
        `Deleted ${info.label} request ${id}`, "delete", admin?.department);
      setSuccess("Request deleted.");
      setDeleteConfirm(null);
      if (selected?.id === id) closeModal();
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete.");
      setDeleteConfirm(null);
    } finally { setDeleting(false); }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const counts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = requests.filter(r => r.status === s).length;
    return acc;
  }, {} as Record<RequestStatus, number>);

  const filtered = requests
    .filter(r => !filterStatus || r.status === filterStatus)
    .filter(r => {
      if (!search) return true;
      const q = search.toLowerCase();
      return r.tracking_id.toLowerCase().includes(q) ||
        (r.full_name ?? "").toLowerCase().includes(q) ||
        (r.email ?? "").toLowerCase().includes(q) ||
        r.service_type.toLowerCase().includes(q);
    });

  const doneCount = (cl: ChecklistItem[]) => cl.filter(t => t.done).length;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page-level tabs (tech dept only) */}
      {dept === "tech" && (
        <div style={{ display: "flex", marginBottom: 28, borderBottom: `1.5px solid ${C.hair}` }}>
          {([
            { key: "requests", label: "📋 Requests" },
            { key: "projects", label: "◆ Projects" },
          ] as { key: typeof pageTab; label: string }[]).map(tab => (
            <button key={tab.key} onClick={() => setPageTab(tab.key)}
              style={{ padding: "11px 22px", background: "none", border: "none", borderBottom: `2.5px solid ${pageTab === tab.key ? C.info : "transparent"}`, color: pageTab === tab.key ? C.info : C.muted, fontFamily: SANS, fontSize: 14, fontWeight: pageTab === tab.key ? 600 : 400, cursor: "pointer", marginBottom: -1.5, whiteSpace: "nowrap" }}>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Requests tab ──────────────────────────────────────────────────────── */}
      {pageTab === "requests" && (<>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.ink, margin: 0 }}>
            <span style={{ color: info.color, marginRight: 8 }}>◆</span>{info.label} Requests
          </h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            Incoming service requests from the {info.label.toLowerCase()} form
          </p>
        </div>
        <button onClick={load} style={{ padding: "9px 16px", borderRadius: 8, border: `1.5px solid ${C.hair}`, background: C.surface, fontSize: 13, cursor: "pointer", color: C.ink, fontFamily: SANS }}>↻ Refresh</button>
      </div>

      {error   && <div style={{ ...alertBase, background: C.dangerTint,   border: "1px solid #f5c6c2", color: C.danger   }}>{error}</div>}
      {success && <div style={{ ...alertBase, background: C.positiveTint, border: "1px solid #a9dfbf", color: C.positive }}>{success}</div>}

      {/* Status cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
        {STATUS_ORDER.map(s => {
          const cfg = STATUS_CFG[s];
          const active = filterStatus === s;
          return (
            <button key={s} onClick={() => setFilterStatus(active ? "" : s)}
              style={{ background: active ? cfg.bg : C.surface2, borderRadius: 10, padding: "14px", border: `1.5px solid ${active ? cfg.color : C.hair}`, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
              <p style={{ fontSize: 10, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>{cfg.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: cfg.color, margin: 0 }}>{counts[s]}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 14 }}>
        <input style={{ ...inputStyle, maxWidth: 380 }} placeholder="Search by name, email, tracking ID…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div style={{ background: C.surface2, borderRadius: 12, border: `1px solid ${C.hair}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["ID", "Name", "Contact", "Service", "Priority", "Status", "Links", "Tasks", "Due", "Date", ""].map(h => (
                <th key={h} style={{ padding: "10px 12px", fontWeight: 600, color: C.muted, fontSize: 11, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${C.hair}`, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={11} style={{ padding: 24, textAlign: "center", color: C.muted }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ padding: 40, textAlign: "center" }}>
                  {requests.length === 0 ? (
                    <div>
                      <p style={{ fontSize: 28, margin: "0 0 10px" }}>📭</p>
                      <p style={{ fontWeight: 600, fontSize: 15, color: C.ink, margin: "0 0 6px" }}>No {info.label} requests yet</p>
                      <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Submissions from the {info.label.toLowerCase()} form will appear here automatically.</p>
                    </div>
                  ) : <span style={{ color: C.muted }}>No requests match your filter.</span>}
                </td>
              </tr>
            ) : filtered.map((req, i) => {
              const linkCount = (req.links ?? []).length;
              const cl = req.checklist ?? [];
              const done = doneCount(cl);
              return (
                <tr key={req.id}
                  style={{ borderTop: i === 0 ? "none" : `1px solid ${C.hair}`, cursor: "pointer", transition: "background 0.1s" }}
                  onClick={() => openRequest(req)}
                  onMouseEnter={e => (e.currentTarget.style.background = C.accentTint)}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <td style={{ padding: "10px 12px", fontFamily: MONO, fontSize: 11, color: info.color, fontWeight: 700 }}>{req.tracking_id}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: C.ink }}>{req.full_name ?? "—"}</td>
                  <td style={{ padding: "10px 12px", color: C.muted, fontSize: 12 }}>
                    <div>{req.email ?? "—"}</div>
                    {req.phone && <div style={{ color: C.ink3, fontSize: 11, marginTop: 2 }}>{req.phone}</div>}
                  </td>
                  <td style={{ padding: "10px 12px", color: C.ink3, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{req.service_type}</td>
                  <td style={{ padding: "10px 12px" }}><PriorityBadge priority={req.priority} /></td>
                  <td style={{ padding: "10px 12px" }}><StatusBadge status={req.status} /></td>
                  <td style={{ padding: "10px 12px" }}>
                    {linkCount > 0 ? <span style={{ fontSize: 11, fontFamily: MONO, color: C.accent, background: C.accentTint, padding: "2px 7px", borderRadius: 100 }}>{linkCount} link{linkCount !== 1 ? "s" : ""}</span>
                      : <span style={{ color: C.hair }}>—</span>}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {cl.length > 0 ? <span style={{ fontSize: 11, fontFamily: MONO, color: done === cl.length ? C.positive : C.ink3, background: done === cl.length ? C.positiveTint : C.surface2, padding: "2px 7px", borderRadius: 100 }}>{done}/{cl.length}</span>
                      : <span style={{ color: C.hair }}>—</span>}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 11, fontFamily: MONO, color: req.due_at ? C.warning : C.muted }}>{req.due_at ? new Date(req.due_at).toLocaleDateString() : "—"}</td>
                  <td style={{ padding: "10px 12px", fontSize: 11, fontFamily: MONO, color: C.muted }}>{new Date(req.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
                    {deleteConfirm === req.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 11, color: C.danger, fontFamily: SANS, marginRight: 2 }}>Sure?</span>
                        <button onClick={() => handleDelete(req.id)} disabled={deleting}
                          style={{ padding: "4px 9px", borderRadius: 6, border: "none", background: C.danger, color: "#fff", fontSize: 11, cursor: "pointer", fontFamily: SANS, fontWeight: 700 }}>
                          {deleting ? "…" : "Yes"}
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          style={{ padding: "4px 9px", borderRadius: 6, border: `1.5px solid ${C.hair}`, background: "none", color: C.muted, fontSize: 11, cursor: "pointer", fontFamily: SANS }}>
                          No
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <button onClick={e => { e.stopPropagation(); openRequest(req); }}
                          style={{ padding: "4px 10px", borderRadius: 6, border: `1.5px solid ${info.color}`, background: "none", color: info.color, fontSize: 12, cursor: "pointer", fontFamily: SANS }}>
                          Open
                        </button>
                        {req.status !== "completed" && (
                          <button onClick={e => quickAdvance(req, e)}
                            style={{ padding: "4px 10px", borderRadius: 6, border: `1.5px solid ${C.hair}`, background: "none", color: C.muted, fontSize: 12, cursor: "pointer", fontFamily: SANS }}
                            title={`Advance to ${STATUS_CFG[STATUS_ORDER[STATUS_ORDER.indexOf(req.status)+1]]?.label}`}>↑</button>
                        )}
                        <button onClick={e => { e.stopPropagation(); setDeleteConfirm(req.id); }}
                          style={{ padding: "4px 8px", borderRadius: 6, border: `1.5px solid ${C.dangerTint}`, background: C.dangerTint, color: C.danger, fontSize: 12, cursor: "pointer", fontFamily: SANS }}
                          title="Delete request">🗑</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      </>)}

      {/* ── Projects tab (tech dept only) ─────────────────────────────────────── */}
      {pageTab === "projects" && dept === "tech" && (
        <div>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.ink, margin: 0 }}>
                <span style={{ color: C.info, marginRight: 8 }}>◆</span>Tech Projects
              </h1>
              <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                Portfolio projects and available services shown on the public Tech page
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={loadProjects}
                style={{ padding: "9px 16px", borderRadius: 8, border: `1.5px solid ${C.hair}`, background: C.surface, fontSize: 13, cursor: "pointer", color: C.ink, fontFamily: SANS }}>
                ↻ Refresh
              </button>
              <button onClick={openNewProject}
                style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: C.info, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                + New Project
              </button>
            </div>
          </div>

          {projectsError && (
            <div style={{ ...alertBase, background: C.dangerTint, border: "1px solid #f5c6c2", color: C.danger, marginBottom: 16 }}>
              {projectsError}
            </div>
          )}

          {/* Projects grid */}
          {projectsLoading ? (
            <div style={{ textAlign: "center", padding: 48, color: C.muted, fontFamily: SANS }}>Loading projects…</div>
          ) : projects.length === 0 ? (
            <div style={{ textAlign: "center", padding: 56, background: C.surface2, borderRadius: 14, border: `1px solid ${C.hair}` }}>
              <p style={{ fontSize: 36, marginBottom: 10 }}>🖼</p>
              <p style={{ fontWeight: 600, fontSize: 16, color: C.ink, margin: "0 0 8px" }}>No projects yet</p>
              <p style={{ fontSize: 13, color: C.muted, margin: "0 0 20px" }}>
                Post your first project or available service to show on the public Tech page.
              </p>
              <button onClick={openNewProject}
                style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: C.info, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                + Create First Project
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {projects.map(project => {
                const scfg = PROJECT_STATUS_CFG[project.status];
                return (
                  <div key={project.id} style={{ background: C.surface, borderRadius: 14, border: `1.5px solid ${C.hair}`, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(22,33,62,0.05)" }}>
                    {project.photo_url ? (
                      <div style={{ height: 170, overflow: "hidden", position: "relative" }}>
                        <img src={project.photo_url} alt={project.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <span style={{ position: "absolute", top: 10, right: 10, padding: "3px 10px", borderRadius: 100, fontSize: 10, fontFamily: MONO, fontWeight: 700, background: scfg.bg, color: scfg.color, backdropFilter: "blur(6px)" }}>
                          {scfg.label}
                        </span>
                        <span style={{ position: "absolute", top: 10, left: 10, padding: "2px 8px", borderRadius: 100, fontSize: 10, fontFamily: MONO, background: "rgba(22,33,62,0.55)", color: "#fff" }}>
                          #{project.order_index}
                        </span>
                      </div>
                    ) : (
                      <div style={{ height: 70, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                        <span style={{ fontSize: 28 }}>🖼</span>
                        <span style={{ position: "absolute", top: 10, right: 10, padding: "3px 10px", borderRadius: 100, fontSize: 10, fontFamily: MONO, fontWeight: 700, background: scfg.bg, color: scfg.color }}>
                          {scfg.label}
                        </span>
                        <span style={{ position: "absolute", top: 10, left: 10, padding: "2px 8px", borderRadius: 100, fontSize: 10, fontFamily: MONO, background: C.bg, color: C.muted }}>
                          #{project.order_index}
                        </span>
                      </div>
                    )}

                    <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h3 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, color: C.ink, margin: "0 0 5px" }}>{project.title}</h3>

                      {project.description && (
                        <p style={{ fontSize: 12, color: C.ink3, lineHeight: 1.55, margin: "0 0 8px", flex: 1,
                          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
                          {project.description}
                        </p>
                      )}

                      {project.tags.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                          {project.tags.map(tag => (
                            <span key={tag} style={{ padding: "2px 7px", borderRadius: 100, fontSize: 10, fontFamily: MONO, background: C.surface2, color: C.muted, border: `1px solid ${C.hair}` }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11, color: C.info, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", marginBottom: 10 }}>
                          ↗ {project.link}
                        </a>
                      )}

                      <div style={{ display: "flex", gap: 6, marginTop: "auto", alignItems: "center" }}>
                        <button onClick={() => openEditProject(project)}
                          style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: `1.5px solid ${C.info}`, background: "none", color: C.info, fontSize: 12, cursor: "pointer", fontFamily: SANS, fontWeight: 500 }}>
                          ✏ Edit
                        </button>
                        {projectDeleteConfirm === project.id ? (
                          <>
                            <span style={{ fontSize: 11, color: C.danger, fontFamily: SANS }}>Sure?</span>
                            <button onClick={() => handleProjectDelete(project.id)} disabled={projectDeleting}
                              style={{ padding: "6px 11px", borderRadius: 6, border: "none", background: C.danger, color: "#fff", fontSize: 11, cursor: "pointer", fontFamily: SANS, fontWeight: 700 }}>
                              {projectDeleting ? "…" : "Yes"}
                            </button>
                            <button onClick={() => setProjectDeleteConfirm(null)}
                              style={{ padding: "6px 11px", borderRadius: 6, border: `1.5px solid ${C.hair}`, background: "none", color: C.muted, fontSize: 11, cursor: "pointer", fontFamily: SANS }}>
                              No
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setProjectDeleteConfirm(project.id)}
                            style={{ padding: "6px 11px", borderRadius: 6, border: `1.5px solid ${C.dangerTint}`, background: C.dangerTint, color: C.danger, fontSize: 12, cursor: "pointer", fontFamily: SANS }}>
                            🗑
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Project create / edit modal */}
      {showProjectForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(22,33,62,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowProjectForm(false); }}>
          <div style={{ background: C.bg, borderRadius: 16, width: "100%", maxWidth: 580, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(22,33,62,0.28)" }}>
            {/* Form header */}
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.hair}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface, borderRadius: "16px 16px 0 0", position: "sticky", top: 0, zIndex: 1 }}>
              <h2 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 18, color: C.ink, margin: 0 }}>
                {editingProject ? "Edit Project" : "New Project"}
              </h2>
              <button onClick={() => setShowProjectForm(false)}
                style={{ background: "none", border: "none", fontSize: 24, color: C.muted, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>×</button>
            </div>

            <div style={{ padding: 24 }}>
              {projectsError && (
                <div style={{ ...alertBase, background: C.dangerTint, border: "1px solid #f5c6c2", color: C.danger }}>{projectsError}</div>
              )}

              {/* Title */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Title *</label>
                <input style={inputStyle} value={pForm.title}
                  onChange={e => setPForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. E-Commerce Platform" />
              </div>

              {/* Status picker */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Status</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["done", "available", "in_progress"] as TechProjectStatus[]).map(s => {
                    const scfg = PROJECT_STATUS_CFG[s];
                    const sel = pForm.status === s;
                    return (
                      <button key={s} onClick={() => setPForm(f => ({ ...f, status: s }))}
                        style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: `2px solid ${sel ? scfg.color : C.hair}`, background: sel ? scfg.bg : "none", color: sel ? scfg.color : C.muted, fontWeight: sel ? 700 : 400, fontSize: 12, cursor: "pointer", fontFamily: SANS, transition: "all 0.15s" }}>
                        {scfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical", lineHeight: 1.6 }}
                  value={pForm.description}
                  onChange={e => setPForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of the project or service…" />
              </div>

              {/* Photo URL + Link */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Photo URL</label>
                  <input style={inputStyle} value={pForm.photo_url}
                    onChange={e => setPForm(f => ({ ...f, photo_url: e.target.value }))}
                    placeholder="https://…" />
                </div>
                <div>
                  <label style={labelStyle}>Project Link</label>
                  <input style={inputStyle} value={pForm.link}
                    onChange={e => setPForm(f => ({ ...f, link: e.target.value }))}
                    placeholder="https://…" />
                </div>
              </div>

              {/* Tags + Order */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Tags (comma-separated)</label>
                  <input style={inputStyle} value={pForm.tags}
                    onChange={e => setPForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="e.g. React, Node.js, Supabase" />
                </div>
                <div>
                  <label style={labelStyle}>Order #</label>
                  <input type="number" min={0} style={inputStyle} value={pForm.order_index}
                    onChange={e => setPForm(f => ({ ...f, order_index: Number(e.target.value) }))} />
                </div>
              </div>

              {/* Photo preview */}
              {pForm.photo_url.trim() && (
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Photo Preview</label>
                  <img src={pForm.photo_url.trim()} alt="preview"
                    style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 10, border: `1px solid ${C.hair}` }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}

              <button onClick={handleProjectSave} disabled={projectSaving || !pForm.title.trim()}
                style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: (projectSaving || !pForm.title.trim()) ? C.muted : C.info, color: "#fff", fontSize: 14, fontWeight: 600, cursor: (projectSaving || !pForm.title.trim()) ? "not-allowed" : "pointer", fontFamily: SANS }}>
                {projectSaving ? "Saving…" : editingProject ? "💾 Save Changes" : "✦ Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          Detail Modal
      ══════════════════════════════════════════════ */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(22,33,62,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{ background: C.bg, borderRadius: 16, width: "100%", maxWidth: 960, height: "90vh", boxShadow: "0 20px 60px rgba(22,33,62,0.28)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Modal header */}
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.hair}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, background: C.surface }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div>
                  <p style={{ fontSize: 10, fontFamily: MONO, color: info.color, textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 3px" }}>
                    {info.label} · {selected.tracking_id}
                  </p>
                  <h2 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 18, color: C.ink, margin: 0 }}>
                    {selected.full_name ?? "Unknown"}
                  </h2>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <StatusBadge status={selected.status} />
                  <PriorityBadge priority={selected.priority} />
                  {(selected.links ?? []).length > 0 && (
                    <span style={{ fontSize: 11, fontFamily: MONO, color: C.accent, background: C.accentTint, padding: "2px 8px", borderRadius: 100 }}>{(selected.links ?? []).length} links</span>
                  )}
                  {(selected.checklist ?? []).length > 0 && (
                    <span style={{ fontSize: 11, fontFamily: MONO, color: C.positive, background: C.positiveTint, padding: "2px 8px", borderRadius: 100 }}>
                      {doneCount(selected.checklist ?? [])}/{(selected.checklist ?? []).length} done
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {deleteConfirm === selected.id ? (
                  <>
                    <span style={{ fontSize: 12, color: C.danger, fontFamily: SANS }}>Delete this request?</span>
                    <button onClick={() => handleDelete(selected.id)} disabled={deleting}
                      style={{ padding: "6px 14px", borderRadius: 7, border: "none", background: C.danger, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
                      {deleting ? "Deleting…" : "Yes, Delete"}
                    </button>
                    <button onClick={() => setDeleteConfirm(null)}
                      style={{ padding: "6px 12px", borderRadius: 7, border: `1.5px solid ${C.hair}`, background: "none", color: C.muted, fontSize: 12, cursor: "pointer", fontFamily: SANS }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setDeleteConfirm(selected.id)}
                    style={{ padding: "6px 12px", borderRadius: 7, border: `1.5px solid ${C.dangerTint}`, background: C.dangerTint, color: C.danger, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                    🗑 Delete
                  </button>
                )}
                <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: 24, color: C.muted, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>×</button>
              </div>
            </div>

            {/* Body */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

              {/* Left: submission details (dept-aware) */}
              <div style={{ width: 290, flexShrink: 0, padding: "18px 20px", borderRight: `1px solid ${C.hair}`, overflowY: "auto", background: C.surface }}>
                <p style={{ fontSize: 11, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>Submission Details</p>

                <SubmissionDetails req={selected} dept={dept ?? "tech"} />

                {/* Stage tracker */}
                <div style={{ marginTop: 20, padding: "14px", background: C.bg, borderRadius: 8, border: `1px solid ${C.hair}` }}>
                  <p style={{ fontSize: 10, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>Stage</p>
                  {STATUS_ORDER.map((s, idx) => {
                    const cfg = STATUS_CFG[s];
                    const done = idx <= STATUS_ORDER.indexOf(selected.status);
                    return (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: done ? cfg.color : C.hair, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: done ? cfg.color : C.muted, fontWeight: done ? 600 : 400, fontFamily: SANS }}>
                          {cfg.label}{s === selected.status && <span style={{ fontSize: 10, color: C.muted, marginLeft: 4 }}>← now</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p style={{ fontSize: 11, color: C.muted, marginTop: 14 }}>
                  Received {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>

              {/* Right: tabbed panel */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* Tab bar */}
                <div style={{ display: "flex", borderBottom: `1px solid ${C.hair}`, background: C.surface, flexShrink: 0, padding: "0 24px" }}>
                  {([
                    { key: "process",   label: "Process" },
                    { key: "links",     label: dept === "travel" ? `Bookings & Links${links.length ? ` (${links.length})` : ""}` : dept === "consulting" ? `Links & Docs${links.length ? ` (${links.length})` : ""}` : `Links & Demos${links.length ? ` (${links.length})` : ""}` },
                    { key: "checklist", label: `Checklist${checklist.length ? ` (${doneCount(checklist)}/${checklist.length})` : ""}` },
                    ...(dept === "travel" ? [{ key: "customize" as const, label: "✏ Customize" }] : []),
                  ] as { key: typeof activeTab; label: string }[]).map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                      style={{ padding: "12px 18px", background: "none", border: "none", borderBottom: `2.5px solid ${activeTab === tab.key ? info.color : "transparent"}`, color: activeTab === tab.key ? info.color : C.muted, fontFamily: SANS, fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400, cursor: "pointer", marginBottom: -1, whiteSpace: "nowrap" }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div style={{ padding: "22px 24px", flex: 1, overflowY: "auto" }}>

                  {/* ── PROCESS TAB ── */}
                  {activeTab === "process" && (
                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                        <div>
                          <label style={labelStyle}>Status</label>
                          <select style={inputStyle} value={editStatus} onChange={e => setEditStatus(e.target.value as RequestStatus)}>
                            {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Priority</label>
                          <select style={inputStyle} value={editPriority} onChange={e => setEditPriority(e.target.value as RequestPriority | "")}>
                            <option value="">— None —</option>
                            {PRIORITY_ORDER.map(p => <option key={p} value={p}>{PRIORITY_CFG[p].label}</option>)}
                          </select>
                        </div>
                      </div>

                      {editStatus !== "completed" && (
                        <button onClick={() => { const idx = STATUS_ORDER.indexOf(editStatus); if (idx < STATUS_ORDER.length - 1) setEditStatus(STATUS_ORDER[idx + 1]); }}
                          style={{ width: "100%", padding: "8px", borderRadius: 7, border: `1.5px solid ${C.hair}`, background: "none", color: C.muted, fontSize: 12, cursor: "pointer", fontFamily: SANS, marginBottom: 14 }}>
                          ↑ Advance to: <strong>{STATUS_CFG[STATUS_ORDER[STATUS_ORDER.indexOf(editStatus) + 1]]?.label}</strong>
                        </button>
                      )}

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                        <div>
                          <label style={labelStyle}>Assign To</label>
                          <select style={inputStyle} value={editWorker} onChange={e => setEditWorker(e.target.value)}>
                            <option value="">— Unassigned —</option>
                            {workers.map(w => <option key={w.id} value={w.id}>{w.full_name}{w.role_title ? ` · ${w.role_title}` : ""}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Due Date</label>
                          <input type="date" style={inputStyle} value={editDue} onChange={e => setEditDue(e.target.value)} />
                        </div>
                      </div>

                      <div style={{ marginBottom: 20 }}>
                        <label style={labelStyle}>Progress Notes / Report</label>
                        <textarea style={{ ...inputStyle, minHeight: 130, resize: "vertical", lineHeight: 1.6 }}
                          value={editReport} onChange={e => setEditReport(e.target.value)}
                          placeholder="Add progress notes, findings, or client communication…" />
                      </div>

                      {modalError && <div style={{ ...alertBase, background: C.dangerTint, border: "1px solid #f5c6c2", color: C.danger }}>{modalError}</div>}
                      <button onClick={handleSave} disabled={saving}
                        style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: saving ? C.muted : info.color, color: "#fff", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: SANS }}>
                        {saving ? "Saving…" : "Save Changes"}
                      </button>
                    </div>
                  )}

                  {/* ── LINKS TAB (dept-aware) ── */}
                  {activeTab === "links" && (
                    <div>
                      {links.length > 0 ? (
                        <div style={{ marginBottom: 24 }}>
                          {links.map(link => {
                            const cfg = linkCfgMap[link.type] ?? linkTypes[linkTypes.length - 1];
                            return (
                              <div key={link.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.surface, borderRadius: 10, border: `1px solid ${C.hair}`, marginBottom: 8 }}>
                                <span style={{ width: 36, height: 36, borderRadius: 8, background: `${cfg.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: cfg.color, flexShrink: 0 }}>
                                  {cfg.icon}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{link.label}</span>
                                    <span style={{ fontSize: 10, fontFamily: MONO, padding: "1px 6px", borderRadius: 100, background: `${cfg.color}18`, color: cfg.color }}>{cfg.label}</span>
                                  </div>
                                  <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                    style={{ fontSize: 12, color: info.color, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", maxWidth: "100%" }}>
                                    {link.url}
                                  </a>
                                </div>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                  style={{ padding: "5px 10px", borderRadius: 6, background: info.color, color: "#fff", fontSize: 12, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
                                  Open ↗
                                </a>
                                <button onClick={() => removeLink(link.id)}
                                  style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 2px", flexShrink: 0 }}>×</button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ padding: "32px 0", textAlign: "center", color: C.muted, marginBottom: 24 }}>
                          <p style={{ fontSize: 32, marginBottom: 8 }}>
                            {dept === "travel" ? "✈" : dept === "consulting" ? "📄" : "🔗"}
                          </p>
                          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, color: C.ink }}>No links saved yet</p>
                          <p style={{ fontSize: 13 }}>
                            {dept === "travel"
                              ? "Add booking references, hotel links, flight info, visa appointments, and documents."
                              : dept === "consulting"
                              ? "Add proposals, meeting links, reports, contracts, and client site links."
                              : "Add demos, repos, Figma files, staging URLs, and meeting links."}
                          </p>
                        </div>
                      )}

                      {/* Add link form */}
                      <div style={{ background: C.surface, borderRadius: 12, padding: "18px", border: `1.5px solid ${C.hair}` }}>
                        <p style={{ fontSize: 11, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>Add Link</p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                          <div>
                            <label style={labelStyle}>Label</label>
                            <input style={inputStyle} value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)}
                              placeholder={dept === "travel" ? "e.g. Booking Confirmation…" : dept === "consulting" ? "e.g. Project Proposal…" : "e.g. Live Demo…"}
                              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); linkUrlRef.current?.focus(); } }} />
                          </div>
                          <div>
                            <label style={labelStyle}>Type</label>
                            <select style={inputStyle} value={newLinkType} onChange={e => setNewLinkType(e.target.value as RequestLinkType)}>
                              {linkTypes.map(t => <option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
                            </select>
                          </div>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                          <label style={labelStyle}>URL</label>
                          <input ref={linkUrlRef} style={inputStyle} value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="https://…"
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }} />
                        </div>

                        {/* Type chips */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                          {linkTypes.map(t => (
                            <button key={t.key} onClick={() => setNewLinkType(t.key)}
                              style={{ padding: "4px 10px", borderRadius: 100, fontSize: 11, border: `1.5px solid ${newLinkType === t.key ? t.color : C.hair}`, background: newLinkType === t.key ? `${t.color}18` : "none", color: newLinkType === t.key ? t.color : C.muted, cursor: "pointer", fontFamily: MONO }}>
                              {t.icon} {t.label}
                            </button>
                          ))}
                        </div>

                        {modalError && <div style={{ ...alertBase, background: C.dangerTint, border: "1px solid #f5c6c2", color: C.danger }}>{modalError}</div>}
                        <button onClick={addLink} disabled={linkSaving || !newLinkLabel.trim() || !newLinkUrl.trim()}
                          style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: (linkSaving || !newLinkLabel.trim() || !newLinkUrl.trim()) ? C.muted : info.color, color: "#fff", fontSize: 13, fontWeight: 600, cursor: (linkSaving || !newLinkLabel.trim() || !newLinkUrl.trim()) ? "not-allowed" : "pointer", fontFamily: SANS }}>
                          {linkSaving ? "Saving…" : "+ Add Link"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── CHECKLIST TAB ── */}
                  {activeTab === "checklist" && (
                    <div>
                      {checklist.length > 0 && (
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                            <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.hair, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${checklist.length ? (doneCount(checklist) / checklist.length) * 100 : 0}%`, background: C.positive, borderRadius: 3, transition: "width 0.3s" }} />
                            </div>
                            <span style={{ fontSize: 12, fontFamily: MONO, color: C.positive, flexShrink: 0 }}>{doneCount(checklist)}/{checklist.length} done</span>
                          </div>
                          {checklist.map(task => (
                            <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.surface, borderRadius: 10, border: `1px solid ${C.hair}`, marginBottom: 8, opacity: task.done ? 0.6 : 1, transition: "opacity 0.2s" }}>
                              <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)}
                                style={{ width: 16, height: 16, accentColor: info.color, flexShrink: 0, cursor: "pointer" }} />
                              <span style={{ flex: 1, fontSize: 13, color: C.ink, textDecoration: task.done ? "line-through" : "none", lineHeight: 1.4 }}>{task.text}</span>
                              <button onClick={() => removeTask(task.id)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 2px", flexShrink: 0 }}>×</button>
                            </div>
                          ))}
                        </div>
                      )}

                      {checklist.length === 0 && (
                        <div style={{ padding: "32px 0", textAlign: "center", color: C.muted, marginBottom: 24 }}>
                          <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
                          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, color: C.ink }}>No tasks yet</p>
                          <p style={{ fontSize: 13 }}>Add checklist items to track what needs to be done for this request.</p>
                        </div>
                      )}

                      {/* Add task */}
                      <div style={{ background: C.surface, borderRadius: 12, padding: "16px 18px", border: `1.5px solid ${C.hair}` }}>
                        <p style={{ fontSize: 11, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>Add Task</p>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input style={{ ...inputStyle, flex: 1 }} value={newTask} onChange={e => setNewTask(e.target.value)}
                            placeholder="e.g. Book accommodation, Send proposal…"
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTask(); } }} />
                          <button onClick={addTask} disabled={taskSaving || !newTask.trim()}
                            style={{ padding: "9px 18px", borderRadius: 7, border: "none", background: (taskSaving || !newTask.trim()) ? C.muted : info.color, color: "#fff", fontSize: 13, fontWeight: 600, cursor: (taskSaving || !newTask.trim()) ? "not-allowed" : "pointer", fontFamily: SANS, whiteSpace: "nowrap" }}>
                            {taskSaving ? "…" : "+ Add"}
                          </button>
                        </div>
                        <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Press Enter to add quickly</p>

                        {/* Quick templates (dept-specific) */}
                        <div style={{ marginTop: 12 }}>
                          <p style={{ fontSize: 11, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Quick add</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {templates.map(t => (
                              <button key={t} onClick={() => setNewTask(t)}
                                style={{ padding: "4px 10px", borderRadius: 100, fontSize: 11, border: `1.5px solid ${C.hair}`, background: "none", color: C.muted, cursor: "pointer", fontFamily: SANS }}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        {modalError && <div style={{ ...alertBase, background: C.dangerTint, border: "1px solid #f5c6c2", color: C.danger, marginTop: 10 }}>{modalError}</div>}
                      </div>
                    </div>
                  )}

                  {/* ── CUSTOMIZE TAB (travel only) ── */}
                  {activeTab === "customize" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                      {/* ── Route & Entry ── */}
                      <div style={{ background: C.surface, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.hair}` }}>
                        <p style={{ fontSize: 11, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>Route & Entry</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div>
                            <label style={labelStyle}>Departure Country</label>
                            <input style={inputStyle} value={String(customData.departureCountry ?? "")}
                              onChange={e => setCustomField("departureCountry", e.target.value)}
                              placeholder="e.g. Turkey" />
                          </div>
                          <div>
                            <label style={labelStyle}>Transport Mode</label>
                            <select style={inputStyle} value={String(customData.transportMode ?? "")}
                              onChange={e => setCustomField("transportMode", e.target.value)}>
                              <option value="">— Select —</option>
                              {TRANSPORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                            </select>
                          </div>
                          <div style={{ gridColumn: "1/-1" }}>
                            <label style={labelStyle}>Entry Point</label>
                            <select style={inputStyle} value={String(customData.entryPoint ?? "")}
                              onChange={e => setCustomField("entryPoint", e.target.value)}>
                              <option value="">— Select —</option>
                              {ENTRY_OPTIONS.map(o => <option key={o}>{o}</option>)}
                              <option value={String(customData.entryPoint ?? "") || "custom"}>
                                {String(customData.entryPoint ?? "") || "Custom…"}
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* ── City Itinerary ── */}
                      <div style={{ background: C.surface, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.hair}` }}>
                        <p style={{ fontSize: 11, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>City Itinerary</p>
                        {(Array.isArray(customData.cityItinerary)
                          ? (customData.cityItinerary as CityItem[])
                          : []
                        ).map((city, idx) => {
                          const items = customData.cityItinerary as CityItem[];
                          return (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <span style={{ width: 22, height: 22, borderRadius: "50%", background: C.accent, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: MONO }}>
                                {idx + 1}
                              </span>
                              <input style={{ ...inputStyle, flex: 1 }} value={city.cityName}
                                onChange={e => {
                                  const updated = items.map((c, i) => i === idx ? { ...c, cityName: e.target.value } : c);
                                  updateCustomItinerary(updated);
                                }} />
                              <button onClick={() => updateCustomItinerary(items.map((c, i) => i === idx ? { ...c, days: Math.max(1, c.days - 1) } : c))}
                                style={{ width: 28, height: 28, borderRadius: 7, border: `1.5px solid ${C.hair}`, background: C.surface2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>−</button>
                              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: C.accent, minWidth: 22, textAlign: "center" }}>{city.days}</span>
                              <button onClick={() => updateCustomItinerary(items.map((c, i) => i === idx ? { ...c, days: Math.min(21, c.days + 1) } : c))}
                                style={{ width: 28, height: 28, borderRadius: 7, border: `1.5px solid ${C.hair}`, background: C.surface2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>+</button>
                              <span style={{ fontSize: 11, color: C.muted, fontFamily: MONO }}>d</span>
                              <button onClick={() => updateCustomItinerary(items.filter((_, i) => i !== idx))}
                                style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 2px", flexShrink: 0 }}>×</button>
                            </div>
                          );
                        })}

                        {/* Add city row */}
                        <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                          <input style={{ ...inputStyle, flex: 1 }} placeholder="Add city name…"
                            value={newCityName} onChange={e => setNewCityName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (!newCityName.trim()) return;
                                const item: CityItem = { cityId: newCityName.toLowerCase().replace(/\s+/g, "_"), cityName: newCityName.trim(), days: newCityDays };
                                updateCustomItinerary([...(Array.isArray(customData.cityItinerary) ? (customData.cityItinerary as CityItem[]) : []), item]);
                                setNewCityName(""); setNewCityDays(2);
                              }
                            }} />
                          <input type="number" min={1} max={21} style={{ ...inputStyle, width: 60, textAlign: "center" }}
                            value={newCityDays} onChange={e => setNewCityDays(Math.max(1, Number(e.target.value)))} />
                          <span style={{ fontSize: 11, color: C.muted, fontFamily: MONO, flexShrink: 0 }}>d</span>
                          <button onClick={() => {
                            if (!newCityName.trim()) return;
                            const item: CityItem = { cityId: newCityName.toLowerCase().replace(/\s+/g, "_"), cityName: newCityName.trim(), days: newCityDays };
                            updateCustomItinerary([...(Array.isArray(customData.cityItinerary) ? (customData.cityItinerary as CityItem[]) : []), item]);
                            setNewCityName(""); setNewCityDays(2);
                          }} style={{ padding: "9px 14px", borderRadius: 7, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                            + Add
                          </button>
                        </div>

                        {Array.isArray(customData.cityItinerary) && (customData.cityItinerary as CityItem[]).length > 0 && (
                          <p style={{ fontSize: 11, color: C.muted, marginTop: 10, fontFamily: MONO, lineHeight: 1.5 }}>
                            Total: <strong style={{ color: C.accent }}>{(customData.cityItinerary as CityItem[]).reduce((s, c) => s + c.days, 0)} days</strong>
                            {" · "}{(customData.cityItinerary as CityItem[]).map(c => `${c.cityName} (${c.days}d)`).join(" → ")}
                          </p>
                        )}
                      </div>

                      {/* ── Services ── */}
                      <div style={{ background: C.surface, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.hair}` }}>
                        <p style={{ fontSize: 11, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>Services</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                          {Object.entries(TRAVEL_SERVICES).map(([key, label]) => {
                            const checked = customData[key] === true;
                            return (
                              <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${checked ? C.positive : C.hair}`, background: checked ? "rgba(16,185,129,0.06)" : C.surface2, transition: "all 0.15s" }}>
                                <input type="checkbox" checked={checked}
                                  onChange={e => setCustomField(key, e.target.checked)}
                                  style={{ accentColor: C.positive, cursor: "pointer", width: 15, height: 15 }} />
                                <span style={{ fontSize: 12, color: checked ? C.positive : C.ink3, fontWeight: checked ? 600 : 400, fontFamily: SANS }}>{label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* ── Budget Tier ── */}
                      <div style={{ background: C.surface, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.hair}` }}>
                        <p style={{ fontSize: 11, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>Budget Tier</p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {BUDGET_TIERS.map(b => {
                            const sel = customData.budgetRange === b.key;
                            return (
                              <button key={b.key} onClick={() => setCustomField("budgetRange", b.key)}
                                style={{ padding: "8px 16px", borderRadius: 9, border: `2px solid ${sel ? b.color : C.hair}`, background: sel ? `${b.color}14` : "none", color: sel ? b.color : C.ink3, fontWeight: sel ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: SANS, transition: "all 0.15s" }}>
                                {b.label}
                                {sel && " ✓"}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ── Trip Settings ── */}
                      <div style={{ background: C.surface, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.hair}` }}>
                        <p style={{ fontSize: 11, fontFamily: MONO, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>Trip Settings</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div>
                            <label style={labelStyle}>Arrival Date</label>
                            <input type="date" style={inputStyle} value={String(customData.dateOfArrival ?? "")}
                              onChange={e => setCustomField("dateOfArrival", e.target.value)} />
                          </div>
                          <div>
                            <label style={labelStyle}>Departure Date</label>
                            <input type="date" style={inputStyle}
                              min={String(customData.dateOfArrival ?? "")}
                              value={String(customData.dateOfDeparture ?? "")}
                              onChange={e => setCustomField("dateOfDeparture", e.target.value)} />
                          </div>
                          <div>
                            <label style={labelStyle}>Travelers</label>
                            <input type="number" min={1} style={inputStyle}
                              value={Number(customData.travelersCount ?? 1)}
                              onChange={e => setCustomField("travelersCount", Number(e.target.value))} />
                          </div>
                          <div>
                            <label style={labelStyle}>Accommodation</label>
                            <select style={inputStyle} value={String(customData.accommodationClass ?? "4-Star")}
                              onChange={e => setCustomField("accommodationClass", e.target.value)}>
                              {["3-Star", "4-Star", "5-Star", "Boutique", "Apartment / Villa"].map(v => <option key={v}>{v}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={labelStyle}>Permit Type</label>
                            <select style={inputStyle} value={String(customData.visaType ?? "Tourist")}
                              onChange={e => setCustomField("visaType", e.target.value)}>
                              {["Tourist", "Business", "Work", "Student", "Residency"].map(v => <option key={v}>{v}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={labelStyle}>Trip Purpose</label>
                            <select style={inputStyle} value={String(customData.tripPurpose ?? "Leisure")}
                              onChange={e => setCustomField("tripPurpose", e.target.value)}>
                              {["Leisure", "Business", "Relocation", "Family Visit", "Medical"].map(v => <option key={v}>{v}</option>)}
                            </select>
                          </div>
                          <div style={{ gridColumn: "1/-1" }}>
                            <label style={labelStyle}>Preferred Language</label>
                            <select style={inputStyle} value={String(customData.preferredLanguage ?? "English")}
                              onChange={e => setCustomField("preferredLanguage", e.target.value)}>
                              {["English", "Albanian", "Arabic", "Turkish", "Greek"].map(v => <option key={v}>{v}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                      {modalError && <div style={{ ...alertBase, background: C.dangerTint, border: "1px solid #f5c6c2", color: C.danger }}>{modalError}</div>}
                      <button onClick={handleCustomSave} disabled={customSaving}
                        style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: customSaving ? C.muted : info.color, color: "#fff", fontSize: 14, fontWeight: 600, cursor: customSaving ? "not-allowed" : "pointer", fontFamily: SANS }}>
                        {customSaving ? "Saving…" : "💾 Save All Customizations"}
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
