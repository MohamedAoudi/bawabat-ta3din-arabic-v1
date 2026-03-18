import React from "react";
import { Building2, ChartLine, Database, Link2, Shield } from "lucide-react";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";

const pillars = [
  {
    icon: Database,
    title: "توحيد البيانات",
    text: "تجميع بيانات التعدين من مصادر عربية ودولية ضمن نموذج موحد يسهل المقارنة والتحليل.",
  },
  {
    icon: ChartLine,
    title: "تحليل قابل للاستخدام",
    text: "تحويل الأرقام الخام إلى مؤشرات ولوحات تفاعلية تساعد صناع القرار والباحثين على القراءة السريعة.",
  },
  {
    icon: Shield,
    title: "حوكمة وشفافية",
    text: "توثيق المنهجية والمصدر وتحديثات البيانات بما يضمن الثقة والوضوح في كل مؤشر منشور.",
  },
  {
    icon: Link2,
    title: "تكامل عربي",
    text: "دعم التعاون بين الجهات الوطنية عبر لغة بيانات مشتركة تعزز التكامل الاقتصادي والتعديني.",
  },
];

const phases = [
  {
    title: "المرحلة الحالية - النموذج الأولي",
    desc: "اختبار تجربة المستخدم، التحقق من جودة النماذج المرئية، وجمع الملاحظات من الجهات الشريكة.",
  },
  {
    title: "المرحلة الثانية - توسيع المحتوى",
    desc: "زيادة عدد المؤشرات، إضافة سلاسل زمنية أعمق، ورفع جودة البيانات الوصفية لكل خام ودولة.",
  },
  {
    title: "المرحلة الثالثة - التكامل التقني",
    desc: "إطلاق خدمات تبادل بيانات عبر واجهات تطبيقات لربط البوابة بالمنصات الوطنية والإقليمية.",
  },
  {
    title: "المرحلة الرابعة - منصة تشغيلية كاملة",
    desc: "تحسينات الأداء، صلاحيات المستخدمين، أدوات تنزيل متقدمة، وتحليلات تنبؤية داعمة للتخطيط.",
  },
];

const faq = [
  {
    q: "هل بيانات البوابة رسمية؟",
    a: "تعتمد البوابة على مصادر منشورة وموثقة، مع الإشارة الواضحة لكل مصدر وحدود المنهجية المستخدمة.",
  },
  {
    q: "هل يمكن المقارنة بين الدول مباشرة؟",
    a: "نعم، مع مراعاة الملاحظات المنهجية الخاصة بالتصنيف والوحدات والتغطية الزمنية لكل دولة.",
  },
  {
    q: "هل سيتم توفير API؟",
    a: "ضمن خطة التطوير القادمة، بهدف دعم التكامل مع الأنظمة الإحصائية الوطنية والمؤسسات البحثية.",
  },
];

const About = () => {
  return (
    <div dir="rtl" lang="ar" className="min-h-screen text-slate-800 bg-[#f4f2ec]">
      <Menu />

      <header
        className="pt-14 pb-20 -mb-10 text-center relative overflow-hidden"
        style={{ background: "#082721", clipPath: "polygon(0 0,100% 0,100% 82%,0% 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(201,168,76,0.5), transparent 40%), radial-gradient(circle at 80% 0%, rgba(94,203,170,0.35), transparent 35%)",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}
          >
            <Building2 size={14} strokeWidth={2.2} />
            بوابة المؤشرات التعدينية العربية
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
           عن البوابة
          </h1>
          <p className="mx-auto mt-3 text-sm sm:text-base text-slate-200 leading-relaxed">
            منصة عربية موحدة لبناء مرجع موثوق للبيانات والمؤشرات التعدينية، تجمع بين
            الدقة الإحصائية والواجهة التفاعلية لدعم السياسات، وتوجيه الاستثمار، وتعزيز
            المعرفة القطاعية على مستوى المنطقة.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 space-y-8">
        <section className="rounded-3xl border border-slate-200/70 bg-white shadow-xl shadow-slate-900/10 p-6 sm:p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082721] mb-3">
                الرؤية
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                أن تصبح البوابة المرجع العربي الأول للمؤشرات التعدينية، وأن تمثل نقطة
                التقاء موحدة بين الجهات الحكومية والقطاع الخاص والمؤسسات البحثية، بما
                يرفع كفاءة استخدام البيانات في التخطيط والتنمية المستدامة.
              </p>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082721] mb-3">
                الرسالة
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                تقديم بيانات تعدينية عربية قابلة للفهم والمقارنة، من خلال معايير توثيق
                واضحة، وتحديثات دورية، وتصميم تفاعلي يسهل قراءة المؤشرات واستخلاص
                المعرفة المطلوبة لاتخاذ القرار.
              </p>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-[#082721]/5 border border-[#082721]/15 p-4 text-center">
              <p className="text-2xl font-black text-[#082721]">21</p>
              <p className="text-xs text-slate-600 mt-1">دولة عربية</p>
            </div>
            <div className="rounded-2xl bg-[#082721]/5 border border-[#082721]/15 p-4 text-center">
              <p className="text-2xl font-black text-[#082721]">111</p>
              <p className="text-xs text-slate-600 mt-1">منتج وخام</p>
            </div>
            <div className="rounded-2xl bg-[#082721]/5 border border-[#082721]/15 p-4 text-center">
              <p className="text-2xl font-black text-[#082721]">2010-2024</p>
              <p className="text-xs text-slate-600 mt-1">نطاق زمني أولي</p>
            </div>
            <div className="rounded-2xl bg-[#082721]/5 border border-[#082721]/15 p-4 text-center">
              <p className="text-2xl font-black text-[#082721]">3000+</p>
              <p className="text-xs text-slate-600 mt-1">سجل معلوماتي</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-900/5 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-5">
            الركائز الأساسية للبوابة
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {pillars.map((item, idx) => (
              <article
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#082721] text-[#e8d08a] flex items-center justify-center">
                    <item.icon size={18} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#082721]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-[#082721] to-[#0d3d34] text-white shadow-xl shadow-slate-900/30 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold mb-4">
            منهجية العمل في النسخة التجريبية
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
              <p className="text-sm font-bold text-[#e8d08a] mb-2">1) الجمع والتحقق</p>
              <p className="text-sm text-white/85 leading-relaxed">
                جمع البيانات من مصادر معتمدة، ثم إجراء تحقق أولي للتناسق البنيوي
                واكتمال القيم الأساسية.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
              <p className="text-sm font-bold text-[#e8d08a] mb-2">2) التوحيد والمعالجة</p>
              <p className="text-sm text-white/85 leading-relaxed">
                توحيد الوحدات والتصنيفات، ومعالجة الفروقات المنهجية بما يضمن عرضًا
                قابلا للمقارنة.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
              <p className="text-sm font-bold text-[#e8d08a] mb-2">3) النشر والتحديث</p>
              <p className="text-sm text-white/85 leading-relaxed">
                نشر المؤشرات عبر لوحات تفاعلية مع خطط تحديث مرحلية وتوثيق دوري للمصادر.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-900/5 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-5">
            خارطة الطريق
          </h2>
          <div className="space-y-4">
            {phases.map((phase, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5"
              >
                <p className="text-sm sm:text-base font-extrabold text-[#082721]">
                  {phase.title}
                </p>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">{phase.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-900/5 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4">
            من هم المستفيدون من البوابة؟
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm font-bold text-slate-900 mb-1">الجهات الحكومية</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                متابعة الأداء الوطني، المقارنة الإقليمية، ودعم صياغة السياسات القطاعية.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm font-bold text-slate-900 mb-1">المستثمرون</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                تقييم الفرص التعدينية بناءً على مؤشرات كمية وقراءة اتجاهات السوق العربي.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm font-bold text-slate-900 mb-1">الباحثون والجامعات</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                توفير قاعدة بيانات مرجعية للدراسات الأكاديمية والبحوث التطبيقية.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm font-bold text-slate-900 mb-1">المنظمات الإقليمية</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                دعم برامج التكامل العربي ورصد تطور سلاسل القيمة المعدنية المشتركة.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-[#082721]/5 shadow-inner ring-1 ring-[#082721]/15 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#082721] mb-4">
            أسئلة شائعة
          </h2>
          <div className="space-y-3">
            {faq.map((item, idx) => (
              <details key={idx} className="rounded-xl border border-[#082721]/15 bg-white p-4">
                <summary className="cursor-pointer font-bold text-[#082721]">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-r from-[#082721] to-[#051712] p-6 sm:p-8 text-white shadow-xl shadow-slate-900/30 ring-1 ring-[#ddbc6b]/30">
          <h2 className="text-xl sm:text-2xl font-extrabold mb-2">
            دعوة للشراكة والتغذية الراجعة
          </h2>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed">
            التطوير المستمر للبوابة يعتمد على التعاون مع الجهات الوطنية والخبراء
            والمؤسسات الأكاديمية. نرحب بالمقترحات المتعلقة بجودة البيانات، وتطوير
            المؤشرات، وتحسين تجربة الاستخدام بما يخدم مستقبل قطاع التعدين العربي.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
