import { useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Play, BookOpen, ImageIcon, Mic, Newspaper, Sparkles, ArrowUpLeft } from "lucide-react";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { usePodcastPlayer } from "@/components/AqeeqFloatingPodcastPlayer";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function AqeeqHomeBentoGrid({
  titleOverride,
  descOverride,
}: {
  titleOverride?: string;
  descOverride?: string;
} = {}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [, navigate] = useLocation();
  const { playEpisode } = usePodcastPlayer();

  // تتبع السكرول التفاعلي نزولاً وصعوداً
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // فيزياء البارالاكس الحية ذهاباً وإياباً: الكارت الكبير وكروت اليمين يتحركون بسرعات مختلفة
  const rawAlbumY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const rawJournalY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const rawPodY = useTransform(scrollYProgress, [0, 1], [60, -40]);
  const rawArtY = useTransform(scrollYProgress, [0, 1], [20, -50]);

  const albumY = useSpring(rawAlbumY, { stiffness: 85, damping: 20 });
  const journalY = useSpring(rawJournalY, { stiffness: 85, damping: 20 });
  const podY = useSpring(rawPodY, { stiffness: 85, damping: 20 });
  const artY = useSpring(rawArtY, { stiffness: 85, damping: 20 });

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
    <div ref={sectionRef} className="relative w-full">
      <VisualEditable
        id="studio-highlights-section"
        tag="section"
        label="قسم جديد مدارس العقيق (Bento Grid)"
        as="div"
        className={"w-full py-12 md:py-16 overflow-visible " + (
          isNationalDay
            ? dark ? "snd-section-dark-alt" : "snd-section-light-alt"
            : ""
        )}
      >
        <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 md:px-8">
          {/* Animated Section Header */}
          <div className="mb-8 sm:mb-10 text-right">
            <VisualEditable
              id="studio-highlights-kicker"
              tag="text"
              label="شارة جديد المدارس"
              defaultText={isNationalDay ? "🇸🇦 إبداعات العقيق في اليوم الوطني" : "ALAQEEQ SCHOOLS · LATEST HIGHLIGHTS"}
              as="span"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border mb-3 text-[10px] font-black tracking-widest uppercase ${
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
              label="عنوان جديد المدارس"
              defaultText={
                titleOverride === "جديد الاستوديو"
                  ? "جديد مدارس العقيق"
                  : titleOverride || "جديد مدارس العقيق"
              }
              as="h2"
              className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-black"}`}
            />
            <VisualEditable
              id="studio-highlights-desc"
              tag="text"
              label="وصف جديد المدارس"
              defaultText={
                descOverride === "أحدث ما تم نشره وتوثيقه في الاستوديو من فعاليات وإصدارات."
                  ? "أحدث ما تم نشره وتوثيقه في مدارس العقيق من فعاليات وإصدارات رقمية."
                  : descOverride || "أحدث ما تم نشره وتوثيقه في مدارس العقيق من فعاليات وإصدارات رقمية."
              }
              as="p"
              className={`mt-2 max-w-xl text-xs sm:text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}
            />
          </div>

          {/* Bento Grid مع تأثير البارالاكس التفاعلي بالنزول والطلوع */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: Album Hero Card مع البارالاكس */}
            {latestAlbum && (
              <motion.div
                style={{ y: albumY }}
                whileHover={{ y: -8, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="md:col-span-2 lg:col-span-2 lg:row-span-2 will-change-transform"
              >
                <VisualEditable
                  id="studio-highlights-album-card"
                  tag="section"
                  label="بطاقة ألبوم البينتو"
                  as="div"
                  onClick={() => navigate(`/albums/${latestAlbum.slug}`)}
                  className={`h-[300px] sm:h-[360px] md:h-full md:min-h-[560px] relative overflow-hidden rounded-[2.2rem] cursor-pointer group shadow-xl border transition-all duration-300 ${
                    dark ? "bg-emerald-950/40 border-white/10 hover:border-emerald-500/40 shadow-black/80" : "bg-emerald-50 border-black/5 hover:border-emerald-500/30"
                  }`}
                >
                  <VisualImage
                    id="studio-highlights-album-img"
                    label="صورة غلاف ألبوم البينتو"
                    src={latestAlbum.coverUrl || "/alaqeeq-hero-light.png"}
                    alt={latestAlbum.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:scale-106 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                  <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-20 text-white">
                    <div className="flex items-center gap-2 text-[#f8ca14] font-bold text-xs sm:text-sm mb-3">
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
                        className={`font-black px-6 py-2.5 rounded-full flex items-center gap-2 transition-transform duration-300 group-hover:scale-105 shadow-lg ${
                          dark
                            ? "bg-[#f8ca14] text-black shadow-[#f8ca14]/20"
                            : isNationalDay
                            ? "bg-[#005A36] text-white hover:bg-[#003822] shadow-emerald-950/20"
                            : "bg-[#08467d] text-white"
                        }`}
                      >
                        <ImageIcon size={18} />
                        <VisualEditable
                          id="studio-highlights-album-btn"
                          tag="text"
                          label="زر ألبوم البينتو"
                          defaultText="تصفح الألبوم"
                          as="span"
                        />
                        <ArrowUpLeft size={16} />
                      </button>
                    </div>
                  </div>
                </VisualEditable>
              </motion.div>
            )}

            {/* Cards 2, 3, 4 مع بارالاكس فردي لكل كارت */}
            {(latestIssue || latestPodcast || latestArticle) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 md:contents gap-4 sm:gap-6">
                {/* Card 2: Latest Journal */}
                {latestIssue && (
                  <motion.div
                    style={{ y: journalY }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="md:col-span-1 lg:col-span-2 will-change-transform"
                  >
                    <VisualEditable
                      id="studio-highlights-journal-card"
                      tag="section"
                      label="بطاقة مجلة البينتو"
                      as="div"
                      onClick={() => navigate(`/journal/issue/${latestIssue.slug}`)}
                      className={`h-[180px] sm:h-[220px] md:h-auto md:min-h-[265px] relative overflow-hidden rounded-[2rem] cursor-pointer group shadow-lg border transition-all duration-300 ${
                        dark ? "bg-amber-950/25 border-amber-500/20 hover:border-amber-500/40" : "bg-amber-50 border-amber-500/20 hover:border-amber-500/40"
                      }`}
                    >
                      <VisualImage
                        id="studio-highlights-journal-img"
                        label="صورة غلاف مجلة البينتو"
                        src={latestIssue.coverUrl || "/alaqeeq-hero-light.png"}
                        alt={latestIssue.title}
                        className="absolute inset-0 w-full h-full object-cover object-top opacity-35 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between z-10">
                        <div className={`flex items-center gap-1.5 font-bold text-xs w-fit px-3 py-1 rounded-full ${dark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-800"}`}>
                          <BookOpen size={14} />
                          <VisualEditable id="studio-highlights-journal-tag" tag="text" label="وسم مجلة البينتو" defaultText="أحدث الأعداد" as="span" />
                        </div>
                        <div>
                          <VisualEditable
                            id="studio-highlights-journal-title"
                            tag="text"
                            label="عنوان مجلة البينتو"
                            defaultText={latestIssue.title}
                            as="h3"
                            className={`text-base sm:text-xl font-black leading-snug mb-1 line-clamp-2 ${dark ? "text-white" : "text-black"}`}
                          />
                          <span className={`inline-flex items-center gap-1 text-xs font-black group-hover:underline ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                            <span>تصفح العدد</span>
                            <ArrowUpLeft size={13} />
                          </span>
                        </div>
                      </div>
                    </VisualEditable>
                  </motion.div>
                )}

                {/* Card 3: Latest Podcast */}
                {latestPodcast && (
                  <motion.div
                    style={{ y: podY }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="md:col-span-1 will-change-transform"
                  >
                    <VisualEditable
                      id="studio-highlights-podcast-card"
                      tag="section"
                      label="بطاقة بودكاست البينتو"
                      as="div"
                      onClick={() => playEpisode(latestPodcast)}
                      className={`h-[180px] sm:h-[220px] md:h-auto md:min-h-[265px] relative overflow-hidden rounded-[2rem] cursor-pointer group shadow-lg border transition-all duration-300 ${
                        dark ? "bg-indigo-950/30 border-indigo-500/20 hover:border-indigo-500/40" : "bg-indigo-50 border-indigo-500/20 hover:border-indigo-500/40"
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 z-0" />
                      <VisualImage
                        id="studio-highlights-podcast-img"
                        label="صورة غلاف بودكاست البينتو"
                        src={latestPodcast.coverUrl || "/alaqeeq-hero-dark.png"}
                        alt={latestPodcast.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700 mix-blend-overlay"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
                      <div className="absolute inset-0 p-5 flex flex-col justify-end z-20 text-white">
                        <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs mb-1">
                          <Mic size={14} />
                          <VisualEditable id="studio-highlights-podcast-tag" tag="text" label="وسم بودكاست البينتو" defaultText="صوت العقيق" as="span" />
                        </div>
                        <VisualEditable
                          id="studio-highlights-podcast-title"
                          tag="text"
                          label="عنوان بودكاست البينتو"
                          defaultText={latestPodcast.title}
                          as="h3"
                          className="text-sm sm:text-lg font-black leading-tight line-clamp-2"
                        />
                        <button type="button" className="mt-3 bg-[#f8ca14] text-black font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 text-xs hover:scale-105 transition-transform w-fit shadow-md">
                          <Play size={12} className="fill-black" />
                          <VisualEditable id="studio-highlights-podcast-btn" tag="text" label="زر بودكاست البينتو" defaultText="استمع للحلقة" as="span" />
                        </button>
                      </div>
                    </VisualEditable>
                  </motion.div>
                )}

                {/* Card 4: Latest Article */}
                {latestArticle && (
                  <motion.div
                    style={{ y: artY }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="md:col-span-1 will-change-transform"
                  >
                    <VisualEditable
                      id="studio-highlights-article-card"
                      tag="section"
                      label="بطاقة مقال البينتو"
                      as="div"
                      onClick={() => navigate(`/articles/${latestArticle.slug}`)}
                      className={`h-[180px] sm:h-[220px] md:h-auto md:min-h-[265px] relative overflow-hidden rounded-[2rem] cursor-pointer group shadow-lg border transition-all duration-300 ${
                        dark ? "bg-rose-950/20 border-rose-500/20 hover:border-rose-500/40" : "bg-rose-50 border-rose-500/20 hover:border-rose-500/40"
                      }`}
                    >
                      <VisualImage
                        id="studio-highlights-article-img"
                        label="صورة غلاف مقال البينتو"
                        src={latestArticle.coverUrl || "/alaqeeq-hero-light.png"}
                        alt={latestArticle.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                        <div className={`flex items-center gap-1.5 font-bold text-xs w-fit px-3 py-1 rounded-full ${dark ? "bg-rose-500/20 text-rose-300" : "bg-rose-100 text-rose-700"}`}>
                          <Newspaper size={14} />
                          <VisualEditable id="studio-highlights-article-tag" tag="text" label="وسم مقال البينتو" defaultText="مقال ونشرة" as="span" />
                        </div>
                        <div>
                          <VisualEditable
                            id="studio-highlights-article-title"
                            tag="text"
                            label="عنوان مقال البينتو"
                            defaultText={latestArticle.title}
                            as="h3"
                            className={`text-sm sm:text-base font-black leading-snug line-clamp-3 ${dark ? "text-white" : "text-black"}`}
                          />
                          <span className="inline-flex items-center gap-1 text-xs font-black text-rose-400 mt-2 group-hover:underline">
                            <span>قراءة المقال</span>
                            <ArrowUpLeft size={13} />
                          </span>
                        </div>
                      </div>
                    </VisualEditable>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </VisualEditable>
    </div>
  );
}
