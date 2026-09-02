import { useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";

export type ThemeType = "default" | "saudi-national-day";
export type TemplateVariant = "general" | "generosity" | "authenticity" | "vision" | "giving";

export const SAUDI_NATIONAL_DAY_COLORS = {
  primary: "#005A36", // Royal Saudi Green
  primaryLight: "#006C35",
  accent: "#5aba1c", // Courage Green
  gold: "#f8ca14", // Gold
  vision: "#6565e0", // Vision Violet
  determination: "#0050af", // Determination Blue
  generosity: "#971a4d", // Generosity Berry
  authenticity: "#607c4f", // Authenticity Olive
  giving: "#7c5d21", // Giving Bronze
};

export const TEMPLATE_VARIANT_INFO: Record<TemplateVariant, { label: string; enLabel: string; bgImage: string; color: string }> = {
  general: {
    label: "القالب العام الرسمي",
    enLabel: "General Template",
    bgImage: "/themes/saudi-national-day/general_template_p1.png",
    color: "#005A36",
  },
  generosity: {
    label: "الكرم والجود (الدلة والفنجان)",
    enLabel: "Generosity",
    bgImage: "/themes/saudi-national-day/generosity_p1.png",
    color: "#971a4d",
  },
  authenticity: {
    label: "الأصالة والموروث",
    enLabel: "Authenticity",
    bgImage: "/themes/saudi-national-day/authenticity_p1.png",
    color: "#607c4f",
  },
  vision: {
    label: "الرؤية والمستقبل",
    enLabel: "Vision",
    bgImage: "/themes/saudi-national-day/vision_p1.png",
    color: "#6565e0",
  },
  giving: {
    label: "العطاء الاستثنائي",
    enLabel: "Exceptional Giving",
    bgImage: "/themes/saudi-national-day/exceptionalgiving_p1.png",
    color: "#7c5d21",
  },
};

export function useSiteTheme() {
  const { data: orchestration, isLoading } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const themeMode = orchestration?.themeMode;

  const { isNationalDay, activeTheme, remainingHours, isExpired } = useMemo(() => {
    if (!themeMode || themeMode.activeTheme !== "saudi-national-day") {
      return { isNationalDay: false, activeTheme: "default" as ThemeType, remainingHours: null, isExpired: false };
    }

    if (themeMode.expiresAt) {
      const now = Date.now();
      if (now >= themeMode.expiresAt) {
        return { isNationalDay: false, activeTheme: "default" as ThemeType, remainingHours: 0, isExpired: true };
      }
      const diffHours = (themeMode.expiresAt - now) / (1000 * 60 * 60);
      return { isNationalDay: true, activeTheme: "saudi-national-day" as ThemeType, remainingHours: Math.max(0.1, diffHours), isExpired: false };
    }

    return { isNationalDay: true, activeTheme: "saudi-national-day" as ThemeType, remainingHours: null, isExpired: false };
  }, [themeMode]);

  const templateVariant: TemplateVariant = (themeMode?.templateVariant as TemplateVariant) || "general";
  const customBadgeText = themeMode?.customBadgeText || "نحلم ونحقق 🇸🇦";
  const showCelebrationRibbon = themeMode?.showCelebrationRibbon !== false;
  const backgroundPatternOpacity = (themeMode?.backgroundPatternOpacity ?? 85) / 100;
  const currentVariantInfo = TEMPLATE_VARIANT_INFO[templateVariant] || TEMPLATE_VARIANT_INFO.general;

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isNationalDay) {
        document.documentElement.dataset.siteTheme = "saudi-national-day";
        document.body.classList.add("theme-saudi-national-day");
      } else {
        document.documentElement.dataset.siteTheme = "default";
        document.body.classList.remove("theme-saudi-national-day");
      }
    }
  }, [isNationalDay]);

  return {
    isNationalDay,
    activeTheme,
    templateVariant,
    customBadgeText,
    showCelebrationRibbon,
    backgroundPatternOpacity,
    backgroundPatternUrl: currentVariantInfo.bgImage,
    variantInfo: currentVariantInfo,
    remainingHours,
    isExpired,
    colors: SAUDI_NATIONAL_DAY_COLORS,
    isLoading,
    orchestration,
  };
}
