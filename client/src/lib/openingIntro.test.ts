import { describe, expect, it } from "vitest";
import { AQ_OPENING_LABEL, AQ_OPENING_LOGO } from "./openingIntro";

describe("Alaqeeq opening intro", () => {
  it("uses a stable public brand asset while the published page is preparing", () => {
    expect(AQ_OPENING_LOGO).toContain("/manus-storage/");
    expect(AQ_OPENING_LABEL).toBe("مدارس العقيق");
  });
});
