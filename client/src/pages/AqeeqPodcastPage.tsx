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
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const ATHEER_CATEGORIES = [
  { id: "all", label: "🌟 الكل" },
  { id: "songs", label: "🎵 أناشيد وكورال العقيق" },
  { id: "videos", label: "🎬 المسرح المرئي" },
  { id: "بودكاست قيادات", label: "🎙️ بودكاست قيادات" },
  { id: "إذاعة الصباح", label: "🎤 إذاعة الصباح" },
  { id: "تغطيات صوتية", label: "📻 تغطيات ولقاءات" },
] as const;

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

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [watchingVideoPodcast, setWatchingVideoPodcast] = useState<any | null>(null);
  const [selectedLyricsSong, setSelectedLyricsSong] = useState<any | null>(null);

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
      if (selectedCategory === "songs") return false;
      if (selectedCategory !== "all" && selectedCategory !== "videos" && p.category !== selectedCategory) return false;
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
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [rawPodcasts, selectedCategory, searchQuery]);

  const filteredSongs = useMemo(() => {
    if (selectedCategory === "videos") return [];
    if (selectedCategory !== "all" && selectedCategory !== "songs") return [];
    return (songs || []).filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return s.title.toLowerCase().includes(q) || (s.artistOrHost && s.artistOrHost.toLowerCase().includes(q));
      }
      return true;
    });
  }, [songs, selectedCategory, searchQuery]);

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
      setWatchingVideoPodcast(item.originalItem || item);
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

        <div className="relative mx-auto grid max-w-[1440px] items-center gap-8 px-5 py-12 md:grid-cols-[minmax(390px,.9fr)_minmax(0,1.1fr)] md:px-8 md:py-16 lg:gap-16">
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
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 space-y-14">
        
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

                {/* Equalizer Waveform Indicator when playing */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-end gap-1 h-5">
                      <span className={`w-1 bg-amber-400 rounded-full ${isPlaying ? "animate-[bounce_0.6s_infinite] h-5" : "h-2"}`} />
                      <span className={`w-1 bg-amber-400 rounded-full ${isPlaying ? "animate-[bounce_0.8s_infinite] h-3.5" : "h-2"}`} />
                      <span className={`w-1 bg-amber-400 rounded-full ${isPlaying ? "animate-[bounce_0.5s_infinite] h-4.5" : "h-2"}`} />
                      <span className={`w-1 bg-amber-400 rounded-full ${isPlaying ? "animate-[bounce_0.9s_infinite] h-3" : "h-2"}`} />
                    </div>
                    <span className="text-[10px] font-black text-slate-300">
                      {isPlaying ? "جاري العزف الحي..." : "جاهز للتشغيل"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeItem?.lyrics && (
                      <button
                        type="button"
                        onClick={() => setSelectedLyricsSong(activeItem)}
                        className="rounded-xl border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400 hover:text-slate-950 text-amber-300 px-3 py-1 text-[11px] font-black transition flex items-center gap-1"
                      >
                        <FileText size={12} />
                        <span>الكلمات</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleShare(activeItem || songs[0], e)}
                      className="rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 p-1.5 transition"
                      title="مشاركة النشيد"
                    >
                      <Share2 size={13} />
                    </button>
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
        {/* ================= PAVILION 2: 🎬 مسرح العقيق السينمائي ================== */}
        {/* ========================================================================= */}
        {videoPodcasts.length > 0 && (
          <section
            id="videos-pavilion"
            className={`rounded-[2.5rem] border p-6 sm:p-8 transition ${
              dark
                ? "border-indigo-500/30 bg-gradient-to-b from-[#0e1022] to-[#070810] shadow-2xl"
                : "border-slate-200 bg-white shadow-xl"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                  <Video size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-500/20 border border-indigo-400/40 px-2.5 py-0.5 text-[9px] font-black text-indigo-300">
                      CINEMA THEATER 4K
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{videoPodcasts.length} حلقات منشورة</span>
                  </div>
                  <h2 className="mt-0.5 text-lg sm:text-2xl font-black text-white">مسرح العقيق السينمائي وحلقات الفيديو 🎬</h2>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoPodcasts.map((video) => (
                <div
                  key={video.id}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/50 hover:border-indigo-400/60 transition duration-300 hover:-translate-y-1 shadow-xl"
                >
                  <div
                    onClick={() => setWatchingVideoPodcast(video)}
                    className="relative aspect-video w-full cursor-pointer overflow-hidden bg-black"
                  >
                    {video.coverUrl ? (
                      <img
                        src={directDriveImage(video.coverUrl) || video.coverUrl}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid h-full place-items-center bg-indigo-950/40">
                        <Video size={36} className="text-indigo-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="rounded-lg bg-indigo-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-white shadow-md flex items-center gap-1">
                        <Video size={11} /> مرئي 4K
                      </span>
                      <span className="rounded-lg bg-black/70 backdrop-blur-md px-2 py-1 text-[10px] font-mono text-slate-200 border border-white/10">
                        {video.duration || "12:00"}
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-indigo-600 text-white shadow-2xl group-hover:scale-115 transition duration-200">
                        <Play size={20} className="mr-0.5 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4.5 text-right">
                    <span className="text-[9px] font-black text-amber-400">{video.category}</span>
                    <h4
                      onClick={() => setWatchingVideoPodcast(video)}
                      className="mt-1 text-sm font-black text-white hover:text-indigo-300 cursor-pointer line-clamp-1 transition"
                    >
                      {video.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-bold line-clamp-2 mt-1.5 leading-relaxed">{video.description}</p>

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                        <Mic size={11} className="text-indigo-400" />
                        <span>{video.hostName || "فريق الإذاعة"}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleLike(video, e)}
                          className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:scale-110 transition px-1.5 py-0.5"
                        >
                          <Heart size={11} className="fill-rose-500/20" />
                          <span>{video.likesCount || 0}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWatchingVideoPodcast(video)}
                          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 text-xs font-black transition"
                        >
                          مشاهدة الفيديو
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* ================= PAVILION 3: 🎙️ صالون البودكاست وإذاعة الصباح =========== */}
        {/* ========================================================================= */}
        {audioPodcasts.length > 0 && (
          <section
            id="audio-pavilion"
            className={`rounded-[2.5rem] border p-6 sm:p-8 transition ${
              dark
                ? "border-emerald-500/30 bg-gradient-to-b from-[#09161a] to-[#060e10] shadow-2xl"
                : "border-slate-200 bg-white shadow-xl"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30">
                  <Radio size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[9px] font-black text-emerald-300">
                      LIVE AUDIO LOUNGE · استوديو الإذاعة
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{audioPodcasts.length} حلقات مسموعة</span>
                  </div>
                  <h2 className="mt-0.5 text-lg sm:text-2xl font-black text-white">صالون البودكاست وكابينة الإذاعة الصباحية 🎙️</h2>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {audioPodcasts.map((podcast) => {
                const isThisPlaying = isCurrentPlaying(podcast.id);
                return (
                  <div
                    key={podcast.id}
                    className={`group relative flex flex-col justify-between rounded-3xl border p-4.5 transition duration-300 hover:-translate-y-1 ${
                      isThisPlaying
                        ? "border-emerald-400 bg-emerald-500/15 ring-2 ring-emerald-400/40 shadow-[0_16px_40px_rgba(16,185,129,0.2)]"
                        : "border-white/10 bg-black/40 hover:border-emerald-400/50 hover:bg-black/60 shadow-lg"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => playPodcast(podcast)}
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

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-black">
                            {podcast.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{podcast.duration || "10:00"}</span>
                        </div>

                        <h4
                          onClick={() => playPodcast(podcast)}
                          className="mt-1 text-xs sm:text-sm font-black text-white hover:text-emerald-300 cursor-pointer line-clamp-2 transition leading-snug"
                        >
                          {podcast.title}
                        </h4>

                        <p className="text-[11px] text-slate-400 font-bold truncate mt-1">{podcast.hostName || "فريق الإذاعة المدرسية"}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400">
                        {isThisPlaying ? (
                          <span className="animate-pulse">🔴 بث حي</span>
                        ) : (
                          <span className="text-slate-500">بودكاست مسموع</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleLike(podcast, e)}
                          className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:scale-110 transition px-1.5 py-0.5"
                        >
                          <Heart size={11} className="fill-rose-500/20" />
                          <span>{podcast.likesCount || 0}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => playPodcast(podcast)}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 text-xs font-black transition shadow-sm"
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
                {watchingVideoPodcast.mediaUrl.includes("youtube.com") || watchingVideoPodcast.mediaUrl.includes("youtu.be") ? (
                  <iframe
                    src={watchingVideoPodcast.mediaUrl.replace("watch?v=", "embed/")}
                    title={watchingVideoPodcast.title}
                    className="h-full w-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <video src={watchingVideoPodcast.mediaUrl} controls autoPlay className="h-full w-full object-contain" />
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
