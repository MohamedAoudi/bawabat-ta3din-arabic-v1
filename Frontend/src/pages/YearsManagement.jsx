import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar, { MobileHeader } from "../layouts/Sidebar";
import { LanguageContext, ThemeContext } from "../App";
import { getCurrentUser, refreshCurrentUser } from "../services/authService";
import { createYear, deleteYear, getYears, updateYear } from "../services/yearService";
import { Calendar, Check, Edit, Plus, Search, Trash2, X } from "lucide-react";

const TRANSLATIONS = {
  ar: {
    pageTitle: "إدارة السنوات",
    noAccess: "لا تملك صلاحيات الوصول لهذه الصفحة",
    search: "بحث",
    add: "إضافة",
    edit: "تعديل",
    delete: "حذف",
    cancel: "إلغاء",
    save: "حفظ",
    empty: "لا توجد بيانات",
    confirmDeleteTitle: "تأكيد الحذف",
    confirmDeleteBody: "هل أنت متأكد من حذف هذه السنة؟",
    columns: {
      year: "السنة",
      decade: "العقد",
      actions: "الإجراءات",
    },
    fields: {
      year: "السنة",
      decade: "العقد",
    },
  },
  fr: {
    pageTitle: "Gestion des années",
    noAccess: "Vous n'avez pas accès à cette page",
    search: "Rechercher",
    add: "Ajouter",
    edit: "Modifier",
    delete: "Supprimer",
    cancel: "Annuler",
    save: "Enregistrer",
    empty: "Aucune donnée",
    confirmDeleteTitle: "Confirmer la suppression",
    confirmDeleteBody: "Êtes-vous sûr de vouloir supprimer cette année ?",
    columns: {
      year: "Année",
      decade: "Décennie",
      actions: "Actions",
    },
    fields: {
      year: "Année",
      decade: "Décennie",
    },
  },
  en: {
    pageTitle: "Years management",
    noAccess: "You don't have access to this page",
    search: "Search",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    empty: "No data",
    confirmDeleteTitle: "Confirm delete",
    confirmDeleteBody: "Are you sure you want to delete this year?",
    columns: {
      year: "Year",
      decade: "Decade",
      actions: "Actions",
    },
    fields: {
      year: "Year",
      decade: "Decade",
    },
  },
};

export default function YearsManagementPage() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);
  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;
  const isRTL = language === "ar";

  const colors = isDarkMode
    ? {
        bg: "#071611",
        forest: "#efe8d4",
        gold: "#d3b468",
        goldLight: "#efdba2",
        goldPale: "#1a332d",
        ink: "#efe8d4",
        muted: "#b8b09d",
        border: "rgba(201,168,76,0.22)",
        cardBg: "#0d2b24",
      }
    : {
        bg: "#f5f3ef",
        forest: "#082721",
        gold: "#c9a84c",
        goldLight: "#e8d08a",
        goldPale: "#f7f0dc",
        ink: "#1a1510",
        muted: "#7a7060",
        border: "rgba(8,39,33,0.08)",
        cardBg: "#ffffff",
      };

  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ year: "", decade: "" });

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const loadUser = async () => {
      const u = getCurrentUser();
      if (!u) {
        navigate("/login");
        return;
      }
      const refreshed = await refreshCurrentUser();
      setCurrentUser(refreshed || u);
      setLoading(false);
    };
    loadUser();
  }, [navigate]);

  const fetchRows = async () => {
    const data = await getYears();
    setRows(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role !== "admin") return;
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.role]);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => String(r.year).toLowerCase().includes(q) || String(r.decade).toLowerCase().includes(q));
  }, [rows, searchTerm]);

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ year: "", decade: "" });
  };

  const openEdit = (r) => {
    setCreating(false);
    setEditing(r);
    setForm({ year: String(r.year ?? ""), decade: String(r.decade ?? "") });
  };

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
  };

  const onSave = async () => {
    const payloadYear = Number(form.year);
    const payloadDecade = Number(form.decade);
    if (!payloadYear || !payloadDecade) return;

    if (creating) {
      await createYear({ year: payloadYear, decade: payloadDecade });
    } else if (editing?.year) {
      await updateYear(editing.year, { decade: payloadDecade });
    }

    await fetchRows();
    closeModal();
  };

  const onDelete = async (r) => {
    await deleteYear(r.year);
    await fetchRows();
    setConfirmDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bg }}>
        <div className="animate-spin rounded-full h-12 w-12" style={{ borderBottom: `2px solid ${colors.gold}` }} />
      </div>
    );
  }

  if (!isAdmin) {
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

  const modalOpen = creating || !!editing;

  const content = (
    <>
      <MobileHeader onMenuClick={() => setSidebarOpen(true)} title={t.pageTitle} />
      <div className="p-4 sm:p-6 lg:p-8" style={{ background: colors.bg, minHeight: "100vh" }}>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <Calendar size={20} style={{ color: colors.gold }} />
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.ink }}>
              {t.pageTitle}
            </h1>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`, color: colors.forest }}
          >
            <Plus size={18} />
            <span className="text-sm font-semibold">{t.add}</span>
          </button>
        </div>

        <div className="mb-4 sm:mb-6 rounded-xl p-3 sm:p-4 shadow-sm" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
          <div className="relative">
            <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`} size={20} style={{ color: colors.muted }} />
            <input
              type="text"
              placeholder={`${t.search}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? "pr-10" : "pl-10"} py-3 rounded-lg border text-sm sm:text-base`}
              style={{ background: colors.bg, color: colors.ink, border: `1px solid ${colors.border}` }}
            />
          </div>
        </div>

        <div className="rounded-xl shadow-sm overflow-hidden" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[560px]">
              <thead style={{ background: colors.goldPale }}>
                <tr>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-${isRTL ? "right" : "left"} text-xs font-semibold`} style={{ color: colors.forest }}>
                    {t.columns.year}
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-${isRTL ? "right" : "left"} text-xs font-semibold`} style={{ color: colors.forest }}>
                    {t.columns.decade}
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold" style={{ color: colors.forest }}>
                    {t.columns.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 sm:px-6 py-8 text-center" style={{ color: colors.muted }}>
                      {t.empty}
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((r) => (
                    <tr key={r.year} className="transition-all duration-200 hover:opacity-90" style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold" style={{ color: colors.ink }}>
                        {r.year}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm" style={{ color: colors.muted }}>
                        {r.decade}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(r)} className="p-2 rounded-lg transition-all duration-200 hover:scale-110" style={{ color: colors.gold }} title={t.edit}>
                            <Edit size={16} />
                          </button>
                          <button onClick={() => setConfirmDelete(r)} className="p-2 rounded-lg transition-all duration-200 hover:scale-110" style={{ color: "#dc2626" }} title={t.delete}>
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
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="rounded-2xl w-full max-w-xl mx-2 sm:mx-0 my-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="p-4 sm:p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border}` }}>
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: colors.ink }}>
                {creating ? t.add : t.edit}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-lg transition-all duration-200 hover:scale-110" style={{ color: colors.muted }}>
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field
                label={t.fields.year}
                value={form.year}
                onChange={(v) => setForm((p) => ({ ...p, year: v }))}
                colors={colors}
                inputMode="numeric"
                disabled={!!editing}
              />
              <Field
                label={t.fields.decade}
                value={form.decade}
                onChange={(v) => setForm((p) => ({ ...p, decade: v }))}
                colors={colors}
                inputMode="numeric"
              />
            </div>
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3" style={{ borderTop: `1px solid ${colors.border}` }}>
              <button onClick={closeModal} className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base" style={{ background: colors.bg, color: colors.ink, border: `1px solid ${colors.border}` }}>
                {t.cancel}
              </button>
              <button
                onClick={onSave}
                className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
                  color: colors.forest,
                  opacity: form.year && form.decade ? 1 : 0.6,
                  pointerEvents: form.year && form.decade ? "auto" : "none",
                }}
              >
                <Check size={18} />
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="rounded-2xl w-full max-w-sm mx-2 sm:mx-0 my-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center" style={{ background: "rgba(220,38,38,0.15)" }}>
                <Trash2 className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: "#dc2626" }} />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: colors.ink }}>
                {t.confirmDeleteTitle}
              </h3>
              <p className="mb-4 sm:mb-6 text-sm sm:text-base" style={{ color: colors.muted }}>
                {t.confirmDeleteBody}
              </p>
              <div className="flex justify-center gap-2 sm:gap-3">
                <button onClick={() => setConfirmDelete(null)} className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base" style={{ background: colors.bg, color: colors.ink, border: `1px solid ${colors.border}` }}>
                  {t.cancel}
                </button>
                <button onClick={() => onDelete(confirmDelete)} className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base" style={{ background: "#dc2626", color: "white" }}>
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
      {content}
    </Sidebar>
  );
}

function Field({ label, value, onChange, colors, inputMode, disabled = false }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        inputMode={inputMode}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base"
        style={{ background: colors.bg, color: colors.ink, border: `1px solid ${colors.border}`, opacity: disabled ? 0.7 : 1 }}
      />
    </div>
  );
}

