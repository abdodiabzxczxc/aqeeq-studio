export const SHARED_HERO_BACKGROUND_IDS = [
  "home-cinematic-hero-image",
  "home-mobile-hero-image",
] as const;

const SHARED_HERO_ELEMENT_GROUPS = [
  SHARED_HERO_BACKGROUND_IDS,
  ["home-cinematic-school-logo", "home-mobile-header-logo"],
  ["home-cinematic-ceremony-logo", "home-mobile-ceremony-logo"],
  ["home-cinematic-eyebrow", "home-mobile-eyebrow"],
  ["home-cinematic-title", "home-mobile-title"],
  ["home-cinematic-subtitle", "home-mobile-subtitle"],
  ["home-cinematic-cta", "home-mobile-cta"],
] as const;

export function isSharedHeroBackground(elementId: string) {
  return (SHARED_HERO_BACKGROUND_IDS as readonly string[]).includes(elementId);
}

export function sharedHeroBackgroundIds(elementId: string) {
  return isSharedHeroBackground(elementId) ? [...SHARED_HERO_BACKGROUND_IDS] : [elementId];
}

export function sharedHeroCanonicalId(elementId: string) {
  return isSharedHeroBackground(elementId) ? SHARED_HERO_BACKGROUND_IDS[0] : elementId;
}

export function heroBackgroundSourceId(elementId: string) {
  return sharedHeroCanonicalId(elementId);
}

export function sharedHeroElementIds(elementId: string) {
  const group = SHARED_HERO_ELEMENT_GROUPS.find((candidate) => (candidate as readonly string[]).includes(elementId));
  return group ? [...group] : [elementId];
}

export function sharedHeroElementCanonicalId(elementId: string) {
  return sharedHeroElementIds(elementId)[0] || elementId;
}
