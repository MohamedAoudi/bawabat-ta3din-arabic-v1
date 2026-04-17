import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import { getCurrentUser, isAdmin, refreshCurrentUser } from "../services/authService";
import Sidebar, { MobileHeader } from "../layouts/Sidebar";
import { User, Shield, Users, Edit, Trash2, X, Check, Search } from "lucide-react";

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
      editor: "محرر",
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
      editor: "Éditeur",
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
      editor: "Editor",
    },
  },
};

export default function UsersPage() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

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
      const response = await fetch("http://localhost:5000/api/users", {
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
      const response = await fetch(`http://localhost:5000/api/users/${editingUser.id}`, {
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
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
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

  const getUserName = (user) => {
    if (language === "ar") {
      return `${user.prenom_ar || ""} ${user.nom_ar || ""}`.trim();
    } else if (language === "fr") {
      return `${user.prenom_fr || ""} ${user.nom_fr || ""}`.trim();
    } else {
      return `${user.prenom_en || ""} ${user.nom_en || ""}`.trim();
    }
  };

  const filteredUsers = users.filter((user) => {
    const name = getUserName(user).toLowerCase();
    const email = user.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isUserAdmin) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        <div className="text-center">
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
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

      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            {t.users}
          </h1>
        </div>

        {/* Search */}
        <div className={`mb-6 ${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-xl p-4 shadow-sm`}>
          <div className="relative">
            <Search className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} size={20} />
            <input
              type="text"
              placeholder={`${t.search}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${language === "ar" ? "pr-10" : "pl-10"} py-3 rounded-lg border 
                ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}
                focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-sm overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <tr>
                  <th className={`px-6 py-4 text-${language === "ar" ? "right" : "left"} text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {t.profile}
                  </th>
                  <th className={`px-6 py-4 text-${language === "ar" ? "right" : "left"} text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {t.email}
                  </th>
                  <th className={`px-6 py-4 text-${language === "ar" ? "right" : "left"} text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {t.role}
                  </th>
                  <th className={`px-6 py-4 text-${language === "ar" ? "right" : "left"} text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {t.createdAt}
                  </th>
                  <th className={`px-6 py-4 text-center text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={`px-6 py-8 text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {t.noUsers}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className={`${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.photo ? (
                            <img src={user.photo} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? "bg-blue-900" : "bg-blue-100"}`}>
                              <User className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                            </div>
                          )}
                          <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                            {getUserName(user)}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium
                          ${user.role === "admin" 
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" 
                            : user.role === "editor"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          }`}>
                          {t.roles[user.role] || user.role}
                        </span>
                      </td>
                      <td className={`px-6 py-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-600 text-blue-400" : "hover:bg-blue-50 text-blue-600"}`}
                            title={t.edit}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(user.id)}
                            className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-600 text-red-400" : "hover:bg-red-50 text-red-600"}`}
                            title={t.delete}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  {t.editUser}
                </h2>
                <button
                  onClick={() => setEditingUser(null)}
                  className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {t.firstName} (العربية)
                  </label>
                  <input
                    type="text"
                    value={editingUser.prenom_ar || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, prenom_ar: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border 
                      ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}
                      focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {t.lastName} (العربية)
                  </label>
                  <input
                    type="text"
                    value={editingUser.nom_ar || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, nom_ar: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border 
                      ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}
                      focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {t.firstName} (English)
                  </label>
                  <input
                    type="text"
                    value={editingUser.prenom_en || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, prenom_en: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border 
                      ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}
                      focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {t.lastName} (English)
                  </label>
                  <input
                    type="text"
                    value={editingUser.nom_en || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, nom_en: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border 
                      ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}
                      focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {t.firstName} (Français)
                  </label>
                  <input
                    type="text"
                    value={editingUser.prenom_fr || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, prenom_fr: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border 
                      ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}
                      focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {t.lastName} (Français)
                  </label>
                  <input
                    type="text"
                    value={editingUser.nom_fr || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, nom_fr: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border 
                      ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}
                      focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {t.email}
                </label>
                <input
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border 
                    ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}
                    focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {t.role}
                </label>
                <select
                  value={editingUser.role || "user"}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border 
                    ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}
                    focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="user">{t.roles.user}</option>
                  <option value="editor">{t.roles.editor}</option>
                  <option value="admin">{t.roles.admin}</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className={`px-6 py-2 rounded-lg ${isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl w-full max-w-md p-6`}>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isDarkMode ? "bg-red-900" : "bg-red-100"}`}>
                <Trash2 className={`w-8 h-8 ${isDarkMode ? "text-red-400" : "text-red-600"}`} />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                {t.delete}
              </h3>
              <p className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {t.confirmDelete}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className={`px-6 py-2 rounded-lg ${isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                >
                  {t.delete}
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