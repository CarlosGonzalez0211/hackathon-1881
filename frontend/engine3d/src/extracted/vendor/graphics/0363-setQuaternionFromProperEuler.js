/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 33377:33901.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0363(scope) {
scope.setQuaternionFromProperEuler = function setQuaternionFromProperEuler(r, e, i, s, a) {
  const o = Math.cos,
    l = Math.sin,
    c = o(i / 2),
    h = l(i / 2),
    d = o((e + s) / 2),
    p = l((e + s) / 2),
    f = o((e - s) / 2),
    _ = l((e - s) / 2),
    x = o((s - e) / 2),
    b = l((s - e) / 2);
  switch (a) {
    case "XYX":
      r.set(c * p, h * f, h * _, c * d);
      break;
    case "YZY":
      r.set(h * _, c * p, h * f, c * d);
      break;
    case "ZXZ":
      r.set(h * f, h * _, c * p, c * d);
      break;
    case "XZX":
      r.set(c * p, h * b, h * x, c * d);
      break;
    case "YXY":
      r.set(h * x, c * p, h * b, c * d);
      break;
    case "ZYZ":
      r.set(h * b, h * x, c * p, c * d);
      break;
    default:
      console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + a);
  }
};
}
