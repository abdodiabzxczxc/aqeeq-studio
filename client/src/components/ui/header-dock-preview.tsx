import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, ChevronLeft, ExternalLink } from "lucide-react";

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
  stats: string;
  glowColor: string;
}

const PREVIEW_DATA: Record<string, PagePreviewMetadata> = {
  home: {
    title: "بوابة مدارس العقيق الذكية",
    subtitle: "الصرح التعليمي والافتراضي المتكامل",
    badge: "✦ البوابة الرسمية",
    description: "استكشف جولة الرانوناء الافتراضية، أحدث أخبار المجمعات، والخدمات الذكية للطلاب وأولياء الأمور.",
    image: "/covers/cover-about.jpg",
    stats: "30+ عاماً من التميز · المدينة المنورة",
    glowColor: "rgba(248, 202, 20, 0.25)",
  },
  about: {
    title: "مجمعات ومسارات العقيق",
    subtitle: "الرؤية والرسالة والبيئة النموذجية",
    badge: "✦ صروحنا التعليمية",
    description: "مجمع الرانوناء ومجمع البنات، معامل الروبوت والملاعب والمسبح نصف الأولمبي والمسار الأمريكي المعتمد.",
    image: "/covers/cover-about.jpg",
    stats: "بنين وبنات · مرافق متكاملة 4K",
    glowColor: "rgba(16, 185, 129, 0.25)",
  },
  accreditations: {
    title: "الاعتمادات الدولية والشراكات",
    subtitle: "أعلى معايير الجودة الأكاديمية العالمية",
    badge: "✦ معايير دولية",
    description: "اعتماد كوجنيا الأمريكي Cognia، المقر الرسمي لاختبارات SAT و ACT واختبارات IELTS المعتمدة دولياً.",
    image: "/covers/cover-accreditations.jpg",
    stats: "Cognia USA · SAT / ACT / IELTS",
    glowColor: "rgba(8, 70, 125, 0.35)",
  },
  admissions: {
    title: "بوابة القبول وحاسبة الرسوم",
    subtitle: "احجز مقعدك للعام الجديد 2026 - 2027",
    badge: "✦ التسجيل المبكر",
    description: "حاسبة الأقساط الذكية مع خصومات الأشقاء 15%، وخيارات التقسيط الميسر عبر تابي وتمارا بدون فوائد.",
    image: "/covers/student-lab-admissions.jpg",
    stats: "خصم الأشقاء 15% · تقسيط 4 دفعات",
    glowColor: "rgba(248, 202, 20, 0.3)",
  },
  journal: {
    title: "مجلة صوت العقيق الدورية",
    subtitle: "صحافة مدرسية بأقلام وإبداع الطلاب",
    badge: "✦ مجلة إلكترونية 3D",
    description: "تصفح تفاعلي واقعي بتقليب الصفحات 3D وقراءة صوتية ذكية لكافة أعداد ومقالات العقيق الفصلية.",
    image: "/covers/student-excellence-about.jpg",
    stats: "أعداد فصلية · تقليب صفحات واقعي",
    glowColor: "rgba(244, 63, 94, 0.25)",
  },
  albums: {
    title: "ألبومات وتغطيات العقيق",
    subtitle: "توثيق فوتوغرافي لأجمل اللحظات والبطولات",
    badge: "✦ منصات التتويج",
    description: "تغطيات احتفالات التخرج، بطولات الروبوت WRO العالمية، المناسبات الوطنية والأنشطة اللاصفية.",
    image: "/covers/first-lego-champions.png",
    stats: "صور فائقة الدقة 4K · تحميل مباشر",
    glowColor: "rgba(139, 92, 246, 0.25)",
  },
  podcast: {
    title: "أثير العقيق · راديو وبودكاست",
    subtitle: "حوارات فكرية وإذاعة مدرسية ملهمة",
    badge: "✦ استوديو أثير",
    description: "استمع لحلقات البودكاست التربوية، لقاءات الطلاب، والإذاعة الصباحية مع مشغل صوتي عائم متطور.",
    image: "/covers/aqeeq-anthems-royal-cover.jpg",
    stats: "بث صوتي ومرئي · حلقات حصرية",
    glowColor: "rgba(168, 85, 247, 0.25)",
  },
  articles: {
    title: "مقالات وبحوث العقيق",
    subtitle: "منبر الفكر والتربية والإبداع الأكاديمي",
    badge: "✦ أوراق بحثية",
    description: "مقالات حول الذكاء الاصطناعي في التعليم، مهارات المستقبل، وأبحاث متميزة بقلم نخبة المعلمين والطلاب.",
    image: "/articles/ai-in-education-comprehensive-research.jpg",
    stats: "قراءات ملهمة · وقت القراءة التقديري",
    glowColor: "rgba(6, 182, 212, 0.25)",
  },
  showcase: {
    title: "المعرض المرئي والأخبار",
    subtitle: "تغطيات حية ومقاطع سينمائية متجددة",
    badge: "✦ مركز الأخبار",
    description: "أحدث الفعاليات اليومية، فيديوهات المعارض المدرسية، والإعلانات الرسمية الصادرة من الإدارة العامة.",
    image: "/covers/cover-admissions.jpg",
    stats: "فيديوهات وتحديثات حية يومية",
    glowColor: "rgba(234, 88, 12, 0.25)",
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
  const navContainerRef = useRef<HTMLElement | null>(null);

  // Clear hover timeout
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

  const activeHoverItem = items.find((it) => it.key === hoveredKey);
  const preview = hoveredKey ? PREVIEW_DATA[hoveredKey] : null;

  return (
    <nav
      ref={navContainerRef}
      dir="rtl"
      className="relative hidden lg:flex items-center justify-self-center gap-1.5 xl:gap-2.5 whitespace-nowrap text-[13px] font-bold font-['Tajawal',sans-serif] pointer-events-auto select-none"
    >
      {items.map((item) => {
        const isHovered = hoveredKey === item.key;
        return (
          <div
            key={item.key}
            className="relative"
            onMouseEnter={() => handleMouseEnterItem(item.key)}
            onMouseLeave={handleMouseLeaveItem}
          >
            <button
              type="button"
              onClick={() => {
                setHoveredKey(null);
                onNavigate(item.path);
              }}
              data-visual-id={item.visualId}
              data-visual-tag="text"
              data-visual-label={item.visualLabel}
              className={`relative px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
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
              {/* Active / Hover Glass Capsule pill */}
              {isHovered && (
                <motion.div
                  layoutId="header-dock-pill"
                  className={`absolute inset-0 rounded-full border pointer-events-none ${
                    dark
                      ? "bg-white/10 border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
                      : "bg-black/5 border-black/10 shadow-[0_4px_16px_rgba(8,70,125,0.08)]"
                  }`}
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}

              {/* Text with subtle scale magnification when hovered */}
              <motion.span
                className="relative z-10 inline-block"
                animate={{
                  scale: isHovered ? 1.08 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {item.label}
              </motion.span>
            </button>
          </div>
        );
      })}

      {/* ── Morphing Floating Glass Preview Card (Apple / Stripe Grade) ── */}
      <AnimatePresence>
        {preview && activeHoverItem && (
          <div
            className="absolute top-full left-0 right-0 flex justify-center pt-3 pointer-events-auto z-[250]"
            onMouseEnter={handleMouseEnterCard}
            onMouseLeave={handleMouseLeaveCard}
          >
            <motion.div
              layoutId="header-dock-preview-card"
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={() => {
                setHoveredKey(null);
                onNavigate(activeHoverItem.path);
              }}
              className={`group w-[380px] rounded-[1.8rem] border p-4 shadow-2xl backdrop-blur-2xl transition-colors duration-300 overflow-hidden cursor-pointer ${
                dark
                  ? "bg-[#070c14]/94 border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.85)] text-white"
                  : "bg-white/94 border-slate-200/90 shadow-[0_24px_60px_rgba(8,70,125,0.18)] text-slate-900"
              }`}
            >
              {/* Dynamic Glow Halo */}
              <div
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-500"
                style={{ backgroundColor: preview.glowColor }}
              />

              {/* Card Media Header with Smooth Ken-Burns Zoom */}
              <div className="relative h-36 w-full rounded-2xl overflow-hidden mb-3 border border-black/10 dark:border-white/10 shadow-inner">
                <img
                  src={preview.image}
                  alt={preview.title}
                  className="w-full h-full object-cover select-none transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                {/* Badge */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="rounded-xl bg-black/60 border border-white/20 px-2.5 py-0.5 text-[10px] font-black text-amber-300 backdrop-blur-md flex items-center gap-1 shadow-md">
                    <Sparkles size={11} className="text-amber-300" />
                    <span>{preview.badge}</span>
                  </span>
                </div>

                {/* Bottom title over image */}
                <div className="absolute inset-x-0 bottom-0 p-3 z-10 text-right">
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
                className={`text-xs leading-relaxed line-clamp-2 mb-3 font-bold ${
                  dark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {preview.description}
              </p>

              {/* Card Footer with Quick Jump Action */}
              <div
                className={`flex items-center justify-between pt-2.5 border-t text-[11px] font-black ${
                  dark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"
                }`}
              >
                <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                  <span>✦</span>
                  <span>{preview.stats}</span>
                </span>

                <div
                  className={`flex items-center gap-1 group-hover:-translate-x-1 transition-transform ${
                    dark ? "text-[#f8ca14]" : "text-[#08467d]"
                  }`}
                >
                  <span>استكشف الآن</span>
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
