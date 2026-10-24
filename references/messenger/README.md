# Messenger — local edition

A personal, self-contained local copy of [Messenger by abeto](https://messenger.abeto.co/), preserving the shipped WebGL game, artwork, animation, audio, NPCs, and character customization.

## Run

Double-click `start.cmd`, then open **http://127.0.0.1:4173/**. Alternatively, run `npm start` inside this folder. Node.js is the only runtime dependency; there is no installation or build step. Keep the server terminal open while playing, and press Ctrl+C there to stop it.

Use an up-to-date browser with WebGL2 and hardware acceleration. Serve through HTTP; opening `dist/index.html` directly cannot load the worker modules correctly.

## Controls

- Click **Begin**, or press **Enter** on the title screen (added in this edition).
- **WASD / arrow keys:** move.
- **Shift:** sprint. **Space:** jump.
- **E / Space:** advance dialogue. **Escape:** close dialogue or customization.
- **L:** open/close character customization.
- **0–9:** character emotes.
- Use the original on-screen buttons for the delivery checklist, sound, clothing, and emotes; click nearby characters to interact. The original touch controls remain included.

Progress and appearance use the browser's local storage under `App3D_data`. They belong to this local origin, independently of the live website. Keep the same URL and port to retain the same save.

## What was changed

This is a preservation of the publicly served production code and assets, with small local patches. It is not a recovery of the author's original source project or a new implementation from scratch.

- Asset and worker URLs now point to this local server.
- The game's existing offline mode is enabled. Two server connection calls are guarded so the opening flow works offline.
- The Cloudflare analytics script is omitted.
- Enter can start the game.
- A local server supplies the correct module/WASM MIME types and restricts browser fetches to local resources, blob URLs, and inline data.

The public multiplayer backend is intentionally disconnected. Other online players and server rooms are not reproduced. The single-player world, dialogues, delivery logic, and customization remain in the shipped code. A complete playthrough of every quest has not been verified.

## Files

- `dist/`: ready-to-run website and cached assets.
- `server.mjs`: dependency-free local HTTP server; normal startup never downloads assets.
- `originals/`: original entry HTML and original main bundle before the offline patches.
- `patch-site.py`: reproducible, asserted patches for those original files (optional; Python is not needed to play).
- `asset-manifest.json`: local file sizes and SHA-256 hashes.
- `docs/reverse-engineering.md`: architecture findings and verification boundaries.
- `docs/customization.png`: captured working local customization screen.

For development only, `node server.mjs --capture` can acquire a missing `/assets/` file from the original site. This flag is disabled in `npm start` and `start.cmd` and is unnecessary for normal play.

Original game, artwork, and shipped code remain credited to abeto. Existing notices in the production bundles are preserved. This folder does not grant ownership or redistribution rights to the original materials.
