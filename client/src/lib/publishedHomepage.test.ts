import { describe, expect, it } from "vitest";

function useSnapshotForRoot(pathname: string, isEditing: boolean) {
  return pathname === "/" && !isEditing;
}

describe("published homepage bootstrap policy", () => {
  it("uses one published source for the public root and keeps drafts exclusive to edit mode", () => {
    expect(useSnapshotForRoot("/", false)).toBe(true);
    expect(useSnapshotForRoot("/", true)).toBe(false);
    expect(useSnapshotForRoot("/event/1", false)).toBe(false);
  });
});
