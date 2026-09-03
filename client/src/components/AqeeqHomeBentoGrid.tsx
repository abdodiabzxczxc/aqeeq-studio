import React, { useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Play, BookOpen, ImageIcon, Mic, Newspaper, Sparkles, ArrowUpLeft, Disc, Volume2 } from "lucide-react";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { usePodcastPlayer } from "@/components/AqeeqFloatingPodcastPlayer";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

function useMagneticTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 50 });

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (py - 0.5) * -14,
      y: (px - 0.5) * 14,
      gx: px * 100,
      gy: py * 100,
    });
  }, []);

  const onLeave = useCallback(() => {
    setTilt({ x: 0, y: 0, gx: 50, gy: 50 });
  }, []);

  return { ref, tilt, onMove, onLeave };
}

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

  const [isAlbumHovered, setIsAlbumHovered] = useState(false);
  const [isJournalHovered, setIsJournalHovered] = useState(false);
  const [isPodcastHovered, setIsPodcastHovered] = useState(false);
  const [isArticleHovered, setIsArticleHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rawAlbumY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const rawJournalY = useTransform(scrollYProgress, [0, 1], [25, -25]);
  const rawPodY = useTransform(scrollYProgress, [0, 1], [50, -35]);
  const rawArtY = useTransform(scrollYProgress, [0, 1], [15, -45]);

  const albumY = useSpring(rawAlbumY, { stiffness: 85, damping: 20 });
  const journalY = useSpring(rawJournalY, { stiffness: 85, damping: 20 });
  const podY = useSpring(rawPodY, { stiffness: 85, damping: 20 });
  const artY = useSpring(rawArtY, { stiffness: 85, damping: 20 });

  const c1 = useMagneticTilt();
  const c2 = useMagneticTilt();
  const c3 = useMagneticTilt();
  const c4 = useMagneticTilt();

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
        className={"w-full py-14 md:py-20 overflow-visible " + (
          isNationalDay
            ? dark ? "snd-section-dark-alt" : "snd-section-light-alt"
            : ""
        )}
      >
        <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 md:px-8">
          {/* Section Header */}
          <div className="mb-10 sm:mb-12 text-right">
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
              className={`text-2xl sm:text-4xl lg:text-5xl font-black font-cairo ${dark ? "text-white" : "text-black"}`}
            />
            {/* Glowing Golden Accent Line (يتمدد مع السكرول وينكمش عند الخروج) */}
            <motion.div
              initial={{ width: 0, opacity: 0.3 }}
              whileInView={{ width: 175, opacity: 1 }}
              viewport={{ once: false, margin: "-20px" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className={`h-1 sm:h-[3.5px] rounded-full my-3.5 ${
                dark
                  ? "bg-gradient-to-l from-[#f8ca14] via-[#f8ca14]/80 to-transparent shadow-[0_0_15px_rgba(248,202,20,0.6)]"
                  : "bg-gradient-to-l from-[#08467d] via-[#08467d]/80 to-transparent shadow-[0_0_12px_rgba(8,70,125,0.4)]"
              }`}
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
              className={`mt-2 max-w-xl text-xs sm:text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-600"}`}
            />
          </div>

          {/* ========================================================================= */}
          {/* RADICAL 3D MORPHING ARTIFACTS BENTO GRID                                 */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
            {/* 📸 CARD 1: ALBUM HERO CARD WITH 3D FLOATING POLAROID SPILL */}
            {latestAlbum && (
              <motion.div
                ref={c1.ref}
                onMouseMove={(e) => { c1.onMove(e); setIsAlbumHovered(true); }}
                onMouseLeave={() => { c1.onLeave(); setIsAlbumHovered(false); }}
                style={{
                  y: albumY,
                  rotateX: c1.tilt.x,
                  rotateY: c1.tilt.y,
                  transformStyle: "preserve-3d",
                  perspective: 1200,
                }}
                whileHover={{ y: -10, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="md:col-span-2 lg:col-span-2 lg:row-span-2 will-change-transform relative"
              >
                {/* 🌟 3D Floating Polaroids that burst out on hover */}
                <motion.div
                  initial={false}
                  animate={isAlbumHovered ? { opacity: 1, x: 20, y: -25, rotate: 12, scale: 1 } : { opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 200, damping: 16 }}
                  className="pointer-events-none absolute -top-5 -right-3 z-30 hidden sm:block w-28 bg-white p-2 rounded-xl shadow-2xl border border-white/40 rotate-12"
                >
                  <img src={latestAlbum.coverUrl || "/covers/student-excellence-about.jpg"} alt="" className="h-20 w-full object-cover rounded-lg" />
                  <p className="text-[8px] font-black text-slate-800 text-center mt-1">لحظات التتويج 📸</p>
                </motion.div>

                <motion.div
                  initial={false}
                  animate={isAlbumHovered ? { opacity: 1, x: -25, y: -15, rotate: -10, scale: 1 } : { opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.05 }}
                  className="pointer-events-none absolute -top-2 -left-4 z-30 hidden sm:block w-28 bg-white p-2 rounded-xl shadow-2xl border border-white/40 -rotate-10"
                >
                  <img src="/covers/student-excellence-about.jpg" alt="" className="h-20 w-full object-cover rounded-lg" />
                  <p className="text-[8px] font-black text-slate-800 text-center mt-1">الأسبوع العلمي 🔬</p>
                </motion.div>

                <VisualEditable
                  id="studio-highlights-album-card"
                  tag="section"
                  label="بطاقة ألبوم البينتو"
                  as="div"
                  onClick={() => navigate(`/albums/${latestAlbum.slug}`)}
                  className={`h-[320px] sm:h-[380px] md:h-full md:min-h-[580px] relative overflow-hidden rounded-[2.5rem] cursor-pointer group shadow-2xl border transition-all duration-500 ${
                    dark ? "bg-[#091216] border-white/15 hover:border-emerald-400/50 shadow-black/90" : "bg-emerald-50/80 border-slate-200 hover:border-emerald-500/40 shadow-xl"
                  }`}
                >
                  {/* Diagonal Liquid Glare Line */}
                  <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
                    <div className="absolute -inset-full w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent -rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                  </div>

                  {/* Ambient spotlight */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-[inherit] z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle 220px at ${c1.tilt.gx}% ${c1.tilt.gy}%, rgba(16,185,129,0.18), transparent 70%)`,
                    }}
                  />

                  <VisualImage
                    id="studio-highlights-album-img"
                    label="صورة غلاف ألبوم البينتو"
                    src={latestAlbum.coverUrl || "/alaqeeq-hero-light.png"}
                    alt={latestAlbum.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />

                  <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end z-20 text-white">
                    <div className="flex items-center gap-2 text-[#f8ca14] font-bold text-xs sm:text-sm mb-3">
                      <ImageIcon size={16} />
                      <VisualEditable
                        id="studio-highlights-album-tag"
                        tag="text"
                        label="وسم ألبوم البينتو"
                        defaultText="أحدث الألبومات المصورة"
                        as="span"
                      />
                    </div>
                    <VisualEditable
                      id="studio-highlights-album-title"
                      tag="text"
                      label="عنوان ألبوم البينتو"
                      defaultText={latestAlbum.title}
                      as="h3"
                      className="text-2xl sm:text-4xl font-black leading-tight mb-5 drop-shadow-md font-cairo"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className={`font-black px-7 py-3 rounded-2xl flex items-center gap-2.5 transition-transform duration-300 group-hover:scale-105 shadow-xl text-xs sm:text-sm ${
                          dark
                            ? "bg-[#f8ca14] text-black shadow-[#f8ca14]/25 hover:bg-[#e6b90f]"
                            : isNationalDay
                            ? "bg-[#005A36] text-white hover:bg-[#003822] shadow-emerald-950/20"
                            : "bg-[#08467d] text-white hover:bg-[#063863]"
                        }`}
                      >
                        <ImageIcon size={18} />
                        <VisualEditable
                          id="studio-highlights-album-btn"
                          tag="text"
                          label="زر ألبوم البينتو"
                          defaultText="تصفح الألبوم بالكامل"
                          as="span"
                        />
                        <ArrowUpLeft size={16} />
                      </button>
                    </div>
                  </div>
                </VisualEditable>
              </motion.div>
            )}

            {/* CARDS 2, 3, 4 */}
            {(latestIssue || latestPodcast || latestArticle) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 md:contents gap-5 sm:gap-7">
                {/* 📖 CARD 2: LATEST JOURNAL WITH 3D UNFOLDING MAGAZINE COVER */}
                {latestIssue && (
                  <motion.div
                    ref={c2.ref}
                    onMouseMove={(e) => { c2.onMove(e); setIsJournalHovered(true); }}
                    onMouseLeave={() => { c2.onLeave(); setIsJournalHovered(false); }}
                    style={{
                      y: journalY,
                      rotateX: c2.tilt.x,
                      rotateY: c2.tilt.y,
                      transformStyle: "preserve-3d",
                      perspective: 1000,
                    }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="md:col-span-1 lg:col-span-2 will-change-transform relative"
                  >
                    <VisualEditable
                      id="studio-highlights-journal-card"
                      tag="section"
                      label="بطاقة مجلة البينتو"
                      as="div"
                      onClick={() => navigate(`/journal/issue/${latestIssue.slug}`)}
                      className={`h-[200px] sm:h-[240px] md:h-auto md:min-h-[275px] relative overflow-hidden rounded-[2.2rem] cursor-pointer group shadow-xl border transition-all duration-500 ${
                        dark
                          ? "bg-gradient-to-br from-[#181105] to-[#0c0802] border-amber-500/30 hover:border-amber-400/60 shadow-amber-950/30"
                          : "bg-amber-50/90 border-amber-300 hover:border-amber-400 shadow-lg"
                      }`}
                    >
                      {/* 3D Magazine Page Edge Lines */}
                      <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-amber-600/40 via-amber-200/20 to-transparent border-r border-amber-500/30 z-20 pointer-events-none" />

                      {/* Cover background with 3D perspective fold */}
                      <motion.div
                        animate={isJournalHovered ? { rotateY: -16, scale: 1.05 } : { rotateY: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 180, damping: 16 }}
                        className="absolute inset-0 origin-right"
                      >
                        <VisualImage
                          id="studio-highlights-journal-img"
                          label="صورة غلاف مجلة البينتو"
                          src={latestIssue.coverUrl || "/alaqeeq-hero-light.png"}
                          alt={latestIssue.title}
                          className="w-full h-full object-cover object-top opacity-35"
                        />
                      </motion.div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

                      <div className="absolute inset-0 p-6 flex flex-col justify-between z-20">
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center gap-1.5 font-bold text-xs px-3.5 py-1 rounded-full border ${
                            dark ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-amber-100 text-amber-900 border-amber-300"
                          }`}>
                            <BookOpen size={14} />
                            <VisualEditable id="studio-highlights-journal-tag" tag="text" label="وسم مجلة البينتو" defaultText="أحدث الأعداد الرسمية" as="span" />
                          </div>
                          <span className="text-[10px] font-mono text-amber-400 font-black">إصدار دوري ✦</span>
                        </div>

                        <div>
                          <VisualEditable
                            id="studio-highlights-journal-title"
                            tag="text"
                            label="عنوان مجلة البينتو"
                            defaultText={latestIssue.title}
                            as="h3"
                            className={`text-base sm:text-xl font-black leading-snug mb-2 line-clamp-2 font-cairo ${dark ? "text-white" : "text-black"}`}
                          />
                          <span className={`inline-flex items-center gap-1 text-xs font-black group-hover:underline ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                            <span>تصفح أوراق العدد</span>
                            <ArrowUpLeft size={14} className="transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
                          </span>
                        </div>
                      </div>
                    </VisualEditable>
                  </motion.div>
                )}

                {/* 🎙️ CARD 3: LATEST PODCAST WITH 3D SPINNING VINYL RECORD SLIDE-OUT */}
                {latestPodcast && (
                  <motion.div
                    ref={c3.ref}
                    onMouseMove={(e) => { c3.onMove(e); setIsPodcastHovered(true); }}
                    onMouseLeave={() => { c3.onLeave(); setIsPodcastHovered(false); }}
                    style={{
                      y: podY,
                      rotateX: c3.tilt.x,
                      rotateY: c3.tilt.y,
                      transformStyle: "preserve-3d",
                      perspective: 1000,
                    }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="md:col-span-1 will-change-transform relative overflow-visible"
                  >
                    {/* 💿 3D Spinning Vinyl Record that slides out */}
                    <motion.div
                      animate={isPodcastHovered ? { x: -38, rotate: 360, opacity: 1 } : { x: 0, rotate: 0, opacity: 0 }}
                      transition={{
                        x: { type: "spring", stiffness: 180, damping: 16 },
                        rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                        opacity: { duration: 0.2 },
                      }}
                      className="pointer-events-none absolute top-6 -left-6 z-0 hidden sm:block h-28 w-28 rounded-full bg-black border-2 border-slate-700 shadow-2xl"
                      style={{
                        backgroundImage: "radial-gradient(circle, #222 15%, #111 25%, #222 35%, #050505 45%, #181818 55%, #080808 65%)",
                      }}
                    >
                      <div className="absolute inset-0 m-auto h-9 w-9 rounded-full bg-[#f8ca14] border border-black flex items-center justify-center text-[7px] font-black text-black">
                        العقيق
                      </div>
                    </motion.div>

                    <VisualEditable
                      id="studio-highlights-podcast-card"
                      tag="section"
                      label="بطاقة بودكاست البينتو"
                      as="div"
                      onClick={() => playEpisode(latestPodcast)}
                      className={`h-[200px] sm:h-[240px] md:h-auto md:min-h-[275px] relative overflow-hidden rounded-[2.2rem] cursor-pointer group shadow-xl border transition-all duration-500 z-10 ${
                        dark
                          ? "bg-gradient-to-br from-[#120a1c] to-[#08040d] border-indigo-500/30 hover:border-indigo-400/60 shadow-indigo-950/30"
                          : "bg-indigo-50/90 border-indigo-300 hover:border-indigo-400 shadow-lg"
                      }`}
                    >
                      <VisualImage
                        id="studio-highlights-podcast-img"
                        label="صورة غلاف بودكاست البينتو"
                        src={latestPodcast.coverUrl || "/alaqeeq-hero-dark.png"}
                        alt={latestPodcast.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-108 transition-transform duration-700 mix-blend-overlay"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />

                      <div className="absolute inset-0 p-6 flex flex-col justify-between z-20 text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-full">
                            <Mic size={14} />
                            <VisualEditable id="studio-highlights-podcast-tag" tag="text" label="وسم بودكاست البينتو" defaultText="صوت العقيق" as="span" />
                          </div>
                          {isPodcastHovered && <Volume2 size={16} className="text-indigo-400 animate-pulse" />}
                        </div>

                        <div>
                          <VisualEditable
                            id="studio-highlights-podcast-title"
                            tag="text"
                            label="عنوان بودكاست البينتو"
                            defaultText={latestPodcast.title}
                            as="h3"
                            className="text-sm sm:text-base font-black leading-snug line-clamp-2 font-cairo mb-3"
                          />
                          <button
                            type="button"
                            className="bg-[#f8ca14] text-black font-black px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs hover:scale-105 transition-transform w-fit shadow-md active:scale-95"
                          >
                            <Play size={12} className="fill-black" />
                            <VisualEditable id="studio-highlights-podcast-btn" tag="text" label="زر بودكاست البينتو" defaultText="استمع للحلقة" as="span" />
                          </button>
                        </div>
                      </div>
                    </VisualEditable>
                  </motion.div>
                )}

                {/* ✍️ CARD 4: LATEST ARTICLE WITH KINETIC READING BADGE */}
                {latestArticle && (
                  <motion.div
                    ref={c4.ref}
                    onMouseMove={(e) => { c4.onMove(e); setIsArticleHovered(true); }}
                    onMouseLeave={() => { c4.onLeave(); setIsArticleHovered(false); }}
                    style={{
                      y: artY,
                      rotateX: c4.tilt.x,
                      rotateY: c4.tilt.y,
                      transformStyle: "preserve-3d",
                      perspective: 1000,
                    }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="md:col-span-1 will-change-transform relative"
                  >
                    <VisualEditable
                      id="studio-highlights-article-card"
                      tag="section"
                      label="بطاقة مقال البينتو"
                      as="div"
                      onClick={() => navigate(`/articles/${latestArticle.slug}`)}
                      className={`h-[200px] sm:h-[240px] md:h-auto md:min-h-[275px] relative overflow-hidden rounded-[2.2rem] cursor-pointer group shadow-xl border transition-all duration-500 ${
                        dark
                          ? "bg-gradient-to-br from-[#1c0a0e] to-[#0a0305] border-rose-500/30 hover:border-rose-400/60 shadow-rose-950/30"
                          : "bg-rose-50/90 border-rose-300 hover:border-rose-400 shadow-lg"
                      }`}
                    >
                      <VisualImage
                        id="studio-highlights-article-img"
                        label="صورة غلاف مقال البينتو"
                        src={latestArticle.coverUrl || "/alaqeeq-hero-light.png"}
                        alt={latestArticle.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-108 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />

                      <div className="absolute inset-0 p-6 flex flex-col justify-between z-20">
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center gap-1.5 font-bold text-xs px-3 py-1 rounded-full border ${
                            dark ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-rose-100 text-rose-800 border-rose-300"
                          }`}>
                            <Newspaper size={14} />
                            <VisualEditable id="studio-highlights-article-tag" tag="text" label="وسم مقال البينتو" defaultText="مقال وتحليل" as="span" />
                          </div>
                          <span className="text-[10px] font-mono text-rose-400 font-bold">قراءة سريعة ⏱️</span>
                        </div>

                        <div>
                          <VisualEditable
                            id="studio-highlights-article-title"
                            tag="text"
                            label="عنوان مقال البينتو"
                            defaultText={latestArticle.title}
                            as="h3"
                            className={`text-sm sm:text-base font-black leading-snug line-clamp-3 font-cairo mb-2 ${dark ? "text-white" : "text-black"}`}
                          />
                          <span className="inline-flex items-center gap-1.5 text-xs font-black text-rose-400 group-hover:underline">
                            <span>قراءة المقال الآن</span>
                            <ArrowUpLeft size={14} className="transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
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
