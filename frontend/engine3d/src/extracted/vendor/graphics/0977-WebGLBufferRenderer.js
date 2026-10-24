/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 491737:492415.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0977(scope) {
scope.WebGLBufferRenderer = function WebGLBufferRenderer(r, e, i) {
  let s;
  function a(d) {
    s = d;
  }
  function o(d, p) {
    r.drawArrays(s, d, p), i.update(p, s, 1);
  }
  function l(d, p, f) {
    f !== 0 && (r.drawArraysInstanced(s, d, p, f), i.update(p, s, f));
  }
  function c(d, p, f) {
    if (f === 0) return;
    e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(s, d, 0, p, 0, f);
    let x = 0;
    for (let b = 0; b < f; b++) x += p[b];
    i.update(x, s, 1);
  }
  function h(d, p, f, _) {
    if (f === 0) return;
    const x = e.get("WEBGL_multi_draw");
    if (x === null) for (let b = 0; b < d.length; b++) l(d[b], p[b], _[b]);else {
      x.multiDrawArraysInstancedWEBGL(s, d, 0, p, 0, _, 0, f);
      let b = 0;
      for (let T = 0; T < f; T++) b += p[T] * _[T];
      i.update(b, s, 1);
    }
  }
  this.setMode = a, this.render = o, this.renderInstances = l, this.renderMultiDraw = c, this.renderMultiDrawInstances = h;
};
}
