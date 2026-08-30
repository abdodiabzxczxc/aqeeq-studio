import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import MediaLibrary from "@/components/MediaLibrary";
import { usePodcastPlayer } from "@/components/AqeeqFloatingPodcastPlayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Mic,
  Radio,
  Headphones,
  Video,
  Play,
  Pause,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  Eye,
  Heart,
  Share2,
  Clock,
  ArrowUpLeft,
  Loader2,
  ImageIcon,
  Check,
  Sparkles,
  Volume2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const PODCAST_CATEGORIES = [
  "إذاعة الصباح",
  "بودكاست قيادات",
  "تغطيات صوتية",
  "حوارات الطلاب",
  "نشرات إخبارية",
] as const;

function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const id =
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/)?.[1];
  return id ? `/api/drive-proxy/${id}` : url;
}

export default function AqeeqPodcastStudioPage() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const utils = trpc.useUtils();

  const { activePodcast, isPlaying, playPodcast, pausePodcast } = usePodcastPlayer();

  const { data: podcasts = [], isLoading, refetch } = trpc.podcasts.list.useQuery(
    {},
    { enabled: Boolean(isAdmin) }
  );

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<"all" | "audio" | "video">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"editCover" | "newCover" | "editMedia" | "newMedia">("editCover");

  // Form State for editing
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMediaType, setEditMediaType] = useState<"audio" | "video">("audio");
  const [editSourceType, setEditSourceType] = useState<"drive" | "youtube" | "direct">("direct");
  const [editMediaUrl, setEditMediaUrl] = useState("");
  const [editCoverUrl, setEditCoverUrl] = useState<string | null>(null);
  const [editDuration, setEditDuration] = useState("15:00");
  const [editCategory, setEditCategory] = useState<(typeof PODCAST_CATEGORIES)[number]>("إذاعة الصباح");
  const [editHostName, setEditHostName] = useState("فريق الإذاعة المدرسية");

  // Form State for creating new episode
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newMediaType, setNewMediaType] = useState<"audio" | "video">("audio");
  const [newSourceType, setNewSourceType] = useState<"drive" | "youtube" | "direct">("direct");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newCoverUrl, setNewCoverUrl] = useState<string | null>(null);
  const [newDuration, setNewDuration] = useState("12:30");
  const [newCategory, setNewCategory] = useState<(typeof PODCAST_CATEGORIES)[number]>("إذاعة الصباح");
  const [newHostName, setNewHostName] = useState("فريق الإذاعة المدرسية");

  const selectedPodcast = useMemo(() => {
    if (selectedId) {
      return podcasts.find((p) => p.id === selectedId) || null;
    }
    return podcasts[0] || null;
  }, [podcasts, selectedId]);

  const handleSelectPodcast = (p: any) => {
    setSelectedId(p.id);
    setEditTitle(p.title);
    setEditDescription(p.description);
    setEditMediaType(p.mediaType || "audio");
    setEditSourceType(p.sourceType || "direct");
    setEditMediaUrl(p.mediaUrl || "");
    setEditCoverUrl(p.coverUrl || null);
    setEditDuration(p.duration || "15:00");
    setEditCategory(p.category as any);
    setEditHostName(p.hostName || "فريق الإذاعة المدرسية");
  };

  const filteredPodcasts = useMemo(() => {
    return podcasts.filter((p) => {
      if (filterType !== "all" && p.mediaType !== filterType) return false;
      if (filterCategory !== "all" && p.category !== filterCategory) return false;
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
  }, [podcasts, filterType, filterCategory, searchQuery]);

  const createMutation = trpc.podcasts.create.useMutation({
    onSuccess: () => {
      toast.success("تمت إضافة حلقة البودكاست بنجاح!");
      setIsCreateOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewMediaUrl("");
      void refetch();
      void utils.podcasts.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "تعذر إنشاء الحلقة"),
  });

  const updateMutation = trpc.podcasts.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث بيانات حلقة البودكاست بنجاح!");
      void refetch();
      void utils.podcasts.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "تعذر التحديث"),
  });

  const deleteMutation = trpc.podcasts.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الحلقة بنجاح");
      if (selectedId === selectedPodcast?.id) setSelectedId(null);
      void refetch();
      void utils.podcasts.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "تعذر الحذف"),
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
          <Radio className="mx-auto text-[#f8ca14]" size={48} />
          <h2 className="text-xl font-black">استوديو إدارة البودكاست مخصص للمشرفين فقط</h2>
          <p className="text-xs text-slate-400">يرجى تسجيل الدخول بحساب مسؤول للوصول إلى غرفة التحكم بالبودكاست والإذاعة.</p>
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
      <AlaqeeqStudioSiteHeader title="استوديو إدارة الإذاعة والبودكاست" active="studio" />

      {/* Studio Command Bar */}
      <header className={`sticky top-[66px] sm:top-[80px] z-30 border-b backdrop-blur-xl transition ${
        dark ? "border-white/10 bg-black/80" : "border-black/10 bg-white/90"
      }`}>
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-purple-500 to-[#08467d] text-white font-black shadow-lg">
              <Radio size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black">استوديو إنتاج وإدارة البودكاست والإذاعة</h1>
                <span className="rounded-full bg-purple-500/20 border border-purple-400/40 px-2.5 py-0.5 text-[10px] font-black text-purple-300">
                  BROADCAST PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-bold">إدارة حلقات الإذاعة المدرسية، بودكاست القيادات، واللقاءات الحوارية والمرئية</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate("/podcast")}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                dark ? "border-white/10 bg-white/5 hover:bg-white/10 text-slate-300" : "border-black/10 bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <ArrowUpLeft size={14} />
              <span>معاينة الواجهة العامة</span>
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-purple-600/30 transition"
            >
              <Plus size={16} />
              <span>إضافة حلقة جديدة 🎙️</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Two-Column Studio Layout */}
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Right Column: Episodes Directory & Filters (4 cols) */}
          <div className="space-y-4 lg:col-span-4">
            <div className={`rounded-3xl border p-5 space-y-4 shadow-sm ${
              dark ? "border-white/10 bg-[#101010]" : "border-black/10 bg-white"
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <Headphones size={16} className="text-purple-400" />
                  <span>دليل الحلقات ({filteredPodcasts.length})</span>
                </h3>
                <span className="text-xs text-slate-400 font-bold">
                  {podcasts.filter((p) => p.mediaType === "video").length} فيديو · {podcasts.filter((p) => p.mediaType === "audio").length} صوت
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute right-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في الحلقات والضيوف..."
                  className={`w-full rounded-xl border pr-9 pl-3 py-2 text-xs font-bold outline-none transition ${
                    dark ? "border-white/10 bg-black text-white focus:border-purple-400" : "border-black/10 bg-slate-50 text-black focus:border-purple-600"
                  }`}
                />
              </div>

              {/* Media Type Filter Tabs */}
              <div className={`grid grid-cols-3 gap-1 rounded-xl p-1 border text-[11px] font-black ${
                dark ? "border-white/10 bg-black/50" : "border-black/10 bg-slate-100"
              }`}>
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`rounded-lg py-1.5 text-center transition ${filterType === "all" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400"}`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("audio")}
                  className={`rounded-lg py-1.5 text-center transition flex items-center justify-center gap-1 ${filterType === "audio" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400"}`}
                >
                  <Headphones size={12} />
                  <span>صوت</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("video")}
                  className={`rounded-lg py-1.5 text-center transition flex items-center justify-center gap-1 ${filterType === "video" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400"}`}
                >
                  <Video size={12} />
                  <span>فيديو</span>
                </button>
              </div>

              {/* Episodes Scrollable List */}
              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {filteredPodcasts.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 font-bold">لا توجد حلقات مطابقة</div>
                ) : (
                  filteredPodcasts.map((p) => {
                    const isSelected = selectedPodcast?.id === p.id;
                    const isPlayingThis = activePodcast?.id === p.id && isPlaying;
                    const cover = directDriveImage(p.coverUrl) || p.coverUrl;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPodcast(p)}
                        className={`group relative flex items-start gap-3 rounded-2xl border p-3 cursor-pointer transition ${
                          isSelected
                            ? dark
                              ? "border-purple-500 bg-purple-950/20 shadow-md shadow-purple-500/10 ring-1 ring-purple-500/30"
                              : "border-purple-600 bg-purple-50 shadow-md"
                            : dark
                            ? "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                            : "border-black/5 bg-slate-50 hover:border-black/20 hover:bg-white"
                        }`}
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black/40 border border-white/10">
                          {cover ? (
                            <img src={cover} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full place-items-center text-purple-400 font-black text-xs">
                              {p.mediaType === "video" ? <Video size={18} /> : <Mic size={18} />}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isPlayingThis) pausePodcast();
                                else playPodcast(p);
                              }}
                              className="grid h-7 w-7 place-items-center rounded-full bg-[#f8ca14] text-black shadow-md"
                            >
                              {isPlayingThis ? <Pause size={12} /> : <Play size={12} className="mr-0.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-black text-purple-400">{p.category}</span>
                            <span className="text-[9px] text-slate-500 font-mono flex items-center gap-0.5">
                              <Clock size={10} />
                              {p.duration || "10:00"}
                            </span>
                          </div>
                          <h4 className="text-xs font-black truncate mt-0.5 text-white">{p.title}</h4>
                          <p className="text-[10px] text-slate-400 truncate mt-1">{p.hostName || "فريق الإذاعة المدرسية"}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Left Column: Live Episode Studio & Player Workspace (8 cols) */}
          <div className="space-y-6 lg:col-span-8">
            {selectedPodcast ? (
              <div className={`rounded-3xl border p-6 sm:p-8 space-y-6 shadow-md ${
                dark ? "border-white/10 bg-[#101010]" : "border-black/10 bg-white"
              }`}>
                {/* Header Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-current/10 pb-5">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-lg px-2.5 py-1 text-[11px] font-black border ${
                      selectedPodcast.mediaType === "video"
                        ? "border-blue-400/40 bg-blue-500/10 text-blue-300"
                        : "border-purple-400/40 bg-purple-500/10 text-purple-300"
                    }`}>
                      {selectedPodcast.mediaType === "video" ? "📹 حلقة فيديو" : "🎧 حلقة صوتية"}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">المدة: {selectedPodcast.duration || "10:00"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Test Play in persistent player */}
                    <button
                      type="button"
                      onClick={() => {
                        if (activePodcast?.id === selectedPodcast.id && isPlaying) {
                          pausePodcast();
                        } else {
                          playPodcast(selectedPodcast);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#f8ca14] hover:bg-yellow-400 text-black px-4 py-2 text-xs font-black transition shadow-md"
                    >
                      {activePodcast?.id === selectedPodcast.id && isPlaying ? <Pause size={14} /> : <Play size={14} className="mr-0.5" />}
                      <span>{activePodcast?.id === selectedPodcast.id && isPlaying ? "إيقاف مؤقت" : "تشغيل الحلقة تجريبياً"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("هل أنت متأكد من رغبتك في حذف حلقة البودكاست هذه نهائياً؟")) {
                          deleteMutation.mutate({ id: selectedPodcast.id });
                        }
                      }}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-400 transition"
                      title="حذف الحلقة"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Edit Form Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <Label className="text-xs font-black text-slate-300 mb-1.5 block">عنوان الحلقة</Label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="أدخل عنوان الحلقة..."
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
                        {PODCAST_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="bg-slate-900 text-white">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <Label className="text-xs font-black text-slate-300 mb-1.5 block">نوع الوسائط</Label>
                      <select
                        value={editMediaType}
                        onChange={(e) => setEditMediaType(e.target.value as any)}
                        className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                          dark ? "bg-black/50 border-white/10 text-white" : "bg-slate-50 border-black/10 text-black"
                        }`}
                      >
                        <option value="audio" className="bg-slate-900 text-white">🎧 ملف صوتي (Audio)</option>
                        <option value="video" className="bg-slate-900 text-white">📹 فيديو مرئي (Video / YouTube)</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs font-black text-slate-300 mb-1.5 block">مقدم الحلقة والضيوف</Label>
                      <Input
                        value={editHostName}
                        onChange={(e) => setEditHostName(e.target.value)}
                        placeholder="مثال: أ. عبد الرحمن خليل & الطالب عمر..."
                        className={`text-xs rounded-xl ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-black text-slate-300 mb-1.5 block">مدة الحلقة (دقيقة:ثانية)</Label>
                      <Input
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        placeholder="مثال: 14:30"
                        className={`text-xs rounded-xl ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-black text-slate-300 mb-1.5 block">رابط تشغيل الوسائط (Media URL)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={editMediaUrl}
                        onChange={(e) => setEditMediaUrl(e.target.value)}
                        placeholder="رابط يوتيوب أو رابط ملف صوتي MP3 / Drive مباشر..."
                        className={`text-xs rounded-xl font-mono ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMediaTarget("editMedia");
                          setIsMediaLibraryOpen(true);
                        }}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition"
                      >
                        <Volume2 size={14} />
                        <span>اختيار ملف</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-black text-slate-300 mb-1.5 block">وصف ومحاور الحلقة</Label>
                    <Textarea
                      rows={4}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="اكتب نبذة عن موضوع الحلقة والمحاور التي تم نقاشها..."
                      className={`text-xs leading-6 rounded-2xl ${dark ? "bg-black/50 border-white/10 text-white" : "bg-slate-50 border-black/10 text-black"}`}
                    />
                  </div>

                  {/* Cover Selector */}
                  <div className="rounded-2xl border border-current/10 p-4 space-y-3">
                    <Label className="text-xs font-black text-slate-300 block">غلاف الحلقة المرئي (Cover Artwork)</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-black/40 border border-white/10">
                        {editCoverUrl ? (
                          <img src={directDriveImage(editCoverUrl) || editCoverUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full place-items-center text-xs text-purple-400 font-bold">بدون غلاف</div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <Input
                          value={editCoverUrl || ""}
                          onChange={(e) => setEditCoverUrl(e.target.value)}
                          placeholder="رابط مباشر للغلاف أو رابط Google Drive..."
                          className={`text-xs rounded-xl ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setMediaTarget("editCover");
                              setIsMediaLibraryOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-400/30 bg-purple-400/10 text-purple-300 hover:bg-purple-400 hover:text-black px-3 py-1.5 text-xs font-black transition"
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
                        updateMutation.mutate({
                          id: selectedPodcast.id,
                          data: {
                            title: editTitle,
                            description: editDescription,
                            mediaType: editMediaType,
                            sourceType: editSourceType,
                            mediaUrl: editMediaUrl,
                            coverUrl: editCoverUrl,
                            duration: editDuration,
                            category: editCategory,
                            hostName: editHostName,
                          },
                        })
                      }
                      disabled={updateMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 text-xs font-black transition shadow-lg shadow-purple-600/30"
                    >
                      <Check size={16} />
                      <span>{updateMutation.isPending ? "جاري حفظ التعديلات..." : "حفظ التعديلات في الحلقة"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`rounded-3xl border p-12 text-center space-y-4 ${
                dark ? "border-white/10 bg-[#101010]" : "border-black/10 bg-white"
              }`}>
                <Radio className="mx-auto text-slate-500" size={40} />
                <h3 className="text-base font-black">اختر حلقة من الدليل للبدء في مراجعتها وتحريرها</h3>
                <p className="text-xs text-slate-400">يمكنك تعديل الروابط، تشغيل الحلقة تجريبياً، أو إضافة حلقات إذاعية جديدة.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Creating New Episode */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent
          className={`max-w-2xl rounded-[2.5rem] border p-6 sm:p-8 text-right shadow-2xl ${
            dark ? "border-purple-400/40 bg-[#0a0a0a] text-white" : "border-purple-600/30 bg-white text-slate-900"
          }`}
          dir="rtl"
        >
          <DialogHeader className="text-right border-b border-current/10 pb-4">
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <Mic size={18} className="text-purple-400" />
              <span>إضافة حلقة إذاعة وبودكاست جديدة</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-black text-slate-300 mb-1.5 block">عنوان الحلقة</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: حلقة 05: ريادة المستقبل والذكاء الاصطناعي..."
                className={`font-black text-sm rounded-xl ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs font-black text-slate-300 mb-1.5 block">نوع الوسائط</Label>
                <select
                  value={newMediaType}
                  onChange={(e) => setNewMediaType(e.target.value as any)}
                  className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                    dark ? "bg-black/50 border-white/10 text-white" : "bg-slate-50 border-black/10 text-black"
                  }`}
                >
                  <option value="audio" className="bg-slate-900 text-white">🎧 صوتي (Audio)</option>
                  <option value="video" className="bg-slate-900 text-white">📹 فيديو (Video)</option>
                </select>
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
                  {PODCAST_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-black text-slate-300 mb-1.5 block">المدة المقدرة</Label>
                <Input
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  placeholder="مثال: 12:30"
                  className={`text-xs rounded-xl ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-black text-slate-300 mb-1.5 block">المقدم والضيوف</Label>
                <Input
                  value={newHostName}
                  onChange={(e) => setNewHostName(e.target.value)}
                  placeholder="اسم المقدم والضيف..."
                  className={`text-xs rounded-xl ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
                />
              </div>

              <div>
                <Label className="text-xs font-black text-slate-300 mb-1.5 block">نوع المصدر</Label>
                <select
                  value={newSourceType}
                  onChange={(e) => setNewSourceType(e.target.value as any)}
                  className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                    dark ? "bg-black/50 border-white/10 text-white" : "bg-slate-50 border-black/10 text-black"
                  }`}
                >
                  <option value="direct" className="bg-slate-900 text-white">رابط مباشر (Direct URL)</option>
                  <option value="youtube" className="bg-slate-900 text-white">يوتيوب (YouTube)</option>
                  <option value="drive" className="bg-slate-900 text-white">جوجل درايف (Google Drive)</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-black text-slate-300 mb-1.5 block">رابط تشغيل الوسائط (Media URL)</Label>
              <div className="flex gap-2">
                <Input
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="https://... (رابط الفيديو أو الصوت)"
                  className={`text-xs rounded-xl font-mono ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setMediaTarget("newMedia");
                    setIsMediaLibraryOpen(true);
                  }}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition"
                >
                  <Volume2 size={14} />
                  <span>اختيار ملف</span>
                </button>
              </div>
            </div>

            <div>
              <Label className="text-xs font-black text-slate-300 mb-1.5 block">وصف ومحاور الحلقة</Label>
              <Textarea
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="نبذة عن موضوع الحلقة..."
                className={`text-xs leading-6 rounded-2xl ${dark ? "bg-black/50 border-white/10 text-white" : "bg-slate-50 border-black/10 text-black"}`}
              />
            </div>

            <div>
              <Label className="text-xs font-black text-slate-300 mb-1.5 block">غلاف الحلقة (اختياري)</Label>
              <div className="flex gap-2">
                <Input
                  value={newCoverUrl || ""}
                  onChange={(e) => setNewCoverUrl(e.target.value)}
                  placeholder="رابط صورة الغلاف..."
                  className={`text-xs rounded-xl ${dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setMediaTarget("newCover");
                    setIsMediaLibraryOpen(true);
                  }}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition"
                >
                  <ImageIcon size={14} />
                  <span>وسائط</span>
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
                إلغاء
              </Button>
              <button
                type="button"
                onClick={() => {
                  if (!newTitle.trim() || !newMediaUrl.trim()) {
                    toast.error("يرجى كتابة عنوان الحلقة ورابط الوسائط");
                    return;
                  }
                  createMutation.mutate({
                    title: newTitle,
                    description: newDescription,
                    mediaType: newMediaType,
                    sourceType: newSourceType,
                    mediaUrl: newMediaUrl,
                    coverUrl: newCoverUrl || undefined,
                    duration: newDuration,
                    category: newCategory,
                    hostName: newHostName,
                  });
                }}
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black px-6 py-2.5 text-xs transition shadow-lg shadow-purple-600/30"
              >
                <Check size={16} />
                <span>{createMutation.isPending ? "جاري النشر..." : "نشر الحلقة فوراً"}</span>
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
          if (mediaTarget === "editCover") setEditCoverUrl(item.url);
          else if (mediaTarget === "newCover") setNewCoverUrl(item.url);
          else if (mediaTarget === "editMedia") setEditMediaUrl(item.url);
          else if (mediaTarget === "newMedia") setNewMediaUrl(item.url);
          setIsMediaLibraryOpen(false);
          toast.success("تم تحديد الملف بنجاح!");
        }}
      />
    </div>
  );
}
