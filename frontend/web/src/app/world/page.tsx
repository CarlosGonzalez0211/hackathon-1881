import { WorldExplorer } from "@/components/planet/WorldExplorer";
import { getPlanet, useMocks } from "@/lib/learning-data";
export default async function WorldPage() {
  return <WorldExplorer state={await getPlanet()} simulated={useMocks} />;
}
