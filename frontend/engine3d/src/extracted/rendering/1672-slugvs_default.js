/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1164507:1166070.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1672(scope) {
scope.slugvs_default = `attribute vec2 posnorm;
attribute vec4 texcoord;
attribute vec4 jacobian;
attribute vec4 banding;
attribute vec4 color;

varying vec2 vTexCoord;
varying vec4 vColor;
flat varying vec4 vBanding;
flat varying ivec4 vGlyph;

void GlyphUnpack(vec4 tex, vec4 bnd) {
    uvec2 g = floatBitsToUint(tex.zw);
    vGlyph = ivec4(g.x & 0xFFFFU, g.x >> 16U, g.y & 0xFFFFU, g.y >> 16U);
    vBanding = bnd;
}

vec3 SlugVS(vec4 color, vec2 dim, mat4 mvpMatrix) {
    
    mat4 mvp = mvpMatrix; 
    mat4 mvp_row = transpose(mvp);
    vec4 m0 = mvp_row[0];
    vec4 m1 = mvp_row[1];
    vec4 m3 = mvp_row[3];
    vec4 pos = vec4(position.xy, posnorm.xy);
    vec4 tex = texcoord;
    vec4 jac = jacobian;
    GlyphUnpack(texcoord, banding);
    vColor = color;

    
    vec2 n = normalize(pos.zw);
    float s = dot(m3.xy, pos.xy) + m3.w;
    float t = dot(m3.xy, n);

    float u = (s * dot(m0.xy, n) - t * (dot(m0.xy, pos.xy) + m0.w)) * dim.x;
    float v = (s * dot(m1.xy, n) - t * (dot(m1.xy, pos.xy) + m1.w)) * dim.y;

    float s2 = s * s;
    float st = s * t;
    float uv = u * u + v * v;
    vec2 d = pos.zw * (s2 * (st + sqrt(uv)) / (uv - st * st));

    vTexCoord = (vec2(tex.x + dot(d, jac.xy), tex.y + dot(d, jac.zw)));

    return vec3(pos.xy + d, 0.0);
}

vec3 SlugVS(mat4 mvpMatrix) {
    return SlugVS(color, resolution.xy, mvpMatrix);
}

vec3 SlugVS(vec2 dim) {
    return SlugVS(color, dim, projectionMatrix * modelViewMatrix);
}

vec3 SlugVS() {
    return SlugVS(resolution.xy);
}`;
}
