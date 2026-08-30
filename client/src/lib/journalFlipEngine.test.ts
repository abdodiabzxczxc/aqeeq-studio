import { describe, expect, it } from "vitest";
import { getFlipbookTarget, isFlipbookTargetAvailable } from "./journalFlipEngine";

describe("journal paper-turn navigation", () => {
  it("moves a real book one sheet at a time while staying in range", () => {
    expect(getFlipbookTarget(1, 6, "next")).toBe(2);
    expect(getFlipbookTarget(1, 6, "previous")).toBe(0);
    expect(getFlipbookTarget(0, 6, "previous")).toBe(0);
    expect(getFlipbookTarget(5, 6, "next")).toBe(5);
  });

  it("exposes whether a sheet can be turned in the requested direction", () => {
    expect(isFlipbookTargetAvailable(0, 6, "previous")).toBe(false);
    expect(isFlipbookTargetAvailable(0, 6, "next")).toBe(true);
    expect(isFlipbookTargetAvailable(5, 6, "next")).toBe(false);
  });
});
