/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 918443:918605.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1510(scope) {
scope.ClearMaskPass$1 = class extends scope.Pass$1 {
  constructor() {
    super(), this.needsSwap = !1;
  }
  render(e) {
    e.state.buffers.stencil.setLocked(!1), e.state.buffers.stencil.setTest(!1);
  }
};
}
