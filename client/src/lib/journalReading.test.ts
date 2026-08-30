import { describe, expect, it } from "vitest";
import { JOURNAL_READING_OPTIONS, normalizeJournalReadingMode } from "./journalReading";

describe("journal reading modes", () => {
  it("keeps supported modes and safely moves legacy page browsing to the flipbook", () => {
    expect(normalizeJournalReadingMode("spread")).toBe("spread");
    expect(normalizeJournalReadingMode("scroll")).toBe("scroll");
    expect(normalizeJournalReadingMode("pages")).toBe("spread");
    expect(normalizeJournalReadingMode("unknown")).toBe("spread");
    expect(normalizeJournalReadingMode()).toBe("spread");
  });

  it("exposes every reading mode for the studio and the public reader selector", () => {
    expect(JOURNAL_READING_OPTIONS.map((option) => option.id)).toEqual(["spread", "scroll"]);
    expect(JOURNAL_READING_OPTIONS.map((option) => option.title)).toEqual(["كتاب متقلب", "قراءة رأسية"]);
  });
});
