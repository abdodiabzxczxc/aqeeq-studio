import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Sparkles, Mic, Newspaper, ImageIcon, BookOpen, Video } from "lucide-react";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useMemo, useState, useEffect, useRef } from "react";
import { VisualEditable } from "@/components/VisualEditor";

export function AqeeqNewsMarquee({
  badgeOverride,
}: {
  badgeOverride?: string;
} = {}) {
  const { data: articles } = trpc.articles.listPublished.useQuery({});
  const { data: showcases } = trpc.aqeeqShowcases.publicList.useQuery(undefined);
  const { data: podcasts } = trpc.podcasts.list.useQuery({});
  const { data: albums } = trpc.aqeeqAlbums.publicList.useQuery(undefined);
  const { data: issues } = trpc.schoolNews.publicList.useQuery(undefined);
  const [, navigate] = useLocation();
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  type MarqueeItem = {
    id: string;
    title: string;
    icon: "article" | "video" | "podcast" | "album" | "journal";
    label: string;
    url: string;
    timestamp: number;
  };

  // Aggregate all content (strictly excluding songs), sort newest-first, then interleave round-robin
  const rawItems = useMemo(() => {
    // 1. Articles
    const artList: MarqueeItem[] = (articles || [])
      .map((a) => ({
        id: `art-${a.id}`,
        title: a.title,
        icon: "article" as const,
        label: "مقال",
        url: `/articles/${a.slug}`,
        timestamp: new Date(a.publishedAt || a.createdAt || 0).getTime(),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    // 2. Video Showcases
    const showList: MarqueeItem[] = (showcases || [])
      .map((s) => ({
        id: `show-${s.id}`,
        title: s.title,
        icon: "video" as const,
        label: "مرئي",
        url: `/showcase/${s.slug}`,
        timestamp: new Date((s as any).publishedAt || s.createdAt || 0).getTime(),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    // 3. Podcasts (Strictly exclude songs / anthems: ميعادا الأغاني)
    const podList: MarqueeItem[] = (podcasts || [])
      .filter((p) => {
        const t = (p.title || "").toLowerCase();
        const c = (p.category || "").toLowerCase();
        return !t.includes("نشيد") && !t.includes("أغنية") && !t.includes("أغاني") && !c.includes("نشيد");
      })
      .map((p) => ({
        id: `pod-${p.id}`,
        title: p.title,
        icon: "podcast" as const,
        label: "أثير",
        url: "/podcast",
        timestamp: new Date(p.createdAt || 0).getTime(),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    // 4. Photo Albums
    const albList: MarqueeItem[] = (albums || [])
      .map((a) => ({
        id: `alb-${a.id}`,
        title: a.title,
        icon: "album" as const,
        label: "ألبوم",
        url: `/albums/${a.slug}`,
        timestamp: new Date((a as any).publishedAt || a.createdAt || 0).getTime(),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    // 5. School News & Magazine Issues
    const issList: MarqueeItem[] = (issues || [])
      .map((i) => ({
        id: `iss-${i.id}`,
        title: i.title,
        icon: "journal" as const,
        label: "مجلة",
        url: `/journal/issue/${i.slug}`,
        timestamp: new Date(i.publishedAt || i.createdAt || 0).getTime(),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    // Interleave round-robin: "مشكل بقى واحد من هنا وواحد من هنا"
    const buckets: MarqueeItem[][] = [artList, showList, podList, albList, issList].filter((b) => b.length > 0);
    if (buckets.length === 0) return [];

    const maxLen = Math.max(...buckets.map((b) => b.length));
    const interleaved: MarqueeItem[] = [];

    for (let i = 0; i < maxLen; i++) {
      for (const bucket of buckets) {
        if (i < bucket.length) {
          interleaved.push(bucket[i]);
        }
      }
    }

    return interleaved;
  }, [articles, showcases, podcasts, albums, issues]);

  // Ensure singleBatch has at least 8 items for a full conveyor belt
  const singleBatch = useMemo(() => {
    if (rawItems.length === 0) return [];
    let batch = [...rawItems];
    while (batch.length < 8) {
      batch = [...batch, ...rawItems];
    }
    return batch;
  }, [rawItems]);

  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const batchRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef<number>(0);
  const batchWidthRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const hasInitializedRef = useRef<boolean>(false);

  // Initialize offset so the first news item (أول وأحدث خبر) starts from the far left edge of the bar
  useEffect(() => {
    if (!viewportRef.current || singleBatch.length === 0 || hasInitializedRef.current) return;
    const vpWidth = viewportRef.current.offsetWidth || 1000;
    offsetRef.current = -vpWidth + 24;
    hasInitializedRef.current = true;
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    }
  }, [singleBatch]);

  // Measure batch width accurately
  useEffect(() => {
    if (!batchRef.current) return;
    const updateWidth = () => {
      if (batchRef.current) {
        batchWidthRef.current = batchRef.current.offsetWidth || 0;
      }
    };
    updateWidth();

    const ro = new ResizeObserver(updateWidth);
    ro.observe(batchRef.current);
    return () => ro.disconnect();
  }, [singleBatch]);

  // 60fps hardware-accelerated continuous conveyor belt
  useEffect(() => {
    if (singleBatch.length === 0) return;

    let lastTime = performance.now();
    const speed = 40; // pixels per second — silky smooth and easy to read

    const loop = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isPausedRef.current && batchWidthRef.current > 0 && trackRef.current) {
        // Move to the right (+X)
        offsetRef.current += speed * delta;
        if (offsetRef.current >= batchWidthRef.current) {
          offsetRef.current -= batchWidthRef.current;
        }
        trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [singleBatch]);

  if (rawItems.length === 0) return null;

  const iconMap = {
    article: <Newspaper size={13} className={dark ? "text-rose-400" : "text-rose-600"} />,
    video: <Video size={13} className={dark ? "text-sky-400" : "text-sky-600"} />,
    podcast: <Mic size={13} className={dark ? "text-indigo-400" : "text-indigo-600"} />,
    album: <ImageIcon size={13} className={dark ? "text-emerald-400" : "text-emerald-600"} />,
    journal: <BookOpen size={13} className={dark ? "text-amber-400" : "text-amber-600"} />,
  };

  const renderBatch = (items: MarqueeItem[], keyPrefix: string, isFirst = false) => (
    <div
      ref={isFirst ? batchRef : undefined}
      className="flex items-center shrink-0"
      aria-hidden={!isFirst ? true : undefined}
    >
      {items.map((item, idx) => (
        <div key={`${keyPrefix}-${item.id}-${idx}`} className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => navigate(item.url)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl shrink-0 whitespace-nowrap text-xs sm:text-[13.5px] font-bold transition-all ${
              dark
                ? "text-slate-200 hover:text-amber-300 hover:bg-white/[0.08]"
                : "text-slate-800 hover:text-[#08467d] hover:bg-black/[0.05]"
            }`}
          >
            <span className="shrink-0">{iconMap[item.icon]}</span>
            <span
              className={`text-[9.5px] sm:text-[10.5px] font-black px-1.5 py-0.5 rounded-md border shrink-0 ${
                item.icon === "article"
                  ? dark ? "bg-rose-500/15 text-rose-300 border-rose-500/30" : "bg-rose-50 text-rose-700 border-rose-200"
                  : item.icon === "video"
                  ? dark ? "bg-sky-500/15 text-sky-300 border-sky-500/30" : "bg-sky-50 text-sky-700 border-sky-200"
                  : item.icon === "podcast"
                  ? dark ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" : "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : item.icon === "album"
                  ? dark ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : dark ? "bg-amber-500/15 text-amber-300 border-amber-500/30" : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {item.label}
            </span>
            <span className="shrink-0 leading-none">{item.title}</span>
          </button>

          <span
            className={`mx-3 sm:mx-5 text-[10px] shrink-0 ${
              dark ? "text-amber-400/40" : "text-[#08467d]/35"
            }`}
          >
            ✦
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <VisualEditable
      id="studio-marquee-section"
      tag="section"
      label="شريط الأخبار المتحرك"
      as="div"
      className="w-full py-3 sm:py-4 select-none"
    >
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 md:px-8">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className={`relative flex items-center overflow-hidden rounded-2xl border shadow-lg backdrop-blur-xl transition-all duration-300 h-11 sm:h-13 ${
            dark
              ? "border-amber-400/25 bg-[#0a0d14]/90 shadow-[0_8px_30px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
              : "border-slate-200/90 bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5"
          }`}
        >
          {/* 1. Fixed Luxury Badge on the Right */}
          <div
            className={`shrink-0 z-20 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1 font-black text-xs sm:text-sm border-l h-full ${
              dark
                ? "bg-[#0f1422] text-[#f8ca14] border-amber-400/20 shadow-[10px_0_20px_rgba(0,0,0,0.6)]"
                : "bg-amber-50 text-[#08467d] border-slate-200 shadow-[10px_0_20px_rgba(0,0,0,0.03)]"
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

          {/* 2. Scrolling Viewport with Soft Fade Gradients */}
          <div ref={viewportRef} className="relative flex-1 overflow-hidden h-full flex items-center">
            {/* Soft edge gradient masks */}
            <div
              className={`absolute right-0 top-0 bottom-0 w-8 sm:w-16 z-10 pointer-events-none bg-gradient-to-l ${
                dark ? "from-[#0a0d14] to-transparent" : "from-white to-transparent"
              }`}
            />
            <div
              className={`absolute left-0 top-0 bottom-0 w-8 sm:w-16 z-10 pointer-events-none bg-gradient-to-r ${
                dark ? "from-[#0a0d14] to-transparent" : "from-white to-transparent"
              }`}
            />

            {/* 3. Pixel-exact, 100% Unbreakable Continuous Conveyor Belt */}
            <div
              ref={trackRef}
              className="flex items-center shrink-0 will-change-transform"
            >
              {renderBatch(singleBatch, "b1", true)}
              {renderBatch(singleBatch, "b2")}
              {renderBatch(singleBatch, "b3")}
              {renderBatch(singleBatch, "b4")}
            </div>
          </div>
        </div>
      </div>
    </VisualEditable>
  );
}
