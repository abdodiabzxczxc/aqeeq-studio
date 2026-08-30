export type EditorToolbarSide = "left" | "right";

export function resolveEditorToolbarSide(value: string | null | undefined): EditorToolbarSide {
  return value === "right" ? "right" : "left";
}

export function toggleEditorToolbarSide(side: EditorToolbarSide): EditorToolbarSide {
  return side === "left" ? "right" : "left";
}
