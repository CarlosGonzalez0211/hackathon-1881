/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 709223:710286.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1162(scope) {
scope.customEase = function customEase(r, e, i = 1) {
  let s = r,
    a = e;
  if (!a) {
    if (scope.customEasesCache.has(r)) return scope.customEasesCache.get(r);
    a = r, s = scope.math.uid();
  }
  let o = null;
  try {
    const _ = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${a.trim()}"/></svg>`;
    o = scope.parser.parse(_).paths[0].subPaths[0];
  } catch {
    return console.warn(`customEase: invalid curve path: ${a}`), scope.customEasesCache.set(s, x => x), scope.customEasesCache.get(s);
  }
  const l = o.getPoints(Math.round(75 * o.getLength() * i));
  if (l[0].x !== 0 || l[l.length - 1].x !== 1) return console.warn(`customEase: curve points must start at 0 and end at 1: ${a}`), scope.customEasesCache.set(s, _ => _), scope.customEasesCache.get(s);
  const c = [],
    h = l.length * 2,
    d = h - 1,
    p = 1 / d;
  for (let _ = 0; _ < h; _++) {
    const x = _ * p;
    let b = 0;
    for (let D = 0; D < l.length; D++) {
      if (x < l[0].x) {
        b = 0;
        break;
      }
      if (x > l[l.length - 1].x) {
        b = l.length - 1;
        break;
      }
      const R = l[D - 1] || l[D],
        P = l[D];
      if (R.x <= x && P.x >= x) {
        b = D;
        break;
      }
    }
    const T = l[b],
      M = l[b - 1] || T,
      w = T.x === M.x ? 0 : scope.math.fit(x, M.x, T.x, 0, 1);
    c.push(scope.math.lerp(M.y, T.y, w));
  }
  const f = _ => {
    const x = scope.math.clamp(_, 0, 1) * d,
      b = Math.ceil(x),
      T = Math.max(0, b - 1),
      M = x - T;
    return scope.math.lerp(c[T], c[b], M);
  };
  return scope.customEasesCache.set(s, f), f;
};
}
