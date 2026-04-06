import { useEffect, useMemo, useRef, useState } from "react";
import { Scale, Filter, Globe2, BarChart3, Info, CalendarDays } from "lucide-react";
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
  { name: "جمهورية جيبوتي", code: "dj" },
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

const countryNameAr = Object.fromEntries(COUNTRIES.map((c) => [c.code, c.name]));
const DEFAULT_COUNTRY = "ma";
const availableCountries = COUNTRIES.map((c) => c.code);

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

  const totalUsd = useMemo(
    () => yearlyUsdData.reduce((sum, item) => sum + item.value, 0),
    [yearlyUsdData]
  );

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
  const donutCanvasRef = useRef(null);
  const chartRef = useRef(null);
  const donutChartRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (chartRef.current) chartRef.current.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(8, 39, 33, 0.9)");
    gradient.addColorStop(1, "rgba(8, 39, 33, 0.4)");

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: yearlyUsdData.map((i) => i.year),
        datasets: [
          {
            label: selectedMineral === "all" ? "إجمالي الواردات" : translateMineral(selectedMineral),
            data: yearlyUsdData.map((i) => i.value),
            backgroundColor: gradient,
            borderRadius: 12,
            borderWidth: 0,
            barPercentage: 0.6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(8, 39, 33, 0.9)",
            titleFont: { family: "Cairo", size: 14 },
            bodyFont: { family: "Cairo", size: 13 },
            padding: 12,
            cornerRadius: 10,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "Cairo", weight: "700" } },
          },
          y: {
            grid: { color: "rgba(0,0,0,0.05)" },
            ticks: { font: { family: "Cairo" } },
          },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [yearlyUsdData, selectedMineral]);

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
          legend: { display: false },
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
    <div dir="rtl" className="min-h-screen bg-[linear-gradient(135deg,_#f7f8f5_0%,_#eef3f0_50%,_#e8ede8_100%)] text-slate-800 font-['Cairo'] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#082721]/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ddbc6b]/8 rounded-full blur-3xl -ml-48 -mb-48"></div>

      <Menu />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <header className="relative mb-10 rounded-3xl bg-gradient-to-br from-[#082721] via-[#0a342c] to-[#051712] border border-[#ddbc6b]/30 px-6 sm:px-8 py-8 sm:py-10 text-center text-white shadow-lg">
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#ddbc6b]/10 rounded-full blur-2xl"></div>
          </div>
          <div className="relative z-10">
            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-[#ddbc6b]/20 border border-[#ddbc6b]/50 text-xs font-bold text-[#f0e0b8] tracking-wider uppercase">
              ⚡ لوحة تحليلية للواردات
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">
              تدفق الواردات التعدينية
            </h1>
            <p className="text-slate-100/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              تحليل شامل وتفاعلي لتدفقات استيراد المعادن الحرجة في المنطقة العربية
            </p>
          </div>
        </header>

        {/* Control Panel */}
        <section className="mb-8 rounded-2xl bg-white/70 backdrop-blur-sm border border-[#d0d8d2] p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#082721]/8">
              <Filter size={16} className="text-[#082721]" />
              <span className="text-xs font-bold text-[#082721] uppercase tracking-wide">تصفية:</span>
            </div>

            <div className="flex-1 min-w-[180px]">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full appearance-none bg-white border border-[#d0d8d2] rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 outline-none transition focus:border-[#082721]/50 focus:ring-2 focus:ring-[#082721]/15"
              >
                {availableCountries.map((c) => (
                  <option key={c} value={c}>
                    {countryNameAr[c] || c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <select
                value={selectedMineral}
                onChange={(e) => setSelectedMineral(e.target.value)}
                className="w-full appearance-none bg-white border border-[#d0d8d2] rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 outline-none transition focus:border-[#082721]/50 focus:ring-2 focus:ring-[#082721]/15"
              >
                {mineralOptions.map((m) => (
                  <option key={m} value={m}>
                    {translateMineral(m)}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 ml-auto">
              <Scale size={14} />
              دولار أمريكي
            </div>
          </div>
        </section>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white/90 rounded-2xl border border-[#d0d8d2] shadow-lg backdrop-blur-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#082721]/10">
                  <BarChart3 className="text-[#082721]" size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">اتجاه الواردات السنوي</h3>
                  <p className="text-xs text-slate-500">قيمة الواردات المعدنية حسب السنة</p>
                </div>
              </div>
              <div className="text-right bg-[#082721]/5 rounded-lg px-3 py-2">
                <p className="text-[10px] text-slate-600 font-bold uppercase">الإجمالي</p>
                <p className="text-base sm:text-lg font-black text-[#082721]">${Number(totalUsd).toLocaleString()}</p>
              </div>
            </div>

            <div className="h-[350px] sm:h-[400px] bg-white rounded-xl p-3 border border-[#e5e9e7]">
              <canvas ref={canvasRef}></canvas>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Donut Chart */}
            <div className="bg-white/90 rounded-2xl border border-[#d0d8d2] shadow-lg p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Globe2 size={16} className="text-[#082721]" />
                  التوزيع السوقي
                </h3>
              </div>
              <div className="h-56 relative flex items-center justify-center bg-white rounded-lg border border-[#e5e9e7] p-3">
                <canvas ref={donutCanvasRef}></canvas>
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">السنة</span>
                  <span className="text-2xl font-black text-[#082721]">{countryYear || "-"}</span>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-[#082721]/10 to-[#ddbc6b]/5 border border-[#082721]/20 rounded-2xl p-4 flex gap-3 shadow-sm">
              <Info className="text-[#082721] shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">المصادر</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  البيانات مستندة لقواعد بيانات التجارة الخارجية للدول العربية لعام 2024
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Data Grid */}
        <section className="bg-white/60 rounded-2xl border border-[#d0d8d2] p-5 sm:p-6 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-[#082721]/10">
              <CalendarDays className="text-[#082721]" size={18} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">السجل التاريخي السنوي</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {yearlyUsdData
              .slice(0)
              .reverse()
              .map((row) => (
                <div
                  key={row.year}
                  className="bg-gradient-to-br from-white to-[#f9faf8] border border-[#d0d8d2] rounded-xl p-3 text-center hover:shadow-md hover:border-[#082721]/30 transition-all hover:-translate-y-0.5"
                >
                  <p className="text-xs text-slate-500 mb-1 font-bold uppercase">{row.year}</p>
                  <p className="text-sm sm:text-base font-black text-[#082721] tracking-tight">${Number(row.value).toLocaleString()}</p>
                  <p className="text-[9px] text-slate-400 font-bold mt-1">USD</p>
                </div>
              ))}
          </div>
        </section>
      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{
        __html: `
        select option {
          background-color: white;
          color: #1f2937;
        }
        select option:hover {
          background-color: #f3f4f6;
          color: #082721;
        }
      `,
      }}
      />
    </div>
  );
}
