import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { AqeeqAmbientLighting } from "@/components/AqeeqAmbientLighting";

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
      className={`relative min-h-screen aq-public-shell ${
        dark ? "aq-studio-share--dark" : "aq-studio-share--light"
      } overflow-x-clip selection:bg-[#f8ca14]/30 ${
        dark ? "bg-black text-white" : "bg-white text-slate-900"
      } ${className}`}
      style={{
        background: dark ? "#000000" : "#ffffff",
      }}
    >
      {/* ── محرك الإضاءة المحيطية العالمية السلسة الممتدة بدون أي حواف أو قطع ── */}
      <AqeeqAmbientLighting />

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

  // فحص الشاشات الكبيرة لتفعيل التثبيت السينمائي على الكمبيوتر حصرياً
  // وتوفير انسياب طبيعي بدون تداخل على الموبايل
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="relative z-10 w-full">
      {/* تثبيت الهيرو على الكمبيوتر وانسياب طبيعي على الموبايل */}
      <div ref={heroPinContainerRef} className="relative h-auto lg:h-[115vh] w-full">
        <div className="relative lg:sticky lg:top-0 z-0 w-full overflow-hidden">
          <motion.div
            style={{
              scale: isDesktop ? rawScale : 1,
              opacity: isDesktop ? rawOpacity : 1,
              y: isDesktop ? rawY : 0,
              transformOrigin: "center top",
            }}
            className="w-full will-change-transform"
          >
            {hero}
          </motion.div>
        </div>
      </div>

      {/* حاوية المحتوى: انسياب سلس 100% بدون أي قص أو فواصل */}
      <div
        className="relative z-20 w-full transition-colors duration-500 overflow-x-clip bg-transparent border-0"
      >
        {/* محتوى الصفحة */}
        <div className="relative z-10 w-full">{children}</div>
      </div>
    </div>
  );
}
