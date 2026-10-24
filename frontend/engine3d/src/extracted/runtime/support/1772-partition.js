/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1327188:1327485.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1772(scope) {
scope.partition = function partition(r, e, i, s, a, o) {
  let l = s,
    c = s + a - 1;
  const h = o.pos,
    d = o.axis * 2;
  for (;;) {
    for (; l <= c && i[l * 6 + d] < h;) l++;
    for (; l <= c && i[c * 6 + d] >= h;) c--;
    if (l < c) {
      for (let p = 0; p < 3; p++) {
        let f = e[l * 3 + p];
        e[l * 3 + p] = e[c * 3 + p], e[c * 3 + p] = f;
      }
      for (let p = 0; p < 6; p++) {
        let f = i[l * 6 + p];
        i[l * 6 + p] = i[c * 6 + p], i[c * 6 + p] = f;
      }
      l++, c--;
    } else return l;
  }
};
}
