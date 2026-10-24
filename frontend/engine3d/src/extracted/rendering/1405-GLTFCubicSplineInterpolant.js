/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 861815:862314.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1405(scope) {
scope.GLTFCubicSplineInterpolant = class GLTFCubicSplineInterpolant extends scope.Interpolant {
  constructor(e, i, s, a) {
    super(e, i, s, a);
  }
  copySampleValue_(e) {
    const i = this.resultBuffer,
      s = this.sampleValues,
      a = this.valueSize,
      o = e * a * 3 + a;
    for (let l = 0; l !== a; l++) i[l] = s[o + l];
    return i;
  }
  interpolate_(e, i, s, a) {
    const o = this.resultBuffer,
      l = this.sampleValues,
      c = this.valueSize,
      h = c * 2,
      d = c * 3,
      p = a - i,
      f = (s - i) / p,
      _ = f * f,
      x = _ * f,
      b = e * d,
      T = b - d,
      M = -2 * x + 3 * _,
      w = x - _,
      D = 1 - M,
      R = w - _ + f;
    for (let P = 0; P !== c; P++) {
      const U = l[T + P + c],
        O = l[T + P + h] * p,
        N = l[b + P + c],
        H = l[b + P] * p;
      o[P] = D * U + R * O + M * N + w * H;
    }
    return o;
  }
};
}
