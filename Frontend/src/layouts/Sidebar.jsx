import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import { getCurrentUser, logout, isAdmin, refreshCurrentUser } from "../services/authService";
import { 
  User, LogOut, Settings, Users, BarChart3, 
  Shield, Home, FileText, X, Menu, PieChart, TrendingUp, Globe, Sun, Moon, Gem
} from "lucide-react";

// ─── Translations ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  ar: {
    dashboard: "لوحة التحكم",
    welcome: "مرحباً",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    adminPanel: "لوحة الإدارة",
    users: "المستخدمون",
    statistics: "الإحصائيات",
    reports: "التقارير",
    noAccess: "لا تملك صلاحيات الوصول لهذه الصفحة",
    role: "الدور",
    email: "البريد الإلكتروني",
    createdAt: "تاريخ الإنشاء",
    home: "الرئيسية",
    indicators: "المؤشرات التعدينية",
    miningProduction: "الإنتاج التعديني",
    miningTrade: "التجارة التعدينية",
    exports: "الصادرات",
    imports: "الواردات",
    countries: "الدول العربية",
    about: "عن البوابة",
    language: "اللغة",
    theme: "المظهر",
    lightMode: "فاتح",
    darkMode: "داكن",
    roles: {
      admin: "مدير",
      user: "مستخدم",
      editor: "محرر",
    },
  },
  fr: {
    dashboard: "Tableau de bord",
    welcome: "Bienvenue",
    profile: "Profil",
    settings: "Paramètres",
    logout: "Déconnexion",
    adminPanel: "Panneau d'administration",
    users: "Utilisateurs",
    statistics: "Statistiques",
    reports: "Rapports",
    noAccess: "Vous n'avez pas accès à cette page",
    role: "Rôle",
    email: "E-mail",
    createdAt: "Date de création",
    home: "Accueil",
    indicators: "Indicateurs Miniers",
    miningProduction: "Production Minière",
    miningTrade: "Commerce Minier",
    exports: "Exportations",
    imports: "Importations",
    countries: "Pays Arabes",
    about: "À Propos",
    language: "Langue",
    theme: "Thème",
    lightMode: "Clair",
    darkMode: "Sombre",
    roles: {
      admin: "Administrateur",
      user: "Utilisateur",
      editor: "Éditeur",
    },
  },
  en: {
    dashboard: "Dashboard",
    welcome: "Welcome",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    adminPanel: "Admin Panel",
    users: "Users",
    statistics: "Statistics",
    reports: "Reports",
    noAccess: "You don't have access to this page",
    role: "Role",
    email: "Email",
    createdAt: "Created at",
    home: "Home",
    indicators: "Mining Indicators",
    miningProduction: "Mining Production",
    miningTrade: "Mining Trade",
    exports: "Exports",
    imports: "Imports",
    countries: "Arab Countries",
    about: "About",
    language: "Language",
    theme: "Theme",
    lightMode: "Light",
    darkMode: "Dark",
    roles: {
      admin: "Admin",
      user: "User",
      editor: "Editor",
    },
  },
};

// ─── Menu Items Configuration ───────────────────────────────────────────────
const MENU_ITEMS = [
  {
    key: "home",
    icon: Home,
    href: "/",
    labelKey: "home",
  },
  {
    key: "statistics",
    icon: BarChart3,
    labelKey: "statistics",
    children: [
      { key: "m1", href: "/m1", labelKey: "miningProduction" },
      { key: "m2", href: "/m2", labelKey: "miningProduction" },
      { key: "m3", href: "/m3", labelKey: "miningProduction" },
      { key: "m4", href: "/m4", labelKey: "miningProduction" },
      { key: "m5", href: "/m5", labelKey: "exports" },
      { key: "m6", href: "/m6", labelKey: "imports" },
    ],
  },
  {
    key: "reports",
    icon: FileText,
    href: "/rapport",
    labelKey: "reports",
  },
  {
    key: "countries",
    icon: PieChart,
    href: "/countries",
    labelKey: "countries",
  },
  {
    key: "about",
    icon: TrendingUp,
    href: "/about",
    labelKey: "about",
  },
];

const ADMIN_MENU_ITEMS = [
  {
    key: "users",
    icon: Users,
    labelKey: "users",
  },
];

// ─── Sidebar Component ──────────────────────────────────────────────────────
export default function Sidebar({ isOpen, onClose, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, changeLanguage } = useContext(LanguageContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const [user, setUser] = useState(() => getCurrentUser());
  const [expandedMenus, setExpandedMenus] = useState({});

  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;
  const isRTL = language === "ar";
  const isUserAdmin = isAdmin();

  // Color palette matching Home/Login page - elegant gold & forest theme
  const colors = isDarkMode ? {
    bg: "#071611",
    bgLight: "#0c2620",
    bgLighter: "#0a221c",
    forest: "#efe8d4",
    forestMid: "#d1c7ad",
    gold: "#d3b468",
    goldLight: "#efdba2",
    goldPale: "#1a332d",
    cream: "#071611",
    parchment: "#0c2620",
    ink: "#efe8d4",
    muted: "#b8b09d",
    border: "rgba(201,168,76,0.22)",
    accent: "#7ee0c0",
    cardBg: "#0d2b24",
  } : {
    bg: "#f5f3ef",
    bgLight: "#ede9df",
    bgLighter: "#ffffff",
    forest: "#082721",
    forestMid: "#0d3d34",
    gold: "#c9a84c",
    goldLight: "#e8d08a",
    goldPale: "#f7f0dc",
    cream: "#f5f3ef",
    parchment: "#ede9df",
    ink: "#1a1510",
    muted: "#7a7060",
    border: "rgba(8,39,33,0.08)",
    accent: "#0d3d34",
    cardBg: "#ffffff",
  };

  // Refresh user data from server to get latest photo
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const updatedUser = await refreshCurrentUser();
        setUser(updatedUser || currentUser);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = (key) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isActive = (href) => location.pathname === href;

  const getUserName = () => {
    if (!user) return "User";
    return user.nom_ar || user.nom_en || user.nom_fr || user.prenom_ar || user.prenom_en || user.prenom_fr || "User";
  };

  const userRole = user?.role || "user";

  return (
    <div className={`flex min-h-screen ${isDarkMode ? "bg-[#071611]" : "bg-[#f5f3ef]"}`}>
      {/* Sidebar */}
      <div 
        className={`fixed lg:static inset-y-0 ${isRTL ? "right-0 left-auto" : "left-0 right-auto"} z-50 
          transform ${isOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out 
          ${isDarkMode ? "bg-[#0c2620]" : "bg-white"} w-72 min-h-screen shadow-2xl`}
        style={{ 
          backgroundImage: isDarkMode 
            ? 'linear-gradient(180deg, #0c2620 0%, #071611 100%)' 
            : 'linear-gradient(180deg, #ffffff 0%, #f9f7f2 100%)',
        }}
      >
        {/* Gold accent line at top */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${colors.gold} 0%, ${colors.goldLight} 50%, ${colors.gold} 100%)` }} />

        {/* Close button for mobile */}
        <div className="lg:hidden flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <h2 className="text-lg font-bold" style={{ color: colors.ink }}>
            {t.dashboard}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ background: colors.goldPale }}>
            <X size={20} style={{ color: colors.forest }} />
          </button>
        </div>

        {/* Logo/Brand Section */}
        <div className="p-6 text-center" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3" 
            style={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)` }}>
            <Gem size={32} style={{ color: colors.forest }} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: colors.gold }}>
            {t.dashboard}
          </h1>
          <p className="text-xs mt-1" style={{ color: colors.muted }}>
            {t.indicators}
          </p>
        </div>

        {/* User Info Section */}
        <div className="p-4 mx-4 mt-4 rounded-xl" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-3">
            {user?.photo ? (
              <img 
                src={user.photo} 
                alt="Profile" 
                className="w-12 h-12 rounded-full object-cover border-2"
                style={{ borderColor: colors.gold }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center border-2" 
                style={{ borderColor: colors.gold, background: colors.goldPale }}>
                <User className="w-6 h-6" style={{ color: colors.forest }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate" style={{ color: colors.ink }}>
                {getUserName()}
              </h3>
              <p className="text-xs truncate" style={{ color: colors.muted }}>
                {user?.email}
              </p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium
                ${isUserAdmin 
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" 
                  : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                }`}>
                {t.roles[userRole] || userRole}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedMenus[item.key];
            const hasChildren = item.children && item.children.length > 0;
            const isItemActive = hasChildren 
              ? item.children.some(child => location.pathname === child.href)
              : item.href && location.pathname === item.href;

            return (
              <div key={item.key}>
                {hasChildren ? (
                  // Menu with children (expandable)
                  <>
                    <button
                      onClick={() => toggleMenu(item.key)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                      style={{ 
                        background: isItemActive || isExpanded 
                          ? `linear-gradient(135deg, ${colors.goldPale} 0%, ${isDarkMode ? 'rgba(201,168,76,0.15)' : 'rgba(201,168,76,0.25)'} 100%)`
                          : 'transparent',
                        color: isItemActive || isExpanded ? colors.forest : colors.ink,
                        border: `1px solid ${isItemActive || isExpanded ? colors.gold : 'transparent'}`,
                      }}
                    >
                      <Icon size={20} style={{ color: isItemActive || isExpanded ? colors.gold : colors.muted }} />
                      <span className="flex-1 text-start text-sm font-medium">{t[item.labelKey]}</span>
                      {hasChildren && (
                        <svg 
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          style={{ color: colors.muted }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                    
                    {/* Submenu */}
                    {isExpanded && (
                      <div className="mt-1 ml-4 space-y-1 pl-2" style={{ borderLeft: `2px solid ${colors.gold}40` }}>
                        {item.children.map((child) => (
                          <a
                            key={child.key}
                            href={child.href}
                            className="block px-4 py-2 rounded-lg text-sm transition-all duration-200"
                            style={{ 
                              background: location.pathname === child.href ? colors.goldPale : 'transparent',
                              color: location.pathname === child.href ? colors.forest : colors.muted,
                            }}
                          >
                            {t[child.labelKey]}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // Simple menu item
                  <a
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                    style={{ 
                      background: isItemActive ? colors.goldPale : 'transparent',
                      color: isItemActive ? colors.forest : colors.ink,
                      border: `1px solid ${isItemActive ? colors.gold : 'transparent'}`,
                    }}
                  >
                    <Icon size={20} style={{ color: isItemActive ? colors.gold : colors.muted }} />
                    <span className="text-sm font-medium">{t[item.labelKey]}</span>
                  </a>
                )}
              </div>
            );
          })}

          {/* Admin Section */}
          {isUserAdmin && (
            <div className="pt-4 mt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
              <p className="px-4 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.gold }}>
                {t.adminPanel}
              </p>
              {ADMIN_MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => navigate("/users")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                    style={{ 
                      background: colors.cardBg,
                      color: colors.ink,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <Icon size={20} style={{ color: colors.gold }} />
                    <span className="text-sm font-medium">{t[item.labelKey]}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Settings */}
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
            style={{ 
              color: colors.muted,
            }}
          >
            <Settings size={20} />
            <span className="text-sm font-medium">{t.settings}</span>
          </button>

          {/* Language Selector */}
          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
            <div className="px-4">
              <div className="flex items-center gap-2 mb-2" style={{ color: colors.muted }}> 
                <Globe size={16} />
                <span className="text-xs font-medium">{t.language || "Langue"}</span>
              </div>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => changeLanguage("ar")}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    background: language === "ar" 
                      ? `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`
                      : colors.cardBg,
                    color: language === "ar" ? colors.forest : colors.ink,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  العربية
                </button>
                <button
                  onClick={() => changeLanguage("fr")}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    background: language === "fr" 
                      ? `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`
                      : colors.cardBg,
                    color: language === "fr" ? colors.forest : colors.ink,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  Français
                </button>
                <button
                  onClick={() => changeLanguage("en")}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    background: language === "en" 
                      ? `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`
                      : colors.cardBg,
                    color: language === "en" ? colors.forest : colors.ink,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  English
                </button>
              </div>
              {/* Dark/Light Mode Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => { if (isDarkMode) toggleTheme(); }}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    background: !isDarkMode 
                      ? `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`
                      : colors.cardBg,
                    color: !isDarkMode ? colors.forest : colors.ink,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  Light
                </button>
                <button
                  onClick={() => { if (!isDarkMode) toggleTheme(); }}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    background: isDarkMode 
                      ? `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`
                      : colors.cardBg,
                    color: isDarkMode ? colors.forest : colors.ink,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: `1px solid ${colors.border}` }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02]"
            style={{ 
              background: isDarkMode ? 'rgba(220,38,38,0.15)' : 'rgba(220,38,38,0.08)',
              color: isDarkMode ? '#fca5a5' : '#dc2626',
              border: `1px solid ${isDarkMode ? 'rgba(220,38,38,0.3)' : 'rgba(220,38,38,0.2)'}`,
            }}
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">{t.logout}</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {children}
      </div>
    </div>
  );
}

// ─── Mobile Header Component ───────────────────────────────────────────────
export function MobileHeader({ onMenuClick, title }) {
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);
  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;

  return (
    <div className={`lg:hidden flex items-center justify-between p-4 
      ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-md`}>
      <button 
        onClick={onMenuClick}
        className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
      >
        <Menu size={24} className={isDarkMode ? "text-white" : "text-gray-800"} />
      </button>
      <h1 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
        {title || t.dashboard}
      </h1>
      <div className="w-10"></div>
    </div>
  );
}