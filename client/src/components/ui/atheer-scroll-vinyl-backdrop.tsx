"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { Disc3 } from "lucide-react";

export interface AtheerScrollBackdropItem {
  id: string | number;
  title: string;
  coverUrl?: string | null;
  category?: string;
  audioUrl?: string | null;
  duration?: string | number;
  description?: string;
  type?: string;
  author?: string;
  [key: string]: any;
}

interface AtheerScrollVinylBackdropProps {
  items: AtheerScrollBackdropItem[];
  dark?: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

// Fallback high-resolution album artworks so each vinyl sleeve looks distinct & lavish
const STUDIO_COVERS = [
  "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1520523839898-5071284d7c07?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1445985543470-41fdd7c31d87?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80",
];

// Grand 3D Vinyl Record Card Sub-Component:
// - Generous, prominent dimensions (330px sleeve, 310px disc, 96px golden label)
// - Only the album sleeve currently in the CENTER of the screen slides out its disc!
// - All other sleeves keep their discs completely tucked inside!
// - Row 1 slides disc to the left (towards center); Row 2 slides disc to the right (towards center).
function GrandVinylRecordItem({
  item,
  idx,
  scrollYProgress,
  rowDirection,
  dark,
  isDesktop,
}: {
  item: AtheerScrollBackdropItem;
  idx: number;
  scrollYProgress: MotionValue<number>;
  rowDirection: "right" | "left";
  dark: boolean;
  isDesktop: boolean;
}) {
  // Center target points along scroll progress:
  // In rowDirection === "right" (Row 1):
  // - idx 2 is at center at p = 0.0 (initial page load)
  // - idx 1 arrives at center at p = 0.45
  // - idx 0 arrives at center at p = 0.85
  // - idx 3 & 4 stay tucked
  //
  // In rowDirection === "left" (Row 2):
  // - idx 2 is at center at p = 0.0 (initial page load)
  // - idx 3 arrives at center at p = 0.45
  // - idx 4 arrives at center at p = 0.85
  // - idx 0 & 1 stay tucked

  const isCenterEligible =
    rowDirection === "right"
      ? idx === 2 || idx === 1 || idx === 0
      : idx === 2 || idx === 3 || idx === 4;

  const targetP =
    rowDirection === "right"
      ? idx === 2 ? 0.0 : idx === 1 ? 0.45 : idx === 0 ? 0.85 : -1
      : idx === 2 ? 0.0 : idx === 3 ? 0.45 : idx === 4 ? 0.85 : -1;

  // Max slide distance: 175px on desktop so the entire golden label emerges into clear view!
  const maxSlide = isDesktop ? 175 : 130;

  // Smooth bell curve: peaks when record reaches center, drops to 0 when away
  const rawSlide = useTransform(scrollYProgress, (p) => {
    if (!isCenterEligible || targetP < 0) return 0;
    const dist = Math.abs(p - targetP);
    const activeWindow = 0.22;
    if (dist >= activeWindow) return 0;
    const normalized = Math.cos((dist / activeWindow) * (Math.PI / 2));
    return normalized * maxSlide;
  });

  const slide = useSpring(rawSlide, { stiffness: 220, damping: 26, bounce: 0 });

  // Authentic continuous turntable rotation
  const discRotate = useTransform(
    scrollYProgress,
    [0, 1],
    [idx * 35, idx * 35 + (rowDirection === "right" ? 320 : -320)]
  );

  // Center golden aura highlight on active sleeve
  const centerHighlight = useTransform(rawSlide, [0, maxSlide * 0.7], [0, 1]);
  const sleeveBorderColor = useTransform(
    centerHighlight,
    [0, 1],
    dark
      ? ["rgba(255,255,255,0.12)", "rgba(248,202,20,0.85)"]
      : ["rgba(0,0,0,0.12)", "rgba(248,202,20,0.9)"]
  );
  const sleeveBoxShadow = useTransform(
    centerHighlight,
    [0, 1],
    dark
      ? ["0 20px 45px rgba(0,0,0,0.7)", "0 25px 60px rgba(248,202,20,0.35)"]
      : ["0 15px 35px rgba(0,0,0,0.1)", "0 25px 50px rgba(248,202,20,0.3)"]
  );

  // Elevation: active center card elevates above neighbors
  const cardZIndex = useTransform(centerHighlight, [0, 0.15], [5, 30]);

  // Direction: slide to left for Row 1, slide to right for Row 2
  const discTranslateX = useTransform(slide, (val) =>
    rowDirection === "right" ? -val : val
  );

  // Use rich diverse covers if default placeholder is detected
  const isGenericCover = !item.coverUrl || item.coverUrl.includes("aqeeq-anthems-royal-cover");
  const coverSrc = isGenericCover
    ? STUDIO_COVERS[idx % STUDIO_COVERS.length]
    : item.coverUrl;

  return (
    <motion.div
      style={{
        zIndex: cardZIndex,
        width: isDesktop ? "480px" : "360px",
        height: isDesktop ? "350px" : "280px",
      }}
      className="relative shrink-0 flex items-center justify-center"
    >
      {/* Grand Sliding Vinyl Disc:
          Centered behind sleeve when tucked (slide = 0).
          Slides smoothly out when near center, exposing the sound grooves & gold center label! */}
      <motion.div
        style={{
          x: discTranslateX,
          rotate: discRotate,
        }}
        className="absolute top-2 w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] rounded-full z-0 pointer-events-none"
      >
        {/* Realistic Vinyl Grooves Texture */}
        <div className="w-full h-full rounded-full bg-[#08080b] border border-white/15 p-3 sm:p-4 relative flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
          {/* Concentric sound micro-grooves */}
          <div className="absolute inset-3 sm:inset-4 rounded-full border border-white/[0.08]" />
          <div className="absolute inset-7 sm:inset-8 rounded-full border border-white/[0.07]" />
          <div className="absolute inset-11 sm:inset-12 rounded-full border border-white/[0.06]" />
          <div className="absolute inset-15 sm:inset-16 rounded-full border border-white/[0.05]" />
          <div className="absolute inset-19 sm:inset-20 rounded-full border border-white/[0.04]" />

          {/* Golden Center Vinyl Label with Spindle Hole */}
          <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#9a7618] via-[#f8ca14] to-[#fef08a] border-2 sm:border-3 border-black/60 flex items-center justify-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_0_25px_rgba(248,202,20,0.4)]">
            {/* Center Label typography & spindle hole */}
            <div className="flex flex-col items-center justify-center text-center select-none">
              <span className="text-[7px] sm:text-[8px] font-black text-black/80 tracking-widest uppercase">
                ATHIR
              </span>
              <div className="w-3 h-3 sm:w-4 sm:h-4 my-0.5 rounded-full bg-[#05080e] border border-white/40 shadow-inner" />
              <span className="text-[6px] sm:text-[7px] font-black text-black/70">
                33 RPM
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grand Album Sleeve: sits in front at z-10, completely concealing the disc when tucked */}
      <motion.div
        style={{
          borderColor: sleeveBorderColor,
          boxShadow: sleeveBoxShadow,
        }}
        className={`relative z-10 w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] rounded-[1.8rem] sm:rounded-[2.2rem] overflow-hidden border transition-colors duration-300 ${
          dark
            ? "border-white/10 bg-[#0d1218] shadow-black/80"
            : "border-black/10 bg-white shadow-slate-300"
        }`}
      >
        <img
          src={coverSrc || ""}
          alt=""
          className="w-full h-full object-cover select-none"
        />

        {/* Vinyl sleeve spine overlay (opposite to disc slide direction) */}
        {rowDirection === "right" ? (
          <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black/60 to-transparent" />
        ) : (
          <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/60 to-transparent" />
        )}

        {/* Bottom Title Bar Overlay on Sleeve */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white text-right">
          <span className="inline-block text-[9px] sm:text-[10px] font-black text-[#f8ca14] mb-0.5">
            {item.category || "أثير العقيق"}
          </span>
          <p className="text-xs sm:text-sm font-black line-clamp-1 leading-snug">
            {item.title}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AtheerScrollVinylBackdrop({
  items,
  dark = true,
  containerRef,
}: AtheerScrollVinylBackdropProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Snappy responsive spring with zero bounce for immediate reaction on first scroll pixel
  const springConfig = { stiffness: 220, damping: 28, bounce: 0 };

  // Ultra-subtle starting opacity at 0.08 (pure dark luxury), blooms smoothly to 0.88 on scroll
  const rawOpacity = useTransform(scrollYProgress, [0, 0.35], [0.08, 0.88]);
  const opacity = useSpring(rawOpacity, springConfig);

  // Parallax horizontal glides for the two grand vinyl rows
  const rawRow1X = useTransform(scrollYProgress, [0, 1], [0, isDesktop ? 520 : 320]);
  const rawRow2X = useTransform(scrollYProgress, [0, 1], [0, isDesktop ? -520 : -320]);
  const row1X = useSpring(rawRow1X, springConfig);
  const row2X = useSpring(rawRow2X, springConfig);

  // 3D perspective tilt: tilts gracefully and levels out
  const rawRotateX = useTransform(scrollYProgress, [0, 0.45], [isDesktop ? 15 : 8, 0]);
  const rawRotateZ = useTransform(scrollYProgress, [0, 0.45], [isDesktop ? -4 : -2, 0]);
  const rotateX = useSpring(rawRotateX, springConfig);
  const rotateZ = useSpring(rawRotateZ, springConfig);

  // Guarantee at least 10 items
  const displayItems = useMemo(() => {
    const list: AtheerScrollBackdropItem[] = [];
    if (items && items.length > 0) {
      list.push(...items);
    }
    while (list.length < 10) {
      list.push({
        id: `filler-${list.length}`,
        title: `حلقة استوديو العقيق #${list.length + 1}`,
        category: "أثير وبودكاست",
        coverUrl: STUDIO_COVERS[list.length % STUDIO_COVERS.length],
      });
    }
    return list.slice(0, 10);
  }, [items]);

  const row1 = displayItems.slice(0, 5);
  const row2 = displayItems.slice(5, 10);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden [perspective:1400px] [transform-style:preserve-3d]"
    >
      {/* Deep subtle sapphire aura in background (pure dark, no yellow) */}
      <div
        className={`absolute -top-32 right-1/4 h-[550px] w-[550px] rounded-full blur-[140px] opacity-15 pointer-events-none ${
          dark ? "bg-[#08467d]" : "bg-[#08467d]/10"
        }`}
      />

      {/* 3D Vinyl Stage:
          Positioned from the VERY TOP (-top-10 sm:-top-16) just like News & Articles!
          Starts moving immediately on the very first pixel of scroll! */}
      <motion.div
        style={{
          opacity,
          rotateX,
          rotateZ,
        }}
        className="pointer-events-none absolute -inset-x-12 -top-10 sm:-top-16 h-[175%] flex flex-col justify-start gap-8 sm:gap-12 [transform-style:preserve-3d] will-change-transform select-none"
      >
        {/* Top Vinyl Row: Glides Right on Scroll */}
        <motion.div
          style={{ x: row1X }}
          className="flex items-center justify-center gap-6 sm:gap-12 whitespace-nowrap"
        >
          {row1.map((item, idx) => (
            <GrandVinylRecordItem
              key={`row1-${item.id}-${idx}`}
              item={item}
              idx={idx}
              scrollYProgress={scrollYProgress}
              rowDirection="right"
              dark={dark}
              isDesktop={isDesktop}
            />
          ))}
        </motion.div>

        {/* Bottom Vinyl Row: Glides Left on Scroll */}
        <motion.div
          style={{ x: row2X }}
          className="flex items-center justify-center gap-6 sm:gap-12 whitespace-nowrap"
        >
          {row2.map((item, idx) => (
            <GrandVinylRecordItem
              key={`row2-${item.id}-${idx}`}
              item={item}
              idx={idx}
              scrollYProgress={scrollYProgress}
              rowDirection="left"
              dark={dark}
              isDesktop={isDesktop}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Soft Bottom Edge Gradient for clean transition to the content below */}
      <div
        className={`absolute inset-x-0 bottom-0 h-36 pointer-events-none z-10 ${
          dark
            ? "bg-gradient-to-t from-[#05080e] via-[#05080e]/80 to-transparent"
            : "bg-gradient-to-t from-white via-white/80 to-transparent"
        }`}
      />
    </div>
  );
}
