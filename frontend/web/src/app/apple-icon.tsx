import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { athenaBrand } from "@athena/brand";
import { ImageResponse } from "next/og";

// Apple touch icons must be PNG; rasterise the kit app icon (brand guide 02) at build time.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const svg = await readFile(join(process.cwd(), "public/brand/athena-app-icon.svg"));
  const src = `data:image/svg+xml;base64,${svg.toString("base64")}`;
  return new ImageResponse(
    // iOS applies its own corner mask, so fill the corners with the icon's own accent.
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: athenaBrand.colors.accent,
      }}
    >
      <img src={src} width={size.width} height={size.height} alt="" />
    </div>,
    size,
  );
}
