import { describe, expect, it } from "vitest";
import { getAqeeqStudioTheme, getAqeeqThemeLogoFilter } from "./aqeeqStudioTheme";

describe("مظهر استوديو العقيق", () => {
  it("يبدأ بالدارك مود عند غياب إعداد محفوظ", () => {
    expect(getAqeeqStudioTheme()).toBe("dark");
  });

  it("يبقي الشعار بألوانه الأصلية في وايت مود ويحوّله إلى أبيض في دارك مود", () => {
    expect(getAqeeqThemeLogoFilter("light")).toBe("");
    expect(getAqeeqThemeLogoFilter("dark")).toBe("brightness-0 invert");
  });
});
