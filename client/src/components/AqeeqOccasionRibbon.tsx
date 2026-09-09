import React, { useState } from "react";
import { Sparkles, X, Heart } from "lucide-react";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { triggerNationalCelebration } from "./AqeeqCelebrationConfetti";

export function AqeeqOccasionRibbon({ isScrolled = false }: { isScrolled?: boolean }) {
  const { isNationalDay, showCelebrationRibbon, remainingHours } = useSiteTheme();
  const [dismissed, setDismissed] = useState(false);

  if (!isNationalDay || !showCelebrationRibbon || dismissed) {
    return null;
  }

  const remainingLabel = remainingHours != null
    ? remainingHours > 24
      ? `${Math.round(remainingHours / 24)} يوم`
      : `${Math.round(remainingHours)} ساعة`
    : null;

  return (
    <aside
      aria-label="شريط المناسبة الوطنية"
      className={`relative z-[150] w-full snd-ribbon-bar text-white transition-all duration-300 ${
        isScrolled
          ? "max-h-0 h-0 py-0 opacity-0 overflow-hidden pointer-events-none !border-0 !shadow-none"
          : "max-h-12 py-1.5 px-3 sm:px-6 opacity-100 overflow-visible"
      }`}
    >
      <div className="relative mx-auto flex max-w-[1380px] 2xl:max-w-[1560px] items-center justify-between text-xs font-black">
        {/* Right Content */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center gap-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-2.5 py-0.5 text-[#D4AF37] text-[11px] shadow-sm shrink-0">
            <Sparkles size={12} className="animate-spin" style={{ animationDuration: "6s" }} />
            <span>عزّنا بطبعنا 🇸🇦</span>
          </div>

          <p className="truncate text-white/95 text-[11px] sm:text-xs font-bold tracking-wide">
            <span className="hidden md:inline">اليوم الوطني السعودي — </span>
            <span>دام عزك يا وطن المجد والعطاء • #عزنا_بطبعنا</span>
          </p>
        </div>

        {/* Left Actions & Celebration Trigger */}
        <div className="flex items-center gap-2 shrink-0 mr-2">
          {/* Interactive Celebration Cheer Button */}
          <button
            type="button"
            onClick={() => triggerNationalCelebration()}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] px-3 py-1 text-[11px] font-black text-[#002e1b] shadow-md hover:scale-105 active:scale-95 transition-all"
            title="انقر لتطلق قصاصات الاحتفال الوطنية"
          >
            <Sparkles size={12} className="text-[#005A36]" />
            <span>شارِكنا البهجة 🇸🇦</span>
          </button>

          {remainingLabel && (
            <span className="hidden sm:inline-flex items-center gap-1 bg-black/40 text-emerald-300 border border-emerald-400/30 text-[10px] px-2 py-0.5 rounded-full font-mono">
              <span>⏱</span>
              <span>متبقي {remainingLabel}</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1 text-white/70 hover:bg-white/20 hover:text-white transition"
            title="إغلاق الشريط"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

