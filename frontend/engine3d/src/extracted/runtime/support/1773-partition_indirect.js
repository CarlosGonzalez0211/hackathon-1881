/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1327485:1327754.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1773(scope) {
scope.partition_indirect = function partition_indirect(r, e, i, s, a, o) {
  let l = s,
    c = s + a - 1;
  const h = o.pos,
    d = o.axis * 2;
  for (;;) {
    for (; l <= c && i[l * 6 + d] < h;) l++;
    for (; l <= c && i[c * 6 + d] >= h;) c--;
    if (l < c) {
      let p = r[l];
      r[l] = r[c], r[c] = p;
      for (let f = 0; f < 6; f++) {
        let _ = i[l * 6 + f];
        i[l * 6 + f] = i[c * 6 + f], i[c * 6 + f] = _;
      }
      l++, c--;
    } else return l;
  }
};
}
