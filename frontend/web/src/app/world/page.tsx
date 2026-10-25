import { RoleGate } from "@/features/auth";
import { WorldExplorer } from "@/components/planet/WorldExplorer";

export default function WorldPage() {
  return (
    <RoleGate allow={["student", "professor"]}>
      <WorldExplorer />
    </RoleGate>
  );
}
