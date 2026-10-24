/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 511698:512472.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1005(scope) {
scope.WebGLIndexedBufferRenderer = function WebGLIndexedBufferRenderer(r, e, i) {
  let s;
  function a(_) {
    s = _;
  }
  let o, l;
  function c(_) {
    o = _.type, l = _.bytesPerElement;
  }
  function h(_, x) {
    r.drawElements(s, x, o, _ * l), i.update(x, s, 1);
  }
  function d(_, x, b) {
    b !== 0 && (r.drawElementsInstanced(s, x, o, _ * l, b), i.update(x, s, b));
  }
  function p(_, x, b) {
    if (b === 0) return;
    e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(s, x, 0, o, _, 0, b);
    let M = 0;
    for (let w = 0; w < b; w++) M += x[w];
    i.update(M, s, 1);
  }
  function f(_, x, b, T) {
    if (b === 0) return;
    const M = e.get("WEBGL_multi_draw");
    if (M === null) for (let w = 0; w < _.length; w++) d(_[w] / l, x[w], T[w]);else {
      M.multiDrawElementsInstancedWEBGL(s, x, 0, o, _, 0, T, 0, b);
      let w = 0;
      for (let D = 0; D < b; D++) w += x[D] * T[D];
      i.update(w, s, 1);
    }
  }
  this.setMode = a, this.setIndex = c, this.render = h, this.renderInstances = d, this.renderMultiDraw = p, this.renderMultiDrawInstances = f;
};
}
