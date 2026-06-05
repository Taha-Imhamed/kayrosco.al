import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Code2, Rocket, Heart, Globe, Users, Star,
  ArrowLeft, Mail, Phone, Linkedin,
  Cpu, Shield, Zap,
} from "lucide-react";

// ─── Design tokens (same as Tech page) ────────────────────────────────────────
const C = {
  bg:         "#F0F4FF",
  white:      "#FFFFFF",
  section:    "#F8FAFF",
  ink:        "#0F172A",
  ink2:       "#1E293B",
  ink3:       "#334155",
  muted:      "#64748B",
  mutedLight: "#94A3B8",
  accent:     "#2563EB",
  accentHov:  "#1D4ED8",
  accentTint: "#EFF6FF",
  accentMid:  "#DBEAFE",
  positive:   "#10B981",
  border:     "#E2E8F0",
  borderMed:  "#CBD5E1",
};
const SANS = "'Space Grotesk', ui-sans-serif, sans-serif";
const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";
const sh   = "0 1px 3px rgba(15,23,42,0.08), 0 4px 12px rgba(15,23,42,0.05)";
const shMd = "0 4px 24px rgba(15,23,42,0.10), 0 1px 4px rgba(15,23,42,0.06)";
const shLg = "0 12px 48px rgba(15,23,42,0.14), 0 2px 8px rgba(15,23,42,0.06)";

const VALUES = [
  { icon: Code2,   title: "Built by builders",       desc: "We didn't study software to work for someone else's dream. We studied it to build our own." },
  { icon: Shield,  title: "Honest by default",        desc: "No fake timelines, no inflated estimates. We say what we can do and we do what we say." },
  { icon: Heart,   title: "Passion over profit",      desc: "Every line of code we write has a piece of our story in it. That's not marketing — it's just true." },
  { icon: Zap,     title: "Speed without shortcuts",  desc: "We move fast because we've done this before. Not because we skip the details." },
  { icon: Globe,   title: "Global mindset",           desc: "We've worked across continents and time zones. Different problems, same commitment." },
  { icon: Cpu,     title: "Always learning",          desc: "The tech world never stops. Neither do we. Every project makes us sharper." },
];

const MILESTONES = [
  { year: "2023", label: "The classroom",    desc: "Same lecture hall. Same dream. Four students who were done waiting to start." },
  { year: "2024", label: "First client",     desc: "We said yes before we were ready — then we got ready. Delivered. Never looked back." },
  { year: "2026", label: "The company",      desc: "KAYROSCO went official. A WhatsApp group became a company. Nothing changed and everything did." },
  { year: "Today", label: "Still building",  desc: "Bigger team. Same obsession. We still treat every project like it's our first." },
];

export default function TechAbout() {
  const navigate = useNavigate();

  // Load fonts + inject rise animation
  useEffect(() => {
    const id = "kayrosco-tech-fonts";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(l);
    }
    const animId = "hero-team-anim";
    if (!document.getElementById(animId)) {
      const s = document.createElement("style");
      s.id = animId;
      s.textContent = `
        @keyframes heroRise {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .hero-team-img {
          animation: heroRise 1.3s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div style={{ fontFamily: SANS, background: C.bg, color: C.ink, minHeight: "100vh" }}>

      {/* ── Sticky nav ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${C.border}`, padding: "0 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => navigate("/")}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.mutedLight, fontSize: 13, fontWeight: 600, fontFamily: SANS, padding: "6px 0" }}>
              <ArrowLeft size={14} /> Main Page
            </button>
            <span style={{ color: C.border, fontSize: 18, lineHeight: 1 }}>|</span>
            <button onClick={() => navigate("/tech")}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14, fontWeight: 600, fontFamily: SANS, padding: "6px 0" }}>
              <ArrowLeft size={16} /> Back to Tech
            </button>
          </div>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 18, color: C.ink, letterSpacing: "-0.02em" }}>
            KAYROSCO <span style={{ color: C.accent }}>TECH</span>
          </span>
          <button onClick={() => navigate("/tech")}
            style={{ padding: "8px 18px", borderRadius: 9, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
            Start a Project →
          </button>
        </div>
      </nav>

      {/* ── Hero — horizontal: text left, photo right ── */}
      <section style={{
        height: "100vh",
        overflow: "hidden",
        background: C.white,
        display: "flex",
        flexDirection: "row",
      }}>
        {/* Text — LEFT side */}
        <div style={{
          flex: "0 0 50%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 48px 60px 64px",
          zIndex: 2,
          position: "relative",
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 16px", borderRadius: 100, background: C.accentTint, color: C.accent, fontSize: 12, fontWeight: 700, border: `1px solid ${C.accentMid}`, fontFamily: MONO, marginBottom: 24, width: "fit-content" }}>
            <Users size={12} /> Our Story
          </span>
          <h1 style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.ink, lineHeight: 1.09, letterSpacing: "-0.03em", margin: "0 0 20px" }}>
            We were students with a{" "}
            <span style={{ color: C.accent }}>dream</span>.
            <br />This is the company that dream built.
          </h1>
          <p style={{ fontSize: 17, color: C.muted, maxWidth: 460, lineHeight: 1.75, margin: 0 }}>
            KAYROSCO Tech didn't start in a boardroom. It started in a university — with software engineering students who refused to let their ambition fit inside a job description.
          </p>
        </div>

        {/* Photo — RIGHT side */}
        <div style={{
          flex: "0 0 50%",
          height: "100%",
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Left-edge blend into white */}
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 80, background: "linear-gradient(to right, rgba(255,255,255,1) 0%, transparent 100%)", zIndex: 2, pointerEvents: "none" }} />

          <img
            src="/hero%20team.png"
            alt="The Kayrosco Tech team"
            className="hero-team-img"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }}
          />

          {/* Cloud layer — bottom fade */}
          <div style={{ position: "absolute", bottom: -80, left: 0, right: 0, zIndex: 3, pointerEvents: "none" }}>
            <div style={{ height: 70, background: "linear-gradient(to top, rgba(255,255,255,1) 20%, transparent)" }} />
            <svg width="100%" viewBox="0 0 1440 90" preserveAspectRatio="none" style={{ display: "block", marginTop: -1 }}>
              <path d="M0,45 Q50,15 110,40 Q160,60 220,32 Q275,8 340,38 Q395,60 460,28 Q520,2 590,35 Q645,58 710,28 Q768,4 835,36 Q890,60 955,30 Q1015,5 1080,34 Q1135,58 1200,30 Q1260,6 1330,38 Q1375,55 1440,38 L1440,90 L0,90 Z" fill="white"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ── The story ── */}
      <section style={{ background: C.white, padding: "80px 32px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "grid", gap: 24 }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} style={{ background: C.section, borderRadius: 16, padding: "28px 32px", border: `1.5px dashed ${C.borderMed}`, boxShadow: sh, minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 13, fontFamily: "monospace", color: C.mutedLight, letterSpacing: "0.05em" }}>— coming soon —</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section style={{ background: C.ink, padding: "80px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, color: "#fff", textAlign: "center", margin: "0 0 60px", letterSpacing: "-0.02em" }}>
            How we got here
          </h2>
          <div style={{ position: "relative" }}>
            {/* Vertical line */}
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.08)", transform: "translateX(-50%)" }} />
            {MILESTONES.map((m, i) => (
              <div key={m.year} style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr", gap: 0, marginBottom: i < MILESTONES.length - 1 ? 48 : 0 }}>
                {/* Left side */}
                <div style={{ textAlign: "right", paddingRight: 32, paddingTop: 6, ...(i % 2 !== 0 ? { opacity: 0 } : {}) }}>
                  {i % 2 === 0 && (
                    <>
                      <p style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, color: C.accent, margin: "0 0 6px", letterSpacing: "0.08em" }}>{m.year}</p>
                      <h3 style={{ fontFamily: SANS, fontWeight: 700, fontSize: 18, color: "#fff", margin: "0 0 8px" }}>{m.label}</h3>
                      <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, margin: 0 }}>{m.desc}</p>
                    </>
                  )}
                </div>
                {/* Center dot */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.accent, border: "3px solid #0F172A", boxShadow: `0 0 0 3px ${C.accent}40`, flexShrink: 0 }} />
                </div>
                {/* Right side */}
                <div style={{ paddingLeft: 32, paddingTop: 6 }}>
                  {i % 2 !== 0 && (
                    <>
                      <p style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, color: C.accent, margin: "0 0 6px", letterSpacing: "0.08em" }}>{m.year}</p>
                      <h3 style={{ fontFamily: SANS, fontWeight: 700, fontSize: 18, color: "#fff", margin: "0 0 8px" }}>{m.label}</h3>
                      <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, margin: 0 }}>{m.desc}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section style={{ background: C.bg, padding: "80px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 16px", borderRadius: 100, background: C.accentTint, color: C.accent, fontSize: 12, fontWeight: 700, border: `1px solid ${C.accentMid}` }}>
              <Star size={12} /> What We Stand For
            </span>
            <h2 style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, color: C.ink, margin: "16px 0 12px", letterSpacing: "-0.02em" }}>Our values aren't on a poster.</h2>
            <p style={{ fontSize: 16, color: C.muted, maxWidth: 500, margin: "0 auto" }}>They're in the way we work, every day.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {VALUES.map(v => {
              const Icon = v.icon;
              return (
                <div key={v.title} style={{ background: C.white, borderRadius: 16, padding: "26px", border: `1px solid ${C.border}`, boxShadow: sh }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: C.accentTint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Icon size={20} color={C.accent} />
                  </div>
                  <h3 style={{ fontFamily: SANS, fontWeight: 700, fontSize: 16, color: C.ink, margin: "0 0 8px" }}>{v.title}</h3>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, margin: 0 }}>{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ── CTA ── */}
      <section style={{ background: C.accent, padding: "72px 32px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <Rocket size={36} color="rgba(255,255,255,0.6)" style={{ marginBottom: 20 }} />
          <h2 style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, color: "#fff", margin: "0 0 14px", letterSpacing: "-0.02em" }}>
            Want to build something with us?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", margin: "0 0 32px", lineHeight: 1.65 }}>
            We're still the same students who stayed up all night for a perfect delivery. We just have better coffee now.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/tech")}
              style={{ padding: "14px 28px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.35)", background: "#fff", color: C.accent, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: SANS }}>
              Start a project →
            </button>
            <a href="mailto:tech@kayrosco.com"
              style={{ padding: "14px 24px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.35)", background: "transparent", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS, display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <Mail size={16} /> tech@kayrosco.com
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <div style={{ background: C.ink, color: "#64748B", fontFamily: SANS, padding: "28px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 16, color: "#fff" }}>KAYROSCO <span style={{ color: C.accent }}>TECH</span></span>
          <span style={{ fontSize: 13 }}>© {new Date().getFullYear()} Kayrosco Tech. All rights reserved.</span>
          <span style={{ fontSize: 13 }}>Built with precision · Delivered with care</span>
        </div>
      </div>

    </div>
  );
}
