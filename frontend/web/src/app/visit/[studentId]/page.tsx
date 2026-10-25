import { notFound, redirect } from "next/navigation";
import { athenaDemoIds, DEMO_STUDENT_ID } from "@athena/shared";
import { VisitExplorer } from "@/components/planet/VisitExplorer";
import { getClassOrbit } from "@/lib/learning-data";

/**
 * A classmate's world, read-only. Reached from the class orbit (`?alumnos=N` keeps the mock
 * class the orbit showed); the viewer's own planet is their world at /world.
 */
export default async function VisitPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ alumnos?: string }>;
}) {
  const [{ studentId }, { alumnos }] = await Promise.all([params, searchParams]);
  const id = decodeURIComponent(studentId);
  if (id === DEMO_STUDENT_ID) redirect("/world");
  const students = Number.parseInt(alumnos ?? "", 10);
  const orbit = await getClassOrbit(athenaDemoIds.class, {
    students: Number.isFinite(students) ? students : undefined,
  });
  const student = orbit.students.find((item) => item.studentId === id);
  if (!student) notFound();
  const back = Number.isFinite(students) ? `/orbit?alumnos=${students}` : "/orbit";
  return <VisitExplorer student={student} orbitHref={back} />;
}
