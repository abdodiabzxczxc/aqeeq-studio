export const AQEEQ_SORT_OPTIONS = [
  { id: "newest", label: "الأحدث" },
  { id: "oldest", label: "الأقدم" },
  { id: "nameAsc", label: "الاسم: أ–ي" },
  { id: "nameDesc", label: "الاسم: ي–أ" },
  { id: "mostViewed", label: "الأكثر مشاهدة" },
  { id: "leastViewed", label: "الأقل مشاهدة" },
] as const;

export type AqeeqSortOption = (typeof AQEEQ_SORT_OPTIONS)[number]["id"];

export type SearchableAqeeqContent = {
  title?: string | null;
  description?: string | null;
  fileName?: string | null;
  albumDate?: string | null;
  issueDate?: string | null;
  createdAt?: Date | string | null;
  viewCount?: number | null;
};

export function normalizeAqeeqSearchTerm(value?: string | null) {
  return (value || "")
    .toLocaleLowerCase("ar")
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim()
    .replace(/\s+/g, " ");
}

export function matchesAqeeqSearch<T extends SearchableAqeeqContent>(item: T, query: string) {
  const normalizedQuery = normalizeAqeeqSearchTerm(query);
  if (!normalizedQuery) return true;
  const haystack = [item.title, item.description, item.fileName].map(normalizeAqeeqSearchTerm).join(" ");
  return haystack.includes(normalizedQuery);
}

function contentDate(item: SearchableAqeeqContent) {
  const raw = item.albumDate || item.issueDate || item.createdAt;
  const date = raw instanceof Date ? raw : raw ? new Date(raw) : new Date(0);
  const timestamp = date.getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function contentTitle(item: SearchableAqeeqContent) {
  return normalizeAqeeqSearchTerm(item.title || item.fileName || "");
}

export function sortAqeeqContent<T extends SearchableAqeeqContent>(items: T[], sort: AqeeqSortOption) {
  return [...items].sort((left, right) => {
    if (sort === "oldest") return contentDate(left) - contentDate(right) || contentTitle(left).localeCompare(contentTitle(right), "ar");
    if (sort === "nameAsc") return contentTitle(left).localeCompare(contentTitle(right), "ar");
    if (sort === "nameDesc") return contentTitle(right).localeCompare(contentTitle(left), "ar");
    if (sort === "mostViewed") return Number(right.viewCount || 0) - Number(left.viewCount || 0) || contentDate(right) - contentDate(left);
    if (sort === "leastViewed") return Number(left.viewCount || 0) - Number(right.viewCount || 0) || contentDate(right) - contentDate(left);
    return contentDate(right) - contentDate(left) || contentTitle(left).localeCompare(contentTitle(right), "ar");
  });
}

export function searchAndSortAqeeqContent<T extends SearchableAqeeqContent>(items: T[], query: string, sort: AqeeqSortOption) {
  return sortAqeeqContent(items.filter((item) => matchesAqeeqSearch(item, query)), sort);
}
