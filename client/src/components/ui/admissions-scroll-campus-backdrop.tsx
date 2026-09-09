"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { Sparkles } from "lucide-react";

export interface AdmissionsBackdropItem {
  id: string | number;
  title?: string;
  image: string;
  badge?: string;
  category?: string;
  date?: string;
}

interface AdmissionsScrollCampusBackdropProps {
  items?: AdmissionsBackdropItem[];
  dark?: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  direction?: "left-to-right" | "right-to-left";
}

export const DEFAULT_ADMISSIONS_ITEMS: AdmissionsBackdropItem[] = [
  { id: "adm-1", title: "معامل الذكاء الاصطناعي وSTEM", image: "/covers/student-lab-admissions.jpg", badge: "بطل المملكة WRO", date: "أكاديميات المستقبل" },
  { id: "adm-2", title: "المسبح نصف الأولمبي المغطى", image: "/covers/cover-admissions.jpg", badge: "حوض FINA مدفأ", date: "صرح رياضي" },
  { id: "adm-3", title: "المسرح الملكي وقاعات المؤتمرات", image: "/covers/student-excellence-about.jpg", badge: "سعة 600 مقعد", date: "منصة التتويج" },
  { id: "adm-4", title: "الفصول التفاعلية الذكية 4K", image: "/covers/cover-about.jpg", badge: "شاشات 4K معتمدة", date: "بيئة ذكية" },
  { id: "adm-5", title: "أكاديمية فيرست ليجو للروبوت", image: "/covers/first-lego-champions.png", badge: "خامس العالم WRO", date: "بطولات دولية" },
  { id: "adm-6", title: "مختبرات العلوم والكيمياء الحديثة", image: "/covers/student-lab-admissions.jpg", badge: "معايير السلامة", date: "اكتشاف وتطبيق" },
  { id: "adm-7", title: "المسار الأمريكي المعتمد (Cognia)", image: "/covers/cover-about.jpg", badge: "مقر SAT & ACT", date: "المسار الدولي" },
  { id: "adm-8", title: "مرحلة الطفولة المبكرة ورياض الأطفال", image: "/covers/student-excellence-about.jpg", badge: "تأسيس مبهج", date: "رياض الأطفال" },
  { id: "adm-9", title: "منح التفوق وخصومات الأشقاء 15%", image: "/covers/cover-admissions.jpg", badge: "تسهيلات سداد", date: "منح ورعاية" },
  { id: "adm-10", title: "أجيال العقيق نحو كبرى الجامعات", image: "/covers/student-lab-admissions.jpg", badge: "قبول 100%", date: "نحو المستقبل" },
  { id: "adm-11", title: "برامج رعاية الموهبة والتفوق الأكاديمي", image: "/covers/student-excellence-about.jpg", badge: "أعلى معدلات التحصيلي", date: "صناع الريادة" },
  { id: "adm-12", title: "الصالة المغطاة للألعاب الرياضية", image: "/covers/cover-admissions.jpg", badge: "تدريب معتمد", date: "أنشطة وبطولات" },
  { id: "adm-13", title: "مكتبة العقيق الرقمية ومنصة البحث", image: "/covers/student-lab-admissions.jpg", badge: "شاشات بحثية", date: "حاضنة الفكر" },
  { id: "adm-14", title: "مركز التميز واللغات العالمية", image: "/covers/cover-about.jpg", badge: "IELTS & Cambridge", date: "كفاءة لغوية" },
  { id: "adm-15", title: "أبطال الروبوت والذكاء الاصطناعي", image: "/covers/first-lego-champions.png", badge: "تمثيل المملكة", date: "منصات الذهب" },
  { id: "adm-16", title: "بيئة تعليمية آمنة متكاملة", image: "/covers/cover-about.jpg", badge: "حافلات ومرافق ذكية", date: "رعاية شاملة" },
];

function AdmissionsPhotoCard({
  item,
  dark,
}: {
  item: AdmissionsBackdropItem;
  dark: boolean;
}) {
  return (
    <div
      className={`group relative z-10 w-[240px] h-[240px] sm:w-[290px] sm:h-[290px] md:w-[330px] md:h-[330px] rounded-[2rem] sm:rounded-[2.4rem] overflow-hidden border transition-all duration-300 shadow-2xl flex-shrink-0 select-none ${
        dark
          ? "border-white/10 bg-[#0d1218] shadow-black/80 ring-1 ring-white/5"
          : "border-black/10 bg-white shadow-slate-300"
      }`}
    >
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover select-none transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Ambient Depth Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 pointer-events-none" />

      {/* Top Badge */}
      {item.badge && (
        <div className="absolute top-3.5 right-3.5 z-10">
          <span className="rounded-xl bg-black/70 border border-white/15 px-2.5 py-1 text-[10px] font-black text-[#f8ca14] backdrop-blur-md shadow-md flex items-center gap-1">
            <Sparkles size={11} className="text-[#f8ca14]" />
            <span>{item.badge}</span>
          </span>
        </div>
      )}

      {/* Bottom Information */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-10 text-right text-white">
        <span className="inline-block text-[9px] sm:text-[10px] font-black text-[#f8ca14] mb-0.5">
          {item.date || item.category || "القبول والتسجيل"}
        </span>
        <p className="text-xs sm:text-sm font-black line-clamp-1 leading-snug drop-shadow-md">
          {item.title}
        </p>
      </div>

      {/* Hover Luxury Border Accent */}
      <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.4rem] border-2 border-transparent group-hover:border-[#f8ca14]/50 transition-colors duration-300 pointer-events-none" />
    </div>
  );
}

export function AdmissionsScrollCampusBackdrop({
  items = DEFAULT_ADMISSIONS_ITEMS,
  dark = true,
  containerRef,
  direction = "right-to-left",
}: AdmissionsScrollCampusBackdropProps) {
  const isRtl = direction === "right-to-left";

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

  // Critically damped spring physics: mass: 0.1, stiffness: 100, damping: 30
  // Damping ratio > 1: ZERO bounce, ZERO oscillation, pure silky organic gliding inertia
  const smoothConfig = { stiffness: 100, damping: 30, mass: 0.1, restDelta: 0.001 };

  // Constant, elegant subtle opacity throughout scroll
  const opacity = dark ? 0.30 : 0.24;

  // Parallax horizontal glides for the two grand rows in opposite directions
  const rawRow1X = useTransform(
    scrollYProgress,
    [0, 0.65],
    [0, isDesktop ? (isRtl ? -520 : 520) : (isRtl ? -280 : 280)]
  );
  const rawRow2X = useTransform(
    scrollYProgress,
    [0, 0.65],
    [0, isDesktop ? (isRtl ? 520 : -520) : (isRtl ? 280 : -280)]
  );
  const row1X = useSpring(rawRow1X, smoothConfig);
  const row2X = useSpring(rawRow2X, smoothConfig);

  // 3D perspective tilt: tilts gracefully and levels out
  const rawRotateX = useTransform(scrollYProgress, [0, 0.35], [isDesktop ? 14 : 7, 0]);
  const rawRotateZ = useTransform(
    scrollYProgress,
    [0, 0.35],
    [isDesktop ? (isRtl ? 4 : -4) : (isRtl ? 2 : -2), 0]
  );
  const rotateX = useSpring(rawRotateX, smoothConfig);
  const rotateZ = useSpring(rawRotateZ, smoothConfig);

  const displayItems = useMemo(() => {
    const base = items && items.length > 0 ? items : DEFAULT_ADMISSIONS_ITEMS;
    if (base.length >= 16) return base.slice(0, 16);
    const repeated: AdmissionsBackdropItem[] = [];
    while (repeated.length < 16) {
      repeated.push(...base);
    }
    return repeated.slice(0, 16);
  }, [items]);

  const row1 = displayItems.slice(0, 8);
  const row2 = displayItems.slice(8, 16);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden [perspective:1400px] [transform-style:preserve-3d]"
    >
      {/* Deep subtle sapphire & emerald ambient glow */}
      <div
        className={`absolute -top-32 ${isRtl ? "left-1/4" : "right-1/4"} h-[550px] w-[550px] rounded-full blur-[140px] opacity-15 pointer-events-none ${
          dark ? "bg-[#08467d]" : "bg-[#08467d]/10"
        }`}
      />
      <div
        className={`absolute top-1/3 ${isRtl ? "right-1/4" : "left-1/4"} h-[480px] w-[480px] rounded-full blur-[140px] opacity-12 pointer-events-none ${
          dark ? "bg-[#005A36]" : "bg-emerald-500/10"
        }`}
      />

      {/* 3D Moving Two Rows Stage (like Atheer without vinyl discs, pure photo cards) */}
      <motion.div
        style={{
          opacity,
          rotateX,
          rotateZ,
        }}
        className="pointer-events-none absolute -inset-x-16 top-20 sm:top-28 md:top-36 h-[165%] flex flex-col justify-start gap-7 sm:gap-10 [transform-style:preserve-3d] will-change-transform select-none"
      >
        {/* Top Row: Glides in one direction */}
        <motion.div
          style={{ x: row1X }}
          className="flex items-center justify-center gap-5 sm:gap-7 whitespace-nowrap"
        >
          {row1.map((item, idx) => (
            <AdmissionsPhotoCard
              key={`adm-r1-${item.id}-${idx}`}
              item={item}
              dark={dark}
            />
          ))}
        </motion.div>

        {/* Bottom Row: Glides in opposite direction */}
        <motion.div
          style={{ x: row2X }}
          className="flex items-center justify-center gap-5 sm:gap-7 whitespace-nowrap"
        >
          {row2.map((item, idx) => (
            <AdmissionsPhotoCard
              key={`adm-r2-${item.id}-${idx}`}
              item={item}
              dark={dark}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Soft Bottom Edge Gradient for clean transition to the content below */}
      <div
        className={`absolute inset-x-0 bottom-0 h-36 pointer-events-none z-10 ${
          dark
            ? "bg-gradient-to-t from-[#05080e] via-[#05080e]/85 to-transparent"
            : "bg-gradient-to-t from-slate-50 via-slate-50/85 to-transparent"
        }`}
      />
    </div>
  );
}
