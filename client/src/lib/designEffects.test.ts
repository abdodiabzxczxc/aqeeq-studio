import { describe, expect, it } from "vitest";
import { designEffectStyle } from "./designEffects";

describe("تأثيرات التصميم", () => {
  it("يركب فلتر اللون والتمويه في معاينة واحدة", () => {
    expect(designEffectStyle({ filterPreset: "vivid", blurAmount: 5 })).toMatchObject({ filter: "saturate(1.5) contrast(1.12) blur(5px)" });
  });

  it("يعيد الظل ووضع الدمج المطلوبين للطبقة", () => {
    expect(designEffectStyle({ shadowPreset: "glow", blendMode: "overlay" })).toMatchObject({ boxShadow: "0 0 28px rgba(229,184,79,.38)", mixBlendMode: "overlay" });
  });

  it("لا يطبق تأثيراً عند اختيار القيم الأصلية", () => {
    expect(designEffectStyle({ filterPreset: "original", blurAmount: 0, shadowPreset: "none", blendMode: "normal" })).toEqual({ filter: undefined, boxShadow: undefined, mixBlendMode: undefined });
  });
});
