import { HousePage } from "@/features/world/components/HousePage";

/** Direct visit or refresh of a house URL: the same page, standalone. */
export default async function HouseStandalone({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  return <HousePage topicId={decodeURIComponent(topicId)} variant="standalone" />;
}
