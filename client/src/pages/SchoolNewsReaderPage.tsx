import { useAuth } from "@/_core/hooks/useAuth";
import SchoolNewsPager, { NewsPagerPage } from "@/components/SchoolNewsPager";
import SchoolNewsFlipbook from "@/components/SchoolNewsFlipbook";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
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
import { Archive, Loader2, Newspaper, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function SchoolNewsReaderPage({ slug, standalone = false }: { slug: string; standalone?: boolean }) {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { snapshot } = usePublishedHomepage();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const isPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "1";
  const { data: publicIssue, isLoading: isPublicLoading } = trpc.schoolNews.publicIssue.useQuery({ slug }, { enabled: !isPreview });
  const { data: draftIssue, isLoading: isDraftLoading } = trpc.schoolNews.issue.useQuery({ slug }, { enabled: isPreview && isAdmin });
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
  const [readerMode, setReaderMode] = useState<JournalReadingMode>("spread");
  const { theme: readerTheme, toggleTheme } = useAqeeqStudioTheme();
  const dark = readerTheme === "dark";
  const [flipZoom, setFlipZoom] = useState<number>(1);

  useEffect(() => {
    if (issue) {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      if (isMobile) {
        setReaderMode(issue.readingMode === "single" ? "single" : "scroll");
      } else {
        setReaderMode(normalizeJournalReadingMode(issue.readingMode));
      }
    }
  }, [issue?.id, issue?.readingMode]);

  useEffect(() => {
    if (!issue?.id || isPreview) return;
    void recordView.mutateAsync({ id: issue.id, viewerKey: getAqeeqViewerKey() }).catch(() => undefined);
  }, [issue?.id, isPreview]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090b11]">
        <Loader2 className="animate-spin text-amber-300" />
      </div>
    );
  }

  if (!issue) {
    return (
      <main dir="rtl" className="flex min-h-screen flex-col items-center justify-center bg-[#090b11] text-center text-slate-100">
        <Newspaper size={36} className="text-amber-300" />
        <h1 className="mt-4 text-2xl font-black text-amber-50">هذا العدد غير متاح</h1>
        <p className="mt-2 text-sm text-slate-500">قد يكون مسودة لم تُنشر بعد أو أن رابط النشرة غير صحيح.</p>
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
        dark ? "bg-[#080b12] text-slate-100" : "bg-[#f5f1e7] text-slate-800"
      }`}
    >
      <AlaqeeqStudioSiteHeader title="مجلة العقيق" active="journal" logoUrl={brandLogoUrl} />

      <div className={standalone ? "mx-auto max-w-[1500px] px-3 py-3 md:px-6 md:py-6" : "container py-6"}>
        {!standalone ? (
          <VisualEditable
            id="news-reader-back-action"
            tag="button"
            label="زر رجوع مكتبة المجلة"
            defaultText="عودة إلى مجلة العقيق"
            as="button"
            onAction={() => navigate("/journal")}
            className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-200"
          >
            {(text) => (
              <>
                <VisualIcon id="news-reader-back-icon" label="أيقونة رجوع المجلة" icon="external" size={16} />
                {text}
              </>
            )}
          </VisualEditable>
        ) : null}

        {/* Master Luxury Reader Header - Exactly Matching Album Reader */}
        <header
          className={`flex flex-col gap-3 rounded-[1.65rem] border p-3 md:flex-row md:items-center md:justify-between md:p-4 ${
            dark ? "border-white/[.1] bg-[#10141f]" : "border-slate-900/10 bg-white shadow-sm"
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
                className="text-[10px] font-black tracking-[.1em] text-amber-300"
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
                onAction={() => navigate(`/news/manage?issue=${issue.slug}`)}
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
              dark ? "border-white/10 bg-[#10141f]" : "border-slate-900/10 bg-white shadow-sm"
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
                  readerMode === option.id ? "bg-amber-300 text-slate-950" : dark ? "text-slate-400" : "text-slate-500"
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
    </main>
  );
}
