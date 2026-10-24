/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 564340:564724.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1115(scope) {
scope.WebGLRenderState = function WebGLRenderState(r) {
  const e = new scope.WebGLLights(r),
    i = [],
    s = [];
  function a(p) {
    d.camera = p, i.length = 0, s.length = 0;
  }
  function o(p) {
    i.push(p);
  }
  function l(p) {
    s.push(p);
  }
  function c() {
    e.setup(i);
  }
  function h(p) {
    e.setupView(i, p);
  }
  const d = {
    lightsArray: i,
    shadowsArray: s,
    camera: null,
    lights: e,
    transmissionRenderTarget: {}
  };
  return {
    init: a,
    state: d,
    setupLights: c,
    setupLightsView: h,
    pushLight: o,
    pushShadow: l
  };
};
}
