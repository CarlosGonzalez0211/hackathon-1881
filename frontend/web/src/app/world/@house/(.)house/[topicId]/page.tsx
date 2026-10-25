import { HousePage } from "@/features/world/components/HousePage";

/** Soft navigation from the world: the house page opens over the paused 3D world. */
export default async function HouseOverlay({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  return <HousePage topicId={decodeURIComponent(topicId)} variant="overlay" />;
}
