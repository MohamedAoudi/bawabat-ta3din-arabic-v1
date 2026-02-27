import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";

const years = [
  2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022,
  2023, 2024,
];

const seriesMap = {
  gold: {
    name: "الذهب",
    values: [251, 193, 177, 199, 194, 6, 6, 7, 129, 130, 133, 9, 9, 1, 36],
  },
  silver: {
    name: "الفضة",
    values: [52, 58, 61, 97, 101, 111, 124, 143, 129, 130, 133, 82, 79, 31, 36],
  },
  copper: {
    name: "النحاس",
    values: [20, 22, 24, 28, 26, 30, 33, 29, 35, 38, 41, 37, 34, 32, 30],
  },
  phosphate: {
    name: "الفوسفات",
    values: [90, 92, 95, 98, 100, 105, 110, 120, 115, 118, 116, 114, 117, 121, 123],
  },
  iron: {
    name: "الحديد",
    values: [70, 71, 75, 77, 80, 82, 85, 88, 90, 92, 93, 91, 94, 96, 98],
  },
  bauxite: {
    name: "البوكسيت",
    values: [10, 12, 13, 14, 16, 15, 18, 20, 22, 21, 23, 24, 25, 24, 26],
  },
  aluminum: {
    name: "الألمنيوم",
    values: [40, 42, 43, 45, 47, 48, 50, 52, 54, 55, 56, 58, 59, 60, 61],
  },
};

const mineralOptions = [
  { value: "gold", label: "الذهب" },
  { value: "silver", label: "الفضة" },
  { value: "copper", label: "النحاس" },
  { value: "phosphate", label: "الفوسفات" },
  { value: "iron", label: "الحديد" },
  { value: "bauxite", label: "البوكسيت" },
  { value: "aluminum", label: "الألمنيوم" },
];

function unitLabelFor(unit) {
  if (unit === "kg") return "كجم";
  if (unit === "ton") return "طن";
  return "ألف طن";
}

export default function M3Page() {
  const [unit, setUnit] = useState("kg");
  const [selected, setSelected] = useState(["gold", "silver"]);

  const selectedKeys = useMemo(() => {
    const keys = selected.filter((k) => seriesMap[k]);
    return keys.length ? keys : ["gold"];
  }, [selected]);

  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const palette = [
      "rgba(37, 99, 235, .85)", // blue
      "rgba(16, 185, 129, .85)", // emerald
      "rgba(245, 158, 11, .85)", // amber
      "rgba(168, 85, 247, .85)", // violet
      "rgba(239, 68, 68, .85)", // red
      "rgba(20, 184, 166, .85)", // teal
      "rgba(59, 130, 246, .65)", // light blue
    ];

    const datasets = selectedKeys.map((k, idx) => ({
      label: seriesMap[k].name,
      data: seriesMap[k].values,
      borderWidth: 0,
      borderRadius: 8,
      backgroundColor: palette[idx % palette.length],
    }));

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: { labels: years, datasets },
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
              label: (c) => ` ${c.dataset.label}: ${c.parsed.y}K`,
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
              callback: (v) => (v === 0 ? "0" : `${v}K`),
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
  }, [selectedKeys, unit]);

  const onMultiChange = (e) => {
    const values = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelected(values);
  };

  const removeSel = (key) => {
    setSelected((prev) => prev.filter((k) => k !== key));
  };

  return (
    <div className="bg-slate-100/80" dir="rtl">
      <Menu />
      <main className="min-h-screen py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 rounded-3xl bg-gradient-to-l from-sky-900 to-sky-600 px-6 py-8 text-center text-white shadow-lg">
          <h1 className="mb-2 text-2xl font-extrabold sm:text-3xl">
            تطور الإنتاج التعديني العربي
          </h1>
          <p className="text-sm text-slate-100/80">
            مقارنة زمنية (أعمدة) مع اختيار عدة خامات/منتجات + وحدة الإنتاج + مصادر
            (Prototype)
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-12">
          {/* Chart */}
          <div className="lg:col-span-9">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-base font-extrabold text-slate-800">
                  الإنتاج عبر السنوات (مقارنة العناصر المختارة)
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-900">
                  <i className="fa-solid fa-scale-balanced" />
                  وحدة الإنتاج:{" "}
                  <span className="font-extrabold">{unitLabelFor(unit)}</span>
                </span>
              </div>

              <div className="h-[340px] sm:h-[440px]">
                <canvas ref={canvasRef} />
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4 lg:col-span-3">
            <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
              <div className="mb-2 text-sm font-extrabold text-slate-800">
                التحكم
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 text-xs font-extrabold text-slate-500">
                    الخامة / المنتج (عدة اختيارات)
                  </div>
                  <select
                    multiple
                    size={7}
                    value={selectedKeys}
                    onChange={onMultiChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-sm font-bold text-slate-700 outline-none"
                  >
                    {mineralOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>

                  <div className="mt-2 text-xs leading-relaxed text-slate-500">
                    * Ctrl + كليك لاختيار عدة عناصر (Prototype).
                    <br />
                    لاحقًا يمكن استبدالها بـ Dropdown متعدد مثل Power BI.
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 text-xs font-extrabold text-slate-500">
                    وحدة الإنتاج
                  </div>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none"
                  >
                    <option value="kg">كجم</option>
                    <option value="ton">طن</option>
                    <option value="kton">ألف طن</option>
                  </select>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedKeys.map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-extrabold text-sky-900"
                    >
                      <i className="fa-solid fa-check" />
                      {seriesMap[k].name}
                      <button
                        type="button"
                        onClick={() => removeSel(k)}
                        className="ms-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-900/10 text-sky-900 hover:bg-sky-900/20"
                        aria-label={`Remove ${seriesMap[k].name}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
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
                    <div className="font-bold">
                      الجمهورية الجزائرية الديمقراطية الشعبية
                    </div>
                    <div className="text-[11px] text-slate-500">
                      الديوان/الوزارة (Placeholder)
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
                    <div className="font-bold">المملكة العربية السعودية</div>
                    <div className="text-[11px] text-slate-500">
                      Ma&apos;aden / تقارير (Placeholder)
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
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div>
                    <div className="font-bold">المملكة المغربية</div>
                    <div className="text-[11px] text-slate-500">
                      وزارة/مؤسسة (Placeholder)
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

