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
  Volume2,
  ListMusic,
  Maximize2,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const id =
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/)?.[1];
  return id ? `/api/drive-proxy/${id}` : url;
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

  const { activeItem, activePodcast, isPlaying, playSong, playPodcast, pausePodcast, songs } = usePodcastPlayer();

  const [activeTab, setActiveTab] = useState<"all" | "songs" | "videos" | "audio">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudioItem, setSelectedStudioItem] = useState<any | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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

  // Combine songs & podcasts into a unified master list
  const unifiedTracks = useMemo(() => {
    const list: any[] = [];

    // Add songs
    (songs || []).forEach((song, idx) => {
      list.push({
        id: song.id || `song-${idx}`,
        title: song.title,
        description: song.description || "نشيد رسمي لكورال ومدارس العقيق الأهلية والدولية",
        category: song.category || "أناشيد العقيق",
        artistOrHost: song.artistOrHost || "كورال العقيق",
        mediaType: "song",
        mediaUrl: song.audioUrl,
        coverUrl: song.coverUrl,
        duration: "03:45",
        originalItem: song,
      });
    });

    // Add podcasts
    (rawPodcasts || []).forEach((podcast) => {
      list.push({
        id: podcast.id,
        title: podcast.title,
        description: podcast.description,
        category: podcast.category,
        artistOrHost: podcast.hostName || "فريق الإذاعة المدرسية",
        mediaType: podcast.mediaType, // 'video' or 'audio'
        mediaUrl: podcast.mediaUrl,
        coverUrl: podcast.coverUrl,
        duration: podcast.duration || "10:00",
        viewCount: podcast.viewCount || 0,
        likesCount: podcast.likesCount || 0,
        originalItem: podcast,
      });
    });

    return list;
  }, [songs, rawPodcasts]);

  // Filtered tracks based on activeTab & search
  const filteredTracks = useMemo(() => {
    return unifiedTracks.filter((track) => {
      if (activeTab === "songs" && track.mediaType !== "song") return false;
      if (activeTab === "videos" && track.mediaType !== "video") return false;
      if (activeTab === "audio" && (track.mediaType !== "audio" || track.mediaType === "song")) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          track.title.toLowerCase().includes(q) ||
          track.description.toLowerCase().includes(q) ||
          (track.artistOrHost && track.artistOrHost.toLowerCase().includes(q)) ||
          (track.category && track.category.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [unifiedTracks, activeTab, searchQuery]);

  // Set default selected item for the Master Stage
  useEffect(() => {
    if (!selectedStudioItem && unifiedTracks.length > 0) {
      // Default to the first video or first featured item
      const defaultItem = unifiedTracks.find((t) => t.mediaType === "video") || unifiedTracks[0];
      setSelectedStudioItem(defaultItem);
    }
  }, [unifiedTracks, selectedStudioItem]);

  const handleSelectTrack = (track: any, autoPlay: boolean = true) => {
    setSelectedStudioItem(track);
    if (autoPlay) {
      if (track.mediaType === "song") {
        playSong(track.originalItem);
      } else if (track.mediaType === "audio") {
        playPodcast(track.originalItem);
      }
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
      toast.success("شكراً لإعجابك بنشيد مدارس العقيق! ❤️");
    }
  };

  const isCurrentItemPlaying = (track: any) => {
    if (!isPlaying) return false;
    return activeItem?.id === track.id || activePodcast?.id === track.id;
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

        <div className="relative mx-auto grid max-w-[1440px] items-center gap-8 px-5 py-12 md:grid-cols-[minmax(390px,.9fr)_minmax(0,1.1fr)] md:px-8 md:py-16 lg:gap-16">
          {/* 3D Tilted Dual-Cover on right in visual / left in RTL (order-2 md:order-1) */}
          <div className="relative order-2 mx-auto h-[360px] w-full max-w-[580px] md:order-1 md:h-[470px]">
            {secondPodcast ? (
              <button
                onClick={() => {
                  if (secondPodcast.mediaType === "video") {
                    setSelectedStudioItem(secondPodcast);
                    setIsVideoModalOpen(true);
                  } else {
                    playPodcast(secondPodcast);
                  }
                }}
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
                onClick={() => {
                  if (featuredPodcast.mediaType === "video") {
                    setSelectedStudioItem(featuredPodcast);
                    setIsVideoModalOpen(true);
                  } else {
                    if (activeItem?.id === featuredPodcast.id && isPlaying) {
                      pausePodcast();
                    } else {
                      playPodcast(featuredPodcast);
                    }
                  }
                }}
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

          {/* Text info on left in visual / right in RTL (order-1 md:order-2) */}
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
                  onClick={() => {
                    if (featuredPodcast.mediaType === "video") {
                      setSelectedStudioItem(featuredPodcast);
                      setIsVideoModalOpen(true);
                    } else {
                      if (activeItem?.id === featuredPodcast.id && isPlaying) {
                        pausePodcast();
                      } else {
                        playPodcast(featuredPodcast);
                      }
                    }
                  }}
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

      {/* ==================== 2. MASTER STUDIO CONSOLE (منظومة البث التفاعلية الموحدة) ==================== */}
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 space-y-8">
        
        {/* Top Switcher & Finder Deck */}
        <div
          className={`rounded-2xl border p-4 transition ${
            dark ? "border-[#f8ca14]/30 bg-[#0a0c16]/95 shadow-xl" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Studio Navigation Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`rounded-xl px-4 py-2 text-xs font-black transition border ${
                  activeTab === "all"
                    ? dark
                      ? "border-[#f8ca14] bg-[#f8ca14] text-slate-950 shadow-md shadow-[#f8ca14]/20"
                      : "border-[#08467d] bg-[#08467d] text-white shadow-md"
                    : dark
                    ? "border-white/10 bg-black/40 text-slate-300 hover:border-white/30"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400"
                }`}
              >
                🌟 جميع المسارات ({unifiedTracks.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("songs")}
                className={`rounded-xl px-4 py-2 text-xs font-black transition border flex items-center gap-1.5 ${
                  activeTab === "songs"
                    ? "border-amber-400 bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                    : dark
                    ? "border-white/10 bg-black/40 text-slate-300 hover:border-white/30"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400"
                }`}
              >
                <Music size={13} />
                <span>أناشيد وكورال ({songs?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("videos")}
                className={`rounded-xl px-4 py-2 text-xs font-black transition border flex items-center gap-1.5 ${
                  activeTab === "videos"
                    ? "border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : dark
                    ? "border-white/10 bg-black/40 text-slate-300 hover:border-white/30"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400"
                }`}
              >
                <Video size={13} />
                <span>المسرح المرئي ({rawPodcasts.filter((p) => p.mediaType === "video").length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("audio")}
                className={`rounded-xl px-4 py-2 text-xs font-black transition border flex items-center gap-1.5 ${
                  activeTab === "audio"
                    ? "border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : dark
                    ? "border-white/10 bg-black/40 text-slate-300 hover:border-white/30"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400"
                }`}
              >
                <Radio size={13} />
                <span>إذاعة وبودكاست مسموع ({rawPodcasts.filter((p) => p.mediaType !== "video").length})</span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full lg:w-80">
              <Search size={15} className="absolute top-3 right-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في التراكات والضيوف..."
                className={`w-full rounded-xl border pr-9 pl-4 py-2 text-xs font-bold outline-none transition ${
                  dark ? "border-white/10 bg-black text-white focus:border-[#f8ca14]" : "border-slate-200 bg-slate-50 text-slate-900 focus:border-[#08467d]"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute top-2.5 left-2.5 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ==================== 3. DUAL-PANE INTERACTIVE MASTER STUDIO ==================== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          
          {/* ================= Pane A: Active Master Player Stage (7 cols) ================= */}
          <div className="lg:col-span-7">
            {selectedStudioItem ? (
              <div
                className={`overflow-hidden rounded-3xl border transition duration-300 ${
                  dark
                    ? "border-amber-400/30 bg-gradient-to-b from-[#0e111d] to-[#07080f] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                    : "border-slate-200 bg-white shadow-xl"
                }`}
              >
                {/* 1. Video Player Stage */}
                {selectedStudioItem.mediaType === "video" && (
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 px-3 py-1 text-xs font-black text-indigo-300">
                        <Video size={13} />
                        <span>مسرح الفيديو المباشر HD</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsVideoModalOpen(true)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-indigo-400 transition"
                      >
                        <Maximize2 size={13} />
                        <span>تكبير الشاشة</span>
                      </button>
                    </div>

                    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl">
                      {selectedStudioItem.mediaUrl?.includes("youtube.com") || selectedStudioItem.mediaUrl?.includes("youtu.be") ? (
                        <iframe
                          src={selectedStudioItem.mediaUrl.replace("watch?v=", "embed/")}
                          title={selectedStudioItem.title}
                          className="h-full w-full border-0"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      ) : (
                        <video
                          src={selectedStudioItem.mediaUrl}
                          controls
                          autoPlay
                          className="h-full w-full object-contain"
                        />
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-black text-amber-400">{selectedStudioItem.category}</span>
                      <h2 className="mt-1 text-lg sm:text-xl font-black text-white">{selectedStudioItem.title}</h2>
                      <p className="mt-2 text-xs text-slate-400 font-bold leading-relaxed">{selectedStudioItem.description}</p>
                    </div>
                  </div>
                )}

                {/* 2. Vinyl Song Turntable Stage */}
                {selectedStudioItem.mediaType === "song" && (
                  <div className="p-6 sm:p-8 space-y-6 text-center">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/20 border border-amber-400/40 px-3 py-1 text-xs font-black text-amber-400">
                        <Music size={13} />
                        <span>أسطوانة نشيد رسمي 🎵</span>
                      </span>
                      <span className="text-xs font-mono text-slate-400">جودة الاستوديو Master HD</span>
                    </div>

                    {/* Massive Vinyl Centerpiece */}
                    <div className="relative mx-auto h-48 w-48 sm:h-56 sm:w-56 grid place-items-center">
                      <div className={`absolute inset-0 rounded-full border-4 ${
                        dark ? "border-amber-400/30 bg-[#05060a]" : "border-slate-300 bg-slate-100"
                      } shadow-2xl`} />
                      <div className={`absolute inset-3 rounded-full border ${dark ? "border-white/10" : "border-slate-300"}`} />
                      <div className={`absolute inset-7 rounded-full border ${dark ? "border-white/5" : "border-slate-300/60"}`} />
                      <div className={`absolute inset-11 rounded-full border ${dark ? "border-white/10" : "border-slate-300/80"}`} />

                      {/* Center Disc Artwork */}
                      <div
                        onClick={() => playSong(selectedStudioItem.originalItem)}
                        className={`relative cursor-pointer h-24 w-24 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 shadow-2xl overflow-hidden grid place-items-center ${
                          isCurrentItemPlaying(selectedStudioItem) ? "animate-[spin_4s_linear_infinite]" : "hover:scale-105 transition"
                        }`}
                      >
                        <img
                          src={dark ? "/audio-default-cover-dark.svg" : "/audio-default-cover-light.svg"}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          {isCurrentItemPlaying(selectedStudioItem) ? (
                            <Pause size={22} className="text-slate-950" />
                          ) : (
                            <Play size={22} className="text-slate-950 fill-current" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-center space-y-1">
                      <h2 className="text-xl sm:text-2xl font-black text-white">{selectedStudioItem.title}</h2>
                      <p className="text-xs text-amber-400 font-bold">{selectedStudioItem.artistOrHost}</p>
                    </div>

                    {/* Interactive Play Controls */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => playSong(selectedStudioItem.originalItem)}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-6 py-2.5 text-xs font-black shadow-lg shadow-amber-400/25 transition active:scale-95"
                      >
                        {isCurrentItemPlaying(selectedStudioItem) ? <Pause size={16} /> : <Play size={16} className="fill-current" />}
                        <span>{isCurrentItemPlaying(selectedStudioItem) ? "إيقاف مؤقت" : "تشغيل النشيد الآن"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShare(selectedStudioItem, e)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 transition"
                      >
                        <Share2 size={13} />
                        <span>مشاركة</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Audio Broadcast Studio Stage */}
                {selectedStudioItem.mediaType === "audio" && (
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-black text-emerald-400">
                        <Radio size={13} className="animate-pulse" />
                        <span>كابينة البث الصوتي المباشر 🎙️</span>
                      </span>
                      <span className="text-xs font-mono text-slate-400">{selectedStudioItem.duration}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Avatar Cover */}
                      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#121626]">
                        {selectedStudioItem.coverUrl ? (
                          <img
                            src={directDriveImage(selectedStudioItem.coverUrl) || selectedStudioItem.coverUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-items-center">
                            <Mic size={36} className="text-emerald-400" />
                          </div>
                        )}
                      </div>

                      {/* Text */}
                      <div className="text-right space-y-2 flex-1">
                        <span className="rounded-md bg-white/5 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 border border-white/10">
                          {selectedStudioItem.category}
                        </span>
                        <h2 className="text-lg sm:text-xl font-black text-white">{selectedStudioItem.title}</h2>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed">{selectedStudioItem.description}</p>
                      </div>
                    </div>

                    {/* Waveform Equalizer Display */}
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => playPodcast(selectedStudioItem.originalItem)}
                          className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 transition active:scale-95"
                        >
                          {isCurrentItemPlaying(selectedStudioItem) ? <Pause size={20} /> : <Play size={20} className="mr-0.5 fill-current" />}
                        </button>
                        <div>
                          <p className="text-xs font-black text-white">{selectedStudioItem.artistOrHost}</p>
                          <span className="text-[10px] font-bold text-slate-400">تقديم واستضافة</span>
                        </div>
                      </div>

                      {/* Equalizer bars */}
                      <div className="flex items-end gap-1 h-8">
                        <span className={`w-1 bg-emerald-400 rounded-full ${isCurrentItemPlaying(selectedStudioItem) ? "animate-[bounce_0.6s_infinite] h-8" : "h-2"}`} />
                        <span className={`w-1 bg-emerald-400 rounded-full ${isCurrentItemPlaying(selectedStudioItem) ? "animate-[bounce_0.8s_infinite] h-5" : "h-3"}`} />
                        <span className={`w-1 bg-emerald-400 rounded-full ${isCurrentItemPlaying(selectedStudioItem) ? "animate-[bounce_0.5s_infinite] h-7" : "h-2"}`} />
                        <span className={`w-1 bg-emerald-400 rounded-full ${isCurrentItemPlaying(selectedStudioItem) ? "animate-[bounce_0.9s_infinite] h-4" : "h-4"}`} />
                        <span className={`w-1 bg-emerald-400 rounded-full ${isCurrentItemPlaying(selectedStudioItem) ? "animate-[bounce_0.7s_infinite] h-6" : "h-2"}`} />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : null}
          </div>

          {/* ================= Pane B: Interactive Tracklist Queue (5 cols) ================= */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-2 pb-1">
              <div className="flex items-center gap-2">
                <ListMusic size={16} className="text-amber-400" />
                <h3 className="text-sm font-black text-white">قائمة المسارات والتسجيلات</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{filteredTracks.length} مسار</span>
            </div>

            {/* Track Rows Container */}
            <div className={`space-y-2 max-h-[580px] overflow-y-auto pr-1 ${dark ? "scrollbar-thin scrollbar-thumb-white/10" : ""}`}>
              {filteredTracks.map((track, idx) => {
                const isSelected = selectedStudioItem?.id === track.id;
                const isThisPlaying = isCurrentItemPlaying(track);

                return (
                  <div
                    key={track.id || idx}
                    onClick={() => handleSelectTrack(track, true)}
                    className={`group relative flex items-center justify-between gap-3 rounded-2xl border p-3 cursor-pointer transition duration-200 ${
                      isSelected
                        ? dark
                          ? "border-amber-400 bg-amber-400/10 ring-1 ring-amber-400/40"
                          : "border-amber-500 bg-amber-50"
                        : dark
                        ? "border-white/10 bg-[#0a0c16] hover:border-white/25 hover:bg-[#0f1220]"
                        : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Track # or Play state */}
                      <span className="w-5 text-center text-xs font-mono font-black text-slate-500">
                        {isThisPlaying ? (
                          <div className="flex items-end gap-0.5 h-3 justify-center">
                            <span className="w-0.5 bg-amber-400 animate-[bounce_0.6s_infinite] h-3 rounded-full" />
                            <span className="w-0.5 bg-amber-400 animate-[bounce_0.8s_infinite] h-2 rounded-full" />
                            <span className="w-0.5 bg-amber-400 animate-[bounce_0.5s_infinite] h-2.5 rounded-full" />
                          </div>
                        ) : (
                          String(idx + 1).padStart(2, "0")
                        )}
                      </span>

                      {/* Small Rounded Cover */}
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 grid place-items-center">
                        {track.coverUrl ? (
                          <img
                            src={directDriveImage(track.coverUrl) || track.coverUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : track.mediaType === "song" ? (
                          <Music size={16} className="text-amber-400" />
                        ) : track.mediaType === "video" ? (
                          <Video size={16} className="text-indigo-400" />
                        ) : (
                          <Mic size={16} className="text-emerald-400" />
                        )}

                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          {isThisPlaying ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white fill-current" />}
                        </div>
                      </div>

                      {/* Title & Artist */}
                      <div className="min-w-0 flex-1 text-right">
                        <h4 className={`text-xs font-black truncate transition ${
                          isSelected ? "text-amber-400" : dark ? "text-white group-hover:text-amber-300" : "text-slate-900 group-hover:text-amber-700"
                        }`}>
                          {track.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">
                          {track.artistOrHost}
                        </p>
                      </div>
                    </div>

                    {/* Badges & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-md px-2 py-0.5 text-[9px] font-black border ${
                        track.mediaType === "song"
                          ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
                          : track.mediaType === "video"
                          ? "border-indigo-400/30 bg-indigo-500/10 text-indigo-300"
                          : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                      }`}>
                        {track.mediaType === "song" ? "🎵 نشيد" : track.mediaType === "video" ? "🎬 مرئي" : "🎙️ بودكاست"}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleLike(track, e)}
                        className="text-rose-400/60 hover:text-rose-400 transition p-1"
                      >
                        <Heart size={12} className={track.likesCount > 0 ? "fill-rose-500/40" : ""} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </section>

      {/* Video Modal (when maximized) */}
      {isVideoModalOpen && selectedStudioItem && (
        <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
          <DialogContent
            className={`max-w-4xl rounded-3xl border p-6 text-right shadow-2xl ${
              dark ? "border-indigo-500/40 bg-[#0a0c16] text-white" : "border-slate-200 bg-white text-slate-900"
            }`}
            dir="rtl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-current/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-indigo-600 px-2.5 py-0.5 text-xs font-black text-white">
                    {selectedStudioItem.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-black truncate">{selectedStudioItem.title}</h3>
                </div>
              </div>

              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl">
                {selectedStudioItem.mediaUrl?.includes("youtube.com") || selectedStudioItem.mediaUrl?.includes("youtu.be") ? (
                  <iframe
                    src={selectedStudioItem.mediaUrl.replace("watch?v=", "embed/")}
                    title={selectedStudioItem.title}
                    className="h-full w-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <video
                    src={selectedStudioItem.mediaUrl}
                    controls
                    autoPlay
                    className="h-full w-full object-contain"
                  />
                )}
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-400 leading-relaxed">
                {selectedStudioItem.description}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
