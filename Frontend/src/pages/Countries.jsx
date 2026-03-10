import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import { dataByMineral, mineralUnits } from "./M1";

// Import all flag files dynamically from the flags folder
const flagModules = import.meta.glob("../assets/flags/*.webp", { eager: true });

// Create a mapping of country codes to flag URLs
const getCountryFlags = () => {
  const flags = {};
  const countryCodeMap = {
    "jordan.webp": "jo",
    "uae.webp": "ae",
    "bahrain.webp": "bh",
    "tunisia.webp": "tn",
    "algeria.webp": "dz",
    "djibouti.webp": "dj",
    "saudiarabe.webp": "sa",
    "sudan.webp": "sd",
    "syria.webp": "sy",
    "somalia.webp": "so",
    "iraq.webp": "iq",
    "oman.webp": "om",
    "palestine.webp": "ps",
    "qatar.webp": "qa",
    "kuwait.webp": "kw",
    "lebanon.webp": "lb",
    "libya.webp": "ly",
    "egypt.webp": "eg",
    "morocco.webp": "ma",
    "mauritania.webp": "mr",
    "yemen.webp": "ye",
  };

  Object.entries(flagModules).forEach(([path, module]) => {
    const filename = path.split("/").pop();
    const countryCode = countryCodeMap[filename];
    if (countryCode) {
      flags[countryCode] = module.default;
    }
  });

  return flags;
};

const countryFlags = getCountryFlags();


const COUNTRIES = [
  { name: 'المملكة الأردنية الهاشمية', code: "jo" },
  { name: 'دولة الامارات العربية المتحدة', code: "ae" },
  { name: 'مملكة البحرين', code: "bh" },
  { name: 'الجمهورية التونسية', code: "tn" },
  { name: 'الجمهورية الجزائرية الديمقراطية الشعبية', code: "dz" },
  { name: 'دولة جيبوتي', code: "dj" },
  { name: 'المملكة العربية السعودية', code: "sa" },
  { name: 'جمهورية السودان', code: "sd" },
  { name: 'الجمهورية العربية السورية', code: "sy" },
  { name: 'جمهورية الصومال', code: "so" },
  { name: 'جمهورية العراق', code: "iq" },
  { name: 'سلطنة عمان', code: "om" },
  { name: 'دولة فلسطين', code: "ps" },
  { name: 'دولة قطر', code: "qa" },
  { name: 'دولة الكويت', code: "kw" },
  { name: 'الجمهورية اللبنانية', code: "lb" },
  { name: 'دولة ليبيا', code: "ly" },
  { name: 'جمهورية مصر العربية', code: "eg" },
  { name: 'المملكة المغربية', code: "ma" },
  { name: 'الجمهورية الإسلامية الموريتانية', code: "mr" },
  { name: 'الجمهورية اليمنية', code: "ye" },
];

const getCountryMineralData = (country) => {
  const years = Array.from(
    new Set(
      Object.values(dataByMineral)
        .flatMap((byYear) => Object.keys(byYear))
        .map(Number)
    )
  ).sort((a, b) => a - b);

  const minerals = Object.keys(dataByMineral);

  const chartData = minerals.map((mineral) => {
    const values = years.map((year) => {
      const row = (dataByMineral[mineral][year] || []).find(
        (r) => r.country === country
      );
      return row ? row.value : null;
    });

    return {
      mineral,
      values,
    };
  });

  return { years, chartData };
};


const CountryChart = ({ country }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (chartRef.current) chartRef.current.destroy();

    const { years, chartData } = getCountryMineralData(country);

    const palette = [
      "#082721",
      "#ddbc6b",
      "#10b981",
      "#3b82f6",
      "#f59e0b",
      "#8b5cf6",
      "#ef4444",
    ];

    const datasets = chartData.map((entry, i) => ({
      label: entry.mineral,
      data: entry.values,
      borderColor: palette[i % palette.length],
      backgroundColor: palette[i % palette.length] + "22",
      borderWidth: 2,
      spanGaps: true,
      tension: 0.35,
      pointRadius: 3,
    }));

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: years,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: { family: "Cairo", size: 11 }, boxWidth: 12 },
          },
          tooltip: {
            callbacks: {
              label: (c) => {
                const mineral = c.dataset.label;
                const unit = mineralUnits[mineral] || "";
                return ` ${mineral}: ${c.parsed.y ?? 0} ${unit}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "Cairo", weight: "700" } },
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
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [country]);

  return (
    <div className="rounded-3xl bg-white/95 p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/70">
      <h3 className="mb-2 text-base font-extrabold text-slate-800">
        عرض البيانات — {country}
      </h3>
      <div className="h-[360px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

const Countries = () => {
  const [selected, setSelected] = useState("—");

  const handleSelect = (name) => {
    setSelected(name);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen text-slate-800"
      style={{
        fontFamily:
          "'Cairo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <Menu />
      {/* Hero */}
      <header
        className="bg-gradient-to-r from-[#082721] to-[#051712] text-white pt-12 pb-20 -mb-10 text-center"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 85%, 0% 100%)",
        }}
      >
       
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 space-y-8">
        <section className="bg-white/95 rounded-3xl shadow-xl shadow-slate-900/10 border border-slate-200/70 p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-0">
                الدول العربية
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                اختر دولة للاطلاع على ملخص سريع لبياناتها التعدينية (واجهة تجريبية).
              </p>
            </div>
            <p className="text-slate-500 text-sm">
              الدولة المختارة:{" "}
              <span className="font-bold text-[#082721]">{selected}</span>
            </p>
          </div>

          <section className="reveal d4 mt-10">
  <div className="rounded-2xl bg-white p-5 shadow-lg shadow-slate-900/10 border border-slate-100">
    {/* En-tête de la section */}
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h5 className="m-0 text-base font-bold text-slate-800">
          الدول العربية
        </h5>
        <p className="mt-1 text-sm text-slate-500">
          اختر دولة بسرعة للوصول إلى ملفها (واجهة تجريبية)
        </p>
      </div>
      <a
        href="countries.html"
        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721] shadow-sm shadow-slate-900/10 ring-1 ring-[#082721]/40 hover:bg-slate-50 transition-colors"
      >
        <i className="fa-solid fa-arrow-left" />
        <span>المزيد</span>
      </a>
    </div>

    {/* Grille des drapeaux */}
    <div className="grid gap-y-6 gap-x-4 sm:gap-x-5 md:gap-x-6 lg:gap-x-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
      {COUNTRIES.map((c) => (
        <button
          key={c.code}
          type="button"
          className="group flex flex-col items-center text-center transition-transform hover:-translate-y-1 focus:outline-none"
          onClick={() => handleSelect(c.name)}
        >
          {/* Conteneur du drapeau (Format rectangulaire 28x16) */}
          <div className="relative flex h-16 w-28 items-center justify-center overflow-hidden rounded-md bg-slate-50 shadow-sm ring-1 ring-slate-200 group-hover:ring-[#082721]/30 transition-all">
            <img
              src={countryFlags[c.code]}
              alt={c.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          {/* Nom du pays */}
          <p className="mt-2 text-sm font-bold text-[#082721] group-hover:text-emerald-900">
            {c.name}
          </p>
        </button>
      ))}
    </div>

    {/* État de la sélection (Optionnel) */}
    {selected && (
      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          الدولة المختارة:{" "}
          <span className="font-bold text-[#082721] bg-emerald-50 px-2 py-1 rounded">
            {selected}
          </span>
        </p>
      </div>
    )}
  </div>
</section>
        </section>

        {/* Quick info panel (static prototype) */}
   

        {selected !== "—" && <CountryChart country={selected} />}
      </main>

      <Footer />
    </div>
  );
};

export default Countries;

