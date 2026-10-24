/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1346819:1347060.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1833(scope) {
scope.setTriangle = function setTriangle(r, e, i, s) {
  const a = r.a,
    o = r.b,
    l = r.c;
  let c = e,
    h = e + 1,
    d = e + 2;
  i && (c = i.getX(c), h = i.getX(h), d = i.getX(d)), a.x = s.getX(c), a.y = s.getY(c), a.z = s.getZ(c), o.x = s.getX(h), o.y = s.getY(h), o.z = s.getZ(h), l.x = s.getX(d), l.y = s.getY(d), l.z = s.getZ(d);
};
}
