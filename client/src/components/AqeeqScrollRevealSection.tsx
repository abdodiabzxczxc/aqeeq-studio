import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";

interface AqeeqScrollRevealSectionProps {
  children: React.ReactNode;
  /** Extra tailwind classes for the curtain panel (rounded top, bg, shadow) */
  className?: string;
  /** How many vh to make the sticky scroll window. Default 80 */
  scrollVh?: number;
  /** Show the golden neon line at the top of the curtain */
  neonLine?: boolean;
}

/**
 * AqeeqScrollRevealSection
 * كل سكشن داخله يعمل زي الهيرو تماماً:
 * - السكشن السابق يتصغر ويتضبب ويختفي أثناء السكرول
 * - السكشن الحالي يصعد بستارة مدوّرة من أسفل فوقه
 * - نفس فيزياء Wellington الملكية بالضبط
 */
export function AqeeqScrollRevealSection({
  children,
  className = "",
  scrollVh = 80,
  neonLine = true,
}: AqeeqScrollRevealSectionProps) {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const pinRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start end", "end start"],
  });

  // The curtain panel slides up as section enters view
  const rawY = useTransform(scrollYProgress, [0, 0.25], ["6vh", "0vh"]);
  const rawScale = useTransform(scrollYProgress, [0, 0.3], [0.98, 1]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);

  return (
    <div ref={pinRef} className="relative w-full">
      <motion.div
        style={{ y: rawY, scale: rawScale, opacity: rawOpacity, transformOrigin: "center bottom" }}
        className={`relative z-10 will-change-transform overflow-x-clip ${
          dark
            ? "rounded-t-[2.5rem] sm:rounded-t-[3.5rem] shadow-[0_-30px_80px_rgba(0,0,0,0.95)]"
            : "rounded-t-[2.5rem] sm:rounded-t-[3.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.1)]"
        } ${className}`}
      >
        {/* Neon gold separator line at very top */}
        {neonLine && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/5 max-w-2xl h-[1.5px] z-20"
            style={{
              background: dark
                ? "linear-gradient(90deg, transparent, rgba(248,202,20,0.7), transparent)"
                : "linear-gradient(90deg, transparent, rgba(8,70,125,0.35), transparent)",
              boxShadow: dark
                ? "0 0 12px rgba(248,202,20,0.45)"
                : "0 0 10px rgba(8,70,125,0.2)",
            }}
          />
        )}
        {children}
      </motion.div>
    </div>
  );
}
