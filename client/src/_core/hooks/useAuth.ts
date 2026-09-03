import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      utils.auth.me.setData(undefined, data.user as any);
      if (data.token) {
        try {
          sessionStorage.setItem("app_session_id", data.token);
        } catch {}
      }
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const login = useCallback(
    async (credentials: { username: string; password: string }) => {
      const result = await loginMutation.mutateAsync(credentials);
      await utils.auth.me.refetch();
      return result;
    },
    [loginMutation, utils]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      try {
        sessionStorage.removeItem("app_session_id");
      } catch {}
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  useEffect(() => {

    if (meQuery.data) {
      try {
        localStorage.setItem("aqeeq-runtime-user-info", JSON.stringify(meQuery.data));
      } catch {}
    } else if (meQuery.isSuccess && !meQuery.data) {
      try {
        localStorage.removeItem("aqeeq-runtime-user-info");
      } catch {}
    }
  }, [meQuery.data, meQuery.isSuccess]);

  const cachedUser = useMemo(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("aqeeq-runtime-user-info") : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const currentUser = meQuery.data !== undefined ? meQuery.data : cachedUser;

  const state = useMemo(() => {
    return {
      user: currentUser ?? null,
      loading: (meQuery.isLoading && !cachedUser) || loginMutation.isPending || logoutMutation.isPending,
      error: meQuery.error ?? loginMutation.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(currentUser),
    };
  }, [
    currentUser,
    cachedUser,
    meQuery.error,
    meQuery.isLoading,
    loginMutation.error,
    loginMutation.isPending,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || loginMutation.isPending || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    loginMutation.isPending,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    login,
    logout,
  };
}
