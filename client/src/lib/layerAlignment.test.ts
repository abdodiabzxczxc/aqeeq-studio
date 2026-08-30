import { describe, expect, it } from "vitest";
import { alignedLayerX, alignedLayerY, distributeLayerSpacing } from "./layerAlignment";

describe("alignedLayerX", () => {
  it("يحاذي الحافتين اليمنيين على نفس الخط", () => {
    expect(alignedLayerX({ currentX: 0, currentLeft: 100, width: 80, target: 400, mode: "right" })).toBe(224);
  });

  it("يوسّط طبقة أصغر حول خط منتصف الطبقة المرجعية", () => {
    expect(alignedLayerX({ currentX: 0, currentLeft: 120, width: 40, target: 240, mode: "center" })).toBe(104);
  });

  it("يحاذي الحافتين اليسريين مع التقاط الشبكة", () => {
    expect(alignedLayerX({ currentX: 3, currentLeft: 97, width: 20, target: 203, mode: "left" })).toBe(112);
  });
});

describe("alignedLayerY", () => {
  it("يحاذي الحافتين السفليتين على نفس الخط", () => {
    expect(alignedLayerY({ currentY: 0, currentTop: 100, height: 80, target: 400, mode: "bottom" })).toBe(224);
  });

  it("يوسّط طبقة أقصر على خط المنتصف الرأسي", () => {
    expect(alignedLayerY({ currentY: 0, currentTop: 120, height: 40, target: 240, mode: "middle" })).toBe(104);
  });
});

describe("distributeLayerSpacing", () => {
  it("يوزع الطبقات الوسطى بحيث تتساوى المسافات الأفقية", () => {
    const result = distributeLayerSpacing([
      { id: "first", start: 0, size: 40, offset: 0 },
      { id: "second", start: 96, size: 60, offset: 0 },
      { id: "third", start: 260, size: 40, offset: 0 },
    ]);

    expect(result.get("second")).toBe(24);
  });

  it("يحافظ على الطبقتين الطرفيتين ويضبط أكثر من طبقة وسطى", () => {
    const result = distributeLayerSpacing([
      { id: "first", start: 0, size: 20, offset: 0 },
      { id: "second", start: 60, size: 20, offset: 0 },
      { id: "third", start: 140, size: 20, offset: 0 },
      { id: "last", start: 260, size: 20, offset: 0 },
    ]);

    expect(result.get("second")).toBe(27);
    expect(result.get("third")).toBe(33);
    expect(result.has("first")).toBe(false);
    expect(result.has("last")).toBe(false);
  });
});
