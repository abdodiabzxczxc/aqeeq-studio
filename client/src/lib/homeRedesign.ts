export type HomeNavigationPage = { label: string };

export function uniqueHomeNavigationPages<T extends HomeNavigationPage>(pages: readonly T[]) {
  const seen = new Set<string>();
  return pages.filter((page) => {
    const key = page.label.trim().toLocaleLowerCase("ar-EG");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function shouldShowAdminKeyOnPath(isAdmin: boolean, pathname: string) {
  const [path, query = ""] = pathname.split("?");
  const isPublicJournalReader = /^\/journal\/issue\/.+/.test(path) && !new URLSearchParams(query).has("visual");
  return isAdmin && !isPublicJournalReader;
}
