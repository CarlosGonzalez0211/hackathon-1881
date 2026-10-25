/**
 * Registry of generated kit assets.
 *
 * An entry is `{ id, family, file, build(THREE, tools, opts) }`:
 * - `id`      unique, e.g. `spike-lathe`; `generate.mjs --only=<id>` selects it.
 * - `family`  output folder under `models/` (`models/<family>/<file>`) and the name of the
 *             module in `families/<family>.mjs` whose source is hashed into the entry.
 * - `build`   returns `{ root, clips?, textures?, extras? }`: an Object3D tree, optional
 *             THREE.AnimationClips, optional PNGs to attach (`[{ png, materials }]`), and
 *             extra document extras. `tools` comes from `sculpt/index.mjs`.
 *
 * Only the `spike` family is registered. The real families keep loading the committed
 * (Git LFS) GLBs until they are ported from the legacy generator (`athena-models.js`, which
 * this registry deliberately does not import). To add one, create `families/<name>.mjs`
 * exporting `entries`, import it below and add it to the list. File names must match the
 * committed ones (`athena-house-done-v0.glb`, ...) so the build replaces them per file.
 */
import { entries as spike } from "./families/spike.mjs";
import { entries as natureEntries } from "./families/nature.mjs";

// TODO(world art): one module per family, same names as the committed kit folders.
/** models/buildings: topic houses (`athena-house-<status>-v<slot>.glb`) and civic buildings. */
export const houses = [];
export const buildings = [];
/** models/nature: trees, rocks, grass, flowers, clouds. */
export const nature = natureEntries;
/** models/avatar, models/npcs, models/characters: rigs keep the documented node names. */
export const characters = [];
/** models/props: lamp posts, benches, signs, crates. */
export const props = [];

export const entries = [...spike, ...houses, ...buildings, ...nature, ...characters, ...props];
