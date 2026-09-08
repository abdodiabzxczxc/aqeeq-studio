import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Compass,
  Award,
  Target,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { AqeeqSectionHeader } from "@/components/AqeeqSectionHeader";
import { useMagneticTilt } from "@/lib/motionPresets";

interface PillarItem {
  id: string;
  icon: any;
  title: string;
  badge: string;
  desc: string;
  subPoints: string[];
  studentOutcomes: string[];
}

const PILLARS: PillarItem[] = [
  {
    id: "inspire",
    icon: Lightbulb,
    title: "نُلهـــم الأجيــــــــال",
    badge: "التعليم النوعي والاعتماد الأكاديمي",
    desc: "نقدّم تعليماً نوعياً يُرسّخ المعرفة، ويُنمّي التفكير، ويُحفّز التعلّم المستمر، ليمنح طلابنا أساساً علمياً راسخاً، ويُهيئهم لمواصلة رحلتهم التعليمية بثقة وتميّز لا يضاهى.",
    subPoints: [
      "معايير أكاديمية معتمدة دولياً من كوجنيا (Cognia الأمريكية)",
      "كوادر تعليمية وتربوية ذات كفاءة وخبرة استثنائية",
      "تكامل فريد بين أصالة اللغة والقيم والعلوم العصرية",
    ],
    studentOutcomes: [
      "إتقان اللغة الإنجليزية كلغة ثانية مع اعتزاز تام باللغة العربية",
      "تنمية مهارات التفكير النقدي وحل المشكلات الحياتية",
      "الاستعداد التام لمناهج المسارات الثانوية والشهادات العالمية",
    ],
  },
  {
    id: "develop",
    icon: Compass,
    title: "نُنمّـــــي القـــــدرات",
    badge: "مهارات المستقبل والذكاء الاصطناعي",
    desc: "نُمكّن طلابنا من اكتشاف إمكاناتهم، وتنمية مهاراتهم، وتوسيع آفاقهم، من خلال تجارب تعلّم حديثة تُعزّز الابتكار، وتُرسّخ التفكير الرقمي، وتُهيئهم لسوق العمل المستقبلي.",
    subPoints: [
      "مناهج الذكاء الاصطناعي والروبوت والبرمجة من المراحل المبكرة",
      "مختبرات ذكية مجهزة لمحاكاة بيئات الابتكار وحقائب VEX",
      "أنشطة صقل الشخصية والخطابة والمناظرات الطلابية الدورية",
    ],
    studentOutcomes: [
      "كتابة وتطبيق الخوارزميات وبرمجة لغة بايثون عملياً",
      "بناء وبرمجة الروبوتات للمشاركة في التحديات الإقليمية والدولية",
      "الثقة العالية في التحدث أمام الجمهور وإدارة النقاشات",
    ],
  },
  {
    id: "celebrate",
    icon: Award,
    title: "نحتفــــي بالتميّـــــز",
    badge: "الإنجاز والريادة العالمية",
    desc: "نُمكّن طلابنا من تحقيق التميّز عبر بيئة تعليمية داعمة تُعزّز الإنجاز، وتفتح آفاق المشاركة في المنافسات المحلية والدولية، ليقدّموا نماذج مشرّفة تعكس قدراتهم وطموحاتهم.",
    subPoints: [
      "المركز الخامس عالمياً في أولمبياد الروبوت الدولي (WRO)",
      "مراكز معتمدة رسمياً لاختبارات IDP IELTS و SAT بالمدينة المنورة",
      "حصد جوائز التميز الوزارية والمحلية سنوياً",
    ],
    studentOutcomes: [
      "الحصول على شهادات IELTS و SAT داخل مقر المدارس بالمدينة",
      "تمثيل المملكة في الأولمبيادات والمعارض العلمية العالمية",
      "القبول الفوري في أرقى الكليات والتخصصات المرموقة",
    ],
  },
  {
    id: "impact",
    icon: Target,
    title: "نصنــــع الأثـــــــــر",
    badge: "أثر مستدام ورؤية 2030",
    desc: "نُهيّئ طلابنا لمستقبل واعد، من خلال بناء المعرفة، وتنمية المهارات، وترسيخ القيم، ليصنعوا أثراً مستداماً، ويقودوا مسيرتهم بثقة وطموح متوافق 100% مع رؤية المملكة 2030.",
    subPoints: [
      "أكثر من 15,000 خريج وخريجة يخدمون الوطن في كافة المجالات",
      "برامج ريادة الأعمال والمسؤولية المجتمعية والتطوع بطيبة الطيبة",
      "مواءمة مستمرة مع مستهدفات برنامج تنمية القدرات البشرية",
    ],
    studentOutcomes: [
      "المبادرة بريادة الأعمال الطلابية وابتكار الحلول المجتمعية",
      "ساعات تطوعية معتمدة في المنصة الوطنية للعمل التطوعي",
      "جاهزية تامة للتنافسية العالمية وقيادة فرق العمل",
    ],
  },
];

function PillarCardItem({
  pillar,
  index,
  dark,
}: {
  pillar: PillarItem;
  index: number;
  dark: boolean;
}) {
  const { ref, tilt, onMove, onLeave } = useMagneticTilt(6);
  const [expanded, setExpanded] = useState(false);
  const Icon = pillar.icon;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.15s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.3s ease, border-color 0.3s ease",
      }}
      className={`group relative overflow-hidden rounded-[2.2rem] border p-6 sm:p-7 backdrop-blur-2xl transition duration-300 will-change-transform flex flex-col justify-between text-right ${
        dark
          ? "border-white/[0.08] bg-[#0c1218]/90 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-[#f8ca14]/50 hover:shadow-[0_20px_50px_rgba(248,202,20,0.15)]"
          : "border-black/[0.06] bg-white/95 text-black shadow-[0_15px_35px_rgba(0,0,0,0.04)] hover:border-[#08467d]/40 hover:shadow-[0_15px_35px_rgba(8,70,125,0.1)]"
      }`}
    >
      {/* Specular Glare */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-[2.2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.14) 0%, transparent 60%)`,
        }}
      />

      {/* Giant Holographic Number in Background */}
      <span
        className={`pointer-events-none absolute -left-2 -bottom-4 select-none font-black text-7xl sm:text-8xl leading-none transition duration-500 group-hover:scale-105 ${
          dark ? "text-white/[0.04] group-hover:text-[#f8ca14]/[0.08]" : "text-black/[0.03] group-hover:text-[#08467d]/[0.06]"
        }`}
      >
        0{index + 1}
      </span>

      <div>
        {/* Top Header with Icon & Badge */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div
            className={`grid h-14 w-14 place-items-center rounded-2xl border transition duration-500 group-hover:scale-110 shadow-sm ${
              dark
                ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
            }`}
          >
            <Icon size={26} />
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-black border backdrop-blur-md ${
              dark
                ? "border-white/10 bg-white/5 text-slate-300"
                : "border-black/5 bg-slate-100 text-slate-700"
            }`}
          >
            {pillar.badge}
          </span>
        </div>

        {/* Title */}
        <h4 className={`text-xl sm:text-2xl font-black mb-3 relative z-10 ${dark ? "text-white" : "text-[#0a192f]"}`}>
          {pillar.title}
        </h4>

        {/* Description */}
        <p className={`text-xs sm:text-sm leading-relaxed mb-4 relative z-10 font-medium ${dark ? "text-slate-300" : "text-slate-600"}`}>
          {pillar.desc}
        </p>

        {/* Core Subpoints */}
        <div className="space-y-2 mb-4 relative z-10">
          {pillar.subPoints.map((pt, pIdx) => (
            <div key={pIdx} className="flex items-start gap-2 text-xs font-bold">
              <CheckCircle2 size={14} className="text-[#f8ca14] shrink-0 mt-0.5" />
              <span className={dark ? "text-slate-300" : "text-slate-700"}>{pt}</span>
            </div>
          ))}
        </div>

        {/* Expandable Student Outcomes Drawer */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="pt-4 mt-4 border-t border-white/10 space-y-2 relative z-10"
            >
              <div className="flex items-center gap-1.5 text-xs font-black text-[#f8ca14] mb-2">
                <BookOpen size={14} />
                <span>ما يتعلمه الطالب ويحققه واقعياً:</span>
              </div>
              {pillar.studentOutcomes.map((outcome, oIdx) => (
                <div key={oIdx} className="p-2.5 rounded-xl border border-white/10 bg-black/40 text-[11px] font-bold text-slate-200">
                  ✦ {outcome}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expand / Details Button */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`mt-4 pt-3 border-t text-xs font-black flex items-center justify-between transition relative z-10 ${
          dark
            ? "border-white/10 text-[#f8ca14] hover:text-white"
            : "border-[#08467d]/15 text-[#08467d] hover:text-[#f8ca14]"
        }`}
      >
        <span>{expanded ? "طي مخرجات الركيزة" : "استكشف مخرجات الطالب ✦"}</span>
        <ChevronDown size={15} className={`transition-transform duration-300 ${expanded ? "rotate-180" : "rotate-0"}`} />
      </button>
    </div>
  );
}

interface InstitutionalPillarsDeckProps {
  dark?: boolean;
}

export function InstitutionalPillarsDeck({ dark = true }: InstitutionalPillarsDeckProps) {
  return (
    <section
      id="pillars-section"
      className={`py-20 border-y transition-colors ${
        dark ? "border-white/10 bg-[#06080d]" : "border-[#08467d]/15 bg-white"
      }`}
    >
      <div className="w-full max-w-[1380px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8">
        {/* 1. Unified Section Header */}
        <AqeeqSectionHeader
          id="about-pillars"
          badge="المرتكزات الأكاديمية والتربوية للصرح"
          badgeIcon={<Sparkles size={14} className="text-[#f8ca14]" />}
          title="ركائزنا التربوية الأربعة 🏛️"
          subtitle="منظومة متكاملة من القيم والمهارات تصوغ رحلة الطالب اليومية في مدارس العقيق، من مرحلة الطفولة المبكرة وحتى منصات التخرج الجامعي."
          dark={dark}
          align="right"
        />

        {/* 2. Pillars 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar, idx) => (
            <PillarCardItem
              key={pillar.id}
              pillar={pillar}
              index={idx}
              dark={dark}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
