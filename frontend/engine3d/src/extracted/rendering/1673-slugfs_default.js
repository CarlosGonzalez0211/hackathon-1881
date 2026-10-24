/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1166071:1171365.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1673(scope) {
scope.slugfs_default = `#define kLogBandTextureWidth 12
#define saturate(x) clamp(x, 0.0, 1.0)

varying vec2 vTexCoord;
varying vec4 vColor;
flat varying vec4 vBanding;
flat varying ivec4 vGlyph;

uint CalcRootCode(float y1, float y2, float y3) {
    uint i1 = floatBitsToUint(y1) >> 31U;
    uint i2 = floatBitsToUint(y2) >> 30U;
    uint i3 = floatBitsToUint(y3) >> 29U;

    uint shift = (i2 & 2U) | (i1 & ~2U);
    shift = (i3 & 4U) | (shift & ~4U);

    return ((0x2E74U >> shift) & 0x0101U);
}

bool TestCurve(uint code) {return (code != 0U);}
bool TestRoot1(uint code) {return ((code & 1U) != 0U);}
bool TestRoot2(uint code) {return (code > 1U);}

vec2 SolveHorizPoly(vec4 p12, vec2 p3) {
    vec2 a = p12.xy - p12.zw * 2.0 + p3;
    vec2 b = p12.xy - p12.zw;
    float ra = 1.0 / a.y;
    float rb = 0.5 / b.y;

    float d = sqrt(max(b.y * b.y - a.y * p12.y, 0.0));
    float t1 = (b.y - d) * ra;
    float t2 = (b.y + d) * ra;

    if (abs(a.y) < 1.0 / 65536.0) t1 = t2 = p12.y * rb;

    return (vec2((a.x * t1 - b.x * 2.0) * t1 + p12.x, (a.x * t2 - b.x * 2.0) * t2 + p12.x));
}

vec2 SolveVertPoly(vec4 p12, vec2 p3) {
    vec2 a = p12.xy - p12.zw * 2.0 + p3;
    vec2 b = p12.xy - p12.zw;
    float ra = 1.0 / a.x;
    float rb = 0.5 / b.x;

    float d = sqrt(max(b.x * b.x - a.x * p12.x, 0.0));
    float t1 = (b.x - d) * ra;
    float t2 = (b.x + d) * ra;

    if (abs(a.x) < 1.0 / 65536.0) t1 = t2 = p12.x * rb;

    return (vec2((a.y * t1 - b.y * 2.0) * t1 + p12.y, (a.y * t2 - b.y * 2.0) * t2 + p12.y));
}

ivec2 CalcBandLoc(ivec2 glyphLoc, uint offset) {
    ivec2 bandLoc = ivec2(glyphLoc.x + int(offset), glyphLoc.y);
    bandLoc.y += bandLoc.x >> kLogBandTextureWidth;
    bandLoc.x &= (1 << kLogBandTextureWidth) - 1;
    return (bandLoc);
}

float CalcCoverage(float xcov, float ycov, float xwgt, float ywgt, int flags) {
    float coverage = max(abs(xcov * xwgt + ycov * ywgt) / max(xwgt + ywgt, 1.0 / 65536.0), min(abs(xcov), abs(ycov)));

    coverage = saturate(coverage);

    #if defined(SLUG_WEIGHT)
        coverage = sqrt(coverage);
    #endif

    return (coverage);
}

vec4 RenderSlug(sampler2D curveData, usampler2D bandData, vec2 pixelPosition, vec4 vertexColor, vec4 bandTransform, ivec4 glyphData) {
    int curveIndex;

    vec2 renderCoord = pixelPosition;
    vec2 emsPerPixel = fwidth(renderCoord);
    vec2 pixelsPerEm = 1.0 / emsPerPixel;

    ivec2 bandMax = glyphData.zw;
    bandMax.y &= 0x00FF;

    ivec2 bandIndex = clamp(ivec2(renderCoord * bandTransform.xy + bandTransform.zw), ivec2(0, 0), bandMax);

    ivec2 glyphLoc = glyphData.xy;

    float xcov = 0.0;
    float xwgt = 0.0;

    uvec4 hbandData = texelFetch(bandData, ivec2(glyphLoc.x + bandIndex.y, glyphLoc.y), 0);
    ivec2 hbandLoc = CalcBandLoc(glyphLoc, hbandData.y);

    for (curveIndex = 0; curveIndex < int(hbandData.x); curveIndex++) {
        ivec2 curveLoc = ivec2(texelFetch(bandData, ivec2(hbandLoc.x + curveIndex, hbandLoc.y), 0).xy);
        vec4 p12 = texelFetch(curveData, curveLoc, 0) - vec4(renderCoord, renderCoord);
        vec2 p3 = texelFetch(curveData, ivec2(curveLoc.x + 1, curveLoc.y), 0).xy - renderCoord;

        if (max(max(p12.x, p12.z), p3.x) * pixelsPerEm.x < -0.5) break;

        uint code = CalcRootCode(p12.y, p12.w, p3.y);
        if (TestCurve(code)) {
            vec2 r = SolveHorizPoly(p12, p3) * pixelsPerEm.x;

            if (TestRoot1(code)) {
                xcov += saturate(r.x + 0.5);
                xwgt = max(xwgt, saturate(1.0 - abs(r.x) * 2.0));
            }

            if (TestRoot2(code)) {
                xcov -= saturate(r.y + 0.5);
                xwgt = max(xwgt, saturate(1.0 - abs(r.y) * 2.0));
            }
        }
    }

    float ycov = 0.0;
    float ywgt = 0.0;

    uvec4 vbandData = texelFetch(bandData, ivec2(glyphLoc.x + bandMax.y + 1 + bandIndex.x, glyphLoc.y), 0);
    ivec2 vbandLoc = CalcBandLoc(glyphLoc, vbandData.y);

    for (curveIndex = 0; curveIndex < int(vbandData.x); curveIndex++) {
        ivec2 curveLoc = ivec2(texelFetch(bandData, ivec2(vbandLoc.x + curveIndex, vbandLoc.y), 0).xy);
        vec4 p12 = texelFetch(curveData, curveLoc, 0) - vec4(renderCoord, renderCoord);
        vec2 p3 = texelFetch(curveData, ivec2(curveLoc.x + 1, curveLoc.y), 0).xy - renderCoord;

        if (max(max(p12.y, p12.w), p3.y) * pixelsPerEm.y < -0.5) break;

        uint code = CalcRootCode(p12.x, p12.z, p3.x);
        if (TestCurve(code)) {
            vec2 r = SolveVertPoly(p12, p3) * pixelsPerEm.y;

            if (TestRoot1(code)) {
                ycov -= saturate(r.x + 0.5);
                ywgt = max(ywgt, saturate(1.0 - abs(r.x) * 2.0));
            }

            if (TestRoot2(code)) {
                ycov += saturate(r.y + 0.5);
                ywgt = max(ywgt, saturate(1.0 - abs(r.y) * 2.0));
            }
        }
    }

    float coverage = CalcCoverage(xcov, ycov, xwgt, ywgt, glyphData.w);

    return vec4(vertexColor.xyz, coverage);
}

vec4 SlugFS(sampler2D curveData, usampler2D bandData) {
    vec4 color = RenderSlug(curveData, bandData, vTexCoord, vColor, vBanding, vGlyph);
    return vec4(color.xyz, color.w * vColor.w);
}`;
}
