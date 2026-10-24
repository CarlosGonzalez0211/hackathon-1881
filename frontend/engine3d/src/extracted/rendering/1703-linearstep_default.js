/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1219059:1219192.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1703(scope) {
scope.linearstep_default = `float linearstep(float begin, float end, float t) {
    return clamp((t - begin) / (end - begin), 0.0, 1.0);
}`;
}
