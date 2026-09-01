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

/* ==================== 1. Compact Apple Vinyl Song Card ==================== */
function SongCompactCard({
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
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3.5 transition duration-300 hover:-translate-y-1 ${
        isPlayingThis
          ? dark
            ? "border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/40 shadow-[0_12px_30px_rgba(248,202,20,0.18)]"
            : "border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/30"
          : dark
          ? "border-white/10 bg-[#0d0f17] hover:border-amber-400/50 hover:bg-[#121624]"
          : "border-slate-200 bg-white hover:border-amber-400/50 hover:bg-slate-50 shadow-sm"
      }`}
    >
      {/* Vinyl Art Preview Container */}
      <div
        onClick={onPlay}
        className={`relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl border grid place-items-center transition ${
          dark ? "bg-gradient-to-tr from-[#05060a] to-[#121626] border-white/10" : "bg-gradient-to-tr from-slate-100 to-slate-200 border-slate-200"
        }`}
      >
        {/* Concentric Grooves */}
        <div className={`pointer-events-none absolute inset-2 rounded-full border ${dark ? "border-white/10" : "border-slate-300"}`} />
        <div className={`pointer-events-none absolute inset-4 rounded-full border ${dark ? "border-white/5" : "border-slate-300/60"}`} />
        <div className={`pointer-events-none absolute inset-7 rounded-full border ${dark ? "border-white/10" : "border-slate-300/80"}`} />

        {/* Center Disc Artwork */}
        <div
          className={`relative grid h-16 w-16 place-items-center rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 shadow-xl overflow-hidden ${
            isPlayingThis ? "animate-[spin_4s_linear_infinite]" : "group-hover:scale-105 transition duration-300"
          }`}
        >
          <img
            src={dark ? "/audio-default-cover-dark.svg" : "/audio-default-cover-light.svg"}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className={`absolute h-3 w-3 rounded-full border shadow-inner ${
            dark ? "bg-[#05060a] border-amber-300" : "bg-white border-slate-400"
          }`} />
        </div>

        {/* Track Number Badge */}
        <div className="absolute top-2.5 right-2.5 rounded-lg bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono font-black text-amber-400 border border-white/10">
          #{String(index + 1).padStart(2, "0")}
        </div>

        {/* Floating Play Overlay on Hover */}
        <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-400 text-slate-950 shadow-xl transition transform group-hover:scale-110">
            {isPlayingThis ? <Pause size={18} /> : <Play size={18} className="mr-0.5 fill-current" />}
          </div>
        </div>
      </div>

      {/* Song Info */}
      <div className="mt-3 text-right">
        <span className="text-[10px] font-black text-amber-400">
          {song.category || "أناشيد العقيق"}
        </span>
        <h4
          onClick={onPlay}
          className={`mt-0.5 text-xs font-black truncate cursor-pointer transition ${
            dark ? "text-white group-hover:text-amber-300" : "text-slate-900 group-hover:text-amber-700"
          }`}
        >
          {song.title}
        </h4>
        <p className="mt-0.5 text-[10px] text-slate-400 font-bold truncate">
          {song.artistOrHost || "كورال ومدارس العقيق"}
        </p>
      </div>

      {/* Action Bar */}
      <div className={`mt-3 flex items-center justify-between border-t pt-2.5 ${dark ? "border-white/10" : "border-slate-100"}`}>
        <button
          type="button"
          onClick={(e) => onShare(song, e)}
          className={`grid h-7 w-7 place-items-center rounded-lg border text-slate-400 hover:text-emerald-400 transition ${
            dark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-100"
          }`}
          title="مشاركة"
        >
          <Share2 size={11} />
        </button>

        <button
          type="button"
          onClick={onPlay}
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black transition shadow-sm ${
            isPlayingThis
              ? "bg-amber-400 text-slate-950 font-black shadow-amber-400/30"
              : dark
              ? "bg-amber-400/15 text-amber-300 hover:bg-amber-400 hover:text-slate-950"
              : "bg-amber-400 text-slate-950 hover:bg-amber-300"
          }`}
        >
          {isPlayingThis ? <Pause size={11} /> : <Play size={11} className="mr-0.5 fill-current" />}
          <span>{isPlayingThis ? "إيقاف" : "استماع"}</span>
        </button>
      </div>
    </div>
  );
}

/* ==================== 2. Cinema Widescreen Video Podcast Card ==================== */
function VideoPodcastCard({
  podcast,
  onOpen,
  onShare,
  onLike,
  dark,
}: {
  podcast: any;
  onOpen: () => void;
  onShare: (p: any, e: React.MouseEvent) => void;
  onLike: (p: any, e: React.MouseEvent) => void;
  dark: boolean;
}) {
  const cover = directDriveImage(podcast.coverUrl) || podcast.coverUrl;

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1 ${
        dark ? "border-white/10 bg-[#0a0c16] hover:border-indigo-400/60 shadow-lg" : "border-slate-200 bg-white hover:border-indigo-400/60 shadow-sm"
      }`}
    >
      {/* 16:9 Video Aspect Container */}
      <div
        onClick={onOpen}
        className="relative aspect-video w-full cursor-pointer overflow-hidden bg-black"
      >
        {cover ? (
          <img
            src={cover}
            alt={podcast.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-indigo-950 via-slate-900 to-black p-4">
            <Video size={36} className="text-indigo-400" />
          </div>
        )}

        {/* Ambient Overlay Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* Badges on Video */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="rounded-lg bg-indigo-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-white shadow-md flex items-center gap-1">
            <Video size={11} /> مرئي HD
          </span>
          <span className="rounded-lg bg-black/70 backdrop-blur-md px-2 py-1 text-[10px] font-mono text-slate-200 border border-white/10">
            {podcast.duration || "12:00"}
          </span>
        </div>

        {/* Center Glowing Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-indigo-600 text-white shadow-[0_0_25px_rgba(99,102,241,0.6)] transition transform group-hover:scale-115">
            <Play size={20} className="mr-0.5 fill-current" />
          </div>
        </div>

        {/* Category Pill on bottom edge of video */}
        <div className="absolute bottom-2.5 right-3 text-right">
          <span className="rounded-md bg-amber-400/90 px-2 py-0.5 text-[9px] font-black text-slate-950">
            {podcast.category}
          </span>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-4 text-right">
        <h3
          onClick={onOpen}
          className={`text-sm font-black line-clamp-2 cursor-pointer transition leading-snug ${
            dark ? "text-white group-hover:text-indigo-300" : "text-slate-900 group-hover:text-indigo-700"
          }`}
        >
          {podcast.title}
        </h3>

        <p className="mt-1.5 text-xs font-bold text-slate-400 line-clamp-2 leading-relaxed">
          {podcast.description}
        </p>

        {/* Footer */}
        <div className={`mt-3.5 flex items-center justify-between border-t pt-3 ${dark ? "border-white/10" : "border-slate-100"}`}>
          <div className="flex items-center gap-2">
            <div className="grid h-5 w-5 place-items-center rounded-md bg-indigo-500/20 text-indigo-400 font-bold text-[9px]">
              <Mic size={9} />
            </div>
            <span className="text-[10px] font-black text-slate-400 truncate max-w-[120px]">
              {podcast.hostName || "فريق الإذاعة"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => onLike(podcast, e)}
              className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:scale-110 transition px-1.5 py-0.5"
            >
              <Heart size={11} className="fill-rose-500/20" />
              <span>{podcast.likesCount || 0}</span>
            </button>

            <button
              type="button"
              onClick={(e) => onShare(podcast, e)}
              className={`grid h-7 w-7 place-items-center rounded-lg border transition ${
                dark ? "border-white/10 hover:bg-emerald-600 hover:text-white text-slate-400" : "border-slate-200 hover:bg-emerald-600 hover:text-white text-slate-600"
              }`}
              title="مشاركة"
            >
              <Share2 size={11} />
            </button>

            <button
              type="button"
              onClick={onOpen}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1 text-xs font-black text-white shadow-md transition"
            >
              <Video size={11} />
              <span>مشاهدة</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ==================== 3. Studio Audio Podcast Capsule Card ==================== */
function AudioPodcastCard({
  podcast,
  isPlayingThis,
  onPlay,
  onShare,
  onLike,
  dark,
}: {
  podcast: any;
  isPlayingThis: boolean;
  onPlay: () => void;
  onShare: (p: any, e: React.MouseEvent) => void;
  onLike: (p: any, e: React.MouseEvent) => void;
  dark: boolean;
}) {
  const cover = directDriveImage(podcast.coverUrl) || podcast.coverUrl;

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 transition duration-300 hover:-translate-y-1 ${
        isPlayingThis
          ? dark
            ? "border-indigo-400 bg-[#0e1124] ring-2 ring-indigo-400/30 shadow-[0_16px_35px_rgba(99,102,241,0.2)]"
            : "border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-400/30"
          : dark
          ? "border-white/10 bg-[#0a0c14] hover:border-indigo-400/40 hover:bg-[#0f1220]"
          : "border-slate-200 bg-white hover:border-indigo-400/40 shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3.5 text-right">
        {/* Cover / Studio Avatar */}
        <button
          type="button"
          onClick={onPlay}
          className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border grid place-items-center transition ${
            dark ? "bg-[#141828] border-white/10" : "bg-slate-100 border-slate-200"
          }`}
          title={`تشغيل ${podcast.title}`}
        >
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <Mic size={24} className="text-indigo-400" />
          )}

          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-indigo-600 text-white shadow-md">
              {isPlayingThis ? <Pause size={14} /> : <Play size={14} className="mr-0.5 fill-current" />}
            </div>
          </div>
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="rounded-md bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[9px] font-black text-indigo-300">
              {podcast.category}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {podcast.duration || "10:00"}
            </span>
          </div>

          <h4
            onClick={onPlay}
            className={`mt-1 text-xs sm:text-sm font-black line-clamp-2 cursor-pointer transition leading-snug ${
              dark ? "text-white group-hover:text-indigo-300" : "text-slate-900 group-hover:text-indigo-700"
            }`}
          >
            {podcast.title}
          </h4>

          <p className="mt-1 text-[11px] text-slate-400 line-clamp-1 font-bold">
            {podcast.hostName || "فريق الإذاعة المدرسية"}
          </p>
        </div>
      </div>

      {/* Footer & Live Soundwave */}
      <div className={`mt-3.5 flex items-center justify-between border-t pt-2.5 ${dark ? "border-white/10" : "border-slate-100"}`}>
        {/* Equalizer Live Indicator */}
        <div className="flex items-center gap-1.5">
          {isPlayingThis ? (
            <div className="flex items-end gap-0.5 h-3.5">
              <span className="w-0.5 bg-indigo-400 animate-[bounce_0.6s_infinite] h-3.5 rounded-full" />
              <span className="w-0.5 bg-indigo-400 animate-[bounce_0.8s_infinite] h-2 rounded-full" />
              <span className="w-0.5 bg-indigo-400 animate-[bounce_0.5s_infinite] h-3 rounded-full" />
              <span className="text-[9px] font-black text-indigo-400 mr-1">بث صوتي حي</span>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <Headphones size={11} /> بودكاست مسموع
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => onLike(podcast, e)}
            className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:scale-110 transition px-1 py-0.5"
          >
            <Heart size={11} className="fill-rose-500/20" />
            <span>{podcast.likesCount || 0}</span>
          </button>

          <button
            type="button"
            onClick={(e) => onShare(podcast, e)}
            className={`grid h-7 w-7 place-items-center rounded-lg border transition ${
              dark ? "border-white/10 hover:bg-emerald-600 hover:text-white text-slate-400" : "border-slate-200 hover:bg-emerald-600 hover:text-white text-slate-600"
            }`}
            title="مشاركة"
          >
            <Share2 size={11} />
          </button>

          <button
            type="button"
            onClick={onPlay}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black transition shadow-sm ${
              isPlayingThis
                ? "bg-indigo-600 text-white shadow-indigo-600/30"
                : dark
                ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-600 hover:text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {isPlayingThis ? <Pause size={11} /> : <Play size={11} className="mr-0.5 fill-current" />}
            <span>{isPlayingThis ? "إيقاف" : "تشغيل"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

/* ==================== 4. Main Atheer Al-Aqeeq Page ==================== */
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
                      <span>{featuredPodcast.mediaType === "video" ? "مشاهدة الحلقة" : "استمع للحلقة الآن"}</span>
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

      {/* ==================== 2. MAIN INTERACTIVE CONTENT HUB ==================== */}
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 space-y-12">
        
        {/* Universal Filter & Search Bar */}
        <div
          className={`rounded-2xl border p-4 transition ${
            dark ? "border-[#f8ca14]/30 bg-[#0a0c16]/90 shadow-lg shadow-[#f8ca14]/5" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search size={16} className="absolute top-3.5 right-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الأناشيد، الحلقات المرئية، والمقابلات الصوتية..."
                className={`w-full rounded-xl border pr-10 pl-4 py-2.5 text-xs font-bold outline-none transition ${
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

            {/* Category Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
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
        </div>

        {/* ================= SECTION A: 🎵 Compact Luxury Vinyl Anthems Showcase ================= */}
        {filteredSongs && filteredSongs.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-current/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/20 text-amber-400 font-bold">
                  <Music size={16} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black">أناشيد وكورال العقيق الرسمية 🎵</h2>
                  <p className="text-[11px] text-slate-400 font-bold">الإنتاج الموسيقي والنشيد المعتمد للمدارس والاحتفالات</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => playSong(0)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-1.5 text-xs font-black shadow-sm transition active:scale-95"
              >
                <Disc size={13} className="animate-[spin_4s_linear_infinite]" />
                <span>تشغيل الباقة كاملة في الأسطوانة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filteredSongs.map((s: any, idx: number) => (
                <SongCompactCard
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
          </section>
        )}

        {/* ================= SECTION B: 🎬 Video Podcasts Cinema Stage ================= */}
        {videoPodcasts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-current/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-500/20 text-indigo-400 font-bold">
                  <Video size={16} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black">المسرح المرئي وحلقات الفيديو 🎬</h2>
                  <p className="text-[11px] text-slate-400 font-bold">تغطيات وحوارات مصورة بجودة عالية</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-bold">
                {videoPodcasts.length} حلقات مرئية
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {videoPodcasts.map((p) => (
                <VideoPodcastCard
                  key={p.id}
                  podcast={p}
                  onOpen={() => setWatchingVideoPodcast(p)}
                  onShare={handleShare}
                  onLike={handleLike}
                  dark={dark}
                />
              ))}
            </div>
          </section>
        )}

        {/* ================= SECTION C: 🎙️ Audio Podcasts & Morning Radio ================= */}
        {audioPodcasts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-current/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
                  <Radio size={16} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black">استوديو البودكاست وإذاعة الصباح 🎙️</h2>
                  <p className="text-[11px] text-slate-400 font-bold">حوارات القيادات، البرامج التربوية، ومشاركات الطلاب الصوتية</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-bold">
                {audioPodcasts.length} حلقات مسموعة
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {audioPodcasts.map((p) => (
                <AudioPodcastCard
                  key={p.id}
                  podcast={p}
                  isPlayingThis={activeItem?.id === p.id && isPlaying}
                  onPlay={() => playPodcast(p)}
                  onShare={handleShare}
                  onLike={handleLike}
                  dark={dark}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {videoPodcasts.length === 0 && audioPodcasts.length === 0 && (!filteredSongs || filteredSongs.length === 0) && (
          <div
            className={`rounded-3xl border border-dashed p-12 text-center max-w-md mx-auto space-y-3 ${
              dark ? "border-white/15 bg-black/20" : "border-slate-300 bg-white"
            }`}
          >
            <Radio size={40} className="mx-auto text-amber-400" />
            <h3 className="text-base font-black">لا توجد أعمال مطابقة لبحثك</h3>
            <p className="text-xs text-slate-400 font-bold">
              جرب تغيير كلمة البحث أو اختيار تصنيف آخر من القائمة أعلاه.
            </p>
          </div>
        )}

      </div>

      {/* Video Theater Dialog Modal */}
      {watchingVideoPodcast && (
        <Dialog open={Boolean(watchingVideoPodcast)} onOpenChange={() => setWatchingVideoPodcast(null)}>
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
                    {watchingVideoPodcast.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-black truncate">{watchingVideoPodcast.title}</h3>
                </div>
              </div>

              {/* Video Player */}
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

              <p className="text-xs sm:text-sm font-bold text-slate-400 leading-relaxed">
                {watchingVideoPodcast.description}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
