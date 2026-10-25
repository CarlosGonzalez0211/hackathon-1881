import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { NodeIO, getBounds, type Document } from "@gltf-transform/core";
import { ALL_EXTENSIONS, KHRMaterialsEmissiveStrength } from "@gltf-transform/extensions";
import { dressHouse, HOUSE_WIND_NAME } from "../src/village/houses-look";
import { engineRoot, kitModelPath } from "./helpers/kit-path";

/**
 * Material contract of the six topic houses in four states (docs/art/briefs/houses.md):
 * names drive behaviour at runtime (`src/village/scene.ts lightWindows`, `houses-look.ts`), so
 * each state must carry exactly the materials that make it read, nothing outside the list, and
 * the light materials must be emissive with the documented strengths.
 */
const generator = path.join(engineRoot, "athena-assets", "code", "generate.mjs");
const generated = spawnSync(process.execPath, [generator, "--quiet", "--only=houses"], {
  encoding: "utf8",
});
assert.equal(generated.status, 0, `generate.mjs failed:\n${generated.stdout}\n${generated.stderr}`);

const STATUSES = ["locked", "available", "in-progress", "done"] as const;
const VARIANTS = [0, 1, 2, 3, 4, 5];
/** Every material name a house may carry. */
const ALLOWED = new Set([
  "stone_plinth",
  "stone_step",
  "wall_plaster",
  "wall_stone",
  "timber",
  "door",
  "shutter",
  "iron",
  "roof_tile",
  "roof_ridge",
  "window_unlit",
  "window_glow",
  "lantern_paper",
  "lantern_glow",
  "beacon_gold",
  "gilt",
  "rune_cold",
  "vine",
  "vine_dry",
  "vine_leaf",
  "vine_bloom",
  "garden_leaf",
  "garden_bloom",
  "banner",
  "smoke",
  "mote",
  "halo",
]);
/** Palette swatches (ART_DIRECTION section 3) used as flat material colours. */
const PALETTE = new Set(
  [
    "#FFFFFF", // vertex-coloured materials keep a white base
    "#FFE2A6",
    "#F6C46A",
    "#F2C36B",
    "#E9BC5C",
    "#C99232",
    "#B9C4C8",
    "#2F7D7A",
    "#1F5856",
    "#E9AFAA",
    "#FBF3E4",
  ].map((c) => c.toUpperCase()),
);
const EMISSIVE_STRENGTH: Record<string, number> = {
  window_glow: 0.8,
  lantern_glow: 0.9,
  beacon_gold: 1.0,
  gilt: 0.6,
  halo: 0.6,
  rune_cold: 0.5,
  vine_bloom: 0.4,
  mote: 0.8,
};
/** What each state must (and must not) show. */
const REQUIRE: Record<(typeof STATUSES)[number], string[]> = {
  locked: ["rune_cold", "window_unlit", "shutter", "vine_dry", "lantern_paper", "wall_stone"],
  available: ["window_glow", "window_unlit", "lantern_glow", "banner", "wall_plaster"],
  "in-progress": ["window_glow", "lantern_glow", "vine", "vine_bloom", "vine_leaf", "smoke"],
  done: [
    "window_glow",
    "lantern_glow",
    "beacon_gold",
    "gilt",
    "garden_leaf",
    "garden_bloom",
    "banner",
    "mote",
  ],
};
const FORBID: Record<(typeof STATUSES)[number], string[]> = {
  locked: [
    "window_glow",
    "lantern_glow",
    "beacon_gold",
    "vine_bloom",
    "banner",
    "mote",
    "smoke",
    "halo",
    "wall_plaster",
  ],
  available: ["vine_bloom", "beacon_gold", "mote", "smoke", "rune_cold", "vine_dry"],
  "in-progress": ["beacon_gold", "mote", "rune_cold", "vine_dry", "garden_bloom"],
  done: ["rune_cold", "vine_dry", "smoke", "vine_bloom", "window_unlit"],
};

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const cache = new Map<string, Document>();
async function load(status: string, variant: number) {
  const file = `buildings/athena-house-${status}-v${variant}.glb`;
  if (!cache.has(file)) cache.set(file, await io.read(kitModelPath(file)));
  return cache.get(file)!;
}
const hex = (rgb: number[]) =>
  "#" +
  rgb
    .slice(0, 3)
    .map((v) => {
      const srgb = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
      return Math.round(Math.min(1, Math.max(0, srgb)) * 255)
        .toString(16)
        .padStart(2, "0");
    })
    .join("")
    .toUpperCase();

test("24 houses exist with the manifest names", () => {
  for (const status of STATUSES)
    for (const variant of VARIANTS)
      assert.ok(
        kitModelPath(`buildings/athena-house-${status}-v${variant}.glb`).includes(".kit-cache"),
        `athena-house-${status}-v${variant}.glb comes from the generator`,
      );
});

for (const status of STATUSES)
  for (const variant of VARIANTS)
    test(`house ${status} v${variant}: material names, emissive strengths, palette, bounds`, async () => {
      const document = await load(status, variant);
      const root = document.getRoot();
      const materials = root.listMaterials();
      const names = materials.map((m) => m.getName());
      assert.equal(new Set(names).size, names.length, "one glTF material per name");
      for (const name of names) assert.ok(ALLOWED.has(name), `material ${name} is in the contract`);
      for (const required of REQUIRE[status])
        assert.ok(names.includes(required), `${status} has ${required}`);
      for (const forbidden of FORBID[status])
        assert.ok(!names.includes(forbidden), `${status} must not have ${forbidden}`);

      for (const material of materials) {
        const name = material.getName();
        // No textures, only standard PBR materials (no custom shaders exist in glTF anyway).
        assert.equal(material.getBaseColorTexture(), null, `${name} is untextured`);
        assert.equal(material.getEmissiveTexture(), null, `${name} has no emissive texture`);
        const mode = material.getAlphaMode();
        if (name === "smoke" || name === "mote" || name === "halo")
          assert.equal(mode, "BLEND", `${name} blends`);
        else assert.equal(mode, "OPAQUE", `${name} is opaque`);
        // Flat colours stay on the palette.
        assert.ok(
          PALETTE.has(hex(material.getBaseColorFactor())),
          `${name} base colour ${hex(material.getBaseColorFactor())} is a swatch`,
        );
        const emissive = material.getEmissiveFactor();
        const lit = emissive.some((v) => v > 0);
        if (name in EMISSIVE_STRENGTH) {
          assert.ok(lit, `${name} is emissive`);
          const extension = material.getExtension<KHRMaterialsEmissiveStrength>(
            "KHR_materials_emissive_strength",
          );
          const strength = extension ? extension.getEmissiveStrength() : 1;
          assert.ok(
            Math.abs(strength - EMISSIVE_STRENGTH[name]!) < 1e-6,
            `${name} emissive strength ${strength}`,
          );
        } else if (name === "roof_tile") {
          // Faint emissive keeps the glazed roof out of the runtime vertex-colour merge.
          const extension = material.getExtension<KHRMaterialsEmissiveStrength>(
            "KHR_materials_emissive_strength",
          );
          assert.ok(
            lit && (extension?.getEmissiveStrength() ?? 1) <= 0.05,
            "roof_tile faint emissive",
          );
        } else assert.ok(!lit, `${name} is not emissive`);
      }
      // Cloth and leaves must be double sided so they survive the merge and can be moved by wind.
      for (const material of materials)
        if (HOUSE_WIND_NAME.test(material.getName()))
          assert.ok(material.getDoubleSided(), `${material.getName()} is double sided`);

      // Every vertex colour stays inside the palette's value range: no pure black or white.
      for (const mesh of root.listMeshes())
        for (const primitive of mesh.listPrimitives()) {
          const color = primitive.getAttribute("COLOR_0");
          if (!color) continue;
          const c = color.getArray()!;
          const step = color.getElementSize();
          for (let i = 0; i < color.getCount(); i++) {
            const [r, g, b] = [c[i * step]!, c[i * step + 1]!, c[i * step + 2]!];
            assert.ok(!(r > 0.985 && g > 0.985 && b > 0.985), "no pure white vertex");
            assert.ok(r + g + b > 0.03, "no pure black vertex");
          }
        }

      // Contract bounds: 3.9 x 3.15 m footprint, 4.4 m height, base at y = 0, door side +Z.
      const bounds = getBounds(root.listScenes()[0]!);
      const size = bounds.max.map((v, i) => v - bounds.min[i]!);
      assert.ok(size[0]! <= 3.9, `width ${size[0]}`);
      assert.ok(size[2]! <= 3.15, `depth ${size[2]}`);
      assert.ok(size[1]! <= 4.4, `height ${size[1]}`);
      assert.ok(Math.abs(bounds.min[1]) < 0.01, "base at y = 0");
    });

for (const variant of VARIANTS)
  test(`house v${variant}: open states have a doorway glow at +Z, locked has none`, async () => {
    for (const status of STATUSES) {
      const document = await load(status, variant);
      const glow = document
        .getRoot()
        .listMeshes()
        .flatMap((m) => m.listPrimitives())
        .filter((p) => p.getMaterial()?.getName() === "window_glow");
      if (status === "locked") {
        assert.equal(glow.length, 0, "locked: no window_glow");
        continue;
      }
      // The doorway panel is the window_glow geometry facing +Z closest to the door axis.
      let found = false;
      for (const primitive of glow) {
        const p = primitive.getAttribute("POSITION")!;
        const n = primitive.getAttribute("NORMAL")!;
        for (let i = 0; i < p.getCount(); i++) {
          const [x, y] = p.getElement(i, []);
          const [, , nz] = n.getElement(i, []);
          if (nz! > 0.9 && Math.abs(x!) < 0.3 && y! < 1.3) found = true;
        }
      }
      assert.ok(found, `${status}: doorway glow facing +Z`);
    }
  });

test("the six roofs have six different silhouettes (front view, 64 columns)", async () => {
  const profiles: number[][] = [];
  for (const variant of VARIANTS) {
    const document = await load("locked", variant);
    const bounds = getBounds(document.getRoot().listScenes()[0]!);
    const columns = new Array(64).fill(0);
    const span = bounds.max[0]! - bounds.min[0]!;
    for (const mesh of document.getRoot().listMeshes())
      for (const primitive of mesh.listPrimitives()) {
        const p = primitive.getAttribute("POSITION")!.getArray()!;
        for (let i = 0; i < p.length; i += 3) {
          const column = Math.min(63, Math.floor(((p[i]! - bounds.min[0]!) / span) * 64));
          columns[column] = Math.max(columns[column], p[i + 1]! / 4.4);
        }
      }
    profiles.push(columns);
  }
  for (let a = 0; a < profiles.length; a++)
    for (let b = a + 1; b < profiles.length; b++) {
      // Compare shapes independent of overall width: resample both to 32 columns around the centre.
      const distance =
        profiles[a]!.reduce((sum, v, i) => sum + Math.abs(v - profiles[b]![i]!), 0) / 64;
      assert.ok(distance > 0.03, `v${a} and v${b} silhouettes differ (${distance.toFixed(3)})`);
    }
});

test("dressHouse flags glazed roofs and only wind-moves cloth and leaves", () => {
  const roof = { name: "roof_tile", userData: {} as Record<string, unknown>, needsUpdate: false };
  const wall = { name: "wall_plaster", userData: {} as Record<string, unknown> };
  const banner = {
    name: "banner",
    userData: {} as Record<string, unknown>,
    onBeforeCompile() {},
    customProgramCacheKey: () => "base",
    needsUpdate: false,
  };
  const meshes = [roof, wall, banner].map((material) => ({
    isMesh: true,
    userData: {},
    material,
    geometry: { computeBoundingBox() {}, boundingBox: { max: { x: 0.2 } } },
  }));
  const model = {
    root: { traverse: (visit: (part: unknown) => void) => meshes.forEach(visit) },
    animations: [],
    url: "test",
  };
  dressHouse(model as never, "done", { value: 0 });
  assert.equal(roof.userData.athenaGlaze, true, "roof_tile is flagged for the sheen");
  assert.equal(wall.userData.athenaGlaze, undefined, "plaster is not glazed");
  assert.equal(banner.userData.athenaHouseWind, true, "banner gets the wind");
  assert.equal(wall.userData.athenaHouseWind, undefined, "plaster does not move");
  dressHouse(model as never, "locked", { value: 0 });
});
