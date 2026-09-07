import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, MotionValue, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowLeft, Sparkles, ChevronLeft, ExternalLink, Monitor } from "lucide-react";

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
    badge: "✦ لقطة حية من الرئيسية",
    description: "تصفح جولة الرانوناء الافتراضية، أحدث الأخبار المصورة، والخدمات الرقمية للمنسوبين وأولياء الأمور.",
    image: "/previews/home.webp",
    routePath: "alaqeeq.edu.sa/",
    stats: "30+ عاماً من التميز · المدينة المنورة",
    glowColor: "rgba(248, 202, 20, 0.28)",
  },
  about: {
    title: "مجمعات ومسارات العقيق",
    subtitle: "الرؤية والرسالة والبيئة النموذجية",
    badge: "✦ لقطة حية من صروحنا",
    description: "مجمع الرانوناء ومجمع البنات، معامل الروبوت والملاعب والمسبح نصف الأولمبي والمسار الأمريكي المعتمد.",
    image: "/previews/about.webp",
    routePath: "alaqeeq.edu.sa/about",
    stats: "بنين وبنات · مرافق متكاملة 4K",
    glowColor: "rgba(16, 185, 129, 0.28)",
  },
  accreditations: {
    title: "الاعتمادات الدولية والشراكات",
    subtitle: "أعلى معايير الجودة الأكاديمية العالمية",
    badge: "✦ لقطة حية من الاعتمادات",
    description: "اعتماد كوجنيا الأمريكي Cognia، المقر الرسمي لاختبارات SAT و ACT واختبارات IELTS الدولية المعتمدة.",
    image: "/previews/accreditations.webp",
    routePath: "alaqeeq.edu.sa/accreditations",
    stats: "Cognia USA · SAT / ACT / IELTS",
    glowColor: "rgba(8, 70, 125, 0.38)",
  },
  admissions: {
    title: "بوابة القبول وحاسبة الرسوم",
    subtitle: "احجز مقعدك للعام الجديد 2026 - 2027",
    badge: "✦ لقطة حية من التسجيل",
    description: "حاسبة الأقساط الذكية مع خصومات الأشقاء 15%، وخيارات التقسيط الميسر عبر تابي وتمارا بدون فوائد.",
    image: "/previews/admissions.webp",
    routePath: "alaqeeq.edu.sa/admissions",
    stats: "خصم الأشقاء 15% · تقسيط 4 دفعات",
    glowColor: "rgba(248, 202, 20, 0.32)",
  },
  journal: {
    title: "مجلة صوت العقيق الدورية",
    subtitle: "صحافة مدرسية بأقلام وإبداع الطلاب",
    badge: "✦ لقطة حية من قارئ 3D",
    description: "تصفح تفاعلي واقعي بتقليب الصفحات 3D وقراءة صوتية ذكية لكافة أعداد ومقالات العقيق الفصلية.",
    image: "/previews/journal.webp",
    routePath: "alaqeeq.edu.sa/journal",
    stats: "أعداد دورية · تقليب صفحات واقعي",
    glowColor: "rgba(244, 63, 94, 0.28)",
  },
  albums: {
    title: "ألبومات وتغطيات العقيق",
    subtitle: "توثيق فوتوغرافي لأجمل اللحظات والبطولات",
    badge: "✦ لقطة حية من المعرض",
    description: "تغطيات احتفالات التخرج، بطولات الروبوت WRO العالمية، المناسبات الوطنية والأنشطة اللاصفية.",
    image: "/previews/albums.webp",
    routePath: "alaqeeq.edu.sa/albums",
    stats: "صور فائقة الدقة 4K · تحميل مباشر",
    glowColor: "rgba(139, 92, 246, 0.28)",
  },
  podcast: {
    title: "أثير العقيق · راديو وبودكاست",
    subtitle: "حوارات فكرية وإذاعة مدرسية ملهمة",
    badge: "✦ لقطة حية من الاستوديو",
    description: "استمع لحلقات البودكاست التربوية، لقاءات الطلاب، والإذاعة الصباحية مع مشغل صوتي عائم متطور.",
    image: "/previews/podcast.webp",
    routePath: "alaqeeq.edu.sa/podcast",
    stats: "بث صوتي ومرئي · حلقات حصرية",
    glowColor: "rgba(168, 85, 247, 0.28)",
  },
  articles: {
    title: "مقالات وبحوث العقيق",
    subtitle: "منبر الفكر والتربية والإبداع الأكاديمي",
    badge: "✦ لقطة حية من المقالات",
    description: "مقالات حول الذكاء الاصطناعي في التعليم، مهارات المستقبل، وأبحاث متميزة بقلم نخبة المعلمين والطلاب.",
    image: "/previews/articles.webp",
    routePath: "alaqeeq.edu.sa/articles",
    stats: "قراءات ملهمة · وقت القراءة التقديري",
    glowColor: "rgba(6, 182, 212, 0.28)",
  },
  showcase: {
    title: "المعرض المرئي والأخبار",
    subtitle: "تغطيات حية ومقاطع سينمائية متجددة",
    badge: "✦ لقطة حية من الأخبار",
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

// ── Physics-based Dock Item with Continuous Wave Magnification ──
function HeaderDockNavItem({
  item,
  mouseX,
  dark,
  isHovered,
  onHover,
  onLeave,
  onNavigate,
  onMeasure,
}: {
  item: NavDockItemConfig;
  mouseX: MotionValue<number>;
  dark: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onNavigate: () => void;
  onMeasure: (centerOffsetX: number) => void;
}) {
  const itemRef = useRef<HTMLButtonElement>(null);

  // Influence radius in pixels for the macOS Dock bell curve
  const distance = 110;

  const mouseDistance = useTransform(mouseX, (val) => {
    if (!itemRef.current || val === Infinity) return Infinity;
    const rect = itemRef.current.getBoundingClientRect();
    return val - (rect.x + rect.width / 2);
  });

  // Bell-curve scale magnification: peaks at ~1.24 directly under cursor
  const scaleTransform = useTransform(
    mouseDistance,
    [-distance, -distance * 0.5, 0, distance * 0.5, distance],
    [1, 1.08, 1.24, 1.08, 1]
  );

  // Subtle vertical floating elevation (-2.5px at center)
  const yTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [0, -2.5, 0]
  );

  // Spring physics for natural Apple-grade elasticity
  const springConfig = { mass: 0.1, stiffness: 350, damping: 22 };
  const scale = useSpring(scaleTransform, springConfig);
  const y = useSpring(yTransform, springConfig);

  const handleMouseEnter = () => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      onMeasure(rect.x + rect.width / 2);
    }
    onHover();
  };

  return (
    <motion.div
      style={{ scale, y, transformOrigin: "center center" }}
      className="relative z-10 shrink-0"
    >
      <button
        ref={itemRef}
        type="button"
        onClick={onNavigate}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onLeave}
        data-visual-id={item.visualId}
        data-visual-tag="text"
        data-visual-label={item.visualLabel}
        className={`relative px-2.5 py-1 rounded-full transition-colors duration-150 cursor-pointer select-none ${
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
        {/* Subtle illuminated capsule background on active/hover */}
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

        {isHovered && !item.active && (
          <motion.div
            layoutId="header-dock-hover-pill"
            className={`absolute inset-0 rounded-full border pointer-events-none ${
              dark
                ? "bg-white/8 border-white/15 shadow-[0_2px_10px_rgba(255,255,255,0.08)]"
                : "bg-slate-100 border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            }`}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
          />
        )}

        <span className="relative z-10 inline-block font-bold tracking-tight">
          {item.label}
        </span>
      </button>
    </motion.div>
  );
}

export function HeaderDockNav({ items, dark, onNavigate }: HeaderDockNavProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [cardCenterOffset, setCardCenterOffset] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navContainerRef = useRef<HTMLElement | null>(null);

  // Framer Motion continuous mouse coordinate for continuous wave physics
  const mouseX = useMotionValue(Infinity);

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

  const handleMeasureItem = (itemCenterGlobalX: number) => {
    if (navContainerRef.current) {
      const navRect = navContainerRef.current.getBoundingClientRect();
      const relativeX = itemCenterGlobalX - navRect.left;
      // Clamp relativeX to avoid preview card spilling off screen
      const minX = 190;
      const maxX = Math.max(minX, navRect.width - 190);
      const clampedX = Math.max(minX, Math.min(relativeX, maxX));
      setCardCenterOffset(clampedX);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const activeHoverItem = items.find((it) => it.key === hoveredKey);
  const preview = hoveredKey ? PREVIEW_DATA[hoveredKey] : null;

  return (
    <nav
      ref={navContainerRef}
      dir="rtl"
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => {
        mouseX.set(Infinity);
        handleMouseLeaveItem();
      }}
      className="relative hidden lg:flex items-center justify-self-center gap-1 xl:gap-1.5 whitespace-nowrap text-[13px] font-['Tajawal',sans-serif] pointer-events-auto select-none py-1 px-1 rounded-full"
      role="toolbar"
      aria-label="شريط التنقل التفاعلي الذكي"
    >
      {items.map((item) => {
        const isHovered = hoveredKey === item.key;
        return (
          <HeaderDockNavItem
            key={item.key}
            item={item}
            mouseX={mouseX}
            dark={dark}
            isHovered={isHovered}
            onHover={() => handleMouseEnterItem(item.key)}
            onLeave={handleMouseLeaveItem}
            onNavigate={() => {
              setHoveredKey(null);
              onNavigate(item.path);
            }}
            onMeasure={handleMeasureItem}
          />
        );
      })}

      {/* ── Realistic Live Page Screenshot Preview Card ── */}
      <AnimatePresence>
        {preview && activeHoverItem && (
          <div
            className="absolute top-full left-0 right-0 pointer-events-auto z-[300] pt-2"
            onMouseEnter={handleMouseEnterCard}
            onMouseLeave={handleMouseLeaveCard}
          >
            <motion.div
              layout
              initial={{ opacity: 0, y: 12, scale: 0.94 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                left: cardCenterOffset !== null ? cardCenterOffset : "50%",
                x: "-50%",
              }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              onClick={() => {
                setHoveredKey(null);
                onNavigate(activeHoverItem.path);
              }}
              className={`group absolute w-[390px] rounded-[1.6rem] border p-3.5 shadow-2xl backdrop-blur-2xl transition-all duration-200 overflow-hidden cursor-pointer ${
                dark
                  ? "bg-[#080d16]/95 border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(248,202,20,0.06)] text-white"
                  : "bg-white/96 border-slate-200/90 shadow-[0_24px_60px_rgba(8,70,125,0.2),0_0_30px_rgba(8,70,125,0.08)] text-slate-900"
              }`}
            >
              {/* Dynamic Glow Halo */}
              <div
                className="absolute -top-14 -right-14 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-500 opacity-60"
                style={{ backgroundColor: preview.glowColor }}
              />

              {/* Browser Window Header Chrome */}
              <div
                dir="ltr"
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-t-xl mb-2 border text-[11px] font-mono select-none ${
                  dark
                    ? "bg-black/40 border-white/10 text-slate-400"
                    : "bg-slate-100/90 border-slate-200 text-slate-600"
                }`}
              >
                {/* Traffic Light Dots */}
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block shadow-sm" />
                </div>

                {/* Simulated URL Bar */}
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-400 truncate max-w-[210px]">
                  <Monitor size={11} className="shrink-0 opacity-70" />
                  <span className="truncate">{preview.routePath}</span>
                </div>

                {/* Live Indicator */}
                <div className="flex items-center gap-1 text-[9px] font-sans font-bold text-emerald-500 shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>حي</span>
                </div>
              </div>

              {/* Realistic Page Screenshot Container */}
              <div className="relative h-[175px] w-full rounded-xl overflow-hidden mb-3 border border-black/10 dark:border-white/10 shadow-md bg-slate-900">
                <img
                  src={preview.image}
                  alt={preview.title}
                  loading="eager"
                  className="w-full h-full object-cover object-top select-none transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  onError={(e) => {
                    // Fallback to png if webp fails
                    const target = e.currentTarget;
                    if (target.src.endsWith(".webp")) {
                      target.src = target.src.replace(".webp", ".png");
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                {/* Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <span className="rounded-lg bg-black/70 border border-white/20 px-2 py-0.5 text-[10px] font-black text-amber-300 backdrop-blur-md flex items-center gap-1 shadow-md">
                    <Sparkles size={11} className="text-amber-300" />
                    <span>{preview.badge}</span>
                  </span>
                </div>

                {/* Bottom title inside screenshot */}
                <div className="absolute inset-x-0 bottom-0 p-2.5 z-10 text-right">
                  <span className="text-[10px] font-bold text-amber-300 block mb-0.5">
                    {preview.subtitle}
                  </span>
                  <h4 className="text-sm font-black text-white drop-shadow-md">
                    {preview.title}
                  </h4>
                </div>
              </div>

              {/* Card Description */}
              <p
                className={`text-xs leading-relaxed line-clamp-2 mb-2.5 font-medium ${
                  dark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {preview.description}
              </p>

              {/* Card Footer with Quick Jump Action */}
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
                  <span>فتح الصفحة الآن</span>
                  <ChevronLeft size={14} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}
