import { describe, expect, it } from "vitest";
import { buildEditorPageEntries, filterEditorPageEntries } from "./pageMap";

describe("خريطة صفحات المحرر الكاملة", () => {
  const pages = buildEditorPageEntries(
    [{ id: 7, title: "حفل مدارس العقيق", isActive: true }],
    [{ id: 5, title: "عن الفعالية", slug: "about-event", status: "draft", isVisible: true }],
    [{ id: 12, title: "نشرة الأسبوع الأول", slug: "week-one", issueDate: "2026-08-16", status: "published" }],
  );

  it("تتضمن الصفحة الرئيسية وفصول المدرسة وردهة فعالياتي وتبويبات الإدارة", () => {
    expect(pages.map((page) => page.id)).toEqual(expect.arrayContaining(["home-public", "school-about", "school-life", "lobby", "dashboard", "dashboard-events", "dashboard-platform", "control", "control-identity", "scan"]));
    expect(pages.find((page) => page.id === "school-about")?.path).toBe("/about?visual=1");
  });

  it("ينشئ لكل فعالية مساحة عامة وتبويباتها التشغيلية", () => {
    expect(pages.map((page) => page.id)).toEqual(expect.arrayContaining(["event-7", "event-public-7", "event-stage-7", "event-memory-7", "event-premiere-7", "event-honor-7", "event-portrait-7", "workspace-7-overview", "workspace-7-guests", "workspace-7-invitation", "workspace-7-maison", "workspace-7-operations", "workspace-7-reports", "workspace-7-settings", "workspace-7-invitation-preview", "workspace-7-invitation-png", "workspace-7-invitations-bulk", "workspace-7-qr-cards"]));
    expect(pages.find((page) => page.id === "workspace-7-invitation-png")?.path).toContain("tool=png");
  });

  it("يتضمن استوديو الأنشطة وكل واجهات المجلة وأعدادها وكتيباتها", () => {
    expect(pages.map((page) => page.id)).toEqual(expect.arrayContaining(["live", "live-ideas", "news-manager", "journal-archive", "journal-issue-12", "journal-month-2026-08", "maison-vault"]));
    expect(pages.find((page) => page.id === "journal-issue-12")?.path).toBe("/journal/issue/week-one?visual=1");
  });

  it("يبحث باسم الصفحة أو المسار أو التصنيف", () => {
    expect(filterEditorPageEntries(pages, "العقيق").map((page) => page.id)).toContain("event-7");
    expect(filterEditorPageEntries(pages, "/page/").map((page) => page.id)).toEqual(["page-5"]);
    expect(filterEditorPageEntries(pages, "الموقع العام").map((page) => page.id)).toEqual(expect.arrayContaining(["home-public", "lobby"]));
  });
});
