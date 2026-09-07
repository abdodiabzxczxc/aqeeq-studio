import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, Monitor } from "lucide-react";

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
  routePath: string;
  stats: string;
  glowColor: string;
}

const PREVIEW_DATA: Record<string, PagePreviewMetadata> = {
  home: {
    title: "بوابة مدارس العقيق الذكية",
    subtitle: "الصرح التعليمي والافتراضي المتكامل",
    badge: "✦ كافر الهيدر الرسمي",
    description: "استكشف جولة الرانوناء الافتراضية، أحدث الأخبار المصورة، والخدمات الرقمية للمنسوبين والطلاب.",
    image: "/previews/home.webp",
    routePath: "alaqeeq.edu.sa/",
    stats: "30+ عاماً من التميز · المدينة",
    glowColor: "rgba(248, 202, 20, 0.28)",
  },
  about: {
    title: "مجمعات ومسارات العقيق",
    subtitle: "الرؤية والرسالة والبيئة النموذجية",
    badge: "✦ كافر هيدر صروحنا",
    description: "مجمع الرانوناء ومجمع البنات، الملاعب والمسبح نصف الأولمبي والمسار الأمريكي المعتمد.",
    image: "/previews/about.webp",
    routePath: "alaqeeq.edu.sa/about",
    stats: "بنين وبنات · مرافق متكاملة",
    glowColor: "rgba(16, 185, 129, 0.28)",
  },
  accreditations: {
    title: "الاعتمادات الدولية والشراكات",
    subtitle: "أعلى معايير الجودة الأكاديمية العالمية",
    badge: "✦ كافر هيدر الاعتمادات",
    description: "اعتماد كوجنيا الأمريكي Cognia، المقر الرسمي لاختبارات SAT و ACT واختبارات IELTS الدولية المعتمدة.",
    image: "/previews/accreditations.webp",
    routePath: "alaqeeq.edu.sa/accreditations",
    stats: "Cognia USA · SAT / IELTS",
    glowColor: "rgba(8, 70, 125, 0.38)",
  },
  admissions: {
    title: "بوابة القبول وحاسبة الرسوم",
    subtitle: "احجز مقعدك للعام الجديد 2026 - 2027",
    badge: "✦ كافر هيدر التسجيل",
    description: "حاسبة الأقساط الذكية مع خصومات الأشقاء 15%، وخيارات التقسيط الميسر عبر تابي وتمارا بدون فوائد.",
    image: "/previews/admissions.webp",
    routePath: "alaqeeq.edu.sa/admissions",
    stats: "خصم الأشقاء 15% · تقسيط 4 دفعات",
    glowColor: "rgba(248, 202, 20, 0.32)",
  },
  journal: {
    title: "مجلة صوت العقيق الدورية",
    subtitle: "صحافة مدرسية بأقلام وإبداع الطلاب",
    badge: "✦ كافر هيدر المجلة 3D",
    description: "تصفح تفاعلي واقعي بتقليب الصفحات 3D وقراءة صوتية ذكية لكافة أعداد ومقالات العقيق الفصلية.",
    image: "/previews/journal.webp",
    routePath: "alaqeeq.edu.sa/journal",
    stats: "أعداد دورية · تقليب ثلاثي الأبعاد",
    glowColor: "rgba(244, 63, 94, 0.28)",
  },
  albums: {
    title: "ألبومات وتغطيات العقيق",
    subtitle: "توثيق فوتوغرافي لأجمل اللحظات والبطولات",
    badge: "✦ كافر هيدر الألبومات",
    description: "تغطيات احتفالات التخرج، بطولات الروبوت WRO العالمية، المناسبات الوطنية والأنشطة اللاصفية.",
    image: "/previews/albums.webp",
    routePath: "alaqeeq.edu.sa/albums",
    stats: "صور فائقة الدقة 4K · تحميل مباشر",
    glowColor: "rgba(139, 92, 246, 0.28)",
  },
  podcast: {
    title: "أثير العقيق · راديو وبودكاست",
    subtitle: "حوارات فكرية وإذاعة مدرسية ملهمة",
    badge: "✦ كافر هيدر أثير",
    description: "استمع لحلقات البودكاست التربوية، لقاءات الطلاب، والإذاعة الصباحية مع مشغل صوتي عائم متطور.",
    image: "/previews/podcast.webp",
    routePath: "alaqeeq.edu.sa/podcast",
    stats: "بث صوتي ومرئي · حلقات حصرية",
    glowColor: "rgba(168, 85, 247, 0.28)",
  },
  articles: {
    title: "مقالات وبحوث العقيق",
    subtitle: "منبر الفكر والتربية والإبداع الأكاديمي",
    badge: "✦ كافر هيدر المقالات",
    description: "مقالات حول الذكاء الاصطناعي في التعليم، مهارات المستقبل، وأبحاث متميزة بقلم نخبة المعلمين والطلاب.",
    image: "/previews/articles.webp",
    routePath: "alaqeeq.edu.sa/articles",
    stats: "قراءات ملهمة · وقت القراءة التقديري",
    glowColor: "rgba(6, 182, 212, 0.28)",
  },
  showcase: {
    title: "المعرض المرئي والأخبار",
    subtitle: "تغطيات حية ومقاطع سينمائية متجددة",
    badge: "✦ كافر هيدر الأخبار",
    description: "أحدث الفعاليات اليومية، فيديوهات المعارض المدرسية، والإعلانات الرسمية الصادرة من الإدارة العامة.",
    image: "/previews/showcase.webp",
    routePath: "alaqeeq.edu.sa/showcase",
    stats: "فيديوهات وتحديثات حية يومية",
    glowColor: "rgba(234, 88, 12, 0.28)",
  },
};

interface HeaderDockNavProps {
  items: NavDockItemConfig[];
  dark: boolean;
  onNavigate: (path: string) => void;
}

export function HeaderDockNav({ items, dark, onNavigate }: HeaderDockNavProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        const preview = PREVIEW_DATA[item.key];

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

            {/* ── Realistic Header Cover Live Preview — Positioned Directly Underneath THIS Specific Word! ── */}
            <AnimatePresence>
              {isHovered && preview && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-2.5 z-[350] pointer-events-auto"
                  onMouseEnter={handleMouseEnterCard}
                  onMouseLeave={handleMouseLeaveCard}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 450, damping: 28 }}
                    onClick={() => {
                      setHoveredKey(null);
                      onNavigate(item.path);
                    }}
                    className={`group w-[300px] sm:w-[320px] rounded-[1.4rem] border p-3 shadow-2xl backdrop-blur-2xl transition-all duration-200 overflow-hidden cursor-pointer ${
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

                      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 truncate max-w-[170px]">
                        <Monitor size={10} className="shrink-0 opacity-70" />
                        <span className="truncate">{preview.routePath}</span>
                      </div>

                      <span className="text-[9px] font-sans font-bold text-amber-400 shrink-0">
                        كافر الهيدر
                      </span>
                    </div>

                    {/* Actual Page Header Cover Snapshot */}
                    <div className="relative h-[155px] w-full rounded-xl overflow-hidden mb-2.5 border border-black/10 dark:border-white/10 bg-slate-950 shadow-inner">
                      <img
                        src={preview.image}
                        alt={preview.title}
                        loading="eager"
                        className="w-full h-full object-cover object-top select-none transition-transform duration-500 group-hover:scale-[1.02]"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src.endsWith(".webp")) {
                            target.src = target.src.replace(".webp", ".png");
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                      {/* Floating Badge on Cover */}
                      <div className="absolute top-2 right-2 z-10">
                        <span className="rounded-lg bg-black/70 border border-white/20 px-2 py-0.5 text-[9px] font-black text-amber-300 backdrop-blur-md flex items-center gap-1 shadow-md">
                          <Sparkles size={10} className="text-amber-300" />
                          <span>{preview.badge}</span>
                        </span>
                      </div>

                      {/* Header Title & Subtitle Over Cover */}
                      <div className="absolute inset-x-0 bottom-0 p-2.5 z-10 text-right">
                        <span className="text-[10px] font-bold text-amber-300 block mb-0.5">
                          {preview.subtitle}
                        </span>
                        <h4 className="text-sm font-black text-white drop-shadow-md">
                          {preview.title}
                        </h4>
                      </div>
                    </div>

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
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                        <span>✦</span>
                        <span>{preview.stats}</span>
                      </span>

                      <div
                        className={`flex items-center gap-1 group-hover:-translate-x-1 transition-transform font-black ${
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
