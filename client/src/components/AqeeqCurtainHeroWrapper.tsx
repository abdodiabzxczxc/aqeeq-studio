import { useRef } from "react";
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
 * 1. الهيرو يثبت بالكامل (Pinned) في بداية السكرول.
 * 2. أثناء دوران عجلة الماوس: الهيرو لا يهرب؛ بل يتراجع في البعد الثالث وتنفصل كروته بنعومة فيزيائية.
 * 3. تصعد الستارة الملكية (Curtain) من الأسفل وتغطي الهيرو بسلاسة مطلقة.
 */
export function AqeeqCurtainHeroWrapper({ hero, curtainContent }: AqeeqCurtainHeroWrapperProps) {
  const heroPinContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";

  // تتبع تقدم السكرول خلال رحلة الهيرو المثبت (Pinned Journey)
  const { scrollYProgress } = useScroll({
    target: heroPinContainerRef,
    offset: ["start start", "end start"],
  });

  // فيزياء الحركة السينمائية القوية:
  // في النصف الأول من السكرول (0 إلى 0.6): تراجع الهيرو في البعد الثالث وزيادة العتمة والفوكس
  const rawScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.88]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.35]);
  const rawY = useTransform(scrollYProgress, [0, 0.6], ["0px", "-50px"]);
  const rawBlur = useTransform(scrollYProgress, [0, 0.6], ["blur(0px)", "blur(6px)"]);

  const heroScale = useSpring(rawScale, { stiffness: 100, damping: 20, mass: 0.5 });
  const heroOpacity = useSpring(rawOpacity, { stiffness: 100, damping: 20, mass: 0.5 });
  const heroY = useSpring(rawY, { stiffness: 100, damping: 20, mass: 0.5 });

  return (
    <div className="relative w-full">
      {/* 1. الحاوية الطويلة لتثبيت الهيرو (Pinned Hero Stage - 160vh) */}
      <div ref={heroPinContainerRef} className="relative h-[160vh] w-full">
        {/* الهيرو المثبت في الشاشة بنسبة 100% أثناء السكرول */}
        <div className="sticky top-0 z-0 h-screen w-full flex items-center justify-center overflow-hidden">
          <motion.div
            style={{
              scale: heroScale,
              opacity: heroOpacity,
              y: heroY,
              filter: rawBlur,
              transformOrigin: "center center",
            }}
            className="w-full will-change-transform"
          >
            {hero}
          </motion.div>
        </div>
      </div>

      {/* 2. طبقة الستارة الملكية الصاعدة فوق الهيرو (The Overlapping Royal Curtain) */}
      <div
        className={`relative z-20 -mt-[60vh] w-full rounded-t-[3rem] sm:rounded-t-[4.5rem] transition-colors duration-500 overflow-x-clip ${
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
