import { useAuth } from "@/_core/hooks/useAuth";
import { AqeeqArchiveControls } from "@/components/AqeeqArchiveControls";
import { AqeeqUnifiedVideoFrame, AqeeqVideoPlayer, AqeeqVideoPoster } from "@/components/AqeeqVideoPoster";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { VisualBackground, VisualEditable, VisualIcon, VisualImage } from "@/components/VisualEditor";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { searchAndSortAqeeqContent, type AqeeqSortOption } from "@/lib/aqeeqArchiveControls";
import { getAqeeqShowcaseDisplaySource } from "@/lib/aqeeqShowcaseMedia";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { getAqeeqViewerKey } from "@/lib/aqeeqViewTracking";
import { trpc } from "@/lib/trpc";
import { ArrowUpLeft, ChevronLeft, ChevronRight, Eye, ImageIcon, Layers3, Loader2, Play, Settings2, Sparkles, X, Heart, Share2, Maximize2, Video } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";

type ShowcasePost = { id: number; mediaUrl: string; thumbnailUrl: string | null; fileName: string; mediaType: "image" | "video"; sourceType?: "drive" | "manual" | "x" | "instagram" | "youtube"; externalUrl?: string | null; title: string | null; description: string | null; viewCount: number; createdAt?: Date; media?: Array<{ id: number; mediaUrl: string; thumbnailUrl: string | null; fileName: string; mimeType: string; mediaType: "image" | "video" }> };
type ContentType = "all" | "images" | "videos" | "social";
type XWidgetsWindow = Window & { twttr?: { widgets?: { load: (element?: HTMLElement) => Promise<unknown> | void } } };

const SHOWCASE_TYPE_OPTIONS = [{ id: "all", label: "الكل" }, { id: "images", label: "الصور" }, { id: "videos", label: "الفيديوهات" }, { id: "social", label: "السوشيال ميديا" }] as const;
const isSocialPost = (post: ShowcasePost) => ["x", "instagram", "youtube"].includes(post.sourceType || "drive");
const matchesContentType = (post: ShowcasePost, type: ContentType) => type === "all" || type === "social" ? (type === "all" ? true : isSocialPost(post)) : !isSocialPost(post) && post.mediaType === (type === "images" ? "image" : "video");

function ShowcaseMedia({ post, className = "", playing = false }: { post: ShowcasePost; className?: string; playing?: boolean }) { if (post.mediaType === "image") return <img src={getAqeeqShowcaseDisplaySource(post)} alt={post.title || post.fileName} className={`block h-auto w-full ${className}`} loading="lazy" />; if (playing) return <div className={className}><AqeeqUnifiedVideoFrame sourceUrl={post.mediaUrl} title={post.title || post.fileName} /></div>; return <AqeeqVideoPoster sourceUrl={post.mediaUrl} posterUrl={getAqeeqShowcaseDisplaySource(post)} title={post.title || post.fileName.replace(/\.[^.]+$/, "")} className={className} interactive={false} />; }
function ShowcaseHeroCover({ post, className = "" }: { post: ShowcasePost; className?: string }) { return <VisualImage id={`showcase-hero-cover-${post.id}`} label="صورة غلاف الأخبار والعروض" src={getAqeeqShowcaseDisplaySource(post)} alt={post.title || post.fileName} className={`block h-full w-full object-cover ${className}`} />; }

import { FastInstagramEmbed, XEmbed } from "@/components/AqeeqAlbumSocialEmbed";

function XPostEmbed({ post, dark }: { post: ShowcasePost; dark: boolean }) {
  const xPostUrl = post.externalUrl || post.mediaUrl;
  return <XEmbed url={xPostUrl} title={post.title || post.fileName} dark={dark} />;
}
function InstagramPostEmbed({ post }: { post: ShowcasePost }) {
  const postUrl = post.externalUrl || post.mediaUrl;
  return <FastInstagramEmbed url={postUrl} title={post.title || post.fileName} />;
}
function YouTubePostEmbed({ post }: { post: ShowcasePost }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const postUrl = post.externalUrl || post.mediaUrl;
  const ytMatch = postUrl.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  const ytThumbnail = ytMatch && ytMatch[1] ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` : null;
  const poster = getAqeeqShowcaseDisplaySource(post) || ytThumbnail;

  if (isPlaying) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <AqeeqUnifiedVideoFrame
          sourceUrl={postUrl}
          title={post.title || post.fileName}
          posterUrl={poster}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsPlaying(true)}
      className="group/yt relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl bg-black"
    >
      {poster ? (
        <img
          src={poster}
          alt={post.title || post.fileName}
          className="h-full w-full object-cover transition duration-700 group-hover/yt:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-red-950/40 via-black to-slate-950" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-[0_0_30px_rgba(225,29,72,0.8)] ring-4 ring-white/30 transition-all duration-300 group-hover/yt:scale-110 group-hover/yt:shadow-[0_0_45px_rgba(244,63,94,0.9)]">
          <Play size={22} className="mr-0.5 fill-current" />
        </div>
      </div>
    </div>
  );
}

function getVideoEmbedUrl(url: string | undefined | null): string {
  if (!url) return "";
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&enablejsapi=1`;
  }
  const driveMatch = url.match(/\/file\/d\/([A-Za-z0-9_-]+)/) || url.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  return url;
}

function isEmbeddableVideo(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("drive.google.com");
}

function ViewCount({ post }: { post: ShowcasePost }) {
  return (
    <VisualEditable
      id={`showcase-card-views-${post.id}`}
      tag="text"
      label={`عدد مشاهدات ${post.title || post.fileName}`}
      defaultText={`${post.viewCount || 0} مشاهدة`}
      as="span"
      className="inline-flex items-center gap-1 text-[11px] font-black text-slate-400"
    >
      <Eye size={13} />
      <span>{post.viewCount || 0}</span>
    </VisualEditable>
  );
}

function MediaPostCard({
  post,
  watermarkUrl,
  watermarkScale,
  watermarkOpacity,
  onOpen,
  dark,
}: {
  post: ShowcasePost;
  watermarkUrl: string | null;
  watermarkScale: number;
  watermarkOpacity: number;
  onOpen: () => void;
  dark: boolean;
}) {
  const groupItems = post.media?.length ? post.media : [post];
  const hasMultiple = groupItems.length > 1;
  const [groupOpen, setGroupOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlayingInline, setIsPlayingInline] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.viewCount ? Math.floor(post.viewCount / 3) + 7 : 18);

  const active = groupItems[activeIndex] || groupItems[0];
  const isVideo = post.mediaType === "video" || isEmbeddableVideo(post.mediaUrl);

  const openPost = () => {
    if (hasMultiple) {
      setActiveIndex(0);
      setGroupOpen(true);
    } else {
      onOpen();
    }
  };

  const move = (direction: -1 | 1) =>
    setActiveIndex((index) => Math.max(0, Math.min(groupItems.length - 1, index + direction)));

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) {
      setLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
    } else {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
      toast.success("شكراً لتفاعلك وإعجابك! ❤️");
    }
  };

  // 1) VIDEO CARD (لون الإنديجو والسيان الفاخر 🎬)
  if (isVideo) {
    return (
      <>
        <article
          className={`mb-6 break-inside-avoid overflow-hidden rounded-[2rem] border p-4 sm:p-5 transition duration-300 hover:-translate-y-1 ${
            dark
              ? "border-indigo-500/40 bg-gradient-to-b from-[#100d28] via-[#090b14] to-[#04060c] text-white shadow-[0_16px_45px_rgba(99,102,241,0.18)] hover:border-indigo-400/80 hover:shadow-[0_20px_60px_rgba(99,102,241,0.3)]"
              : "border-indigo-300 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 text-slate-900 shadow-[0_16px_40px_rgba(99,102,241,0.1)] hover:border-indigo-500"
          }`}
        >
          {/* Top Bar Header inside Card */}
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5 mb-3.5">
            <div className="flex items-center gap-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-indigo-600 text-white shadow-sm">
                <Video size={12} />
              </span>
              <span className="text-[11px] font-black text-indigo-400">تغطية مرئية 4K</span>
            </div>
            <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[9px] font-black text-indigo-300 border border-indigo-500/30">
              فيديو
            </span>
          </div>

          {/* 16:9 Cinema Box Screen with Dynamic Height for Full Controls */}
          <div
            className={`relative w-full rounded-2xl overflow-hidden bg-black border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-500 ${
              isPlayingInline ? "h-[290px] sm:h-[330px]" : "aspect-video"
            }`}
          >
            {isPlayingInline ? (
              <AqeeqUnifiedVideoFrame
                sourceUrl={post.mediaUrl}
                title={post.title || post.fileName}
                posterUrl={getAqeeqShowcaseDisplaySource(post)}
              />
            ) : (
              <div
                onClick={() => setIsPlayingInline(true)}
                className="group/screen relative h-full w-full cursor-pointer overflow-hidden"
              >
                <img
                  src={getAqeeqShowcaseDisplaySource(post)}
                  alt=""
                  className="h-full w-full object-cover transition duration-700 group-hover/screen:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                {/* Centered Glowing Play Button */}
                <div className="absolute inset-0 grid place-items-center">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.8)] ring-4 ring-white/30 transition-all duration-300 group-hover/screen:scale-110 group-hover/screen:shadow-[0_0_45px_rgba(6,182,212,0.9)]">
                    <Play size={22} className="mr-0.5 fill-current" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="p-2 pt-3.5">
            <VisualEditable
              id={`showcase-card-title-${post.id}`}
              tag="text"
              label={`عنوان ${post.fileName}`}
              defaultText={post.title || post.fileName.replace(/\.[^.]+$/, "")}
              as="p"
              className={`truncate text-base font-black ${dark ? "text-white" : "text-slate-900"}`}
            />
            {post.description ? (
              <VisualEditable
                id={`showcase-card-description-${post.id}`}
                tag="text"
                label={`وصف ${post.fileName}`}
                defaultText={post.description}
                as="p"
                className={`mt-1.5 line-clamp-2 text-xs leading-6 ${dark ? "text-slate-400" : "text-slate-600"}`}
              />
            ) : (
              <p className="mt-1 text-xs font-bold text-indigo-400/80">من أخبار وعروض العقيق</p>
            )}
          </div>

          {/* Bottom Action Capsule */}
          <div
            className={`mt-3 flex items-center justify-between rounded-xl border p-2 backdrop-blur-md ${
              dark ? "border-indigo-500/20 bg-black/40" : "border-indigo-200 bg-white shadow-sm"
            }`}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLike}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-black transition active:scale-95 ${
                  liked
                    ? "bg-rose-500/20 text-rose-400"
                    : "text-slate-400 hover:text-rose-400"
                }`}
                title="إعجاب"
              >
                <Heart size={12} className={liked ? "fill-rose-500 text-rose-500" : ""} />
                <span>{likeCount}</span>
              </button>
              <ViewCount post={post} />
            </div>

            <button
              onClick={onOpen}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 text-[11px] font-black shadow-sm transition active:scale-95"
            >
              <span>عرض كامل</span>
              <ArrowUpLeft size={13} />
            </button>
          </div>
        </article>
      </>
    );
  }

  // 2) PHOTO / GALLERY CARD (لون الذهبي والعنبر الفاخر 📸)
  return (
    <>
      <article
        className={`mb-6 break-inside-avoid overflow-hidden rounded-[2rem] border p-4 sm:p-5 transition duration-300 hover:-translate-y-1 ${
          dark
            ? "border-amber-500/35 bg-gradient-to-b from-[#181300] via-[#0e0c04] to-[#050401] text-white shadow-[0_16px_45px_rgba(245,158,11,0.15)] hover:border-amber-400/80 hover:shadow-[0_20px_60px_rgba(245,158,11,0.25)]"
            : "border-amber-300 bg-gradient-to-b from-amber-50/70 via-white to-slate-50 text-slate-900 shadow-[0_16px_40px_rgba(245,158,11,0.08)] hover:border-amber-500"
        }`}
      >
        {/* Top Bar Header inside Card */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5 mb-3.5">
          <div className="flex items-center gap-1.5">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-amber-500 text-black shadow-sm">
              <ImageIcon size={12} />
            </span>
            <span className="text-[11px] font-black text-amber-400">معرض صور HD</span>
          </div>
          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[9px] font-black text-amber-300 border border-amber-500/30">
            {hasMultiple ? `${groupItems.length} صور` : "صورة"}
          </span>
        </div>

        {/* Media Frame Screen */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
          <button onClick={openPost} className="group/screen relative block h-full w-full overflow-hidden bg-black text-right">
            {hasMultiple ? (
              <div className="grid grid-cols-2 gap-0.5 h-full w-full bg-black">
                {groupItems.slice(0, 4).map((item, index) => (
                  <div key={item.id} className="relative h-full w-full overflow-hidden">
                    <img
                      src={getAqeeqShowcaseDisplaySource(item)}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition duration-500 group-hover/screen:scale-105"
                      loading="lazy"
                    />
                    {index === 3 && groupItems.length > 4 ? (
                      <span className="absolute inset-0 grid place-items-center bg-black/70 text-lg font-black text-amber-300">
                        +{groupItems.length - 4}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <img
                src={getAqeeqShowcaseDisplaySource(post)}
                alt=""
                className="h-full w-full object-cover transition duration-700 group-hover/screen:scale-105"
                loading="lazy"
              />
            )}
            {watermarkUrl ? (
              <img
                src={watermarkUrl}
                alt=""
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 object-contain brightness-0 invert"
                style={{
                  width: `${Math.min(90, Math.max(20, watermarkScale || 42))}%`,
                  opacity: (watermarkOpacity || 12) / 100,
                }}
              />
            ) : null}
          </button>
        </div>

        {/* Title & Description */}
        <div className="p-2 pt-3.5">
          <VisualEditable
            id={`showcase-card-title-${post.id}`}
            tag="text"
            label={`عنوان ${post.fileName}`}
            defaultText={post.title || post.fileName.replace(/\.[^.]+$/, "")}
            as="p"
            className={`truncate text-base font-black ${dark ? "text-white" : "text-slate-900"}`}
          />
          {post.description ? (
            <VisualEditable
              id={`showcase-card-description-${post.id}`}
              tag="text"
              label={`وصف ${post.fileName}`}
              defaultText={post.description}
              as="p"
              className={`mt-1.5 line-clamp-2 text-xs leading-6 ${dark ? "text-slate-400" : "text-slate-600"}`}
            />
          ) : (
            <p className="mt-1 text-xs font-bold text-amber-400/80">من أخبار وعروض العقيق</p>
          )}
        </div>

        {/* Bottom Action Capsule */}
        <div
          className={`mt-3 flex items-center justify-between rounded-xl border p-2 backdrop-blur-md ${
            dark ? "border-amber-500/20 bg-black/40" : "border-amber-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-black transition active:scale-95 ${
                liked
                  ? "bg-rose-500/20 text-rose-400"
                  : "text-slate-400 hover:text-rose-400"
              }`}
              title="إعجاب"
            >
              <Heart size={12} className={liked ? "fill-rose-500 text-rose-500" : ""} />
              <span>{likeCount}</span>
            </button>
            <ViewCount post={post} />
          </div>

          <button
            onClick={openPost}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black px-2.5 py-1 text-[11px] font-black shadow-sm transition active:scale-95"
          >
            <span>{hasMultiple ? "فتح الألبوم" : "عرض كامل"}</span>
            <ArrowUpLeft size={13} />
          </button>
        </div>
      </article>

      {/* Lightbox / Group Modal */}
      <Dialog open={groupOpen} onOpenChange={setGroupOpen}>
        <DialogContent
          className={`max-h-[94svh] max-w-5xl overflow-y-auto p-0 text-right ${
            dark ? "border-amber-500/30 bg-black text-white" : "border-black/10 bg-white text-black"
          }`}
        >
          <DialogTitle className="sr-only">{post.title || "مجموعة وسائط"}</DialogTitle>
          <div dir="rtl">
            <div className="relative bg-black">
              {active?.mediaType === "video" ? (
                <AqeeqUnifiedVideoFrame sourceUrl={active.mediaUrl} title={active.fileName || post.title || "فيديو"} />
              ) : (
                <ShowcaseMedia post={active as ShowcasePost} className="max-h-[74svh] object-contain" />
              )}
              {groupItems.length > 1 ? (
                <>
                  <button
                    onClick={() => move(-1)}
                    disabled={activeIndex === 0}
                    className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white disabled:opacity-30"
                  >
                    <ChevronRight size={22} />
                  </button>
                  <button
                    onClick={() => move(1)}
                    disabled={activeIndex === groupItems.length - 1}
                    className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white disabled:opacity-30"
                  >
                    <ChevronLeft size={22} />
                  </button>
                </>
              ) : null}
            </div>
            <div className="p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className={`text-xl font-black ${dark ? "text-white" : "text-black"}`}>
                    {post.title || post.fileName.replace(/\.[^.]+$/, "")}
                  </h3>
                  {post.description ? (
                    <p className={`mt-3 max-w-2xl text-sm leading-8 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                      {post.description}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black ${
                    dark ? "border-amber-400/30 text-amber-300" : "border-amber-500/20 text-amber-800"
                  }`}
                >
                  {activeIndex + 1} / {groupItems.length}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// 3) SOCIAL MEDIA CARD (لون الوردي والأرجواني الموثق 📱)
function SocialPostCard({ post, onOpen, dark }: { post: ShowcasePost; onOpen: () => void; dark: boolean }) {
  const postUrl = post.externalUrl || post.mediaUrl;
  const isInstagram = post.sourceType === "instagram";
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.viewCount ? Math.floor(post.viewCount / 2) + 14 : 29);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) {
      setLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
    } else {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
      toast.success("شكراً لتفاعلك! ❤️");
    }
  };

  return (
    <article
      className={`mb-6 break-inside-avoid overflow-hidden rounded-[2rem] border p-4 sm:p-5 transition duration-300 hover:-translate-y-1 ${
        dark
          ? "border-violet-500/40 bg-gradient-to-b from-[#150926] via-[#0d0718] to-[#04020a] text-white shadow-[0_16px_45px_rgba(139,92,246,0.18)] hover:border-violet-400/80 hover:shadow-[0_20px_60px_rgba(139,92,246,0.28)]"
          : "border-violet-300 bg-gradient-to-b from-violet-50/70 via-white to-slate-50 text-slate-900 shadow-[0_16px_40px_rgba(139,92,246,0.08)] hover:border-violet-500"
      }`}
    >
      {/* Top Bar Header inside Card */}
      <div className="flex items-center justify-between border-b border-violet-500/20 pb-2.5 mb-3.5">
        <div className="flex items-center gap-1.5">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-r from-violet-600 to-rose-600 text-white shadow-sm">
            <Share2 size={12} />
          </span>
          <span className="text-[11px] font-black text-violet-400">
            {post.sourceType === "x" ? "منصة 𝕏 الرسمية" : isInstagram ? "إنستغرام العقيق" : "يوتيوب العقيق"}
          </span>
        </div>
        <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[9px] font-black text-violet-300 border border-violet-500/30">
          {post.sourceType === "x" ? "X" : isInstagram ? "Instagram" : "YouTube"}
        </span>
      </div>

      {/* Embed Frame */}
      <div className="overflow-hidden rounded-2xl border border-violet-500/30 bg-black">
        {post.sourceType === "x" ? (
          <XPostEmbed post={post} dark={dark} />
        ) : isInstagram ? (
          <InstagramPostEmbed post={post} />
        ) : (
          <YouTubePostEmbed post={post} />
        )}
      </div>

      {/* Title & Description */}
      <div className="p-2 pt-3.5">
        <VisualEditable
          id={`showcase-social-title-${post.id}`}
          tag="text"
          label={`عنوان ${post.fileName}`}
          defaultText={post.title || post.fileName}
          as="p"
          className={`truncate text-base font-black ${dark ? "text-white" : "text-slate-900"}`}
        />
        {post.description ? (
          <VisualEditable
            id={`showcase-social-description-${post.id}`}
            tag="text"
            label={`وصف ${post.fileName}`}
            defaultText={post.description}
            as="p"
            className={`mt-1.5 line-clamp-2 text-xs leading-6 ${dark ? "text-slate-400" : "text-slate-600"}`}
          />
        ) : (
          <p className="mt-1 text-xs font-bold text-violet-400/80">من أخبار وعروض العقيق</p>
        )}
      </div>

      {/* Bottom Action Capsule */}
      <div
        className={`mt-3 flex items-center justify-between rounded-xl border p-2 backdrop-blur-md ${
          dark ? "border-violet-500/20 bg-black/40" : "border-violet-200 bg-white shadow-sm"
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLike}
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-black transition active:scale-95 ${
              liked
                ? "bg-rose-500/20 text-rose-400"
                : "text-slate-400 hover:text-rose-400"
            }`}
            title="إعجاب"
          >
            <Heart size={12} className={liked ? "fill-rose-500 text-rose-500" : ""} />
            <span>{likeCount}</span>
          </button>
          <ViewCount post={post} />
        </div>

        <a
          onClick={onOpen}
          href={postUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-500 hover:to-rose-500 text-white px-2.5 py-1 text-[11px] font-black shadow-sm transition active:scale-95"
        >
          <span>فتح المصدر</span>
          <ArrowUpLeft size={13} />
        </a>
      </div>
    </article>
  );
}

function UnifiedShowcaseHero({
  showcase,
  posts,
  customPostId,
  secondaryPostId,
  customTag,
  customTitle,
  customSubtitle,
  customDesc,
  soundEnabled,
  isAdmin,
  onExplore,
  onSound,
  onOpenStudio,
  dark,
}: {
  showcase: { title: string; intro: string | null; backgroundAudioUrl: string | null };
  posts: ShowcasePost[];
  customPostId?: number | null;
  secondaryPostId?: number | null;
  customTag?: string | null;
  customTitle?: string | null;
  customSubtitle?: string | null;
  customDesc?: string | null;
  soundEnabled: boolean;
  isAdmin: boolean;
  onExplore: () => void;
  onSound: () => void;
  onOpenStudio: () => void;
  dark: boolean;
}) {
  const visualPosts = posts.filter((post) => !isSocialPost(post));
  const newestPost = (customPostId ? visualPosts.find((p) => p.id === customPostId) : undefined) || visualPosts[0];
  const previousPost = (secondaryPostId ? visualPosts.find((p) => p.id === secondaryPostId) : undefined) || visualPosts.find((p) => p.id !== newestPost?.id) || newestPost;
  const imageCount = visualPosts.filter((post) => post.mediaType === "image").length;
  const videoCount = visualPosts.filter((post) => post.mediaType === "video").length;
  const socialCount = posts.filter(isSocialPost).length;

  return (
    <VisualEditable id="showcase-hero-section" tag="section" label="غلاف الأخبار والعروض" as="section" className={`relative isolate overflow-hidden border-b ${
      dark ? "border-white/[0.08] bg-black text-white" : "border-black/[0.06] bg-white text-black"
    }`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_18%,rgba(248,202,20,0.12),transparent_25%)]" />
      <div className="relative mx-auto grid max-w-[1380px] items-center gap-8 px-4 sm:px-6 md:px-8 py-12 md:grid-cols-[minmax(390px,.9fr)_minmax(0,1.1fr)] md:py-16 lg:gap-16">
        <div className="relative order-2 mx-auto h-[370px] w-full max-w-[580px] md:order-1 md:h-[470px]">
          {previousPost ? (
            <div className={`absolute left-[8%] top-[9%] h-[75%] w-[56%] overflow-hidden rounded-[1.6rem] border p-2 opacity-60 shadow-2xl ${
              dark ? "border-white/[0.1] bg-[#111111]" : "border-black/[0.08] bg-[#f0f0f0]"
            }`} style={{ transform: "rotate(-7deg)" }}>
              <VisualBackground id={`showcase-hero-previous-cover-${previousPost.id}`} label="الصورة الخلفية لغلاف الأخبار والعروض" src={getAqeeqShowcaseDisplaySource(previousPost)} alt="" className="h-full w-full rounded-[1.12rem]" />
            </div>
          ) : null}
          <div className={`group absolute bottom-1 right-[8%] aspect-[3/4] w-[56%] overflow-hidden rounded-[1.85rem] border p-2 shadow-2xl ${
            dark ? "border-[#f8ca14]/50 bg-[#111111]" : "border-[#08467d]/30 bg-white"
          }`} style={{ transform: "rotate(3deg)" }}>
            <div className="relative h-full overflow-hidden rounded-[1.35rem]">
              {newestPost ? (
                <ShowcaseHeroCover post={newestPost} className="transition duration-700 group-hover:scale-[1.03]" />
              ) : (
                <div className={`grid h-full place-items-center ${dark ? "bg-[#181818] text-[#f8ca14]" : "bg-slate-100 text-[#08467d]"}`}>
                  <VisualIcon id="showcase-cover-empty-icon" label="أيقونة غلاف الأخبار الفارغ" icon="sparkles" size={42} />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/45 to-transparent px-4 pb-4 pt-16">
                <span className="text-[10px] font-black text-[#f8ca14]">{posts.length} منشور</span>
                <VisualEditable id="showcase-cover-title" tag="text" label="عنوان غلاف الأخبار" defaultText={showcase.title} as="h2" className="mt-1 text-lg font-black text-white" />
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <VisualEditable id="showcase-hero-kicker" tag="text" label="شارة الأخبار والعروض" defaultText={customTag || "العقيق · الأخبار والعروض"} as="div" className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black ${
            dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
          }`}>
            <VisualIcon id="showcase-hero-kicker-icon" label="أيقونة شارة الأخبار" icon="sparkles" size={14} />{customTag || "العقيق · الأخبار والعروض"}
          </VisualEditable>
          <VisualEditable id="showcase-hero-title" tag="text" label="السطر الأول لعنوان الأخبار والعروض" defaultText={customTitle || showcase.title} as="h1" className={`mt-5 text-4xl font-black leading-[1.12] md:text-6xl ${dark ? "text-white" : "text-black"}`} />
          <VisualEditable id="showcase-hero-subtitle" tag="text" label="السطر الذهبي لعنوان الأخبار والعروض" defaultText={customSubtitle || "كل جديد، أولًا بأول."} as="h1" className={`text-4xl font-black leading-[1.12] md:text-6xl ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} />
          <VisualEditable id="showcase-hero-intro" tag="text" label="مقدمة الأخبار والعروض" defaultText={customDesc || showcase.intro || "رفوف رقمية تجمع صور وفيديوهات أنشطة مدارس العقيق وعروضها، وكل منشور يفتح في تجربته المناسبة."} as="p" className={`mt-5 max-w-xl text-sm leading-8 ${dark ? "text-slate-300" : "text-slate-600"}`} />
          <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-bold">
            <span className={`rounded-full border px-3 py-2 ${
              dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
            }`}>
              <VisualIcon id="showcase-image-count-icon" label="أيقونة عدد الصور" icon="image" className={`ml-1 inline ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />{imageCount} صورة
            </span>
            <span className={`rounded-full border px-3 py-2 ${
              dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
            }`}>
              <VisualIcon id="showcase-video-count-icon" label="أيقونة عدد الفيديوهات" icon="video" className={`ml-1 inline ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />{videoCount} فيديو
            </span>
            {socialCount ? (
              <span className={`rounded-full border px-3 py-2 ${
                dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
              }`}>
                <VisualIcon id="showcase-social-count-icon" label="أيقونة عدد منشورات السوشيال" icon="share" className={`ml-1 inline ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />{socialCount} سوشيال
              </span>
            ) : null}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <VisualEditable id="showcase-explore-action" tag="button" label="زر استكشاف الأخبار" defaultText="استكشف الجديد" as="button" onAction={onExplore} className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-black shadow-lg transition active:scale-95 hover:opacity-90 ${
              dark ? "!bg-[#f8ca14] !text-black shadow-[0_0_20px_rgba(248,202,20,0.3)]" : "!bg-[#08467d] !text-white shadow-[0_0_20px_rgba(8,70,125,0.2)]"
            }`}>
              <VisualIcon id="showcase-explore-icon" label="أيقونة زر استكشاف الأخبار" icon="external" size={16} />استكشف الجديد
            </VisualEditable>
            {isAdmin ? (
              <VisualEditable id="showcase-studio-action" tag="button" label="زر دخول استوديو الأخبار" defaultText="دخول استوديو الأخبار والعروض" as="button" onAction={onOpenStudio} className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-xs font-black transition ${
                dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
              }`}>
                <VisualIcon id="showcase-studio-action-icon" label="أيقونة دخول استوديو الأخبار" icon="menu" size={16} />دخول استوديو الأخبار والعروض
              </VisualEditable>
            ) : null}
            {showcase.backgroundAudioUrl ? (
              <VisualEditable id="showcase-sound-action" tag="button" label="زر موسيقى الأخبار" defaultText={soundEnabled ? "إيقاف الموسيقى" : "تشغيل الموسيقى"} as="button" onAction={onSound} className={`inline-flex items-center rounded-xl border px-4 py-2 text-xs font-black ${
                dark ? "border-white/[0.16] text-slate-200" : "border-black/[0.12] text-slate-800"
              }`}>
                <VisualIcon id="showcase-sound-icon" label="أيقونة موسيقى الأخبار" icon="send" className="ml-2" size={16} />{soundEnabled ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}
              </VisualEditable>
            ) : null}
          </div>
        </div>
      </div>
    </VisualEditable>
  );
}

export default function AqeeqShowcasePage() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<ShowcasePost | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<AqeeqSortOption>("newest");
  const [contentType, setContentType] = useState<ContentType>("all");
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data: showcase, isLoading: showcaseLoading } = trpc.aqeeqShowcases.publicShowcase.useQuery({ slug: "news-offers" }, { refetchOnWindowFocus: false });
  const { data: issues = [] } = trpc.schoolNews.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, { refetchOnMount: true, staleTime: 0 });
  const recordPostView = trpc.aqeeqShowcases.recordPostView.useMutation();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const posts = useMemo(() => (showcase?.posts || []) as ShowcasePost[], [showcase?.posts]);
  const visiblePosts = useMemo(() => searchAndSortAqeeqContent(posts.filter((post) => matchesContentType(post, contentType)), searchQuery, sort), [posts, contentType, searchQuery, sort]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !showcase?.backgroundAudioUrl) return;
    audio.volume = 0.38;
    void audio.play().then(() => setSoundEnabled(true)).catch(() => setSoundEnabled(false));
  }, [showcase?.id, showcase?.backgroundAudioUrl]);

  useEffect(() => {
    if (!selected) return;
    void recordPostView.mutateAsync({ id: selected.id, viewerKey: getAqeeqViewerKey() }).catch(() => undefined);
  }, [selected?.id]);

  const toggleSound = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setSoundEnabled(true);
      } catch {
        setSoundEnabled(false);
      }
    } else {
      audio.pause();
      setSoundEnabled(false);
    }
  };

  if (showcaseLoading) return <div className={`grid min-h-screen place-items-center ${dark ? "bg-black text-white" : "bg-white text-black"}`}><Loader2 className="animate-spin text-[#f8ca14]" /></div>;

  if (!showcase) {
    return (
      <main dir="rtl" className={`min-h-screen aq-public-shell ${dark ? "bg-black text-white" : "bg-white text-black"}`}>
        <AlaqeeqStudioSiteHeader title="الأخبار والعروض" active="showcase" logoUrl={issues[0]?.headerLogoUrl} />
        <section className="mx-auto max-w-3xl px-5 py-28 text-center">
          <Sparkles className={`mx-auto ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={48} />
          <h1 className={`mt-6 text-3xl font-black ${dark ? "text-white" : "text-black"}`}>الأخبار والعروض في الطريق</h1>
          {isAdmin ? <Button onClick={() => navigate("/offers/manage")} className={`mt-7 ${dark ? "bg-[#f8ca14] text-black" : "bg-[#08467d] text-white"}`}><Settings2 className="ml-2" size={16} />فتح الاستوديو</Button> : null}
        </section>
      </main>
    );
  }

  return (
    <main dir="rtl" className={`min-h-screen aq-public-shell ${dark ? "bg-black text-white" : "bg-white text-black"}`}>
      <AlaqeeqStudioSiteHeader title="الأخبار والعروض" active="showcase" logoUrl={showcase.headerLogoUrl || issues[0]?.headerLogoUrl} />
      {showcase.backgroundAudioUrl ? <audio ref={audioRef} src={showcase.backgroundAudioUrl} loop autoPlay preload="auto" onEnded={() => setSoundEnabled(false)} /> : null}
      <UnifiedShowcaseHero
        showcase={showcase}
        posts={posts}
        customPostId={orchestration?.heroCovers?.showcaseMode === "custom" ? orchestration?.heroCovers?.customShowcasePostId : undefined}
        secondaryPostId={orchestration?.heroCovers?.showcaseSecondaryPostId}
        customTag={orchestration?.heroCovers?.showcaseCustomTag}
        customTitle={orchestration?.heroCovers?.showcaseCustomTitle}
        customSubtitle={orchestration?.heroCovers?.showcaseCustomSubtitle}
        customDesc={orchestration?.heroCovers?.showcaseCustomDesc}
        soundEnabled={soundEnabled}
        isAdmin={isAdmin}
        onExplore={() => document.getElementById("aqeeq-showcase-feed")?.scrollIntoView({ behavior: "smooth" })}
        onSound={() => void toggleSound()}
        onOpenStudio={() => navigate("/offers/manage")}
        dark={dark}
      />
      <section id="aqeeq-showcase-feed" className="mx-auto max-w-[1380px] px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div className={`mb-8 flex flex-wrap items-end justify-between gap-4 border-b pb-5 ${dark ? "border-white/[0.08]" : "border-black/[0.08]"}`}>
          <div>
            <p className={`text-[10px] font-black tracking-[0.18em] ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>THE AQEEQ FEED</p>
            <h2 className={`mt-2 text-3xl font-black ${dark ? "text-white" : "text-black"}`}>آخر <span className={dark ? "text-[#f8ca14]" : "text-[#08467d]"}>الأخبار والعروض.</span></h2>
          </div>
          <span className={`rounded-full border px-3 py-1.5 text-xs font-black ${
            dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
          }`}>{visiblePosts.length} من {posts.length} منشور</span>
        </div>
        <AqeeqArchiveControls id="showcase-archive-controls" label="البحث وترتيب الأخبار والعروض" query={searchQuery} onQueryChange={setSearchQuery} sort={sort} onSortChange={setSort} typeOptions={[...SHOWCASE_TYPE_OPTIONS]} activeType={contentType} onTypeChange={(value) => setContentType(value as ContentType)} />
        {visiblePosts.length ? (
          <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
            {visiblePosts.map((post) =>
              isSocialPost(post) ? (
                <SocialPostCard
                  key={`post-${post.id}-${post.sourceType}`}
                  post={post}
                  dark={dark}
                  onOpen={() => void recordPostView.mutateAsync({ id: post.id, viewerKey: getAqeeqViewerKey() }).catch(() => undefined)}
                />
              ) : (
                <MediaPostCard
                  key={`post-${post.id}-${post.sourceType}`}
                  post={post}
                  dark={dark}
                  watermarkUrl={showcase.watermarkUrl}
                  watermarkScale={showcase.watermarkScale}
                  watermarkOpacity={showcase.watermarkOpacity}
                  onOpen={() => setSelected(post)}
                />
              )
            )}
          </div>
        ) : (
          <VisualEditable id="showcase-search-empty" tag="text" label="رسالة عدم وجود نتائج للأخبار" defaultText="لا توجد أخبار أو عروض مطابقة للبحث أو الفلتر." as="p" className={`rounded-2xl border border-dashed p-10 text-center text-sm font-black ${
            dark ? "border-[#f8ca14]/30 text-[#f8ca14]" : "border-[#08467d]/30 text-[#08467d]"
          }`} />
        )}
      </section>
      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className={`max-h-[94svh] max-w-5xl overflow-y-auto p-0 text-right ${
          dark ? "border-[#f8ca14]/30 bg-black text-white" : "border-black/10 bg-white text-black"
        }`}>
          <DialogTitle className="sr-only">{selected?.title || selected?.fileName || "عرض الوسيط"}</DialogTitle>
          {selected ? (
            <div dir="rtl">
              <div className="relative bg-black">
                {selected.mediaType === "video" ? <ShowcaseMedia post={selected} className="aspect-video object-contain" playing /> : <ShowcaseMedia post={selected} className="max-h-[74svh] object-contain" />}
              </div>
              <div className="p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={`text-xl font-black ${dark ? "text-white" : "text-black"}`}>{selected.title || selected.fileName.replace(/\.[^.]+$/, "")}</h3>
                    {selected.description ? <p className={`mt-3 max-w-2xl text-sm leading-8 ${dark ? "text-slate-300" : "text-slate-600"}`}>{selected.description}</p> : null}
                  </div>
                  <button onClick={() => setSelected(null)} className={`rounded-xl border p-2 ${dark ? "border-white/[0.15] text-slate-300" : "border-black/[0.12] text-slate-700"}`} aria-label="إغلاق"><X size={18} /></button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}
