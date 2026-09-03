import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpLeft, Play } from "lucide-react";
import { useLocation } from "wouter";

export interface HeroShowcaseItem {
  id: string | number;
  title: string;
  coverUrl: string | null;
  badge: string;
  dateOrMeta?: string;
  href: string;
  excerpt?: string;
  ctaText?: string;
  ctaIcon?: React.ReactNode;
  onCtaClick?: () => void;
  extraBadge?: React.ReactNode;
}

export interface StackShowcaseItem {
  id: string | number;
  title: string;
  coverUrl: string | null;
  badge: string;
  dateOrMeta?: string;
  href: string;
  onClick?: () => void;
  playIcon?: boolean;
}

interface AqeeqPageHeroShowcaseProps {
  dark: boolean;
  hero: HeroShowcaseItem;
  stack: StackShowcaseItem[];
  viewAllText?: string;
  onViewAllClick?: () => void;
}

export function AqeeqPageHeroShowcase({
  dark,
  hero,
  stack,
  viewAllText,
  onViewAllClick,
}: AqeeqPageHeroShowcaseProps) {
  const [, navigate] = useLocation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch mb-12 sm:mb-16">
      {/* 🌟 1. RIGHT: THE CINEMATIC HERO SHOWCASE STAGE (7 COLS) */}
      <div className="lg:col-span-7 flex flex-col">
        <div
          onClick={() => {
            if (hero.onCtaClick) {
              hero.onCtaClick();
            } else {
              navigate(hero.href);
            }
          }}
          className={`group relative flex-1 min-h-[380px] sm:min-h-[480px] rounded-[2.5rem] border overflow-hidden cursor-pointer shadow-2xl transition-all duration-500 hover:shadow-3xl flex flex-col justify-end p-6 sm:p-10 ${
            dark
              ? "bg-[#0b1016] border-white/15 shadow-black/80 hover:border-[#f8ca14]/50"
              : "bg-white border-slate-200 shadow-xl hover:border-[#08467d]/40"
          }`}
        >
          {/* Background Hero Image with Ken Burns Zoom */}
          <img
            src={hero.coverUrl || "/alaqeeq-hero-light.png"}
            alt={hero.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-108 transition-transform duration-1000 ease-out"
          />

          {/* Gradient Depth Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent z-10" />

          {/* Top Floating Badge Bar */}
          <div className="absolute top-6 inset-x-6 sm:inset-x-10 z-20 flex items-center justify-between">
            <span className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black backdrop-blur-md border ${
              dark 
                ? "bg-black/60 border-white/20 text-[#f8ca14]" 
                : "bg-white/80 border-black/10 text-[#08467d]"
            }`}>
              <span>{hero.badge}</span>
            </span>

            {hero.dateOrMeta && (
              <span className="text-[11px] font-mono text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                {hero.dateOrMeta}
              </span>
            )}
          </div>

          {/* Extra Badge (like Soundwave Spectrum) */}
          {hero.extraBadge && (
            <div className="absolute top-20 right-6 sm:right-10 z-20">
              {hero.extraBadge}
            </div>
          )}

          {/* Hero Content */}
          <div className="relative z-20 text-white">
            <h3 className="text-2xl sm:text-4xl font-black font-cairo leading-tight mb-3 group-hover:text-[#f8ca14] transition-colors drop-shadow-lg">
              {hero.title}
            </h3>
            {hero.excerpt && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mb-6 line-clamp-2 leading-relaxed">
                {hero.excerpt}
              </p>
            )}

            <div className="flex items-center gap-4">
              <button
                type="button"
                className={`font-black px-7 py-3 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm shadow-xl transition-all duration-300 group-hover:scale-105 active:scale-95 ${
                  dark
                    ? "bg-[#f8ca14] text-black hover:bg-[#e6b90f]"
                    : "bg-[#08467d] text-white hover:bg-[#063863]"
                }`}
              >
                {hero.ctaIcon}
                <span>{hero.ctaText || "استعراض العمل بالكامل"}</span>
                <ArrowUpLeft size={16} className="transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
              </button>

              <span className="text-xs text-slate-400 font-bold hidden sm:inline-block">
                اضغط للمعاينة المباشرة
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 📚 2. LEFT: THE INTERACTIVE GLASS COLLECTION DECK (5 COLS) */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
        {stack.length > 0 ? (
          stack.map((item, idx) => (
            <motion.div
              key={item.id}
              whileHover={{ x: -8, scale: 1.015 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else {
                  navigate(item.href);
                }
              }}
              className={`group cursor-pointer rounded-[1.8rem] border p-4 sm:p-5 flex items-center gap-4 transition-all duration-300 shadow-md ${
                dark
                  ? "bg-[#0d141d]/75 border-white/10 hover:border-[#f8ca14]/40 hover:bg-[#121c27]"
                  : "bg-white/90 border-slate-200 hover:border-[#08467d]/40 hover:bg-slate-50"
              }`}
            >
              {/* Numeric Index Badge */}
              <div className={`w-8 h-8 rounded-xl font-mono text-xs font-black flex items-center justify-center shrink-0 border ${
                dark 
                  ? "bg-white/5 border-white/10 text-slate-400 group-hover:text-[#f8ca14] group-hover:border-[#f8ca14]/40" 
                  : "bg-slate-100 border-black/10 text-slate-600 group-hover:text-[#08467d]"
              }`}>
                0{idx + 2}
              </div>

              {/* Thumbnail Preview */}
              <div className="relative h-20 w-24 sm:h-22 sm:w-28 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-md">
                <img
                  src={item.coverUrl || "/alaqeeq-hero-light.png"}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors" />
                {item.playIcon && (
                  <div className="absolute inset-0 m-auto h-7 w-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white">
                    <Play size={12} className="fill-current" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-right">
                <span className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${
                  dark ? "text-[#f8ca14]" : "text-[#08467d]"
                }`}>
                  {item.badge}
                </span>
                <h4 className={`text-xs sm:text-sm font-black truncate leading-snug font-cairo group-hover:text-[#f8ca14] transition-colors ${
                  dark ? "text-white" : "text-black"
                }`}>
                  {item.title}
                </h4>
                {item.dateOrMeta && (
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    {item.dateOrMeta}
                  </p>
                )}
              </div>

              {/* Action Arrow */}
              <div className={`grid h-8 w-8 place-items-center rounded-xl border shrink-0 transition-transform group-hover:-translate-x-1 ${
                dark ? "border-white/10 bg-white/5 text-white" : "border-black/10 bg-slate-100 text-slate-700"
              }`}>
                <ArrowLeft size={14} />
              </div>
            </motion.div>
          ))
        ) : null}

        {/* View All Bar at bottom of deck (if provided) */}
        {viewAllText && (
          <button
            type="button"
            onClick={onViewAllClick}
            className={`w-full py-3.5 rounded-2xl border font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
              dark
                ? "border-white/15 bg-white/5 hover:bg-white/10 text-white hover:border-[#f8ca14]/50"
                : "border-slate-200 bg-white hover:bg-slate-100 text-slate-800"
            }`}
          >
            <span>{viewAllText}</span>
            <ArrowUpLeft size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
