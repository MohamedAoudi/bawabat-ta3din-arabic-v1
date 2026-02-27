import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";

const donutByYear = {
  2016: {
    arab: 69000,
    world: 79000,
    table: [
      { c: "الإمارات العربية المتحدة", v: 34815 },
      { c: "مملكة البحرين", v: 18043 },
      { c: "المملكة العربية السعودية", v: 9692 },
      { c: "سلطنة عمان", v: 5431 },
      { c: "دولة قطر", v: 8854 },
      { c: "جمهورية مصر العربية", v: 2317 },
      { c: "الإجمالي", v: 79152 },
    ],
  },
  2017: {
    arab: 67000,
    world: 82000,
    table: [
      { c: "الإمارات العربية المتحدة", v: 34000 },
      { c: "مملكة البحرين", v: 18500 },
      { c: "المملكة العربية السعودية", v: 10200 },
      { c: "سلطنة عمان", v: 5600 },
      { c: "دولة قطر", v: 9100 },
      { c: "جمهورية مصر العربية", v: 2600 },
      { c: "الإجمالي", v: 80000 },
    ],
  },
  2018: {
    arab: 71000,
    world: 85000,
    table: [
      { c: "الإمارات العربية المتحدة", v: 35500 },
      { c: "مملكة البحرين", v: 19000 },
      { c: "المملكة العربية السعودية", v: 11000 },
      { c: "سلطنة عمان", v: 5900 },
      { c: "دولة قطر", v: 9400 },
      { c: "جمهورية مصر العربية", v: 2200 },
      { c: "الإجمالي", v: 83000 },
    ],
  },
  2019: {
    arab: 72000,
    world: 86000,
    table: [
      { c: "الإمارات العربية المتحدة", v: 36000 },
      { c: "مملكة البحرين", v: 19500 },
      { c: "المملكة العربية السعودية", v: 11200 },
      { c: "سلطنة عمان", v: 6000 },
      { c: "دولة قطر", v: 9500 },
      { c: "جمهورية مصر العربية", v: 2300 },
      { c: "الإجمالي", v: 84500 },
    ],
  },
  2020: {
    arab: 65000,
    world: 83000,
    table: [
      { c: "الإمارات العربية المتحدة", v: 32000 },
      { c: "مملكة البحرين", v: 17000 },
      { c: "المملكة العربية السعودية", v: 9800 },
      { c: "سلطنة عمان", v: 5200 },
      { c: "دولة قطر", v: 8200 },
      { c: "جمهورية مصر العربية", v: 2100 },
      { c: "الإجمالي", v: 74300 },
    ],
  },
  2021: {
    arab: 68000,
    world: 80000,
    table: [
      { c: "الإمارات العربية المتحدة", v: 33000 },
      { c: "مملكة البحرين", v: 17500 },
      { c: "المملكة العربية السعودية", v: 10000 },
      { c: "سلطنة عمان", v: 5400 },
      { c: "دولة قطر", v: 8500 },
      { c: "جمهورية مصر العربية", v: 2200 },
      { c: "الإجمالي", v: 76600 },
    ],
  },
};

const years = [2016, 2017, 2018, 2019, 2020, 2021];

function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function M4Page() {
  const [activeYear, setActiveYear] = useState(2021);
  const [product, setProduct] = useState("الألمنيوم الأولي");

  const pack = useMemo(
    () => donutByYear[activeYear] || donutByYear[2021],
    [activeYear]
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

    const { arab, world } = pack;
    const total = arab + world;
    const arabPct = total ? Math.round((arab / total) * 100) : 0;
    const worldPct = 100 - arabPct;

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["الإنتاج العربي", "الإنتاج العالمي"],
        datasets: [
          {
            data: [arab, world],
            borderWidth: 0,
            cutout: "68%",
            backgroundColor: ["rgba(37, 99, 235, .9)", "rgba(148, 163, 184, .8)"],
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
              label: (c) => {
                const v = c.parsed;
                const pct = c.dataIndex === 0 ? arabPct : worldPct;
                return ` ${c.label}: ${formatNumber(v)} (${pct}%)`;
              },
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
  }, [pack]);

  return (
    <div className="bg-slate-100/80" dir="rtl">
      <Menu />
      <main className="min-h-screen py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 rounded-3xl bg-gradient-to-l from-sky-900 to-sky-600 px-6 py-8 text-center text-white shadow-lg">
          <h1 className="mb-2 text-2xl font-extrabold sm:text-3xl">
            نسبة الإنتاج التعديني العربي من الإنتاج العالمي
          </h1>
          <p className="text-sm text-slate-100/80">
            مخطط حلقي (Donut) + اختيار المنتج والسنة + جدول الدول (Prototype)
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-12">
          {/* Donut */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-base font-extrabold text-slate-800">
                  المقارنة: الإنتاج العربي مقابل العالمي
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-900">
                  <i className="fa-solid fa-weight-hanging" />
                  وحدة: ألف طن
                </span>
              </div>

              <div className="flex h-[360px] items-center justify-center sm:h-[460px]">
                <div className="h-full w-full max-w-[520px]">
                  <canvas ref={canvasRef} />
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-3 text-sm font-extrabold text-slate-800">
                التحكم
              </div>

              <div className="mb-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="mb-2 text-xs font-extrabold text-slate-500">
                  الخامة / المنتج
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-cubes-stacked text-sky-900" />
                  <select
                    value={product}
                    onChange={(e) => {
                      setProduct(e.target.value);
                      // eslint-disable-next-line no-alert
                      alert("Prototype: تغيير المنتج — ربط البيانات لاحقًا.");
                    }}
                    className="w-full border-none bg-transparent text-sm font-bold text-slate-700 outline-none focus:ring-0"
                  >
                    <option>الألمنيوم الأولي</option>
                    <option>الفوسفات</option>
                    <option>النحاس</option>
                    <option>الذهب</option>
                  </select>
                </div>
              </div>

              <div className="mb-3 flex gap-2 overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50 px-2 py-2 shadow-sm">
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setActiveYear(y)}
                    className={`min-w-[56px] rounded-2xl border px-3 py-1 text-xs font-extrabold transition ${
                      y === activeYear
                        ? "border-sky-900 bg-sky-900 text-white"
                        : "border-transparent bg-white text-sky-900 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>

              <div className="mb-2 text-sm font-extrabold text-slate-800">
                Somme de الإنتاج حسب الدولة
              </div>

              <div className="max-h-[330px] overflow-y-auto rounded-2xl border border-slate-100 bg-white">
                <table className="min-w-full text-xs">
                  <thead className="sticky top-0 bg-slate-50 text-[11px] font-extrabold text-sky-900">
                    <tr>
                      <th className="px-3 py-2">الدولة</th>
                      <th className="px-3 py-2">Somme de الإنتاج</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pack.table.map((r) => (
                      <tr
                        key={r.c}
                        className="border-t border-slate-100 text-slate-700"
                      >
                        <td className="px-3 py-1.5 font-bold">{r.c}</td>
                        <td className="px-3 py-1.5">{formatNumber(r.v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

