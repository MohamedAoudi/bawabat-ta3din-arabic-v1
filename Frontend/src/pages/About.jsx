import React from "react";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";

const About = () => {
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
        className="bg-gradient-to-r from-[#005A8D] to-[#005A8D] text-white pt-16 pb-24 -mb-12 text-center"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 85%, 0% 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2mb-3 text-4xl sm:text-5xl md:text-6xl font-extrabold">عن البوابة</h1>
          <p className="mx-auto max-w-4xl text-lg sm:text-xl text-white/80">
            تعريف + أهداف + منهجية (ستضيفها لاحقًا)
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 space-y-8">
        {/* تعريف البوابة */}
        <section className="bg-white/95 rounded-3xl shadow-lg shadow-slate-900/10 border border-slate-200/70 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3">
            ما هي بوابة المؤشرات التعدينية العربية (AMIP)؟
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            بوابة المؤشرات التعدينية العربية هي مبادرة تهدف إلى توفير منصة عربية موحّدة
            لبيانات ومؤشرات الإنتاج التعديني في الدول العربية. تجمع البوابة بين
            الجداول الرقمية والرسوم البيانية والخرائط التفاعلية، لتسهيل الوصول إلى
            معلومات موثوقة وحديثة تدعم اتخاذ القرار والاستثمار والبحث العلمي في قطاع
            الثروات المعدنية.
          </p>
        </section>

        {/* الأهداف الرئيسية */}
        <section className="bg-white/95 rounded-3xl shadow-lg shadow-slate-900/10 border border-slate-200/70 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3">
            الأهداف الرئيسية للبوابة
          </h2>
          <ul className="mt-2 space-y-2 text-sm sm:text-base text-slate-700">
            <li className="flex items-start gap-2">
              <i className="mt-1 fa-solid fa-circle-check text-[#005A8D]" />
              <span>تجميع وتوحيد بيانات الإنتاج التعديني العربي في قاعدة موحّدة.</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="mt-1 fa-solid fa-circle-check text-[#005A8D]" />
              <span>
                تمكين صُنّاع القرار والهيئات الإحصائية من متابعة التطورات والاتجاهات
                الرئيسة في القطاع.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <i className="mt-1 fa-solid fa-circle-check text-[#005A8D]" />
              <span>تسهيل إعداد التقارير والدراسات والبحوث الأكاديمية المتخصصة.</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="mt-1 fa-solid fa-circle-check text-[#005A8D]" />
              <span>
                دعم مبادرات التكامل والتعاون العربي في مجال الثروات المعدنية والاستثمارات
                المشتركة.
              </span>
            </li>
          </ul>
        </section>

        {/* منهجية العمل والبيانات */}
        <section className="bg-slate-50/90 rounded-3xl shadow-lg shadow-slate-900/5 border border-slate-200/80 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3">
            منهجية العمل والبيانات في النسخة التجريبية
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-3">
            تعتمد النسخة التجريبية الحالية على تجميع بيانات منشورة من منظمات دولية
            وإقليمية، بالإضافة إلى بعض المصادر الوطنية المختارة. يتم توحيد التصنيفات
            والوحدات قدر الإمكان، مع الإشارة إلى أي فروقات منهجية في الملاحظات
            المصاحبة للبيانات.
          </p>
          <ul className="mt-2 space-y-1 text-xs sm:text-sm text-slate-600 list-disc pr-5">
            <li>النطاق الزمني الحالي: تقريبًا 2010–2025 (قابل للتوسّع في النسخ القادمة).</li>
            <li>تركيز أولي على مؤشرات الإنتاج الكمي لبعض الخامات الرئيسة.</li>
            <li>اعتماد توثيق واضح لكل مصدر من خلال صفحة المراجع والمصادر.</li>
          </ul>
        </section>

        {/* ملاحظات حول النسخة V1 */}
        <section className="rounded-3xl bg-[#005A8D]/5 p-6 sm:p-7 shadow-inner ring-1 ring-[#005A8D]/20">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#005A8D] mb-2">
            عن النسخة الأولية (V1 Prototype)
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            هذه النسخة تمثّل نموذجًا أوليًا لواجهة البوابة، وتهدف إلى استكشاف شكل
            وتجربة الاستخدام قبل الانتقال إلى تطوير نسخة تشغيلية كاملة. سيتم تطوير
            المكوّنات التقنية، وتوسيع قاعدة البيانات، وإضافة إمكانيات جديدة مثل
            واجهات برمجة التطبيقات والتكامل مع أنظمة إحصائية أخرى، بناءً على
            التغذية الراجعة من الدول الأعضاء والجهات الشريكة.
          </p>
        </section>

        {/* أصحاب المصلحة الرئيسيون */}
        <section className="bg-white/95 rounded-3xl shadow-lg shadow-slate-900/10 border border-slate-200/70 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3">
            من المستفيد من البوابة؟
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-4">
              <p className="text-sm font-bold text-slate-900 mb-1">
                صُنّاع القرار والهيئات الحكومية
              </p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                استخدام المؤشرات لمتابعة الأداء الوطني، مقارنة الدول، وتوجيه السياسات
                العامة والاستثمارات في قطاع التعدين.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-4">
              <p className="text-sm font-bold text-slate-900 mb-1">
                الباحثون والجامعات
              </p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                توفير بيانات موثوقة لدعم الرسائل العلمية والدراسات المتخصصة حول
                الثروات المعدنية والتنمية الاقتصادية.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-4">
              <p className="text-sm font-bold text-slate-900 mb-1">
                المستثمرون والمؤسسات الإقليمية
              </p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                استكشاف فرص الاستثمار والتكامل بين الدول العربية اعتمادًا على بيانات
                مقارنة وواضحة.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-4">
              <p className="text-sm font-bold text-slate-900 mb-1">
                الرأي العام والمهتمون بالقطاع
              </p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                إتاحة معلومات مبسّطة حول تطور الإنتاج التعديني بما يعزّز الشفافية
                ومعرفة الجمهور بأهمية هذا القطاع.
              </p>
            </div>
          </div>
        </section>

        {/* نظرة مستقبلية */}
        <section className="rounded-3xl bg-gradient-to-r from-[#005A8D] to-[#004366] p-6 sm:p-7 text-white shadow-xl shadow-slate-900/30 ring-1 ring-[#00324D]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="sm:max-w-md">
              <h2 className="text-xl sm:text-2xl font-extrabold mb-2">
                نحو منصة عربية متكاملة للمؤشرات التعدينية
              </h2>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                تسعى البوابة في نسخها القادمة إلى أن تكون مرجعًا عربيًا متقدّمًا
                للمؤشرات التعدينية، مع تكامل أكبر مع الأنظمة الإحصائية الوطنية
                والمنصات الإقليمية والدولية.
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <div className="rounded-2xl bg-white/10 px-4 py-4 sm:px-5 sm:py-5 border border-white/20 text-xs sm:text-sm">
                <p className="mb-2 font-semibold">محاور تطوير مستقبلية مقترحة:</p>
                <ul className="space-y-1 list-disc pr-4 text-white/90">
                  <li>إضافة مؤشرات نوعية حول الاستدامة والبعد البيئي في التعدين.</li>
                  <li>تطوير واجهات برمجة تطبيقات (APIs) لخدمة الأنظمة الوطنية.</li>
                  <li>إدماج خرائط جيولوجية وبيانات مكانية تفاعلية.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;

