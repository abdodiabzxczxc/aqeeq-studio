import { useState, useRef, useEffect } from "react";
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
  Heart,
  Radio,
  Palette,
  Microscope,
  Trophy,
  Cpu,
  Waves,
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
  ChevronRight,
  ChevronLeft,
  Bus,
  Navigation,
  Star,
} from "lucide-react";

// ==========================================
// 1. PillarCard with 3D Magnetic Tilt & Specular Physics
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
          : "border-black/[0.06] bg-white/95 text-black shadow-[0_15px_35px_rgba(0,0,0,0.04)] hover:border-[#08467d]/40 hover:shadow-[0_15px_35px_rgba(8,70,125,0.1)]"
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
          dark ? "text-white/[0.04] group-hover:text-[#f8ca14]/[0.08]" : "text-black/[0.03] group-hover:text-[#08467d]/[0.06]"
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
                : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
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
                <CheckCircle2 size={14} className="text-[#f8ca14] shrink-0 mt-0.5" />
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
            : "border-[#08467d]/15 text-[#08467d] hover:text-[#f8ca14]"
        }`}
      >
        <span>{expanded ? "طي التفاصيل" : "استكشف أبعاد الركيزة ✦"}</span>
        <ChevronRight size={15} className={`transition-transform duration-300 ${expanded ? "-rotate-90" : "rotate-0"}`} />
      </button>
    </motion.div>
  );
}

// ==========================================
// 2. MAIN COMPONENT: AqeeqSchoolAboutPage
// ==========================================
export default function AqeeqSchoolAboutPage() {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [, navigate] = useLocation();

  // فحص الشاشات الكبيرة لتفعيل فيزياء البعد الثالث على الكمبيوتر حصرياً
  // وتجنب انبعاج أو ميلان نصوص القراءة على الموبايل
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Scroll Tracking for Smooth Parallax
  const { scrollY } = useScroll();

  // Hero Card 3D Scroll Physics
  const rawHeroCardY = useTransform(scrollY, [0, 500], [0, 45]);
  const rawHeroCardRotateX = useTransform(scrollY, [0, 500], [0, 6]);
  const rawHeroCardScale = useTransform(scrollY, [0, 500], [1, 0.94]);
  const heroCardY = useSpring(rawHeroCardY, { stiffness: 90, damping: 20 });
  const heroCardRotateX = useSpring(rawHeroCardRotateX, { stiffness: 90, damping: 20 });
  const heroCardScale = useSpring(rawHeroCardScale, { stiffness: 90, damping: 20 });

  // Floating Satellite Badges Counter-Parallax
  const rawHeroBadge1Y = useTransform(scrollY, [0, 500], [0, -32]);
  const rawHeroBadge2Y = useTransform(scrollY, [0, 500], [0, 32]);
  const heroBadge1Y = useSpring(rawHeroBadge1Y, { stiffness: 85, damping: 20 });
  const heroBadge2Y = useSpring(rawHeroBadge2Y, { stiffness: 85, damping: 20 });

  // 3D Tilt for Hero Showcase Card
  const { ref: heroCardRef, tilt: heroTilt, onMove: onHeroMove, onLeave: onHeroLeave } = useMagneticTilt(6);

  // Timeline Section Ref & Scroll Physics
  const timelineSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineSectionRef,
    offset: ["start end", "end start"],
  });
  const rawTimelineRotateX = useTransform(timelineProgress, [0, 0.5, 1], [10, 0, -8]);
  const rawTimelineScale = useTransform(timelineProgress, [0, 0.5, 1], [0.94, 1, 0.95]);
  const rawTimelinePhotoY = useTransform(timelineProgress, [0, 1], [25, -25]);
  const timelineRotateX = useSpring(rawTimelineRotateX, { stiffness: 85, damping: 22 });
  const timelineScale = useSpring(rawTimelineScale, { stiffness: 85, damping: 22 });
  const timelinePhotoY = useSpring(rawTimelinePhotoY, { stiffness: 85, damping: 22 });

  // Campus Facilities Section Ref & Scroll Physics
  const campusSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: campusProgress } = useScroll({
    target: campusSectionRef,
    offset: ["start end", "end start"],
  });
  const rawCampusRotateX = useTransform(campusProgress, [0, 0.5, 1], [9, 0, -7]);
  const rawCampusScale = useTransform(campusProgress, [0, 0.5, 1], [0.95, 1, 0.96]);
  const campusRotateX = useSpring(rawCampusRotateX, { stiffness: 85, damping: 22 });
  const campusScale = useSpring(rawCampusScale, { stiffness: 85, damping: 22 });

  // Vision Section Ref & 3D Dual Wing Pivot
  const visionSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: visionProgress } = useScroll({
    target: visionSectionRef,
    offset: ["start end", "end start"],
  });
  const rawVisionWingLeft = useTransform(visionProgress, [0, 0.5, 1], [-7, 0, 6]);
  const rawVisionWingRight = useTransform(visionProgress, [0, 0.5, 1], [7, 0, -6]);
  const visionWingLeft = useSpring(rawVisionWingLeft, { stiffness: 85, damping: 22 });
  const visionWingRight = useSpring(rawVisionWingRight, { stiffness: 85, damping: 22 });

  // Pillars Section Ref & Staggered Scroll Parallax
  const pillarsSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: pillarsProgress } = useScroll({
    target: pillarsSectionRef,
    offset: ["start end", "end start"],
  });
  const rawPillar0Y = useTransform(pillarsProgress, [0, 1], [18, -18]);
  const rawPillar1Y = useTransform(pillarsProgress, [0, 1], [-18, 18]);
  const rawPillar2Y = useTransform(pillarsProgress, [0, 1], [18, -18]);
  const rawPillar3Y = useTransform(pillarsProgress, [0, 1], [-18, 18]);
  const pillar0Y = useSpring(rawPillar0Y, { stiffness: 85, damping: 22 });
  const pillar1Y = useSpring(rawPillar1Y, { stiffness: 85, damping: 22 });
  const pillar2Y = useSpring(rawPillar2Y, { stiffness: 85, damping: 22 });
  const pillar3Y = useSpring(rawPillar3Y, { stiffness: 85, damping: 22 });
  const pillarYOffsets = [pillar0Y, pillar1Y, pillar2Y, pillar3Y];

  // Interactive States
  const [activeCampusTab, setActiveCampusTab] = useState<"boys" | "girls">("boys");
  const [activeFacilityIndex, setActiveFacilityIndex] = useState<number>(0);
  const [activeTimelineIndex, setActiveTimelineIndex] = useState<number>(3);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

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
  const timelineEras = [
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

  // Campus Facilities Data with Visual Cockpit, Hotspots & Giant Metrics
  const campusFacilities = {
    boys: [
      {
        id: "pool",
        name: "المسبح شبه الأولمبي المغطى",
        tag: "رياضة ولياقة احترافية",
        icon: Waves,
        thumbnail: "/covers/student-lab-admissions.jpg",
        image: "/covers/student-lab-admissions.jpg",
        badge: "معايير FINA الدولية",
        desc: "مسبح صرحي مغطى ومكيف بمواصفات قياسية وتدفئة مياه شتوية ذكية 30°C، يشرف عليه كباتن سباحة وإنقاذ معتمدون، مخصص لتدريب طلاب المراحل الأولية وحتى الثانوية في بيئة صحية وآمنة 100%.",
        hotspots: [
          {
            id: "pool-fina",
            x: 28,
            y: 45,
            title: "حوض شبه أولمبي 25m",
            desc: "مصمم وفق مقاييس الاتحاد الدولي للسباحة FINA مع مسارات تدريبية ومدرجات للمنافسات المدرسية.",
          },
          {
            id: "pool-heat",
            x: 72,
            y: 35,
            title: "تدفئة حرارية ذكية 30°C",
            desc: "أنظمة تدفئة مياه وضبط رطوبة أوتوماتيكية متطورة تضمن بيئة تدريب مثالية طوال أشهر الشتاء.",
          },
          {
            id: "pool-safety",
            x: 52,
            y: 75,
            title: "كادر إنقاذ وسلامة 100%",
            desc: "إشراف مباشر ومستمر من مدربي ومنقذي سباحة محترفين ومعتمدين لضمان أعلى مستويات الأمان.",
          },
        ],
        giantMetrics: [
          { num: "25m", label: "شبه أولمبي مغطى", sub: "مقاييس FINA الدولية" },
          { num: "30°C", label: "تدفئة مياه شتوية", sub: "تحكم رقمي بالحرارة" },
          { num: "100%", label: "سلامة وإنقاذ", sub: "منقذون وكباتن محترفون" },
          { num: "KG-12", label: "كافة المراحل", sub: "ابتدائي، متوسط، ثانوي" },
        ],
      },
      {
        id: "robotics",
        name: "معامل الذكاء الاصطناعي والروبوت (WRO)",
        tag: "الابتكار الرقمي والـ AI",
        icon: Cpu,
        thumbnail: "/covers/student-robotics-accreditations.jpg",
        image: "/covers/student-robotics-accreditations.jpg",
        badge: "المركز الخامس عالمياً",
        desc: "بيئة تكنولوجية متكاملة مزودة بأحدث حقائب الروبوت ومحطات البرمجة 1:1، حيث تُصنع العقول المبتكرة وحقق طلابنا من خلالها المركز الخامس عالمياً في أولمبياد الروبوت الدولي WRO.",
        hotspots: [
          {
            id: "robotics-wro",
            x: 35,
            y: 48,
            title: "محطات محاكاة أولمبياد WRO",
            desc: "حلبات تدريب واختبار مطابقة للمواصفات الدولية لأولمبياد الروبوت مع تحديات سنوية محدثة.",
          },
          {
            id: "robotics-pc",
            x: 70,
            y: 40,
            title: "محطة حاسوب ذكية 1:1",
            desc: "أجهزة حاسوب فائقة الأداء مخصصة لكل طالب لتعلم البرمجة بلغات بايثون، C++، والذكاء الاصطناعي.",
          },
          {
            id: "robotics-kits",
            x: 50,
            y: 76,
            title: "حقائب LEGO & VEX المتقدمة",
            desc: "تجهيزات ميكانيكية وإلكترونية متطورة تدعم الهندسة العكسية وحل المشكلات الواقعية.",
          },
        ],
        giantMetrics: [
          { num: "5th", label: "أولمبياد الروبوت", sub: "المركز الخامس عالمياً WRO" },
          { num: "1:1", label: "حواسيب مخصصة", sub: "محطة رقمية لكل طالب" },
          { num: "Python", label: "برمجة ولغات AI", sub: "من المراحل المبكرة" },
          { num: "+20", label: "بطولة وجائزة", sub: "محلية وإقليمية سنوياً" },
        ],
      },
      {
        id: "testing",
        name: "قاعات مراكز اختبارات IELTS و SAT الدولية",
        tag: "الاعتماد الدولي والجامعي",
        icon: GraduationCap,
        thumbnail: "/covers/cover-accreditations.jpg",
        image: "/covers/cover-accreditations.jpg",
        badge: "مركز رسمي IDP & SAT",
        desc: "قاعات مجهزة بأنظمة الصوتيات والمراقبة الصارمة، معتمدة رسمياً بالمدينة المنورة لاختبارات اللغة الإنجليزية IELTS بالشراكة مع IDP واختبارات SAT لتأهيل خريجينا للجامعات العالمية.",
        hotspots: [
          {
            id: "testing-idp",
            x: 30,
            y: 45,
            title: "شراكة رسمية مع IDP IELTS",
            desc: "مركز رسمي معتمد لإجراء اختبارات الآيلتس الورقية والحاسوبية داخل المدينة المنورة.",
          },
          {
            id: "testing-audio",
            x: 65,
            y: 35,
            title: "أنظمة عزل صوتي واستماع دولية",
            desc: "تجهيزات سمعية فردية عالية الدقة وعزل صوتي كامل وفق المعايير البريطانية والأمريكية.",
          },
          {
            id: "testing-sat",
            x: 48,
            y: 72,
            title: "الاعتماد الأمريكي كوجنيا Cognia",
            desc: "حوكمة وإشراف دولي يضمن معادلة الشهادات وقبولها في كبرى جامعات المملكة والعالم.",
          },
        ],
        giantMetrics: [
          { num: "Official", label: "مركز اختبارات", sub: "شراكة IDP IELTS الرسمية" },
          { num: "SAT", label: "College Board", sub: "اختبارات القبول الجامعي" },
          { num: "+98%", label: "تقييم كوجنيا", sub: "معايير الجودة الأكاديمية" },
          { num: "Top", label: "مسار الجامعات", sub: "تأهيل مباشر للابتعاث" },
        ],
      },
      {
        id: "sports",
        name: "الصالات الرياضية وملاعب العشب الصناعي",
        tag: "اللياقة وبناء الجسم",
        icon: Trophy,
        thumbnail: "/covers/cover-about.jpg",
        image: "/covers/cover-about.jpg",
        badge: "ملاعب نجيل وملاعب مغلقة",
        desc: "ملاعب كرة قدم بنجيل صناعي معتمد ومضاء بأبراج كاشفة، إلى جانب صالات جمباز وملاعب كرة طائرة وسلة وصالة كاراتيه للياقة البدنية المتكاملة.",
        hotspots: [
          {
            id: "sports-grass",
            x: 40,
            y: 55,
            title: "أرضيات عشب صناعي معتمدة",
            desc: "نجيل صناعي من الجيل المتقدم يمتص الصدمات ويقلل مخاطر الإصابات للطلاب أثناء اللعب.",
          },
          {
            id: "sports-towers",
            x: 75,
            y: 30,
            title: "أبراج كاشفة متكاملة",
            desc: "إضاءة ليلية عالية الكفاءة تدعم البطولات المسائية والأنشطة المجتمعية ومهرجانات المدرسة.",
          },
          {
            id: "sports-indoor",
            x: 25,
            y: 70,
            title: "صالات الجمباز والكاراتيه",
            desc: "صالات داخلية مكيفة مجهزة بأبسطة حماية وأجهزة تدريب للياقة البدنية والدفاع عن النفس.",
          },
        ],
        giantMetrics: [
          { num: "FIFA", label: "مواصفات الملاعب", sub: "نجيل صناعي ماص للصدمات" },
          { num: "4+", label: "رياضات أساسية", sub: "قدم، سلة، طائرة، كاراتيه" },
          { num: "Pro", label: "أبراج إضاءة", sub: "مواصفات الملاعب الحديثة" },
          { num: "100%", label: "أنشطة وبطولات", sub: "دوري مدرسي منتظم" },
        ],
      },
      {
        id: "labs",
        name: "المختبرات العلمية الذكية",
        tag: "التجربة والتطبيق العملي",
        icon: Microscope,
        thumbnail: "/covers/student-excellence-about.jpg",
        image: "/covers/student-excellence-about.jpg",
        badge: "تجهيز معملي ذكي",
        desc: "مختبرات فيزياء وكيمياء وأحياء مجهزة بأحدث أدوات السلامة والمجاهر الرقمية وشاشات العرض التفاعلية لربط المنهج النظري بالتطبيق العملي المعملي.",
        hotspots: [
          {
            id: "labs-micro",
            x: 35,
            y: 42,
            title: "مجاهر رقمية وشاشات تفاعلية",
            desc: "توصيل فوري بين المجاهر والشاشات لعرض عينات الخلايا والتفاعلات بدقة 4K.",
          },
          {
            id: "labs-safety",
            x: 70,
            y: 50,
            title: "خزانات كواشف وأنظمة إخلاء",
            desc: "أنظمة شفط وتهوية كيميائية ومعايير أمان بيئي وصحي لحماية الطلاب في كل تجربة.",
          },
          {
            id: "labs-pract",
            x: 50,
            y: 75,
            title: "تجارب أسبوعية منتظمة",
            desc: "تطبيق عملي لكل وحدة دراسية لترسيخ المفاهيم العلمية بأسلوب ستيم (STEM).",
          },
        ],
        giantMetrics: [
          { num: "3", label: "مختبرات متخصصة", sub: "فيزياء · كيمياء · أحياء" },
          { num: "4K", label: "مجاهر رقمية", sub: "عرض تفاعلي عالي الدقة" },
          { num: "STEM", label: "تكامل العلوم", sub: "ربط المعرفة بالتطبيق" },
          { num: "100%", label: "أمان وسلامة", sub: "معايير بيئية وصحية قياسية" },
        ],
      },
    ],
    girls: [
      {
        id: "early-childhood",
        name: "أقسام الطفولة المبكرة والروضة",
        tag: "غراس البدايات السعيدة",
        icon: Heart,
        thumbnail: "/covers/student-excellence-about.jpg",
        image: "/covers/student-excellence-about.jpg",
        badge: "بيئة تنشئة تفاعلية",
        desc: "بيئة تعليمية وتربوية تفاعلية مصممة خصيصاً للأطفال لتنمية مهارات التفكير، والاستكشاف الحركي واللغوي، بإشراف معلمات متخصصات في رياض الأطفال.",
        hotspots: [
          {
            id: "early-montessori",
            x: 32,
            y: 45,
            title: "أركان التعلم ومنتسوري",
            desc: "وسائل حسية وحركية تعزز استقلال الطفل وتنمي قدراته الذهنية في سنوات البناء الأولى.",
          },
          {
            id: "early-play",
            x: 68,
            y: 40,
            title: "مناطق لعب آمنة ومظللة",
            desc: "أرضيات مطاطية ماصة للصدمات وألعاب حاصلة على شهادات السلامة العالمية.",
          },
          {
            id: "early-clinic",
            x: 50,
            y: 75,
            title: "إشراف ورعاية صحية متكاملة",
            desc: "عيادة مدرسية مجهزة وكادر تمريض لمتابعة النمو والصحة العامة لأطفالنا.",
          },
        ],
        giantMetrics: [
          { num: "KG", label: "روضة وتمهيدي", sub: "تأسيس لغوي وقيمي راسخ" },
          { num: "Mont.", label: "منتسوري وذكاءات", sub: "تنمية المواهب المبكرة" },
          { num: "100%", label: "أمان وسلامة", sub: "أرضيات وألعاب مطابقة" },
          { num: "Care", label: "رعاية وعيادة", sub: "متابعة صحية وتربوية" },
        ],
      },
      {
        id: "theater",
        name: "مسرح الاحتفالات وقاعات الإبداع والخطابة",
        tag: "بناء الشخصية والقيادة",
        icon: Sparkles,
        thumbnail: "/covers/cover-about.jpg",
        image: "/covers/cover-about.jpg",
        badge: "قاعة كبرى للمناسبات",
        desc: "مسرح مدرسي صرحي مجهز بأحدث أنظمة الصوت والإضاءة الرقمية، لاحتضان الفعاليات والملتقيات، مسابقات الإلقاء، والمؤتمرات الطلابية باللغتين العربية والإنجليزية.",
        hotspots: [
          {
            id: "theater-stage",
            x: 45,
            y: 40,
            title: "منصة عرض وإضاءة سينمائية",
            desc: "أنظمة إضاءة رقمية ومؤثرات ضوئية حديثة تدعم العروض المسرحية والمحافل الرسمية.",
          },
          {
            id: "theater-audio",
            x: 75,
            y: 50,
            title: "صوتيات عازلة وميكروفونات لاسلكية",
            desc: "توزيع صوتي محيطي يضمن وضوح الكلمة والإلقاء في كافة أرجاء القاعة الكبرى.",
          },
          {
            id: "theater-privacy",
            x: 25,
            y: 75,
            title: "خصوصية نسائية وبيئة نموذجية",
            desc: "قاعات مستقلة ومجهزة بكافة المرافق اللوجستية لاحتضان احتفالات الطالبات وأمهاتهن.",
          },
        ],
        giantMetrics: [
          { num: "Mega", label: "قاعة ومسرح كبرى", sub: "لاحتضان المحافل الرسمية" },
          { num: "Audio", label: "صوتيات احترافية", sub: "أنظمة رقمية متطورة" },
          { num: "2 Lang", label: "خطابة وإلقاء", sub: "عربي وإنجليزي بطلاقة" },
          { num: "100%", label: "خصوصية نسائية", sub: "بيئة مريحة ومستقلة" },
        ],
      },
      {
        id: "languages",
        name: "معامل اللغات والحاسوب المتقدمة",
        tag: "الطلاقة والتمكين الرقمي",
        icon: Cpu,
        thumbnail: "/covers/student-lab-admissions.jpg",
        image: "/covers/student-lab-admissions.jpg",
        badge: "محطات حاسوب 1:1",
        desc: "معامل حاسوبية ذكية مدعومة بأحدث برمجيات التدريب على اللغة الإنجليزية والبرمجة والتصميم الجرافيكي، لإعداد طالبات يمتلكن المهارات الرقمية المتقدمة.",
        hotspots: [
          {
            id: "lang-pc",
            x: 35,
            y: 45,
            title: "محطات رقمية فردية 1:1",
            desc: "أجهزة متصلة بالإنترنت الآمن ومنصات تعليم اللغات التفاعلية العالمية.",
          },
          {
            id: "lang-soft",
            x: 70,
            y: 40,
            title: "برمجيات الاستماع والطلاقة",
            desc: "برامج متخصصة لقياس مخارج الحروف والتدريب على المحادثات الإنجليزية بطلاقة.",
          },
          {
            id: "lang-code",
            x: 52,
            y: 75,
            title: "أكاديميات البرمجة والمونتاج",
            desc: "مسارات تدريبية في سكراتش، بايثون، وتصميم الجرافيك والمونتاج الرقمي.",
          },
        ],
        giantMetrics: [
          { num: "1:1", label: "محطات ذكية", sub: "حاسوب لكل طالبة" },
          { num: "IELTS", label: "طلاقة لغوية", sub: "مناهج دولية معتمدة" },
          { num: "Code", label: "برمجة وتصميم", sub: "سكراتش وبايثون ومونتاج" },
          { num: "Cognia", label: "دبلومة أمريكية", sub: "تأهيل أكاديمي متقدم" },
        ],
      },
      {
        id: "playgrounds",
        name: "الملاعب والساحات الترفيهية المظللة بالكامل",
        tag: "حيوية وأمان تام",
        icon: Trophy,
        thumbnail: "/covers/first-lego-champions.png",
        image: "/covers/first-lego-champions.png",
        badge: "تظليل عازل 100%",
        desc: "ساحات أنشطة وفسحة واسعة ومظللة بنسبة 100% لتوفير الحماية التامة والراحة، مع ملاعب مجهزة لممارسة الأنشطة الرياضية والترويحية الحركية.",
        hotspots: [
          {
            id: "play-shade",
            x: 45,
            y: 35,
            title: "مظلات عازلة للحرارة 100%",
            desc: "هياكل تظليل حديثة تحجب الأشعة فوق البنفسجية وتوفر أجواء معتدلة طوال اليوم.",
          },
          {
            id: "play-rubber",
            x: 75,
            y: 60,
            title: "أرضيات مطاطية ماصة للصدمات",
            desc: "أرضيات بمواصفات أمان دولية لحماية الطالبات أثناء الركض والأنشطة الحركية.",
          },
          {
            id: "play-cam",
            x: 25,
            y: 70,
            title: "كاميرات مراقبة وإشراف متواصل",
            desc: "منظومة أمان وكوادر إشرافية تتابع سلامة الطالبات في أوقات الفسحة والأنشطة.",
          },
        ],
        giantMetrics: [
          { num: "100%", label: "تظليل عازل", sub: "حماية تامة من الشمس" },
          { num: "Safe", label: "أرضيات مطاطية", sub: "أعلى معايير الأمان" },
          { num: "Sport", label: "ألعاب ولياقة", sub: "كرة طائرة وسلة وأنشطة" },
          { num: "24/7", label: "أنظمة أمان", sub: "كاميرات ومتابعة مستمرة" },
        ],
      },
      {
        id: "art-studios",
        name: "استوديوهات الفنون والمختبرات العلمية",
        tag: "الفنون والعلوم التطبيقية",
        icon: Palette,
        thumbnail: "/covers/student-robotics-accreditations.jpg",
        image: "/covers/student-robotics-accreditations.jpg",
        badge: "إبداع ومعامل علوم",
        desc: "أروقة مخصصة لإطلاق مواهب الرسم والأشغال اليدوية والخط العربي، إلى جانب مختبرات العلوم المتكاملة لتطبيق التجارب والاستكشاف العلمي.",
        hotspots: [
          {
            id: "art-easels",
            x: 35,
            y: 45,
            title: "مراسم الفن والخط العربي",
            desc: "أركان مجهزة بالحوامل والألوان الزيتية والمائية وأدوات الخط العربي التراثي.",
          },
          {
            id: "art-gallery",
            x: 70,
            y: 40,
            title: "معارض سنوية لإنتاج الطالبات",
            desc: "أروقة عرض تحتفي بلوحات ومجسمات وإبداعات الطالبات الفائزة في المسابقات.",
          },
          {
            id: "art-science",
            x: 52,
            y: 75,
            title: "مختبرات علوم متكاملة",
            desc: "تجهيزات بيولوجية وكيميائية مدرسية لتطبيق التجارب والاستكشاف العلمي العملي.",
          },
        ],
        giantMetrics: [
          { num: "Art", label: "فنون تشكيلية", sub: "رسم وخزف وخط عربي" },
          { num: "Expo", label: "معارض سنوية", sub: "احتفاء بإنتاج الطالبات" },
          { num: "Lab", label: "مختبرات علوم", sub: "تجهيزات كيمياء وأحياء" },
          { num: "Pro", label: "إشراف متخصص", sub: "نخبة من الأكاديميات" },
        ],
      },
    ],
  };

  const currentFacilities = campusFacilities[activeCampusTab];
  const activeFacility = currentFacilities[activeFacilityIndex] || currentFacilities[0];
  const activeEra = timelineEras[activeTimelineIndex] || timelineEras[0];

  return (
    <AqeeqLuxuryPageShell
      header={<AlaqeeqStudioSiteHeader title="عن مدارس العقيق الأهلية والدولية" active="about" />}
      footer={<AlaqeeqStudioSiteFooter />}
      useCurtain={true}
      curtainKicker="✦ استكشف صروح ومسيرة العقيق ✦"
      hero={
        <section
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
                        : "border-[#08467d]/30 bg-blue-50 text-[#08467d]"
                      : dark
                      ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                      : "border-[#08467d]/25 bg-white text-[#08467d]"
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
                    dark ? "text-slate-300" : "text-slate-700 font-medium"
                  }`}
                />

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 mb-10">
                  <Button
                    onClick={() => navigate("/admissions")}
                    className={`rounded-2xl px-8 py-6 text-base font-black shadow-xl transition active:scale-95 ${
                      dark
                        ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black hover:opacity-95 shadow-[#f8ca14]/20"
                        : "bg-gradient-to-r from-[#08467d] to-[#042442] text-white hover:opacity-95 shadow-[#08467d]/25"
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
                    dark ? "border-white/10 bg-white/[0.03]" : "border-[#08467d]/15 bg-white shadow-md"
                  }`}
                >
                  <div className="p-2 rounded-xl transition hover:scale-105">
                    <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>منذ 1994</span>
                    <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>+30 عاماً من الريادة</span>
                  </div>
                  <div className="p-2 rounded-xl transition hover:scale-105">
                    <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>مجمعين</span>
                    <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>للبنين والبنات</span>
                  </div>
                  <div className="p-2 rounded-xl transition hover:scale-105">
                    <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"}`}>Cognia</span>
                    <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>اعتماد أمريكي</span>
                  </div>
                  <div className="p-2 rounded-xl transition hover:scale-105">
                    <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>KG - 12</span>
                    <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>كافة المراحل</span>
                  </div>
                </div>
              </div>

              {/* Left Column: 3D Scroll Parallax Card with Floating Satellite Badges (5 cols) */}
              <div className="lg:col-span-5 relative">
                {/* Floating Orbiting Satellite Badge 1 (Top-Right Parallax) */}
                <motion.div
                  style={{ y: heroBadge1Y }}
                  className="absolute -top-6 -right-4 sm:-right-8 z-30 pointer-events-none hidden sm:flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#08467d]/95 to-[#042442]/95 text-white border border-[#f8ca14]/40 px-4 py-2 text-xs font-black shadow-2xl backdrop-blur-xl"
                >
                  <ShieldCheck size={16} className="text-[#f8ca14]" />
                  <span>Cognia USA · اعتماد دولي</span>
                </motion.div>

                {/* Floating Orbiting Satellite Badge 2 (Bottom-Left Parallax) */}
                <motion.div
                  style={{ y: heroBadge2Y }}
                  className="absolute -bottom-6 -left-4 sm:-left-8 z-30 pointer-events-none hidden sm:flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0c1218]/95 to-black/95 text-white border border-[#f8ca14]/40 px-4 py-2 text-xs font-black shadow-2xl backdrop-blur-xl"
                >
                  <Star size={14} className="text-[#f8ca14] fill-[#f8ca14]" />
                  <span>30 عاماً من الريادة · 1994 - 2026</span>
                </motion.div>

                <motion.div
                  style={{
                    y: heroCardY,
                    rotateX: heroCardRotateX,
                    scale: heroCardScale,
                    transformPerspective: 1200,
                  }}
                  className="w-full"
                >
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
                        ? "border-[#f8ca14]/30 bg-[#0b1218] shadow-black/80 ring-1 ring-[#f8ca14]/20"
                        : "border-[#08467d]/15 bg-white shadow-xl ring-1 ring-[#08467d]/10"
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
                          <p className="text-[11px] text-[#f8ca14] drop-shadow-md">أصالة القيم ومعايير الاعتماد الدولي</p>
                        </div>
                        <span className="rounded-xl bg-[#08467d]/90 px-2.5 py-1 text-[10px] font-black backdrop-blur-md shadow text-white">
                          المدينة المنورة
                        </span>
                      </div>
                    </div>

                    {/* Overlapping Floating Trust Chip (Bottom) */}
                    <div
                      className={`mt-3 p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                        dark ? "border-white/10 bg-black/60 text-slate-200" : "border-[#08467d]/15 bg-slate-50 text-slate-800"
                      }`}
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f8ca14]/15 text-[#f8ca14]">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <h5 className={`text-xs font-black ${dark ? "text-white" : "text-[#08467d]"}`}>مجمع البنين ومجمع البنات بالمدينة</h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">حي الرانوناء (ممشى الهجرة) · بيئة نموذجية متكاملة</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      }
    >
      {/* Quick Jump Anchor Command Bar — ثابت في مكانه الطبيعي ولا ينزل مع السكرول */}
      <div className={`relative z-20 border-b py-2.5 px-3 sm:px-4 backdrop-blur-xl transition ${
        dark ? "bg-black/80 border-white/10" : "bg-white/85 border-slate-200 shadow-sm"
      }`}>
        <div className="container mx-auto max-w-5xl flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide flex-nowrap sm:flex-wrap text-xs font-black py-1">
          <a
            href="#timeline-section"
            className={`shrink-0 px-3.5 py-2 rounded-xl border transition active:scale-95 ${
              dark
                ? "border-white/10 bg-white/5 text-slate-300 hover:text-[#f8ca14] hover:border-[#f8ca14]/40 hover:bg-white/10"
                : "border-black/5 bg-slate-50 text-slate-700 hover:text-[#08467d] hover:border-[#08467d]/30 hover:bg-white"
            }`}
          >
            مسيرة 30 عاماً 📜
          </a>
          <a
            href="#campuses-section"
            className={`shrink-0 px-3.5 py-2 rounded-xl border transition active:scale-95 ${
              dark
                ? "border-white/10 bg-white/5 text-slate-300 hover:text-[#f8ca14] hover:border-[#f8ca14]/40 hover:bg-white/10"
                : "border-black/5 bg-slate-50 text-slate-700 hover:text-[#08467d] hover:border-[#08467d]/30 hover:bg-white"
            }`}
          >
            مستكشف المجمعات والمرافق 🏫
          </a>
          <a
            href="#vision-section"
            className={`shrink-0 px-3.5 py-2 rounded-xl border transition active:scale-95 ${
              dark
                ? "border-white/10 bg-white/5 text-slate-300 hover:text-[#f8ca14] hover:border-[#f8ca14]/40 hover:bg-white/10"
                : "border-black/5 bg-slate-50 text-slate-700 hover:text-[#08467d] hover:border-[#08467d]/30 hover:bg-white"
            }`}
          >
            الرؤية والرسالة 2030 🎯
          </a>
          <a
            href="#pillars-section"
            className={`shrink-0 px-3.5 py-2 rounded-xl border transition active:scale-95 ${
              dark
                ? "border-white/10 bg-white/5 text-slate-300 hover:text-[#f8ca14] hover:border-[#f8ca14]/40 hover:bg-white/10"
                : "border-black/5 bg-slate-50 text-slate-700 hover:text-[#08467d] hover:border-[#08467d]/30 hover:bg-white"
            }`}
          >
            ركائزنا التربوية 💡
          </a>
          <a
            href="#map-contact-section"
            className={`shrink-0 px-3.5 py-2 rounded-xl border transition active:scale-95 ${
              dark
                ? "border-white/10 bg-white/5 text-slate-300 hover:text-[#f8ca14] hover:border-[#f8ca14]/40 hover:bg-white/10"
                : "border-black/5 bg-slate-50 text-slate-700 hover:text-[#08467d] hover:border-[#08467d]/30 hover:bg-white"
            }`}
          >
            الموقع والتواصل 📍
          </a>
        </div>
      </div>

      {/* ========================================================
          STAGE 1: The 30-Year Legacy Time Machine (Scroll-Driven Parallax + Luminous Conduit)
      ======================================================== */}
      <section ref={timelineSectionRef} id="timeline-section" className="py-20 container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div
            className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
              dark ? "text-[#f8ca14]" : "text-[#c59b27]"
            } mb-2`}
          >
            <Sparkles size={14} />
            <span>ثلاثة عقود من العطاء التربوي بطيبة الطيبة</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
            مسيرة العقيق المضيئة عبر الزمن (1994 - 2026) 📜
          </h2>
          <p className={`mt-3 text-sm sm:text-base ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
            رحلة تربوية رائدة خطت خطواتها الأولى في المدينة المنورة قبل أكثر من 30 عاماً لتغدو اليوم منارة تعليمية بمعايير عالمية.
          </p>

          {/* Timeline Interactive Progress Conduit Track */}
          <div className="relative max-w-xl mx-auto mt-8 mb-4 px-6 hidden sm:block">
            <div className={`h-1.5 w-full rounded-full ${dark ? "bg-white/10" : "bg-emerald-950/10"} relative overflow-hidden`}>
              <motion.div
                className="h-full bg-gradient-to-r from-[#015a37] via-[#f8ca14] to-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${((activeTimelineIndex) / (timelineEras.length - 1)) * 100}%`,
                }}
              />
            </div>
            {/* Milestone Indicator Beads */}
            <div className="absolute top-1/2 -translate-y-1/2 left-6 right-6 flex justify-between pointer-events-none">
              {timelineEras.map((era, idx) => (
                <div
                  key={era.shortYear}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    idx <= activeTimelineIndex
                      ? "border-[#f8ca14] bg-[#015a37] scale-125 shadow-[0_0_12px_rgba(248,202,20,0.6)]"
                      : dark ? "border-white/20 bg-[#0c1218]" : "border-slate-300 bg-white"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Interactive Era Buttons with Smooth Transitions */}
          <div
            className={`mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto p-1.5 rounded-2xl border shadow-sm transition ${
              dark ? "border-white/10 bg-[#0c141a]" : "border-slate-200/90 bg-white"
            }`}
          >
            {timelineEras.map((era, eraIdx) => (
              <button
                key={era.shortYear}
                type="button"
                onClick={() => setActiveTimelineIndex(eraIdx)}
                className={`relative p-3 rounded-xl text-center transition active:scale-95 ${
                  activeTimelineIndex === eraIdx
                    ? "bg-[#015a37] text-white shadow-md ring-1 ring-[#f8ca14]/40"
                    : dark
                    ? "text-slate-400 hover:text-white hover:bg-white/5"
                    : "text-slate-700 hover:text-[#015a37] hover:bg-slate-50"
                }`}
              >
                <span className={`block text-base font-black ${activeTimelineIndex === eraIdx ? "text-[#f8ca14]" : ""}`}>
                  {era.shortYear}
                </span>
                <span className="text-[11px] font-bold truncate block">{era.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Active Timeline Era Card with Scroll 3D Perspective */}
        <motion.div
          style={{
            rotateX: isDesktop ? timelineRotateX : 0,
            scale: isDesktop ? timelineScale : 1,
            transformPerspective: 1200,
          }}
          className={`max-w-5xl mx-auto rounded-[2.5rem] border p-4 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden transition duration-500 will-change-transform ${
            dark ? "border-emerald-500/20 bg-[#0c1218]/90" : "border-emerald-700/20 bg-white/95"
          }`}
        >
          {/* Holographic Watermark Year */}
          <span
            className={`pointer-events-none absolute left-0 -bottom-4 select-none font-black text-6xl sm:text-8xl md:text-9xl leading-none transition-all duration-700 ${
              dark ? "text-white/[0.03]" : "text-black/[0.02]"
            }`}
          >
            {activeEra.shortYear}
          </span>

          {/* Era Content with Cinematic Cross-Fade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeEra.shortYear}
              initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10"
            >
              {/* Story & Details Column */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3 mb-3">
                  <span className="rounded-full bg-[#f8ca14]/15 px-3.5 py-1 text-xs font-black text-[#f8ca14]">
                    محطة تاريخية بارزة ✦
                  </span>
                  <span className={`text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"}`}>
                    {activeEra.year}
                  </span>
                </div>

                <h3 className={`text-2xl sm:text-3xl font-black mb-4 ${dark ? "text-white" : "text-[#08467d]"}`}>
                  {activeEra.title}
                </h3>

                <p className={`text-sm sm:text-base leading-relaxed mb-6 ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                  {activeEra.desc}
                </p>

                {/* Quote Ribbon */}
                <div
                  className={`p-4 rounded-2xl border mb-6 text-xs font-bold leading-relaxed ${
                    dark ? "border-white/10 bg-white/[0.03] text-[#f8ca14]" : "border-[#08467d]/15 bg-[#08467d]/5 text-[#08467d]"
                  }`}
                >
                  <span className="text-base font-serif ml-1">❝</span>
                  {activeEra.quote}
                  <span className="text-base font-serif mr-1">❞</span>
                </div>

                {/* Key Metrics Row */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                  {activeEra.metrics.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className={`p-2 sm:p-3 rounded-xl border text-center transition hover:scale-105 ${
                        dark ? "border-white/5 bg-black/40" : "border-black/5 bg-slate-50"
                      }`}
                    >
                      <span className="block text-[10px] text-slate-500 font-bold">{m.label}</span>
                      <span className={`text-[11px] sm:text-xs font-black mt-1 block truncate ${dark ? "text-white" : "text-[#0a192f]"}`}>{m.val}</span>
                    </div>
                  ))}
                </div>

                {/* Navigation Controls between Eras */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    disabled={activeTimelineIndex === 0}
                    onClick={() => setActiveTimelineIndex((idx) => Math.max(0, idx - 1))}
                    className={`inline-flex items-center gap-1 text-xs font-black transition ${
                      activeTimelineIndex === 0
                        ? "opacity-30 cursor-not-allowed"
                        : dark ? "text-slate-300 hover:text-[#f8ca14]" : "text-slate-700 hover:text-[#015a37]"
                    }`}
                  >
                    <ChevronRight size={16} />
                    <span>المحطة السابقة</span>
                  </button>

                  <span className="text-[11px] font-black text-slate-400">
                    {activeTimelineIndex + 1} من {timelineEras.length}
                  </span>

                  <button
                    type="button"
                    disabled={activeTimelineIndex === timelineEras.length - 1}
                    onClick={() => setActiveTimelineIndex((idx) => Math.min(timelineEras.length - 1, idx + 1))}
                    className={`inline-flex items-center gap-1 text-xs font-black transition ${
                      activeTimelineIndex === timelineEras.length - 1
                        ? "opacity-30 cursor-not-allowed"
                        : dark ? "text-slate-300 hover:text-[#f8ca14]" : "text-slate-700 hover:text-[#015a37]"
                    }`}
                  >
                    <span>المحطة التالية</span>
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>

              {/* Photo Column with Subtle Counter-Parallax */}
              <div className="lg:col-span-5">
                <motion.div style={{ y: timelinePhotoY }} className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3]">
                  <img
                    src={activeEra.image}
                    alt={activeEra.title}
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                  <div className="absolute bottom-4 right-4 left-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <Milestone size={16} className="text-[#f8ca14]" />
                      <span className="text-xs font-black text-[#f8ca14]">{activeEra.stats}</span>
                    </div>
                    <p className="text-[11px] text-slate-200 line-clamp-2">{activeEra.highlight}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </section>

                  {/* ========================================================
          STAGE 2: Multi-Mode Next-Gen Architectural Campus Showcase
          (Interactive Mode Switcher: Accordion | 3D Coverflow | 3D Deck | Blueprint Zoom)
      ======================================================== */}
      <section
        ref={campusSectionRef}
        id="campuses-section"
        className={`py-20 border-y relative overflow-hidden ${
          dark ? "border-white/10 bg-[#05080c]" : "border-[#08467d]/15 bg-white"
        }`}
      >
        {/* Subtle Ambient Lighting Aura */}
        <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full blur-3xl opacity-15 bg-[#08467d]" />
        <div className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full blur-3xl opacity-15 bg-[#f8ca14]" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-black text-[#f8ca14] mb-2">
              <Building2 size={15} />
              <span>✦ الصروح والمجمعات التعليمية النموذجية · حي الرانوناء ✦</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              استكشف مجمعاتنا بالمدينة المنورة 🏫
            </h2>
            <p className={`text-xs sm:text-sm mt-2 max-w-2xl mx-auto ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
              مبانٍ مدرسية صرحية مستقلة بمحاذاة ممشى الهجرة، تضم تجهيزات أكاديمية ورياضية ومعملية بمعايير عالمية للبنين والبنات.
            </p>

            {/* Campus Switcher Tabs (Boys vs Girls) */}
            <div
              className={`mt-6 inline-flex max-w-full items-center rounded-2xl border p-1 sm:p-1.5 shadow-sm transition overflow-hidden ${
                dark ? "border-white/10 bg-[#0c141a]" : "border-slate-200/90 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveCampusTab("boys");
                  setActiveFacilityIndex(0);
                  setActiveHotspotId(null);
                }}
                className={`relative z-10 rounded-xl px-3 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-black transition active:scale-95 min-w-0 ${
                  activeCampusTab === "boys"
                    ? "text-[#f8ca14]"
                    : dark
                    ? "text-slate-400 hover:text-white hover:bg-white/5"
                    : "text-slate-700 hover:text-[#08467d] hover:bg-slate-50"
                }`}
              >
                {activeCampusTab === "boys" && (
                  <motion.div
                    layoutId="campusActivePill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#08467d] to-[#042442] shadow-md ring-1 ring-[#f8ca14]/40"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 block truncate">
                  <span className="sm:hidden">مجمع البنين 🎓</span>
                  <span className="hidden sm:inline">مجمع البنين (الأهلي والدولي) 🎓</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCampusTab("girls");
                  setActiveFacilityIndex(0);
                  setActiveHotspotId(null);
                }}
                className={`relative z-10 rounded-xl px-3 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-black transition active:scale-95 min-w-0 ${
                  activeCampusTab === "girls"
                    ? "text-[#f8ca14]"
                    : dark
                    ? "text-slate-400 hover:text-white hover:bg-white/5"
                    : "text-slate-700 hover:text-[#08467d] hover:bg-slate-50"
                }`}
              >
                {activeCampusTab === "girls" && (
                  <motion.div
                    layoutId="campusActivePill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#08467d] to-[#042442] shadow-md ring-1 ring-[#f8ca14]/40"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 block truncate">
                  <span className="sm:hidden">مجمع البنات 🌸</span>
                  <span className="hidden sm:inline">مجمع البنات والطفولة المبكرة 🌸</span>
                </span>
              </button>
            </div>
          </div>

          {/* ========================================================
              ARCHITECTURAL EXPANDING ACCORDION (الستارة المعمارية)
          ======================================================== */}
          <div className="max-w-6xl mx-auto">
            {/* Desktop Expanding Panels (5 side-by-side columns) */}
            <div className="hidden lg:flex h-[580px] gap-3 p-3 rounded-[2.5rem] border overflow-hidden backdrop-blur-2xl shadow-2xl relative bg-[#091218]/90 border-[#08467d]/30">
              {currentFacilities.map((fac, fIdx) => {
                const FacIcon = fac.icon;
                const isExpanded = activeFacilityIndex === fIdx;

                return (
                  <motion.div
                    key={fac.id}
                    layout
                    transition={{ type: "spring", stiffness: 220, damping: 26, mass: 0.9 }}
                    onClick={() => {
                      if (!isExpanded) {
                        setActiveFacilityIndex(fIdx);
                        setActiveHotspotId(null);
                      }
                    }}
                    className={`relative rounded-[2rem] overflow-hidden border transition-colors duration-300 ${
                      isExpanded
                        ? "flex-[5] border-[#f8ca14]/50 shadow-2xl ring-1 ring-[#f8ca14]/30"
                        : "flex-1 min-w-[76px] border-white/10 hover:border-[#f8ca14]/40 cursor-pointer opacity-85 hover:opacity-100 group"
                    }`}
                  >
                    {/* Background Photo */}
                    <img
                      src={fac.image}
                      alt={fac.name}
                      className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${
                        isExpanded ? "scale-105" : "grayscale-[25%] group-hover:scale-110"
                      }`}
                    />
                    {/* Rich Cinematic Dark Gradient Overlay */}
                    <div
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        isExpanded
                          ? "bg-gradient-to-t from-black/95 via-black/60 to-black/30"
                          : "bg-black/75 group-hover:bg-black/60"
                      }`}
                    />

                    {/* Expanded View Content */}
                    {isExpanded ? (
                      <div className="relative z-10 h-full flex flex-col justify-between p-8 text-right text-white">
                        {/* Top Bar with Badges & Live Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded-xl bg-[#08467d]/90 border border-[#f8ca14]/40 px-3.5 py-1 text-xs font-black text-[#f8ca14] shadow-lg backdrop-blur-md">
                              {fac.tag} ✦
                            </span>
                            <span className="rounded-xl bg-black/60 border border-white/20 px-3 py-1 text-xs font-bold text-slate-200 backdrop-blur-md">
                              {fac.badge}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-[#f8ca14] bg-black/60 px-3 py-1 rounded-full border border-[#f8ca14]/30 backdrop-blur-md">
                            <span className="h-2 w-2 rounded-full bg-[#f8ca14] animate-pulse" />
                            <span>مرفق حي مجهز 100%</span>
                          </div>
                        </div>

                        {/* Center Story */}
                        <div className="max-w-2xl my-auto py-4">
                          <h3 className="text-3xl sm:text-4xl font-black mb-3 drop-shadow-md text-white">
                            {fac.name}
                          </h3>
                          <p className="text-sm sm:text-base leading-relaxed text-slate-200 font-medium mb-6 drop-shadow">
                            {fac.desc}
                          </p>
                          {/* 4 Giant Metrics Chips */}
                          <div className="grid grid-cols-4 gap-3">
                            {fac.giantMetrics.map((gm, gIdx) => (
                              <div
                                key={gIdx}
                                className="p-3 rounded-2xl border border-white/15 bg-black/50 backdrop-blur-xl text-center"
                              >
                                <span className="block text-xl sm:text-2xl font-black text-[#f8ca14]">
                                  {gm.num}
                                </span>
                                <span className="block text-[11px] font-black text-white truncate mt-0.5">
                                  {gm.label}
                                </span>
                                <span className="block text-[10px] text-slate-300 truncate">
                                  {gm.sub}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom CTA Row */}
                        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                          <a
                            href="https://www.google.com/maps/search/?api=1&query=Al+Aqiq+Schools+Al+Ranuna+Madinah"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#08467d] to-[#042442] hover:opacity-95 text-[#f8ca14] border border-[#f8ca14]/30 px-5 py-3 text-xs font-black shadow-lg transition active:scale-95"
                          >
                            <MapPin size={15} />
                            <span>فتح الموقع في Google Maps 📍</span>
                          </a>
                          <a
                            href={activeCampusTab === "boys" ? "tel:+966148131652" : "tel:+966148644466"}
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 text-white px-5 py-3 text-xs font-bold transition backdrop-blur-md"
                          >
                            <Phone size={14} />
                            <span>{activeCampusTab === "boys" ? "0148131652" : "0148644466"}</span>
                          </a>
                          <Button
                            onClick={() => navigate("/admissions")}
                            variant="outline"
                            className="rounded-2xl text-xs font-black border-white/20 text-white hover:bg-white/10"
                          >
                            حجز جولة تعريفية في المرفق ✦
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Compressed Vertical Panel Spine */
                      <div className="relative z-10 h-full flex flex-col items-center justify-between py-8">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-black/70 border border-white/20 text-[#f8ca14] shadow-md backdrop-blur-md group-hover:border-[#f8ca14]/40 transition">
                          <FacIcon size={20} />
                        </div>
                        <span className="font-black text-sm text-white [writing-mode:vertical-rl] tracking-wider transform rotate-180 select-none group-hover:text-[#f8ca14] transition">
                          {fac.name}
                        </span>
                        <span className="text-[10px] font-bold text-[#f8ca14] bg-black/70 border border-[#f8ca14]/30 px-2.5 py-1 rounded-full backdrop-blur-md">
                          ✦ انقر للعرض
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile & Tablet Fallback for Accordion Mode */}
            <div className="flex lg:hidden flex-col gap-3">
              {currentFacilities.map((fac, fIdx) => {
                const FacIcon = fac.icon;
                const isExpanded = activeFacilityIndex === fIdx;

                return (
                  <div
                    key={fac.id}
                    onClick={() => setActiveFacilityIndex(fIdx)}
                    className={`rounded-3xl border overflow-hidden transition ${
                      isExpanded
                        ? "border-[#f8ca14]/60 bg-[#0c1815] shadow-xl p-4"
                        : "border-white/10 bg-[#0b1015] p-3.5 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-black/60 border border-white/15 text-[#f8ca14]">
                          <FacIcon size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] text-[#f8ca14] font-bold block">{fac.tag}</span>
                          <h4 className="text-sm font-black text-white">{fac.name}</h4>
                        </div>
                      </div>
                      <span className={`text-xs font-black transition-transform ${isExpanded ? "rotate-90 text-[#f8ca14]" : "text-slate-400"}`}>
                        ❯
                      </span>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t border-white/10 space-y-4"
                        >
                          <div className="rounded-2xl overflow-hidden aspect-video relative">
                            <img src={fac.image} alt={fac.name} className="h-full w-full object-cover" />
                          </div>
                          <p className="text-xs leading-relaxed text-slate-300 font-medium">{fac.desc}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {fac.giantMetrics.map((gm, gIdx) => (
                              <div key={gIdx} className="p-2.5 rounded-xl border border-white/10 bg-black/40 text-center">
                                <span className="block text-lg font-black text-[#f8ca14]">{gm.num}</span>
                                <span className="block text-[10px] font-bold text-white">{gm.label}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <a
                              href="https://www.google.com/maps/search/?api=1&query=Al+Aqiq+Schools+Al+Ranuna+Madinah"
                              target="_blank"
                              rel="noreferrer"
                              className="text-center py-2.5 rounded-xl bg-[#015a37] text-white text-xs font-black"
                            >
                              فتح الموقع في Google Maps 📍
                            </a>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/admissions");
                              }}
                              variant="outline"
                              className="text-xs font-black border-white/20 text-white"
                            >
                              حجز جولة تعريفية ✦
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          STAGE 3: Royal Strategic Document: Vision & Mission 2030 (Dual-Wing 3D Pivot)
      ======================================================== */}
      <section ref={visionSectionRef} id="vision-section" className="py-20 container mx-auto px-4 sm:px-6">
        <div
          className={`max-w-5xl mx-auto rounded-[3rem] border p-5 sm:p-10 md:p-14 shadow-2xl relative overflow-hidden ${
            dark
              ? "border-emerald-500/30 bg-gradient-to-b from-[#0c141a] to-[#060a0e] ring-1 ring-emerald-500/20"
              : "border-emerald-700/20 bg-gradient-to-b from-white to-[#fbfaf8] ring-1 ring-emerald-900/10 shadow-xl"
          }`}
        >
          {/* Ambient Lighting Orbs */}
          <div className="pointer-events-none absolute -top-24 right-1/4 w-80 h-80 bg-[#08467d]/10 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 w-80 h-80 bg-[#f8ca14]/10 rounded-full blur-3xl" />

          <div className="text-center max-w-xl mx-auto mb-12 relative z-10">
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

          <div style={{ perspective: 1400 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Vision Plaque with Scroll 3D Wing Pivot */}
            <motion.div
              style={{
                rotateY: isDesktop ? visionWingLeft : 0,
                transformPerspective: 1400,
              }}
              className={`rounded-3xl border p-5 sm:p-8 relative overflow-hidden shadow-xl will-change-transform group transition duration-300 hover:border-[#f8ca14]/50 ${
                dark ? "border-white/10 bg-white/5" : "border-[#08467d]/15 bg-[#08467d]/[0.03]"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#08467d]/10 text-[#08467d] dark:bg-[#f8ca14]/15 dark:text-[#f8ca14]">
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

            {/* Mission Plaque with Scroll 3D Wing Pivot */}
            <motion.div
              style={{
                rotateY: isDesktop ? visionWingRight : 0,
                transformPerspective: 1400,
              }}
              className={`rounded-3xl border p-5 sm:p-8 relative overflow-hidden shadow-xl will-change-transform group transition duration-300 hover:border-[#f8ca14]/50 ${
                dark ? "border-amber-500/20 bg-white/5" : "border-[#f8ca14]/20 bg-[#f8ca14]/[0.03]"
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
          STAGE 4: The 4 Institutional Pillars with Staggered 3D Parallax Cards
      ======================================================== */}
      <section
        ref={pillarsSectionRef}
        id="pillars-section"
        className={`py-20 border-y ${
          dark ? "border-white/10 bg-[#06080d]" : "border-[#08467d]/15 bg-white"
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
              <motion.div key={idx} style={{ y: pillarYOffsets[idx] }}>
                <PillarCard
                  pillar={pillar}
                  index={idx}
                  dark={dark}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================================================
          STAGE 5: Medina Interactive Map & Campus Logistics (Live Radar)
      ======================================================== */}
      <section id="map-contact-section" className="py-20 container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-black text-[#08467d] dark:text-[#f8ca14] mb-2">
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
            className={`lg:col-span-7 rounded-3xl border p-5 sm:p-8 flex flex-col justify-between shadow-xl ${
              dark ? "border-white/10 bg-[#0c1218]" : "border-[#08467d]/15 bg-white"
            }`}
          >
            <div>
              {/* Live Radar Pulse Indicator */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f8ca14] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#f8ca14]"></span>
                  </span>
                  <span className="text-xs font-black text-[#08467d] dark:text-[#f8ca14]">
                    تغطية النقل المدرسي نشطة وحية عبر 9 أحياء
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500">طيبة الطيبة</span>
              </div>

              <h3 className={`text-xl sm:text-2xl font-black mb-2 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                مجمعات العقيق الأهلية والدولية (بنين وبنات)
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${dark ? "text-slate-300" : "text-slate-600 font-medium"}`}>
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
                          ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                          : "border-[#08467d]/20 bg-[#08467d]/5 text-[#08467d]"
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
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#08467d] to-[#042442] hover:opacity-95 text-[#f8ca14] border border-[#f8ca14]/30 px-6 py-3.5 text-xs font-black shadow-lg transition active:scale-95"
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
                    ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                    : "border-[#08467d]/20 bg-white text-[#08467d] hover:bg-slate-50"
                }`}
              >
                <MessageCircle size={15} />
                <span>واتساب الاستقبال المباشر</span>
              </a>
            </div>
          </div>

          {/* Contact & Official Channels Card (5 cols) */}
          <div
            className={`lg:col-span-5 rounded-3xl border p-5 sm:p-8 flex flex-col justify-between shadow-xl ${
              dark ? "border-white/10 bg-[#0c1218]" : "border-[#08467d]/15 bg-white"
            }`}
          >
            <div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#08467d]/10 text-[#08467d] dark:bg-[#f8ca14]/15 dark:text-[#f8ca14] mb-4">
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
                    <span className="font-black text-[#08467d] dark:text-[#f8ca14]">مجمع البنين (الأهلي والدولي)</span>
                    <Phone size={14} className="text-slate-400" />
                  </div>
                  <a href="tel:+966148131652" className="text-sm font-black hover:underline dir-ltr block text-right">
                    0148131652
                  </a>
                </div>

                <div className={`p-3.5 rounded-2xl border ${dark ? "border-white/5 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-[#08467d] dark:text-[#f8ca14]">مجمع البنات والطفولة المبكرة</span>
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
