import { PROJECT_PALETTE, suggestedTextColor } from "./layerDesign";
import { describe, expect, it } from "vitest";

describe("لوحة ألوان طبقات المحرر", () => {
  it("تحافظ على ألوان هوية العقيق الأساسية", () => {
    expect(PROJECT_PALETTE.map((color) => color.value)).toEqual(["#e5b84f", "#000000", "#ebe5d6", "#ffffff"]);
  });

  it("يقترح نصاً داكناً فوق الخلفيات الفاتحة ونصاً أبيض فوق الخلفيات الداكنة", () => {
    expect(suggestedTextColor("#ffffff")).toBe("#000000");
    expect(suggestedTextColor("#e5b84f")).toBe("#000000");
    expect(suggestedTextColor("linear-gradient(135deg,#0a0d14,#263b4a)")).toBe("#ffffff");
  });
});
