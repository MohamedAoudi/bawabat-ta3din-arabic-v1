import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Download, Edit, Factory, FileSpreadsheet, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { LanguageContext, ThemeContext } from "../App";
import Sidebar, { MobileHeader } from "../layouts/Sidebar";
import { getCurrentUser, refreshCurrentUser } from "../services/authService";
import { getMineralProduction } from "../services/mineralProductionService";
import {
  createWorldProduction,
  deleteWorldProduction,
  getAllWorldProductions,
  updateWorldProduction,
} from "../services/worldProductionService";
import {
  dedupeWorldProductionPayloads,
  exportWorldProductionExcel,
  exportWorldProductionTemplateExcel,
  findMatchingWorldProduction,
  parseWorldProductionExcelFile,
} from "../utils/worldProductionExcel";

const PAGE_SIZE = 15;

const TRANSLATIONS = {
  ar: {
    pageTitle: "إدارة الإنتاج العالمي",
    noAccess: "لا تملك صلاحيات الوصول لهذه الصفحة",
    search: "بحث",
    add: "إضافة",
    downloadExcel: "تصدير Excel",
    importExcel: "استيراد Excel",
    downloadTemplate: "نموذج Excel",
    importing: "جاري الاستيراد...",
    importSuccess: (n) => `تم استيراد ${n} سجل بنجاح`,
    importPartial: (ok, fail) => `تم استيراد ${ok}، فشل ${fail}`,
    importDuplicateHint: "السجلات الموجودة (نفس المعدن/السنة) تم تحديثها تلقائياً",
    importNoRows: "لا توجد صفوف صالحة في الملف",
    importFileError: "تعذر قراءة ملف Excel",
    edit: "تعديل",
    delete: "حذف",
    cancel: "إلغاء",
    save: "حفظ",
    empty: "لا توجد بيانات",
    confirmDeleteTitle: "تأكيد الحذف",
    confirmDeleteBody: "هل أنت متأكد من حذف سجل الإنتاج العالمي؟",
    columns: {
      mineral: "المعدن",
      year: "السنة",
      value: "الإنتاج",
      baseValue: "الإنتاج المعياري",
      unit: "الوحدة",
      updatedAt: "آخر تحديث",
      actions: "الإجراءات",
    },
    fields: {
      mineral_production_id: "المعدن",
      year: "السنة",
      production_value: "قيمة الإنتاج",
      production_value_base: "القيمة المعيارية",
      unit_ar: "الوحدة (عربي)",
      unit_fr: "الوحدة (Français)",
      unit_en: "الوحدة (English)",
    },
    excelFields: {
      mineral_hs: "رمز HS للمعدن",
      year: "السنة",
      production_value: "قيمة الإنتاج",
      production_value_base: "القيمة المعيارية",
      unit_ar: "الوحدة (عربي)",
      unit_fr: "الوحدة (Français)",
      unit_en: "الوحدة (English)",
    },
    pagination: {
      previous: "السابق",
      next: "التالي",
      pageOf: (page, total) => `صفحة ${page} من ${total}`,
      showing: (from, to, total) => `عرض ${from}-${to} من ${total}`,
    },
  },
  fr: {
    pageTitle: "Gestion de la production mondiale",
    noAccess: "Vous n'avez pas accès à cette page",
    search: "Rechercher",
    add: "Ajouter",
    downloadExcel: "Exporter Excel",
    importExcel: "Importer Excel",
    downloadTemplate: "Modèle Excel",
    importing: "Importation...",
    importSuccess: (n) => `${n} enregistrement(s) importé(s) avec succès`,
    importPartial: (ok, fail) => `${ok} importé(s), ${fail} échec(s)`,
    importDuplicateHint: "Les enregistrements existants (même minéral/année) ont été mis à jour",
    importNoRows: "Aucune ligne valide dans le fichier",
    importFileError: "Impossible de lire le fichier Excel",
    edit: "Modifier",
    delete: "Supprimer",
    cancel: "Annuler",
    save: "Enregistrer",
    empty: "Aucune donnée",
    confirmDeleteTitle: "Confirmer la suppression",
    confirmDeleteBody: "Êtes-vous sûr de vouloir supprimer cet enregistrement mondial ?",
    columns: {
      mineral: "Minéral",
      year: "Année",
      value: "Production",
      baseValue: "Production normalisée",
      unit: "Unité",
      updatedAt: "Mis à jour",
      actions: "Actions",
    },
    fields: {
      mineral_production_id: "Minéral",
      year: "Année",
      production_value: "Valeur de production",
      production_value_base: "Valeur normalisée",
      unit_ar: "Unité (Arabe)",
      unit_fr: "Unité (Français)",
      unit_en: "Unité (English)",
    },
    excelFields: {
      mineral_hs: "Code HS du minéral",
      year: "Année",
      production_value: "Valeur de production",
      production_value_base: "Valeur normalisée",
      unit_ar: "Unité (Arabe)",
      unit_fr: "Unité (Français)",
      unit_en: "Unité (English)",
    },
    pagination: {
      previous: "Précédent",
      next: "Suivant",
      pageOf: (page, total) => `Page ${page} sur ${total}`,
      showing: (from, to, total) => `Affichage ${from}-${to} sur ${total}`,
    },
  },
  en: {
    pageTitle: "World production management",
    noAccess: "You don't have access to this page",
    search: "Search",
    add: "Add",
    downloadExcel: "Export Excel",
    importExcel: "Import Excel",
    downloadTemplate: "Excel template",
    importing: "Importing...",
    importSuccess: (n) => `${n} record(s) imported successfully`,
    importPartial: (ok, fail) => `${ok} imported, ${fail} failed`,
    importDuplicateHint: "Existing records (same mineral/year) were updated automatically",
    importNoRows: "No valid rows in the file",
    importFileError: "Could not read Excel file",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    empty: "No data",
    confirmDeleteTitle: "Confirm delete",
    confirmDeleteBody: "Are you sure you want to delete this world production record?",
    columns: {
      mineral: "Mineral",
      year: "Year",
      value: "Production",
      baseValue: "Base production",
      unit: "Unit",
      updatedAt: "Updated",
      actions: "Actions",
    },
    fields: {
      mineral_production_id: "Mineral",
      year: "Year",
      production_value: "Production value",
      production_value_base: "Base value",
      unit_ar: "Unit (Arabic)",
      unit_fr: "Unit (French)",
      unit_en: "Unit (English)",
    },
    excelFields: {
      mineral_hs: "Mineral HS code",
      year: "Year",
      production_value: "Production value",
      production_value_base: "Base value",
      unit_ar: "Unit (Arabic)",
      unit_fr: "Unit (French)",
      unit_en: "Unit (English)",
    },
    pagination: {
      previous: "Previous",
      next: "Next",
      pageOf: (page, total) => `Page ${page} of ${total}`,
      showing: (from, to, total) => `Showing ${from}-${to} of ${total}`,
    },
  },
};

const emptyForm = {
  mineral_production_id: "",
  year: "",
  production_value: "",
  production_value_base: "",
  unit_ar: "",
  unit_fr: "",
  unit_en: "",
};

function safeDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toNullableNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export default function WorldProductionManagementPage() {
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
  const [minerals, setMinerals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState(null);
  const fileInputRef = useRef(null);

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

  const fetchAll = async () => {
    const [productionRows, mineralRows] = await Promise.all([getAllWorldProductions(), getMineralProduction()]);
    setRows(Array.isArray(productionRows) ? productionRows : []);
    setMinerals(Array.isArray(mineralRows) ? mineralRows : []);
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.role]);

  const mineralLabel = (id) => {
    const mineral = minerals.find((m) => String(m.id) === String(id));
    if (!mineral) return "-";
    if (language === "ar") return mineral.mineral_name_ar || mineral.name_ar || "-";
    if (language === "fr") return mineral.mineral_name_fr || mineral.name_fr || "-";
    return mineral.mineral_name_en || mineral.name_en || "-";
  };

  const unitLabel = (row) => {
    if (language === "ar") return row.unit_ar || row.unit_en || row.unit_fr || "-";
    if (language === "fr") return row.unit_fr || row.unit_en || row.unit_ar || "-";
    return row.unit_en || row.unit_fr || row.unit_ar || "-";
  };

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [
        mineralLabel(row.mineral_production_id),
        row.year,
        row.production_value,
        row.production_value_base,
        row.unit_ar,
        row.unit_fr,
        row.unit_en,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, searchTerm, language, minerals]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  const rangeFrom = filteredRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeTo = Math.min(currentPage * PAGE_SIZE, filteredRows.length);

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(emptyForm);
  };

  const openEdit = (row) => {
    setCreating(false);
    setEditing(row);
    setForm({
      mineral_production_id: row.mineral_production_id ?? "",
      year: row.year ?? "",
      production_value: row.production_value ?? "",
      production_value_base: row.production_value_base ?? "",
      unit_ar: row.unit_ar ?? "",
      unit_fr: row.unit_fr ?? "",
      unit_en: row.unit_en ?? "",
    });
  };

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const onSave = async () => {
    const payload = {
      mineral_production_id: Number(form.mineral_production_id),
      year: Number(form.year),
      production_value: toNullableNumber(form.production_value),
      production_value_base: toNullableNumber(form.production_value_base),
      unit_ar: form.unit_ar.trim() || null,
      unit_fr: form.unit_fr.trim() || null,
      unit_en: form.unit_en.trim() || null,
    };

    if (!payload.mineral_production_id || !payload.year) return;

    if (creating) await createWorldProduction(payload);
    else if (editing?.id) await updateWorldProduction(editing.id, payload);

    await fetchAll();
    closeModal();
  };

  const onDelete = async (row) => {
    if (!row?.id) return;
    await deleteWorldProduction(row.id);
    await fetchAll();
    setConfirmDelete(null);
  };

  const handleDownloadExcel = () => {
    exportWorldProductionExcel(rows, minerals, t);
  };

  const handleDownloadTemplate = () => {
    exportWorldProductionTemplateExcel(t, minerals);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImporting(true);
    setImportMessage(null);
    try {
      const payloads = await parseWorldProductionExcelFile(file, minerals, t);
      if (!payloads.length) {
        setImportMessage({ type: "error", text: t.importNoRows });
        return;
      }

      const uniquePayloads = dedupeWorldProductionPayloads(payloads);
      let ok = 0;
      let fail = 0;
      let updated = 0;
      let workingRows = [...rows];

      for (const payload of uniquePayloads) {
        const existing = findMatchingWorldProduction(workingRows, payload);
        try {
          if (existing?.id) {
            const saved = await updateWorldProduction(existing.id, payload);
            workingRows = workingRows.map((row) => (row.id === existing.id ? { ...row, ...saved } : row));
            updated += 1;
          } else {
            const saved = await createWorldProduction(payload);
            workingRows.push(saved);
          }
          ok += 1;
        } catch {
          fail += 1;
        }
      }

      await fetchAll();
      if (fail === 0) {
        const hint = updated > 0 ? ` (${t.importDuplicateHint})` : "";
        setImportMessage({ type: "success", text: `${t.importSuccess(ok)}${hint}` });
      } else {
        setImportMessage({ type: "warning", text: t.importPartial(ok, fail) });
      }
    } catch {
      setImportMessage({ type: "error", text: t.importFileError });
    } finally {
      setImporting(false);
    }
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
        <h2 className="text-xl font-bold" style={{ color: colors.ink }}>
          {t.noAccess}
        </h2>
      </div>
    );
  }

  const modalOpen = creating || !!editing;

  return (
    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
      <>
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} title={t.pageTitle} />
        <div className="p-4 sm:p-6 lg:p-8" style={{ background: colors.bg, minHeight: "100vh" }}>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Factory size={20} style={{ color: colors.gold }} />
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.ink }}>
                {t.pageTitle}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadExcel}
                className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                style={{ background: colors.cardBg, color: colors.ink, border: `1px solid ${colors.border}` }}
              >
                <Download size={18} style={{ color: colors.gold }} />
                <span className="text-sm font-semibold">{t.downloadExcel}</span>
              </button>
              <button
                type="button"
                onClick={handleImportClick}
                disabled={importing}
                className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: colors.cardBg, color: colors.ink, border: `1px solid ${colors.border}` }}
              >
                <Upload size={18} style={{ color: colors.gold }} />
                <span className="text-sm font-semibold">{importing ? t.importing : t.importExcel}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                style={{ background: colors.cardBg, color: colors.ink, border: `1px solid ${colors.border}` }}
              >
                <FileSpreadsheet size={18} style={{ color: colors.gold }} />
                <span className="text-sm font-semibold">{t.downloadTemplate}</span>
              </button>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`, color: colors.forest }}
              >
                <Plus size={18} />
                <span className="text-sm font-semibold">{t.add}</span>
              </button>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportFile} />
            </div>
          </div>

          {importMessage && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                background:
                  importMessage.type === "success"
                    ? "rgba(34,197,94,0.12)"
                    : importMessage.type === "warning"
                      ? "rgba(234,179,8,0.12)"
                      : "rgba(220,38,38,0.12)",
                color:
                  importMessage.type === "success" ? "#16a34a" : importMessage.type === "warning" ? "#ca8a04" : "#dc2626",
                border: `1px solid ${colors.border}`,
              }}
            >
              {importMessage.text}
            </div>
          )}

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
            {filteredRows.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 text-center text-sm" style={{ color: colors.muted }}>
                {t.empty}
              </div>
            ) : (
              <>
                <div className="md:hidden">
                  {paginatedRows.map((row) => (
                    <MobileRow
                      key={row.id}
                      row={row}
                      mineralName={mineralLabel(row.mineral_production_id)}
                      unitName={unitLabel(row)}
                      colors={colors}
                      t={t}
                      isRTL={isRTL}
                      onEdit={openEdit}
                      onDelete={setConfirmDelete}
                    />
                  ))}
                </div>
                <div className="hidden md:block overflow-x-auto scrollbar-thin overscroll-x-contain">
                  <table className="w-full min-w-[960px]">
                    <thead style={{ background: colors.goldPale }}>
                      <tr>
                        {[t.columns.mineral, t.columns.year, t.columns.value, t.columns.baseValue, t.columns.unit, t.columns.updatedAt].map((header) => (
                          <th key={header} className={`px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.forest }}>
                            {header}
                          </th>
                        ))}
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold" style={{ color: colors.forest }}>
                          {t.columns.actions}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.map((row) => {
                        const updated = safeDate(row.updated_at);
                        return (
                          <tr key={row.id} className="transition-all duration-200 hover:opacity-90" style={{ borderBottom: `1px solid ${colors.border}` }}>
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold break-words max-w-[220px] ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.ink }}>
                              {mineralLabel(row.mineral_production_id)}
                            </td>
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm tabular-nums ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.muted }}>
                              {row.year}
                            </td>
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm font-mono break-all ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.ink }}>
                              {row.production_value ?? "-"}
                            </td>
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm font-mono break-all ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.muted }}>
                              {row.production_value_base ?? "-"}
                            </td>
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm break-words ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.muted }}>
                              {unitLabel(row)}
                            </td>
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.muted }}>
                              {updated ? updated.toLocaleDateString() : "-"}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <div className="flex items-center justify-center gap-1">
                                <IconButton title={t.edit} color={colors.gold} onClick={() => openEdit(row)} icon={<Edit size={16} />} />
                                <IconButton title={t.delete} color="#dc2626" onClick={() => setConfirmDelete(row)} icon={<Trash2 size={16} />} />
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

            {filteredRows.length > 0 && (
              <div className={`flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-4 sm:px-6 py-3 sm:py-4 ${isRTL ? "sm:flex-row-reverse" : ""}`} style={{ borderTop: `1px solid ${colors.border}` }}>
                <p className="text-xs sm:text-sm text-center sm:text-start" style={{ color: colors.muted }}>
                  {t.pagination.showing(rangeFrom, rangeTo, filteredRows.length)}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <PaginationButton disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} colors={colors} label={t.pagination.previous}>
                    {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    <span className="hidden sm:inline">{t.pagination.previous}</span>
                  </PaginationButton>
                  <span className="text-xs sm:text-sm font-medium px-2 min-w-[7rem] text-center" style={{ color: colors.ink }}>
                    {t.pagination.pageOf(currentPage, totalPages)}
                  </span>
                  <PaginationButton disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} colors={colors} label={t.pagination.next}>
                    <span className="hidden sm:inline">{t.pagination.next}</span>
                    {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </PaginationButton>
                </div>
              </div>
            )}
          </div>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
            <div className="rounded-2xl w-full max-w-4xl mx-2 sm:mx-0 my-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div className="p-4 sm:p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border}` }}>
                <h2 className="text-lg sm:text-xl font-bold" style={{ color: colors.ink }}>
                  {creating ? t.add : t.edit}
                </h2>
                <button onClick={closeModal} className="p-2 rounded-lg transition-all duration-200 hover:scale-110" style={{ color: colors.muted }}>
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <SelectField
                  label={t.fields.mineral_production_id}
                  value={String(form.mineral_production_id)}
                  onChange={(v) => setForm((p) => ({ ...p, mineral_production_id: v }))}
                  options={minerals.map((mineral) => ({
                    value: String(mineral.id),
                    label:
                      language === "ar"
                        ? mineral.mineral_name_ar || mineral.name_ar || "-"
                        : language === "fr"
                          ? mineral.mineral_name_fr || mineral.name_fr || "-"
                          : mineral.mineral_name_en || mineral.name_en || "-",
                  }))}
                  colors={colors}
                />
                <TextField label={t.fields.year} value={String(form.year)} onChange={(v) => setForm((p) => ({ ...p, year: v }))} colors={colors} inputMode="numeric" />
                <TextField label={t.fields.production_value} value={String(form.production_value)} onChange={(v) => setForm((p) => ({ ...p, production_value: v }))} colors={colors} inputMode="decimal" />
                <TextField label={t.fields.production_value_base} value={String(form.production_value_base)} onChange={(v) => setForm((p) => ({ ...p, production_value_base: v }))} colors={colors} inputMode="decimal" />
                <TextField label={t.fields.unit_ar} value={String(form.unit_ar)} onChange={(v) => setForm((p) => ({ ...p, unit_ar: v }))} colors={colors} />
                <TextField label={t.fields.unit_fr} value={String(form.unit_fr)} onChange={(v) => setForm((p) => ({ ...p, unit_fr: v }))} colors={colors} />
                <TextField label={t.fields.unit_en} value={String(form.unit_en)} onChange={(v) => setForm((p) => ({ ...p, unit_en: v }))} colors={colors} />
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
                    opacity: form.mineral_production_id && form.year ? 1 : 0.6,
                    pointerEvents: form.mineral_production_id && form.year ? "auto" : "none",
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
    </Sidebar>
  );
}

function MobileRow({ row, mineralName, unitName, colors, t, isRTL, onEdit, onDelete }) {
  const updated = safeDate(row.updated_at);
  return (
    <div className={`flex items-start gap-3 px-3 sm:px-4 py-3 ${isRTL ? "flex-row-reverse" : ""}`} style={{ borderBottom: `1px solid ${colors.border}` }}>
      <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center" style={{ background: colors.goldPale }}>
        <Factory size={16} style={{ color: colors.gold }} />
      </div>
      <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
        <div className="text-sm font-semibold break-words" style={{ color: colors.ink }}>
          {mineralName}
        </div>
        <div className="text-xs mt-1" style={{ color: colors.muted }}>
          {t.columns.year}: <span style={{ color: colors.ink }}>{row.year}</span>
        </div>
        <div className="text-xs mt-1 font-mono break-all">
          <span style={{ color: colors.muted }}>{t.columns.value}: </span>
          <span style={{ color: colors.ink }}>{row.production_value ?? "-"}</span>
        </div>
        <div className="text-xs mt-1 break-words">
          <span style={{ color: colors.muted }}>{t.columns.unit}: </span>
          <span style={{ color: colors.ink }}>{unitName}</span>
        </div>
        <div className="text-xs mt-1" style={{ color: colors.muted }}>
          {t.columns.updatedAt}: {updated ? updated.toLocaleDateString() : "-"}
        </div>
      </div>
      <div className={`flex shrink-0 items-center gap-1 pt-0.5 ${isRTL ? "flex-row-reverse" : ""}`}>
        <IconButton title={t.edit} color={colors.gold} onClick={() => onEdit(row)} icon={<Edit size={16} />} />
        <IconButton title={t.delete} color="#dc2626" onClick={() => onDelete(row)} icon={<Trash2 size={16} />} />
      </div>
    </div>
  );
}

function IconButton({ title, color, onClick, icon }) {
  return (
    <button type="button" onClick={onClick} className="p-2 rounded-lg transition-all duration-200 hover:scale-110" style={{ color }} title={title}>
      {icon}
    </button>
  );
}

function PaginationButton({ disabled, onClick, colors, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
      style={{ background: colors.bg, color: colors.ink, border: `1px solid ${colors.border}` }}
      aria-label={label}
    >
      {children}
    </button>
  );
}

function TextField({ label, value, onChange, colors, inputMode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base"
        style={{ background: colors.bg, color: colors.ink, border: `1px solid ${colors.border}` }}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, colors }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base"
        style={{ background: colors.bg, color: colors.ink, border: `1px solid ${colors.border}` }}
      >
        <option value="">-</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
