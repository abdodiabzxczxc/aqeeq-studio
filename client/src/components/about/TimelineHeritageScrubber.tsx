import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Milestone,
  ChevronRight,
  ChevronLeft,
  Award,
  GraduationCap,
  Building2,
  TrendingUp,
  Clock,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { AqeeqSectionHeader } from "@/components/AqeeqSectionHeader";

export interface TimelineEra {
  year: string;
  shortYear: string;
  label: string;
  title: string;
  desc: string;
  highlight: string;
  stats: string;
  image: string;
  quote: string;
  leap: { from: string; to: string };
  metrics: { label: string; val: string }[];
}

export const TIMELINE_ERAS: TimelineEra[] = [
  {
    year: "1994 م — 1415 هـ",
    shortYear: "1994",
    label: "التأسيس والانطلاقة",
    title: "غراس البدايات وتأسيس أول مجمع تعليمي بالمدينة المنورة",
    desc: "انطلقت مدارس العقيق برؤية واضحة لتكون نموذجاً تعليمياً وتربوياً فريداً بطيبة الطيبة. بدأت المدارس بتأسيس المراحل التأسيسية وتخريج أجيال متمكنة في القرآن الكريم واللغة والعلوم، وتكريس منظومة القيم الأخلاقية الأصيلة في نفوس الطلاب.",
    highlight: "نواة التميز والانطلاقة الأولى بطيبة الطيبة",
    stats: "أكثر من 30 دفعة تخرجت منذ التأسيس",
    image: "/covers/student-excellence-about.jpg",
    quote: "ثلاثون عاماً من غراس الخير في طيبة الطيبة، خرّجت أجيالاً تقود الحاضر وتصنع المستقبل.",
    leap: {
      from: "البدايات الأولى في المدينة",
      to: "تأسيس أول صرح تعليمي رائد بطيبة الطيبة",
    },
    metrics: [
      { label: "سنة التأسيس", val: "1415 هـ / 1994 م" },
      { label: "الدفعة الأولى", val: "أول صرح متكامل" },
      { label: "الموقع الأصلي", val: "المدينة المنورة" },
    ],
  },
  {
    year: "2010 م — 1431 هـ",
    shortYear: "2010",
    label: "المجمعات والمسابح",
    title: "تدشين المجمعات الكبرى والمسابح الأولمبية والملاعب المغطاة",
    desc: "شهدت هذه المرحلة نقلة نوعية كبرى بافتتاح مجمع البنين الشامل ومجمع البنات في حي الرانوناء بمحاذاة ممشى الهجرة، بتجهيزات مدرسية نموذجية شملت المسابح شبه الأولمبية المغطاة، الصالات الرياضية المغلقة، وقاعات المعامل الذكية.",
    highlight: "مجمعات صرحية مستقلة بمواصفات هندسية قياسية",
    stats: "طاقة استيعابية تتجاوز 10,000 طالب وطالبة",
    image: "/covers/student-lab-admissions.jpg",
    quote: "صروح معمارية مستقلة صُممت لتكون بيئة حياة ونمو متكامل للطالب فكرياً وبدنياً.",
    leap: {
      from: "المباني التعليمية الأولى",
      to: "صروح مستقلة 25,000م² ومسابح شبه أولمبية",
    },
    metrics: [
      { label: "المساحة الإنشائية", val: "25,000م² نموذجية" },
      { label: "المسابح المغطاة", val: "معايير FINA الدولية" },
      { label: "الصالات", val: "ملاعب ومسارح مغلقة" },
    ],
  },
  {
    year: "2018 م — 1439 هـ",
    shortYear: "2018",
    label: "اعتماد كوجنيا (Cognia)",
    title: "الاعتماد الأكاديمي الأمريكي من منظمة كوجنيا (Cognia USA)",
    desc: "توجت مسيرة الجودة بحصول مدارس العقيق على الاعتماد الدولي الأمريكي من كوجنيا، ليصبح خريجو المدارس مؤهلين للحصول على شهادة الدبلومة الأمريكية المعتمدة دولياً، بالتزامن مع إطلاق نوادي وأكاديميات الروبوت والابتكار المتقدمة.",
    highlight: "الريادة في التعليم الدولي والحوكمة الأكاديمية",
    stats: "تقييم جودة معتمد عالمياً بنسبة تفوق 98%",
    image: "/covers/cover-accreditations.jpg",
    quote: "شهادة عالمية تؤكد أن ما نقدمه لأبنائنا يضاهي أرقى المعايير التعليمية في العالم.",
    leap: {
      from: "الريادة المحلية",
      to: "الاعتماد الدولي الأمريكي (Cognia USA)",
    },
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
    desc: "العصر الرقمي والريادة العالمية: اعتماد مدارس العقيق كمركز رسمي لاختبارات IELTS IDP و SAT بالمدينة المنورة، مع تتويج الطلاب بالمركز الخامس عالمياً في أولمبياد الروبوت WRO، وتكامل المناهج مع الذكاء الاصطناعي والتحول الرقمي المتوافق 100% مع رؤية 2030.",
    highlight: "مركز اختبارات دولي معتمد وحضور عالمي في الـ AI",
    stats: "المركز الخامس عالمياً في أولمبياد الروبوت الدولي WRO",
    image: "/covers/first-lego-champions.png",
    quote: "من طيبة الطيبة إلى منصات التتويج العالمية، أبناؤنا ينافسون ويحصدون المراكز الأولى دولياً.",
    leap: {
      from: "التعليم التفاعلي الذكي",
      to: "مراكز IELTS و SAT الرسمية والخامس عالمياً WRO",
    },
    metrics: [
      { label: "مراكز الاختبارات", val: "IDP IELTS & SAT Official" },
      { label: "أولمبياد الروبوت", val: "الخامس عالمياً WRO" },
      { label: "الرؤية المستقبلية", val: "رؤية السعودية 2030" },
    ],
  },
];

interface TimelineHeritageScrubberProps {
  dark?: boolean;
}

export function TimelineHeritageScrubber({ dark = true }: TimelineHeritageScrubberProps) {
  const [activeIndex, setActiveIndex] = useState<number>(3);
  const activeEra = TIMELINE_ERAS[activeIndex];

  return (
    <section id="timeline-section" className="py-20 w-full max-w-[1380px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8">
      {/* 1. Unified Section Header (Clean Institutional Luxury - No Emojis) */}
      <AqeeqSectionHeader
        id="about-timeline"
        badge="ثلاثة عقود من العطاء التربوي بطيبة الطيبة (1994 - 2026)"
        badgeIcon={<Sparkles size={14} className="text-[#f8ca14]" />}
        title="مسيرة العقيق المضيئة عبر الزمن"
        subtitle="رحلة تربوية رائدة خطت خطواتها الأولى في المدينة المنورة قبل أكثر من 30 عاماً لتغدو اليوم صرحاً تعليمياً بمواصفات عالمية متطورة."
        dark={dark}
        align="right"
      />

      {/* 2. Unified Master Time Capsule Container */}
      <div
        className={`w-full rounded-[2.5rem] border p-5 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-300 ${
          dark
            ? "border-white/10 bg-gradient-to-b from-[#0c141a]/98 via-[#091016]/98 to-[#060a0e]/98"
            : "border-slate-200/90 bg-white/95 shadow-xl"
        }`}
      >
        {/* Monolithic Holographic Year Watermark */}
        <span
          className={`pointer-events-none absolute left-6 -bottom-10 select-none font-black text-8xl sm:text-[12rem] md:text-[16rem] leading-none transition-all duration-700 font-serif ${
            dark ? "text-white/[0.03]" : "text-[#08467d]/[0.04]"
          }`}
        >
          {activeEra.shortYear}
        </span>

        {/* Top Control Bar: Magnetic Time-Ruler */}
        <div
          className={`pb-6 mb-8 border-b flex flex-col lg:flex-row items-center justify-between gap-5 relative z-10 ${
            dark ? "border-white/10" : "border-slate-200"
          }`}
        >
          {/* Era Counter & Milestone Badge */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#f8ca14]/15 border border-[#f8ca14]/30 flex items-center justify-center text-[#f8ca14] shadow-sm">
                <Clock size={19} />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#f8ca14]">
                    المحطة {activeIndex + 1} من {TIMELINE_ERAS.length}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#f8ca14] animate-pulse" />
                </div>
                <span className={`text-xs font-bold block mt-0.5 ${dark ? "text-slate-300" : "text-slate-700"}`}>
                  خريطة الحقب التاريخية (1994 — 2026)
                </span>
              </div>
            </div>
          </div>

          {/* Integrated Magnetic Time-Ruler Tabs */}
          <div
            className={`relative p-1.5 rounded-2xl border flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto scrollbar-hide shadow-inner ${
              dark ? "border-white/10 bg-black/40 backdrop-blur-md" : "border-slate-200 bg-slate-100/90"
            }`}
          >
            {TIMELINE_ERAS.map((era, eraIdx) => {
              const isActive = activeIndex === eraIdx;
              return (
                <button
                  key={era.shortYear}
                  type="button"
                  onClick={() => setActiveIndex(eraIdx)}
                  className={`relative px-4 sm:px-5 py-2.5 rounded-xl text-center transition-all duration-300 z-10 select-none flex-1 lg:flex-none ${
                    isActive
                      ? "text-white font-black"
                      : dark
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : "text-slate-600 hover:text-[#08467d] hover:bg-white/60"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeHeritagePill"
                      className={`absolute inset-0 rounded-xl shadow-lg ${
                        dark
                          ? "bg-gradient-to-r from-[#08467d] to-[#042442] border border-[#f8ca14]/40"
                          : "bg-[#08467d] border border-[#f8ca14]/50 shadow-md"
                      }`}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10">
                    <span className={`block text-sm sm:text-base font-black ${isActive ? "text-[#f8ca14]" : ""}`}>
                      {era.shortYear}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold block truncate mt-0.5 opacity-90">
                      {era.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Era Showcase Stage (Master-Detail View) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeEra.shortYear}
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 text-right"
          >
            {/* Story & Achievements Column (7 cols) */}
            <div className="lg:col-span-7">
              {/* Milestone Tag & Era Hijri Date */}
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8ca14]/15 border border-[#f8ca14]/35 px-3.5 py-1 text-xs font-black text-[#f8ca14]">
                  <Sparkles size={12} />
                  <span>محطة تاريخية فارقة</span>
                </span>
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                  dark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-[#08467d]"
                }`}>
                  {activeEra.year}
                </span>
              </div>

              {/* Grand Era Title */}
              <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-black mb-4 leading-tight drop-shadow-sm ${
                dark ? "text-white" : "text-[#08467d]"
              }`}>
                {activeEra.title}
              </h3>

              {/* Narrative Description */}
              <p className={`text-sm sm:text-base leading-relaxed mb-6 font-medium ${
                dark ? "text-slate-300" : "text-slate-700"
              }`}>
                {activeEra.desc}
              </p>

              {/* Growth Leap Transformation Box */}
              <div
                className={`p-4 rounded-2xl border mb-6 flex items-center justify-between gap-3 transition-all ${
                  dark
                    ? "border-emerald-500/25 bg-emerald-950/25 text-emerald-300"
                    : "border-emerald-600/20 bg-emerald-50/80 text-emerald-950 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-500">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider opacity-75">
                      الوثبة والقفزة النوعية
                    </span>
                    <span className="text-xs sm:text-sm font-black block mt-0.5">
                      {activeEra.leap.to}
                    </span>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 shrink-0 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={12} />
                  <span>قفزة معتمدة</span>
                </span>
              </div>

              {/* Archival Quote Ribbon */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border mb-6 relative overflow-hidden ${
                  dark
                    ? "border-[#f8ca14]/25 bg-white/[0.02]"
                    : "border-[#08467d]/20 bg-[#08467d]/5 shadow-sm"
                }`}
              >
                <span className="absolute top-2 right-3 text-4xl font-serif text-[#f8ca14]/20 pointer-events-none select-none">
                  “
                </span>
                <p className={`text-xs sm:text-sm font-bold leading-relaxed relative z-10 ${
                  dark ? "text-[#f8ca14]" : "text-[#08467d]"
                }`}>
                  {activeEra.quote}
                </p>
              </div>

              {/* Key Metrics Triad */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                {activeEra.metrics.map((m, mIdx) => (
                  <div
                    key={mIdx}
                    className={`p-3.5 rounded-2xl border text-center transition hover:scale-[1.02] ${
                      dark
                        ? "border-white/10 bg-black/40 backdrop-blur-md"
                        : "border-slate-200/90 bg-white shadow-sm"
                    }`}
                  >
                    <span className="block text-[10px] text-slate-400 font-bold truncate">{m.label}</span>
                    <span className={`text-xs sm:text-sm font-black mt-1 block truncate ${
                      dark ? "text-white" : "text-[#08467d]"
                    }`}>
                      {m.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Interactive Prev/Next Navigation Controls */}
              <div className={`flex items-center justify-between pt-5 border-t ${
                dark ? "border-white/10" : "border-slate-200"
              }`}>
                <button
                  type="button"
                  disabled={activeIndex === 0}
                  onClick={() => setActiveIndex((idx) => Math.max(0, idx - 1))}
                  className={`inline-flex items-center gap-2 text-xs font-black transition px-3 py-2 rounded-xl ${
                    activeIndex === 0
                      ? "opacity-30 cursor-not-allowed text-slate-400"
                      : dark
                      ? "text-slate-200 hover:text-[#f8ca14] hover:bg-white/5"
                      : "text-slate-700 hover:text-[#08467d] hover:bg-slate-100"
                  }`}
                >
                  <ChevronRight size={17} />
                  <span>
                    المحطة السابقة {activeIndex > 0 ? `(${TIMELINE_ERAS[activeIndex - 1].shortYear})` : ""}
                  </span>
                </button>

                <div className="flex items-center gap-1.5 text-xs font-black text-slate-400">
                  <span className="text-[#f8ca14] text-sm">{activeIndex + 1}</span>
                  <span>/</span>
                  <span>{TIMELINE_ERAS.length}</span>
                </div>

                <button
                  type="button"
                  disabled={activeIndex === TIMELINE_ERAS.length - 1}
                  onClick={() => setActiveIndex((idx) => Math.min(TIMELINE_ERAS.length - 1, idx + 1))}
                  className={`inline-flex items-center gap-2 text-xs font-black transition px-3 py-2 rounded-xl ${
                    activeIndex === TIMELINE_ERAS.length - 1
                      ? "opacity-30 cursor-not-allowed text-slate-400"
                      : dark
                      ? "text-slate-200 hover:text-[#f8ca14] hover:bg-white/5"
                      : "text-slate-700 hover:text-[#08467d] hover:bg-slate-100"
                  }`}
                >
                  <span>
                    المحطة التالية {activeIndex < TIMELINE_ERAS.length - 1 ? `(${TIMELINE_ERAS[activeIndex + 1].shortYear})` : ""}
                  </span>
                  <ChevronLeft size={17} />
                </button>
              </div>
            </div>

            {/* Archival Photo Column with Royal Seal (5 cols) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 aspect-[4/3] group">
                {/* Official Archival Seal (Golden Stamp) */}
                <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-[#f8ca14]/60 shadow-lg text-[#f8ca14] text-[10px] font-black tracking-wider">
                  <ShieldCheck size={13} className="text-[#f8ca14]" />
                  <span>وثيقة أرشيفية معتمدة ✦</span>
                </div>

                {/* Photo with Smooth Scale Hover */}
                <img
                  src={activeEra.image}
                  alt={activeEra.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                {/* Bottom Overlay Info Banner */}
                <div className="absolute bottom-4 right-4 left-4 text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Milestone size={16} className="text-[#f8ca14]" />
                    <span className="text-xs font-black text-[#f8ca14]">{activeEra.stats}</span>
                  </div>
                  <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed font-medium">
                    {activeEra.highlight}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Bottom Historical Legacy Pillars Triad */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-right">
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3.5 transition hover:scale-[1.01] ${
            dark ? "border-white/10 bg-white/[0.02]" : "border-slate-200/90 bg-white shadow-sm"
          }`}
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f8ca14]/10 text-[#f8ca14] border border-[#f8ca14]/30">
            <GraduationCap size={22} />
          </div>
          <div>
            <span className="block text-xs font-black text-[#f8ca14]">+15,000 خريج وخريجة</span>
            <span className={`text-[11px] ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>
              ساهموا في بناء ونهضة الوطن بكافة القطاعات
            </span>
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border flex items-center gap-3.5 transition hover:scale-[1.01] ${
            dark ? "border-white/10 bg-white/[0.02]" : "border-slate-200/90 bg-white shadow-sm"
          }`}
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#08467d]/20 text-[#08467d] dark:text-[#f8ca14] border border-[#08467d]/30">
            <Award size={22} />
          </div>
          <div>
            <span className="block text-xs font-black text-[#08467d] dark:text-[#f8ca14]">100% نسبة القبول الجامعي</span>
            <span className={`text-[11px] ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>
              في أرقى الجامعات السعودية والعالمية المعتمدة
            </span>
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border flex items-center gap-3.5 transition hover:scale-[1.01] ${
            dark ? "border-white/10 bg-white/[0.02]" : "border-slate-200/90 bg-white shadow-sm"
          }`}
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            <Building2 size={22} />
          </div>
          <div>
            <span className="block text-xs font-black text-emerald-500">صروح مستقلة 25,000م²</span>
            <span className={`text-[11px] ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>
              بممشى الهجرة بالرانوناء بأعلى المواصفات
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

