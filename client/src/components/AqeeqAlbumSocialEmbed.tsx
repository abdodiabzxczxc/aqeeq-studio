import { trpc } from "@/lib/trpc";
import { ArrowUpLeft, ExternalLink, Instagram, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AqeeqUnifiedVideoFrame } from "@/components/AqeeqVideoPoster";

type Source = "x" | "instagram" | "youtube";
type XWidgetsWindow = Window & { twttr?: { widgets?: { load: (element?: HTMLElement) => Promise<unknown> | void } } };

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    const id =
      parsed.searchParams.get("v") ||
      parsed.pathname.match(/^\/(?:shorts|embed|live)\/([A-Za-z0-9_-]+)/)?.[1] ||
      (parsed.hostname === "youtu.be" ? parsed.pathname.split("/").filter(Boolean)[0] : "");
    return id ? "https://www.youtube-nocookie.com/embed/" + id + "?rel=0&playsinline=1" : null;
  } catch {
    return null;
  }
}

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
  const { data, isLoading } = trpc.aqeeqShowcases.xEmbed.useQuery(
    { xPostUrl: url },
    { enabled: Boolean(url), retry: 1, refetchOnWindowFocus: false, staleTime: 1000 * 60 * 60 * 12 }
  );

  const [widgetRendered, setWidgetRendered] = useState(false);

  // Extract handle from URL e.g. @alaqeeq_school
  const handleMatch = url.match(/x\.com\/([^/]+)/i) || url.match(/twitter\.com\/([^/]+)/i);
  const handle = handleMatch ? "@" + handleMatch[1] : "@alaqeeq_school";

  const themeAdjustedHtml = useMemo(() => {
    if (!data?.html) return null;
    return dark
      ? data.html.replace(/data-theme="light"/g, "data-theme=\"dark\"")
      : data.html.replace(/data-theme="dark"/g, "data-theme=\"light\"");
  }, [data?.html, dark]);

  useEffect(() => {
    if (!themeAdjustedHtml || !containerRef.current) return;

    let timeoutId1: ReturnType<typeof setTimeout>;
    let timeoutId2: ReturnType<typeof setTimeout>;

    const render = () => {
      if (containerRef.current && (window as XWidgetsWindow).twttr?.widgets) {
        try {
          const res = (window as XWidgetsWindow).twttr?.widgets?.load(containerRef.current);
          if (res && typeof (res as Promise<unknown>).then === "function") {
            (res as Promise<unknown>)
              .then(() => setWidgetRendered(true))
              .catch(() => setWidgetRendered(false));
          } else {
            setWidgetRendered(true);
          }
        } catch {
          setWidgetRendered(false);
        }
      }
    };

    const scheduleRenders = () => {
      render();
      requestAnimationFrame(render);
      timeoutId1 = setTimeout(render, 80);
      timeoutId2 = setTimeout(render, 300);
    };

    const existing = document.getElementById("aqeeq-x-widget") as HTMLScriptElement | null;
    if (existing) {
      if ((window as XWidgetsWindow).twttr?.widgets) {
        scheduleRenders();
      } else {
        existing.addEventListener("load", scheduleRenders, { once: true });
      }
      return () => {
        clearTimeout(timeoutId1);
        clearTimeout(timeoutId2);
      };
    }

    const script = document.createElement("script");
    script.id = "aqeeq-x-widget";
    script.async = true;
    script.src = "https://platform.x.com/widgets.js";
    script.onload = scheduleRenders;
    document.body.appendChild(script);

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, [themeAdjustedHtml, url]);

  return (
    <div
      className={"relative min-h-[200px] w-full overflow-hidden transition-all duration-300 " + (
        dark ? "bg-[#090909] text-white" : "bg-[#f8f9fa] text-black"
      )}
    >
      {/* 1. Official Twitter Widget if active */}
      {themeAdjustedHtml ? (
        <div
          ref={containerRef}
          className={"w-full px-3 py-2 flex justify-center [&_.twitter-tweet]:!my-0 [&_.twitter-tweet]:!max-w-full " + (
            widgetRendered ? "block" : "hidden"
          )}
          dangerouslySetInnerHTML={{ __html: themeAdjustedHtml }}
        />
      ) : null}

      {/* 2. Sleek Dual-Theme Native X Card (Displayed gracefully while loading or if iframe unrendered) */}
      {!widgetRendered ? (
        <div className="flex flex-col justify-between p-6 sm:p-7 min-h-[200px]">
          <div>
            {/* Header: X Icon Badge + Author Handle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={"grid h-11 w-11 place-items-center rounded-2xl border shadow-sm " + (
                    dark
                      ? "border-white/15 bg-black text-white"
                      : "border-black/10 bg-white text-black shadow-md"
                  )}
                >
                  <span className="text-xl font-black">𝕏</span>
                </div>
                <div>
                  <p className={"text-sm font-black " + (dark ? "text-white" : "text-black")}>
                    {data?.authorName || handle}
                  </p>
                  <span className={"text-[11px] font-bold " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")}>
                    منشور رسمي على منصة 𝕏
                  </span>
                </div>
              </div>

              <span
                className={"rounded-full border px-2.5 py-1 text-[9px] font-black " + (
                  dark
                    ? "border-white/10 bg-white/5 text-slate-400"
                    : "border-black/10 bg-slate-100 text-slate-600"
                )}
              >
                𝕏 POST
              </span>
            </div>

            {/* Post Title / Content */}
            <div className="mt-4">
              <p
                className={"text-base font-black leading-relaxed " + (
                  dark ? "text-slate-100" : "text-slate-900"
                )}
              >
                {title || (isLoading ? "جاري تحميل المنشور من 𝕏…" : "عرض تفاصيل المنشور")}
              </p>
            </div>
          </div>

          {/* Action CTA */}
          <div className={"mt-5 pt-3 border-t flex items-center justify-between " + (
            dark ? "border-white/[0.08]" : "border-black/[0.08]"
          )}>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className={"inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition active:scale-95 " + (
                dark
                  ? "bg-white/10 text-white hover:bg-[#f8ca14] hover:text-black"
                  : "bg-black/5 text-black hover:bg-[#08467d] hover:text-white"
              )}
            >
              <span>فتح المنشور في تطبيق 𝕏</span>
              <ArrowUpLeft size={14} />
            </a>

            {isLoading ? (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <Loader2 size={12} className="animate-spin text-[#f8ca14]" />
                مزامنة...
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

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
      { rootMargin: "300px" }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-[480px] w-full overflow-hidden bg-slate-900">
      {!iframeLoaded ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#181818] to-[#0c0c0c] text-white">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] via-[#de191e] to-[#08467d] p-0.5 shadow-xl">
            <div className="grid h-full w-full place-items-center rounded-[0.85rem] bg-black">
              <Instagram size={26} className="text-white" />
            </div>
          </div>
          <p className="mt-4 text-xs font-black text-white">{title || "منشور Instagram"}</p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400 font-bold">
            <Loader2 size={13} className="animate-spin text-[#f8ca14]" />
            جاري تحضير المعاينة السريعة…
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-black text-slate-200 transition hover:bg-white/10"
          >
            فتح في تطبيق Instagram <ExternalLink size={13} />
          </a>
        </div>
      ) : null}

      {isVisible ? (
        <iframe
          src={embedUrl}
          title={title}
          onLoad={() => setIframeLoaded(true)}
          className="h-[540px] w-full border-0 bg-white"
          loading="lazy"
          allow="encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : null}
    </div>
  );
}

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
