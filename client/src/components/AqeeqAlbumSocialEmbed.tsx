import { trpc } from "@/lib/trpc";
import { ArrowUpLeft, ExternalLink, Instagram, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AqeeqUnifiedVideoFrame } from "@/components/AqeeqVideoPoster";

type Source = "x" | "instagram" | "youtube";
type XWidgetsWindow = Window & { twttr?: { widgets?: { load: (element?: HTMLElement) => Promise<unknown> | void } } };

// ─── X / Twitter Embed ──────────────────────────────────────────────────────

export function XEmbed({
  url,
  title,
  dark = false,
}: {
  url: string;
  title?: string;
  dark?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  // Fetch oEmbed data (cached 12h server-side)
  const { data, isLoading } = trpc.aqeeqShowcases.xEmbed.useQuery(
    { xPostUrl: url },
    {
      enabled: Boolean(url),
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 60 * 12,
    }
  );

  const themeAdjustedHtml = useMemo(() => {
    if (!data?.html) return null;
    return dark
      ? data.html.replace(/data-theme="light"/g, 'data-theme="dark"')
      : data.html.replace(/data-theme="dark"/g, 'data-theme="light"');
  }, [data?.html, dark]);

  // Load Twitter widgets.js once globally
  useEffect(() => {
    const existing = document.getElementById("aqeeq-x-widget") as HTMLScriptElement | null;
    if (existing) {
      if ((window as XWidgetsWindow).twttr?.widgets) {
        setScriptReady(true);
      } else {
        existing.addEventListener("load", () => setScriptReady(true), { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "aqeeq-x-widget";
    script.async = true;
    script.src = "https://platform.x.com/widgets.js";
    script.onload = () => setScriptReady(true);
    document.body.appendChild(script);
  }, []);

  // Enhance blockquote with widgets.js as soon as HTML is rendered
  useEffect(() => {
    if (!themeAdjustedHtml || !containerRef.current) return;

    const renderWidget = () => {
      const twttr = (window as XWidgetsWindow).twttr;
      if (twttr?.widgets && containerRef.current) {
        try {
          twttr.widgets.load(containerRef.current);
        } catch {}
      }
    };

    renderWidget();
    const t = setTimeout(renderWidget, 100);
    return () => clearTimeout(t);
  }, [themeAdjustedHtml, scriptReady, dark]);

  return (
    <div
      className={`relative min-h-[160px] w-full overflow-hidden rounded-2xl transition-all duration-300 ${
        dark ? "bg-[#090909] text-white" : "bg-[#f8f9fa] text-black"
      }`}
    >
      {themeAdjustedHtml ? (
        <div
          ref={containerRef}
          className="w-full px-2 py-2 flex justify-center [&_.twitter-tweet]:!my-0 [&_.twitter-tweet]:!max-w-full"
          dangerouslySetInnerHTML={{ __html: themeAdjustedHtml }}
        />
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[180px]">
          <div
            className={`grid h-12 w-12 place-items-center rounded-2xl border shadow-sm mb-3 ${
              dark ? "border-white/15 bg-black text-white" : "border-black/10 bg-white text-black shadow-md"
            }`}
          >
            <span className="text-xl font-black">𝕏</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Loader2 size={13} className="animate-spin text-[#f8ca14]" />
            جاري عرض منشور 𝕏…
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center min-h-[160px] gap-3">
          <p className="text-sm font-black">{title || "منشور على منصة 𝕏"}</p>
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition ${
              dark ? "bg-white/10 text-white hover:bg-[#f8ca14] hover:text-black" : "bg-black/5 text-black hover:bg-[#08467d] hover:text-white"
            }`}
          >
            <span>فتح المنشور في تطبيق 𝕏</span>
            <ArrowUpLeft size={13} />
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Instagram Embed ─────────────────────────────────────────────────────────

export function FastInstagramEmbed({ url, title }: { url: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const embedUrl = url.replace(/\/?$/, "/") + "embed/captioned/";

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-[480px] w-full overflow-hidden rounded-2xl bg-black">
      {!iframeLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#181818] to-[#0c0c0c] text-white">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-0.5 shadow-xl">
            <div className="grid h-full w-full place-items-center rounded-[0.85rem] bg-black">
              <Instagram size={26} className="text-white" />
            </div>
          </div>
          <p className="mt-4 text-xs font-black text-white">{title || "منشور Instagram"}</p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400 font-bold">
            <Loader2 size={13} className="animate-spin text-[#ee2a7b]" />
            جاري تحميل منشور Instagram…
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-black text-slate-200 transition hover:bg-white/10"
          >
            فتح في تطبيق Instagram <ExternalLink size={13} />
          </a>
        </div>
      )}

      {isVisible && (
        <iframe
          src={embedUrl}
          title={title}
          onLoad={() => setIframeLoaded(true)}
          className="h-[540px] w-full border-0 bg-white"
          loading="lazy"
          allow="encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </div>
  );
}

// ─── Unified Social Embed ─────────────────────────────────────────────────────

export default function AqeeqAlbumSocialEmbed({
  source,
  url,
  title,
  dark = false,
}: {
  source: Source;
  url: string;
  title: string;
  dark?: boolean;
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
