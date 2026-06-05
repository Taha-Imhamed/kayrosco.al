import type { CSSProperties } from "react";
import SeoHead from "@/components/SeoHead";
import { Link, Navigate, useParams } from "react-router-dom";
import { resolveSeoPath, seoPages, SITE_URL } from "@/data/seoPages";
import NotFound from "./NotFound";

const shellStyle: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #fff9f2 0%, #f8f3ea 55%, #efe6d7 100%)",
  color: "#1f2937",
};

const containerStyle: CSSProperties = {
  maxWidth: 980,
  margin: "0 auto",
  padding: "32px 20px 80px",
};

const articleCard: CSSProperties = {
  background: "rgba(255, 255, 255, 0.84)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
};

function buildSchemas(page: any) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Insights",
          item: `${SITE_URL}/insights`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: page.title,
          item: `${SITE_URL}${page.path}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.title,
      description: page.metaDescription,
      author: {
        "@type": "Organization",
        name: "KAYROSCO GROUP",
      },
      publisher: {
        "@type": "Organization",
        name: "KAYROSCO GROUP",
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/lolo.png`,
        },
      },
      mainEntityOfPage: `${SITE_URL}${page.path}`,
      image: `${SITE_URL}/banner.png`,
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
}

export default function SeoArticlePage() {
  const { slug } = useParams();
  const { page, redirect } = resolveSeoPath(`/insights/${slug}`);

  if (redirect) {
    return <Navigate to={redirect} replace />;
  }

  if (!slug || !page || page.kind !== "article") {
    return <NotFound />;
  }

  const relatedPages = page.relatedPaths
    .map((path: string) => seoPages.find((entry) => entry.path === path))
    .filter(Boolean);

  return (
    <div style={shellStyle}>
      <SeoHead
        title={page.seoTitle}
        description={page.metaDescription}
        canonicalPath={page.path}
        keywords={page.keywords}
        schemas={buildSchemas(page)}
        ogType="article"
      />

      <div style={containerStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <Link to="/" style={{ color: "#111827", textDecoration: "none", fontWeight: 800, letterSpacing: "0.08em" }}>
            KAYROSCO GROUP
          </Link>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link to="/insights" style={{ color: "#475569", textDecoration: "none" }}>
              Insights
            </Link>
            <Link to="/tools" style={{ color: "#475569", textDecoration: "none" }}>
              Tools
            </Link>
          </div>
        </div>

        <section style={{ ...articleCard, marginBottom: 20 }}>
          <div style={{ display: "inline-flex", padding: "6px 12px", borderRadius: 999, background: "rgba(216, 139, 82, 0.14)", color: "#b45309", fontWeight: 800, marginBottom: 16 }}>
            Insight Article
          </div>
          <h1 style={{ fontSize: "clamp(2.3rem, 4.6vw, 3.8rem)", lineHeight: 1.08, margin: "0 0 16px", color: "#111827" }}>{page.title}</h1>
          <p style={{ color: "#475569", fontSize: "1.05rem", lineHeight: 1.8, margin: 0 }}>{page.intro}</p>
        </section>

        <div style={{ display: "grid", gap: 20 }}>
          {page.sections.map((section: any) => (
            <section key={section.title} style={articleCard}>
              <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: "1.55rem", color: "#111827" }}>{section.title}</h2>
              {section.paragraphs.map((paragraph: string) => (
                <p key={paragraph} style={{ margin: "0 0 14px", color: "#475569", lineHeight: 1.8 }}>
                  {paragraph}
                </p>
              ))}
              {section.list?.length ? (
                <ol style={{ margin: "0 0 6px", paddingLeft: 22, color: "#475569", lineHeight: 1.8 }}>
                  {section.list.map((item: string) => (
                    <li key={item} style={{ marginBottom: 8 }}>{item}</li>
                  ))}
                </ol>
              ) : null}
            </section>
          ))}

          <section style={articleCard}>
            <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: "1.55rem", color: "#111827" }}>Practical next step</h2>
            <p style={{ margin: "0 0 14px", color: "#475569", lineHeight: 1.8 }}>
              If you want direct help instead of only reading about the process, continue to the related KAYROSCO service page and request practical support.
            </p>
            <Link to={page.cta.path} style={{ color: "#1d4ed8", textDecoration: "none", fontWeight: 800 }}>
              {page.cta.label}
            </Link>
          </section>

          <section style={articleCard}>
            <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: "1.55rem", color: "#111827" }}>Frequently asked questions</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {page.faq.map((item: any) => (
                <details key={item.q} style={{ borderRadius: 16, border: "1px solid rgba(15, 23, 42, 0.08)", padding: "14px 16px", background: "rgba(255, 255, 255, 0.72)" }}>
                  <summary style={{ cursor: "pointer", fontWeight: 700 }}>{item.q}</summary>
                  <p style={{ margin: "10px 0 0", color: "#475569", lineHeight: 1.7 }}>{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section style={articleCard}>
            <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: "1.55rem", color: "#111827" }}>Related pages</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {relatedPages.map((entry: any) => (
                <Link key={entry.path} to={entry.path} style={{ color: "#1d4ed8", textDecoration: "none", fontWeight: 700 }}>
                  {entry.title}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
