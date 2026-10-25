# Brief B: landscape (terrain paint, cliffs, rocks, trees, meadows, water, bridges, terraces)

Read `docs/art/ART_DIRECTION.md` first (rules 2, 4, 5, 6; section 4.4). The terrain shape is frozen: `src/village/layout.ts` drives walking and must not change. Everything here is paint, visual-only masses in unwalkable places, or instanced assets placed by the existing predicates.

## Targets

- The horizon has shapes: cliff plateaus on the five mountains, three far islets beyond the cloud belt.
- Trees read as crowns, not as sphere clusters. Three species. Distant trees still read by silhouette.
- Ground reads as painted meadow with directional strokes, path shoulders and wet sand, not as a flat tint.
- Grass and flowers are fewer, larger and shaped. Water has depth, sky reflection and foam lines.
- Bridges and terraces look built from timber and stone, not from boxes.

## Deliverables and rules

### Terrain paint (`src/village/terrain.ts`, replace the colour block only)

- Keep the single mesh, the `land` attribute, `athenaNoInk`, the toon conversion; bump the cache key.
- Layers: (1) two-tone meadow wash at two scales; (2) directional brush strokes oriented toward the sun (use the shared sun uniform); (3) path: keep the existing road and shoulder bands, add a darker wet rim just outside the shoulder and sparse flagstones on the plaza (`inWelcomeCourtyard` radius) drawn as rounded cells; (4) slope-based stone: steep faces (`1 - |dot(n, up)|` above 0.45) become cool stone with two or three strata lines, flat tops keep grass caps; (5) lichen (pale warm) above the old snow threshold instead of white snow; (6) wet sand ring where `waterDepth` is between 0 and 0.06.
- Optional tri-planar brush texture at two scales mixed at most 0.18 and a normal perturbation at 0.25 strength (skip on the low tier).
- Set the terrain to not cast shadows (cliff shells and trees cast instead).

### Cliff shells and rock scatter (`src/village/cliffs.ts`, new)

- `createCliffShells(ctx, root, low)`: for each mountain in `layout.ts`, a shell mesh where `mountainHeight(up) > 1.25` (already unwalkable), offset outward 0.25 to 0.9 m, quantised into three or four plateau steps with slightly overhanging lips; baked vertex colour: cool stone sides with strata, grass caps on faces whose normal is within 25 degrees of up, warm sun-side tint. Toon material through `ctx.toon.apply`, `paintMaterial(..., "ground")`. Casts shadows. Skipped on the low tier (paint only).
- `createRockScatter(ctx, root, low, obstacles)`: keep the existing boulder `scatter(…, 52)` set as obstacles but instance the new SDF rock set; add talus below cliffs (`0.7 < mountainHeight < 1.25`), path-edge stones (`1.45 < pathDistance < 1.9`, at most 0.18 m tall, no obstacles), shore pebbles (`0.02 < waterDepth < 0.12`). All through the existing `instanceModel` pattern in `scene.ts`.
- Optional (high tier): one waterfall ribbon per mountain that faces a lake within 12 m, animated by the shared breeze clock and frozen under reduced motion.

### Trees (`athena-assets/code/families/nature.mjs` + `src/village/botanical.ts createGroves`)

- Kit assets: `athena-tree-broadleaf.glb` (crown = smooth-min union of 5 to 7 lobes stepped toward +X like a staircase, at most 300 triangles; trunk = a leaning sweep with a root flare and one branch; parts named `crown`, `trunk`, `branch`), `athena-tree-cypress.glb` (stacked rings tapering to a soft point), `athena-tree-blossom.glb` (lower, wider crown in blossom pink; placed only within 9 m of a topic house), plus a crown LOD at most 120 triangles per species and an `athena-islet.glb` (a floating rock with a grass cap, one tiny spire, a waterfall thread baked in vertex colour, at most 1.5k triangles).
- Runtime: keep `createGroves(ctx, root, points, time)` synchronous and manifest-free (placeholder geometry until the GLB resolves, then swap `geometry` and recompute bounds). One instance per tree for the crown (update the landscape test from `points x 6` to `points` plus a fringe count in the same change), a `fringe` InstancedMesh of 6 alpha cards per tree using the painted foliage atlas via `toonCardMaterial` with spherical normals, trunks as curved sweeps, bark and leaves in the toon program (`toonMaterial` + `windMaterial`), the shadow proxy pattern kept. Species by `i % 3` with the blossom rule above; ginkgo gold tint on one tree in twenty via instance colour.
- Crown vertex colour: deep foliage at the bottom, light foliage at the top; never a flat colour.

### Meadows (`createMeadows`)

- One tuft card cross per point instead of three ribbons; tuft region of the foliage atlas; two greens plus a straw tint near paths; wind through `windMaterial`.
- Flowers: five species from the atlas, per-instance atlas offset, fewer and larger than today; none on the low tier.

### Water (`src/village/water.ts`, fragment body only)

- Depth tint using the shared sky/ground uniforms, Fresnel reflection of the sky colour (use `SKY_GLSL` from `shade.ts`), two foam bands (shoreline, drifting line), sparkle kept small, NaN guard, tonemapping includes kept.

### Bridges and terraces (`src/village/bridges.ts` new, extracted from `scene.ts`; `src/village/terrace.ts`)

- Bridges: keep the deck sampling along `walkingRadius`; arched planks with baked grain, swept rope rails with posts every fourth plank, a lantern post at each end whose lamp material is `window_glow`.
- Terraces: keep the `floors` records and the four-step geometry exactly; replace the skirt with stone courses, chamfered coping and a moss line in vertex colour.

### Clouds and islets (`createCloudBelt`)

- Four authored cloud silhouettes selected by seed, two-tone painted edge (flat violet underside, sun-lit top ridge). Keep the group name and rotation. Add five to seven islet instances at `RADIUS + 16` to `+ 24` on the tilted ring, high tier only, visual only.

## Placement rules (all from `layout.ts`)

Nothing new blocks a path: only the existing boulder set registers obstacles. Visual masses live where `mountainHeight > 1.25`, where `waterDepth > 0.5`, or above head height. Use `scatter`, `pathDistance`, `waterDepth`, `mountainHeight`, `buildingClearance`, `inWelcomeCourtyard`, `canOccupy` exactly as the existing code does; never hard-code positions that ignore them.

## Budgets

Crown at most 300 triangles (LOD 120), trunk 60, fringe 6 cards; cliff shell variant at most 400 triangles instanced; islet at most 1.5k; rocks per part at most 250. Scene after this brief: at most 320 draw calls and 1.1 M triangles at high quality, 450k at low. Terrain no longer casts shadows (saves 147k shadow triangles). Measure with the harness report.

## References

- Cliff plateaus with grass caps, layered crowns, waterfalls: `genshin-impact-landscape-3840x2160-dbfecd33a0cc.jpg`, `Genshin-Impact.jpg`, `images (2).jpg`.
- Cloud sea, far mountain made of cloud, arches: `004_Sky.webp`.
- Floating islet with a tower: `images (1).jpg`.
- Haze and dusk village massing: `VillageofDreams.webp`, `ss_8bd81babf9cb486548f9e0c24204cdc353d5ef66.1920x1080.jpg`.

## Acceptance checklist

1. World shots `grove`, `mountain-cliff`, `lake-crystals`, `bridge`, `plaza-arrival`, `overview-globe` reviewed: horizon has shapes, crowns read as crowns at distance, no flat ground.
2. No new geometry on walkable ground without an obstacle; navigation and landscape tests green (update the canopy count assertion in the same change).
3. Reduced motion freezes water, wind, waterfall, clouds.
4. Low tier renders without cliffs, islets, flowers, and under 450k triangles.
5. Budget report and harness report green; terrain `castShadow` false.
6. Palette within the world swatches; crowns show a bottom-to-top gradient.

## Ownership and commands

Files: `athena-assets/code/families/nature.mjs`, `athena-assets/code/paint/*` (atlas tweaks only), `src/village/terrain.ts`, `src/village/water.ts`, `src/village/cliffs.ts`, `src/village/bridges.ts`, `src/village/terrace.ts`, `src/village/botanical.ts`, the integration lines in `src/village/scene.ts` (imports, bridge extraction, cliffs and rock calls, `low` pass-through), `tests/village-landscape.test.ts` updates. Nothing else.

Commands: `pnpm --filter @athena/engine3d generate:kit --only=nature`, `pnpm --filter @athena/engine3d build:assets --strict`, `pnpm --filter @athena/engine3d review:render --world --assets=nature --port 3100`, engine tests, `pnpm typecheck`, `pnpm lint`.

Return: contact sheets, before/after `--compare` sheets for the world shots, the harness report numbers (draw calls, triangles at both tiers), tests, and the list of deliberate asymmetries.
