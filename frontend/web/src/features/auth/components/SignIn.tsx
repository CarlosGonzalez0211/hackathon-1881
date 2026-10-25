"use client";
import { t } from "@/lib/i18n";

import { useState, type FormEvent } from "react";
import { useMocks } from "@/lib/mode";
import { supabaseBrowser } from "@/lib/supabase";
import { safeNextPath } from "@/lib/safe-next";

type Provider = "google" | "github";

const PROVIDERS: { id: Provider; label: string }[] = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
];

const FAILED = t("Sign-in failed. Please try again.");

const inputClass =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

const buttonClass =
  "inline-flex w-full items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60";

export function SignIn({ next = "/", error }: { next?: string; error?: string | null }) {
  const [pending, setPending] = useState<Provider | "password" | null>(null);
  const [failed, setFailed] = useState(Boolean(error));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /** Email + password accounts (e.g. the seeded demo professor and student). */
  async function signInWithPassword(event: FormEvent) {
    event.preventDefault();
    setFailed(false);
    setPending("password");
    try {
      const { error: err } = await supabaseBrowser().auth.signInWithPassword({ email, password });
      if (err) throw err;
      window.location.assign(safeNextPath(next));
    } catch {
      setPending(null);
      setFailed(true);
    }
  }

  async function signIn(provider: Provider) {
    setFailed(false);
    setPending(provider);
    const target = encodeURIComponent(safeNextPath(next));
    try {
      const { error: err } = await supabaseBrowser().auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${target}` },
      });
      if (err) throw err;
    } catch {
      setPending(null);
      setFailed(true);
    }
  }

  if (useMocks) {
    return (
      <div role="status" className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm">
        <p className="font-medium">{t("Demo mode: no sign-in required")}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div>
        <h1 className="text-xl font-semibold">{t("Sign in")}</h1>
      </div>
      <form onSubmit={signInWithPassword} className="flex flex-col gap-2">
        <label htmlFor="signin-email" className="text-sm font-medium">
          {t("Email")}
        </label>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
        />
        <label htmlFor="signin-password" className="text-sm font-medium">
          {t("Password")}
        </label>
        <input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
        />
        <button type="submit" className={buttonClass} disabled={pending !== null}>
          {pending === "password" ? t("Signing in…") : t("Sign in with email")}
        </button>
      </form>
      <p className="text-center text-xs text-neutral-500">{t("or")}</p>
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          className={buttonClass}
          disabled={pending !== null}
          onClick={() => void signIn(p.id)}
        >
          {pending === p.id ? t("Redirecting…") : t("Continue with {0}", { 0: p.label })}
        </button>
      ))}
      <div aria-live="polite" role="status" className="min-h-10 text-sm text-red-700">
        {failed ? (
          <>
            <p>{FAILED}</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
