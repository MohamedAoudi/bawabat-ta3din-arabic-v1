import { useState, useEffect, useRef } from "react";
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
  jo: flagJordan, ae: flagUae, bh: flagBahrain, tn: flagTunisia,
  dz: flagAlgeria, dj: flagDjibouti, sa: flagSaudi, sd: flagSudan,
  sy: flagSyria, so: flagSomalia, iq: flagIraq, om: flagOman,
  ps: flagPalestine, qa: flagQatar, kw: flagKuwait, lb: flagLebanon,
  ly: flagLibya, eg: flagEgypt, ma: flagMorocco, mr: flagMauritania, ye: flagYemen,
};

const countries = [
  { name: 'الأردن', code: "jo" }, { name: 'الإمارات', code: "ae" },
  { name: 'البحرين', code: "bh" }, { name: 'تونس', code: "tn" },
  { name: 'الجزائر', code: "dz" }, { name: 'جيبوتي', code: "dj" },
  { name: 'السعودية', code: "sa" }, { name: 'السودان', code: "sd" },
  { name: 'سوريا', code: "sy" }, { name: 'الصومال', code: "so" },
  { name: 'العراق', code: "iq" }, { name: 'عُمان', code: "om" },
  { name: 'فلسطين', code: "ps" }, { name: 'قطر', code: "qa" },
  { name: 'الكويت', code: "kw" }, { name: 'لبنان', code: "lb" },
  { name: 'ليبيا', code: "ly" }, { name: 'مصر', code: "eg" },
  { name: 'المغرب', code: "ma" }, { name: 'موريتانيا', code: "mr" },
  { name: 'اليمن', code: "ye" },
];

const sponsors = [
  { href: "https://procedures.gov.mr/ar/", img: i7, title: "وزارة المعادن والصناعة", subtitle: "الجمهورية الإسلامية الموريتانية" },
  { href: "https://www.mim.gov.sa/ar", img: i7, title: "وزارة الصناعة والثروة المعدنية", subtitle: "المملكة العربية السعودية" },
  { href: "https://procedures.gov.mr/ar/", img: i7, title: "وزارة المعادن والصناعة", subtitle: "الجمهورية الإسلامية الموريتانية" },
  { href: "https://www.mim.gov.sa/ar", img: i7, title: "وزارة الصناعة والثروة المعدنية", subtitle: "المملكة العربية السعودية" },
  { href: "https://procedures.gov.mr/ar/", img: i7, title: "وزارة المعادن والصناعة", subtitle: "الجمهورية الإسلامية الموريتانية" },
  { href: "https://www.mim.gov.sa/ar", img: i7, title: "وزارة الصناعة والثروة المعدنية", subtitle: "المملكة العربية السعودية" },
];

/* ── Mini Charts ── */
const MiniBarChart = () => {
  const data = [
    { label: "المملكة الأردنية الهاشمية", v: 55 },
    { label: "دولة الامارات العربية المتحدة", v: 72 },
    { label: "مملكة البحرين", v: 38 },
    { label: "الجمهورية التونسية", v: 63 },
    { label: "الجمهورية الجزائرية الديمقراطية الشعبية", v: 78 },
    { label: "دولة جيبوتي", v: 22 },
    { label: "المملكة العربية السعودية", v: 95 },
    { label: "جمهورية السودان", v: 48 },
    { label: "الجمهورية العربية السورية", v: 41 },
    { label: "جمهورية الصومال", v: 18 },
    { label: "جمهورية العراق", v: 67 },
    { label: "سلطنة عمان", v: 59 },
    { label: "دولة فلسطين", v: 15 },
    { label: "دولة قطر", v: 44 },
    { label: "دولة الكويت", v: 36 },
    { label: "الجمهورية اللبنانية", v: 29 },
    { label: "دولة ليبيا", v: 52 },
    { label: "جمهورية مصر العربية", v: 83 },
    { label: "المملكة المغربية", v: 88 },
    { label: "الجمهورية الإسلامية الموريتانية", v: 71 },
    { label: "الجمهورية اليمنية", v: 33 },
  ];
  return (
    <div style={{ height: 90, width: "100%", background: "rgba(8,39,33,0.06)", borderRadius: 8, padding: "10px 6px 4px", display: "flex", alignItems: "flex-end", gap: 2 }}>
      {data.map((d, i) => (
        <div
          key={i}
          title={d.label}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", cursor: "default" }}
        >
          <div className="mini-bar" style={{
            width: "100%", borderRadius: "2px 2px 0 0",
            background: "linear-gradient(to top, #c9a84c, #e8d08a)",
            "--bar-h": `${d.v}%`, minHeight: 3,
          }} />
        </div>
      ))}
    </div>
  );
};

const MiniLineChart = () => {
  const pts = [[4,76],[18,72],[32,70],[46,67],[60,65],[74,63],[88,60],[102,56],[116,14],[130,40],[144,66],[158,42],[172,44],[186,38]];
  const path = pts.map((p,i) => `${i===0?"M":"L"} ${p[0]} ${p[1]}`).join(" ");
  return (
    <div style={{ height: 90, width: "100%", background: "rgba(8,39,33,0.06)", borderRadius: 8, padding: 8 }}>
      <svg viewBox="0 0 190 88" style={{ width: "100%", height: "100%" }}>
        {[20,40,60,80].map(y => <line key={y} x1="0" y1={y} x2="190" y2={y} stroke="rgba(8,39,33,0.08)" strokeWidth="1"/>)}
        <path d={path} fill="none" stroke="#7ee0c0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mini-line-draw" />
        {pts.map((p,i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.2" fill="#c9a84c" className="mini-dot-fade" style={{ animationDelay: `${400+i*60}ms` }} />)}
      </svg>
    </div>
  );
};

const MiniGroupedBar = () => {
  const a = [88,70,62,72,70,18,24,30,45,46,47,20,22,28,34];
  const b = [18,22,24,34,36,40,45,52,46,46,47,30,29,21,23];
  return (
    <div style={{ height: 90, width: "100%", background: "rgba(8,39,33,0.06)", borderRadius: 8, padding: "10px 8px 4px", display: "flex", alignItems: "flex-end", gap: 2 }}>
      {a.map((v,i) => (
        <div key={i} style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 1, height: "100%" }}>
          <div className="mini-bar" style={{ width: "45%", borderRadius: "2px 2px 0 0", background: "#082721", "--bar-h": `${v}%`, animationDelay: `${i*50}ms` }} />
          <div className="mini-bar" style={{ width: "45%", borderRadius: "2px 2px 0 0", background: "#49c7a2", "--bar-h": `${b[i]}%`, animationDelay: `${i*50+100}ms` }} />
        </div>
      ))}
    </div>
  );
};

const MiniDonut = () => (
  <div style={{ height: 90, width: "100%", background: "rgba(8,39,33,0.06)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
    <div className="mini-donut-spin" style={{
      width: 68, height: 68, borderRadius: "50%", flexShrink: 0,
      background: "conic-gradient(#c9a84c 0deg 194deg, rgba(8,39,33,0.15) 194deg 360deg)",
      position: "relative"
    }}>
      <div style={{ position: "absolute", inset: 14, borderRadius: "50%", background: "#f5f3ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "#082721" }}>54%</span>
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {[["#c9a84c","الإنتاج العربي"],["rgba(8,39,33,0.2)","العالم"]].map(([c,l],i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }} />
          <span style={{ fontSize: "0.65rem", color: "#7a7060" }}>{l}</span>
        </div>
      ))}
    </div>
  </div>
);

const indicatorCards = [
  {
    icon: "fa-chart-column", tag: "KPI", tagColor: "#c9a84c",
    title: "حجم الإنتاج التعديني",
    desc: "لوحة تفاعلية لعرض حجم الإنتاج التعديني حسب الدولة، الخام، والفترة الزمنية.",
    href: "/m1", Chart: MiniBarChart,
  },
  {
    icon: "fa-chart-line", tag: "Trends", tagColor: "#7ee0c0",
    title: "تطور الإنتاج التعديني",
    desc: "تتبّع تطور الإنتاج عبر السنوات مع إبراز الاتجاهات وأهم التغيرات السنوية.",
    href: "/m2", Chart: MiniLineChart,
  },
  {
    icon: "fa-layer-group", tag: "Compare", tagColor: "#93c5fd",
    title: "تطور الإنتاج التعديني العربي",
    desc: "مقارنة أداء الدول العربية في الإنتاج عبر أكثر من خام وفترات زمنية مختلفة.",
    href: "/m3", Chart: MiniGroupedBar,
  },
  {
    icon: "fa-circle-notch", tag: "Global Share", tagColor: "#fbbf24",
    title: "نسبة الإنتاج العربي من العالمي",
    desc: "قياس مساهمة الإنتاج العربي في الإنتاج العالمي عبر تمثيل دائري تفاعلي.",
    href: "/m4", Chart: MiniDonut,
  },
];

const Home = () => {
  const [selectedCountry, setSelectedCountry] = useState("—");
  const [sponsorSlide, setSponsorSlide] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const sponsorSlides = [];
  for (let i = 0; i < sponsors.length; i += 3) sponsorSlides.push(sponsors.slice(i, i + 3));

  useEffect(() => {
    if (sponsorSlides.length <= 1) return;
    const t = setInterval(() => setSponsorSlide(p => (p + 1) % sponsorSlides.length), 4000);
    return () => clearInterval(t);
  }, [sponsorSlides.length]);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleChatbotClick = () => alert("Chat Bote — محلل البيانات الذكي (واجهة تجريبية).");

  return (
    <div className="min-h-screen" dir="rtl" lang="ar" style={{ background: "#f5f3ef", fontFamily: "'Cairo', 'Amiri', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');

        :root {
          --forest: #082721;
          --forest-mid: #0d3d34;
          --gold: #c9a84c;
          --gold-light: #e8d08a;
          --gold-pale: #f7f0dc;
          --cream: #f5f3ef;
          --parchment: #ede9df;
          --ink: #1a1510;
          --muted: #7a7060;
          --rust: #6d2824;
        }

        /* ── Noise texture overlay ── */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          opacity: 0.025;
          pointer-events: none;
          z-index: 9999;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        /* ── Keyframes ── */
        @keyframes fadeUp {
          from { opacity:0; transform: translateY(32px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes revealIn {
          from { opacity:0; transform: translateY(24px) scale(0.97); filter: blur(6px); }
          to   { opacity:1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes shimmerGold {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        @keyframes floatSlow {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes borderBreath {
          0%,100% { opacity:0.4; }
          50%      { opacity:1; }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.3); }
          50%      { box-shadow: 0 0 0 10px rgba(201,168,76,0); }
        }
        @keyframes dotBlink {
          0%,100% { opacity:1; } 50% { opacity:0.3; }
        }
        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        /* ── Reveal system ── */
        .reveal { opacity:0; transform: translateY(24px) scale(0.97); filter:blur(6px); will-change:transform,opacity,filter; }
        .reveal.is-visible { animation: revealIn 900ms cubic-bezier(.16,1,.3,1) forwards; }
        .reveal.is-visible.d1 { animation-delay: 60ms; }
        .reveal.is-visible.d2 { animation-delay: 130ms; }
        .reveal.is-visible.d3 { animation-delay: 200ms; }
        .reveal.is-visible.d4 { animation-delay: 280ms; }
        .reveal.is-visible.d5 { animation-delay: 360ms; }

        /* ── Hero ── */
        .hero-title { animation: fadeUp 1s cubic-bezier(.16,1,.3,1) both; animation-delay: 150ms; }
        .hero-sub   { animation: fadeUp 1s cubic-bezier(.16,1,.3,1) both; animation-delay: 320ms; }
        .hero-search { animation: fadeUp 1s cubic-bezier(.16,1,.3,1) both; animation-delay: 480ms; }

        .hero-overlay {
          background: linear-gradient(
            to bottom,
            rgba(8,39,33,0.72) 0%,
            rgba(8,39,33,0.45) 55%,
            rgba(245,243,239,0.0) 100%
          );
        }

        /* ── Gold shimmer text ── */
        .text-shimmer {
          background: linear-gradient(120deg, #c9a84c 0%, #f0d98a 40%, #c9a84c 60%, #8a6a1e 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerGold 6s linear infinite;
        }

        /* ── Gold divider ── */
        .gold-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
          opacity: 0.5;
          transform-origin: center;
          animation: lineGrow 1.2s cubic-bezier(.16,1,.3,1) both;
        }

        /* ── Search ── */
        .search-container {
          background: rgba(255, 255, 255, 0.83);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201,168,76,0.35);
          transition: all 0.4s cubic-bezier(.16,1,.3,1);
        }
        .search-container.focused {
          background: rgb(255, 255, 255);
          border-color: rgba(201,168,76,0.7);
          box-shadow: 0 0 0 4px rgba(201,168,76,0.12), 0 20px 60px rgba(8,39,33,0.4);
        }

        /* ── KPI cards ── */
        .kpi-card {
          background: var(--forest);
          border: 1px solid rgba(201,168,76,0.2);
          transition: transform 0.4s cubic-bezier(.16,1,.3,1), box-shadow 0.4s, border-color 0.4s;
        }
        .kpi-card:hover {
          transform: translateY(-10px);
          border-color: rgba(201,168,76,0.6);
          box-shadow: 0 30px 60px rgba(8,39,33,0.35), 0 0 0 1px rgba(201,168,76,0.3);
        }
        .kpi-number {
          font-size: 2.8rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .kpi-accent { background: linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05)); border: 1px solid rgba(201,168,76,0.2); }

        /* ── Section label ── */
        .section-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: var(--forest);
          color: var(--gold);
          border-radius: 2px;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ── Indicator cards ── */
        .ind-card {
          background: white;
          border: 1px solid rgba(8,39,33,0.08);
          border-top: 3px solid var(--gold);
          transition: transform 0.35s cubic-bezier(.16,1,.3,1), box-shadow 0.35s, border-top-color 0.3s;
        }
        .ind-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 48px rgba(8,39,33,0.12), 0 4px 12px rgba(8,39,33,0.06);
          border-top-color: var(--forest);
        }
        .ind-icon {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, var(--forest), var(--forest-mid));
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: var(--gold);
          font-size: 1rem;
          transition: transform 0.3s, box-shadow 0.3s;
          flex-shrink: 0;
        }
        .ind-card:hover .ind-icon {
          transform: scale(1.1) rotate(-5deg);
          box-shadow: 0 8px 20px rgba(8,39,33,0.25);
        }
        .ind-link {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 18px;
          border: 1px solid rgba(8,39,33,0.2);
          border-radius: 2px;
          font-size: 0.78rem; font-weight: 700;
          color: var(--forest);
          letter-spacing: 0.04em;
          transition: background 0.25s, border-color 0.25s, color 0.25s;
        }
        .ind-link:hover {
          background: var(--forest);
          color: var(--gold);
          border-color: var(--forest);
        }

        /* ── Trade cards ── */
        .trade-card {
          background: linear-gradient(135deg, var(--forest) 0%, #0d3d34 100%);
          border: 1px solid rgba(201,168,76,0.2);
          transition: transform 0.35s cubic-bezier(.16,1,.3,1), box-shadow 0.35s, border-color 0.35s;
        }
        .trade-card:hover {
          transform: translateY(-8px);
          border-color: rgba(201,168,76,0.5);
          box-shadow: 0 24px 48px rgba(8,39,33,0.3);
        }

        /* ── Reserve cards ── */
        .reserve-card {
          background: white;
          transition: transform 0.35s cubic-bezier(.16,1,.3,1), box-shadow 0.35s;
        }
        .reserve-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 48px rgba(8,39,33,0.12);
        }

        /* ── Country section ── */
        .countries-wrap {
          background: white;
          border: 1px solid rgba(8,39,33,0.08);
        }
        .country-btn {
          transition: transform 0.3s cubic-bezier(.16,1,.3,1);
        }
        .country-btn:hover { transform: translateY(-6px) scale(1.04); }
        .flag-frame {
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(8,39,33,0.12);
          transition: box-shadow 0.3s;
          border: 2px solid transparent;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .country-btn:hover .flag-frame {
          border-color: var(--gold);
          box-shadow: 0 10px 28px rgba(201,168,76,0.25);
        }
        .country-name {
          font-size: 0.78rem; font-weight: 700;
          color: var(--forest);
          transition: color 0.2s;
        }
        .country-btn:hover .country-name { color: var(--gold); }

        /* ── Sponsors ── */
        .sponsor-card {
          border: 1px solid rgba(8,39,33,0.08);
          background: white;
          transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
        }
        .sponsor-card:hover {
          transform: translateY(-4px);
          border-color: var(--gold);
          box-shadow: 0 16px 36px rgba(8,39,33,0.12);
        }

        /* ── Chatbot CTA ── */
        .chat-cta {
          background: linear-gradient(135deg, var(--forest) 0%, #0d3d34 60%, #102e28 100%);
          border: 1px solid rgba(201,168,76,0.25);
          position: relative;
          overflow: hidden;
        }
        .chat-cta::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: radial-gradient(ellipse at 70% 50%, rgba(201,168,76,0.07) 0%, transparent 60%);
          animation: floatSlow 8s ease-in-out infinite;
        }

        /* ── Float button ── */
        .float-btn {
          background: var(--forest);
          border: 1px solid rgba(201,168,76,0.3);
          animation: pulseGlow 3s ease-in-out infinite;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .float-btn:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 20px 50px rgba(8,39,33,0.45), 0 0 0 1px rgba(201,168,76,0.5);
        }

        /* ── Online dot ── */
        .online-dot { animation: dotBlink 2s ease-in-out infinite; }

        .search-container input::placeholder { color: rgba(0,0,0,0.45); }
        .search-container input { color: black; }

        /* ── Scroll indicator ── */
        .scroll-hint { animation: floatSlow 3s ease-in-out infinite; }

        /* ── Mini chart animations ── */
        @keyframes growBar {
          from { height: 0; opacity: 0.3; }
          to   { height: var(--bar-h); opacity: 1; }
        }
        @keyframes drawLine {
          from { stroke-dashoffset: 500; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes fadeDot {
          from { opacity: 0; transform: scale(0.2); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes donutSpin {
          from { transform: scale(0.6) rotate(-90deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .mini-bar { height: 0; opacity: 0.3; }
        .ind-row-card:hover .mini-bar { animation: growBar 800ms cubic-bezier(.16,1,.3,1) forwards; }
        .mini-line-draw { stroke-dasharray: 500; stroke-dashoffset: 500; }
        .ind-row-card:hover .mini-line-draw { animation: drawLine 1.2s ease forwards; }
        .mini-dot-fade { opacity: 0; }
        .ind-row-card:hover .mini-dot-fade { animation: fadeDot 280ms ease forwards; }
        .mini-donut-spin { opacity: 0.85; transform: scale(0.85); }
        .ind-row-card:hover .mini-donut-spin { animation: donutSpin 800ms cubic-bezier(.16,1,.3,1) forwards; }

        .ind-row-card {
          background: white;
          border: 1px solid rgba(8,39,33,0.07);
          border-right: 3px solid var(--gold);
          transition: transform 0.35s cubic-bezier(.16,1,.3,1), box-shadow 0.35s, border-right-color 0.3s;
        }
        .ind-row-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 48px rgba(8,39,33,0.11), 0 4px 12px rgba(8,39,33,0.06);
          border-right-color: var(--forest);
        }
        .ind-row-card:hover .ind-icon {
          transform: scale(1.12) rotate(-5deg);
          box-shadow: 0 6px 18px rgba(8,39,33,0.2);
        }
      `}</style>

      <Menu />

      {/* ══════════ HERO ══════════ */}
      <header className="relative overflow-hidden" style={{ height: "100vh", minHeight: 600, maxHeight: 800 ,marginTop:-80 }}>
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={bgHeaderVideo} autoPlay loop muted playsInline
        />
        {/* Overlay */}
        <div className="hero-overlay absolute inset-0" />
        {/* Decorative geometric lines */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(201,168,76,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.06) 1px, transparent 1px)",
          backgroundSize: "80px 80px"
        }} />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          {/* Label */}
          <div className="hero-title mb-6">
            <span style={{
              display: "inline-block",
              background: "rgba(201,168,76,0.15)",
              border: "1px solid rgba(201,168,76,0.4)",
              color: "var(--gold-light)",
              padding: "4px 20px",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              borderRadius: "2px",
              marginBottom: 20,
              textTransform: "uppercase"
            }}>
              ✦ المنظومة التعدينية العربية ✦
            </span>
          </div>

          <h1 className="hero-title text-white" style={{
            fontSize: "clamp(2rem, 5vw, 4rem)",
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            textShadow: "0 4px 40px rgba(0,0,0,0.4)",
            maxWidth: 800,
            marginBottom: "1rem"
          }}>
            بوابة المؤشرات{" "}
            <span className="text-shimmer">التعدينية العربية</span>
          </h1>

          <p className="hero-sub" style={{
            color: "rgba(255,255,255,0.72)",
            fontSize: "clamp(0.9rem, 1.8vw, 1.15rem)",
            maxWidth: 560,
            lineHeight: 1.8,
            marginBottom: "2.5rem"
          }}>
            منصة تحليلية ذكية لمتابعة الإنتاج التعديني العربي،
            المقارنات، الخرائط، والتقارير المتقدمة.
          </p>

          {/* Search */}
          <div className="hero-search w-full" style={{ maxWidth: 580 }}>
            <div
              className={`search-container flex items-center gap-3 rounded-sm px-5 py-3 ${searchFocused ? "focused" : ""}`}
            >
              <button type="button" style={{
                background: "linear-gradient(135deg, #c9a84c, #e8d08a)",
                color: "#ffffff",
                padding: "8px 22px",
                borderRadius: "2px",
                fontSize: "0.82rem",
                fontWeight: 800,
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                border: "none",
                cursor: "pointer",
                transition: "opacity 0.2s"
              }}>
                بحث ذكي
              </button>
              <input
                type="text"
                placeholder="ابحث عن معدن، دولة، أو إحصائية..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "black", fontSize: "0.9rem", textAlign: "right",
                  caretColor: "black"
                }}
              />
              <i className="fas fa-search" style={{ color: "rgba(201,168,76,0.7)", fontSize: "1rem" }} />
            </div>
          </div>

          {/* Scroll hint */}
          <div className="scroll-hint absolute bottom-8" style={{ color: "rgba(201,168,76,0.5)", fontSize: "0.7rem", letterSpacing: "0.12em" }}>
            <i className="fas fa-chevron-down" style={{ display: "block", textAlign: "center", marginBottom: 4 }} />
            SCROLL
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* ══════════ KPIs ══════════ */}
        <section className="reveal d2" style={{ marginTop: "-60px", position: "relative", zIndex: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>

            {[
              { icon: "fa-mountain", num: "3٬000", unit: "معلومة تعدينية", label: "المنتجات التعدينية العربية", badge: "منتجات وخامات", color: "#c9a84c" },
              { icon: "fa-earth-africa", num: "21", unit: "دولة", label: "عدد الدول العربية", badge: "نطاق عربي شامل", color: "#6fcba5" },
              { icon: "fa-calendar-range", num: "2010 – 2024", unit: "", label: "الفترة الزمنية للبيانات", badge: "قابلة للتحديث", color: "#e8a87c" },
            ].map((k, i) => (
              <div key={i} className="kpi-card rounded-sm p-6" style={{ borderRadius: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 12px", fontSize: "1.2rem", color: k.color }}>
                    <i className={`fas ${k.icon}`} />
                  </div>
                  <span style={{ background: `${k.color}18`, color: k.color, fontSize: "0.72rem", fontWeight: 700, padding: "4px 12px", borderRadius: 2, border: `1px solid ${k.color}30` }}>
                    {k.badge}
                  </span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: 6, letterSpacing: "0.04em" }}>{k.label}</p>
                <div className="kpi-number text-shimmer">{k.num}</div>
                {k.unit && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", marginTop: 4 }}>{k.unit}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ PRODUCTION INDICATORS ══════════ */}
        <section className="reveal d3" style={{ marginTop: 72 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <span className="section-label"><i className="fas fa-pickaxe" /> الإنتاج التعديني</span>
              <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--forest)", marginTop: 12, marginBottom: 0 }}>المؤشرات التعدينية</h3>
            </div>
            <a href="/m1" className="ind-link">
              <i className="fas fa-arrow-left" />
              الانتقال للمؤشرات
            </a>
          </div>

          <div className="gold-divider" style={{ marginBottom: 28 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {indicatorCards.map((card, i) => {
              const { Chart } = card;
              return (
                <div key={i} className="ind-row-card" style={{ borderRadius: 6, padding: "20px 24px", animationDelay: `${i * 70}ms` }}>
                  <div style={{ display: "flex", gap: 20, alignItems: "stretch", flexWrap: "wrap" }}>

                    {/* Left: icon + text + link */}
                    <div style={{ flex: "1 1 280px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div className="ind-icon" style={{ marginTop: 2 }}>
                        <i className={`fas ${card.icon}`} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                          <p style={{ fontSize: "1rem", fontWeight: 800, color: "var(--forest)", margin: 0 }}>{card.title}</p>
                          <span style={{
                            fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em",
                            padding: "2px 10px", borderRadius: 2,
                            background: `${card.tagColor}18`, color: card.tagColor,
                            border: `1px solid ${card.tagColor}40`
                          }}>{card.tag}</span>
                        </div>
                        <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.75, margin: "0 0 14px" }}>{card.desc}</p>
                        <a href={card.href} className="ind-link" style={{ fontSize: "0.76rem" }}>
                          <i className="fas fa-arrow-left" /> المزيد
                        </a>
                      </div>
                    </div>

                    {/* Right: mini chart */}
                    <div style={{ flex: "0 0 260px", minWidth: 200, alignSelf: "center" }}>
                      <Chart />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════ TRADE ══════════ */}
        <section className="reveal d3" style={{ marginTop: 72 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <span className="section-label"><i className="fas fa-right-left" /> التجارة الخارجية</span>
              <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--forest)", marginTop: 12, marginBottom: 0 }}>التبادلات التجارية الخارجية</h3>
            </div>
            <a href="/trade-indicators" className="ind-link">
              <i className="fas fa-arrow-left" /> جميع مؤشرات التجارة
            </a>
          </div>

          <div className="gold-divider" style={{ marginBottom: 28 }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {[
              { icon: "fa-ship", title: "الصادرات التعدينية", desc: "تحليل تدفقات الصادرات التعدينية حسب الدولة والوجهة والقيمة المالية.", href: "/m5" },
              { icon: "fa-truck-ramp-box", title: "الواردات التعدينية", desc: "رصد حجم وقيمة الواردات من المواد الخام والمنتجات التعدينية المعالجة.", href: "/m6" },
            ].map((card, i) => (
              <div key={i} className="trade-card rounded-sm p-6" style={{ borderRadius: 4 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{
                    width: 44, height: 44, background: "rgba(201,168,76,0.12)",
                    border: "1px solid rgba(201,168,76,0.25)", borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--gold)", fontSize: "1.1rem", flexShrink: 0
                  }}>
                    <i className={`fas ${card.icon}`} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.95rem", fontWeight: 800, color: "white", marginBottom: 6 }}>{card.title}</p>
                    <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{card.desc}</p>
                  </div>
                </div>
                <a href={card.href} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 18px", background: "rgba(201,168,76,0.12)",
                  border: "1px solid rgba(201,168,76,0.3)", borderRadius: 2,
                  fontSize: "0.78rem", fontWeight: 700, color: "var(--gold)",
                  letterSpacing: "0.04em", textDecoration: "none"
                }}>
                  <i className="fas fa-arrow-left" /> المزيد
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ RESERVES ══════════ */}
        <section className="reveal d3" style={{ marginTop: 72 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <span className="section-label"><i className="fas fa-gem" /> احتياطيات الخام</span>
              <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--forest)", marginTop: 12, marginBottom: 0 }}>احتياطيات الموارد التعدينية</h3>
            </div>
          </div>

          <div className="gold-divider" style={{ marginBottom: 28 }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {[
              { icon: "fa-gem", title: "احتياطي الخام حسب الدولة", desc: "توزيع احتياطيات أهم الخامات المعدنية على الخريطة العربية.", bullets: ["مقارنة كميات الاحتياطي بين الدول العربية.", "نسبة تركيز الخام وجودته بحسب التقارير الجيولوجية."], href: "/m7", accent: "var(--gold)" },
              { icon: "fa-microscope", title: "الاحتياطي المؤكد والمحتمل", desc: "تصنيف الاحتياطيات وفق درجة الموثوقية الجيولوجية والجدوى الاقتصادية.", bullets: ["الاحتياطي المؤكد (Proven) القابل للاستغلال حالياً.", "الاحتياطي المحتمل (Probable) بناءً على دراسات الاستكشاف."], href: "/m8", accent: "var(--forest)" },
            ].map((card, i) => (
              <div key={i} className="reserve-card rounded-sm p-6" style={{ borderRadius: 4, borderTop: `3px solid ${card.accent}` }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{
                    width: 44, height: 44,
                    background: i === 0 ? "rgba(201,168,76,0.1)" : "rgba(8,39,33,0.08)",
                    borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: card.accent, fontSize: "1rem", flexShrink: 0
                  }}>
                    <i className={`fas ${card.icon}`} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--forest)", marginBottom: 6 }}>{card.title}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.7 }}>{card.desc}</p>
                  </div>
                </div>
                <ul style={{ paddingRight: 18, margin: "0 0 16px", listStyle: "none" }}>
                  {card.bullets.map((b, j) => (
                    <li key={j} style={{ fontSize: "0.76rem", color: "var(--muted)", marginBottom: 4, display: "flex", gap: 8 }}>
                      <span style={{ color: card.accent }}>◆</span>{b}
                    </li>
                  ))}
                </ul>
                <a href={card.href} className="ind-link">
                  <i className="fas fa-arrow-left" /> المزيد
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ COUNTRIES ══════════ */}
        <section className="reveal d4" style={{ marginTop: 72 }}>
          <div className="countries-wrap rounded-sm p-8" style={{ borderRadius: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8, flexWrap: "wrap", gap: 12 }}>
              <div>
                <span className="section-label"><i className="fas fa-flag" /> الدول الأعضاء</span>
                <h5 style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--forest)", marginTop: 10, marginBottom: 4 }}>الدول العربية</h5>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>اختر دولة للوصول إلى ملفها التعديني</p>
              </div>
              <a href="/countries" className="ind-link">
                <i className="fas fa-arrow-left" /> عرض الكل
              </a>
            </div>

            <div className="gold-divider" style={{ marginBottom: 28 }} />

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
              gap: "20px 16px"
            }}>
              {countries.map((c, i) => (
                <button
                  key={c.code}
                  type="button"
                  className="country-btn"
                  style={{ background: "none", border: "none", cursor: "pointer", textAlign: "center", animationDelay: `${i * 30}ms` }}
                  onClick={() => setSelectedCountry(c.name)}
                >
                  <div className="flag-frame" style={{ width: "100%", aspectRatio: "3/2", overflow: "hidden" }}>
                    <img src={countryFlags[c.code]} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
                  </div>
                  <p className="country-name" style={{ marginTop: 8 }}>{c.name}</p>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(8,39,33,0.08)", fontSize: "0.8rem", color: "var(--muted)" }}>
              الدولة المختارة:{" "}
              <span style={{ fontWeight: 800, color: "var(--forest)" }}>{selectedCountry}</span>
            </div>
          </div>
        </section>

        {/* ══════════ SOURCES ══════════ */}
        <section className="reveal d4" style={{ marginTop: 56 }}>
          <div style={{ background: "white", border: "1px solid rgba(8,39,33,0.08)", borderRadius: 4, padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <span className="section-label"><i className="fas fa-books" /> المراجع</span>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--forest)", marginTop: 10, marginBottom: 0 }}>المراجع والمصادر</h2>
              </div>
            </div>

            <div style={{ position: "relative", height: 130 }}>
              {sponsorSlides.map((slide, idx) => (
                <div key={idx} style={{
                  position: "absolute", inset: 0,
                  opacity: idx === sponsorSlide ? 1 : 0,
                  pointerEvents: idx === sponsorSlide ? "auto" : "none",
                  transition: "opacity 0.7s ease",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12
                }}>
                  {slide.map((s, si) => (
                    <a key={si} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="sponsor-card group"
                      style={{ height: 110, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                      <img src={s.img} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 12 }} />
                      <div style={{
                        position: "absolute", inset: 0, background: "rgba(255,255,255,0.97)",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        opacity: 0, transition: "opacity 0.3s", padding: 12, textAlign: "center"
                      }} className="sponsor-hover">
                        <p style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--forest)", marginBottom: 4 }}>{s.title}</p>
                        <p style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{s.subtitle}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ))}
            </div>

            {/* Dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
              {sponsorSlides.map((_, i) => (
                <button key={i} onClick={() => setSponsorSlide(i)} style={{
                  width: i === sponsorSlide ? 20 : 6, height: 6,
                  borderRadius: 3, border: "none", cursor: "pointer",
                  background: i === sponsorSlide ? "var(--gold)" : "rgba(8,39,33,0.15)",
                  transition: "all 0.3s"
                }} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ CHATBOT CTA ══════════ */}
        <section style={{ marginTop: 56 }}>
          <div className="chat-cta rounded-sm p-10 text-center" style={{ borderRadius: 4 }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)",
                color: "var(--gold)", padding: "4px 16px", borderRadius: 2,
                fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 20
              }}>
                <span className="online-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                مساعد ذكي متاح الآن
              </div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "white", marginBottom: 12 }}>
                دردشة مع{" "}
                <span className="text-shimmer">المساعد الذكي</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.88rem", maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.8 }}>
                اطرح أسئلتك عن المؤشرات والبيانات والمعلومات التعدينية وسيجيبك فوراً
              </p>
              <button type="button" onClick={handleChatbotClick} style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "linear-gradient(135deg, #c9a84c, #e8d08a)",
                color: "var(--forest)", padding: "12px 32px",
                borderRadius: 2, border: "none", cursor: "pointer",
                fontSize: "0.88rem", fontWeight: 800, letterSpacing: "0.04em",
                boxShadow: "0 8px 24px rgba(201,168,76,0.3)",
                transition: "opacity 0.2s, transform 0.2s"
              }}>
                <i className="fas fa-robot" />
                ابدأ المحادثة
              </button>
            </div>
          </div>
        </section>
      </main>

      <div className="reveal d5"><Footer /></div>

      {/* ══════════ FLOATING BOT ══════════ */}
      <button type="button" onClick={handleChatbotClick} title="محلّل البيانات الذكي"
        className="float-btn"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 50,
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 16px 10px 12px",
          borderRadius: 4, cursor: "pointer"
        }}>
        {/* Status dot */}
        <span className="online-dot" style={{
          position: "absolute", top: 8, right: 8,
          width: 8, height: 8, borderRadius: "50%", background: "#4ade80",
          boxShadow: "0 0 0 3px rgba(74,222,128,0.25)"
        }} />
        <div style={{
          width: 42, height: 42, borderRadius: 8,
          background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.08))",
          border: "1px solid rgba(201,168,76,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--gold)", fontSize: "1.1rem"
        }}>
          <i className="fas fa-robot" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", textAlign: "right" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--gold)", lineHeight: 1 }}>Chat Bote</span>
          <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", marginTop: 2 }}>محلّل البيانات الذكي</span>
        </div>
      </button>

      <style>{`
        a { text-decoration: none; }
        .sponsor-card:hover .sponsor-hover { opacity: 1 !important; }
      `}</style>
    </div>
  );
};

export default Home;