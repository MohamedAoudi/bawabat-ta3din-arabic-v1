import React from "react";
import Menu from "../layouts/Menu";
import Footer from "../layouts/Footer";

const Rapport = () => {
  return (
    <>
      <Menu />

      <main
        dir="rtl"
        className="min-h-[calc(100vh-69px)] flex flex-col items-center justify-center px-4 py-20"
        style={{
          background: "linear-gradient(160deg,#082721 0%,#0d3b33 50%,#082721 100%)",
          fontFamily: "'Cairo','Tajawal',sans-serif",
        }}
      >
        {/* Decorative top line */}
        <div
          className="w-24 h-[3px] rounded-full mb-8"
          style={{ background: "linear-gradient(90deg,#8B2500,#C9A84C,#082721)" }}
        />
aoudi@2002@
        {/* Animated icon */}
        <div className="relative mb-8">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,#0f4035,#082721)",
              border: "2px solid rgba(201,168,76,0.35)",
              boxShadow: "0 0 40px rgba(201,168,76,0.15)",
            }}
          >
            {/* Gear SVG */}
            <svg
              className="w-12 h-12 text-[#C9A84C]"
              style={{ animation: "spin 8s linear infinite" }}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          {/* Pulse ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px solid rgba(201,168,76,0.3)",
              animation: "pulse-ring 2s ease-out infinite",
            }}
          />
        </div>

        {/* Badge */}
        <div
          className="mb-5 px-4 py-1.5 rounded-full text-[12px] font-bold tracking-widest uppercase"
          style={{
            background: "rgba(201,168,76,0.1)",
            border: "1px solid rgba(201,168,76,0.3)",
            color: "#C9A84C",
          }}
        >
          قريباً
        </div>

        {/* Title */}
        <h1
          className="text-3xl sm:text-4xl font-black text-white text-center mb-4 leading-tight"
        >
          التقارير الذكية
        </h1>

        {/* Subtitle */}
        <p className="text-white/50 text-[15px] text-center max-w-md mb-10 leading-relaxed">
          هذه الصفحة قيد التطوير. سيتم إطلاق التقارير التفاعلية والذكية قريباً ضمن بوابة المعطيات التعدينية العربية.
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-sm mb-10">
          <div className="flex justify-between text-[12px] text-white/40 mb-2">
            <span>نسبة الإنجاز</span>
            <span>65%</span>
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: "65%",
                background: "linear-gradient(90deg,#8B2500,#C9A84C)",
                boxShadow: "0 0 10px rgba(201,168,76,0.4)",
              }}
            />
          </div>
        </div>

        {/* Features list */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-12">
          {[
            { icon: "📊", label: "تقارير تفاعلية" },
            { icon: "📥", label: "تصدير PDF / Excel" },
            { icon: "🔔", label: "تنبيهات آنية" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-2 rounded-2xl px-4 py-5 text-center"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,168,76,0.15)",
              }}
            >
              <span className="text-2xl">{f.icon}</span>
              <span className="text-[13px] font-semibold text-white/70">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Back button */}
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold text-[#082721] transition-all hover:brightness-110"
          style={{
            background: "linear-gradient(135deg,#d4b35a,#C9A84C,#b8932e)",
            boxShadow: "0 4px 16px rgba(201,168,76,0.35)",
          }}
        >
          <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          العودة إلى الرئيسية
        </a>

        {/* Decorative bottom line */}
        <div
          className="w-24 h-[3px] rounded-full mt-10"
          style={{ background: "linear-gradient(90deg,#082721,#C9A84C,#8B2500)" }}
        />

        {/* CSS animations */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes pulse-ring {
            0%   { transform: scale(1);   opacity: 0.6; }
            100% { transform: scale(1.6); opacity: 0; }
          }
        `}</style>
      </main>

      <Footer />
    </>
  );
};

export default Rapport;
