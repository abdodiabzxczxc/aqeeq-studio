export const LAYER_GRID_SIZE = 8;

export function snapToLayerGrid(value: number, gridSize = LAYER_GRID_SIZE) {
  return Math.round(value / gridSize) * gridSize;
}
