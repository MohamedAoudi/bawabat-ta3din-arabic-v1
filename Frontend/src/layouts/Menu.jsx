import { useState } from "react";
import logoAmip from "../assets/logo 500x190 sans bg.png";
import logoAidsmo from "../assets/aidsmo logo sans bg 800x 800.png";

const Menu = () => {
  const [open, setOpen] = useState(false);

  const handleLangClick = () => {
    alert("FR (AR/EN لاحقًا) — زر تجريبي فقط.");
  };

  return (
    <nav className=" py-3  sticky top-0 z-40 bg-gradient-to-r from-sky-900 to-sky-700 border-b-4 border-amber-400 ">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10" dir="rtl">
        <div className=" gap-2 flex h-16 items-center justify-between">
          {/* Brand */}
          <a
            href="index.html"
            className="flex items-center gap-2 text-white font-bold bg-"
            aria-label="AMIP - بوابة المؤشرات التعدينية العربية"
          >
            <img
              src={logoAmip}
              alt="AMIP - بوابة المؤشرات التعدينية العربية"
              className="h-15 w-auto bg-white rounded-full"
            />
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between lg:gap-12 text-lg">
            <ul className="flex items-center gap-1.5 text-lg text-slate-50">
              <li>
                <a
                  href="index.html"
                  className="rounded-full px-2 py-2 text-white/90 hover:text-white hover:bg-white/10 text-lg font-semibold"
                >
                  الرئيسية
                </a>
              </li>

              <li className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 text-lg font-semibold"
                >
                  <span>المؤشرات التعدينية</span>
                  <i className="fa-solid fa-chevron-down text-[10px]" />
                </button>
                <div className="absolute end-0 mt-2 w-56 rounded-2xl bg-white py-2 text-right text-sm text-slate-700 shadow-xl ring-1 ring-black/5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
                  <a
                    href="m1.html"
                    className="block px-2 py-2 hover:bg-slate-50 font-semibold"
                  >
                    حجم الإنتاج التعديني
                  </a>
                  <a
                    href="m2.html"
                    className="block px-2 py-2 hover:bg-slate-50 font-semibold"
                  >
                    تطور الإنتاج التعديني
                  </a>
                  <a
                    href="m3.html"
                    className="block px-2 py-2 hover:bg-slate-50 font-semibold"
                  >
                    تطور الإنتاج التعديني العربي
                  </a>
                  <a
                    href="m4.html"
                    className="block px-2 py-2 hover:bg-slate-50 font-semibold"
                  >
                    نسبة الإنتاج التعديني العربي من الإنتاج العالمي
                  </a>
                </div>
              </li>

              <li>
                <a
                  href="countries.html"
                  className="rounded-full px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 text-lg font-semibold"
                >
                  الدول العربية
                </a>
              </li>

              <li>
                <a
                  href="about.html"
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
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sky-900 hover:bg-slate-100 text-base font-semibold"
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
                href="index.html"
                className="block rounded-lg px-4 py-3 hover:bg-white/10 text-lg font-semibold"
              >
                الرئيسية
              </a>
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 hover:bg-white/10 text-lg font-semibold">
                  <span>المؤشرات التعدينية</span>
                  <i className="fa-solid fa-chevron-down text-[10px]" />
                </summary>
                <div className="mt-1 space-y-1 rounded-lg bg-sky-950/40 px-3 py-2">
                  <a
                    href="m1.html"
                    className="block rounded px-2 py-1 hover:bg-white/10"
                  >
                    حجم الإنتاج التعديني
                  </a>
                  <a
                    href="m2.html"
                    className="block rounded px-2 py-1 hover:bg-white/10"
                  >
                    تطور الإنتاج التعديني
                  </a>
                  <a
                    href="m3.html"
                    className="block rounded px-2 py-1 hover:bg-white/10"
                  >
                    تطور الإنتاج التعديني العربي
                  </a>
                  <a
                    href="m4.html"
                    className="block rounded px-2 py-1 hover:bg-white/10"
                  >
                    نسبة الإنتاج التعديني العربي من الإنتاج العالمي
                  </a>
                </div>
              </details>
              <a
                href="countries.html"
        className="block rounded-lg px-4 py-3 hover:bg-white/10 text-lg font-semibold"
              >
                الدول العربية
              </a>
              <a
                href="about.html"
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
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sky-900 hover:bg-slate-100"
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

