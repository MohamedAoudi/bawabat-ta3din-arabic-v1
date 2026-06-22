import React, { useContext, useMemo, useState } from "react";
import { LanguageContext } from "../App";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import { countryFlags } from "../utils/arabCountryFlags";

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
    fromDate: "من تاريخ",
    toDate: "إلى تاريخ",
    mineral: "المعدن",
    allMinerals: "كل المعادن",
    preferredLanguage: "اللغة المفضّلة",
    generate: "إنشاء التقرير",
    reset: "إعادة التعيين",
    summaryTitle: "ملخّص معايير التقرير",
    backHome: "العودة إلى الرئيسية",
    any: "الكل",
  },
  fr: {
    badge: "Rapports intelligents",
    title: "Générer un rapport personnalisé",
    subtitle:
      "Choisissez les critères de filtrage pour générer votre rapport minier : pays, période, minéral et langue préférée.",
    country: "Pays",
    allCountries: "Tous les pays",
    period: "Période",
    fromDate: "Date de début",
    toDate: "Date de fin",
    mineral: "Minéral",
    allMinerals: "Tous les minéraux",
    preferredLanguage: "Langue préférée",
    generate: "Générer le rapport",
    reset: "Réinitialiser",
    summaryTitle: "Récapitulatif des critères",
    backHome: "Retour à l'accueil",
    any: "Tous",
  },
  en: {
    badge: "Smart Reports",
    title: "Generate a custom report",
    subtitle:
      "Choose the filter criteria to generate your mining report: country, period, mineral and preferred language.",
    country: "Country",
    allCountries: "All countries",
    period: "Period",
    fromDate: "From date",
    toDate: "To date",
    mineral: "Mineral",
    allMinerals: "All minerals",
    preferredLanguage: "Preferred language",
    generate: "Generate report",
    reset: "Reset",
    summaryTitle: "Report criteria summary",
    backHome: "Back to home",
    any: "All",
  },
};

const EMPTY_FILTERS = {
  country: "all",
  fromDate: "",
  toDate: "",
  mineral: "all",
  reportLanguage: "ar",
};

const Rapport = () => {
  const { language } = useContext(LanguageContext);
  const t = RAPPORT_TRANSLATIONS[language] || RAPPORT_TRANSLATIONS.ar;
  const isArabic = language === "ar";

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [submitted, setSubmitted] = useState(null);

  const setField = (field) => (e) =>
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(filters);
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setSubmitted(null);
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
    const mineralLabel =
      submitted.mineral === "all"
        ? t.allMinerals
        : labelFor(MINERALS.find((m) => m.key === submitted.mineral));
    const langLabel = labelFor(
      LANGUAGE_OPTIONS.find((l) => l.value === submitted.reportLanguage)
    );
    const period =
      submitted.fromDate || submitted.toDate
        ? `${submitted.fromDate || "…"} → ${submitted.toDate || "…"}`
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
                onChange={setField("country")}
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={fieldStyle}
              >
                <option value="all" style={{ color: "#082721" }}>
                  {t.allCountries}
                </option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} style={{ color: "#082721" }}>
                    {labelFor(c)}
                  </option>
                ))}
              </select>

              {/* Flags grid — 21 countries laid out on three rows */}
              <div className="grid grid-cols-7 gap-1.5 mt-3">
                {COUNTRIES.map((c) => {
                  const active = filters.country === c.code;
                  return (
                    <button
                      type="button"
                      key={c.code}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          country: prev.country === c.code ? "all" : c.code,
                        }))
                      }
                      title={labelFor(c)}
                      className="w-full rounded overflow-hidden transition-all"
                      style={{
                        aspectRatio: "4 / 3",
                        border: active
                          ? "2px solid #C9A84C"
                          : "1px solid rgba(255,255,255,0.12)",
                        opacity: active || filters.country === "all" ? 1 : 0.4,
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

            {/* From date */}
            <div>
              <label className="block text-[13px] font-semibold text-[#C9A84C] mb-2">
                {t.fromDate}
              </label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={setField("fromDate")}
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ ...fieldStyle, colorScheme: "dark" }}
              />
            </div>

            {/* To date */}
            <div>
              <label className="block text-[13px] font-semibold text-[#C9A84C] mb-2">
                {t.toDate}
              </label>
              <input
                type="date"
                value={filters.toDate}
                min={filters.fromDate || undefined}
                onChange={setField("toDate")}
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ ...fieldStyle, colorScheme: "dark" }}
              />
            </div>

            {/* Mineral */}
            <div>
              <label className="block text-[13px] font-semibold text-[#C9A84C] mb-2">
                {t.mineral}
              </label>
              <select
                value={filters.mineral}
                onChange={setField("mineral")}
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                style={fieldStyle}
              >
                <option value="all" style={{ color: "#082721" }}>
                  {t.allMinerals}
                </option>
                {MINERALS.map((m) => (
                  <option key={m.key} value={m.key} style={{ color: "#082721" }}>
                    {labelFor(m)}
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
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold text-[#082721] transition-all hover:brightness-110"
              style={{
                background: "linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)",
                boxShadow: "0 4px 16px rgba(201,168,76,0.35)",
              }}
            >
              {t.generate}
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
