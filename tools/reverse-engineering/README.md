# Reproducible asset and character extraction

From the repository root:

```sh
node tools/reverse-engineering/asset-inventory.mjs
node tools/reverse-engineering/extract-character-config.mjs
node tools/reverse-engineering/geometry-inventory.mjs
node --test tools/reverse-engineering/asset-inventory.test.mjs
```

Both generators default to `references/messenger/dist`. An explicit preserved distribution directory can be supplied as the final argument. They do not download resources or execute the production bundle. The NPC extractor parses the literal constructor options in `presentScene.createNPCS`, converts literal radian expressions, and rejects a changed character count. Source boundary changes require reviewing the extractor before regenerating.

The preservation inventory at `docs/analysis/asset-inventory.json` covers every one of the 360 captured files, including the original local HTML entry, with byte size, SHA-256, origin URL, reference path, and license status. Runtime asset definitions in `frontend/engine3d/src/assets/catalog.ts` include the 359 non-HTML files. IDs preserve the full filename and extension because codecs include sibling JavaScript and WASM files with the same basename.

The catalog resolves file paths against `/assets/athena/`, whose internal subtree mirrors `references/messenger/dist/assets/`. The preserved reference hashes describe input bytes, not transformed deployment worker copies. Extracted runtime modules and rewritten public worker paths have their own derivation; they must not be substituted into the reference inventory. Use `assetUrl(id)` when resolving configurable resource definitions. Files with unknown format or license are retained.

## Recovered configuration

- Avatar skeleton, base, seven animation files, and every hair/top/bottom/shoe accessory are listed. The default appearance is a developer setting, without user customization controls.
- Twenty NPC definitions preserve every constructor literal: models, bones, animation sequence and playback speeds, dialogue, positions, radian rotations, voice, talk settings, and route curve references when present. Role names reflect constructor animation order; raw options remain available as `referenceSettings`.
- The ten emote keys preserve the actual `EMOJI_MAP` mapping. Numeric filenames are not assigned invented emotion names.
- Terrain records identify ten chunk indices, original high/low-memory resource families, four detail levels, collision resources, vegetation/water/intro resources, and LOD thresholds.
- Rendering configuration records recovered sky, lighting, camera, texture, codec, and material references. Audio retains all captured music, ambience, voice, action, and UI resources.

## Limits and remaining mapping

These configuration contracts provide the authoring data surface. Runtime integration must consume them; exporting an object alone does not prove a setting changes a running scene. The source extractor and runtime extraction are separate tools.

The six topic slots use exact NPC coordinates from the captured world. They are explicitly **interaction anchors**, not identified building mesh origins. Quest text associates the boss with a red cliff house and the mountain NPC with a temple; neither establishes geometry ownership or the building pivot. Every anchor therefore records `geometryIdentification: 'pending'`.

Terrain and foliage are batched. Chunk filenames and numeric `batchId` values do not establish which pieces are houses or trees. A decoded group can be tracked technically but needs visual verification before receiving a semantic label. No building or individual tree modeling source file was recovered, and no composite geometry is silently represented as such a source file. The collision meshes describe collision surfaces, not semantic building boundaries.

The geometry inventory uses the shipped Draco JavaScript/WASM codec in an isolated VM context. Ten full-detail terrain chunks decode into 588 chunk/batch groups: 65 each in chunks 0–8 and 3 in chunk 9. `docs/analysis/geometry-inventory.json` records original geometry attribute metadata, vertex/face counts, and each group's source-space bounds/center. `terrain-groups.ts` provides developer-editable enabled/offset/rotation/scale defaults. These group definitions are technical boundaries; applying transforms across detail levels requires matching the original chunk/batch IDs. Per-vertex `elementId` metadata also survives, but semantic attribution and extraction of individual model sources remain unestablished.

This inventory proves the identity and coverage of the captured distribution, not that every upstream asset or unavailable multiplayer server was recovered. Shader code, embedded materials, physics, collision, UI mesh behavior, and lifecycle cleanup belong to the separate AST/runtime extraction and its validation. The configurable paths do not by themselves demonstrate complete per-uniform/per-instance rebinding for these code families. Preserve these gaps in delivery documentation until runtime checks establish them.
