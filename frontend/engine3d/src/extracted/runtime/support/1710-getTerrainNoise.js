/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1221687:1222191.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1710(scope) {
scope.getTerrainNoise = function getTerrainNoise() {
  return `
        ${scope.triplanar_default}

        vec3 applyTerrainColor(vec3 norm, vec3 pos, vec3 color) {
            vec4 triplanarGrass = triplanar(tNoiseTerrain, norm, pos.xyz, 0.035);
            color = rgb2hsv(color);
            color.b -= step(0.7, triplanarGrass.r) * 0.03;

            float grassLight = step(triplanarGrass.g, 0.8);
            color.b += grassLight * 0.05;

            color = hsv2rgb(color);
            return color;
        }
    `;
};
}
