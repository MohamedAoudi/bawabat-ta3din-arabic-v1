import React, { useContext } from "react";
import logo from "../assets/LOGO_ARAB MINING grand.svg";
import { LanguageContext } from "../App";

const Footer = () => {
  const { language } = useContext(LanguageContext);

  const TRANSLATIONS = {
    ar: {
      logoAlt: "بوابة المؤشرات التعدينية العربية",
      aboutTitle: "عن البوابة",
      aboutText: "منصة تحليلية متقدمة تهدف إلى توفير بيانات دقيقة حول قطاع التعدين في الوطن العربي لدعم المستثمرين وصناع القرار.",
      sitemapTitle: "وصول سريع",
      relatedTitle: "روابط هامة",
      home: "الرئيسية",
      indicators: "المؤشرات",
      countries: "الدول",
      sources: "المصادر",
      reports: "التقارير",
      about: "من نحن",
      apfm: "منصة APFM",
      library: "المكتبة الرقمية",
      contact: "اتصل بنا",
      protoVersion: "V1.0 Prototype",
      rights: "جميع الحقوق محفوظة",
    },
    fr: {
      logoAlt: "Portail des indicateurs miniers arabes",
      aboutTitle: "À Propos",
      aboutText: "Une plateforme analytique avancée dédiée aux données minières arabes, conçue pour les décideurs et investisseurs.",
      sitemapTitle: "Navigation",
      relatedTitle: "Liens Utiles",
      home: "Accueil",
      indicators: "Indicateurs",
      countries: "Pays",
      sources: "Sources",
      reports: "Rapports",
      about: "À propos",
      apfm: "Plateforme APFM",
      library: "Bibliothèque",
      contact: "Contact",
      protoVersion: "V1.0 Prototype",
      rights: "Tous droits réservés",
    },
    en: {
      logoAlt: "Arab Mining Indicators Portal",
      aboutTitle: "About Portal",
      aboutText: "An advanced analytical platform providing precise mining data across the Arab world for investors and decision-makers.",
      sitemapTitle: "Quick Links",
      relatedTitle: "Resources",
      home: "Home",
      indicators: "Indicators",
      countries: "Countries",
      sources: "Sources",
      reports: "Reports",
      about: "About Us",
      apfm: "APFM Platform",
      library: "Digital Library",
      contact: "Contact Us",
      protoVersion: "V1.0 Prototype",
      rights: "All rights reserved",
    },
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.ar;
  const isAr = language === "ar";

  const sitemapLinks = [
    { l: t.home, h: "/" },
    { l: t.indicators, h: "/m1" },
    { l: t.countries, h: "/countries" },
    { l: t.sources, h: "#" },
    { l: t.reports, h: "#" },
  ];

  const relatedLinks = [
    { l: t.apfm, h: "#" },
    { l: t.library, h: "#" },
    { l: t.contact, h: "#" },
  ];

  return (
    <>
      <style>{`
        .footer-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
          transition: all 0.3s ease;
        }
        .footer-link:hover {
          color: #C9A84C;
          transform: translateX(${isAr ? '-5px' : '5px'});
        }
        .footer-title {
          color: #C9A84C;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer-title::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(to ${isAr ? 'left' : 'right'}, rgba(201,168,76,0.3), transparent);
        }
      `}</style>

      <footer 
        dir={isAr ? "rtl" : "ltr"} 
        className="relative overflow-hidden border-t border-white/5"
        style={{ fontFamily: "'Cairo', sans-serif", backgroundColor: "#061a16" }}
      >
        {/* Barre de dégradé supérieure */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#8B2500] via-[#C9A84C] to-[#082721]" />

        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            
            {/* Section 1: Brand & About */}
            <div className="lg:col-span-5">
              <div className="mb-6 inline-block rounded-xl  p-3 shadow-lg shadow-black/20">
                <img src={logo} alt="Logo" className="h-18 w-auto object-contain" />
              </div>
              <h3 className="mb-4 text-lg font-bold text-white/90">{t.aboutTitle}</h3>
              <p className="max-w-md text-sm leading-relaxed text-white/50">
                {t.aboutText}
              </p>
            </div>

            {/* Section 2: Sitemap */}
            <div className="lg:col-span-3">
              <h4 className="footer-title">{t.sitemapTitle}</h4>
              <nav className="grid grid-cols-1 gap-3">
                {sitemapLinks.map((link) => (
                  <a key={link.l} href={link.h} className="footer-link">
                    <div className="h-1 w-1 rounded-full bg-[#C9A84C]/50" />
                    {link.l}
                  </a>
                ))}
              </nav>
            </div>

            {/* Section 3: Resources & Version */}
            <div className="lg:col-span-4">
              <h4 className="footer-title">{t.relatedTitle}</h4>
              <div className="mb-8 flex flex-col gap-3">
                {relatedLinks.map((link) => (
                  <a key={link.l} href={link.h} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-[#C9A84C]">
                    {link.l}
                  </a>
                ))}
              </div>

              {/* Prototype Badge */}
             
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="border-t border-white/5 bg-black/20 py-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-6 md:flex-row">
            <div className="text-[12px] text-white/30">
              © {new Date().getFullYear()} <span className="font-bold text-white/50">AIDSMO</span>. {t.rights}
            </div>
            
            
            

          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;