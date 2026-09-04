import { useState, useRef } from "react";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { AqeeqLuxuryPageShell } from "@/components/AqeeqLuxuryPageShell";
import { AqeeqGrandFinaleCta } from "@/components/AqeeqGrandFinaleCta";
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
  Cpu,
  Brain,
  Globe2,
  FileCheck2,
  BookOpenCheck,
  Trophy,
  Microscope,
  Compass,
  ArrowRight,
  Send,
  Calendar,
  Clock,
  ChevronDown,
  Check,
  GraduationCap,
  Laptop,
  Headphones,
  Building2,
  HelpCircle,
  Zap,
  Target,
  CheckCheck,
  ArrowUpRight,
  Layers,
  MapPin,
  Phone,
} from "lucide-react";

export default function AqeeqSchoolAccreditationsPage() {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [, navigate] = useLocation();

  // Interactive Tab States
  const [activeHubTab, setActiveHubTab] = useState<"cognia" | "ielts" | "sat" | "stem">("cognia");
  const [activePathway, setActivePathway] = useState<"saudi" | "scholarship" | "global">("saudi");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive Parent Readiness Scanner State
  const [scannerGrade, setScannerGrade] = useState<"primary" | "middle" | "high">("high");
  const [scannerGoal, setScannerGoal] = useState<"stem" | "medicine" | "business">("stem");

  // Scroll Animations Refs & Hooks
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroSectionRef,
    offset: ["start start", "end start"],
  });
  const rawSealRotateY = useTransform(heroProgress, [0, 1], [0, 22]);
  const rawSealRotateX = useTransform(heroProgress, [0, 1], [0, -14]);
  const rawSealScale = useTransform(heroProgress, [0, 1], [1, 0.92]);
  const rawSealY = useTransform(heroProgress, [0, 1], [0, 50]);

  const sealRotateY = useSpring(rawSealRotateY, { stiffness: 90, damping: 22 });
  const sealRotateX = useSpring(rawSealRotateX, { stiffness: 90, damping: 22 });
  const sealScale = useSpring(rawSealScale, { stiffness: 90, damping: 22 });
  const sealY = useSpring(rawSealY, { stiffness: 90, damping: 22 });

  // Hub Parallax
  const hubSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: hubProgress } = useScroll({
    target: hubSectionRef,
    offset: ["start end", "end start"],
  });
  const rawHubParallaxY = useTransform(hubProgress, [0, 1], [40, -40]);
  const hubParallaxY = useSpring(rawHubParallaxY, { stiffness: 85, damping: 20 });

  // Pathway Energy Beam Scroll Progress
  const pipelineSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: pipelineProgress } = useScroll({
    target: pipelineSectionRef,
    offset: ["start end", "end start"],
  });
  const rawBeamHeight = useTransform(pipelineProgress, [0.1, 0.85], ["0%", "100%"]);
  const beamHeight = useSpring(rawBeamHeight, { stiffness: 100, damping: 24 });

  return (
    <AqeeqLuxuryPageShell
      header={<AlaqeeqStudioSiteHeader title="الاعتمادات والشراكات الدولية" active="accreditations" />}
      footer={<AlaqeeqStudioSiteFooter />}
      useCurtain={true}
      curtainKicker="✦ استكشف قاعة الاعتمادات ومراكز الاختبارات العالمية ✦"
      hero={
        <section
          ref={heroSectionRef}
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
                        : "border-[#005A36]/30 bg-emerald-50 text-[#005A36]"
                      : dark
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-emerald-700/25 bg-white/95 text-[#015a37]"
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

              {/* Left Column: 3D Holographic Crest & Floating Seals (5 cols) */}
              <div className="lg:col-span-5 relative">
                <motion.div
                  style={{
                    perspective: 1200,
                    rotateY: sealRotateY,
                    rotateX: sealRotateX,
                    scale: sealScale,
                    y: sealY,
                  }}
                  className="relative space-y-4"
                >
                  {/* Card 1: FIRST LEGO League National Champion with Holographic Gold Trim */}
                  <div
                    className={`group relative rounded-[2.2rem] p-3 border transition duration-500 hover:scale-[1.02] shadow-2xl overflow-hidden ${
                      dark
                        ? "border-amber-500/35 bg-[#0b1218]/95 shadow-black/90 ring-1 ring-amber-500/25"
                        : "border-amber-600/30 bg-white shadow-amber-950/15 ring-1 ring-amber-600/20"
                    }`}
                  >
                    <div className="relative overflow-hidden rounded-[1.8rem] aspect-[16/9]">
                      <VisualImage
                        id="accreditations-hero-fll-photo"
                        label="صورة أبطال العقيق - كأس بطولة فيرست ليجو بالمملكة"
                        src="/covers/first-lego-champions.png"
                        alt="أبطال مدارس العقيق مع كأس بطولة فيرست ليجو FIRST LEGO League بالمملكة"
                        className="h-full w-full object-cover object-[center_12%] transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                      {/* Top Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/85 border border-amber-400/50 px-3.5 py-1 text-xs font-black text-amber-300 shadow-lg backdrop-blur-md">
                        <Trophy size={14} className="text-[#f8ca14]" />
                        <span>بطل المملكة 🇸🇦 المركز الأول</span>
                      </div>

                      {/* Bottom Details */}
                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white">
                        <div className="text-right">
                          <h4 className="text-sm font-black drop-shadow-md">بطولة FIRST LEGO League بالمملكة</h4>
                          <p className="text-[11px] text-amber-200/90 drop-shadow-md">
                            تتويج أبطال مدارس العقيق بكأس البطولة الوطنية 🏆
                          </p>
                        </div>
                        <span className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black px-3 py-1 text-xs shadow-md shrink-0">
                          المركز 1 🥇
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: WRO World Robot Olympiad */}
                  <div
                    className={`group relative rounded-[2.2rem] p-3 border transition duration-500 hover:scale-[1.02] shadow-2xl overflow-hidden ${
                      dark
                        ? "border-emerald-500/30 bg-[#0b1218]/95 shadow-black/90 ring-1 ring-emerald-500/20"
                        : "border-emerald-950/15 bg-white shadow-emerald-950/15 ring-1 ring-emerald-900/10"
                    }`}
                  >
                    <div className="relative overflow-hidden rounded-[1.8rem] aspect-[16/9]">
                      <VisualImage
                        id="accreditations-hero-wro-photo"
                        label="صورة طلاب العقيق في أولمبياد الروبوت العالمي WRO"
                        src="/covers/student-robotics-accreditations.jpg"
                        alt="طلاب مدارس العقيق في منافسات أولمبياد الروبوت الدولي WRO"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                      {/* Top Badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/85 border border-cyan-400/50 px-3.5 py-1 text-xs font-black text-cyan-300 shadow-lg backdrop-blur-md">
                        <Award size={14} className="text-cyan-300" />
                        <span>خامس العالم 🌐 منافسة 80 دولة</span>
                      </div>

                      {/* Bottom Details */}
                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white">
                        <div className="text-right">
                          <h4 className="text-sm font-black drop-shadow-md">أولمبياد الروبوت العالمي (WRO)</h4>
                          <p className="text-[11px] text-emerald-300 drop-shadow-md">
                            تمثيل المملكة والمنافسة بين أكثر من 80 دولة 🇸🇦
                          </p>
                        </div>
                        <span className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-3 py-1 text-xs shadow-md shrink-0">
                          Top 5 🏆
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Trust Crest Badge */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 shadow-xl backdrop-blur-xl ${
                      dark
                        ? "border-emerald-500/30 bg-black/80 text-slate-200"
                        : "border-emerald-950/15 bg-white/95 text-slate-800"
                    }`}
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-500">
                      <ShieldCheck size={24} />
                    </div>
                    <div className="text-right flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-black">مقرات رسمية معتمدة بالمدينة المنورة</h5>
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        قاعات حاسوبية عازلة للصوت مجهزة لاختبارات IDP IELTS & SAT & ACT
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      }
    >
      {/* ========================================================
          STAGE 2: 3D CREDENTIALS PAVILION (قاعة الاعتمادات والمراكز الدولية)
      ======================================================== */}
      <section ref={hubSectionRef} id="cognia-section" className="py-20 container mx-auto px-4 sm:px-6 relative">
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
                { id: "cognia", label: "اعتماد كوجنيا الأمريكية", icon: ShieldCheck, badge: "USA 🇺🇸" },
                { id: "ielts", label: "مركز اختبارات IELTS", icon: Globe2, badge: "IDP 🌐" },
                { id: "sat", label: "مراكز SAT & ACT الرقمية", icon: BookOpenCheck, badge: "Code #68412" },
                { id: "stem", label: "الروبوت والذكاء الاصطناعي", icon: Trophy, badge: "بطل المملكة 🏆" },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeHubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveHubTab(tab.id as any)}
                    className={`relative flex flex-col items-center justify-center gap-1 rounded-xl py-3 px-2 text-center text-xs font-black transition active:scale-95 ${
                      isActive
                        ? "text-white"
                        : dark
                        ? "text-slate-400 hover:text-white hover:bg-white/5"
                        : "text-slate-700 hover:text-[#015a37] hover:bg-slate-50"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeHubPortalPill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#015a37] to-emerald-700 shadow-md ring-1 ring-[#f8ca14]/40"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-1.5">
                      <Icon size={16} className={isActive ? "text-[#f8ca14]" : "text-slate-400"} />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    <span
                      className={`relative z-10 text-[10px] font-bold ${
                        isActive ? "text-emerald-200" : "text-slate-500"
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

        {/* Dynamic Interactive Portal Showcase */}
        <motion.div style={{ y: hubParallaxY }} className="max-w-6xl mx-auto">
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
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 px-3.5 py-1.5 text-xs font-black text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck size={16} />
                        <span>اعتماد أكاديمي مؤسسي رسمي</span>
                      </span>
                      <span className={`text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"}`}>
                        ترخيص دولي: COGNIA-USA-2026
                      </span>
                    </div>

                    <h3 className={`text-2xl sm:text-3xl font-black mb-4 ${dark ? "text-white" : "text-[#0a192f]"}`}>
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
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
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

                  {/* Cognia Scorecard & Radar Display */}
                  <div className="lg:col-span-5">
                    <div
                      className={`rounded-3xl border p-6 sm:p-8 shadow-2xl relative overflow-hidden ${
                        dark
                          ? "border-emerald-500/40 bg-black/70 ring-1 ring-emerald-500/30"
                          : "border-emerald-950/15 bg-[#fbfaf8] ring-1 ring-emerald-900/10"
                      }`}
                    >
                      {/* Laser Scan Sweep Line */}
                      <motion.div
                        animate={{ y: [0, 220, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="pointer-events-none absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-40 blur-xs"
                      />

                      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2.5 rounded-xl shadow-sm border border-black/5">
                            <img
                              src="https://aqeeq.edu.sa/web/image/1901-f0d65949/Cognia-glossy-logo-800x800-1.png"
                              alt="شعار اعتماد كوجنيا"
                              className="h-10 w-auto object-contain"
                            />
                          </div>
                          <div className="text-right">
                            <h5 className="font-black text-xs">بطاقة تقييم الجودة الأكاديمية</h5>
                            <p className="text-[10px] text-slate-500">Cognia Performance Scorecard</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-black text-emerald-400 border border-emerald-500/30">
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
                              <span>{crit.title}</span>
                              <span className="text-emerald-400 font-black">{crit.score}</span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: crit.score }}
                                transition={{ duration: 0.8, delay: cIdx * 0.15 }}
                                className="h-full bg-gradient-to-r from-[#015a37] to-emerald-400 rounded-full shadow-md"
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
                  </div>
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

                  {/* IELTS Upcoming Live Sessions Schedule */}
                  <div className="lg:col-span-5">
                    <div
                      className={`rounded-3xl border p-6 sm:p-8 shadow-2xl ${
                        dark ? "border-blue-500/35 bg-black/70" : "border-blue-950/15 bg-[#f8fafd]"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={18} className="text-blue-400" />
                          <h5 className="font-black text-xs text-white">مواعيد الاختبارات القادمة (IELTS on Computer)</h5>
                        </div>
                        <span className="text-[10px] font-black text-blue-400 bg-blue-500/15 px-2.5 py-0.5 rounded-full border border-blue-500/30">
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
                            statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
                          },
                          {
                            date: "الأربعاء، 16 سبتمبر 2026",
                            time: "01:30 ظهراً",
                            hall: "معمل الحاسوب (B)",
                            seats: "متبقي 4 مقاعد",
                            statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
                          },
                          {
                            date: "السبت، 19 سبتمبر 2026",
                            time: "09:00 صباحاً",
                            hall: "معمل الحاسوب (A)",
                            seats: "متاح الحجز",
                            statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
                          },
                          {
                            date: "الأربعاء، 23 سبتمبر 2026",
                            time: "01:30 ظهراً",
                            hall: "معمل الحاسوب (B)",
                            seats: "متاح الحجز",
                            statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
                          },
                        ].map((session, sIdx) => (
                          <div
                            key={sIdx}
                            className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition ${
                              dark
                                ? "border-white/10 bg-white/5 hover:border-blue-400/40"
                                : "border-slate-200 bg-white hover:border-blue-400"
                            }`}
                          >
                            <div className="text-right">
                              <p className="font-black text-[12px] text-white">{session.date}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
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
                  </div>
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
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/15 px-3 py-1 text-xs font-black text-rose-400 border border-rose-500/30">
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
                          <CheckCircle2 size={15} className="text-rose-500" /> بيئة اختبارات دولية بمواصفات قياسية
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={15} className="text-rose-500" /> مشرفون ومراقبون معتمدون دولياً
                        </div>
                      </div>
                    </div>

                    <a
                      href="https://global.act.org/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-5 py-3 text-xs font-black transition shadow"
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
                {/* Header */}
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

                {/* Dual Championship Showcase Cards */}
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
                      dark ? "border-cyan-500/30 bg-[#080d14]" : "border-cyan-700/20 bg-[#f7fbff]"
                    }`}
                  >
                    <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-4 border border-black/10">
                      <img
                        src="/covers/student-robotics-accreditations.jpg"
                        alt="طلاب مدارس العقيق في أولمبياد الروبوت العالمي WRO"
                        className="h-full w-full object-cover transition duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/85 border border-cyan-400/40 px-3 py-1 text-xs font-black text-cyan-300 shadow-md">
                        <Award size={12} className="text-cyan-300" />
                        <span>خامس العالم 🏆</span>
                      </div>
                      <div className="absolute bottom-3 right-3 left-3 text-white text-right">
                        <span className="text-[10px] font-black text-cyan-300">WRO INTERNATIONAL</span>
                        <h4 className="text-sm font-black drop-shadow">أولمبياد الروبوت العالمي (WRO)</h4>
                      </div>
                    </div>

                    <h4 className={`text-base font-black mb-2 text-right ${dark ? "text-cyan-300" : "text-cyan-800"}`}>
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
                      <span className="rounded-xl px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                        المركز الخامس عالمياً 🌐
                      </span>
                      <span className="rounded-xl px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
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
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span className={dark ? "text-slate-200" : "text-slate-800 font-bold"}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ========================================================
          STAGE 3: THE 3D HYPER-TRACK CAREER PIPELINE (طريق المستقبل هارفارد - البترول 2030)
      ======================================================== */}
      <section
        ref={pipelineSectionRef}
        className={`py-24 border-y relative overflow-hidden ${
          dark ? "border-white/10 bg-[#05090e]" : "border-emerald-950/10 bg-[#f5f8f5]"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
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
                  { id: "saudi", label: "الجامعات السعودية 🇸🇦", sub: "KFUPM & كاوست" },
                  { id: "scholarship", label: "برنامج الابتعاث ✈️", sub: "مسار الرواد" },
                  { id: "global", label: "الجامعات الدولية 🌐", sub: "Harvard & Oxford" },
                ].map((p) => {
                  const isActive = activePathway === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePathway(p.id as any)}
                      className={`relative rounded-xl py-2.5 px-2 text-xs font-black transition active:scale-95 text-center ${
                        isActive
                          ? "text-white"
                          : dark
                          ? "text-slate-400 hover:text-white hover:bg-white/5"
                          : "text-slate-700 hover:text-[#015a37] hover:bg-slate-50"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activePathwayPill"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#015a37] to-emerald-700 shadow-md ring-1 ring-[#f8ca14]/30"
                          transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        />
                      )}
                      <span className="relative z-10 block truncate">{p.label}</span>
                      <span
                        className={`relative z-10 block text-[10px] mt-0.5 truncate ${
                          isActive ? "text-emerald-200" : "text-slate-500"
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

          {/* Connected 4-Station Visual Future Pipeline */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Animated Connecting Energy Beam (Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 z-0">
                <motion.div
                  style={{ width: beamHeight }}
                  className="h-full bg-gradient-to-r from-[#015a37] via-emerald-400 to-[#f8ca14] shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                />
              </div>

              {[
                {
                  step: "01",
                  title: "مقاعد العقيق التأسيسية",
                  badge: "المعايير الدولية",
                  desc: "تأسيس لغوي وعلمي متقدم وفق معايير كوجنيا وروبوتات STEM المعتمدة.",
                  icon: Building2,
                  accent: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
                },
                {
                  step: "02",
                  title: "شهادة Cognia & SAT",
                  badge: "الدبلومة المعتمدة",
                  desc: "اختبار الطالب داخل المدرسة والحصول على Band 7.5+ و 1400+ في SAT.",
                  icon: Award,
                  accent: "text-amber-400 border-amber-500/40 bg-amber-950/40",
                },
                {
                  step: "03",
                  title: "ملف القبول والابتعاث",
                  badge: "مسار الرواد",
                  desc: "سيرة ذاتية متكاملة وساعات AP معتمدة تؤهل لمنحة خادم الحرمين الشريفين.",
                  icon: Compass,
                  accent: "text-cyan-400 border-cyan-500/40 bg-cyan-950/40",
                },
                {
                  step: "04",
                  title: "هارفارد والبترول",
                  badge: "القبول النهائي",
                  desc: "القبول المباشر دون قيود، والإعفاء من السنة التحضيرية كقائد لرؤية 2030.",
                  icon: Trophy,
                  accent: "text-[#f8ca14] border-[#f8ca14]/50 bg-yellow-950/40",
                },
              ].map((station, sIdx) => {
                const StationIcon = station.icon;
                return (
                  <motion.div
                    key={sIdx}
                    whileHover={{ y: -6 }}
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
                    <span className="text-[10px] font-bold text-emerald-400 block mb-1">{station.badge}</span>
                    <h4 className="text-base font-black text-white mb-2">{station.title}</h4>
                    <p className="text-xs leading-relaxed text-slate-300 font-medium">{station.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Pathway Detail Card */}
            <div
              className={`mt-10 rounded-3xl border p-8 sm:p-10 shadow-2xl relative overflow-hidden ${
                dark
                  ? "border-emerald-500/30 bg-gradient-to-b from-[#0c161d] to-[#080d12]"
                  : "border-emerald-700/20 bg-white shadow-xl"
              }`}
            >
              {activePathway === "saudi" && (
                <div className="space-y-4 text-right">
                  <h4 className={`text-xl font-black ${dark ? "text-[#f8ca14]" : "text-[#015a37]"}`}>
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
                      <span className="block text-xs text-slate-400 font-bold mb-1">الآيلتس المباشر</span>
                      <span className="font-black text-sm text-emerald-400">تحقيق Band 6.5 - 7.5</span>
                      <p className="text-[11px] text-slate-400 mt-1">اختبار الطالب داخل قاعات مدارسه المعتمدة</p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className="block text-xs text-slate-400 font-bold mb-1">القدرات والتحصيلي</span>
                      <span className="font-black text-sm text-emerald-400">معدلات 90+ و 95+</span>
                      <p className="text-[11px] text-slate-400 mt-1">برامج تدريب يومية متخصصة ومحاكاة دورية</p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className="block text-xs text-slate-400 font-bold mb-1">السنة التحضيرية</span>
                      <span className="font-black text-sm text-emerald-400">إعفاء واجتياز مباشر</span>
                      <p className="text-[11px] text-slate-400 mt-1">بفضل مناهج العلوم واللغات المتطورة</p>
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
                      <span className="block text-xs text-slate-400 font-bold mb-1">شهادة كوجنيا الأمريكية</span>
                      <span className="font-black text-sm text-amber-400">High School Diploma</span>
                      <p className="text-[11px] text-slate-400 mt-1">معادلة ومقبولة فورياً عالمياً ومحلياً</p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className="block text-xs text-slate-400 font-bold mb-1">اختبارات SAT الرسمية</span>
                      <span className="font-black text-sm text-amber-400">درجات تنافسية 1350+</span>
                      <p className="text-[11px] text-slate-400 mt-1">مركز الاختبارات الرسمي داخل المدرسة</p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className="block text-xs text-slate-400 font-bold mb-1">الإرشاد الجامعي الدولي</span>
                      <span className="font-black text-sm text-amber-400">College Counseling</span>
                      <p className="text-[11px] text-slate-400 mt-1">خطابات توصية وسيرة ذاتية متكاملة للمنح</p>
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
                      <span className="block text-xs text-slate-400 font-bold mb-1">ساعات AP المعتمدة</span>
                      <span className="font-black text-sm text-blue-400">Advanced Placement</span>
                      <p className="text-[11px] text-slate-400 mt-1">معادلة مقررات الجامعة المبكرة وتوفير سنة</p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className="block text-xs text-slate-400 font-bold mb-1">المعامل والبحث العلمي</span>
                      <span className="font-black text-sm text-blue-400">STEM Research</span>
                      <p className="text-[11px] text-slate-400 mt-1">تجارب معملية وبحوث موثقة تنمي الابتكار</p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl border ${
                        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className="block text-xs text-slate-400 font-bold mb-1">اللغة الإنجليزية التخصصية</span>
                      <span className="font-black text-sm text-blue-400">Academic Fluency</span>
                      <p className="text-[11px] text-slate-400 mt-1">طلاقة كاملة في المصطلحات الطبية والهندسية</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          STAGE 4: INTERACTIVE PARENT READINESS SCANNER (رادار قياس مسار ابنك لولي الأمر)
      ======================================================== */}
      <section className="py-20 container mx-auto px-4 sm:px-6">
        <div
          className={`max-w-4xl mx-auto rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl relative overflow-hidden ${
            dark
              ? "border-emerald-500/30 bg-gradient-to-b from-[#081218] to-[#04080c]"
              : "border-emerald-700/20 bg-white shadow-xl"
          }`}
        >
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-black text-emerald-400 mb-2">
              <Sparkles size={14} />
              <span>مستشار الاعتمادات التفاعلي لولي الأمر</span>
            </div>
            <h3 className={`text-xl sm:text-3xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              رادار جاهزية ابنك: اكتشف خارطة اعتماداته المخصصة 🎯
            </h3>
            <p className={`text-xs sm:text-sm mt-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>
              حدد مرحلة ابنك وطموحه المستقبلي لنعرض لك المسار التدريبي والشهادات التي سيحصدها داخل المدارس:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-right">
            {/* Step 1: Select Grade */}
            <div>
              <label className="block text-xs font-black text-slate-300 mb-2">المرحلة الدراسية الحالية:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "primary", label: "الابتدائية 🧸" },
                  { id: "middle", label: "المتوسطة 🎒" },
                  { id: "high", label: "الثانوية 🎓" },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setScannerGrade(g.id as any)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black border transition ${
                      scannerGrade === g.id
                        ? "border-[#f8ca14] bg-[#f8ca14]/15 text-[#f8ca14] shadow"
                        : "border-white/10 bg-black/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Goal */}
            <div>
              <label className="block text-xs font-black text-slate-300 mb-2">الطموح الجامعي والمهني:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "stem", label: "هندسة وذكاء اصطناعي 🤖" },
                  { id: "medicine", label: "طب وعلوم صحية 🩺" },
                  { id: "business", label: "قيادة وأعمال 🏛️" },
                ].map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setScannerGoal(goal.id as any)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black border transition ${
                      scannerGoal === goal.id
                        ? "border-emerald-400 bg-emerald-500/15 text-emerald-400 shadow"
                        : "border-white/10 bg-black/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Radar Results Box */}
          <div className="rounded-2xl border border-emerald-500/30 bg-black/60 p-6 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="text-xs font-black text-[#f8ca14] flex items-center gap-1.5">
                <CheckCheck size={16} />
                خارطة الاعتمادات والتأهيل المقترحة لابنك في مدارس العقيق:
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                READY TO ENROLL
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                <span className="text-[10px] text-slate-400 block font-bold">الشهادة الأساسية</span>
                <span className="text-xs font-black text-white block mt-0.5">
                  {scannerGrade === "high"
                    ? "دبلومة كوجنيا الأمريكية + الثانوية العامة"
                    : "شهادة التأسيس الدولي المعتمد من كوجنيا"}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                <span className="text-[10px] text-slate-400 block font-bold">الاختبارات داخل المدرسة</span>
                <span className="text-xs font-black text-white block mt-0.5">
                  {scannerGoal === "stem" ? "اختبار Digital SAT + IELTS IDP" : "اختبار IELTS IDP + تدريب القدرات"}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                <span className="text-[10px] text-slate-400 block font-bold">الميزة التنافسية</span>
                <span className="text-xs font-black text-[#f8ca14] block mt-0.5">
                  {scannerGrade === "high"
                    ? "إعفاء من السنة التحضيرية بالجامعة"
                    : "التأهل لبطولات الروبوت الوطنية والدولية"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-slate-400">
                💡 يستفيد طلاب العقيق من تخفيضات خاصة وورش عمل مجانية لجميع الاختبارات الدولية.
              </p>
              <Button
                onClick={() => navigate("/admissions")}
                className="bg-[#015a37] hover:bg-emerald-800 text-white text-xs font-black rounded-xl px-5 py-2 shadow"
              >
                حجز مقعد دراسي ✦
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          STAGE 5: INTERACTIVE FAQ ACCORDION (الأسئلة الشائعة)
      ======================================================== */}
      <section className="py-20 container mx-auto px-4 sm:px-6">
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
                  dark ? "border-white/10 bg-[#0c1218]" : "border-emerald-950/10 bg-white shadow-sm"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === fIdx ? null : fIdx)}
                  className="w-full p-5 text-right font-black text-sm flex items-center justify-between gap-4"
                >
                  <span className={dark ? "text-white" : "text-[#0a192f]"}>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-emerald-500 transition duration-300 ${
                      openFaqIndex === fIdx ? "rotate-180" : ""
                    }`}
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
      </section>

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
