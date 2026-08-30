import { useState, useMemo } from "react";
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
  Sparkles,
  BookOpen,
  ArrowUpLeft,
  X,
  Check,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { id: "all", label: "جميع المقالات", icon: "✨" },
  { id: "إبداعات الطلاب", label: "إبداعات الطلاب", icon: "🌟" },
  { id: "تربوي", label: "مقالات تربوية", icon: "📚" },
  { id: "إرشاد أسري", label: "إرشاد وتوجيه أسري", icon: "👨‍👩‍👧‍👦" },
  { id: "أنشطة وفعاليات", label: "أنشطة وفعاليات", icon: "🏆" },
  { id: "تجارب ملهمة", label: "تجارب ملهمة وقصص نجاح", icon: "💡" },
];

function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const id =
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/)?.[1];
  return id ? `/api/drive-proxy/${id}` : url;
}

export default function AqeeqArticlesPage() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [readingArticle, setReadingArticle] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

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

  const handleShare = (art: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = window.location.origin + `/articles#${art.slug}`;
    const text = `مقال رائع بمدارس العقيق: «${art.title}» بقلم: ${art.authorName}\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopyLink = (art: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = window.location.origin + `/articles#${art.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(art.id);
    toast.success("تم نسخ رابط المقال بنجاح!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const featuredArticle = useMemo(() => {
    return articles[0] || null;
  }, [articles]);

  return (
    <div
      dir="rtl"
      className={`min-h-screen font-[Tajawal,sans-serif] transition-colors duration-300 ${
        dark ? "bg-[#080808] text-white" : "bg-[#f5f7fa] text-slate-900"
      }`}
    >
      {/* Site Header */}
      <AlaqeeqStudioSiteHeader title="مقالات وأقلام العقيق" active="studio" />

      {/* Royal Studio Hero Header */}
      <section className="relative overflow-hidden border-b border-white/[0.08] pt-12 pb-16 px-4 md:px-8">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,202,20,0.12),_transparent_65%)]" />
        <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-[#08467d]/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          {/* Top Pill Badge */}
          <div className="flex justify-center">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black backdrop-blur-md shadow-lg ${
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] shadow-[#f8ca14]/5"
                  : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              }`}
            >
              <Sparkles size={14} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
              <span>البوابة الثقافية والأدبية · مقالات وأقلام العقيق ✍️</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mt-5 text-center space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              واحة الفكر والإبداع لأسرة{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f8ca14] via-[#ffd700] to-[#d4af37]">
                مدارس العقيق
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-xs sm:text-sm font-bold text-slate-400 leading-7">
              مساحة أدبية وتربوية تفاعلية نبرز فيها كتابات الطلاب الموهوبين، ورؤى المعلمين والقيادات، وتجارب أولياء الأمور الملهمة.
            </p>
          </div>

          {/* Featured Article 3D Showcase (if available) */}
          {featuredArticle && !searchQuery && selectedCategory === "all" && (
            <div className="mt-10">
              <div
                onClick={() => setReadingArticle(featuredArticle)}
                className={`group relative overflow-hidden rounded-[2.5rem] border p-6 sm:p-8 cursor-pointer transition duration-300 hover:-translate-y-1.5 shadow-2xl ${
                  dark
                    ? "border-[#f8ca14]/40 bg-gradient-to-br from-[#121212] via-[#0b0b0b] to-[#080808] shadow-[0_30px_70px_rgba(0,0,0,0.6)] hover:border-[#f8ca14]/70"
                    : "border-[#08467d]/25 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-[#08467d]/60"
                }`}
              >
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Visual 3D Cover Preview */}
                  <div className="relative w-full lg:w-5/12 min-h-[260px] sm:min-h-[300px] flex items-center justify-center">
                    {/* Background angled card */}
                    <div
                      className={`absolute w-10/12 h-5/6 rounded-[2rem] border opacity-40 shadow-lg ${
                        dark ? "border-white/15 bg-[#1a1a1a]" : "border-black/10 bg-slate-200"
                      }`}
                      style={{ transform: "rotate(-6deg) scale(0.95)" }}
                    />
                    {/* Foreground Card */}
                    <div
                      className={`relative w-11/12 h-full min-h-[240px] sm:min-h-[280px] rounded-[2rem] border overflow-hidden p-2 shadow-2xl transition duration-300 group-hover:scale-105 ${
                        dark ? "border-[#f8ca14]/60 bg-[#161616]" : "border-[#08467d]/40 bg-white"
                      }`}
                      style={{ transform: "rotate(2deg)" }}
                    >
                      {featuredArticle.coverUrl ? (
                        <img
                          src={directDriveImage(featuredArticle.coverUrl) || featuredArticle.coverUrl}
                          alt={featuredArticle.title}
                          className="h-full w-full rounded-[1.5rem] object-cover"
                        />
                      ) : (
                        <div
                          className={`h-full w-full rounded-[1.5rem] p-6 flex flex-col justify-between ${
                            dark
                              ? "bg-gradient-to-br from-[#1a1500] via-[#0e0e0e] to-black text-[#f8ca14]"
                              : "bg-gradient-to-br from-[#08467d]/10 to-white text-[#08467d]"
                          }`}
                        >
                          <BookOpen size={36} />
                          <div>
                            <span className="text-xs font-black tracking-widest uppercase">مقال مميز للأسبوع</span>
                            <h3 className="text-lg font-black mt-1 line-clamp-2">{featuredArticle.title}</h3>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="w-full lg:w-7/12 space-y-4 text-right">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-xl bg-[#f8ca14] px-3 py-1 text-xs font-black text-black">
                        <Sparkles size={12} />
                        <span>مقال الأسبوع المميز</span>
                      </span>
                      <span
                        className={`rounded-xl border px-3 py-1 text-xs font-black ${
                          dark ? "border-white/10 bg-white/5 text-slate-300" : "border-black/10 bg-slate-100 text-slate-700"
                        }`}
                      >
                        {featuredArticle.category}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-black leading-snug group-hover:text-[#f8ca14] transition">
                      {featuredArticle.title}
                    </h2>

                    <p className="text-xs sm:text-sm font-bold text-slate-400 line-clamp-3 leading-7">
                      {featuredArticle.excerpt}
                    </p>

                    {/* Author & Footer Actions */}
                    <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-[#08467d] text-black font-black text-sm">
                          {featuredArticle.authorAvatar ? (
                            <img src={featuredArticle.authorAvatar} alt="" className="h-full w-full rounded-2xl object-cover" />
                          ) : (
                            featuredArticle.authorName.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black">{featuredArticle.authorName}</p>
                          <span className="text-xs font-bold text-[#f8ca14]">{featuredArticle.authorRole}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => handleShare(featuredArticle, e)}
                          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-emerald-600 hover:text-white transition"
                          title="مشاركة عبر واتساب"
                        >
                          <Share2 size={16} />
                        </button>
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-[#f8ca14] px-5 py-2.5 text-xs font-black text-black transition hover:bg-yellow-400 shadow-lg shadow-[#f8ca14]/20">
                          <span>قراءة المقال كامل</span>
                          <ArrowUpLeft size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search, Filter & Action Bar */}
          <div className="mt-10 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-full">
                <Search size={17} className="absolute top-3.5 right-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في عناوين المقالات، المحتوى، وأسماء الكتاب..."
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

              {/* Submit Article Action */}
              <button
                type="button"
                onClick={() => setIsSubmitOpen(true)}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f8ca14] px-6 py-3 text-xs sm:text-sm font-black text-black hover:bg-yellow-400 shadow-lg shadow-[#f8ca14]/20 transition"
              >
                <PenTool size={16} />
                <span>شاركنا بمقالك ✍️</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {CATEGORIES.map((cat) => {
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

      {/* Main Content Grid */}
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
        ) : articles.length === 0 ? (
          <div
            className={`rounded-[2.5rem] border border-dashed p-12 text-center max-w-md mx-auto space-y-4 ${
              dark ? "border-white/15 bg-black/20" : "border-black/15 bg-white"
            }`}
          >
            <BookOpen size={44} className={`mx-auto ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} />
            <h3 className="text-lg font-black">لا توجد مقالات في هذا التصنيف حالياً</h3>
            <p className="text-xs text-slate-400 font-bold leading-6">
              كن أول من ينشر مقالاً ويشارك أفكاره وإبداعاته مع مجتمع مدارس العقيق!
            </p>
            <button
              type="button"
              onClick={() => setIsSubmitOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#f8ca14] px-5 py-2.5 text-xs font-black text-black hover:bg-yellow-400 transition shadow-lg"
            >
              <PenTool size={14} />
              <span>كتابة مقال جديد ✍️</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <article
                key={art.id}
                onClick={() => setReadingArticle(art)}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border p-6 transition duration-300 hover:-translate-y-1.5 cursor-pointer ${
                  dark
                    ? "border-[#f8ca14]/30 bg-[#0c0c0c] text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-[#f8ca14]/60 hover:shadow-[#f8ca14]/5"
                    : "border-[#08467d]/20 bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-[#08467d]/50"
                }`}
              >
                <div>
                  {/* Category & Date */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span
                      className={`rounded-xl border px-3 py-1 text-[11px] font-black ${
                        dark
                          ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                          : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
                      }`}
                    >
                      {art.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(art.publishedAt || art.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-black line-clamp-2 leading-snug group-hover:text-[#f8ca14] transition">
                    {art.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="mt-2.5 text-xs text-slate-400 line-clamp-3 leading-6 font-bold">
                    {art.excerpt}
                  </p>
                </div>

                {/* Author Info & Interaction Stats */}
                <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-[#f8ca14] to-[#08467d] text-black font-black text-xs">
                      {art.authorAvatar ? (
                        <img src={art.authorAvatar} alt="" className="h-full w-full rounded-xl object-cover" />
                      ) : (
                        art.authorName.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black">{art.authorName}</p>
                      <span className="truncate text-[10px] text-[#f8ca14] font-bold block">{art.authorRole}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-400 text-xs font-bold">
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

      {/* Royal Article Reading Lightbox Modal */}
      {readingArticle && (
        <Dialog open={Boolean(readingArticle)} onOpenChange={() => setReadingArticle(null)}>
          <DialogContent
            className={`max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border p-6 sm:p-10 text-right shadow-2xl ${
              dark
                ? "border-[#f8ca14]/40 bg-[#0a0a0a] text-white"
                : "border-[#08467d]/30 bg-white text-slate-900"
            }`}
            dir="rtl"
          >
            <div className="space-y-6">
              {/* Header Badge & Category */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <span className="rounded-xl border border-[#f8ca14]/40 bg-[#f8ca14]/10 px-3 py-1 text-xs font-black text-[#f8ca14]">
                  {readingArticle.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  تاريخ النشر: {new Date(readingArticle.publishedAt || readingArticle.createdAt).toLocaleDateString("ar-SA")}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-black leading-snug">
                {readingArticle.title}
              </h1>

              {/* Author Bio Card */}
              <div
                className={`flex items-center justify-between rounded-2xl border p-4 ${
                  dark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-[#08467d] text-black font-black text-base">
                    {readingArticle.authorAvatar ? (
                      <img src={readingArticle.authorAvatar} alt="" className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                      readingArticle.authorName.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black">{readingArticle.authorName}</h4>
                    <p className="text-xs font-bold text-[#f8ca14]">{readingArticle.authorRole}</p>
                  </div>
                </div>

                {/* Quick Share Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(readingArticle, e)}
                    className={`grid h-9 w-9 place-items-center rounded-xl border transition ${
                      copiedId === readingArticle.id
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-white/10 bg-white/5 hover:bg-white/10 text-slate-300"
                    }`}
                    title="نسخ الرابط"
                  >
                    {copiedId === readingArticle.id ? <Check size={14} /> : <Bookmark size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleShare(readingArticle, e)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-3.5 transition"
                  >
                    <Share2 size={13} />
                    <span>مشاركة واتساب</span>
                  </button>
                </div>
              </div>

              {/* Optional Cover Image */}
              {readingArticle.coverUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <img
                    src={directDriveImage(readingArticle.coverUrl) || readingArticle.coverUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Content Body with Amiri Elegant Font */}
              <div className="prose prose-invert max-w-none font-[Amiri,serif] text-lg sm:text-xl leading-9 font-normal whitespace-pre-wrap">
                {readingArticle.content}
              </div>

              {/* Reader Interaction Footer */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => likeMutation.mutate({ id: readingArticle.id })}
                    disabled={likeMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 font-black text-xs h-10 px-4 transition"
                  >
                    <Heart size={16} className="fill-rose-500" />
                    <span>أعجبني ({readingArticle.likesCount})</span>
                  </button>

                  <span className="text-xs text-slate-400 font-bold">
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
