import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getAqeeqDriveFallbackUrl, getAqeeqDriveFileId, getAqeeqDrivePreviewUrl, getAqeeqDriveThumbnailUrl, isAqeeqDriveVideo } from "@/lib/aqeeqAlbumMedia";
import { ExternalLink, Play, RefreshCw, X } from "lucide-react";
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

      {/* Tube Modal Player — سينما عقيق المنبثقة */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] max-w-5xl overflow-hidden rounded-[1.6rem] sm:rounded-[2rem] border border-amber-300/30 bg-[#070a10] p-0 text-right text-white shadow-[0_32px_100px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <div dir="rtl">
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <AqeeqUnifiedVideoFrame sourceUrl={sourceUrl} title={title} posterUrl={posterUrl} />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-white/[.08] bg-[#0c101a] px-4 py-3 sm:px-6 sm:py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-amber-50 md:text-base">{title}</p>
                <p className="mt-0.5 text-[10px] font-bold text-amber-300/70">مشغل استوديو العقيق السينمائي</p>
              </div>
              <div className="flex items-center gap-2">
                {isAqeeqDriveVideo(sourceUrl) ? (
                  <a
                    href={getAqeeqDriveFallbackUrl(sourceUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-amber-300 hover:text-amber-200 sm:inline-flex sm:items-center sm:gap-1.5"
                  >
                    <ExternalLink size={13} />
                    فتح في Drive
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[.16] text-slate-200 transition hover:border-amber-300 hover:bg-amber-300 hover:text-slate-950 active:scale-95"
                  aria-label="إغلاق"
                >
                  <X size={17} />
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
