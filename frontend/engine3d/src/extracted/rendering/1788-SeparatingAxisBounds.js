/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1331050:1331437.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1788(scope) {
scope.SeparatingAxisBounds = class SeparatingAxisBounds {
  constructor() {
    this.min = 1 / 0, this.max = -1 / 0;
  }
  setFromPointsField(e, i) {
    let s = 1 / 0,
      a = -1 / 0;
    for (let o = 0, l = e.length; o < l; o++) {
      const h = e[o][i];
      s = h < s ? h : s, a = h > a ? h : a;
    }
    this.min = s, this.max = a;
  }
  setFromPoints(e, i) {
    let s = 1 / 0,
      a = -1 / 0;
    for (let o = 0, l = i.length; o < l; o++) {
      const c = i[o],
        h = e.dot(c);
      s = h < s ? h : s, a = h > a ? h : a;
    }
    this.min = s, this.max = a;
  }
  isSeparated(e) {
    return this.min > e.max || e.min > this.max;
  }
};
}
