import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import { getCurrentUser, isAdmin, refreshCurrentUser } from "../services/authService";
import Sidebar, { MobileHeader } from "../layouts/Sidebar";
import { User, Users, TrendingUp, TrendingDown, BarChart3, PieChart, Activity, DollarSign } from "lucide-react";
import { tradeCriticalMineralsData } from "../tradeCriticalMineralsData";
import Chart from "chart.js/auto";

const API_URL = import.meta.env.VITE_API_URL;

const TRANSLATIONS = {
  ar: { dashboard: "لوحة التحكم", welcome: "مرحباً", profile: "الملف الشخصي", settings: "الإعدادات", logout: "تسجيل الخروج", adminPanel: "لوحة الإدارة", users: "المستخدمون", statistics: "الإحصائيات", reports: "التقارير", noAccess: "لا تملك صلاحيات الوصول لهذه الصفحة", role: "الدور", email: "البريد الإلكتروني", createdAt: "تاريخ الإنشاء", roles: { admin: "مدير", user: "مستخدم", editor: "محرر" }, totalExports: "إجمالي الصادرات", totalImports: "إجمالي الواردات", totalValue: "القيمة الإجمالية", topProducts: "أهم المنتجات", yearlyTrend: "الاتجاه السنوي", byFlowType: "حسب نوع التدفق", exports: "الصادرات", imports: "الواردات", quickActions: "إجراءات سريعة", home: "الرئيسية" },
  fr: { dashboard: "Tableau de bord", welcome: "Bienvenue", profile: "Profil", settings: "Paramètres", logout: "Déconnexion", adminPanel: "Panneau d'administration", users: "Utilisateurs", statistics: "Statistiques", reports: "Rapports", noAccess: "Vous n'avez pas accès à cette page", role: "Rôle", email: "E-mail", createdAt: "Date de création", roles: { admin: "Administrateur", user: "Utilisateur", editor: "Éditeur" }, totalExports: "Exportations totales", totalImports: "Importations totales", totalValue: "Valeur totale", topProducts: "Produits principaux", yearlyTrend: "Tendance annuelle", byFlowType: "Par type de flux", exports: "Exportations", imports: "Importations", quickActions: "Actions rapides", home: "Accueil" },
  en: { dashboard: "Dashboard", welcome: "Welcome", profile: "Profile", settings: "Settings", logout: "Logout", adminPanel: "Admin Panel", users: "Users", statistics: "Statistics", reports: "Reports", noAccess: "You don't have access to this page", role: "Role", email: "Email", createdAt: "Created at", roles: { admin: "Admin", user: "User", editor: "Editor" }, totalExports: "Total Exports", totalImports: "Total Imports", totalValue: "Total Value", topProducts: "Top Products", yearlyTrend: "Yearly Trend", byFlowType: "By Flow Type", exports: "Exports", imports: "Imports", quickActions: "Quick Actions", home: "Home" }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);
  const lineChartInstance = useRef(null);
  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;

  const colors = isDarkMode ? { bg: "#071611", bgLight: "#0c2620", forest: "#efe8d4", forestMid: "#7a9a8c", gold: "#d3b468", goldLight: "#efdba2", goldPale: "#1a332d", ink: "#efe8d4", muted: "#b8b09d", border: "rgba(201,168,76,0.22)", accent: "#7ee0c0", cardBg: "#0d2b24" } : { bg: "#f5f3ef", bgLight: "#ede9df", forest: "#082721", forestMid: "#3d6b5c", gold: "#c9a84c", goldLight: "#e8d08a", goldPale: "#f7f0dc", ink: "#1a1510", muted: "#7a7060", border: "rgba(8,39,33,0.08)", accent: "#0d3d34", cardBg: "#ffffff" };

  useEffect(() => {
    if (!tradeCriticalMineralsData || tradeCriticalMineralsData.length === 0) { setStats({ totalExports: 0, totalImports: 0, totalValue: 0, topProducts: [], yearlyData: [], flowData: { exports: 0, imports: 0 } }); return; }
    const exportsData = tradeCriticalMineralsData.filter(d => d.flow === "Export");
    const importsData = tradeCriticalMineralsData.filter(d => d.flow === "Import");
    const totalExports = exportsData.reduce((sum, d) => sum + (d.value_usd || 0), 0);
    const totalImports = importsData.reduce((sum, d) => sum + (d.value_usd || 0), 0);
    const totalValue = totalExports + totalImports;
    const productValues = {};
    tradeCriticalMineralsData.forEach(d => { const product = d.aggregate_product || "Other"; productValues[product] = (productValues[product] || 0) + (d.value_usd || 0); });
    const topProducts = Object.entries(productValues).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
    const yearlyValues = {};
    tradeCriticalMineralsData.forEach(d => { const year = d.year; if (!yearlyValues[year]) yearlyValues[year] = { exports: 0, imports: 0, total: 0 }; if (d.flow === "Export") yearlyValues[year].exports += d.value_usd || 0; else yearlyValues[year].imports += d.value_usd || 0; yearlyValues[year].total += d.value_usd || 0; });
    const yearlyData = Object.entries(yearlyValues).sort((a, b) => a[0] - b[0]).map(([year, data]) => ({ year: parseInt(year), ...data }));
    setStats({ totalExports, totalImports, totalValue, topProducts, yearlyData, flowData: { exports: totalExports, imports: totalImports } });
  }, []);

  // Initialize charts when stats become available
  useEffect(() => {
    if (!stats) return;
    
    // Wait for DOM to be ready and check for canvas elements
    const createCharts = () => {
      const barCanvas = document.getElementById('bar-chart');
      const pieCanvas = document.getElementById('pie-chart');
      const lineCanvas = document.getElementById('line-chart');
      
      if (!barCanvas || !pieCanvas || !lineCanvas) {
        // Retry after a short delay
        setTimeout(createCharts, 50);
        return;
      }
      
      // Destroy existing charts first
      if (barChartInstance.current) { barChartInstance.current.destroy(); barChartInstance.current = null; }
      if (pieChartInstance.current) { pieChartInstance.current.destroy(); pieChartInstance.current = null; }
      if (lineChartInstance.current) { lineChartInstance.current.destroy(); lineChartInstance.current = null; }
      
      const textColor = isDarkMode ? "#efe8d4" : "#1a1510";
      const gridColor = isDarkMode ? "rgba(201,168,76,0.15)" : "rgba(8,39,33,0.08)";
      
      barChartInstance.current = new Chart(barCanvas, { type: "bar", data: { labels: stats.topProducts.map(p => p.name), datasets: [{ label: t.totalValue, data: stats.topProducts.map(p => p.value), backgroundColor: [colors.gold, colors.goldLight, colors.accent, colors.forestMid, colors.muted], borderColor: colors.gold, borderWidth: 1, borderRadius: 8 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `$${c.raw.toLocaleString()}` } } }, scales: { x: { ticks: { color: textColor }, grid: { color: gridColor } }, y: { ticks: { color: textColor, callback: (v) => `$${(v / 1000000).toFixed(1)}M` }, grid: { color: gridColor } } } } });
      pieChartInstance.current = new Chart(pieCanvas, { type: "doughnut", data: { labels: [t.exports, t.imports], datasets: [{ data: [stats.flowData.exports, stats.flowData.imports], backgroundColor: [colors.gold, colors.accent], borderColor: isDarkMode ? "#0c2620" : "#ffffff", borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { color: textColor } }, tooltip: { callbacks: { label: (c) => `$${c.raw.toLocaleString()}` } } } } });
      lineChartInstance.current = new Chart(lineCanvas, { type: "line", data: { labels: stats.yearlyData.map(d => d.year), datasets: [{ label: t.exports, data: stats.yearlyData.map(d => d.exports), borderColor: colors.gold, backgroundColor: `${colors.gold}30`, fill: true, tension: 0.4 }, { label: t.imports, data: stats.yearlyData.map(d => d.imports), borderColor: colors.accent, backgroundColor: `${colors.accent}30`, fill: true, tension: 0.4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { color: textColor } }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: $${c.raw.toLocaleString()}` } } }, scales: { x: { ticks: { color: textColor }, grid: { color: gridColor } }, y: { ticks: { color: textColor, callback: (v) => `$${(v / 1000000).toFixed(1)}M` }, grid: { color: gridColor } } } } });
    };
    
    createCharts();
  }, [stats, isDarkMode, language, t]);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => { if (barChartInstance.current) barChartInstance.current.destroy(); if (pieChartInstance.current) pieChartInstance.current.destroy(); if (lineChartInstance.current) lineChartInstance.current.destroy(); };
  }, []);

  useEffect(() => { const loadUser = async () => { const currentUser = getCurrentUser(); if (!currentUser) navigate("/login"); else { const updatedUser = await refreshCurrentUser(); setUser(updatedUser || currentUser); } setLoading(false); }; loadUser(); }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bg }}><div className="animate-spin rounded-full h-12 w-12" style={{ borderBottom: `2px solid ${colors.gold}` }}></div></div>;
  if (!user) return null;
  const isUserAdmin = isAdmin();
  const formatCurrency = (v) => { if (v >= 1000000000) return `$${(v / 1000000000).toFixed(2)}B`; if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`; if (v >= 1000) return `$${(v / 1000).toFixed(2)}K`; return `$${v.toFixed(2)}`; };

  return (
    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
      <>
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} title={t.dashboard} />
        <div className="p-4 sm:p-6 lg:p-8" style={{ background: colors.bg, minHeight: "100vh" }}>
          <div className="mb-6 sm:mb-8 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg" style={{ background: `linear-gradient(135deg, ${colors.cardBg} 0%, ${isDarkMode ? '#0d2b24' : '#f9f7f2'} 100%)`, border: `1px solid ${colors.border}` }}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {user.photo ? <img src={user.photo.startsWith("http") ? user.photo : `${API_URL}${user.photo}`} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: colors.gold }} /> : <div className="w-16 h-16 rounded-full flex items-center justify-center border-2" style={{ borderColor: colors.gold, background: colors.goldPale }}><User className="w-8 h-8" style={{ color: colors.forest }} /></div>}
              <div className="text-center sm:text-start"><h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.ink }}>{t.welcome}, {user.prenom_ar || user.prenom_en || user.prenom_fr || user.nom_ar || user.nom_en || user.nom_fr || "User"}!</h1><p className="mt-1 text-sm" style={{ color: colors.muted }}>{language === "ar" ? "هذه هي لوحة التحكم الخاصة بك" : language === "fr" ? "Ceci est votre tableau de bord" : "This is your dashboard"}</p></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}><div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4" style={{ background: colors.goldPale }}><TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colors.gold }} /></div><p className="text-xs sm:text-sm" style={{ color: colors.muted }}>{t.totalExports}</p><h3 className="text-lg sm:text-xl font-bold" style={{ color: colors.ink }}>{stats ? formatCurrency(stats.totalExports) : "$0"}</h3></div>
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}><div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4" style={{ background: isDarkMode ? "rgba(126,224,192,0.15)" : "rgba(8,39,33,0.08)" }}><TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colors.accent }} /></div><p className="text-xs sm:text-sm" style={{ color: colors.muted }}>{t.totalImports}</p><h3 className="text-lg sm:text-xl font-bold" style={{ color: colors.ink }}>{stats ? formatCurrency(stats.totalImports) : "$0"}</h3></div>
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}><div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4" style={{ background: `linear-gradient(135deg, ${colors.gold}20, ${colors.goldLight}20)` }}><DollarSign className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colors.gold }} /></div><p className="text-xs sm:text-sm" style={{ color: colors.muted }}>{t.totalValue}</p><h3 className="text-lg sm:text-xl font-bold" style={{ color: colors.ink }}>{stats ? formatCurrency(stats.totalValue) : "$0"}</h3></div>
            {isUserAdmin && <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.cardBg} 100%)`, border: `2px solid ${colors.gold}` }}><div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4" style={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)` }}><Users className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colors.forest }} /></div><p className="text-xs sm:text-sm" style={{ color: colors.muted }}>{t.adminPanel}</p><h3 className="text-lg sm:text-xl font-bold" style={{ color: colors.ink }}>{language === "ar" ? "وصول كامل" : language === "fr" ? "Accès complet" : "Full Access"}</h3></div>}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}><div className="flex items-center gap-2 mb-4"><BarChart3 className="w-5 h-5" style={{ color: colors.gold }} /><h3 className="text-base sm:text-lg font-semibold" style={{ color: colors.ink }}>{t.topProducts}</h3></div><div className="h-64"><canvas id="bar-chart"></canvas></div></div>
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}><div className="flex items-center gap-2 mb-4"><PieChart className="w-5 h-5" style={{ color: colors.gold }} /><h3 className="text-base sm:text-lg font-semibold" style={{ color: colors.ink }}>{t.byFlowType}</h3></div><div className="h-64"><canvas id="pie-chart"></canvas></div></div>
          </div>
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mb-6 sm:mb-8" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}><div className="flex items-center gap-2 mb-4"><Activity className="w-5 h-5" style={{ color: colors.gold }} /><h3 className="text-base sm:text-lg font-semibold" style={{ color: colors.ink }}>{t.yearlyTrend}</h3></div><div className="h-64"><canvas id="line-chart"></canvas></div></div>
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}><h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: colors.ink }}>{t.quickActions}</h3><div className="flex flex-wrap gap-2 sm:gap-3"><button onClick={() => navigate("/")} className="px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm" style={{ background: colors.goldPale, color: colors.forest, border: `1px solid ${colors.border}` }}>{t.home}</button><button onClick={() => navigate("/rapport")} className="px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm" style={{ background: isDarkMode ? "rgba(126,224,192,0.15)" : "rgba(8,39,33,0.08)", color: colors.forest, border: `1px solid ${colors.border}` }}>{t.reports}</button><button onClick={() => navigate("/m1")} className="px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm" style={{ background: isDarkMode ? "rgba(126,224,192,0.15)" : "rgba(8,39,33,0.08)", color: colors.forest, border: `1px solid ${colors.border}` }}>{language === "ar" ? "الإنتاج التعديني" : language === "fr" ? "Production minière" : "Mining Production"}</button>{isUserAdmin && <button onClick={() => navigate("/users")} className="px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm" style={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`, color: colors.forest, border: `1px solid ${colors.gold}` }}>{t.users}</button>}</div></div>
        </div>
      </>
    </Sidebar>
  );
}
