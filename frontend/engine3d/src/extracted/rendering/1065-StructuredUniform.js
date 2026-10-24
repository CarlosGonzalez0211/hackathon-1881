/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 524271:524450.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1065(scope) {
scope.StructuredUniform = class StructuredUniform {
  constructor(e) {
    this.id = e, this.seq = [], this.map = {};
  }
  setValue(e, i, s) {
    const a = this.seq;
    for (let o = 0, l = a.length; o !== l; ++o) {
      const c = a[o];
      c.setValue(e, i[c.id], s);
    }
  }
};
}
