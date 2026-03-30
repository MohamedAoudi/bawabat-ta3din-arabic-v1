import { useState, useEffect, useMemo, useRef } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  BookOpen,
  Bot,
  Boxes,
  CalendarDays,
  ChartColumn,
  ChartLine,
  ChevronDown,
  Circle,
  CircleDashed,
  Flag,
  Gem,
  Globe,
  Layers,
  Microscope,
  Pickaxe,
  Search,
  Ship,
  Truck,
} from "lucide-react";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import i7 from "../assets/i-7.png";
import im1 from "../assets/وزارة-الصناعة-والمعادن-دولة-ليبيا-removebg-preview.png";
import im2 from "../assets/وزارة-الصناعة-والتجارة-الجمهورية-اليمنية-removebg-preview.png";

import bgHeaderVideo from "../assets/bg 7.mp4";
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
import { dataByMineral } from "./M1";
import tradeRawText from "../assets/Trade_Critical_Minerals_Morocco.txt?raw";

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
  { href: "https://csc.gov.ly/portfolio/%D9%88%D8%B2%D8%A7%D8%B1%D8%A9-%D8%A7%D9%84%D8%B5%D9%86%D8%A7%D8%B9%D8%A9-%D9%88%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D8%AF%D9%86/", img: im1, title: "دولــة لـيـبـيـا",        subtitle: "وزارة الصناعة والمعادن" },
  { href: "https://mom-ye.com/site-ar/",     img: im2, title: "الجمهورية اليمنية", subtitle: "وزارة النفط والمعادن"        },
  { href: "https://www.mim.gov.sa/ar", img: i7, title: "المملكة العربية السعودية",        subtitle: "وزارة المعادن والصناعة" },

];

const shortText = (text, max = 95) => (text && text.length > max ? `${text.slice(0, max)}...` : text);

const formatInt = (n) => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0));

const parseFlexibleNumber = (value) => {
  if (value == null) return null;
  let s = String(value).trim();
  if (!s) return null;

  if (s.includes(",") && s.includes(".")) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(/,/g, ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (s.includes(",")) {
    s = s.replace(/,/g, ".");
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const buildPortalStats = () => {
  const minerals = Object.keys(dataByMineral || {});
  const yearSet = new Set();
  let productionRows = 0;

  minerals.forEach((mineral) => {
    Object.entries(dataByMineral[mineral] || {}).forEach(([year, rows]) => {
      yearSet.add(Number(year));
      if (Array.isArray(rows)) productionRows += rows.length;
    });
  });

  const years = [...yearSet].filter(Number.isFinite).sort((a, b) => a - b);
  const minYear = years[0] ?? null;
  const maxYear = years[years.length - 1] ?? null;

  let exportRows = 0;
  let importRows = 0;
  let exportTotal = 0;
  let importTotal = 0;

  tradeRawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      if (!line.includes("\t")) return;
      const cells = line.split("\t");
      if (cells.length < 8 || cells[0] === "reporter") return;

      const flow = (cells[2] || "").toLowerCase();
      const value = parseFlexibleNumber(cells[7]);
      if (value == null) return;

      if (flow.startsWith("export")) {
        exportRows += 1;
        exportTotal += value;
      }
      if (flow.startsWith("import")) {
        importRows += 1;
        importTotal += value;
      }
    });

  const uniqueSponsors = new Set(sponsors.map((s) => `${s.title}|${s.subtitle}`));

  return {
    countryCount: countries.length,
    mineralCount: minerals.length,
    productionRows,
    minYear,
    maxYear,
    uniqueSourcesCount: uniqueSponsors.size,
    productionIndicatorCount: INDICATOR_CARDS.length,
    tradeIndicatorCount: TRADE_CARDS.length,
    totalIndicatorCount: INDICATOR_CARDS.length + TRADE_CARDS.length + RESERVE_CARDS.length,
    exportRows,
    importRows,
    tradeRows: exportRows + importRows,
    exportTotal,
    importTotal,
  };
};

const buildKpiData = (stats) => [
  {
    icon: "fa-books",
    altIcon: "fa-chart-column",
    num: "3000",
    unit: "معلومة تعدينية",
    label: "",
    badge: "بيانات تعدينية",
    details: "",
    color: "#c9a84c",
  },
  {
    icon: "fa-earth-africa",
    altIcon: "fa-flag",
    num: "21",
    unit: "دولة عربية",
    label: "",
    badge: "نطاق عربي شامل",
    details: "",
    color: "#6fcba5",
  },
  {
    icon: "fa-calendar-days",
    altIcon: "fa-layer-group",
    num: "2010 - 2024",
    unit: "الفترة الزمنية للبيانات",
    label: "",
    badge: "الفترة الزمنية",
    details: "",
    color: "#e8a87c",
  },
  {
    icon: "fa-gem",
    altIcon: "fa-gem",
    num: "111",
    unit: "خام / منتج تعديني",
    label: "",
    badge: "تنوع معدني",
    details: "",
    color: "#93c5fd",
  },
];

const MiniTradeLine = ({ active, color = "#c9a84c" }) => {
  const pts = [[4,82],[18,76],[34,72],[50,68],[66,60],[82,54],[98,46],[114,50],[130,36],[146,28],[162,20],[178,14]];
  const path = pts.map((p,i) => `${i===0?"M":"L"} ${p[0]} ${p[1]}`).join(" ");
  return (
    <div style={{ height:110, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:8, padding:8 }}>
      <svg viewBox="0 0 190 88" style={{ width:"100%", height:"100%", overflow:"visible" }}>
        {[20,40,60,80].map(y => <line key={y} x1="0" y1={y} x2="190" y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />)}
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="560" strokeDashoffset={active?"0":"560"}
          style={{ transition: active?"stroke-dashoffset 1.2s ease 80ms":"stroke-dashoffset 0.25s ease" }}
        />
        {pts.map((p,i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill={color} opacity={active?1:0}
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

const MiniTradeBar = ({ active, color = "#7ee0c0" }) => {
  const bars = [28,42,36,50,58,46,68,63,52,70,78,66,72,80,88];
  return (
    <div style={{ height:110, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"8px 6px 4px", display:"flex", alignItems:"flex-end", gap:2 }}>
      {bars.map((v, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", height:"100%" }}>
          <div style={{
            width:"100%", borderRadius:"2px 2px 0 0",
            background:`linear-gradient(to top,${color}88,${color})`,
            minHeight:3,
            height: active ? `${v}%` : "0%",
            opacity: active ? 1 : 0.2,
            transition: active
              ? `height 700ms cubic-bezier(.16,1,.3,1) ${i*40}ms, opacity 350ms ease ${i*40}ms`
              : "height 250ms ease, opacity 250ms ease",
          }} />
        </div>
      ))}
    </div>
  );
};

const TRADE_CARDS = [
  {
    icon: "fa-ship",
    altIcon: "fa-right-left",
    title: "الصادرات التعدينية",
    desc: "تحليل تدفقات الصادرات التعدينية حسب الدولة والوجهة والقيمة المالية.",
    href: "/m5",
    Chart: MiniTradeLine,
  },
  {
    icon: "fa-truck-ramp-box",
    altIcon: "fa-ship",
    title: "الواردات التعدينية",
    desc: "رصد حجم وقيمة الواردات من المواد الخام والمنتجات التعدينية المعالجة.",
    href: "/m6",
    Chart: MiniTradeBar,
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

const ICON_MAP = {
  "fa-cubes": Boxes,
  "fa-earth-africa": Globe,
  "fa-calendar-days": CalendarDays,
  "fa-gem": Gem,
  "fa-ship": Ship,
  "fa-truck-ramp-box": Truck,
  "fa-microscope": Microscope,
  "fa-chart-column": ChartColumn,
  "fa-chart-line": ChartLine,
  "fa-layer-group": Layers,
  "fa-circle-notch": CircleDashed,
  "fa-arrow-left": ArrowLeft,
  "fa-search": Search,
  "fa-chevron-down": ChevronDown,
  "fa-pickaxe": Pickaxe,
  "fa-right-left": ArrowLeftRight,
  "fa-flag": Flag,
  "fa-books": BookOpen,
  "fa-robot": Bot,
};

const AppIcon = ({ name, size = 18, strokeWidth = 2, style }) => {
  const Icon = ICON_MAP[name] || Circle;
  return <Icon size={size} strokeWidth={strokeWidth} style={style} aria-hidden="true" />;
};

/* ─────────────────────────────────────────────
   MINI CHARTS  (hover-driven via `active` prop)
───────────────────────────────────────────── */
const MiniBarChart = ({ active }) => {
  const bars = [55,72,38,63,78,22,95,48,41,18,67,59,15,44,36,29,52,83,88,71,33];
  return (
    <div style={{ height:140, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"10px 6px 4px", display:"flex", alignItems:"flex-end", gap:2 }}>
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
    <div style={{ height:140, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:8, padding:8 }}>
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
    <div style={{ height:140, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"10px 8px 4px", display:"flex", alignItems:"flex-end", gap:2 }}>
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
  <div style={{ height:140, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", gap:16 }}>
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
  { icon:"fa-chart-column", altIcon:"fa-layer-group", tagColor:"#c9a84c", title:"حجم الإنتاج التعديني",           desc:"لوحة تفاعلية لعرض حجم الإنتاج التعديني حسب الدولة، الخام، والفترة الزمنية.", href:"/m1", Chart:MiniBarChart },
  { icon:"fa-chart-line",   altIcon:"fa-chart-column", tagColor:"#7ee0c0", title:"تطور الإنتاج التعديني",           desc:"تتبّع تطور الإنتاج عبر السنوات مع إبراز الاتجاهات وأهم التغيرات السنوية.",    href:"/m2", Chart:MiniLineChart },
  { icon:"fa-layer-group",  altIcon:"fa-chart-line", tagColor:"#93c5fd", title:"تطور الإنتاج التعديني العربي",    desc:"مقارنة أداء الدول العربية في الإنتاج عبر أكثر من خام وفترات زمنية مختلفة.",   href:"/m3", Chart:MiniGroupedBar },
  { icon:"fa-circle-notch", altIcon:"fa-gem", tagColor:"#fbbf24", title:"نسبة الإنتاج العربي مقارنة بالإنتاج العالمي", desc:"قياس مساهمة الإنتاج العربي في الإنتاج العالمي عبر تمثيل دائري تفاعلي.",      href:"/m4", Chart:MiniDonut },
];

/* ─────────────────────────────────────────────
   INDICATOR ROW CARD  (self-contained hover)
───────────────────────────────────────────── */
const IndicatorRowCard = ({ card }) => {
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [iconAlt, setIconAlt] = useState(false);
  const cardRef = useRef(null);
  const { Chart } = card;

  useEffect(() => {
    if (!cardRef.current) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(cardRef.current);
    return () => io.disconnect();
  }, []);

  const chartActive = hovered || inView || expanded;
  const shownIcon = iconAlt ? (card.altIcon || card.icon) : card.icon;
  const shownDesc = expanded ? card.desc : shortText(card.desc, 86);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setExpanded((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded((v) => !v);
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      style={{
        borderRadius:8, padding:"20px 24px",
        background: (hovered || expanded)?"rgba(255,255,255,0.075)":"rgba(255,255,255,0.04)",
        border:"1px solid rgba(255,255,255,0.07)",
        borderRight:`3px solid ${card.tagColor}`,
        transform: (hovered || expanded)?"translateY(-5px)":"translateY(0)",
        boxShadow: (hovered || expanded)?"0 22px 50px rgba(0,0,0,0.38)":"none",
        transition:"transform 0.35s cubic-bezier(.16,1,.3,1),box-shadow 0.35s,background 0.3s",
        cursor:"pointer",
      }}
    >
      <div style={{ display:"flex", gap:20, alignItems:"stretch", flexWrap:"wrap" }}>

        {/* Left */}
        <div style={{ flex:"1 1 280px", display:"flex", gap:16, alignItems:"flex-start" }}>
          <div style={{
            width:88, height:"100%", marginTop:2, flexShrink:0, alignSelf:"stretch",
            background:`${card.tagColor}20`, border:`1px solid ${card.tagColor}50`,
            borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
            color:card.tagColor,
            transform: hovered?"scale(1.1) rotate(-5deg)":"scale(1) rotate(0deg)",
            transition:"transform 0.32s cubic-bezier(.16,1,.3,1)",
          }}>
            <AppIcon name={shownIcon} size={56} strokeWidth={1.8} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:6, flexWrap:"wrap" }}>
              <p style={{ fontSize:"1.15rem", fontWeight:800, color:"white", margin:0 }}>{card.title}</p>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIconAlt((v) => !v); }}
                  title="تغيير الأيقونة"
                  style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.8)", borderRadius:8, padding:"4px 8px", cursor:"pointer" }}
                >
                  <AppIcon name="fa-right-left" size={12} strokeWidth={2.4} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
                  title={expanded ? "إخفاء" : "فتح"}
                  style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.8)", borderRadius:8, padding:"4px 8px", cursor:"pointer", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 220ms ease" }}
                >
                  <ChevronDown size={12} strokeWidth={2.4} />
                </button>
              </div>
            </div>
            <p style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.5)", lineHeight:1.75, margin:"0 0 14px" }}>{shownDesc}</p>
            {expanded && (
              <a href={card.href} onClick={(e) => e.stopPropagation()} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 20px", border:`1px solid ${card.tagColor}40`, borderRadius:2, fontSize:"0.85rem", fontWeight:700, color:card.tagColor, letterSpacing:"0.04em", textDecoration:"none", background:`${card.tagColor}12` }}>
                <AppIcon name="fa-arrow-left" size={14} strokeWidth={2.4} /> المزيد
              </a>
            )}
          </div>
        </div>

        {/* Right — chart */}
        {(expanded || hovered || inView) && (
          <div style={{ flex:"0 0 320px", minWidth:260, alignSelf:"center", height:140 }}>
            <Chart active={chartActive} />
          </div>
        )}

      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   KPI CARD  (self-contained hover)
───────────────────────────────────────────── */
const KpiCard = ({ k }) => {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [iconAlt, setIconAlt] = useState(false);
  const shownIcon = iconAlt ? (k.altIcon || k.icon) : k.icon;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setExpanded((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded((v) => !v);
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      style={{
        background:"var(--forest)",
        border:`1px solid ${(hovered || expanded)?"rgba(201,168,76,0.6)":"rgba(201,168,76,0.2)"}`,
        borderRadius:13, padding:"24px",
        transform: (hovered || expanded)?"translateY(-10px)":"translateY(0)",
        boxShadow: (hovered || expanded)?"0 30px 60px rgba(8,39,33,0.35),0 0 0 1px rgba(201,168,76,0.3)":"none",
        transition:"transform 0.4s cubic-bezier(.16,1,.3,1),box-shadow 0.4s,border-color 0.4s",
        cursor:"pointer",
      }}
    >
      {/* Top row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, gap:8 }}>
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"10px 12px", fontSize:"1.2rem", color:k.color, flexShrink:0 }}>
          <AppIcon name={shownIcon} size={22} strokeWidth={2.2} />
        </div>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
          <span style={{ background:`${k.color}18`, color:k.color, fontSize:"0.72rem", fontWeight:700, padding:"4px 12px", borderRadius:2, border:`1px solid ${k.color}30`, whiteSpace:"nowrap" }}>
            {k.badge}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIconAlt((v) => !v); }}
            title="تغيير الأيقونة"
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.8)", borderRadius:8, padding:"4px 8px", cursor:"pointer" }}
          >
            <AppIcon name="fa-right-left" size={12} strokeWidth={2.4} />
          </button>
        </div>
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

      {expanded && (
        <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"0.76rem", margin:"10px 0 0", lineHeight:1.7 }}>
          {k.details}
        </p>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   TRADE CARD  (self-contained hover + mini chart)
───────────────────────────────────────────── */
const TradeCard = ({ card, accent }) => {
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [iconAlt, setIconAlt] = useState(false);
  const ref = useRef(null);
  const { Chart } = card;

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { setInView(true); io.unobserve(e.target); } }),
      { threshold: 0.2 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const chartActive = hovered || inView || expanded;
  const shownIcon = iconAlt ? (card.altIcon || card.icon) : card.icon;
  const shownDesc = expanded ? card.desc : shortText(card.desc, 96);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setExpanded((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded((v) => !v);
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      style={{
        borderRadius:8, padding:"20px 24px",
        background: (hovered || expanded)?"rgba(255,255,255,0.075)":"rgba(255,255,255,0.04)",
        border:"1px solid rgba(255,255,255,0.07)",
        borderRight:`3px solid ${accent}`,
        transform: (hovered || expanded)?"translateY(-5px)":"translateY(0)",
        boxShadow: (hovered || expanded)?"0 22px 50px rgba(0,0,0,0.38)":"none",
        transition:"transform 0.35s cubic-bezier(.16,1,.3,1), box-shadow 0.35s, background 0.3s",
        cursor:"pointer",
      }}
    >
      <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
        {/* Info */}
        <div style={{ flex:"1 1 240px", display:"flex", gap:14, alignItems:"flex-start" }}>
          <div style={{ width:44, height:44, background:`${accent}20`, border:`1px solid ${accent}50`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:accent, flexShrink:0 }}>
            <AppIcon name={shownIcon} size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:6 }}>
              <p style={{ fontSize:"1.05rem", fontWeight:800, color:"white", margin:0 }}>{card.title}</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIconAlt((v) => !v); }}
                title="تغيير الأيقونة"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.8)", borderRadius:8, padding:"3px 7px", cursor:"pointer" }}
              >
                <AppIcon name="fa-right-left" size={11} strokeWidth={2.4} />
              </button>
            </div>
            <p style={{ fontSize:"0.86rem", color:"rgba(255,255,255,0.55)", lineHeight:1.75, margin:0 }}>{shownDesc}</p>
          </div>
        </div>
        {/* Mini chart */}
        {(expanded || hovered || inView) && (
          <div style={{ flex:"0 0 260px", minWidth:200, alignSelf:"center" }}>
            <Chart active={chartActive} color={accent} />
          </div>
        )}
        {/* CTA */}
        <div style={{ display:"flex", alignItems:"center", marginRight:"auto" }}>
          <a href={card.href} onClick={(e) => e.stopPropagation()} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 20px", border:`1px solid ${accent}40`, borderRadius:2, fontSize:"0.85rem", fontWeight:700, color:accent, letterSpacing:"0.04em", textDecoration:"none", background:`${accent}12`, whiteSpace:"nowrap", opacity: expanded ? 1 : 0.92 }}>
            <AppIcon name="fa-arrow-left" size={14} strokeWidth={2.4} /> المزيد
          </a>
        </div>
      </div>
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
        <AppIcon name={icon} size={14} strokeWidth={2.3} /> {tag}
      </span>
      <h3 style={{ fontSize:"1.6rem", fontWeight:900, color:"var(--forest)", marginTop:12, marginBottom:0 }}>{title}</h3>
    </div>
    {action && (
      <a href={action.href} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 18px", border:"1px solid rgba(8,39,33,0.2)", borderRadius:2, fontSize:"0.78rem", fontWeight:700, color:"var(--forest)", letterSpacing:"0.04em", textDecoration:"none", transition:"background 0.25s,border-color 0.25s,color 0.25s" }}>
        <AppIcon name="fa-arrow-left" size={14} strokeWidth={2.4} /> {action.label}
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
  const portalStats = useMemo(() => buildPortalStats(), []);
  const kpiData = useMemo(() => buildKpiData(portalStats), [portalStats]);

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
          border:none;
          transition:all 0.4s cubic-bezier(.16,1,.3,1);
        }
        .search-box.focused {
          background:rgb(255,255,255);
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
        style={{ height:"100vh", minHeight:600, maxHeight:800, marginTop:-90 }}>

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
نافذتك لبيانات ومؤشرات قطاع التعدين العربي           </p>

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
              <AppIcon name="fa-search" size={16} style={{ color:"rgba(201,168,76,0.7)" }} />
            </div>
          </div>

          {/* Scroll hint */}
         
        </div>
      </header>

      {/* ═══════════════════════ MAIN ═══════════════════════ */}
      <main style={{ maxWidth:1400, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* ── KPIs ── */}
        <section className="reveal d2" style={{ marginTop:"20px", position:"relative", zIndex:10, borderRadius:13 }}>
          <div style={{ textAlign:"center", marginBottom:12, background:"linear-gradient(145deg,#071e1a 0%,#082721 40%,#0a2f28 70%,#071e1a 100%)", borderRadius:13, padding:"40px 36px", boxShadow:"0 40px 80px rgba(8,39,33,0.35),inset 0 0 0 1px rgba(201,168,76,0.08)" }}>
            <h3 style={{ fontSize:"1.6rem", fontWeight:900, color:"white", margin:"0" }}>
              <span style={{ background:"linear-gradient(120deg,#c9a84c 0%,#f0d98a 40%,#c9a84c 60%,#8a6a1e 100%)", backgroundSize:"300% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmerGold 6s linear infinite" }}>
                البوابة في أرقام
              </span>
            </h3>
          </div>

          <div className="divf9" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16, borderRadius:13 }}>
            {kpiData.map((k, i) => <KpiCard key={i} k={k} />)}
          </div>
        </section>

        {/* ── PRODUCTION INDICATORS ── */}
        <section className="reveal d3"  style={{textAlign:"center",
          marginTop:72,
            background:"linear-gradient(145deg,#071e1a 0%,#082721 40%,#0a2f28 70%,#071e1a 100%)",
            borderRadius:13, padding:"40px 36px",
            boxShadow:"0 40px 80px rgba(8,39,33,0.35),inset 0 0 0 1px rgba(201,168,76,0.08)",
          }}> <h3 style={{ fontSize:"1.6rem", fontWeight:900, color:"white" }}>
                  <span style={{  background:"linear-gradient(120deg,#c9a84c 0%,#f0d98a 40%,#c9a84c 60%,#8a6a1e 100%)", backgroundSize:"300% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmerGold 6s linear infinite" }}>
                    المؤشرات التعدينية
                  </span>
                </h3></section>
        <section className="reveal d3" style={{ marginTop:16 }}>
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
                <span style={{ display:"inline-flex", alignItems:"center",marginBottom:"20px", gap:8, padding:"5px 16px", background:"rgba(201,168,76,0.12)", color:"white", border:"1px solid rgba(201,168,76,0.3)", borderRadius:13, fontSize:"0.78rem", fontWeight:700, letterSpacing:"0.08em" }}>
                  <AppIcon name="fa-pickaxe" size={15} strokeWidth={2.2} /> الإنتاج التعديني
                </span>
               <br />
                <p style={{ fontSize:"0.8rem", color:"rgba(255,255,255,0.4)", margin:0 }}>{`${formatInt(portalStats.productionIndicatorCount)} مؤشرات تفاعلية شاملة للإنتاج العربي`}</p>
              </div>
              <a href="/m1" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 20px", border:"1px solid rgba(201,168,76,0.35)", borderRadius:13, fontSize:"0.78rem", fontWeight:700, color:"var(--gold)", letterSpacing:"0.04em", textDecoration:"none", background:"rgba(201,168,76,0.08)" }}>
                <AppIcon name="fa-arrow-left" size={14} strokeWidth={2.4} /> الانتقال للمؤشرات
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
              <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.35)" }}>
                {`البيانات محدّثة — ${portalStats.minYear} إلى ${portalStats.maxYear} — ${formatInt(portalStats.countryCount)} دولة عربية`}
              </span>
            </div>
          </div>
        </section>
        <section className="reveal d3"  style={{textAlign:"center",
          marginTop:72,
            background:"linear-gradient(145deg,#071e1a 0%,#082721 40%,#0a2f28 70%,#071e1a 100%)",
            borderRadius:13, padding:"40px 36px",
            boxShadow:"0 40px 80px rgba(8,39,33,0.35),inset 0 0 0 1px rgba(201,168,76,0.08)",
          }}> <h3 style={{ fontSize:"1.6rem", fontWeight:900, color:"white" }}>
                  <span style={{  background:"linear-gradient(120deg,#c9a84c 0%,#f0d98a 40%,#c9a84c 60%,#8a6a1e 100%)", backgroundSize:"300% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmerGold 6s linear infinite" }}>
                   التجارة التعدنية
                  </span>
                </h3></section>
        {/* ── TRADE ── */}
        <section className="reveal d3" style={{ marginTop:16 }}>
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
                  <AppIcon name="fa-right-left" size={15} strokeWidth={2.2} />
                  الصادرات والواردات
                </span>
                <br />
               
              </div>
              <a href="/trade-indicators" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 20px", border:"1px solid rgba(201,168,76,0.35)", borderRadius:13, fontSize:"0.78rem", fontWeight:700, color:"var(--gold)", letterSpacing:"0.04em", textDecoration:"none", background:"rgba(201,168,76,0.08)" }}>
                <AppIcon name="fa-arrow-left" size={14} strokeWidth={2.4} /> جميع مؤشرات التجارة
              </a>
            </div>

            {/* Divider */}
            <div style={{ height:1, background:"linear-gradient(to right,transparent,rgba(201,168,76,0.4),transparent)", marginBottom:28, position:"relative", zIndex:1 }} />

            {/* Cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:14, position:"relative", zIndex:1 }}>
              {TRADE_CARDS.map((card, i) => {
                const accent = i === 0 ? "#c9a84c" : "#7ee0c0";
                return <TradeCard key={i} card={card} accent={accent} />;
              })}
            </div>

            {/* Footer */}
            <div style={{ position:"relative", zIndex:1, marginTop:28, paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#4ade80", display:"inline-block", boxShadow:"0 0 8px rgba(74,222,128,0.5)" }} />
              <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.35)" }}>
                {`إجمالي الصادرات: ${formatInt(portalStats.exportTotal)} دولار — إجمالي الواردات: ${formatInt(portalStats.importTotal)} دولار`}
              </span>
            </div>
          </div>
        </section>

        {/* ── RESERVES ── */}
        {/* <section className="reveal d3" style={{ marginTop:72 }}>
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
        </section> */}

        {/* ── COUNTRIES ── */}
        <section className="reveal d4" style={{ marginTop:72 }}>
          <div style={{ background:"white", border:"1px solid rgba(8,39,33,0.08)", borderRadius:13, padding:32 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:8, flexWrap:"wrap", gap:12 }}>
              <div>
                <span style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", background:"var(--forest)", color:"var(--gold)", borderRadius:13, fontSize:"0.8rem", fontWeight:700, letterSpacing:"0.08em" }}>
                  <AppIcon name="fa-flag" size={14} strokeWidth={2.2} /> الدول الأعضاء
                </span>
                <h5 style={{ fontSize:"1.2rem", fontWeight:900, color:"var(--forest)", margin:"10px 0 4px" }}>الدول العربية</h5>
                <p style={{ fontSize:"0.8rem", color:"var(--muted)", margin:0 }}>اختر دولة للوصول إلى ملفها التعديني</p>
              </div>
              <a href="/countries" className="ind-link"><AppIcon name="fa-arrow-left" size={14} strokeWidth={2.4} /> عرض الكل</a>
            </div>

            <GoldDivider />

            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"24px 12px" }}>
              {countries.map(c => (
                <a key={c.code} href={`/countries?country=${c.code}`} className="country-btn"
                  onClick={() => setSelectedCountry(c.name)}
                  style={{ background:"none", border:"none", cursor:"pointer", textAlign:"center", padding:0 }}>
                  <div className="flag-frame" style={{ width:"100%", aspectRatio:"3/2" }}>
                    <img src={countryFlags[c.code]} alt={c.name}
                      style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                      loading="lazy" />
                  </div>
                  <p className="country-name" style={{ margin:"8px 0 0", fontSize:"0.68rem", lineHeight:1.4 }}>{c.name}</p>
                </a>
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
                  <AppIcon name="fa-books" size={14} strokeWidth={2.2} /> المراجع
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
                <AppIcon name="fa-robot" size={16} strokeWidth={2.2} /> ابدأ المحادثة
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
          <AppIcon name="fa-robot" size={18} strokeWidth={2.2} />
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