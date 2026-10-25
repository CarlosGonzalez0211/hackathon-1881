# Baseline before the overhaul (2026-10-25)

Captured with `pnpm --filter @athena/engine3d review:render --world --assets=buildings,npcs --port 3100` on the tooling branch. The run lives in `frontend/engine3d/review/` (ignored by git); regenerate it with the same command on `main` to compare.

## What the world shots show

- The grade, haze and sky already carry the mood: golden-hour backlight, soft shadows, a luminous horizon. Keep them.
- Topic houses are lathe cylinders under cone roofs with torus bands; the pagoda variant is the only roof with a real silhouette. Locked houses are flat grey.
- Trees are clusters of spheres on branchless tapered tubes; at any distance they read as green balls. Grass is a field of thin ribbons; flowers are flat discs.
- The horizon is empty: no cliffs, no far shapes, only sky and cloud puffs.
- The plaza gate is a floating ring with hanging boards; the monoliths are smooth slabs.
- People are capsules under sphere heads with sphere hair caps; the student reads best thanks to the hood and backpack. Faces are tiny dots.
- Measured at high quality: ground shots 40 to 140 draws and 1.11 to 1.38 M triangles; the overview 459 draws and 1.95 M triangles. Targets are 320 draws and 1.1 M.

## Asset budgets today

Topic houses 14 to 18k triangles (done variants 49 to 51k, 250 KB) against a 6k / 110 KB target; cottage 12k, greenhouse 14k; most NPCs 17 to 26k and 180 to 240 KB against 7k / 60 KB; the study trio 61k. Library, observatory, owl and visitor are within budget.

## What each family must beat

- Houses: a roof silhouette per variant, a bulging body, scalloped eaves, light that tells the state.
- Landscape: crowns with a gradient and a fringe, trunks with a branch and a root flare, cliff plateaus on the mountains, painted ground, islets on the horizon.
- Characters: soft egg heads with real eyes, swept hair, mitten hands, sculpted hems; one silhouette feature per person.
- Civic and props: one iconic feature per building; batched spirit dressing.
- Sky and grade: tune after the assets land; the overview must come down to budget.
