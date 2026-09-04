import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { Sparkles, GraduationCap, ChevronLeft, ArrowDown, Compass, Award } from "lucide-react";
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
  metaText?: string;
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

  const [maxScrollDistance, setMaxScrollDistance] = useState(1200);

  const cards: AdmissionsReelCard[] = [
    {
      id: "kg",
      stageNumber: "01",
      title: "مرحلة رياض الأطفال (KG1 - KG3)",
      subtitle: "واحة الاكتشاف وتأسيس القرآن واللغة وأركان منتسوري المتطورة",
      badge: "التأسيس والاكتشاف",
      fee: "14,500 ر.س / سنوياً",
      termFee: "القسط الفصلي: 4,833 ر.س",
      metaText: "المنهج الوطني + منتسوري ورعاية نهارية متكاملة",
      imageUrl: "/covers/cover-admissions.jpg",
      targetGrade: "kindergarten",
      track: "national",
    },
    {
      id: "primary",
      stageNumber: "02",
      title: "المرحلة الابتدائية (الصفوف 1 - 6)",
      subtitle: "أكاديمية البرمجة والروبوت والذكاء الاصطناعي والتميز في اختبارات نافس",
      badge: "البناء الرقمي والمهارات",
      fee: "16,800 ر.س / سنوياً",
      termFee: "القسط الفصلي: 5,600 ر.س",
      metaText: "معامل الذكاء الاصطناعي وأكاديمية الروبوت المتقدمة",
      imageUrl: "/covers/student-lab-admissions.jpg",
      targetGrade: "primary",
      track: "national",
    },
    {
      id: "middle",
      stageNumber: "03",
      title: "المرحلة المتوسطة (الصفوف 7 - 9)",
      subtitle: "مختبرات STEM التطبيقية، نوادي المناظرات وبناء الشخصية القيادية",
      badge: "الابتكار وبناء القدرات",
      fee: "18,900 ر.س / سنوياً",
      termFee: "القسط الفصلي: 6,300 ر.س",
      metaText: "إعداد مبكر للقدرات ومشاريع علمية متقدمة",
      imageUrl: "/covers/student-robotics-accreditations.jpg",
      targetGrade: "middle",
      track: "national",
    },
    {
      id: "high",
      stageNumber: "04",
      title: "المرحلة الثانوية (الصفوف 10 - 12)",
      subtitle: "تأهيل استثنائي لاختبارات القدرات والتحصيلي 90+ والقبول بالجامعات المرموقة",
      badge: "التميز والقبول الجامعي",
      fee: "21,500 ر.س / سنوياً",
      termFee: "القسط الفصلي: 7,167 ر.س",
      metaText: "برامج تدريب مكثفة ومراكز اختبارات دولية معتمدة",
      imageUrl: "/covers/student-excellence-about.jpg",
      targetGrade: "high",
      track: "national",
    },
    {
      id: "international",
      stageNumber: "05",
      title: "المسار الدولي (American Diploma)",
      subtitle: "اعتماد كوجنيا الأمريكي Cognia USA، بيئة إنجليزية كاملة ومراكز SAT و IELTS",
      badge: "Cognia USA Accredited",
      fee: "22,000 ر.س / سنوياً",
      termFee: "القسط الفصلي: 7,333 ر.س",
      metaText: "American Common Core + SAT & ACT & IELTS Testing Center",
      imageUrl: "/articles/is-quality-important-school-accreditation.jpg",
      targetGrade: "primary",
      track: "international",
    },
    {
      id: "campus-life",
      stageNumber: "06",
      title: "أكاديميات العقيق والمسبح الأولمبي",
      subtitle: "مسبح نصف أولمبي، صالات رياضية مغطاة، وأكاديميات الفنون والروبوت العالمية",
      badge: "المرافق ورعاية الموهبة",
      fee: "شامل الأنشطة الرياضية",
      termFee: "مرافق عالمية متكاملة",
      metaText: "بطولات رسمية، لياقة بدنية، وتطوير المهارات القيادية",
      imageUrl: "/covers/first-lego-champions.png",
      targetGrade: "primary",
      track: "national",
    },
  ];

  // Measure physical scroll track width accurately (Exact match with homepage)
  useEffect(() => {
    const updateDistance = () => {
      if (trackRef.current) {
        const trackWidth = trackRef.current.scrollWidth;
        const windowWidth = window.innerWidth;
        const dist = Math.max(400, trackWidth - windowWidth + 160);
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

  // Smooth 120fps spring scrub mapped to track distance (Exact match with homepage)
  // In RTL Arabic, moving cards to the left means translating in positive X direction in RTL flow
  const rawX = useTransform(scrollYProgress, [0.02, 0.98], [0, maxScrollDistance]);
  const smoothX = useSpring(rawX, { stiffness: 90, damping: 24, mass: 0.4 });

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

  const handleCardClick = (card: AdmissionsReelCard) => {
    const gradeIdx = card.targetGrade === "kindergarten" ? 0 : card.targetGrade === "primary" ? 1 : card.targetGrade === "middle" ? 2 : 3;
    onSelectStage(card.track, card.targetGrade, gradeIdx);
  };

  return (
    <section
      ref={containerRef}
      id="admissions-cinema-reel"
      className={`relative h-[250vh] w-full transition-colors duration-500 overflow-visible ${
        isNationalDay
          ? dark ? "bg-[#010905]" : "bg-[#f5fbf7]"
          : dark ? "bg-[#05070a]" : "bg-[#f8fafc]"
      }`}
    >
      {/* Sticky Fullscreen Cinema Stage */}
      <div className="sticky top-0 flex h-screen w-full flex-col justify-between overflow-hidden py-8 sm:py-12">
        
        {/* Cinema Stage Header */}
        <div className="mx-auto w-full max-w-[1380px] px-5 md:px-8 z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="text-right">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[10px] font-black tracking-widest uppercase mb-2 ${
                isNationalDay
                  ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              }`}
            >
              <Compass size={12} />
              <span>CINEMATIC ADMISSIONS REEL · أروقة المسارات ومراحل التعليم</span>
            </div>
            
            <VisualEditable
              id="admissions-scrub-title"
              tag="text"
              label="عنوان أروقة مسارات التعليم"
              defaultText="خارطة المراحل والمسارات الدراسية 🎓"
              as="h2"
              className={`text-2xl sm:text-4xl lg:text-5xl font-black font-cairo ${dark ? "text-white" : "text-black"}`}
            />
            
            {/* Glowing Golden Accent Line (يتمدد مع السكرول وينكمش عند الخروج) */}
            <motion.div
              initial={{ width: 0, opacity: 0.3 }}
              whileInView={{ width: 175, opacity: 1 }}
              viewport={{ once: false, margin: "-20px" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className={`h-1 sm:h-[3.5px] rounded-full my-3 ${
                dark
                  ? "bg-gradient-to-l from-[#f8ca14] via-[#f8ca14]/80 to-transparent shadow-[0_0_15px_rgba(248,202,20,0.6)]"
                  : "bg-gradient-to-l from-[#08467d] via-[#08467d]/80 to-transparent shadow-[0_0_12px_rgba(8,70,125,0.4)]"
              }`}
            />
            
            <VisualEditable
              id="admissions-scrub-desc"
              tag="text"
              label="وصف أروقة مسارات التعليم"
              defaultText="اسحب أو مرر بالماوس لاستكشاف تفاصيل كل مرحلة، المخرجات التعليمية، والرسوم السنوية لكل صف."
              as="p"
              className={`mt-1.5 text-xs sm:text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}
            />
          </div>

          {/* Reel Controls & Scene Counter */}
          <div className="flex items-center gap-4 self-end sm:self-auto">
            {/* Active Scene Badge */}
            <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-mono font-black ${
              dark ? "border-white/10 bg-white/5 text-amber-400" : "border-black/10 bg-slate-100 text-[#08467d]"
            }`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>المرحلة {String(activeScene).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}</span>
            </div>

            {/* Hint Badge */}
            <div className={`hidden md:flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-[11px] font-bold ${
              dark ? "border-white/10 bg-white/5 text-slate-400" : "border-black/10 bg-slate-100 text-slate-600"
            }`}>
              <span>سكرول عمودي للتنقل الأفقي</span>
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
            {cards.map((card, index) => (
              <motion.div
                key={card.id + "-" + index}
                role="button"
                tabIndex={0}
                onClick={() => handleCardClick(card)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCardClick(card)}
                whileHover={{ y: -12, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`group relative h-[420px] sm:h-[480px] w-[290px] sm:w-[360px] shrink-0 cursor-pointer overflow-hidden rounded-[2.5rem] border transition-all duration-500 shadow-2xl ${
                  isNationalDay
                    ? dark
                      ? "border-[#f8ca14]/30 bg-[#001f13] shadow-[0_25px_60px_rgba(0,90,54,0.4)]"
                      : "border-emerald-500/20 bg-white shadow-[0_25px_60px_rgba(0,90,54,0.15)]"
                    : dark
                    ? "border-white/15 bg-gradient-to-b from-[#11131c] via-[#090b10] to-[#040508] shadow-[0_30px_70px_rgba(0,0,0,0.85)] hover:border-[#f8ca14]/50"
                    : "border-slate-200 bg-white shadow-[0_25px_60px_rgba(8,70,125,0.1)] hover:border-[#08467d]/50"
                }`}
              >
                {/* Full Cover Visual */}
                <div className="relative h-full w-full overflow-hidden">
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />

                  {/* Dark Cinematic Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

                  {/* Top Film Reel Badge */}
                  <div className="absolute top-5 inset-x-5 z-10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 rounded-full bg-black/70 border border-white/20 px-3.5 py-1 text-[11px] font-black text-[#f8ca14] backdrop-blur-md shadow-md">
                      <GraduationCap size={13} />
                      <span>{card.badge}</span>
                    </div>
                    <span className="rounded-full bg-black/60 border border-white/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-slate-400">
                      STAGE // {card.stageNumber}
                    </span>
                  </div>

                  {/* Bottom Card Content */}
                  <div className="absolute bottom-0 inset-x-0 p-6 text-right z-10">
                    {/* Tuition & Term Badge */}
                    <div className="inline-flex items-center gap-2 mb-2">
                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
                        {card.fee}
                      </span>
                      <span className="text-[10px] text-slate-300 font-bold">
                        {card.termFee}
                      </span>
                    </div>

                    {card.metaText && (
                      <p className="text-[11px] font-bold text-amber-300/90 mb-1 tracking-wide line-clamp-1">{card.metaText}</p>
                    )}
                    
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-snug line-clamp-2 drop-shadow-md font-cairo">
                      {card.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-2 mt-1 mb-2 font-medium">
                      {card.subtitle}
                    </p>

                    {/* Action Bar */}
                    <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3.5">
                      <span className="text-xs font-black text-[#f8ca14] group-hover:underline inline-flex items-center gap-1.5">
                        <span>اختيار المرحلة وحساب الرسوم</span>
                        <ArrowDown size={14} className="transition-transform group-hover:translate-y-1" />
                      </span>
                      <span className="h-9 w-9 rounded-2xl bg-white/10 border border-white/20 grid place-items-center text-white transition group-hover:bg-[#f8ca14] group-hover:text-black group-hover:border-[#f8ca14]">
                        <ChevronLeft size={18} />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Film Progress Scrubber */}
        <div className="mx-auto w-full max-w-[1380px] px-5 md:px-8 z-10">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-mono font-bold text-slate-500">01</span>
            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${dark ? "bg-white/10" : "bg-black/10"}`}>
              <motion.div
                style={{ width: progressPercent }}
                className="h-full bg-gradient-to-r from-[#f8ca14] via-emerald-400 to-[#08467d] rounded-full"
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">{String(cards.length).padStart(2, "0")}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
