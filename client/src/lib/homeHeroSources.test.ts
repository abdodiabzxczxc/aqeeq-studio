import { describe, expect, it } from "vitest";
import { publishedHomeBrandSources, publishedHomeHeroSources } from "./homeHeroSources";

describe("publishedHomeHeroSources", () => {
  it("uses stable published image sources for the initial desktop and mobile paint", () => {
    expect(publishedHomeHeroSources.desktop).toContain("/manus-storage/");
    expect(publishedHomeHeroSources.mobile).toContain("/manus-storage/");
    expect(publishedHomeHeroSources.desktop).toBe(publishedHomeHeroSources.mobile);
  });

  it("uses the active public brand assets before remote settings resolve", () => {
    expect(publishedHomeBrandSources.schoolLogo).toContain("/manus-storage/");
    expect(publishedHomeBrandSources.ceremonyLogo).toContain("/manus-storage/");
  });
});
