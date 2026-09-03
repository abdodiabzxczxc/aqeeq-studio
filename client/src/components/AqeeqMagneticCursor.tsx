import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";

export function AqeeqMagneticCursor() {
  const [cursorState, setCursorState] = useState<"default" | "hover" | "click">("default");
  const [cursorLabel, setCursorLabel] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isOverInput, setIsOverInput] = useState(false);
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);

  // Outer ring — smooth spring physics
  const ox = useSpring(mx, { damping: 24, stiffness: 240, mass: 0.45 });
  const oy = useSpring(my, { damping: 24, stiffness: 240, mass: 0.45 });

  // Inner dot — immediate & crisp
  const dx = useSpring(mx, { damping: 38, stiffness: 850, mass: 0.12 });
  const dy = useSpring(my, { damping: 38, stiffness: 850, mass: 0.12 });

  useEffect(() => {
    // Only activate if desktop / fine pointer is available
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    document.body.classList.add("has-magnetic-cursor");

    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);
    const onDown = () => setCursorState("click");
    const onUp = () => setCursorState("default");

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if mouse is over an input or editable field (UX: restore normal cursor, fade out ring)
      const inputEl = target.closest("input, textarea, select, [contenteditable='true'], [role='textbox'], .cursor-text");
      if (inputEl) {
        setIsOverInput(true);
        return;
      }
      setIsOverInput(false);

      // Check for interactive clickable elements
      const interactiveEl = target.closest(
        "a, button, [role='button'], [data-cursor], input[type='button'], input[type='submit'], .group, summary"
      ) as HTMLElement | null;

      if (interactiveEl) {
        setCursorState("hover");
        setCursorLabel(interactiveEl.dataset?.cursorText ?? "");
      } else {
        setCursorState("default");
        setCursorLabel("");
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("mouseenter", onEnter);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      document.body.classList.remove("has-magnetic-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [mx, my, isVisible]);

  // If over text input or outside window, smoothly hide custom cursor for perfect UX
  const shouldShow = isVisible && !isOverInput;
  const ringSize = cursorState === "hover" ? 76 : cursorState === "click" ? 38 : 54;

  // High contrast & vivid styling for both light and dark modes
  const defaultRingBorder = dark
    ? "rgba(255, 255, 255, 0.85)"
    : "rgba(8, 70, 125, 0.9)";
  const defaultRingShadow = dark
    ? "0 0 16px rgba(248, 202, 20, 0.35)"
    : "0 2px 14px rgba(8, 70, 125, 0.25)";

  const hoverRingBorder = dark ? "#f8ca14" : "#08467d";
  const hoverRingBg = dark ? "rgba(248, 202, 20, 0.14)" : "rgba(8, 70, 125, 0.1)";
  const hoverRingShadow = dark
    ? "0 0 28px rgba(248, 202, 20, 0.65)"
    : "0 0 24px rgba(8, 70, 125, 0.4)";

  const dotColor = dark
    ? cursorState === "hover" ? "#f8ca14" : "#f8ca14"
    : cursorState === "hover" ? "#08467d" : "#08467d";

  const dotShadow = dark
    ? "0 0 10px rgba(248, 202, 20, 0.9)"
    : "0 0 8px rgba(8, 70, 125, 0.5)";

  return (
    <>
      {/* Outer Spring Ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[99998] hidden lg:flex items-center justify-center will-change-transform"
        style={{
          x: ox,
          y: oy,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: shouldShow ? 1 : 0,
          scale: shouldShow ? 1 : 0.4,
          width: ringSize,
          height: ringSize,
        }}
        transition={{
          width: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
          height: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.15 },
          scale: { duration: 0.15 },
        }}
      >
        <motion.div
          className="w-full h-full rounded-full border-[2.5px] flex items-center justify-center overflow-hidden transition-colors duration-200"
          style={{
            borderColor: cursorState === "hover" ? hoverRingBorder : defaultRingBorder,
            backgroundColor: cursorState === "hover" ? hoverRingBg : "transparent",
            boxShadow: cursorState === "hover" ? hoverRingShadow : defaultRingShadow,
          }}
        >
          <AnimatePresence>
            {cursorLabel && (
              <motion.span
                key={cursorLabel}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="text-[9px] font-black tracking-wider uppercase text-center leading-tight px-1 drop-shadow"
                style={{ color: dark ? "#f8ca14" : "#08467d" }}
              >
                {cursorLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}
