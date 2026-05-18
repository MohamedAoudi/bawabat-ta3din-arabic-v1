import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext, ThemeContext } from "../App";
import Sidebar, { MobileHeader } from "../layouts/Sidebar";
import { getCurrentUser, refreshCurrentUser } from "../services/authService";
import { createMineral, deleteMineral, getMinerals, updateMineral } from "../services/mineralService";
import { Check, ChevronLeft, ChevronRight, Edit, Gem, Plus, Search, Trash2, X } from "lucide-react";

const PAGE_SIZE = 15;

const TRANSLATIONS = {
  ar: {
    pageTitle: "إدارة المعادن",
    noAccess: "لا تملك صلاحيات الوصول لهذه الصفحة",
    search: "بحث",
    add: "إضافة",
    edit: "تعديل",
    delete: "حذف",
    cancel: "إلغاء",
    save: "حفظ",
    confirmDeleteTitle: "تأكيد الحذف",
    confirmDeleteBody: "هل أنت متأكد من حذف هذا المعدن؟",
    empty: "لا توجد بيانات",
    fields: {
      name_ar: "الاسم (عربي)",
      name_en: "الاسم (English)",
      name_fr: "الاسم (Français)",
      category_name_ar: "الفئة (عربي)",
      category_name_en: "الفئة (English)",
      category_name_fr: "الفئة (Français)",
    },
    columns: {
      mineral: "المعدن",
      category: "الفئة",
      updatedAt: "آخر تحديث",
      actions: "الإجراءات",
    },
    pagination: {
      previous: "السابق",
      next: "التالي",
      pageOf: (page, total) => `صفحة ${page} من ${total}`,
      showing: (from, to, total) => `عرض ${from}–${to} من ${total}`,
    },
  },
  fr: {
    pageTitle: "Gestion des minéraux",
    noAccess: "Vous n'avez pas accès à cette page",
    search: "Rechercher",
    add: "Ajouter",
    edit: "Modifier",
    delete: "Supprimer",
    cancel: "Annuler",
    save: "Enregistrer",
    confirmDeleteTitle: "Confirmer la suppression",
    confirmDeleteBody: "Êtes-vous sûr de vouloir supprimer ce minéral ?",
    empty: "Aucune donnée",
    fields: {
      name_ar: "Nom (Arabe)",
      name_en: "Nom (English)",
      name_fr: "Nom (Français)",
      category_name_ar: "Catégorie (Arabe)",
      category_name_en: "Catégorie (English)",
      category_name_fr: "Catégorie (Français)",
    },
    columns: {
      mineral: "Minéral",
      category: "Catégorie",
      updatedAt: "Mis à jour",
      actions: "Actions",
    },
    pagination: {
      previous: "Précédent",
      next: "Suivant",
      pageOf: (page, total) => `Page ${page} sur ${total}`,
      showing: (from, to, total) => `Affichage ${from}–${to} sur ${total}`,
    },
  },
  en: {
    pageTitle: "Minerals management",
    noAccess: "You don't have access to this page",
    search: "Search",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    confirmDeleteTitle: "Confirm delete",
    confirmDeleteBody: "Are you sure you want to delete this mineral?",
    empty: "No data",
    fields: {
      name_ar: "Name (Arabic)",
      name_en: "Name (English)",
      name_fr: "Name (French)",
      category_name_ar: "Category (Arabic)",
      category_name_en: "Category (English)",
      category_name_fr: "Category (French)",
    },
    columns: {
      mineral: "Mineral",
      category: "Category",
      updatedAt: "Updated",
      actions: "Actions",
    },
    pagination: {
      previous: "Previous",
      next: "Next",
      pageOf: (page, total) => `Page ${page} of ${total}`,
      showing: (from, to, total) => `Showing ${from}–${to} of ${total}`,
    },
  },
};

const emptyForm = {
  name_ar: "",
  name_en: "",
  name_fr: "",
  category_name_ar: "",
  category_name_en: "",
  category_name_fr: "",
};

function safeDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function MineralsMobileRow({ m, language, colors, t, isRTL, onEdit, onDelete }) {
  const mineralLabel = language === "ar" ? m.name_ar || "-" : language === "fr" ? m.name_fr || "-" : m.name_en || "-";
  const categoryLabel =
    language === "ar" ? m.category_name_ar || "-" : language === "fr" ? m.category_name_fr || "-" : m.category_name_en || "-";
  const updated = safeDate(m.updated_at);

  return (
    <div
      className={`flex items-start gap-3 px-3 sm:px-4 py-3 ${isRTL ? "flex-row-reverse" : ""}`}
      style={{ borderBottom: `1px solid ${colors.border}` }}
    >
      <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center" style={{ background: colors.goldPale }}>
        <Gem size={16} style={{ color: colors.gold }} />
      </div>
      <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
        <div className="text-sm font-semibold break-words" style={{ color: colors.ink }}>
          {mineralLabel}
        </div>
        <div className="text-xs break-words mt-0.5" style={{ color: colors.muted }}>
          {m.name_en || m.name_fr || m.name_ar || "-"}
        </div>
        <div className="text-xs mt-1.5">
          <span style={{ color: colors.muted }}>{t.columns.category}: </span>
          <span style={{ color: colors.ink }}>{categoryLabel}</span>
        </div>
        <div className="text-xs mt-1" style={{ color: colors.muted }}>
          {t.columns.updatedAt}: {updated ? updated.toLocaleDateString() : "-"}
        </div>
      </div>
      <div className={`flex shrink-0 items-center gap-1 pt-0.5 ${isRTL ? "flex-row-reverse" : ""}`}>
        <button
          type="button"
          onClick={() => onEdit(m)}
          className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
          style={{ color: colors.gold }}
          title={t.edit}
        >
          <Edit size={16} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(m)}
          className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
          style={{ color: "#dc2626" }}
          title={t.delete}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function MineralsPage() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);

  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;
  const isRTL = language === "ar";

  const colors = isDarkMode
    ? {
        bg: "#071611",
        bgLight: "#0c2620",
        bgLighter: "#0a221c",
        forest: "#efe8d4",
        forestMid: "#d1c7ad",
        gold: "#d3b468",
        goldLight: "#efdba2",
        goldPale: "#1a332d",
        ink: "#efe8d4",
        muted: "#b8b09d",
        border: "rgba(201,168,76,0.22)",
        accent: "#7ee0c0",
        cardBg: "#0d2b24",
      }
    : {
        bg: "#f5f3ef",
        bgLight: "#ede9df",
        bgLighter: "#ffffff",
        forest: "#082721",
        forestMid: "#0d3d34",
        gold: "#c9a84c",
        goldLight: "#e8d08a",
        goldPale: "#f7f0dc",
        ink: "#1a1510",
        muted: "#7a7060",
        border: "rgba(8,39,33,0.08)",
        accent: "#0d3d34",
        cardBg: "#ffffff",
      };

  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [minerals, setMinerals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [editing, setEditing] = useState(null); // mineral row
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(null); // mineral row

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

  const fetchMinerals = async () => {
    const rows = await getMinerals();
    setMinerals(Array.isArray(rows) ? rows : []);
  };

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role !== "admin") return;
    fetchMinerals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.role]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return minerals;
    return minerals.filter((m) => {
      const hay = [
        m.name_ar,
        m.name_en,
        m.name_fr,
        m.category_name_ar,
        m.category_name_en,
        m.category_name_fr,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [minerals, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const rangeFrom = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeTo = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(emptyForm);
  };

  const openEdit = (row) => {
    setEditing(row);
    setCreating(false);
    setForm({
      name_ar: row.name_ar || "",
      name_en: row.name_en || "",
      name_fr: row.name_fr || "",
      category_name_ar: row.category_name_ar || "",
      category_name_en: row.category_name_en || "",
      category_name_fr: row.category_name_fr || "",
    });
  };

  const closeModal = () => {
    setEditing(null);
    setCreating(false);
    setForm(emptyForm);
  };

  const onSave = async () => {
    const payload = {
      name_ar: form.name_ar?.trim(),
      name_en: form.name_en?.trim(),
      name_fr: form.name_fr?.trim(),
      category_name_ar: form.category_name_ar?.trim() || null,
      category_name_en: form.category_name_en?.trim() || null,
      category_name_fr: form.category_name_fr?.trim() || null,
    };

    if (!payload.name_ar || !payload.name_en || !payload.name_fr) return;

    if (creating) {
      await createMineral(payload);
    } else if (editing?.id) {
      await updateMineral(editing.id, payload);
    }
    await fetchMinerals();
    closeModal();
  };

  const onDelete = async (row) => {
    if (!row?.id) return;
    await deleteMineral(row.id);
    await fetchMinerals();
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

  const pageContent = (
    <>
      <MobileHeader onMenuClick={() => setSidebarOpen(true)} title={t.pageTitle} />

      <div className="p-4 sm:p-6 lg:p-8" style={{ background: colors.bg, minHeight: "100vh" }}>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <Gem size={20} style={{ color: colors.gold }} />
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.ink }}>
              {t.pageTitle}
            </h1>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
              color: colors.forest,
            }}
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full ${isRTL ? "pr-10" : "pl-10"} py-3 rounded-lg border text-sm sm:text-base`}
              style={{ background: colors.bg, color: colors.ink, border: `1px solid ${colors.border}` }}
            />
          </div>
        </div>

        <div className="rounded-xl shadow-sm overflow-hidden" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
          {filtered.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 text-center text-sm" style={{ color: colors.muted }}>
              {t.empty}
            </div>
          ) : (
            <>
              <div className="md:hidden">
                {paginatedRows.map((m) => (
                  <MineralsMobileRow
                    key={m.id}
                    m={m}
                    language={language}
                    colors={colors}
                    t={t}
                    isRTL={isRTL}
                    onEdit={openEdit}
                    onDelete={setConfirmDelete}
                  />
                ))}
              </div>
              <div className="hidden md:block overflow-x-auto scrollbar-thin overscroll-x-contain">
                <table className="w-full min-w-[640px]">
                  <thead style={{ background: colors.goldPale }}>
                    <tr>
                      <th className={`px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.forest }}>
                        {t.columns.mineral}
                      </th>
                      <th className={`px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.forest }}>
                        {t.columns.category}
                      </th>
                      <th className={`px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold hidden lg:table-cell ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.forest }}>
                        {t.columns.updatedAt}
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold" style={{ color: colors.forest }}>
                        {t.columns.actions}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedRows.map((m) => {
                      const mineralLabel =
                        language === "ar" ? m.name_ar || "-" : language === "fr" ? m.name_fr || "-" : m.name_en || "-";
                      const categoryLabel =
                        language === "ar"
                          ? m.category_name_ar || "-"
                          : language === "fr"
                            ? m.category_name_fr || "-"
                            : m.category_name_en || "-";
                      const updated = safeDate(m.updated_at);
                      return (
                        <tr key={m.id} className="transition-all duration-200 hover:opacity-90" style={{ borderBottom: `1px solid ${colors.border}` }}>
                          <td className={`px-4 sm:px-6 py-3 sm:py-4 ${isRTL ? "text-right" : "text-left"}`}>
                            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                              <div className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center" style={{ background: colors.goldPale }}>
                                <Gem size={16} style={{ color: colors.gold }} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold break-words" style={{ color: colors.ink }}>
                                  {mineralLabel}
                                </div>
                                <div className="text-xs break-words" style={{ color: colors.muted }}>
                                  {m.name_en || m.name_fr || m.name_ar || "-"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm break-words max-w-[200px] ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.muted }}>
                            {categoryLabel}
                          </td>
                          <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm hidden lg:table-cell ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.muted }}>
                            {updated ? updated.toLocaleDateString() : "-"}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openEdit(m)}
                                className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                                style={{ color: colors.gold }}
                                title={t.edit}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => setConfirmDelete(m)}
                                className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                                style={{ color: "#dc2626" }}
                                title={t.delete}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {filtered.length > 0 && (
            <div
              className={`flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-4 sm:px-6 py-3 sm:py-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}
              style={{ borderTop: `1px solid ${colors.border}` }}
            >
              <p className="text-xs sm:text-sm text-center sm:text-start" style={{ color: colors.muted }}>
                {t.pagination.showing(rangeFrom, rangeTo, filtered.length)}
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

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="rounded-2xl w-full max-w-3xl mx-2 sm:mx-0 my-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="p-4 sm:p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border}` }}>
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: colors.ink }}>
                {creating ? t.add : t.edit}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                style={{ color: colors.muted }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Field
                  label={t.fields.name_ar}
                  value={form.name_ar}
                  onChange={(v) => setForm((p) => ({ ...p, name_ar: v }))}
                  colors={colors}
                />
                <Field
                  label={t.fields.name_en}
                  value={form.name_en}
                  onChange={(v) => setForm((p) => ({ ...p, name_en: v }))}
                  colors={colors}
                />
                <Field
                  label={t.fields.name_fr}
                  value={form.name_fr}
                  onChange={(v) => setForm((p) => ({ ...p, name_fr: v }))}
                  colors={colors}
                />
                <div className="hidden sm:block" />
                <Field
                  label={t.fields.category_name_ar}
                  value={form.category_name_ar}
                  onChange={(v) => setForm((p) => ({ ...p, category_name_ar: v }))}
                  colors={colors}
                />
                <Field
                  label={t.fields.category_name_en}
                  value={form.category_name_en}
                  onChange={(v) => setForm((p) => ({ ...p, category_name_en: v }))}
                  colors={colors}
                />
                <Field
                  label={t.fields.category_name_fr}
                  value={form.category_name_fr}
                  onChange={(v) => setForm((p) => ({ ...p, category_name_fr: v }))}
                  colors={colors}
                />
              </div>
            </div>

            <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3" style={{ borderTop: `1px solid ${colors.border}` }}>
              <button
                onClick={closeModal}
                className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base"
                style={{ background: colors.bg, color: colors.ink, border: `1px solid ${colors.border}` }}
              >
                {t.cancel}
              </button>
              <button
                onClick={onSave}
                className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
                  color: colors.forest,
                  opacity: form.name_ar.trim() && form.name_en.trim() && form.name_fr.trim() ? 1 : 0.6,
                  pointerEvents: form.name_ar.trim() && form.name_en.trim() && form.name_fr.trim() ? "auto" : "none",
                }}
              >
                <Check size={18} />
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
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
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base"
                  style={{ background: colors.bg, color: colors.ink, border: `1px solid ${colors.border}` }}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => onDelete(confirmDelete)}
                  className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base"
                  style={{ background: "#dc2626", color: "white" }}
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
      {pageContent}
    </Sidebar>
  );
}

function Field({ label, value, onChange, colors }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base"
        style={{ background: colors.bg, color: colors.ink, border: `1px solid ${colors.border}` }}
      />
    </div>
  );
}

