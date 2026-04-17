import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import { register, login, isAuthenticated } from "../services/authService";
import { Eye, EyeOff, UserPlus } from "lucide-react";

// ─── Translations ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  ar: {
    registerTitle: "إنشاء حساب جديد",
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
  },
  fr: {
    registerTitle: "Créer un nouveau compte",
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
  },
  en: {
    registerTitle: "Create New Account",
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
  const [role, setRole] = useState("user");
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        role,
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

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      <div className={`w-full max-w-2xl p-8 rounded-2xl shadow-xl ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDarkMode ? "bg-blue-900" : "bg-blue-100"}`}>
            <UserPlus className={`w-8 h-8 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
          </div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            {t.registerTitle}
          </h1>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className={`mb-4 p-4 rounded-lg ${isDarkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700"}`}>
            {error}
          </div>
        )}
        {success && (
          <div className={`mb-4 p-4 rounded-lg ${isDarkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700"}`}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields - Trilingual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Arabic */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {t.nom} (عربي)
              </label>
              <input
                type="text"
                value={nom_ar}
                onChange={(e) => setNomAr(e.target.value)}
                placeholder={isRTL ? t.nomPlaceholder : "Nom (Arabe)"}
                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                dir="rtl"
              />
            </div>
            {/* English */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {t.nom} (English)
              </label>
              <input
                type="text"
                value={nom_en}
                onChange={(e) => setNomEn(e.target.value)}
                placeholder="Last Name"
                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            {/* French */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {t.nom} (Français)
              </label>
              <input
                type="text"
                value={nom_fr}
                onChange={(e) => setNomFr(e.target.value)}
                placeholder="Nom"
                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>

          {/* First Name Fields - Trilingual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Arabic */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {t.prenom} (عربي)
              </label>
              <input
                type="text"
                value={prenom_ar}
                onChange={(e) => setPrenomAr(e.target.value)}
                placeholder={isRTL ? t.prenomPlaceholder : "Prénom (Arabe)"}
                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                dir="rtl"
              />
            </div>
            {/* English */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {t.prenom} (English)
              </label>
              <input
                type="text"
                value={prenom_en}
                onChange={(e) => setPrenomEn(e.target.value)}
                placeholder="First Name"
                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            {/* French */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {t.prenom} (Français)
              </label>
              <input
                type="text"
                value={prenom_fr}
                onChange={(e) => setPrenomFr(e.target.value)}
                placeholder="Prénom"
                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              {t.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              required
              className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>

          {/* Password */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              {t.password}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                required
                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              {t.role}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="user">{t.roles.user}</option>
              <option value="admin">{t.roles.admin}</option>
              <option value="editor">{t.roles.editor}</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? t.registering : t.registerButton}
          </button>
        </form>

        {/* Login Link */}
        <p className={`mt-6 text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          {language === "ar" ? "لديك حساب بالفعل؟ " : language === "fr" ? "Vous avez déjà un compte ? " : "Already have an account? "}
          <a
            href="/login"
            className={`font-semibold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
          >
            {language === "ar" ? "تسجيل الدخول" : language === "fr" ? "Se connecter" : "Login"}
          </a>
        </p>
      </div>
    </div>
  );
}