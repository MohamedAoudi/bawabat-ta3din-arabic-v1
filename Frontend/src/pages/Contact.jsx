import React, { useState, useContext } from "react";
import { Mail, Phone, MapPin, Send, Clock, Globe } from "lucide-react";
import { LanguageContext, ThemeContext } from "../App";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";

const CONTACT_TRANSLATIONS = {
  ar: {
    pageTitle: "اتصل بنا",
    heroText: "نحن هنا لمساعدتك. تواصل معنا لأي استفسارات حول البوابة أو البيانات التعدينية العربية.",
    contactForm: "نموذج الاتصال",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    subject: "الموضوع",
    message: "الرسالة",
    sendMessage: "إرسال الرسالة",
    contactInfo: "معلومات الاتصال",
    officeHours: "ساعات العمل",
    mondayFriday: "الاثنين - الجمعة",
    saturday: "السبت",
    sunday: "الأحد",
    closed: "مغلق",
    responseTime: "وقت الرد",
    responseText: "نرد عادةً خلال 24-48 ساعة",
    visitUs: "زورونا",
    address: "العنوان",
    addressText: "بوابة المؤشرات التعدينية العربية",
    phone: "الهاتف",
    emailContact: "البريد الإلكتروني",
    socialMedia: "وسائل التواصل الاجتماعي",
    followUs: "تابعنا",
    successMessage: "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.",
    errorMessage: "حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
    requiredField: "هذا الحقل مطلوب",
    invalidEmail: "يرجى إدخال بريد إلكتروني صحيح",
    sending: "جاري الإرسال...",
    support: "الدعم الفني",
    supportText: "للمساعدة الفنية والأسئلة التقنية",
    data: "استفسارات البيانات",
    dataText: "للاستفسارات حول البيانات والمؤشرات",
    partnership: "الشراكات",
    partnershipText: "للشراكات والتعاون",
    general: "عام",
    generalText: "للاستفسارات العامة",
  },
  fr: {
    pageTitle: "Contactez-nous",
    heroText: "Nous sommes là pour vous aider. Contactez-nous pour toute question concernant le portail ou les données minières arabes.",
    contactForm: "Formulaire de contact",
    name: "Nom complet",
    email: "Adresse e-mail",
    subject: "Sujet",
    message: "Message",
    sendMessage: "Envoyer le message",
    contactInfo: "Informations de contact",
    officeHours: "Heures d'ouverture",
    mondayFriday: "Lundi - Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
    closed: "Fermé",
    responseTime: "Délai de réponse",
    responseText: "Nous répondons généralement sous 24-48 heures",
    visitUs: "Visitez-nous",
    address: "Adresse",
    addressText: "Portail des indicateurs miniers arabes",
    phone: "Téléphone",
    emailContact: "E-mail",
    socialMedia: "Réseaux sociaux",
    followUs: "Suivez-nous",
    successMessage: "Votre message a été envoyé avec succès ! Nous vous contacterons bientôt.",
    errorMessage: "Une erreur s'est produite lors de l'envoi. Veuillez réessayer.",
    requiredField: "Ce champ est requis",
    invalidEmail: "Veuillez saisir une adresse e-mail valide",
    sending: "Envoi en cours...",
    support: "Support technique",
    supportText: "Pour l'assistance technique et les questions techniques",
    data: "Requêtes de données",
    dataText: "Pour les questions sur les données et indicateurs",
    partnership: "Partenariats",
    partnershipText: "Pour les partenariats et collaborations",
    general: "Général",
    generalText: "Pour les questions générales",
  },
  en: {
    pageTitle: "Contact Us",
    heroText: "We're here to help. Contact us for any inquiries about the portal or Arab mining data.",
    contactForm: "Contact Form",
    name: "Full Name",
    email: "Email Address",
    subject: "Subject",
    message: "Message",
    sendMessage: "Send Message",
    contactInfo: "Contact Information",
    officeHours: "Office Hours",
    mondayFriday: "Monday - Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    closed: "Closed",
    responseTime: "Response Time",
    responseText: "We typically respond within 24-48 hours",
    visitUs: "Visit Us",
    address: "Address",
    addressText: "Arab Mining Indicators Portal",
    phone: "Phone",
    emailContact: "Email",
    socialMedia: "Social Media",
    followUs: "Follow Us",
    successMessage: "Your message has been sent successfully! We'll get back to you soon.",
    errorMessage: "An error occurred while sending. Please try again.",
    requiredField: "This field is required",
    invalidEmail: "Please enter a valid email address",
    sending: "Sending...",
    support: "Technical Support",
    supportText: "For technical assistance and technical questions",
    data: "Data Inquiries",
    dataText: "For questions about data and indicators",
    partnership: "Partnerships",
    partnershipText: "For partnerships and collaborations",
    general: "General",
    generalText: "For general inquiries",
  },
};

const SUBJECT_OPTIONS = [
  { value: "support", labelKey: "support" },
  { value: "data", labelKey: "data" },
  { value: "partnership", labelKey: "partnership" },
  { value: "general", labelKey: "general" },
];

const Contact = () => {
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const t = CONTACT_TRANSLATIONS[language] || CONTACT_TRANSLATIONS.ar;
  const isArabic = language === "ar";

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t.requiredField;
    }

    if (!formData.email.trim()) {
      newErrors.email = t.requiredField;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.invalidEmail;
    }

    if (!formData.subject) {
      newErrors.subject = t.requiredField;
    }

    if (!formData.message.trim()) {
      newErrors.message = t.requiredField;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real application, you would send the data to your backend
      console.log("Form submitted:", formData);

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      lang={language}
      className="min-h-screen font-['Cairo'] text-slate-800"
      style={{ background: isDarkMode ? "#071611" : "#F4F7F5" }}
    >
      <Menu />

      <div className="relative overflow-hidden bg-[#082721] pb-36 pt-16 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ddbc6b 1px, transparent 1px)", size: "20px 20px" }}></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}
          >
            <Mail size={14} strokeWidth={2.2} />
            {t.pageTitle}
          </span>
          <h1 className="mb-4 text-4xl font-black md:text-5xl">
            {t.pageTitle}
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
            {t.heroText}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20" style={{ transform: "translateY(2px)" }}>
          <svg className="relative block w-full h-[56px] md:h-[90px] lg:h-[120px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill={isDarkMode ? "#0b221b" : "#F4F7F5"} fillOpacity="0.4" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L0,320Z" />
            <path fill={isDarkMode ? "#071611" : "#F4F7F5"} fillOpacity="1" d="M0,288L60,261.3C120,235,240,181,360,149.3C480,117,600,107,720,122.7C840,139,960,181,1080,186.7C1200,192,1320,160,1380,144L1440,128L1440,320L0,320Z" />
          </svg>
        </div>
      </div>

      <main className="container mx-auto px-3 sm:px-4 -mt-24 pb-12 relative z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Contact Form */}
          <section className="rounded-3xl border border-slate-200/70 bg-white shadow-xl shadow-slate-900/10 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082721] mb-6">
              {t.contactForm}
            </h2>

            {submitStatus === "success" && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
                {t.successMessage}
              </div>
            )}

            {submitStatus === "error" && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
                {t.errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  {t.name} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-colors ${
                    errors.name ? "border-red-300" : "border-slate-300"
                  }`}
                  placeholder={t.name}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  {t.email} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-colors ${
                    errors.email ? "border-red-300" : "border-slate-300"
                  }`}
                  placeholder={t.email}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                  {t.subject} *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-colors ${
                    errors.subject ? "border-red-300" : "border-slate-300"
                  }`}
                >
                  <option value="">{t.subject}</option>
                  {SUBJECT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {t[option.labelKey]}
                    </option>
                  ))}
                </select>
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                  {t.message} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-colors resize-vertical ${
                    errors.message ? "border-red-300" : "border-slate-300"
                  }`}
                  placeholder={t.message}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#C9A84C] text-white rounded-lg font-bold hover:bg-[#B8954A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t.sending}
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {t.sendMessage}
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Contact Information */}
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200/70 bg-white shadow-xl shadow-slate-900/10 p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082721] mb-6">
                {t.contactInfo}
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-[#C9A84C]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#082721] mb-1">{t.emailContact}</h3>
                    <a href="mailto:contact@amip.org" className="text-slate-600 hover:text-[#C9A84C] transition-colors">
                      contact@amip.org
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-[#C9A84C]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#082721] mb-1">{t.phone}</h3>
                    <a href="tel:+1234567890" className="text-slate-600 hover:text-[#C9A84C] transition-colors">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-[#C9A84C]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#082721] mb-1">{t.address}</h3>
                    <p className="text-slate-600">{t.addressText}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white shadow-xl shadow-slate-900/10 p-6 sm:p-8">
              <h3 className="text-xl font-extrabold text-[#082721] mb-4 flex items-center gap-2">
                <Clock size={20} className="text-[#C9A84C]" />
                {t.officeHours}
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-700">{t.mondayFriday}</span>
                  <span className="font-medium text-[#082721]">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-700">{t.saturday}</span>
                  <span className="font-medium text-[#082721]">9:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-700">{t.sunday}</span>
                  <span className="font-medium text-red-600">{t.closed}</span>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-[#C9A84C]/5 border border-[#C9A84C]/20">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={16} className="text-[#C9A84C]" />
                  <span className="font-bold text-[#082721]">{t.responseTime}</span>
                </div>
                <p className="text-sm text-slate-600">{t.responseText}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-[#082721] to-[#0d3d34] text-white shadow-xl shadow-slate-900/30 p-6 sm:p-8">
              <h3 className="text-xl font-extrabold mb-4 flex items-center gap-2">
                <Globe size={20} className="text-[#C9A84C]" />
                {t.socialMedia}
              </h3>

              <p className="text-white/80 mb-4">{t.followUs}</p>

              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#C9A84C] flex items-center justify-center transition-colors">
                  <span className="text-white font-bold">f</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#C9A84C] flex items-center justify-center transition-colors">
                  <span className="text-white font-bold">t</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#C9A84C] flex items-center justify-center transition-colors">
                  <span className="text-white font-bold">in</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#C9A84C] flex items-center justify-center transition-colors">
                  <span className="text-white font-bold">y</span>
                </a>
              </div>
            </div>
          </section>
        </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;