"use client";

import React, { useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  Sparkles,
  Building2,
  Calendar,
  History,
  GraduationCap,
  Award,
  BookOpen,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export interface AboutHeritageItem {
  id: string;
  title: string;
  category: string;
  yearOrBadge: string;
  image: string;
  highlight: string;
}

const ABOUT_HERITAGE_ITEMS: AboutHeritageItem[] = [
  // Col 1: Campuses & Architecture (moves UP)
  {
    id: "abt-boys-campus",
    title: "مجمع الرانونا للبنين (مممشى الهجرة)",
    category: "صروح العقيق التعليمية",
    yearOrBadge: "مجمع متكامل 15,000 م²",
    image: "/covers/cover-about.jpg",
    highlight: "مجمع البنين",
  },
  {
    id: "abt-girls-campus",
    title: "مجمع البنات النموذجي بالمدينة",
    category: "بيئة تعليمية وبحثية رائدة",
    yearOrBadge: "مختبرات ومعامل متطورة",
    image: "/covers/student-excellence-about.jpg",
    highlight: "مجمع البنات",
  },
  {
    id: "abt-sports-arena",
    title: "المركز الرياضي والأولمبي المتكامل",
    category: "منشآت رياضية معتمدة",
    yearOrBadge: "مسبح أولمبي وصالات لياقة",
    image: "/covers/cover-admissions.jpg",
    highlight: "الصرح الرياضي",
  },
  {
    id: "abt-library-hub",
    title: "مكتبة العقيق الرقمية ومنصة البحث",
    category: "حاضنة الفكر والابتكار",
    yearOrBadge: "شاشات بحثية ومصادر عالمية",
    image: "/covers/student-lab-admissions.jpg",
    highlight: "المكتبة الرقمية",
  },

  // Col 2: Historical Milestones 1994 - 2026 (moves DOWN)
  {
    id: "abt-founding-1994",
    title: "تأسيس الصرح التربوي وانطلاق المسيرة",
    category: "محطات الريادة التاريخية",
    yearOrBadge: "1994 م ✦ البداية",
    image: "/covers/cover-about.jpg",
    highlight: "التأسيس 1994",
  },
  {
    id: "abt-intl-2008",
    title: "اعتماد كوجنيا والمسار الدولي الأمريكي",
    category: "التوسع نحو العالمية",
    yearOrBadge: "2008 م ✦ الاعتماد",
    image: "/covers/student-lab-admissions.jpg",
    highlight: "العالمية 2008",
  },
  {
    id: "abt-robotics-2018",
    title: "بطل المملكة وخامس العالم في الروبوت",
    category: "التفوق في المحافل الدولية",
    yearOrBadge: "2018 م ✦ بطولة العالم",
    image: "/covers/first-lego-champions.png",
    highlight: "أبطال WRO",
  },
  {
    id: "abt-jubilee-2026",
    title: "اليوبيل اللؤلؤي: 30 عاماً من العطاء",
    category: "قيادة المستقبل والتحول الذكي",
    yearOrBadge: "2026 م ✦ 30 عاماً",
    image: "/covers/student-excellence-about.jpg",
    highlight: "30 عاماً ريادة",
  },

  // Col 3: Academic Excellence & Alumni (moves UP)
  {
    id: "abt-teachers-academy",
    title: "أكاديمية العقيق لتطوير الكوادر التعليمية",
    category: "التطوير المهني المستمر",
    yearOrBadge: "+120 ساعة تدريبية سنوياً",
    image: "/covers/cover-about.jpg",
    highlight: "كفاءات تعليمية",
  },
  {
    id: "abt-mawhiba-center",
    title: "مركز رعاية الموهوبين والمبتكرين",
    category: "شراكة موهبة المعتمدة",
    yearOrBadge: "برامج إثرائية متخصصة",
    image: "/covers/student-lab-admissions.jpg",
    highlight: "رعاية الموهبة",
  },
  {
    id: "abt-alumni-pride",
    title: "سفراء العقيق في كبرى جامعات العالم",
    category: "ثمار 30 عاماً من الغرس",
    yearOrBadge: "أطباء ومهندسون وقادة",
    image: "/covers/student-excellence-about.jpg",
    highlight: "قصص نجاح",
  },
  {
    id: "abt-smart-future",
    title: "الفصول الذكية وشاشات المستقبل 4K",
    category: "منظومة التقنية المدرسية",
    yearOrBadge: "تجهيزات القرن 21",
    image: "/covers/cover-admissions.jpg",
    highlight: "المستقبل الذكي",
  },
];

interface AboutScrollCampusBackdropProps {
  dark?: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function AboutScrollCampusBackdrop({
  dark = true,
  containerRef,
}: AboutScrollCampusBackdropProps) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Critically damped spring physics: mass: 0.1, stiffness: 100, damping: 30
  // Damping ratio > 1: ZERO bounce, ZERO oscillation, pure silky organic gliding inertia
  const smoothConfig = { stiffness: 100, damping: 30, mass: 0.1, restDelta: 0.001 };

  // Constant, steady opacity throughout scroll — never starts dim or dissolves on scroll down
  const opacity = dark ? 0.48 : 0.42;

  // 3D perspective tilt with critically damped inertia
  const rawRotateX = useTransform(scrollYProgress, [0, 0.5], [12, 2]);
  const rawRotateZ = useTransform(scrollYProgress, [0, 0.5], [-3, 0]);
  const rotateX = useSpring(rawRotateX, smoothConfig);
  const rotateZ = useSpring(rawRotateZ, smoothConfig);

  // High-speed column vertical parallax in opposite directions (matching Articles)
  const rawCol1Y = useTransform(scrollYProgress, [0, 1], [0, -190]);
  const rawCol2Y = useTransform(scrollYProgress, [0, 1], [0, 170]);
  const rawCol3Y = useTransform(scrollYProgress, [0, 1], [0, -210]);
  const col1Y = useSpring(rawCol1Y, smoothConfig);
  const col2Y = useSpring(rawCol2Y, smoothConfig);
  const col3Y = useSpring(rawCol3Y, smoothConfig);

  const col1 = useMemo(() => ABOUT_HERITAGE_ITEMS.slice(0, 4), []);
  const col2 = useMemo(() => ABOUT_HERITAGE_ITEMS.slice(4, 8), []);
  const col3 = useMemo(() => ABOUT_HERITAGE_ITEMS.slice(8, 12), []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden [perspective:1400px] [transform-style:preserve-3d]"
    >
      {/* Deep subtle emerald & sapphire aura (pure dark, zero yellow mud) */}
      <div
        className={`absolute -top-32 right-1/4 h-[580px] w-[580px] rounded-full blur-[140px] opacity-15 pointer-events-none ${
          dark ? "bg-[#005A36]" : "bg-emerald-500/10"
        }`}
      />
      <div
        className={`absolute top-1/2 left-1/4 h-[520px] w-[520px] rounded-full blur-[140px] opacity-12 pointer-events-none ${
          dark ? "bg-[#08467d]" : "bg-[#08467d]/10"
        }`}
      />

      {/* 3D Parallax Streams */}
      <motion.div
        style={{
          opacity,
          rotateX,
          rotateZ,
        }}
        className="absolute -inset-x-8 -inset-y-20 grid grid-cols-3 gap-5 sm:gap-7 px-4"
      >
        {/* Stream 1: Campuses & Facilities (Moves Up) */}
        <motion.div style={{ y: col1Y }} className="flex flex-col gap-6">
          {col1.map((item, idx) => (
            <div
              key={`abt-col1-${item.id}-${idx}`}
              className={`group/card rounded-3xl border p-2.5 overflow-hidden shadow-2xl transition duration-500 ${
                dark
                  ? "border-white/10 bg-[#060c14]/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
                  : "border-black/10 bg-white/90 shadow-slate-200"
              }`}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-900">
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <span className="absolute top-2.5 right-2.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 px-2.5 py-0.5 text-[9px] font-black text-emerald-300 backdrop-blur-md">
                  {item.highlight}
                </span>
              </div>
              <div className="p-3 text-right">
                <span className="text-[9px] font-black text-emerald-400">{item.category}</span>
                <h4 className={`text-xs sm:text-sm font-black line-clamp-1 mt-0.5 ${dark ? "text-white" : "text-slate-900"}`}>
                  {item.title}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 font-medium flex items-center justify-end gap-1">
                  <span>{item.yearOrBadge}</span>
                  <Building2 size={11} className="text-emerald-400 shrink-0" />
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Stream 2: Historical Milestones 1994 - 2026 (Moves Down) */}
        <motion.div style={{ y: col2Y }} className="flex flex-col gap-6 -mt-16">
          {col2.map((item, idx) => (
            <div
              key={`abt-col2-${item.id}-${idx}`}
              className={`group/card rounded-3xl border p-2.5 overflow-hidden shadow-2xl transition duration-500 ${
                dark
                  ? "border-amber-400/20 bg-[#0a0d14]/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)] ring-1 ring-amber-400/10"
                  : "border-amber-500/30 bg-white/90 shadow-slate-200"
              }`}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-900">
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                <span className="absolute top-2.5 right-2.5 rounded-full bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 text-[9px] font-black text-amber-300 backdrop-blur-md flex items-center gap-1">
                  <Sparkles size={10} className="text-amber-400" />
                  <span>{item.highlight}</span>
                </span>
              </div>
              <div className="p-3 text-right">
                <span className="text-[9px] font-black text-[#f8ca14]">{item.category}</span>
                <h4 className={`text-xs sm:text-sm font-black line-clamp-1 mt-0.5 ${dark ? "text-white" : "text-slate-900"}`}>
                  {item.title}
                </h4>
                <p className="text-[10px] text-amber-300/80 mt-1 font-mono font-bold flex items-center justify-end gap-1">
                  <span>{item.yearOrBadge}</span>
                  <History size={11} className="text-[#f8ca14] shrink-0" />
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Stream 3: Pillars & Future (Moves Up) */}
        <motion.div style={{ y: col3Y }} className="flex flex-col gap-6">
          {col3.map((item, idx) => (
            <div
              key={`abt-col3-${item.id}-${idx}`}
              className={`group/card rounded-3xl border p-2.5 overflow-hidden shadow-2xl transition duration-500 ${
                dark
                  ? "border-white/10 bg-[#060c14]/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
                  : "border-black/10 bg-white/90 shadow-slate-200"
              }`}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-900">
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <span className="absolute top-2.5 right-2.5 rounded-full bg-[#08467d]/70 border border-white/20 px-2.5 py-0.5 text-[9px] font-black text-cyan-300 backdrop-blur-md">
                  {item.highlight}
                </span>
              </div>
              <div className="p-3 text-right">
                <span className="text-[9px] font-black text-cyan-400">{item.category}</span>
                <h4 className={`text-xs sm:text-sm font-black line-clamp-1 mt-0.5 ${dark ? "text-white" : "text-slate-900"}`}>
                  {item.title}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 font-medium flex items-center justify-end gap-1">
                  <span>{item.yearOrBadge}</span>
                  <GraduationCap size={12} className="text-cyan-400 shrink-0" />
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Soft Bottom Edge Gradient */}
      <div
        className={`absolute inset-x-0 bottom-0 h-32 pointer-events-none z-10 ${
          dark
            ? "bg-gradient-to-t from-[#05080e] via-[#05080e]/85 to-transparent"
            : "bg-gradient-to-t from-slate-50 via-slate-50/85 to-transparent"
        }`}
      />
    </div>
  );
}
