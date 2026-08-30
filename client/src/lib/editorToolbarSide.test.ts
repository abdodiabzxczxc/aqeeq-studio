import { describe, expect, it } from "vitest";
import { resolveEditorToolbarSide, toggleEditorToolbarSide } from "./editorToolbarSide";

describe("editor toolbar side", () => {
  it("uses the left side by default and only accepts the explicit right preference", () => {
    expect(resolveEditorToolbarSide(null)).toBe("left");
    expect(resolveEditorToolbarSide("unexpected")).toBe("left");
    expect(resolveEditorToolbarSide("right")).toBe("right");
  });

  it("switches the toolbar side in both directions", () => {
    expect(toggleEditorToolbarSide("left")).toBe("right");
    expect(toggleEditorToolbarSide("right")).toBe("left");
  });
});
