# Brief E: sky, atmosphere, lighting and grade

Read `docs/art/ART_DIRECTION.md` first (rules 1, 6, 7; section 5). This brief tunes the stack that every other family renders through. It runs last, against the final assets, using the world shot list. Changes are numeric and shader-level; no new assets.

## Deliverables

### Sky (`src/village/atmosphere.ts`)

- Keep the camera-centred painted sky and the overview halo. Add a thin cirrus layer (stretched fbm, warm near the sun), a soft sun corona (two exponents), four authored cumulus silhouettes shared with the cloud belt, and a visibly layered cloud sea below the horizon with sun-lit ridges.
- Zenith slightly deeper (about `.10,.33,.72` in linear light), middle `.42,.72,.95`, horizon unchanged. Keep the sun disc values clamped by the sanitize pass.

### Light (`src/village/light.ts`)

- Sun elevation from about 17 to about 25 degrees (`up 0.42, forward 0.80, right -0.42`, normalised) so roofs and plateau caps catch light while figures stay backlit. Safe range 18 to 30 degrees.
- Sun colour `#ffdcb0` at intensity 2.4 (range 2.0 to 3.0); sky `#8ec6ea`; haze `#c9dcef`; haze near the sun `#ffcf9a`.

### Toon soft mode (`src/materials/athena-toon-material.ts`, `SOFT_FRAGMENT` v2)

- Two-band shadow: deep cool `#9aa6e0` below a lit value of 0.22, warm core `#c9b2c6` up to 0.6, soft 0.08 blends.
- Warm bounce from the ground on undersides facing lit ground (`uAthenaGround #d9a873`, hemi 0.22 to 0.34).
- Glazed sheen only where `ATHENA_GLAZE` is defined (already scaffolded).
- Clamp pre-tonemap radiance at 6.0 so emissive windows bloom without white holes. Keep the NaN guard last. New cache key.

### Grade (`src/village/grade.ts`)

- Bloom threshold 1.3 to 1.1 (range 1.0 to 1.4), intensity 0.5, radius 0.7.
- Haze density 0.0085 walking and 0.004 overview, max 0.5 (never above 0.6).
- Light shafts 0.22, high tier only.
- Vignette 0.7 to 0.55. Split tone shadows `#9fb0ff`, highlights `#ffe0b8`, shadow mix 0.4. Saturation 1.1.
- Keep the sanitize pass first in the chain.

### Capes (`src/village/cloth.ts`) if not done by the characters brief

- Backlit transmission: `diffuse * (0.18 + 0.5 * backlit^2)` instead of the constant.

### Performance (`src/village/surface.ts` additive, `scene.ts`)

- A `setDetail("low")` hook on the village handle that hides fringe cards, islets and waterfalls without a rebuild, called from the existing auto-downgrade path.
- Verify both tiers through the harness; report draw calls and triangles for every world shot.

## Rules

- Light is the story: after tuning, the brightest things in any shot are the sun corona and the lit windows and lanterns; nothing else blooms.
- Layered depth: far cliffs and islets must dissolve into haze layers, not disappear.
- Reduced motion keeps the composition readable with time frozen.
- Change one knob at a time and compare with `--compare`; stay inside the safe ranges above unless the comparison proves otherwise, and document any excursion.

## References

- Golden-hour backlight, warm/cool split, cloud sea: `004_Sky.webp`, `images (4).jpg`, `maxresdefault.jpg`.
- Haze that keeps shapes: `VillageofDreams.webp`, `genshin-impact-landscape-3840x2160-dbfecd33a0cc.jpg`.

## Acceptance checklist

1. All twelve world shots at both tiers reviewed with before/after sheets.
2. No white holes in emissives, no black blocks (NaN), no banding in the sky.
3. Low tier under 450k triangles; high tier under 1.1 M and 320 draw calls.
4. Tests (toon, landscape) green; `toonOptions` defaults untouched.

## Ownership and commands

Files: `src/village/atmosphere.ts`, `src/village/light.ts`, `src/village/grade.ts`, `src/materials/athena-toon-material.ts` (soft fragment and lighting defaults), `src/village/cloth.ts` (if still pending), the `setDetail` hook in `scene.ts` and its call in `surface.ts`. Nothing else.

Commands: `pnpm --filter @athena/engine3d review:render --world --quality=high --port 3100`, the same with `--quality=low`, `--compare=<previous run>`, engine tests, `pnpm typecheck`, `pnpm lint`.

Return: before/after sheets per knob group, the final values table, per-shot stats for both tiers, tests.
