export const JOURNAL_WATERMARK_POSITIONS = ["center", "top-right", "bottom-left", "bottom-right"] as const;
export type JournalWatermarkPosition = (typeof JOURNAL_WATERMARK_POSITIONS)[number];

export function normalizeJournalWatermark(input: { url?: string | null; scale?: number | null; opacity?: number | null; position?: string | null; tint?: string | null }) {
  const position = JOURNAL_WATERMARK_POSITIONS.includes(input.position as JournalWatermarkPosition) ? input.position as JournalWatermarkPosition : "center";
  const scale = Math.min(90, Math.max(20, Math.round(input.scale ?? 42)));
  const opacity = Math.min(60, Math.max(0, Math.round(input.opacity ?? 12)));
  const tint = /^#[0-9a-fA-F]{6}$/.test(input.tint || "") ? input.tint! : "#d6b96a";
  return { url: input.url || null, scale, opacity, position, tint };
}
