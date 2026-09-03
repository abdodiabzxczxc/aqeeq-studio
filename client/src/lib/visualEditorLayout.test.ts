import { describe, expect, it } from "vitest";
import { isAqeeqStudioVisualPath, shouldOpenVisualEditorFromLocation, visualImageWrapperClassName } from "./visualEditorLayout";

describe("visual editor studio routing and image layout", () => {
  it("opens edit mode only when visual=1 is explicitly requested", () => {
    expect(shouldOpenVisualEditorFromLocation("/studio?visual=1")).toBe(true);
    expect(shouldOpenVisualEditorFromLocation("/studio", "?visual=1")).toBe(true);
    expect(shouldOpenVisualEditorFromLocation("/studio?tab=archive")).toBe(false);
  });

  it("keeps image editor wrappers sized to their full card container", () => {
    const classes = visualImageWrapperClassName("absolute inset-0 h-full w-full object-cover", false);
    expect(classes).toContain("block");
    expect(classes).toContain("h-full");
    expect(classes).toContain("w-full");
    expect(classes).not.toContain("inline-block");
  });

  it("retains clipping for normal editorial images without changing brand marks", () => {
    expect(visualImageWrapperClassName("h-full w-full object-cover", false)).toContain("overflow-hidden");
    expect(visualImageWrapperClassName("h-full w-full object-contain", true)).not.toContain("overflow-hidden");
  });

  it("recognizes every public studio archive and reader route", () => {
    expect([
      "/",
      "/studio",
      "/journal",
      "/journal/issue/weekly-2026",
      "/journal/month/2026-08",
      "/journal/archive",
      "/news/manage",
      "/albums",
      "/albums/graduation-2026",
      "/albums/manage",
      "/offers",
      "/offers/manage",
      "/showcase",
      "/articles",
      "/articles/my-slug",
      "/articles/manage",
      "/atheer",
      "/atheer/manage",
      "/podcast",
      "/podcast/manage",
      "/about",
      "/admissions",
      "/accreditations",
    ].every(isAqeeqStudioVisualPath)).toBe(true);
    expect(isAqeeqStudioVisualPath("/unknown-random-path")).toBe(false);
  });
});
