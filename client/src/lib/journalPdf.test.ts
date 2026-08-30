import { getJournalPdfFilename } from "./journalPdf";
import { describe, expect, it } from "vitest";

describe("journal PDF filename", () => {
  it("keeps a readable title and removes invalid filename characters", () => {
    expect(getJournalPdfFilename(' العدد: الأول / 2026 ')).toBe("العدد- الأول - 2026.pdf");
  });

  it("uses an Arabic fallback when the title is empty", () => {
    expect(getJournalPdfFilename("   ")).toBe("مجلة-العقيق.pdf");
  });
});
