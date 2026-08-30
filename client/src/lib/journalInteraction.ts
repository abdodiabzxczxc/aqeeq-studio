export function getSwipePageTarget(page: number, pageCount: number, deltaX: number, threshold = 28) {
  if (Math.abs(deltaX) < threshold) return page;
  if (deltaX < 0) return Math.min(page + 1, pageCount - 1);
  return Math.max(page - 1, 0);
}
