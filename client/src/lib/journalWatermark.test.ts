import { describe, expect, it } from "vitest";
import { normalizeJournalWatermark } from "./journalWatermark";

describe("journal watermark settings", () => {
  it("uses a clean, bounded dark-reader watermark configuration", () => {
    expect(normalizeJournalWatermark({ scale: 120, opacity: -4, position: "outside", tint: "orange" })).toEqual({ url: null, scale: 90, opacity: 0, position: "center", tint: "#d6b96a" });
  });

  it("preserves a valid watermark identity and editor controls", () => {
    expect(normalizeJournalWatermark({ url: "https://cdn.example.com/logo.png", scale: 55, opacity: 18, position: "bottom-right", tint: "#1a4f8b" })).toEqual({ url: "https://cdn.example.com/logo.png", scale: 55, opacity: 18, position: "bottom-right", tint: "#1a4f8b" });
  });
});
