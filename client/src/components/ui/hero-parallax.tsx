"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  MotionValue,
} from "framer-motion";
import { Camera, ArrowUpLeft, Sparkles, Tv, Layers, Settings2, ImageIcon } from "lucide-react";
import { Link } from "wouter";

export interface ParallaxProduct {
  title: string;
  link: string;
  thumbnail: string;
  category?: string;
  mediaCount?: number;
  date?: string;
}

export interface HeroParallaxProps {
  products: ParallaxProduct[];
  header?: React.ReactNode;
  headerTitle?: React.ReactNode;
  headerDescription?: React.ReactNode;
  kickerText?: string;
  onTvModeClick?: () => void;
  onWrappedClick?: () => void;
  onManageClick?: () => void;
  isAdmin?: boolean;
  albumsCount?: number;
  dark?: boolean;
  direction?: "left-to-right" | "right-to-left";
  cardShape?: "default" | "square";
  rowCount?: 2 | 3;
}

export const HeroParallax = ({
  products,
  header,
  headerTitle,
  headerDescription,
  kickerText = "ALAQEEQ ALBUMS & MEMORIES · الأرشيف المرئي",
  onTvModeClick,
  onWrappedClick,
  onManageClick,
  isAdmin,
  albumsCount,
  dark = true,
  direction = "left-to-right",
  cardShape = "default",
  rowCount = 3,
}: HeroParallaxProps) => {
  const isRightToLeft = direction === "right-to-left";

  // Ensure we have at least 16 items by looping if necessary
  const displayProducts = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    if (products.length >= 16) return products.slice(0, 16);
    const repeated: ParallaxProduct[] = [];
    while (repeated.length < 16) {
      repeated.push(...products);
    }
    return repeated.slice(0, 16);
  }, [products]);

  const firstRow = rowCount === 2 ? displayProducts.slice(0, 8) : displayProducts.slice(0, 5);
  const secondRow = rowCount === 2 ? displayProducts.slice(8, 16) : displayProducts.slice(5, 10);
  const thirdRow = rowCount === 2 ? [] : displayProducts.slice(10, 15);

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Responsive desktop detection for optimal 3D perspective
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const scrollEnd = 1;
  const rawTranslateX = useTransform(scrollYProgress, [0, scrollEnd], [0, isDesktop ? (rowCount === 2 ? 480 : 620) : 220]);
  const rawTranslateXReverse = useTransform(scrollYProgress, [0, scrollEnd], [0, isDesktop ? (rowCount === 2 ? -480 : -620) : -220]);
  const rawRotateX = useTransform(scrollYProgress, [0, 0.75], [isDesktop ? 12 : 5, 0]);
  const rawRotateZ = useTransform(
    scrollYProgress,
    [0, 0.75],
    [isDesktop ? (isRightToLeft ? -12 : 12) : (isRightToLeft ? -3 : 3), 0]
  );
  const rawTranslateY = useTransform(
    scrollYProgress,
    [0, 0.75],
    [isDesktop ? (rowCount === 2 ? -120 : -180) : -60, isDesktop ? (rowCount === 2 ? 60 : 100) : 30]
  );

  // Cards are 100% visible on mount, gracefully fading at the very exit of the hero
  const scrollExitOpacity = useTransform(scrollYProgress, [0, 0.75, 0.95], [1, 1, 0]);

  // 1:1 direct scroll binding — ZERO spring rubberband stretch, ZERO sudden snap
  const translateX = rawTranslateX;
  const translateXReverse = rawTranslateXReverse;
  const rotateX = rawRotateX;
  const rotateZ = rawRotateZ;
  const translateY = rawTranslateY;

  return (
    <div
      ref={ref}
      className={`relative flex flex-col self-auto overflow-hidden antialiased transition-colors duration-500 pb-16 [perspective:1200px] [transform-style:preserve-3d] ${
        dark ? "bg-[#05080e] text-white" : "bg-slate-50/70 text-slate-900"
      }`}
      style={{
        minHeight: isDesktop
          ? rowCount === 2
            ? "104vh"
            : cardShape === "square"
            ? "148vh"
            : "210vh"
          : rowCount === 2
          ? "94vh"
          : cardShape === "square"
          ? "120vh"
          : "160vh",
      }}
    >
      {/* Ambient background glow & radial highlights (pure dark, no yellow) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className={`absolute -top-32 left-1/2 -translate-x-1/2 h-[550px] w-[min(1100px,100vw)] rounded-full blur-[140px] opacity-15 pointer-events-none ${
            dark
              ? "bg-gradient-to-b from-[#08467d] to-transparent"
              : "bg-gradient-to-b from-blue-200 to-transparent opacity-30"
          }`}
        />
      </div>

      {/* Hero Header with Apple-grade smooth entrance bloom */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 mx-auto w-full max-w-[1380px] px-4 sm:px-6 md:px-8 pt-6 sm:pt-10 pb-4 text-right"
      >
        {header ? (
          header
        ) : (
          <HeroParallaxHeader
            title={headerTitle}
            description={headerDescription}
            kickerText={kickerText}
            onTvModeClick={onTvModeClick}
            onWrappedClick={onWrappedClick}
            onManageClick={onManageClick}
            isAdmin={isAdmin}
            albumsCount={albumsCount}
            dark={dark}
          />
        )}
      </motion.div>

      {/* 3D Moving Perspective Rows with cinematic entrance bloom */}
      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 will-change-transform"
      >
        <motion.div
          style={{
            rotateX,
            rotateZ,
            translateY,
            opacity: scrollExitOpacity,
          }}
          className="will-change-transform"
        >
          {/* Row 1: moves to the right (or left if RTL) */}
          <div className="flex flex-row-reverse space-x-reverse space-x-6 sm:space-x-8 mb-6 sm:mb-8">
            {firstRow.map((product, idx) => (
              <ProductCard
                product={product}
                translate={isRightToLeft ? translateXReverse : translateX}
                key={product.title + "-r1-" + idx}
                dark={dark}
                cardShape={cardShape}
                priority={idx < 3}
              />
            ))}
          </div>

          {/* Row 2: moves to the left (or right if RTL) */}
          <div className="flex flex-row mb-6 sm:mb-8 space-x-6 sm:space-x-8">
            {secondRow.map((product, idx) => (
              <ProductCard
                product={product}
                translate={isRightToLeft ? translateX : translateXReverse}
                key={product.title + "-r2-" + idx}
                dark={dark}
                cardShape={cardShape}
                priority={idx < 2}
              />
            ))}
          </div>

          {/* Row 3: moves to the right (or left if RTL) - only when rowCount is 3 */}
          {rowCount === 3 && (
            <div className="flex flex-row-reverse space-x-reverse space-x-6 sm:space-x-8">
              {thirdRow.map((product, idx) => (
                <ProductCard
                  product={product}
                  translate={isRightToLeft ? translateXReverse : translateX}
                  key={product.title + "-r3-" + idx}
                  dark={dark}
                  cardShape={cardShape}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Bottom fade shadow for seamless connection to next section */}
      <div
        className={`pointer-events-none absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t ${
          dark
            ? "from-[#05080e] via-[#05080e]/85 to-transparent"
            : "from-slate-50 via-slate-50/85 to-transparent"
        } z-20`}
      />
    </div>
  );
};

export const HeroParallaxHeader = ({
  title,
  description,
  kickerText,
  onTvModeClick,
  onWrappedClick,
  onManageClick,
  isAdmin,
  albumsCount,
  dark,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  kickerText?: string;
  onTvModeClick?: () => void;
  onWrappedClick?: () => void;
  onManageClick?: () => void;
  isAdmin?: boolean;
  albumsCount?: number;
  dark?: boolean;
}) => {
  return (
    <div className="relative z-20 mx-auto w-full max-w-[1380px] px-5 sm:px-8 pt-10 pb-6 md:pt-16 md:pb-12 text-right">
      {/* Kicker badge */}
      <div className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-black shadow-sm backdrop-blur-md mb-4 border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]">
        <Sparkles size={13} className="animate-spin text-[#f8ca14]" style={{ animationDuration: "6s" }} />
        <span>{kickerText}</span>
      </div>

      {/* Main Title */}
      {title ? (
        title
      ) : (
        <h1
          className={`text-3xl sm:text-5xl md:text-7xl font-black leading-[1.15] tracking-tight ${
            dark ? "text-white" : "text-slate-900"
          }`}
        >
          ألبومات ومعارض العقيق <br />
          <span className="bg-gradient-to-r from-[#f8ca14] via-amber-400 to-[#de191e] bg-clip-text text-transparent">
            توثيق ينبض بالحياة والإنجاز.
          </span>
        </h1>
      )}

      {/* Subtitle / Description */}
      {description ? (
        description
      ) : (
        <p
          className={`mt-5 max-w-3xl text-sm sm:text-base md:text-lg leading-relaxed font-medium ${
            dark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          سجل فوتوغرافي ومرئي ثلاثي الأبعاد يروي قصص التفوق، وبطولات الروبوت والذكاء الاصطناعي، واحتفالات اليوم الوطني، ومسيرة أجيال مدارس العقيق عبر أكثر من 30 عاماً من الريادة.
        </p>
      )}

      {/* Live Stats Pills */}
      {albumsCount !== undefined && (
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black">
          <span
            className={`rounded-full border px-3.5 py-1.5 flex items-center gap-1.5 backdrop-blur-md ${
              dark
                ? "border-white/10 bg-white/5 text-slate-300"
                : "border-black/10 bg-slate-100 text-slate-700"
            }`}
          >
            <ImageIcon size={13} className="text-[#f8ca14]" />
            <span>{albumsCount} ألبوم موثق</span>
          </span>
          <span
            className={`rounded-full border px-3.5 py-1.5 flex items-center gap-1.5 backdrop-blur-md ${
              dark
                ? "border-white/10 bg-white/5 text-slate-300"
                : "border-black/10 bg-slate-100 text-slate-700"
            }`}
          >
            <Camera size={13} className="text-[#f8ca14]" />
            <span>أرشيف مرئي ثلاثي الأبعاد</span>
          </span>
        </div>
      )}

      {/* Quick Interactive Actions */}
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a
          href="#albums-grid-section"
          className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-black shadow-lg transition active:scale-95 ${
            dark
              ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black shadow-[#f8ca14]/20 hover:opacity-95"
              : "bg-gradient-to-r from-[#08467d] to-[#052c52] text-white shadow-[#08467d]/25 hover:opacity-95"
          }`}
        >
          <Layers size={15} />
          <span>تصفح كافة الألبومات ✦</span>
        </a>

        {onWrappedClick && (
          <button
            type="button"
            onClick={onWrappedClick}
            className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-xs font-black shadow-lg transition active:scale-95 hover:scale-105 ${
              dark
                ? "border-amber-400/50 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent text-amber-300 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(248,202,20,0.3)] ring-1 ring-amber-400/20"
                : "border-amber-500/40 bg-gradient-to-r from-amber-100 via-amber-50 to-white text-amber-950 hover:border-amber-500 shadow-md"
            }`}
          >
            <Sparkles size={15} className="animate-pulse text-amber-400" />
            <span>حصاد العقيق الذكي 🎬</span>
            <span className="rounded-md bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-slate-950">
              AI VIDEO
            </span>
          </button>
        )}

        {onTvModeClick && (
          <button
            type="button"
            onClick={onTvModeClick}
            className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-xs font-black transition active:scale-95 ${
              dark
                ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                : "border-black/10 bg-black/5 text-slate-800 hover:bg-black/10"
            }`}
          >
            <Tv size={15} className="text-[#f8ca14]" />
            <span>عرض الشاشة الكبرى (TV Mode)</span>
          </button>
        )}

        {isAdmin && onManageClick && (
          <button
            type="button"
            onClick={onManageClick}
            className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-xs font-black transition active:scale-95 ${
              dark
                ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
            }`}
          >
            <Settings2 size={15} />
            <span>إدارة ألبومات المدارس</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
  dark,
  cardShape = "default",
  priority = false,
}: {
  product: ParallaxProduct;
  translate: MotionValue<number>;
  dark?: boolean;
  cardShape?: "default" | "square";
  priority?: boolean;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -14,
        scale: 1.02,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      key={product.title}
      className={`group/product relative ${
        cardShape === "square"
          ? "h-[250px] w-[250px] sm:h-[300px] sm:w-[300px] md:h-[350px] md:w-[350px] aspect-square"
          : "h-[280px] sm:h-[340px] md:h-[380px] w-[290px] sm:w-[380px] md:w-[440px]"
      } flex-shrink-0 rounded-3xl overflow-hidden shadow-2xl will-change-transform cursor-pointer`}
    >
      <Link href={product.link} className="block h-full w-full">
        {/* Background Album Photo with smooth zoom on hover */}
        <img
          src={product.thumbnail}
          alt={product.title}
          loading={priority ? "eager" : "lazy"}
          {...(priority ? { fetchPriority: "high" } : {})}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover/product:scale-108"
        />

        {/* Ambient Top & Bottom Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10 transition-opacity duration-300 group-hover/product:from-black/90" />

        {/* Top Badges: Category & Media Count */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
          {product.category ? (
            <span className="rounded-xl bg-black/60 border border-white/15 px-2.5 py-1 text-[10px] font-black text-amber-300 backdrop-blur-md shadow-md">
              {product.category}
            </span>
          ) : (
            <span className="rounded-xl bg-[#08467d]/70 border border-white/15 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur-md shadow-md flex items-center gap-1">
              <Camera size={11} className="text-[#f8ca14]" />
              <span>ألبوم العقيق</span>
            </span>
          )}

          {product.mediaCount ? (
            <span className="rounded-xl bg-black/60 border border-white/15 px-2.5 py-1 text-[10px] font-black text-slate-200 backdrop-blur-md shadow-md flex items-center gap-1">
              <Camera size={12} className="text-[#f8ca14]" />
              <span>{product.mediaCount} لقطة</span>
            </span>
          ) : null}
        </div>

        {/* Bottom Card Information */}
        <div className="absolute bottom-4 inset-x-4 z-10 text-right">
          {product.date && (
            <p className="text-[10px] font-bold text-amber-300/90 mb-1 flex items-center gap-1 justify-end">
              <span>{product.date}</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#f8ca14]" />
            </p>
          )}

          <h3 className="text-base sm:text-lg font-black text-white leading-snug drop-shadow-md line-clamp-2 transition-colors duration-300 group-hover/product:text-[#f8ca14]">
            {product.title}
          </h3>

          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/15 text-[11px] font-black text-slate-300 opacity-90 group-hover/product:opacity-100">
            <span className="text-amber-400 flex items-center gap-1">
              <span>افتح الألبوم</span>
              <ArrowUpLeft size={13} className="transition-transform group-hover/product:-translate-x-1 group-hover/product:-translate-y-0.5" />
            </span>
            <span className="text-[10px] text-slate-400">مدارس العقيق الأهلية والدولية</span>
          </div>
        </div>

        {/* Hover Luxury Border Accent */}
        <div className="absolute inset-0 rounded-3xl border-2 border-white/10 group-hover/product:border-[#f8ca14]/60 transition-colors duration-300 pointer-events-none" />
      </Link>
    </motion.div>
  );
};
