import React, { useState, useEffect, useRef } from "react";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { AqeeqLuxuryPageShell } from "@/components/AqeeqLuxuryPageShell";
import { AqeeqGrandFinaleCta } from "@/components/AqeeqGrandFinaleCta";
import { AqeeqScrollRevealSection } from "@/components/AqeeqScrollRevealSection";
import { AqeeqTypographicScrubBar } from "@/components/AqeeqTypographicScrubBar";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { AlaqeeqStudioSiteFooter } from "@/components/AlaqeeqStudioSiteFooter";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Globe2,
  BookOpenCheck,
  Trophy,
  Compass,
  Send,
  Calendar,
  Clock,
  ChevronDown,
  GraduationCap,
  Building2,
  HelpCircle,
  Zap,
  CheckCheck,
  Phone,
  Radar,
  Target,
  Share2,
  Layers,
  Crosshair,
} from "lucide-react";

export default function AqeeqSchoolAccreditationsPage() {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [, navigate] = useLocation();

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Interactive Tab States
  const [activeHubTab, setActiveHubTab] = useState<"cognia" | "ielts" | "sat" | "stem">("cognia");
  const [activePathway, setActivePathway] = useState<"saudi" | "scholarship" | "global">("saudi");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive Parent Readiness Scanner State
  const [scannerGrade, setScannerGrade] = useState<"primary" | "middle" | "high">("high");
  const [scannerGoal, setScannerGoal] = useState<"stem" | "medicine" | "business">("stem");

  // ========================================================
  // 1. 3D Overlapping Credential Covers Fan-out on Scroll
  // ========================================================
  const { scrollY } = useScroll();
  const rawHeroFrontCardX = useTransform(scrollY, [0, 450], [0, -50]);
  const rawHeroFrontCardRotate = useTransform(scrollY, [0, 450], [0, -8]);
  const rawHeroBackCardX = useTransform(scrollY, [0, 450], [0, 50]);
  const rawHeroBackCardRotate = useTransform(scrollY, [0, 450], [0, 8]);
  const rawHeroMiddleCardY = useTransform(scrollY, [0, 450], [0, -32]);
  const rawHeroMiddleCardScale = useTransform(scrollY, [0, 450], [1, 1.08]);

  const heroFrontCardX = useSpring(rawHeroFrontCardX, { stiffness: 100, damping: 20 });
  const heroFrontCardRotate = useSpring(rawHeroFrontCardRotate, { stiffness: 100, damping: 20 });
  const heroBackCardX = useSpring(rawHeroBackCardX, { stiffness: 100, damping: 20 });
  const heroBackCardRotate = useSpring(rawHeroBackCardRotate, { stiffness: 100, damping: 20 });
  const heroMiddleCardY = useSpring(rawHeroMiddleCardY, { stiffness: 100, damping: 20 });
  const heroMiddleCardScale = useSpring(rawHeroMiddleCardScale, { stiffness: 100, damping: 20 });

  // 3D Mouse Perspective Tilt for Hero Cards
  const [heroMouse, setHeroMouse] = useState({ x: 0, y: 0 });
  const heroTiltX = useSpring(heroMouse.y, { stiffness: 120, damping: 18 });
  const heroTiltY = useSpring(heroMouse.x, { stiffness: 120, damping: 18 });

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setHeroMouse({ x, y });
  };
  const handleHeroMouseLeave = () => {
    setHeroMouse({ x: 0, y: 0 });
  };

  // ========================================================
  // 2. Hub 3D Perspective Scrubbing for the Credential Terminal
  // ========================================================
  const hubSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: hubProgress } = useScroll({
    target: hubSectionRef,
    offset: ["start end", "end start"],
  });
  const rawPlaqueRotateX = useTransform(hubProgress, [0, 0.45, 0.9], [15, 0, -8]);
  const rawPlaqueRotateY = useTransform(hubProgress, [0, 0.45, 0.9], [-16, 0, 10]);
  const rawPlaqueScale = useTransform(hubProgress, [0, 0.45, 0.9], [0.93, 1, 0.96]);

  const plaqueRotateX = useSpring(rawPlaqueRotateX, { stiffness: 80, damping: 20 });
  const plaqueRotateY = useSpring(rawPlaqueRotateY, { stiffness: 80, damping: 20 });
  const plaqueScale = useSpring(rawPlaqueScale, { stiffness: 80, damping: 20 });

  // ========================================================
  // 3. Pathway Energy Beam Scroll Progress & Milestones Parallax
  // ========================================================
  const pipelineSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: pipelineProgress } = useScroll({
    target: pipelineSectionRef,
    offset: ["start end", "end start"],
  });
  const rawBeamHeight = useTransform(pipelineProgress, [0.1, 0.85], ["0%", "100%"]);
  const beamHeight = useSpring(rawBeamHeight, { stiffness: 100, damping: 24 });

  const rawStaggerCol1 = useTransform(pipelineProgress, [0, 1], [30, -30]);
  const rawStaggerCol2 = useTransform(pipelineProgress, [0, 1], [-25, 25]);
  const staggerCol1 = useSpring(rawStaggerCol1, { stiffness: 85, damping: 20 });
  const staggerCol2 = useSpring(rawStaggerCol2, { stiffness: 85, damping: 20 });

  // ========================================================
  // 4. Interactive 3D Holographic Radar Cockpit Scroll Physics
  // ========================================================
  const radarSectionRef = useRef<HTMLDivElement>(null);
  const [shockwaveKey, setShockwaveKey] = useState(0);
  const { scrollYProgress: radarProgress } = useScroll({
    target: radarSectionRef,
    offset: ["start end", "end start"],
  });
  const rawRadarRotateX = useTransform(radarProgress, [0, 0.45, 0.9], [22, 0, -12]);
  const rawRadarScale = useTransform(radarProgress, [0, 0.45, 0.9], [0.93, 1, 0.96]);
  const rawRadarRotateRing = useTransform(radarProgress, [0, 1], [0, 260]);

  const radarRotateX = useSpring(rawRadarRotateX, { stiffness: 85, damping: 22 });
  const radarScale = useSpring(rawRadarScale, { stiffness: 85, damping: 22 });
  const radarRotateRing = useSpring(rawRadarRotateRing, { stiffness: 70, damping: 20 });

  const selectScannerGrade = (grade: "primary" | "middle" | "high") => {
    setScannerGrade(grade);
    setShockwaveKey((prev) => prev + 1);
  };

  const selectScannerGoal = (goal: "stem" | "medicine" | "business") => {
    setScannerGoal(goal);
    setShockwaveKey((prev) => prev + 1);
  };

  const handleShareRadarWhatsapp = () => {
    const gradeTitle =
      scannerGrade === "high"
        ? "المرحلة الثانوية"
        : scannerGrade === "middle"
        ? "المرحلة المتوسطة"
        : "المرحلة الابتدائية";
    const goalTitle =
      scannerGoal === "stem"
        ? "هندسة وذكاء اصطناعي (STEM)"
        : scannerGoal === "medicine"
        ? "طب وعلوم صحية"
        : "قيادة وإدارة أعمال";
    const text = `السلام عليكم ورحمة الله، قمت بفحص رادار الاعتمادات الأكاديمية لمدارس العقيق:
📌 المرحلة الدراسية: ${gradeTitle}
🎯 المسار المستهدف: ${goalTitle}
أرغب في معرفة المزيد وحجز مقعد دراسي لابني في هذا المسار الأكاديمي الدولي المعتمد.`;
    window.open(`https://wa.me/966531896000?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <AqeeqLuxuryPageShell
      header={<AlaqeeqStudioSiteHeader title="الاعتمادات والشراكات الدولية" active="accreditations" />}
      footer={<AlaqeeqStudioSiteFooter />}
      useCurtain={true}
      curtainKicker="✦ استكشف قاعة الاعتمادات ومراكز الاختبارات العالمية ✦"
      hero={
        <section
          className={`relative isolate overflow-hidden py-14 sm:py-24 ${
            isNationalDay ? (dark ? "snd-hero-dark" : "snd-hero-light") : ""
          }`}
        >
          {/* Subtle Ambient Glowing Orbs */}
          <div className="pointer-events-none absolute -top-32 right-1/4 h-96 w-96 rounded-full blur-3xl opacity-20 bg-emerald-500" />
          <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full blur-3xl opacity-15 bg-[#f8ca14]" />

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
                  {isNationalDay ? (
                    <span>🇸🇦</span>
                  ) : (
                    <Award size={14} className={dark ? "text-[#f8ca14]" : "text-[#c59b27]"} />
                  )}
                  <span>
                    {isNationalDay
                      ? "مخرجات تعليمية عالمية تصنع فخر الوطن · عزّنا بطبعنا 🇸🇦"
                      : "معايير عالمية في قلب المدينة المنورة"}
                  </span>
                </div>

                <VisualEditable
                  id="accreditations-hero-title"
                  tag="text"
                  label="عنوان هيرو الاعتمادات"
                  defaultText="اعتمادات دولية مرموقة ومراكز اختبارات عالمية معتمدة"
                  as="h1"
                  className={`text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.2] mb-6 ${
                    dark ? "text-white" : "text-[#0a192f]"
                  }`}
                />

                <VisualEditable
                  id="accreditations-hero-desc"
                  tag="text"
                  label="وصف هيرو الاعتمادات"
                  defaultText="الجودة في مدارس العقيق ليست مجرد شعار، بل أسلوب حياة ومنهج عمل مؤسسي. نفتخر بحصولنا على اعتماد كوجنيا الأمريكية (Cognia)، واعتماد مدارسنا كمراكز رسمية لاختبارات IELTS و SAT و ACT بالمدينة المنورة."
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
                    <Send size={18} className="ml-2" />
                    <span>سجّل الآن في المدارس</span>
                  </Button>

                  <a
                    href="#cognia-section"
                    className={`inline-flex items-center justify-center rounded-2xl px-8 py-6 text-base font-black border transition active:scale-95 shadow-sm ${
                      dark
                        ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                        : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <ShieldCheck size={18} className="ml-2" />
                    <span>استكشف قاعة الاعتمادات 3D 🏛️</span>
                  </a>
                </div>

                {/* Trust Metrics Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
                  {[
                    { num: "Cognia", label: "اعتماد أمريكي كامل", sub: "كوجنيا العالمية" },
                    { num: "IDP", label: "مركز اختبارات IELTS", sub: "بالمدينة المنورة" },
                    { num: "SAT & ACT", label: "مراكز رقمية معتمدة", sub: "كود #68412" },
                    { num: "1st & 5th", label: "بطل المملكة وخامس العالم", sub: "WRO & FLL" },
                  ].map((stat, sIdx) => (
                    <div
                      key={sIdx}
                      className={`p-3 rounded-2xl border text-center transition ${
                        dark
                          ? "border-white/10 bg-black/40 text-slate-200"
                          : "border-emerald-950/10 bg-white shadow-sm text-slate-800"
                      }`}
                    >
                      <span className="block text-lg sm:text-xl font-black text-[#f8ca14]">{stat.num}</span>
                      <span className="block text-[11px] font-black mt-0.5 truncate">{stat.label}</span>
                      <span className="block text-[10px] text-slate-400 truncate">{stat.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Left Column: Overlapping 3D Credential Covers with 3D Mouse Tilt & Scroll Fan-out (5 cols) */}
              <div className="lg:col-span-5 relative">
                <motion.div
                  onMouseMove={(e) => { if (isDesktop) handleHeroMouseMove(e); }}
                  onMouseLeave={() => { if (isDesktop) handleHeroMouseLeave(); }}
                  style={{
                    rotateX: isDesktop ? heroTiltX : 0,
                    rotateY: isDesktop ? heroTiltY : 0,
                    transformStyle: isDesktop ? "preserve-3d" : "flat",
                  }}
                  className="relative mx-auto h-[320px] w-full max-w-[560px] sm:h-[400px] lg:h-[430px] perspective-1000 will-change-transform select-none"
                >
                  {/* Card 1 (Back Right on Scroll): WRO World Robot Olympiad */}
                  <motion.div
                    style={{
                      x: isDesktop ? heroBackCardX : 0,
                      rotate: isDesktop ? heroBackCardRotate : 0,
                      zIndex: 10,
                    }}
                    className={`absolute bottom-[10%] right-[1%] top-[12%] w-[47%] rounded-[1.8rem] sm:rounded-[2.2rem] p-2 sm:p-3 border shadow-2xl overflow-hidden cursor-pointer transition duration-300 ${
                      dark
                        ? "border-[#08467d]/40 bg-[#06182e]/95 shadow-black/90 ring-1 ring-[#08467d]/30"
                        : "border-[#08467d]/20 bg-white shadow-lg"
                    }`}
                  >
                    <div className="relative overflow-hidden rounded-[1.4rem] sm:rounded-[1.8rem] h-full w-full">
                      <VisualImage
                        id="accreditations-hero-wro-photo"
                        label="صورة طلاب العقيق في أولمبياد الروبوت العالمي WRO"
                        src="/covers/student-robotics-accreditations.jpg"
                        alt="طلاب مدارس العقيق في منافسات أولمبياد الروبوت الدولي WRO"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/85 border border-[#f8ca14]/50 px-2.5 py-0.5 text-[10px] sm:text-xs font-black text-[#f8ca14] shadow-md">
                        <Award size={12} className="text-[#f8ca14]" />
                        <span>خامس العالم 🌐</span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 left-2.5 text-white text-right">
                        <span className="text-[9px] font-black text-[#f8ca14] block">WRO INTERNATIONAL</span>
                        <h4 className="text-xs sm:text-sm font-black drop-shadow truncate">أولمبياد الروبوت الدولي</h4>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 2 (Middle Elevated on Scroll): Cognia USA Official Seal Plaque */}
                  <motion.div
                    style={{
                      y: isDesktop ? heroMiddleCardY : 0,
                      scale: isDesktop ? heroMiddleCardScale : 1,
                      zIndex: 30,
                    }}
                    className={`absolute bottom-[6%] left-[26%] top-[6%] w-[53%] rounded-[2rem] sm:rounded-[2.4rem] p-3 sm:p-4 border shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col justify-between overflow-hidden cursor-pointer backdrop-blur-2xl ${
                      dark
                        ? "border-[#f8ca14]/60 bg-[#09151e]/95 ring-2 ring-[#f8ca14]/30"
                        : "border-[#08467d]/20 bg-white shadow-xl ring-1 ring-[#f8ca14]/40"
                    }`}
                  >
                    <div className={`flex items-center justify-between pb-2 border-b ${dark ? "border-white/10" : "border-slate-100"}`}>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
                          <img
                            src="https://aqeeq.edu.sa/web/image/1901-f0d65949/Cognia-glossy-logo-800x800-1.png"
                            alt="شعار اعتماد كوجنيا"
                            className="h-7 sm:h-8 w-auto object-contain"
                          />
                        </div>
                        <div className="text-right">
                          <h4 className={`text-[10px] sm:text-xs font-black truncate ${dark ? "text-white" : "text-[#08467d]"}`}>كوجنيا الأمريكية</h4>
                          <span className={`text-[9px] sm:text-[10px] font-mono font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>SCORE: 99.2%</span>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-black border ${
                        dark
                          ? "bg-[#367453]/25 border-[#367453]/60 text-[#367453]"
                          : "bg-[#367453]/10 border-[#367453]/40 text-[#367453]"
                      }`}>
                        معتمد ✦
                      </span>
                    </div>

                    <div className="space-y-1.5 my-auto py-1 text-right">
                      <p className={`text-[11px] sm:text-xs font-black leading-tight ${dark ? "text-white" : "text-[#08467d]"}`}>الترخيص الأكاديمي الدولي</p>
                      <p className={`text-[10px] sm:text-[11px] leading-tight line-clamp-2 ${dark ? "text-slate-300" : "text-slate-600 font-medium"}`}>
                        شهادات تخرج دولية معترفاً بها ومقبولة فوراً في كبرى جامعات المملكة والعالم.
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <div className={`p-1.5 rounded-xl border text-center transition ${
                          dark
                            ? "bg-black/60 border-[#f8ca14]/30"
                            : "bg-[#08467d]/[0.04] border-[#08467d]/15 shadow-sm"
                        }`}>
                          <span className="block text-sm sm:text-base font-black text-[#f8ca14]">99.2%</span>
                          <span className={`block text-[8px] sm:text-[9px] font-bold mt-0.5 ${dark ? "text-slate-400" : "text-[#08467d]"}`}>كفاءة الأكاديميا</span>
                        </div>
                        <div className={`p-1.5 rounded-xl border text-center transition ${
                          dark
                            ? "bg-black/60 border-[#f8ca14]/30"
                            : "bg-[#08467d]/[0.04] border-[#08467d]/15 shadow-sm"
                        }`}>
                          <span className="block text-sm sm:text-base font-black text-[#f8ca14]">100%</span>
                          <span className={`block text-[8px] sm:text-[9px] font-bold mt-0.5 ${dark ? "text-slate-400" : "text-[#08467d]"}`}>قبول جامعي</span>
                        </div>
                      </div>
                    </div>

                    <div className={`flex items-center justify-between pt-1.5 border-t ${dark ? "border-white/10" : "border-slate-100"} text-[9px] sm:text-[10px] text-[#f8ca14] font-black`}>
                      <span>✦ المسار الأكاديمي المباشر</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#f8ca14] animate-ping" />
                    </div>
                  </motion.div>

                  {/* Card 3 (Front Left on Scroll): FIRST LEGO League Champions */}
                  <motion.div
                    style={{
                      x: isDesktop ? heroFrontCardX : 0,
                      rotate: isDesktop ? heroFrontCardRotate : 0,
                      zIndex: 20,
                    }}
                    className={`absolute bottom-[2%] left-[1%] top-[3%] w-[49%] rounded-[1.8rem] sm:rounded-[2.2rem] p-2 sm:p-3 border shadow-2xl overflow-hidden cursor-pointer transition duration-300 ${
                      dark
                        ? "border-amber-500/35 bg-[#0b1218]/95 shadow-black/90 ring-1 ring-amber-500/20"
                        : "border-amber-600/30 bg-white shadow-amber-950/15"
                    }`}
                  >
                    <div className="relative overflow-hidden rounded-[1.4rem] sm:rounded-[1.8rem] h-full w-full">
                      <VisualImage
                        id="accreditations-hero-fll-photo"
                        label="صورة أبطال العقيق - كأس بطولة فيرست ليجو بالمملكة"
                        src="/covers/first-lego-champions.png"
                        alt="أبطال مدارس العقيق مع كأس بطولة فيرست ليجو FIRST LEGO League بالمملكة"
                        className="h-full w-full object-cover object-[center_12%]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/85 border border-amber-400/50 px-2.5 py-0.5 text-[10px] sm:text-xs font-black text-amber-300 shadow-md">
                        <Trophy size={12} className="text-[#f8ca14]" />
                        <span>بطل المملكة 🥇</span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 left-2.5 text-white text-right">
                        <span className="text-[9px] font-black text-amber-300 block">FIRST SAUDI ARABIA</span>
                        <h4 className="text-xs sm:text-sm font-black drop-shadow truncate">بطولة فيرست ليجو</h4>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      }
    >
      {/* Kinetic Typographic Ribbon 1 */}
      <AqeeqTypographicScrubBar
        text="✦ COGNIA ACCREDITATION · OFFICIAL IDP IELTS VENUE · DIGITAL SAT #68412 · FIRST LEGO CHAMPIONS · WRO WORLD 5TH ✦"
        reverse={false}
      />

      {/* ========================================================
          STAGE 2: 3D CREDENTIALS PAVILION (قاعة الاعتمادات والمراكز الدولية)
          مغلفة بـ AqeeqScrollRevealSection لترتفع كستارة ملكية مع السكرول
      ======================================================== */}
      <AqeeqScrollRevealSection scrollVh={70} neonLine={true} className="py-14 sm:py-20">
        <section ref={hubSectionRef} id="cognia-section" className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div
              className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                dark ? "text-[#f8ca14]" : "text-[#c59b27]"
              } mb-2`}
            >
              <Award size={15} />
              <span>منظومة الاعتمادات ومراكز الاختبارات الدولية الرسمية</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              بوابة الاعتمادات الدولية ومراكز القياس بالمدينة المنورة 🏛️
            </h2>
            <p className={`mt-3 text-sm sm:text-base ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
              مدارس العقيق ليست مجرد صرح تعليمي، بل مركز اختبارات دولي معتمد يخدم الطلاب والمجتمع في المدينة المنورة وفق أعلى
              معايير الجودة العالمية.
            </p>

            {/* 4-Portal Interactive Switcher Capsule */}
            <div className="mt-8 w-full max-w-3xl mx-auto px-2">
              <div
                className={`grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl border shadow-lg backdrop-blur-xl transition ${
                  dark ? "border-white/10 bg-[#0c141a]/95" : "border-slate-200/90 bg-white"
                }`}
              >
                {[
                  { id: "cognia", label: "اعتماد كوجنيا الأمريكية", shortLabel: "اعتماد كوجنيا", icon: ShieldCheck, badge: "USA 🇺🇸" },
                  { id: "ielts", label: "مركز اختبارات IELTS", shortLabel: "اختبارات IELTS", icon: Globe2, badge: "IDP 🌐" },
                  { id: "sat", label: "مراكز SAT & ACT الرقمية", shortLabel: "مراكز SAT & ACT", icon: BookOpenCheck, badge: "Code #68412" },
                  { id: "stem", label: "الروبوت والذكاء الاصطناعي", shortLabel: "الروبوت والذكاء", icon: Trophy, badge: "بطل المملكة 🏆" },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeHubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveHubTab(tab.id as any)}
                      className={`relative flex flex-col items-center justify-center gap-1 rounded-xl py-2.5 px-1.5 sm:py-3 sm:px-2 text-center text-xs font-black transition active:scale-95 min-w-0 w-full overflow-hidden ${
                        isActive
                          ? "text-white"
                          : dark
                          ? "text-slate-400 hover:text-white hover:bg-white/5"
                          : "text-slate-700 hover:text-[#08467d] hover:bg-slate-50"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeHubPortalPill"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#08467d] to-[#0d2a45] shadow-md ring-1 ring-[#f8ca14]/50"
                          transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center justify-center gap-1 w-full min-w-0 max-w-full px-1">
                        <Icon size={14} className={`shrink-0 ${isActive ? "text-[#f8ca14]" : "text-slate-400"}`} />
                        <span className="truncate text-[11px] sm:text-xs font-black leading-tight">
                          <span className="sm:hidden">{tab.shortLabel}</span>
                          <span className="hidden sm:inline">{tab.label}</span>
                        </span>
                      </div>
                      <span
                        className={`relative z-10 text-[9.5px] sm:text-[10px] font-bold truncate max-w-full px-1 ${
                          isActive ? "text-[#f8ca14]" : "text-slate-500"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dynamic Interactive Portal Showcase with 3D Perspective Scrubbing */}
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {/* PORTAL 1: COGNIA USA */}
              {activeHubTab === "cognia" && (
                <motion.div
                  key="cognia"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className={`rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl ${
                    dark ? "border-emerald-500/35 bg-[#091218]/95" : "border-emerald-700/25 bg-white/95"
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    <div className="lg:col-span-7 text-right">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#367453]/15 px-3.5 py-1.5 text-xs font-black text-[#367453] border border-[#367453]/35">
                          <ShieldCheck size={16} />
                          <span>اعتماد أكاديمي مؤسسي رسمي</span>
                        </span>
                        <span className={`text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"}`}>
                          ترخيص دولي: COGNIA-USA-2026
                        </span>
                      </div>

                      <h3 className={`text-2xl sm:text-3xl font-black mb-4 ${dark ? "text-white" : "text-[#08467d]"}`}>
                        اعتماد كوجنيا الأمريكية (Cognia) لأعلى معايير جودة التعليم
                      </h3>

                      <p
                        className={`text-sm sm:text-base leading-relaxed mb-6 ${
                          dark ? "text-slate-300" : "text-slate-700 font-medium"
                        }`}
                      >
                        كوجنيا هي كبرى هيئات الاعتماد الأكاديمي في العالم، وتضم تحت مظلتها أكثر من 36,000 مؤسسة تعليمية في
                        85 دولة. يمنح هذا الاعتماد خريجي مدارس العقيق شهادات دولية معترفاً بها ومقبولة فوراً في كبرى جامعات
                        المملكة والعالم.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                        {[
                          "اعتراف وقبول فوري في كبرى الجامعات العالمية والمحلية",
                          "حوكمة أكاديمية وتقييم دوري مستمر لمستوى المناهج",
                          "تأهيل المعلمين وفق أحدث استراتيجيات التعليم الدولية",
                          "مناهج دولية متطورة تلبي متطلبات الثورة الصناعية الرابعة",
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs font-bold">
                            <CheckCircle2 size={16} className="text-[#367453] shrink-0 mt-0.5" />
                            <span className={dark ? "text-slate-200" : "text-slate-800 font-bold"}>{item}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <a
                          href="https://www.cognia.org/"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl bg-[#015a37] hover:bg-emerald-800 text-white px-6 py-3.5 text-xs font-black shadow-lg transition active:scale-95"
                        >
                          <span>التحقق من ملف مدارس العقيق في كوجنيا العالمية</span>
                          <ExternalLink size={14} />
                        </a>
                        <Button
                          onClick={() => navigate("/admissions")}
                          variant="outline"
                          className="rounded-2xl border-white/20 text-xs font-black"
                        >
                          التقديم للمسار الدولي المعتمد ✦
                        </Button>
                      </div>
                    </div>

                    {/* Cognia Scorecard & Radar Display with 3D Perspective Scrubbing */}
                    <motion.div
                      style={{
                        rotateX: plaqueRotateX,
                        rotateY: plaqueRotateY,
                        scale: plaqueScale,
                        transformStyle: "preserve-3d",
                      }}
                      className="lg:col-span-5 will-change-transform"
                    >
                      <div
                        className={`rounded-3xl border p-6 sm:p-8 shadow-2xl relative overflow-hidden ${
                          dark
                            ? "border-emerald-500/40 bg-black/70 ring-1 ring-emerald-500/30"
                            : "border-emerald-950/15 bg-[#fbfaf8] ring-1 ring-emerald-900/10"
                        }`}
                      >
                        {/* Laser Scan Sweep Line */}
                        <motion.div
                          animate={{ y: [0, 240, 0] }}
                          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                          className="pointer-events-none absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#f8ca14] to-transparent opacity-60 blur-xs"
                        />

                        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-200">
                              <img
                                src="https://aqeeq.edu.sa/web/image/1901-f0d65949/Cognia-glossy-logo-800x800-1.png"
                                alt="شعار اعتماد كوجنيا"
                                className="h-10 w-auto object-contain"
                              />
                            </div>
                            <div className="text-right">
                              <h5 className={`font-black text-xs ${dark ? "text-white" : "text-[#08467d]"}`}>بطاقة تقييم الجودة الأكاديمية</h5>
                              <p className="text-[10px] text-slate-500">Cognia Performance Scorecard</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-[#367453]/15 px-3 py-1 text-[11px] font-black text-[#367453] border border-[#367453]/35">
                            معتمد رسمي ✦
                          </span>
                        </div>

                        {/* Criteria Progress Bars */}
                        <div className="space-y-4 text-xs text-right">
                          {[
                            { title: "كفاءة القيادة والحوكمة المدرسية", score: "98.6%" },
                            { title: "فاعلية البيئة الصفية والتعلم النشط", score: "97.8%" },
                            { title: "تأهيل وتطوير الهيئة الأكاديمية", score: "99.2%" },
                            { title: "تكامل مناهج العلوم والذكاء الاصطناعي", score: "98.4%" },
                          ].map((crit, cIdx) => (
                            <div key={cIdx}>
                              <div className="flex justify-between mb-1.5 text-[11px] font-bold">
                                <span className={dark ? "text-slate-200" : "text-slate-800"}>{crit.title}</span>
                                <span className="text-[#f8ca14] font-black">{crit.score}</span>
                              </div>
                              <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: crit.score }}
                                  transition={{ duration: 0.8, delay: cIdx * 0.15 }}
                                  className="h-full bg-gradient-to-r from-[#08467d] to-[#f8ca14] rounded-full shadow-md"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-dashed border-slate-200 dark:border-white/10 text-center">
                          <span className="text-[11px] font-bold text-slate-400">
                            تخضع المدارس لمراجعة وتقييم دوري يضمن استدامة أعلى معدلات الجودة
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* PORTAL 2: IDP IELTS OFFICIAL TEST CENTRE */}
              {activeHubTab === "ielts" && (
                <motion.div
                  key="ielts"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className={`rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl ${
                    dark ? "border-blue-500/35 bg-[#091218]/95" : "border-blue-700/25 bg-white/95"
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    <div className="lg:col-span-7 text-right">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/15 px-3.5 py-1.5 text-xs font-black text-blue-400 border border-blue-500/30">
                          <Globe2 size={16} />
                          <span>مركز اختبارات معتمد بالمدينة المنورة</span>
                        </span>
                        <span className={`text-xs font-black ${dark ? "text-[#f8ca14]" : "text-blue-900"}`}>
                          بالشراكة الرسمية مع IDP العالمية
                        </span>
                      </div>

                      <h3 className={`text-2xl sm:text-3xl font-black mb-4 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                        مركز اختبارات IELTS (الآيلتس) الرسمي لطلاب المدارس والجمهور
                      </h3>

                      <p
                        className={`text-sm sm:text-base leading-relaxed mb-6 ${
                          dark ? "text-slate-300" : "text-slate-700 font-medium"
                        }`}
                      >
                        تستضيف مدارس العقيق المركز الرسمي لاختبار IELTS على الحاسوب (IELTS on Computer) بالمدينة المنورة،
                        مجهزاً بأحدث المعامل الحاسوبية وسماعات الرأس اللاسلكية العازلة للصوت لضمان أفضل تجربة اختبار ممكنة.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                        {[
                          "قاعات حاسوبية عازلة للصوت مجهزة بسماعات IDP الأصلية",
                          "إعلان نتائج الاختبار السريع خلال 3 إلى 5 أيام فقط",
                          "جلسات اختبارات مرنة ومتعددة أسبوعياً (صباحية ومسائية)",
                          "دورات تدريبية مكثفة لطلاب المدارس لتحقيق Band 7.5+",
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs font-bold">
                            <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
                            <span className={dark ? "text-slate-200" : "text-slate-800 font-bold"}>{item}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <a
                          href="https://ielts.idp.com/saudiarabia/test-centre/alaqeeq-holding-national-and-international-school"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 text-xs font-black shadow-lg transition active:scale-95"
                        >
                          <span>احجز مقعدك في مركز مدارس العقيق عبر IDP</span>
                          <ExternalLink size={14} />
                        </a>
                        <a
                          href="tel:+966531896000"
                          className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3.5 text-xs font-bold transition ${
                            dark
                              ? "border-white/10 text-slate-300 hover:bg-white/5"
                              : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm"
                          }`}
                        >
                          <Phone size={14} />
                          <span>استفسارات الآيلتس: 966531896000+</span>
                        </a>
                      </div>
                    </div>

                    {/* IELTS Upcoming Live Sessions Schedule with 3D Perspective Scrubbing */}
                    <motion.div
                      style={{
                        rotateX: plaqueRotateX,
                        rotateY: plaqueRotateY,
                        scale: plaqueScale,
                        transformStyle: "preserve-3d",
                      }}
                      className="lg:col-span-5 will-change-transform"
                    >
                      <div
                        className={`rounded-3xl border p-6 sm:p-8 shadow-2xl ${
                          dark ? "border-blue-500/35 bg-black/70" : "border-blue-950/15 bg-[#f8fafd]"
                        }`}
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-[#08467d] dark:text-[#f8ca14]" />
                            <h5 className={`font-black text-xs ${dark ? "text-white" : "text-[#08467d]"}`}>مواعيد الاختبارات القادمة (IELTS on Computer)</h5>
                          </div>
                          <span className="text-[10px] font-black text-[#08467d] dark:text-[#f8ca14] bg-[#08467d]/10 dark:bg-[#f8ca14]/15 px-2.5 py-0.5 rounded-full border border-[#08467d]/30 dark:border-[#f8ca14]/30">
                            مركز المدينة المنورة
                          </span>
                        </div>

                        <div className="space-y-3">
                          {[
                            {
                              date: "السبت، 12 سبتمبر 2026",
                              time: "09:00 صباحاً",
                              hall: "معمل الحاسوب (A)",
                              seats: "متاح الحجز",
                              statusColor: "text-[#367453] bg-[#367453]/10 border-[#367453]/30",
                            },
                            {
                              date: "الأربعاء، 16 سبتمبر 2026",
                              time: "01:30 ظهراً",
                              hall: "معمل الحاسوب (B)",
                              seats: "متبقي 4 مقاعد",
                              statusColor: "text-[#f8ca14] bg-[#f8ca14]/10 border-[#f8ca14]/30",
                            },
                            {
                              date: "السبت، 19 سبتمبر 2026",
                              time: "09:00 صباحاً",
                              hall: "معمل الحاسوب (A)",
                              seats: "متاح الحجز",
                              statusColor: "text-[#367453] bg-[#367453]/10 border-[#367453]/30",
                            },
                            {
                              date: "الأربعاء، 23 سبتمبر 2026",
                              time: "01:30 ظهراً",
                              hall: "معمل الحاسوب (B)",
                              seats: "متاح الحجز",
                              statusColor: "text-[#367453] bg-[#367453]/10 border-[#367453]/30",
                            },
                          ].map((session, sIdx) => (
                            <div
                              key={sIdx}
                              className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition ${
                                dark
                                  ? "border-white/10 bg-white/5 hover:border-[#f8ca14]/40"
                                  : "border-slate-200 bg-white hover:border-[#08467d]/40 shadow-xs"
                              }`}
                            >
                              <div className="text-right">
                                <p className={`font-black text-[12px] ${dark ? "text-white" : "text-[#08467d]"}`}>{session.date}</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                  <span className="flex items-center gap-1">
                                    <Clock size={11} /> {session.time}
                                  </span>
                                  <span>• {session.hall}</span>
                                </div>
                              </div>
                              <span
                                className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${session.statusColor}`}
                              >
                                {session.seats}
                              </span>
                            </div>
                          ))}
                        </div>

                        <p className="text-[10px] text-slate-400 text-center mt-4 font-medium">
                          يتم فتح جلسات اختبار إضافية بناءً على الإقبال بالتنسيق مع IDP العالمية
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* PORTAL 3: DIGITAL SAT & ACT */}
              {activeHubTab === "sat" && (
                <motion.div
                  key="sat"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className={`rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl ${
                    dark ? "border-amber-500/35 bg-[#091218]/95" : "border-amber-700/25 bg-white/95"
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* Digital SAT Card */}
                    <div
                      className={`rounded-3xl border p-6 sm:p-8 flex flex-col justify-between ${
                        dark ? "border-white/10 bg-black/70 shadow-xl" : "border-slate-200 bg-[#fdfbf7]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-400 border border-amber-500/30">
                            College Board Approved
                          </span>
                          <span className="text-xs font-bold font-mono text-slate-400">Center Code: #68412</span>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-white p-3 rounded-2xl shadow-sm border border-black/5 shrink-0">
                            <img
                              src="https://aqeeq.edu.sa/web/image/1907-cf5d04ed/sat-logo.jpg"
                              alt="شعار مركز اختبارات SAT"
                              className="h-12 w-auto object-contain"
                            />
                          </div>
                          <div className="text-right">
                            <h4 className={`text-xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
                              مركز اختبارات Digital SAT
                            </h4>
                            <p className="text-xs text-slate-400">معتمد رسمياً لتقديم الاختبار الرقمي عبر Bluebook</p>
                          </div>
                        </div>

                        <p
                          className={`text-xs sm:text-sm leading-relaxed mb-6 text-right ${
                            dark ? "text-slate-300" : "text-slate-700 font-medium"
                          }`}
                        >
                          مركز معتمد ومجهز بالكامل بأحدث الحواسيب والشبكات السريعة لاختبارات SAT الرقمية المؤهلة للقبول في
                          كبرى الجامعات العالمية والمسارات المرموقة في المملكة.
                        </p>

                        <div className="space-y-2 text-xs font-bold mb-6 text-right">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={15} className="text-amber-500" /> شبكة إنترنت فايبر مخصصة وآمنة للاختبار
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={15} className="text-amber-500" /> تدريب مدرسي مكثف لتحقيق 1400+ في SAT
                          </div>
                        </div>
                      </div>

                      <a
                        href="https://satsuite.collegeboard.org/sat/registration"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black px-5 py-3 text-xs font-black transition shadow"
                      >
                        <span>التسجيل في اختبار SAT عبر College Board</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>

                    {/* ACT Test Center Card */}
                    <div
                      className={`rounded-3xl border p-6 sm:p-8 flex flex-col justify-between ${
                        dark ? "border-white/10 bg-black/70 shadow-xl" : "border-slate-200 bg-[#fdfbf7]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#de191e]/10 px-3 py-1 text-xs font-black text-[#de191e] border border-[#de191e]/20">
                            ACT Official Test Venue
                          </span>
                          <span className="text-xs font-bold text-slate-400">American ACT Center</span>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-white p-3 rounded-2xl shadow-sm border border-black/5 shrink-0">
                            <img
                              src="https://aqeeq.edu.sa/web/image/1905-c752dcc6/act-logo.jpg"
                              alt="شعار مركز اختبارات ACT"
                              className="h-12 w-auto object-contain"
                            />
                          </div>
                          <div className="text-right">
                            <h4 className={`text-xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
                              مركز اختبارات ACT الأمريكية
                            </h4>
                            <p className="text-xs text-slate-400">تقييم مهارات الرياضيات واللغة والعلوم والتفكير النقدي</p>
                          </div>
                        </div>

                        <p
                          className={`text-xs sm:text-sm leading-relaxed mb-6 text-right ${
                            dark ? "text-slate-300" : "text-slate-700 font-medium"
                          }`}
                        >
                          مركز معتمد لتقديم اختبار ACT الشامل الذي يُعد أحد الركائز الأساسية للقبول الجامعي في الولايات
                          المتحدة وكبرى الجامعات الدولية.
                        </p>

                        <div className="space-y-2 text-xs font-bold mb-6 text-right">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={15} className="text-[#de191e]" /> بيئة اختبارات دولية بمواصفات قياسية
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={15} className="text-[#de191e]" /> مشرفون ومراقبون معتمدون دولياً
                          </div>
                        </div>
                      </div>

                      <a
                        href="https://global.act.org/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#de191e] hover:bg-[#c41419] text-white px-5 py-3 text-xs font-black transition shadow"
                      >
                        <span>التسجيل في اختبار ACT الدولي</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PORTAL 4: ROBOTICS & STEM ACADEMY */}
              {activeHubTab === "stem" && (
                <motion.div
                  key="stem"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className={`rounded-[2.5rem] border p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl ${
                    dark ? "border-emerald-500/35 bg-[#091218]/95" : "border-emerald-700/25 bg-white/95"
                  }`}
                >
                  <div className="max-w-3xl mb-8 text-right">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#f8ca14]/10 border border-[#f8ca14]/30 px-3.5 py-1.5 text-xs font-black text-[#f8ca14] mb-3">
                      <Trophy size={14} />
                      <span>أكاديمية الروبوت والذكاء الاصطناعي وبطولاتها الكبرى ✦</span>
                    </div>

                    <h3 className={`text-2xl sm:text-3xl font-black mb-3 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                      سجل بطولات الروبوت والـ STEM: أبطال المملكة محلياً وخامس العالم دولياً
                    </h3>

                    <p
                      className={`text-sm sm:text-base leading-relaxed ${
                        dark ? "text-slate-300" : "text-slate-700 font-medium"
                      }`}
                    >
                      تعد أكاديمية الروبوت والذكاء الاصطناعي بمدارس العقيق حاضنة وطنية للابتكار وصناعة المبتكرين؛ تجمع بين
                      التتويج بكأس المركز الأول على مستوى المملكة في بطولة فيرست ليجو (FLL) وحصد المركز الخامس عالمياً في
                      أولمبياد الروبوت الدولي (WRO) بين أكثر من 80 دولة.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Championship 1: FIRST LEGO League */}
                    <div
                      className={`rounded-3xl border p-5 shadow-lg relative overflow-hidden transition hover:shadow-xl ${
                        dark ? "border-amber-500/30 bg-[#080d14]" : "border-amber-600/20 bg-[#fffdf7]"
                      }`}
                    >
                      <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-4 border border-black/10">
                        <img
                          src="/covers/first-lego-champions.png"
                          alt="تتويج أبطال مدارس العقيق بكأس بطولة فيرست ليجو FIRST LEGO League بالمملكة"
                          className="h-full w-full object-cover object-[center_12%] transition duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/85 border border-amber-400/40 px-3 py-1 text-xs font-black text-amber-300 shadow-md">
                          <Trophy size={12} className="text-[#f8ca14]" />
                          <span>بطل المملكة 🥇</span>
                        </div>
                        <div className="absolute bottom-3 right-3 left-3 text-white text-right">
                          <span className="text-[10px] font-black text-amber-300">FIRST SAUDI ARABIA</span>
                          <h4 className="text-sm font-black drop-shadow">بطولة فيرست ليجو (FIRST LEGO League)</h4>
                        </div>
                      </div>

                      <h4 className={`text-base font-black mb-2 text-right ${dark ? "text-amber-300" : "text-amber-800"}`}>
                        كأس المركز الأول على مستوى المملكة في بطولة فيرست ليجو
                      </h4>
                      <p
                        className={`text-xs sm:text-sm leading-relaxed mb-4 text-right ${
                          dark ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        حصد أبطال مدارس العقيق كأس البطولة الوطنية والمركز الأول بالمملكة في دوري فيرست ليجو للروبوت والعلوم،
                        بعد تصميم وبرمجة روبوتات المهام الذكية وتقديم حلول علمية مبتكرة.
                      </p>

                      <div className="flex flex-wrap gap-2 text-[11px] font-black text-right">
                        <span className="rounded-xl px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          كأس بطولة المملكة 🏆
                        </span>
                        <span className="rounded-xl px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          برمجة الروبوتات الذكية
                        </span>
                      </div>
                    </div>

                    {/* Championship 2: World Robot Olympiad */}
                    <div
                      className={`rounded-3xl border p-5 shadow-lg relative overflow-hidden transition hover:shadow-xl ${
                        dark ? "border-[#08467d]/40 bg-[#06182e]" : "border-[#08467d]/20 bg-white"
                      }`}
                    >
                      <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-4 border border-black/10">
                        <img
                          src="/covers/student-robotics-accreditations.jpg"
                          alt="طلاب مدارس العقيق في أولمبياد الروبوت العالمي WRO"
                          className="h-full w-full object-cover transition duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/85 border border-[#f8ca14]/40 px-3 py-1 text-xs font-black text-[#f8ca14] shadow-md">
                          <Award size={12} className="text-[#f8ca14]" />
                          <span>خامس العالم 🏆</span>
                        </div>
                        <div className="absolute bottom-3 right-3 left-3 text-white text-right">
                          <span className="text-[10px] font-black text-[#f8ca14]">WRO INTERNATIONAL</span>
                          <h4 className="text-sm font-black drop-shadow">أولمبياد الروبوت العالمي (WRO)</h4>
                        </div>
                      </div>

                      <h4 className={`text-base font-black mb-2 text-right ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                        المركز الخامس عالمياً في أولمبياد الروبوت العالمي (WRO)
                      </h4>
                      <p
                        className={`text-xs sm:text-sm leading-relaxed mb-4 text-right ${
                          dark ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        مثل طلاب مدارس العقيق المملكة في المحفل العالمي الأضخم وتوجوا بالمركز الخامس على مستوى العالم بين أكثر
                        من 80 دولة متنافسة، مما يعكس كفاءة التدريب المتقدم على الخوارزميات والذكاء الاصطناعي.
                      </p>

                      <div className="flex flex-wrap gap-2 text-[11px] font-black text-right">
                        <span className="rounded-xl px-2.5 py-1 bg-[#08467d]/10 border border-[#08467d]/20 text-[#08467d] dark:bg-[#f8ca14]/10 dark:border-[#f8ca14]/30 dark:text-[#f8ca14]">
                          المركز الخامس عالمياً 🌐
                        </span>
                        <span className="rounded-xl px-2.5 py-1 bg-[#08467d]/10 border border-[#08467d]/20 text-[#08467d] dark:bg-[#f8ca14]/10 dark:border-[#f8ca14]/30 dark:text-[#f8ca14]">
                          منافسة أكثر من 80 دولة
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Academic Infrastructure Grid */}
                  <div
                    className={`p-5 sm:p-6 rounded-2xl border ${
                      dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <h5 className="text-xs font-black mb-3 text-right text-white">
                      التجهيزات والبنية التحتية لأكاديمية الروبوت والـ STEM بمدارس العقيق:
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        "معامل STEM وروبوتات VEX و LEGO المتقدمة",
                        "تدريب مكثف على لغات Python و C++ للخوارزميات",
                        "شراكات مع مؤسسة موهبة ومسار أسبار والجامعات",
                        "حاضنات لمشاريع الذكاء الاصطناعي وحلول الطاقة",
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs font-bold text-right">
                          <CheckCircle2 size={16} className="text-[#f8ca14] shrink-0 mt-0.5" />
                          <span className={dark ? "text-slate-200" : "text-slate-800 font-bold"}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </AqeeqScrollRevealSection>

      {/* Kinetic Typographic Ribbon 2 */}
      <AqeeqTypographicScrubBar
        text="✦ طريق المستقبل 2030 · من مقاعد العقيق إلى هارفارد والبترول · مسار الرواد والابتعاث ✦"
        reverse={true}
      />

      {/* ========================================================
          STAGE 3: THE 3D HYPER-TRACK CAREER PIPELINE (طريق المستقبل هارفارد - البترول 2030)
          مغلفة بـ AqeeqScrollRevealSection لترتفع كستارة ثانية
      ======================================================== */}
      <AqeeqScrollRevealSection scrollVh={70} neonLine={true} className="py-14 sm:py-24">
        <section
          ref={pipelineSectionRef}
          className={`container mx-auto px-4 sm:px-6 relative z-10`}
        >
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div
              className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                dark ? "text-[#f8ca14]" : "text-[#c59b27]"
              } mb-2`}
            >
              <GraduationCap size={16} />
              <span>طريق المستقبل السريع · محاكي مسارات القبول 2030</span>
            </div>
            <h3 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              خريطة عبور المستقبل: من مقاعد العقيق إلى هارفارد والبترول 🎓
            </h3>
            <p className={`text-xs sm:text-sm mt-3 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
              اختر وجهة طموح ابنك لتكتشف كيف تضمن له اعتمادات العقيق ومراكزها الدولية القبول الفوري:
            </p>

            {/* Pathway Selector Pills */}
            <div className="mt-8 w-full max-w-2xl mx-auto px-2">
              <div
                className={`grid grid-cols-3 gap-2 p-1.5 rounded-2xl border shadow-lg backdrop-blur-xl transition ${
                  dark ? "border-white/10 bg-[#0c141a]/95" : "border-slate-200/90 bg-white"
                }`}
              >
                {[
                  { id: "saudi", label: "الجامعات السعودية 🇸🇦", shortLabel: "السعودية 🇸🇦", sub: "KFUPM & كاوست" },
                  { id: "scholarship", label: "برنامج الابتعاث ✈️", shortLabel: "الابتعاث ✈️", sub: "مسار الرواد" },
                  { id: "global", label: "الجامعات الدولية 🌐", shortLabel: "الدولية 🌐", sub: "Harvard & Oxford" },
                ].map((p) => {
                  const isActive = activePathway === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePathway(p.id as any)}
                      className={`relative rounded-xl py-2 px-1 sm:py-2.5 sm:px-2 text-xs font-black transition active:scale-95 text-center min-w-0 w-full overflow-hidden ${
                        isActive
                          ? "text-white"
                          : dark
                          ? "text-slate-400 hover:text-white hover:bg-white/5"
                          : "text-slate-700 hover:text-[#08467d] hover:bg-slate-50"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activePathwayPill"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#08467d] to-[#0d2a45] shadow-md ring-1 ring-[#f8ca14]/40"
                          transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        />
                      )}
                      <span className="relative z-10 block truncate text-[11px] sm:text-xs font-black">
                        <span className="sm:hidden">{p.shortLabel}</span>
                        <span className="hidden sm:inline">{p.label}</span>
                      </span>
                      <span
                        className={`relative z-10 block text-[9.5px] sm:text-[10px] mt-0.5 truncate px-0.5 ${
                          isActive ? "text-[#f8ca14]" : "text-slate-500"
                        }`}
                      >
                        {p.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Connected 4-Station Visual Future Pipeline with 3D Z-Depth Stagger */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Animated Connecting Energy Beam (Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 z-0">
                <motion.div
                  style={{ width: beamHeight }}
                  className="h-full bg-gradient-to-r from-[#08467d] via-[#f8ca14] to-[#f8ca14] shadow-[0_0_15px_rgba(248,202,20,0.8)]"
                />
              </div>

              {[
                {
                  step: "01",
                  title: "مقاعد العقيق التأسيسية",
                  badge: "المعايير الدولية",
                  desc: "تأسيس لغوي وعلمي متقدم وفق معايير كوجنيا وروبوتات STEM المعتمدة.",
                  icon: Building2,
                  accent: "text-[#08467d] border-[#08467d]/30 bg-[#08467d]/10 dark:text-[#f8ca14] dark:border-[#f8ca14]/40 dark:bg-[#f8ca14]/10",
                  offset: staggerCol1,
                },
                {
                  step: "02",
                  title: "شهادة Cognia & SAT",
                  badge: "الدبلومة المعتمدة",
                  desc: "اختبار الطالب داخل المدرسة والحصول على Band 7.5+ و 1400+ في SAT.",
                  icon: Award,
                  accent: "text-[#f8ca14] border-[#f8ca14]/40 bg-[#f8ca14]/10",
                  offset: staggerCol2,
                },
                {
                  step: "03",
                  title: "ملف القبول والابتعاث",
                  badge: "مسار الرواد",
                  desc: "سيرة ذاتية متكاملة وساعات AP معتمدة تؤهل لمنحة خادم الحرمين الشريفين.",
                  icon: Compass,
                  accent: "text-[#08467d] border-[#08467d]/40 bg-[#08467d]/10 dark:text-[#f8ca14] dark:border-[#f8ca14]/30",
                  offset: staggerCol1,
                },
                {
                  step: "04",
                  title: "هارفارد والبترول",
                  badge: "القبول النهائي",
                  desc: "القبول المباشر دون قيود، والإعفاء من السنة التحضيرية كقائد لرؤية 2030.",
                  icon: Trophy,
                  accent: "text-[#f8ca14] border-[#f8ca14]/50 bg-[#f8ca14]/15",
                  offset: staggerCol2,
                },
              ].map((station, sIdx) => {
                const StationIcon = station.icon;
                return (
                  <motion.div
                    key={sIdx}
                    style={{ y: station.offset }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`relative z-10 rounded-3xl border p-6 text-right backdrop-blur-xl shadow-xl transition ${
                      dark ? "border-white/10 bg-[#0a1218]/90" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-black text-slate-500">STAGE {station.step}</span>
                      <div className={`grid h-10 w-10 place-items-center rounded-2xl border ${station.accent}`}>
                        <StationIcon size={18} />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#f8ca14] block mb-1">{station.badge}</span>
                    <h4 className={`text-base font-black mb-2 ${dark ? "text-white" : "text-[#08467d]"}`}>{station.title}</h4>
                    <p className={`text-xs leading-relaxed font-medium ${dark ? "text-slate-300" : "text-slate-600"}`}>{station.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Pathway Detail Card */}
            <div
              className={`mt-14 rounded-3xl border p-8 sm:p-10 shadow-2xl relative overflow-hidden ${
                dark
                  ? "border-[#f8ca14]/30 bg-gradient-to-b from-[#0c161d] to-[#080d12]"
                  : "border-[#08467d]/20 bg-white shadow-xl"
              }`}
            >
              {activePathway === "saudi" && (
                <div className="space-y-4 text-right">
                  <h4 className={`text-xl font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                    القبول في جامعة الملك فهد للبترول والمعادن (KFUPM)، كاوست (KAUST)، وجامعة الملك سعود:
                  </h4>
                  <p className={`text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                    تشترط هذه الجامعات الرائدة درجات تنافسية عالية في اختبارات قياس (القدرات والتحصيلي) بالإضافة إلى اختبار
                    لغة إنجليزية معتمد (IELTS 6.0+ أو SAT Math 650+). توفر مدارس العقيق كل هذه الاختبارات والتأهيل داخل
                    أسوارها.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    <div
                      className={`p-4 rounded-2xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>الآيلتس المباشر</span>
                      <span className="font-black text-sm text-[#f8ca14]">تحقيق Band 6.5 - 7.5</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>اختبار الطالب داخل قاعات مدارسه المعتمدة</p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>القدرات والتحصيلي</span>
                      <span className="font-black text-sm text-[#f8ca14]">معدلات 90+ و 95+</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>برامج تدريب يومية متخصصة ومحاكاة دورية</p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>السنة التحضيرية</span>
                      <span className="font-black text-sm text-[#f8ca14]">إعفاء واجتياز مباشر</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>بفضل مناهج العلوم واللغات المتطورة</p>
                    </div>
                  </div>
                </div>
              )}

              {activePathway === "scholarship" && (
                <div className="space-y-4 text-right">
                  <h4 className={`text-xl font-black ${dark ? "text-[#f8ca14]" : "text-[#015a37]"}`}>
                    برنامج خادم الحرمين الشريفين للابتعاث (مسار الرواد لأفضل 30 جامعة بالعالم):
                  </h4>
                  <p className={`text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                    يتطلب مسار الرواد قبولاً غير مشروط من كبرى الجامعات (مثل Harvard, MIT, Oxford, Stanford). بفضل اعتماد
                    كوجنيا ومراكز SAT و IELTS داخل العقيق، يحصل الطالب على ملف أكاديمي متكامل يطابق معايير القبول في رابطة
                    اللبلاب (Ivy League).
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    <div
                      className={`p-4 rounded-2xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>شهادة كوجنيا الأمريكية</span>
                      <span className={`font-black text-sm ${dark ? "text-amber-400" : "text-amber-700"}`}>High School Diploma</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>معادلة ومقبولة فورياً عالمياً ومحلياً</p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>اختبارات SAT الرسمية</span>
                      <span className={`font-black text-sm ${dark ? "text-amber-400" : "text-amber-700"}`}>درجات تنافسية 1350+</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>مركز الاختبارات الرسمي داخل المدرسة</p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>الإرشاد الجامعي الدولي</span>
                      <span className={`font-black text-sm ${dark ? "text-amber-400" : "text-amber-700"}`}>College Counseling</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>خطابات توصية وسيرة ذاتية متكاملة للمنح</p>
                    </div>
                  </div>
                </div>
              )}

              {activePathway === "global" && (
                <div className="space-y-4 text-right">
                  <h4 className={`text-xl font-black ${dark ? "text-[#f8ca14]" : "text-[#015a37]"}`}>
                    كليات الطب والعلوم والهندسة في بريطانيا، كندا، وأمريكا ودول الخليج:
                  </h4>
                  <p className={`text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                    توفر مدارس العقيق مسارات نوعية للمواد العلمية والإنجليزية المكثفة مع إمكانية احتساب الساعات الجامعية
                    المعتمدة (AP Courses)، مما يوفر على الطالب سنة دراسية كاملة ويسرع انطلاقه في المجال الطبي والهندسي.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    <div
                      className={`p-4 rounded-2xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>ساعات AP المعتمدة</span>
                      <span className={`font-black text-sm ${dark ? "text-blue-400" : "text-blue-700"}`}>Advanced Placement</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>معادلة مقررات الجامعة المبكرة وتوفير سنة</p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>المعامل والبحث العلمي</span>
                      <span className={`font-black text-sm ${dark ? "text-blue-400" : "text-blue-700"}`}>STEM Research</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>تجارب معملية وبحوث موثقة تنمي الابتكار</p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>اللغة الإنجليزية التخصصية</span>
                      <span className={`font-black text-sm ${dark ? "text-blue-400" : "text-blue-700"}`}>Academic Fluency</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>طلاقة كاملة في المصطلحات الطبية والهندسية</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </AqeeqScrollRevealSection>

      {/* ========================================================
          STAGE 4 & 5: PARENT READINESS SCANNER & FAQ
          مغلفة بـ AqeeqScrollRevealSection لترتفع كستارة ثالثة
      ======================================================== */}
      <AqeeqScrollRevealSection scrollVh={60} neonLine={true} className="py-14 sm:py-20">
        {/* ========================================================
            STAGE 4: COMPACT & SLEEK 3D RADAR CONSOLE (رادار جاهزية ابنك المدمج)
        ======================================================== */}
        <div className="container mx-auto px-4 sm:px-6 mb-16">
          {/* Section Header (Compact) */}
          <div className="text-center max-w-xl mx-auto mb-7">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f8ca14]/10 border border-[#f8ca14]/30 px-3 py-1 text-[11px] font-black text-[#f8ca14] mb-2 shadow-sm">
              <Radar size={13} className="animate-spin text-[#f8ca14]" style={{ animationDuration: "6s" }} />
              <span>مصفوفة الرصد الأكاديمي المباشر 2030</span>
            </div>
            <h3 className={`text-xl sm:text-2xl md:text-3xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              رادار جاهزية ابنك: خارطة الاعتمادات المخصصة 🎯
            </h3>
            <p className={`text-xs mt-1.5 leading-relaxed ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>
              حدد مرحلة وطموح ابنك لتشاهد قفل الرادار التفاعلي على المسار المعتمد وشهاداته الدولية.
            </p>
          </div>

          {/* Unified Compact 3D Cockpit Console */}
          <motion.div
            ref={radarSectionRef}
            style={{
              rotateX: radarRotateX,
              scale: radarScale,
              transformStyle: "preserve-3d",
            }}
            className={`max-w-4xl mx-auto rounded-[2rem] border shadow-2xl p-5 sm:p-7 relative overflow-hidden backdrop-blur-xl will-change-transform ${
              dark
                ? "border-[#f8ca14]/30 bg-[#071118]/95 ring-1 ring-[#f8ca14]/20"
                : "border-[#08467d]/20 bg-white shadow-xl"
            }`}
          >
            {/* Top Segmented Controls Row (Apple/Linear Style) */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 pb-4 mb-5 border-b text-right ${dark ? "border-white/10" : "border-slate-200"}`}>
              {/* Grade Selector */}
              <div>
                <span className={`text-[10px] font-bold block mb-1.5 ${dark ? "text-slate-400" : "text-slate-600"}`}>المرحلة الدراسية:</span>
                <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl border ${dark ? "bg-black/50 border-white/10" : "bg-slate-100 border-slate-200"}`}>
                  {[
                    { id: "primary", label: "الابتدائية 🧸" },
                    { id: "middle", label: "المتوسطة 🎒" },
                    { id: "high", label: "الثانوية 🎓" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => selectScannerGrade(g.id as any)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-black transition active:scale-95 text-center truncate ${
                        scannerGrade === g.id
                          ? "bg-[#f8ca14] text-black shadow font-black"
                          : dark
                          ? "text-slate-400 hover:text-white"
                          : "text-slate-600 hover:text-black font-bold"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ambition Selector */}
              <div>
                <span className={`text-[10px] font-bold block mb-1.5 ${dark ? "text-slate-400" : "text-slate-600"}`}>الطموح المستقبلي:</span>
                <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl border ${dark ? "bg-black/50 border-white/10" : "bg-slate-100 border-slate-200"}`}>
                  {[
                    { id: "stem", label: "ذكاء اصطناعي 🤖" },
                    { id: "medicine", label: "طب وعلوم 🩺" },
                    { id: "business", label: "قيادة وأعمال 🏛️" },
                  ].map((goal) => (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => selectScannerGoal(goal.id as any)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-black transition active:scale-95 text-center truncate ${
                        scannerGoal === goal.id
                          ? "bg-[#f8ca14] text-black shadow font-black"
                          : dark
                          ? "text-slate-400 hover:text-white"
                          : "text-slate-600 hover:text-black font-bold"
                      }`}
                    >
                      {goal.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Core Display: Compact Circular Radar + Dynamic Academic Pathway */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Left Column: Sleek Miniature Holographic Radar Screen (5 cols) */}
              <div className="md:col-span-5 flex flex-col items-center justify-center order-2 md:order-1">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-[#08467d]/50 bg-[#03080c] p-2 shadow-[0_0_35px_rgba(8,70,125,0.3)] select-none">
                  
                  {/* Rotating Compass Outer Rim */}
                  <motion.div
                    style={{ rotate: radarRotateRing }}
                    className="absolute inset-0.5 rounded-full border border-dashed border-[#f8ca14]/30 pointer-events-none"
                  >
                    <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[8px] font-mono font-black text-[#f8ca14]">N</span>
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-600">S</span>
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-600">E</span>
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-600">W</span>
                  </motion.div>

                  {/* Concentric Rings & Crosshairs */}
                  <div className="relative h-full w-full rounded-full border border-[#08467d]/35 overflow-hidden flex items-center justify-center">
                    <div className="absolute h-[30%] w-[30%] rounded-full border border-[#08467d]/30" />
                    <div className="absolute h-[60%] w-[60%] rounded-full border border-[#08467d]/35" />
                    <div className="absolute h-[90%] w-[90%] rounded-full border border-[#08467d]/30" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="h-full w-px bg-[#08467d]/25" />
                      <div className="w-full h-px bg-[#08467d]/25 absolute" />
                    </div>

                    {/* Continuous 360° Rotating Sweep */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                      className="absolute inset-0 origin-center pointer-events-none"
                    >
                      <div
                        className="h-1/2 w-1/2 absolute top-0 right-0 origin-bottom-left"
                        style={{
                          background: "conic-gradient(from 0deg at 0% 100%, rgba(248,202,20,0.2) 0deg, transparent 65deg)",
                        }}
                      />
                      <div className="h-1/2 w-0.5 bg-gradient-to-t from-[#f8ca14] to-transparent absolute top-0 right-1/2 origin-bottom shadow-[0_0_8px_#f8ca14]" />
                    </motion.div>

                    {/* Shockwave Pulse */}
                    <motion.div
                      key={shockwaveKey}
                      initial={{ scale: 0.1, opacity: 1 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="absolute h-20 w-20 rounded-full border border-[#f8ca14] pointer-events-none shadow-[0_0_20px_#f8ca14]"
                    />

                    {/* Compact Blips */}
                    <div className="absolute top-[20%] right-[22%] z-20 pointer-events-none">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f8ca14] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#f8ca14]" />
                      </span>
                    </div>
                    <div className="absolute top-[28%] left-[22%] z-20 pointer-events-none">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                      </span>
                    </div>
                    <div className="absolute bottom-[22%] right-[24%] z-20 pointer-events-none">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                      </span>
                    </div>
                    <div className="absolute bottom-[24%] left-[24%] z-20 pointer-events-none">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#f8ca14]" />
                      </span>
                    </div>

                    {/* Center Core */}
                    <div className="relative z-30 h-7 w-7 rounded-full border border-[#f8ca14] bg-black/90 flex items-center justify-center shadow-[0_0_12px_rgba(248,202,20,0.5)]">
                      <Target size={13} className="text-[#f8ca14]" />
                    </div>
                  </div>
                </div>

                <span className={`text-[9px] font-mono mt-2 tracking-wider uppercase ${dark ? "text-[#f8ca14]/80" : "text-[#08467d] font-bold"}`}>
                  RADAR LOCKED · 98.9% MATCH
                </span>
              </div>

              {/* Right Column: Sleek Academic Target Passport Card (7 cols) */}
              <div className="md:col-span-7 text-right order-1 md:order-2">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-black text-[#f8ca14]">PASSPORT #AQ-2030</span>
                  <span className="text-[10px] font-mono text-[#f8ca14] bg-[#f8ca14]/10 px-2 py-0.5 rounded-md border border-[#f8ca14]/30 font-bold">
                    TARGET ACQUIRED
                  </span>
                </div>

                <h4 className={`text-base sm:text-lg font-black mb-2 ${dark ? "text-white" : "text-[#08467d]"}`}>
                  {scannerGrade === "high"
                    ? scannerGoal === "stem"
                      ? "مسار النخبة للذكاء الاصطناعي والهندسة 🤖"
                      : scannerGoal === "medicine"
                      ? "مسار العلوم الطبية والصحية المتقدم 🩺"
                      : "مسار الرواد الدولي لإدارة الأعمال 🏛️"
                    : scannerGrade === "middle"
                    ? "مسار الابتكار التأسيسي وبطولات الروبوت 🎒"
                    : "مسار التأسيس الدولي واللغات المبكر 🧸"}
                </h4>

                {/* 3 Clean Bullet Highlights */}
                <div className="space-y-1.5 text-xs mb-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-[#f8ca14] shrink-0 mt-0.5" />
                    <span className={dark ? "text-slate-300" : "text-slate-700 font-medium"}>
                      <strong className={dark ? "text-white" : "text-[#08467d] font-black"}>اعتماد كوجنيا (Cognia):</strong> دبلومة دولية معتمدة ومقبولة محلياً وعالمياً.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-[#f8ca14] shrink-0 mt-0.5" />
                    <span className={dark ? "text-slate-300" : "text-slate-700 font-medium"}>
                      <strong className={dark ? "text-white" : "text-[#08467d] font-black"}>مراكز IELTS & SAT:</strong> أداء الاختبارات الرسمية داخل قاعات المدارس.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-[#f8ca14] shrink-0 mt-0.5" />
                    <span className={dark ? "text-slate-300" : "text-slate-700 font-medium"}>
                      <strong className={dark ? "text-white" : "text-[#08467d] font-black"}>توفير سنة كاملة:</strong> إعفاء مباشر من السنة التحضيرية في الجامعات.
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <Button
                    onClick={() => navigate("/admissions")}
                    className="rounded-xl bg-gradient-to-r from-[#08467d] to-[#0d2a45] hover:opacity-95 text-[#f8ca14] border border-[#f8ca14]/40 px-5 py-2.5 text-xs font-black shadow-md transition active:scale-95"
                  >
                    <span>حجز مقعد دراسي ✦</span>
                  </Button>
                  <button
                    type="button"
                    onClick={handleShareRadarWhatsapp}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] px-4 py-2 text-xs font-black transition active:scale-95"
                  >
                    <Share2 size={13} />
                    <span>مشاركة عبر واتساب</span>
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>

        {/* Interactive FAQ Accordion */}
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div
                className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                  dark ? "text-[#f8ca14]" : "text-[#c59b27]"
                } mb-2`}
              >
                <HelpCircle size={15} />
                <span>الإجابات الشافية</span>
              </div>
              <h3 className={`text-2xl sm:text-3xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
                الأسئلة الشائعة حول مراكز الاختبارات والاعتمادات
              </h3>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "هل مراكز اختبارات IELTS و SAT متاحة للأفراد والطلاب من خارج مدارس العقيق؟",
                  a: "نعم، مركز مدارس العقيق لاختبارات IELTS IDP و SAT مرخص رسمياً لخدمة كافة أفراد المجتمع والطلاب في المدينة المنورة وخارجها، ويمكن لأي متقدم حجز موعده مباشرة عبر موقع IDP أو College Board واختيار مركز مدارس العقيق.",
                },
                {
                  q: "ما الفرق بين اختبار IELTS الورقي والمحوسب المتاح في المركز؟",
                  a: "اختبار IELTS on Computer هو الاختبار الأكثر طلباً عالمياً لأنه يتم في قاعات حاسوبية عازلة للصوت، وتظهر نتائجه في فترة قياسية (خلال 3 إلى 5 أيام عمل فقط)، مع توفير لوحة مفاتيح وسماعات رأس احترافية.",
                },
                {
                  q: "ماذا يضيف اعتماد كوجنيا (Cognia) لشهادة تخرج ابني؟",
                  a: "اعتماد كوجنيا يمنح الشهادة معادلة فورية معتمدة دولياً ومحلياً، مما يلغي أي عقبات في تصديق الشهادات لدى الملحقيات الثقافية والجامعات العالمية عند التقديم على المنح وبرامج الابتعاث.",
                },
                {
                  q: "كيف تساعد المدرسة الطلاب في الاستعداد لهذه الاختبارات؟",
                  a: "توفر المدرسة مسارات تأهيلية مكثفة ضمن اليوم الدراسي وخارجه، تشمل اختبارات محاكاة دورية للآيلتس والسات والقدرات والتحصيلي، وورش عمل معتمدة بإشراف مدربين دوليين معتمدين.",
                },
              ].map((faq, fIdx) => (
                <div
                  key={fIdx}
                  className={`rounded-2xl border transition overflow-hidden ${
                    dark ? "border-white/10 bg-[#0c1218]" : "border-[#08467d]/15 bg-white shadow-sm"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === fIdx ? null : fIdx)}
                    className="w-full p-5 text-right font-black text-sm flex items-center justify-between gap-4"
                  >
                    <span className={dark ? "text-white" : "text-[#08467d]"}>{faq.q}</span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 transition duration-300 ${
                        dark ? "text-[#f8ca14]" : "text-[#08467d]"
                      } ${openFaqIndex === fIdx ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFaqIndex === fIdx && (
                    <div
                      className={`p-5 pt-0 text-xs leading-relaxed border-t border-dashed ${
                        dark ? "border-white/10 text-slate-300" : "border-slate-100 text-slate-700 font-medium"
                      }`}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </AqeeqScrollRevealSection>

      {/* ========================================================
          STAGE 6: GRAND FINALE ROYAL ACTION
      ======================================================== */}
      <AqeeqGrandFinaleCta
        badge="✦ جودة تعليمية عالمية موثقة ✦"
        title="امنح أبناءك شهادات معتمدة تفتح لهم أبواب كبرى الجامعات محلياً وعالمياً"
        subtitle="مدارس العقيق معتمدة رسمياً من Cognia الأمريكية ومقر معتمد لاختبارات IELTS و SAT و ACT بالمدينة المنورة."
        primaryActionText="قدّم طلب التسجيل الآن"
        primaryActionHref="/admissions"
        onPrimaryAction={() => navigate("/admissions")}
        secondaryActionText="استكشف مجمعاتنا التعليمية"
        secondaryActionHref="/about"
        onSecondaryAction={() => navigate("/about")}
      />
    </AqeeqLuxuryPageShell>
  );
}
