import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowLeftRight,
  BookOpen,
  Bot,
  Boxes,
  CalendarDays,
  ChartColumn,
  ChartLine,
  ChevronDown,
  Circle,
  CircleDashed,
  Flag,
  Gem,
  Globe,
  Layers,
  Microscope,
  Pickaxe,
  Search,
  Ship,
  Truck,
  Map,
  X,
} from "lucide-react";
import { LanguageContext, ThemeContext } from "../App";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
// countryService removed — local stub to avoid external service usage in pages
const getCountries = async () => [];
import i7 from "../assets/i-7.png";
import im1 from "../assets/وزارة-الصناعة-والمعادن-دولة-ليبيا-removebg-preview.png";
import im2 from "../assets/وزارة-الصناعة-والتجارة-الجمهورية-اليمنية-removebg-preview.png";

import bgHeaderVideo from "../assets/bg.mp4";
import flagJordan from "../assets/flags/jordan.webp";
import flagUae from "../assets/flags/uae.webp";
import flagBahrain from "../assets/flags/bahrain.webp";
import flagTunisia from "../assets/flags/tunisia.webp";
import flagAlgeria from "../assets/flags/algeria.webp";
import flagDjibouti from "../assets/flags/djibouti.webp";
import flagSaudi from "../assets/flags/saudiarabe.webp";
import flagSudan from "../assets/flags/sudan.webp";
import flagSyria from "../assets/flags/syria.webp";
import flagSomalia from "../assets/flags/somalia.webp";
import flagIraq from "../assets/flags/iraq.webp";
import flagOman from "../assets/flags/oman.webp";
import flagPalestine from "../assets/flags/palestine.webp";
import flagQatar from "../assets/flags/qatar.webp";
import flagKuwait from "../assets/flags/kuwait.webp";
import flagLebanon from "../assets/flags/lebanon.webp";
import flagLibya from "../assets/flags/libya.webp";
import flagEgypt from "../assets/flags/egypt.webp";
import flagMorocco from "../assets/flags/morocco.webp";
import flagMauritania from "../assets/flags/mauritania.webp";
import flagYemen from "../assets/flags/yemen.webp";
import { dataByMineral } from "./M1";

const REFERENCES_AUTO_SLIDE_MS = 4500;

const REFERENCE_SLIDE_BG_DARK = "linear-gradient(160deg,#0e4238 0%,#082c23 55%,#051a15 100%)";

function ReferenceCarouselCard({ item }) {
  const { isDarkMode } = useContext(ThemeContext);
  const slideBg = isDarkMode ? REFERENCE_SLIDE_BG_DARK : "white";
  const slideBorder = isDarkMode ? "rgba(201,168,76,0.22)" : "rgba(8,39,33,0.08)";

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="sponsor-card reference-slide-card"
      style={{
        height: 170,
        borderRadius: 13,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        padding: 10,
        background: slideBg,
        border: `1px solid ${slideBorder}`,
      }}
    >
      {item.img ? (
        <>
          <img src={item.img} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 12 }} />
          <div
            className="sponsor-hover"
            style={{
              position: "absolute",
              inset: 0,
              background: isDarkMode ? "rgba(7,22,17,0.96)" : "rgba(255,255,255,0.97)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.3s",
              padding: 12,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "0.82rem", fontWeight: 800, color: isDarkMode ? "#efe8d4" : "var(--forest)", margin: "0 0 4px" }}>{item.title}</p>
            <p style={{ fontSize: "0.72rem", color: isDarkMode ? "rgba(239,232,212,0.65)" : "var(--muted)", margin: 0 }}>{item.subtitle}</p>
          </div>
        </>
      ) : (
        <div
          className="reference-slide-inner"
          style={{
            width: "100%",
            height: "100%",
            border: `1px solid ${slideBorder}`,
            borderRadius: 12,
            background: slideBg,
            padding: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: "0.72rem", color: isDarkMode ? "rgba(239,232,212,0.55)" : "var(--muted)", fontWeight: 700 }}>{item.title}</p>
            <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: isDarkMode ? "#efe8d4" : "var(--forest)", fontWeight: 800, lineHeight: 1.45 }}>{item.subtitle}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {(item.emails || []).slice(0, 2).map((email) => (
              <span
                key={email}
                style={{
                  fontSize: "0.7rem",
                  color: isDarkMode ? "#c9a84c" : "var(--forest-mid)",
                  textDecoration: "underline",
                  wordBreak: "break-all",
                }}
              >
                {email}
              </span>
            ))}
          </div>
        </div>
      )}
    </a>
  );
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const countryFlags = {
  jo: flagJordan, ae: flagUae,   bh: flagBahrain,  tn: flagTunisia,
  dz: flagAlgeria, dj: flagDjibouti, sa: flagSaudi, sd: flagSudan,
  sy: flagSyria,  so: flagSomalia, iq: flagIraq,   om: flagOman,
  ps: flagPalestine, qa: flagQatar, kw: flagKuwait, lb: flagLebanon,
  ly: flagLibya,  eg: flagEgypt,  ma: flagMorocco, mr: flagMauritania,
  ye: flagYemen,
};

const countries = [
  { name: "المملكة الأردنية الهاشمية",                   code: "jo" },
  { name: "دولة الإمارات العربية المتحدة",                code: "ae" },
  { name: "مملكة البحرين",                               code: "bh" },
  { name: "الجمهورية التونسية",                          code: "tn" },
  { name: "الجمهورية الجزائرية الديمقراطية الشعبية",     code: "dz" },
  { name: "جمهورية جيبوتي",                                code: "dj" },
  { name: "المملكة العربية السعودية",                    code: "sa" },
  { name: "جمهورية السودان",                             code: "sd" },
  { name: "الجمهورية العربية السورية",                   code: "sy" },
  { name: "جمهورية الصومال",                             code: "so" },
  { name: "جمهورية العراق",                              code: "iq" },
  { name: "سلطنة عُمان",                                code: "om" },
  { name: "دولة فلسطين",                                code: "ps" },
  { name: "دولة قطر",                                   code: "qa" },
  { name: "دولة الكويت",                                code: "kw" },
  { name: "الجمهورية اللبنانية",                        code: "lb" },
  { name: "دولة ليبيا",                                 code: "ly" },
  { name: "جمهورية مصر العربية",                        code: "eg" },
  { name: "المملكة المغربية",                           code: "ma" },
  { name: "الجمهورية الإسلامية الموريتانية",             code: "mr" },
  { name: "الجمهورية اليمنية",                          code: "ye" },
];

const sponsors = [
  {
    href: "https://csc.gov.ly/portfolio/%D9%88%D8%B2%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D8%B5%D9%86%D8%A7%D8%B9%D8%A9-%D9%88%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D8%AF%D9%86/",
    img: im1,
    title: { ar: "دولــة لـيـبـيـا", fr: "État de Libye", en: "State of Libya" },
    subtitle: { ar: "وزارة الصناعة والمعادن", fr: "Ministère de l'Industrie et des Mines", en: "Ministry of Industry and Mines" },
  },
  {
    href: "https://mom-ye.com/site-ar/",
    img: im2,
    title: { ar: "الجمهورية اليمنية", fr: "République du Yémen", en: "Republic of Yemen" },
    subtitle: { ar: "وزارة النفط والمعادن", fr: "Ministère du Pétrole et des Minerais", en: "Ministry of Oil and Minerals" },
  },
  {
    href: "https://www.mim.gov.sa/ar",
    img: i7,
    title: { ar: "المملكة العربية السعودية", fr: "Royaume d'Arabie saoudite", en: "Kingdom of Saudi Arabia" },
    subtitle: { ar: "وزارة المعادن والصناعة", fr: "Ministère de l'Industrie et des Ressources minérales", en: "Ministry of Industry and Mineral Resources" },
  },
];

const officialContacts = [
  { code: "jo", city: { ar: "عمان", fr: "Amman", en: "Amman" }, ministry: { ar: "وزارة الطاقة والثروة المعدنية", fr: "Ministère de l'Énergie et des Ressources minières", en: "Ministry of Energy and Mineral Resources" }, emails: ["memr@memr.gov.jo"] },
  { code: "ae", city: { ar: "أبوظبي", fr: "Abou Dabi", en: "Abu Dhabi" }, ministry: { ar: "وزارة الطاقة والبنية التحتية", fr: "Ministère de l'Énergie et de l'Infrastructure", en: "Ministry of Energy and Infrastructure" }, emails: ["Archive.section@moei.gov.ae", "info@moei.gov.ae"] },
  { code: "bh", city: { ar: "المنامة", fr: "Manama", en: "Manama" }, ministry: { ar: "وزارة الصناعة والتجارة", fr: "Ministère de l'Industrie et du Commerce", en: "Ministry of Industry and Commerce" }, emails: ["minoffice@moic.gov.bh"] },
  { code: "tn", city: { ar: "تونس", fr: "Tunis", en: "Tunis" }, ministry: { ar: "وزارة الصناعة والمناجم والطاقة", fr: "Ministère de l'Industrie, des Mines et de l'Énergie", en: "Ministry of Industry, Mines and Energy" }, emails: ["contact@energiemines.gov.tn"] },
  { code: "dz", city: { ar: "الجزائر", fr: "Alger", en: "Algiers" }, ministry: { ar: "وزارة المحروقات والمناجم", fr: "Ministère de l'Énergie et des Mines", en: "Ministry of Energy and Mines" }, emails: ["contact@energy.gov.dz", "sofiane.ouffa@energy.gov.dz"] },
  { code: "dj", city: { ar: "جيبوتي", fr: "Djibouti", en: "Djibouti" }, ministry: { ar: "وزارة الطاقة المكلف بالموارد الطبيعية", fr: "Ministère de l'Énergie chargé des ressources naturelles", en: "Ministry of Energy in charge of Natural Resources" }, emails: ["contact@mern-gouv.com", "cabinet@energie.gouv.dj"] },
  { code: "sa", city: { ar: "الرياض", fr: "Riyad", en: "Riyadh" }, ministry: { ar: "وزارة الصناعة والثروة المعدنية", fr: "Ministère de l'Industrie et des Ressources minérales", en: "Ministry of Industry and Mineral Resources" }, emails: ["info@mim.gov.sa"] },
  { code: "sd", city: { ar: "الخرطوم", fr: "Khartoum", en: "Khartoum" }, ministry: { ar: "وزارة المعادن", fr: "Ministère des Minerais", en: "Ministry of Minerals" }, emails: ["info@minerals.gov.sd"] },
  { code: "sy", city: null, ministry: { ar: "وزارة الطاقة", fr: "Ministère de l'Énergie", en: "Ministry of Energy" }, emails: ["info@mopmr.gov.sy"] },
  { code: "so", city: { ar: "مقديشو", fr: "Mogadiscio", en: "Mogadishu" }, ministry: { ar: "وزارة البترول والثروة المعدنية", fr: "Ministère du Pétrole et des Ressources minières", en: "Ministry of Petroleum and Mineral Resources" }, emails: ["dg@mopmr.gov.so"] },
  { code: "iq", city: { ar: "بغداد", fr: "Bagdad", en: "Baghdad" }, ministry: { ar: "وزارة الصناعة والمعادن", fr: "Ministère de l'Industrie et des Minerais", en: "Ministry of Industry and Minerals" }, emails: ["invest@industry.gov.iq", "minister@industry.gov.iq"] },
  { code: "om", city: { ar: "مسقط", fr: "Mascate", en: "Muscat" }, ministry: { ar: "وزارة الطاقة والمعادن", fr: "Ministère de l'Énergie et des Minerais", en: "Ministry of Energy and Minerals" }, emails: ["info@mog.gov.om"] },
  { code: "ps", city: { ar: "رام الله", fr: "Ramallah", en: "Ramallah" }, ministry: { ar: "وزارة الصناعة", fr: "Ministère de l'Industrie", en: "Ministry of Industry" }, emails: ["manalf@met.gov.ps", "m.farhan@mind.gov.ps", "minister.office@met.gov.ps"] },
  { code: "qa", city: { ar: "الدوحة", fr: "Doha", en: "Doha" }, ministry: { ar: "وزارة التجارة والصناعة", fr: "Ministère du Commerce et de l'Industrie", en: "Ministry of Commerce and Industry" }, emails: ["salbraidi@moci.gov.qa"] },
  { code: "kw", city: { ar: "الكويت", fr: "Koweït", en: "Kuwait City" }, ministry: { ar: "وزارة التجارة والصناعة", fr: "Ministère du Commerce et de l'Industrie", en: "Ministry of Commerce and Industry" }, emails: ["indust@pai.gov.kw"] },
  { code: "lb", city: { ar: "بيروت", fr: "Beyrouth", en: "Beirut" }, ministry: { ar: "وزارة الطاقة والمياه", fr: "Ministère de l'Énergie et de l'Eau", en: "Ministry of Energy and Water" }, emails: ["minister@energyandwater.gov.lb", "mew@terra.net.lb"] },
  { code: "ly", city: null, ministry: { ar: "وزارة الصناعة والمعادن", fr: "Ministère de l'Industrie et des Mines", en: "Ministry of Industry and Mines" }, emails: ["masnaili@yahoo.com", "info2@industry.gov.ly"] },
  { code: "eg", city: { ar: "القاهرة", fr: "Le Caire", en: "Cairo" }, ministry: { ar: "وزارة البترول والثروة المعدنية", fr: "Ministère du Pétrole et des Ressources minières", en: "Ministry of Petroleum and Mineral Resources" }, emails: ["contact@petroleum.gov.eg"] },
  { code: "ma", city: { ar: "الرباط", fr: "Rabat", en: "Rabat" }, ministry: { ar: "وزارة الانتقال الطاقي والتنمية المستدامة", fr: "Ministère de la Transition énergétique et du Développement durable", en: "Ministry of Energy Transition and Sustainable Development" }, emails: ["ministre@mem.gov.ma"] },
  { code: "mr", city: { ar: "نواكشوط", fr: "Nouakchott", en: "Nouakchott" }, ministry: { ar: "وزارة المعادن والصناعة", fr: "Ministère des Mines et de l'Industrie", en: "Ministry of Mines and Industry" }, emails: ["contact.mpemi@gmail.com"] },
  { code: "ye", city: null, ministry: { ar: "وزارة النفط والمعادن", fr: "Ministère du Pétrole et des Minerais", en: "Ministry of Oil and Minerals" }, emails: ["info@mom-ye.com"] },
];

const COUNTRY_LABELS = {
  jo: { ar: "المملكة الأردنية الهاشمية", fr: "Royaume hachémite de Jordanie", en: "Hashemite Kingdom of Jordan" },
  ae: { ar: "دولة الإمارات العربية المتحدة", fr: "Émirats arabes unis", en: "United Arab Emirates" },
  bh: { ar: "مملكة البحرين", fr: "Royaume de Bahreïn", en: "Kingdom of Bahrain" },
  tn: { ar: "الجمهورية التونسية", fr: "République tunisienne", en: "Tunisian Republic" },
  dz: { ar: "الجمهورية الجزائرية الديمقراطية الشعبية", fr: "République algérienne démocratique et populaire", en: "People's Democratic Republic of Algeria" },
  dj: { ar: "جمهورية جيبوتي", fr: "République de Djibouti", en: "Republic of Djibouti" },
  sa: { ar: "المملكة العربية السعودية", fr: "Royaume d'Arabie saoudite", en: "Kingdom of Saudi Arabia" },
  sd: { ar: "جمهورية السودان", fr: "République du Soudan", en: "Republic of the Sudan" },
  sy: { ar: "الجمهورية العربية السورية", fr: "République arabe syrienne", en: "Syrian Arab Republic" },
  so: { ar: "جمهورية الصومال", fr: "République fédérale de Somalie", en: "Federal Republic of Somalia" },
  iq: { ar: "جمهورية العراق", fr: "République d'Irak", en: "Republic of Iraq" },
  om: { ar: "سلطنة عُمان", fr: "Sultanat d'Oman", en: "Sultanate of Oman" },
  ps: { ar: "دولة فلسطين", fr: "État de Palestine", en: "State of Palestine" },
  qa: { ar: "دولة قطر", fr: "État du Qatar", en: "State of Qatar" },
  kw: { ar: "دولة الكويت", fr: "État du Koweït", en: "State of Kuwait" },
  lb: { ar: "الجمهورية اللبنانية", fr: "République libanaise", en: "Lebanese Republic" },
  ly: { ar: "دولة ليبيا", fr: "État de Libye", en: "State of Libya" },
  eg: { ar: "جمهورية مصر العربية", fr: "République arabe d'Égypte", en: "Arab Republic of Egypt" },
  ma: { ar: "المملكة المغربية", fr: "Royaume du Maroc", en: "Kingdom of Morocco" },
  mr: { ar: "الجمهورية الإسلامية الموريتانية", fr: "République islamique de Mauritanie", en: "Islamic Republic of Mauritania" },
  ye: { ar: "الجمهورية اليمنية", fr: "République du Yémen", en: "Republic of Yemen" },
};

const HOME_TRANSLATIONS = {
  ar: {
    none: "—",
    changeIcon: "تغيير الأيقونة",
    open: "فتح",
    hide: "إخفاء",
    more: "المزيد",
    heroBadge: "✦ المنظومة التعدينية العربية ✦",
    heroTitleStart: "بوابة المؤشرات",
    heroTitleAccent: "التعدينية العربية",
    heroSubtitle: "نافذتك لبيانات ومؤشرات قطاع التعدين العربي",
    smartSearch: " بحث",
        searchPlaceholder: "ابحث عن معدن، دولة، أو إحصائية...",
    noSearchResults: "لا نتائج مطابقة",
    searchTapToOpen: "اضغط للبحث عن دولة…",
    searchModalTitle: "بحث عن دولة",
    searchModalHint: "اكتب اسماً بالعربية أو الفرنسية أو الإنجليزية، أو رمز الدولة (مثال: ma، Maroc).",
    closeModal: "إغلاق",
    portalInNumbers: "البوابة في أرقام",
    miningIndicatorsSection: "المؤشرات التعدينية",
    tradeIndicatorsSection: "التجارة التعدينية",
    miningProductionTag: "الإنتاج التعديني",
    goToIndicators: "الانتقال للمؤشرات",
    productionSummary: (count) => `${count} مؤشرات تفاعلية شاملة للإنتاج العربي`,
    updatedDataSummary: (minYear, maxYear, countryCount) => `البيانات محدّثة — ${minYear} إلى ${maxYear} — ${countryCount} دولة عربية`,
    tradeTag: "الصادرات والواردات",
    allTradeIndicators: "جميع مؤشرات التجارة",
    tradeTotals: (exports, imports) => `إجمالي الصادرات: ${exports} دولار — إجمالي الواردات: ${imports} دولار`,
    memberStates: "الدول الأعضاء",
    arabCountriesTitle: "الدول العربية",
    chooseCountry: "اختر دولة للوصول إلى مؤشراتها التعدينية",
    viewAll: "عرض الكل",
    selectedCountry: "الدولة المختارة:",
    referencesTag: "المراجع",
    referencesTitle: "المراجع والمصادر",
    assistantAvailable: "مساعد ذكي  ",
    intelligentAssistant: "المساعد الذكي",
    assistantSubtitle: "اطرح أسئلتك عن المؤشرات والبيانات والمعلومات التعدينية وسيجيبك فوراً",
    startChat: "ابدأ المحادثة",
    chatbotAlert: "Chat Bot — محلل البيانات الذكي (واجهة تجريبية).",
    floatingBotTitle: "Chat Bot",
    floatingBotSubtitle: "محلّل البيانات الذكي",
    indicatorProductionVolumeTitle: "حجم الإنتاج التعديني",
    indicatorProductionVolumeDesc: "لوحة تفاعلية لعرض حجم الإنتاج التعديني حسب الدولة، الخام، والفترة الزمنية.",
    indicatorProductionTrendTitle: "تطور الإنتاج التعديني",
    indicatorProductionTrendDesc: "تتبّع تطور الإنتاج عبر السنوات مع إبراز الاتجاهات وأهم التغيرات السنوية.",
    indicatorArabicProductionTrendTitle: "تطور الإنتاج التعديني العربي",
    indicatorArabicProductionTrendDesc: "مقارنة أداء الدول العربية في الإنتاج عبر أكثر من خام وفترات زمنية مختلفة.",
    indicatorProductionComparisonTitle: "نسبة الإنتاج العربي مقارنة بالإنتاج العالمي",
    indicatorProductionComparisonDesc: "قياس مساهمة الإنتاج العربي في الإنتاج العالمي عبر تمثيل دائري تفاعلي.",
    tradeExportsTitle: "الصادرات التعدينية",
    tradeExportsDesc: "تحليل تدفقات الصادرات التعدينية حسب الدولة والوجهة والقيمة المالية.",
    tradeImportsTitle: "الواردات التعدينية",
    tradeImportsDesc: "رصد حجم وقيمة الواردات من المواد الخام والمنتجات التعدينية المعالجة.",
    donutArabProduction: "الإنتاج العربي",
    donutWorld: "العالم",
    kpiMiningDataUnit: "معلومة تعدينية",
    kpiMiningDataBadge: "بيانات تعدينية",
    kpiCountriesUnit: "دولة عربية",
    kpiCountriesBadge: "نطاق عربي شامل",
    kpiPeriodUnit: "الفترة الزمنية للبيانات",
    kpiPeriodBadge: "الفترة الزمنية",
    kpiDiversityUnit: "خام / منتج تعديني",
    kpiDiversityBadge: "تنوع معدني",
  },
  fr: {
    none: "Aucun",
    changeIcon: "Changer l'icône",
    open: "Ouvrir",
    hide: "Masquer",
    more: "Voir plus",
    heroBadge: "✦ Écosystème minier arabe ✦",
    heroTitleStart: "Portail des indicateurs",
    heroTitleAccent: "miniers arabes",
    heroSubtitle: "Votre portail vers les données et indicateurs du secteur minier arabe.",
    smartSearch: "cherche ",
    searchPlaceholder: "Rechercher un minerai, un pays ou une statistique...",
    noSearchResults: "Aucun résultat",
    searchTapToOpen: "Cliquez pour rechercher un pays…",
    searchModalTitle: "Rechercher un pays",
    searchModalHint: "Saisissez un nom (arabe, français ou anglais) ou un code pays (ex. ma, Maroc).",
    closeModal: "Fermer",
    portalInNumbers: "Le portail en chiffres",
    miningIndicatorsSection: "Indicateurs miniers",
    tradeIndicatorsSection: "Commerce minier",
    miningProductionTag: "Production minière",
    goToIndicators: "Accéder aux indicateurs",
    productionSummary: (count) => `${count} indicateurs interactifs couvrant la production arabe`,
    updatedDataSummary: (minYear, maxYear, countryCount) => `Données mises à jour — ${minYear} à ${maxYear} — ${countryCount} pays arabes`,
    tradeTag: "Exportations et importations",
    allTradeIndicators: "Tous les indicateurs commerciaux",
    tradeTotals: (exports, imports) => `Total exportations : ${exports} USD — Total importations : ${imports} USD`,
    memberStates: "États membres",
    arabCountriesTitle: "Pays arabes",
    chooseCountry: "Choisissez un pays pour accéder à ses indicateurs miniers",
    viewAll: "Voir tout",
    selectedCountry: "Pays sélectionné :",
    referencesTag: "Références",
    referencesTitle: "Références et sources",
    assistantAvailable: "Assistant intelligent ",
    intelligentAssistant: "Assistant intelligent",
    assistantSubtitle: "Posez vos questions sur les indicateurs, les données et les informations minières et obtenez une réponse immédiate.",
    startChat: "Démarrer la conversation",
    chatbotAlert: "Chat Bot — analyste intelligent des données (interface expérimentale).",
    floatingBotTitle: "Chat Bot",
    floatingBotSubtitle: "Analyste intelligent des données",
    indicatorProductionVolumeTitle: "Volume de production minière",
    indicatorProductionVolumeDesc: "Tableau interactif de la production minière par pays, minerai et période.",
    indicatorProductionTrendTitle: "Évolution de la production minière",
    indicatorProductionTrendDesc: "Suivi de l'évolution de la production au fil des années avec mise en avant des tendances.",
    indicatorArabicProductionTrendTitle: "Évolution de la production minière arabe",
    indicatorArabicProductionTrendDesc: "Comparaison des performances des pays arabes sur plusieurs minerais et périodes.",
    indicatorProductionComparisonTitle: "Part de la production arabe dans la production mondiale",
    indicatorProductionComparisonDesc: "Mesure de la contribution arabe à la production mondiale via une vue circulaire interactive.",
    tradeExportsTitle: "Exportations minières",
    tradeExportsDesc: "Analyse des flux d'exportation minière par pays, destination et valeur financière.",
    tradeImportsTitle: "Importations minières",
    tradeImportsDesc: "Suivi du volume et de la valeur des importations de matières premières et produits miniers transformés.",
    donutArabProduction: "Production arabe",
    donutWorld: "Monde",
    kpiMiningDataUnit: "informations minières",
    kpiMiningDataBadge: "Données minières",
    kpiCountriesUnit: "pays arabes",
    kpiCountriesBadge: "Couverture arabe complète",
    kpiPeriodUnit: "période couverte",
    kpiPeriodBadge: "Période",
    kpiDiversityUnit: "minerais / produits miniers",
    kpiDiversityBadge: "Diversité minérale",
  },
  en: {
    none: "None",
    changeIcon: "Change icon",
    open: "Open",
    hide: "Hide",
    more: "Learn more",
    heroBadge: "✦ Arab Mining Ecosystem ✦",
    heroTitleStart: "Mining Indicators",
    heroTitleAccent: "Arab Portal",
    heroSubtitle: "Your gateway to Arab mining sector data and indicators.",
    smartSearch: " Search",
    searchPlaceholder: "Search for a mineral, country, or statistic...",
    noSearchResults: "No matching results",
    searchTapToOpen: "Click to search for a country…",
    searchModalTitle: "Search for a country",
    searchModalHint: "Type a name in Arabic, French, or English, or an ISO code (e.g. ma, Morocco).",
    closeModal: "Close",
    portalInNumbers: "Portal in Numbers",
    miningIndicatorsSection: "Mining Indicators",
    tradeIndicatorsSection: "Mining Trade",
    miningProductionTag: "Mining Production",
    goToIndicators: "Go to indicators",
    productionSummary: (count) => `${count} interactive indicators covering Arab production`,
    updatedDataSummary: (minYear, maxYear, countryCount) => `Updated data — ${minYear} to ${maxYear} — ${countryCount} Arab countries`,
    tradeTag: "Exports and imports",
    allTradeIndicators: "All trade indicators",
    tradeTotals: (exports, imports) => `Total exports: ${exports} USD — Total imports: ${imports} USD`,
    memberStates: "Member states",
    arabCountriesTitle: "Arab Countries",
    chooseCountry: "Choose a country to access its mining indicators",
    viewAll: "View all",
    selectedCountry: "Selected country:",
    referencesTag: "References",
    referencesTitle: "References and Sources",
    assistantAvailable: "Smart assistant ",
    intelligentAssistant: "Smart Assistant",
    assistantSubtitle: "Ask about indicators, datasets, and mining information and get an instant answer.",
    startChat: "Start chat",
    chatbotAlert: "Chat Bot — smart data analyst (experimental interface).",
    floatingBotTitle: "Chat Bot",
    floatingBotSubtitle: "Smart data analyst",
    indicatorProductionVolumeTitle: "Mining production volume",
    indicatorProductionVolumeDesc: "Interactive dashboard showing mining production by country, mineral, and time period.",
    indicatorProductionTrendTitle: "Mining production trend",
    indicatorProductionTrendDesc: "Track production over time with emphasis on major annual shifts and trends.",
    indicatorArabicProductionTrendTitle: "Arab mining production trend",
    indicatorArabicProductionTrendDesc: "Compare Arab country performance across multiple minerals and time ranges.",
    indicatorProductionComparisonTitle: "Arab production share vs global output",
    indicatorProductionComparisonDesc: "Measure Arab contribution to world production through an interactive circular view.",
    tradeExportsTitle: "Mining exports",
    tradeExportsDesc: "Analyze mining export flows by country, destination, and monetary value.",
    tradeImportsTitle: "Mining imports",
    tradeImportsDesc: "Monitor the volume and value of imported raw materials and processed mining products.",
    donutArabProduction: "Arab production",
    donutWorld: "World",
    kpiMiningDataUnit: "mining insights",
    kpiMiningDataBadge: "Mining data",
    kpiCountriesUnit: "Arab countries",
    kpiCountriesBadge: "Full Arab coverage",
    kpiPeriodUnit: "data time span",
    kpiPeriodBadge: "Time period",
    kpiDiversityUnit: "minerals / mining products",
    kpiDiversityBadge: "Mineral diversity",
  },
};

const NUMBER_LOCALES = {
  ar: "ar-SA",
  fr: "fr-FR",
  en: "en-US",
};

const getCountryLabel = (code, language) =>
  COUNTRY_LABELS[code]?.[language] || COUNTRY_LABELS[code]?.en || COUNTRY_LABELS[code]?.ar || code;

const getOfficialContactTitle = (row, language) => {
  const country = getCountryLabel(row.code, language);
  if (row.city) {
    const city = row.city[language] || row.city.ar;
    return `${city} - ${country}`;
  }
  return country;
};

const getOfficialContactSubtitle = (row, language) => row.ministry[language] || row.ministry.ar;

const shortText = (text, max = 95) => (text && text.length > max ? `${text.slice(0, max)}...` : text);

const formatInt = (n, locale = "fr-FR") => new Intl.NumberFormat(locale).format(Math.round(n || 0));

const parseFlexibleNumber = (value) => {
  if (value == null) return null;
  let s = String(value).trim();
  if (!s) return null;

  if (s.includes(",") && s.includes(".")) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(/,/g, ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (s.includes(",")) {
    s = s.replace(/,/g, ".");
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const buildPortalStats = () => {
  const minerals = Object.keys(dataByMineral || {});
  const yearSet = new Set();
  let productionRows = 0;

  minerals.forEach((mineral) => {
    Object.entries(dataByMineral[mineral] || {}).forEach(([year, rows]) => {
      yearSet.add(Number(year));
      if (Array.isArray(rows)) productionRows += rows.length;
    });
  });

  const years = [...yearSet].filter(Number.isFinite).sort((a, b) => a - b);
  const minYear = years[0] ?? null;
  const maxYear = years[years.length - 1] ?? null;

  let exportRows = 0;
  let importRows = 0;
  let exportTotal = 0;
  let importTotal = 0;

  const uniqueSponsors = new Set(sponsors.map((s) => s.href));

  return {
    countryCount: countries.length,
    mineralCount: minerals.length,
    productionRows,
    minYear,
    maxYear,
    uniqueSourcesCount: uniqueSponsors.size,
    productionIndicatorCount: INDICATOR_CARDS.length,
    tradeIndicatorCount: TRADE_CARDS.length,
    totalIndicatorCount: INDICATOR_CARDS.length + TRADE_CARDS.length + RESERVE_CARDS.length,
    exportRows,
    importRows,
    tradeRows: exportRows + importRows,
    exportTotal,
    importTotal,
  };
};

const buildKpiData = (labels) => [
  {
    icon: "fa-books",
    altIcon: "fa-chart-column",
    num: "3000",
    unit: labels.kpiMiningDataUnit,
    label: "",
    badge: labels.kpiMiningDataBadge,
    details: "",
    color: "#c9a84c",
  },
  {
    icon: "fa-earth-africa",
    altIcon: "fa-flag",
    num: "21",
    unit: labels.kpiCountriesUnit,
    label: "",
    badge: labels.kpiCountriesBadge,
    details: "",
    color: "#6fcba5",
  },
  {
    icon: "fa-calendar-days",
    altIcon: "fa-layer-group",
    num: "2010 - 2024",
    unit: labels.kpiPeriodUnit,
    label: "",
    badge: labels.kpiPeriodBadge,
    details: "",
    color: "#e8a87c",
  },
  {
    icon: "fa-gem",
    altIcon: "fa-gem",
    num: "111",
    unit: labels.kpiDiversityUnit,
    label: "",
    badge: labels.kpiDiversityBadge,
    details: "",
    color: "#93c5fd",
  },
];

const MiniTradeLine = ({ active, color = "#c9a84c" }) => {
  const pts = [[4,82],[18,76],[34,72],[50,68],[66,60],[82,54],[98,46],[114,50],[130,36],[146,28],[162,20],[178,14]];
  const path = pts.map((p,i) => `${i===0?"M":"L"} ${p[0]} ${p[1]}`).join(" ");
  return (
    <div style={{ height:110, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:8, padding:8 }}>
      <svg viewBox="0 0 190 88" style={{ width:"100%", height:"100%", overflow:"visible" }}>
        {[20,40,60,80].map(y => <line key={y} x1="0" y1={y} x2="190" y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />)}
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="560" strokeDashoffset={active?"0":"560"}
          style={{ transition: active?"stroke-dashoffset 1.2s ease 80ms":"stroke-dashoffset 0.25s ease" }}
        />
        {pts.map((p,i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill={color} opacity={active?1:0}
            style={{
              transform: active?"scale(1)":"scale(0)",
              transformOrigin:`${p[0]}px ${p[1]}px`,
              transition: active
                ? `opacity 250ms ease ${420+i*55}ms, transform 250ms ease ${420+i*55}ms`
                : "opacity 200ms ease, transform 200ms ease",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

const MiniTradeBar = ({ active, color = "#7ee0c0" }) => {
  const bars = [28,42,36,50,58,46,68,63,52,70,78,66,72,80,88];
  return (
    <div style={{ height:110, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"8px 6px 4px", display:"flex", alignItems:"flex-end", gap:2 }}>
      {bars.map((v, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", height:"100%" }}>
          <div style={{
            width:"100%", borderRadius:"8px 8px 0 0",
            background:`linear-gradient(to top,${color}88,${color})`,
            minHeight:3,
            height: active ? `${v}%` : "0%",
            opacity: active ? 1 : 0.2,
            transition: active
              ? `height 700ms cubic-bezier(.16,1,.3,1) ${i*40}ms, opacity 350ms ease ${i*40}ms`
              : "height 250ms ease, opacity 250ms ease",
          }} />
        </div>
      ))}
    </div>
  );
};

const TRADE_CARDS = [
  {
    icon: "fa-ship",
    altIcon: "fa-right-left",
    titleKey: "tradeExportsTitle",
    descKey: "tradeExportsDesc",
    href: "/m5",
    Chart: MiniTradeLine,
  },
  {
    icon: "fa-truck-ramp-box",
    altIcon: "fa-ship",
    titleKey: "tradeImportsTitle",
    descKey: "tradeImportsDesc",
    href: "/m6",
    Chart: MiniTradeBar,
  },
];

const RESERVE_CARDS = [
  {
    icon: "fa-gem",
    title: "احتياطي الخام حسب الدولة",
    desc: "توزيع احتياطيات أهم الخامات المعدنية على الخريطة العربية.",
    bullets: [
      "مقارنة كميات الاحتياطي بين الدول العربية.",
      "نسبة تركيز الخام وجودته بحسب التقارير الجيولوجية.",
    ],
    href: "/m7",
    accent: "var(--gold)",
    bg: "rgba(201,168,76,0.08)",
  },
  {
    icon: "fa-microscope",
    title: "الاحتياطي المؤكد والمحتمل",
    desc: "تصنيف الاحتياطيات وفق درجة الموثوقية الجيولوجية والجدوى الاقتصادية.",
    bullets: [
      "الاحتياطي المؤكد (Proven) القابل للاستغلال حالياً.",
      "الاحتياطي المحتمل (Probable) بناءً على دراسات الاستكشاف.",
    ],
    href: "/m8",
    accent: "var(--forest)",
    bg: "rgba(8,39,33,0.06)",
  },
];

const ICON_MAP = {
  "fa-cubes": Boxes,
  "fa-earth-africa": Globe,
  "fa-calendar-days": CalendarDays,
  "fa-gem": Gem,
  "fa-ship": Ship,
  "fa-truck-ramp-box": Truck,
  "fa-microscope": Microscope,
  "fa-chart-column": ChartColumn,
  "fa-chart-line": ChartLine,
  "fa-layer-group": Layers,
  "fa-circle-notch": CircleDashed,
  "fa-arrow-left": ArrowLeft,
  "fa-search": Search,
  "fa-chevron-down": ChevronDown,
  "fa-pickaxe": Pickaxe,
  "fa-right-left": ArrowLeftRight,
  "fa-flag": Flag,
  "fa-books": BookOpen,
  "fa-robot": Bot,
};

const AppIcon = ({ name, size = 18, strokeWidth = 2, style }) => {
  const Icon = ICON_MAP[name] || Circle;
  return <Icon size={size} strokeWidth={strokeWidth} style={style} aria-hidden="true" />;
};

/* ─────────────────────────────────────────────
   MINI CHARTS  (hover-driven via `active` prop)
───────────────────────────────────────────── */
const MiniBarChart = ({ active }) => {
  const bars = [55,72,38,63,78,22,95,48,41,18,67,59,15,44,36,29,52,83,88,71,33];
  return (
    <div style={{ height:140, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"10px 6px 4px", display:"flex", alignItems:"flex-end", gap:2 }}>
      {bars.map((v, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", height:"100%" }}>
          <div style={{
            width:"100%", borderRadius:"8px 8px 0 0",
            background:"linear-gradient(to top,#c9a84c,#e8d08a)",
            minHeight:3,
            height: active ? `${v}%` : "0%",
            opacity: active ? 1 : 0.2,
            transition: active
              ? `height 700ms cubic-bezier(.16,1,.3,1) ${i*28}ms, opacity 350ms ease ${i*28}ms`
              : "height 250ms ease, opacity 250ms ease",
          }} />
        </div>
      ))}
    </div>
  );
};

const MiniLineChart = ({ active }) => {
  const pts = [[4,76],[18,72],[32,70],[46,67],[60,65],[74,63],[88,60],[102,56],[116,14],[130,40],[144,66],[158,42],[172,44],[186,38]];
  const path = pts.map((p,i) => `${i===0?"M":"L"} ${p[0]} ${p[1]}`).join(" ");
  return (
    <div style={{ height:140, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:8, padding:8 }}>
      <svg viewBox="0 0 190 88" style={{ width:"100%", height:"100%", overflow:"visible" }}>
        {[20,40,60,80].map(y => <line key={y} x1="0" y1={y} x2="190" y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />)}
        <path d={path} fill="none" stroke="#7ee0c0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="500" strokeDashoffset={active?"0":"500"}
          style={{ transition: active?"stroke-dashoffset 1.2s ease 80ms":"stroke-dashoffset 0.25s ease" }}
        />
        {pts.map((p,i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill="#c9a84c" opacity={active?1:0}
            style={{
              transform: active?"scale(1)":"scale(0)",
              transformOrigin:`${p[0]}px ${p[1]}px`,
              transition: active
                ? `opacity 250ms ease ${420+i*55}ms, transform 250ms ease ${420+i*55}ms`
                : "opacity 200ms ease, transform 200ms ease",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

const MiniGroupedBar = ({ active }) => {
  const a = [88,70,62,72,70,18,24,30,45,46,47,20,22,28,34];
  const b = [18,22,24,34,36,40,45,52,46,46,47,30,29,21,23];
  return (
    <div style={{ height:140, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"10px 8px 4px", display:"flex", alignItems:"flex-end", gap:2 }}>
      {a.map((v,i) => (
        <div key={i} style={{ flex:1, display:"flex", alignItems:"flex-end", justifyContent:"center", gap:1, height:"100%" }}>
          <div style={{ width:"45%", borderRadius:"8px 8px 0 0", background:"rgba(255,255,255,0.55)",
            height: active?`${v}%`:"0%", opacity: active?1:0.2,
            transition: active?`height 700ms cubic-bezier(.16,1,.3,1) ${i*38}ms,opacity 350ms ease ${i*38}ms`:"height 250ms ease,opacity 250ms ease" }} />
          <div style={{ width:"45%", borderRadius:"8px 8px 0 0", background:"#49c7a2",
            height: active?`${b[i]}%`:"0%", opacity: active?1:0.2,
            transition: active?`height 700ms cubic-bezier(.16,1,.3,1) ${i*38+75}ms,opacity 350ms ease ${i*38+75}ms`:"height 250ms ease,opacity 250ms ease" }} />
        </div>
      ))}
    </div>
  );
};

const MiniDonut = ({ active, labels }) => (
  <div style={{ height:140, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", gap:16 }}>
    <div style={{
      width:68, height:68, borderRadius:"50%", flexShrink:0,
      background:"conic-gradient(#c9a84c 0deg 194deg,rgba(255,255,255,0.1) 194deg 360deg)",
      position:"relative",
      opacity: active?1:0.4,
      transform: active?"scale(1) rotate(0deg)":"scale(0.65) rotate(-90deg)",
      transition: active?"opacity 550ms ease 80ms,transform 700ms cubic-bezier(.16,1,.3,1) 80ms":"opacity 280ms ease,transform 280ms ease",
    }}>
      <div style={{ position:"absolute", inset:14, borderRadius:"50%", background:"#0a2f28", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:"0.6rem", fontWeight:800, color:"#c9a84c" }}>54%</span>
      </div>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      {[["#c9a84c", labels.donutArabProduction],["rgba(255,255,255,0.2)", labels.donutWorld]].map(([c,l],i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
          <div style={{ width:8, height:8, borderRadius:8, background:c, flexShrink:0 }} />
          <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.5)" }}>{l}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   INDICATOR CONFIG
───────────────────────────────────────────── */
const INDICATOR_CARDS = [
  { icon:"fa-chart-column", altIcon:"fa-layer-group", tagColor:"#c9a84c", titleKey:"indicatorProductionVolumeTitle", descKey:"indicatorProductionVolumeDesc", href:"/m1", Chart:MiniBarChart },
  { icon:"fa-chart-line",   altIcon:"fa-chart-column", tagColor:"#7ee0c0", titleKey:"indicatorProductionTrendTitle", descKey:"indicatorProductionTrendDesc", href:"/m2", Chart:MiniLineChart },
];

/* ─────────────────────────────────────────────
   INDICATOR ROW CARD  (self-contained hover)
───────────────────────────────────────────── */
const IndicatorRowCard = ({ card, labels }) => {
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [iconAlt, setIconAlt] = useState(false);
  const cardRef = useRef(null);
  const { Chart } = card;

  useEffect(() => {
    if (!cardRef.current) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(cardRef.current);
    return () => io.disconnect();
  }, []);

  const chartActive = hovered || inView || expanded;
  const shownIcon = iconAlt ? (card.altIcon || card.icon) : card.icon;
  const title = labels[card.titleKey];
  const description = labels[card.descKey];
  const shownDesc = expanded ? description : shortText(description, 86);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setExpanded((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded((v) => !v);
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      style={{
        borderRadius:8, padding:"20px 24px",
        background: (hovered || expanded)?"rgba(255,255,255,0.075)":"rgba(255,255,255,0.04)",
        border:"1px solid rgba(255,255,255,0.07)",
        borderRight:`3px solid ${card.tagColor}`,
        transform: (hovered || expanded)?"translateY(-5px)":"translateY(0)",
        boxShadow: (hovered || expanded)?"0 22px 50px rgba(0,0,0,0.38)":"none",
        transition:"transform 0.35s cubic-bezier(.16,1,.3,1),box-shadow 0.35s,background 0.3s",
        cursor:"pointer",
      }}
    >
      <div style={{ display:"flex", gap:20, alignItems:"stretch", flexWrap:"wrap" }}>

        {/* Left */}
        <div style={{ flex:"1 1 280px", display:"flex", gap:16, alignItems:"flex-start" }}>
          <div style={{
            width:88, height:"100%", marginTop:2, flexShrink:0, alignSelf:"stretch",
            background:`${card.tagColor}20`, border:`1px solid ${card.tagColor}50`,
            borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center",
            color:card.tagColor,
            transform: hovered?"scale(1.1) rotate(-5deg)":"scale(1) rotate(0deg)",
            transition:"transform 0.32s cubic-bezier(.16,1,.3,1)",
          }}>
            <AppIcon name={shownIcon} size={56} strokeWidth={1.8} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:6, flexWrap:"wrap" }}>
              <p style={{ fontSize:"1.15rem", fontWeight:800, color:"white", margin:0 }}>{title}</p>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIconAlt((v) => !v); }}
                  title={labels.changeIcon}
                  style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.8)", borderRadius:8, padding:"4px 8px", cursor:"pointer" }}
                >
                  <AppIcon name="fa-right-left" size={12} strokeWidth={2.4} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
                  title={expanded ? labels.hide : labels.open}
                  style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.8)", borderRadius:8, padding:"4px 8px", cursor:"pointer", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 220ms ease" }}
                >
                  <ChevronDown size={12} strokeWidth={2.4} />
                </button>
              </div>
            </div>
            <p style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.5)", lineHeight:1.75, margin:"0 0 14px" }}>{shownDesc}</p>
            {expanded && (
              <a href={card.href} onClick={(e) => e.stopPropagation()} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 20px", border:`1px solid ${card.tagColor}40`, borderRadius:8, fontSize:"0.85rem", fontWeight:700, color:card.tagColor, letterSpacing:"0.04em", textDecoration:"none", background:`${card.tagColor}12` }}>
                <AppIcon name="fa-arrow-left" size={14} strokeWidth={2.4} /> {labels.more}
              </a>
            )}
          </div>
        </div>

        {/* Right — chart */}
        {(expanded || hovered || inView) && (
          <div style={{ flex:"0 0 320px", minWidth:260, alignSelf:"center", height:140 }}>
            <Chart active={chartActive} labels={labels} />
          </div>
        )}

      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   KPI CARD  (self-contained hover)
───────────────────────────────────────────── */
const KpiCard = ({ k, labels }) => {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [iconAlt, setIconAlt] = useState(false);
  const shownIcon = iconAlt ? (k.altIcon || k.icon) : k.icon;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setExpanded((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded((v) => !v);
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      className="kpi-card"
      style={{
        background:"var(--forest)",
        border:`1px solid ${(hovered || expanded)?"rgba(201,168,76,0.6)":"rgba(201,168,76,0.2)"}`,
        borderRadius:8, padding:"24px",
        transform: (hovered || expanded)?"translateY(-10px)":"translateY(0)",
        boxShadow: (hovered || expanded)?"0 30px 60px rgba(8,39,33,0.35),0 0 0 1px rgba(201,168,76,0.3)":"none",
        transition:"transform 0.4s cubic-bezier(.16,1,.3,1),box-shadow 0.4s,border-color 0.4s",
        cursor:"pointer",
      }}
    >
      {/* Top row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, gap:8 }}>
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"10px 12px", fontSize:"1.2rem", color:k.color, flexShrink:0 }}>
          <AppIcon name={shownIcon} size={22} strokeWidth={2.2} />
        </div>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
          <span style={{ background:`${k.color}18`, color:k.color, fontSize:"0.72rem", fontWeight:700, padding:"4px 12px", borderRadius:8, border:`1px solid ${k.color}30`, whiteSpace:"nowrap" }}>
            {k.badge}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIconAlt((v) => !v); }}
            title={labels.changeIcon}
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.8)", borderRadius:8, padding:"4px 8px", cursor:"pointer" }}
          >
            <AppIcon name="fa-right-left" size={12} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {/* Label */}
      <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.8rem", letterSpacing:"0.04em", margin:"0 0 6px" }}>{k.label}</p>

      {/* Big number — responsive font size to prevent overflow */}
      <div style={{
        fontSize:"clamp(1.6rem,3vw,2.8rem)", fontWeight:900,
        letterSpacing:"-0.02em", lineHeight:1.1,
        background:"linear-gradient(120deg,#c9a84c 0%,#f0d98a 40%,#c9a84c 60%,#8a6a1e 100%)",
        backgroundSize:"300% auto",
        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        backgroundClip:"text",
        animation:"shimmerGold 6s linear infinite",
      }}>
        {k.num}
      </div>

      {/* Unit */}
      {k.unit && <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.78rem", margin:"4px 0 0" }}>{k.unit}</p>}

      {expanded && (
        <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"0.76rem", margin:"10px 0 0", lineHeight:1.7 }}>
          {k.details}
        </p>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   TRADE CARD  (self-contained hover + mini chart)
───────────────────────────────────────────── */
const TradeCard = ({ card, accent, labels }) => {
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [iconAlt, setIconAlt] = useState(false);
  const ref = useRef(null);
  const { Chart } = card;

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { setInView(true); io.unobserve(e.target); } }),
      { threshold: 0.2 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const chartActive = hovered || inView || expanded;
  const shownIcon = iconAlt ? (card.altIcon || card.icon) : card.icon;
  const title = labels[card.titleKey];
  const description = labels[card.descKey];
  const shownDesc = expanded ? description : shortText(description, 96);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setExpanded((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded((v) => !v);
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      style={{
        borderRadius:8, padding:"20px 24px",
        background: (hovered || expanded)?"rgba(255,255,255,0.075)":"rgba(255,255,255,0.04)",
        border:"1px solid rgba(255,255,255,0.07)",
        borderRight:`3px solid ${accent}`,
        transform: (hovered || expanded)?"translateY(-5px)":"translateY(0)",
        boxShadow: (hovered || expanded)?"0 22px 50px rgba(0,0,0,0.38)":"none",
        transition:"transform 0.35s cubic-bezier(.16,1,.3,1), box-shadow 0.35s, background 0.3s",
        cursor:"pointer",
      }}
    >
      <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
        {/* Info */}
        <div style={{ flex:"1 1 240px", display:"flex", gap:14, alignItems:"flex-start" }}>
          <div style={{ width:44, height:44, background:`${accent}20`, border:`1px solid ${accent}50`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:accent, flexShrink:0 }}>
            <AppIcon name={shownIcon} size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:6 }}>
              <p style={{ fontSize:"1.05rem", fontWeight:800, color:"white", margin:0 }}>{title}</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIconAlt((v) => !v); }}
                title={labels.changeIcon}
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.8)", borderRadius:8, padding:"3px 7px", cursor:"pointer" }}
              >
                <AppIcon name="fa-right-left" size={11} strokeWidth={2.4} />
              </button>
            </div>
            <p style={{ fontSize:"0.86rem", color:"rgba(255,255,255,0.55)", lineHeight:1.75, margin:0 }}>{shownDesc}</p>
          </div>
        </div>
        {/* Mini chart */}
        {(expanded || hovered || inView) && (
          <div style={{ flex:"0 0 260px", minWidth:200, alignSelf:"center" }}>
            <Chart active={chartActive} color={accent} />
          </div>
        )}
        {/* CTA */}
        <div style={{ display:"flex", alignItems:"center", marginRight:"auto" }}>
          <a href={card.href} onClick={(e) => e.stopPropagation()} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 20px", border:`1px solid ${accent}40`, borderRadius:2, fontSize:"0.85rem", fontWeight:700, color:accent, letterSpacing:"0.04em", textDecoration:"none", background:`${accent}12`, whiteSpace:"nowrap", opacity: expanded ? 1 : 0.92 }}>
            <AppIcon name="fa-arrow-left" size={14} strokeWidth={2.4} /> {labels.more}
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SECTION HEADER  (reusable)
───────────────────────────────────────────── */
const SectionHeader = ({ icon, tag, title, action }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28, flexWrap:"wrap", gap:12 }}>
    <div>
      <span style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", background:"var(--forest)", color:"var(--gold)", borderRadius:2, fontSize:"0.8rem", fontWeight:700, letterSpacing:"0.08em" }}>
        <AppIcon name={icon} size={14} strokeWidth={2.3} /> {tag}
      </span>
      <h3 style={{ fontSize:"1.6rem", fontWeight:900, color:"var(--forest)", marginTop:12, marginBottom:0 }}>{title}</h3>
    </div>
    {action && (
      <a href={action.href} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 18px", border:"1px solid rgba(8,39,33,0.2)", borderRadius:2, fontSize:"0.78rem", fontWeight:700, color:"var(--forest)", letterSpacing:"0.04em", textDecoration:"none", transition:"background 0.25s,border-color 0.25s,color 0.25s" }}>
        <AppIcon name="fa-arrow-left" size={14} strokeWidth={2.4} /> {action.label}
      </a>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   GOLD DIVIDER
───────────────────────────────────────────── */
const GoldDivider = ({ mb = 28 }) => (
  <div style={{ height:1, background:"linear-gradient(to right,transparent,var(--gold),transparent)", opacity:0.5, marginBottom:mb }} />
);

/* ─────────────────────────────────────────────
   REVEAL HOOK — IntersectionObserver
───────────────────────────────────────────── */
const useReveal = () => {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }),
      { threshold:0.1, rootMargin:"0px 0px -8% 0px" }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
};

/* ─────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────── */
const Home = () => {
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const labels = HOME_TRANSLATIONS[language] || HOME_TRANSLATIONS.ar;
  const numberLocale = NUMBER_LOCALES[language] || NUMBER_LOCALES.ar;
  const isArabic = language === "ar";
  const [selectedCountryCode, setSelectedCountryCode] = useState(null);
  const [sponsorSlide, setSponsorSlide]       = useState(0);
  const [sponsorPaused, setSponsorPaused]     = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [heroSearchQuery, setHeroSearchQuery] = useState("");
  const [navCountriesForSearch, setNavCountriesForSearch] = useState([]);
  const modalSearchInputRef = useRef(null);
  const portalStats = useMemo(() => buildPortalStats(), []);
  const kpiData = useMemo(() => buildKpiData(labels), [labels]);

  useReveal();

  useEffect(() => {
    let active = true;
    getCountries()
      .then((rows) => {
        if (!active || !Array.isArray(rows)) return;
        const mapped = rows
          .filter((row) => row?.iso_code && (row?.name_ar || row?.name_en || row?.name_fr))
          .map((row) => ({
            code: String(row.iso_code).trim().toLowerCase(),
            name_ar: row.name_ar || "",
            name_en: row.name_en || "",
            name_fr: row.name_fr || "",
          }));
        setNavCountriesForSearch(mapped);
      })
      .catch(() => {
        if (active) setNavCountriesForSearch([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const countrySearchLabel = (c) => {
    if (language === "ar") return c.name_ar || c.name_en || c.name_fr || c.code;
    if (language === "fr") return c.name_fr || c.name_en || c.name_ar || c.code;
    return c.name_en || c.name_fr || c.name_ar || c.code;
  };

  const displayModalCountries = useMemo(() => {
    if (!navCountriesForSearch.length) return [];
    const q = heroSearchQuery.trim().toLowerCase();
    if (!q) return navCountriesForSearch.slice(0, 16);
    return navCountriesForSearch
      .filter((c) => {
        const hay = [c.name_ar, c.name_en, c.name_fr, c.code].join(" ").toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 24);
  }, [heroSearchQuery, navCountriesForSearch]);

  const closeSearchModal = () => {
    setSearchModalOpen(false);
    setHeroSearchQuery("");
  };

  const goToCountryProfile = (code) => {
    navigate(`/countries?country=${encodeURIComponent(code)}#country-profile`);
  };

  const goToCountryFromHero = (code) => {
    goToCountryProfile(code);
    closeSearchModal();
  };

  useEffect(() => {
    if (!searchModalOpen) return;
    const id = window.requestAnimationFrame(() => {
      modalSearchInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [searchModalOpen]);

  useEffect(() => {
    if (!searchModalOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSearchModalOpen(false);
        setHeroSearchQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchModalOpen]);

  useEffect(() => {
    if (!searchModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [searchModalOpen]);

  /* Sponsor carousel */
  const referenceCards = useMemo(
    () => [
      ...sponsors.map((s) => ({
        href: s.href,
        img: s.img,
        title: s.title[language] || s.title.ar,
        subtitle: s.subtitle[language] || s.subtitle.ar,
      })),
      ...officialContacts.map((c) => ({
        href: `mailto:${c.emails[0]}`,
        title: getOfficialContactTitle(c, language),
        subtitle: getOfficialContactSubtitle(c, language),
        emails: c.emails,
      })),
    ],
    [language]
  );

  const sponsorSlides = useMemo(() => {
    const slides = [];
    for (let i = 0; i < referenceCards.length; i += 3) {
      slides.push(referenceCards.slice(i, i + 3));
    }
    return slides;
  }, [referenceCards]);

  useEffect(() => {
    setSponsorSlide((current) => {
      if (sponsorSlides.length === 0) return 0;
      return Math.min(current, sponsorSlides.length - 1);
    });
  }, [sponsorSlides.length]);

  useEffect(() => {
    if (sponsorSlides.length <= 1 || sponsorPaused) return;

    const timer = window.setInterval(() => {
      setSponsorSlide((current) => (current + 1) % sponsorSlides.length);
    }, REFERENCES_AUTO_SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [sponsorSlides.length, sponsorPaused]);

  const handleChatbotClick = () => alert(labels.chatbotAlert);

  return (
    <div className="min-h-screen home-page" dir={isArabic ? "rtl" : "ltr"} lang={language}
      style={{ background:isDarkMode ? "#071611" : "white", fontFamily:"'Cairo','Amiri',Georgia,serif" }}>

      {/* ═══════════════════════ GLOBAL STYLES ═══════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');

        :root {
          --forest:     #082721;
          --forest-mid: #0d3d34;
          --gold:       #c9a84c;
          --gold-light: #e8d08a;
          --gold-pale:  #f7f0dc;
          --cream:      #f5f3ef;
          --parchment:  #ede9df;
          --ink:        #1a1510;
          --muted:      #7a7060;
        }
        html.theme-dark .home-page {
          --forest:     #efe8d4;
          --forest-mid: #d1c7ad;
          --gold:       #d3b468;
          --gold-light: #efdba2;
          --gold-pale:  #1a332d;
          --cream:      #071611;
          --parchment:  #0c2620;
          --ink:        #efe8d4;
          --muted:      #b8b09d;
          color: #efe8d4;
        }
.divf9{
border-radius:13px !important;
}
        /* Noise overlay */
        body::before {
          content:''; position:fixed; inset:0; opacity:0.025;
          pointer-events:none; z-index:9999;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:180px;
        }

        /* Keyframes */
        @keyframes fadeUp      { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes revealIn    { from{opacity:0;transform:translateY(24px) scale(0.97);filter:blur(6px)} to{opacity:1;transform:translateY(0) scale(1);filter:blur(0)} }
        @keyframes shimmerGold { 0%{background-position:-300% center} 100%{background-position:300% center} }
        @keyframes floatSlow   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes pulseGlow   { 0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0.3)} 50%{box-shadow:0 0 0 10px rgba(201,168,76,0)} }
        @keyframes dotBlink    { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* Scroll reveal */
        .reveal { opacity:0; transform:translateY(24px) scale(0.97); filter:blur(6px); will-change:transform,opacity,filter; }
        .reveal.is-visible { animation:revealIn 900ms cubic-bezier(.16,1,.3,1) forwards; }
        .reveal.is-visible.d1{animation-delay:60ms}
        .reveal.is-visible.d2{animation-delay:130ms}
        .reveal.is-visible.d3{animation-delay:200ms}
        .reveal.is-visible.d4{animation-delay:280ms}
        .reveal.is-visible.d5{animation-delay:360ms}

        /* Hero */
        .hero-title  { animation:fadeUp 1s cubic-bezier(.16,1,.3,1) both; animation-delay:150ms; }
        .hero-sub    { animation:fadeUp 1s cubic-bezier(.16,1,.3,1) both; animation-delay:320ms; }
        .hero-search { animation:fadeUp 1s cubic-bezier(.16,1,.3,1) both; animation-delay:480ms; }
        .hero-overlay{ background:linear-gradient(to bottom,rgba(8,39,33,0.72) 0%,rgba(8,39,33,0.45) 55%,rgba(245,243,239,0) 100%); }

        /* Search bar */
        .search-box {
          background:rgba(255,255,255,0.82);
          backdrop-filter:blur(22px);
          border:1px solid rgba(201,168,76,0.16);
          box-shadow:0 18px 50px rgba(0,0,0,0.12);
          transition:transform 0.3s ease,background 0.3s ease,box-shadow 0.3s ease,border-color 0.3s ease;
        }
        .search-box.focused {
          background:rgba(255,255,255,0.98);
          border-color:rgba(201,168,76,0.32);
          box-shadow:0 22px 68px rgba(8,39,33,0.18);
          transform:translateY(-1px);
        }
        .search-box button {
          background:linear-gradient(135deg,#c9a84c,#f0d98a);
          border:none;
          color:#082721;
          font-weight:700;
          padding:10px 24px;
          border-radius:999px;
          cursor:pointer;
          transition:transform 0.2s ease, box-shadow 0.2s ease;
        }
        .search-box button:hover {
          transform:translateY(-1px);
          box-shadow:0 12px 24px rgba(201,168,76,0.25);
        }
        .search-box input::placeholder {
          color:rgba(8,39,33,0.45);
          opacity:1;
        }
        .search-box input {
          color:#082721;
        }

        /* Shared link style */
        .ind-link {
          display:inline-flex; align-items:center; gap:6px;
          padding:6px 18px; border:1px solid rgba(8,39,33,0.2);
          border-radius:13px; font-size:0.78rem; font-weight:700;
          color:var(--forest); letter-spacing:0.04em;
          transition:background 0.25s,border-color 0.25s,color 0.25s;
          text-decoration:none;
        }
        .ind-link:hover { background:var(--forest); color:var(--gold); border-color:var(--forest); }

        /* Trade cards */
        .trade-card {
          background:linear-gradient(135deg,var(--forest) 0%,#0d3d34 100%);
          border:1px solid rgba(201,168,76,0.2);
          transition:transform 0.35s cubic-bezier(.16,1,.3,1),box-shadow 0.35s,border-color 0.35s;
          border-radius:13px;
        }
        .trade-card:hover { transform:translateY(-8px); border-color:rgba(201,168,76,0.5); box-shadow:0 24px 48px rgba(8,39,33,0.3); }

        /* Reserve cards */
        .reserve-card {
          background:white;
          transition:transform 0.35s cubic-bezier(.16,1,.3,1),box-shadow 0.35s;
          border-radius:13px;
        }
        .reserve-card:hover { transform:translateY(-8px); box-shadow:0 24px 48px rgba(8,39,33,0.12); }

        /* Country grid */
        .country-btn { transition:transform 0.3s cubic-bezier(.16,1,.3,1); }
        .country-btn:hover { transform:translateY(-6px) scale(1.04); }
        .flag-frame { border-radius:13px; overflow:hidden; box-shadow:0 4px 16px rgba(8,39,33,0.12); border:2px solid transparent; transition:border-color 0.3s,box-shadow 0.3s; }
        .country-btn:hover .flag-frame { border-color:var(--gold); box-shadow:0 10px 28px rgba(201,168,76,0.25); }
        .country-name { font-size:0.78rem; font-weight:700; color:var(--forest); transition:color 0.2s; }
        .country-btn:hover .country-name { color:var(--gold); }

        /* Sponsor cards */
        .sponsor-card { border:1px solid rgba(8,39,33,0.08); background:white; transition:transform 0.3s,box-shadow 0.3s,border-color 0.3s; }
        .sponsor-card:hover { transform:translateY(-4px); border-color:var(--gold); box-shadow:0 16px 36px rgba(8,39,33,0.12); }
        .sponsor-card:hover .sponsor-hover { opacity:1 !important; }

        .references-carousel-viewport { overflow:hidden; height:190px; position:relative; }
        .references-carousel-track {
          display:flex; height:100%;
          transition:transform 0.75s cubic-bezier(0.16,1,0.3,1);
          will-change:transform;
        }
        .references-carousel-slide {
          min-width:100%; flex-shrink:0;
          display:grid; grid-template-columns:repeat(3,1fr); gap:12px;
          box-sizing:border-box;
        }

        /* Dark mode overrides for light surfaces in this page */
        html.theme-dark .home-page .home-surface {
          background: linear-gradient(145deg,#071e1a 0%,#082721 40%,#0a2f28 70%,#071e1a 100%) !important;
          border-color: rgba(201,168,76,0.22) !important;
          box-shadow: 0 24px 56px rgba(0,0,0,0.35) !important;
        }
        html.theme-dark .home-page .references-section-surface {
          background: linear-gradient(145deg,#071e1a 0%,#082721 40%,#0a2f28 70%,#071e1a 100%) !important;
        }
        html.theme-dark .home-page .references-carousel-viewport {
          background: rgba(8,39,33,0.45) !important;
          border-radius: 13px;
        }
        html.theme-dark .home-page .reserve-card,
        html.theme-dark .home-page .sponsor-card {
          background: #0f3129 !important;
          border-color: rgba(201,168,76,0.2) !important;
        }
        html.theme-dark .home-page .reference-slide-card,
        html.theme-dark .home-page .reference-slide-inner {
          background: linear-gradient(160deg,#0e4238 0%,#082c23 55%,#051a15 100%) !important;
          border-color: rgba(201,168,76,0.22) !important;
        }
        html.theme-dark .home-page .references-carousel-slide {
          background: transparent;
        }
        html.theme-dark .home-page .reference-slide-card .sponsor-hover {
          background: rgba(7,22,17,0.96) !important;
        }
        html.theme-dark .home-page .sponsor-hover {
          background: rgba(7,22,17,0.96) !important;
        }
          html.theme-dark input, html.theme-dark select, html.theme-dark textarea{
            background: rgba(255,255,255,0.06) !important;}
        html.theme-dark .home-page .country-name {
          color: #efe8d4;
        }
        html.theme-dark .home-page .ind-link {
          border-color: rgba(201,168,76,0.35);
          color: #efe8d4;
        }
        html.theme-dark .home-page .ind-link:hover {
          background: rgba(201,168,76,0.14);
          border-color: rgba(201,168,76,0.6);
          color: #efdba2;
        }

        html.theme-dark .home-page .divf9 {
          background: linear-gradient(145deg, #071e1a 0%, #082721 40%, #0a2f28 70%, #071e1a 100%) !important;
          border: 1px solid rgba(201, 168, 76, 0.22) !important;
          box-shadow: 0 24px 56px rgba(0, 0, 0, 0.35) !important;
        }
        html.theme-dark .home-page .divf9 .kpi-card {
          background: linear-gradient(135deg, #082721 0%, #0d3d34 100%) !important;
        }
        html.theme-dark section {
          background: none !important;
        }
        html.theme-dark main {
          background: none !important;
        }
       
        /* Chatbot CTA */
        .chat-cta { background:linear-gradient(135deg,var(--forest) 0%,#0d3d34 60%,#102e28 100%); border:1px solid rgba(201,168,76,0.25); position:relative; overflow:hidden; }
        .chat-cta::before { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:radial-gradient(ellipse at 70% 50%,rgba(201,168,76,0.07) 0%,transparent 60%); animation:floatSlow 8s ease-in-out infinite; }
        html.theme-dark .chat-cta { background:linear-gradient(135deg,#0f4a3f 0%,#083c33 60%,#051f1a 100%); border:1px solid rgba(201,168,76,0.35); }
        html.theme-dark .chat-cta::before { background:radial-gradient(ellipse at 70% 50%,rgba(201,168,76,0.12) 0%,transparent 60%); }

        /* Float button */
        .float-btn { background:var(--forest); border:1px solid rgba(201,168,76,0.3); animation:pulseGlow 3s ease-in-out infinite; transition:transform 0.3s,box-shadow 0.3s; }
        .float-btn:hover { transform:translateY(-4px) scale(1.03); box-shadow:0 20px 50px rgba(8,39,33,0.45),0 0 0 1px rgba(201,168,76,0.5); }

        /* Misc */
        .online-dot  { animation:dotBlink 2s ease-in-out infinite; }
        .scroll-hint { animation:floatSlow 3s ease-in-out infinite; }
        a { text-decoration:none; }
      `}</style>

      <Menu />

      {/* ═══════════════════════ HERO ═══════════════════════ */}
<header className="relative z-[9] overflow-hidden" style={{ height:"100vh", minHeight:600, maxHeight:800 }}>

        {/* --- VIDÉO & OVERLAYS --- */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={bgHeaderVideo} autoPlay loop muted playsInline
        />
        
        <div className="hero-overlay absolute inset-0 bg-black/40" />

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:"linear-gradient(rgba(201,168,76,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.06) 1px,transparent 1px)",
          backgroundSize:"80px 80px",
        }} />

        {/* --- CONTENU PRINCIPAL --- */}
        <div className="relative z-[20] h-full flex flex-col items-center justify-center text-center px-6">

          {/* Badge */}
          <div className="hero-title" style={{ marginBottom:24 }}>
            <span style={{ display:"inline-block", background:"rgba(201,168,76,0.15)", border:"1px solid rgba(201,168,76,0.4)", color:"#c9a84c", padding:"4px 20px", fontSize:"0.75rem", fontWeight:700, letterSpacing:"0.15em", borderRadius:2, textTransform:"uppercase" }}>
              {labels.heroBadge}
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-title text-white"
            style={{ fontSize:"clamp(2rem,5vw,4rem)", fontWeight:900, lineHeight:1.15, letterSpacing:"-0.02em", textShadow:"0 4px 40px rgba(0,0,0,0.4)", maxWidth:800, margin:"0 0 1rem" }}>
            {labels.heroTitleStart}{" "}
            <span style={{ display:"inline-block", background:"linear-gradient(120deg,#c9a84c 0%,#f0d98a 40%,#c9a84c 60%,#8a6a1e 100%)", backgroundSize:"300% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmerGold 6s linear infinite" }}>
              {labels.heroTitleAccent}
            </span>
          </h1>

          {/* Sub */}
          <p className="hero-sub"
            style={{ color:"rgba(255,255,255,0.72)", fontSize:"clamp(0.9rem,1.8vw,1.15rem)", maxWidth:560, lineHeight:1.8, margin:"0 0 2.5rem" }}>
            {labels.heroSubtitle}
          </p>

          {/* Recherche pays : clic ouvre une popup (au-dessus du menu z-900) */}
          <div className="hero-search relative z-[1020] isolate w-full" style={{ maxWidth:580 }}>
            <button
              type="button"
              className={`search-box flex w-full cursor-pointer items-center gap-3 rounded-[28px] px-5 py-3 text-left ${searchModalOpen ? "focused" : ""}`}
              style={{
                borderRadius: 28,
                background: "rgba(255,255,255,0.92)",
                boxShadow: searchModalOpen ? "0 20px 60px rgba(8,39,33,0.18)" : "0 16px 48px rgba(0,0,0,0.12)",
                transition: "all 0.3s ease",
                border: "none",
                font: "inherit",
              }}
              onClick={() => setSearchModalOpen(true)}
              dir={isArabic ? "rtl" : "ltr"}
            >
              <span
                style={{
                  background: "linear-gradient(135deg,#c9a84c,#f0d98a)",
                  color: "#082721",
                  padding: "10px 24px",
                  borderRadius: 999,
                  fontSize: "0.9rem",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {labels.smartSearch}
              </span>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  color: "rgba(8,39,33,0.55)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  textAlign: isArabic ? "right" : "left",
                }}
              >
                {labels.searchTapToOpen}
              </span>
              <AppIcon name="fa-search" size={18} style={{ color: "rgba(8,39,33,0.65)", flexShrink: 0 }} />
            </button>
          </div>
          
        </div>

        {/* --- SHAPE DIVIDER (VAGUE DYNAMIQUE CLAIR/SOMBRE) --- */}
        {/* Le translateY(2px) empêche de voir une fine ligne de coupure avec la section suivante */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-[15]" style={{ transform: "translateY(2px)" }}>
          {/* L'attribut preserveAspectRatio="none" permet à la vague de s'étirer sur toute la largeur */}
          <svg className="relative block w-full h-[60px] md:h-[100px] lg:h-[140px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            
            {/* Couche 1 : Vague arrière (semi-transparente pour la profondeur) */}
            <path 
              fill={isDarkMode ? "#082721" : "#ffffff"} 
              fillOpacity="0.3" 
              className="transition-colors duration-500"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
            </path>
            
            {/* Couche 2 : Vague principale (solide) */}
            <path 
              fill={isDarkMode ? "#082721" : "#ffffff"} 
              fillOpacity="1" 
              className="transition-colors duration-500"
              d="M0,128L48,149.3C96,171,192,213,288,229.3C384,245,480,256,576,234.7C672,213,768,160,864,144C960,128,1056,149,1152,165.3C1248,181,1344,181,1392,181.3L1440,181.3L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
            </path>
            
          </svg>
        </div>

    </header>

      {/* ═══════════════════════ MAIN ═══════════════════════ */}
      <main style={{ maxWidth:1400, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* ── KPIs ── */}
   
      <section className="reveal d2" style={{ marginTop: "-210px", position: "relative", zIndex: 10, padding: "0 16px" }}>
  <div className="divf9" style={{ 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
    gap: "20px", 
    padding: "24px",
    
  }}>
    {kpiData.map((k, i) => <KpiCard key={i} k={k} labels={labels} />)}
  </div>
</section>

        {/* ── PRODUCTION INDICATORS ── */}
        <section className="reveal d3"  style={{textAlign:"center",
          marginTop:72,
            background:"linear-gradient(145deg,#071e1a 0%,#082721 40%,#0a2f28 70%,#071e1a 100%)",
            borderRadius:13, padding:"40px 36px",
            boxShadow:"0 40px 80px rgba(8,39,33,0.35),inset 0 0 0 1px rgba(201,168,76,0.08)",
          }}> <h3 style={{ fontSize:"1.6rem", fontWeight:900, color:"white" }}>
                  <span style={{  background:"linear-gradient(120deg,#c9a84c 0%,#f0d98a 40%,#c9a84c 60%,#8a6a1e 100%)", backgroundSize:"300% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmerGold 6s linear infinite" }}>
                    {labels.miningIndicatorsSection}
                  </span>
                </h3></section>
        <section className="reveal d3" style={{ marginTop:16 }}>
          <div style={{
            background:"linear-gradient(145deg,#071e1a 0%,#082721 40%,#0a2f28 70%,#071e1a 100%)",
            border:"1px solid rgba(201,168,76,0.22)",
            borderRadius:13, padding:"40px 36px",
            position:"relative", overflow:"hidden",
            boxShadow:"0 40px 80px rgba(8,39,33,0.35),inset 0 0 0 1px rgba(201,168,76,0.08)",
          }}>
            {/* Glow blobs */}
            <div style={{ position:"absolute", top:-80, right:-80, width:360, height:360, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(201,168,76,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:-60, left:-60, width:280, height:280, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(78,199,162,0.05) 0%,transparent 70%)", pointerEvents:"none" }} />
            {/* Grid lines */}
            <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(201,168,76,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.03) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />

            {/* Header */}
            <div style={{ position:"relative", zIndex:1, display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:32, flexWrap:"wrap", gap:12 }}>
              <div>
                <span style={{ display:"inline-flex", alignItems:"center",marginBottom:"20px", gap:8, padding:"5px 16px", background:"rgba(201,168,76,0.12)", color:"white", border:"1px solid rgba(201,168,76,0.3)", borderRadius:13, fontSize:"0.78rem", fontWeight:700, letterSpacing:"0.08em" }}>
                  <AppIcon name="fa-pickaxe" size={15} strokeWidth={2.2} /> {labels.miningProductionTag}
                </span>
               <br />
                <p style={{ fontSize:"0.8rem", color:"rgba(255,255,255,0.4)", margin:0 }}>{labels.productionSummary(formatInt(portalStats.productionIndicatorCount, numberLocale))}</p>
              </div>
              <a href="/m1" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 20px", border:"1px solid rgba(201,168,76,0.35)", borderRadius:13, fontSize:"0.78rem", fontWeight:700, color:"var(--gold)", letterSpacing:"0.04em", textDecoration:"none", background:"rgba(201,168,76,0.08)" }}>
                <AppIcon name="fa-arrow-left" size={14} strokeWidth={2.4} /> {labels.goToIndicators}
              </a>
            </div>

            {/* Divider */}
            <div style={{ height:1, background:"linear-gradient(to right,transparent,rgba(201,168,76,0.4),transparent)", marginBottom:28, position:"relative", zIndex:1 }} />

            {/* Cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:14, position:"relative", zIndex:1 }}>
              {INDICATOR_CARDS.map((card, i) => <IndicatorRowCard key={i} card={card} labels={labels} />)}
            </div>

            {/* Footer */}
            <div style={{ position:"relative", zIndex:1, marginTop:28, paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#4ade80", display:"inline-block", boxShadow:"0 0 8px rgba(74,222,128,0.5)" }} />
              <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.35)" }}>
                {labels.updatedDataSummary(portalStats.minYear, portalStats.maxYear, formatInt(portalStats.countryCount, numberLocale))}
              </span>
            </div>
          </div>
        </section>
        <section className="reveal d3"  style={{textAlign:"center",
          marginTop:72,
            background:"linear-gradient(145deg,#071e1a 0%,#082721 40%,#0a2f28 70%,#071e1a 100%)",
            borderRadius:13, padding:"40px 36px",
            boxShadow:"0 40px 80px rgba(8,39,33,0.35),inset 0 0 0 1px rgba(201,168,76,0.08)",
          }}> <h3 style={{ fontSize:"1.6rem", fontWeight:900, color:"white" }}>
                  <span style={{  background:"linear-gradient(120deg,#c9a84c 0%,#f0d98a 40%,#c9a84c 60%,#8a6a1e 100%)", backgroundSize:"300% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmerGold 6s linear infinite" }}>
                   {labels.tradeIndicatorsSection}
                  </span>
                </h3>
                </section>
        {/* ── TRADE ── */}
        <section className="reveal d3" style={{ marginTop:16 }}>
          <div style={{
            background:"linear-gradient(145deg,#071e1a 0%,#082721 40%,#0a2f28 70%,#071e1a 100%)",
            border:"1px solid rgba(201,168,76,0.22)",
            borderRadius:13, padding:"40px 36px",
            position:"relative", overflow:"hidden",
            boxShadow:"0 40px 80px rgba(8,39,33,0.35),inset 0 0 0 1px rgba(201,168,76,0.08)",
          }}>
            {/* Glow blobs */}
            <div style={{ position:"absolute", top:-80, right:-80, width:360, height:360, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(201,168,76,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:-60, left:-60, width:280, height:280, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(78,199,162,0.05) 0%,transparent 70%)", pointerEvents:"none" }} />
            {/* Grid lines */}
            <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(201,168,76,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.03) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />

            {/* Header */}
            
            <div style={{ position:"relative", zIndex:1, display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:32, flexWrap:"wrap", gap:12 }}>
              <div>
                <span style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 16px", background:"rgba(201,168,76,0.12)", color:"white", border:"1px solid rgba(201,168,76,0.3)", borderRadius:13, fontSize:"0.78rem", fontWeight:700, letterSpacing:"0.08em" }}>
                  <AppIcon name="fa-right-left" size={15} strokeWidth={2.2} />
                  {labels.tradeTag}
                </span>
                <br />
               
              </div>
              <a href="/trade-indicators" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 20px", border:"1px solid rgba(201,168,76,0.35)", borderRadius:13, fontSize:"0.78rem", fontWeight:700, color:"var(--gold)", letterSpacing:"0.04em", textDecoration:"none", background:"rgba(201,168,76,0.08)" }}>
                <AppIcon name="fa-arrow-left" size={14} strokeWidth={2.4} /> {labels.allTradeIndicators}
              </a>
            </div>

            {/* Divider */}
            <div style={{ height:1, background:"linear-gradient(to right,transparent,rgba(201,168,76,0.4),transparent)", marginBottom:28, position:"relative", zIndex:1 }} />

            {/* Cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:14, position:"relative", zIndex:1 }}>
              {TRADE_CARDS.map((card, i) => {
                const accent = i === 0 ? "#c9a84c" : "#7ee0c0";
                return <TradeCard key={i} card={card} accent={accent} labels={labels} />;
              })}
            </div>

            {/* Footer */}
            <div style={{ position:"relative", zIndex:1, marginTop:28, paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#4ade80", display:"inline-block", boxShadow:"0 0 8px rgba(74,222,128,0.5)" }} />
              <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.35)" }}>
                {labels.tradeTotals(formatInt(portalStats.exportTotal, numberLocale), formatInt(portalStats.importTotal, numberLocale))}
              </span>
            </div>
          </div>
        </section>

        {/* ── RESERVES ── */}
        {/* <section className="reveal d3" style={{ marginTop:72 }}>
          <SectionHeader icon="fa-gem" tag="احتياطيات الخام" title="احتياطيات الموارد التعدينية" />
          <GoldDivider />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 }}>
            {RESERVE_CARDS.map((card, i) => (
              <div key={i} className="reserve-card" style={{ padding:24, borderTop:`3px solid ${card.accent}` }}>
                <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:16 }}>
                  <div style={{ width:44, height:44, background:card.bg, borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", color:card.accent, fontSize:"1rem", flexShrink:0 }}>
                    <i className={`fas ${card.icon}`} />
                  </div>
                  <div>
                    <p style={{ fontSize:"0.95rem", fontWeight:800, color:"var(--forest)", margin:"0 0 6px" }}>{card.title}</p>
                    <p style={{ fontSize:"0.8rem", color:"var(--muted)", lineHeight:1.7, margin:0 }}>{card.desc}</p>
                  </div>
                </div>
                <ul style={{ paddingRight:18, margin:"0 0 16px", listStyle:"none" }}>
                  {card.bullets.map((b, j) => (
                    <li key={j} style={{ fontSize:"0.76rem", color:"var(--muted)", marginBottom:4, display:"flex", gap:8 }}>
                      <span style={{ color:card.accent }}>◆</span>{b}
                    </li>
                  ))}
                </ul>
                <a href={card.href} className="ind-link"><i className="fas fa-arrow-left" /> المزيد</a>
              </div>
            ))}
          </div>
        </section> */}

        {/* ── COUNTRIES ── */}
        <section className="reveal d4" style={{ marginTop:72 }}>
          <div className="home-surface" style={{ background:"white", border:"1px solid rgba(8,39,33,0.08)", borderRadius:13, padding:32 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:8, flexWrap:"wrap", gap:12 }}>
              <div>
                <span style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", background:"var(--forest)", color:"var(--gold)", borderRadius:13, fontSize:"0.8rem", fontWeight:700, letterSpacing:"0.08em" }}>
                  <AppIcon name="fa-flag" size={14} strokeWidth={2.2} /> {labels.memberStates}
                </span>
                <h5 style={{ fontSize:"1.2rem", fontWeight:900, color:"var(--forest)", margin:"10px 0 4px" }}>{labels.arabCountriesTitle}</h5>
                <p style={{ fontSize:"0.8rem", color:"var(--muted)", margin:0 }}>{labels.chooseCountry}</p>
              </div>
              <a href="/countries" className="ind-link"><AppIcon name="fa-arrow-left" size={14} strokeWidth={2.4} /> {labels.viewAll}</a>
            </div>

            <GoldDivider />

            <div className="countries-responsive-grid">
              {countries.map(c => (
                <a key={c.code} href={`/countries?country=${c.code}#country-profile`} className="country-btn"
                  onClick={() => setSelectedCountryCode(c.code)}
                  style={{ background:"none", border:"none", cursor:"pointer", textAlign:"center", padding:0 }}>
                  <div className="flag-frame" style={{ width:"100%", aspectRatio:"3/2" }}>
                    <img src={countryFlags[c.code]} alt={getCountryLabel(c.code, language)}
                      style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                      loading="lazy" />
                  </div>
                  <p className="country-name" style={{ margin:"8px 0 0", fontSize:"0.68rem", lineHeight:1.4 }}>{getCountryLabel(c.code, language)}</p>
                </a>
              ))}
            </div>

            <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid rgba(8,39,33,0.08)", fontSize:"0.8rem", color:"var(--muted)" }}>
              {labels.selectedCountry}{" "}
              <span style={{ fontWeight:800, color:"var(--forest)" }}>{selectedCountryCode ? getCountryLabel(selectedCountryCode, language) : labels.none}</span>
            </div>
          </div>
        </section>

        {/* ── SOURCES / SPONSORS ── */}
        <section className="reveal d4" style={{ marginTop:56 }}>
          <div
            className="home-surface references-section-surface"
            style={{
              background: isDarkMode
                ? "linear-gradient(145deg,#071e1a 0%,#082721 40%,#0a2f28 70%,#071e1a 100%)"
                : "white",
              border: isDarkMode ? "1px solid rgba(201,168,76,0.22)" : "1px solid rgba(8,39,33,0.08)",
              borderRadius: 13,
              padding: 32,
              boxShadow: isDarkMode ? "0 24px 56px rgba(0,0,0,0.35)" : undefined,
            }}
          >
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24, flexWrap:"wrap", gap:12 }}>
              <div>
                <span style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", background:"var(--forest)", color:"var(--gold)", borderRadius:13, fontSize:"0.8rem", fontWeight:700, letterSpacing:"0.08em" }}>
                  <AppIcon name="fa-books" size={14} strokeWidth={2.2} /> {labels.referencesTag}
                </span>
                <h2 style={{ fontSize:"1.2rem", fontWeight:900, color: isDarkMode ? "#efe8d4" : "var(--forest)", margin:"10px 0 0" }}>{labels.referencesTitle}</h2>
              </div>
            </div>

            {/* Carousel — glissement horizontal automatique (pause au survol) */}
            <div
              className="references-carousel-viewport p-5"
              style={isDarkMode ? { background: "rgba(8,39,33,0.45)", borderRadius: 13 } : undefined}
              onMouseEnter={() => setSponsorPaused(true)}
              onMouseLeave={() => setSponsorPaused(false)}
              onFocusCapture={() => setSponsorPaused(true)}
              onBlurCapture={() => setSponsorPaused(false)}
            >
              <div
                className="references-carousel-track"
                style={{
                  transform: isArabic
                    ? `translateX(${sponsorSlide * 100}%)`
                    : `translateX(-${sponsorSlide * 100}%)`,
                }}
              >
              {sponsorSlides.map((slide, idx) => (
                <div key={idx} className="references-carousel-slide">
                  {slide.map((s, si) => (
                    <ReferenceCarouselCard key={`${idx}-${si}`} item={s} />
                  ))}
                </div>
              ))}
              </div>
            </div>

            {/* Dots */}
            <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:16 }}>
              {sponsorSlides.map((_, i) => (
                <button key={i} type="button" onClick={() => setSponsorSlide(i)}
                  style={{ width:i===sponsorSlide?20:6, height:6, borderRadius:13, border:"none", cursor:"pointer", background:i===sponsorSlide?"var(--gold)":"rgba(8,39,33,0.15)", transition:"all 0.3s", padding:0 }} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CHATBOT CTA ── */}
        <section style={{ marginTop:56 }}>
          <div className="chat-cta" style={{ borderRadius:13, padding:"40px 24px", textAlign:"center" }}>
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(201,168,76,0.12)", border:"1px solid rgba(201,168,76,0.3)", color:"var(--gold)", padding:"4px 16px", borderRadius:13, fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.1em", marginBottom:20 }}>
                <span className="online-dot" style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", display:"inline-block" }} />
                {labels.assistantAvailable}
              </div>
              <h2 style={{ fontSize:"1.8rem", fontWeight:900, color:"white", margin:"0 0 12px" }}>
               {" "}
                <span style={{ background:"linear-gradient(120deg,#c9a84c 0%,#f0d98a 40%,#c9a84c 60%,#8a6a1e 100%)", backgroundSize:"300% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmerGold 6s linear infinite" }}>
                  {labels.intelligentAssistant}
                </span>
              </h2>
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"0.88rem", maxWidth:460, margin:"0 auto 28px", lineHeight:1.8 }}>
                {labels.assistantSubtitle}
              </p>
              <button type="button" onClick={handleChatbotClick}
                style={{ display:"inline-flex", alignItems:"center", gap:10, background:"linear-gradient(135deg,#c9a84c,#e8d08a)", color:isDarkMode ? "#082721" : "var(--forest)", padding:"12px 32px", borderRadius:13, border:"none", cursor:"pointer", fontSize:"0.88rem", fontWeight:800, letterSpacing:"0.04em", boxShadow:"0 8px 24px rgba(201,168,76,0.3)" }}>
                <AppIcon name="fa-robot" size={16} strokeWidth={2.2} /> {labels.startChat}
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <div className="reveal d5"><Footer /></div>

      {/* ── POPUP RECHERCHE PAYS (au-dessus du menu fixe) ── */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4 font-['Cairo',sans-serif]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="home-search-modal-title"
          dir={isArabic ? "rtl" : "ltr"}
        >
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default border-0 bg-black/55 backdrop-blur-sm"
            aria-label={labels.closeModal}
            onClick={closeSearchModal}
          />
          <div
            className="relative z-[1] flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-2xl"
            style={{
              background: isDarkMode ? "linear-gradient(180deg,#0f3129 0%,#071611 100%)" : "#ffffff",
              border: isDarkMode ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(8,39,33,0.12)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div
              className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 sm:px-5"
              style={{ borderColor: isDarkMode ? "rgba(201,168,76,0.2)" : "rgba(8,39,33,0.08)" }}
            >
              <h2
                id="home-search-modal-title"
                className="m-0 text-base font-black sm:text-lg"
                style={{ color: isDarkMode ? "#efe8d4" : "#082721" }}
              >
                {labels.searchModalTitle}
              </h2>
              <button
                type="button"
                onClick={closeSearchModal}
                className="flex items-center justify-center rounded-xl p-2 transition-colors hover:bg-black/10"
                style={{ color: isDarkMode ? "#c9a84c" : "#082721" }}
                aria-label={labels.closeModal}
              >
                <X size={22} strokeWidth={2.2} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              <input
                ref={modalSearchInputRef}
                type="text"
                value={heroSearchQuery}
                onChange={(e) => setHeroSearchQuery(e.target.value)}
                placeholder={labels.searchPlaceholder}
                autoComplete="off"
                className="w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none transition-shadow focus:ring-2 focus:ring-[#C9A84C]/50"
                style={{
                  background: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(8,39,33,0.04)",
                  borderColor: isDarkMode ? "rgba(201,168,76,0.25)" : "rgba(8,39,33,0.12)",
                  color: isDarkMode ? "#efe8d4" : "#082721",
                  textAlign: isArabic ? "right" : "left",
                }}
              />
              <p className="mt-2 text-xs leading-relaxed" style={{ color: isDarkMode ? "rgba(239,232,212,0.55)" : "rgba(8,39,33,0.55)" }}>
                {labels.searchModalHint}
              </p>
              <p
                className="mb-2 mt-4 text-[10px] font-black uppercase tracking-wider"
                style={{ color: "#c9a84c" }}
              >
                {labels.arabCountriesTitle}
              </p>
              <div
                className="max-h-[min(42vh,320px)] overflow-y-auto rounded-xl border"
                style={{
                  borderColor: isDarkMode ? "rgba(201,168,76,0.2)" : "rgba(8,39,33,0.1)",
                  background: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(8,39,33,0.03)",
                }}
              >
                {!navCountriesForSearch.length ? (
                  <p className="px-4 py-6 text-center text-sm" style={{ color: isDarkMode ? "rgba(239,232,212,0.5)" : "rgba(8,39,33,0.5)" }}>
                    {labels.noSearchResults}
                  </p>
                ) : heroSearchQuery.trim() && displayModalCountries.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm" style={{ color: isDarkMode ? "rgba(239,232,212,0.5)" : "rgba(8,39,33,0.5)" }}>
                    {labels.noSearchResults}
                  </p>
                ) : (
                  displayModalCountries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => goToCountryFromHero(c.code)}
                      className="flex w-full items-center gap-3 border-b px-4 py-3 text-left text-sm font-bold transition-colors last:border-b-0 hover:bg-[#C9A84C]/12"
                      style={{
                        color: isDarkMode ? "#efe8d4" : "#082721",
                        borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(8,39,33,0.06)",
                        flexDirection: isArabic ? "row-reverse" : "row",
                        textAlign: isArabic ? "right" : "left",
                      }}
                    >
                      <Map size={18} className="flex-shrink-0 text-[#C9A84C]" />
                      <span className="min-w-0 flex-1 truncate">{countrySearchLabel(c)}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING BOT BUTTON ── */}
      <button type="button" onClick={handleChatbotClick} title={labels.floatingBotSubtitle} className="float-btn"
        style={{
          position:"fixed",
          bottom:24,
          [isArabic ? "right" : "left"]:24,
          zIndex:990,
          display:"flex",
          alignItems:"center",
          gap:12,
          padding:"10px 16px 10px 12px",
          borderRadius:13,
          cursor:"pointer",
          background:isDarkMode ? "#0b2922" : "var(--forest)",
          border:isDarkMode ? "1px solid rgba(201,168,76,0.45)" : "1px solid rgba(201,168,76,0.3)",
        }}>
        <span className="online-dot" style={{ position:"absolute", top:8, right:8, width:8, height:8, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 0 3px rgba(74,222,128,0.25)" }} />
        <div style={{ width:42, height:42, borderRadius:13, background:isDarkMode ? "linear-gradient(135deg,rgba(201,168,76,0.28),rgba(201,168,76,0.12))" : "linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.08))", border:"1px solid rgba(201,168,76,0.4)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--gold)", fontSize:"1.1rem" }}>
          <AppIcon name="fa-robot" size={18} strokeWidth={2.2} />
        </div>
        <div style={{ display:"flex", flexDirection:"column", textAlign:isArabic ? "right" : "left" }}>
          <span style={{ fontSize:"0.82rem", fontWeight:800, color:"var(--gold)", lineHeight:1 }}>{labels.floatingBotTitle}</span>
          <span style={{ fontSize:"0.7rem", color:isDarkMode ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.5)", marginTop:2 }}>{labels.floatingBotSubtitle}</span>
        </div>
      </button>

    </div>
  );
};

export default Home;