"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { Newspaper, Sparkles, BookOpen } from "lucide-react";

export interface UnfurlingItem {
  id: string | number;
  title?: string;
  image: string;
  badge?: string;
  date?: string;
  link?: string;
}

export interface ParallaxUnfurlingGalleryProps {
  items: UnfurlingItem[];
  header?: React.ReactNode;
  dark?: boolean;
  className?: string;
  direction?: "left-to-right" | "right-to-left";
}

export function ParallaxUnfurlingGallery({
  items,
  header,
  dark = true,
  className = "",
  direction = "left-to-right",
}: ParallaxUnfurlingGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isRightToLeft = direction === "right-to-left";

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Guarantee at least 16 cards by duplicating if needed
  const displayItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    if (items.length >= 16) return items.slice(0, 16);
    const repeated: UnfurlingItem[] = [];
    while (repeated.length < 16) {
      repeated.push(...items);
    }
    return repeated.slice(0, 16);
  }, [items]);

  // Divide into 4 vertical columns
  const col1 = useMemo(() => displayItems.filter((_, idx) => idx % 4 === 0), [displayItems]);
  const col2 = useMemo(() => displayItems.filter((_, idx) => idx % 4 === 1), [displayItems]);
  const col3 = useMemo(() => displayItems.filter((_, idx) => idx % 4 === 2), [displayItems]);
  const col4 = useMemo(() => displayItems.filter((_, idx) => idx % 4 === 3), [displayItems]);

  // Track scroll through the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Critically damped spring physics: mass: 0.1, stiffness: 100, damping: 30
  // Damping ratio > 1: ZERO bounce, ZERO oscillation, pure silky organic gliding inertia
  const smoothConfig = { stiffness: 100, damping: 30, mass: 0.1, restDelta: 0.001 };

  const rawRotateX = useTransform(scrollYProgress, [0, 0.45], [isDesktop ? 16 : 8, isDesktop ? 4 : 0]);
  const rawRotateY = useTransform(
    scrollYProgress,
    [0, 0.45],
    [isDesktop ? (isRightToLeft ? -16 : 16) : (isRightToLeft ? -7 : 7), 0]
  );
  const rawRotateZ = useTransform(
    scrollYProgress,
    [0, 0.45],
    [isDesktop ? (isRightToLeft ? 7 : -7) : (isRightToLeft ? 3 : -3), 0]
  );
  const rawTranslateX = useTransform(
    scrollYProgress,
    [0, 0.45],
    [isDesktop ? (isRightToLeft ? 140 : -140) : (isRightToLeft ? 50 : -50), 0]
  );
  const rawTranslateY = useTransform(
    scrollYProgress,
    [0, 0.45],
    [isDesktop ? -180 : -80, isDesktop ? 140 : 60]
  );

  // Constant, ultra-subtle whisper opacity throughout scroll
  const opacity = dark ? 0.24 : 0.18;

  const rotateX = useSpring(rawRotateX, smoothConfig);
  const rotateY = useSpring(rawRotateY, smoothConfig);
  const rotateZ = useSpring(rawRotateZ, smoothConfig);
  const translateX = useSpring(rawTranslateX, smoothConfig);
  const translateY = useSpring(rawTranslateY, smoothConfig);

  // Column vertical parallax offsets with critically damped inertia
  const rawCol1Y = useTransform(
    scrollYProgress,
    [0, 1],
    [isDesktop ? (isRightToLeft ? 0 : -260) : -100, isDesktop ? (isRightToLeft ? -450 : 260) : 100]
  );
  const rawCol2Y = useTransform(
    scrollYProgress,
    [0, 1],
    [isDesktop ? (isRightToLeft ? -280 : 100) : 40, isDesktop ? (isRightToLeft ? 300 : -420) : -160]
  );
  const rawCol3Y = useTransform(
    scrollYProgress,
    [0, 1],
    [isDesktop ? (isRightToLeft ? 100 : -280) : -110, isDesktop ? (isRightToLeft ? -420 : 300) : 120]
  );
  const rawCol4Y = useTransform(
    scrollYProgress,
    [0, 1],
    [isDesktop ? (isRightToLeft ? -260 : 0) : 0, isDesktop ? (isRightToLeft ? 260 : -450) : -180]
  );

  const col1Y = useSpring(rawCol1Y, smoothConfig);
  const col2Y = useSpring(rawCol2Y, smoothConfig);
  const col3Y = useSpring(rawCol3Y, smoothConfig);
  const col4Y = useSpring(rawCol4Y, smoothConfig);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col self-auto overflow-hidden antialiased transition-colors duration-500 pb-6 sm:pb-8 [perspective:1200px] [transform-style:preserve-3d] ${
        dark ? "bg-[#05080e] text-white" : "bg-slate-50/70 text-slate-900"
      } ${className}`}
      style={{ minHeight: isDesktop ? "74vh" : "auto" }}
      dir="rtl"
    >
      {/* Ambient background glow and contrast vignetting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className={`absolute -top-32 ${isRightToLeft ? "left-1/4" : "right-1/4"} h-[560px] w-[560px] rounded-full blur-[140px] opacity-15 pointer-events-none ${
            dark ? "bg-[#08467d]" : "bg-[#08467d]/10"
          }`}
        />
        {/* Subtle vignette scrim overlay so foreground title & 3D cards stay 100% readable */}
        <div
          className={`absolute inset-0 z-10 pointer-events-none ${
            dark
              ? "bg-gradient-to-t from-[#05080e] via-[#05080e]/65 to-[#05080e]/40"
              : "bg-gradient-to-t from-slate-50 via-slate-50/70 to-slate-50/40"
          }`}
        />
        {/* Soft bottom edge gradient for seamless transition to content */}
        <div
          className={`absolute inset-x-0 bottom-0 h-36 pointer-events-none z-10 ${
            dark
              ? "bg-gradient-to-t from-[#05080e] via-[#05080e]/85 to-transparent"
              : "bg-gradient-to-t from-slate-50 via-slate-50/85 to-transparent"
          }`}
        />
      </div>

      {/* 3D Angled Unfurling Matrix Grid (Background) - Directed from LEFT to CENTER */}
      <motion.div
        dir="ltr"
        style={{
          rotateX,
          rotateY,
          rotateZ,
          translateX,
          translateY,
          opacity,
        }}
        className="pointer-events-none absolute -inset-x-12 -top-24 sm:-top-32 h-[190%] flex justify-center gap-3 sm:gap-6 md:gap-7 [transform-style:preserve-3d] will-change-transform select-none"
      >
        {/* Column 1 */}
        <motion.div
          style={{ y: col1Y }}
          className="flex flex-col gap-3 sm:gap-6 w-32 sm:w-52 md:w-60 lg:w-64 shrink-0"
        >
          {col1.map((item, idx) => (
            <UnfurlingCard key={`col1-${idx}`} item={item} dark={dark} />
          ))}
        </motion.div>

        {/* Column 2 */}
        <motion.div
          style={{ y: col2Y }}
          className="flex flex-col gap-3 sm:gap-6 w-32 sm:w-52 md:w-60 lg:w-64 shrink-0"
        >
          {col2.map((item, idx) => (
            <UnfurlingCard key={`col2-${idx}`} item={item} dark={dark} />
          ))}
        </motion.div>

        {/* Column 3 */}
        <motion.div
          style={{ y: col3Y }}
          className="flex flex-col gap-3 sm:gap-6 w-32 sm:w-52 md:w-60 lg:w-64 shrink-0"
        >
          {col3.map((item, idx) => (
            <UnfurlingCard key={`col3-${idx}`} item={item} dark={dark} />
          ))}
        </motion.div>

        {/* Column 4 (Hidden on small mobile, visible on tablet & desktop) */}
        <motion.div
          style={{ y: col4Y }}
          className="hidden sm:flex flex-col gap-3 sm:gap-6 w-32 sm:w-52 md:w-60 lg:w-64 shrink-0"
        >
          {col4.map((item, idx) => (
            <UnfurlingCard key={`col4-${idx}`} item={item} dark={dark} />
          ))}
        </motion.div>
      </motion.div>

      {/* Foreground Hero Stage (Header, Tilted Issue Covers, and Text) */}
      <div className="relative z-20 w-full">
        {header}
      </div>
    </div>
  );
}

// Individual 3D Portrait Card in the Unfurling Matrix
function UnfurlingCard({
  item,
  dark,
}: {
  item: UnfurlingItem;
  dark: boolean;
}) {
  return (
    <div
      className={`group relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden rounded-[1.6rem] sm:rounded-[2rem] border shadow-2xl transition-all duration-300 ${
        dark
          ? "border-white/10 bg-[#0d1219] shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
          : "border-black/10 bg-white shadow-[0_15px_35px_rgba(0,0,0,0.08)]"
      }`}
    >
      <img
        src={item.image}
        alt={item.title || "صورة من مجلة العقيق"}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />

      {/* Soft Vignette Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Card Details Pill */}
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-right" dir="rtl">
        {item.badge && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black border backdrop-blur-md mb-1 sm:mb-1.5 ${
              dark
                ? "border-[#f8ca14]/40 bg-black/60 text-[#f8ca14]"
                : "border-[#08467d]/30 bg-white/90 text-[#08467d]"
            }`}
          >
            <Sparkles size={10} />
            <span>{item.badge}</span>
          </span>
        )}

        {item.title && (
          <h4 className="text-xs sm:text-sm font-black text-white line-clamp-1 leading-snug drop-shadow-md">
            {item.title}
          </h4>
        )}

        {item.date && (
          <span className="text-[9px] sm:text-[10px] text-slate-300 font-bold block mt-0.5 opacity-80">
            {item.date}
          </span>
        )}
      </div>
    </div>
  );
}

export default ParallaxUnfurlingGallery;
