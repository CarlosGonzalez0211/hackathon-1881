/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1219617:1220095.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1705(scope) {
scope.fog_default = `uniform vec3 uFogColorNear;
uniform vec3 uFogColorFar;
uniform float uFogDistance;
uniform float uFogDensity;

void addFog(inout vec3 outcolor, float lenCam) {
    float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * lenCam * lenCam);
    float range1 = smoothstep(0.0, uFogDistance, fogFactor);
    float range2 = 1.0 - range1;
    vec3 fogColor = uFogColorNear * range2 + uFogColorFar * range1;
    outcolor = mix(outcolor, fogColor, fogFactor);
}`;
}
