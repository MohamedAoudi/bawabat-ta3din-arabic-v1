import { useState, useContext, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import { getCurrentUser, isAdmin, refreshCurrentUser } from "../services/authService";
import { getTradeTransactions } from "../services/tradeTransactionService";
import { getMinerals } from "../services/mineralService";
import { getMineralProduction } from "../services/mineralProductionService";
import { getCountries } from "../services/countryService";
import Sidebar, { MobileHeader } from "../layouts/Sidebar";
import { User, Users, TrendingUp, TrendingDown, BarChart3, PieChart, Activity, DollarSign } from "lucide-react";
import Chart from "chart.js/auto";

const API_URL = import.meta.env.VITE_API_URL;

const TRANSLATIONS = {
  ar: { dashboard: "لوحة التحكم", welcome: "مرحباً", profile: "الملف الشخصي", settings: "الإعدادات", logout: "تسجيل الخروج", adminPanel: "لوحة الإدارة", users: "المستخدمون", statistics: "الإحصائيات", reports: "التقارير", noAccess: "لا تملك صلاحيات الوصول لهذه الصفحة", role: "الدور", email: "البريد الإلكتروني", createdAt: "تاريخ الإنشاء", roles: { admin: "مدير", user: "مستخدم", editor: "محرر" }, totalExports: "إجمالي الصادرات", totalImports: "إجمالي الواردات", totalValue: "القيمة الإجمالية", topProducts: "أهم المنتجات", yearlyTrend: "الإنتاج السنوي", byFlowType: "حسب نوع التدفق", exports: "الصادرات", imports: "الواردات", annualProduction: "الإنتاج السنوي", annualNormalizedProduction: "الإنتاج المعياري السنوي", quickActions: "إجراءات سريعة", home: "الرئيسية", all: "الكل", fromYear: "من سنة", toYear: "إلى سنة", tradeType: "نوع التدفق", country: "الدولة", mineral: "الخامة", reset: "إعادة ضبط" },
  fr: { dashboard: "Tableau de bord", welcome: "Bienvenue", profile: "Profil", settings: "Paramètres", logout: "Déconnexion", adminPanel: "Panneau d'administration", users: "Utilisateurs", statistics: "Statistiques", reports: "Rapports", noAccess: "Vous n'avez pas accès à cette page", role: "Rôle", email: "E-mail", createdAt: "Date de création", roles: { admin: "Administrateur", user: "Utilisateur", editor: "Éditeur" }, totalExports: "Exportations totales", totalImports: "Importations totales", totalValue: "Valeur totale", topProducts: "Produits principaux", yearlyTrend: "Production annuelle", byFlowType: "Par type de flux", exports: "Exportations", imports: "Importations", annualProduction: "Production annuelle", annualNormalizedProduction: "Production normalisée annuelle", quickActions: "Actions rapides", home: "Accueil", all: "Tous", fromYear: "De l'année", toYear: "À l'année", tradeType: "Type de flux", country: "Pays", mineral: "Minéral", reset: "Réinitialiser" },
  en: { dashboard: "Dashboard", welcome: "Welcome", profile: "Profile", settings: "Settings", logout: "Logout", adminPanel: "Admin Panel", users: "Users", statistics: "Statistics", reports: "Reports", noAccess: "You don't have access to this page", role: "Role", email: "Email", createdAt: "Created at", roles: { admin: "Admin", user: "User", editor: "Editor" }, totalExports: "Total Exports", totalImports: "Total Imports", totalValue: "Total Value", topProducts: "Top Products", yearlyTrend: "Annual Production", byFlowType: "By Flow Type", exports: "Exports", imports: "Imports", annualProduction: "Annual Production", annualNormalizedProduction: "Annual Normalized Production", quickActions: "Quick Actions", home: "Home", all: "All", fromYear: "From year", toYear: "To year", tradeType: "Flow type", country: "Country", mineral: "Mineral", reset: "Reset" }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [chartKey, setChartKey] = useState(0);
  const [transactionsRows, setTransactionsRows] = useState([]);
  const [mineralsRows, setMineralsRows] = useState([]);
  const [productionRows, setProductionRows] = useState([]);
  const [countriesRows, setCountriesRows] = useState([]);
  const [mineralById, setMineralById] = useState({});
  const [countryById, setCountryById] = useState({});

  // Chart filters (each chart has its own independent filter state)
  const [barFilters, setBarFilters] = useState({ yearFrom: "", yearTo: "", tradeType: "all", countryId: "all" });
  const [pieFilters, setPieFilters] = useState({ yearFrom: "", yearTo: "", countryId: "all" });
  const [lineFilters, setLineFilters] = useState({ yearFrom: "", yearTo: "", countryId: "all", mineralId: "all" });

  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);
  const lineChartInstance = useRef(null);
  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update chartKey when window size changes to re-render charts
  useEffect(() => {
    setChartKey(prev => prev + 1);
  }, [windowSize.width]);

  const colors = isDarkMode ? { bg: "#071611", bgLight: "#0c2620", forest: "#efe8d4", forestMid: "#7a9a8c", gold: "#d3b468", goldLight: "#efdba2", goldPale: "#1a332d", ink: "#efe8d4", muted: "#b8b09d", border: "rgba(201,168,76,0.22)", accent: "#7ee0c0", cardBg: "#0d2b24" } : { bg: "#f5f3ef", bgLight: "#ede9df", forest: "#082721", forestMid: "#3d6b5c", gold: "#c9a84c", goldLight: "#e8d08a", goldPale: "#f7f0dc", ink: "#1a1510", muted: "#7a7060", border: "rgba(8,39,33,0.08)", accent: "#0d3d34", cardBg: "#ffffff" };

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const [transactions, minerals, productionRows, countries] = await Promise.all([
          getTradeTransactions(),
          getMinerals(),
          getMineralProduction(),
          getCountries(),
        ]);

        const txRows = Array.isArray(transactions) ? transactions : [];
        const mineralRows = Array.isArray(minerals) ? minerals : [];
        const prodRows = Array.isArray(productionRows) ? productionRows : [];
        const countryRows = Array.isArray(countries) ? countries : [];
        const productionByYear = {};
        prodRows.forEach((r) => {
          const year = Number(r.year);
          if (!year) return;
          if (!productionByYear[year]) {
            productionByYear[year] = { production: 0, normalizedProduction: 0 };
          }
          productionByYear[year].production += Number(r.production_quantity || 0);
          productionByYear[year].normalizedProduction += Number(r.normalized_quantity || 0);
        });
        const yearlyProductionData = Object.entries(productionByYear)
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([year, data]) => ({ year: Number(year), ...data }));

        const computedMineralById = mineralRows.reduce((acc, m) => {
          const name =
            language === "ar"
              ? m.name_ar
              : language === "fr"
                ? m.name_fr
                : m.name_en;
          acc[String(m.id)] = name || `#${m.id}`;
          return acc;
        }, {});

        const computedCountryById = countryRows.reduce((acc, c) => {
          const name =
            language === "ar"
              ? c.name_ar
              : language === "fr"
                ? c.name_fr
                : c.name_en;
          acc[String(c.id)] = name || `#${c.id}`;
          return acc;
        }, {});

        // Store raw datasets for chart filtering
        setTransactionsRows(txRows);
        setMineralsRows(mineralRows);
        setProductionRows(prodRows);
        setCountriesRows(countryRows);
        setMineralById(computedMineralById);
        setCountryById(computedCountryById);

        if (txRows.length === 0) {
          setStats({
            totalExports: 0,
            totalImports: 0,
            totalValue: 0,
            topProducts: [],
            yearlyData: [],
            yearlyProductionData,
            flowData: { exports: 0, imports: 0 },
          });
          return;
        }

        const exportsData = txRows.filter((d) => String(d.trade_type || "").toLowerCase() === "export");
        const importsData = txRows.filter((d) => String(d.trade_type || "").toLowerCase() === "import");

        const totalExports = exportsData.reduce((sum, d) => sum + Number(d.trade_value_usd || 0), 0);
        const totalImports = importsData.reduce((sum, d) => sum + Number(d.trade_value_usd || 0), 0);
        const totalValue = totalExports + totalImports;

        const productValues = {};
        txRows.forEach((d) => {
          const key = String(d.mineral_id || "unknown");
          const label = computedMineralById[key] || `#${key}`;
          productValues[label] = (productValues[label] || 0) + Number(d.trade_value_usd || 0);
        });

        const topProducts = Object.entries(productValues)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, value]) => ({ name, value }));

        const yearlyValues = {};
        txRows.forEach((d) => {
          const year = Number(d.year);
          if (!year) return;
          if (!yearlyValues[year]) {
            yearlyValues[year] = { exports: 0, imports: 0, total: 0 };
          }
          const value = Number(d.trade_value_usd || 0);
          if (String(d.trade_type || "").toLowerCase() === "export") {
            yearlyValues[year].exports += value;
          } else if (String(d.trade_type || "").toLowerCase() === "import") {
            yearlyValues[year].imports += value;
          }
          yearlyValues[year].total += value;
        });

        const yearlyData = Object.entries(yearlyValues)
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([year, data]) => ({ year: Number(year), ...data }));

        setStats({
          totalExports,
          totalImports,
          totalValue,
          topProducts,
          yearlyData,
          yearlyProductionData,
          flowData: { exports: totalExports, imports: totalImports },
        });
      } catch (error) {
        console.error("Failed to load dashboard stats from DB:", error);
        setStats({
          totalExports: 0,
          totalImports: 0,
          totalValue: 0,
          topProducts: [],
          yearlyData: [],
          yearlyProductionData: [],
          flowData: { exports: 0, imports: 0 },
        });
      }
    };

    loadDashboardStats();
  }, [language]);

  const parseYearOrNull = (v) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const barTopProducts = useMemo(() => {
    const yearFrom = parseYearOrNull(barFilters.yearFrom);
    const yearTo = parseYearOrNull(barFilters.yearTo);
    const tradeType = barFilters.tradeType;
    const countryId = barFilters.countryId;

    const filtered = transactionsRows.filter((d) => {
      const year = Number(d.year);
      if (yearFrom !== null && year < yearFrom) return false;
      if (yearTo !== null && year > yearTo) return false;

      if (countryId !== "all" && String(d.country_id) !== String(countryId)) return false;

      if (tradeType !== "all") {
        const tt = String(d.trade_type || "").toLowerCase();
        if (tradeType === "export" && tt !== "export") return false;
        if (tradeType === "import" && tt !== "import") return false;
      }
      return true;
    });

    const productValues = {};
    filtered.forEach((d) => {
      const key = String(d.mineral_id || "unknown");
      const label = mineralById[key] || `#${key}`;
      productValues[label] = (productValues[label] || 0) + Number(d.trade_value_usd || 0);
    });

    return Object.entries(productValues)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [transactionsRows, barFilters, mineralById]);

  const pieFlowData = useMemo(() => {
    const yearFrom = parseYearOrNull(pieFilters.yearFrom);
    const yearTo = parseYearOrNull(pieFilters.yearTo);
    const countryId = pieFilters.countryId;

    const filtered = transactionsRows.filter((d) => {
      const year = Number(d.year);
      if (yearFrom !== null && year < yearFrom) return false;
      if (yearTo !== null && year > yearTo) return false;

      if (countryId !== "all" && String(d.country_id) !== String(countryId)) return false;

      return true;
    });

    const exportsValue = filtered.reduce((sum, d) => {
      return sum + (String(d.trade_type || "").toLowerCase() === "export" ? Number(d.trade_value_usd || 0) : 0);
    }, 0);
    const importsValue = filtered.reduce((sum, d) => {
      return sum + (String(d.trade_type || "").toLowerCase() === "import" ? Number(d.trade_value_usd || 0) : 0);
    }, 0);

    return { exports: exportsValue, imports: importsValue };
  }, [transactionsRows, pieFilters]);

  const lineYearlyProductionData = useMemo(() => {
    const yearFrom = parseYearOrNull(lineFilters.yearFrom);
    const yearTo = parseYearOrNull(lineFilters.yearTo);
    const countryId = lineFilters.countryId;
    const mineralId = lineFilters.mineralId;

    const filtered = productionRows.filter((r) => {
      const year = Number(r.year);
      if (yearFrom !== null && year < yearFrom) return false;
      if (yearTo !== null && year > yearTo) return false;

      if (countryId !== "all" && String(r.country_id) !== String(countryId)) return false;
      if (mineralId !== "all" && String(r.mineral_id) !== String(mineralId)) return false;
      return true;
    });

    const productionByYear = {};
    filtered.forEach((r) => {
      const year = Number(r.year);
      if (!year) return;
      if (!productionByYear[year]) {
        productionByYear[year] = { production: 0, normalizedProduction: 0 };
      }
      productionByYear[year].production += Number(r.production_quantity || 0);
      productionByYear[year].normalizedProduction += Number(r.normalized_quantity || 0);
    });

    return Object.entries(productionByYear)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([year, data]) => ({ year: Number(year), ...data }));
  }, [productionRows, lineFilters]);

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
      const isMobile = windowSize.width < 640;
      
      // Chart options with responsive settings for mobile
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { 
            enabled: true,
            callbacks: { label: (c) => `$${c.raw.toLocaleString()}` }
          }
        },
        scales: {
          x: { 
            ticks: { color: textColor, font: { size: isMobile ? 10 : 12 } }, 
            grid: { color: gridColor } 
          },
          y: { 
            ticks: { color: textColor, callback: (v) => `$${(v / 1000000).toFixed(1)}M`, font: { size: isMobile ? 10 : 12 } }, 
            grid: { color: gridColor } 
          }
        }
      };
      
      const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: isMobile ? 'right' : 'bottom', 
            labels: { color: textColor, font: { size: isMobile ? 10 : 12 }, boxWidth: isMobile ? 12 : 20 } 
          },
          tooltip: { callbacks: { label: (c) => `$${c.raw.toLocaleString()}` } }
        }
      };
      
      const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: isMobile ? 'top' : 'bottom', 
            labels: { color: textColor, font: { size: isMobile ? 10 : 12 }, boxWidth: isMobile ? 12 : 20 } 
          },
          tooltip: { callbacks: { label: (c) => `${c.dataset.label}: $${c.raw.toLocaleString()}` } }
        },
        scales: {
          x: { 
            ticks: { color: textColor, font: { size: isMobile ? 10 : 12 } }, 
            grid: { color: gridColor } 
          },
          y: { 
            ticks: { color: textColor, callback: (v) => `$${(v / 1000000).toFixed(1)}M`, font: { size: isMobile ? 10 : 12 } }, 
            grid: { color: gridColor } 
          }
        }
      };
      
      const barDatasetLabel = barFilters.tradeType === "export" ? t.exports : barFilters.tradeType === "import" ? t.imports : t.totalValue;

      barChartInstance.current = new Chart(barCanvas, {
        type: "bar",
        data: {
          labels: barTopProducts.map((p) => p.name),
          datasets: [
            {
              label: barDatasetLabel,
              data: barTopProducts.map((p) => p.value),
              backgroundColor: [colors.gold, colors.goldLight, colors.accent, colors.forestMid, colors.muted],
              borderColor: colors.gold,
              borderWidth: 1,
              borderRadius: 8,
            },
          ],
        },
        options: chartOptions,
      });
      pieChartInstance.current = new Chart(pieCanvas, {
        type: "doughnut",
        data: {
          labels: [t.exports, t.imports],
          datasets: [
            {
              data: [pieFlowData.exports, pieFlowData.imports],
              backgroundColor: [colors.gold, colors.accent],
              borderColor: isDarkMode ? "#0c2620" : "#ffffff",
              borderWidth: 2,
            },
          ],
        },
        options: pieOptions,
      });
      lineChartInstance.current = new Chart(lineCanvas, {
        type: "line",
        data: {
          labels: (lineYearlyProductionData || []).map((d) => d.year),
          datasets: [
            {
              label: t.annualProduction,
              data: (lineYearlyProductionData || []).map((d) => d.production),
              borderColor: colors.gold,
              backgroundColor: `${colors.gold}30`,
              fill: true,
              tension: 0.4,
            },
            {
              label: t.annualNormalizedProduction,
              data: (lineYearlyProductionData || []).map((d) => d.normalizedProduction),
              borderColor: colors.accent,
              backgroundColor: `${colors.accent}30`,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: lineOptions,
      });
    };
    
    createCharts();
  }, [stats, barTopProducts, pieFlowData, lineYearlyProductionData, barFilters.tradeType, isDarkMode, t, windowSize]);

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
              {user.photo ? (
                <img
                  src={user.photo.startsWith("http") ? user.photo : `${API_URL}${user.photo}`}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="w-16 h-16 rounded-full object-cover border-2"
                  style={{ borderColor: colors.gold }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center border-2" style={{ borderColor: colors.gold, background: colors.goldPale }}>
                  <User className="w-8 h-8" style={{ color: colors.forest }} />
                </div>
              )}
              <div className="text-center sm:text-start"><h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.ink }}>{t.welcome}, {user.prenom_ar || user.prenom_en || user.prenom_fr || user.nom_ar || user.nom_en || user.nom_fr || "User"}!</h1><p className="mt-1 text-sm" style={{ color: colors.muted }}>{language === "ar" ? "هذه هي لوحة التحكم الخاصة بك" : language === "fr" ? "Ceci est votre tableau de bord" : "This is your dashboard"}</p></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6 mb-4 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-2 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] touch-manipulation" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}><div className="w-6 h-6 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-1 sm:mb-4" style={{ background: colors.goldPale }}><TrendingUp className="w-3 h-3 sm:w-6 sm:h-6" style={{ color: colors.gold }} /></div><p className="text-[10px] sm:text-sm" style={{ color: colors.muted }}>{t.totalExports}</p><h3 className="text-xs sm:text-xl font-bold" style={{ color: colors.ink }}>{stats ? formatCurrency(stats.totalExports) : "$0"}</h3></div>
            <div className="rounded-xl sm:rounded-2xl p-2 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] touch-manipulation" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}><div className="w-6 h-6 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-1 sm:mb-4" style={{ background: isDarkMode ? "rgba(126,224,192,0.15)" : "rgba(8,39,33,0.08)" }}><TrendingDown className="w-3 h-3 sm:w-6 sm:h-6" style={{ color: colors.accent }} /></div><p className="text-[10px] sm:text-sm" style={{ color: colors.muted }}>{t.totalImports}</p><h3 className="text-xs sm:text-xl font-bold" style={{ color: colors.ink }}>{stats ? formatCurrency(stats.totalImports) : "$0"}</h3></div>
            <div className="rounded-xl sm:rounded-2xl p-2 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] touch-manipulation" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}><div className="w-6 h-6 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-1 sm:mb-4" style={{ background: `linear-gradient(135deg, ${colors.gold}20, ${colors.goldLight}20)` }}><DollarSign className="w-3 h-3 sm:w-6 sm:h-6" style={{ color: colors.gold }} /></div><p className="text-[10px] sm:text-sm" style={{ color: colors.muted }}>{t.totalValue}</p><h3 className="text-xs sm:text-xl font-bold" style={{ color: colors.ink }}>{stats ? formatCurrency(stats.totalValue) : "$0"}</h3></div>
            {isUserAdmin && <div className="rounded-xl sm:rounded-2xl p-2 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] touch-manipulation" style={{ background: `linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.cardBg} 100%)`, border: `2px solid ${colors.gold}` }}><div className="w-6 h-6 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-1 sm:mb-4" style={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)` }}><Users className="w-3 h-3 sm:w-6 sm:h-6" style={{ color: colors.forest }} /></div><p className="text-[10px] sm:text-sm" style={{ color: colors.muted }}>{t.adminPanel}</p><h3 className="text-xs sm:text-xl font-bold" style={{ color: colors.ink }}>{language === "ar" ? "وصول كامل" : language === "fr" ? "Accès complet" : "Full Access"}</h3></div>}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:gap-6 mb-4 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: colors.gold }} />
                  <h3 className="text-sm sm:text-lg font-semibold" style={{ color: colors.ink }}>{t.topProducts}</h3>
                </div>
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px]" style={{ color: colors.muted }}>{t.fromYear}</span>
                    <input
                      type="number"
                      value={barFilters.yearFrom}
                      onChange={(e) => setBarFilters((p) => ({ ...p, yearFrom: e.target.value }))}
                      className="w-24 px-2 py-1 rounded-lg text-xs"
                      style={{ border: `1px solid ${colors.border}`, background: colors.bgLight, color: colors.ink }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px]" style={{ color: colors.muted }}>{t.toYear}</span>
                    <input
                      type="number"
                      value={barFilters.yearTo}
                      onChange={(e) => setBarFilters((p) => ({ ...p, yearTo: e.target.value }))}
                      className="w-24 px-2 py-1 rounded-lg text-xs"
                      style={{ border: `1px solid ${colors.border}`, background: colors.bgLight, color: colors.ink }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px]" style={{ color: colors.muted }}>{t.tradeType}</span>
                    <select
                      value={barFilters.tradeType}
                      onChange={(e) => setBarFilters((p) => ({ ...p, tradeType: e.target.value }))}
                      className="px-2 py-1 rounded-lg text-xs"
                      style={{ border: `1px solid ${colors.border}`, background: colors.bgLight, color: colors.ink }}
                    >
                      <option value="all">{t.all}</option>
                      <option value="export">{t.exports}</option>
                      <option value="import">{t.imports}</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px]" style={{ color: colors.muted }}>{t.country}</span>
                    <select
                      value={barFilters.countryId}
                      onChange={(e) => setBarFilters((p) => ({ ...p, countryId: e.target.value }))}
                      className="px-2 py-1 rounded-lg text-xs"
                      style={{ border: `1px solid ${colors.border}`, background: colors.bgLight, color: colors.ink }}
                    >
                      <option value="all">{t.all}</option>
                      {countriesRows.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {language === "ar" ? c.name_ar : language === "fr" ? c.name_fr : c.name_en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setBarFilters({ yearFrom: "", yearTo: "", tradeType: "all", countryId: "all" })}
                    className="px-3 py-2 rounded-lg text-xs touch-manipulation"
                    style={{ background: colors.goldPale, color: colors.forest, border: `1px solid ${colors.border}` }}
                  >
                    {t.reset}
                  </button>
                </div>
              </div>
              <div className="h-48 sm:h-64 mt-2"><canvas id="bar-chart" key={`bar-${chartKey}`}></canvas></div>
            </div>

            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <PieChart className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: colors.gold }} />
                  <h3 className="text-sm sm:text-lg font-semibold" style={{ color: colors.ink }}>{t.byFlowType}</h3>
                </div>
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px]" style={{ color: colors.muted }}>{t.fromYear}</span>
                    <input
                      type="number"
                      value={pieFilters.yearFrom}
                      onChange={(e) => setPieFilters((p) => ({ ...p, yearFrom: e.target.value }))}
                      className="w-24 px-2 py-1 rounded-lg text-xs"
                      style={{ border: `1px solid ${colors.border}`, background: colors.bgLight, color: colors.ink }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px]" style={{ color: colors.muted }}>{t.toYear}</span>
                    <input
                      type="number"
                      value={pieFilters.yearTo}
                      onChange={(e) => setPieFilters((p) => ({ ...p, yearTo: e.target.value }))}
                      className="w-24 px-2 py-1 rounded-lg text-xs"
                      style={{ border: `1px solid ${colors.border}`, background: colors.bgLight, color: colors.ink }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px]" style={{ color: colors.muted }}>{t.country}</span>
                    <select
                      value={pieFilters.countryId}
                      onChange={(e) => setPieFilters((p) => ({ ...p, countryId: e.target.value }))}
                      className="px-2 py-1 rounded-lg text-xs"
                      style={{ border: `1px solid ${colors.border}`, background: colors.bgLight, color: colors.ink }}
                    >
                      <option value="all">{t.all}</option>
                      {countriesRows.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {language === "ar" ? c.name_ar : language === "fr" ? c.name_fr : c.name_en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setPieFilters({ yearFrom: "", yearTo: "", countryId: "all" })}
                    className="px-3 py-2 rounded-lg text-xs touch-manipulation"
                    style={{ background: colors.goldPale, color: colors.forest, border: `1px solid ${colors.border}` }}
                  >
                    {t.reset}
                  </button>
                </div>
              </div>
              <div className="h-48 sm:h-64 mt-2"><canvas id="pie-chart" key={`pie-${chartKey}`}></canvas></div>
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg mb-4 sm:mb-8" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: colors.gold }} />
                <h3 className="text-sm sm:text-lg font-semibold" style={{ color: colors.ink }}>{t.yearlyTrend}</h3>
              </div>
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex flex-col">
                  <span className="text-[10px]" style={{ color: colors.muted }}>{t.fromYear}</span>
                  <input
                    type="number"
                    value={lineFilters.yearFrom}
                    onChange={(e) => setLineFilters((p) => ({ ...p, yearFrom: e.target.value }))}
                    className="w-24 px-2 py-1 rounded-lg text-xs"
                    style={{ border: `1px solid ${colors.border}`, background: colors.bgLight, color: colors.ink }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px]" style={{ color: colors.muted }}>{t.toYear}</span>
                  <input
                    type="number"
                    value={lineFilters.yearTo}
                    onChange={(e) => setLineFilters((p) => ({ ...p, yearTo: e.target.value }))}
                    className="w-24 px-2 py-1 rounded-lg text-xs"
                    style={{ border: `1px solid ${colors.border}`, background: colors.bgLight, color: colors.ink }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px]" style={{ color: colors.muted }}>{t.country}</span>
                  <select
                    value={lineFilters.countryId}
                    onChange={(e) => setLineFilters((p) => ({ ...p, countryId: e.target.value }))}
                    className="px-2 py-1 rounded-lg text-xs"
                    style={{ border: `1px solid ${colors.border}`, background: colors.bgLight, color: colors.ink }}
                  >
                    <option value="all">{t.all}</option>
                    {countriesRows.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {language === "ar" ? c.name_ar : language === "fr" ? c.name_fr : c.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px]" style={{ color: colors.muted }}>{t.mineral}</span>
                  <select
                    value={lineFilters.mineralId}
                    onChange={(e) => setLineFilters((p) => ({ ...p, mineralId: e.target.value }))}
                    className="px-2 py-1 rounded-lg text-xs"
                    style={{ border: `1px solid ${colors.border}`, background: colors.bgLight, color: colors.ink }}
                  >
                    <option value="all">{t.all}</option>
                    {mineralsRows.map((m) => (
                      <option key={m.id} value={String(m.id)}>
                        {language === "ar" ? m.name_ar : language === "fr" ? m.name_fr : m.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setLineFilters({ yearFrom: "", yearTo: "", countryId: "all", mineralId: "all" })}
                  className="px-3 py-2 rounded-lg text-xs touch-manipulation"
                  style={{ background: colors.goldPale, color: colors.forest, border: `1px solid ${colors.border}` }}
                >
                  {t.reset}
                </button>
              </div>
            </div>
            <div className="h-48 sm:h-64 mt-2"><canvas id="line-chart" key={`line-${chartKey}`}></canvas></div>
          </div>
          <div className="rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}><h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4" style={{ color: colors.ink }}>{t.quickActions}</h3><div className="flex flex-wrap gap-2"><button onClick={() => navigate("/")} className="px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-xs sm:text-sm touch-manipulation" style={{ background: colors.goldPale, color: colors.forest, border: `1px solid ${colors.border}` }}>{t.home}</button><button onClick={() => navigate("/rapport")} className="px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-xs sm:text-sm touch-manipulation" style={{ background: isDarkMode ? "rgba(126,224,192,0.15)" : "rgba(8,39,33,0.08)", color: colors.forest, border: `1px solid ${colors.border}` }}>{t.reports}</button><button onClick={() => navigate("/m1")} className="px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-xs sm:text-sm touch-manipulation" style={{ background: isDarkMode ? "rgba(126,224,192,0.15)" : "rgba(8,39,33,0.08)", color: colors.forest, border: `1px solid ${colors.border}` }}>{language === "ar" ? "الإنتاج التعديني" : language === "fr" ? "Production minière" : "Mining Production"}</button>{isUserAdmin && <button onClick={() => navigate("/users")} className="px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-xs sm:text-sm touch-manipulation" style={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`, color: colors.forest, border: `1px solid ${colors.gold}` }}>{t.users}</button>}</div></div>
        </div>
      </>
    </Sidebar>
  );
}
