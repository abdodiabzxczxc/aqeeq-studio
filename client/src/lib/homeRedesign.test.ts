import { describe, expect, it } from "vitest";
import { shouldShowAdminKeyOnPath, uniqueHomeNavigationPages } from "./homeRedesign";

describe("home redesign navigation", () => {
  it("keeps only one entry for each public destination label", () => {
    expect(uniqueHomeNavigationPages([{ label: "قصتنا", href: "/about" }, { label: "قصتنا", href: "/story" }, { label: "المجلة", href: "/journal" }])).toEqual([{ label: "قصتنا", href: "/about" }, { label: "المجلة", href: "/journal" }]);
  });

  it("shows the administrative key on the home route for the manager", () => {
    expect(shouldShowAdminKeyOnPath(true, "/")).toBe(true);
    expect(shouldShowAdminKeyOnPath(true, "/dashboard")).toBe(true);
    expect(shouldShowAdminKeyOnPath(false, "/dashboard")).toBe(false);
  });

  it("does not reserve the administrative key space in the public journal reader", () => {
    expect(shouldShowAdminKeyOnPath(true, "/journal/issue/issue-20260823-viec")).toBe(false);
    expect(shouldShowAdminKeyOnPath(true, "/journal/issue/issue-20260823-viec?visual=1")).toBe(true);
  });
});
