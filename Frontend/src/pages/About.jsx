import React, { useContext } from "react";
import { Building2, ChartLine, Database, Link2, Shield } from "lucide-react";
import { LanguageContext } from "../App";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";

const ABOUT_TRANSLATIONS = {
  ar: {
    portalBadge: "بوابة المؤشرات التعدينية العربية",
    pageTitle: "عن البوابة",
    heroText: "منصة عربية موحدة لبناء مرجع موثوق للبيانات والمؤشرات التعدينية، تجمع بين الدقة الإحصائية والواجهة التفاعلية لدعم السياسات، وتوجيه الاستثمار، وتعزيز المعرفة القطاعية على مستوى المنطقة.",
    vision: "الرؤية",
    visionText: "أن تصبح البوابة المرجع العربي الأول للمؤشرات التعدينية، وأن تمثل نقطة التقاء موحدة بين الجهات الحكومية والقطاع الخاص والمؤسسات البحثية، بما يرفع كفاءة استخدام البيانات في التخطيط والتنمية المستدامة.",
    mission: "الرسالة",
    missionText: "تقديم بيانات تعدينية عربية قابلة للفهم والمقارنة، من خلال معايير توثيق واضحة، وتحديثات دورية، وتصميم تفاعلي يسهل قراءة المؤشرات واستخلاص المعرفة المطلوبة لاتخاذ القرار.",
    statCountries: "دولة عربية",
    statProducts: "منتج وخام",
    statTimeline: "نطاق زمني أولي",
    statRecords: "سجل معلوماتي",
    pillarsTitle: "الركائز الأساسية للبوابة",
    methodologyTitle: "منهجية العمل في النسخة التجريبية",
    method1Title: "1) الجمع والتحقق",
    method1Text: "جمع البيانات من مصادر معتمدة، ثم إجراء تحقق أولي للتناسق البنيوي واكتمال القيم الأساسية.",
    method2Title: "2) التوحيد والمعالجة",
    method2Text: "توحيد الوحدات والتصنيفات، ومعالجة الفروقات المنهجية بما يضمن عرضًا قابلا للمقارنة.",
    method3Title: "3) النشر والتحديث",
    method3Text: "نشر المؤشرات عبر لوحات تفاعلية مع خطط تحديث مرحلية وتوثيق دوري للمصادر.",
    roadmapTitle: "خارطة الطريق",
    beneficiariesTitle: "من هم المستفيدون من البوابة؟",
    faqTitle: "أسئلة شائعة",
    partnershipTitle: "دعوة للشراكة والتغذية الراجعة",
    partnershipText: "التطوير المستمر للبوابة يعتمد على التعاون مع الجهات الوطنية والخبراء والمؤسسات الأكاديمية. نرحب بالمقترحات المتعلقة بجودة البيانات، وتطوير المؤشرات، وتحسين تجربة الاستخدام بما يخدم مستقبل قطاع التعدين العربي.",
    pillars: [
      { title: "توحيد البيانات", text: "تجميع بيانات التعدين من مصادر عربية ودولية ضمن نموذج موحد يسهل المقارنة والتحليل." },
      { title: "تحليل قابل للاستخدام", text: "تحويل الأرقام الخام إلى مؤشرات ولوحات تفاعلية تساعد صناع القرار والباحثين على القراءة السريعة." },
      { title: "حوكمة وشفافية", text: "توثيق المنهجية والمصدر وتحديثات البيانات بما يضمن الثقة والوضوح في كل مؤشر منشور." },
      { title: "تكامل عربي", text: "دعم التعاون بين الجهات الوطنية عبر لغة بيانات مشتركة تعزز التكامل الاقتصادي والتعديني." },
    ],
    phases: [
      { title: "المرحلة الحالية - النموذج الأولي", desc: "اختبار تجربة المستخدم، التحقق من جودة النماذج المرئية، وجمع الملاحظات من الجهات الشريكة." },
      { title: "المرحلة الثانية - توسيع المحتوى", desc: "زيادة عدد المؤشرات، إضافة سلاسل زمنية أعمق، ورفع جودة البيانات الوصفية لكل خام ودولة." },
      { title: "المرحلة الثالثة - التكامل التقني", desc: "إطلاق خدمات تبادل بيانات عبر واجهات تطبيقات لربط البوابة بالمنصات الوطنية والإقليمية." },
      { title: "المرحلة الرابعة - منصة تشغيلية كاملة", desc: "تحسينات الأداء، صلاحيات المستخدمين، أدوات تنزيل متقدمة، وتحليلات تنبؤية داعمة للتخطيط." },
    ],
    beneficiaries: [
      { title: "الجهات الحكومية", text: "متابعة الأداء الوطني، المقارنة الإقليمية، ودعم صياغة السياسات القطاعية." },
      { title: "المستثمرون", text: "تقييم الفرص التعدينية بناءً على مؤشرات كمية وقراءة اتجاهات السوق العربي." },
      { title: "الباحثون والجامعات", text: "توفير قاعدة بيانات مرجعية للدراسات الأكاديمية والبحوث التطبيقية." },
      { title: "المنظمات الإقليمية", text: "دعم برامج التكامل العربي ورصد تطور سلاسل القيمة المعدنية المشتركة." },
    ],
    faq: [
      { q: "هل بيانات البوابة رسمية؟", a: "تعتمد البوابة على مصادر منشورة وموثقة، مع الإشارة الواضحة لكل مصدر وحدود المنهجية المستخدمة." },
      { q: "هل يمكن المقارنة بين الدول مباشرة؟", a: "نعم، مع مراعاة الملاحظات المنهجية الخاصة بالتصنيف والوحدات والتغطية الزمنية لكل دولة." },
      { q: "هل سيتم توفير API؟", a: "ضمن خطة التطوير القادمة، بهدف دعم التكامل مع الأنظمة الإحصائية الوطنية والمؤسسات البحثية." },
    ],
  },
  fr: {
    portalBadge: "Portail des indicateurs miniers arabes",
    pageTitle: "À propos du portail",
    heroText: "Une plateforme arabe unifiée conçue pour bâtir une référence fiable des données et indicateurs miniers, combinant rigueur statistique et interface interactive pour soutenir les politiques publiques, orienter l'investissement et renforcer la connaissance sectorielle à l'échelle régionale.",
    vision: "Vision",
    visionText: "Faire du portail la référence arabe de premier plan pour les indicateurs miniers et un point de rencontre commun entre institutions publiques, secteur privé et recherche, afin d'améliorer l'utilisation des données dans la planification et le développement durable.",
    mission: "Mission",
    missionText: "Fournir des données minières arabes compréhensibles et comparables grâce à des standards de documentation clairs, des mises à jour régulières et une conception interactive facilitant la lecture des indicateurs et l'extraction des connaissances utiles à la décision.",
    statCountries: "pays arabes",
    statProducts: "produits et minerais",
    statTimeline: "période initiale",
    statRecords: "enregistrements",
    pillarsTitle: "Piliers fondamentaux du portail",
    methodologyTitle: "Méthodologie de la version pilote",
    method1Title: "1) Collecte et vérification",
    method1Text: "Collecte des données à partir de sources approuvées puis vérification initiale de la cohérence structurelle et de l'exhaustivité des valeurs clés.",
    method2Title: "2) Harmonisation et traitement",
    method2Text: "Harmonisation des unités et des classifications, avec traitement des écarts méthodologiques pour garantir une présentation comparable.",
    method3Title: "3) Publication et mise à jour",
    method3Text: "Publication des indicateurs via des tableaux de bord interactifs avec des plans de mise à jour progressifs et une documentation régulière des sources.",
    roadmapTitle: "Feuille de route",
    beneficiariesTitle: "Qui bénéficie du portail ?",
    faqTitle: "Questions fréquentes",
    partnershipTitle: "Invitation au partenariat et aux retours",
    partnershipText: "L'amélioration continue du portail repose sur la coopération avec les autorités nationales, les experts et les institutions académiques. Les propositions liées à la qualité des données, au développement des indicateurs et à l'expérience utilisateur sont les bienvenues.",
    pillars: [
      { title: "Harmonisation des données", text: "Rassembler les données minières issues de sources arabes et internationales dans un modèle unifié facilitant comparaison et analyse." },
      { title: "Analyse exploitable", text: "Transformer les chiffres bruts en indicateurs et tableaux interactifs utiles aux décideurs et chercheurs." },
      { title: "Gouvernance et transparence", text: "Documenter la méthodologie, les sources et les mises à jour pour garantir confiance et clarté dans chaque indicateur publié." },
      { title: "Intégration arabe", text: "Soutenir la coopération entre institutions nationales grâce à un langage de données commun renforçant l'intégration économique et minière." },
    ],
    phases: [
      { title: "Phase actuelle - prototype", desc: "Tester l'expérience utilisateur, valider la qualité des modèles visuels et recueillir les retours des partenaires." },
      { title: "Deuxième phase - extension du contenu", desc: "Augmenter le nombre d'indicateurs, ajouter des séries temporelles plus profondes et améliorer les métadonnées pour chaque minerai et pays." },
      { title: "Troisième phase - intégration technique", desc: "Lancer des services d'échange de données via API afin de connecter le portail aux plateformes nationales et régionales." },
      { title: "Quatrième phase - plateforme opérationnelle complète", desc: "Améliorations de performance, gestion des accès, outils avancés de téléchargement et analyses prédictives pour la planification." },
    ],
    beneficiaries: [
      { title: "Administrations publiques", text: "Suivre les performances nationales, comparer au niveau régional et soutenir l'élaboration des politiques sectorielles." },
      { title: "Investisseurs", text: "Évaluer les opportunités minières à partir d'indicateurs quantitatifs et des tendances du marché arabe." },
      { title: "Chercheurs et universités", text: "Fournir une base de données de référence pour les études académiques et la recherche appliquée." },
      { title: "Organisations régionales", text: "Soutenir les programmes d'intégration arabe et suivre l'évolution des chaînes de valeur miniérales communes." },
    ],
    faq: [
      { q: "Les données du portail sont-elles officielles ?", a: "Le portail s'appuie sur des sources publiées et documentées, avec une indication claire de chaque source et des limites méthodologiques." },
      { q: "Peut-on comparer directement les pays ?", a: "Oui, tout en tenant compte des notes méthodologiques liées à la classification, aux unités et à la couverture temporelle de chaque pays." },
      { q: "Une API sera-t-elle disponible ?", a: "Oui, dans la feuille de route à venir, afin de soutenir l'intégration avec les systèmes statistiques nationaux et les institutions de recherche." },
    ],
  },
  en: {
    portalBadge: "Arab Mining Indicators Portal",
    pageTitle: "About the Portal",
    heroText: "A unified Arab platform built to provide a trusted reference for mining data and indicators, combining statistical rigor with an interactive interface to support policy, guide investment, and strengthen sector knowledge across the region.",
    vision: "Vision",
    visionText: "To become the leading Arab reference for mining indicators and a common meeting point for governments, the private sector, and research institutions, improving the use of data in planning and sustainable development.",
    mission: "Mission",
    missionText: "To provide Arab mining data that is understandable and comparable through clear documentation standards, regular updates, and an interactive design that simplifies reading indicators and extracting decision-ready insight.",
    statCountries: "Arab countries",
    statProducts: "products and ores",
    statTimeline: "initial time span",
    statRecords: "records",
    pillarsTitle: "Core Pillars of the Portal",
    methodologyTitle: "Pilot Version Methodology",
    method1Title: "1) Collection and validation",
    method1Text: "Collect data from approved sources, then run initial checks for structural consistency and completeness of key values.",
    method2Title: "2) Standardization and processing",
    method2Text: "Standardize units and classifications, while addressing methodological differences to ensure comparable presentation.",
    method3Title: "3) Publishing and updates",
    method3Text: "Publish indicators through interactive dashboards with phased update plans and regular source documentation.",
    roadmapTitle: "Roadmap",
    beneficiariesTitle: "Who Benefits from the Portal?",
    faqTitle: "Frequently Asked Questions",
    partnershipTitle: "Call for Partnership and Feedback",
    partnershipText: "The portal's continuous development depends on collaboration with national entities, experts, and academic institutions. We welcome proposals related to data quality, indicator development, and user experience improvements that support the future of the Arab mining sector.",
    pillars: [
      { title: "Data standardization", text: "Bring together mining data from Arab and international sources into a unified model that supports comparison and analysis." },
      { title: "Usable analysis", text: "Turn raw figures into indicators and interactive dashboards that help decision-makers and researchers read them quickly." },
      { title: "Governance and transparency", text: "Document methodology, source, and data updates to ensure trust and clarity in every published indicator." },
      { title: "Arab integration", text: "Support cooperation between national institutions through a shared data language that strengthens economic and mining integration." },
    ],
    phases: [
      { title: "Current phase - prototype", desc: "Test the user experience, validate the quality of visual models, and gather feedback from partner institutions." },
      { title: "Second phase - content expansion", desc: "Increase the number of indicators, add deeper time series, and improve descriptive metadata for each ore and country." },
      { title: "Third phase - technical integration", desc: "Launch data exchange services through APIs to connect the portal with national and regional platforms." },
      { title: "Fourth phase - full operational platform", desc: "Performance improvements, user permissions, advanced download tools, and predictive analytics to support planning." },
    ],
    beneficiaries: [
      { title: "Government entities", text: "Track national performance, compare regionally, and support the development of sector policies." },
      { title: "Investors", text: "Assess mining opportunities based on quantitative indicators and Arab market trend analysis." },
      { title: "Researchers and universities", text: "Provide a reference data base for academic studies and applied research." },
      { title: "Regional organizations", text: "Support Arab integration programs and monitor the evolution of shared mineral value chains." },
    ],
    faq: [
      { q: "Is the portal data official?", a: "The portal relies on published and documented sources, with clear references for each source and the limits of the methodology used." },
      { q: "Can countries be compared directly?", a: "Yes, while taking into account methodological notes related to classification, units, and time coverage for each country." },
      { q: "Will an API be available?", a: "It is part of the upcoming development roadmap to support integration with national statistical systems and research institutions." },
    ],
  },
};

const PILLAR_ICONS = [Database, ChartLine, Shield, Link2];

const About = () => {
  const { language } = useContext(LanguageContext);
  const t = ABOUT_TRANSLATIONS[language] || ABOUT_TRANSLATIONS.ar;
  const isArabic = language === "ar";

  return (
    <div dir={isArabic ? "rtl" : "ltr"} lang={language} className="min-h-screen text-slate-800 bg-[#f4f2ec]">
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
            {t.portalBadge}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
            {t.pageTitle}
          </h1>
          <p className="mx-auto mt-3 text-sm sm:text-base text-slate-200 leading-relaxed">
            {t.heroText}
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 space-y-8">
        <section className="rounded-3xl border border-slate-200/70 bg-white shadow-xl shadow-slate-900/10 p-6 sm:p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082721] mb-3">
                {t.vision}
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {t.visionText}
              </p>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082721] mb-3">
                {t.mission}
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {t.missionText}
              </p>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-[#082721]/5 border border-[#082721]/15 p-4 text-center">
              <p className="text-2xl font-black text-[#082721]">21</p>
              <p className="text-xs text-slate-600 mt-1">{t.statCountries}</p>
            </div>
            <div className="rounded-2xl bg-[#082721]/5 border border-[#082721]/15 p-4 text-center">
              <p className="text-2xl font-black text-[#082721]">111</p>
              <p className="text-xs text-slate-600 mt-1">{t.statProducts}</p>
            </div>
            <div className="rounded-2xl bg-[#082721]/5 border border-[#082721]/15 p-4 text-center">
              <p className="text-2xl font-black text-[#082721]">2010-2024</p>
              <p className="text-xs text-slate-600 mt-1">{t.statTimeline}</p>
            </div>
            <div className="rounded-2xl bg-[#082721]/5 border border-[#082721]/15 p-4 text-center">
              <p className="text-2xl font-black text-[#082721]">3000+</p>
              <p className="text-xs text-slate-600 mt-1">{t.statRecords}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-900/5 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-5">
            {t.pillarsTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {t.pillars.map((item, idx) => {
              const Icon = PILLAR_ICONS[idx];
              return (
              <article
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#082721] text-[#e8d08a] flex items-center justify-center">
                    <Icon size={18} strokeWidth={2.2} />
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
            );})}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-[#082721] to-[#0d3d34] text-white shadow-xl shadow-slate-900/30 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold mb-4">
            {t.methodologyTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
              <p className="text-sm font-bold text-[#e8d08a] mb-2">{t.method1Title}</p>
              <p className="text-sm text-white/85 leading-relaxed">
                {t.method1Text}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
              <p className="text-sm font-bold text-[#e8d08a] mb-2">{t.method2Title}</p>
              <p className="text-sm text-white/85 leading-relaxed">
                {t.method2Text}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
              <p className="text-sm font-bold text-[#e8d08a] mb-2">{t.method3Title}</p>
              <p className="text-sm text-white/85 leading-relaxed">
                {t.method3Text}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-900/5 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-5">
            {t.roadmapTitle}
          </h2>
          <div className="space-y-4">
            {t.phases.map((phase, idx) => (
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
            {t.beneficiariesTitle}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {t.beneficiaries.map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm font-bold text-slate-900 mb-1">{item.title}</p>
                <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-[#082721]/5 shadow-inner ring-1 ring-[#082721]/15 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#082721] mb-4">
            {t.faqTitle}
          </h2>
          <div className="space-y-3">
            {t.faq.map((item, idx) => (
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
            {t.partnershipTitle}
          </h2>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed">
            {t.partnershipText}
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
