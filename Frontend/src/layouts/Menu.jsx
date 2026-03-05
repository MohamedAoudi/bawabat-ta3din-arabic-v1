import { useState, useEffect } from "react";
import logoAmip from "../assets/logo n v.png";
import logoAidsmo from "../assets/aidsmo logo sans bg 800x 800.png";

const Menu = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isHome, setIsHome] = useState(true);

  useEffect(() => {
    // Detect if we are on the home page (path "/")
    if (typeof window !== "undefined") {
      setIsHome(window.location.pathname === "/");
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLangClick = () => {
    alert("FR (AR/EN لاحقًا) — زر تجريبي فقط.");
  };

  return (
  <nav
    className={`py-3 sticky top-0 z-40 transition-colors duration-300 ${
      isHome
        ? scrolled
          ? "bg-[#082721]/95 backdrop-blur border-b border-amber-400/60"
          : "bg-transparent"
        : "bg-[#082721] border-b border-amber-400/60"
    }`}
  >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10" dir="rtl">
        <div className=" gap-2 flex h-16 items-center justify-between">
          {/* Brand */}
          <a
            href="/"
            className="flex items-center gap-2 text-white font-bold bg-"
            aria-label="AMIP - بوابة المؤشرات التعدينية العربية"
          >
            <img
              src={logoAmip}
              alt="AMIP - بوابة المؤشرات التعدينية العربية"
              className="h-20 w-auto bg-white rounded-full px-8 py-1"
            />
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between lg:gap-12 text-lg">
            <ul className="flex items-center gap-1.5 text-lg text-slate-50">
              <li>
                <a
                  href="/"
                  className="rounded-full px-2 py-2 text-white/90 hover:text-white hover:bg-white/10 text-lg font-semibold"
                >
                  الرئيسية
                </a>
              </li>

              <li className="relative group">
                <button
                  type="button"
                  dir="ltr"
                  className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 text-lg font-semibold"
                >
                  <i className="fa-solid fa-chevron-down text-[10px]" />
                  <span dir="rtl">المؤشرات التعدينية</span>
                </button>
                <div className="absolute top-full  end-0 w-[320px] rounded-2xl bg-white py-3 text-right text-sm text-slate-800 shadow-xl ring-1 ring-slate-200 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 z-50">
                  <div className="px-2 space-y-2">
                    {/* الانتاج التعديني */}
                    <div className="relative mx-1 rounded-2xl bg-slate-50/80 p-2 group/production">
                      <button
                        type="button"
                        dir="ltr"
                        className="flex w-full cursor-pointer items-center justify-between"
                      >
                        <span className="flex items-center gap-1 text-[10px] text-slate-500">
                          <i className="fa-solid fa-chevron-left text-[8px]" />
                        </span>
                        <span dir="rtl" className="text-[13px] font-extrabold text-slate-900">
                          الانتاج التعديني
                        </span>
                      </button>
                      <div className="absolute top-0 start-full w-[260px] rounded-2xl bg-white py-2 text-[13px] shadow-xl ring-1 ring-slate-200 opacity-0 pointer-events-none group-hover/production:opacity-100 group-hover/production:pointer-events-auto">
                        <a
                          href="/m1"
                          className="block rounded-xl px-3 py-1.5 font-semibold hover:bg-[#082721]/5 hover:text-[#082721]"
                        >
                          حجم الإنتاج التعديني
                        </a>
                        <a
                          href="/m2"
                          className="block rounded-xl px-3 py-1.5 font-semibold hover:bg-[#082721]/5 hover:text-[#082721]"
                        >
                          تطور الإنتاج التعديني
                        </a>
                        <a
                          href="/m3"
                          className="block rounded-xl px-3 py-1.5 font-semibold hover:bg-[#082721]/5 hover:text-[#082721]"
                        >
                          تطور الإنتاج التعديني العربي
                        </a>
                        <a
                          href="/m4"
                          className="block rounded-xl px-3 py-1.5 font-semibold hover:bg-[#082721]/5 hover:text-[#082721]"
                        >
                          نسبة الإنتاج التعديني العربي من الإنتاج العالمي
                        </a>
                      </div>
                    </div>

                    {/* التبادلات التجارية الخارجية */}
                    <div className="relative mx-1 rounded-2xl bg-slate-50/60 p-2 group/trade">
                      <button
                        type="button"
                        dir="ltr"
                        className="flex w-full cursor-pointer items-center justify-between"
                      >
                        <span className="flex items-center gap-1 text-[10px] text-slate-500">
                          <i className="fa-solid fa-chevron-left text-[8px]" />
                        </span>
                        <span dir="rtl" className="text-[13px] font-extrabold text-slate-900">
                          التبادلات التجارية الخارجية
                        </span>
                      </button>
                      <div className="absolute top-0 start-full w-[260px] rounded-2xl bg-white py-2 text-[13px] shadow-xl ring-1 ring-slate-200 opacity-0 pointer-events-none group-hover/trade:opacity-100 group-hover/trade:pointer-events-auto">
                        <a
                          href="/m5"
                          className="block rounded-xl px-3 py-1.5 font-semibold hover:bg-[#082721]/5 hover:text-[#082721]"
                        >
                          الصادرات التعدينية
                        </a>
                        <a
                          href="/m6"
                          className="block rounded-xl px-3 py-1.5 font-semibold hover:bg-[#082721]/5 hover:text-[#082721]"
                        >
                          الواردات التعدينية
                        </a>
                      </div>
                    </div>

                    {/* الاحتياطي */}
                    <div className="relative mx-1 rounded-2xl bg-slate-50/60 p-2 group/reserve">
                      <button
                        type="button"
                        dir="ltr"
                        className="flex w-full cursor-pointer items-center justify-between"
                      >
                        <span className="flex items-center gap-1 text-[10px] text-slate-500">
                          <i className="fa-solid fa-chevron-left text-[8px]" />
                        </span>
                        <span dir="rtl" className="text-[13px] font-extrabold text-slate-900">
                          الاحتياطي
                        </span>
                      </button>
                      <div className="absolute top-0 start-full w-[260px] rounded-2xl bg-white py-2 text-[13px] shadow-xl ring-1 ring-slate-200 opacity-0 pointer-events-none group-hover/reserve:opacity-100 group-hover/reserve:pointer-events-auto">
                        <a
                          href="/m7"
                          className="block rounded-xl px-3 py-1.5 font-semibold hover:bg-[#082721]/5 hover:text-[#082721]"
                        >
                          احتياطي الخام حسب الدولة
                        </a>
                        <a
                          href="/m8"
                          className="block rounded-xl px-3 py-1.5 font-semibold hover:bg-[#082721]/5 hover:text-[#082721]"
                        >
                          الاحتياطي المؤكد / المحتمل
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <li>
                <a
                  href="/countries"
                  className="rounded-full px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 text-lg font-semibold"
                >
                  الدول العربية
                </a>
              </li>

              <li>
                <a
                  href="/about"
                  className="rounded-full px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 text-lg font-semibold"
                >
                  عن البوابة
                </a>
              </li>
            </ul>

            {/* Right side buttons */}
            <div className="flex items-center gap-2.5 text-xs">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-transparent px-3 py-2 text-white hover:bg-white/10 text-base font-semibold"
                onClick={() =>
                  document
                    .getElementById("quickSearchModal")
                    ?.dispatchEvent(new CustomEvent("open-modal"))
                }
              >
                <i className="fas fa-magnifying-glass" />
                <span>بحث سريع</span>
              </button>

              <a
              href="reports.html"
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[#082721] hover:bg-slate-100 text-base font-semibold"
              >
                <i className="fa-regular fa-file-lines" />
                <span>التقارير الذكية</span>
              </a>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-2.5 py-2 text-white hover:bg-white/10 text-base font-semibold"
                title="تسجيل الدخول/الخروج (لاحقًا)"
              >
                <i className="fa-solid fa-right-to-bracket" />
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-white/40 px-3 py-2 text-white hover:bg-white/10 "
                onClick={handleLangClick}
                title="FR/EN (لاحقًا)"
              >
                <i className="fa-solid fa-globe" />
                <span>EN</span>
              </button>
              <a
            href="www.aidsmo.org"
            className="flex items-center gap-2 text-white font-bold bg-"
            aria-label="Aidsmo"
          >
            <img
              src={logoAidsmo}
              alt="Aidsmo"
              className="h-15 w-auto rounded-full bg-white p-1 object-contain shadow-sm"
            />
          </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Toggle navigation</span>
            <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} />
          </button>
        </div>

        {/* Mobile menu panel */}
        {open && (
          <div className="pb-4 pt-2 lg:hidden text-lg">
          <div className="space-y-1 text-lg text-slate-50">
              <a
                href="/"
                className="block rounded-lg px-4 py-3 hover:bg-white/10 text-lg font-semibold"
              >
                الرئيسية
              </a>
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 hover:bg-white/10 text-lg font-semibold">
                  <span>المؤشرات التعدينية</span>
                  <i className="fa-solid fa-chevron-down text-[10px]" />
                </summary>
                <div className="mt-1 space-y-2 rounded-lg bg-[#082721]/80 px-3 py-3 text-sm">
                  {/* الانتاج التعديني */}
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 hover:bg-white/5 font-semibold">
                      <span>الانتاج التعديني</span>
                      <i className="fa-solid fa-chevron-down text-[9px]" />
                    </summary>
                    <div className="mt-1 space-y-1 rounded-lg bg-[#082721]/60 px-2 py-2">
                      <a
                        href="/m1"
                        className="block rounded px-2 py-1 hover:bg-white/10"
                      >
                        حجم الإنتاج التعديني
                      </a>
                      <a
                        href="/m2"
                        className="block rounded px-2 py-1 hover:bg-white/10"
                      >
                        تطور الإنتاج التعديني
                      </a>
                      <a
                        href="/m3"
                        className="block rounded px-2 py-1 hover:bg-white/10"
                      >
                        تطور الإنتاج التعديني العربي
                      </a>
                      <a
                        href="/m4"
                        className="block rounded px-2 py-1 hover:bg-white/10"
                      >
                        نسبة الإنتاج التعديني العربي من الإنتاج العالمي
                      </a>
                    </div>
                  </details>

                  {/* التبادلات التجارية الخارجية */}
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 hover:bg-white/5 font-semibold">
                      <span>التبادلات التجارية الخارجية</span>
                      <i className="fa-solid fa-chevron-down text-[9px]" />
                    </summary>
                    <div className="mt-1 space-y-1 rounded-lg bg-[#082721]/60 px-2 py-2">
                      <a
                        href="#"
                        className="block rounded px-2 py-1 hover:bg-white/10"
                      >
                        مؤشرات التصدير
                      </a>
                      <a
                        href="#"
                        className="block rounded px-2 py-1 hover:bg-white/10"
                      >
                        مؤشرات الواردات
                      </a>
                      <a
                        href="#"
                        className="block rounded px-2 py-1 hover:bg-white/10"
                      >
                        الميزان التجاري
                      </a>
                    </div>
                  </details>

                  {/* الاحتياطي */}
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 hover:bg-white/5 font-semibold">
                      <span>الاحتياطي</span>
                      <i className="fa-solid fa-chevron-down text-[9px]" />
                    </summary>
                    <div className="mt-1 space-y-1 rounded-lg bg-[#082721]/60 px-2 py-2">
                      <a
                        href="#"
                        className="block rounded px-2 py-1 hover:bg-white/10"
                      >
                        احتياطي الخام حسب الدولة
                      </a>
                      <a
                        href="#"
                        className="block rounded px-2 py-1 hover:bg-white/10"
                      >
                        الاحتياطي المؤكد / المحتمل
                      </a>
                      <a
                        href="#"
                        className="block rounded px-2 py-1 hover:bg-white/10"
                      >
                        توزيع الاحتياطي على الخامات
                      </a>
                    </div>
                  </details>
                </div>
              </details>
              <a
                href="/countries"
                className="block rounded-lg px-4 py-3 hover:bg-white/10 text-lg font-semibold"
              >
                الدول العربية
              </a>
              <a
                href="/about"
                className="block rounded-lg px-4 py-3 hover:bg-white/10 text-lg font-semibold"
              >
                عن البوابة
              </a>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-transparent px-4 py- text-white hover:bg-white/10"
                  onClick={() =>
                    document
                      .getElementById("quickSearchModal")
                      ?.dispatchEvent(new CustomEvent("open-modal"))
                  }
                >
                  <i className="fas fa-magnifying-glass" />
                  <span>بحث سريع</span>
                </button>

                <a
                  href="reports.html"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-[#082721] hover:bg-slate-100"
                >
                  <i className="fa-regular fa-file-lines" />
                  <span>التقارير الذكية</span>
                </a>

                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 px-4 py-3 text-white hover:bg-white/10"
                  title="تسجيل الدخول/الخروج (لاحقًا)"
                >
                  <i className="fa-solid fa-right-to-bracket" />
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-3 text-white hover:bg-white/10"
                  onClick={handleLangClick}
                  title="FR/EN (لاحقًا)"
                >
                  <i className="fa-solid fa-globe" />
                  <span>EN</span>
                </button>
                <a
                  href="https://aidsmo.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center"
                  aria-label="AIDSMO"
                >
                  <img
                    src={logoAidsmo}
                    alt="AIDSMO"
                    className="h-8 w-auto"
                  />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Menu;

