import { useEffect, useMemo, useState } from "react";
import SeoHead from "@/components/SeoHead";
import {
  createServiceRequest,
  getServicesByArea,
  getSettingsByArea,
  getTechProjects,
  type CompanySetting,
  type ServiceCatalogItem,
  type ServiceRequest,
  type TechProject,
} from "@/lib/supabaseApi";
import {
  ArrowRight,
  Cloud,
  Code2,
  Database,
  ExternalLink,
  Menu,
  Phone,
  Mail,
  ShieldCheck,
  User,
  X,
  Zap,
} from "lucide-react";

const C = {
  bgDark: "#020617",
  cardDark: "rgba(255,255,255,0.035)",
  borderSoft: "rgba(255,255,255,0.10)",
  textMain: "#FFFFFF",
  textMuted: "#CBD5E1",
  textSoft: "#94A3B8",
  blueMain: "#2563EB",
  blueLight: "#60A5FA",
  blueGlow: "rgba(37,99,235,0.35)",
};

const FONT_STACK = "'Rostex', Inter, Satoshi, Manrope, sans-serif";
const MONO_STACK = "'JetBrains Mono', 'Fira Code', monospace";

const STATIC_SERVICES = [
  "Custom Software Development",
  "Website Design & Development",
  "Web Apps & Dashboards",
  "Mobile App Development",
  "E-commerce Platforms",
  "Cloud Infrastructure",
];

const processSteps = [
  {
    title: "Discovery",
    text: "We map the product, scope, and deadlines before a sprint starts.",
  },
  {
    title: "Build",
    text: "Senior engineers ship in focused iterations with direct communication.",
  },
  {
    title: "Launch",
    text: "Deployment, QA, handoff, and support are handled in one flow.",
  },
];

const whyUs = [
  {
    icon: User,
    title: "Senior Engineers",
    text: "Direct access to experienced builders, not handoffs through layers of account management.",
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    text: "Focused scope, tight execution, and clean architecture keep delivery in weeks, not months.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Scalable",
    text: "Production-minded systems built for growth, reliability, and long-term ownership.",
  },
];

const stackCards = [
  { name: "React", icon: "https://cdn.simpleicons.org/react/61DAFB" },
  { name: "Node.js", icon: "https://cdn.simpleicons.org/nodedotjs/5FA04E" },
  { name: "Next.js", icon: "https://cdn.simpleicons.org/nextdotjs/FFFFFF" },
  { name: "AWS", icon: "https://www.vectorlogo.zone/logos/amazon_aws/amazon_aws-ar21.svg" },
  { name: "PostgreSQL", icon: "https://cdn.simpleicons.org/postgresql/336791" },
  { name: "+ More", icon: "" },
];

const faqs = [
  {
    q: "How fast can Kayrosco Tech start?",
    a: "After initial alignment we can typically move into delivery planning within days, depending on scope and current queue.",
  },
  {
    q: "Do you build both websites and software products?",
    a: "Yes. We handle marketing sites, web apps, internal systems, e-commerce, and broader custom software delivery.",
  },
  {
    q: "Can you work with an existing codebase?",
    a: "Yes. We can audit, improve, extend, and stabilize existing systems before adding new features.",
  },
  {
    q: "Do you provide post-launch support?",
    a: "Yes. We support monitoring, fixes, iteration, and scaling after launch based on what the product needs.",
  },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function GlassCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: C.cardDark,
        border: `1px solid ${C.borderSoft}`,
        backdropFilter: "blur(20px)",
        borderRadius: 18,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div style={{ maxWidth: 760, marginBottom: 34 }}>
      <div
        style={{
          color: C.blueLight,
          fontSize: 13,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          margin: 0,
          color: C.textMain,
          fontFamily: "'Orbitron', 'Rostex', Inter, sans-serif",
          fontSize: "clamp(32px, 4vw, 54px)",
          lineHeight: 0.96,
          fontWeight: 800,
          letterSpacing: "-0.03em",
        }}
      >
        {title}
      </h2>
      {text && (
        <p
          style={{
            margin: "16px 0 0",
            color: C.textSoft,
            fontSize: 16,
            lineHeight: 1.7,
            maxWidth: 620,
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
}

function CodeCard() {
  return (
    <div
      style={{
        background: "rgba(2,6,23,0.75)",
        border: `1px solid ${C.borderSoft}`,
        borderRadius: 16,
        overflow: "hidden",
        fontFamily: MONO_STACK,
        boxShadow: `0 0 35px ${C.blueGlow}`,
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${C.borderSoft}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: C.textMuted,
          fontSize: 14,
        }}
      >
        <span style={{ color: C.blueLight }}>solution.ts</span>
        <span style={{ color: "#86EFAC" }}>Compiled</span>
      </div>
      <div style={{ padding: "22px 24px", color: C.textMuted, fontSize: 14, lineHeight: 2 }}>
        <div>
          <span style={{ color: "#64748B", marginRight: 16 }}>1</span>
          <span style={{ color: "#C084FC" }}>const</span>{" "}
          <span style={{ color: "#F8FAFC" }}>buildSolution</span> =
          <span style={{ color: "#60A5FA" }}> async</span> (client) =&gt; {"{"}
        </div>
        <div>
          <span style={{ color: "#64748B", marginRight: 16 }}>2</span>
          <span style={{ color: "#60A5FA" }}>const</span>{" "}
          <span style={{ color: "#F8FAFC" }}>scope</span> =
          <span style={{ color: "#60A5FA" }}> await</span> discover(client.goals);
        </div>
        <div>
          <span style={{ color: "#64748B", marginRight: 16 }}>3</span>
          <span style={{ color: "#60A5FA" }}>const</span>{" "}
          <span style={{ color: "#F8FAFC" }}>team</span> = assignSeniorEngineers(scope);
        </div>
        <div>
          <span style={{ color: "#64748B", marginRight: 16 }}>4</span>
          <span style={{ color: "#84CC16" }}>// sprint 1 → always on schedule</span>
        </div>
        <div>
          <span style={{ color: "#64748B", marginRight: 16 }}>5</span>
          <span style={{ color: "#60A5FA" }}>return</span> ship({"{"} team, scope, deadline {"}"});
        </div>
        <div>
          <span style={{ color: "#64748B", marginRight: 16 }}>6</span>
          {"}"}
        </div>
      </div>
      <div
        style={{
          padding: "14px 20px",
          borderTop: `1px solid ${C.borderSoft}`,
          display: "flex",
          gap: 18,
          flexWrap: "wrap",
          color: C.textSoft,
          fontSize: 13,
        }}
      >
        <span>TypeScript</span>
        <span>98% test coverage</span>
        <span>0 vulnerabilities</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}

function TechPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<TechProject[]>([]);
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [settings, setSettings] = useState<CompanySetting | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<ServiceRequest | null>(null);
  const [error, setError] = useState("");
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    service_type: "",
    company: "",
    budget: "",
    timeline: "",
    details: "",
  });

  useEffect(() => {
    const fontId = "kayrosco-tech-premium-fonts";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Orbitron:wght@600;700;800&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    getTechProjects().then(setProjects).catch(() => {});
    getServicesByArea("tech").then(setServices).catch(() => {});
    getSettingsByArea("tech").then(setSettings).catch(() => {});
  }, []);

  const serviceOptions = useMemo(
    () => (services.length ? services.map((item) => item.title) : STATIC_SERVICES),
    [services]
  );
  const visibleServiceCards = useMemo(
    () => [
      { icon: Code2, title: "Custom Software", text: "Internal systems, business tools, and tailored platforms built around your workflows." },
      { icon: Database, title: "Data & Backend", text: "APIs, architecture, integrations, and databases designed for stability and scale." },
      { icon: Cloud, title: "Cloud & Delivery", text: "Deployment pipelines, hosting, monitoring, and infrastructure that keeps products running." },
    ],
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);
    try {
      const created = await createServiceRequest({
        service_area: "tech",
        service_type: form.service_type,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        data: {
          company: form.company,
          budget: form.budget,
          timeline: form.timeline,
          details: form.details,
        },
      });
      setSuccess(created);
      setForm({
        full_name: "",
        email: "",
        phone: "",
        service_type: serviceOptions[0] || "",
        company: "",
        budget: "",
        timeline: "",
        details: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!form.service_type && serviceOptions.length) {
      setForm((current) => ({ ...current, service_type: serviceOptions[0] }));
    }
  }, [serviceOptions, form.service_type]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: C.bgDark,
        color: C.textMain,
        fontFamily: FONT_STACK,
      }}
    >
      <SeoHead
        title="Kayrosco Tech | Premium Software, Web & Cloud Delivery"
        description="Kayrosco Tech builds premium websites, apps, software systems, and cloud solutions with fast delivery, senior engineers, and secure scalable architecture."
        canonicalPath="/tech"
        keywords={[
          "Kayrosco Tech",
          "software development",
          "web development",
          "cloud solutions",
          "tech agency",
        ]}
      />

      <style>{`
        @font-face {
          font-family: 'Rostex';
          src: local('Rostex'), local('Rostex Regular');
          font-display: swap;
        }
        .tk-wrap { max-width: 1360px; margin: 0 auto; padding: 0 32px; }
        .tk-nav-link { color: ${C.textMuted}; text-decoration: none; font-size: 15px; transition: color .18s ease; }
        .tk-nav-link:hover { color: ${C.textMain}; }
        .tk-primary { background: linear-gradient(135deg, ${C.blueMain}, ${C.blueLight}); color: white; border: none; border-radius: 10px; padding: 16px 28px; font-weight: 600; cursor: pointer; box-shadow: none; }
        .tk-secondary { background: transparent; color: white; border: 1px solid rgba(255,255,255,0.18); border-radius: 10px; padding: 16px 28px; font-weight: 600; cursor: pointer; }
        .tk-header-shell {
          max-width: 1520px;
          margin: 0 auto;
          padding: 12px 24px 0;
          position: relative;
          z-index: 6;
        }
        .tk-header-bar {
          min-height: 80px;
          padding: 0 26px;
          border-radius: 26px;
          border: 1px solid rgba(255,255,255,0.10);
          background: linear-gradient(180deg, rgba(8,12,22,0.92) 0%, rgba(8,12,22,0.82) 100%);
          backdrop-filter: blur(20px);
          box-shadow: 0 16px 42px rgba(0,0,0,0.28);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }
        .tk-brand {
          display: inline-flex;
          align-items: center;
          color: ${C.textMain};
          text-decoration: none;
          min-width: 190px;
        }
        .tk-brand-text {
          position: relative;
          display: inline-block;
          color: ${C.textMain};
          font-size: 26px;
          font-weight: 800;
          letter-spacing: 0.14em;
          line-height: 1;
          isolation: isolate;
        }
        .tk-brand-text::before,
        .tk-brand-text::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
        }
        .tk-brand-text::before {
          color: rgba(96,165,250,0.75);
          animation: tk-brand-glitch-blue 5.2s steps(1, end) infinite;
        }
        .tk-brand-text::after {
          color: rgba(255,255,255,0.55);
          animation: tk-brand-glitch-white 4.7s steps(1, end) infinite;
        }
        .tk-nav-center {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 34px;
          flex: 1;
        }
        .tk-nav-link-active {
          color: ${C.textMain};
          position: relative;
        }
        .tk-nav-link-active::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -14px;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: ${C.blueMain};
          box-shadow: 0 0 16px rgba(37,99,235,0.6);
        }
        .tk-hero-shell { width: 100%; max-width: 1360px; margin: 0 auto; }
        .tk-hero-copy {
          max-width: 700px;
          margin-left: 0;
        }
        .tk-hero-trusted {
          margin-top: 34px;
        }
        .tk-hero-trusted-label {
          color: rgba(203,213,225,0.68);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .tk-hero-trusted-row {
          display: flex;
          flex-wrap: wrap;
          gap: 18px 24px;
          color: rgba(255,255,255,0.54);
          font-size: 16px;
          font-weight: 600;
        }
        .tk-stack-mini-grid,
        .tk-form-row,
        .tk-company-strip {
          width: 100%;
        }
        .tk-glass { background: ${C.cardDark}; border: 1px solid ${C.borderSoft}; backdrop-filter: blur(20px); border-radius: 18px; }
        .tk-feature-grid { align-items: stretch; }
        .tk-feature-card { min-height: 168px; }
        .tk-feature-card-body { height: 100%; }
        .tk-glass-hover { transition: transform .2s ease, border-color .2s ease; }
        .tk-glass-hover:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.16); }
        .tk-float-block {
          position: absolute;
          border-radius: 10px;
          border: 1px solid rgba(96,165,250,0.16);
          background: linear-gradient(180deg, rgba(96,165,250,0.14), rgba(255,255,255,0.03));
          backdrop-filter: blur(10px);
          box-shadow: 0 0 24px rgba(37,99,235,0.12);
          animation: tk-float 12s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes tk-float {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(0, -18px, 0) rotate(4deg); }
          100% { transform: translate3d(0, 0, 0) rotate(0deg); }
        }
        .tk-page-float {
          position: absolute;
          border-radius: 8px;
          border: 1px solid rgba(96,165,250,0.10);
          background: linear-gradient(180deg, rgba(96,165,250,0.10), rgba(255,255,255,0.02));
          backdrop-filter: blur(8px);
          box-shadow: none;
          animation: tk-page-drift 18s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes tk-page-drift {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: .22; }
          50% { transform: translate3d(10px, -26px, 0) rotate(6deg); opacity: .34; }
          100% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: .22; }
        }
        .tk-glitch {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }
        .tk-glitch::before,
        .tk-glitch::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0;
        }
        .tk-glitch::before {
          color: rgba(96,165,250,0.85);
          transform: translate(0);
          animation: tk-glitch-blue 4.6s steps(1, end) infinite;
        }
        .tk-glitch::after {
          color: rgba(255,255,255,0.7);
          transform: translate(0);
          animation: tk-glitch-white 5.2s steps(1, end) infinite;
        }
        @keyframes tk-brand-glitch-blue {
          0%, 90%, 100% { opacity: 0; transform: translate(0); }
          91% { opacity: .55; transform: translate(2px, -1px); }
          92% { opacity: 0; transform: translate(0); }
          94% { opacity: .4; transform: translate(-2px, 1px); }
          95% { opacity: 0; transform: translate(0); }
        }
        @keyframes tk-brand-glitch-white {
          0%, 84%, 100% { opacity: 0; transform: translate(0); }
          85% { opacity: .35; transform: translate(-1px, 0); }
          86% { opacity: 0; transform: translate(0); }
          88% { opacity: .28; transform: translate(2px, 0); }
          89% { opacity: 0; transform: translate(0); }
        }
        @keyframes tk-glitch-blue {
          0%, 88%, 100% { opacity: 0; transform: translate(0); }
          89% { opacity: .55; transform: translate(2px, -1px); }
          90% { opacity: 0; transform: translate(0); }
          92% { opacity: .42; transform: translate(-2px, 1px); }
          93% { opacity: 0; transform: translate(0); }
        }
        @keyframes tk-glitch-white {
          0%, 82%, 100% { opacity: 0; transform: translate(0); }
          83% { opacity: .4; transform: translate(-1px, 0); }
          84% { opacity: 0; transform: translate(0); }
          86% { opacity: .3; transform: translate(2px, 0); }
          87% { opacity: 0; transform: translate(0); }
        }
        @media (max-width: 1024px) {
          .tk-feature-grid, .tk-process-grid, .tk-why-grid, .tk-stack-grid, .tk-project-grid, .tk-contact-grid { grid-template-columns: 1fr !important; }
          .tk-hero { min-height: auto !important; padding-bottom: 72px; }
          .tk-header-bar { border-radius: 20px; }
          .tk-nav-center { gap: 22px; }
        }
        @media (max-width: 780px) {
          .tk-nav-desktop { display: none !important; }
          .tk-mobile-toggle { display: inline-flex !important; }
          .tk-wrap { padding: 0 18px; }
          .tk-hero-title { font-size: clamp(46px, 14vw, 74px) !important; }
          .tk-float-block, .tk-page-float { display: none; }
          .tk-header-shell { padding: 10px 14px 0; }
          .tk-header-bar { min-height: 68px; padding: 0 16px; border-radius: 18px; }
          .tk-brand { min-width: 0; }
          .tk-brand-text { font-size: 18px; letter-spacing: 0.12em; }
          .tk-hero-copy { margin-left: 0; max-width: 100%; }
          .tk-hero-trusted-row { gap: 12px 18px; font-size: 14px; }
          .tk-hero { min-height: auto !important; padding: 42px 0 88px !important; background-size: cover !important; background-position: center right !important; }
          .tk-hero-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .tk-stack-mini-grid,
          .tk-form-row,
          .tk-company-strip { grid-template-columns: 1fr !important; }
          .tk-company-logo { font-size: 28px !important; }
        }
        @media (max-width: 520px) {
          .tk-wrap { padding: 0 14px; }
          .tk-company-logo { font-size: 24px !important; }
        }
      `}</style>

      {[
        { left: "9%", top: 940, width: 18, height: 18, delay: "0.4s", duration: "16s" },
        { left: "84%", top: 1180, width: 28, height: 28, delay: "1.1s", duration: "19s" },
        { left: "22%", top: 1540, width: 14, height: 14, delay: "2.2s", duration: "17s" },
        { left: "74%", top: 1820, width: 20, height: 20, delay: "0.9s", duration: "21s" },
        { left: "12%", top: 2320, width: 26, height: 26, delay: "2.8s", duration: "18s" },
        { left: "68%", top: 2740, width: 16, height: 16, delay: "1.6s", duration: "20s" },
        { left: "88%", top: 3220, width: 22, height: 22, delay: "3.1s", duration: "17s" },
      ].map((block, index) => (
        <div
          key={`page-float-${index}`}
          className="tk-page-float"
          style={{
            left: block.left,
            top: block.top,
            width: block.width,
            height: block.height,
            animationDelay: block.delay,
            animationDuration: block.duration,
          }}
        />
      ))}

      <header className="tk-header-shell">
        <div className="tk-header-bar">
          <a className="tk-brand" href="/tech">
            <span className="tk-brand-text" data-text="KAYROSCO">KAYROSCO</span>
          </a>

          <nav className="tk-nav-desktop tk-nav-center">
            <a className="tk-nav-link tk-nav-link-active" href="/tech">Home</a>
            <button className="tk-nav-link" onClick={() => scrollToId("services")} style={{ background: "none", border: "none", cursor: "pointer" }}>Services</button>
            <button className="tk-nav-link" onClick={() => scrollToId("process")} style={{ background: "none", border: "none", cursor: "pointer" }}>Process</button>
            <button className="tk-nav-link" onClick={() => scrollToId("why-us")} style={{ background: "none", border: "none", cursor: "pointer" }}>About Us</button>
            <button className="tk-nav-link" onClick={() => scrollToId("projects")} style={{ background: "none", border: "none", cursor: "pointer" }}>Case Studies</button>
            <a className="tk-nav-link" href="/insights">Blog</a>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a
              className="tk-secondary tk-nav-desktop"
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              Kayrosco Group
            </a>
            <button className="tk-primary tk-nav-desktop" onClick={() => scrollToId("contact")}>Let's Talk</button>
          </div>

          <button
            className="tk-mobile-toggle"
            onClick={() => setMobileMenu((current) => !current)}
            style={{
              display: "none",
              width: 46,
              height: 46,
              borderRadius: 12,
              border: `1px solid ${C.borderSoft}`,
              background: C.cardDark,
              color: C.textMain,
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {mobileMenu && (
        <div className="tk-wrap" style={{ paddingTop: 12 }}>
          <GlassCard style={{ padding: 14 }}>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                ["Home", "top"],
                ["Services", "services"],
                ["Process", "process"],
                ["About Us", "why-us"],
                ["Case Studies", "projects"],
                ["FAQ", "faq"],
              ].map(([label, id]) => (
                <button
                  key={id}
                  onClick={() => {
                    setMobileMenu(false);
                    scrollToId(id);
                  }}
                  style={{
                    padding: "14px 12px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${C.borderSoft}`,
                    color: C.textMain,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
              <a
                href="/"
                style={{
                  padding: "14px 12px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${C.borderSoft}`,
                  color: C.textMain,
                  textAlign: "left",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                Kayrosco Group
              </a>
              <a
                href="/insights"
                style={{
                  padding: "14px 12px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${C.borderSoft}`,
                  color: C.textMain,
                  textAlign: "left",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                Blog
              </a>
            </div>
          </GlassCard>
        </div>
      )}

      <section
        className="tk-hero"
        style={{
          minHeight: 920,
          display: "flex",
          alignItems: "center",
          paddingTop: 56,
          paddingBottom: 120,
          position: "relative",
          overflow: "hidden",
          backgroundImage:
            "linear-gradient(90deg, rgba(2,6,23,0.82) 0%, rgba(2,6,23,0.68) 35%, rgba(2,6,23,0.34) 56%, rgba(2,6,23,0.56) 100%), url('/kt background.png')",
          backgroundPosition: "right 12px center",
          backgroundSize: "76% auto",
          backgroundRepeat: "no-repeat",
        }}
      >
        {[
          { left: "56%", top: "18%", width: 56, height: 56, delay: "0s", duration: "12s", opacity: 0.38 },
          { left: "71%", top: "24%", width: 18, height: 18, delay: "1.4s", duration: "9s", opacity: 0.42 },
          { left: "66%", top: "42%", width: 24, height: 24, delay: "2.1s", duration: "11s", opacity: 0.34 },
          { left: "81%", top: "34%", width: 12, height: 12, delay: "0.8s", duration: "10s", opacity: 0.46 },
          { left: "60%", top: "60%", width: 20, height: 20, delay: "1.9s", duration: "13s", opacity: 0.32 },
          { left: "77%", top: "64%", width: 30, height: 30, delay: "3s", duration: "12s", opacity: 0.36 },
        ].map((block, index) => (
          <div
            key={index}
            className="tk-float-block"
            style={{
              left: block.left,
              top: block.top,
              width: block.width,
              height: block.height,
              animationDelay: block.delay,
              animationDuration: block.duration,
              opacity: block.opacity,
            }}
          />
        ))}
        <div className="tk-wrap tk-hero-shell" id="top" style={{ width: "100%" }}>
        <div className="tk-hero-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 0.95fr) minmax(300px, 1.05fr)", gap: 48, alignItems: "center", width: "100%" }}>
          <div className="tk-hero-copy" style={{ paddingLeft: 0 }}>
            <h1
              className="tk-hero-title"
              style={{
                margin: 0,
                fontFamily: "'Orbitron', 'Rostex', Inter, sans-serif",
                fontSize: "clamp(66px, 6.4vw, 96px)",
                lineHeight: 0.92,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                maxWidth: 760,
              }}
            >
              Your Ideas
              <br />
              into Tech
              <br />
              <span
                style={{
                  background: "linear-gradient(180deg, #60A5FA, #2563EB)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Reality.
              </span>
            </h1>
            <p style={{ margin: "30px 0 0", color: C.textMuted, fontFamily: "'Orbitron', Inter, sans-serif", fontSize: 16, maxWidth: 620, lineHeight: 1.8, letterSpacing: "0.01em" }}>
              We help startups and businesses transform ideas into custom software delivered by senior engineers in weeks, not months.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 34 }}>
              <button className="tk-primary tk-glitch" data-text="Start Your Project" onClick={() => scrollToId("contact")} style={{ display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", padding: "14px 22px" }}>
                Start Your Project <ArrowRight size={16} style={{ marginLeft: 8, verticalAlign: "middle" }} />
              </button>
              <button className="tk-secondary tk-glitch" data-text="Explore Services" onClick={() => scrollToId("services")} style={{ display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", padding: "14px 22px" }}>
                Explore Services
              </button>
            </div>
            <div className="tk-hero-trusted">
              <div className="tk-hero-trusted-label">innovative companies</div>
              <div className="tk-hero-trusted-row">
                <span>loop</span>
                <span>wave</span>
                <span>Cloudly</span>
                <span>agile</span>
                <span>luminous</span>
              </div>
            </div>
          </div>
          <div aria-hidden="true" />
        </div>
        </div>
      </section>

      <section className="tk-wrap" style={{ paddingBottom: 44, marginTop: -48, position: "relative", zIndex: 4 }}>
        <div className="tk-feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {whyUs.map((item) => (
            <GlassCard key={item.title} className="tk-feature-card" style={{ padding: 26 }} >
              <div className="tk-glass-hover tk-feature-card-body" style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 66,
                    height: 66,
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${C.borderSoft}`,
                    background: "rgba(255,255,255,0.02)",
                    flexShrink: 0,
                  }}
                >
                  <item.icon size={28} color={C.blueMain} strokeWidth={1.8} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
                  <div style={{ color: C.textSoft, fontSize: 16, lineHeight: 1.6 }}>{item.text}</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="tk-wrap" style={{ padding: "42px 0 96px" }}>
        <div className="tk-stack-grid" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18 }}>
          <CodeCard />
          <div className="tk-stack-mini-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {stackCards.map((item) => (
              <GlassCard key={item.name} style={{ minHeight: 110, padding: 22 }} >
                <div className="tk-glass-hover" style={{ height: "100%", display: "flex", alignItems: "center", gap: 16 }}>
                  {item.icon ? (
                    <img src={item.icon} alt={item.name} style={{ width: 34, height: 34, objectFit: "contain", flexShrink: 0 }} />
                  ) : (
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        border: `1px solid ${C.borderSoft}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: C.blueMain,
                      }}
                    >
                      +
                    </div>
                  )}
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{item.name}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="tk-wrap" style={{ paddingBottom: 96 }}>
        <SectionTitle
          eyebrow="Services"
          title="Custom software, shipped fast."
          text="Core delivery areas for product, engineering, and launch."
        />
        <div className="tk-feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {visibleServiceCards.map((item) => (
            <GlassCard key={item.title} style={{ padding: 26 }} >
              <div className="tk-glass-hover">
                <item.icon size={28} color={C.blueMain} strokeWidth={1.8} />
                <h3 style={{ margin: "18px 0 10px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em" }}>{item.title}</h3>
                <p style={{ margin: 0, color: C.textSoft, fontSize: 15, lineHeight: 1.7 }}>{item.text}</p>
              </div>
            </GlassCard>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <button
            type="button"
            onClick={() => setShowAllServices((current) => !current)}
            className="tk-secondary"
            style={{ padding: "14px 22px" }}
          >
            {showAllServices ? "Hide services" : "Show more services"}
          </button>
        </div>
        {showAllServices && (
          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {serviceOptions.map((service) => (
              <GlassCard key={service} style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Code2 size={18} color={C.blueMain} strokeWidth={1.8} />
                  <div style={{ color: C.textMuted, fontSize: 15, lineHeight: 1.5 }}>{service}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      <section id="process" className="tk-wrap" style={{ paddingBottom: 96 }}>
        <SectionTitle
          eyebrow="Process"
          title="How we work"
          text="A simple delivery flow with clear ownership from planning to launch."
        />
        <div className="tk-process-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {processSteps.map((step, index) => (
            <GlassCard key={step.title} style={{ padding: 28 }} >
              <div className="tk-glass-hover" style={{ display: "grid", gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    border: `1px solid ${C.borderSoft}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.blueLight,
                    fontSize: 15,
                    fontWeight: 800,
                  }}
                >
                  0{index + 1}
                </div>
                <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}>{step.title}</h3>
                <p style={{ margin: 0, color: C.textSoft, fontSize: 15, lineHeight: 1.7 }}>{step.text}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {!!projects.length && (
        <section id="projects" className="tk-wrap" style={{ paddingBottom: 96 }}>
          <SectionTitle
            eyebrow="Projects"
            title="Projects available"
          />
          <div className="tk-project-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
            {projects.slice(0, 6).map((project) => {
              const isOpen = openProjectId === project.id;
              const hasDetails = Boolean(project.description || project.tags?.length || project.link);

              return (
              <GlassCard key={project.id} style={{ overflow: "hidden" }} >
                <button
                  type="button"
                  className="tk-glass-hover"
                  onClick={() => setOpenProjectId((current) => (current === project.id ? null : project.id))}
                  aria-expanded={isOpen}
                  style={{
                    height: "100%",
                    width: "100%",
                    padding: 0,
                    background: "transparent",
                    border: "none",
                    color: "inherit",
                    textAlign: "left",
                    cursor: hasDetails ? "pointer" : "default",
                  }}
                >
                  <div style={{ height: 210, background: "rgba(255,255,255,0.02)" }}>
                    {project.photo_url ? (
                      <img src={project.photo_url} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.blueLight }}>
                        <Code2 size={32} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 22 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                      <div style={{ color: C.blueLight, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em" }}>
                        {project.status.replaceAll("_", " ")}
                      </div>
                      {hasDetails && (
                        <div style={{ color: C.textSoft, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          {isOpen ? "Hide details" : "Show details"}
                        </div>
                      )}
                    </div>
                    <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em" }}>{project.title}</h3>
                    {project.description && !isOpen && (
                      <p
                        style={{
                          margin: "12px 0 0",
                          color: C.textSoft,
                          fontSize: 15,
                          lineHeight: 1.7,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {project.description}
                      </p>
                    )}
                    {isOpen && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.borderSoft}`, display: "grid", gap: 14 }}>
                        {project.description && (
                          <p style={{ margin: 0, color: C.textSoft, fontSize: 15, lineHeight: 1.7 }}>
                            {project.description}
                          </p>
                        )}
                        {!!project.tags?.length && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {project.tags.map((tag) => (
                              <span
                                key={tag}
                                style={{
                                  padding: "7px 10px",
                                  borderRadius: 999,
                                  border: `1px solid ${C.borderSoft}`,
                                  background: "rgba(255,255,255,0.03)",
                                  color: C.textMuted,
                                  fontSize: 12,
                                  letterSpacing: "0.04em",
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              color: C.textMain,
                              textDecoration: "none",
                              fontWeight: 600,
                            }}
                          >
                            View Project <ExternalLink size={15} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              </GlassCard>
            )})}
          </div>
        </section>
      )}

      <section id="why-us" className="tk-wrap" style={{ paddingBottom: 96 }}>
        <SectionTitle
          eyebrow="Why Us"
          title="Built for quality, speed, and ownership."
          text="Direct communication and accountable delivery."
        />
        <div className="tk-why-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
          {[
            "Direct collaboration with senior technical people",
            "Premium execution without bloated process overhead",
            "Secure implementation and scalable system decisions",
            "Clean product thinking from design through launch",
          ].map((line) => (
            <GlassCard key={line} style={{ padding: 24 }} >
              <div className="tk-glass-hover" style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <ShieldCheck size={22} color={C.blueMain} strokeWidth={1.8} />
                <div style={{ color: C.textMuted, fontSize: 16, lineHeight: 1.7 }}>{line}</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="tk-wrap" style={{ paddingBottom: 96 }}>
        <div
          style={{
            padding: "28px 0 22px",
            borderTop: `1px solid rgba(255,255,255,0.06)`,
            borderBottom: `1px solid rgba(255,255,255,0.06)`,
            textAlign: "center",
          }}
        >
          <div style={{ color: C.blueLight, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 30 }}>
            Trusted by innovative companies
          </div>
          <div className="tk-company-strip" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 18, alignItems: "center" }}>
            {["AcmeCorp", "Novus", "Pulse", "Vertex", "Cloudly"].map((name) => (
              <div className="tk-company-logo" key={name} style={{ color: "rgba(255,255,255,0.46)", fontSize: 38, fontWeight: 700, letterSpacing: "-0.04em" }}>
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="tk-wrap" style={{ paddingBottom: 96 }}>
        <SectionTitle
          eyebrow="FAQ"
          title="Common questions, answered clearly."
        />
        <div style={{ display: "grid", gap: 14 }}>
          {faqs.map((item, index) => (
            <GlassCard key={item.q} style={{ padding: 0, overflow: "hidden" }} >
              <button
                type="button"
                onClick={() => setFaqOpen((current) => (current === index ? null : index))}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: C.textMain,
                  padding: "20px 22px",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                <span>{item.q}</span>
                <span style={{ color: C.blueLight }}>{faqOpen === index ? "−" : "+"}</span>
              </button>
              {faqOpen === index && (
                <div style={{ padding: "0 22px 20px", color: C.textSoft, fontSize: 15, lineHeight: 1.7 }}>
                  {item.a}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="contact" className="tk-wrap" style={{ paddingBottom: 96 }}>
        <div className="tk-contact-grid" style={{ display: "grid", gridTemplateColumns: "0.92fr 1.08fr", gap: 20 }}>
          <GlassCard style={{ padding: 28 }}>
            <div style={{ color: C.blueLight, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>
              Get Started
            </div>
            <h2 style={{ margin: 0, fontSize: "clamp(34px, 4vw, 54px)", lineHeight: 1, fontWeight: 800, letterSpacing: "-0.04em" }}>
              Start your next tech project with a cleaner process.
            </h2>
            <p style={{ margin: "18px 0 0", color: C.textSoft, fontSize: 16, lineHeight: 1.7 }}>
              Share your scope and we will follow up with the next technical steps.
            </p>
            <div style={{ display: "grid", gap: 14, marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: C.textMuted }}>
                <Mail size={18} color={C.blueMain} />
                <span>{settings?.email || "tech@kayrosco.com"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: C.textMuted }}>
                <Phone size={18} color={C.blueMain} />
                <span>{settings?.phone || "+355 contact available on request"}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 28 }}>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
              <div className="tk-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Input
                  placeholder="Full name"
                  value={form.full_name}
                  onChange={(value) => setForm((current) => ({ ...current, full_name: value }))}
                />
                <Input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
                />
              </div>
              <div className="tk-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Input
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                />
                <Input
                  placeholder="Company"
                  value={form.company}
                  onChange={(value) => setForm((current) => ({ ...current, company: value }))}
                />
              </div>
              <div className="tk-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Select
                  value={form.service_type}
                  onChange={(value) => setForm((current) => ({ ...current, service_type: value }))}
                  options={serviceOptions}
                />
                <Input
                  placeholder="Budget range"
                  value={form.budget}
                  onChange={(value) => setForm((current) => ({ ...current, budget: value }))}
                />
              </div>
              <Input
                placeholder="Timeline"
                value={form.timeline}
                onChange={(value) => setForm((current) => ({ ...current, timeline: value }))}
              />
              <textarea
                value={form.details}
                onChange={(e) => setForm((current) => ({ ...current, details: e.target.value }))}
                placeholder="Project details"
                style={fieldStyle({ minHeight: 140, resize: "vertical" })}
              />

              {error && <div style={{ color: "#FCA5A5", fontSize: 14 }}>{error}</div>}
              {success && (
                <div style={{ color: "#86EFAC", fontSize: 14 }}>
                  Request sent. Tracking ID: <strong>{success.tracking_id}</strong>
                </div>
              )}

              <button className="tk-primary" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Request"}
              </button>
            </form>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={fieldStyle()}
      required={placeholder !== "Company" && placeholder !== "Budget range" && placeholder !== "Timeline"}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={fieldStyle()} required>
      {options.map((item) => (
        <option key={item} value={item} style={{ color: "#020617" }}>
          {item}
        </option>
      ))}
    </select>
  );
}

function fieldStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    width: "100%",
    borderRadius: 14,
    border: `1px solid ${C.borderSoft}`,
    background: "rgba(255,255,255,0.03)",
    color: C.textMain,
    padding: "16px 18px",
    fontSize: 15,
    outline: "none",
    fontFamily: FONT_STACK,
    lineHeight: 1.6,
    ...extra,
  };
}

export default TechPage;
