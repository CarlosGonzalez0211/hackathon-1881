/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1344450:1344938.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1818(scope) {
scope.closestPointToPoint = function closestPointToPoint(r, e, i = {}, s = 0, a = 1 / 0) {
  const o = s * s,
    l = a * a;
  let c = 1 / 0,
    h = null;
  if (r.shapecast({
    boundsTraverseOrder: p => (scope.temp.copy(e).clamp(p.min, p.max), scope.temp.distanceToSquared(e)),
    intersectsBounds: (p, f, _) => _ < c && _ < l,
    intersectsTriangle: (p, f) => {
      p.closestPointToPoint(e, scope.temp);
      const _ = e.distanceToSquared(scope.temp);
      return _ < c && (scope.temp1$2.copy(scope.temp), c = _, h = f), _ < o;
    }
  }), c === 1 / 0) return null;
  const d = Math.sqrt(c);
  return i.point ? i.point.copy(scope.temp1$2) : i.point = scope.temp1$2.clone(), i.distance = d, i.faceIndex = h, i;
};
}
