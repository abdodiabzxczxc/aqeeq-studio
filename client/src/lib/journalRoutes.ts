export const JOURNAL_ROUTES = {
  archive: "/journal",
  issuePattern: "/journal/issue/:slug",
  monthPattern: "/journal/month/:monthKey",
} as const;

const PUBLISHED_JOURNAL_ORIGIN = "https://alaqeeqgrad-huyez6kn.manus.space";

export function getJournalIssuePath(slug: string) {
  return `/journal/issue/${encodeURIComponent(slug)}`;
}

export function getJournalIssueShareUrl(origin: string, slug: string) {
  const shareOrigin = origin.includes(".manus.computer") ? PUBLISHED_JOURNAL_ORIGIN : origin;
  return new URL(getJournalIssuePath(slug), shareOrigin).toString();
}

export function getJournalMonthPath(monthKey: string) {
  return `/journal/month/${encodeURIComponent(monthKey)}`;
}
