/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1321932:1322126.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1754(scope) {
scope.getFullGeometryRange = function getFullGeometryRange(r, e) {
  const i = scope.getTriCount(r),
    s = e || r.drawRange,
    a = s.start / 3,
    o = (s.start + s.count) / 3,
    l = Math.max(0, a),
    c = Math.min(i, o) - l;
  return [{
    offset: Math.floor(l),
    count: Math.floor(c)
  }];
};
}
