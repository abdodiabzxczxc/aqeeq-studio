export function isBackgroundLayer(elementId: string, label = "") {
  return /background|backdrop|overlay|glow|hero|cover/i.test(elementId) || /خلفية|تدرج|إضاءة/i.test(label);
}

export function isBackgroundSurface(elementId: string, label = "", tag = "") {
  return (tag !== "text" && isBackgroundLayer(elementId, label))
    || (["section", "section-block"].includes(tag) && /قسم|فصل|غلاف|قماش|لوحة|مساحة|موسم|رحلة|مسرح|أرشيف|ختام/i.test(label));
}

const CORE_BACKGROUND_LAYER_IDS = new Set([
  "home-mobile-hero-image",
  "home-cinematic-hero-image",
]);

export function isCoreBackgroundLayer(elementId: string) {
  return CORE_BACKGROUND_LAYER_IDS.has(elementId);
}

export type BackgroundOrigin = {
  bgColor: string;
  mediaUrl: string;
  backgroundSize: number;
  backgroundPositionX: number;
  backgroundPositionY: number;
  backgroundOverlay: number;
};

export const DEFAULT_BACKGROUND_ORIGINS: Record<string, BackgroundOrigin> = {
  "home-mobile-hero-image": { mediaUrl: "/manus-storage/alaqeeq-mobile-hero-cinematic_8553724a.jpg", bgColor: "", backgroundSize: 100, backgroundPositionX: 50, backgroundPositionY: 50, backgroundOverlay: 0 },
};

export function resolveBackgroundOrigin(elementId: string, customOrigin?: BackgroundOrigin) {
  return customOrigin ?? DEFAULT_BACKGROUND_ORIGINS[elementId];
}

export function backgroundSizeCss(size?: number | null) {
  return (size ?? 100) <= 100 ? "cover" : `${size}% auto`;
}

export function lowerLayerZIndex(currentZIndex: number, elementId: string, label = "") {
  return isBackgroundLayer(elementId, label) ? Math.max(0, currentZIndex - 1) : currentZIndex - 1;
}
