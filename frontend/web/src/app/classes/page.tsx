import { RoleGate } from "@/features/auth";
import { StudentClassList } from "@/features/content";

export default function ClassesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <RoleGate allow={["student", "professor"]}>
        <StudentClassList />
      </RoleGate>
    </main>
  );
}
