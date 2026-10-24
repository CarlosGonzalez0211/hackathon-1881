/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 235961:236350.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0652(scope) {
scope.earcut = function earcut(r, e, i = 2) {
  const s = e && e.length,
    a = s ? e[0] * i : r.length;
  let o = scope.linkedList(r, 0, a, i, !0);
  const l = [];
  if (!o || o.next === o.prev) return l;
  let c, h, d;
  if (s && (o = scope.eliminateHoles(r, e, o, i)), r.length > 80 * i) {
    c = 1 / 0, h = 1 / 0;
    let p = -1 / 0,
      f = -1 / 0;
    for (let _ = i; _ < a; _ += i) {
      const x = r[_],
        b = r[_ + 1];
      x < c && (c = x), b < h && (h = b), x > p && (p = x), b > f && (f = b);
    }
    d = Math.max(p - c, f - h), d = d !== 0 ? 32767 / d : 0;
  }
  return scope.earcutLinked(o, l, i, c, h, d, 0), l;
};
}
