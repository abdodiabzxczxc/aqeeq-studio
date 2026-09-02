import React, { useState } from "react";
import { Sparkles, X, Heart, Award } from "lucide-react";
import { useSiteTheme } from "@/lib/useSiteTheme";

export function AqeeqOccasionRibbon() {
  const { isNationalDay, showCelebrationRibbon, customBadgeText, remainingHours, variantInfo } = useSiteTheme();
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
    <aside aria-label="شريط المناسبة الوطنية" className="relative z-50 w-full overflow-hidden snd-celebration-ribbon border-b border-emerald-400/30">
      {/* Subtle national texture overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: `url('${variantInfo.bgImage}')` }}
      />

      <div className="relative mx-auto flex max-w-[1380px] items-center justify-between px-4 py-2 text-xs font-black sm:px-6">
        {/* Left / Center Emblem */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white shadow-inner">
            🇸🇦
          </span>

          <div className="flex items-center gap-2 truncate">
            <span className="bg-white/25 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide text-white border border-white/30">
              {customBadgeText}
            </span>
            <span className="truncate text-white font-bold hidden sm:inline">
              بمناسبة اليوم الوطني السعودي — نهنئ القيادة الرشيدة وشعب المملكة وطلاب ومعلمي مدارس العقيق
            </span>
            <span className="truncate text-white font-bold sm:hidden">
              اليوم الوطني السعودي — مدارس العقيق
            </span>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {remainingLabel && (
            <span className="bg-black/30 text-emerald-200 border border-emerald-300/40 text-[10px] px-2 py-0.5 rounded-full font-mono">
              ⏱ متبقي {remainingLabel}
            </span>
          )}

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1 text-white/80 hover:bg-white/20 hover:text-white transition"
            title="إخفاء الشريط"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
