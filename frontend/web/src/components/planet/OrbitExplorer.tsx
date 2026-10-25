"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { ClassOrbit, ClassOrbitStudent, PlanetState } from "@athena/shared";
import type { EngineStats } from "@athena/engine3d";
import { OrbitCanvas, Planet } from "./Planet";
import { VisitPlanetDialog } from "./VisitPlanetDialog";
import { WorldSketchIcon } from "@/features/world/components/WorldSketchIcon";
import { useOutsideDismiss } from "@/components/ui/useOutsideDismiss";
import { t } from "@/lib/i18n";

/**
 * Class orbit: one planet per enrolled student. The signed-in student's planet leads back to
 * their world; any classmate's planet offers a visit, which flies the camera to it.
 */
export function OrbitExplorer({
  orbit,
  viewerStudentId,
}: {
  orbit: ClassOrbit;
  viewerStudentId: string;
}) {
  const router = useRouter();
  const [list, setList] = useState(false);
  const directory = useRef<HTMLDivElement>(null);
  const directoryButton = useRef<HTMLButtonElement>(null);
  const dialogTrigger = useRef<HTMLElement | null>(null);
  useOutsideDismiss(directory, list, () => setList(false));
  const [invite, setInvite] = useState<ClassOrbitStudent | null>(null);
  const [visiting, setVisiting] = useState<ClassOrbitStudent | null>(null);
  const [stats, setStats] = useState<EngineStats | null>(null);
  const states = useMemo(() => orbit.students.map((student) => student.planet), [orbit]);
  const byId = useMemo(
    () => new Map(orbit.students.map((student) => [student.studentId, student])),
    [orbit],
  );
  const open = (planet: PlanetState) => {
    if (planet.studentId === viewerStudentId) {
      router.push("/world");
      return;
    }
    const active = document.activeElement;
    dialogTrigger.current =
      active instanceof HTMLElement && !active.closest("#orbit-list")
        ? active
        : directoryButton.current;
    const student = byId.get(planet.studentId);
    if (student) setInvite(student);
  };
  // The roster list puts the signed-in student first.
  const roster = [...orbit.students].sort(
    (a, b) => Number(b.studentId === viewerStudentId) - Number(a.studentId === viewerStudentId),
  );
  return (
    <main className="world-app orbital-app">
      <OrbitCanvas
        states={states}
        onPlanetClick={open}
        onStats={setStats}
        focus={visiting?.studentId ?? null}
      >
        {orbit.students.map((student) => (
          <Planet
            key={student.studentId}
            state={student.planet}
            mode="orbit"
            label={student.displayName}
            own={student.studentId === viewerStudentId}
            onPlanetClick={open}
          />
        ))}
      </OrbitCanvas>
      <nav className="world-controls orbit-controls" aria-label={t("Orbit controls")}>
        <Link href="/world" className="orbit-home-link">
          <WorldSketchIcon kind="globe" />
          <span>{t("Back to my world")}</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </nav>
      <div ref={directory}>
        <aside
          id="orbit-list"
          hidden={!list}
          className="orbit-list"
          aria-label={t("Accessible planet directory")}
        >
          <h2>{t("Your classmates")}</h2>
          {roster.map((student) => (
            <button
              key={student.studentId}
              onClick={() => {
                setList(false);
                open(student.planet);
              }}
              className={student.studentId === viewerStudentId ? "is-own" : undefined}
            >
              <span>{student.displayName}</span>
              {student.studentId === viewerStudentId && <small>{t("Your world")}</small>}
            </button>
          ))}
        </aside>
        <button
          ref={directoryButton}
          className="orbit-roster-toggle"
          onClick={() => setList(!list)}
          aria-expanded={list}
          aria-controls="orbit-list"
        >
          <WorldSketchIcon kind="book" />
          {t("Class directory")}
        </button>
      </div>
      {visiting && (
        <div className="orbit-visit-bar" role="status">
          <span>
            {t("Visiting")} <strong>{visiting.displayName}</strong>
          </span>
          <button onClick={() => setVisiting(null)}>{t("Back to class")}</button>
        </div>
      )}
      {invite && (
        <VisitPlanetDialog
          student={invite}
          onVisit={() => setVisiting(invite)}
          onClose={() => {
            setInvite(null);
            dialogTrigger.current?.focus({ preventScroll: true });
          }}
        />
      )}
      <footer className="world-footer">
        <p>
          {orbit.students.length === 1
            ? t("1 planet")
            : t("{0} planets", { 0: orbit.students.length })}{" "}
          {t("· learning together")}
        </p>
        <span className="runtime-note">
          {stats
            ? `${Math.round(stats.fps)} fps · ${stats.drawCalls} draw calls`
            : t("Loading shared resources")}
        </span>
      </footer>
    </main>
  );
}
