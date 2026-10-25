# Requests from Person 3 (World, progression and collaboration)

Changes Person 3 needs outside its folders (`frontend/engine3d/**`, `frontend/web/src/features/world/**`, `backend/modules/world/**`, `shared/src/world.ts`). Proposals only; owners decide.

## Everyone (repository)

- **Push the Athena kit's Git LFS objects.** The 293 GLB/PNG/WAV files in `frontend/engine3d/athena-assets/` exist only on the machine that added them (`git lfs push --all origin` from there). Without them every Athena slot falls back to Messenger art and `pnpm check:assets` fails.

## Person 2 (learning / mastery)

- **Export `HouseStatus`** (`z.infer<typeof houseStatusSchema>`) from `shared/src/learning.ts`. The world derives it locally as `HouseState["status"]` today.
- The world reads house status only from `PlanetState`; please keep `MasteryUpdated` → `PlanetState.houses[].status` the single path (no other status source).

## Brand owner (`frontend/brand`)

- **Brand gap: 3D ink.** The brief fixes the toon outline at `#2B2936`; the brand guide has no 3D ink token (its UI ink is `#1B2433`). Proposal: add `ink3d: "#2B2936"` to `tokens.ts`/`tokens.css` so `config/rendering.ts` reads it from tokens.
- **Focus ring**: the guide asks for a visible 3 px `--athena-focus` ring on everything, including 3D markers. A shared `:focus-visible` rule in `app/globals.css` would cover the world markers and the topic list.

## Platform (Person 4)

- **Draw-call / triangle telemetry**: `SurfaceHandle.onStats` reports fps, draw calls and triangles; a dev overlay or CI check against the budgets (≤ 120 calls, ≤ 250 k triangles) would catch regressions. Note the legacy world alone renders ~265 k triangles.
- **CI with Playwright** for `pnpm check:assets` (needs a running app and the LFS objects).
