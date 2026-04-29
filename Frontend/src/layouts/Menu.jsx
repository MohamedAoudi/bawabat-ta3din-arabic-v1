import { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import { isAuthenticated } from "../services/authService";
import { 
  User, Search, Moon, Sun, FileText, 
  LogIn, ChevronDown, LayoutGrid, 
  BarChart3, Map, Info, Menu as MenuIcon, X 
} from "lucide-react";

import logoAmip from "../assets/logo_n_v-removebg-preview.png";
import logoAidsmo from "../assets/aidsmo logo sans bg 800x 800.png";

const TRANSLATIONS = {
  ar: {
    home: "الرئيسية",
    indicators: "المؤشرات",
    arabCountries: "الدول العربية",
    about: "عن البوابة",
    quickSearch: "بحث...",
    smartReports: "التقارير الذكية",
    login: "دخول",
    dashboard: "لوحة التحكم",
    miningProduction: "الانتاج التعديني",
    miningTrade: "التجارة التعدينية",
    productionVolume: "حجم الإنتاج",
    productionEvolution: "تطور الإنتاج",
    exports: "الصادرات",
    imports: "الواردات",
  },
  fr: {
    home: "Accueil",
    indicators: "Indicateurs",
    arabCountries: "Pays Arabes",
    about: "À Propos",
    quickSearch: "Recherche...",
    smartReports: "Rapports IA",
    login: "Connexion",
    dashboard: "Tableau de bord",
    miningProduction: "Production Minière",
    miningTrade: "Commerce Minier",
    productionVolume: "Volume de Production",
    productionEvolution: "Évolution Production",
    exports: "Exportations",
    imports: "Importations",
  },
  en: {
    home: "Home",
    indicators: "Indicators",
    arabCountries: "Arab Countries",
    about: "About Us",
    quickSearch: "Search...",
    smartReports: "Smart Reports",
    login: "Login",
    dashboard: "Dashboard",
    miningProduction: "Mining Production",
    miningTrade: "Mining Trade",
    productionVolume: "Production Volume",
    productionEvolution: "Production Evolution",
    exports: "Exports",
    imports: "Imports",
  }
};

const NewSplitMenu = () => {
  const { language, changeLanguage } = useContext(LanguageContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const isRTL = language === "ar";

  const t = (key) => TRANSLATIONS[language]?.[key] || key;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll(); 
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 group
          ${isActive 
            ? 'bg-[#C9A84C] text-[#082721]' 
            : 'text-[#C9A84C] hover:bg-[#C9A84C]/10'}`}
      >
        <Icon size={18} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
        <span className="font-bold text-sm uppercase tracking-wide">{label}</span>
      </Link>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        .font-cairo { font-family: 'Cairo', sans-serif; }
        
        .top-utility-bar {
          background: #082721;
          border: none !important; 
        }
        
        .main-nav-glass {
          background: ${scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent'};
          backdrop-filter: ${scrolled ? 'blur(15px)' : 'none'};
          border: none !important; 
          box-shadow: none !important; 
        }

        .dropdown-shadow {
            filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.2));
        }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-[100] font-cairo" dir={isRTL ? "rtl" : "ltr"}>
        
        {/* --- PARTIE 1: HEADER UTILITAIRE --- */}
        <div className="top-utility-bar h-14 flex items-center transition-transform duration-300">
          <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center">
            
            {/* Gauche: Lien AIDSMO (Prend 1/3 de l'espace) */}
            <div className="flex items-center justify-start flex-1">
              <a href="https://aidsmo.org" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
                <img src={logoAidsmo} alt="AIDSMO" className="h-12 w-12 rounded-full bg-white p-0.5" />
              </a>
            </div>

            {/* Centre: Recherche parfaitement au milieu (Prend 1/3 de l'espace) */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className={`relative flex items-center transition-all duration-300 ${searchFocused ? 'w-64' : 'w-48'}`}>
                <Search size={14} className={`absolute text-[#C9A84C] ${isRTL ? 'right-3' : 'left-3'}`} />
                <input 
                  type="text" 
                  placeholder={t("quickSearch")}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={`bg-white/5 border border-white/10 rounded-full py-1 text-xs text-white focus:outline-none focus:border-[#C9A84C]/50 transition-all w-full placeholder:text-white/40 ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
                />
              </div>
            </div>

            {/* Droite: Paramètres & Profil (Prend 1/3 de l'espace) */}
            <div className="flex items-center justify-end gap-3 text-xs flex-1">
              <div className="flex items-center border-x border-white/10 px-3 gap-3">
                <button onClick={toggleTheme} className="p-1 text-white/60 hover:text-[#C9A84C] transition-colors rounded-full hover:bg-white/5">
                  {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                </button>
                
                <div className="flex items-center bg-white/5 rounded-md p-0.5 border border-white/10">
                  <button
                    onClick={() => changeLanguage('ar')}
                    className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${language === 'ar' ? 'bg-[#C9A84C] text-[#082721]' : 'text-white/50 hover:text-[#C9A84C]'}`}
                  >
                    AR
                  </button>
                  <button
                    onClick={() => changeLanguage('fr')}
                    className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${language === 'fr' ? 'bg-[#C9A84C] text-[#082721]' : 'text-white/50 hover:text-[#C9A84C]'}`}
                  >
                    FR
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${language === 'en' ? 'bg-[#C9A84C] text-[#082721]' : 'text-white/50 hover:text-[#C9A84C]'}`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {isAuthenticated() ? (
                <Link to="/dashboard" className="flex items-center gap-1.5 text-white/90 hover:text-[#C9A84C] font-bold px-2">
                  <User size={14} />
                  <span>{t("dashboard")}</span>
                </Link>
              ) : (
                <Link to="/login" className="flex items-center gap-1.5 text-[#C9A84C] hover:text-white font-bold px-2 transition-colors">
                  <LogIn size={14} />
                  <span>{t("login")}</span>
                </Link>
              )}
            </div>
            
          </div>
        </div>

        {/* --- PARTIE 2: MENU PRINCIPAL --- */}
        <div className={`transition-all duration-500 w-full ${scrolled ? 'mt-2 px-4' : 'mt-0 px-0'}`}>
          <div className={`max-w-7xl mx-auto transition-all duration-500 main-nav-glass ${scrolled ? 'py-2 px-6 rounded-2xl' : 'py-4 px-6 rounded-none'}`}>
            <div className="flex items-center justify-between">
              
              <Link to="/" className="flex-shrink-0">
                <img 
                  src={logoAmip} 
                  alt="AMIP" 
                  className={`transition-all duration-500 object-contain ${scrolled ? 'h-10' : 'h-16'}`} 
                />
              </Link>

              <nav className="hidden lg:flex items-center gap-1">
                <NavItem to="/" icon={LayoutGrid} label={t("home")} />
                
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all font-bold text-sm uppercase">
                    <BarChart3 size={18} />
                    {t("indicators")}
                    <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                  </button>
                  
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 dropdown-shadow z-50">
                    <div className="bg-[#082721] border border-[#C9A84C]/20 rounded-2xl p-5 w-[340px] grid grid-cols-2 gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A84C]/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="relative z-10">
                            <h4 className="flex items-center gap-1.5 text-[10px] text-[#C9A84C] font-black uppercase mb-3 border-b border-[#C9A84C]/10 pb-1">
                                <LayoutGrid size={12}/> {t("miningProduction")}
                            </h4>
                            <div className="flex flex-col gap-2">
                                <Link to="/m1" className="text-white/70 hover:text-white hover:translate-x-1 text-xs transition-all">{t("productionVolume")}</Link>
                                <Link to="/m2" className="text-white/70 hover:text-white hover:translate-x-1 text-xs transition-all">{t("productionEvolution")}</Link>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <h4 className="flex items-center gap-1.5 text-[10px] text-[#C9A84C] font-black uppercase mb-3 border-b border-[#C9A84C]/10 pb-1">
                                <Map size={12}/> {t("miningTrade")}
                            </h4>
                            <div className="flex flex-col gap-2">
                                <Link to="/m5" className="text-white/70 hover:text-white hover:translate-x-1 text-xs transition-all">{t("exports")}</Link>
                                <Link to="/m6" className="text-white/70 hover:text-white hover:translate-x-1 text-xs transition-all">{t("imports")}</Link>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>

                <NavItem to="/countries" icon={Map} label={t("arabCountries")} />
                <NavItem to="/about" icon={Info} label={t("about")} />
              </nav>

              <div className="flex items-center gap-3">
                <Link 
                  to="/rapport"
                  className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#e0c268] text-[#082721] font-black text-sm hover:shadow-[0_4px_20px_rgba(201,168,76,0.4)] transition-all hover:-translate-y-0.5"
                >
                  <FileText size={18} />
                  <span>{t("smartReports")}</span>
                </Link>

                <button 
                  onClick={() => setMobileOpen(true)}
                  className="lg:hidden p-2 bg-[#C9A84C]/10 rounded-lg border border-[#C9A84C]/20 text-[#C9A84C]"
                >
                  <MenuIcon size={20} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* --- MENU MOBILE COULISSANT --- */}
      <div className={`fixed inset-0 z-[200] transition-all duration-500 ${mobileOpen ? 'visible' : 'invisible'}`}>
        <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setMobileOpen(false)}
        />
        
        <div className={`absolute top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-[85%] max-w-sm bg-[#082721] shadow-2xl transition-transform duration-500 ease-out flex flex-col ${mobileOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}`}>
          
          <div className="p-6 flex justify-between items-center border-b border-white/10">
            <img src={logoAmip} alt="AMIP" className="h-10" />
            <button onClick={() => setMobileOpen(false)} className="p-2 text-white/50 hover:text-[#C9A84C] transition-colors rounded-full hover:bg-white/5">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
            {[
              { to: "/", label: t("home"), icon: LayoutGrid },
              { to: "/indicators", label: t("indicators"), icon: BarChart3 },
              { to: "/countries", label: t("arabCountries"), icon: Map },
              { to: "/about", label: t("about"), icon: Info },
            ].map((link, idx) => (
              <Link 
                key={idx} 
                to={link.to} 
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${location.pathname === link.to ? 'bg-[#C9A84C] text-[#082721]' : 'text-[#C9A84C] hover:bg-white/5'}`}
              >
                <link.icon size={22} className={location.pathname === link.to ? '' : 'text-[#C9A84C]/70'} />
                <span className="text-lg font-bold">{link.label}</span>
              </Link>
            ))}

            <div className="my-4 h-[1px] bg-white/10"></div>

            {isAuthenticated() ? (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 p-4 text-white hover:bg-white/5 rounded-xl transition-colors">
                <User size={22} className="text-[#C9A84C]" />
                <span className="text-lg font-bold">{t("dashboard")}</span>
              </Link>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 p-4 text-white hover:bg-white/5 rounded-xl transition-colors">
                <LogIn size={22} className="text-[#C9A84C]" />
                <span className="text-lg font-bold">{t("login")}</span>
              </Link>
            )}
          </div>

          <div className="p-6 bg-black/20 flex flex-col gap-4">
            <Link 
                to="/rapport" 
                onClick={() => setMobileOpen(false)} 
                className="flex items-center justify-center gap-2 w-full py-4 bg-[#C9A84C] text-[#082721] rounded-xl font-black shadow-lg"
            >
                <FileText size={20} />
                {t("smartReports")}
            </Link>
            
            <div className="flex justify-between items-center px-2">
                <button onClick={toggleTheme} className="text-white flex items-center gap-2">
                    {isDarkMode ? <Sun /> : <Moon />} Theme
                </button>
                
                <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
                  <button
                    onClick={() => changeLanguage('ar')}
                    className={`px-3 py-1 rounded-md text-xs font-black transition-all ${language === 'ar' ? 'bg-[#C9A84C] text-[#082721]' : 'text-white/50 hover:text-[#C9A84C]'}`}
                  >
                    AR
                  </button>
                  <button
                    onClick={() => changeLanguage('fr')}
                    className={`px-3 py-1 rounded-md text-xs font-black transition-all ${language === 'fr' ? 'bg-[#C9A84C] text-[#082721]' : 'text-white/50 hover:text-[#C9A84C]'}`}
                  >
                    FR
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`px-3 py-1 rounded-md text-xs font-black transition-all ${language === 'en' ? 'bg-[#C9A84C] text-[#082721]' : 'text-white/50 hover:text-[#C9A84C]'}`}
                  >
                    EN
                  </button>
                </div>

            </div>
          </div>
        </div>
      </div>

      <div className="h-32 lg:h-36" />
    </>
  );
};

export default NewSplitMenu;