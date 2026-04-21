import { useState, useContext, useEffect } from "react";

// Importer l'URL du backend depuis .env
const API_URL = import.meta.env.VITE_API_URL;
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
  const isRTL = language === "ar";

  // Color palette matching Home/Login/Sidebar
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bg }}>
        <div className="animate-spin rounded-full h-12 w-12" style={{ borderBottom: `2px solid ${colors.gold}` }}></div>
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
      <div className="p-4 sm:p-6 lg:p-8" style={{ background: colors.bg, minHeight: "100vh" }}>
        {/* Welcome Header */}
        <div className="mb-6 sm:mb-8 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg" 
          style={{ 
            background: `linear-gradient(135deg, ${colors.cardBg} 0%, ${isDarkMode ? '#0d2b24' : '#f9f7f2'} 100%)`,
            border: `1px solid ${colors.border}`,
          }}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {user.photo ? (
              <img
                src={
                  user.photo.startsWith("http")
                    ? user.photo
                    : `${API_URL}${user.photo}`
                }
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2"
                style={{ borderColor: colors.gold }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full flex items-center justify-center border-2"
                style={{ borderColor: colors.gold, background: colors.goldPale }}>
                <User className="w-8 h-8" style={{ color: colors.forest }} />
              </div>
            )}
            <div className="text-center sm:text-start">
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.ink }}>
                {t.welcome}, {user.prenom_ar || user.prenom_en || user.prenom_fr || user.nom_ar || user.nom_en || user.nom_fr || "User"}!
              </h1>
              <p className="mt-1 text-sm" style={{ color: colors.muted }}>
                {language === "ar" ? "هذه هي لوحة التحكم الخاصة بك" : language === "fr" ? "Ceci est votre tableau de bord" : "This is your dashboard"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Profile Card */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            style={{ 
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
            }}>
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              {user.photo ? (
                <img
                  src={
                    user.photo.startsWith("http")
                      ? user.photo
                      : `${API_URL}${user.photo}`
                  }
                  alt="Profile"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2"
                  style={{ borderColor: colors.gold }}
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2"
                  style={{ borderColor: colors.gold, background: colors.goldPale }}>
                  <User className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: colors.forest }} />
                </div>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-semibold" style={{ color: colors.ink }}>
              {t.profile}
            </h3>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: colors.muted }}>
              {t.email}: {user.email}
            </p>
            <p className="text-xs sm:text-sm" style={{ color: colors.muted }}>
              {t.role}: {t.roles[userRole] || userRole}
            </p>
          </div>

          {/* Role Card */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            style={{ 
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
            }}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4" 
              style={{ background: colors.goldPale }}>
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colors.gold }} />
            </div>
            <h3 className="text-base sm:text-lg font-semibold" style={{ color: colors.ink }}>
              {t.role}
            </h3>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: colors.muted }}>
              {isUserAdmin 
                ? (language === "ar" ? "لديك صلاحيات المدير" : language === "fr" ? "Vous avez les droits d'administrateur" : "You have admin privileges")
                : (language === "ar" ? "لديك صلاحيات المستخدم" : language === "fr" ? "Vous avez les droits d'utilisateur" : "You have user privileges")
              }
            </p>
          </div>

          {/* Admin Panel Access */}
          {isUserAdmin && (
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              style={{ 
                background: `linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.cardBg} 100%)`,
                border: `2px solid ${colors.gold}`,
              }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4" 
                style={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)` }}>
                <Users className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colors.forest }} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold" style={{ color: colors.ink }}>
                {t.adminPanel}
              </h3>
              <p className="mt-1 text-xs sm:text-sm" style={{ color: colors.muted }}>
                {language === "ar" ? "لديك الوصول الكامل" : language === "fr" ? "Vous avez un accès complet" : "You have full access"}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg"
          style={{ 
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }}>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: colors.ink }}>
            {language === "ar" ? "إجراءات سريعة" : language === "fr" ? "Actions rapides" : "Quick Actions"}
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/")}
              className="px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
              style={{ 
                background: colors.goldPale,
                color: colors.forest,
                border: `1px solid ${colors.border}`,
              }}
            >
              {language === "ar" ? "الرئيسية" : language === "fr" ? "Accueil" : "Home"}
            </button>
            <button
              onClick={() => navigate("/rapport")}
              className="px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
              style={{ 
                background: isDarkMode ? "rgba(126,224,192,0.15)" : "rgba(8,39,33,0.08)",
                color: colors.forest,
                border: `1px solid ${colors.border}`,
              }}
            >
              {t.reports}
            </button>
            {isUserAdmin && (
              <button
                onClick={() => navigate("/users")}
                className="px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
                  color: colors.forest,
                  border: `1px solid ${colors.gold}`,
                }}
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