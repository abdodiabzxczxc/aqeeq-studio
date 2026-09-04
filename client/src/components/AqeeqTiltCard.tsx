import React, { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";

interface AqeeqTiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glowColor?: "gold" | "emerald" | "blue" | "default";
  maxTilt?: number;
}

export function AqeeqTiltCard({
  children,
  className = "",
  onClick,
  glowColor = "default",
  maxTilt = 8,
}: AqeeqTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = cardRef.current;
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
    },
    [maxTilt]
  );

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, gx: 50, gy: 50 });
  }, []);

  const getGlowBorder = () => {
    if (isNationalDay) {
      return dark
        ? "group-hover:border-[#5aba1c]/50 group-hover:shadow-[0_20px_45px_rgba(0,90,54,0.35)]"
        : "group-hover:border-emerald-500/40 group-hover:shadow-[0_20px_45px_rgba(0,90,54,0.18)]";
    }
    if (glowColor === "gold") {
      return dark
        ? "group-hover:border-[#f8ca14]/50 group-hover:shadow-[0_20px_45px_rgba(248,202,20,0.25)]"
        : "group-hover:border-[#f8ca14]/60 group-hover:shadow-[0_15px_35px_rgba(248,202,20,0.2)]";
    }
    if (glowColor === "emerald") {
      return "group-hover:border-emerald-500/50 group-hover:shadow-[0_20px_45px_rgba(16,185,129,0.25)]";
    }
    if (glowColor === "blue") {
      return "group-hover:border-[#08467d]/50 group-hover:shadow-[0_20px_45px_rgba(8,70,125,0.25)]";
    }
    return dark
      ? "group-hover:border-[#f8ca14]/40 group-hover:shadow-[0_20px_45px_rgba(248,202,20,0.2)]"
      : "group-hover:border-[#08467d]/30 group-hover:shadow-[0_15px_35px_rgba(8,70,125,0.15)]";
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: isHovered
          ? "transform 0.12s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.3s ease, border-color 0.3s ease"
          : "transform 0.5s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.5s ease, border-color 0.5s ease",
      }}
      className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-300 will-change-transform ${
        dark
          ? "border-white/[0.08] bg-[#0c1017]/80 backdrop-blur-2xl text-white shadow-[0_10px_35px_rgba(0,0,0,0.4)]"
          : "border-black/[0.06] bg-white/85 backdrop-blur-xl text-black shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
      } ${getGlowBorder()} ${className}`}
    >
      {/* بريق ضوئي سطحي متتبع لحركة الفأرة (Specular Reflection) */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
        }}
      />

      {children}
    </motion.div>
  );
}
