/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 828998:829797.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1357(scope) {
scope.createCurvesTexture = function createCurvesTexture(r, e, i) {
  const s = new scope.DataTexture(new Float32Array(16), 2, 2, scope.RGBAFormat, scope.FloatType);
  return s._curves = [], s._url = r, s._closed = e, s._pointDensity = i, scope.makeTextureAwaitable(s), scope.__lifecycle.setTimeout(async () => {
    const a = await scope.geometryLoader.curves(r, e, i);
    s._curves = a;
    const o = scope.math.ceilPowerOfTwo(Math.max(2, a.length));
    let l = 2,
      c = 0;
    a.forEach(d => {
      l = Math.max(l, d.geometry.attributes.position.count), c = Math.max(c, d.curve.getLength());
    }), l > 2048 && console.warn(`Curves texture will be clamped to 2048 from ${l}`), l = scope.math.clamp(l, 2, 2048);
    const h = new Float32Array(o * l * 4);
    a.forEach((d, p) => {
      const f = d.curve.getSpacedPoints(l),
        _ = l * p * 4,
        x = 1 / (f.length - 1);
      f.forEach((b, T) => {
        const M = T * 4;
        h[_ + M + 0] = b.x, h[_ + M + 1] = b.y, h[_ + M + 2] = b.z, h[_ + M + 3] = x * T;
      });
    }), s.image = {
      data: h,
      width: l,
      height: o
    }, s.needsUpdate = !0, s._loaded.resolve(s);
  }, 0), s;
};
}
