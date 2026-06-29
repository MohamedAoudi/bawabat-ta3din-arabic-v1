import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar, { MobileHeader } from "../layouts/Sidebar";
import { LanguageContext, ThemeContext } from "../App";
import { getCurrentUser, refreshCurrentUser } from "../services/authService";
// Services removed — local stubs to avoid external service usage in pages
const createTradeTransaction = async () => null;
const deleteTradeTransaction = async () => null;
const getTradeTransactions = async () => [];
const updateTradeTransaction = async () => null;
const getCountries = async () => [];
const getMinerals = async () => [];
const getYears = async () => [];
import {
  dedupeTradeTransactionPayloads,
  exportTradeTransactionExcel,
  exportTradeTransactionTemplateExcel,
  findMatchingTradeTransaction,
  normalizeTradeTransactionPayload,
  parseTradeTransactionExcelFile,
} from "../utils/tradeTransactionExcel";
import { Check, ChevronLeft, ChevronRight, Download, Edit, FileSpreadsheet, Plus, Search, Trash2, Upload, X } from "lucide-react";

const PAGE_SIZE = 15;

const TRANSLATIONS = {
  ar: {
    pageTitle: "إدارة الواردات",
    noAccess: "لا تملك صلاحيات الوصول لهذه الصفحة",
    search: "بحث",
    add: "إضافة",
    edit: "تعديل",
    delete: "حذف",
    cancel: "إلغاء",
    save: "حفظ",
    empty: "لا توجد بيانات",
    confirmDeleteTitle: "تأكيد الحذف",
    confirmDeleteBody: "هل أنت متأكد من حذف هذا السجل؟",
    columns: {
      country: "الدولة",
      mineral: "المعدن",
      year: "السنة",
      value: "القيمة (USD)",
      updatedAt: "آخر تحديث",
      actions: "الإجراءات",
    },
    fields: {
      country_id: "الدولة",
      mineral_id: "المعدن",
      year: "السنة",
      trade_value_usd: "القيمة بالدولار",
    },
    pagination: {
      previous: "السابق",
      next: "التالي",
      pageOf: (page, total) => `صفحة ${page} من ${total}`,
      showing: (from, to, total) => `عرض ${from}–${to} من ${total}`,
    },
  },
  fr: {
    pageTitle: "Gestion des importations",
    noAccess: "Vous n'avez pas accès à cette page",
    search: "Rechercher",
    add: "Ajouter",
    edit: "Modifier",
    delete: "Supprimer",
    cancel: "Annuler",
    save: "Enregistrer",
    empty: "Aucune donnée",
    confirmDeleteTitle: "Confirmer la suppression",
    confirmDeleteBody: "Êtes-vous sûr de vouloir supprimer cet enregistrement ?",
    columns: {
      country: "Pays",
      mineral: "Minéral",
      year: "Année",
      value: "Valeur (USD)",
      updatedAt: "Mis à jour",
      actions: "Actions",
    },
    fields: {
      country_id: "Pays",
      mineral_id: "Minéral",
      year: "Année",
      trade_value_usd: "Valeur (USD)",
    },
    pagination: {
      previous: "Précédent",
      next: "Suivant",
      pageOf: (page, total) => `Page ${page} sur ${total}`,
      showing: (from, to, total) => `Affichage ${from}–${to} sur ${total}`,
    },
  },
  en: {
    pageTitle: "Imports management",
    noAccess: "You don't have access to this page",
    search: "Search",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    empty: "No data",
    confirmDeleteTitle: "Confirm delete",
    confirmDeleteBody: "Are you sure you want to delete this record?",
    columns: {
      country: "Country",
      mineral: "Mineral",
      year: "Year",
      value: "Value (USD)",
      updatedAt: "Updated",
      actions: "Actions",
    },
    fields: {
      country_id: "Country",
      mineral_id: "Mineral",
      year: "Year",
      trade_value_usd: "Value (USD)",
    },
    pagination: {
      previous: "Previous",
      next: "Next",
      pageOf: (page, total) => `Page ${page} of ${total}`,
      showing: (from, to, total) => `Showing ${from}–${to} of ${total}`,
    },
  },
};

function safeDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function TradeImportsMobileRow({ r, countryName, mineralName, colors, t, isRTL, onEdit, onDelete }) {
  const updated = safeDate(r.updated_at);
  const valueStr = Number(r.trade_value_usd || 0).toLocaleString();

  return (
    <div
      className={`flex items-start gap-3 px-3 sm:px-4 py-3 ${isRTL ? "flex-row-reverse" : ""}`}
      style={{ borderBottom: `1px solid ${colors.border}` }}
    >
      <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center" style={{ background: colors.goldPale }}>
        <Download size={16} style={{ color: colors.gold }} />
      </div>
      <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
        <div className="text-sm font-semibold break-words" style={{ color: colors.ink }}>
          {countryName}
        </div>
        <div className="text-xs mt-1 break-words" style={{ color: colors.muted }}>
          {mineralName}
        </div>
        <div className="text-xs mt-1.5 tabular-nums">
          <span style={{ color: colors.muted }}>{t.columns.year}: </span>
          <span style={{ color: colors.ink }}>{r.year}</span>
        </div>
        <div className="text-xs mt-1 font-mono break-all">
          <span style={{ color: colors.muted }}>{t.columns.value}: </span>
          <span style={{ color: colors.ink }}>{valueStr}</span>
        </div>
        <div className="text-xs mt-1" style={{ color: colors.muted }}>
          {t.columns.updatedAt}: {updated ? updated.toLocaleDateString() : "-"}
        </div>
      </div>
      <div className={`flex shrink-0 items-center gap-1 pt-0.5 ${isRTL ? "flex-row-reverse" : ""}`}>
        <button
          type="button"
          onClick={() => onEdit(r)}
          className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
          style={{ color: colors.gold }}
          title={t.edit}
        >
          <Edit size={16} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(r)}
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

export default function TradeImportsPage() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);
  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;
  const excelT = {
    downloadExcel: language === "fr" ? "Exporter Excel" : "Export Excel",
    importExcel: language === "fr" ? "Importer Excel" : "Import Excel",
    downloadTemplate: language === "fr" ? "Modele Excel" : "Excel template",
    importing: language === "fr" ? "Importation..." : "Importing...",
    importSuccess: (n) => (language === "fr" ? `${n} enregistrement(s) importe(s)` : `${n} import record(s) imported`),
    importPartial: (ok, fail) => (language === "fr" ? `${ok} importe(s), ${fail} echec(s)` : `${ok} imported, ${fail} failed`),
    importDuplicateHint: language === "fr" ? "Les enregistrements existants ont ete mis a jour" : "Existing records were updated",
    importNoRows: language === "fr" ? "Aucune ligne valide dans le fichier" : "No valid rows in the file",
    importFileError: language === "fr" ? "Impossible de lire le fichier Excel" : "Could not read Excel file",
  };
  const isRTL = language === "ar";

  const colors = isDarkMode
    ? {
        bg: "#071611",
        bgLight: "#0c2620",
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
        bgLight: "#ede9df",
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
  const [currentPage, setCurrentPage] = useState(1);

  const [countries, setCountries] = useState([]);
  const [minerals, setMinerals] = useState([]);
  const [years, setYears] = useState([]);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({
    country_id: "",
    mineral_id: "",
    year: "",
    trade_value_usd: "",
  });
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

  const loadLookups = async () => {
    const [c, m, y] = await Promise.all([getCountries(), getMinerals(), getYears()]);
    setCountries(Array.isArray(c) ? c : []);
    setMinerals(Array.isArray(m) ? m : []);
    setYears(Array.isArray(y) ? y : []);
  };

  const fetchRows = async () => {
    const all = await getTradeTransactions();
    const filtered = (Array.isArray(all) ? all : []).filter((r) => r.trade_type === "import");
    setRows(filtered);
  };

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role !== "admin") return;
    loadLookups();
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.role]);

  const countryLabel = (id) => {
    const c = countries.find((x) => String(x.id) === String(id));
    if (!c) return "-";
    return language === "ar" ? c.name_ar || "-" : language === "fr" ? c.name_fr || "-" : c.name_en || "-";
  };
  const mineralLabel = (id) => {
    const m = minerals.find((x) => String(x.id) === String(id));
    if (!m) return "-";
    return language === "ar" ? m.name_ar || "-" : language === "fr" ? m.name_fr || "-" : m.name_en || "-";
  };

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = [
        countryLabel(r.country_id),
        mineralLabel(r.mineral_id),
        r.year,
        r.trade_value_usd,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, searchTerm, language, countries, minerals]);

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
    setForm({ country_id: "", mineral_id: "", year: "", trade_value_usd: "" });
  };

  const openEdit = (r) => {
    setCreating(false);
    setEditing(r);
    setForm({
      country_id: r.country_id ?? "",
      mineral_id: r.mineral_id ?? "",
      year: r.year ?? "",
      trade_value_usd: r.trade_value_usd ?? "",
    });
  };

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
  };

  const onSave = async () => {
    const payload = {
      country_id: Number(form.country_id),
      mineral_id: Number(form.mineral_id),
      year: Number(form.year),
      trade_type: "import",
      trade_value_usd: form.trade_value_usd === "" ? 0 : Number(form.trade_value_usd),
    };
    if (!payload.country_id || !payload.mineral_id || !payload.year) return;

    if (creating) await createTradeTransaction(payload);
    else if (editing?.id) await updateTradeTransaction(editing.id, payload);

    await fetchRows();
    closeModal();
  };

  const onDelete = async (r) => {
    await deleteTradeTransaction(r.id);
    await fetchRows();
    setConfirmDelete(null);
  };

  const handleDownloadExcel = () => {
    exportTradeTransactionExcel(rows, countries, minerals, t, "trade_imports.xlsx");
  };

  const handleDownloadTemplate = () => {
    exportTradeTransactionTemplateExcel(t, countries, minerals, "trade_imports_template.xlsx");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImporting(true);
    setImportMessage(null);
    try {
      const payloads = await parseTradeTransactionExcelFile(file, countries, minerals, t, "import");
      if (!payloads.length) {
        setImportMessage({ type: "error", text: excelT.importNoRows });
        return;
      }

      const uniquePayloads = dedupeTradeTransactionPayloads(payloads, "import");
      let ok = 0;
      let fail = 0;
      let updated = 0;
      let workingRows = [...rows];

      for (const rawPayload of uniquePayloads) {
        const payload = normalizeTradeTransactionPayload(rawPayload, "import");
        const existing = findMatchingTradeTransaction(workingRows, payload, "import");
        try {
          if (existing?.id) {
            const saved = await updateTradeTransaction(existing.id, payload);
            workingRows = workingRows.map((r) => (r.id === existing.id ? { ...r, ...(saved || payload) } : r));
            updated += 1;
          } else {
            const saved = await createTradeTransaction(payload);
            workingRows.push(saved || payload);
          }
          ok += 1;
        } catch {
          fail += 1;
        }
      }

      await fetchRows();
      if (fail === 0) {
        const hint = updated > 0 ? ` (${excelT.importDuplicateHint})` : "";
        setImportMessage({ type: "success", text: `${excelT.importSuccess(ok)}${hint}` });
      } else {
        setImportMessage({ type: "warning", text: excelT.importPartial(ok, fail) });
      }
    } catch {
      setImportMessage({ type: "error", text: excelT.importFileError });
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
            <Download size={20} style={{ color: colors.gold }} />
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.ink }}>
              {t.pageTitle}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02]"
              style={{ background: colors.cardBg, color: colors.ink, border: `1px solid ${colors.border}` }}
            >
              <Download size={18} style={{ color: colors.gold }} />
              <span className="text-sm font-semibold">{excelT.downloadExcel}</span>
            </button>
            <button
              type="button"
              onClick={handleImportClick}
              disabled={importing}
              className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: colors.cardBg, color: colors.ink, border: `1px solid ${colors.border}` }}
            >
              <Upload size={18} style={{ color: colors.gold }} />
              <span className="text-sm font-semibold">{importing ? excelT.importing : excelT.importExcel}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02]"
              style={{ background: colors.cardBg, color: colors.ink, border: `1px solid ${colors.border}` }}
            >
              <FileSpreadsheet size={18} style={{ color: colors.gold }} />
              <span className="text-sm font-semibold">{excelT.downloadTemplate}</span>
            </button>
            <button
              type="button"
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
          {filteredRows.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 text-center text-sm" style={{ color: colors.muted }}>
              {t.empty}
            </div>
          ) : (
            <>
              <div className="md:hidden">
                {paginatedRows.map((r) => (
                  <TradeImportsMobileRow
                    key={r.id}
                    r={r}
                    countryName={countryLabel(r.country_id)}
                    mineralName={mineralLabel(r.mineral_id)}
                    colors={colors}
                    t={t}
                    isRTL={isRTL}
                    onEdit={openEdit}
                    onDelete={setConfirmDelete}
                  />
                ))}
              </div>
              <div className="hidden md:block overflow-x-auto scrollbar-thin overscroll-x-contain">
                <table className="w-full min-w-[760px]">
                  <thead style={{ background: colors.goldPale }}>
                    <tr>
                      <th className={`px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.forest }}>
                        {t.columns.country}
                      </th>
                      <th className={`px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.forest }}>
                        {t.columns.mineral}
                      </th>
                      <th className={`px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.forest }}>
                        {t.columns.year}
                      </th>
                      <th className={`px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.forest }}>
                        {t.columns.value}
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
                    {paginatedRows.map((r) => {
                      const updated = safeDate(r.updated_at);
                      return (
                        <tr key={r.id} className="transition-all duration-200 hover:opacity-90" style={{ borderBottom: `1px solid ${colors.border}` }}>
                          <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold break-words max-w-[180px] ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.ink }}>
                            {countryLabel(r.country_id)}
                          </td>
                          <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm break-words max-w-[160px] ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.muted }}>
                            {mineralLabel(r.mineral_id)}
                          </td>
                          <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm tabular-nums ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.muted }}>
                            {r.year}
                          </td>
                          <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm font-mono break-all ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.ink }}>
                            {Number(r.trade_value_usd || 0).toLocaleString()}
                          </td>
                          <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm hidden lg:table-cell ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.muted }}>
                            {updated ? updated.toLocaleDateString() : "-"}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {filteredRows.length > 0 && (
            <div
              className={`flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-4 sm:px-6 py-3 sm:py-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}
              style={{ borderTop: `1px solid ${colors.border}` }}
            >
              <p className="text-xs sm:text-sm text-center sm:text-start" style={{ color: colors.muted }}>
                {t.pagination.showing(rangeFrom, rangeTo, filteredRows.length)}
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="rounded-2xl w-full max-w-3xl mx-2 sm:mx-0 my-4" style={{ background: colors.cardBg, border: `1px solid ${colors.border}` }}>
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
                label={t.fields.country_id}
                value={form.country_id}
                onChange={(v) => setForm((p) => ({ ...p, country_id: v }))}
                options={countries.map((c) => ({
                  value: String(c.id),
                  label: language === "ar" ? c.name_ar : language === "fr" ? c.name_fr : c.name_en,
                }))}
                colors={colors}
              />
              <SelectField
                label={t.fields.mineral_id}
                value={form.mineral_id}
                onChange={(v) => setForm((p) => ({ ...p, mineral_id: v }))}
                options={minerals.map((m) => ({
                  value: String(m.id),
                  label: language === "ar" ? m.name_ar : language === "fr" ? m.name_fr : m.name_en,
                }))}
                colors={colors}
              />
              <SelectField
                label={t.fields.year}
                value={String(form.year)}
                onChange={(v) => setForm((p) => ({ ...p, year: v }))}
                options={years
                  .map((y) => ({ value: String(y.year ?? y.id ?? y), label: String(y.year ?? y.id ?? y) }))
                  .sort((a, b) => Number(b.value) - Number(a.value))}
                colors={colors}
              />
              <TextField
                label={t.fields.trade_value_usd}
                value={String(form.trade_value_usd)}
                onChange={(v) => setForm((p) => ({ ...p, trade_value_usd: v }))}
                colors={colors}
                inputMode="decimal"
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
                  opacity: form.country_id && form.mineral_id && form.year ? 1 : 0.6,
                  pointerEvents: form.country_id && form.mineral_id && form.year ? "auto" : "none",
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
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
