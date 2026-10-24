/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1219193:1219616.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1704(scope) {
scope.triplanar_default = `vec4 triplanar(sampler2D tex, vec3 wNorm, vec3 wPos, float scale) {
    
    vec3 bf = normalize(abs(wNorm));
    bf /= dot(bf, vec3(1.0));

    
    vec2 tx = wPos.yz * scale;
    vec2 ty = wPos.zx * scale;
    vec2 tz = wPos.xy * scale;

    
    vec4 cx = texture(tex, tx) * bf.x;
    vec4 cy = texture(tex, ty) * bf.y;
    vec4 cz = texture(tex, tz) * bf.z;
    return cx + cy + cz;
}`;
}
