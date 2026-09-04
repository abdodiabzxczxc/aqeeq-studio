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
  Volume2,
  VolumeX,
  Sliders,
  Thermometer,
  Radio,
  Share2,
} from "lucide-react";

// ==========================================
// Web Audio Soft Haptic & Chime Synthesizer
// ==========================================
function playTactileChime(type: "click" | "soft" | "sweep" | "laser" = "soft") {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "sweep") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "laser") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(980, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch {
    // Audio context may be restricted before user gesture, safely ignore
  }
}

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
        onClick={() => {
          playTactileChime("click");
          setExpanded(!expanded);
        }}
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
// MAIN COMPONENT: AqeeqSchoolAboutPage
// ==========================================
export default function AqeeqSchoolAboutPage() {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [, navigate] = useLocation();

  // Scroll Progress for Smooth Parallax & 3D Depth
  const { scrollY } = useScroll();
  const rawHeroScale = useTransform(scrollY, [0, 400], [1, 0.94]);
  const rawHeroRotateX = useTransform(scrollY, [0, 400], [0, 4]);
  const rawHeroOpacity = useTransform(scrollY, [0, 450], [1, 0.65]);

  const smoothHeroScale = useSpring(rawHeroScale, { stiffness: 90, damping: 20 });
  const smoothHeroRotateX = useSpring(rawHeroRotateX, { stiffness: 90, damping: 20 });
  const smoothHeroOpacity = useSpring(rawHeroOpacity, { stiffness: 90, damping: 20 });

  // 1. Campus Atmospheric Mode: Morning Sun vs Twilight Starlight
  const [atmosphere, setAtmosphere] = useState<"morning" | "twilight">("morning");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 2. Bus Fleet Live Radar Drawer/State
  const [busRadarOpen, setBusRadarOpen] = useState(false);

  // 3. Prodigy 15-Year Simulator State
  const [prodigyStage, setProdigyStage] = useState<number>(0);

  // 4. Campus & Facility Explorer State
  const [activeCampusTab, setActiveCampusTab] = useState<"boys" | "girls">("boys");
  const [activeFacilityIndex, setActiveFacilityIndex] = useState<number>(0);
  const [activeHotspotIndex, setActiveHotspotIndex] = useState<number | null>(null);

  // 5. Timeline State
  const [activeTimelineIndex, setActiveTimelineIndex] = useState<number>(3);

  // 6. Vision 2030 Neural Matrix Active Node
  const [activeVisionNode, setActiveVisionNode] = useState<number>(0);

  // 7. VIP Campus Tour Builder State & Laser Key
  const [vipFocus, setVipFocus] = useState<string>("robotics");
  const [vipGrade, setVipGrade] = useState<string>("intermediate");
  const [vipScanCount, setVipScanCount] = useState<number>(0);

  // 3D Tilt for Hero Showcase Card
  const { ref: heroCardRef, tilt: heroTilt, onMove: onHeroMove, onLeave: onHeroLeave } = useMagneticTilt(6);

  // Play chime safely if enabled
  const triggerChime = (type: "click" | "soft" | "sweep" | "laser" = "soft") => {
    if (soundEnabled) playTactileChime(type);
  };

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

  // 15-Year Prodigy Stages Data
  const prodigyStages = [
    {
      id: "early",
      ageRange: "3 - 5 سنوات",
      stageTitle: "مرحلة الطفولة المبكرة ورياض الأطفال",
      kicker: "غراس البدايات وبناء الشخصية الأصيلة",
      quote: "حيث تتفتح مدارك الطفل في بيئة محبة وآمنة ترعى فطرته وتزرع شغف المعرفة الأول.",
      skills: [
        { name: "التعبير اللغوي والطلاقة الشفهية", pct: 95 },
        { name: "الاستكشاف الحسي وحساب منتسوري", pct: 90 },
        { name: "ترسيخ القيم والقرآن الكريم", pct: 98 },
        { name: "التفاعل الاجتماعي وبناء الثقة", pct: 92 },
      ],
      competitions: ["مهرجان البراعم المبدعين", "مسابقة الخطيب الصغير", "ألعاب الذكاء الحركي"],
      milestoneBadge: "تأسيس لغوي وقيمي قياسي",
      avatarImage: "/covers/student-excellence-about.jpg",
    },
    {
      id: "primary",
      ageRange: "6 - 11 سنة",
      stageTitle: "المرحلة الابتدائية واكتشاف الشغف",
      kicker: "تأسيس علمي راسخ وإطلاق مهارات التفكير",
      quote: "ننتقل بالطفل من مرحلة التلقي إلى مرحلة الاستكشاف والتحليل والمشاركة في منافسات الموهبة.",
      skills: [
        { name: "الرياضيات التطبيقية والتفكير المنطقي", pct: 94 },
        { name: "أساسيات لغات البرمجة والروبوت", pct: 88 },
        { name: "القراءة التحليلية والخطابة", pct: 92 },
        { name: "اللياقة والسباحة الأولمبية", pct: 95 },
      ],
      competitions: ["أولمبياد موهبة الوطني", "مسابقة كانجارو الدولية للرياضيات", "دوري الروبوت للناشئين"],
      milestoneBadge: "رعاية الموهوبين والمبتكرين",
      avatarImage: "/covers/student-lab-admissions.jpg",
    },
    {
      id: "intermediate",
      ageRange: "12 - 14 سنة",
      stageTitle: "المرحلة المتوسطة والمنافسة العالمية",
      kicker: "صقل المهارات القيادية وأولمبياد الذكاء الاصطناعي",
      quote: "مرحلة النضج الفكري حيث يمثل طلابنا المملكة في المحافل الدولية ويتألقون في لغات البرمجة المتقدمة.",
      skills: [
        { name: "بايثون والروبوتات المتقدمة WRO", pct: 96 },
        { name: "اللغة الإنجليزية الأكاديمية والتواصل الدولي", pct: 95 },
        { name: "التفكير النقدي والمناظرات", pct: 93 },
        { name: "المشاريع العلمية التطبيقية STEM", pct: 94 },
      ],
      competitions: ["بطولة أولمبياد الروبوت الدولي WRO", "معرض إبداع العلمي", "بطولات الخطابة بالإنجليزية"],
      milestoneBadge: "المركز الـ 5 عالمياً WRO",
      avatarImage: "/covers/student-robotics-accreditations.jpg",
    },
    {
      id: "secondary",
      ageRange: "15 - 18 سنة",
      stageTitle: "المرحلة الثانوية وبوابة أرقى الجامعات",
      kicker: "دبلومة كوجنيا الأمريكية والقبول الجامعي الدولي",
      quote: "إعداد قادة الغد لاجتياز اختبارات SAT و IELTS بأعلى الدرجات والالتحاق بأعرق الجامعات العالمية والمحلية.",
      skills: [
        { name: "درجات اختبارات IELTS و SAT الدولية", pct: 98 },
        { name: "القدرات العامة والتحصيلي (+98%)", pct: 99 },
        { name: "البحث الأكاديمي وريادة الأعمال", pct: 95 },
        { name: "المسؤولية المجتمعية والقيادة", pct: 97 },
      ],
      competitions: ["اختبارات College Board الرسمية", "هاكاثونات الذكاء الاصطناعي", "برامج موهبة للإثراء البحثي"],
      milestoneBadge: "قبول 100% في الجامعات المرموقة",
      avatarImage: "/covers/first-lego-champions.png",
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
        { label: "المسابح المغطاة", val: "شبه أولمبية بمقاييس دولية" },
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

  // Campus Facilities Data with Deep-Dive Hotspots
  const campusFacilities = {
    boys: [
      {
        id: "pool",
        name: "المسبح شبه الأولمبي المغطى",
        tag: "رياضة ولياقة واحتراف",
        image: "/covers/student-lab-admissions.jpg",
        desc: "مسبح مغطى ومكيف بمواصفات قياسية وتدفئة مياه شتوية ذكية، يشرف عليه كباتن سباحة معتمدون، مخصص لتدريب الطلاب من المراحل الأولية وحتى الثانوية.",
        specs: [
          { label: "المقاييس", val: "شبه أولمبي مغطى FINA" },
          { label: "السلامة", val: "منقذون معتمدون 100%" },
          { label: "المراحل", val: "الابتدائي، المتوسط، الثانوي" },
          { label: "التدفئة", val: "أنظمة تحكم حراري ذكية 30°C" },
        ],
        hotspots: [
          { x: 28, y: 55, title: "نظام تعقيم بالأوزون", desc: "مياه نقية وصحية بدون روائح كلور نفاذة لحماية عيون وبشرة الطلاب." },
          { x: 65, y: 40, title: "منصات انطلاق قياسية", desc: "مصممة وفق معايير الاتحاد الدولي لتدريب أبطال السباحة المدرسية." },
          { x: 80, y: 70, title: "منطقة الإشراف والإنقاذ", desc: "رؤية بانورامية كاملة وتواجد دائم لكادر الإنقاذ والمدربين." },
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
        hotspots: [
          { x: 35, y: 45, title: "حلبات بطولة WRO المعتمدة", desc: "محاكاة كاملة لمسارات البطولات العالمية وتحديات المهام الروبوتية." },
          { x: 72, y: 35, title: "محطات البرمجة الفردية", desc: "أجهزة مخصصة لبرمجة الخوارزميات وتدريب نماذج الرؤية الحاسوبية." },
          { x: 50, y: 75, title: "مختبر الطابعات ثلاثية الأبعاد", desc: "تصنيع النماذج الأولية للأذرع الآلية والقطع الميكانيكية." },
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
        hotspots: [
          { x: 30, y: 40, title: "صوتيات عازلة للضوضاء", desc: "سماعات رأس فائقة الدقة مخصصة لاختبار الاستماع الرسمي الآيلتس." },
          { x: 60, y: 60, title: "أنظمة مراقبة مشفرة", desc: "مجهزة بكاميرات وبنية تحتية موثقة وفق ضوابط بريطانيا وأمريكا." },
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
        hotspots: [
          { x: 45, y: 50, title: "أرضيات مطاطية ماصة للصدمات", desc: "حماية تامة للمفاصل وفق أعلى معايير السلامة الرياضية." },
          { x: 75, y: 35, title: "مدرجات جماهيرية", desc: "لاستضافة بطولات دوري المدارس والفعاليات الرياضية." },
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
        hotspots: [
          { x: 30, y: 55, title: "مجاهر رقمية متصلة بالشاشات", desc: "عرض الخلايا والشرائح بدقة عالية لكامل الفصل الدراسي." },
          { x: 70, y: 40, title: "محطات أمان وتطهير هوائي", desc: "دواليب شفط آمنة لإجراء التجارب الكيميائية دون أي انبعاثات." },
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
        hotspots: [
          { x: 35, y: 50, title: "أركان منتسوري التعليمية", desc: "وسائل حسية لتطوير التفكير المنطقي والاعتماد على الذات." },
          { x: 65, y: 40, title: "ركن القراءة والمسرح", desc: "تنمية الخيال والمهارات اللغوية والطلاقة منذ الصغر." },
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
        hotspots: [
          { x: 50, y: 45, title: "شاشات عرض LED عملاقة", desc: "مخصصة للمؤتمرات الطلابية والعروض المرئية المباشرة." },
          { x: 25, y: 65, title: "منصة التقديم الإذاعي", desc: "صقل مهارات الإلقاء الجماهيري وبناء الثقة في التحدث أمام الجمهور." },
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
        hotspots: [
          { x: 40, y: 50, title: "منصة تدريب محادثة تفاعلية", desc: "برامج مدعومة بالذكاء الاصطناعي لتقييم النطق الصحيح والتفاعل الحي." },
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
        hotspots: [
          { x: 50, y: 40, title: "مظلات ذكية عاكسة للأشعة", desc: "درجة حرارة مريحة حتى في أوقات الظهيرة لسلامة الطالبات." },
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
        hotspots: [
          { x: 35, y: 55, title: "معرض الأعمال الفنية الدائم", desc: "عرض لوحات الطالبات الفائزة في مسابقات الخط والرسم بالمنطقة." },
        ],
      },
    ],
  };

  // Saudi Vision 2030 Neural Nodes
  const vision2030Nodes = [
    {
      title: "برنامج تنمية القدرات البشرية",
      badge: "الركيزة الأولى 🇸🇦",
      icon: GraduationCap,
      color: "from-emerald-500 to-teal-600",
      desc: "إعداد مواطن منافس عالمياً يمتلك المهارات الأساسية والمتقدمة، مع غرس القيم الأصيلة وتعزيز الانتماء الوطني والتميز الأكاديمي المستدام.",
      aqeeqImpact: "تأهيل 100% من الخريجين للمسارات الجامعية التنافسية وتقديم دبلومة كوجنيا الأمريكية إلى جانب المنهج الوطني المعتمد.",
      statNumber: "100%",
      statLabel: "جاهزية تنافسية",
    },
    {
      title: "الثورة الصناعية والذكاء الاصطناعي",
      badge: "الابتكار والتقنية 🤖",
      icon: Zap,
      color: "from-amber-500 to-orange-600",
      desc: "تمكين أجيال الغد من لغات المستقبل، الخوارزميات، الروبوتات، والميكاترونيكس لمواكبة متطلبات التحول الرقمي ومشاريع المملكة الكبرى مثل نيوم وذا لاين.",
      aqeeqImpact: "حصد المركز الخامس عالمياً في بطولة أولمبياد الروبوت WRO ومعامل متخصصة في بايثون والذكاء الاصطناعي من المرحلة الابتدائية.",
      statNumber: "الـ 5",
      statLabel: "عالمياً في WRO",
    },
    {
      title: "جودة الحياة والصحة الرياضية",
      badge: "مجتمع حيوي 🏊‍♂️",
      icon: Activity,
      color: "from-blue-500 to-cyan-600",
      desc: "بناء نمط حياة صحي ونشط من خلال منشآت رياضية أولمبية، وتفعيل دوري المدارس، واكتشاف المواهب الرياضية في سن مبكرة.",
      aqeeqImpact: "مسابح شبه أولمبية مغطاة FINA وصالات جمباز وملاعب كرة قدم مجهزة بأعلى معايير السلامة والتأهيل البدني المتكامل.",
      statNumber: "2",
      statLabel: "مسبح شبه أولمبي",
    },
    {
      title: "الاعتزاز بالهوية الإسلامية والوطنية",
      badge: "أصالة وجذور 🕋",
      icon: Compass,
      color: "from-emerald-600 to-green-800",
      desc: "تعزيز القيم الأخلاقية، والاعتزاز باللغة العربية، وحفظ القرآن الكريم في مهبط الوحي وطيبة الطيبة، ليكون الطالب سفيراً مشرفاً لوطنه.",
      aqeeqImpact: "برامج متخصصة في التلاوة والتجويد، والخطابة الفصيحة، ومشاريع خدمة مجتمع المدينة المنورة وزوار المسجد النبوي.",
      statNumber: "+30",
      statLabel: "عاماً من الغراس المبارك",
    },
  ];

  // Hall of Fame Alumni Profiles
  const alumniProfiles = [
    {
      name: "د. عبد الإله بن خالد الجهني",
      role: "استشاري جراحة دقيقة وباحث طبي",
      cohort: "دفعة 2008",
      achievement: "تخرج بامتياز مع مرتبة الشرف، حاصل على البورد ومبتكر في الأبحاث الجراحية المتقدمة",
      quote: "مدارس العقيق لم تكن مجرد فصول دراسية، بل البيئة التي غرست فيّ شغف الاكتشاف والإصرار على خدمة الناس.",
      badge: "خريج العقيق · فخر الوطن",
    },
    {
      name: "م. سارة بنت محمد الحربي",
      role: "مهندسة ذكاء اصطناعي ونظم ذاتية",
      cohort: "دفعة 2016",
      achievement: "تعمل حالياً في مشاريع الذكاء الاصطناعي الكبرى بنيوم، مثلت المملكة في مسابقات عالمية",
      quote: "معامل الروبوت وأساتذة العقيق هم أول من وضعني على مسار لغات البرمجة وشغف الذكاء الاصطناعي.",
      badge: "خريجة العقيق · ريادة رقمية",
    },
    {
      name: "فيصل بن عادل الأحمدي",
      role: "طالب هندسة بجامعة البترول KFUPM وبطل WRO",
      cohort: "دفعة 2022",
      achievement: "عضو الفريق الحاصل على المركز الخامس عالمياً في بطولة الروبوت، حاصل على 99% في القدرات",
      quote: "التحديات العالمية التي خضناها باسم العقيق منحتنا ثقة لا حدود لها للمنافسة مع أقوى جامعات العالم.",
      badge: "خريج العقيق · بطل عالمي",
    },
  ];

  // Live Bus Fleet Simulated Data
  const liveBuses = [
    { id: "BUS-01", route: "حي الرانوناء — ممشى الهجرة", driver: "أبو فهد", status: "نشط في المسار", capacity: "92% مقاعد مشغولة", camera: "مباشر 100%", ac: "مكيف 21°C" },
    { id: "BUS-02", route: "حي العزيزية — طريق السلام", driver: "أبو يوسف", status: "نشط في المسار", capacity: "88% مقاعد مشغولة", camera: "مباشر 100%", ac: "مكيف 20°C" },
    { id: "BUS-03", route: "حي باقدو — الخالدية", driver: "أبو ريان", status: "نشط في المسار", capacity: "85% مقاعد مشغولة", camera: "مباشر 100%", ac: "مكيف 21°C" },
    { id: "BUS-04", route: "المنطقة المركزية — طريق قباء", driver: "أبو خالد", status: "في محطة الوصول", capacity: "100% مقاعد مشغولة", camera: "مباشر 100%", ac: "مكيف 22°C" },
    { id: "BUS-05", route: "حي شوران — ممشى العباس", driver: "أبو سلطان", status: "نشط في المسار", capacity: "78% مقاعد مشغولة", camera: "مباشر 100%", ac: "مكيف 21°C" },
    { id: "BUS-06", route: "حي الدعيثة — الهجرة الغربي", driver: "أبو سعود", status: "نشط في المسار", capacity: "90% مقاعد مشغولة", camera: "مباشر 100%", ac: "مكيف 20°C" },
  ];

  const currentFacilities = campusFacilities[activeCampusTab];
  const activeFacility = currentFacilities[activeFacilityIndex] || currentFacilities[0];
  const activeEra = timelineEras[activeTimelineIndex] || timelineEras[0];
  const activeProdigy = prodigyStages[prodigyStage] || prodigyStages[0];

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
          className={`relative isolate overflow-hidden py-10 sm:py-16 transition-colors duration-700 ${
            atmosphere === "twilight"
              ? "bg-gradient-to-b from-[#03060a] via-[#060e18] to-[#04080e] text-white"
              : isNationalDay
              ? dark ? "snd-hero-dark" : "snd-hero-light"
              : ""
          }`}
        >
          {/* Subtle Ambient Glow that morphs with Atmosphere */}
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${
              atmosphere === "twilight"
                ? "bg-[radial-gradient(ellipse_at_top,rgba(0,180,120,0.18),transparent_60%)]"
                : "bg-[radial-gradient(circle_at_20%_25%,rgba(1,90,55,0.15),transparent_60%)]"
            }`}
          />

          {/* Floating Subtle Light Motes (Physics-simulated dust/star motes) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
            {[...Array(14)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.2, y: Math.random() * 400 }}
                animate={{
                  opacity: [0.15, 0.6, 0.15],
                  y: [Math.random() * 400, Math.random() * 100],
                }}
                transition={{
                  duration: 6 + (i % 5) * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
                style={{
                  left: `${(i * 7.3) % 96}%`,
                  top: `${(i * 9.1) % 90}%`,
                }}
                className={`absolute rounded-full pointer-events-none ${
                  atmosphere === "twilight"
                    ? "h-1.5 w-1.5 bg-[#f8ca14] shadow-[0_0_10px_#f8ca14]"
                    : "h-2 w-2 bg-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                }`}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
            {/* Top Atmospheric Control Bar with Layout ID Springs */}
            <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
              {/* National Day or Institutional Pill */}
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black backdrop-blur-md shadow-sm ${
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

              {/* Atmosphere Switcher & Sound Toggle with Liquid Morphing */}
              <div className="flex items-center gap-2">
                <div
                  className={`inline-flex items-center p-1 rounded-2xl border backdrop-blur-xl shadow-lg transition ${
                    dark ? "border-white/10 bg-black/60" : "border-slate-200 bg-white/80"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      triggerChime("sweep");
                      setAtmosphere("morning");
                    }}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition active:scale-95 ${
                      atmosphere === "morning"
                        ? "text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {atmosphere === "morning" && (
                      <motion.div
                        layoutId="atmosphereActiveBubble"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        className="absolute inset-0 rounded-xl bg-[#015a37] -z-10 shadow-lg"
                      />
                    )}
                    <Sun size={13} className="text-[#f8ca14]" />
                    <span className="hidden sm:inline">إشراقة الصباح ☀️</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerChime("sweep");
                      setAtmosphere("twilight");
                    }}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition active:scale-95 ${
                      atmosphere === "twilight"
                        ? "text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {atmosphere === "twilight" && (
                      <motion.div
                        layoutId="atmosphereActiveBubble"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-900 to-purple-900 -z-10 shadow-lg ring-1 ring-[#f8ca14]/40"
                      />
                    )}
                    <Moon size={13} className="text-[#f8ca14]" />
                    <span className="hidden sm:inline">سكون المساء 🌙</span>
                  </button>
                </div>

                {/* Sound FX Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    if (!soundEnabled) playTactileChime("click");
                  }}
                  title={soundEnabled ? "كتم المؤثرات التفاعلية" : "تفعيل المؤثرات الصوتية التفاعلية"}
                  className={`grid h-9 w-9 place-items-center rounded-2xl border transition active:scale-95 backdrop-blur-md ${
                    soundEnabled
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      : "border-white/10 bg-black/40 text-slate-500"
                  }`}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Right Column: Hero Content & CTAs (7 cols) */}
              <div className="lg:col-span-7 text-right">
                <VisualEditable
                  id="about-hero-title"
                  tag="text"
                  label="عنوان هيرو عن المدارس"
                  defaultText="مدارس العقيق الأهلية والدولية"
                  as="h1"
                  className={`text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.2] mb-6 transition-colors duration-500 ${
                    atmosphere === "twilight" || dark ? "text-white" : "text-[#0a192f]"
                  }`}
                />

                <VisualEditable
                  id="about-hero-desc"
                  tag="text"
                  label="وصف هيرو عن المدارس"
                  defaultText="صرح تعليمي رائد للبنين والبنات في طيبة الطيبة. نهتم بتأهيل جيل متميز بأخلاق إسلامية راسخة وعلوم عصرية متقدمة، يجمع بين أصالة القيم ومعايير الاعتماد الدولي."
                  as="p"
                  className={`text-base sm:text-lg font-medium leading-relaxed max-w-2xl mb-8 ${
                    atmosphere === "twilight" || dark ? "text-slate-300" : "text-slate-700"
                  }`}
                />

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 mb-10">
                  <Button
                    onClick={() => {
                      triggerChime("click");
                      navigate("/admissions");
                    }}
                    className={`rounded-2xl px-8 py-6 text-base font-black shadow-xl transition active:scale-95 ${
                      dark || atmosphere === "twilight"
                        ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black hover:opacity-95 shadow-[#f8ca14]/20"
                        : "bg-gradient-to-r from-[#015a37] to-[#027a4b] text-white hover:opacity-95 shadow-[#015a37]/25"
                    }`}
                  >
                    <span>القبول والتسجيل والرسوم</span>
                    <ArrowRight size={18} className="mr-2" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      triggerChime("click");
                      navigate("/accreditations");
                    }}
                    className={`rounded-2xl px-8 py-6 text-base font-black border transition active:scale-95 shadow-sm ${
                      dark || atmosphere === "twilight"
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
                    dark || atmosphere === "twilight"
                      ? "border-white/10 bg-white/[0.04]"
                      : "border-emerald-950/10 bg-white/80"
                  }`}
                >
                  <div>
                    <span className={`block text-xl sm:text-2xl font-black ${dark || atmosphere === "twilight" ? "text-[#f8ca14]" : "text-[#015a37]"}`}>منذ 1994</span>
                    <span className={`text-[11px] font-bold ${dark || atmosphere === "twilight" ? "text-slate-400" : "text-slate-600"}`}>+30 عاماً من الريادة</span>
                  </div>
                  <div>
                    <span className={`block text-xl sm:text-2xl font-black ${dark || atmosphere === "twilight" ? "text-[#5aba1c]" : "text-[#08467d]"}`}>مجمعين</span>
                    <span className={`text-[11px] font-bold ${dark || atmosphere === "twilight" ? "text-slate-400" : "text-slate-600"}`}>للبنين والبنات</span>
                  </div>
                  <div>
                    <span className={`block text-xl sm:text-2xl font-black ${dark || atmosphere === "twilight" ? "text-[#f8ca14]" : "text-[#c59b27]"}`}>Cognia</span>
                    <span className={`text-[11px] font-bold ${dark || atmosphere === "twilight" ? "text-slate-400" : "text-slate-600"}`}>اعتماد أمريكي</span>
                  </div>
                  <div>
                    <span className={`block text-xl sm:text-2xl font-black ${dark || atmosphere === "twilight" ? "text-[#5aba1c]" : "text-[#015a37]"}`}>KG - 12</span>
                    <span className={`text-[11px] font-bold ${dark || atmosphere === "twilight" ? "text-slate-400" : "text-slate-600"}`}>كافة المراحل</span>
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
                    dark || atmosphere === "twilight"
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
                      dark || atmosphere === "twilight"
                        ? "border-white/10 bg-black/60 text-slate-200"
                        : "border-emerald-950/10 bg-[#f4f7f4] text-slate-800"
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
      {/* ========================================================
          STAGE 0: Medina Spatial Telemetry HUD (نبض طيبة الطيبة)
      ======================================================== */}
      <section className={`border-b py-4 px-4 ${dark ? "bg-[#060a0f] border-white/10" : "bg-[#f8faf8] border-slate-200"}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* 3 Telemetry Pillars */}
            <div className="flex items-center gap-4 sm:gap-8 flex-wrap text-xs font-bold">
              {/* Distance to Haram with Sonar Waves */}
              <div className="flex items-center gap-2 group cursor-default">
                <div className="relative grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Navigation size={15} />
                  <span className="absolute -inset-1 rounded-xl border border-emerald-500/40 animate-ping pointer-events-none opacity-60" />
                </div>
                <div>
                  <span className={`block font-black ${dark ? "text-white" : "text-slate-900"}`}>7.2 كم عن المسجد النبوي</span>
                  <span className="text-[10px] text-slate-500">8 دقائق عبر طريق الهجرة</span>
                </div>
              </div>

              {/* Qibla Direction with Rotating Needle Animation */}
              <div className="flex items-center gap-2 group cursor-default">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/10 text-amber-500 overflow-hidden">
                  <motion.div
                    animate={{ rotate: [0, 180, 168] }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  >
                    <Compass size={16} />
                  </motion.div>
                </div>
                <div>
                  <span className={`block font-black ${dark ? "text-white" : "text-slate-900"}`}>اتجاه القبلة: 168° جنوباً</span>
                  <span className="text-[10px] text-slate-500">باتجاه الكعبة المشرفة</span>
                </div>
              </div>

              {/* Live Medina Weather Simulation */}
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Thermometer size={15} />
                </div>
                <div>
                  <span className={`block font-black ${dark ? "text-white" : "text-slate-900"}`}>طقس المدينة: 28°C معتدل</span>
                  <span className="text-[10px] text-slate-500">هواء طيبة الصباحي العليل</span>
                </div>
              </div>
            </div>

            {/* Live Bus Fleet Simulation Button */}
            <button
              type="button"
              onClick={() => {
                triggerChime("click");
                setBusRadarOpen(!busRadarOpen);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border transition active:scale-95 shadow-sm ${
                busRadarOpen
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  : dark
                  ? "border-white/15 bg-white/5 text-emerald-400 hover:bg-white/10"
                  : "border-emerald-700/20 bg-white text-emerald-700 hover:bg-slate-50"
              }`}
            >
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <Bus size={15} />
              <span>{busRadarOpen ? "إغلاق رادار الأسطول" : "رادار حافلات العقيق الذكية (مباشر) 🚌"}</span>
            </button>
          </div>

          {/* Expandable Live Bus Radar Drawer with Spatial Sweep */}
          <AnimatePresence>
            {busRadarOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="overflow-hidden mt-4 pt-4 border-t border-white/10"
              >
                <div className={`p-4 sm:p-6 rounded-2xl border ${dark ? "bg-black/80 border-emerald-500/20" : "bg-white border-slate-200"}`}>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h4 className={`text-sm font-black ${dark ? "text-white" : "text-slate-900"}`}>
                        مصفوفة تتبع الحافلات المدرسية الذكية في أحياء المدينة المنورة
                      </h4>
                      <p className="text-[11px] text-slate-500">حافلات مجهزة بكاميرات مراقبة متصلة، وتكييف هواء فائق، وإشراف تربوي كامل</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black text-emerald-500 border border-emerald-500/20">
                      ● جميع الحافلات متصلة بنظام GPS الحي
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {liveBuses.map((bus) => (
                      <motion.div
                        key={bus.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-3.5 rounded-xl border text-xs transition ${
                          dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5 font-black">
                          <span className="text-emerald-500">{bus.id}</span>
                          <span className="text-[11px] text-slate-400">السائق: {bus.driver}</span>
                        </div>
                        <p className={`font-bold mb-2 ${dark ? "text-slate-200" : "text-slate-800"}`}>{bus.route}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-white/5">
                          <span>{bus.ac}</span>
                          <span className="text-emerald-400 font-bold">{bus.camera}</span>
                          <span>{bus.capacity}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Quick Jump Anchor Bar */}
      <div className={`border-b py-3 px-4 ${dark ? "bg-black/60 border-white/10" : "bg-white/80 border-slate-200"}`}>
        <div className="container mx-auto max-w-6xl flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-xs font-bold">
          <a href="#prodigy-simulator" className={`px-3 py-1.5 rounded-xl border transition ${dark ? "border-white/10 text-slate-300 hover:text-white hover:bg-white/5" : "border-black/5 text-slate-700 hover:text-emerald-800 hover:bg-slate-100"}`}>
            رحلة الـ 15 عاماً 🎓
          </a>
          <a href="#campuses-section" className={`px-3 py-1.5 rounded-xl border transition ${dark ? "border-white/10 text-slate-300 hover:text-white hover:bg-white/5" : "border-black/5 text-slate-700 hover:text-emerald-800 hover:bg-slate-100"}`}>
            مستكشف المنشآت والنقاط 🏫
          </a>
          <a href="#timeline-section" className={`px-3 py-1.5 rounded-xl border transition ${dark ? "border-white/10 text-slate-300 hover:text-white hover:bg-white/5" : "border-black/5 text-slate-700 hover:text-emerald-800 hover:bg-slate-100"}`}>
            مسيرة 30 عاماً 📜
          </a>
          <a href="#vision2030-matrix" className={`px-3 py-1.5 rounded-xl border transition ${dark ? "border-white/10 text-slate-300 hover:text-white hover:bg-white/5" : "border-black/5 text-slate-700 hover:text-emerald-800 hover:bg-slate-100"}`}>
            مصفوفة رؤية 2030 🇸🇦
          </a>
          <a href="#hall-of-fame" className={`px-3 py-1.5 rounded-xl border transition ${dark ? "border-white/10 text-slate-300 hover:text-white hover:bg-white/5" : "border-black/5 text-slate-700 hover:text-emerald-800 hover:bg-slate-100"}`}>
            سماء نجوم الخريجين ⭐
          </a>
          <a href="#vip-tour-builder" className={`px-3 py-1.5 rounded-xl border transition ${dark ? "border-white/10 text-[#f8ca14] hover:text-white hover:bg-white/5" : "border-black/5 text-[#015a37] hover:text-emerald-800 hover:bg-slate-100"}`}>
            مصمم زيارة VIP 🎫
          </a>
        </div>
      </div>

      {/* ========================================================
          STAGE 1: The 15-Year Prodigy Journey Simulator (3D Spatial Card Flip)
      ======================================================== */}
      <section id="prodigy-simulator" className="py-20 container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"} mb-2`}>
            <Sparkles size={14} />
            <span>محاكي رحلة الطالب التفاعلي لـ 15 عاماً</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
            من غراس الطفولة المبكرة حتى مقاعد أرقى الجامعات 🎓
          </h2>
          <p className={`mt-3 text-sm sm:text-base ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
            اختر المرحلة العمرية واكتشف كيف تُصقل شخصية ابنك وتتطور مهاراته عاماً بعد عام داخل صروح العقيق
          </p>

          {/* Interactive Stage Step Pills with Layout ID Morph */}
          <div
            className={`mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto p-2 rounded-2xl border shadow-sm transition ${
              dark ? "border-white/10 bg-[#0c141a]" : "border-slate-200/90 bg-white"
            }`}
          >
            {prodigyStages.map((stg, sIdx) => (
              <button
                key={stg.id}
                type="button"
                onClick={() => {
                  triggerChime("click");
                  setProdigyStage(sIdx);
                }}
                className={`relative p-3 rounded-xl text-center transition active:scale-95 ${
                  prodigyStage === sIdx
                    ? "text-white shadow-md"
                    : dark
                    ? "text-slate-400 hover:text-white hover:bg-white/5"
                    : "text-slate-700 hover:text-[#015a37] hover:bg-slate-50"
                }`}
              >
                {prodigyStage === sIdx && (
                  <motion.div
                    layoutId="prodigyActiveIndicator"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    className="absolute inset-0 rounded-xl bg-[#015a37] shadow-lg ring-1 ring-[#f8ca14]/40"
                  />
                )}
                <span className={`relative z-10 block text-xs font-black ${prodigyStage === sIdx ? "text-[#f8ca14]" : ""}`}>
                  {stg.ageRange}
                </span>
                <span className="relative z-10 text-[11px] font-bold truncate block mt-0.5">{stg.stageTitle.split(" ")[1] || stg.stageTitle}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3D Spatial Flip Showcase Card */}
        <div style={{ perspective: 1200 }} className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={prodigyStage}
              initial={{ rotateY: 90, opacity: 0, scale: 0.95 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              exit={{ rotateY: -90, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className={`rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl relative overflow-hidden transition duration-500 ${
                dark ? "border-emerald-500/25 bg-[#0c1218]/95" : "border-emerald-700/20 bg-white/95"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Story & Skills Radar Column */}
                <div className="lg:col-span-7">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {activeProdigy.milestoneBadge} ✦
                    </span>
                    <span className={`text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"}`}>
                      الفئة العمرية: {activeProdigy.ageRange}
                    </span>
                  </div>

                  <h3 className={`text-2xl sm:text-3xl font-black mb-3 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                    {activeProdigy.stageTitle}
                  </h3>
                  <p className="text-xs font-black text-emerald-500 mb-4">{activeProdigy.kicker}</p>

                  <div
                    className={`p-4 rounded-2xl border mb-6 text-xs font-bold leading-relaxed ${
                      dark ? "border-white/10 bg-white/[0.03] text-emerald-300" : "border-emerald-950/10 bg-emerald-50/60 text-[#015a37]"
                    }`}
                  >
                    <span className="text-base font-serif ml-1">❝</span>
                    {activeProdigy.quote}
                    <span className="text-base font-serif mr-1">❞</span>
                  </div>

                  {/* Acquired Skills Bars with Spring Fill */}
                  <div className="space-y-3 mb-6">
                    <h5 className={`text-xs font-black ${dark ? "text-slate-300" : "text-slate-800"}`}>
                      المكتسبات والمهارات التنافسية للطالب:
                    </h5>
                    {activeProdigy.skills.map((sk, skIdx) => (
                      <div key={skIdx} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className={dark ? "text-slate-300" : "text-slate-700"}>{sk.name}</span>
                          <span className="text-emerald-500 font-black">{sk.pct}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${sk.pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#f8ca14]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Competitions Badges */}
                  <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-white/10">
                    <span className="text-[11px] font-black text-slate-400">أبرز المحافل والبطولات:</span>
                    {activeProdigy.competitions.map((cp, cpIdx) => (
                      <span
                        key={cpIdx}
                        className={`px-3 py-1 rounded-xl text-[11px] font-black border ${
                          dark ? "border-white/10 bg-white/5 text-slate-200" : "border-slate-200 bg-slate-100 text-slate-800"
                        }`}
                      >
                        🏆 {cp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Visual Avatar Card */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3]">
                    <img
                      src={activeProdigy.avatarImage}
                      alt={activeProdigy.stageTitle}
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                    <div className="absolute bottom-4 right-4 left-4 text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={16} className="text-[#f8ca14]" />
                        <span className="text-xs font-black text-[#f8ca14]">{activeProdigy.milestoneBadge}</span>
                      </div>
                      <p className="text-[11px] text-slate-200">{activeProdigy.stageTitle} · مدارس العقيق</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ========================================================
          STAGE 2: Spatial Facility Deep-Dive with Interactive Hotspots
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
              استكشف منشآت العقيق ونقاط التميز المكانية 🏫
            </h2>
            <p className={`text-xs sm:text-sm mt-2 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
              اضغط على أي مرفق، ثم المس النقاط النابضة على الصورة لاستكشاف المواصفات الهندسية والأكاديمية الدقيقة
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
                  triggerChime("click");
                  setActiveCampusTab("boys");
                  setActiveFacilityIndex(0);
                  setActiveHotspotIndex(null);
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
                    layoutId="activeCampusPill"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    className="absolute inset-0 rounded-xl bg-[#015a37] shadow-lg ring-1 ring-[#f8ca14]/30"
                  />
                )}
                <span className="relative z-10">مجمع البنين (الأهلي والدولي) 🎓</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerChime("click");
                  setActiveCampusTab("girls");
                  setActiveFacilityIndex(0);
                  setActiveHotspotIndex(null);
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
                    layoutId="activeCampusPill"
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
                onClick={() => {
                  triggerChime("click");
                  setActiveFacilityIndex(fIdx);
                  setActiveHotspotIndex(null);
                }}
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

          {/* Active Facility Spotlight Showcase Card */}
          <div
            className={`max-w-5xl mx-auto rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl transition duration-500 ${
              dark ? "border-emerald-500/25 bg-[#0c1218]/90" : "border-emerald-700/20 bg-white/95"
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
                      className={`p-3 rounded-xl border transition ${
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
                    onClick={() => {
                      triggerChime("click");
                      navigate("/admissions");
                    }}
                    variant="outline"
                    className="rounded-2xl text-xs font-black"
                  >
                    حجز جولة تعريفية في المرفق ✦
                  </Button>
                </div>
              </div>

              {/* Photo Column with Interactive Hotspots & Zoom Effect */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3] group">
                  <motion.img
                    animate={{ scale: activeHotspotIndex !== null ? 1.08 : 1.0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    src={activeFacility.image}
                    alt={activeFacility.name}
                    className="h-full w-full object-cover transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Interactive Hotspot Pins Over Image */}
                  {activeFacility.hotspots?.map((hp, hIdx) => (
                    <div
                      key={hIdx}
                      style={{ left: `${hp.x}%`, top: `${hp.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          triggerChime("click");
                          setActiveHotspotIndex(activeHotspotIndex === hIdx ? null : hIdx);
                        }}
                        className={`group/btn relative flex items-center justify-center h-8 w-8 rounded-full border shadow-xl transition-transform active:scale-90 ${
                          activeHotspotIndex === hIdx
                            ? "bg-[#f8ca14] text-black border-white scale-110 ring-4 ring-[#f8ca14]/40"
                            : "bg-black/80 text-white border-white/40 hover:scale-110"
                        }`}
                      >
                        <span className="text-[10px] font-black">✦</span>
                        <motion.span
                          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute -inset-1 rounded-full bg-emerald-400 pointer-events-none"
                        />
                      </button>

                      {/* Floating Hotspot Tooltip/Popover with Spring Expansion */}
                      {activeHotspotIndex === hIdx && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 22 }}
                          className="absolute right-0 bottom-full mb-3 w-60 rounded-2xl border border-emerald-500/40 bg-black/95 p-3.5 text-white shadow-2xl backdrop-blur-xl z-30 pointer-events-auto"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-black text-[#f8ca14]">{hp.title}</span>
                            <button
                              type="button"
                              onClick={() => setActiveHotspotIndex(null)}
                              className="text-slate-400 hover:text-white text-xs px-1"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{hp.desc}</p>
                        </motion.div>
                      )}
                    </div>
                  ))}

                  <div className="absolute bottom-4 right-4 left-4 text-white">
                    <span className="text-xs font-black text-[#f8ca14]">{activeFacility.name}</span>
                    <p className="text-[11px] text-slate-300">{activeFacility.tag} · انقر على النقاط لاستكشاف التفاصيل</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          STAGE 3: The 30-Year Legacy Time Machine (1994 - 2026)
      ======================================================== */}
      <section id="timeline-section" className="py-20 container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"} mb-2`}>
            <Sparkles size={14} />
            <span>ثلاثة عقود من العطاء التربوي بطيبة الطيبة</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
            مسيرة العقيق المضيئة عبر الزمن (1994 - 2026) 📜
          </h2>
          <p className={`mt-3 text-sm sm:text-base ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
            رحلة تربوية رائدة خطت خطواتها الأولى في المدينة المنورة قبل أكثر من 30 عاماً لتغدو اليوم منارة تعليمية بمعايير عالمية.
          </p>

          {/* Interactive Era Buttons with LayoutId Morphing */}
          <div
            className={`mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto p-1.5 rounded-2xl border shadow-sm transition ${
              dark ? "border-white/10 bg-[#0c141a]" : "border-slate-200/90 bg-white"
            }`}
          >
            {timelineEras.map((era, eraIdx) => (
              <button
                key={era.shortYear}
                type="button"
                onClick={() => {
                  triggerChime("click");
                  setActiveTimelineIndex(eraIdx);
                }}
                className={`relative p-3 rounded-xl text-center transition active:scale-95 ${
                  activeTimelineIndex === eraIdx
                    ? "text-white shadow-md"
                    : dark
                    ? "text-slate-400 hover:text-white hover:bg-white/5"
                    : "text-slate-700 hover:text-[#015a37] hover:bg-slate-50"
                }`}
              >
                {activeTimelineIndex === eraIdx && (
                  <motion.div
                    layoutId="timelineActiveIndicator"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    className="absolute inset-0 rounded-xl bg-[#015a37] shadow-lg ring-1 ring-[#f8ca14]/40"
                  />
                )}
                <span className={`relative z-10 block text-base font-black ${activeTimelineIndex === eraIdx ? "text-[#f8ca14]" : ""}`}>
                  {era.shortYear}
                </span>
                <span className="relative z-10 text-[11px] font-bold truncate block">{era.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Active Timeline Era Card with Parallax Depth Transition */}
        <div style={{ perspective: 1200 }} className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTimelineIndex}
              initial={{ opacity: 0, scale: 0.94, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -25 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              className={`rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl relative overflow-hidden transition duration-500 ${
                dark ? "border-emerald-500/20 bg-[#0c1218]/90" : "border-emerald-700/20 bg-white/95"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Story & Details Column */}
                <div className="lg:col-span-7">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                      محطة تاريخية بارزة ✦
                    </span>
                    <span className={`text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"}`}>
                      {activeEra.year}
                    </span>
                  </div>

                  <h3 className={`text-2xl sm:text-3xl font-black mb-4 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                    {activeEra.title}
                  </h3>

                  <p className={`text-sm sm:text-base leading-relaxed mb-6 ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                    {activeEra.desc}
                  </p>

                  {/* Quote Ribbon */}
                  <div
                    className={`p-4 rounded-2xl border mb-6 text-xs font-bold leading-relaxed ${
                      dark ? "border-white/10 bg-white/[0.03] text-emerald-300" : "border-emerald-950/10 bg-emerald-50/60 text-[#015a37]"
                    }`}
                  >
                    <span className="text-base font-serif ml-1">❝</span>
                    {activeEra.quote}
                    <span className="text-base font-serif mr-1">❞</span>
                  </div>

                  {/* Key Metrics Row */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {activeEra.metrics.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className={`p-3 rounded-xl border text-center ${
                          dark ? "border-white/5 bg-black/40" : "border-black/5 bg-slate-50"
                        }`}
                      >
                        <span className="block text-[10px] text-slate-500 font-bold">{m.label}</span>
                        <span className={`text-xs font-black mt-1 block truncate ${dark ? "text-white" : "text-[#0a192f]"}`}>{m.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Controls between Eras */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <button
                      type="button"
                      disabled={activeTimelineIndex === 0}
                      onClick={() => {
                        triggerChime("click");
                        setActiveTimelineIndex((idx) => Math.max(0, idx - 1));
                      }}
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
                      onClick={() => {
                        triggerChime("click");
                        setActiveTimelineIndex((idx) => Math.min(timelineEras.length - 1, idx + 1));
                      }}
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

                {/* Photo & Milestone Visual Column */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3]">
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
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ========================================================
          STAGE 4: Saudi Vision 2030 Interactive Neural Matrix
      ======================================================== */}
      <section id="vision2030-matrix" className={`py-20 border-y ${dark ? "border-white/10 bg-[#05090e]" : "border-emerald-950/10 bg-[#f4f8f4]"}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-black text-emerald-400 mb-3">
              <span>🇸🇦</span>
              <span>مصفوفة التوافق الاستراتيجي ورؤية المملكة 2030</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              كيف تسهم مدارس العقيق في مستهدفات رؤية 2030؟ 🎯
            </h2>
            <p className={`mt-3 text-xs sm:text-sm ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
              اضغط على أي ركيزة وطنية لتشاهد كيف تترجمها مناهج ومنشآت العقيق إلى واقع يومي يعيشه الطالب
            </p>

            {/* Vision 2030 Node Selector Pills with LayoutId */}
            <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
              {vision2030Nodes.map((node, nIdx) => {
                const NodeIcon = node.icon;
                return (
                  <button
                    key={nIdx}
                    type="button"
                    onClick={() => {
                      triggerChime("click");
                      setActiveVisionNode(nIdx);
                    }}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border transition active:scale-95 ${
                      activeVisionNode === nIdx
                        ? "text-white border-emerald-400 shadow-md ring-2 ring-[#f8ca14]/40"
                        : dark
                        ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {activeVisionNode === nIdx && (
                      <motion.div
                        layoutId="visionActiveIndicator"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        className="absolute inset-0 rounded-xl bg-[#015a37] shadow-lg"
                      />
                    )}
                    <NodeIcon size={14} className={`relative z-10 ${activeVisionNode === nIdx ? "text-[#f8ca14]" : "text-emerald-500"}`} />
                    <span className="relative z-10">{node.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Vision 2030 Deep Plaque with Animated Pulse */}
          <div style={{ perspective: 1200 }} className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {(() => {
                const currNode = vision2030Nodes[activeVisionNode];
                const NodeIcon = currNode.icon;
                return (
                  <motion.div
                    key={activeVisionNode}
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    className={`rounded-[2.5rem] border p-8 sm:p-10 shadow-2xl relative overflow-hidden transition duration-500 ${
                      dark ? "border-emerald-500/30 bg-[#0a1218]" : "border-emerald-700/20 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                          <NodeIcon size={22} />
                        </div>
                        <div>
                          <span className="text-[11px] font-black text-[#f8ca14]">{currNode.badge}</span>
                          <h3 className={`text-xl sm:text-2xl font-black ${dark ? "text-white" : "text-slate-900"}`}>
                            {currNode.title}
                          </h3>
                        </div>
                      </div>

                      <div className="text-center px-4 py-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                        <span className="block text-xl font-black text-emerald-400">{currNode.statNumber}</span>
                        <span className="text-[10px] font-bold text-slate-400">{currNode.statLabel}</span>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm leading-relaxed mb-6">
                      <div>
                        <span className="font-black text-slate-400 block mb-1">🎯 الهدف الوطني في رؤية 2030:</span>
                        <p className={dark ? "text-slate-300" : "text-slate-700 font-medium"}>{currNode.desc}</p>
                      </div>
                      <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                        <span className="font-black text-emerald-500 block mb-1">✦ دور وتطبيق مدارس العقيق المباشر:</span>
                        <p className={dark ? "text-slate-200 font-bold" : "text-slate-800 font-bold"}>{currNode.aqeeqImpact}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ========================================================
          STAGE 5: Hall of Fame & Alumni Constellation (Zero-G Drift)
      ======================================================== */}
      <section id="hall-of-fame" className="py-20 container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className={`inline-flex items-center gap-2 text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"} mb-2`}>
            <Star size={14} />
            <span>سماء نجوم العقيق وقصص النجاح</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
            خريجون يقودون الحاضر ويصنعون المستقبل ⭐
          </h2>
          <p className={`text-xs sm:text-sm mt-2 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
            نماذج مشرفة تخرجت من صروح العقيق لتخدم الوطن في الطب، الهندسة، الذكاء الاصطناعي، والابتكار
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {alumniProfiles.map((alumni, aIdx) => (
            <motion.div
              key={aIdx}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4 + aIdx * 0.8, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.03, y: -10 }}
              className={`rounded-[2rem] border p-6 flex flex-col justify-between shadow-xl transition-all ${
                dark
                  ? "border-white/10 bg-[#0c1218] text-white shadow-black/60 hover:border-emerald-500/40"
                  : "border-emerald-950/10 bg-white text-slate-900 hover:border-emerald-700/40 shadow-emerald-950/5"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black text-emerald-500">
                    {alumni.cohort}
                  </span>
                  <span className="text-[10px] font-black text-[#f8ca14]">{alumni.badge}</span>
                </div>

                <h4 className="text-lg font-black mb-1">{alumni.name}</h4>
                <p className="text-xs font-bold text-emerald-500 mb-3">{alumni.role}</p>
                <p className={`text-xs leading-relaxed mb-4 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                  {alumni.achievement}
                </p>
              </div>

              <div
                className={`p-3 rounded-xl border text-[11px] leading-relaxed italic ${
                  dark ? "border-white/5 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                "{alumni.quote}"
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certified KPI Ribbon */}
        <div
          className={`mt-10 max-w-4xl mx-auto p-6 rounded-3xl border text-center grid grid-cols-1 sm:grid-cols-3 gap-4 ${
            dark ? "border-emerald-500/30 bg-[#091217]" : "border-emerald-700/20 bg-emerald-50/50"
          }`}
        >
          <div>
            <span className="block text-2xl sm:text-3xl font-black text-emerald-500">98.4%</span>
            <span className={`text-xs font-bold ${dark ? "text-slate-300" : "text-slate-700"}`}>متوسط نتائج القدرات والتحصيلي</span>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-black text-[#f8ca14]">100%</span>
            <span className={`text-xs font-bold ${dark ? "text-slate-300" : "text-slate-700"}`}>نسبة قبول الخريجين في الجامعات</span>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-black text-emerald-500">+10,000</span>
            <span className={`text-xs font-bold ${dark ? "text-slate-300" : "text-slate-700"}`}>خريج وخريجة خلال مسيرة 30 عاماً</span>
          </div>
        </div>
      </section>

      {/* ========================================================
          STAGE 6: VIP Custom Campus Tour Builder (Laser Scanner Effect)
      ======================================================== */}
      <section
        id="vip-tour-builder"
        className={`py-20 border-y ${
          dark ? "border-white/10 bg-[#060a0f]" : "border-emerald-950/10 bg-[#f7f9f7]"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-500 mb-2">
              <Sparkles size={14} />
              <span>خدمة أولياء الأمور المتميزة</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              صمم زيارة VIP الميدانية المخصصة لطفلك 🎫
            </h2>
            <p className={`text-xs sm:text-sm mt-2 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
              حدد اهتمامات ابنك وسنقوم ببناء بطاقة دعوة VIP رقمية ومسار جولة ميدانية يستعرض المرافق المناسبة له مباشرة
            </p>
          </div>

          <div
            className={`max-w-4xl mx-auto rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl ${
              dark ? "border-emerald-500/30 bg-[#0c1218]" : "border-emerald-700/20 bg-white"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Tour Configurator Controls */}
              <div>
                <h4 className={`text-sm font-black mb-3 ${dark ? "text-white" : "text-slate-900"}`}>
                  1. ما هو الشغف أو المسار الأهم بالنسبة لك؟
                </h4>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {[
                    { id: "robotics", label: "الذكاء الاصطناعي والروبوت 🤖" },
                    { id: "international", label: "اللغات والدبلومة الدولية 🌐" },
                    { id: "sports", label: "السباحة والألعاب الرياضية 🏊‍♂️" },
                    { id: "early", label: "تأسيس الطفولة المبكرة 🌸" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        triggerChime("laser");
                        setVipFocus(f.id);
                        setVipScanCount((c) => c + 1);
                      }}
                      className={`p-3 rounded-xl text-xs font-black border text-right transition active:scale-95 ${
                        vipFocus === f.id
                          ? "bg-[#015a37] text-white border-emerald-400 shadow-lg ring-1 ring-[#f8ca14]/40"
                          : dark
                          ? "border-white/10 bg-white/5 text-slate-300"
                          : "border-slate-200 bg-slate-50 text-slate-800"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <h4 className={`text-sm font-black mb-3 ${dark ? "text-white" : "text-slate-900"}`}>
                  2. المرحلة الدراسية المستهدفة:
                </h4>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {[
                    { id: "kg", label: "روضة وتمهيدي" },
                    { id: "primary", label: "المرحلة الابتدائية" },
                    { id: "intermediate", label: "المرحلة المتوسطة" },
                    { id: "secondary", label: "المرحلة الثانوية" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        triggerChime("laser");
                        setVipGrade(g.id);
                        setVipScanCount((c) => c + 1);
                      }}
                      className={`p-3 rounded-xl text-xs font-black border text-right transition active:scale-95 ${
                        vipGrade === g.id
                          ? "bg-[#015a37] text-white border-emerald-400 shadow-lg ring-1 ring-[#f8ca14]/40"
                          : dark
                          ? "border-white/10 bg-white/5 text-slate-300"
                          : "border-slate-200 bg-slate-50 text-slate-800"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated VIP Pass Visual Card with Animated Laser Scan Beam */}
              <div>
                <div
                  className={`rounded-3xl border p-6 relative overflow-hidden shadow-2xl ${
                    dark
                      ? "border-emerald-500/40 bg-gradient-to-br from-[#061410] via-[#091b15] to-[#040c09] text-white"
                      : "border-emerald-600/30 bg-gradient-to-br from-[#015a37] to-[#043d26] text-white shadow-emerald-950/20"
                  }`}
                >
                  {/* Laser Scan Beam Triggered on Change */}
                  <motion.div
                    key={vipScanCount}
                    initial={{ top: "-10%" }}
                    animate={{ top: "110%" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="pointer-events-none absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f8ca14] to-transparent shadow-[0_0_15px_#f8ca14] z-30"
                  />

                  {/* 45-degree Metallic Specular Sheen */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60" />

                  <div className="flex items-center justify-between mb-4 border-b border-white/15 pb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎫</span>
                      <div>
                        <h5 className="text-xs font-black">بطاقة زائر VIP رقمية</h5>
                        <span className="text-[10px] text-emerald-300">مدارس العقيق الأهلية والدولية</span>
                      </div>
                    </div>
                    <span className="rounded-xl bg-[#f8ca14] px-2.5 py-1 text-[10px] font-black text-black">
                      AQEEQ-VIP-2026
                    </span>
                  </div>

                  <div className="space-y-2 text-xs mb-6 relative z-10">
                    <div className="flex justify-between">
                      <span className="text-slate-300">المسار المختار:</span>
                      <span className="font-black text-[#f8ca14]">
                        {vipFocus === "robotics"
                          ? "الذكاء الاصطناعي والروبوت"
                          : vipFocus === "international"
                          ? "الدبلومة الدولية واللغات"
                          : vipFocus === "sports"
                          ? "الرياضة والسباحة الأولمبية"
                          : "تأسيس الطفولة المبكرة"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">المرحلة:</span>
                      <span className="font-black text-white">
                        {vipGrade === "kg"
                          ? "الروضة والتمهيدي"
                          : vipGrade === "primary"
                          ? "الابتدائية"
                          : vipGrade === "intermediate"
                          ? "المتوسطة"
                          : "الثانوية"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">الضيافة المشمولة:</span>
                      <span className="font-black text-emerald-300">لقاء المشرف الأكاديمي وجولة بالمرافق</span>
                    </div>
                  </div>

                  {/* Direct WhatsApp Tour Booking */}
                  <a
                    href={`https://wa.me/966531896000?text=${encodeURIComponent(
                      `السلام عليكم، أود تفعيل بطاقة زيارة VIP رقم [AQEEQ-VIP-2026] لمسار [${
                        vipFocus === "robotics"
                          ? "الذكاء الاصطناعي"
                          : vipFocus === "international"
                          ? "الدولي واللغات"
                          : vipFocus === "sports"
                          ? "الرياضة"
                          : "الطفولة المبكرة"
                      }] والمرحلة [${vipGrade}] والترتيب مع المشرف الأكاديمي.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="relative z-10 w-full flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 text-xs font-black shadow-lg transition active:scale-95"
                  >
                    <MessageCircle size={16} />
                    <span>تأكيد وتفعيل بطاقة الزيارة عبر واتساب 💚</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          STAGE 7: Medina Interactive Map & Campus Logistics
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

              {/* Transportation Coverage Chips with Interactive Feedback */}
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
                  dark ? "border-white/10 bg-white/5 text-emerald-400 hover:bg-white/10" : "border-emerald-700/20 bg-white text-emerald-700 hover:bg-slate-50"
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
                  <a href="tel:+966148131652" className="text-sm font-black hover:underline dir-ltr block text-right">0148131652</a>
                </div>

                <div className={`p-3.5 rounded-2xl border ${dark ? "border-white/5 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-emerald-600 dark:text-emerald-400">مجمع البنات والطفولة المبكرة</span>
                    <Phone size={14} className="text-slate-400" />
                  </div>
                  <a href="tel:+966148644466" className="text-sm font-black hover:underline dir-ltr block text-right">0148644466</a>
                </div>

                <div className={`p-3.5 rounded-2xl border ${dark ? "border-white/5 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-[#f8ca14]">الواتساب الموحد للقبول والتسجيل</span>
                    <MessageCircle size={14} className="text-emerald-500" />
                  </div>
                  <a href="tel:+966531896000" className="text-sm font-black hover:underline dir-ltr block text-right">0531896000</a>
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
                  dark ? "border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20" : "border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100"
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

      {/* Stage 8: Grand Interactive Finale & Action */}
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
