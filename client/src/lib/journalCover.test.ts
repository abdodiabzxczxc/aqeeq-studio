import { describe, expect, it } from "vitest";
import { normalizeJournalCoverScale } from "./journalCover";

describe("journal cover scale", () => {
  it("keeps the editable cover scale within the safe visual range", () => {
    expect(normalizeJournalCoverScale("1.12")).toBe(1.12);
    expect(normalizeJournalCoverScale("4")).toBe(1.22);
    expect(normalizeJournalCoverScale("0.2")).toBe(0.78);
    expect(normalizeJournalCoverScale("not-a-number")).toBe(1);
  });
});
