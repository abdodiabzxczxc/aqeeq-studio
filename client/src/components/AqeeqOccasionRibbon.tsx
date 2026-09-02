import React, { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useSiteTheme } from "@/lib/useSiteTheme";

export function AqeeqOccasionRibbon() {
  const { isNationalDay, showCelebrationRibbon, customBadgeText, remainingHours } = useSiteTheme();
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
      className="relative z-50 w-full snd-ribbon-bar text-white py-1.5 px-4 sm:px-6 transition-all duration-300"
    >
      <div className="relative mx-auto flex max-w-[1380px] items-center justify-between text-xs font-black">
        {/* Center / Right Content */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 rounded-full bg-[#f8ca14]/20 border border-[#f8ca14]/40 px-2.5 py-0.5 text-[#f8ca14] text-[11px] shadow-sm">
            <Sparkles size={12} className="animate-spin" style={{ animationDuration: "6s" }} />
            <span>{customBadgeText || "نحلم ونحقق 🇸🇦"}</span>
          </div>

          <p className="truncate text-white/95 text-[11px] sm:text-xs font-bold tracking-wide">
            <span className="hidden md:inline">بمناسبة اليوم الوطني السعودي — </span>
            <span>نرفع أسمى آيات التهاني للقيادة الرشيدة وشعب المملكة ومنسوبي مدارس العقيق</span>
          </p>
        </div>

        {/* Left Actions & Remaining Timer */}
        <div className="flex items-center gap-2.5 shrink-0 mr-2">
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
