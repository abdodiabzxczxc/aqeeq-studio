import React from "react";
import { motion } from "framer-motion";

interface AqeeqSectionHeaderProps {
  badge: string;
  badgeIcon?: React.ReactNode;
  title: string | React.ReactNode;
  subtitle?: string;
  dark?: boolean;
  align?: "right" | "center";
  className?: string;
}

export function AqeeqSectionHeader({
  badge,
  badgeIcon,
  title,
  subtitle,
  dark = true,
  align = "right",
  className = "",
}: AqeeqSectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div className={`mb-10 sm:mb-12 ${isCenter ? "text-center" : "text-right"} ${className}`}>
      {/* 1. Kicker Badge */}
      <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border mb-3.5 text-[11px] font-black tracking-widest uppercase shadow-sm ${
        dark
          ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
          : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d]"
      }`}>
        {badgeIcon}
        <span>{badge}</span>
      </div>

      {/* 2. Main Large Title */}
      <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black font-cairo leading-tight ${
        dark ? "text-white" : "text-black"
      }`}>
        {title}
      </h2>

      {/* 3. Glowing Golden Gradient Accent Line */}
      <div className={`relative my-3.5 h-[3px] rounded-full overflow-hidden ${
        isCenter ? "mx-auto w-48" : "w-44 sm:w-56"
      } ${
        dark
          ? "bg-gradient-to-l from-[#f8ca14] via-[#f8ca14]/70 to-transparent shadow-[0_0_12px_rgba(248,202,20,0.45)]"
          : "bg-gradient-to-l from-[#08467d] via-[#08467d]/70 to-transparent shadow-[0_0_10px_rgba(8,70,125,0.3)]"
      }`}>
        {/* Animated Light Shimmer traveling along the line */}
        <motion.div
          animate={{ x: isCenter ? ["-100%", "100%"] : ["100%", "-100%"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-y-0 w-16 bg-white/80 blur-[2px]"
        />
      </div>

      {/* 4. Subtitle / Description */}
      {subtitle && (
        <p className={`text-xs sm:text-sm max-w-xl leading-relaxed ${
          isCenter ? "mx-auto" : ""
        } ${dark ? "text-slate-400" : "text-slate-600"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
