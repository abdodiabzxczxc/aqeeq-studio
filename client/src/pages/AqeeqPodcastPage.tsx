import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
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
  Calendar,
  Clock,
  Mic,
  ArrowUpLeft,
  X,
  Radio,
  Layers,
  Volume2,
  Check,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const PODCAST_CATEGORIES = [
  { id: "all", label: "الكل" },
  { id: "إذاعة الصباح", label: "إذاعة الصباح" },
  { id: "بودكاست قيادات", label: "بودكاست قيادات" },
  { id: "تغطيات صوتية", label: "تغطيات صوتية ومرئية" },
  { id: "حوارات الطلاب", label: "حوارات الطلاب" },
  { id: "نشرات إخبارية", label: "نشرات إخبارية" },
];

function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const id =
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/)?.[1];
  return id ? `/api/drive-proxy/${id}` : url;
}

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
            ? "border-[#f8ca14] bg-[#121212] ring-2 ring-[#f8ca14]/30 shadow-[0_24px_60px_rgba(248,202,20,0.15)]"
            : "border-[#08467d] bg-[#f0f7ff] ring-2 ring-[#08467d]/30"
          : dark
          ? "border-[#f8ca14]/30 bg-[#080808] text-white shadow-[0_24px_60px_rgba(0,0,0,0.5)] hover:border-[#f8ca14]/60"
          : "border-[#08467d]/20 bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-[#08467d]/50"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_45%,rgba(255,255,255,0.03)_46%,transparent_47%)]" />
      <div className="relative flex h-full flex-col gap-5 sm:flex-row">
        {/* Visual Cover Preview Container */}
        <button
          onClick={onPlayOrOpen}
          className={`relative min-h-[220px] w-full overflow-hidden rounded-[1.5rem] border text-right sm:w-[45%] ${
            dark ? "border-white/[0.08] bg-[#0c0c0c]" : "border-black/[0.06] bg-[#f8f8f8]"
          }`}
          aria-label={`تشغيل ${podcast.title}`}
        >
          {/* Background tilted card */}
          <div
            className={`absolute bottom-[9%] left-[8%] top-[9%] w-[50%] overflow-hidden rounded-[1rem] border opacity-50 ${
              dark ? "border-white/[0.1] bg-[#141414]" : "border-black/[0.08] bg-[#ebebeb]"
            }`}
            style={{ transform: "rotate(-7deg)" }}
          >
            {cover ? (
              <img src={cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-amber-500/20 to-transparent p-3 text-[9px] font-bold text-slate-500">
                بودكاست العقيق
              </div>
            )}
          </div>

          {/* Front cover */}
          <div
            className={`absolute bottom-[6%] right-[10%] top-[6%] w-[62%] overflow-hidden rounded-[1rem] border p-1.5 shadow-xl ${
              isPlayingThis
                ? "border-[#f8ca14] bg-[#1a1a1a]"
                : dark
                ? "border-[#f8ca14]/60 bg-[#141414]"
                : "border-[#08467d]/40 bg-white"
            }`}
            style={{ transform: "rotate(2deg)" }}
          >
            {cover ? (
              <div className="relative h-full w-full rounded-[0.7rem] overflow-hidden">
                <img src={cover} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#f8ca14] text-black shadow-lg">
                    {isPlayingThis ? <Pause size={16} /> : isVideo ? <Video size={16} /> : <Play size={16} className="mr-0.5" />}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`flex h-full flex-col justify-between rounded-[0.7rem] p-3.5 text-right ${
                  dark ? "bg-gradient-to-br from-[#1a1400] to-black text-[#f8ca14]" : "bg-slate-100 text-[#08467d]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Mic size={22} />
                  {isPlayingThis && (
                    <div className="flex items-end gap-0.5 h-4">
                      <span className="w-0.5 bg-[#f8ca14] animate-[bounce_0.6s_infinite] h-4 rounded-full" />
                      <span className="w-0.5 bg-[#f8ca14] animate-[bounce_0.8s_infinite] h-2.5 rounded-full" />
                      <span className="w-0.5 bg-[#f8ca14] animate-[bounce_0.5s_infinite] h-3.5 rounded-full" />
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider">{podcast.category}</span>
                  <p className="line-clamp-2 text-[11px] font-black leading-snug mt-1 text-white">{podcast.title}</p>
                </div>
              </div>
            )}
          </div>
        </button>

        {/* Info Column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              }`}
            >
              {isVideo ? <Video size={16} /> : <Headphones size={16} />}
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black border ${
                  dark
                    ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                    : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
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
            className={`mt-3 text-lg font-black line-clamp-2 cursor-pointer transition leading-snug ${
              dark ? "text-white group-hover:text-[#f8ca14]" : "text-black group-hover:text-[#08467d]"
            }`}
          >
            {podcast.title}
          </h3>

          <p className={`mt-2 text-xs leading-6 line-clamp-2 font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>
            {podcast.description}
          </p>

          {/* Host Badge */}
          <div className="mt-3 flex items-center gap-2">
            <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-tr from-[#f8ca14] to-[#08467d] text-black font-black text-[10px]">
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
                    ? "bg-[#f8ca14] text-black shadow-[#f8ca14]/30"
                    : dark
                    ? "bg-[#f8ca14]/15 text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                    : "bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d] hover:text-white"
                }`}
              >
                {isPlayingThis ? <Pause size={13} /> : isVideo ? <Video size={13} /> : <Play size={13} className="mr-0.5" />}
                <span>{isPlayingThis ? "إيقاف مؤقت" : isVideo ? "مشاهدة الفيديو" : "تشغيل الحلقة"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AqeeqPodcastPage() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | "audio" | "video">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [watchingVideoPodcast, setWatchingVideoPodcast] = useState<any>(null);

  const { activePodcast, isPlaying, playPodcast, pausePodcast } = usePodcastPlayer();

  const { data: rawPodcasts = [], isLoading, refetch } = trpc.podcasts.list.useQuery({
    category: selectedCategory,
    mediaType: selectedType === "all" ? undefined : selectedType,
    search: searchQuery,
  });

  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    refetchOnMount: true,
    staleTime: 0,
  });

  const podcasts = useMemo(() => {
    return rawPodcasts;
  }, [rawPodcasts]);

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
      toast.success("شكراً لتفاعلك وإعجابك بالحلقة ❤️");
    },
  });

  const handleShare = (p: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = window.location.origin + `/podcast#${p.slug}`;
    const text = `استمع إلى حلقة: «${p.title}» عبر إذاعة وبودكاست مدارس العقيق 🎙️\n${url}`;
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
      if (activePodcast?.id === p.id && isPlaying) {
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
      <AlaqeeqStudioSiteHeader title="إذاعة وبودكاست العقيق" active="studio" />

      {/* Hero Section matching Journal & Albums */}
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
                  activePodcast?.id === featuredPodcast.id && isPlaying
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
                          {activePodcast?.id === featuredPodcast.id && isPlaying ? (
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
                        {activePodcast?.id === featuredPodcast.id && isPlaying && (
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
                <Radio className={`ml-1 inline ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />
                {rawPodcasts.length} حلقة منشورة
              </span>
              <span
                className={`rounded-full border px-3 py-2 ${
                  dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
                }`}
              >
                <Headphones className={`ml-1 inline ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />
                صوت وفيديو
              </span>
              <span
                className={`rounded-full border px-3 py-2 ${
                  dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
                }`}
              >
                <Layers className={`ml-1 inline ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />
                تغطيات حوارية
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
                  {activePodcast?.id === featuredPodcast.id && isPlaying ? (
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

              <a
                href="#episodes"
                className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-xs font-black transition ${
                  dark
                    ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                    : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
                }`}
              >
                <Headphones size={16} />
                <span>استكشف جميع الحلقات</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Episodes Feed Section */}
      <section id="episodes" className="mx-auto max-w-[1320px] px-5 py-12 md:px-8 md:py-16">
        <div className={`mb-8 flex items-end justify-between gap-4 border-b pb-5 ${
          dark ? "border-white/[0.08]" : "border-black/[0.08]"
        }`}>
          <div>
            <p className={`text-[10px] font-black tracking-[0.18em] ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
              THE AQEEQ PODCAST
            </p>
            <h2 className={`mt-2 text-2xl font-black ${dark ? "text-white" : "text-black"}`}>
              حلقات إذاعة وبودكاست العقيق
            </h2>
          </div>
          <span className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
            {podcasts.length} من {rawPodcasts.length} حلقة
          </span>
        </div>

        {/* Gold Bordered Find & Sort Bar */}
        <div
          className={`mb-8 rounded-2xl border p-4 transition ${
            dark ? "border-[#f8ca14]/30 bg-black/60 shadow-lg shadow-[#f8ca14]/5" : "border-[#08467d]/20 bg-white shadow-sm"
          }`}
        >
          <div className="text-[10px] font-black tracking-[.18em] uppercase text-amber-400 mb-2">
            FIND & FILTER · البحث وفلترة الحلقات
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full lg:flex-1">
              <Search size={16} className="absolute top-3.5 right-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في عناوين وحلقات البودكاست والضيوف..."
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

            {/* Audio / Video Switcher */}
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
                <span>صوت</span>
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

          {/* Category Filter Pills */}
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 ml-2">التصنيف:</span>
            {PODCAST_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition border ${
                    active
                      ? dark
                        ? "border-[#f8ca14] bg-[#f8ca14] text-black shadow-sm"
                        : "border-[#08467d] bg-[#08467d] text-white shadow-sm"
                      : dark
                      ? "border-white/10 bg-black/40 text-slate-300 hover:border-white/30"
                      : "border-black/10 bg-slate-50 text-slate-700 hover:border-black/30"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Podcast Grid */}
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
        ) : podcasts.length === 0 ? (
          <div
            className={`rounded-[2.5rem] border border-dashed p-12 text-center max-w-md mx-auto space-y-4 ${
              dark ? "border-white/15 bg-black/20" : "border-black/15 bg-white"
            }`}
          >
            <Mic size={44} className={`mx-auto ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} />
            <h3 className="text-lg font-black">لا توجد حلقات مطابقة حالياً</h3>
            <p className="text-xs text-slate-400 font-bold leading-6">
              ترقبوا قريباً حلقات جديدة ومتميزة من إذاعة وبودكاست مدارس العقيق!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {podcasts.map((p, idx) => (
              <PodcastCard
                key={p.id}
                podcast={p}
                index={idx}
                isPlayingThis={activePodcast?.id === p.id && isPlaying}
                onPlayOrOpen={() => handlePlayOrOpen(p)}
                onShare={handleShare}
                onLike={handleLike}
                dark={dark}
              />
            ))}
          </div>
        )}
      </section>

      {/* Video Podcast Modal Player */}
      {watchingVideoPodcast && (
        <Dialog open={Boolean(watchingVideoPodcast)} onOpenChange={() => setWatchingVideoPodcast(null)}>
          <DialogContent
            className={`max-w-4xl rounded-[2.5rem] border p-6 text-right shadow-2xl ${
              dark ? "border-[#f8ca14]/40 bg-[#0a0a0a] text-white" : "border-[#08467d]/30 bg-white text-slate-900"
            }`}
            dir="rtl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-[#f8ca14] px-3 py-1 text-xs font-black text-black">
                    {watchingVideoPodcast.category}
                  </span>
                  <h3 className="text-base font-black text-white">{watchingVideoPodcast.title}</h3>
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

