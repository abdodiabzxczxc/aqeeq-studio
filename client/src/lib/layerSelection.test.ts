import { describe, expect, it } from "vitest";
import { layerIntersectsSelection, selectionFrameFromPoints } from "./layerSelection";

describe("selectionFrameFromPoints", () => {
  it("ينشئ إطاراً صحيحاً عند السحب من أي اتجاه", () => {
    expect(selectionFrameFromPoints(300, 200, 100, 80)).toEqual({ left: 100, top: 80, width: 200, height: 120 });
  });
});

describe("layerIntersectsSelection", () => {
  it("يختار طبقة تتقاطع مع إطار السحب", () => {
    expect(layerIntersectsSelection({ left: 120, top: 120, width: 80, height: 80 }, { left: 100, top: 100, width: 70, height: 70 })).toBe(true);
  });

  it("لا يختار طبقة خارج الإطار", () => {
    expect(layerIntersectsSelection({ left: 220, top: 220, width: 80, height: 80 }, { left: 100, top: 100, width: 70, height: 70 })).toBe(false);
  });
});
