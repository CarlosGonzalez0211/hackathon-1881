/**
 * One lighting rig for every scene: the legacy directional shadow light (followCSM) plus an
 * ambient fill (not hemisphere: "up" differs across the spherical planet) that only Athena
 * (MeshToon) materials respond to; legacy cel ShaderMaterials light themselves. Both share
 * the legacy shader fog, recoloured to --athena-sky-horizon.
 */
import { renderingDefinition } from "../config/rendering";
import type { AthenaInstallContext } from "./install";

export function installAthenaLook(ctx: AthenaInstallContext) {
  if (!ctx.enabled) return;
  const { scope } = ctx;
  const setupLights = scope.planet.prototype.setupLights;
  scope.planet.prototype.setupLights = function () {
    setupLights.call(this);
    const { color, intensity } = renderingDefinition.athenaLight;
    const fill = new scope.AmbientLight(color, intensity);
    fill.name = "athena-fill";
    this.add(fill);
    // One fog for both worlds: the legacy shader fog, recoloured to --athena-sky-horizon.
    if (scope.fogUniforms) {
      scope.fogUniforms.uFogColorNear.value.set(renderingDefinition.fog.color);
      scope.fogUniforms.uFogColorFar.value.set(renderingDefinition.fog.color);
    }
  };
  ctx.onDispose(() => {
    scope.planet.prototype.setupLights = setupLights;
  });
}
