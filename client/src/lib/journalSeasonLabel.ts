export const DEFAULT_JOURNAL_SEASON_LABEL = "موسم العقيق 2026";

export function normalizeJournalSeasonLabel(value?: string | null) {
  const normalized = String(value || "").trim().replace(/\s+/g, " ");
  return normalized || DEFAULT_JOURNAL_SEASON_LABEL;
}
