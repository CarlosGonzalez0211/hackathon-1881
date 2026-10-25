/**
 * Headless GLB export for Node 22 (no DOM).
 *
 * `three/addons/exporters/GLTFExporter.js` needs `Blob` and `TextEncoder` (both global in
 * Node) and, for the binary path, `FileReader.readAsArrayBuffer`, which Node lacks: a
 * minimal polyfill is installed by `installPolyfills()`. Nothing here ever creates a
 * `THREE.Texture`; PNGs are attached afterwards with @gltf-transform (`attachTexture`).
 *
 * Conventions written by `exportGlb`:
 * - `trs: true` (translation / rotation / scale instead of matrices) so animations bind.
 * - Animations: node names must be unique per model (tracks bind by name).
 * - Custom vertex attributes: name them WITHOUT a leading underscore, e.g. `athena_style`.
 *   The exporter upper-cases and, because `ATHENA_STYLE` is not a core semantic, prefixes `_`:
 *   the file holds `_ATHENA_STYLE`, and three's GLTFLoader lower-cases it to `_athena_style`,
 *   the name `src/athena/character-look.ts` reads. (Naming it `_athena_style` in three would
 *   give `__ATHENA_STYLE` in the file: wrong.) Same for `athena_weave` and `athena_center`.
 * - Root `userData` becomes the root node's glTF extras; `finalizeGlb` also writes the
 *   document-level extras (asset.extras) that the asset build reads.
 */
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";

/** Document-level extras every generated GLB carries (asset build switches on these). */
export const GENERATED_EXTRAS = Object.freeze({ athenaGenerator: 3, athenaNormals: "authored" });

export function installPolyfills() {
  if (typeof globalThis.FileReader !== "undefined") return;
  globalThis.FileReader = class FileReader {
    result = null;
    onloadend = null;
    onload = null;
    #finish(promise) {
      promise.then((result) => {
        this.result = result;
        const event = { target: this };
        this.onload?.(event);
        this.onloadend?.(event);
      });
    }
    readAsArrayBuffer(blob) {
      this.#finish(blob.arrayBuffer());
    }
    readAsDataURL(blob) {
      this.#finish(
        blob
          .arrayBuffer()
          .then(
            (buffer) =>
              `data:${blob.type || "application/octet-stream"};base64,${Buffer.from(buffer).toString("base64")}`,
          ),
      );
    }
  };
}

/**
 * @param {import("three").Object3D} root
 * @param {import("three").AnimationClip[]} [clips]
 * @returns {Promise<Buffer>} a GLB
 */
export async function exportGlb(root, clips = [], { extras = {} } = {}) {
  installPolyfills();
  root.userData = { ...root.userData, ...GENERATED_EXTRAS, ...extras };
  root.updateMatrixWorld(true);
  const buffer = await new GLTFExporter().parseAsync(root, {
    binary: true,
    trs: true,
    onlyVisible: false,
    animations: clips,
  });
  return Buffer.from(buffer);
}

const toBytes = (buffer) => new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

/**
 * Re-open a GLB with @gltf-transform to set document extras and attach PNG textures.
 *
 * @param {Buffer} glb
 * @param {{ extras?: object, textures?: Array<{ png: Buffer, materials: string[] }> }} options
 *   Each texture becomes the base colour map of the named materials, `alphaMode: "MASK"` with
 *   cutoff 0.5 (leaf cards) and double sided.
 */
export async function finalizeGlb(glb, { extras = {}, textures = [] } = {}) {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const document = await io.readBinary(toBytes(glb));
  const root = document.getRoot();
  root.setExtras({ ...root.getExtras(), ...GENERATED_EXTRAS, ...extras });
  for (const { png, materials } of textures) {
    const names = new Set(materials);
    const texture = document
      .createTexture(`${[...names][0]}_atlas`)
      .setImage(toBytes(png))
      .setMimeType("image/png");
    let used = 0;
    for (const material of root.listMaterials()) {
      if (!names.has(material.getName())) continue;
      material
        .setBaseColorTexture(texture)
        .setAlphaMode("MASK")
        .setAlphaCutoff(0.5)
        .setDoubleSided(true);
      used++;
    }
    if (!used) throw new Error(`attachTexture: no material named ${[...names].join(", ")}`);
  }
  return Buffer.from(await io.writeBinary(document));
}

/** Attach one PNG as the base colour map of the named materials. */
export function attachTexture(glbBuffer, pngBuffer, materialNames) {
  return finalizeGlb(glbBuffer, { textures: [{ png: pngBuffer, materials: materialNames }] });
}
