# Athena kit generator

Headless, deterministic generator for the world art kit. It builds GLB files with the npm
`three`, a small sculpting toolkit and `@gltf-transform`, in plain Node 22 with no DOM. Art
direction lives in `docs/art/ART_DIRECTION.md` (section 4.1 names the toolkit vocabulary,
section 6 the budgets, section 7 the contracts).

The legacy builder `athena-models.js` (browser-side, `createAthena(THREE)`) is untouched and is
**not** imported here. The committed Git LFS GLBs under `athena-assets/models/` stay the source
of truth for every family that has not been ported to this generator.

## Run it

```bash
pnpm --filter @athena/engine3d generate:kit                    # everything in the registry
pnpm --filter @athena/engine3d generate:kit --only=spike       # a family, an id or a file name
pnpm --filter @athena/engine3d generate:kit --only=spike-rig,spike-sdf
pnpm --filter @athena/engine3d generate:kit --list             # fresh / stale / missing per entry
pnpm --filter @athena/engine3d generate:kit --force            # ignore the cache
pnpm --filter @athena/engine3d generate:kit --out=/some/dir    # another cache directory
```

The spike family builds in 2 to 5 s (the cards entry paints the atlas; a fresh cache check takes about 0.4 s). Cold generation of a full kit should stay well under two
minutes; if a family does not, split it or lower the SDF resolution before adding more.

## The cache and the overlay

Output goes to `frontend/engine3d/.kit-cache/` (gitignored; override with `ATHENA_KIT_CACHE`):

```
.kit-cache/kit-cache.json              { version, three, codeHash, entries: { id: { family, file, hash, bytes } } }
.kit-cache/models/<family>/<file>.glb
```

- `codeHash` is a content hash of everything in `athena-assets/code/` except markdown.
- An entry's `hash` covers the toolkit (`sculpt/**`, `generate.mjs`, `registry.mjs`), the
  entry's own family module (`families/<family>.mjs`), its id and file name, and the `three`
  version. Editing `families/spike.mjs` rebuilds only the spike entries; editing anything in
  `sculpt/` rebuilds everything. A fresh cache exits without even importing three.
- Entries removed from the registry are deleted from the cache on the next full run.

`scripts/build-athena-assets.mjs` reads **two roots per file, cache first**:

1. run `generate.mjs` (skipped in milliseconds when fresh),
2. for every `models/**.glb`, take `.kit-cache/` if it has the file, else the committed kit.

So a file exists in the build with the generated version as soon as it is registered, and the
rest of the kit is untouched. The same rule is implemented for tests in
`tests/helpers/kit-path.ts` (`kitModelPath("buildings/athena-house-done-v0.glb")`).

| Variable                      | Effect                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| `ATHENA_KIT_SOURCE=generated` | Default. Generate, then overlay the cache on the committed kit.                      |
| `ATHENA_KIT_SOURCE=legacy`    | Ignore the cache and generation entirely (A/B comparison against the committed art). |
| `ATHENA_KIT_CACHE=<dir>`      | Cache directory for `generate.mjs`, the build and the test helper.                   |
| `ATHENA_KIT_DIR=<dir>`        | Another checkout of the committed kit (already supported by the build).              |

Documents written by the generator carry `asset.extras = { athenaGenerator: 3, athenaNormals:
"authored" }` (plus `athenaKeepHierarchy: true` for rigs). The asset build reads them:
`athenaNormals: "authored"` skips the crease smoothing pass, `athenaGenerator >= 3` skips the
legacy character refinement pass, `athenaKeepHierarchy` keeps the node tree instead of
flattening and joining it. The build also reports every GLB (triangles, vertices, primitives,
materials, bytes) in `athena-budget.json` under `perModel`, against the section 6 limits.
Limits only fail `--strict` for generated models; committed models are reported as
informational because they predate the limits.

## Attribute naming (verified against three r180)

Name custom vertex attributes in three **without** a leading underscore:

| three attribute | in the GLB       | runtime (`GLTFLoader`)                                            |
| --------------- | ---------------- | ----------------------------------------------------------------- |
| `athena_style`  | `_ATHENA_STYLE`  | `geometry.attributes._athena_style` (read by `character-look.ts`) |
| `athena_weave`  | `_ATHENA_WEAVE`  | `geometry.attributes._athena_weave`                               |
| `athena_center` | `_ATHENA_CENTER` | `geometry.attributes._athena_center` (card parent sphere centre)  |

`GLTFExporter` upper-cases the name and prefixes `_` because it is not a core semantic; the
loader lower-cases it back. A three attribute already called `_athena_style` would be written
as `__ATHENA_STYLE`, which is wrong. `tests/kit-exporter.test.ts` round-trips this through the
recovered runtime's own GLTFLoader.

Other export rules: vertex colours are Float32 `color` with `vertexColors: true` (white base
colour); emissive uses `emissiveIntensity` (`KHR_materials_emissive_strength`); animations are
exported with `trs: true` and bind by node name, so **node names must be unique per model**;
`userData` on an object becomes its glTF node extras (`userData.part` works).

## Node specifics

- `GLTFExporter`'s binary path calls `FileReader.readAsArrayBuffer`; `sculpt/export.mjs`
  installs a minimal `FileReader` polyfill. `Blob` and `TextEncoder` are global in Node 22.
- Never attach a `THREE.Texture` in Node (it touches `document`). Paint PNGs with
  `paint/raster.mjs` and attach them after export: `attachTexture(glb, png, ["leaf_card"])`
  (or the `textures` field of an entry result) reopens the GLB with `@gltf-transform/core`,
  sets the base colour map, `alphaMode: "MASK"`, cutoff 0.5, double sided.
- glTF UV origin is top-left (v runs down the image). `cards.mjs` and `atlasRect` already use
  that convention.
- `three-subdivide` is imported from `three-subdivide/build/index.module.js`: its `main` is a
  UMD bundle that would `require` a second copy of three.
- `THREE.CapsuleGeometry` and `THREE.LatheGeometry` emit zero-area triangles at their poles.
  Use `lathe()` (which does not) for capsule-like limbs.

## Toolkit (`sculpt/`)

All functions take `THREE` first; `createTools(THREE)` in `sculpt/index.mjs` binds them and is
what a registry entry receives as `tools`. Everything is seeded and DOM-free.

| Module                                  | What it does                                                                                                                                                                                                                                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lathe.mjs`                             | `lathe(THREE, profile, { segments, divisions, scallop: { folds, depth, from, lift }, phiStart, phiLength })`. Catmull-Rom profile `[[r, y], [r, y, 1 /* corner */], ...]` revolved around Y; bottom to top along the outside.                                                                |
| `sweep.mjs`                             | `sweep(THREE, curve, { radius: n \| t => r, tubular, radial, caps: false \| "flat" \| "round", twist })`.                                                                                                                                                                                    |
| `cage.mjs`                              | `cage(THREE, { vertices, faces })` (tris or quads) and `subdivide(THREE, geometry, iterations)` (Loop, `split: false`, welded, smooth normals).                                                                                                                                              |
| `sdf.mjs`                               | `sdf.sphere / ellipsoid / capsule / roundBox / halfspace`, `sdf.union / smin(k, ...) / subtract(a, b, k) / intersect / translate`, and async `polygonise(THREE, scene, { size: 64, maxTriangles })` (MarchingCubes, weld, orient, meshopt decimation, surface projection, analytic normals). |
| `noise.mjs`                             | `lcg(seed)`, `createNoise(seed)` (`noise2`, `noise3`, `fbm3`), `displace(THREE, geometry, fn)` (crack-free along position-averaged normals).                                                                                                                                                 |
| `bake.mjs`                              | `bakeFill`, `bakeGradient` (dark base to light top), `bakeDirection` (moss on +Y), `bakeOcclusion` (SDF taps, or a mesh-only cavity estimate). They multiply into one `color` attribute.                                                                                                     |
| `normals.mjs`                           | `smoothNormals(geometry, creaseDegrees)` (port of `scripts/smooth-normals.mjs`), `degenerateTriangles(geometry)`.                                                                                                                                                                            |
| `cards.mjs`                             | `fringeRing`, `crossCards`: alpha quads with normals from a parent sphere, `athena_center`, atlas-rect uvs, tint colours.                                                                                                                                                                    |
| `paint/raster.mjs`, `paint/foliage.mjs` | RGBA raster (fill, soft brush, simplex fill, leaf / blade / petal stamps, dilate, `toPng`) and `paintFoliageAtlas()`: 512 x 512 with a leaf cluster, a blade tuft and five flower species, plus named rects.                                                                                 |
| `materials.mjs`                         | `material(name, color, opts)`: role-named `MeshStandardMaterial`s (`window_glow`, `gilt`, ...).                                                                                                                                                                                              |
| `export.mjs`                            | `installPolyfills`, `exportGlb(root, clips)`, `finalizeGlb(glb, { extras, textures })`, `attachTexture`.                                                                                                                                                                                     |

Art rules apply to every use: no straight profiles, no per-vertex jitter, bases darker than
tops, materials named by role, pivot at the base centre, +Z forward, metres.

## Add a family

1. Create `families/<name>.mjs` exporting `entries`: `{ id, family, file, build(THREE, tools, opts) }`.
   `family` is the output folder under `models/` and the module name, so the entry file name
   and folder must match the committed kit to replace a file (for example family `buildings`,
   file `athena-house-done-v0.glb`). `build` may be async and returns
   `{ root, clips?, textures?, extras? }`.
2. Import it in `registry.mjs` (there are empty `houses`, `buildings`, `nature`, `characters`
   and `props` lists to fill) and spread it into `entries`.
3. Ground the finished static root with `tools.ground(root)` (rigs are modelled at the origin
   instead, because position tracks would overwrite a shift), name materials by role, and keep
   to the section 6 budgets.
4. `pnpm --filter @athena/engine3d generate:kit --only=<name>`, then
   `pnpm --filter @athena/engine3d build:assets --strict` and the engine tests.
   `tests/kit-geometry.test.ts` automatically checks every generated GLB: finite positions and
   normals, valid indices, base at y = 0, XZ centred within 5 % of the largest dimension, at
   most 2 % degenerate triangles, document extras.
5. Characters keep the rig node names, part tags, joint sockets, clip names and the
   `athena_style` / `athena_weave` attributes; `families/spike.mjs` (`spike-rig`) is the
   smallest working example.

## The spike family

`families/spike.mjs` registers five fixtures that prove each operation survives the real build
and the runtime loader. They are not final art and they are not referenced by the app:

| File                     | Proves                                                                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `athena-spike-lathe.glb` | lathe with scalloped rim, corner flags, baked gradient and occlusion, `wall` / `gilt` / `window_glow`                                  |
| `athena-spike-sdf.glb`   | smin crown of five lobes, 64^3 polygonise, decimation to 1100 triangles, SDF occlusion                                                 |
| `athena-spike-cage.glb`  | 8-vertex cage, two Loop subdivisions, noise displacement, crease normals, moss bake                                                    |
| `athena-spike-cards.glb` | eight alpha cards from the painted atlas, `leaf_card`, `_ATHENA_CENTER`, PNG attached after export                                     |
| `athena-spike-rig.glb`   | node-animated figure, unique joint names, `userData.part`, `_ATHENA_STYLE` / `_ATHENA_WEAVE`, clips `idle`, `walk`, `expression_blink` |
