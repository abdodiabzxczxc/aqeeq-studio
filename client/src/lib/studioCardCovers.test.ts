import { describe, expect, it } from "vitest";
import { resolveStudioCardCovers } from "./studioCardCovers";

describe("studio card cover pairs", () => {
  it("uses the newest item for the front frame and the immediately previous item behind it", () => {
    const covers = resolveStudioCardCovers([{ cover: "newest" }, { cover: "previous" }, { cover: "older" }], (item) => item.cover);
    expect(covers).toEqual({ front: "newest", back: "previous" });
  });

  it("falls back to the newest cover when a collection has only one item", () => {
    const covers = resolveStudioCardCovers([{ cover: "only-cover" }], (item) => item.cover);
    expect(covers).toEqual({ front: "only-cover", back: "only-cover" });
  });
});
