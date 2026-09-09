import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Waves,
  Cpu,
  Trophy,
  Palette,
  Sparkles,
  MapPin,
  Phone,
  CalendarCheck,
  ChevronLeft,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AqeeqSectionHeader } from "@/components/AqeeqSectionHeader";
import { useLocation } from "wouter";

export interface FacilityItem {
  id: string;
  name: string;
  tag: string;
  icon: any;
  image: string;
  badge: string;
  desc: string;
  giantMetrics: { num: string; label: string; sub: string }[];
  hotspots?: { id: string; title: string; desc: string; top: string; left: string }[];
}

const BOYS_FACILITIES: FacilityItem[] = [
  {
    id: "pool",
    name: "المسبح شبه الأولمبي المغطى",
    tag: "رياضة ولياقة احترافية",
    icon: Waves,
    image: "/covers/student-lab-admissions.jpg",
    badge: "معايير FINA الدولية",
    desc: "مسبح صرحي مغطى ومكيف بمواصفات قياسية وتدفئة مياه شتوية ذكية 30°C، يشرف عليه كباتن سباحة وإنقاذ معتمدون، مخصص لتدريب طلاب المراحل الأولية وحتى الثانوية في بيئة صحية وآمنة 100%.",
    giantMetrics: [
      { num: "25m", label: "طول الحوض", sub: "نصف أولمبي 6 مسارات" },
      { num: "30°C", label: "تدفئة شتوية", sub: "تحكم رقمي بالحرارة" },
      { num: "100%", label: "تعقيم متواصل", sub: "فلاتر أوزون صديقة" },
      { num: "4+", label: "مدربين معتمدين", sub: "إنقاذ وتدريب مائي" },
    ],
    hotspots: [
      { id: "h1", title: "مستشعرات التعقيم", desc: "نظام ضخ فلترة ثلاثي بالأوزون للحفاظ على نقاء المياه على مدار الساعة.", top: "35%", left: "25%" },
      { id: "h2", title: "مدرجات الجمهور الآمنة", desc: "مدرجات تسع 200 متفرج لحضور البطولات المدرسية والأولمبياد.", top: "60%", left: "70%" },
    ],
  },
  {
    id: "stem-lab",
    name: "أكاديمية الروبوت والذكاء الاصطناعي",
    tag: "مهارات القرن الـ 21",
    icon: Cpu,
    image: "/covers/first-lego-champions.png",
    badge: "المركز 5 عالمياً WRO",
    desc: "معامل ابتكار رائدة مجهزة بأحدث روبوتات VEX و LEGO SPIKE وبيئات بايثون للذكاء الاصطناعي، أشرفت على تدريب فريق العقيق الحائز على المركز الخامس عالمياً في أولمبياد الروبوت الدولي.",
    giantMetrics: [
      { num: "5th", label: "عالمياً WRO", sub: "إنجاز أولمبياد الروبوت" },
      { num: "40+", label: "حقيبة روبوت VEX", sub: "أحدث أجيال الأتمتة" },
      { num: "100%", label: "مناهج برمجة", sub: "بايثون وخوارزميات AI" },
      { num: "8", label: "جوائز سنوية", sub: "في المعارض الوزارية" },
    ],
    hotspots: [
      { id: "h3", title: "طاولات حلبات التحدي", desc: "طاولات بمقاسات معتمدة دولياً لمحاكاة مهمات أولمبياد الروبوت.", top: "45%", left: "30%" },
      { id: "h4", title: "محطات البرمجة الفردية", desc: "أجهزة متصلة بسحابة برمجية لتدريب الطلاب على بايثون ومفاهيم AI.", top: "25%", left: "65%" },
    ],
  },
  {
    id: "sports-arena",
    name: "الصالة الرياضية والملاعب المغطاة",
    tag: "بناء بدني وروح رياضية",
    icon: Trophy,
    image: "/covers/cover-about.jpg",
    badge: "أرضيات باركيه ومطاط معتمد",
    desc: "صالات رياضية متعددة الأغراض مجهزة بملاعب كرة سلة وكرة طائرة وتنس طاولة، بالإضافة إلى ملاعب العشب الصناعي الخارجية المكيفة للمسابقات الرياضية اليومية.",
    giantMetrics: [
      { num: "1200m²", label: "مساحة الصالة", sub: "صالات مغلقة ومكيفة" },
      { num: "3", label: "ملاعب متنوعة", sub: "كرة قدم وسلة وطائرة" },
      { num: "300", label: "سعة المدرجات", sub: "لحضور الأنشطة والبطولات" },
      { num: "VIP", label: "تجهيزات احترافية", sub: "إضاءة LED استوديو" },
    ],
  },
  {
    id: "auditorium",
    name: "مسرح العقيق ومركز المؤتمرات",
    tag: "منصة التكريم والخطابة",
    icon: Building2,
    image: "/covers/cover-accreditations.jpg",
    badge: "سعة 500 مقعد",
    desc: "مسرح مدرسي صرحي مجهز بأحدث أنظمة الصوتيات المحيطية والإضاءة المسرحية الاحترافية وشاشات العرض العملاقة، تقام عليه المؤتمرات الطلابية وحفلات التخرج السنوية.",
    giantMetrics: [
      { num: "500", label: "مقعد فندقي", sub: "تصميم مريح بانورامي" },
      { num: "4K", label: "شاشة LED رئيسية", sub: "عرض سينمائي متكامل" },
      { num: "Dolby", label: "نظام صوتي", sub: "توزيع صوتي متقدم" },
      { num: "100%", label: "تكييف مركزي", sub: "عوازل صوتية متطورة" },
    ],
  },
  {
    id: "smart-classes",
    name: "الفصول الذكية المتطورة",
    tag: "بيئة تعلم تفاعلية",
    icon: Sparkles,
    image: "/covers/student-lab-admissions.jpg",
    badge: "شاشات 4K التفاعلية",
    desc: "قاعات دراسية حديثة مصممة بنظام التهوية الصحية والإضاءة النهارية الطبيعية، ومجهزة بشاشات عرض تفاعلية تتيح للمعلم دمج التقنيات السحابية والوسائط المرئية.",
    giantMetrics: [
      { num: "85\"", label: "شاشات ذكية", sub: "تفاعلية باللمس المتعدد" },
      { num: "22", label: "طالباً كحد أقصى", sub: "كثافة مثالية للتركيز" },
      { num: "100%", label: "فلترة هواء", sub: "بيئة صحية نقية" },
      { num: "WiFi 6", label: "شبكة فائقة", sub: "اتصال تعليمي آمن" },
    ],
  },
];

const GIRLS_FACILITIES: FacilityItem[] = [
  {
    id: "early-childhood",
    name: "واحة الطفولة المبكرة ورياض الأطفال",
    tag: "تأسيس ممتع وبيئة آمنة",
    icon: Sparkles,
    image: "/covers/cover-about.jpg",
    badge: "منهج مونتيسوري ولعب هادف",
    desc: "بيئة نموذجية مبهجة ومخصصة لاكتشاف الطفل وتنمية مهاراته الحركية واللغوية، تحت إشراف معلمات متخصصات في رياض الأطفال وتوفير رعاية نفسية وصحية شاملة.",
    giantMetrics: [
      { num: "100%", label: "أمان وسلامة", sub: "أرضيات فوم وحواف محمية" },
      { num: "1:10", label: "نسبة المعلمات", sub: "رعاية مكثفة لكل طفل" },
      { num: "Mont.", label: "أركان استكشافية", sub: "تطوير الذكاء والحواس" },
      { num: "Healthy", label: "وجبات ومتابعة", sub: "إشراف صحي دقيق" },
    ],
  },
  {
    id: "girls-stem",
    name: "معامل العلوم والحاسب الآلي للبنات",
    tag: "تمكين الفتيات في التقنية",
    icon: Cpu,
    image: "/covers/first-lego-champions.png",
    badge: "مختبرات iMac وأجهزة متطورة",
    desc: "معامل علمية ورقمية معتمدة تمكّن الطالبات من إجراء التجارب الفيزيائية والكيميائية، والتدرب على مهارات التصميم الرقمي والبرمجة وحل المشكلات التنافسية.",
    giantMetrics: [
      { num: "30+", label: "أجهزة متطورة", sub: "برامج تصميم وكودينج" },
      { num: "100%", label: "تجهيز معملي", sub: "أدوات قياس وتجارب آمنة" },
      { num: "IELTS", label: "مختبر لغات", sub: "تدريب على الاستماع والحديث" },
      { num: "Gold", label: "مشاركات موهبة", sub: "أبحاث علمية فائزة" },
    ],
  },
  {
    id: "girls-auditorium",
    name: "المسرح الثقافي وقاعات الإلقاء",
    tag: "منبر الثقة والريادة",
    icon: Building2,
    image: "/covers/cover-accreditations.jpg",
    badge: "أنشطة أدبية ومناظرات",
    desc: "مسرح خاص بمجمع البنات مجهز لاحتضان الملتقيات الثقافية ومناظرات اللغة العربية ومسابقات حفظ القرآن الكريم والأنشطة الإبداعية على مدار العام الدراسي.",
    giantMetrics: [
      { num: "400", label: "مقعد مستقل", sub: "خصوصية وتجهيز كامل" },
      { num: "Studio", label: "صوت وإضاءة", sub: "تقنيات عرض متقدمة" },
      { num: "Weekly", label: "أنشطة دورية", sub: "صقل مهارات الخطابة" },
      { num: "100%", label: "راحة وتنظيم", sub: "أفضل المعايير المعمارية" },
    ],
  },
  {
    id: "girls-fitness",
    name: "صالة الجمباز واللياقة البدنية",
    tag: "نشاط وحيوية وصحة",
    icon: Trophy,
    image: "/covers/student-lab-admissions.jpg",
    badge: "إشراف مدربات لياقة",
    desc: "صالة رياضية مغلقة مكيفة مجهزة بأحدث أدوات التربية البدنية والجمباز الحركي للفتيات، لتعزيز الصحة والنشاط اليومي وبناء اللياقة البدنية السليمة.",
    giantMetrics: [
      { num: "Safe", label: "مراتب هوائية", sub: "حماية متكاملة للجمباز" },
      { num: "Daily", label: "حصص لياقة", sub: "برامج تنشيط بدني" },
      { num: "A/C", label: "تكييف متواصل", sub: "هواء منعش ونقي" },
      { num: "Coach", label: "مدربات معتمدات", sub: "تربية بدنية متخصصة" },
    ],
  },
  {
    id: "art-studio",
    name: "المرسم الفني واستوديو الإبداع",
    tag: "تذوق جمالي وفنون تشكيلية",
    icon: Palette,
    image: "/covers/cover-about.jpg",
    badge: "معارض فنية سنوية",
    desc: "مساحة إبداعية ملهمة تضم خامات وألواناً احترافية وفرشاً وفخاراً، حيث تتعلم الطالبات التعبير الفني والتصميم الجرافيكي والرسم التشكيلي باحتراف.",
    giantMetrics: [
      { num: "50+", label: "لوحة سنوياً", sub: "معارض الفنون المدرسية" },
      { num: "Creative", label: "أركان خزف ورسم", sub: "خامات فنية عالية الجودة" },
      { num: "Colors", label: "ألوان غير سامة", sub: "سلامة تامة للطالبات" },
      { num: "Expo", label: "مشاركات وطنية", sub: "جوائز في معارض المنطقة" },
    ],
  },
];

interface VirtualCampusExplorerProps {
  dark?: boolean;
}

export function VirtualCampusExplorer({ dark = true }: VirtualCampusExplorerProps) {
  const [, navigate] = useLocation();
  const [campusTab, setCampusTab] = useState<"boys" | "girls">("boys");
  const [activeFacilityIndex, setActiveFacilityIndex] = useState<number>(0);

  const facilities = campusTab === "boys" ? BOYS_FACILITIES : GIRLS_FACILITIES;
  const activeFac = facilities[activeFacilityIndex] || facilities[0];

  return (
    <section
      id="campuses-section"
      className="py-20 relative overflow-hidden bg-transparent border-0"
    >

      <div className="w-full max-w-[1380px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* 1. Unified Section Header */}
        <AqeeqSectionHeader
          id="about-campuses"
          badge="الصروح والمجمعات التعليمية النموذجية · حي الرانوناء"
          badgeIcon={<Building2 size={15} className="text-[#f8ca14]" />}
          title="استكشف مجمعاتنا بالمدينة المنورة 🏫"
          subtitle="مبانٍ مدرسية صرحية مستقلة بمحاذاة ممشى الهجرة، تضم تجهيزات أكاديمية ورياضية ومعملية بمعايير عالمية مستقلة تماماً للبنين والبنات."
          dark={dark}
          align="right"
        />

        {/* ========================================================
            UNIFIED ARCHITECTURAL ACCORDION STUDIO SHELL
            (Integrated Campus Switcher + Expanding Accordion)
        ======================================================== */}
        <div
          className={`rounded-[2.5rem] border p-3 sm:p-5 backdrop-blur-2xl shadow-2xl relative transition-all ${
            dark
              ? "bg-[#091218]/95 border-[#08467d]/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]"
              : "bg-white/95 border-slate-200/90 shadow-[0_20px_50px_-10px_rgba(8,70,125,0.08)]"
          }`}
        >
          {/* 2. Integrated Control Header Bar inside the container */}
          <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b ${
            dark ? "border-white/10" : "border-slate-200"
          }`}>
            {/* Campus Switcher Pills - Embedded inside the shell */}
            <div className={`inline-flex items-center rounded-2xl border p-1 sm:p-1.5 shadow-inner backdrop-blur-md ${
              dark ? "border-white/15 bg-black/50" : "border-slate-200 bg-slate-100/90"
            }`}>
              <button
                type="button"
                onClick={() => {
                  setCampusTab("boys");
                  setActiveFacilityIndex(0);
                }}
                className={`relative z-10 rounded-xl px-4 sm:px-7 py-2 text-xs sm:text-sm font-black transition active:scale-95 ${
                  campusTab === "boys"
                    ? "text-[#f8ca14]"
                    : dark
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-[#08467d]"
                }`}
              >
                {campusTab === "boys" && (
                  <motion.div
                    layoutId="campusActiveTab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#08467d] to-[#042442] shadow-md ring-1 ring-[#f8ca14]/40"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span>مجمع البنين (الأهلي والدولي)</span>
                  <span>🦅</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCampusTab("girls");
                  setActiveFacilityIndex(0);
                }}
                className={`relative z-10 rounded-xl px-4 sm:px-7 py-2 text-xs sm:text-sm font-black transition active:scale-95 ${
                  campusTab === "girls"
                    ? "text-[#f8ca14]"
                    : dark
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-[#08467d]"
                }`}
              >
                {campusTab === "girls" && (
                  <motion.div
                    layoutId="campusActiveTab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#08467d] to-[#042442] shadow-md ring-1 ring-[#f8ca14]/40"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span>مجمع البنات والطفولة المبكرة</span>
                  <span>🌸</span>
                </span>
              </button>
            </div>

            {/* Live Indicator & Quick Location Info */}
            <div className={`hidden sm:flex items-center gap-3 text-xs font-bold ${
              dark ? "text-slate-300" : "text-slate-600"
            }`}>
              <span className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border backdrop-blur-md ${
                dark
                  ? "bg-white/5 border-white/10 text-[#f8ca14]"
                  : "bg-amber-50/80 border-amber-200 text-[#08467d]"
              }`}>
                <span className="h-2 w-2 rounded-full bg-[#f8ca14] animate-pulse" />
                <span className="font-black">5 مرافق نموذجية مجهزة</span>
              </span>
              <span className={dark ? "text-slate-300" : "text-slate-600"}>
                حي الرانوناء · ممشى الهجرة 📍
              </span>
            </div>
          </div>

          {/* 3. Desktop Expanding Architectural Accordion (5 Columns) */}
          <div className="hidden lg:flex h-[580px] gap-3 relative">
          {facilities.map((fac, fIdx) => {
            const FacIcon = fac.icon;
            const isExpanded = activeFacilityIndex === fIdx;

            return (
              <motion.div
                key={fac.id}
                layout
                transition={{ type: "spring", stiffness: 220, damping: 26, mass: 0.9 }}
                onClick={() => {
                  if (!isExpanded) {
                    setActiveFacilityIndex(fIdx);
                  }
                }}
                className={`relative rounded-[2rem] overflow-hidden border transition-colors duration-300 ${
                  isExpanded
                    ? dark
                      ? "flex-[5] border-[#f8ca14]/50 shadow-2xl ring-1 ring-[#f8ca14]/30"
                      : "flex-[5] border-[#08467d]/50 shadow-2xl ring-1 ring-[#08467d]/30"
                    : dark
                    ? "flex-1 min-w-[76px] border-white/10 hover:border-[#f8ca14]/40 cursor-pointer opacity-85 hover:opacity-100 group"
                    : "flex-1 min-w-[76px] border-slate-200 hover:border-[#08467d]/40 cursor-pointer opacity-90 hover:opacity-100 group shadow-sm"
                }`}
              >
                {/* Background Photo */}
                <img
                  src={fac.image}
                  alt={fac.name}
                  className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${
                    isExpanded ? "scale-105" : "grayscale-[25%] group-hover:scale-110"
                  }`}
                />
                {/* Dark Scrim */}
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    isExpanded
                      ? "bg-gradient-to-t from-black/95 via-black/60 to-black/30"
                      : "bg-black/75 group-hover:bg-black/60"
                  }`}
                />

                {/* Expanded View Content */}
                {isExpanded ? (
                  <div className="relative z-10 h-full flex flex-col justify-between p-8 text-right text-white">
                    {/* Top Bar with Badges & Live Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-xl bg-[#08467d]/90 border border-[#f8ca14]/40 px-3.5 py-1 text-xs font-black text-[#f8ca14] shadow-lg backdrop-blur-md">
                          {fac.tag} ✦
                        </span>
                        <span className="rounded-xl bg-black/60 border border-white/20 px-3 py-1 text-xs font-bold text-slate-200 backdrop-blur-md">
                          {fac.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#f8ca14] bg-black/60 px-3.5 py-1 rounded-full border border-[#f8ca14]/30 backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-[#f8ca14] animate-pulse" />
                        <span>مرفق حي مجهز 100%</span>
                      </div>
                    </div>

                    {/* Center Story */}
                    <div className="max-w-2xl my-auto py-4">
                      <h3 className="text-3xl sm:text-4xl font-black mb-3 drop-shadow-md text-white">
                        {fac.name}
                      </h3>
                      <p className="text-sm sm:text-base leading-relaxed text-slate-200 font-medium mb-6 drop-shadow">
                        {fac.desc}
                      </p>

                      {/* 4 Giant Metrics Chips */}
                      <div className="grid grid-cols-4 gap-3">
                        {fac.giantMetrics.map((gm, gIdx) => (
                          <div
                            key={gIdx}
                            className={`p-3 rounded-2xl border text-center transition-all ${
                              dark
                                ? "border-white/15 bg-black/50 backdrop-blur-xl"
                                : "border-white/30 bg-white/20 backdrop-blur-xl shadow-md"
                            }`}
                          >
                            <span className="block text-xl sm:text-2xl font-black text-[#f8ca14]">
                              {gm.num}
                            </span>
                            <span className="block text-[11px] font-black text-white truncate mt-0.5">
                              {gm.label}
                            </span>
                            <span className="block text-[10px] text-slate-200 truncate">
                              {gm.sub}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom CTA Row */}
                    <div className={`flex flex-wrap items-center gap-3 pt-4 border-t ${
                      dark ? "border-white/10" : "border-white/25"
                    }`}>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=Al+Aqiq+Schools+Al+Ranuna+Madinah"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#08467d] to-[#042442] hover:opacity-95 text-[#f8ca14] border border-[#f8ca14]/30 px-5 py-3 text-xs font-black shadow-lg transition active:scale-95"
                      >
                        <MapPin size={15} />
                        <span>الموقع في Google Maps 📍</span>
                      </a>
                      <a
                        href={campusTab === "boys" ? "tel:+966148131652" : "tel:+966148644466"}
                        className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-xs font-bold transition backdrop-blur-md ${
                          dark
                            ? "border-white/20 bg-white/10 hover:bg-white/20 text-white"
                            : "border-white/40 bg-white/25 hover:bg-white/35 text-white shadow-sm"
                        }`}
                      >
                        <Phone size={14} />
                        <span>{campusTab === "boys" ? "0148131652" : "0148644466"}</span>
                      </a>
                      <Button
                        onClick={() => navigate("/admissions")}
                        variant="outline"
                        className={`rounded-2xl text-xs font-black border transition ${
                          dark
                            ? "border-white/20 text-white hover:bg-white/10"
                            : "border-white/40 text-white bg-white/15 hover:bg-white/25 shadow-sm"
                        }`}
                      >
                        <CalendarCheck size={14} className="ml-1.5 text-[#f8ca14]" />
                        <span>حجز جولة تعريفية VIP ✦</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Compressed Vertical Spine */
                  <div className="relative z-10 h-full flex flex-col items-center justify-between py-8 select-none">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl border shadow-md backdrop-blur-md transition ${
                      dark
                        ? "bg-black/70 border-white/20 text-[#f8ca14] group-hover:border-[#f8ca14]/40"
                        : "bg-white/90 border-slate-200 text-[#08467d] group-hover:border-[#08467d]/40"
                    }`}>
                      <FacIcon size={20} />
                    </div>
                    <span className="font-black text-sm text-white [writing-mode:vertical-rl] tracking-wider transform rotate-180 group-hover:text-[#f8ca14] transition drop-shadow-md">
                      {fac.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border ${
                      dark
                        ? "text-[#f8ca14] bg-black/70 border-[#f8ca14]/30"
                        : "text-white bg-[#08467d]/90 border-[#f8ca14]/40"
                    }`}>
                      ✦ انقر للعرض
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* 4. Mobile & Tablet Interactive Accordion */}
        <div className="flex lg:hidden flex-col gap-3">
          {facilities.map((fac, fIdx) => {
            const FacIcon = fac.icon;
            const isExpanded = activeFacilityIndex === fIdx;

            return (
              <div
                key={fac.id}
                onClick={() => setActiveFacilityIndex(fIdx)}
                className={`rounded-3xl border overflow-hidden transition ${
                  isExpanded
                    ? dark
                      ? "border-[#f8ca14]/60 bg-[#0c1815] shadow-xl p-4"
                      : "border-[#08467d]/40 bg-slate-50 shadow-md p-4"
                    : dark
                    ? "border-white/10 bg-[#0b1015] p-3.5 cursor-pointer"
                    : "border-slate-200 bg-white p-3.5 cursor-pointer hover:bg-slate-50 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`grid h-10 w-10 place-items-center rounded-xl border ${
                      dark
                        ? "bg-black/60 border-white/15 text-[#f8ca14]"
                        : "bg-[#08467d]/10 border-[#08467d]/20 text-[#08467d]"
                    }`}>
                      <FacIcon size={18} />
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold block ${
                        dark ? "text-[#f8ca14]" : "text-[#08467d]"
                      }`}>{fac.tag}</span>
                      <h4 className={`text-sm font-black ${
                        dark ? "text-white" : "text-[#0a192f]"
                      }`}>{fac.name}</h4>
                    </div>
                  </div>
                  <span className={`text-xs font-black transition-transform ${
                    isExpanded
                      ? dark ? "rotate-90 text-[#f8ca14]" : "rotate-90 text-[#08467d]"
                      : "text-slate-400"
                  }`}>
                    ❯
                  </span>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`mt-4 pt-4 border-t space-y-4 text-right ${
                        dark ? "border-white/10" : "border-slate-200"
                      }`}
                    >
                      <div className="rounded-2xl overflow-hidden aspect-video relative">
                        <img src={fac.image} alt={fac.name} className="h-full w-full object-cover" />
                      </div>
                      <p className={`text-xs leading-relaxed font-medium ${
                        dark ? "text-slate-300" : "text-slate-600"
                      }`}>{fac.desc}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {fac.giantMetrics.map((gm, gIdx) => (
                          <div key={gIdx} className={`p-2.5 rounded-xl border text-center ${
                            dark
                              ? "border-white/10 bg-black/40"
                              : "border-slate-200 bg-white shadow-sm"
                          }`}>
                            <span className={`block text-lg font-black ${
                              dark ? "text-[#f8ca14]" : "text-[#08467d]"
                            }`}>{gm.num}</span>
                            <span className={`block text-[10px] font-bold ${
                              dark ? "text-white" : "text-slate-900"
                            }`}>{gm.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <a
                          href="https://www.google.com/maps/search/?api=1&query=Al+Aqiq+Schools+Al+Ranuna+Madinah"
                          target="_blank"
                          rel="noreferrer"
                          className="text-center py-2.5 rounded-xl bg-gradient-to-r from-[#08467d] to-[#042442] text-[#f8ca14] text-xs font-black shadow-md border border-[#f8ca14]/30"
                        >
                          الموقع في Google Maps 📍
                        </a>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/admissions");
                          }}
                          variant="outline"
                          className={`text-xs font-black border ${
                            dark
                              ? "border-white/20 text-white hover:bg-white/10"
                              : "border-slate-300 text-slate-800 hover:bg-slate-100"
                          }`}
                        >
                          حجز جولة تعريفية VIP ✦
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}
