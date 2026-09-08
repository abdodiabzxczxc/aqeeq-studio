import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { Sparkles, BookOpen, ImageIcon, ArrowUpLeft, ChevronLeft, ChevronRight, Film } from "lucide-react";
import { useLocation } from "wouter";
import { VisualEditable } from "./VisualEditor";

interface ShowcaseItem {
  id: string | number;
  title: string;
  category: "journal" | "album" | "offer";
  badge: string;
  imageUrl: string | null;
  href: string;
  metaText?: string;
}

interface AqeeqHorizontalScrubSectionProps {
  items: ShowcaseItem[];
}

export function AqeeqHorizontalScrubSection({ items }: AqeeqHorizontalScrubSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [, navigate] = useLocation();

  const [maxScrollDistance, setMaxScrollDistance] = useState(1200);

  // Measure physical scroll track width accurately
  useEffect(() => {
    const updateDistance = () => {
      if (trackRef.current) {
        const trackWidth = trackRef.current.scrollWidth;
        const windowWidth = window.innerWidth;
        const dist = Math.max(400, trackWidth - windowWidth + 160);
        setMaxScrollDistance(dist);
      }
    };
    updateDistance();
    window.addEventListener("resize", updateDistance);
    return () => window.removeEventListener("resize", updateDistance);
  }, [items]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const rawX = useTransform(scrollYProgress, [0.02, 0.98], [0, maxScrollDistance]);
  const smoothConfig = { stiffness: 100, damping: 30, mass: 0.1, restDelta: 0.001 };
  const smoothX = useSpring(rawX, smoothConfig);

  // Progress percentage (0 to 100)
  const progressPercent = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Calculate active scene index from scroll
  const [activeScene, setActiveScene] = useState(1);
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      const idx = Math.min(items.length, Math.max(1, Math.round(latest * (items.length - 1)) + 1));
      setActiveScene(idx);
    });
  }, [scrollYProgress, items.length]);

  if (!items || items.length === 0) {
    return <div ref={containerRef} className="hidden" aria-hidden="true" />;
  }

  return (
    <section
      ref={containerRef}
      className={`relative h-[250vh] w-full transition-colors duration-500 overflow-visible ${
        isNationalDay
          ? dark ? "bg-[#010905]" : "bg-[#f5fbf7]"
          : dark ? "bg-[#05070a]" : "bg-[#f8fafc]"
      }`}
    >
      {/* Sticky Fullscreen Cinema Stage */}
      <div className="sticky top-0 flex h-screen w-full flex-col justify-between overflow-hidden pb-4 sm:pb-8 pt-16 sm:pt-20">
        {/* Cinema Stage Header */}
        <div className="mx-auto w-full max-w-[1380px] 2xl:max-w-[1560px] px-4 sm:px-6 md:px-8 z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 shrink-0">
          <div className="text-right">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[10px] font-black tracking-widest uppercase mb-1.5 ${
                isNationalDay
                  ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              }`}
            >
              <Film size={12} />
              <span>CINEMATIC MEDIA REEL · أروقة العقيق الإعلامية</span>
            </div>
            <VisualEditable
              id="studio-scrub-title"
              tag="text"
              label="عنوان أروقة العقيق الإعلامية"
              defaultText="أروقة العقيق الإعلامية"
              as="h2"
              className={`text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-black font-cairo leading-tight ${dark ? "text-white" : "text-black"}`}
            />
            {/* Glowing Golden Accent Line (يتمدد مع السكرول وينكمش عند الخروج) */}
            <motion.div
              initial={{ width: 0, opacity: 0.3 }}
              whileInView={{ width: 175, opacity: 1 }}
              viewport={{ once: false, margin: "-20px" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className={`h-1 sm:h-[3px] rounded-full my-2 sm:my-3 ${
                dark
                  ? "bg-gradient-to-l from-[#f8ca14] via-[#f8ca14]/80 to-transparent shadow-[0_0_15px_rgba(248,202,20,0.6)]"
                  : "bg-gradient-to-l from-[#08467d] via-[#08467d]/80 to-transparent shadow-[0_0_12px_rgba(8,70,125,0.4)]"
              }`}
            />
            <VisualEditable
              id="studio-scrub-desc"
              tag="text"
              label="وصف أروقة العقيق الإعلامية"
              defaultText="اسحب أو مرر بالماوس لاستكشاف أحدث أعداد المجلة المدرسية والتوثيقات المصورة للفعاليات الكبرى."
              as="p"
              className={`mt-1 text-xs sm:text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}
            />
          </div>

          {/* Reel Controls & Scene Counter */}
          <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto shrink-0">
            {/* Active Scene Badge */}
            <div className={`flex items-center gap-2 rounded-2xl border px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-mono font-black ${
              dark ? "border-white/10 bg-white/5 text-amber-400" : "border-black/10 bg-slate-100 text-[#08467d]"
            }`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>المشهد {String(activeScene).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
            </div>

            {/* Hint Badge */}
            <div className={`hidden md:flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-[11px] font-bold ${
              dark ? "border-white/10 bg-white/5 text-slate-400" : "border-black/10 bg-slate-100 text-slate-600"
            }`}>
              <span>سكرول عمودي للتنقل الأفقي</span>
              <span className="text-amber-400">✦</span>
            </div>
          </div>
        </div>

        {/* 3D Cinema Curved Track Container */}
        <div
          className="relative w-full overflow-visible my-auto py-2"
          style={{ perspective: "1400px" }}
        >
          <motion.div
            ref={trackRef}
            style={{ x: smoothX, transformStyle: "preserve-3d" }}
            className="flex items-center gap-5 sm:gap-8 px-6 sm:px-12 w-max will-change-transform"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id + "-" + index}
                role="button"
                tabIndex={0}
                onClick={() => navigate(item.href)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate(item.href)}
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`group relative h-[clamp(280px,46vh,480px)] w-[clamp(200px,32vh,360px)] shrink-0 cursor-pointer overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border transition-all duration-500 shadow-2xl ${
                  isNationalDay
                    ? dark
                      ? "border-[#f8ca14]/30 bg-[#001f13] shadow-[0_25px_60px_rgba(0,90,54,0.4)]"
                      : "border-emerald-500/20 bg-white shadow-[0_25px_60px_rgba(0,90,54,0.15)]"
                    : dark
                    ? "border-white/15 bg-gradient-to-b from-[#11131c] via-[#090b10] to-[#040508] shadow-[0_30px_70px_rgba(0,0,0,0.85)] hover:border-[#f8ca14]/50"
                    : "border-slate-200 bg-white shadow-[0_25px_60px_rgba(8,70,125,0.1)] hover:border-[#08467d]/50"
                }`}
              >
                {/* Full Cover Visual */}
                <div className="relative h-full w-full overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-tr from-slate-900 via-[#08467d]/40 to-slate-900 text-slate-400">
                      {item.category === "journal" ? <BookOpen size={52} /> : <ImageIcon size={52} />}
                    </div>
                  )}

                  {/* Dark Cinematic Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

                  {/* Top Film Reel Badge */}
                  <div className="absolute top-4 inset-x-4 sm:top-5 sm:inset-x-5 z-10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 rounded-full bg-black/70 border border-white/20 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[10px] sm:text-[11px] font-black text-[#f8ca14] backdrop-blur-md shadow-md">
                      {item.category === "journal" ? <BookOpen size={12} /> : <ImageIcon size={12} />}
                      <span>{item.badge}</span>
                    </div>
                    <span className="rounded-full bg-black/60 border border-white/10 px-2 py-0.5 font-mono text-[9px] sm:text-[10px] font-bold text-slate-400">
                      REEL // {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Bottom Card Content */}
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 text-right z-10">
                    {item.metaText && (
                      <p className="text-[10px] sm:text-[11px] font-bold text-amber-300/90 mb-1 tracking-wide">{item.metaText}</p>
                    )}
                    <h3 className="text-base sm:text-xl lg:text-2xl font-black text-white leading-snug line-clamp-2 drop-shadow-md font-cairo">
                      {item.title}
                    </h3>

                    {/* Action Bar */}
                    <div className="mt-3 sm:mt-5 flex items-center justify-between border-t border-white/15 pt-2.5 sm:pt-4">
                      <span className="text-[11px] sm:text-xs font-black text-[#f8ca14] group-hover:underline inline-flex items-center gap-1.5">
                        <span>فتح العمل بالكامل</span>
                        <ArrowUpLeft size={14} className="transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
                      </span>
                      <span className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 grid place-items-center text-white transition group-hover:bg-[#f8ca14] group-hover:text-black group-hover:border-[#f8ca14]">
                        <ChevronLeft size={16} />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Film Progress Scrubber */}
        <div className="mx-auto w-full max-w-[1380px] 2xl:max-w-[1560px] px-4 sm:px-6 md:px-8 z-10 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-mono font-bold text-slate-500">01</span>
            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${dark ? "bg-white/10" : "bg-black/10"}`}>
              <motion.div
                style={{ width: progressPercent }}
                className="h-full bg-gradient-to-r from-[#f8ca14] via-emerald-400 to-[#08467d] rounded-full"
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">{String(items.length).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
