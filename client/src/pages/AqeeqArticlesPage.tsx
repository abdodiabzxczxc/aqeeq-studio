import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useParams } from "wouter";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { AlaqeeqStudioSiteFooter } from "@/components/AlaqeeqStudioSiteFooter";
import { AqeeqArticleSubmitModal } from "@/components/AqeeqArticleSubmitModal";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { AqeeqPageHeroShowcase } from "@/components/AqeeqPageHeroShowcase";
import { AqeeqSectionHeader } from "@/components/AqeeqSectionHeader";
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
  Clock,
  User,
  Check,
  Bookmark,
  ChevronDown,
  Layers,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSiteTheme } from "@/lib/useSiteTheme";


const CATEGORIES = [
  { id: "all", label: "كافة المقالات" },
  { id: "مقالات علمية", label: "مقالات علمية 🔬" },
  { id: "اللغة العربية", label: "اللغة العربية 📖" },
  { id: "الجودة والاعتماد", label: "الجودة والاعتماد 🏆" },
  { id: "اللغة الإنجليزية", label: "اللغة الإنجليزية 🌍" },
  { id: "الذكاء الاصطناعي في التعليم", label: "الذكاء الاصطناعي 🤖" },
  { id: "تربوي", label: "مقالات تربوية 🎓" },
  { id: "إبداعات الطلاب", label: "إبداعات الطلاب ⭐" },
];


function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const id =
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/)?.[1];
  return id ? `/api/drive-proxy/${id}` : url;
}

function ArticleCard({
  article,
  index,
  onOpen,
  onShare,
  dark,
}: {
  article: any;
  index: number;
  onOpen: () => void;
  onShare: (art: any, e: React.MouseEvent) => void;
  dark: boolean;
}) {
  const { isNationalDay } = useSiteTheme();
  const cover = directDriveImage(article.coverUrl) || article.coverUrl;
  const readingTime = article.content
    ? Math.max(1, Math.ceil(article.content.trim().split(/\s+/).length / 200))
    : null;
  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border p-4 transition duration-300 hover:-translate-y-1 md:p-5 ${
        index === 0 ? "lg:col-span-2 " : ""
      }${
        isNationalDay
          ? dark ? "snd-bento-card-dark text-white" : "snd-bento-card-light text-slate-900"
          : dark
          ? "border-[#f8ca14]/30 bg-[#080808] text-white shadow-[0_24px_60px_rgba(0,0,0,0.5)] hover:border-[#f8ca14]/60"
          : "border-[#08467d]/20 bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-[#08467d]/50"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_45%,rgba(255,255,255,0.03)_46%,transparent_47%)]" />
      <div className="relative flex h-full flex-col gap-5 sm:flex-row">
        {/* Visual Cover Preview Container */}
        <button
          onClick={onOpen}
          className={`relative min-h-[160px] sm:min-h-[220px] w-full overflow-hidden rounded-[1.5rem] border text-right sm:w-[45%] ${
            isNationalDay
              ? dark ? "border-emerald-500/20 bg-[#001c10]" : "border-emerald-500/15 bg-emerald-50/50"
              : dark ? "border-white/[0.08] bg-[#0c0c0c]" : "border-black/[0.06] bg-[#f8f8f8]"
          }`}
          aria-label={`قراءة ${article.title}`}
        >
          {/* Background tilted page — hidden on mobile */}
          <div
            className={`absolute bottom-[9%] left-[8%] top-[9%] w-[50%] overflow-hidden rounded-[1rem] border opacity-50 hidden sm:block ${
              isNationalDay
                ? dark ? "border-emerald-500/20 bg-[#002617]" : "border-emerald-500/20 bg-emerald-100/60"
                : dark ? "border-white/[0.1] bg-[#141414]" : "border-black/[0.08] bg-[#ebebeb]"
            }`}
            style={{ transform: "rotate(-7deg)" }}
          >
            {cover ? (
              <VisualImage
                id={`articles-card-back-cover-${article.id}`}
                label="صورة خلفية بطاقة المقال"
                src={cover}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-amber-500/20 to-transparent p-3 text-[9px] font-bold text-slate-500">
                مقال العقيق
              </div>
            )}
          </div>

          {/* Front cover — full width on mobile, partial on sm+ */}
          <div
            className={`absolute inset-1 sm:bottom-[6%] sm:right-[10%] sm:top-[6%] sm:w-[62%] sm:inset-auto overflow-hidden rounded-[1rem] border p-0 sm:p-1.5 shadow-xl ${
              isNationalDay
                ? dark ? "border-[#f8ca14] bg-[#001f13] shadow-[0_12px_30px_rgba(0,90,54,0.5)]" : "border-emerald-600/50 bg-white"
                : dark ? "border-[#f8ca14]/60 bg-[#141414]" : "border-[#08467d]/40 bg-white"
            }`}
            style={{ transform: "rotate(0deg)" }}
          >

            {cover ? (
              <VisualImage
                id={`articles-card-cover-${article.id}`}
                label="غلاف بطاقة المقال"
                src={cover}
                alt={`غلاف ${article.title}`}
                className="h-full w-full rounded-[0.7rem] object-cover"
              />
            ) : (
              <div
                className={`flex h-full flex-col justify-between rounded-[0.7rem] p-3.5 text-right ${
                  dark ? "bg-gradient-to-br from-[#1a1400] to-black text-[#f8ca14]" : isNationalDay ? "bg-emerald-50 text-[#005A36]" : "bg-slate-100 text-[#08467d]"
                }`}
              >
                <BookOpen size={24} />
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider">{article.category}</span>
                  <p className="line-clamp-2 text-[11px] font-black leading-snug mt-1">{article.title}</p>
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
                isNationalDay
                  ? dark ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14]" : "border-emerald-600/30 bg-emerald-50 text-[#005A36]"
                  : dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              }`}
            >
              <PenTool size={16} />
            </div>
            <span
              className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black border ${
                isNationalDay
                  ? dark ? "border-[#5aba1c]/40 bg-[#5aba1c]/15 text-emerald-300" : "border-emerald-600/30 bg-emerald-50 text-[#005A36]"
                  : dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              }`}
            >
              {article.category}
            </span>
          </div>

          <VisualEditable
            id={`articles-card-title-${article.id}`}
            tag="text"
            label="عنوان المقال"
            defaultText={article.title}
            as="h3"
            onClick={onOpen}
            className={`mt-3 text-lg font-black line-clamp-2 cursor-pointer transition leading-snug ${
              isNationalDay
                ? dark ? "text-white group-hover:text-[#5aba1c]" : "text-[#003822] group-hover:text-[#005A36]"
                : dark ? "text-white group-hover:text-[#f8ca14]" : "text-black group-hover:text-[#08467d]"
            }`}
          />



          <VisualEditable
            id={`articles-card-excerpt-${article.id}`}
            tag="text"
            label="ملخص المقال"
            defaultText={article.excerpt}
            as="p"
            className={`mt-2 text-xs leading-6 line-clamp-2 font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}
          />

          {/* Author Badge */}
          <div className="mt-3 flex items-center gap-2">
            <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-tr from-[#f8ca14] to-[#08467d] text-black font-black text-[10px]">
              {article.authorAvatar ? (
                <img src={article.authorAvatar} alt="" className="h-full w-full rounded-lg object-cover" />
              ) : (
                article.authorName.charAt(0)
              )}
            </div>
            <span className="text-[11px] font-black truncate">{article.authorName}</span>
            <span className="text-[10px] text-slate-500 font-bold">· {article.authorRole}</span>
          </div>

          <div className={`mt-auto flex items-end justify-between gap-3 border-t pt-3.5 ${
            isNationalDay ? (dark ? "border-[#5aba1c]/20" : "border-emerald-500/15") : (dark ? "border-white/[0.08]" : "border-black/[0.08]")
          }`}>
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400">
              <span className="flex items-center gap-1">
                <Eye size={12} />
                <span>{article.viewCount || 0}</span>
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <Heart size={12} className="fill-rose-500/20" />
                <span>{article.likesCount || 0}</span>
              </span>
              {readingTime && (
                <span className={`flex items-center gap-1 ${dark ? "text-slate-500" : isNationalDay ? "text-emerald-800/70" : "text-slate-400"}`}>
                  <Clock size={12} />
                  <span>{readingTime} د قراءة</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => onShare(article, e)}
                className={`grid h-8 w-8 place-items-center rounded-xl border transition ${
                  dark ? "border-white/10 hover:bg-emerald-600 hover:text-white text-slate-400" : "border-black/10 hover:bg-emerald-600 hover:text-white text-slate-600"
                }`}
                title="مشاركة"
              >
                <Share2 size={13} />
              </button>
              <button
                onClick={onOpen}
                className={`inline-flex items-center gap-1.5 text-xs font-black transition ${
                  isNationalDay
                    ? dark ? "text-[#f8ca14] hover:text-[#5aba1c]" : "text-[#005A36] hover:text-[#003822]"
                    : dark ? "text-[#f8ca14] hover:opacity-80" : "text-[#08467d] hover:opacity-80"
                }`}
              >
                اقرأ المقال <ArrowUpLeft size={14} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </article>
  );
}

export default function AqeeqArticlesPage({ params }: { params?: { slug?: string } } = {}) {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const { isNationalDay } = useSiteTheme();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const routeParams = useParams<{ slug?: string }>();
  const activeSlug = params?.slug || routeParams?.slug;

  const isAdmin = isAuthenticated && user?.role === "admin";

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "views" | "likes">("newest");
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [readingArticle, setReadingArticle] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: rawArticles = [], isLoading, refetch } = trpc.articles.listPublished.useQuery({
    category: selectedCategory,
    search: searchQuery,
  });

  useEffect(() => {
    if (activeSlug && rawArticles.length > 0) {
      const match = rawArticles.find((a) => a.slug === activeSlug);
      if (match) {
        setReadingArticle(match);
      }
    }
  }, [activeSlug, rawArticles]);

  const handleCloseArticle = () => {
    setReadingArticle(null);
    if (activeSlug) {
      navigate("/articles", { replace: true });
    }
  };

  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    refetchOnMount: true,
    staleTime: 0,
  });

  const articles = useMemo(() => {
    const list = [...rawArticles];
    if (sortBy === "views") {
      list.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (sortBy === "likes") {
      list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    }
    return list;
  }, [rawArticles, sortBy]);

  const featuredArticle = useMemo(() => {
    if (orchestration?.heroCovers?.articlesMode === "custom" && orchestration?.heroCovers?.customArticleId) {
      const found = rawArticles.find((a) => a.id === orchestration.heroCovers.customArticleId);
      if (found) return found;
    }
    return rawArticles[0] || null;
  }, [rawArticles, orchestration?.heroCovers]);

  const secondArticle = useMemo(() => {
    if (!featuredArticle) return null;
    if (orchestration?.heroCovers?.articlesSecondaryArticleId) {
      const found = rawArticles.find((a) => a.id === orchestration.heroCovers.articlesSecondaryArticleId);
      if (found) return found;
    }
    return rawArticles.find((a) => a.id !== featuredArticle.id) || null;
  }, [rawArticles, featuredArticle, orchestration?.heroCovers?.articlesSecondaryArticleId]);

  const likeMutation = trpc.articles.like.useMutation({
    onSuccess: (newLikes) => {
      if (readingArticle) {
        setReadingArticle((prev: any) => (prev ? { ...prev, likesCount: newLikes } : prev));
      }
      void refetch();
      toast.success("شكراً لإعجابك بالمقال ❤️");
    },
  });

  const handleCopyLink = (article: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/articles/${article.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(article.id);
      toast.success("تم نسخ رابط المقال بنجاح 📋");
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleShare = async (article: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/articles/${article.slug}`;
    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.excerpt || article.title,
        url: window.location.origin + '/articles/' + article.slug,
      }).catch(() => {});
      return;
    }
    handleCopyLink(article, e);
  };


  return (
    <main
      dir="rtl"
      className={`min-h-screen aq-public-shell font-[Tajawal,sans-serif] transition-colors duration-200 ${
        isNationalDay
          ? dark ? "bg-[#01140c] text-white" : "bg-[#f8faf9] text-slate-900"
          : dark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Top Header Bar */}
      <AlaqeeqStudioSiteHeader title="مقالات وأقلام العقيق" active="articles" />

      {/* Hero Showcase Section with 7-col Hero + 3-stacked Cards Layout */}
      <section
        className={`relative isolate overflow-hidden border-b py-12 md:py-16 ${
          isNationalDay
            ? dark ? "snd-hero-dark border-emerald-500/25 text-white" : "snd-hero-light border-emerald-200/80 text-slate-900"
            : dark ? "border-white/[0.08] bg-black text-white" : "border-black/[0.06] bg-white text-black"
        }`}
      >
        <div className="relative mx-auto max-w-[1380px] px-4 sm:px-6 md:px-8">
          {/* Header Row: Title & Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <AqeeqSectionHeader
              badge={isNationalDay ? "🇸🇦 مقالات وأقلام العقيق · اليوم الوطني" : "ARTICLES & ESSAYS · أقلام وفكر العقيق"}
              badgeIcon={<PenTool size={13} />}
              title="أقلام تفيض فكراً وإبداعاً"
              subtitle="رفوف ثقافية ومساحة أدبية تفاعلية نبرز فيها كتابات طلاب مدارس العقيق الموهوبين، ورؤى المعلمين والقيادات، وتجارب أولياء الأمور الملهمة."
              dark={dark}
              className="!mb-0"
            />

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSubmitOpen(true)}
                className={`inline-flex items-center gap-2 rounded-2xl border px-6 py-3.5 text-xs font-black transition-all hover:scale-105 shadow-md ${
                  dark
                    ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14] hover:bg-[#f8ca14]/25"
                    : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
                }`}
              >
                <PenTool size={15} />
                <span>شاركنا بمقالك ✍️</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate("/articles/manage")}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3.5 text-xs font-black transition-all hover:scale-105 shadow-md ${
                    dark
                      ? "border-purple-400/40 bg-purple-500/15 text-purple-300 hover:bg-purple-500/25"
                      : "border-purple-600/30 bg-purple-50 text-purple-700 hover:bg-purple-100"
                  }`}
                >
                  <Sparkles size={15} />
                  <span>إدارة وتحرير المقالات ✍️</span>
                </button>
              )}
            </div>
          </div>

          {/* 🌟 The Exact 7-col Hero + 3-stacked Cards Showcase */}
          {featuredArticle && (
            <AqeeqPageHeroShowcase
              dark={dark}
              hero={{
                id: featuredArticle.id,
                title: featuredArticle.title,
                coverUrl: (directDriveImage(featuredArticle.coverUrl) || featuredArticle.coverUrl) ?? null,
                badge: featuredArticle.category || "مقال مميز",
                dateOrMeta: featuredArticle.publishedAt ? new Date(featuredArticle.publishedAt).toLocaleDateString("ar-SA") : undefined,
                href: `/articles/${featuredArticle.slug}`,
                excerpt: featuredArticle.excerpt || "قراءة تحليلية تثري المعرفة التربوية لأولياء الأمور والطلاب.",
                ctaText: "قراءة المقال بالكامل",
                onCtaClick: () => setReadingArticle(featuredArticle),
              }}
              stack={rawArticles.filter((a) => a.id !== featuredArticle.id).slice(0, 3).map((a) => ({
                id: a.id,
                title: a.title,
                coverUrl: (directDriveImage(a.coverUrl) || a.coverUrl) ?? null,
                badge: a.category || "مقال ونشرة",
                dateOrMeta: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("ar-SA") : undefined,
                href: `/articles/${a.slug}`,
                onClick: () => setReadingArticle(a),
              }))}
            />
          )}
        </div>
      </section>

      {/* Articles Feed Section */}
      <section className="mx-auto max-w-[1380px] px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div className={`mb-8 flex items-end justify-between gap-4 border-b pb-5 ${
          dark ? "border-white/[0.08]" : "border-black/[0.08]"
        }`}>
          <div>
            <p className={`text-[10px] font-black tracking-[0.18em] ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
              THE AQEEQ ARTICLES
            </p>
            <h2 className={`mt-2 text-2xl font-black ${dark ? "text-white" : "text-black"}`}>
              مقالات وأقلام العقيق
            </h2>
          </div>
          <span className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
            {articles.length} من {rawArticles.length} مقال
          </span>
        </div>

        {/* Gold Bordered Find & Sort Bar */}
        <div
          className={`mb-8 rounded-2xl border p-4 transition ${
            dark ? "border-[#f8ca14]/30 bg-black/60 shadow-lg shadow-[#f8ca14]/5" : "border-[#08467d]/20 bg-white shadow-sm"
          }`}
        >
          <div className="text-[10px] font-black tracking-[.18em] uppercase text-amber-400 mb-2">
            FIND & SORT · البحث وترتيب المقالات
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full lg:flex-1">
              <Search size={16} className="absolute top-3.5 right-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو المحتوى أو الكاتب..."
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

            {/* Sort Switcher */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold text-slate-400">ترتيب:</span>
              <button
                type="button"
                onClick={() => setSortBy("newest")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  sortBy === "newest"
                    ? dark
                      ? "bg-[#f8ca14] text-black"
                      : "bg-[#08467d] text-white"
                    : "text-slate-400 hover:text-current"
                }`}
              >
                الأحدث
              </button>
              <button
                type="button"
                onClick={() => setSortBy("views")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  sortBy === "views"
                    ? dark
                      ? "bg-[#f8ca14] text-black"
                      : "bg-[#08467d] text-white"
                    : "text-slate-400 hover:text-current"
                }`}
              >
                الأكثر قراءة
              </button>
              <button
                type="button"
                onClick={() => setSortBy("likes")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  sortBy === "likes"
                    ? dark
                      ? "bg-[#f8ca14] text-black"
                      : "bg-[#08467d] text-white"
                    : "text-slate-400 hover:text-current"
                }`}
              >
                الأعلى إعجاباً
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-3 pt-3 border-t border-white/10 flex overflow-x-auto scrollbar-hide flex-nowrap pb-1 items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 ml-2">التصنيف:</span>
            {CATEGORIES.map((cat) => {
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

        {/* Articles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-64 rounded-[2rem] border animate-pulse ${
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
            <h3 className="text-lg font-black">لا توجد مقالات مطابقة حالياً</h3>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {articles.map((art, idx) => (
              <ArticleCard
                key={art.id}
                article={art}
                index={idx}
                dark={dark}
                onOpen={() => setReadingArticle(art)}
                onShare={handleShare}
              />
            ))}
          </div>
        )}
      </section>

      {/* Royal Article Reading Lightbox Modal */}
      {readingArticle && (
        <Dialog open={Boolean(readingArticle)} onOpenChange={(open) => !open && handleCloseArticle()}>
          <DialogContent
            className={`max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border p-6 sm:p-10 text-right shadow-2xl ${
              dark
                ? "border-[#f8ca14]/40 bg-[#0a0a0a] text-white"
                : "border-[#08467d]/30 bg-white text-slate-900"
            }`}
            dir="rtl"
          >
            <div className="space-y-6">
              {/* Breadcrumb Navigation */}
              <nav className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                <button type="button" onClick={() => { handleCloseArticle(); navigate("/"); }} className="hover:text-current transition">الرئيسية</button>
                <span className="opacity-40">›</span>
                <button type="button" onClick={handleCloseArticle} className="hover:text-current transition">المقالات</button>
                <span className="opacity-40">›</span>
                <span className={dark ? "text-[#f8ca14]" : "text-[#08467d] font-black"}>{readingArticle.category}</span>
              </nav>

              <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${dark ? "border-white/10" : "border-black/10"}`}>
                <span className={`rounded-xl border px-3 py-1 text-xs font-black ${
                  dark
                    ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
                    : "border-[#08467d]/40 bg-[#08467d]/10 text-[#08467d]"
                }`}>
                  {readingArticle.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  تاريخ النشر: {new Date(readingArticle.publishedAt || readingArticle.createdAt).toLocaleDateString("ar-SA")}
                </span>
              </div>

              <h1 className={`text-2xl sm:text-4xl font-black leading-snug ${dark ? "text-white" : "text-slate-900"}`}>
                {readingArticle.title}
              </h1>

              {/* Author Bio Card */}
              <div
                className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border p-4 ${
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
                    <p className={`text-xs font-bold ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>{readingArticle.authorRole}</p>
                  </div>
                </div>

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

              {readingArticle.coverUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <img
                    src={directDriveImage(readingArticle.coverUrl) || readingArticle.coverUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Modern Crystal-Clear Tajawal Typography Article Body */}
              <div className={`rounded-3xl border p-5 sm:p-8 font-[Tajawal,sans-serif] ${
                dark ? "border-white/5 bg-white/[0.02]" : "border-black/10 bg-slate-50/70"
              }`}>
                {(() => {
                  const paragraphs = readingArticle.content.split(/\n\s*\n|\r\n\s*\r\n/);
                  return (
                    <div className="space-y-6 text-right">
                      {paragraphs.map((p: string, idx: number) => {
                        const trimmed = p.trim();
                        if (!trimmed) return null;

                        if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
                          const cleanTitle = trimmed.replace(/^#+\s*/, "");
                          return (
                            <h3 key={idx} className={`text-xl sm:text-2xl font-black pt-2 pb-1 border-b ${
                              dark ? "text-[#f8ca14] border-white/10" : "text-[#08467d] border-black/10"
                            }`}>
                              {cleanTitle}
                            </h3>
                          );
                        }

                        const lines = trimmed.split(/\n|\r\n/);
                        return (
                          <div key={idx} className="space-y-3">
                            {lines.map((line: string, lIdx: number) => {
                              const lineTrimmed = line.trim();
                              if (!lineTrimmed) return null;

                              const isNumbered = /^\d+[\.\-\)]\s*/.test(lineTrimmed);
                              const isBullet = /^[\*\-•]\s*/.test(lineTrimmed);
                              const cleanText = lineTrimmed.replace(/^(\d+[\.\-\)]|\*|\-|•)\s*/, "");

                              const parts = (isNumbered || isBullet ? cleanText : lineTrimmed).split(/(\*\*[^*]+\*\*)/g);
                              const renderedParts = parts.map((part: string, pIdx: number) => {
                                 if (part.startsWith("**") && part.endsWith("**")) {
                                   return (
                                     <strong key={pIdx} className={`font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                                       {part.slice(2, -2)}
                                     </strong>
                                   );
                                 }
                                return <span key={pIdx}>{part}</span>;
                              });

                              if (isNumbered || isBullet) {
                                return (
                                  <div key={lIdx} className="flex items-start gap-3 pr-2 sm:pr-4 py-1">
                                    <span className={`shrink-0 mt-2.5 h-2 w-2 rounded-full ${
                                      dark ? "bg-[#f8ca14] shadow-[0_0_8px_#f8ca14]" : "bg-[#08467d]"
                                    }`} />
                                    <p className={`flex-1 text-base sm:text-lg leading-[2.3] font-normal ${
                                      dark ? "text-slate-100" : "text-slate-800"
                                    }`}>
                                      {renderedParts}
                                    </p>
                                  </div>
                                );
                              }

                              return (
                                <p
                                  key={lIdx}
                                  className={`text-base sm:text-lg leading-[2.3] font-normal ${
                                    dark ? "text-slate-200" : "text-slate-800"
                                  }`}
                                >
                                  {renderedParts}
                                </p>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

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
                  onClick={handleCloseArticle}
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

      {/* Unified Luxury Site Footer */}
      <AlaqeeqStudioSiteFooter />
    </main>
  );
}

