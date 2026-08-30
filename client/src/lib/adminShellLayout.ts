export type CachedShellUser = { role?: string } | null;

export function shouldReserveAdminLayout({
  isAdmin,
  isAuthLoading,
  cachedUser,
}: {
  isAdmin: boolean;
  isAuthLoading: boolean;
  cachedUser: CachedShellUser;
}) {
  return isAdmin || (isAuthLoading && cachedUser?.role === "admin");
}

export function readCachedShellUser(): CachedShellUser {
  try {
    const raw = window.localStorage.getItem("aqeeq-runtime-user-info") || window.localStorage.getItem("manus-runtime-user-info");
    return raw ? JSON.parse(raw) as CachedShellUser : null;
  } catch {
    return null;
  }
}

