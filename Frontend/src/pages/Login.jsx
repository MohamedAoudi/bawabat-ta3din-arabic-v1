import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import { login, loginWithGoogle, isAuthenticated } from "../services/authService";
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
    accountPending: "حسابك في انتظار موافقة المدير",
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
    accountPending: "Votre compte est en attente d'approbation par l'administrateur",
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
    accountPending: "Your account is pending approval by admin",
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
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || t.error);
    } finally {
      setGoogleLoading(false);
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

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDarkMode ? "border-gray-600" : "border-gray-300"}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"}`}>
                {language === "ar" ? "أو" : language === "fr" ? "ou" : "or"}
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium border transition-all duration-200 
              flex items-center justify-center gap-3
              ${isDarkMode 
                ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" 
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              } ${googleLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>
              {googleLoading 
                ? (language === "ar" ? "جاري..." : language === "fr" ? "Chargement..." : "Loading...")
                : (language === "ar" ? "تسجيل الدخول عبر Google" : language === "fr" ? "Se connecter avec Google" : "Sign in with Google")
              }
            </span>
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