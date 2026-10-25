"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ClassOrbit, ClassOrbitStudent, PlanetState } from "@athena/shared";
import type { EngineStats } from "@athena/engine3d";
import { OrbitCanvas, Planet } from "./Planet";
import { VisitPlanetDialog } from "./VisitPlanetDialog";

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
      <nav className="world-controls" aria-label="Controles de órbita">
        <Link href="/world">Volver al mundo</Link>
        <button onClick={() => setList(!list)} aria-expanded={list} aria-controls="orbit-list">
          Planetas
        </button>
      </nav>
      <aside
        id="orbit-list"
        hidden={!list}
        className="orbit-list"
        aria-label="Alternativa 2D de los planetas"
      >
        <h2>Planetas de la clase</h2>
        {roster.map((student) => (
          <button
            key={student.studentId}
            onClick={() => open(student.planet)}
            className={student.studentId === viewerStudentId ? "is-own" : undefined}
          >
            <span>{student.displayName}</span>
            {student.studentId === viewerStudentId && <small>Tu planeta</small>}
          </button>
        ))}
      </aside>
      {visiting && (
        <div className="orbit-visit-bar" role="status">
          <span>
            Visitando el planeta de <strong>{visiting.displayName}</strong>
          </span>
          <button onClick={() => setVisiting(null)}>Volver a la clase</button>
        </div>
      )}
      {invite && (
        <VisitPlanetDialog
          student={invite}
          onVisit={() => setVisiting(invite)}
          onClose={() => setInvite(null)}
        />
      )}
      <footer className="world-footer">
        <p>
          {orbit.students.length === 1 ? "1 planeta" : `${orbit.students.length} planetas`} · una
          escena compartida
        </p>
        <span className="runtime-note">
          {stats
            ? `${Math.round(stats.fps)} fps · ${stats.drawCalls} draw calls`
            : "Cargando recursos compartidos"}
        </span>
      </footer>
    </main>
  );
}
