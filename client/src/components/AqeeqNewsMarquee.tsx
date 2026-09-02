import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Sparkles, Mic, Newspaper, ImageIcon, BookOpen, ChevronRight, ChevronLeft, ArrowUpLeft } from "lucide-react";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { VisualEditable } from "@/components/VisualEditor";

export function AqeeqNewsMarquee({
  badgeOverride,
}: {
  badgeOverride?: string;
} = {}) {
  const { data: articles } = trpc.articles.listPublished.useQuery({});
  const { data: podcasts } = trpc.podcasts.list.useQuery({});
  const { data: albums } = trpc.aqeeqAlbums.publicList.useQuery(undefined);
  const { data: issues } = trpc.schoolNews.publicList.useQuery(undefined);
  const [, navigate] = useLocation();
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const rawItems = useMemo(() => {
    const list: {
      id: string;
      title: string;
      icon: "article" | "podcast" | "album" | "journal";
      label: string;
      url: string;
    }[] = [];

    articles?.slice(0, 5).forEach((a) => {
      list.push({ id: `art-${a.id}`, title: a.title, icon: "article", label: "مقال", url: `/articles/${a.slug}` });
    });
    podcasts?.slice(0, 4).forEach((p) => {
      list.push({ id: `pod-${p.id}`, title: p.title, icon: "podcast", label: "أثير", url: "/podcast" });
    });
    albums?.slice(0, 4).forEach((a) => {
      list.push({ id: `alb-${a.id}`, title: a.title, icon: "album", label: "ألبوم", url: `/albums/${a.slug}` });
    });
    issues?.slice(0, 4).forEach((i) => {
      list.push({ id: `iss-${i.id}`, title: i.title, icon: "journal", label: "مجلة", url: `/journal/issue/${i.slug}` });
    });

    return list;
  }, [articles, podcasts, albums, issues]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number>(0);

  // Safely advance to next headline
  const handleNext = useCallback(() => {
    if (rawItems.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % rawItems.length);
  }, [rawItems.length]);

  // Safely go to previous headline
  const handlePrev = useCallback(() => {
    if (rawItems.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + rawItems.length) % rawItems.length);
  }, [rawItems.length]);

  // Auto-advance timer (smooth 4.5 seconds per news headline)
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (rawItems.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      handleNext();
    }, 4500);
  }, [rawItems.length, isPaused, handleNext]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  // Pause when browser tab is inactive to prevent glitching/hanging
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        resetTimer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [resetTimer]);

  if (rawItems.length === 0) return null;

  const currentItem = rawItems[currentIndex % rawItems.length];

  const iconMap = {
    article: <Newspaper size={13} className={dark ? "text-rose-400" : "text-rose-600"} />,
    podcast: <Mic size={13} className={dark ? "text-indigo-400" : "text-indigo-600"} />,
    album: <ImageIcon size={13} className={dark ? "text-emerald-400" : "text-emerald-600"} />,
    journal: <BookOpen size={13} className={dark ? "text-amber-400" : "text-amber-600"} />,
  };

  const badgeColorMap = {
    article: dark ? "bg-rose-500/15 text-rose-300 border-rose-500/30" : "bg-rose-50 text-rose-700 border-rose-200",
    podcast: dark ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" : "bg-indigo-50 text-indigo-700 border-indigo-200",
    album: dark ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200",
    journal: dark ? "bg-amber-500/15 text-amber-300 border-amber-500/30" : "bg-amber-50 text-amber-800 border-amber-200",
  };

  return (
    <VisualEditable
      id="studio-marquee-section"
      tag="section"
      label="شريط الأخبار المتحرك"
      as="div"
      className="w-full py-2.5 sm:py-3.5 select-none"
    >
      <div className="mx-auto max-w-[1380px] px-3 sm:px-6 md:px-8">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={(e) => {
            touchStartXRef.current = e.touches[0].clientX;
            setIsPaused(true);
          }}
          onTouchEnd={(e) => {
            const diff = e.changedTouches[0].clientX - touchStartXRef.current;
            if (Math.abs(diff) > 40) {
              if (diff > 0) handlePrev();
              else handleNext();
            }
            setIsPaused(false);
          }}
          className={`relative flex items-center justify-between overflow-hidden rounded-2xl border shadow-lg backdrop-blur-xl transition-all duration-300 h-11 sm:h-12 ${
            dark
              ? "border-amber-400/25 bg-[#0a0d14]/90 shadow-[0_8px_30px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
              : "border-slate-200/90 bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5"
          }`}
        >
          {/* 1. Fixed Luxury Badge on the Right */}
          <div
            className={`shrink-0 z-20 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 font-black text-xs sm:text-sm border-l h-full ${
              dark
                ? "bg-[#0f1422] text-[#f8ca14] border-amber-400/20 shadow-[8px_0_16px_rgba(0,0,0,0.5)]"
                : "bg-amber-50/90 text-[#08467d] border-slate-200 shadow-[8px_0_16px_rgba(0,0,0,0.03)]"
            }`}
          >
            <Sparkles size={13} className="animate-pulse text-[#f8ca14] shrink-0" />
            <VisualEditable
              id="studio-marquee-badge-text"
              tag="text"
              label="شارة شريط الأخبار"
              defaultText={badgeOverride || "آخر الأخبار"}
              as="span"
              className="whitespace-nowrap tracking-wide font-black"
            />
          </div>

          {/* 2. Active Headline Viewport (Smooth Vertical Slide & Fade) */}
          <div className="relative flex-1 min-w-0 h-full flex items-center px-3 sm:px-5 overflow-hidden">
            <div
              key={currentItem.id}
              className="animate-ticker-in flex items-center gap-2 sm:gap-3 min-w-0 w-full"
            >
              {/* Category Pill */}
              <span
                className={`hidden xs:inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] sm:text-[11px] font-black shrink-0 ${
                  badgeColorMap[currentItem.icon]
                }`}
              >
                {iconMap[currentItem.icon]}
                <span>{currentItem.label}</span>
              </span>

              {/* Headline Title */}
              <button
                type="button"
                onClick={() => navigate(currentItem.url)}
                className={`group/title flex items-center gap-1.5 min-w-0 text-right text-xs sm:text-sm font-bold transition truncate ${
                  dark
                    ? "text-slate-200 hover:text-amber-300"
                    : "text-slate-800 hover:text-[#08467d]"
                }`}
                title={currentItem.title}
              >
                <span className="truncate">{currentItem.title}</span>
                <ArrowUpLeft
                  size={12}
                  className={`shrink-0 opacity-0 -translate-x-1 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition duration-200 ${
                    dark ? "text-amber-400" : "text-[#08467d]"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 3. Controls & Counter on the Left */}
          <div
            className={`shrink-0 z-20 flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 border-r h-full ${
              dark
                ? "border-white/10 bg-white/[0.02]"
                : "border-slate-200 bg-slate-50/50"
            }`}
          >
            {/* Counter */}
            <div className="hidden sm:flex items-center gap-0.5 font-mono text-[10.5px] font-bold text-slate-400 select-none ml-1">
              <span className={dark ? "text-amber-300" : "text-[#08467d]"}>
                {currentIndex + 1}
              </span>
              <span className="text-slate-500">/</span>
              <span>{rawItems.length}</span>
            </div>

            {/* Previous Button (in RTL: pointing right ❯) */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handlePrev();
                resetTimer();
              }}
              className={`grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg border transition active:scale-90 ${
                dark
                  ? "border-white/10 text-slate-300 hover:border-amber-400/40 hover:bg-white/10 hover:text-amber-300"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-black"
              }`}
              title="الخبر السابق"
              aria-label="الخبر السابق"
            >
              <ChevronRight size={14} />
            </button>

            {/* Next Button (in RTL: pointing left ❮) */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleNext();
                resetTimer();
              }}
              className={`grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg border transition active:scale-90 ${
                dark
                  ? "border-white/10 text-slate-300 hover:border-amber-400/40 hover:bg-white/10 hover:text-amber-300"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-black"
              }`}
              title="الخبر التالي"
              aria-label="الخبر التالي"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        </div>
      </div>
    </VisualEditable>
  );
}
