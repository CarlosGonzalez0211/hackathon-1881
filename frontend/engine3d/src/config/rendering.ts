import { athenaBrand } from "@athena/brand";
import { assetCatalog } from "../assets/catalog";

export const renderingDefinition = {
  sourceSymbols: [
    "terrain",
    "sky",
    "grass",
    "water",
    "createLeavesMaterial",
    "outlines",
    "waterPass",
  ],
  sky: {
    radius: 55,
    colors: ["#75bdc3", "#9fe2e0", "#b9ebea"],
    parallax: 0.9,
    noiseAssetId: "images.clouds_noise_512.ktx2",
  },
  light: {
    color: "#ffffff",
    intensity: 3,
    radius: 100,
    polarAngle: Math.PI * 0.2,
    azimuthAngle: Math.PI * -0.25,
    forwardOffset: 6,
  },
  /** Athena look (task 11). Toggle `enabled` / `outline.enabled` to A/B. */
  toon: {
    enabled: true,
    gradient: [90, 170, 255],
    // Brand gap: the guide has no 3D ink; #2B2936 is the asset-kit/brief outline colour.
    outline: { enabled: true, color: "#2B2936", thickness: 0.0028 },
  },
  /**
   * Fill light for Athena (MeshToon) materials; legacy cel shaders light themselves and
   * ignore it. Fog uses `--athena-sky-horizon`.
   */
  athenaLight: { color: athenaBrand.colors.skyMid, intensity: 1.2 },
  fog: { color: athenaBrand.colors.skyHorizon },
  camera: { relativePosition: [0, 1, 5], relativeOffset: [-0.65, 0, 1], initialRadius: 2 },
  materials: {
    terrain: {
      id: "material.terrain",
      atlasAssetId: "images.atlas.png",
      noiseAssetId: "images.noises-terrain.ktx2",
      sourceSymbol: "terrain",
    },
    leaves: {
      id: "material.leaves",
      textureAssetId: "images.tree-leaves.ktx2",
      detailAssetId: "images.tree-leaves-detail.ktx2",
      sourceSymbol: "createLeavesMaterial",
    },
    water: {
      id: "material.water",
      noiseAssetId: "images.water-noises-highq.ktx2",
      sourceSymbol: "water",
    },
    postprocessing: {
      id: "material.postprocessing",
      lutAssetId: "images.lut.ktx2",
      sourceSymbols: ["outlines", "waterPass"],
    },
  },
  textures: assetCatalog.filter((asset) => asset.category === "texture").map((asset) => asset.id),
  codecs: assetCatalog.filter((asset) => asset.category === "codec").map((asset) => asset.id),
  workers: assetCatalog.filter((asset) => asset.category === "worker").map((asset) => asset.id),
  shaderPolicy:
    "Preserve extracted shader source without semantic changes. Material/renderer symbols are recorded here; extraction outputs contain the shader implementation.",
} as const;
