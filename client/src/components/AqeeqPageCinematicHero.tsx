import React from "react";
import { motion } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { Sparkles, ChevronDown } from "lucide-react";

interface MetricChip {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface AqeeqPageCinematicHeroProps {
  /** شارة الهيرو العلوية (مثال: صروح العقيق) */
  kicker: string;
  /** العنوان الرئيسي الضخم */
  title: string;
  /** العنوان الملون أو المكمل */
  titleHighlight?: string;
  /** الوصف التحريري الراقي */
  description: string;
  /** رقائق إحصائية أو مميزات تطفو في الهيرو */
  chips?: MetricChip[];
  /** زر الإجراء السريع إن وجد */
  action?: React.ReactNode;
  /** صورة أو مجسم إضافي بجانب العنوان */
  mediaElement?: React.ReactNode;
}

export function AqeeqPageCinematicHero({
  kicker,
  title,
  titleHighlight,
  description,
  chips = [],
  action,
  mediaElement,
}: AqeeqPageCinematicHeroProps) {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";

  return (
    <div className="relative min-h-[75vh] sm:min-h-[85vh] w-full flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-8 py-16 sm:py-24 overflow-hidden select-none">
      {/* ── خلفية الحلقات الهندسية الدوارة الفاخرة ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10 overflow-hidden">
        <div
          className={`h-[450px] w-[450px] sm:h-[650px] sm:w-[650px] rounded-full border border-dashed transition-all duration-1000 animate-[spin_60s_linear_infinite] opacity-25 ${
            isNationalDay
              ? dark
                ? "border-[#5aba1c]"
                : "border-emerald-600"
              : dark
              ? "border-[#f8ca14]"
              : "border-[#08467d]"
          }`}
        />
        <div
          className={`absolute h-[320px] w-[320px] sm:h-[480px] sm:w-[480px] rounded-full border transition-all duration-1000 animate-[spin_45s_linear_infinite_reverse] opacity-20 ${
            dark ? "border-white/20" : "border-black/10"
          }`}
        />
      </div>

      {/* ── كبسولة الشارة المتوهجة (Kicker Badge) ── */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md shadow-lg"
        style={{
          backgroundColor: dark ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.8)",
          borderColor: isNationalDay
            ? dark
              ? "rgba(90, 186, 28, 0.3)"
              : "rgba(0, 90, 54, 0.2)"
            : dark
            ? "rgba(248, 202, 20, 0.25)"
            : "rgba(8, 70, 125, 0.15)",
        }}
      >
        <Sparkles
          size={14}
          className={
            isNationalDay
              ? "text-emerald-500 animate-pulse"
              : "text-[#f8ca14] animate-pulse"
          }
        />
        <span
          className={`text-xs sm:text-sm font-black tracking-wide font-cairo ${
            dark
              ? isNationalDay
                ? "text-[#5aba1c]"
                : "text-[#f8ca14]"
              : isNationalDay
              ? "text-[#005A36]"
              : "text-[#08467d]"
          }`}
        >
          {kicker}
        </span>
      </motion.div>

      {/* ── العنوان الرئيسي الضخم (Giant Display Title) ── */}
      <motion.h1
        initial={{ opacity: 0, y: 25, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className={`max-w-4xl font-cairo font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.15] tracking-tight ${
          dark ? "text-white" : "text-slate-900"
        }`}
      >
        {title}{" "}
        {titleHighlight && (
          <span
            className={
              isNationalDay
                ? "bg-gradient-to-r from-emerald-400 via-[#5aba1c] to-[#f8ca14] bg-clip-text text-transparent"
                : "bg-gradient-to-r from-[#f8ca14] via-amber-400 to-[#d99c15] bg-clip-text text-transparent"
            }
          >
            {titleHighlight}
          </span>
        )}
      </motion.h1>

      {/* ── الوصف التحريري (Refined Editorial Subtitle) ── */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className={`mt-6 max-w-2xl text-base sm:text-lg md:text-xl font-medium leading-relaxed ${
          dark ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {description}
      </motion.p>

      {/* ── الرقائق الإحصائية التفاعلية (Floating Metric Chips) ── */}
      {chips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-3xl"
        >
          {chips.map((chip, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border backdrop-blur-md transition hover:scale-105 ${
                dark
                  ? "border-white/10 bg-white/[0.04] text-white shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                  : "border-black/10 bg-white/80 text-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
              }`}
            >
              {chip.icon && (
                <div
                  className={`text-sm ${
                    dark ? "text-[#f8ca14]" : "text-[#08467d]"
                  }`}
                >
                  {chip.icon}
                </div>
              )}
              <div className="text-right">
                <div className="text-xs font-bold opacity-60 leading-none">
                  {chip.label}
                </div>
                <div className="text-sm sm:text-base font-black font-cairo leading-snug">
                  {chip.value}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── أزرار الإجراء أو المجسم إن وجد ── */}
      {action && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 z-10"
        >
          {action}
        </motion.div>
      )}

      {mediaElement && (
        <div className="mt-8 w-full max-w-4xl z-10">{mediaElement}</div>
      )}

      {/* ── مؤشر التمرير النابض (Scroll Indicator) ── */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mt-12 flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition cursor-pointer"
      >
        <span className="text-[11px] font-bold tracking-widest uppercase">
          استكشف المسرح
        </span>
        <ChevronDown size={18} />
      </motion.div>
    </div>
  );
}
