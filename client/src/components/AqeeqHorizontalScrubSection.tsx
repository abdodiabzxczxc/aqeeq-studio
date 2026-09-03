import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { Sparkles, BookOpen, ImageIcon, ArrowUpLeft, ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

interface ShowcaseItem {
  id: string | number;
  title: string;
  category: "journal" | "album" | "offer";
  badge: string;
  imageUrl: string | null;
  href: string;
  metaText?: string;
}

interface AqeeqHorizontalScrubSectionProps {
  items: ShowcaseItem[];
}

export function AqeeqHorizontalScrubSection({ items }: AqeeqHorizontalScrubSectionProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [, navigate] = useLocation();

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // حركة السكرول الأفقي التفاعلية المربوطة بالسكرول نزولاً وطلوعاً
  // حساب المدى بدقة لتجنب أي فراغات
  const maxShift = items.length > 3 ? `${Math.min(48, (items.length - 1) * 12)}%` : "18%";
  const rawX = useTransform(scrollYProgress, [0, 1], ["0%", maxShift]);
  const x = useSpring(rawX, { stiffness: 100, damping: 22, mass: 0.4 });

  // تأثير عمق وإضاءة العنوان مع السكرول
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.85]);
  const headerScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.98]);

  if (!items || items.length === 0) return null;

  return (
    <section
      ref={targetRef}
      className={`relative h-[110vh] w-full transition-colors duration-500 overflow-visible ${
        isNationalDay
          ? dark ? "bg-[#010905]" : "bg-[#f5fbf7]"
          : dark ? "bg-[#05070a]" : "bg-[#f9fafb]"
      }`}
    >
      {/* الحاوية المثبتة طوال فترة السكرول الأفقي */}
      <div className="sticky top-0 flex h-screen w-full flex-col justify-center overflow-hidden py-6">
        {/* رأس المعرض السينمائي المتفاعل */}
        <motion.div
          style={{ opacity: headerOpacity, scale: headerScale }}
          className="mx-auto w-full max-w-[1380px] px-5 md:px-8 mb-5 z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3"
        >
          <div>
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[10px] font-black tracking-widest uppercase mb-2 ${
                isNationalDay
                  ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              }`}
            >
              <Sparkles size={12} />
              <span>EDITORIAL & MEDIA SHOWCASE · المعرض الأفقي</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-black"}`}>
              أروقة العقيق الإعلامية
            </h2>
            <p className={`mt-1 text-xs sm:text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}>
              أحدث أعداد المجلة المدرسية والتوثيقات المصورة للفعاليات والمحطات الكبرى.
            </p>
          </div>

          {/* مؤشر استكشاف السكرول + شريط النسبة */}
          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold ${
              dark ? "border-white/10 bg-white/5 text-slate-300" : "border-black/10 bg-black/5 text-slate-700"
            }`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>مرر بالماوس للاستكشاف أفقياً (نزولاً وطلوعاً) ✦</span>
            </div>

            <div className={`h-1.5 w-28 rounded-full overflow-hidden ${dark ? "bg-white/10" : "bg-black/10"}`}>
              <motion.div
                style={{ scaleX: scrollYProgress }}
                className="h-full w-full bg-gradient-to-r from-[#f8ca14] to-emerald-500 origin-right"
              />
            </div>
          </div>
        </motion.div>

        {/* مسار الكروت المنزلقة أفقياً مع البارالاكس ثلاثي الأبعاد */}
        <div className="relative w-full overflow-visible">
          <motion.div
            style={{ x }}
            className="flex items-center gap-5 sm:gap-7 px-5 md:px-8 w-max will-change-transform"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id + "-" + index}
                role="button"
                tabIndex={0}
                onClick={() => navigate(item.href)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate(item.href)}
                whileHover={{ y: -10, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 250, damping: 18 }}
                className={`group relative h-[380px] sm:h-[430px] w-[270px] sm:w-[320px] shrink-0 cursor-pointer overflow-hidden rounded-[2.2rem] border transition-all duration-300 ${
                  isNationalDay
                    ? dark
                      ? "border-[#f8ca14]/30 bg-[#001f13] shadow-[0_20px_50px_rgba(0,90,54,0.4)]"
                      : "border-emerald-500/20 bg-white shadow-[0_20px_50px_rgba(0,90,54,0.15)]"
                    : dark
                    ? "border-white/10 bg-[#0d0f14] shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                    : "border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
                }`}
              >
                {/* صورة الغلاف الكاملة */}
                <div className="relative h-full w-full overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-slate-400">
                      {item.category === "journal" ? <BookOpen size={48} /> : <ImageIcon size={48} />}
                    </div>
                  )}

                  {/* Gradient Overlay الفاخر للقراءة */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

                  {/* الشارة العلوية */}
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-black/60 border border-white/20 px-3 py-1 text-[11px] font-black text-[#f8ca14] backdrop-blur-md shadow-md">
                    {item.category === "journal" ? <BookOpen size={13} /> : <ImageIcon size={13} />}
                    <span>{item.badge}</span>
                  </div>

                  {/* تفاصيل الكارت السفلية */}
                  <div className="absolute bottom-0 inset-x-0 p-5 text-right z-10">
                    {item.metaText && (
                      <p className="text-[10px] font-bold text-slate-300/80 mb-1">{item.metaText}</p>
                    )}
                    <h3 className="text-lg sm:text-xl font-black text-white leading-snug line-clamp-2 drop-shadow-md">
                      {item.title}
                    </h3>

                    {/* زر الفتح مع سهم الانطلاق */}
                    <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
                      <span className="text-xs font-black text-[#f8ca14] group-hover:underline inline-flex items-center gap-1">
                        <span>تصفح الآن</span>
                        <ArrowUpLeft size={14} className="transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
                      </span>
                      <span className="h-8 w-8 rounded-full bg-white/10 border border-white/20 grid place-items-center text-white transition group-hover:bg-[#f8ca14] group-hover:text-black">
                        <ChevronLeft size={16} />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
