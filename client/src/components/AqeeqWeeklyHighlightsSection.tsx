import React from "react";
import { motion } from "framer-motion";
import { Trophy, Award, Flame, Heart, ArrowUpLeft, Sparkles, ChevronDown } from "lucide-react";
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
  const [, navigate] = useLocation();

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

  const medalThumb =
    albumCovers.front ||
    showcaseCovers.front ||
    "/covers/student-excellence-about.jpg";

  return (
    <VisualEditable
      id="studio-bento-section"
      tag="section"
      label="قسم إنجازات وأحداث الأسبوع"
      as="section"
      className={`border-b pt-16 pb-28 md:pt-20 md:pb-36 transition ${
        isNationalDay
          ? dark ? "border-[#f8ca14]/10 snd-section-dark" : "border-[#005A36]/10 snd-section-light"
          : dark ? "border-white/[0.05] bg-gradient-to-b from-transparent via-[#060608]/40 to-transparent" : "border-black/[0.04] bg-slate-50/50"
      }`}
    >
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        {/* Section Header */}
        <div className="mb-12 md:mb-16 text-right max-w-2xl">
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
            className={`text-2xl sm:text-4xl lg:text-5xl font-black font-cairo ${dark ? "text-white" : "text-black"}`}
          />
          {/* Glowing Golden Accent Line (يتمدد وينكمش - بيصغر ويكبر في عرضه) */}
          <motion.div
            initial={{ width: "35px" }}
            whileInView={{ width: ["35px", "190px", "35px"] }}
            viewport={{ once: false }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className={`h-1 sm:h-[3.5px] rounded-full my-3.5 ${
              dark
                ? "bg-gradient-to-l from-[#f8ca14] via-[#f8ca14]/80 to-transparent shadow-[0_0_14px_rgba(248,202,20,0.55)]"
                : "bg-gradient-to-l from-[#08467d] via-[#08467d]/80 to-transparent shadow-[0_0_10px_rgba(8,70,125,0.4)]"
            }`}
          />
          <p className={`mt-2 text-xs sm:text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-600"}`}>
            محطات النجاح، التكريمات، والفعاليات الأبرز التي شهدتها مدارس العقيق هذا الأسبوع، مصفوفة بتجربة بطاقات تراكمية تفاعلية.
          </p>
        </div>

        {/* ============================================================ */}
        {/* PURE CSS STICKY STACKING DECK (Apple / Wellington Benchmark) */}
        {/* ============================================================ */}
        <div className="relative w-full">
          {/* 🎴 CARD 1: الحدث الرئيسي الأبرز */}
          <div className="sticky top-16 sm:top-20 z-10 mb-24 sm:mb-32 will-change-transform">
            <div
              className={`relative overflow-hidden rounded-[2.2rem] sm:rounded-[2.8rem] border p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-transform duration-300 ${
                isNationalDay
                  ? dark ? "snd-bento-card-dark" : "snd-bento-card-light"
                  : dark
                  ? "border-white/15 bg-[#0d0f18]/95 hover:border-[#f8ca14]/40"
                  : "border-slate-200 bg-white/95 hover:border-[#08467d]/40 shadow-xl"
              }`}
            >
              {/* Top Deck Tab (Visible even when stacked) */}
              <div className="flex items-center justify-between border-b pb-4 mb-6 border-white/10">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    dark ? "bg-[#f8ca14]/15 text-[#f8ca14] border border-[#f8ca14]/30" : "bg-[#08467d]/10 text-[#08467d]"
                  }`}>
                    <Sparkles size={13} />
                    01 / تغطية الأسبوع الكبرى
                  </span>
                  <span className="text-xs font-bold text-slate-500 hidden sm:inline">· الحدث التعليمي الأبرز</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">1 من 3</span>
              </div>

              {/* Card Body Grid */}
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
                <div className="order-2 lg:order-1 text-right">
                  <span className={`text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                    الحدث التعليمي الأبرز
                  </span>
                  <VisualEditable
                    id="studio-bento-card1-title"
                    tag="text"
                    label="عنوان الحدث الأبرز"
                    defaultText={eventTitle}
                    as="h3"
                    className={`mt-2 text-xl sm:text-3xl font-black leading-snug font-cairo ${dark ? "text-white" : "text-black"}`}
                  >
                    انطلاق فعاليات الأسبوع العلمي وتكريم الفرسان
                  </VisualEditable>
                  <p className={`mt-3 text-xs sm:text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>
                    تغطية شاملة للفعاليات، ورش العمل الإبداعية، ولحظات التميز والابتكار في ساحات ومختبرات مدارس العقيق الأهلية والدولية.
                  </p>
                  <div className="mt-8 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => navigate("/articles")}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition active:scale-95 ${
                        dark
                          ? "bg-[#f8ca14] text-black hover:bg-[#e0b50d] shadow-lg shadow-[#f8ca14]/20"
                          : "bg-[#08467d] text-white hover:bg-[#063560] shadow-lg shadow-[#08467d]/20"
                      }`}
                    >
                      <span>تصفح التغطية الكاملة</span>
                      <ArrowUpLeft size={16} />
                    </button>
                    <span className="text-xs text-slate-500 font-medium">محدث أسبوعياً</span>
                  </div>
                </div>

                <div className="order-1 lg:order-2 relative h-56 sm:h-72 lg:h-80 overflow-hidden rounded-[1.8rem] border border-white/10 shadow-lg">
                  <VisualImage
                    id="studio-bento-card1-image"
                    label="صورة الحدث التعليمي الأبرز"
                    src={eventThumb}
                    alt="تغطية الأسبوع"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-black text-white">
                    📸 عدسة استوديو العقيق
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 🎴 CARD 2: وسام التميز الأكاديمي (Stacks on top at top-28) */}
          <div className="sticky top-24 sm:top-28 z-20 mb-24 sm:mb-32 will-change-transform">
            <div
              className={`relative overflow-hidden rounded-[2.2rem] sm:rounded-[2.8rem] border p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-transform duration-300 ${
                isNationalDay
                  ? dark ? "snd-bento-card-dark" : "snd-bento-card-light"
                  : dark
                  ? "border-[#f8ca14]/40 bg-[#141107]/95 hover:border-[#f8ca14]/70"
                  : "border-amber-300 bg-amber-50/95 hover:border-amber-400 shadow-xl"
              }`}
            >
              {/* Top Deck Tab */}
              <div className="flex items-center justify-between border-b pb-4 mb-6 border-white/10">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    dark ? "bg-[#f8ca14]/20 text-[#f8ca14] border border-[#f8ca14]/40" : "bg-amber-100 text-amber-900 border border-amber-300"
                  }`}>
                    <Award size={13} />
                    02 / وسام التميز والتكريم
                  </span>
                  <span className="text-xs font-bold text-slate-500 hidden sm:inline">· فخر مدارس العقيق</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">2 من 3</span>
              </div>

              {/* Card Body Grid */}
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
                <div className="order-2 lg:order-1 text-right">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`grid h-10 w-10 place-items-center rounded-xl ${
                      dark ? "bg-[#f8ca14]/20 text-[#f8ca14] border border-[#f8ca14]/40" : "bg-amber-100 text-amber-800"
                    }`}>
                      <Award size={20} />
                    </div>
                    <span className={`text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                      وسام التميز الأكاديمي · الأسبوع 14
                    </span>
                  </div>
                  <h3 className={`mt-2 text-xl sm:text-3xl font-black leading-snug font-cairo ${dark ? "text-white" : "text-black"}`}>
                    تكريم فرسان موهبة وأبطال الروبوتيكس
                  </h3>
                  <p className={`mt-3 text-xs sm:text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>
                    تحقيق المراكز الأولى في مسابقات الابتكار والذكاء الاصطناعي على مستوى المنطقة وتكريم الطلاب وأولياء أمورهم في حفل بهيج.
                  </p>
                  <div className="mt-8 flex items-center gap-3">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black ${
                      dark ? "bg-white/10 text-amber-300 border border-amber-400/30" : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}>
                      🥇 وسام الشرف الأكاديمي
                    </span>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black ${
                      dark ? "bg-white/5 text-slate-300" : "bg-slate-100 text-slate-700"
                    }`}>
                      🎖️ تميز مستمر
                    </span>
                  </div>
                </div>

                <div className="order-1 lg:order-2 relative h-56 sm:h-72 lg:h-80 overflow-hidden rounded-[1.8rem] border border-white/10 shadow-lg">
                  <img
                    src={medalThumb}
                    alt="وسام التميز"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-4 right-4 rounded-full border border-amber-400/40 bg-black/70 backdrop-blur-md px-3 py-1 text-[11px] font-black text-amber-300">
                    🏆 منصة التتويج
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 🎴 CARD 3: نبض المجتمع وتشجيع الطلاب (Stacks on top at top-36) */}
          <div className="sticky top-32 sm:top-36 z-30 will-change-transform">
            <div
              className={`relative overflow-hidden rounded-[2.2rem] sm:rounded-[2.8rem] border p-6 sm:p-10 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-transform duration-300 ${
                isNationalDay
                  ? dark ? "snd-bento-card-dark" : "snd-bento-card-light"
                  : dark
                  ? "border-rose-500/35 bg-[#17070b]/95 hover:border-rose-500/60"
                  : "border-rose-200 bg-rose-50/95 hover:border-rose-300 shadow-xl"
              }`}
            >
              {/* Top Deck Tab */}
              <div className="flex items-center justify-between border-b pb-4 mb-6 border-white/10">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    dark ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" : "bg-rose-100 text-rose-700 border border-rose-200"
                  }`}>
                    <Flame size={13} />
                    03 / نبض المجتمع والتشجيع
                  </span>
                  <span className="text-xs font-bold text-slate-500 hidden sm:inline">· تفاعل حي مباشر</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">3 من 3</span>
              </div>

              {/* Card Body Grid */}
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
                <div className="order-2 lg:order-1 text-right">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`grid h-10 w-10 place-items-center rounded-xl ${
                      dark ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" : "bg-rose-100 text-rose-600"
                    }`}>
                      <Flame size={20} />
                    </div>
                    <span className={`text-xs font-black ${dark ? "text-rose-400" : "text-rose-600"}`}>
                      نبض وتفاعل أولياء الأمور والطلاب
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-4">
                    <h3 className={`text-4xl sm:text-6xl font-black font-cairo ${dark ? "text-white" : "text-black"}`}>
                      +{(orchestration?.weeklyBento?.heartsCount ?? 142) + (hasLiked ? 1 : 0)}
                    </h3>
                    <span className="text-sm font-bold text-slate-400">قلب تشجيع هذا الأسبوع ❤️</span>
                  </div>
                  <p className={`mt-3 text-xs sm:text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>
                    كل إعجاب وتشجيع هنا ينعكس فخراً وإلهاماً في نفوس أبنائنا وبناتنا في رحلتهم نحو القمة.
                  </p>
                  <div className="mt-8 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={toggleLike}
                      className={`inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-xs font-black transition active:scale-95 ${
                        hasLiked
                          ? "bg-rose-600 text-white shadow-xl shadow-rose-600/30 ring-4 ring-rose-500/20"
                          : dark
                          ? "bg-white/10 text-white hover:bg-rose-500/25 border border-white/15"
                          : "bg-white text-slate-900 hover:bg-rose-100 border border-slate-200 shadow-md"
                      }`}
                    >
                      <Heart size={18} className={hasLiked ? "fill-current text-white animate-bounce" : "text-rose-500"} />
                      <span>{hasLiked ? "تم تسجيل تشجيعك! شكراً لك ❤️" : "أرسل تشجيعك للطلاب الآن"}</span>
                    </button>
                    <span className="text-xs text-slate-500 font-medium">تفاعل فوري</span>
                  </div>
                </div>

                <div className="order-1 lg:order-2 relative h-56 sm:h-72 lg:h-80 overflow-hidden rounded-[1.8rem] border border-white/10 shadow-lg">
                  <img
                    src="/covers/student-excellence-about.jpg"
                    alt="نبض المجتمع"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-4 right-4 rounded-full border border-rose-500/40 bg-black/70 backdrop-blur-md px-3 py-1 text-[11px] font-black text-rose-300">
                    🤝 معاً نصنع قادة الغد
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VisualEditable>
  );
}
