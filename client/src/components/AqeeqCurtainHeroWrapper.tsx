import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";

interface AqeeqCurtainHeroWrapperProps {
  hero: React.ReactNode;
  curtainContent: React.ReactNode;
}

/**
 * AqeeqCurtainHeroWrapper — الإصدار السينمائي الفائق (True Pinned Hero + 3D Transform + Curtain Reveal)
 * مستوحى من ويلينغتون:
 * - الهيرو ملتصق مباشرة أسفل شريط القصص بدون أي مسافة فارغة زائدة.
 * - يثبت مكانه أثناء بداية السكرول وتتفتح كروته بالبعد الثالث.
 * - تصعد الستارة الملكية وتغطي الهيرو بسلاسة مطلقة.
 */
export function AqeeqCurtainHeroWrapper({ hero, curtainContent }: AqeeqCurtainHeroWrapperProps) {
  const heroPinContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";

  // تتبع تقدم السكرول خلال رحلة الهيرو المثبت
  const { scrollYProgress } = useScroll({
    target: heroPinContainerRef,
    offset: ["start start", "end start"],
  });

  const rawScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.9]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.4]);
  const rawY = useTransform(scrollYProgress, [0, 0.6], ["0px", "-40px"]);
  const rawBlur = useTransform(scrollYProgress, [0, 0.6], ["blur(0px)", "blur(5px)"]);

  const heroScale = useSpring(rawScale, { stiffness: 100, damping: 20, mass: 0.5 });
  const heroOpacity = useSpring(rawOpacity, { stiffness: 100, damping: 20, mass: 0.5 });
  const heroY = useSpring(rawY, { stiffness: 100, damping: 20, mass: 0.5 });

  // فحص الشاشات الكبيرة لتفعيل تجربة ويلينغتون السينمائية حصرياً على الكمبيوتر
  // وتوفير انسياب طبيعي كامل على الموبايل لمنع ابتلاع الكفارات مبكراً
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="relative w-full">
      {/* 1. الحاوية: تثبيت سينمائي على الكمبيوتر (lg)، وانسياب طبيعي على الموبايل */}
      <div ref={heroPinContainerRef} className="relative h-auto lg:h-[135vh] w-full">
        {/* الهيرو يثبت على الكمبيوتر فقط ويتحرك بانسياب طبيعي على الموبايل */}
        <div className="relative lg:sticky lg:top-0 z-0 w-full overflow-hidden pt-0">
          <motion.div
            style={{
              scale: isDesktop ? heroScale : 1,
              opacity: isDesktop ? heroOpacity : 1,
              y: isDesktop ? heroY : 0,
              filter: isDesktop ? rawBlur : "none",
              transformOrigin: "center top",
            }}
            className="w-full will-change-transform"
          >
            {hero}
          </motion.div>
        </div>
      </div>

      {/* 2. طبقة الستارة الملكية: تصعد فوق الهيرو على الكمبيوتر، وتبدأ طبيعياً تحته على الموبايل */}
      <div
        className={`relative z-20 mt-4 sm:mt-6 lg:-mt-[35vh] w-full rounded-t-[2.5rem] sm:rounded-t-[3.5rem] lg:rounded-t-[4.5rem] transition-colors duration-500 overflow-x-clip ${
          isNationalDay
            ? dark
              ? "bg-[#020b06] shadow-[0_-40px_100px_rgba(0,0,0,0.95)] border-t-2 border-[#f8ca14]/30"
              : "bg-[#f8faf8] shadow-[0_-30px_80px_rgba(0,90,54,0.18)] border-t-2 border-emerald-500/30"
            : dark
            ? "bg-[#07090e] shadow-[0_-40px_100px_rgba(0,0,0,0.98)] border-t-2 border-white/15"
            : "bg-white shadow-[0_-30px_80px_rgba(0,0,0,0.12)] border-t-2 border-black/10"
        }`}
      >
        {/* خط إضاءة نيون ملكي في أعلى الستارة */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-4/5 max-w-4xl h-[2px] bg-gradient-to-r from-transparent via-[#f8ca14] to-transparent z-30 shadow-[0_0_15px_rgba(248,202,20,0.6)]"
        />

        {/* مقبض سحب واستكشاف بصري فاخر */}
        <div className="flex flex-col items-center justify-center pt-4 pb-2 gap-1.5">
          <div
            className={`h-1.5 w-16 rounded-full transition ${
              dark ? "bg-white/25" : "bg-black/20"
            }`}
          />
          <span className={`text-[10px] font-black tracking-widest uppercase ${
            dark ? "text-[#f8ca14]/80" : "text-[#08467d]/80"
          }`}>
            ✦ واحة العقيق الرقمية ✦
          </span>
        </div>

        {/* المحتوى الفعلي للأقسام الصاعدة */}
        {curtainContent}
      </div>
    </div>
  );
}
