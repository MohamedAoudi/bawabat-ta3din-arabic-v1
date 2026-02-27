import { useState, useEffect } from "react";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";
import i7 from "../assets/i-7.png";

const countries = [
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

const Home = () => {
  const [selectedCountry, setSelectedCountry] = useState("—");
  const [sponsorSlide, setSponsorSlide] = useState(0);

  const sponsors = [
    {
      href: "https://procedures.gov.mr/ar/",
      img: i7,
      title: "1وزارة المعادن و الصناعة",
      subtitle: "الجمهورية الإسلامية الموريتانية",
    },
    {
      href: "https://www.mim.gov.sa/ar",
      img: i7,
      title: "وزارة الصناعة والثروة المعدنية",
      subtitle: "المملكة العربية السعودية",
    },
    {
      href: "https://procedures.gov.mr/ar/",
      img: i7,
      title: "2وزارة المعادن و الصناعة",
      subtitle: "الجمهورية الإسلامية الموريتانية",
    },
    {
      href: "https://www.mim.gov.sa/ar",
      img: i7,
      title: "3وزارة الصناعة والثروة المعدنية",
      subtitle: "المملكة العربية السعودية",
    },
    {
      href: "https://procedures.gov.mr/ar/",
      img: i7,
      title: "4وزارة المعادن و الصناعة",
      subtitle: "الجمهورية الإسلامية الموريتانية",
    },
    {
      href: "https://www.mim.gov.sa/ar",
      img: i7,
      title: "5وزارة الصناعة والثروة المعدنية",
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

  return (
    <div
      className="min-h-screen bg-slate-100 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] text-slate-800 text-xl sm:text-2xl md:text-3xl"
      dir="rtl"
      lang="ar"
    >
      <Menu />

      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#005A8D] to-[#005A8D] text-white pb-24 pt-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-3 text-4xl sm:text-5xl md:text-6xl font-extrabold">
            بوابة المؤشرات التعدينية العربية
          </h1>
          <p className="mx-auto max-w-4xl text-lg sm:text-xl text-white/80">
            منصة تحليلية ذكية لمتابعة الإنتاج التعديني العربي، المقارنات، الخرائط،
            والتقارير المتقدمة.
          </p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-[-60px] h-24 bg-slate-100" />
      </header>

      <main className="relative -mt-16 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* Search */}
        <section className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-xl shadow-slate-900/10">
            <i className="fas fa-search text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن معدن، دولة، أو إحصائية محددة..."
              className="w-full border-none bg-transparent text-base outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              className="rounded-full bg-[#005A8D] px-7 py-2 text-sm sm:text-lg font-semibold text-white hover:bg-[#00466B]"
            >
              بحث ذكي
            </button>
          </div>
        </section>

        {/* KPIs */}
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl bg-white px-5 py-6 shadow-lg shadow-slate-900/10 border-r-4 border-[#792E28]">
            <i className="fas fa-chart-line absolute left-5 top-4 text-4xl text-[#005A8D]/15" />
            <p className="text-lg text-[#792E28] mb-1">
              المنتجات التعدينية العربية
            </p>
            <h2 className="text-3xl font-extrabold text-[#792E28]">
              3000{" "}
              <span className="text-lg font-semibold text-[#792E28]">
                معلومة تعدينية
              </span>
            </h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#005A8D]/5 px-4 py-1.5 text-lg s font-semibold text-[#005A8D]">
              <i className="fas fa-caret-up" />
              <span>منتجات وخامات</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-white px-5 py-6 shadow-lg shadow-slate-900/10 border-r-4 border-emerald-500">
            <i className="fas fa-globe absolute left-5 top-4 text-4xl text-emerald-900/15" />
            <p className="text-lg  text-slate-500 mb-1">عدد الدول العربية</p>
            <h2 className="text-3xl font-extrabold text-emerald-600">21</h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-800">
              <i className="fa-solid fa-check" />
              <span>نطاق عربي</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-white px-5 py-6 shadow-lg shadow-slate-900/10 border-r-4 border-amber-400">
            <i className="fas fa-database absolute left-5 top-4 text-4xl text-amber-900/15" />
            <p className="text-sm text-slate-500 mb-1">الفترة الزمنية</p>
            <h2 className="text-3xl font-extrabold text-amber-500"  >
              2010 ← 2025
            </h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-800">
              <i className="fa-solid fa-calendar-days" />
              <span>قابلة للتحديث</span>
            </div>
          </div>
        </section>

        {/* Project idea / vision */}
        <section className="mt-10">
        <h3 className="text-xl font-extrabold text-slate-900 mb-2">
               عن البوابة
              </h3>
          <div className="mb-6 text-left">
            <a
              href="/about"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#005A8D] shadow-sm shadow-slate-900/10 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" />
              <span>معرفة المزيد عن البوابة</span>
            </a>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white/95 p-6 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/80">
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                ما هي بوابة المؤشرات التعدينية العربية؟
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                بوابة عربية متخصصة في تجميع، توحيد، وتحليل بيانات الإنتاج التعديني
                في الدول العربية، لتمكين متخذي القرار والباحثين من متابعة أداء
                القطاع، رصد الفرص، ودعم التكامل العربي في مجال الثروات المعدنية.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <i className="mt-1 fa-solid fa-check text-emerald-500" />
                  <span>قاعدة بيانات موحّدة لمؤشرات الإنتاج التعديني العربي.</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="mt-1 fa-solid fa-check text-emerald-500" />
                  <span>مقارنات تفاعلية بين الدول والخامات والفترات الزمنية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="mt-1 fa-solid fa-check text-emerald-500" />
                  <span>تقارير ولوحات معلومات جاهزة للاستخدام وصالحة للتنزيل.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-[#005A8D] p-6 text-white shadow-lg shadow-slate-900/20 ring-1 ring-[#004366]">
              <h3 className="text-xl font-extrabold mb-2">لمن هذه البوابة؟</h3>
              <p className="text-sm text-sky-50/90 leading-relaxed">
                تستهدف البوابة الجهات الحكومية العربية، أجهزة الإحصاء، الهيئات
                التعدينية، الباحثين، والمستثمرين المهتمين بفهم ديناميات الإنتاج
                التعديني العربي.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                <div className="rounded-2xl bg-[#004366]/40 px-4 py-3">
                  <p className="font-semibold mb-1">استخدامات رئيسية</p>
                  <ul className="space-y-1 text-sky-50/90">
                    <li>متابعة تطور الإنتاج حسب الدولة أو الخام.</li>
                    <li>رصد حصة الدول العربية من الإنتاج العالمي.</li>
                    <li>اكتشاف فرص التكامل والتعاون الإقليمي.</li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-[#004366]/40 px-4 py-3">
                  <p className="font-semibold mb-1">الخطوات القادمة</p>
                  <ul className="space-y-1 text-sky-50/90">
                    <li>دمج مزيد من السنوات والبيانات التفصيلية.</li>
                    <li>إطلاق تقارير تفاعلية قابلة للتخصيص.</li>
                    <li>إضافة طبقات خرائط جيولوجية (لاحقًا).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform features */}
        <section className="mt-10">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-white/95 p-6 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/80">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#005A8D]/10 text-[#005A8D]">
                <i className="fa-solid fa-database" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                منصة بيانات موحّدة
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                تجمع البوابة البيانات من مصادر عربية ودولية في واجهة واحدة، مع توحيد
                أولي للتصنيفات والوحدات لتسهيل المقارنة بين الدول والخامات.
              </p>
            </div>

            <div className="rounded-3xl bg-white/95 p-6 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/80">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#005A8D]/10 text-[#005A8D]">
                <i className="fa-solid fa-chart-pie" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                مؤشرات ولوحات تفاعلية
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                توفّر البوابة لوحات رسومية حديثة لقراءة الاتجاهات الزمنية، مقارنة
                مساهمة الدول، واستكشاف الفرص في قطاع الثروات المعدنية العربية.
              </p>
            </div>

            <div className="rounded-3xl bg-white/95 p-6 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/80">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#005A8D]/10 text-[#005A8D]">
                <i className="fa-solid fa-handshake-angle" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                دعم القرار والتعاون العربي
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                تساعد المنصة صُنّاع القرار، والباحثين، والمؤسسات الإقليمية على بناء
                صورة أوضح عن الواقع التعديني العربي، بما يسهّل مبادرات التعاون
                والاستثمار المشترك.
              </p>
            </div>
          </div>
        </section>

        {/* Indicators entrance */}
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-800">
                المؤشرات التعدينية
              </h3>
              <p className="text-sm text-slate-500">الإنتاج التعديني</p>
            </div>
            <a
              href="/m1"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#005A8D] shadow-sm shadow-slate-900/10 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" />
              <span>الانتقال للمؤشرات</span>
            </a>
          </div>

          <div className="mt-3 grid gap-5 md:grid-cols-2 lg:grid-cols-2">
            {/* Card 1 */}
            <div className="flex h-full min-h-[210px] flex-col justify-between rounded-2xl bg-white p-6 shadow-md shadow-slate-900/10">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#005A8D]/10 text-[#005A8D]">
                  <i className="fa-solid fa-chart-column" />
                </div>
                <div>
                  <p className="text-base font-bold">
                    حجم الإنتاج التعديني
                  </p>
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
                <span className="text-slate-500">PowerBI</span>
                <a
                  href="/m1"
                  className="rounded-lg bg-[#005A8D] px-3 py-1 text-white hover:bg-[#004366]"
                >
                  المزيد
                </a>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex h-full min-h-[210px] flex-col justify-between rounded-2xl bg-white p-6 shadow-md shadow-slate-900/10">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#005A8D]/10 text-[#005A8D]">
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
                <span className="text-slate-500">PowerBI</span>
                <a
                  href="/m2"
                  className="rounded-lg bg-[#005A8D] px-3 py-1 text-white hover:bg-[#004366]"
                >
                  المزيد
                </a>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex h-full min-h-[210px] flex-col justify-between rounded-2xl bg-white p-6 shadow-md shadow-slate-900/10">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#005A8D]/10 text-[#005A8D]">
                  <i className="fa-solid fa-layer-group" />
                </div>
                <div>
                  <p className="text-base font-bold">
                    تطور الإنتاج التعديني العربي
                  </p>
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
                <span className="text-slate-500">PowerBI</span>
                <a
                  href="/m3"
                  className="rounded-lg bg-[#005A8D] px-3 py-1 text-white hover:bg-[#004366]"
                >
                  المزيد
                </a>
              </div>
            </div>

            {/* Card 4 */}
            <div className="flex h-full min-h-[210px] flex-col justify-between rounded-2xl bg-white p-6 shadow-md shadow-slate-900/10">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#005A8D]/10 text-[#005A8D]">
                  <i className="fa-solid fa-circle-notch" />
                </div>
                <div>
                  <p className="text-base font-bold">
                    نسبة الإنتاج العربي من العالمي
                  </p>
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
                <span className="text-slate-500">PowerBI</span>
                <a
                  href="/m4"
                  className="rounded-lg bg-sky-900 px-3 py-1 text-white hover:bg-sky-800"
                >
                  المزيد
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-10">
          <div className="rounded-3xl bg-white/95 p-6 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/80">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  كيف تشتغل البوابة؟
                </h3>
                <p className="text-sm text-slate-500">
                  ثلاث طبقات متكاملة: بيانات، تحليل، ومؤشرات تفاعلية.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-900/10 text-[#005A8D]">
                  <i className="fa-solid fa-database" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">
                  1. جمع وتوحيد البيانات
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  تجميع بيانات الإنتاج التعديني من الدول العربية، وتنقيتها، وتوحيد
                  التصنيفات والوحدات لخلق قاعدة بيانات عربية متجانسة.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-900/10 text-emerald-700">
                  <i className="fa-solid fa-microchip" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">
                  2. المعالجة والتحليل الذكي
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  تطبيق مؤشرات وتحليلات إحصائية (نسب نمو، مساهمة عربية، اتجاهات
                  زمنية) لقراءة ديناميات القطاع واستخراج الأنماط الرئيسية.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-900/10 text-amber-600">
                  <i className="fa-solid fa-chart-pie" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">
                  3. لوحات ومؤشرات تفاعلية
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  تقديم المؤشرات عبر لوحات تفاعلية، خرائط، وتقارير قابلة للتنزيل،
                  مع إمكانيات التصفية حسب الدولة، الخام، والفترة الزمنية.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Countries strip */}
        <section className="mt-10">
          <div className="rounded-2xl bg-white p-5 shadow-lg shadow-slate-900/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h5 className="m-0 text-base font-bold text-slate-800">
                  الدول العربية
                </h5>
              <p className="mt-1 text-sm text-slate-500">
                  اختر دولة بسرعة للوصول إلى ملفها (واجهة تجريبية)
                </p>
              </div>
            <a
              href="countries.html"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#005A8D] shadow-sm shadow-slate-900/10 ring-1 ring-[#005A8D]/40 hover:bg-slate-50"
              >
                <i className="fa-solid fa-arrow-left" />
                <span>المزيد</span>
              </a>
            </div>

            <div className="mt-4 grid gap-y-6 gap-x-4 sm:gap-x-5 md:gap-x-6 lg:gap-x-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
              {countries.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  className="group flex flex-col items-center text-center transition-transform hover:-translate-y-1"
                  onClick={() => setSelectedCountry(c.name)}
                >
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-lg border-4 border-[#005A8D] shadow-[0_0_0_4px] shadow-[#005A8D]/40 bg-white">
                    <div
                      className="h-[78px] w-[78px] bg-cover bg-center shadow-[inset_0_0_0_2px_rgba(255,255,255,0.95),0_10px_18px_rgba(0,0,0,0.12)]"
                      style={{
                        backgroundImage: `url(https://flagcdn.com/w80/${c.code}.png)`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-base font-bold text-[#005A8D]">
                    {c.name}
                  </p>
                </button>
              ))}
            </div>

            <p className="mt-4 text-sm text-slate-500">
              الدولة المختارة:{" "}
              <span className="font-bold text-[#005A8D]">
                {selectedCountry}
              </span>
            </p>
          </div>
        </section>

        {/* Use cases */}
        <section className="mt-10">
          <div className="rounded-3xl bg-[#005A8D] text-white/95 p-6 shadow-xl shadow-slate-900/30 ring-1 ring-[#004366] ">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  سيناريوهات استخدام فعلية
                </h2>
                <p className="text-sm text-slate-200/80">
                  كيف يمكن لبوابة المؤشرات التعدينية العربية أن تساعد مختلف
                  الفاعلين؟
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-[#004366]/80 px-4 py-4 ">
                <p className="text-sm font-bold mb-1">
                  صانع قرار في وزارة التعدين
                </p>
                <p className="text-xs sm:text-sm text-slate-100/90 leading-relaxed">
                  يتابع تطور الإنتاج الوطني مقارنة بدول عربية أخرى، يحدد نقاط
                  القوة والضعف، ويستخدم التقارير لدعم خطط الاستثمار أو تحديث
                  الإستراتيجيات الوطنية للقطاع.
                </p>
              </div>
              <div className="rounded-2xl bg-[#004366]/80 px-4 py-4 ">
                <p className="text-sm font-bold mb-1">باحث أو طالب دراسات عليا</p>
                <p className="text-xs sm:text-sm text-slate-100/90 leading-relaxed">
                  يحلّل اتجاهات الإنتاج حسب نوع الخام أو الفترة الزمنية، ويستخرج
                  جداول ورسومًا بيانية جاهزة للإدراج في الدراسات والأبحاث
                  الأكاديمية.
                </p>
              </div>
              <div className="rounded-2xl bg-[#004366]/80 px-4 py-4 ">
                <p className="text-sm font-bold mb-1">مستثمر أو مؤسسة إقليمية</p>
                <p className="text-xs sm:text-sm text-slate-100/90 leading-relaxed">
                  يستكشف الدول والخامات ذات النمو المتسارع، يقارن مساهمة كل دولة
                  في الإنتاج العربي والعالمي، ويحدد أولويات الشراكات أو المشاريع
                  المشتركة.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional content: benefits & roadmap */}
        <section className="mt-10">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white/95 p-6 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/80">
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                ماذا تقدّم لك البوابة اليوم؟
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <i className="mt-1 fa-solid fa-circle-check text-[#005A8D]" />
                  <span>لوحات جاهزة لمتابعة حجم وتطور الإنتاج التعديني العربي.</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="mt-1 fa-solid fa-circle-check text-[#005A8D]" />
                  <span>مقارنات سريعة بين الدول والخامات والفترات الزمنية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="mt-1 fa-solid fa-circle-check text-[#005A8D]" />
                  <span>مصادر موثوقة للبيانات يمكن الرجوع إليها في الدراسات والتقارير.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-slate-50/80 p-6 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/80">
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                خريطة الطريق للنسخ القادمة
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
                <div className="rounded-2xl bg-white px-3 py-3 shadow-sm shadow-slate-900/5 border border-slate-200/80">
                  <p className="text-xs font-semibold text-slate-500 mb-1">قريبًا</p>
                  <p className="font-bold text-slate-900 mb-1">مؤشرات إضافية</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    إضافة مؤشرات حول الاستهلاك المحلي والقيمة المضافة.
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-3 py-3 shadow-sm shadow-slate-900/5 border border-slate-200/80">
                  <p className="text-xs font-semibold text-slate-500 mb-1">مرحلة 2</p>
                  <p className="font-bold text-slate-900 mb-1">لوحات تفاعلية</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    تخصيص اللوحات حسب نوع المستخدم وقطاع الاهتمام.
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-3 py-3 shadow-sm shadow-slate-900/5 border border-slate-200/80">
                  <p className="text-xs font-semibold text-slate-500 mb-1">مرحلة 3</p>
                  <p className="font-bold text-slate-900 mb-1">تكاملات خارجية</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ربط البوابة مع أنظمة إحصائية ومنصات بيانات عربية أخرى.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ / guidance section */}
        <section className="mt-10">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-white/95 p-6 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200/80">
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                كيف أبدأ باستخدام البوابة؟
              </h3>
              <ol className="mt-3 list-decimal pr-5 space-y-1 text-sm text-slate-700">
                <li>اختر الدولة أو الخام الذي يهمك من الصفحة الرئيسية.</li>
                <li>انتقل إلى لوحة المؤشرات المناسبة من قسم المؤشرات.</li>
                <li>حمّل الجداول أو الرسوم البيانية التي تحتاجها للتقرير أو الدراسة.</li>
              </ol>
            </div>

            <div className="rounded-3xl bg-slate-50/90 p-6 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/80">
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                أسئلة شائعة سريعة
              </h3>
              <details className="group mb-2">
                <summary className="cursor-pointer text-sm font-semibold text-slate-800 flex items-center justify-between">
                  ما مصدر البيانات المستعملة؟
                  <i className="fa-solid fa-chevron-down text-[10px] text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  تعتمد النسخة التجريبية على بيانات منشورة من منظمات دولية وإقليمية،
                  مع توحيد أولي للتصنيفات والوحدات.
                </p>
              </details>
              <details className="group mb-2">
                <summary className="cursor-pointer text-sm font-semibold text-slate-800 flex items-center justify-between">
                  هل يمكن تنزيل البيانات الخام؟
                  <i className="fa-solid fa-chevron-down text-[10px] text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  في النسخة الحالية، يمكن تنزيل جداول وتلخيصات جاهزة، مع خطة لإتاحة
                  واجهات برمجة تطبيقات (APIs) لاحقًا.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer text-sm font-semibold text-slate-800 flex items-center justify-between">
                  لمن تُوجَّه هذه البوابة؟
                  <i className="fa-solid fa-chevron-down text-[10px] text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  لصنّاع القرار في وزارات التعدين، والهيئات الإحصائية، والباحثين،
                  والمؤسسات الإقليمية المهتمة بالثروات المعدنية العربية.
                </p>
              </details>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#005A8D] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-slate-900/20 hover:bg-[#004366]"
              >
                <span>المزيد من الأسئلة</span>
                <i className="fa-solid fa-arrow-left text-[10px]" />
              </button>
            </div>

            <div className="rounded-3xl bg-[#005A8D]/5 p-6 shadow-inner ring-1 ring-[#005A8D]/20">
              <h3 className="text-lg font-extrabold text-[#005A8D] mb-2">
                ملاحظات على النسخة التجريبية
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                هذه النسخة تمثّل نموذجًا أوليًا لبوابة المؤشرات التعدينية العربية.
                سيتم توسيع النطاق الزمني، إضافة مؤشرات نوعية جديدة، وتحسين تجربة
                الاستخدام بناءً على ملاحظات المستخدمين والشركاء في الدول العربية.
              </p>
            </div>
          </div>
        </section>

        {/* Sources / sponsors */}
        <section className="mt-10" aria-label="المراجع والمصادر">
          <div className="rounded-3xl bg-white/95 p-5 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200/70">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#005A8D]">
                  المراجع والمصادر
                </h2>
                <p className="text-sm text-slate-500">
                  عرض لجميع المصادر الموثوقة
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="relative h-32">
                {sponsorSlides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      index === sponsorSlide
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {slide.map((s) => (
                        <a
                          key={s.href + s.title + index}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-900/10"
                        >
                          <img
                            src={s.img}
                            alt={s.title}
                            className="h-full w-full object-contain p-3"
                          />
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/95 px-3 text-center opacity-0 transition-opacity group-hover:opacity-100">
                            <div>
                              <p className="mb-1 text-base font-extrabold text-[#005A8D]">
                                {s.title}
                              </p>
                              <p className="text-sm text-slate-500">
                                {s.subtitle}
                              </p>
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

    
      </main>

      <Footer />

      {/* Floating chatbot button */}
      <button
        type="button"
        onClick={handleChatbotClick}
        title="محلّل البيانات الذكي"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-white/90 px-3 py-2 text-right shadow-xl shadow-slate-900/25 backdrop-blur-md transition hover:-translate-y-1 hover:shadow-2xl"
      >
        <span className="absolute right-3 top-2 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px] shadow-emerald-500/30" />
        <span className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-amber-400/70 bg-gradient-to-br from-[#005A8D] to-[#005A8D] text-white">
          <i className="fa-solid fa-robot" />
        </span>
        <span className="hidden flex-col text-sm leading-tight text-slate-700 sm:flex">
          <span className="font-extrabold text-[#005A8D]">Chat Bote</span>
          <span className="text-sm text-slate-500">
            محلّل البيانات الذكي
          </span>
        </span>
      </button>
    </div>
  );
};

export default Home;

