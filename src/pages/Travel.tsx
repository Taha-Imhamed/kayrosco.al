import React, { useState, useEffect } from 'react';
import SeoHead from "@/components/SeoHead";
import {
  Plane, Car, Hotel, FileText, Globe, Home, Search, Loader,
  AlertTriangle, Phone, Users, MapPin, ShieldCheck, CheckCircle,
  ChevronRight, ChevronLeft, Building2, Compass, Shield, Check,
  Navigation, Star, Coffee, Camera, Umbrella, Heart, ArrowRight,
  Save, CreditCard, Sun, Snowflake, Cloud, Plus, Minus, Pencil,
  Route, UserCheck,
} from 'lucide-react';
import {
  createServiceRequest, getRequestByTrackingId,
  getSettingsByArea, uploadRequestFile,
} from "@/lib/supabaseApi";

// ─── API helpers ───────────────────────────────────────────────────────────────
const createTravelRequest = async (payload: Record<string, unknown>, file: File | null) => {
  const req = await createServiceRequest({
    service_area: "travel",
    service_type: "Travel Application",
    full_name: String(payload.fullName ?? ""),
    email:     String(payload.email ?? ""),
    phone:     String(payload.phone ?? ""),
    data:      payload,
  });
  if (file) await uploadRequestFile(req.id, file);
  return { id: req.id, trackingId: req.tracking_id };
};
const fetchByTrackingId = async (tid: string) => {
  const d = await getRequestByTrackingId(tid, "travel");
  if (!d) throw new Error("Not found");
  return d;
};

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#F0FDFA", white: "#FFFFFF", section: "#F8FFFE",
  ink: "#0F172A", ink2: "#1E293B", muted: "#64748B", mutedLight: "#94A3B8",
  accent: "#0D9488", accentHov: "#0F766E", accentTint: "#F0FDFA", accentMid: "#CCFBF1",
  gold: "#D97706", goldTint: "#FFFBEB", goldMid: "#FDE68A",
  positive: "#10B981", posTint: "#ECFDF5",
  danger: "#EF4444", danTint: "#FEF2F2",
  border: "#E2E8F0", borderMed: "#CBD5E1",
};
const SANS = "'Sora', 'Space Grotesk', ui-sans-serif, sans-serif";
const MONO = "ui-monospace, 'JetBrains Mono', monospace";
const sh   = "0 1px 3px rgba(15,23,42,0.08), 0 4px 12px rgba(15,23,42,0.05)";
const shMd = "0 4px 24px rgba(15,23,42,0.10), 0 1px 4px rgba(15,23,42,0.06)";
const shLg = "0 12px 48px rgba(15,23,42,0.14), 0 2px 8px rgba(15,23,42,0.06)";

// ─── Responsive hook ──────────────────────────────────────────────────────────
function useMobile() {
  const [mob, setMob] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", h, { passive: true });
    return () => window.removeEventListener("resize", h);
  }, []);
  return mob;
}

// ─── Translations ──────────────────────────────────────────────────────────────
type Lang = "en" | "tr" | "ar";
const T = {
  en: {
    dir: "ltr" as const, flag: "EN",
    navTrack: "Track Application", navStart: "Start Planning",
    heroBadge: "Certified Travel & Residency Advisors",
    heroTitle: "Your Albanian journey, perfectly planned.",
    heroSub: "Visa support, accommodation, transport, tours — we handle everything so you enjoy every moment.",
    heroCta: "Plan My Trip", payBanner: "All services priced in Albanian Lek (ALL) · Transparent · No hidden fees",
    safePay: "Pay safely in Albanian Lek",
    whatTitle: "What are you looking for?", whatSub: "Pick everything that interests you.",
    routeTitle: "Plan your route", routeSub: "Tell us where you're coming from and where you'd like to go in Albania.",
    fromLabel: "Where are you coming from?", entryLabel: "Entry into Albania",
    planMode: "How would you like to plan your trip?",
    modeAuto: "Plan it for me", modeManual: "I have destinations in mind",
    modeAutoSub: "We'll suggest the best itinerary based on your interests and trip length.",
    modeManualSub: "Browse Albanian cities and build your own route.",
    totalDays: "How many days total?", daysUnit: "days",
    suggestedItin: "Suggested itinerary", useThis: "Use this plan",
    customise: "Customise it", orBrowse: "Or explore cities yourself",
    selectCity: "Add to trip", daysHere: "Days here",
    yourRoute: "Your route so far",
    budgetTitle: "What's your budget?", budgetSub: "Per person · includes accommodation",
    citiesTitle: "Popular Albanian destinations", citiesSub: "Click to add a city · select days after",
    formTitle: "Complete your application", formSub: "We'll get back to you within 24 hours.",
    steps: ["Your Details", "Travel Dates", "Review & Submit"],
    next: "Continue", back: "Back", submit: "Submit Application", submitting: "Submitting…",
    trackTitle: "Track your application", trackSub: "Enter the reference code you received.",
    trackBtn: "Track Now",
    successTitle: "Application Submitted!", successSub: "Our team will contact you within 24 hours. Save your reference code.",
    refCode: "Your Reference Code", copyCode: "Copy Code", copied: "Copied!", newApp: "Submit Another Application",
    reviewRoute: "Your Route", reviewServices: "Services", reviewBudget: "Budget",
    reviewDetails: "Your Details", reviewDates: "Travel Dates", editSection: "Edit",
    summerBest: "Best in Summer", winterBest: "Best in Winter", yearRound: "Year-round",
    autoDetected: "Auto-detected entry point",
  },
  tr: {
    dir: "ltr" as const, flag: "TR",
    navTrack: "Başvuruyu Takip Et", navStart: "Planlamayı Başlat",
    heroBadge: "Sertifikalı Seyahat ve İkametgah Danışmanları",
    heroTitle: "Arnavutluk yolculuğunuz, mükemmel şekilde planlandı.",
    heroSub: "Vize, konaklama, ulaşım, turlar — her şeyi biz hallederiz.",
    heroCta: "Gezimi Planla", payBanner: "Tüm hizmetler Arnavut Lekü (ALL) ile · Şeffaf · Gizli ücret yok",
    safePay: "Arnavut Lekü ile güvenle ödeyin",
    whatTitle: "Ne arıyorsunuz?", whatSub: "İlginizi çekenleri seçin.",
    routeTitle: "Güzergahınızı planlayın", routeSub: "Nereden geldiğinizi ve Arnavutluk'ta nereye gitmek istediğinizi söyleyin.",
    fromLabel: "Nereden geliyorsunuz?", entryLabel: "Arnavutluk'a Giriş",
    planMode: "Gezi planlamanızı nasıl yapmak istersiniz?",
    modeAuto: "Sizin için planlayın", modeManual: "Destinasyonlarım var",
    modeAutoSub: "İlgi alanlarınıza ve süreye göre en iyi güzergahı önereceğiz.",
    modeManualSub: "Arnavut şehirlerine göz atın ve kendi güzergahınızı oluşturun.",
    totalDays: "Toplam kaç gün?", daysUnit: "gün",
    suggestedItin: "Önerilen güzergah", useThis: "Bu planı kullan",
    customise: "Özelleştir", orBrowse: "Ya da kendiniz keşfedin",
    selectCity: "Geziye ekle", daysHere: "Burada gün",
    yourRoute: "Şu anki güzergahınız",
    budgetTitle: "Bütçeniz nedir?", budgetSub: "Kişi başı · konaklama dahil",
    citiesTitle: "Popüler Arnavutluk destinasyonları", citiesSub: "Tıklayın · gün seçin",
    formTitle: "Başvurunuzu tamamlayın", formSub: "24 saat içinde size döneceğiz.",
    steps: ["Bilgileriniz", "Seyahat Tarihleri", "İnceleme ve Gönderim"],
    next: "Devam Et", back: "Geri", submit: "Başvuruyu Gönder", submitting: "Gönderiliyor…",
    trackTitle: "Başvurunuzu takip edin", trackSub: "Referans kodunuzu girin.",
    trackBtn: "Şimdi Takip Et",
    successTitle: "Başvuru Gönderildi!", successSub: "Ekibimiz 24 saat içinde sizinle iletişime geçecek.",
    refCode: "Referans Kodunuz", copyCode: "Kodu Kopyala", copied: "Kopyalandı!", newApp: "Yeni Başvuru",
    reviewRoute: "Güzergahınız", reviewServices: "Hizmetler", reviewBudget: "Bütçe",
    reviewDetails: "Bilgileriniz", reviewDates: "Seyahat Tarihleri", editSection: "Düzenle",
    summerBest: "Yaz İçin İdeal", winterBest: "Kış İçin İdeal", yearRound: "Tüm yıl",
    autoDetected: "Otomatik tespit edilen giriş noktası",
  },
  ar: {
    dir: "rtl" as const, flag: "AR",
    navTrack: "تتبع الطلب", navStart: "ابدأ التخطيط",
    heroBadge: "مستشارو سفر وإقامة معتمدون",
    heroTitle: "رحلتك الألبانية، مُخططة بشكل مثالي.",
    heroSub: "تأشيرة، إقامة، نقل، جولات — نتولى كل شيء.",
    heroCta: "خطط لرحلتي", payBanner: "الخدمات بالليك الألباني (ALL) · شفافية · لا رسوم خفية",
    safePay: "ادفع بأمان بالليك الألباني",
    whatTitle: "ماذا تبحث عن؟", whatSub: "اختر كل ما يهمك.",
    routeTitle: "خطط لمسارك", routeSub: "أخبرنا من أين أنت وأين تريد الذهاب في ألبانيا.",
    fromLabel: "من أين أنت قادم؟", entryLabel: "نقطة الدخول إلى ألبانيا",
    planMode: "كيف تريد تخطيط رحلتك؟",
    modeAuto: "خططوا لي", modeManual: "لديّ وجهات محددة",
    modeAutoSub: "سنقترح أفضل مسار بناءً على اهتماماتك ومدة الرحلة.",
    modeManualSub: "تصفح مدن ألبانيا وابنِ مسارك الخاص.",
    totalDays: "كم يوماً في المجموع؟", daysUnit: "يوم",
    suggestedItin: "الجدول المقترح", useThis: "استخدم هذا الجدول",
    customise: "تخصيص", orBrowse: "أو استكشف بنفسك",
    selectCity: "أضف للرحلة", daysHere: "أيام هنا",
    yourRoute: "مسارك حتى الآن",
    budgetTitle: "ما هي ميزانيتك؟", budgetSub: "للشخص · شاملاً الإقامة",
    citiesTitle: "أبرز وجهات ألبانيا", citiesSub: "انقر لإضافة مدينة · اختر عدد الأيام",
    formTitle: "أكمل طلبك", formSub: "سنتواصل معك خلال 24 ساعة.",
    steps: ["بياناتك", "تواريخ السفر", "المراجعة والإرسال"],
    next: "متابعة", back: "رجوع", submit: "تقديم الطلب", submitting: "جارٍ الإرسال…",
    trackTitle: "تتبع طلبك", trackSub: "أدخل رمز المرجع.",
    trackBtn: "تتبع الآن",
    successTitle: "تم تقديم الطلب!", successSub: "سيتواصل فريقنا معك خلال 24 ساعة.",
    refCode: "رمز المرجع", copyCode: "نسخ الرمز", copied: "تم النسخ!", newApp: "طلب جديد",
    reviewRoute: "مسارك", reviewServices: "الخدمات", reviewBudget: "الميزانية",
    reviewDetails: "بياناتك", reviewDates: "تواريخ السفر", editSection: "تعديل",
    summerBest: "مثالي للصيف", winterBest: "مثالي للشتاء", yearRound: "طوال العام",
    autoDetected: "نقطة الدخول المكتشفة تلقائياً",
  },
};

// ─── Content data ──────────────────────────────────────────────────────────────
type Season = "summer" | "winter" | "year";
interface AlbanianCity {
  id: string; icon: React.ElementType; badge: string; badgeColor: string;
  en: string; tr: string; ar: string;
  sub: string; season: Season;
  photo: string;
  highlight: string;
}

const CITIES: AlbanianCity[] = [
  {
    id: "tirana", icon: Building2, badge: "Capital", badgeColor: "#0D9488",
    en: "Tirana", tr: "Tirana", ar: "تيرانا",
    sub: "Colourful capital with museums, Blloku nightlife, Skanderbeg Square and some of the best food in the Balkans.",
    season: "year", photo: "https://wia.al/wp-content/uploads/2024/09/Tirana-Night-1024x682-1.jpeg",
    highlight: "City · Culture · Food",
  },
  {
    id: "durres", icon: Umbrella, badge: "Beach", badgeColor: "#0EA5E9",
    en: "Durrës", tr: "Durrës", ar: "دوريس",
    sub: "Albania's main port with a long sandy beach, a Roman amphitheatre, and a lively summer promenade.",
    season: "summer", photo: "https://www.greencoast-albania.com/wp-content/uploads/sites/10/2024/11/durres-albania-port-resized-e1732181669920.jpg",
    highlight: "Beach · History · Port",
  },
  {
    id: "vlore", icon: Star, badge: "Riviera", badgeColor: "#06B6D4",
    en: "Vlorë", tr: "Vlorë", ar: "فلوره",
    sub: "Gateway to the Albanian Riviera — turquoise bays, fresh seafood, and stunning cliffside views.",
    season: "summer", photo: "https://visitalbania.com.al/wp-content/uploads/slider/cache/4f42612c72a64a0d325f319e0a7326c6/vlore3.jpg",
    highlight: "Riviera · Coast · Seafood",
  },
  {
    id: "sarande", icon: Compass, badge: "Riviera", badgeColor: "#06B6D4",
    en: "Sarandë", tr: "Sarandë", ar: "سارانده",
    sub: "Crystal-clear Ionian waters, Ksamil's white-sand islands, Butrint UNESCO site, and a vibrant seafront.",
    season: "summer", photo: "https://api.tripance.com/uploads/covers/57f58498-3fe2-428c-9882-9b3f885b3f85_cover.jpg",
    highlight: "UNESCO · Beach · Islands",
  },
  {
    id: "berat", icon: Camera, badge: "UNESCO", badgeColor: "#D97706",
    en: "Berat", tr: "Berat", ar: "بيرات",
    sub: "The 'City of a Thousand Windows' — Ottoman architecture cascading down a hillside beneath a medieval castle.",
    season: "year", photo: "https://www.albania-spirit.com/images/destinations/berat/hero.jpg",
    highlight: "UNESCO · History · Castle",
  },
  {
    id: "gjirokaster", icon: Camera, badge: "UNESCO", badgeColor: "#D97706",
    en: "Gjirokastër", tr: "Gjirokastër", ar: "جيروكاستره",
    sub: "A stone-built UNESCO city perched on a mountain — cobblestone alleys, an imposing Ottoman castle, and a bazaar.",
    season: "year", photo: "https://feel-albania.com/wp-content/uploads/2019/10/Gjirokaster-City-in-UNESCO.jpg",
    highlight: "UNESCO · Medieval · Bazaar",
  },
  {
    id: "shkoder", icon: Heart, badge: "North", badgeColor: "#8B5CF6",
    en: "Shkodër", tr: "Shkodër", ar: "شكودره",
    sub: "Northern gateway with Rozafa Castle, peaceful Lake Shkodër, a great cycling culture, and access to the Alps.",
    season: "year", photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKzbPRgm0vCq_DSDmBooBKjZOjJGv7fzpBmg&s",
    highlight: "Castle · Lake · Alps",
  },
  {
    id: "korca", icon: Coffee, badge: "Culture", badgeColor: "#EC4899",
    en: "Korçë", tr: "Korçë", ar: "كورتشه",
    sub: "Albania's cultural and intellectual capital — French-era architecture, excellent beer, and a vibrant arts scene.",
    season: "year", photo: "https://greecerally.gr/wp-content/uploads/2023/05/Korce-Coriza-Albania.jpg",
    highlight: "Culture · Beer · Arts",
  },
  {
    id: "permet", icon: Compass, badge: "Nature", badgeColor: "#10B981",
    en: "Përmet", tr: "Përmet", ar: "بيرميت",
    sub: "Thermal springs, mountain rivers, wild roses in bloom, and the gateway to Albania's most pristine national parks.",
    season: "summer", photo: "https://cdn.getyourguide.com/img/tour/1fb5a866e4253b6a.jpeg/68.jpg",
    highlight: "Nature · Thermal · Hiking",
  },
  {
    id: "pogradec", icon: Navigation, badge: "Lake", badgeColor: "#3B82F6",
    en: "Pogradec", tr: "Pogradec", ar: "بوغراديتش",
    sub: "On the shores of stunning Lake Ohrid — fresh carp dishes, sunsets over the water, and a peaceful lakeside atmosphere.",
    season: "summer", photo: "https://eia476h758b.exactdn.com/wp-content/uploads/2023/04/Pogradec-scaled.jpeg?strip=all",
    highlight: "Lake Ohrid · Fish · Peace",
  },
];

interface DepartureCountry {
  code: string; en: string; tr: string; ar: string;
  transport: "plane" | "land" | "sea"; entryId: string;
  icon: React.ElementType;
}

const DEPARTURE_COUNTRIES: DepartureCountry[] = [
  { code: "TR", en: "Turkey",         tr: "Türkiye",       ar: "تركيا",         transport: "plane", entryId: "tia",      icon: Plane },
  { code: "SA", en: "Saudi Arabia",   tr: "Suudi Arabistan",ar: "السعودية",      transport: "plane", entryId: "tia",      icon: Plane },
  { code: "AE", en: "UAE",            tr: "BAE",           ar: "الإمارات",       transport: "plane", entryId: "tia",      icon: Plane },
  { code: "DE", en: "Germany",        tr: "Almanya",       ar: "ألمانيا",        transport: "plane", entryId: "tia",      icon: Plane },
  { code: "IT", en: "Italy",          tr: "İtalya",        ar: "إيطاليا",        transport: "sea",   entryId: "durres",   icon: Navigation },
  { code: "GR", en: "Greece",         tr: "Yunanistan",    ar: "اليونان",        transport: "land",  entryId: "kakavija", icon: Car },
  { code: "GB", en: "United Kingdom", tr: "Birleşik Krallık",ar: "المملكة المتحدة",transport: "plane", entryId: "tia",     icon: Plane },
  { code: "US", en: "United States",  tr: "ABD",           ar: "الولايات المتحدة",transport: "plane", entryId: "tia",     icon: Plane },
  { code: "FR", en: "France",         tr: "Fransa",        ar: "فرنسا",          transport: "plane", entryId: "tia",      icon: Plane },
  { code: "CH", en: "Switzerland",    tr: "İsviçre",       ar: "سويسرا",         transport: "plane", entryId: "tia",      icon: Plane },
  { code: "KS", en: "Kosovo",         tr: "Kosova",        ar: "كوسوفو",         transport: "land",  entryId: "morine",   icon: Car },
  { code: "MK", en: "N. Macedonia",   tr: "K. Makedonya",  ar: "مقدونيا الشمالية",transport: "land",  entryId: "qafe",     icon: Car },
  { code: "ME", en: "Montenegro",     tr: "Karadağ",       ar: "الجبل الأسود",   transport: "land",  entryId: "muriqan",  icon: Car },
  { code: "AT", en: "Austria",        tr: "Avusturya",     ar: "النمسا",         transport: "plane", entryId: "tia",      icon: Plane },
  { code: "NL", en: "Netherlands",    tr: "Hollanda",      ar: "هولندا",         transport: "plane", entryId: "tia",      icon: Plane },
  { code: "OTHER", en: "Other",       tr: "Diğer",         ar: "أخرى",           transport: "plane", entryId: "tia",      icon: Plane },
];

const ENTRY_LABELS: Record<string, Record<Lang, string>> = {
  tia:      { en: "Tirana Airport (TIA)",         tr: "Tirana Havalimanı",        ar: "مطار تيرانا (TIA)"           },
  durres:   { en: "Port of Durrës (Ferry)",        tr: "Durrës Limanı (Feribot)",  ar: "ميناء دوريس (فيري)"          },
  kakavija: { en: "Kakavija Border (Greece)",      tr: "Kakavija Sınırı",          ar: "معبر كاكافيا (اليونان)"       },
  morine:   { en: "Morinë Border (Kosovo)",        tr: "Morinë Sınırı",            ar: "معبر مورينه (كوسوفو)"         },
  muriqan:  { en: "Muriqan Border (Montenegro)",  tr: "Muriqan Sınırı",           ar: "معبر موريكان"                 },
  qafe:     { en: "Qafë Thanë Border (Macedonia)",tr: "Qafë Thanë Sınırı",        ar: "معبر قافا ثانه (مقدونيا)"     },
};

const TRANSPORT_LABELS: Record<string, Record<Lang, string>> = {
  plane: { en: "By Plane", tr: "Uçakla", ar: "بالطائرة" },
  land:  { en: "By Land",  tr: "Karayoluyla", ar: "برًا" },
  sea:   { en: "By Ferry", tr: "Feribotle", ar: "بالعبارة" },
};

// Suggested itineraries by total days
const SUGGESTED: Record<string, { cityId: string; days: number }[]> = {
  "3":  [{ cityId: "tirana", days: 2 }, { cityId: "berat", days: 1 }],
  "4":  [{ cityId: "tirana", days: 2 }, { cityId: "berat", days: 1 }, { cityId: "durres", days: 1 }],
  "5":  [{ cityId: "tirana", days: 2 }, { cityId: "berat", days: 1 }, { cityId: "vlore", days: 1 }, { cityId: "sarande", days: 1 }],
  "7":  [{ cityId: "tirana", days: 2 }, { cityId: "berat", days: 1 }, { cityId: "gjirokaster", days: 1 }, { cityId: "sarande", days: 2 }, { cityId: "vlore", days: 1 }],
  "10": [{ cityId: "tirana", days: 2 }, { cityId: "shkoder", days: 1 }, { cityId: "berat", days: 1 }, { cityId: "gjirokaster", days: 1 }, { cityId: "sarande", days: 2 }, { cityId: "vlore", days: 1 }, { cityId: "korca", days: 1 }, { cityId: "permet", days: 1 }],
  "14": [{ cityId: "tirana", days: 2 }, { cityId: "shkoder", days: 2 }, { cityId: "berat", days: 1 }, { cityId: "gjirokaster", days: 2 }, { cityId: "sarande", days: 3 }, { cityId: "vlore", days: 2 }, { cityId: "korca", days: 1 }, { cityId: "permet", days: 1 }],
};

const getSuggestedForDays = (days: number) => {
  if (days <= 3)  return SUGGESTED["3"];
  if (days <= 4)  return SUGGESTED["4"];
  if (days <= 5)  return SUGGESTED["5"];
  if (days <= 8)  return SUGGESTED["7"];
  if (days <= 11) return SUGGESTED["10"];
  return SUGGESTED["14"];
};

const FULL_TRIP_INTEREST_ID = "serviceFullTrip";
const FULL_TRIP_BUNDLE = [
  FULL_TRIP_INTEREST_ID,
  "serviceHotel",
  "serviceAirportPickup",
  "serviceItinerary",
  "serviceCar",
] as const;

const INTERESTS = [
  { id: FULL_TRIP_INTEREST_ID, icon: Route,      en: "Full Trip",        tr: "Tam Gezi",          ar: "رحلة كاملة"      },
  { id: "serviceHotel",        icon: Hotel,      en: "Hotel Stay",       tr: "Otel",              ar: "فندق"           },
  { id: "serviceAirBnB",       icon: Home,       en: "Apartment / Villa",tr: "Daire / Villa",     ar: "شقة / فيلا"     },
  { id: "serviceCar",          icon: Car,        en: "Private Driver",   tr: "Özel Şoför",        ar: "سائق خاص"       },
  { id: "serviceAirportPickup",icon: Plane,      en: "Airport Transfer", tr: "Havalimanı Transfer",ar: "نقل مطار"       },
  { id: "serviceItinerary",    icon: Compass,    en: "Custom Itinerary", tr: "Özel Güzergah",     ar: "جدول مخصص"      },
  { id: "serviceVisaSupport",  icon: FileText,   en: "Visa / Permit",    tr: "Vize / İzin",       ar: "تأشيرة"         },
  { id: "serviceTranslation",  icon: Globe,      en: "Translation",      tr: "Tercüme",           ar: "ترجمة"          },
  { id: "serviceInsurance",    icon: Shield,     en: "Travel Insurance", tr: "Seyahat Sigortası", ar: "تأمين سفر"      },
];

const BUDGETS = [
  { key: "Budget",   en: "Budget-friendly", tr: "Ekonomik", ar: "اقتصادي", sub: "Under $800 · ~$40 hotel + $40 food/day", color: "#10B981" },
  { key: "Standard", en: "Standard",        tr: "Standart", ar: "عادي",    sub: "$1,000 – $2,000",                        color: "#3B82F6" },
  { key: "Comfort",  en: "Comfort",         tr: "Konfor",   ar: "مريح",    sub: "$3,000 – $4,000",                        color: "#8B5CF6" },
  { key: "Luxury",   en: "Luxury",          tr: "Lüks",     ar: "فاخر",    sub: "Open budget",                            color: "#F59E0B" },
];

// ─── Shared UI helpers ─────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 10,
  border: `1.5px solid ${C.border}`, background: C.white,
  fontSize: 14, fontFamily: SANS, color: C.ink, outline: "none", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700, color: C.ink2,
  marginBottom: 6, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.07em",
};

function STag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 100, background: C.accentMid, color: C.accent, fontSize: 12, fontWeight: 700, fontFamily: SANS }}>
      {children}
    </span>
  );
}

function SeasonBadge({ season, lang }: { season: Season; lang: Lang }) {
  const t = T[lang];
  const cfg = season === "summer"
    ? { icon: Sun,       label: t.summerBest, color: "#F59E0B", bg: "#FFFBEB" }
    : season === "winter"
    ? { icon: Snowflake, label: t.winterBest, color: "#3B82F6", bg: "#EFF6FF" }
    : { icon: Cloud,     label: t.yearRound,  color: "#10B981", bg: "#ECFDF5" };
  const Icon = cfg.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 100, background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, fontFamily: SANS }}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

// ─── Language switcher ─────────────────────────────────────────────────────────
function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Globe size={14} color={C.muted} />
      </div>
      <div style={{ display: "flex", gap: 4 }}>
      {(["en", "tr", "ar"] as Lang[]).map(l => (
        <button key={l} onClick={() => setLang(l)}
          style={{ padding: "5px 11px", borderRadius: 7, border: `1.5px solid ${lang === l ? C.accent : C.border}`, background: lang === l ? C.accent : "none", color: lang === l ? "#fff" : C.muted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
          {T[l].flag}
        </button>
      ))}
      </div>
    </div>
  );
}

function LekBanner({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
      <CreditCard size={15} color={C.mutedLight} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: 13, color: C.muted, margin: "0 0 1px" }}>{t.safePay}</p>
        <p style={{ fontFamily: SANS, fontSize: 11, color: C.mutedLight, margin: 0 }}>{t.payBanner}</p>
      </div>
    </div>
  );
}

// ─── Interest card ─────────────────────────────────────────────────────────────
function InterestCard({ item, selected, onToggle, lang }: {
  item: typeof INTERESTS[0]; selected: boolean; onToggle: () => void; lang: Lang;
}) {
  const Icon = item.icon;
  const label = item[lang as "en" | "tr" | "ar"] as string;
  return (
    <button onClick={onToggle}
      style={{ width: "100%", padding: "18px 12px", borderRadius: 14, border: `2px solid ${selected ? C.accent : C.border}`, background: selected ? C.accentTint : C.white, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 9, transition: "all 0.15s", position: "relative", boxShadow: selected ? shMd : sh }}>
      <div style={{ width: 44, height: 44, borderRadius: 11, background: selected ? C.accent : C.section, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={20} color={selected ? "#fff" : C.accent} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: selected ? C.accent : C.ink2, fontFamily: SANS, textAlign: "center", lineHeight: 1.3 }}>{label}</span>
      {selected && <div style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: "50%", background: C.positive, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={11} color="#fff" /></div>}
    </button>
  );
}

// ─── City photo card with days picker ─────────────────────────────────────────
interface CityStay { cityId: string; days: number; }

function CityPhotoCard({ city, stay, onToggle, onDaysChange, lang }: {
  city: AlbanianCity; stay: CityStay | null; onToggle: () => void;
  onDaysChange: (days: number) => void; lang: Lang;
}) {
  const name = city[lang as "en" | "tr" | "ar"] as string;
  const selected = !!stay;
  const t = T[lang];

  return (
    <div style={{ borderRadius: 16, border: `2px solid ${selected ? C.accent : C.border}`, background: C.white, overflow: "hidden", boxShadow: selected ? shMd : sh, transition: "all 0.18s" }}>
      {/* Photo */}
      <div style={{ position: "relative", height: 170, overflow: "hidden" }}>
        <img src={city.photo} alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { (e.target as HTMLImageElement).style.background = `linear-gradient(135deg, ${C.accentMid}, ${C.accentTint})`; }} />
        {/* Gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.72) 0%, rgba(15,23,42,0.1) 60%)" }} />
        {/* City name on photo */}
        <div style={{ position: "absolute", bottom: 10, left: 12, right: 12 }}>
          <p style={{ fontFamily: SANS, fontWeight: 800, fontSize: 17, color: "#fff", margin: 0, lineHeight: 1.2 }}>{name}</p>
        </div>
        {/* Badge + season top */}
        <div style={{ position: "absolute", top: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 100, background: "rgba(15,23,42,0.52)", color: "#fff", fontFamily: SANS, backdropFilter: "blur(4px)" }}>{city.badge}</span>
          <SeasonBadge season={city.season} lang={lang} />
        </div>
        {/* Selected checkmark */}
        {selected && (
          <div style={{ position: "absolute", top: 10, right: 10, width: 28, height: 28, borderRadius: "50%", background: C.positive, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Check size={15} color="#fff" />
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "12px 14px 14px" }}>
        <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, margin: "0 0 6px", fontFamily: SANS }}>{city.highlight}</p>
        <p style={{ fontSize: 12, color: C.ink2, lineHeight: 1.55, margin: "0 0 12px", fontFamily: SANS, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{city.sub}</p>

        {/* Days picker (when selected) */}
        {selected && (
          <div style={{ marginBottom: 10, padding: "10px 12px", background: C.accentTint, borderRadius: 9, border: `1px solid ${C.accentMid}` }}>
            <p style={{ fontSize: 10, color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px", fontFamily: SANS }}>{t.daysHere}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => onDaysChange(Math.max(1, stay.days - 1))}
                style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${C.accentMid}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Minus size={14} color={C.accent} />
              </button>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, color: C.accent, minWidth: 24, textAlign: "center" }}>{stay.days}</span>
              <button onClick={() => onDaysChange(Math.min(21, stay.days + 1))}
                style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${C.accentMid}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plus size={14} color={C.accent} />
              </button>
              <span style={{ fontSize: 12, color: C.muted, fontFamily: SANS }}>
                {t.daysUnit}
              </span>
            </div>
          </div>
        )}

        <button onClick={onToggle}
          style={{ width: "100%", padding: "9px 0", borderRadius: 9, border: `1.5px solid ${selected ? C.danger : C.accent}`, background: selected ? C.danTint : C.accent, color: selected ? C.danger : "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: SANS, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {selected ? <><Minus size={13} /> Remove</> : <><Plus size={13} /> {t.selectCity}</>}
        </button>
      </div>
    </div>
  );
}

// ─── Route planner component ───────────────────────────────────────────────────
function RoutePlanner({ lang, cityStays, onCityStaysChange, selectedEntry, onEntryChange, onDepartureChange, fullTripOnly = false, onFullTripContinue }: {
  lang: Lang;
  cityStays: CityStay[];
  onCityStaysChange: (stays: CityStay[]) => void;
  selectedEntry: string;
  onEntryChange: (id: string) => void;
  onDepartureChange: (code: string) => void;
  fullTripOnly?: boolean;
  onFullTripContinue?: (stays: CityStay[]) => void;
}) {
  const mob = useMobile();
  const t = T[lang];
  const [departureCode, setDepartureCode] = useState("");
  const [planMode, setPlanMode] = useState<"" | "auto" | "manual">("");
  const [totalDays, setTotalDays] = useState(7);
  const [showSuggested, setShowSuggested] = useState(false);

  const departure = DEPARTURE_COUNTRIES.find(c => c.code === departureCode);
  const TransportIcon = departure?.icon ?? Plane;

  const handleCountrySelect = (code: string) => {
    setDepartureCode(code);
    onDepartureChange(code);
    const c = DEPARTURE_COUNTRIES.find(x => x.code === code);
    if (c) onEntryChange(c.entryId);
    setPlanMode("");
    setShowSuggested(false);
  };

  const applySuggested = (suggested: { cityId: string; days: number }[]) => {
    onCityStaysChange(suggested.map(s => ({ cityId: s.cityId, days: s.days })));
    setShowSuggested(true);
  };

  const toggleCity = (cityId: string) => {
    const exists = cityStays.find(s => s.cityId === cityId);
    if (exists) {
      onCityStaysChange(cityStays.filter(s => s.cityId !== cityId));
    } else {
      onCityStaysChange([...cityStays, { cityId, days: 2 }]);
    }
  };

  const setDays = (cityId: string, days: number) => {
    onCityStaysChange(cityStays.map(s => s.cityId === cityId ? { ...s, days } : s));
  };

  const totalStayDays = cityStays.reduce((sum, s) => sum + s.days, 0);

  const countryName = (c: DepartureCountry) => c[lang as "en" | "tr" | "ar"] as string;
  const continueFullTripFlow = () => {
    const suggested = planMode === "auto" ? getSuggestedForDays(totalDays).map(s => ({ cityId: s.cityId, days: s.days })) : cityStays;
    if (planMode === "auto") {
      onCityStaysChange(suggested);
    }
    onFullTripContinue?.(suggested);
  };

  return (
    <div>
      {/* ── Step A: Where from ── */}
      <div style={{ marginBottom: 40 }}>
        <h3 style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: C.ink2, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 14px" }}>
          {t.fromLabel}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 8 }}>
          {DEPARTURE_COUNTRIES.map(c => {
            const sel = departureCode === c.code;
            const Icon = c.icon;
            return (
              <button key={c.code} onClick={() => handleCountrySelect(c.code)}
                style={{ padding: "11px 12px", borderRadius: 10, border: `2px solid ${sel ? C.accent : C.border}`, background: sel ? C.accentTint : C.white, cursor: "pointer", display: "flex", alignItems: "center", gap: 9, transition: "all 0.15s", boxShadow: sel ? shMd : sh }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: sel ? C.accent : C.section, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={14} color={sel ? "#fff" : C.accent} />
                </div>
                <span style={{ fontSize: 12, fontWeight: sel ? 700 : 500, color: sel ? C.accent : C.ink2, fontFamily: SANS, textAlign: "left", lineHeight: 1.2, flex: 1 }}>{countryName(c)}</span>
                {sel && <Check size={13} color={C.accent} style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        {/* Auto-detected entry */}
        {departure && (
          <div style={{ marginTop: 14, padding: "12px 16px", background: C.accentTint, borderRadius: 10, border: `1px solid ${C.accentMid}`, display: "flex", alignItems: "center", gap: 12 }}>
            <TransportIcon size={18} color={C.accent} />
            <div>
              <p style={{ fontSize: 11, color: C.muted, margin: "0 0 2px", fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t.autoDetected}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.accent, margin: 0, fontFamily: SANS }}>
                {TRANSPORT_LABELS[departure.transport][lang]} · {ENTRY_LABELS[departure.entryId]?.[lang] ?? departure.entryId}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Step B: Planning mode ── */}
      {departure && (
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: C.ink2, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 14px" }}>
            {t.planMode}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { mode: "auto" as const, Icon: Compass, title: t.modeAuto, sub: t.modeAutoSub },
              { mode: "manual" as const, Icon: MapPin, title: t.modeManual, sub: t.modeManualSub },
            ].map(({ mode, Icon, title, sub }) => {
              const sel = planMode === mode;
              return (
                <button key={mode} onClick={() => { setPlanMode(mode); setShowSuggested(false); }}
                  style={{ padding: "20px 18px", borderRadius: 14, border: `2px solid ${sel ? C.accent : C.border}`, background: sel ? C.accentTint : C.white, cursor: "pointer", textAlign: "left", boxShadow: sel ? shMd : sh, transition: "all 0.15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: sel ? C.accent : C.section, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={18} color={sel ? "#fff" : C.accent} />
                    </div>
                    <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: sel ? C.accent : C.ink }}>{title}</span>
                    {sel && <Check size={16} color={C.accent} style={{ marginLeft: "auto" }} />}
                  </div>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.5, fontFamily: SANS }}>{sub}</p>
                </button>
              );
            })}
          </div>

          {/* Auto plan: ask total days → show suggestion */}
          {planMode === "auto" && (
            <div style={{ marginTop: 20, padding: "24px", background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: sh }}>
              <label style={{ ...lbl, marginBottom: 12 }}>{t.totalDays}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <button onClick={() => setTotalDays(d => Math.max(3, d - 1))}
                  style={{ width: 36, height: 36, borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.section, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Minus size={16} color={C.accent} />
                </button>
                <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, color: C.accent, minWidth: 48, textAlign: "center" }}>{totalDays}</span>
                <button onClick={() => setTotalDays(d => Math.min(21, d + 1))}
                  style={{ width: 36, height: 36, borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.section, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plus size={16} color={C.accent} />
                </button>
                <span style={{ fontSize: 15, color: C.muted, fontFamily: SANS }}>{t.daysUnit}</span>
              </div>

              {/* Suggestion preview */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px", fontFamily: SANS }}>{t.suggestedItin}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {getSuggestedForDays(totalDays).map((s, i, arr) => {
                    const city = CITIES.find(c => c.id === s.cityId);
                    const name = city ? (city[lang as "en" | "tr" | "ar"] as string) : s.cityId;
                    return (
                      <React.Fragment key={s.cityId}>
                        <span style={{ padding: "5px 12px", borderRadius: 9, background: C.accentMid, color: C.accent, fontSize: 12, fontWeight: 700, fontFamily: SANS }}>
                          {name} <span style={{ opacity: 0.7 }}>· {s.days}d</span>
                        </span>
                        {i < arr.length - 1 && <ArrowRight size={14} color={C.mutedLight} />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { applySuggested(getSuggestedForDays(totalDays)); }}
                  style={{ flex: 1, padding: "11px 0", borderRadius: 9, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
                  {fullTripOnly ? "Use this plan" : t.useThis}
                </button>
                <button onClick={() => { applySuggested(getSuggestedForDays(totalDays)); setPlanMode("manual"); }}
                  style={{ flex: 1, padding: "11px 0", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "none", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                  {fullTripOnly ? "I have a destination in mind" : t.customise}
                </button>
              </div>
              {fullTripOnly && (
                <div style={{ marginTop: 12 }}>
                  <button
                    onClick={continueFullTripFlow}
                    style={{ width: "100%", padding: "12px 0", borderRadius: 9, border: "none", background: C.ink, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}
                  >
                    Continue to application
                  </button>
                </div>
              )}
            </div>
          )}
          {fullTripOnly && planMode === "manual" && (
            <div style={{ marginTop: 20, padding: "24px", background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: sh }}>
              <label style={{ ...lbl, marginBottom: 12 }}>{t.totalDays}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <button onClick={() => setTotalDays(d => Math.max(3, d - 1))}
                  style={{ width: 36, height: 36, borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.section, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Minus size={16} color={C.accent} />
                </button>
                <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, color: C.accent, minWidth: 48, textAlign: "center" }}>{totalDays}</span>
                <button onClick={() => setTotalDays(d => Math.min(21, d + 1))}
                  style={{ width: 36, height: 36, borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.section, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plus size={16} color={C.accent} />
                </button>
                <span style={{ fontSize: 15, color: C.muted, fontFamily: SANS }}>{t.daysUnit}</span>
              </div>
              <p style={{ fontSize: 13, color: C.muted, margin: "0 0 14px", fontFamily: SANS, lineHeight: 1.6 }}>
                Tell us the number of days now. You can share your destination ideas in the application form.
              </p>
              <button
                onClick={continueFullTripFlow}
                style={{ width: "100%", padding: "12px 0", borderRadius: 9, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}
              >
                Continue to application
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Step C: City cards (always visible) ── */}
      {!fullTripOnly && <div style={{ marginTop: departure ? 0 : 0 }}>
        <h3 style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: C.ink2, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>
          {t.citiesTitle}
        </h3>
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 16px", fontFamily: SANS }}>{t.citiesSub}</p>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
          {CITIES.map(city => {
            const stay = cityStays.find(s => s.cityId === city.id) ?? null;
            return (
              <CityPhotoCard key={city.id} city={city} stay={stay}
                onToggle={() => toggleCity(city.id)}
                onDaysChange={d => setDays(city.id, d)}
                lang={lang} />
            );
          })}
        </div>
      </div>}

      {/* ── Route summary ── */}
      {!fullTripOnly && cityStays.length > 0 && (
        <div style={{ padding: "16px 20px", background: C.accentTint, borderRadius: 12, border: `1.5px solid ${C.accentMid}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Route size={16} color={C.accent} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.accent, fontFamily: SANS }}>{t.yourRoute}</span>
            <span style={{ fontSize: 12, color: C.muted, fontFamily: SANS, marginLeft: "auto" }}>
              {totalStayDays} {t.daysUnit} total
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            {departure && (
              <>
                <span style={{ padding: "4px 11px", borderRadius: 8, background: C.ink2, color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: SANS }}>
                  {countryName(departure)}
                </span>
                <ArrowRight size={14} color={C.mutedLight} />
                <span style={{ padding: "4px 11px", borderRadius: 8, background: C.ink, color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: SANS }}>
                  {ENTRY_LABELS[departure.entryId]?.[lang]}
                </span>
                <ArrowRight size={14} color={C.mutedLight} />
              </>
            )}
            {cityStays.map((s, i) => {
              const city = CITIES.find(c => c.id === s.cityId);
              const name = city ? (city[lang as "en" | "tr" | "ar"] as string) : s.cityId;
              return (
                <React.Fragment key={s.cityId}>
                  <span style={{ padding: "4px 11px", borderRadius: 8, background: C.accent, color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: SANS }}>
                    {name} · {s.days}d
                  </span>
                  {i < cityStays.length - 1 && <ArrowRight size={14} color={C.mutedLight} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Application form ──────────────────────────────────────────────────────────
function ApplicationForm({ lang, preInterests, selectedEntry, cityStays, preBudget, departureCountry }: {
  lang: Lang;
  preInterests: Set<string>;
  selectedEntry: string;
  cityStays: CityStay[];
  preBudget: string;
  departureCountry: string;
}) {
  const mob = useMobile();
  const t = T[lang];
  const dir = t.dir;

  type FD = {
    fullName: string; email: string; phone: string;
    nationality: string; residenceCountry: string;
    preferredLanguage: string; visaType: string; tripPurpose: string;
    dateOfArrival: string; dateOfDeparture: string; travelersCount: number;
    accommodationClass: string; budgetRange: string; preferredContact: string;
    additionalNotes: string; emergencyContactName: string; emergencyContactPhone: string;
    agreeToTerms: boolean; documentFileName: string;
    serviceHotel: boolean; serviceAirBnB: boolean; serviceCar: boolean;
    serviceAirportPickup: boolean; serviceItinerary: boolean; serviceVisaSupport: boolean;
    serviceTranslation: boolean; serviceInsurance: boolean;
  };

  const init = (): FD => ({
    fullName: "", email: "", phone: "", nationality: "", residenceCountry: "",
    preferredLanguage: "English", visaType: "Tourist", tripPurpose: "Leisure",
    dateOfArrival: "", dateOfDeparture: "", travelersCount: 1,
    accommodationClass: "4-Star", budgetRange: preBudget || "Standard",
    preferredContact: "Email", additionalNotes: "",
    emergencyContactName: "", emergencyContactPhone: "",
    agreeToTerms: false, documentFileName: "",
    serviceHotel:         preInterests.has("serviceHotel"),
    serviceAirBnB:        preInterests.has("serviceAirBnB"),
    serviceCar:           preInterests.has("serviceCar"),
    serviceAirportPickup: preInterests.has("serviceAirportPickup"),
    serviceItinerary:     preInterests.has("serviceItinerary"),
    serviceVisaSupport:   preInterests.has("serviceVisaSupport"),
    serviceTranslation:   preInterests.has("serviceTranslation"),
    serviceInsurance:     preInterests.has("serviceInsurance"),
  });

  const [fd, setFd] = useState<FD>(init);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [copied, setCopied] = useState(false);

  const set = (k: keyof FD, v: unknown) => setFd(p => ({ ...p, [k]: v }));
  const foc = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accentMid}`; };
  const blu = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; };

  const validateStep1 = () => {
    if (!fd.fullName || !fd.email || !fd.phone || !fd.nationality) {
      setErrMsg("Please fill in all required fields."); return false;
    }
    return true;
  };
  const validateStep2 = () => {
    if (!fd.dateOfArrival || !fd.dateOfDeparture) {
      setErrMsg("Please select your travel dates."); return false;
    }
    return true;
  };

  const goNext = () => {
    setErrMsg("");
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
    setTimeout(() => document.getElementById("form-top")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleSubmit = async () => {
    if (!fd.agreeToTerms) { setErrMsg("Please confirm the consent box."); return; }
    setSaving(true); setErrMsg("");
    try {
      // Build rich data object with all route info
      const cityItinerary = cityStays.map(s => {
        const city = CITIES.find(c => c.id === s.cityId);
        return { cityId: s.cityId, cityName: city?.en ?? s.cityId, days: s.days };
      });
      const departure = DEPARTURE_COUNTRIES.find(c => c.code === departureCountry);
      const payload: Record<string, unknown> = {
        ...fd,
        departureCountry: departure?.en ?? departureCountry,
        departureCountryCode: departureCountry,
        transportMode: departure ? TRANSPORT_LABELS[departure.transport]["en"] : "",
        entryPoint: ENTRY_LABELS[selectedEntry]?.["en"] ?? selectedEntry,
        cityItinerary,
        cityItineraryText: cityItinerary.map(c => `${c.cityName} (${c.days} days)`).join(" → "),
        totalTripDays: cityStays.reduce((sum, s) => sum + s.days, 0),
        selectedInterests: INTERESTS.filter(i => (fd as Record<string, unknown>)[i.id]).map(i => i.en),
      };
      const res = await createTravelRequest(payload, file);
      setTrackingId(res.trackingId);
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Failed to submit. Please try again.");
    } finally { setSaving(false); }
  };

  const copyId = () => {
    navigator.clipboard.writeText(trackingId).catch(() => {
      const ta = document.createElement("textarea"); ta.value = trackingId;
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    });
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  // Success screen
  if (trackingId) {
    return (
      <div style={{ background: C.white, borderRadius: 20, padding: mob ? "32px 20px" : "48px 40px", boxShadow: shLg, textAlign: "center", fontFamily: SANS }} dir={dir}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: C.posTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
          <CheckCircle size={36} color={C.positive} />
        </div>
        <h2 style={{ fontWeight: 800, fontSize: 26, color: C.ink, margin: "0 0 10px" }}>{t.successTitle}</h2>
        <p style={{ fontSize: 15, color: C.muted, margin: "0 0 30px", lineHeight: 1.65 }}>{t.successSub}</p>
        <div style={{ background: C.bg, borderRadius: 14, padding: "20px 26px", marginBottom: 26, border: `1.5px solid ${C.accentMid}`, display: "inline-block", minWidth: 260 }}>
          <p style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px", fontFamily: MONO }}>{t.refCode}</p>
          <p style={{ fontFamily: MONO, fontSize: 26, fontWeight: 800, color: C.accent, letterSpacing: "0.14em", margin: "0 0 16px" }}>{trackingId}</p>
          <button onClick={copyId} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 22px", borderRadius: 8, border: "none", background: copied ? C.positive : C.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}>
            {copied ? <><Check size={14} /> {t.copied}</> : <><Save size={14} /> {t.copyCode}</>}
          </button>
        </div>
        <br />
        <button onClick={() => { setTrackingId(""); setFd(init()); setStep(1); setCopied(false); }}
          style={{ padding: "10px 22px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "none", color: C.muted, fontSize: 14, cursor: "pointer", fontFamily: SANS }}>
          {t.newApp}
        </button>
      </div>
    );
  }

  // Selected services summary
  const selectedServices = INTERESTS.filter(i => (fd as Record<string, unknown>)[i.id]).map(i => i.en);
  const departure = DEPARTURE_COUNTRIES.find(c => c.code === departureCountry);

  return (
    <div id="form-top" style={{ background: C.white, borderRadius: 20, boxShadow: shLg, border: `1px solid ${C.border}`, overflow: "hidden", fontFamily: SANS }} dir={dir}>

      {/* Steps header */}
      <div style={{ background: C.section, padding: mob ? "14px 16px" : "22px 28px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {t.steps.map((label, i) => {
            const idx = i + 1; const done = step > idx; const active = step === idx;
            return (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ flex: 1, height: 2, background: done ? C.accent : C.border, transition: "background 0.3s" }} />}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: done || active ? C.accent : C.white, border: `2px solid ${done || active ? C.accent : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {done ? <Check size={13} color="#fff" /> : <span style={{ fontSize: 12, fontWeight: 700, color: active ? "#fff" : C.mutedLight }}>{idx}</span>}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? C.accent : done ? C.ink2 : C.mutedLight, whiteSpace: "nowrap" }}>{label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {errMsg && (
        <div style={{ margin: "14px 28px 0", padding: "10px 14px", borderRadius: 8, background: C.danTint, border: `1px solid ${C.danger}`, color: C.danger, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={13} /> {errMsg}
        </div>
      )}

      <div style={{ padding: mob ? "20px 16px" : "26px 28px" }}>

        {/* STEP 1 ─ Your details */}
        {step === 1 && (
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: C.ink, margin: "0 0 4px" }}>{t.steps[0]}</h3>
            <p style={{ color: C.muted, fontSize: 13, margin: "0 0 20px" }}>Required to process your application.</p>
            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 13 }}>
              <div>
                <label style={lbl}>Full Name <span style={{ color: C.danger }}>*</span></label>
                <input style={inp} value={fd.fullName} onChange={e => set("fullName", e.target.value)} placeholder="As per your ID/Passport" onFocus={foc} onBlur={blu} />
              </div>
              <div>
                <label style={lbl}>Email <span style={{ color: C.danger }}>*</span></label>
                <input style={inp} type="email" value={fd.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" onFocus={foc} onBlur={blu} />
              </div>
              <div>
                <label style={lbl}>Phone / WhatsApp <span style={{ color: C.danger }}>*</span></label>
                <input style={inp} type="tel" value={fd.phone} onChange={e => set("phone", e.target.value)} placeholder="+90 555 000 00 00" onFocus={foc} onBlur={blu} />
              </div>
              <div>
                <label style={lbl}>Nationality <span style={{ color: C.danger }}>*</span></label>
                <input style={inp} value={fd.nationality} onChange={e => set("nationality", e.target.value)} placeholder="e.g. Turkish" onFocus={foc} onBlur={blu} />
              </div>
              <div>
                <label style={lbl}>Country of Residence</label>
                <input style={inp} value={fd.residenceCountry} onChange={e => set("residenceCountry", e.target.value)} placeholder="Where you live now" onFocus={foc} onBlur={blu} />
              </div>
              <div>
                <label style={lbl}>Preferred Language</label>
                <select style={inp} value={fd.preferredLanguage} onChange={e => set("preferredLanguage", e.target.value)} onFocus={foc} onBlur={blu}>
                  {["English", "Albanian", "Arabic", "Turkish", "Greek"].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ ...lbl, marginBottom: 10 }}>How do you prefer we contact you?</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Email", "Phone", "WhatsApp", "Telegram"].map(m => {
                    const sel = fd.preferredContact === m;
                    return (
                      <button key={m} type="button" onClick={() => set("preferredContact", m)}
                        style={{ padding: "8px 16px", borderRadius: 9, border: `1.5px solid ${sel ? C.accent : C.border}`, background: sel ? C.accentTint : "none", color: sel ? C.accent : C.muted, fontSize: 12, fontWeight: sel ? 700 : 500, cursor: "pointer", fontFamily: SANS }}>
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 ─ Travel dates */}
        {step === 2 && (() => {
          const today = new Date().toISOString().slice(0, 10);
          const totalItinDays = cityStays.reduce((s, c) => s + c.days, 0);

          const fmtDate = (d: string) => {
            if (!d) return "";
            try { return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }); }
            catch { return d; }
          };

          const nights = fd.dateOfArrival && fd.dateOfDeparture
            ? Math.round((new Date(fd.dateOfDeparture + "T00:00:00").getTime() - new Date(fd.dateOfArrival + "T00:00:00").getTime()) / 86400000)
            : 0;

          const autoFillDeparture = () => {
            if (!fd.dateOfArrival || totalItinDays === 0) return;
            const d = new Date(fd.dateOfArrival + "T00:00:00");
            d.setDate(d.getDate() + totalItinDays);
            set("dateOfDeparture", d.toISOString().slice(0, 10));
          };

          return (
            <div>
              <h3 style={{ fontWeight: 800, fontSize: 18, color: C.ink, margin: "0 0 4px" }}>{t.steps[1]}</h3>
              <p style={{ color: C.muted, fontSize: 13, margin: "0 0 18px" }}>When are you planning to travel?</p>

              {/* Trip plan summary */}
              {(cityStays.length > 0 || preInterests.size > 0) && (
                <div style={{ marginBottom: 20, padding: "14px 16px", background: C.accentTint, borderRadius: 12, border: `1.5px solid ${C.accentMid}` }}>
                  <p style={{ fontSize: 10, color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px", fontFamily: MONO }}>Your plan so far</p>
                  {cityStays.length > 0 && (
                    <p style={{ fontSize: 13, color: C.ink2, margin: "0 0 4px", lineHeight: 1.5, fontFamily: SANS }}>
                      <strong style={{ color: C.accent }}>{totalItinDays} days</strong> · {cityStays.map(s => { const city = CITIES.find(c => c.id === s.cityId); return `${(city?.[lang as "en" | "tr" | "ar"] ?? s.cityId)} (${s.days}d)`; }).join(" → ")}
                    </p>
                  )}
                  {preBudget && <p style={{ fontSize: 12, color: C.muted, margin: 0, fontFamily: SANS }}>Budget: {preBudget}</p>}
                </div>
              )}

              {/* Quick selectors row */}
              <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={lbl}>Permit / Visa Type</label>
                  <select style={inp} value={fd.visaType} onChange={e => set("visaType", e.target.value)} onFocus={foc} onBlur={blu}>
                    {["Tourist", "Business", "Work", "Student", "Residency"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Trip Purpose</label>
                  <select style={inp} value={fd.tripPurpose} onChange={e => set("tripPurpose", e.target.value)} onFocus={foc} onBlur={blu}>
                    {["Leisure", "Business", "Relocation", "Family Visit", "Medical"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Date cards */}
              <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
                {/* Arrival */}
                <div style={{ borderRadius: 14, border: `2px solid ${fd.dateOfArrival ? C.accent : C.border}`, background: C.white, overflow: "hidden", transition: "border-color 0.2s" }}>
                  <div style={{ padding: "10px 14px", background: fd.dateOfArrival ? C.accent : C.section, display: "flex", alignItems: "center", gap: 8 }}>
                    <Plane size={14} color={fd.dateOfArrival ? "#fff" : C.muted} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: fd.dateOfArrival ? "#fff" : C.muted, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: MONO }}>
                      Arriving <span style={{ color: fd.dateOfArrival ? "rgba(255,255,255,0.7)" : C.danger }}>*</span>
                    </span>
                  </div>
                  <div style={{ padding: "14px" }}>
                    {fd.dateOfArrival && (
                      <p style={{ fontSize: 15, fontWeight: 800, color: C.accent, margin: "0 0 10px", fontFamily: SANS, lineHeight: 1.3 }}>
                        {fmtDate(fd.dateOfArrival)}
                      </p>
                    )}
                    <input style={{ ...inp, borderColor: fd.dateOfArrival ? C.accentMid : C.border }}
                      type="date" min={today} value={fd.dateOfArrival}
                      onChange={e => {
                        set("dateOfArrival", e.target.value);
                        // If departure is before new arrival, clear it
                        if (fd.dateOfDeparture && fd.dateOfDeparture <= e.target.value) {
                          set("dateOfDeparture", "");
                        }
                        // Auto-fill departure if we know the trip length
                        if (totalItinDays > 0 && (!fd.dateOfDeparture || fd.dateOfDeparture <= e.target.value)) {
                          const d = new Date(e.target.value + "T00:00:00");
                          d.setDate(d.getDate() + totalItinDays);
                          set("dateOfDeparture", d.toISOString().slice(0, 10));
                        }
                      }}
                      onFocus={foc} onBlur={blu} />
                  </div>
                </div>

                {/* Departure */}
                <div style={{ borderRadius: 14, border: `2px solid ${fd.dateOfDeparture ? C.accent : C.border}`, background: C.white, overflow: "hidden", transition: "border-color 0.2s" }}>
                  <div style={{ padding: "10px 14px", background: fd.dateOfDeparture ? C.accent : C.section, display: "flex", alignItems: "center", gap: 8 }}>
                    <Navigation size={14} color={fd.dateOfDeparture ? "#fff" : C.muted} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: fd.dateOfDeparture ? "#fff" : C.muted, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: MONO }}>
                      Departing <span style={{ color: fd.dateOfDeparture ? "rgba(255,255,255,0.7)" : C.danger }}>*</span>
                    </span>
                  </div>
                  <div style={{ padding: "14px" }}>
                    {fd.dateOfDeparture && (
                      <p style={{ fontSize: 15, fontWeight: 800, color: C.accent, margin: "0 0 10px", fontFamily: SANS, lineHeight: 1.3 }}>
                        {fmtDate(fd.dateOfDeparture)}
                      </p>
                    )}
                    <input style={{ ...inp, borderColor: fd.dateOfDeparture ? C.accentMid : C.border }}
                      type="date"
                      min={fd.dateOfArrival ? (() => { const d = new Date(fd.dateOfArrival + "T00:00:00"); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })() : today}
                      value={fd.dateOfDeparture}
                      onChange={e => set("dateOfDeparture", e.target.value)}
                      onFocus={foc} onBlur={blu} />
                    {/* Auto-fill suggestion */}
                    {fd.dateOfArrival && totalItinDays > 0 && !fd.dateOfDeparture && (
                      <button type="button" onClick={autoFillDeparture}
                        style={{ marginTop: 8, width: "100%", padding: "8px", borderRadius: 8, border: `1.5px solid ${C.accentMid}`, background: C.accentTint, color: C.accent, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                        ↙ Use {totalItinDays} days from your route
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Nights counter */}
              {nights > 0 && (
                <div style={{ marginBottom: 16, padding: "12px 16px", background: C.accentTint, borderRadius: 10, border: `1px solid ${C.accentMid}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <Sun size={16} color={C.accent} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.accent, fontFamily: SANS }}>
                    {nights} night{nights !== 1 ? "s" : ""} · {nights + 1} days in Albania
                  </span>
                  {totalItinDays > 0 && nights !== totalItinDays && (
                    <span style={{ fontSize: 12, color: C.gold, marginLeft: "auto", fontFamily: SANS }}>
                      ⚠ Your route is {totalItinDays}d
                    </span>
                  )}
                </div>
              )}

              {/* Travelers + Accommodation */}
              <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lbl}>Number of Travelers</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button type="button" onClick={() => set("travelersCount", Math.max(1, fd.travelersCount - 1))}
                      style={{ width: 38, height: 38, borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.section, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>−</button>
                    <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: C.accent, minWidth: 30, textAlign: "center" }}>{fd.travelersCount}</span>
                    <button type="button" onClick={() => set("travelersCount", Math.min(20, fd.travelersCount + 1))}
                      style={{ width: 38, height: 38, borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.section, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>+</button>
                    <span style={{ fontSize: 13, color: C.muted, fontFamily: SANS }}>person{fd.travelersCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Accommodation Class</label>
                  <select style={inp} value={fd.accommodationClass} onChange={e => set("accommodationClass", e.target.value)} onFocus={foc} onBlur={blu}>
                    {["3-Star", "4-Star", "5-Star", "Boutique", "Apartment / Villa"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>
          );
        })()}

        {/* STEP 3 ─ Review & submit */}
        {step === 3 && (
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: C.ink, margin: "0 0 4px" }}>{t.steps[2]}</h3>
            <p style={{ color: C.muted, fontSize: 13, margin: "0 0 20px" }}>Review everything before submitting. Click any section to edit.</p>

            {/* Review sections */}
            {[
              {
                label: t.reviewRoute, icon: Route,
                items: [
                  ["From", (departure?.en ?? departureCountry) || "—"],
                  ["Entry", (ENTRY_LABELS[selectedEntry]?.[lang] ?? selectedEntry) || "—"],
                  ["Itinerary", cityStays.length ? cityStays.map(s => { const c = CITIES.find(x => x.id === s.cityId); return `${(c?.[lang as "en" | "tr" | "ar"] ?? s.cityId)} (${s.days}d)`; }).join(" → ") : "Not set"],
                ],
                onEdit: () => document.getElementById("route")?.scrollIntoView({ behavior: "smooth" }),
              },
              {
                label: t.reviewServices, icon: CheckCircle,
                items: [["Selected", selectedServices.length ? selectedServices.join(", ") : "None"], ["Budget", BUDGETS.find(b => b.key === fd.budgetRange)?.en ?? fd.budgetRange]],
                onEdit: () => document.getElementById("interests")?.scrollIntoView({ behavior: "smooth" }),
              },
              {
                label: t.reviewDetails, icon: UserCheck,
                items: [["Name", fd.fullName], ["Email", fd.email], ["Phone", fd.phone], ["Nationality", fd.nationality], ["Contact via", fd.preferredContact]],
                onEdit: () => setStep(1),
              },
              {
                label: t.reviewDates, icon: Navigation,
                items: [["Permit", fd.visaType], ["Purpose", fd.tripPurpose], ["Arrival", fd.dateOfArrival || "—"], ["Departure", fd.dateOfDeparture || "—"], ["Travelers", String(fd.travelersCount)]],
                onEdit: () => setStep(2),
              },
            ].map(({ label, icon: Icon, items, onEdit }) => (
              <div key={label} style={{ background: C.section, borderRadius: 12, padding: "16px 18px", marginBottom: 12, border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon size={15} color={C.accent} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.ink2, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: SANS }}>{label}</span>
                  </div>
                  <button onClick={onEdit} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.white, color: C.accent, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
                    <Pencil size={11} /> {t.editSection}
                  </button>
                </div>
                {items.map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, padding: "6px 0", gap: 12 }}>
                    <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, fontFamily: SANS, flexShrink: 0 }}>{k}</span>
                    <span style={{ fontSize: 12, color: C.ink, fontWeight: 600, fontFamily: SANS, textAlign: "right", wordBreak: "break-word" }}>{v || "—"}</span>
                  </div>
                ))}
              </div>
            ))}

            {/* Emergency + notes */}
            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={lbl}>Emergency Contact Name</label>
                <input style={inp} value={fd.emergencyContactName} onChange={e => set("emergencyContactName", e.target.value)} placeholder="Contact name" onFocus={foc} onBlur={blu} />
              </div>
              <div>
                <label style={lbl}>Emergency Contact Phone</label>
                <input style={inp} value={fd.emergencyContactPhone} onChange={e => set("emergencyContactPhone", e.target.value)} placeholder="+90 555 000 00 00" onFocus={foc} onBlur={blu} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Additional Notes</label>
              <textarea style={{ ...inp, minHeight: 90, resize: "vertical", lineHeight: 1.6 }} value={fd.additionalNotes} onChange={e => set("additionalNotes", e.target.value)} placeholder="Any special requirements or questions…" onFocus={foc} onBlur={blu} />
            </div>

            {/* Upload */}
            <div style={{ marginBottom: 16, padding: "14px 16px", background: C.section, borderRadius: 10, border: `1.5px dashed ${C.border}` }}>
              <label style={lbl}>Supporting Document (PDF, optional)</label>
              <input type="file" accept="application/pdf" onChange={e => { const f = e.target.files?.[0] ?? null; setFile(f); set("documentFileName", f?.name ?? ""); }} style={{ fontSize: 13, color: C.muted, fontFamily: SANS, width: "100%" }} />
              {fd.documentFileName && <p style={{ fontSize: 12, color: C.positive, margin: "7px 0 0", display: "flex", alignItems: "center", gap: 5 }}><Check size={12} /> {fd.documentFileName}</p>}
            </div>

            {/* Consent */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 12 }}>
              <input type="checkbox" checked={fd.agreeToTerms} onChange={e => set("agreeToTerms", e.target.checked)} style={{ marginTop: 2, accentColor: C.accent, width: 16, height: 16, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: C.ink2, lineHeight: 1.5, fontFamily: SANS }}>
                I confirm the information above is accurate and I consent to be contacted by a Kayrosco Travel advisor.
              </span>
            </label>

            {/* Lek notice */}
            <div style={{ padding: "10px 14px", background: C.goldTint, borderRadius: 9, border: `1px solid ${C.goldMid}`, display: "flex", alignItems: "center", gap: 8 }}>
              <CreditCard size={14} color={C.gold} />
              <span style={{ fontSize: 12, color: C.gold, fontWeight: 700, fontFamily: SANS }}>You will receive an invoice in Albanian Lek (ALL) · Safe &amp; transparent</span>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ display: "flex", justifyContent: step === 1 ? "flex-end" : "space-between", gap: 10, marginTop: 24 }}>
          {step > 1 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              style={{ padding: "12px 22px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "none", color: C.muted, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: SANS, display: "flex", alignItems: "center", gap: 6 }}>
              <ChevronLeft size={15} /> {t.back}
            </button>
          )}
          {step < 3 ? (
            <button type="button" onClick={goNext}
              style={{ padding: "12px 26px", borderRadius: 9, border: "none", background: C.accent, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: SANS, display: "flex", alignItems: "center", gap: 6 }}>
              {t.next} <ChevronRight size={15} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={saving}
              style={{ padding: "12px 26px", borderRadius: 9, border: "none", background: saving ? C.mutedLight : C.accent, color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: SANS, display: "flex", alignItems: "center", gap: 6 }}>
              {saving ? <><Loader size={14} className="animate-spin" /> {t.submitting}</> : <>{t.submit} <ArrowRight size={14} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Track application ─────────────────────────────────────────────────────────
function TrackApplication({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [tid, setTid] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
    new:           { label: "New",           color: "#F59E0B", bg: "rgba(245,158,11,0.1)"  },
    in_review:     { label: "In Review",     color: "#3B82F6", bg: "rgba(59,130,246,0.1)"  },
    awaiting_docs: { label: "Awaiting Docs", color: "#EF4444", bg: "rgba(239,68,68,0.1)"   },
    in_progress:   { label: "In Progress",   color: "#8B5CF6", bg: "rgba(139,92,246,0.1)"  },
    completed:     { label: "Completed",     color: "#10B981", bg: "rgba(16,185,129,0.1)"  },
  };

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tid.trim()) { setErr("Please enter a tracking ID."); return; }
    setLoading(true); setResult(null); setErr("");
    try {
      const data = await fetchByTrackingId(tid.trim());
      setResult(data as unknown as Record<string, unknown>);
    } catch { setErr(`No application found with ID: ${tid}`); }
    finally { setLoading(false); }
  };

  const r = result;
  const status = r ? String(r.status ?? "new") : "new";
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.new;
  const d = (r?.data ?? {}) as Record<string, unknown>;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px" }} dir={t.dir}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <STag><Search size={12} /> {t.trackTitle}</STag>
        <h2 style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: C.ink, margin: "16px 0 10px" }}>{t.trackTitle}</h2>
        <p style={{ color: C.muted, fontSize: 15, fontFamily: SANS }}>{t.trackSub}</p>
      </div>
      <form onSubmit={track} style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input style={{ ...inp, flex: 1, fontFamily: MONO, letterSpacing: "0.05em" }} value={tid} onChange={e => setTid(e.target.value)} placeholder="e.g. a1b2c3d4e5f6" />
        <button type="submit" disabled={loading}
          style={{ padding: "12px 22px", borderRadius: 9, border: "none", background: C.accent, color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: SANS, display: "flex", alignItems: "center", gap: 7, opacity: loading ? 0.7 : 1, flexShrink: 0 }}>
          {loading ? <Loader size={14} className="animate-spin" /> : <><Search size={14} /> {t.trackBtn}</>}
        </button>
      </form>
      {err && <div style={{ padding: "11px 14px", borderRadius: 8, background: C.danTint, border: `1px solid ${C.danger}`, color: C.danger, fontSize: 13, display: "flex", alignItems: "center", gap: 8, fontFamily: SANS }}><AlertTriangle size={13} /> {err}</div>}
      {r && (
        <div style={{ background: C.white, borderRadius: 16, border: `2px solid ${cfg.color}`, boxShadow: shLg, overflow: "hidden", fontFamily: SANS }}>
          {/* Status header */}
          <div style={{ padding: "18px 22px", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <p style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px", fontFamily: MONO }}>Application ID</p>
              <p style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: C.ink, margin: 0 }}>{String(r.tracking_id ?? "")}</p>
            </div>
            <span style={{ padding: "6px 16px", borderRadius: 100, background: C.white, color: cfg.color, fontWeight: 800, fontSize: 13, fontFamily: SANS }}>{cfg.label}</span>
          </div>

          <div style={{ padding: "18px 22px" }}>
            {/* Basic applicant info */}
            {[
              ["Applicant", String(r.full_name ?? "")],
              ["Email", String(r.email ?? "")],
              ["Permit Type", String(d.visaType ?? "")],
              ["Travel Dates", d.dateOfArrival && d.dateOfDeparture ? `${d.dateOfArrival} → ${d.dateOfDeparture}` : "—"],
              ["Submitted", r.created_at ? new Date(String(r.created_at)).toLocaleString() : "—"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, padding: "7px 0", gap: 12 }}>
                <span style={{ fontSize: 13, color: C.muted, fontWeight: 600, fontFamily: SANS, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 13, color: C.ink, fontWeight: 600, fontFamily: SANS, textAlign: "right", wordBreak: "break-all" }}>{value || "—"}</span>
              </div>
            ))}

            {/* Route summary */}
            {(d.departureCountry || d.entryPoint) && (
              <div style={{ marginTop: 16, padding: "14px 16px", background: C.accentTint, borderRadius: 10, border: `1px solid ${C.accentMid}` }}>
                <p style={{ fontSize: 10, color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px", fontFamily: MONO }}>Your Route</p>
                {d.departureCountry && <p style={{ fontSize: 13, color: C.ink2, margin: "0 0 4px", fontFamily: SANS }}><span style={{ color: C.muted, marginRight: 6 }}>From:</span>{String(d.departureCountry)}</p>}
                {d.entryPoint     && <p style={{ fontSize: 13, color: C.ink2, margin: "0 0 4px", fontFamily: SANS }}><span style={{ color: C.muted, marginRight: 6 }}>Entry:</span>{String(d.entryPoint)}</p>}
                {d.cityItineraryText && <p style={{ fontSize: 13, color: C.ink2, margin: "0", fontFamily: SANS }}><span style={{ color: C.muted, marginRight: 6 }}>Plan:</span>{String(d.cityItineraryText)}</p>}
              </div>
            )}

            {/* Services selected */}
            {Array.isArray(d.selectedInterests) && (d.selectedInterests as string[]).length > 0 && (
              <div style={{ marginTop: 12, padding: "12px 14px", background: C.section, borderRadius: 10, border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px", fontFamily: MONO }}>Services You Requested</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {(d.selectedInterests as string[]).map(s => (
                    <span key={s} style={{ padding: "3px 10px", borderRadius: 100, fontSize: 12, fontFamily: SANS, fontWeight: 600, background: C.accentMid, color: C.accent }}>✓ {s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Admin update / notes for client */}
            {r.report && (
              <div style={{ marginTop: 16, padding: "14px 16px", background: C.goldTint, borderRadius: 10, border: `1px solid ${C.goldMid}` }}>
                <p style={{ fontSize: 10, color: C.gold, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px", fontFamily: MONO }}>Update from our team</p>
                <p style={{ fontSize: 13, color: C.ink2, margin: 0, lineHeight: 1.65, fontFamily: SANS, whiteSpace: "pre-wrap" }}>{String(r.report)}</p>
              </div>
            )}

            {/* Action required */}
            {status === "awaiting_docs" && (
              <div style={{ marginTop: 14, padding: "12px 16px", background: C.danTint, borderRadius: 9, border: `1px solid ${C.danger}` }}>
                <p style={{ fontWeight: 700, color: C.danger, margin: "0 0 3px", fontSize: 13, fontFamily: SANS }}>Action Required</p>
                <p style={{ color: C.ink2, fontSize: 13, margin: 0, lineHeight: 1.5, fontFamily: SANS }}>We need additional documents. Please check your email or contact our support team.</p>
              </div>
            )}

            {/* Status progress */}
            <div style={{ marginTop: 18 }}>
              <p style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px", fontFamily: MONO }}>Application Progress</p>
              {[
                { key: "new",           label: "Received" },
                { key: "in_review",     label: "Under Review" },
                { key: "awaiting_docs", label: "Documents Needed" },
                { key: "in_progress",   label: "Being Processed" },
                { key: "completed",     label: "Completed" },
              ].map((step, idx, arr) => {
                const statuses = ["new","in_review","awaiting_docs","in_progress","completed"];
                const currentIdx = statuses.indexOf(status);
                const stepIdx    = statuses.indexOf(step.key);
                const done       = stepIdx <= currentIdx;
                const current    = step.key === status;
                return (
                  <div key={step.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: idx < arr.length - 1 ? 4 : 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: done ? cfg.color : C.border, flexShrink: 0, boxShadow: current ? `0 0 0 3px ${cfg.color}30` : "none" }} />
                    <span style={{ fontSize: 12, fontFamily: SANS, fontWeight: current ? 700 : 400, color: done ? (current ? cfg.color : C.ink2) : C.mutedLight }}>
                      {step.label}{current && <span style={{ fontSize: 10, color: C.muted, marginLeft: 6 }}>← current</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────────
function Footer({ settings, lang }: { settings: Record<string, string> | null; lang: Lang }) {
  const mob = useMobile();
  const t = T[lang];
  const [clicks, setClicks] = useState(0);
  const click = () => { const n = clicks + 1; setClicks(n); if (n >= 3) { window.location.href = "/admin"; setClicks(0); return; } setTimeout(() => setClicks(0), 600); };
  return (
    <footer style={{ background: C.ink, color: "#94A3B8", fontFamily: SANS }} dir={t.dir}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: mob ? "36px 20px 100px" : "50px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "2fr 1fr 1fr", gap: mob ? 28 : 40, marginBottom: 36 }}>
          <div>
            <h3 style={{ fontFamily: SANS, fontWeight: 800, fontSize: 20, color: "#fff", margin: "0 0 10px" }}>KAYROSCO <span style={{ color: C.accent }}>TRAVEL</span></h3>
            <p style={{ fontSize: 14, lineHeight: 1.7, margin: "0 0 16px", maxWidth: 300 }}>Personalized travel & residency services across Albania — full support before, during, and after your trip.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13 }}><Phone size={12} />{settings?.phone ?? "+355 69 000 0000"}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13 }}><Globe size={12} />{settings?.email ?? "travel@kayrosco.com"}</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>Services</p>
            {["Visa & Permit Support", "Hotel Booking", "Private Driver", "Airport Transfer", "Custom Itinerary"].map(s => <p key={s} style={{ fontSize: 13, color: "#64748B", margin: "0 0 8px" }}>{s}</p>)}
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>Destinations</p>
            {["Tirana", "Durrës", "Vlorë", "Sarandë", "Berat", "Gjirokastër"].map(c => <p key={c} style={{ fontSize: 13, color: "#64748B", margin: "0 0 8px" }}>{c}</p>)}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 22, display: "flex", flexDirection: mob ? "column" : "row", justifyContent: mob ? "center" : "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, textAlign: mob ? "center" : "left" }}>
          <p style={{ fontSize: 13, margin: 0 }}>© {new Date().getFullYear()} <span onClick={click} style={{ color: C.accent, cursor: "pointer", fontWeight: 700 }}>KAYROSCO</span> Travel. All rights reserved.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#64748B" }}><CreditCard size={12} color={C.gold} /> All prices in Albanian Lek (ALL)</div>
        </div>
      </div>
    </footer>
  );
}

// ─── Hero section ──────────────────────────────────────────────────────────────

function HeroSection({ lang, onPlan, onTrack }: { lang: Lang; onPlan: () => void; onTrack: () => void }) {
  const t = T[lang];
  const mob = useMobile();

  return (
    <div
      style={{ position: "relative", minHeight: mob ? "100svh" : "92vh", display: "flex", alignItems: mob ? "flex-end" : "center", overflow: "hidden" }}
    >
      <img
        src="https://albaniannight.com/wp-content/uploads/2025/05/Grama-Bay-in-Karaburun-Peninsula-min-scaled.jpeg"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", zIndex: 0 }}
      />

      <div style={{ position: "absolute", inset: 0, background: mob ? "linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.4) 60%, transparent 100%)" : "linear-gradient(to right, rgba(15,23,42,0.84) 0%, rgba(15,23,42,0.55) 55%, rgba(15,23,42,0.22) 100%)", zIndex: 1 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: mob ? 200 : 130, background: "linear-gradient(to top, #F0FDFA, transparent)", zIndex: 2 }} />
      <div style={{ position: "relative", zIndex: 3, maxWidth: 1100, margin: "0 auto", padding: mob ? "0 20px 80px" : "0 32px", width: "100%" }}>
        <div style={{ maxWidth: mob ? "100%" : 580 }}>
          <h1 style={{ fontFamily: SANS, fontWeight: 900, fontSize: mob ? 34 : 50, color: "#fff", lineHeight: 1.1, margin: "0 0 14px", letterSpacing: "-0.02em" }}>{t.heroTitle}</h1>
          <p style={{ fontSize: mob ? 15 : 17, color: "rgba(255,255,255,0.78)", lineHeight: 1.6, margin: "0 0 26px", maxWidth: 480 }}>{t.heroSub}</p>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "auto auto auto", gap: 8, marginBottom: 24 }}>
            {[
              { Icon: ShieldCheck, l: "Pay in Albanian Lek" },
              { Icon: Users,       l: "24/7 support" },
              { Icon: Star,        l: "Visa + stay + transport" },
            ].map(({ Icon, l }) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 8, padding: "8px 10px" }}>
                <Icon size={12} color="#6EE7B7" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", fontFamily: SANS, lineHeight: 1.3 }}>{l}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "auto auto", gap: 10 }}>
            <button onClick={onPlan} style={{ padding: "15px 20px", borderRadius: 12, border: "none", background: C.accent, color: "#fff", fontSize: mob ? 14 : 15, fontWeight: 700, cursor: "pointer", fontFamily: SANS, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, minHeight: 50 }}>
              <MapPin size={16} /> {t.heroCta}
            </button>
            <button onClick={onTrack} style={{ padding: "15px 16px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: mob ? 14 : 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS, backdropFilter: "blur(6px)", minHeight: 50 }}>
              {t.navTrack}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile bottom nav ────────────────────────────────────────────────────────
function MobileBottomNav({ page, setPage, scrollTo, t }: {
  page: "home" | "track"; setPage: (p: "home" | "track") => void;
  scrollTo: (id: string) => void; t: typeof T["en"];
}) {
  const tabs = [
    { key: "home",  Icon: Home,     label: "Home",    action: () => { setPage("home"); window.scrollTo({ top: 0, behavior: "smooth" }); } },
    { key: "plan",  Icon: MapPin,   label: t.heroCta, action: () => { setPage("home"); setTimeout(() => scrollTo("interests"), 80); } },
    { key: "apply", Icon: FileText, label: "Apply",   action: () => { setPage("home"); setTimeout(() => scrollTo("form-section"), 80); } },
    { key: "track", Icon: Search,   label: "Track",   action: () => setPage("track") },
  ] as const;
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 300, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", borderTop: `1px solid ${C.border}`, display: "flex", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {tabs.map(tab => {
        const Icon = tab.Icon;
        const active = (tab.key === "track" && page === "track") || (tab.key === "home" && page === "home");
        return (
          <button key={tab.key} onClick={tab.action}
            style={{ flex: 1, padding: "10px 4px 8px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minHeight: 56 }}>
            <Icon size={20} color={active ? C.accent : C.mutedLight} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? C.accent : C.mutedLight, fontFamily: SANS }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
const App = () => {
  const mob = useMobile();
  const [lang, setLang]         = useState<Lang>("en");
  const [page, setPage]         = useState<"home" | "track">("home");
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);

  // Builder state
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [selectedEntry,     setSelectedEntry]     = useState("tia");
  const [cityStays,         setCityStays]         = useState<CityStay[]>([]);
  const [selectedBudget,    setSelectedBudget]    = useState("");
  const [departureCountry,  setDepartureCountry]  = useState("");
  const [fullTripFlow,      setFullTripFlow]      = useState(false);

  const toggleInterest = (id: string) => {
    if (id === FULL_TRIP_INTEREST_ID) {
      if (selectedInterests.has(FULL_TRIP_INTEREST_ID)) {
        setFullTripFlow(false);
        setSelectedInterests(new Set());
        setCityStays([]);
        return;
      }
      setFullTripFlow(true);
      setSelectedInterests(new Set(FULL_TRIP_BUNDLE));
      setCityStays([]);
      setSelectedBudget("");
      setTimeout(() => scrollTo("route"), 80);
      return;
    }

    setFullTripFlow(false);
    setSelectedInterests(p => {
      const n = new Set(p);
      n.delete(FULL_TRIP_INTEREST_ID);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!document.getElementById("travel-fonts")) {
      const l = document.createElement("link");
      l.id = "travel-fonts"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;600;700&display=swap";
      document.head.appendChild(l);
    }
    if (!document.getElementById("travel-mobile-css")) {
      const s = document.createElement("style");
      s.id = "travel-mobile-css";
      s.textContent = `
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
        html,body{overflow-x:hidden;scroll-behavior:smooth}
        input,select,textarea{font-size:16px!important}
        button{touch-action:manipulation}
        ::-webkit-scrollbar{display:none}
      `;
      document.head.appendChild(s);
    }
    getSettingsByArea("travel").then(s => { if (s) setSettings(s as unknown as Record<string, string>); }).catch(() => {});
  }, []);

  const t   = T[lang];
  const dir = t.dir;
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const P = mob ? "16px" : "32px"; // side padding shorthand

  return (
    <div style={{ fontFamily: SANS, background: C.bg, color: C.ink, minHeight: "100vh" }} dir={dir}>
      <SeoHead
        title="Travel Services in Albania | Airport Transfers, Tours & Car Rentals"
        description="Plan your trip to Albania with airport transfers, private tours, car rentals, chauffeur services, travel planning and business travel support."
        canonicalPath="/travel"
        keywords={["travel services in Albania", "airport transfer in Albania", "private tours Albania", "car rental Tirana", "Kayrosco Travel"]}
      />

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, background: navScrolled ? "rgba(255,255,255,0.97)" : "rgba(240,253,250,0.88)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${navScrolled ? C.border : "transparent"}`, boxShadow: navScrolled ? sh : "none", transition: "all 0.2s", padding: `0 ${P}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: SANS, fontWeight: 800, fontSize: mob ? 16 : 19, color: C.ink, letterSpacing: "-0.02em" }}>
            KAYROSCO <span style={{ color: C.accent }}>TRAVEL</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: mob ? 6 : 10 }}>
            <LangSwitcher lang={lang} setLang={setLang} />
            {!mob && (
              <>
                <div style={{ width: 1, height: 22, background: C.border }} />
                {page === "home" ? (
                  <button onClick={() => setPage("track")} style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: "none", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: SANS, display: "flex", alignItems: "center", gap: 6 }}>
                    <Search size={13} /> {t.navTrack}
                  </button>
                ) : (
                  <button onClick={() => setPage("home")} style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: "none", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                    ← {t.navStart}
                  </button>
                )}
                <button onClick={() => { setPage("home"); setTimeout(() => scrollTo("form-section"), 100); }}
                  style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
                  {t.navStart}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {page === "track" ? (
        <div style={{ paddingTop: 56, paddingBottom: mob ? 72 : 0 }}><TrackApplication lang={lang} /></div>
      ) : (
        <>
          <div style={{ paddingTop: 56 }}>
            <HeroSection lang={lang} onPlan={() => scrollTo("interests")} onTrack={() => setPage("track")} />
          </div>

          {/* What are you looking for */}
          <section id="interests" style={{ padding: mob ? "52px 16px" : "80px 32px", background: C.white, borderTop: `1px solid ${C.border}` }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: mob ? 28 : 44 }}>
                <STag><Compass size={12} /> {t.whatTitle}</STag>
                <h2 style={{ fontFamily: SANS, fontWeight: 800, fontSize: mob ? 24 : 34, color: C.ink, margin: "12px 0 8px", letterSpacing: "-0.02em" }}>{t.whatTitle}</h2>
                <p style={{ fontSize: 14, color: C.muted, margin: "0 auto", fontFamily: SANS }}>{t.whatSub}</p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: mob ? 9 : 12 }}>
                {INTERESTS.map(item => (
                  <div
                    key={item.id}
                    style={{
                      width: mob ? "calc(50% - 5px)" : "calc(20% - 10px)",
                      minWidth: mob ? "calc(50% - 5px)" : 180,
                      maxWidth: mob ? "calc(50% - 5px)" : 210,
                      display: "flex",
                    }}
                  >
                    <InterestCard item={item} selected={selectedInterests.has(item.id)} onToggle={() => toggleInterest(item.id)} lang={lang} />
                  </div>
                ))}
              </div>
              {selectedInterests.size > 0 && (
                <div style={{ marginTop: 14, padding: "10px 14px", background: C.accentTint, borderRadius: 10, border: `1px solid ${C.accentMid}`, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, fontFamily: SANS }}>
                    {fullTripFlow ? "Full Trip package selected:" : `${selectedInterests.size} selected:`}
                  </span>
                  {INTERESTS.filter(i => selectedInterests.has(i.id)).filter(i => !fullTripFlow || i.id === FULL_TRIP_INTEREST_ID).map(i => (
                    <span key={i.id} style={{ fontSize: 11, padding: "2px 9px", borderRadius: 100, background: C.accent, color: "#fff", fontFamily: SANS, fontWeight: 600 }}>{i.en}</span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Route planner */}
          <section id="route" style={{ padding: mob ? "52px 16px" : "80px 32px", background: C.section, borderTop: `1px solid ${C.border}` }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: mob ? 28 : 44 }}>
                <STag><Route size={12} /> {t.routeTitle}</STag>
                <h2 style={{ fontFamily: SANS, fontWeight: 800, fontSize: mob ? 24 : 34, color: C.ink, margin: "12px 0 8px", letterSpacing: "-0.02em" }}>{t.routeTitle}</h2>
                <p style={{ fontSize: 14, color: C.muted, maxWidth: 520, margin: "0 auto", fontFamily: SANS }}>{t.routeSub}</p>
              </div>
              <RoutePlanner
                lang={lang}
                cityStays={cityStays}
                onCityStaysChange={setCityStays}
                selectedEntry={selectedEntry}
                onEntryChange={setSelectedEntry}
                onDepartureChange={setDepartureCountry}
                fullTripOnly={fullTripFlow}
                onFullTripContinue={(stays) => {
                  if (stays.length) setCityStays(stays);
                  setTimeout(() => scrollTo("form-section"), 80);
                }}
              />
            </div>
          </section>

          {/* Budget */}
          {!fullTripFlow && <section id="budget" style={{ padding: mob ? "52px 16px" : "80px 32px", background: C.white, borderTop: `1px solid ${C.border}` }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: mob ? 28 : 44 }}>
                <STag><CreditCard size={12} /> {t.budgetTitle}</STag>
                <h2 style={{ fontFamily: SANS, fontWeight: 800, fontSize: mob ? 24 : 34, color: C.ink, margin: "12px 0 8px", letterSpacing: "-0.02em" }}>{t.budgetTitle}</h2>
                <p style={{ fontSize: 14, color: C.muted, fontFamily: SANS }}>{t.budgetSub}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10 }}>
                {BUDGETS.map(b => {
                  const sel = selectedBudget === b.key;
                  const label = b[lang as "en" | "tr" | "ar"] as string;
                  return (
                    <button key={b.key} onClick={() => setSelectedBudget(sel ? "" : b.key)}
                      style={{ padding: mob ? "18px 10px" : "22px 12px", borderRadius: 14, border: `2px solid ${sel ? b.color : C.border}`, background: sel ? `${b.color}12` : C.white, cursor: "pointer", textAlign: "center", boxShadow: sel ? shMd : sh, transition: "all 0.15s", minHeight: 44 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.color, margin: "0 auto 10px" }} />
                      <p style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, color: sel ? b.color : C.ink, margin: "0 0 3px" }}>{label}</p>
                      <p style={{ fontFamily: SANS, fontSize: 10, color: C.muted, margin: 0, lineHeight: 1.4 }}>{b.sub}</p>
                      {sel && <div style={{ marginTop: 7 }}><Check size={12} color={b.color} style={{ display: "inline" }} /></div>}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 18 }}><LekBanner lang={lang} /></div>
            </div>
          </section>}

          {/* Application form */}
          <section id="form-section" style={{ padding: mob ? "52px 16px 120px" : "80px 32px", background: C.section, borderTop: `1px solid ${C.border}` }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1.45fr", gap: mob ? 28 : 52, alignItems: "start" }}>
              {!mob && <div style={{ paddingTop: 8 }}>
                <STag><FileText size={12} /> {t.formTitle}</STag>
                <h2 style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: C.ink, margin: "18px 0 12px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>{t.formTitle}</h2>
                <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: "0 0 28px", fontFamily: SANS }}>{t.formSub}</p>

                {/* Your selections so far */}
                {(selectedInterests.size > 0 || cityStays.length > 0 || selectedBudget) && (
                  <div style={{ background: C.white, borderRadius: 14, padding: "18px", border: `1px solid ${C.border}`, boxShadow: sh, marginBottom: 20 }}>
                    <p style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px", fontFamily: MONO }}>Your plan so far</p>
                    {cityStays.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.ink2, margin: "0 0 5px", fontFamily: SANS }}>Route</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {cityStays.map(s => {
                            const city = CITIES.find(c => c.id === s.cityId);
                            const name = city ? (city[lang as "en" | "tr" | "ar"] as string) : s.cityId;
                            return <span key={s.cityId} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 100, background: C.accentMid, color: C.accent, fontWeight: 600, fontFamily: SANS }}>{name} · {s.days}d</span>;
                          })}
                        </div>
                      </div>
                    )}
                    {selectedInterests.size > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.ink2, margin: "0 0 5px", fontFamily: SANS }}>Services</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {INTERESTS.filter(i => selectedInterests.has(i.id)).map(i => <span key={i.id} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 100, background: C.accentMid, color: C.accent, fontWeight: 600, fontFamily: SANS }}>{i.en}</span>)}
                        </div>
                      </div>
                    )}
                    {selectedBudget && <p style={{ fontSize: 12, color: C.ink, fontWeight: 600, margin: 0, fontFamily: SANS }}>Budget: {BUDGETS.find(b => b.key === selectedBudget)?.en} · {BUDGETS.find(b => b.key === selectedBudget)?.sub}</p>}
                  </div>
                )}

                {/* Trust indicators */}
                {[
                  { Icon: ShieldCheck, l: "Response within 24 hours" },
                  { Icon: CreditCard,  l: "Invoiced in Albanian Lek (ALL)" },
                  { Icon: Globe,       l: "Support in EN · TR · AR" },
                  { Icon: Users,       l: "Personal advisor assigned" },
                ].map(({ Icon, l }) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 14px", background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: sh, marginBottom: 9 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: C.accentTint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={15} color={C.accent} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.ink2, fontFamily: SANS }}>{l}</span>
                  </div>
                ))}
              </div>}

              <ApplicationForm
                lang={lang}
                preInterests={selectedInterests}
                selectedEntry={selectedEntry}
                cityStays={cityStays}
                preBudget={selectedBudget}
                departureCountry={departureCountry}
              />
            </div>
          </section>
        </>
      )}

      <Footer settings={settings} lang={lang} />

      {mob && (
        <MobileBottomNav
          page={page}
          setPage={setPage}
          scrollTo={scrollTo}
          t={t}
        />
      )}
    </div>
  );
};

export default App;

