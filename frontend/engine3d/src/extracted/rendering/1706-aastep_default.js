/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1220096:1220316.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1706(scope) {
scope.aastep_default = `float aastep(float threshold, float value) {
    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold - afwidth, threshold + afwidth, value);
}`;
}
