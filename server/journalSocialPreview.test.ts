import { describe, expect, it } from "vitest";
import { createJournalSocialPreviewHtml, isJournalSocialCrawler } from "./journalSocialPreview";

describe("journal social previews", () => {
  it("creates issue-specific Open Graph metadata with the cover image", () => {
    const html = createJournalSocialPreviewHtml({ title: "النشرة الأسبوعية", slug: "issue-20260823-viec", issueDate: "2026-08-23", seasonLabel: "الأسبوع الأول", coverUrl: "/covers/weekly.png" }, "https://alaqeeqgrad-huyez6kn.manus.space");

    expect(html).toContain('property="og:title" content="النشرة الأسبوعية"');
    expect(html).toContain('property="og:image" content="https://alaqeeqgrad-huyez6kn.manus.space/covers/weekly.png"');
    expect(html).toContain('property="og:url" content="https://alaqeeqgrad-huyez6kn.manus.space/journal/issue/issue-20260823-viec"');
  });

  it("recognizes common sharing crawlers while ignoring regular browsers", () => {
    expect(isJournalSocialCrawler("WhatsApp/2.24")) .toBe(true);
    expect(isJournalSocialCrawler("facebookexternalhit/1.1")) .toBe(true);
    expect(isJournalSocialCrawler("Mozilla/5.0")) .toBe(false);
  });
});
