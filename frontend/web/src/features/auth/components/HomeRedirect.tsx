"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMocks } from "@/lib/mode";
import { homeFor } from "../home";
import { useAuth } from "../hooks/useAuth";

/**
 * `/` sends each signed-in role to its own page. With mocks on there is no sign-in and the
 * demo lands on the world, as before.
 */
export function HomeRedirect() {
  const router = useRouter();
  const { status, user, retry } = useAuth();

  useEffect(() => {
    if (useMocks) router.replace("/world");
    else if (status === "signedOut") router.replace("/login?next=%2F");
    else if (status === "ready" && user) router.replace(homeFor(user.role));
  }, [router, status, user]);

  if (status === "error" && !useMocks) {
    return (
      <div role="alert" className="p-6">
        <p>No se pudo cargar tu sesión.</p>
        <p className="text-neutral-600">We could not load your session.</p>
        <button
          type="button"
          onClick={retry}
          className="mt-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
        >
          Reintentar / Retry
        </button>
        <p className="mt-3">
          <Link href="/login" className="underline">
            Iniciar sesión / Sign in
          </Link>
        </p>
      </div>
    );
  }
  return (
    <p role="status" aria-live="polite" className="p-6">
      Cargando… <span className="text-neutral-600">Loading…</span>
    </p>
  );
}
