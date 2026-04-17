import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import { login, isAuthenticated } from "../services/authService";
import { Eye, EyeOff, LogIn } from "lucide-react";

// ─── Translations ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  ar: {
    loginTitle: "تسجيل الدخول",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    loginButton: "دخول",
    loggingIn: "جاري تسجيل الدخول...",
    emailPlaceholder: "أدخل البريد الإلكتروني",
    passwordPlaceholder: "أدخل كلمة المرور",
    invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    error: "حدث خطأ أثناء تسجيل الدخول",
  },
  fr: {
    loginTitle: "Connexion",
    email: "Adresse e-mail",
    password: "Mot de passe",
    loginButton: "Se connecter",
    loggingIn: "Connexion en cours...",
    emailPlaceholder: "Entrez votre adresse e-mail",
    passwordPlaceholder: "Entrez votre mot de passe",
    invalidCredentials: "E-mail ou mot de passe incorrect",
    error: "Erreur lors de la connexion",
  },
  en: {
    loginTitle: "Login",
    email: "Email",
    password: "Password",
    loginButton: "Login",
    loggingIn: "Logging in...",
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Enter your password",
    invalidCredentials: "Invalid email or password",
    error: "Error during login",
  },
};

export default function Login() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;
  const isRTL = language === "ar";

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || t.invalidCredentials
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            {t.loginTitle}
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-400 text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="mb-6">
            <label className={`block mb-2 text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              {t.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              required
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label className={`block mb-2 text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              {t.password}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                required
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2`}
              >
                {showPassword ? (
                  <EyeOff className={isDarkMode ? "text-gray-400" : "text-gray-500"} size={20} />
                ) : (
                  <Eye className={isDarkMode ? "text-gray-400" : "text-gray-500"} size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 
              ${loading 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
              } flex items-center justify-center gap-2`}
          >
            {loading ? (
              <span>{t.loggingIn}</span>
            ) : (
              <>
                <LogIn size={20} />
                <span>{t.loginButton}</span>
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <p className={`mt-6 text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          {language === "ar" ? "ليس لديك حساب؟ " : language === "fr" ? "Vous n'avez pas de compte ? " : "Don't have an account? "}
          <a
            href="/register"
            className={`font-semibold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
          >
            {language === "ar" ? "إنشاء حساب" : language === "fr" ? "Créer un compte" : "Register"}
          </a>
        </p>
      </div>
    </div>
  );
}