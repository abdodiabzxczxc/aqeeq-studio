import { describe, expect, it } from "vitest";
import { getJournalIssuePath, getJournalIssueShareUrl, getJournalMonthPath, JOURNAL_ROUTES } from "./journalRoutes";

describe("public journal routes", () => {
  it("keeps the archive on a public standalone path", () => {
    expect(JOURNAL_ROUTES.archive).toBe("/journal");
  });

  it("creates a direct link for every issue without site navigation", () => {
    expect(getJournalIssuePath("issue-20260816-3qbt")).toBe("/journal/issue/issue-20260816-3qbt");
  });

  it("creates a canonical public share link that cannot inherit studio or visual query parameters", () => {
    expect(getJournalIssueShareUrl("https://alaqeeqgrad-huyez6kn.manus.space", "issue-20260816-3qbt")).toBe("https://alaqeeqgrad-huyez6kn.manus.space/journal/issue/issue-20260816-3qbt");
  });

  it("replaces an internal preview origin with the published journal domain", () => {
    expect(getJournalIssueShareUrl("https://3000-preview.manus.computer", "issue-20260816-3qbt")).toBe("https://alaqeeqgrad-huyez6kn.manus.space/journal/issue/issue-20260816-3qbt");
  });

  it("encodes a monthly booklet key in the standalone route", () => {
    expect(getJournalMonthPath("2026-08")).toBe("/journal/month/2026-08");
  });
});
