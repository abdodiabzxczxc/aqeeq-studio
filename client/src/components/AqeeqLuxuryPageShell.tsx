import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";

interface AqeeqLuxuryPageShellProps {
  children: React.ReactNode;
  hero?: React.ReactNode;
  useCurtain?: boolean;
  curtainKicker?: string;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * AqeeqLuxuryPageShell — المحرك البصري الموحد للإبهار الفائق
 * يوفر:
 * 1. خلفية حية متدفقة (Ambient Cosmic Glow + Fluid Mesh)
 * 2. هيرو ستارة سينمائي مع Pinned Parallax (اختياري)
 * 3. خط نيون ذهبي ملكي متوهج
 * 4. تكامل سلس مع ثيم اليوم الوطني والوضع الليلي/النهاري
 */
export function AqeeqLuxuryPageShell({
  children,
  hero,
  useCurtain = false,
  curtainKicker = "✦ واحة العقيق الرقمية ✦",
  className = "",
  header,
  footer,
}: AqeeqLuxuryPageShellProps) {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";

  return (
    <div
      dir="rtl"
      className={`relative min-h-screen aq-public-shell overflow-x-hidden selection:bg-[#f8ca14]/30 ${
        isNationalDay
          ? dark
            ? "bg-[#01140c] text-white"
            : "bg-[#f8faf9] text-slate-900"
          : dark
          ? "bg-[#05070c] text-white"
          : "bg-[#fcfdfd] text-slate-900"
      } ${className}`}
    >
      {/* ── خلفيات الهالة المحيطية الحية (Ambient Mesh Glow Orbs) ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* هالة علوية ذهبية / خضراء */}
        <div
          className={`absolute -top-40 right-[-10%] h-[600px] w-[600px] rounded-full blur-[140px] opacity-40 transition-transform duration-1000 ${
            isNationalDay
              ? dark
                ? "bg-gradient-to-br from-[#005A36] to-[#5aba1c]/40"
                : "bg-gradient-to-br from-emerald-300 to-[#5aba1c]/30"
              : dark
              ? "bg-gradient-to-br from-[#f8ca14]/30 via-amber-600/20 to-transparent"
              : "bg-gradient-to-br from-[#08467d]/15 via-blue-400/10 to-transparent"
          }`}
        />

        {/* هالة وسطى زمردية / كحلية */}
        <div
          className={`absolute top-[45%] left-[-15%] h-[550px] w-[550px] rounded-full blur-[150px] opacity-35 transition-transform duration-1000 ${
            isNationalDay
              ? dark
                ? "bg-[#003822]/60"
                : "bg-emerald-200/50"
              : dark
              ? "bg-[#10b981]/15"
              : "bg-[#f8ca14]/12"
          }`}
        />

        {/* هالة سفلية عميقة */}
        <div
          className={`absolute -bottom-40 right-[20%] h-[500px] w-[500px] rounded-full blur-[160px] opacity-30 ${
            isNationalDay
              ? dark
                ? "bg-[#5aba1c]/20"
                : "bg-emerald-300/30"
              : dark
              ? "bg-[#08467d]/35"
              : "bg-sky-200/40"
          }`}
        />

        {/* شبكة ضوئية سائلة دقيقة */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(248,202,20,0.06),transparent_60%)]" />
      </div>

      {/* ── رأس الصفحة (Header) ── */}
      {header && <div className="relative z-40">{header}</div>}

      {/* ── محتوى الصفحة (مع أو بدون ستارة الهيرو) ── */}
      {useCurtain && hero ? (
        <AqeeqCurtainHeroStage
          hero={hero}
          curtainKicker={curtainKicker}
          dark={dark}
          isNationalDay={isNationalDay}
        >
          {children}
        </AqeeqCurtainHeroStage>
      ) : (
        <div className="relative z-10 w-full">
          {hero}
          {children}
        </div>
      )}

      {/* ── تذييل الصفحة (Footer) ── */}
      {footer && <div className="relative z-30">{footer}</div>}
    </div>
  );
}

/**
 * ستارة الهيرو الفاخرة ذات التثبيت البصري (Pinned Parallax)
 * منفصلة في مكون مستقل لضمان hydration الـ Ref قبل تشغيل useScroll
 */
function AqeeqCurtainHeroStage({
  hero,
  children,
  curtainKicker,
  dark,
  isNationalDay,
}: {
  hero: React.ReactNode;
  children: React.ReactNode;
  curtainKicker: string;
  dark: boolean;
  isNationalDay: boolean;
}) {
  const heroPinContainerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroPinContainerRef,
    offset: ["start start", "end start"],
  });

  const rawScale = useTransform(scrollYProgress, [0, 0.65], [1, 0.92]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.35]);
  const rawY = useTransform(scrollYProgress, [0, 0.65], ["0px", "-35px"]);
  const rawBlur = useTransform(scrollYProgress, [0, 0.65], ["blur(0px)", "blur(6px)"]);

  const heroScale = useSpring(rawScale, { stiffness: 100, damping: 22, mass: 0.5 });
  const heroOpacity = useSpring(rawOpacity, { stiffness: 100, damping: 22, mass: 0.5 });
  const heroY = useSpring(rawY, { stiffness: 100, damping: 22, mass: 0.5 });

  return (
    <div className="relative z-10 w-full">
      {/* تثبيت الهيرو */}
      <div ref={heroPinContainerRef} className="relative h-[115vh] w-full">
        <div className="sticky top-0 z-0 w-full overflow-hidden">
          <motion.div
            style={{
              scale: heroScale,
              opacity: heroOpacity,
              y: heroY,
              filter: rawBlur,
              transformOrigin: "center top",
            }}
            className="w-full will-change-transform"
          >
            {hero}
          </motion.div>
        </div>
      </div>

      {/* ستارة المحتوى الصاعدة */}
      <div
        className={`relative z-20 -mt-[30vh] w-full rounded-t-[2.8rem] sm:rounded-t-[4.2rem] transition-colors duration-500 overflow-x-clip ${
          isNationalDay
            ? dark
              ? "bg-[#020b06] shadow-[0_-40px_100px_rgba(0,0,0,0.95)] border-t-2 border-[#f8ca14]/30"
              : "bg-[#f8faf8] shadow-[0_-30px_80px_rgba(0,90,54,0.18)] border-t-2 border-emerald-500/30"
            : dark
            ? "bg-[#07090e] shadow-[0_-40px_100px_rgba(0,0,0,0.98)] border-t-2 border-white/15"
            : "bg-white shadow-[0_-30px_80px_rgba(0,0,0,0.12)] border-t-2 border-black/10"
        }`}
      >
        {/* خط النيون الذهبي المتوهج */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-4/5 max-w-4xl h-[2px] bg-gradient-to-r from-transparent via-[#f8ca14] to-transparent z-30 shadow-[0_0_15px_rgba(248,202,20,0.6)]"
        />

        {/* مقبض الستارة والشارة */}
        <div className="flex flex-col items-center justify-center pt-5 pb-3 gap-1.5">
          <div
            className={`h-1.5 w-14 rounded-full transition ${
              dark ? "bg-white/25" : "bg-black/20"
            }`}
          />
          <span
            className={`text-[10px] font-black tracking-widest uppercase ${
              dark ? "text-[#f8ca14]/90" : "text-[#08467d]/90"
            }`}
          >
            {curtainKicker}
          </span>
        </div>

        {/* محتوى الستارة */}
        <div className="relative z-10 w-full">{children}</div>
      </div>
    </div>
  );
}
