import { describe, expect, it } from "vitest";
import { fitLayerToWorkspace, resizeLayerFrame, shouldShiftFollowingLayersAfterResize, verticalStackShift } from "./backgroundResize";

describe("مقابض تحجيم طبقة الخلفية", () => {
  it("يعيد حساب الإطار من المقابض الأربع دون عبور الحد الأدنى", () => {
    const frame = { x: 20, y: 30, width: 200, height: 120 };
    expect(resizeLayerFrame(frame, 40, 20, "se")).toEqual({ x: 20, y: 30, width: 240, height: 140 });
    expect(resizeLayerFrame(frame, 40, 20, "nw")).toEqual({ x: 60, y: 50, width: 160, height: 100 });
    expect(resizeLayerFrame(frame, -20, 30, "ne")).toEqual({ x: 20, y: 60, width: 180, height: 90 });
    expect(resizeLayerFrame(frame, 1000, 1000, "nw")).toEqual({ x: 196, y: 126, width: 24, height: 24 });
  });

  it("يحافظ على نسبة أبعاد الخلفية عند تفعيل القفل", () => {
    expect(resizeLayerFrame({ x: 0, y: 0, width: 200, height: 100 }, 100, 5, "se", 24, true)).toEqual({ x: 0, y: 0, width: 300, height: 150 });
    expect(resizeLayerFrame({ x: 0, y: 0, width: 200, height: 100 }, 5, 100, "nw", 24, true)).toEqual({ x: 152, y: 76, width: 48, height: 24 });
  });

  it("يتيح قصّ الارتفاع من الحافة العليا أو السفلى دون تغيير العرض", () => {
    const frame = { x: 20, y: 30, width: 200, height: 120 };
    expect(resizeLayerFrame(frame, 99, 20, "s")).toEqual({ x: 20, y: 30, width: 200, height: 140 });
    expect(resizeLayerFrame(frame, 99, 20, "n")).toEqual({ x: 20, y: 50, width: 200, height: 100 });
    expect(resizeLayerFrame(frame, 99, 1000, "n")).toEqual({ x: 20, y: 126, width: 200, height: 24 });
  });

  it("يزيح الطبقة الواقعة تحت الخلفية بمقدار تغير ارتفاعها فقط", () => {
    expect(verticalStackShift(200, 260, 220, 200)).toBe(60);
    expect(verticalStackShift(200, 150, 220, 200)).toBe(-50);
    expect(verticalStackShift(200, 260, 140, 200)).toBe(0);
  });

  it("يبقي القسم التالي ملتصقاً عند قص الحافة السفلية ولا يزيحه عند قص الأعلى", () => {
    expect(shouldShiftFollowingLayersAfterResize("s")).toBe(true);
    expect(shouldShiftFollowingLayersAfterResize("se")).toBe(true);
    expect(shouldShiftFollowingLayersAfterResize("n")).toBe(false);
    expect(shouldShiftFollowingLayersAfterResize("nw")).toBe(false);
  });

  it("يملأ المساحة أو يحتوي الخلفية داخلها مع الحفاظ على النسبة", () => {
    const frame = { x: 0, y: 0, width: 400, height: 200 };
    expect(fitLayerToWorkspace(frame, { width: 600, height: 600 }, "fill")).toEqual({ x: -300, y: 0, width: 1200, height: 600 });
    expect(fitLayerToWorkspace(frame, { width: 600, height: 600 }, "contain")).toEqual({ x: 0, y: 150, width: 600, height: 300 });
  });
});
