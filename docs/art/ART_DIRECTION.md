# Athena world art direction

Status: working document for the world art overhaul (student surface and characters). Owner: world/engine. The class orbit (`/orbit`, `src/athena/orbit.ts`, `src/scenes/orbit.ts`, `models/space/**`) is out of scope and must not change.

The direction borrows principles from Sky: Children of the Light, Genshin Impact and the Sky x Moomin collaboration, and applies them to an original Athena identity. No character, costume, symbol, building or scene from those games is reproduced. Reference images live outside the repository (see "References") and are never committed.

## 1. What we are fixing

The luminous village already has a capable rendering stack: a soft toon ramp with radial fill and backlit rim, HDR bloom, depth haze and light shafts, ACES with a split-tone grade, a painted sky. What reads as cheap is the form language. Every kit asset in `athena-assets/models/**` was assembled from primitives by `athena-assets/code/athena-models.js`: houses are a cylinder with a cone, trees are six spheres, people are capsules under a sphere, clouds are sphere clusters. The in-code scenery (`src/village/botanical.ts`, `spirit.ts`, `welcome.ts`, the bridges in `scene.ts`) uses the same vocabulary. The overhaul replaces that vocabulary with sculpted forms, keeps the stack, and tunes it.

## 2. Seven rules

Every asset is judged against these, in this order.

1. **Light is the story.** Learning state is expressed as light first and colour second. Locked is unlit stone. Available is one lantern. In progress is warm windows and visible growth. Done is a golden ridge and a garden. Bloom is reserved for meaning: windows, lanterns, runes, Lumen, the done ridge. Nothing else may exceed the bloom threshold.
2. **Soft mass, crisp accent.** Large forms are soft and slightly bulging: smooth-min unions, subdivided cages, curved lathe profiles, never a straight cylinder wall or a perfect sphere. Accents are crisp and thin: gilt ridge lines, timber ribs, hem trims, rune bands, window frames. Roughly one crisp line for every three soft masses.
3. **Silhouette first.** Each asset must be recognisable as a flat black shape at 64 px. Houses by roof profile, characters by hood, cape or hat, trees by crown shape, buildings by one iconic feature. No two topic-house variants may share a roof silhouette. When in doubt, exaggerate the top and simplify the middle.
4. **Weight at the ground, air at the top.** Bases are darker and denser: stone plinths, root flares, baked dirt and shadow gradients in vertex colour. Tops are paler and lighter: eaves, blossoms, banners, finials. This is what makes the references feel grounded and floating at once.
5. **Authored irregularity, never jitter.** Asymmetry is placed on purpose: one tilted chimney, one lantern off centre, uneven stepping stones, a longer branch on the sun side. Random per-vertex noise on everything is forbidden; it reads as procedural.
6. **Layered depth.** Foreground tufts and stones, mid-ground props and people, far cliff plateaus and floating islets, a cloud sea below. The horizon must contain shapes; an empty gradient horizon is a failure.
7. **Palette discipline.** No pure black, no pure white. The darkest value is ink `#2B2936`. Hues come from the world palette below; brand tokens (`frontend/brand/src/tokens.ts`) remain the anchors for UI and for the sky.

## 3. World palette

Values are sRGB display colours. Materials are flat vertex or base colours; variation comes from baked gradients and the paint shader, not from textures (foliage, grass and flower cards are the only textured surfaces).

| Role                        | Swatch                         | Use                                                   |
| --------------------------- | ------------------------------ | ----------------------------------------------------- |
| Ink                         | `#2B2936`                      | Darkest value anywhere: eye ink, deepest door shadow  |
| Stone cool                  | `#B9C4C8` to `#6F8491`         | Cliff faces, monoliths, locked houses, shaded masonry |
| Sandstone warm              | `#D9C3A3` to `#A88E6E`         | Plinths, steps, terraces, path edge stones            |
| Plaster cream               | `#F4E9D8`                      | House walls (available, in progress, done)            |
| Warm white                  | `#FBF3E4`                      | Eave undersides, banners, cloud tops                  |
| Timber                      | `#9C7356` / `#6E4F3C`          | Ribs, beams, rails, trunks, doors                     |
| Roof teal (primary)         | `#2F7D7A` to `#1F5856`         | Glazed tiles on most roofs (brand accent family)      |
| Roof terracotta (secondary) | `#C9785F` to `#9B5542`         | Every third roof, market awnings, cottage trims       |
| Slate violet (locked)       | `#5C5F7A` to `#3E4057`         | Locked house roofs and shutters                       |
| Foliage deep                | `#3F7A5B`                      | Crown undersides, shaded grass, moss                  |
| Foliage mid                 | `#6CA66E`                      | Default crown and grass                               |
| Foliage light               | `#A8C97A`                      | Sunlit crown tops, grass tips                         |
| Blossom                     | `#E9AFAA`                      | Blossom trees near houses, sparse                     |
| Ginkgo gold                 | `#E9C777`                      | One in twenty trees, autumn accent                    |
| Gold                        | `#F2C36B`                      | Finials, pins, charms, cape hems                      |
| Lantern                     | `#FFE2A6` (emissive `#F6C46A`) | Window and lantern glow                               |
| Done gilt                   | `#E9BC5C` (emissive `#C99232`) | Ridge lines and finials of done houses                |
| Shadow tint                 | `#AAB2E2`                      | Toon shadow band (cool), see shading                  |
| Water shallow / deep        | `#21918F` / `#06383F`          | Lakes and river                                       |

Rules: a single asset uses at most five roles plus gold and one emissive. Skin tones (`#F0CFB4`, `#E9C2A2`, `#D6A27E`, `#C99A7A`, `#B88462`, `#A5704F`, `#8D5B42`) are kept from the current cast so NPC identities survive.

## 4. Form language

### 4.1 Toolkit vocabulary

The generator (`athena-assets/code/`) provides these operations; briefs name them so builders do not fall back to primitives.

- **Profile lathe**: a revolved Catmull-Rom profile with optional n-fold scalloped rim. For walls, roofs, domes, pots, lanterns, skirts, hems. Every profile has at least one inflection (a bulge or a flare); straight profiles are not allowed except for timber.
- **Sweep**: a tube of varying radius along a curve. For branches, hair locks, scarf tails, rails, vines, tails, whiskers, smoke.
- **Cage + subdivision + displacement**: a hand-placed low-poly cage, Loop-subdivided twice, displaced by low-frequency noise, with crease-aware normals. For rocks, cliff slabs, hair volumes, roof gardens, cushions.
- **SDF union**: smooth-min unions of ellipsoids, capsules and rounded boxes, polygonised by marching cubes. For tree crowns, clouds, rock piles, heads and bodies, Lumen, bushes, pillows of moss.
- **Bake**: vertex colour from height gradient (dark base, light top), approximate cavity occlusion, and direction (moss on the sky-facing side of stone, dirt on the ground-facing side of walls).
- **Cards**: alpha-tested quads with painted atlas regions, normals aligned to a parent sphere so they shade as part of a mass. For leaf fringes, grass tufts, flowers, rune glyphs.

### 4.2 Architecture

- Plinth: round or soft-square stone base with three steps whose treads curve slightly downward at the front; the first step is the widest. Steps face +Z (the door).
- Body: a plaster mass that bulges 3 to 5 percent at mid height and tucks under the eaves. Timber ribs follow the bulge as sweeps. One oculus window with a gilt ring on the upper third, two to four arched windows below.
- Roof: a concave swoop with upturned eave corners; the eave rim is scalloped with the same fold count as the plan (6, 8 or 12). Tiles are implied by three to five horizontal ridge lines in the darker roof tone, not by individual tiles. A finial carries the lantern.
- Door: an arch with a visible frame, ajar when the house is open; the doorway material is `window_glow` so it reads as lit from inside.
- Dressing: lanterns on curved iron, a flag or banner, vines on ribs, a roof garden on done houses. Nothing may extend outside the plinth footprint; roof dressing may only grow upward.

Topic house variants are told apart by the roof: (0) single swoop cone with a flared skirt, (1) two-tier pagoda, (2) onion dome with spire, (3) saddle gable with crossed ridge beams, (4) tall spire with a ring balcony, (5) low dome with a roof-garden terrace.

### 4.3 Learning states as light

| State       | Walls and roof                                              | Door                        | Light                                                      | Dressing                                                                                                                                                |
| ----------- | ----------------------------------------------------------- | --------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| locked      | Slate violet roof, cool stone walls, closed shutters        | Closed, dark, no boards     | One thin cold rune band on the plinth, no emissive windows | Dry ivy, no flag. Beautiful, not broken                                                                                                                 |
| available   | Cream walls, primary roof                                   | Ajar, `window_glow` doorway | One lit lantern by the door (`lantern_glow`)               | Small flag, swept step                                                                                                                                  |
| in_progress | Cream walls, primary roof                                   | Open                        | Warm windows (`window_glow`), lantern                      | Vines with buds climbing the ribs (`vine_bloom` at the tips), a wooden frame on the roof edge with glowing threads instead of a scaffold, chimney smoke |
| done        | Cream walls, roof with gilt ridge lines and finial (`gilt`) | Open                        | Golden windows, lantern, finial beacon (`beacon_gold`)     | Roof garden in bloom, banner, motes                                                                                                                     |

Material names are a runtime contract (`src/village/scene.ts lightWindows`): `window_glow` (weight 1), `lantern_glow` (0.6), `beacon_*` (0.35), `gilt` (0.2), `vine_bloom` (0.15). Colour is never the only signal: shutters, doors, flags and gardens change too.

### 4.4 Landscape

- Terrain shape is frozen (it drives walking). Paint it: broad two-tone meadow washes, directional brush strokes toward the sun, a darker wet shoulder along paths, flagstones on the plaza, stone strata only on steep faces, lichen rather than snow on peaks.
- Cliffs: stacked rounded slabs in cool stone with grass caps, rising only where the ground is already unwalkable (mountains). Three or four plateau steps per peak, each lip slightly overhanging.
- Rocks: clusters of three to five merged boulders with a moss cap; talus below cliffs; small edge stones along paths; pebbles at shorelines.
- Trees: three species. Round broadleaf (a crown of five to seven merged lobes stepped like a staircase toward the light, with a card fringe), cypress spire (stacked rings tapering to a soft point), blossom tree (a lower, wider crown in blossom pink, placed near houses only). Trunks lean a few degrees, flare at the root and show one branch below the crown.
- Grass and flowers: tufts of five to seven curved blades in clusters near paths; five flower species as painted cards, fewer and larger than today.
- Water: depth-tinted with a sky reflection, two foam bands (shoreline and a drifting line), a wet-sand ring painted on the terrain.
- Bridges: arched wooden decks, swept rope rails, a lantern post at each end. Terraces: curved stone courses with chamfered coping and a moss line.
- Sky: painted gradient with cirrus and soft cumulus, a sun corona, a cloud sea below the horizon, three distant floating islets with a single spire each beyond the cloud belt.

### 4.5 Characters

- Proportions: adults 4.5 heads tall, children and the student 3.5. Shoulders narrower than the head is wide. Hands are mittens with a thumb; feet are sculpted boots with a rolled cuff.
- Head: a soft egg (sphere merged with a lower ellipsoid), small chin, cheeks that catch light. Eyes are large almonds with two highlights on a slight dome; brows are soft sweeps; the mouth is small. Faces stay unlit by the toon ramp (the existing eye rule) so expressions read in shadow.
- Hair: four to eight tapered swept locks over a smooth cap, never a sphere cap alone.
- Costume: every person wears a cape, hood or shawl in their signature colour (the runtime cape attaches to the chest). One signature prop. One gold detail (pin, charm, hem, buckle). Woven motifs only on the student's poncho (chevrons, through the existing weave contract).
- Student: hooded traveller, ochre poncho with a wavy hem and a chevron border, satchel, lantern staff in the left hand, field journal on the right hip.
- Lumen: a cat built as one smooth mass with a swept tail, a glowing collar charm and large calm eyes.
- Animals and the visitor keep their silhouettes (owl, hare, round visitor with antennae) but gain the same softness.

## 5. Shading and light

- Golden hour, sun about 25 degrees above the horizon ahead of the student, so figures are gently backlit and roofs and plateau caps still catch light.
- Two-band toon shadow: a deep cool band (`#9AA6E0`) and a warm core shadow (`#C9B2C6`), soft transitions. Warm bounce from the ground on undersides facing lit ground. A sheen only on glazed tiles.
- Emissives bloom but never blow out: pre-tonemap radiance is clamped, bloom threshold sits just above the sky.
- Haze cools with distance and warms toward the sun; far cliffs and islets are meant to dissolve into layers of light.
- Capes transmit the low sun when backlit.
- Reduced motion freezes every animated material and keeps the composition readable.

## 6. Budgets

| Asset                             | Triangles after simplify             | Bytes after meshopt |
| --------------------------------- | ------------------------------------ | ------------------- |
| Topic house                       | up to 6k                             | up to 110 KB        |
| Large civic building              | up to 8k                             | up to 140 KB        |
| Small civic, stall, well, cottage | up to 3k                             | up to 60 KB         |
| Character (total)                 | up to 7k (avatar base 5k, part 1.5k) | up to 60 KB per NPC |
| Tree crown + trunk                | up to 300 + 60, 6 fringe cards       | up to 40 KB         |
| Cliff shell variant               | up to 400                            | up to 30 KB         |
| Prop                              | up to 1.2k                           | up to 30 KB         |

Scene targets at high quality: at most 320 draw calls in the main pass and 1.1 M triangles per frame; low quality at most 450k. First load at most 8 MB.

## 7. Contracts every asset keeps

- Pivot at base centre, +Y up, +Z forward (the door), metres.
- Topic houses within a 3.9 x 3.15 m footprint and 4.4 m height; all materials `MeshStandardMaterial` (no shader materials) so status crossfades work.
- Characters keep the rig node names, part tags, joint sockets and clip names documented in `athena-assets/code/rig/`; custom attributes are named `athena_style` and `athena_weave` in the generator (the exporter prefixes the underscore).
- Material names drive behaviour: the glow names above; `/tile|glaze|lacquer/` receive the sheen; `/banner|pennant|vine_tip|leaf/` move in the wind; garment materials avoid `/skin|hair|eye|blush|lips|sole|shoe|paper|ink/` in their names.
- Nothing is placed where the ground is walkable unless it registers an obstacle; visual-only masses live on mountains, in deep water, or above head height.

## 8. References

Folder: `C:\Users\carlo\Downloads\Visual Style Inspiration for Hackathon` (local only, never committed).

| File                                                                                                                 | What to take from it                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `004_Sky.webp`                                                                                                       | Composition, stone-and-grass arches, a cloud mountain on the horizon, birds, scale of figures to architecture         |
| `A-Sky-Children.webp`, `images (3).jpg`, `images (4).jpg`, `unnamed.webp`                                            | Character silhouette: cape, hood, small face, glowing trims; cape translucency; campfire warmth                       |
| `genshin-impact-landscape-3840x2160-dbfecd33a0cc.jpg`, `Genshin-Impact.jpg`, `images (2).jpg`                        | Cliff plateaus with grass caps, layered foliage clusters, tiled roofs with upturned eaves, waterfalls, autumn accents |
| `c38a244c8402a5296d0c3fae2f0b3567ecf7e73e.jpg`, `header_alt_assets_2.jpg`                                            | Ornate roof silhouettes, gilt ridge ornaments, blossom trees                                                          |
| `VillageofDreams.webp`, `ss_8bd81babf9cb486548f9e0c24204cdc353d5ef66.1920x1080.jpg`, `reika-yoshino-thumbnail02.jpg` | Village massing, lit windows at dusk, desert spires, atmospheric haze                                                 |
| `S24_Blog-Header-Emote-BookRead_SLS_2409-1280x720.jpg`, `images (5).jpg`, `maxresdefault.jpg`                        | Moomin softness, big gentle eyes, warm night light, glowing grass motes                                               |
| `images (1).jpg`                                                                                                     | A floating island with a tower (the distant islets)                                                                   |

## 9. Review protocol

1. The builder runs generation, the asset build and the render review, and returns the contact sheets and the budget report.
2. The director reads `contact-world.png` first (silhouette, scale, harmony in place), then the family sheet, then the report for anything over budget.
3. Critique is numbered. Each item names the tile, the rule it breaks, the concrete change, and the reference to look at.
4. Sign-off requires: the 64 px silhouette test, the four house states readable side by side, scale against the avatar reference tile, palette within the swatches, budgets green, no floating or clipped geometry in the world shots, navigation and rig tests green.
