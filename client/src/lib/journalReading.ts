export const JOURNAL_READING_MODES = ["spread", "scroll"] as const;
export type JournalReadingMode = (typeof JOURNAL_READING_MODES)[number];

export const JOURNAL_READING_OPTIONS: Array<{ id: JournalReadingMode; title: string; description: string }> = [
  { id: "spread", title: "كتاب متقلب", description: "صفحتان متقابلتان وتقليب بسحب اللمس أو الأسهم؛ مناسب للعرض والمشاركة." },
  { id: "scroll", title: "قراءة رأسية", description: "تمرير متصل لقراءة العدد كاملاً، مناسب للهاتف." },
];

export function normalizeJournalReadingMode(value?: string | null): JournalReadingMode {
  return value === "scroll" ? "scroll" : "spread";
}
