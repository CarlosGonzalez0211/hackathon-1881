# Brief D: civic buildings, props, plaza, spirit dressing

Read `docs/art/ART_DIRECTION.md` first (rules 2, 3, 5; sections 4.2, 4.4). This brief regenerates the civic buildings and props the village places (`src/village/scene.ts place(...)`), and resculpts the in-code plaza gate, spirit dressing, banners and the windmill. File names and manifest keys stay the same.

## Civic buildings (`athena-assets/code/families/buildings.mjs`)

Each building has exactly one iconic feature that reads at 64 px, shares the topic-house anatomy (plinth, bulging body, swooping roof, timber ribs) at a larger scale, and keeps its current footprint class (the village fits colliders and terraces to measured bounds; the layout's `footprint` per landmark is the maximum radius).

| File                                                                          | Iconic feature                                                                  | Roof                                      | Light                                                                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------- |
| `athena-building-school-hall.glb`                                             | twin lantern towers flanking a wide porch                                       | low saddle between the towers, terracotta | tower lanterns `window_glow`                                                        |
| `athena-building-library.glb`                                                 | stacked rotunda of two drums with book-spine ribs (alternating timber and gilt) | low teal dome with a reading lantern      | oculus `window_glow`                                                                |
| `athena-building-greenhouse.glb`                                              | curved glass lattice vault                                                      | the lattice is the roof                   | warm interior glow via `window_glow` glass panes (opaque emissive, not transparent) |
| `athena-building-workshop.glb`                                                | waterwheel on one flank and a leaning chimney                                   | terracotta swoop                          | forge glow in the doorway                                                           |
| `athena-building-observatory.glb`                                             | brass-ringed dome that is slightly open, on a tall drum                         | dome in teal with gilt meridians          | a lit slit in the dome                                                              |
| `athena-building-cottage.glb`                                                 | moss roof with a crooked chimney and a round door                               | thick moss swoop                          | one window                                                                          |
| `athena-building-market-stall.glb`                                            | striped cloth awning (sweep-based folds, `awning` material moves in wind)       | awning                                    | none                                                                                |
| `athena-building-well.glb`                                                    | stone ring with a timber frame and a bucket on a rope                           | small roof                                | none                                                                                |
| `athena-building-gate.glb`, `-bridge.glb`, `-stairs.glb`, `-wall-segment.glb` | unused by the village; leave on the committed files                             |                                           |                                                                                     |

Budgets: large (school hall, library, observatory) at most 8k triangles and 140 KB; small ones at most 3k and 60 KB.

## Props (`athena-assets/code/families/props.mjs`)

`athena-prop-lamp-post.glb` (curved iron arm, paper lantern `lantern_glow`), `athena-prop-bench.glb` (curved slats, cast-iron ends), `athena-prop-topic-sign.glb` (hanging sign on a bracket, `sign_board` plain), `athena-prop-crates-books.glb` (soft-edged crates, book stacks with coloured spines), `athena-prop-post-box.glb`, `athena-prop-potted-plant.glb` (SDF foliage clump), `athena-prop-insight-lantern.glb` (the celebration lantern: a lathe body with a glowing core `beacon_gold`). Each at most 1.2k triangles. Barrel, fence, notice board and path marker are unused: leave them.

## In-code dressing (runtime)

- `src/village/welcome.ts`: keep the contracts (one camera obstacle, no obstacles, `halo_gate_crest`, ground-conforming double-sided floors with upward normals and no ink). Resculpt: a petal-profile halo ring (`lathe`), a carved stone arch with a floating gilt ring, four orbiting rune glyph cards (`toonCardMaterial`, emissive), banners on the cape shader instead of canvas textures, mosaic floor cells baked in vertex colour.
- `src/village/spirit.ts`: keep signature and placement predicates. Batch every shrine, monolith and crystal group with `mergeStaticMeshes` before toon conversion; flames as one instanced mesh; monoliths tapered with rune bands; crystals as soft-faceted shards; mantas keep their shader with a NaN guard.
- `src/village/ambience.ts createBanners`: cape shader instead of canvas textures; keep the callback contract.
- `src/village/landscape-life.ts`: resculpt the windmill (tapered tower, cloth sails) and the lily pads; keep `rotor.rotation.z = -time * 0.28` exactly (test).

## Rules

- Silhouette first: at 64 px each building is told apart by its iconic feature.
- Soft mass, crisp accent: bodies bulge; ribs, rings and ridges are thin and crisp.
- Deliberate asymmetry: one leaning chimney, one longer awning flap, one off-centre lantern per building. No random jitter.
- Palette within the world swatches; roofs alternate teal and terracotta across the village so no two neighbours match.
- All materials `MeshStandardMaterial`; emissive names from the contract (`window_glow`, `lantern_glow`, `beacon_gold`, `gilt`); wind names (`awning`, `banner`, `pennant`, `leaf`).

## References

- Timber-and-tile civic massing, towers and gates: `c38a244c8402a5296d0c3fae2f0b3567ecf7e73e.jpg`, `images (2).jpg`, `Genshin-Impact.jpg`.
- Stone shrines, carved stones with runes, lantern plazas: `004_Sky.webp`, `reika-yoshino-thumbnail02.jpg`, `ss_8bd81babf9cb486548f9e0c24204cdc353d5ef66.1920x1080.jpg`.

## Acceptance checklist

1. 64 px silhouette test for the eight civic buildings.
2. Asset sheet at four yaws: no boxes with cones, visible bulge and scallops, crisp accents.
3. `plaza-arrival` world shot: gate, mosaic, banners and monoliths read as one composition; spirit batching reduces draw calls (report before/after).
4. Landscape and navigation tests green (bridge approaches, courtyard winding, windmill motion).
5. Budgets green.

## Ownership and commands

Files: `athena-assets/code/families/buildings.mjs`, `athena-assets/code/families/props.mjs`, `src/village/welcome.ts`, `src/village/spirit.ts`, `src/village/ambience.ts` (banners only), `src/village/landscape-life.ts`. Nothing else.

Commands: `pnpm --filter @athena/engine3d generate:kit --only=buildings,props`, `pnpm --filter @athena/engine3d build:assets --strict`, `pnpm --filter @athena/engine3d review:render --assets=buildings,props --world --port 3100`, engine tests, `pnpm typecheck`, `pnpm lint`.

Return: contact sheets, draw-call before/after for the plaza shot, budget rows, tests, asymmetry list.
