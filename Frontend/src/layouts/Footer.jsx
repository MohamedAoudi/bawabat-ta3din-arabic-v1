import React, { useContext } from "react";
import logo from "../assets/LOGO_ARAB MINING grand.svg";
import { LanguageContext } from "../App";

const Footer = () => {
  const { language } = useContext(LanguageContext);

  const TRANSLATIONS = {
    ar: {
      logoAlt: "Arab Mining Indicators Portal",
      aboutTitle: "عن بوابة المؤشرات التعدينية العربية",
      aboutText:
        "بوابة تحليلية للبيانات التعدينية في الدول العربية، تجمع بين المؤشرات والتقارير ودعم صناع القرار والباحثين والمستثمرين في قطاع الثروات المعدنية",
      sitemapTitle: "خريطة البوابة",
      relatedTitle: "روابط ذات صلة",
      home: "الرئيسية",
      indicators: "المؤشرات التعدينية",
      countries: "الدول العربية",
      sources: "المصادر",
      reports: "التقارير",
      about: "عن البوابة",
      apfm: "APFM (لاحقا)",
      library: "المكتبة (لاحقا)",
      contact: "تواصل معنا (لاحقا)",
      protoTitle: "نسخة اولية تجريبية",
      protoVersion: "V1 - Prototype",
      rights: "جميع الحقوق محفوظة",
      developed: "تم تطوير هذه النسخة لاغراض العرض والتجربة الاولية للبوابة.",
      online: "Online",
    },
    fr: {
      logoAlt: "Portail des indicateurs miniers arabes",
      aboutTitle: "A propos du portail des indicateurs miniers arabes",
      aboutText:
        "Portail analytique des donnees minieres dans les pays arabes, combinant indicateurs et rapports pour soutenir decideurs, chercheurs et investisseurs.",
      sitemapTitle: "Plan du portail",
      relatedTitle: "Liens associes",
      home: "Accueil",
      indicators: "Indicateurs miniers",
      countries: "Pays arabes",
      sources: "Sources",
      reports: "Rapports",
      about: "A propos",
      apfm: "APFM (bientot)",
      library: "Bibliotheque (bientot)",
      contact: "Contact (bientot)",
      protoTitle: "Version prototype initiale",
      protoVersion: "V1 - Prototype",
      rights: "Tous droits reserves",
      developed: "Cette version a ete developpee pour demonstration et test initial du portail.",
      online: "En ligne",
    },
    en: {
      logoAlt: "Arab Mining Indicators Portal",
      aboutTitle: "About the Arab Mining Indicators Portal",
      aboutText:
        "Analytical portal for mining data across Arab countries, combining indicators and reports to support decision-makers, researchers, and investors.",
      sitemapTitle: "Portal map",
      relatedTitle: "Related links",
      home: "Home",
      indicators: "Mining indicators",
      countries: "Arab countries",
      sources: "Sources",
      reports: "Reports",
      about: "About",
      apfm: "APFM (soon)",
      library: "Library (soon)",
      contact: "Contact us (soon)",
      protoTitle: "Early prototype version",
      protoVersion: "V1 - Prototype",
      rights: "All rights reserved",
      developed: "This version was developed for showcase and early portal testing.",
      online: "Online",
    },
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;

  const sitemapLinks = [
    { l: t.home, h: "/" },
    { l: t.indicators, h: "/m1" },
    { l: t.countries, h: "/countries" },
    { l: t.sources, h: "sources.html" },
    { l: t.reports, h: "reports.html" },
    { l: t.about, h: "/about" },
  ];

  const relatedLinks = [
    { l: t.apfm, h: "#" },
    { l: t.library, h: "#" },
    { l: t.contact, h: "#" },
  ];

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
        dir={language === "ar" ? "rtl" : "ltr"}
        lang={language}
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
                alt={t.logoAlt}
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
                <p className="ft-col-title">{t.aboutTitle}</p>
                <p className="text-[13.5px] leading-7 text-white/55">
                  {t.aboutText}
                </p>
              </div>

              {/* Sitemap */}
              <div>
                <p className="ft-col-title">{t.sitemapTitle}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {sitemapLinks.map(({ l, h }) => (
                    <a key={l} href={h} className="ft-link" dir="ltr">
                      <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                      <span dir={language === "ar" ? "rtl" : "ltr"}>{l}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Related links */}
              <div>
                <p className="ft-col-title">{t.relatedTitle}</p>
                <div className="space-y-3">
                  {relatedLinks.map(({ l, h }) => (
                    <a key={l} href={h} className="ft-link block" dir="ltr">
                      <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                      <span dir={language === "ar" ? "rtl" : "ltr"}>{l}</span>
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
                      <p className="text-[12px] font-bold text-white/80">{t.protoTitle}</p>
                      <p className="text-[11px] font-mono" style={{ color: "rgba(201,168,76,0.65)" }}>{t.protoVersion}</p>
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
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            <p className="text-[12px] text-white/30">
              © AIDSMO {new Date().getFullYear()} - {t.rights}
            </p>
            <p className="text-[11px] text-white/25 text-center">
              {t.developed}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-white/25">{t.online}</span>
            </div>
          </div>
        </div>

      </footer>
    </>
  );
};

export default Footer;