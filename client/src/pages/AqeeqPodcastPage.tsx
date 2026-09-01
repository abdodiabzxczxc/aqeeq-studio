import { useState, useMemo } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const ATHEER_CATEGORIES = [
  { id: "all", label: "🌟 الكل" },
  { id: "songs", label: "🎵 أناشيد وكورال العقيق" },
  { id: "إذاعة الصباح", label: "🎙️ إذاعة الصباح" },
  { id: "بودكاست قيادات", label: "🎙️ بودكاست قيادات" },
  { id: "تغطيات صوتية", label: "🎬 تغطيات صوتية ومرئية" },
  { id: "حوارات الطلاب", label: "🎤 حوارات الطلاب" },
  { id: "نشرات إخبارية", label: "📰 نشرات إخبارية" },
] as const;

function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const id =
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/)?.[1];
  return id ? `/api/drive-proxy/${id}` : url;
}

/* ==================== 1. Song Card (School Anthems & Corals) ==================== */
function SongCard({
  song,
  index,
  isPlayingThis,
  onPlay,
  onShare,
  dark,
}: {
  song: any;
  index: number;
  isPlayingThis: boolean;
  onPlay: () => void;
  onShare: (s: any, e: React.MouseEvent) => void;
  dark: boolean;
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border p-4 transition duration-300 hover:-translate-y-1 md:p-5 ${
        isPlayingThis
          ? dark
            ? "border-[#f8ca14] bg-[#121212] ring-2 ring-[#f8ca14]/30 shadow-[0_24px_60px_rgba(248,202,20,0.15)]"
            : "border-[#08467d] bg-[#f0f7ff] ring-2 ring-[#08467d]/30"
          : dark
          ? "border-[#f8ca14]/30 bg-[#080808] text-white shadow-[0_24px_60px_rgba(0,0,0,0.5)] hover:border-[#f8ca14]/60"
          : "border-slate-200/90 bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-amber-400/60"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_45%,rgba(255,255,255,0.03)_46%,transparent_47%)]" />
      <div className="relative flex h-full flex-col gap-5 sm:flex-row items-center sm:items-stretch">
        {/* Interactive Spinning CD Disc Preview */}
        <button
          type="button"
          onClick={onPlay}
          className={`relative min-h-[170px] sm:min-h-[190px] w-full sm:w-[42%] grid place-items-center rounded-[1.5rem] border overflow-hidden transition shrink-0 ${
            dark ? "bg-gradient-to-tr from-[#090b10] to-[#141828] border-white/10 shadow-lg" : "bg-gradient-to-tr from-[#f8fafc] via-[#f1f5f9] to-[#ffffff] border-slate-200 shadow-sm"
          }`}
          title={`تشغيل ${song.title}`}
        >
          {/* Concentric CD Grooves */}
          <div className={`pointer-events-none absolute inset-2.5 rounded-full border ${dark ? "border-white/10" : "border-slate-300/80"}`} />
          <div className={`pointer-events-none absolute inset-5 rounded-full border ${dark ? "border-white/5" : "border-slate-300/40"}`} />
          <div className={`pointer-events-none absolute inset-8 rounded-full border ${dark ? "border-white/10" : "border-slate-300/80"}`} />

          {/* Center Spindle with Musical Note Art */}
          <div className={`relative grid h-16 w-16 place-items-center rounded-full bg-gradient-to-tr from-[#f8ca14] to-amber-600 shadow-2xl overflow-hidden ${
            isPlayingThis ? "animate-[spin_4s_linear_infinite]" : "group-hover:scale-105 transition duration-300"
          }`}>
            <img
              src={dark ? "/audio-default-cover-dark.svg" : "/audio-default-cover-light.svg"}
              alt=""
              className="h-full w-full object-cover"
            />
            {/* Center Hole */}
            <div className={`absolute h-3.5 w-3.5 rounded-full border shadow-inner ${
              dark ? "bg-[#090b10] border-amber-300" : "bg-slate-100 border-slate-400"
            }`} />
          </div>

          {/* Hover Play / Pause Button Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#f8ca14] text-slate-950 shadow-xl transition transform group-hover:scale-110">
              {isPlayingThis ? <Pause size={20} /> : <Play size={20} className="mr-0.5 fill-current" />}
            </div>
          </div>
        </button>

        {/* Info Column */}
        <div className="flex min-w-0 flex-1 flex-col text-right w-full">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-black text-amber-400 flex items-center gap-1">
                <Music size={11} /> {song.category || "أناشيد العقيق"}
              </span>
            </div>
            <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-400">
              نشيد رسمي 🎵
            </span>
          </div>

          <h3
            onClick={onPlay}
            className={`mt-3 text-lg font-black line-clamp-2 cursor-pointer transition leading-snug ${
              dark ? "text-white group-hover:text-amber-300" : "text-slate-900 group-hover:text-amber-700"
            }`}
          >
            {song.title}
          </h3>

          <p className="mt-1 text-xs font-bold text-slate-400">
            {song.artistOrHost || "كورال ومدارس العقيق الأهلية والدولية"}
          </p>

          <div className={`mt-auto flex items-center justify-between gap-2 border-t pt-3.5 ${dark ? "border-white/[0.08]" : "border-black/[0.08]"}`}>
            <span className="text-[10px] font-black text-amber-400 flex items-center gap-1.5">
              {isPlayingThis ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  قيد التشغيل في الأسطوانة
                </>
              ) : (
                "جاهز للاستماع الفوري"
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => onShare(song, e)}
                className={`grid h-8 w-8 place-items-center rounded-xl border transition ${
                  dark ? "border-white/10 hover:bg-emerald-600 hover:text-white text-slate-400" : "border-black/10 hover:bg-emerald-600 hover:text-white text-slate-600"
                }`}
                title="مشاركة"
              >
                <Share2 size={13} />
              </button>

              <button
                type="button"
                onClick={onPlay}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition shadow-md ${
                  isPlayingThis
                    ? "bg-[#f8ca14] text-slate-950 font-black shadow-[#f8ca14]/30"
                    : dark
                    ? "bg-[#f8ca14]/15 text-[#f8ca14] hover:bg-[#f8ca14] hover:text-slate-950"
                    : "bg-[#f8ca14] text-slate-950 hover:bg-amber-300"
                }`}
              >
                {isPlayingThis ? <Pause size={13} /> : <Play size={13} className="mr-0.5 fill-current" />}
                <span>{isPlayingThis ? "إيقاف مؤقت" : "استماع للنشيد"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ==================== 2. Podcast Card (Audio & Video Episodes) ==================== */
function PodcastCard({
  podcast,
  index,
  isPlayingThis,
  onPlayOrOpen,
  onShare,
  onLike,
  dark,
}: {
  podcast: any;
  index: number;
  isPlayingThis: boolean;
  onPlayOrOpen: () => void;
  onShare: (p: any, e: React.MouseEvent) => void;
  onLike: (p: any, e: React.MouseEvent) => void;
  dark: boolean;
}) {
  const cover = directDriveImage(podcast.coverUrl) || podcast.coverUrl;
  const isVideo = podcast.mediaType === "video";

  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border p-4 transition duration-300 hover:-translate-y-1 md:p-5 ${
        isPlayingThis
          ? dark
            ? "border-indigo-400 bg-[#0f1124] ring-2 ring-indigo-400/40 shadow-[0_24px_60px_rgba(99,102,241,0.2)]"
            : "border-indigo-500 bg-[#f5f3ff] ring-2 ring-indigo-400/30"
          : dark
          ? "border-white/10 bg-[#080808] text-white shadow-[0_24px_60px_rgba(0,0,0,0.5)] hover:border-indigo-400/50"
          : "border-slate-200/90 bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-indigo-400/50"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_45%,rgba(255,255,255,0.03)_46%,transparent_47%)]" />
      <div className="relative flex h-full flex-col gap-5 sm:flex-row">
        {/* Visual Cover Preview Container */}
        <button
          onClick={onPlayOrOpen}
          className={`relative min-h-[200px] w-full overflow-hidden rounded-[1.5rem] border text-right sm:w-[42%] shrink-0 ${
            dark ? "border-white/[0.08] bg-[#0c0e1a]" : "border-black/[0.06] bg-[#f8f8fc]"
          }`}
          aria-label={`تشغيل ${podcast.title}`}
        >
          {/* Background tilted card */}
          <div
            className={`absolute bottom-[9%] left-[8%] top-[9%] w-[50%] overflow-hidden rounded-[1rem] border opacity-50 ${
              dark ? "border-white/[0.1] bg-[#141828]" : "border-black/[0.08] bg-[#ebebf5]"
            }`}
            style={{ transform: "rotate(-7deg)" }}
          >
            {cover ? (
              <img src={cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-indigo-500/20 to-transparent p-3 text-[9px] font-bold text-indigo-400">
                أثير العقيق
              </div>
            )}
          </div>

          {/* Front cover */}
          <div
            className={`absolute bottom-[6%] right-[10%] top-[6%] w-[62%] overflow-hidden rounded-[1rem] border p-1.5 shadow-xl ${
              isPlayingThis
                ? "border-indigo-400 bg-[#141830]"
                : dark
                ? "border-indigo-400/40 bg-[#101322]"
                : "border-indigo-200 bg-white"
            }`}
            style={{ transform: "rotate(2deg)" }}
          >
            {cover ? (
              <div className="relative h-full w-full rounded-[0.7rem] overflow-hidden">
                <img src={cover} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl transition group-hover:scale-110">
                    {isPlayingThis ? <Pause size={18} /> : isVideo ? <Video size={18} /> : <Play size={18} className="mr-0.5 fill-current" />}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col justify-between rounded-[0.7rem] bg-gradient-to-br from-indigo-600/30 to-purple-800/20 p-3 text-right">
                <Mic size={22} className="text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-black text-indigo-300 line-clamp-1">{podcast.title}</span>
              </div>
            )}
          </div>
        </button>

        {/* Info Column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                dark ? "border-indigo-400/30 bg-indigo-500/10 text-indigo-400" : "border-indigo-200 bg-indigo-50 text-indigo-700"
              }`}
            >
              {isVideo ? <Video size={15} /> : <Headphones size={15} />}
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black border ${
                  dark
                    ? "border-indigo-400/30 bg-indigo-500/10 text-indigo-300"
                    : "border-indigo-200 bg-indigo-50 text-indigo-700"
                }`}
              >
                {podcast.category}
              </span>
              <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                {podcast.duration || "10:00"}
              </span>
            </div>
          </div>

          <h3
            onClick={onPlayOrOpen}
            className={`mt-2.5 text-lg font-black line-clamp-2 cursor-pointer transition leading-snug ${
              dark ? "text-white group-hover:text-indigo-300" : "text-slate-900 group-hover:text-indigo-700"
            }`}
          >
            {podcast.title}
          </h3>

          <p className={`mt-1.5 text-xs leading-6 line-clamp-2 font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>
            {podcast.description}
          </p>

          {/* Host Badge */}
          <div className="mt-3 flex items-center gap-2">
            <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-[10px]">
              <Mic size={11} />
            </div>
            <span className="text-[11px] font-black truncate">{podcast.hostName || "فريق الإذاعة المدرسية"}</span>
            <span className="text-[10px] text-slate-500 font-bold">· تقديم وحوار</span>
          </div>

          <div className={`mt-auto flex items-end justify-between gap-3 border-t pt-3.5 ${dark ? "border-white/[0.08]" : "border-black/[0.08]"}`}>
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400">
              <span className="flex items-center gap-1">
                <Eye size={12} />
                <span>{podcast.viewCount || 0}</span>
              </span>
              <button
                type="button"
                onClick={(e) => onLike(podcast, e)}
                className="flex items-center gap-1 text-rose-400 hover:scale-110 transition"
              >
                <Heart size={12} className="fill-rose-500/20" />
                <span>{podcast.likesCount || 0}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => onShare(podcast, e)}
                className={`grid h-8 w-8 place-items-center rounded-xl border transition ${
                  dark ? "border-white/10 hover:bg-emerald-600 hover:text-white text-slate-400" : "border-black/10 hover:bg-emerald-600 hover:text-white text-slate-600"
                }`}
                title="مشاركة"
              >
                <Share2 size={13} />
              </button>
              <button
                onClick={onPlayOrOpen}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition shadow-md ${
                  isPlayingThis
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/30"
                    : dark
                    ? "bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500 hover:text-white"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {isPlayingThis ? <Pause size={13} /> : isVideo ? <Video size={13} /> : <Play size={13} className="mr-0.5 fill-current" />}
                <span>{isPlayingThis ? "إيقاف مؤقت" : isVideo ? "مشاهدة الفيديو" : "تشغيل الحلقة"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ==================== 3. Main Atheer Al-Aqeeq Page ==================== */
export default function AqeeqPodcastPage() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const isAdmin = isAuthenticated && user?.role === "admin";

  const { data: rawPodcasts = [], isLoading } = trpc.podcasts.list.useQuery({});
  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const { activeItem, isPlaying, playSong, playPodcast, pausePodcast, songs } = usePodcastPlayer();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<"all" | "audio" | "video">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [watchingVideoPodcast, setWatchingVideoPodcast] = useState<any | null>(null);

  const utils = trpc.useUtils();
  const likeMutation = trpc.podcasts.like.useMutation({
    onSuccess: () => {
      utils.podcasts.list.invalidate();
      toast.success("شكراً لتفاعلك! تم تسجيل إعجابك بنجاح ❤️");
    },
  });

  const filteredPodcasts = useMemo(() => {
    return rawPodcasts.filter((p) => {
      if (selectedCategory === "songs") return false;
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
      if (selectedType !== "all" && p.mediaType !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.hostName && p.hostName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [rawPodcasts, selectedCategory, selectedType, searchQuery]);

  const filteredSongs = useMemo(() => {
    if (selectedType === "video") return [];
    if (selectedCategory !== "all" && selectedCategory !== "songs") return [];
    return (songs || []).filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          (s.artistOrHost && s.artistOrHost.toLowerCase().includes(q)) ||
          (s.category && s.category.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [songs, selectedCategory, selectedType, searchQuery]);

  const featuredItem = rawPodcasts[0] || null;
  const secondItem = rawPodcasts[1] || null;

  const handleShare = (item: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = window.location.origin + `/atheer#${item.slug || item.id}`;
    const text = `استمع إلى: «${item.title}» عبر منصة أثير العقيق 🎙️📻\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleLike = (p: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    likeMutation.mutate({ id: p.id });
  };

  const handlePlayOrOpen = (p: any) => {
    if (p.mediaType === "video") {
      setWatchingVideoPodcast(p);
    } else {
      if (activeItem?.id === p.id && isPlaying) {
        pausePodcast();
      } else {
        playPodcast(p);
      }
    }
  };

  return (
    <main
      dir="rtl"
      className={`min-h-screen aq-public-shell font-[Tajawal,sans-serif] transition-colors duration-200 ${
        dark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Top Header Bar */}
      <AlaqeeqStudioSiteHeader title="أثير العقيق 🎙️" active="podcast" />

      {/* Hero Section */}
      <section
        className={`relative isolate overflow-hidden border-b ${
          dark ? "border-white/[0.08] bg-black text-white" : "border-black/[0.06] bg-white text-black"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_18%,rgba(248,202,20,0.12),transparent_25%)]" />

        <div className="relative mx-auto grid max-w-[1440px] items-center gap-8 px-5 py-12 md:grid-cols-[minmax(390px,.9fr)_minmax(0,1.1fr)] md:px-8 md:py-16 lg:gap-16">
          <div className="relative order-2 mx-auto h-[360px] w-full max-w-[580px] md:order-1 md:h-[470px]">
            {secondItem ? (
              <button
                onClick={() => handlePlayOrOpen(secondItem)}
                className={`absolute left-[4%] top-[5%] h-[80%] w-[58%] overflow-hidden rounded-[1.7rem] border p-2 opacity-65 shadow-2xl transition duration-300 hover:scale-105 hover:opacity-100 ${
                  dark ? "border-white/[0.1] bg-[#111111]" : "border-black/[0.08] bg-[#f0f0f0]"
                }`}
                style={{ transform: "rotate(-7deg)" }}
                aria-label={`الحلقة السابقة: ${secondItem.title}`}
              >
                {secondItem.coverUrl ? (
                  <img
                    src={directDriveImage(secondItem.coverUrl) || secondItem.coverUrl}
                    alt=""
                    className="h-full w-full rounded-[1.2rem] object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col justify-between rounded-[1.2rem] bg-gradient-to-br from-indigo-500/10 to-transparent p-5 text-right">
                    <Mic size={30} className="text-indigo-400" />
                    <div>
                      <span className="text-[10px] font-black text-amber-400">{secondItem.category}</span>
                      <p className="line-clamp-2 text-xs font-black text-white">{secondItem.title}</p>
                    </div>
                  </div>
                )}
              </button>
            ) : null}

            {featuredItem ? (
              <button
                onClick={() => handlePlayOrOpen(featuredItem)}
                className={`group absolute bottom-1 right-[5%] h-[90%] w-[68%] overflow-hidden rounded-[1.85rem] border p-2 shadow-2xl transition duration-300 hover:scale-[1.02] ${
                  activeItem?.id === featuredItem.id && isPlaying
                    ? "border-amber-400 ring-2 ring-amber-400/50 bg-[#161616]"
                    : dark
                    ? "border-amber-400/50 bg-[#111111]"
                    : "border-[#08467d]/30 bg-white"
                }`}
                style={{ transform: "rotate(3deg)" }}
                aria-label={`الحلقة المميزة: ${featuredItem.title}`}
              >
                <div className="relative h-full overflow-hidden rounded-[1.35rem]">
                  {featuredItem.coverUrl ? (
                    <div className="relative h-full w-full">
                      <img
                        src={directDriveImage(featuredItem.coverUrl) || featuredItem.coverUrl}
                        alt={`غلاف ${featuredItem.title}`}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="grid h-16 w-16 place-items-center rounded-full bg-amber-400 text-black shadow-2xl transition group-hover:scale-110">
                          {activeItem?.id === featuredItem.id && isPlaying ? (
                            <Pause size={28} />
                          ) : (
                            <Play size={28} className="mr-1 fill-current" />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`flex h-full flex-col justify-between p-6 text-right ${
                        dark
                          ? "bg-gradient-to-br from-[#121424] via-[#0f0f0f] to-black text-amber-400"
                          : "bg-slate-100 text-[#08467d]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Radio size={42} className="text-amber-400" />
                        {activeItem?.id === featuredItem.id && isPlaying && (
                          <div className="flex items-end gap-1 h-6">
                            <span className="w-1 bg-amber-400 animate-[bounce_0.6s_infinite] h-6 rounded-full" />
                            <span className="w-1 bg-amber-400 animate-[bounce_0.8s_infinite] h-4 rounded-full" />
                            <span className="w-1 bg-amber-400 animate-[bounce_0.5s_infinite] h-5 rounded-full" />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black text-black">
                          <Sparkles size={11} /> مميز في أثير العقيق
                        </span>
                        <h2 className="mt-2 text-xl font-black leading-snug text-white line-clamp-3">
                          {featuredItem.title}
                        </h2>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent px-4 pb-4 pt-16 text-right">
                    <span className="text-[10px] font-black text-amber-400">
                      {featuredItem.category} · {featuredItem.duration || "15:00"}
                    </span>
                    <h2 className="mt-1 text-base sm:text-lg font-black text-white line-clamp-2">
                      {featuredItem.title}
                    </h2>
                  </div>
                </div>
              </button>
            ) : null}
          </div>

          <div className="order-1 md:order-2 text-right">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-black ${
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              }`}
            >
              <Radio size={14} className="animate-pulse" />
              <span>أثير العقيق 🎙️ · المنصة الصوتية والمرئية الشاملة</span>
            </div>

            <h1
              className={`mt-5 text-4xl font-black leading-[1.14] md:text-6xl ${
                dark ? "text-white" : "text-black"
              }`}
            >
              أثير العقيق 🎙️
            </h1>

            <p className={`mt-4 text-base font-bold leading-relaxed ${dark ? "text-amber-300/90" : "text-amber-700"}`}>
              المساحة الرقمية الموحدة لبودكاست المدارس، الإذاعة الصباحية، وكورال وأناشيد العقيق الرسمية.
            </p>

            <p className={`mt-2 max-w-xl text-xs leading-7 ${dark ? "text-slate-400" : "text-slate-600"}`}>
              استمع وشاهد إنتاجات مدارس العقيق الأهلية والدولية؛ من الأناشيد الوطنية وأغاني التخرج، إلى اللقاءات الحوارية التربوية وبودكاست القيادات المصور.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-bold text-slate-400">
              <span
                className={`rounded-full border px-3 py-2 ${
                  dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
                }`}
              >
                <Music className="ml-1 inline text-amber-400" size={13} />
                {songs?.length || 0} أناشيد رسمية
              </span>
              <span
                className={`rounded-full border px-3 py-2 ${
                  dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
                }`}
              >
                <Radio className="ml-1 inline text-indigo-400" size={13} />
                {rawPodcasts.length} حلقات بودكاست
              </span>
              <span
                className={`rounded-full border px-3 py-2 ${
                  dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
                }`}
              >
                <Headphones className="ml-1 inline text-emerald-400" size={13} />
                مرئي ومسموع 100%
              </span>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {featuredItem ? (
                <button
                  onClick={() => handlePlayOrOpen(featuredItem)}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-black shadow-lg transition active:scale-95 hover:opacity-90 bg-amber-400 text-slate-950 shadow-amber-400/25"
                >
                  {activeItem?.id === featuredItem.id && isPlaying ? (
                    <>
                      <Pause size={16} />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} className="mr-0.5 fill-current" />
                      <span>{featuredItem.mediaType === "video" ? "مشاهدة الحلقة المميزة" : "استمع الآن"}</span>
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
                      ? "border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
                      : "border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100"
                  }`}
                >
                  <Disc size={15} className="animate-[spin_4s_linear_infinite]" />
                  <span>تشغيل أسطوانة الأناشيد 🎵</span>
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

      <section id="episodes" className="mx-auto max-w-[1360px] px-5 py-12 md:px-8 md:py-16">
        <div className={`mb-8 flex items-end justify-between gap-4 border-b pb-5 ${
          dark ? "border-white/[0.08]" : "border-black/[0.08]"
        }`}>
          <div>
            <p className="text-[10px] font-black tracking-[0.18em] text-amber-400 uppercase">
              ATHEER ALAQEEQ MEDIA HUB
            </p>
            <h2 className={`mt-1.5 text-2xl font-black ${dark ? "text-white" : "text-black"}`}>
              مكتبة أثير العقيق الصوتية والمرئية
            </h2>
          </div>
          <span className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
            {(filteredPodcasts.length + (filteredSongs ? filteredSongs.length : 0))} عمل متاح
          </span>
        </div>

        <div
          className={`mb-8 rounded-2xl border p-4 transition ${
            dark ? "border-[#f8ca14]/30 bg-black/60 shadow-lg shadow-[#f8ca14]/5" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="text-[10px] font-black tracking-[.18em] uppercase text-amber-400 mb-2">
            FIND & FILTER · البحث والفلترة الشاملة
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-3">
            <div className="relative w-full lg:flex-1">
              <Search size={16} className="absolute top-3.5 right-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الأناشيد المدرسية، وحلقات البودكاست، وأسماء المذيعين..."
                className={`w-full rounded-xl border pr-10 pl-4 py-2.5 text-xs font-bold outline-none transition ${
                  dark ? "border-white/10 bg-black text-white focus:border-[#f8ca14]" : "border-black/10 bg-slate-50 text-black focus:border-[#08467d]"
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

            <div
              className={`flex items-center gap-1 rounded-xl border p-1 shrink-0 ${
                dark ? "border-white/15 bg-black/60" : "border-black/15 bg-white shadow-sm"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedType("all")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-black transition ${
                  selectedType === "all"
                    ? dark
                      ? "bg-[#f8ca14] text-black shadow-md"
                      : "bg-[#08467d] text-white shadow-md"
                    : "text-slate-400 hover:text-current"
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setSelectedType("audio")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-black transition flex items-center gap-1 ${
                  selectedType === "audio"
                    ? dark
                      ? "bg-[#f8ca14] text-black shadow-md"
                      : "bg-[#08467d] text-white shadow-md"
                    : "text-slate-400 hover:text-current"
                }`}
              >
                <Headphones size={13} />
                <span>صوت وأناشيد</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedType("video")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-black transition flex items-center gap-1 ${
                  selectedType === "video"
                    ? dark
                      ? "bg-[#f8ca14] text-black shadow-md"
                      : "bg-[#08467d] text-white shadow-md"
                    : "text-slate-400 hover:text-current"
                }`}
              >
                <Video size={13} />
                <span>فيديو</span>
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 ml-2">الأقسام:</span>
            {ATHEER_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-black transition border ${
                    active
                      ? dark
                        ? "border-[#f8ca14] bg-[#f8ca14] text-black shadow-sm"
                        : "border-[#08467d] bg-[#08467d] text-white shadow-sm"
                      : dark
                      ? "border-white/10 bg-black/40 text-slate-300 hover:border-white/30"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-64 rounded-[2rem] border animate-pulse ${
                  dark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"
                }`}
              />
            ))}
          </div>
        ) : (filteredPodcasts.length === 0 && (!filteredSongs || filteredSongs.length === 0)) ? (
          <div
            className={`rounded-[2.5rem] border border-dashed p-12 text-center max-w-md mx-auto space-y-4 ${
              dark ? "border-white/15 bg-black/20" : "border-black/15 bg-white"
            }`}
          >
            <Radio size={44} className="mx-auto text-amber-400" />
            <h3 className="text-lg font-black">لا توجد أعمال مطابقة حالياً</h3>
            <p className="text-xs text-slate-400 font-bold leading-6">
              ترقبوا قريباً أعمالاً وأناشيد وحلقات جديدة ومتميزة عبر أثير العقيق!
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredSongs && filteredSongs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-xl bg-amber-400/20 text-amber-400 font-bold">
                    <Music size={14} />
                  </span>
                  <h3 className={`text-xl font-black ${dark ? "text-white" : "text-slate-900"}`}>
                    أناشيد وكورال العقيق 🎵
                  </h3>
                  <span className="text-xs font-bold text-slate-400 mr-2">
                    ({filteredSongs.length} نشيد متاح للاستماع)
                  </span>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {filteredSongs.map((s: any, idx: number) => (
                    <SongCard
                      key={s.id || idx}
                      song={s}
                      index={idx}
                      isPlayingThis={activeItem?.id === s.id && isPlaying}
                      onPlay={() => playSong(s)}
                      onShare={handleShare}
                      dark={dark}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredPodcasts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-xl bg-indigo-500/20 text-indigo-400 font-bold">
                    <Mic size={14} />
                  </span>
                  <h3 className={`text-xl font-black ${dark ? "text-white" : "text-slate-900"}`}>
                    حلقات البودكاست والإذاعة 🎙️
                  </h3>
                  <span className="text-xs font-bold text-slate-400 mr-2">
                    ({filteredPodcasts.length} حلقة منشورة)
                  </span>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {filteredPodcasts.map((p, idx) => (
                    <PodcastCard
                      key={p.id}
                      podcast={p}
                      index={idx}
                      isPlayingThis={activeItem?.id === p.id && isPlaying}
                      onPlayOrOpen={() => handlePlayOrOpen(p)}
                      onShare={handleShare}
                      onLike={handleLike}
                      dark={dark}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {watchingVideoPodcast && (
        <Dialog open={Boolean(watchingVideoPodcast)} onOpenChange={() => setWatchingVideoPodcast(null)}>
          <DialogContent
            className={`max-w-4xl rounded-[2.5rem] border p-6 text-right shadow-2xl ${
              dark ? "border-amber-400/40 bg-[#0a0a0a] text-white" : "border-[#08467d]/30 bg-white text-slate-900"
            }`}
            dir="rtl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-amber-400 px-3 py-1 text-xs font-black text-black">
                    {watchingVideoPodcast.category}
                  </span>
                  <h3 className="text-base font-black text-white">{watchingVideoPodcast.title}</h3>
                </div>
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
                  <video
                    src={watchingVideoPodcast.mediaUrl}
                    controls
                    autoPlay
                    className="h-full w-full object-contain"
                  />
                )}
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-400 leading-7">
                {watchingVideoPodcast.description}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
