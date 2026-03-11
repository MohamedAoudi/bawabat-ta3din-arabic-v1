import { useState, useEffect, useRef } from "react";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import i7 from "../assets/i-7.png";
import bgHeaderVideo from "../assets/2.mp4";
import mapImg from "../assets/map.png";
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

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const countryFlags = {
  jo: flagJordan, ae: flagUae,   bh: flagBahrain,  tn: flagTunisia,
  dz: flagAlgeria, dj: flagDjibouti, sa: flagSaudi, sd: flagSudan,
  sy: flagSyria,  so: flagSomalia, iq: flagIraq,   om: flagOman,
  ps: flagPalestine, qa: flagQatar, kw: flagKuwait, lb: flagLebanon,
  ly: flagLibya,  eg: flagEgypt,  ma: flagMorocco, mr: flagMauritania,
  ye: flagYemen,
};

const countries = [
  { name: "المملكة الأردنية الهاشمية",                   code: "jo" },
  { name: "دولة الإمارات العربية المتحدة",                code: "ae" },
  { name: "مملكة البحرين",                               code: "bh" },
  { name: "الجمهورية التونسية",                          code: "tn" },
  { name: "الجمهورية الجزائرية الديمقراطية الشعبية",     code: "dz" },
  { name: "دولة جيبوتي",                                code: "dj" },
  { name: "المملكة العربية السعودية",                    code: "sa" },
  { name: "جمهورية السودان",                             code: "sd" },
  { name: "الجمهورية العربية السورية",                   code: "sy" },
  { name: "جمهورية الصومال",                             code: "so" },
  { name: "جمهورية العراق",                              code: "iq" },
  { name: "سلطنة عُمان",                                code: "om" },
  { name: "دولة فلسطين",                                code: "ps" },
  { name: "دولة قطر",                                   code: "qa" },
  { name: "دولة الكويت",                                code: "kw" },
  { name: "الجمهورية اللبنانية",                        code: "lb" },
  { name: "دولة ليبيا",                                 code: "ly" },
  { name: "جمهورية مصر العربية",                        code: "eg" },
  { name: "المملكة المغربية",                           code: "ma" },
  { name: "الجمهورية الإسلامية الموريتانية",             code: "mr" },
  { name: "الجمهورية اليمنية",                          code: "ye" },
];

const sponsors = [
  { href: "https://procedures.gov.mr/ar/", img: i7, title: "وزارة المعادن والصناعة",        subtitle: "الجمهورية الإسلامية الموريتانية" },
  { href: "https://www.mim.gov.sa/ar",     img: i7, title: "وزارة الصناعة والثروة المعدنية", subtitle: "المملكة العربية السعودية"        },
  { href: "https://procedures.gov.mr/ar/", img: i7, title: "وزارة المعادن والصناعة",        subtitle: "الجمهورية الإسلامية الموريتانية" },
  { href: "https://www.mim.gov.sa/ar",     img: i7, title: "وزارة الصناعة والثروة المعدنية", subtitle: "المملكة العربية السعودية"        },
  { href: "https://procedures.gov.mr/ar/", img: i7, title: "وزارة المعادن والصناعة",        subtitle: "الجمهورية الإسلامية الموريتانية" },
  { href: "https://www.mim.gov.sa/ar",     img: i7, title: "وزارة الصناعة والثروة المعدنية", subtitle: "المملكة العربية السعودية"        },
];

const KPI_DATA = [
  {
    icon: "fa-cubes",
    num: "3٬000",
    unit: "معلومة تعدينية",
    label: "المعلومات التعدينية العربية",
    badge: "منتجات وخامات",
    color: "#c9a84c",
  },
  {
    icon: "fa-earth-africa",
    num: "21",
    unit: "دولة",
    label: "عدد الدول العربية",
    badge: "نطاق عربي شامل",
    color: "#6fcba5",
  },
  {
    icon: "fa-calendar-days",
    num: "2010 – 2024",
    unit: "",
    label: "الفترة الزمنية للبيانات",
    badge: "قابلة للتحديث",
    color: "#e8a87c",
  },
  {
    icon: "fa-gem",
    num: "111",
    unit: "منتجات تعدينية",
    label: "خام/منتج تعديني",
    badge: "تنوع معدني",
    color: "#93c5fd",
  },
];

const TRADE_CARDS = [
  {
    icon: "fa-ship",
    title: "الصادرات التعدينية",
    desc: "تحليل تدفقات الصادرات التعدينية حسب الدولة والوجهة والقيمة المالية.",
    href: "/m5",
  },
  {
    icon: "fa-truck-ramp-box",
    title: "الواردات التعدينية",
    desc: "رصد حجم وقيمة الواردات من المواد الخام والمنتجات التعدينية المعالجة.",
    href: "/m6",
  },
];

const RESERVE_CARDS = [
  {
    icon: "fa-gem",
    title: "احتياطي الخام حسب الدولة",
    desc: "توزيع احتياطيات أهم الخامات المعدنية على الخريطة العربية.",
    bullets: [
      "مقارنة كميات الاحتياطي بين الدول العربية.",
      "نسبة تركيز الخام وجودته بحسب التقارير الجيولوجية.",
    ],
    href: "/m7",
    accent: "var(--gold)",
    bg: "rgba(201,168,76,0.08)",
  },
  {
    icon: "fa-microscope",
    title: "الاحتياطي المؤكد والمحتمل",
    desc: "تصنيف الاحتياطيات وفق درجة الموثوقية الجيولوجية والجدوى الاقتصادية.",
    bullets: [
      "الاحتياطي المؤكد (Proven) القابل للاستغلال حالياً.",
      "الاحتياطي المحتمل (Probable) بناءً على دراسات الاستكشاف.",
    ],
    href: "/m8",
    accent: "var(--forest)",
    bg: "rgba(8,39,33,0.06)",
  },
];

/* ─────────────────────────────────────────────
   MINI CHARTS  (hover-driven via `active` prop)
───────────────────────────────────────────── */
const MiniBarChart = ({ active }) => {
  const bars = [55,72,38,63,78,22,95,48,41,18,67,59,15,44,36,29,52,83,88,71,33];
  return (
    <div style={{ height:90, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"10px 6px 4px", display:"flex", alignItems:"flex-end", gap:2 }}>
      {bars.map((v, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", height:"100%" }}>
          <div style={{
            width:"100%", borderRadius:"2px 2px 0 0",
            background:"linear-gradient(to top,#c9a84c,#e8d08a)",
            minHeight:3,
            height: active ? `${v}%` : "0%",
            opacity: active ? 1 : 0.2,
            transition: active
              ? `height 700ms cubic-bezier(.16,1,.3,1) ${i*28}ms, opacity 350ms ease ${i*28}ms`
              : "height 250ms ease, opacity 250ms ease",
          }} />
        </div>
      ))}
    </div>
  );
};

const MiniLineChart = ({ active }) => {
  const pts = [[4,76],[18,72],[32,70],[46,67],[60,65],[74,63],[88,60],[102,56],[116,14],[130,40],[144,66],[158,42],[172,44],[186,38]];
  const path = pts.map((p,i) => `${i===0?"M":"L"} ${p[0]} ${p[1]}`).join(" ");
  return (
    <div style={{ height:90, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:8, padding:8 }}>
      <svg viewBox="0 0 190 88" style={{ width:"100%", height:"100%", overflow:"visible" }}>
        {[20,40,60,80].map(y => <line key={y} x1="0" y1={y} x2="190" y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />)}
        <path d={path} fill="none" stroke="#7ee0c0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="500" strokeDashoffset={active?"0":"500"}
          style={{ transition: active?"stroke-dashoffset 1.2s ease 80ms":"stroke-dashoffset 0.25s ease" }}
        />
        {pts.map((p,i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill="#c9a84c" opacity={active?1:0}
            style={{
              transform: active?"scale(1)":"scale(0)",
              transformOrigin:`${p[0]}px ${p[1]}px`,
              transition: active
                ? `opacity 250ms ease ${420+i*55}ms, transform 250ms ease ${420+i*55}ms`
                : "opacity 200ms ease, transform 200ms ease",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

const MiniGroupedBar = ({ active }) => {
  const a = [88,70,62,72,70,18,24,30,45,46,47,20,22,28,34];
  const b = [18,22,24,34,36,40,45,52,46,46,47,30,29,21,23];
  return (
    <div style={{ height:90, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"10px 8px 4px", display:"flex", alignItems:"flex-end", gap:2 }}>
      {a.map((v,i) => (
        <div key={i} style={{ flex:1, display:"flex", alignItems:"flex-end", justifyContent:"center", gap:1, height:"100%" }}>
          <div style={{ width:"45%", borderRadius:"2px 2px 0 0", background:"rgba(255,255,255,0.55)",
            height: active?`${v}%`:"0%", opacity: active?1:0.2,
            transition: active?`height 700ms cubic-bezier(.16,1,.3,1) ${i*38}ms,opacity 350ms ease ${i*38}ms`:"height 250ms ease,opacity 250ms ease" }} />
          <div style={{ width:"45%", borderRadius:"2px 2px 0 0", background:"#49c7a2",
            height: active?`${b[i]}%`:"0%", opacity: active?1:0.2,
            transition: active?`height 700ms cubic-bezier(.16,1,.3,1) ${i*38+75}ms,opacity 350ms ease ${i*38+75}ms`:"height 250ms ease,opacity 250ms ease" }} />
        </div>
      ))}
    </div>
  );
};

const MiniDonut = ({ active }) => (
  <div style={{ height:90, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", gap:16 }}>
    <div style={{
      width:68, height:68, borderRadius:"50%", flexShrink:0,
      background:"conic-gradient(#c9a84c 0deg 194deg,rgba(255,255,255,0.1) 194deg 360deg)",
      position:"relative",
      opacity: active?1:0.4,
      transform: active?"scale(1) rotate(0deg)":"scale(0.65) rotate(-90deg)",
      transition: active?"opacity 550ms ease 80ms,transform 700ms cubic-bezier(.16,1,.3,1) 80ms":"opacity 280ms ease,transform 280ms ease",
    }}>
      <div style={{ position:"absolute", inset:14, borderRadius:"50%", background:"#0a2f28", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:"0.6rem", fontWeight:800, color:"#c9a84c" }}>54%</span>
      </div>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      {[["#c9a84c","الإنتاج العربي"],["rgba(255,255,255,0.2)","العالم"]].map(([c,l],i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:c, flexShrink:0 }} />
          <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.5)" }}>{l}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   INDICATOR CONFIG
───────────────────────────────────────────── */
const INDICATOR_CARDS = [
  { icon:"fa-chart-column", tag:"KPI",         tagColor:"#c9a84c", title:"حجم الإنتاج التعديني",           desc:"لوحة تفاعلية لعرض حجم الإنتاج التعديني حسب الدولة، الخام، والفترة الزمنية.", href:"/m1", Chart:MiniBarChart },
  { icon:"fa-chart-line",   tag:"Trends",      tagColor:"#7ee0c0", title:"تطور الإنتاج التعديني",           desc:"تتبّع تطور الإنتاج عبر السنوات مع إبراز الاتجاهات وأهم التغيرات السنوية.",    href:"/m2", Chart:MiniLineChart },
  { icon:"fa-layer-group",  tag:"Compare",     tagColor:"#93c5fd", title:"تطور الإنتاج التعديني العربي",    desc:"مقارنة أداء الدول العربية في الإنتاج عبر أكثر من خام وفترات زمنية مختلفة.",   href:"/m3", Chart:MiniGroupedBar },
  { icon:"fa-circle-notch", tag:"Global Share",tagColor:"#fbbf24", title:"نسبة الإنتاج العربي من العالمي", desc:"قياس مساهمة الإنتاج العربي في الإنتاج العالمي عبر تمثيل دائري تفاعلي.",      href:"/m4", Chart:MiniDonut },
];

/* ─────────────────────────────────────────────
   INDICATOR ROW CARD  (self-contained hover)
───────────────────────────────────────────── */
const IndicatorRowCard = ({ card }) => {
  const [hovered, setHovered] = useState(false);
  const { Chart } = card;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius:8, padding:"20px 24px",
        background: hovered?"rgba(255,255,255,0.075)":"rgba(255,255,255,0.04)",
        border:"1px solid rgba(255,255,255,0.07)",
        borderRight:`3px solid ${card.tagColor}`,
        transform: hovered?"translateY(-5px)":"translateY(0)",
        boxShadow: hovered?"0 22px 50px rgba(0,0,0,0.38)":"none",
        transition:"transform 0.35s cubic-bezier(.16,1,.3,1),box-shadow 0.35s,background 0.3s",
        cursor:"default",
      }}
    >
      <div style={{ display:"flex", gap:20, alignItems:"stretch", flexWrap:"wrap" }}>

        {/* Left */}
        <div style={{ flex:"1 1 280px", display:"flex", gap:16, alignItems:"flex-start" }}>
          <div style={{
            width:44, height:44, marginTop:2, flexShrink:0,
            background:`${card.tagColor}20`, border:`1px solid ${card.tagColor}50`,
            borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
            color:card.tagColor, fontSize:"1rem",
            transform: hovered?"scale(1.1) rotate(-5deg)":"scale(1) rotate(0deg)",
            transition:"transform 0.32s cubic-bezier(.16,1,.3,1)",
          }}>
            <i className={`fas ${card.icon}`} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
              <p style={{ fontSize:"1rem", fontWeight:800, color:"white", margin:0 }}>{card.title}</p>
              <span style={{ fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.06em", padding:"2px 10px", borderRadius:2, background:`${card.tagColor}18`, color:card.tagColor, border:`1px solid ${card.tagColor}40` }}>
                {card.tag}
              </span>
            </div>
            <p style={{ fontSize:"0.82rem", color:"rgba(255,255,255,0.5)", lineHeight:1.75, margin:"0 0 14px" }}>{card.desc}</p>
            <a href={card.href} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 18px", border:`1px solid ${card.tagColor}40`, borderRadius:2, fontSize:"0.76rem", fontWeight:700, color:card.tagColor, letterSpacing:"0.04em", textDecoration:"none", background:`${card.tagColor}12` }}>
              <i className="fas fa-arrow-left" /> المزيد
            </a>
          </div>
        </div>

        {/* Right — chart */}
        <div style={{ flex:"0 0 260px", minWidth:200, alignSelf:"center" }}>
          <Chart active={hovered} />
        </div>

      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   KPI CARD  (self-contained hover)
───────────────────────────────────────────── */
const KpiCard = ({ k }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:"var(--forest)",
        border:`1px solid ${hovered?"rgba(201,168,76,0.6)":"rgba(201,168,76,0.2)"}`,
        borderRadius:4, padding:"24px",
        transform: hovered?"translateY(-10px)":"translateY(0)",
        boxShadow: hovered?"0 30px 60px rgba(8,39,33,0.35),0 0 0 1px rgba(201,168,76,0.3)":"none",
        transition:"transform 0.4s cubic-bezier(.16,1,.3,1),box-shadow 0.4s,border-color 0.4s",
      }}
    >
      {/* Top row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, gap:8 }}>
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"10px 12px", fontSize:"1.2rem", color:k.color, flexShrink:0 }}>
          <i className={`fas ${k.icon}`} />
        </div>
        <span style={{ background:`${k.color}18`, color:k.color, fontSize:"0.72rem", fontWeight:700, padding:"4px 12px", borderRadius:2, border:`1px solid ${k.color}30`, whiteSpace:"nowrap" }}>
          {k.badge}
        </span>
      </div>

      {/* Label */}
      <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.8rem", letterSpacing:"0.04em", margin:"0 0 6px" }}>{k.label}</p>

      {/* Big number — responsive font size to prevent overflow */}
      <div style={{
        fontSize:"clamp(1.6rem,3vw,2.8rem)", fontWeight:900,
        letterSpacing:"-0.02em", lineHeight:1.1,
        background:"linear-gradient(120deg,#c9a84c 0%,#f0d98a 40%,#c9a84c 60%,#8a6a1e 100%)",
        backgroundSize:"300% auto",
        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        backgroundClip:"text",
        animation:"shimmerGold 6s linear infinite",
      }}>
        {k.num}
      </div>

      {/* Unit */}
      {k.unit && <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.78rem", margin:"4px 0 0" }}>{k.unit}</p>}
    </div>
  );
};

/* ─────────────────────────────────────────────
   SECTION HEADER  (reusable)
───────────────────────────────────────────── */
const SectionHeader = ({ icon, tag, title, action }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28, flexWrap:"wrap", gap:12 }}>
    <div>
      <span style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", background:"var(--forest)", color:"var(--gold)", borderRadius:2, fontSize:"0.8rem", fontWeight:700, letterSpacing:"0.08em" }}>
        <i className={`fas ${icon}`} /> {tag}
      </span>
      <h3 style={{ fontSize:"1.6rem", fontWeight:900, color:"var(--forest)", marginTop:12, marginBottom:0 }}>{title}</h3>
    </div>
    {action && (
      <a href={action.href} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 18px", border:"1px solid rgba(8,39,33,0.2)", borderRadius:2, fontSize:"0.78rem", fontWeight:700, color:"var(--forest)", letterSpacing:"0.04em", textDecoration:"none", transition:"background 0.25s,border-color 0.25s,color 0.25s" }}>
        <i className="fas fa-arrow-left" /> {action.label}
      </a>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   GOLD DIVIDER
───────────────────────────────────────────── */
const GoldDivider = ({ mb = 28 }) => (
  <div style={{ height:1, background:"linear-gradient(to right,transparent,var(--gold),transparent)", opacity:0.5, marginBottom:mb }} />
);

/* ─────────────────────────────────────────────
   REVEAL HOOK — IntersectionObserver
───────────────────────────────────────────── */
const useReveal = () => {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }),
      { threshold:0.1, rootMargin:"0px 0px -8% 0px" }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
};

/* ─────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────── */
const Home = () => {
  const [selectedCountry, setSelectedCountry] = useState("—");
  const [sponsorSlide, setSponsorSlide]       = useState(0);
  const [searchFocused, setSearchFocused]     = useState(false);

  useReveal();

  /* Sponsor carousel */
  const sponsorSlides = [];
  for (let i = 0; i < sponsors.length; i += 3) sponsorSlides.push(sponsors.slice(i, i + 3));

  useEffect(() => {
    if (sponsorSlides.length <= 1) return;
    const t = setInterval(() => setSponsorSlide(p => (p + 1) % sponsorSlides.length), 4000);
    return () => clearInterval(t);
  }, [sponsorSlides.length]);

  const handleChatbotClick = () => alert("Chat Bote — محلل البيانات الذكي (واجهة تجريبية).");

  return (
    <div className="min-h-screen" dir="rtl" lang="ar"
      style={{ background:"#f5f3ef", fontFamily:"'Cairo','Amiri',Georgia,serif" }}>

      {/* ═══════════════════════ GLOBAL STYLES ═══════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');

        :root {
          --forest:     #082721;
          --forest-mid: #0d3d34;
          --gold:       #c9a84c;
          --gold-light: #e8d08a;
          --gold-pale:  #f7f0dc;
          --cream:      #f5f3ef;
          --parchment:  #ede9df;
          --ink:        #1a1510;
          --muted:      #7a7060;
        }
.divf9{
border-radius:13px !important;
}
        /* Noise overlay */
        body::before {
          content:''; position:fixed; inset:0; opacity:0.025;
          pointer-events:none; z-index:9999;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:180px;
        }

        /* Keyframes */
        @keyframes fadeUp      { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes revealIn    { from{opacity:0;transform:translateY(24px) scale(0.97);filter:blur(6px)} to{opacity:1;transform:translateY(0) scale(1);filter:blur(0)} }
        @keyframes shimmerGold { 0%{background-position:-300% center} 100%{background-position:300% center} }
        @keyframes floatSlow   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes pulseGlow   { 0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0.3)} 50%{box-shadow:0 0 0 10px rgba(201,168,76,0)} }
        @keyframes dotBlink    { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* Scroll reveal */
        .reveal { opacity:0; transform:translateY(24px) scale(0.97); filter:blur(6px); will-change:transform,opacity,filter; }
        .reveal.is-visible { animation:revealIn 900ms cubic-bezier(.16,1,.3,1) forwards; }
        .reveal.is-visible.d1{animation-delay:60ms}
        .reveal.is-visible.d2{animation-delay:130ms}
        .reveal.is-visible.d3{animation-delay:200ms}
        .reveal.is-visible.d4{animation-delay:280ms}
        .reveal.is-visible.d5{animation-delay:360ms}

        /* Hero */
        .hero-title  { animation:fadeUp 1s cubic-bezier(.16,1,.3,1) both; animation-delay:150ms; }
        .hero-sub    { animation:fadeUp 1s cubic-bezier(.16,1,.3,1) both; animation-delay:320ms; }
        .hero-search { animation:fadeUp 1s cubic-bezier(.16,1,.3,1) both; animation-delay:480ms; }
        .hero-overlay{ background:linear-gradient(to bottom,rgba(8,39,33,0.72) 0%,rgba(8,39,33,0.45) 55%,rgba(245,243,239,0) 100%); }

        /* Search bar */
        .search-box {
          background:rgba(255,255,255,0.83);
          backdrop-filter:blur(20px);
          border:1px solid rgba(201,168,76,0.35);
          transition:all 0.4s cubic-bezier(.16,1,.3,1);
        }
        .search-box.focused {
          background:rgb(255,255,255);
          border-color:rgba(201,168,76,0.7);
          box-shadow:0 0 0 4px rgba(201,168,76,0.12),0 20px 60px rgba(8,39,33,0.4);
        }
        .search-box input::placeholder { color:rgba(0,0,0,0.45); }
        .search-box input { color:#000; }

        /* Shared link style */
        .ind-link {
          display:inline-flex; align-items:center; gap:6px;
          padding:6px 18px; border:1px solid rgba(8,39,33,0.2);
          border-radius:13px; font-size:0.78rem; font-weight:700;
          color:var(--forest); letter-spacing:0.04em;
          transition:background 0.25s,border-color 0.25s,color 0.25s;
          text-decoration:none;
        }
        .ind-link:hover { background:var(--forest); color:var(--gold); border-color:var(--forest); }

        /* Trade cards */
        .trade-card {
          background:linear-gradient(135deg,var(--forest) 0%,#0d3d34 100%);
          border:1px solid rgba(201,168,76,0.2);
          transition:transform 0.35s cubic-bezier(.16,1,.3,1),box-shadow 0.35s,border-color 0.35s;
          border-radius:13px;
        }
        .trade-card:hover { transform:translateY(-8px); border-color:rgba(201,168,76,0.5); box-shadow:0 24px 48px rgba(8,39,33,0.3); }

        /* Reserve cards */
        .reserve-card {
          background:white;
          transition:transform 0.35s cubic-bezier(.16,1,.3,1),box-shadow 0.35s;
          border-radius:13px;
        }
        .reserve-card:hover { transform:translateY(-8px); box-shadow:0 24px 48px rgba(8,39,33,0.12); }

        /* Country grid */
        .country-btn { transition:transform 0.3s cubic-bezier(.16,1,.3,1); }
        .country-btn:hover { transform:translateY(-6px) scale(1.04); }
        .flag-frame { border-radius:13px; overflow:hidden; box-shadow:0 4px 16px rgba(8,39,33,0.12); border:2px solid transparent; transition:border-color 0.3s,box-shadow 0.3s; }
        .country-btn:hover .flag-frame { border-color:var(--gold); box-shadow:0 10px 28px rgba(201,168,76,0.25); }
        .country-name { font-size:0.78rem; font-weight:700; color:var(--forest); transition:color 0.2s; }
        .country-btn:hover .country-name { color:var(--gold); }

        /* Sponsor cards */
        .sponsor-card { border:1px solid rgba(8,39,33,0.08); background:white; transition:transform 0.3s,box-shadow 0.3s,border-color 0.3s; }
        .sponsor-card:hover { transform:translateY(-4px); border-color:var(--gold); box-shadow:0 16px 36px rgba(8,39,33,0.12); }
        .sponsor-card:hover .sponsor-hover { opacity:1 !important; }

        /* Chatbot CTA */
        .chat-cta { background:linear-gradient(135deg,var(--forest) 0%,#0d3d34 60%,#102e28 100%); border:1px solid rgba(201,168,76,0.25); position:relative; overflow:hidden; }
        .chat-cta::before { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:radial-gradient(ellipse at 70% 50%,rgba(201,168,76,0.07) 0%,transparent 60%); animation:floatSlow 8s ease-in-out infinite; }

        /* Float button */
        .float-btn { background:var(--forest); border:1px solid rgba(201,168,76,0.3); animation:pulseGlow 3s ease-in-out infinite; transition:transform 0.3s,box-shadow 0.3s; }
        .float-btn:hover { transform:translateY(-4px) scale(1.03); box-shadow:0 20px 50px rgba(8,39,33,0.45),0 0 0 1px rgba(201,168,76,0.5); }

        /* Misc */
        .online-dot  { animation:dotBlink 2s ease-in-out infinite; }
        .scroll-hint { animation:floatSlow 3s ease-in-out infinite; }
        a { text-decoration:none; }
      `}</style>

      <Menu />

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <header className="relative overflow-hidden"
        style={{ height:"100vh", minHeight:600, maxHeight:800, marginTop:-80 }}>

        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={bgHeaderVideo} autoPlay loop muted playsInline
        />
        <div className="hero-overlay absolute inset-0" />

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:"linear-gradient(rgba(201,168,76,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.06) 1px,transparent 1px)",
          backgroundSize:"80px 80px",
        }} />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">

          {/* Badge */}
          <div className="hero-title" style={{ marginBottom:24 }}>
            <span style={{ display:"inline-block", background:"rgba(201,168,76,0.15)", border:"1px solid rgba(201,168,76,0.4)", color:"var(--gold-light)", padding:"4px 20px", fontSize:"0.75rem", fontWeight:700, letterSpacing:"0.15em", borderRadius:2, textTransform:"uppercase" }}>
              ✦ المنظومة التعدينية العربية ✦
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-title text-white"
            style={{ fontSize:"clamp(2rem,5vw,4rem)", fontWeight:900, lineHeight:1.15, letterSpacing:"-0.02em", textShadow:"0 4px 40px rgba(0,0,0,0.4)", maxWidth:800, margin:"0 0 1rem" }}>
            بوابة المؤشرات{" "}
            <span style={{ display:"inline-block", background:"linear-gradient(120deg,#c9a84c 0%,#f0d98a 40%,#c9a84c 60%,#8a6a1e 100%)", backgroundSize:"300% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmerGold 6s linear infinite" }}>
              التعدينية العربية
            </span>
          </h1>

          {/* Sub */}
          <p className="hero-sub"
            style={{ color:"rgba(255,255,255,0.72)", fontSize:"clamp(0.9rem,1.8vw,1.15rem)", maxWidth:560, lineHeight:1.8, margin:"0 0 2.5rem" }}>
              نافذتك الاو لى البيانات قطاع التعدين العربي.
          </p>

          {/* Search */}
          <div className="hero-search w-full" style={{ maxWidth:580 }}>
            <div className={`search-box flex items-center gap-3 rounded-sm px-5 py-3 ${searchFocused?"focused":""}`}
              style={{ borderRadius:13 }}>
              <button type="button" style={{ background:"linear-gradient(135deg,#c9a84c,#e8d08a)", color:"#fff", padding:"8px 22px", borderRadius:13, fontSize:"0.82rem", fontWeight:800, letterSpacing:"0.04em", whiteSpace:"nowrap", border:"none", cursor:"pointer" }}>
                بحث ذكي
              </button>
              <input
                type="text"
                placeholder="ابحث عن معدن، دولة، أو إحصائية..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#000", fontSize:"0.9rem", textAlign:"right", caretColor:"#000" }}
              />
              <i className="fas fa-search" style={{ color:"rgba(201,168,76,0.7)", fontSize:"1rem" }} />
            </div>
          </div>

          {/* Scroll hint */}
          <div className="scroll-hint absolute bottom-8"
            style={{ color:"rgba(201,168,76,0.5)", fontSize:"0.7rem", letterSpacing:"0.12em" }}>
            <i className="fas fa-chevron-down" style={{ display:"block", textAlign:"center", marginBottom:4 }} />
            SCROLL
          </div>
        </div>
      </header>

      {/* ═══════════════════════ MAIN ═══════════════════════ */}
      <main style={{ maxWidth:1400, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* ── KPIs ── */}
     <section className="reveal d2" style={{ marginTop:"-60px", position:"relative", zIndex:10,borderRadius: 13}}>
  <div className="divf9" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16,borderRadius: 13 }}>
    {KPI_DATA.map((k, i) => <KpiCard key={i} k={k} />)}
  </div>
</section>

        {/* ── PRODUCTION INDICATORS ── */}
        <section className="reveal d3" style={{ marginTop:72 }}>
          <div style={{
            background:"linear-gradient(145deg,#071e1a 0%,#082721 40%,#0a2f28 70%,#071e1a 100%)",
            border:"1px solid rgba(201,168,76,0.22)",
            borderRadius:13, padding:"40px 36px",
            position:"relative", overflow:"hidden",
            boxShadow:"0 40px 80px rgba(8,39,33,0.35),inset 0 0 0 1px rgba(201,168,76,0.08)",
          }}>
            {/* Glow blobs */}
            <div style={{ position:"absolute", top:-80, right:-80, width:360, height:360, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(201,168,76,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:-60, left:-60, width:280, height:280, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(78,199,162,0.05) 0%,transparent 70%)", pointerEvents:"none" }} />
            {/* Grid lines */}
            <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(201,168,76,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.03) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />

            {/* Header */}
            <div style={{ position:"relative", zIndex:1, display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:32, flexWrap:"wrap", gap:12 }}>
              <div>
                <span style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 16px", background:"rgba(201,168,76,0.12)", color:"white", border:"1px solid rgba(201,168,76,0.3)", borderRadius:13, fontSize:"0.78rem", fontWeight:700, letterSpacing:"0.08em" }}>
                  <i className="fas fa-pickaxe" /> الإنتاج التعديني
                </span>
                <h3 style={{ fontSize:"1.6rem", fontWeight:900, color:"white", margin:"12px 0 4px" }}>
                  <span style={{ background:"linear-gradient(120deg,#c9a84c 0%,#f0d98a 40%,#c9a84c 60%,#8a6a1e 100%)", backgroundSize:"300% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmerGold 6s linear infinite" }}>
                    المؤشرات التعدينية
                  </span>
                </h3>
                <p style={{ fontSize:"0.8rem", color:"rgba(255,255,255,0.4)", margin:0 }}>4 مؤشرات تفاعلية شاملة للإنتاج العربي</p>
              </div>
              <a href="/m1" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 20px", border:"1px solid rgba(201,168,76,0.35)", borderRadius:13, fontSize:"0.78rem", fontWeight:700, color:"var(--gold)", letterSpacing:"0.04em", textDecoration:"none", background:"rgba(201,168,76,0.08)" }}>
                <i className="fas fa-arrow-left" /> الانتقال للمؤشرات
              </a>
            </div>

            {/* Divider */}
            <div style={{ height:1, background:"linear-gradient(to right,transparent,rgba(201,168,76,0.4),transparent)", marginBottom:28, position:"relative", zIndex:1 }} />

            {/* Cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:14, position:"relative", zIndex:1 }}>
              {INDICATOR_CARDS.map((card, i) => <IndicatorRowCard key={i} card={card} />)}
            </div>

            {/* Footer */}
            <div style={{ position:"relative", zIndex:1, marginTop:28, paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#4ade80", display:"inline-block", boxShadow:"0 0 8px rgba(74,222,128,0.5)" }} />
              <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.35)" }}>البيانات محدّثة — 2010 إلى 2024 — 21 دولة عربية</span>
            </div>
          </div>
        </section>

        {/* ── TRADE ── */}
        <section className="reveal d3" style={{ marginTop:72 }}>
          <SectionHeader icon="fa-right-left" tag="التجارة الخارجية" title="التبادلات التجارية الخارجية" action={{ href:"/trade-indicators", label:"جميع مؤشرات التجارة" }} />
          <GoldDivider />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 }}>
            {TRADE_CARDS.map((card, i) => (
              <div key={i} className="trade-card" style={{ padding:24 }}>
                <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:20 }}>
                  <div style={{ width:44, height:44, background:"rgba(201,168,76,0.12)", border:"1px solid rgba(201,168,76,0.25)", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--gold)", fontSize:"1.1rem", flexShrink:0 }}>
                    <i className={`fas ${card.icon}`} />
                  </div>
                  <div>
                    <p style={{ fontSize:"0.95rem", fontWeight:800, color:"white", margin:"0 0 6px" }}>{card.title}</p>
                    <p style={{ fontSize:"0.8rem", color:"rgba(255,255,255,0.55)", lineHeight:1.7, margin:0 }}>{card.desc}</p>
                  </div>
                </div>
                <a href={card.href} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 18px", background:"rgba(201,168,76,0.12)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:13, fontSize:"0.78rem", fontWeight:700, color:"var(--gold)", letterSpacing:"0.04em" }}>
                  <i className="fas fa-arrow-left" /> المزيد
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── RESERVES ── */}
        <section className="reveal d3" style={{ marginTop:72 }}>
          <SectionHeader icon="fa-gem" tag="احتياطيات الخام" title="احتياطيات الموارد التعدينية" />
          <GoldDivider />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 }}>
            {RESERVE_CARDS.map((card, i) => (
              <div key={i} className="reserve-card" style={{ padding:24, borderTop:`3px solid ${card.accent}` }}>
                <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:16 }}>
                  <div style={{ width:44, height:44, background:card.bg, borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", color:card.accent, fontSize:"1rem", flexShrink:0 }}>
                    <i className={`fas ${card.icon}`} />
                  </div>
                  <div>
                    <p style={{ fontSize:"0.95rem", fontWeight:800, color:"var(--forest)", margin:"0 0 6px" }}>{card.title}</p>
                    <p style={{ fontSize:"0.8rem", color:"var(--muted)", lineHeight:1.7, margin:0 }}>{card.desc}</p>
                  </div>
                </div>
                <ul style={{ paddingRight:18, margin:"0 0 16px", listStyle:"none" }}>
                  {card.bullets.map((b, j) => (
                    <li key={j} style={{ fontSize:"0.76rem", color:"var(--muted)", marginBottom:4, display:"flex", gap:8 }}>
                      <span style={{ color:card.accent }}>◆</span>{b}
                    </li>
                  ))}
                </ul>
                <a href={card.href} className="ind-link"><i className="fas fa-arrow-left" /> المزيد</a>
              </div>
            ))}
          </div>
        </section>

        {/* ── COUNTRIES ── */}
        <section className="reveal d4" style={{ marginTop:72 }}>
          <div style={{ background:"white", border:"1px solid rgba(8,39,33,0.08)", borderRadius:13, padding:32 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:8, flexWrap:"wrap", gap:12 }}>
              <div>
                <span style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", background:"var(--forest)", color:"var(--gold)", borderRadius:13, fontSize:"0.8rem", fontWeight:700, letterSpacing:"0.08em" }}>
                  <i className="fas fa-flag" /> الدول الأعضاء
                </span>
                <h5 style={{ fontSize:"1.2rem", fontWeight:900, color:"var(--forest)", margin:"10px 0 4px" }}>الدول العربية</h5>
                <p style={{ fontSize:"0.8rem", color:"var(--muted)", margin:0 }}>اختر دولة للوصول إلى ملفها التعديني</p>
              </div>
              <a href="/countries" className="ind-link"><i className="fas fa-arrow-left" /> عرض الكل</a>
            </div>

            <GoldDivider />

            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"24px 12px" }}>
              {countries.map(c => (
                <button key={c.code} type="button" className="country-btn"
                  style={{ background:"none", border:"none", cursor:"pointer", textAlign:"center", padding:0 }}
                  onClick={() => setSelectedCountry(c.name)}>
                  <div className="flag-frame" style={{ width:"100%", aspectRatio:"3/2" }}>
                    <img src={countryFlags[c.code]} alt={c.name}
                      style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                      loading="lazy" />
                  </div>
                  <p className="country-name" style={{ margin:"8px 0 0", fontSize:"0.68rem", lineHeight:1.4 }}>{c.name}</p>
                </button>
              ))}
            </div>

            <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid rgba(8,39,33,0.08)", fontSize:"0.8rem", color:"var(--muted)" }}>
              الدولة المختارة:{" "}
              <span style={{ fontWeight:800, color:"var(--forest)" }}>{selectedCountry}</span>
            </div>
          </div>
        </section>

        {/* ── SOURCES / SPONSORS ── */}
        <section className="reveal d4" style={{ marginTop:56 }}>
          <div style={{ background:"white", border:"1px solid rgba(8,39,33,0.08)", borderRadius:13, padding:32 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24, flexWrap:"wrap", gap:12 }}>
              <div>
                <span style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", background:"var(--forest)", color:"var(--gold)", borderRadius:13, fontSize:"0.8rem", fontWeight:700, letterSpacing:"0.08em" }}>
                  <i className="fas fa-books" /> المراجع
                </span>
                <h2 style={{ fontSize:"1.2rem", fontWeight:900, color:"var(--forest)", margin:"10px 0 0" }}>المراجع والمصادر</h2>
              </div>
            </div>

            {/* Carousel */}
            <div style={{ position:"relative", height:130 }}>
              {sponsorSlides.map((slide, idx) => (
                <div key={idx} style={{ position:"absolute", inset:0, opacity:idx===sponsorSlide?1:0, pointerEvents:idx===sponsorSlide?"auto":"none", transition:"opacity 0.7s ease", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                  {slide.map((s, si) => (
                    <a key={si} href={s.href} target="_blank" rel="noopener noreferrer" className="sponsor-card"
                      style={{ height:110, borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative" }}>
                      <img src={s.img} alt={s.title} style={{ width:"100%", height:"100%", objectFit:"contain", padding:12 }} />
                      <div className="sponsor-hover" style={{ position:"absolute", inset:0, background:"rgba(255,255,255,0.97)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity 0.3s", padding:12, textAlign:"center" }}>
                        <p style={{ fontSize:"0.82rem", fontWeight:800, color:"var(--forest)", margin:"0 0 4px" }}>{s.title}</p>
                        <p style={{ fontSize:"0.72rem", color:"var(--muted)", margin:0 }}>{s.subtitle}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ))}
            </div>

            {/* Dots */}
            <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:16 }}>
              {sponsorSlides.map((_, i) => (
                <button key={i} type="button" onClick={() => setSponsorSlide(i)}
                  style={{ width:i===sponsorSlide?20:6, height:6, borderRadius:13, border:"none", cursor:"pointer", background:i===sponsorSlide?"var(--gold)":"rgba(8,39,33,0.15)", transition:"all 0.3s", padding:0 }} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CHATBOT CTA ── */}
        <section style={{ marginTop:56 }}>
          <div className="chat-cta" style={{ borderRadius:13, padding:"40px 24px", textAlign:"center" }}>
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(201,168,76,0.12)", border:"1px solid rgba(201,168,76,0.3)", color:"var(--gold)", padding:"4px 16px", borderRadius:13, fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.1em", marginBottom:20 }}>
                <span className="online-dot" style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", display:"inline-block" }} />
                مساعد ذكي متاح الآن
              </div>
              <h2 style={{ fontSize:"1.8rem", fontWeight:900, color:"white", margin:"0 0 12px" }}>
                دردشة مع{" "}
                <span style={{ background:"linear-gradient(120deg,#c9a84c 0%,#f0d98a 40%,#c9a84c 60%,#8a6a1e 100%)", backgroundSize:"300% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmerGold 6s linear infinite" }}>
                  المساعد الذكي
                </span>
              </h2>
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"0.88rem", maxWidth:460, margin:"0 auto 28px", lineHeight:1.8 }}>
                اطرح أسئلتك عن المؤشرات والبيانات والمعلومات التعدينية وسيجيبك فوراً
              </p>
              <button type="button" onClick={handleChatbotClick}
                style={{ display:"inline-flex", alignItems:"center", gap:10, background:"linear-gradient(135deg,#c9a84c,#e8d08a)", color:"var(--forest)", padding:"12px 32px", borderRadius:13, border:"none", cursor:"pointer", fontSize:"0.88rem", fontWeight:800, letterSpacing:"0.04em", boxShadow:"0 8px 24px rgba(201,168,76,0.3)" }}>
                <i className="fas fa-robot" /> ابدأ المحادثة
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <div className="reveal d5"><Footer /></div>

      {/* ── FLOATING BOT BUTTON ── */}
      <button type="button" onClick={handleChatbotClick} title="محلّل البيانات الذكي" className="float-btn"
        style={{ position:"fixed", bottom:24, right:24, zIndex:50, display:"flex", alignItems:"center", gap:12, padding:"10px 16px 10px 12px", borderRadius:13, cursor:"pointer" }}>
        <span className="online-dot" style={{ position:"absolute", top:8, right:8, width:8, height:8, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 0 3px rgba(74,222,128,0.25)" }} />
        <div style={{ width:42, height:42, borderRadius:13, background:"linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.08))", border:"1px solid rgba(201,168,76,0.4)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--gold)", fontSize:"1.1rem" }}>
          <i className="fas fa-robot" />
        </div>
        <div style={{ display:"flex", flexDirection:"column", textAlign:"right" }}>
          <span style={{ fontSize:"0.82rem", fontWeight:800, color:"var(--gold)", lineHeight:1 }}>Chat Bote</span>
          <span style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.5)", marginTop:2 }}>محلّل البيانات الذكي</span>
        </div>
      </button>

    </div>
  );
};

export default Home;