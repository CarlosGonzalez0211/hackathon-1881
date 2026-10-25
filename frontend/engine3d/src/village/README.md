# Athena village

The surface entry point builds an authored spherical world from Athena GLBs.
They reuse the extracted rendering primitives, GLB loader, toon materials, and animation
clips without constructing Messenger's world or replacing its scene objects.

- `layout.ts` defines the compact 22 m radius terrain, connected paths, river crossings,
  three deep lake basins, mountain ridges, building foundations, and deterministic vegetation.
- `scene.ts` builds the village. Six topic houses use status-specific models at
  2.5 scale; trees use the authored sculpted-grove renderer. All twelve
  civic buildings include markets beside the school and workshop and cottages between topics.
  Unattached decorative wall segments have been removed.
- `walker.ts` advances along the sphere with pole-safe orientation, fixed movement
  steps, jumping, and obstacle sliding. Deep water and steep peaks block entry;
  bridge decks remain walkable. Building colliders use each loaded GLB's measured bounds.
- `water.ts` renders a separate water surface over carved beds, with vertex waves,
  toon depth bands, moving ripple strokes, and shoreline foam. Reduced motion freezes it.
- `terrain.ts` paints grass, sand paths, shorelines, and rock strata on a single smooth
  terrain mesh. There are no overlapping road ribbons. Rounded ridge geometry, colour
  shapes, and drawn contour accents replace the previous faceted mounds.
- `terrace.ts` gives buildings connected stone foundations and steps without raising
  nearby ground into foundation ridges. Stair tops are supplied to the walking controller.
- `look.ts` adds subtle architectural wear and synchronised foliage/ink-hull wind.
- `atmosphere.ts` supplies a gravity-aware illustrated sky, drifting cloud shapes,
  a sun disc, and a warm horizon. Surface lighting uses a warm key, cool fill, and haze.
- `shade.ts` shares shading with the pieces the toon conversion cannot reach. `toonCardMaterial`
  builds alpha-card materials (spherical per-instance normals via `aCardNormal`, lit on both
  faces, optional wind) and `loadVillageTexture` loads their atlases. `SOFT_LIGHT_GLSL` and
  `softUniforms` let a hand-written `ShaderMaterial` light like the toon program, and
  `SKY_GLSL` is the sky palette `atmosphere.ts` splices into its shader. `geometry.ts` also
  gained `lathe` (scalloped profile revolve), `sweep` (tube along a curve, moved out of
  `lumen.ts`), `displace` and `bakeVertexColor` for the toolkit in `docs/art/ART_DIRECTION.md`.
- `ambience.ts` animates the kit's butterfly and bird clips, floating mote sprites,
  and topic banners. These effects freeze under reduced motion and dispose with the world.
- `surface.ts` connects walking, NPC intent, house intent, projected labels, sound,
  rewards, accessibility settings, and pause/disposal to the existing React interface.
  The close walking camera avoids building geometry and terrain; **V** preserves the aerial view.

The class orbit uses `scenes/orbit.ts` from `main`, including its original planet assets,
sun, starfield, paths, and motion. It does not construct village geometry.

Academic state continues to come from the existing world client. The engine does not
calculate mastery or decide topic unlocks. The accessible HTML topic list remains an
equivalent route to the existing house pages. NPC dialogue currently uses authored
frontend messages and records interaction intent through the existing client.

`tests/village-navigation.test.ts` checks spherical circuits, pole crossings,
frame-rate independence, path continuity, doors, collisions, jumping, bridge heights,
deterministic vegetation clearance, lake depth, mountain exclusion, and all 24 source
house models' entrance/path clearances at the larger scale. For a visual preview, open `/world?presenter=1`
in development; use **Ver planeta** or **V** to view the globe and **Temas** to open
the learning pages. Presenter controls use simulated demo progression.

River crossings run along the four public meridians, with a northern loop connecting
both banks. Civic buildings no longer have bridge spurs ending at their walls. The
navigation tests include each bridge and six metres of approach against all source
building bounds, connected platforms and stairs.

All nineteen NPC kit models and Lumen are placed around the neighbourhoods. Patrols
move at a measured walking speed, reverse at obstacles/endpoints, and pause near the
student. Their walk clip only plays when their position changes.

The asset builder normalizes Windows paths before deciding which models must retain
their hierarchy. Avatar parts and NPC rigs preserve their sockets; directly animated
meshes remain available to AnimationMixer. `tests/village-rig.test.ts` loads the actual
built outfit, checks its attachment nodes and pouch clearance, and compares hair and
both boots against the unmerged rig throughout a sprint cycle. The NPC hint and touch controls override the legacy full-canvas div layout so their
rounded backgrounds remain small UI elements.

Storybook environment upgrade:

- `botanical.ts` replaces the surface tree batches with sculpted, coloured crowns and
  curved trunks, plus instanced wind-swept grass and five-petalled wildflowers. Low-detail
  shadow proxies keep the smoother canopies affordable. This uses recovered primitives
  and authored shaders, without a second Three installation or new network assets.
- `landscape-life.ts` places a working windmill away from roads and gently animated lily
  pads/lotus flowers in the actual lake basins. Ponds and sails freeze under reduced motion.
- `geometry.ts` supplies a tapered lathe from BufferGeometry; the recovered bundle has no
  CylinderGeometry class. All generated assets belong to the scene disposal lifecycle.
- The continuous terrain has broad meadow washes, brush marks, irregular path shoulders,
  softer stone strata, and warmer stone terraces with clipped corners. Water has moving
  ribbons, caustics, depth colour, lapping foam and small glints.
- Walking and aerial cameras share the same sunlit illustrated sky, cloud palette and
  animation clock. The overhead camera frames that sky in camera space, so pointing
  towards the globe does not turn the background into a dark or flat horizon. A painted
  cloud belt moves around the globe. The original class orbit is unchanged.
- `tests/village-landscape.test.ts` builds the generated scene with the actual recovered
  graphics classes, checks finite geometry/instance matrices and culling bounds, verifies
  windmill/cloud motion and reset, and checks the bridge approaches remain open.

Character art pass:

- `scripts/refine-characters.mjs` authors smoother faces, small storybook eyes,
  swept Bezier hair locks, tailored cloth profiles, thumbs and sculpted boots into the
  built GLBs. Source kit files remain intact. Its content hash invalidates the build cache.
- Knees and elbows are new rig sockets in both the base and outfit parts. Derived clip
  channels articulate them during walk, sprint, jump and sitting, while hair follows
  the head and moves slightly with locomotion. Blinking plays on a separate face node.
- `scripts/story-explorer.mjs` gives the student an open hood, ochre poncho, trousers,
  hiking boots, canvas backpack, bedroll, maps, lantern and field journal. Gear attaches
  to the head, torso and articulated hands. Poncho motifs use a separate UV attribute
  and fragment shading, keeping their borders crisp during movement.
- `athena/character-look.ts` shades material categories carried through batching in a
  custom vertex attribute. Warm skin shadows, quieter ink and soft hair highlights
  are limited to characters. Character faces avoid low resolution shadow-map acne.
- The attachment test also verifies knees, blinking during sprint and material masks.
  The higher fidelity character set currently puts the conservative uncompressed
  first-load estimate at about 9.6 MB against the existing 8 MB target.

Arrival and interface:

- `welcome.ts` builds a tall carved arch, compass crest, waving banners, lanterns and
  a ground-conforming mosaic courtyard. Its floor is double-sided and excluded from
  ink hulls. The landscape test checks floor winding, terrain fit and the open passage.
- Optional benches are placed using their measured bounds and clearance from paths,
  doorways, water and the arrival plaza; a blocked location is relocated or omitted.
- House labels project directly to persistent DOM nodes every rendered frame, outside
  the slower status updates. Only their decorative icon pulses; reduced motion disables it.
- The web interface uses locally bundled Comfortaa, illustrated paper navigation cards,
  compact keyboard hints, native modal NPC dialogue and paper alerts. Topic pages pair
  material cards and learning tabs with a code-native illustrated island. Academic
  progression and server authorization are unchanged.

Luminous art pass (Sky-inspired):

- `grade.ts` routes the surface through the recovered pmndrs composer: a NaN/Inf scrub,
  depth-aware aerial haze, 16-sample screen-space light shafts, mipmap bloom, ACES and a
  split-tone grade. `light.ts` owns the shared golden-hour sun and the quality tier
  (`?quality=low|high`, automatic downgrade under 42 fps).
- The village toon pass runs in soft mode (`athena-toon-material.ts`): a linear half-Lambert
  ramp, radial sky/ground fill, cool shadow tint and a silhouette-only backlit rim. Ink hulls
  are off for the village; the class orbit keeps the original toon defaults.
- `scripts/smooth-normals.mjs` gives faceted kit solids crease-aware smooth normals at build
  time. Simplification is gentler but unused vertex attributes are pruned and meshopt runs
  at its highest level; the surface first load stays under the 8 MB budget.
- `atmosphere.ts` paints the sky in linear light; `botanical.ts` clouds are sun-lit sphere
  impostors with a tilted bank ring; `ambience.ts` motes rise and bloom.
- `cloth.ts` gives every person a spring-driven cape; `lumen.ts` sculpts Lumen from smooth
  forms over the hidden kit rig; `spirit.ts` adds floating monoliths, candle shrines, lake
  crystals and gliding light mantas, none with a footprint on the paths.
- `welcome.ts` is a floating halo gate over the round plaza. House windows glow by learning
  status (`scene.ts`), colliders follow ground footprints and foundations are walkable.
- `waypoint.ts` marks the next topic with a light column and a HUD medallion that docks to
  the screen edge; NPCs are spread over the whole globe and the nearest target wins, except
  that Lumen never hides a door.

Render review (art direction, `docs/art/ART_DIRECTION.md` section 9):

- `shots.mjs` (types in `shots.d.mts`) lists the twelve deterministic world shots. Opening
  `/world?shot=<id>` poses the student and the camera, hides the HUD and the touch controls,
  freezes the clock (`shot.time`, default 0), stops every animation at its first pose, disables
  the quality auto-downgrade and sets `dataset.athenaShot` on the canvas once three composed
  frames are out. `window.__athenaShot.go(idOrShot)` re-poses without a reload; `.list()` and
  `.stats()` (draw calls and triangles of one main pass, fps) are exposed too. Without
  `?shot=` none of this runs. The camera of a shot only avoids the ground, not walls.
- `/dev/asset?key=<manifest key>&yaw=&elev=&fit=&grid=1&ref=1&clip=&t=&quality=` (dev only, 404 in
  production) renders one GLB through the same loader, toon pass, lights and HDR grade
  (`src/scenes/asset-viewer.ts`, exported as `@athena/engine3d/dev`). The model stands at
  `(0, RADIUS + 0.2, 0)` at its in-game scale, with a paper ground disc, an optional 1 m grid and an
  avatar silhouette for scale. Its draw calls and triangles are static counts of the asset.
- `pnpm --filter @athena/engine3d review:render -- --world --assets=buildings,npcs --yaws=0,180 --port 3100`
  drives both with Playwright (SwiftShader) and writes `frontend/engine3d/review/<run>/`
  (PNG tiles, `report.json`, `index.html`, `contact-*.png`, and `compare-*.png` with
  `--compare=<run>`) plus `review/latest`. Options and timings are in the header of
  `scripts/render-review.mjs`.
