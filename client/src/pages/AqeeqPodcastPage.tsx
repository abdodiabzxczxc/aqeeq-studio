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
  Share2,
  Clock,
  Mic,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const PODCAST_CATEGORIES = [
  { id: "all", label: "جميع الحلقات", icon: "✨" },
  { id: "إذاعة الصباح", label: "إذاعة الصباح المدرسية", icon: "🎙️" },
  { id: "بودكاست قيادات", label: "بودكاست القيادات", icon: "👑" },
  { id: "تغطيات صوتية", label: "تغطيات مرئية وصوتية", icon: "📹" },
  { id: "حوارات الطلاب", label: "حوارات وإبداعات الطلاب", icon: "🎤" },
  { id: "نشرات إخبارية", label: "نشرات إخبارية وتقارير", icon: "📢" },
];

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

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | "audio" | "video">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [watchingVideoPodcast, setWatchingVideoPodcast] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { activePodcast, isPlaying, playPodcast, pausePodcast } = usePodcastPlayer();

  const { data: podcasts = [], isLoading, refetch } = trpc.podcasts.list.useQuery({
    category: selectedCategory,
    mediaType: selectedType === "all" ? undefined : selectedType,
    search: searchQuery,
  });

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

  const featuredPodcast = useMemo(() => {
    return podcasts[0] || null;
  }, [podcasts]);

  return (
    <div
      dir="rtl"
      className={`min-h-screen font-[Tajawal,sans-serif] transition-colors duration-300 ${
        dark ? "bg-[#080808] text-white" : "bg-[#f5f7fa] text-slate-900"
      }`}
    >
      <AlaqeeqStudioSiteHeader title="إذاعة وبودكاست العقيق" active="studio" />

      <section className="relative overflow-hidden border-b border-white/[0.08] pt-12 pb-16 px-4 md:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,202,20,0.14),_transparent_65%)]" />
        <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#08467d]/25 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="flex justify-center">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black backdrop-blur-md shadow-lg ${
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] shadow-[#f8ca14]/5"
                  : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              }`}
            >
              <Mic size={14} className={`animate-pulse ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} />
              <span>أثير العقيق الرقمي · إذاعة وبودكاست مدارس العقيق 🎙️</span>
            </div>
          </div>

          <div className="mt-5 text-center space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              صوت الإبداع ونبض الفعاليات في{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f8ca14] via-[#ffd700] to-[#d4af37]">
                مدارس العقيق
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-xs sm:text-sm font-bold text-slate-400 leading-7">
              استمع وشاهد حلقات الإذاعة الصباحية، واللقاءات الحوارية التربوية، والتغطيات الصوتية والمرئية لحفلات التخرج والبطولات المدرسية.
            </p>
          </div>

          {featuredPodcast && !searchQuery && selectedCategory === "all" && (
            <div className="mt-10">
              <div
                onClick={() => handlePlayOrOpen(featuredPodcast)}
                className={`group relative overflow-hidden rounded-[2.5rem] border p-6 sm:p-8 cursor-pointer transition duration-300 hover:-translate-y-1.5 shadow-2xl ${
                  dark
                    ? "border-[#f8ca14]/40 bg-gradient-to-br from-[#141414] via-[#0d0d0d] to-[#080808] shadow-[0_30px_70px_rgba(0,0,0,0.6)] hover:border-[#f8ca14]/70"
                    : "border-[#08467d]/25 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-[#08467d]/60"
                }`}
              >
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="relative w-full lg:w-5/12 min-h-[260px] sm:min-h-[300px] flex items-center justify-center">
                    <div
                      className={`absolute w-10/12 h-5/6 rounded-[2rem] border opacity-40 shadow-lg ${
                        dark ? "border-white/15 bg-[#1c1c1c]" : "border-black/10 bg-slate-200"
                      }`}
                      style={{ transform: "rotate(-6deg) scale(0.95)" }}
                    />
                    <div
                      className={`relative w-11/12 h-full min-h-[240px] sm:min-h-[280px] rounded-[2rem] border overflow-hidden p-2 shadow-2xl transition duration-300 group-hover:scale-105 ${
                        dark ? "border-[#f8ca14]/60 bg-[#161616]" : "border-[#08467d]/40 bg-white"
                      }`}
                      style={{ transform: "rotate(2deg)" }}
                    >
                      {featuredPodcast.coverUrl ? (
                        <div className="relative h-full w-full rounded-[1.5rem] overflow-hidden">
                          <img
                            src={directDriveImage(featuredPodcast.coverUrl) || featuredPodcast.coverUrl}
                            alt={featuredPodcast.title}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
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
                          className={`h-full w-full rounded-[1.5rem] p-6 flex flex-col justify-between ${
                            dark
                              ? "bg-gradient-to-br from-[#1a1500] via-[#0e0e0e] to-black text-[#f8ca14]"
                              : "bg-gradient-to-br from-[#08467d]/10 to-white text-[#08467d]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Mic size={36} />
                            {activePodcast?.id === featuredPodcast.id && isPlaying && (
                              <div className="flex items-end gap-1 h-6">
                                <span className="w-1 bg-[#f8ca14] animate-[bounce_0.6s_infinite] h-6 rounded-full" />
                                <span className="w-1 bg-[#f8ca14] animate-[bounce_0.8s_infinite] h-4 rounded-full" />
                                <span className="w-1 bg-[#f8ca14] animate-[bounce_0.5s_infinite] h-5 rounded-full" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-black tracking-widest uppercase">حلقة الأسبوع المميزة</span>
                            <h3 className="text-lg font-black mt-1 line-clamp-2">{featuredPodcast.title}</h3>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full lg:w-7/12 space-y-4 text-right">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-xl bg-[#f8ca14] px-3 py-1 text-xs font-black text-black">
                        <Sparkles size={12} />
                        <span>حلقة مميزة</span>
                      </span>
                      <span
                        className={`rounded-xl border px-3 py-1 text-xs font-black ${
                          dark ? "border-white/10 bg-white/5 text-slate-300" : "border-black/10 bg-slate-100 text-slate-700"
                        }`}
                      >
                        {featuredPodcast.category}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono text-slate-400">
                        <Clock size={11} />
                        <span>{featuredPodcast.duration || "15:00"}</span>
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-black leading-snug group-hover:text-[#f8ca14] transition">
                      {featuredPodcast.title}
                    </h2>

                    <p className="text-xs sm:text-sm font-bold text-slate-400 line-clamp-3 leading-7">
                      {featuredPodcast.description}
                    </p>

                    <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-[#08467d] text-black font-black text-sm">
                          <Mic size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black">{featuredPodcast.hostName || "فريق الإذاعة المدرسية"}</p>
                          <span className="text-xs font-bold text-[#f8ca14]">تقديم وحوار</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => handleShare(featuredPodcast, e)}
                          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-emerald-600 hover:text-white transition"
                          title="مشاركة عبر واتساب"
                        >
                          <Share2 size={16} />
                        </button>
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-[#f8ca14] px-6 py-3 text-xs font-black text-black transition hover:bg-yellow-400 shadow-lg shadow-[#f8ca14]/20">
                          {activePodcast?.id === featuredPodcast.id && isPlaying ? (
                            <>
                              <Pause size={16} />
                              <span>إيقاف مؤقت</span>
                            </>
                          ) : (
                            <>
                              <Play size={16} className="mr-0.5" />
                              <span>{featuredPodcast.mediaType === "video" ? "مشاهدة الفيديو" : "استمع للحلقة الآن 🎧"}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <Search size={17} className="absolute top-3.5 right-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في عناوين وحلقات البودكاست والضيوف..."
                  className={`w-full rounded-2xl border pr-11 pl-10 py-3 text-xs sm:text-sm font-bold placeholder-slate-500 outline-none transition shadow-inner ${
                    dark
                      ? "border-white/15 bg-black/60 text-white focus:border-[#f8ca14]"
                      : "border-black/15 bg-white text-black focus:border-[#08467d]"
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute top-3.5 left-4 text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div
                className={`flex items-center gap-1 rounded-2xl border p-1 shrink-0 ${
                  dark ? "border-white/15 bg-black/60" : "border-black/15 bg-white shadow-sm"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedType("all")}
                  className={`rounded-xl px-4 py-2 text-xs font-black transition ${
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
                  className={`rounded-xl px-4 py-2 text-xs font-black transition flex items-center gap-1.5 ${
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
                  className={`rounded-xl px-4 py-2 text-xs font-black transition flex items-center gap-1.5 ${
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

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {PODCAST_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition border ${
                      active
                        ? dark
                          ? "border-[#f8ca14] bg-[#f8ca14] text-black shadow-md shadow-[#f8ca14]/20"
                          : "border-[#08467d] bg-[#08467d] text-white shadow-md shadow-[#08467d]/20"
                        : dark
                        ? "border-white/10 bg-white/5 text-slate-300 hover:border-[#f8ca14]/50 hover:text-white"
                        : "border-black/10 bg-white text-slate-700 hover:border-[#08467d]/50 hover:text-black"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 md:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-80 rounded-[2rem] border animate-pulse ${
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
            <h3 className="text-lg font-black">لا توجد حلقات بودكاست في هذا التصنيف حالياً</h3>
            <p className="text-xs text-slate-400 font-bold leading-6">
              ترقبوا قريباً حلقات جديدة ومتميزة من إذاعة وبودكاست مدارس العقيق!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map((p) => {
              const isThisPlaying = activePodcast?.id === p.id && isPlaying;
              return (
                <article
                  key={p.id}
                  onClick={() => handlePlayOrOpen(p)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border p-6 transition duration-300 hover:-translate-y-1.5 cursor-pointer ${
                    isThisPlaying
                      ? dark
                        ? "border-[#f8ca14] bg-[#121212] ring-2 ring-[#f8ca14]/30 shadow-[0_20px_50px_rgba(248,202,20,0.15)]"
                        : "border-[#08467d] bg-[#f0f7ff] ring-2 ring-[#08467d]/30"
                      : dark
                      ? "border-[#f8ca14]/30 bg-[#0c0c0c] text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-[#f8ca14]/60 hover:shadow-[#f8ca14]/5"
                      : "border-[#08467d]/20 bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-[#08467d]/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <span
                        className={`rounded-xl border px-3 py-1 text-[11px] font-black ${
                          dark
                            ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                            : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
                        }`}
                      >
                        {p.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock size={11} />
                        {p.duration || "10:00"}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black line-clamp-2 leading-snug group-hover:text-[#f8ca14] transition">
                      {p.title}
                    </h3>

                    <p className="mt-2.5 text-xs text-slate-400 line-clamp-3 leading-6 font-bold">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black transition shadow-lg ${
                          isThisPlaying
                            ? "bg-[#f8ca14] text-black shadow-[#f8ca14]/30"
                            : "bg-[#f8ca14] hover:bg-yellow-400 text-black shadow-[#f8ca14]/15"
                        }`}
                      >
                        {isThisPlaying ? <Pause size={14} /> : <Play size={14} className="mr-0.5" />}
                        <span>
                          {isThisPlaying
                            ? "إيقاف مؤقت"
                            : p.mediaType === "video"
                            ? "مشاهدة الفيديو"
                            : "تشغيل الحلقة 🎧"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          likeMutation.mutate({ id: p.id });
                        }}
                        className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                        title="إعجاب"
                      >
                        <Heart size={14} className="fill-rose-500/20" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleShare(p, e)}
                        className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition"
                        title="مشاركة"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

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
    </div>
  );
}
