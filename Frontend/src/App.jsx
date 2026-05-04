import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createContext, useState, useEffect } from "react";
import { isAuthenticated, isAdmin } from "./services/authService";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Countries from "./pages/Countries";
import M1Page from "./pages/M1";
import M2Page from "./pages/M2";
import M3Page from "./pages/M3";
import M4Page from "./pages/M4";
import M5Page from "./pages/M5";
import M6Page from "./pages/M6";
import M7Page from "./pages/M7";
import M8Page from "./pages/M8";
import Rapport from "./pages/Rapport";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/Users";
import Settings from "./pages/Settings";
import MineralsPage from "./pages/Minerals";
import TradeExportsPage from "./pages/TradeExports";
import TradeImportsPage from "./pages/TradeImports";
import CountriesManagementPage from "./pages/CountriesManagement";
import YearsManagementPage from "./pages/YearsManagement";
import ProductionManagementPage from "./pages/ProductionManagement";

export const LanguageContext = createContext();
export const ThemeContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("appLanguage") || "ar";
    }
    return "ar";
  });

  useEffect(() => {
    localStorage.setItem("appLanguage", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const changeLanguage = (lang) => {
    if (["ar", "fr", "en"].includes(lang)) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("appTheme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("appTheme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("theme-dark", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function RequireAdmin({ children }) {
  // Non-authenticated users -> login
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  // Authenticated but not admin -> only Rapport
  if (!isAdmin()) return <Navigate to="/rapport" replace />;
  return children;
}

function RequireAuth({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
            <Route path="/users" element={<RequireAdmin><UsersPage /></RequireAdmin>} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/m1" element={<M1Page />} />
            <Route path="/m2" element={<M2Page />} />
            <Route path="/m3" element={<M3Page />} />
            <Route path="/m4" element={<M4Page />} />
            <Route path="/m5" element={<M5Page />} />
            <Route path="/m6" element={<M6Page />} />
            <Route path="/m7" element={<M7Page />} />
            <Route path="/m8" element={<M8Page />} />
            <Route path="/rapport" element={<RequireAuth><Rapport /></RequireAuth>} />
            <Route path="/settings" element={<RequireAdmin><Settings /></RequireAdmin>} />
            <Route path="/minerals" element={<RequireAdmin><MineralsPage /></RequireAdmin>} />
            <Route path="/trade-exports" element={<RequireAdmin><TradeExportsPage /></RequireAdmin>} />
            <Route path="/trade-imports" element={<RequireAdmin><TradeImportsPage /></RequireAdmin>} />
            <Route path="/countries-management" element={<RequireAdmin><CountriesManagementPage /></RequireAdmin>} />
            <Route path="/years-management" element={<RequireAdmin><YearsManagementPage /></RequireAdmin>} />
            <Route path="/production-management" element={<RequireAdmin><ProductionManagementPage /></RequireAdmin>} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}