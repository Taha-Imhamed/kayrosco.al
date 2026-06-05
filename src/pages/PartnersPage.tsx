import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import SeoHead from "@/components/SeoHead";
import { publicPartnerPage, SITE_URL } from "@/data/seoPages";

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
  background: "rgba(255, 255, 255, 0.92)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
};

export default function PartnersPage() {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "KAYROSCO GROUP",
      url: SITE_URL,
      logo: `${SITE_URL}/lolo.png`,
      description: publicPartnerPage.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: publicPartnerPage.title,
      description: publicPartnerPage.description,
      url: `${SITE_URL}${publicPartnerPage.path}`,
    },
  ];

  return (
    <div style={shellStyle}>
      <SeoHead
        title={publicPartnerPage.title}
        description={publicPartnerPage.description}
        canonicalPath={publicPartnerPage.path}
        keywords={["Kayrosco partners", "Albania business collaboration", "travel partners Albania", "technology partners Albania", "consulting partners Albania"]}
        schemas={schemas}
      />

      <div style={containerStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <Link to="/" style={{ color: "#0f172a", textDecoration: "none", fontWeight: 800, letterSpacing: "0.08em" }}>
            KAYROSCO GROUP
          </Link>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link to="/insights" style={{ color: "#475569", textDecoration: "none" }}>Insights</Link>
            <Link to="/partners" style={{ color: "#475569", textDecoration: "none" }}>Partners</Link>
            <Link to="/contact" style={{ color: "#475569", textDecoration: "none" }}>Contact</Link>
          </div>
        </div>

        <section style={{ ...cardStyle, marginBottom: 20 }}>
          <h1 style={{ fontSize: "clamp(2.3rem, 4.8vw, 3.9rem)", margin: "0 0 14px" }}>Partners & Collaborations</h1>
          <p style={{ margin: 0, color: "#475569", lineHeight: 1.8 }}>
            KAYROSCO GROUP works with technology providers, travel partners, consulting collaborators, destination operators, media platforms, and business networks that want a reliable Albania-based partner. This page is intentionally backlink-friendly so partners can reference the group, its departments, and its collaboration areas with a clear public destination.
          </p>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 20 }}>
          {[
            {
              title: "Technology Partners",
              text: "Ideal for agencies, software teams, hosting providers, digital consultants, and companies looking for web development, ecommerce, or SEO collaboration in Albania.",
            },
            {
              title: "Travel Partners",
              text: "Ideal for hotels, destination managers, transport providers, travel advisors, tourism media, and international operators that need travel support inside Albania.",
            },
            {
              title: "Consulting Partners",
              text: "Ideal for law firms, relocation providers, accountants, immigration specialists, and advisory businesses that need a local operating partner in Albania.",
            },
            {
              title: "Business Collaborations",
              text: "Ideal for chambers, universities, media outlets, startup communities, and referral partners who want a cross-functional Albania-based partner brand.",
            },
          ].map((item) => (
            <section key={item.title} style={cardStyle}>
              <h2 style={{ marginTop: 0, marginBottom: 12 }}>{item.title}</h2>
              <p style={{ margin: 0, color: "#475569", lineHeight: 1.8 }}>{item.text}</p>
            </section>
          ))}
        </div>

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0, marginBottom: 12 }}>Relevant pages for linking</h2>
          <div style={{ display: "grid", gap: 10 }}>
            <Link to="/consulting/company-registration-albania" style={{ color: "#1d4ed8", textDecoration: "none", fontWeight: 700 }}>Company registration in Albania</Link>
            <Link to="/consulting/residency-permit-albania" style={{ color: "#1d4ed8", textDecoration: "none", fontWeight: 700 }}>Residency permit support in Albania</Link>
            <Link to="/travel/tirana-airport-transfer" style={{ color: "#1d4ed8", textDecoration: "none", fontWeight: 700 }}>Airport transfer in Albania</Link>
            <Link to="/tech/web-development-albania" style={{ color: "#1d4ed8", textDecoration: "none", fontWeight: 700 }}>Web development in Albania</Link>
            <Link to="/tech/seo-services-albania" style={{ color: "#1d4ed8", textDecoration: "none", fontWeight: 700 }}>SEO services for Albanian businesses</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
