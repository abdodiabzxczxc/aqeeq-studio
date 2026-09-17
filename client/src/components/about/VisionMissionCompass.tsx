import React, { useState } from "react";
import { motion } from "framer-motion";
import { Compass, Target, Sparkles, Heart, Shield, Award, Users, Lightbulb } from "lucide-react";
import { AqeeqSectionHeader } from "@/components/AqeeqSectionHeader";

import { VisualEditable } from "@/components/VisualEditor";

interface ValueItem {
  id: string;
  name: string;
  tag: string;
  icon: any;
  title: string;
  desc: string;
  actionTitle: string;
  action: string;
  color: string;
}

const FIVE_VALUES: ValueItem[] = [
  {
    id: "authenticity",
    name: "الأصالة",
    tag: "جذورنا وهويتنا",
    icon: Heart,
    title: "فخرنا بهويتنا وأخلاقنا",
    desc: "لأننا في قلب المدينة المنورة، نحرص أن يكبر أبناؤنا وهم فخورون بدينهم ووطنهم. نزرع فيهم قيمنا الأصيلة ليكونوا منفتحين على العالم، لكن جذورهم ثابتة ومتمسكة بأخلاقنا.",
    actionTitle: "كيف نطبقها؟",
    action: "نطبق ذلك يومياً عبر اهتمامنا بالقرآن الكريم، لغتنا العربية، وربطهم بسيرة النبي في تعاملاتهم وتصرفاتهم داخل المدرسة.",
    color: "#f8ca14",
  },
  {
    id: "excellence",
    name: "الإتقان",
    tag: "الجودة القصوى",
    icon: Award,
    title: "مبدأ «إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»",
    desc: "الإتقان ليس مجرد شعار بل معيار يومي في التدريس، والتقييم، والرعاية الفردية لكل طالب للوصول به إلى أعلى درجات التحصيل.",
    actionTitle: "كيف نطبقها؟",
    action: "تُترجم عملياً عبر مؤشرات قياس أداء دورية، تدريب مستمر للكادر، وحرص مطلق على جودة المخرجات الأكاديمية.",
    color: "#08467d",
  },
  {
    id: "innovation",
    name: "الابتكار",
    tag: "العصر الرقمي",
    icon: Lightbulb,
    title: "التفكير النقدي واستشراف المستقبل",
    desc: "نحفز عقول الطلاب على التساؤل والبحث والاكتشاف، ونحول الفصول إلى ورش عمل لإنتاج الحلول الإبداعية والتقنية المتقدمة.",
    actionTitle: "كيف نطبقها؟",
    action: "تُترجم عملياً في معامل الروبوتات والـ AI، ومشاريع التخرج البحثية، والمشاركات في مسابقات موهبة وأولمبياد العلوم.",
    color: "#10b981",
  },
  {
    id: "leadership",
    name: "القيادة",
    tag: "صناعة الأثر",
    icon: Shield,
    title: "صناعة شخصية القائد المسؤول",
    desc: "تمكين الطلاب من اتخاذ القرار، وإدارة فرق العمل، واكتساب مهارات الخطابة والإقناع والتفكير الاستراتيجي الواثق.",
    actionTitle: "كيف نطبقها؟",
    action: "تُترجم عملياً في المجلس الطلابي، ملتقيات المناظرات، الإذاعة الصباحية، والمسؤوليات القيادية داخل الفصول.",
    color: "#6366f1",
  },
  {
    id: "belonging",
    name: "الانتماء",
    tag: "خدمة الوطن",
    icon: Users,
    title: "خدمة المجتمع والتطوع الفاعل",
    desc: "غرس روح العطاء والمشاركة المجتمعية الفاعلة ورد الجميل لطيبة الطيبة والوطن الغالي من خلال الأعمال التطوعية الإيجابية.",
    actionTitle: "كيف نطبقها؟",
    action: "تُترجم عملياً في مبادرات خدمة زوار المسجد النبوي، حملات التشجير، وبرامج المسؤولية المجتمعية السنوية.",
    color: "#ec4899",
  },
];

interface VisionMissionCompassProps {
  dark?: boolean;
}

export function VisionMissionCompass({ dark = true }: VisionMissionCompassProps) {
  const [activeValueId, setActiveValueId] = useState<string>("authenticity");
  const activeValue = FIVE_VALUES.find((v) => v.id === activeValueId) || FIVE_VALUES[0];
  const ActiveValueIcon = activeValue.icon;

  return (
    <section id="vision-section" className="py-20 w-full max-w-[1380px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8">
      {/* 1. Unified Section Header */}
      <AqeeqSectionHeader
        id="about-vision"
        badge="المرتكزات الاستراتيجية للصرح ومستهدفات 2030"
        badgeIcon={<Compass size={14} className="text-[#f8ca14]" />}
        title="مثلث الريادة المؤسسية وبوصلة القيم 🌟"
        subtitle="رؤية وطنية طموحة تنطلق من رحاب المدينة المنورة، تلتقي مع معايير الجودة العالمية، وتترجم منظومة القيم إلى سلوك يومي لكل طالب."
        dark={dark}
        align="right"
      />

      {/* 2. Main Container with Subtle Glow Border */}
      <div
        className={`w-full rounded-[3rem] border p-6 sm:p-10 md:p-14 shadow-2xl relative overflow-hidden transition-colors ${
          dark
            ? "border-emerald-500/20 bg-gradient-to-b from-[#0c141a]/90 to-[#060a0e]/95"
            : "border-emerald-700/20 bg-gradient-to-b from-white to-[#fbfaf8]"
        }`}
      >
        {/* Ambient Lighting Orbs */}
        <div className="pointer-events-none absolute -top-24 right-1/4 w-80 h-80 bg-[#08467d]/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 w-80 h-80 bg-[#f8ca14]/10 rounded-full blur-3xl" />

        {/* 3. Upper Triumvirate: Dual Wings (Vision & Mission) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative z-10 text-right mb-12">
          {/* Vision Plaque */}
          <div
            className={`rounded-3xl border p-6 sm:p-8 relative overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.01] hover:border-[#f8ca14]/50 ${
              dark ? "border-white/10 bg-white/[0.03]" : "border-[#08467d]/15 bg-white shadow-md"
            }`}
          >
            <div className="flex items-center gap-3.5 mb-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#08467d]/20 text-[#08467d] dark:bg-[#f8ca14]/15 dark:text-[#f8ca14] border border-[#f8ca14]/30">
                <Compass size={24} />
              </div>
              <div>
                <VisualEditable
                  id="about-vision-card-title"
                  tag="text"
                  label="عنوان بطاقة الرؤية"
                  defaultText="الرؤية الاستراتيجية (Vision 2030)"
                  as="h4"
                  className={`text-xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}
                />
                <span className="text-xs text-[#f8ca14] font-bold">أصالة القيم وريادة المستقبل</span>
              </div>
            </div>

            <VisualEditable
              id="about-vision-card-desc"
              tag="text"
              label="نص بطاقة الرؤية"
              defaultText="أن تكون مدارس العقيق الأهلية والدولية نموذجاً تعليمياً وتربوياً رائداً على مستوى المملكة والعالم الإسلامي، يُخرج قادة للمستقبل متسلحين بالعلم النافع، والأخلاق الفاضلة، والمهارات التنافسية العالمية التي تواكب مستهدفات برنامج تنمية القدرات البشرية ورؤية 2030."
              as="p"
              className={`text-xs sm:text-sm leading-relaxed mb-6 font-medium ${dark ? "text-slate-300" : "text-slate-700"}`}
            />

            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-xl text-[11px] font-black border ${
                dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/5 text-[#08467d]"
              }`}>
                ✦ رؤية السعودية 2030
              </span>
              <span className={`px-3 py-1 rounded-xl text-[11px] font-bold border ${
                dark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"
              }`}>
                تنمية القدرات البشرية
              </span>
              <span className={`px-3 py-1 rounded-xl text-[11px] font-bold border ${
                dark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"
              }`}>
                التنافسية العالمية
              </span>
            </div>
          </div>

          {/* Mission Plaque */}
          <div
            className={`rounded-3xl border p-6 sm:p-8 relative overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.01] hover:border-[#f8ca14]/50 ${
              dark ? "border-white/10 bg-white/[0.03]" : "border-[#f8ca14]/25 bg-white shadow-md"
            }`}
          >
            <div className="flex items-center gap-3.5 mb-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/15 text-[#f8ca14] border border-amber-500/30">
                <Target size={24} />
              </div>
              <div>
                <VisualEditable
                  id="about-mission-card-title"
                  tag="text"
                  label="عنوان بطاقة الرسالة"
                  defaultText="الرسالة التربوية (Mission)"
                  as="h4"
                  className={`text-xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}
                />
                <span className="text-xs text-[#f8ca14] font-bold">جودة التعليم وبناء الشخصية المتكاملة</span>
              </div>
            </div>

            <VisualEditable
              id="about-mission-card-desc"
              tag="text"
              label="نص بطاقة الرسالة"
              defaultText="توفير بيئة تعليمية وتربوية محفزة وجاذبة، تضم نخبة من الكفاءات التعليمية المؤهلة، وتطبق أحدث المعايير الدولية والاعتمادات الأكاديمية (Cognia الأمريكية)، لبناء شخصية متكاملة للطالب تعتز بهويتها وتسهم باقتدار في نهضة وطنها."
              as="p"
              className={`text-xs sm:text-sm leading-relaxed mb-6 font-medium ${dark ? "text-slate-300" : "text-slate-700"}`}
            />

            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-xl text-[11px] font-black border ${
                dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/5 text-[#08467d]"
              }`}>
                ✦ اعتماد Cognia الأمريكي
              </span>
              <span className={`px-3 py-1 rounded-xl text-[11px] font-bold border ${
                dark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"
              }`}>
                كوادر تربوية منتقاة
              </span>
              <span className={`px-3 py-1 rounded-xl text-[11px] font-bold border ${
                dark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"
              }`}>
                بيئة جاذبة وآمنة
              </span>
            </div>
          </div>
        </div>

        {/* 4. Lower Section: The 5 Core Virtues Compass */}
        <div className={`relative z-10 pt-8 border-t text-right ${dark ? "border-white/10" : "border-slate-200"}`}>
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#f8ca14] mb-1">
              <span>✦ بوصلة السلوك والقيم المؤسسية ✦</span>
            </div>
            <VisualEditable
              id="about-values-title"
              tag="text"
              label="عنوان قسم القيم"
              defaultText="5 قيم أساسية.. نبني عليها شخصية طفلك"
              as="h4"
              className={`text-xl sm:text-2xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}
            />
            <VisualEditable
              id="about-values-subtitle"
              tag="text"
              label="وصف قسم القيم"
              defaultText="تعرف كيف نغرس هذه القيم في تفاصيل يومهم الدراسي بحب واهتمام، لتكون أسلوب حياة وليس مجرد كلام."
              as="p"
              className={`text-xs sm:text-sm mt-1.5 ${dark ? "text-slate-400" : "text-slate-600"}`}
            />
          </div>

          {/* Virtues Grid Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 mb-6">
            {FIVE_VALUES.map((val) => {
              const VIcon = val.icon;
              const isSelected = activeValueId === val.id;
              return (
                <button
                  key={val.id}
                  type="button"
                  onClick={() => setActiveValueId(val.id)}
                  className={`p-3.5 rounded-2xl border text-center transition-all duration-150 active:scale-95 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-[#08467d] to-[#042442] border-[#f8ca14]/60 text-white shadow-lg ring-1 ring-[#f8ca14]/50 scale-[1.02]"
                      : dark
                      ? "border-white/10 bg-black/40 text-slate-400 hover:text-white hover:border-white/20"
                      : "border-slate-200 bg-white text-slate-700 hover:text-[#08467d] hover:border-[#08467d]/40 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-1 pointer-events-none">
                    <VIcon size={16} className={isSelected ? "text-[#f8ca14]" : ""} />
                    <VisualEditable
                      id={`about-value-${val.id}-name`}
                      tag="text"
                      label={`اسم قيمة ${val.name}`}
                      defaultText={val.name}
                      as="span"
                      className={`text-sm font-black ${isSelected ? "text-[#f8ca14]" : ""}`}
                    />
                  </div>
                  <div className="pointer-events-none">
                    <VisualEditable
                      id={`about-value-${val.id}-tag`}
                      tag="text"
                      label={`شعار قيمة ${val.name}`}
                      defaultText={val.tag}
                      as="span"
                      className="block text-[10px] font-bold opacity-75 truncate"
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dynamic Active Value Translation Card (Instant 0ms Snappy Switch) */}
          <div
            key={activeValue.id}
            className={`p-5 sm:p-7 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-colors duration-150 ${
              dark
                ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.04]"
                : "border-slate-200 bg-white shadow-md"
            }`}
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#f8ca14]" />
                <VisualEditable
                  id={`about-value-${activeValue.id}-title`}
                  tag="text"
                  label={`عنوان قيمة ${activeValue.name}`}
                  defaultText={activeValue.title}
                  as="h5"
                  className={`text-base sm:text-lg font-black ${dark ? "text-white" : "text-[#0a192f]"}`}
                />
              </div>
              <VisualEditable
                id={`about-value-${activeValue.id}-desc`}
                tag="text"
                label={`وصف قيمة ${activeValue.name}`}
                defaultText={activeValue.desc}
                as="p"
                className={`text-xs sm:text-sm font-medium leading-relaxed ${dark ? "text-slate-300" : "text-slate-700"}`}
              />
              <div className="pt-2">
                <VisualEditable
                  id={`about-value-${activeValue.id}-action-title`}
                  tag="text"
                  label={`تسمية تطبيق قيمة ${activeValue.name}`}
                  defaultText={activeValue.actionTitle}
                  as="span"
                  className="text-[11px] font-black text-[#f8ca14] block"
                />
                <VisualEditable
                  id={`about-value-${activeValue.id}-action`}
                  tag="text"
                  label={`تفاصيل تطبيق قيمة ${activeValue.name}`}
                  defaultText={activeValue.action}
                  as="p"
                  className={`text-xs leading-relaxed mt-0.5 ${dark ? "text-slate-400" : "text-slate-600"}`}
                />
              </div>
            </div>

            <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl border shadow-md ${
              dark
                ? "bg-black/50 border-white/15 text-[#f8ca14]"
                : "bg-slate-50 border-slate-200 text-[#08467d]"
            }`}>
              <ActiveValueIcon size={30} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
