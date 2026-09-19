import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SiteLanguage = "en" | "ar" | "tr";

type TranslationMap = Record<string, string>;

const translations: Record<SiteLanguage, TranslationMap> = {
  en: {},
  tr: {
    Home: "Ana Sayfa", "About Us": "Hakkımızda", Contact: "İletişim", Companies: "Şirketler",
    "Kayrosco Tech": "Kayrosco Tech", "Tech Solutions": "Teknoloji Çözümleri", "Software & cloud systems": "Yazılım ve bulut sistemleri",
    "Technology. Driven by Vision.": "Vizyonla şekillenen teknoloji.", "Take a Closer Look →": "Daha Yakından İncele →",
    "Technology solutions designed to help your business move forward.": "İşinizi ileri taşımak için tasarlanmış teknoloji çözümleri.", "Why Kayrosco?": "Neden Kayrosco?",
    "Local knowledge, global standards. One trusted partner for everything Albania.": "Yerel bilgi, küresel standartlar. Arnavutluk'ta her şey için güvenilir ortağınız.",
    "Local Roots, Global Reach": "Yerel Kökler, Küresel Erişim", "One Partner, Three Disciplines": "Tek Ortak, Üç Uzmanlık",
    "Transparent & Accountable": "Şeffaf ve Sorumlu", "Platforms & Services": "Platformlar ve Hizmetler",
    "Building the future": "Geleceği inşa ediyoruz", "Delivering real impact": "Gerçek etki yaratıyoruz", "Bold solutions. Real impact.": "Cesur çözümler. Gerçek etki.", "Kayrosco Tech delivers technology projects across industries and borders.": "Kayrosco Tech farklı sektörlerde ve sınırlar arasında teknoloji projeleri sunar.",
    "All you need in one place.": "İhtiyacınız olan her şey tek yerde.", "50+ Projects Delivered Across Albania!": "Arnavutluk'ta 50+ proje teslim edildi!",
    "We build technology that creates value and drives progress.": "Değer yaratan ve ilerlemeyi sağlayan teknoloji geliştiriyoruz.", "Explore Kayrosco Tech": "Kayrosco Tech'i Keşfet",
    "Building Success Starts Here": "Başarı Burada Başlar", "Get in Touch →": "İletişime Geçin →", "Send Request": "Talep Gönder",
    "Travel Services": "Seyahat Hizmetleri", Consulting: "Danışmanlık", Partners: "Ortaklar",
    Services: "Hizmetler", Process: "Süreç", "Case Studies": "Vaka Çalışmaları", Blog: "Blog", "Let's Talk": "Konuşalım",
    "Powered by": "Güç veren", "Senior-built software. Shipped in weeks.": "Kıdemli mühendislerle yazılım. Haftalar içinde teslim.",
    "Start Your Project": "Projenizi Başlatın", "Explore Services": "Hizmetleri Keşfet", "Built with the": "En iyi teknolojiyle", "best in the stack": "geliştirildi",
    Stack: "Teknoloji Yığını", "A modern, reliable engineering stack.": "Modern ve güvenilir mühendislik teknolojileri.",
    "How we work": "Nasıl çalışıyoruz", "A simple delivery flow with clear ownership from planning to launch.": "Planlamadan lansmana kadar net sorumluluklarla basit teslim süreci.",
    Projects: "Projeler", "Projects available": "Mevcut projeler", "Show details": "Detayları göster", "Hide details": "Detayları gizle", "View Project": "Projeyi Görüntüle",
    "Why Us": "Neden Biz", "Built for quality, speed, and ownership.": "Kalite, hız ve sahiplik için tasarlandı.", "Trusted by innovative companies": "Yenilikçi şirketlerin güvendiği",
    FAQ: "SSS", "Common questions, answered clearly.": "Yaygın sorulara net cevaplar.", "Get Started": "Başlayın", "Start your next tech project with a cleaner process.": "Bir sonraki teknoloji projenize daha temiz bir süreçle başlayın.",
    "Share your scope and we will follow up with the next technical steps.": "Kapsamınızı paylaşın, sonraki teknik adımlarla size dönelim.", "Full name": "Ad Soyad", Phone: "Telefon", Email: "E-posta", Company: "Şirket", "Budget range": "Bütçe aralığı", Timeline: "Zaman çizelgesi", "Project details": "Proje detayları", "Sending...": "Gönderiliyor...",
  },
  ar: {
    Home: "الرئيسية", "About Us": "من نحن", Contact: "اتصل بنا", Companies: "الشركات",
    "Kayrosco Tech": "كايروسكو تك", "Tech Solutions": "حلول تقنية", "Software & cloud systems": "برمجيات وأنظمة سحابية",
    "Technology. Driven by Vision.": "تكنولوجيا تقودها الرؤية.", "Take a Closer Look →": "اكتشف المزيد →", "Technology solutions designed to help your business move forward.": "حلول تقنية مصممة لدفع أعمالك إلى الأمام.", "Why Kayrosco?": "لماذا كايروسكو؟",
    "Local knowledge, global standards. One trusted partner for everything Albania.": "معرفة محلية، معايير عالمية. شريك موثوق لكل ما تحتاجه في ألبانيا.", "Local Roots, Global Reach": "جذور محلية، انتشار عالمي", "One Partner, Three Disciplines": "شريك واحد، ثلاثة تخصصات", "Transparent & Accountable": "شفافية ومسؤولية", "Platforms & Services": "المنصات والخدمات",
    "Building the future": "نبني المستقبل", "Delivering real impact": "نحقق تأثيراً حقيقياً", "Bold solutions. Real impact.": "حلول جريئة. تأثير حقيقي.", "Kayrosco Tech delivers technology projects across industries and borders.": "تقدم كايروسكو تك مشاريع تقنية عبر القطاعات والحدود.", "All you need in one place.": "كل ما تحتاجه في مكان واحد.", "50+ Projects Delivered Across Albania!": "تم إنجاز أكثر من 50 مشروعاً في ألبانيا!", "We build technology that creates value and drives progress.": "نبني تكنولوجيا تصنع القيمة وتدفع التقدم.", "Explore Kayrosco Tech": "اكتشف كايروسكو تك",
    "Building Success Starts Here": "النجاح يبدأ هنا", "Get in Touch →": "تواصل معنا →", "Send Request": "إرسال الطلب", "Travel Services": "خدمات السفر", Consulting: "الاستشارات", Partners: "الشركاء",
    Services: "الخدمات", Process: "العملية", "Case Studies": "دراسات الحالة", Blog: "المدونة", "Let's Talk": "لنتحدث", "Powered by": "مدعوم بواسطة", "Senior-built software. Shipped in weeks.": "برمجيات يبنيها خبراء وتُسلّم خلال أسابيع.", "Start Your Project": "ابدأ مشروعك", "Explore Services": "استكشف الخدمات", "Built with the": "مبني باستخدام", "best in the stack": "أفضل التقنيات",
    Stack: "التقنيات", "A modern, reliable engineering stack.": "مجموعة تقنيات حديثة وموثوقة.", "How we work": "كيف نعمل", "A simple delivery flow with clear ownership from planning to launch.": "مسار تسليم بسيط بمسؤولية واضحة من التخطيط إلى الإطلاق.", Projects: "المشاريع", "Projects available": "المشاريع المتاحة", "Show details": "عرض التفاصيل", "Hide details": "إخفاء التفاصيل", "View Project": "عرض المشروع", "Why Us": "لماذا نحن", "Built for quality, speed, and ownership.": "مصمم للجودة والملكية.", "Trusted by innovative companies": "موثوق به من الشركات المبتكرة", FAQ: "الأسئلة الشائعة", "Common questions, answered clearly.": "إجابات واضحة عن الأسئلة الشائعة.", "Get Started": "ابدأ الآن", "Start your next tech project with a cleaner process.": "ابدأ مشروعك التقني القادم بعملية أوضح.", "Share your scope and we will follow up with the next technical steps.": "شاركنا نطاق مشروعك وسنتابع معك بالخطوات التقنية التالية.", "Full name": "الاسم الكامل", Phone: "الهاتف", Email: "البريد الإلكتروني", Company: "الشركة", "Budget range": "نطاق الميزانية", Timeline: "الجدول الزمني", "Project details": "تفاصيل المشروع", "Sending...": "جارٍ الإرسال...",
  },
};

type SiteLanguageContextValue = { language: SiteLanguage; setLanguage: (language: SiteLanguage) => void; t: (text: string) => string };
const SiteLanguageContext = createContext<SiteLanguageContextValue | null>(null);

export function SiteLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SiteLanguage>(() => (localStorage.getItem("kayrosco-language") as SiteLanguage) || "en");
  const setLanguage = (next: SiteLanguage) => { setLanguageState(next); localStorage.setItem("kayrosco-language", next); };
  const value = useMemo(() => ({ language, setLanguage, t: (text: string) => translations[language][text] || text }), [language]);
  useEffect(() => { document.documentElement.lang = language; document.documentElement.dir = "ltr"; }, [language]);
  return <SiteLanguageContext.Provider value={value}>{children}</SiteLanguageContext.Provider>;
}

export function useSiteLanguage() {
  const context = useContext(SiteLanguageContext);
  if (!context) throw new Error("useSiteLanguage must be used within SiteLanguageProvider");
  return context;
}

export function LanguagePill({ dark = false }: { dark?: boolean }) {
  const { language, setLanguage } = useSiteLanguage();
  return <div className={`language-pill ${dark ? "language-pill-dark" : ""}`} aria-label="Language selector">
    {(["en", "ar", "tr"] as SiteLanguage[]).map((item) => <button key={item} type="button" onClick={() => setLanguage(item)} className={language === item ? "active" : ""}>{item.toUpperCase()}</button>)}
  </div>;
}
