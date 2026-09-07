import { useAuth } from "@/_core/hooks/useAuth";
import { AqeeqArchiveControls } from "@/components/AqeeqArchiveControls";
import { AqeeqUnifiedVideoFrame, AqeeqVideoPlayer, AqeeqVideoPoster } from "@/components/AqeeqVideoPoster";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { AlaqeeqStudioSiteFooter } from "@/components/AlaqeeqStudioSiteFooter";
import { VisualBackground, VisualEditable, VisualIcon, VisualImage } from "@/components/VisualEditor";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { searchAndSortAqeeqContent, sortAqeeqContent, type AqeeqSortOption } from "@/lib/aqeeqArchiveControls";
import { getAqeeqDriveFallbackUrl, isAqeeqDriveVideo } from "@/lib/aqeeqAlbumMedia";
import { getAqeeqShowcaseDisplaySource } from "@/lib/aqeeqShowcaseMedia";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { getAqeeqViewerKey } from "@/lib/aqeeqViewTracking";
import { trpc } from "@/lib/trpc";
import { ArrowUpLeft, ChevronLeft, ChevronRight, ExternalLink, Eye, ImageIcon, Instagram, Layers3, Loader2, Play, Settings2, Sparkles, X, Heart, Share2, Maximize2, Minimize2, Video } from "lucide-react";
import { toast } from "sonner";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { AqeeqLuxuryPageShell } from "@/components/AqeeqLuxuryPageShell";
import { AqeeqGrandFinaleCta } from "@/components/AqeeqGrandFinaleCta";
import { useMagneticTilt, staggerContainer, fadeUpSpring } from "@/lib/motionPresets";
import { motion } from "framer-motion";
import { NewsScrollPortalBackdrop } from "@/components/ui/news-scroll-portal-backdrop";
import { ParallaxUnfurlingGallery, type UnfurlingItem } from "@/components/ui/3d-parallax-unfurling-gallery";

type ShowcasePost = { id: number; mediaUrl: string; thumbnailUrl: string | null; fileName: string; mediaType: "image" | "video"; sourceType?: "drive" | "manual" | "x" | "instagram" | "youtube"; externalUrl?: string | null; title: string | null; description: string | null; viewCount: number; createdAt?: Date; media?: Array<{ id: number; mediaUrl: string; thumbnailUrl: string | null; fileName: string; mimeType: string; mediaType: "image" | "video" }> };
type ContentType = "all" | "images" | "videos" | "social";
type XWidgetsWindow = Window & { twttr?: { widgets?: { load: (element?: HTMLElement) => Promise<unknown> | void } } };

const SHOWCASE_TYPE_OPTIONS = [{ id: "all", label: "الكل" }, { id: "images", label: "الصور" }, { id: "videos", label: "الفيديوهات" }, { id: "social", label: "السوشيال ميديا" }] as const;
const isSocialPost = (post: ShowcasePost) => ["x", "instagram", "youtube"].includes(post.sourceType || "drive");
const matchesContentType = (post: ShowcasePost, type: ContentType) => type === "all" || type === "social" ? (type === "all" ? true : isSocialPost(post)) : !isSocialPost(post) && post.mediaType === (type === "images" ? "image" : "video");

function ShowcaseMedia({ post, className = "", playing = false }: { post: ShowcasePost; className?: string; playing?: boolean }) { if (post.mediaType === "image") return <img src={getAqeeqShowcaseDisplaySource(post)} alt={post.title || post.fileName} className={`block h-auto w-full ${className}`} loading="lazy" />; if (playing) return <div className={className}><AqeeqUnifiedVideoFrame sourceUrl={post.mediaUrl} title={post.title || post.fileName} /></div>; return <AqeeqVideoPoster sourceUrl={post.mediaUrl} posterUrl={getAqeeqShowcaseDisplaySource(post)} title={post.title || post.fileName.replace(/\.[^.]+$/, "")} className={className} interactive={false} />; }
function ShowcaseHeroCover({ post, className = "" }: { post: ShowcasePost; className?: string }) {
  const src = getAqeeqShowcaseDisplaySource(post);

  if (src) {
    return (
      <VisualImage
        id={`showcase-hero-cover-${post.id}`}
        label="صورة غلاف الأخبار والعروض"
        src={src}
        alt={post.title || post.fileName}
        className={`block h-full w-full object-cover ${className}`}
      />
    );
  }

  // Luxury Branded Social Fallback Card when no image is available
  const isX = post.sourceType === "x";
  const isIg = post.sourceType === "instagram";

  return (
    <div className={`relative flex h-full w-full flex-col justify-between p-6 text-right overflow-hidden ${
      isX
        ? "bg-gradient-to-br from-[#0c1322] via-[#05080e] to-black text-white"
        : isIg
        ? "bg-gradient-to-br from-[#280c2e] via-[#120516] to-[#040008] text-white"
        : "bg-gradient-to-br from-[#2b0c0c] via-[#130404] to-black text-white"
    } ${className}`}>
      {/* Ambient background glow */}
      <div className={`pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full blur-3xl opacity-35 ${
        isX ? "bg-[#08467d]" : isIg ? "bg-[#e1306c]" : "bg-red-600"
      }`} />
      <div className={`pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full blur-3xl opacity-25 ${
        isX ? "bg-[#f8ca14]" : isIg ? "bg-[#fd1d1d]" : "bg-amber-500"
      }`} />

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black backdrop-blur-md ${
          isX
            ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
            : isIg
            ? "border-pink-500/30 bg-pink-500/10 text-pink-300"
            : "border-red-500/30 bg-red-500/10 text-red-300"
        }`}>
          {isX ? "منشور 𝕏 الرسمي" : isIg ? "إنستغرام العقيق" : "يوتيوب العقيق"}
        </span>
        <div className={`grid h-10 w-10 place-items-center rounded-2xl border shadow-lg ${
          isX
            ? "border-white/20 bg-black/80 text-white"
            : isIg
            ? "border-pink-500/30 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white p-0.5"
            : "border-red-500/30 bg-red-600 text-white"
        }`}>
          {isX ? (
            <span className="text-lg font-black leading-none">𝕏</span>
          ) : isIg ? (
            <div className="grid h-full w-full place-items-center rounded-[0.8rem] bg-black">
              <Instagram size={18} />
            </div>
          ) : (
            <Play size={18} fill="currentColor" />
          )}
        </div>
      </div>

      {/* Center Content / Typography */}
      <div className="relative z-10 my-auto py-4">
        <span className="text-[10px] font-black tracking-wider text-slate-400">تغطية موثقة من العقيق</span>
        <h3 className="mt-2 text-lg sm:text-xl font-black leading-snug line-clamp-3 text-white">
          {post.title || post.fileName.replace(/\.[^.]+$/, "")}
        </h3>
        {post.description ? (
          <p className="mt-2 line-clamp-3 text-xs leading-6 text-slate-300/90 font-medium">
            {post.description}
          </p>
        ) : null}
      </div>

      {/* Bottom Footer Handle */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-black text-slate-400">
        <span>@alaqeeq_school</span>
        <span className="text-[#f8ca14]">مدارس العقيق ✦</span>
      </div>
    </div>
  );
}

import { FastInstagramEmbed, XEmbed } from "@/components/AqeeqAlbumSocialEmbed";

const XPostEmbed = React.memo(function XPostEmbed({ post, dark }: { post: ShowcasePost; dark: boolean }) {
  const xPostUrl = post.externalUrl || post.mediaUrl;
  return <XEmbed url={xPostUrl} title={post.title || post.fileName} dark={dark} />;
});

const InstagramPostEmbed = React.memo(function InstagramPostEmbed({ post }: { post: ShowcasePost }) {
  const postUrl = post.externalUrl || post.mediaUrl;
  return <FastInstagramEmbed url={postUrl} title={post.title || post.fileName} />;
});
function YouTubePostEmbed({ post }: { post: ShowcasePost }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const postUrl = post.externalUrl || post.mediaUrl;
  const ytMatch = postUrl.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  const ytId = ytMatch?.[1];

  // Fallback chain: maxres → sd → hq → mq
  const ytThumbs = ytId ? [
    `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${ytId}/sddefault.jpg`,
    `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`,
  ] : [];

  const poster = getAqeeqShowcaseDisplaySource(post) || ytThumbs[0] || null;

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const currentIdx = ytThumbs.indexOf(img.src);
    const next = ytThumbs[currentIdx + 1];
    if (next) img.src = next;
  };

  if (isPlaying) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black">
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
      className="group/yt relative h-full w-full cursor-pointer overflow-hidden rounded-2xl bg-black"
    >
      {poster ? (
        <>
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover blur-xl scale-125 opacity-40"
          />
          <img
            src={poster}
            alt={post.title || post.fileName}
            className="relative h-full w-full object-cover transition duration-700 group-hover/yt:scale-105"
            onError={handleImgError}
          />
        </>
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-red-950/40 via-black to-slate-950" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-tr from-red-600 to-[#de191e] text-white shadow-[0_0_30px_rgba(225,29,72,0.8)] ring-4 ring-white/30 transition-all duration-300 group-hover/yt:scale-110 group-hover/yt:shadow-[0_0_45px_rgba(244,63,94,0.9)]">
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
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview?rm=minimal`;
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
  const { ref, tilt, onMove, onLeave } = useMagneticTilt(6);

  const active = groupItems[activeIndex] || groupItems[0];
  const isVideo = post.mediaType === "video" || isEmbeddableVideo(post.mediaUrl);

  const mergedCaption = (() => {
    const t = (post.title || "").trim();
    const d = (post.description || "").trim();
    if (!t && !d) return post.fileName?.replace(/\.[^.]+$/, "") || "من أخبار وعروض مدارس العقيق";
    if (!t) return d;
    if (!d) return t;
    if (d.includes(t)) return d;
    if (t.includes(d)) return t;
    return `${t} ${d}`;
  })();

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
        <motion.article
          variants={fadeUpSpring}
          ref={ref}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.15s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.3s ease, border-color 0.3s ease",
          }}
          data-aqeeq-video="true"
          data-no-visual-edit="true"
          className={`group/card relative h-full flex flex-col justify-between overflow-hidden rounded-[2.2rem] border p-4 sm:p-5 transition duration-300 backdrop-blur-2xl will-change-transform ${
            dark
              ? "border-[#08467d]/40 bg-gradient-to-b from-[#06182e]/90 via-[#030d19]/90 to-[#02070e] text-white shadow-[0_16px_45px_rgba(8,70,125,0.25)] hover:border-[#f8ca14] hover:shadow-[0_22px_65px_rgba(248,202,20,0.25)]"
              : "border-[#08467d]/20 bg-white text-slate-900 shadow-[0_16px_40px_rgba(8,70,125,0.08)] hover:border-[#08467d]"
          }`}
        >
          {/* Specular glare following cursor */}
          <div
            className="pointer-events-none absolute inset-0 z-20 rounded-[2.2rem] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.14) 0%, transparent 60%)`,
            }}
          />
          {/* Top Bar Header inside Card */}
          <div className="flex items-center justify-between border-b border-[#08467d]/20 pb-2.5 mb-3.5">
            <div className="flex items-center gap-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#08467d] text-[#f8ca14] shadow-sm">
                <Video size={12} />
              </span>
              <span className={`text-[11px] font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>تغطية مرئية 4K</span>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black border ${
              dark ? "bg-[#f8ca14]/15 text-[#f8ca14] border-[#f8ca14]/30" : "bg-[#08467d]/10 text-[#08467d] border-[#08467d]/20"
            }`}>
              فيديو
            </span>
          </div>

          {/* 4:5 Portrait Cinema Box Screen */}
          <div
            onClick={openPost}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPost(); } }}
            data-aqeeq-video="true"
            data-no-visual-edit="true"
            className="group/screen relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-2xl bg-black border border-[#08467d]/30 shadow-[0_0_30px_rgba(8,70,125,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#08467d]"
          >
            {/* Ambient blur backdrop for wide/horizontal videos */}
            <img
              src={getAqeeqShowcaseDisplaySource(post)}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover blur-xl scale-125 opacity-40"
            />
            <img
              src={getAqeeqShowcaseDisplaySource(post)}
              alt=""
              loading="lazy"
              data-no-visual-edit="true"
              className="relative h-full w-full object-cover transition duration-700 group-hover/screen:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

            {/* Centered Glowing Play Button */}
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-[#08467d] text-[#f8ca14] shadow-[0_0_30px_rgba(8,70,125,0.8)] ring-4 ring-white/30 transition-all duration-300 group-hover/screen:scale-110 group-hover/screen:shadow-[0_0_45px_rgba(248,202,20,0.6)] group-active:scale-95">
                <Play size={22} className="mr-0.5 fill-current" />
              </div>
            </div>
          </div>

          {/* Continuous Caption Block (الكلام على بعضه) */}
          <div className="p-2 pt-3 flex-1 flex flex-col justify-start">
            <VisualEditable
              id={`showcase-video-caption-${post.id}`}
              tag="text"
              label={`كابشن ${post.fileName}`}
              defaultText={mergedCaption}
              as="p"
              className={`line-clamp-3 min-h-[4.25rem] text-xs sm:text-sm font-semibold leading-6 ${
                dark ? "text-slate-200" : "text-slate-800"
              }`}
            >
              {mergedCaption}
            </VisualEditable>
          </div>

          {/* Bottom Action Capsule */}
          <div
            className={`mt-auto flex items-center justify-between rounded-xl border p-2 backdrop-blur-md ${
              dark ? "border-white/10 bg-black/40" : "border-slate-200 bg-white shadow-sm"
            }`}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLike}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-black transition active:scale-95 ${
                  liked
                    ? "bg-[#de191e]/20 text-[#de191e]"
                    : "text-slate-400 hover:text-[#de191e]"
                }`}
                title="إعجاب"
              >
                <Heart size={12} className={liked ? "fill-[#de191e] text-[#de191e]" : ""} />
                <span>{likeCount}</span>
              </button>
              <ViewCount post={post} />
            </div>

            <button
              type="button"
              onClick={openPost}
              data-aqeeq-video="true"
              data-no-visual-edit="true"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#08467d] hover:bg-[#063560] text-white px-2.5 py-1 text-[11px] font-black shadow-sm transition active:scale-95"
            >
              <span>عرض كامل</span>
              <ArrowUpLeft size={13} />
            </button>
          </div>
        </motion.article>
      </>
    );
  }

  // 2) PHOTO / GALLERY CARD (لون الذهبي والعنبر الفاخر 📸)
  return (
    <>
      <motion.article
        variants={fadeUpSpring}
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.15s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.3s ease, border-color 0.3s ease",
        }}
        className={`group/card relative h-full flex flex-col justify-between overflow-hidden rounded-[2.2rem] border p-4 sm:p-5 transition duration-300 backdrop-blur-2xl will-change-transform ${
          dark
            ? "border-amber-500/35 bg-gradient-to-b from-[#181300]/90 via-[#0e0c04]/90 to-[#050401] text-white shadow-[0_16px_45px_rgba(245,158,11,0.15)] hover:border-amber-400 hover:shadow-[0_22px_65px_rgba(245,158,11,0.3)]"
            : "border-amber-300/80 bg-gradient-to-b from-amber-50/80 via-white to-slate-50 text-slate-900 shadow-[0_16px_40px_rgba(245,158,11,0.08)] hover:border-amber-500"
        }`}
      >
        {/* Specular glare following cursor */}
        <div
          className="pointer-events-none absolute inset-0 z-20 rounded-[2.2rem] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.14) 0%, transparent 60%)`,
          }}
        />
        {/* Top Bar Header inside Card */}
        <div className={`flex items-center justify-between border-b pb-2.5 mb-3.5 ${dark ? "border-amber-500/20" : "border-amber-200"}`}>
          <div className="flex items-center gap-1.5">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-amber-500 text-black shadow-sm">
              <ImageIcon size={12} />
            </span>
            <span className={`text-[11px] font-black ${dark ? "text-amber-400" : "text-amber-800"}`}>معرض صور HD</span>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black border ${dark ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-amber-100 text-amber-900 border-amber-300"}`}>
            {hasMultiple ? `${groupItems.length} صور` : "صورة"}
          </span>
        </div>

        {/* Media Frame Screen - 4:5 Portrait */}
        <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-black border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
          <button onClick={openPost} className="group/screen relative block h-full w-full overflow-hidden bg-black text-right">
            {hasMultiple ? (
              <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full w-full bg-black p-0.5">
                {groupItems.slice(0, 4).map((item, index) => (
                  <div key={item.id} className="relative h-full w-full overflow-hidden rounded-lg">
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
              <>
                {/* Ambient blur backdrop for landscape photos */}
                <img
                  src={getAqeeqShowcaseDisplaySource(post)}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover blur-xl scale-125 opacity-40"
                />
                <img
                  src={getAqeeqShowcaseDisplaySource(post)}
                  alt=""
                  className="relative h-full w-full object-cover transition duration-700 group-hover/screen:scale-105"
                  loading="lazy"
                />
              </>
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

        {/* Continuous Caption Block (الكلام على بعضه) */}
        <div className="p-2 pt-3 flex-1 flex flex-col justify-start">
          <VisualEditable
            id={`showcase-card-caption-${post.id}`}
            tag="text"
            label={`كابشن ${post.fileName}`}
            defaultText={mergedCaption}
            as="p"
            className={`line-clamp-3 min-h-[4.25rem] text-xs sm:text-sm font-semibold leading-6 ${
              dark ? "text-slate-200" : "text-slate-800"
            }`}
          >
            {mergedCaption}
          </VisualEditable>
        </div>

        {/* Bottom Action Capsule */}
        <div
          className={`mt-auto flex items-center justify-between rounded-xl border p-2 backdrop-blur-md ${
            dark ? "border-amber-500/20 bg-black/40" : "border-amber-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-black transition active:scale-95 ${
                liked
                  ? "bg-[#de191e]/20 text-[#de191e]"
                  : "text-slate-400 hover:text-[#de191e]"
              }`}
              title="إعجاب"
            >
              <Heart size={12} className={liked ? "fill-[#de191e] text-[#de191e]" : ""} />
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
      </motion.article>

      {/* Lightbox / Group Modal */}
      <Dialog open={groupOpen} onOpenChange={setGroupOpen}>
        <DialogContent
          className={`w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] max-w-5xl max-h-[94svh] overflow-y-auto p-0 text-right rounded-[1.6rem] sm:rounded-[2rem] border shadow-[0_32px_100px_rgba(0,0,0,0.9)] backdrop-blur-2xl ${
            dark ? "border-amber-500/30 bg-[#070a10] text-white" : "border-black/10 bg-white text-black"
          }`}
        >
          <DialogTitle className="sr-only">{post.title || "مجموعة وسائط"}</DialogTitle>
          <div dir="rtl">
            <div className="relative bg-black">
              {active?.mediaType === "video" || isEmbeddableVideo(active?.mediaUrl) || isAqeeqDriveVideo(active?.mediaUrl) ? (
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

// 3) SOCIAL MEDIA CARD (المنصات الرسمية الموحدة بأبعاد 16:9 الفاخرة 📱)
function SocialPostCard({
  post,
  onOpen,
  onSelect,
  dark,
}: {
  post: ShowcasePost;
  onOpen: () => void;
  onSelect?: () => void;
  dark: boolean;
}) {
  const postUrl = post.externalUrl || post.mediaUrl;
  const isInstagram = post.sourceType === "instagram";
  const isX = post.sourceType === "x";
  const isYouTube = post.sourceType === "youtube";
  const groupItems = post.media?.length ? post.media : [post];
  const hasMultiple = groupItems.length > 1;
  const isVideo = post.mediaType === "video" || isEmbeddableVideo(post.mediaUrl);
  const displaySrc = getAqeeqShowcaseDisplaySource(post);

  // دمج العنوان والوصف في كابشن متصل طبيعي لمنشورات التواصل دون تكرار أو فقدان أي نص
  const rawTitle = (post.title || "").trim();
  const rawDesc = (post.description || "").trim();
  const mergedCaption = (() => {
    if (!rawTitle && !rawDesc) return post.fileName || "منشور من منصات العقيق الرسمية";
    if (!rawTitle) return rawDesc;
    if (!rawDesc) return rawTitle;
    if (rawDesc.includes(rawTitle)) return rawDesc;
    if (rawTitle.includes(rawDesc)) return rawTitle;
    return `${rawTitle} ${rawDesc}`;
  })();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.viewCount ? Math.floor(post.viewCount / 2) + 14 : 29);
  const [groupOpen, setGroupOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = groupItems[activeIndex] || groupItems[0];
  const { ref, tilt, onMove, onLeave } = useMagneticTilt(6);

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

  const handleMediaClick = () => {
    if (hasMultiple) {
      setActiveIndex(0);
      setGroupOpen(true);
    } else if (onSelect) {
      onSelect();
    } else if (postUrl) {
      window.open(postUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <motion.article
        variants={fadeUpSpring}
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.15s cubic-bezier(0.2, 0, 1), box-shadow 0.3s ease, border-color 0.3s ease",
        }}
        className={`group/card relative h-full flex flex-col justify-between overflow-hidden rounded-[2.2rem] border p-4 sm:p-5 transition duration-300 backdrop-blur-2xl will-change-transform ${
          dark
            ? "border-[#08467d]/35 bg-gradient-to-b from-[#051120]/90 via-[#030b14]/90 to-[#010408] text-white shadow-[0_16px_45px_rgba(8,70,125,0.2)] hover:border-[#f8ca14] hover:shadow-[0_22px_60px_rgba(248,202,20,0.25)]"
            : "border-[#08467d]/20 bg-white text-slate-900 shadow-[0_16px_40px_rgba(8,70,125,0.08)] hover:border-[#08467d]"
        }`}
      >
        {/* Specular glare following cursor */}
        <div
          className="pointer-events-none absolute inset-0 z-20 rounded-[2.2rem] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.14) 0%, transparent 60%)`,
          }}
        />
        {/* Top Bar Header inside Card */}
        <div className="flex items-center justify-between border-b border-[#08467d]/20 pb-2.5 mb-3.5">
          <div className="flex items-center gap-1.5">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#08467d] text-[#f8ca14] shadow-sm">
              <Share2 size={12} />
            </span>
            <span className={`text-[11px] font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
              {isX ? "منصة 𝕏 الرسمية" : isInstagram ? "إنستغرام العقيق" : "يوتيوب العقيق"}
            </span>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black border ${
            dark ? "bg-[#f8ca14]/15 text-[#f8ca14] border-[#f8ca14]/30" : "bg-[#08467d]/10 text-[#08467d] border-[#08467d]/20"
          }`}>
            {isX ? "X" : isInstagram ? "Instagram" : "YouTube"}
          </span>
        </div>

        {/* 4:5 Portrait Cinema Frame Screen */}
        <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-black border border-[#08467d]/30 shadow-[0_0_30px_rgba(8,70,125,0.15)]">
          {isYouTube ? (
            <YouTubePostEmbed post={post} />
          ) : (
            <button
              type="button"
              onClick={handleMediaClick}
              className="group/screen relative block h-full w-full overflow-hidden bg-black text-right focus:outline-none"
            >
              {hasMultiple ? (
                <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full w-full bg-black p-0.5">
                  {groupItems.slice(0, 4).map((item, index) => (
                    <div key={item.id || index} className="relative h-full w-full overflow-hidden rounded-lg">
                      <img
                        src={getAqeeqShowcaseDisplaySource(item) || displaySrc}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition duration-500 group-hover/screen:scale-105"
                        loading="lazy"
                      />
                      {index === 3 && groupItems.length > 4 ? (
                        <span className="absolute inset-0 grid place-items-center bg-black/70 text-lg font-black text-[#f8ca14]">
                          +{groupItems.length - 4}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : displaySrc ? (
                <>
                  {/* Ambient blur backdrop for wide/horizontal social posts */}
                  <img
                    src={displaySrc}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover blur-xl scale-125 opacity-40"
                  />
                  <img
                    src={displaySrc}
                    alt={post.title || post.fileName}
                    className="relative h-full w-full object-cover transition duration-700 group-hover/screen:scale-105"
                    loading="lazy"
                  />
                </>
              ) : (
                <div className="relative flex h-full w-full flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#06182e] via-[#030d19] to-black">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#08467d] text-[#f8ca14] shadow-lg mb-2">
                    <Share2 size={20} />
                  </div>
                  <p className="text-xs font-black text-white/90 line-clamp-1">{post.title || "منشور رسمي"}</p>
                  <span className="text-[10px] text-[#f8ca14] mt-1 font-bold">مدارس العقيق الأهلية والدولية</span>
                </div>
              )}

              {/* Video Play Overlay if it's a video */}
              {isVideo && !hasMultiple && (
                <div className="absolute inset-0 grid place-items-center pointer-events-none bg-black/25">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-[#08467d] text-[#f8ca14] shadow-[0_0_25px_rgba(8,70,125,0.8)] ring-2 ring-white/30 transition-all duration-300 group-hover/screen:scale-110">
                    <Play size={18} className="mr-0.5 fill-current" />
                  </div>
                </div>
              )}
            </button>
          )}
        </div>

        {/* Merged Continuous Social Caption (كابشن المنشور المتصل) */}
        <div className="p-2 pt-3 flex-1 flex flex-col justify-start">
          <VisualEditable
            id={`showcase-social-caption-${post.id}`}
            tag="text"
            label={`كابشن ${post.fileName}`}
            defaultText={mergedCaption}
            as="p"
            className={`line-clamp-3 min-h-[4.25rem] text-xs sm:text-sm font-semibold leading-6 ${
              dark ? "text-slate-200" : "text-slate-800"
            }`}
          >
            {mergedCaption}
          </VisualEditable>
        </div>

        {/* Bottom Action Capsule */}
        <div
          className={`mt-auto flex items-center justify-between rounded-xl border p-2 backdrop-blur-md ${
            dark ? "border-white/10 bg-black/40" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-black transition active:scale-95 ${
                liked
                  ? "bg-[#de191e]/20 text-[#de191e]"
                  : "text-slate-400 hover:text-[#de191e]"
              }`}
              title="إعجاب"
            >
              <Heart size={12} className={liked ? "fill-[#de191e] text-[#de191e]" : ""} />
              <span>{likeCount}</span>
            </button>
            <ViewCount post={post} />
          </div>

          <a
            onClick={onOpen}
            href={postUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#08467d] hover:bg-[#063560] text-white px-2.5 py-1 text-[11px] font-black shadow-sm transition active:scale-95"
          >
            <span>{isX ? "فتح في 𝕏" : isInstagram ? "فتح في إنستغرام" : isYouTube ? "مشاهدة في يوتيوب" : "فتح المصدر"}</span>
            <ArrowUpLeft size={13} />
          </a>
        </div>
      </motion.article>

      {/* Lightbox / Group Modal for multi-photo social posts */}
      {hasMultiple && (
        <Dialog open={groupOpen} onOpenChange={setGroupOpen}>
          <DialogContent
            className={`w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] max-w-5xl max-h-[94svh] overflow-y-auto p-0 text-right rounded-[1.6rem] sm:rounded-[2rem] border shadow-[0_32px_100px_rgba(0,0,0,0.9)] backdrop-blur-2xl ${
              dark ? "border-[#08467d]/40 bg-[#070a10] text-white" : "border-black/10 bg-white text-black"
            }`}
          >
            <DialogTitle className="sr-only">{post.title || "مجموعة صور"}</DialogTitle>
            <div dir="rtl">
              <div className="relative bg-black">
                <img
                  src={getAqeeqShowcaseDisplaySource(active) || displaySrc}
                  alt=""
                  className="max-h-[74svh] w-full object-contain"
                />
                {groupItems.length > 1 ? (
                  <>
                    <button
                      onClick={() => setActiveIndex((idx) => Math.max(0, idx - 1))}
                      disabled={activeIndex === 0}
                      className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white disabled:opacity-30"
                    >
                      <ChevronRight size={22} />
                    </button>
                    <button
                      onClick={() => setActiveIndex((idx) => Math.min(groupItems.length - 1, idx + 1))}
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
                  <div className="min-w-0">
                    <p className={`max-w-2xl text-base sm:text-lg font-bold leading-8 ${dark ? "text-slate-100" : "text-slate-900"}`}>
                      {mergedCaption}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${
                      dark ? "border-[#f8ca14]/30 text-[#f8ca14]" : "border-[#08467d]/20 text-[#08467d]"
                    }`}
                  >
                    {activeIndex + 1} / {groupItems.length}
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
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
  const postsWithDisplay = posts.filter((post) => Boolean(getAqeeqShowcaseDisplaySource(post)));
  const heroCandidates = postsWithDisplay.length ? postsWithDisplay : posts;
  const sortedHeroCandidates = useMemo(() => sortAqeeqContent(heroCandidates, "newest"), [heroCandidates]);
  const newestPost = (customPostId ? posts.find((p) => p.id === customPostId) : undefined) || sortedHeroCandidates[0] || posts[0];
  const previousPost = (secondaryPostId ? posts.find((p) => p.id === secondaryPostId) : undefined) || sortedHeroCandidates.find((p) => p.id !== newestPost?.id) || posts.find((p) => p.id !== newestPost?.id) || newestPost;
  const imageCount = posts.filter((post) => post.mediaType === "image" && !isSocialPost(post)).length;
  const videoCount = posts.filter((post) => post.mediaType === "video" || post.sourceType === "youtube").length;
  const socialCount = posts.filter(isSocialPost).length;

  const { isNationalDay } = useSiteTheme();
  const heroRef = useRef<HTMLDivElement>(null);

  const showcaseUnfurlingItems: UnfurlingItem[] = useMemo(() => {
    const postsWithCovers = posts.filter((p) => Boolean(getAqeeqShowcaseDisplaySource(p)));
    const galleryCandidates = postsWithCovers.length ? postsWithCovers : posts;
    const fallbackList: UnfurlingItem[] = [
      { id: "sh-1", title: "كأس بطولة فيرست ليجو للروبوت", image: "/covers/first-lego-champions.png", badge: "بطل المملكة 🥇", date: "تغطية مميزة" },
      { id: "sh-2", title: "معامل الذكاء الاصطناعي وSTEM", image: "/covers/student-lab-admissions.jpg", badge: "تقنيات ذكية", date: "معامل المستقبل" },
      { id: "sh-3", title: "حفل تكريم أوائل الطلاب والمتفوقين", image: "/covers/student-excellence-about.jpg", badge: "لوحة الشرف", date: "أجيال العقيق" },
      { id: "sh-4", title: "المسبح نصف الأولمبي والبطولات", image: "/covers/cover-admissions.jpg", badge: "صرح رياضي", date: "أنشطة وبطولات" },
      { id: "sh-5", title: "أولمبياد الروبوت الدولي WRO", image: "/covers/student-robotics-accreditations.jpg", badge: "خامس العالم 🌐", date: "إنجاز وطني" },
      { id: "sh-6", title: "اعتماد كوجنيا والمسار الدولي", image: "/covers/cover-about.jpg", badge: "Cognia USA", date: "اعتماد دولي" },
      { id: "sh-7", title: "الفصول التفاعلية الذكية 4K", image: "/covers/cover-about.jpg", badge: "فصول ذكية", date: "بيئة تعليمية" },
      { id: "sh-8", title: "مرحلة الطفولة المبكرة ورياض الأطفال", image: "/covers/student-excellence-about.jpg", badge: "تأسيس مبهج", date: "رياض الأطفال" },
      { id: "sh-9", title: "معارض الفنون والابتكار الطلابي", image: "/covers/student-lab-admissions.jpg", badge: "إبداع وموهبة", date: "معارض العقيق" },
      { id: "sh-10", title: "المسرح المدرسي والملتقيات الثقافية", image: "/covers/cover-about.jpg", badge: "سعة 600 مقعد", date: "منبر الإبداع" },
      { id: "sh-11", title: "الرحلات العلمية والميدانية الاستكشافية", image: "/covers/student-robotics-accreditations.jpg", badge: "تطبيق عملي", date: "أنشطة لا صفية" },
      { id: "sh-12", title: "برامج رعاية الموهوبين مع مؤسسة موهبة", image: "/covers/student-excellence-about.jpg", badge: "فصول موهبة", date: "رعاية وتميز" },
      { id: "sh-13", title: "مختبرات العلوم والأبحاث الكيميائية", image: "/covers/student-lab-admissions.jpg", badge: "تجارب علمية", date: "اكتشاف وإبداع" },
      { id: "sh-14", title: "دورات القدرات والتحصيلي المكثفة", image: "/covers/cover-admissions.jpg", badge: "أعلى الدرجات", date: "تأهيل جامعي" },
      { id: "sh-15", title: "الأيام العالمية والمناسبات الوطنية", image: "/covers/first-lego-champions.png", badge: "عز وفخر", date: "احتفالات وطنية" },
      { id: "sh-16", title: "منظومة الشاشات والتقنيات التفاعلية", image: "/covers/cover-about.jpg", badge: "أحدث التقنيات", date: "صروح العقيق" },
    ];

    const mapped = galleryCandidates.map((post, idx) => ({
      id: `post-${post.id}`,
      title: post.title || post.fileName.replace(/\.[^.]+$/, "") || `خبر ${idx + 1}`,
      image: getAqeeqShowcaseDisplaySource(post) || "/covers/cover-about.jpg",
      badge: post.sourceType === "x" ? "منشور 𝕏" : post.sourceType === "instagram" ? "إنستغرام" : post.mediaType === "video" ? "فيديو 🎬" : "تغطية 📸",
      date: post.createdAt ? new Date(post.createdAt).toLocaleDateString("ar-SA") : "المركز الإعلامي",
    }));

    if (mapped.length >= 16) return mapped.slice(0, 16);
    return [...mapped, ...fallbackList.slice(0, 16 - mapped.length)];
  }, [posts]);

  return (
    <ParallaxUnfurlingGallery
      items={showcaseUnfurlingItems}
      dark={dark}
      header={
        <div className="relative mx-auto grid max-w-[1380px] items-center gap-8 px-4 sm:px-6 md:px-8 py-8 md:grid-cols-[1fr_1.1fr] md:py-12 lg:gap-16 relative z-10">
        <div className="relative order-2 mx-auto h-[370px] w-full max-w-[580px] md:order-1 md:h-[470px]">
          {previousPost ? (
            <div className={`absolute left-[8%] top-[9%] h-[75%] w-[56%] overflow-hidden rounded-[1.6rem] border p-2 opacity-60 shadow-2xl ${
              isNationalDay
                ? dark ? "border-emerald-500/20 bg-[#001c10]" : "border-emerald-500/20 bg-white"
                : dark ? "border-white/[0.1] bg-[#111111]" : "border-black/[0.08] bg-[#f0f0f0]"
            }`} style={{ transform: "rotate(-7deg)" }}>
              <VisualBackground id={`showcase-hero-previous-cover-${previousPost.id}`} label="الصورة الخلفية لغلاف الأخبار والعروض" src={getAqeeqShowcaseDisplaySource(previousPost) || "/covers/cover-about.jpg"} alt="" className="h-full w-full rounded-[1.12rem]" />
            </div>
          ) : null}
          <div className={`group absolute bottom-1 right-[8%] aspect-[3/4] w-[56%] overflow-hidden rounded-[1.85rem] border p-2 shadow-2xl ${
            isNationalDay
              ? dark
                ? "border-[#f8ca14]/70 bg-[#001f13] shadow-[0_20px_50px_rgba(0,90,54,0.4)]"
                : "border-emerald-500/50 bg-white shadow-[0_20px_50px_rgba(0,90,54,0.15)]"
              : dark ? "border-[#f8ca14]/50 bg-[#111111]" : "border-[#08467d]/30 bg-white"
          }`} style={{ transform: "rotate(3deg)" }}>
            <div className="relative h-full overflow-hidden rounded-[1.35rem]">
              {newestPost ? (
                <ShowcaseHeroCover post={newestPost} className="transition duration-700 group-hover:scale-[1.03]" />
              ) : (
                <div className={`grid h-full place-items-center ${dark ? "bg-[#181818] text-[#f8ca14]" : isNationalDay ? "bg-emerald-50 text-[#005A36]" : "bg-slate-100 text-[#08467d]"}`}>
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
          {isNationalDay ? (
            <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 mb-3 text-xs font-black shadow-md backdrop-blur-md ${
              dark
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                : "bg-emerald-50 border-emerald-500/30 text-[#005A36]"
            }`}>
              <span className="text-sm">🇸🇦</span>
              <span className="font-black">الأخبار والعروض · هوية اليوم الوطني</span>
            </div>
          ) : (
            <VisualEditable id="showcase-hero-kicker" tag="text" label="شارة الأخبار والعروض" defaultText={customTag || "العقيق · الأخبار والعروض"} as="div" className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black ${
              dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
            }`}>
              <VisualIcon id="showcase-hero-kicker-icon" label="أيقونة شارة الأخبار" icon="sparkles" size={14} />{customTag || "العقيق · الأخبار والعروض"}
            </VisualEditable>
          )}
          <VisualEditable id="showcase-hero-title" tag="text" label="السطر الأول لعنوان الأخبار والعروض" defaultText={customTitle || showcase.title} as="h1" className={`mt-5 text-4xl font-black leading-[1.12] md:text-6xl ${
            dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black"
          }`} />
          <VisualEditable id="showcase-hero-subtitle" tag="text" label="السطر الذهبي لعنوان الأخبار والعروض" defaultText={customSubtitle || "كل جديد، أولًا بأول."} as="h1" className={`text-4xl font-black leading-[1.12] md:text-6xl ${
            isNationalDay ? "snd-text-gradient" : dark ? "text-[#f8ca14]" : "text-[#08467d]"
          }`} />
          <VisualEditable id="showcase-hero-intro" tag="text" label="مقدمة الأخبار والعروض" defaultText={customDesc || showcase.intro || "رفوف رقمية تجمع صور وفيديوهات أنشطة مدارس العقيق وعروضها، وكل منشور يفتح في تجربته المناسبة."} as="p" className={`mt-5 max-w-xl text-sm leading-8 ${dark ? "text-slate-300" : isNationalDay ? "text-slate-700" : "text-slate-600"}`} />
          <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-bold">
            <span className={`rounded-full border px-3 py-2 ${
              isNationalDay
                ? dark ? "border-emerald-500/20 bg-[#001c10] text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-800"
                : dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
            }`}>
              <VisualIcon id="showcase-image-count-icon" label="أيقونة عدد الصور" icon="image" className={`ml-1 inline ${isNationalDay ? "text-[#f8ca14]" : dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />{imageCount} صورة
            </span>
            <span className={`rounded-full border px-3 py-2 ${
              isNationalDay
                ? dark ? "border-emerald-500/20 bg-[#001c10] text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-800"
                : dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
            }`}>
              <VisualIcon id="showcase-video-count-icon" label="أيقونة عدد الفيديوهات" icon="video" className={`ml-1 inline ${isNationalDay ? "text-[#f8ca14]" : dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />{videoCount} فيديو
            </span>
            {socialCount ? (
              <span className={`rounded-full border px-3 py-2 ${
                isNationalDay
                  ? dark ? "border-emerald-500/20 bg-[#001c10] text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
              }`}>
                <VisualIcon id="showcase-social-count-icon" label="أيقونة عدد منشورات السوشيال" icon="share" className={`ml-1 inline ${isNationalDay ? "text-[#f8ca14]" : dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />{socialCount} سوشيال
              </span>
            ) : null}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <VisualEditable id="showcase-explore-action" tag="button" label="زر استكشاف الأخبار" defaultText="استكشف الجديد" as="button" onAction={onExplore} className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-black shadow-lg transition active:scale-95 hover:opacity-90 ${
              dark
                ? "!bg-[#f8ca14] !text-black shadow-[0_0_20px_rgba(248,202,20,0.3)]"
                : isNationalDay
                ? "!bg-[#005A36] !text-white shadow-[0_0_20px_rgba(0,90,54,0.25)] hover:bg-[#003822]"
                : "!bg-[#08467d] !text-white shadow-[0_0_20px_rgba(8,70,125,0.2)]"
            }`}>
              <VisualIcon id="showcase-explore-icon" label="أيقونة زر استكشاف الأخبار" icon="external" size={16} />استكشف الجديد
            </VisualEditable>
            {isAdmin ? (
              <VisualEditable id="showcase-studio-action" tag="button" label="زر دخول استوديو الأخبار" defaultText="دخول استوديو الأخبار والعروض" as="button" onAction={onOpenStudio} className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-xs font-black transition ${
                dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20" : isNationalDay ? "border-emerald-600/30 bg-emerald-50 text-[#005A36] hover:bg-emerald-100" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
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
    }
  />
  );
}

export default function AqeeqShowcasePage() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const { isNationalDay } = useSiteTheme();
  const { user, isAuthenticated } = useAuth();

  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<ShowcasePost | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<AqeeqSortOption>("custom");
  const [contentType, setContentType] = useState<ContentType>("all");
  const audioRef = useRef<HTMLAudioElement>(null);
  const showcaseModalRef = useRef<HTMLDivElement | null>(null);
  const [isShowcaseFullscreen, setIsShowcaseFullscreen] = useState(false);

  const toggleShowcaseFullscreen = () => {
    if (!document.fullscreenElement) {
      showcaseModalRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  useEffect(() => {
    const onFs = () => setIsShowcaseFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const { data: showcase, isLoading: showcaseLoading } = trpc.aqeeqShowcases.publicShowcase.useQuery({ slug: "news-offers" }, { refetchOnWindowFocus: false });
  const { data: issues = [] } = trpc.schoolNews.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, { refetchOnMount: true, staleTime: 0 });
  const recordPostView = trpc.aqeeqShowcases.recordPostView.useMutation();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const posts = useMemo(() => (showcase?.posts || []) as ShowcasePost[], [showcase?.posts]);
  const visiblePosts = useMemo(() => {
    const filtered = posts.filter((post) => matchesContentType(post, contentType));
    return searchAndSortAqeeqContent(filtered, searchQuery, sort);
  }, [posts, contentType, searchQuery, sort]);
  const typeOptionsWithCounts = useMemo(() => {
    return SHOWCASE_TYPE_OPTIONS.map((opt) => ({
      ...opt,
      count: posts.filter((post) => matchesContentType(post, opt.id as ContentType)).length,
    }));
  }, [posts]);

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

  if (showcaseLoading) {
    return (
      <AqeeqLuxuryPageShell header={<AlaqeeqStudioSiteHeader title="الأخبار والعروض" active="showcase" logoUrl={issues[0]?.headerLogoUrl} />}>
        <div className="grid min-h-[60vh] place-items-center">
          <Loader2 className="animate-spin text-[#f8ca14]" size={42} />
        </div>
      </AqeeqLuxuryPageShell>
    );
  }

  if (!showcase) {
    return (
      <AqeeqLuxuryPageShell header={<AlaqeeqStudioSiteHeader title="الأخبار والعروض" active="showcase" logoUrl={issues[0]?.headerLogoUrl} />}>
        <section className="mx-auto max-w-3xl px-5 py-28 text-center">
          <Sparkles className={`mx-auto ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={48} />
          <h1 className={`mt-6 text-3xl font-black ${dark ? "text-white" : "text-black"}`}>الأخبار والعروض في الطريق</h1>
          {isAdmin ? <Button onClick={() => navigate("/offers/manage")} className={`mt-7 ${dark ? "bg-[#f8ca14] text-black" : "bg-[#08467d] text-white"}`}><Settings2 className="ml-2" size={16} />فتح الاستوديو</Button> : null}
        </section>
      </AqeeqLuxuryPageShell>
    );
  }

  return (
    <AqeeqLuxuryPageShell
      header={<AlaqeeqStudioSiteHeader title="الأخبار والعروض" active="showcase" logoUrl={showcase.headerLogoUrl || issues[0]?.headerLogoUrl} />}
      footer={<AlaqeeqStudioSiteFooter />}
      useCurtain={false}
      curtainKicker="✦ استكشف مسرح الأخبار والعروض ✦"
      hero={
        <div className="relative w-full">
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
        </div>
      }
    >
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
        <AqeeqArchiveControls id="showcase-archive-controls" label="البحث وترتيب الأخبار والعروض" query={searchQuery} onQueryChange={setSearchQuery} sort={sort} onSortChange={setSort} typeOptions={typeOptionsWithCounts} activeType={contentType} onTypeChange={(value) => setContentType(value as ContentType)} />
        {visiblePosts.length ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
          >
            {visiblePosts.map((post) =>
              isSocialPost(post) ? (
                <SocialPostCard
                  key={`post-${post.id}-${post.sourceType}`}
                  post={post}
                  dark={dark}
                  onOpen={() => void recordPostView.mutateAsync({ id: post.id, viewerKey: getAqeeqViewerKey() }).catch(() => undefined)}
                  onSelect={() => setSelected(post)}
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
          </motion.div>
        ) : (
          <VisualEditable id="showcase-search-empty" tag="text" label="رسالة عدم وجود نتائج للأخبار" defaultText="لا توجد أخبار أو عروض مطابقة للبحث أو الفلتر." as="p" className={`rounded-2xl border border-dashed p-10 text-center text-sm font-black ${
            dark ? "border-[#f8ca14]/30 text-[#f8ca14]" : "border-[#08467d]/30 text-[#08467d]"
          }`} />
        )}
      </section>
      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className={`w-[calc(100vw-0.5rem)] sm:w-[min(95vw,calc((88vh-80px)*16/9),1200px)] sm:max-w-none !max-w-none max-h-[96vh] sm:max-h-[92vh] overflow-y-auto p-0 text-right rounded-[1.4rem] sm:rounded-[2.4rem] border shadow-[0_32px_120px_rgba(0,0,0,0.95)] backdrop-blur-3xl flex flex-col ${
          dark ? "border-amber-400/30 bg-[#070a12]/98 text-white" : "border-black/10 bg-white text-black"
        }`}>
          <DialogTitle className="sr-only">{selected?.title || selected?.fileName || "عرض الوسيط"}</DialogTitle>
          {selected ? (
            <div ref={showcaseModalRef} dir="rtl" className="flex flex-col h-full w-full bg-black">
              <div className="relative bg-black aspect-video w-full overflow-hidden flex-1 min-h-0">
                {(selected.mediaType === "video" || isEmbeddableVideo(selected.mediaUrl) || isAqeeqDriveVideo(selected.mediaUrl)) && selected.sourceType !== "x" && selected.sourceType !== "instagram" ? (
                  <AqeeqUnifiedVideoFrame sourceUrl={selected.mediaUrl} title={selected.title || selected.fileName} posterUrl={getAqeeqShowcaseDisplaySource(selected)} />
                ) : (
                  <ShowcaseMedia post={selected} className="max-h-[74svh] object-contain" />
                )}
              </div>
              <div className={`p-4 sm:p-6 border-t shrink-0 ${dark ? "bg-[#0c101a] border-white/[.08]" : "bg-slate-50 border-black/[.06]"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {isSocialPost(selected) ? (
                      <p className={`max-w-3xl text-sm sm:text-base font-bold leading-8 ${dark ? "text-slate-100" : "text-slate-900"}`}>
                        {(() => {
                          const t = (selected.title || "").trim();
                          const d = (selected.description || "").trim();
                          if (!t && !d) return selected.fileName || "";
                          if (!t) return d;
                          if (!d) return t;
                          if (d.includes(t)) return d;
                          if (t.includes(d)) return t;
                          return `${t} ${d}`;
                        })()}
                      </p>
                    ) : (
                      <>
                        <h3 className={`text-base sm:text-xl font-black ${dark ? "text-amber-50" : "text-slate-900"}`}>{selected.title || selected.fileName.replace(/\.[^.]+$/, "")}</h3>
                        {selected.description ? <p className={`mt-2 max-w-2xl text-xs sm:text-sm leading-7 ${dark ? "text-slate-300" : "text-slate-600"}`}>{selected.description}</p> : null}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(selected.mediaType === "video" || isEmbeddableVideo(selected.mediaUrl) || isAqeeqDriveVideo(selected.mediaUrl)) && selected.sourceType !== "x" && selected.sourceType !== "instagram" && (
                      <button
                        type="button"
                        onClick={toggleShowcaseFullscreen}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition active:scale-95 ${
                          dark ? "border-white/10 text-slate-300 hover:border-amber-300 hover:text-amber-200" : "border-black/10 text-slate-700 hover:border-[#08467d] hover:text-[#08467d]"
                        }`}
                        title={isShowcaseFullscreen ? "تصغير الشاشة" : "ملء الشاشة بالكامل (Fullscreen)"}
                      >
                        {isShowcaseFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                        <span className="hidden sm:inline">{isShowcaseFullscreen ? "تصغير" : "ملء الشاشة"}</span>
                      </button>
                    )}
                    {(selected.mediaType === "video" || isEmbeddableVideo(selected.mediaUrl) || isAqeeqDriveVideo(selected.mediaUrl)) && isAqeeqDriveVideo(selected.mediaUrl) ? (
                      <a
                        href={getAqeeqDriveFallbackUrl(selected.mediaUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                          dark ? "border-white/10 text-slate-300 hover:border-amber-300 hover:text-amber-200" : "border-black/10 text-slate-700 hover:border-[#08467d] hover:text-[#08467d]"
                        }`}
                      >
                        <ExternalLink size={13} />
                        Drive
                      </a>
                    ) : null}
                    {selected.externalUrl ? (
                      <a
                        href={selected.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                          dark ? "border-[#f8ca14]/30 text-[#f8ca14] hover:bg-[#f8ca14]/10" : "border-[#08467d]/30 text-[#08467d] hover:bg-[#08467d]/10"
                        }`}
                      >
                        <ExternalLink size={13} />
                        <span>{selected.sourceType === "x" ? "فتح في 𝕏" : selected.sourceType === "instagram" ? "إنستغرام" : "المصدر"}</span>
                      </a>
                    ) : null}
                    <button
                      onClick={() => {
                        if (document.fullscreenElement) {
                          document.exitFullscreen?.().catch(() => {});
                        }
                        setSelected(null);
                      }}
                      className={`grid h-9 w-9 place-items-center rounded-xl border transition active:scale-95 ${dark ? "border-white/[0.15] text-slate-300 hover:border-amber-300 hover:bg-amber-300 hover:text-slate-950" : "border-black/[0.12] text-slate-700 hover:bg-slate-200"}`}
                      aria-label="إغلاق"
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Stage 5: Grand Interactive Finale & Action */}
      <AqeeqGrandFinaleCta
        badge="✦ منصة التغطيات الحية ✦"
        title="تابع أحدث تغطيات وفعاليات العقيق لحظة بلحظة عبر كافة المنصات"
        subtitle="نشارككم قصص النجاح وإبداعات الطلاب أولاً بأول عبر قنواتنا الرسمية وأقسام الميديا المتجددة."
        primaryActionText="استمع لبودكاست أثير"
        primaryActionHref="/atheer"
        onPrimaryAction={() => navigate("/atheer")}
        secondaryActionText="استكشف الألبومات والمعارض"
        secondaryActionHref="/albums"
        onSecondaryAction={() => navigate("/albums")}
      />

    </AqeeqLuxuryPageShell>
  );
}
