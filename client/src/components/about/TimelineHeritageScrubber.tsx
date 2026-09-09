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
    <section id="timeline-section" className="pt-8 sm:pt-10 pb-14 sm:pb-16 w-full max-w-[1380px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8">
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

      {/* 2. Unified Master Time Capsule Container (Flawlessly Aligned to 1380px Ruler) */}
      <div
        className={`w-full rounded-[2.5rem] border p-6 sm:p-8 md:p-9 shadow-xl relative overflow-hidden transition-all duration-300 ${
          dark
            ? "border-white/10 bg-gradient-to-b from-[#0c141a]/98 via-[#091016]/98 to-[#060a0e]/98"
            : "border-slate-200/90 bg-white/95 shadow-md"
        }`}
      >
        {/* Monolithic Holographic Year Watermark */}
        <span
          className={`pointer-events-none absolute left-6 -bottom-8 select-none font-black text-7xl sm:text-9xl md:text-[12rem] leading-none transition-all duration-700 font-serif ${
            dark ? "text-white/[0.025]" : "text-[#08467d]/[0.035]"
          }`}
        >
          {activeEra.shortYear}
        </span>

        {/* Top Control Bar: Magnetic Time-Ruler */}
        <div
          className={`pb-4 mb-5 border-b flex flex-col sm:flex-row items-center justify-between gap-3.5 relative z-10 ${
            dark ? "border-white/10" : "border-slate-200"
          }`}
        >
          {/* Era Counter & Milestone Badge */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#f8ca14]/15 border border-[#f8ca14]/30 flex items-center justify-center text-[#f8ca14] shadow-sm">
                <Clock size={16} />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#f8ca14]">
                    المحطة {activeIndex + 1} من {TIMELINE_ERAS.length}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f8ca14] animate-pulse" />
                </div>
                <span className={`text-[11px] font-bold block ${dark ? "text-slate-300" : "text-slate-600"}`}>
                  خريطة الحقب التاريخية (1994 — 2026)
                </span>
              </div>
            </div>
          </div>

          {/* Integrated Magnetic Time-Ruler Tabs */}
          <div
            className={`relative p-1 rounded-xl border flex items-center gap-1 w-full sm:w-auto overflow-x-auto scrollbar-hide shadow-inner ${
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
                  className={`relative px-3.5 sm:px-4 py-2 rounded-lg text-center transition-all duration-300 z-10 select-none flex-1 sm:flex-none ${
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
                      className={`absolute inset-0 rounded-lg shadow-md ${
                        dark
                          ? "bg-gradient-to-r from-[#08467d] to-[#042442] border border-[#f8ca14]/40"
                          : "bg-[#08467d] border border-[#f8ca14]/50 shadow-sm"
                      }`}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10">
                    <span className={`block text-xs sm:text-sm font-black ${isActive ? "text-[#f8ca14]" : ""}`}>
                      {era.shortYear}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold block truncate mt-0.5 opacity-90">
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
            initial={{ opacity: 0, y: 12, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(3px)" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10 text-right"
          >
            {/* Story & Achievements Column (7 cols) */}
            <div className="lg:col-span-7">
              {/* Milestone Tag & Era Hijri Date */}
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f8ca14]/15 border border-[#f8ca14]/35 px-2.5 py-0.5 text-[11px] font-black text-[#f8ca14]">
                  <Sparkles size={11} />
                  <span>محطة فارقة</span>
                </span>
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                  dark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-[#08467d]"
                }`}>
                  {activeEra.year}
                </span>
              </div>

              {/* Grand Era Title */}
              <h3 className={`text-xl sm:text-2xl font-black mb-2.5 leading-snug drop-shadow-sm ${
                dark ? "text-white" : "text-[#08467d]"
              }`}>
                {activeEra.title}
              </h3>

              {/* Narrative Description */}
              <p className={`text-xs sm:text-sm leading-relaxed mb-3.5 font-medium ${
                dark ? "text-slate-300" : "text-slate-600"
              }`}>
                {activeEra.desc}
              </p>

              {/* Compact Growth Leap Transformation Box */}
              <div
                className={`p-3 rounded-xl border mb-3 flex items-center justify-between gap-3 transition-all ${
                  dark
                    ? "border-emerald-500/25 bg-emerald-950/25 text-emerald-300"
                    : "border-emerald-600/20 bg-emerald-50/80 text-emerald-950 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-500">
                    <TrendingUp size={14} />
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-wider opacity-75">
                      الوثبة والتحول النوعي
                    </span>
                    <span className="text-xs font-black block mt-0.5">
                      {activeEra.leap.to}
                    </span>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 shrink-0 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={11} />
                  <span>معتمد ✦</span>
                </span>
              </div>

              {/* Archival Quote Ribbon (Slim) */}
              <div
                className={`p-3 rounded-xl border mb-3 relative overflow-hidden ${
                  dark
                    ? "border-[#f8ca14]/25 bg-white/[0.02]"
                    : "border-[#08467d]/15 bg-[#08467d]/5 shadow-sm"
                }`}
              >
                <p className={`text-xs font-bold leading-relaxed relative z-10 ${
                  dark ? "text-[#f8ca14]" : "text-[#08467d]"
                }`}>
                  <span className="font-serif ml-1 opacity-60">“</span>
                  {activeEra.quote}
                  <span className="font-serif mr-1 opacity-60">”</span>
                </p>
              </div>

              {/* Key Metrics Triad (Compact) */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {activeEra.metrics.map((m, mIdx) => (
                  <div
                    key={mIdx}
                    className={`p-2 sm:p-2.5 rounded-xl border text-center transition hover:scale-[1.01] ${
                      dark
                        ? "border-white/10 bg-black/40 backdrop-blur-md"
                        : "border-slate-200/90 bg-white shadow-sm"
                    }`}
                  >
                    <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold truncate">{m.label}</span>
                    <span className={`text-[11px] sm:text-xs font-black mt-0.5 block truncate ${
                      dark ? "text-white" : "text-[#08467d]"
                    }`}>
                      {m.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Interactive Prev/Next Navigation Controls */}
              <div className={`flex items-center justify-between pt-3 border-t ${
                dark ? "border-white/10" : "border-slate-200"
              }`}>
                <button
                  type="button"
                  disabled={activeIndex === 0}
                  onClick={() => setActiveIndex((idx) => Math.max(0, idx - 1))}
                  className={`inline-flex items-center gap-1.5 text-xs font-black transition px-2.5 py-1.5 rounded-lg ${
                    activeIndex === 0
                      ? "opacity-30 cursor-not-allowed text-slate-400"
                      : dark
                      ? "text-slate-200 hover:text-[#f8ca14] hover:bg-white/5"
                      : "text-slate-700 hover:text-[#08467d] hover:bg-slate-100"
                  }`}
                >
                  <ChevronRight size={15} />
                  <span>
                    السابق {activeIndex > 0 ? `(${TIMELINE_ERAS[activeIndex - 1].shortYear})` : ""}
                  </span>
                </button>

                <div className="flex items-center gap-1 text-xs font-black text-slate-400">
                  <span className="text-[#f8ca14]">{activeIndex + 1}</span>
                  <span>/</span>
                  <span>{TIMELINE_ERAS.length}</span>
                </div>

                <button
                  type="button"
                  disabled={activeIndex === TIMELINE_ERAS.length - 1}
                  onClick={() => setActiveIndex((idx) => Math.min(TIMELINE_ERAS.length - 1, idx + 1))}
                  className={`inline-flex items-center gap-1.5 text-xs font-black transition px-2.5 py-1.5 rounded-lg ${
                    activeIndex === TIMELINE_ERAS.length - 1
                      ? "opacity-30 cursor-not-allowed text-slate-400"
                      : dark
                      ? "text-slate-200 hover:text-[#f8ca14] hover:bg-white/5"
                      : "text-slate-700 hover:text-[#08467d] hover:bg-slate-100"
                  }`}
                >
                  <span>
                    التالي {activeIndex < TIMELINE_ERAS.length - 1 ? `(${TIMELINE_ERAS[activeIndex + 1].shortYear})` : ""}
                  </span>
                  <ChevronLeft size={15} />
                </button>
              </div>
            </div>

            {/* Archival Photo Column with Royal Seal (5 cols) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/20 aspect-[16/11] max-h-[360px] group">
                {/* Official Archival Seal (Golden Stamp) */}
                <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#f8ca14]/60 shadow-md text-[#f8ca14] text-[9px] font-black tracking-wider">
                  <ShieldCheck size={11} className="text-[#f8ca14]" />
                  <span>وثيقة أرشيفية ✦</span>
                </div>

                {/* Photo with Smooth Scale Hover */}
                <img
                  src={activeEra.image}
                  alt={activeEra.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent pointer-events-none" />

                {/* Bottom Overlay Info Banner */}
                <div className="absolute bottom-3 right-3 left-3 text-white">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Milestone size={14} className="text-[#f8ca14]" />
                    <span className="text-[11px] font-black text-[#f8ca14]">{activeEra.stats}</span>
                  </div>
                  <p className="text-[10px] text-slate-200 line-clamp-2 leading-relaxed font-medium">
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

