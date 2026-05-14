import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import { isAuthenticated, logout, isAdmin } from "../services/authService";
import { getCountries } from "../services/countryService";
import { 
  User, Search, Moon, Sun, FileText, 
  LogIn, ChevronDown, LayoutGrid, 
  BarChart3, Map, Info, Menu as MenuIcon, X, Mail, LogOut
} from "lucide-react";

import logoAmip from "../assets/logo_n_v-removebg-preview.png";
import logoAidsmo from "../assets/aidsmo logo sans bg 800x 800.png";

const TRANSLATIONS = {
  ar: { home: "الرئيسية", indicators: "المؤشرات", arabCountries: "الدول العربية", about: "عن البوابة", contact: "اتصل بنا", quickSearch: "بحث...", smartReports: "التقارير الذكية", login: "دخول", logout: "تسجيل الخروج", dashboard: "لوحة التحكم", miningProduction: "الانتاج التعديني", miningTrade: "التجارة التعدينية", productionVolume: "حجم الإنتاج", productionEvolution: "تطور الإنتاج", exports: "الصادرات", imports: "الواردات", noSearchResults: "لا نتائج مطابقة" },
  fr: { home: "Accueil", indicators: "Indicateurs", arabCountries: "Pays Arabes", about: "À Propos", contact: "Contactez-nous", quickSearch: "Recherche...", smartReports: "Rapports IA", login: "Connexion", logout: "Déconnexion", dashboard: "Tableau de bord", miningProduction: "Production Minière", miningTrade: "Commerce Minier", productionVolume: "Volume de Production", productionEvolution: "Évolution Production", exports: "Exportations", imports: "Importations", noSearchResults: "Aucun résultat" },
  en: { home: "Home", indicators: "Indicators", arabCountries: "Arab Countries", about: "About Us", contact: "Contact Us", quickSearch: "Search...", smartReports: "Smart Reports", login: "Login", logout: "Logout", dashboard: "Dashboard", miningProduction: "Mining Production", miningTrade: "Mining Trade", productionVolume: "Production Volume", productionEvolution: "Production Evolution", exports: "Exports", imports: "Imports", noSearchResults: "No matching results" }
};

const NewSplitMenu = () => {
  const { language, changeLanguage } = useContext(LanguageContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [indicatorsOpen, setIndicatorsOpen] = useState(false); // حالة القائمة المنسدلة للموبايل
  const [searchFocused, setSearchFocused] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState("");
  const [navCountries, setNavCountries] = useState([]);
  const searchBlurTimer = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const isRTL = language === "ar";
  const [authTick, setAuthTick] = useState(0);

  useEffect(() => {
    const bump = () => setAuthTick((n) => n + 1);
    window.addEventListener("auth:user-updated", bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener("auth:user-updated", bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  const canShowDashboard = useMemo(() => isAdmin(), [authTick, location.pathname]);

  const t = (key) => TRANSLATIONS[language]?.[key] || key;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (searchBlurTimer.current) clearTimeout(searchBlurTimer.current);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setIndicatorsOpen(false);
  }, [location.pathname]);

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
        setNavCountries(mapped);
      })
      .catch(() => {
        if (active) setNavCountries([]);
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

  const filteredNavCountries = useMemo(() => {
    const q = navSearchQuery.trim().toLowerCase();
    if (q.length < 1 || !navCountries.length) return [];
    return navCountries
      .filter((c) => {
        const hay = [c.name_ar, c.name_en, c.name_fr, c.code].join(" ").toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 10);
  }, [navSearchQuery, navCountries]);

  const openSearchDropdown = searchFocused && navSearchQuery.trim().length > 0;

  const goToCountry = (code) => {
    if (searchBlurTimer.current) clearTimeout(searchBlurTimer.current);
    navigate(`/countries?country=${encodeURIComponent(code)}`);
    setNavSearchQuery("");
    setSearchFocused(false);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/login");
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group
          ${isActive ? 'bg-[#C9A84C] text-white' : 'text-[#C9A84C] hover:bg-[#C9A84C]/10'}`}
      >
        <Icon size={18} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
        <span className="font-bold text-xs uppercase tracking-wide whitespace-nowrap">{label}</span>
      </Link>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        .font-cairo { font-family: 'Cairo', sans-serif; }
        .main-nav-glass {
          background: ${scrolled ? (isDarkMode ? 'rgba(12, 35, 29, 0.98)' : 'rgba(255, 255, 255, 0.98)') : 'transparent'};
          backdrop-filter: ${scrolled ? 'blur(10px)' : 'none'};
          box-shadow: ${scrolled ? '0 4px 20px rgba(0,0,0,0.1)' : 'none'};
        }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-[900] font-cairo" dir={isRTL ? "rtl" : "ltr"}>
        
        {/* TOP BAR: higher z-index than main nav so country search list paints above "Indicators" */}
        <div className="relative z-[1020] bg-[#082721] h-8 sm:h-12 flex items-center border-b border-white/5">
          <div className="max-w-7xl mx-auto w-full px-4 flex justify-between items-center">
            <a href="https://aidsmo.org" target="_blank" rel="noreferrer" className="flex-shrink-0">
              <img src={logoAidsmo} alt="AIDSMO" className="h-7 w-7 sm:h-9 sm:w-9 object-contain" />
            </a>

            <div className="flex flex-1 justify-center px-2 sm:px-6 min-w-0 max-w-full md:max-w-md">
              <div className={`relative isolate flex items-center w-full transition-all duration-300 ${searchFocused ? 'scale-[1.02] md:scale-105' : ''}`}>
                <Search size={14} className={`absolute text-[#C9A84C] pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
                <input 
                  type="text" 
                  value={navSearchQuery}
                  onChange={(e) => setNavSearchQuery(e.target.value)}
                  placeholder={t("quickSearch")}
                  onFocus={() => {
                    if (searchBlurTimer.current) clearTimeout(searchBlurTimer.current);
                    setSearchFocused(true);
                  }}
                  onBlur={() => {
                    searchBlurTimer.current = setTimeout(() => setSearchFocused(false), 180);
                  }}
                  autoComplete="off"
                  className={`w-full rounded-full py-1.5 text-xs bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C9A84C] transition-all ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
                />
                {openSearchDropdown && (
                  <div
                    className={`absolute top-full z-[1000] mt-1 w-full min-w-[220px] rounded-xl border border-white/10 bg-[#082721] py-1 shadow-2xl ${isRTL ? 'right-0' : 'left-0'}`}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {filteredNavCountries.length === 0 ? (
                      <p className="px-3 py-2 text-[11px] text-white/50">{t("noSearchResults")}</p>
                    ) : (
                      <>
                        <p className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#C9A84C]/80 border-b border-white/5">{t("arabCountries")}</p>
                        {filteredNavCountries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => goToCountry(c.code)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-white/90 hover:bg-[#C9A84C]/15 hover:text-[#C9A84C] transition-colors"
                            style={{ textAlign: isRTL ? "right" : "left" }}
                          >
                            <Map size={14} className="flex-shrink-0 text-[#C9A84C]" />
                            <span className="min-w-0 flex-1 truncate">{countrySearchLabel(c)}</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex bg-black/20 rounded-md p-0.5 border border-white/10">
                {['ar', 'fr', 'en'].map((lang) => (
                  <button 
                    key={lang}
                    onClick={() => changeLanguage(lang)} 
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${language === lang ? 'bg-[#C9A84C] text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <div className="hidden sm:flex items-center border-l border-white/10 pl-4 gap-3">
                {canShowDashboard && (
                  <Link
                    to="/dashboard"
                    className="text-white/70 hover:text-[#C9A84C] flex items-center gap-1 text-xs font-bold whitespace-nowrap transition-colors"
                  >
                    <User size={14} /> {t("dashboard")}
                  </Link>
                )}
                {isAuthenticated() ? (
                  <button onClick={handleLogout} className="text-white/70 hover:text-[#C9A84C] flex items-center gap-1 text-xs font-bold transition-colors">
                    <LogOut size={14} /> {t("logout")}
                  </button>
                ) : (
                  <Link to="/login" className="text-[#C9A84C] hover:text-white flex items-center gap-1 text-xs font-bold">
                    <LogIn size={14} /> {t("login")}
                  </Link>
                )}
              </div>
              
              <button onClick={toggleTheme} className="p-1 text-white/70 hover:text-[#C9A84C]">
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* MAIN NAV: below top bar stacking so search dropdown is not covered */}
        <div className={`relative z-[1010] w-full transition-all duration-300 ${scrolled ? 'py-1' : 'py-1'}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="main-nav-glass rounded-xl px-4 py-2 flex items-center justify-between transition-all duration-300">
              
              <Link to="/" className="flex-shrink-0">
                <img src={logoAmip} alt="AMIP" className={`transition-all duration-300 ${scrolled ? 'h-8 sm:h-10' : 'h-10 sm:h-14'}`} />
              </Link>

              {/* Menu Desktop */}
              <nav className="hidden lg:flex items-center gap-1 flex-wrap justify-end max-w-[min(100%,52rem)]">
                <NavItem to="/" icon={LayoutGrid} label={t("home")} />
                
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#C9A84C] font-bold text-xs uppercase hover:bg-[#C9A84C]/10 transition-all">
                    <BarChart3 size={18} />
                    {t("indicators")}
                    <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-[1015]">
                    <div className="bg-[#082721] border border-[#C9A84C]/20 rounded-xl p-4 w-72 shadow-2xl">
                       <div className="grid grid-cols-1 gap-4 text-right">
                          <div>
                            <p className="text-[10px] text-[#C9A84C] font-black border-b border-white/5 mb-2 pb-1 uppercase">{t("miningProduction")}</p>
                            <div className="flex flex-col gap-1">
                              <Link to="/m1" className="text-white/70 hover:text-white text-xs py-1 transition-all">{t("productionVolume")}</Link>
                              <Link to="/m2" className="text-white/70 hover:text-white text-xs py-1 transition-all">{t("productionEvolution")}</Link>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#C9A84C] font-black border-b border-white/5 mb-2 pb-1 uppercase">{t("miningTrade")}</p>
                            <div className="flex flex-col gap-1">
                              <Link to="/m5" className="text-white/70 hover:text-white text-xs py-1 transition-all">{t("exports")}</Link>
                              <Link to="/m6" className="text-white/70 hover:text-white text-xs py-1 transition-all">{t("imports")}</Link>
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                <NavItem to="/countries" icon={Map} label={t("arabCountries")} />
                <NavItem to="/about" icon={Info} label={t("about")} />
                <NavItem to="/contact" icon={Mail} label={t("contact")} />
                {canShowDashboard && <NavItem to="/dashboard" icon={User} label={t("dashboard")} />}
              </nav>

              <div className="flex items-center gap-2">
                <Link to="/rapport" className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C9A84C] text-white font-bold text-xs hover:bg-[#b39540] transition-all shadow-lg shadow-[#C9A84C]/20">
                  <FileText size={16} />
                  <span>{t("smartReports")}</span>
                </Link>

                <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2.5 bg-[#C9A84C]/10 rounded-lg text-[#C9A84C] active:scale-95 transition-all">
                  <MenuIcon size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div className={`fixed inset-0 z-[1000] lg:hidden transition-all duration-300 ${mobileOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileOpen(false)} />
        
        <div className={`absolute top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-[280px] bg-[#082721] shadow-2xl transition-transform duration-500 ease-in-out flex flex-col ${mobileOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}`}>
          
          <div className="p-5 flex justify-between items-center border-b border-white/10">
            <img src={logoAmip} alt="AMIP" className="h-8 object-contain" />
            <button onClick={() => setMobileOpen(false)} className="p-2 text-white/50 hover:text-white">
              <X size={28} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
            <div className="relative mb-2">
              <Search size={16} className={`absolute text-[#C9A84C] top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={navSearchQuery}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                placeholder={t("quickSearch")}
                autoComplete="off"
                className={`w-full rounded-xl py-2.5 text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C9A84C] ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
              />
              {navSearchQuery.trim().length > 0 && (
                <div
                  className="absolute left-0 right-0 top-full z-[1000] mt-1 rounded-xl border border-white/10 bg-[#0a3028] py-1 shadow-xl"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {filteredNavCountries.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-white/50">{t("noSearchResults")}</p>
                  ) : (
                    filteredNavCountries.map((c) => (
                      <button
                        key={`m-${c.code}`}
                        type="button"
                        onClick={() => goToCountry(c.code)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-bold text-white/90 hover:bg-[#C9A84C]/15"
                        style={{ textAlign: isRTL ? "right" : "left" }}
                      >
                        <Map size={18} className="text-[#C9A84C] flex-shrink-0" />
                        <span className="truncate">{countrySearchLabel(c)}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Home */}
            <Link to="/" className={`flex items-center gap-4 p-3.5 rounded-xl transition-all ${location.pathname === '/' ? 'bg-[#C9A84C] text-white' : 'text-white/80 hover:bg-white/5'}`}>
              <LayoutGrid size={22} />
              <span className="text-sm font-bold">{t("home")}</span>
            </Link>

            {/* Indicators Dropdown Mobile */}
            <div className="flex flex-col">
              <button 
                onClick={() => setIndicatorsOpen(!indicatorsOpen)}
                className={`flex items-center justify-between p-3.5 rounded-xl transition-all text-white/80 hover:bg-white/5`}
              >
                <div className="flex items-center gap-4">
                  <BarChart3 size={22} className="text-[#C9A84C]" />
                  <span className="text-sm font-bold">{t("indicators")}</span>
                </div>
                <ChevronDown size={18} className={`transition-transform duration-300 ${indicatorsOpen ? 'rotate-180' : ''}`} />
              </button>

              <div className={`overflow-hidden transition-all duration-300 bg-black/20 rounded-lg mx-2 ${indicatorsOpen ? 'max-h-80 py-2' : 'max-h-0'}`}>
                <div className="px-4 py-2 text-[10px] text-[#C9A84C] font-black uppercase border-b border-white/5 mb-1">{t("miningProduction")}</div>
                <Link to="/m1" className="block px-10 py-2 text-sm text-white/70 hover:text-[#C9A84C]">{t("productionVolume")}</Link>
                <Link to="/m2" className="block px-10 py-2 text-sm text-white/70 hover:text-[#C9A84C]">{t("productionEvolution")}</Link>
                
                <div className="px-4 py-2 text-[10px] text-[#C9A84C] font-black uppercase border-b border-white/5 mt-2 mb-1">{t("miningTrade")}</div>
                <Link to="/m5" className="block px-10 py-2 text-sm text-white/70 hover:text-[#C9A84C]">{t("exports")}</Link>
                <Link to="/m6" className="block px-10 py-2 text-sm text-white/70 hover:text-[#C9A84C]">{t("imports")}</Link>
              </div>
            </div>

            {/* Other Links */}
            {[
              { to: "/countries", label: t("arabCountries"), icon: Map },
              { to: "/about", label: t("about"), icon: Info },
              { to: "/contact", label: t("contact"), icon: Mail },
            ].map((link, idx) => (
              <Link key={idx} to={link.to} className={`flex items-center gap-4 p-3.5 rounded-xl transition-all ${location.pathname === link.to ? 'bg-[#C9A84C] text-white shadow-lg' : 'text-white/80 hover:bg-white/5'}`}>
                <link.icon size={22} />
                <span className="text-sm font-bold">{link.label}</span>
              </Link>
            ))}

            <div className="h-px bg-white/10 my-4 mx-2" />

            {/* Auth Section Mobile */}
            {isAuthenticated() ? (
              <>
                {canShowDashboard && (
                  <Link to="/dashboard" className="flex items-center gap-4 p-3.5 text-white/80 hover:bg-white/5 rounded-xl">
                    <User size={22} className="text-[#C9A84C]" />
                    <span className="text-sm font-bold">{t("dashboard")}</span>
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-4 p-3.5 text-white/80 hover:bg-white/5 rounded-xl text-left">
                  <LogOut size={22} className="text-[#C9A84C]" />
                  <span className="text-sm font-bold">{t("logout")}</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-4 p-3.5 text-white/80 hover:bg-white/5 rounded-xl">
                <LogIn size={22} className="text-[#C9A84C]" />
                <span className="text-sm font-bold">{t("login")}</span>
              </Link>
            )}
          </div>

          <div className="p-4 bg-black/20">
            <Link to="/rapport" className="flex items-center justify-center gap-2 w-full py-4 bg-[#C9A84C] text-white rounded-xl font-bold shadow-lg">
              <FileText size={20} />
              {t("smartReports")}
            </Link>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-24 sm:h-28 lg:h-32" />
    </>
  );
};

export default NewSplitMenu;