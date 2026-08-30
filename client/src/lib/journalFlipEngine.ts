export type FlipDirection = "next" | "previous";

export function getFlipbookTarget(currentPage: number, pageCount: number, direction: FlipDirection) {
  if (pageCount <= 0) return 0;
  const delta = direction === "next" ? 1 : -1;
  return Math.max(0, Math.min(pageCount - 1, currentPage + delta));
}

export function isFlipbookTargetAvailable(currentPage: number, pageCount: number, direction: FlipDirection) {
  return getFlipbookTarget(currentPage, pageCount, direction) !== currentPage;
}
