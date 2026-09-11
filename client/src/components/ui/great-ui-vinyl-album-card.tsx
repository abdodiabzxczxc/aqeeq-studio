"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Disc,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Heart,
  Share2,
  FileText,
  Sparkles,
  Video,
  Maximize2,
} from "lucide-react";

/* ========================================================================= */
/* 1. STANDALONE VINYL ALBUM CARD (Standard card for versatile placements)   */
/* ========================================================================= */

export interface VinylAlbumCardProps {
  coverUrl?: string | null;
  title: string;
  subtitle?: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  dark?: boolean;
  size?: "sm" | "md" | "lg";
  accentColor?: "gold" | "amber";
  className?: string;
}

export function VinylAlbumCard({
  coverUrl,
  title,
  subtitle,
  isPlaying = false,
  onTogglePlay,
  dark = true,
  size = "md",
  accentColor = "gold",
  className = "",
}: VinylAlbumCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const dimensions = {
    sm: {
      sleeve: "h-20 w-20 sm:h-24 sm:w-24",
      disc: "h-[72px] w-[72px] sm:h-[86px] sm:w-[86px]",
      label: "h-8 w-8 sm:h-9 sm:w-9",
      hole: "h-2 w-2",
      icon: 12,
      slideOffset: 48,
    },
    md: {
      sleeve: "h-28 w-28 sm:h-32 sm:w-32",
      disc: "h-[102px] w-[102px] sm:h-[116px] sm:w-[116px]",
      label: "h-11 w-11 sm:h-12 sm:w-12",
      hole: "h-2.5 w-2.5",
      icon: 16,
      slideOffset: 52,
    },
    lg: {
      sleeve: "h-36 w-36 sm:h-44 sm:w-44",
      disc: "h-[132px] w-[132px] sm:h-[162px] sm:w-[162px]",
      label: "h-14 w-14 sm:h-16 sm:w-16",
      hole: "h-3 w-3",
      icon: 18,
      slideOffset: 55,
    },
  }[size];

  const isEmerged = isPlaying || isHovered;
  const isAmber = accentColor === "amber";

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      onMouseEnter={() => {
        if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
          setIsHovered(false);
        }
      }}
      dir="ltr"
    >
      {/* Outer Atmospheric Glow */}
      <div
        className={`pointer-events-none absolute -inset-3 rounded-3xl transition-opacity duration-700 blur-xl ${
          isPlaying
            ? isAmber
              ? "bg-amber-400/25 opacity-100"
              : dark
              ? "bg-[#f8ca14]/25 opacity-100"
              : "bg-[#08467d]/20 opacity-100"
            : "opacity-0"
        }`}
      />

      {/* Main Sleeve and Disc Assembly */}
      <div className="relative flex items-center justify-center">
        {/* Disc */}
        <motion.div
          animate={{
            x: isEmerged ? `${dimensions.slideOffset}%` : "0%",
            rotate: isPlaying ? 360 : 0,
          }}
          transition={{
            x: { type: "spring", stiffness: 220, damping: 24 },
            rotate: isPlaying
              ? { repeat: Infinity, duration: 3.5, ease: "linear" }
              : { duration: 0.6, ease: "easeOut" },
          }}
          onClick={onTogglePlay}
          className={`absolute cursor-pointer rounded-full shadow-2xl z-10 will-change-transform ${dimensions.disc}`}
          style={{
            background:
              "radial-gradient(circle, #1a1a1c 0%, #0d0d0f 25%, #18181b 40%, #09090b 60%, #151518 80%, #060607 100%)",
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.8), inset 0 0 0 2px rgba(255,255,255,0.06), inset 0 0 0 8px rgba(0,0,0,0.9), inset 0 0 0 14px rgba(255,255,255,0.03), inset 0 0 0 22px rgba(0,0,0,0.8)",
          }}
          title={isPlaying ? "إيقاف مؤقت" : "تشغيل الأسطوانة"}
        >
          <div
            className="absolute inset-0 rounded-full opacity-60 pointer-events-none"
            style={{
              background:
                "conic-gradient(from 45deg at 50% 50%, rgba(255,255,255,0.12) 0deg, transparent 45deg, rgba(255,255,255,0.08) 90deg, transparent 135deg, rgba(255,255,255,0.12) 180deg, transparent 225deg, rgba(255,255,255,0.08) 270deg, transparent 315deg, rgba(255,255,255,0.12) 360deg)",
            }}
          />
          <div className="absolute inset-2.5 rounded-full border border-white/[0.04] pointer-events-none" />
          <div className="absolute inset-5 rounded-full border border-white/[0.03] pointer-events-none" />
          <div className="absolute inset-8 rounded-full border border-white/[0.04] pointer-events-none" />

          {/* Hub Label */}
          <div className="absolute inset-0 m-auto flex items-center justify-center">
            <div
              className={`relative overflow-hidden rounded-full border-2 shadow-inner ${dimensions.label} ${
                isAmber
                  ? "border-amber-400/90 bg-gradient-to-tr from-[#1f1604] via-amber-700 to-[#120d02]"
                  : dark
                  ? "border-[#f8ca14]/80 bg-gradient-to-tr from-[#121212] via-[#08467d] to-[#121212]"
                  : "border-[#f8ca14] bg-gradient-to-tr from-[#08467d] via-[#042442] to-[#08467d]"
              }`}
            >
              {coverUrl ? (
                <img loading="lazy" src={coverUrl} alt="" className="h-full w-full object-cover opacity-85" />
              ) : (
                <div
                  className={`h-full w-full flex items-center justify-center ${
                    isAmber ? "text-amber-400" : "text-[#f8ca14]"
                  }`}
                >
                  <Disc size={dimensions.icon} className="animate-pulse" />
                </div>
              )}
              <div
                className={`absolute inset-0 m-auto rounded-full border border-white/40 bg-[#050608] shadow-inner ${dimensions.hole}`}
              />
              <div
                className={`pointer-events-none absolute inset-0.5 rounded-full border ${
                  isAmber ? "border-amber-400/50" : "border-[#f8ca14]/50"
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* Sleeve */}
        <div
          onClick={onTogglePlay}
          className={`group/sleeve relative cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl border z-20 shadow-2xl transition-all duration-300 ${
            dimensions.sleeve
          } ${
            isPlaying
              ? isAmber
                ? "ring-2 ring-amber-400/80 shadow-[0_15px_35px_rgba(251,191,36,0.3)]"
                : "ring-2 ring-[#f8ca14]/80 shadow-[0_15px_35px_rgba(248,202,20,0.25)]"
              : isAmber
              ? dark
                ? "border-amber-400/25 bg-[#121008] shadow-[0_15px_30px_rgba(0,0,0,0.7)] hover:border-amber-400/60"
                : "border-amber-200 bg-white shadow-[0_12px_25px_rgba(251,191,36,0.12)] hover:border-amber-400/60"
              : dark
              ? "border-white/15 bg-[#12161f] shadow-[0_15px_30px_rgba(0,0,0,0.7)] hover:border-[#f8ca14]/50"
              : "border-black/15 bg-white shadow-[0_12px_25px_rgba(8,70,125,0.12)] hover:border-[#08467d]/50"
          }`}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover/sleeve:scale-105"
            />
          ) : (
            <div
              className={`h-full w-full flex flex-col items-center justify-center p-3 text-center ${
                isAmber
                  ? dark
                    ? "bg-gradient-to-tr from-[#161208] via-amber-950/40 to-[#0c0903] text-amber-200"
                    : "bg-gradient-to-tr from-[#fefbf2] via-amber-100 to-[#fffdf9] text-amber-900"
                  : dark
                  ? "bg-gradient-to-tr from-[#060c18] via-[#08467d]/40 to-[#04060c] text-white"
                  : "bg-gradient-to-tr from-[#eef4fb] via-[#d6e5f5] to-[#f7f9fd] text-[#08467d]"
              }`}
            >
              <div
                className={`mb-2 grid h-10 w-10 place-items-center rounded-2xl shadow-md border ${
                  isAmber
                    ? "bg-amber-500/20 text-amber-400 border-amber-400/40"
                    : "bg-[#08467d] text-[#f8ca14] border-[#f8ca14]/40"
                }`}
              >
                <Disc size={20} />
              </div>
              <span className="text-[10px] font-black line-clamp-1">{title}</span>
              {subtitle && (
                <span className="text-[8.5px] opacity-70 mt-0.5 line-clamp-1">{subtitle}</span>
              )}
            </div>
          )}

          <div className="pointer-events-none absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/50 via-white/10 to-transparent border-r border-white/5" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-black/70 to-transparent" />
          <div
            className="pointer-events-none absolute inset-0 opacity-20 group-hover/sleeve:opacity-30 transition-opacity duration-300"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 45%, transparent 60%)",
            }}
          />

          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isHovered || isPlaying
                ? "bg-black/30 backdrop-blur-[1px] opacity-100"
                : "opacity-0"
            }`}
          >
            <div
              className={`grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full shadow-2xl transition-transform duration-200 group-hover/sleeve:scale-110 ${
                isPlaying
                  ? isAmber
                    ? "bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                    : "bg-[#f8ca14] text-black shadow-[0_0_20px_rgba(248,202,20,0.6)]"
                  : isAmber
                  ? "bg-black/80 text-amber-400 border border-amber-400/60 backdrop-blur-md"
                  : "bg-black/80 text-[#f8ca14] border border-[#f8ca14]/60 backdrop-blur-md"
              }`}
            >
              {isPlaying ? (
                <Pause size={17} />
              ) : (
                <Play size={17} className="fill-current ml-0.5" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ========================================================================= */
/* 2. GRAND VINYL DECK (The Big Master Box itself becomes the Vinyl Jacket!)  */
/* ========================================================================= */

export interface GrandVinylDeckProps {
  // Track Metadata
  title: string;
  subtitle: string;
  subBadge?: string;
  headerBadge: string;
  durationLabel: string;
  coverUrl?: string | null;

  // Playback State
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // Actions
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
  onLike?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
  onLyrics?: () => void;

  // Flags & Badges
  likesCount?: number;
  isLiked?: boolean;
  hasLyrics?: boolean;

  // Theming
  dark?: boolean;
  accentColor?: "gold" | "amber";
  className?: string;
}

function formatAudioTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function GrandVinylDeck({
  title,
  subtitle,
  subBadge = "إذاعة العقيق الرسمية",
  headerBadge,
  durationLabel,
  coverUrl,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onTogglePlay,
  onSeek,
  onNext,
  onPrev,
  onToggleMute,
  onVolumeChange,
  onLike,
  onShare,
  onLyrics,
  likesCount = 0,
  isLiked = false,
  hasLyrics = false,
  dark = true,
  accentColor = "gold",
  className = "",
}: GrandVinylDeckProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isEmerged = isPlaying || isHovered;
  const isAmber = accentColor === "amber";

  // Responsive slide distance: subtle -30px on mobile so it stays within viewport, -170px on desktop
  const slideDistance = isMobile ? -30 : -170;

  return (
    <div
      className={`grand-vinyl-deck relative w-full flex items-center justify-center lg:justify-start select-none ${className}`}
      onMouseEnter={() => {
        if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
          setIsHovered(false);
        }
      }}
      dir="rtl"
    >
      {/* Outer Atmospheric Glow on Active Playback */}
      <div
        className={`pointer-events-none absolute -inset-4 rounded-[2.5rem] transition-opacity duration-700 blur-2xl ${
          isPlaying
            ? isAmber
              ? "bg-amber-400/20 opacity-100"
              : "bg-[#f8ca14]/20 opacity-100"
            : "opacity-0"
        }`}
      />

      {/* Assembly Frame that nests both the Sleeve and the Centered Sliding Disc */}
      <motion.div
        animate={{
          maxWidth: isMobile ? "100%" : (isEmerged ? 395 : 520),
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 26,
        }}
        className="relative w-full flex items-center justify-center lg:justify-start"
      >
        {/* =================================================================== */}
        {/* 1. GIANT 360px OBSIDIAN VINYL RECORD (Hidden behind, slides to LEFT)*/}
        {/* =================================================================== */}
        <motion.div
          animate={{
            // When resting: 0 (completely hidden directly behind the sleeve)
            // When emerged: slides to the left (revealing grooves & spinning label)
            x: isEmerged ? slideDistance : 0,
            opacity: isEmerged ? 1 : 0,
            scale: isEmerged ? 1 : 0.92,
            rotate: isPlaying ? 360 : 0,
          }}
          transition={{
            x: { type: "spring", stiffness: 200, damping: 24 },
            opacity: { duration: 0.28 },
            scale: { duration: 0.28 },
            rotate: isPlaying
              ? { repeat: Infinity, duration: 3.6, ease: "linear" }
              : { duration: 0.6, ease: "easeOut" },
          }}
          onClick={onTogglePlay}
          className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 cursor-pointer rounded-full shadow-2xl z-0 will-change-transform ${
            isMobile ? "h-[260px] w-[260px]" : "h-[310px] w-[310px] sm:h-[360px] sm:w-[360px]"
          }`}
          style={{
            // Authentic deep obsidian multi-tone grooved vinyl
            background:
              "radial-gradient(circle, #1a1a1c 0%, #0d0d0f 25%, #18181b 40%, #09090b 60%, #151518 80%, #060607 100%)",
            boxShadow:
              "0 15px 35px -5px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(255,255,255,0.06), inset 0 0 0 10px rgba(0,0,0,0.9), inset 0 0 0 18px rgba(255,255,255,0.03), inset 0 0 0 30px rgba(0,0,0,0.8)",
          }}
          title={isPlaying ? "إيقاف مؤقت" : "تشغيل الأسطوانة الملكية"}
        >
          {/* Dynamic Conic Light Reflection Highlights */}
          <div
            className="absolute inset-0 rounded-full opacity-65 pointer-events-none"
            style={{
              background:
                "conic-gradient(from 45deg at 50% 50%, rgba(255,255,255,0.15) 0deg, transparent 45deg, rgba(255,255,255,0.09) 90deg, transparent 135deg, rgba(255,255,255,0.15) 180deg, transparent 225deg, rgba(255,255,255,0.09) 270deg, transparent 315deg, rgba(255,255,255,0.15) 360deg)",
            }}
          />

          {/* Concentric Micro-Grooves Rings */}
          <div className="absolute inset-4 rounded-full border border-white/[0.04] pointer-events-none" />
          <div className="absolute inset-8 rounded-full border border-white/[0.03] pointer-events-none" />
          <div className="absolute inset-12 rounded-full border border-white/[0.04] pointer-events-none" />
          <div className="absolute inset-16 rounded-full border border-white/[0.03] pointer-events-none" />

          {/* Center Record Hub Label with Artwork & Spindle */}
          <div className="absolute inset-0 m-auto flex items-center justify-center">
            <div
              className={`relative overflow-hidden rounded-full border-2 shadow-2xl h-24 w-24 sm:h-28 sm:w-28 ${
                isAmber
                  ? "border-amber-400 bg-gradient-to-tr from-[#1f1604] via-amber-800 to-[#120d02]"
                  : dark
                  ? "border-[#f8ca14] bg-gradient-to-tr from-[#121212] via-[#08467d] to-[#121212]"
                  : "border-[#f8ca14] bg-gradient-to-tr from-[#08467d] via-[#042442] to-[#08467d]"
              }`}
            >
              {coverUrl ? (
                <img loading="lazy" src={coverUrl} alt="" className="h-full w-full object-cover opacity-90" />
              ) : (
                <div
                  className={`h-full w-full flex items-center justify-center ${
                    isAmber ? "text-amber-400" : "text-[#f8ca14]"
                  }`}
                >
                  <Disc size={26} className="animate-pulse" />
                </div>
              )}

              {/* Center Spindle Hole */}
              <div className="absolute inset-0 m-auto h-4 w-4 rounded-full border border-white/50 bg-[#050608] shadow-inner" />
              {/* Inner Gold Foil Ring */}
              <div
                className={`pointer-events-none absolute inset-1.5 rounded-full border ${
                  isAmber ? "border-amber-400/60" : "border-[#f8ca14]/60"
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* =================================================================== */}
        {/* 2. THE BIG BOX SLEEVE (Morphs dynamically between wide & square)   */}
        {/* =================================================================== */}
        <motion.div
          animate={{
            maxWidth: isMobile ? "100%" : (isEmerged ? 395 : 520),
          }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 26,
          }}
          className={`relative z-10 w-full h-[360px] sm:h-[395px] flex flex-col justify-between rounded-[2rem] border overflow-hidden shadow-2xl transition-colors duration-500 ${
            isPlaying
              ? isAmber
                ? "border-amber-400/80 shadow-[0_20px_50px_rgba(251,191,36,0.3)] ring-2 ring-amber-400/60"
                : "border-[#f8ca14]/80 shadow-[0_20px_50px_rgba(248,202,20,0.3)] ring-2 ring-[#f8ca14]/60"
              : isAmber
              ? "border-amber-400/30 hover:border-amber-400/60 shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
              : "border-white/15 hover:border-[#f8ca14]/50 shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
          }`}
        >
          {/* Full-Bleed Vinyl Album Cover Art Background */}
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center ${
                isAmber
                  ? "bg-gradient-to-tr from-[#161208] via-amber-950 to-[#0c0903]"
                  : "bg-gradient-to-tr from-[#060c18] via-[#08467d] to-[#04060c]"
              }`}
            >
              <Disc
                size={80}
                className={`opacity-20 animate-pulse ${
                  isAmber ? "text-amber-400" : "text-[#f8ca14]"
                }`}
              />
            </div>
          )}

          {/* Deep Cinematic Gradient Vignette (Gives typography & controls 100% contrast) */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/15" />

          {/* Cardboard Spine Crease on Right Edge (Arabic RTL outer edge) */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-3.5 bg-gradient-to-l from-black/70 via-white/10 to-transparent border-l border-white/10" />

          {/* Vinyl Slot Opening on Left Edge (Where the record emerges!) */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />

          {/* Diagonal Cardboard Gloss Sheen */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 45%, transparent 60%)",
            }}
          />

          {/* ----------------- Top Header Floating Bar ----------------- */}
          <div className="relative z-10 flex items-center justify-between w-full p-4">
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-black/50 backdrop-blur-md border border-white/15 text-[10.5px] font-black text-white shadow-md">
              <Sparkles
                size={12}
                className={isAmber ? "text-amber-400" : "text-[#f8ca14]"}
              />
              <span>{headerBadge}</span>
            </div>
            <div className="rounded-full px-2.5 py-1 bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300 shadow-md">
              {durationLabel}
            </div>
          </div>

          {/* ----------------- Center Space: Breathable Artwork ----------------- */}
          <div
            onClick={onTogglePlay}
            className="relative z-10 my-auto flex items-center justify-center cursor-pointer group/center"
          >
            {/* Elegant Floating Center Play Trigger on Hover */}
            <div
              className={`grid h-14 w-14 place-items-center rounded-full shadow-2xl backdrop-blur-md transition-all duration-300 ${
                isPlaying
                  ? "opacity-0 group-hover/center:opacity-90 bg-black/60 text-white border border-white/20 scale-95 hover:scale-105"
                  : "opacity-85 group-hover/center:opacity-100 scale-100 hover:scale-110 shadow-black/80 " +
                    (isAmber
                      ? "bg-amber-400/90 text-black border border-amber-300"
                      : "bg-[#f8ca14]/90 text-black border border-yellow-200")
              }`}
              title={isPlaying ? "إيقاف مؤقت" : "تشغيل الآن"}
            >
              {isPlaying ? (
                <Pause size={22} />
              ) : (
                <Play size={22} className="fill-current mr-0.5" />
              )}
            </div>
          </div>

          {/* ----------------- Bottom Section: Title & Master Glass Console ----------------- */}
          <div className="relative z-10 w-full p-3.5 pt-0 space-y-2.5 mt-auto">
            {/* Title, Host, & Live Frequency Bars */}
            <div className="space-y-1 text-right px-1">
              <div className="flex items-center justify-between gap-2">
                <h3
                  className="text-base font-black text-white line-clamp-1 drop-shadow-md"
                  title={title}
                >
                  {title}
                </h3>

                {/* Live Jumping Frequency Equalizer Bars */}
                {isPlaying && (
                  <div className="flex items-end gap-1 h-3.5 flex-shrink-0">
                    <span
                      className={`w-1 rounded-full animate-[bounce_0.6s_infinite] h-3 ${
                        isAmber ? "bg-amber-400" : "bg-[#f8ca14]"
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full animate-[bounce_0.8s_infinite] h-2 ${
                        isAmber ? "bg-amber-300" : "bg-[#f8ca14]/80"
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full animate-[bounce_0.5s_infinite] h-3.5 ${
                        isAmber ? "bg-amber-400" : "bg-[#f8ca14]"
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full animate-[bounce_0.9s_infinite] h-2.5 ${
                        isAmber ? "bg-amber-300" : "bg-[#f8ca14]/80"
                      }`}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`font-black ${
                    isAmber ? "text-amber-300" : "text-[#f8ca14]"
                  }`}
                >
                  {subtitle}
                </span>
                <span className="text-white/40 text-[10px]">•</span>
                <span className="text-slate-300 text-[10px] font-bold">{subBadge}</span>
              </div>
            </div>

            {/* Master Floating Glassmorphic Audio Console */}
            <div className="rounded-2xl border border-white/15 bg-black/65 backdrop-blur-xl p-2.5 space-y-2 shadow-2xl">
              {/* Time Scrubber */}
              <div dir="ltr" className="space-y-0.5">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 px-0.5">
                  <span>{formatAudioTime(currentTime)}</span>
                  <span>{formatAudioTime(duration)}</span>
                </div>
                <div className="relative h-2 flex items-center cursor-pointer group/bar">
                  <div className="h-1.5 w-full rounded-full overflow-hidden bg-white/20">
                    <div
                      className={`h-full rounded-full transition-all duration-75 ${
                        isAmber
                          ? "bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                          : "bg-gradient-to-r from-[#f8ca14] to-yellow-300 shadow-[0_0_8px_rgba(248,202,20,0.6)]"
                      }`}
                      style={{
                        width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime || 0}
                    onChange={(e) => onSeek(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between gap-1 pt-0.5" dir="rtl">
                {/* Left: Like & Share & Lyrics */}
                <div className="flex items-center gap-1">
                  {onLike && (
                    <button
                      type="button"
                      onClick={onLike}
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold border transition active:scale-95 ${
                        isLiked
                          ? "border-[#de191e]/50 bg-[#de191e]/20 text-rose-400"
                          : "border-white/10 bg-white/10 text-slate-200 hover:text-white hover:bg-white/15"
                      }`}
                      title="إعجاب"
                    >
                      <Heart
                        size={11}
                        className={isLiked ? "fill-[#de191e] text-[#de191e]" : "fill-white/20"}
                      />
                      <span>{likesCount}</span>
                    </button>
                  )}

                  {hasLyrics && onLyrics && (
                    <button
                      type="button"
                      onClick={onLyrics}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold border transition active:scale-95 border-amber-400/40 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25"
                      title="عرض كلمات النشيد"
                    >
                      <FileText size={11} />
                      <span className="hidden sm:inline">الكلمات</span>
                    </button>
                  )}

                  {onShare && (
                    <button
                      type="button"
                      onClick={onShare}
                      className="grid h-6 w-6 place-items-center rounded-lg border transition active:scale-95 border-white/10 bg-white/10 text-slate-200 hover:text-white hover:bg-white/15"
                      title="مشاركة"
                    >
                      <Share2 size={11} />
                    </button>
                  )}
                </div>

                {/* Center: Prev, Play/Pause, Next */}
                <div className="flex items-center gap-1.5" dir="ltr">
                  {onPrev && (
                    <button
                      type="button"
                      onClick={onPrev}
                      className="grid h-6 w-6 place-items-center rounded-lg text-slate-300 hover:text-white transition active:scale-90"
                      title="السابق / إعادة"
                    >
                      <SkipBack size={13} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onTogglePlay}
                    className={`grid h-8 w-8 place-items-center rounded-full shadow-lg transition active:scale-95 ${
                      isAmber
                        ? "bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-amber-400/40 hover:brightness-110"
                        : "bg-gradient-to-tr from-[#f8ca14] to-yellow-300 text-black shadow-[#f8ca14]/40 hover:brightness-110"
                    }`}
                    title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                  >
                    {isPlaying ? (
                      <Pause size={15} />
                    ) : (
                      <Play size={15} className="fill-current mr-0.5" />
                    )}
                  </button>

                  {onNext && (
                    <button
                      type="button"
                      onClick={onNext}
                      className="grid h-6 w-6 place-items-center rounded-lg text-slate-300 hover:text-white transition active:scale-90"
                      title="التالي"
                    >
                      <SkipForward size={13} />
                    </button>
                  )}
                </div>

                {/* Right: Mute / Volume */}
                <div className="flex items-center gap-1" dir="ltr">
                  <button
                    type="button"
                    onClick={onToggleMute}
                    className={`grid h-6 w-6 place-items-center rounded-lg transition ${
                      isMuted ? "text-[#de191e]" : "text-slate-300 hover:text-white"
                    }`}
                    title={isMuted ? "إلغاء الكتم" : "كتم الصوت"}
                  >
                    {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => onVolumeChange(Number(e.target.value))}
                    className={`w-9 sm:w-11 h-1 rounded-full cursor-pointer bg-white/20 ${
                      isAmber ? "accent-amber-400" : "accent-[#f8ca14]"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ========================================================================= */
/* 3. GRAND CINEMA DECK (Matching Master Deck for 4K Video Podcasts)         */
/* ========================================================================= */

export interface GrandCinemaDeckProps {
  title: string;
  subtitle: string;
  subBadge?: string;
  headerBadge?: string;
  durationLabel?: string;
  coverUrl?: string | null;

  // Video Playing state
  isInlinePlaying: boolean;
  onPlayInline: () => void;
  onCloseInline?: () => void;
  onFullscreen?: (e: React.MouseEvent) => void;

  // Actions
  onLike?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;

  // Likes & Flags
  likesCount?: number;
  isLiked?: boolean;

  // Video Element / Embed
  videoElement?: React.ReactNode;

  // Theming
  dark?: boolean;
  accentColor?: "blue" | "gold";
  className?: string;
}

export function GrandCinemaDeck({
  title,
  subtitle,
  subBadge = "فريق التقديم والإعلام المدرسي 🎬",
  headerBadge = "شاشة العرض المركزية 4K",
  durationLabel = "مرئي 4K",
  coverUrl,
  isInlinePlaying,
  onPlayInline,
  onCloseInline,
  onFullscreen,
  onLike,
  onShare,
  likesCount = 0,
  isLiked = false,
  videoElement,
  dark = true,
  accentColor = "blue",
  className = "",
}: GrandCinemaDeckProps) {
  return (
    <div
      className={`grand-cinema-deck relative w-full flex items-center justify-center lg:justify-start select-none ${className}`}
      dir="rtl"
    >
      {/* Outer Atmospheric Glow */}
      <div
        className={`pointer-events-none absolute -inset-4 rounded-[2.5rem] transition-opacity duration-700 blur-2xl ${
          isInlinePlaying
            ? "bg-[#08467d]/40 opacity-100"
            : "bg-[#08467d]/15 opacity-60"
        }`}
      />

      {/* The Master Cinema Deck Box */}
      <div
        className={`relative z-10 w-full h-[360px] sm:h-[395px] max-w-full flex flex-col justify-between rounded-[2rem] border overflow-hidden shadow-2xl transition-all duration-500 ${
          isInlinePlaying
            ? "border-[#08467d] ring-2 ring-[#08467d]/60 shadow-[0_20px_50px_rgba(8,70,125,0.4)]"
            : dark
            ? "border-white/15 hover:border-[#08467d]/60 shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
            : "border-slate-200 hover:border-[#08467d]/50 shadow-xl"
        }`}
      >
        {isInlinePlaying && videoElement ? (
          // Active Inline Video Playback
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            {videoElement}
            {onCloseInline && (
              <button
                type="button"
                onClick={onCloseInline}
                className="absolute top-3 left-3 z-30 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white hover:bg-black/90 transition border border-white/20"
                title="إغلاق الفيديو"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          // Resting / Preview Mode: Full Bleed Cover with Floating Glass Console
          <>
            {/* Full-Bleed Video Thumbnail */}
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-[#060c18] via-[#08467d]/50 to-[#04060c]">
                <Video size={64} className="opacity-30 text-[#f8ca14] animate-pulse" />
              </div>
            )}

            {/* Deep Cinematic Gradient Vignette */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

            {/* Diagonal Cinema Gloss Sheen */}
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 45%, transparent 60%)",
              }}
            />

            {/* ----------------- Top Header Floating Bar ----------------- */}
            <div className="relative z-10 flex items-center justify-between w-full p-4">
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-black/60 backdrop-blur-md border border-white/15 text-[10.5px] font-black text-white shadow-md">
                <Sparkles size={12} className="text-[#f8ca14]" />
                <span>{headerBadge}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-[#08467d]/80 backdrop-blur-md border border-white/20 text-[10px] font-black text-white shadow-md">
                <Video size={11} />
                <span>{durationLabel}</span>
              </div>
            </div>

            {/* ----------------- Center Space: Floating Play Trigger ----------------- */}
            <div
              onClick={onPlayInline}
              className="relative z-10 my-auto flex items-center justify-center cursor-pointer group/center"
            >
              <div
                className="grid h-16 w-16 place-items-center rounded-full shadow-2xl backdrop-blur-md transition-all duration-300 bg-[#08467d]/90 text-white border-2 border-white/30 group-hover/center:scale-110 hover:bg-[#08467d] shadow-[0_0_30px_rgba(8,70,125,0.7)]"
                title="مشاهدة الآن"
              >
                <Play size={26} className="fill-current mr-0.5" />
              </div>
            </div>

            {/* ----------------- Bottom Section: Title & Master Glass Console ----------------- */}
            <div className="relative z-10 w-full p-3.5 pt-0 space-y-2 mt-auto">
              {/* Title & Host Metadata */}
              <div className="space-y-0.5 text-right px-1">
                <h3
                  className="text-base font-black text-white line-clamp-1 drop-shadow-md"
                  title={title}
                >
                  {title}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-[#f8ca14] drop-shadow-sm line-clamp-1">
                    {subtitle}
                  </p>
                  <span className="text-[9.5px] font-black text-white/70 bg-white/10 rounded-md px-1.5 py-0.5 border border-white/10">
                    4K ULTRA HD
                  </span>
                </div>
              </div>

              {/* Docked Frosted-Glass Master Console Bar */}
              <div className="rounded-2xl border border-white/15 bg-black/65 backdrop-blur-xl p-2 px-3 shadow-2xl flex items-center justify-between gap-2">
                {/* Left: Like & Share */}
                <div className="flex items-center gap-1.5" dir="ltr">
                  {onLike && (
                    <button
                      type="button"
                      onClick={onLike}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10.5px] font-bold border transition active:scale-95 ${
                        isLiked
                          ? "border-[#de191e]/50 bg-[#de191e]/25 text-[#de191e]"
                          : "border-white/10 bg-white/10 text-slate-200 hover:text-white hover:bg-white/15"
                      }`}
                    >
                      <Heart
                        size={11}
                        className={isLiked ? "fill-[#de191e] text-[#de191e]" : "fill-white/20"}
                      />
                      <span>{likesCount}</span>
                    </button>
                  )}

                  {onShare && (
                    <button
                      type="button"
                      onClick={onShare}
                      className="grid h-7 w-7 place-items-center rounded-lg border transition active:scale-95 border-white/10 bg-white/10 text-slate-200 hover:text-white hover:bg-white/15"
                      title="مشاركة الفيديو"
                    >
                      <Share2 size={12} />
                    </button>
                  )}
                </div>

                {/* Center / Right: Watch / Fullscreen Button */}
                <div className="flex items-center gap-2">
                  {onFullscreen && (
                    <button
                      type="button"
                      onClick={onFullscreen}
                      className="grid h-7 w-7 place-items-center rounded-lg border transition active:scale-95 border-white/10 bg-white/10 text-slate-200 hover:text-white hover:bg-white/15"
                      title="ملء الشاشة"
                    >
                      <Maximize2 size={12} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onPlayInline}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#08467d] to-[#0d5ca3] hover:from-[#0a5291] hover:to-[#0f67b5] text-white px-3.5 py-1 text-xs font-black shadow-md shadow-[#08467d]/40 transition active:scale-95 border border-white/20"
                  >
                    <Play size={12} className="fill-current" />
                    <span>تشغيل العرض</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
