import { describe, expect, it } from "vitest";
import { backgroundSizeCss, isBackgroundSurface, lowerLayerZIndex, resolveBackgroundOrigin } from "./layerBackground";

describe("معالجة خلفية الغلاف", () => {
  it("يعرض حجم الغلاف الطبيعي كتغطية كاملة بلا تكرار", () => {
    expect(backgroundSizeCss(100)).toBe("cover");
    expect(backgroundSizeCss(80)).toBe("cover");
    expect(backgroundSizeCss(150)).toBe("150% auto");
  });

  it("لا يسمح بإرسال طبقة خلفية إلى ترتيب سلبي يخفيها", () => {
    expect(lowerLayerZIndex(0, "home-mobile-hero-image", "خلفية غلاف الهاتف")).toBe(0);
    expect(lowerLayerZIndex(2, "home-mobile-hero-image", "خلفية غلاف الهاتف")).toBe(1);
    expect(lowerLayerZIndex(0, "home-mobile-title", "عنوان غلاف الهاتف")).toBe(-1);
  });

  it("يعيد الأصل المخصص أولاً ثم الأصل الافتراضي للغلاف", () => {
    const custom = { mediaUrl: "/manus-storage/hero-custom.jpg", bgColor: "", backgroundSize: 140, backgroundPositionX: 40, backgroundPositionY: 60, backgroundOverlay: 24 };
    expect(resolveBackgroundOrigin("home-mobile-hero-image", custom)).toEqual(custom);
    expect(resolveBackgroundOrigin("home-mobile-hero-image")?.mediaUrl).toBe("/manus-storage/alaqeeq-mobile-hero-cinematic_8553724a.jpg");
  });
  it("يعامل مساحة القسم الملونة كخلفية قابلة للتحرير عند اختيارها", () => {
    expect(isBackgroundSurface("events-canvas", "قماش منصة الفعاليات", "section")).toBe(true);
    expect(isBackgroundSurface("events-hero-season", "غلاف موسم الفعاليات", "section")).toBe(true);
    expect(isBackgroundSurface("events-hero-title", "عنوان موسم الفعاليات", "text")).toBe(false);
  });
});
