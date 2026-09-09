"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Sparkles,
  Building2,
  Cpu,
  Waves,
  Trophy,
  Compass,
  ArrowUpLeft,
} from "lucide-react";

export interface CampusFacilityItem {
  id: string | number;
  title: string;
  category: string;
  image: string;
  badge: string;
  desc: string;
}

const DEFAULT_CAMPUS_FACILITIES: CampusFacilityItem[] = [
  {
    id: "fac-1",
    title: "معامل الروبوت والذكاء الاصطناعي",
    category: "أكاديميات المستقبل",
    image: "/covers/student-lab-admissions.jpg",
    badge: "بطل المملكة وخامس العالم",
    desc: "تجهيزات رقمية متقدمة لتعليم البرمجة والذكاء الاصطناعي وخوارزميات الروبوت من الصفوف الأولى.",
  },
  {
    id: "fac-2",
    title: "المسبح نصف الأولمبي المغطى",
    category: "التربية الرياضية والبدنية",
    image: "/covers/cover-admissions.jpg",
    badge: "تدريب معتمد ومدربون محترفون",
    desc: "حوض سباحة مجهز بأنظمة تدفئة وتنقية متطورة لإعداد أبطال المدارس في السباحة والإنقاذ.",
  },
  {
    id: "fac-3",
    title: "المسرح الملكي وقاعات الاحتفالات",
    category: "الأنشطة والمهارات القيادية",
    image: "/covers/student-excellence-about.jpg",
    badge: "سعة 600 مقعد وأنظمة صوت محيطية",
    desc: "منصة التتويج والمؤتمرات المدرسية لتنمية مهارات الخطابة والإلقاء والقيادة لدى الطلاب.",
  },
  {
    id: "fac-4",
    title: "الفصول التفاعلية الذكية",
    category: "التعليم الرقمي المتطور",
    image: "/covers/cover-about.jpg",
    badge: "شاشات تفاعلية 4K",
    desc: "بيئة صفية مريحة تراعي المعايير الإرجونومية ومزودة بتقنيات تفاعلية متصلة بالسحابة التعليمية.",
  },
  {
    id: "fac-5",
    title: "أكاديمية الروبوت والابتكار WRO",
    category: "الملاعب والبطولات",
    image: "/covers/first-lego-champions.png",
    badge: "ملاعب قانونية وتجهيزات دولية",
    desc: "ملاعب كرة سلة ومسارات بطولات ومختبرات مجهزة بأرضيات خشبية أوروبية ممتصة للصدمات.",
  },
];

export interface AdmissionsCampusParallaxProps {
  facilities?: CampusFacilityItem[];
  header?: React.ReactNode;
  dark?: boolean;
  className?: string;
  onExploreFacility?: (fac: CampusFacilityItem) => void;
}

export function AdmissionsCampusParallax({
  facilities = DEFAULT_CAMPUS_FACILITIES,
  header,
  dark = true,
  className = "",
  onExploreFacility,
}: AdmissionsCampusParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Constant, ultra-subtle whisper opacity throughout scroll
  const opacity = dark ? 0.18 : 0.14;
  const translateY = useTransform(
    scrollYProgress,
    [0, 0.38],
    [isDesktop ? -380 : -120, isDesktop ? 160 : 40]
  );
  const scale = useTransform(scrollYProgress, [0, 0.38], [0.88, 1.05]);
  const rotateX = useTransform(scrollYProgress, [0, 0.38], [isDesktop ? 14 : 6, 0]);

  // Parallax offsets for the 4 flanking facility cards
  const card1Offset = useTransform(scrollYProgress, [0, 1], [0, isDesktop ? -120 : -40]);
  const card2Offset = useTransform(scrollYProgress, [0, 1], [0, isDesktop ? 140 : 50]);
  const card3Offset = useTransform(scrollYProgress, [0, 1], [0, isDesktop ? -100 : -35]);
  const card4Offset = useTransform(scrollYProgress, [0, 1], [0, isDesktop ? 120 : 45]);

  const centerItem = facilities[0] || DEFAULT_CAMPUS_FACILITIES[0];
  const item1 = facilities[1] || DEFAULT_CAMPUS_FACILITIES[1];
  const item2 = facilities[2] || DEFAULT_CAMPUS_FACILITIES[2];
  const item3 = facilities[3] || DEFAULT_CAMPUS_FACILITIES[3];
  const item4 = facilities[4] || DEFAULT_CAMPUS_FACILITIES[4];

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col self-auto overflow-hidden antialiased transition-colors duration-500 pb-16 [perspective:1400px] [transform-style:preserve-3d] ${
        dark ? "bg-[#05080e] text-white" : "bg-slate-50/70 text-slate-900"
      } ${className}`}
      style={{ minHeight: isDesktop ? "170vh" : "125vh" }}
      dir="rtl"
    >
      {/* Ambient campus atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className={`absolute -top-32 right-1/4 h-[580px] w-[580px] rounded-full blur-[140px] opacity-25 ${
            dark ? "bg-[#08467d]" : "bg-[#08467d]/20"
          }`}
        />
        <div
          className={`absolute top-1/2 left-1/4 h-[520px] w-[520px] rounded-full blur-[130px] opacity-20 ${
            dark ? "bg-[#f8ca14]" : "bg-[#f8ca14]/20"
          }`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 h-32 pointer-events-none z-10 ${
            dark
              ? "bg-gradient-to-t from-[#05080e] via-[#05080e]/80 to-transparent"
              : "bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent"
          }`}
        />
      </div>

      {/* Hero Header on top */}
      {header ? (
        <div className="relative z-20 mx-auto w-full max-w-[1380px] px-4 sm:px-6 md:px-8 pt-6 sm:pt-10 pb-4 text-right">
          {header}
        </div>
      ) : null}

      {/* 3D Zoom Parallax Campus Showcase */}
      <motion.div
        style={{
          opacity,
          translateY,
          scale,
          rotateX,
        }}
        className="relative z-10 mx-auto mt-8 w-full max-w-[1400px] px-4"
      >
        {/* Banner kicker */}
        <div className="flex items-center justify-between px-4 sm:px-8 mb-6">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f8ca14] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f8ca14]"></span>
            </span>
            <span className="text-xs sm:text-sm font-black tracking-wider text-[#f8ca14]">
              3D ZOOM PARALLAX · مرافق وصروح مدارس العقيق
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            توسّع تفاعلي في مرافق الحرم المدرسي
          </span>
        </div>

        {/* 5-Facility 3D Spatial Matrix */}
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-7 items-center">
          {/* Flanking Card 1: Top Right */}
          <motion.div
            style={{ y: card1Offset }}
            onClick={() => onExploreFacility?.(item1)}
            className={`cursor-pointer md:col-span-3 rounded-3xl border overflow-hidden p-3 shadow-xl backdrop-blur-xl transition duration-300 hover:scale-105 ${
              dark
                ? "border-white/10 bg-[#0d1218]/90 hover:border-[#f8ca14]/40"
                : "border-black/10 bg-white/90 hover:border-[#08467d]/30"
            }`}
          >
            <div className="relative h-44 rounded-2xl overflow-hidden">
              <img
                src={item1.image}
                alt={item1.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-between">
                <span className="self-start rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] font-black text-[#f8ca14] backdrop-blur-md">
                  {item1.category}
                </span>
                <div>
                  <h4 className="text-xs font-black text-white">{item1.title}</h4>
                  <p className="text-[10px] text-slate-300 line-clamp-1">{item1.badge}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Hero Centerpiece Card: Center (6 cols) */}
          <motion.div
            onClick={() => onExploreFacility?.(centerItem)}
            className={`cursor-pointer md:col-span-6 rounded-[2.5rem] border overflow-hidden p-4 shadow-2xl backdrop-blur-xl transition duration-500 hover:scale-[1.02] ${
              dark
                ? "border-[#f8ca14]/50 bg-[#0d1218] shadow-[0_25px_60px_rgba(248,202,20,0.18)] ring-1 ring-[#f8ca14]/30"
                : "border-[#08467d]/30 bg-white shadow-[0_25px_60px_rgba(8,70,125,0.15)]"
            }`}
          >
            <div className="relative h-72 sm:h-80 rounded-[2rem] overflow-hidden group">
              <img
                src={centerItem.image}
                alt={centerItem.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#f8ca14] px-3 py-1 text-[10px] font-black text-black shadow-md flex items-center gap-1">
                    <Sparkles size={12} />
                    {centerItem.badge}
                  </span>
                  <span className="rounded-full bg-black/70 px-3 py-1 text-[10px] font-black text-white backdrop-blur-md border border-white/20">
                    {centerItem.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {centerItem.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                    {centerItem.desc}
                  </p>
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/20">
                    <span className="text-[11px] font-bold text-[#f8ca14]">
                      جاهزية متكاملة لعام 2026 - 2027
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-black text-white hover:text-[#f8ca14]">
                      استكشف المرفق <ArrowUpLeft size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Flanking Card 2: Top Left */}
          <motion.div
            style={{ y: card2Offset }}
            onClick={() => onExploreFacility?.(item2)}
            className={`cursor-pointer md:col-span-3 rounded-3xl border overflow-hidden p-3 shadow-xl backdrop-blur-xl transition duration-300 hover:scale-105 ${
              dark
                ? "border-white/10 bg-[#0d1218]/90 hover:border-[#f8ca14]/40"
                : "border-black/10 bg-white/90 hover:border-[#08467d]/30"
            }`}
          >
            <div className="relative h-44 rounded-2xl overflow-hidden">
              <img
                src={item2.image}
                alt={item2.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-between">
                <span className="self-start rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] font-black text-[#f8ca14] backdrop-blur-md">
                  {item2.category}
                </span>
                <div>
                  <h4 className="text-xs font-black text-white">{item2.title}</h4>
                  <p className="text-[10px] text-slate-300 line-clamp-1">{item2.badge}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Flanking Card 3: Bottom Left */}
          <motion.div
            style={{ y: card3Offset }}
            onClick={() => onExploreFacility?.(item3)}
            className={`cursor-pointer md:col-span-6 rounded-3xl border overflow-hidden p-3.5 shadow-xl backdrop-blur-xl transition duration-300 hover:scale-[1.02] ${
              dark
                ? "border-white/10 bg-[#0d1218]/90 hover:border-[#f8ca14]/40"
                : "border-black/10 bg-white/90 hover:border-[#08467d]/30"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative h-32 w-full sm:w-44 rounded-2xl overflow-hidden shrink-0">
                <img
                  src={item3.image}
                  alt={item3.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 text-right">
                <span className="inline-block rounded-full bg-[#f8ca14]/15 border border-[#f8ca14]/40 px-2.5 py-0.5 text-[10px] font-black text-[#f8ca14] mb-1.5">
                  {item3.category}
                </span>
                <h4 className="text-sm font-black">{item3.title}</h4>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item3.desc}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Flanking Card 4: Bottom Right */}
          <motion.div
            style={{ y: card4Offset }}
            onClick={() => onExploreFacility?.(item4)}
            className={`cursor-pointer md:col-span-6 rounded-3xl border overflow-hidden p-3.5 shadow-xl backdrop-blur-xl transition duration-300 hover:scale-[1.02] ${
              dark
                ? "border-white/10 bg-[#0d1218]/90 hover:border-[#f8ca14]/40"
                : "border-black/10 bg-white/90 hover:border-[#08467d]/30"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative h-32 w-full sm:w-44 rounded-2xl overflow-hidden shrink-0">
                <img
                  src={item4.image}
                  alt={item4.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 text-right">
                <span className="inline-block rounded-full bg-[#f8ca14]/15 border border-[#f8ca14]/40 px-2.5 py-0.5 text-[10px] font-black text-[#f8ca14] mb-1.5">
                  {item4.category}
                </span>
                <h4 className="text-sm font-black">{item4.title}</h4>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item4.desc}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
