/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1649876:1650313.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2074(scope) {
scope.fillEmptyLODs = function fillEmptyLODs(r, e) {
  const i = r[0],
    s = new scope.BufferGeometry();
  for (const o in i.attributes) {
    const l = i.getAttribute(o),
      {
        array: c,
        itemSize: h,
        normalized: d
      } = l,
      p = new l.constructor(new c.constructor(0), h, d);
    s.setAttribute(o, p);
  }
  const a = i.getIndex();
  for (s.setIndex(new a.constructor(new a.array.constructor(0), 1)); r.length < e;) for (let o = 0; o < r.length; o++) if (r[o].userData.batchId !== o) {
    const l = s.clone();
    l.userData = {
      batchId: o
    }, r.splice(o, 0, l);
    break;
  }
};
}
