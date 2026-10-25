"use client";
import { t } from "@/lib/i18n";

import { useRouter } from "next/navigation";
import { useMocks } from "@/lib/mode";
import { useAuth } from "../hooks/useAuth";

export function SignOutButton({ className }: { className?: string }) {
  const { signOut, status } = useAuth();
  const router = useRouter();

  if (useMocks || status !== "ready") return null;

  return (
    <button
      type="button"
      className={
        className ??
        "rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      }
      onClick={async () => {
        await signOut();
        router.push("/login");
      }}
    >
      {t("Sign out")}
    </button>
  );
}
