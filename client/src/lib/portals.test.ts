import { describe, it, expect } from "vitest";
import { DEFAULT_SYSTEM_PORTALS, PORTAL_CATEGORY_LABELS, AVAILABLE_PORTAL_ICONS } from "../../../shared/portals";

describe("System Portals", () => {
  it("has default portals defined", () => {
    expect(DEFAULT_SYSTEM_PORTALS.length).toBeGreaterThan(0);
  });

  it("all portals have valid IDs, titles, URLs, and categories", () => {
    DEFAULT_SYSTEM_PORTALS.forEach((portal) => {
      expect(portal.id).toBeTruthy();
      expect(portal.title).toBeTruthy();
      expect(portal.url).toBeTruthy();
      expect(["parents_students", "staff_admin", "public"]).toContain(portal.category);
      expect(portal.order).toBeGreaterThan(0);
      expect(typeof portal.visible).toBe("boolean");
    });
  });

  it("category labels cover all category keys", () => {
    expect(PORTAL_CATEGORY_LABELS.parents_students).toBeTruthy();
    expect(PORTAL_CATEGORY_LABELS.staff_admin).toBeTruthy();
    expect(PORTAL_CATEGORY_LABELS.public).toBeTruthy();
  });

  it("available icons list has essential icons", () => {
    const iconIds = AVAILABLE_PORTAL_ICONS.map((i) => i.id);
    expect(iconIds).toContain("file-text");
    expect(iconIds).toContain("smartphone");
    expect(iconIds).toContain("briefcase");
    expect(iconIds).toContain("mail");
    expect(iconIds).toContain("cloud");
    expect(iconIds).toContain("ticket");
    expect(iconIds).toContain("video");
    expect(iconIds).toContain("shield");
  });
});
