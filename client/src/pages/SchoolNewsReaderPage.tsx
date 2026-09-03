import { useAuth } from "@/_core/hooks/useAuth";
import SchoolNewsPager, { NewsPagerPage } from "@/components/SchoolNewsPager";
import SchoolNewsFlipbook from "@/components/SchoolNewsFlipbook";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { AlaqeeqStudioSiteFooter } from "@/components/AlaqeeqStudioSiteFooter";
import { VisualEditable, VisualIcon } from "@/components/VisualEditor";
import { getJournalIssueShareUrl } from "@/lib/journalRoutes";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { getAqeeqViewerKey } from "@/lib/aqeeqViewTracking";
import { JOURNAL_READING_OPTIONS, JournalReadingMode, normalizeJournalReadingMode } from "@/lib/journalReading";
import { normalizeJournalWatermark } from "@/lib/journalWatermark";
import { trpc } from "@/lib/trpc";
import { AqeeqReaderAudioController } from "@/components/AqeeqReaderAudioController";
import { getAqeeqDefaultBackgroundAudio } from "@/lib/aqeeqAudioPresets";
import { usePublishedHomepage } from "@/contexts/PublishedHomepageContext";
import { Archive, Loader2, Newspaper, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useSiteTheme } from "@/lib/useSiteTheme";


export default function SchoolNewsReaderPage({ slug, standalone = false }: { slug: string; standalone?: boolean }) {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { snapshot } = usePublishedHomepage();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const isPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "1";
  const { data: publicIssue, isLoading: isPublicLoading, isError: isPublicError, refetch: refetchPublic } = trpc.schoolNews.publicIssue.useQuery({ slug }, { enabled: !isPreview });
  const { data: draftIssue, isLoading: isDraftLoading, isError: isDraftError, refetch: refetchDraft } = trpc.schoolNews.issue.useQuery({ slug }, { enabled: isPreview && isAdmin });
  const recordView = trpc.schoolNews.recordView.useMutation();
  const [storedPreview] = useState(() => {
    if (!isPreview) return null;
    try {
      return JSON.parse(localStorage.getItem(`aqeeq-journal-preview:${slug}`) || "null") as Record<string, unknown> | null;
    } catch {
      return null;
    }
  });
  const issue = isPreview && isAdmin && draftIssue ? { ...draftIssue, ...(storedPreview || {}) } : publicIssue;
  const isLoading = isPreview ? isDraftLoading || !isAuthenticated : isPublicLoading;
  const isError = isPreview ? isDraftError : isPublicError;
  const refetch = () => { if (isPreview) refetchDraft(); else refetchPublic(); };
  const [readerMode, setReaderMode] = useState<JournalReadingMode>("spread");
  const { theme: readerTheme, toggleTheme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = readerTheme === "dark";

  const [flipZoom, setFlipZoom] = useState<number>(1);

  useEffect(() => {
    if (issue) {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const target = isMobile ? "scroll" : normalizeJournalReadingMode(issue.readingMode);
      setReaderMode((prev) => (prev === target ? prev : target));
    }
  }, [issue?.id, issue?.readingMode]);

  const recordedViewRef = useRef<number | null>(null);
  useEffect(() => {
    if (!issue?.id || isPreview || recordedViewRef.current === issue.id) return;
    recordedViewRef.current = issue.id;
    void recordView.mutateAsync({ id: issue.id, viewerKey: getAqeeqViewerKey() }).catch(() => undefined);
  }, [issue?.id, isPreview]);

  if (isLoading) {
    return (
      <main dir="rtl" className={`min-h-screen ${dark ? "bg-[#090b11] text-white" : "bg-white text-black"}`}>
        <AlaqeeqStudioSiteHeader title="مجلة العقيق" active="journal" />
        <div className="container py-8 animate-pulse">
          <div className="h-5 w-48 rounded-lg bg-current/10 mb-6" />
          <div className="mx-auto max-w-4xl h-[550px] rounded-3xl bg-current/5 border border-current/10" />
        </div>
      </main>
    );
  }

  if (isError && !issue) {
    return (
      <main dir="rtl" className={`min-h-screen flex flex-col justify-between ${dark ? "bg-[#090b11] text-slate-100" : "bg-[#fbfaf8] text-slate-900"}`}>
        <AlaqeeqStudioSiteHeader title="مجلة العقيق" active="journal" />
        <div className="flex flex-1 flex-col items-center justify-center py-20 px-4 text-center">
          <RotateCcw size={48} className="text-amber-400 animate-spin mb-4" />
          <h1 className={`text-2xl sm:text-3xl font-black ${dark ? "text-white" : "text-slate-900"}`}>جاري المزامنة والاتصال...</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-sm">جاري محاولة الاتصال بالخادم لجلب صفحات المجلة تلقائياً دون انقطاع.</p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => void refetch()}
              className={`px-6 py-3 rounded-xl text-xs font-black transition shadow-md active:scale-95 ${
                dark ? "bg-amber-300 text-black hover:bg-amber-400" : "bg-[#08467d] text-white hover:bg-[#06335c]"
              }`}
            >
              🔄 إعادة المحاولة الآن
            </button>
          </div>
        </div>
        <AlaqeeqStudioSiteFooter />
      </main>
    );
  }

  if (!issue) {
    return (
      <main dir="rtl" className={`min-h-screen flex flex-col justify-between ${dark ? "bg-[#090b11] text-slate-100" : "bg-[#fbfaf8] text-slate-900"}`}>
        <AlaqeeqStudioSiteHeader title="مجلة العقيق" active="journal" />
        <div className="flex flex-1 flex-col items-center justify-center py-20 px-4 text-center">
          <Newspaper size={48} className={dark ? "text-amber-300" : "text-[#08467d]"} />
          <h1 className={`mt-4 text-2xl sm:text-3xl font-black ${dark ? "text-white" : "text-slate-900"}`}>هذا العدد غير متاح حالياً</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-sm">قد يكون مسودة لم تُنشر بعد أو أن رابط النشرة غير صحيح.</p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate("/journal")}
              className={`px-5 py-3 rounded-xl text-xs font-black transition shadow-md ${
                dark ? "bg-amber-300 text-black hover:bg-amber-400" : "bg-[#08467d] text-white hover:bg-[#06335c]"
              }`}
            >
              استعراض أعداد مجلة العقيق ✦
            </button>
            <button
              onClick={() => navigate("/")}
              className={`px-5 py-3 rounded-xl text-xs font-bold border transition ${
                dark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              الرئيسية
            </button>
          </div>
        </div>
        <AlaqeeqStudioSiteFooter />
      </main>
    );
  }

  const pageHasCover = Boolean(issue.coverUrl && issue.pages.some((page) => page.imageUrl === issue.coverUrl));
  const readerPages: NewsPagerPage[] =
    issue.coverUrl && !pageHasCover
      ? [{ id: -issue.id, imageUrl: issue.coverUrl, caption: `غلاف ${issue.title}` }, ...issue.pages]
      : issue.pages;
  const shareUrl = isPreview || typeof window === "undefined" ? undefined : getJournalIssueShareUrl(window.location.origin, issue.slug);
  const isFlipbook = readerMode === "spread";
  const siteLogoUrl = snapshot?.settings.school_logo || null;
  const brandLogoUrl = issue.headerLogoUrl || siteLogoUrl;

  const watermark = normalizeJournalWatermark({
    url: issue.watermarkUrl || brandLogoUrl,
    scale: issue.watermarkScale,
    opacity: issue.watermarkOpacity,
    position: issue.watermarkPosition,
    tint: issue.watermarkTint,
  });
  const readerWatermark = {
    ...watermark,
    scale: 140,
    position: "bottom-left" as const,
    cropLeft: true,
    tint: dark ? "#ffffff" : watermark.tint,
  };

  const adjustFlipZoom = (delta: number) => {
    setFlipZoom((current) => Math.max(1, Math.min(3.5, Number((current + delta).toFixed(2)))));
  };

  return (
    <main
      dir="rtl"
      className={`aq-journal-reader-theme aq-journal-reader-theme-${readerTheme} min-h-screen transition-colors ${
        isNationalDay
          ? dark
            ? "bg-gradient-to-b from-[#00140c] via-[#002215] to-[#001008] text-white"
            : "bg-gradient-to-b from-[#f0fdf4] via-[#f7fbf9] to-[#ecfdf5] text-slate-900"
          : dark ? "bg-[#080b12] text-slate-100" : "bg-[#f5f1e7] text-slate-800"
      }`}
    >
      <AlaqeeqStudioSiteHeader title="مجلة العقيق" active="journal" logoUrl={brandLogoUrl} />

      <div className={standalone ? "mx-auto max-w-[1500px] px-3 py-3 md:px-6 md:py-6" : "container py-6"}>
        <nav className="mb-4 flex items-center justify-between gap-2 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/")} className="hover:text-current transition">الرئيسية</button>
            <span className="opacity-40">›</span>
            <button onClick={() => navigate("/journal")} className="hover:text-current transition">مجلة العقيق</button>
            <span className="opacity-40">›</span>
            <span className={dark ? "text-white truncate max-w-xs" : "text-black truncate max-w-xs"}>{issue.title}</span>
          </div>
          <button
            onClick={() => navigate("/journal")}
            className={`inline-flex items-center gap-1.5 text-xs font-black transition ${
              isNationalDay
                ? dark ? "text-emerald-300 hover:text-[#f8ca14]" : "text-[#005A36] hover:text-[#003822]"
                : "text-slate-400 hover:text-amber-300"
            }`}
          >
            <span>← عودة للأعداد</span>
          </button>
        </nav>

        {/* Master Luxury Reader Header - Exactly Matching Album Reader */}
        <header
          className={`flex flex-col gap-3 rounded-[1.65rem] border p-3 md:flex-row md:items-center md:justify-between md:p-4 ${
            isNationalDay
              ? dark
                ? "border-[#5aba1c]/40 bg-[#002617]/90 shadow-[0_15px_40px_rgba(0,50,25,0.4)] backdrop-blur-md"
                : "border-emerald-600/20 bg-white/95 shadow-md shadow-emerald-950/5 backdrop-blur-md text-slate-900"
              : dark ? "border-white/[.1] bg-[#10141f]" : "border-slate-900/10 bg-white shadow-sm"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <VisualEditable
                id="news-reader-kicker"
                tag="text"
                label="شارة قارئ المجلة"
                defaultText={`${isPreview ? "معاينة قبل النشر · " : ""}${issue.seasonLabel} · ${issue.issueDate}`}
                as="div"
                className={"text-[10px] font-black tracking-[.1em] " + (isNationalDay ? (dark ? "text-[#f8ca14]" : "text-[#005A36]") : "text-amber-300")}
              />


              <VisualEditable
                id="news-reader-header-title"
                tag="text"
                label="عنوان قارئ المجلة"
                defaultText={issue.title}
                as="h1"
                className="truncate text-lg font-black md:text-2xl"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-end w-full md:w-auto">
            {/* Zoom In & Zoom Out Buttons matching Album Reader */}
            {isFlipbook ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustFlipZoom(0.3)}
                  aria-label="تكبير الصفحة"
                  title="تكبير الصفحة (+)"
                  className={`grid h-9 w-9 place-items-center rounded-xl border transition hover:border-amber-300 hover:text-amber-200 active:scale-95 ${
                    dark ? "border-white/10 text-slate-300" : "border-slate-900/10 text-slate-600"
                  }`}
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => adjustFlipZoom(-0.3)}
                  aria-label="تصغير الصفحة"
                  title="تصغير الصفحة (-)"
                  className={`grid h-9 w-9 place-items-center rounded-xl border transition hover:border-amber-300 hover:text-amber-200 active:scale-95 ${
                    dark ? "border-white/10 text-slate-300" : "border-slate-900/10 text-slate-600"
                  }`}
                >
                  <ZoomOut size={16} />
                </button>
              </div>
            ) : null}

            {/* Audio Controller */}
            <AqeeqReaderAudioController
              audioUrl={issue.backgroundAudioUrl || getAqeeqDefaultBackgroundAudio()}
              trackTitle={issue.title}
              dark={dark}
            />

            {/* Theme Toggle Button */}
            <VisualEditable
              id="news-reader-theme-action"
              tag="button"
              label="زر مظهر قارئ المجلة"
              defaultText={dark ? "وايت مود" : "دارك مود"}
              as="button"
              onAction={toggleTheme}
              className={`grid h-9 w-9 place-items-center rounded-xl border ${
                dark ? "border-white/10 text-amber-200" : "border-slate-900/10 text-slate-600"
              }`}
            >
              <VisualIcon id="news-reader-theme-icon" label="أيقونة مظهر قارئ المجلة" icon={dark ? "sun" : "moon"} size={16} />
            </VisualEditable>

            {/* Archive / All Issues Button */}
            <VisualEditable
              id="news-reader-archive-action"
              tag="button"
              label="زر كل أعداد المجلة"
              defaultText="كل الأعداد"
              as="button"
              onAction={() => navigate("/journal")}
              className={`grid h-9 w-9 place-items-center rounded-xl border ${
                dark ? "border-white/10 text-amber-200" : "border-slate-900/10 text-slate-600"
              }`}
            >
              <VisualIcon id="news-reader-archive-icon" label="أيقونة أرشيف المجلة" icon="archive" size={16} />
            </VisualEditable>

            {/* Admin Manage Button */}
            {isAdmin ? (
              <VisualEditable
                id="news-reader-manage-action"
                tag="button"
                label="زر إدارة العدد"
                defaultText="إدارة العدد"
                as="button"
                onAction={() => navigate(`/journal/manage?issue=${issue.slug}`)}
                className={`grid h-9 w-9 place-items-center rounded-xl border ${
                  dark ? "border-white/10 text-amber-200" : "border-slate-900/10 text-slate-600"
                }`}
              >
                <VisualIcon id="news-reader-manage-icon" label="أيقونة إدارة العدد" icon="settings" size={16} />
              </VisualEditable>
            ) : null}
          </div>
        </header>

        {/* Reading Mode Toggle Navigation - Matching Album Reader */}
        <div className="mt-3 flex justify-end">
          <nav
            className={`inline-flex rounded-xl border p-1 ${
              isNationalDay
                ? "border-[#5aba1c]/30 bg-[#001f13]"
                : dark ? "border-white/10 bg-[#10141f]" : "border-slate-900/10 bg-white shadow-sm"
            }`}
            aria-label="طريقة عرض العدد"
          >
            {JOURNAL_READING_OPTIONS.map((option) => (
              <VisualEditable
                key={option.id}
                id={`news-reader-mode-${option.id}`}
                tag="button"
                label={`زر وضع قراءة ${option.title}`}
                defaultText={option.title}
                as="button"
                onAction={() => setReaderMode(option.id)}
                className={`rounded-lg px-3 py-2 text-[11px] font-black transition ${
                  readerMode === option.id
                    ? isNationalDay
                      ? "bg-gradient-to-r from-[#f8ca14] to-[#facc15] text-black font-black shadow-md"
                      : "bg-amber-300 text-slate-950"
                    : isNationalDay
                    ? "text-emerald-300 hover:text-white"
                    : dark ? "text-slate-400" : "text-slate-500"
                }`}
              />
            ))}
          </nav>

        </div>

        {/* Reader Body Section */}
        <div className="mt-4">
          {isFlipbook ? (
            <SchoolNewsFlipbook
              title={issue.title}
              kicker={`${issue.seasonLabel} · ${issue.issueDate}`}
              pages={readerPages}
              coverImageUrl={issue.coverUrl || issue.pages[0]?.imageUrl}
              watermark={readerWatermark}
              shareUrl={shareUrl}
              hideHeader={true}
              externalZoom={flipZoom}
              onZoomChange={setFlipZoom}
              onArchive={() => navigate("/journal")}
            />
          ) : (
            <SchoolNewsPager
              title={issue.title}
              kicker={`${issue.seasonLabel} · ${issue.issueDate}`}
              pages={readerPages}
              coverImageUrl={issue.coverUrl || issue.pages[0]?.imageUrl}
              shareUrl={shareUrl}
              initialMode={readerMode}
              onArchive={() => navigate("/journal")}
            />
          )}
        </div>
      </div>

      <AlaqeeqStudioSiteFooter />
    </main>
  );
}
