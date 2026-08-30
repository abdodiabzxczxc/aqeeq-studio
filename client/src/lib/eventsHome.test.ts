import { describe, expect, it } from "vitest";
import { eventsHomeAssets, eventsHomeLayerRoots, eventsHomeNavigationLabels } from "./eventsHome";

describe("واجهة منصة الفعاليات الرئيسية", () => {
  it("تحتفظ بقائمة خارجية تقود إلى مراحل الفعالية الأساسية", () => {
    expect(eventsHomeNavigationLabels).toEqual(["الفعالية القادمة", "رحلة الضيف", "المسرح والبث", "سجل الذكريات", "كل الفعاليات"]);
  });

  it("تعرف كل الفصول الكبرى كجذور مستقلة داخل خريطة الطبقات", () => {
    expect(eventsHomeLayerRoots).toContain("events-external-rail");
    expect(eventsHomeLayerRoots).toContain("events-hero");
    expect(eventsHomeLayerRoots).toContain("events-final");
  });

  it("يعتمد على مجموعة صور فعالية مخصصة بدل صور الصفحة المدرسية السابقة", () => {
    expect(Object.values(eventsHomeAssets).every((url) => url.includes("alaqeeq-events-"))).toBe(true);
  });
});
