import React from "react";
import { motion } from "framer-motion";
import { VisualEditable } from "./VisualEditor";

interface AqeeqSectionHeaderProps {
  id?: string;
  badge: string;
  badgeIcon?: React.ReactNode;
  title: string | React.ReactNode;
  subtitle?: string;
  dark?: boolean;
  align?: "right" | "center";
  className?: string;
}

export function AqeeqSectionHeader({
  id,
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
        {id ? (
          <VisualEditable
            id={`${id}-badge`}
            tag="text"
            label="شارة السكشن"
            defaultText={badge}
            as="span"
          />
        ) : (
          <span>{badge}</span>
        )}
      </div>

      {/* 2. Main Large Title */}
      {id && typeof title === "string" ? (
        <VisualEditable
          id={`${id}-title`}
          tag="text"
          label="عنوان السكشن"
          defaultText={title}
          as="h2"
          className={`text-2xl sm:text-4xl lg:text-5xl font-black font-cairo leading-tight ${
            dark ? "text-white" : "text-black"
          }`}
        />
      ) : (
        <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black font-cairo leading-tight ${
          dark ? "text-white" : "text-black"
        }`}>
          {title}
        </h2>
      )}

      {/* 3. Glowing Golden Gradient Accent Line (يتمدد مع السكرول وينكمش عند الخروج) */}
      <motion.div
        initial={{ width: 0, opacity: 0.3 }}
        whileInView={{ width: isCenter ? 210 : 175, opacity: 1 }}
        viewport={{ once: false, margin: "-20px" }}
        transition={{
          duration: 0.85,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`h-1 sm:h-[3.5px] rounded-full my-3.5 ${
          isCenter ? "mx-auto" : ""
        } ${
          dark
            ? "bg-gradient-to-l from-[#f8ca14] via-[#f8ca14]/80 to-transparent shadow-[0_0_15px_rgba(248,202,20,0.6)]"
            : "bg-gradient-to-l from-[#08467d] via-[#08467d]/80 to-transparent shadow-[0_0_12px_rgba(8,70,125,0.4)]"
        }`}
      />

      {/* 4. Subtitle / Description */}
      {subtitle && (
        id ? (
          <VisualEditable
            id={`${id}-subtitle`}
            tag="text"
            label="وصف السكشن"
            defaultText={subtitle}
            as="p"
            className={`text-xs sm:text-sm max-w-xl leading-relaxed ${
              isCenter ? "mx-auto" : ""
            } ${dark ? "text-slate-400" : "text-slate-600"}`}
          />
        ) : (
          <p className={`text-xs sm:text-sm max-w-xl leading-relaxed ${
            isCenter ? "mx-auto" : ""
          } ${dark ? "text-slate-400" : "text-slate-600"}`}>
            {subtitle}
          </p>
        )
      )}
    </div>
  );
}
