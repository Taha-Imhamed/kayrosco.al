import React, { useEffect, useMemo, useState } from "react";
import SeoHead from "@/components/SeoHead";
import { addLocalRequest, formatReferenceCode, getRequestByTrackingId, type LocalRequest } from "@/lib/localStore";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CarFront,
  Globe,
  GraduationCap,
  HeartPulse,
  HelpingHand,
  Home,
  Landmark,
  LockKeyhole,
  Plane,
  Search,
  Shield,
  UserRound,
} from "lucide-react";

const COLORS = {
  page: "#CCD4C5",
  cream: "#EEE0C8",
  navy: "#22354A",
  sage: "#A9B59D",
  sageDark: "#7F9076",
  terracotta: "#D58A58",
  terracottaDark: "#B96D42",
  line: "rgba(34, 53, 74, 0.12)",
  textSoft: "rgba(34, 53, 74, 0.78)",
  whiteGlow: "rgba(255, 248, 237, 0.75)",
};

const FONT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');

  body {
    margin: 0;
    font-family: 'Manrope', sans-serif;
    background: ${COLORS.page};
    color: ${COLORS.navy};
    overflow-x: hidden;
  }

  * {
    box-sizing: border-box;
  }

  .kc-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(255, 244, 226, 0.55), transparent 32%),
      radial-gradient(circle at top right, rgba(255, 248, 239, 0.72), transparent 26%),
      linear-gradient(180deg, #d6ddd2 0%, ${COLORS.page} 38%, #d4dbcf 100%);
  }

  .kc-shell {
    max-width: 1360px;
    margin: 0 auto;
    padding: 24px 18px 60px;
  }

  .kc-glass {
    background:
      radial-gradient(circle at top left, rgba(255,255,255,0.7), transparent 24%),
      radial-gradient(circle at top right, rgba(255,249,240,0.72), transparent 30%),
      linear-gradient(180deg, rgba(255,251,245,0.98), rgba(250,243,230,0.94));
    border: 1px solid rgba(255,255,255,0.55);
    box-shadow:
      0 20px 45px rgba(78, 90, 70, 0.10),
      inset 0 1px 0 rgba(255,255,255,0.7);
    backdrop-filter: blur(10px);
  }

  .kc-heading {
    font-family: 'Cormorant Garamond', serif;
    letter-spacing: -0.03em;
  }

  .kc-wordmark {
    font-family: 'Cormorant Garamond', serif;
    letter-spacing: -0.025em;
  }

  .kc-section-number {
    position: absolute;
    top: -22px;
    left: -22px;
    width: 54px;
    height: 54px;
    border-radius: 999px;
    background: ${COLORS.navy};
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1.9rem;
    box-shadow: 0 16px 30px rgba(34, 53, 74, 0.18);
  }

  .kc-nav-link {
    text-decoration: none;
    color: ${COLORS.navy};
    font-size: 0.94rem;
    font-weight: 600;
    transition: color 0.2s ease;
  }

  .kc-nav-link:hover {
    color: ${COLORS.terracotta};
  }

  .kc-signin {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 17px;
    border-radius: 999px;
    border: 1px solid rgba(34, 53, 74, 0.26);
    background: rgba(255,255,255,0.45);
    color: ${COLORS.navy};
    font-size: 0.95rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .kc-signin:hover {
    border-color: rgba(34, 53, 74, 0.42);
    background: rgba(255,255,255,0.7);
  }

  .kc-primary-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    border: 0;
    border-radius: 14px;
    background: linear-gradient(180deg, ${COLORS.terracotta}, ${COLORS.terracottaDark});
    color: #fff;
    font-size: 0.98rem;
    font-weight: 800;
    letter-spacing: 0.01em;
    box-shadow: 0 14px 28px rgba(213, 138, 88, 0.28);
    cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }

  .kc-logo-lockup {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    text-decoration: none;
  }

  .kc-logo-mark {
    width: 70x;
    height: 120px;
    object-fit: contain;
    display: block;
    flex-shrink: 0;
  }

  .kc-logo-wordmark {
    display: flex;
    flex-direction: column;
    gap: 1px;
    color: ${COLORS.navy};
  }

  .kc-logo-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.25rem;
    line-height: 0.92;
    letter-spacing: 0.04em;
    font-weight: 600;
  }

  .kc-logo-sub {
    font-family: 'Manrope', sans-serif;
    font-size: 0.8rem;
    line-height: 1;
    letter-spacing: 0.42em;
    color: ${COLORS.sageDark};
    text-transform: uppercase;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .kc-logo-sub::before,
  .kc-logo-sub::after {
    content: "";
    width: 30px;
    height: 1px;
    background: rgba(127, 144, 118, 0.55);
    display: inline-block;
  }

  .kc-primary-btn:hover {
    transform: translateY(-1px);
    background: linear-gradient(180deg, ${COLORS.terracottaDark}, #a85f38);
    box-shadow: 0 18px 34px rgba(185, 109, 66, 0.30);
  }

  .kc-outline-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 16px 24px;
    border: 1px solid rgba(213, 138, 88, 0.55);
    border-radius: 14px;
    background: rgba(255,255,255,0.42);
    color: ${COLORS.terracotta};
    font-size: 0.95rem;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.18s ease;
  }

  .kc-outline-btn:hover {
    background: rgba(213, 138, 88, 0.08);
    border-color: ${COLORS.terracotta};
  }

  .kc-catalog-action {
    flex: 0 0 auto;
    min-width: fit-content;
    justify-content: center;
    padding: 7px 9px !important;
    font-size: 0.68rem !important;
    min-height: 30px;
    white-space: nowrap;
    letter-spacing: 0;
  }

  .kc-catalog-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, max-content));
    justify-content: center;
    gap: 8px;
    margin-top: 14px;
  }

  .kc-catalog-actions .kc-catalog-action:last-child {
    grid-column: 1 / -1;
    justify-self: center;
  }

  .kc-catalog-primary {
    background: linear-gradient(180deg, #dca178, #c98359);
    box-shadow: 0 12px 24px rgba(201, 131, 89, 0.18);
  }

  .kc-catalog-primary:hover {
    background: linear-gradient(180deg, #cf8f65, #bf764b);
    box-shadow: 0 14px 26px rgba(191, 118, 75, 0.2);
  }

  .kc-service-tile {
    background: rgba(255, 251, 245, 0.9);
    border: 1px solid rgba(34, 53, 74, 0.09);
    border-radius: 18px;
    padding: 18px 16px;
    min-height: 124px;
    display: flex;
    align-items: center;
    gap: 16px;
    text-align: left;
    box-shadow: 0 10px 24px rgba(44, 57, 35, 0.06);
    transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
    cursor: pointer;
  }

  .kc-service-tile:hover,
  .kc-service-tile.active {
    transform: translateY(-2px);
    border-color: rgba(213, 138, 88, 0.35);
    box-shadow: 0 16px 30px rgba(44, 57, 35, 0.1);
  }

  .kc-service-tile.active {
    background: linear-gradient(180deg, rgba(255, 251, 245, 0.98), rgba(255, 245, 235, 0.96));
  }

  .kc-icon-box {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: linear-gradient(180deg, ${COLORS.sage}, ${COLORS.sageDark});
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.25);
  }

  .kc-catalog-card {
    background: rgba(255, 251, 245, 0.86);
    border: 1px solid rgba(34, 53, 74, 0.08);
    border-radius: 18px;
    padding: 18px 18px 16px;
    min-height: 220px;
    box-shadow: 0 10px 24px rgba(44, 57, 35, 0.06);
  }

  .kc-catalog-list {
    margin: 0;
    padding-left: 18px;
    color: ${COLORS.textSoft};
    line-height: 1.6;
    font-size: 0.93rem;
  }

  .kc-divider {
    width: 64px;
    height: 1px;
    background: rgba(127, 144, 118, 0.55);
    margin: 14px auto 0;
  }

  .kc-search-shell {
    width: min(100%, 720px);
    margin: 16px auto 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 18px;
    border: 1px solid ${COLORS.line};
    background: rgba(255,255,255,0.78);
    box-shadow: 0 8px 22px rgba(34, 53, 74, 0.05);
  }

  .kc-search-input {
    flex: 1;
    border: 0;
    background: transparent;
    color: ${COLORS.navy};
    font-size: 14px;
    outline: none;
  }

  .kc-search-clear {
    border: 0;
    background: rgba(34, 53, 74, 0.08);
    color: ${COLORS.navy};
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }

  .kc-step-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
  }

  .kc-step-card {
    padding: 14px 16px;
    border-radius: 18px;
    background: rgba(255,255,255,0.55);
    border: 1px solid ${COLORS.line};
    text-align: left;
  }

  .kc-hero-header,
  .kc-tracker-input-row {
    width: 100%;
  }

  .kc-field-group {
    display: grid;
    gap: 6px;
  }

  .kc-field-label {
    color: ${COLORS.sageDark};
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .kc-form-control {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid ${COLORS.line};
    background: #fff;
    color: ${COLORS.navy};
    font: inherit;
  }

  @media (max-width: 1100px) {
    .kc-shell {
      padding: 18px 14px 48px;
    }
  }

  @media (max-width: 920px) {
    .kc-hide-mobile {
      display: none !important;
    }

    .kc-step-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

type ServiceGroup = {
  id: string;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  items: string[];
  description: string;
  duration: string;
  fee: string;
  documents: string[];
  highlights: string[];
};

type Language = "en" | "ar" | "tr";

const serviceGroups: ServiceGroup[] = [
  {
    id: "personal-civil",
    title: "Personal and Civil Services",
    shortTitle: "Personal and Civil Services",
    icon: UserRound,
    description: "Birth, civil registry, and identity services handled with guided support from first step to submission.",
    duration: "1-5 working days",
    fee: "Depends on the official service",
    documents: ["ID or passport", "Previous certificate or family record"],
    highlights: ["Certified copies", "Registry updates", "Identity renewals"],
    items: [
      "Birth, Marriage, Death Certificates",
      "Family Certificates",
      "ID/Passport Renewal",
      "Civil Registry Updates",
    ],
  },
  {
    id: "business-employment",
    title: "Business and Employment",
    shortTitle: "Business and Employment",
    icon: Briefcase,
    description: "Business registration, permits, and employment paperwork for private companies and professionals.",
    duration: "2-7 working days",
    fee: "Varies by registration type",
    documents: ["Company details", "NIPT / business documents", "Authorized representative ID"],
    highlights: ["Business setup", "Permit filing", "Employment verification"],
    items: [
      "Business Registration",
      "Business Licenses/Permits",
      "Employment Verification",
      "Tax Contributions",
    ],
  },
  {
    id: "transport-vehicles",
    title: "Transport and Vehicles",
    shortTitle: "Transport and Vehicles",
    icon: CarFront,
    description: "Vehicle, driving, and transport requests with status updates and step-by-step guidance.",
    duration: "Same day to 5 working days",
    fee: "Official transport fees apply",
    documents: ["Driving license or ID", "Vehicle registration details", "Insurance/inspection proof"],
    highlights: ["License renewal", "Vehicle transfer", "Traffic fine payment"],
    items: [
      "Driver’s License Renewal",
      "Vehicle Registration/Transfer",
      "Pay Traffic Fines",
      "Inspection History",
    ],
  },
  {
    id: "property-construction",
    title: "Property and Construction",
    shortTitle: "Property and Construction",
    icon: Home,
    description: "Property ownership, legalization, cadastral, and construction-related requests in one place.",
    duration: "3-15 working days",
    fee: "Based on case type and registry rules",
    documents: ["Property documents", "Owner ID", "Site or cadastral reference"],
    highlights: ["Ownership certificates", "Permits", "Cadastral maps"],
    items: [
      "Property Ownership Certificates (ASHK)",
      "Construction Permits/Legalization",
      "Cadastral Maps/Data",
    ],
  },
  {
    id: "taxes-payments",
    title: "Taxes and Payments",
    shortTitle: "Taxes and Payments",
    icon: Landmark,
    description: "Tax, invoice, and payment services for citizens and businesses with clear next steps.",
    duration: "Same day to 3 working days",
    fee: "Service-dependent government fees",
    documents: ["Tax number or personal ID", "Payment details", "Invoice references"],
    highlights: ["Tax certificates", "E-invoices", "Payment history"],
    items: [
      "Pay Local/National Taxes",
      "Obtain Tax Certificates",
      "Access E-Invoices/History",
    ],
  },
  {
    id: "health-social",
    title: "Health and Social Services",
    shortTitle: "Health and Social Services",
    icon: HeartPulse,
    description: "Health insurance, social support, and assistance services for families, workers, and seniors.",
    duration: "1-4 working days",
    fee: "Usually free or low-fee",
    documents: ["Personal ID", "Insurance or social support records", "Referral or medical note if needed"],
    highlights: ["Insurance check", "Aid guidance", "Medical referrals"],
    items: [
      "Health Insurance Check",
      "Social Aid/Pension Info",
      "Medical Referrals/Vaccination",
    ],
  },
  {
    id: "justice-police",
    title: "Justice and Police",
    shortTitle: "Justice and Police",
    icon: Shield,
    description: "Court, police, and conduct certificates with guided handling for formal compliance requests.",
    duration: "1-6 working days",
    fee: "Depends on certificate type",
    documents: ["ID or passport", "Case or certificate references"],
    highlights: ["Good conduct", "Record certificates", "Fine payments"],
    items: [
      "Criminal Record Certificates",
      "Certificate of Good Conduct",
      "Pay Fines/Check Case Status",
    ],
  },
  {
    id: "digital-auth",
    title: "Digital Certificates and Authentication",
    shortTitle: "Digital Certificates and Authentication",
    icon: LockKeyhole,
    description: "Electronic signature and document authentication support for secure digital service use.",
    duration: "1-3 working days",
    fee: "Varies by authentication request",
    documents: ["Identity document", "Contact email", "Supported official documents"],
    highlights: ["Electronic signatures", "Document verification", "Secure access"],
    items: [
      "Electronic Signatures",
      "Secure Personal Data Access",
      "Verify Official Documents",
    ],
  },
  {
    id: "visa-services",
    title: "Visa Services",
    shortTitle: "Visa Services",
    icon: Plane,
    description: "Visa support for travelers, invitation letters, and status tracking in one guided request flow.",
    duration: "2-10 working days",
    fee: "Varies by visa type",
    documents: ["Passport", "Travel dates", "Supporting letters or booking details"],
    highlights: ["Visa guidance", "Invitation letters", "Status checks"],
    items: [
      "Visa Services",
      "Tourist Visa Support",
      "Invitation Letters",
      "Visa Status Check",
    ],
  },
  {
    id: "residency-permits",
    title: "Residency & Permits",
    shortTitle: "Residency & Permits",
    icon: Building2,
    description: "Residence and permit requests for temporary, permanent, or employment-related stay.",
    duration: "3-15 working days",
    fee: "Dependent on permit class",
    documents: ["Passport", "Residence address", "Employer or sponsor details"],
    highlights: ["Temporary stay", "Permanent residence", "Work extensions"],
    items: [
      "Temporary Residence",
      "Permanent Residence",
      "Work Permits & Extensions",
    ],
  },
  {
    id: "student-services",
    title: "Student Services",
    shortTitle: "Student Services",
    icon: GraduationCap,
    description: "Enrollment, scholarship, and diploma services for university and vocational students.",
    duration: "1-7 working days",
    fee: "Usually institution-dependent",
    documents: ["Student ID or passport", "Academic records", "Admission letter if available"],
    highlights: ["Enrollment support", "Diploma checks", "Scholarship guidance"],
    items: [
      "University Enrollment",
      "Diploma Verification",
      "Scholarship Guidance",
    ],
  },
  {
    id: "student-mobility",
    title: "Student Mobility",
    shortTitle: "Student Mobility",
    icon: Globe,
    description: "Exchange and mobility support for students moving between universities or countries.",
    duration: "2-8 working days",
    fee: "Depends on mobility program",
    documents: ["Passport or ID", "Enrollment proof", "Mobility program details"],
    highlights: ["Exchange support", "Residence help", "Housing guidance"],
    items: [
      "Erasmus & Exchange Support",
      "Residence for Students",
      "Campus Housing Assistance",
    ],
  },
];

const portalGroups = serviceGroups.map((group) => ({
  id: group.id,
  title: group.shortTitle,
  icon: group.icon,
}));

const pageText = {
  en: {
    nav: { home: "Home", services: "Services", about: "About", help: "Help", track: "Track" },
    brand: "Consulting",
    heroEyebrow: "Kayrosco Consulting",
    heroTitle: "Access to Albanian Public Services",
    heroText: "Securely access over 1,200 services digitally, from ID renewals to tax payments. Start your application below.",
    startService: "START NEW SERVICE",
    portalTitle: "Service Request Portal",
    step1: "Step 1:",
    chooseCategory: "Choose a Service Category",
    searchPlaceholder: "Search services, documents, or processing time",
    searchHint: "Try keywords like passport, residence, vehicle, or tax.",
    clear: "Clear",
    selectedCategory: "Selected Category",
    coreServicesCount: "core services in this category",
    openRequestDetails: "Open request details",
    fullCatalog: "FULL SERVICE CATALOG",
    catalogTitle: "Full Service Catalog",
    catalogSubtitle: "Core Services",
    requestThisService: "Request this service",
    makeActive: "Make active",
    showMore: "Show more",
    showLess: "Show less",
    requiredDocuments: "Required documents",
    needHelp: "Need Help?",
    needHelpText: "Our support team is here to assist you with any questions.",
    contactSupport: "Contact Support",
    secureTrusted: "Secure & Trusted",
    secureTrustedText: "Your data is protected with top-tier security and encryption.",
    learnMore: "Learn More",
    about: "About",
    aboutShort: "Kayrosco Consulting helps citizens access Albanian public services through a guided digital experience.",
    aboutMore: "We provide clear steps, reference codes, and staff follow-up so requests are easier to understand and track.",
    checkApplication: "Check Application",
    checkApplicationText: "Use your reference code to check the status of a request at any time.",
    fastLookup: "Fast lookup",
    referencePlaceholder: "Enter reference code like KAY-ABCD-EFGH-IJKL",
    checkStatus: "Check status",
    referenceHelp: "Reference codes are generated after you submit a request from the service window.",
    applicationFound: "Application found.",
    enterReference: "Please enter a reference code.",
    noApplication: "No application found for that reference code.",
    submittedSuccessfully: "Submitted successfully",
    whatYouGet: "What you get",
    typicalDocuments: "Typical documents",
    details: "Details",
    processing: "Processing",
    fees: "Fees",
    selectThisOne: "Select this one",
    close: "Close",
    checkApplicationBtn: "Check application",
    done: "Done",
    fullName: "Full name",
    email: "Email",
    phone: "Phone",
    city: "City",
    preferredContact: "Preferred contact",
    extraDetails: "Extra details",
    referenceGenerated: "Reference code will be generated after submission",
    sendRequest: "Send Request",
    back: "Back",
    english: "EN",
    arabic: "AR",
    turkish: "TR",
  },
  ar: {
    nav: { home: "الرئيسية", services: "الخدمات", about: "حول", help: "مساعدة", track: "تتبع" },
    brand: "الاستشارات",
    heroEyebrow: "كاي روسكو للاستشارات",
    heroTitle: "الوصول إلى الخدمات العامة في ألبانيا",
    heroText: "يمكنك الوصول إلى أكثر من 1200 خدمة رقميا، من تجديد الهوية إلى الضرائب. ابدأ طلبك من الأسفل.",
    startService: "ابدأ خدمة جديدة",
    portalTitle: "بوابة طلب الخدمات",
    step1: "الخطوة 1:",
    chooseCategory: "اختر فئة الخدمة",
    searchPlaceholder: "ابحث عن خدمة أو مستند أو مدة المعالجة",
    searchHint: "جرّب كلمات مثل جواز سفر أو إقامة أو مركبة أو ضرائب.",
    clear: "مسح",
    selectedCategory: "الفئة المختارة",
    coreServicesCount: "خدمات أساسية في هذه الفئة",
    openRequestDetails: "فتح تفاصيل الطلب",
    fullCatalog: "كل الخدمات",
    catalogTitle: "دليل الخدمات الكامل",
    catalogSubtitle: "الخدمات الأساسية",
    requestThisService: "اطلب هذه الخدمة",
    makeActive: "تحديدها",
    showMore: "عرض المزيد",
    showLess: "عرض أقل",
    requiredDocuments: "المستندات المطلوبة",
    needHelp: "تحتاج مساعدة؟",
    needHelpText: "فريق الدعم لدينا موجود لمساعدتك في أي سؤال.",
    contactSupport: "تواصل مع الدعم",
    secureTrusted: "آمن وموثوق",
    secureTrustedText: "بياناتك محمية بأمان وتشفير قوي.",
    learnMore: "اعرف المزيد",
    about: "حول",
    aboutShort: "تساعد كاي روسكو للاستشارات المواطنين في الوصول إلى الخدمات العامة الألبانية بطريقة رقمية مبسطة.",
    aboutMore: "نوفر خطوات واضحة وأكواد مرجعية ومتابعة من الفريق لتسهيل فهم الطلبات وتتبعها.",
    checkApplication: "فحص الطلب",
    checkApplicationText: "استخدم الرمز المرجعي للتحقق من حالة طلبك في أي وقت.",
    fastLookup: "بحث سريع",
    referencePlaceholder: "أدخل الرمز المرجعي مثل KAY-ABCD-EFGH-IJKL",
    checkStatus: "تحقق من الحالة",
    referenceHelp: "يتم إنشاء الرمز المرجعي بعد إرسال الطلب من نافذة الخدمة.",
    applicationFound: "تم العثور على الطلب.",
    enterReference: "يرجى إدخال رمز مرجعي.",
    noApplication: "لم يتم العثور على طلب لهذا الرمز.",
    submittedSuccessfully: "تم الإرسال بنجاح",
    whatYouGet: "ما الذي ستحصل عليه",
    typicalDocuments: "المستندات المعتادة",
    details: "التفاصيل",
    processing: "المعالجة",
    fees: "الرسوم",
    selectThisOne: "اختر هذه الخدمة",
    close: "إغلاق",
    checkApplicationBtn: "فحص الطلب",
    done: "تم",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    city: "المدينة",
    preferredContact: "طريقة التواصل المفضلة",
    extraDetails: "تفاصيل إضافية",
    referenceGenerated: "سيتم إنشاء الرمز المرجعي بعد الإرسال",
    sendRequest: "إرسال الطلب",
    back: "رجوع",
    english: "EN",
    arabic: "AR",
    turkish: "TR",
  },
  tr: {
    nav: { home: "Ana Sayfa", services: "Hizmetler", about: "Hakkında", help: "Yardım", track: "Takip" },
    brand: "Danışmanlık",
    heroEyebrow: "Kayrosco Danışmanlık",
    heroTitle: "Arnavutluk Kamu Hizmetlerine Erişim",
    heroText: "Kimlik yenilemeden vergi ödemelerine kadar 1.200'den fazla hizmete dijital olarak erişin. Başvurunuzu aşağıdan başlatın.",
    startService: "YENI HIZMET BAŞLAT",
    portalTitle: "Hizmet Başvuru Portalı",
    step1: "Adım 1:",
    chooseCategory: "Hizmet Kategorisi Seçin",
    searchPlaceholder: "Hizmet, belge veya işlem süresi ara",
    searchHint: "Pasaport, oturum, araç veya vergi gibi kelimeler deneyin.",
    clear: "Temizle",
    selectedCategory: "Seçili Kategori",
    coreServicesCount: "bu kategoride temel hizmet",
    openRequestDetails: "Talep detaylarını aç",
    fullCatalog: "TÜM HIZMETLER",
    catalogTitle: "Tam Hizmet Kataloğu",
    catalogSubtitle: "Temel Hizmetler",
    requestThisService: "Bu hizmeti iste",
    makeActive: "Aktif yap",
    showMore: "Daha fazla",
    showLess: "Daha az",
    requiredDocuments: "Gerekli belgeler",
    needHelp: "Yardıma mı ihtiyacınız var?",
    needHelpText: "Destek ekibimiz sorularınız için burada.",
    contactSupport: "Destekle iletişim kur",
    secureTrusted: "Güvenli ve Güvenilir",
    secureTrustedText: "Verileriniz güçlü güvenlik ve şifreleme ile korunur.",
    learnMore: "Daha Fazla Bilgi",
    about: "Hakkında",
    aboutShort: "Kayrosco Danışmanlık, vatandaşların Arnavutluk kamu hizmetlerine rehberli bir dijital deneyimle erişmesine yardımcı olur.",
    aboutMore: "Başvuruları anlamayı ve takip etmeyi kolaylaştırmak için net adımlar, referans kodları ve ekip takibi sunuyoruz.",
    checkApplication: "Başvuruyu Kontrol Et",
    checkApplicationText: "Başvurunuzun durumunu istediğiniz zaman referans koduyla kontrol edin.",
    fastLookup: "Hızlı sorgu",
    referencePlaceholder: "KAY-ABCD-EFGH-IJKL gibi referans kodu girin",
    checkStatus: "Durumu kontrol et",
    referenceHelp: "Referans kodları hizmet penceresinden başvuru gönderdikten sonra oluşturulur.",
    applicationFound: "Başvuru bulundu.",
    enterReference: "Lütfen bir referans kodu girin.",
    noApplication: "Bu referans kodu için başvuru bulunamadı.",
    submittedSuccessfully: "Başarıyla gönderildi",
    whatYouGet: "Neler alırsınız",
    typicalDocuments: "Tipik belgeler",
    details: "Detaylar",
    processing: "Süreç",
    fees: "Ücretler",
    selectThisOne: "Bunu seç",
    close: "Kapat",
    checkApplicationBtn: "Başvuruyu kontrol et",
    done: "Bitti",
    fullName: "Ad soyad",
    email: "E-posta",
    phone: "Telefon",
    city: "Şehir",
    preferredContact: "Tercih edilen iletişim",
    extraDetails: "Ek detaylar",
    referenceGenerated: "Gönderdikten sonra referans kodu oluşturulacak",
    sendRequest: "Talebi Gönder",
    back: "Geri",
    english: "EN",
    arabic: "AR",
    turkish: "TR",
  },
} as const;

export default function ConsultingPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [selectedCategory, setSelectedCategory] = useState<string>(portalGroups[0].id);
  const [mobileNavTarget, setMobileNavTarget] = useState("#home");
  const [serviceSearch, setServiceSearch] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAboutMore, setShowAboutMore] = useState(false);
  const [expandedCatalogId, setExpandedCatalogId] = useState<string | null>(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submittedReferenceCode, setSubmittedReferenceCode] = useState("");
  const [formValues, setFormValues] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    notes: "",
    preferred_contact: "email",
  });
  const [detailsGroup, setDetailsGroup] = useState<ServiceGroup | null>(null);
  const [referenceLookup, setReferenceLookup] = useState("");
  const [referenceResult, setReferenceResult] = useState<LocalRequest | null>(null);
  const [referenceMessage, setReferenceMessage] = useState(pageText.en.referenceHelp);
  const text = pageText[language];
  const localizedPortalSteps = [
    { title: language === "ar" ? "اختر الخدمة" : language === "tr" ? "Hizmet seç" : "Choose a service", text: language === "ar" ? "اختر الفئة المناسبة لطلبك." : language === "tr" ? "Talebinize uygun kategoriyi seçin." : "Pick the category that matches your request." },
    { title: language === "ar" ? "راجع المتطلبات" : language === "tr" ? "Gereksinimleri incele" : "Review requirements", text: language === "ar" ? "اطلع على المستندات والمدة والرسوم المتوقعة قبل الإرسال." : language === "tr" ? "Göndermeden önce belge, süre ve ücretleri görün." : "See documents, timing, and expected fees before you submit." },
    { title: language === "ar" ? "أرسل الطلب" : language === "tr" ? "Talebi gönder" : "Send your request", text: language === "ar" ? "احصل على رمز مرجعي وتتبع الطلب في أي وقت." : language === "tr" ? "Referans kodu alın ve istediğiniz zaman takip edin." : "Get a reference code and track progress anytime." },
  ];

  useEffect(() => {
    if (!referenceResult) {
      setReferenceMessage(text.referenceHelp);
    }
  }, [language, referenceResult, text.referenceHelp]);

  const navLinks = [
    { label: text.nav.home, href: "#home" },
    { label: text.nav.services, href: "#portal" },
    { label: text.nav.about, href: "#about" },
    { label: text.nav.help, href: "#support" },
  ];

  const mobileNavLinks = [
    { label: text.nav.home, href: "#home", icon: Home },
    { label: text.nav.services, href: "#portal", icon: Briefcase },
    { label: text.nav.about, href: "#about", icon: BadgeCheck },
    { label: text.nav.track, href: "#reference-tracker", icon: Search },
  ];

  const selectedGroup = useMemo(
    () => serviceGroups.find((group) => group.id === selectedCategory) ?? serviceGroups[0],
    [selectedCategory]
  );

  const filteredGroups = useMemo(() => {
    const q = serviceSearch.trim().toLowerCase();
    if (!q) return serviceGroups;
    return serviceGroups.filter((group) => {
      const haystack = [group.title, group.description, group.duration, group.fee, ...group.items, ...group.highlights, ...group.documents]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [serviceSearch]);

  const lookupReferenceCode = (value?: string) => {
    const query = (value ?? referenceLookup).trim();
    if (!query) {
      setReferenceMessage(text.enterReference);
      setReferenceResult(null);
      return;
    }
    const result = getRequestByTrackingId(query);
    if (!result) {
      setReferenceMessage(text.noApplication);
      setReferenceResult(null);
      return;
    }
    setReferenceResult(result);
    setReferenceMessage(text.applicationFound);
  };

  const openFormForSelected = () => {
    setSubmissionComplete(false);
    setShowForm(true);
  };

  const scrollToReferenceLookup = () => {
    document.getElementById("reference-tracker")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const jumpToCatalog = (id?: string) => {
    if (id) {
      setSelectedCategory(id);
    }
    setTimeout(() => {
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  };

  const scrollToSection = (href: string) => {
    setMobileNavTarget(href);
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <SeoHead
        title="Company Registration & Residency Services in Albania | Kayrosco Consulting"
        description="Get support with company registration, residency permits, work permits, business licenses, tax registration and public document assistance in Albania."
        canonicalPath="/consulting"
        keywords={["company registration in Albania", "residency permit support", "work permit Albania", "business license Albania", "Kayrosco Consulting"]}
      />
      <style dangerouslySetInnerHTML={{ __html: FONT_STYLES }} />
      <div className="kc-page" dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="kc-shell">
          <section
            id="home"
            className="kc-glass"
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 28,
              padding: "6px 18px 0",
              minHeight: 420,
            }}
          >
            <img
              src="/hero kc.png"
              alt="Kayrosco Consulting public services illustration"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center center",
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, rgba(255,248,239,0.97) 0%, rgba(255,248,239,0.92) 24%, rgba(255,248,239,0.72) 46%, rgba(255,248,239,0.18) 74%, rgba(255,248,239,0.10) 100%)",
                zIndex: 1,
              }}
            />
            <header
              className="kc-hero-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
                padding: "0 10px 6px 2px",
                marginTop: "-8px",
                position: "relative",
                zIndex: 3,
              }}
            >
              <a href="#home" className="kc-logo-lockup">
                <img
                  src="/logo_kc_finall-removebg-preview.png"
                  alt="Kayrosco Consulting logo"
                  className="kc-logo-mark"
                />
                <span className="kc-logo-wordmark">
                  <span className="kc-logo-title">KAYROSCO</span>
                  <span className="kc-logo-sub">{text.brand}</span>
                </span>
              </a>

              <nav
                className="kc-hide-mobile"
                style={{ display: "flex", alignItems: "center", gap: 42, marginLeft: "auto", marginRight: 26, paddingTop: 2 }}
              >
                {navLinks.map((link) => (
                  <a key={link.label} href={link.href} className="kc-nav-link">
                    {link.label}
                  </a>
                ))}
              </nav>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {([
                    ["en", text.english],
                    ["ar", text.arabic],
                    ["tr", text.turkish],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setLanguage(value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        border: `1px solid ${language === value ? COLORS.terracottaDark : "rgba(34, 53, 74, 0.16)"}`,
                        background: language === value ? "rgba(213,138,88,0.12)" : "rgba(255,255,255,0.5)",
                        color: COLORS.navy,
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(480px, 1.08fr) minmax(540px, 1.42fr)",
                gap: 0,
                alignItems: "stretch",
                position: "relative",
                zIndex: 2,
              }}
              className="kc-hero-grid"
            >
              <div style={{ padding: "18px 0 28px 14px", position: "relative", zIndex: 2 }} className="kc-hero-copy">
                <p
                  style={{
                    margin: "0 0 20px",
                    color: COLORS.sageDark,
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                  className="kc-wordmark"
                >
                  {text.heroEyebrow}
                </p>
                <h1
                  className="kc-heading kc-wordmark"
                  style={{
                    margin: "0 0 18px",
                    fontSize: "clamp(3.1rem, 4vw, 4.25rem)",
                    lineHeight: 0.98,
                    maxWidth: 620,
                    color: COLORS.navy,
                  }}
                >
                  {text.heroTitle}
                </h1>
                <p
                  style={{
                    margin: "0 0 22px",
                    maxWidth: 500,
                    color: COLORS.textSoft,
                    fontSize: "1.08rem",
                    lineHeight: 1.65,
                  }}
                >
                  {text.heroText}
                </p>
                <button type="button" className="kc-primary-btn" onClick={() => document.getElementById("portal")?.scrollIntoView({ behavior: "smooth" })}>
                  <span>{text.startService}</span>
                  <ArrowRight size={18} />
                </button>
                <div className="kc-step-grid">
                  {localizedPortalSteps.map((step, index) => (
                    <div key={step.title} className="kc-step-card">
                      <div style={{ color: COLORS.terracottaDark, fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                        Step {index + 1}
                      </div>
                      <div style={{ fontWeight: 800, marginBottom: 6 }}>{step.title}</div>
                      <div style={{ color: COLORS.textSoft, fontSize: 14, lineHeight: 1.55 }}>{step.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  position: "relative",
                  minHeight: 340,
                  overflow: "hidden",
                  borderBottomRightRadius: 28,
                  borderBottomLeftRadius: 28,
                  background: "transparent",
                }}
                className="kc-hero-visual"
              >
              </div>
            </div>
          </section>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 16,
              marginTop: 16,
            }}
            className="kc-main-grid"
          >
            <section
              id="portal"
              className="kc-glass"
              style={{
                position: "relative",
                borderRadius: 24,
                padding: "28px 28px 26px",
                minHeight: 100,
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 28, paddingTop: 6 }}>
                <h2 className="kc-heading" style={{ margin: "0", fontSize: "clamp(2.2rem, 3vw, 3rem)" }}>
                  {text.portalTitle}
                </h2>
                <p style={{ margin: "10px 0 0", color: COLORS.terracotta, fontWeight: 700, fontSize: "1rem" }}>
                  {text.step1} <span style={{ color: COLORS.textSoft, fontWeight: 600 }}>{text.chooseCategory}</span>
                </p>
                <div className="kc-divider" />
                <div className="kc-search-shell">
                  <Search size={18} color={COLORS.sageDark} />
                  <input
                    className="kc-search-input"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder={text.searchPlaceholder}
                    aria-label="Search services"
                  />
                  {!!serviceSearch.trim() && (
                    <button type="button" className="kc-search-clear" onClick={() => setServiceSearch("")}>
                      {text.clear}
                    </button>
                  )}
                </div>
                <p style={{ margin: "10px 0 0", color: COLORS.textSoft, fontSize: 13 }}>
                  {text.searchHint}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 14,
                }}
                className="kc-portal-grid"
              >
                {filteredGroups.map((group) => {
                  const Icon = group.icon;
                  const active = selectedCategory === group.id;

                  return (
                    <button
                      key={group.id}
                      type="button"
                      className={`kc-service-tile${active ? " active" : ""}`}
                      onClick={() => {
                        setSelectedCategory(group.id);
                        const full = serviceGroups.find((g) => g.id === group.id) ?? null;
                        setDetailsGroup(full);
                        setShowDetails(true);
                        setShowForm(false);
                        setSubmissionComplete(false);
                      }}
                    >
                      <div className="kc-icon-box">
                        <Icon size={24} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, color: COLORS.navy, fontSize: "0.95rem", lineHeight: 1.35 }}>
                          {group.title}
                        </div>
                        <div style={{ marginTop: 6, color: COLORS.textSoft, fontSize: 12, lineHeight: 1.45 }}>
                          {group.duration} · {group.fee}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filteredGroups.length === 0 && (
                  <div style={{ gridColumn: "1 / -1", padding: 18, borderRadius: 18, background: "rgba(255,255,255,0.6)", border: `1px solid ${COLORS.line}`, color: COLORS.textSoft, textAlign: "center" }}>
                    No services matched your search. Try another keyword like passport, tax, or residence.
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: 22,
                  padding: 18,
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.5)",
                  border: `1px solid ${COLORS.line}`,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 18,
                }}
              >
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.sageDark, fontWeight: 800 }}>
                    {text.selectedCategory}
                  </p>
                  <h3 className="kc-heading" style={{ margin: 0, fontSize: "2rem" }}>
                    {selectedGroup.title}
                  </h3>
                  <p style={{ margin: "8px 0 0", maxWidth: 580, color: COLORS.textSoft, lineHeight: 1.6 }}>
                    {selectedGroup.description}
                  </p>
                  <p style={{ margin: "10px 0 0", color: COLORS.sageDark, fontSize: 13, fontWeight: 700 }}>
                    {selectedGroup.items.length} {text.coreServicesCount}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" className="kc-primary-btn" onClick={() => {
                    setDetailsGroup(selectedGroup);
                    setShowDetails(true);
                    setShowForm(false);
                    setSubmissionComplete(false);
                  }}>
                    {text.openRequestDetails}
                  </button>
                  <button type="button" className="kc-outline-btn" onClick={() => jumpToCatalog(selectedGroup.id)}>
                    <span>{text.fullCatalog}</span>
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </section>

            <section
              id="catalog"
              className="kc-glass"
              style={{
                position: "relative",
                borderRadius: 24,
                padding: "24px 26px 22px",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 18, paddingTop: 6 }}>
                <h2 className="kc-heading" style={{ margin: "0", fontSize: "clamp(2.1rem, 2.8vw, 2.8rem)" }}>
                  {text.catalogTitle}
                </h2>
                <p style={{ margin: "8px 0 0", color: COLORS.textSoft, fontSize: "0.98rem" }}>{text.catalogSubtitle}</p>
                <div className="kc-divider" />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 12,
                }}
                className="kc-catalog-grid"
              >
                {serviceGroups.map((group) => {
                  const Icon = group.icon;
                  const active = selectedCategory === group.id;

                  return (
                    <div
                      key={group.id}
                      className="kc-catalog-card"
                      style={{
                        borderColor: active ? "rgba(213, 138, 88, 0.24)" : "rgba(34, 53, 74, 0.08)",
                        boxShadow: active ? "0 16px 28px rgba(213, 138, 88, 0.10)" : "0 10px 24px rgba(44, 57, 35, 0.06)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                        <div className="kc-icon-box" style={{ width: 46, height: 46, borderRadius: 14 }}>
                          <Icon size={22} />
                        </div>
                        <div>
                          <h3 className="kc-heading" style={{ margin: 0, fontSize: "1.32rem", lineHeight: 1.05 }}>
                            {group.title}
                          </h3>
                          <p style={{ margin: "8px 0 0", color: COLORS.textSoft, fontSize: 12.5, lineHeight: 1.55 }}>
                            {group.description}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                        <span style={{ padding: "5px 10px", borderRadius: 999, background: "rgba(127,144,118,0.12)", color: COLORS.sageDark, fontSize: 11, fontWeight: 700 }}>
                          {group.duration}
                        </span>
                      </div>
                      {expandedCatalogId === group.id && (
                        <>
                          <ul className="kc-catalog-list">
                            {group.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                          <div style={{ marginTop: 12, color: COLORS.textSoft, fontSize: 12, lineHeight: 1.5 }}>
                            {text.fees}: {group.fee}
                          </div>
                          <div style={{ marginTop: 8, color: COLORS.textSoft, fontSize: 12, lineHeight: 1.5 }}>
                            {text.requiredDocuments}: {group.documents.join(", ")}
                          </div>
                        </>
                      )}
                      <div className="kc-catalog-actions">
                        <button
                          type="button"
                          className="kc-primary-btn kc-catalog-action kc-catalog-primary"
                          onClick={() => {
                            setSelectedCategory(group.id);
                            setDetailsGroup(group);
                            setShowDetails(true);
                            setShowForm(false);
                            setSubmissionComplete(false);
                          }}
                        >
                          {text.requestThisService}
                        </button>
                        <button
                          type="button"
                          className="kc-outline-btn kc-catalog-action"
                          onClick={() => setSelectedCategory(group.id)}
                        >
                          {text.makeActive}
                        </button>
                        <button
                          type="button"
                          className="kc-outline-btn kc-catalog-action"
                          onClick={() => setExpandedCatalogId((current) => (current === group.id ? null : group.id))}
                        >
                          {expandedCatalogId === group.id ? text.showLess : text.showMore}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                id="support"
                style={{
                  marginTop: 16,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
                className="kc-support-grid"
              >
                <div
                  style={{
                    background: "rgba(255,251,245,0.86)",
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 18,
                    padding: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    minHeight: 118,
                  }}
                >
                  <div className="kc-icon-box" style={{ width: 58, height: 58, borderRadius: 18 }}>
                    <HelpingHand size={26} />
                  </div>
                  <div>
                    <h4 className="kc-heading" style={{ margin: "0 0 6px", fontSize: "1.55rem" }}>{text.needHelp}</h4>
                    <p style={{ margin: "0 0 8px", color: COLORS.textSoft, fontSize: "0.95rem", lineHeight: 1.55 }}>{text.needHelpText}</p>
                    <a href="#home" style={{ color: COLORS.terracotta, textDecoration: "none", fontWeight: 800 }}>
                      Contact Support →
                    </a>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255,251,245,0.86)",
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 18,
                    padding: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    minHeight: 118,
                  }}
                >
                  <div className="kc-icon-box" style={{ width: 58, height: 58, borderRadius: 18 }}>
                    <BadgeCheck size={26} />
                  </div>
                  <div>
                    <h4 className="kc-heading" style={{ margin: "0 0 6px", fontSize: "1.55rem" }}>{text.secureTrusted}</h4>
                    <p style={{ margin: "0 0 8px", color: COLORS.textSoft, fontSize: "0.95rem", lineHeight: 1.55 }}>{text.secureTrustedText}</p>
                    <a href="#home" style={{ color: COLORS.terracotta, textDecoration: "none", fontWeight: 800 }}>
                      Learn More →
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <section id="about" className="kc-glass" style={{ marginTop: 16, borderRadius: 24, padding: 22 }}>
            <h2 className="kc-heading" style={{ margin: 0, fontSize: "1.9rem" }}>{text.about}</h2>
            <p style={{ marginTop: 8, color: COLORS.textSoft, lineHeight: 1.7 }}>{text.aboutShort}</p>
            {showAboutMore && <p style={{ marginTop: 8, color: COLORS.textSoft, lineHeight: 1.7 }}>{text.aboutMore}</p>}
            <button type="button" className="kc-outline-btn" onClick={() => setShowAboutMore((current) => !current)} style={{ marginTop: 12 }}>
              {showAboutMore ? text.showLess : text.showMore}
            </button>
          </section>

          <section id="reference-tracker" className="kc-glass" style={{ marginTop: 16, borderRadius: 24, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
              <div>
                <h2 className="kc-heading" style={{ margin: 0, fontSize: "1.9rem" }}>{text.checkApplication}</h2>
                <p style={{ margin: "8px 0 0", color: COLORS.textSoft, lineHeight: 1.65 }}>{text.checkApplicationText}</p>
              </div>
              <div style={{ padding: "8px 12px", borderRadius: 999, background: "rgba(127,144,118,0.12)", color: COLORS.sageDark, fontWeight: 800, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>{text.fastLookup}</div>
            </div>

            <div className="kc-tracker-input-row" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }}>
              <input
                value={referenceLookup}
                onChange={(e) => setReferenceLookup(e.target.value)}
                placeholder={text.referencePlaceholder}
                aria-label="Reference code lookup"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 16,
                  border: `1px solid ${COLORS.line}`,
                  background: "rgba(255,255,255,0.72)",
                  color: COLORS.navy,
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button type="button" className="kc-primary-btn" onClick={() => lookupReferenceCode()} style={{ whiteSpace: "nowrap" }}>
                {text.checkStatus}
              </button>
            </div>

            <p style={{ margin: "10px 0 0", color: referenceResult ? COLORS.sageDark : COLORS.textSoft, fontSize: 13 }}>
              {referenceMessage}
            </p>
            <p style={{ margin: "6px 0 0", color: COLORS.textSoft, fontSize: 12 }}>{text.referenceHelp}</p>

            {referenceResult && (
              <div style={{ marginTop: 14, padding: 18, borderRadius: 18, background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(250,243,230,0.94))", border: `1px solid ${COLORS.line}`, boxShadow: "0 10px 24px rgba(44,57,35,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                  <div>
                    <p style={{ margin: 0, color: COLORS.sageDark, fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>Reference Code</p>
                    <h3 className="kc-heading" style={{ margin: "6px 0 0", fontSize: "1.7rem" }}>{formatReferenceCode(referenceResult.tracking_id)}</h3>
                  </div>
                  <div style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(213,138,88,0.12)", color: COLORS.terracottaDark, fontSize: 12, fontWeight: 800, height: "fit-content" }}>
                    {referenceResult.status.replace(/_/g, " ")}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }} className="kc-tracker-grid">
                  <div>
                    <p style={{ margin: "0 0 4px", color: COLORS.sageDark, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>Service</p>
                    <p style={{ margin: 0, color: COLORS.navy, fontWeight: 700 }}>{referenceResult.service_type}</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 4px", color: COLORS.sageDark, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>Submitted</p>
                    <p style={{ margin: 0, color: COLORS.navy, fontWeight: 700 }}>{new Date(referenceResult.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 4px", color: COLORS.sageDark, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>Contact</p>
                    <p style={{ margin: 0, color: COLORS.navy, fontWeight: 700 }}>{referenceResult.email}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                  <button
                    type="button"
                    className="kc-outline-btn"
                    onClick={() => {
                      const code = formatReferenceCode(referenceResult.tracking_id);
                      setReferenceLookup(code);
                      lookupReferenceCode(code);
                      scrollToReferenceLookup();
                    }}
                  >
                    Keep code visible
                  </button>
                </div>
              </div>
            )}
          </section>

          {showDetails && detailsGroup && (
            <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(17,24,39,0.45), rgba(17,24,39,0.55))" }} onClick={() => { setShowDetails(false); setShowForm(false); setSubmissionComplete(false); }} />
              <div className="kc-modal-shell" style={{ position: "relative", width: 980, maxWidth: "94%", borderRadius: 24, overflow: "hidden", background: "linear-gradient(180deg, rgba(255,251,245,0.98), rgba(250,243,230,0.98))", border: `1px solid ${COLORS.line}`, boxShadow: "0 28px 80px rgba(0,0,0,0.28)", zIndex: 1201 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr" }} className="kc-modal-grid">
                  <div style={{ padding: 24, background: "linear-gradient(135deg, rgba(34,53,74,0.96), rgba(127,144,118,0.92))", color: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div className="kc-icon-box" style={{ width: 54, height: 54, borderRadius: 18, background: "rgba(255,255,255,0.18)" }}>
                          <detailsGroup.icon size={24} />
                        </div>
                        <div>
                          <h3 className="kc-heading" style={{ margin: 0, fontSize: "2rem", color: "#fff" }}>{detailsGroup.title}</h3>
                          <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.78)" }}>{detailsGroup.description}</p>
                        </div>
                      </div>
                      <button onClick={() => { setShowDetails(false); setShowForm(false); setSubmissionComplete(false); }} style={{ border: 0, background: "rgba(255,255,255,0.14)", color: "#fff", width: 38, height: 38, borderRadius: 12, cursor: "pointer", fontSize: 18 }}>×</button>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                      <span style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,0.14)", fontSize: 12, fontWeight: 800 }}>{detailsGroup.duration}</span>
                      <span style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,0.14)", fontSize: 12, fontWeight: 800 }}>{detailsGroup.fee}</span>
                    </div>

                    <div style={{ display: "grid", gap: 14 }}>
                      <div style={{ padding: 16, borderRadius: 18, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
                        <p style={{ margin: 0, color: "rgba(255,255,255,0.78)", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>{text.whatYouGet}</p>
                        <ul style={{ margin: "10px 0 0", paddingLeft: 18, lineHeight: 1.7 }}>
                          {detailsGroup.highlights.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div style={{ padding: 16, borderRadius: 18, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
                        <p style={{ margin: 0, color: "rgba(255,255,255,0.78)", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>{text.typicalDocuments}</p>
                        <ul style={{ margin: "10px 0 0", paddingLeft: 18, lineHeight: 1.7 }}>
                          {detailsGroup.documents.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: 24, background: "rgba(255,255,255,0.8)" }}>
                    {!showForm && !submissionComplete ? (
                      <>
                        <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
                          <div style={{ padding: 16, borderRadius: 18, background: "rgba(255,251,245,0.9)", border: `1px solid ${COLORS.line}` }}>
                            <p style={{ margin: 0, color: COLORS.sageDark, fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>{text.details}</p>
                            <div style={{ marginTop: 10, display: "grid", gap: 8, color: COLORS.textSoft, lineHeight: 1.6 }}>
                              {detailsGroup.items.map((item) => (
                                <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                  <span style={{ color: COLORS.terracottaDark, fontWeight: 800 }}>•</span>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                            <div style={{ padding: 14, borderRadius: 16, background: "rgba(127,144,118,0.10)", border: `1px solid ${COLORS.line}` }}>
                              <p style={{ margin: 0, color: COLORS.sageDark, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>{text.processing}</p>
                              <p style={{ margin: "6px 0 0", color: COLORS.navy, fontWeight: 700 }}>{detailsGroup.duration}</p>
                            </div>
                            <div style={{ padding: 14, borderRadius: 16, background: "rgba(213,138,88,0.10)", border: `1px solid ${COLORS.line}` }}>
                              <p style={{ margin: 0, color: COLORS.terracottaDark, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>{text.fees}</p>
                              <p style={{ margin: "6px 0 0", color: COLORS.navy, fontWeight: 700 }}>{detailsGroup.fee}</p>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                          <button type="button" className="kc-primary-btn" onClick={openFormForSelected}>
                            {text.selectThisOne}
                          </button>
                          <button type="button" className="kc-outline-btn" onClick={() => { setShowDetails(false); setShowForm(false); setSubmissionComplete(false); }}>
                            {text.close}
                          </button>
                        </div>
                      </>
                    ) : submissionComplete ? (
                      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
                        <div style={{ padding: 18, borderRadius: 18, background: "linear-gradient(180deg, rgba(169,181,157,0.16), rgba(213,138,88,0.12))", border: `1px solid ${COLORS.line}` }}>
                          <p style={{ margin: 0, color: COLORS.sageDark, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>{text.submittedSuccessfully}</p>
                          <h4 className="kc-heading" style={{ margin: "8px 0 6px", fontSize: "1.9rem" }}>{submittedReferenceCode}</h4>
                          <p style={{ margin: 0, color: COLORS.textSoft, lineHeight: 1.65 }}>
                            Keep this reference code safe. You can use it to check your application status in the tracker below or with the staff memo dashboard.
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                          <button type="button" className="kc-primary-btn" onClick={() => {
                            setReferenceLookup(submittedReferenceCode);
                            lookupReferenceCode();
                            scrollToReferenceLookup();
                          }}>
                            {text.checkApplicationBtn}
                          </button>
                          <button type="button" className="kc-outline-btn" onClick={() => { setShowDetails(false); setShowForm(false); setSubmissionComplete(false); }}>
                            {text.done}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!detailsGroup) return;
                          const payload = {
                            service_area: "ealbana",
                            service_type: detailsGroup.title,
                            full_name: formValues.full_name,
                            email: formValues.email,
                            phone: formValues.phone,
                            data: {
                              city: formValues.city,
                              notes: formValues.notes,
                              preferred_contact: formValues.preferred_contact,
                            },
                          };
                          try {
                            const created = addLocalRequest(payload as any);
                            setSubmittedReferenceCode(formatReferenceCode(created.tracking_id));
                            setSubmissionComplete(true);
                            setShowForm(false);
                            const code = formatReferenceCode(created.tracking_id);
                            setReferenceLookup(code);
                            lookupReferenceCode(code);
                            setFormValues({ full_name: "", email: "", phone: "", city: "", notes: "", preferred_contact: "email" });
                          } catch (err) {
                            console.error(err);
                            alert("Failed to submit request. Please try again.");
                          }
                        }}
                        style={{ display: "grid", gap: 12 }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="kc-form-grid">
                          <label className="kc-field-group">
                            <span className="kc-field-label">Full name</span>
                            <input required placeholder="Enter your full name" value={formValues.full_name} onChange={(e) => setFormValues((v) => ({ ...v, full_name: e.target.value }))} className="kc-form-control" />
                          </label>
                          <label className="kc-field-group">
                            <span className="kc-field-label">Email</span>
                            <input required type="email" placeholder="name@example.com" value={formValues.email} onChange={(e) => setFormValues((v) => ({ ...v, email: e.target.value }))} className="kc-form-control" />
                          </label>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="kc-form-grid">
                          <label className="kc-field-group">
                            <span className="kc-field-label">Phone</span>
                            <input required placeholder="Phone number" value={formValues.phone} onChange={(e) => setFormValues((v) => ({ ...v, phone: e.target.value }))} className="kc-form-control" />
                          </label>
                          <label className="kc-field-group">
                            <span className="kc-field-label">City</span>
                            <input placeholder="Optional city" value={formValues.city} onChange={(e) => setFormValues((v) => ({ ...v, city: e.target.value }))} className="kc-form-control" />
                          </label>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="kc-form-grid">
                          <label className="kc-field-group">
                            <span className="kc-field-label">Preferred contact</span>
                            <select value={formValues.preferred_contact} onChange={(e) => setFormValues((v) => ({ ...v, preferred_contact: e.target.value }))} className="kc-form-control">
                              <option value="email">Email</option>
                              <option value="phone">Phone</option>
                              <option value="whatsapp">WhatsApp</option>
                            </select>
                          </label>
                          <div style={{ display: "flex", alignItems: "center", padding: 12, borderRadius: 12, border: `1px solid ${COLORS.line}`, background: "rgba(127,144,118,0.08)", color: COLORS.sageDark, fontSize: 13, fontWeight: 700 }}>
                            Reference code will be generated after submission
                          </div>
                        </div>
                        <label className="kc-field-group">
                          <span className="kc-field-label">Extra details</span>
                          <textarea
                            placeholder="Tell us any extra details about your request"
                            value={formValues.notes}
                            onChange={(e) => setFormValues((v) => ({ ...v, notes: e.target.value }))}
                            className="kc-form-control"
                            style={{ minHeight: 120, resize: "vertical" }}
                          />
                        </label>

                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
                          <button type="submit" className="kc-primary-btn">Send Request</button>
                          <button type="button" className="kc-outline-btn" onClick={() => setShowForm(false)}>Back</button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="kc-bottom-nav" aria-label="Consulting mobile navigation">
        {mobileNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive = mobileNavTarget === link.href;

          return (
            <button
              key={link.label}
              type="button"
              onClick={() => scrollToSection(link.href)}
              className="kc-bottom-nav-btn"
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={2.2} />
              <span>{link.label}</span>
            </button>
          );
        })}
      </nav>

      <style>{`
        .kc-bottom-nav {
          display: none;
        }

        .kc-modal-grid,
        .kc-form-grid,
        .kc-tracker-grid {
          width: 100%;
        }

        @media (max-width: 1100px) {
          .kc-main-grid {
            grid-template-columns: 1fr !important;
          }

          .kc-catalog-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 920px) {
          .kc-bottom-nav {
            position: fixed;
            left: 12px;
            right: 12px;
            bottom: 12px;
            z-index: 90;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 8px;
            padding: 10px;
            border-radius: 22px;
            background: rgba(255, 251, 245, 0.94);
            border: 1px solid rgba(255,255,255,0.72);
            box-shadow:
              0 16px 36px rgba(34, 53, 74, 0.16),
              inset 0 1px 0 rgba(255,255,255,0.8);
            backdrop-filter: blur(18px);
          }

          .kc-bottom-nav-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
            min-height: 58px;
            padding: 8px 4px;
            border: 0;
            border-radius: 16px;
            background: transparent;
            color: ${COLORS.sageDark};
            font-size: 0.68rem;
            font-weight: 800;
            cursor: pointer;
            transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
          }

          .kc-bottom-nav-btn[aria-current="page"] {
            background: linear-gradient(180deg, rgba(213,138,88,0.18), rgba(213,138,88,0.08));
            color: ${COLORS.terracottaDark};
          }

          .kc-bottom-nav-btn:active {
            transform: translateY(1px);
          }

          .kc-logo-title {
            font-size: 1.75rem !important;
          }

          .kc-logo-sub {
            font-size: 0.68rem !important;
            letter-spacing: 0.32em !important;
          }

          .kc-hero-header {
            flex-wrap: wrap;
            align-items: flex-start !important;
            padding: 4px 2px 8px !important;
            margin-top: 0 !important;
          }

          .kc-hero-grid {
            grid-template-columns: 1fr !important;
          }

          .kc-hero-copy {
            padding: 24px 6px 10px !important;
          }

          .kc-hero-visual {
            min-height: 280px !important;
            border-radius: 22px !important;
          }

          .kc-search-shell,
          .kc-tracker-input-row {
            width: 100% !important;
            grid-template-columns: 1fr !important;
          }

          .kc-search-shell {
            padding: 12px !important;
            flex-wrap: wrap;
          }

          .kc-search-clear {
            width: 100%;
          }

          .kc-portal-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .kc-catalog-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .kc-support-grid {
            grid-template-columns: 1fr !important;
          }

          .kc-modal-grid,
          .kc-form-grid,
          .kc-tracker-grid {
            grid-template-columns: 1fr !important;
          }

          .kc-modal-shell {
            width: calc(100% - 20px) !important;
            max-width: none !important;
            max-height: calc(100vh - 24px) !important;
            overflow: auto !important;
          }
        }

        @media (max-width: 640px) {
          .kc-shell {
            padding: 14px 12px 110px !important;
          }

          .kc-page section.kc-glass {
            border-radius: 20px !important;
          }

          .kc-portal-grid,
          .kc-catalog-grid {
            grid-template-columns: 1fr !important;
          }

          .kc-catalog-action {
            width: 100%;
            min-width: 0;
          }

          .kc-catalog-actions {
            grid-template-columns: 1fr;
          }

          .kc-catalog-actions .kc-catalog-action:last-child {
            grid-column: auto;
          }
        }
      `}</style>
    </>
  );
}
