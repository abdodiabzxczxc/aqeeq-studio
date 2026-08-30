import { useAuth } from "@/_core/hooks/useAuth";
import SchoolNewsPager, { NewsPagerPage } from "@/components/SchoolNewsPager";
import SchoolNewsFlipbook from "@/components/SchoolNewsFlipbook";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { VisualEditable, VisualIcon } from "@/components/VisualEditor";
import { getJournalIssueShareUrl } from "@/lib/journalRoutes";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { getAqeeqViewerKey } from "@/lib/aqeeqViewTracking";
import { JOURNAL_READING_OPTIONS, JournalReadingMode, normalizeJournalReadingMode } from "@/lib/journalReading";
import { toggleJournalReaderTheme } from "@/lib/journalTheme";
import { normalizeJournalWatermark } from "@/lib/journalWatermark";
import { trpc } from "@/lib/trpc";
import { AqeeqReaderAudioController } from "@/components/AqeeqReaderAudioController";
import { usePublishedHomepage } from "@/contexts/PublishedHomepageContext";
import { Archive, ArrowRight, Loader2, Moon, Newspaper, Settings2, Sun, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const [storedPreview] = useState(() => { if (!isPreview) return null; try { return JSON.parse(localStorage.getItem(`aqeeq-journal-preview:${slug}`) || "null") as Record<string, unknown> | null; } catch { return null; } });
  const issue = isPreview && isAdmin && draftIssue ? { ...draftIssue, ...(storedPreview || {}) } : publicIssue;
  const isLoading = isPreview ? isDraftLoading || !isAuthenticated : isPublicLoading;
  const [readerMode, setReaderMode] = useState<JournalReadingMode>("spread");
  const { theme: readerTheme, toggleTheme } = useAqeeqStudioTheme();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (issue) setReaderMode(normalizeJournalReadingMode(issue.readingMode));
  }, [issue?.id, issue?.readingMode]);

  useEffect(() => {
    if (!issue?.id || isPreview) return;
    void recordView.mutateAsync({ id: issue.id, viewerKey: getAqeeqViewerKey() }).catch(() => undefined);
  }, [issue?.id, isPreview]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !issue?.backgroundAudioUrl) return;
    audio.volume = .38;
    void audio.play().then(() => setSoundEnabled(true)).catch(() => setSoundEnabled(false));
  }, [issue?.id, issue?.backgroundAudioUrl]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#090b11]"><Loader2 className="animate-spin text-amber-300" /></div>;
  if (!issue) return <main dir="rtl" className="flex min-h-screen flex-col items-center justify-center bg-[#090b11] text-center text-slate-100"><Newspaper size={36} className="text-amber-300" /><h1 className="mt-4 text-2xl font-black text-amber-50">هذا العدد غير متاح</h1><p className="mt-2 text-sm text-slate-500">قد يكون مسودة لم تُنشر بعد أو أن رابط النشرة غير صحيح.</p></main>;

  const pageHasCover = Boolean(issue.coverUrl && issue.pages.some((page) => page.imageUrl === issue.coverUrl));
  const readerPages: NewsPagerPage[] = issue.coverUrl && !pageHasCover ? [{ id: -issue.id, imageUrl: issue.coverUrl, caption: `غلاف ${issue.title}` }, ...issue.pages] : issue.pages;
  const shareUrl = isPreview || typeof window === "undefined" ? undefined : getJournalIssueShareUrl(window.location.origin, issue.slug);
  const isFlipbook = readerMode === "spread";
  const siteLogoUrl = snapshot?.settings.school_logo || null;
  const brandLogoUrl = issue.headerLogoUrl || siteLogoUrl;

  const watermark = normalizeJournalWatermark({ url: issue.watermarkUrl || brandLogoUrl, scale: issue.watermarkScale, opacity: issue.watermarkOpacity, position: issue.watermarkPosition, tint: issue.watermarkTint });
  const readerWatermark = { ...watermark, scale: 140, position: "bottom-left" as const, cropLeft: true, tint: readerTheme === "dark" ? "#ffffff" : watermark.tint };
  const unifiedHeader = (
    <header className="aq-unified-reader-header" style={{ overflow: "visible" }}>
      <div className="aq-unified-reader-identity">
        <div className="aq-unified-reader-copy">
          <VisualEditable id="news-reader-kicker" tag="text" label="شارة قارئ المجلة" defaultText={`${isPreview ? "معاينة قبل النشر · " : ""}${issue.seasonLabel} · ${issue.issueDate}`} as="div" className="aq-unified-reader-kicker" />
          <VisualEditable id="news-reader-header-title" tag="text" label="عنوان قارئ المجلة" defaultText={issue.title} as="h1" className="aq-unified-reader-title" />
        </div>
      </div>
      <div className="aq-unified-reader-actions">
        {issue.backgroundAudioUrl ? (
          <AqeeqReaderAudioController
            audioUrl={issue.backgroundAudioUrl}
            trackTitle={issue.title}
            dark={readerTheme === "dark"}
          />
        ) : null}
        <VisualEditable id="news-reader-theme-action" tag="button" label="زر مظهر قارئ المجلة" defaultText={readerTheme === "dark" ? "تشغيل وايت مود" : "تشغيل دارك مود"} as="button" onAction={toggleTheme} className="aq-unified-reader-icon">
          <VisualIcon id="news-reader-theme-icon" label="أيقونة مظهر قارئ المجلة" icon={readerTheme === "dark" ? "sun" : "moon"} size={16} />
        </VisualEditable>
        <VisualEditable id="news-reader-archive-action" tag="button" label="زر كل أعداد المجلة" defaultText="كل الأعداد" as="button" onAction={() => navigate("/journal")} className="aq-unified-reader-icon">
          <VisualIcon id="news-reader-archive-icon" label="أيقونة أرشيف المجلة" icon="menu" size={16} />
        </VisualEditable>
        {isAdmin ? (
          <VisualEditable id="news-reader-manage-action" tag="button" label="زر إدارة العدد" defaultText="إدارة العدد" as="button" onAction={() => navigate(`/news/manage?issue=${issue.slug}`)} className="aq-unified-reader-icon">
            <VisualIcon id="news-reader-manage-icon" label="أيقونة إدارة العدد" icon="menu" size={16} />
          </VisualEditable>
        ) : null}
      </div>
    </header>
  );

  return (
    <main dir="rtl" className={`aq-journal-reader-theme aq-journal-reader-theme-${readerTheme} min-h-screen text-slate-100`}>
      <AlaqeeqStudioSiteHeader title="مجلة العقيق" active="journal" logoUrl={brandLogoUrl} />
      <div className={standalone ? "mx-auto max-w-[1500px] px-3 py-3 md:px-6 md:py-6" : "container py-6"}>
        {!standalone ? (
          <VisualEditable id="news-reader-back-action" tag="button" label="زر رجوع مكتبة المجلة" defaultText="عودة إلى مجلة العقيق" as="button" onAction={() => navigate("/journal")} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-200">
            {(text) => <><VisualIcon id="news-reader-back-icon" label="أيقونة رجوع المجلة" icon="external" size={16} />{text}</>}
          </VisualEditable>
        ) : null}
        <VisualEditable id="news-reader-shell" tag="section" label="إطار قارئ العدد" as="section" className="rounded-[2rem]">
          <VisualEditable id="news-reader-page-title" tag="text" label="عنوان العدد في القارئ" as="h1" defaultText={issue.title} className="sr-only" />
          {unifiedHeader}
          <nav className="aq-reader-mode-switch" aria-label="طريقة عرض العدد">
            {JOURNAL_READING_OPTIONS.map((option) => (
              <VisualEditable key={option.id} id={`news-reader-mode-${option.id}`} tag="button" label={`زر وضع قراءة ${option.title}`} defaultText={option.title} as="button" onAction={() => setReaderMode(option.id)} className={readerMode === option.id ? "is-active" : ""} />
            ))}
          </nav>
          {isFlipbook ? (
            <SchoolNewsFlipbook
              title={issue.title}
              kicker={`${issue.seasonLabel} · ${issue.issueDate}`}
              pages={readerPages}
              coverImageUrl={issue.coverUrl || issue.pages[0]?.imageUrl}
              watermark={readerWatermark}
              shareUrl={shareUrl}
              backgroundAudioUrl={issue.backgroundAudioUrl}
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
        </VisualEditable>
      </div>
    </main>
  );
}
