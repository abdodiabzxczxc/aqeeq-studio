import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { AqeeqArticleSubmitModal } from "@/components/AqeeqArticleSubmitModal";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import {
  PenTool,
  Search,
  Heart,
  Eye,
  Share2,
  Calendar,
  User,
  Sparkles,
  BookOpen,
  ArrowUpLeft,
  X,
  MessageSquarePlus,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { id: "all", label: "جميع المقالات" },
  { id: "إبداعات الطلاب", label: "🌟 إبداعات الطلاب" },
  { id: "تربوي", label: "📚 مقالات تربوية" },
  { id: "إرشاد أسري", label: "👨‍👩‍👧‍👦 إرشاد أسري" },
  { id: "أنشطة وفعاليات", label: "🏆 أنشطة وفعاليات" },
  { id: "تجارب ملهمة", label: "💡 تجارب ملهمة" },
];

export default function AqeeqArticlesPage() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [readingArticle, setReadingArticle] = useState<any>(null);

  const { data: articles = [], isLoading, refetch } = trpc.articles.listPublished.useQuery({
    category: selectedCategory,
    search: searchQuery,
  });

  const likeMutation = trpc.articles.like.useMutation({
    onSuccess: (newLikes) => {
      if (readingArticle) {
        setReadingArticle((prev: any) => (prev ? { ...prev, likesCount: newLikes } : prev));
      }
      void refetch();
      toast.success("شكراً لإعجابك بالمقال ❤️");
    },
  });

  const handleShare = (art: any) => {
    const url = window.location.origin + `/articles#${art.slug}`;
    const text = `مقال رائع بمدارس العقيق: «${art.title}» بقلم: ${art.authorName}\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className={`min-h-screen ${dark ? "bg-[#07090e] text-slate-100" : "bg-slate-50 text-slate-900"}`} dir="rtl">
      {/* Site Header */}
      <AlaqeeqStudioSiteHeader title="مقالات وأقلام العقيق" active="studio" />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-amber-400/20 bg-gradient-to-b from-[#111624] via-[#090c14] to-[#07090e] pt-12 pb-16 px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-5xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-black text-amber-300 backdrop-blur-md shadow-lg shadow-amber-400/10">
            <Sparkles size={14} className="text-amber-400" />
            <span>منصة مقالات وأقلام مدارس العقيق ✍️</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            واحة الفكر والإبداع لأسرة <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">مدارس العقيق</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm font-bold text-slate-400 leading-6">
            مساحة أدبية وتربوية تفاعلية نبرز فيها كتابات الطلاب الموهوبين، ورؤى المعلمين والقيادات، وتجارب أولياء الأمور الملهمة.
          </p>

          {/* Action Bar: Search & Submit Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto">
            <div className="relative w-full">
              <Search size={16} className="absolute top-3.5 right-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في عناوين ومحتوى المقالات وأسماء الكتاب..."
                className="w-full rounded-2xl border border-white/15 bg-black/60 pr-11 pl-4 py-3 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-amber-400 transition shadow-inner"
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

            <Button
              type="button"
              onClick={() => setIsSubmitOpen(true)}
              className="w-full sm:w-auto shrink-0 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs h-11 px-6 rounded-2xl shadow-xl shadow-amber-400/20 flex items-center gap-2"
            >
              <PenTool size={15} />
              <span>شاركنا بمقالك ✍️</span>
            </Button>
          </div>

          {/* Categories Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => (
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

      {/* Main Articles Grid */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-white/5 border border-white/10" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-12 text-center max-w-md mx-auto space-y-3">
            <BookOpen size={36} className="mx-auto text-amber-400/60" />
            <h3 className="text-base font-black text-slate-200">لا توجد مقالات في هذا التصنيف حالياً</h3>
            <p className="text-xs text-slate-400">كن أول من ينشر مقالاً ويشارك أفكاره مع مجتمع مدارس العقيق!</p>
            <Button
              type="button"
              onClick={() => setIsSubmitOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs h-9 px-4 rounded-xl mt-2"
            >
              كتابة مقال جديد ✍️
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <article
                key={art.id}
                onClick={() => setReadingArticle(art)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#0f1422] p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-400/10 cursor-pointer"
              >
                {/* Category & Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-black text-amber-300">
                      {art.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(art.publishedAt || art.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition line-clamp-2 leading-snug">
                    {art.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="mt-2.5 text-xs text-slate-400 line-clamp-3 leading-6 font-bold">
                    {art.excerpt}
                  </p>
                </div>

                {/* Footer Author & Stats */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-400/20 text-amber-300 font-black text-xs ring-1 ring-amber-400/30">
                      {art.authorAvatar ? (
                        <img src={art.authorAvatar} alt="" className="h-full w-full rounded-xl object-cover" />
                      ) : (
                        art.authorName.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-slate-200">{art.authorName}</p>
                      <p className="truncate text-[10px] text-amber-300/80 font-bold">{art.authorRole}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 text-xs font-bold">
                    <span className="flex items-center gap-1">
                      <Eye size={13} />
                      <span>{art.viewCount}</span>
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <Heart size={13} className="fill-rose-500/20" />
                      <span>{art.likesCount}</span>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Full Article Reading Lightbox Modal */}
      {readingArticle && (
        <Dialog open={Boolean(readingArticle)} onOpenChange={() => setReadingArticle(null)}>
          <DialogContent
            className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-amber-400/30 bg-[#090d16] p-6 sm:p-10 text-right text-white shadow-2xl"
            dir="rtl"
          >
            <div className="space-y-6">
              {/* Header Badge & Category */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <span className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-300">
                  {readingArticle.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  تاريخ النشر: {new Date(readingArticle.publishedAt || readingArticle.createdAt).toLocaleDateString("ar-SA")}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                {readingArticle.title}
              </h1>

              {/* Author Bio Card */}
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-400/20 text-amber-300 font-black text-base ring-1 ring-amber-400/30">
                    {readingArticle.authorAvatar ? (
                      <img src={readingArticle.authorAvatar} alt="" className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                      readingArticle.authorName.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-100">{readingArticle.authorName}</h4>
                    <p className="text-xs font-bold text-amber-300">{readingArticle.authorRole}</p>
                  </div>
                </div>

                {/* Quick Share */}
                <Button
                  type="button"
                  onClick={() => handleShare(readingArticle)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-3.5 rounded-xl flex items-center gap-1.5"
                >
                  <Share2 size={13} />
                  <span>مشاركة واتساب</span>
                </Button>
              </div>

              {/* Optional Cover Image */}
              {readingArticle.coverUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <img src={readingArticle.coverUrl} alt="" className="h-full w-full object-cover" />
                </div>
              )}

              {/* Content Body */}
              <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-8 font-bold whitespace-pre-wrap">
                {readingArticle.content}
              </div>

              {/* Reader Interaction Footer */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => likeMutation.mutate({ id: readingArticle.id })}
                    disabled={likeMutation.isPending}
                    className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 font-black text-xs h-10 px-4 rounded-xl flex items-center gap-2"
                  >
                    <Heart size={16} className="fill-rose-500" />
                    <span>أعجبني ({readingArticle.likesCount})</span>
                  </Button>

                  <span className="text-xs text-slate-400 font-bold mr-2">
                    👁️ {readingArticle.viewCount} قراءة
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setReadingArticle(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  إغلاق القراءة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Guest Submit Modal */}
      <AqeeqArticleSubmitModal open={isSubmitOpen} onOpenChange={setIsSubmitOpen} />
    </div>
  );
}
