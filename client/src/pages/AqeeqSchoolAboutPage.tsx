import { useState, useRef, useEffect, useMemo } from "react";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { AqeeqLuxuryPageShell } from "@/components/AqeeqLuxuryPageShell";
import { AqeeqGrandFinaleCta } from "@/components/AqeeqGrandFinaleCta";
import { useMagneticTilt, staggerContainer, fadeUpSpring } from "@/lib/motionPresets";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { AlaqeeqStudioSiteFooter } from "@/components/AlaqeeqStudioSiteFooter";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArticlesScrollParallaxBackdrop, type ArticleBackdropItem } from "@/components/ui/articles-scroll-parallax-backdrop";
import { trpc } from "@/lib/trpc";

export const ABOUT_UNFURLING_ITEMS = [
  { id: "about-1", title: "تأسيس مدارس العقيق 1994", image: "/covers/cover-about.jpg", badge: "30+ عاماً ريادة", date: "طيبة الطيبة" },
  { id: "about-2", title: "مجمع البنين - ممشى الهجرة", image: "/covers/cover-admissions.jpg", badge: "حي الرانوناء", date: "صرح تعليمي" },
  { id: "about-3", title: "مجمع البنات والطفولة المبكرة", image: "/covers/student-excellence-about.jpg", badge: "بيئة رائدة", date: "تعليم وتمكين" },
  { id: "about-4", title: "حفل الخريجين السنوي والتكريم", image: "/covers/student-excellence-about.jpg", badge: "قادة الغد", date: "أجيال العقيق" },
  { id: "about-5", title: "معامل الذكاء الاصطناعي وSTEM", image: "/covers/student-lab-admissions.jpg", badge: "تقنيات متقدمة", date: "معامل ذكية" },
  { id: "about-6", title: "أبطال العالم في الروبوت WRO", image: "/covers/first-lego-champions.png", badge: "المركز الخامس عالمياً", date: "إنجاز سعودي" },
  { id: "about-7", title: "المسرح الملكي والأنشطة الإثرائية", image: "/covers/cover-about.jpg", badge: "سعة 600 مقعد", date: "منبر الإبداع" },
  { id: "about-8", title: "المسار الدولي الأمريكي Cognia", image: "/covers/cover-admissions.jpg", badge: "معايير عالمية", date: "اعتماد دولي" },
  { id: "about-9", title: "مجمع الصالات الرياضية والمسبح", image: "/covers/cover-admissions.jpg", badge: "ألعاب قوى وسباحة", date: "لياقة وتفوق" },
  { id: "about-10", title: "مختبرات الابتكار والبحث العلمي", image: "/covers/student-lab-admissions.jpg", badge: "تجارب وبحوث", date: "حاضنة علمية" },
  { id: "about-11", title: "أولياء الأمور شركاء النجاح", image: "/covers/student-excellence-about.jpg", badge: "تواصل مستمر", date: "مجتمع العقيق" },
  { id: "about-12", title: "التحول الرقمي وشاشات 4K", image: "/covers/cover-about.jpg", badge: "فصول ذكية", date: "تعليم المستقبل" },
  { id: "about-13", title: "كفاءات تعليمية وتربوية نادرة", image: "/covers/student-lab-admissions.jpg", badge: "خبرات 15+ عاماً", date: "كادر متميز" },
  { id: "about-14", title: "المسابقات والجوائز الوطنية", image: "/covers/first-lego-champions.png", badge: "مراكز أولى", date: "منصات الشرف" },
  { id: "about-15", title: "برامج تعزيز الهوية الإسلامية", image: "/covers/cover-about.jpg", badge: "أصالة ومعاصرة", date: "بناء الشخصية" },
  { id: "about-16", title: "رؤية 2030 وبناء الإنسان", image: "/covers/student-excellence-about.jpg", badge: "جيل واعد", date: "رؤية وطن" },
];

const ABOUT_PARALLAX_ITEMS: ArticleBackdropItem[] = ABOUT_UNFURLING_ITEMS.map((item) => ({
  id: item.id,
  title: item.title,
  category: item.badge || item.date || "مدارس العقيق",
  authorName: item.date || "صرح العقيق",
  coverUrl: item.image,
}));

import {
  Building2,
  Sparkles,
  Award,
  ShieldCheck,
  GraduationCap,
  MapPin,
  Phone,
  ArrowRight,
  Star,
  MessageCircle,
} from "lucide-react";
import { TimelineHeritageScrubber } from "@/components/about/TimelineHeritageScrubber";
import { VirtualCampusExplorer } from "@/components/about/VirtualCampusExplorer";
import { VisionMissionCompass } from "@/components/about/VisionMissionCompass";
import { InstitutionalPillarsDeck } from "@/components/about/InstitutionalPillarsDeck";
import { MedinaLogisticsRadar } from "@/components/about/MedinaLogisticsRadar";

// ==========================================
// MAIN COMPONENT: AqeeqSchoolAboutPage
// ==========================================
export default function AqeeqSchoolAboutPage() {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [, navigate] = useLocation();
  const aboutHeroRef = useRef<HTMLDivElement>(null);

  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    refetchOnMount: true,
    staleTime: 0,
  });

  const dynamicAboutParallaxItems = useMemo<ArticleBackdropItem[]>(() => {
    const custom = (orchestration as any)?.backdrops?.about;
    if (custom && Array.isArray(custom) && custom.length > 0) {
      return custom.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.badge || item.date || "مدارس العقيق",
        authorName: item.date || "صرح العقيق",
        coverUrl: item.image,
      }));
    }
    return ABOUT_PARALLAX_ITEMS;
  }, [orchestration]);

  // فحص الشاشات الكبيرة لتفعيل فيزياء البعد الثالث على الكمبيوتر حصرياً
  // وتجنب انبعاج أو ميلان نصوص القراءة على الموبايل
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Scroll Tracking for Smooth Parallax
  const { scrollY } = useScroll();

  // Smooth critically-damped inertia physics: mass: 0.1, stiffness: 100, damping: 30
  // ZERO bounce, ZERO lag, ultra-silky glide across all devices
  const smoothConfig = { stiffness: 100, damping: 30, mass: 0.1, restDelta: 0.001 };

  // Hero Card 3D Scroll Physics
  const rawHeroCardY = useTransform(scrollY, [0, 500], [0, 45]);
  const rawHeroCardRotateX = useTransform(scrollY, [0, 500], [0, 6]);
  const rawHeroCardScale = useTransform(scrollY, [0, 500], [1, 0.94]);
  const heroCardY = useSpring(rawHeroCardY, smoothConfig);
  const heroCardRotateX = useSpring(rawHeroCardRotateX, smoothConfig);
  const heroCardScale = useSpring(rawHeroCardScale, smoothConfig);

  // Floating Satellite Badges Counter-Parallax
  const rawHeroBadge1Y = useTransform(scrollY, [0, 500], [0, -32]);
  const rawHeroBadge2Y = useTransform(scrollY, [0, 500], [0, 32]);
  const heroBadge1Y = useSpring(rawHeroBadge1Y, smoothConfig);
  const heroBadge2Y = useSpring(rawHeroBadge2Y, smoothConfig);

  const { ref: heroCardRef, tilt: heroTilt, onMove: onHeroMove, onLeave: onHeroLeave } = useMagneticTilt(6);
  return (
    <AqeeqLuxuryPageShell
      header={<AlaqeeqStudioSiteHeader title="عن مدارس العقيق الأهلية والدولية" active="about" />}
      footer={<AlaqeeqStudioSiteFooter />}
      useCurtain={false}
      curtainKicker="✦ استكشف صروح ومسيرة العقيق ✦"
      hero={
        <section
          ref={aboutHeroRef}
          style={{ minHeight: isDesktop ? "106vh" : "96vh" }}
          className={`relative isolate overflow-hidden min-h-[96vh] lg:min-h-[106vh] flex flex-col justify-between py-8 sm:py-12 transition-colors duration-500 ${
            dark ? "bg-[#05080e] text-white" : "bg-slate-50/70 text-slate-900"
          }`}
        >
          {/* Scroll-driven 3D Columns Backdrop from Right to Left (Articles Style) */}
          <ArticlesScrollParallaxBackdrop
            articles={dynamicAboutParallaxItems}
            dark={dark}
            containerRef={aboutHeroRef}
            direction="right-to-left"
          />

          <div className="w-full max-w-[1380px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 relative z-10 py-8 sm:py-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Right Column: Hero Content & CTAs (7 cols) */}
              <div className="lg:col-span-7 text-right">
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black backdrop-blur-md mb-6 shadow-sm ${
                    isNationalDay
                      ? dark
                        ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
                        : "border-[#08467d]/30 bg-blue-50 text-[#08467d]"
                      : dark
                      ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                      : "border-[#08467d]/25 bg-white text-[#08467d]"
                  }`}
                >
                  {isNationalDay ? <span>🇸🇦</span> : <Building2 size={14} className={dark ? "text-[#f8ca14]" : "text-[#c59b27]"} />}
                  <span>{isNationalDay ? "مسيرة وطنية رائدة منذ عام 1994 · عزّنا بطبعنا" : "صرح العقيق التعليمي الرائد بالمدينة المنورة"}</span>
                </div>

                <VisualEditable
                  id="about-hero-title"
                  tag="text"
                  label="عنوان هيرو عن المدارس"
                  defaultText="مدارس العقيق الأهلية والدولية."
                  as="h1"
                  className={`text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.18] mb-6 ${
                    dark ? "text-white" : "text-black"
                  }`}
                >
                  {(text) => {
                    const raw = text || "مدارس العقيق الأهلية والدولية.";
                    const match = raw.match(/^(مدارس العقيق)(.*)$/);
                    if (match) {
                      return (
                        <>
                          <span className={`block ${dark ? "text-white" : "text-black"}`}>
                            {match[1].trim()}
                          </span>
                          <span className={`block ${isNationalDay ? "snd-text-gradient" : dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                            {match[2].trim()}
                          </span>
                        </>
                      );
                    }
                    const words = raw.trim().split(/\s+/);
                    if (words.length >= 4) {
                      const mid = Math.floor(words.length / 2);
                      return (
                        <>
                          <span className={`block ${dark ? "text-white" : "text-black"}`}>
                            {words.slice(0, mid).join(" ")}
                          </span>
                          <span className={`block ${isNationalDay ? "snd-text-gradient" : dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                            {words.slice(mid).join(" ")}
                          </span>
                        </>
                      );
                    }
                    return <span>{raw}</span>;
                  }}
                </VisualEditable>

                <VisualEditable
                  id="about-hero-desc"
                  tag="text"
                  label="وصف هيرو عن المدارس"
                  defaultText="صرح تعليمي رائد للبنين والبنات في طيبة الطيبة. نهتم بتأهيل جيل متميز بأخلاق إسلامية راسخة وعلوم عصرية متقدمة، يجمع بين أصالة القيم ومعايير الاعتماد الدولي."
                  as="p"
                  className={`text-base sm:text-lg font-medium leading-relaxed max-w-2xl mb-8 ${
                    dark ? "text-slate-300" : "text-slate-700 font-medium"
                  }`}
                />

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 mb-10">
                  <Button
                    onClick={() => navigate("/admissions")}
                    className={`rounded-2xl px-8 py-6 text-base font-black shadow-xl transition active:scale-95 ${
                      dark
                        ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black hover:opacity-95 shadow-[#f8ca14]/20"
                        : "bg-gradient-to-r from-[#08467d] to-[#042442] text-white hover:opacity-95 shadow-[#08467d]/25"
                    }`}
                  >
                    <span>القبول والتسجيل والرسوم</span>
                    <ArrowRight size={18} className="mr-2" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/accreditations")}
                    className={`rounded-2xl px-8 py-6 text-base font-black border transition active:scale-95 shadow-sm ${
                      dark
                        ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                        : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <span>الاعتمادات ومراكز الاختبارات</span>
                  </Button>
                </div>

                {/* Quick Metrics Bar */}
                <div
                  className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-sm ${
                    dark ? "border-white/10 bg-white/[0.03]" : "border-[#08467d]/15 bg-white shadow-md"
                  }`}
                >
                  <div className="p-2 rounded-xl transition hover:scale-105">
                    <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>منذ 1994</span>
                    <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>+30 عاماً من الريادة</span>
                  </div>
                  <div className="p-2 rounded-xl transition hover:scale-105">
                    <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>مجمعين</span>
                    <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>للبنين والبنات</span>
                  </div>
                  <div className="p-2 rounded-xl transition hover:scale-105">
                    <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"}`}>Cognia</span>
                    <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>اعتماد أمريكي</span>
                  </div>
                  <div className="p-2 rounded-xl transition hover:scale-105">
                    <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>KG - 12</span>
                    <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>كافة المراحل</span>
                  </div>
                </div>
              </div>

              {/* Left Column: 3D Scroll Parallax Card with Floating Satellite Badges (5 cols) */}
              <div className="lg:col-span-5 relative">
                {/* Floating Orbiting Satellite Badge 1 (Top-Right Parallax) */}
                <motion.div
                  style={{ y: heroBadge1Y }}
                  className="absolute -top-6 -right-4 sm:-right-8 z-30 pointer-events-none hidden sm:flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#08467d]/95 to-[#042442]/95 text-white border border-[#f8ca14]/40 px-4 py-2 text-xs font-black shadow-2xl backdrop-blur-xl"
                >
                  <ShieldCheck size={16} className="text-[#f8ca14]" />
                  <span>Cognia USA · اعتماد دولي</span>
                </motion.div>

                {/* Floating Orbiting Satellite Badge 2 (Bottom-Left Parallax) */}
                <motion.div
                  style={{ y: heroBadge2Y }}
                  className="absolute -bottom-6 -left-4 sm:-left-8 z-30 pointer-events-none hidden sm:flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0c1218]/95 to-black/95 text-white border border-[#f8ca14]/40 px-4 py-2 text-xs font-black shadow-2xl backdrop-blur-xl"
                >
                  <Star size={14} className="text-[#f8ca14] fill-[#f8ca14]" />
                  <span>30 عاماً من الريادة · 1994 - 2026</span>
                </motion.div>

                <motion.div
                  style={{
                    y: heroCardY,
                    rotateX: heroCardRotateX,
                    scale: heroCardScale,
                    transformPerspective: 1200,
                  }}
                  className="w-full"
                >
                  <div
                    ref={heroCardRef}
                    onMouseMove={onHeroMove}
                    onMouseLeave={onHeroLeave}
                    style={{
                      transform: `perspective(1000px) rotateX(${heroTilt.x}deg) rotateY(${heroTilt.y}deg)`,
                      transition: "transform 0.15s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.3s ease",
                    }}
                    className={`group relative rounded-[2.5rem] p-3 sm:p-4 border transition duration-500 shadow-2xl will-change-transform ${
                      dark
                        ? "border-[#f8ca14]/30 bg-[#0b1218] shadow-black/80 ring-1 ring-[#f8ca14]/20"
                        : "border-[#08467d]/15 bg-white shadow-xl ring-1 ring-[#08467d]/10"
                    }`}
                  >
                    {/* Specular glare following cursor */}
                    <div
                      className="pointer-events-none absolute inset-0 z-20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at ${heroTilt.gx}% ${heroTilt.gy}%, rgba(255,255,255,0.18) 0%, transparent 60%)`,
                      }}
                    />

                    {/* Close-Up Student Excellence Photo */}
                    <div className="relative overflow-hidden rounded-[2rem] aspect-[4/3] sm:aspect-[16/12]">
                      <VisualImage
                        id="about-hero-student-photo"
                        label="صورة طلاب العقيق المقربة في التكريم"
                        src="/covers/student-excellence-about.jpg"
                        alt="طلاب مدارس العقيق في حفل التميز والتكريم"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                      {/* Top Floating Badge */}
                      <div className="absolute top-3.5 right-3.5 flex items-center gap-2 rounded-full bg-black/80 border border-white/20 px-3.5 py-1.5 text-xs font-black text-white shadow-lg backdrop-blur-md">
                        <Sparkles size={13} className="text-[#f8ca14]" />
                        <span>{isNationalDay ? "🇸🇦 عزّنا بطبعنا · 94 عاماً من المجد" : "نلهم الأجيال · نصنع الأثر"}</span>
                      </div>

                      {/* Bottom Overlaid Details */}
                      <div className="absolute bottom-3.5 right-3.5 left-3.5 flex items-center justify-between text-white">
                        <div>
                          <h4 className="text-sm font-black drop-shadow-md">صرح تعليمي وتربوي رائد</h4>
                          <p className="text-[11px] text-[#f8ca14] drop-shadow-md">أصالة القيم ومعايير الاعتماد الدولي</p>
                        </div>
                        <span className="rounded-xl bg-[#08467d]/90 px-2.5 py-1 text-[10px] font-black backdrop-blur-md shadow text-white">
                          المدينة المنورة
                        </span>
                      </div>
                    </div>

                    {/* Overlapping Floating Trust Chip (Bottom) */}
                    <div
                      className={`mt-3 p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                        dark ? "border-white/10 bg-black/60 text-slate-200" : "border-[#08467d]/15 bg-slate-50 text-slate-800"
                      }`}
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f8ca14]/15 text-[#f8ca14]">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <h5 className={`text-xs font-black ${dark ? "text-white" : "text-[#08467d]"}`}>مجمع البنين ومجمع البنات بالمدينة</h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">حي الرانوناء (ممشى الهجرة) · بيئة نموذجية متكاملة</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      }
    >
      {/* Quick Jump Anchor Command Bar — ثابت في مكانه الطبيعي ولا ينزل مع السكرول */}
      <div className={`relative z-20 border-b py-2.5 px-3 sm:px-4 backdrop-blur-xl transition ${
        dark ? "bg-black/80 border-white/10" : "bg-white/85 border-slate-200 shadow-sm"
      }`}>
        <div className="container mx-auto max-w-5xl flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide flex-nowrap sm:flex-wrap text-xs font-black py-1">
          <a
            href="#timeline-section"
            className={`shrink-0 px-3.5 py-2 rounded-xl border transition active:scale-95 ${
              dark
                ? "border-white/10 bg-white/5 text-slate-300 hover:text-[#f8ca14] hover:border-[#f8ca14]/40 hover:bg-white/10"
                : "border-black/5 bg-slate-50 text-slate-700 hover:text-[#08467d] hover:border-[#08467d]/30 hover:bg-white"
            }`}
          >
            مسيرة 30 عاماً 📜
          </a>
          <a
            href="#campuses-section"
            className={`shrink-0 px-3.5 py-2 rounded-xl border transition active:scale-95 ${
              dark
                ? "border-white/10 bg-white/5 text-slate-300 hover:text-[#f8ca14] hover:border-[#f8ca14]/40 hover:bg-white/10"
                : "border-black/5 bg-slate-50 text-slate-700 hover:text-[#08467d] hover:border-[#08467d]/30 hover:bg-white"
            }`}
          >
            مستكشف المجمعات والمرافق 🏫
          </a>
          <a
            href="#vision-section"
            className={`shrink-0 px-3.5 py-2 rounded-xl border transition active:scale-95 ${
              dark
                ? "border-white/10 bg-white/5 text-slate-300 hover:text-[#f8ca14] hover:border-[#f8ca14]/40 hover:bg-white/10"
                : "border-black/5 bg-slate-50 text-slate-700 hover:text-[#08467d] hover:border-[#08467d]/30 hover:bg-white"
            }`}
          >
            الرؤية والرسالة 2030 🎯
          </a>
          <a
            href="#pillars-section"
            className={`shrink-0 px-3.5 py-2 rounded-xl border transition active:scale-95 ${
              dark
                ? "border-white/10 bg-white/5 text-slate-300 hover:text-[#f8ca14] hover:border-[#f8ca14]/40 hover:bg-white/10"
                : "border-black/5 bg-slate-50 text-slate-700 hover:text-[#08467d] hover:border-[#08467d]/30 hover:bg-white"
            }`}
          >
            ركائزنا التربوية 💡
          </a>
          <a
            href="#map-contact-section"
            className={`shrink-0 px-3.5 py-2 rounded-xl border transition active:scale-95 ${
              dark
                ? "border-white/10 bg-white/5 text-slate-300 hover:text-[#f8ca14] hover:border-[#f8ca14]/40 hover:bg-white/10"
                : "border-black/5 bg-slate-50 text-slate-700 hover:text-[#08467d] hover:border-[#08467d]/30 hover:bg-white"
            }`}
          >
            الموقع والتواصل 📍
          </a>
        </div>
      </div>

      {/* ========================================================
          STAGE 1: The 30-Year Legacy Time Machine (Interactive Heritage Scrubber)
      ======================================================== */}
      <TimelineHeritageScrubber dark={dark} />

      {/* ========================================================
          STAGE 2: Multi-Mode Next-Gen Architectural Campus Showcase (Virtual Campus Explorer)
      ======================================================== */}
      <VirtualCampusExplorer dark={dark} />

      {/* ========================================================
          STAGE 3: Royal Strategic Document: Vision & Mission 2030 (The Golden Triumvirate & Values Compass)
      ======================================================== */}
      <VisionMissionCompass dark={dark} />

      {/* ========================================================
          STAGE 4: The 4 Institutional Pillars (Student Journey & Outcomes)
      ======================================================== */}
      <InstitutionalPillarsDeck dark={dark} />

      {/* ========================================================
          STAGE 5: Medina Interactive Map & Campus Logistics (Live Radar & Route Simulator)
      ======================================================== */}
      <MedinaLogisticsRadar dark={dark} />

      {/* Stage 6: Grand Interactive Finale & Action */}
      <AqeeqGrandFinaleCta
        badge="✦ انضم إلى مجتمع العقيق ✦"
        title="اصنع مستقبل أبنائك في بيئة تعليمية تليق بطموحاتهم"
        subtitle="أبواب القبول والتسجيل مفتوحة لجميع المراحل الدراسية للبنين والبنات مع توفير كافة التسهيلات وأنظمة السداد."
        primaryActionText="سجّل ابنك الآن"
        primaryActionHref="/admissions"
        onPrimaryAction={() => navigate("/admissions")}
        secondaryActionText="استكشف الاعتمادات الدولية"
        secondaryActionHref="/accreditations"
        onSecondaryAction={() => navigate("/accreditations")}
      />
    </AqeeqLuxuryPageShell>
  );
}
