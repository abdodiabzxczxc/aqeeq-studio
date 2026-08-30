export type JournalReaderTheme = "dark" | "light";

export function toggleJournalReaderTheme(theme: JournalReaderTheme): JournalReaderTheme {
  return theme === "dark" ? "light" : "dark";
}
