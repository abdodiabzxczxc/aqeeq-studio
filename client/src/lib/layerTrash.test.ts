import { describe, expect, it } from "vitest";
import { LAYER_TRASH_RETENTION_DAYS, layerTrashRemainingLabel } from "./layerTrash";

describe("سلة مهملات الطبقات", () => {
  it("تحتفظ بالطبقات لمدة ثلاثين يوماً افتراضياً", () => {
    expect(LAYER_TRASH_RETENTION_DAYS).toBe(30);
  });

  it("تعرض المدة المتبقية بأيام أو ساعات دون أرقام سالبة", () => {
    const now = new Date("2026-08-17T00:00:00.000Z");
    expect(layerTrashRemainingLabel(new Date("2026-08-20T00:00:00.000Z"), now)).toBe("3 يوم");
    expect(layerTrashRemainingLabel(new Date("2026-08-17T12:00:00.000Z"), now)).toBe("12 ساعة");
    expect(layerTrashRemainingLabel(new Date("2026-08-16T00:00:00.000Z"), now)).toBe("0 ساعة");
  });
});
