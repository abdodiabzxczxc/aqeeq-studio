import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Play, BookOpen, ImageIcon, Mic, Newspaper, Sparkles } from "lucide-react";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { usePodcastPlayer } from "@/components/AqeeqFloatingPodcastPlayer";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";

export function AqeeqHomeBentoGrid({
  titleOverride,
  descOverride,
}: {
  titleOverride?: string;
  descOverride?: string;
} = {}) {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [, navigate] = useLocation();
  const { playEpisode } = usePodcastPlayer();

  // Fetch the latest 1 item from each category

  const { data: latestPodcast } = trpc.podcasts.list.useQuery({}, {
    select: (data) => data[0]
  });
  
  const { data: latestArticle } = trpc.articles.listPublished.useQuery({}, {
    select: (data) => data[0]
  });

  const { data: latestAlbum } = trpc.aqeeqAlbums.publicList.useQuery(undefined, {
    select: (data) => data[0]
  });

  const { data: latestIssue } = trpc.schoolNews.publicList.useQuery(undefined, {
    select: (data) => data[0]
  });

  return (
    <VisualEditable
      id="studio-highlights-section"
      tag="section"
      label="قسم جديد الاستوديو (Bento Grid)"
      as="div"
      className={"w-full py-12 md:py-16 " + (
        isNationalDay
          ? dark ? "snd-section-dark-alt" : "snd-section-light-alt"
          : ""
      )}
    >
      <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 md:px-8">
      {isNationalDay && <div className="snd-gold-divider mb-10" />}
      {/* Unified Section Header */}
      <div className="mb-8 sm:mb-10 text-right">
        <VisualEditable
          id="studio-highlights-kicker"
          tag="text"
          label="شارة جديد الاستوديو"
          defaultText={isNationalDay ? "🇸🇦 إبداعات العقيق في اليوم الوطني" : "STUDIO HIGHLIGHTS · LATEST"}
          as="span"
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-3 text-[10px] font-black tracking-widest uppercase ${
            isNationalDay
              ? "snd-kicker-badge border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
              : dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
          }`}
        >
          {(text) => (
            <>
              <Sparkles size={12} />
              <span>{text}</span>
            </>
          )}

        </VisualEditable>
        <VisualEditable
          id="studio-highlights-title"
          tag="text"
          label="عنوان جديد الاستوديو"
          defaultText={titleOverride || "جديد الاستوديو"}
          as="h2"
          className={`text-2xl sm:text-4xl font-black font-cairo ${
            dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black"
          }`}
        />
        <VisualEditable

          id="studio-highlights-desc"
          tag="text"
          label="وصف جديد الاستوديو"
          defaultText={descOverride || "أحدث ما تم نشره وتوثيقه عبر استوديوهات العقيق من وسائط وإصدارات رقمية."}
          as="p"
          className={`mt-2 max-w-xl text-xs sm:text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}
        />
      </div>

      {/* Mobile: tall hero then 3-card row. Desktop: bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Row 1 Mobile: Album hero tall card */}

        {latestAlbum && (
          <VisualEditable
            id="studio-highlights-album-card"
            tag="section"
            label="بطاقة ألبوم البينتو"
            as="div"
            onClick={() => navigate(`/albums/${latestAlbum.slug}`)}
            className={`h-[300px] sm:h-[360px] md:h-auto md:col-span-2 lg:col-span-2 lg:row-span-2 md:min-h-[560px] relative overflow-hidden rounded-3xl cursor-pointer group shadow-xl transition-transform hover:-translate-y-1 ${dark ? "bg-emerald-950 border border-white/10" : "bg-emerald-50 border border-black/5"}`}
          >
            <VisualImage
              id="studio-highlights-album-img"
              label="صورة غلاف ألبوم البينتو"
              src={latestAlbum.coverUrl || "/alaqeeq-hero-light.png"}
              alt={latestAlbum.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-20 text-white">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm mb-3">
                <ImageIcon size={16} />
                <VisualEditable
                  id="studio-highlights-album-tag"
                  tag="text"
                  label="وسم ألبوم البينتو"
                  defaultText="أحدث الألبومات"
                  as="span"
                />
              </div>
              <VisualEditable
                id="studio-highlights-album-title"
                tag="text"
                label="عنوان ألبوم البينتو"
                defaultText={latestAlbum.title}
                as="h3"
                className="text-2xl sm:text-4xl font-black leading-tight mb-4 drop-shadow-md"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={`font-black px-6 py-2.5 rounded-full flex items-center gap-2 hover:scale-105 transition-transform ${dark ? "bg-[#f8ca14] text-black" : "bg-[#08467d] text-white"}`}
                >
                  <ImageIcon size={18} />
                  <VisualEditable
                    id="studio-highlights-album-btn"
                    tag="text"
                    label="زر ألبوم البينتو"
                    defaultText="تصفح الألبوم"
                    as="span"
                  />
                </button>
              </div>
            </div>
          </VisualEditable>
        )}

        {/* Row 2 Mobile: 3 small cards in a horizontal scroll row */}
        {(latestIssue || latestPodcast || latestArticle) && (
          <div className="grid grid-cols-3 md:contents gap-4 sm:gap-6">

        {/* TILE 2: Latest Journal/News */}
        {latestIssue && (
          <VisualEditable
            id="studio-highlights-journal-card"
            tag="section"
            label="بطاقة مجلة البينتو"
            as="div"
            onClick={() => navigate(`/journal/issue/${latestIssue.slug}`)}
            className={`h-[160px] sm:h-[200px] md:h-auto md:min-h-[280px] md:col-span-1 lg:col-span-2 relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer group shadow-md transition-transform hover:-translate-y-1 ${dark ? "bg-amber-950/30 border border-amber-500/20" : "bg-amber-50 border border-amber-500/20"}`}
          >
            <VisualImage
              id="studio-highlights-journal-img"
              label="صورة غلاف مجلة البينتو"
              src={latestIssue.coverUrl || "/alaqeeq-hero-light.png"}
              alt={latestIssue.title}
              className="absolute inset-0 w-full h-full object-cover object-top opacity-30 group-hover:opacity-40 transition-opacity"
            />
            <div className="absolute inset-0 p-3 sm:p-6 flex flex-col justify-between z-10">
              <div className={`flex items-center gap-1.5 font-bold text-[9px] sm:text-xs w-fit px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${dark ? "bg-amber-500/20 text-amber-400" : "bg-amber-50 text-amber-700"}`}>
                <BookOpen size={10} className="sm:hidden" />
                <BookOpen size={14} className="hidden sm:block" />
                <VisualEditable id="studio-highlights-journal-tag" tag="text" label="وسم مجلة البينتو" defaultText="أحدث الأعداد" as="span" />
              </div>
              <div>
                <VisualEditable
                  id="studio-highlights-journal-title"
                  tag="text"
                  label="عنوان مجلة البينتو"
                  defaultText={latestIssue.title}
                  as="h3"
                  className={`text-xs sm:text-xl font-black leading-snug mb-1 sm:mb-2 line-clamp-2 ${dark ? "text-white" : "text-black"}`}
                />
                <VisualEditable id="studio-highlights-journal-sub" tag="text" label="وصف مجلة البينتو" defaultText="تصفح العدد" as="p" className={`hidden sm:block text-xs font-bold ${dark ? "text-amber-200/70" : "text-amber-700/70"}`} />
              </div>
            </div>
          </VisualEditable>
        )}

        {/* TILE 3: Latest Podcast */}
        {latestPodcast && (
          <VisualEditable
            id="studio-highlights-podcast-card"
            tag="section"
            label="بطاقة بودكاست البينتو"
            as="div"
            onClick={() => playEpisode(latestPodcast)}
            className={`h-[160px] sm:h-[200px] md:h-auto md:min-h-[280px] md:col-span-1 relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer group shadow-md transition-transform hover:-translate-y-1 ${dark ? "bg-slate-900 border border-white/10" : "bg-indigo-50 border border-black/5"}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 z-0" />
            <VisualImage
              id="studio-highlights-podcast-img"
              label="صورة غلاف بودكاست البينتو"
              src={latestPodcast.coverUrl || "/alaqeeq-hero-dark.png"}
              alt={latestPodcast.title}
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
            <div className="absolute inset-0 p-3 sm:p-5 flex flex-col justify-end z-20 text-white">
              <div className="flex items-center gap-1 text-indigo-300 font-bold text-[9px] sm:text-xs mb-1">
                <Mic size={10} className="sm:hidden" />
                <Mic size={14} className="hidden sm:block" />
                <VisualEditable id="studio-highlights-podcast-tag" tag="text" label="وسم بودكاست البينتو" defaultText="صوت العقيق" as="span" className="hidden sm:inline" />
              </div>
              <VisualEditable
                id="studio-highlights-podcast-title"
                tag="text"
                label="عنوان بودكاست البينتو"
                defaultText={latestPodcast.title}
                as="h3"
                className="text-xs sm:text-lg font-black leading-tight line-clamp-2"
              />
              <button type="button" className="mt-1.5 sm:mt-2 bg-[#f8ca14] text-black font-black px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs hover:scale-105 transition-transform w-fit">
                <Play size={10} className="fill-black sm:hidden" />
                <Play size={14} className="fill-black hidden sm:block" />
                <VisualEditable id="studio-highlights-podcast-btn" tag="text" label="زر بودكاست البينتو" defaultText="استمع" as="span" />
              </button>
            </div>
          </VisualEditable>
        )}

        {/* TILE 4: Latest Article */}
        {latestArticle && (
          <VisualEditable
            id="studio-highlights-article-card"
            tag="section"
            label="بطاقة مقال البينتو"
            as="div"
            onClick={() => navigate(`/articles/${latestArticle.slug}`)}
            className={`h-[160px] sm:h-[200px] md:h-auto md:min-h-[280px] md:col-span-1 relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer group shadow-md transition-transform hover:-translate-y-1 ${dark ? "bg-[#111] border border-white/10" : "bg-white border border-black/5"}`}
          >
            <VisualImage
              id="studio-highlights-article-img"
              label="صورة غلاف مقال البينتو"
              src={latestArticle.coverUrl || "/alaqeeq-hero-light.png"}
              alt={latestArticle.title}
              className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
            />
            <div className="absolute inset-0 p-3 sm:p-5 flex flex-col justify-between z-10">
              <div className={`flex items-center gap-1 font-bold text-[9px] sm:text-[10px] w-fit px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${dark ? "bg-white/10 text-rose-400" : "bg-rose-50 text-rose-600"}`}>
                <Newspaper size={10} className="sm:hidden" />
                <Newspaper size={12} className="hidden sm:block" />
                <VisualEditable id="studio-highlights-article-tag" tag="text" label="وسم مقال البينتو" defaultText="مقال" as="span" />
              </div>
              <div>
                <VisualEditable
                  id="studio-highlights-article-title"
                  tag="text"
                  label="عنوان مقال البينتو"
                  defaultText={latestArticle.title}
                  as="h3"
                  className={`text-xs sm:text-base font-black leading-snug line-clamp-3 ${dark ? "text-white" : "text-black"}`}
                />
              </div>
            </div>
          </VisualEditable>
        )}

          </div>
        )}

      </div>

      </div>
    </VisualEditable>
  );
}
