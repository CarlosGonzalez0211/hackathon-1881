/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1329345:1330319.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1786(scope) {
scope.buildTree = function buildTree(r, e, i, s, a) {
  const {
      maxDepth: o,
      verbose: l,
      maxLeafTris: c,
      strategy: h,
      onProgress: d,
      indirect: p
    } = a,
    f = r._indirectBuffer,
    _ = r.geometry,
    x = _.index ? _.index.array : null,
    b = p ? scope.partition_indirect : scope.partition,
    T = scope.getTriCount(_),
    M = new Float32Array(6);
  let w = !1;
  const D = new scope.MeshBVHNode();
  return scope.getBounds(e, i, s, D.boundingData, M), P(D, i, s, M), D;
  function R(U) {
    d && d(U / T);
  }
  function P(U, O, N, H = null, F = 0) {
    if (!w && F >= o && (w = !0, l && (console.warn(`MeshBVH: Max depth of ${o} reached when generating BVH. Consider increasing maxDepth.`), console.warn(_))), N <= c || F >= o) return R(O + N), U.offset = O, U.count = N, U;
    const k = scope.getOptimalSplit(U.boundingData, H, e, O, N, h);
    if (k.axis === -1) return R(O + N), U.offset = O, U.count = N, U;
    const W = b(f, x, e, O, N, k);
    if (W === O || W === O + N) R(O + N), U.offset = O, U.count = N;else {
      U.splitAxis = k.axis;
      const $ = new scope.MeshBVHNode(),
        Z = O,
        J = W - O;
      U.left = $, scope.getBounds(e, Z, J, $.boundingData, M), P($, Z, J, M, F + 1);
      const se = new scope.MeshBVHNode(),
        re = W,
        he = N - J;
      U.right = se, scope.getBounds(e, re, he, se.boundingData, M), P(se, re, he, M, F + 1);
    }
    return U;
  }
};
}
