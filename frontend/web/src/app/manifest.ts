import type { MetadataRoute } from "next";

import { athenaBrand } from "@athena/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Athena",
    short_name: "Athena",
    start_url: "/world",
    display: "standalone",
    background_color: athenaBrand.colors.paper,
    theme_color: athenaBrand.colors.ink,
    icons: [
      { src: "/brand/athena-app-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
