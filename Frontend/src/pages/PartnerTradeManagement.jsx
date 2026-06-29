import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownUp, Check, ChevronLeft, ChevronRight, Download, Edit, FileSpreadsheet, Handshake, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { LanguageContext, ThemeContext } from "../App";
import Sidebar, { MobileHeader } from "../layouts/Sidebar";
import { getCurrentUser, refreshCurrentUser } from "../services/authService";
import { getCountries } from "../services/countryService";
import { getAllMineralTrades } from "../services/mineralTradeService";
import {
  createPartnerTrade,
  deletePartnerTrade,
  getAllPartnerTrades,
  updatePartnerTrade,
} from "../services/partnerTradeService";
import { getTradePartners } from "../services/tradePartnerService";
import {
  createTradeWorld,
  deleteTradeWorld,
  getAllTradeWorld,
  updateTradeWorld,
} from "../services/tradeWorldService";
import {
  dedupePartnerTradePayloads,
  exportPartnerTradeExcel,
  exportPartnerTradeTemplateExcel,
  findMatchingPartnerTrade,
  normalizePartnerTradePayload,
  parsePartnerTradeExcelFile,
} from "../utils/partnerTradeExcel";

const PAGE_SIZE = 15;

const TRANSLATIONS = {
  ar: {
    pageTitle: "إدارة التجارة مع الشركاء",
    worldPageTitle: "إدارة التجارة مع العالم",
    exportPartnersTitle: "الصادرات مع شركاء",
    importPartnersTitle: "الواردات مع شركاء",
    exportWorldTitle: "الصادرات مع العالم",
    importWorldTitle: "الواردات مع العالم",
    noAccess: "لا تملك صلاحيات الوصول لهذه الصفحة",
    search: "بحث",
    add: "إضافة",
    edit: "تعديل",
    delete: "حذف",
    cancel: "إلغاء",
    save: "حفظ",
    empty: "لا توجد بيانات",
    export: "تصدير",
    import: "استيراد",
    confirmDeleteTitle: "تأكيد الحذف",
    confirmDeleteBody: "هل أنت متأكد من حذف سجل التجارة مع الشريك؟",
    columns: {
      reporter: "الدولة المبلغة",
      partner: "الشريك",
      mineral: "المعدن",
      year: "السنة",
      value: "القيمة (USD)",
      share: "النسبة",
      type: "النوع",
      updatedAt: "آخر تحديث",
      actions: "الإجراءات",
    },
    fields: {
      reporter_country_id: "الدولة المبلغة",
      partner_id: "الشريك",
      mineral_trade_id: "المعدن",
      year: "السنة",
      value_usd: "القيمة بالدولار",
      value_share: "النسبة",
      type_trade: "نوع التجارة",
    },
    pagination: {
      previous: "السابق",
      next: "التالي",
      pageOf: (page, total) => `صفحة ${page} من ${total}`,
      showing: (from, to, total) => `عرض ${from}-${to} من ${total}`,
    },
  },
  fr: {
    pageTitle: "Gestion du commerce avec les partenaires",
    worldPageTitle: "Gestion du commerce avec le monde",
    exportPartnersTitle: "Exportations avec partenaires",
    importPartnersTitle: "Importations avec partenaires",
    exportWorldTitle: "Exportations avec le monde",
    importWorldTitle: "Importations avec le monde",
    noAccess: "Vous n'avez pas accès à cette page",
    search: "Rechercher",
    add: "Ajouter",
    edit: "Modifier",
    delete: "Supprimer",
    cancel: "Annuler",
    save: "Enregistrer",
    empty: "Aucune donnée",
    export: "Export",
    import: "Import",
    confirmDeleteTitle: "Confirmer la suppression",
    confirmDeleteBody: "Êtes-vous sûr de vouloir supprimer cet enregistrement partenaire ?",
    columns: {
      reporter: "Pays déclarant",
      partner: "Partenaire",
      mineral: "Minéral",
      year: "Année",
      value: "Valeur (USD)",
      share: "Part",
      type: "Type",
      updatedAt: "Mis à jour",
      actions: "Actions",
    },
    fields: {
      reporter_country_id: "Pays déclarant",
      partner_id: "Partenaire",
      mineral_trade_id: "Minéral",
      year: "Année",
      value_usd: "Valeur (USD)",
      value_share: "Part",
      type_trade: "Type de commerce",
    },
    pagination: {
      previous: "Précédent",
      next: "Suivant",
      pageOf: (page, total) => `Page ${page} sur ${total}`,
      showing: (from, to, total) => `Affichage ${from}-${to} sur ${total}`,
    },
  },
  en: {
    pageTitle: "Partner trade management",
    worldPageTitle: "World trade management",
    exportPartnersTitle: "Exports with partners",
    importPartnersTitle: "Imports with partners",
    exportWorldTitle: "Exports with world",
    importWorldTitle: "Imports with world",
    noAccess: "You don't have access to this page",
    search: "Search",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    empty: "No data",
    export: "Export",
    import: "Import",
    confirmDeleteTitle: "Confirm delete",
    confirmDeleteBody: "Are you sure you want to delete this partner trade record?",
    columns: {
      reporter: "Reporter country",
      partner: "Partner",
      mineral: "Mineral",
      year: "Year",
      value: "Value (USD)",
      share: "Share",
      type: "Type",
      updatedAt: "Updated",
      actions: "Actions",
    },
    fields: {
      reporter_country_id: "Reporter country",
      partner_id: "Partner",
      mineral_trade_id: "Mineral",
      year: "Year",
      value_usd: "Value (USD)",
      value_share: "Share",
      type_trade: "Trade type",
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
  reporter_country_id: "",
  partner_id: "",
  mineral_trade_id: "",
  year: "",
  value_usd: "",
  value_share: "",
  type_trade: "export",
};

function safeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toNullableNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export default function PartnerTradeManagementPage({ scope = "partners", typeFilter = null }) {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);
  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;
  const excelT = {
    downloadExcel: language === "fr" ? "Exporter Excel" : "Export Excel",
    importExcel: language === "fr" ? "Importer Excel" : "Import Excel",
    downloadTemplate: language === "fr" ? "Modele Excel" : "Excel template",
    importing: language === "fr" ? "Importation..." : "Importing...",
    importSuccess: (n) => (language === "fr" ? `${n} enregistrement(s) importe(s)` : `${n} trade record(s) imported`),
    importPartial: (ok, fail) => (language === "fr" ? `${ok} importe(s), ${fail} echec(s)` : `${ok} imported, ${fail} failed`),
    importDuplicateHint: language === "fr" ? "Les enregistrements existants ont ete mis a jour" : "Existing records were updated",
    importNoRows: language === "fr" ? "Aucune ligne valide dans le fichier" : "No valid rows in the file",
    importFileError: language === "fr" ? "Impossible de lire le fichier Excel" : "Could not read Excel file",
  };
  const isRTL = language === "ar";
  const isWorld = scope === "world";
  const pageTitle = isWorld
    ? typeFilter === "export"
      ? t.exportWorldTitle
      : typeFilter === "import"
        ? t.importWorldTitle
        : t.worldPageTitle
    : typeFilter === "export"
      ? t.exportPartnersTitle
      : typeFilter === "import"
        ? t.importPartnersTitle
        : t.pageTitle;

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
  const [countries, setCountries] = useState([]);
  const [partners, setPartners] = useState([]);
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
      const user = getCurrentUser();
      if (!user) {
        navigate("/login");
        return;
      }
      const refreshed = await refreshCurrentUser();
      setCurrentUser(refreshed || user);
      setLoading(false);
    };
    loadUser();
  }, [navigate]);

  const fetchAll = async () => {
    const [tradeRows, countryRows, partnerRows, mineralRows] = await Promise.all([
      isWorld ? getAllTradeWorld() : getAllPartnerTrades(),
      getCountries(),
      getTradePartners(),
      getAllMineralTrades(),
    ]);
    setRows(Array.isArray(tradeRows) ? tradeRows : []);
    setCountries(Array.isArray(countryRows) ? countryRows : []);
    setPartners(Array.isArray(partnerRows) ? partnerRows : []);
    setMinerals(Array.isArray(mineralRows) ? mineralRows : []);
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.role]);

  const countryLabel = (id) => {
    const country = countries.find((c) => String(c.id) === String(id));
    if (!country) return "-";
    if (language === "ar") return country.name_ar || country.name_en || country.name_fr || "-";
    if (language === "fr") return country.name_fr || country.name_en || country.name_ar || "-";
    return country.name_en || country.name_fr || country.name_ar || "-";
  };

  const partnerLabel = (id) => {
    const partner = partners.find((p) => String(p.id) === String(id));
    if (!partner) return "-";
    if (language === "ar") return partner.name_ar || partner.name_en || partner.name_fr || "-";
    if (language === "fr") return partner.name_fr || partner.name_en || partner.name_ar || "-";
    return partner.name_en || partner.name_fr || partner.name_ar || "-";
  };

  const mineralLabel = (id) => {
    const mineral = minerals.find((m) => String(m.id) === String(id));
    if (!mineral) return "-";
    if (language === "ar") return mineral.mineral_name_ar || mineral.name_ar || "-";
    if (language === "fr") return mineral.mineral_name_fr || mineral.name_fr || "-";
    return mineral.mineral_name_en || mineral.name_en || "-";
  };

  const tradeTypeLabel = (type) => (type === "import" ? t.import : t.export);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const typedRows = typeFilter ? rows.filter((row) => row.type_trade === typeFilter) : rows;
    if (!q) return typedRows;
    return typedRows.filter((row) =>
      [
        countryLabel(row.reporter_country_id),
        partnerLabel(row.partner_id),
        mineralLabel(row.mineral_trade_id),
        row.year,
        row.value_usd,
        row.value_share,
        tradeTypeLabel(row.type_trade),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, searchTerm, language, countries, partners, minerals, typeFilter]);

  const exportRows = useMemo(
    () => (typeFilter ? rows.filter((row) => row.type_trade === typeFilter) : rows),
    [rows, typeFilter]
  );

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
    setForm({ ...emptyForm, type_trade: typeFilter || "export" });
  };

  const openEdit = (row) => {
    setCreating(false);
    setEditing(row);
    setForm({
      reporter_country_id: row.reporter_country_id ?? "",
      partner_id: row.partner_id ?? "",
      mineral_trade_id: row.mineral_trade_id ?? "",
      year: row.year ?? "",
      value_usd: row.value_usd ?? "",
      value_share: row.value_share ?? "",
      type_trade: row.type_trade || "export",
    });
  };

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const onSave = async () => {
    const payload = {
      reporter_country_id: Number(form.reporter_country_id),
      partner_id: Number(form.partner_id),
      mineral_trade_id: Number(form.mineral_trade_id),
      year: Number(form.year),
      value_usd: toNullableNumber(form.value_usd),
      value_share: isWorld ? toNullableNumber(form.value_share) : undefined,
      type_trade: typeFilter || form.type_trade,
    };

    if (!payload.reporter_country_id || !payload.partner_id || !payload.mineral_trade_id || !payload.year || !payload.type_trade) return;

    if (creating) {
      if (isWorld) await createTradeWorld(payload);
      else await createPartnerTrade(payload);
    } else if (editing?.id) {
      if (isWorld) await updateTradeWorld(editing.id, payload);
      else await updatePartnerTrade(editing.id, payload);
    }

    await fetchAll();
    closeModal();
  };

  const onDelete = async (row) => {
    if (!row?.id) return;
    if (isWorld) await deleteTradeWorld(row.id);
    else await deletePartnerTrade(row.id);
    await fetchAll();
    setConfirmDelete(null);
  };

  const excelBaseName = `${isWorld ? "world_trade" : "partner_trade"}${typeFilter ? `_${typeFilter}` : ""}`;

  const handleDownloadExcel = () => {
    exportPartnerTradeExcel(exportRows, countries, partners, minerals, t, language, isWorld, `${excelBaseName}.xlsx`);
  };

  const handleDownloadTemplate = () => {
    exportPartnerTradeTemplateExcel(t, countries, partners, minerals, language, isWorld, typeFilter, `${excelBaseName}_template.xlsx`);
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
      const payloads = await parsePartnerTradeExcelFile(file, countries, partners, minerals, t, isWorld, typeFilter);
      if (!payloads.length) {
        setImportMessage({ type: "error", text: excelT.importNoRows });
        return;
      }

      const uniquePayloads = dedupePartnerTradePayloads(payloads, isWorld, typeFilter);
      let ok = 0;
      let fail = 0;
      let updated = 0;
      let workingRows = [...exportRows];

      for (const rawPayload of uniquePayloads) {
        const payload = normalizePartnerTradePayload(rawPayload, isWorld, typeFilter);
        const existing = findMatchingPartnerTrade(workingRows, payload, isWorld, typeFilter);
        try {
          if (existing?.id) {
            const saved = isWorld ? await updateTradeWorld(existing.id, payload) : await updatePartnerTrade(existing.id, payload);
            workingRows = workingRows.map((row) => (row.id === existing.id ? { ...row, ...(saved || payload) } : row));
            updated += 1;
          } else {
            const saved = isWorld ? await createTradeWorld(payload) : await createPartnerTrade(payload);
            workingRows.push(saved || payload);
          }
          ok += 1;
        } catch {
          fail += 1;
        }
      }

      await fetchAll();
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
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} title={pageTitle} />
        <div className="p-4 sm:p-6 lg:p-8" style={{ background: colors.bg, minHeight: "100vh" }}>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Handshake size={20} style={{ color: colors.gold }} />
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.ink }}>
                {pageTitle}
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
                      reporterName={countryLabel(row.reporter_country_id)}
                      partnerName={partnerLabel(row.partner_id)}
                      mineralName={mineralLabel(row.mineral_trade_id)}
                      typeName={tradeTypeLabel(row.type_trade)}
                      colors={colors}
                      t={t}
                      isRTL={isRTL}
                      onEdit={openEdit}
                      onDelete={setConfirmDelete}
                    />
                  ))}
                </div>
                <div className="hidden md:block overflow-x-auto scrollbar-thin overscroll-x-contain">
                  <table className="w-full min-w-[1120px]">
                    <thead style={{ background: colors.goldPale }}>
                      <tr>
                        {[t.columns.reporter, t.columns.partner, t.columns.mineral, t.columns.year, t.columns.value, ...(isWorld ? [t.columns.share] : []), t.columns.type, t.columns.updatedAt].map((header) => (
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
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold break-words max-w-[180px] ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.ink }}>
                              {countryLabel(row.reporter_country_id)}
                            </td>
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm break-words max-w-[180px] ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.ink }}>
                              {partnerLabel(row.partner_id)}
                            </td>
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm break-words max-w-[180px] ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.muted }}>
                              {mineralLabel(row.mineral_trade_id)}
                            </td>
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm tabular-nums ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.muted }}>
                              {row.year}
                            </td>
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm font-mono break-all ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.ink }}>
                              {row.value_usd == null ? "-" : Number(row.value_usd).toLocaleString()}
                            </td>
                            {isWorld && (
                              <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm font-mono break-all ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.muted }}>
                                {row.value_share == null ? "-" : Number(row.value_share).toLocaleString()}
                              </td>
                            )}
                            <td className={`px-4 sm:px-6 py-3 sm:py-4 text-sm ${isRTL ? "text-right" : "text-left"}`} style={{ color: colors.muted }}>
                              {tradeTypeLabel(row.type_trade)}
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
                <SelectField label={t.fields.reporter_country_id} value={String(form.reporter_country_id)} onChange={(v) => setForm((p) => ({ ...p, reporter_country_id: v }))} options={countries.map((country) => ({ value: String(country.id), label: countryLabel(country.id) }))} colors={colors} />
                <SelectField label={t.fields.partner_id} value={String(form.partner_id)} onChange={(v) => setForm((p) => ({ ...p, partner_id: v }))} options={partners.map((partner) => ({ value: String(partner.id), label: partnerLabel(partner.id) }))} colors={colors} />
                <SelectField label={t.fields.mineral_trade_id} value={String(form.mineral_trade_id)} onChange={(v) => setForm((p) => ({ ...p, mineral_trade_id: v }))} options={minerals.map((mineral) => ({ value: String(mineral.id), label: mineralLabel(mineral.id) }))} colors={colors} />
                {!typeFilter && (
                  <SelectField
                    label={t.fields.type_trade}
                    value={String(form.type_trade)}
                    onChange={(v) => setForm((p) => ({ ...p, type_trade: v }))}
                    options={[
                      { value: "export", label: t.export },
                      { value: "import", label: t.import },
                    ]}
                    colors={colors}
                  />
                )}
                <TextField label={t.fields.year} value={String(form.year)} onChange={(v) => setForm((p) => ({ ...p, year: v }))} colors={colors} inputMode="numeric" />
                <TextField label={t.fields.value_usd} value={String(form.value_usd)} onChange={(v) => setForm((p) => ({ ...p, value_usd: v }))} colors={colors} inputMode="decimal" />
                {isWorld && <TextField label={t.fields.value_share} value={String(form.value_share)} onChange={(v) => setForm((p) => ({ ...p, value_share: v }))} colors={colors} inputMode="decimal" />}
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
                    opacity: form.reporter_country_id && form.partner_id && form.mineral_trade_id && form.year && (typeFilter || form.type_trade) ? 1 : 0.6,
                    pointerEvents: form.reporter_country_id && form.partner_id && form.mineral_trade_id && form.year && (typeFilter || form.type_trade) ? "auto" : "none",
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

function MobileRow({ row, reporterName, partnerName, mineralName, typeName, colors, t, isRTL, onEdit, onDelete }) {
  const updated = safeDate(row.updated_at);
  return (
    <div className={`flex items-start gap-3 px-3 sm:px-4 py-3 ${isRTL ? "flex-row-reverse" : ""}`} style={{ borderBottom: `1px solid ${colors.border}` }}>
      <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center" style={{ background: colors.goldPale }}>
        <ArrowDownUp size={16} style={{ color: colors.gold }} />
      </div>
      <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
        <div className="text-sm font-semibold break-words" style={{ color: colors.ink }}>
          {partnerName}
        </div>
        <div className="text-xs mt-1 break-words" style={{ color: colors.muted }}>
          {t.columns.reporter}: <span style={{ color: colors.ink }}>{reporterName}</span>
        </div>
        <div className="text-xs mt-1 break-words" style={{ color: colors.muted }}>
          {t.columns.mineral}: <span style={{ color: colors.ink }}>{mineralName}</span>
        </div>
        <div className="text-xs mt-1" style={{ color: colors.muted }}>
          {t.columns.year}: <span style={{ color: colors.ink }}>{row.year}</span> · {typeName}
        </div>
        <div className="text-xs mt-1 font-mono break-all">
          <span style={{ color: colors.muted }}>{t.columns.value}: </span>
          <span style={{ color: colors.ink }}>{row.value_usd == null ? "-" : Number(row.value_usd).toLocaleString()}</span>
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
