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
});
