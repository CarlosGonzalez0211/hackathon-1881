/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 266834:267049.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0735(scope) {
scope.Cache = {
  enabled: !1,
  files: {},
  add: function (r, e) {
    this.enabled !== !1 && (this.files[r] = e);
  },
  get: function (r) {
    if (this.enabled !== !1) return this.files[r];
  },
  remove: function (r) {
    delete this.files[r];
  },
  clear: function () {
    this.files = {};
  }
};
}
