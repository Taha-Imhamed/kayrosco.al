import type { CSSProperties } from "react";
import SeoHead from "@/components/SeoHead";
import { Link, useLocation } from "react-router-dom";
import { seoArticlePages, seoLocationPages, seoServicePages, seoToolPages } from "@/data/seoPages";

const shellStyle: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
  color: "#0f172a",
};

const containerStyle: CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "32px 20px 80px",
};

const cardStyle: CSSProperties = {
  background: "rgba(255, 255, 255, 0.9)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  borderRadius: 24,
  padding: 24,
};

export default function SeoDirectoryPage() {
  const location = useLocation();
  const isTools = location.pathname === "/tools";
  const title = isTools ? "KAYROSCO GROUP Tools" : "KAYROSCO GROUP Insights";
  const description = isTools
    ? "Free calculators and checkers from KAYROSCO GROUP for Albania planning, travel, residency, and business support."
    : "Insight articles from KAYROSCO GROUP covering Albania consulting, travel, technology, and business topics.";

  const primaryItems = isTools ? seoToolPages : seoArticlePages;

  return (
    <div style={shellStyle}>
      <SeoHead
        title={title}
        description={description}
        canonicalPath={location.pathname}
        keywords={isTools ? ["Albania tools", "KAYROSCO GROUP tools"] : ["Albania insights", "KAYROSCO GROUP blog"]}
      />

      <div style={containerStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <Link to="/" style={{ color: "#0f172a", textDecoration: "none", fontWeight: 800, letterSpacing: "0.08em" }}>
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

        <section style={{ ...cardStyle, marginBottom: 20 }}>
          <h1 style={{ fontSize: "clamp(2.3rem, 4.5vw, 3.8rem)", margin: "0 0 12px" }}>{title}</h1>
          <p style={{ margin: 0, color: "#475569", lineHeight: 1.8 }}>{description}</p>
        </section>

        <section style={{ ...cardStyle, marginBottom: 20 }}>
          <h2 style={{ marginTop: 0 }}>Primary library</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {primaryItems.map((item) => (
              <Link key={item.path} to={item.path} style={{ padding: 16, borderRadius: 16, border: "1px solid rgba(15, 23, 42, 0.08)", textDecoration: "none", color: "#1d4ed8", fontWeight: 700 }}>
                {item.title}
              </Link>
            ))}
          </div>
        </section>

        {!isTools && (
          <>
            <section style={{ ...cardStyle, marginBottom: 20 }}>
              <h2 style={{ marginTop: 0 }}>Core service pages</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                {seoServicePages.slice(0, 12).map((item) => (
                  <Link key={item.path} to={item.path} style={{ padding: 16, borderRadius: 16, border: "1px solid rgba(15, 23, 42, 0.08)", textDecoration: "none", color: "#0f172a", fontWeight: 700 }}>
                    {item.title}
                  </Link>
                ))}
              </div>
            </section>

            <section style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Location pages</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                {seoLocationPages.slice(0, 18).map((item) => (
                  <Link key={item.path} to={item.path} style={{ padding: 16, borderRadius: 16, border: "1px solid rgba(15, 23, 42, 0.08)", textDecoration: "none", color: "#0f172a", fontWeight: 700 }}>
                    {item.title}
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
