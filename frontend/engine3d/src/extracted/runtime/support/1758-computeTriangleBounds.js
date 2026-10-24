/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1323244:1323947.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1758(scope) {
scope.computeTriangleBounds = function computeTriangleBounds(r, e = null, i = null, s = null) {
  const a = r.attributes.position,
    o = r.index ? r.index.array : null,
    l = scope.getTriCount(r),
    c = a.normalized;
  let h;
  e === null ? (h = new Float32Array(l * 6), i = 0, s = l) : (h = e, i = i || 0, s = s || l);
  const d = a.array,
    p = a.offset || 0;
  let f = 3;
  a.isInterleavedBufferAttribute && (f = a.data.stride);
  const _ = ["getX", "getY", "getZ"];
  for (let x = i; x < i + s; x++) {
    const b = x * 3,
      T = x * 6;
    let M = b + 0,
      w = b + 1,
      D = b + 2;
    o && (M = o[M], w = o[w], D = o[D]), c || (M = M * f + p, w = w * f + p, D = D * f + p);
    for (let R = 0; R < 3; R++) {
      let P, U, O;
      c ? (P = a[_[R]](M), U = a[_[R]](w), O = a[_[R]](D)) : (P = d[M + R], U = d[w + R], O = d[D + R]);
      let N = P;
      U < N && (N = U), O < N && (N = O);
      let H = P;
      U > H && (H = U), O > H && (H = O);
      const F = (H - N) / 2,
        k = R * 2;
      h[T + k + 0] = N + F, h[T + k + 1] = F + (Math.abs(N) + F) * scope.FLOAT32_EPSILON;
    }
  }
  return h;
};
}
