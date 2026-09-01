import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { usePodcastPlayer } from "@/components/AqeeqFloatingPodcastPlayer";
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
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const ATHEER_CATEGORIES = [
  { id: "all", label: "🌟 جميع الأروقة" },
  { id: "songs", label: "🎵 أناشيد وكورال العقيق" },
  { id: "videos", label: "🎬 تحت الضوء (مرئي)" },
  { id: "audio", label: "🎙️ خلف المايك (مسموع)" },
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
  
  // YouTube URLs
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&enablejsapi=1`;
  }

  // Google Drive URLs
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
        return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
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
        return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [rawPodcasts, selectedCategory, searchQuery]);

  const filteredSongs = useMemo(() => {
    if (selectedCategory === "videos" || selectedCategory === "audio") return [];
    return (songs || []).filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return s.title.toLowerCase().includes(q) || (s.artistOrHost && s.artistOrHost.toLowerCase().includes(q));
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

  // Sync video changes from the floating player
  useEffect(() => {
    const handleVideoChange = (e: any) => {
      const vidId = e.detail?.id;
      if (vidId) {
        setSelectedVideoId(vidId);
        setInlinePlayingVideoId(vidId);
      }
    };
    window.addEventListener("aqeeq-video-change", handleVideoChange as EventListener);
    return () => {
      window.removeEventListener("aqeeq-video-change", handleVideoChange as EventListener);
    };
  }, []);

  // Unified items list for Signature 3D & Master Console
  const unifiedItems = useMemo(() => {
    const list: any[] = [];
    (songs || []).forEach((s, idx) => {
      list.push({
        id: s.id || `song-${idx}`,
        title: s.title,
        description: s.description || "النشيد المعتمد لمدارس وكورال العقيق الأهلية والدولية.",
        category: s.category || "أناشيد العقيق",
        artistOrHost: s.artistOrHost || "كورال ومدارس العقيق",
        mediaType: "song",
        mediaUrl: s.audioUrl,
        coverUrl: s.coverUrl,
        duration: "03:45",
        originalItem: s,
      });
    });
    (rawPodcasts || []).forEach((p) => {
      list.push({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        artistOrHost: p.hostName || "فريق الإذاعة المدرسية",
        mediaType: p.mediaType,
        mediaUrl: p.mediaUrl,
        coverUrl: p.coverUrl,
        duration: p.duration || "10:00",
        viewCount: p.viewCount || 0,
        likesCount: p.likesCount || 0,
        originalItem: p,
      });
    });
    return list;
  }, [songs, rawPodcasts]);

  const filteredUnifiedItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      if (selectedCategory === "songs" && item.mediaType !== "song") return false;
      if (selectedCategory === "videos" && item.mediaType !== "video") return false;
      if (
        selectedCategory !== "all" &&
        selectedCategory !== "songs" &&
        selectedCategory !== "videos" &&
        item.category !== selectedCategory
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.artistOrHost && item.artistOrHost.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [unifiedItems, selectedCategory, searchQuery]);
  const handlePlayOrOpen = (item: any) => {
    if (item.mediaType === "video") {
      handleOpenVideoModal(item.originalItem || item);
    } else if (item.mediaType === "song") {
      playSong(item.originalItem || item);
    } else {
      if ((activeItem?.id === item.id || activePodcast?.id === item.id) && isPlaying) {
        pausePodcast();
      } else {
        playPodcast(item.originalItem || item);
      }
    }
  };

  const [songLikes, setSongLikes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("aqeeq_song_likes");
      return saved ? JSON.parse(saved) : { "song-0": 142, "song-1": 98, "song-2": 116, "song-3": 89 };
    } catch {
      return { "song-0": 142, "song-1": 98, "song-2": 116, "song-3": 89 };
    }
  });

  const [likedSongIds, setLikedSongIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("aqeeq_liked_song_ids");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleLikeSong = (song: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const songId = String(song?.id || "song-0");
    const alreadyLiked = likedSongIds.includes(songId);
    
    const nextLiked = alreadyLiked
      ? likedSongIds.filter((id) => id !== songId)
      : [...likedSongIds, songId];
    
    const nextLikes = {
      ...songLikes,
      [songId]: (songLikes[songId] || 100) + (alreadyLiked ? -1 : 1),
    };

    setLikedSongIds(nextLiked);
    setSongLikes(nextLikes);
    try {
      localStorage.setItem("aqeeq_liked_song_ids", JSON.stringify(nextLiked));
      localStorage.setItem("aqeeq_song_likes", JSON.stringify(nextLikes));
    } catch {}

    if (!alreadyLiked) {
      toast.success(`شكراً لإعجابك بنشيد «${song?.title || "العقيق"}» ❤️`);
    }
  };

  const handleShare = (item: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = window.location.origin + `/atheer#${item.id}`;
    const text = `استمع إلى: «${item.title}» عبر منصة أثير العقيق 🎙️📻\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleLike = (item: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (item.mediaType !== "song") {
      likeMutation.mutate({ id: item.id });
    } else {
      handleLikeSong(item, e);
    }
  };

  const isCurrentPlaying = (id: string | number) => {
    return isPlaying && (String(activeItem?.id) === String(id) || String(activePodcast?.id) === String(id));
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

      {/* ==================== 1. EXACT ORIGINAL 3D TILTED HERO COVER ==================== */}
      <section
        className={`relative isolate overflow-hidden border-b ${
          dark ? "border-white/[0.08] bg-black text-white" : "border-black/[0.06] bg-white text-black"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_18%,rgba(248,202,20,0.12),transparent_25%)]" />

        <div className="relative mx-auto grid max-w-[1380px] items-center gap-8 px-4 sm:px-6 md:px-8 py-12 md:grid-cols-[minmax(390px,.9fr)_minmax(0,1.1fr)] md:py-16 lg:gap-16">
          {/* 3D Tilted Dual-Cover */}
          <div className="relative order-2 mx-auto h-[360px] w-full max-w-[580px] md:order-1 md:h-[470px]">
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
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-black ${
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              }`}
            >
              <Mic size={14} className="animate-pulse" />
              <span>{orchestration?.heroCovers?.podcastsCustomTag || "أثير العقيق الرقمي · إذاعة وبودكاست"}</span>
            </div>

            <h1
              className={`mt-5 text-4xl font-black leading-[1.14] md:text-6xl ${
                dark ? "text-white" : "text-black"
              }`}
            >
              {orchestration?.heroCovers?.podcastsCustomTitle || "صوت ينبض بالحياة والإبداع."}
            </h1>

            <p className={`mt-5 max-w-xl text-sm leading-8 ${dark ? "text-slate-300" : "text-slate-600"}`}>
              {orchestration?.heroCovers?.podcastsCustomDesc ||
                "استمع وشاهد حلقات الإذاعة الصباحية، واللقاءات الحوارية التربوية، والتغطيات الصوتية والمرئية لحفلات التخرج والبطولات المدرسية."}
            </p>

            {/* Stats pills */}
            <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-bold text-slate-400">
              <span
                className={`rounded-full border px-3 py-2 ${
                  dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
                }`}
              >
                <Music className={`ml-1 inline ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />
                {songs?.length || 0} أناشيد رسمية
              </span>
              <span
                className={`rounded-full border px-3 py-2 ${
                  dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
                }`}
              >
                <Radio className={`ml-1 inline ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />
                {rawPodcasts.length} حلقة منشورة
              </span>
              <span
                className={`rounded-full border px-3 py-2 ${
                  dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
                }`}
              >
                <Headphones className={`ml-1 inline ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />
                صوت وفيديو 100%
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="mt-7 flex flex-wrap gap-3">
              {featuredPodcast ? (
                <button
                  onClick={() => handlePlayOrOpen(featuredPodcast)}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-black shadow-lg transition active:scale-95 hover:opacity-90 ${
                    dark
                      ? "!bg-[#f8ca14] !text-black shadow-[0_0_20px_rgba(248,202,20,0.3)]"
                      : "!bg-[#08467d] !text-white shadow-[0_0_20px_rgba(8,70,125,0.2)]"
                  }`}
                >
                  {(activeItem?.id === featuredPodcast.id || activePodcast?.id === featuredPodcast.id) && isPlaying ? (
                    <>
                      <Pause size={16} />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} className="mr-0.5" />
                      <span>{featuredPodcast.mediaType === "video" ? "مشاهدة الحلقة المميزة" : "استمع للحلقة الآن"}</span>
                    </>
                  )}
                </button>
              ) : null}

              {songs && songs.length > 0 && (
                <button
                  type="button"
                  onClick={() => playSong(0)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-black transition ${
                    dark
                      ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                      : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
                  }`}
                >
                  <Disc size={15} className="animate-[spin_4s_linear_infinite]" />
                  <span>تشغيل أسطوانات الأناشيد 🎵</span>
                </button>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate("/atheer/manage")}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-black transition ${
                    dark
                      ? "border-purple-400/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                      : "border-purple-600/30 bg-purple-50 text-purple-700 hover:bg-purple-100"
                  }`}
                >
                  <Sparkles size={15} />
                  <span>دخول استوديو أثير العقيق 🎙️</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 🌟 2. MAIN IMPERIAL PAVILIONS (أروقة أثير العقيق الملكية) ==================== */}
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 md:px-8 py-10 space-y-14">
        
        {/* Universal Filter & Search Deck */}
        <div
          className={`rounded-3xl border p-4 sm:p-5 transition ${
            dark ? "border-amber-400/30 bg-[#090b14]/95 shadow-xl shadow-amber-400/5" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {ATHEER_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-2xl px-4 py-2 text-xs font-black transition border ${
                      active
                        ? dark
                          ? "border-[#f8ca14] bg-[#f8ca14] text-slate-950 shadow-md shadow-[#f8ca14]/25"
                          : "border-[#08467d] bg-[#08467d] text-white shadow-md"
                        : dark
                        ? "border-white/10 bg-black/40 text-slate-300 hover:border-white/30 hover:bg-white/5"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Live Search */}
            <div className="relative w-full lg:w-80">
              <Search size={16} className="absolute top-3.5 right-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الأناشيد، الحلقات، والضيوف..."
                className={`w-full rounded-2xl border pr-10 pl-4 py-2.5 text-xs font-bold outline-none transition ${
                  dark ? "border-white/10 bg-black text-white focus:border-[#f8ca14]" : "border-slate-200 bg-slate-50 text-slate-900 focus:border-[#08467d]"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute top-3 left-3 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* ================= PAVILION 1: 🎵 ديوان الأناشيد والكورال الملكي ================= */}
        {/* ========================================================================= */}
        {filteredSongs && filteredSongs.length > 0 && (
          <section
            id="anthems-pavilion"
            className={`relative overflow-hidden rounded-[2.5rem] border p-6 sm:p-10 transition ${
              dark
                ? "border-amber-400/40 bg-gradient-to-b from-[#141208] via-[#090b14] to-[#04060c] shadow-[0_24px_70px_rgba(248,202,20,0.12)]"
                : "border-amber-200/80 bg-gradient-to-b from-amber-50/50 via-white to-slate-50 shadow-xl"
            }`}
          >
            {/* Background Ambient Glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

            {/* Pavilion Header */}
            <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-amber-400/20 pb-5 mb-8">
              <div className="flex items-center gap-3.5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-500 text-slate-950 shadow-lg shadow-amber-400/30">
                  <Music size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 text-[9px] font-black text-amber-300">
                      ROYAL VINYL DISCOGRAPHY · إصدار رسمي
                    </span>
                    <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-mono text-slate-400">
                      Master HD 96kHz
                    </span>
                  </div>
                  <h2 className="mt-1 text-xl sm:text-2xl font-black text-white">ديوان الأسطوانات وأناشيد العقيق الرسمية 🎵</h2>
                  <p className="text-xs text-slate-300 font-bold mt-0.5">
                    الإنتاج الموسيقي والنشيد المعتمد لمدارس وكورال العقيق الأهلية والدولية
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => playSong(0)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 px-5 py-2.5 text-xs font-black shadow-lg shadow-amber-400/25 transition active:scale-95"
                >
                  <Disc size={16} className="animate-[spin_3s_linear_infinite]" />
                  <span>تشغيل ديوان الأناشيد كاملاً 🎵</span>
                </button>
              </div>
            </div>

            {/* Pavilion Layout: Grand Dynamic Vinyl Turntable (4.5 cols) + 4 Royal Vinyl Sleeves (7.5 cols) */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Grand Dynamic Vinyl Deck Centerpiece */}
              <div className="lg:col-span-5 text-center p-6 rounded-3xl border border-amber-400/30 bg-black/60 backdrop-blur-xl shadow-2xl space-y-5">
                
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-[10px] font-black text-amber-400 flex items-center gap-1.5">
                    <Sparkles size={12} />
                    <span>مشغل الأسطوانة الذهبية الحي</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activeItem ? activeItem.title : "تراك #01"}
                  </span>
                </div>

                {/* Massive Interactive Vinyl Disc */}
                <div className="relative mx-auto h-48 w-48 sm:h-56 sm:w-56 grid place-items-center">
                  {/* Concentric Gold Grooves */}
                  <div className={`absolute inset-0 rounded-full border-4 border-amber-400/40 bg-[#05060a] shadow-[0_0_40px_rgba(248,202,20,0.2)] transition ${
                    isPlaying ? "border-amber-400 shadow-[0_0_50px_rgba(248,202,20,0.35)]" : ""
                  }`} />
                  <div className="absolute inset-3 rounded-full border border-white/10" />
                  <div className="absolute inset-6 rounded-full border border-amber-400/10" />
                  <div className="absolute inset-9 rounded-full border border-white/10" />
                  <div className="absolute inset-12 rounded-full border border-white/5" />

                  {/* Center Disc Artwork */}
                  <div
                    onClick={() => {
                      if (activeItem) {
                        if (isPlaying) pausePodcast();
                        else playSong(activeItem);
                      } else {
                        playSong(0);
                      }
                    }}
                    className={`relative cursor-pointer h-24 w-24 rounded-full bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 shadow-2xl overflow-hidden grid place-items-center ${
                      isPlaying ? "animate-[spin_4s_linear_infinite]" : "hover:scale-105 transition duration-300"
                    }`}
                  >
                    <img
                      src={dark ? "/audio-default-cover-dark.svg" : "/audio-default-cover-light.svg"}
                      alt=""
                      className="h-full w-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-black/60 text-amber-400 backdrop-blur-sm shadow-md">
                        {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-current mr-0.5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disc Info & Controls */}
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-white line-clamp-1">
                    {activeItem ? activeItem.title : songs[0]?.title || "نشيد صرح العقيق"}
                  </h3>
                  <p className="text-xs text-amber-400 font-bold">
                    {activeItem ? activeItem.artistOrHost : songs[0]?.artistOrHost || "كورال ومدارس العقيق"}
                  </p>
                </div>

                {/* Master Interactive Player Console */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-3">
                  
                  {/* Progress Seek Scrubber (Left-to-Right: 0:00 on Left, Total on Right) */}
                  <div dir="ltr" className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{formatAudioTime(currentTime)}</span>
                      <span>{formatAudioTime(duration)}</span>
                    </div>
                    <div className="relative h-2 flex items-center cursor-pointer group/bar">
                      <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
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

                  {/* Playback Transport, Share & Volume Controls in RTL */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    
                    {/* 1. RIGHT: Like, Lyrics, Share */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleLikeSong(activeItem || songs[0], e)}
                        className={`flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-bold transition ${
                          likedSongIds.includes(String((activeItem || songs[0])?.id || "song-0"))
                            ? "border-rose-500/40 bg-rose-500/20 text-rose-400"
                            : "border-white/10 hover:bg-rose-500/10 text-rose-400"
                        }`}
                        title="إعجاب بالنشيد"
                      >
                        <Heart
                          size={12}
                          className={likedSongIds.includes(String((activeItem || songs[0])?.id || "song-0")) ? "fill-rose-500 text-rose-500" : "fill-rose-500/20"}
                        />
                        <span>{songLikes[String((activeItem || songs[0])?.id || "song-0")] || 142}</span>
                      </button>

                      {activeItem?.lyrics && (
                        <button
                          type="button"
                          onClick={() => setSelectedLyricsSong(activeItem)}
                          className="rounded-xl border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400 hover:text-slate-950 text-amber-300 px-2.5 py-1 text-[10px] font-black transition"
                          title="ديوان الكلمات"
                        >
                          📜 كلمات
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleShare(activeItem || songs[0], e)}
                        className="rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 p-1.5 transition"
                        title="مشاركة"
                      >
                        <Share2 size={13} />
                      </button>
                    </div>

                    {/* 2. CENTER: Transport Buttons (السابق | تشغيل/إيقاف | التالي) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={playNextSong}
                        className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-slate-300 transition active:scale-95"
                        title="النشيد التالي"
                      >
                        <SkipForward size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (activeItem) togglePlay();
                          else playSong(0);
                        }}
                        className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 transition active:scale-95"
                        title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                      >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-current mr-0.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={playPrevSong}
                        className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-slate-300 transition active:scale-95"
                        title="النشيد السابق"
                      >
                        <SkipBack size={14} />
                      </button>
                    </div>

                    {/* 3. LEFT: Volume Slider & Mute (dir="ltr": Left = 0, Right = 100) */}
                    <div dir="ltr" className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="text-slate-400 hover:text-amber-400 transition p-1"
                        title={isMuted || volume === 0 ? "إلغاء الكتم" : "كتم الصوت"}
                      >
                        {isMuted || volume === 0 ? <VolumeX size={15} className="text-rose-400" /> : <Volume2 size={15} className="text-amber-400" />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-12 sm:w-16 h-1 bg-white/20 accent-amber-400 rounded-full cursor-pointer"
                      />
                    </div>

                  </div>

                </div>

              </div>

              {/* 4 Royal Vinyl Sleeves Cards */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(songs || []).map((song, idx) => {
                  const isThisPlaying = isCurrentPlaying(song.id);
                  return (
                    <div
                      key={song.id || idx}
                      className={`group relative flex flex-col justify-between rounded-3xl border p-4.5 transition duration-300 hover:-translate-y-1 ${
                        isThisPlaying
                          ? "border-amber-400 bg-amber-400/15 ring-2 ring-amber-400/40 shadow-[0_16px_40px_rgba(248,202,20,0.2)]"
                          : "border-white/10 bg-black/40 hover:border-amber-400/50 hover:bg-black/60 shadow-lg"
                      }`}
                    >
                      <div className="flex items-start gap-3.5 text-right">
                        {/* Mini Vinyl Art */}
                        <button
                          type="button"
                          onClick={() => playSong(song)}
                          className="relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-black grid place-items-center group-hover:scale-105 transition"
                        >
                          <Disc size={32} className={`text-amber-400 ${isThisPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`} />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            {isThisPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white fill-current" />}
                          </div>
                        </button>

                        <div className="text-right min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-black text-amber-400 uppercase">تراك #{String(idx + 1).padStart(2, "0")}</span>
                            <span className="text-[9px] font-mono text-slate-400">03:45</span>
                          </div>

                          <h4
                            onClick={() => playSong(song)}
                            className="mt-1 text-xs sm:text-sm font-black text-white hover:text-amber-300 cursor-pointer truncate transition"
                          >
                            {song.title}
                          </h4>

                          <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">
                            {song.artistOrHost || "كورال ومدارس العقيق"}
                          </p>
                        </div>
                      </div>

                      {/* Song Description / Lyric Snip */}
                      <p className="mt-3 text-[11px] text-slate-300 font-bold line-clamp-2 leading-relaxed bg-white/5 border border-white/5 rounded-xl p-2 text-right">
                        {song.description || "النشيد الرسمي المعتمد لصرح العقيق الأهلية والدولية."}
                      </p>

                      {/* Action Bar */}
                      <div className="mt-3.5 flex items-center justify-between border-t border-white/10 pt-2.5">
                        {song.lyrics ? (
                          <button
                            type="button"
                            onClick={() => setSelectedLyricsSong(song)}
                            className="text-[11px] font-black text-amber-400 hover:text-amber-300 flex items-center gap-1"
                          >
                            <FileText size={12} />
                            <span>ديوان الكلمات</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold">نشيد رسمي</span>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleLikeSong(song, e)}
                            className={`flex items-center gap-1 rounded-xl border px-2 py-1 text-[10px] font-bold transition ${
                              likedSongIds.includes(String(song.id || `song-${idx}`))
                                ? "border-rose-500/40 bg-rose-500/20 text-rose-400"
                                : "border-white/10 hover:bg-rose-500/10 text-rose-400"
                            }`}
                            title="إعجاب بالنشيد"
                          >
                            <Heart
                              size={11}
                              className={likedSongIds.includes(String(song.id || `song-${idx}`)) ? "fill-rose-500 text-rose-500" : "fill-rose-500/20"}
                            />
                            <span>{songLikes[String(song.id || `song-${idx}`)] || 98}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleShare(song, e)}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition"
                            title="مشاركة"
                          >
                            <Share2 size={11} />
                          </button>

                          <button
                            type="button"
                            onClick={() => playSong(song)}
                            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-black transition shadow-sm ${
                              isThisPlaying
                                ? "bg-amber-400 text-slate-950 font-black shadow-amber-400/25"
                                : "bg-amber-400/15 text-amber-300 hover:bg-amber-400 hover:text-slate-950"
                            }`}
                          >
                            {isThisPlaying ? <Pause size={11} /> : <Play size={11} className="mr-0.5 fill-current" />}
                            <span>{isThisPlaying ? "إيقاف" : "استماع للنشيد"}</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
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
            className={`relative overflow-hidden rounded-[2.5rem] border p-6 sm:p-10 transition ${
              dark
                ? "border-indigo-500/40 bg-gradient-to-b from-[#100d28] via-[#090b14] to-[#04060c] shadow-[0_24px_70px_rgba(99,102,241,0.12)]"
                : "border-indigo-200/80 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 shadow-xl"
            }`}
          >
            {/* Ambient Backlight */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

            {/* Pavilion Header */}
            <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-indigo-500/20 pb-5 mb-8">
              <div className="flex items-center gap-3.5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-600/30">
                  <Video size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-500/20 border border-indigo-400/40 px-2.5 py-0.5 text-[9px] font-black text-indigo-300">
                      CINEMA THEATER 4K · تحت الضوء
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{videoPodcasts.length} حلقات منشورة</span>
                  </div>
                  <h2 className="mt-1 text-xl sm:text-2xl font-black text-white">مسرح «تحت الضوء» وحلقات الفيديو المرئية 🎬</h2>
                  <p className="text-xs text-slate-300 font-bold mt-0.5">
                    اللقاءات الحوارية والتغطيات المرئية الوثائقية بدقة فائقة 4K
                  </p>
                </div>
              </div>

              {/* Action Button: Play First Video */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (videoPodcasts[0]) {
                      setSelectedVideoId(videoPodcasts[0].id);
                      setInlinePlayingVideoId(videoPodcasts[0].id);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-5 py-2.5 text-xs font-black shadow-lg shadow-indigo-600/25 transition active:scale-95"
                >
                  <Play size={16} className="fill-current mr-0.5" />
                  <span>مشاهدة أحدث حلقة مرئية 🎬</span>
                </button>
              </div>
            </div>

            {/* Split Grid: Master 4K Video Screen (5 cols) + Video Episodes Cards Grid (7 cols) */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Master 4K Video Screen Centerpiece */}
              <div className="lg:col-span-5 text-center p-5 sm:p-6 rounded-3xl border border-indigo-500/30 bg-black/60 backdrop-blur-xl shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-[10px] font-black text-indigo-400 flex items-center gap-1.5">
                    <Sparkles size={12} />
                    <span>شاشة العرض المركزية 4K</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {currentActiveVideo ? currentActiveVideo.duration || "12:00" : "4K UHD"}
                  </span>
                </div>

                {/* 16:9 Cinema Box */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
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
                          <Video size={48} className="text-indigo-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                      
                      <div className="absolute top-3 right-3 rounded-lg bg-indigo-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-white shadow-md flex items-center gap-1">
                        <Video size={11} /> تحت الضوء · مرئي
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.6)] group-hover/screen:scale-115 transition duration-300">
                          <Play size={26} className="fill-current mr-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Master Video Info & Action Controls */}
                <div className="space-y-1 text-right">
                  <h3 className="text-base sm:text-lg font-black text-white line-clamp-1">
                    {currentActiveVideo ? currentActiveVideo.title : "حلقة مميزة تحت الضوء"}
                  </h3>
                  <p className="text-xs text-indigo-400 font-bold">
                    {currentActiveVideo ? currentActiveVideo.hostName || "فريق الإذاعة والإعلام" : "لقاءات قيادات العقيق"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black text-slate-300">
                    {inlinePlayingVideoId === currentActiveVideo?.id ? "🔴 جاري العرض السينمائي..." : "جاهز للمشاهدة الفورية"}
                  </span>

                  <div className="flex items-center gap-2">
                    {currentActiveVideo && (
                      <button
                        type="button"
                        onClick={(e) => handleLike(currentActiveVideo, e)}
                        className="flex items-center gap-1 rounded-xl border border-white/10 hover:bg-rose-500/10 text-rose-400 px-3 py-1 text-[11px] font-bold transition"
                      >
                        <Heart size={12} className="fill-rose-500/20" />
                        <span>{currentActiveVideo.likesCount || 0}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleShare(currentActiveVideo, e)}
                      className="rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 p-1.5 transition"
                      title="مشاركة الفيديو"
                    >
                      <Share2 size={13} />
                    </button>
                    {inlinePlayingVideoId === currentActiveVideo?.id && (
                      <button
                        type="button"
                        onClick={() => handleOpenVideoModal(currentActiveVideo)}
                        className="rounded-xl border border-indigo-400/40 bg-indigo-500/20 hover:bg-indigo-500 text-white px-3 py-1 text-[11px] font-black transition flex items-center gap-1"
                      >
                        <Maximize2 size={12} />
                        <span>تكبير</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* 4 Video Episodes Cards Grid (7 cols) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videoPodcasts.map((video, idx) => {
                  const isThisActive = currentActiveVideo?.id === video.id;
                  const isThisPlaying = inlinePlayingVideoId === video.id;
                  return (
                    <div
                      key={video.id}
                      className={`group relative flex flex-col justify-between rounded-3xl border p-4 transition duration-300 hover:-translate-y-1 ${
                        isThisActive
                          ? "border-indigo-400 bg-indigo-500/15 ring-2 ring-indigo-400/40 shadow-[0_16px_40px_rgba(99,102,241,0.2)]"
                          : "border-white/10 bg-black/40 hover:border-indigo-400/50 hover:bg-black/60 shadow-lg"
                      }`}
                    >
                      <div className="flex items-start gap-3.5 text-right">
                        {/* Video Thumbnail */}
                        <button
                          type="button"
                          onClick={() => handlePlayVideoInline(video.id)}
                          className="relative h-16 w-24 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-black group-hover:scale-105 transition"
                        >
                          {video.coverUrl ? (
                            <img src={directDriveImage(video.coverUrl) || video.coverUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full place-items-center bg-indigo-950/40">
                              <Video size={20} className="text-indigo-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="grid h-7 w-7 place-items-center rounded-full bg-indigo-600 text-white shadow-md">
                              <Play size={12} className="fill-current mr-0.5" />
                            </div>
                          </div>
                        </button>

                        <div className="text-right min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-black text-indigo-400 uppercase">حلقة #{String(idx + 1).padStart(2, "0")}</span>
                            <span className="text-[9px] font-mono text-slate-400">{video.duration || "12:00"}</span>
                          </div>

                          <h4
                            onClick={() => handlePlayVideoInline(video.id)}
                            className="mt-1 text-xs sm:text-sm font-black text-white hover:text-indigo-300 cursor-pointer truncate transition"
                          >
                            {video.title}
                          </h4>

                          <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">
                            {video.hostName || "فريق الإذاعة"}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mt-3 text-[11px] text-slate-300 font-bold line-clamp-2 leading-relaxed bg-white/5 border border-white/5 rounded-xl p-2 text-right">
                        {video.description || "تغطية وحوار خاص ضمن سلسلة برامج تحت الضوء."}
                      </p>

                      {/* Action Bar */}
                      <div className="mt-3.5 flex items-center justify-between border-t border-white/10 pt-2.5">
                        <span className="text-[10px] font-black text-indigo-400">مرئي 4K</span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleShare(video, e)}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 hover:bg-white/10 text-slate-400 hover:text-indigo-400 transition"
                            title="مشاركة"
                          >
                            <Share2 size={11} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePlayVideoInline(video.id)}
                            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-black transition shadow-sm ${
                              isThisPlaying
                                ? "bg-indigo-600 text-white font-black shadow-indigo-600/25"
                                : "bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white"
                            }`}
                          >
                            <Play size={11} className="mr-0.5 fill-current" />
                            <span>{isThisPlaying ? "جاري العرض" : "تشغيل بالمربع"}</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* ================= PAVILION 3: 🎙️ صالون خلف المايك (المسموع) ============== */}
        {/* ========================================================================= */}
        {audioPodcasts.length > 0 && (
          <section
            id="audio-pavilion"
            className={`relative overflow-hidden rounded-[2.5rem] border p-6 sm:p-10 transition ${
              dark
                ? "border-emerald-500/40 bg-gradient-to-b from-[#081814] via-[#090b14] to-[#04060c] shadow-[0_24px_70px_rgba(16,185,129,0.12)]"
                : "border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 shadow-xl"
            }`}
          >
            {/* Ambient Backlight */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

            {/* Pavilion Header */}
            <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/20 pb-5 mb-8">
              <div className="flex items-center gap-3.5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-emerald-400 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30">
                  <Radio size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[9px] font-black text-emerald-300">
                      LIVE AUDIO LOUNGE · خلف المايك
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{audioPodcasts.length} حلقات مسموعة</span>
                  </div>
                  <h2 className="mt-1 text-xl sm:text-2xl font-black text-white">صالون «خلف المايك» والبودكاست المسموع 🎙️</h2>
                  <p className="text-xs text-slate-300 font-bold mt-0.5">
                    حوارات قيادات المدارس، البرامج الإذاعية الصباحية، واللقاءات التربوية المسموعة
                  </p>
                </div>
              </div>

              {/* Action Button: Play First Podcast */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (audioPodcasts[0]) {
                      setSelectedAudioId(audioPodcasts[0].id);
                      playPodcast(audioPodcasts[0]);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-5 py-2.5 text-xs font-black shadow-lg shadow-emerald-500/25 transition active:scale-95"
                >
                  <Disc size={16} className="animate-[spin_3s_linear_infinite]" />
                  <span>تشغيل صالون البودكاست كاملاً 🎙️</span>
                </button>
              </div>
            </div>

            {/* Split Grid: Master Broadcast Acoustic Deck (5 cols) + Audio Episodes Cards Grid (7 cols) */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Master Acoustic Broadcasting Deck Centerpiece */}
              <div className="lg:col-span-5 text-center p-6 rounded-3xl border border-emerald-500/30 bg-black/60 backdrop-blur-xl shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1.5">
                    <Sparkles size={12} />
                    <span>كابينة البث الإذاعي الحي</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {currentActiveAudio ? currentActiveAudio.duration || "10:00" : "Studio Audio"}
                  </span>
                </div>

                {/* Interactive Acoustic Turntable / Mic Centerpiece */}
                <div className="relative mx-auto h-48 w-48 sm:h-56 sm:w-56 grid place-items-center">
                  <div className={`absolute inset-0 rounded-full border-4 border-emerald-500/40 bg-[#040d0a] shadow-[0_0_40px_rgba(16,185,129,0.2)] transition ${
                    isCurrentPlaying(currentActiveAudio?.id) ? "border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.35)]" : ""
                  }`} />
                  <div className="absolute inset-3 rounded-full border border-white/10" />
                  <div className="absolute inset-6 rounded-full border border-emerald-500/10" />
                  <div className="absolute inset-9 rounded-full border border-white/10" />
                  <div className="absolute inset-12 rounded-full border border-white/5" />

                  <div
                    onClick={() => {
                      if (currentActiveAudio) {
                        if (isCurrentPlaying(currentActiveAudio.id)) pausePodcast();
                        else playPodcast(currentActiveAudio);
                      } else if (audioPodcasts[0]) {
                        playPodcast(audioPodcasts[0]);
                      }
                    }}
                    className={`relative cursor-pointer h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 shadow-2xl overflow-hidden grid place-items-center ${
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
                      <Mic size={32} className="text-slate-950" />
                    )}
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-black/60 text-emerald-400 backdrop-blur-sm shadow-md">
                        {isCurrentPlaying(currentActiveAudio?.id) ? <Pause size={18} /> : <Play size={18} className="fill-current mr-0.5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Master Audio Info & Controls */}
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-white line-clamp-1">
                    {currentActiveAudio ? currentActiveAudio.title : "حلقة بودكاست خلف المايك"}
                  </h3>
                  <p className="text-xs text-emerald-400 font-bold">
                    {currentActiveAudio ? currentActiveAudio.hostName || "فريق الإذاعة المدرسية" : "إذاعة الصباح"}
                  </p>
                </div>

                {/* Master Interactive Podcast Console */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-3">
                  
                  {/* Progress Seek Scrubber (Left-to-Right: 0:00 on Left, Total on Right) */}
                  <div dir="ltr" className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{formatAudioTime(currentTime)}</span>
                      <span>{formatAudioTime(duration)}</span>
                    </div>
                    <div className="relative h-2 flex items-center cursor-pointer group/bar">
                      <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
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

                  {/* Playback Transport, Share & Volume Controls in RTL */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    
                    {/* 1. RIGHT: Like & Share */}
                    <div className="flex items-center gap-1.5">
                      {currentActiveAudio && (
                        <button
                          type="button"
                          onClick={(e) => handleLike(currentActiveAudio, e)}
                          className="flex items-center gap-1 rounded-xl border border-white/10 hover:bg-rose-500/10 text-rose-400 px-2.5 py-1 text-[11px] font-bold transition"
                        >
                          <Heart size={12} className="fill-rose-500/20" />
                          <span>{currentActiveAudio.likesCount || 0}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleShare(currentActiveAudio, e)}
                        className="rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 p-1.5 transition"
                        title="مشاركة البودكاست"
                      >
                        <Share2 size={13} />
                      </button>
                    </div>

                    {/* 2. CENTER: Transport Buttons (السابق | تشغيل/إيقاف | التالي) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={playNextPodcast}
                        className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition active:scale-95"
                        title="الحلقة التالية"
                      >
                        <SkipForward size={14} />
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
                        className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 transition active:scale-95"
                        title={isCurrentPlaying(currentActiveAudio?.id) ? "إيقاف مؤقت" : "استماع"}
                      >
                        {isCurrentPlaying(currentActiveAudio?.id) ? <Pause size={18} /> : <Play size={18} className="fill-current mr-0.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={handlePrevOrRestart}
                        className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition active:scale-95"
                        title="الحلقة السابقة"
                      >
                        <SkipBack size={14} />
                      </button>
                    </div>

                    {/* 3. LEFT: Volume Slider & Mute (dir="ltr": Left = 0, Right = 100) */}
                    <div dir="ltr" className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="text-slate-400 hover:text-emerald-400 transition p-1"
                        title={isMuted || volume === 0 ? "إلغاء الكتم" : "كتم الصوت"}
                      >
                        {isMuted || volume === 0 ? <VolumeX size={15} className="text-rose-400" /> : <Volume2 size={15} className="text-emerald-400" />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-12 sm:w-16 h-1 bg-white/20 accent-emerald-400 rounded-full cursor-pointer"
                      />
                    </div>

                  </div>

                </div>

              </div>

              {/* 4 Audio Episodes Cards Grid (7 cols) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {audioPodcasts.map((podcast, idx) => {
                  const isThisPlaying = isCurrentPlaying(podcast.id);
                  const isThisActive = currentActiveAudio?.id === podcast.id;
                  return (
                    <div
                      key={podcast.id}
                      className={`group relative flex flex-col justify-between rounded-3xl border p-4.5 transition duration-300 hover:-translate-y-1 ${
                        isThisPlaying || isThisActive
                          ? "border-emerald-400 bg-emerald-500/15 ring-2 ring-emerald-400/40 shadow-[0_16px_40px_rgba(16,185,129,0.2)]"
                          : "border-white/10 bg-black/40 hover:border-emerald-400/50 hover:bg-black/60 shadow-lg"
                      }`}
                    >
                      <div className="flex items-start gap-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAudioId(podcast.id);
                            playPodcast(podcast);
                          }}
                          className="relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-black grid place-items-center group-hover:scale-105 transition"
                        >
                          {podcast.coverUrl ? (
                            <img src={directDriveImage(podcast.coverUrl) || podcast.coverUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Mic size={24} className="text-emerald-400" />
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            {isThisPlaying ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white fill-current" />}
                          </div>
                        </button>

                        <div className="text-right min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-black text-emerald-400 uppercase">حلقة #{String(idx + 1).padStart(2, "0")}</span>
                            <span className="text-[9px] font-mono text-slate-400">{podcast.duration || "10:00"}</span>
                          </div>

                          <h4
                            onClick={() => {
                              setSelectedAudioId(podcast.id);
                              playPodcast(podcast);
                            }}
                            className="mt-1 text-xs sm:text-sm font-black text-white hover:text-emerald-300 cursor-pointer line-clamp-1 transition"
                          >
                            {podcast.title}
                          </h4>

                          <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">
                            {podcast.hostName || "فريق الإذاعة المدرسية"}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mt-3 text-[11px] text-slate-300 font-bold line-clamp-2 leading-relaxed bg-white/5 border border-white/5 rounded-xl p-2 text-right">
                        {podcast.description || "حوار إذاعي تربوي ضمن سلسلة حلقات خلف المايك."}
                      </p>

                      {/* Action Bar */}
                      <div className="mt-3.5 flex items-center justify-between border-t border-white/10 pt-2.5">
                        <span className="text-[10px] font-black text-emerald-400">
                          {isThisPlaying ? "🔴 بث مباشر" : "مسموع HD"}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleShare(podcast, e)}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition"
                            title="مشاركة"
                          >
                            <Share2 size={11} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAudioId(podcast.id);
                              playPodcast(podcast);
                            }}
                            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-black transition shadow-sm ${
                              isThisPlaying
                                ? "bg-emerald-500 text-slate-950 font-black shadow-emerald-500/25"
                                : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950"
                            }`}
                          >
                            {isThisPlaying ? <Pause size={11} /> : <Play size={11} className="mr-0.5 fill-current" />}
                            <span>{isThisPlaying ? "إيقاف" : "استماع"}</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          </section>
        )}

      </div>

      {/* Video Modal Player */}
      {watchingVideoPodcast && (
        <Dialog open={Boolean(watchingVideoPodcast)} onOpenChange={() => setWatchingVideoPodcast(null)}>
          <DialogContent className="max-w-4xl rounded-3xl border border-indigo-500/40 bg-[#0a0c16] p-6 text-right text-white" dir="rtl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="rounded-lg bg-indigo-600 px-2.5 py-0.5 text-xs font-black">{watchingVideoPodcast.category}</span>
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
              <p className="text-xs sm:text-sm font-bold text-slate-400 leading-relaxed">{watchingVideoPodcast.description}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Lyrics Modal */}
      {selectedLyricsSong && (
        <Dialog open={Boolean(selectedLyricsSong)} onOpenChange={() => setSelectedLyricsSong(null)}>
          <DialogContent className="max-w-xl rounded-3xl border border-amber-400/40 bg-[#0a0c16] p-6 text-right text-white" dir="rtl">
            <div className="space-y-4 text-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 text-xs font-black">
                <FileText size={13} /> كلمات النشيد الرسمي
              </span>
              <h3 className="text-xl font-black text-amber-400">{selectedLyricsSong.title}</h3>
              <p className="text-xs text-slate-400 font-bold">{selectedLyricsSong.artistOrHost}</p>
              <div className="max-h-72 overflow-y-auto rounded-2xl bg-black/60 border border-white/10 p-5 text-sm font-bold leading-8 text-slate-200 whitespace-pre-line text-center">
                {selectedLyricsSong.lyrics || "لا تتوفر كلمات مكتوبة لهذا النشيد حالياً."}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
