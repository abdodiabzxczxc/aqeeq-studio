export type DesignEffectSettings = {
  filterPreset?: "original" | "mono" | "vivid" | "warm" | "cool" | "soft";
  blurAmount?: 0 | 2 | 5 | 9;
  shadowPreset?: "none" | "soft" | "bold" | "glow";
  blendMode?: "normal" | "screen" | "multiply" | "overlay";
};

export function designEffectStyle(settings: DesignEffectSettings) {
  const colorFilter = settings.filterPreset === "mono" ? "grayscale(1) contrast(1.08)" : settings.filterPreset === "vivid" ? "saturate(1.5) contrast(1.12)" : settings.filterPreset === "warm" ? "sepia(.22) saturate(1.2)" : settings.filterPreset === "cool" ? "hue-rotate(12deg) saturate(1.12)" : settings.filterPreset === "soft" ? "saturate(.82) contrast(.92)" : "";
  const blurFilter = settings.blurAmount ? `blur(${settings.blurAmount}px)` : "";
  const boxShadow = settings.shadowPreset === "soft" ? "0 14px 36px rgba(0,0,0,.24)" : settings.shadowPreset === "bold" ? "0 24px 60px rgba(0,0,0,.52)" : settings.shadowPreset === "glow" ? "0 0 28px rgba(229,184,79,.38)" : undefined;
  return { filter: [colorFilter, blurFilter].filter(Boolean).join(" ") || undefined, boxShadow, mixBlendMode: settings.blendMode && settings.blendMode !== "normal" ? settings.blendMode : undefined };
}
