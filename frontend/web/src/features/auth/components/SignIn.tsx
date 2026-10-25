"use client";
import { t } from "@/lib/i18n";

import { useState } from "react";
import { useMocks } from "@/lib/mode";
import { supabaseBrowser } from "@/lib/supabase";
import { safeNextPath } from "@/lib/safe-next";

type Provider = "google" | "github";

const PROVIDERS: { id: Provider; label: string }[] = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
];

const FAILED = t("Sign-in failed. Please try again.");

const buttonClass =
  "inline-flex w-full items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60";

export function SignIn({ next = "/", error }: { next?: string; error?: string | null }) {
  const [pending, setPending] = useState<Provider | null>(null);
  const [failed, setFailed] = useState(Boolean(error));

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
