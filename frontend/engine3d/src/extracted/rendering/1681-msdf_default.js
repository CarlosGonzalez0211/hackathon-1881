/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1178369:1179131.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1681(scope) {
scope.msdf_default = `float screenPxRange(float pxRange, sampler2D tMap, vec2 uv) {
    vec2 unitRange = pxRange / vec2(textureSize(tMap, 0));
    vec2 screenTexSize = 1.0 / fwidth(uv);
    return max(0.5 * dot(unitRange, screenTexSize), 1.0);
}

float median(sampler2D tMap, vec2 uv) {
    vec3 tex = texture2D(tMap, uv).rgb;
    return max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b));
}

float msdf(sampler2D tMap, vec2 uv, float pxRange) {
    float signedDist = median(tMap, uv);
    float screenPxDistance = screenPxRange(pxRange, tMap, uv) * (signedDist - 0.5);
    return clamp(screenPxDistance + 0.5, 0.0, 1.0);
}

const float DEFAULT_PXRANGE = 6.0;

float msdf(sampler2D tMap, vec2 uv) {
    return msdf(tMap, uv, DEFAULT_PXRANGE);
}`;
}
