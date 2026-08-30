import { describe, expect, it } from "vitest";
import { snapToLayerGrid } from "./layerGrid";

describe("snapToLayerGrid", () => {
  it("يلتقط إزاحة الطبقة إلى أقرب نقطة في شبكة 8 بكسل", () => {
    expect(snapToLayerGrid(5)).toBe(8);
    expect(snapToLayerGrid(19)).toBe(16);
    expect(snapToLayerGrid(-11)).toBe(-8);
  });

  it("يقبل مقاس شبكة مخصصاً عند الحاجة", () => {
    expect(snapToLayerGrid(14, 10)).toBe(10);
    expect(snapToLayerGrid(16, 10)).toBe(20);
  });
});
