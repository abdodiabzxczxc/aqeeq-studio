import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Milestone, ChevronRight, ChevronLeft, Award, GraduationCap, Building2 } from "lucide-react";
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
  metrics: { label: string; val: string }[];
}

export const TIMELINE_ERAS: TimelineEra[] = [
  {
    year: "1994 م — 1415 هـ",
    shortYear: "1994",
    label: "التأسيس والانطلاقة",
    title: "غراس البدايات وتأسيس أول مجمع تعليمي بالمدينة المنورة",
    desc: "انطلقت مدارس العقيق برؤية واضحة لتكون نموذجاً تعليمياً وتربوياً فريداً بطيبة الطيبة. بدأت المدارس بتأسيس المراحل التأسيسية وتخريج أجيال متمكنة في القرآن الكريم واللغة والعلوم، وتكريس منظومة القيم الأخلاقية الأصيلة في نفوس الطلاب.",
    highlight: "نواة التميز والانطلاقة الأولى بالمدينة المنورة",
    stats: "أكثر من 30 دفعة تخرجت منذ التأسيس",
    image: "/covers/cover-about.jpg",
    quote: "ثلاثون عاماً من غراس الخير في طيبة الطيبة، خرّجت أجيالاً تقود الحاضر وتصنع المستقبل.",
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
      { label: "المساحة الإنشائية", val: "مجمعات نموذجية 25,000م²" },
      { label: "المسابح المغطاة", val: "شبه أولمبية FINA" },
      { label: "الصالات", val: "ملاعب عشبية وقاعات جمباز" },
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
    highlight: "مركز اختبارات دولي معتمد وحضور عالمي في منافسات الـ AI",
    stats: "المركز الخامس عالمياً في أولمبياد الروبوت الدولي WRO",
    image: "/covers/first-lego-champions.png",
    quote: "من طيبة الطيبة إلى منصات التتويج العالمية، أبناؤنا ينافسون ويحصدون المراكز الأولى دولياً.",
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
      {/* 1. Unified Section Header */}
      <AqeeqSectionHeader
        id="about-timeline"
        badge="ثلاثة عقود من العطاء التربوي بطيبة الطيبة (1994 - 2026)"
        badgeIcon={<Sparkles size={14} className="text-[#f8ca14]" />}
        title="مسيرة العقيق المضيئة عبر الزمن 📜"
        subtitle="رحلة تربوية رائدة خطت خطواتها الأولى في المدينة المنورة قبل أكثر من 30 عاماً لتغدو اليوم صرحاً تعليمياً بمواصفات عالمية متطورة."
        dark={dark}
        align="right"
      />

      {/* 2. Interactive Scrubber Track (Conduit) */}
      <div className="relative max-w-2xl mx-auto mt-6 mb-6 px-4 hidden sm:block">
        <div className={`h-2 w-full rounded-full ${dark ? "bg-white/10" : "bg-emerald-950/10"} relative overflow-hidden shadow-inner`}>
          <motion.div
            className="h-full bg-gradient-to-r from-[#08467d] via-[#f8ca14] to-emerald-500 rounded-full transition-all duration-500"
            style={{
              width: `${(activeIndex / (TIMELINE_ERAS.length - 1)) * 100}%`,
            }}
          />
        </div>
        {/* Milestone Indicator Beads */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
          {TIMELINE_ERAS.map((era, idx) => (
            <div
              key={era.shortYear}
              className={`w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                idx <= activeIndex
                  ? "border-[#f8ca14] bg-[#08467d] scale-125 shadow-[0_0_15px_rgba(248,202,20,0.8)]"
                  : dark
                  ? "border-white/20 bg-[#0c1218]"
                  : "border-slate-300 bg-white"
              }`}
            >
              {idx <= activeIndex && <div className="w-1.5 h-1.5 rounded-full bg-[#f8ca14]" />}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Interactive Era Buttons Grid */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto p-1.5 rounded-2xl border shadow-sm transition mb-8 ${
          dark ? "border-white/10 bg-[#0c141a]" : "border-slate-200/90 bg-white"
        }`}
      >
        {TIMELINE_ERAS.map((era, eraIdx) => {
          const isActive = activeIndex === eraIdx;
          return (
            <button
              key={era.shortYear}
              type="button"
              onClick={() => setActiveIndex(eraIdx)}
              className={`relative p-3 rounded-xl text-center transition active:scale-95 ${
                isActive
                  ? "bg-gradient-to-r from-[#08467d] to-[#042442] text-white shadow-md ring-1 ring-[#f8ca14]/40"
                  : dark
                  ? "text-slate-400 hover:text-white hover:bg-white/5"
                  : "text-slate-700 hover:text-[#08467d] hover:bg-slate-50"
              }`}
            >
              <span className={`block text-base font-black ${isActive ? "text-[#f8ca14]" : ""}`}>
                {era.shortYear}
              </span>
              <span className="text-[11px] font-bold truncate block mt-0.5">{era.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Dynamic Era Showcase Card with Holographic Watermark */}
      <div
        className={`w-full rounded-[2.5rem] border p-6 sm:p-10 md:p-12 shadow-2xl relative overflow-hidden transition-colors duration-300 ${
          dark
            ? "border-emerald-500/20 bg-gradient-to-b from-[#0c141a]/95 to-[#060a0e]/95"
            : "border-emerald-700/20 bg-gradient-to-b from-white to-[#fbfaf8]"
        }`}
      >
        {/* Holographic Watermark Year */}
        <span
          className={`pointer-events-none absolute left-4 -bottom-6 select-none font-black text-7xl sm:text-9xl md:text-[11rem] leading-none transition-all duration-700 ${
            dark ? "text-white/[0.03]" : "text-black/[0.03]"
          }`}
        >
          {activeEra.shortYear}
        </span>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeEra.shortYear}
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 text-right"
          >
            {/* Story & Details Column (7 cols) */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-3">
                <span className="rounded-full bg-[#f8ca14]/15 border border-[#f8ca14]/30 px-3.5 py-1 text-xs font-black text-[#f8ca14]">
                  محطة تاريخية بارزة ✦
                </span>
                <span className={`text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"}`}>
                  {activeEra.year}
                </span>
              </div>

              <h3 className={`text-2xl sm:text-3xl font-black mb-4 ${dark ? "text-white" : "text-[#08467d]"}`}>
                {activeEra.title}
              </h3>

              <p className={`text-sm sm:text-base leading-relaxed mb-6 font-medium ${dark ? "text-slate-300" : "text-slate-700"}`}>
                {activeEra.desc}
              </p>

              {/* Quote Ribbon */}
              <div
                className={`p-4 rounded-2xl border mb-6 text-xs sm:text-sm font-bold leading-relaxed ${
                  dark
                    ? "border-white/10 bg-white/[0.03] text-[#f8ca14]"
                    : "border-[#08467d]/15 bg-[#08467d]/5 text-[#08467d]"
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
                    className={`p-3 rounded-2xl border text-center transition hover:scale-[1.02] ${
                      dark ? "border-white/10 bg-black/40" : "border-black/5 bg-slate-50"
                    }`}
                  >
                    <span className="block text-[10px] text-slate-400 font-bold">{m.label}</span>
                    <span className={`text-xs sm:text-sm font-black mt-1 block truncate ${dark ? "text-white" : "text-[#0a192f]"}`}>
                      {m.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Navigation Controls between Eras */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  disabled={activeIndex === 0}
                  onClick={() => setActiveIndex((idx) => Math.max(0, idx - 1))}
                  className={`inline-flex items-center gap-1.5 text-xs font-black transition ${
                    activeIndex === 0
                      ? "opacity-30 cursor-not-allowed"
                      : dark
                      ? "text-slate-300 hover:text-[#f8ca14]"
                      : "text-slate-700 hover:text-[#08467d]"
                  }`}
                >
                  <ChevronRight size={16} />
                  <span>المحطة السابقة</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs font-black text-slate-400">
                  <span className="text-[#f8ca14]">{activeIndex + 1}</span>
                  <span>من</span>
                  <span>{TIMELINE_ERAS.length}</span>
                </div>

                <button
                  type="button"
                  disabled={activeIndex === TIMELINE_ERAS.length - 1}
                  onClick={() => setActiveIndex((idx) => Math.min(TIMELINE_ERAS.length - 1, idx + 1))}
                  className={`inline-flex items-center gap-1.5 text-xs font-black transition ${
                    activeIndex === TIMELINE_ERAS.length - 1
                      ? "opacity-30 cursor-not-allowed"
                      : dark
                      ? "text-slate-300 hover:text-[#f8ca14]"
                      : "text-slate-700 hover:text-[#08467d]"
                  }`}
                >
                  <span>المحطة التالية</span>
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>

            {/* Photo Column with Archival Frame (5 cols) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/15 aspect-[4/3] group">
                <img
                  src={activeEra.image}
                  alt={activeEra.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

                <div className="absolute bottom-4 right-4 left-4 text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Milestone size={16} className="text-[#f8ca14]" />
                    <span className="text-xs font-black text-[#f8ca14]">{activeEra.stats}</span>
                  </div>
                  <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed">{activeEra.highlight}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 5. Bottom Historical Badges Triad */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-right">
        <div className={`p-4 rounded-2xl border flex items-center gap-3.5 transition hover:scale-[1.01] ${
          dark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-sm"
        }`}>
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

        <div className={`p-4 rounded-2xl border flex items-center gap-3.5 transition hover:scale-[1.01] ${
          dark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-sm"
        }`}>
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

        <div className={`p-4 rounded-2xl border flex items-center gap-3.5 transition hover:scale-[1.01] ${
          dark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-sm"
        }`}>
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
