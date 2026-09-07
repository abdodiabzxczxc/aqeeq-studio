import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, Monitor, BookOpen, Camera, Radio, FileText, Newspaper, GraduationCap, Award, Building2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export interface NavDockItemConfig {
  key: string;
  label: string;
  path: string;
  active: boolean;
  visualId: string;
  visualLabel: string;
  customClass?: string;
}

interface PagePreviewMetadata {
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  image: string;
  secondaryImage?: string | null;
  routePath: string;
  stats: string;
  glowColor: string;
  type: "journal" | "albums" | "podcast" | "articles" | "showcase" | "admissions" | "accreditations" | "about" | "home";
}

function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const id =
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/)?.[1];
  return id ? "/api/drive-proxy/" + id : url;
}

interface HeaderDockNavProps {
  items: NavDockItemConfig[];
  dark: boolean;
  onNavigate: (path: string) => void;
}

function DockHeroCover({ preview }: { preview: PagePreviewMetadata; dark: boolean }) {
  return (
    <div className="relative h-[165px] w-full rounded-xl overflow-hidden mb-2.5 border border-black/10 dark:border-white/10 bg-slate-950 shadow-inner select-none">
      <motion.img
        src={preview.image}
        alt={preview.title}
        loading="eager"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full h-full object-cover object-top select-none"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none opacity-30" />
    </div>
  );
}

export function HeaderDockNav({ items, dark, onNavigate }: HeaderDockNavProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── 📡 Live Real-Time Queries: Fresh from Database & Orchestration ──
  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
  const { data: issues = [] } = trpc.schoolNews.publicList.useQuery(undefined, {
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
  const { data: albums = [] } = trpc.aqeeqAlbums.publicList.useQuery(undefined, {
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
  const { data: showcases = [] } = trpc.aqeeqShowcases.publicList.useQuery(undefined, {
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
  const { data: articles = [] } = trpc.articles.listPublished.useQuery({}, {
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
  const { data: podcasts = [] } = trpc.podcasts.list.useQuery({}, {
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
  const { data: aboutOverrides = [] } = trpc.visualEditor.publicList.useQuery(
    { pagePath: "/about" },
    { refetchOnWindowFocus: true, staleTime: 5_000 }
  );
  const { data: admissionsOverrides = [] } = trpc.visualEditor.publicList.useQuery(
    { pagePath: "/admissions" },
    { refetchOnWindowFocus: true, staleTime: 5_000 }
  );

  const cacheKey = useMemo(() => {
    const dates = [
      (orchestration as any)?.updatedAt || (orchestration as any)?.themeMode?.customBadgeText,
      issues[0]?.updatedAt || issues[0]?.publishedAt,
      albums[0]?.updatedAt || albums[0]?.publishedAt,
      (showcases[0] as any)?.updatedAt || (showcases[0] as any)?.coverUrl,
      articles[0]?.updatedAt || articles[0]?.publishedAt,
      (podcasts[0] as any)?.updatedAt || (podcasts[0] as any)?.id,
      aboutOverrides[0]?.updatedAt,
      admissionsOverrides[0]?.updatedAt,
    ].filter(Boolean);
    return dates.length ? encodeURIComponent(dates.join("_")) : "1";
  }, [orchestration, issues, albums, showcases, articles, podcasts, aboutOverrides, admissionsOverrides]);

  // ── 🎯 Compute Live Cover Snapshots & Live Text in Real-Time ──
  const livePreviews = useMemo<Record<string, PagePreviewMetadata>>(() => {
    // 1. Journal: Latest added issue photo and previous issue photo
    const customIssue =
      orchestration?.heroCovers?.journalMode === "custom" && orchestration?.heroCovers?.customJournalIssueId
        ? issues.find((i) => i.id === orchestration.heroCovers.customJournalIssueId)
        : null;
    const activeIssue = customIssue || issues[0];
    const secondIssue = issues[1] || null;
    const journalPhoto =
      directDriveImage(activeIssue?.coverUrl) ||
      activeIssue?.coverUrl ||
      "/covers/student-excellence-about.jpg";
    const secondJournalPhoto =
      directDriveImage(secondIssue?.coverUrl) ||
      secondIssue?.coverUrl ||
      null;

    // 2. Albums: Latest added album photo & second album photo
    const customAlbum =
      orchestration?.heroCovers?.albumsMode === "custom" && orchestration?.heroCovers?.customAlbumId
        ? albums.find((a) => a.id === orchestration.heroCovers.customAlbumId)
        : null;
    const activeAlbum = customAlbum || albums[0];
    const secondAlbum = albums.find((a) => a.id !== activeAlbum?.id) || albums[1] || null;
    const albumPhoto =
      directDriveImage(activeAlbum?.coverUrl) ||
      activeAlbum?.coverUrl ||
      "/covers/first-lego-champions.png";
    const secondAlbumPhoto =
      directDriveImage(secondAlbum?.coverUrl) ||
      secondAlbum?.coverUrl ||
      null;

    // 3. Podcasts: Latest added podcast artwork
    const customPodcast =
      orchestration?.heroCovers?.podcastsMode === "custom" && orchestration?.heroCovers?.customPodcastId
        ? podcasts.find((p) => p.id === orchestration.heroCovers.customPodcastId)
        : null;
    const activePodcast = customPodcast || podcasts[0];
    const podcastPhoto =
      directDriveImage(activePodcast?.coverUrl) ||
      activePodcast?.coverUrl ||
      "/covers/aqeeq-anthems-royal-cover.jpg";

    // 4. Articles: Latest added article artwork
    const customArticle =
      orchestration?.heroCovers?.articlesMode === "custom" && orchestration?.heroCovers?.customArticleId
        ? articles.find((a) => a.id === orchestration.heroCovers.customArticleId)
        : null;
    const activeArticle = customArticle || articles[0];
    const articlePhoto =
      directDriveImage(activeArticle?.coverUrl) ||
      activeArticle?.coverUrl ||
      "/articles/ai-in-education-comprehensive-research.jpg";

    // 5. Showcase / News: Latest added news media photo
    const showcase = showcases[0];
    const showcasePhoto =
      directDriveImage(showcase?.coverUrl) ||
      showcase?.coverUrl ||
      "/covers/cover-admissions.jpg";

    // 6. Visual Editor Overrides for About & Admissions
    const aboutOverride = aboutOverrides.find(
      (o) => o.elementType === "image" && (o.elementId === "about-hero-student-photo" || Boolean(o.mediaUrl))
    );
    const aboutPhoto = aboutOverride?.mediaUrl
      ? directDriveImage(aboutOverride.mediaUrl) || aboutOverride.mediaUrl
      : dark
      ? `/previews/about_dark.webp?v=${cacheKey}`
      : `/previews/about_light.webp?v=${cacheKey}`;

    const admissionsOverride = admissionsOverrides.find((o) => o.elementType === "image" && Boolean(o.mediaUrl));
    const admissionsPhoto = admissionsOverride?.mediaUrl
      ? directDriveImage(admissionsOverride.mediaUrl) || admissionsOverride.mediaUrl
      : dark
      ? `/previews/admissions_dark.webp?v=${cacheKey}`
      : `/previews/admissions_light.webp?v=${cacheKey}`;

    return {
      home: {
        type: "home",
        title: "بوابة مدارس العقيق الذكية",
        subtitle: orchestration?.themeMode?.customBadgeText
          ? `صرح المدينة المنورة · ${orchestration.themeMode.customBadgeText}`
          : "الصرح التعليمي والافتراضي المتكامل",
        badge: "✦ البوابة الرقمية الموحدة",
        description: "استكشف جولة الرانوناء الافتراضية، أحدث الأخبار المصورة، والخدمات الرقمية للمنسوبين والطلاب.",
        image: dark ? `/previews/home_dark.webp?v=${cacheKey}` : `/previews/home_light.webp?v=${cacheKey}`,
        routePath: "alaqeeq.edu.sa/",
        stats: "30+ عاماً من التميز · المدينة",
        glowColor: "rgba(248, 202, 20, 0.28)",
      },
      about: {
        type: "about",
        title: "مجمعات ومسارات العقيق",
        subtitle: "الرؤية والرسالة والبيئة النموذجية",
        badge: "✦ صروح ومجمعات العقيق",
        description: orchestration?.schoolCampuses?.boysAddress
          ? `مجمع الرانوناء ومجمع البنات — ${orchestration.schoolCampuses.boysAddress}`
          : "مجمع الرانوناء ومجمع البنات، الملاعب والمسبح نصف الأولمبي والمسار الأمريكي المعتمد.",
        image: dark ? `/previews/about_dark.webp?v=${cacheKey}` : `/previews/about_light.webp?v=${cacheKey}`,
        routePath: "alaqeeq.edu.sa/about",
        stats: "بنين وبنات · مرافق متكاملة",
        glowColor: "rgba(16, 185, 129, 0.28)",
      },
      accreditations: {
        type: "accreditations",
        title: "الاعتمادات الدولية والشراكات",
        subtitle: "أعلى معايير الجودة الأكاديمية العالمية",
        badge: "✦ الاعتمادات الأكاديمية الدولية",
        description: "اعتماد كوجنيا الأمريكي Cognia، المقر الرسمي لاختبارات SAT و ACT واختبارات IELTS الدولية المعتمدة.",
        image: dark ? `/previews/accreditations_dark.webp?v=${cacheKey}` : `/previews/accreditations_light.webp?v=${cacheKey}`,
        routePath: "alaqeeq.edu.sa/accreditations",
        stats: "Cognia USA · SAT / IELTS",
        glowColor: "rgba(8, 70, 125, 0.38)",
      },
      admissions: {
        type: "admissions",
        title: orchestration?.admissionsSettings?.isOpen
          ? "بوابة القبول وحاسبة الرسوم (متاح الآن)"
          : "بوابة القبول وحاسبة الرسوم",
        subtitle: orchestration?.admissionsSettings?.siblingDiscountSecond
          ? `خصم الأشقاء ${orchestration.admissionsSettings.siblingDiscountSecond}% · عام 2026 - 2027`
          : "احجز مقعدك للعام الجديد 2026 - 2027",
        badge: orchestration?.admissionsSettings?.isOpen ? "✦ التسجيل متاح الآن" : "✦ بوابة التسجيل",
        description:
          orchestration?.admissionsSettings?.closedNoticeText && !orchestration.admissionsSettings.isOpen
            ? orchestration.admissionsSettings.closedNoticeText
            : "حاسبة الأقساط الذكية مع خصومات الأشقاء، وخيارات التقسيط الميسر عبر تابي وتمارا بدون فوائد.",
        image: dark ? `/previews/admissions_dark.webp?v=${cacheKey}` : `/previews/admissions_light.webp?v=${cacheKey}`,
        routePath: "alaqeeq.edu.sa/admissions",
        stats: orchestration?.admissionsSettings?.siblingDiscountSecond
          ? `خصم ${orchestration.admissionsSettings.siblingDiscountSecond}% · 4 دفعات`
          : "خصم 15% · 4 دفعات",
        glowColor: "rgba(248, 202, 20, 0.32)",
      },
      journal: {
        type: "journal",
        title: orchestration?.heroCovers?.journalCustomTitle || activeIssue?.title || "مجلة صوت العقيق الدورية",
        subtitle: orchestration?.heroCovers?.journalCustomTag || activeIssue?.seasonLabel || "صحافة مدرسية بأقلام وإبداع الطلاب",
        badge: activeIssue?.title ? `✦ أحدث إصدار: ${activeIssue.title}` : "✦ المجلة الدورية",
        description:
          orchestration?.heroCovers?.journalCustomDesc ||
          activeIssue?.description ||
          "تصفح تفاعلي واقعي بتقليب الصفحات 3D وقراءة صوتية ذكية لكافة أعداد ومقالات العقيق الفصلية.",
        image: dark ? `/previews/journal_dark.webp?v=${cacheKey}` : `/previews/journal_light.webp?v=${cacheKey}`,
        routePath: "alaqeeq.edu.sa/journal",
        stats: activeIssue?.pageCount ? `${activeIssue.pageCount} صفحة تفاعلية · 3D` : "أعداد دورية · تقليب 3D",
        glowColor: "rgba(244, 63, 94, 0.28)",
      },
      albums: {
        type: "albums",
        title: orchestration?.heroCovers?.albumsCustomTitle || activeAlbum?.title || "ألبومات وتغطيات العقيق",
        subtitle: orchestration?.heroCovers?.albumsCustomTag || "توثيق فوتوغرافي لأجمل اللحظات والبطولات",
        badge: activeAlbum?.title
          ? `✦ أحدث ألبوم: ${activeAlbum.title.length > 24 ? activeAlbum.title.slice(0, 24) + "..." : activeAlbum.title}`
          : "✦ ألبومات الفعاليات",
        description:
          orchestration?.heroCovers?.albumsCustomDesc ||
          activeAlbum?.description ||
          "تغطيات احتفالات التخرج، بطولات الروبوت WRO العالمية، المناسبات الوطنية والأنشطة اللاصفية.",
        image: dark ? `/previews/albums_dark.webp?v=${cacheKey}` : `/previews/albums_light.webp?v=${cacheKey}`,
        routePath: "alaqeeq.edu.sa/albums",
        stats: activeAlbum?.mediaCount ? `${activeAlbum.mediaCount} صورة وفيديو · 4K` : "صور فائقة الدقة 4K",
        glowColor: "rgba(139, 92, 246, 0.28)",
      },
      podcast: {
        type: "podcast",
        title: orchestration?.heroCovers?.podcastsCustomTitle || activePodcast?.title || "أثير العقيق · راديو وبودكاست",
        subtitle: orchestration?.heroCovers?.podcastsCustomTag || "حوارات فكرية وإذاعة مدرسية ملهمة",
        badge: activePodcast?.title
          ? `✦ أحدث حلقة: ${activePodcast.title.length > 22 ? activePodcast.title.slice(0, 22) + "..." : activePodcast.title}`
          : "✦ أثير العقيق",
        description:
          orchestration?.heroCovers?.podcastsCustomDesc ||
          activePodcast?.description ||
          "استمع لحلقات البودكاست التربوية، لقاءات الطلاب، والإذاعة الصباحية مع مشغل صوتي عائم متطور.",
        image: dark ? `/previews/podcast_dark.webp?v=${cacheKey}` : `/previews/podcast_light.webp?v=${cacheKey}`,
        routePath: "alaqeeq.edu.sa/podcast",
        stats: activePodcast?.duration ? `${activePodcast.duration} د · استوديو حي` : "بث صوتي ومرئي · أثير",
        glowColor: "rgba(168, 85, 247, 0.28)",
      },
      articles: {
        type: "articles",
        title: orchestration?.heroCovers?.articlesCustomTitle || activeArticle?.title || "مقالات وبحوث العقيق",
        subtitle: orchestration?.heroCovers?.articlesCustomTag || "منبر الفكر والتربية والإبداع الأكاديمي",
        badge: activeArticle?.title
          ? `✦ أحدث مقال: ${activeArticle.title.length > 22 ? activeArticle.title.slice(0, 22) + "..." : activeArticle.title}`
          : "✦ مقالات وبحوث",
        description:
          orchestration?.heroCovers?.articlesCustomDesc ||
          activeArticle?.excerpt ||
          "مقالات حول الذكاء الاصطناعي في التعليم، مهارات المستقبل، وأبحاث متميزة بقلم نخبة المعلمين والطلاب.",
        image: dark ? `/previews/articles_dark.webp?v=${cacheKey}` : `/previews/articles_light.webp?v=${cacheKey}`,
        routePath: "alaqeeq.edu.sa/articles",
        stats: activeArticle?.authorName ? `بقلم: ${activeArticle.authorName}` : "قراءات ملهمة · أبحاث",
        glowColor: "rgba(6, 182, 212, 0.28)",
      },
      showcase: {
        type: "showcase",
        title: orchestration?.heroCovers?.showcaseCustomTitle || showcase?.title || "المعرض المرئي والأخبار",
        subtitle: orchestration?.heroCovers?.showcaseCustomSubtitle || "تغطيات حية ومقاطع سينمائية متجددة",
        badge: "✦ أحدث الأخبار والتغطيات",
        description:
          orchestration?.heroCovers?.showcaseCustomDesc ||
          "أحدث الفعاليات اليومية، فيديوهات المعارض المدرسية، والإعلانات الرسمية الصادرة من الإدارة العامة.",
        image: dark ? `/previews/showcase_dark.webp?v=${cacheKey}` : `/previews/showcase_light.webp?v=${cacheKey}`,
        routePath: "alaqeeq.edu.sa/showcase",
        stats: showcase?.postCount ? `${showcase.postCount} منشور إعلامي · مباشر` : "تحديثات وتغطيات يومية",
        glowColor: "rgba(234, 88, 12, 0.28)",
      },
    };
  }, [orchestration, issues, albums, podcasts, articles, showcases, aboutOverrides, admissionsOverrides, cacheKey, dark]);

  const handleMouseEnterItem = (key: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setHoveredKey(key);
  };

  const handleMouseLeaveItem = () => {
    timeoutRef.current = setTimeout(() => {
      if (!isCardHovered) {
        setHoveredKey(null);
      }
    }, 180);
  };

  const handleMouseEnterCard = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsCardHovered(true);
  };

  const handleMouseLeaveCard = () => {
    setIsCardHovered(false);
    timeoutRef.current = setTimeout(() => {
      setHoveredKey(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <nav
      dir="rtl"
      className="relative hidden lg:flex items-center justify-self-center gap-1 xl:gap-1.5 whitespace-nowrap text-[13px] font-['Tajawal',sans-serif] pointer-events-auto select-none py-1 px-1 rounded-full"
      role="toolbar"
      aria-label="شريط التنقل التفاعلي الذكي"
    >
      {items.map((item) => {
        const isHovered = hoveredKey === item.key;
        const preview = livePreviews[item.key];

        return (
          <div
            key={item.key}
            className="relative"
            onMouseEnter={() => handleMouseEnterItem(item.key)}
            onMouseLeave={handleMouseLeaveItem}
          >
            {/* ── Fixed Clean Word Button (No Scale Distortion) ── */}
            <button
              type="button"
              onClick={() => {
                setHoveredKey(null);
                onNavigate(item.path);
              }}
              data-visual-id={item.visualId}
              data-visual-tag="text"
              data-visual-label={item.visualLabel}
              className={`relative px-2.5 py-1.5 rounded-full transition-colors duration-150 cursor-pointer select-none text-[13px] font-bold ${
                item.customClass || ""
              } ${
                item.active
                  ? dark
                    ? "text-[#f8ca14] font-black"
                    : "text-[#08467d] font-black"
                  : dark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              {/* Active pill background */}
              {item.active && (
                <motion.div
                  layoutId="header-dock-active-pill"
                  className={`absolute inset-0 rounded-full border pointer-events-none ${
                    dark
                      ? "bg-white/10 border-white/20 shadow-[0_2px_12px_rgba(248,202,20,0.15)]"
                      : "bg-black/5 border-black/10 shadow-[0_2px_10px_rgba(8,70,125,0.08)]"
                  }`}
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}

              {/* Gentle hover capsule */}
              {!item.active && isHovered && (
                <motion.div
                  layoutId="header-dock-hover-pill"
                  className={`absolute inset-0 rounded-full border pointer-events-none ${
                    dark
                      ? "bg-white/8 border-white/15 shadow-[0_2px_8px_rgba(255,255,255,0.05)]"
                      : "bg-slate-100 border-slate-200/80 shadow-[0_2px_6px_rgba(0,0,0,0.03)]"
                  }`}
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}

              <span className="relative z-10">{item.label}</span>
            </button>

            {/* ── Realistic Live Website Snapshot — Positioned Directly Underneath THIS Specific Word! ── */}
            <AnimatePresence>
              {isHovered && preview && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-2.5 z-[350] pointer-events-auto"
                  onMouseEnter={handleMouseEnterCard}
                  onMouseLeave={handleMouseLeaveCard}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.78, y: 8, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.82, y: 5, filter: "blur(8px)" }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: "top center" }}
                    onClick={() => {
                      setHoveredKey(null);
                      onNavigate(item.path);
                    }}
                    className={`group w-[310px] sm:w-[335px] rounded-[1.4rem] border p-3 shadow-2xl backdrop-blur-2xl transition-all duration-200 overflow-hidden cursor-pointer ${
                      dark
                        ? "bg-[#080d16]/96 border-white/15 shadow-[0_24px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(248,202,20,0.05)] text-white"
                        : "bg-white/96 border-slate-200/90 shadow-[0_20px_50px_rgba(8,70,125,0.18),0_0_20px_rgba(8,70,125,0.06)] text-slate-900"
                    }`}
                  >
                    {/* Dynamic Glow Halo */}
                    <div
                      className="absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-colors duration-500 opacity-60"
                      style={{ backgroundColor: preview.glowColor }}
                    />

                    {/* Browser Window Chrome */}
                    <div
                      dir="ltr"
                      className={`flex items-center justify-between px-2.5 py-1 rounded-t-xl mb-2 border text-[10px] font-mono select-none ${
                        dark
                          ? "bg-black/40 border-white/10 text-slate-400"
                          : "bg-slate-100/90 border-slate-200 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
                        <span className="w-2 h-2 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
                        <span className="w-2 h-2 rounded-full bg-[#27c93f] inline-block shadow-sm" />
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 truncate max-w-[160px]">
                        <Monitor size={10} className="shrink-0 opacity-70" />
                        <span className="truncate">{preview.routePath}</span>
                      </div>

                      {/* Live Pulsing Badge */}
                      <div className="flex items-center gap-1 text-[9px] font-sans font-bold text-emerald-500 shrink-0">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>مباشر</span>
                      </div>
                    </div>

                    {/* ── Live Hero Snapshot Visual Component (100% Real-Time Live Authentic Cover) ── */}
                    <DockHeroCover preview={preview} dark={dark} />

                    {/* Description */}
                    <p
                      className={`text-xs leading-relaxed line-clamp-2 mb-2 font-medium ${
                        dark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {preview.description}
                    </p>

                    {/* Footer */}
                    <div
                      className={`flex items-center justify-between pt-2 border-t text-[11px] font-bold ${
                        dark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"
                      }`}
                    >
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium truncate max-w-[65%]">
                        <span>✦</span>
                        <span className="truncate">{preview.stats}</span>
                      </span>

                      <div
                        className={`flex items-center gap-1 group-hover:-translate-x-1 transition-transform font-black shrink-0 ${
                          dark ? "text-[#f8ca14]" : "text-[#08467d]"
                        }`}
                      >
                        <span>فتح الصفحة</span>
                        <ChevronLeft size={13} />
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
