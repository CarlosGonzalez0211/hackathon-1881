/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 935476:936429.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1531(scope) {
scope.GaussKernel = class {
  constructor(r, e = 2) {
    this.weights = null, this.offsets = null, this.linearWeights = null, this.linearOffsets = null, this.generate(r, e);
  }
  get steps() {
    return this.offsets === null ? 0 : this.offsets.length;
  }
  get linearSteps() {
    return this.linearOffsets === null ? 0 : this.linearOffsets.length;
  }
  generate(r, e) {
    if (r < 3 || r > 1020) throw new Error("The kernel size must be in the range [3, 1020]");
    const i = r + e * 2,
      s = e > 0 ? scope.getCoefficients(i).slice(e, -e) : scope.getCoefficients(i),
      a = Math.floor((s.length - 1) / 2),
      o = s.reduce((f, _) => f + _, 0),
      l = s.slice(a),
      c = [...Array(a + 1).keys()],
      h = new Float64Array(Math.floor(c.length / 2)),
      d = new Float64Array(h.length);
    h[0] = l[0] / o;
    for (let f = 1, _ = 1, x = c.length - 1; f < x; f += 2, ++_) {
      const b = c[f],
        T = c[f + 1],
        M = l[f],
        w = l[f + 1],
        D = M + w,
        R = (b * M + T * w) / D;
      h[_] = D / o, d[_] = R;
    }
    for (let f = 0, _ = l.length, x = 1 / o; f < _; ++f) l[f] *= x;
    const p = (h.reduce((f, _) => f + _, 0) - h[0] * .5) * 2;
    if (p !== 0) for (let f = 0, _ = h.length, x = 1 / p; f < _; ++f) h[f] *= x;
    this.offsets = c, this.weights = l, this.linearOffsets = d, this.linearWeights = h;
  }
};
}
