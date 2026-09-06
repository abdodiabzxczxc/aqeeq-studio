"use client";

import React, { useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  Award,
  Globe2,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  Sparkles,
  FileCheck2,
  Landmark,
  BadgeCheck,
} from "lucide-react";

export interface AccreditationShieldItem {
  id: string;
  title: string;
  authority: string;
  badge: string;
  code: string;
  country: string;
  flag: string;
  image: string;
  accentColor: "gold" | "cyan" | "emerald" | "amber";
}

const ACCREDITATION_SHIELD_ITEMS: AccreditationShieldItem[] = [
  // Col 1: Global Academic Accreditations (moves UP)
  {
    id: "cred-cognia",
    title: "Cognia Quality Seal of Excellence",
    authority: "كوجنيا الأمريكية للاعتماد الدولي",
    badge: "اعتماد كامل لكافة المدارس بنسبة 99.2%",
    code: "VERIFIED SEAL · COGNIA USA #84912",
    country: "الولايات المتحدة",
    flag: "🇺🇸",
    image: "/covers/cover-accreditations.jpg",
    accentColor: "gold",
  },
  {
    id: "cred-cambridge",
    title: "Cambridge Assessment International",
    authority: "كامبريدج البريطانية للتقييم الأكاديمي",
    badge: "مركز تعليمي وامتحاني معتمد لكامبريدج",
    code: "CAMBRIDGE REGISTERED · UK #SA902",
    country: "المملكة المتحدة",
    flag: "🇬🇧",
    image: "/covers/student-lab-admissions.jpg",
    accentColor: "cyan",
  },
  {
    id: "cred-advanced",
    title: "AdvancED Global Education Standards",
    authority: "التحالف العالمي لمعايير جودة التعليم",
    badge: "معايير الجودة والتحسين المدرسي المستمر",
    code: "GLOBAL ACCREDITED INSTITUTION",
    country: "المعايير الدولية",
    flag: "🌐",
    image: "/covers/cover-about.jpg",
    accentColor: "emerald",
  },
  {
    id: "cred-moe-gold",
    title: "تصنيف الفئة الأولى للمدارس المتميزة",
    authority: "وزارة التعليم بالمملكة العربية السعودية",
    badge: "الدرجة الكاملة في معايير الجودة والاعتماد المدرسي",
    code: "MOE SAUDI ARABIA · CLASS A",
    country: "المملكة العربية السعودية",
    flag: "🇸🇦",
    image: "/covers/student-excellence-about.jpg",
    accentColor: "emerald",
  },

  // Col 2: Official Testing Centers & Exam Halls (moves DOWN)
  {
    id: "cred-sat",
    title: "College Board Official SAT Center",
    authority: "المقر الرسمي لاختبارات SAT بالمدينة المنورة",
    badge: "قاعات رقمية معتمدة لاختبارات SAT الدولية",
    code: "OFFICIAL TEST CENTER #657120",
    country: "College Board USA",
    flag: "📜",
    image: "/covers/cover-about.jpg",
    accentColor: "gold",
  },
  {
    id: "cred-ielts",
    title: "IDP & British Council IELTS Center",
    authority: "المركز المعتمد لاختبارات الآيلتس الرسمية",
    badge: "قاعات قياس لغوي معتمدة بالمدينة المنورة",
    code: "AUTHORIZED IELTS VENUE · IDP",
    country: "أستراليا وبريطانيا",
    flag: "🇦🇺",
    image: "/covers/cover-admissions.jpg",
    accentColor: "cyan",
  },
  {
    id: "cred-act",
    title: "ACT Global Assessment Center",
    authority: "المركز المعتمد لاختبارات ACT الأمريكية",
    badge: "مقر اختبارات القياس الأكاديمي الدولي",
    code: "ACT AUTHORIZED CENTER #9104",
    country: "ACT Education USA",
    flag: "🇺🇸",
    image: "/covers/student-lab-admissions.jpg",
    accentColor: "amber",
  },
  {
    id: "cred-qiyas",
    title: "مقر اختبارات قياس والقدرات والتحصيلي",
    authority: "المركز الوطني للقياس والتقويم (قياس)",
    badge: "أعلى متوسط درجات تحصيلي وقدرات بالمنطقة",
    code: "QIYAS EXCELLENCE VENUE",
    country: "المملكة العربية السعودية",
    flag: "🇸🇦",
    image: "/covers/student-excellence-about.jpg",
    accentColor: "emerald",
  },

  // Col 3: World Championships & Global Honors (moves UP)
  {
    id: "cred-fll",
    title: "First Lego League (FLL) Champion",
    authority: "بطولة المملكة للروبوتات والذكاء الاصطناعي",
    badge: "المركز الأول على مستوى المملكة والتأهل العالمي",
    code: "FLL NATIONAL CHAMPIONS · GOLD",
    country: "المنافسات الدولية",
    flag: "🏆",
    image: "/covers/first-lego-champions.png",
    accentColor: "gold",
  },
  {
    id: "cred-wro",
    title: "World Robot Olympiad (WRO)",
    authority: "أولمبياد الروبوت الدولي العالمي",
    badge: "المركز الخامس عالمياً بين 85 دولة متنافسة",
    code: "WRO GLOBAL TOP 5 LAUREATE",
    country: "أولمبياد العالم",
    flag: "🌍",
    image: "/covers/student-robotics-accreditations.jpg",
    accentColor: "cyan",
  },
  {
    id: "cred-mawhiba",
    title: "شراكة موهبة للمدارس المتميزة",
    authority: "مؤسسة الملك عبدالعزيز ورجاله للموهبة",
    badge: "فصول موهبة المعتمدة لرعاية النوابغ",
    code: "MAWHIBA ACCREDITED PARTNER",
    country: "المملكة العربية السعودية",
    flag: "🇸🇦",
    image: "/covers/student-excellence-about.jpg",
    accentColor: "emerald",
  },
  {
    id: "cred-aloha",
    title: "Aloha Mental Arithmetic World Cup",
    authority: "البطولة العالمية للحساب الذهني والرياضيات",
    badge: "أبطال العالم في السرعة والدقة الحسابية",
    code: "ALOHA GLOBAL CHAMPIONS",
    country: "المسابقات العالمية",
    flag: "⚡",
    image: "/covers/first-lego-champions.png",
    accentColor: "amber",
  },
];

interface AccreditationsScrollGlobalBackdropProps {
  dark?: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function AccreditationsScrollGlobalBackdrop({
  dark = true,
  containerRef,
}: AccreditationsScrollGlobalBackdropProps) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 190, damping: 26, bounce: 25 };

  // Subtle resting opacity at 0.12, blooming smoothly to 0.94 with zero scroll delay
  const rawOpacity = useTransform(scrollYProgress, [0, 0.20], [0.12, 0.94]);
  const opacity = useSpring(rawOpacity, springConfig);

  // 3D perspective tilt
  const rawRotateX = useTransform(scrollYProgress, [0, 0.5], [12, 2]);
  const rawRotateZ = useTransform(scrollYProgress, [0, 0.5], [-3, 0]);
  const rotateX = useSpring(rawRotateX, springConfig);
  const rotateZ = useSpring(rawRotateZ, springConfig);

  // High-speed column vertical parallax in opposite directions (matching Articles)
  const col1Y = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -190]),
    springConfig
  );
  const col2Y = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 170]),
    springConfig
  );
  const col3Y = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -210]),
    springConfig
  );

  const col1 = useMemo(() => ACCREDITATION_SHIELD_ITEMS.slice(0, 4), []);
  const col2 = useMemo(() => ACCREDITATION_SHIELD_ITEMS.slice(4, 8), []);
  const col3 = useMemo(() => ACCREDITATION_SHIELD_ITEMS.slice(8, 12), []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden [perspective:1400px] [transform-style:preserve-3d]"
    >
      {/* Deep subtle sapphire & emerald aura (pure dark, zero yellow) */}
      <div
        className={`absolute -top-32 right-1/4 h-[580px] w-[580px] rounded-full blur-[140px] opacity-15 pointer-events-none ${
          dark ? "bg-[#08467d]" : "bg-[#08467d]/10"
        }`}
      />
      <div
        className={`absolute top-1/2 left-1/4 h-[500px] w-[500px] rounded-full blur-[140px] opacity-12 pointer-events-none ${
          dark ? "bg-[#005A36]" : "bg-emerald-500/10"
        }`}
      />

      {/* 3D Parallax Streams of Prestige Accreditation Shields */}
      <motion.div
        style={{
          opacity,
          rotateX,
          rotateZ,
        }}
        className="absolute -inset-x-8 -inset-y-20 grid grid-cols-3 gap-5 sm:gap-7 px-4"
      >
        {/* Stream 1: Academic Accreditations (Moves Up) */}
        <motion.div style={{ y: col1Y }} className="flex flex-col gap-6">
          {col1.map((item, idx) => (
            <div
              key={`cred-col1-${item.id}-${idx}`}
              className={`group/card rounded-3xl border p-2.5 overflow-hidden shadow-2xl transition duration-500 backdrop-blur-xl ${
                dark
                  ? "border-amber-400/20 bg-[#070c14]/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)] ring-1 ring-white/5"
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
                <span className="absolute top-2.5 right-2.5 rounded-full bg-black/60 border border-white/20 px-2.5 py-0.5 text-[9px] font-black text-amber-300 backdrop-blur-md flex items-center gap-1">
                  <span>{item.flag}</span>
                  <span>{item.country}</span>
                </span>
              </div>
              <div className="p-3 text-right">
                <span className="text-[9px] font-black text-[#f8ca14]">{item.authority}</span>
                <h4 className={`text-xs sm:text-sm font-black line-clamp-1 mt-0.5 ${dark ? "text-white" : "text-slate-900"}`}>
                  {item.title}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 font-medium flex items-center justify-end gap-1">
                  <span>{item.badge}</span>
                  <BadgeCheck size={11} className="text-emerald-400 shrink-0" />
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Stream 2: Testing Centers (Moves Down) */}
        <motion.div style={{ y: col2Y }} className="flex flex-col gap-6 -mt-16">
          {col2.map((item, idx) => (
            <div
              key={`cred-col2-${item.id}-${idx}`}
              className={`group/card rounded-3xl border p-2.5 overflow-hidden shadow-2xl transition duration-500 backdrop-blur-xl ${
                dark
                  ? "border-cyan-400/25 bg-[#060e18]/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)] ring-1 ring-cyan-400/10"
                  : "border-cyan-500/20 bg-white/90 shadow-slate-200"
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
                <span className="absolute top-2.5 right-2.5 rounded-full bg-[#08467d]/70 border border-white/20 px-2.5 py-0.5 text-[9px] font-black text-cyan-300 backdrop-blur-md flex items-center gap-1">
                  <span>{item.flag}</span>
                  <span>{item.country}</span>
                </span>
              </div>
              <div className="p-3 text-right">
                <span className="text-[9px] font-black text-cyan-400">{item.authority}</span>
                <h4 className={`text-xs sm:text-sm font-black line-clamp-1 mt-0.5 ${dark ? "text-white" : "text-slate-900"}`}>
                  {item.title}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 font-medium flex items-center justify-end gap-1">
                  <span>{item.badge}</span>
                  <CheckCircle2 size={11} className="text-cyan-400 shrink-0" />
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Stream 3: World Championships & Honors (Moves Up) */}
        <motion.div style={{ y: col3Y }} className="flex flex-col gap-6">
          {col3.map((item, idx) => (
            <div
              key={`cred-col3-${item.id}-${idx}`}
              className={`group/card rounded-3xl border p-2.5 overflow-hidden shadow-2xl transition duration-500 backdrop-blur-xl ${
                dark
                  ? "border-emerald-500/25 bg-[#050f14]/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)] ring-1 ring-emerald-500/10"
                  : "border-emerald-500/20 bg-white/90 shadow-slate-200"
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
                <span className="absolute top-2.5 right-2.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 px-2.5 py-0.5 text-[9px] font-black text-emerald-300 backdrop-blur-md flex items-center gap-1">
                  <span>{item.flag}</span>
                  <span>{item.country}</span>
                </span>
              </div>
              <div className="p-3 text-right">
                <span className="text-[9px] font-black text-emerald-400">{item.authority}</span>
                <h4 className={`text-xs sm:text-sm font-black line-clamp-1 mt-0.5 ${dark ? "text-white" : "text-slate-900"}`}>
                  {item.title}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 font-medium flex items-center justify-end gap-1">
                  <span>{item.badge}</span>
                  <Trophy size={11} className="text-emerald-400 shrink-0" />
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
