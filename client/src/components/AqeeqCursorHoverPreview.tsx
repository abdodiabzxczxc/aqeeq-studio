import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";

interface HoverPreviewState {
  visible: boolean;
  imageUrl?: string | null;
  title?: string;
  badge?: string;
}

let setGlobalHover: ((state: HoverPreviewState) => void) | null = null;

export function triggerCursorPreview(state: HoverPreviewState) {
  if (setGlobalHover) {
    setGlobalHover(state);
  }
}

const CARD_W = 240; // px — preview card width
const CARD_H = 200; // px — approximate preview card height
const OFFSET = 20;  // distance from cursor

/**
 * AqeeqCursorHoverPreview — Smart Positioning Wellington-Style Cursor Preview
 * الصورة تطلع على اليسار لو المؤشر في اليمين، وعلى اليمين لو المؤشر في الشمال.
 * وإذا كانت في أسفل الشاشة تطلع للأعلى.
 */
export function AqeeqCursorHoverPreview() {
  const [preview, setPreview] = useState<HoverPreviewState>({ visible: false });
  const mousePos = useRef({ x: -500, y: -500 });

  const springConfig = { damping: 18, stiffness: 180, mass: 0.3 };
  const cursorX = useSpring(-500, springConfig);
  const cursorY = useSpring(-500, springConfig);

  useEffect(() => {
    setGlobalHover = setPreview;

    const handleMouseMove = (e: MouseEvent) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mx = e.clientX;
      const my = e.clientY;

      mousePos.current = { x: mx, y: my };

      // Smart X: if cursor is in right half → card goes LEFT of cursor
      const goLeft = mx > vw * 0.55;
      const targetX = goLeft
        ? mx - CARD_W - OFFSET
        : mx + OFFSET;

      // Smart Y: if cursor is near bottom → card goes UP
      const goUp = my > vh * 0.65;
      const targetY = goUp
        ? my - CARD_H - OFFSET
        : my - 40;

      cursorX.set(targetX);
      cursorY.set(targetY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      setGlobalHover = null;
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [cursorX, cursorY]);

  return (
    <AnimatePresence>
      {preview.visible && preview.imageUrl && (
        <motion.div
          key="cursor-preview"
          style={{ x: cursorX, y: cursorY }}
          initial={{ opacity: 0, scale: 0.75, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.8, filter: "blur(6px)" }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed top-0 left-0 z-[9999] hidden lg:block"
        >
          <div
            className="relative overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl"
            style={{ width: CARD_W }}
          >
            {/* Image */}
            <div className="relative h-36 w-full overflow-hidden">
              <motion.img
                src={preview.imageUrl}
                alt={preview.title || "Preview"}
                className="h-full w-full object-cover"
                initial={{ scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              {/* Badge */}
              {preview.badge && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="absolute top-2 right-2 rounded-full bg-black/60 border border-[#f8ca14]/40 px-2.5 py-0.5 text-[9px] font-black text-[#f8ca14] backdrop-blur-md"
                >
                  {preview.badge}
                </motion.div>
              )}
            </div>
            {/* Footer */}
            {preview.title && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-black/90 px-3 py-2.5"
              >
                <p className="text-right text-[11px] font-black text-white line-clamp-2 leading-relaxed">
                  {preview.title}
                </p>
              </motion.div>
            )}
            {/* Shimmer border */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/[0.12]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
