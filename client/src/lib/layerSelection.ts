export type LayerSelectionRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export function selectionFrameFromPoints(startX: number, startY: number, endX: number, endY: number): LayerSelectionRect {
  return {
    left: Math.min(startX, endX),
    top: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
  };
}

export function layerIntersectsSelection(layer: LayerSelectionRect, selection: LayerSelectionRect) {
  return layer.left < selection.left + selection.width
    && layer.left + layer.width > selection.left
    && layer.top < selection.top + selection.height
    && layer.top + layer.height > selection.top;
}
