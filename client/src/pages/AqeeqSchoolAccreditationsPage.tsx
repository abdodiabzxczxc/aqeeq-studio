import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { AccreditationsScrollGlobalBackdrop } from "@/components/ui/accreditations-scroll-global-backdrop";
import { HeroParallax, HeroParallaxBackdrop, type ParallaxProduct } from "@/components/ui/hero-parallax";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export const ACCREDITATIONS_PARALLAX_PRODUCTS: ParallaxProduct[] = [
  { title: "اعتماد كوجنيا الأمريكية Cognia", link: "#accreditations-hub-section", thumbnail: "/covers/cover-about.jpg", category: "تقييم 99.2%", date: "اعتماد دولي" },
  { title: "مركز اختبارات آيلتس IDP IELTS", link: "#accreditations-hub-section", thumbnail: "/covers/cover-admissions.jpg", category: "مقر رسمي بالمدينة", date: "IDP Venue" },
  { title: "مركز اختبارات السات الرقمي SAT", link: "#accreditations-hub-section", thumbnail: "/covers/student-lab-admissions.jpg", category: "كود رسمي #68412", date: "College Board" },
  { title: "كأس بطولة فيرست ليجو بالمملكة", link: "#accreditations-hub-section", thumbnail: "/covers/first-lego-champions.png", category: "بطل المملكة 🥇", date: "FLL Champions" },
  { title: "أولمبياد الروبوت العالمي WRO", link: "#accreditations-hub-section", thumbnail: "/covers/student-robotics-accreditations.jpg", category: "خامس العالم 🌐", date: "WRO International" },
  { title: "اختبارات ACT الدولية المعيارية", link: "#accreditations-hub-section", thumbnail: "/covers/cover-about.jpg", category: "مركز رقمي معتمد", date: "ACT Testing" },
  { title: "شراكة موهبة ورعاية الموهوبين", link: "#accreditations-hub-section", thumbnail: "/covers/student-excellence-about.jpg", category: "فصول موهبة", date: "مؤسسة موهبة" },
  { title: "معايير السلامة والجودة الأكاديمية", link: "#accreditations-hub-section", thumbnail: "/covers/cover-admissions.jpg", category: "ISO & Cognia", date: "جودة شاملة" },
  { title: "مناهج كامبريدج للغات والعلوم", link: "#accreditations-hub-section", thumbnail: "/covers/student-lab-admissions.jpg", category: "Cambridge English", date: "معايير بريطانية" },
  { title: "معامل الروبوت والذكاء الاصطناعي", link: "#accreditations-hub-section", thumbnail: "/covers/first-lego-champions.png", category: "STEM Labs", date: "ابتكار وتقنية" },
  { title: "أعلى معدلات اختبار القدرات والتحصيلي", link: "#accreditations-hub-section", thumbnail: "/covers/student-excellence-about.jpg", category: "مراكز متقدمة قياس", date: "المركز الوطني قياس" },
  { title: "شهادات تخرج مقبولة في كبرى الجامعات", link: "#accreditations-hub-section", thumbnail: "/covers/cover-about.jpg", category: "قبول 100%", date: "مسارات جامعية" },
  { title: "أكاديميات البرمجة والمستقبل", link: "#accreditations-hub-section", thumbnail: "/covers/student-lab-admissions.jpg", category: "لغات البرمجة", date: "عالم الغد" },
  { title: "المسار الأكاديمي الدولي المباشر", link: "#accreditations-hub-section", thumbnail: "/covers/cover-admissions.jpg", category: "تأهيل جامعي عالمي", date: "High School Diploma" },
  { title: "منصات التتويج والجوائز الوطنية", link: "#accreditations-hub-section", thumbnail: "/covers/first-lego-champions.png", category: "تمثيل المملكة", date: "إنجاز وطني" },
  { title: "شراكات تعليمية وتدريبية مستدامة", link: "#accreditations-hub-section", thumbnail: "/covers/cover-about.jpg", category: "تطوير مستمر", date: "الريادة التعليمية" },
];
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
  Layers,
  Crosshair,
} from "lucide-react";

export default function AqeeqSchoolAccreditationsPage() {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [, navigate] = useLocation();
  const accreditationsHeroRef = useRef<HTMLDivElement>(null);

  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    refetchOnMount: true,
    staleTime: 0,
  });

  const dynamicAccreditationsParallaxProducts = useMemo<ParallaxProduct[]>(() => {
    const custom = (orchestration as any)?.backdrops?.accreditations;
    if (custom && Array.isArray(custom) && custom.length > 0) {
      return custom.map((item: any) => ({
        title: item.title,
        link: item.link || "#accreditations-hub-section",
        thumbnail: item.image,
        category: item.badge || item.category,
        date: item.date,
      }));
    }
    return ACCREDITATIONS_PARALLAX_PRODUCTS;
  }, [orchestration]);

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

  const heroFrontCardX = rawHeroFrontCardX;
  const heroFrontCardRotate = rawHeroFrontCardRotate;
  const heroBackCardX = rawHeroBackCardX;
  const heroBackCardRotate = rawHeroBackCardRotate;
  const heroMiddleCardY = rawHeroMiddleCardY;
  const heroMiddleCardScale = rawHeroMiddleCardScale;



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

  const plaqueRotateX = rawPlaqueRotateX;
  const plaqueRotateY = rawPlaqueRotateY;
  const plaqueScale = rawPlaqueScale;

  // ========================================================
  // 3. Pathway Energy Beam Scroll Progress & Milestones Parallax
  // ========================================================
  const pipelineSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: pipelineProgress } = useScroll({
    target: pipelineSectionRef,
    offset: ["start end", "end start"],
  });
  const rawBeamHeight = useTransform(pipelineProgress, [0.1, 0.85], ["0%", "100%"]);
  const beamHeight = rawBeamHeight;

  const rawStaggerCol1 = useTransform(pipelineProgress, [0, 1], [30, -30]);
  const rawStaggerCol2 = useTransform(pipelineProgress, [0, 1], [-25, 25]);
  const staggerCol1 = rawStaggerCol1;
  const staggerCol2 = rawStaggerCol2;



  return (
    <AqeeqLuxuryPageShell
      header={<AlaqeeqStudioSiteHeader title="الاعتمادات والشراكات الدولية" active="accreditations" />}
      footer={<AlaqeeqStudioSiteFooter />}
      useCurtain={false}
      curtainKicker="✦ استكشف قاعة الاعتمادات ومراكز الاختبارات العالمية ✦"
      hero={
        <section
          ref={accreditationsHeroRef}
          className="relative isolate overflow-hidden flex flex-col justify-between pb-6 sm:pb-8 transition-colors duration-500 bg-transparent border-0 text-slate-900 dark:text-white"
        >
          {/* 3D Gliding Parallax Backdrop (Zero layout shift, unified height) */}
          <HeroParallaxBackdrop
            products={dynamicAccreditationsParallaxProducts}
            containerRef={accreditationsHeroRef}
            dark={dark}
            direction="right-to-left"
            cardShape="square"
          />



          <div className="relative mx-auto w-full max-w-[1380px] 2xl:max-w-[1560px] px-4 sm:px-6 md:px-8 py-6 sm:py-10 z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
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
                  defaultText="اعتمادات دولية مرموقة ومراكز اختبارات معتمدة."
                  as="h1"
                  className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.18] mb-6 ${
                    dark ? "text-white" : "text-black"
                  }`}
                >
                  {(text) => {
                    const raw = text || "اعتمادات دولية مرموقة ومراكز اختبارات معتمدة.";
                    const match = raw.match(/^(اعتمادات دولية مرموقة)(.*)$/);
                    if (match) {
                      return (
                        <>
                          <span className={`block ${dark ? "text-white" : "text-black"}`}>
                            {match[1].trim()}
                          </span>
                          <span className={`block ${isNationalDay ? "snd-text-gradient" : dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                            {match[2].trim()}
                          </span>
                        </>
                      );
                    }
                    const words = raw.trim().split(/\s+/);
                    if (words.length >= 4) {
                      const mid = Math.floor(words.length / 2);
                      return (
                        <>
                          <span className={`block ${dark ? "text-white" : "text-black"}`}>
                            {words.slice(0, mid).join(" ")}
                          </span>
                          <span className={`block ${isNationalDay ? "snd-text-gradient" : dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                            {words.slice(mid).join(" ")}
                          </span>
                        </>
                      );
                    }
                    return <span>{raw}</span>;
                  }}
                </VisualEditable>

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
                  style={{
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
                    className={`absolute bottom-[10%] right-[1%] top-[12%] w-[47%] rounded-[1.8rem] sm:rounded-[2.2rem] p-2 sm:p-3 border shadow-2xl overflow-hidden cursor-pointer transition-shadow duration-300 ${
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
                          <span className={`text-[9px] sm:text-[10px] font-mono font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                            SCORE: {(orchestration as any)?.accreditationsConfig?.cogniaScore || "99.2%"}
                          </span>
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
                          <span className="block text-sm sm:text-base font-black text-[#f8ca14]">
                            {(orchestration as any)?.accreditationsConfig?.cogniaScore || "99.2%"}
                          </span>
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
                    className={`absolute bottom-[2%] left-[1%] top-[3%] w-[49%] rounded-[1.8rem] sm:rounded-[2.2rem] p-2 sm:p-3 border shadow-2xl overflow-hidden cursor-pointer transition-shadow duration-300 ${
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
      <AqeeqScrollRevealSection scrollVh={70} neonLine={true} className="pt-8 sm:pt-10 pb-14 sm:pb-20">
        <section ref={hubSectionRef} id="cognia-section" className="w-full max-w-[1380px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 relative">
          <div className="mb-12 text-right">
            <div
              className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                dark ? "text-[#f8ca14]" : "text-[#c59b27]"
              } mb-2`}
            >
              <Award size={15} />
              <span>منظومة الاعتمادات ومراكز الاختبارات الدولية الرسمية</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              بوابة الاعتمادات الدولية ومراكز القياس بالمدينة المنورة
            </h2>
            <p className={`mt-3 text-sm sm:text-base ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
              مدارس العقيق ليست مجرد صرح تعليمي، بل مركز اختبارات دولي معتمد يخدم الطلاب والمجتمع في المدينة المنورة وفق أعلى
              معايير الجودة العالمية.
            </p>
          </div>

          {/* Unified Architectural Credentials Shell (Strict 1380px Ruler Alignment) */}
          <div
            className={`w-full rounded-[2.5rem] border p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-300 ${
              dark
                ? "border-white/10 bg-gradient-to-b from-[#0c141a]/98 via-[#091016]/98 to-[#060a0e]/98"
                : "border-slate-200/90 bg-white/95 shadow-xl"
            }`}
          >
            {/* Top Architectural Control Bar: Header Meta & Full-Width 4-Portal Switcher Grid */}
            <div
              className={`pb-5 mb-8 border-b flex flex-col gap-4 relative z-10 ${
                dark ? "border-white/10" : "border-slate-200"
              }`}
            >
              {/* Meta Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-[#f8ca14]/15 border border-[#f8ca14]/30 flex items-center justify-center text-[#f8ca14] shadow-sm">
                    <ShieldCheck size={19} />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#f8ca14]">
                        منظومة الاعتمادات الرسمية
                      </span>
                      <span className="h-2 w-2 rounded-full bg-[#f8ca14] animate-pulse" />
                    </div>
                    <span className={`text-xs font-bold block mt-0.5 ${dark ? "text-slate-300" : "text-slate-700"}`}>
                      4 مراكز دولية معتمدة بطيبة الطيبة
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-3 py-1.5 rounded-full border ${
                    dark ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-400" : "border-emerald-600/30 bg-emerald-50 text-emerald-900"
                  }`}>
                    تراخيص واعتمادات سارية ومحدثة 2026 ✦
                  </span>
                </div>
              </div>

              {/* Full-Width 4-Portal Interactive Switcher Grid */}
              <div
                className={`flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 rounded-2xl border shadow-inner w-full overflow-x-auto scrollbar-hide ${
                  dark ? "border-white/10 bg-black/40 backdrop-blur-md" : "border-slate-200 bg-slate-100/90"
                }`}
              >
                {[
                  { id: "cognia", label: "اعتماد كوجنيا الأمريكية", icon: ShieldCheck, badge: "USA 🇺🇸" },
                  { id: "ielts", label: "مركز اختبارات IELTS", icon: Globe2, badge: "IDP 🌐" },
                  { id: "sat", label: "مراكز SAT & ACT الرقمية", icon: BookOpenCheck, badge: "Digital" },
                  { id: "stem", label: "الروبوت والذكاء الاصطناعي", icon: Trophy, badge: "STEM 🏆" },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeHubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveHubTab(tab.id as any)}
                      className={`relative px-3 sm:px-3 py-2.5 sm:py-3 rounded-xl text-center transition-all duration-300 z-10 select-none flex items-center justify-center gap-2 shrink-0 sm:shrink min-w-[155px] sm:min-w-0 flex-1 ${
                        isActive
                          ? "text-white font-black"
                          : dark
                          ? "text-slate-400 hover:text-white hover:bg-white/5"
                          : "text-slate-600 hover:text-[#08467d] hover:bg-white/60"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeHubPortalPill"
                          className={`absolute inset-0 rounded-xl shadow-lg ${
                            dark
                              ? "bg-gradient-to-r from-[#08467d] to-[#042442] border border-[#f8ca14]/40"
                              : "bg-[#08467d] border border-[#f8ca14]/50 shadow-md"
                          }`}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                        <Icon size={16} className={`shrink-0 ${isActive ? "text-[#f8ca14]" : "text-slate-400"}`} />
                        <span className="text-xs sm:text-[13px] xl:text-sm font-black whitespace-nowrap">
                          {tab.label}
                        </span>
                        <span
                          className={`hidden xl:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
                            isActive
                              ? "bg-white/15 text-[#f8ca14] border-white/20"
                              : dark
                              ? "bg-white/5 text-slate-400 border-white/5"
                              : "bg-black/5 text-slate-600 border-black/5"
                          }`}
                        >
                          {tab.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Interactive Portal Showcase Content */}
            <div className="w-full relative z-10">
              <AnimatePresence mode="wait">
                {/* PORTAL 1: COGNIA USA */}
                {activeHubTab === "cognia" && (
                  <motion.div
                    key="cognia"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.32 }}
                    className="w-full"
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
                            : "border-slate-200 bg-white ring-1 ring-slate-100 shadow-xl"
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
                                <span className={`font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>{crit.score}</span>
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
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.32 }}
                  className="w-full"
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
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.32 }}
                  className="w-full"
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
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.32 }}
                  className="w-full"
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
                        dark ? "border-amber-500/30 bg-[#080d14]" : "border-slate-200 bg-white shadow-md ring-1 ring-slate-100"
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
                        dark ? "border-[#08467d]/40 bg-[#06182e]" : "border-slate-200 bg-white shadow-md ring-1 ring-slate-100"
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
                    <h5 className={`text-xs font-black mb-3 text-right ${dark ? "text-white" : "text-[#08467d]"}`}>
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
          className={`w-full max-w-[1380px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 relative z-10`}
        >
          <div className="mb-10 text-right">
            <div
              className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                dark ? "text-[#f8ca14]" : "text-[#08467d]"
              } mb-2`}
            >
              <GraduationCap size={16} />
              <span>طريق المستقبل السريع · محاكي مسارات القبول 2030</span>
            </div>
            <h3 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              خريطة عبور المستقبل: من مقاعد العقيق إلى هارفارد والبترول
            </h3>
            <p className={`text-xs sm:text-sm mt-3 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
              اختر وجهة طموح ابنك لتكتشف كيف تضمن له اعتمادات العقيق ومراكزها الدولية القبول الفوري وفق أعلى المعايير العالمية:
            </p>
          </div>

          {/* Unified Architectural Pipeline Shell (Strict 1380px Ruler) */}
          <div
            className={`w-full rounded-[2.5rem] border p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-300 ${
              dark
                ? "border-white/10 bg-gradient-to-b from-[#0c141a]/98 via-[#091016]/98 to-[#060a0e]/98"
                : "border-slate-200/90 bg-white/95 shadow-xl"
            }`}
          >
            {/* Top Architectural Control Bar: Meta & 3-Pathway Selector Grid */}
            <div
              className={`pb-6 mb-8 border-b flex flex-col gap-4 relative z-10 ${
                dark ? "border-white/10" : "border-slate-200"
              }`}
            >
              {/* Meta Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-[#f8ca14]/15 border border-[#f8ca14]/30 flex items-center justify-center text-[#f8ca14] shadow-sm">
                    <Compass size={19} />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#f8ca14]">
                        محاكي مسارات القبول الجامعي
                      </span>
                      <span className="h-2 w-2 rounded-full bg-[#f8ca14] animate-pulse" />
                    </div>
                    <span className={`text-xs font-bold block mt-0.5 ${dark ? "text-slate-300" : "text-slate-700"}`}>
                      وجهات نخبوية مضمونة لخريجي العقيق
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border ${
                    dark ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-400" : "border-emerald-600/30 bg-emerald-50 text-emerald-900"
                  }`}>
                    قبول مباشر وإعفاء من التحضيرية ✦
                  </span>
                </div>
              </div>

              {/* Full-Width 3-Pathway Switcher Grid */}
              <div
                className={`grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 rounded-2xl border shadow-inner w-full ${
                  dark ? "border-white/10 bg-black/40 backdrop-blur-md" : "border-slate-200 bg-slate-100/90"
                }`}
              >
                {[
                  { id: "saudi", label: "الجامعات السعودية", sub: "KFUPM & كاوست", badge: "السعودية 🇸🇦" },
                  { id: "scholarship", label: "برنامج الابتعاث", sub: "مسار الرواد", badge: "خادم الحرمين ✈️" },
                  { id: "global", label: "الجامعات الدولية", sub: "Harvard & Oxford", badge: "Ivy League 🌐" },
                ].map((p) => {
                  const isActive = activePathway === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePathway(p.id as any)}
                      className={`relative px-4 py-3 rounded-xl text-center transition-all duration-300 z-10 select-none flex items-center justify-between gap-2 w-full ${
                        isActive
                          ? "text-white font-black"
                          : dark
                          ? "text-slate-400 hover:text-white hover:bg-white/5"
                          : "text-slate-600 hover:text-[#08467d] hover:bg-white/60"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activePathwayPill"
                          className={`absolute inset-0 rounded-xl shadow-lg ${
                            dark
                              ? "bg-gradient-to-r from-[#08467d] to-[#042442] border border-[#f8ca14]/40"
                              : "bg-[#08467d] border border-[#f8ca14]/50 shadow-md"
                          }`}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <div className="relative z-10 text-right">
                        <span className="block text-xs sm:text-sm font-black">
                          {p.label}
                        </span>
                        <span className={`block text-[11px] font-bold mt-0.5 ${isActive ? "text-[#f8ca14]" : dark ? "text-slate-400" : "text-slate-500"}`}>
                          {p.sub}
                        </span>
                      </div>
                      <span
                        className={`relative z-10 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          isActive
                            ? "bg-white/15 text-[#f8ca14] border-white/20"
                            : dark
                            ? "bg-white/5 text-slate-400 border-white/5"
                            : "bg-black/5 text-slate-600 border-black/5"
                        }`}
                      >
                        {p.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Connected 4-Station Future Trajectory (Level Alignment) */}
            <div className="w-full relative z-10 mb-8">
              {/* Animated Connecting Track */}
              <div className="hidden lg:block absolute top-[44px] left-6 right-6 h-0.5 bg-slate-200 dark:bg-white/10 z-0">
                <motion.div
                  style={{ width: beamHeight }}
                  className="h-full bg-gradient-to-r from-[#08467d] via-[#f8ca14] to-[#f8ca14] shadow-[0_0_12px_rgba(248,202,20,0.8)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                {[
                  {
                    step: "01",
                    title: "مقاعد العقيق التأسيسية",
                    badge: "المعايير الدولية",
                    desc: "تأسيس لغوي وعلمي متقدم وفق معايير كوجنيا وروبوتات STEM المعتمدة.",
                    icon: Building2,
                    accent: "text-[#08467d] border-[#08467d]/30 bg-[#08467d]/10 dark:text-[#f8ca14] dark:border-[#f8ca14]/40 dark:bg-[#f8ca14]/10",
                  },
                  {
                    step: "02",
                    title: "شهادة Cognia & SAT",
                    badge: "الدبلومة المعتمدة",
                    desc: "اختبار الطالب داخل المدرسة والحصول على Band 7.5+ و 1400+ في SAT.",
                    icon: Award,
                    accent: "text-[#f8ca14] border-[#f8ca14]/40 bg-[#f8ca14]/10",
                  },
                  {
                    step: "03",
                    title: "ملف القبول والابتعاث",
                    badge: "مسار الرواد",
                    desc: "سيرة ذاتية متكاملة وساعات AP معتمدة تؤهل لمنحة خادم الحرمين الشريفين.",
                    icon: Compass,
                    accent: "text-[#08467d] border-[#08467d]/40 bg-[#08467d]/10 dark:text-[#f8ca14] dark:border-[#f8ca14]/30",
                  },
                  {
                    step: "04",
                    title: "هارفارد والبترول",
                    badge: "القبول النهائي",
                    desc: "القبول المباشر دون قيود، والإعفاء من السنة التحضيرية كقائد لرؤية 2030.",
                    icon: Trophy,
                    accent: "text-[#f8ca14] border-[#f8ca14]/50 bg-[#f8ca14]/15",
                  },
                ].map((station, sIdx) => {
                  const StationIcon = station.icon;
                  return (
                    <motion.div
                      key={sIdx}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className={`relative z-10 rounded-2xl border p-5 text-right backdrop-blur-xl shadow-md transition ${
                        dark
                          ? "border-white/10 bg-[#0c141a]/90 hover:border-white/20"
                          : "border-slate-200 bg-white hover:border-[#08467d]/30 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs font-black text-slate-400 dark:text-slate-500">STAGE {station.step}</span>
                        <div className={`grid h-9 w-9 place-items-center rounded-xl border ${station.accent}`}>
                          <StationIcon size={17} />
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#f8ca14] block mb-1">{station.badge}</span>
                      <h4 className={`text-sm sm:text-base font-black mb-1.5 ${dark ? "text-white" : "text-[#08467d]"}`}>{station.title}</h4>
                      <p className={`text-xs leading-relaxed font-medium ${dark ? "text-slate-300" : "text-slate-600"}`}>{station.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Destination Requirements Container */}
            <div
              className={`rounded-2xl border p-6 sm:p-8 relative overflow-hidden transition-all duration-300 ${
                dark
                  ? "border-[#f8ca14]/25 bg-black/40"
                  : "border-slate-200 bg-slate-50/80 shadow-sm"
              }`}
            >
              {activePathway === "saudi" && (
                <div className="space-y-4 text-right">
                  <h4 className={`text-lg sm:text-xl font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                    القبول في جامعة الملك فهد للبترول والمعادن (KFUPM)، كاوست (KAUST)، وجامعة الملك سعود:
                  </h4>
                  <p className={`text-xs sm:text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                    تشترط هذه الجامعات الرائدة درجات تنافسية عالية في اختبارات قياس (القدرات والتحصيلي) بالإضافة إلى اختبار
                    لغة إنجليزية معتمد (IELTS 6.0+ أو SAT Math 650+). توفر مدارس العقيق كل هذه الاختبارات والتأهيل داخل
                    أسوارها.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div
                      className={`p-4 rounded-xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>الآيلتس المباشر</span>
                      <span className={`font-black text-sm block ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>تحقيق Band 6.5 - 7.5</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-500 font-medium"}`}>اختبار الطالب داخل قاعات مدارسه المعتمدة</p>
                    </div>
                    <div
                      className={`p-4 rounded-xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>القدرات والتحصيلي</span>
                      <span className={`font-black text-sm block ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>معدلات 90+ و 95+</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-500 font-medium"}`}>برامج تدريب يومية متخصصة ومحاكاة دورية</p>
                    </div>
                    <div
                      className={`p-4 rounded-xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>السنة التحضيرية</span>
                      <span className={`font-black text-sm block ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>إعفاء واجتياز مباشر</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-500 font-medium"}`}>بفضل مناهج العلوم واللغات المتطورة</p>
                    </div>
                  </div>
                </div>
              )}

              {activePathway === "scholarship" && (
                <div className="space-y-4 text-right">
                  <h4 className={`text-lg sm:text-xl font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                    برنامج خادم الحرمين الشريفين للابتعاث (مسار الرواد لأفضل 30 جامعة بالعالم):
                  </h4>
                  <p className={`text-xs sm:text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                    يتطلب مسار الرواد قبولاً غير مشروط من كبرى الجامعات (مثل Harvard, MIT, Oxford, Stanford). بفضل اعتماد
                    كوجنيا ومراكز SAT و IELTS داخل العقيق، يحصل الطالب على ملف أكاديمي متكامل يطابق معايير القبول في رابطة
                    اللبلاب (Ivy League).
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div
                      className={`p-4 rounded-xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>شهادة كوجنيا الأمريكية</span>
                      <span className={`font-black text-sm block ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>High School Diploma</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-500 font-medium"}`}>معادلة ومقبولة فورياً عالمياً ومحلياً</p>
                    </div>
                    <div
                      className={`p-4 rounded-xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>اختبارات SAT الرسمية</span>
                      <span className={`font-black text-sm block ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>درجات تنافسية 1350+</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-500 font-medium"}`}>مركز الاختبارات الرسمي داخل المدرسة</p>
                    </div>
                    <div
                      className={`p-4 rounded-xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>الإرشاد الجامعي الدولي</span>
                      <span className={`font-black text-sm block ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>College Counseling</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-500 font-medium"}`}>خطابات توصية وسيرة ذاتية متكاملة للمنح</p>
                    </div>
                  </div>
                </div>
              )}

              {activePathway === "global" && (
                <div className="space-y-4 text-right">
                  <h4 className={`text-lg sm:text-xl font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                    كليات الطب والعلوم والهندسة في بريطانيا، كندا، وأمريكا ودول الخليج:
                  </h4>
                  <p className={`text-xs sm:text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                    توفر مدارس العقيق مسارات نوعية للمواد العلمية والإنجليزية المكثفة مع إمكانية احتساب الساعات الجامعية
                    المعتمدة (AP Courses)، مما يوفر على الطالب سنة دراسية كاملة ويسرع انطلاقه في المجال الطبي والهندسي.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div
                      className={`p-4 rounded-xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>ساعات AP المعتمدة</span>
                      <span className={`font-black text-sm block ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>Advanced Placement</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-500 font-medium"}`}>معادلة مقررات الجامعة المبكرة وتوفير سنة</p>
                    </div>
                    <div
                      className={`p-4 rounded-xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>المعامل والبحث العلمي</span>
                      <span className={`font-black text-sm block ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>STEM Research</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-500 font-medium"}`}>تجارب معملية وبحوث موثقة تنمي الابتكار</p>
                    </div>
                    <div
                      className={`p-4 rounded-xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"
                      }`}
                    >
                      <span className={`block text-xs font-bold mb-1 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>اللغة الإنجليزية التخصصية</span>
                      <span className={`font-black text-sm block ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>Academic Fluency</span>
                      <p className={`text-[11px] mt-1 ${dark ? "text-slate-400" : "text-slate-500 font-medium"}`}>طلاقة كاملة في المصطلحات الطبية والهندسية</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </AqeeqScrollRevealSection>

      {/* ========================================================
          STAGE 4: FAQ (الأسئلة الشائعة حول مراكز الاختبارات والاعتمادات)
          مغلفة بـ AqeeqScrollRevealSection لترتفع كستارة ثالثة
      ======================================================== */}
      <AqeeqScrollRevealSection scrollVh={60} neonLine={true} className="py-14 sm:py-20">
        {/* Interactive FAQ Accordion */}
        <div className="w-full max-w-[1380px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8">
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
