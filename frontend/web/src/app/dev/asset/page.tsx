import { notFound } from "next/navigation";
import { AssetViewerClient, type AssetViewerParams } from "./AssetViewerClient";

/**
 * Dev-only asset turntable (render review, docs/art/ART_DIRECTION.md section 9). It draws one
 * manifest GLB through the world's loader, toon material and HDR grade. Absent in production.
 *
 * /dev/asset?key=models/buildings/athena-house-done-v0.glb&yaw=90&elev=14&grid=1&ref=1
 * Params: key, yaw, elev, fit, grid, ref, clip, t, quality. See engine3d `asset-viewer.ts`.
 */
export default async function DevAssetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const query = await searchParams;
  const one = (name: string) => {
    const value = query[name];
    return Array.isArray(value) ? value[0] : value;
  };
  const number = (name: string) => {
    const value = Number(one(name));
    return one(name) !== undefined && Number.isFinite(value) ? value : undefined;
  };
  const flag = (name: string) => one(name) === "1" || one(name) === "true";
  const quality = one("quality");
  const params: AssetViewerParams = {
    key: one("key") ?? "models/buildings/athena-house-done-v0.glb",
    yaw: number("yaw"),
    elev: number("elev"),
    fit: number("fit"),
    grid: flag("grid"),
    ref: flag("ref"),
    clip: one("clip"),
    t: number("t"),
    quality: quality === "low" || quality === "high" ? quality : undefined,
  };
  return <AssetViewerClient params={params} />;
}
