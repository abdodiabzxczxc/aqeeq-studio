import { describe, it, expect, beforeEach, beforeAll } from "vitest";

// In-memory localStorage mock for node test runner
const storage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, val: string) => { storage[key] = String(val); },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};

beforeAll(() => {
  (globalThis as any).window = globalThis;
  (globalThis as any).localStorage = mockLocalStorage;
});

import {
  getInstantVisualOverride,
  setInstantVisualOverride,
  syncOverridesToCache,
  recordSrcReplacement,
  resolveInstantSrc,
  getCachedSiteOrchestration,
  cacheSiteOrchestration,
  removeInstantVisualOverride,
} from "./visualOverridesCache";

describe("visualOverridesCache — Zero-Flash Image Hydration", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it("should return undefined if no override exists", () => {
    const res = getInstantVisualOverride("non-existent-id", "/about", "https://example.com/old.jpg");
    expect(res).toBeUndefined();
  });

  it("should set and instantly retrieve visual override by elementId", () => {
    setInstantVisualOverride({
      elementId: "hero-title-img",
      mediaUrl: "https://example.com/new-hero.png",
      altText: "New Hero",
    });

    const res = getInstantVisualOverride("hero-title-img");
    expect(res).toBeDefined();
    expect(res?.mediaUrl).toBe("https://example.com/new-hero.png");
    expect(res?.altText).toBe("New Hero");
  });

  it("should retrieve visual override by composite pagePath::elementId", () => {
    setInstantVisualOverride({
      elementId: "about-cover-1",
      pagePath: "/about",
      mediaUrl: "https://example.com/about-1.png",
    });

    const res = getInstantVisualOverride("about-cover-1", "/about");
    expect(res).toBeDefined();
    expect(res?.mediaUrl).toBe("https://example.com/about-1.png");
  });

  it("should fallback to src replacement if originalSrc is recorded", () => {
    recordSrcReplacement("https://example.com/hardcoded.jpg", "https://example.com/customized.jpg");

    const res = getInstantVisualOverride("any-id", "/admissions", "https://example.com/hardcoded.jpg");
    expect(res).toBeDefined();
    expect(res?.mediaUrl).toBe("https://example.com/customized.jpg");
  });

  it("should match relative paths and resolveInstantSrc synchronously", () => {
    recordSrcReplacement("/covers/first-lego-champions.png", "/uploads/my-new-lego-cover.jpg");

    expect(resolveInstantSrc("/covers/first-lego-champions.png")).toBe("/uploads/my-new-lego-cover.jpg");
    expect(resolveInstantSrc("/covers/first-lego-champions.png?v=1")).toBe("/uploads/my-new-lego-cover.jpg");

    const res = getInstantVisualOverride("generic-element-with-fallback", "/about", "/covers/first-lego-champions.png");
    expect(res).toBeDefined();
    expect(res?.mediaUrl).toBe("/uploads/my-new-lego-cover.jpg");
  });

  it("should bulk sync overrides into cache", () => {
    syncOverridesToCache([
      { elementId: "batch-1", mediaUrl: "https://example.com/b1.jpg" },
      { elementId: "batch-2", pagePath: "/news", mediaUrl: "https://example.com/b2.jpg" },
    ]);

    expect(getInstantVisualOverride("batch-1")?.mediaUrl).toBe("https://example.com/b1.jpg");
    expect(getInstantVisualOverride("batch-2", "/news")?.mediaUrl).toBe("https://example.com/b2.jpg");
  });

  it("should remove override on removeInstantVisualOverride", () => {
    setInstantVisualOverride({
      elementId: "delete-me",
      pagePath: "/albums",
      mediaUrl: "https://example.com/del.jpg",
    });

    expect(getInstantVisualOverride("delete-me", "/albums")?.mediaUrl).toBe("https://example.com/del.jpg");

    removeInstantVisualOverride("delete-me", "/albums");
    expect(getInstantVisualOverride("delete-me", "/albums")).toBeUndefined();
  });

  it("should cache and instantly retrieve site orchestration", () => {
    const mockOrchestration = {
      backdrops: {
        about: [{ id: "custom-1", title: "Custom Title", image: "https://example.com/custom.jpg" }],
      },
      heroCovers: {
        articlesMode: "custom",
      },
    };

    cacheSiteOrchestration(mockOrchestration);
    const retrieved = getCachedSiteOrchestration();
    expect(retrieved).toEqual(mockOrchestration);
    expect(retrieved.backdrops.about[0].image).toBe("https://example.com/custom.jpg");
  });

  it("should instantly resolve timeline era overrides without network fetch", () => {
    const era2026 = getInstantVisualOverride("about-timeline-era-2026", "/about");
    expect(era2026?.mediaUrl).toBe("/api/drive-proxy/16IxreFp6eRLCuLDZyIWEoU9eWHzOCJuC");

    const era2018 = getInstantVisualOverride("about-timeline-era-2018", "/about");
    expect(era2018?.mediaUrl).toBe("/api/drive-proxy/1qifbHFSgFaBQH1g63qvK2WmQtls0l4AR");
  });

  it("should resolve server-injected overrides and replacements instantly", () => {
    (globalThis as any).window.__AQEEQ_SERVER_OVERRIDES__ = [
      { elementId: "server-injected-1", pagePath: "/news", mediaUrl: "https://example.com/server-news.jpg" },
    ];
    (globalThis as any).window.__AQEEQ_SERVER_REPLACEMENTS__ = {
      "/covers/old-hero.png": "/uploads/new-hero.png",
    };

    // Re-initialize cache to parse window globals
    syncOverridesToCache((globalThis as any).window.__AQEEQ_SERVER_OVERRIDES__);
    recordSrcReplacement("/covers/old-hero.png", "/uploads/new-hero.png");

    expect(getInstantVisualOverride("server-injected-1", "/news")?.mediaUrl).toBe("https://example.com/server-news.jpg");
    expect(resolveInstantSrc("/covers/old-hero.png")).toBe("/uploads/new-hero.png");
  });
});
