import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Trophy, Award, Flame, Heart, ArrowUpLeft } from "lucide-react";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { useLocation } from "wouter";

interface AqeeqWeeklyStackingDeckProps {
  dark: boolean;
  isNationalDay: boolean;
  orchestration: any;
  featuredEventPost: any;
  showcaseCovers: { front?: string | null };
  albumCovers: { front?: string | null };
  hasLiked: boolean;
  toggleLike: () => void;
  directDriveImage: (url: string | null | undefined) => string | null;
}

export function AqeeqWeeklyStackingDeck({
  dark,
  isNationalDay,
  orchestration,
  featuredEventPost,
  showcaseCovers,
  albumCovers,
  hasLiked,
  toggleLike,
  directDriveImage,
}: AqeeqWeeklyStackingDeckProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth springs for card stacking physics
  const rawCard1Scale = useTransform(scrollYProgress, [0.15, 0.5], [1, 0.92]);
  const rawCard1Y = useTransform(scrollYProgress, [0.15, 0.5], [0, -25]);
  const rawCard1Opacity = useTransform(scrollYProgress, [0.2, 0.55], [1, 0.65]);

  const rawCard2Y = useTransform(scrollYProgress, [0.22, 0.52], ["110%", "0%"]);
  const rawCard2Scale = useTransform(scrollYProgress, [0.55, 0.85], [1, 0.95]);
  const rawCard2Opacity = useTransform(scrollYProgress, [0.6, 0.85], [1, 0.75]);

  const rawCard3Y = useTransform(scrollYProgress, [0.55, 0.85], ["110%", "0%"]);

  const card1Scale = useSpring(rawCard1Scale, { stiffness: 90, damping: 22 });
  const card1Y = useSpring(rawCard1Y, { stiffness: 90, damping: 22 });
  const card1Opacity = useSpring(rawCard1Opacity, { stiffness: 90, damping: 22 });

  const card2Y = useSpring(rawCard2Y, { stiffness: 85, damping: 20 });
  const card2Scale = useSpring(rawCard2Scale, { stiffness: 90, damping: 22 });
  const card2Opacity = useSpring(rawCard2Opacity, { stiffness: 90, damping: 22 });

  const card3Y = useSpring(rawCard3Y, { stiffness: 85, damping: 20 });

  // Deck indicator highlights based on scroll
  const rawIndicator = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0, 1, 2, 2]);

  return (
    <div className="relative w-full">
      {/* ============================================================ */}
      {/* DESKTOP & TABLET: Pinned Stacking Deck (Wellington Signature) */}
      {/* ============================================================ */}
      <div ref={containerRef} className="relative hidden md:block h-[250vh] w-full">
        <div className="sticky top-20 z-10 w-full min-h-[580px] py-6 flex flex-col justify-start">
          <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8">
            {/* Header: Title & Interactive Card Stepper Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div className="text-right">
                <VisualEditable
                  id="studio-bento-kicker"
                  tag="text"
                  label="شارة إنجازات الأسبوع"
                  defaultText={isNationalDay ? "🇸🇦 إنجازات العقيق في اليوم الوطني" : "WEEKLY SPOTLIGHT · ACHIEVEMENTS"}
                  as="span"
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[10px] font-black tracking-widest uppercase mb-2 ${
                    isNationalDay
                      ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
                      : dark
                      ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                      : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
                  }`}
                >
                  {(text) => (
                    <>
                      <Trophy size={12} />
                      {text}
                    </>
                  )}
                </VisualEditable>
                <h2 className={`text-3xl lg:text-4xl font-black font-cairo ${dark ? "text-white" : "text-black"}`}>
                  أبرز أحداث وإنجازات الأسبوع
                </h2>
              </div>

              {/* Deck Steps Indicator */}
              <div
                className={`flex items-center gap-2 p-1.5 rounded-2xl border backdrop-blur-xl ${
                  dark ? "border-white/10 bg-black/60 text-white" : "border-black/10 bg-white/80 text-slate-800"
                }`}
              >
                {[
                  { step: 1, label: "الحدث الأبرز" },
                  { step: 2, label: "وسام التميز" },
                  { step: 3, label: "نبض المجتمع" },
                ].map((s) => (
                  <span
                    key={s.step}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all duration-300 ${
                      dark
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-500 hover:text-black"
                    }`}
                  >
                    {s.step}. {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* The Stacking Stage (Cards physically overlay each other) */}
            <div className="relative w-full h-[460px] lg:h-[480px]">
              {/* ================= CARD 1: Featured Headline Event ================= */}
              <motion.div
                style={{
                  scale: card1Scale,
                  y: card1Y,
                  opacity: card1Opacity,
                  transformOrigin: "center top",
                }}
                className="absolute inset-0 z-10 will-change-transform"
              >
                <div
                  className={`h-full w-full rounded-[2.5rem] border p-8 lg:p-10 flex flex-col md:flex-row gap-8 items-center justify-between shadow-2xl transition-colors duration-500 ${
                    dark
                      ? "border-white/15 bg-gradient-to-br from-[#16181f] via-[#0f1117] to-[#0a0c10] shadow-[0_20px_60px_rgba(0,0,0,0.85)]"
                      : "border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100/90 shadow-[0_20px_50px_rgba(8,70,125,0.08)]"
                  }`}
                >
                  {/* Visual Image Banner */}
                  <div className="relative h-64 md:h-full w-full md:w-1/2 rounded-[2rem] overflow-hidden group">
                    <VisualImage
                      id="studio-bento-card1-image"
                      label="صورة الحدث التعليمي الأبرز"
                      src={
                        (featuredEventPost
                          ? directDriveImage(featuredEventPost.thumbnailUrl) ||
                            featuredEventPost.thumbnailUrl ||
                            featuredEventPost.mediaUrl
                          : null) ||
                        showcaseCovers.front ||
                        albumCovers.front ||
                        "/covers/student-excellence-about.jpg"
                      }
                      alt="تغطية الأسبوع"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute top-4 right-4 rounded-full bg-black/60 border border-[#f8ca14]/40 px-3 py-1 text-xs font-black text-[#f8ca14] backdrop-blur-md">
                      {orchestration?.weeklyBento?.customTag || "🌟 تغطية الأسبوع الكبرى"}
                    </span>
                  </div>

                  {/* Content Narrative */}
                  <div className="w-full md:w-1/2 flex flex-col justify-between h-full py-2 text-right">
                    <div>
                      <span className={`text-xs font-black uppercase tracking-wider ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                        01 / حدث الأسبوع الرئيسي
                      </span>
                      <h3 className={`mt-3 text-2xl lg:text-3xl font-black leading-snug font-cairo ${dark ? "text-white" : "text-slate-900"}`}>
                        {orchestration?.weeklyBento?.customTitle ||
                          featuredEventPost?.title ||
                          "انطلاق فعاليات الأسبوع العلمي وتكريم الفرسان"}
                      </h3>
                      <p className={`mt-4 text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>
                        {orchestration?.weeklyBento?.customDescription ||
                          "تغطية شاملة للفعاليات، ورش العمل الإبداعية، ولحظات التميز والابتكار في ساحات ومختبرات مدارس العقيق الأهلية والدولية."}
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/10 dark:border-white/10 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => navigate("/articles")}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black shadow-lg transition-transform active:scale-95 ${
                          dark
                            ? "bg-[#f8ca14] text-black hover:bg-[#ffe066]"
                            : "bg-[#08467d] text-white hover:bg-[#06335c]"
                        }`}
                      >
                        <span>تصفح التغطية الكاملة</span>
                        <ArrowUpLeft size={16} />
                      </button>
                      <span className="text-xs font-bold text-slate-500">
                        تحديث أسبوعي مستمر ✦
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ================= CARD 2: Academic Honors & Badge (Glides UP) ================= */}
              <motion.div
                style={{
                  y: card2Y,
                  scale: card2Scale,
                  opacity: card2Opacity,
                  transformOrigin: "center top",
                }}
                className="absolute inset-0 z-20 will-change-transform"
              >
                <div
                  className={`h-full w-full rounded-[2.5rem] border p-8 lg:p-10 flex flex-col md:flex-row gap-8 items-center justify-between shadow-2xl transition-colors duration-500 ${
                    dark
                      ? "border-[#f8ca14]/30 bg-gradient-to-br from-[#1a1708] via-[#121008] to-[#080703] shadow-[0_-25px_60px_rgba(0,0,0,0.95)]"
                      : "border-amber-300/80 bg-gradient-to-br from-amber-50/90 via-white to-amber-100/50 shadow-[0_-20px_50px_rgba(248,202,20,0.12)]"
                  }`}
                >
                  <div className="w-full md:w-1/2 flex flex-col justify-between h-full py-2 text-right">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`grid h-12 w-12 place-items-center rounded-2xl ${
                            dark
                              ? "bg-[#f8ca14]/15 text-[#f8ca14] border border-[#f8ca14]/30"
                              : "bg-amber-100 text-[#08467d] border border-amber-300"
                          }`}
                        >
                          <Award size={28} />
                        </div>
                        <span className={`text-xs font-black uppercase tracking-wider ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                          02 / وسام التميز والتكريم
                        </span>
                      </div>

                      <h3 className={`text-2xl lg:text-3xl font-black font-cairo ${dark ? "text-white" : "text-black"}`}>
                        {orchestration?.weeklyBento?.academicBadgeTitle || "وسام التميز الأكاديمي والاستحقاق"}
                      </h3>
                      <p className={`mt-3 text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700"}`}>
                        {orchestration?.weeklyBento?.academicBadgeDesc ||
                          "تحقيق المركز الأول في مسابقات الموهبة والابتكار على مستوى المنطقة، وتتويج نخبة الفرسان بدرع الإبداع المدرسي."}
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-amber-500/20 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black ${
                        dark ? "bg-white/10 text-[#f8ca14]" : "bg-amber-100 text-amber-900"
                      }`}>
                        🥇 تكريم رسمي مستحق
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        قسم الموهبة والابتكار
                      </span>
                    </div>
                  </div>

                  {/* Visual Right Column Graphic */}
                  <div className="relative h-64 md:h-full w-full md:w-1/2 rounded-[2rem] overflow-hidden border border-amber-500/20">
                    <img
                      src="/covers/student-excellence-about.jpg"
                      alt="وسام التميز"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 right-6 text-right">
                      <p className="text-white text-lg font-black font-cairo">
                        {orchestration?.weeklyBento?.academicBadgeWeek || "فخر مدارس العقيق الأهلية والدولية"}
                      </p>
                      <p className="text-[#f8ca14] text-xs font-bold mt-1">
                        لوحة الشرف الأسبوعية
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ================= CARD 3: Community Pulse & Encouragement (Glides UP) ================= */}
              <motion.div
                style={{
                  y: card3Y,
                  transformOrigin: "center top",
                }}
                className="absolute inset-0 z-30 will-change-transform"
              >
                <div
                  className={`h-full w-full rounded-[2.5rem] border p-8 lg:p-10 flex flex-col md:flex-row gap-8 items-center justify-between shadow-2xl transition-colors duration-500 ${
                    dark
                      ? "border-rose-500/30 bg-gradient-to-br from-[#1c0a0c] via-[#140608] to-[#0a0203] shadow-[0_-30px_70px_rgba(0,0,0,0.98)]"
                      : "border-rose-200 bg-gradient-to-br from-rose-50/90 via-white to-rose-100/40 shadow-[0_-20px_50px_rgba(222,25,30,0.12)]"
                  }`}
                >
                  <div className="w-full md:w-1/2 flex flex-col justify-between h-full py-2 text-right">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/15 text-rose-500 border border-rose-500/30">
                          <Flame size={28} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-rose-500">
                          03 / نبض المجتمع وتشجيع الفرسان
                        </span>
                      </div>

                      <h3 className={`text-2xl lg:text-3xl font-black font-cairo ${dark ? "text-white" : "text-black"}`}>
                        تفاعل أولياء الأمور والطلاب
                      </h3>
                      <p className={`mt-3 text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700"}`}>
                        كل إعجاب وتشجيع هنا ينعكس فخراً وإلهاماً في نفوس أبنائنا وبناتنا في رحلتهم نحو القمة.
                      </p>

                      <div className="mt-6 flex items-baseline gap-3">
                        <span className={`text-5xl lg:text-6xl font-black font-cairo ${dark ? "text-white" : "text-rose-600"}`}>
                          +{(orchestration?.weeklyBento?.heartsCount ?? 142) + (hasLiked ? 1 : 0)}
                        </span>
                        <span className="text-xs font-black text-slate-500">
                          قلب تشجيع هذا الأسبوع ❤️
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-rose-500/20">
                      <button
                        type="button"
                        onClick={toggleLike}
                        className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-sm font-black shadow-xl transition active:scale-95 ${
                          hasLiked
                            ? "bg-rose-600 text-white hover:bg-rose-700"
                            : dark
                            ? "bg-white/10 text-white hover:bg-rose-500/20"
                            : "bg-rose-100 text-rose-900 hover:bg-rose-200"
                        }`}
                      >
                        <Heart size={20} className={hasLiked ? "fill-current animate-bounce" : ""} />
                        <span>{hasLiked ? "أنت معجب بهذا وتدعم الفرسان! ❤️" : "أرسل تشجيعك للطلاب الآن 👏"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Community Mosaic Photo Right Column */}
                  <div className="relative h-64 md:h-full w-full md:w-1/2 rounded-[2rem] overflow-hidden border border-rose-500/20">
                    <img
                      src="/covers/student-robotics-accreditations.jpg"
                      alt="تفاعل المجتمع"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute bottom-6 right-6 text-right">
                      <span className="text-xs font-black text-[#f8ca14] block">
                        روح واحدة ومسيرة متصلة
                      </span>
                      <p className="text-white text-base font-black font-cairo mt-0.5">
                        معاً نصنع قادة الغد وطموح الوطن
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE ONLY: Clean Responsive Stack Cards (No touch trap)   */}
      {/* ============================================================ */}
      <div className="block md:hidden px-4 py-8 space-y-6">
        <div className="text-right mb-4">
          <span className="text-xs font-black text-[#f8ca14]">WEEKLY SPOTLIGHT</span>
          <h2 className={`text-2xl font-black font-cairo mt-1 ${dark ? "text-white" : "text-black"}`}>
            أبرز أحداث وإنجازات الأسبوع
          </h2>
        </div>

        {/* Card 1 Mobile */}
        <div className={`rounded-3xl border p-5 shadow-lg ${dark ? "border-white/10 bg-[#12141a]" : "border-slate-200 bg-white"}`}>
          <div className="h-44 w-full rounded-2xl overflow-hidden mb-4">
            <img
              src="/covers/student-excellence-about.jpg"
              alt="حدث الأسبوع"
              className="h-full w-full object-cover"
            />
          </div>
          <h3 className={`text-lg font-black ${dark ? "text-white" : "text-black"}`}>
            {orchestration?.weeklyBento?.customTitle || featuredEventPost?.title || "انطلاق فعاليات الأسبوع العلمي وتكريم الفرسان"}
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {orchestration?.weeklyBento?.customDescription || "تغطية شاملة للفعاليات والأنشطة الأسبوعية."}
          </p>
        </div>

        {/* Card 2 Mobile */}
        <div className={`rounded-3xl border p-5 shadow-lg ${dark ? "border-amber-500/30 bg-[#141208]" : "border-amber-200 bg-amber-50/60"}`}>
          <div className="flex items-center gap-2 mb-2 text-[#f8ca14]">
            <Award size={20} />
            <span className="text-xs font-black">وسام التميز</span>
          </div>
          <h3 className={`text-base font-black ${dark ? "text-white" : "text-black"}`}>
            {orchestration?.weeklyBento?.academicBadgeTitle || "وسام التميز الأكاديمي والاستحقاق"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {orchestration?.weeklyBento?.academicBadgeDesc || "تكريم الفائزين بالمسابقات الإقليمية."}
          </p>
        </div>

        {/* Card 3 Mobile */}
        <div className={`rounded-3xl border p-5 shadow-lg ${dark ? "border-rose-500/30 bg-[#17080a]" : "border-rose-200 bg-rose-50/60"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-rose-500">
              <Flame size={20} />
              <span className="text-xs font-black">نبض المجتمع</span>
            </div>
            <span className="text-lg font-black text-rose-500">
              +{(orchestration?.weeklyBento?.heartsCount ?? 142) + (hasLiked ? 1 : 0)}
            </span>
          </div>
          <button
            type="button"
            onClick={toggleLike}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black ${
              hasLiked ? "bg-rose-600 text-white" : "bg-rose-500/20 text-rose-400"
            }`}
          >
            <Heart size={16} className={hasLiked ? "fill-current" : ""} />
            <span>{hasLiked ? "أنت معجب بهذا! ❤️" : "شجّع الطلاب الآن"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
