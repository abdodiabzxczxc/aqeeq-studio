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

  if (location.startsWith("/admin")) return null;

  const accentGradient = isNationalDay
    ? dark
      ? "from-[#f8ca14] to-amber-500 text-black shadow-amber-500/25"
      : "from-[#005a37] to-emerald-700 text-white shadow-emerald-900/30"
    : dark
    ? "from-emerald-500 to-[#005a37] text-white shadow-emerald-900/40"
    : "from-[#005a37] to-emerald-700 text-white shadow-emerald-900/25";

  return (
    <div
      dir="rtl"
      className={`fixed bottom-0 inset-x-0 z-40 lg:hidden transition-all duration-300 ease-out ${
        visible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-full opacity-0 pointer-events-none"
      } ${
        dark
          ? "bg-[#060a0f]/95 border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.9)]"
          : "bg-white/96 border-t border-black/[.08] shadow-[0_-6px_24px_rgba(0,0,0,0.10)]"
      } backdrop-blur-xl`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="max-w-md mx-auto flex items-center gap-2 px-3 py-2">

        {/* زر سجّل الآن — Primary CTA */}
        <button
          type="button"
          onClick={() => {
            if (location === "/admissions") {
              document.getElementById("admission-form-section")?.scrollIntoView({ behavior: "smooth" });
            } else {
              navigate("/admissions");
            }
          }}
          className={`flex-1 inline-flex items-center justify-center gap-2 h-11 min-h-[44px] rounded-2xl text-sm font-black shadow-lg active:scale-[.97] transition bg-gradient-to-l ${accentGradient}`}
        >
          <GraduationCap size={16} />
          <span>سجّل الآن</span>
        </button>

        {/* واتساب */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="واتساب"
          className={`inline-flex items-center justify-center h-11 w-11 min-h-[44px] rounded-2xl active:scale-[.97] transition shrink-0 ${
            dark
              ? "bg-white/[.08] border border-white/[.12] text-[#25D366]"
              : "bg-[#25D366]/10 border border-[#25D366]/20 text-[#128C7E]"
          }`}
        >
          <MessageCircle size={18} />
        </a>

        {/* اتصال */}
        <a
          href={`tel:${cleanPhone}`}
          aria-label="اتصال"
          className={`inline-flex items-center justify-center h-11 w-11 min-h-[44px] rounded-2xl active:scale-[.97] transition shrink-0 ${
            dark
              ? "bg-white/[.08] border border-white/[.12] text-slate-300"
              : "bg-slate-100 border border-slate-200 text-slate-700"
          }`}
        >
          <PhoneCall size={16} />
        </a>

        {/* إغلاق */}
        <button
          type="button"
          onClick={() => { setVisible(false); setDismissed(true); }}
          aria-label="إغلاق"
          className="inline-flex items-center justify-center h-9 w-9 rounded-xl opacity-35 hover:opacity-70 transition shrink-0"
        >
          <X size={15} />
        </button>

      </div>
    </div>
  );
}
