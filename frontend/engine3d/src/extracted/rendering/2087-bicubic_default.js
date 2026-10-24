/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1678938:1681609.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2087(scope) {
scope.bicubic_default = `float w0(float a) { return (1.0 / 6.0) * (a * (a * (-a + 3.0) - 3.0) + 1.0); }
float w1(float a) { return (1.0 / 6.0) * (a * a * (3.0 * a - 6.0) + 4.0); }
float w2(float a) { return (1.0 / 6.0) * (a * (a * (-3.0 * a + 3.0) + 3.0) + 1.0); }
float w3(float a) { return (1.0 / 6.0) * (a * a * a); }
float g0(float a) { return w0(a) + w1(a); }
float g1(float a) { return w2(a) + w3(a); }
float h0(float a) { return -1.0 + w1(a) / (w0(a) + w1(a)); }
float h1(float a) { return 1.0 + w3(a) / (w2(a) + w3(a)); }

vec4 bicubic(sampler2D tex, vec2 uv, vec4 texelSize) {
	uv = uv * texelSize.zw + 0.5;
	vec2 iuv = floor(uv);
	vec2 fuv = fract(uv);
    float g0x = g0(fuv.x);
    float g1x = g1(fuv.x);
    float h0x = h0(fuv.x);
    float h1x = h1(fuv.x);
    float h0y = h0(fuv.y);
    float h1y = h1(fuv.y);
	vec2 p0 = (vec2(iuv.x + h0x, iuv.y + h0y) - 0.5) * texelSize.xy;
	vec2 p1 = (vec2(iuv.x + h1x, iuv.y + h0y) - 0.5) * texelSize.xy;
	vec2 p2 = (vec2(iuv.x + h0x, iuv.y + h1y) - 0.5) * texelSize.xy;
	vec2 p3 = (vec2(iuv.x + h1x, iuv.y + h1y) - 0.5) * texelSize.xy;

    return g0(fuv.y) * (g0x * texture(tex, p0) + g1x * texture(tex, p1)) +
           g1(fuv.y) * (g0x * texture(tex, p2) + g1x * texture(tex, p3));
}

vec4 bicubic(sampler2D tex, vec2 uv, vec4 texelSize, float lod) {
	uv = uv * texelSize.zw + 0.5;
	vec2 iuv = floor(uv);
    vec2 fuv = fract(uv);
    float g0x = g0(fuv.x);
    float g1x = g1(fuv.x);
    float h0x = h0(fuv.x);
    float h1x = h1(fuv.x);
    float h0y = h0(fuv.y);
    float h1y = h1(fuv.y);
    vec2 p0 = (vec2(iuv.x + h0x, iuv.y + h0y) - 0.5) * texelSize.xy;
    vec2 p1 = (vec2(iuv.x + h1x, iuv.y + h0y) - 0.5) * texelSize.xy;
    vec2 p2 = (vec2(iuv.x + h0x, iuv.y + h1y) - 0.5) * texelSize.xy;
    vec2 p3 = (vec2(iuv.x + h1x, iuv.y + h1y) - 0.5) * texelSize.xy;
	return g0(fuv.y) * (g0x * textureLod(tex, p0, lod) + g1x * textureLod(tex, p1, lod)) +
		   g1(fuv.y) * (g0x * textureLod(tex, p2, lod) + g1x * textureLod(tex, p3, lod));
}

vec4 textureBicubic(sampler2D map, vec2 uv) {
	vec2 fullSize = vec2(textureSize(map, 0));
    vec2 fullSizeInv = 1.0 / fullSize;
	return bicubic(map, uv, vec4(fullSizeInv, fullSize));
}

vec4 textureBicubic(sampler2D map, vec2 uv, float lod) {
	vec2 fLodSize = vec2(textureSize(map, int(lod)));
	vec2 cLodSize = vec2(textureSize(map, int(lod + 1.0)));
	vec2 fLodSizeInv = 1.0 / fLodSize;
	vec2 cLodSizeInv = 1.0 / cLodSize;
	vec4 fSample = bicubic(map, uv, vec4(fLodSizeInv, fLodSize), floor(lod));
	vec4 cSample = bicubic(map, uv, vec4(cLodSizeInv, cLodSize), ceil(lod));
	return mix(fSample, cSample, fract(lod));
}`;
}
