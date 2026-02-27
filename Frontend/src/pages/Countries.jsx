import React, { useState } from "react";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";

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
        className="bg-gradient-to-r from-[#005A8D] to-[#005A8D] text-white pt-12 pb-20 -mb-10 text-center"
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
              <span className="font-bold text-[#005A8D]">{selected}</span>
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-7 gap-y-8 gap-x-6">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setSelected(c.name)}
                className="group cursor-pointer text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005A8D]/60 rounded-xl"
              >
                <div className="w-24 h-24 mx-auto rounded-lg border-4 border-[#005A8D] shadow-[0_0_0_3px_rgba(0,90,141,0.35)] bg-white flex items-center justify-center transition-transform duration-150 group-hover:-translate-y-1 group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.18)]">
                  <div
                    className="w-[78px] h-[78px] rounded-md bg-cover bg-center bg-no-repeat shadow-[inset_0_0_0_2px_rgba(255,255,255,0.95),0_10px_18px_rgba(0,0,0,0.10)]"
                    style={{
                      backgroundImage: `url('https://flagcdn.com/w80/${c.code}.png')`,
                    }}
                  />
                </div>
                <p className="mt-3 font-extrabold text-sm text-[#005A8D]">
                  {c.name}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Quick info panel (static prototype) */}
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl bg-slate-50/90 p-6 shadow-lg shadow-slate-900/5 border border-slate-200/80">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
              كيف يمكن استخدام ملفات الدول؟
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed mb-3">
              تم تصميم ملفات الدول في البوابة لتكون مدخلًا سريعًا إلى أهم المؤشرات
              المتعلقة بالإنتاج التعديني، مع روابط إلى اللوحات التفصيلية والجداول
              القابلة للتنزيل في النسخ القادمة.
            </p>
            <ul className="mt-2 space-y-1 text-xs sm:text-sm text-slate-700 list-disc pr-5">
              <li>متابعة التطور الزمني للإنتاج على مستوى كل دولة.</li>
              <li>مقارنة مساهمة الدولة مع بقية الدول العربية في خام معيّن.</li>
              <li>استخدام الجداول والرسوم البيانية في التقارير الوطنية أو الإقليمية.</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-gradient-to-b from-[#005A8D] to-[#004366] p-5 text-white shadow-xl shadow-slate-900/30">
            <h3 className="text-base sm:text-lg font-extrabold mb-2">
              ملاحظة حول النسخة التجريبية
            </h3>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              يتم عرض هذه الواجهة حاليًا بشكل تجريبي لعرض شكل ملفات الدول وإمكانيات
              التصفية والتنقّل المقترحة. سيتم ربط كل دولة بلوحاتها ومؤشراتها التفصيلية
              في النسخ التشغيلية القادمة.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Countries;

