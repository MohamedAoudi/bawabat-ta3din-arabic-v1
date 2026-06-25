import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { LanguageContext } from "../App";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import { countryFlags } from "../utils/arabCountryFlags";
import {
  reportService,
  REPORT_COUNTRY_NAMES,
  REPORT_YEAR_MIN,
  REPORT_YEAR_MAX,
} from "../services/reportService";

/** Arab countries with trilingual labels (matches the rest of the portal). */
const COUNTRIES = [
  { code: "jo", ar: "المملكة الأردنية الهاشمية", fr: "Jordanie", en: "Jordan" },
  { code: "ae", ar: "دولة الإمارات العربية المتحدة", fr: "Émirats arabes unis", en: "United Arab Emirates" },
  { code: "bh", ar: "مملكة البحرين", fr: "Bahreïn", en: "Bahrain" },
  { code: "tn", ar: "الجمهورية التونسية", fr: "Tunisie", en: "Tunisia" },
  { code: "dz", ar: "الجمهورية الجزائرية الديمقراطية الشعبية", fr: "Algérie", en: "Algeria" },
  { code: "dj", ar: "جمهورية جيبوتي", fr: "Djibouti", en: "Djibouti" },
  { code: "sa", ar: "المملكة العربية السعودية", fr: "Arabie saoudite", en: "Saudi Arabia" },
  { code: "sd", ar: "جمهورية السودان", fr: "Soudan", en: "Sudan" },
  { code: "sy", ar: "الجمهورية العربية السورية", fr: "Syrie", en: "Syria" },
  { code: "so", ar: "جمهورية الصومال الفيدرالية", fr: "Somalie", en: "Somalia" },
  { code: "iq", ar: "جمهورية العراق", fr: "Irak", en: "Iraq" },
  { code: "om", ar: "سلطنة عُمان", fr: "Oman", en: "Oman" },
  { code: "ps", ar: "دولة فلسطين", fr: "Palestine", en: "Palestine" },
  { code: "qa", ar: "دولة قطر", fr: "Qatar", en: "Qatar" },
  { code: "kw", ar: "دولة الكويت", fr: "Koweït", en: "Kuwait" },
  { code: "lb", ar: "الجمهورية اللبنانية", fr: "Liban", en: "Lebanon" },
  { code: "ly", ar: "دولة ليبيا", fr: "Libye", en: "Libya" },
  { code: "eg", ar: "جمهورية مصر العربية", fr: "Égypte", en: "Egypt" },
  { code: "ma", ar: "المملكة المغربية", fr: "Maroc", en: "Morocco" },
  { code: "mr", ar: "الجمهورية الإسلامية الموريتانية", fr: "Mauritanie", en: "Mauritania" },
  { code: "ye", ar: "الجمهورية اليمنية", fr: "Yémen", en: "Yemen" },
];

/** Common mining minerals of the region, trilingual. */
const MINERALS = [
  { key: "phosphate", ar: "الفوسفات", fr: "Phosphate", en: "Phosphate" },
  { key: "iron", ar: "الحديد", fr: "Fer", en: "Iron" },
  { key: "gold", ar: "الذهب", fr: "Or", en: "Gold" },
  { key: "copper", ar: "النحاس", fr: "Cuivre", en: "Copper" },
  { key: "zinc", ar: "الزنك", fr: "Zinc", en: "Zinc" },
  { key: "lead", ar: "الرصاص", fr: "Plomb", en: "Lead" },
  { key: "silver", ar: "الفضة", fr: "Argent", en: "Silver" },
  { key: "gypsum", ar: "الجبس", fr: "Gypse", en: "Gypsum" },
  { key: "salt", ar: "الملح", fr: "Sel", en: "Salt" },
  { key: "potash", ar: "البوتاس", fr: "Potasse", en: "Potash" },
  { key: "manganese", ar: "المنغنيز", fr: "Manganèse", en: "Manganese" },
  { key: "barite", ar: "الباريت", fr: "Barytine", en: "Barite" },
  { key: "marble", ar: "الرخام", fr: "Marbre", en: "Marble" },
  { key: "cement", ar: "الإسمنت", fr: "Ciment", en: "Cement" },
];

const LANGUAGE_OPTIONS = [
  { value: "ar", ar: "العربية", fr: "Arabe", en: "Arabic" },
  { value: "fr", ar: "الفرنسية", fr: "Français", en: "French" },
  { value: "en", ar: "الإنجليزية", fr: "Anglais", en: "English" },
];

const RAPPORT_TRANSLATIONS = {
  ar: {
    badge: "التقارير الذكية",
    title: "إنشاء تقرير مخصّص",
    subtitle:
      "اختر معايير الفلترة لإنشاء تقريرك التعديني: الدولة، الفترة الزمنية، المعدن، واللغة المفضّلة.",
    country: "الدولة",
    allCountries: "كل الدول",
    period: "الفترة الزمنية",
    fromYear: "من سنة",
    toYear: "إلى سنة",
    selectCountryFirst: "اختر دولة أولاً",
    selectMineralFirst: "اختر معدناً أولاً",
    mineral: "المعدن",
    allMinerals: "كل المعادن",
    preferredLanguage: "اللغة المفضّلة",
    generate: "إنشاء التقرير",
    reset: "إعادة التعيين",
    summaryTitle: "ملخّص معايير التقرير",
    backHome: "العودة إلى الرئيسية",
    any: "الكل",
    generating: "جارٍ إنشاء التقرير…",
    previewTitle: "معاينة التقرير",
    download: "تنزيل ملف PDF",
    openNewTab: "فتح في تبويب جديد",
    errCountry: "يرجى اختيار دولة محدّدة لإنشاء التقرير.",
    errMineral: "يرجى اختيار معدن محدّد لإنشاء التقرير.",
    errPeriod: "يرجى تحديد فترة زمنية صالحة (من/إلى).",
    noData: "لا تتوفّر بيانات لهذا التحديد بعد. يرجى تجربة دولة أو معدن أو فترة أخرى.",
    errNetwork: "تعذّر الاتصال بخدمة التقارير. تأكّد من تشغيلها على المنفذ 8001.",
    errGeneric: "تعذّر إنشاء التقرير. يرجى المحاولة مرة أخرى.",
  },
  fr: {
    badge: "Rapports intelligents",
    title: "Générer un rapport personnalisé",
    subtitle:
      "Choisissez les critères de filtrage pour générer votre rapport minier : pays, période, minéral et langue préférée.",
    country: "Pays",
    allCountries: "Tous les pays",
    period: "Période",
    fromYear: "Année de début",
    toYear: "Année de fin",
    selectCountryFirst: "Choisissez d'abord un pays",
    selectMineralFirst: "Choisissez d'abord un minéral",
    mineral: "Minéral",
    allMinerals: "Tous les minéraux",
    preferredLanguage: "Langue préférée",
    generate: "Générer le rapport",
    reset: "Réinitialiser",
    summaryTitle: "Récapitulatif des critères",
    backHome: "Retour à l'accueil",
    any: "Tous",
    generating: "Génération du rapport…",
    previewTitle: "Aperçu du rapport",
    download: "Télécharger le PDF",
    openNewTab: "Ouvrir dans un nouvel onglet",
    errCountry: "Veuillez sélectionner un pays précis pour générer le rapport.",
    errMineral: "Veuillez sélectionner un minéral précis pour générer le rapport.",
    errPeriod: "Veuillez choisir une période valide (de / à).",
    noData: "Aucune donnée disponible pour cette sélection. Essayez un autre pays, minéral ou période.",
    errNetwork: "Impossible de joindre le service de rapports. Vérifiez qu'il tourne sur le port 8001.",
    errGeneric: "Échec de la génération du rapport. Veuillez réessayer.",
  },
  en: {
    badge: "Smart Reports",
    title: "Generate a custom report",
    subtitle:
      "Choose the filter criteria to generate your mining report: country, period, mineral and preferred language.",
    country: "Country",
    allCountries: "All countries",
    period: "Period",
    fromYear: "From year",
    toYear: "To year",
    selectCountryFirst: "Select a country first",
    selectMineralFirst: "Select a mineral first",
    mineral: "Mineral",
    allMinerals: "All minerals",
    preferredLanguage: "Preferred language",
    generate: "Generate report",
    reset: "Reset",
    summaryTitle: "Report criteria summary",
    backHome: "Back to home",
    any: "All",
    generating: "Generating report…",
    previewTitle: "Report preview",
    download: "Download PDF",
    openNewTab: "Open in new tab",
    errCountry: "Please select a specific country to generate the report.",
    errMineral: "Please select a specific mineral to generate the report.",
    errPeriod: "Please choose a valid period (from / to).",
    noData: "No data available for this selection yet. Try a different country, mineral, or period.",
    errNetwork: "Couldn't reach the report service. Make sure it's running on port 8001.",
    errGeneric: "Failed to generate the report. Please try again.",
  },
};

const EMPTY_FILTERS = {
  country: "all",
  yearFrom: "",
  yearTo: "",
  mineral: "all",
  reportLanguage: "ar",
};

const Rapport = () => {
  const { language } = useContext(LanguageContext);
  const t = RAPPORT_TRANSLATIONS[language] || RAPPORT_TRANSLATIONS.ar;
  const isArabic = language === "ar";

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdf, setPdf] = useState(null); // { url, filename }
  // { pairs: { countryEn: { mineralEn: [yMin, yMax] } }, year_min, year_max }
  const [availability, setAvailability] = useState(null);
  const [fallbackMinerals, setFallbackMinerals] = useState([]); // used only if /availability is down
  const abortRef = useRef(null);

  // Load the country→mineral→year availability map on mount. This is what lets
  // us offer only parameter combinations that produce a non-empty report. If
  // the endpoint isn't reachable (older backend), fall back to the flat
  // /options mineral list and skip the constraints (graceful degradation).
  useEffect(() => {
    reportService.getAvailability().then((avail) => {
      if (avail?.pairs && Object.keys(avail.pairs).length) {
        setAvailability(avail);
        return;
      }
      reportService.getOptions("en").then((opts) => {
        if (opts?.minerals?.length) setFallbackMinerals(opts.minerals);
      });
    });
  }, []);

  const hasAvail = !!availability?.pairs;
  const selectedCountryEn =
    filters.country !== "all" ? REPORT_COUNTRY_NAMES[filters.country] : null;

  // Countries we can actually report on (have data). In fallback mode, allow all.
  const availableCountryCodes = useMemo(() => {
    if (!hasAvail) return new Set(COUNTRIES.map((c) => c.code));
    return new Set(
      COUNTRIES.filter((c) => availability.pairs[REPORT_COUNTRY_NAMES[c.code]]).map(
        (c) => c.code
      )
    );
  }, [hasAvail, availability]);

  // Minerals to offer: narrowed to the selected country, else the union of all
  // minerals that have data anywhere (so the dropdown is never empty pre-pick).
  const mineralOptions = useMemo(() => {
    if (!hasAvail) return fallbackMinerals;
    if (selectedCountryEn && availability.pairs[selectedCountryEn]) {
      return Object.keys(availability.pairs[selectedCountryEn]).sort();
    }
    const all = new Set();
    Object.values(availability.pairs).forEach((m) =>
      Object.keys(m).forEach((k) => all.add(k))
    );
    return [...all].sort();
  }, [hasAvail, availability, selectedCountryEn, fallbackMinerals]);

  // Year span for the current (country, mineral) pair → bounds the year selects
  // so only years that actually hold data can be picked.
  const pairSpan =
    hasAvail && selectedCountryEn && filters.mineral !== "all"
      ? availability.pairs[selectedCountryEn]?.[filters.mineral]
      : null;
  const [yearLo, yearHi] = pairSpan || [
    availability?.year_min ?? REPORT_YEAR_MIN,
    availability?.year_max ?? REPORT_YEAR_MAX,
  ];
  const yearOptions = useMemo(() => {
    const out = [];
    for (let y = yearLo; y <= yearHi; y++) out.push(y);
    return out;
  }, [yearLo, yearHi]);
  // Years are only meaningful once a specific mineral (hence a pair) is chosen.
  const yearsEnabled = !hasAvail || (selectedCountryEn && filters.mineral !== "all");

  // Revoke the blob URL on unmount and abort any in-flight generation.
  useEffect(
    () => () => {
      if (pdf?.url) URL.revokeObjectURL(pdf.url);
      if (abortRef.current) abortRef.current.abort();
    },
    [pdf]
  );

  const setField = (field) => (e) =>
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));

  // Span helper: the [min, max] data years for a given country code + mineral.
  const spanFor = (code, mineral) => {
    if (!hasAvail || code === "all" || mineral === "all") return null;
    return availability.pairs[REPORT_COUNTRY_NAMES[code]]?.[mineral] || null;
  };

  // Country change cascades: drop a now-invalid mineral, and (re)default the
  // year range to the pair's full data span so the default is a complete report.
  const handleCountryChange = (code) => {
    setFilters((prev) => {
      const span = spanFor(code, prev.mineral);
      if (span) {
        return { ...prev, country: code, yearFrom: String(span[0]), yearTo: String(span[1]) };
      }
      const mineralStillValid =
        !hasAvail || code === "all" || (prev.mineral !== "all" && !!availability.pairs[REPORT_COUNTRY_NAMES[code]]?.[prev.mineral]);
      return {
        ...prev,
        country: code,
        mineral: mineralStillValid ? prev.mineral : "all",
        yearFrom: "",
        yearTo: "",
      };
    });
  };

  // Mineral change defaults the year range to that pair's full span.
  const handleMineralChange = (e) => {
    const mineral = e.target.value;
    setFilters((prev) => {
      const span = spanFor(prev.country, mineral);
      return {
        ...prev,
        mineral,
        yearFrom: span ? String(span[0]) : "",
        yearTo: span ? String(span[1]) : "",
      };
    });
  };

  // Keep yearTo ≥ yearFrom when the start year moves.
  const handleYearFromChange = (e) => {
    const v = e.target.value;
    setFilters((prev) => ({
      ...prev,
      yearFrom: v,
      yearTo: prev.yearTo && Number(prev.yearTo) >= Number(v) ? prev.yearTo : v,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validation against the API contract: the report endpoint needs a
    // specific country + mineral + integer year range (it has no "all" mode).
    if (filters.country === "all") return setError(t.errCountry);
    if (filters.mineral === "all") return setError(t.errMineral);
    if (!filters.yearFrom || !filters.yearTo) return setError(t.errPeriod);

    let yearFrom = parseInt(filters.yearFrom, 10);
    let yearTo = parseInt(filters.yearTo, 10);
    if (Number.isNaN(yearFrom) || Number.isNaN(yearTo)) return setError(t.errPeriod);
    if (yearFrom > yearTo) [yearFrom, yearTo] = [yearTo, yearFrom];

    const countryName = REPORT_COUNTRY_NAMES[filters.country];
    // filters.mineral is now the exact EN name returned by /options (e.g. "Phosphate rock")
    const mineralName = filters.mineral;
    if (!countryName) return setError(t.errGeneric);

    // Drop any previous PDF before starting a fresh run.
    if (pdf?.url) URL.revokeObjectURL(pdf.url);
    setPdf(null);
    setSubmitted(filters);
    setLoading(true);

    abortRef.current = new AbortController();
    const result = await reportService.generateReport(
      {
        country: countryName,
        mineral: mineralName,
        year_from: yearFrom,
        year_to: yearTo,
        lang: filters.reportLanguage,
      },
      { signal: abortRef.current.signal }
    );
    setLoading(false);

    if (result.aborted) return; // superseded by reset or a newer request
    if (result.ok) {
      setPdf({ url: URL.createObjectURL(result.blob), filename: result.filename });
    } else if (result.status === 404) {
      setError(t.noData);
    } else if (result.status === 422) {
      setError(result.detail || t.errPeriod);
    } else if (result.status === 0) {
      setError(t.errNetwork);
    } else {
      setError(t.errGeneric);
    }
  };

  const handleReset = () => {
    if (abortRef.current) abortRef.current.abort();
    if (pdf?.url) URL.revokeObjectURL(pdf.url);
    setFilters(EMPTY_FILTERS);
    setSubmitted(null);
    setError(null);
    setPdf(null);
    setLoading(false);
  };

  const fieldStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(201,168,76,0.25)",
    color: "#fff",
  };

  const labelFor = (item) => item?.[language] || item?.ar || "";

  const summary = useMemo(() => {
    if (!submitted) return [];
    const countryLabel =
      submitted.country === "all"
        ? t.allCountries
        : labelFor(COUNTRIES.find((c) => c.code === submitted.country));
    // submitted.mineral is now the raw EN name from the API ("Phosphate rock", etc.)
    const mineralLabel =
      submitted.mineral === "all" ? t.allMinerals : submitted.mineral;
    const langLabel = labelFor(
      LANGUAGE_OPTIONS.find((l) => l.value === submitted.reportLanguage)
    );
    const period =
      submitted.yearFrom || submitted.yearTo
        ? `${submitted.yearFrom || "…"} → ${submitted.yearTo || "…"}`
        : t.any;
    return [
      { label: t.country, value: countryLabel },
      { label: t.period, value: period },
      { label: t.mineral, value: mineralLabel },
      { label: t.preferredLanguage, value: langLabel },
    ];
  }, [submitted, language, t]);

  return (
    <>
      <Menu />

      <main
        dir={isArabic ? "rtl" : "ltr"}
        lang={language}
        className="min-h-[calc(100vh-69px)] flex flex-col items-center px-4 py-16"
        style={{
          background: "linear-gradient(160deg,#082721 0%,#0d3b33 50%,#082721 100%)",
          fontFamily: "'Cairo','Tajawal',sans-serif",
        }}
      >
        {/* Decorative top line */}
        <div
          className="w-24 h-[3px] rounded-full mb-6"
          style={{ background: "linear-gradient(90deg,#8B2500,#C9A84C,#082721)" }}
        />

        {/* Badge */}
        <div
          className="mb-4 px-4 py-1.5 rounded-full text-[12px] font-bold tracking-widest uppercase"
          style={{
            background: "rgba(201,168,76,0.1)",
            border: "1px solid rgba(201,168,76,0.3)",
            color: "#C9A84C",
          }}
        >
          {t.badge}
        </div>

        {/* Title + subtitle */}
        <h1 className="text-3xl sm:text-4xl font-black text-white text-center mb-3 leading-tight">
          {t.title}
        </h1>
        <p className="text-white/50 text-[15px] text-center max-w-xl mb-10 leading-relaxed">
          {t.subtitle}
        </p>

        {/* Filter card */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl rounded-3xl p-6 sm:p-8 mb-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(201,168,76,0.18)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Country */}
            <div className="sm:col-span-2">
              <label className="block text-[13px] font-semibold text-[#C9A84C] mb-2">
                {t.country}
              </label>
              <select
                value={filters.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={fieldStyle}
              >
                <option value="all" style={{ color: "#082721" }}>
                  {t.allCountries}
                </option>
                {COUNTRIES.map((c) => {
                  const enabled = availableCountryCodes.has(c.code);
                  return (
                    <option
                      key={c.code}
                      value={c.code}
                      disabled={!enabled}
                      style={{ color: enabled ? "#082721" : "#9ca3af" }}
                    >
                      {labelFor(c)}
                    </option>
                  );
                })}
              </select>

              {/* Flags grid — 21 countries laid out on three rows */}
              <div className="grid grid-cols-7 gap-1.5 mt-3">
                {COUNTRIES.map((c) => {
                  const active = filters.country === c.code;
                  const enabled = availableCountryCodes.has(c.code);
                  return (
                    <button
                      type="button"
                      key={c.code}
                      disabled={!enabled}
                      onClick={() =>
                        handleCountryChange(filters.country === c.code ? "all" : c.code)
                      }
                      title={enabled ? labelFor(c) : `${labelFor(c)} — ${t.noData}`}
                      className="w-full rounded overflow-hidden transition-all"
                      style={{
                        aspectRatio: "4 / 3",
                        cursor: enabled ? "pointer" : "not-allowed",
                        border: active
                          ? "2px solid #C9A84C"
                          : "1px solid rgba(255,255,255,0.12)",
                        opacity: !enabled
                          ? 0.2
                          : active || filters.country === "all"
                            ? 1
                            : 0.4,
                        filter: enabled ? "none" : "grayscale(1)",
                        transform: active ? "scale(1.12)" : "scale(1)",
                      }}
                    >
                      <img
                        src={countryFlags[c.code]}
                        alt={c.code}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* From year — bounded to the selected pair's data span */}
            <div>
              <label className="block text-[13px] font-semibold text-[#C9A84C] mb-2">
                {t.fromYear}
              </label>
              <select
                value={filters.yearFrom}
                onChange={handleYearFromChange}
                disabled={!yearsEnabled}
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none disabled:opacity-50"
                style={fieldStyle}
              >
                <option value="" style={{ color: "#082721" }}>
                  {yearsEnabled ? "—" : t.selectMineralFirst}
                </option>
                {yearOptions.map((y) => (
                  <option key={y} value={y} style={{ color: "#082721" }}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* To year — never earlier than From year */}
            <div>
              <label className="block text-[13px] font-semibold text-[#C9A84C] mb-2">
                {t.toYear}
              </label>
              <select
                value={filters.yearTo}
                onChange={setField("yearTo")}
                disabled={!yearsEnabled}
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none disabled:opacity-50"
                style={fieldStyle}
              >
                <option value="" style={{ color: "#082721" }}>
                  {yearsEnabled ? "—" : t.selectMineralFirst}
                </option>
                {yearOptions
                  .filter((y) => !filters.yearFrom || y >= Number(filters.yearFrom))
                  .map((y) => (
                    <option key={y} value={y} style={{ color: "#082721" }}>
                      {y}
                    </option>
                  ))}
              </select>
            </div>

            {/* Mineral — only those with data for the selected country (GET /availability) */}
            <div>
              <label className="block text-[13px] font-semibold text-[#C9A84C] mb-2">
                {t.mineral}
              </label>
              <select
                value={filters.mineral}
                onChange={handleMineralChange}
                disabled={mineralOptions.length === 0}
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none disabled:opacity-50"
                style={fieldStyle}
              >
                <option value="all" style={{ color: "#082721" }}>
                  {mineralOptions.length === 0 ? "…" : t.allMinerals}
                </option>
                {mineralOptions.map((name) => (
                  <option key={name} value={name} style={{ color: "#082721" }}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred language */}
            <div>
              <label className="block text-[13px] font-semibold text-[#C9A84C] mb-2">
                {t.preferredLanguage}
              </label>
              <select
                value={filters.reportLanguage}
                onChange={setField("reportLanguage")}
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={fieldStyle}
              >
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l.value} value={l.value} style={{ color: "#082721" }}>
                    {labelFor(l)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold text-[#082721] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                background: "linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)",
                boxShadow: "0 4px 16px rgba(201,168,76,0.35)",
              }}
            >
              {loading && (
                <span
                  className="inline-block w-4 h-4 rounded-full animate-spin"
                  style={{
                    border: "2px solid rgba(8,39,33,0.35)",
                    borderTopColor: "#082721",
                  }}
                />
              )}
              {loading ? t.generating : t.generate}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold text-white/80 transition-all hover:bg-white/5"
              style={{ border: "1px solid rgba(201,168,76,0.3)" }}
            >
              {t.reset}
            </button>
          </div>
        </form>

        {/* Summary of selected filters */}
        {submitted && (
          <div
            className="w-full max-w-3xl rounded-2xl p-6 mb-8"
            style={{
              background: "rgba(201,168,76,0.06)",
              border: "1px solid rgba(201,168,76,0.2)",
            }}
          >
            <h2 className="text-[15px] font-bold text-[#C9A84C] mb-4">
              {t.summaryTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {summary.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <span className="text-[13px] text-white/50">{row.label}</span>
                  <span className="text-[13px] font-semibold text-white text-end">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error / no-data banner */}
        {error && !loading && (
          <div
            className="w-full max-w-3xl rounded-2xl p-5 mb-8 text-center"
            style={{
              background: "rgba(139,37,0,0.12)",
              border: "1px solid rgba(139,37,0,0.4)",
            }}
          >
            <span className="text-[14px] font-semibold text-[#f0c9b5]">
              {error}
            </span>
          </div>
        )}

        {/* PDF preview + download */}
        {pdf && !loading && (
          <div
            className="w-full max-w-3xl rounded-2xl p-5 mb-8"
            style={{
              background: "rgba(201,168,76,0.06)",
              border: "1px solid rgba(201,168,76,0.2)",
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <h2 className="text-[15px] font-bold text-[#C9A84C]">
                {t.previewTitle}
              </h2>
              <div className="flex items-center gap-2">
                <a
                  href={pdf.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-white/80 transition-all hover:bg-white/5"
                  style={{ border: "1px solid rgba(201,168,76,0.3)" }}
                >
                  {t.openNewTab}
                </a>
                <a
                  href={pdf.url}
                  download={pdf.filename}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-bold text-[#082721] transition-all hover:brightness-110"
                  style={{
                    background: "linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)",
                  }}
                >
                  {t.download}
                </a>
              </div>
            </div>
            <iframe
              title={t.previewTitle}
              src={pdf.url}
              className="w-full rounded-xl"
              style={{
                height: "70vh",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "#fff",
              }}
            />
          </div>
        )}

        {/* Back button */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-white/60 transition-all hover:text-[#C9A84C]"
        >
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            className="w-4 h-4"
            style={{ transform: isArabic ? "none" : "scaleX(-1)" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          {t.backHome}
        </a>

        {/* Decorative bottom line */}
        <div
          className="w-24 h-[3px] rounded-full mt-8"
          style={{ background: "linear-gradient(90deg,#082721,#C9A84C,#8B2500)" }}
        />
      </main>

      <Footer />
    </>
  );
};

export default Rapport;
