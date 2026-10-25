import { RoleGate } from "@/features/auth";
import { StudentClassChat } from "@/features/content";

export default async function ClassChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ topicId?: string | string[] }>;
}) {
  const { classId } = await params;
  const { topicId } = await searchParams;
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <RoleGate allow={["student", "professor"]}>
        <StudentClassChat
          classId={classId}
          initialTopicId={typeof topicId === "string" ? topicId : undefined}
        />
      </RoleGate>
    </main>
  );
}
