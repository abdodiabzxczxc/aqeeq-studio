"use client";

import React, { useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";

export interface ArticleBackdropItem {
  id: string | number;
  title: string;
  category: string;
  authorName?: string;
  coverUrl?: string | null;
}

interface ArticlesScrollParallaxBackdropProps {
  articles: ArticleBackdropItem[];
  dark?: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  direction?: "left-to-right" | "right-to-left";
}

export function ArticlesScrollParallaxBackdrop({
  articles,
  dark = true,
  containerRef,
  direction = "left-to-right",
}: ArticlesScrollParallaxBackdropProps) {
  const isRtl = direction === "right-to-left";

  const [isDesktop, setIsDesktop] = React.useState(false);
  React.useEffect(() => {
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

  // Direct 1:1 hardware-accelerated transforms — zero trembling, zero bounce, zero latency
  const rotateX = useTransform(scrollYProgress, [0, 0.45], [isDesktop ? 16 : 8, isDesktop ? 4 : 0]);
  const rotateY = useTransform(
    scrollYProgress,
    [0, 0.45],
    [isDesktop ? (isRtl ? -16 : 16) : (isRtl ? -7 : 7), 0]
  );
  const rotateZ = useTransform(
    scrollYProgress,
    [0, 0.45],
    [isDesktop ? (isRtl ? 7 : -7) : (isRtl ? 3 : -3), 0]
  );
  const translateX = useTransform(
    scrollYProgress,
    [0, 0.45],
    [isDesktop ? (isRtl ? 140 : -140) : (isRtl ? 50 : -50), 0]
  );
  const translateY = useTransform(scrollYProgress, [0, 0.45], [isDesktop ? -180 : -80, isDesktop ? 140 : 60]);

  // Ultra-subtle starting opacity at 0.08 (pure dark luxury), blooms to 0.88 on entrance, and dissolves gracefully on scroll down (0.88 -> 0)
  // Direct interpolation with NO spring to eliminate all flickering and shivering
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.62, 0.95], [0.08, 0.88, 0.88, 0]);

  // Column vertical parallax offsets (Opposite directions for true unfurling motion)
  const col1Y = useTransform(scrollYProgress, [0, 1], [isDesktop ? -260 : -100, isDesktop ? 260 : 100]);
  const col2Y = useTransform(scrollYProgress, [0, 1], [isDesktop ? 100 : 40, isDesktop ? -420 : -160]);
  const col3Y = useTransform(scrollYProgress, [0, 1], [isDesktop ? -280 : -110, isDesktop ? 300 : 120]);

  // Guarantee at least 15 items by looping
  const displayItems = useMemo(() => {
    if (!articles || articles.length === 0) return [];
    if (articles.length >= 15) return articles.slice(0, 15);
    const repeated: ArticleBackdropItem[] = [];
    while (repeated.length < 15) {
      repeated.push(...articles);
    }
    return repeated.slice(0, 15);
  }, [articles]);

  const col1 = useMemo(() => displayItems.filter((_, idx) => idx % 3 === 0), [displayItems]);
  const col2 = useMemo(() => displayItems.filter((_, idx) => idx % 3 === 1), [displayItems]);
  const col3 = useMemo(() => displayItems.filter((_, idx) => idx % 3 === 2), [displayItems]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden [perspective:1400px] [transform-style:preserve-3d]"
    >
      {/* Deep subtle sapphire aura (pure dark, no yellow) */}
      <div
        className={`absolute -top-32 right-1/3 h-[580px] w-[580px] rounded-full blur-[140px] opacity-15 pointer-events-none ${
          dark ? "bg-[#08467d]" : "bg-[#08467d]/10"
        }`}
      />

      {/* Soft bottom edge gradient for seamless transition to feed */}
      <div
        className={`absolute inset-x-0 bottom-0 h-36 pointer-events-none z-10 ${
          dark
            ? "bg-gradient-to-t from-[#05080e] via-[#05080e]/85 to-transparent"
            : "bg-gradient-to-t from-white via-white/85 to-transparent"
        }`}
      />

      {/* 3D Parallax Columns */}
      <motion.div
        style={{
          opacity,
          rotateX,
          rotateY,
          rotateZ,
          x: translateX,
          y: translateY,
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          willChange: "transform, opacity",
        }}
        className="absolute -inset-x-12 -inset-y-24 grid grid-cols-3 gap-6 sm:gap-8 px-4 opacity-70"
      >
        {/* Column 1: moves Up */}
        <motion.div
          style={{
            y: col1Y,
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            willChange: "transform",
          }}
          className="flex flex-col gap-6"
        >
          {col1.map((item, idx) => (
            <div
              key={`b-col1-${item.id}-${idx}`}
              className={`rounded-2xl border p-2.5 overflow-hidden shadow-2xl transition ${
                dark
                  ? "border-white/10 bg-[#0a0f16]/90 shadow-black/80"
                  : "border-black/10 bg-white/90 shadow-slate-200"
              }`}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-800">
                {item.coverUrl ? (
                  <img
                    src={item.coverUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col justify-between p-3 bg-gradient-to-br from-[#08467d] to-black text-white">
                    <BookOpen size={20} className="text-[#f8ca14]" />
                    <span className="text-[10px] font-bold line-clamp-1">{item.title}</span>
                  </div>
                )}
              </div>
              <div className="p-2 text-right">
                <span className="text-[9px] font-black text-[#f8ca14]">{item.category}</span>
                <p className={`text-xs font-black line-clamp-1 mt-0.5 ${dark ? "text-slate-200" : "text-slate-800"}`}>
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Column 2: moves Down */}
        <motion.div
          style={{
            y: col2Y,
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            willChange: "transform",
          }}
          className="flex flex-col gap-6 -mt-16"
        >
          {col2.map((item, idx) => (
            <div
              key={`b-col2-${item.id}-${idx}`}
              className={`rounded-2xl border p-2.5 overflow-hidden shadow-2xl transition ${
                dark
                  ? "border-white/10 bg-[#0a0f16]/90 shadow-black/80"
                  : "border-black/10 bg-white/90 shadow-slate-200"
              }`}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-800">
                {item.coverUrl ? (
                  <img
                    src={item.coverUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col justify-between p-3 bg-gradient-to-br from-[#f8ca14]/40 to-black text-white">
                    <Sparkles size={20} className="text-[#f8ca14]" />
                    <span className="text-[10px] font-bold line-clamp-1">{item.title}</span>
                  </div>
                )}
              </div>
              <div className="p-2 text-right">
                <span className="text-[9px] font-black text-[#f8ca14]">{item.category}</span>
                <p className={`text-xs font-black line-clamp-1 mt-0.5 ${dark ? "text-slate-200" : "text-slate-800"}`}>
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Column 3: moves Up */}
        <motion.div
          style={{
            y: col3Y,
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            willChange: "transform",
          }}
          className="flex flex-col gap-6"
        >
          {col3.map((item, idx) => (
            <div
              key={`b-col3-${item.id}-${idx}`}
              className={`rounded-2xl border p-2.5 overflow-hidden shadow-2xl transition ${
                dark
                  ? "border-white/10 bg-[#0a0f16]/90 shadow-black/80"
                  : "border-black/10 bg-white/90 shadow-slate-200"
              }`}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-800">
                {item.coverUrl ? (
                  <img
                    src={item.coverUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col justify-between p-3 bg-gradient-to-br from-[#08467d] to-black text-white">
                    <BookOpen size={20} className="text-[#f8ca14]" />
                    <span className="text-[10px] font-bold line-clamp-1">{item.title}</span>
                  </div>
                )}
              </div>
              <div className="p-2 text-right">
                <span className="text-[9px] font-black text-[#f8ca14]">{item.category}</span>
                <p className={`text-xs font-black line-clamp-1 mt-0.5 ${dark ? "text-slate-200" : "text-slate-800"}`}>
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Soft bottom edge gradient for smooth transition */}
      <div
        className={`absolute inset-x-0 bottom-0 h-28 pointer-events-none z-10 ${
          dark
            ? "bg-gradient-to-t from-[#05080e] via-[#05080e]/80 to-transparent"
            : "bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent"
        }`}
      />
    </div>
  );
}
