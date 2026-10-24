/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 513004:514794.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1007(scope) {
scope.WebGLMorphtargets = function WebGLMorphtargets(r, e, i) {
  const s = new WeakMap(),
    a = new scope.Vector4();
  function o(l, c, h) {
    const d = l.morphTargetInfluences,
      p = c.morphAttributes.position || c.morphAttributes.normal || c.morphAttributes.color,
      f = p !== void 0 ? p.length : 0;
    let _ = s.get(c);
    if (_ === void 0 || _.count !== f) {
      let F = function () {
        N.dispose(), s.delete(c), scope.__lifecycle.unlisten(c, "dispose", F);
      };
      _ !== void 0 && _.texture.dispose();
      const x = c.morphAttributes.position !== void 0,
        b = c.morphAttributes.normal !== void 0,
        T = c.morphAttributes.color !== void 0,
        M = c.morphAttributes.position || [],
        w = c.morphAttributes.normal || [],
        D = c.morphAttributes.color || [];
      let R = 0;
      x === !0 && (R = 1), b === !0 && (R = 2), T === !0 && (R = 3);
      let P = c.attributes.position.count * R,
        U = 1;
      P > e.maxTextureSize && (U = Math.ceil(P / e.maxTextureSize), P = e.maxTextureSize);
      const O = new Float32Array(P * U * 4 * f),
        N = new scope.DataArrayTexture(O, P, U, f);
      N.type = scope.FloatType, N.needsUpdate = !0;
      const H = R * 4;
      for (let k = 0; k < f; k++) {
        const W = M[k],
          $ = w[k],
          Z = D[k],
          J = P * U * 4 * k;
        for (let se = 0; se < W.count; se++) {
          const re = se * H;
          x === !0 && (a.fromBufferAttribute(W, se), O[J + re + 0] = a.x, O[J + re + 1] = a.y, O[J + re + 2] = a.z, O[J + re + 3] = 0), b === !0 && (a.fromBufferAttribute($, se), O[J + re + 4] = a.x, O[J + re + 5] = a.y, O[J + re + 6] = a.z, O[J + re + 7] = 0), T === !0 && (a.fromBufferAttribute(Z, se), O[J + re + 8] = a.x, O[J + re + 9] = a.y, O[J + re + 10] = a.z, O[J + re + 11] = Z.itemSize === 4 ? a.w : 1);
        }
      }
      _ = {
        count: f,
        texture: N,
        size: new scope.Vector2(P, U)
      }, s.set(c, _), scope.__lifecycle.listen(c, "dispose", F);
    }
    if (l.isInstancedMesh === !0 && l.morphTexture !== null) h.getUniforms().setValue(r, "morphTexture", l.morphTexture, i);else {
      let x = 0;
      for (let T = 0; T < d.length; T++) x += d[T];
      const b = c.morphTargetsRelative ? 1 : 1 - x;
      h.getUniforms().setValue(r, "morphTargetBaseInfluence", b), h.getUniforms().setValue(r, "morphTargetInfluences", d);
    }
    h.getUniforms().setValue(r, "morphTargetsTexture", _.texture, i), h.getUniforms().setValue(r, "morphTargetsTextureSize", _.size);
  }
  return {
    update: o
  };
};
}
