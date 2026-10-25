import { GLAZE_NAME } from "../materials/athena-toon-material";
import type { AthenaModel } from "../athena/models";
import type { LegacyContext } from "../runtime/legacy-context";

/** Materials that move in the wind (docs/art/ART_DIRECTION.md section 7). */
export const HOUSE_WIND_NAME = /banner|pennant|vine_tip|leaf/;
/** Cloth: hangs from the mast and streams towards -X (the kit flies every flag that way). */
const CLOTH = /banner|pennant/;

/** How strongly each learning status sways: a locked house is dead calm, a done one lively. */
export const HOUSE_WIND: Record<string, number> = {
  locked: 0,
  available: 0.7,
  in_progress: 0.85,
  done: 1,
};

/**
 * Per-house finishing after the toon pass (the topic houses of `models/buildings`):
 *
 * - roofs (`roof_tile`) opt out of the glaze sheen (`athenaGlaze = false`): the specular streaks
 *   read as plastic on a tiled roof. The name is kept, so the materials stay findable. The toon
 *   conversion already ran, so the flag is set and the program recompiled here.
 * - banners (cloth) stream from the mast: the bend grows with the distance from the mast edge of
 *   the mesh, so the flag stays attached to its pole. Leaves (`garden_leaf`, `vine_leaf`) only
 *   flutter a few millimetres, so a garden never slides off its roof.
 *
 * Materials are matched by name, which survives the runtime merge because those materials are
 * not plain (cloth and leaves are double sided, the roof carries a faint emissive). The wind is
 * driven by `breeze`, the village clock; without it only the glaze opt-out is applied.
 */
export function dressHouse(model: AthenaModel, status: string, breeze?: { value: number }) {
  const amplitude = HOUSE_WIND[status] ?? 0.7;
  model.root.traverse((part: LegacyContext) => {
    if (!part.isMesh || part.userData.athenaInk) return;
    for (const material of Array.isArray(part.material) ? part.material : [part.material]) {
      if (!material?.name) continue;
      if (GLAZE_NAME.test(material.name) && material.userData.athenaGlaze !== false) {
        material.userData.athenaGlaze = false;
        material.needsUpdate = true;
      }
      if (!breeze || !amplitude || !HOUSE_WIND_NAME.test(material.name)) continue;
      if (material.userData.athenaHouseWind) continue;
      material.userData.athenaHouseWind = true;
      houseWind(part, material, breeze, amplitude);
    }
  });
}

function houseWind(
  mesh: LegacyContext,
  material: LegacyContext,
  breeze: { value: number },
  amplitude: number,
) {
  const cloth = CLOTH.test(material.name);
  let hinge = 0;
  if (cloth) {
    mesh.geometry.computeBoundingBox();
    hinge = mesh.geometry.boundingBox.max.x;
  }
  const previous = material.onBeforeCompile.bind(material);
  const cache = material.customProgramCacheKey.bind(material);
  material.onBeforeCompile = (shader: LegacyContext, renderer: LegacyContext) => {
    previous(shader, renderer);
    shader.uniforms.uBreeze = breeze;
    shader.uniforms.uHingeX = { value: hinge };
    const bend = cloth
      ? `
      float hdx = abs(position.x - uHingeX);
      float hs = clamp(hdx / 0.4, 0.0, 1.0);
      hs *= hs;
      transformed.z += sin(uBreeze * 2.1 + hdx * 7.0) * ${(0.05 * amplitude).toFixed(4)} * hs;
      transformed.y += sin(uBreeze * 1.7 + hdx * 5.0) * ${(0.012 * amplitude).toFixed(4)} * hs;
    `
      : `
      transformed.x += sin(uBreeze * 1.9 + position.x * 11.0 + position.z * 7.0) * ${(0.006 * amplitude).toFixed(4)};
      transformed.z += cos(uBreeze * 1.4 + position.z * 9.0 + position.y * 5.0) * ${(0.006 * amplitude).toFixed(4)};
    `;
    shader.vertexShader = `uniform float uBreeze;\nuniform float uHingeX;\n${shader.vertexShader}`;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>\n${bend}`,
    );
  };
  material.customProgramCacheKey = () =>
    `${cache()}-house-${cloth ? "cloth" : "leaf"}-${amplitude}-${hinge.toFixed(3)}-v1`;
  material.needsUpdate = true;
}
