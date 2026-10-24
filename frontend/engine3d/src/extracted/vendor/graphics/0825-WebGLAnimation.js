/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 328595:328893.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0825(scope) {
scope.WebGLAnimation = function WebGLAnimation() {
  let r = null,
    e = !1,
    i = null,
    s = null;
  function a(o, l) {
    i(o, l), s = r.requestAnimationFrame(a);
  }
  return {
    start: function () {
      e !== !0 && i !== null && (s = r.requestAnimationFrame(a), e = !0);
    },
    stop: function () {
      r.cancelAnimationFrame(s), e = !1;
    },
    setAnimationLoop: function (o) {
      i = o;
    },
    setContext: function (o) {
      r = o;
    }
  };
};
}
