import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { VisualImage, VisualEditable } from "@/components/VisualEditor";
import { preloadImage } from "@/lib/visualOverridesCache";

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
    label: "الخطوة الأولى",
    title: "غراس البدايات.. خطوتنا الأولى في بناء الأجيال",
    desc: "انطلقنا في طيبة الطيبة بحلم واحد؛ أن نخلق بيئة تعليمية تحتضن أبناءنا وتجمع بين قوة التأسيس الأكاديمي ودفء التربية. بدأنا رحلتنا بالتركيز على بناء أساس متين، وغرس القيم التي تطمئنك على طفلك في كل خطوة يخطوها معنا.",
    highlight: "نواة التميز والانطلاقة الأولى بطيبة الطيبة",
    stats: "27 عاماً من بناء العقول",
    image: "/api/drive-proxy/1ulrpYsDrV7xbDdysqTsNoLNUvblw14p5",
    quote: "27 عاماً من العطاء في المدينة المنورة.. نخرج أجيالاً نفخر بها وتفخر بها عائلاتهم.",
    leap: {
      from: "البدايات الأولى في المدينة",
      to: "تأسيس بيئة تعليمية تضع مصلحة الطالب في المقام الأول.",
    },
    metrics: [
      { label: "مسيرتنا", val: "أكثر من 27 عاماً" },
      { label: "هدفنا الأساسي", val: "بناء صرح متكامل" },
      { label: "مقرنا", val: "قلب المدينة المنورة" },
    ],
  },
  {
    year: "2010 م — 1431 هـ",
    shortYear: "2010",
    label: "خطوة التوسع",
    title: "مجمعات تعليمية مستقلة.. تمنحهم المساحة للنمو والإبداع",
    desc: "كبرنا بثقتكم، وانتقلنا لمرحلة جديدة بتأسيس مجمعات مستقلة للبنين والبنات في حي الرانوناء. وفرنا فيها كل ما يحتاجه طفلك من مسابح مغطاة، وملاعب رياضية، ومعامل ذكية، لتكون المدرسة بيئة متكاملة تدعم نشاطه البدني وتطلق العنان لإبداعه، تماماً كما تدعم تفوقه الأكاديمي.",
    highlight: "مجمعات مستقلة للبنين والبنات بأعلى المواصفات",
    stats: "بيئة تستوعب طموحهم",
    image: "/api/drive-proxy/1IkefgGSvnqfdhLiMHYd25-lz3AuBH5n1",
    quote: "المدرسة ليست فصولاً دراسية فقط؛ بل مساحة حياة يتنفس فيها أبناؤنا الإبداع ويبنون أجساداً وعقولاً سليمة",
    leap: {
      from: "المباني التعليمية الأولى",
      to: "مجمعات مستقلة تمتد على مساحات شاسعة، مجهزة بأحدث المرافق الرياضية والعلمية",
    },
    metrics: [
      { label: "مساحات شاسعة", val: "25,000 متر مربع" },
      { label: "رياضة ولياقة", val: "مسابح وملاعب مغطاة" },
      { label: "بيئة تفاعلية", val: "معامل ومسارح مجهزة" },
    ],
  },
  {
    year: "2018 م — 1439 هـ",
    shortYear: "2018",
    label: "بصمة الجودة",
    title: "جودة تعليمية تضاهي أرقى المدارس العالمية",
    desc: "التفوق لدينا ليس مجرد شعار، بل هو واقع توجناه بالحصول على الاعتماد الدولي الأمريكي \"كوجنيا - Cognia\". هذه الخطوة تضمن لك أن كل تفصيلة في يوم ابنك الدراسي تخضع لأعلى المعايير، ليحصل في النهاية على شهادة الدبلومة الأمريكية التي تفتح له أبواب كبرى الجامعات بثقة.",
    highlight: "تقييم عالمي يتجاوز 98% في جودة التعليم",
    stats: "ثقة دولية تقود مسيرتنا",
    image: "/api/drive-proxy/1qifbHFSgFaBQH1g63qvK2WmQtls0l4AR",
    quote: "اعتراف دولي يطمئنك أن أبناءنا يتلقون تعليماً يضاهي الأفضل عالمياً، دون أن يفقدوا أصالتهم وهويتهم",
    leap: {
      from: "الريادة المحلية",
      to: "اعتماد \"كوجنيا\" الأمريكي لضمان جودة التعليم وتميز المخرجات الأكاديمية",
    },
    metrics: [
      { label: "معايير دولية", val: "منظمة Cognia الأمريكية" },
      { label: "المسار الأكاديمي", val: "الدبلومة الأمريكية" },
      { label: "نسبة المطابقة", val: "98% لمعايير الجودة" },
    ],
  },
  {
    year: "2024 - 2026 م",
    shortYear: "2026",
    label: "نحو المستقبل",
    title: "العالم بين أيديهم.. من مراكز القياس الدولية لتقنيات المستقبل",
    desc: "لم نقف يوماً عند حدود المناهج التقليدية؛ بل سعينا لتذليل طريقهم نحو كبرى الجامعات بجلب مراكز الاختبارات الدولية (IELTS و SAT) إلى داخل مدرستهم. دمجنا تقنيات الذكاء الاصطناعي في فصولنا، ودعمنا شغفهم ليصلوا للمركز الخامس عالمياً في أولمبياد الروبوت (WRO)، لنجهزهم ليكونوا قادة حقيقيين يواكبون طموحات الرؤية الوطنية.",
    highlight: "إنجازات مستمرة في أولمبياد الروبوت ومراكز القياس الدولية",
    stats: "من فصولنا لمنصات التتويج",
    image: "/api/drive-proxy/16IxreFp6eRLCuLDZyIWEoU9eWHzOCJuC",
    quote: "من فصولنا في المدينة المنورة إلى منصات التتويج العالمية.. أبناؤنا يمتلكون أدوات المستقبل ويصنعون الفارق",
    leap: {
      from: "التعليم التفاعلي الذكي",
      to: "مراكز معتمدة للقياس الدولي، ودعم كامل لابتكارات الروبوت والبرمجة",
    },
    metrics: [
      { label: "بوابتهم للجامعة", val: "مراكز IELTS و SAT" },
      { label: "أبطال الابتكار", val: "المركز الخامس في WRO" },
      { label: "طموحنا", val: "مواكبة تطلعات 2030" },
    ],
  },
];

const ERA_STEP_NAMES: Record<string, { prev?: string; next?: string }> = {
  "1994": { next: "المجمعات" },
  "2010": { prev: "التأسيس", next: "الاعتماد الدولي" },
  "2018": { prev: "مرحلة التوسع", next: "مهارات المستقبل" },
  "2026": { prev: "الاعتماد الدولي" },
};

interface TimelineHeritageScrubberProps {
  dark?: boolean;
}

export function TimelineHeritageScrubber({ dark = true }: TimelineHeritageScrubberProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeEra = TIMELINE_ERAS[activeIndex];

  // Preload all era images into memory immediately on mount to ensure 0ms tab switching
  useEffect(() => {
    TIMELINE_ERAS.forEach((era) => {
      if (era.image) {
        preloadImage(era.image);
      }
    });
  }, []);

  return (
    <section id="timeline-section" className="pt-8 sm:pt-10 pb-14 sm:pb-16 w-full max-w-[1380px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8">
      {/* 1. Unified Section Header (Clean Institutional Luxury - No Emojis) */}
      <AqeeqSectionHeader
        id="about-timeline"
        badge="من التأسيس إلى الريادة"
        badgeIcon={<Sparkles size={14} className="text-[#f8ca14]" />}
        title="رحلة العقيق..خطوات ثابتة تصنع المستقبل"
        subtitle="بدأنا خطوتنا الأولى في المدينة المنورة قبل 27 عاماً بحلم واحد؛ أن نقدم تعليماً يصنع الفارق. واليوم، بفضل ثقتكم، تحول هذا الحلم إلى بيئة تعليمية تضاهي المدارس العالمية، تتطور كل يوم لتبقى دائماً الخيار الذي يستحقه أبناؤكم."
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
                <VisualEditable
                  id="about-timeline-badge-subtitle"
                  tag="text"
                  label="عنوان فرعي لخريطة الحقب"
                  defaultText="27 عاماً من العطاء المستمر"
                  as="span"
                  className={`text-[11px] font-bold block ${dark ? "text-slate-300" : "text-slate-600"}`}
                />
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
                    <span
                      className={`block text-xs sm:text-sm font-black transition-colors ${
                        isActive ? "!text-[#f8ca14]" : ""
                      }`}
                      style={isActive ? { color: "#f8ca14" } : undefined}
                    >
                      {era.shortYear}
                    </span>
                    <VisualEditable
                      id={`about-timeline-tab-label-${era.shortYear}`}
                      tag="text"
                      label={`اسم تبويب (${era.shortYear})`}
                      defaultText={era.label}
                      as="span"
                      className="text-[9px] sm:text-[10px] font-bold block truncate mt-0.5 opacity-90"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Era Showcase Stage (Instant Snappy Switch with Micro-Fade - No Blank Hole) */}
        <motion.div
          key={activeEra.shortYear}
          initial={{ opacity: 0.35 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10 text-right"
        >
            {/* Story & Achievements Column (7 cols) */}
            <div className="lg:col-span-7">
              {/* Milestone Tag & Era Hijri Date */}
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f8ca14]/15 border border-[#f8ca14]/35 px-2.5 py-0.5 text-[11px] font-black text-[#f8ca14]">
                  <Sparkles size={11} />
                  <VisualEditable
                    id="about-timeline-badge-tag"
                    tag="text"
                    label="شارة المحطة"
                    defaultText="صناع المستقبل"
                    as="span"
                  />
                </span>
                <VisualEditable
                  id={`about-timeline-pill-tag-${activeEra.shortYear}`}
                  tag="text"
                  label={`وسام المحطة (${activeEra.shortYear})`}
                  defaultText={activeEra.shortYear === "1994" ? "بداية الأثر" : activeEra.shortYear === "2010" ? "نقلة نوعية" : activeEra.shortYear === "2018" ? "2018 م — 1439 هـ" : "بوابتهم للعالم"}
                  as="span"
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                    dark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-[#08467d]"
                  }`}
                />
              </div>

              {/* Grand Era Title */}
              <VisualEditable
                id={`about-timeline-title-${activeEra.shortYear}`}
                tag="text"
                label={`عنوان محطة (${activeEra.shortYear})`}
                defaultText={activeEra.title}
                as="h3"
                className={`text-xl sm:text-2xl font-black mb-2.5 leading-snug drop-shadow-sm ${
                  dark ? "text-white" : "text-[#08467d]"
                }`}
              />

              {/* Narrative Description */}
              <VisualEditable
                id={`about-timeline-desc-${activeEra.shortYear}`}
                tag="text"
                label={`وصف محطة (${activeEra.shortYear})`}
                defaultText={activeEra.desc}
                as="p"
                className={`text-xs sm:text-sm leading-relaxed mb-3.5 font-medium ${
                  dark ? "text-slate-300" : "text-slate-600"
                }`}
              />

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
                    <VisualEditable
                      id="about-timeline-leap-label"
                      tag="text"
                      label="عنوان الوثبة"
                      defaultText="خطوة للمستقبل"
                      as="span"
                      className="block text-[9px] font-black uppercase tracking-wider opacity-75"
                    />
                    <VisualEditable
                      id={`about-timeline-leap-${activeEra.shortYear}`}
                      tag="text"
                      label={`تحول محطة (${activeEra.shortYear})`}
                      defaultText={activeEra.leap.to}
                      as="span"
                      className="text-xs font-black block mt-0.5"
                    />
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
                  <VisualEditable
                    id={`about-timeline-quote-${activeEra.shortYear}`}
                    tag="text"
                    label={`اقتباس محطة (${activeEra.shortYear})`}
                    defaultText={activeEra.quote}
                    as="span"
                  />
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
                    <VisualEditable
                      id={`about-timeline-metric-label-${activeEra.shortYear}-${mIdx}`}
                      tag="text"
                      label={`تسمية مؤشر ${mIdx + 1} (${activeEra.shortYear})`}
                      defaultText={m.label}
                      as="span"
                      className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold truncate"
                    />
                    <VisualEditable
                      id={`about-timeline-metric-val-${activeEra.shortYear}-${mIdx}`}
                      tag="text"
                      label={`قيمة مؤشر ${mIdx + 1} (${activeEra.shortYear})`}
                      defaultText={m.val}
                      as="span"
                      className={`text-[11px] sm:text-xs font-black mt-0.5 block truncate ${
                        dark ? "text-white" : "text-[#08467d]"
                      }`}
                    />
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
                    السابق {activeIndex > 0 ? `(${ERA_STEP_NAMES[activeEra.shortYear]?.prev || TIMELINE_ERAS[activeIndex - 1].shortYear})` : ""}
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
                    التالي {activeIndex < TIMELINE_ERAS.length - 1 ? `(${ERA_STEP_NAMES[activeEra.shortYear]?.next || TIMELINE_ERAS[activeIndex + 1].shortYear})` : ""}
                  </span>
                  <ChevronLeft size={15} />
                </button>
              </div>
            </div>

            {/* Archival Photo Column with Royal Seal (5 cols) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/20 aspect-[16/11] max-h-[360px] group bg-[#091016]">
                {/* Official Archival Seal (Golden Stamp) */}
                <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#f8ca14]/60 shadow-md text-[#f8ca14] text-[9px] font-black tracking-wider">
                  <ShieldCheck size={11} className="text-[#f8ca14] shrink-0" />
                  <VisualEditable
                    id={`about-timeline-seal-${activeEra.shortYear}`}
                    tag="text"
                    label={`ختم أرشيفي (${activeEra.shortYear})`}
                    defaultText="وثيقة أرشيفية ✦"
                    as="span"
                  />
                </div>

                {/* Photo with Smooth Scale Hover */}
                <VisualImage
                  id={`about-timeline-era-${activeEra.shortYear}`}
                  label={`صورة محطة ${activeEra.shortYear} - ${activeEra.label}`}
                  src={activeEra.image}
                  alt={activeEra.title}
                  priority={true}
                  loading="eager"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent pointer-events-none z-10" />

                {/* Bottom Overlay Info Banner */}
                <div className="absolute bottom-3 right-3 left-3 z-20 text-white">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Milestone size={14} className="text-[#f8ca14] shrink-0" />
                    <VisualEditable
                      id={`about-timeline-stats-${activeEra.shortYear}`}
                      tag="text"
                      label={`إحصائية صورة (${activeEra.shortYear})`}
                      defaultText={activeEra.stats}
                      as="span"
                      className="text-[11px] font-black text-[#f8ca14]"
                    />
                  </div>
                  <VisualEditable
                    id={`about-timeline-highlight-${activeEra.shortYear}`}
                    tag="text"
                    label={`وصف صورة (${activeEra.shortYear})`}
                    defaultText={activeEra.highlight}
                    as="p"
                    className="text-[10px] text-slate-200 line-clamp-2 leading-relaxed font-medium"
                  />
                </div>
              </div>
            </div>
          </motion.div>
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
            <VisualEditable
              id="about-timeline-pillar-val-1"
              tag="text"
              label="رقم الركيزة الأولى"
              defaultText="+15,000 خريج وخريجة"
              as="span"
              className="block text-xs font-black text-[#f8ca14]"
            />
            <VisualEditable
              id="about-timeline-pillar-desc-1"
              tag="text"
              label="وصف الركيزة الأولى"
              defaultText="ساهموا في بناء ونهضة الوطن بكافة القطاعات"
              as="span"
              className={`text-[11px] ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}
            />
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
            <VisualEditable
              id="about-timeline-pillar-val-2"
              tag="text"
              label="رقم الركيزة الثانية"
              defaultText="100% نسبة القبول الجامعي"
              as="span"
              className="block text-xs font-black text-[#08467d] dark:text-[#f8ca14]"
            />
            <VisualEditable
              id="about-timeline-pillar-desc-2"
              tag="text"
              label="وصف الركيزة الثانية"
              defaultText="في أرقى الجامعات السعودية والعالمية المعتمدة"
              as="span"
              className={`text-[11px] ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}
            />
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
            <VisualEditable
              id="about-timeline-pillar-val-3"
              tag="text"
              label="رقم الركيزة الثالثة"
              defaultText="صروح مستقلة 25,000م²"
              as="span"
              className="block text-xs font-black text-emerald-500"
            />
            <VisualEditable
              id="about-timeline-pillar-desc-3"
              tag="text"
              label="وصف الركيزة الثالثة"
              defaultText="بممشى الهجرة بالرانوناء بأعلى المواصفات"
              as="span"
              className={`text-[11px] ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

