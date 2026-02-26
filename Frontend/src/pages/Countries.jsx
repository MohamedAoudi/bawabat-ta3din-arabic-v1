import React, { useState } from "react";
import Menu from "../layouts/Menu";

const COUNTRIES = [
  { name: "الأردن", code: "jo" },
  { name: "الإمارات", code: "ae" },
  { name: "البحرين", code: "bh" },
  { name: "تونس", code: "tn" },
  { name: "الجزائر", code: "dz" },
  { name: "جيبوتي", code: "dj" },
  { name: "السعودية", code: "sa" },
  { name: "السودان", code: "sd" },
  { name: "سوريا", code: "sy" },
  { name: "الصومال", code: "so" },
  { name: "العراق", code: "iq" },
  { name: "عُمان", code: "om" },
  { name: "فلسطين", code: "ps" },
  { name: "قطر", code: "qa" },
  { name: "الكويت", code: "kw" },
  { name: "لبنان", code: "lb" },
  { name: "ليبيا", code: "ly" },
  { name: "مصر", code: "eg" },
  { name: "المغرب", code: "ma" },
  { name: "موريتانيا", code: "mr" },
  { name: "اليمن", code: "ye" },
];

const Countries = () => {
  const [selected, setSelected] = useState("—");

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-100 text-slate-800"
      style={{
        fontFamily:
          "'Cairo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        backgroundImage:
          "url('https://www.transparenttextures.com/patterns/cubes.png')",
      }}
    >
      <Menu />

      {/* Hero */}
      <header
        className="bg-gradient-to-r from-sky-900 to-sky-700 text-white pt-12 pb-20 -mb-10 text-center"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 85%, 0% 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="mb-3 text-4xl sm:text-5xl md:text-6xl font-extrabold">
            الدول العربية
          </h1>
          <p className="mx-auto max-w-4xl text-lg sm:text-xl text-white/80">
            واجهة الدول العربية (Prototype) — اختر دولة للوصول إلى ملفها
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14">
        <section className="bg-white/90 rounded-3xl shadow-xl backdrop-blur-sm border border-white/60 p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-0">
                الدول العربية
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                نفس أسلوب الشارات الدائرية كما في التصميم المرجعي
              </p>
            </div>
            <p className="text-slate-500 text-sm">
              الدولة المختارة:{" "}
              <span className="font-bold text-sky-800">{selected}</span>
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-7 gap-y-8 gap-x-6">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setSelected(c.name)}
                className="group cursor-pointer text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 rounded-xl"
              >
                <div className="w-24 h-24 mx-auto rounded-full border-4 border-emerald-500 shadow-[0_0_0_3px_#e74c3c] bg-white flex items-center justify-center transition-transform duration-150 group-hover:-translate-y-1">
                  <div
                    className="w-[78px] h-[78px] rounded-full bg-cover bg-center bg-no-repeat shadow-[inset_0_0_0_2px_rgba(255,255,255,0.95),0_10px_18px_rgba(0,0,0,0.10)]"
                    style={{
                      backgroundImage: `url('https://flagcdn.com/w80/${c.code}.png')`,
                    }}
                  />
                </div>
                <p className="mt-3 font-extrabold text-sm text-sky-900">
                  {c.name}
                </p>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Countries;

