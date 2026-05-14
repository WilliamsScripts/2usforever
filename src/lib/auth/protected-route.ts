"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthProvider";

type UseRequireAuthOptions = {
  redirectTo?: string;
  enabled?: boolean;
};

export function useRequireAuth({
  redirectTo = "/timeline/login",
  enabled = true,
}: UseRequireAuthOptions = {}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    if (!enabled || isLoading || isAuthenticated) return;

    const next =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/timeline";

    router.replace(`${redirectTo}?next=${encodeURIComponent(next)}`);
  }, [enabled, isAuthenticated, isLoading, redirectTo, router]);

  return {
    isAuthenticated,
    isLoading,
    isReady: !isLoading,
  };
}

export function useRedirectIfAuthenticated({
  redirectTo = "/timeline",
  enabled = true,
}: {
  redirectTo?: string;
  enabled?: boolean;
} = {}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    if (!enabled || isLoading || !isAuthenticated) return;
    router.replace(redirectTo);
  }, [enabled, isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}
