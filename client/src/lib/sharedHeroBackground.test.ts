import { describe, expect, it } from "vitest";
import { heroBackgroundSourceId, isSharedHeroBackground, sharedHeroBackgroundIds, sharedHeroCanonicalId, sharedHeroElementCanonicalId, sharedHeroElementIds } from "./sharedHeroBackground";

describe("shared hero background", () => {
  it("maps mobile and desktop hero images to one shared design source", () => {
    expect(isSharedHeroBackground("home-mobile-hero-image")).toBe(true);
    expect(sharedHeroCanonicalId("home-mobile-hero-image")).toBe("home-cinematic-hero-image");
    expect(heroBackgroundSourceId("home-mobile-hero-image")).toBe("home-cinematic-hero-image");
    expect(heroBackgroundSourceId("other-background")).toBe("other-background");
    expect(sharedHeroBackgroundIds("home-cinematic-hero-image")).toEqual(["home-cinematic-hero-image", "home-mobile-hero-image"]);
  });

  it("maps equivalent hero content between mobile and desktop without syncing layout-only containers", () => {
    expect(sharedHeroElementIds("home-mobile-title")).toEqual(["home-cinematic-title", "home-mobile-title"]);
    expect(sharedHeroElementCanonicalId("home-mobile-cta")).toBe("home-cinematic-cta");
    expect(sharedHeroElementIds("home-mobile-hero-card")).toEqual(["home-mobile-hero-card"]);
  });
});
