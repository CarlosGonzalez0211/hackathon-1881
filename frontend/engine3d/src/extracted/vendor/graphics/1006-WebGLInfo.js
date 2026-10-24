/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 512472:513004.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1006(scope) {
scope.WebGLInfo = function WebGLInfo(r) {
  const e = {
      geometries: 0,
      textures: 0
    },
    i = {
      frame: 0,
      calls: 0,
      triangles: 0,
      points: 0,
      lines: 0
    };
  function s(o, l, c) {
    switch (i.calls++, l) {
      case r.TRIANGLES:
        i.triangles += c * (o / 3);
        break;
      case r.LINES:
        i.lines += c * (o / 2);
        break;
      case r.LINE_STRIP:
        i.lines += c * (o - 1);
        break;
      case r.LINE_LOOP:
        i.lines += c * o;
        break;
      case r.POINTS:
        i.points += c * o;
        break;
      default:
        console.error("THREE.WebGLInfo: Unknown draw mode:", l);
        break;
    }
  }
  function a() {
    i.calls = 0, i.triangles = 0, i.points = 0, i.lines = 0;
  }
  return {
    memory: e,
    render: i,
    programs: null,
    autoReset: !0,
    reset: a,
    update: s
  };
};
}
