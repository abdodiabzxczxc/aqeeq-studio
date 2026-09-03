import React, { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { 
  ImageIcon, 
  Mic, 
  Newspaper, 
  BookOpen, 
  Clapperboard, 
  ArrowLeft,
  Calendar,
  Sparkles,
  Play,
  Volume2,
  Eye,
  ArrowUpLeft,
  Compass
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { useLocation } from "wouter";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { usePodcastPlayer } from "@/components/AqeeqFloatingPodcastPlayer";

function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const id =
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/)?.[1];
  return id ? "/api/drive-proxy/" + id : url;
}

interface UnifiedLibraryCardItem {
  id: string | number;
  title: string;
  coverUrl: string | null;
  badge: string;
  dateOrMeta?: string;
  href: string;
  excerpt?: string;
}

export function AqeeqHomeTabsLibrary({
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
  const [activeTab, setActiveTab] = useState<"podcasts" | "articles" | "albums" | "journal" | "showcase">("podcasts");

  const sectionRef = useRef<HTMLDivElement>(null);

  // Fetch data for all systems
  const { data: podcasts = [] } = trpc.podcasts.list.useQuery({});
  const { data: articles = [] } = trpc.articles.listPublished.useQuery({});
  const { data: albums = [] } = trpc.aqeeqAlbums.publicList.useQuery(undefined);
  const { data: issues = [] } = trpc.schoolNews.publicList.useQuery(undefined);
  const { data: showcase } = trpc.aqeeqShowcases.publicShowcase.useQuery({ slug: "news-offers" });

  const tabs = [
    { id: "podcasts", label: "البودكاست", icon: <Mic size={16} />, count: podcasts.length, color: "from-indigo-500 to-purple-600" },
    { id: "articles", label: "المقالات", icon: <Newspaper size={16} />, count: articles.length, color: "from-rose-500 to-pink-600" },
    { id: "albums", label: "الألبومات", icon: <ImageIcon size={16} />, count: albums.length, color: "from-emerald-500 to-teal-600" },
    { id: "journal", label: "المجلة", icon: <BookOpen size={16} />, count: issues.length, color: "from-amber-500 to-yellow-600" },
    { id: "showcase", label: "العروض", icon: <Clapperboard size={16} />, count: showcase?.posts?.length || 0, color: "from-cyan-500 to-blue-600" },
  ] as const;

  // Build unified items for current tab
  const getTabConfig = () => {
    switch (activeTab) {
      case "podcasts":
        return {
          title: "صوت العقيق الإذاعي",
          subtitle: "حوارات ملهمة، تجارب طلابية، وإذاعات مدرسية حصرية مسجلة بأعلى جودة.",
          viewAllText: "استمع لجميع الحلقات",
          viewAllHref: "/podcast",
          themeColor: "#6366f1",
          heroBadge: "🎙️ أحدث الحلقات الصوتية",
          icon: <Mic size={20} className="text-indigo-400" />,
          items: podcasts.slice(0, 4).map((p): UnifiedLibraryCardItem => ({
            id: p.id,
            title: p.title,
            coverUrl: directDriveImage(p.coverUrl),
            badge: "بودكاست العقيق",
            dateOrMeta: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("ar-SA") : "تسجيل صوتي",
            href: "/podcast",
            excerpt: "حلقة صوتية حصرية تناقش أبرز المحاور التعليمية والتربوية لمدارس العقيق.",
          }))
        };
      case "articles":
        return {
          title: "النشرات والمقالات التربوية",
          subtitle: "رؤى فكرية وقراءات عميقة بقلم قادة المدارس ومعلميها المتميزين.",
          viewAllText: "تصفح مكتبة المقالات",
          viewAllHref: "/articles",
          themeColor: "#f43f5e",
          heroBadge: "📰 مقال الأسبوع المميز",
          icon: <Newspaper size={20} className="text-rose-400" />,
          items: articles.slice(0, 4).map((a): UnifiedLibraryCardItem => ({
            id: a.id,
            title: a.title,
            coverUrl: directDriveImage(a.coverUrl),
            badge: "مقال ونشرة",
            dateOrMeta: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("ar-SA") : "قراءة صحفية",
            href: `/articles/${a.slug}`,
            excerpt: a.excerpt || "قراءة تحليلية تثري المعرفة التربوية لأولياء الأمور والطلاب.",
          }))
        };
      case "albums":
        return {
          title: "أرشيف الألبومات والفعاليات",
          subtitle: "توثيق فوتوغرافي شامل لكل احتفالية وبطولة ومناسبة على مدار العام.",
          viewAllText: "استكشف كافة الألبومات",
          viewAllHref: "/albums",
          themeColor: "#10b981",
          heroBadge: "📸 تغطية مصورة كبرى",
          icon: <ImageIcon size={20} className="text-emerald-400" />,
          items: albums.slice(0, 4).map((al): UnifiedLibraryCardItem => ({
            id: al.id,
            title: al.title,
            coverUrl: directDriveImage(al.coverUrl),
            badge: "ألبوم صور حي",
            dateOrMeta: (al as any).eventDate || (al.publishedAt ? new Date(al.publishedAt).toLocaleDateString("ar-SA") : "أرشيف مصور"),
            href: `/albums/${al.slug}`,
            excerpt: "لقطات احترافية توثق ملامح الفرح والإنجاز لفرسان وفراشات العقيق.",
          }))
        };
      case "journal":
        return {
          title: "أعداد المجلة المدرسية التفاعلية",
          subtitle: "إصدارات دورية فاخرة تُنشر رقمياً مع خاصية تقليب الصفحات ثلاثية الأبعاد.",
          viewAllText: "أرشيف الأعداد الكامل",
          viewAllHref: "/journal",
          themeColor: "#f59e0b",
          heroBadge: "📖 العدد الرسمي المتصدر",
          icon: <BookOpen size={20} className="text-amber-400" />,
          items: issues.slice(0, 4).map((i): UnifiedLibraryCardItem => ({
            id: i.id,
            title: i.title,
            coverUrl: directDriveImage(i.coverUrl),
            badge: "مجلة العقيق الدورية",
            dateOrMeta: i.publishedAt ? new Date(i.publishedAt).toLocaleDateString("ar-SA") : "عدد رقمي",
            href: `/journal/issue/${i.slug}`,
            excerpt: "عدد مميز يجمع أبرز مقالات وأنشطة وتقارير الفصل الدراسي في إخراج صحفي راقٍ.",
          }))
        };
      case "showcase":
        const posts = (showcase?.posts || []) as any[];
        return {
          title: "شاشة العروض والتغطيات الفورية",
          subtitle: "فيديوهات حية ورسائل بصرية سريعة تنبض بأحدث لحظات المدارس اليومية.",
          viewAllText: "مشاهدة شاشة العروض",
          viewAllHref: "/offers",
          themeColor: "#06b6d4",
          heroBadge: "🎬 تغطية فيديو مباشرة",
          icon: <Clapperboard size={20} className="text-cyan-400" />,
          items: posts.slice(0, 4).map((post): UnifiedLibraryCardItem => ({
            id: post.id,
            title: post.title || post.caption || "عرض وتغطية مباشرة",
            coverUrl: directDriveImage(post.thumbnailUrl || post.mediaUrl),
            badge: "تغطية مباشرة",
            dateOrMeta: post.createdAt ? new Date(post.createdAt).toLocaleDateString("ar-SA") : "عرض حي",
            href: "/offers",
            excerpt: "محتوى بصري متجدد يشارك المجتمع المدرسي أحلى اللحظات خطوة بخطوة.",
          }))
        };
    }
  };

  const currentConfig = getTabConfig();
  const heroItem = currentConfig.items[0];
  const deckItems = currentConfig.items.slice(1, 4);

  return (
    <div ref={sectionRef} className="relative w-full">
      <VisualEditable
        id="studio-library-section"
        tag="section"
        label="قسم استكشف المكتبة"
        as="section"
        className={`w-full py-16 md:py-24 transition-colors duration-500 relative overflow-hidden ${
          isNationalDay
            ? dark ? "snd-library-dark" : "snd-library-light"
            : dark ? "bg-[#05080c]" : "bg-gradient-to-b from-[#f8fafc] to-[#ffffff]"
        }`}
      >
        {/* Ambient Radial Spotlight */}
        <div 
          className="pointer-events-none absolute top-1/4 -right-32 w-[550px] h-[550px] rounded-full blur-[140px] opacity-20 transition-all duration-700"
          style={{ backgroundColor: currentConfig.themeColor }}
        />

        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="mb-10 sm:mb-12 text-right">
            <VisualEditable
              id="studio-library-kicker"
              tag="text"
              label="شارة استكشف المكتبة"
              defaultText={isNationalDay ? "🇸🇦 أرشيف العقيق الوطني الكامل" : "EXPLORE LIBRARY · ALL IN ONE"}
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
              id="studio-library-title"
              tag="text"
              label="عنوان استكشف المكتبة"
              defaultText={titleOverride || "استكشف المكتبة الرقمية"}
              as="h2"
              className={`text-2xl sm:text-4xl lg:text-5xl font-black font-cairo ${dark ? "text-white" : "text-black"}`}
            />
            <VisualEditable
              id="studio-library-desc"
              tag="text"
              label="وصف استكشف المكتبة"
              defaultText={descOverride || "منصة مركزية ذكية تجمع كل إصدارات البودكاست، المقالات الفكرية، الألبومات التوثيقية، والمجلات الدورية في تجربة سينمائية واحدة."}
              as="p"
              className={`mt-2 max-w-xl text-xs sm:text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-600"}`}
            />
          </div>

          {/* ========================================================================= */}
          {/* LUXURY FLOATING GLASS DOCK (TAB SWITCHER WITH LIQUID ACTIVE PILL)         */}
          {/* ========================================================================= */}
          <div className="flex justify-center mb-10 sm:mb-14">
            <div className={`p-1.5 sm:p-2 rounded-full border flex items-center gap-1 sm:gap-2 max-w-full overflow-x-auto scrollbar-hide backdrop-blur-2xl shadow-2xl ${
              dark 
                ? "bg-[#0d151e]/85 border-white/10 shadow-black/60" 
                : "bg-white/90 border-black/10 shadow-xl"
            }`}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative flex shrink-0 items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-black text-xs sm:text-sm transition-all duration-300 z-10 ${
                      isActive
                        ? "text-white"
                        : dark
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-600 hover:text-black"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="libraryActivePill"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        className={`absolute inset-0 rounded-full shadow-lg ${
                          dark ? "bg-gradient-to-r from-[#f8ca14] to-yellow-600 !text-black" : "bg-gradient-to-r from-[#08467d] to-sky-700"
                        }`}
                      />
                    )}
                    <span className={`relative z-10 flex items-center gap-2 ${isActive && dark ? "!text-black font-black" : ""}`}>
                      {tab.icon}
                      <span>{tab.label}</span>
                      {tab.count > 0 && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
                          isActive
                            ? dark ? "bg-black/25 text-black" : "bg-white/20 text-white"
                            : dark ? "bg-white/10 text-slate-400" : "bg-black/10 text-slate-600"
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* THE 3D INTERACTIVE CINEMA THEATER + GLASS COLLECTION DECK                 */}
          {/* ========================================================================= */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch"
            >
              {/* 🌟 1. RIGHT: THE CINEMATIC HERO SHOWCASE STAGE (7 COLS) */}
              {heroItem && (
                <div className="lg:col-span-7 flex flex-col">
                  <div
                    onClick={() => {
                      if (activeTab === "podcasts") {
                        const pod = podcasts.find((p) => p.id === heroItem.id);
                        if (pod) playEpisode(pod);
                      } else {
                        navigate(heroItem.href);
                      }
                    }}
                    className={`group relative flex-1 min-h-[380px] sm:min-h-[480px] rounded-[2.5rem] border overflow-hidden cursor-pointer shadow-2xl transition-all duration-500 hover:shadow-3xl flex flex-col justify-end p-6 sm:p-10 ${
                      dark
                        ? "bg-[#0b1016] border-white/15 shadow-black/80 hover:border-[#f8ca14]/50"
                        : "bg-white border-slate-200 shadow-xl hover:border-[#08467d]/40"
                    }`}
                  >
                    {/* Background Hero Image with Ken Burns Zoom */}
                    <VisualImage
                      id={`studio-library-hero-${activeTab}`}
                      label="صورة العنصر الرئيسي للمكتبة"
                      src={heroItem.coverUrl || "/alaqeeq-hero-light.png"}
                      alt={heroItem.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-108 transition-transform duration-1000 ease-out"
                    />

                    {/* Gradient Depth Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent z-10" />

                    {/* Top Floating Badge Bar */}
                    <div className="absolute top-6 inset-x-6 sm:inset-x-10 z-20 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black backdrop-blur-md border ${
                        dark 
                          ? "bg-black/60 border-white/20 text-[#f8ca14]" 
                          : "bg-white/80 border-black/10 text-[#08467d]"
                      }`}>
                        {currentConfig.icon}
                        <span>{currentConfig.heroBadge}</span>
                      </span>

                      <span className="text-[11px] font-mono text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        {heroItem.dateOrMeta}
                      </span>
                    </div>

                    {/* Audio Spectrum Visualizer (When Podcast Tab) */}
                    {activeTab === "podcasts" && (
                      <div className="absolute top-20 right-6 sm:right-10 z-20 hidden sm:flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full">
                        <Volume2 size={14} className="text-indigo-400" />
                        <div className="flex items-center gap-0.5 h-3">
                          {[6, 12, 8, 14, 5, 10, 13, 7].map((h, i) => (
                            <motion.span
                              key={i}
                              animate={{ height: [4, h, 3] }}
                              transition={{ duration: 0.7 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
                              className="w-1 bg-indigo-400 rounded-full inline-block"
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-indigo-300 mr-1">صوت فائق النقاوة</span>
                      </div>
                    )}

                    {/* Hero Content */}
                    <div className="relative z-20 text-white">
                      <h3 className="text-2xl sm:text-4xl font-black font-cairo leading-tight mb-3 group-hover:text-[#f8ca14] transition-colors drop-shadow-lg">
                        {heroItem.title}
                      </h3>
                      {heroItem.excerpt && (
                        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mb-6 line-clamp-2 leading-relaxed">
                          {heroItem.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          className={`font-black px-7 py-3 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm shadow-xl transition-all duration-300 group-hover:scale-105 active:scale-95 ${
                            dark
                              ? "bg-[#f8ca14] text-black hover:bg-[#e6b90f]"
                              : "bg-[#08467d] text-white hover:bg-[#063863]"
                          }`}
                        >
                          {activeTab === "podcasts" ? <Play size={16} className="fill-current" /> : <Eye size={16} />}
                          <span>{activeTab === "podcasts" ? "تشغيل الحلقة الصوتية" : "استعراض العمل بالكامل"}</span>
                          <ArrowUpLeft size={16} className="transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
                        </button>

                        <span className="text-xs text-slate-400 font-bold hidden sm:inline-block">
                          اضغط للمعاينة الفورية
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 📚 2. LEFT: THE INTERACTIVE GLASS COLLECTION DECK (5 COLS) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
                {deckItems.length > 0 ? (
                  deckItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ x: -8, scale: 1.015 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      onClick={() => {
                        if (activeTab === "podcasts") {
                          const pod = podcasts.find((p) => p.id === item.id);
                          if (pod) playEpisode(pod);
                        } else {
                          navigate(item.href);
                        }
                      }}
                      className={`group cursor-pointer rounded-[1.8rem] border p-4 sm:p-5 flex items-center gap-4 transition-all duration-300 shadow-md ${
                        dark
                          ? "bg-[#0d141d]/75 border-white/10 hover:border-[#f8ca14]/40 hover:bg-[#121c27]"
                          : "bg-white/90 border-slate-200 hover:border-[#08467d]/40 hover:bg-slate-50"
                      }`}
                    >
                      {/* Numeric Index Badge */}
                      <div className={`w-8 h-8 rounded-xl font-mono text-xs font-black flex items-center justify-center shrink-0 border ${
                        dark 
                          ? "bg-white/5 border-white/10 text-slate-400 group-hover:text-[#f8ca14] group-hover:border-[#f8ca14]/40" 
                          : "bg-slate-100 border-black/10 text-slate-600 group-hover:text-[#08467d]"
                      }`}>
                        0{idx + 2}
                      </div>

                      {/* Thumbnail Preview */}
                      <div className="relative h-20 w-24 sm:h-22 sm:w-28 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-md">
                        <img
                          src={item.coverUrl || "/alaqeeq-hero-light.png"}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors" />
                        {activeTab === "podcasts" && (
                          <div className="absolute inset-0 m-auto h-7 w-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white">
                            <Play size={12} className="fill-current" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 text-right">
                        <span className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${
                          dark ? "text-[#f8ca14]" : "text-[#08467d]"
                        }`}>
                          {item.badge}
                        </span>
                        <h4 className={`text-xs sm:text-sm font-black truncate leading-snug font-cairo group-hover:text-[#f8ca14] transition-colors ${
                          dark ? "text-white" : "text-black"
                        }`}>
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 truncate">
                          {item.dateOrMeta}
                        </p>
                      </div>

                      {/* Action Arrow */}
                      <div className={`grid h-8 w-8 place-items-center rounded-xl border shrink-0 transition-transform group-hover:-translate-x-1 ${
                        dark ? "border-white/10 bg-white/5 text-white" : "border-black/10 bg-slate-100 text-slate-700"
                      }`}>
                        <ArrowLeft size={14} />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 text-sm">
                    لا توجد عناصر إضافية في هذا القسم
                  </div>
                )}

                {/* View All Bar at bottom of deck */}
                <button
                  type="button"
                  onClick={() => navigate(currentConfig.viewAllHref)}
                  className={`w-full py-3.5 rounded-2xl border font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                    dark
                      ? "border-white/15 bg-white/5 hover:bg-white/10 text-white hover:border-[#f8ca14]/50"
                      : "border-slate-200 bg-white hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <span>{currentConfig.viewAllText}</span>
                  <ArrowUpLeft size={15} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </VisualEditable>
    </div>
  );
}
