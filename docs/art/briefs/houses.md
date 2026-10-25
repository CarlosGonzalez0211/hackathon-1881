# Brief A: topic houses (hero asset)

Read `docs/art/ART_DIRECTION.md` first. This brief produces the 24 topic-house GLBs (6 silhouettes x 4 learning states) through the kit generator, replacing the cylinder-and-cone houses in `athena-assets/models/buildings/athena-house-<status>-v<n>.glb`. File names, manifest keys and runtime contracts stay the same.

## What a topic house is

A small scholar's house on a personal planet. The student walks up to it; its door faces the path. Its light tells the student where they stand with that topic. Six variants exist so neighbouring houses never look stamped; the same variant index is always used for the same slot (`v<n>` = slot).

## Shared anatomy (all variants, all states)

1. **Plinth**: a round or softly squared stone base, 1.1 to 1.3 m radius at kit scale, 0.22 m tall, with a visible top rim. Three steps toward +Z: widths 1.5 / 1.25 / 1.0 m, each tread curved slightly downward at its front edge; the lowest step may spread into a half-ring of flagstones. Sandstone warm, darker at the ground (baked gradient). Material `stone_plinth`, `stone_step`.
2. **Body**: a plaster mass 1.8 to 2.0 m across that bulges 3 to 5 percent at mid height and tucks in under the eaves (a lathe on an S-profile with at least one inflection, or a soft-square cage with the same bulge). Never a straight-walled cylinder. Timber ribs (4 to 8 sweeps, 0.06 m) follow the bulge. A base band and a floor band in timber. Material `wall_plaster`, `timber`.
3. **Windows**: one oculus (round, 0.28 m) with a gilt ring on the upper third facing +Z or slightly off-axis, two to four arched windows below. Lit windows use material `window_glow`; unlit use `window_unlit` (dark slate glass). Frames in timber.
4. **Door**: an arch 0.5 m wide, 0.9 m tall at +Z with a frame and a step. The doorway panel (inside the frame) is `window_glow` when the house is open, dark when locked. Door leaf in `door` timber, with a `gilt` knob.
5. **Roof**: a concave swoop with upturned eave corners. The eave rim is scalloped with the plan's fold count (6, 8 or 12). Three to five ridge lines in the darker roof tone imply tiles. Material `roof_tile` (glazed: receives the sheen) and `roof_ridge`. A finial post carries a lantern cage.
6. **Lantern**: a small paper lantern on a curved iron arm beside the door (`lantern_glow` when lit, `lantern_paper` when not), 0.22 m tall.
7. **Dressing**: a flag or banner (`banner`, moves in wind), vines (`vine`, tips `vine_bloom`), a roof garden (`garden_*`), chimney with `smoke` puffs, a doormat, a potted plant. Everything stays inside the plinth footprint in XZ; roof dressing grows only upward.

## Six silhouettes (roof decides)

| v   | Name               | Roof                                                                      | Plan          | Height | Notes                                                                        |
| --- | ------------------ | ------------------------------------------------------------------------- | ------------- | ------ | ---------------------------------------------------------------------------- |
| 0   | Swoop cone         | single concave cone with a flared skirt, finial lantern                   | 8-fold round  | 3.9 m  | the archetype; the skirt overhangs 0.25 m                                    |
| 1   | Pagoda             | two tiers, upper tier 60 percent of the lower, both with upturned corners | 6-fold round  | 4.3 m  | gap between tiers shows a timber drum with `window_glow` slits               |
| 2   | Onion dome         | onion dome with a slim spire and a gold bead                              | 12-fold round | 4.2 m  | dome in roof tile with four gilt meridians; body slightly taller and slimmer |
| 3   | Saddle gable       | saddle (gable with sagging ridge), crossed ridge beams at both ends       | soft square   | 3.8 m  | eaves flare at the gable ends; chimney off-centre                            |
| 4   | Spire with balcony | tall pointed spire above a ring balcony with a timber railing             | 8-fold round  | 4.4 m  | balcony lantern; body narrower (1.7 m)                                       |
| 5   | Garden dome        | low dome with a flat roof-garden terrace in front of it                   | soft square   | 3.4 m  | terrace has a low stone parapet; widest plinth                               |

Silhouette test: at 64 px black-on-white all six must be told apart by the roof alone. No two roofs may share the same top shape.

## States as light

| State         | Body and roof                                                                         | Door and windows                                                             | Light                                                                                          | Dressing                                                                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locked`      | walls in cool stone (`wall_stone`), roof in slate violet, shutters closed (`shutter`) | door closed, no boards, no doorway glow, all windows `window_unlit`          | none emissive except one thin cold rune band on the plinth (`rune_cold`, emissive teal at 0.5) | dry ivy (`vine_dry`), no flag, no lantern flame (`lantern_paper`)                                                                                                                           |
| `available`   | cream plaster, primary roof                                                           | door ajar 35 degrees, doorway `window_glow`, lower windows unlit, oculus lit | one lantern `lantern_glow`                                                                     | small flag, swept step, one potted plant                                                                                                                                                    |
| `in_progress` | cream plaster, primary roof                                                           | door open 70 degrees, all windows `window_glow`                              | lantern lit                                                                                    | vines with buds climbing two ribs (`vine`, tips `vine_bloom`), a wooden frame on the roof edge with three glowing threads (`loom_thread` = `window_glow` material), chimney smoke (3 puffs) |
| `done`        | cream plaster, roof with gilt ridge lines and gilt finial (`gilt`)                    | door open, all windows `window_glow`                                         | lantern lit, finial beacon (`beacon_gold`)                                                     | roof garden in bloom (`garden_leaf`, `garden_bloom`), banner, four floating motes (`mote`, small emissive spheres above the roof)                                                           |

Roof colour: variants 0, 2, 4 use roof teal; 1, 3, 5 use terracotta; locked always slate violet.

## Runtime contracts (must hold)

- Pivot at base centre, +Y up, +Z is the door. Units metres at kit scale (the village renders houses at scale 2.5).
- Full scene bounds within 3.9 x 3.15 m (XZ) and 4.4 m (Y). Steps count toward the Z extent.
- Material names: `window_glow` (weight 1), `lantern_glow` (0.6), `beacon_gold` (0.35), `gilt` (0.2), `vine_bloom` (0.15) are matched by the runtime to breathe with status. Every emissive material must set `emissive` and `emissiveIntensity` (0.8 for glow, 0.25 for gilt). All materials are `MeshStandardMaterial` with `vertexColors` where baked; no textures, no ShaderMaterial, no transparency except `smoke` (opacity 0.55) and `mote`.
- Materials matching `/tile|glaze/` get the glazed sheen; `/banner|pennant|vine_tip|leaf/` move in the wind; keep those words in the names listed above.
- Budget per house: at most 6k triangles after the build's simplification and 110 KB after meshopt; generate at most 14k triangles raw. The six "done" variants are the heaviest; the build report must stay green.

## Toolkit to use

Body and roofs: `lathe` with Catmull-Rom profiles and `scallop`; soft-square plans via a `cage` subdivided twice. Ribs, vines, iron arms, ridge beams: `sweep`. Garden and ivy clumps, smoke: `sdf` unions. Rocks of the flagstone ring: `cage` + `noise`. Vertex colour: `bake` height gradient on the body (darker 12 percent at the base), occlusion under eaves, moss on +Y stone. Normals: crease-aware with a 55 degree threshold so eave edges stay crisp.

## References

- Roof swoops, upturned eaves, gilt ridges: `c38a244c8402a5296d0c3fae2f0b3567ecf7e73e.jpg`, `header_alt_assets_2.jpg`, `images (2).jpg`.
- Stone plinths and steps, lit doorways at dusk: `VillageofDreams.webp`, `reika-yoshino-thumbnail02.jpg`.
- Single lantern as the only light, scale of door to figure: `004_Sky.webp`.
- Do not copy any building from these images; take the principles (proportion, how light sits in the composition).

## Acceptance checklist

1. 64 px silhouette test passes for all six variants.
2. The four states of one variant read correctly side by side with the lights off (shape and colour alone) and with the lights on.
3. Door at +Z, three steps, doorway glow present when open; no geometry outside the footprint; nothing floats above the plinth without support.
4. Every body profile has a visible bulge; no straight cylinder walls; eaves scalloped and upturned.
5. Palette within the world swatches; at most five roles plus gold and one emissive per house.
6. Material names match the contract (automated test `kit-materials.test.ts`).
7. Budget report green; navigation test (`village-navigation.test.ts`) green at scale 2.5; crossfade works in the world (status change in presenter mode).
8. World shots `house-locked`, `house-available`, `house-in-progress`, `house-done` and the `buildings` contact sheet reviewed and signed off.

## Ownership and commands

Files: `frontend/engine3d/athena-assets/code/families/houses.mjs` (new), registry entries for the `houses` family, `frontend/engine3d/src/village/houses-look.ts` (new: `dressHouse(model, status)` applying wind to `/banner|pennant|vine_tip|leaf/` and the glaze flag), the `lightWindows` name extension and `LAMP.done.base` retune (2.6 to 2.2) in `src/village/scene.ts` (only those lines), `tests/kit-materials.test.ts`. Nothing else.

Commands: `pnpm --filter @athena/engine3d generate:kit --only=houses`, `pnpm --filter @athena/engine3d build:assets --strict`, `pnpm --filter @athena/engine3d review:render --assets=buildings --world --port 3100`, `pnpm --filter @athena/api exec tsx --test ../../frontend/engine3d/tests/*.test.ts`, `pnpm typecheck`, `pnpm lint`.

Return: the contact sheet paths, the budget report rows for the 24 houses, test results, and a list of every deliberate asymmetry you placed (rule 5).
