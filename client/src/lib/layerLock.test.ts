import { describe, expect, it } from "vitest";
import { canManipulateLayer, unlockedLayerIds } from "./layerLock";

describe("canManipulateLayer", () => {
  it("يمنع العمليات المباشرة عندما تكون الطبقة مقفلة", () => {
    expect(canManipulateLayer(true)).toBe(false);
  });

  it("يسمح بالعمليات للطبقات غير المقفلة أو الجديدة", () => {
    expect(canManipulateLayer(false)).toBe(true);
    expect(canManipulateLayer(undefined)).toBe(true);
  });
});

describe("unlockedLayerIds", () => {
  it("يستبعد الطبقات المقفلة عند تحريك مجموعة", () => {
    expect(unlockedLayerIds(["background", "title", "button"], (id) => id === "background")).toEqual(["title", "button"]);
  });
});
