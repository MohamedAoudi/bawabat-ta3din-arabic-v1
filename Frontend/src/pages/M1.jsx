import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";

const dataByYear = {
  2022: [
    { country: "المملكة المغربية", value: 39000000 },
    { country: "المملكة العربية السعودية", value: 10844000 },
    { country: "جمهورية مصر العربية", value: 5000000 },
    { country: "الجمهورية التونسية", value: 3560000 },
    { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 1800000 },
    { country: "الجمهورية العراقية", value: 1100000 },
    { country: "الجمهورية العربية السورية", value: 500000 },
    { country: "المملكة الأردنية الهاشمية", value: 1125000 },
  ],
  2021: [
    { country: "المملكة المغربية", value: 37000000 },
    { country: "المملكة العربية السعودية", value: 9800000 },
    { country: "جمهورية مصر العربية", value: 4300000 },
    { country: "الجمهورية التونسية", value: 3100000 },
    { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 1600000 },
    { country: "الجمهورية العراقية", value: 950000 },
    { country: "المملكة الأردنية الهاشمية", value: 1050000 },
  ],
  2020: [
    { country: "المملكة المغربية", value: 36000000 },
    { country: "المملكة العربية السعودية", value: 9200000 },
    { country: "جمهورية مصر العربية", value: 4100000 },
    { country: "الجمهورية التونسية", value: 2800000 },
    { country: "الجمهورية الجزائرية الديمقراطية الشعبية", value: 1400000 },
    { country: "المملكة الأردنية الهاشمية", value: 900000 },
  ],
};

const years = Array.from({ length: 2024 - 2010 + 1 }, (_, i) => 2010 + i);

function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function M1Page() {
  const [activeYear, setActiveYear] = useState(2022);
  const [search, setSearch] = useState("");

  const baseRows = useMemo(() => {
    const rows = dataByYear[activeYear] || [];
    return [...rows].sort((a, b) => b.value - a.value);
  }, [activeYear]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return baseRows;
    return baseRows.filter((r) => r.country.includes(search.trim()));
  }, [baseRows, search]);

  const chartCanvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const ctx = chartCanvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = baseRows.map((r) => r.country);
    const values = baseRows.map((r) => r.value);

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "الإنتاج",
            data: values,
            backgroundColor: "rgba(37, 99, 235, 0.8)",
            borderRadius: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${formatNumber(ctx.parsed.y)} طن`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              font: { family: "Cairo", weight: "700" },
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,.08)" },
            ticks: {
              font: { family: "Cairo" },
              callback: (v) => {
                if (v >= 1_000_000) return `${v / 1_000_000}M`;
                if (v >= 1_000) return `${v / 1_000}K`;
                return v;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [baseRows]);

  const handleRefresh = () => {
    // Placeholder to mimic original behavior
    // Re-triggers chart & table render via state updates if needed
    // eslint-disable-next-line no-alert
    alert("تحديث (Prototype) — ربط البيانات الحقيقية لاحقًا.");
  };

  return (
    <div className="bg-slate-100/80" dir="rtl">
      <Menu />
      <main className="min-h-screen py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 rounded-3xl bg-gradient-to-l from-sky-900 to-sky-600 px-6 py-8 text-center text-white shadow-lg">
          <h1 className="mb-2 text-2xl font-extrabold sm:text-3xl">
            حجم الإنتاج التعديني
          </h1>
          <p className="text-sm text-slate-100/80">
            لوحة تفاعلية (Prototype) بنفس منطق Power BI: سنوات + فلاتر + رسوم +
            جداول
          </p>
        </header>

        {/* Year bar + filters */}
        <section className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/60">
          <div className="mb-3 flex gap-2 overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50 px-2 py-2 shadow-sm">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setActiveYear(y)}
                className={`yearbtn inline-flex items-center rounded-2xl border px-3 py-1 text-xs font-extrabold transition ${
                  y === activeYear
                    ? "border-sky-900 bg-sky-900 text-white shadow-sm"
                    : "border-transparent bg-white text-sky-900 hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                {y}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
              <i className="fa-solid fa-cubes-stacked text-sky-900" />
              <select className="w-full border-none bg-transparent text-sm font-bold text-slate-700 outline-none focus:ring-0">
                <option value="phosphate">صخر الفوسفات</option>
                <option value="gold">الذهب</option>
                <option value="copper">النحاس</option>
                <option value="iron">الحديد</option>
              </select>
            </div>

            <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
              <i className="fa-solid fa-scale-balanced text-sky-900" />
              <select className="w-full border-none bg-transparent text-sm font-bold text-slate-700 outline-none focus:ring-0">
                <option value="ton">وحدة الإنتاج: طن</option>
                <option value="kton">وحدة الإنتاج: ألف طن</option>
                <option value="mton">وحدة الإنتاج: مليون طن</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-900 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-amber-500"
            >
              <i className="fa-solid fa-rotate" />
              تحديث
            </button>
          </div>
        </section>

        {/* Main layout */}
        <section className="mt-4 grid gap-4 lg:grid-cols-12">
          {/* Chart */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-extrabold text-slate-800">
                  الإنتاج حسب الدولة
                </h3>
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-900">
                  <i className="fa-solid fa-calendar-days" />
                  <span>السنة: {activeYear}</span>
                </div>
              </div>
              <div className="mt-1 h-[320px] sm:h-[360px]">
                <canvas ref={chartCanvasRef} />
              </div>
            </div>
          </div>

          {/* Right panels */}
          <div className="space-y-4 lg:col-span-4">
            {/* Production table */}
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="panel-title text-sm font-extrabold text-slate-800">
                  الإنتاج حسب الدولة
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-extrabold text-amber-900">
                  <i className="fa-solid fa-arrow-down-wide-short" />
                  ترتيب
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="mb-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                  <i className="fa-solid fa-magnifying-glass text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="بحث داخل الدول..."
                    className="w-full border-none bg-transparent text-xs font-bold text-slate-700 outline-none focus:ring-0"
                  />
                </div>

                <div className="max-h-72 overflow-y-auto rounded-xl bg-white">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-extrabold text-sky-900">
                      <tr>
                        <th className="px-3 py-2">الدولة</th>
                        <th className="px-3 py-2">الإنتاج</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((r) => (
                        <tr
                          key={r.country}
                          className="border-t border-slate-100 text-xs text-slate-700"
                        >
                          <td className="px-3 py-1.5 font-bold">{r.country}</td>
                          <td className="px-3 py-1.5">
                            {formatNumber(r.value)}
                          </td>
                        </tr>
                      ))}
                      {filteredRows.length === 0 && (
                        <tr>
                          <td
                            colSpan={2}
                            className="px-3 py-3 text-center text-xs text-slate-400"
                          >
                            لا توجد نتائج مطابقة.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sources */}
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <h3 className="mb-2 text-sm font-extrabold text-slate-800">
                المصادر
              </h3>
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-xs">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-900" />
                  <div>
                    <div className="font-bold">المملكة المغربية</div>
                    <div className="text-[11px] text-slate-500">
                      شركة مناجم الفوسفات (Placeholder)
                    </div>
                    <button
                      type="button"
                      className="mt-1 text-[11px] font-bold text-sky-800 underline"
                    >
                      رابط المصدر
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-xs">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <div className="font-bold">الجمهورية التونسية</div>
                    <div className="text-[11px] text-slate-500">
                      وزارة الطاقة/مؤسسة (Placeholder)
                    </div>
                    <button
                      type="button"
                      className="mt-1 text-[11px] font-bold text-sky-800 underline"
                    >
                      رابط المصدر
                    </button>
                  </div>
                </div>
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

