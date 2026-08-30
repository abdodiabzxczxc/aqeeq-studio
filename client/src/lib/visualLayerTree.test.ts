import { describe, expect, it } from "vitest";
import { orderVisualLayerTree } from "./visualLayerTree";

describe("visual layer tree", () => {
  it("orders each page from parent section to nested element", () => {
    const ordered = orderVisualLayerTree([
      { id: "title", parentId: "hero" },
      { id: "page" },
      { id: "hero", parentId: "page" },
      { id: "cta", parentId: "hero" },
    ]);
    expect(ordered.map(({ id, depth }) => [id, depth])).toEqual([["page", 0], ["hero", 1], ["title", 2], ["cta", 2]]);
  });

  it("promotes an orphaned layer without losing it", () => {
    expect(orderVisualLayerTree([{ id: "orphan", parentId: "missing" }]).map(({ id, depth }) => [id, depth])).toEqual([["orphan", 0]]);
  });
});
