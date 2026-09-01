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
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type DesignStyle = "pavilions" | "master_console" | "luxury_3tier" | "signature_3d";

const DESIGN_STYLES = [
  {
    id: "pavilions" as DesignStyle,
    title: "🏛️ أروقة أثير العقيق الملكية",
    subtitle: "ديوان أسطوانات + مسرح سينما + صالون بودكاست",
    tag: "الأكثر فخامة ⭐",
  },
  {
    id: "master_console" as DesignStyle,
    title: "🎛️ استوديو البث التفاعلي",
    subtitle: "شاشة بث متغيرة + قائمة مسارات ذكية (Spotify)",
    tag: "تفاعلي ذكي",
  },
  {
    id: "luxury_3tier" as DesignStyle,
    title: "🎵 الرفوف الفاخرة المدمجة",
    subtitle: "رف أسطوانات 4 كروت + سينما 16:9 + كبسولات",
    tag: "مدمج وأنيق",
  },
  {
    id: "signature_3d" as DesignStyle,
    title: "💎 شبكة الكروت الملكية 3D",
    subtitle: "كروت موحدة ثلاثية الأبعاد (نفس نمط المجلة)",
    tag: "هوية موحدة",
  },
];

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

  // Active Live Design Style
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>(() => {
    return (localStorage.getItem("aqeeq_atheer_style") as DesignStyle) || "pavilions";
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [watchingVideoPodcast, setWatchingVideoPodcast] = useState<any | null>(null);
  const [selectedLyricsSong, setSelectedLyricsSong] = useState<any | null>(null);

  // For Master Console Style
  const [selectedConsoleTrack, setSelectedConsoleTrack] = useState<any | null>(null);
  const [consoleTab, setConsoleTab] = useState<"all" | "songs" | "videos" | "audio">("all");

  const changeStyle = (style: DesignStyle) => {
    setSelectedStyle(style);
    localStorage.setItem("aqeeq_atheer_style", style);
    toast.success(`تم التبديل إلى نمط: ${DESIGN_STYLES.find((s) => s.id === style)?.title}`);
  };

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

  // For Master Console
  const consoleTracks = useMemo(() => {
    return unifiedItems.filter((t) => {
      if (consoleTab === "songs" && t.mediaType !== "song") return false;
      if (consoleTab === "videos" && t.mediaType !== "video") return false;
      if (consoleTab === "audio" && (t.mediaType !== "audio" || t.mediaType === "song")) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [unifiedItems, consoleTab, searchQuery]);

  useEffect(() => {
    if (!selectedConsoleTrack && unifiedItems.length > 0) {
      setSelectedConsoleTrack(unifiedItems.find((t) => t.mediaType === "video") || unifiedItems[0]);
    }
  }, [unifiedItems, selectedConsoleTrack]);

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

  const isCurrentPlaying = (id: string) => {
    return isPlaying && (activeItem?.id === id || activePodcast?.id === id);
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

      {/* ==================== 🌟 LIVE DESIGN STYLE SWITCHER BAR 🌟 ==================== */}
      <section className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-8">
        <div
          className={`relative overflow-hidden rounded-3xl border p-4 sm:p-5 transition ${
            dark
              ? "border-[#f8ca14]/40 bg-gradient-to-r from-[#121422] via-[#090b14] to-[#141200] shadow-[0_12px_40px_rgba(248,202,20,0.1)]"
              : "border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-white to-amber-50/80 shadow-md"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Badge & Title */}
            <div className="flex items-center gap-3 text-right w-full md:w-auto">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#f8ca14] text-slate-950 shadow-md">
                <SlidersHorizontal size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white">مبدل أنماط التصميم الحي (Live Switcher)</h3>
                  <span className="rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 text-[10px] font-black">
                    اختر الشكل الذي يعجبك
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                  انقر على أي نمط أدناه للمعاينة المباشرة وتجربة الشكل فوراً في الصفحة!
                </p>
              </div>
            </div>

            {/* 4 Interactive Style Switcher Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
              {DESIGN_STYLES.map((style) => {
                const isCurrent = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => changeStyle(style.id)}
                    className={`relative flex flex-col justify-between rounded-2xl border p-2.5 text-right transition duration-200 ${
                      isCurrent
                        ? "border-[#f8ca14] bg-[#f8ca14] text-slate-950 font-black shadow-lg shadow-[#f8ca14]/25 scale-105"
                        : dark
                        ? "border-white/10 bg-black/60 text-slate-300 hover:border-white/30 hover:bg-white/5"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-black truncate">{style.title}</span>
                      {isCurrent && <CheckCircle2 size={12} className="shrink-0 fill-current" />}
                    </div>
                    <span className={`text-[9px] font-bold truncate mt-1 ${isCurrent ? "text-slate-900" : "text-slate-400"}`}>
                      {style.tag}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================================== */}
      {/* ======================= RENDER SELECTED DESIGN STYLE ======================== */}
      {/* ============================================================================== */}

      {/* ==================== STYLE 1: 🏛️ أروقة أثير العقيق الملكية ==================== */}
      {selectedStyle === "pavilions" && (
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 space-y-14">
          
          {/* PAVILION 1: 🎵 ديوان الأناشيد والكورال الملكي */}
          <section
            className={`rounded-3xl border p-6 sm:p-8 transition ${
              dark
                ? "border-amber-400/30 bg-gradient-to-b from-[#121422] to-[#07080f] shadow-2xl"
                : "border-slate-200 bg-white shadow-xl"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400 text-slate-950 shadow-md">
                  <Music size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-white">ديوان الأسطوانات وأناشيد العقيق الملكية 🎵</h2>
                    <span className="rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[10px] font-black">
                      ديوان الأناشيد المعتمد
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">
                    الإنتاج الموسيقي والنشيد الرسمي لمدارس وكورال العقيق الأهلية والدولية
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => playSong(0)}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 text-xs font-black shadow-md shadow-amber-400/20 transition active:scale-95"
              >
                <Disc size={15} className="animate-[spin_4s_linear_infinite]" />
                <span>تشغيل ديوان الأناشيد كاملاً</span>
              </button>
            </div>

            {/* Pavilion Layout: Turntable Centerpiece on Right (4 cols) + 4 Vinyl Sleeves on Left (8 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Grand Vinyl Turntable Preview */}
              <div className="lg:col-span-4 text-center p-5 rounded-2xl border border-white/10 bg-black/40 space-y-4">
                <div className="relative mx-auto h-40 w-40 sm:h-48 sm:w-48 grid place-items-center">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-400/30 bg-[#05060a] shadow-2xl" />
                  <div className="absolute inset-2.5 rounded-full border border-white/10" />
                  <div className="absolute inset-5 rounded-full border border-white/5" />
                  <div className="absolute inset-8 rounded-full border border-white/10" />

                  <div
                    onClick={() => playSong(0)}
                    className="relative cursor-pointer h-20 w-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 shadow-2xl overflow-hidden grid place-items-center hover:scale-105 transition"
                  >
                    <img
                      src={dark ? "/audio-default-cover-dark.svg" : "/audio-default-cover-light.svg"}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play size={18} className="text-slate-950 fill-current" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-white">الأسطوانة الرسمية الشاملة</h3>
                  <p className="text-[11px] text-amber-400 font-bold">بصوت كورال ومدارس العقيق الأهلية والدولية</p>
                </div>
              </div>

              {/* 4 Vinyl Sleeves Cards */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(songs || []).map((song, idx) => {
                  const isThisPlaying = isCurrentPlaying(song.id);
                  return (
                    <div
                      key={song.id || idx}
                      className={`group relative flex items-center justify-between gap-3.5 rounded-2xl border p-4 transition duration-300 ${
                        isThisPlaying
                          ? "border-amber-400 bg-amber-400/15 ring-1 ring-amber-400/40"
                          : dark
                          ? "border-white/10 bg-black/40 hover:border-amber-400/50 hover:bg-white/5"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Mini Vinyl Art */}
                        <button
                          type="button"
                          onClick={() => playSong(song)}
                          className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black grid place-items-center group-hover:scale-105 transition"
                        >
                          <Disc size={28} className={`text-amber-400 ${isThisPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`} />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            {isThisPlaying ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white fill-current" />}
                          </div>
                        </button>

                        <div className="text-right min-w-0">
                          <span className="text-[9px] font-mono font-black text-amber-400">تراك #{String(idx + 1).padStart(2, "0")}</span>
                          <h4
                            onClick={() => playSong(song)}
                            className="text-xs font-black text-white hover:text-amber-300 cursor-pointer truncate transition"
                          >
                            {song.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{song.artistOrHost || "كورال العقيق"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {song.lyrics && (
                          <button
                            type="button"
                            onClick={() => setSelectedLyricsSong(song)}
                            className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 hover:bg-amber-400 hover:text-slate-950 text-slate-400 transition"
                            title="كلمات النشيد"
                          >
                            <FileText size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => playSong(song)}
                          className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-black transition shadow-sm ${
                            isThisPlaying
                              ? "bg-amber-400 text-slate-950 font-black"
                              : "bg-amber-400/15 text-amber-300 hover:bg-amber-400 hover:text-slate-950"
                          }`}
                        >
                          {isThisPlaying ? <Pause size={11} /> : <Play size={11} className="mr-0.5 fill-current" />}
                          <span>{isThisPlaying ? "إيقاف" : "استماع"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </section>

          {/* PAVILION 2: 🎬 مسرح العقيق السينمائي */}
          {rawPodcasts.filter((p) => p.mediaType === "video").length > 0 && (
            <section
              className={`rounded-3xl border p-6 sm:p-8 transition ${
                dark
                  ? "border-indigo-500/30 bg-gradient-to-b from-[#0e1022] to-[#070810] shadow-2xl"
                  : "border-slate-200 bg-white shadow-xl"
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-md">
                    <Video size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">مسرح العقيق السينمائي وحلقات الفيديو 🎬</h2>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">تغطيات ولقاءات وثائقية مصورة بدقة عالية 4K</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rawPodcasts.filter((p) => p.mediaType === "video").map((video) => (
                  <div
                    key={video.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 hover:border-indigo-400/60 transition duration-300 hover:-translate-y-1 shadow-lg"
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
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-indigo-600 text-white shadow-xl group-hover:scale-110 transition">
                          <Play size={20} className="mr-0.5 fill-current" />
                        </div>
                      </div>
                      <div className="absolute top-2.5 right-2.5 rounded-md bg-indigo-600/90 px-2 py-0.5 text-[9px] font-black text-white">
                        🎬 مرئي 4K
                      </div>
                    </div>
                    <div className="p-4 text-right">
                      <h4
                        onClick={() => setWatchingVideoPodcast(video)}
                        className="text-sm font-black text-white hover:text-indigo-300 cursor-pointer line-clamp-1 transition"
                      >
                        {video.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-bold line-clamp-2 mt-1">{video.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PAVILION 3: 🎙️ صالون البودكاست وإذاعة الصباح */}
          {rawPodcasts.filter((p) => p.mediaType !== "video").length > 0 && (
            <section
              className={`rounded-3xl border p-6 sm:p-8 transition ${
                dark
                  ? "border-emerald-500/30 bg-gradient-to-b from-[#09161a] to-[#060e10] shadow-2xl"
                  : "border-slate-200 bg-white shadow-xl"
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500 text-slate-950 shadow-md">
                    <Radio size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">صالون البودكاست وكابينة الإذاعة 🎙️</h2>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">حوارات القيادات، البرامج التربوية، ومشاركات الطلاب</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rawPodcasts.filter((p) => p.mediaType !== "video").map((podcast) => {
                  const isThisPlaying = isCurrentPlaying(podcast.id);
                  return (
                    <div
                      key={podcast.id}
                      className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition duration-300 ${
                        isThisPlaying
                          ? "border-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-400/40"
                          : "border-white/10 bg-black/40 hover:border-emerald-400/50"
                      }`}
                    >
                      <div className="flex items-start gap-3 text-right">
                        <button
                          type="button"
                          onClick={() => playPodcast(podcast)}
                          className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black grid place-items-center"
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
                          <span className="rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-black">
                            {podcast.category}
                          </span>
                          <h4
                            onClick={() => playPodcast(podcast)}
                            className="mt-1 text-xs sm:text-sm font-black text-white hover:text-emerald-300 cursor-pointer line-clamp-2 transition"
                          >
                            {podcast.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-bold truncate mt-1">{podcast.hostName || "فريق الإذاعة"}</p>
                        </div>
                      </div>

                      <div className="mt-3.5 flex items-center justify-between border-t border-white/10 pt-2.5">
                        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
                          {isThisPlaying ? (
                            <span className="animate-pulse">🔴 بث حي</span>
                          ) : (
                            <span className="text-slate-500">بودكاست مسموع</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => playPodcast(podcast)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1 text-xs font-black transition"
                        >
                          {isThisPlaying ? <Pause size={11} /> : <Play size={11} className="mr-0.5 fill-current" />}
                          <span>{isThisPlaying ? "إيقاف" : "استماع"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      )}

      {/* ==================== STYLE 2: 🎛️ استوديو البث التفاعلي الموحد ==================== */}
      {selectedStyle === "master_console" && (
        <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Live Master Stage (7 cols) */}
            <div className="lg:col-span-7">
              {selectedConsoleTrack ? (
                <div className="rounded-3xl border border-amber-400/30 bg-[#0e111d] p-6 space-y-4 shadow-2xl">
                  {selectedConsoleTrack.mediaType === "video" ? (
                    <div className="space-y-3">
                      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl">
                        {selectedConsoleTrack.mediaUrl?.includes("youtube.com") || selectedConsoleTrack.mediaUrl?.includes("youtu.be") ? (
                          <iframe
                            src={selectedConsoleTrack.mediaUrl.replace("watch?v=", "embed/")}
                            title={selectedConsoleTrack.title}
                            className="h-full w-full border-0"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        ) : (
                          <video src={selectedConsoleTrack.mediaUrl} controls autoPlay className="h-full w-full object-contain" />
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-amber-400">{selectedConsoleTrack.category}</span>
                        <h2 className="text-lg font-black text-white">{selectedConsoleTrack.title}</h2>
                        <p className="text-xs text-slate-400 font-bold mt-1">{selectedConsoleTrack.description}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 space-y-4">
                      <div className="relative mx-auto h-40 w-40 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 grid place-items-center shadow-2xl">
                        <Disc size={60} className={`text-slate-950 ${isCurrentPlaying(selectedConsoleTrack.id) ? "animate-[spin_4s_linear_infinite]" : ""}`} />
                      </div>
                      <h2 className="text-xl font-black text-white">{selectedConsoleTrack.title}</h2>
                      <p className="text-xs text-amber-400 font-bold">{selectedConsoleTrack.artistOrHost}</p>
                      <button
                        type="button"
                        onClick={() => handlePlayOrOpen(selectedConsoleTrack)}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-400 text-slate-950 px-6 py-2.5 text-xs font-black shadow-lg"
                      >
                        {isCurrentPlaying(selectedConsoleTrack.id) ? <Pause size={16} /> : <Play size={16} className="fill-current" />}
                        <span>{isCurrentPlaying(selectedConsoleTrack.id) ? "إيقاف مؤقت" : "تشغيل المسار"}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Live Queue (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-white">قائمة المسارات والتسجيلات</h3>
                <span className="text-[11px] font-mono text-slate-400">{consoleTracks.length} مسار</span>
              </div>
              <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                {consoleTracks.map((t, idx) => {
                  const isSelected = selectedConsoleTrack?.id === t.id;
                  const isPlayingThis = isCurrentPlaying(t.id);
                  return (
                    <div
                      key={t.id || idx}
                      onClick={() => {
                        setSelectedConsoleTrack(t);
                        handlePlayOrOpen(t);
                      }}
                      className={`flex items-center justify-between gap-3 rounded-2xl border p-3 cursor-pointer transition ${
                        isSelected ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-black/40 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 text-right">
                        <span className="text-xs font-mono font-black text-slate-500">{String(idx + 1).padStart(2, "0")}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-white truncate">{t.title}</h4>
                          <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{t.artistOrHost}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black rounded-md px-2 py-0.5 border border-white/10 bg-white/5">
                        {t.mediaType === "song" ? "🎵 نشيد" : t.mediaType === "video" ? "🎬 فيديو" : "🎙️ بودكاست"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ==================== STYLE 3: 🎵 الرفوف الفاخرة المدمجة ==================== */}
      {selectedStyle === "luxury_3tier" && (
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 space-y-10">
          {/* Songs 4-Column Vinyl Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-black text-white">أناشيد وكورال العقيق الرسمية 🎵</h2>
              <button
                type="button"
                onClick={() => playSong(0)}
                className="rounded-xl bg-amber-400 text-slate-950 px-3.5 py-1.5 text-xs font-black"
              >
                تشغيل الباقة كاملة 🎵
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(songs || []).map((s, idx) => (
                <div key={s.id || idx} className="rounded-2xl border border-white/10 bg-[#0d0f17] p-3.5 text-right space-y-2">
                  <div
                    onClick={() => playSong(s)}
                    className="relative aspect-square w-full rounded-xl bg-gradient-to-tr from-black to-slate-900 grid place-items-center cursor-pointer border border-white/10"
                  >
                    <Disc size={40} className={`text-amber-400 ${isCurrentPlaying(s.id) ? "animate-[spin_4s_linear_infinite]" : ""}`} />
                  </div>
                  <h4 className="text-xs font-black text-white truncate">{s.title}</h4>
                  <p className="text-[10px] text-slate-400 font-bold truncate">{s.artistOrHost}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Videos Grid */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white">المسرح المرئي 🎬</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rawPodcasts.filter((p) => p.mediaType === "video").map((v) => (
                <div
                  key={v.id}
                  onClick={() => setWatchingVideoPodcast(v)}
                  className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden cursor-pointer"
                >
                  <div className="aspect-video bg-black relative grid place-items-center">
                    {v.coverUrl ? (
                      <img src={directDriveImage(v.coverUrl) || v.coverUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Video size={30} className="text-indigo-400" />
                    )}
                  </div>
                  <div className="p-3 text-right">
                    <h4 className="text-xs font-black text-white truncate">{v.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ==================== STYLE 4: 💎 شبكة الكروت الملكية 3D ==================== */}
      {selectedStyle === "signature_3d" && (
        <section className="mx-auto max-w-[1360px] px-5 py-10 md:px-8 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredUnifiedItems.map((item, idx) => {
              const isPlayingThis = isCurrentPlaying(item.id);
              const cover = directDriveImage(item.coverUrl) || item.coverUrl;
              return (
                <article
                  key={item.id || idx}
                  className={`group relative overflow-hidden rounded-[2rem] border p-4 transition duration-300 ${
                    isPlayingThis
                      ? "border-[#f8ca14] bg-[#121212] ring-2 ring-[#f8ca14]/40"
                      : "border-[#f8ca14]/30 bg-[#080808] text-white hover:border-[#f8ca14]/60"
                  }`}
                >
                  <div className="relative flex h-full flex-col gap-5 sm:flex-row">
                    {/* 3D Tilted Cover */}
                    <button
                      type="button"
                      onClick={() => handlePlayOrOpen(item)}
                      className="relative min-h-[200px] w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0c0c0c] sm:w-[42%] shrink-0"
                    >
                      <div
                        className="absolute bottom-[9%] left-[8%] top-[9%] w-[50%] overflow-hidden rounded-[1rem] border border-white/10 bg-[#141414]"
                        style={{ transform: "rotate(-7deg)" }}
                      >
                        {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : null}
                      </div>
                      <div
                        className="absolute bottom-[6%] right-[10%] top-[6%] w-[62%] overflow-hidden rounded-[1rem] border border-[#f8ca14]/60 bg-[#141414] p-1.5"
                        style={{ transform: "rotate(2deg)" }}
                      >
                        {cover ? (
                          <img src={cover} alt="" className="h-full w-full rounded-[0.7rem] object-cover" />
                        ) : (
                          <div className="grid h-full place-items-center">
                            <Mic size={24} className="text-[#f8ca14]" />
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Info */}
                    <div className="flex min-w-0 flex-1 flex-col text-right">
                      <span className="text-[10px] font-black text-amber-400">{item.category}</span>
                      <h3
                        onClick={() => handlePlayOrOpen(item)}
                        className="mt-2 text-base font-black text-white hover:text-amber-300 cursor-pointer truncate"
                      >
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400 font-bold line-clamp-2 leading-relaxed">{item.description}</p>
                      
                      <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold">{item.artistOrHost}</span>
                        <button
                          type="button"
                          onClick={() => handlePlayOrOpen(item)}
                          className="rounded-xl bg-[#f8ca14] text-slate-950 px-3.5 py-1.5 text-xs font-black"
                        >
                          {isPlayingThis ? "إيقاف مؤقت" : "تشغيل"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

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
