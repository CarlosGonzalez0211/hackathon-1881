import { RoleGate } from "@/features/auth";
import { ContentWorkspace } from "@/features/content";

export default async function ClassContentPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <RoleGate allow={["professor"]}>
        <ContentWorkspace classId={classId} />
      </RoleGate>
    </main>
  );
}
