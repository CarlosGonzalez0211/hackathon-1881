import { RoleGate } from "@/features/auth";
import { mockStudentProgress } from "@/features/progress/mock-progress";
import { StudentProgressView } from "@/features/progress/StudentProgressView";

/** The student's progress in every subject. Demo data until Learning exposes it per student. */
export default function ProgressPage() {
  return (
    <RoleGate allow={["student", "professor"]}>
      <StudentProgressView data={mockStudentProgress} />
    </RoleGate>
  );
}
