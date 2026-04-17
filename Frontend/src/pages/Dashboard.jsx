import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import { getCurrentUser, isAdmin, refreshCurrentUser } from "../services/authService";
import Sidebar, { MobileHeader } from "../layouts/Sidebar";
import { User, Shield, Users } from "lucide-react";

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

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        navigate("/login");
      } else {
        // Refresh user data from server to get latest photo
        const updatedUser = await refreshCurrentUser();
        setUser(updatedUser || currentUser);
      }
      setLoading(false);
    };
    loadUser();
  }, [navigate]);

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

  // Content to be rendered inside the Sidebar
  const dashboardContent = (
    <>
      {/* Mobile Header */}
      <MobileHeader 
        onMenuClick={() => setSidebarOpen(true)} 
        title={t.dashboard} 
      />

      {/* Main Content */}
      <div className="p-6 lg:p-8">
        {/* Welcome Header */}
        <div className={`mb-8 ${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm`}>
          <div className="flex items-center gap-4">
            {user.photo ? (
              <img 
                src={user.photo} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? "bg-blue-900" : "bg-blue-100"}`}>
                <User className={`w-8 h-8 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
              </div>
            )}
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                {t.welcome}, {user.prenom_ar || user.prenom_en || user.prenom_fr || user.nom_ar || user.nom_en || user.nom_fr || "User"}!
              </h1>
              <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {language === "ar" ? "هذه هي لوحة التحكم الخاصة بك" : language === "fr" ? "Ceci est votre tableau de bord" : "This is your dashboard"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-sm`}>
            <div className="flex items-center gap-4 mb-4">
              {user.photo ? (
                <img 
                  src={user.photo} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? "bg-blue-900" : "bg-blue-100"}`}>
                  <User className={`w-8 h-8 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                </div>
              )}
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
    </>
  );

  return (
    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
      {dashboardContent}
    </Sidebar>
  );
}