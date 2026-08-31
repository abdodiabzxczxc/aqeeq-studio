import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import MediaLibrary from "@/components/MediaLibrary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  PenTool,
  Sparkles,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Heart,
  Share2,
  Clock,
  BookOpen,
  ArrowUpLeft,
  RotateCcw,
  Loader2,
  Wand2,
  ImageIcon,
  Check,
  Calendar,
  Layers,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const CATEGORIES = ["تربوي", "إبداعات الطلاب", "إرشاد أسري", "أنشطة وفعاليات", "تجارب ملهمة"] as const;

function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const id =
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/)?.[1];
  return id ? `/api/drive-proxy/${id}` : url;
}

export default function AqeeqArticlesStudioPage() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const utils = trpc.useUtils();

  const { data: articles = [], isLoading, refetch } = trpc.articles.listAllAdmin.useQuery(undefined, {
    enabled: Boolean(isAdmin),
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "published" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  // Form State for editing selected article
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editCategory, setEditCategory] = useState<(typeof CATEGORIES)[number]>("تربوي");
  const [editCoverUrl, setEditCoverUrl] = useState<string | null>(null);

  // Form State for creating new article
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newAuthorName, setNewAuthorName] = useState("إدارة مدارس العقيق");
  const [newAuthorRole, setNewAuthorRole] = useState("هيئة التحرير");
  const [newCategory, setNewCategory] = useState<(typeof CATEGORIES)[number]>("تربوي");
  const [newCoverUrl, setNewCoverUrl] = useState<string | null>(null);

  const selectedArticle = useMemo(() => {
    if (selectedId) {
      return articles.find((a) => a.id === selectedId) || null;
    }
    return articles[0] || null;
  }, [articles, selectedId]);

  // Sync edit form when selected article changes
  const handleSelectArticle = (art: any) => {
    setSelectedId(art.id);
    setEditTitle(art.title);
    setEditContent(art.content);
    setEditExcerpt(art.excerpt || "");
    setEditCategory(art.category as any);
    setEditCoverUrl(art.coverUrl || null);
  };

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.authorName.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [articles, filterStatus, searchQuery]);

  const createMutation = trpc.articles.createAdminArticle.useMutation({
    onSuccess: () => {
      toast.success("تم نشر المقال بنجاح في استوديو العقيق!");
      setIsCreateOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewExcerpt("");
      void refetch();
      void utils.articles.listPublished.invalidate();
    },
    onError: (err) => toast.error(err.message || "تعذر إنشاء المقال"),
  });

  const moderateMutation = trpc.articles.moderate.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة المقال وبياناته بنجاح!");
      void refetch();
      void utils.articles.listPublished.invalidate();
    },
    onError: (err) => toast.error(err.message || "تعذر التحديث"),
  });

  const deleteMutation = trpc.articles.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المقال بنجاح");
      if (selectedId === selectedArticle?.id) setSelectedId(null);
      void refetch();
      void utils.articles.listPublished.invalidate();
    },
    onError: (err) => toast.error(err.message || "تعذر الحذف"),
  });

  const aiPolishMutation = trpc.articles.aiPolish.useMutation({
    onSuccess: (data) => {
      setEditTitle(data.polishedTitle);
      setEditContent(data.polishedContent);
      setEditExcerpt(data.polishedExcerpt);
      toast.success("تمت إعادة صياغة وتحسين المقال بالذكاء الاصطناعي بنجاح! ✨");
    },
    onError: (err) => toast.error(err.message || "تعذر التحسين"),
  });

  if (authLoading || isLoading) {
    return (
      <div className={`grid min-h-screen place-items-center ${dark ? "bg-black text-white" : "bg-white text-black"}`}>
        <Loader2 className="animate-spin text-[#f8ca14]" size={36} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={`min-h-screen grid place-items-center p-6 text-center ${dark ? "bg-black text-white" : "bg-white text-black"}`}>
        <div className="max-w-md space-y-4">
          <BookOpen className="mx-auto text-amber-400" size={48} />
          <h2 className="text-xl font-black">استوديو إدارة المقالات مخصص للمشرفين فقط</h2>
          <p className="text-xs text-slate-400">يرجى تسجيل الدخول بحساب مسؤول للوصول إلى غرفة التحكم بالمقالات.</p>
          <Button onClick={() => navigate("/login")} className="bg-[#f8ca14] text-black font-black">
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className={`min-h-screen font-[Tajawal,sans-serif] ${dark ? "bg-[#080808] text-white" : "bg-[#f8f9fc] text-slate-900"}`}>
      {/* Site Header */}
      <AlaqeeqStudioSiteHeader title="استوديو إدارة المقالات" active="articles" />

      {/* Studio Command Bar */}
      <header className={`sticky top-[66px] sm:top-[80px] z-30 border-b backdrop-blur-xl transition ${
        dark ? "border-white/10 bg-black/80" : "border-black/10 bg-white/90"
      }`}>
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-[#08467d] text-black font-black shadow-lg">
              <PenTool size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black">استوديو تحرير ومراجعة المقالات</h1>
                <span className="rounded-full bg-[#f8ca14]/20 border border-[#f8ca14]/40 px-2.5 py-0.5 text-[10px] font-black text-[#f8ca14]">
                  STUDIO PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-bold">التحكم المركزي بمقالات الطلاب والمعلمين والافتتاحيات الرسمية</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate("/articles")}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                dark ? "border-white/10 bg-white/5 hover:bg-white/10 text-slate-300" : "border-black/10 bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <ArrowUpLeft size={14} />
              <span>معاينة الواجهة العامة</span>
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#f8ca14] hover:bg-yellow-400 px-4 py-2 text-xs font-black text-black shadow-lg shadow-[#f8ca14]/20 transition"
            >
              <Plus size={16} />
              <span>كتابة مقال رسمي جديد</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Two-Column Studio Layout */}
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Right Column: Articles Directory & Filters (4 cols) */}
          <div className="space-y-4 lg:col-span-4">
            <div className={`rounded-3xl border p-5 space-y-4 shadow-sm ${
              dark ? "border-white/10 bg-[#101010]" : "border-black/10 bg-white"
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <BookOpen size={16} className="text-[#f8ca14]" />
                  <span>دليل المقالات ({filteredArticles.length})</span>
                </h3>
                <span className="text-xs text-slate-400 font-bold">
                  {articles.filter((a) => a.status === "pending").length} معلق ⏳
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute right-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في المقالات..."
                  className={`w-full rounded-xl border pr-9 pl-3 py-2 text-xs font-bold outline-none transition ${
                    dark ? "border-white/10 bg-black text-white focus:border-[#f8ca14]" : "border-black/10 bg-slate-50 text-black focus:border-[#08467d]"
                  }`}
                />
              </div>

              {/* Status Filter Tabs */}
              <div className={`grid grid-cols-4 gap-1 rounded-xl p-1 border text-[11px] font-black ${
                dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-100"
              }`}>
                {(["all", "pending", "published", "rejected"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`rounded-lg py-1.5 text-center transition ${
                      filterStatus === st
                        ? dark
                          ? "bg-[#f8ca14] text-black shadow-sm"
                          : "bg-[#08467d] text-white shadow-sm"
                        : "text-slate-400 hover:text-current"
                    }`}
                  >
                    {st === "all" ? "الكل" : st === "pending" ? "معلق ⏳" : st === "published" ? "منشور ✅" : "مرفوض ❌"}
                  </button>
                ))}
              </div>

              {/* Articles Scrollable List */}
              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {filteredArticles.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 font-bold">لا توجد مقالات مطابقة</div>
                ) : (
                  filteredArticles.map((art) => {
                    const isSelected = selectedArticle?.id === art.id;
                    const cover = directDriveImage(art.coverUrl) || art.coverUrl;
                    return (
                      <div
                        key={art.id}
                        onClick={() => handleSelectArticle(art)}
                        className={`group relative flex items-start gap-3 rounded-2xl border p-3 cursor-pointer transition ${
                          isSelected
                            ? dark
                              ? "border-[#f8ca14] bg-[#1a1705] shadow-md shadow-[#f8ca14]/10"
                              : "border-[#08467d] bg-[#f0f7ff] shadow-md"
                            : dark
                            ? "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                            : "border-black/5 bg-slate-50 hover:border-black/20 hover:bg-white"
                        }`}
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black/40 border border-white/10">
                          {cover ? (
                            <img src={cover} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full place-items-center text-slate-500 font-black text-xs">✍️</div>
                          )}
                          <span className={`absolute top-1 right-1 h-2 w-2 rounded-full ${
                            art.status === "published" ? "bg-emerald-400" : art.status === "pending" ? "bg-amber-400 animate-ping" : "bg-rose-500"
                          }`} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-black text-[#f8ca14]">{art.category}</span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {new Date(art.createdAt).toLocaleDateString("ar-SA")}
                            </span>
                          </div>
                          <h4 className="text-xs font-black truncate mt-0.5 text-white">{art.title}</h4>
                          <p className="text-[10px] text-slate-400 truncate mt-1">بقلم: {art.authorName}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Left Column: Live Editor & Moderation Workspace (8 cols) */}
          <div className="space-y-6 lg:col-span-8">
            {selectedArticle ? (
              <div className={`rounded-3xl border p-6 sm:p-8 space-y-6 shadow-md ${
                dark ? "border-white/10 bg-[#101010]" : "border-black/10 bg-white"
              }`}>
                {/* Header Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-current/10 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-lg px-2.5 py-1 text-[11px] font-black border ${
                        selectedArticle.status === "published"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : selectedArticle.status === "pending"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                          : "border-rose-500/40 bg-rose-500/10 text-rose-400"
                      }`}>
                        {selectedArticle.status === "published" ? "✅ منشور للجميع" : selectedArticle.status === "pending" ? "⏳ بانتظار الاعتماد والمراجعة" : "❌ مرفوض"}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">بواسطة: {selectedArticle.authorName} ({selectedArticle.authorRole || "كاتب"})</span>
                    </div>
                  </div>

                  {/* Actions (Publish / Reject / AI Polish / Delete) */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        aiPolishMutation.mutate({
                          title: editTitle || selectedArticle.title,
                          content: editContent || selectedArticle.content,
                        })
                      }
                      disabled={aiPolishMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-purple-400/40 bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 px-3.5 py-2 text-xs font-black transition shadow-sm"
                    >
                      <Sparkles size={14} className="text-purple-300" />
                      <span>{aiPolishMutation.isPending ? "جاري التحسين..." : "تحسين بالذكاء الاصطناعي"}</span>
                    </button>

                    {selectedArticle.status !== "published" && (
                      <button
                        type="button"
                        onClick={() =>
                          moderateMutation.mutate({
                            id: selectedArticle.id,
                            status: "published",
                            updates: {
                              title: editTitle,
                              content: editContent,
                              excerpt: editExcerpt,
                              category: editCategory,
                              coverUrl: editCoverUrl,
                            },
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-black transition shadow-md"
                      >
                        <CheckCircle2 size={15} />
                        <span>اعتماد ونشر المقال</span>
                      </button>
                    )}

                    {selectedArticle.status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() =>
                          moderateMutation.mutate({
                            id: selectedArticle.id,
                            status: "rejected",
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-3.5 py-2 text-xs font-bold transition"
                      >
                        <XCircle size={15} />
                        <span>رفض</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("هل أنت متأكد من رغبتك في حذف هذا المقال نهائياً؟")) {
                          deleteMutation.mutate({ id: selectedArticle.id });
                        }
                      }}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-400 transition"
                      title="حذف المقال"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Edit Form Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <Label className="text-xs font-black text-slate-300 mb-1.5 block">عنوان المقال</Label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="أدخل عنوان المقال..."
                        className={`font-black text-sm rounded-xl ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-black text-slate-300 mb-1.5 block">التصنيف</Label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as any)}
                        className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                          dark ? "bg-black/50 border-white/10 text-white" : "bg-slate-50 border-black/10 text-black"
                        }`}
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="bg-slate-900 text-white">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-black text-slate-300 mb-1.5 block">المقدمة والمقتطف الترويجي (Excerpt)</Label>
                    <Input
                      value={editExcerpt}
                      onChange={(e) => setEditExcerpt(e.target.value)}
                      placeholder="موجز سريع للمقال يظهر في البطاقات وقسم الهيرو..."
                      className={`text-xs font-bold rounded-xl ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-xs font-black text-slate-300">نص المقال الكامل (بالخط العربي الفاخر)</Label>
                      <span className="text-[10px] text-slate-400 font-mono">{editContent.length} حرف</span>
                    </div>
                    <Textarea
                      rows={12}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="اكتب أو عدّل نص المقال كاملاً هنا..."
                      className={`font-[Amiri,serif] text-base leading-8 rounded-2xl ${
                        dark ? "bg-black/50 border-white/10 text-white" : "bg-slate-50 border-black/10 text-black"
                      }`}
                    />
                  </div>

                  {/* Cover Selector */}
                  <div className="rounded-2xl border border-current/10 p-4 space-y-3">
                    <Label className="text-xs font-black text-slate-300 block">غلاف المقال والصورة البصرية</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-black/40 border border-white/10">
                        {editCoverUrl ? (
                          <img src={directDriveImage(editCoverUrl) || editCoverUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full place-items-center text-xs text-slate-500 font-bold">بدون غلاف</div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <Input
                          value={editCoverUrl || ""}
                          onChange={(e) => setEditCoverUrl(e.target.value)}
                          placeholder="رابط مباشر للصورة أو رابط Google Drive..."
                          className={`text-xs rounded-xl ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsMediaLibraryOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400 hover:text-black px-3 py-1.5 text-xs font-black transition"
                          >
                            <ImageIcon size={14} />
                            <span>اختيار من مكتبة وسائط العقيق</span>
                          </button>
                          {editCoverUrl && (
                            <button
                              type="button"
                              onClick={() => setEditCoverUrl(null)}
                              className="text-[11px] text-rose-400 hover:underline"
                            >
                              إزالة الغلاف
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Changes Button */}
                  <div className="pt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        moderateMutation.mutate({
                          id: selectedArticle.id,
                          status: selectedArticle.status as any,
                          updates: {
                            title: editTitle,
                            content: editContent,
                            excerpt: editExcerpt,
                            category: editCategory,
                            coverUrl: editCoverUrl,
                          },
                        })
                      }
                      disabled={moderateMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#f8ca14] hover:bg-yellow-400 text-black px-6 py-3 text-xs font-black transition shadow-lg shadow-[#f8ca14]/20"
                    >
                      <Check size={16} />
                      <span>{moderateMutation.isPending ? "جاري حفظ التعديلات..." : "حفظ التعديلات في المقال"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`rounded-3xl border p-12 text-center space-y-4 ${
                dark ? "border-white/10 bg-[#101010]" : "border-black/10 bg-white"
              }`}>
                <PenTool className="mx-auto text-slate-500" size={40} />
                <h3 className="text-base font-black">اختر مقالاً من الدليل للبدء في مراجعته وتحريره</h3>
                <p className="text-xs text-slate-400">يمكنك تعديل النصوص، تفعيل التحسين بالذكاء الاصطناعي، أو اعتماد المقال فوراً.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Creating Official Article */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent
          className={`max-w-2xl rounded-[2.5rem] border p-6 sm:p-8 text-right shadow-2xl ${
            dark ? "border-[#f8ca14]/40 bg-[#0a0a0a] text-white" : "border-[#08467d]/30 bg-white text-slate-900"
          }`}
          dir="rtl"
        >
          <DialogHeader className="text-right border-b border-current/10 pb-4">
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <PenTool size={18} className="text-[#f8ca14]" />
              <span>كتابة مقال رسمي جديد للاستوديو</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-black text-slate-300 mb-1.5 block">عنوان المقال</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="عنوان المقال..."
                className={`font-black text-sm rounded-xl ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs font-black text-slate-300 mb-1.5 block">اسم الكاتب</Label>
                <Input
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                  placeholder="اسم الكاتب..."
                  className={`text-xs rounded-xl ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
                />
              </div>
              <div>
                <Label className="text-xs font-black text-slate-300 mb-1.5 block">الصفة أو المنصب</Label>
                <Input
                  value={newAuthorRole}
                  onChange={(e) => setNewAuthorRole(e.target.value)}
                  placeholder="مثال: إدارة المدارس / معلم / طالب..."
                  className={`text-xs rounded-xl ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
                />
              </div>
              <div>
                <Label className="text-xs font-black text-slate-300 mb-1.5 block">التصنيف</Label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                    dark ? "bg-black/50 border-white/10 text-white" : "bg-slate-50 border-black/10 text-black"
                  }`}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-black text-slate-300 mb-1.5 block">المقدمة والمقتطف (Excerpt)</Label>
              <Input
                value={newExcerpt}
                onChange={(e) => setNewExcerpt(e.target.value)}
                placeholder="موجز سريع للمقال..."
                className={`text-xs rounded-xl ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
              />
            </div>

            <div>
              <Label className="text-xs font-black text-slate-300 mb-1.5 block">نص المقال الكامل</Label>
              <Textarea
                rows={8}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="اكتب نص المقال الكامل هنا..."
                className={`font-[Amiri,serif] text-base leading-8 rounded-2xl ${
                  dark ? "bg-black/50 border-white/10 text-white" : "bg-slate-50 border-black/10 text-black"
                }`}
              />
            </div>

            <div>
              <Label className="text-xs font-black text-slate-300 mb-1.5 block">رابط الغلاف (اختياري)</Label>
              <Input
                value={newCoverUrl || ""}
                onChange={(e) => setNewCoverUrl(e.target.value)}
                placeholder="رابط مباشر للصورة أو من وسائط العقيق..."
                className={`text-xs rounded-xl ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
                إلغاء
              </Button>
              <button
                type="button"
                onClick={() => {
                  if (!newTitle.trim() || !newContent.trim()) {
                    toast.error("يرجى كتابة عنوان المقال ومحتواه");
                    return;
                  }
                  createMutation.mutate({
                    title: newTitle,
                    content: newContent,
                    excerpt: newExcerpt,
                    authorName: newAuthorName,
                    authorRole: newAuthorRole,
                    category: newCategory,
                    coverUrl: newCoverUrl || undefined,
                    isPublished: true,
                  });
                }}
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-[#f8ca14] hover:bg-yellow-400 text-black font-black px-6 py-2.5 text-xs transition shadow-lg shadow-[#f8ca14]/20"
              >
                <Check size={16} />
                <span>{createMutation.isPending ? "جاري النشر..." : "نشر المقال فوراً"}</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Library Picker Modal */}
      <MediaLibrary
        open={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={(item) => {
          setEditCoverUrl(item.url);
          setIsMediaLibraryOpen(false);
          toast.success("تم تحديد غلاف المقال بنجاح!");
        }}
      />
    </div>
  );
}
