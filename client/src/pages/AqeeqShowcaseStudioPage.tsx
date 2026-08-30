import { useAuth } from "@/_core/hooks/useAuth";
import MediaLibrary from "@/components/MediaLibrary";
import ShowcaseMediaGroupComposer, { type ShowcaseGroupMediaItem } from "@/components/ShowcaseMediaGroupComposer";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { AqeeqVideoPoster } from "@/components/AqeeqVideoPoster";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAqeeqShowcaseDisplaySource } from "@/lib/aqeeqShowcaseMedia";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { trpc } from "@/lib/trpc";
import { ArrowDown, ArrowUp, CheckCircle2, Clapperboard, Edit3, ImageIcon, Link2, Loader2, Music2, Play, Plus, RefreshCw, Settings2, Sparkles, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const SHOWCASE_SLUG = "news-offers";

type ShowcasePost = {
  id: number;
  mediaUrl: string;
  thumbnailUrl: string | null;
  fileName: string;
  mimeType: string;
  mediaType: "image" | "video";
  sourceType?: "drive" | "manual" | "x" | "instagram" | "youtube";
  externalUrl?: string | null;
  title: string | null;
  description: string | null;
  isNew: boolean;
};

type ShowcaseForm = {
  title: string;
  intro: string;
  driveFolderUrl: string;
  readerTheme: "dark" | "light";
  headerLogoUrl: string;
  backgroundAudioUrl: string;
  watermarkUrl: string;
  watermarkScale: number;
  watermarkOpacity: number;
  watermarkPosition: "center" | "top-right" | "bottom-left" | "bottom-right";
  watermarkTint: string;
};

const defaultForm: ShowcaseForm = {
  title: "الأخبار والعروض",
  intro: "كل جديد من صور وفيديوهات وأنشطة وعروض العقيق في مساحة واحدة.",
  driveFolderUrl: "",
  readerTheme: "dark",
  headerLogoUrl: "",
  backgroundAudioUrl: "",
  watermarkUrl: "",
  watermarkScale: 42,
  watermarkOpacity: 12,
  watermarkPosition: "center",
  watermarkTint: "#f8ca14",
};

function isXPost(post: ShowcasePost) {
  return post.sourceType === "x";
}

function socialPostLabel(post: ShowcasePost) {
  if (post.sourceType === "instagram") return "Instagram";
  if (post.sourceType === "youtube") return "YouTube";
  return null;
}

function PostPreview({ post }: { post: ShowcasePost }) {
  if (isXPost(post)) {
    return (
      <div className="grid h-full w-full place-items-center bg-black/40 p-4 text-center">
        <div>
          <span className="inline-grid h-10 w-10 place-items-center rounded-xl border border-white/20 bg-black/60 text-lg font-black text-white">X</span>
          <p className="mt-3 text-xs font-black">منشور من X</p>
          <p className="mt-1 text-[10px] opacity-70">يفتح من الرابط الأصلي</p>
        </div>
      </div>
    );
  }
  if (post.mediaType === "image") return <img src={getAqeeqShowcaseDisplaySource(post)} alt={post.title || post.fileName} className="h-full w-full object-cover" />;
  return (
    <AqeeqVideoPoster
      sourceUrl={post.mediaUrl}
      posterUrl={post.thumbnailUrl}
      title={post.title || post.fileName}
      playSize="compact"
    />
  );
}

export default function AqeeqShowcaseStudioPage() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [form, setForm] = useState<ShowcaseForm>(defaultForm);
  const [editingPost, setEditingPost] = useState<ShowcasePost | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [xPostUrl, setXPostUrl] = useState("");
  const [xPostTitle, setXPostTitle] = useState("");
  const [xPostDescription, setXPostDescription] = useState("");
  const [instagramPostUrl, setInstagramPostUrl] = useState("");
  const [instagramPostTitle, setInstagramPostTitle] = useState("");
  const [instagramPostDescription, setInstagramPostDescription] = useState("");
  const [youtubePostUrl, setYoutubePostUrl] = useState("");
  const [youtubePostTitle, setYoutubePostTitle] = useState("");
  const [youtubePostDescription, setYoutubePostDescription] = useState("");
  const [groupComposerOpen, setGroupComposerOpen] = useState(false);
  const [groupMediaLibraryOpen, setGroupMediaLibraryOpen] = useState(false);
  const [groupMedia, setGroupMedia] = useState<ShowcaseGroupMediaItem[]>([]);
  const [libraryField, setLibraryField] = useState<"logo" | "audio" | "watermark" | "post" | null>(null);

  const { data: showcase, isLoading } = trpc.aqeeqShowcases.showcase.useQuery(
    { slug: SHOWCASE_SLUG },
    { refetchOnWindowFocus: false, enabled: isAuthenticated && user?.role === "admin" }
  );
  const { data: issues = [] } = trpc.schoolNews.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const posts = useMemo(() => (showcase?.posts || []) as ShowcasePost[], [showcase?.posts]);

  useEffect(() => {
    if (!showcase) return;
    setForm({
      title: showcase.title,
      intro: showcase.intro || "",
      driveFolderUrl: showcase.driveFolderUrl || "",
      readerTheme: showcase.readerTheme === "light" ? "light" : "dark",
      headerLogoUrl: showcase.headerLogoUrl || "",
      backgroundAudioUrl: showcase.backgroundAudioUrl || "",
      watermarkUrl: showcase.watermarkUrl || "",
      watermarkScale: showcase.watermarkScale,
      watermarkOpacity: showcase.watermarkOpacity,
      watermarkPosition: showcase.watermarkPosition as ShowcaseForm["watermarkPosition"],
      watermarkTint: showcase.watermarkTint || "#f8ca14",
    });
  }, [showcase]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) navigate("/offers");
  }, [isAuthenticated, loading, navigate, user?.role]);

  const refresh = () => {
    void utils.aqeeqShowcases.showcase.invalidate({ slug: SHOWCASE_SLUG });
    void utils.aqeeqShowcases.list.invalidate();
    void utils.aqeeqShowcases.publicList.invalidate();
  };

  const create = trpc.aqeeqShowcases.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء صفحة الأخبار والعروض", { description: "أضف مصدر المحتوى ثم حدّث المنشورات." });
      refresh();
    },
    onError: (error) => toast.error(error.message || "تعذر إنشاء الصفحة"),
  });

  const update = trpc.aqeeqShowcases.update.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ إعدادات الأخبار والعروض");
      refresh();
    },
    onError: (error) => toast.error(error.message || "تعذر حفظ الإعدادات"),
  });

  const sync = trpc.aqeeqShowcases.syncFromDrive.useMutation({
    onSuccess: (result) => {
      toast.success(
        result.addedCount ? `تمت إضافة ${result.addedCount} منشور جديد` : "لا توجد وسائط جديدة في Drive",
        { description: result.addedCount ? "افتح المنشورات التي عليها علامة «جديد» واكتب شرحها." : "كل ما في الفولدر موجود بالفعل." }
      );
      refresh();
    },
    onError: (error) => toast.error(error.message || "تعذر تحديث المحتوى من Drive"),
  });

  const updatePost = trpc.aqeeqShowcases.updatePost.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ شرح المنشور");
      setEditingPost(null);
      refresh();
    },
    onError: (error) => toast.error(error.message || "تعذر حفظ المنشور"),
  });

  const addPosts = trpc.aqeeqShowcases.addPosts.useMutation({
    onSuccess: () => {
      toast.success("تمت إضافة الوسيط كمنشور جديد");
      refresh();
    },
    onError: (error) => toast.error(error.message || "تعذر إضافة الوسيط"),
  });

  const addMediaGroup = trpc.aqeeqShowcases.addMediaGroup.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ الخبر بكل صوره وفيديوهاته");
      setGroupMedia([]);
      setGroupComposerOpen(false);
      refresh();
    },
    onError: (error) => toast.error(error.message || "تعذر حفظ مجموعة الوسائط"),
  });

  const addXPost = trpc.aqeeqShowcases.addXPost.useMutation({
    onSuccess: (result) => {
      toast.success(result.added ? "تمت إضافة منشور X" : "المنشور موجود بالفعل", {
        description: result.added ? "راجع عنوانه ووصفه ثم احفظ وانشر." : "لن يتكرر المنشور في الخلاصة.",
      });
      setXPostUrl("");
      setXPostTitle("");
      setXPostDescription("");
      refresh();
    },
    onError: (error) => toast.error(error.message || "تعذر إضافة رابط X"),
  });

  const addSocialPost = trpc.aqeeqShowcases.addSocialPost.useMutation({
    onSuccess: (result, variables) => {
      const name = variables.source === "instagram" ? "Instagram" : "YouTube";
      toast.success(result.added ? `تمت إضافة ${name}` : "المنشور موجود بالفعل", {
        description: result.added ? "راجع عنوانه ووصفه ثم احفظ وانشر." : "لن يتكرر المنشور في الخلاصة.",
      });
      if (variables.source === "instagram") {
        setInstagramPostUrl("");
        setInstagramPostTitle("");
        setInstagramPostDescription("");
      } else {
        setYoutubePostUrl("");
        setYoutubePostTitle("");
        setYoutubePostDescription("");
      }
      refresh();
    },
    onError: (error) => toast.error(error.message || "تعذر إضافة الرابط"),
  });

  const reorder = trpc.aqeeqShowcases.reorderPosts.useMutation({ onSuccess: refresh, onError: (error) => toast.error(error.message || "تعذر ترتيب المنشورات") });
  const deletePost = trpc.aqeeqShowcases.deletePost.useMutation({ onSuccess: () => { toast.message("تم حذف المنشور"); refresh(); }, onError: (error) => toast.error(error.message || "تعذر حذف المنشور") });
  const publish = trpc.aqeeqShowcases.publish.useMutation({
    onSuccess: () => {
      toast.success("تم الحفظ والنشر بنجاح", { description: "الأخبار والعروض أصبحت متاحة للزوار ويمكنك مشاركتها الآن." });
      refresh();
    },
    onError: (error) => toast.error(error.message || "تعذر النشر"),
  });

  const saveSettings = async () => {
    if (!showcase) return;
    await update.mutateAsync({
      id: showcase.id,
      title: form.title.trim(),
      intro: form.intro.trim() || null,
      driveFolderUrl: form.driveFolderUrl.trim() || null,
      readerTheme: form.readerTheme,
      headerLogoUrl: form.headerLogoUrl || null,
      backgroundAudioUrl: form.backgroundAudioUrl || null,
      watermarkUrl: form.watermarkUrl || null,
      watermarkScale: form.watermarkScale,
      watermarkOpacity: form.watermarkOpacity,
      watermarkPosition: form.watermarkPosition,
      watermarkTint: form.watermarkTint,
    });
  };

  const addXLink = () => {
    if (!showcase || !xPostUrl.trim()) return;
    addXPost.mutate({ showcaseId: showcase.id, xPostUrl: xPostUrl.trim(), title: xPostTitle.trim() || null, description: xPostDescription.trim() || null });
  };

  const addSocialLink = (source: "instagram" | "youtube") => {
    if (!showcase) return;
    const isInstagram = source === "instagram";
    const postUrl = (isInstagram ? instagramPostUrl : youtubePostUrl).trim();
    if (!postUrl) return;
    addSocialPost.mutate({
      showcaseId: showcase.id,
      source,
      postUrl,
      title: (isInstagram ? instagramPostTitle : youtubePostTitle).trim() || null,
      description: (isInstagram ? instagramPostDescription : youtubePostDescription).trim() || null,
    });
  };

  const movePost = (index: number, direction: -1 | 1) => {
    if (!showcase) return;
    const target = index + direction;
    if (target < 0 || target >= posts.length) return;
    const ids = posts.map((post) => post.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorder.mutate({ showcaseId: showcase.id, postIds: ids });
  };

  const selectAsset = (asset: { url: string; kind: "image" | "video" | "audio" | "embed"; mimeType: string | null; fileName: string }) => {
    if (libraryField === "logo") setForm((state) => ({ ...state, headerLogoUrl: asset.url }));
    if (libraryField === "audio") setForm((state) => ({ ...state, backgroundAudioUrl: asset.url }));
    if (libraryField === "watermark") setForm((state) => ({ ...state, watermarkUrl: asset.url }));
    if (libraryField === "post" && showcase && (asset.kind === "image" || asset.kind === "video")) {
      addPosts.mutate({
        showcaseId: showcase.id,
        posts: [{ mediaUrl: asset.url, thumbnailUrl: asset.kind === "image" ? asset.url : null, fileName: asset.fileName, mimeType: asset.mimeType || (asset.kind === "image" ? "image/*" : "video/*"), mediaType: asset.kind }],
      });
    }
    setLibraryField(null);
  };

  const addGroupMediaAsset = (asset: { url: string; kind: "image" | "video" | "audio" | "embed"; mimeType: string | null; fileName: string }) => {
    if (asset.kind !== "image" && asset.kind !== "video") return;
    const mediaType: "image" | "video" = asset.kind === "image" ? "image" : "video";
    setGroupMedia((items) =>
      items.some((item) => item.mediaUrl === asset.url)
        ? items
        : [...items, { mediaUrl: asset.url, thumbnailUrl: mediaType === "image" ? asset.url : null, fileName: asset.fileName, mimeType: asset.mimeType || (mediaType === "image" ? "image/*" : "video/*"), mediaType }]
    );
  };

  const saveMediaGroup = (groupTitle: string, groupDescription: string) => {
    if (!showcase || !groupMedia.length) return;
    addMediaGroup.mutate({ showcaseId: showcase.id, title: groupTitle.trim() || null, description: groupDescription.trim() || null, media: groupMedia });
  };

  if (loading || isLoading) {
    return (
      <div className={`grid min-h-screen place-items-center ${dark ? "bg-black text-white" : "bg-white text-black"}`}>
        <Loader2 className="animate-spin text-[#f8ca14]" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") return null;

  if (!showcase) {
    return (
      <main dir="rtl" className={`min-h-screen aq-public-shell ${dark ? "bg-black text-white" : "bg-white text-black"}`}>
        <AlaqeeqStudioSiteHeader title="استوديو الأخبار والعروض" active="showcase" logoUrl={issues[0]?.headerLogoUrl} />
        <section className="mx-auto max-w-3xl px-5 py-24 text-center">
          <Sparkles className={`mx-auto ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={50} />
          <h1 className={`mt-6 text-3xl font-black ${dark ? "text-white" : "text-black"}`}>جهّز الأخبار والعروض</h1>
          <p className={`mx-auto mt-4 max-w-lg text-sm leading-8 ${dark ? "text-slate-400" : "text-slate-600"}`}>
            أنشئ الصفحة مرة واحدة، ثم اربط فولدر Drive أو أضف الوسائط مباشرة. بعد كل تحديث ستظهر الوسائط الجديدة بعلامة تذكّرك بإضافة عنوان وشرح لها.
          </p>
          <Button
            onClick={() => create.mutate({ title: defaultForm.title, slug: SHOWCASE_SLUG, intro: defaultForm.intro, driveFolderUrl: null })}
            disabled={create.isPending}
            className={`mt-7 font-black ${dark ? "!bg-[#f8ca14] !text-black hover:opacity-90" : "!bg-[#08467d] !text-white hover:opacity-90"}`}
          >
            {create.isPending ? <Loader2 className="ml-2 animate-spin" size={16} /> : <Plus className="ml-2" size={16} />}
            إنشاء صفحة الأخبار والعروض
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main dir="rtl" className={`min-h-screen aq-public-shell ${dark ? "bg-black text-white" : "bg-white text-black"}`}>
      <AlaqeeqStudioSiteHeader title="استوديو الأخبار والعروض" active="showcase" logoUrl={form.headerLogoUrl || issues[0]?.headerLogoUrl} />

      {/* Hero Header Bar */}
      <section className={`relative overflow-hidden border-b transition ${
        dark ? "border-white/[0.08] bg-black text-white" : "border-black/[0.06] bg-white text-black"
      }`}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_10%,rgba(248,202,20,0.12),transparent_25%)]" />
        <div className="relative mx-auto flex max-w-[1360px] flex-col gap-6 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-8">
          <div>
            <p className={`text-[10px] font-black tracking-[0.18em] ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
              AQEEQ STUDIO · LIVE FEED
            </p>
            <h1 className={`mt-2 text-3xl font-black md:text-4xl ${dark ? "text-white" : "text-black"}`}>
              استوديو <span className={dark ? "text-[#f8ca14]" : "text-[#08467d]"}>الأخبار والعروض.</span>
            </h1>
            <p className={`mt-3 max-w-2xl text-sm leading-8 ${dark ? "text-slate-400" : "text-slate-600"}`}>
              هنا تتحكم في الصفحة ومصدرها وكل منشور جديد قبل عرضه للزوار.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full border px-3 py-1.5 text-[11px] font-black ${
              showcase.status === "published"
                ? (dark ? "border-[#367453]/40 bg-[#367453]/15 text-[#367453]" : "border-[#367453]/30 bg-[#367453]/10 text-[#367453]")
                : (dark ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14]" : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d]")
            }`}>
              {showcase.status === "published" ? "منشور للزوار" : "مسودة — اضغط حفظ ونشر"}
            </span>
            <Button
              onClick={() => navigate("/offers")}
              variant="outline"
              className={`border font-black transition ${
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                  : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
              }`}
            >
              <Play className="ml-2" size={16} />
              معاينة الصفحة
            </Button>
            <Button
              onClick={() => void saveSettings().then(() => publish.mutateAsync({ id: showcase.id })).catch(() => undefined)}
              disabled={update.isPending || publish.isPending}
              className={`font-black shadow-lg transition active:scale-95 hover:opacity-90 ${
                dark ? "!bg-[#f8ca14] !text-black shadow-[0_0_20px_rgba(248,202,20,0.3)]" : "!bg-[#08467d] !text-white shadow-[0_0_20px_rgba(8,70,125,0.2)]"
              }`}
            >
              {publish.isPending ? <Loader2 className="ml-2 animate-spin" size={16} /> : <CheckCircle2 className="ml-2" size={16} />}
              حفظ ونشر
            </Button>
          </div>
        </div>
      </section>

      {/* 2-Column Master Grid */}
      <div className="mx-auto grid max-w-[1360px] gap-6 px-5 py-10 md:px-8 xl:grid-cols-[.78fr_1.22fr]">
        {/* Column 1: Settings & Sources */}
        <section className="space-y-6">
          {/* Settings Card */}
          <article className={`rounded-[1.6rem] border p-5 sm:p-6 transition ${
            dark ? "border-white/[0.08] bg-[#080808] text-white shadow-xl" : "border-black/[0.08] bg-white text-black shadow-md"
          }`}>
            <div className="flex items-center gap-3">
              <Settings2 className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} size={20} />
              <div>
                <h2 className={`font-black ${dark ? "text-white" : "text-black"}`}>إعدادات الصفحة</h2>
                <p className={`mt-1 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>المعلومات، طريقة العرض، الشعار، الموسيقى والعلامة المائية.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <Label className={dark ? "text-slate-200" : "text-slate-800"}>اسم الصفحة</Label>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((state) => ({ ...state, title: event.target.value }))}
                  className={`mt-2 ${dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black"}`}
                />
              </div>

              <div>
                <Label className={dark ? "text-slate-200" : "text-slate-800"}>مقدمة للزوار</Label>
                <Textarea
                  value={form.intro}
                  onChange={(event) => setForm((state) => ({ ...state, intro: event.target.value }))}
                  className={`mt-2 min-h-24 ${dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black"}`}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className={dark ? "text-slate-200" : "text-slate-800"}>وضع الصفحة</Label>
                  <select
                    value={form.readerTheme}
                    onChange={(event) => setForm((state) => ({ ...state, readerTheme: event.target.value === "light" ? "light" : "dark" }))}
                    className={`mt-2 h-10 w-full rounded-md border px-3 text-sm ${
                      dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black"
                    }`}
                  >
                    <option value="dark">بلاك مود</option>
                    <option value="light">وايت مود</option>
                  </select>
                </div>

                <div>
                  <Label className={dark ? "text-slate-200" : "text-slate-800"}>لون العلامة</Label>
                  <Input
                    type="color"
                    value={form.watermarkTint}
                    onChange={(event) => setForm((state) => ({ ...state, watermarkTint: event.target.value }))}
                    className={`mt-2 h-10 p-1 ${dark ? "border-white/15 bg-[#111111]" : "border-black/15 bg-white"}`}
                  />
                </div>
              </div>

              {/* Assets Pill selector */}
              <div className={`rounded-xl border p-3 ${dark ? "border-white/[0.08] bg-[#111111]" : "border-black/[0.08] bg-slate-50"}`}>
                <p className={`text-[11px] font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>هوية الصفحة</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {([
                    ["logo", "شعار الرأس", form.headerLogoUrl, ImageIcon],
                    ["audio", "موسيقى الخلفية", form.backgroundAudioUrl, Music2],
                    ["watermark", "العلامة المائية", form.watermarkUrl, Sparkles],
                  ] as const).map(([field, label, value, Icon]) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => setLibraryField(field)}
                      className={`rounded-lg border p-2 text-right transition ${
                        dark
                          ? "border-white/10 hover:border-[#f8ca14]/40 hover:bg-[#f8ca14]/10"
                          : "border-black/10 hover:border-[#08467d]/40 hover:bg-[#08467d]/10"
                      }`}
                    >
                      <span className={`flex items-center gap-2 text-[10px] font-black ${dark ? "text-slate-200" : "text-slate-700"}`}>
                        <Icon size={14} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
                        {label}
                      </span>
                      <span dir="ltr" className={`mt-2 block truncate text-[9px] ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        {value || "اختيار من مكتبة الوسائط"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className={dark ? "text-slate-200" : "text-slate-800"}>حجم العلامة</Label>
                  <Input
                    type="number"
                    value={form.watermarkScale}
                    onChange={(event) => setForm((state) => ({ ...state, watermarkScale: Number(event.target.value) }))}
                    className={`mt-2 ${dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black"}`}
                  />
                </div>
                <div>
                  <Label className={dark ? "text-slate-200" : "text-slate-800"}>شفافية العلامة</Label>
                  <Input
                    type="number"
                    value={form.watermarkOpacity}
                    onChange={(event) => setForm((state) => ({ ...state, watermarkOpacity: Number(event.target.value) }))}
                    className={`mt-2 ${dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black"}`}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={saveSettings}
              disabled={update.isPending}
              className={`mt-6 w-full border font-black transition ${
                dark
                  ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                  : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
              }`}
            >
              {update.isPending ? <Loader2 className="ml-2 animate-spin" size={15} /> : <CheckCircle2 className="ml-2" size={15} />}
              حفظ الإعدادات
            </Button>
          </article>

          {/* Google Drive Card */}
          <article className={`rounded-[1.6rem] border p-5 sm:p-6 transition ${
            dark ? "border-white/[0.08] bg-[#080808] text-white shadow-xl" : "border-black/[0.08] bg-white text-black shadow-md"
          }`}>
            <div className="flex items-center gap-3">
              <RefreshCw className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} size={20} />
              <div>
                <h2 className={`font-black ${dark ? "text-white" : "text-black"}`}>Google Drive</h2>
                <p className={`mt-1 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>الفولدر المثبّت الذي يضيف الصور والفيديوهات الجديدة.</p>
              </div>
            </div>

            <div className="mt-5">
              <Label className={dark ? "text-slate-200" : "text-slate-800"}>رابط فولدر Google Drive</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  value={form.driveFolderUrl}
                  onChange={(event) => setForm((state) => ({ ...state, driveFolderUrl: event.target.value }))}
                  dir="ltr"
                  placeholder="https://drive.google.com/drive/folders/..."
                  className={dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black"}
                />
                <Button
                  onClick={() => sync.mutate({ showcaseId: showcase.id, driveFolderUrl: form.driveFolderUrl.trim() })}
                  disabled={!form.driveFolderUrl.trim() || sync.isPending}
                  className={`shrink-0 font-black ${
                    dark ? "!bg-[#f8ca14] !text-black hover:opacity-90" : "!bg-[#08467d] !text-white hover:opacity-90"
                  }`}
                >
                  {sync.isPending ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                </Button>
              </div>
              <p className={`mt-3 text-[11px] leading-5 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                المصدر المثبّت الآن: <span dir="ltr" className={`font-bold ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>{showcase.driveFolderUrl || "لم يتم تثبيت فولدر بعد"}</span>
              </p>
            </div>
          </article>

          {/* Social Links Cards */}
          <article className={`rounded-[1.6rem] border p-5 sm:p-6 transition ${
            dark ? "border-white/[0.08] bg-[#080808] text-white shadow-xl" : "border-black/[0.08] bg-white text-black shadow-md"
          }`}>
            <div className="flex items-center gap-3">
              <Link2 className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} size={20} />
              <div>
                <h2 className={`font-black ${dark ? "text-white" : "text-black"}`}>منشورات السوشيال ميديا</h2>
                <p className={`mt-1 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>أضف روابط X أو Instagram أو YouTube لتظهر في خلاصة الأخبار.</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {/* X */}
              <div className={`rounded-xl border p-3 ${dark ? "border-white/[0.08] bg-[#111111]" : "border-black/[0.08] bg-slate-50"}`}>
                <p className="text-[11px] font-black">رابط من منصة X</p>
                <div className="mt-2 grid gap-2">
                  <Input
                    value={xPostUrl}
                    onChange={(event) => setXPostUrl(event.target.value)}
                    dir="ltr"
                    placeholder="https://x.com/account/status/…"
                    className={dark ? "border-white/15 bg-black text-white" : "border-black/15 bg-white text-black"}
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      value={xPostTitle}
                      onChange={(event) => setXPostTitle(event.target.value)}
                      placeholder="عنوان اختياري"
                      className={dark ? "border-white/15 bg-black text-white" : "border-black/15 bg-white text-black"}
                    />
                    <Input
                      value={xPostDescription}
                      onChange={(event) => setXPostDescription(event.target.value)}
                      placeholder="وصف اختياري"
                      className={dark ? "border-white/15 bg-black text-white" : "border-black/15 bg-white text-black"}
                    />
                  </div>
                  <Button
                    onClick={addXLink}
                    disabled={!xPostUrl.trim() || addXPost.isPending}
                    className={`mt-1 font-black ${
                      dark ? "bg-white/[0.08] text-white hover:bg-white/[0.15]" : "bg-slate-200 text-black hover:bg-slate-300"
                    }`}
                  >
                    {addXPost.isPending ? <Loader2 className="ml-2 animate-spin" size={15} /> : <Link2 className="ml-2" size={15} />}
                    إضافة منشور X
                  </Button>
                </div>
              </div>

              {/* Instagram */}
              <div className={`rounded-xl border p-3 ${dark ? "border-white/[0.08] bg-[#111111]" : "border-black/[0.08] bg-slate-50"}`}>
                <p className="text-[11px] font-black">رابط Instagram</p>
                <div className="mt-2 grid gap-2">
                  <Input
                    value={instagramPostUrl}
                    onChange={(event) => setInstagramPostUrl(event.target.value)}
                    dir="ltr"
                    placeholder="https://www.instagram.com/p/… أو /reel/…"
                    className={dark ? "border-white/15 bg-black text-white" : "border-black/15 bg-white text-black"}
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      value={instagramPostTitle}
                      onChange={(event) => setInstagramPostTitle(event.target.value)}
                      placeholder="عنوان اختياري"
                      className={dark ? "border-white/15 bg-black text-white" : "border-black/15 bg-white text-black"}
                    />
                    <Input
                      value={instagramPostDescription}
                      onChange={(event) => setInstagramPostDescription(event.target.value)}
                      placeholder="وصف اختياري"
                      className={dark ? "border-white/15 bg-black text-white" : "border-black/15 bg-white text-black"}
                    />
                  </div>
                  <Button
                    onClick={() => addSocialLink("instagram")}
                    disabled={!instagramPostUrl.trim() || addSocialPost.isPending}
                    className={`mt-1 font-black ${
                      dark ? "bg-white/[0.08] text-white hover:bg-white/[0.15]" : "bg-slate-200 text-black hover:bg-slate-300"
                    }`}
                  >
                    {addSocialPost.isPending ? <Loader2 className="ml-2 animate-spin" size={15} /> : <Link2 className="ml-2" size={15} />}
                    إضافة رابط Instagram
                  </Button>
                </div>
              </div>

              {/* YouTube */}
              <div className={`rounded-xl border p-3 ${dark ? "border-white/[0.08] bg-[#111111]" : "border-black/[0.08] bg-slate-50"}`}>
                <p className="text-[11px] font-black">رابط YouTube</p>
                <div className="mt-2 grid gap-2">
                  <Input
                    value={youtubePostUrl}
                    onChange={(event) => setYoutubePostUrl(event.target.value)}
                    dir="ltr"
                    placeholder="https://www.youtube.com/watch?v=…"
                    className={dark ? "border-white/15 bg-black text-white" : "border-black/15 bg-white text-black"}
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      value={youtubePostTitle}
                      onChange={(event) => setYoutubePostTitle(event.target.value)}
                      placeholder="عنوان اختياري"
                      className={dark ? "border-white/15 bg-black text-white" : "border-black/15 bg-white text-black"}
                    />
                    <Input
                      value={youtubePostDescription}
                      onChange={(event) => setYoutubePostDescription(event.target.value)}
                      placeholder="وصف اختياري"
                      className={dark ? "border-white/15 bg-black text-white" : "border-black/15 bg-white text-black"}
                    />
                  </div>
                  <Button
                    onClick={() => addSocialLink("youtube")}
                    disabled={!youtubePostUrl.trim() || addSocialPost.isPending}
                    className={`mt-1 font-black ${
                      dark ? "bg-white/[0.08] text-white hover:bg-white/[0.15]" : "bg-slate-200 text-black hover:bg-slate-300"
                    }`}
                  >
                    {addSocialPost.isPending ? <Loader2 className="ml-2 animate-spin" size={15} /> : <Link2 className="ml-2" size={15} />}
                    إضافة رابط YouTube
                  </Button>
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* Column 2: Items Queue */}
        <section className={`rounded-[1.6rem] border p-5 sm:p-6 transition ${
          dark ? "border-white/[0.08] bg-[#080808] text-white shadow-xl" : "border-black/[0.08] bg-white text-black shadow-md"
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`text-[10px] font-black tracking-[0.18em] ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                POSTS QUEUE
              </p>
              <h2 className={`mt-1 text-2xl font-black ${dark ? "text-white" : "text-black"}`}>المنشورات</h2>
              <p className={`mt-1 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                أي منشور عليه «جديد» يحتاج منك عنوانًا وشرحًا قبل اعتماد محتواه.
              </p>
            </div>
            <Button
              onClick={() => setLibraryField("post")}
              variant="outline"
              className={`border font-black transition ${
                dark
                  ? "border-[#f8ca14]/35 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                  : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
              }`}
            >
              <Upload className="ml-2" size={16} />
              إضافة مباشرة
            </Button>
          </div>

          <div className="mt-6 space-y-3">
            {posts.length ? (
              posts.map((post, index) => (
                <article
                  key={post.id}
                  className={`group grid gap-3 rounded-2xl border p-3 sm:grid-cols-[150px_1fr_auto] transition ${
                    dark ? "border-white/[0.08] bg-[#111111] text-white" : "border-black/[0.08] bg-slate-50 text-black"
                  }`}
                >
                  <div className="relative h-32 overflow-hidden rounded-xl bg-slate-900">
                    <PostPreview post={post} />
                    {post.mediaType === "video" && !socialPostLabel(post) ? (
                      <span className="absolute inset-0 grid place-items-center bg-black/25 text-white">
                        <Play size={22} fill="currentColor" />
                      </span>
                    ) : null}
                  </div>

                  <div className="min-w-0 py-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {post.isNew ? (
                        <span className="rounded-full border border-[#367453]/40 bg-[#367453]/15 px-2 py-1 text-[9px] font-black text-[#367453]">
                          جديد — أضف شرحه
                        </span>
                      ) : (
                        <span className={`rounded-full border px-2 py-1 text-[9px] font-black ${
                          dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
                        }`}>
                          تمت المراجعة
                        </span>
                      )}
                      <span className={`text-[10px] font-bold ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        {socialPostLabel(post) || (post.sourceType === "x" ? "X" : post.mediaType === "video" ? "فيديو" : "صورة")}
                      </span>
                    </div>

                    <h3 className={`mt-3 truncate font-black ${dark ? "text-white" : "text-black"}`}>
                      {post.title || post.fileName.replace(/\.[^.]+$/, "")}
                    </h3>
                    <p className={`mt-1 line-clamp-2 text-xs leading-6 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                      {post.description || "لا يوجد شرح بعد — افتح تعديل المنشور وأضف الكلام الذي يشرح الصورة أو الفيديو."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 sm:flex-col sm:justify-center">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setEditingPost(post);
                        setPostTitle(post.title || "");
                        setPostDescription(post.description || "");
                      }}
                      className={`border ${
                        dark
                          ? "border-[#f8ca14]/30 text-[#f8ca14] hover:bg-[#f8ca14]/10"
                          : "border-[#08467d]/25 text-[#08467d] hover:bg-[#08467d]/10"
                      }`}
                    >
                      <Edit3 size={15} />
                    </Button>
                    <div className="flex sm:flex-col">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => movePost(index, -1)}
                        disabled={index === 0 || reorder.isPending}
                        className={dark ? "text-slate-400 hover:text-[#f8ca14]" : "text-slate-500 hover:text-[#08467d]"}
                      >
                        <ArrowUp size={15} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => movePost(index, 1)}
                        disabled={index === posts.length - 1 || reorder.isPending}
                        className={dark ? "text-slate-400 hover:text-[#f8ca14]" : "text-slate-500 hover:text-[#08467d]"}
                      >
                        <ArrowDown size={15} />
                      </Button>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("هل تريد حذف هذا المنشور؟")) deletePost.mutate({ id: post.id });
                      }}
                      className="text-[#de191e] hover:bg-[#de191e]/10"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <div className={`rounded-2xl border border-dashed p-12 text-center ${
                dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.02]" : "border-[#08467d]/20 bg-[#08467d]/[0.02]"
              }`}>
                <Clapperboard className={`mx-auto ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={38} />
                <p className={`mt-4 font-black ${dark ? "text-white" : "text-black"}`}>لا توجد منشورات بعد</p>
                <p className={`mt-2 text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  أدخل رابط Drive ثم اضغط تحديث، أو أضف صورة أو فيديو مباشرة من مكتبة الوسائط.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Floating Action */}
      <button
        type="button"
        onClick={() => {
          setGroupMedia([]);
          setGroupComposerOpen(true);
        }}
        className={`fixed bottom-5 left-5 z-30 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-black shadow-2xl transition active:scale-95 hover:opacity-90 ${
          dark ? "!bg-[#f8ca14] !text-black shadow-[0_0_20px_rgba(248,202,20,0.3)]" : "!bg-[#08467d] !text-white shadow-[0_0_20px_rgba(8,70,125,0.2)]"
        }`}
      >
        <Upload size={16} />
        منشور متعدد الوسائط
      </button>

      {/* Modals & Dialogs */}
      <MediaLibrary
        open={Boolean(libraryField)}
        onClose={() => setLibraryField(null)}
        onSelect={selectAsset}
        accept={libraryField === "audio" ? "audio" : libraryField === "post" ? "all" : "image"}
      />
      <MediaLibrary
        open={groupMediaLibraryOpen}
        onClose={() => setGroupMediaLibraryOpen(false)}
        onSelect={addGroupMediaAsset}
        accept="all"
      />
      <ShowcaseMediaGroupComposer
        open={groupComposerOpen}
        items={groupMedia}
        pending={addMediaGroup.isPending}
        onOpenChange={setGroupComposerOpen}
        onAddMedia={() => setGroupMediaLibraryOpen(true)}
        onRemove={(index) => setGroupMedia((items) => items.filter((_, itemIndex) => itemIndex !== index))}
        onMove={(index, direction) =>
          setGroupMedia((items) => {
            const target = index + direction;
            if (target < 0 || target >= items.length) return items;
            const next = [...items];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
          })
        }
        onSave={saveMediaGroup}
      />

      <Dialog open={Boolean(editingPost)} onOpenChange={(open) => { if (!open) setEditingPost(null); }}>
        <DialogContent dir="rtl" className={`border p-6 ${
          dark ? "border-[#f8ca14]/30 bg-[#080808] text-white" : "border-black/10 bg-white text-black"
        }`}>
          <DialogHeader>
            <DialogTitle className={`text-right font-black ${dark ? "text-white" : "text-black"}`}>شرح المنشور</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className={dark ? "text-slate-200" : "text-slate-800"}>عنوان المنشور</Label>
              <Input
                value={postTitle}
                onChange={(event) => setPostTitle(event.target.value)}
                placeholder="مثال: تكريم طلاب العقيق"
                className={`mt-2 ${dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black"}`}
              />
            </div>
            <div>
              <Label className={dark ? "text-slate-200" : "text-slate-800"}>الكلام الذي يشرح الصورة أو الفيديو</Label>
              <Textarea
                value={postDescription}
                onChange={(event) => setPostDescription(event.target.value)}
                placeholder="اكتب وصفًا واضحًا للزوار…"
                className={`mt-2 min-h-36 ${dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black"}`}
              />
            </div>
            <Button
              onClick={() =>
                editingPost &&
                updatePost.mutate({
                  id: editingPost.id,
                  title: postTitle.trim() || null,
                  description: postDescription.trim() || null,
                  isNew: false,
                })
              }
              disabled={updatePost.isPending}
              className={`w-full font-black ${
                dark ? "!bg-[#f8ca14] !text-black hover:opacity-90" : "!bg-[#08467d] !text-white hover:opacity-90"
              }`}
            >
              {updatePost.isPending ? <Loader2 className="ml-2 animate-spin" size={16} /> : <CheckCircle2 className="ml-2" size={16} />}
              حفظ واعتماد المنشور
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
