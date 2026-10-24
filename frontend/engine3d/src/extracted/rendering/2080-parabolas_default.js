/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1666982:1667233.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2080(scope) {
scope.parabolas_default = `float parabola(float x, float k) {
    return pow(4.0 * x * (1.0 - x), k);
}

float pcurve(float x, float a, float b) {
    float k = pow(a + b, a + b) / (pow(a, a) * pow(b, b));
    return k * pow(x, a) * pow(1.0 - x, b);
}`;
}
