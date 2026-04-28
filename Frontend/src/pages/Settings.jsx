import { useState, useContext, useEffect, useRef } from "react";

// Importer l'URL du backend depuis .env
const API_URL = import.meta.env.VITE_API_URL;
import { useNavigate } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import { getCurrentUser, updateUser, refreshCurrentUser } from "../services/authService";
import Sidebar, { MobileHeader } from "../layouts/Sidebar";
import { User, Mail, Lock, Save, Camera, ArrowRight, Upload, X } from "lucide-react";

// ─── Translations ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  ar: {
    settings: "الإعدادات",
    profile: "الملف الشخصي",
    editProfile: "تعديل الملف الشخصي",
    personalInfo: "المعلومات الشخصية",
    firstName: "الاسم الأول",
    lastName: "الاسم الأخير",
    email: "البريد الإلكتروني",
    role: "الدور",
    createdAt: "تاريخ الإنشاء",
    save: "حفظ",
    cancel: "إلغاء",
    success: "تم التحديث بنجاح",
    error: "حدث خطأ",
    changePassword: "تغيير كلمة المرور",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور",
    language: "اللغة",
    theme: "المظهر",
    lightMode: "فاتح",
    darkMode: "داكن",
    roles: {
      admin: "مدير",
      user: "مستخدم",
      editor: "محرر",
    },
  },
  fr: {
    settings: "Paramètres",
    profile: "Profil",
    editProfile: "Modifier le profil",
    personalInfo: "Informations personnelles",
    firstName: "Prénom",
    lastName: "Nom",
    email: "E-mail",
    role: "Rôle",
    createdAt: "Date de création",
    save: "Enregistrer",
    cancel: "Annuler",
    success: "Mis à jour avec succès",
    error: "Une erreur s'est produite",
    changePassword: "Changer le mot de passe",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    language: "Langue",
    theme: "Thème",
    lightMode: "Clair",
    darkMode: "Sombre",
    roles: {
      admin: "Administrateur",
      user: "Utilisateur",
      editor: "Éditeur",
    },
  },
  en: {
    settings: "Settings",
    profile: "Profile",
    editProfile: "Edit Profile",
    personalInfo: "Personal Information",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    role: "Role",
    createdAt: "Created at",
    save: "Save",
    cancel: "Cancel",
    success: "Updated successfully",
    error: "An error occurred",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    language: "Language",
    theme: "Theme",
    lightMode: "Light",
    darkMode: "Dark",
    roles: {
      admin: "Admin",
      user: "User",
      editor: "Editor",
    },
  },
};

export default function Settings() {
  const navigate = useNavigate();
  const { language, changeLanguage } = useContext(LanguageContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    prenom_ar: "",
    nom_ar: "",
    prenom_fr: "",
    nom_fr: "",
    prenom_en: "",
    nom_en: "",
    email: "",
  });

  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;
  const isRTL = language === "ar";

  // Color palette matching theme
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
        const updatedUser = await refreshCurrentUser();
        const userData = updatedUser || currentUser;
        setUser(userData);
        setFormData({
          prenom_ar: userData.prenom_ar || "",
          nom_ar: userData.nom_ar || "",
          prenom_fr: userData.prenom_fr || "",
          nom_fr: userData.nom_fr || "",
          prenom_en: userData.prenom_en || "",
          nom_en: userData.nom_en || "",
          email: userData.email || "",
        });
      }
      setLoading(false);
    };
    loadUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: "error", text: language === "ar" ? "الملف يجب أن يكون صورة" : language === "fr" ? "Le fichier doit être une image" : "File must be an image" });
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: "error", text: language === "ar" ? "حجم الصورة يجب أن يكون أقل من 2 ميجابايت" : language === "fr" ? "La taille de l'image doit être inférieure à 2 Mo" : "Image size must be less than 2MB" });
        return;
      }
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) return;
    
    setUploading(true);
    try {
      // Convert base64 to blob
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('photo', blob, 'profile-photo.jpg');
      formData.append('userId', user.id);
      
      // Upload to backend
      const uploadResponse = await fetch(`${API_URL}/api/users/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      
      if (uploadResponse.ok) {
        const data = await uploadResponse.json();
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        window.dispatchEvent(new Event("auth:user-updated"));
        setMessage({ type: "success", text: t.success });
        setSelectedImage(null);
      } else {
        setMessage({ type: "error", text: t.error });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({ type: "error", text: t.error });
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const updatedUser = await updateUser(user.id, formData);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("auth:user-updated"));
        setMessage({ type: "success", text: t.success });
        setIsEditing(false);
      } else {
        setMessage({ type: "error", text: t.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: t.error });
    }

    setSaving(false);
  };

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

  const settingsContent = (
    <>
      <MobileHeader 
        onMenuClick={() => setSidebarOpen(true)} 
        title={t.settings} 
      />

      <div className="p-4 sm:p-6 lg:p-8" style={{ background: colors.bg, minHeight: "100vh" }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: colors.gold }}>
            {t.settings}
          </h1>
          <p className="mt-2" style={{ color: colors.muted }}>
            {language === "ar" ? "إدارة إعدادات حسابك" : language === "fr" ? "Gérez les paramètres de votre compte" : "Manage your account settings"}
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            style={{ background: message.type === "success" ? colors.goldPale : 'rgba(220,38,38,0.1)', color: message.type === "success" ? colors.forest : '#dc2626' }}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-2 xl:col-span-2">
            <div className="rounded-2xl p-6 shadow-lg" 
              style={{ 
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
              }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
                <h2 className="text-lg sm:text-xl font-bold" style={{ color: colors.ink }}>
                  {t.personalInfo}
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base"
                  style={{ 
                    background: isEditing ? colors.goldPale : `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
                    color: colors.forest,
                  }}
                >
                  {isEditing ? t.cancel : t.editProfile}
                </button>
              </div>

              {/* Profile Photo */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8 pb-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
                <div className="relative">
                  {selectedImage || user.photo ? (
                    <img
                      src={
                        selectedImage ||
                        (user.photo
                          ? user.photo.startsWith("http")
                            ? user.photo
                            : `${API_URL}${user.photo}`
                          : undefined)
                      }
                      alt="Profile"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="w-24 h-24 rounded-full object-cover border-4"
                      style={{ borderColor: colors.gold }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full flex items-center justify-center border-4"
                      style={{ borderColor: colors.gold, background: colors.goldPale }}>
                      <User className="w-12 h-12" style={{ color: colors.forest }} />
                    </div>
                  )}
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 rounded-full transition-all duration-200 hover:scale-110"
                        style={{ background: colors.gold, color: colors.forest }}
                      >
                        <Camera size={16} />
                      </button>
                    </>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-semibold" style={{ color: colors.ink }}>
                    {user.prenom_ar || user.prenom_en || user.prenom_fr || ""} {user.nom_ar || user.nom_en || user.nom_fr || ""}
                  </h3>
                  <p className="text-sm" style={{ color: colors.muted }}>{user.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium"
                    style={{ background: colors.goldPale, color: colors.forest }}>
                    {t.roles[userRole] || userRole}
                  </span>
                  
                  {/* Image Upload Actions */}
                  {selectedImage && (
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        type="button"
                        onClick={handleUploadImage}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{ 
                          background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
                          color: colors.forest,
                        }}
                      >
                        {uploading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                        ) : (
                          <Upload size={16} />
                        )}
                        {language === "ar" ? "رفع" : language === "fr" ? "Télécharger" : "Upload"}
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                        style={{ 
                          background: 'rgba(220,38,38,0.1)',
                          color: '#dc2626',
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Arabic Names */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                      {t.firstName} (عربي)
                    </label>
                    <input
                      type="text"
                      name="prenom_ar"
                      value={formData.prenom_ar}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base"
                      style={{ 
                        background: colors.bg,
                        color: colors.ink,
                        border: `1px solid ${colors.border}`,
                        opacity: isEditing ? 1 : 0.7,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                      {t.lastName} (عربي)
                    </label>
                    <input
                      type="text"
                      name="nom_ar"
                      value={formData.nom_ar}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base"
                      style={{ 
                        background: colors.bg,
                        color: colors.ink,
                        border: `1px solid ${colors.border}`,
                        opacity: isEditing ? 1 : 0.7,
                      }}
                    />
                  </div>

                  {/* French Names */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                      {t.firstName} (Français)
                    </label>
                    <input
                      type="text"
                      name="prenom_fr"
                      value={formData.prenom_fr}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-200"
                      style={{ 
                        background: colors.bg,
                        color: colors.ink,
                        border: `1px solid ${colors.border}`,
                        opacity: isEditing ? 1 : 0.7,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                      {t.lastName} (Français)
                    </label>
                    <input
                      type="text"
                      name="nom_fr"
                      value={formData.nom_fr}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base"
                      style={{ 
                        background: colors.bg,
                        color: colors.ink,
                        border: `1px solid ${colors.border}`,
                        opacity: isEditing ? 1 : 0.7,
                      }}
                    />
                  </div>

                  {/* English Names */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                      {t.firstName} (English)
                    </label>
                    <input
                      type="text"
                      name="prenom_en"
                      value={formData.prenom_en}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base"
                      style={{ 
                        background: colors.bg,
                        color: colors.ink,
                        border: `1px solid ${colors.border}`,
                        opacity: isEditing ? 1 : 0.7,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                      {t.lastName} (English)
                    </label>
                    <input
                      type="text"
                      name="nom_en"
                      value={formData.nom_en}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base"
                      style={{ 
                        background: colors.bg,
                        color: colors.ink,
                        border: `1px solid ${colors.border}`,
                        opacity: isEditing ? 1 : 0.7,
                      }}
                    />
                  </div>

                  {/* Email (read-only) */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                      {t.email}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm sm:text-base"
                      style={{ 
                        background: colors.bg,
                        color: colors.muted,
                        border: `1px solid ${colors.border}`,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                      style={{ 
                        background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
                        color: colors.forest,
                      }}
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                      ) : (
                        <Save size={20} />
                      )}
                      {t.save}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Sidebar Options */}
          <div className="space-y-4 sm:space-y-6">
            {/* Language */}
            <div className="rounded-2xl p-4 sm:p-6 shadow-lg" 
              style={{ 
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
              }}>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: colors.ink }}>
                {t.language}
              </h3>
              <div className="space-y-2">
                {["ar", "fr", "en"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base"
                    style={{ 
                      background: language === lang ? colors.goldPale : 'transparent',
                      color: language === lang ? colors.forest : colors.ink,
                      border: `1px solid ${language === lang ? colors.gold : colors.border}`,
                    }}
                  >
                    <span>{lang === "ar" ? "العربية" : lang === "fr" ? "Français" : "English"}</span>
                    {language === lang && <ArrowRight size={16} style={{ color: colors.gold }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="rounded-2xl p-4 sm:p-6 shadow-lg" 
              style={{ 
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
              }}>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: colors.ink }}>
                {t.theme}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => { if (isDarkMode) toggleTheme(); }}
                  className="flex-1 py-3 rounded-xl transition-all duration-200"
                  style={{ 
                    background: !isDarkMode ? `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)` : colors.bg,
                    color: !isDarkMode ? colors.forest : colors.ink,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {t.lightMode}
                </button>
                <button
                  onClick={() => { if (!isDarkMode) toggleTheme(); }}
                  className="flex-1 py-3 rounded-xl transition-all duration-200"
                  style={{ 
                    background: isDarkMode ? `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)` : colors.bg,
                    color: isDarkMode ? colors.forest : colors.ink,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {t.darkMode}
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="rounded-2xl p-4 sm:p-6 shadow-lg" 
              style={{ 
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
              }}>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: colors.ink }}>
                {t.profile}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={16} style={{ color: colors.muted }} />
                  <span className="text-sm" style={{ color: colors.muted }}>{t.email}:</span>
                  <span className="text-sm" style={{ color: colors.ink }}>{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User size={16} style={{ color: colors.muted }} />
                  <span className="text-sm" style={{ color: colors.muted }}>{t.role}:</span>
                  <span className="text-sm" style={{ color: colors.ink }}>{t.roles[userRole] || userRole}</span>
                </div>
                {user.createdAt && (
                  <div className="flex items-center gap-3">
                    <Lock size={16} style={{ color: colors.muted }} />
                    <span className="text-sm" style={{ color: colors.muted }}>{t.createdAt}:</span>
                    <span className="text-sm" style={{ color: colors.ink }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
      {settingsContent}
    </Sidebar>
  );
}