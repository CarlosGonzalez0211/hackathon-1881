"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ClassOrbit, ClassOrbitStudent, PlanetState } from "@athena/shared";
import { OrbitCanvas, Planet } from "./Planet";
import { arrivalFor, revealWhenDrawn } from "./arrival";
import { discardPreparedWorld, prepareWorld } from "./prepared-world";
import { VisitPlanetDialog } from "./VisitPlanetDialog";
import { WorldSketchIcon } from "@/features/world/components/WorldSketchIcon";
import { useOutsideDismiss } from "@/components/ui/useOutsideDismiss";
import { t } from "@/lib/i18n";

/**
 * Class orbit: one planet per enrolled student. The signed-in student's planet leads back to
 * their world; a classmate's planet offers a visit to theirs. Either way the camera dives into
 * the planet and its world takes over the same shot, with nothing left to load: the student's
 * own world is built offscreen while the orbit idles, a classmate's during the dive. Coming
 * back from a world, the orbit opens on that planet and climbs out to the class.
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
  const [landing, setLanding] = useState<string | null>(null);
  // Returning from a world: hold its planet until the handed-back shot has faded.
  const [returning, setReturning] = useState(() => arrivalFor("orbit"));
  const [ready, setReady] = useState(false);
  const landingRef = useRef<string | null>(null);
  landingRef.current = landing;
  const states = useMemo(() => orbit.students.map((student) => student.planet), [orbit]);
  const byId = useMemo(
    () => new Map(orbit.students.map((student) => [student.studentId, student])),
    [orbit],
  );
  const worldHref = (studentId: string) =>
    studentId === viewerStudentId
      ? "/world"
      : `/visit/${encodeURIComponent(studentId)}?alumnos=${orbit.students.length}`;
  // Build the student's own world while the orbit idles (after any climb-out), so diving
  // home never waits on it. Leaving the orbit any other way frees it.
  useEffect(() => {
    const own = byId.get(viewerStudentId);
    if (!ready || returning || !own) return;
    let idle = 0;
    const timer = window.setTimeout(() => {
      const start = () => {
        router.prefetch("/world");
        prepareWorld(own.planet);
      };
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(start);
      else start();
    }, 800);
    return () => {
      window.clearTimeout(timer);
      if (idle) window.cancelIdleCallback(idle);
    };
  }, [ready, returning, byId, viewerStudentId, router]);
  useEffect(() => () => discardPreparedWorld(landingRef.current ? 30000 : 0), []);
  /** Dive into a planet; its world (route and 3D engine) is ready or prepared in flight. */
  const land = (planet: PlanetState) => {
    if (landing || returning) return;
    router.prefetch(worldHref(planet.studentId));
    prepareWorld(planet);
    setList(false);
    setLanding(planet.studentId);
  };
  const open = (planet: PlanetState) => {
    if (landing || returning) return;
    if (planet.studentId === viewerStudentId) {
      land(planet);
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
    <main className={`world-app orbital-app${landing || returning ? " is-landing" : ""}`}>
      <OrbitCanvas
        states={states}
        onPlanetClick={open}
        focus={returning}
        start={returning}
        onReady={() => {
          setReady(true);
          if (returning) revealWhenDrawn(() => setReturning(null));
        }}
        landing={landing}
        onLanded={() => landing && router.push(worldHref(landing))}
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
        <Link
          href="/world"
          className="orbit-home-link"
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
            const own = byId.get(viewerStudentId);
            if (!own) return;
            event.preventDefault();
            open(own.planet);
          }}
        >
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
      {invite && (
        <VisitPlanetDialog
          student={invite}
          onVisit={() => land(invite.planet)}
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
      </footer>
    </main>
  );
}
