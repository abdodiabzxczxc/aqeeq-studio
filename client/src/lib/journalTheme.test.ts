import { describe, expect, it } from "vitest";
import { toggleJournalReaderTheme } from "./journalTheme";

describe("مبدّل مظهر قارئ المجلة", () => {
  it("ينتقل من الداكن إلى الأبيض", () => {
    expect(toggleJournalReaderTheme("dark")).toBe("light");
  });

  it("يعيد الأبيض إلى الداكن", () => {
    expect(toggleJournalReaderTheme("light")).toBe("dark");
  });
});
