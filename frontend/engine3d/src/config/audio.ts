import { assetCatalog } from "../assets/catalog";
export const audioDefinition = {
  assets: assetCatalog.filter((asset) => asset.category === "audio").map((asset) => asset.id),
  music: {
    desktop: "audio.music.bgmusic-highq.ogg",
    mobile: "audio.music.bgmusic-mobile.ogg",
    positionalMusician: "audio.music.musician.ogg",
  },
  ambiences: ["base", "beach", "city", "factory", "forest", "temple", "waterfalls"].map((name) => ({
    id: `ambience.${name}`,
    assetId: `audio.ambiances.${name}.ogg`,
  })),
  autoplay: false,
  policy:
    "Start audio after user gesture; dispose sources on route exit. Original spatial positions and gains remain in extracted runtime.",
} as const;
