import { useRef, useState, useCallback } from "react";
import type { Variants } from "framer-motion";

/**
 * useMagneticTilt — هوك فيزيائي ثلاثي الأبعاد للكروت التفاعلية
 * يحسب زاوية الميل ثلاثي الأبعاد وإحداثيات الانعكاس الضوئي السطحي (Glare)
 */
export function useMagneticTilt(maxTilt = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 50 });

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (py - 0.5) * -maxTilt,
      y: (px - 0.5) * maxTilt,
      gx: px * 100,
      gy: py * 100,
    });
  }, [maxTilt]);

  const onLeave = useCallback(() => {
    setTilt({ x: 0, y: 0, gx: 50, gy: 50 });
  }, []);

  return { ref, tilt, onMove, onLeave };
}

/**
 * حزمة الحركات التتابعية للحاويات (Stagger Container)
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

/**
 * حركة الصعود الناعم مع ارتداد النوابض الفيزيائي
 */
export const fadeUpSpring: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 24,
      mass: 0.6,
    },
  },
};

/**
 * حركة التكبير التدريجي مع التلاشي
 */
export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 240,
      damping: 22,
    },
  },
};

/**
 * ارتداد الكروت عند التحويم
 */
export const cardHoverTransition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};
