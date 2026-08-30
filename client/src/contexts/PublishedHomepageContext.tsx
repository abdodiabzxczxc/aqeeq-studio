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

export function PublishedHomepageProvider({ children }: { children: React.ReactNode }) {
  const query = trpc.homepage.publicSnapshot.useQuery(undefined, {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
  const snapshot = query.data as PublishedHomepageSnapshot | undefined;
  return <PublishedHomepageContext.Provider value={{ snapshot, isReady: Boolean(snapshot) || Boolean(query.error) }}>{children}</PublishedHomepageContext.Provider>;
}

export function usePublishedHomepage() {
  return useContext(PublishedHomepageContext);
}
