import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import SeoHead from "@/components/SeoHead";
import { Link, useParams } from "react-router-dom";
import { findSeoPage, seoToolPages, SITE_URL } from "@/data/seoPages";
import { trackEvent } from "@/components/Analytics";
import NotFound from "./NotFound";

const shellStyle: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #08111d 0%, #0f172a 100%)",
  color: "#f8fafc",
};

const containerStyle: CSSProperties = {
  maxWidth: 980,
  margin: "0 auto",
  padding: "32px 20px 80px",
};

const cardStyle: CSSProperties = {
  background: "rgba(15, 23, 42, 0.74)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  borderRadius: 24,
  padding: 24,
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(255,255,255,0.04)",
  color: "#f8fafc",
};

export default function SeoToolPage() {
  const { slug } = useParams();
  const page = findSeoPage(`/tools/${slug}`);

  const [founders, setFounders] = useState(1);
  const [licenseLevel, setLicenseLevel] = useState("basic");
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [style, setStyle] = useState("standard");
  const [purpose, setPurpose] = useState("business");
  const [months, setMonths] = useState(12);

  const companyEstimate = useMemo(() => {
    const licenseFactor = licenseLevel === "advanced" ? 450 : licenseLevel === "regulated" ? 800 : 220;
    return founders * 150 + licenseFactor;
  }, [founders, licenseLevel]);

  const travelEstimate = useMemo(() => {
    const styleFactor = style === "premium" ? 165 : style === "budget" ? 75 : 110;
    return days * travelers * styleFactor;
  }, [days, style, travelers]);

  const residencyResult = useMemo(() => {
    if (purpose === "employment") return "Likely path: work-related residence route, subject to employer and permit documentation.";
    if (purpose === "family") return "Likely path: family-related residence route, depending on family status and supporting evidence.";
    if (purpose === "study") return "Likely path: study-related residence route, usually supported by education documentation.";
    return months > 12
      ? "Likely path: longer-term business or self-support route, depending on documentation and purpose."
      : "Likely path: shorter-term business or temporary residence route, depending on the case profile.";
  }, [months, purpose]);

  if (!slug || !page || page.kind !== "tool") {
    return <NotFound />;
  }

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: page.title,
      url: `${SITE_URL}${page.path}`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: page.metaDescription,
      provider: {
        "@type": "Organization",
        name: "KAYROSCO GROUP",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faq.map((item: any) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  ];

  return (
    <div style={shellStyle}>
      <SeoHead
        title={page.seoTitle}
        description={page.metaDescription}
        canonicalPath={page.path}
        keywords={[page.title, "Albania tools", "KAYROSCO GROUP"]}
        schemas={schemas}
      />

      <div style={containerStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <Link to="/" style={{ color: "#f8fafc", textDecoration: "none", fontWeight: 800, letterSpacing: "0.08em" }}>
            KAYROSCO GROUP
          </Link>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link to="/insights" style={{ color: "#cbd5e1", textDecoration: "none" }}>
              Insights
            </Link>
            <Link to="/tools" style={{ color: "#cbd5e1", textDecoration: "none" }}>
              Tools
            </Link>
          </div>
        </div>

        <section style={{ ...cardStyle, marginBottom: 20 }}>
          <h1 style={{ fontSize: "clamp(2.3rem, 4.6vw, 3.8rem)", margin: "0 0 16px", lineHeight: 1.08 }}>{page.title}</h1>
          <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.8 }}>{page.intro}</p>
        </section>

        {page.slug === "company-registration-cost-calculator-albania" && (
          <section style={{ ...cardStyle, marginBottom: 20 }}>
            <h2 style={{ marginTop: 0 }}>Estimate planning cost</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label>Number of founders</label>
                <input type="number" min={1} value={founders} onChange={(e) => setFounders(Number(e.target.value) || 1)} style={inputStyle} />
              </div>
              <div>
                <label>License complexity</label>
                <select value={licenseLevel} onChange={(e) => setLicenseLevel(e.target.value)} style={inputStyle}>
                  <option value="basic">Basic</option>
                  <option value="advanced">Advanced</option>
                  <option value="regulated">Regulated</option>
                </select>
              </div>
            </div>
            <p style={{ marginTop: 18, color: "#e2e8f0" }}>Estimated planning range: <strong>{companyEstimate} EUR</strong></p>
          </section>
        )}

        {page.slug === "albania-travel-budget-calculator" && (
          <section style={{ ...cardStyle, marginBottom: 20 }}>
            <h2 style={{ marginTop: 0 }}>Estimate trip budget</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div>
                <label>Days</label>
                <input type="number" min={1} value={days} onChange={(e) => setDays(Number(e.target.value) || 1)} style={inputStyle} />
              </div>
              <div>
                <label>Travelers</label>
                <input type="number" min={1} value={travelers} onChange={(e) => setTravelers(Number(e.target.value) || 1)} style={inputStyle} />
              </div>
              <div>
                <label>Style</label>
                <select value={style} onChange={(e) => setStyle(e.target.value)} style={inputStyle}>
                  <option value="budget">Budget</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
            <p style={{ marginTop: 18, color: "#e2e8f0" }}>Estimated trip budget: <strong>{travelEstimate} EUR</strong></p>
          </section>
        )}

        {page.slug === "residency-permit-eligibility-checker-albania" && (
          <section style={{ ...cardStyle, marginBottom: 20 }}>
            <h2 style={{ marginTop: 0 }}>Check likely pathway</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label>Primary purpose</label>
                <select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={inputStyle}>
                  <option value="business">Business</option>
                  <option value="employment">Employment</option>
                  <option value="family">Family</option>
                  <option value="study">Study</option>
                </select>
              </div>
              <div>
                <label>Planned stay in months</label>
                <input type="number" min={1} value={months} onChange={(e) => setMonths(Number(e.target.value) || 1)} style={inputStyle} />
              </div>
            </div>
            <p style={{ marginTop: 18, color: "#e2e8f0" }}>{residencyResult}</p>
          </section>
        )}

        <section style={{ ...cardStyle, marginBottom: 20 }}>
          <h2 style={{ marginTop: 0 }}>Frequently asked questions</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {page.faq.map((item: any) => (
              <details key={item.q} style={{ borderRadius: 16, border: "1px solid rgba(148, 163, 184, 0.16)", padding: "14px 16px" }}>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>{item.q}</summary>
                <p style={{ margin: "10px 0 0", color: "#cbd5e1", lineHeight: 1.7 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>More tools and SEO pages</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {seoToolPages
              .filter((tool) => tool.path !== page.path)
              .map((tool) => (
                <Link key={tool.path} to={tool.path} style={{ color: "#7dd3fc", textDecoration: "none", fontWeight: 700 }}>
                  {tool.title}
                </Link>
              ))}
          </div>
          <a
            href="/contact"
            onClick={() => trackEvent("tool_contact_click", { tool_slug: page.slug })}
            style={{ display: "inline-block", marginTop: 18, color: "#ffffff", background: "#0ea5e9", padding: "12px 16px", borderRadius: 12, textDecoration: "none", fontWeight: 800 }}
          >
            Talk to KAYROSCO GROUP
          </a>
        </section>
      </div>
    </div>
  );
}
