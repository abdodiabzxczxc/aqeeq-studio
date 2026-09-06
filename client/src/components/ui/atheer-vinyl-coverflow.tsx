"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  Play,
  Pause,
  Disc3,
  Sparkles,
  Music2,
  Mic2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

export interface AtheerMediaItem {
  id: string | number;
  title: string;
  category: string;
  coverUrl?: string | null;
  audioUrl?: string | null;
  duration?: string | number;
  description?: string;
  type?: "podcast" | "anthem" | "radio";
  author?: string;
}

export interface AtheerVinylCoverflowProps {
  items: AtheerMediaItem[];
  activeId?: string | number | null;
  isPlaying?: boolean;
  onPlayItem?: (item: AtheerMediaItem) => void;
  onPauseItem?: () => void;
  dark?: boolean;
  className?: string;
  header?: React.ReactNode;
}

export function AtheerVinylCoverflow({
  items,
  activeId,
  isPlaying = false,
  onPlayItem,
  onPauseItem,
  dark = true,
  className = "",
  header,
}: AtheerVinylCoverflowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Update active index if activeId changes from outside
  useEffect(() => {
    if (activeId !== undefined && activeId !== null) {
      const idx = items.findIndex((it) => String(it.id) === String(activeId));
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    }
  }, [activeId, items]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Critically damped spring physics: mass: 0.1, stiffness: 100, damping: 30
  // Damping ratio > 1: ZERO bounce, ZERO oscillation, pure silky organic gliding inertia
  const smoothConfig = { stiffness: 100, damping: 30, mass: 0.1, restDelta: 0.001 };

  // Direct linear opacity — zero flicker
  const opacity = useTransform(scrollYProgress, [0, 0.28], [0.16, 1]);
  const rawTranslateY = useTransform(
    scrollYProgress,
    [0, 0.35],
    [isDesktop ? -440 : -150, isDesktop ? 140 : 40]
  );
  const rawScale = useTransform(scrollYProgress, [0, 0.35], [0.9, 1]);
  const rawRotateX = useTransform(scrollYProgress, [0, 0.35], [isDesktop ? 12 : 6, 0]);

  const translateY = useSpring(rawTranslateY, smoothConfig);
  const scale = useSpring(rawScale, smoothConfig);
  const rotateX = useSpring(rawRotateX, smoothConfig);

  const displayList = useMemo(() => {
    if (!items || items.length === 0) return [];
    return items;
  }, [items]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : displayList.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < displayList.length - 1 ? prev + 1 : 0));
  };

  const currentItem = displayList[activeIndex];
  const isCurrentActivePlaying =
    Boolean(currentItem) &&
    String(currentItem?.id) === String(activeId) &&
    isPlaying;

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col self-auto overflow-hidden antialiased transition-colors duration-500 pb-16 [perspective:1400px] [transform-style:preserve-3d] ${
        dark ? "bg-[#05080e] text-white" : "bg-slate-50/70 text-slate-900"
      } ${className}`}
      style={{ minHeight: isDesktop ? "150vh" : "115vh" }}
      dir="rtl"
    >
      {/* Dynamic ambient studio aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className={`absolute -top-32 right-1/4 h-[580px] w-[580px] rounded-full blur-[140px] opacity-30 ${
            dark ? "bg-[#08467d]" : "bg-[#08467d]/20"
          }`}
        />
        <div
          className={`absolute top-1/3 left-1/4 h-[520px] w-[520px] rounded-full blur-[130px] opacity-25 ${
            dark ? "bg-[#f8ca14]" : "bg-[#f8ca14]/20"
          }`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 h-32 pointer-events-none z-10 ${
            dark
              ? "bg-gradient-to-t from-[#05080e] via-[#05080e]/80 to-transparent"
              : "bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent"
          }`}
        />
      </div>

      {/* Header section on top */}
      {header ? (
        <div className="relative z-20 mx-auto w-full max-w-[1380px] px-4 sm:px-6 md:px-8 pt-6 sm:pt-10 pb-4 text-right">
          {header}
        </div>
      ) : null}

      {/* 3D Vinyl Coverflow Carousel Section */}
      <motion.div
        style={{
          opacity,
          translateY,
          scale,
          rotateX,
        }}
        className="relative z-10 mx-auto mt-6 sm:mt-10 w-full max-w-[1400px] px-4"
      >
        {/* Navigation Bar & Title for Carousel */}
        <div className="flex items-center justify-between px-4 sm:px-8 mb-6">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f8ca14] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f8ca14]"></span>
            </span>
            <span className="text-xs sm:text-sm font-black tracking-wider text-[#f8ca14]">
              3D VINYL COVERFLOW · مدار أثير العقيق
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className={`grid h-10 w-10 place-items-center rounded-xl border backdrop-blur-md transition ${
                dark
                  ? "border-white/10 bg-white/5 hover:bg-white/15 text-white"
                  : "border-black/10 bg-white/80 hover:bg-white text-black shadow-sm"
              }`}
              aria-label="السابق"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={handleNext}
              className={`grid h-10 w-10 place-items-center rounded-xl border backdrop-blur-md transition ${
                dark
                  ? "border-white/10 bg-white/5 hover:bg-white/15 text-white"
                  : "border-black/10 bg-white/80 hover:bg-white text-black shadow-sm"
              }`}
              aria-label="التالي"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        {/* 3D Carousel Stage */}
        <div className="relative h-[420px] sm:h-[480px] w-full flex items-center justify-center overflow-visible [perspective:1600px]">
          {displayList.map((item, index) => {
            const offset = index - activeIndex;
            // Visible items limit: 2 to the left, 2 to the right
            const isVisible = Math.abs(offset) <= 2;
            if (!isVisible) return null;

            const isCenter = offset === 0;
            const xOffset = offset * (isDesktop ? 270 : 160);
            const zOffset = -Math.abs(offset) * (isDesktop ? 160 : 110);
            const yRotate = -offset * (isDesktop ? 26 : 22);
            const itemScale = isCenter ? 1 : 0.82;
            const itemOpacity = isCenter ? 1 : 0.65 - Math.abs(offset) * 0.15;
            const isItemPlaying =
              String(item.id) === String(activeId) && isPlaying;

            return (
              <motion.div
                key={`${item.id}-${index}`}
                initial={false}
                animate={{
                  x: xOffset,
                  z: zOffset,
                  rotateY: yRotate,
                  scale: itemScale,
                  opacity: itemOpacity,
                }}
                transition={{
                  type: "spring",
                  stiffness: 240,
                  damping: 26,
                }}
                onClick={() => {
                  if (isCenter) {
                    if (isItemPlaying) {
                      onPauseItem?.();
                    } else {
                      onPlayItem?.(item);
                    }
                  } else {
                    setActiveIndex(index);
                  }
                }}
                className={`absolute cursor-pointer select-none [transform-style:preserve-3d] transition-shadow duration-300 ${
                  isCenter ? "z-30 cursor-default" : "z-10 hover:opacity-90"
                }`}
                style={{
                  width: isDesktop ? 340 : 260,
                  height: isDesktop ? 380 : 310,
                }}
              >
                <div className="relative h-full w-full group">
                  {/* Vinyl Record Disc (slides out from sleeve on center item) */}
                  <motion.div
                    animate={{
                      x: isCenter ? (isDesktop ? 80 : 50) : 0,
                      rotate: isItemPlaying ? 360 : 0,
                    }}
                    transition={{
                      x: { type: "spring", stiffness: 200, damping: 24 },
                      rotate: {
                        repeat: isItemPlaying ? Infinity : 0,
                        duration: 6,
                        ease: "linear",
                      },
                    }}
                    className="absolute inset-y-4 right-2 aspect-square rounded-full shadow-2xl overflow-hidden -z-10 bg-[#111] border border-black/80 flex items-center justify-center"
                    style={{
                      backgroundImage: `repeating-radial-gradient(circle at center, #181818 0px, #181818 2px, #0e0e0e 3px, #0e0e0e 5px)`,
                    }}
                  >
                    {/* Vinyl Sheen Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />

                    {/* Vinyl Center Golden Label */}
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-[#f8ca14]/80 bg-gradient-to-tr from-[#f8ca14] to-[#08467d] p-1 flex items-center justify-center shadow-lg">
                      <div className="h-4 w-4 rounded-full bg-black border border-[#f8ca14]" />
                    </div>
                  </motion.div>

                  {/* Vinyl Sleeve / Album Cover */}
                  <div
                    className={`relative h-full w-full rounded-[2rem] border overflow-hidden p-3 shadow-2xl backdrop-blur-xl transition-transform duration-300 ${
                      isCenter
                        ? dark
                          ? "border-[#f8ca14]/70 bg-[#0d1218] shadow-[0_25px_60px_rgba(248,202,20,0.22)] ring-1 ring-[#f8ca14]/40"
                          : "border-[#08467d]/40 bg-white shadow-[0_25px_60px_rgba(8,70,125,0.18)]"
                        : dark
                        ? "border-white/10 bg-[#0c0f14]"
                        : "border-black/10 bg-white"
                    }`}
                  >
                    {/* Artwork Container */}
                    <div className="relative h-[68%] w-full rounded-[1.4rem] overflow-hidden bg-black/40">
                      {item.coverUrl ? (
                        <img
                          src={item.coverUrl}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#08467d] to-[#05080e] text-[#f8ca14]">
                          <Disc3 size={54} className="animate-spin-slow" />
                        </div>
                      )}

                      {/* Play/Pause Button Overlay on Center Card */}
                      {isCenter && (
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center transition-opacity group-hover:bg-black/45">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isItemPlaying) {
                                onPauseItem?.();
                              } else {
                                onPlayItem?.(item);
                              }
                            }}
                            className="grid h-16 w-16 place-items-center rounded-full bg-[#f8ca14] text-black shadow-2xl transition hover:scale-110 active:scale-95"
                            aria-label={isItemPlaying ? "إيقاف مؤقت" : "تشغيل الآن"}
                          >
                            {isItemPlaying ? (
                              <Pause size={28} className="fill-black" />
                            ) : (
                              <Play size={28} className="fill-black mr-1" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Live Equalizer Animation if Playing */}
                      {isItemPlaying && (
                        <div className="absolute bottom-3 left-3 flex items-end gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#f8ca14]/40">
                          <span className="h-3 w-1 bg-[#f8ca14] rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="h-4 w-1 bg-[#f8ca14] rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="h-2 w-1 bg-[#f8ca14] rounded-full animate-bounce [animation-delay:-0.45s]" />
                          <span className="text-[10px] font-black text-[#f8ca14] mr-1">
                            عزف حي
                          </span>
                        </div>
                      )}

                      {/* Category Tag Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black bg-black/70 text-[#f8ca14] border border-[#f8ca14]/40 backdrop-blur-md">
                          {item.type === "anthem" ? (
                            <Music2 size={11} />
                          ) : (
                            <Mic2 size={11} />
                          )}
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Title */}
                    <div className="mt-3.5 flex flex-col justify-between px-1">
                      <h3 className="text-sm sm:text-base font-black truncate text-right">
                        {item.title}
                      </h3>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                        <span className="truncate">{item.author || "مدارس العقيق"}</span>
                        {item.duration && (
                          <span className="text-slate-500 font-mono">
                            {typeof item.duration === "number"
                              ? `${Math.floor(item.duration / 60)}:${String(
                                  Math.floor(item.duration % 60)
                                ).padStart(2, "0")}`
                              : item.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Active Track Highlight Banner below Coverflow */}
        {currentItem && (
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mx-auto mt-6 max-w-xl rounded-2xl border p-4 text-center backdrop-blur-xl transition ${
              dark
                ? "border-white/10 bg-white/[0.03] text-white"
                : "border-black/10 bg-white/80 text-slate-900 shadow-lg"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="text-right">
                <span className="text-[10px] font-black text-[#f8ca14] uppercase tracking-wider">
                  المقطع النشط في الأثير
                </span>
                <h4 className="text-base font-black truncate max-w-xs sm:max-w-md">
                  {currentItem.title}
                </h4>
              </div>

              <button
                onClick={() => {
                  if (isCurrentActivePlaying) {
                    onPauseItem?.();
                  } else {
                    onPlayItem?.(currentItem);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#f8ca14] px-4 py-2.5 text-xs font-black text-black shadow-lg transition hover:bg-[#ffe169] active:scale-95 shrink-0"
              >
                {isCurrentActivePlaying ? (
                  <>
                    <Pause size={14} className="fill-black" />
                    <span>إيقاف مؤقت</span>
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-black" />
                    <span>تشغيل الآن</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
