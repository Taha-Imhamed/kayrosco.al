import type { FC, ReactNode } from "react";
import SeoHead from "@/components/SeoHead";

const SECTIONS: { title: string; body: ReactNode }[] = [
  {
    title: "1. Who We Are",
    body: (
      <p>
        KAYROSCO GROUP ("Kayrosco", "we", "us", or "our") is a multi-service company based at
        Rruga e Kavajes, Pallati 18/A, Kati 3, Tirana, Albania, operating across technology
        (Kayrosco Tech), consulting (Kayrosco Consulting), and travel (Kayrosco Travel). This
        Privacy Policy explains how we collect, use, and protect information when you visit
        kayrosco.al or interact with any of our services.
      </p>
    ),
  },
  {
    title: "2. Information We Collect",
    body: (
      <>
        <p>We collect information in the following ways:</p>
        <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
          <li><strong>Information you provide directly</strong> — such as your name, email address, phone or WhatsApp number, and any details you share through our contact forms, quick-request forms, or service request forms.</li>
          <li><strong>Automatically collected information</strong> — such as your IP address, browser type, device information, and pages visited, gathered through Google Analytics for website performance and improvement purposes.</li>
          <li><strong>Cookies</strong> — small files used to keep the site functioning properly and to understand how visitors use our site (see Section 6).</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. How We Use Your Information",
    body: (
      <>
        <p>We use the information we collect to:</p>
        <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
          <li>Respond to inquiries submitted through our contact or service request forms.</li>
          <li>Provide, operate, and improve our technology, consulting, and travel services.</li>
          <li>Understand website usage and improve site performance and content.</li>
          <li>Communicate with you about your request, project, or inquiry.</li>
        </ul>
        <p style={{ marginTop: "10px" }}>We do not sell, rent, or trade your personal information to third parties for marketing purposes.</p>
      </>
    ),
  },
  {
    title: "4. How We Share Information",
    body: (
      <>
        <p>We may share information with:</p>
        <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
          <li><strong>Service providers</strong> that help us operate the site and deliver our services, including hosting (Vercel), database and backend infrastructure (Supabase), and analytics (Google Analytics).</li>
          <li><strong>Legal authorities</strong>, if required by law, regulation, or legal process.</li>
        </ul>
        <p style={{ marginTop: "10px" }}>These providers only process data on our behalf and are not permitted to use it for their own purposes.</p>
      </>
    ),
  },
  {
    title: "5. Data Retention",
    body: (
      <p>
        We retain personal information for as long as necessary to respond to your inquiry, deliver
        the requested service, and comply with our legal and accounting obligations. You may request
        that we delete your information at any time by emailing{" "}
        <a href="mailto:info@kayrosco.al" style={{ color: "#C0C0C0" }}>info@kayrosco.al</a>.
      </p>
    ),
  },
  {
    title: "6. Cookies",
    body: (
      <p>
        Our website uses cookies and similar technologies to keep core functionality working and to
        measure site traffic through Google Analytics. You can control or disable cookies through
        your browser settings; disabling cookies may affect some site functionality.
      </p>
    ),
  },
  {
    title: "7. Your Rights",
    body: (
      <p>
        Depending on your location, you may have the right to access, correct, or delete your
        personal information, or to object to or restrict certain processing. To exercise any of
        these rights, contact us at{" "}
        <a href="mailto:info@kayrosco.al" style={{ color: "#C0C0C0" }}>info@kayrosco.al</a>.
      </p>
    ),
  },
  {
    title: "8. Children's Privacy",
    body: (
      <p>
        Our services are not directed at children under 16, and we do not knowingly collect personal
        information from children.
      </p>
    ),
  },
  {
    title: "9. Changes to This Policy",
    body: (
      <p>
        We may update this Privacy Policy from time to time. Changes will be posted on this page
        with an updated revision date.
      </p>
    ),
  },
  {
    title: "10. Contact Us",
    body: (
      <p>
        If you have questions about this Privacy Policy or how we handle your information, contact
        us at{" "}
        <a href="mailto:info@kayrosco.al" style={{ color: "#C0C0C0" }}>info@kayrosco.al</a>{" "}
        or write to us at Rruga e Kavajes, Pallati 18/A, Kati 3, Tirana, Albania.
      </p>
    ),
  },
];

const PrivacyPolicy: FC = () => (
  <div
    style={{
      minHeight: "100vh",
      backgroundColor: "#0A0A0A",
      color: "#EAEAEA",
      fontFamily: "'Manrope', sans-serif",
    }}
  >
    <SeoHead
      title="Privacy Policy | KAYROSCO GROUP"
      description="Learn how KAYROSCO GROUP collects, uses, and protects your information across our technology, consulting, and travel services."
      canonicalPath="/privacy-policy"
    />
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "80px 24px 100px" }}>
      <a href="/" style={{ color: "#B0BEC5", textDecoration: "none", fontSize: "0.9rem" }}>&larr; Back to Kayrosco Group</a>
      <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700, margin: "20px 0 8px" }}>Privacy Policy</h1>
      <p style={{ color: "#B0BEC5", marginBottom: "40px" }}>Last updated: September 2026</p>

      {SECTIONS.map((section) => (
        <div key={section.title} style={{ marginBottom: "34px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "10px", color: "#EAEAEA" }}>{section.title}</h2>
          <div style={{ color: "#B0BEC5", lineHeight: 1.7 }}>{section.body}</div>
        </div>
      ))}
    </div>
  </div>
);

export default PrivacyPolicy;
