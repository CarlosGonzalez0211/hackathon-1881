/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1324838:1327029.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1769(scope) {
scope.getOptimalSplit = function getOptimalSplit(r, e, i, s, a, o) {
  let l = -1,
    c = 0;
  if (o === scope.CENTER) l = scope.getLongestEdgeIndex(e), l !== -1 && (c = (e[l] + e[l + 3]) / 2);else if (o === scope.AVERAGE) l = scope.getLongestEdgeIndex(r), l !== -1 && (c = scope.getAverage(i, s, a, l));else if (o === scope.SAH) {
    const h = scope.computeSurfaceArea(r);
    let d = scope.TRIANGLE_INTERSECT_COST * a;
    const p = s * 6,
      f = (s + a) * 6;
    for (let _ = 0; _ < 3; _++) {
      const x = e[_],
        M = (e[_ + 3] - x) / scope.BIN_COUNT;
      if (a < scope.BIN_COUNT / 4) {
        const w = [...scope.sahBins];
        w.length = a;
        let D = 0;
        for (let P = p; P < f; P += 6, D++) {
          const U = w[D];
          U.candidate = i[P + 2 * _], U.count = 0;
          const {
            bounds: O,
            leftCacheBounds: N,
            rightCacheBounds: H
          } = U;
          for (let F = 0; F < 3; F++) H[F] = 1 / 0, H[F + 3] = -1 / 0, N[F] = 1 / 0, N[F + 3] = -1 / 0, O[F] = 1 / 0, O[F + 3] = -1 / 0;
          scope.expandByTriangleBounds(P, i, O);
        }
        w.sort(scope.binsSort);
        let R = a;
        for (let P = 0; P < R; P++) {
          const U = w[P];
          for (; P + 1 < R && w[P + 1].candidate === U.candidate;) w.splice(P + 1, 1), R--;
        }
        for (let P = p; P < f; P += 6) {
          const U = i[P + 2 * _];
          for (let O = 0; O < R; O++) {
            const N = w[O];
            U >= N.candidate ? scope.expandByTriangleBounds(P, i, N.rightCacheBounds) : (scope.expandByTriangleBounds(P, i, N.leftCacheBounds), N.count++);
          }
        }
        for (let P = 0; P < R; P++) {
          const U = w[P],
            O = U.count,
            N = a - U.count,
            H = U.leftCacheBounds,
            F = U.rightCacheBounds;
          let k = 0;
          O !== 0 && (k = scope.computeSurfaceArea(H) / h);
          let W = 0;
          N !== 0 && (W = scope.computeSurfaceArea(F) / h);
          const $ = scope.TRAVERSAL_COST + scope.TRIANGLE_INTERSECT_COST * (k * O + W * N);
          $ < d && (l = _, d = $, c = U.candidate);
        }
      } else {
        for (let R = 0; R < scope.BIN_COUNT; R++) {
          const P = scope.sahBins[R];
          P.count = 0, P.candidate = x + M + R * M;
          const U = P.bounds;
          for (let O = 0; O < 3; O++) U[O] = 1 / 0, U[O + 3] = -1 / 0;
        }
        for (let R = p; R < f; R += 6) {
          let O = ~~((i[R + 2 * _] - x) / M);
          O >= scope.BIN_COUNT && (O = scope.BIN_COUNT - 1);
          const N = scope.sahBins[O];
          N.count++, scope.expandByTriangleBounds(R, i, N.bounds);
        }
        const w = scope.sahBins[scope.BIN_COUNT - 1];
        scope.copyBounds(w.bounds, w.rightCacheBounds);
        for (let R = scope.BIN_COUNT - 2; R >= 0; R--) {
          const P = scope.sahBins[R],
            U = scope.sahBins[R + 1];
          scope.unionBounds(P.bounds, U.rightCacheBounds, P.rightCacheBounds);
        }
        let D = 0;
        for (let R = 0; R < scope.BIN_COUNT - 1; R++) {
          const P = scope.sahBins[R],
            U = P.count,
            O = P.bounds,
            H = scope.sahBins[R + 1].rightCacheBounds;
          U !== 0 && (D === 0 ? scope.copyBounds(O, scope.leftBounds) : scope.unionBounds(O, scope.leftBounds, scope.leftBounds)), D += U;
          let F = 0,
            k = 0;
          D !== 0 && (F = scope.computeSurfaceArea(scope.leftBounds) / h);
          const W = a - D;
          W !== 0 && (k = scope.computeSurfaceArea(H) / h);
          const $ = scope.TRAVERSAL_COST + scope.TRIANGLE_INTERSECT_COST * (F * D + k * W);
          $ < d && (l = _, d = $, c = P.candidate);
        }
      }
    }
  } else console.warn(`MeshBVH: Invalid build strategy value ${o} used.`);
  return {
    axis: l,
    pos: c
  };
};
}
