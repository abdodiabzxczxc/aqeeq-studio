import { describe, expect, it } from "vitest";
import { getSwipePageTarget } from "./journalInteraction";

describe("journal hand swipe", () => {
  it("moves to the next page with a light left swipe", () => {
    expect(getSwipePageTarget(1, 5, -30)).toBe(2);
  });

  it("moves to the previous page with a light right swipe", () => {
    expect(getSwipePageTarget(2, 5, 30)).toBe(1);
  });

  it("keeps the page for a small accidental drag and stays within bounds", () => {
    expect(getSwipePageTarget(2, 5, 20)).toBe(2);
    expect(getSwipePageTarget(0, 5, 80)).toBe(0);
    expect(getSwipePageTarget(4, 5, -80)).toBe(4);
  });
});
