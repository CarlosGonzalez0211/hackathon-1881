# Claude Code prompt — Implement the Athena asset kit in hackathon-1881

Copy everything below the line into Claude Code, run from the repo root. First:
1. Unzip `athena-assets/` into `frontend/engine3d/athena-assets/`.
2. Put `GAMEPLAN.md` and `ATHENA_SUBSYSTEM_IMPLEMENTATION_PROPOSAL.md` in `docs/`.

---

You are implementing the Athena art replacement for this repo. All Messenger (abeto) art must be swapped for original Athena assets that I'm providing in `frontend/engine3d/athena-assets/`. The engine logic stays; only the assets, the loaders that read them, and the brand tokens change. Work slot by slot and keep the app running at every commit.

## Approach: keep Messenger's world, swap the art (read this first)
- **Keep the existing world structure exactly as it is.** That covers the planet layout, terrain chunk placement, paths, collision, camera, controls, NPC spawn points, building batch positions, day/sky setup, and the intro → surface → orbit flow. Our world is the one already available in the repo. Do **not** redesign the layout, generate a new map or move things around.
- **Replace only the 3D assets**, in place: every mesh, texture, sound, font and icon a slot loads becomes its Athena equivalent from `asset-manifest.json`. Same slot, same transform, new file.
- **It must look seamless.** No one should be able to tell where Messenger ended and Athena began.
  - **Scale/pivot:** match each replacement to the original's bounding box at that slot. Read the legacy mesh bounds at runtime once, log them, and store per-slot `scale`/`offset`/`rotationY` overrides in `athena-placement.ts`. Characters stand on the ground; houses sit on their plinths; nothing floats or clips.
  - **Ground contact:** snap props, trees and buildings to the terrain height under their pivot. Re-check after the terrain swap.
  - **One look:** apply the Athena toon + ink-outline material (task 11) to *every* Athena mesh, and to any legacy mesh still on screen during the transition, so mixed scenes share one look. Use the same lighting rig, fog colour (`--athena-sky-horizon`) and LUT (`lut-athena-256x16.png`) everywhere.
  - **Building batches:** Messenger's buildings and foliage are merged into batch meshes. Don't keep them. Replace each batch by instancing our buildings, trees, rocks and props at the batch's original sub-mesh positions (derive them from the batch geometry's connected components or bounds). Keep density and silhouette rhythm similar.
  - **Terrain:** if a tile's shape doesn't line up with the original collision and paths, keep the *original collision mesh* and only swap the visual mesh + vertex colours. Gameplay must feel identical.
- If something has no Athena replacement yet, leave the legacy asset in that slot, still toon-shaded, and list it in `docs/MIGRATION.md` under "Pending". Never leave a hole.

## Who you're working for
I'm **Person 3** in `docs/ATHENA_SUBSYSTEM_IMPLEMENTATION_PROPOSAL.md`, owner of **Subsystem 3: World, Progression, and Collaboration** (section 5). You act as Person 3. Your scope is:
- Student planets and topic houses, world state and unlocks.
- Rewards, badges, achievements and collectibles, including the 6-badge set in 5.7. Badge SVGs follow the brand guide's icon rules.
- Quests and Easter eggs, NPC interactions and Lumen.
- Team challenges and shared milestones.
- The Athena 3D engine and asset pipeline (this whole art swap).

Stay inside Person 3's files:
- `frontend/engine3d/**` and `frontend/web/src/features/world/**`.
- On the backend, `backend/modules/world/**` and the world routes in 5.5.
- The world schemas in `shared/src/world.ts`.

Anything owned by Person 1 (curriculum), Person 2 (learning/mastery) or Person 4 (analytics/platform) is read-only: consume their contracts, mocks and events (`MasteryUpdated`, `AchievementUnlocked`…) and never edit their folders. If you need a change there, write it up in `docs/REQUESTS-P3.md` instead.

## Project docs Claude Code must follow
- `docs/GAMEPLAN.md`: product, folder ownership, the frozen contract (`PlanetState`, `HouseState`…), endpoints, mocks flag and per-person build order. Stay inside the 3D/world owner's folders. Drive the world only from `PlanetState` (houses, slots, status, growth). Implement `<Planet state mode="surface"|"orbit" onHouseClick onPlanetClick />` and open `<HouseSession>` on house enter.
- `docs/ATHENA_SUBSYSTEM_IMPLEMENTATION_PROPOSAL.md`, section 5 (World, Progression, Collaboration):
  - Follow the `frontend/engine3d/` file layout it proposes (`athena-manifest.ts`, `athena-gltf-loader.ts`, `athena-toon-material.ts`, systems/*).
  - Implement the `AthenaWorldEngine` interface (`updatePlanet`, `updateQuests`, `showAchievement`, `showEasterEgg`, `setAccessibility`, `dispose`).
  - Use the demo fixtures (Lucía, 6 topics, the insight-lantern achievement).
  - **The engine never fetches academic data or computes mastery.**
- If these docs conflict with this prompt on *world/assets*, this prompt wins. On *contracts, data and ownership*, the docs win.

## Brand guide = the rule for every frontend decision
The offline file `frontend/engine3d/athena-assets/docs/Athena Brand Guide.html` is the authority for **every** UI and frontend choice. Open it before any frontend work and cite the section you followed in each PR description.
- Colours, type, spacing, radii, shadows and motion come **only** from `tokens.css`/`tokens.ts`. No new hex values or fonts.
- Logo: the owl of the open book (`brand/`). Use the clear space, minimum sizes and misuse rules from section 02.
- Learning states (section 05): shape + text + colour, using the `--athena-locked|available|in-progress|done` tokens and the `state-*.svg` icons. Same labels in ES/EN.
- Screens (section 06): edge-anchored UI on solid paper veils, topic list always available, layouts as shown for student surface, topic entry, session and teacher orbit.
- Motion, camera and sound (section 07) and accessibility (section 08) are requirements, not suggestions.
- If something isn't covered by the guide, pick the closest existing pattern in it and flag it in the PR as "brand gap" rather than inventing a new style.

## Inputs (already in the repo)
- `frontend/engine3d/athena-assets/asset-manifest.json`: **source of truth**. `legacyToAthena` maps every legacy path from `references/messenger/asset-paths.json` (plus avatar/terrain/emoji slots) to its Athena file. Read it first.
- `athena-assets/models/**.glb`: 173 GLB files (glTF 2.0, meters, +Y up, +Z forward, pivot at base center, MeshStandardMaterial named by role, node animations embedded).
  - `avatar/`: `athena-avatar-base.glb` (body + face + clips) and 28 part GLBs `athena-avatar-{hair|top|bottom|shoes}-<variant>.glb`, plus `athena-avatar-acc-scarf-satchel.glb`. **All parts share the same node hierarchy**: `body > hip > {leg_l, leg_r, torso > {arm_l > hand_l, arm_r > hand_r, head > head_geo}}`. The mesh `userData.part` (in glTF extras) is `base|hair|top|bottom|shoes|acc`.
  - `npcs/`, `characters/`: 20 NPCs + Lumen the cat. Humanoids carry clips `idle, walk, run, sprint, air, afk1_lookaround, afk2_stretch, afk3_sit, talk, emote_wave`; animals carry `idle, talk`.
  - `buildings/`: `athena-house-{locked|available|in-progress|done}-v{0..5}.glb` (6 visual variants × 4 states; assign variant per topic-anchor index) + 12 buildings.
  - `terrain/`: 10 tiles (8×8 m) × `-lod0..3.glb` + `-collision.glb` (single mesh named `collision`).
  - `nature/`, `props/`, `items/` (delivery slots), `emotes/` (10, clip `pop`), `vfx/`, `space/` (planet, orbit, galaxy points, starfield points, intro symbol, start button). Birds have `flap` / `glide` clips; butterfly `flutter`.
- `athena-assets/textures/*.png`: replace the KTX2 slots (see manifest).
- `athena-assets/icons/*.svg`: UI, state, quest, NPC and emote icons.
- `athena-assets/audio/**.wav`: 54 sounds (22.05 kHz mono) for every legacy audio slot.
- `athena-assets/brand/*.svg`: final logo (owl of the open book): symbol, reversed, mono, small (≤20 px), app icon, lockups. Use these for favicon, header and app icons.
- `athena-assets/code/tokens.css`, `tokens.ts`: drop-in for `frontend/brand/src/`.
- `athena-assets/code/athena-models.js`: the procedural source that generated every GLB. Keep it as the canonical source, don't import it at runtime.

## Tasks

1. **Explore first.** Read `frontend/engine3d/src/assets/catalog.ts`, `config/{characters,world,rendering,audio}.ts`, `scenes/{surface,orbit}.ts`, and how Draco `.drc`, KTX2 and `.font`/`.icon` assets are loaded today. Summarise the loading pipeline back to me before editing.

2. **Asset pipeline.**
   - Add a build script `frontend/engine3d/scripts/build-athena-assets.mjs` that copies `athena-assets/` into the web app's public dir under `/athena/`. It should:
     - optimise GLBs with `@gltf-transform/cli` (`dedup`, `prune`, `weld`, `meshopt` or `draco`, `resize` not needed)
     - transcode PNG to KTX2 with `toktx`: ETC1S for color, UASTC for `water-normal`, `noise*`, `lut`. If `toktx` isn't installed, skip KTX2 and fall back to the PNG.
     - transcode WAV to OGG (`ffmpeg -c:a libvorbis -q:a 4`)
     - write a hashed `athena-manifest.runtime.json`
   - Wire it into the package scripts (`prebuild` / `predev`).

3. **Catalog switch.** In `assets/catalog.ts`, add `assetUrl(id)` that resolves through the Athena runtime manifest first and falls back to the legacy Messenger path. Add a flag `ATHENA_ASSETS=true` (default true) so we can A/B. Every loader call goes through `assetUrl`.

4. **Loaders.** Add a `GLTFLoader` path (with `MeshoptDecoder` / `DRACOLoader` and `KTX2Loader`, reusing the vendored decoders in `src/extracted/vendor`). Keep the legacy `.drc` loader alive until every slot resolves to GLB.

5. **Avatar.** Replace the Messenger skeleton + accessories system in `config/characters.ts`.
   - Load `athena-avatar-base.glb`, then for each selected part load its GLB and **graft meshes onto the base by node name** (walk the part's hierarchy; for every mesh, find the same-named parent in the base and reparent). Use one `AnimationMixer` on the base root.
   - Map legacy animation names: `idle→idle`, `run→run`, `sprint→sprint`, `air→air`, `afk1/2/3→afk1_lookaround/afk2_stretch/afk3_sit`, plus `walk`, `talk`, `emote_wave`. Crossfade 0.2 s.
   - Default outfit: `hair=bob, top=poncho, bottom=shorts, shoes=boots` + scarf/satchel accessory. Per the brief, this is developer-owned, not a student skin system. Keep the outfit config in code, not UI.

6. **NPCs.** Remap each `npcs/present/<slot>` to its Athena GLB per the manifest. Add the new slot `npc.cat` (Lumen) and place it beside the next available topic house. Play `idle` by default and `talk` during dialogue.

7. **Topic houses.** In `scenes/surface.ts`, the 6 `topic-anchor.*` slots load `athena-house-<status>-v<anchorIndex % 6>.glb` from `shared/src/learning.ts` status (`locked|available|in_progress|done`). On a status change, swap the model with a 0.9 s crossfade (opacity), and respect `prefers-reduced-motion` (instant swap). Topic names stay HTML labels, never baked into textures.

8. **Terrain.** Replace the 10 terrain chunks with `athena-terrain-<kind>-lod{0..3}.glb` via `THREE.LOD` (distances 0/20/45/90 m). Physics uses `-collision.glb`. Lay out a planet ring from the 10 tiles. If the current planet is a sphere, use `athena-planet-orbit.glb` for the orbit view and keep tiles for the surface view.

9. **Orbit scene.** In `scenes/orbit.ts`, load `athena-planet-orbit.glb` once and render the 8 student planets as `InstancedMesh` (one for land, one for ocean). Scale per instance by demonstrated topics. Use `athena-teacher-sun.glb` for the teacher star. Each student gets their own orbit radius, tilt and height offset (see `athena-orbit-class.glb` / `-varied.glb` for reference layouts). Planet types: `athena-planet-{earth|rocky|moon|gas|ringed|ice|ocean|desert}.glb`; default all `earth`, keep the type configurable per class. Target: ≤ 10 draw calls, ≤ 100k tris.

10. **Emotes, items, VFX, birds, sky.**
    - Emotes: keys 1–0 map to `athena-emote-*.glb`, played above the head with the `pop` clip.
    - Delivery slots map to `items/`.
    - VFX meshes keep the existing shaders but swap geometry.
    - Birds follow the curve GLBs: sample the tube's centerline, or rebuild a `CatmullRomCurve3` from its path.
    - Sky uses `sky-gradient-{day|dawn|dusk}.png` as a vertical LUT and `clouds-noise-512` for the dome.

11. **Toon look.** Add a shared `MeshToonMaterial` conversion (3-step gradient: 90/170/255, nearest filter) and an inverted-hull ink outline (back-face, view-depth-scaled normal offset ≈ 0.0028, color `#2B2936`). Skip transparent, Plane, Circle and Shape meshes and Points. Make it toggleable in `config/rendering.ts`.

12. **Audio.** Remap every `audio/*` key in `config/audio.ts` per the manifest (OGG from step 2). Audio stays off until first user gesture, with separate music/sfx volumes.

13. **Brand.**
    - Replace `frontend/brand/src/tokens.{css,ts}` with the provided files. They keep the existing token names and add `--athena-locked|available|in-progress|done`, the sky tokens, the type tokens and the motion tokens.
    - Load the fonts (Newsreader, Atkinson Hyperlegible Next, IBM Plex Mono) in `frontend/web/src/app/layout.tsx` via `next/font/google`.
    - Replace the Messenger `.font` / `.icon` usages with HTML text and the SVG icons.

14. **Cleanup and licensing.**
    - Once every manifest entry resolves to an Athena file, remove the Messenger runtime assets from the build output (keep `references/messenger/` for research only).
    - Add a `npm run check:assets` script that fails if any loaded URL is not under `/athena/`.
    - Update `docs/MIGRATION.md` with the slot table.

## Constraints
- Don't change gameplay, world layout, learning-state logic or APIs; this is an art and branding swap on top of the existing Messenger world structure.
- Every frontend decision follows the brand guide (see above).
- Progress visuals change only from teacher-authorised evidence (existing `learning.ts` status), never from time or clicks.
- Accessibility:
  - The keyboard path and 2D topic list still work.
  - Every state is shown with shape + text + color.
  - Reduced motion disables camera dollies, spin and particles.
  - Text is only drawn on solid UI veils.
- Budgets:
  - Surface view: ≤ 250k tris, ≤ 120 draw calls, ≤ 8 MB first-load download.
  - Chromebook: 30 fps.
- Commit per numbered task, with a short message. Run typecheck + tests after each.

## Definition of done
- The world layout, paths and collision are unchanged from the current build. Side-by-side screenshots from the same camera positions show the same composition with Athena art, no floating or clipped objects, and one consistent toon look.
- `npm run dev` shows the Athena world with no Messenger assets requested. Verify in the Network tab and with `check:assets`.
- The avatar walks, runs, idles and emotes. NPCs idle and talk. Lumen is present.
- The 4 house states render from real learning status.
- The orbit view renders 8 planets in ≤ 10 draw calls.
- All sounds play from Athena files.
