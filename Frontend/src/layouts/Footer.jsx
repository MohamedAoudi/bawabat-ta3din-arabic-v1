import React from "react";
import logo from "../assets/logo 500x190 sans bg.png";

const Footer = () => {
  return (
    <footer className="mt-16 border-t-4 border-amber-400 bg-[#005A8D] text-slate-100" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="mb-6 flex items-center justify-center sm:justify-start">
          <img
            src={logo}
            alt="Arab Mining Indicators Portal"
            className="h-10 sm:h-12 w-auto object-contain rounded-full bg-white p-1 shadow-sm"
          />
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="mb-3 text-base font-extrabold text-white">
              عن بوابة المؤشرات التعدينية العربية
            </h3>
            <p className="text-sm leading-relaxed text-slate-100/90">
              بوابة تحليلية لبيانات الإنتاج التعديني العربي، تجمع بين المؤشرات
              والخرائط والتقارير لدعم صُنّاع القرار والباحثين والمستثمرين في قطاع
              الثروات المعدنية.
            </p>
          </div>

          {/* Sitemap */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-slate-100">خريطة البوابة</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <a href="index.html" className="transition hover:text-white">
                الرئيسية
              </a>
              <a href="m1.html" className="transition hover:text-white">
                المؤشرات التعدينية
              </a>
              <a href="countries.html" className="transition hover:text-white">
                الدول العربية
              </a>
              <a href="sources.html" className="transition hover:text-white">
                المصادر
              </a>
              <a href="reports.html" className="transition hover:text-white">
                التقارير
              </a>
              <a href="about.html" className="transition hover:text-white">
                عن البوابة
              </a>
            </div>
          </div>

          {/* Related links / contact */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-slate-100">روابط ذات صلة</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block transition hover:text-white">
                APFM (لاحقًا)
              </a>
              <a href="#" className="block transition hover:text-white">
                المكتبة (لاحقًا)
              </a>
              <a href="#" className="block transition hover:text-white">
                تواصل معنا (لاحقًا)
              </a>
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-200/90">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#004366] text-amber-300">
                  <i className="fa-solid fa-chart-column" />
                </span>
                <p>
                  نسخة أولية تجريبية <span className="text-amber-300">V1 Prototype</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-[#004366] pt-4 text-xs text-slate-200/80 sm:flex-row">
          <p>© AIDSMO — جميع الحقوق محفوظة</p>
          <p className="text-[11px]">
            تم تطوير هذه النسخة لأغراض العرض والتجربة الأولية للبوابة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

