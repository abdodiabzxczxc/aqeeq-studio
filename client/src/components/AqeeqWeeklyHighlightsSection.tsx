import React, { useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Trophy, Award, Flame, Heart, ArrowUpLeft } from "lucide-react";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { useLocation } from "wouter";

interface AqeeqWeeklyHighlightsSectionProps {
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

function useCardTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 50 });

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (py - 0.5) * -12,
      y: (px - 0.5) * 12,
      gx: px * 100,
      gy: py * 100,
    });
  }, []);

  const onLeave = useCallback(() => {
    setTilt({ x: 0, y: 0, gx: 50, gy: 50 });
  }, []);

  return { ref, tilt, onMove, onLeave };
}

export function AqeeqWeeklyHighlightsSection({
  dark,
  isNationalDay,
  orchestration,
  featuredEventPost,
  showcaseCovers,
  albumCovers,
  hasLiked,
  toggleLike,
  directDriveImage,
}: AqeeqWeeklyHighlightsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rawWeekly1Y = useTransform(scrollYProgress, [0, 1], [35, -35]);
  const rawWeekly2Y = useTransform(scrollYProgress, [0, 1], [15, -45]);
  const rawWeekly3Y = useTransform(scrollYProgress, [0, 1], [45, -25]);

  const weeklyCard1Y = useSpring(rawWeekly1Y, { stiffness: 85, damping: 20 });
  const weeklyCard2Y = useSpring(rawWeekly2Y, { stiffness: 85, damping: 20 });
  const weeklyCard3Y = useSpring(rawWeekly3Y, { stiffness: 85, damping: 20 });

  const c1 = useCardTilt();
  const c2 = useCardTilt();
  const c3 = useCardTilt();

  const eventTitle =
    featuredEventPost?.title && featuredEventPost.title.trim().length > 3
      ? featuredEventPost.title
      : orchestration?.weeklyBento?.customTitle || "انطلاق فعاليات الأسبوع العلمي وتكريم الفرسان";

  const eventThumb =
    (featuredEventPost
      ? directDriveImage(featuredEventPost.thumbnailUrl) ||
        featuredEventPost.thumbnailUrl ||
        featuredEventPost.mediaUrl
      : null) ||
    showcaseCovers.front ||
    albumCovers.front ||
    "/covers/student-excellence-about.jpg";

  return (
    <div ref={sectionRef} className="relative w-full">
      <VisualEditable
        id="studio-bento-section"
        tag="section"
        label="قسم إنجازات وأحداث الأسبوع"
        as="section"
        className={`border-b py-14 md:py-20 transition ${
          isNationalDay
            ? dark ? "border-[#f8ca14]/10 snd-section-dark" : "border-[#005A36]/10 snd-section-light"
            : dark ? "border-white/[0.05] bg-white/[0.02]" : "border-black/[0.04] bg-black/[0.015]"
        }`}
      >
        <div className="mx-auto max-w-[1340px] px-5 md:px-8">
          {/* Header */}
          <div className="mb-8 sm:mb-10 text-right">
            <VisualEditable
              id="studio-bento-kicker"
              tag="text"
              label="شارة إنجازات الأسبوع"
              defaultText={isNationalDay ? "🇸🇦 إنجازات العقيق في اليوم الوطني" : "WEEKLY SPOTLIGHT · ACHIEVEMENTS"}
              as="span"
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[10px] font-black tracking-widest uppercase mb-3 ${
                isNationalDay
                  ? "snd-kicker-badge border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              }`}
            >
              {(text) => (
                <>
                  <Trophy size={12} />
                  {text}
                </>
              )}
            </VisualEditable>
            <VisualEditable
              id="studio-bento-title"
              tag="text"
              label="عنوان إنجازات وأحداث الأسبوع"
              defaultText="أبرز أحداث وإنجازات الأسبوع"
              as="h2"
              className={`text-2xl sm:text-4xl font-black font-cairo ${dark ? "text-white" : "text-black"}`}
            />
            <p className={`mt-2 max-w-xl text-xs sm:text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}>
              محطات النجاح، التكريمات، والفعاليات الأبرز التي شهدتها المدارس هذا الأسبوع.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 items-stretch">
            {/* Bento Card 1: الحدث الرئيسي الأبرز (Spans 2 columns) */}
            <motion.div
              ref={c1.ref}
              onMouseMove={c1.onMove}
              onMouseLeave={c1.onLeave}
              style={{
                y: weeklyCard1Y,
                rotateX: c1.tilt.x,
                rotateY: c1.tilt.y,
                transformStyle: "preserve-3d",
                perspective: 1000,
              }}
              className="md:col-span-2 lg:col-span-2 will-change-transform group relative"
            >
              {/* Ambient spotlight */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[2.2rem] z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle 260px at ${c1.tilt.gx}% ${c1.tilt.gy}%, rgba(248,202,20,0.14), transparent 70%)`,
                }}
              />
              <VisualEditable
                id="studio-bento-card1"
                tag="section"
                label="بطاقة الحدث التعليمي الأبرز"
                as="div"
                className={`relative overflow-hidden rounded-[2.2rem] border p-6 sm:p-8 flex flex-col justify-between h-full transition-all duration-300 shadow-xl ${
                  isNationalDay
                    ? dark ? "snd-bento-card-dark" : "snd-bento-card-light"
                    : dark
                    ? "border-white/[0.08] bg-gradient-to-br from-[#14161f] to-[#0a0c12] hover:border-[#f8ca14]/50 hover:shadow-[0_20px_50px_rgba(248,202,20,0.12)]"
                    : "border-slate-200 bg-white hover:border-[#08467d]/50 hover:shadow-[0_20px_50px_rgba(8,70,125,0.1)]"
                }`}
              >
                <div className="relative h-48 sm:h-56 overflow-hidden rounded-2xl mb-6">
                  <VisualImage
                    id="studio-bento-card1-image"
                    label="صورة الحدث التعليمي الأبرز"
                    src={eventThumb}
                    alt="تغطية الأسبوع"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <VisualEditable
                    id="studio-bento-card1-tag"
                    tag="text"
                    label="شارة وسم الأسبوع"
                    defaultText={orchestration?.weeklyBento?.customTag || "🌟 تغطية الأسبوع الكبرى"}
                    as="span"
                    className={`absolute top-3 right-3 rounded-full border px-3 py-1 text-[10px] font-black backdrop-blur-md ${
                      dark ? "border-[#f8ca14]/40 bg-black/80 text-[#f8ca14]" : "border-[#08467d]/20 bg-white/90 text-[#08467d]"
                    }`}
                  />
                </div>
                <div>
                  <VisualEditable
                    id="studio-bento-card1-category"
                    tag="text"
                    label="تصنيف الحدث الأبرز"
                    defaultText="الحدث التعليمي الأبرز"
                    as="span"
                    className={`text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}
                  />
                  <VisualEditable
                    id="studio-bento-card1-title"
                    tag="text"
                    label="عنوان الحدث الأبرز"
                    defaultText={eventTitle}
                    as="h3"
                    className={`mt-2 text-xl sm:text-2xl font-black leading-snug font-cairo ${dark ? "text-white" : "text-black"}`}
                  >
                    {(content) => (content && content.trim().length > 3 ? content : eventTitle)}
                  </VisualEditable>
                  <VisualEditable
                    id="studio-bento-card1-desc"
                    tag="text"
                    label="وصف الحدث الأبرز"
                    defaultText={orchestration?.weeklyBento?.customDescription || "تغطية شاملة للفعاليات، ورش العمل الإبداعية، ولحظات التميز والابتكار في ساحات ومختبرات مدارس العقيق."}
                    as="p"
                    className={`mt-2 text-xs sm:text-sm leading-6 ${dark ? "text-slate-400" : "text-slate-600"}`}
                  />
                </div>
                <div className={`mt-6 pt-4 border-t flex items-center justify-between ${dark ? "border-white/[0.08]" : "border-black/[0.08]"}`}>
                  <VisualEditable
                    id="studio-bento-card1-action"
                    tag="button"
                    label="زر مشاهدة التغطية"
                    defaultText="مشاهدة التغطية بالكامل"
                    as="button"
                    onAction={() => navigate("/articles")}
                    className={`inline-flex items-center gap-2 text-xs font-black transition ${
                      dark ? "text-[#f8ca14] hover:opacity-80" : "text-[#08467d] hover:opacity-80"
                    }`}
                  >
                    {(text) => (
                      <>
                        {text} <ArrowUpLeft size={15} />
                      </>
                    )}
                  </VisualEditable>
                </div>
              </VisualEditable>
            </motion.div>

            {/* Bento Card 2: وسام وإنجاز الأسبوع */}
            <motion.div
              ref={c2.ref}
              onMouseMove={c2.onMove}
              onMouseLeave={c2.onLeave}
              style={{
                y: weeklyCard2Y,
                rotateX: c2.tilt.x,
                rotateY: c2.tilt.y,
                transformStyle: "preserve-3d",
                perspective: 1000,
              }}
              className="will-change-transform group relative"
            >
              {/* Ambient spotlight */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[2.2rem] z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle 200px at ${c2.tilt.gx}% ${c2.tilt.gy}%, rgba(248,202,20,0.16), transparent 70%)`,
                }}
              />
              <VisualEditable
                id="studio-bento-card2"
                tag="section"
                label="بطاقة وسام التميز الأكاديمي"
                as="div"
                className={`relative overflow-hidden rounded-[2.2rem] border p-6 sm:p-7 flex flex-col justify-between h-full transition-all duration-300 shadow-xl ${
                  isNationalDay
                    ? dark ? "snd-bento-card-dark" : "snd-bento-card-light"
                    : dark
                    ? "border-[#f8ca14]/30 bg-gradient-to-br from-[#17140a] to-[#0d0b05] hover:border-[#f8ca14]/60 hover:shadow-[0_20px_50px_rgba(248,202,20,0.18)]"
                    : "border-amber-300/80 bg-gradient-to-br from-amber-50/50 to-white hover:border-amber-400 hover:shadow-[0_20px_50px_rgba(248,202,20,0.12)]"
                }`}
              >
                <div>
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl mb-4 ${
                    dark ? "bg-[#f8ca14]/15 text-[#f8ca14] border border-[#f8ca14]/30" : isNationalDay ? "bg-emerald-50 text-[#005A36]" : "bg-amber-100 text-[#08467d] border border-amber-200"
                  }`}>
                    <Award size={24} />
                  </div>
                  <VisualEditable
                    id="studio-bento-card2-label"
                    tag="text"
                    label="شارة وسام التميز"
                    defaultText={orchestration?.weeklyBento?.academicBadgeTitle || "وسام التميز الأكاديمي"}
                    as="span"
                    className={`text-[10px] font-black tracking-wider ${dark ? "text-[#f8ca14]" : isNationalDay ? "text-[#005A36]" : "text-[#08467d]"}`}
                  />
                  <VisualEditable
                    id="studio-bento-card2-title"
                    tag="text"
                    label="عنوان وسام التميز"
                    defaultText={orchestration?.weeklyBento?.academicBadgeWeek || "فخر مدارس العقيق"}
                    as="h4"
                    className={`mt-2 text-lg font-black font-cairo ${dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black"}`}
                  />
                  <VisualEditable
                    id="studio-bento-card2-desc"
                    tag="text"
                    label="وصف وسام التميز"
                    defaultText={orchestration?.weeklyBento?.academicBadgeDesc || "تحقيق المركز الأول في مسابقات الموهبة والابتكار على مستوى المنطقة وتكريم الطلاب المشاركين."}
                    as="p"
                    className={`mt-2 text-xs leading-6 ${dark ? "text-slate-400" : isNationalDay ? "text-emerald-900/80" : "text-slate-600"}`}
                  />
                </div>
                <div className={`mt-6 pt-4 border-t ${dark ? "border-white/[0.08]" : isNationalDay ? "border-emerald-500/15" : "border-black/[0.08]"}`}>
                  <VisualEditable
                    id="studio-bento-card2-tag"
                    tag="text"
                    label="وسم تكريم مستحق"
                    defaultText="🥇 تكريم مستحق"
                    as="span"
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black ${
                      dark ? "bg-white/[0.05] text-[#f8ca14]" : isNationalDay ? "bg-emerald-50 text-[#005A36] border border-emerald-200/80" : "bg-amber-100 text-amber-900"
                    }`}
                  />
                </div>
              </VisualEditable>
            </motion.div>

            {/* Bento Card 3: مقياس نبض التفاعل الأسبوعي */}
            <motion.div
              ref={c3.ref}
              onMouseMove={c3.onMove}
              onMouseLeave={c3.onLeave}
              style={{
                y: weeklyCard3Y,
                rotateX: c3.tilt.x,
                rotateY: c3.tilt.y,
                transformStyle: "preserve-3d",
                perspective: 1000,
              }}
              className="will-change-transform group relative"
            >
              {/* Ambient spotlight */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[2.2rem] z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle 200px at ${c3.tilt.gx}% ${c3.tilt.gy}%, rgba(222,25,30,0.16), transparent 70%)`,
                }}
              />
              <VisualEditable
                id="studio-bento-card3"
                tag="section"
                label="بطاقة نبض التفاعل"
                as="div"
                className={`relative overflow-hidden rounded-[2.2rem] border p-6 sm:p-7 flex flex-col justify-between h-full transition-all duration-300 shadow-xl ${
                  isNationalDay
                    ? dark ? "snd-bento-card-dark" : "snd-bento-card-light"
                    : dark
                    ? "border-rose-500/25 bg-gradient-to-br from-[#170a0c] to-[#0d0406] hover:border-rose-500/50 hover:shadow-[0_20px_50px_rgba(222,25,30,0.15)]"
                    : "border-rose-200 bg-gradient-to-br from-rose-50/50 to-white hover:border-rose-300 hover:shadow-[0_20px_50px_rgba(222,25,30,0.1)]"
                }`}
              >
                <div>
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl mb-4 ${
                    dark ? "bg-[#de191e]/15 text-[#de191e] border border-rose-500/30" : "bg-rose-100 text-rose-600 border border-rose-200"
                  }`}>
                    <Flame size={24} />
                  </div>
                  <VisualEditable
                    id="studio-bento-card3-title"
                    tag="text"
                    label="عنوان نبض أولياء الأمور"
                    defaultText="نبض وتفاعل أولياء الأمور"
                    as="span"
                    className={`text-[10px] font-black tracking-wider ${dark ? "text-[#f8ca14]" : isNationalDay ? "text-[#005A36]" : "text-[#08467d]"}`}
                  />
                  <p className={`mt-3 text-3xl sm:text-4xl font-black font-cairo ${dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black"}`}>
                    +{(orchestration?.weeklyBento?.heartsCount ?? 142) + (hasLiked ? 1 : 0)}
                  </p>
                  <VisualEditable
                    id="studio-bento-card3-desc"
                    tag="text"
                    label="وصف نبض أولياء الأمور"
                    defaultText="إعجاب وتشجيع لطلاب وأنشطة هذا الأسبوع"
                    as="p"
                    className={`mt-1 text-xs ${dark ? "text-slate-400" : isNationalDay ? "text-emerald-900/70" : "text-slate-500"}`}
                  />
                </div>

                <div className={`mt-6 pt-4 border-t ${dark ? "border-white/[0.08]" : "border-black/[0.08]"}`}>
                  <button
                    type="button"
                    onClick={toggleLike}
                    className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition active:scale-95 ${
                      hasLiked
                        ? "bg-[#de191e] text-white shadow-lg"
                        : dark ? "bg-white/10 text-white hover:bg-[#de191e]/20" : "bg-slate-100 text-slate-900 hover:bg-[#de191e]/10"
                    }`}
                  >
                    <Heart size={16} className={hasLiked ? "fill-current" : ""} />
                    {hasLiked ? "أنت معجب بهذا! ❤️" : "شجّع الطلاب الآن"}
                  </button>
                </div>
              </VisualEditable>
            </motion.div>
          </div>
        </div>
      </VisualEditable>
    </div>
  );
}
