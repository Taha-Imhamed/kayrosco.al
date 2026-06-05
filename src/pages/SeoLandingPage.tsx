import type { CSSProperties } from "react";
import SeoHead from "@/components/SeoHead";
import { Link, Navigate, useParams } from "react-router-dom";
import { categoryConfig, resolveSeoPath, seoPages, SITE_URL } from "@/data/seoPages";
import { trackEvent } from "@/components/Analytics";
import NotFound from "./NotFound";

const shellStyle: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #0c1118 0%, #111827 50%, #0b1220 100%)",
  color: "#f8fafc",
};

const containerStyle: CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "32px 20px 80px",
};

const cardStyle: CSSProperties = {
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 20px 60px rgba(2, 6, 23, 0.35)",
};

function buildSchemas(page: any) {
  const canonical = `${SITE_URL}${page.path}`;
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KAYROSCO GROUP",
    url: SITE_URL,
    logo: `${SITE_URL}/lolo.png`,
    image: `${SITE_URL}/banner.png`,
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: categoryConfig[page.category].label, item: `${SITE_URL}/${page.category}` },
      { "@type": "ListItem", position: 3, name: page.title, item: canonical },
    ],
  };
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: page.title,
    name: page.title,
    description: page.metaDescription,
    provider: {
      "@type": "Organization",
      name: "KAYROSCO GROUP",
      url: SITE_URL,
    },
    areaServed: page.city
      ? {
          "@type": "City",
          name: page.city.name,
        }
      : {
          "@type": "Country",
          name: "Albania",
        },
    url: canonical,
  };
  const faq =
    page.faq?.length
      ? {
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
        }
      : null;
  const localBusiness =
    page.city
      ? {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: `KAYROSCO GROUP ${categoryConfig[page.category].label} - ${page.city.name}`,
          url: canonical,
          areaServed: page.city.name,
          image: `${SITE_URL}/banner.png`,
          description: page.metaDescription,
        }
      : null;

  return [organization, breadcrumb, service, faq, localBusiness].filter(Boolean);
}

export default function SeoLandingPage() {
  const { category, slug } = useParams();
  const { page, redirect } = resolveSeoPath(`/${category}/${slug}`);

  if (redirect) {
    return <Navigate to={redirect} replace />;
  }

  if (!category || !slug || !page || !categoryConfig[category] || (page.kind !== "service" && page.kind !== "location")) {
    return <NotFound />;
  }

  const relatedPages = page.relatedPaths
    .map((path: string) => seoPages.find((entry) => entry.path === path))
    .filter(Boolean);

  const accent = categoryConfig[category].accent;

  return (
    <div style={shellStyle}>
      <SeoHead
        title={page.seoTitle}
        description={page.metaDescription}
        canonicalPath={page.path}
        keywords={page.keywords}
        schemas={buildSchemas(page)}
      />

      <div style={containerStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <Link to="/" style={{ color: "#f8fafc", textDecoration: "none", fontWeight: 800, letterSpacing: "0.08em" }}>
            KAYROSCO GROUP
          </Link>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link to={`/${category}`} style={{ color: "#cbd5e1", textDecoration: "none" }}>
              {categoryConfig[category].label}
            </Link>
            <Link to="/insights" style={{ color: "#cbd5e1", textDecoration: "none" }}>
              Insights
            </Link>
            <Link to="/tools" style={{ color: "#cbd5e1", textDecoration: "none" }}>
              Tools
            </Link>
          </div>
        </div>

        <section style={{ ...cardStyle, marginBottom: 20 }}>
          <div style={{ display: "inline-flex", padding: "6px 12px", borderRadius: 999, background: `${accent}22`, color: accent, fontWeight: 800, marginBottom: 16 }}>
            {page.kind === "location" ? `${categoryConfig[category].label} in ${page.city.name}` : `${categoryConfig[category].label} Service`}
          </div>
          <h1 style={{ fontSize: "clamp(2.3rem, 5vw, 4rem)", lineHeight: 1.05, margin: "0 0 16px", color: "#ffffff" }}>{page.title}</h1>
          <p style={{ color: "#cbd5e1", fontSize: "1.06rem", lineHeight: 1.8, maxWidth: 900, margin: 0 }}>{page.intro}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
            <a
              href="/contact"
              onClick={() => trackEvent("seo_cta_click", { page_path: page.path, page_kind: page.kind, category })}
              style={{
                padding: "14px 18px",
                borderRadius: 14,
                background: accent,
                color: "#08111d",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              Request Help
            </a>
            <Link
              to={`/${category}`}
              style={{
                padding: "14px 18px",
                borderRadius: 14,
                border: "1px solid rgba(148, 163, 184, 0.24)",
                color: "#e2e8f0",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              View Main {categoryConfig[category].label} Page
            </Link>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <div style={{ display: "grid", gap: 20 }}>
            {page.sections.map((section: any) => (
              <section key={section.title} style={cardStyle}>
                <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: "1.6rem", color: "#ffffff" }}>{section.title}</h2>
                {section.paragraphs.map((paragraph: string) => (
                  <p key={paragraph} style={{ margin: "0 0 14px", color: "#cbd5e1", lineHeight: 1.8 }}>
                    {paragraph}
                  </p>
                ))}
                {section.list?.length ? (
                  <ol style={{ margin: "0 0 6px", paddingLeft: 22, color: "#cbd5e1", lineHeight: 1.8 }}>
                    {section.list.map((item: string) => (
                      <li key={item} style={{ marginBottom: 8 }}>{item}</li>
                    ))}
                  </ol>
                ) : null}
              </section>
            ))}

            <section style={cardStyle}>
              <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: "1.6rem", color: "#ffffff" }}>Typical process</h2>
              <ol style={{ margin: 0, paddingLeft: 20, color: "#cbd5e1", lineHeight: 1.8 }}>
                {page.steps.map((step: string) => (
                  <li key={step} style={{ marginBottom: 8 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </section>

            <section style={cardStyle}>
              <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: "1.6rem", color: "#ffffff" }}>Frequently asked questions</h2>
              <div style={{ display: "grid", gap: 12 }}>
                {page.faq.map((item: any) => (
                  <details key={item.q} style={{ borderRadius: 16, border: "1px solid rgba(148, 163, 184, 0.16)", padding: "14px 16px", background: "rgba(2, 6, 23, 0.25)" }}>
                    <summary style={{ cursor: "pointer", fontWeight: 700, color: "#f8fafc" }}>{item.q}</summary>
                    <p style={{ margin: "10px 0 0", color: "#cbd5e1", lineHeight: 1.7 }}>{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <aside style={{ display: "grid", gap: 20 }}>
            <section style={cardStyle}>
              <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: "1.15rem", color: "#ffffff" }}>Internal links</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {relatedPages.map((entry: any) => (
                  <Link key={entry.path} to={entry.path} style={{ color: accent, textDecoration: "none", fontWeight: 700 }}>
                    {entry.title}
                  </Link>
                ))}
              </div>
            </section>

            <section style={cardStyle}>
              <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: "1.15rem", color: "#ffffff" }}>Keyword scope</h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {page.keywords.map((keyword: string) => (
                  <span key={keyword} style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(148, 163, 184, 0.12)", color: "#e2e8f0", fontSize: 13 }}>
                    {keyword}
                  </span>
                ))}
              </div>
            </section>

            <section style={cardStyle}>
              <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: "1.15rem", color: "#ffffff" }}>Next steps</h2>
              <p style={{ margin: "0 0 12px", color: "#cbd5e1", lineHeight: 1.7 }}>
                Need direct support on this topic in Albania? KAYROSCO GROUP can coordinate the process and connect related services when the project expands.
              </p>
              <a
                href={page.cta.path}
                onClick={() => trackEvent("seo_sidebar_contact_click", { page_path: page.path, category })}
                style={{ color: accent, textDecoration: "none", fontWeight: 800 }}
              >
                {page.cta.label}
              </a>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
