"use client";
import { useRouter } from "next/navigation";
import type { ClassOrbitStudent } from "@athena/shared";
import { useMemo } from "react";
import { localizeContent, t } from "@/lib/i18n";
import { Planet } from "./Planet";
import { usePlanetArrival } from "./use-planet-arrival";

/**
 * A classmate's world, walkable and read-only: no house opens and nothing is recorded. Entered
 * and left through the same orbit shot as the student's own world.
 */
export function VisitExplorer({
  student,
  orbitHref,
}: {
  student: ClassOrbitStudent;
  orbitHref: string;
}) {
  const router = useRouter();
  const { overview, setOverview, leaving, onReady, leave } = usePlanetArrival();
  // Demo house titles follow the app language, as in the student's own world.
  const planet = useMemo(() => localizeContent(student.planet), [student.planet]);
  return (
    <main
      className={`world-app is-visit${overview ? " is-overview" : ""}${leaving ? " is-leaving" : ""}`}
    >
      <Planet
        state={planet}
        mode="surface"
        overview={overview}
        onOverviewChange={setOverview}
        paused={leaving}
        onReady={onReady}
        leaving={leaving}
        onLeft={() => router.push(orbitHref)}
      />
      <div className="orbit-visit-bar" role="status">
        <span>{t("Visiting {0}’s world", { 0: student.displayName })}</span>
        <button
          onClick={() => {
            router.prefetch(orbitHref);
            leave();
          }}
        >
          {t("Back to class")}
        </button>
      </div>
    </main>
  );
}
