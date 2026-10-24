/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1135718:1136751.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1663(scope) {
scope.encoding_default = `vec2 encodeNormal(vec3 n) {
    n /= (abs(n.x) + abs(n.y) + abs(n.z));
    return (n.z >= 0.0) ? n.xy : (1.0 - abs(n.yx)) * sign(n.xy);
}

vec3 decodeNormal(vec2 f) {
    vec3 n = vec3(f, 1.0 - abs(f.x) - abs(f.y));
    float t = max(-n.z, 0.0);
    n.x += (n.x > 0.0) ? -t : t;
    n.y += (n.y > 0.0) ? -t : t;
    return normalize(n);
}

vec2 encodeNormalUint8(vec3 n) {
    return encodeNormal(n) * 0.5 + 0.5;
}

vec3 deodeNormalUint8(vec2 n) {
    return decodeNormal(n * 2.0 - 1.0);
}

vec2 encodeNormalSpheremap(vec3 n) {
    float f = sqrt(8.0 * n.z + 8.0);
    return n.xy / f * 2.0;
}

vec3 decodeNormalSpheremap(vec2 n) {
    vec4 nn = vec4(n.xy, 1.0, -1.0);
    float l = dot(nn.xyz, -nn.xyw);
    nn.z = l;
    nn.xy *= sqrt(l);
    return nn.xyz * 2.0 + vec3(0.0, 0.0, -1.0);
}

vec2 encodeNormalSpheremapUint8(vec3 n) {
    return encodeNormalSpheremap(n) * 0.5 + 0.5;
}

vec3 deodeNormalSimpleUint8(vec2 n) {
    return decodeNormalSpheremap(n * 2.0 - 1.0);
}`;
}
