export const homeNewImages = {
  hero: "/manus-storage/alaqeeq-home-hero-new_c9c77d57.jpg",
  atelier: "/manus-storage/alaqeeq-home-atelier-new-v2_7afc8ff7.jpg",
  archive: "/manus-storage/alaqeeq-home-archive-new-v2_3d2e1f8a.jpg",
} as const;

export const homeNewLayerRoots = [
  "home-new-header",
  "home-new-hero",
  "home-new-manifest",
  "home-new-atelier",
  "home-new-seasons",
  "home-new-archive",
  "home-new-finale",
  "home-new-footer",
] as const;

export const hasOnlyNewHomeAssets = (images: Record<string, string>) =>
  Object.values(images).every((url) => url.includes("alaqeeq-home-") && !url.includes("published-home"));
