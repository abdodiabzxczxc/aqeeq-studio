import { useState, useMemo, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { usePodcastPlayer } from "@/components/AqeeqFloatingPodcastPlayer";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import {
  Play,
  Pause,
  Headphones,
  Video,
  Sparkles,
  Search,
  Heart,
  Eye,
  Share2,
  Mic,
  ArrowUpLeft,
  X,
  Radio,
  Layers,
  Music,
  Disc,
  ListMusic,
  Maximize2,
  SlidersHorizontal,
  Flame,
  FileText,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  List,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const ATHEER_CATEGORIES = [
  { id: "all", label: "🌟 جميع الأروقة" },
  { id: "audio", label: "🎙️ خلف المايك (مسموع)" },
  { id: "videos", label: "🎬 تحت الضوء (مرئي)" },
  { id: "songs", label: "🎵 أناشيد وكورال العقيق" },
] as const;

function formatAudioTime(secs: number) {
  if (isNaN(secs) || secs < 0) return "00:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const id =
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/)?.[1];
  return id ? `/api/drive-proxy/${id}` : url;
}

function getVideoEmbedUrl(url: string | undefined | null): string {
  if (!url) return "";
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&enablejsapi=1`;
  }
  const driveId =
    url.match(/\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/[?&]id=([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/)?.[1];
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }
  return url;
}

function isEmbeddableVideo(url: string | undefined | null): boolean {
  if (!url) return false;
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("drive.google.com") ||
    url.includes("googleusercontent.com") ||
    url.includes("/file/d/") ||
    url.includes("id=")
  );
}

export default function AqeeqPodcastPage() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const isAdmin = isAuthenticated && user?.role === "admin";

  const { data: rawPodcasts = [], isLoading, refetch } = trpc.podcasts.list.useQuery({});
  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    refetchOnMount: true,
    staleTime: 0,
  });

  const {
    activeItem,
    activePodcast,
    isPlaying,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    togglePlay,
    playSong,
    playPodcast,
    pausePodcast,
    playNextSong,
    playPrevSong,
    playNextPodcast,
    handlePrevOrRestart,
    songs,
  } = usePodcastPlayer();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [watchingVideoPodcast, setWatchingVideoPodcast] = useState<any | null>(null);
  const [selectedLyricsSong, setSelectedLyricsSong] = useState<any | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [inlinePlayingVideoId, setInlinePlayingVideoId] = useState<number | null>(null);
  const [selectedAudioId, setSelectedAudioId] = useState<number | null>(null);

  // View Modes: Carousel 2-Rows (default) vs Compact List
  const [songsViewMode, setSongsViewMode] = useState<"carousel" | "list">("carousel");
  const [videosViewMode, setVideosViewMode] = useState<"carousel" | "list">("carousel");
  const [audioViewMode, setAudioViewMode] = useState<"carousel" | "list">("carousel");

  // Scroll Container Refs for Horizontal Carousels
  const songsScrollRef = useRef<HTMLDivElement>(null);
  const videosScrollRef = useRef<HTMLDivElement>(null);
  const audioScrollRef = useRef<HTMLDivElement>(null);

  // Scroll Container Refs for Vertical Playlist Sliders
  const songsListScrollRef = useRef<HTMLDivElement>(null);
  const videosListScrollRef = useRef<HTMLDivElement>(null);
  const audioListScrollRef = useRef<HTMLDivElement>(null);

  const scrollHorizontal = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "right" ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollVertical = (ref: React.RefObject<HTMLDivElement | null>, direction: "up" | "down") => {
    if (ref.current) {
      const scrollAmount = direction === "up" ? -220 : 220;
      ref.current.scrollBy({ top: scrollAmount, behavior: "smooth" });
    }
  };

  // Local likes tracking
  const [songLikes, setSongLikes] = useState<Record<string, number>>({});
  const [likedSongIds, setLikedSongIds] = useState<string[]>([]);

  // Hero custom covers
  const featuredPodcast = useMemo(() => {
    if (orchestration?.heroCovers?.podcastsMode === "custom" && orchestration?.heroCovers?.customPodcastId) {
      const found = rawPodcasts.find((p) => p.id === orchestration.heroCovers.customPodcastId);
      if (found) return found;
    }
    return rawPodcasts[0] || null;
  }, [rawPodcasts, orchestration?.heroCovers]);

  const secondPodcast = useMemo(() => {
    if (!featuredPodcast) return null;
    if (orchestration?.heroCovers?.podcastsSecondaryPodcastId) {
      const found = rawPodcasts.find((p) => p.id === orchestration.heroCovers.podcastsSecondaryPodcastId);
      if (found) return found;
    }
    return rawPodcasts.find((p) => p.id !== featuredPodcast.id) || null;
  }, [rawPodcasts, featuredPodcast, orchestration?.heroCovers?.podcastsSecondaryPodcastId]);

  const likeMutation = trpc.podcasts.like.useMutation({
    onSuccess: () => {
      void refetch();
      toast.success("شكراً لتفاعلك! تم تسجيل إعجابك بنجاح ❤️");
    },
  });

  // Separate video vs audio podcasts
  const videoPodcasts = useMemo(() => {
    return rawPodcasts.filter((p) => {
      if (p.mediaType !== "video") return false;
      if (selectedCategory === "songs" || selectedCategory === "audio") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.hostName && p.hostName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [rawPodcasts, selectedCategory, searchQuery]);

  const audioPodcasts = useMemo(() => {
    return rawPodcasts.filter((p) => {
      if (p.mediaType === "video") return false;
      if (selectedCategory === "songs" || selectedCategory === "videos") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.hostName && p.hostName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [rawPodcasts, selectedCategory, searchQuery]);

  const filteredSongs = useMemo(() => {
    if (selectedCategory === "videos" || selectedCategory === "audio") return [];
    return (songs || []).filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          (s.artistOrHost && s.artistOrHost.toLowerCase().includes(q)) ||
          (s.description && s.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [songs, selectedCategory, searchQuery]);

  const currentActiveVideo = useMemo(() => {
    if (selectedVideoId) {
      const found = videoPodcasts.find((v) => v.id === selectedVideoId);
      if (found) return found;
    }
    return videoPodcasts[0] || null;
  }, [videoPodcasts, selectedVideoId]);

  const currentActiveAudio = useMemo(() => {
    if (activePodcast && activePodcast.mediaType !== "video") {
      return activePodcast;
    }
    if (selectedAudioId) {
      const found = audioPodcasts.find((a) => a.id === selectedAudioId);
      if (found) return found;
    }
    return audioPodcasts[0] || null;
  }, [audioPodcasts, selectedAudioId, activePodcast]);

  const handlePlayVideoInline = (videoId: number) => {
    const video = videoPodcasts.find((v) => v.id === videoId);
    pausePodcast();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("aqeeq-video-start", {
        detail: {
          id: video?.id || videoId,
          title: video?.title || "حلقة مميزة تحت الضوء",
          coverUrl: video?.coverUrl,
          hostName: video?.hostName || "مسرح تحت الضوء",
          mediaUrl: video?.mediaUrl,
        }
      }));
    }
    setSelectedVideoId(videoId);
    setInlinePlayingVideoId(videoId);
  };

  const handleOpenVideoModal = (video: any) => {
    pausePodcast();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("aqeeq-video-start", {
        detail: {
          id: video?.id,
          title: video?.title || "حلقة مميزة تحت الضوء",
          coverUrl: video?.coverUrl,
          hostName: video?.hostName || "مسرح تحت الضوء",
          mediaUrl: video?.mediaUrl,
        }
      }));
    }
    setWatchingVideoPodcast(video);
  };

  const handleLikeSong = (song: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const songKey = String(song.id || "song-0");
    if (likedSongIds.includes(songKey)) {
      toast.info("تم تسجيل إعجابك بهذا النشيد مسبقاً ❤️");
      return;
    }
    setLikedSongIds((prev) => [...prev, songKey]);
    setSongLikes((prev) => ({ ...prev, [songKey]: (prev[songKey] || song.likesCount || 98) + 1 }));
    toast.success("شكراً لتفاعلك وإعجابك بالنشيد! 🎵❤️");
  };

  const handleLikePodcast = (podcast: any, e: React.MouseEvent) => {
    e.stopPropagation();
    likeMutation.mutate({ id: podcast.id });
  };

  const handleShare = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item) return;
    const url = window.location.origin + "/atheer";
    const text = `استمع إلى: «${item.title}» عبر منصة أثير العقيق 🎙️📻\n${url}`;
    if (navigator.share) {
      navigator.share({ title: item.title, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${item.title}\n${url}`).then(() => {
        toast.success("تم نسخ رابط المشاركة إلى الحافظة!");
      });
    }
  };

  const handlePlayOrOpen = (item: any) => {
    if (!item) return;
    if (item.mediaType === "video") {
      setWatchingVideoPodcast(item);
    } else {
      playPodcast(item);
    }
  };

  const isCurrentPlaying = (id: string | number) => {
    return isPlaying && (String(activeItem?.id) === String(id) || String(activePodcast?.id) === String(id));
  };

  const handleSongToggle = (song: any) => {
    if (isCurrentPlaying(song.id)) {
      pausePodcast();
    } else {
      playSong(song);
    }
  };

  const handleAudioToggle = (podcast: any) => {
    if (isCurrentPlaying(podcast.id)) {
      pausePodcast();
    } else {
      setSelectedAudioId(podcast.id);
      playPodcast(podcast);
    }
  };

  return (
    <main
      dir="rtl"
      className={`min-h-screen aq-public-shell font-[Tajawal,sans-serif] transition-colors duration-200 ${
        dark ? "bg-black text-white" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      {/* Top Header Bar */}
      <AlaqeeqStudioSiteHeader title="أثير العقيق 🎙️" active="podcast" />

      {/* ==================== 1. 3D TILTED HERO COVER ==================== */}
      <section
        className={`relative isolate overflow-hidden border-b ${
          dark ? "border-white/[0.08] bg-black text-white" : "border-black/[0.06] bg-white text-black"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_18%,rgba(248,202,20,0.12),transparent_25%)]" />

        <div className="relative mx-auto grid max-w-[1380px] items-center gap-8 px-4 sm:px-6 md:px-8 py-10 md:grid-cols-[minmax(390px,.9fr)_minmax(0,1.1fr)] md:py-14 lg:gap-14">
          {/* 3D Tilted Dual-Cover */}
          <div className="relative order-2 mx-auto h-[340px] w-full max-w-[560px] md:order-1 md:h-[440px]">
            {secondPodcast ? (
              <button
                onClick={() => handlePlayOrOpen(secondPodcast)}
                className={`absolute left-[4%] top-[5%] h-[80%] w-[58%] overflow-hidden rounded-[1.7rem] border p-2 opacity-65 shadow-2xl transition duration-300 hover:scale-105 hover:opacity-100 ${
                  dark ? "border-white/[0.1] bg-[#111111]" : "border-black/[0.08] bg-[#f0f0f0]"
                }`}
                style={{ transform: "rotate(-7deg)" }}
                aria-label={`الحلقة السابقة: ${secondPodcast.title}`}
              >
                {secondPodcast.coverUrl ? (
                  <img
                    src={directDriveImage(secondPodcast.coverUrl) || secondPodcast.coverUrl}
                    alt=""
                    className="h-full w-full rounded-[1.2rem] object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col justify-between rounded-[1.2rem] bg-gradient-to-br from-white/5 to-transparent p-5 text-right">
                    <Mic size={30} className="text-slate-400" />
                    <div>
                      <span className="text-[10px] font-black text-[#f8ca14]">{secondPodcast.category}</span>
                      <p className="line-clamp-2 text-xs font-black text-white">{secondPodcast.title}</p>
                    </div>
                  </div>
                )}
              </button>
            ) : null}

            {featuredPodcast ? (
              <button
                onClick={() => handlePlayOrOpen(featuredPodcast)}
                className={`group absolute bottom-1 right-[5%] h-[90%] w-[68%] overflow-hidden rounded-[1.85rem] border p-2 shadow-2xl transition duration-300 hover:scale-[1.02] ${
                  (activeItem?.id === featuredPodcast.id || activePodcast?.id === featuredPodcast.id) && isPlaying
                    ? "border-[#f8ca14] ring-2 ring-[#f8ca14]/50 bg-[#161616]"
                    : dark
                    ? "border-[#f8ca14]/50 bg-[#111111]"
                    : "border-[#08467d]/30 bg-white"
                }`}
                style={{ transform: "rotate(3deg)" }}
                aria-label={`الحلقة الحالية: ${featuredPodcast.title}`}
              >
                <div className="relative h-full overflow-hidden rounded-[1.35rem]">
                  {featuredPodcast.coverUrl ? (
                    <div className="relative h-full w-full">
                      <img
                        src={directDriveImage(featuredPodcast.coverUrl) || featuredPodcast.coverUrl}
                        alt={`غلاف ${featuredPodcast.title}`}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="grid h-16 w-16 place-items-center rounded-full bg-[#f8ca14] text-black shadow-2xl transition group-hover:scale-110">
                          {(activeItem?.id === featuredPodcast.id || activePodcast?.id === featuredPodcast.id) && isPlaying ? (
                            <Pause size={28} />
                          ) : (
                            <Play size={28} className="mr-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`flex h-full flex-col justify-between p-6 text-right ${
                        dark
                          ? "bg-gradient-to-br from-[#1c1500] via-[#0f0f0f] to-black text-[#f8ca14]"
                          : "bg-slate-100 text-[#08467d]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Mic size={42} />
                        {(activeItem?.id === featuredPodcast.id || activePodcast?.id === featuredPodcast.id) && isPlaying && (
                          <div className="flex items-end gap-1 h-6">
                            <span className="w-1 bg-[#f8ca14] animate-[bounce_0.6s_infinite] h-6 rounded-full" />
                            <span className="w-1 bg-[#f8ca14] animate-[bounce_0.8s_infinite] h-4 rounded-full" />
                            <span className="w-1 bg-[#f8ca14] animate-[bounce_0.5s_infinite] h-5 rounded-full" />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f8ca14] px-2.5 py-0.5 text-[10px] font-black text-black">
                          <Sparkles size={11} /> حلقة مميزة
                        </span>
                        <h2 className="mt-2 text-xl font-black leading-snug text-white line-clamp-3">
                          {featuredPodcast.title}
                        </h2>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent px-4 pb-4 pt-16 text-right">
                    <span className="text-[10px] font-black text-[#f8ca14]">
                      {featuredPodcast.category} · {featuredPodcast.duration || "15:00"}
                    </span>
                    <h2 className="mt-1 text-base sm:text-lg font-black text-white line-clamp-2">
                      {featuredPodcast.title}
                    </h2>
                  </div>
                </div>
              </button>
            ) : null}
          </div>

          {/* Text Info */}
          <div className="order-1 md:order-2 text-right">
            <VisualEditable
              id="podcast-hero-kicker"
              tag="text"
              label="شارة أثير العقيق"
              defaultText={orchestration?.heroCovers?.podcastsCustomTag || "أثير العقيق الرقمي · إذاعة وبودكاست"}
              as="div"
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-black ${
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              }`}
            >
              {(text) => (
                <>
                  <Mic size={14} className="animate-pulse" />
                  <span>{text}</span>
                </>
              )}
            </VisualEditable>

            <VisualEditable
              id="podcast-hero-title"
              tag="text"
              label="عنوان صفحة البودكاست"
              defaultText={orchestration?.heroCovers?.podcastsCustomTitle || "صوت ينبض بالحياة والإبداع."}
              as="h1"
              className={`mt-4 text-3xl font-black leading-[1.15] sm:text-4xl md:text-5xl lg:text-6xl ${
                dark ? "text-white" : "text-black"
              }`}
            />

            <VisualEditable
              id="podcast-hero-desc"
              tag="text"
              label="وصف صفحة البودكاست"
              defaultText={orchestration?.heroCovers?.podcastsCustomDesc ||
                "استمع وشاهد حلقات الإذاعة الصباحية، واللقاءات الحوارية التربوية، والتغطيات الصوتية والمرئية لحفلات التخرج والبطولات المدرسية."}
              as="p"
              className={`mt-4 max-w-xl text-xs sm:text-sm leading-7 sm:leading-8 ${dark ? "text-slate-300" : "text-slate-600"}`}
            />

            {/* Stats pills */}
            <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-bold">
              <span
                className={`rounded-full border px-3 py-1.5 ${
                  dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
                }`}
              >
                <Music className={`ml-1 inline ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />
                {songs?.length || 0} أناشيد رسمية
              </span>
              <span
                className={`rounded-full border px-3 py-1.5 ${
                  dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
                }`}
              >
                <Radio className={`ml-1 inline ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />
                {rawPodcasts.length} حلقة منشورة
              </span>
              <span
                className={`rounded-full border px-3 py-1.5 ${
                  dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
                }`}
              >
                <Headphones className={`ml-1 inline ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />
                صوت وفيديو 100%
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              {featuredPodcast ? (
                <button
                  onClick={() => handlePlayOrOpen(featuredPodcast)}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black shadow-lg transition active:scale-95 hover:opacity-90 ${
                    dark
                      ? "!bg-[#f8ca14] !text-black shadow-[0_0_20px_rgba(248,202,20,0.3)]"
                      : "!bg-[#08467d] !text-white shadow-[0_0_20px_rgba(8,70,125,0.2)]"
                  }`}
                >
                  {(activeItem?.id === featuredPodcast.id || activePodcast?.id === featuredPodcast.id) && isPlaying ? (
                    <>
                      <Pause size={15} />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play size={15} className="mr-0.5" />
                      <span>{featuredPodcast.mediaType === "video" ? "مشاهدة الحلقة المميزة" : "استمع للحلقة الآن"}</span>
                    </>
                  )}
                </button>
              ) : null}

              {songs && songs.length > 0 && (
                <button
                  type="button"
                  onClick={() => playSong(0)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black transition ${
                    dark
                      ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                      : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
                  }`}
                >
                  <Disc size={14} className="animate-[spin_4s_linear_infinite]" />
                  <span>تشغيل الأناشيد 🎵</span>
                </button>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate("/atheer/manage")}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black transition ${
                    dark
                      ? "border-purple-400/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                      : "border-purple-600/30 bg-purple-50 text-purple-700 hover:bg-purple-100"
                  }`}
                >
                  <Sparkles size={14} />
                  <span>استوديو أثير 🎙️</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 🌟 2. MAIN IMPERIAL PAVILIONS (أروقة أثير العقيق الملكية) ==================== */}
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 md:px-8 py-8 space-y-10">
        
        {/* Universal Filter & Search Deck */}
        <div
          className={`rounded-2xl sm:rounded-3xl border p-3.5 sm:p-4 transition ${
            dark
              ? "border-amber-400/30 bg-[#090b14]/95 shadow-xl shadow-amber-400/5"
              : "border-slate-200/90 bg-white shadow-sm"
          }`}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {ATHEER_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition border ${
                      active
                        ? dark
                          ? "border-[#f8ca14] bg-[#f8ca14] text-slate-950 shadow-md shadow-[#f8ca14]/25"
                          : "border-[#08467d] bg-[#08467d] text-white shadow-md"
                        : dark
                        ? "border-white/10 bg-black/40 text-slate-300 hover:border-white/30 hover:bg-white/5"
                        : "border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Live Search */}
            <div className="relative w-full lg:w-80">
              <Search size={15} className="absolute top-3 right-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الأناشيد، الحلقات، والمؤلفين..."
                className={`w-full rounded-xl border pr-9 pl-4 py-2 text-xs font-bold outline-none transition ${
                  dark
                    ? "border-white/10 bg-black text-white focus:border-[#f8ca14]"
                    : "border-slate-200 bg-slate-50 text-slate-900 focus:border-[#08467d] focus:bg-white"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className={`absolute top-2.5 left-3 ${dark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-black"}`}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ================= PAVILION 1: 🎙️ صالون خلف المايك (المسموع) ============== */}
        {/* ========================================================================= */}
        {audioPodcasts.length > 0 && (
          <section
            id="audio-pavilion"
            className={`relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border p-4 sm:p-6 pb-4 sm:pb-5 transition ${
              dark
                ? "border-emerald-500/40 bg-gradient-to-b from-[#081814] via-[#090b14] to-[#04060c] shadow-[0_20px_60px_rgba(16,185,129,0.1)]"
                : "border-emerald-200/80 bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 shadow-lg"
            }`}
          >
            {/* Ambient Backlight */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

            {/* Pavilion Header */}
            <div className={`relative flex flex-wrap items-center justify-between gap-3 border-b pb-3 mb-4 ${
              dark ? "border-emerald-500/20" : "border-emerald-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-emerald-400 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/30">
                  <Radio size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black ${
                      dark
                        ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                        : "bg-emerald-100 border-emerald-300 text-emerald-800"
                    }`}>
                      AUDIO LOUNGE · {audioPodcasts.length} حلقات
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                      dark ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-emerald-100/60 text-emerald-900 border-emerald-200"
                    }`}>
                      فريق الإذاعة المدرسية 🎙️
                    </span>
                  </div>
                  <h2 className={`mt-0.5 text-lg sm:text-xl font-black ${dark ? "text-white" : "text-slate-950"}`}>
                    صالون «خلف المايك» والبودكاست المسموع 🎙️
                  </h2>
                </div>
              </div>

              {/* Action Buttons & View Mode Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                <div className={`flex items-center rounded-xl border p-0.5 ${
                  dark ? "border-white/10 bg-black/40" : "border-slate-200 bg-slate-100"
                }`}>
                  <button
                    type="button"
                    onClick={() => setAudioViewMode("carousel")}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black transition ${
                      audioViewMode === "carousel"
                        ? "bg-emerald-500 text-slate-950 shadow-sm"
                        : dark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-black"
                    }`}
                  >
                    <LayoutGrid size={12} />
                    <span>سلايدر صفّين 🎴</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudioViewMode("list")}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black transition ${
                      audioViewMode === "list"
                        ? "bg-emerald-500 text-slate-950 shadow-sm"
                        : dark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-black"
                    }`}
                  >
                    <List size={12} />
                    <span>سلايدر قائمة 📜</span>
                  </button>
                </div>

                {/* Arrow Nav */}
                {audioViewMode === "carousel" ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollHorizontal(audioScrollRef, "right")}
                      className={`grid h-8 w-8 place-items-center rounded-xl border transition active:scale-95 ${
                        dark ? "border-white/10 bg-white/5 text-white hover:bg-emerald-500 hover:text-slate-950" : "border-slate-200 bg-white text-slate-800 hover:bg-emerald-500 hover:text-slate-950 shadow-sm"
                      }`}
                      title="السابق"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollHorizontal(audioScrollRef, "left")}
                      className={`grid h-8 w-8 place-items-center rounded-xl border transition active:scale-95 ${
                        dark ? "border-white/10 bg-white/5 text-white hover:bg-emerald-500 hover:text-slate-950" : "border-slate-200 bg-white text-slate-800 hover:bg-emerald-500 hover:text-slate-950 shadow-sm"
                      }`}
                      title="التالي"
                    >
                      <ChevronLeft size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollVertical(audioListScrollRef, "up")}
                      className={`grid h-8 w-8 place-items-center rounded-xl border transition active:scale-95 ${
                        dark ? "border-white/10 bg-white/5 text-white hover:bg-emerald-500 hover:text-slate-950" : "border-slate-200 bg-white text-slate-800 hover:bg-emerald-500 hover:text-slate-950 shadow-sm"
                      }`}
                      title="تمرير لأعلى"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollVertical(audioListScrollRef, "down")}
                      className={`grid h-8 w-8 place-items-center rounded-xl border transition active:scale-95 ${
                        dark ? "border-white/10 bg-white/5 text-white hover:bg-emerald-500 hover:text-slate-950" : "border-slate-200 bg-white text-slate-800 hover:bg-emerald-500 hover:text-slate-950 shadow-sm"
                      }`}
                      title="تمرير لأسفل"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (audioPodcasts[0]) {
                      setSelectedAudioId(audioPodcasts[0].id);
                      playPodcast(audioPodcasts[0]);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-3.5 py-1.5 text-xs font-black shadow-md shadow-emerald-500/20 transition active:scale-95"
                >
                  <Disc size={14} className="animate-[spin_3s_linear_infinite]" />
                  <span>تشغيل الكل</span>
                </button>
              </div>
            </div>

            {/* Split Grid */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* Master Acoustic Broadcasting Deck Centerpiece */}
              <div className={`lg:col-span-5 flex flex-col justify-between text-center p-4 sm:p-5 rounded-2xl border backdrop-blur-xl shadow-xl h-[380px] sm:h-[390px] ${
                dark ? "border-emerald-500/30 bg-black/60 text-white" : "border-emerald-200 bg-white/95 text-slate-900"
              }`}>
                <div className={`flex items-center justify-between border-b pb-2 ${dark ? "border-white/10" : "border-slate-200"}`}>
                  <span className={`text-[10px] font-black flex items-center gap-1.5 ${dark ? "text-emerald-400" : "text-emerald-700"}`}>
                    <Sparkles size={12} />
                    <span>كابينة البث الإذاعي الحي</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {currentActiveAudio ? currentActiveAudio.duration || "10:00" : "Studio Audio"}
                  </span>
                </div>

                {/* Turntable / Mic Centerpiece */}
                <div className="relative mx-auto my-auto py-1 grid place-items-center">
                  <div className="relative h-28 w-28 sm:h-32 sm:w-32 grid place-items-center">
                    <div className={`absolute inset-0 rounded-full border-4 border-emerald-500/40 bg-[#040d0a] shadow-[0_0_30px_rgba(16,185,129,0.2)] transition ${
                      isCurrentPlaying(currentActiveAudio?.id) ? "border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.35)]" : ""
                    }`} />
                    <div className="absolute inset-2 rounded-full border border-white/10" />
                    <div className="absolute inset-4 rounded-full border border-emerald-500/10" />

                    <div
                      onClick={() => {
                        if (currentActiveAudio) {
                          if (isCurrentPlaying(currentActiveAudio.id)) pausePodcast();
                          else playPodcast(currentActiveAudio);
                        } else if (audioPodcasts[0]) {
                          playPodcast(audioPodcasts[0]);
                        }
                      }}
                      className={`relative cursor-pointer h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 shadow-xl overflow-hidden grid place-items-center ${
                        isCurrentPlaying(currentActiveAudio?.id) ? "animate-[spin_4s_linear_infinite]" : "hover:scale-105 transition duration-300"
                      }`}
                    >
                      {currentActiveAudio?.coverUrl ? (
                        <img
                          src={directDriveImage(currentActiveAudio.coverUrl) || currentActiveAudio.coverUrl}
                          alt=""
                          className="h-full w-full object-cover opacity-90"
                        />
                      ) : (
                        <Mic size={22} className="text-slate-950" />
                      )}
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-black/60 text-emerald-400 backdrop-blur-sm shadow-md">
                          {isCurrentPlaying(currentActiveAudio?.id) ? <Pause size={12} /> : <Play size={12} className="fill-current mr-0.5" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Master Audio Info & Presenter Metadata */}
                <div className="space-y-0.5 my-1">
                  <h3 className={`text-sm sm:text-base font-black line-clamp-1 ${dark ? "text-white" : "text-slate-950"}`}>
                    {currentActiveAudio ? currentActiveAudio.title : "حلقة بودكاست خلف المايك"}
                  </h3>
                  <div className="flex flex-col items-center justify-center">
                    <span className={`text-[11px] font-black ${dark ? "text-emerald-400" : "text-emerald-700"}`}>
                      تقديم: {currentActiveAudio?.hostName || "فريق الإذاعة المدرسية"}
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-bold">إذاعة العقيق الرسمية</span>
                  </div>
                </div>

                {/* Master Interactive Podcast Console */}
                <div className={`rounded-xl border p-2.5 space-y-2 mt-auto ${
                  dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                }`}>
                  <div dir="ltr" className="space-y-0.5">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>{formatAudioTime(currentTime)}</span>
                      <span>{formatAudioTime(duration)}</span>
                    </div>
                    <div className="relative h-2 flex items-center cursor-pointer group/bar">
                      <div className={`h-1.5 w-full rounded-full overflow-hidden ${dark ? "bg-white/15" : "bg-slate-200"}`}>
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-75"
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime || 0}
                        onChange={(e) => seek(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-0.5">
                    <div className="flex items-center gap-1">
                      {currentActiveAudio && (
                        <button
                          type="button"
                          onClick={(e) => handleLikePodcast(currentActiveAudio, e)}
                          className={`flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold transition ${
                            dark ? "border-white/10 hover:bg-rose-500/10 text-rose-400" : "border-slate-200 bg-white hover:bg-rose-50 text-rose-500"
                          }`}
                        >
                          <Heart size={10} className="fill-rose-500/20" />
                          <span>{currentActiveAudio.likesCount || 0}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleShare(currentActiveAudio, e)}
                        className={`rounded-lg border p-1 transition ${
                          dark ? "border-white/10 hover:bg-white/10 text-slate-300" : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                        }`}
                        title="مشاركة البودكاست"
                      >
                        <Share2 size={11} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={playNextPodcast}
                        className={`grid h-7 w-7 place-items-center rounded-full border transition active:scale-95 ${
                          dark ? "border-white/10 bg-white/5 hover:bg-emerald-500 hover:text-slate-950 text-slate-300" : "border-slate-200 bg-white hover:bg-emerald-500 hover:text-slate-950 text-slate-700 shadow-sm"
                        }`}
                        title="الحلقة التالية"
                      >
                        <SkipForward size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (currentActiveAudio) {
                            if (isCurrentPlaying(currentActiveAudio.id)) pausePodcast();
                            else playPodcast(currentActiveAudio);
                          } else if (audioPodcasts[0]) {
                            playPodcast(audioPodcasts[0]);
                          }
                        }}
                        className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/30 transition active:scale-95"
                        title={isCurrentPlaying(currentActiveAudio?.id) ? "إيقاف مؤقت" : "استماع"}
                      >
                        {isCurrentPlaying(currentActiveAudio?.id) ? <Pause size={15} /> : <Play size={15} className="fill-current mr-0.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={handlePrevOrRestart}
                        className={`grid h-7 w-7 place-items-center rounded-full border transition active:scale-95 ${
                          dark ? "border-white/10 bg-white/5 hover:bg-emerald-500 hover:text-slate-950 text-slate-300" : "border-slate-200 bg-white hover:bg-emerald-500 hover:text-slate-950 text-slate-700 shadow-sm"
                        }`}
                        title="الحلقة السابقة"
                      >
                        <SkipBack size={12} />
                      </button>
                    </div>

                    <div dir="ltr" className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="text-slate-400 hover:text-emerald-500 transition p-0.5"
                        title={isMuted || volume === 0 ? "إلغاء الكتم" : "كتم الصوت"}
                      >
                        {isMuted || volume === 0 ? <VolumeX size={13} className="text-rose-400" /> : <Volume2 size={13} className={dark ? "text-emerald-400" : "text-emerald-600"} />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className={`w-10 sm:w-12 h-1 accent-emerald-400 rounded-full cursor-pointer ${dark ? "bg-white/20" : "bg-slate-300"}`}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Media Hub: 2-Row Carousel OR Vertical List Slider */}
              <div className="lg:col-span-7 h-[380px] sm:h-[390px] overflow-hidden">
                {audioViewMode === "carousel" ? (
                  /* ==================== 1. 2-ROWS CAROUSEL HORIZONTAL SCROLL ==================== */
                  <div
                    ref={audioScrollRef}
                    className="grid grid-rows-2 grid-flow-col auto-cols-[280px] sm:auto-cols-[330px] gap-3.5 overflow-x-auto pb-1 pt-0.5 scrollbar-hide snap-x snap-mandatory h-full"
                  >
                    {audioPodcasts.map((podcast: any, idx: number) => {
                      const isThisPlaying = isCurrentPlaying(podcast.id);
                      const isThisActive = currentActiveAudio?.id === podcast.id;
                      return (
                        <div
                          key={podcast.id}
                          className={`group relative flex flex-col justify-between shrink-0 snap-start rounded-2xl border p-3.5 transition duration-300 hover:-translate-y-0.5 ${
                            isThisPlaying || isThisActive
                              ? "border-emerald-400 bg-emerald-500/15 ring-2 ring-emerald-400/40 shadow-[0_8px_20px_rgba(16,185,129,0.18)]"
                              : dark
                              ? "border-white/10 bg-black/40 hover:border-emerald-400/50 hover:bg-black/60 shadow-sm"
                              : "border-slate-200/90 bg-white hover:border-emerald-400 hover:shadow-md shadow-sm"
                          }`}
                        >
                          <div className="flex items-start gap-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleAudioToggle(podcast)}
                              className={`relative h-13 w-13 shrink-0 rounded-xl overflow-hidden border grid place-items-center group-hover:scale-105 transition ${
                                dark ? "border-white/10 bg-black" : "border-slate-200 bg-slate-100"
                              }`}
                            >
                              {podcast.coverUrl ? (
                                <img src={directDriveImage(podcast.coverUrl) || podcast.coverUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <Mic size={20} className="text-emerald-400" />
                              )}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                {isThisPlaying ? <Pause size={13} className="text-white" /> : <Play size={13} className="text-white fill-current" />}
                              </div>
                            </button>

                            <div className="text-right min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-[9px] font-mono font-black uppercase ${dark ? "text-emerald-400" : "text-emerald-700"}`}>
                                  حلقة #{String(idx + 1).padStart(2, "0")}
                                </span>
                                <span className="text-[9px] font-mono text-slate-400">{podcast.duration || "10:00"}</span>
                              </div>

                              <h4
                                onClick={() => handleAudioToggle(podcast)}
                                className={`mt-0.5 text-xs sm:text-sm font-black cursor-pointer line-clamp-1 transition ${
                                  dark ? "text-white hover:text-emerald-300" : "text-slate-900 hover:text-emerald-600"
                                }`}
                              >
                                {podcast.title}
                              </h4>

                              {/* Presenter Name */}
                              <p className="text-[10px] text-slate-500 font-bold truncate flex items-center gap-1 mt-0.5">
                                <User size={10} className={dark ? "text-emerald-400" : "text-emerald-600"} />
                                <span>تقديم: {podcast.hostName || "فريق الإذاعة المدرسية"}</span>
                              </p>
                            </div>
                          </div>

                          {/* Description */}
                          <p className={`mt-2 text-[10.5px] font-bold line-clamp-1 leading-normal rounded-lg p-1.5 text-right border ${
                            dark ? "bg-white/5 border-white/5 text-slate-300" : "bg-slate-50 border-slate-100 text-slate-600"
                          }`}>
                            {podcast.description || "حوار إذاعي تربوي ضمن سلسلة حلقات خلف المايك."}
                          </p>

                          {/* Action Bar */}
                          <div className={`mt-2.5 flex items-center justify-between border-t pt-2 ${dark ? "border-white/10" : "border-slate-100"}`}>
                            <span className={`text-[9px] font-black ${dark ? "text-emerald-400" : "text-emerald-700"}`}>
                              {isThisPlaying ? "🔴 بث مباشر" : "مسموع HD"}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => handleShare(podcast, e)}
                                className={`grid h-6 w-6 place-items-center rounded-lg border transition ${
                                  dark ? "border-white/10 hover:bg-white/10 text-slate-400 hover:text-emerald-400" : "border-slate-200 bg-white hover:bg-slate-100 text-slate-600"
                                }`}
                                title="مشاركة"
                              >
                                <Share2 size={10} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleAudioToggle(podcast)}
                                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black transition shadow-sm ${
                                  isThisPlaying
                                    ? "bg-emerald-500 text-slate-950 font-black shadow-emerald-500/25"
                                    : dark ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950" : "bg-emerald-100 text-emerald-900 hover:bg-emerald-500 hover:text-slate-950"
                                }`}
                              >
                                {isThisPlaying ? <Pause size={10} /> : <Play size={10} className="mr-0.5 fill-current" />}
                                <span>{isThisPlaying ? "إيقاف" : "استماع"}</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ==================== 2. VERTICAL PLAYLIST SLIDER (SAME EXACT BOX) ==================== */
                  <div
                    ref={audioListScrollRef}
                    className={`h-full overflow-y-auto space-y-2 rounded-2xl border p-3 scrollbar-hide snap-y snap-mandatory ${
                      dark ? "border-white/10 bg-black/40" : "border-slate-200 bg-slate-50/80"
                    }`}
                  >
                    {audioPodcasts.map((podcast: any, idx: number) => {
                      const isThisPlaying = isCurrentPlaying(podcast.id);
                      const isThisActive = currentActiveAudio?.id === podcast.id;
                      return (
                        <div
                          key={podcast.id}
                          onClick={() => handleAudioToggle(podcast)}
                          className={`group flex items-center justify-between gap-3 rounded-xl border p-2.5 cursor-pointer transition snap-start ${
                            isThisPlaying || isThisActive
                              ? "border-emerald-400 bg-emerald-500/15 shadow-sm"
                              : dark
                              ? "border-white/5 bg-white/[0.02] hover:border-emerald-400/40 hover:bg-white/[0.06]"
                              : "border-slate-200/80 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="w-6 text-center font-mono text-[11px] font-black text-emerald-400">
                              #{String(idx + 1).padStart(2, "0")}
                            </span>

                            <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-emerald-950 grid place-items-center">
                              {podcast.coverUrl ? (
                                <img src={directDriveImage(podcast.coverUrl) || podcast.coverUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <Mic size={15} className="text-emerald-400" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className={`text-xs sm:text-sm font-black truncate transition ${
                                isThisPlaying || isThisActive
                                  ? "text-emerald-400"
                                  : dark ? "text-white group-hover:text-emerald-300" : "text-slate-900 group-hover:text-emerald-700"
                              }`}>
                                {podcast.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-bold truncate">
                                تقديم: {podcast.hostName || "فريق الإذاعة المدرسية"} · {podcast.duration || "10:00"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => handleLikePodcast(podcast, e)}
                              className={`flex items-center gap-0.5 rounded-lg border px-1.5 py-0.5 text-[9px] font-bold transition ${
                                dark ? "border-white/10 hover:bg-rose-500/10 text-rose-400" : "border-slate-200 bg-slate-50 text-rose-500"
                              }`}
                            >
                              <Heart size={9} className="fill-current" />
                              <span>{podcast.likesCount || 0}</span>
                            </button>

                            <div className={`grid h-7 w-7 place-items-center rounded-lg transition ${
                              isThisPlaying
                                ? "bg-emerald-500 text-slate-950 font-black"
                                : "bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950"
                            }`}>
                              <Play size={11} className="fill-current mr-0.5" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </section>
        )}
        {/* ========================================================================= */}
        {/* ================= PAVILION 2: 🎬 مسرح تحت الضوء (المرئي) ================== */}
        {/* ========================================================================= */}
        {videoPodcasts.length > 0 && (
          <section
            id="videos-pavilion"
            className={`relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border p-4 sm:p-6 pb-4 sm:pb-5 transition ${
              dark
                ? "border-indigo-500/40 bg-gradient-to-b from-[#100d28] via-[#090b14] to-[#04060c] shadow-[0_20px_60px_rgba(99,102,241,0.1)]"
                : "border-indigo-200/80 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 shadow-lg"
            }`}
          >
            {/* Ambient Backlight */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

            {/* Pavilion Header */}
            <div className={`relative flex flex-wrap items-center justify-between gap-3 border-b pb-3 mb-4 ${
              dark ? "border-indigo-500/20" : "border-indigo-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-600/30">
                  <Video size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black ${
                      dark
                        ? "bg-indigo-500/20 border-indigo-400/40 text-indigo-300"
                        : "bg-indigo-100 border-indigo-300 text-indigo-800"
                    }`}>
                      CINEMA 4K · {videoPodcasts.length} حلقات
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                      dark ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" : "bg-indigo-100/60 text-indigo-900 border-indigo-200"
                    }`}>
                      فريق التقديم والإعلام 🎬
                    </span>
                  </div>
                  <h2 className={`mt-0.5 text-lg sm:text-xl font-black ${dark ? "text-white" : "text-slate-950"}`}>
                    مسرح «تحت الضوء» وحلقات الفيديو المرئية 🎬
                  </h2>
                </div>
              </div>

              {/* Action Buttons & View Mode Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                <div className={`flex items-center rounded-xl border p-0.5 ${
                  dark ? "border-white/10 bg-black/40" : "border-slate-200 bg-slate-100"
                }`}>
                  <button
                    type="button"
                    onClick={() => setVideosViewMode("carousel")}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black transition ${
                      videosViewMode === "carousel"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : dark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-black"
                    }`}
                  >
                    <LayoutGrid size={12} />
                    <span>سلايدر صفّين 🎴</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideosViewMode("list")}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black transition ${
                      videosViewMode === "list"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : dark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-black"
                    }`}
                  >
                    <List size={12} />
                    <span>سلايدر قائمة 📜</span>
                  </button>
                </div>

                {/* Arrow Nav */}
                {videosViewMode === "carousel" ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollHorizontal(videosScrollRef, "right")}
                      className={`grid h-8 w-8 place-items-center rounded-xl border transition active:scale-95 ${
                        dark ? "border-white/10 bg-white/5 text-white hover:bg-indigo-600" : "border-slate-200 bg-white text-slate-800 hover:bg-indigo-600 hover:text-white shadow-sm"
                      }`}
                      title="السابق"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollHorizontal(videosScrollRef, "left")}
                      className={`grid h-8 w-8 place-items-center rounded-xl border transition active:scale-95 ${
                        dark ? "border-white/10 bg-white/5 text-white hover:bg-indigo-600" : "border-slate-200 bg-white text-slate-800 hover:bg-indigo-600 hover:text-white shadow-sm"
                      }`}
                      title="التالي"
                    >
                      <ChevronLeft size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollVertical(videosListScrollRef, "up")}
                      className={`grid h-8 w-8 place-items-center rounded-xl border transition active:scale-95 ${
                        dark ? "border-white/10 bg-white/5 text-white hover:bg-indigo-600" : "border-slate-200 bg-white text-slate-800 hover:bg-indigo-600 hover:text-white shadow-sm"
                      }`}
                      title="تمرير لأعلى"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollVertical(videosListScrollRef, "down")}
                      className={`grid h-8 w-8 place-items-center rounded-xl border transition active:scale-95 ${
                        dark ? "border-white/10 bg-white/5 text-white hover:bg-indigo-600" : "border-slate-200 bg-white text-slate-800 hover:bg-indigo-600 hover:text-white shadow-sm"
                      }`}
                      title="تمرير لأسفل"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (videoPodcasts[0]) {
                      setSelectedVideoId(videoPodcasts[0].id);
                      setInlinePlayingVideoId(videoPodcasts[0].id);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-3.5 py-1.5 text-xs font-black shadow-md shadow-indigo-600/20 transition active:scale-95"
                >
                  <Play size={14} className="fill-current mr-0.5" />
                  <span>مشاهدة أحدث حلقة</span>
                </button>
              </div>
            </div>

            {/* Split Grid */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* Master 4K Video Screen Centerpiece */}
              <div className={`lg:col-span-5 flex flex-col justify-between text-center p-4 sm:p-5 rounded-2xl border backdrop-blur-xl shadow-xl h-[380px] sm:h-[390px] ${
                dark ? "border-indigo-500/30 bg-black/60 text-white" : "border-indigo-200 bg-white/95 text-slate-900"
              }`}>
                <div className={`flex items-center justify-between border-b pb-2 ${dark ? "border-white/10" : "border-slate-200"}`}>
                  <span className={`text-[10px] font-black flex items-center gap-1.5 ${dark ? "text-indigo-400" : "text-indigo-700"}`}>
                    <Sparkles size={12} />
                    <span>شاشة العرض المركزية 4K</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {currentActiveVideo ? currentActiveVideo.duration || "12:00" : "4K UHD"}
                  </span>
                </div>

                {/* 16:9 Cinema Box */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)] my-auto">
                  {inlinePlayingVideoId === currentActiveVideo?.id && currentActiveVideo ? (
                    isEmbeddableVideo(currentActiveVideo.mediaUrl) ? (
                      <iframe
                        src={getVideoEmbedUrl(currentActiveVideo.mediaUrl)}
                        title={currentActiveVideo.title}
                        className="h-full w-full border-0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : (
                      <video
                        src={currentActiveVideo.mediaUrl}
                        controls
                        autoPlay
                        onPlay={() => {
                          window.dispatchEvent(new CustomEvent("aqeeq-video-start", {
                            detail: {
                              id: currentActiveVideo.id,
                              title: currentActiveVideo.title,
                              coverUrl: currentActiveVideo.coverUrl,
                              hostName: currentActiveVideo.hostName,
                              mediaUrl: currentActiveVideo.mediaUrl,
                            }
                          }));
                        }}
                        onPause={() => window.dispatchEvent(new CustomEvent("aqeeq-video-pause"))}
                        onTimeUpdate={(e) => {
                          window.dispatchEvent(new CustomEvent("aqeeq-video-progress", {
                            detail: {
                              currentTime: e.currentTarget.currentTime,
                              duration: e.currentTarget.duration,
                            }
                          }));
                        }}
                        onEnded={() => window.dispatchEvent(new CustomEvent("aqeeq-video-ended"))}
                        className="h-full w-full object-contain"
                      />
                    )
                  ) : (
                    <div
                      onClick={() => {
                        if (currentActiveVideo) {
                          handlePlayVideoInline(currentActiveVideo.id);
                        }
                      }}
                      className="group/screen relative h-full w-full cursor-pointer overflow-hidden"
                    >
                      {currentActiveVideo?.coverUrl ? (
                        <img
                          src={directDriveImage(currentActiveVideo.coverUrl) || currentActiveVideo.coverUrl}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover/screen:scale-105"
                        />
                      ) : (
                        <div className="grid h-full place-items-center bg-indigo-950/40">
                          <Video size={40} className="text-indigo-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                      
                      <div className="absolute top-2.5 right-2.5 rounded-md bg-indigo-600/90 backdrop-blur-md px-2 py-0.5 text-[9px] font-black text-white shadow-sm flex items-center gap-1">
                        <Video size={10} /> مرئي 4K
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] group-hover/screen:scale-115 transition duration-300">
                          <Play size={20} className="fill-current mr-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Master Video Info & Presenter Metadata */}
                <div className="space-y-0.5 my-1 text-right">
                  <h3 className={`text-sm sm:text-base font-black line-clamp-1 ${dark ? "text-white" : "text-slate-950"}`}>
                    {currentActiveVideo ? currentActiveVideo.title : "حلقة مميزة تحت الضوء"}
                  </h3>
                  <p className={`text-[11px] font-bold ${dark ? "text-indigo-400" : "text-indigo-700"}`}>
                    تقديم وإعداد: {currentActiveVideo?.hostName || "فريق التقديم والإعلام المدرسي"}
                  </p>
                </div>

                <div className={`rounded-xl border p-2.5 flex items-center justify-between gap-2 mt-auto ${
                  dark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-700"
                }`}>
                  <span className="text-[9.5px] font-black">
                    {inlinePlayingVideoId === currentActiveVideo?.id ? "🔴 جاري العرض..." : "جاهز للمشاهدة"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {currentActiveVideo && (
                      <button
                        type="button"
                        onClick={(e) => handleLikePodcast(currentActiveVideo, e)}
                        className={`flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold transition ${
                          dark ? "border-white/10 hover:bg-rose-500/10 text-rose-400" : "border-slate-200 bg-white hover:bg-rose-50 text-rose-500"
                        }`}
                      >
                        <Heart size={10} className="fill-rose-500/20" />
                        <span>{currentActiveVideo.likesCount || 0}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleShare(currentActiveVideo, e)}
                      className={`rounded-lg border p-1 transition ${
                        dark ? "border-white/10 hover:bg-white/10 text-slate-300" : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                      }`}
                      title="مشاركة الفيديو"
                    >
                      <Share2 size={11} />
                    </button>
                    {inlinePlayingVideoId === currentActiveVideo?.id && (
                      <button
                        type="button"
                        onClick={() => handleOpenVideoModal(currentActiveVideo)}
                        className="rounded-lg border border-indigo-400/40 bg-indigo-500/20 hover:bg-indigo-500 text-white px-2 py-0.5 text-[10px] font-black transition flex items-center gap-1"
                      >
                        <Maximize2 size={10} />
                        <span>تكبير</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Media Hub: 2-Row Carousel OR Vertical List Slider */}
              <div className="lg:col-span-7 h-[380px] sm:h-[390px] overflow-hidden">
                {videosViewMode === "carousel" ? (
                  /* ==================== 1. 2-ROWS CAROUSEL HORIZONTAL SCROLL ==================== */
                  <div
                    ref={videosScrollRef}
                    className="grid grid-rows-2 grid-flow-col auto-cols-[280px] sm:auto-cols-[330px] gap-3.5 overflow-x-auto pb-1 pt-0.5 scrollbar-hide snap-x snap-mandatory h-full"
                  >
                    {videoPodcasts.map((video: any, idx: number) => {
                      const isThisActive = currentActiveVideo?.id === video.id;
                      const isThisPlaying = inlinePlayingVideoId === video.id;
                      return (
                        <div
                          key={video.id}
                          className={`group relative flex flex-col justify-between shrink-0 snap-start rounded-2xl border p-3.5 transition duration-300 hover:-translate-y-0.5 ${
                            isThisActive
                              ? "border-indigo-400 bg-indigo-500/15 ring-2 ring-indigo-400/40 shadow-[0_8px_20px_rgba(99,102,241,0.18)]"
                              : dark
                              ? "border-white/10 bg-black/40 hover:border-indigo-400/50 hover:bg-black/60 shadow-sm"
                              : "border-slate-200/90 bg-white hover:border-indigo-400 hover:shadow-md shadow-sm"
                          }`}
                        >
                          <div className="flex items-start gap-3 text-right">
                            {/* Video Thumbnail */}
                            <button
                              type="button"
                              onClick={() => handlePlayVideoInline(video.id)}
                              className={`relative h-13 w-20 shrink-0 rounded-xl overflow-hidden border group-hover:scale-105 transition ${
                                dark ? "border-white/10 bg-black" : "border-slate-200 bg-slate-100"
                              }`}
                            >
                              {video.coverUrl ? (
                                <img src={directDriveImage(video.coverUrl) || video.coverUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="grid h-full place-items-center bg-indigo-950/40">
                                  <Video size={16} className="text-indigo-400" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="grid h-5 w-5 place-items-center rounded-full bg-indigo-600 text-white shadow-sm">
                                  <Play size={9} className="fill-current mr-0.5" />
                                </div>
                              </div>
                            </button>

                            <div className="text-right min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-[9px] font-mono font-black uppercase ${dark ? "text-indigo-400" : "text-indigo-700"}`}>
                                  حلقة #{String(idx + 1).padStart(2, "0")}
                                </span>
                                <span className="text-[9px] font-mono text-slate-400">{video.duration || "12:00"}</span>
                              </div>

                              <h4
                                onClick={() => handlePlayVideoInline(video.id)}
                                className={`mt-0.5 text-xs sm:text-sm font-black cursor-pointer truncate transition ${
                                  dark ? "text-white hover:text-indigo-300" : "text-slate-900 hover:text-indigo-600"
                                }`}
                              >
                                {video.title}
                              </h4>

                              {/* Presenter Name */}
                              <p className="text-[10px] text-slate-500 font-bold truncate flex items-center gap-1 mt-0.5">
                                <User size={10} className={dark ? "text-indigo-400" : "text-indigo-600"} />
                                <span>تقديم: {video.hostName || "فريق الإعلام والتقديم"}</span>
                              </p>
                            </div>
                          </div>

                          {/* Description */}
                          <p className={`mt-2 text-[10.5px] font-bold line-clamp-1 leading-normal rounded-lg p-1.5 text-right border ${
                            dark ? "bg-white/5 border-white/5 text-slate-300" : "bg-slate-50 border-slate-100 text-slate-600"
                          }`}>
                            {video.description || "تغطية وحوار خاص ضمن سلسلة برامج تحت الضوء."}
                          </p>

                          {/* Action Bar */}
                          <div className={`mt-2.5 flex items-center justify-between border-t pt-2 ${dark ? "border-white/10" : "border-slate-100"}`}>
                            <span className={`text-[9px] font-black ${dark ? "text-indigo-400" : "text-indigo-700"}`}>مرئي 4K</span>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => handleShare(video, e)}
                                className={`grid h-6 w-6 place-items-center rounded-lg border transition ${
                                  dark ? "border-white/10 hover:bg-white/10 text-slate-400 hover:text-indigo-400" : "border-slate-200 bg-white hover:bg-slate-100 text-slate-600"
                                }`}
                                title="مشاركة"
                              >
                                <Share2 size={10} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handlePlayVideoInline(video.id)}
                                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black transition shadow-sm ${
                                  isThisPlaying
                                    ? "bg-indigo-600 text-white font-black shadow-indigo-600/25"
                                    : dark ? "bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white" : "bg-indigo-100 text-indigo-900 hover:bg-indigo-600 hover:text-white"
                                }`}
                              >
                                <Play size={10} className="mr-0.5 fill-current" />
                                <span>{isThisPlaying ? "جاري العرض" : "تشغيل"}</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ==================== 2. VERTICAL PLAYLIST SLIDER (SAME EXACT BOX) ==================== */
                  <div
                    ref={videosListScrollRef}
                    className={`h-full overflow-y-auto space-y-2 rounded-2xl border p-3 scrollbar-hide snap-y snap-mandatory ${
                      dark ? "border-white/10 bg-black/40" : "border-slate-200 bg-slate-50/80"
                    }`}
                  >
                    {videoPodcasts.map((video: any, idx: number) => {
                      const isThisActive = currentActiveVideo?.id === video.id;
                      return (
                        <div
                          key={video.id}
                          onClick={() => handlePlayVideoInline(video.id)}
                          className={`group flex items-center justify-between gap-3 rounded-xl border p-2.5 cursor-pointer transition snap-start ${
                            isThisActive
                              ? "border-indigo-400 bg-indigo-500/15 shadow-sm"
                              : dark
                              ? "border-white/5 bg-white/[0.02] hover:border-indigo-400/40 hover:bg-white/[0.06]"
                              : "border-slate-200/80 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="w-6 text-center font-mono text-[11px] font-black text-indigo-400">
                              #{String(idx + 1).padStart(2, "0")}
                            </span>

                            <div className="relative h-10 w-14 shrink-0 rounded-lg overflow-hidden bg-black">
                              {video.coverUrl ? (
                                <img src={directDriveImage(video.coverUrl) || video.coverUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="grid h-full place-items-center bg-indigo-950">
                                  <Video size={13} className="text-indigo-400" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className={`text-xs sm:text-sm font-black truncate transition ${
                                isThisActive
                                  ? "text-indigo-400"
                                  : dark ? "text-white group-hover:text-indigo-300" : "text-slate-900 group-hover:text-indigo-700"
                              }`}>
                                {video.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-bold truncate">
                                تقديم: {video.hostName || "فريق الإعلام"} · {video.duration || "12:00"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => handleLikePodcast(video, e)}
                              className={`flex items-center gap-0.5 rounded-lg border px-1.5 py-0.5 text-[9px] font-bold transition ${
                                dark ? "border-white/10 hover:bg-rose-500/10 text-rose-400" : "border-slate-200 bg-slate-50 text-rose-500"
                              }`}
                            >
                              <Heart size={9} className="fill-current" />
                              <span>{video.likesCount || 0}</span>
                            </button>

                            <div className={`grid h-7 w-7 place-items-center rounded-lg transition ${
                              isThisActive
                                ? "bg-indigo-600 text-white font-black"
                                : "bg-indigo-600/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white"
                            }`}>
                              <Play size={11} className="fill-current mr-0.5" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* ================= PAVILION 3: 🎵 ديوان الأناشيد والكورال الملكي ================= */}
        {/* ========================================================================= */}
        {filteredSongs && filteredSongs.length > 0 && (
          <section
            id="anthems-pavilion"
            className={`relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border p-4 sm:p-6 pb-4 sm:pb-5 transition ${
              dark
                ? "border-amber-400/40 bg-gradient-to-b from-[#141208] via-[#090b14] to-[#04060c] shadow-[0_20px_60px_rgba(248,202,20,0.1)]"
                : "border-amber-200/80 bg-gradient-to-b from-amber-50/70 via-white to-slate-50 shadow-lg"
            }`}
          >
            {/* Background Ambient Glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

            {/* Pavilion Header */}
            <div className={`relative flex flex-wrap items-center justify-between gap-3 border-b pb-3 mb-4 ${
              dark ? "border-amber-400/20" : "border-amber-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-500 text-slate-950 shadow-md shadow-amber-400/30">
                  <Music size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black ${
                      dark
                        ? "bg-amber-400/20 border-amber-400/40 text-amber-300"
                        : "bg-amber-100 border-amber-300 text-amber-800"
                    }`}>
                      ROYAL DISCOGRAPHY · {filteredSongs.length} نشيداً
                    </span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold ${
                      dark ? "bg-white/5 text-slate-300 border-white/10" : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}>
                      مدارس العقيق الأهلية والدولية
                    </span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold ${
                      dark ? "bg-amber-400/10 text-amber-300 border-amber-400/30" : "bg-amber-100/70 text-amber-900 border-amber-300"
                    }`}>
                      إنتاج: قسم التربية الموسيقية 🎼
                    </span>
                  </div>
                  <h2 className={`mt-0.5 text-lg sm:text-xl font-black ${dark ? "text-white" : "text-slate-950"}`}>
                    ديوان الأسطوانات وأناشيد العقيق الرسمية 🎵
                  </h2>
                </div>
              </div>

              {/* Action Buttons & View Mode Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                <div className={`flex items-center rounded-xl border p-0.5 ${
                  dark ? "border-white/10 bg-black/40" : "border-slate-200 bg-slate-100"
                }`}>
                  <button
                    type="button"
                    onClick={() => setSongsViewMode("carousel")}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black transition ${
                      songsViewMode === "carousel"
                        ? "bg-amber-400 text-slate-950 shadow-sm"
                        : dark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-black"
                    }`}
                  >
                    <LayoutGrid size={12} />
                    <span>سلايدر صفّين 🎴</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSongsViewMode("list")}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black transition ${
                      songsViewMode === "list"
                        ? "bg-amber-400 text-slate-950 shadow-sm"
                        : dark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-black"
                    }`}
                  >
                    <List size={12} />
                    <span>سلايدر قائمة 📜</span>
                  </button>
                </div>

                {/* Arrow Nav (Horizontal in Carousel / Vertical in List) */}
                {songsViewMode === "carousel" ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollHorizontal(songsScrollRef, "right")}
                      className={`grid h-8 w-8 place-items-center rounded-xl border transition active:scale-95 ${
                        dark ? "border-white/10 bg-white/5 text-white hover:bg-amber-400 hover:text-slate-950" : "border-slate-200 bg-white text-slate-800 hover:bg-amber-400 hover:text-slate-950 shadow-sm"
                      }`}
                      title="السابق"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollHorizontal(songsScrollRef, "left")}
                      className={`grid h-8 w-8 place-items-center rounded-xl border transition active:scale-95 ${
                        dark ? "border-white/10 bg-white/5 text-white hover:bg-amber-400 hover:text-slate-950" : "border-slate-200 bg-white text-slate-800 hover:bg-amber-400 hover:text-slate-950 shadow-sm"
                      }`}
                      title="التالي"
                    >
                      <ChevronLeft size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollVertical(songsListScrollRef, "up")}
                      className={`grid h-8 w-8 place-items-center rounded-xl border transition active:scale-95 ${
                        dark ? "border-white/10 bg-white/5 text-white hover:bg-amber-400 hover:text-slate-950" : "border-slate-200 bg-white text-slate-800 hover:bg-amber-400 hover:text-slate-950 shadow-sm"
                      }`}
                      title="تمرير لأعلى"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollVertical(songsListScrollRef, "down")}
                      className={`grid h-8 w-8 place-items-center rounded-xl border transition active:scale-95 ${
                        dark ? "border-white/10 bg-white/5 text-white hover:bg-amber-400 hover:text-slate-950" : "border-slate-200 bg-white text-slate-800 hover:bg-amber-400 hover:text-slate-950 shadow-sm"
                      }`}
                      title="تمرير لأسفل"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => playSong(0)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 px-3.5 py-1.5 text-xs font-black shadow-md shadow-amber-400/20 transition active:scale-95"
                >
                  <Disc size={14} className="animate-[spin_3s_linear_infinite]" />
                  <span>تشغيل الكل</span>
                </button>
              </div>
            </div>

            {/* Pavilion Layout: Exactly Balanced Height */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* Grand Dynamic Vinyl Deck Centerpiece */}
              <div className={`lg:col-span-5 flex flex-col justify-between text-center p-4 sm:p-5 rounded-2xl border backdrop-blur-xl shadow-xl h-[380px] sm:h-[390px] ${
                dark ? "border-amber-400/30 bg-black/60 text-white" : "border-amber-200 bg-white/95 text-slate-900"
              }`}>
                
                <div className={`flex items-center justify-between border-b pb-2 ${dark ? "border-white/10" : "border-slate-200"}`}>
                  <span className={`text-[10px] font-black flex items-center gap-1.5 ${dark ? "text-amber-400" : "text-amber-700"}`}>
                    <Sparkles size={12} />
                    <span>مشغل الأسطوانة الذهبية الحي</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activeItem ? activeItem.title : "تراك #01"}
                  </span>
                </div>

                {/* Disc Graphic */}
                <div className="relative mx-auto my-auto py-1 grid place-items-center">
                  <div className="relative h-28 w-28 sm:h-32 sm:w-32 grid place-items-center">
                    <div className={`absolute inset-0 rounded-full border-4 border-amber-400/40 bg-[#05060a] shadow-[0_0_30px_rgba(248,202,20,0.2)] transition ${
                      isPlaying ? "border-amber-400 shadow-[0_0_40px_rgba(248,202,20,0.35)]" : ""
                    }`} />
                    <div className="absolute inset-2 rounded-full border border-white/10" />
                    <div className="absolute inset-4 rounded-full border border-amber-400/10" />

                    <div
                      onClick={() => {
                        if (activeItem) {
                          if (isPlaying) pausePodcast();
                          else playSong(activeItem);
                        } else {
                          playSong(0);
                        }
                      }}
                      className={`relative cursor-pointer h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 shadow-xl overflow-hidden grid place-items-center ${
                        isPlaying ? "animate-[spin_4s_linear_infinite]" : "hover:scale-105 transition duration-300"
                      }`}
                    >
                      <img
                        src={dark ? "/audio-default-cover-dark.svg" : "/audio-default-cover-light.svg"}
                        alt=""
                        className="h-full w-full object-cover opacity-90"
                      />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-black/60 text-amber-400 backdrop-blur-sm shadow-md">
                          {isPlaying ? <Pause size={12} /> : <Play size={12} className="fill-current mr-0.5" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disc Info with Department Authorship */}
                <div className="space-y-0.5 my-1">
                  <h3 className={`text-sm sm:text-base font-black line-clamp-1 ${dark ? "text-white" : "text-slate-950"}`}>
                    {activeItem ? activeItem.title : songs[0]?.title || "نشيد صرح العقيق"}
                  </h3>
                  <div className="flex flex-col items-center justify-center">
                    <span className={`text-[11px] font-black ${dark ? "text-amber-400" : "text-amber-700"}`}>
                      إنتاج: قسم التربية الموسيقية 🎼
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-bold">
                      مدارس العقيق الأهلية والدولية
                    </span>
                  </div>
                </div>

                {/* Master Console */}
                <div className={`rounded-xl border p-2.5 space-y-2 mt-auto ${
                  dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                }`}>
                  <div dir="ltr" className="space-y-0.5">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>{formatAudioTime(currentTime)}</span>
                      <span>{formatAudioTime(duration)}</span>
                    </div>
                    <div className="relative h-2 flex items-center cursor-pointer group/bar">
                      <div className={`h-1.5 w-full rounded-full overflow-hidden ${dark ? "bg-white/15" : "bg-slate-200"}`}>
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-75"
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime || 0}
                        onChange={(e) => seek(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-0.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleLikeSong(activeItem || songs[0], e)}
                        className={`flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold transition ${
                          likedSongIds.includes(String((activeItem || songs[0])?.id || "song-0"))
                            ? "border-rose-500/40 bg-rose-500/20 text-rose-400"
                            : dark ? "border-white/10 hover:bg-rose-500/10 text-rose-400" : "border-slate-200 bg-white hover:bg-rose-50 text-rose-500"
                        }`}
                        title="إعجاب بالنشيد"
                      >
                        <Heart
                          size={11}
                          className={likedSongIds.includes(String((activeItem || songs[0])?.id || "song-0")) ? "fill-rose-500 text-rose-500" : "fill-rose-500/20"}
                        />
                        <span>{songLikes[String((activeItem || songs[0])?.id || "song-0")] || 142}</span>
                      </button>

                      {activeItem?.lyrics && (
                        <button
                          type="button"
                          onClick={() => setSelectedLyricsSong(activeItem)}
                          className={`rounded-lg border px-2 py-0.5 text-[9px] font-black transition ${
                            dark
                              ? "border-amber-400/40 bg-amber-400/10 hover:bg-amber-400 hover:text-slate-950 text-amber-300"
                              : "border-amber-300 bg-amber-100 hover:bg-amber-400 hover:text-slate-950 text-amber-800"
                          }`}
                          title="ديوان الكلمات"
                        >
                          📜 كلمات
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleShare(activeItem || songs[0], e)}
                        className={`rounded-lg border p-1 transition ${
                          dark ? "border-white/10 hover:bg-white/10 text-slate-300" : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                        }`}
                        title="مشاركة"
                      >
                        <Share2 size={11} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={playNextSong}
                        className={`grid h-7 w-7 place-items-center rounded-full border transition active:scale-95 ${
                          dark ? "border-white/10 bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-slate-300" : "border-slate-200 bg-white hover:bg-amber-400 hover:text-slate-950 text-slate-700 shadow-sm"
                        }`}
                        title="النشيد التالي"
                      >
                        <SkipForward size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (activeItem) togglePlay();
                          else playSong(0);
                        }}
                        className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-400/30 transition active:scale-95"
                        title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                      >
                        {isPlaying ? <Pause size={15} /> : <Play size={15} className="fill-current mr-0.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={playPrevSong}
                        className={`grid h-7 w-7 place-items-center rounded-full border transition active:scale-95 ${
                          dark ? "border-white/10 bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-slate-300" : "border-slate-200 bg-white hover:bg-amber-400 hover:text-slate-950 text-slate-700 shadow-sm"
                        }`}
                        title="النشيد السابق"
                      >
                        <SkipBack size={12} />
                      </button>
                    </div>

                    <div dir="ltr" className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="text-slate-400 hover:text-amber-500 transition p-0.5"
                        title={isMuted || volume === 0 ? "إلغاء الكتم" : "كتم الصوت"}
                      >
                        {isMuted || volume === 0 ? <VolumeX size={13} className="text-rose-400" /> : <Volume2 size={13} className={dark ? "text-amber-400" : "text-amber-600"} />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className={`w-10 sm:w-12 h-1 accent-amber-400 rounded-full cursor-pointer ${dark ? "bg-white/20" : "bg-slate-300"}`}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Media Hub: 2-Row Carousel OR Vertical List Slider (Both occupy EXACT SAME space) */}
              <div className="lg:col-span-7 h-[380px] sm:h-[390px] overflow-hidden">
                {songsViewMode === "carousel" ? (
                  /* ==================== 1. 2-ROWS CAROUSEL HORIZONTAL SCROLL ==================== */
                  <div
                    ref={songsScrollRef}
                    className="grid grid-rows-2 grid-flow-col auto-cols-[280px] sm:auto-cols-[330px] gap-3.5 overflow-x-auto pb-1 pt-0.5 scrollbar-hide snap-x snap-mandatory h-full"
                  >
                    {(filteredSongs || []).map((song: any, idx: number) => {
                      const isThisPlaying = isCurrentPlaying(song.id);
                      return (
                        <div
                          key={song.id || idx}
                          className={`group relative flex flex-col justify-between shrink-0 snap-start rounded-2xl border p-3.5 transition duration-300 hover:-translate-y-0.5 ${
                            isThisPlaying
                              ? "border-amber-400 bg-amber-400/15 ring-2 ring-amber-400/40 shadow-[0_8px_20px_rgba(248,202,20,0.18)]"
                              : dark
                              ? "border-white/10 bg-black/40 hover:border-amber-400/50 hover:bg-black/60 shadow-sm"
                              : "border-slate-200/90 bg-white hover:border-amber-400 hover:shadow-md shadow-sm"
                          }`}
                        >
                          {/* Top: Disc & Title */}
                          <div className="flex items-start gap-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleSongToggle(song)}
                              className={`relative h-13 w-13 shrink-0 rounded-xl overflow-hidden border grid place-items-center group-hover:scale-105 transition ${
                                dark ? "border-white/10 bg-black" : "border-slate-200 bg-slate-100"
                              }`}
                            >
                              <Disc size={26} className={`text-amber-400 ${isThisPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`} />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                {isThisPlaying ? <Pause size={13} className="text-white" /> : <Play size={13} className="text-white fill-current" />}
                              </div>
                            </button>

                            <div className="text-right min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-[9px] font-mono font-black uppercase ${dark ? "text-amber-400" : "text-amber-700"}`}>
                                  تراك #{String(idx + 1).padStart(2, "0")}
                                </span>
                                <span className="text-[9px] font-mono text-slate-400">03:45</span>
                              </div>

                              <h4
                                onClick={() => handleSongToggle(song)}
                                className={`mt-0.5 text-xs sm:text-sm font-black cursor-pointer truncate transition ${
                                  dark ? "text-white hover:text-amber-300" : "text-slate-900 hover:text-amber-600"
                                }`}
                              >
                                {song.title}
                              </h4>

                              {/* Department of Music Authorship */}
                              <p className="text-[10px] text-slate-500 font-bold truncate flex items-center gap-1 mt-0.5">
                                <span className={dark ? "text-amber-400 font-black" : "text-amber-700 font-black"}>
                                  إنتاج: قسم التربية الموسيقية
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Song Lyric / Desc */}
                          <p className={`mt-2 text-[10.5px] font-bold line-clamp-1 leading-normal rounded-lg p-1.5 text-right border ${
                            dark ? "bg-white/5 border-white/5 text-slate-300" : "bg-slate-50 border-slate-100 text-slate-600"
                          }`}>
                            {song.description || "نشيد رسمي معتمد ضمن ديوان أسطوانات العقيق."}
                          </p>

                          {/* Action Bar */}
                          <div className={`mt-2.5 flex items-center justify-between border-t pt-2 ${dark ? "border-white/10" : "border-slate-100"}`}>
                            {song.lyrics ? (
                              <button
                                type="button"
                                onClick={() => setSelectedLyricsSong(song)}
                                className={`text-[10px] font-black flex items-center gap-1 ${
                                  dark ? "text-amber-400 hover:text-amber-300" : "text-amber-700 hover:text-amber-800"
                                }`}
                              >
                                <FileText size={11} />
                                <span>ديوان الكلمات</span>
                              </button>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-bold">نشيد رسمي</span>
                            )}

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => handleLikeSong(song, e)}
                                className={`flex items-center gap-0.5 rounded-lg border px-2 py-0.5 text-[9px] font-bold transition ${
                                  likedSongIds.includes(String(song.id || `song-${idx}`))
                                    ? "border-rose-500/40 bg-rose-500/20 text-rose-400"
                                    : dark ? "border-white/10 hover:bg-rose-500/10 text-rose-400" : "border-slate-200 bg-white hover:bg-rose-50 text-rose-500"
                                }`}
                                title="إعجاب بالنشيد"
                              >
                                <Heart
                                  size={10}
                                  className={likedSongIds.includes(String(song.id || `song-${idx}`)) ? "fill-rose-500 text-rose-500" : "fill-rose-500/20"}
                                />
                                <span>{songLikes[String(song.id || `song-${idx}`)] || 98}</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleShare(song, e)}
                                className={`grid h-6 w-6 place-items-center rounded-lg border transition ${
                                  dark ? "border-white/10 hover:bg-white/10 text-slate-400 hover:text-emerald-400" : "border-slate-200 bg-white hover:bg-slate-100 text-slate-600"
                                }`}
                                title="مشاركة"
                              >
                                <Share2 size={10} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSongToggle(song)}
                                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black transition shadow-sm ${
                                  isThisPlaying
                                    ? "bg-amber-400 text-slate-950 font-black shadow-amber-400/25"
                                    : dark ? "bg-amber-400/15 text-amber-300 hover:bg-amber-400 hover:text-slate-950" : "bg-amber-100 text-amber-900 hover:bg-amber-400 hover:text-slate-950"
                                }`}
                              >
                                {isThisPlaying ? <Pause size={10} /> : <Play size={10} className="mr-0.5 fill-current" />}
                                <span>{isThisPlaying ? "إيقاف" : "استماع"}</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ==================== 2. VERTICAL PLAYLIST SLIDER (SAME EXACT BOX) ==================== */
                  <div
                    ref={songsListScrollRef}
                    className={`h-full overflow-y-auto space-y-2 rounded-2xl border p-3 scrollbar-hide snap-y snap-mandatory ${
                      dark ? "border-white/10 bg-black/40" : "border-slate-200 bg-slate-50/80"
                    }`}
                  >
                    {(filteredSongs || []).map((song: any, idx: number) => {
                      const isThisPlaying = isCurrentPlaying(song.id);
                      return (
                        <div
                          key={song.id || idx}
                          onClick={() => handleSongToggle(song)}
                          className={`group flex items-center justify-between gap-3 rounded-xl border p-2.5 cursor-pointer transition snap-start ${
                            isThisPlaying
                              ? "border-amber-400 bg-amber-400/15 shadow-sm"
                              : dark
                              ? "border-white/5 bg-white/[0.02] hover:border-amber-400/40 hover:bg-white/[0.06]"
                              : "border-slate-200/80 bg-white hover:border-amber-300 hover:bg-amber-50/50 shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className={`w-6 text-center font-mono text-[11px] font-black ${
                              isThisPlaying ? "text-amber-400" : "text-slate-400"
                            }`}>
                              {isThisPlaying ? (
                                <Disc size={14} className="animate-[spin_3s_linear_infinite] text-amber-400 mx-auto" />
                              ) : (
                                `#${String(idx + 1).padStart(2, "0")}`
                              )}
                            </span>

                            <div className="min-w-0 flex-1">
                              <h4 className={`text-xs sm:text-sm font-black truncate transition ${
                                isThisPlaying
                                  ? "text-amber-400"
                                  : dark ? "text-white group-hover:text-amber-300" : "text-slate-900 group-hover:text-amber-700"
                              }`}>
                                {song.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-bold truncate">
                                إنتاج: قسم التربية الموسيقية
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {song.lyrics && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLyricsSong(song);
                                }}
                                className={`rounded-lg border px-1.5 py-0.5 text-[9px] font-black transition ${
                                  dark ? "border-amber-400/30 bg-amber-400/10 text-amber-300" : "border-amber-200 bg-amber-50 text-amber-800"
                                }`}
                              >
                                📜 كلمات
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleLikeSong(song, e)}
                              className={`flex items-center gap-0.5 rounded-lg border px-1.5 py-0.5 text-[9px] font-bold transition ${
                                dark ? "border-white/10 hover:bg-rose-500/10 text-rose-400" : "border-slate-200 bg-slate-50 text-rose-500"
                              }`}
                            >
                              <Heart size={9} className="fill-current" />
                              <span>{songLikes[String(song.id || `song-${idx}`)] || 98}</span>
                            </button>

                            <div className={`grid h-7 w-7 place-items-center rounded-lg transition ${
                              isThisPlaying
                                ? "bg-amber-400 text-slate-950 font-black"
                                : "bg-amber-400/20 text-amber-500 group-hover:bg-amber-400 group-hover:text-slate-950"
                            }`}>
                              {isThisPlaying ? <Pause size={11} /> : <Play size={11} className="fill-current mr-0.5" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </section>
        )}


      </div>

      {/* Video Modal Player */}
      {watchingVideoPodcast && (
        <Dialog open={Boolean(watchingVideoPodcast)} onOpenChange={() => setWatchingVideoPodcast(null)}>
          <DialogContent className={`max-w-4xl rounded-3xl border p-6 text-right ${
            dark ? "border-indigo-500/40 bg-[#0a0c16] text-white" : "border-slate-200 bg-white text-slate-900 shadow-2xl"
          }`} dir="rtl">
            <div className="space-y-4">
              <div className={`flex items-center justify-between border-b pb-3 ${dark ? "border-white/10" : "border-slate-200"}`}>
                <span className="rounded-lg bg-indigo-600 text-white px-2.5 py-0.5 text-xs font-black">{watchingVideoPodcast.category}</span>
                <h3 className="text-base font-black truncate">{watchingVideoPodcast.title}</h3>
              </div>
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl">
                {isEmbeddableVideo(watchingVideoPodcast.mediaUrl) ? (
                  <iframe
                    src={getVideoEmbedUrl(watchingVideoPodcast.mediaUrl)}
                    title={watchingVideoPodcast.title}
                    className="h-full w-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <video
                    src={watchingVideoPodcast.mediaUrl}
                    controls
                    autoPlay
                    onPlay={() => {
                      window.dispatchEvent(new CustomEvent("aqeeq-video-start", {
                        detail: {
                          id: watchingVideoPodcast.id,
                          title: watchingVideoPodcast.title,
                          coverUrl: watchingVideoPodcast.coverUrl,
                          hostName: watchingVideoPodcast.hostName,
                          mediaUrl: watchingVideoPodcast.mediaUrl,
                        }
                      }));
                    }}
                    onPause={() => window.dispatchEvent(new CustomEvent("aqeeq-video-pause"))}
                    onTimeUpdate={(e) => {
                      window.dispatchEvent(new CustomEvent("aqeeq-video-progress", {
                        detail: {
                          currentTime: e.currentTarget.currentTime,
                          duration: e.currentTarget.duration,
                        }
                      }));
                    }}
                    onEnded={() => window.dispatchEvent(new CustomEvent("aqeeq-video-ended"))}
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
              <p className={`text-xs sm:text-sm font-bold leading-relaxed ${dark ? "text-slate-400" : "text-slate-600"}`}>
                {watchingVideoPodcast.description}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Lyrics Modal */}
      {selectedLyricsSong && (
        <Dialog open={Boolean(selectedLyricsSong)} onOpenChange={() => setSelectedLyricsSong(null)}>
          <DialogContent className={`max-w-xl rounded-3xl border p-6 text-right ${
            dark ? "border-amber-400/40 bg-[#0a0c16] text-white" : "border-slate-200 bg-white text-slate-900 shadow-2xl"
          }`} dir="rtl">
            <div className="space-y-4 text-center">
              <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black ${
                dark ? "bg-amber-400/20 text-amber-300 border-amber-400/30" : "bg-amber-100 text-amber-800 border-amber-200"
              }`}>
                <FileText size={13} /> كلمات النشيد الرسمي
              </span>
              <h3 className={`text-xl font-black ${dark ? "text-amber-400" : "text-amber-700"}`}>{selectedLyricsSong.title}</h3>
              <div className="flex flex-col items-center justify-center gap-0.5">
                <span className={`text-xs font-black ${dark ? "text-amber-400" : "text-amber-700"}`}>
                  إنتاج: قسم التربية الموسيقية 🎼
                </span>
                <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  مدارس العقيق الأهلية والدولية
                </span>
              </div>
              <div className={`max-h-72 overflow-y-auto rounded-2xl border p-5 text-sm font-bold leading-8 whitespace-pre-line text-center ${
                dark ? "bg-black/60 border-white/10 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
              }`}>
                {selectedLyricsSong.lyrics || "لا تتوفر كلمات مكتوبة لهذا النشيد حالياً."}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
