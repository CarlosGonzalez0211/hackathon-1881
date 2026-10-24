/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 239588:240179.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0663(scope) {
scope.findHoleBridge = function findHoleBridge(r, e) {
  let i = e;
  const s = r.x,
    a = r.y;
  let o = -1 / 0,
    l;
  if (scope.equals(r, i)) return i;
  do {
    if (scope.equals(r, i.next)) return i.next;
    if (a <= i.y && a >= i.next.y && i.next.y !== i.y) {
      const f = i.x + (a - i.y) * (i.next.x - i.x) / (i.next.y - i.y);
      if (f <= s && f > o && (o = f, l = i.x < i.next.x ? i : i.next, f === s)) return l;
    }
    i = i.next;
  } while (i !== e);
  if (!l) return null;
  const c = l,
    h = l.x,
    d = l.y;
  let p = 1 / 0;
  i = l;
  do {
    if (s >= i.x && i.x >= h && s !== i.x && scope.pointInTriangle(a < d ? s : o, a, h, d, a < d ? o : s, a, i.x, i.y)) {
      const f = Math.abs(a - i.y) / (s - i.x);
      scope.locallyInside(i, r) && (f < p || f === p && (i.x > l.x || i.x === l.x && scope.sectorContainsSector(l, i))) && (l = i, p = f);
    }
    i = i.next;
  } while (i !== c);
  return l;
};
}
