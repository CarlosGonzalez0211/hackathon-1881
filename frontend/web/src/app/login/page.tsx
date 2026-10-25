"use client";
import { t } from "@/lib/i18n";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SignIn } from "@/features/auth";
import { safeNextPath } from "@/lib/safe-next";

function LoginContent() {
  const params = useSearchParams();
  return <SignIn next={safeNextPath(params.get("next"))} error={params.get("error")} />;
}

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <Suspense fallback={<p role="status">{t("Loading…")}</p>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
