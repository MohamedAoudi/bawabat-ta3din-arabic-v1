import { useState, useEffect } from "react";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import i7 from "../assets/i-7.png";
import bgHeaderVideo from "../assets/bg header.mp4";
import flagJordan from "../assets/flags/jordan.webp";
import flagUae from "../assets/flags/uae.webp";
import flagBahrain from "../assets/flags/bahrain.webp";
import flagTunisia from "../assets/flags/tunisia.webp";
import flagAlgeria from "../assets/flags/algeria.webp";
import flagDjibouti from "../assets/flags/djibouti.webp";
import flagSaudi from "../assets/flags/saudiarabe.webp";
import flagSudan from "../assets/flags/sudan.webp";
import flagSyria from "../assets/flags/syria.webp";
import flagSomalia from "../assets/flags/somalia.webp";
import flagIraq from "../assets/flags/iraq.webp";
import flagOman from "../assets/flags/oman.webp";
import flagPalestine from "../assets/flags/palestine.webp";
import flagQatar from "../assets/flags/qatar.webp";
import flagKuwait from "../assets/flags/kuwait.webp";
import flagLebanon from "../assets/flags/lebanon.webp";
import flagLibya from "../assets/flags/libya.webp";
import flagEgypt from "../assets/flags/egypt.webp";
import flagMorocco from "../assets/flags/morocco.webp";
import flagMauritania from "../assets/flags/mauritania.webp";
import flagYemen from "../assets/flags/yemen.webp";

const countryFlags = {
  jo: flagJordan,
  ae: flagUae,
  bh: flagBahrain,
  tn: flagTunisia,
  dz: flagAlgeria,
  dj: flagDjibouti,
  sa: flagSaudi,
  sd: flagSudan,
  sy: flagSyria,
  so: flagSomalia,
  iq: flagIraq,
  om: flagOman,
  ps: flagPalestine,
  qa: flagQatar,
  kw: flagKuwait,
  lb: flagLebanon,
  ly: flagLibya,
  eg: flagEgypt,
  ma: flagMorocco,
  mr: flagMauritania,
  ye: flagYemen,
};

const countries = [
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

const Home = () => {
  const [selectedCountry, setSelectedCountry] = useState("—");
  const [sponsorSlide, setSponsorSlide] = useState(0);

  const sponsors = [
    {
      href: "https://procedures.gov.mr/ar/",
      img: i7,
      title: "1 وزارة المعادن و الصناع العربية",
      subtitle: "الجمهورية الإسلامية الموريتانية",
    },
    {
      href: "https://www.mim.gov.sa/ar",
      img: i7,
      title: "2 وزارة الصناعة والثروة المعدنية",
      subtitle: "المملكة العربية السعودية",
    },
    {
      href: "https://procedures.gov.mr/ar/",
      img: i7,
      title: "3 وزارة المعادن و الصناعة",
      subtitle: "الجمهورية الإسلامية الموريتانية",
    },
    {
      href: "https://www.mim.gov.sa/ar",
      img: i7,
      title: "4 وزارة الصناعة والثروة المعدنية",
      subtitle: "المملكة العربية السعودية",
    },
    {
      href: "https://procedures.gov.mr/ar/",
      img: i7,
      title: "5 وزارة المعادن و الصناعة",
      subtitle: "الجمهورية الإسلامية الموريتانية",
    },
    {
      href: "https://www.mim.gov.sa/ar",
      img: i7,
      title: "6 وزارة الصناعة والثروة المعدنية",
      subtitle: "المملكة العربية السعودية",
    },
  ];

  const sponsorSlides = [];
  for (let i = 0; i < sponsors.length; i += 3) {
    sponsorSlides.push(sponsors.slice(i, i + 3));
  }

  const handleChatbotClick = () => {
    alert("Chat Bote — محلل البيانات الذكي (واجهة تجريبية).");
  };

  useEffect(() => {
    if (sponsorSlides.length <= 1) return;
    const interval = setInterval(() => {
      setSponsorSlide((prev) => (prev + 1) % sponsorSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sponsorSlides.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (els.length === 0) return;
    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (prefersReduced) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { root: null, threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div
      className="min-h-screen text-slate-800 text-xl sm:text-2xl md:text-3xl"
      dir="rtl"
      lang="ar"
    >
      <style>{`
        /* ── Keyframes ── */
        @keyframes popIn {
          0%   { opacity: 0; transform: translateY(28px) scale(0.95); filter: blur(8px); }
          65%  { opacity: 1; transform: translateY(-4px) scale(1.01); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0)   scale(1);    filter: blur(0); }
        }
        @keyframes fadeSlideUp {
          0%   { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes pulseRing {
          0%,100% { box-shadow: 0 0 0 0 rgba(8,39,33,0.18); }
          50%      { box-shadow: 0 0 0 8px rgba(8,39,33,0); }
        }
        @keyframes floatBadge {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.15; }
          50%      { opacity: 0.35; }
        }
        @keyframes scaleIn {
          0%   { opacity: 0; transform: scale(0.88); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInRight {
          0%   { opacity: 0; transform: translateX(30px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes borderGlow {
          0%,100% { border-color: rgba(8,39,33,0.3); }
          50%      { border-color: rgba(221,188,107,0.7); }
        }
        @keyframes countUp {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* ── Reveal base ── */
        .reveal {
          opacity: 0;
          transform: translateY(28px) scale(0.95);
          filter: blur(8px);
          will-change: transform, opacity, filter;
        }
        .reveal.is-visible {
          animation: popIn 880ms cubic-bezier(.2,.9,.2,1) both;
        }
        .reveal.is-visible.d1 { animation-delay:  80ms; }
        .reveal.is-visible.d2 { animation-delay: 160ms; }
        .reveal.is-visible.d3 { animation-delay: 240ms; }
        .reveal.is-visible.d4 { animation-delay: 320ms; }
        .reveal.is-visible.d5 { animation-delay: 400ms; }

        /* ── Hero text ── */
        .hero-title {
          animation: fadeSlideUp 900ms cubic-bezier(.2,.9,.2,1) both;
          animation-delay: 200ms;
        }
        .hero-sub {
          animation: fadeSlideUp 900ms cubic-bezier(.2,.9,.2,1) both;
          animation-delay: 380ms;
        }

        /* ── Search bar ── */
        .search-bar {
          animation: scaleIn 700ms cubic-bezier(.2,.9,.2,1) both;
          animation-delay: 500ms;
          box-shadow: 0 8px 32px rgba(8,39,33,0.13), 0 2px 8px rgba(8,39,33,0.08);
          transition: box-shadow .3s, transform .3s;
        }
        .search-bar:focus-within {
          box-shadow: 0 12px 40px rgba(8,39,33,0.2), 0 4px 16px rgba(221,188,107,0.2);
          transform: translateY(-2px);
        }

        /* ── KPI cards ── */
        .kpi-card {
          transition: transform .35s cubic-bezier(.2,.9,.2,1), box-shadow .35s;
          box-shadow: 0 4px 24px rgba(8,39,33,0.10), 0 1px 4px rgba(8,39,33,0.06);
        }
        .kpi-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 48px rgba(8,39,33,0.18), 0 4px 12px rgba(8,39,33,0.10);
        }
        .kpi-card .kpi-icon {
          animation: glowPulse 3s ease-in-out infinite;
        }
        .kpi-card h2 {
          animation: countUp 600ms cubic-bezier(.2,.9,.2,1) both;
        }

        /* ── Section badges ── */
        .section-badge {
          animation: floatBadge 4s ease-in-out infinite;
          box-shadow: 0 4px 16px rgba(8,39,33,0.12), 0 1px 4px rgba(8,39,33,0.06);
          transition: box-shadow .3s, transform .3s;
        }
        .section-badge:hover {
          box-shadow: 0 8px 24px rgba(8,39,33,0.18);
          transform: translateY(-2px);
        }

        /* ── Indicator cards ── */
        .indicator-card {
          transition: transform .35s cubic-bezier(.2,.9,.2,1), box-shadow .35s;
          box-shadow: 0 4px 20px rgba(8,39,33,0.08), 0 1px 4px rgba(8,39,33,0.05);
          animation: fadeSlideUp 600ms cubic-bezier(.2,.9,.2,1) both;
        }
        .indicator-card:nth-child(1) { animation-delay: 100ms; }
        .indicator-card:nth-child(2) { animation-delay: 200ms; }
        .indicator-card:nth-child(3) { animation-delay: 300ms; }
        .indicator-card:nth-child(4) { animation-delay: 400ms; }
        .indicator-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 16px 48px rgba(8,39,33,0.16), 0 4px 12px rgba(8,39,33,0.08);
        }
        .indicator-card .icon-box {
          transition: transform .3s, box-shadow .3s;
        }
        .indicator-card:hover .icon-box {
          transform: scale(1.15) rotate(-5deg);
          box-shadow: 0 6px 18px rgba(8,39,33,0.18);
        }

        /* ── "More" button ── */
        .btn-more {
          box-shadow: 0 2px 10px rgba(8,39,33,0.20);
          transition: transform .25s, box-shadow .25s;
        }
        .btn-more:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(8,39,33,0.30);
        }
        .btn-more:active { transform: scale(0.97); }

        /* ── Nav link pill ── */
        .nav-pill {
          box-shadow: 0 2px 10px rgba(8,39,33,0.08);
          transition: transform .25s, box-shadow .25s, background .25s;
        }
        .nav-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(8,39,33,0.14);
        }

        /* ── Country button ── */
        .country-btn {
          transition: transform .3s cubic-bezier(.2,.9,.2,1), box-shadow .3s;
        }
        .country-btn:hover {
          transform: translateY(-6px) scale(1.05);
        }
        .country-btn .flag-wrap {
          box-shadow: 0 4px 16px rgba(8,39,33,0.14), 0 1px 4px rgba(8,39,33,0.08);
          transition: box-shadow .3s;
          border-radius: 6px;
          overflow: hidden;
        }
        .country-btn:hover .flag-wrap {
          box-shadow: 0 10px 32px rgba(8,39,33,0.22), 0 2px 8px rgba(221,188,107,0.20);
          animation: borderGlow 2s ease-in-out infinite;
        }

        /* ── Countries section wrapper ── */
        .countries-section {
          box-shadow: 0 8px 40px rgba(8,39,33,0.10), 0 2px 8px rgba(8,39,33,0.06);
          transition: box-shadow .4s;
        }
        .countries-section:hover {
          box-shadow: 0 16px 56px rgba(8,39,33,0.14), 0 4px 16px rgba(8,39,33,0.08);
        }

        /* ── Sponsor cards ── */
        .sponsor-card {
          box-shadow: 0 4px 20px rgba(8,39,33,0.10), 0 1px 4px rgba(8,39,33,0.06);
          transition: transform .3s, box-shadow .3s;
        }
        .sponsor-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 14px 40px rgba(8,39,33,0.18);
        }

        /* ── Sponsors section wrapper ── */
        .sponsors-section {
          box-shadow: 0 8px 40px rgba(8,39,33,0.10), 0 2px 8px rgba(8,39,33,0.06);
        }

        /* ── Chatbot CTA section ── */
        .chatbot-section {
          box-shadow: 0 8px 40px rgba(8,39,33,0.10), 0 2px 8px rgba(8,39,33,0.06);
          transition: box-shadow .4s, transform .4s;
        }
        .chatbot-section:hover {
          box-shadow: 0 18px 56px rgba(8,39,33,0.16);
          transform: translateY(-3px);
        }

        /* ── Floating chatbot button ── */
        .chatbot-float {
          animation: pulseRing 2.5s ease-in-out infinite;
          box-shadow: 0 8px 32px rgba(8,39,33,0.25), 0 2px 8px rgba(8,39,33,0.15);
          transition: transform .3s, box-shadow .3s;
        }
        .chatbot-float:hover {
          transform: translateY(-4px) scale(1.04);
          box-shadow: 0 16px 48px rgba(8,39,33,0.35), 0 4px 16px rgba(221,188,107,0.25);
        }

        /* ── Reserve cards border animation ── */
        .reserve-card-gold {
          animation: borderGlow 3s ease-in-out infinite;
        }

        /* ── Shimmer on active search button ── */
        .btn-smart-search {
          background-size: 200% auto;
          transition: background-position .5s, box-shadow .3s, transform .2s;
        }
        .btn-smart-search:hover {
          background-position: right center;
          box-shadow: 0 6px 20px rgba(8,39,33,0.35);
          transform: translateY(-1px);
        }
      `}</style>

      <Menu />

      {/* ── Hero ── */}
      <header className="relative overflow-hidden text-white h-[680px] pt-12 mb-[-350px] mt-[-90px]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={bgHeaderVideo}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="hero-title mb-3 text-4xl sm:text-5xl md:text-6xl font-extrabold mt-[100px]"
            style={{ textShadow: "0 4px 24px rgba(0,0,0,0.35)" }}>
            بوابة المؤشرات التعدينية العربية
          </h1>
          <p className="hero-sub mx-auto max-w-4xl text-lg sm:text-xl text-white/80"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.25)" }}>
            منصة تحليلية ذكية لمتابعة الإنتاج التعديني العربي، المقارنات، الخرائط،
            والتقارير المتقدمة.
          </p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-transparent" />
      </header>

      <main className="relative -mt-16 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 pb-16">

        {/* ── Search ── */}
        <section className="reveal d2 mx-auto max-w-3xl mb-[250px]">
          <div className="search-bar flex items-center gap-2 rounded-full bg-white px-4 py-2">
            <i className="fas fa-search text-slate-400 text-sm sm:text-base" />
            <input
              type="text"
              placeholder="ابحث عن معدن، دولة، أو إحصائية محددة..."
              className="w-full border-none bg-transparent text-sm sm:text-base outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              className="btn-smart-search rounded-full bg-[#082721] px-7 py-2 text-sm sm:text-lg font-semibold text-white whitespace-nowrap"
            >
              بحث ذكي
            </button>
          </div>
        </section>

        {/* ── KPIs ── */}
        <section className="reveal d3 mt-8 grid gap-4 md:grid-cols-3">
          <div className="kpi-card relative overflow-hidden rounded-2xl bg-[#082721]/10 px-5 py-6 border-r-4 border-[#082721]">
            <i className="kpi-icon fas fa-chart-line absolute left-5 top-4 text-4xl text-[#082721]/15" />
            <p className="text-lg text-[#082721] mb-1">المنتجات التعدينية العربية</p>
            <h2 className="text-3xl font-extrabold text-[#082721]">
              3000{" "}
              <span className="text-lg font-semibold text-[#082721]">معلومة تعدينية</span>
            </h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#082721]/5 px-4 py-1.5 text-lg font-semibold text-[#082721]">
              <i className="fas fa-caret-up" />
              <span>منتجات وخامات</span>
            </div>
          </div>

          <div className="kpi-card relative overflow-hidden rounded-2xl bg-[#ddbc6b]/10 px-5 py-6 border-r-4 border-[#ddbc6b]">
            <i className="kpi-icon fas fa-globe absolute left-5 top-4 text-4xl text-[#ddbc6b]/30" />
            <p className="text-lg text-[#ddbc6b] mb-1">عدد الدول العربية</p>
            <h2 className="text-3xl font-extrabold text-[#ddbc6b]">21</h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#ddbc6b]/10 px-4 py-1.5 text-sm font-semibold text-[#ddbc6b]">
              <i className="fa-solid fa-check" />
              <span>نطاق عربي</span>
            </div>
          </div>

          <div className="kpi-card relative overflow-hidden rounded-2xl bg-[#6d2824]/10 px-5 py-6 border-r-4 border-[#6d2824]">
            <i className="kpi-icon fas fa-database absolute left-5 top-4 text-4xl text-[#6d2824]/30" />
            <p className="text-sm text-[#6d2824] mb-1">الفترة الزمنية</p>
            <h2 className="text-3xl font-extrabold text-[#6d2824]">2010 ← 2024</h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#6d2824]/10 px-4 py-1.5 text-sm font-semibold text-[#6d2824]">
              <i className="fa-solid fa-calendar-days" />
              <span>قابلة للتحديث</span>
            </div>
          </div>
        </section>

        {/* ── Indicators entrance ── */}
        <section className="reveal d4 mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-2xl font-extrabold text-[#082721]">المؤشرات التعدينية</h3>
              <br />
              <p className="section-badge inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721]">
                الإنتاج التعديني
              </p>
            </div>
            <a
              href="/m1"
              className="nav-pill inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721] ring-1 ring-slate-200 hover:bg-slate-50"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" />
              <span>الانتقال للمؤشرات</span>
            </a>
          </div>

          <div className="mt-3 grid gap-5 md:grid-cols-2 lg:grid-cols-2">
            {/* Card 1 */}
            <div className="indicator-card flex h-full min-h-[210px] flex-col justify-between rounded-2xl bg-white p-6">
              <div className="flex items-start gap-3">
                <div className="icon-box flex h-11 w-11 items-center justify-center rounded-xl bg-[#082721]/10 text-[#082721]">
                  <i className="fa-solid fa-chart-column" />
                </div>
                <div>
                  <p className="text-base font-bold">حجم الإنتاج التعديني</p>
                  <p className="text-sm text-slate-500">
                    لوحة تفاعلية لعرض حجم الإنتاج التعديني حسب الدولة، الخام، والفترة
                    الزمنية، مع إمكانية تطبيق أكثر من فلتر في آنٍ واحد.
                  </p>
                  <ul className="mt-2 list-disc pr-5 text-xs text-slate-500 space-y-1">
                    <li>مخطط أعمدة ديناميكي بحسب اختيار المستخدم.</li>
                    <li>جدول جانبي يعرض القيم التفصيلية وقابلة للتنزيل.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <a
                  href="/m1"
                  className="nav-pill inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721] ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  المزيد
                </a>
              </div>
            </div>

            {/* Card 2 */}
            <div className="indicator-card flex h-full min-h-[210px] flex-col justify-between rounded-2xl bg-white p-6">
              <div className="flex items-start gap-3">
                <div className="icon-box flex h-11 w-11 items-center justify-center rounded-xl bg-[#082721]/10 text-[#082721]">
                  <i className="fa-solid fa-chart-line" />
                </div>
                <div>
                  <p className="text-base font-bold">تطور الإنتاج التعديني</p>
                  <p className="text-sm text-slate-500">
                    تتبّع تطور الإنتاج التعديني عبر السنوات مع إبراز الاتجاهات
                    الصعودية أو التراجعية وإظهار أهم التغيرات السنوية.
                  </p>
                  <ul className="mt-2 list-disc pr-5 text-xs text-slate-500 space-y-1">
                    <li>مخطط خطّي تفاعلي مع تحريك المؤشر على السنوات.</li>
                    <li>ملخص سنوي لأبرز التغيرات في الإنتاج لكل دولة أو خام.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <a
                  href="/m2"
                  className="nav-pill inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721] ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  المزيد
                </a>
              </div>
            </div>

            {/* Card 3 */}
            <div className="indicator-card flex h-full min-h-[210px] flex-col justify-between rounded-2xl bg-white p-6">
              <div className="flex items-start gap-3">
                <div className="icon-box flex h-11 w-11 items-center justify-center rounded-xl bg-[#082721]/10 text-[#082721]">
                  <i className="fa-solid fa-layer-group" />
                </div>
                <div>
                  <p className="text-base font-bold">تطور الإنتاج التعديني العربي</p>
                  <p className="text-sm text-slate-500">
                    مقارنة أداء الدول العربية في الإنتاج التعديني عبر أكثر من خام
                    وفي فترات زمنية مختلفة ضمن واجهة تفاعلية واحدة.
                  </p>
                  <ul className="mt-2 list-disc pr-5 text-xs text-slate-500 space-y-1">
                    <li>اختيار عدة دول وعدة خامات في نفس الوقت.</li>
                    <li>عرض ترتيب الدول العربية وفق حجم الإنتاج المختار.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <a
                  href="/m3"
                  className="nav-pill inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721] ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  المزيد
                </a>
              </div>
            </div>

            {/* Card 4 */}
            <div className="indicator-card flex h-full min-h-[210px] flex-col justify-between rounded-2xl bg-white p-6">
              <div className="flex items-start gap-3">
                <div className="icon-box flex h-11 w-11 items-center justify-center rounded-xl bg-[#082721]/10 text-[#082721]">
                  <i className="fa-solid fa-circle-notch" />
                </div>
                <div>
                  <p className="text-base font-bold">نسبة الإنتاج العربي من العالمي</p>
                  <p className="text-sm text-slate-500">
                    قياس مساهمة الإنتاج العربي في الإنتاج العالمي عبر تمثيل دائري
                    يوضح توزيع النسب بين الدول والفترات الزمنية المختلفة.
                  </p>
                  <ul className="mt-2 list-disc pr-5 text-xs text-slate-500 space-y-1">
                    <li>مخطط Donut يوضح نسبة كل دولة من الإجمالي العربي.</li>
                    <li>زر لتبديل السنوات واستكشاف تغير الحصة عبر الزمن.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <a
                  href="/m4"
                  className="nav-pill inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721] ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  المزيد
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trade indicators ── */}
        <section className="reveal d4 mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-badge inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721]">
                التبادلات التجارية الخارجية
              </p>
            </div>
            <a
              href="/trade-indicators"
              className="nav-pill inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721] ring-1 ring-slate-200 hover:bg-slate-50"
            >
              <i className="fa-solid fa-right-left" />
              <span>جميع مؤشرات التجارة</span>
            </a>
          </div>

          <div className="mt-3 grid gap-5 md:grid-cols-3 lg:grid-cols-2">
            <div className="indicator-card flex h-full min-h-[210px] flex-col justify-between rounded-2xl bg-white p-6">
              <div className="flex items-start gap-3">
                <div className="icon-box flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ddbc6b]/15 text-[#082721]">
                  <i className="fa-solid fa-ship" />
                </div>
                <div>
                  <p className="text-base font-bold">الصادرات التعدينية</p>
                  <p className="text-sm text-slate-500">
                    تحليل تدفقات الصادرات التعدينية حسب الدولة والوجهة والقيمة المالية.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <a
                  href="/m5"
                  className="nav-pill inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721] ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  المزيد
                </a>
              </div>
            </div>

            <div className="indicator-card flex h-full min-h-[210px] flex-col justify-between rounded-2xl bg-white p-6">
              <div className="flex items-start gap-3">
                <div className="icon-box flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ddbc6b]/15 text-[#082721]">
                  <i className="fa-solid fa-truck-ramp-box" />
                </div>
                <div>
                  <p className="text-base font-bold">الواردات التعدينية</p>
                  <p className="text-sm text-slate-500">
                    رصد حجم وقيمة الواردات من المواد الخام والمنتجات التعدينية المعالجة.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <a
                  href="/m6"
                  className="nav-pill inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721] ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  المزيد
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Reserves ── */}
        <section className="reveal d4 mt-16 mb-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-badge inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721]">
                احتياطيات الخام
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-5 md:grid-cols-2 lg:grid-cols-2">
            <div className="indicator-card reserve-card-gold flex h-full min-h-[210px] flex-col justify-between rounded-2xl bg-white p-6 border-r-4 border-[#ddbc6b]">
              <div className="flex items-start gap-3">
                <div className="icon-box flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ddbc6b]/15 text-[#082721]">
                  <i className="fa-solid fa-gem" />
                </div>
                <div>
                  <p className="text-base font-bold">احتياطي الخام حسب الدولة</p>
                  <p className="text-sm text-slate-500">
                    توزيع احتياطيات أهم الخامات المعدنية (ذهب، فوسفات، نحاس...) على الخريطة العربية.
                  </p>
                  <ul className="mt-2 list-disc pr-5 text-xs text-slate-500 space-y-1">
                    <li>مقارنة كميات الاحتياطي بين الدول العربية.</li>
                    <li>نسبة تركيز الخام وجودته بحسب التقارير الجيولوجية.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <a
                  href="/m7"
                  className="nav-pill inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721] ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  المزيد
                </a>
              </div>
            </div>

            <div className="indicator-card flex h-full min-h-[210px] flex-col justify-between rounded-2xl bg-white p-6 border-r-4 border-[#082721]">
              <div className="flex items-start gap-3">
                <div className="icon-box flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#082721]/10 text-[#082721]">
                  <i className="fa-solid fa-microscope" />
                </div>
                <div>
                  <p className="text-base font-bold">الاحتياطي المؤكد والمحتمل</p>
                  <p className="text-sm text-slate-500">
                    تصنيف الاحتياطيات وفق درجة الموثوقية الجيولوجية والجدوى الاقتصادية للاستخراج.
                  </p>
                  <ul className="mt-2 list-disc pr-5 text-xs text-slate-500 space-y-1">
                    <li>الاحتياطي المؤكد (Proven) القابل للاستغلال حالياً.</li>
                    <li>الاحتياطي المحتمل (Probable) بناءً على دراسات الاستكشاف.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <a
                  href="/m8"
                  className="nav-pill inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721] ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  المزيد
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Countries strip ── */}
        <section className="reveal d4 mt-10">
          <div className="countries-section rounded-2xl bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h5 className="m-0 text-base font-bold text-slate-800">الدول العربية</h5>
                <p className="mt-1 text-sm text-slate-500">
                  اختر دولة بسرعة للوصول إلى ملفها (واجهة تجريبية)
                </p>
              </div>
              <a
                href="/countries"
                className="nav-pill inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082721] ring-1 ring-[#082721]/40 hover:bg-slate-50"
              >
                <i className="fa-solid fa-arrow-left" />
                <span>المزيد</span>
              </a>
            </div>

            <div className="mt-4 grid gap-y-6 gap-x-4 sm:gap-x-5 md:gap-x-6 lg:gap-x-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
              {countries.map((c, i) => (
                <button
                  key={c.code}
                  type="button"
                  className="country-btn group flex flex-col items-center text-center"
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => setSelectedCountry(c.name)}
                >
                  <div className="flag-wrap relative flex h-16 w-28 items-center justify-center bg-white">
                    <img
                      src={countryFlags[c.code]}
                      alt={c.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-2 text-base font-bold text-[#082721] transition-colors group-hover:text-[#ddbc6b]">
                    {c.name}
                  </p>
                </button>
              ))}
            </div>

            <p className="mt-4 text-sm text-slate-500">
              الدولة المختارة:{" "}
              <span className="font-bold text-[#082721]">{selectedCountry}</span>
            </p>
          </div>
        </section>

        {/* ── Sponsors ── */}
        <section className="reveal d5 mt-10" aria-label="المراجع والمصادر">
          <div className="sponsors-section rounded-3xl bg-white/95 p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#082721]">المراجع والمصادر</h2>
                <p className="text-sm text-slate-500">عرض لجميع المصادر الموثوقة</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="relative h-32">
                {sponsorSlides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      index === sponsorSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {slide.map((s) => (
                        <a
                          key={s.href + s.title + index}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sponsor-card group relative flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        >
                          <img src={s.img} alt={s.title} className="h-full w-full object-contain p-3" />
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/95 px-3 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div>
                              <p className="mb-1 text-base font-extrabold text-[#082721]">{s.title}</p>
                              <p className="text-sm text-slate-500">{s.subtitle}</p>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Chatbot CTA ── */}
        <section className="mt-12">
          <div className="chatbot-section rounded-3xl bg-white/95 p-6 ring-1 ring-slate-200/70 text-center">
            <h2 className="text-xl font-extrabold text-[#082721] mb-2">
              دردشة مع المساعد الذكي
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              يمكنك طرح أسئلة عن المؤشرات، البيانات، أو أي معلومات تعدينية، وسيجيبك
              البوت فوراً.
            </p>
            <button
              type="button"
              onClick={handleChatbotClick}
              className="btn-more inline-flex items-center justify-center gap-2 rounded-full bg-[#082721] px-6 py-3 text-sm font-semibold text-white transition"
            >
              <i className="fa-solid fa-robot" />
              <span>ابدأ المحادثة</span>
            </button>
          </div>
        </section>
      </main>

      <div className="reveal d5">
        <Footer />
      </div>

      {/* ── Floating chatbot button ── */}
      <button
        type="button"
        onClick={handleChatbotClick}
        title="محلّل البيانات الذكي"
        className="chatbot-float fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-white/90 px-3 py-2 text-right backdrop-blur-md"
      >
        <span className="absolute right-3 top-2 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px] shadow-emerald-500/30" />
        <span className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-amber-400/70 bg-gradient-to-br from-[#082721] to-[#082721] text-white"
          style={{ boxShadow: "0 4px 16px rgba(8,39,33,0.35)" }}>
          <i className="fa-solid fa-robot" />
        </span>
        <span className="hidden flex-col text-sm leading-tight text-slate-700 sm:flex">
          <span className="font-extrabold text-[#082721]">Chat Bote</span>
          <span className="text-sm text-slate-500">محلّل البيانات الذكي</span>
        </span>
      </button>
    </div>
  );
};

export default Home;
