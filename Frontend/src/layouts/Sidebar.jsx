import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import { getCurrentUser, logout, isAdmin, refreshCurrentUser } from "../services/authService";
import { 
  User, LogOut, Settings, Users, BarChart3, 
  Shield, Home, FileText, X, Menu, PieChart, TrendingUp, Globe
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
  const { isDarkMode } = useContext(ThemeContext);

  const [user, setUser] = useState(() => getCurrentUser());
  const [expandedMenus, setExpandedMenus] = useState({});

  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;
  const isRTL = language === "ar";
  const isUserAdmin = isAdmin();

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
    <div className={`flex min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      {/* Sidebar */}
      <div 
        className={`fixed lg:static inset-y-0 ${isRTL ? "right-0 left-auto" : "left-0 right-auto"} z-50 
          transform ${isOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out 
          ${isDarkMode ? "bg-gray-800" : "bg-white"} w-72 min-h-screen shadow-xl`}
      >
        {/* Close button for mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            {t.dashboard}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} className={isDarkMode ? "text-gray-300" : "text-gray-600"} />
          </button>
        </div>

        {/* User Info Section */}
        <div className={`p-6 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex items-center gap-4">
            {user?.photo ? (
              <img 
                src={user.photo} 
                alt="Profile" 
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <div className={`w-14 h-14 rounded-full flex items-center justify-center 
                ${isDarkMode ? "bg-blue-900" : "bg-blue-100"}`}>
                <User className={`w-7 h-7 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-semibold truncate ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                {getUserName()}
              </h3>
              <p className={`text-xs truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
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
        <nav className="p-4 space-y-1">
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                        ${isItemActive || isExpanded
                          ? isDarkMode 
                            ? "bg-blue-900/50 text-blue-400" 
                            : "bg-blue-50 text-blue-600"
                          : isDarkMode 
                            ? "hover:bg-gray-700 text-gray-300" 
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                      <Icon size={20} />
                      <span className="flex-1 text-start text-sm font-medium">{t[item.labelKey]}</span>
                      {hasChildren && (
                        <svg 
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                    
                    {/* Submenu */}
                    {isExpanded && (
                      <div className="mt-1 ml-4 space-y-1">
                        {item.children.map((child) => (
                          <a
                            key={child.key}
                            href={child.href}
                            className={`block px-4 py-2 rounded-lg text-sm transition-colors
                              ${location.pathname === child.href
                                ? isDarkMode 
                                  ? "bg-blue-800/50 text-blue-300" 
                                  : "bg-blue-100 text-blue-700"
                                : isDarkMode 
                                  ? "text-gray-400 hover:bg-gray-700 hover:text-gray-300" 
                                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                              }`}
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                      ${isItemActive
                        ? isDarkMode 
                          ? "bg-blue-900/50 text-blue-400" 
                          : "bg-blue-50 text-blue-600"
                        : isDarkMode 
                          ? "hover:bg-gray-700 text-gray-300" 
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{t[item.labelKey]}</span>
                  </a>
                )}
              </div>
            );
          })}

          {/* Admin Section */}
          {isUserAdmin && (
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <p className={`px-4 text-xs font-semibold uppercase tracking-wider mb-2 
                ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                {t.adminPanel}
              </p>
              {ADMIN_MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => navigate("/users")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                      ${isDarkMode 
                        ? "hover:bg-gray-700 text-gray-300" 
                        : "hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{t[item.labelKey]}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Settings */}
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
              ${isDarkMode 
                ? "hover:bg-gray-700 text-gray-300" 
                : "hover:bg-gray-100 text-gray-700"
              }`}
          >
            <Settings size={20} />
            <span className="text-sm font-medium">{t.settings}</span>
          </button>

          {/* Language Selector */}
          <div className={`mt-4 pt-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
            <div className="px-4">
              <div className={`flex items-center gap-2 mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                <Globe size={16} />
                <span className="text-xs font-medium">{t.language || "Langue"}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => changeLanguage("ar")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                    ${language === "ar" 
                      ? "bg-blue-600 text-white" 
                      : isDarkMode 
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  العربية
                </button>
                <button
                  onClick={() => changeLanguage("fr")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                    ${language === "fr" 
                      ? "bg-blue-600 text-white" 
                      : isDarkMode 
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Français
                </button>
                <button
                  onClick={() => changeLanguage("en")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                    ${language === "en" 
                      ? "bg-blue-600 text-white" 
                      : isDarkMode 
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors
              ${isDarkMode 
                ? "bg-red-900/30 hover:bg-red-900/50 text-red-400" 
                : "bg-red-50 hover:bg-red-100 text-red-600"
              }`}
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