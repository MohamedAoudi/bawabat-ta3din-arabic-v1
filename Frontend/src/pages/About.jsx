import React from "react";
import Menu from "../layouts/Menu";

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
        className="bg-gradient-to-r from-sky-900 to-sky-700 text-white pt-16 pb-24 -mb-12 text-center"
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <section className="bg-white/90 rounded-3xl shadow-xl backdrop-blur-sm border border-white/60 p-6 sm:p-8">
          <p className="text-slate-600 m-0">
            Placeholder: تعريف القاعدة، الأهداف، المنهجية، الجهات المشاركة…
          </p>
        </section>
      </main>
    </div>
  );
};

export default About;

