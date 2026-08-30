import { snapToLayerGrid } from "./layerGrid";

export type HorizontalLayerAlign = "left" | "center" | "right";
export type VerticalLayerAlign = "top" | "middle" | "bottom";

export type LayerSpacingItem = {
  id: string;
  start: number;
  size: number;
  offset: number;
};

export function alignedLayerX(input: { currentX: number; currentLeft: number; width: number; target: number; mode: HorizontalLayerAlign }) {
  const desiredLeft = input.mode === "left" ? input.target : input.mode === "right" ? input.target - input.width : input.target - input.width / 2;
  return snapToLayerGrid(input.currentX + desiredLeft - input.currentLeft);
}

export function alignedLayerY(input: { currentY: number; currentTop: number; height: number; target: number; mode: VerticalLayerAlign }) {
  const desiredTop = input.mode === "top" ? input.target : input.mode === "bottom" ? input.target - input.height : input.target - input.height / 2;
  return snapToLayerGrid(input.currentY + desiredTop - input.currentTop);
}

/**
 * تُبقي الطبقتين الطرفيتين في مكانهما، ثم تحسب مواضع الطبقات الوسطى
 * بحيث تكون الفراغات الفعلية بين حواف جميع الطبقات متساوية.
 */
export function distributeLayerSpacing(layers: readonly LayerSpacingItem[]) {
  if (layers.length < 3) return new Map<string, number>();

  const ordered = [...layers].sort((first, second) => first.start - second.start);
  const first = ordered[0]!;
  const last = ordered[ordered.length - 1]!;
  const internalSize = ordered.slice(1, -1).reduce((total, layer) => total + layer.size, 0);
  const totalGap = last.start - (first.start + first.size) - internalSize;
  const gap = totalGap / (ordered.length - 1);
  const offsets = new Map<string, number>();
  let nextStart = first.start + first.size + gap;

  ordered.slice(1, -1).forEach((layer) => {
    offsets.set(layer.id, Math.round(layer.offset + nextStart - layer.start));
    nextStart += layer.size + gap;
  });

  return offsets;
}
