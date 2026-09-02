import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getAqeeqDriveFallbackUrl, getAqeeqDriveFileId, getAqeeqDrivePreviewUrl, getAqeeqDriveThumbnailUrl, isAqeeqDriveVideo } from "@/lib/aqeeqAlbumMedia";
import { ExternalLink, Maximize2, Minimize2, Play, RefreshCw, X } from "lucide-react";
import { useState, useRef, useEffect, type ReactNode } from "react";

export type AqeeqVideoOpenBehavior = "internal-drive" | "internal-native";

export function getAqeeqVideoOpenBehavior(sourceUrl: string): AqeeqVideoOpenBehavior {
  return isAqeeqDriveVideo(sourceUrl) ? "internal-drive" : "internal-native";
}

export type AqeeqVideoPlayerProps = {
  sourceUrl: string;
  posterUrl?: string | null;
  title: string;
  className?: string;
  imageClassName?: string;
  playSize?: "compact" | "regular" | "large";
  badge?: string;
  onOpen?: () => void;
  footer?: ReactNode;
  interactive?: boolean;
};

const playSizes = {
  compact: "h-10 w-10 [&_svg]:h-4 [&_svg]:w-4",
  regular: "h-14 w-14 [&_svg]:h-6 [&_svg]:w-6",
  large: "h-16 w-16 [&_svg]:h-7 [&_svg]:w-7",
};

/**
 * مشغل الفيديو الموحد لاستوديو العقيق.
 * يدعم تشغيل فيديوهات Drive و YouTube والفيديوهات المباشرة
 * مع المزامنة مع مشغل الصوت/الأسطوانة العائمة.
 */
export function AqeeqUnifiedVideoFrame({
  sourceUrl,
  title,
  posterUrl,
  className = "relative h-full w-full overflow-hidden bg-black",
}: {
  sourceUrl: string;
  title: string;
  posterUrl?: string | null;
  className?: string;
}) {
  const [loadError, setLoadError] = useState(false);
  const [isIframePaused, setIsIframePaused] = useState(false);
  const [key, setKey] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const driveId = getAqeeqDriveFileId(sourceUrl);
  const isDrive = Boolean(driveId);
  const ytMatch = sourceUrl.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  const isYouTube = Boolean(ytMatch && ytMatch[1]);
  const ytThumbnail = isYouTube && ytMatch?.[1]
    ? `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`
    : null;
  const previewUrl = isDrive ? getAqeeqDrivePreviewUrl(sourceUrl) : sourceUrl;
  const fallbackUrl = isDrive ? getAqeeqDriveFallbackUrl(sourceUrl) : sourceUrl;

  const resolvedPoster = posterUrl || ytThumbnail || (isDrive ? getAqeeqDriveThumbnailUrl(sourceUrl) : null);

  // ─── مزامنة مع المشغل العائم ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("aqeeq-video-start", {
          detail: {
            id: sourceUrl,
            title: title || "تغطية مرئية",
            coverUrl: resolvedPoster,
            hostName: isYouTube ? "يوتيوب العقيق" : isDrive ? "جوجل درايف" : "استوديو العقيق",
            mediaUrl: sourceUrl,
            sourceType: isYouTube ? "youtube" : isDrive ? "drive" : "direct",
          },
        })
      );
    }

    let interval: any = null;
    if ((isYouTube || isDrive) && !isIframePaused) {
      let currentProgress = 0;
      interval = setInterval(() => {
        currentProgress += 1;
        window.dispatchEvent(
          new CustomEvent("aqeeq-video-progress", {
            detail: { currentTime: currentProgress, duration: 600 },
          })
        );
      }, 1000);
    }

    const handleRemoteToggle = (e: any) => {
      const willPlay = e.detail?.play;
      if (typeof willPlay === "boolean") {
        setIsIframePaused(!willPlay);
        if (videoRef.current) {
          if (willPlay) videoRef.current.play().catch(() => {});
          else videoRef.current.pause();
        }
        if (iframeRef.current && isYouTube) {
          try {
            iframeRef.current.contentWindow?.postMessage(
              JSON.stringify({ event: "command", func: willPlay ? "playVideo" : "pauseVideo" }),
              "*"
            );
          } catch {}
        }
      }
    };

    const handleRemoteSeek = (e: any) => {
      const time = e.detail?.time;
      if (typeof time === "number" && videoRef.current) {
        videoRef.current.currentTime = time;
      }
      if (typeof time === "number" && iframeRef.current && isYouTube) {
        try {
          iframeRef.current.contentWindow?.postMessage(
            JSON.stringify({ event: "command", func: "seekTo", args: [time, true] }),
            "*"
          );
        } catch {}
      }
    };

    const handleRemoteVolume = (e: any) => {
      const { volume, muted } = e.detail || {};
      if (videoRef.current) {
        if (typeof volume === "number") videoRef.current.volume = volume;
        if (typeof muted === "boolean") videoRef.current.muted = muted;
      }
    };

    window.addEventListener("aqeeq-video-toggle", handleRemoteToggle as EventListener);
    window.addEventListener("aqeeq-video-seek", handleRemoteSeek as EventListener);
    window.addEventListener("aqeeq-video-volume", handleRemoteVolume as EventListener);

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener("aqeeq-video-toggle", handleRemoteToggle as EventListener);
      window.removeEventListener("aqeeq-video-seek", handleRemoteSeek as EventListener);
      window.removeEventListener("aqeeq-video-volume", handleRemoteVolume as EventListener);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("aqeeq-video-ended"));
      }
    };
  }, [sourceUrl, title, isYouTube, isDrive, resolvedPoster, isIframePaused]);

  if (loadError) {
    return (
      <div className={`flex aspect-video w-full flex-col items-center justify-center gap-4 bg-[#05070c] p-6 text-center text-slate-200 ${className}`}>
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-300/30 bg-amber-300/10 text-amber-300">
          <Play size={22} className="rotate-180" />
        </div>
        <div>
          <p className="text-base font-black text-amber-50">تعذر تشغيل الفيديو مباشرة</p>
          <p className="mt-1 text-xs text-slate-400">يمكنك فتح الرابط مباشرة في Google Drive</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setLoadError(false);
              setKey((prev) => prev + 1);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2 text-xs font-black text-slate-950 transition hover:bg-amber-200"
          >
            <RefreshCw size={14} /> إعادة المحاولة
          </button>
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-black text-amber-200 transition hover:border-amber-300 hover:bg-amber-300/10"
          >
            <ExternalLink size={14} /> فتح في {isDrive ? "Google Drive" : "المصدر"}
          </a>
        </div>
      </div>
    );
  }

  // 1) YouTube Embed
  if (isYouTube) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const ytEmbedUrl = `https://www.youtube.com/embed/${ytMatch![1]}?autoplay=1&enablejsapi=1&playsinline=1&origin=${encodeURIComponent(origin)}`;
    return (
      <div className={className}>
        <iframe
          ref={iframeRef}
          key={key}
          src={ytEmbedUrl}
          title={title}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          onError={() => setLoadError(true)}
        />
      </div>
    );
  }

  // 2) Google Drive Video
  if (isDrive) {
    return (
      <div className={className}>
        <iframe
          ref={iframeRef}
          key={key}
          src={previewUrl}
          title={title}
          className="h-full w-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  // 3) Direct Native Video
  return (
    <div className={className}>
      <video
        ref={videoRef}
        key={key}
        src={sourceUrl}
        title={title}
        controls
        autoPlay
        playsInline
        preload="metadata"
        onPlay={() => {
          window.dispatchEvent(
            new CustomEvent("aqeeq-video-start", {
              detail: {
                id: sourceUrl,
                title: title || "تغطية مرئية",
                coverUrl: resolvedPoster,
                hostName: "استوديو العقيق",
                mediaUrl: sourceUrl,
              },
            })
          );
        }}
        onPause={() => {
          window.dispatchEvent(new CustomEvent("aqeeq-video-pause"));
        }}
        onTimeUpdate={(e) => {
          window.dispatchEvent(
            new CustomEvent("aqeeq-video-progress", {
              detail: {
                currentTime: e.currentTarget.currentTime,
                duration: e.currentTarget.duration || 0,
              },
            })
          );
        }}
        onEnded={() => {
          window.dispatchEvent(new CustomEvent("aqeeq-video-ended"));
        }}
        onError={() => setLoadError(true)}
        className="h-full w-full bg-black object-contain"
      />
    </div>
  );
}

function VideoPosterCardBody({
  posterUrl,
  sourceUrl,
  title,
  playSize = "regular",
  imageClassName = "",
  badge,
  footer,
}: Pick<AqeeqVideoPlayerProps, "posterUrl" | "sourceUrl" | "title" | "playSize" | "imageClassName" | "badge" | "footer">) {
  const directPoster = posterUrl || (isAqeeqDriveVideo(sourceUrl) ? getAqeeqDriveThumbnailUrl(sourceUrl) : null);

  return (
    <>
      {directPoster ? (
        <img
          src={directPoster}
          alt={title}
          loading="lazy"
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] ${imageClassName}`}
        />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(circle_at_50%_25%,#344155,transparent_35%),linear-gradient(135deg,#111827,#020617)]" />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30" />

      {/* زر تشغيل موحد وأنيق */}
      <span className="absolute inset-0 grid place-items-center">
        <span
          className={`grid place-items-center rounded-full border border-amber-300/60 bg-black/65 text-amber-300 shadow-[0_12px_30px_rgba(0,0,0,0.7)] backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:bg-amber-300 group-hover:text-slate-950 group-active:scale-95 ${playSizes[playSize]}`}
        >
          <Play fill="currentColor" className="translate-x-[-1px]" />
        </span>
      </span>

      {/* شارة العنوان أو الوسم */}
      <span className="absolute bottom-3 right-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-black/75 px-3 py-1.5 text-[10px] font-black text-amber-100 shadow-lg backdrop-blur-md border border-white/10">
        {badge ? <span className="ml-1.5 text-amber-300">{badge} ·</span> : null}
        {title}
      </span>
      {footer}
    </>
  );
}

/**
 * مكوّن مشغل الفيديو الموحد لاستوديو العقيق (AqeeqVideoPlayer).
 * يستخدم في جميع أقسام الموقع: الألبومات، المجلة، الأخبار والعروض، واستوديوهات الإدارة.
 * عند الضغط عليه يفتح نافذة مشغل سينمائي (Tube Modal) نظيفة بدون تشويه على الموبايل والكمبيوتر.
 */
export function AqeeqVideoPlayer({
  sourceUrl,
  posterUrl,
  title,
  className = "",
  imageClassName = "",
  playSize = "regular",
  badge,
  onOpen,
  footer,
  interactive = true,
}: AqeeqVideoPlayerProps) {
  const [open, setOpen] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalContainerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const cardBody = (
    <VideoPosterCardBody
      sourceUrl={sourceUrl}
      posterUrl={posterUrl}
      title={title}
      playSize={playSize}
      imageClassName={imageClassName}
      badge={badge}
      footer={footer}
    />
  );

  const containerClassName = `group relative block h-full w-full overflow-hidden rounded-[1.4rem] bg-black text-right text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${className}`;

  const launch = () => {
    if (onOpen) {
      onOpen();
    } else {
      setOpen(true);
    }
  };

  if (!interactive) {
    return <div className={containerClassName}>{cardBody}</div>;
  }

  return (
    <>
      <button
        type="button"
        onClick={launch}
        className={containerClassName}
        aria-label={`تشغيل فيديو: ${title}`}
      >
        {cardBody}
      </button>

      {/* Tube Modal Player — سينما عقيق المنبثقة الذكية المتكيفة مع كل الشاشات */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-[calc(100vw-0.5rem)] sm:w-[min(95vw,calc((88vh-80px)*16/9),1200px)] sm:max-w-none !max-w-none max-h-[96vh] sm:max-h-[92vh] overflow-hidden rounded-[1.4rem] sm:rounded-[2.4rem] border-2 border-amber-400/40 bg-[#070a12]/98 p-0 text-right text-white shadow-[0_32px_120px_rgba(0,0,0,0.95),0_0_80px_rgba(248,202,20,0.12)] backdrop-blur-3xl flex flex-col"
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <div ref={modalContainerRef} dir="rtl" className="flex flex-col h-full w-full bg-black">
            {/* Top Ambient Fluid Glow Mesh */}
            <div className="aq-fluid-mesh h-1 w-full shrink-0" />

            {/* Video Stage Frame */}
            <div className="relative aspect-video w-full overflow-hidden bg-black flex-1 min-h-0 flex items-center justify-center">
              <AqeeqUnifiedVideoFrame sourceUrl={sourceUrl} title={title} posterUrl={posterUrl} />
            </div>

            {/* Cinema Control Bar */}
            <div className="flex items-center justify-between gap-2.5 sm:gap-4 border-t border-white/10 bg-gradient-to-r from-[#090e1a] via-[#0c1222] to-[#090e1a] px-3.5 sm:px-6 py-2.5 sm:py-3.5 shrink-0">
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-xs sm:text-sm md:text-base font-black text-amber-50 leading-tight">
                  {title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <p className="text-[10px] sm:text-xs font-bold text-amber-300/80 truncate">
                    مشغل استوديو العقيق السينمائي 🎬
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Cinema Fullscreen Button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl border border-white/15 bg-white/5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:border-amber-300 hover:bg-amber-400/10 hover:text-amber-300 active:scale-95"
                  title={isFullscreen ? "تصغير الشاشة" : "ملء الشاشة بالكامل (Fullscreen)"}
                >
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  <span className="hidden sm:inline">{isFullscreen ? "تصغير" : "ملء الشاشة"}</span>
                </button>

                {isAqeeqDriveVideo(sourceUrl) ? (
                  <a
                    href={getAqeeqDriveFallbackUrl(sourceUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl border border-white/15 bg-white/5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:border-amber-300 hover:bg-amber-400/10 hover:text-amber-300 active:scale-95"
                    title="فتح في Google Drive"
                  >
                    <ExternalLink size={13} />
                    <span className="hidden sm:inline">فتح في Drive</span>
                  </a>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    if (document.fullscreenElement) {
                      document.exitFullscreen?.().catch(() => {});
                    }
                    setOpen(false);
                  }}
                  className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl border border-white/20 text-slate-200 transition hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950 active:scale-95"
                  aria-label="إغلاق"
                  title="إغلاق"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// تصدير كاسم بديل للتوافق الخلفي
export const AqeeqVideoPoster = AqeeqVideoPlayer;
