/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 925367:925546.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1518(scope) {
scope.ClearMaskPass = class extends scope.Pass {
  constructor() {
    super("ClearMaskPass", null, null), this.needsSwap = !1;
  }
  render(r, e, i, s, a) {
    const o = r.state.buffers.stencil;
    o.setLocked(!1), o.setTest(!1);
  }
};
}
