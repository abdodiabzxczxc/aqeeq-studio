import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { trpc } from "@/lib/trpc";
import { PhoneCall, MessageCircle, GraduationCap, X } from "lucide-react";

export function MobileStickyActionBar() {
  const [location, navigate] = useLocation();
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    staleTime: 60000,
  });

  const campuses = orchestration?.schoolCampuses;
  const boysPhone = campuses?.boysPhone || "0148131652";
  const cleanPhone = boysPhone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/966${cleanPhone.startsWith("0") ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent("السلام عليكم ورحمة الله، أود الاستفسار عن القبول والتسجيل بمدارس العقيق")}`;

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const nearBottom = scrollY + windowHeight > documentHeight - 120;

          if (scrollY > 180 && !nearBottom && !dismissed) {
            setVisible(true);
          } else {
            setVisible(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dismissed]);

  // Don't show in admin dashboard
  if (location.startsWith("/admin")) {
    return null;
  }

  return (
    <div
      dir="rtl"
      className={`fixed bottom-0 inset-x-0 z-40 lg:hidden px-3 pt-2 pb-3.5 transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-full opacity-0 pointer-events-none"
      } ${
        dark
          ? "bg-[#060a0f]/92 border-t border-emerald-500/20 text-white shadow-[0_-8px_30px_rgba(0,0,0,0.85)]"
          : "bg-white/94 border-t border-emerald-950/10 text-slate-900 shadow-[0_-8px_25px_rgba(1,90,55,0.12)]"
      } backdrop-blur-xl`}
      style={{ paddingBottom: "max(14px, env(safe-area-inset-bottom, 14px))" }}
    >
      <div className="max-w-md mx-auto flex items-center gap-2">
        {/* Main Apply Button */}
        <button
          type="button"
          onClick={() => {
            if (location === "/admissions") {
              const el = document.getElementById("admission-form-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            } else {
              navigate("/admissions");
            }
          }}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl text-xs font-black shadow-md active:scale-95 transition ${
            isNationalDay
              ? dark
                ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black shadow-amber-500/20"
                : "bg-gradient-to-r from-[#015a37] to-emerald-700 text-white shadow-emerald-900/25"
              : dark
              ? "bg-gradient-to-r from-emerald-600 to-[#005A36] text-white shadow-emerald-950/40"
              : "bg-gradient-to-r from-[#015a37] to-emerald-700 text-white shadow-emerald-900/25"
          }`}
        >
          <GraduationCap size={15} />
          <span>سجّل الآن ✦</span>
        </button>

        {/* WhatsApp Instant Chat */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="تواصل عبر الواتساب"
          className="inline-flex items-center justify-center gap-1 h-11 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black shadow-md transition shrink-0"
        >
          <MessageCircle size={16} />
          <span className="hidden xs:inline">واتساب</span>
        </a>

        {/* Call School Admissions */}
        <a
          href={`tel:${cleanPhone}`}
          aria-label="اتصال بهاتف القبول"
          className={`inline-flex items-center justify-center h-11 w-11 rounded-xl border active:scale-95 transition shrink-0 ${
            dark
              ? "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
              : "border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 shadow-sm"
          }`}
        >
          <PhoneCall size={16} className="text-emerald-500" />
        </a>

        {/* Close / Dismiss Bar */}
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            setDismissed(true);
          }}
          aria-label="إغلاق الشريط"
          className="h-9 w-7 inline-flex items-center justify-center text-slate-400 hover:text-current transition opacity-60 hover:opacity-100 shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
