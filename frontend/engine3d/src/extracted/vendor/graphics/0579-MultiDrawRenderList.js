/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 192947:193256.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0579(scope) {
scope.MultiDrawRenderList = class MultiDrawRenderList {
  constructor() {
    this.index = 0, this.pool = [], this.list = [];
  }
  push(e, i, s, a) {
    const o = this.pool,
      l = this.list;
    this.index >= o.length && o.push({
      start: -1,
      count: -1,
      z: -1,
      index: -1
    });
    const c = o[this.index];
    l.push(c), this.index++, c.start = e, c.count = i, c.z = s, c.index = a;
  }
  reset() {
    this.list.length = 0, this.index = 0;
  }
};
}
