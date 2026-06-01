import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Boxes, ChartLine, Flag } from "lucide-react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import { getMineralProduction } from "../services/mineralProductionService";
import { LanguageContext } from "../App";
import { getCountries, getMinerals } from "../services";

const PAGE_TRANSLATIONS = {
  ar: {
    pageTitle: "تطور الانتاج التعديني",
    pageSubtitle: "تتبع تطور الانتاج عبر السنوات مع ابراز الاتجاهات واهم التغيرات السنوية.",
    country: "الدولة",
    product: "الخامة / المنتج",
    demoView: "عرض تجريبي",
    trendChart: "منحنى التطور عبر الزمن",
    productionUnit: "وحدة الانتاج",
    yearsProduction: "السنوات / الانتاج",
    production: "الانتاج",
    year: "السنة",
    sources: "المصادر",
    ministryIndustry: "وزارة الصناعة",
    officialReports: "تقارير رسمية (Placeholder)",
    globalDatabase: "قاعدة بيانات عالمية (Placeholder)",
    sourceLink: "رابط المصدر",
  },
  fr: {
    pageTitle: "Evolution de la production miniere",
    pageSubtitle: "Suivez l'evolution de la production au fil des ans et les principales variations annuelles.",
    country: "Pays",
    product: "Minerai / produit",
    demoView: "Vue demo",
    trendChart: "Courbe d'evolution dans le temps",
    productionUnit: "Unite de production",
    yearsProduction: "Annees / production",
    production: "Production",
    year: "Annee",
    sources: "Sources",
    ministryIndustry: "Ministere de l'industrie",
    officialReports: "Rapports officiels (Placeholder)",
    globalDatabase: "Base de donnees mondiale (Placeholder)",
    sourceLink: "Lien source",
  },
  en: {
    pageTitle: "Mining production trend",
    pageSubtitle: "Track production over time with key yearly shifts and long-term direction.",
    country: "Country",
    product: "Mineral / product",
    demoView: "Demo view",
    trendChart: "Trend over time",
    productionUnit: "Production unit",
    yearsProduction: "Years / production",
    production: "Production",
    year: "Year",
    sources: "Sources",
    ministryIndustry: "Ministry of Industry",
    officialReports: "Official reports (Placeholder)",
    globalDatabase: "Global database (Placeholder)",
    sourceLink: "Source link",
  },
};

const UNIT_LABELS = {
  "ألف طن": { ar: "الف طن", fr: "milliers de tonnes", en: "thousand tons" },
};

const NUMBER_LOCALES = {
  ar: "ar-MA",
  fr: "fr-FR",
  en: "en-US",
};

function formatNumber(n, language = "ar") {
  return new Intl.NumberFormat(NUMBER_LOCALES[language] || NUMBER_LOCALES.ar).format(n);
}

const localizeUnit = (value, language) => UNIT_LABELS[value]?.[language] || value;

const localizeCountry = (country, language) => {
  if (!country) return "";
  if (language === "fr") return country.name_fr || country.name_en || country.name_ar || "";
  if (language === "en") return country.name_en || country.name_fr || country.name_ar || "";
  return country.name_ar || country.name_en || country.name_fr || "";
};

const localizeMineral = (mineral, language) => {
  if (!mineral) return "";
  if (language === "fr") return mineral.name_fr || mineral.name_en || mineral.name_ar || "";
  if (language === "en") return mineral.name_en || mineral.name_fr || mineral.name_ar || "";
  return mineral.name_ar || mineral.name_en || mineral.name_fr || "";
};

const localizeCountryRow = (row, language) => {
  if (!row) return "";
  if (language === "fr") return row.country_name_fr || row.country_name_en || row.country_name_ar || "";
  if (language === "en") return row.country_name_en || row.country_name_fr || row.country_name_ar || "";
  return row.country_name_ar || row.country_name_en || row.country_name_fr || "";
};

const localizeMineralRow = (row, language) => {
  if (!row) return "";
  if (language === "fr") return row.mineral_name_fr || row.mineral_name_en || row.mineral_name_ar || "";
  if (language === "en") return row.mineral_name_en || row.mineral_name_fr || row.mineral_name_ar || "";
  return row.mineral_name_ar || row.mineral_name_en || row.mineral_name_fr || "";
};

const pickUnitLabelFromTrend = (trendRows, language) => {
  const row = trendRows?.find((r) => r) || null;
  if (!row) return "";
  if (language === "fr") return row.unit_name_fr || row.unit_name_en || row.unit_name_ar || "";
  if (language === "en") return row.unit_name_en || row.unit_name_fr || row.unit_name_ar || "";
  return row.unit_name_ar || row.unit_name_en || row.unit_name_fr || "";
};

const PALETTE = [
  "rgba(8, 39, 33, 0.95)",
  "rgba(16, 120, 97, 0.95)",
  "rgba(221, 188, 107, 0.95)",
  "rgba(59, 130, 246, 0.95)",
  "rgba(168, 85, 247, 0.95)",
  "rgba(239, 68, 68, 0.95)",
  "rgba(245, 158, 11, 0.95)",
  "rgba(20, 184, 166, 0.95)",
];

export default function M2Page() {
  const { language } = useContext(LanguageContext);
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS.ar;

  const [countries, setCountries] = useState([]);
  const [minerals, setMinerals] = useState([]);
  const [countryId, setCountryId] = useState("all");
  const [mineralId, setMineralId] = useState("all");

  const [trendRows, setTrendRows] = useState([]); // { year, production_quantity, unit_name_* }
  const [isLoadingTrend, setIsLoadingTrend] = useState(false);
  const [trendError, setTrendError] = useState("");
  const [isCompact, setIsCompact] = useState(false);
  const unitLabel = useMemo(() => pickUnitLabelFromTrend(trendRows, language), [trendRows, language]);

  const selectedCountry = useMemo(
    () => (countryId === "all" ? null : countries.find((c) => String(c.id) === String(countryId)) || null),
    [countries, countryId]
  );
  const selectedMineral = useMemo(
    () => (mineralId === "all" ? null : minerals.find((m) => String(m.id) === String(mineralId)) || null),
    [minerals, mineralId]
  );

  const { labels, datasets, tableSeries } = useMemo(() => {
    const rows = Array.isArray(trendRows) ? trendRows : [];

    const years = Array.from(
      new Set(rows.map((r) => Number(r.year)).filter((y) => Number.isFinite(y)))
    ).sort((a, b) => a - b);

    // Determine grouping: by country or by mineral or single
    const hasCountryGrouping = rows.some((r) => r?.country_id !== null && r?.country_id !== undefined);
    const hasMineralGrouping = rows.some((r) => r?.mineral_id !== null && r?.mineral_id !== undefined);

    const keyFn = (r) => {
      if (hasCountryGrouping) return `country:${r.country_id}`;
      if (hasMineralGrouping) return `mineral:${r.mineral_id}`;
      return "single";
    };

    const labelFn = (r) => {
      if (hasCountryGrouping) return localizeCountryRow(r, language) || "-";
      if (hasMineralGrouping) return localizeMineralRow(r, language) || "-";
      return t.production;
    };

    const groups = new Map();
    for (const r of rows) {
      const k = keyFn(r);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(r);
    }

    const ds = Array.from(groups.entries()).map(([k, groupRows], idx) => {
      const yearToVal = new Map();
      for (const r of groupRows) {
        const y = Number(r.year);
        const v = Number(r.production_quantity ?? 0);
        yearToVal.set(y, v);
      }

      const color = PALETTE[idx % PALETTE.length];
      return {
        key: k,
        label: labelFn(groupRows[0]),
        data: years.map((y) => yearToVal.get(y) ?? 0),
        borderWidth: 3,
        tension: 0.18,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: false,
        borderColor: color,
        pointBackgroundColor: color,
        pointBorderColor: "#fff",
      };
    });

    // Table: show total across datasets per year
    const totals = years.map((_, i) => ds.reduce((sum, d) => sum + Number(d.data[i] ?? 0), 0));
    const tbl = years.map((y, i) => ({ year: y, val: totals[i] }));

    return { labels: years, datasets: ds, tableSeries: tbl };
  }, [trendRows, language, t.production]);

  const yearsRows = useMemo(() => tableSeries, [tableSeries]);
  const sourceRows = useMemo(() => {
    const sourceSet = new Set();
    for (const row of trendRows || []) {
      const source = row?.data_source;
      if (source && String(source).trim()) {
        sourceSet.add(String(source).trim());
      }
    }
    return Array.from(sourceSet);
  }, [trendRows]);

  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const updateCompact = () => {
      setIsCompact(window.innerWidth < 768);
    };
    updateCompact();
    window.addEventListener("resize", updateCompact);
    return () => window.removeEventListener("resize", updateCompact);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLookups() {
      try {
        const [c, m] = await Promise.all([getCountries(), getMinerals()]);
        if (cancelled) return;

        setCountries(Array.isArray(c) ? c : []);
        setMinerals(Array.isArray(m) ? m : []);

        setCountryId((prev) => prev || "all");
        setMineralId((prev) => prev || "all");
      } catch {
        if (cancelled) return;
        setCountries([]);
        setMinerals([]);
      }
    }

    loadLookups();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTrend() {
      setIsLoadingTrend(true);
      setTrendError("");
      try {
        let rows = await getMineralProduction();
        if (cancelled) return;

        if (countryId !== "all") {
          rows = rows.filter((r) => String(r.country_id) === String(countryId));
        }
        if (mineralId !== "all") {
          rows = rows.filter((r) => String(r.mineral_id) === String(mineralId));
        }

        if (cancelled) return;
        setTrendRows(Array.isArray(rows) ? rows : []);
      } catch (error) {
        if (cancelled) return;
        console.error("Error loading trend data:", error);
        setTrendRows([]);
        setTrendError(
          language === "fr"
            ? "Erreur de chargement des donnees (API / DB)."
            : language === "en"
              ? "Failed to load data (API / DB)."
              : "فشل تحميل البيانات (API / DB)."
        );
      } finally {
        if (!cancelled) setIsLoadingTrend(false);
      }
    }

    loadTrend();
    return () => {
      cancelled = true;
    };
  }, [countryId, mineralId, language]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: datasets.map((d) => ({
          label: d.label,
          data: d.data,
          borderWidth: d.borderWidth,
          tension: d.tension,
          pointRadius: d.pointRadius,
          pointHoverRadius: d.pointHoverRadius,
          fill: d.fill,
          borderColor: d.borderColor,
          pointBackgroundColor: d.pointBackgroundColor,
          pointBorderColor: d.pointBorderColor,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: datasets.length > 1,
            position: "bottom",
            labels: {
              boxWidth: isCompact ? 10 : 14,
              font: { family: "Cairo", size: isCompact ? 10 : 11 },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) =>
                ` ${formatNumber(context.parsed.y, language)} ${
                  unitLabel ? localizeUnit(unitLabel, language) : ""
                }`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(0,0,0,.08)" },
            ticks: {
              font: { family: "Cairo", weight: "700" },
              autoSkip: true,
              maxTicksLimit: isCompact ? 6 : 12,
            },
          },
          y: {
            grid: { color: "rgba(0,0,0,.10)" },
            ticks: { font: { family: "Cairo" } },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [language, t.production, labels, datasets, unitLabel, isCompact]);

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      lang={language}
      className="min-h-screen font-['Cairo'] text-slate-800"
      style={{ background: "#F4F7F5" }}
    >
      <Menu />
      <div className="relative overflow-hidden bg-[#082721] pb-36 pt-16 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ddbc6b 1px, transparent 1px)", size: "20px 20px" }}></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="mb-4 text-4xl font-black md:text-5xl">{t.pageTitle}</h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">{t.pageSubtitle}</p>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20" style={{ transform: "translateY(2px)" }}>
          <svg className="relative block w-full h-[56px] md:h-[90px] lg:h-[120px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#eef2f1" fillOpacity="0.45" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L0,320Z" />
            <path fill="#f8faf9" fillOpacity="1" d="M0,288L60,261.3C120,235,240,181,360,149.3C480,117,600,107,720,122.7C840,139,960,181,1080,186.7C1200,192,1320,160,1380,144L1440,128L1440,320L0,320Z" />
          </svg>
        </div>
      </div>
      <main className="container mx-auto px-3 sm:px-4 -mt-24 pb-12 relative z-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Top filters */}
        <section className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/60">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm">
              <div className="mb-2 text-xs font-extrabold text-slate-500">
                {t.country}
              </div>
              <div className="flex items-center gap-2">
                <Flag size={16} strokeWidth={2.2} className="text-[#082721]" />
                <select
                  value={countryId}
                  onChange={(e) => setCountryId(e.target.value)}
                  className="w-full border-none bg-transparent text-sm font-bold text-slate-700 outline-none focus:ring-0"
                >
                  <option value="all">
                    {language === "fr" ? "Tous les pays" : language === "en" ? "All countries" : "كل الدول"}
                  </option>
                  {countries.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {localizeCountry(c, language)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm">
              <div className="mb-2 text-xs font-extrabold text-slate-500">
                {t.product}
              </div>
              <div className="flex items-center gap-2">
                <Boxes size={16} strokeWidth={2.2} className="text-[#082721]" />
                <select
                  value={mineralId}
                  onChange={(e) => setMineralId(e.target.value)}
                  className="w-full border-none bg-transparent text-sm font-bold text-slate-700 outline-none focus:ring-0"
                >
                  <option value="all">
                    {language === "fr" ? "Tous les minerais" : language === "en" ? "All minerals" : "كل المعادن"}
                  </option>
                  {minerals.map((m) => (
                    <option key={m.id} value={String(m.id)}>
                      {localizeMineral(m, language)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs font-semibold text-slate-500">
            {t.demoView}:{" "}
            {countryId === "all"
              ? language === "fr"
                ? "Tous les pays"
                : language === "en"
                  ? "All countries"
                  : "كل الدول"
              : localizeCountry(selectedCountry, language)}{" "}
            -{" "}
            {mineralId === "all"
              ? language === "fr"
                ? "Tous les minerais"
                : language === "en"
                  ? "All minerals"
                  : "كل المعادن"
              : localizeMineral(selectedMineral, language)}
          </div>
        </section>

        {/* Main layout */}
        <section className="mt-4 grid gap-4 lg:grid-cols-12">
          {/* Chart */}
          <div className="lg:col-span-9">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-base font-extrabold text-slate-800">
                  {t.trendChart}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#ddbc6b]/15 px-3 py-1 text-xs font-bold text-[#082721]">
                  <ChartLine size={14} strokeWidth={2.2} />
                  <span>
                    {t.productionUnit}: {unitLabel ? localizeUnit(unitLabel, language) : "-"}
                  </span>
                </div>
              </div>

              <div className="relative h-[260px] sm:h-[340px] lg:h-[420px]">
                <canvas ref={canvasRef} />
                {isLoadingTrend ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-500">
                    {language === "fr" ? "Chargement..." : language === "en" ? "Loading..." : "جار التحميل..."}
                  </div>
                ) : trendError ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70 px-4 text-center text-sm font-bold text-red-700">
                    {trendError}
                  </div>
                ) : labels.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70 px-4 text-center text-sm font-bold text-slate-600">
                    {language === "fr"
                      ? "Aucune donnee pour cette selection."
                      : language === "en"
                        ? "No data for this selection."
                        : "لا توجد بيانات لهذا الاختيار."}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4 lg:col-span-3">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 text-sm font-extrabold text-slate-800">
                {t.yearsProduction}
              </div>
              <div className="max-h-[260px] overflow-y-auto rounded-2xl border border-slate-100 bg-white">
                <table className={`min-w-full text-xs ${language === "ar" ? "text-right" : "text-left"}`}>
                  <thead className="sticky top-0 bg-slate-50 text-[11px] font-extrabold text-[#082721]">
                    <tr>
                      <th className="px-3 py-2">{t.production}</th>
                      <th className="px-3 py-2">{t.year}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearsRows.map((r) => (
                      <tr
                        key={r.year}
                        className="border-t border-slate-100 text-slate-700"
                      >
                        <td className="px-3 py-1.5 font-bold">
                          {formatNumber(r.val, language)}
                        </td>
                        <td className="px-3 py-1.5">{formatNumber(r.year, language)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-l from-[#082721] to-[#051712] p-4 text-white shadow-lg ring-1 ring-[#ddbc6b]/25">
              <div className="mb-2 text-sm font-extrabold text-white">
                {t.sources}
              </div>
              <div className="space-y-2 rounded-2xl border border-white/15 bg-white/5 p-3">
                {sourceRows.length === 0 ? (
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-3 text-xs text-slate-200">
                    {language === "fr"
                      ? "Aucune source pour cette selection."
                      : language === "en"
                        ? "No sources for this selection."
                        : "لا توجد مصادر لهذا الاختيار."}
                  </div>
                ) : (
                  sourceRows.map((source, idx) => (
                    <div key={`${source}-${idx}`} className="flex gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 text-xs">
                      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${idx % 2 === 0 ? "bg-[#ddbc6b]" : "bg-emerald-300"}`} />
                      <div>
                        <div className="font-bold text-white">{source}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

