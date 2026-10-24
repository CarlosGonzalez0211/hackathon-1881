/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 758202:759201.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1258(scope) {
scope.createVertexAnimation = function createVertexAnimation(r) {
  const e = r.userData,
    i = Object.keys(r.attributes),
    s = i.filter(c => c.slice(-2) === "_1").map(c => c.substring(0, c.length - 2)),
    a = i.filter(c => c.slice(-2) === "_2").map(c => c.substring(0, c.length - 2)),
    o = new scope.BufferGeometry();
  r.index && o.setIndex(r.index.clone()), s.forEach(c => {
    o.setAttribute(c, r.attributes[`${c}_1`].clone());
  });
  const l = {};
  if (a.length > 0) {
    const c = r.attributes[`${a[0]}_1`].count,
      h = c * e.frames,
      d = scope.math.getTextureSizeParticles(h),
      p = d * d;
    l.uAnimInfo = {
      value: new scope.Vector3(e.fps, e.frames, c),
      ignore: !0
    };
    const f = new Float32Array(c);
    for (let _ = 0; _ < f.length; _++) f[_] = _;
    o.setAttribute("vposition", new scope.BufferAttribute(f, 1)), a.forEach(_ => {
      const x = new Float32Array(p * 4);
      for (let T = 0; T < e.frames; T++) {
        const M = r.attributes[`${_}_${T + 1}`].array;
        for (let w = 0; w < c; w++) {
          const D = T * c * 4 + w * 4,
            R = w * 3;
          x[D + 0] = M[R + 0], x[D + 1] = M[R + 1], x[D + 2] = M[R + 2], x[D + 3] = 1;
        }
      }
      const b = new scope.DataTexture(x, d, d, scope.RGBAFormat, scope.FloatType);
      b.needsUpdate = !0, l[`t${scope.capitalizeFirstLetter(_)}`] = {
        value: b
      };
    });
  }
  return o.__vertexAnimationUniforms = l, o;
};
}
