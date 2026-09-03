import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";

interface AqeeqTypographicScrubBarProps {
  text?: string;
  reverse?: boolean;
}

export function AqeeqTypographicScrubBar({
  text = "✦ AL-AQEEQ SCHOOLS · SINCE 1994 · EXCELLENCE & LEADERSHIP ✦",
  reverse = false,
}: AqeeqTypographicScrubBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Layer 1: Giant headline — moves fast
  const from1 = reverse ? "-35%" : "35%";
  const to1   = reverse ? "35%"  : "-35%";
  const rawX1 = useTransform(scrollYProgress, [0, 1], [from1, to1]);
  const x1    = useSpring(rawX1, { stiffness: 85, damping: 22, mass: 0.4 });

  // Layer 2: Sub-headline — moves slower same direction
  const from2 = reverse ? "-15%" : "15%";
  const to2   = reverse ? "15%"  : "-15%";
  const rawX2 = useTransform(scrollYProgress, [0, 1], [from2, to2]);
  const x2    = useSpring(rawX2, { stiffness: 70, damping: 22, mass: 0.5 });

  // Layer 3: Micro-text — moves opposite direction (depth counter-parallax)
  const from3 = reverse ? "10%"  : "-10%";
  const to3   = reverse ? "-10%" : "10%";
  const rawX3 = useTransform(scrollYProgress, [0, 1], [from3, to3]);
  const x3    = useSpring(rawX3, { stiffness: 60, damping: 25, mass: 0.6 });

  return (
    <div
      ref={containerRef}
      className={`relative z-20 w-full overflow-hidden select-none pointer-events-none transition-colors duration-500 flex flex-col justify-center ${
        dark ? "bg-black/70 backdrop-blur-lg" : "bg-slate-50/90 backdrop-blur-lg"
      }`}
      style={{ height: "clamp(200px, 30vw, 380px)" }}
    >
      {/* Layer 1: Giant Text */}
      <motion.div
        style={{ x: x1 }}
        className="flex items-center gap-16 whitespace-nowrap will-change-transform absolute inset-0 items-center"
      >
        <span
          className={`font-black uppercase leading-none tracking-tight ${
            dark ? "text-[#f8ca14]/[0.09]" : "text-[#08467d]/[0.08]"
          }`}
          style={{ fontSize: "clamp(90px, 16vw, 220px)" }}
        >
          {text} {text} {text}
        </span>
      </motion.div>

      {/* Layer 2: Mid-size counter text */}
      <motion.div
        style={{ x: x2 }}
        className="flex items-center gap-10 whitespace-nowrap will-change-transform absolute inset-0 items-end pb-6"
      >
        <span
          className={`font-black uppercase tracking-[0.25em] ${
            dark ? "text-[#f8ca14]/[0.06]" : "text-[#08467d]/[0.05]"
          }`}
          style={{ fontSize: "clamp(22px, 3.5vw, 44px)" }}
        >
          {text} {text} {text} {text}
        </span>
      </motion.div>

      {/* Layer 3: Micro counter-parallax */}
      <motion.div
        style={{ x: x3 }}
        className="flex items-center gap-6 whitespace-nowrap will-change-transform absolute inset-0 items-start pt-5"
      >
        <span
          className={`font-black uppercase tracking-[0.4em] ${
            dark ? "text-white/[0.03]" : "text-[#08467d]/[0.03]"
          }`}
          style={{ fontSize: "clamp(14px, 2vw, 26px)" }}
        >
          {text} {text} {text} {text} {text}
        </span>
      </motion.div>
    </div>
  );
}
