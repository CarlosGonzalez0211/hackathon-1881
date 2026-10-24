/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1595432:1596471.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2029(scope) {
scope.transformUV_default = `vec2 rotateUV(vec2 uv, float rotation, vec2 mid) {
    float c = cos(rotation);
    float s = sin(rotation);
    return vec2(
        c * (uv.x - mid.x) + s * (uv.y - mid.y) + mid.x,
        c * (uv.y - mid.y) - s * (uv.x - mid.x) + mid.y
    );
}

vec2 rotateUV(vec2 uv, float rotation, float mid) {
    return rotateUV(uv, rotation, vec2(mid));
}

vec2 rotateUV(vec2 uv, float rotation) {
    return rotateUV(uv, rotation, vec2(0.5));
}

vec2 scaleUV(vec2 uv, float scale, vec2 mid) {
    uv -= mid;
    uv *= 1.0 / scale;
    uv += mid;
    return uv;
}

vec2 scaleUV(vec2 uv, float scale, float mid) {
    return scaleUV(uv, scale, vec2(mid));
}

vec2 scaleUV(vec2 uv, float scale) {
    return scaleUV(uv, scale, vec2(0.5));
}

vec2 barrelDistortion(vec2 uv, vec2 center, float amt) {
    vec2 cc = uv - center;
    float dist = dot(cc, cc);
    return uv + cc * dist * amt;
}

vec2 barrelDistortion(vec2 uv, float amt) {
    return barrelDistortion(uv, vec2(0.5), amt);
}`;
}
