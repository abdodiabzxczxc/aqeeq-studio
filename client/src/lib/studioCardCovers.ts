export function resolveStudioCardCovers<T>(items: readonly T[], getCover: (item: T) => string | null | undefined) {
  const front = items[0] ? getCover(items[0]) || null : null;
  const back = items[1] ? getCover(items[1]) || front : front;
  return { front, back };
}
