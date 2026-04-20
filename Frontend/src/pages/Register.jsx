import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import { register, login, loginWithGoogle, isAuthenticated } from "../services/authService";
import { Eye, EyeOff, UserPlus, Globe } from "lucide-react";

// ─── Translations ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  ar: {
    registerTitle: "إنشاء حساب جديد",
    registerSubtitle: "انضم إلى بوابة المؤشرات التعدينية العربية",
    nom: "الاسم",
    prenom: "الاسم الأول",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    role: "الدور",
    registerButton: "إنشاء حساب",
    registering: "جاري إنشاء الحساب...",
    nomPlaceholder: "أدخل الاسم",
    prenomPlaceholder: "أدخل الاسم الأول",
    emailPlaceholder: "أدخل البريد الإلكتروني",
    passwordPlaceholder: "أدخل كلمة المرور",
    success: "تم إنشاء الحساب بنجاح",
    error: "حدث خطأ",
    emailExists: "البريد الإلكتروني مستخدم من قبل",
    roles: {
      user: "مستخدم",
      admin: "مدير",
      editor: "محرر",
    },
    or: "أو",
    signUpWithGoogle: "إنشاء حساب عبر Google",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    login: "تسجيل الدخول",
    backToHome: "العودة للرئيسية",
    loading: "جاري...",
  },
  fr: {
    registerTitle: "Créer un nouveau compte",
    registerSubtitle: "Rejoignez le portail des indicateurs miniers arabes",
    nom: "Nom",
    prenom: "Prénom",
    email: "Adresse e-mail",
    password: "Mot de passe",
    role: "Rôle",
    registerButton: "Créer un compte",
    registering: "Création du compte...",
    nomPlaceholder: "Entrez le nom",
    prenomPlaceholder: "Entrez le prénom",
    emailPlaceholder: "Entrez votre adresse e-mail",
    passwordPlaceholder: "Entrez votre mot de passe",
    success: "Compte créé avec succès",
    error: "Une erreur s'est produite",
    emailExists: "E-mail déjà utilisé",
    roles: {
      user: "Utilisateur",
      admin: "Administrateur",
      editor: "Éditeur",
    },
    or: "ou",
    signUpWithGoogle: "S'inscrire avec Google",
    alreadyHaveAccount: "Vous avez déjà un compte ?",
    login: "Se connecter",
    backToHome: "Retour à l'accueil",
    loading: "Chargement...",
  },
  en: {
    registerTitle: "Create New Account",
    registerSubtitle: "Join the Arab Mining Indicators Portal",
    nom: "Last Name",
    prenom: "First Name",
    email: "Email",
    password: "Password",
    role: "Role",
    registerButton: "Create Account",
    registering: "Creating account...",
    nomPlaceholder: "Enter last name",
    prenomPlaceholder: "Enter first name",
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Enter your password",
    success: "Account created successfully",
    error: "An error occurred",
    emailExists: "Email already in use",
    roles: {
      user: "User",
      admin: "Admin",
      editor: "Editor",
    },
    or: "or",
    signUpWithGoogle: "Sign up with Google",
    alreadyHaveAccount: "Already have an account?",
    login: "Login",
    backToHome: "Back to Home",
    loading: "Loading...",
  },
};

export default function Register() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);

  // Trilingual fields
  const [nom_ar, setNomAr] = useState("");
  const [nom_en, setNomEn] = useState("");
  const [nom_fr, setNomFr] = useState("");
  const [prenom_ar, setPrenomAr] = useState("");
  const [prenom_en, setPrenomEn] = useState("");
  const [prenom_fr, setPrenomFr] = useState("");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const role = "user"; // Default role - users cannot select their own role
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;
  const isRTL = language === "ar";

  // Colors from Home page
  const colors = {
    gold: "#c9a84c",
    forest: "#082821",
    forestLight: "#0c2620",
    cream: "#f6f3ea",
    darkBg: "#071611",
    lightText: "#efe8d4",
    teal: "#7ee0c0",
  };

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await register({
        nom_ar,
        nom_en,
        nom_fr,
        prenom_ar,
        prenom_en,
        prenom_fr,
        email,
        password,
      });
      
      setSuccess(t.success);
      
      // Auto login after register
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setSuccess("");
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8"
      style={{ 
        background: isDarkMode 
          ? `linear-gradient(135deg, ${colors.darkBg} 0%, #0a2f28 50%, ${colors.darkBg} 100%)`
          : `linear-gradient(135deg, ${colors.cream} 0%, #e8e4d9 50%, ${colors.cream} 100%)`
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a84c' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative Circles */}
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-10" 
        style={{ background: `radial-gradient(circle, ${colors.gold} 0%, transparent 70%)` }} 
      />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-10" 
        style={{ background: `radial-gradient(circle, ${colors.teal} 0%, transparent 70%)` }} 
      />

      <div className="relative w-full max-w-2xl p-8 rounded-3xl shadow-2xl backdrop-blur-sm mx-4"
        style={{ 
          background: isDarkMode 
            ? `rgba(10, 47, 40, 0.95)`
            : `rgba(255, 255, 255, 0.95)`,
          border: `1px solid ${isDarkMode ? 'rgba(201, 168, 76, 0.2)' : 'rgba(201, 168, 76, 0.3)'}`,
          boxShadow: `0 25px 50px -12px ${isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{ 
              background: `linear-gradient(135deg, ${colors.gold} 0%, #e8d08a 100%)`,
              boxShadow: `0 8px 20px ${colors.gold}40`
            }}
          >
            <UserPlus size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2"
            style={{ 
              color: isDarkMode ? colors.lightText : colors.forest,
              textShadow: isDarkMode ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {t.registerTitle}
          </h1>
          <p className="text-sm"
            style={{ color: isDarkMode ? 'rgba(239, 232, 212, 0.6)' : 'rgba(21, 35, 30, 0.6)' }}
          >
            {t.registerSubtitle}
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-xl text-center text-sm font-medium"
            style={{ 
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              color: '#dc2626'
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-xl text-center text-sm font-medium"
            style={{ 
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#16a34a'
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Fields - Trilingual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Arabic */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {t.nom} (عربي)
              </label>
              <input
                type="text"
                value={nom_ar}
                onChange={(e) => setNomAr(e.target.value)}
                placeholder={isRTL ? t.nomPlaceholder : "Nom (Arabe)"}
                className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  background: isDarkMode ? 'rgba(12, 38, 32, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: isDarkMode ? 'rgba(201, 168, 76, 0.25)' : 'rgba(201, 168, 76, 0.3)',
                  color: isDarkMode ? colors.lightText : colors.forest,
                  "--tw-ring-color": colors.gold,
                }}
                dir="rtl"
              />
            </div>
            {/* English */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {t.nom} (English)
              </label>
              <input
                type="text"
                value={nom_en}
                onChange={(e) => setNomEn(e.target.value)}
                placeholder="Last Name"
                className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  background: isDarkMode ? 'rgba(12, 38, 32, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: isDarkMode ? 'rgba(201, 168, 76, 0.25)' : 'rgba(201, 168, 76, 0.3)',
                  color: isDarkMode ? colors.lightText : colors.forest,
                  "--tw-ring-color": colors.gold,
                }}
              />
            </div>
            {/* French */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {t.nom} (Français)
              </label>
              <input
                type="text"
                value={nom_fr}
                onChange={(e) => setNomFr(e.target.value)}
                placeholder="Nom"
                className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  background: isDarkMode ? 'rgba(12, 38, 32, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: isDarkMode ? 'rgba(201, 168, 76, 0.25)' : 'rgba(201, 168, 76, 0.3)',
                  color: isDarkMode ? colors.lightText : colors.forest,
                  "--tw-ring-color": colors.gold,
                }}
              />
            </div>
          </div>

          {/* First Name Fields - Trilingual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Arabic */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {t.prenom} (عربي)
              </label>
              <input
                type="text"
                value={prenom_ar}
                onChange={(e) => setPrenomAr(e.target.value)}
                placeholder={isRTL ? t.prenomPlaceholder : "Prénom (Arabe)"}
                className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  background: isDarkMode ? 'rgba(12, 38, 32, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: isDarkMode ? 'rgba(201, 168, 76, 0.25)' : 'rgba(201, 168, 76, 0.3)',
                  color: isDarkMode ? colors.lightText : colors.forest,
                  "--tw-ring-color": colors.gold,
                }}
                dir="rtl"
              />
            </div>
            {/* English */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {t.prenom} (English)
              </label>
              <input
                type="text"
                value={prenom_en}
                onChange={(e) => setPrenomEn(e.target.value)}
                placeholder="First Name"
                className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  background: isDarkMode ? 'rgba(12, 38, 32, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: isDarkMode ? 'rgba(201, 168, 76, 0.25)' : 'rgba(201, 168, 76, 0.3)',
                  color: isDarkMode ? colors.lightText : colors.forest,
                  "--tw-ring-color": colors.gold,
                }}
              />
            </div>
            {/* French */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {t.prenom} (Français)
              </label>
              <input
                type="text"
                value={prenom_fr}
                onChange={(e) => setPrenomFr(e.target.value)}
                placeholder="Prénom"
                className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  background: isDarkMode ? 'rgba(12, 38, 32, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: isDarkMode ? 'rgba(201, 168, 76, 0.25)' : 'rgba(201, 168, 76, 0.3)',
                  color: isDarkMode ? colors.lightText : colors.forest,
                  "--tw-ring-color": colors.gold,
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              {t.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              required
              className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                background: isDarkMode ? 'rgba(12, 38, 32, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                borderColor: isDarkMode ? 'rgba(201, 168, 76, 0.25)' : 'rgba(201, 168, 76, 0.3)',
                color: isDarkMode ? colors.lightText : colors.forest,
                "--tw-ring-color": colors.gold,
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              {t.password}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                required
                className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  background: isDarkMode ? 'rgba(12, 38, 32, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: isDarkMode ? 'rgba(201, 168, 76, 0.25)' : 'rgba(201, 168, 76, 0.3)',
                  color: isDarkMode ? colors.lightText : colors.forest,
                  "--tw-ring-color": colors.gold,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "left-3" : "right-3"} p-1 transition-colors`}
                style={{ color: isDarkMode ? 'rgba(239, 232, 212, 0.5)' : 'rgba(21, 35, 30, 0.5)' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg"
            style={{ 
              background: loading 
                ? 'rgba(201, 168, 76, 0.5)' 
                : `linear-gradient(135deg, ${colors.gold} 0%, #b8943f 100%)`,
              boxShadow: loading ? 'none' : `0 4px 15px ${colors.gold}40`,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? t.registering : t.registerButton}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" 
                style={{ borderColor: isDarkMode ? 'rgba(201, 168, 76, 0.2)' : 'rgba(201, 168, 76, 0.3)' }}
              />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3" 
                style={{ 
                  background: isDarkMode ? 'rgba(10, 47, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  color: isDarkMode ? 'rgba(239, 232, 212, 0.5)' : 'rgba(21, 35, 30, 0.5)' 
                }}
              >
                {t.or}
              </span>
            </div>
          </div>

          {/* Google Register Button */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={googleLoading}
            className="w-full py-3.5 px-4 rounded-xl font-medium border transition-all duration-200 flex items-center justify-center gap-3 hover:shadow-md"
            style={{ 
              background: isDarkMode ? 'rgba(12, 38, 32, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              borderColor: isDarkMode ? 'rgba(201, 168, 76, 0.25)' : 'rgba(201, 168, 76, 0.3)',
              color: isDarkMode ? colors.lightText : colors.forest,
              opacity: googleLoading ? 0.6 : 1,
              cursor: googleLoading ? 'not-allowed' : 'pointer',
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{googleLoading ? t.loading : t.signUpWithGoogle}</span>
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-8 text-center text-sm" 
          style={{ color: isDarkMode ? 'rgba(239, 232, 212, 0.6)' : 'rgba(21, 35, 30, 0.6)' }}
        >
          {t.alreadyHaveAccount}
          <Link
            to="/login"
            className="font-semibold mx-1 transition-colors hover:underline"
            style={{ color: colors.gold }}
          >
            {t.login}
          </Link>
        </p>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
            style={{ color: isDarkMode ? 'rgba(239, 232, 212, 0.5)' : 'rgba(21, 35, 30, 0.5)' }}
          >
            <Globe size={16} />
            {t.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}