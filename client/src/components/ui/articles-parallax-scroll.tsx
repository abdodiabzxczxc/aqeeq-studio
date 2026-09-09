"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { BookOpen, Sparkles, User, Clock, ArrowUpLeft } from "lucide-react";

export interface ArticleParallaxItem {
  id: string | number;
  title: string;
  slug: string;
  category: string;
  authorName?: string;
  authorRole?: string;
  coverUrl?: string | null;
  readingTime?: number;
  date?: string;
}

export interface ArticlesParallaxScrollProps {
  articles: ArticleParallaxItem[];
  header?: React.ReactNode;
  onSelectArticle?: (article: ArticleParallaxItem) => void;
  dark?: boolean;
  className?: string;
}

export function ArticlesParallaxScroll({
  articles,
  header,
  onSelectArticle,
  dark = true,
  className = "",
}: ArticlesParallaxScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Ensure at least 15 items by looping if necessary
  const displayItems = useMemo(() => {
    if (!articles || articles.length === 0) return [];
    if (articles.length >= 15) return articles.slice(0, 15);
    const repeated: ArticleParallaxItem[] = [];
    while (repeated.length < 15) {
      repeated.push(...articles);
    }
    return repeated.slice(0, 15);
  }, [articles]);

  // Divide into 3 columns
  const col1 = useMemo(() => displayItems.filter((_, idx) => idx % 3 === 0), [displayItems]);
  const col2 = useMemo(() => displayItems.filter((_, idx) => idx % 3 === 1), [displayItems]);
  const col3 = useMemo(() => displayItems.filter((_, idx) => idx % 3 === 2), [displayItems]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Critically damped spring physics: mass: 0.1, stiffness: 100, damping: 30
  // Damping ratio > 1: ZERO bounce, ZERO oscillation, pure silky organic gliding inertia
  const smoothConfig = { stiffness: 100, damping: 30, mass: 0.1, restDelta: 0.001 };

  // 3D Matrix Perspective Transformations with critically damped inertia
  const rawRotateX = useTransform(scrollYProgress, [0, 0.35], [isDesktop ? 15 : 6, 0]);
  const rawRotateZ = useTransform(scrollYProgress, [0, 0.35], [isDesktop ? -5 : -2, 0]);
  const rawTranslateY = useTransform(scrollYProgress, [0, 0.35], [isDesktop ? -440 : -140, isDesktop ? 220 : 60]);
  
  // Constant, ultra-subtle whisper opacity throughout scroll
  const opacity = dark ? 0.24 : 0.18;

  const rotateX = useSpring(rawRotateX, smoothConfig);
  const rotateZ = useSpring(rawRotateZ, smoothConfig);
  const translateY = useSpring(rawTranslateY, smoothConfig);

  // Column vertical parallax offsets with critically damped inertia
  const rawCol1Y = useTransform(scrollYProgress, [0, 1], [0, isDesktop ? -420 : -160]);
  const rawCol2Y = useTransform(scrollYProgress, [0, 1], [0, isDesktop ? 360 : 140]);
  const rawCol3Y = useTransform(scrollYProgress, [0, 1], [0, isDesktop ? -480 : -180]);

  const col1Y = useSpring(rawCol1Y, smoothConfig);
  const col2Y = useSpring(rawCol2Y, smoothConfig);
  const col3Y = useSpring(rawCol3Y, smoothConfig);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col self-auto overflow-hidden antialiased transition-colors duration-500 pb-12 sm:pb-16 [perspective:1200px] [transform-style:preserve-3d] bg-transparent border-0 ${
        dark ? "text-white" : "text-slate-900"
      } ${className}`}
      style={{ minHeight: isDesktop ? "180vh" : "135vh" }}
      dir="rtl"
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Soft bottom edge gradient */}
        <div
          className={`absolute inset-x-0 bottom-0 h-32 pointer-events-none z-10 ${
            dark
              ? "bg-gradient-to-t from-black via-black/80 to-transparent"
              : "bg-gradient-to-t from-white via-white/80 to-transparent"
          }`}
        />
      </div>

      {/* Hero Header on Top */}
      {header ? (
        <div className="relative z-20 mx-auto w-full max-w-[1380px] px-4 sm:px-6 md:px-8 pt-6 sm:pt-10 pb-4 text-right">
          {header}
        </div>
      ) : null}

      {/* 3D Moving Perspective Columns (Behind & Beneath Header) */}
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          {/* Column 1 */}
          <motion.div style={{ y: col1Y }} className="space-y-5 sm:space-y-7">
            {col1.map((item, idx) => (
              <ArticleParallaxCard
                key={`${item.id}-${idx}`}
                item={item}
                dark={dark}
                onSelect={() => onSelectArticle?.(item)}
              />
            ))}
          </motion.div>

          {/* Column 2 */}
          <motion.div style={{ y: col2Y }} className="space-y-5 sm:space-y-7">
            {col2.map((item, idx) => (
              <ArticleParallaxCard
                key={`${item.id}-${idx}`}
                item={item}
                dark={dark}
                onSelect={() => onSelectArticle?.(item)}
              />
            ))}
          </motion.div>

          {/* Column 3 */}
          <motion.div style={{ y: col3Y }} className="space-y-5 sm:space-y-7">
            {col3.map((item, idx) => (
              <ArticleParallaxCard
                key={`${item.id}-${idx}`}
                item={item}
                dark={dark}
                onSelect={() => onSelectArticle?.(item)}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function ArticleParallaxCard({
  item,
  dark,
  onSelect,
}: {
  item: ArticleParallaxItem;
  dark: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      onClick={onSelect}
      className={`group relative cursor-pointer overflow-hidden rounded-[1.8rem] border p-3.5 sm:p-4.5 transition-all duration-300 shadow-xl ${
        dark
          ? "border-white/10 bg-[#0d131d]/90 hover:border-[#f8ca14]/50 hover:shadow-[0_16px_40px_rgba(248,202,20,0.15)]"
          : "border-black/10 bg-white/90 hover:border-[#08467d]/40 hover:shadow-[0_16px_40px_rgba(8,70,125,0.12)]"
      } backdrop-blur-md`}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.3rem] bg-black/40">
        {item.coverUrl ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#08467d]/40 to-[#041d35]/70">
            <BookOpen size={36} className="text-[#f8ca14]/60" />
          </div>
        )}

        {/* Category Badge Overlay */}
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-[11px] font-black text-[#f8ca14] backdrop-blur-md border border-[#f8ca14]/30">
            <Sparkles size={11} />
            <span>{item.category}</span>
          </span>
        </div>

        {/* Reading Time Pill */}
        {item.readingTime && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-white/90 backdrop-blur-md border border-white/15">
              <Clock size={10} />
              <span>{item.readingTime} د قراءة</span>
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="mt-3.5 space-y-2 px-1 text-right">
        {/* Author Line */}
        {item.authorName && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
            <User size={12} className="text-[#f8ca14]" />
            <span>بقلم: {item.authorName}</span>
          </div>
        )}

        {/* Title */}
        <h3 className={`line-clamp-2 text-sm sm:text-base font-black leading-snug transition-colors group-hover:text-[#f8ca14] ${
          dark ? "text-white" : "text-slate-900"
        }`}>
          {item.title}
        </h3>

        {/* Action Link Row */}
        <div className="flex items-center justify-between pt-2 text-xs font-bold">
          <span className="inline-flex items-center gap-1 text-[#f8ca14] group-hover:underline">
            <span>اقرأ المقال</span>
            <ArrowUpLeft size={13} />
          </span>
          {item.date && (
            <span className="text-[10px] text-slate-400 font-medium">
              {item.date}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ArticlesParallaxScroll;
