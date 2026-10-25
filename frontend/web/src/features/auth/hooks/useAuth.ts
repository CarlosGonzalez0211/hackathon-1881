"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthContext } from "@athena/shared";
import { bypassAuth } from "@/lib/mode";
import { supabaseBrowser } from "@/lib/supabase";
import { getAuthClient } from "../api/auth-client";

export type AuthStatus = "loading" | "signedOut" | "ready" | "error";

export interface UseAuth {
  status: AuthStatus;
  user: AuthContext | null;
  signOut(): Promise<void>;
  /** Re-run the load, e.g. after an error. */
  retry(): void;
}

interface State {
  status: AuthStatus;
  user: AuthContext | null;
}

export function useAuth(): UseAuth {
  const [state, setState] = useState<State>({ status: "loading", user: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (bypassAuth) {
      getAuthClient()
        .getCurrentUser()
        .then((user) => !cancelled && setState({ status: "ready", user }))
        .catch(() => !cancelled && setState({ status: "error", user: null }));
      return () => {
        cancelled = true;
      };
    }

    const supabase = supabaseBrowser();

    const load = async (hasSession: boolean) => {
      if (!hasSession) {
        if (!cancelled) setState({ status: "signedOut", user: null });
        return;
      }
      try {
        const user = await getAuthClient().getCurrentUser();
        if (!cancelled) setState({ status: "ready", user });
      } catch {
        if (!cancelled) setState({ status: "error", user: null });
      }
    };

    supabase.auth
      .getSession()
      .then(({ data }) => load(Boolean(data.session)))
      .catch(() => !cancelled && setState({ status: "error", user: null }));

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // Token refreshes keep the same user; skip to avoid refetching /auth/me.
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
      if (!session) {
        setState({ status: "signedOut", user: null });
        return;
      }
      setState((s) => (s.status === "ready" ? s : { status: "loading", user: null }));
      // Defer: calling supabase APIs inside this callback can deadlock.
      setTimeout(() => void load(true), 0);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [attempt]);

  const signOut = useCallback(async () => {
    if (bypassAuth) return;
    await supabaseBrowser().auth.signOut();
    setState({ status: "signedOut", user: null });
  }, []);

  const retry = useCallback(() => {
    setState({ status: "loading", user: null });
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, signOut, retry };
}
