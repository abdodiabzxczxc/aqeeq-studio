"use client";

import React, { useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  Sparkles,
  Newspaper,
  Play,
  Calendar,
  Eye,
  Camera,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { getAqeeqShowcaseDisplaySource } from "@/lib/aqeeqShowcaseMedia";

export interface NewsPortalPostItem {
  id: number;
  title: string | null;
  fileName: string;
  mediaType: "image" | "video";
  sourceType?: "drive" | "manual" | "x" | "instagram" | "youtube";
  mediaUrl: string;
  thumbnailUrl: string | null;
  createdAt?: Date;
  viewCount?: number;
}

interface NewsScrollPortalBackdropProps {
  posts: NewsPortalPostItem[];
  dark?: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function NewsScrollPortalBackdrop({
  posts,
  dark = true,
  containerRef,
}: NewsScrollPortalBackdropProps) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Critically damped spring physics: mass: 0.1, stiffness: 100, damping: 30
  // Damping ratio > 1: ZERO bounce, ZERO oscillation, pure silky organic gliding inertia
  const smoothConfig = { stiffness: 100, damping: 30, mass: 0.1, restDelta: 0.001 };

  // Constant, ultra-subtle whisper opacity throughout scroll
  const opacity = dark ? 0.24 : 0.18;

  // 3D perspective tilt with critically damped inertia
  const rawRotateX = useTransform(scrollYProgress, [0, 0.5], [12, 2]);
  const rawRotateZ = useTransform(scrollYProgress, [0, 0.5], [-3, 0]);
  const rotateX = useSpring(rawRotateX, smoothConfig);
  const rotateZ = useSpring(rawRotateZ, smoothConfig);

  // High-speed column vertical parallax in opposite directions (matching Articles)
  const rawCol1Y = useTransform(scrollYProgress, [0, 1], [0, -190]);
  const rawCol2Y = useTransform(scrollYProgress, [0, 1], [0, 170]);
  const rawCol3Y = useTransform(scrollYProgress, [0, 1], [0, -210]);
  const col1Y = useSpring(rawCol1Y, smoothConfig);
  const col2Y = useSpring(rawCol2Y, smoothConfig);
  const col3Y = useSpring(rawCol3Y, smoothConfig);

  // Ensure at least 15 items by looping if necessary
  const displayPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    if (posts.length >= 15) return posts.slice(0, 15);
    const repeated: NewsPortalPostItem[] = [];
    while (repeated.length < 15) {
      repeated.push(...posts);
    }
    return repeated.slice(0, 15);
  }, [posts]);

  const col1 = useMemo(() => displayPosts.filter((_, idx) => idx % 3 === 0), [displayPosts]);
  const col2 = useMemo(() => displayPosts.filter((_, idx) => idx % 3 === 1), [displayPosts]);
  const col3 = useMemo(() => displayPosts.filter((_, idx) => idx % 3 === 2), [displayPosts]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden [perspective:1400px] [transform-style:preserve-3d]"
    >
      {/* Deep subtle sapphire aura (pure dark, zero yellow mud) */}
      <div
        className={`absolute -top-32 right-1/4 h-[580px] w-[580px] rounded-full blur-[140px] opacity-15 pointer-events-none ${
          dark ? "bg-[#08467d]" : "bg-[#08467d]/10"
        }`}
      />
      <div
        className={`absolute top-1/2 left-1/4 h-[500px] w-[500px] rounded-full blur-[140px] opacity-12 pointer-events-none ${
          dark ? "bg-[#005A36]" : "bg-emerald-500/10"
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

      {/* 3D Parallax Streams of News & Media */}
      <motion.div
        style={{
          opacity,
          rotateX,
          rotateZ,
        }}
        className="absolute -inset-x-8 -inset-y-20 grid grid-cols-3 gap-5 sm:gap-7 px-4"
      >
        {/* Stream 1: Moves Up */}
        <motion.div style={{ y: col1Y }} className="flex flex-col gap-6">
          {col1.map((item, idx) => {
            const imgSrc = getAqeeqShowcaseDisplaySource(item as any);
            const isVideo = item.mediaType === "video" || item.sourceType === "youtube";
            return (
              <div
                key={`news-col1-${item.id}-${idx}`}
                className={`group/card rounded-3xl border p-2.5 overflow-hidden shadow-2xl transition duration-500 ${
                  dark
                    ? "border-white/10 bg-[#080d16]/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
                    : "border-black/10 bg-white/90 shadow-slate-200"
                }`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-900">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center bg-slate-900 text-slate-500">
                      <Newspaper size={28} className="text-[#f8ca14]/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <span className="absolute top-2.5 right-2.5 rounded-full bg-black/60 border border-white/20 px-2.5 py-0.5 text-[9px] font-black text-amber-300 backdrop-blur-md">
                    {isVideo ? "تغطية مرئية" : "خبر موثق"}
                  </span>
                  {isVideo && (
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-[#f8ca14] text-black shadow-lg">
                        <Play size={14} className="ml-0.5 fill-current" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 text-right">
                  <span className="text-[9px] font-black text-emerald-400">منظومة الأخبار والعروض</span>
                  <h4 className={`text-xs sm:text-sm font-black line-clamp-1 mt-0.5 ${dark ? "text-white" : "text-slate-900"}`}>
                    {item.title || item.fileName.replace(/\.[^.]+$/, "")}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium flex items-center justify-end gap-1">
                    <span>مدارس العقيق الأهلية والدولية</span>
                    <Sparkles size={11} className="text-[#f8ca14] shrink-0" />
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Stream 2: Moves Down */}
        <motion.div style={{ y: col2Y }} className="flex flex-col gap-6 -mt-16">
          {col2.map((item, idx) => {
            const imgSrc = getAqeeqShowcaseDisplaySource(item as any);
            const isVideo = item.mediaType === "video" || item.sourceType === "youtube";
            return (
              <div
                key={`news-col2-${item.id}-${idx}`}
                className={`group/card rounded-3xl border p-2.5 overflow-hidden shadow-2xl transition duration-500 ${
                  dark
                    ? "border-white/10 bg-[#080d16]/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
                    : "border-black/10 bg-white/90 shadow-slate-200"
                }`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-900">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center bg-slate-900 text-slate-500">
                      <Newspaper size={28} className="text-cyan-400/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <span className="absolute top-2.5 right-2.5 rounded-full bg-[#08467d]/70 border border-white/20 px-2.5 py-0.5 text-[9px] font-black text-white backdrop-blur-md">
                    {isVideo ? "فيديو فعاليات" : "تغطية مصورة"}
                  </span>
                  {isVideo && (
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-cyan-400 text-black shadow-lg">
                        <Play size={14} className="ml-0.5 fill-current" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 text-right">
                  <span className="text-[9px] font-black text-[#f8ca14]">الأنشطة والفعاليات</span>
                  <h4 className={`text-xs sm:text-sm font-black line-clamp-1 mt-0.5 ${dark ? "text-white" : "text-slate-900"}`}>
                    {item.title || item.fileName.replace(/\.[^.]+$/, "")}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium flex items-center justify-end gap-1">
                    <span>صوت المدارس الميداني</span>
                    <Camera size={11} className="text-cyan-400 shrink-0" />
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Stream 3: Moves Up */}
        <motion.div style={{ y: col3Y }} className="flex flex-col gap-6">
          {col3.map((item, idx) => {
            const imgSrc = getAqeeqShowcaseDisplaySource(item as any);
            const isVideo = item.mediaType === "video" || item.sourceType === "youtube";
            return (
              <div
                key={`news-col3-${item.id}-${idx}`}
                className={`group/card rounded-3xl border p-2.5 overflow-hidden shadow-2xl transition duration-500 ${
                  dark
                    ? "border-white/10 bg-[#080d16]/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
                    : "border-black/10 bg-white/90 shadow-slate-200"
                }`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-900">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center bg-slate-900 text-slate-500">
                      <Newspaper size={28} className="text-emerald-400/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <span className="absolute top-2.5 right-2.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 px-2.5 py-0.5 text-[9px] font-black text-emerald-300 backdrop-blur-md">
                    {isVideo ? "تسجيل مرئي" : "إنجاز وبطولة"}
                  </span>
                  {isVideo && (
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-400 text-black shadow-lg">
                        <Play size={14} className="ml-0.5 fill-current" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 text-right">
                  <span className="text-[9px] font-black text-cyan-400">إنجازات الطلاب والمعلمين</span>
                  <h4 className={`text-xs sm:text-sm font-black line-clamp-1 mt-0.5 ${dark ? "text-white" : "text-slate-900"}`}>
                    {item.title || item.fileName.replace(/\.[^.]+$/, "")}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium flex items-center justify-end gap-1">
                    <span>توثيق حي ومستمر</span>
                    <Layers size={11} className="text-emerald-400 shrink-0" />
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Soft Bottom Edge Gradient */}
      <div
        className={`absolute inset-x-0 bottom-0 h-32 pointer-events-none z-10 ${
          dark
            ? "bg-gradient-to-t from-[#05080e] via-[#05080e]/85 to-transparent"
            : "bg-gradient-to-t from-slate-50 via-slate-50/85 to-transparent"
        }`}
      />
    </div>
  );
}
