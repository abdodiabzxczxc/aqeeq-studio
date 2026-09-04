import React from "react";
import { motion } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { Sparkles, ArrowLeft } from "lucide-react";

interface AqeeqGrandFinaleCtaProps {
  badge?: string;
  title: string;
  subtitle: string;
  primaryActionText: string;
  primaryActionHref?: string;
  onPrimaryAction?: () => void;
  secondaryActionText?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
}

export function AqeeqGrandFinaleCta({
  badge = "✦ بوابتك نحو المستقبل ✦",
  title,
  subtitle,
  primaryActionText,
  primaryActionHref,
  onPrimaryAction,
  secondaryActionText,
  secondaryActionHref,
  onSecondaryAction,
}: AqeeqGrandFinaleCtaProps) {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";

  return (
    <div className="relative mx-auto my-16 sm:my-28 max-w-[1240px] px-4 sm:px-6 md:px-8">
      <div
        className={`relative overflow-hidden rounded-[2.5rem] sm:rounded-[3.5rem] border p-8 sm:p-14 md:p-16 text-center shadow-2xl backdrop-blur-2xl transition-all duration-500 ${
          isNationalDay
            ? dark
              ? "border-[#5aba1c]/30 bg-gradient-to-br from-[#011a10] via-[#022416] to-[#01140c] shadow-[0_20px_80px_rgba(0,90,54,0.3)]"
              : "border-emerald-600/20 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60 shadow-[0_20px_80px_rgba(0,90,54,0.1)]"
            : dark
            ? "border-white/10 bg-gradient-to-br from-[#0a0d16] via-[#080b12] to-[#05070a] shadow-[0_20px_80px_rgba(0,0,0,0.8)]"
            : "border-black/10 bg-gradient-to-br from-slate-50 via-white to-sky-50/40 shadow-[0_20px_80px_rgba(8,70,125,0.08)]"
        }`}
      >
        {/* هالة ضوئية خلفية نيونية */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[350px] w-[550px] rounded-full blur-[120px] opacity-35"
          style={{
            background: isNationalDay
              ? "radial-gradient(circle, #5aba1c, #005A36, transparent)"
              : "radial-gradient(circle, #f8ca14, #08467d, transparent)",
          }}
        />

        {/* الشارة العلوية */}
        <div className="relative z-10 mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-current/10 bg-current/5">
          <Sparkles
            size={14}
            className={
              isNationalDay ? "text-emerald-500" : "text-[#f8ca14]"
            }
          />
          <span
            className={`text-xs font-black tracking-wider uppercase font-cairo ${
              dark
                ? isNationalDay
                  ? "text-[#5aba1c]"
                  : "text-[#f8ca14]"
                : isNationalDay
                ? "text-[#005A36]"
                : "text-[#08467d]"
            }`}
          >
            {badge}
          </span>
        </div>

        {/* العنوان الفخم */}
        <h2
          className={`relative z-10 mx-auto max-w-3xl font-cairo font-black text-2xl sm:text-4xl md:text-5xl leading-tight ${
            dark ? "text-white" : "text-slate-900"
          }`}
        >
          {title}
        </h2>

        {/* الوصف الإضافي */}
        <p
          className={`relative z-10 mx-auto mt-4 max-w-xl text-sm sm:text-base md:text-lg font-medium leading-relaxed ${
            dark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {subtitle}
        </p>

        {/* أزرار الإجراء */}
        <div className="relative z-10 mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            href={primaryActionHref || "#"}
            onClick={onPrimaryAction}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black font-cairo text-sm sm:text-base transition-all shadow-xl cursor-pointer ${
              isNationalDay
                ? "bg-[#005A36] text-white hover:bg-[#006e42] shadow-[0_10px_30px_rgba(0,90,54,0.4)]"
                : dark
                ? "bg-[#f8ca14] text-black hover:bg-amber-400 shadow-[0_10px_30px_rgba(248,202,20,0.3)]"
                : "bg-[#08467d] text-white hover:bg-[#063560] shadow-[0_10px_30px_rgba(8,70,125,0.3)]"
            }`}
          >
            <span>{primaryActionText}</span>
            <ArrowLeft size={18} />
          </motion.a>

          {secondaryActionText && (
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              href={secondaryActionHref || "#"}
              onClick={onSecondaryAction}
              className={`inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-bold font-cairo text-sm sm:text-base border transition backdrop-blur-md cursor-pointer ${
                dark
                  ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                  : "border-black/10 bg-slate-100 text-slate-800 hover:bg-slate-200/80"
              }`}
            >
              <span>{secondaryActionText}</span>
            </motion.a>
          )}
        </div>
      </div>
    </div>
  );
}
