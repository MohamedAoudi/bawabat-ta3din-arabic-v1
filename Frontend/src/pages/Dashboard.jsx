import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import { getCurrentUser, logout, isAdmin } from "../services/authService";
import { 
  User, LogOut, Settings, Users, BarChart3, 
  Shield, Menu, X, Home, FileText 
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
    roles: {
      admin: "Admin",
      user: "User",
      editor: "Editor",
    },
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);

  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;
  const isRTL = language === "ar";

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login");
    } else {
      setUser(currentUser);
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userRole = user.role || "user";
  const isUserAdmin = isAdmin();

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      {/* Mobile Header */}
      <div className={`lg:hidden flex items-center justify-between p-4 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow`}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
          {t.dashboard}
        </h1>
        <div className="w-8"></div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed lg:static inset-0 z-50 transform ${sidebarOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out ${isDarkMode ? "bg-gray-800" : "bg-white"} w-64 min-h-screen shadow-lg`}>
          <div className="p-6">
            {/* User Info */}
            <div className={`text-center mb-6 pb-6 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${isDarkMode ? "bg-blue-900" : "bg-blue-100"}`}>
                <User className={`w-10 h-10 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                {user.nom_ar || user.nom_en || user.nom_fr || user.prenom_ar || user.prenom_en || user.prenom_fr || "User"}
              </h2>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {user.email}
              </p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                isUserAdmin 
                  ? "bg-purple-100 text-purple-700" 
                  : "bg-green-100 text-green-700"
              }`}>
                {t.roles[userRole] || userRole}
              </span>
            </div>

            {/* Menu Items */}
            <nav className="space-y-2">
              <button
                onClick={() => navigate("/")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"}`}
              >
                <Home size={20} />
                <span>{language === "ar" ? "الرئيسية" : language === "fr" ? "Accueil" : "Home"}</span>
              </button>

              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isDarkMode ? "bg-blue-900/50 text-blue-400" : "bg-blue-50 text-blue-600"}`}
              >
                <BarChart3 size={20} />
                <span>{t.statistics}</span>
              </button>

              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"}`}
              >
                <FileText size={20} />
                <span>{t.reports}</span>
              </button>

              {isUserAdmin && (
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"}`}
                >
                  <Users size={20} />
                  <span>{t.users}</span>
                </button>
              )}

              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"}`}
              >
                <Settings size={20} />
                <span>{t.settings}</span>
              </button>
            </nav>
          </div>

          {/* Logout Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                isDarkMode 
                  ? "bg-red-900/50 hover:bg-red-900 text-red-400" 
                  : "bg-red-50 hover:bg-red-100 text-red-600"
              }`}
            >
              <LogOut size={20} />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>

        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6 lg:p-8">
          {/* Welcome Header */}
          <div className={`mb-8 ${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm`}>
            <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              {t.welcome}, {user.prenom_ar || user.prenom_en || user.prenom_fr || user.nom_ar || user.nom_en || user.nom_fr || "User"}!
            </h1>
            <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {language === "ar" ? "هذه هي لوحة التحكم الخاصة بك" : language === "fr" ? "Ceci est votre tableau de bord" : "This is your dashboard"}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Profile Card */}
            <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDarkMode ? "bg-blue-900" : "bg-blue-100"}`}>
                <User className={`w-6 h-6 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                {t.profile}
              </h3>
              <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {t.email}: {user.email}
              </p>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {t.role}: {t.roles[userRole] || userRole}
              </p>
            </div>

            {/* Role Card */}
            <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDarkMode ? "bg-purple-900" : "bg-purple-100"}`}>
                <Shield className={`w-6 h-6 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                {t.role}
              </h3>
              <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {isUserAdmin 
                  ? (language === "ar" ? "لديك صلاحيات المدير" : language === "fr" ? "Vous avez les droits d'administrateur" : "You have admin privileges")
                  : (language === "ar" ? "لديك صلاحيات المستخدم" : language === "fr" ? "Vous avez les droits d'utilisateur" : "You have user privileges")
                }
              </p>
            </div>

            {/* Admin Panel Access */}
            {isUserAdmin && (
              <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm border-2 border-purple-500`}>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDarkMode ? "bg-purple-900" : "bg-purple-100"}`}>
                  <Users className={`w-6 h-6 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
                </div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  {t.adminPanel}
                </h3>
                <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {language === "ar" ? "لديك الوصول الكامل" : language === "fr" ? "Vous avez un accès complet" : "You have full access"}
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              {language === "ar" ? "إجراءات سريعة" : language === "fr" ? "Actions rapides" : "Quick Actions"}
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/")}
                className={`px-4 py-2 rounded-lg ${isDarkMode ? "bg-blue-900 text-blue-400 hover:bg-blue-800" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`}
              >
                {language === "ar" ? "الرئيسية" : language === "fr" ? "Accueil" : "Home"}
              </button>
              <button
                onClick={() => navigate("/rapport")}
                className={`px-4 py-2 rounded-lg ${isDarkMode ? "bg-green-900 text-green-400 hover:bg-green-800" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
              >
                {t.reports}
              </button>
              {isUserAdmin && (
                <button
                  className={`px-4 py-2 rounded-lg ${isDarkMode ? "bg-purple-900 text-purple-400 hover:bg-purple-800" : "bg-purple-100 text-purple-600 hover:bg-purple-200"}`}
                >
                  {t.users}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}