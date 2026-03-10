import React from "react";
import logo from "../assets/LOGO_ARAB MINING grand.svg";

const Footer = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        .ft-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: rgba(255,255,255,0.65);
          font-size: 13.5px;
          font-weight: 600;
          transition: color .2s;
        }
        .ft-link:hover { color: #C9A84C; }
        .ft-link::after {
          content: '';
          position: absolute;
          bottom: -1px; right: 0;
          height: 1px; width: 0;
          background: #C9A84C;
          border-radius: 1px;
          transition: width .25s ease;
        }
        .ft-link:hover::after { width: 100%; }

        .ft-col-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: rgba(201,168,76,0.7);
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(201,168,76,0.18);
          margin-bottom: 14px;
        }
      `}</style>

      <footer
        dir="rtl"
        style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}
      >
        {/* ── top gold bar — identical to Menu ───────────────────────────── */}
        <div style={{ height: 3, background: "linear-gradient(90deg,#8B2500,#C9A84C 50%,#082721)" }} />

        {/* ── main body ──────────────────────────────────────────────────── */}
        <div style={{ background: "linear-gradient(180deg,#0d3b33 0%,#082721 100%)" }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-10 sm:py-12">

            {/* Logo */}
            <div className="mb-8 flex items-center justify-center sm:justify-start">
                          <div className="rounded-full bg-white px-4 ">

              <img
                src={logo}
                alt="Arab Mining Indicators Portal"
                className="h-[60px] w-auto object-contain"
                style={{ filter: "drop-shadow(0 1px 8px rgba(201,168,76,0.3))" }}
              />
              </div>
            </div>

            {/* 3-col grid — same structure as original */}
            <div className="grid gap-10 md:grid-cols-3"
                 style={{ paddingTop: 20, borderTop: "1px solid rgba(201,168,76,0.18)" }}>

              {/* About */}
              <div>
                <p className="ft-col-title">عن بوابة المؤشرات التعدينية العربية</p>
                <p className="text-[13.5px] leading-7 text-white/55">
                  بوابة تحليلية لبيانات الإنتاج التعديني العربي، تجمع بين المؤشرات
                  والخرائط والتقارير لدعم صُنّاع القرار والباحثين والمستثمرين في قطاع
                  الثروات المعدنية.
                </p>
              </div>

              {/* Sitemap */}
              <div>
                <p className="ft-col-title">خريطة البوابة</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { l: "الرئيسية",           h: "/" },
                    { l: "المؤشرات التعدينية", h: "/m1" },
                    { l: "الدول العربية",      h: "/countries" },
                    { l: "المصادر",            h: "sources.html" },
                    { l: "التقارير",           h: "reports.html" },
                    { l: "عن البوابة",         h: "/about" },
                  ].map(({ l, h }) => (
                    <a key={l} href={h} className="ft-link" dir="ltr">
                      <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                      <span dir="rtl">{l}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Related links */}
              <div>
                <p className="ft-col-title">روابط ذات صلة</p>
                <div className="space-y-3">
                  {[
                    { l: "APFM (لاحقًا)",      h: "#" },
                    { l: "المكتبة (لاحقًا)",   h: "#" },
                    { l: "تواصل معنا (لاحقًا)", h: "#" },
                  ].map(({ l, h }) => (
                    <a key={l} href={h} className="ft-link block" dir="ltr">
                      <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                      <span dir="rtl">{l}</span>
                    </a>
                  ))}

                  {/* version badge — same card style as menu dropdown panels */}
                  <div
                    className="mt-5 flex items-center gap-3 rounded-2xl px-4 py-3"
                    style={{
                      background: "linear-gradient(145deg,#0d3b33,#082721)",
                      border: "1px solid rgba(201,168,76,0.25)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    {/* icon circle — same gold gradient as "التقارير الذكية" CTA */}
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)",
                        boxShadow: "0 2px 10px rgba(201,168,76,0.35)",
                      }}
                    >
                      <svg className="w-4 h-4 text-[#082721]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-white/80">نسخة أولية تجريبية</p>
                      <p className="text-[11px] font-mono" style={{ color: "rgba(201,168,76,0.65)" }}>V1 · Prototype</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── bottom bar — same darker tone as scrolled nav ───────────────── */}
        <div style={{ background: "#051712", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
          <div
            className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-4
                        flex flex-col sm:flex-row items-center justify-between gap-2"
            dir="rtl"
          >
            <p className="text-[12px] text-white/30">
              © AIDSMO {new Date().getFullYear()} — جميع الحقوق محفوظة
            </p>
            <p className="text-[11px] text-white/25 text-center">
              تم تطوير هذه النسخة لأغراض العرض والتجربة الأولية للبوابة.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-white/25">Online</span>
            </div>
          </div>
        </div>

      </footer>
    </>
  );
};

export default Footer;