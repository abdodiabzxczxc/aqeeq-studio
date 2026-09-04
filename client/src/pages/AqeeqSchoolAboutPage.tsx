import { useState, useRef, useEffect, useMemo } from "react";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { AqeeqLuxuryPageShell } from "@/components/AqeeqLuxuryPageShell";
import { AqeeqGrandFinaleCta } from "@/components/AqeeqGrandFinaleCta";
import { useMagneticTilt, staggerContainer, fadeUpSpring } from "@/lib/motionPresets";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { AlaqeeqStudioSiteFooter } from "@/components/AlaqeeqStudioSiteFooter";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Building2,
  Sparkles,
  Target,
  Compass,
  Award,
  MapPin,
  Phone,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Lightbulb,
  CheckCircle2,
  MessageCircle,
  Milestone,
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Layers,
  Activity,
  BadgeCheck,
  Bus,
  Navigation,
  Globe,
  Sun,
  Moon,
  Star,
  Zap,
  Eye,
  Sliders,
  Share2,
} from "lucide-react";

// ==========================================
// 1. PillarCard with 3D Tilt & Specular Physics
// ==========================================
function PillarCard({
  pillar,
  index,
  dark,
}: {
  pillar: {
    icon: any;
    title: string;
    desc: string;
    badge: string;
    subPoints: string[];
  };
  index: number;
  dark: boolean;
}) {
  const { isNationalDay } = useSiteTheme();
  const { ref, tilt, onMove, onLeave } = useMagneticTilt(8);
  const [expanded, setExpanded] = useState(false);
  const Icon = pillar.icon;

  return (
    <motion.div
      variants={fadeUpSpring}
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition:
          "transform 0.15s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.3s ease, border-color 0.3s ease",
      }}
      className={`group relative overflow-hidden rounded-[2.2rem] border p-6 sm:p-7 backdrop-blur-2xl transition duration-300 will-change-transform flex flex-col justify-between ${
        isNationalDay
          ? dark
            ? "border-emerald-500/25 bg-[#07170f]/90 text-white shadow-[0_20px_50px_rgba(0,90,54,0.3)] hover:border-emerald-400/50"
            : "border-emerald-600/20 bg-white/95 text-slate-900 shadow-[0_15px_40px_rgba(0,90,54,0.08)] hover:border-emerald-600/40"
          : dark
          ? "border-white/[0.08] bg-[#0c1218]/90 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-[#f8ca14]/50 hover:shadow-[0_20px_50px_rgba(248,202,20,0.15)]"
          : "border-black/[0.06] bg-white/95 text-black shadow-[0_15px_35px_rgba(0,0,0,0.04)] hover:border-[#015a37]/35 hover:shadow-[0_15px_35px_rgba(1,90,55,0.1)]"
      }`}
    >
      {/* Specular glare following cursor */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-[2.2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.14) 0%, transparent 60%)`,
        }}
      />

      {/* Giant Holographic Number in Background */}
      <span
        className={`pointer-events-none absolute -left-2 -bottom-4 select-none font-black text-7xl sm:text-8xl leading-none transition duration-500 group-hover:scale-105 ${
          dark ? "text-white/[0.04] group-hover:text-[#f8ca14]/[0.08]" : "text-black/[0.03] group-hover:text-[#015a37]/[0.06]"
        }`}
      >
        0{index + 1}
      </span>

      <div>
        {/* Top Header with Icon & Badge */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div
            className={`grid h-14 w-14 place-items-center rounded-2xl border transition duration-500 group-hover:scale-110 shadow-sm ${
              dark
                ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                : "border-[#015a37]/20 bg-[#015a37]/10 text-[#015a37]"
            }`}
          >
            <Icon size={26} />
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-black border backdrop-blur-md ${
              dark
                ? "border-white/10 bg-white/5 text-slate-300"
                : "border-black/5 bg-slate-100 text-slate-700"
            }`}
          >
            {pillar.badge}
          </span>
        </div>

        {/* Title */}
        <h4 className={`text-xl sm:text-2xl font-black mb-3 relative z-10 ${dark ? "text-white" : "text-[#0a192f]"}`}>
          {pillar.title}
        </h4>

        {/* Description */}
        <p className={`text-xs sm:text-sm leading-relaxed mb-4 relative z-10 font-medium ${dark ? "text-slate-300" : "text-slate-600"}`}>
          {pillar.desc}
        </p>

        {/* Subpoints List */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10 space-y-2 relative z-10"
          >
            {pillar.subPoints.map((pt, pIdx) => (
              <div key={pIdx} className="flex items-start gap-2 text-xs font-bold">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className={dark ? "text-slate-200" : "text-slate-800"}>{pt}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Expand / Details Button */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`mt-4 pt-3 border-t text-xs font-black flex items-center justify-between transition relative z-10 ${
          dark
            ? "border-white/10 text-[#f8ca14] hover:text-white"
            : "border-black/10 text-[#015a37] hover:text-emerald-700"
        }`}
      >
        <span>{expanded ? "طي التفاصيل" : "استكشف أبعاد الركيزة ✦"}</span>
        <ChevronRight size={15} className={`transition-transform duration-300 ${expanded ? "-rotate-90" : "rotate-0"}`} />
      </button>
    </motion.div>
  );
}

// ==========================================
// 2. STICKY TIME MACHINE SCROLLYTELLING STAGE
// (Apple Keynote Style: Viewport Pins & Scroll Controls History)
// ==========================================
interface TimelineEra {
  year: string;
  shortYear: string;
  label: string;
  title: string;
  desc: string;
  highlight: string;
  stats: string;
  image: string;
  quote: string;
  metrics: { label: string; val: string }[];
}

function StickyTimelineStage({
  timelineEras,
  dark,
  isNationalDay,
}: {
  timelineEras: TimelineEra[];
  dark: boolean;
  isNationalDay: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: mounted ? containerRef : undefined,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    mass: 0.4,
  });

  const [activeEraIndex, setActiveEraIndex] = useState(0);
  const [manualLock, setManualLock] = useState(false);

  // Sync scroll progress directly to active era index
  useEffect(() => {
    if (!mounted) return;
    const unsubscribe = scrollYProgress.on("change", (v) => {
      if (manualLock) return;
      if (v < 0.28) {
        setActiveEraIndex(0);
      } else if (v < 0.56) {
        setActiveEraIndex(1);
      } else if (v < 0.82) {
        setActiveEraIndex(2);
      } else {
        setActiveEraIndex(3);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, mounted, manualLock]);

  const handleSelectEra = (idx: number) => {
    setActiveEraIndex(idx);
    setManualLock(true);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pageScrollY = window.pageYOffset || document.documentElement.scrollTop;
      const targetScroll =
        pageScrollY + rect.top + (idx / (timelineEras.length - 1)) * (rect.height - window.innerHeight);
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
      setTimeout(() => setManualLock(false), 900);
    }
  };

  const activeEra = timelineEras[activeEraIndex] || timelineEras[0];

  return (
    <div ref={containerRef} id="timeline-section" className="relative h-[320vh] sm:h-[360vh]">
      {/* Sticky Viewport Window */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center px-4 sm:px-6 overflow-hidden">
        {/* Subtle Background Radial Glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(1,90,55,0.12),transparent_70%)]" />

        <div className="container mx-auto max-w-5xl relative z-10">
          {/* Header & Era Progress Bar */}
          <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
            <div
              className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                dark ? "text-[#f8ca14]" : "text-[#c59b27]"
              } mb-2`}
            >
              <Sparkles size={14} />
              <span>رحلة 30 عاماً عبر عجلة السكرول التفاعلية 📜</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              مسيرة العقيق المضيئة عبر الزمن (1994 - 2026)
            </h2>
            <p className={`mt-2 text-xs sm:text-sm ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>
              حرّك السكرول لأسفل لتشاهد كيف تتحول وتتطور صروح العقيق عبر ثلاثة عقود من الريادة
            </p>

            {/* Glowing Era Track */}
            <div
              className={`mt-5 grid grid-cols-4 gap-2 max-w-2xl mx-auto p-1.5 rounded-2xl border shadow-lg backdrop-blur-xl ${
                dark ? "border-white/10 bg-[#0c141a]/80" : "border-slate-200/90 bg-white/90"
              }`}
            >
              {timelineEras.map((eraItem, eraIdx) => (
                <button
                  key={eraItem.shortYear}
                  type="button"
                  onClick={() => handleSelectEra(eraIdx)}
                  className={`relative p-2.5 rounded-xl text-center transition active:scale-95 ${
                    activeEraIndex === eraIdx
                      ? "text-white shadow-md"
                      : dark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-700 hover:text-[#015a37]"
                  }`}
                >
                  {activeEraIndex === eraIdx && (
                    <motion.div
                      layoutId="stickyTimelineEraBubble"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      className="absolute inset-0 rounded-xl bg-[#015a37] shadow-lg ring-1 ring-[#f8ca14]/40"
                    />
                  )}
                  <span
                    className={`relative z-10 block text-xs sm:text-sm font-black ${
                      activeEraIndex === eraIdx ? "text-[#f8ca14]" : ""
                    }`}
                  >
                    {eraItem.shortYear}
                  </span>
                  <span className="relative z-10 text-[10px] sm:text-[11px] font-bold truncate block">
                    {eraItem.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Scroll Progress Laser Indicator */}
            <div className="mt-3 max-w-md mx-auto h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                style={{ scaleX: smoothProgress, transformOrigin: "right" }}
                className="h-full bg-gradient-to-l from-[#f8ca14] to-emerald-500 rounded-full shadow-[0_0_12px_#f8ca14]"
              />
            </div>
          </div>

          {/* 3D Exploded Era Showcase Card with Smooth Spatial Transitions */}
          <div style={{ perspective: 1400 }} className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeEraIndex}
                initial={{ opacity: 0, scale: 0.92, rotateX: 8, y: 30 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, rotateX: -8, y: -30 }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
                className={`rounded-[2.5rem] border p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-all duration-500 backdrop-blur-2xl ${
                  dark ? "border-emerald-500/25 bg-[#0c1218]/95 shadow-black/80" : "border-emerald-700/20 bg-white/95"
                }`}
              >
                {/* Background Giant Holographic Year Watermark */}
                <span
                  className={`pointer-events-none absolute -left-4 -bottom-6 select-none font-black text-7xl sm:text-9xl leading-none transition-all duration-700 ${
                    dark ? "text-white/[0.03]" : "text-black/[0.02]"
                  }`}
                >
                  {activeEra.shortYear}
                </span>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center relative z-10">
                  {/* Story & Details Column (7 cols) */}
                  <div className="lg:col-span-7">
                    <div className="flex items-center gap-3 mb-2.5">
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                        محطة تاريخية بارزة ✦
                      </span>
                      <span className={`text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"}`}>
                        {activeEra.year}
                      </span>
                    </div>

                    <h3 className={`text-xl sm:text-3xl font-black mb-3 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                      {activeEra.title}
                    </h3>

                    <p
                      className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                        dark ? "text-slate-300" : "text-slate-700 font-medium"
                      }`}
                    >
                      {activeEra.desc}
                    </p>

                    {/* Quote Ribbon */}
                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl border mb-4 text-xs font-bold leading-relaxed ${
                        dark
                          ? "border-white/10 bg-white/[0.03] text-emerald-300"
                          : "border-emerald-950/10 bg-emerald-50/60 text-[#015a37]"
                      }`}
                    >
                      <span className="text-base font-serif ml-1">❝</span>
                      {activeEra.quote}
                      <span className="text-base font-serif mr-1">❞</span>
                    </div>

                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-3 gap-2.5">
                      {activeEra.metrics.map((m, mIdx) => (
                        <div
                          key={mIdx}
                          className={`p-2.5 sm:p-3 rounded-xl border text-center ${
                            dark ? "border-white/5 bg-black/40" : "border-black/5 bg-slate-50"
                          }`}
                        >
                          <span className="block text-[10px] text-slate-500 font-bold">{m.label}</span>
                          <span
                            className={`text-xs sm:text-sm font-black mt-0.5 block truncate ${
                              dark ? "text-white" : "text-[#0a192f]"
                            }`}
                          >
                            {m.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Photo & Milestone Visual Column (5 cols) */}
                  <div className="lg:col-span-5">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3] group">
                      <img
                        src={activeEra.image}
                        alt={activeEra.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                      <div className="absolute bottom-4 right-4 left-4 text-white">
                        <div className="flex items-center gap-2 mb-1">
                          <Milestone size={16} className="text-[#f8ca14]" />
                          <span className="text-xs font-black text-[#f8ca14]">{activeEra.stats}</span>
                        </div>
                        <p className="text-[11px] text-slate-200 line-clamp-2">{activeEra.highlight}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. MAIN COMPONENT: AqeeqSchoolAboutPage
// ==========================================
export default function AqeeqSchoolAboutPage() {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [, navigate] = useLocation();

  // Scroll Progress for Smooth Parallax & 3D Depth on Hero
  const { scrollY } = useScroll();
  const rawHeroScale = useTransform(scrollY, [0, 450], [1, 0.93]);
  const rawHeroRotateX = useTransform(scrollY, [0, 450], [0, 5]);
  const rawHeroOpacity = useTransform(scrollY, [0, 480], [1, 0.6]);

  const smoothHeroScale = useSpring(rawHeroScale, { stiffness: 90, damping: 20 });
  const smoothHeroRotateX = useSpring(rawHeroRotateX, { stiffness: 90, damping: 20 });
  const smoothHeroOpacity = useSpring(rawHeroOpacity, { stiffness: 90, damping: 20 });

  // Campus & Facility Explorer State
  const [activeCampusTab, setActiveCampusTab] = useState<"boys" | "girls">("boys");
  const [activeFacilityIndex, setActiveFacilityIndex] = useState<number>(0);

  // 3D Tilt for Hero Showcase Card
  const { ref: heroCardRef, tilt: heroTilt, onMove: onHeroMove, onLeave: onHeroLeave } = useMagneticTilt(6);

  // Pillars Data
  const pillars = [
    {
      icon: Lightbulb,
      title: "نُلهـــم الأجيــــــــال",
      desc: "نقدّم تعليماً نوعياً يُرسّخ المعرفة، ويُنمّي التفكير، ويُحفّز التعلّم المستمر، ليمنح طلابنا أساساً علمياً راسخاً، ويُهيئهم لمواصلة رحلتهم التعليمية بثقة وتميّز.",
      badge: "التعليم النوعي",
      subPoints: [
        "معايير أكاديمية معتمدة من كوجنيا (Cognia الأمريكية)",
        "كوادر تعليمية وتربوية ذات كفاءة وخبرة عالية",
        "تكامل بين أصالة اللغة والقيم والعلوم العصرية",
      ],
    },
    {
      icon: Compass,
      title: "نُنمّـــــي القـــــدرات",
      desc: "نُمكّن طلابنا من اكتشاف إمكاناتهم، وتنمية مهاراتهم، وتوسيع آفاقهم، من خلال تجارب تعلّم حديثة تُعزّز الابتكار، وتُرسّخ التفكير النقدي، وتُهيئهم لمهارات المستقبل.",
      badge: "مهارات المستقبل",
      subPoints: [
        "مناهج الذكاء الاصطناعي والروبوت والبرمجة من المراحل المبكرة",
        "مختبرات ذكية مجهزة لمحاكاة بيئات العمل والابتكار",
        "أنشطة صقل الشخصية والخطابة والمناظرات الطلابية",
      ],
    },
    {
      icon: Award,
      title: "نحتفــــي بالتميّـــــز",
      desc: "نُمكّن طلابنا من تحقيق التميّز عبر بيئة تعليمية داعمة تُعزّز الإنجاز، وتفتح آفاق المشاركة في المنافسات المحلية والدولية، ليقدّموا نماذج مشرّفة تعكس قدراتهم وطموحاتهم.",
      badge: "الإنجاز والريادة",
      subPoints: [
        "المركز الخامس عالمياً في أولمبياد الروبوت الدولي (WRO)",
        "مراكز معتمدة لاختبارات IELTS و SAT بالمدينة المنورة",
        "حصد جوائز التميز الوزارية والمحلية سنوياً",
      ],
    },
    {
      icon: Target,
      title: "نصنــــع الأثـــــــــر",
      desc: "نُهيّئ طلابنا لمستقبل واعد، من خلال بناء المعرفة، وتنمية المهارات، وترسيخ القيم، ليصنعوا أثراً مستداماً، ويقودوا مستقبلهم بثقة وطموح متوافق مع رؤية المملكة 2030.",
      badge: "أثر مستدام 2030",
      subPoints: [
        "أكثر من 10,000 خريج وخريجة يخدمون الوطن في كافة المجالات",
        "برامج ريادة الأعمال والمسؤولية المجتمعية التطوعية",
        "مواءمة مستمرة مع مستهدفات برنامج تنمية القدرات البشرية",
      ],
    },
  ];

  // Timeline Eras Data
  const timelineEras: TimelineEra[] = [
    {
      year: "1994 م — 1415 هـ",
      shortYear: "1994",
      label: "التأسيس والانطلاقة",
      title: "غراس البدايات وتأسيس أول مجمع تعليمي بالمدينة المنورة",
      desc: "انطلقت مدارس العقيق برؤية واضحة لتكون نموذجاً تعليمياً وتربوياً فريداً بطيبة الطيبة. بدأت المدارس بتأسيس المراحل التأسيسية وتخريج أجيال متمكنة في القرآن الكريم واللغة والعلوم، وتكريس منظومة القيم الأخلاقية الأصيلة.",
      highlight: "نواة التميز والانطلاقة الأولى بالمدينة المنورة",
      stats: "أكثر من 30 دفعة تخرجت منذ التأسيس",
      image: "/covers/cover-about.jpg",
      quote: "ثلاثون عاماً من غراس الخير في طيبة الطيبة، خرجت أجيالاً تقود الحاضر وتصنع المستقبل.",
      metrics: [
        { label: "سنة التأسيس", val: "1415 هـ / 1994 م" },
        { label: "الدفعة الأولى", val: "أول صرح متكامل" },
        { label: "الموقع الأصلي", val: "طيبة الطيبة" },
      ],
    },
    {
      year: "2010 م — 1431 هـ",
      shortYear: "2010",
      label: "المجمعات والمسابح",
      title: "تدشين المجمعات الكبرى والمسابح الأولمبية والملاعب المغطاة",
      desc: "شهدت هذه المرحلة نقلة نوعية كبرى بافتتاح مجمع البنين الشامل ومجمع البنات في حي الرانوناء بمحاذاة ممشى الهجرة، بتجهيزات مدرسية نموذجية شملت المسابح شبه الأولمبية المغطاة، الصالات الرياضية المغلقة، وقاعات المعامل الذكية.",
      highlight: "مجمعات صرحية مستقلة بمواصفات هندسية وتعليمية قياسية",
      stats: "طاقة استيعابية تتجاوز 10,000 طالب وطالبة",
      image: "/covers/student-lab-admissions.jpg",
      quote: "صروح معمارية مستقلة صُممت لتكون بيئة حياة ونمو متكامل للطالب فكرياً وبدنياً.",
      metrics: [
        { label: "المساحة الإنشائية", val: "مجمعات نموذجية" },
        { label: "المسابح المغطاة", val: "شبه أولمبية FINA" },
        { label: "الصالات", val: "ملاعب عشبية وقاعات جمباز" },
      ],
    },
    {
      year: "2018 م — 1439 هـ",
      shortYear: "2018",
      label: "اعتماد كوجنيا (Cognia)",
      title: "الاعتماد الأكاديمي الأمريكي من منظمة كوجنيا (Cognia USA)",
      desc: "توجت مسيرة الجودة بحصول مدارس العقيق على الاعتماد الدولي الأمريكي من كوجنيا، ليصبح خريجو المدارس مؤهلين للحصول على شهادة الدبلومة الأمريكية المعتمدة دولياً، بالتزامن مع إطلاق نوادي وأكاديميات الروبوت والابتكار.",
      highlight: "الريادة في التعليم الدولي والحوكمة الأكاديمية",
      stats: "تقييم جودة معتمد عالمياً بنسبة تفوق 98%",
      image: "/covers/cover-accreditations.jpg",
      quote: "شهادة عالمية تؤكد أن ما نقدمه لأبنائنا يضاهي أرقى المعايير التعليمية في العالم.",
      metrics: [
        { label: "جهة الاعتماد", val: "Cognia USA العالمية" },
        { label: "الشهادة الممنوحة", val: "American Diploma" },
        { label: "نسبة التحقيق", val: "+98% معايير الجودة" },
      ],
    },
    {
      year: "2024 - 2026 م",
      shortYear: "2026",
      label: "مراكز الاختبارات والـ AI",
      title: "اعتماد مراكز IELTS و SAT الدولية ومنظومة الذكاء الاصطناعي",
      desc: "العصر الرقمي والريادة العالمية: اعتماد مدارس العقيق كمركز رسمي لاختبارات IELTS IDP و SAT بالمدينة المنورة، مع تتويج الطلاب بالمركز الخامس عالمياً في أولمبياد الروبوت WRO، وتكامل المناهج مع الذكاء الاصطناعي والتحول الرقمي.",
      highlight: "مركز اختبارات دولي معتمد وحضور عالمي في منافسات الـ AI",
      stats: "المركز الخامس عالمياً في أولمبياد الروبوت الدولي WRO",
      image: "/covers/first-lego-champions.png",
      quote: "من طيبة الطيبة إلى منصات التتويج العالمية، أبناؤنا ينافسون ويحصدون المراكز الأولى دولياً.",
      metrics: [
        { label: "مراكز الاختبارات", val: "IDP IELTS & SAT Official" },
        { label: "أولمبياد الروبوت", val: "5th Globally WRO" },
        { label: "الرؤية المستقبلية", val: "متوافقة 100% مع رؤية 2030" },
      ],
    },
  ];

  // Campus Facilities Data
  const campusFacilities = {
    boys: [
      {
        id: "pool",
        name: "المسبح شبه الأولمبي المغطى",
        tag: "رياضة ولياقة احترافية",
        image: "/covers/student-lab-admissions.jpg",
        desc: "مسبح مغطى ومكيف بمواصفات قياسية وتدفئة مياه شتوية، يشرف عليه كباتن سباحة معتمدون، مخصص لتدريب الطلاب من المراحل الأولية وحتى الثانوية.",
        specs: [
          { label: "المقاييس", val: "شبه أولمبي مغطى FINA" },
          { label: "السلامة", val: "منقذون معتمدون 100%" },
          { label: "المراحل", val: "الابتدائي، المتوسط، الثانوي" },
          { label: "التدفئة", val: "أنظمة تحكم حراري ذكية 30°C" },
        ],
      },
      {
        id: "robotics",
        name: "معامل الذكاء الاصطناعي والروبوت (WRO)",
        tag: "الابتكار الرقمي والـ AI",
        image: "/covers/student-robotics-accreditations.jpg",
        desc: "بيئة تكنولوجية متكاملة مزودة بأحدث حقائب الروبوت والذكاء الاصطناعي، ومحطات البرمجة 1:1، حيث حصد طلابنا المركز الخامس عالمياً في أولمبياد الروبوت الدولي.",
        specs: [
          { label: "الإنجاز", val: "المركز الخامس عالمياً WRO" },
          { label: "التجهيز", val: "أجهزة حاسوب ذكية 1:1" },
          { label: "المسار", val: "بايثون، C++، ميكاترونيكس" },
          { label: "الاعتماد", val: "شراكات تقنية متقدمة" },
        ],
      },
      {
        id: "testing",
        name: "قاعات مراكز اختبارات IELTS و SAT الدولية",
        tag: "الاعتماد الدولي",
        image: "/covers/cover-accreditations.jpg",
        desc: "قاعات رسمية معتمدة لاختبارات اللغة الإنجليزية IELTS بالشراكة مع IDP، واختبارات القبول للجامعات الأمريكية والدولية SAT، لتأهيل الطلاب لأرقى الجامعات.",
        specs: [
          { label: "الشريك", val: "IDP IELTS & College Board" },
          { label: "التجهيز", val: "أنظمة مراقبة وصوتيات دولية" },
          { label: "الاعتماد", val: "كوجنيا الأمريكية Cognia" },
          { label: "الخدمة", val: "مركز معتمد بالمدينة المنورة" },
        ],
      },
      {
        id: "sports",
        name: "الصالات الرياضية وملاعب العشب الصناعي",
        tag: "الأنشطة وبناء الجسم",
        image: "/covers/cover-about.jpg",
        desc: "ملاعب كرة قدم بنجيل صناعي معتمد ومضاء بأبراج كاشفة، إلى جانب صالات جمباز وملاعب كرة طائرة وسلة وصالة كاراتيه للياقة البدنية المتكاملة.",
        specs: [
          { label: "الملاعب", val: "عشب صناعي + صالات مغلقة" },
          { label: "الألعاب", val: "كرة قدم، سلة، طائرة، كاراتيه" },
          { label: "الإضاءة", val: "أبراج كاشفة متكاملة" },
          { label: "البرامج", val: "دوري المدارس والبطولات" },
        ],
      },
      {
        id: "labs",
        name: "المختبرات العلمية الذكية",
        tag: "التجربة والتطبيق العملي",
        image: "/covers/student-excellence-about.jpg",
        desc: "مختبرات فيزياء وكيمياء وأحياء مجهزة بأحدث أدوات السلامة والمجاهر الرقمية وشاشات العرض التفاعلية لربط المنهج النظري بالتطبيق العملي المعملي.",
        specs: [
          { label: "التخصصات", val: "فيزياء · كيمياء · أحياء" },
          { label: "السلامة", val: "معايير بيئية وصحية قياسية" },
          { label: "العرض", val: "شاشات لمس تفاعلية ذكية" },
          { label: "التطبيق", val: "تجارب أسبوعية منتظمة" },
        ],
      },
    ],
    girls: [
      {
        id: "early-childhood",
        name: "أقسام الطفولة المبكرة والروضة",
        tag: "غراس البدايات السعيدة",
        image: "/covers/student-excellence-about.jpg",
        desc: "بيئة تعليمية وتربوية تفاعلية مصممة خصيصاً للأطفال لتنمية مهارات التفكير، والاستكشاف الحركي واللغوي، بإشراف معلمات متخصصات في رياض الأطفال.",
        specs: [
          { label: "الفئة", val: "الروضة والتمهيدي والطفولة المبكرة" },
          { label: "المناهج", val: "منتسوري وتنمية الذكاءات المتعددة" },
          { label: "الأمان", val: "أرضيات مطاطية وألعاب آمنة" },
          { label: "الرعاية", val: "عيادة مدرسية وإشراف صحي" },
        ],
      },
      {
        id: "theater",
        name: "مسرح الاحتفالات وقاعات الإبداع والخطابة",
        tag: "بناء الشخصية والقيادة",
        image: "/covers/cover-about.jpg",
        desc: "مسرح مدرسي صرحي مجهز بأحدث أنظمة الصوت والإضاءة الرقمية، لاحتضان الفعاليات والملتقيات، مسابقات الإلقاء، والمؤتمرات الطلابية باللغتين العربية والإنجليزية.",
        specs: [
          { label: "السعة", val: "قاعة كبرى للمناسبات" },
          { label: "التقنية", val: "أنظمة صوتية وضوئية سينمائية" },
          { label: "الأنشطة", val: "الخطابة والمسرح والمعارض" },
          { label: "الخصوصية", val: "بيئة نسائية متكاملة" },
        ],
      },
      {
        id: "languages",
        name: "معامل اللغات والحاسوب المتقدمة",
        tag: "الطلاقة والتمكين الرقمي",
        image: "/covers/student-lab-admissions.jpg",
        desc: "معامل حاسوبية ذكية مدعومة بأحدث برمجيات التدريب على اللغة الإنجليزية والبرمجة والتصميم الجرافيكي، لإعداد طالبات يمتلكن المهارات الرقمية المتقدمة.",
        specs: [
          { label: "الأجهزة", val: "محطات حاسوب حديثة 1:1" },
          { label: "اللغات", val: "برامج الاستماع والمحادثة الدولية" },
          { label: "البرمجة", val: "سكراتش وبايثون ومونتاج" },
          { label: "الاعتماد", val: "مناهج الدبلومة الأمريكية" },
        ],
      },
      {
        id: "playgrounds",
        name: "الملاعب والساحات الترفيهية المظللة بالكامل",
        tag: "حيوية وأمان تام",
        image: "/covers/first-lego-champions.png",
        desc: "ساحات أنشطة وفسحة واسعة ومظللة بنسبة 100% لتوفير الحماية التامة والراحة، مع ملاعب مجهزة لممارسة الأنشطة الرياضية والترويحية الحركية.",
        specs: [
          { label: "التظليل", val: "مظلات عازلة للحرارة 100%" },
          { label: "الأرضيات", val: "أرضيات مطاطية ماصة للصدمات" },
          { label: "الأمان", val: "كاميرات وأنظمة سلامة شاملة" },
          { label: "الأنشطة", val: "فسحة حركية وبرامج لياقة" },
        ],
      },
      {
        id: "art-studios",
        name: "استوديوهات الفنون والمختبرات العلمية",
        tag: "الفنون والعلوم التطبيقية",
        image: "/covers/student-robotics-accreditations.jpg",
        desc: "أروقة مخصصة لإطلاق مواهب الرسم والأشغال اليدوية والخط العربي، إلى جانب مختبرات العلوم المتكاملة لتطبيق التجارب والاستكشاف العلمي.",
        specs: [
          { label: "الفنون", val: "الرسم التشكيلي والخط العربي" },
          { label: "المعارض", val: "معارض سنوية لإنتاج الطالبات" },
          { label: "المختبرات", val: "تجهيزات كيمياء وأحياء قياسية" },
          { label: "التوجيه", val: "إشراف نخبة من المتخصصات" },
        ],
      },
    ],
  };

  const currentFacilities = campusFacilities[activeCampusTab];
  const activeFacility = currentFacilities[activeFacilityIndex] || currentFacilities[0];

  return (
    <AqeeqLuxuryPageShell
      header={<AlaqeeqStudioSiteHeader title="عن مدارس العقيق الأهلية والدولية" active="about" />}
      footer={<AlaqeeqStudioSiteFooter />}
      useCurtain={true}
      curtainKicker="✦ استكشف صروح ومسيرة العقيق ✦"
      hero={
        <motion.section
          style={{
            scale: smoothHeroScale,
            rotateX: smoothHeroRotateX,
            opacity: smoothHeroOpacity,
            transformPerspective: 1200,
            transformOrigin: "center top",
          }}
          className={`relative isolate overflow-hidden py-12 sm:py-20 ${
            isNationalDay ? (dark ? "snd-hero-dark" : "snd-hero-light") : ""
          }`}
        >
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(1,90,55,0.08),transparent_60%)] dark:bg-[radial-gradient(circle_at_20%_25%,rgba(1,90,55,0.22),transparent_60%)]" />

          <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Right Column: Hero Content & CTAs (7 cols) */}
              <div className="lg:col-span-7 text-right">
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black backdrop-blur-md mb-6 shadow-sm ${
                    isNationalDay
                      ? dark
                        ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
                        : "border-[#005A36]/30 bg-emerald-50 text-[#005A36]"
                      : dark
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-emerald-700/25 bg-white/95 text-[#015a37]"
                  }`}
                >
                  {isNationalDay ? <span>🇸🇦</span> : <Building2 size={14} className={dark ? "text-[#f8ca14]" : "text-[#c59b27]"} />}
                  <span>{isNationalDay ? "مسيرة وطنية رائدة منذ عام 1994 · عزّنا بطبعنا" : "صرح العقيق التعليمي الرائد بالمدينة المنورة"}</span>
                </div>

                <VisualEditable
                  id="about-hero-title"
                  tag="text"
                  label="عنوان هيرو عن المدارس"
                  defaultText="مدارس العقيق الأهلية والدولية"
                  as="h1"
                  className={`text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.2] mb-6 ${
                    dark ? "text-white" : "text-[#0a192f]"
                  }`}
                />

                <VisualEditable
                  id="about-hero-desc"
                  tag="text"
                  label="وصف هيرو عن المدارس"
                  defaultText="صرح تعليمي رائد للبنين والبنات في طيبة الطيبة. نهتم بتأهيل جيل متميز بأخلاق إسلامية راسخة وعلوم عصرية متقدمة، يجمع بين أصالة القيم ومعايير الاعتماد الدولي."
                  as="p"
                  className={`text-base sm:text-lg font-medium leading-relaxed max-w-2xl mb-8 ${
                    dark ? "text-slate-300" : "text-slate-700"
                  }`}
                />

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 mb-10">
                  <Button
                    onClick={() => navigate("/admissions")}
                    className={`rounded-2xl px-8 py-6 text-base font-black shadow-xl transition active:scale-95 ${
                      dark
                        ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black hover:opacity-95 shadow-[#f8ca14]/20"
                        : "bg-gradient-to-r from-[#015a37] to-[#027a4b] text-white hover:opacity-95 shadow-[#015a37]/25"
                    }`}
                  >
                    <span>القبول والتسجيل والرسوم</span>
                    <ArrowRight size={18} className="mr-2" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/accreditations")}
                    className={`rounded-2xl px-8 py-6 text-base font-black border transition active:scale-95 shadow-sm ${
                      dark
                        ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                        : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <span>الاعتمادات ومراكز الاختبارات</span>
                  </Button>
                </div>

                {/* Quick Metrics Bar */}
                <div
                  className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-sm ${
                    dark ? "border-white/10 bg-white/[0.03]" : "border-emerald-950/10 bg-white/80"
                  }`}
                >
                  <div>
                    <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#f8ca14]" : "text-[#015a37]"}`}>منذ 1994</span>
                    <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>+30 عاماً من الريادة</span>
                  </div>
                  <div>
                    <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#5aba1c]" : "text-[#08467d]"}`}>مجمعين</span>
                    <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>للبنين والبنات</span>
                  </div>
                  <div>
                    <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"}`}>Cognia</span>
                    <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>اعتماد أمريكي</span>
                  </div>
                  <div>
                    <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#5aba1c]" : "text-[#015a37]"}`}>KG - 12</span>
                    <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>كافة المراحل</span>
                  </div>
                </div>
              </div>

              {/* Left Column: 3D Magnetic Showcase Card (5 cols) */}
              <div className="lg:col-span-5 relative">
                <div
                  ref={heroCardRef}
                  onMouseMove={onHeroMove}
                  onMouseLeave={onHeroLeave}
                  style={{
                    transform: `perspective(1000px) rotateX(${heroTilt.x}deg) rotateY(${heroTilt.y}deg)`,
                    transition: "transform 0.15s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.3s ease",
                  }}
                  className={`group relative rounded-[2.5rem] p-3 sm:p-4 border transition duration-500 shadow-2xl will-change-transform ${
                    dark
                      ? "border-emerald-500/20 bg-[#0b1218] shadow-black/80 ring-1 ring-emerald-500/10"
                      : "border-emerald-950/10 bg-white shadow-emerald-950/15 ring-1 ring-emerald-900/5"
                  }`}
                >
                  {/* Specular glare following cursor */}
                  <div
                    className="pointer-events-none absolute inset-0 z-20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle at ${heroTilt.gx}% ${heroTilt.gy}%, rgba(255,255,255,0.18) 0%, transparent 60%)`,
                    }}
                  />

                  {/* Close-Up Student Excellence Photo */}
                  <div className="relative overflow-hidden rounded-[2rem] aspect-[4/3] sm:aspect-[16/12]">
                    <VisualImage
                      id="about-hero-student-photo"
                      label="صورة طلاب العقيق المقربة في التكريم"
                      src="/covers/student-excellence-about.jpg"
                      alt="طلاب مدارس العقيق في حفل التميز والتكريم"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                    {/* Top Floating Badge */}
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-2 rounded-full bg-black/80 border border-white/20 px-3.5 py-1.5 text-xs font-black text-white shadow-lg backdrop-blur-md">
                      <Sparkles size={13} className="text-[#f8ca14]" />
                      <span>{isNationalDay ? "🇸🇦 عزّنا بطبعنا · 94 عاماً من المجد" : "نلهم الأجيال · نصنع الأثر"}</span>
                    </div>

                    {/* Bottom Overlaid Details */}
                    <div className="absolute bottom-3.5 right-3.5 left-3.5 flex items-center justify-between text-white">
                      <div>
                        <h4 className="text-sm font-black drop-shadow-md">صرح تعليمي وتربوي رائد</h4>
                        <p className="text-[11px] text-emerald-300 drop-shadow-md">أصالة القيم ومعايير الاعتماد الدولي</p>
                      </div>
                      <span className="rounded-xl bg-emerald-600/90 px-2.5 py-1 text-[10px] font-black backdrop-blur-md shadow">
                        المدينة المنورة
                      </span>
                    </div>
                  </div>

                  {/* Overlapping Floating Trust Chip (Bottom) */}
                  <div
                    className={`mt-3 p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                      dark ? "border-white/10 bg-black/60 text-slate-200" : "border-emerald-950/10 bg-[#f4f7f4] text-slate-800"
                    }`}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h5 className="text-xs font-black">مجمع البنين ومجمع البنات بالمدينة</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">حي الرانوناء (ممشى الهجرة) · بيئة نموذجية متكاملة</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      }
    >
      {/* Quick Jump Anchor Bar */}
      <div className={`border-b py-3 px-4 ${dark ? "bg-black/60 border-white/10" : "bg-white/80 border-slate-200"}`}>
        <div className="container mx-auto max-w-6xl flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-xs font-bold">
          <a
            href="#timeline-section"
            className={`px-3 py-1.5 rounded-xl border transition ${
              dark
                ? "border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                : "border-black/5 text-slate-700 hover:text-emerald-800 hover:bg-slate-100"
            }`}
          >
            مسيرة 30 عاماً 📜
          </a>
          <a
            href="#campuses-section"
            className={`px-3 py-1.5 rounded-xl border transition ${
              dark
                ? "border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                : "border-black/5 text-slate-700 hover:text-emerald-800 hover:bg-slate-100"
            }`}
          >
            مستكشف المجمعات والمرافق 🏫
          </a>
          <a
            href="#vision-section"
            className={`px-3 py-1.5 rounded-xl border transition ${
              dark
                ? "border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                : "border-black/5 text-slate-700 hover:text-emerald-800 hover:bg-slate-100"
            }`}
          >
            الرؤية والرسالة 2030 🎯
          </a>
          <a
            href="#pillars-section"
            className={`px-3 py-1.5 rounded-xl border transition ${
              dark
                ? "border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                : "border-black/5 text-slate-700 hover:text-emerald-800 hover:bg-slate-100"
            }`}
          >
            ركائزنا التربوية 💡
          </a>
          <a
            href="#map-contact-section"
            className={`px-3 py-1.5 rounded-xl border transition ${
              dark
                ? "border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                : "border-black/5 text-slate-700 hover:text-emerald-800 hover:bg-slate-100"
            }`}
          >
            الموقع والتواصل 📍
          </a>
        </div>
      </div>

      {/* ========================================================
          STAGE 1: The 30-Year Legacy Time Machine (Sticky Scrollytelling Pinned Stage)
      ======================================================== */}
      <StickyTimelineStage
        timelineEras={timelineEras}
        dark={dark}
        isNationalDay={isNationalDay}
      />

      {/* ========================================================
          STAGE 2: Interactive 3D Campus Explorer & Facility Switcher
      ======================================================== */}
      <section
        id="campuses-section"
        className={`py-20 border-y ${
          dark ? "border-white/10 bg-[#06080d]" : "border-emerald-950/10 bg-[#f5f8f5]"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400 mb-2">
              <Building2 size={14} />
              <span>الصروح والمجمعات التعليمية النموذجية</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              استكشف مجمعاتنا بالمدينة المنورة 🏫
            </h2>
            <p className={`text-xs sm:text-sm mt-2 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
              مبانٍ مدرسية صرحية مستقلة بحي الرانوناء (ممشى الهجرة)، تضم تجهيزات أكاديمية ورياضية ومعملية بمعايير عالمية
            </p>

            {/* Campus Switcher Tabs with LayoutId Springs */}
            <div
              className={`mt-8 inline-flex items-center rounded-2xl border p-1.5 shadow-sm transition ${
                dark ? "border-white/10 bg-[#0c141a]" : "border-slate-200/90 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveCampusTab("boys");
                  setActiveFacilityIndex(0);
                }}
                className={`relative rounded-xl px-6 sm:px-8 py-2.5 text-xs sm:text-sm font-black transition active:scale-95 ${
                  activeCampusTab === "boys"
                    ? "text-white shadow-md"
                    : dark
                    ? "text-slate-400 hover:text-white hover:bg-white/5"
                    : "text-slate-700 hover:text-[#015a37] hover:bg-slate-50"
                }`}
              >
                {activeCampusTab === "boys" && (
                  <motion.div
                    layoutId="activeCampusPillMain"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    className="absolute inset-0 rounded-xl bg-[#015a37] shadow-lg ring-1 ring-[#f8ca14]/30"
                  />
                )}
                <span className="relative z-10">مجمع البنين (الأهلي والدولي) 🎓</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveCampusTab("girls");
                  setActiveFacilityIndex(0);
                }}
                className={`relative rounded-xl px-6 sm:px-8 py-2.5 text-xs sm:text-sm font-black transition active:scale-95 ${
                  activeCampusTab === "girls"
                    ? "text-white shadow-md"
                    : dark
                    ? "text-slate-400 hover:text-white hover:bg-white/5"
                    : "text-slate-700 hover:text-[#015a37] hover:bg-slate-50"
                }`}
              >
                {activeCampusTab === "girls" && (
                  <motion.div
                    layoutId="activeCampusPillMain"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    className="absolute inset-0 rounded-xl bg-[#015a37] shadow-lg ring-1 ring-[#f8ca14]/30"
                  />
                )}
                <span className="relative z-10">مجمع البنات والطفولة المبكرة 🌸</span>
              </button>
            </div>
          </div>

          {/* Interactive Facilities Horizontal Pills */}
          <div className="max-w-4xl mx-auto mb-8 flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {currentFacilities.map((fac, fIdx) => (
              <button
                key={fac.id}
                type="button"
                onClick={() => setActiveFacilityIndex(fIdx)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition active:scale-95 border ${
                  activeFacilityIndex === fIdx
                    ? dark
                      ? "border-[#f8ca14] bg-[#f8ca14]/15 text-[#f8ca14] shadow-sm"
                      : "border-[#015a37] bg-[#015a37] text-white shadow-sm"
                    : dark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    : "border-black/10 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{fac.name}</span>
              </button>
            ))}
          </div>

          {/* Active Facility Spotlight Showcase Card with 3D Exploded Depth */}
          <div style={{ perspective: 1200 }} className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCampusTab}-${activeFacilityIndex}`}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ type: "spring", stiffness: 240, damping: 24 }}
                className={`rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl transition duration-500 backdrop-blur-2xl ${
                  dark ? "border-emerald-500/25 bg-[#0c1218]/95 shadow-black/80" : "border-emerald-700/20 bg-white/95"
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Info Column */}
                  <div className="lg:col-span-7">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`rounded-xl px-3 py-1 text-xs font-black ${
                          activeCampusTab === "boys"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-pink-500/10 text-pink-600 dark:text-pink-400"
                        }`}
                      >
                        {activeFacility.tag} ✦
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {activeCampusTab === "boys" ? "مجمع البنين — حي الرانوناء" : "مجمع البنات — ممشى الهجرة"}
                      </span>
                    </div>

                    <h3 className={`text-2xl sm:text-3xl font-black mb-4 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                      {activeFacility.name}
                    </h3>

                    <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                      {activeFacility.desc}
                    </p>

                    {/* 4 Technical Specifications Micro-Chips */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                      {activeFacility.specs.map((sp, sIdx) => (
                        <div
                          key={sIdx}
                          className={`p-3 rounded-xl border transition hover:border-emerald-500/30 ${
                            dark ? "border-white/5 bg-white/5" : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <span className="block text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                            ✦ {sp.label}
                          </span>
                          <span className={`text-xs font-bold mt-0.5 block truncate ${dark ? "text-slate-200" : "text-slate-800"}`}>
                            {sp.val}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Facility Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=Al+Aqiq+Schools+Al+Ranuna+Madinah"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#015a37] hover:bg-emerald-800 text-white px-5 py-3 text-xs font-black shadow-md transition active:scale-95"
                      >
                        <MapPin size={15} />
                        <span>فتح الموقع في Google Maps 📍</span>
                      </a>

                      <a
                        href={activeCampusTab === "boys" ? "tel:+966148131652" : "tel:+966148644466"}
                        className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-xs font-bold transition ${
                          dark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm"
                        }`}
                      >
                        <Phone size={14} />
                        <span>{activeCampusTab === "boys" ? "0148131652" : "0148644466"}</span>
                      </a>

                      <Button
                        onClick={() => navigate("/admissions")}
                        variant="outline"
                        className="rounded-2xl text-xs font-black"
                      >
                        حجز جولة تعريفية في المرفق ✦
                      </Button>
                    </div>
                  </div>

                  {/* Photo Column with Specular Glare */}
                  <div className="lg:col-span-5">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3] group">
                      <img
                        src={activeFacility.image}
                        alt={activeFacility.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                      <div className="absolute bottom-4 right-4 left-4 text-white">
                        <span className="text-xs font-black text-[#f8ca14]">{activeFacility.name}</span>
                        <p className="text-[11px] text-slate-300">{activeFacility.tag} · مدارس العقيق</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ========================================================
          STAGE 3: Royal Strategic Document: Vision & Mission 2030 (Dual-Wing 3D Book Pivot)
      ======================================================== */}
      <section id="vision-section" className="py-20 container mx-auto px-4 sm:px-6">
        <div
          className={`max-w-5xl mx-auto rounded-[3rem] border p-8 sm:p-14 shadow-2xl relative overflow-hidden ${
            dark
              ? "border-emerald-500/30 bg-gradient-to-b from-[#0c141a] to-[#060a0e] ring-1 ring-emerald-500/20"
              : "border-emerald-700/20 bg-gradient-to-b from-white to-[#fbfaf8] ring-1 ring-emerald-900/10 shadow-xl"
          }`}
        >
          <div className="text-center max-w-xl mx-auto mb-12">
            <div
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black mb-3 border ${
                isNationalDay
                  ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14]"
                  : "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
              }`}
            >
              <Compass size={14} />
              <span>{isNationalDay ? "🇸🇦 رؤية وطنية راسخة · عزّنا بطبعنا" : "المرتكزات الاستراتيجية للصرح"}</span>
            </div>
            <h3 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              الرؤية والرسالة المؤسسية ومستهدفات 2030
            </h3>
          </div>

          <div style={{ perspective: 1200 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision Plaque with 3D Book Pivot */}
            <motion.div
              whileHover={{ rotateY: 3, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className={`rounded-3xl border p-8 relative overflow-hidden shadow-md ${
                dark ? "border-emerald-500/20 bg-white/5" : "border-emerald-950/10 bg-emerald-50/40"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Compass size={24} />
                </div>
                <div>
                  <h4 className={`text-lg font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>الرؤية الاستراتيجية (Vision)</h4>
                  <span className="text-[11px] text-slate-500 font-bold">أصالة القيم وريادة المستقبل</span>
                </div>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                أن تكون مدارس العقيق الأهلية والدولية نموذجاً تعليمياً وتربوياً رائداً على مستوى المملكة والعالم الإسلامي، يُخرج قادة للمستقبل متسلحين بالعلم النافع، والأخلاق الفاضلة، والمهارات التنافسية العالمية التي تواكب مستهدفات رؤية 2030.
              </p>
            </motion.div>

            {/* Mission Plaque with 3D Book Pivot */}
            <motion.div
              whileHover={{ rotateY: -3, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className={`rounded-3xl border p-8 relative overflow-hidden shadow-md ${
                dark ? "border-amber-500/20 bg-white/5" : "border-amber-950/10 bg-amber-50/30"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${dark ? "bg-amber-500/10 text-[#f8ca14]" : "bg-amber-500/15 text-[#c59b27]"}`}>
                  <Target size={24} />
                </div>
                <div>
                  <h4 className={`text-lg font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>الرسالة التربوية (Mission)</h4>
                  <span className="text-[11px] text-slate-500 font-bold">جودة التعليم وبناء الشخصية</span>
                </div>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                توفير بيئة تعليمية وتربوية محفزة وجاذبة، تضم نخبة من الكفاءات التعليمية المؤهلة، وتطبق أحدث المعايير الدولية والاعتمادات العالمية، لبناء شخصية متكاملة للطالب تعتز بهويتها وتسهم في نهضة وطنها.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================
          STAGE 4: The 4 Institutional Pillars with 3D Tilt Cards
      ======================================================== */}
      <section
        id="pillars-section"
        className={`py-20 border-y ${
          dark ? "border-white/10 bg-[#06080d]" : "border-emerald-950/10 bg-[#f5f8f5]"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className={`inline-flex items-center gap-2 text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"} mb-2`}>
              <Sparkles size={14} />
              <span>ركائز مسيرة العقيق</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              ركائزنا التربوية الأربعة 🏛️
            </h2>
            <p className={`text-xs sm:text-sm mt-2 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
              منظومة متكاملة من القيم والمهارات تصوغ رحلة الطالب اليومية في مدارس العقيق
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {pillars.map((pillar, idx) => (
              <PillarCard
                key={idx}
                pillar={pillar}
                index={idx}
                dark={dark}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================================================
          STAGE 5: Medina Interactive Map & Campus Logistics
      ======================================================== */}
      <section id="map-contact-section" className="py-20 container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400 mb-2">
            <MapPin size={14} />
            <span>الموقع الجغرافي والوصول المباشر</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
            في قلب المدينة المنورة — حي الرانوناء 📍
          </h2>
          <p className={`text-xs sm:text-sm mt-2 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
            بمحاذاة ممشى الهجرة (خلف نايس برايس) مع تغطية شاملة لأسطول النقل المدرسي لكافة أحياء طيبة الطيبة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
          {/* Map Preview & Transportation Coverage Card (7 cols) */}
          <div
            className={`lg:col-span-7 rounded-3xl border p-8 flex flex-col justify-between shadow-xl ${
              dark ? "border-white/10 bg-[#0c1218]" : "border-emerald-950/10 bg-white"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">موقع المجمعات حي ومتاح</span>
                </div>
                <span className="text-xs font-bold text-slate-500">طيبة الطيبة</span>
              </div>

              <h3 className={`text-xl sm:text-2xl font-black mb-2 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                مجمعات العقيق الأهلية والدولية (بنين وبنات)
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                المدينة المنورة — حي الرانوناء — ممشى الهجرة (خلف نايس برايس). سهولة في الوصول ومواقف فسيحة مخصصة لأولياء الأمور وباصات المدارس.
              </p>

              {/* Transportation Coverage Chips */}
              <div className="mb-8">
                <div className="flex items-center gap-2 text-xs font-black mb-3 text-slate-400">
                  <Bus size={15} />
                  <span>تغطية أسطول النقل المدرسي المكيف والآمن:</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  {[
                    "حي الرانوناء",
                    "ممشى الهجرة",
                    "حي العزيزية",
                    "حي باقدو",
                    "طريق الهجرة",
                    "المنطقة المركزية (الحرم)",
                    "حي الخالدية",
                    "حي قباء",
                    "حي شوران",
                  ].map((hood, hIdx) => (
                    <span
                      key={hIdx}
                      className={`px-3 py-1.5 rounded-xl border transition hover:scale-105 cursor-default ${
                        dark
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                          : "border-emerald-950/10 bg-emerald-50 text-[#015a37]"
                      }`}
                    >
                      ✓ {hood}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Routing Action */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Al+Aqiq+Schools+Al+Ranuna+Madinah"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#015a37] hover:bg-emerald-800 text-white px-6 py-3.5 text-xs font-black shadow-lg transition active:scale-95"
              >
                <Navigation size={16} />
                <span>فتح اتجاهات القيادة المباشرة في Google Maps</span>
              </a>

              <a
                href="https://wa.me/966531896000?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D9%88%D9%82%D8%B9%20%D9%85%D8%AF%D8%A7%D8%B1%D8%B3%20%D8%A7%D9%84%D8%B9%D9%82%D9%8A%D9%82%20%D9%88%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%A7%D9%84%D9%86%D9%82%D9%84"
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3.5 text-xs font-black transition ${
                  dark
                    ? "border-white/10 bg-white/5 text-emerald-400 hover:bg-white/10"
                    : "border-emerald-700/20 bg-white text-emerald-700 hover:bg-slate-50"
                }`}
              >
                <MessageCircle size={15} />
                <span>واتساب الاستقبال المباشر</span>
              </a>
            </div>
          </div>

          {/* Contact & Official Channels Card (5 cols) */}
          <div
            className={`lg:col-span-5 rounded-3xl border p-8 flex flex-col justify-between shadow-xl ${
              dark ? "border-white/10 bg-[#0c1218]" : "border-emerald-950/10 bg-white"
            }`}
          >
            <div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
                <Phone size={22} />
              </div>
              <h3 className={`text-2xl font-black mb-2 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                أرقام المجمعات المباشرة
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
                فريق القبول والاستقبال جاهز لخدمتكم يومياً من الأحد إلى الخميس.
              </p>

              <div className={`space-y-4 text-xs font-bold ${dark ? "text-slate-200" : "text-slate-800"}`}>
                <div className={`p-3.5 rounded-2xl border ${dark ? "border-white/5 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-emerald-600 dark:text-emerald-400">مجمع البنين (الأهلي والدولي)</span>
                    <Phone size={14} className="text-slate-400" />
                  </div>
                  <a href="tel:+966148131652" className="text-sm font-black hover:underline dir-ltr block text-right">
                    0148131652
                  </a>
                </div>

                <div className={`p-3.5 rounded-2xl border ${dark ? "border-white/5 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-emerald-600 dark:text-emerald-400">مجمع البنات والطفولة المبكرة</span>
                    <Phone size={14} className="text-slate-400" />
                  </div>
                  <a href="tel:+966148644466" className="text-sm font-black hover:underline dir-ltr block text-right">
                    0148644466
                  </a>
                </div>

                <div className={`p-3.5 rounded-2xl border ${dark ? "border-white/5 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-[#f8ca14]">الواتساب الموحد للقبول والتسجيل</span>
                    <MessageCircle size={14} className="text-emerald-500" />
                  </div>
                  <a href="tel:+966531896000" className="text-sm font-black hover:underline dir-ltr block text-right">
                    0531896000
                  </a>
                </div>
              </div>
            </div>

            {/* Careers Callout */}
            <div className="pt-6 border-t border-white/10 mt-6">
              <a
                href="https://live.aqeeq.edu.sa/jobs"
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                  dark
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                    : "border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-black">
                  <Briefcase size={16} />
                  <span>انضم لفريق العمل · بوابة التوظيف الرسمية</span>
                </div>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stage 6: Grand Interactive Finale & Action */}
      <AqeeqGrandFinaleCta
        badge="✦ انضم إلى مجتمع العقيق ✦"
        title="اصنع مستقبل أبنائك في بيئة تعليمية تليق بطموحاتهم"
        subtitle="أبواب القبول والتسجيل مفتوحة لجميع المراحل الدراسية للبنين والبنات مع توفير كافة التسهيلات وأنظمة السداد."
        primaryActionText="سجّل ابنك الآن"
        primaryActionHref="/admissions"
        onPrimaryAction={() => navigate("/admissions")}
        secondaryActionText="استكشف الاعتمادات الدولية"
        secondaryActionHref="/accreditations"
        onSecondaryAction={() => navigate("/accreditations")}
      />
    </AqeeqLuxuryPageShell>
  );
}
