import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { usePodcastPlayer } from "@/components/AqeeqFloatingPodcastPlayer";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import {
  Radio,
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
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const PODCAST_CATEGORIES = [
  { id: "all", label: "جميع الحلقات" },
  { id: "إذاعة الصباح", label: "🎙️ إذاعة الصباح" },
  { id: "بودكاست قيادات", label: "👑 بودكاست قيادات" },
  { id: "تغطيات صوتية", label: "📹 تغطيات مرئية وصوتية" },
  { id: "حوارات الطلاب", label: "🎤 حوارات الطلاب" },
  { id: "نشرات إخبارية", label: "📢 نشرات إخبارية" },
];

export default function AqeeqPodcastPage() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | "audio" | "video">("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleShare = (p: any) => {
    const url = window.location.origin + `/podcast#${p.slug}`;
    const text = `استمع إلى حلقة: «${p.title}» عبر إذاعة وبودكاست مدارس العقيق 🎙️\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className={`min-h-screen ${dark ? "bg-[#07090e] text-slate-100" : "bg-slate-50 text-slate-900"}`} dir="rtl">
      {/* Site Header */}
      <AlaqeeqStudioSiteHeader title="إذاعة وبودكاست العقيق" active="studio" />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-amber-400/20 bg-gradient-to-b from-[#141026] via-[#0b0914] to-[#07090e] pt-12 pb-16 px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/15 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-5xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-black text-amber-300 backdrop-blur-md shadow-lg shadow-amber-400/10">
            <Mic size={14} className="text-amber-400 animate-pulse" />
            <span>إذاعة وبودكاست مدارس العقيق الرقمي 🎙️</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            صوت الإبداع ونبض الفعاليات في <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">مدارس العقيق</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm font-bold text-slate-400 leading-6">
            استمع وشاهد حلقات الإذاعة الصباحية، واللقاءات الحوارية التربوية، والتغطيات الصوتية والمرئية لحفلات التخرج والبطولات المدرسية.
          </p>

          {/* Search & Filter Controls */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto">
            <div className="relative w-full">
              <Search size={16} className="absolute top-3.5 right-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في عناوين وحلقات البودكاست والضيوف..."
                className="w-full rounded-2xl border border-white/15 bg-black/60 pr-11 pl-4 py-3 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-amber-400 transition shadow-inner"
              />
            </div>

            {/* Audio / Video Switcher */}
            <div className="flex items-center gap-1 rounded-2xl border border-white/15 bg-black/60 p-1 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedType("all")}
                className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                  selectedType === "all" ? "bg-amber-400 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setSelectedType("audio")}
                className={`rounded-xl px-3 py-1.5 text-xs font-black transition flex items-center gap-1 ${
                  selectedType === "audio" ? "bg-amber-400 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                <Headphones size={13} />
                <span>صوت</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedType("video")}
                className={`rounded-xl px-3 py-1.5 text-xs font-black transition flex items-center gap-1 ${
                  selectedType === "video" ? "bg-amber-400 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                <Video size={13} />
                <span>فيديو</span>
              </button>
            </div>
          </div>

          {/* Categories Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {PODCAST_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition border ${
                  selectedCategory === cat.id
                    ? "border-amber-400 bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                    : "border-white/10 bg-black/40 text-slate-300 hover:border-amber-400/50 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Podcasts Grid */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-3xl bg-white/5 border border-white/10" />
            ))}
          </div>
        ) : podcasts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-12 text-center max-w-md mx-auto space-y-3">
            <Radio size={36} className="mx-auto text-amber-400/60" />
            <h3 className="text-base font-black text-slate-200">لا توجد حلقات في هذا القسم حالياً</h3>
            <p className="text-xs text-slate-400">سيتم إضافة تسجيلات وبودكاستات جديدة قريباً!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map((p) => {
              const isThisPlaying = isPlaying && activePodcast?.id === p.id;
              return (
                <article
                  key={p.id}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-300 ${
                    isThisPlaying
                      ? "border-amber-400 bg-[#121422] shadow-xl shadow-amber-400/10 ring-1 ring-amber-400/40"
                      : "border-white/10 bg-[#0f121e] hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-xl"
                  } p-6`}
                >
                  {/* Top Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-black text-amber-300">
                        {p.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock size={11} />
                        {p.duration || "10:00"}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition line-clamp-2 leading-snug">
                      {p.title}
                    </h2>

                    {/* Description */}
                    <p className="mt-2.5 text-xs text-slate-400 line-clamp-3 leading-6 font-bold">
                      {p.description}
                    </p>
                  </div>

                  {/* Play & Action Controls */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isThisPlaying) {
                            pausePodcast();
                          } else {
                            playPodcast(p);
                          }
                        }}
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black transition shadow-lg ${
                          isThisPlaying
                            ? "bg-amber-300 text-slate-950 shadow-amber-300/30"
                            : "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20"
                        }`}
                      >
                        {isThisPlaying ? <Pause size={14} /> : <Play size={14} className="mr-0.5" />}
                        <span>{isThisPlaying ? "إيقاف مؤقت" : p.mediaType === "video" ? "مشاهدة الفيديو" : "تشغيل الحلقة 🎧"}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => likeMutation.mutate({ id: p.id })}
                        className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                        title="إعجاب"
                      >
                        <Heart size={14} className="fill-rose-500/20" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShare(p)}
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
    </div>
  );
}
