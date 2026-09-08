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
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
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
  const ActiveIcon = activeFac.icon;

  return (
    <section
      id="campuses-section"
      className={`py-20 border-y relative overflow-hidden transition-colors ${
        dark ? "border-white/10 bg-[#05080c]" : "border-[#08467d]/15 bg-white"
      }`}
    >
      {/* Ambient Lighting Orbs */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full blur-3xl opacity-15 bg-[#08467d]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full blur-3xl opacity-15 bg-[#f8ca14]" />

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

        {/* 2. Campus Switcher Tabs (Boys vs Girls) */}
        <div className="flex justify-start mb-10">
          <div
            className={`inline-flex items-center rounded-2xl border p-1 sm:p-1.5 shadow-sm transition overflow-hidden ${
              dark ? "border-white/10 bg-[#0c141a]" : "border-slate-200/90 bg-slate-50"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setCampusTab("boys");
                setActiveFacilityIndex(0);
              }}
              className={`relative z-10 rounded-xl px-5 sm:px-8 py-2.5 text-xs sm:text-sm font-black transition active:scale-95 ${
                campusTab === "boys"
                  ? "text-[#f8ca14]"
                  : dark
                  ? "text-slate-400 hover:text-white"
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
                <span>🎓</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCampusTab("girls");
                setActiveFacilityIndex(0);
              }}
              className={`relative z-10 rounded-xl px-5 sm:px-8 py-2.5 text-xs sm:text-sm font-black transition active:scale-95 ${
                campusTab === "girls"
                  ? "text-[#f8ca14]"
                  : dark
                  ? "text-slate-400 hover:text-white"
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
        </div>

        {/* 3. MASTER-DETAIL SPLIT STUDIO LAYOUT (Apple/Tesla Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* RIGHT COLUMN: Interactive Facility Selector (5 cols, 42%) */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col gap-3 text-right">
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-xs font-black text-[#f8ca14] uppercase tracking-wider">
                ✦ اختر المرفق لاستعراض تجهيزاته ✦
              </span>
              <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>
                5 مرافق نموذجية
              </span>
            </div>

            {facilities.map((fac, idx) => {
              const FacIcon = fac.icon;
              const isActive = activeFacilityIndex === idx;

              return (
                <button
                  key={fac.id}
                  type="button"
                  onClick={() => setActiveFacilityIndex(idx)}
                  className={`group relative w-full p-4 rounded-2xl border text-right transition-all duration-300 active:scale-[0.99] flex items-center justify-between gap-4 ${
                    isActive
                      ? "bg-gradient-to-r from-[#08467d]/95 to-[#042442]/95 border-[#f8ca14]/70 shadow-xl ring-1 ring-[#f8ca14]/40 scale-[1.01]"
                      : dark
                      ? "border-white/10 bg-[#0c141a]/80 hover:bg-white/[0.05] hover:border-white/20 text-slate-300"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border transition-colors duration-300 ${
                        isActive
                          ? "bg-black/50 border-[#f8ca14]/50 text-[#f8ca14] shadow-md"
                          : dark
                          ? "border-white/10 bg-black/40 text-slate-400 group-hover:text-[#f8ca14] group-hover:border-[#f8ca14]/30"
                          : "border-slate-200 bg-slate-100 text-slate-600 group-hover:text-[#08467d]"
                      }`}
                    >
                      <FacIcon size={22} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border truncate ${
                            isActive
                              ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14]"
                              : dark
                              ? "border-white/10 bg-white/5 text-slate-400"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {fac.badge}
                        </span>
                      </div>
                      <h4
                        className={`text-sm sm:text-base font-black truncate transition-colors ${
                          isActive
                            ? "text-white"
                            : dark
                            ? "text-slate-200 group-hover:text-white"
                            : "text-slate-900 group-hover:text-[#08467d]"
                        }`}
                      >
                        {fac.name}
                      </h4>
                      <p
                        className={`text-[11px] font-medium truncate mt-0.5 ${
                          isActive ? "text-slate-200" : dark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {fac.tag}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    <ChevronLeft
                      size={18}
                      className={`transition-transform duration-300 ${
                        isActive
                          ? "text-[#f8ca14] translate-x-[-3px]"
                          : dark
                          ? "text-slate-500 group-hover:text-slate-300"
                          : "text-slate-400 group-hover:text-slate-700"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* LEFT COLUMN: Cinematic Showcase Stage & Specs Studio (7 cols, 58%) */}
          <div className="lg:col-span-7 order-1 lg:order-2 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFac.id}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`rounded-[2.5rem] border shadow-2xl overflow-hidden transition-colors ${
                  dark ? "border-white/15 bg-[#091218]/95" : "border-slate-200 bg-white"
                }`}
              >
                {/* 1. Cinematic 16:9 Image Showcase (Completely clean, NO text covering students) */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
                  <img
                    src={activeFac.image}
                    alt={activeFac.name}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  {/* Subtle edge scrims */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                  {/* Corner Status Badges */}
                  <div className="absolute top-4 right-4 left-4 flex items-center justify-between pointer-events-none">
                    <span className="rounded-xl bg-[#08467d]/90 border border-[#f8ca14]/40 px-3.5 py-1 text-xs font-black text-[#f8ca14] shadow-lg backdrop-blur-md">
                      {activeFac.tag} ✦
                    </span>
                    <span className="rounded-xl bg-black/70 border border-white/20 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-md flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>مرفق حي مجهز 100%</span>
                    </span>
                  </div>
                </div>

                {/* 2. Clean Dedicated Story & Specs Body (Below the Photo) */}
                <div className="p-6 sm:p-8 text-right">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#08467d]/20 text-[#08467d] dark:bg-[#f8ca14]/15 dark:text-[#f8ca14] border border-[#f8ca14]/30">
                      <ActiveIcon size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-[#f8ca14] block">
                        {activeFac.badge}
                      </span>
                      <h3 className={`text-xl sm:text-2xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
                        {activeFac.name}
                      </h3>
                    </div>
                  </div>

                  <p className={`text-xs sm:text-sm leading-relaxed mb-6 font-medium ${dark ? "text-slate-300" : "text-slate-700"}`}>
                    {activeFac.desc}
                  </p>

                  {/* 3. 4 Giant Metrics Cards (Clean separation) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
                    {activeFac.giantMetrics.map((gm, gIdx) => (
                      <div
                        key={gIdx}
                        className={`p-3 rounded-2xl border text-center transition-all hover:scale-[1.02] ${
                          dark ? "border-white/10 bg-black/50" : "border-slate-200 bg-slate-50 shadow-sm"
                        }`}
                      >
                        <span className="block text-xl sm:text-2xl font-black text-[#f8ca14]">
                          {gm.num}
                        </span>
                        <span className={`block text-xs font-black truncate mt-0.5 ${dark ? "text-white" : "text-black"}`}>
                          {gm.label}
                        </span>
                        <span className="block text-[10px] text-slate-400 truncate mt-0.5">
                          {gm.sub}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 4. Action Buttons Row */}
                  <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-white/10">
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
                      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold transition backdrop-blur-md ${
                        dark
                          ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                          : "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200"
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
                          : "border-slate-300 text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      <CalendarCheck size={14} className="ml-1.5 text-[#f8ca14]" />
                      <span>حجز جولة تعريفية VIP ✦</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
