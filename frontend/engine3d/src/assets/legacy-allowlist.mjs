// Legacy Messenger files the Athena build still loads ON PURPOSE (docs/MIGRATION.md,
// "Pending"). The brief keeps the world structure, paths and collision exactly, and
// gameplay stays on the legacy controllers; everything here is either that structure,
// a hidden rig that drives gameplay, or a slot with no compatible Athena file yet.
// `npm run check:assets` fails on any other legacy request (and on these with --strict).

/** @type {readonly { pattern: RegExp; reason: string }[]} */
export const STRUCTURAL_LEGACY = [
  {
    pattern: /^geometries\/planets\/present\/(low\/)?(full|full-lod-\d)_\d+\.drc$/,
    reason:
      "terrain + architecture chunks: the spherical world, its paths and buildings (no Athena shape fits; recolour pending)",
  },
  {
    pattern: /^geometries\/planets\/present\/hitmesh_\d+\.drc$/,
    reason: "original collision mesh (kept by the brief)",
  },
  {
    pattern: /^geometries\/planets\/present\/(low\/)?tree-leaves_\d+\.drc$/,
    reason: "canopy positions for the instanced Athena trees (the legacy leaves are hidden)",
  },
  {
    pattern:
      /^geometries\/planets\/present\/(water|waterfall_vfx|waterfall_inlet_vfx|waterfallsplash_vfx|beachfoam_vfx|smoke-\d|cables-\d|grass|butterflies)\.drc$/,
    reason:
      "VFX / wind meshes fitted to the legacy terrain (Athena VFX geometry is not placed for this planet)",
  },
  {
    pattern: /^geometries\/avatar\//,
    reason:
      "hidden legacy avatar rig: capsule physics and animation blend weights drive the Athena avatar",
  },
  {
    pattern: /^geometries\/npcs\//,
    reason:
      "hidden legacy NPC rigs: spawn, facing, curves, culling and dialogue framing drive the Athena NPCs",
  },
  {
    pattern: /^geometries\/birds\/curve-\d\.drc$/,
    reason: "bird flight paths (world structure)",
  },
  {
    pattern:
      /^images\/(atlas\.png|eye-highq|mainchar-eye-highq|mouth-highq|particle_sprites|butterfly-highq|butterfly-front-highq|grass-blades-highq|tree-leaves|tree-leaves-detail)\.ktx2$|^images\/atlas\.png$/,
    reason: "texture slots coupled to legacy UVs/shaders (palette atlas, faces, sprite sheets)",
  },
  { pattern: /^images\/controls\//, reason: "touch-controls ring (no Athena replacement yet)" },
  { pattern: /^libs\/(draco|basis)\//, reason: "third-party decoders (not art)" },
  { pattern: /^[a-z]+worker-[\w-]+\.js$/, reason: "engine workers (code, not art)" },
];

/** Reason a legacy path (relative to /assets/athena/) is allowed, or undefined. */
export function structuralReason(path) {
  return STRUCTURAL_LEGACY.find((rule) => rule.pattern.test(path))?.reason;
}
