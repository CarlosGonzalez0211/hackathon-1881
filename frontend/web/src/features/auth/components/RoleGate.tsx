"use client";
import { t } from "@/lib/i18n";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AuthContext } from "@athena/shared";
import { useAuth } from "../hooks/useAuth";

type Role = AuthContext["role"];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export function RoleGate({
  allow,
  children,
  fallback,
}: {
  allow: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { status, user, retry } = useAuth();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <p role="status" aria-live="polite">
        {t("Loading…")}
      </p>
    );
  }

  if (status === "signedOut") {
    return (
      <p>
        <Link
          href={`/login?next=${encodeURIComponent(pathname || "/")}`}
          className={`underline ${focusRing}`}
        >
          {t("Sign in to continue")}
        </Link>{" "}
      </p>
    );
  }

  if (status === "error" || !user) {
    return (
      <div role="alert">
        <p>{t("We could not load your session.")}</p>
        <button
          type="button"
          onClick={retry}
          className={`mt-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm ${focusRing}`}
        >
          {t("Retry")}
        </button>
      </div>
    );
  }

  if (user.role === "admin" || allow.includes(user.role)) return <>{children}</>;

  return (
    fallback ?? (
      <div role="alert">
        <p className="font-medium">{t("You do not have access to this page.")}</p>
      </div>
    )
  );
}
