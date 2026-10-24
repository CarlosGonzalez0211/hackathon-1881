/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 502998:503798.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0995(scope) {
scope._createPlanes = function _createPlanes(r) {
  const e = [],
    i = [],
    s = [];
  let a = r;
  const o = r - scope.LOD_MIN + 1 + scope.EXTRA_LOD_SIGMA.length;
  for (let l = 0; l < o; l++) {
    const c = Math.pow(2, a);
    i.push(c);
    let h = 1 / c;
    l > r - scope.LOD_MIN ? h = scope.EXTRA_LOD_SIGMA[l - r + scope.LOD_MIN - 1] : l === 0 && (h = 0), s.push(h);
    const d = 1 / (c - 2),
      p = -d,
      f = 1 + d,
      _ = [p, p, f, p, f, f, p, p, f, f, p, f],
      x = 6,
      b = 6,
      T = 3,
      M = 2,
      w = 1,
      D = new Float32Array(T * b * x),
      R = new Float32Array(M * b * x),
      P = new Float32Array(w * b * x);
    for (let O = 0; O < x; O++) {
      const N = O % 3 * 2 / 3 - 1,
        H = O > 2 ? 0 : -1,
        F = [N, H, 0, N + 2 / 3, H, 0, N + 2 / 3, H + 1, 0, N, H, 0, N + 2 / 3, H + 1, 0, N, H + 1, 0];
      D.set(F, T * b * O), R.set(_, M * b * O);
      const k = [O, O, O, O, O, O];
      P.set(k, w * b * O);
    }
    const U = new scope.BufferGeometry();
    U.setAttribute("position", new scope.BufferAttribute(D, T)), U.setAttribute("uv", new scope.BufferAttribute(R, M)), U.setAttribute("faceIndex", new scope.BufferAttribute(P, w)), e.push(U), a > scope.LOD_MIN && a--;
  }
  return {
    lodPlanes: e,
    sizeLods: i,
    sigmas: s
  };
};
}
