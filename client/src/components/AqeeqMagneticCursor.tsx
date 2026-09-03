import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";

export function AqeeqMagneticCursor() {
  const [cursorState, setCursorState] = useState<"default" | "hover" | "click">("default");
  const [cursorLabel, setCursorLabel] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);

  // Outer ring — follows with spring lag
  const ox = useSpring(mx, { damping: 22, stiffness: 220, mass: 0.5 });
  const oy = useSpring(my, { damping: 22, stiffness: 220, mass: 0.5 });

  // Inner dot — follows precisely
  const dx = useSpring(mx, { damping: 40, stiffness: 700, mass: 0.15 });
  const dy = useSpring(my, { damping: 40, stiffness: 700, mass: 0.15 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setIsVisible(true);
    };
    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);
    const onDown = () => setCursorState("click");
    const onUp = () => setCursorState("default");
    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest(
        "a, button, [role=button], [data-cursor], .group"
      ) as HTMLElement | null;
      if (el) {
        setCursorState("hover");
        setCursorLabel((el as HTMLElement).dataset?.cursorText ?? "");
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
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [mx, my]);

  const ringSize = cursorState === "hover" ? 72 : cursorState === "click" ? 36 : 52;

  // Colors adapt to theme
  const defaultRingColor = dark
    ? "rgba(255,255,255,0.55)"
    : "rgba(8,70,125,0.65)";           // deep blue in light mode — clearly visible
  const hoverRingColor = "rgba(248,202,20,0.9)";  // always gold on hover
  const hoverBg = "rgba(248,202,20,0.08)";
  const dotColor = dark ? "#f8ca14" : "#08467d";  // gold dark, blue light

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[99998] hidden lg:flex items-center justify-center"
        style={{
          x: ox, y: oy,
          translateX: "-50%", translateY: "-50%",
          opacity: isVisible ? 1 : 0,
        }}
        animate={{ width: ringSize, height: ringSize }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="w-full h-full rounded-full border-2 flex items-center justify-center overflow-hidden"
          animate={{
            borderColor: cursorState === "hover" ? hoverRingColor : defaultRingColor,
            backgroundColor: cursorState === "hover" ? hoverBg : "transparent",
          }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence>
            {cursorLabel && (
              <motion.span
                key={cursorLabel}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="text-[8px] font-black tracking-widest uppercase text-center leading-tight px-1"
                style={{ color: hoverRingColor }}
              >
                {cursorLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Inner dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[99999] hidden lg:block"
        style={{
          x: dx, y: dy,
          translateX: "-50%", translateY: "-50%",
          opacity: isVisible ? 1 : 0,
        }}
      >
        <motion.div
          className="rounded-full"
          style={{ backgroundColor: dotColor }}
          animate={{
            width:  cursorState === "click" ? 14 : cursorState === "hover" ? 5 : 4,
            height: cursorState === "click" ? 14 : cursorState === "hover" ? 5 : 4,
          }}
          transition={{ duration: 0.12 }}
        />
      </motion.div>
    </>
  );
}
