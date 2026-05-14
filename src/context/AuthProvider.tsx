"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { AuthSession, AuthUser } from "@/types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOutLocal: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(user: Session["user"] | null): AuthUser | null {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
  };
}

function toAuthSession(session: Session | null): AuthSession | null {
  if (!session?.user) return null;

  return {
    access_token: session.access_token,
    expires_at: session.expires_at,
    user: toAuthUser(session.user)!,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    let isMounted = true;

    const applySession = (nextSession: Session | null) => {
      if (!isMounted) return;

      const authSession = toAuthSession(nextSession);
      setSession(authSession);
      setStatus(authSession ? "authenticated" : "unauthenticated");
    };

    supabase.auth.getSession().then(({ data }) => {
      applySession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, nextSession) => {
        applySession(nextSession);
      },
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOutLocal = useCallback(() => {
    setSession(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      session,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      signOutLocal,
    }),
    [session, signOutLocal, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
}
