import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";

interface AqeeqTypographicScrubBarProps {
  text?: string;
  reverse?: boolean;
}

/**
 * AqeeqTypographicScrubBar — شريط الكتابة السينمائي البانورامي المتفاعل (Wellington Signature)
 * كتابة عربية وإنجليزية عملاقة مفرغة (Hollow Outlined Typography) تتحرك أفقياً مع حركة السكرول نزولاً وصعوداً.
 */
export function AqeeqTypographicScrubBar({
  text = "✦ مـدارس الـعـقـيـق الأهلـيـة والـدوليـة ✦ AL-AQEEQ SCHOOLS ✦ أصـالـة وتـمـيّـز ✦ INNOVATION & EXCELLENCE ✦",
  reverse = false,
}: AqeeqTypographicScrubBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const from = reverse ? "-15%" : "15%";
  const to = reverse ? "15%" : "-15%";
  const rawX = useTransform(scrollYProgress, [0, 1], [from, to]);
  const x = useSpring(rawX, { stiffness: 90, damping: 24, mass: 0.4 });

  return (
    <div
      ref={containerRef}
      className={`relative z-20 -mt-10 sm:-mt-16 w-full overflow-hidden py-6 select-none pointer-events-none transition-colors duration-500 ${
        dark ? "bg-black/60 backdrop-blur-md" : "bg-slate-100/80 backdrop-blur-md"
      }`}
    >
      <motion.div
        style={{ x }}
        className="flex items-center gap-8 whitespace-nowrap will-change-transform"
      >
        <span
          className={`text-5xl sm:text-7xl lg:text-8xl font-black tracking-widest ${
            dark
              ? "text-transparent [-webkit-text-stroke:1.2px_rgba(248,202,20,0.22)]"
              : "text-transparent [-webkit-text-stroke:1.2px_rgba(8,70,125,0.18)]"
          }`}
        >
          {text} {text}
        </span>
      </motion.div>
    </div>
  );
}
