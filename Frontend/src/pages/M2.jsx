import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";

const series = [
  { year: 2010, val: 851 },
  { year: 2011, val: 881 },
  { year: 2012, val: 890 },
  { year: 2013, val: 913 },
  { year: 2014, val: 931 },
  { year: 2015, val: 961 },
  { year: 2016, val: 971 },
  { year: 2017, val: 981 },
  { year: 2018, val: 1011 },
  { year: 2019, val: 2183 },
  { year: 2020, val: 1568 },
  { year: 2021, val: 1167 },
  { year: 2022, val: 1574 },
  { year: 2023, val: 1561 },
  { year: 2024, val: 1600 },
];

function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function M2Page() {
  const [country, setCountry] = useState("مملكة البحرين");
  const [product, setProduct] = useState("الألمنيوم الأولي");
  const unitLabel = "ألف طن";

  const yearsRows = useMemo(
    () => series.filter((x) => x.year <= 2022),
    []
  );

  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const labels = series.map((x) => x.year);
    const values = series.map((x) => x.val);

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "الإنتاج",
            data: values,
            borderWidth: 3,
            tension: 0.18,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: false,
            borderColor: "rgba(37, 99, 235, 0.95)",
            pointBackgroundColor: "rgba(37, 99, 235, 0.95)",
            pointBorderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: "rgba(0,0,0,.08)" },
            ticks: { font: { family: "Cairo", weight: "700" } },
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
  }, []);

  return (
    <div className="bg-slate-100/80" dir="rtl">
      <Menu />
      <main className="min-h-screen py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 rounded-3xl bg-gradient-to-l from-sky-900 to-sky-600 px-6 py-8 text-center text-white shadow-lg">
          <h1 className="mb-2 text-2xl font-extrabold sm:text-3xl">
            تطور الانتاج التعديني
          </h1>
          <p className="text-sm text-slate-100/80">
            مخطط خطّي يعرض التطور عبر الزمن + ملخص سنوات + مصادر (Prototype)
          </p>
        </header>

        {/* Top filters */}
        <section className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/60">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm">
              <div className="mb-2 text-xs font-extrabold text-slate-500">
                الدولة
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-flag text-sky-900" />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border-none bg-transparent text-sm font-bold text-slate-700 outline-none focus:ring-0"
                >
                  <option>مملكة البحرين</option>
                  <option>المملكة المغربية</option>
                  <option>المملكة العربية السعودية</option>
                  <option>الجمهورية التونسية</option>
                  <option>جمهورية مصر العربية</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm">
              <div className="mb-2 text-xs font-extrabold text-slate-500">
                الخامة / المنتج
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-cubes-stacked text-sky-900" />
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full border-none bg-transparent text-sm font-bold text-slate-700 outline-none focus:ring-0"
                >
                  <option>الألمنيوم الأولي</option>
                  <option>الفوسفات</option>
                  <option>النحاس</option>
                  <option>الحديد</option>
                  <option>الذهب</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs font-semibold text-slate-500">
            عرض تجريبي: {country} — {product}
          </div>
        </section>

        {/* Main layout */}
        <section className="mt-4 grid gap-4 lg:grid-cols-12">
          {/* Chart */}
          <div className="lg:col-span-9">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-base font-extrabold text-slate-800">
                  منحنى التطور عبر الزمن
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-900">
                  <i className="fa-solid fa-chart-line" />
                  <span>وحدة الإنتاج: {unitLabel}</span>
                </div>
              </div>

              <div className="h-[320px] sm:h-[420px]">
                <canvas ref={canvasRef} />
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4 lg:col-span-3">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 text-sm font-extrabold text-slate-800">
                السنوات / الإنتاج
              </div>
              <div className="max-h-[260px] overflow-y-auto rounded-2xl border border-slate-100 bg-white">
                <table className="min-w-full text-xs">
                  <thead className="sticky top-0 bg-slate-50 text-[11px] font-extrabold text-sky-900">
                    <tr>
                      <th className="px-3 py-2">الإنتاج</th>
                      <th className="px-3 py-2">السنة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearsRows.map((r) => (
                      <tr
                        key={r.year}
                        className="border-t border-slate-100 text-slate-700"
                      >
                        <td className="px-3 py-1.5 font-bold">
                          {formatNumber(r.val)}
                        </td>
                        <td className="px-3 py-1.5">{r.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 text-sm font-extrabold text-slate-800">
                المصادر
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-xs">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-900" />
                  <div>
                    <div className="font-bold">وزارة الصناعة</div>
                    <div className="text-[11px] text-slate-500">
                      تقارير رسمية (Placeholder)
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
                    <div className="font-bold">USGS</div>
                    <div className="text-[11px] text-slate-500">
                      قاعدة بيانات عالمية (Placeholder)
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

