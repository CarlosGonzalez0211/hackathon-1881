/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 240445:240746.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0666(scope) {
scope.sortLinked = function sortLinked(r) {
  let e,
    i = 1;
  do {
    let s = r,
      a;
    r = null;
    let o = null;
    for (e = 0; s;) {
      e++;
      let l = s,
        c = 0;
      for (let d = 0; d < i && (c++, l = l.nextZ, !!l); d++);
      let h = i;
      for (; c > 0 || h > 0 && l;) c !== 0 && (h === 0 || !l || s.z <= l.z) ? (a = s, s = s.nextZ, c--) : (a = l, l = l.nextZ, h--), o ? o.nextZ = a : r = a, a.prevZ = o, o = a;
      s = l;
    }
    o.nextZ = null, i *= 2;
  } while (e > 1);
  return r;
};
}
