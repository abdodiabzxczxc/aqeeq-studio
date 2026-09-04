import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";

interface AqeeqTypographicScrubBarProps {
  text?: string;
  reverse?: boolean;
}

export function AqeeqTypographicScrubBar({
  text = "✦ COGNIA ACCREDITED · IDP IELTS OFFICIAL CENTER · DIGITAL SAT · WRO WORLD 5TH · FIRST LEGO CHAMPIONS ✦",
  reverse = false,
}: AqeeqTypographicScrubBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const from = reverse ? "-25%" : "25%";
  const to = reverse ? "25%" : "-25%";
  const rawX = useTransform(scrollYProgress, [0, 1], [from, to]);
  const x = useSpring(rawX, { stiffness: 85, damping: 20 });

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative w-full overflow-hidden py-4 select-none pointer-events-none"
    >
      <motion.div
        style={{ x }}
        className={`whitespace-nowrap font-black font-mono text-2xl sm:text-4xl md:text-5xl uppercase tracking-[0.2em] transition-opacity ${
          dark
            ? "text-transparent bg-clip-text bg-gradient-to-r from-emerald-500/10 via-[#f8ca14]/30 to-emerald-500/10 opacity-70"
            : "text-transparent bg-clip-text bg-gradient-to-r from-emerald-950/10 via-[#08467d]/20 to-emerald-950/10 opacity-60"
        }`}
      >
        {text} &nbsp; {text} &nbsp; {text}
      </motion.div>
    </div>
  );
}
