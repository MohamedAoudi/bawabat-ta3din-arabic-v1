import { useEffect, useMemo, useRef, useState } from "react";
import { Scale, Weight, Globe2, Pickaxe, TrendingUp, Info } from "lucide-react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import {
  tradeCriticalMineralsImportData,
  tradeCriticalMineralsImportByYear,
} from "../tradeCriticalMineralsImportDataProcessed";

const COUNTRIES = [
  { name: "الأردن", code: "jo" }, { name: "الإمارات", code: "ae" }, { name: "البحرين", code: "bh" },
  { name: "تونس", code: "tn" }, { name: "الجزائر", code: "dz" }, { name: "جيبوتي", code: "dj" },
  { name: "السعودية", code: "sa" }, { name: "السودان", code: "sd" }, { name: "سوريا", code: "sy" },
  { name: "الصومال", code: "so" }, { name: "العراق", code: "iq" }, { name: "عمان", code: "om" },
  { name: "فلسطين", code: "ps" }, { name: "قطر", code: "qa" }, { name: "الكويت", code: "kw" },
  { name: "لبنان", code: "lb" }, { name: "ليبيا", code: "ly" }, { name: "مصر", code: "eg" },
  { name: "المغرب", code: "ma" }, { name: "موريتانيا", code: "mr" }, { name: "اليمن", code: "ye" },
];

const mineralNameAr = {
  Gold: "الذهب", Tin: "القصدير", Silver: "الفضة", Uranium: "اليورانيوم",
  Copper: "النحاس", Iron: "الحديد", Lead: "الرصاص", Zinc: "الزنك",
  Nickel: "النيكل", Lithium: "الليثيوم", Cobalt: "الكوبالت",
};

const countryNameAr = Object.fromEntries(COUNTRIES.map(c => [c.code, c.name]));
const formatUsd = (val) => new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 2 }).format(val || 0);
const formatFullUsd = (val) => Number(val || 0).toLocaleString("ar-MA");

export default function M6Page() {
  const [selectedCountry, setSelectedCountry] = useState("ma");
  const [selectedMineral, setSelectedMineral] = useState("all");
  const [countryYear, setCountryYear] = useState(null);

  // -- Data Processing (Logic remains same for consistency) --
  const mineralOptions = useMemo(() => ["all", ...new Set(tradeCriticalMineralsImportData.map(r => r.aggregate_product))].sort(), []);
  
  const productYearlyData = useMemo(() => {
    if (selectedMineral === "all") return tradeCriticalMineralsImportByYear;
    return tradeCriticalMineralsImportData.filter(r => r.aggregate_product === selectedMineral)
      .reduce((acc, r) => { acc[r.year] = (acc[r.year] || 0) + (r.value_usd || 0); return acc; }, {});
  }, [selectedMineral]);

  const yearlyUsdData = useMemo(() => Object.entries(productYearlyData).map(([year, value]) => ({ year: Number(year), value })).sort((a, b) => a.year - b.year), [productYearlyData]);
  const totalUsd = useMemo(() => yearlyUsdData.reduce((sum, item) => sum + item.value, 0), [yearlyUsdData]);
  
  useEffect(() => {
    if (!countryYear && yearlyUsdData.length > 0) setCountryYear(yearlyUsdData[yearlyUsdData.length - 1].year);
  }, [yearlyUsdData]);

  // -- Charts Refs --
  const mainChartRef = useRef(null);
  const donutChartRef = useRef(null);
  const canvasRef = useRef(null);
  const donutCanvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (mainChartRef.current) mainChartRef.current.destroy();

    mainChartRef.current = new Chart(ctx, {
      type: 'line', // Changed to Line for a more "modern" trend feel
      data: {
        labels: yearlyUsdData.map(d => d.year),
        datasets: [{
          label: 'قيمة الواردات',
          data: yearlyUsdData.map(d => d.value),
          borderColor: '#ddbc6b',
          backgroundColor: 'rgba(221, 188, 107, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#082721'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { ticks: { callback: v => formatUsd(v) } } }
      }
    });
  }, [yearlyUsdData]);

  return (
    <div dir="rtl" className="bg-[#f8fafc] min-h-screen font-['Cairo']">
      <Menu />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#082721] flex items-center gap-3">
              <Pickaxe className="text-[#ddbc6b]" size={32} />
              بوابة الواردات التعدينية
            </h1>
            <p className="text-slate-500 mt-1">تحليل البيانات الجمركية للمواد الخام في العالم العربي</p>
          </div>
          
          <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-200 gap-2">
            <select 
              value={selectedCountry} 
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 ring-[#ddbc6b]"
            >
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
            <select 
              value={selectedMineral} 
              onChange={(e) => setSelectedMineral(e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 ring-[#ddbc6b]"
            >
              {mineralOptions.map(m => <option key={m} value={m}>{mineralNameAr[m] || "كل المعادن"}</option>)}
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#082721] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-emerald-200/70 text-sm font-bold">إجمالي الواردات (تراكمي)</p>
              <h3 className="text-3xl font-black mt-2">{formatUsd(totalUsd)} <span className="text-sm font-normal">دولار</span></h3>
            </div>
            <TrendingUp className="absolute -bottom-4 -left-4 w-24 h-24 text-white/5" />
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-bold">المعدن الأكثر استيراداً</p>
            <h3 className="text-2xl font-black text-[#082721] mt-2">الذهب <span className="text-[#ddbc6b] text-sm">أولوية عالية</span></h3>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-bold">تغطية البيانات</p>
            <h3 className="text-2xl font-black text-[#082721] mt-2">2014 - 2024</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-[#082721]">تطور قيمة الواردات عبر السنوات</h3>
              <div className="flex items-center gap-2 text-xs font-bold bg-slate-100 px-3 py-1 rounded-full">
                <Info size={14} /> بالدولار الأمريكي
              </div>
            </div>
            <div className="h-[400px]">
              <canvas ref={canvasRef}></canvas>
            </div>
          </div>

          {/* Side Details */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#ddbc6b]/10 p-6 rounded-[2rem] border border-[#ddbc6b]/20">
              <h3 className="font-bold text-[#082721] mb-4 flex items-center gap-2">
                <Globe2 size={20} /> تفاصيل الدولة
              </h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <p className="text-xs text-slate-500 mb-1">الدولة المختارة</p>
                  <p className="font-black text-[#082721]">{countryNameAr[selectedCountry]}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <p className="text-xs text-slate-500 mb-1">السنة المحددة</p>
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {yearlyUsdData.slice(-5).map(d => (
                      <button 
                        key={d.year}
                        onClick={() => setCountryYear(d.year)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${countryYear === d.year ? 'bg-[#082721] text-white' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {d.year}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
              <h3 className="font-bold text-[#082721] mb-4">التوزيع النسبي</h3>
              <div className="h-[200px] relative">
                <canvas ref={donutCanvasRef}></canvas>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <p className="text-[10px] font-bold text-slate-400">100%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="mt-8 bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-[#082721]">جدول البيانات التفصيلي</h3>
            <button className="text-xs font-bold text-sky-600 hover:underline">تصدير CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">العام</th>
                  <th className="px-6 py-4">المعدن</th>
                  <th className="px-6 py-4">القيمة الاستيرادية</th>
                  <th className="px-6 py-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {yearlyUsdData.slice(0, 5).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{row.year}</td>
                    <td className="px-6 py-4 text-slate-600">{mineralNameAr[selectedMineral] || "إجمالي المواد"}</td>
                    <td className="px-6 py-4 font-mono font-bold text-[#082721]">{formatFullUsd(row.value)} $</td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-bold">مكتمل</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}