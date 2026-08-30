import { describe, expect, it } from "vitest";
import { DEFAULT_JOURNAL_SEASON_LABEL, normalizeJournalSeasonLabel } from "./journalSeasonLabel";

describe("normalizeJournalSeasonLabel", () => {
  it("returns the default label when no custom value is provided", () => {
    expect(normalizeJournalSeasonLabel("   ")).toBe(DEFAULT_JOURNAL_SEASON_LABEL);
  });

  it("keeps custom text while normalizing extra spacing", () => {
    expect(normalizeJournalSeasonLabel("  موسم   التميز  ")).toBe("موسم التميز");
  });
});
