import { describe, it, expect } from "vitest";
import { CORE_PAGES_CONFIG } from "@/pages/AqeeqAdminDashboardPage";

describe("Aqeeq Page Management & Navigation Controls", () => {
  it("defines all 9 core official pages in CORE_PAGES_CONFIG", () => {
    expect(CORE_PAGES_CONFIG).toHaveLength(9);
    const keys = CORE_PAGES_CONFIG.map((p) => p.key);
    expect(keys).toEqual([
      "home",
      "about",
      "accreditations",
      "admissions",
      "journal",
      "albums",
      "podcast",
      "articles",
      "showcase",
    ]);
  });

  it("each core page has valid route, defaultLabel, labelKey, and category", () => {
    CORE_PAGES_CONFIG.forEach((page) => {
      expect(page.path).toMatch(/^\/[a-z-]*$/);
      expect(page.defaultLabel.length).toBeGreaterThan(1);
      expect(page.labelKey).toContain("Label");
      expect(page.category.length).toBeGreaterThan(1);
      expect(page.icon).toBeDefined();
    });
  });

  it("handles toggling hiddenNavKeys correctly", () => {
    let hiddenNavKeys: string[] = [];

    const togglePage = (key: string) => {
      if (hiddenNavKeys.includes(key)) {
        hiddenNavKeys = hiddenNavKeys.filter((k) => k !== key);
      } else {
        hiddenNavKeys = [...hiddenNavKeys, key];
      }
    };

    // Hide podcast
    togglePage("podcast");
    expect(hiddenNavKeys).toContain("podcast");
    expect(hiddenNavKeys).toHaveLength(1);

    // Hide albums
    togglePage("albums");
    expect(hiddenNavKeys).toEqual(["podcast", "albums"]);

    // Unhide podcast
    togglePage("podcast");
    expect(hiddenNavKeys).toEqual(["albums"]);

    // Unhide albums
    togglePage("albums");
    expect(hiddenNavKeys).toHaveLength(0);
  });

  it("filters visible vs hidden pages accurately", () => {
    const hiddenNavKeys = ["journal", "podcast"];

    const visiblePages = CORE_PAGES_CONFIG.filter((p) => !hiddenNavKeys.includes(p.key));
    const hiddenPages = CORE_PAGES_CONFIG.filter((p) => hiddenNavKeys.includes(p.key));

    expect(visiblePages).toHaveLength(7);
    expect(hiddenPages).toHaveLength(2);
    expect(hiddenPages.map((p) => p.key)).toEqual(["journal", "podcast"]);
  });

  it("supports dynamic renaming and fallback to default label", () => {
    const navOverrides: Record<string, string> = {
      aboutLabel: "من نحن وتاريخنا",
      admissionsLabel: "التسجيل للعام الجديد",
    };

    const getDisplayLabel = (key: string, labelKey: string, defaultLabel: string) => {
      return navOverrides[labelKey] || defaultLabel;
    };

    expect(getDisplayLabel("about", "aboutLabel", "مدارسنا")).toBe("من نحن وتاريخنا");
    expect(getDisplayLabel("admissions", "admissionsLabel", "القبول والتسجيل")).toBe("التسجيل للعام الجديد");
    expect(getDisplayLabel("home", "homeLabel", "الرئيسية")).toBe("الرئيسية");
  });
});
