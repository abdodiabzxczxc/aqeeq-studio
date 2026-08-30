import { useAuth } from "@/_core/hooks/useAuth";
import JournalPdfImporter from "@/components/JournalPdfImporter";
import MediaLibrary from "@/components/MediaLibrary";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { JOURNAL_READING_OPTIONS, normalizeJournalReadingMode } from "@/lib/journalReading";
import { DEFAULT_JOURNAL_SEASON_LABEL, normalizeJournalSeasonLabel } from "@/lib/journalSeasonLabel";
import { AqeeqAudioManagerField } from "@/components/AqeeqAudioManagerField";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { trpc } from "@/lib/trpc";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  CloudDownload,
  Edit3,
  FilePlus2,
  FileText,
  ImageIcon,
  ImagePlus,
  Loader2,
  Music2,
  Play,
  Plus,
  RefreshCw,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type MediaChoice = { url: string; fileName: string; storageKey?: string };
type Target = "cover" | "add" | "replace" | "watermark" | "headerLogo" | "audio" | null;
const today = () => new Date().toISOString().slice(0, 10);

export default function JournalStudioPage() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [location, navigate] = useLocation();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const utils = trpc.useUtils();

  const { data: issues = [], isLoading } = trpc.schoolNews.list.useQuery(undefined, {
    enabled: isAdmin,
    refetchOnWindowFocus: false,
  });
  const defaultsQuery = trpc.schoolNews.studioDefaults.useQuery(undefined, {
    enabled: isAdmin,
    refetchOnWindowFocus: false,
  });

  const [slug, setSlug] = useState<string | null>(null);
  const { data: issue } = trpc.schoolNews.issue.useQuery(
    { slug: slug || "__none" },
    { enabled: Boolean(slug), refetchOnWindowFocus: false }
  );

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("النشرة الأسبوعية");
  const [newDate, setNewDate] = useState(today());
  const [newDescription, setNewDescription] = useState("");
  const [newSeasonLabel, setNewSeasonLabel] = useState(DEFAULT_JOURNAL_SEASON_LABEL);
  const [newMode, setNewMode] = useState<"spread" | "scroll">("spread");
  const [newDriveUrl, setNewDriveUrl] = useState("");
  const [newBackgroundAudioUrl, setNewBackgroundAudioUrl] = useState<string | null>(null);

  const [pageId, setPageId] = useState<number | null>(null);
  const [target, setTarget] = useState<Target>(null);
  const [editingPage, setEditingPage] = useState<{ id: number; caption: string } | null>(null);

  const [title, setTitle] = useState("النشرة الأسبوعية");
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState("");
  const [driveFolderUrl, setDriveFolderUrl] = useState("");
  const [seasonLabel, setSeasonLabel] = useState(DEFAULT_JOURNAL_SEASON_LABEL);
  const [mode, setMode] = useState<"spread" | "scroll">("spread");
  const [headerLogoUrl, setHeaderLogoUrl] = useState<string | null>(null);
  const [backgroundAudioUrl, setBackgroundAudioUrl] = useState<string | null>(null);
  const [watermarkUrl, setWatermarkUrl] = useState<string | null>(null);
  const [watermarkScale, setWatermarkScale] = useState(42);
  const [watermarkOpacity, setWatermarkOpacity] = useState(12);
  const [watermarkPosition, setWatermarkPosition] = useState<"center" | "top-right" | "bottom-left" | "bottom-right">("center");
  const [watermarkTint, setWatermarkTint] = useState("#f8ca14");

  const refresh = () => {
    void utils.schoolNews.list.invalidate();
    void utils.schoolNews.issue.invalidate();
    void utils.schoolNews.publicList.invalidate();
  };

  useEffect(() => {
    const requested = new URLSearchParams(location.split("?")[1] || "").get("issue");
    if (requested && requested !== slug) {
      setSlug(requested);
    } else if (!requested && issues.length > 0 && !slug) {
      setSlug(issues[0].slug);
    }
  }, [location, slug, issues]);

  useEffect(() => {
    if (!slug) return;
    const requested = new URLSearchParams(location.split("?")[1] || "").get("issue");
    if (requested !== slug) navigate("/journal/manage?issue=" + slug, { replace: true });
  }, [location, navigate, slug]);

  useEffect(() => {
    if (!issue) return;
    setTitle(issue.title);
    setDate(issue.issueDate);
    setDescription(issue.description || "");
    setDriveFolderUrl(issue.driveFolderUrl || "");
    setSeasonLabel(normalizeJournalSeasonLabel(issue.seasonLabel));
    const normalizedMode = normalizeJournalReadingMode(issue.readingMode);
    setMode(normalizedMode === "scroll" ? "scroll" : "spread");
    setHeaderLogoUrl(issue.headerLogoUrl || null);
    setBackgroundAudioUrl(issue.backgroundAudioUrl || null);
    setWatermarkUrl(issue.watermarkUrl || null);
    setWatermarkScale(issue.watermarkScale ?? 42);
    setWatermarkOpacity(issue.watermarkOpacity ?? 12);
    setWatermarkPosition((issue.watermarkPosition as "center" | "top-right" | "bottom-left" | "bottom-right") || "center");
    setWatermarkTint(issue.watermarkTint || "#f8ca14");
    setPageId((current) =>
      issue.pages.some((page) => page.id === current) ? current : issue.pages[0]?.id || null
    );
  }, [issue]);

  const activePage = useMemo(
    () => issue?.pages.find((page) => page.id === pageId) || issue?.pages[0],
    [issue, pageId]
  );

  const create = trpc.schoolNews.create.useMutation({
    onSuccess: (created) => {
      toast.success("تم إنشاء العدد بنجاح");
      setCreateDialogOpen(false);
      setSlug(created.slug);
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const update = trpc.schoolNews.update.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ إعدادات العدد");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const saveDefaults = trpc.schoolNews.saveStudioDefaults.useMutation({
    onError: (error) => toast.error(error.message),
  });

  const addPages = trpc.schoolNews.addPages.useMutation({
    onSuccess: () => {
      toast.success("أضيفت الصفحات بنجاح");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const importFromDrive = trpc.schoolNews.importFromDrive.useMutation({
    onSuccess: (pages) => {
      toast.success("تمت إضافة " + pages.length + " صفحة من Drive");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const updatePage = trpc.schoolNews.updatePage.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ تعديل الصفحة");
      setEditingPage(null);
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const setCover = trpc.schoolNews.setCover.useMutation({
    onSuccess: () => {
      toast.success("تم تعيين الغلاف");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const reorder = trpc.schoolNews.reorderPages.useMutation({
    onSuccess: refresh,
    onError: (error) => toast.error(error.message),
  });

  const deletePage = trpc.schoolNews.deletePage.useMutation({
    onSuccess: () => {
      toast.message("حُذفت الصفحة");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const publish = trpc.schoolNews.publish.useMutation({
    onSuccess: () => {
      toast.success("تم الحفظ والنشر بنجاح", {
        description: "العدد أصبح متاحًا للزوار على رف المجلة.",
      });
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const removeIssue = trpc.schoolNews.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف العدد");
      setSlug(null);
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const chooseMedia = (asset: MediaChoice) => {
    if (!issue || !target) return;
    if (target === "cover") setCover.mutate({ issueId: issue.id, imageUrl: asset.url, imageStorageKey: asset.storageKey || null });
    if (target === "add") addPages.mutate({ issueId: issue.id, pages: [{ imageUrl: asset.url, imageStorageKey: asset.storageKey, caption: asset.fileName }] });
    if (target === "replace" && activePage) updatePage.mutate({ id: activePage.id, imageUrl: asset.url, imageStorageKey: asset.storageKey || null });
    if (target === "watermark") {
      setWatermarkUrl(asset.url);
      update.mutate({ id: issue.id, watermarkUrl: asset.url });
      toast.success("تم تحديث العلامة المائية فورًا");
    }
    if (target === "headerLogo") setHeaderLogoUrl(asset.url);
    if (target === "audio") setBackgroundAudioUrl(asset.url);
    setTarget(null);
  };

  const saveIssue = async () => {
    if (!issue) return;
    const defaults = {
      readingMode: mode,
      headerLogoUrl,
      backgroundAudioUrl,
      watermarkUrl,
      watermarkScale,
      watermarkOpacity,
      watermarkPosition: watermarkPosition as "center" | "top-right" | "bottom-left" | "bottom-right",
      watermarkTint,
    };
    await update.mutateAsync({
      id: issue.id,
      title,
      issueDate: date,
      description,
      driveFolderUrl: driveFolderUrl.trim() || null,
      seasonLabel: normalizeJournalSeasonLabel(seasonLabel),
      ...defaults,
    });
    await saveDefaults.mutateAsync(defaults);
  };

  const openPreview = () => {
    if (!issue) return;
    window.open("/journal/" + issue.slug, "_blank", "noopener");
  };

  const movePage = (index: number, direction: -1 | 1) => {
    if (!issue) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= issue.pages.length) return;
    const ids = issue.pages.map((p) => p.id);
    [ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]];
    reorder.mutate({ issueId: issue.id, pageIds: ids });
  };

  if (authLoading || isLoading) {
    return (
      <div className={"grid min-h-screen place-items-center " + (dark ? "bg-black text-white" : "bg-white text-black")}>
        <Loader2 className="animate-spin text-[#f8ca14]" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <main dir="rtl" className={"min-h-screen aq-public-shell " + (dark ? "bg-black text-white" : "bg-white text-black")}>
      <AlaqeeqStudioSiteHeader title="استوديو مجلة العقيق" active="journal" logoUrl={headerLogoUrl || issues[0]?.headerLogoUrl} />

      {/* Hero Header Bar */}
      <section className={"relative overflow-hidden border-b transition " + (
        dark ? "border-white/[0.08] bg-black text-white" : "border-black/[0.06] bg-white text-black"
      )}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_10%,rgba(248,202,20,0.12),transparent_25%)]" />
        <div className="relative mx-auto flex max-w-[1360px] flex-col gap-6 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-8">
          <div>
            <p className={"text-[10px] font-black tracking-[0.18em] " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")}>
              AQEEQ STUDIO · JOURNAL DESK
            </p>
            <h1 className={"mt-2 text-3xl font-black md:text-4xl " + (dark ? "text-white" : "text-black")}>
              استوديو <span className={dark ? "text-[#f8ca14]" : "text-[#08467d]"}>مجلة العقيق.</span>
            </h1>
            <p className={"mt-3 max-w-2xl text-sm leading-8 " + (dark ? "text-slate-400" : "text-slate-600")}>
              إدارة الأعداد الدورية، ترتيب الصفحات، الاستيراد التلقائي من Drive أو PDF ونشر المحتوى.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Issue Selector Dropdown */}
            {issues.length > 0 ? (
              <select
                value={slug || ""}
                onChange={(e) => setSlug(e.target.value)}
                className={"h-10 rounded-xl border px-3 text-xs font-black transition " + (
                  dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black shadow-sm"
                )}
              >
                {issues.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.title} ({item.issueDate})
                  </option>
                ))}
              </select>
            ) : null}

            <Button
              onClick={() => setCreateDialogOpen(true)}
              variant="outline"
              className={"border font-black transition " + (
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                  : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
              )}
            >
              <FilePlus2 className="ml-2" size={16} />
              عدد جديد
            </Button>

            {issue ? (
              <>
                <span className={"rounded-full border px-3 py-1.5 text-[11px] font-black " + (
                  issue.status === "published"
                    ? (dark ? "border-[#367453]/40 bg-[#367453]/15 text-[#367453]" : "border-[#367453]/30 bg-[#367453]/10 text-[#367453]")
                    : (dark ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14]" : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d]")
                )}>
                  {issue.status === "published" ? "منشور للزوار" : "مسودة — اضغط حفظ ونشر"}
                </span>

                <Button
                  onClick={openPreview}
                  variant="outline"
                  className={"border font-black transition " + (
                    dark
                      ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                      : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
                  )}
                >
                  <Play className="ml-2" size={16} />
                  معاينة
                </Button>

                <Button
                  onClick={() => void saveIssue().then(() => publish.mutateAsync({ id: issue.id }))}
                  disabled={!issue.pages.length || publish.isPending || update.isPending}
                  className={"font-black shadow-lg transition active:scale-95 hover:opacity-90 " + (
                    dark ? "!bg-[#f8ca14] !text-black shadow-[0_0_20px_rgba(248,202,20,0.3)]" : "!bg-[#08467d] !text-white shadow-[0_0_20px_rgba(8,70,125,0.2)]"
                  )}
                >
                  {publish.isPending || update.isPending ? <Loader2 className="ml-2 animate-spin" size={16} /> : <CheckCircle2 className="ml-2" size={16} />}
                  حفظ ونشر
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {issue ? (
        <div className="mx-auto grid max-w-[1360px] gap-6 px-5 py-10 md:px-8 xl:grid-cols-[.78fr_1.22fr]">
          {/* Column 1: Settings & Sources */}
          <section className="space-y-6">
            {/* Issue Settings Card */}
            <article className={"rounded-[1.6rem] border p-5 sm:p-6 transition " + (
              dark ? "border-white/[0.08] bg-[#080808] text-white shadow-xl" : "border-black/[0.08] bg-white text-black shadow-md"
            )}>
              <div className="flex items-center gap-3">
                <Settings2 className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} size={20} />
                <div>
                  <h2 className={"font-black " + (dark ? "text-white" : "text-black")}>إعدادات العدد</h2>
                  <p className={"mt-1 text-xs " + (dark ? "text-slate-400" : "text-slate-500")}>
                    العنوان، التاريخ، الموسم، طريقة العرض، والهوية.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <Label className={dark ? "text-slate-200" : "text-slate-800"}>عنوان العدد</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className={dark ? "text-slate-200" : "text-slate-800"}>تاريخ الإصدار</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
                    />
                  </div>

                  <div>
                    <Label className={dark ? "text-slate-200" : "text-slate-800"}>اسم الموسم</Label>
                    <Input
                      value={seasonLabel}
                      onChange={(e) => setSeasonLabel(e.target.value)}
                      className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
                    />
                  </div>
                </div>

                <div>
                  <Label className={dark ? "text-slate-200" : "text-slate-800"}>وصف العدد</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={"mt-2 min-h-20 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
                  />
                </div>

                {/* Reading mode selection */}
                <div>
                  <Label className={dark ? "text-slate-200" : "text-slate-800"}>طريقة القراءة والتصفح</Label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {JOURNAL_READING_OPTIONS.filter((o) => o.id === "spread" || o.id === "scroll").map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setMode(option.id as "spread" | "scroll")}
                        className={"rounded-xl border p-2.5 text-right transition " + (
                          mode === option.id
                            ? (dark ? "border-[#f8ca14] bg-[#f8ca14]/15 text-[#f8ca14]" : "border-[#08467d] bg-[#08467d]/10 text-[#08467d]")
                            : (dark ? "border-white/10 text-slate-400 hover:border-white/20" : "border-black/10 text-slate-600 hover:border-black/20")
                        )}
                      >
                        <p className="text-xs font-black">{option.title}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Audio Manager */}
                <AqeeqAudioManagerField
                  value={backgroundAudioUrl}
                  onChange={setBackgroundAudioUrl}
                  dark={dark}
                  label="موسيقى وخلفية العدد الصوتية"
                />

                {/* Reader Branding & Watermark */}
                <div className={"rounded-xl border p-3 " + (dark ? "border-white/[0.08] bg-[#111111]" : "border-black/[0.08] bg-slate-50")}>
                  <p className={"text-[11px] font-black " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")}>هوية القارئ والعلامة المائية</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {([
                      ["headerLogo", "شعار الرأس", headerLogoUrl, ImageIcon],
                      ["watermark", "العلامة المائية", watermarkUrl, Sparkles],
                    ] as const).map(([field, label, value, Icon]) => (
                      <button
                        key={field}
                        type="button"
                        onClick={() => setTarget(field as Target)}
                        className={"rounded-lg border p-2 text-right transition " + (
                          dark
                            ? "border-white/10 hover:border-[#f8ca14]/40 hover:bg-[#f8ca14]/10"
                            : "border-black/10 hover:border-[#08467d]/40 hover:bg-[#08467d]/10"
                        )}
                      >
                        <span className={"flex items-center gap-2 text-[10px] font-black " + (dark ? "text-slate-200" : "text-slate-700")}>
                          <Icon size={14} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
                          {label}
                        </span>
                        <span dir="ltr" className={"mt-2 block truncate text-[9px] " + (dark ? "text-slate-400" : "text-slate-500")}>
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
                      value={watermarkScale}
                      onChange={(e) => setWatermarkScale(Number(e.target.value))}
                      className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
                    />
                  </div>
                  <div>
                    <Label className={dark ? "text-slate-200" : "text-slate-800"}>شفافية العلامة</Label>
                    <Input
                      type="number"
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                      className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={saveIssue}
                disabled={update.isPending}
                className={"mt-6 w-full border font-black transition " + (
                  dark
                    ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                    : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
                )}
              >
                {update.isPending ? <Loader2 className="ml-2 animate-spin" size={15} /> : <CheckCircle2 className="ml-2" size={15} />}
                حفظ الإعدادات
              </Button>
            </article>

            {/* Google Drive Sync Card */}
            <article className={"rounded-[1.6rem] border p-5 sm:p-6 transition " + (
              dark ? "border-white/[0.08] bg-[#080808] text-white shadow-xl" : "border-black/[0.08] bg-white text-black shadow-md"
            )}>
              <div className="flex items-center gap-3">
                <RefreshCw className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} size={20} />
                <div>
                  <h2 className={"font-black " + (dark ? "text-white" : "text-black")}>Google Drive</h2>
                  <p className={"mt-1 text-xs " + (dark ? "text-slate-400" : "text-slate-500")}>
                    استيراد صور صفحات العدد مباشرة من فولدر Google Drive.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <Label className={dark ? "text-slate-200" : "text-slate-800"}>رابط فولدر Google Drive للصور</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    value={driveFolderUrl}
                    onChange={(e) => setDriveFolderUrl(e.target.value)}
                    dir="ltr"
                    placeholder="https://drive.google.com/drive/folders/..."
                    className={dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black"}
                  />
                  <Button
                    onClick={() => importFromDrive.mutate({ issueId: issue.id, driveFolderUrl })}
                    disabled={!driveFolderUrl.trim() || importFromDrive.isPending}
                    className={"shrink-0 font-black " + (
                      dark ? "!bg-[#f8ca14] !text-black hover:opacity-90" : "!bg-[#08467d] !text-white hover:opacity-90"
                    )}
                  >
                    {importFromDrive.isPending ? <Loader2 className="animate-spin" size={16} /> : <CloudDownload size={16} />}
                  </Button>
                </div>
              </div>
            </article>

            {/* PDF Importer Card */}
            <article className={"rounded-[1.6rem] border p-5 sm:p-6 transition " + (
              dark ? "border-white/[0.08] bg-[#080808] text-white shadow-xl" : "border-black/[0.08] bg-white text-black shadow-md"
            )}>
              <div className="flex items-center gap-3">
                <FileText className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} size={20} />
                <div>
                  <h2 className={"font-black " + (dark ? "text-white" : "text-black")}>استيراد ملف PDF</h2>
                  <p className={"mt-1 text-xs " + (dark ? "text-slate-400" : "text-slate-500")}>
                    رفع كتيب أو مجلة PDF وتحويل صفحاتها تلقائياً للعدد.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <JournalPdfImporter
                  issueId={issue.id}
                  onImported={(pages) => addPages.mutate({ issueId: issue.id, pages })}
                />
              </div>
            </article>

            {/* Delete Issue Danger Action */}
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm("هل أنت متأكد من حذف هذا العدد بالكامل بكل صفحاته؟")) {
                  removeIssue.mutate({ id: issue.id, confirm: true });
                }
              }}
              className="w-full border-red-500/30 text-[#de191e] hover:bg-[#de191e]/10 font-black"
            >
              <Trash2 className="ml-2" size={16} />
              حذف العدد بالكامل
            </Button>
          </section>

          {/* Column 2: Pages Queue */}
          <section className={"rounded-[1.6rem] border p-5 sm:p-6 transition " + (
            dark ? "border-white/[0.08] bg-[#080808] text-white shadow-xl" : "border-black/[0.08] bg-white text-black shadow-md"
          )}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className={"text-[10px] font-black tracking-[0.18em] " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")}>
                  PAGES QUEUE
                </p>
                <h2 className={"mt-1 text-2xl font-black " + (dark ? "text-white" : "text-black")}>
                  صفحات العدد ({issue.pages.length})
                </h2>
                <p className={"mt-1 text-xs " + (dark ? "text-slate-400" : "text-slate-500")}>
                  الصفحة الأولى تكون دائماً هي غلاف العدد في الرف والصفحة الرئيسية.
                </p>
              </div>

              <Button
                onClick={() => setTarget("add")}
                variant="outline"
                className={"border font-black transition " + (
                  dark
                    ? "border-[#f8ca14]/35 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                    : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
                )}
              >
                <ImagePlus className="ml-2" size={16} />
                إضافة صفحة
              </Button>
            </div>

            <div className="mt-6 space-y-3">
              {issue.pages.length ? (
                issue.pages.map((page, index) => (
                  <article
                    key={page.id}
                    className={"group grid gap-3 rounded-2xl border p-3 sm:grid-cols-[120px_1fr_auto] transition " + (
                      dark ? "border-white/[0.08] bg-[#111111] text-white" : "border-black/[0.08] bg-slate-50 text-black"
                    )}
                  >
                    <div className="relative aspect-[1/1.4] overflow-hidden rounded-xl bg-slate-900 border border-white/10">
                      <img src={page.imageUrl} alt={page.caption || ""} className="h-full w-full object-cover" />
                      {index === 0 ? (
                        <span className="absolute bottom-1 right-1 rounded bg-[#f8ca14] px-1.5 py-0.5 text-[8px] font-black text-black">
                          الغلاف
                        </span>
                      ) : null}
                    </div>

                    <div className="min-w-0 py-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={"rounded-full border px-2 py-0.5 text-[9px] font-black " + (
                          index === 0
                            ? (dark ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14]" : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d]")
                            : (dark ? "border-white/15 bg-white/5 text-slate-300" : "border-black/10 bg-white text-slate-700")
                        )}>
                          {index === 0 ? "غلاف العدد الرئيسي" : "صفحة رقم " + (index + 1)}
                        </span>
                      </div>

                      <p className={"mt-2 font-black truncate text-sm " + (dark ? "text-white" : "text-black")}>
                        {page.caption || ("صفحة " + (index + 1))}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {index !== 0 ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCover.mutate({ issueId: issue.id, imageUrl: page.imageUrl, imageStorageKey: page.imageStorageKey || null })}
                            className="h-7 text-[10px] font-bold"
                          >
                            تعيين كغلاف
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPageId(page.id);
                            setTarget("replace");
                          }}
                          className="h-7 text-[10px] font-bold"
                        >
                          استبدال الصورة
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:flex-col sm:justify-center">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setEditingPage({ id: page.id, caption: page.caption || "" })}
                        className={"border " + (
                          dark
                            ? "border-[#f8ca14]/30 text-[#f8ca14] hover:bg-[#f8ca14]/10"
                            : "border-[#08467d]/25 text-[#08467d] hover:bg-[#08467d]/10"
                        )}
                      >
                        <Edit3 size={15} />
                      </Button>
                      <div className="flex sm:flex-col">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => movePage(index, -1)}
                          disabled={index === 0 || reorder.isPending}
                          className={dark ? "text-slate-400 hover:text-[#f8ca14]" : "text-slate-500 hover:text-[#08467d]"}
                        >
                          <ArrowUp size={15} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => movePage(index, 1)}
                          disabled={index === issue.pages.length - 1 || reorder.isPending}
                          className={dark ? "text-slate-400 hover:text-[#f8ca14]" : "text-slate-500 hover:text-[#08467d]"}
                        >
                          <ArrowDown size={15} />
                        </Button>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("هل تريد حذف هذه الصفحة؟")) deletePage.mutate({ id: page.id });
                        }}
                        className="text-[#de191e] hover:bg-[#de191e]/10"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </article>
                ))
              ) : (
                <div className={"rounded-2xl border border-dashed p-12 text-center " + (
                  dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.02]" : "border-[#08467d]/20 bg-[#08467d]/[0.02]"
                )}>
                  <BookOpen className={"mx-auto " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")} size={38} />
                  <p className={"mt-4 font-black " + (dark ? "text-white" : "text-black")}>لا توجد صفحات في هذا العدد بعد</p>
                  <p className={"mt-2 text-sm " + (dark ? "text-slate-400" : "text-slate-500")}>
                    استورد من فولدر Drive أو ارفع ملف PDF أو أضف صور الصفحات مباشرة.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <section className="mx-auto max-w-2xl px-5 py-24 text-center">
          <BookOpen className={"mx-auto " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")} size={48} />
          <h2 className={"mt-4 text-2xl font-black " + (dark ? "text-white" : "text-black")}>
            لا توجد أعداد منشورة أو قيد التجهيز
          </h2>
          <p className={"mt-2 text-sm " + (dark ? "text-slate-400" : "text-slate-600")}>
            ابدأ بإنشاء أول عدد لمجلة العقيق، وحدد مصدر الصفحات من Drive أو PDF.
          </p>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className={"mt-6 font-black " + (dark ? "!bg-[#f8ca14] !text-black" : "!bg-[#08467d] !text-white")}
          >
            <Plus className="ml-2" size={16} />
            إنشاء أول عدد
          </Button>
        </section>
      )}

      {/* Floating Action */}
      {issue ? (
        <button
          type="button"
          onClick={() => setTarget("add")}
          className={"fixed bottom-5 left-5 z-30 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-black shadow-2xl transition active:scale-95 hover:opacity-90 " + (
            dark ? "!bg-[#f8ca14] !text-black shadow-[0_0_20px_rgba(248,202,20,0.3)]" : "!bg-[#08467d] !text-white shadow-[0_0_20px_rgba(8,70,125,0.2)]"
          )}
        >
          <Upload size={16} />
          إضافة صفحة
        </button>
      ) : null}

      {/* Create Issue Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent dir="rtl" className={"border p-6 max-w-xl " + (
          dark ? "border-[#f8ca14]/30 bg-[#080808] text-white" : "border-black/10 bg-white text-black"
        )}>
          <DialogHeader>
            <DialogTitle className={"text-right font-black " + (dark ? "text-white" : "text-black")}>
              إنشاء عدد جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className={dark ? "text-slate-200" : "text-slate-800"}>عنوان العدد</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: النشرة الأسبوعية - الأسبوع الرابع"
                className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className={dark ? "text-slate-200" : "text-slate-800"}>التاريخ</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
                />
              </div>
              <div>
                <Label className={dark ? "text-slate-200" : "text-slate-800"}>شارة الموسم</Label>
                <Input
                  value={newSeasonLabel}
                  onChange={(e) => setNewSeasonLabel(e.target.value)}
                  className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
                />
              </div>
            </div>
            <div>
              <Label className={dark ? "text-slate-200" : "text-slate-800"}>رابط فولدر Google Drive (اختياري)</Label>
              <Input
                value={newDriveUrl}
                onChange={(e) => setNewDriveUrl(e.target.value)}
                dir="ltr"
                placeholder="https://drive.google.com/drive/folders/..."
                className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
              />
            </div>
            <div>
              <Label className={dark ? "text-slate-200" : "text-slate-800"}>الوصف</Label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="وصف مختصر للعدد…"
                className={"mt-2 min-h-20 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
              />
            </div>
            <AqeeqAudioManagerField
              value={newBackgroundAudioUrl}
              onChange={setNewBackgroundAudioUrl}
              dark={dark}
              label="الموسيقى والخلفية الصوتية للعدد (اختياري)"
            />
            <Button
              onClick={() =>
                create.mutate({
                  title: newTitle,
                  slug: "issue-" + newDate.replaceAll("-", "") + "-" + Math.random().toString(36).slice(2, 6),
                  issueDate: newDate,
                  description: newDescription || undefined,
                  driveFolderUrl: newDriveUrl.trim() || null,
                  seasonLabel: normalizeJournalSeasonLabel(newSeasonLabel),
                  readingMode: newMode,
                  headerLogoUrl: null,
                  backgroundAudioUrl: newBackgroundAudioUrl,
                  watermarkUrl: null,
                  watermarkScale: 42,
                  watermarkOpacity: 12,
                  watermarkPosition: "center",
                  watermarkTint: "#f8ca14",
                })
              }
              disabled={create.isPending}
              className={"w-full font-black " + (
                dark ? "!bg-[#f8ca14] !text-black hover:opacity-90" : "!bg-[#08467d] !text-white hover:opacity-90"
              )}
            >
              {create.isPending ? <Loader2 className="ml-2 animate-spin" size={16} /> : <CheckCircle2 className="ml-2" size={16} />}
              إنشاء وفتح لوحة العمل
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Page Caption Dialog */}
      <Dialog open={Boolean(editingPage)} onOpenChange={(open) => { if (!open) setEditingPage(null); }}>
        <DialogContent dir="rtl" className={"border p-6 " + (
          dark ? "border-[#f8ca14]/30 bg-[#080808] text-white" : "border-black/10 bg-white text-black"
        )}>
          <DialogHeader>
            <DialogTitle className={"text-right font-black " + (dark ? "text-white" : "text-black")}>
              تعديل وصف الصفحة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className={dark ? "text-slate-200" : "text-slate-800"}>وصف أو عنوان الصفحة</Label>
              <Input
                value={editingPage?.caption || ""}
                onChange={(e) => setEditingPage((prev) => prev ? { ...prev, caption: e.target.value } : null)}
                placeholder="مثال: كلمة مدير المدارس"
                className={"mt-2 " + (dark ? "border-white/15 bg-[#111111] text-white" : "border-black/15 bg-white text-black")}
              />
            </div>
            <Button
              onClick={() =>
                editingPage &&
                updatePage.mutate({
                  id: editingPage.id,
                  caption: editingPage.caption || null,
                })
              }
              disabled={updatePage.isPending}
              className={"w-full font-black " + (
                dark ? "!bg-[#f8ca14] !text-black hover:opacity-90" : "!bg-[#08467d] !text-white hover:opacity-90"
              )}
            >
              {updatePage.isPending ? <Loader2 className="ml-2 animate-spin" size={16} /> : <CheckCircle2 className="ml-2" size={16} />}
              حفظ التعديل
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MediaLibrary
        open={target !== null}
        onClose={() => setTarget(null)}
        accept={target === "audio" ? "audio" : "image"}
        onSelect={chooseMedia}
      />
    </main>
  );
}
