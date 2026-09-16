/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║        Aqeeq Studio — Global Visual Overrides & Image Cache          ║
 * ║  Synchronous Frame-0 hydration to eliminate any old image flicker    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

export interface CachedVisualOverride {
  elementId: string;
  pagePath?: string;
  elementTag?: string;
  mediaUrl?: string | null;
  altText?: string | null;
  linkUrl?: string | null;
  alignment?: "start" | "center" | "end" | "stretch" | null;
  contentText?: string | null;
  textColor?: string | null;
  bgColor?: string | null;
  fontSize?: string | null;
  padding?: string | null;
  margin?: string | null;
  borderRadius?: string | null;
  layerX?: number;
  layerY?: number;
  layerWidth?: number | null;
  layerHeight?: number | null;
  layerZIndex?: number;
  layerOpacity?: number;
  backgroundSize?: number;
  backgroundPositionX?: number;
  backgroundPositionY?: number;
  backgroundOverlay?: number;
  customCss?: string | null;
  isLocked?: boolean;
  isHidden?: boolean;
  status?: string;
}

export const GLOBAL_REGISTRY_KEY = "aqeeq_global_overrides_registry_v2";
export const SRC_REPLACEMENTS_KEY = "aqeeq_src_replacements_v2";
export const SITE_ORCHESTRATION_KEY = "aqeeq_site_orchestration_cache_v2";

// In-memory instant lookup maps (0ms)
let memoryRegistry: Record<string, CachedVisualOverride> = {};
let memoryReplacements: Record<string, string> = {};
let initialized = false;

function initCache() {
  if (initialized || typeof window === "undefined") return;
  try {
    // 1. Read localStorage
    const rawReg = localStorage.getItem(GLOBAL_REGISTRY_KEY);
    if (rawReg) {
      memoryRegistry = JSON.parse(rawReg);
    }

    const rawRep = localStorage.getItem(SRC_REPLACEMENTS_KEY);
    if (rawRep) {
      memoryReplacements = JSON.parse(rawRep);
    }

    // 2. Read server-injected state (Immediate Frame-0 Source of Truth)
    const serverOverrides = (window as any).__AQEEQ_SERVER_OVERRIDES__;
    if (Array.isArray(serverOverrides)) {
      for (const item of serverOverrides) {
        if (!item || !item.elementId) continue;
        memoryRegistry[item.elementId] = item;
        if (item.pagePath) {
          memoryRegistry[`${item.pagePath}::${item.elementId}`] = item;
        }
      }
    }

    const serverReplacements = (window as any).__AQEEQ_SERVER_REPLACEMENTS__;
    if (serverReplacements && typeof serverReplacements === "object") {
      for (const [orig, repl] of Object.entries(serverReplacements)) {
        if (typeof repl === "string") {
          const keys = normalizeSrcKeys(orig);
          for (const k of keys) {
            memoryReplacements[k] = repl;
          }
        }
      }
    }

    // 3. Fallback defaults for Timeline heritage eras in case of clean initial browser state
    const ERA_FALLBACKS = [
      {
        year: "1994",
        orig: "/covers/student-excellence-about.jpg",
        mediaUrl: "/api/drive-proxy/1ulrpYsDrV7xbDdysqTsNoLNUvblw14p5",
        altText: "im 5-01.png",
      },
      {
        year: "2010",
        orig: "/covers/student-lab-admissions.jpg",
        mediaUrl: "/api/drive-proxy/1IkefgGSvnqfdhLiMHYd25-lz3AuBH5n1",
        altText: "IMG_2925.PNG",
      },
      {
        year: "2018",
        orig: "/covers/cover-accreditations.jpg",
        mediaUrl: "/api/drive-proxy/1qifbHFSgFaBQH1g63qvK2WmQtls0l4AR",
        altText: "im 3-01.png",
      },
      {
        year: "2026",
        orig: "/covers/first-lego-champions.png",
        mediaUrl: "/api/drive-proxy/16IxreFp6eRLCuLDZyIWEoU9eWHzOCJuC",
        altText: "IMG_2868.PNG",
      },
    ];

    for (const era of ERA_FALLBACKS) {
      if (!memoryReplacements[era.orig]) {
        const keys = normalizeSrcKeys(era.orig);
        for (const k of keys) {
          memoryReplacements[k] = era.mediaUrl;
        }
      }
      const elementId = `about-timeline-era-${era.year}`;
      if (!memoryRegistry[elementId]) {
        const ov: CachedVisualOverride = {
          elementId,
          pagePath: "/about",
          mediaUrl: era.mediaUrl,
          altText: era.altText,
          status: "published",
        };
        memoryRegistry[elementId] = ov;
        memoryRegistry[`/about::${elementId}`] = ov;
      }
    }

    // Migrate legacy aqeeq-overrides-/ if present
    const legacyHero = localStorage.getItem("aqeeq-overrides-/");
    if (legacyHero) {
      try {
        const list = JSON.parse(legacyHero);
        if (Array.isArray(list)) {
          for (const item of list) {
            if (item.elementId && !memoryRegistry[item.elementId]) {
              memoryRegistry[item.elementId] = item;
              memoryRegistry[`/::${item.elementId}`] = item;
            }
          }
        }
      } catch {}
    }

    initialized = true;
  } catch {
    // Ignore storage parse errors
  }
}

/**
 * Generates all normalized key variants for an image URL so relative and absolute URLs match.
 */
export function normalizeSrcKeys(src: string): string[] {
  if (!src) return [];
  const keys = new Set<string>();
  const trimmed = src.trim();
  keys.add(trimmed);

  const noQuery = trimmed.split("?")[0].split("#")[0];
  keys.add(noQuery);

  if (trimmed.startsWith("/")) {
    if (typeof window !== "undefined" && window.location?.origin) {
      keys.add(window.location.origin + trimmed);
      keys.add(window.location.origin + noQuery);
    }
  } else {
    try {
      const url = new URL(trimmed);
      keys.add(url.pathname);
      keys.add(url.origin + url.pathname);
    } catch {}
  }
  return Array.from(keys);
}

/**
 * Resolves any image URL against the synchronous replacements cache.
 * Returns the replacement URL in 0.001ms if replaced, otherwise returns original src.
 */
export function resolveInstantSrc(src?: string | null): string {
  if (!src) return "";
  initCache();
  const keys = normalizeSrcKeys(src);
  for (const k of keys) {
    if (memoryReplacements[k]) {
      return memoryReplacements[k];
    }
  }
  return src;
}

const preloadedUrls = new Set<string>();

/**
 * Checks whether an image URL has already been preloaded / decoded in memory
 */
export function isImagePreloaded(src?: string | null): boolean {
  if (!src || typeof Image === "undefined") return false;
  return preloadedUrls.has(src);
}

/**
 * Preloads an image into browser memory asynchronously and marks it in the preloaded set.
 * Guaranteed to resolve safely without rejecting.
 */
export function preloadImage(src?: string | null): Promise<void> {
  if (!src || typeof window === "undefined" || typeof Image === "undefined") return Promise.resolve();
  const resolved = resolveInstantSrc(src) || src;
  if (preloadedUrls.has(resolved)) return Promise.resolve();

  return new Promise((resolve) => {
    const img = new Image();
    img.src = resolved;
    if (img.complete) {
      preloadedUrls.add(resolved);
      resolve();
    } else {
      img.onload = () => {
        preloadedUrls.add(resolved);
        resolve();
      };
      img.onerror = () => {
        resolve();
      };
    }
  });
}

/**
 * Synchronously retrieves any active override for an element ID, page path, or fallback src.
 * Returns in 0.001ms from RAM cache with zero network delay.
 */
export function getInstantVisualOverride(
  elementId: string,
  pagePath?: string | null,
  fallbackSrc?: string | null
): CachedVisualOverride | undefined {
  initCache();
  if (pagePath) {
    const composite = `${pagePath}::${elementId}`;
    if (memoryRegistry[composite]?.mediaUrl || memoryRegistry[composite]?.contentText) {
      return memoryRegistry[composite];
    }
  }
  if (memoryRegistry[elementId]?.mediaUrl || memoryRegistry[elementId]?.contentText) {
    return memoryRegistry[elementId];
  }
  if (fallbackSrc) {
    const replaced = resolveInstantSrc(fallbackSrc);
    if (replaced && replaced !== fallbackSrc) {
      return {
        elementId,
        mediaUrl: replaced,
      };
    }
  }
  return undefined;
}

/**
 * Records an override synchronously in RAM and localStorage
 */
export function setInstantVisualOverride(override: CachedVisualOverride) {
  initCache();
  if (!override.elementId) return;

  const existing = memoryRegistry[override.elementId] || {};
  const updated: CachedVisualOverride = { ...existing, ...override };

  memoryRegistry[override.elementId] = updated;
  if (override.pagePath) {
    memoryRegistry[`${override.pagePath}::${override.elementId}`] = updated;
  }

  if (override.mediaUrl) {
    preloadImage(override.mediaUrl);
  }

  // Update localStorage safely
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(GLOBAL_REGISTRY_KEY, JSON.stringify(memoryRegistry));
    }
  } catch {}
}

/**
 * Bulk syncs an array of overrides from server queries into the synchronous cache
 */
export function syncOverridesToCache(overrides: CachedVisualOverride[]) {
  if (!Array.isArray(overrides) || overrides.length === 0) return;
  initCache();
  let changed = false;

  for (const item of overrides) {
    if (!item || !item.elementId) continue;
    const existing = memoryRegistry[item.elementId];
    if (
      !existing ||
      existing.mediaUrl !== item.mediaUrl ||
      existing.contentText !== item.contentText ||
      existing.bgColor !== item.bgColor ||
      existing.textColor !== item.textColor ||
      existing.backgroundOverlay !== item.backgroundOverlay
    ) {
      memoryRegistry[item.elementId] = { ...(existing || {}), ...item };
      if (item.pagePath) {
        memoryRegistry[`${item.pagePath}::${item.elementId}`] = { ...(existing || {}), ...item };
      }
      changed = true;
    }
  }

  if (changed) {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(GLOBAL_REGISTRY_KEY, JSON.stringify(memoryRegistry));
      }
    } catch {}
  }
}

/**
 * Associates an original image source URL with a new replacement URL across all normalized key variants
 */
export function recordSrcReplacement(originalSrc: string, newSrc: string) {
  if (!originalSrc || !newSrc || originalSrc === newSrc) return;
  initCache();
  const keys = normalizeSrcKeys(originalSrc);
  let changed = false;
  for (const k of keys) {
    if (memoryReplacements[k] !== newSrc) {
      memoryReplacements[k] = newSrc;
      changed = true;
    }
  }
  if (changed) {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(SRC_REPLACEMENTS_KEY, JSON.stringify(memoryReplacements));
      }
    } catch {}
  }
}

/**
 * Removes an element override from cache
 */
export function removeInstantVisualOverride(elementId: string, pagePath?: string | null) {
  initCache();
  delete memoryRegistry[elementId];
  if (pagePath) {
    delete memoryRegistry[`${pagePath}::${elementId}`];
  }
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(GLOBAL_REGISTRY_KEY, JSON.stringify(memoryRegistry));
    }
  } catch {}
}

let memoryOrchestration: any = undefined;
let lastOrchestrationHash = "";

/**
 * Retrieves the cached site orchestration synchronously (0ms RAM lookup)
 */
export function getCachedSiteOrchestration(): any {
  if (memoryOrchestration !== undefined) return memoryOrchestration;
  if (typeof window === "undefined") return undefined;
  if ((window as any).__AQEEQ_SERVER_ORCHESTRATION__) {
    memoryOrchestration = (window as any).__AQEEQ_SERVER_ORCHESTRATION__;
    return memoryOrchestration;
  }
  try {
    const raw = localStorage.getItem(SITE_ORCHESTRATION_KEY);
    memoryOrchestration = raw ? JSON.parse(raw) : undefined;
    return memoryOrchestration;
  } catch {
    return undefined;
  }
}

/**
 * Saves site orchestration to cache (RAM and localStorage)
 */
export function cacheSiteOrchestration(data: any) {
  if (typeof window === "undefined" || !data) return;
  memoryOrchestration = data;
  try {
    const json = JSON.stringify(data);
    if (json === lastOrchestrationHash) return;
    lastOrchestrationHash = json;
    localStorage.setItem(SITE_ORCHESTRATION_KEY, json);
  } catch {}
}

// ⚡ Immediate Frame-0 synchronous boot invocation
initCache();


