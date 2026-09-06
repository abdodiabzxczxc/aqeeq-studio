"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { Sparkles, UserCheck } from "lucide-react";

export interface ProfileItem {
  name?: string;
  role?: string;
  image: string;
  badge?: string;
}

export interface ScrollingAnimationProps {
  kicker?: string;
  title?: string;
  titleSecond?: string;
  subtitle?: string;
  profiles?: ProfileItem[];
  themeMode?: "light" | "dark" | "auto";
  className?: string;
}

const DEFAULT_PROFILES: ProfileItem[] = [
  {
    name: "أ. عبد الله الحربي",
    role: "الإدارة العامة والإشراف التربوي",
    image: "https://cdn.21st.dev/assets/mirror/2e/2eac31ad01deffd9c22feb7d8776ae8a42678478f9668f3398b30f054a9dcdc1.jpg",
    badge: "قيادة",
  },
  {
    name: "د. سارة الأحمدي",
    role: "وكيلة التطوير الأكاديمي والاعتمادات",
    image: "https://cdn.21st.dev/assets/mirror/75/753c082d473ad13350c7faa9e54c5ab845306e1e39abd127c42678c5bf45745b.jpg",
    badge: "اعتماد",
  },
  {
    name: "م. حسام الجهني",
    role: "رائد معامل الروبوتكس والذكاء الاصطناعي",
    image: "https://cdn.21st.dev/assets/mirror/b1/b1bc79efec2b18c3f26c149f5a58b5147a20062eef20728a38b0d5824dc5d641.jpg",
    badge: "STEM",
  },
  {
    name: "أحمد السالم",
    role: "المركز الأول في أولمبياد العلوم الوطني",
    image: "https://cdn.21st.dev/assets/mirror/86/86841d58a59a486d07f86b8496ce9bacdfea520061571468f8018287c8645b2c.jpg",
    badge: "موهبة",
  },
  {
    name: "نورة الشريف",
    role: "متفوقة خريجي الدفعة الماسية",
    image: "https://cdn.21st.dev/assets/mirror/e9/e9c61ab577cb43536f4bbcd5e0982b5f0188710c2a5e2df1d46814d16ba64548.jpg",
    badge: "خريجون",
  },
  {
    name: "أ. فهد العمري",
    role: "رئيس قسم الرياضيات والقدرات",
    image: "https://cdn.21st.dev/assets/mirror/78/78de81fdb01600166e4914ba0b2f7093d223bb02810146015006200d3d472306.jpg",
    badge: "كوادر",
  },
  {
    name: "ريان الأندونوسي",
    role: "ذهبية مسابقة الفيرست ليغو الدولية",
    image: "https://cdn.21st.dev/assets/mirror/83/83e0b3a916452db68b925024a8c945e107683c016df38880a36fa8f6cc5723a6.jpg",
    badge: "بطولة",
  },
  {
    name: "أ. منى الزهراني",
    role: "مشرفة المسار الدولي وكوجنيا (Cognia)",
    image: "https://cdn.21st.dev/assets/mirror/a3/a389fd14162653563a678fbab6cd13d2bc08593094b9bae5f67284cf2cf335de.jpg",
    badge: "دولي",
  },
];

export function ScrollingAnimation({
  kicker = "✦ صُناع الأثر والتميز التربوي · 30 عاماً بطيبة الطيبة ✦",
  title = "الإنسان أولاً",
  titleSecond = "في العقيق",
  subtitle = "من الروضة حتى التخرج · نخبة من القيادات الأكاديمية والكوادر الوطنية والمعلمين يرافقون أجيال العقيق بطيبة الطيبة.",
  profiles = DEFAULT_PROFILES,
  themeMode = "auto",
  className = "",
}: ScrollingAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeProfile, setActiveProfile] = useState<ProfileItem | null>(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  const { theme: siteTheme } = useAqeeqStudioTheme();
  const isDark = themeMode === "auto" ? siteTheme === "dark" : themeMode === "dark";

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  // Mobile: safe max radius 142px (142 + 26 = 168px < 187px on 375px screens)
  // Clear inner diameter becomes ~232px on mobile, perfectly clearing central text
  const maxRadius = isMobile ? 140 : isTablet ? 210 : 275;

  // Track scroll progress of this container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [currentProgress, setCurrentProgress] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setCurrentProgress(latest);
  });

  // Smooth transforms for concentric orbital rings
  const outerRingOpacity = useTransform(scrollYProgress, [0.25, 0.45], [0, 1]);
  const midRingOpacity = useTransform(scrollYProgress, [0.12, 0.3], [0, 1]);
  // Text only fades in after cards have expanded past the inner clear zone
  const textOpacity = useTransform(scrollYProgress, isMobile ? [0.35, 0.55] : [0.22, 0.42], [0, 1]);
  const textScale = useTransform(scrollYProgress, isMobile ? [0.35, 0.55] : [0.22, 0.42], [0.85, 1]);

  return (
    <div
      ref={containerRef}
      className={`relative min-h-[160vh] sm:min-h-[180vh] w-full ${
        isDark ? "bg-[#070c12] text-white" : "bg-white text-slate-900"
      } ${className}`}
      dir="rtl"
    >
      {/* Sticky Viewport Stage */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            background: isDark
              ? "radial-gradient(circle at 50% 50%, rgba(8, 70, 125, 0.22) 0%, rgba(7, 12, 18, 0) 72%)"
              : "radial-gradient(circle at 50% 50%, rgba(248, 202, 20, 0.14) 0%, rgba(255, 255, 255, 0) 72%)",
            opacity: outerRingOpacity,
          }}
        />

        {/* Orbit Core Assembly */}
        <div className="relative flex items-center justify-center transition-transform duration-300">
          {/* Outer Orbit Track Ring 1 */}
          <motion.div
            style={{ opacity: outerRingOpacity }}
            className={`w-[310px] h-[310px] sm:w-[460px] sm:h-[460px] md:w-[570px] md:h-[570px] rounded-full flex items-center justify-center ${
              isDark
                ? "border-2 border-[#f8ca14]/20 shadow-[0_0_40px_rgba(248,202,20,0.06)]"
                : "border-2 border-[#08467d]/15 shadow-[0_0_35px_rgba(8,70,125,0.06)]"
            }`}
          >
            {/* Mid Orbit Track Ring 2 */}
            <motion.div
              style={{ opacity: midRingOpacity }}
              className={`w-[260px] h-[260px] sm:w-[380px] sm:h-[380px] md:w-[470px] md:h-[470px] rounded-full flex items-center justify-center relative ${
                isDark
                  ? "border-2 border-[#08467d]/35"
                  : "border-2 border-slate-200"
              }`}
            >
              {/* Inner Luminous Identity Ring - Al-Aqeeq Royal Brand */}
              <div
                className={`w-[210px] h-[210px] sm:w-[310px] sm:h-[310px] md:w-[370px] md:h-[370px] rounded-full p-0.5 flex items-center justify-center relative shadow-xl ${
                  isDark
                    ? "bg-gradient-to-r from-[#08467d] via-[#f8ca14] to-[#015a37]"
                    : "bg-gradient-to-r from-[#08467d] via-[#f8ca14] to-[#059669]"
                }`}
              >
                {/* Center Core Stage Disc */}
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center relative shadow-inner ${
                    isDark ? "bg-[#0c1218]" : "bg-white"
                  }`}
                >
                  {/* Orbiting Profile Cards (8 equidistant nodes along orbit with spiral motion) */}
                  {profiles.slice(0, 8).map((profile, index) => {
                    const baseAngle = (index * Math.PI) / 4;

                    return (
                      <ProfileOrbitCard
                        key={index}
                        profile={profile}
                        index={index}
                        baseAngle={baseAngle}
                        maxRadius={maxRadius}
                        scrollYProgress={scrollYProgress}
                        isDark={isDark}
                        isMobile={isMobile}
                        onHover={setActiveProfile}
                      />
                    );
                  })}

                  {/* Central Text Core (Smooth Reveal as Orbit Expands) */}
                  <motion.div
                    style={{
                      opacity: activeProfile ? 1 : textOpacity,
                      scale: textScale,
                    }}
                    className="flex flex-col items-center justify-center relative z-10 px-3 sm:px-4"
                  >
                    {/* Hover Inspector Card */}
                    {activeProfile ? (
                      <div className="text-center animate-in fade-in zoom-in-95 duration-200">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black mb-1.5 shadow-sm ${
                            isDark
                              ? "bg-[#f8ca14] text-black"
                              : "bg-[#08467d] text-white"
                          }`}
                        >
                          <UserCheck size={12} />
                          <span>{activeProfile.badge || "صُناع الأثر"}</span>
                        </div>
                        <h3 className="text-base sm:text-xl md:text-2xl font-black mb-0.5 truncate max-w-[190px] sm:max-w-xs">
                          {activeProfile.name}
                        </h3>
                        <p
                          className={`text-[10px] sm:text-xs max-w-[180px] sm:max-w-xs font-medium leading-tight ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          {activeProfile.role}
                        </p>
                      </div>
                    ) : (
                      /* Al-Aqeeq Heroic Statement */
                      <>
                        <div
                          className={`inline-flex items-center gap-1 text-[9px] sm:text-xs font-black uppercase tracking-wider mb-1 sm:mb-2 ${
                            isDark ? "text-[#f8ca14]" : "text-[#c59b27]"
                          }`}
                        >
                          <Sparkles size={12} />
                          <span>{kicker}</span>
                        </div>

                        <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-center tracking-tight leading-tight">
                          <span>{title} </span>
                          <span className={isDark ? "text-[#f8ca14]" : "text-[#08467d]"}>
                            {titleSecond}
                          </span>
                        </h2>

                        <p
                          className={`text-[10px] sm:text-xs md:text-sm text-center max-w-[180px] sm:max-w-xs mt-1.5 sm:mt-2.5 leading-relaxed font-medium ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          {subtitle}
                        </p>
                      </>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Dedicated Orbit Card Sub-component with GPU-accelerated motion values
function ProfileOrbitCard({
  profile,
  index,
  baseAngle,
  maxRadius,
  scrollYProgress,
  isDark,
  isMobile,
  onHover,
}: {
  profile: ProfileItem;
  index: number;
  baseAngle: number;
  maxRadius: number;
  scrollYProgress: any;
  isDark: boolean;
  isMobile: boolean;
  onHover: (p: ProfileItem | null) => void;
}) {
  const baseRadius = isMobile ? 38 : 65;

  const x = useTransform(scrollYProgress, (p: number) => {
    const angle = baseAngle + p * Math.PI * 0.35;
    const currentRadius = baseRadius + p * (maxRadius - baseRadius);
    return currentRadius * Math.cos(angle);
  });

  const y = useTransform(scrollYProgress, (p: number) => {
    const angle = baseAngle + p * Math.PI * 0.35;
    const currentRadius = baseRadius + p * (maxRadius - baseRadius);
    return currentRadius * Math.sin(angle);
  });

  return (
    <motion.div
      onMouseEnter={() => onHover(profile)}
      onMouseLeave={() => onHover(null)}
      style={{ x, y }}
      className={`group absolute w-[52px] h-[52px] sm:w-18 sm:h-18 md:w-22 md:h-22 rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-3 shadow-xl z-20 cursor-pointer will-change-transform ${
        isDark
          ? "border-[#0c1218] bg-[#141b22] hover:border-[#f8ca14] hover:shadow-[0_0_25px_rgba(248,202,20,0.5)]"
          : "border-white bg-slate-100 hover:border-[#08467d] hover:shadow-[0_12px_28px_rgba(8,70,125,0.25)]"
      }`}
    >
      <img
        src={profile.image}
        alt={profile.name || `عضو العقيق ${index + 1}`}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
        decoding="async"
      />

      {/* Miniature Role Badge */}
      {profile.badge && (
        <div
          className={`absolute bottom-0 inset-x-0 py-0.5 text-[8px] sm:text-[10px] font-black text-center backdrop-blur-md transition-opacity duration-300 ${
            isDark
              ? "bg-black/85 text-[#f8ca14]"
              : "bg-[#08467d]/90 text-white"
          }`}
        >
          {profile.badge}
        </div>
      )}
    </motion.div>
  );
}

// Standalone fallback export requested
export function HomePage() {
  return <ScrollingAnimation />;
}

export default ScrollingAnimation;
