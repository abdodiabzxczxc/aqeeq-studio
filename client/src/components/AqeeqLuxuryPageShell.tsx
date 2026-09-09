import React, { useRef, useState, useEffect } from "react";
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
      className={`relative min-h-screen aq-public-shell ${
        dark ? "aq-studio-share--dark" : "aq-studio-share--light"
      } overflow-x-clip selection:bg-[#f8ca14]/30 ${
        dark ? "bg-black text-white" : "bg-white text-slate-900"
      } ${className}`}
      style={{
        background: dark ? "#000000" : "#ffffff",
      }}
    >
      {/* ── خلفية الإضاءة المحيطية العالمية السلسة الممتدة بدون أي حواف أو قطع ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-100 transition-opacity duration-700"
        aria-hidden="true"
        style={{
          background: isNationalDay
            ? dark
              ? "radial-gradient(ellipse 90% 50% at 50% -10%, rgba(0, 90, 54, 0.42) 0%, transparent 70%), radial-gradient(ellipse 65% 45% at 85% 20%, rgba(212, 175, 55, 0.16) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 15% 75%, rgba(90, 186, 28, 0.12) 0%, transparent 60%)"
              : "radial-gradient(ellipse 90% 50% at 50% -10%, rgba(0, 90, 54, 0.08) 0%, transparent 70%), radial-gradient(ellipse 65% 45% at 85% 20%, rgba(212, 175, 55, 0.06) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 15% 75%, rgba(90, 186, 28, 0.04) 0%, transparent 60%)"
            : dark
            ? "radial-gradient(ellipse 85% 50% at 30% -10%, rgba(8, 70, 125, 0.35) 0%, transparent 70%), radial-gradient(ellipse 65% 45% at 80% 25%, rgba(248, 202, 20, 0.16) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 15% 70%, rgba(222, 25, 30, 0.09) 0%, transparent 60%)"
            : "radial-gradient(ellipse 85% 50% at 30% -10%, rgba(8, 70, 125, 0.08) 0%, transparent 70%), radial-gradient(ellipse 65% 45% at 80% 25%, rgba(248, 202, 20, 0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 15% 70%, rgba(222, 25, 30, 0.03) 0%, transparent 60%)",
        }}
      />
      {/* 🇸🇦 Floating Gold Stars — National Day Ambient Particles */}
      {isNationalDay && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          {[
            { char: "★", left: "5%",  dur: "9s",  delay: "0s",   size: "12px" },
            { char: "☆", left: "18%", dur: "13s", delay: "2s",   size: "9px"  },
            { char: "★", left: "32%", dur: "11s", delay: "4.5s", size: "15px" },
            { char: "☆", left: "48%", dur: "8s",  delay: "1s",   size: "10px" },
            { char: "★", left: "63%", dur: "14s", delay: "3s",   size: "8px"  },
            { char: "☆", left: "77%", dur: "10s", delay: "6s",   size: "13px" },
            { char: "★", left: "91%", dur: "12s", delay: "0.5s", size: "11px" },
          ].map((p, i) => (
            <span
              key={i}
              className="aq-star"
              style={{
                left: p.left,
                animationDuration: p.dur,
                animationDelay: p.delay,
                fontSize: p.size,
              }}
            >
              {p.char}
            </span>
          ))}
        </div>
      )}

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
