import type { MetadataRoute } from "next";

// PWA manifest. Add icons to apps/web/public and list them here to make it installable.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hackathon 1881",
    short_name: "H1881",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [],
  };
}
