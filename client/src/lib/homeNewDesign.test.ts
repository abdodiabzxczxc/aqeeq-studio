import { describe, expect, it } from "vitest";
import { hasOnlyNewHomeAssets, homeNewImages, homeNewLayerRoots } from "./homeNewDesign";

describe("homeNewDesign", () => {
  it("uses a dedicated new image set rather than the retired public hero source", () => {
    expect(hasOnlyNewHomeAssets(homeNewImages)).toBe(true);
    expect(Object.values(homeNewImages)).toHaveLength(3);
  });

  it("keeps every top-level visual chapter addressable in the editor layer tree", () => {
    expect(homeNewLayerRoots).toEqual([
      "home-new-header",
      "home-new-hero",
      "home-new-manifest",
      "home-new-atelier",
      "home-new-seasons",
      "home-new-archive",
      "home-new-finale",
      "home-new-footer",
    ]);
  });
});
