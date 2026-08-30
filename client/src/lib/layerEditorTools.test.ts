import { describe, expect, it } from "vitest";
import { extractCopyableStyle, isBackgroundLikeLayer } from "./layerEditorTools";

describe("extractCopyableStyle", () => {
  it("ينسخ خصائص النمط البصري دون مشاركة نفس المرجع", () => {
    const source = { textColor: "#fff", bgColor: "#000", fontSize: "24px", padding: "8px", margin: "0", borderRadius: "12px", layerOpacity: 75 };
    expect(extractCopyableStyle(source)).toEqual(source);
    expect(extractCopyableStyle(source)).not.toBe(source);
  });
});

describe("isBackgroundLikeLayer", () => {
  it("يتعرف على الخلفيات والتدرجات لحمايتها جماعياً", () => {
    expect(isBackgroundLikeLayer("home-hero-background", "صورة الغلاف")).toBe(true);
    expect(isBackgroundLikeLayer("home-title", "العنوان الرئيسي")).toBe(false);
  });
});
