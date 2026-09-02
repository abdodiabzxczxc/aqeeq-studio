import { useState } from "react";
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
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";

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
  const [activeTab, setActiveTab] = useState<"podcasts" | "articles" | "albums" | "journal" | "showcase">("podcasts");



  // Fetch data for all systems
  const { data: podcasts = [] } = trpc.podcasts.list.useQuery({});
  const { data: articles = [] } = trpc.articles.listPublished.useQuery({});
  const { data: albums = [] } = trpc.aqeeqAlbums.publicList.useQuery(undefined);
  const { data: issues = [] } = trpc.schoolNews.publicList.useQuery(undefined);
  const { data: showcase } = trpc.aqeeqShowcases.publicShowcase.useQuery({ slug: "news-offers" });

  const tabs = [
    { id: "podcasts", label: "البودكاست", icon: <Mic size={15} />, count: podcasts.length },
    { id: "articles", label: "المقالات", icon: <Newspaper size={15} />, count: articles.length },
    { id: "albums", label: "الألبومات", icon: <ImageIcon size={15} />, count: albums.length },
    { id: "journal", label: "المجلة", icon: <BookOpen size={15} />, count: issues.length },
    { id: "showcase", label: "العروض", icon: <Clapperboard size={15} />, count: showcase?.posts?.length || 0 },
  ] as const;

  // Build unified items for current tab
  const getTabConfig = () => {
    switch (activeTab) {
      case "podcasts":
        return {
          title: "حلقات صوت العقيق الإذاعية",
          subtitle: "استمع لأحدث الحوارات، الإذاعات المدرسية واللقاءات الحصرية المسجلة.",
          viewAllText: "تصفح جميع الحلقات",
          viewAllHref: "/podcast",
          badgeColor: dark ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: <Mic size={18} className="text-indigo-400" />,
          items: podcasts.slice(0, 4).map((p): UnifiedLibraryCardItem => ({
            id: p.id,
            title: p.title,
            coverUrl: directDriveImage(p.coverUrl),
            badge: "بودكاست",
            dateOrMeta: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("ar-SA") : "تسجيل صوتي",
            href: "/podcast",
          }))
        };
      case "articles":
        return {
          title: "أحدث المقالات والنشرات",
          subtitle: "قراءات فكرية وتربوية وتغطيات خبرية متكاملة بقلم أسرة العقيق.",
          viewAllText: "قراءة كافة المقالات",
          viewAllHref: "/articles",
          badgeColor: dark ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-rose-50 text-rose-700 border-rose-200",
          icon: <Newspaper size={18} className="text-rose-400" />,
          items: articles.slice(0, 4).map((a): UnifiedLibraryCardItem => ({
            id: a.id,
            title: a.title,
            coverUrl: directDriveImage(a.coverUrl),
            badge: "مقال ونشرة",
            dateOrMeta: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("ar-SA") : "قراءة صحفية",
            href: `/articles/${a.slug}`,
          }))
        };
      case "albums":
        return {
          title: "ألبومات الفعاليات والأنشطة",
          subtitle: "معرض الصور التذكارية والفوتوغرافية لأهم لحظات ومناسبات المدارس.",
          viewAllText: "استكشاف جميع الألبومات",
          viewAllHref: "/albums",
          badgeColor: dark ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <ImageIcon size={18} className="text-emerald-400" />,
          items: albums.slice(0, 4).map((al): UnifiedLibraryCardItem => ({
            id: al.id,
            title: al.title,
            coverUrl: directDriveImage(al.coverUrl),
            badge: "ألبوم صور",
            dateOrMeta: (al as any).eventDate || (al.publishedAt ? new Date(al.publishedAt).toLocaleDateString("ar-SA") : "أرشيف مصور"),
            href: `/albums/${al.slug}`,
          }))
        };
      case "journal":
        return {
          title: "أعداد المجلة المدرسية التفاعلية",
          subtitle: "إصدارات دورية إلكترونية بتقليب صفحات تفاعلي وتصميم صحفي راقٍ.",
          viewAllText: "أرشيف المجلة الكامل",
          viewAllHref: "/journal",
          badgeColor: dark ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200",
          icon: <BookOpen size={18} className="text-amber-400" />,
          items: issues.slice(0, 4).map((i): UnifiedLibraryCardItem => ({
            id: i.id,
            title: i.title,
            coverUrl: directDriveImage(i.coverUrl),
            badge: "مجلة دورية",
            dateOrMeta: i.publishedAt ? new Date(i.publishedAt).toLocaleDateString("ar-SA") : "عدد رقمي",
            href: `/journal/issue/${i.slug}`,
          }))
        };
      case "showcase":
        const posts = (showcase?.posts || []) as any[];
        return {
          title: "شاشة العروض والتغطيات الحية",
          subtitle: "منشورات فورية وفيديوهات ملهمة توثق حياة المدارس اليومية خطوة بخطوة.",
          viewAllText: "مشاهدة شاشة العروض",
          viewAllHref: "/offers",
          badgeColor: dark ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "bg-cyan-50 text-cyan-700 border-cyan-200",
          icon: <Clapperboard size={18} className="text-cyan-400" />,
          items: posts.slice(0, 4).map((post): UnifiedLibraryCardItem => ({
            id: post.id,
            title: post.title || post.caption || "عرض وتغطية مباشرة",
            coverUrl: directDriveImage(post.thumbnailUrl || post.mediaUrl),
            badge: "تغطية حية",
            dateOrMeta: post.createdAt ? new Date(post.createdAt).toLocaleDateString("ar-SA") : "عرض حي",
            href: "/offers",
          }))
        };
    }
  };

  const currentConfig = getTabConfig();

  return (
    <VisualEditable
      id="studio-library-section"
      tag="section"
      label="قسم استكشف المكتبة"
      as="section"
      className={`w-full py-14 md:py-20 ${
        isNationalDay
          ? dark ? "snd-library-dark" : "snd-library-light"
          : dark ? "bg-[#050505]" : "bg-white"
      }`}
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Unified Section Header */}
        <div className="mb-8 sm:mb-10 text-right">
          <VisualEditable
            id="studio-library-kicker"
            tag="text"
            label="شارة استكشف المكتبة"
            defaultText={isNationalDay ? "🇸🇦 أرشيف العقيق الوطني الكامل" : "EXPLORE LIBRARY · ALL IN ONE"}
            as="span"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-3 text-[10px] font-black tracking-widest uppercase ${
              isNationalDay
                ? "snd-kicker-badge border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
                : dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
            }`}
          >
            {(text) => (
              <>
                <BookOpen size={12} />

                <span>{text}</span>
              </>
            )}
          </VisualEditable>
          <VisualEditable
            id="studio-library-title"
            tag="text"
            label="عنوان استكشف المكتبة"
            defaultText={titleOverride || "استكشف المكتبة"}
            as="h2"
            className={`text-2xl sm:text-4xl font-black font-cairo ${dark ? "text-white" : "text-black"}`}
          />
          <VisualEditable
            id="studio-library-desc"
            tag="text"
            label="وصف استكشف المكتبة"
            defaultText={descOverride || "تصفح متكامل وشامل لجميع أرشيفات البودكاست، المقالات، الألبومات والمجلات المدرسية."}
            as="p"
            className={`mt-2 max-w-xl text-xs sm:text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}
          />
        </div>

        {/* Tab Switcher Buttons — horizontal scroll on mobile */}
        <div className="flex items-center gap-2 sm:gap-3 mb-8 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex shrink-0 items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-black text-xs sm:text-sm transition-all duration-200 ${
                  isActive
                    ? isNationalDay
                      ? "snd-tab-active bg-gradient-to-r from-[#005A36] to-[#5aba1c] text-white shadow-[0_4px_18px_rgba(0,90,54,0.4)] scale-105"
                      : dark
                      ? "bg-[#f8ca14] text-black shadow-[0_0_20px_rgba(248,202,20,0.25)] scale-105"
                      : "bg-[#08467d] text-white shadow-[0_0_20px_rgba(8,70,125,0.25)] scale-105"
                    : isNationalDay
                    ? dark
                      ? "bg-white/[0.04] text-emerald-300 hover:text-[#f8ca14] border border-[#5aba1c]/20"
                      : "bg-[#f0fdf4] text-[#005A36] hover:bg-[#e0faea] border border-[#005A36]/15"
                    : dark
                    ? "bg-white/[0.05] text-slate-300 hover:bg-white/[0.09] border border-white/[0.08]"
                    : "bg-black/[0.03] text-slate-700 hover:bg-black/[0.06] border border-black/[0.06]"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? dark ? "bg-black/20 text-black" : "bg-white/20 text-white"
                      : dark ? "bg-white/10 text-slate-400" : "bg-black/10 text-slate-600"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>


        {/* ========================================================================= */}
        {/* UNIFIED FRAME CONTAINER (Fixed, Identical Structure Across ALL Tabs) */}
        {/* ========================================================================= */}
        <div className={`rounded-[2rem] border transition-all duration-300 overflow-hidden ${
          dark 
            ? "border-white/[0.08] bg-[#0d0d0d] shadow-2xl" 
            : "border-black/[0.08] bg-slate-50/70 shadow-lg"
        }`}>
          
          {/* Frame Top Header */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 sm:px-8 py-5 border-b ${
            dark ? "border-white/[0.08] bg-black/30" : "border-black/[0.05] bg-white/70"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${dark ? "border-white/10 bg-white/5" : "border-black/10 bg-white shadow-sm"}`}>
                {currentConfig.icon}
              </div>
              <div>
                <VisualEditable
                  id={`studio-library-frame-title-${activeTab}`}
                  tag="text"
                  label={`عنوان إطار ${activeTab}`}
                  defaultText={currentConfig.title}
                  as="h3"
                  className={`text-base sm:text-lg font-black ${dark ? "text-white" : "text-black"}`}
                />
                <VisualEditable
                  id={`studio-library-frame-desc-${activeTab}`}
                  tag="text"
                  label={`وصف إطار ${activeTab}`}
                  defaultText={currentConfig.subtitle}
                  as="p"
                  className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(currentConfig.viewAllHref)}
              className={`self-start sm:self-auto shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs transition hover:scale-105 ${
                dark 
                  ? "bg-white/10 hover:bg-white/15 text-white border border-white/10" 
                  : "bg-black/5 hover:bg-black/10 text-black border border-black/10"
              }`}
            >
              <VisualEditable
                id={`studio-library-frame-btn-${activeTab}`}
                tag="text"
                label={`زر إطار ${activeTab}`}
                defaultText={currentConfig.viewAllText}
                as="span"
              />
              <ArrowLeft size={14} />
            </button>
          </div>

          {/* Frame Cards Body — horizontal scroll on mobile, grid on desktop */}
          <div className="p-4 sm:p-6 md:p-8 min-h-[260px] sm:min-h-[380px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                {currentConfig.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
                    <div className={`p-4 rounded-full mb-3 opacity-30 ${dark ? "text-white bg-white/5" : "text-black bg-black/5"}`}>
                      {currentConfig.icon}
                    </div>
                    <p className={`text-sm font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>
                      لا توجد عناصر منشورة حالياً في هذا القسم.
                    </p>
                  </div>
                ) : (
                  /* Mobile: horizontal scroll / Desktop: 4-col grid */
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 sm:overflow-visible sm:pb-0">
                    {currentConfig.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate(item.href)}
                        className={`group cursor-pointer rounded-2xl overflow-hidden border flex flex-col shrink-0 w-[200px] sm:w-auto h-[280px] sm:h-[320px] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                          dark
                            ? "border-white/[0.08] bg-[#141414] hover:border-white/20"
                            : "border-black/[0.08] bg-white hover:border-black/20"
                        }`}
                      >
                        {/* Image Container */}
                        <div className="relative h-[140px] sm:h-[180px] w-full shrink-0 overflow-hidden bg-slate-900/30">
                          {item.coverUrl ? (
                            <img
                              src={item.coverUrl}
                              alt={item.title}
                              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                              {currentConfig.icon}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                          <div className="absolute top-2.5 right-2.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black border backdrop-blur-md ${currentConfig.badgeColor}`}>
                              {item.badge}
                            </span>
                          </div>
                        </div>

                        {/* Card Info */}
                        <div className="p-3 sm:p-4 flex flex-col justify-between flex-1">
                          <h4 className={`text-xs sm:text-sm font-black line-clamp-2 leading-snug transition-colors group-hover:text-amber-400 ${
                            dark ? "text-white" : "text-black"
                          }`}>
                            {item.title}
                          </h4>
                          <div className={`mt-auto pt-2 sm:pt-3 border-t flex items-center justify-between text-[10px] sm:text-[11px] font-bold ${
                            dark ? "border-white/[0.06] text-slate-400" : "border-black/[0.05] text-slate-500"
                          }`}>
                            <span className="flex items-center gap-1">
                              <Calendar size={10} className="opacity-60" />
                              <span>{item.dateOrMeta}</span>
                            </span>
                            <span className={`font-black flex items-center gap-1 group-hover:underline ${
                              dark ? "text-[#f8ca14]" : "text-[#08467d]"
                            }`}>
                              <span>عرض</span>
                              <ArrowLeft size={10} />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </VisualEditable>
  );
}
