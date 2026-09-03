import { useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";

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

/**
 * AqeeqCursorHoverPreview
 * يحاكي مؤشر ويلينغتون الشهير (Floating Cursor Image Trail):
 * عند مرور الماوس على الروابط والبطاقات، تطفو بطاقة مصورة مصغرة بجانب مؤشر الماوس بفيزياء الزنبرك.
 */
export function AqeeqCursorHoverPreview() {
  const [preview, setPreview] = useState<HoverPreviewState>({ visible: false });

  const springConfig = { damping: 20, stiffness: 150, mass: 0.4 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  useEffect(() => {
    setGlobalHover = setPreview;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX + 24);
      cursorY.set(e.clientY - 40);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      setGlobalHover = null;
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [cursorX, cursorY]);

  if (!preview.visible || !preview.imageUrl) return null;

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="pointer-events-none fixed top-0 left-0 z-[9999] hidden lg:block"
    >
      <div className="relative w-56 overflow-hidden rounded-2xl border border-white/25 bg-black/90 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="relative h-32 w-full overflow-hidden rounded-xl">
          <img
            src={preview.imageUrl}
            alt={preview.title || "Preview"}
            className="h-full w-full object-cover"
          />
          {preview.badge && (
            <div className="absolute top-2 right-2 rounded-full bg-black/70 border border-white/20 px-2.5 py-0.5 text-[9px] font-black text-[#f8ca14]">
              {preview.badge}
            </div>
          )}
        </div>
        {preview.title && (
          <p className="mt-2 text-right text-xs font-black text-white line-clamp-1">
            {preview.title}
          </p>
        )}
      </div>
    </motion.div>
  );
}
