import { useAuth } from "@/_core/hooks/useAuth";
import { AqeeqArchiveControls } from "@/components/AqeeqArchiveControls";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { AlaqeeqStudioSiteFooter } from "@/components/AlaqeeqStudioSiteFooter";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { searchAndSortAqeeqContent, type AqeeqSortOption } from "@/lib/aqeeqArchiveControls";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { trpc } from "@/lib/trpc";
import { ArrowUpLeft, BookOpen, CalendarDays, ChevronLeft, FolderArchive, Layers, Loader2, Newspaper, Settings2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { AqeeqLuxuryPageShell } from "@/components/AqeeqLuxuryPageShell";
import { AqeeqGrandFinaleCta } from "@/components/AqeeqGrandFinaleCta";
import { useMagneticTilt, staggerContainer, fadeUpSpring } from "@/lib/motionPresets";
import { motion } from "framer-motion";

type NewsIssue = {
  id: number;
  title: string;
  slug: string;
  issueDate: string;
  coverUrl: string | null;
  description: string | null;
  seasonLabel: string;
  status: "draft" | "published";
  pageCount: number;
  viewCount?: number;
  headerLogoUrl?: string | null;
};

const monthName = (key: string) => {
  try {
    return new Date(`${key}-01T12:00:00`).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
    });
  } catch {
    return key;
  }
};

function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const id =
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/)?.[1];
  return id ? `/api/drive-proxy/${id}` : url;
}

function IssueCard({
  issue,
  index,
  onOpen,
  dark,
}: {
  issue: NewsIssue;
  index: number;
  onOpen: () => void;
  dark: boolean;
}) {
  const { isNationalDay } = useSiteTheme();
  const { ref, tilt, onMove, onLeave } = useMagneticTilt(8);

  return (
    <motion.article
      variants={fadeUpSpring}
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.15s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.3s ease, border-color 0.3s ease",
      }}
      className={`group relative overflow-hidden rounded-[2.2rem] border p-4 transition duration-300 md:p-6 backdrop-blur-2xl will-change-transform ${
        isNationalDay
          ? dark ? "snd-bento-card-dark text-white hover:border-emerald-500/50 hover:shadow-[0_24px_60px_rgba(0,90,54,0.35)]" : "snd-bento-card-light text-slate-900 hover:border-emerald-500/40"
          : dark
          ? "border-white/[0.08] bg-[#0c1017]/85 text-white shadow-[0_24px_60px_rgba(0,0,0,0.6)] hover:border-[#f8ca14]/60 hover:shadow-[0_24px_70px_rgba(248,202,20,0.22)]"
          : "border-black/[0.06] bg-white/90 text-black shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-[#08467d]/40 hover:shadow-[0_20px_50px_rgba(8,70,125,0.15)]"
      }`}
    >
      {/* Specular glare following cursor */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-[2.2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.14) 0%, transparent 60%)`,
        }}
      />
      <div className="relative flex h-full flex-col gap-5 sm:flex-row">
        {/* Magazine Cover Preview Container */}
        <button
          onClick={onOpen}
          className={`relative min-h-[160px] sm:min-h-[220px] w-full overflow-hidden rounded-[1.5rem] border text-right sm:w-[45%] ${
            isNationalDay
              ? dark ? "border-emerald-500/20 bg-[#001c10]" : "border-emerald-500/15 bg-emerald-50/50"
              : dark ? "border-white/[0.08] bg-[#0c0c0c]" : "border-black/[0.06] bg-[#f8f8f8]"
          }`}
          aria-label={`قراءة ${issue.title}`}
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

            {issue.coverUrl ? (
              <VisualImage
                id={`journal-card-back-cover-${issue.id}`}
                label="صورة خلفية بطاقة المجلة"
                src={directDriveImage(issue.coverUrl) || issue.coverUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>

          {/* Front cover — full on mobile, partial on desktop */}
          <div
            className={`absolute inset-1 sm:bottom-[6%] sm:right-[10%] sm:top-[6%] sm:w-[60%] sm:inset-auto overflow-hidden rounded-[1rem] border p-0 sm:p-1.5 shadow-xl ${
              isNationalDay
                ? dark ? "border-[#f8ca14] bg-[#001f13] shadow-[0_12px_30px_rgba(0,90,54,0.5)]" : "border-emerald-600/50 bg-white"
                : dark ? "border-[#f8ca14]/60 bg-[#141414]" : "border-[#08467d]/40 bg-white"
            }`}
            style={{ transform: "rotate(0deg)" }}
          >
            {issue.coverUrl ? (
              <VisualImage
                id={`journal-card-cover-${issue.id}`}
                label="غلاف بطاقة المجلة"
                src={directDriveImage(issue.coverUrl) || issue.coverUrl}
                alt={`غلاف ${issue.title}`}
                className="h-full w-full rounded-[.7rem] object-cover"
              />
            ) : (
              <div className={`grid h-full place-items-center ${dark ? "bg-[#161616] text-[#f8ca14]" : isNationalDay ? "bg-emerald-50 text-[#005A36]" : "bg-slate-100 text-[#08467d]"}`}>
                <Newspaper size={34} />
              </div>
            )}
          </div>
        </button>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              isNationalDay
                ? dark ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14]" : "border-emerald-600/30 bg-emerald-50 text-[#005A36]"
                : dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
            }`}>
              <BookOpen size={18} />
            </div>
            <p className={`pt-1 text-left text-[9px] font-black tracking-[.18em] ${
              isNationalDay ? (dark ? "text-[#f8ca14]" : "text-[#005A36]") : (dark ? "text-[#f8ca14]" : "text-[#08467d]")
            }`}>
              {isNationalDay ? "NATIONAL ISSUE" : "ISSUE"} · {String(index + 1).padStart(2, "0")}
            </p>
          </div>

          <VisualEditable
            id={`journal-card-title-${issue.id}`}
            tag="text"
            label="عنوان العدد"
            defaultText={issue.title}
            as="h3"
            className={`mt-4 text-2xl font-black ${dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black"}`}
          />

          <VisualEditable
            id={`journal-card-description-${issue.id}`}
            tag="text"
            label="وصف العدد"
            defaultText={
              issue.description ||
              "عدد أسبوعي من مجلة العقيق، يوثق أنشطة وفعاليات مدارس العقيق بتجربة قراءة تفاعلية."
            }
            as="p"
            className={`mt-3 text-sm leading-7 ${dark ? "text-slate-400" : isNationalDay ? "text-emerald-950/80" : "text-slate-600"}`}
          />

          <div className={`mt-auto flex items-end justify-between gap-3 border-t pt-4 ${
            isNationalDay ? (dark ? "border-[#5aba1c]/20" : "border-emerald-500/15") : (dark ? "border-white/[0.08]" : "border-black/[0.08]")
          }`}>
            <div>
              <b className={`block text-xl font-black ${dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black"}`}>
                {String(issue.pageCount || 0).padStart(2, "0")}
              </b>
              <span className={`text-[9px] font-black tracking-[.16em] ${isNationalDay ? (dark ? "text-[#5aba1c]" : "text-emerald-700") : (dark ? "text-slate-500" : "text-slate-400")}`}>
                PAGES
              </span>
            </div>

            <span className={`inline-flex items-center gap-1 text-[10px] font-black ${dark ? "text-slate-400" : isNationalDay ? "text-emerald-800/80" : "text-slate-500"}`}>
              <CalendarDays size={13} />
              {issue.issueDate}
            </span>

            <button
              onClick={onOpen}
              className={`inline-flex items-center gap-2 text-xs font-black transition ${
                isNationalDay
                  ? dark ? "text-[#f8ca14] hover:text-[#5aba1c]" : "text-[#005A36] hover:text-[#003822]"
                  : dark ? "text-[#f8ca14] hover:opacity-80" : "text-[#08467d] hover:opacity-80"
              }`}
            >
              اقرأ العدد <ArrowUpLeft size={15} />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function SchoolNewsPage() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const { isNationalDay } = useSiteTheme();
  const { user, isAuthenticated } = useAuth();

  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<AqeeqSortOption>("newest");
  const isAdmin = isAuthenticated && user?.role === "admin";

  const { data: issues = [], isLoading } = trpc.schoolNews.publicList.useQuery(
    undefined,
    { refetchOnWindowFocus: false }
  );
  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(
    undefined,
    { refetchOnMount: true, staleTime: 0 }
  );

  const visibleIssues = useMemo(
    () => searchAndSortAqeeqContent(issues, searchQuery, sort) as NewsIssue[],
    [issues, searchQuery, sort]
  );

  const featuredIssue = useMemo(() => {
    if (orchestration?.heroCovers?.journalMode === "custom" && orchestration?.heroCovers?.customJournalIssueId) {
      const found = issues.find((i) => i.id === orchestration.heroCovers.customJournalIssueId);
      if (found) return found as NewsIssue;
    }
    return issues[0] as NewsIssue | undefined;
  }, [issues, orchestration?.heroCovers]);

  const secondIssue = useMemo(() => {
    if (!featuredIssue) return undefined;
    if (orchestration?.heroCovers?.journalSecondaryIssueId) {
      const found = issues.find((i) => i.id === orchestration.heroCovers.journalSecondaryIssueId);
      if (found) return found as NewsIssue;
    }
    return issues.find((i) => i.id !== featuredIssue.id) as NewsIssue | undefined;
  }, [issues, featuredIssue, orchestration?.heroCovers?.journalSecondaryIssueId]);

  const monthGroups = useMemo(() => {
    const map = new Map<string, NewsIssue[]>();
    issues.forEach((issue) => {
      const key = issue.issueDate.slice(0, 7);
      map.set(key, [...(map.get(key) || []), issue as NewsIssue]);
    });
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [issues]);

  const totalPages = issues.reduce(
    (total, issue) => total + Number(issue.pageCount || 0),
    0
  );

  if (isLoading) {
    return (
      <AqeeqLuxuryPageShell
        header={<AlaqeeqStudioSiteHeader title="مجلة العقيق" active="journal" />}
      >
        {/* Skeleton Hero */}
        <section className={`border-b py-12 px-5 sm:px-8 animate-pulse ${dark ? "border-white/10 bg-[#080808]" : "border-black/5 bg-slate-50"}`}>
          <div className="mx-auto grid max-w-[1440px] items-center gap-8 md:grid-cols-[1fr_1.1fr]">
            <div className={`h-[320px] md:h-[420px] rounded-[2rem] ${dark ? "bg-white/5" : "bg-slate-200"}`} />
            <div className="space-y-4">
              <div className={`h-6 w-36 rounded-full ${dark ? "bg-white/10" : "bg-slate-200"}`} />
              <div className={`h-10 w-3/4 rounded-2xl ${dark ? "bg-white/10" : "bg-slate-200"}`} />
              <div className={`h-4 w-full rounded-lg ${dark ? "bg-white/5" : "bg-slate-200"}`} />
              <div className={`h-4 w-2/3 rounded-lg ${dark ? "bg-white/5" : "bg-slate-200"}`} />
              <div className="flex gap-3 pt-4">
                <div className={`h-10 w-36 rounded-xl ${dark ? "bg-white/10" : "bg-slate-200"}`} />
                <div className={`h-10 w-36 rounded-xl ${dark ? "bg-white/5" : "bg-slate-100"}`} />
              </div>
            </div>
          </div>
        </section>
        {/* Skeleton Cards Grid */}
        <section className="mx-auto max-w-[1440px] px-5 sm:px-8 py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`rounded-[2rem] border p-5 animate-pulse space-y-4 ${dark ? "border-white/10 bg-[#0c0c0c]" : "border-black/5 bg-slate-50"}`}>
                <div className={`h-44 rounded-[1.5rem] ${dark ? "bg-white/5" : "bg-slate-200"}`} />
                <div className={`h-5 w-3/4 rounded-lg ${dark ? "bg-white/10" : "bg-slate-200"}`} />
                <div className={`h-3 w-1/2 rounded-md ${dark ? "bg-white/5" : "bg-slate-200"}`} />
              </div>
            ))}
          </div>
        </section>
      </AqeeqLuxuryPageShell>
    );
  }

  return (
    <AqeeqLuxuryPageShell
      header={
        <AlaqeeqStudioSiteHeader
          title="مجلة العقيق"
          active="journal"
          logoUrl={featuredIssue?.headerLogoUrl}
        />
      }
      footer={<AlaqeeqStudioSiteFooter />}
      useCurtain={Boolean(featuredIssue)}
      curtainKicker="✦ استكشف صحيفة ومجلة العقيق ✦"
      hero={
        featuredIssue ? (
          /* Hero Section */
          <section className={`relative isolate overflow-hidden border-b ${
            isNationalDay
              ? dark ? "snd-hero-dark border-emerald-500/25 text-white" : "snd-hero-light border-emerald-200/80 text-slate-900"
              : dark ? "border-white/[0.08] bg-black text-white" : "border-black/[0.06] bg-white text-black"
          }`}>
            {isNationalDay ? (
              <>
                <div className="pointer-events-none absolute inset-0 snd-pattern-watermark opacity-60" />
                <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[450px] w-[min(800px,100vw)] rounded-full bg-gradient-to-b from-[#005A36]/40 via-[#5aba1c]/10 to-transparent blur-[120px] national-ambient-breath" />
              </>
            ) : (
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_18%,rgba(248,202,20,0.12),transparent_25%)]" />
            )}

            <div className="relative mx-auto grid max-w-[1440px] items-center gap-8 px-5 py-12 md:grid-cols-[1fr_1.1fr] md:px-8 md:py-16 lg:gap-16">
              {/* Cover perspective on left in RTL */}
              <div className="relative order-2 mx-auto h-[360px] w-full max-w-[580px] md:order-1 md:h-[470px]">
                {secondIssue ? (
                  <button
                    onClick={() => navigate(`/journal/${secondIssue.slug}`)}
                    className={`absolute left-[4%] top-[5%] h-[80%] w-[58%] overflow-hidden rounded-[1.7rem] border p-2 opacity-65 shadow-2xl ${
                      isNationalDay
                        ? dark ? "border-emerald-500/20 bg-[#001c10]" : "border-emerald-500/20 bg-white"
                        : dark ? "border-white/[0.1] bg-[#111111]" : "border-black/[0.08] bg-[#f0f0f0]"
                    }`}
                    style={{ transform: "rotate(-7deg)" }}
                    aria-label={`العدد السابق: ${secondIssue.title}`}
                  >
                    {secondIssue.coverUrl ? (
                      <VisualImage
                        id={`journal-hero-previous-cover-${secondIssue.id}`}
                        label="غلاف العدد السابق"
                        src={directDriveImage(secondIssue.coverUrl) || secondIssue.coverUrl}
                        alt=""
                        className="h-full w-full rounded-[1.2rem] object-cover"
                      />
                    ) : null}
                  </button>
                ) : null}

                <button
                  onClick={() => navigate(`/journal/${featuredIssue.slug}`)}
                  className={`group absolute bottom-1 right-[5%] h-[90%] w-[68%] overflow-hidden rounded-[1.85rem] border p-2 shadow-2xl ${
                    isNationalDay
                      ? dark
                        ? "border-[#f8ca14]/70 bg-[#001f13] shadow-[0_20px_50px_rgba(0,90,54,0.4)]"
                        : "border-emerald-500/50 bg-white shadow-[0_20px_50px_rgba(0,90,54,0.15)]"
                      : dark ? "border-[#f8ca14]/50 bg-[#111111]" : "border-[#08467d]/30 bg-white"
                  }`}
                  style={{ transform: "rotate(3deg)" }}
                  aria-label={`العدد الحالي: ${featuredIssue.title}`}
                >
                  <div className="relative h-full overflow-hidden rounded-[1.35rem]">
                    {featuredIssue.coverUrl ? (
                      <VisualImage
                        id={`journal-hero-current-cover-${featuredIssue.id}`}
                        label="غلاف العدد الحالي"
                        src={directDriveImage(featuredIssue.coverUrl) || featuredIssue.coverUrl}
                        alt={`غلاف ${featuredIssue.title}`}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className={`grid h-full place-items-center ${dark ? "bg-[#181818] text-[#f8ca14]" : isNationalDay ? "bg-emerald-50 text-[#005A36]" : "bg-slate-100 text-[#08467d]"}`}>
                        <Newspaper size={42} />
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/50 to-transparent px-4 pb-4 pt-16">
                      <span className="text-[10px] font-black text-[#f8ca14]">
                        {featuredIssue.pageCount} صفحات · {featuredIssue.issueDate}
                      </span>
                      <VisualEditable
                        id="journal-hero-featured-title"
                        tag="text"
                        label="عنوان غلاف العدد الحالي"
                        defaultText={featuredIssue.title}
                        as="h2"
                        className="mt-1 text-lg font-black text-white"
                      />
                    </div>
                  </div>
                </button>
              </div>

              {/* Text info */}
              <div className="order-1 md:order-2">
                {isNationalDay ? (
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 mb-3 text-xs font-black shadow-md backdrop-blur-md ${
                    dark
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                      : "bg-emerald-50 border-emerald-500/30 text-[#005A36]"
                  }`}>
                    <span className="text-sm">🇸🇦</span>
                    <span className="font-black">مجلة العقيق · هوية اليوم الوطني</span>
                  </div>
                ) : (
                  <VisualEditable
                    id="journal-hero-kicker"
                    tag="text"
                    label="شارة غلاف المجلة"
                    defaultText={orchestration?.heroCovers?.journalCustomTag || "موسم العقيق · النشرة الدورية"}
                    as="div"
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black ${
                      dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
                    }`}
                  >
                    <Sparkles size={14} />
                    {orchestration?.heroCovers?.journalCustomTag || "موسم العقيق · النشرة الدورية"}
                  </VisualEditable>
                )}

                <VisualEditable
                  id="journal-hero-title"
                  tag="text"
                  label="عنوان غلاف المجلة"
                  defaultText={orchestration?.heroCovers?.journalCustomTitle || "خبر يُقلب إلى ذكرى."}
                  as="h1"
                  className={`mt-5 text-4xl font-black leading-[1.12] md:text-6xl ${
                    dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black"
                  }`}
                />

                <VisualEditable
                  id="journal-hero-intro"
                  tag="text"
                  label="مقدمة غلاف المجلة"
                  defaultText={
                    orchestration?.heroCovers?.journalCustomDesc ||
                    "رفوف رقمية تجمع أعداد مجلة ونشرات مدارس العقيق الأهلية، مع كتيبات شهرية مؤرشفة وتجربة تصفح تفاعلية راقية."
                  }
                  as="p"
                  className={`mt-5 max-w-xl text-sm leading-8 ${dark ? "text-slate-300" : isNationalDay ? "text-slate-700" : "text-slate-600"}`}
                />

                <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-bold text-slate-400">
                  <span className={`rounded-full border px-3 py-2 ${
                    isNationalDay
                      ? dark ? "border-emerald-500/20 bg-[#001c10] text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
                  }`}>
                    <BookOpen className={`ml-1 inline ${isNationalDay ? "text-[#f8ca14]" : dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />
                    {issues.length} عدد منشور
                  </span>
                  <span className={`rounded-full border px-3 py-2 ${
                    isNationalDay
                      ? dark ? "border-emerald-500/20 bg-[#001c10] text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
                  }`}>
                    <Layers className={`ml-1 inline ${isNationalDay ? "text-[#f8ca14]" : dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />
                    {totalPages} صفحة
                  </span>
                  <span className={`rounded-full border px-3 py-2 ${
                    isNationalDay
                      ? dark ? "border-emerald-500/20 bg-[#001c10] text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
                  }`}>
                    <FolderArchive className={`ml-1 inline ${isNationalDay ? "text-[#f8ca14]" : dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />
                    {monthGroups.length} كتيب شهري
                  </span>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <VisualEditable
                    id="journal-hero-action"
                    tag="button"
                    label="زر قراءة العدد الحالي"
                    defaultText="اقرأ العدد الحالي"
                    as="button"
                    onAction={() => navigate(`/journal/${featuredIssue.slug}`)}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-black shadow-lg transition active:scale-95 hover:opacity-90 ${
                      dark
                        ? "!bg-[#f8ca14] !text-black shadow-[0_0_20px_rgba(248,202,20,0.3)]"
                        : isNationalDay
                        ? "!bg-[#005A36] !text-white shadow-[0_0_20px_rgba(0,90,54,0.25)] hover:bg-[#003822]"
                        : "!bg-[#08467d] !text-white shadow-[0_0_20px_rgba(8,70,125,0.2)]"
                    }`}
                  >
                    <ArrowUpLeft size={16} />
                    اقرأ العدد الحالي
                  </VisualEditable>


                  {isAdmin ? (
                    <button
                      onClick={() => navigate("/journal/manage")}
                      className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-xs font-black transition ${
                        dark
                          ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                          : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
                      }`}
                    >
                      <Settings2 size={16} />
                      دخول استوديو المجلة
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null
      }
    >
      {featuredIssue ? (
        <>
          {/* Monthly Booklets Section */}
          {monthGroups.length > 0 ? (
            <section className={`border-b py-10 ${
              dark ? "border-white/[0.08] bg-[#080808]" : "border-black/[0.06] bg-[#fbfbfb]"
            }`}>
              <div className="mx-auto max-w-[1320px] px-5 md:px-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderArchive size={18} className={dark ? "text-[#f8ca14]" : isNationalDay ? "text-[#005A36]" : "text-[#08467d]"} />
                    <h3 className={`text-lg font-black ${dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black"}`}>
                      الكتيبات الشهرية المجمعة
                    </h3>
                  </div>
                  <span className={`text-xs ${dark ? "text-slate-500" : isNationalDay ? "text-emerald-800/70" : "text-slate-400"}`}>
                    تتكون تلقائياً من أعداد كل شهر
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {monthGroups.map(([monthKey, entries]) => (
                    <div
                      key={monthKey}
                      className={`group flex items-center justify-between rounded-2xl border p-4 transition ${
                        isNationalDay
                          ? dark
                            ? "border-emerald-500/20 bg-[#001c10] hover:border-emerald-400"
                            : "border-emerald-500/20 bg-white hover:border-[#005A36] shadow-sm"
                          : dark
                          ? "border-white/[0.08] bg-[#111111] hover:border-[#f8ca14]/40"
                          : "border-black/[0.08] bg-white hover:border-[#08467d]/40 shadow-sm"
                      }`}
                    >
                      <div>
                        <h4 className={`font-black ${dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black"}`}>
                          كتيب {monthName(monthKey)}
                        </h4>
                        <p className={`mt-1 text-xs ${dark ? "text-slate-400" : isNationalDay ? "text-emerald-950/70" : "text-slate-500"}`}>
                          {entries.length} أعداد ·{" "}
                          {entries.reduce(
                            (sum, i) => sum + Number(i.pageCount || 0),
                            0
                          )}{" "}
                          صفحة
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/journal/month/${monthKey}`)}
                        className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition ${
                          dark
                            ? "bg-[#f8ca14]/15 text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                            : isNationalDay
                            ? "bg-emerald-50 text-[#005A36] hover:bg-[#005A36] hover:text-white"
                            : "bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d] hover:text-white"
                        }`}
                      >
                        فتح الكتيب
                        <ChevronLeft size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {/* Issues Archive Grid Section */}
          <section className="mx-auto max-w-[1320px] px-5 py-12 md:px-8 md:py-16">
            <div className={`mb-8 flex items-end justify-between gap-4 border-b pb-5 ${
              isNationalDay ? (dark ? "border-emerald-500/20" : "border-emerald-500/15") : (dark ? "border-white/[0.08]" : "border-black/[0.08]")
            }`}>
              <div>
                <VisualEditable
                  id="journal-archive-kicker"
                  tag="text"
                  label="شارة أرشيف الأعداد"
                  defaultText="JOURNAL ARCHIVE"
                  as="p"
                  className={`text-[10px] font-black tracking-[0.18em] ${
                    isNationalDay ? (dark ? "text-[#f8ca14]" : "text-[#005A36]") : (dark ? "text-[#f8ca14]" : "text-[#08467d]")
                  }`}
                />
                <VisualEditable
                  id="journal-archive-title"
                  tag="text"
                  label="عنوان أرشيف الأعداد"
                  defaultText="أعداد مجلة العقيق"
                  as="h2"
                  className={`mt-2 text-2xl font-black ${dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black"}`}
                />
              </div>

              <span className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
                {visibleIssues.length} من {issues.length} عدد
              </span>
            </div>

            <AqeeqArchiveControls
              id="journal-archive-controls"
              label="البحث وترتيب الأعداد"
              query={searchQuery}
              onQueryChange={setSearchQuery}
              sort={sort}
              onSortChange={setSort}
            />

            {visibleIssues.length ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                className="grid gap-6 lg:grid-cols-2"
              >
                {visibleIssues.map((issue, index) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    index={index}
                    dark={dark}
                    onOpen={() => navigate(`/journal/${issue.slug}`)}
                  />
                ))}
              </motion.div>
            ) : (
              <VisualEditable
                id="journal-search-empty"
                tag="text"
                label="رسالة عدم وجود نتائج للأعداد"
                defaultText="لا توجد أعداد مطابقة للبحث."
                as="p"
                className={`rounded-2xl border border-dashed p-8 text-center text-sm font-black ${
                  dark ? "border-[#f8ca14]/30 text-[#f8ca14]" : "border-[#08467d]/30 text-[#08467d]"
                }`}
              />
            )}
          </section>
        </>
      ) : (
        <section className="mx-auto max-w-[900px] px-5 py-28 text-center">
          <Newspaper className={`mx-auto ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={48} />
          <h1 className={`mt-6 text-3xl font-black ${dark ? "text-white" : "text-black"}`}>
            أول عدد في الطريق
          </h1>
          <p className={`mx-auto mt-3 max-w-md text-sm leading-7 ${dark ? "text-slate-400" : "text-slate-600"}`}>
            بعد نشر أول عدد من استوديو المجلة، سيظهر هنا كتاب الأسبوع والكتيبات
            الشهرية.
          </p>
          {isAdmin ? (
            <button
              onClick={() => navigate("/journal/manage")}
              className={`mt-6 rounded-xl px-4 py-3 text-xs font-black ${
                dark ? "bg-[#f8ca14] text-black" : "bg-[#08467d] text-white"
              }`}
            >
              إنشاء أول عدد
            </button>
          ) : null}
        </section>
      )}

      {/* Grand Finale CTA */}
      <AqeeqGrandFinaleCta
        badge="✦ إصدارات العقيق الدورية ✦"
        title="وثّق أجمل اللحظات والإنجازات في صفحات مجلة العقيق"
        subtitle="تصفح أرشيف المجلات الأسبوعية والكتيبات الشهرية التفاعلية وشارك مسيرة التفوق التعليمي لأبنائنا وبناتنا."
        primaryActionText="استكشف كواليس وألبومات العقيق"
        primaryActionHref="/albums"
        onPrimaryAction={() => navigate("/albums")}
        secondaryActionText="استمع لحلقات أثير العقيق"
        secondaryActionHref="/podcasts"
        onSecondaryAction={() => navigate("/podcasts")}
      />
    </AqeeqLuxuryPageShell>
  );
}
