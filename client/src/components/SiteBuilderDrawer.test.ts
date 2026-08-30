import { describe, expect, it } from "vitest";
import { pageTemplates } from "./SiteBuilderDrawer";

describe("مكتبة صفحات الأنشطة المدرسية", () => {
  it("توفر قوالب بدء مخصصة للأنشطة المدرسية الأساسية", () => {
    expect(Object.keys(pageTemplates)).toEqual(expect.arrayContaining(["scienceFair", "talentShow", "nationalDay", "fieldTrip", "sportsLeague", "schoolNews"]));
  });

  it("يحتوي كل قالب نشاط على بداية واضحة ومحتوى داعم وخطوة تالية", () => {
    for (const id of ["scienceFair", "talentShow", "nationalDay", "fieldTrip", "sportsLeague", "schoolNews"] as const) {
      const types = pageTemplates[id].sections.map((section) => section.type);
      expect(types).toContain("hero");
      expect(types).toContain("features");
      expect(types).toContain("cta");
    }
  });
});
