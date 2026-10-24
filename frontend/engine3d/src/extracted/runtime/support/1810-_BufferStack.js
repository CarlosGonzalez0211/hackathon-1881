/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1342415:1342820.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1810(scope) {
scope._BufferStack = class _BufferStack {
  constructor() {
    this.float32Array = null, this.uint16Array = null, this.uint32Array = null;
    const e = [];
    let i = null;
    this.setBuffer = s => {
      i && e.push(i), i = s, this.float32Array = new Float32Array(s), this.uint16Array = new Uint16Array(s), this.uint32Array = new Uint32Array(s);
    }, this.clearBuffer = () => {
      i = null, this.float32Array = null, this.uint16Array = null, this.uint32Array = null, e.length !== 0 && this.setBuffer(e.pop());
    };
  }
};
}
