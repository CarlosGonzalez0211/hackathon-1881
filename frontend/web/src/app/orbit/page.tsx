import { OrbitExplorer } from "@/components/planet/OrbitExplorer";
import { getClassPlanets } from "@/lib/learning-data";
export default async function OrbitPage() {
  return <OrbitExplorer states={await getClassPlanets()} />;
}
