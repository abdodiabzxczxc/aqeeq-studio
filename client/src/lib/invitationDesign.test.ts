import { describe, expect, it } from "vitest";
import { defaultInvitationLayout, getInvitationTemplate, getInvitationTemplateLayout, invitationTemplates, isInvitationTemplateId, makeInvitationLayer, parseInvitationLayout } from "./invitationDesign";

describe("قوالب مصمم الدعوة", () => {
  it("يوفر قوالب متعددة ويعيد القالب الافتراضي عند وجود قيمة غير مدعومة", () => {
    expect(invitationTemplates).toHaveLength(16);
    expect(isInvitationTemplateId("artdeco")).toBe(true);
    expect(isInvitationTemplateId("unknown")).toBe(false);
    expect(getInvitationTemplate("unknown").id).toBe("royal");
  });

  it("يحافظ على القالب المختار عند استخدام أحد القوالب الجديدة", () => {
    expect(getInvitationTemplate("floral")).toMatchObject({ id: "floral", name: "ورد وحرير", layout: "ribbon" });
    expect(getInvitationTemplate("cinema")).toMatchObject({ id: "cinema", name: "ليلة العرض", layout: "poster" });
  });

  it("يوفر تنويعات تخطيط حقيقية للمعرض بدلاً من اختلاف الألوان فقط", () => {
    expect(new Set(invitationTemplates.map((template) => template.layout)).size).toBeGreaterThanOrEqual(5);
    expect(new Set(invitationTemplates.map((template) => template.family)).size).toBeGreaterThanOrEqual(10);
    const royal = getInvitationTemplateLayout("royal");
    const cinema = getInvitationTemplateLayout("cinema");
    const aurora = getInvitationTemplateLayout("aurora");
    expect({ titleX: royal.titleX, titleY: royal.titleY, qrX: royal.qrX, qrY: royal.qrY }).not.toEqual({ titleX: cinema.titleX, titleY: cinema.titleY, qrX: cinema.qrX, qrY: cinema.qrY });
    expect({ titleX: aurora.titleX, guestX: aurora.guestX, qrX: aurora.qrX }).not.toEqual({ titleX: royal.titleX, guestX: royal.guestX, qrX: royal.qrX });
    expect(royal.layers?.some((layer) => layer.kind === "shape" && layer.shape === "arch")).toBe(true);
    expect(cinema.layers?.some((layer) => layer.name === "لوحة البرنامج")).toBe(true);
  });

  it("يربط كل قالب بتخطيط تنزيل واضح ويقدم مساحة تصميم حر", () => {
    expect(invitationTemplates.map((template) => template.layout)).toEqual(expect.arrayContaining(["arch", "marble", "poster", "gallery", "halo", "split", "ribbon", "formal", "custom"]));
    expect(getInvitationTemplate("custom")).toMatchObject({ id: "custom", name: "قالبك الحر", layout: "custom" });
  });

  it("يقرأ تخطيط التصميم الحر بأمان ويستعيد القيم الافتراضية عند الحاجة", () => {
    expect(parseInvitationLayout(JSON.stringify({ titleX: 720, qrSize: 245 }))).toMatchObject({ ...defaultInvitationLayout, titleX: 720, qrSize: 245 });
    expect(parseInvitationLayout(JSON.stringify({ sourceTemplateId: "royal", titleX: 720, subtitleY: 390, titleColor: "#d4af37", subtitleColor: "#ffffff", titleFont: "Amiri", subtitleFont: "Cairo" }))).toMatchObject({ sourceTemplateId: "royal", titleX: 720, subtitleY: 390, titleColor: "#d4af37", subtitleColor: "#ffffff", titleFont: "Amiri", subtitleFont: "Cairo" });
    expect(parseInvitationLayout("بيانات غير صالحة")).toEqual(defaultInvitationLayout);
    const extra = makeInvitationLayer("text", 4);
    const restored = parseInvitationLayout(JSON.stringify({ sourceTemplateId: "royal", layers: [{ ...extra, text: "نص حر", x: 315, y: 410 }] }));
    expect(restored.layers).toEqual([expect.objectContaining({ kind: "text", text: "نص حر", x: 315, y: 410 })]);
  });
});
