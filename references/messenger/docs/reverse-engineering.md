# Messenger investigation

## Scope and method

Targets: https://messenger.abeto.co/ and its Awwwards reference at https://www.awwwards.com/sites/messenger.

The original page was observed in a browser. Its public HTML, production JavaScript, workers, styles, models, textures, fonts, and audio were inspected and cached. Findings below come from ordinary static inspection and browser observation, not REA Evidence records. The REA skill guided the workflow, but its diagnostic reported Node 22.13.1 below the current CLI's supported runtime and no active REA tool connection. No global runtime or MCP configuration was changed.

## Observed architecture

| Area | Evidence in shipped artifacts | Finding |
| --- | --- | --- |
| Entry | Original `index.html`, `webgl-CS4l6lxD.js` | Module entry imports `App3D-DwM1eiaC.js`; stylesheet is separate. |
| Page lifecycle | `App3D`, Svelte runtime helpers | Svelte mounts a loading view and full-window WebGL container. |
| Rendering | Three.js classes, `mainController`, `introScene`, `presentScene` | Separate introduction and playable-world scenes; compositors perform transitions. |
| Appearance | Shader sources, `outlines`, `waterPass`, LUT texture | Custom outlines, lighting, water, fog, and color grading create the illustrated look. |
| Geometry | `geometryLoader`, Draco worker and decoder WASM | Compressed `.drc` files contain terrain, characters, accessories, animation data, and props. |
| Text | Glyph worker, `.font` / `.icon` files, glyph WASM | Most visible controls and dialogue are meshes, rather than ordinary HTML. |
| Textures | KTX2 loader, Basis JS/WASM | Compressed GPU textures are transcoded locally. |
| World | `terrain`, `chunks:10`, collision worker | Ten terrain chunks have multiple detail levels; collision computation runs in a worker. |
| Characters | `characters`, NPC definitions and animation files | Avatar accessories and NPC animation assets are separately loaded. |
| Gameplay | `questsController`, `introDialogue`, dialogue events | Client-side state and event handlers manage dialogue and delivery sequences. |
| Persistence | `key="App3D_data"`, storage proxy | Browser local storage records game state. |
| Multiplayer | `MicroRealmConnection`, `offline` option, server URL | Online peers use a WebSocket backend; offline mode avoids creating the connection. |

## Local implementation decisions

The preserved production bundle supplies the real experience. Rebuilding approximate geometry or animation would reduce fidelity, so the local edition retains the served artifacts and applies a small, reproducible patch.

`offline:!0` prevents multiplayer connection construction. Both later `_createSocket()` calls use optional chaining to accommodate that absent connection. Hard-coded worker URLs are made same-origin. HTML asset links are local and the Cloudflare beacon is removed. A guarded Enter handler invokes the same `switch_to_present_scene` event as the original Begin mesh.

The local server binds only to 127.0.0.1. Normal startup serves existing files and returns an error for missing files; it has no upstream fallback unless explicitly started with `--capture`. A Content Security Policy restricts runtime connections to local resources, data, and blobs.

## Verification and limits

- Observed the original animated planet and title screen.
- Observed the matching local animated title screen.
- Entered the local playable world with the original terrain and character models.
- Observed the opening dialogue and exercised keyboard dialogue progression.
- Opened character customization with L; its camera transition and accessory controls rendered correctly. Screenshot: `customization.png`.
- Cached all production assets requested during those flows, plus statically referenced quest icons and the low-memory terrain variants.
- Checked JavaScript syntax for the server and patched main bundle.
- Restarted the server without `--capture`, loaded the title in a fresh browser tab, and entered the world and opening dialogue successfully. No console warnings or errors were reported in that tab. Screenshot: `offline-game.png`.
- Verified HTTP 200 responses and expected content types for the entry, main module, decoder WASM, terrain model, music, and quest icon. All inventoried static references exist locally. The final manifest includes 360 files totaling about 27.5 MiB.
- Full quest completion, all secret interactions, every costume combination, touch input, and all hardware/browser variants remain unverified.
- Public multiplayer server code and original unbundled authoring sources were not available in the retrieved artifacts and are not reconstructed.

The asset manifest records local SHA-256 identities, including patched files. `originals/` retains the unmodified entry and main bundle for comparison. Production-bundle notices remain intact.
