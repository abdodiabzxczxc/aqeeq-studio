import { describe, expect, it } from "vitest";
import { snapLayerToElements } from "./layerSnap";

describe("snapLayerToElements", () => {
  it("يلتقط الحافة اليمنى للطبقة المتحركة إلى الحافة اليمنى لطبقة مجاورة", () => {
    const result = snapLayerToElements(
      { left: 206, top: 100, width: 80, height: 40 },
      [{ left: 100, top: 100, width: 180, height: 40 }],
    );

    expect(result.deltaX).toBe(-6);
    expect(result.guides.x).toBe(280);
  });

  it("يلتقط منتصف الطبقة إلى منتصف طبقة مجاورة", () => {
    const result = snapLayerToElements(
      { left: 171, top: 202, width: 40, height: 40 },
      [{ left: 100, top: 100, width: 180, height: 100 }],
    );

    expect(result.deltaX).toBe(-1);
    expect(result.deltaY).toBe(-2);
    expect(result.guides).toEqual({ x: 190, y: 200 });
  });

  it("لا يلتقط عندما تكون الطبقات بعيدة عن نطاق المغناطيس", () => {
    const result = snapLayerToElements(
      { left: 330, top: 330, width: 40, height: 40 },
      [{ left: 100, top: 100, width: 80, height: 80 }],
    );

    expect(result).toEqual({ deltaX: 0, deltaY: 0, guides: {} });
  });
});
