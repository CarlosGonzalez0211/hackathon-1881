import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Athena",
    short_name: "Athena",
    start_url: "/world",
    display: "standalone",
    background_color: "#eff5ed",
    theme_color: "#172f3a",
    icons: [],
  };
}
