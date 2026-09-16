import { describe, expect, it } from "vitest";
import {
  getAqeeqStudioTheme,
  getAqeeqThemeLogoFilter,
  isTooDarkForDarkTheme,
  isTooLightForLightTheme,
  resolveThemeSafeTextColor,
} from "./aqeeqStudioTheme";

describe("مظهر استوديو العقيق", () => {
  it("يبدأ بالدارك مود عند غياب إعداد محفوظ", () => {
    expect(getAqeeqStudioTheme()).toBe("dark");
  });

  it("يبقي الشعار بألوانه الأصلية في وايت مود ويحوّله إلى أبيض في دارك مود", () => {
    expect(getAqeeqThemeLogoFilter("light")).toBe("");
    expect(getAqeeqThemeLogoFilter("dark")).toBe("brightness-0 invert");
  });

  it("يحمي النصوص من الاختفاء في الدارك مود عند وجود ألوان داكنة أو سوداء", () => {
    expect(isTooDarkForDarkTheme("#000000")).toBe(true);
    expect(isTooDarkForDarkTheme("rgb(0, 0, 0)")).toBe(true);
    expect(isTooDarkForDarkTheme("#18181b")).toBe(true);
    expect(isTooDarkForDarkTheme("oklch(0.446 0.043 257.281)")).toBe(true);

    // في الدارك مود: اللون الأسود أو الداكن يُلغى ليعود النص لفئات Tailwind الطبيعية (أبيض)
    expect(resolveThemeSafeTextColor("#000000", true)).toBeUndefined();
    expect(resolveThemeSafeTextColor("rgb(0, 0, 0)", true)).toBeUndefined();
    expect(resolveThemeSafeTextColor("oklch(0.446 0.043 257.281)", true)).toBeUndefined();

    // في اللايت مود: اللون الأسود مسموح وواضح
    expect(resolveThemeSafeTextColor("#000000", false)).toBe("#000000");
    expect(resolveThemeSafeTextColor("rgb(0, 0, 0)", false)).toBe("rgb(0, 0, 0)");
  });

  it("يحمي النصوص من الاختفاء في اللايت مود عند وجود ألوان بيضاء أو ساطعة", () => {
    expect(isTooLightForLightTheme("#ffffff")).toBe(true);
    expect(isTooLightForLightTheme("rgb(255, 255, 255)")).toBe(true);
    expect(isTooLightForLightTheme("#f8fafc")).toBe(true);

    // في اللايت مود: اللون الأبيض يُلغى ليعود النص لفئات Tailwind الطبيعية (داكن)
    expect(resolveThemeSafeTextColor("#ffffff", false)).toBeUndefined();
    expect(resolveThemeSafeTextColor("rgb(255, 255, 255)", false)).toBeUndefined();

    // في الدارك مود: اللون الأبيض مسموح وواضح
    expect(resolveThemeSafeTextColor("#ffffff", true)).toBe("#ffffff");
  });

  it("يحافظ على الألوان المميزة (الذهبي، الأحمر، الأخضر) في كلا الوضعين", () => {
    // الذهبي
    expect(resolveThemeSafeTextColor("#f8ca14", true)).toBe("#f8ca14");
    expect(resolveThemeSafeTextColor("#f8ca14", false)).toBe("#f8ca14");

    // أحمر العقيق
    expect(resolveThemeSafeTextColor("#de191e", true)).toBe("#de191e");
    expect(resolveThemeSafeTextColor("#de191e", false)).toBe("#de191e");

    // أخضر
    expect(resolveThemeSafeTextColor("#10b981", true)).toBe("#10b981");
    expect(resolveThemeSafeTextColor("#10b981", false)).toBe("#10b981");
  });
});

