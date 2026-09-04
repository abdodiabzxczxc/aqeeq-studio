import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { Sparkles, GraduationCap, ChevronLeft, ArrowDown, Award, CheckCircle2, ShieldCheck, Compass } from "lucide-react";
import { VisualEditable } from "./VisualEditor";

export interface AdmissionsReelCard {
  id: string;
  stageNumber: string;
  title: string;
  subtitle: string;
  badge: string;
  fee: string;
  termFee: string;
  imageUrl: string;
  targetGrade: "kindergarten" | "primary" | "middle" | "high";
  track: "national" | "international";
  perks: string[];
}

interface AqeeqAdmissionsScrubReelProps {
  onSelectStage: (track: "national" | "international", grade: "kindergarten" | "primary" | "middle" | "high", gradeIndex: number) => void;
}

export function AqeeqAdmissionsScrubReel({ onSelectStage }: AqeeqAdmissionsScrubReelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";

  const [maxScrollDistance, setMaxScrollDistance] = useState(1400);

  const cards: AdmissionsReelCard[] = [
    {
      id: "kg",
      stageNumber: "01",
      title: "مرحلة رياض الأطفال (KG1 - KG3)",
      subtitle: "واحة الاكتشاف المبكر، تأسيس القرآن الكريم وأركان منتسوري المتطورة",
      badge: "التأسيس والاكتشاف",
      fee: "14,500 ر.س",
      termFee: "4,833 ر.س / فصلياً",
      imageUrl: "/covers/cover-admissions.jpg",
      targetGrade: "kindergarten",
      track: "national",
      perks: [
        "تأسيس لغوي وقرآني بمعايير متقدمة",
        "أركان منتسوري تفاعلية لتطوير الحواس",
        "رعاية نهارية متكاملة وبيئة تربوية آمنة",
      ],
    },
    {
      id: "primary",
      stageNumber: "02",
      title: "المرحلة الابتدائية (الصفوف 1 - 6)",
      subtitle: "أكاديمية البرمجة، الروبوت والذكاء الاصطناعي والتميز في اختبارات نافس",
      badge: "البناء الرقمي والمهارات",
      fee: "16,800 ر.س",
      termFee: "5,600 ر.س / فصلياً",
      imageUrl: "/covers/student-lab-admissions.jpg",
      targetGrade: "primary",
      track: "national",
      perks: [
        "معامل الذكاء الاصطناعي وأكاديمية الروبوت",
        "تأهيل مستمر لمسابقات نافس وموهبة",
        "مناهج إثرائية متقدمة ومتابعة عبر التطبيق",
      ],
    },
    {
      id: "middle",
      stageNumber: "03",
      title: "المرحلة المتوسطة (الصفوف 7 - 9)",
      subtitle: "مختبرات STEM التطبيقية، نوادي المناظرات وبناء الشخصية القيادية",
      badge: "الابتكار وبناء القدرات",
      fee: "18,900 ر.س",
      termFee: "6,300 ر.س / فصلياً",
      imageUrl: "/covers/student-robotics-accreditations.jpg",
      targetGrade: "middle",
      track: "national",
      perks: [
        "مختبرات STEM تطبيقية ومشاريع متقدمة",
        "نوادي المناظرات والقيادة الطلابية",
        "إعداد مبكر لاختبارات قياس والقدرات",
      ],
    },
    {
      id: "high",
      stageNumber: "04",
      title: "المرحلة الثانوية (الصفوف 10 - 12)",
      subtitle: "تأهيل استثنائي لاختبارات القدرات والتحصيلي 90+ والقبول بالجامعات المرموقة",
      badge: "التميز والقبول الجامعي",
      fee: "21,500 ر.س",
      termFee: "7,167 ر.س / فصلياً",
      imageUrl: "/covers/student-excellence-about.jpg",
      targetGrade: "high",
      track: "national",
      perks: [
        "برامج تدريب مكثفة للقدرات والتحصيلي 90+",
        "إرشاد أكاديمي متكامل لكبرى الجامعات",
        "مراكز اختبارات دولية معتمدة داخل الحرم",
      ],
    },
    {
      id: "international",
      stageNumber: "05",
      title: "المسار الدولي (American Diploma)",
      subtitle: "اعتماد كوجنيا الأمريكي Cognia USA، بيئة إنجليزية كاملة ومراكز SAT و IELTS",
      badge: "Cognia USA Accredited",
      fee: "22,000 ر.س",
      termFee: "7,333 ر.س / فصلياً",
      imageUrl: "/articles/is-quality-important-school-accreditation.jpg",
      targetGrade: "primary",
      track: "international",
      perks: [
        "American Common Core Standards",
        "مركز رسمي لاختبارات SAT و ACT و IELTS",
        "مناهج متقدمة تؤهل للجامعات العالمية",
      ],
    },
    {
      id: "campus-life",
      stageNumber: "06",
      title: "أكاديميات العقيق والمسبح الأولمبي",
      subtitle: "مسبح نصف أولمبي، صالات رياضية مغطاة، وأكاديميات الفنون والروبوت المعتمدة",
      badge: "المرافق ورعاية الموهبة",
      fee: "شامل الأنشطة",
      termFee: "مرافق استثنائية متكاملة",
      imageUrl: "/covers/first-lego-champions.png",
      targetGrade: "primary",
      track: "national",
      perks: [
        "مسبح نصف أولمبي وصالات رياضية متطورة",
        "أكاديميات روبوت وفنون وبطولات سنوية",
        "بيئة تعليمية وتربوية آمنة ومحفزة",
      ],
    },
  ];

  // Measure physical scroll track width accurately
  useEffect(() => {
    const updateDistance = () => {
      if (trackRef.current) {
        const trackWidth = trackRef.current.scrollWidth;
        const windowWidth = window.innerWidth;
        const dist = Math.max(450, trackWidth - windowWidth + 180);
        setMaxScrollDistance(dist);
      }
    };
    updateDistance();
    window.addEventListener("resize", updateDistance);
    return () => window.removeEventListener("resize", updateDistance);
  }, [cards.length]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth 120fps spring scrub mapped to track distance
  const rawX = useTransform(scrollYProgress, [0.02, 0.98], [0, maxScrollDistance]);
  const smoothX = useSpring(rawX, { stiffness: 85, damping: 24, mass: 0.45 });

  // Progress percentage (0 to 100)
  const progressPercent = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Calculate active scene index from scroll
  const [activeScene, setActiveScene] = useState(1);
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      const idx = Math.min(cards.length, Math.max(1, Math.round(latest * (cards.length - 1)) + 1));
      setActiveScene(idx);
    });
  }, [scrollYProgress, cards.length]);

  const handleCardClick = (card: AdmissionsReelCard, index: number) => {
    const gradeIdx = card.targetGrade === "kindergarten" ? 0 : card.targetGrade === "primary" ? 1 : card.targetGrade === "middle" ? 2 : 3;
    onSelectStage(card.track, card.targetGrade, gradeIdx);
  };

  return (
    <section
      ref={containerRef}
      id="admissions-cinema-reel"
      className={`relative h-[260vh] w-full transition-colors duration-500 overflow-visible ${
        isNationalDay
          ? dark ? "bg-[#010905]" : "bg-[#f5fbf7]"
          : dark ? "bg-[#05080c]" : "bg-[#f8fafc]"
      }`}
    >
      {/* Sticky Fullscreen Cinema Stage */}
      <div className="sticky top-0 flex h-screen w-full flex-col justify-between overflow-hidden py-6 sm:py-10">
        
        {/* Cinema Stage Header */}
        <div className="mx-auto w-full max-w-[1380px] px-5 md:px-8 z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="text-right">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[10px] font-black tracking-widest uppercase mb-2 ${
                isNationalDay
                  ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : dark
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-[#015a37]/20 bg-[#015a37]/10 text-[#015a37]"
              }`}
            >
              <Compass size={12} />
              <span>ADMISSIONS HORIZONTAL REEL · أروقة المسارات ومراحل التعليم</span>
            </div>
            
            <VisualEditable
              id="admissions-scrub-title"
              tag="text"
              label="عنوان شريط مسارات القبول السينمائي"
              defaultText="خارطة المراحل والمسارات الدراسية 🎓"
              as="h2"
              className={`text-2xl sm:text-4xl lg:text-5xl font-black font-cairo ${dark ? "text-white" : "text-[#0a192f]"}`}
            />
            
            {/* Glowing Golden Accent Line */}
            <motion.div
              initial={{ width: 0, opacity: 0.3 }}
              whileInView={{ width: 190, opacity: 1 }}
              viewport={{ once: false, margin: "-20px" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className={`h-1 sm:h-[3.5px] rounded-full my-2.5 ${
                dark
                  ? "bg-gradient-to-l from-[#f8ca14] via-[#f8ca14]/80 to-transparent shadow-[0_0_15px_rgba(248,202,20,0.6)]"
                  : "bg-gradient-to-l from-[#015a37] via-[#015a37]/80 to-transparent shadow-[0_0_12px_rgba(1,90,55,0.4)]"
              }`}
            />
            
            <VisualEditable
              id="admissions-scrub-desc"
              tag="text"
              label="وصف شريط مسارات القبول السينمائي"
              defaultText="حرّك السكرول لاستكشاف تفاصيل كل مرحلة، المخرجات التعليمية، والرسوم السنوية لكل صف."
              as="p"
              className={`mt-1 text-xs sm:text-sm ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}
            />
          </div>

          {/* Controls & Active Scene Badge */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-mono font-black ${
              dark ? "border-white/10 bg-white/5 text-amber-400" : "border-emerald-950/10 bg-white text-[#015a37] shadow-sm"
            }`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>المرحلة {String(activeScene).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}</span>
            </div>

            <div className={`hidden md:flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-[11px] font-bold ${
              dark ? "border-white/10 bg-white/5 text-slate-400" : "border-black/10 bg-slate-100 text-slate-600"
            }`}>
              <span>مرّر بالسكرول للتنقل الأفقي</span>
              <span className="text-amber-400">✦</span>
            </div>
          </div>
        </div>

        {/* 3D Cinema Curved Track Container */}
        <div
          className="relative w-full overflow-visible my-auto"
          style={{ perspective: "1400px" }}
        >
          <motion.div
            ref={trackRef}
            style={{ x: smoothX, transformStyle: "preserve-3d" }}
            className="flex items-center gap-6 sm:gap-8 px-6 sm:px-12 w-max will-change-transform"
          >
            {cards.map((card, index) => {
              const isActive = activeScene === index + 1;
              return (
                <motion.div
                  key={card.id + "-" + index}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardClick(card, index)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCardClick(card, index)}
                  whileHover={{ y: -10, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`group relative h-[430px] sm:h-[490px] w-[300px] sm:w-[370px] shrink-0 cursor-pointer overflow-hidden rounded-[2.5rem] border transition-all duration-500 shadow-2xl ${
                    isActive
                      ? dark
                        ? "border-[#f8ca14]/50 shadow-[0_25px_60px_rgba(248,202,20,0.25)] ring-1 ring-[#f8ca14]/30"
                        : "border-[#015a37]/50 shadow-[0_25px_60px_rgba(1,90,55,0.25)] ring-1 ring-[#015a37]/30"
                      : isNationalDay
                      ? dark
                        ? "border-[#f8ca14]/30 bg-[#001f13] shadow-[0_25px_60px_rgba(0,90,54,0.4)]"
                        : "border-emerald-500/20 bg-white shadow-[0_25px_60px_rgba(0,90,54,0.15)]"
                      : dark
                      ? "border-white/15 bg-gradient-to-b from-[#11131c] via-[#090b10] to-[#040508] shadow-[0_30px_70px_rgba(0,0,0,0.85)] hover:border-emerald-500/50"
                      : "border-slate-200 bg-white shadow-[0_25px_60px_rgba(1,90,55,0.1)] hover:border-[#015a37]/50"
                  }`}
                >
                  {/* Visual Background */}
                  <div className="relative h-full w-full overflow-hidden">
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />

                    {/* Dark Cinematic Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/25" />

                    {/* Top Badges */}
                    <div className="absolute top-5 inset-x-5 z-10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 rounded-full bg-black/75 border border-white/20 px-3 py-1 text-[11px] font-black text-[#f8ca14] backdrop-blur-md shadow-md">
                        <Sparkles size={12} />
                        <span>{card.badge}</span>
                      </div>
                      <span className="rounded-full bg-black/60 border border-white/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-slate-300">
                        PATHWAY // {card.stageNumber}
                      </span>
                    </div>

                    {/* Bottom Card Content */}
                    <div className="absolute bottom-0 inset-x-0 p-6 text-right z-10">
                      {/* Pricing Tag */}
                      <div className="inline-flex items-baseline gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-white backdrop-blur-md mb-2.5 shadow-sm">
                        <span className="text-sm sm:text-base font-black text-[#f8ca14]">{card.fee}</span>
                        <span className="text-[10px] text-emerald-200">({card.termFee})</span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-white leading-snug font-cairo mb-1.5 drop-shadow-md">
                        {card.title}
                      </h3>
                      
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-3 font-medium">
                        {card.subtitle}
                      </p>

                      {/* Mini Perks */}
                      <div className="space-y-1 mb-4">
                        {card.perks.slice(0, 2).map((perk, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-bold">
                            <CheckCircle2 size={12} className="shrink-0" />
                            <span className="truncate">{perk}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between border-t border-white/15 pt-3">
                        <span className="text-xs font-black text-[#f8ca14] group-hover:underline inline-flex items-center gap-1">
                          <span>اختيار المرحلة وحساب الرسوم</span>
                          <ArrowDown size={14} className="transition-transform group-hover:translate-y-1" />
                        </span>
                        <span className="h-8 w-8 rounded-xl bg-white/10 border border-white/20 grid place-items-center text-white transition group-hover:bg-[#015a37] group-hover:border-emerald-400">
                          <ChevronLeft size={16} />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Bottom Film Progress Scrubber */}
        <div className="mx-auto w-full max-w-[1380px] px-5 md:px-8 z-10">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-mono font-bold text-slate-500">01</span>
            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${dark ? "bg-white/10" : "bg-black/10"}`}>
              <motion.div
                style={{ width: progressPercent }}
                className="h-full bg-gradient-to-r from-[#f8ca14] via-emerald-400 to-[#015a37] rounded-full"
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">{String(cards.length).padStart(2, "0")}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
