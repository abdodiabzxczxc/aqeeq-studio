import { trpc } from "@/lib/trpc";
import { createContext, useContext } from "react";

export type PublishedHomepageSnapshot = {
  settings: Record<string, string>;
  content: Array<{ key: string; value: string }>;
  overrides: unknown[];
  sections: unknown[];
  pages: Array<{ id: number; slug: string; navLabel: string }>;
};

type PublishedHomepageState = {
  snapshot: PublishedHomepageSnapshot | undefined;
  isReady: boolean;
};

const PublishedHomepageContext = createContext<PublishedHomepageState>({ snapshot: undefined, isReady: false });

const CACHE_KEY = "aqeeq-published-homepage-snapshot";

function getInitialSnapshot(): PublishedHomepageSnapshot | undefined {
  try {
    if (typeof window === "undefined") return undefined;
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

export function PublishedHomepageProvider({ children }: { children: React.ReactNode }) {
  const initial = getInitialSnapshot();
  const query = trpc.homepage.publicSnapshot.useQuery(undefined, {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const snapshot = (query.data as PublishedHomepageSnapshot | undefined) || initial;

  // Persist snapshot to localStorage whenever fresh data arrives
  if (typeof window !== "undefined" && query.data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(query.data));
    } catch {}
  }

  return (
    <PublishedHomepageContext.Provider value={{ snapshot, isReady: Boolean(snapshot) || Boolean(query.error) }}>
      {children}
    </PublishedHomepageContext.Provider>
  );
}

export function usePublishedHomepage() {
  return useContext(PublishedHomepageContext);
}
