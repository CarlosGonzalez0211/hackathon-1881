/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 890577:890798.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1456(scope) {
scope.Pass$1 = class {
  constructor() {
    this.isPass = !0, this.enabled = !0, this.needsSwap = !0, this.clear = !1, this.renderToScreen = !1;
  }
  setSize() {}
  render() {
    console.error("THREE.Pass: .render() must be implemented in derived pass.");
  }
  dispose() {}
};
}
