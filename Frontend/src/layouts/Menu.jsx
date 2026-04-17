import { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import { getCurrentUser, logout, isAuthenticated, isAdmin } from "../services/authService";
import { User } from "lucide-react";

// ─── Replace with your real imports ──────────────────────────────────────────
import logoAmip from "../assets/logo n v.png";
import logoAidsmo from "../assets/aidsmo logo sans bg 800x 800.png";

// ─── Translations ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  ar: {
    home: "الرئيسية",
    indicators: "المؤشرات التعدينية",
    mainAxes: "المحاور الرئيسية",
    miningProduction: "الانتاج التعديني",
    productionVolume: "حجم الإنتاج التعديني",
    productionTrend: "تطور الإنتاج التعديني",
    arabicProductionTrend: "تطور الإنتاج التعديني العربي",
    productionComparison: "نسبة الإنتاج العربي مقارنة بالإنتاج العالمي",
    miningTrade: "التجارة التعدينية",
    exports: "الصادرات التعدينية",
    imports: "الواردات التعدينية",
    arabCountries: "الدول العربية",
    about: "عن البوابة",
    quickSearch: "بحث سريع",
    smartReports: "التقارير الذكية",
    language: "اللغة",
    darkMode: "الوضع الليلي",
    lightMode: "الوضع النهاري",
  },
  fr: {
    home: "Accueil",
    indicators: "Indicateurs Miniers",
    mainAxes: "Axes Principaux",
    miningProduction: "Production Minière",
    productionVolume: "Volume de Production Minière",
    productionTrend: "Évolution de la Production Minière",
    arabicProductionTrend: "Évolution de la Production Minière Arabe",
    productionComparison: "Part de la Production Arabe par rapport à la Production Mondiale",
    miningTrade: "Commerce Minier",
    exports: "Exportations Minières",
    imports: "Importations Minières",
    arabCountries: "Pays Arabes",
    about: "À Propos du Portail",
    quickSearch: "Recherche Rapide",
    smartReports: "Rapports Intelligents",
    language: "Langue",
    darkMode: "Mode Nuit",
    lightMode: "Mode Jour",
  },
  en: {
    home: "Home",
    indicators: "Mining Indicators",
    mainAxes: "Main Axes",
    miningProduction: "Mining Production",
    productionVolume: "Mining Production Volume",
    productionTrend: "Mining Production Trend",
    arabicProductionTrend: "Arabic Mining Production Trend",
    productionComparison: "Arabic Production Share vs Global Production",
    miningTrade: "Mining Trade",
    exports: "Mining Exports",
    imports: "Mining Imports",
    arabCountries: "Arab Countries",
    about: "About the Portal",
    quickSearch: "Quick Search",
    smartReports: "Smart Reports",
    language: "Language",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const INDICATORS = [
  {
    label: "انتاج التعدين",
    key: "prod",
    labelKey: "miningProduction",
    items: [
      { label: "حجم الإنتاج التعديني", labelKey: "productionVolume", href: "/m1" },
      { label: "تطور الإنتاج التعديني", labelKey: "productionTrend", href: "/m2" },
      { label: "تطور الإنتاج التعديني العربي", labelKey: "arabicProductionTrend", href: "/m3" },
      { label: "نسبة الإنتاج العربي مقارنة بالإنتاج العالمي", labelKey: "productionComparison", href: "/m4" },
    ],
  },
  {
    label: "التجارة التعدينية",
    key: "trade",
    labelKey: "miningTrade",
    items: [
      { label: "الصادرات التعدينية", labelKey: "exports", href: "/m5" },
      { label: "الواردات التعدينية", labelKey: "imports", href: "/m6" },
    ],
  },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const ChevronDown = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const ChevronLeft = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const SearchIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
  </svg>
);
const DocIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const LoginIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);
const GlobeIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
  </svg>
);
const MoonIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
  </svg>
);
const SunIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4" />
    <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
  </svg>
);

// ─── Desktop sub-menu (React hover + delay, opens to the right/end in RTL) ─────
const DesktopSubMenu = ({ section, t }) => {
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);

  const onEnter = () => {
    if (closeRef.current) { clearTimeout(closeRef.current); closeRef.current = null; }
    setOpen(true);
  };
  const onLeave = () => {
    clearTimeout(closeRef.current);
    closeRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
  <div
    className={`dd-sub-trigger relative ${open ? "dd-sub-open" : ""}`}
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
  >
    <div
      dir="rtl"
      className="flex items-center justify-between rounded-xl px-4 py-2.5 cursor-pointer
                 hover:bg-[#C9A84C]/10 transition-colors group/row"
    >
      <span dir="rtl" className="text-[14px] font-bold text-white/90">{t(section.labelKey)}</span>
      <ChevronLeft className="w-3 h-3 text-[#C9A84C]/40 group-hover/row:text-[#C9A84C] transition-colors flex-shrink-0" />
    </div>
    {/* Sub-panel — positioned to the END (left in RTL) */}
    <div
      className="dd-sub-panel absolute top-0 right-full mr-2 w-[256px] rounded-2xl overflow-hidden z-50"
      style={{
        background: "linear-gradient(145deg,#0f4035 0%,#082721 100%)",
        border: "1px solid rgba(201,168,76,0.25)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.55)",
      }}
    >
      <div className="px-4 py-2.5 border-b border-[#C9A84C]/20">
        <p className="text-[10px] text-[#C9A84C]/70 uppercase tracking-widest truncate">{t(section.labelKey)}</p>
      </div>
      <ul className="p-2 space-y-0.5">
        {section.items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] text-white/80
                         hover:bg-[#C9A84C]/15 hover:text-white transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/50 flex-shrink-0" />
              {t(item.labelKey)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </div>
  );
};

// ─── Mobile accordion (React-controlled, smooth height animation) ─────────────
const MobileAccordion = ({ label, children, level = 0 }) => {
  const [open, setOpen] = useState(false);
  const innerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!innerRef.current) return;
    if (open) {
      // measure after paint so children are fully rendered
      requestAnimationFrame(() => {
        setHeight(innerRef.current?.scrollHeight ?? 0);
      });
    } else {
      setHeight(0);
    }
  }, [open]);

  // Re-measure when children change (nested accordion opens)
  useEffect(() => {
    if (open && innerRef.current) {
      setHeight(innerRef.current.scrollHeight);
    }
  });

  const rowCls = level === 0
    ? "px-4 py-3 text-[15px]"
    : "px-3 py-2.5 text-[14px]";
  const indentCls = level === 0
    ? "border-s-2 border-[#C9A84C]/30 ps-3 ms-4"
    : "border-s border-[#C9A84C]/20 ps-3 ms-3";

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between rounded-xl ${rowCls} font-bold
                    text-white/90 hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] transition-colors`}
      >
        <span>{label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#C9A84C]/60 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div style={{ height, overflow: "hidden", transition: "height 0.28s cubic-bezier(0.4,0,0.2,1)" }}>
        <div ref={innerRef} className={`${indentCls} pb-1 mt-1 space-y-0.5`}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ─── Main Menu ────────────────────────────────────────────────────────────────
const Menu = () => {
  const { language, changeLanguage } = useContext(LanguageContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [isHome,     setIsHome]     = useState(true);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const closeTimeoutRef = useRef(null);

  // Helper function to get translation
  const t = (key) => TRANSLATIONS[language]?.[key] || key;

  const openMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMenuOpen(true);
  };

  const closeMenu = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => setMenuOpen(false), 150);
  };

  const cycleLanguage = () => {
    const languages = ["ar", "fr", "en"];
    const currentIndex = languages.indexOf(language);
    const nextLanguage = languages[(currentIndex + 1) % languages.length];
    changeLanguage(nextLanguage);
  };

  const getLanguageDisplay = () => {
    const displays = { ar: "العربية", fr: "Français", en: "English" };
    return displays[language] || language.toUpperCase();
  };

  useEffect(() => {
    if (typeof window !== "undefined") setIsHome(window.location.pathname === "/");
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const openSearch = () =>
    document.getElementById("quickSearchModal")
      ?.dispatchEvent(new CustomEvent("open-modal"));

  const navBg = isHome
    ? scrolled
      ? "bg-[#082721]/96 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
      : "bg-transparent"
    : "bg-[#082721] shadow-[0_2px_20px_rgba(0,0,0,0.4)]";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        /* ── Desktop dropdown ── */
        .dd-trigger { position: relative; }
        .dd-panel {
          opacity: 0; pointer-events: none;
          transform: translateY(8px) scale(0.97);
          transition: opacity .2s ease, transform .2s ease;
        }
        .dd-trigger:hover .dd-panel,
        .dd-trigger:focus-within .dd-panel,
        .dd-trigger.dd-open .dd-panel {
          opacity: 1; pointer-events: auto;
          transform: translateY(0) scale(1);
        }

        /* ── Desktop sub-panel ── */
        .dd-sub-trigger { position: relative; }
        .dd-sub-panel {
          opacity: 0; pointer-events: none;
          transform: translateX(8px) scale(0.97);
          transition: opacity .18s ease, transform .18s ease;
        }
        .dd-sub-trigger:hover .dd-sub-panel,
        .dd-sub-trigger:focus-within .dd-sub-panel,
        .dd-sub-trigger.dd-sub-open .dd-sub-panel {
          opacity: 1; pointer-events: auto;
          transform: translateX(0) scale(1);
        }

        /* ── Nav link underline ── */
        .nav-link { position: relative; }
        .nav-link::after {
          content: ''; position: absolute;
          bottom: -2px; right: 0;
          height: 2px; width: 0;
          background: #C9A84C; border-radius: 2px;
          transition: width .25s ease;
        }
        .nav-link:hover::after { width: 100%; }

        /* ── Separator between nav items ── */
        .nav-sep + .nav-sep::before {
          content: '';
          display: inline-block;
          width: 1px; height: 14px;
          background: rgba(201,168,76,0.3);
          vertical-align: middle;
          margin: 0 4px;
        }
      `}</style>

      {/* Gold top bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-50"
           style={{ background: "linear-gradient(90deg,#8B2500,#C9A84C 50%,#082721)" }} />

      <nav
        dir={language === "ar" ? "rtl" : "ltr"}
        className={`fixed top-[3px] left-0 right-0 z-40 transition-all duration-400 ${navBg}`}
        style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}
      >
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[66px] items-center justify-between gap-3  ">

            {/* ── Logo ─────────────────────────────────────────────────────── */}
            <div
              className="flex items-center gap-3 rounded-full px-4 py-2 transition-colors"
              style={{
                background: "#ffffff",
                border: isDarkMode ? "1px solid rgba(201,168,76,0.28)" : "1px solid rgba(8,39,33,0.08)",
                boxShadow: "0 4px 14px rgba(8,39,33,0.08)",
              }}
            >
            <a href="/" aria-label="AMIP" className="flex-shrink-0 ">
              <img
                src={logoAmip}
                alt="AMIP"
                className="h-[50px] w-auto object-contain"
                style={{ filter: isDarkMode ? "brightness(1.02) contrast(1.02)" : "none" }}
              />
            </a>
</div>
            {/* ── Desktop layout ───────────────────────────────────────────── */}
            <div className="hidden lg:flex flex-1 items-center justify-between gap-4 min-w-0">

              {/* Nav links */}
              <ul className="flex items-center gap-0 flex-shrink-0">
                <li className="nav-sep">
                  <a href="/" className="nav-link inline-block px-3 py-1.5 text-[15px] font-bold text-white/90 hover:text-[#C9A84C] transition-colors">
                    {t("home")}
                  </a>
                </li>

                {/* Dropdown */}
                <li
                  className={`nav-sep dd-trigger ${menuOpen ? "dd-open" : ""}`}
                  onMouseEnter={openMenu}
                  onMouseLeave={closeMenu}
                >
                  <button
                    type="button"
                    dir="ltr"
                    className="nav-link inline-flex items-center gap-1.5 px-3 py-1.5 text-[15px] font-bold text-white/90 hover:text-[#C9A84C] transition-colors"
                  >
                    <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                    <span dir={language === "ar" ? "rtl" : "ltr"}>{t("indicators")}</span>
                  </button>

                  <div
                    className="dd-panel absolute top-[calc(100%+10px)] end-0 w-[284px] rounded-2xl overflow-visible z-50"
                    onMouseEnter={() => setMenuOpen(true)}
                    onMouseLeave={() => setMenuOpen(false)}
                    style={{
                      background: "linear-gradient(145deg,#0d3b33,#082721)",
                      border: "1px solid rgba(201,168,76,0.25)",
                      boxShadow: "0 24px 48px rgba(0,0,0,0.55)",
                    }}
                  >
                    <div className="px-5 py-3 border-b border-[#C9A84C]/20">
                      <p className="text-[10px] text-[#C9A84C]/70 uppercase tracking-widest">{t("mainAxes")}</p>
                    </div>
                    <div className="p-3 space-y-1">
                      {INDICATORS.map((sec) => (
                        <DesktopSubMenu key={sec.key} section={sec} t={t} />
                      ))}
                    </div>
                    <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#8B2500,#C9A84C,#082721)" }} />
                  </div>
                </li>

                <li className="nav-sep">
                  <a href="/countries" className="nav-link inline-block px-3 py-1.5 text-[15px] font-bold text-white/90 hover:text-[#C9A84C] transition-colors">
                    {t("arabCountries")}
                  </a>
                </li>

                <li className="nav-sep">
                  <a href="/about" className="nav-link inline-block px-3 py-1.5 text-[15px] font-bold text-white/90 hover:text-[#C9A84C] transition-colors">
                    {t("about")}
                  </a>
                </li>
              </ul>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={openSearch}
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold
                             text-white/80 border border-white/20 hover:border-[#C9A84C]/60 hover:text-[#C9A84C]
                             hover:bg-[#C9A84C]/5 transition-all whitespace-nowrap"
                >
                  <SearchIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{t("quickSearch")}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold
                             text-white/80 border border-white/20 hover:border-[#C9A84C]/60 hover:text-[#C9A84C]
                             hover:bg-[#C9A84C]/5 transition-all whitespace-nowrap"
                  title={isDarkMode ? t("lightMode") : t("darkMode")}
                >
                  {isDarkMode ? (
                    <SunIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : (
                    <MoonIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                  <span>{isDarkMode ? t("lightMode") : t("darkMode")}</span>
                </button>

                <a
                  href="/rapport"
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-bold
                             text-[#082721] hover:brightness-110 transition-all whitespace-nowrap"
                  style={{
                    background: "linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)",
                    boxShadow: "0 2px 10px rgba(201,168,76,0.35)",
                  }}
                >
                  <DocIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{t("smartReports")}</span>
                </a>

                <div className="flex items-center gap-1 border border-white/20 rounded-full p-1 flex-shrink-0 bg-white/5">
                  <button
                    onClick={() => changeLanguage("ar")}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                      language === "ar"
                        ? "bg-[#C9A84C] text-slate-800"
                        : "text-white/70 hover:text-[#C9A84C]"
                    }`}
                    title="العربية"
                  >
                    🇸🇦 AR
                  </button>
                  <button
                    onClick={() => changeLanguage("fr")}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                      language === "fr"
                        ? "bg-[#C9A84C] text-slate-800"
                        : "text-white/70 hover:text-[#C9A84C]"
                    }`}
                    title="Français"
                  >
                    🇫🇷 FR
                  </button>
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                      language === "en"
                        ? "bg-[#C9A84C] text-slate-800"
                        : "text-white/70 hover:text-[#C9A84C]"
                    }`}
                    title="English"
                  >
                    🇬🇧 EN
                  </button>
                </div>

                <div className="w-px h-6 bg-white/15 mx-0.5 flex-shrink-0" />

                {/* User Menu */}
                {isAuthenticated() ? (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold
                               text-white/80 border border-white/20 hover:border-[#C9A84C]/60 hover:text-[#C9A84C]
                               hover:bg-[#C9A84C]/5 transition-all whitespace-nowrap"
                  >
                    <User size={16} />
                    <span>{language === "ar" ? "لوحة التحكم" : language === "fr" ? "Tableau de bord" : "Dashboard"}</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold
                               text-white/80 border border-white/20 hover:border-[#C9A84C]/60 hover:text-[#C9A84C]
                               hover:bg-[#C9A84C]/5 transition-all whitespace-nowrap"
                  >
                    <LoginIcon className="w-3.5 h-3.5" />
                    <span>{language === "ar" ? "دخول" : language === "fr" ? "Connexion" : "Login"}</span>
                  </Link>
                )}

                <a href="https://aidsmo.org" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                  <img
                    src={logoAidsmo}
                    alt="AIDSMO"
                    className="h-10 w-auto object-contain rounded-full p-1"
                    style={{
                      background: "#ffffff",
                      boxShadow: isDarkMode
                        ? "0 0 0 1px rgba(201,168,76,0.45)"
                        : "0 0 0 1px rgba(201,168,76,0.3)",
                    }}
                  />
                </a>
              </div>
            </div>

            {/* ── Hamburger ────────────────────────────────────────────────── */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="lg:hidden flex flex-col items-center justify-center w-10 h-10 rounded-xl
                         border border-white/25 gap-[5px] hover:border-[#C9A84C]/60 transition-colors flex-shrink-0"
            >
              <span className={`block h-[2px] w-5 rounded bg-white origin-center transition-all duration-300
                               ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block h-[2px] w-5 rounded bg-white transition-all duration-300
                               ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-[2px] w-5 rounded bg-white origin-center transition-all duration-300
                               ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Mobile panel ─────────────────────────────────────────────────── */}
        <div
          className="lg:hidden overflow-hidden"
          style={{
            maxHeight: mobileOpen ? "2000px" : "0px",
            transition: mobileOpen
              ? "max-height 0.5s cubic-bezier(0.4,0,0.2,1)"
              : "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
            background: "linear-gradient(180deg,#0d3b33,#082721)",
            borderTop: mobileOpen ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
          }}
        >
          <div className="px-4 pt-3 pb-6 space-y-1">

            <a href="/"
               className="block rounded-xl px-4 py-3 text-[15px] font-bold text-white/90
                          hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] transition-colors">
              {t("home")}
            </a>

            <MobileAccordion label={t("indicators")} level={0}>
              {INDICATORS.map((sec) => (
                <MobileAccordion key={sec.key} label={t(sec.labelKey)} level={1}>
                  {sec.items.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] text-white/70
                                 hover:text-[#C9A84C] hover:bg-white/5 transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#C9A84C]/50 flex-shrink-0" />
                      {t(item.labelKey)}
                    </a>
                  ))}
                </MobileAccordion>
              ))}
            </MobileAccordion>

            <a href="/countries"
               className="block rounded-xl px-4 py-3 text-[15px] font-bold text-white/90
                          hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] transition-colors">
              {t("arabCountries")}
            </a>

            <a href="/about"
               className="block rounded-xl px-4 py-3 text-[15px] font-bold text-white/90
                          hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] transition-colors">
              {t("about")}
            </a>

            {/* Action row */}
            <div className="pt-3 mt-2 border-t border-[#C9A84C]/20 flex flex-wrap gap-2 items-center">
              <button
                type="button"
                onClick={openSearch}
                className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold
                           border border-white/20 text-white/80 hover:border-[#C9A84C]/60 hover:text-[#C9A84C] transition-all"
              >
                <SearchIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{t("quickSearch")}</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold
                           border border-white/20 text-white/80 hover:border-[#C9A84C]/60 hover:text-[#C9A84C] transition-all"
                title={isDarkMode ? t("lightMode") : t("darkMode")}
              >
                {isDarkMode ? (
                  <SunIcon className="w-3.5 h-3.5 flex-shrink-0" />
                ) : (
                  <MoonIcon className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                <span>{isDarkMode ? t("lightMode") : t("darkMode")}</span>
              </button>

              <a
                href="/rapport"
                className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold text-[#082721]"
                style={{ background: "linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)" }}
              >
                <DocIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{t("smartReports")}</span>
              </a>

              <div className="flex items-center gap-1 border border-white/20 rounded-full p-1 bg-white/5">
                <button
                  onClick={() => changeLanguage("ar")}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                    language === "ar"
                      ? "bg-[#C9A84C] text-slate-800"
                      : "text-white/70 hover:text-[#C9A84C]"
                  }`}
                  title="العربية"
                >
                  🇸🇦 AR
                </button>
                <button
                  onClick={() => changeLanguage("fr")}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                    language === "fr"
                      ? "bg-[#C9A84C] text-slate-800"
                      : "text-white/70 hover:text-[#C9A84C]"
                  }`}
                  title="Français"
                >
                  🇫🇷 FR
                </button>
                <button
                  onClick={() => changeLanguage("en")}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                    language === "en"
                      ? "bg-[#C9A84C] text-slate-800"
                      : "text-white/70 hover:text-[#C9A84C]"
                  }`}
                  title="English"
                >
                  🇬🇧 EN
                </button>
              </div>

              <a href="https://aidsmo.org" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                <img
                  src={logoAidsmo}
                  alt="AIDSMO"
                  className="h-10 w-auto object-contain rounded-full p-1"
                  style={{
                    background: "#ffffff",
                    boxShadow: isDarkMode
                      ? "0 0 0 1px rgba(201,168,76,0.45)"
                      : "0 0 0 1px rgba(201,168,76,0.3)",
                  }}
                />
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none transition-opacity duration-300"
          style={{
            background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.5) 30%,rgba(201,168,76,0.5) 70%,transparent)",
            opacity: scrolled ? 1 : 0,
          }}
        />
      </nav>

      {/* Spacer */}
      <div className="h-[69px]" />
    </>
  );
};

export default Menu;