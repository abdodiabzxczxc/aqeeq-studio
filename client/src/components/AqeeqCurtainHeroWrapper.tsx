import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";

interface AqeeqCurtainHeroWrapperProps {
  hero: React.ReactNode;
  curtainContent: React.ReactNode;
}

/**
 * AqeeqCurtainHeroWrapper
 * يحاكي انتقال ويلينغتون الستاري الفاخر (Curtain Wipe & 3D Depth):
 * - الهيرو يثبت ويتراجع بنعومة في البعد الثالث (Scale + Opacity + Soft Parallax).
 * - القسم التالي يصعد بحواف علوية مستديرة وظلال زجاجية ملكية ليغطي الهيرو كالستارة.
 */
export function AqeeqCurtainHeroWrapper({ hero, curtainContent }: AqeeqCurtainHeroWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";

  // تتبع تقدم السكرول الخاص بالهيرو
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // فيزياء الحركة الناعمة مع تراجع البعد الثالث
  const rawHeroScale = useTransform(scrollYProgress, [0, 0.85], [1, 0.94]);
  const rawHeroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.78]);
  const rawHeroY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  const heroScale = useSpring(rawHeroScale, { stiffness: 120, damping: 24, mass: 0.5 });
  const heroOpacity = useSpring(rawHeroOpacity, { stiffness: 120, damping: 24, mass: 0.5 });
  const heroY = useSpring(rawHeroY, { stiffness: 120, damping: 24, mass: 0.5 });

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 1. طبقة الهيرو المثبتة (Pinned Background Hero with 3D Depth) */}
      <div className="sticky top-0 z-0 w-full overflow-hidden">
        <motion.div
          style={{
            scale: heroScale,
            opacity: heroOpacity,
            y: heroY,
            transformOrigin: "center top",
          }}
          className="will-change-transform"
        >
          {hero}
        </motion.div>
      </div>

      {/* 2. طبقة الستارة الصاعدة (The Royal Curtain Layer) */}
      <div
        className={`relative z-20 -mt-8 sm:-mt-14 w-full rounded-t-[2.5rem] sm:rounded-t-[3.75rem] transition-colors duration-500 overflow-x-clip ${
          isNationalDay
            ? dark
              ? "bg-[#020b06] shadow-[0_-30px_90px_rgba(0,0,0,0.85)] border-t border-[#f8ca14]/25"
              : "bg-[#f8faf8] shadow-[0_-25px_70px_rgba(0,90,54,0.12)] border-t border-emerald-500/20"
            : dark
            ? "bg-[#06080d] shadow-[0_-30px_90px_rgba(0,0,0,0.9)] border-t border-white/10"
            : "bg-white shadow-[0_-25px_60px_rgba(0,0,0,0.08)] border-t border-black/5"
        }`}
      >
        {/* خط إضاءة ملكي علوي خافت (Royal Glow Accent Hairline) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-3xl h-[1.5px] bg-gradient-to-r from-transparent via-[#f8ca14]/60 to-transparent z-30"
        />

        {/* مقبض سحب بصري أنيق جداً (Subtle Tactile Indicator) */}
        <div className="flex items-center justify-center pt-3 pb-1">
          <div
            className={`h-1.5 w-14 rounded-full transition ${
              dark ? "bg-white/15" : "bg-black/10"
            }`}
          />
        </div>

        {/* المحتوى الفعلي للأقسام */}
        {curtainContent}
      </div>
    </div>
  );
}
