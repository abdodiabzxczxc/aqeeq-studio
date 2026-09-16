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
    const rawReg = localStorage.getItem(GLOBAL_REGISTRY_KEY);
    if (rawReg) {
      memoryRegistry = JSON.parse(rawReg);
    }

    const rawRep = localStorage.getItem(SRC_REPLACEMENTS_KEY);
    if (rawRep) {
      memoryReplacements = JSON.parse(rawRep);
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
  if (fallbackSrc && memoryReplacements[fallbackSrc]) {
    return {
      elementId,
      mediaUrl: memoryReplacements[fallbackSrc],
    };
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
 * Associates an original image source URL with a new replacement URL
 */
export function recordSrcReplacement(originalSrc: string, newSrc: string) {
  if (!originalSrc || !newSrc || originalSrc === newSrc) return;
  initCache();
  if (memoryReplacements[originalSrc] === newSrc) return;
  memoryReplacements[originalSrc] = newSrc;
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(SRC_REPLACEMENTS_KEY, JSON.stringify(memoryReplacements));
    }
  } catch {}
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

