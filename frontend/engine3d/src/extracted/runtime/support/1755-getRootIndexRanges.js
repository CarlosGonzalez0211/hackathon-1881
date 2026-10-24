/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1322126:1322564.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1755(scope) {
scope.getRootIndexRanges = function getRootIndexRanges(r, e) {
  if (!r.groups || !r.groups.length) return scope.getFullGeometryRange(r, e);
  const i = [],
    s = new Set(),
    a = e || r.drawRange,
    o = a.start / 3,
    l = (a.start + a.count) / 3;
  for (const h of r.groups) {
    const d = h.start / 3,
      p = (h.start + h.count) / 3;
    s.add(Math.max(o, d)), s.add(Math.min(l, p));
  }
  const c = Array.from(s.values()).sort((h, d) => h - d);
  for (let h = 0; h < c.length - 1; h++) {
    const d = c[h],
      p = c[h + 1];
    i.push({
      offset: Math.floor(d),
      count: Math.floor(p - d)
    });
  }
  return i;
};
}
