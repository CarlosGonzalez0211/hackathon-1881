import { DEMO_STUDENT_ID } from "@athena/shared";
import { OrbitExplorer } from "@/components/planet/OrbitExplorer";
import { getClassOrbit } from "@/lib/learning-data";

/**
 * Class orbit. With mocks, `?alumnos=N` renders a class of N students (default 8). The viewer
 * is the demo student until Platform auth provides the signed-in one (as in WorldProvider).
 */
export default async function OrbitPage({
  searchParams,
}: {
  searchParams: Promise<{ alumnos?: string }>;
}) {
  const { alumnos } = await searchParams;
  const students = Number.parseInt(alumnos ?? "", 10);
  const orbit = await getClassOrbit("class-demo", {
    students: Number.isFinite(students) ? students : undefined,
  });
  return <OrbitExplorer orbit={orbit} viewerStudentId={DEMO_STUDENT_ID} />;
}
