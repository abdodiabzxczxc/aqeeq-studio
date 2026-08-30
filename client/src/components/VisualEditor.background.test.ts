import { describe, expect, it } from "vitest";
import { clearLocalPreviewAfterReset, heroBackgroundLayerFor, resolveBackgroundSource, resolveVisualIconName, shouldConfirmMediaReplacement, shouldShowEditorChrome, shouldShowPropertiesPanel, shouldShowWorkspacePanel } from "./VisualEditor";
import { shouldHideForFocusedEditing } from "./AlaqeeqKeyNav";
import { MEDIA_LIBRARY_Z_INDEX } from "./MediaLibrary";
import { resolveHeroOverrideForPreview } from "./VisualEditor";
import { isCoreBackgroundLayer } from "@/lib/layerBackground";

describe("مصدر خلفية المحرر", () => {
  it("يستخدم اللون أو التدرج المختار بدلاً من إعادة صورة الغلاف الأصلية", () => {
    expect(resolveBackgroundSource("", "#0b0e15", "/hero.jpg")).toBeUndefined();
    expect(resolveBackgroundSource("", "linear-gradient(135deg,#0a0d14,#263b4a)", "/hero.jpg")).toBeUndefined();
  });

  it("يعرض الصورة المختارة أو الصورة الأصلية عند عدم وجود لون بديل", () => {
    expect(resolveBackgroundSource("/new-background.jpg", "#0b0e15", "/hero.jpg")).toBe("/new-background.jpg");
    expect(resolveBackgroundSource("", "", "/hero.jpg")).toBe("/hero.jpg");
  });

  it("يوجه اختصار الشعار إلى صورة الغلاف الخاصة بنفس نسخة الصفحة", () => {
    expect(heroBackgroundLayerFor("home-mobile-header-logo")).toBe("home-mobile-hero-image");
    expect(heroBackgroundLayerFor("home-cinematic-school-logo")).toBe("home-cinematic-hero-image");
  });

  it("يربط مشهد الغلاف نفسه بطبقة الخلفية القابلة للتحرير", () => {
    expect(heroBackgroundLayerFor("home-mobile-hero-section")).toBe("home-mobile-hero-image");
    expect(heroBackgroundLayerFor("home-cinematic-hero-section")).toBe("home-cinematic-hero-image");
  });

  it("يخفي أدوات المحرر في المعاينة النظيفة مع الحفاظ على وضع التحرير في الخلفية", () => {
    expect(shouldShowEditorChrome(true, false)).toBe(true);
    expect(shouldShowEditorChrome(true, true)).toBe(false);
    expect(shouldShowEditorChrome(false, false)).toBe(false);
  });

  it("يخفي لوحة الخصائص في معاينة الهاتف كي يبقى القماش مرئياً بالكامل", () => {
    expect(shouldShowPropertiesPanel(true, true, false, false)).toBe(true);
    expect(shouldShowPropertiesPanel(true, true, false, true)).toBe(false);
    expect(shouldShowPropertiesPanel(true, true, true, false)).toBe(false);
  });

  it("يخفي كل لوحات العمل المفتوحة في المعاينة النظيفة", () => {
    expect(shouldShowWorkspacePanel(true, false, true)).toBe(true);
    expect(shouldShowWorkspacePanel(true, true, true)).toBe(false);
    expect(shouldShowWorkspacePanel(false, false, true)).toBe(false);
  });

  it("يخفي قائمة الإدارة عند فتح خصائص طبقة أو عند معاينة المسودة", () => {
    expect(shouldHideForFocusedEditing(true, "home-hero-title", false)).toBe(true);
    expect(shouldHideForFocusedEditing(true, null, false)).toBe(false);
    expect(shouldHideForFocusedEditing(false, null, true)).toBe(true);
  });

  it("يعرض مكتبة الوسائط فوق لوحة الخصائص وقائمة الإدارة", () => {
    expect(MEDIA_LIBRARY_Z_INDEX).toBeGreaterThan(310);
    expect(MEDIA_LIBRARY_Z_INDEX).toBeGreaterThan(340);
  });

  it("لا يطلب تأكيدًا عند اختيار الصورة نفسها ويعرض تأكيد المحرر عند استبدالها", () => {
    expect(shouldConfirmMediaReplacement("/manus-storage/current.jpg", "/manus-storage/current.jpg")).toBe(false);
    expect(shouldConfirmMediaReplacement("/manus-storage/current.jpg", "/manus-storage/next.jpg")).toBe(true);
    expect(shouldConfirmMediaReplacement("", "/manus-storage/first.jpg")).toBe(false);
  });

  it("يحافظ على محتوى الغلاف المشترك ويمنع مقاسات سطح المكتب من كسر عنوان الهاتف", () => {
    const desktop = { elementId: "home-cinematic-title", contentText: "عنوان موحّد", fontSize: "6rem", layerX: 90, layerY: 40, layerWidth: 900, layerHeight: 260, layerZIndex: 9, layerOpacity: 44, backgroundSize: 150, backgroundPositionX: 10, backgroundPositionY: 90 };
    const mobile = resolveHeroOverrideForPreview(new Map([[desktop.elementId, desktop as never]]), "home-mobile-title") as typeof desktop;
    expect(mobile.contentText).toBe("عنوان موحّد");
    expect(mobile.fontSize).toBeNull();
    expect(mobile.layerX).toBe(0);
    expect(mobile.layerWidth).toBeNull();
    expect(mobile.layerOpacity).toBe(100);
  });

  it("يمسح معاينات المسودة المتزامنة عند استعادة الأصل", () => {
    const local = {
      "/::home-cinematic-title": { elementId: "home-cinematic-title", contentText: "نص تجريبي" },
      "/::home-mobile-title": { elementId: "home-mobile-title", contentText: "نص تجريبي" },
      "/::home-hero-description": { elementId: "home-hero-description", contentText: "وصف مستقل" },
    } as never;
    const cleared = clearLocalPreviewAfterReset(local, "/", "home-cinematic-title") as Record<string, { contentText: string }>;
    expect(cleared["/::home-cinematic-title"]).toBeUndefined();
    expect(cleared["/::home-mobile-title"]).toBeUndefined();
    expect(cleared["/::home-hero-description"].contentText).toBe("وصف مستقل");
  });

  it("يميز طبقات غلاف الصفحة الأساسية لعرض تحذير حذف أقوى", () => {
    expect(isCoreBackgroundLayer("home-mobile-hero-image")).toBe(true);
    expect(isCoreBackgroundLayer("home-cinematic-hero-image")).toBe(true);
    expect(isCoreBackgroundLayer("home-hero-title")).toBe(false);
  });

  it("يقبل أسماء أيقونات المحرر المعتمدة ويعود إلى الأيقونة الافتراضية عند الاسم غير المدعوم", () => {
    expect(resolveVisualIconName("share")).toBe("share");
    expect(resolveVisualIconName("  Instagram  ")).toBe("instagram");
    expect(resolveVisualIconName("login")).toBe("login");
    expect(resolveVisualIconName("logout")).toBe("logout");
    expect(resolveVisualIconName("رمز-غير-معروف", "star")).toBe("star");
  });

  it("يطبق لون النص المخصص بدقة وشفافية عبر المتغيرات والأنماط", () => {
    const override = { elementId: "home-hero-title", textColor: "#e5b84f", elementTag: "text" };
    const resolved = resolveHeroOverrideForPreview(new Map([[override.elementId, override as never]]), override.elementId) as typeof override;
    expect(resolved.textColor).toBe("#e5b84f");
  });
});

