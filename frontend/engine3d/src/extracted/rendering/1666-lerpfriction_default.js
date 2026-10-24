/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1139976:1140263.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1666(scope) {
scope.lerpfriction_default = `float lerpCoefFPS(float t, float dt) {
    return 1.0 - exp2(log2(1.0 - t) * dt);
}

float frictionFPS(float t, float dt) {
    return exp2(log2(t) * dt);
}

float lerpFPS(float x, float y, float t, float dt) {
    return mix(x, y, lerpCoefFPS(t, dt));
}`;
}
