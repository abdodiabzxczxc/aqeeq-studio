export function normalizeJournalCoverScale(raw?: string | null) {
  const value = Number(raw ?? "1");
  return Number.isFinite(value) ? Math.min(1.22, Math.max(0.78, value)) : 1;
}
