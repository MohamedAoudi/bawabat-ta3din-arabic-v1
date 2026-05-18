import { useState, useContext, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import { getCurrentUser, isAdmin, refreshCurrentUser } from "../services/authService";
import Sidebar, { MobileHeader } from "../layouts/Sidebar";
import { User, Shield, Users, Edit, Trash2, X, Check, Search, CheckCircle, XCircle, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from "lucide-react";

// Importer l'URL du backend depuis .env
const API_URL = import.meta.env.VITE_API_URL;

const PAGE_SIZE = 15;

// ─── Translations ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  ar: {
    dashboard: "لوحة التحكم",
    users: "المستخدمون",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    adminPanel: "لوحة الإدارة",
    statistics: "الإحصائيات",
    reports: "التقارير",
    noAccess: "لا تملك صلاحيات الوصول لهذه الصفحة",
    role: "الدور",
    email: "البريد الإلكتروني",
    createdAt: "تاريخ الإنشاء",
    actions: "الإجراءات",
    edit: "تعديل",
    delete: "حذف",
    save: "حفظ",
    cancel: "إلغاء",
    search: "بحث",
    noUsers: "لا يوجد مستخدمين",
    confirmDelete: "هل أنت متأكد من حذف هذا المستخدم؟",
    userUpdated: "تم تحديث المستخدم بنجاح",
    userDeleted: "تم حذف المستخدم بنجاح",
    editUser: "تعديل المستخدم",
    name: "الاسم",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    roles: {
      admin: "مدير",
      user: "مستخدم",
    },
    status: "الحالة",
    accepted: "مقبول",
    pending: "في الانتظار",
    accept: "قبول",
    reject: "رفض",
    userAccepted: "تم قبول المستخدم بنجاح",
    userRejected: "تم رفض المستخدم وحذفه",
    active: "نشط",
    inactive: "غير نشط",
    activate: "تفعيل",
    deactivate: "إلغاء التفعيل",
    userActivated: "تم تفعيل المستخدم بنجاح",
    userDeactivated: "تم إلغاء تفعيل المستخدم بنجاح",
    pagination: {
      previous: "السابق",
      next: "التالي",
      pageOf: (page, total) => `صفحة ${page} من ${total}`,
      showing: (from, to, total) => `عرض ${from}–${to} من ${total}`,
    },
  },
  fr: {
    dashboard: "Tableau de bord",
    users: "Utilisateurs",
    profile: "Profil",
    settings: "Paramètres",
    logout: "Déconnexion",
    adminPanel: "Panneau d'administration",
    statistics: "Statistiques",
    reports: "Rapports",
    noAccess: "Vous n'avez pas accès à cette page",
    role: "Rôle",
    email: "E-mail",
    createdAt: "Date de création",
    actions: "Actions",
    edit: "Modifier",
    delete: "Supprimer",
    save: "Enregistrer",
    cancel: "Annuler",
    search: "Rechercher",
    noUsers: "Aucun utilisateur",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cet utilisateur?",
    userUpdated: "Utilisateur mis à jour avec succès",
    userDeleted: "Utilisateur supprimé avec succès",
    editUser: "Modifier l'utilisateur",
    name: "Nom",
    firstName: "Prénom",
    lastName: "Nom",
    roles: {
      admin: "Administrateur",
      user: "Utilisateur",
    },
    status: "Statut",
    accepted: "Accepté",
    pending: "En attente",
    accept: "Accepter",
    reject: "Rejeter",
    userAccepted: "Utilisateur accepté avec succès",
    userRejected: "Utilisateur rejeté et supprimé",
    active: "Actif",
    inactive: "Inactif",
    activate: "Activer",
    deactivate: "Désactiver",
    userActivated: "Utilisateur activé avec succès",
    userDeactivated: "Utilisateur désactivé avec succès",
    pagination: {
      previous: "Précédent",
      next: "Suivant",
      pageOf: (page, total) => `Page ${page} sur ${total}`,
      showing: (from, to, total) => `Affichage ${from}–${to} sur ${total}`,
    },
  },
  en: {
    dashboard: "Dashboard",
    users: "Users",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    adminPanel: "Admin Panel",
    statistics: "Statistics",
    reports: "Reports",
    noAccess: "You don't have access to this page",
    role: "Role",
    email: "Email",
    createdAt: "Created at",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    search: "Search",
    noUsers: "No users found",
    confirmDelete: "Are you sure you want to delete this user?",
    userUpdated: "User updated successfully",
    userDeleted: "User deleted successfully",
    editUser: "Edit User",
    name: "Name",
    firstName: "First Name",
    lastName: "Last Name",
    roles: {
      admin: "Admin",
      user: "User",
    },
    status: "Status",
    accepted: "Accepted",
    pending: "Pending",
    accept: "Accept",
    reject: "Reject",
    userAccepted: "User accepted successfully",
    userRejected: "User rejected and deleted",
    active: "Active",
    inactive: "Inactive",
    activate: "Activate",
    deactivate: "Deactivate",
    userActivated: "User activated successfully",
    userDeactivated: "User deactivated successfully",
    pagination: {
      previous: "Previous",
      next: "Next",
      pageOf: (page, total) => `Page ${page} of ${total}`,
      showing: (from, to, total) => `Showing ${from}–${to} of ${total}`,
    },
  },
};

export default function UsersPage() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);

  // Color palette matching Dashboard
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

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(null);
  const [showActivateConfirm, setShowActivateConfirm] = useState(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;
  const isUserAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const loadUser = async () => {
      const user = getCurrentUser();
      if (!user) {
        navigate("/login");
      } else {
        const updatedUser = await refreshCurrentUser();
        setCurrentUser(updatedUser || user);
        if (updatedUser?.role !== "admin" && user.role !== "admin") {
          navigate("/dashboard");
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [navigate]);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [currentUser?.role]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom_ar: editingUser.nom_ar,
          nom_en: editingUser.nom_en,
          nom_fr: editingUser.nom_fr,
          prenom_ar: editingUser.prenom_ar,
          prenom_en: editingUser.prenom_en,
          prenom_fr: editingUser.prenom_fr,
          email: editingUser.email,
          role: editingUser.role,
        }),
      });

      if (response.ok) {
        fetchUsers();
        setEditingUser(null);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchUsers();
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleAccept = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/${userId}/accept`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchUsers();
        setShowAcceptConfirm(null);
      }
    } catch (error) {
      console.error("Error accepting user:", error);
    }
  };

  const handleReject = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/${userId}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchUsers();
        setShowRejectConfirm(null);
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const token = localStorage.getItem("token");
      // Toggle: if currently accepted, deactivate (false), otherwise activate (true)
      const newIsAccepted = user.is_accepted === true ? false : true;
      console.log("Toggling user:", user.id, "from", user.is_accepted, "to", newIsAccepted, "type:", typeof newIsAccepted);
      
      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_accepted: Boolean(newIsAccepted),
        }),
      });

      const responseData = await response.json();
      console.log("Response:", response.status, responseData);

      if (response.ok) {
        console.log("Toggle successful, refreshing users...");
        fetchUsers();
        setShowActivateConfirm(null);
      } else {
        console.error("Toggle failed:", response.status, response.statusText, responseData);
      }
    } catch (error) {
      console.error("Error toggling user active status:", error);
    }
  };

  const getUserName = useCallback((user) => {
    if (language === "ar") {
      return `${user.prenom_ar || ""} ${user.nom_ar || ""}`.trim();
    } else if (language === "fr") {
      return `${user.prenom_fr || ""} ${user.nom_fr || ""}`.trim();
    } else {
      return `${user.prenom_en || ""} ${user.nom_en || ""}`.trim();
    }
  }, [language]);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const name = getUserName(user).toLowerCase();
      const email = (user.email || "").toLowerCase();
      if (!search) return true;
      return name.includes(search) || email.includes(search);
    });
  }, [users, searchTerm, getUserName]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const rangeFrom = filteredUsers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeTo = Math.min(currentPage * PAGE_SIZE, filteredUsers.length);
  const isRTL = language === "ar";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bg }}>
        <div className="animate-spin rounded-full h-12 w-12" style={{ borderBottom: `2px solid ${colors.gold}` }}></div>
      </div>
    );
  }

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bg }}>
        <div className="text-center">
          <h2 className="text-xl font-bold" style={{ color: colors.ink }}>
            {t.noAccess}
          </h2>
        </div>
      </div>
    );
  }

  const usersContent = (
    <>
      <MobileHeader 
        onMenuClick={() => setSidebarOpen(true)} 
        title={t.users} 
      />

      <div className="p-4 sm:p-6 lg:p-8" style={{ background: colors.bg, minHeight: "100vh" }}>
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.ink }}>
            {t.users}
          </h1>
        </div>

        {/* Search */}
        <div className="mb-4 sm:mb-6 rounded-xl p-3 sm:p-4 shadow-sm" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
          <div className="relative">
            <Search className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2`} size={20} style={{ color: colors.muted }} />
            <input
              type="text"
              placeholder={`${t.search}...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full ${language === "ar" ? "pr-10" : "pl-10"} py-3 rounded-lg border text-sm sm:text-base`}
              style={{ 
                background: colors.bg, 
                color: colors.ink, 
                border: `1px solid ${colors.border}` 
              }}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-xl shadow-sm overflow-hidden" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[100px] sm:min-w-[600px]">
              <thead style={{ background: colors.goldPale }}>
                <tr>
                  <th className={`px-2 sm:px-6 py-2 sm:py-4 text-${language === "ar" ? "right" : "left"} text-xs font-semibold`} style={{ color: colors.forest }}>
                    {t.profile}
                  </th>
                  <th className={`px-2 sm:px-6 py-2 sm:py-4 text-${language === "ar" ? "right" : "left"} text-xs font-semibold hidden md:table-cell`} style={{ color: colors.forest }}>
                    {t.email}
                  </th>
                  <th className={`px-2 sm:px-6 py-2 sm:py-4 text-${language === "ar" ? "right" : "left"} text-xs font-semibold hidden sm:table-cell`} style={{ color: colors.forest }}>
                    {t.role}
                  </th>
                  <th className={`px-2 sm:px-6 py-2 sm:py-4 text-${language === "ar" ? "right" : "left"} text-xs font-semibold hidden sm:table-cell`} style={{ color: colors.forest }}>
                    {t.status}
                  </th>
                  <th className={`px-2 sm:px-6 py-2 sm:py-4 text-${language === "ar" ? "right" : "left"} text-xs font-semibold hidden lg:table-cell`} style={{ color: colors.forest }}>
                    {t.createdAt}
                  </th>
                  <th className={`px-2 sm:px-6 py-2 sm:py-4 text-center text-xs font-semibold`} style={{ color: colors.forest }}>
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody style={{ borderColor: colors.border }}>
                {filteredUsers.length === 0 ? (
                  <tr>
                      <td colSpan="6" className="px-2 sm:px-6 py-6 sm:py-8 text-center" style={{ color: colors.muted }}>
                        {t.noUsers}
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr key={user.id} className="transition-all duration-200 hover:opacity-80" style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <td className="px-2 sm:px-6 py-2 sm:py-4">
                          <div className="flex items-center gap-2">
                          {user.photo ? (
                            <img 
                              src={
                                user.photo
                                  ? user.photo.startsWith("http")
                                    ? user.photo
                                    : `${API_URL}${user.photo}`
                                  : undefined
                              } 
                              alt="Profile" 
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2"
                              style={{ borderColor: colors.gold }}
                            />
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2" style={{ borderColor: colors.gold, background: colors.goldPale }}>
                              <User className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: colors.forest }} />
                            </div>
                          )}
                          <span className="font-medium text-xs sm:text-sm" style={{ color: colors.ink }}>
                            {getUserName(user)}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs hidden md:table-cell" style={{ color: colors.muted }}>
                        {user.email}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 hidden sm:table-cell">
                        <span className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            background: colors.goldPale, 
                            color: colors.forest 
                          }}>
                          {user.role === "admin" ? t.roles.admin : t.roles.user}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 hidden sm:table-cell">
                        {user.role !== "admin" && (
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{ 
                                background: colors.goldPale, 
                                color: colors.forest 
                              }}>
                              {user.is_accepted ? t.active : t.pending}
                            </span>
                            {user.is_accepted ? (
                              <button
                                onClick={() => setShowActivateConfirm({ id: user.id, is_accepted: true })}
                                className="p-1 rounded-lg transition-all duration-200 hover:scale-110"
                                style={{ color: colors.gold }}
                                title={t.deactivate}
                              >
                                <ToggleRight size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => setShowActivateConfirm({ id: user.id, is_accepted: false })}
                                className="p-1 rounded-lg transition-all duration-200 hover:scale-110"
                                style={{ color: colors.accent }}
                                title={t.activate}
                              >
                                <ToggleLeft size={16} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs hidden lg:table-cell" style={{ color: colors.muted }}>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4">
                          <div className="flex items-center justify-center gap-1">
                            {!user.is_accepted && user.role !== "admin" && (
                            <>
                              <button
                                onClick={() => setShowAcceptConfirm(user.id)}
                                className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
                                style={{ color: colors.accent }}
                                title={t.accept}
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => setShowRejectConfirm(user.id)}
                                className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
                                style={{ color: '#dc2626' }}
                                title={t.reject}
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
                            style={{ color: colors.gold }}
                            title={t.edit}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(user.id)}
                            className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
                            style={{ color: '#dc2626' }}
                            title={t.delete}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredUsers.length > 0 && (
            <div
              className={`flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-4 sm:px-6 py-3 sm:py-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}
              style={{ borderTop: `1px solid ${colors.border}` }}
            >
              <p className="text-xs sm:text-sm text-center sm:text-start" style={{ color: colors.muted }}>
                {t.pagination.showing(rangeFrom, rangeTo, filteredUsers.length)}
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
                  style={{ background: colors.bg, color: colors.ink, border: `1px solid ${colors.border}` }}
                  aria-label={t.pagination.previous}
                >
                  {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  <span className="hidden sm:inline">{t.pagination.previous}</span>
                </button>
                <span className="text-xs sm:text-sm font-medium px-2 min-w-[7rem] text-center" style={{ color: colors.ink }}>
                  {t.pagination.pageOf(currentPage, totalPages)}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
                  style={{ background: colors.bg, color: colors.ink, border: `1px solid ${colors.border}` }}
                  aria-label={t.pagination.next}
                >
                  <span className="hidden sm:inline">{t.pagination.next}</span>
                  {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-0 my-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="p-4 sm:p-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold" style={{ color: colors.ink }}>
                  {t.editUser}
                </h2>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                  style={{ color: colors.muted }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                    {t.firstName} (العربية)
                  </label>
                  <input
                    type="text"
                    value={editingUser.prenom_ar || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, prenom_ar: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base"
                    style={{ 
                      background: colors.bg, 
                      color: colors.ink, 
                      border: `1px solid ${colors.border}` 
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                    {t.lastName} (العربية)
                  </label>
                  <input
                    type="text"
                    value={editingUser.nom_ar || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, nom_ar: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base"
                    style={{ 
                      background: colors.bg, 
                      color: colors.ink, 
                      border: `1px solid ${colors.border}` 
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                    {t.firstName} (English)
                  </label>
                  <input
                    type="text"
                    value={editingUser.prenom_en || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, prenom_en: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base"
                    style={{ 
                      background: colors.bg, 
                      color: colors.ink, 
                      border: `1px solid ${colors.border}` 
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                    {t.lastName} (English)
                  </label>
                  <input
                    type="text"
                    value={editingUser.nom_en || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, nom_en: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base"
                    style={{ 
                      background: colors.bg, 
                      color: colors.ink, 
                      border: `1px solid ${colors.border}` 
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                    {t.firstName} (Français)
                  </label>
                  <input
                    type="text"
                    value={editingUser.prenom_fr || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, prenom_fr: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base"
                    style={{ 
                      background: colors.bg, 
                      color: colors.ink, 
                      border: `1px solid ${colors.border}` 
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                    {t.lastName} (Français)
                  </label>
                  <input
                    type="text"
                    value={editingUser.nom_fr || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, nom_fr: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base"
                    style={{ 
                      background: colors.bg, 
                      color: colors.ink, 
                      border: `1px solid ${colors.border}` 
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                  {t.email}
                </label>
                <input
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base"
                  style={{ 
                    background: colors.bg, 
                    color: colors.ink, 
                    border: `1px solid ${colors.border}` 
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                  {t.role}
                </label>
                <select
                  value={editingUser.role || "user"}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base"
                  style={{ 
                    background: colors.bg, 
                    color: colors.ink, 
                    border: `1px solid ${colors.border}` 
                  }}
                >
                  <option value="user">{t.roles.user}</option>
                  <option value="admin">{t.roles.admin}</option>
                </select>
              </div>
            </div>

            <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3" style={{ borderTop: `1px solid ${colors.border}` }}>
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base"
                style={{ 
                  background: colors.bg, 
                  color: colors.ink, 
                  border: `1px solid ${colors.border}` 
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base flex items-center gap-2"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
                  color: colors.forest,
                }}
              >
                <Check size={18} />
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="rounded-2xl w-full max-w-sm mx-2 sm:mx-0 my-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.15)' }}>
                <Trash2 className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#dc2626' }} />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: colors.ink }}>
                {t.delete}
              </h3>
              <p className="mb-4 sm:mb-6 text-sm sm:text-base" style={{ color: colors.muted }}>
                {t.confirmDelete}
              </p>
              <div className="flex justify-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base"
                  style={{ 
                    background: colors.bg, 
                    color: colors.ink, 
                    border: `1px solid ${colors.border}` 
                  }}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base"
                  style={{ background: '#dc2626', color: 'white' }}
                >
                  {t.delete}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept User Confirmation Modal */}
      {showAcceptConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="rounded-2xl w-full max-w-sm mx-2 sm:mx-0 my-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center" style={{ background: colors.goldPale }}>
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: colors.accent }} />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: colors.ink }}>
                {t.accept}
              </h3>
              <p className="mb-4 sm:mb-6 text-sm sm:text-base" style={{ color: colors.muted }}>
                {t.userAccepted}
              </p>
              <div className="flex justify-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowAcceptConfirm(null)}
                  className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base"
                  style={{ 
                    background: colors.bg, 
                    color: colors.ink, 
                    border: `1px solid ${colors.border}` 
                  }}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => handleAccept(showAcceptConfirm)}
                  className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
                    color: colors.forest,
                  }}
                >
                  {t.accept}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject User Confirmation Modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="rounded-2xl w-full max-w-sm mx-2 sm:mx-0 my-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.15)' }}>
                <XCircle className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#dc2626' }} />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: colors.ink }}>
                {t.reject}
              </h3>
              <p className="mb-4 sm:mb-6 text-sm sm:text-base" style={{ color: colors.muted }}>
                {t.userRejected}
              </p>
              <div className="flex justify-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowRejectConfirm(null)}
                  className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base"
                  style={{ 
                    background: colors.bg, 
                    color: colors.ink, 
                    border: `1px solid ${colors.border}` 
                  }}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => handleReject(showRejectConfirm)}
                  className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base"
                  style={{ background: '#dc2626', color: 'white' }}
                >
                  {t.reject}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activate/Deactivate User Confirmation Modal */}
      {showActivateConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="rounded-2xl w-full max-w-sm mx-2 sm:mx-0 my-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center" style={{ background: colors.goldPale }}>
                {showActivateConfirm.is_accepted ? (
                  <ToggleRight className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: colors.gold }} />
                ) : (
                  <ToggleLeft className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: colors.accent }} />
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: colors.ink }}>
                {showActivateConfirm.is_accepted ? t.deactivate : t.activate}
              </h3>
              <p className="mb-4 sm:mb-6 text-sm sm:text-base" style={{ color: colors.muted }}>
                {showActivateConfirm.is_accepted ? t.userDeactivated : t.userActivated}
              </p>
              <div className="flex justify-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowActivateConfirm(null)}
                  className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base"
                  style={{ 
                    background: colors.bg, 
                    color: colors.ink, 
                    border: `1px solid ${colors.border}` 
                  }}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => handleToggleActive(showActivateConfirm)}
                  className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base"
                  style={{ 
                    background: showActivateConfirm.is_accepted ? colors.gold : `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
                    color: colors.forest,
                  }}
                >
                  {showActivateConfirm.is_accepted ? t.deactivate : t.activate}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
      {usersContent}
    </Sidebar>
  );
}