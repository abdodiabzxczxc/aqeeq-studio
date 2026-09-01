import { trpc } from "@/lib/trpc";
import { ArrowUpLeft, ExternalLink, Instagram, Loader2, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AqeeqUnifiedVideoFrame } from "@/components/AqeeqVideoPoster";

type Source = "x" | "instagram" | "youtube";
type XWidgetsWindow = Window & { twttr?: { widgets?: { load: (element?: HTMLElement) => Promise<unknown> | void } } };

// ─── X Embed ─────────────────────────────────────────────────────────────────

export function XEmbed({ url, title, dark = false }: { url: string; title?: string; dark?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [widgetMounted, setWidgetMounted] = useState(false);

  const handleMatch = url.match(/(?:x|twitter)\.com\/([^/]+)/i);
  const handle = handleMatch ? "@" + handleMatch[1] : "@alaqeeq_school";

  const { data, isLoading, isError } = trpc.aqeeqShowcases.xEmbed.useQuery(
    { xPostUrl: url },
    { enabled: Boolean(url) && visible, retry: 1, refetchOnWindowFocus: false, staleTime: 1000 * 60 * 60 * 12 }
  );

  // Only start fetching when element enters viewport
  useEffect(() => {
    if (!rootRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: "400px" }
    );
    obs.observe(rootRef.current);
    return () => obs.disconnect();
  }, []);

  // Inject HTML + call widget.load() once (no flaky setTimeouts)
  useEffect(() => {
    if (!data?.html || !containerRef.current) return;
    const themed = dark
      ? data.html.replace(/data-theme="light"/g, 'data-theme="dark"')
      : data.html.replace(/data-theme="dark"/g, 'data-theme="light"');
    containerRef.current.innerHTML = themed;

    const mountWidget = () => {
      const twttr = (window as XWidgetsWindow).twttr;
      if (!twttr?.widgets || !containerRef.current) return;
      try {
        const res = twttr.widgets.load(containerRef.current);
        if (res && typeof (res as Promise<unknown>).then === "function") {
          (res as Promise<unknown>).then(() => setWidgetMounted(true)).catch(() => {});
        } else {
          setWidgetMounted(true);
        }
      } catch {}
    };

    const existing = document.getElementById("aqeeq-x-widget");
    if (existing) {
      (window as XWidgetsWindow).twttr?.widgets
        ? mountWidget()
        : existing.addEventListener("load", mountWidget, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = "aqeeq-x-widget";
    script.async = true;
    script.defer = true;
    script.src = "https://platform.x.com/widgets.js";
    script.onload = () => requestAnimationFrame(mountWidget);
    document.body.appendChild(script);
  }, [data?.html, dark]);

  return (
    <div ref={rootRef} className={"relative w-full overflow-hidden rounded-2xl " + (dark ? "bg-[#090909]" : "bg-[#f8f9fa]")}>
      {/* Official widget container */}
      {data?.html && (
        <div
          ref={containerRef}
          className={"w-full px-2 py-2 flex justify-center [&_.twitter-tweet]:!my-0 [&_.twitter-tweet]:!max-w-full " + (widgetMounted ? "block" : "hidden")}
        />
      )}

      {/* Fallback card while loading or if widget fails */}
      {!widgetMounted && (
        <div className="flex flex-col gap-4 p-5 sm:p-6 min-h-[160px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={"grid h-10 w-10 shrink-0 place-items-center rounded-2xl border " + (dark ? "border-white/15 bg-black text-white" : "border-black/10 bg-white text-black shadow-md")}>
                <span className="text-lg font-black">𝕏</span>
              </div>
              <div>
                <p className={"text-sm font-black " + (dark ? "text-white" : "text-black")}>{data?.authorName || handle}</p>
                <span className={"text-[11px] font-bold " + (dark ? "text-slate-400" : "text-slate-500")}>منشور على منصة 𝕏</span>
              </div>
            </div>
            <span className={"rounded-full border px-2.5 py-1 text-[9px] font-black " + (dark ? "border-white/10 bg-white/5 text-slate-400" : "border-black/10 bg-slate-100 text-slate-500")}>𝕏 POST</span>
          </div>

          <p className={"text-sm font-bold leading-relaxed line-clamp-3 " + (dark ? "text-slate-200" : "text-slate-800")}>
            {isLoading ? "جاري تحميل المنشور…" : isError ? (title || "تعذّر تحميل المنشور من 𝕏") : (title || "منشور من 𝕏")}
          </p>

          <div className={"mt-auto flex items-center justify-between border-t pt-3 " + (dark ? "border-white/[0.08]" : "border-black/[0.08]")}>
            <a href={url} target="_blank" rel="noreferrer noopener"
              className={"inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition active:scale-95 " + (dark ? "bg-white/10 text-white hover:bg-[#f8ca14] hover:text-black" : "bg-black/5 text-black hover:bg-[#08467d] hover:text-white")}>
              <span>فتح في تطبيق 𝕏</span>
              <ArrowUpLeft size={13} />
            </a>
            {isLoading && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <Loader2 size={11} className="animate-spin text-[#f8ca14]" />
                مزامنة...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Instagram Embed ─────────────────────────────────────────────────────────
/**
 * Instagram iframes are blocked by Safari ITP, Firefox, and Brave.
 * Strategy:
 *   1. Show a beautiful preview card immediately
 *   2. User can tap "عرض المنشور" to load the iframe on demand
 *   3. 8-second timeout — if iframe doesn't load, show "open in app" fallback
 */
export function FastInstagramEmbed({ url, title }: { url: string; title: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const codeMatch = url.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/i);
  const isReel = codeMatch?.[1]?.toLowerCase() === "reel";
  const embedUrl = url.replace(/\/?$/, "/") + "embed/";

  // Intersection observer — lazy init
  useEffect(() => {
    if (!rootRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: "500px" }
    );
    obs.observe(rootRef.current);
    return () => obs.disconnect();
  }, []);

  // 8s timeout if iframe doesn't fire onLoad
  useEffect(() => {
    if (!expanded || iframeLoaded || timedOut) return;
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, [expanded, iframeLoaded, timedOut]);

  return (
    <div ref={rootRef} className="relative w-full overflow-hidden rounded-2xl bg-[#0e0e0e]">

      {/* Always show the preview card until iframe is confirmed loaded */}
      {!iframeLoaded && (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-8 text-center min-h-[200px]">
          {/* Instagram gradient icon */}
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-0.5 shadow-xl">
            <div className="grid h-full w-full place-items-center rounded-[0.85rem] bg-black">
              <Instagram size={24} className="text-white" />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-black text-white leading-snug">
              {isReel ? "🎬 " : "📸 "}{title || "منشور Instagram"}
            </p>
            <p className="text-[11px] text-slate-400 font-bold">
              {isReel ? "Instagram Reel" : "Instagram Post"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 mt-1">
            {/* Always-available: open in app */}
            <a href={url} target="_blank" rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-black text-slate-200 transition hover:bg-white/10 hover:border-white/30">
              <ExternalLink size={13} />
              فتح في Instagram
            </a>

            {/* Load embed button — only shown after intersection + not yet expanded */}
            {visible && !expanded && !timedOut && (
              <button onClick={() => setExpanded(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-tr from-[#ee2a7b] to-[#6228d7] px-4 py-2.5 text-xs font-black text-white shadow-lg transition hover:opacity-90 active:scale-95">
                <Play size={13} className="fill-current" />
                عرض المنشور هنا
              </button>
            )}

            {/* Loading indicator */}
            {expanded && !iframeLoaded && !timedOut && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                <Loader2 size={12} className="animate-spin text-[#ee2a7b]" />
                جاري التحميل…
              </span>
            )}

            {/* Timeout fallback message */}
            {timedOut && (
              <span className="text-[11px] font-bold text-slate-400 max-w-[180px] text-center leading-relaxed">
                المتصفح قد يمنع المعاينة — افتح الرابط مباشرةً
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actual iframe — mounted only after user clicks, hidden until loaded */}
      {expanded && !timedOut && (
        <iframe
          src={embedUrl}
          title={title}
          onLoad={() => setIframeLoaded(true)}
          onError={() => setTimedOut(true)}
          className={"w-full border-0 " + (iframeLoaded ? "block" : "hidden")}
          style={{ height: iframeLoaded ? (isReel ? "600px" : "480px") : "0" }}
          loading="lazy"
          allow="encrypted-media; picture-in-picture; autoplay"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      )}
    </div>
  );
}

// ─── Unified Social Embed ─────────────────────────────────────────────────────

export default function AqeeqAlbumSocialEmbed({
  source, url, title, dark = false,
}: {
  source: Source; url: string; title: string; dark?: boolean;
}) {
  if (source === "x") return <XEmbed url={url} title={title} dark={dark} />;
  if (source === "instagram") return <FastInstagramEmbed url={url} title={title} />;
  if (source === "youtube") {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <AqeeqUnifiedVideoFrame sourceUrl={url} title={title} />
      </div>
    );
  }
  return null;
}
