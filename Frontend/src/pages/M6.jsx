import { useEffect, useMemo, useRef, useState } from "react";
import { Scale, Weight } from "lucide-react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import {
  tradeCriticalMineralsImportData,
  tradeCriticalMineralsImportByYear,
} from "../tradeCriticalMineralsImportDataProcessed";

const COUNTRIES = [
  { name: "المملكة الأردنية الهاشمية", code: "jo" },
  { name: "دولة الامارات العربية المتحدة", code: "ae" },
  { name: "مملكة البحرين", code: "bh" },
  { name: "الجمهورية التونسية", code: "tn" },
  { name: "الجمهورية الجزائرية الديمقراطية الشعبية", code: "dz" },
  { name: "دولة جيبوتي", code: "dj" },
  { name: "المملكة العربية السعودية", code: "sa" },
  { name: "جمهورية السودان", code: "sd" },
  { name: "الجمهورية العربية السورية", code: "sy" },
  { name: "جمهورية الصومال", code: "so" },
  { name: "جمهورية العراق", code: "iq" },
  { name: "سلطنة عمان", code: "om" },
  { name: "دولة فلسطين", code: "ps" },
  { name: "دولة قطر", code: "qa" },
  { name: "دولة الكويت", code: "kw" },
  { name: "الجمهورية اللبنانية", code: "lb" },
  { name: "دولة ليبيا", code: "ly" },
  { name: "جمهورية مصر العربية", code: "eg" },
  { name: "المملكة المغربية", code: "ma" },
  { name: "الجمهورية الإسلامية الموريتانية", code: "mr" },
  { name: "الجمهورية اليمنية", code: "ye" },
];

const countryNameAr = Object.fromEntries(COUNTRIES.map(c => [c.code, c.name]));

const DEFAULT_COUNTRY = "ma";

const availableCountries = COUNTRIES.map(c => c.code);

function unitLabelFor() {
  return "دولار أمريكي";
}

function formatUsd(value) {
  return Number(value || 0).toLocaleString("fr-FR");
}

const mineralNameAr = {
  Gold: "الذهب",
  Tin: "القصدير",
  Silver: "الفضة",
  Uranium: "اليورانيوم",
  Copper: "النحاس",
  Iron: "الحديد",
  Lead: "الرصاص",
  Zinc: "الزنك",
  Nickel: "النيكل",
  Lithium: "الليثيوم",
  Cobalt: "الكوبالت",
};

function translateMineral(name) {
  if (!name || name === "all") return "كل المعادن";
  return mineralNameAr[name] || name;
}

export default function M6Page() {
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [selectedMineral, setSelectedMineral] = useState("all");
  const [countryYear, setCountryYear] = useState(null);

  const mineralOptions = useMemo(() => {
    const products = Array.from(
      new Set(tradeCriticalMineralsImportData.map((row) => row.aggregate_product))
    ).sort();
    return ["all", ...products];
  }, []);

  const productYearlyData = useMemo(() => {
    if (selectedMineral === "all") return tradeCriticalMineralsImportByYear;

    return tradeCriticalMineralsImportData
      .filter((row) => row.aggregate_product === selectedMineral)
      .reduce((acc, row) => {
        const y = String(row.year);
        acc[y] = (acc[y] || 0) + (row.value_usd || 0);
        return acc;
      }, {});
  }, [selectedMineral]);

  useEffect(() => {
    const years = Object.keys(productYearlyData)
      .map(Number)
      .sort((a, b) => b - a);
    setCountryYear(years[0] || null);
  }, [productYearlyData]);

  const yearlyUsdData = useMemo(
    () =>
      Object.entries(productYearlyData)
        .map(([year, value]) => ({ year: Number(year), value }))
        .sort((a, b) => a.year - b.year),
    [productYearlyData]
  );

  const barYears = useMemo(() => yearlyUsdData.map((item) => item.year), [yearlyUsdData]);
  const chartValues = useMemo(() => yearlyUsdData.map((item) => item.value), [yearlyUsdData]);
  const totalUsd = useMemo(
    () => yearlyUsdData.reduce((sum, item) => sum + item.value, 0),
    [yearlyUsdData]
  );

  const totalGoldTin = useMemo(() => {
    return tradeCriticalMineralsImportData
      .filter((row) => row.aggregate_product === "Gold" || row.aggregate_product === "Tin")
      .reduce((sum, row) => sum + (row.value_usd || 0), 0);
  }, []);

  const countryYears = useMemo(() => yearlyUsdData.map((item) => item.year), []);
  const countryPack = useMemo(
    () => ({
      table: [
        {
          c: selectedCountry,
          v:
            selectedCountry === "ma"
              ? yearlyUsdData.find((item) => item.year === countryYear)?.value || 0
              : 0,
        },
      ],
    }),
    [yearlyUsdData, countryYear, selectedCountry]
  );

  const effectiveCountry =
    selectedCountry && availableCountries.includes(selectedCountry)
      ? selectedCountry
      : DEFAULT_COUNTRY;

  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const donutCanvasRef = useRef(null);
  const donutChartRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const labelText =
      selectedMineral === "all"
        ? `${countryNameAr[DEFAULT_COUNTRY] || DEFAULT_COUNTRY}`
        : `${translateMineral(selectedMineral)} - ${countryNameAr[DEFAULT_COUNTRY] || DEFAULT_COUNTRY}`;

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: barYears,
        datasets: [
          {
            label: labelText,
            data: chartValues,
            borderWidth: 0,
            borderRadius: 8,
            backgroundColor: "rgba(8, 39, 33, .85)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: { font: { family: "Cairo", weight: "700" } },
          },
          tooltip: {
            callbacks: {
              label: (c) =>
                ` ${c.dataset.label}: ${formatUsd(c.parsed.y)} ${unitLabelFor()}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(0,0,0,.08)" },
            ticks: { font: { family: "Cairo", weight: "700" } },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,.10)" },
            ticks: {
              font: { family: "Cairo" },
              callback: (v) => (v === 0 ? "0" : formatUsd(v)),
            },
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
  }, [barYears, chartValues]);

  useEffect(() => {
    const ctx = donutCanvasRef.current?.getContext("2d");
    if (!ctx || !countryPack) return;

    if (donutChartRef.current) {
      donutChartRef.current.destroy();
      donutChartRef.current = null;
    }

    const rows = countryPack.table || [];
    if (!rows.length) return;

    const labels = rows.map((r) => countryNameAr[r.c] || r.c);
    const values = rows.map((r) => r.v);

    donutChartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderWidth: 3,
            borderColor: "rgba(8,39,33,0.9)",
            cutout: "68%",
            backgroundColor: ["rgba(8, 39, 33, .92)"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: () => setSelectedCountry(DEFAULT_COUNTRY),
        plugins: {
          legend: {
            position: "top",
            labels: { font: { family: "Cairo", weight: "700" } },
          },
          tooltip: {
            callbacks: {
              label: (c) => {
                const v = c.parsed;
                return ` ${c.label}: ${formatUsd(v)} ${unitLabelFor()} (100%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (donutChartRef.current) {
        donutChartRef.current.destroy();
        donutChartRef.current = null;
      }
    };
  }, [countryPack]);

  return (
    <div dir="rtl">
      <Menu />
      <main className="min-h-screen py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <header className="mb-6 rounded-3xl bg-gradient-to-l from-[#082721] to-[#051712] px-6 py-8 text-center text-white shadow-lg ring-1 ring-[#ddbc6b]/25">
            <h1 className="mb-2 text-2xl font-extrabold sm:text-3xl">
              الواردات التعدينية
            </h1>
            <p className="text-sm text-slate-100/80">
رصد حجم وقيمة الواردات من المواد الخام والمنتجات التعدينية المعالجة.

            </p>
          </header>

          <section className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-9">
              <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-base font-extrabold text-slate-800">
                    اجمالي الواردات التعدينية للدول العربية حسب السنة والخام والمنتج
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#ddbc6b]/15 px-3 py-1 text-xs font-bold text-[#082721]">
                    <Scale size={14} strokeWidth={2.2} />
                    وحدة القيمة: <span className="font-extrabold">{unitLabelFor()}</span>
                  </span>
                </div>

                <div className="h-[340px] sm:h-[440px]">
                  <canvas ref={canvasRef} />
                </div>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-3">
              <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="mb-2 text-xs font-extrabold text-slate-500">
                      الدولة
                    </div>
                    <select
                      value={effectiveCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none"
                    >
                      {availableCountries.map((c) => (
                        <option key={c} value={c}>
                          {countryNameAr[c] || c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="mb-2 text-xs font-extrabold text-slate-500">
                      المعدن
                    </div>
                    <select
                      value={selectedMineral}
                      onChange={(e) => setSelectedMineral(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none"
                    >
                      {mineralOptions.map((mineral) => (
                        <option key={mineral} value={mineral}>
                          {translateMineral(mineral)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="mb-2 text-xs font-extrabold text-slate-500">
                      وحدة القيمة
                    </div>
                    <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                      {unitLabelFor()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10 grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-base font-extrabold text-slate-800">
                    توزيع الواردات حسب الدولة العربية
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#ddbc6b]/15 px-3 py-1 text-xs font-bold text-[#082721]">
                    <Weight size={14} strokeWidth={2.2} />
                    وحدة: <span className="font-extrabold">{unitLabelFor()}</span>
                  </span>
                </div>

                <div className="flex h-[320px] items-center justify-center sm:h-[420px]">
                  <div className="h-full w-full max-w-[520px]">
                    <canvas ref={donutCanvasRef} />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
                <div className="mb-3 text-sm font-extrabold text-slate-800">
                  مقارنة دولة مختارة مع باقي الدول
                </div>

                <div className="mb-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                  <div className="mb-2 text-xs font-extrabold text-slate-500">
                    الدولة
                  </div>
                  <select
                    value={effectiveCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                  >
                    {availableCountries.map((c) => (
                      <option key={c} value={c}>
                        {countryNameAr[c] || c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3 flex gap-2 overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50 px-2 py-2 shadow-sm">
                  {countryYears.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setCountryYear(y)}
                      className={`min-w-[56px] rounded-2xl border px-3 py-1 text-xs font-extrabold transition ${
                        y === countryYear
                          ? "border-[#082721] bg-[#082721] text-white"
                          : "border-transparent bg-white text-[#082721] hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>

                <div className="mb-2 text-sm font-extrabold text-slate-800">
                  مجموع الواردات حسب الدول
                </div>

                <div className="mb-2 rounded-xl bg-[#ddbc6b]/10 px-3 py-2 text-xs font-bold text-[#082721]">
                  الدولة المختارة: {countryNameAr[effectiveCountry] || effectiveCountry || "-"}
                </div>

                <div className="max-h-[260px] overflow-y-auto rounded-2xl border border-slate-100 bg-white">
                  <table className="min-w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50 text-[11px] font-extrabold text-[#082721]">
                      <tr>
                        <th className="px-3 py-2">الدولة</th>
                        <th className="px-3 py-2">مجموع الواردات (دولار أمريكي)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {countryPack?.table?.map((r) => (
                        <tr
                          key={r.c}
                          onClick={() => setSelectedCountry(r.c)}
                          className={`border-t text-slate-700 cursor-pointer transition-colors ${
                            r.c === effectiveCountry
                              ? "border-[#082721]/20 bg-[#082721]/10"
                              : "border-slate-100 hover:bg-slate-50"
                          }`}
                        >
                          <td className="px-3 py-1.5 font-bold">
                            {countryNameAr[r.c] || r.c}
                          </td>
                          <td className="px-3 py-1.5">{formatUsd(r.v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 rounded-xl bg-[#082721]/5 px-3 py-2 text-xs font-bold text-[#082721]">
                  مجموع كل السنوات: {formatUsd(totalUsd)} دولار أمريكي
                </div>
                <div className="mt-2 rounded-xl bg-[#082721]/8 px-3 py-2 text-xs font-bold text-[#082721]">
                  مجموع الذهب + القصدير: {formatUsd(totalGoldTin)} دولار أمريكي
                </div>
              </div>
            </div>
          </section>
        </div>

          <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70 mt-6 max-w-full overflow-hidden">
            <div className="mb-2 text-sm font-extrabold text-slate-800">المصادر</div>
            <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 w-full overflow-hidden">
              <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-xs overflow-hidden">
                <div>
                  <div className="font-bold">المملكة المغربية</div>
                  <div className="text-[11px] text-slate-500">
                    التجارة في المعادن الحرجة — الذهب والقصدير — القيمة (دولار أمريكي)
                  </div>
                  <button
                    type="button"
                    className="mt-1 text-[11px] font-bold text-sky-800 underline">
                    ملف البيانات المرفوع
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
