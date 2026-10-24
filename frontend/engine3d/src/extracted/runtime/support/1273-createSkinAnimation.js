/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 763807:764556.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1273(scope) {
scope.createSkinAnimation = function createSkinAnimation(r, e) {
  if (!Object.hasOwn(e.userData, "frames") || !Object.hasOwn(e.userData, "fps")) return new scope.AnimationClip(r, 0, []);
  const i = e.userData,
    s = i.frames,
    a = e.attributes.position.count / s,
    o = s / i.fps,
    l = o / (s - 1),
    c = new Array(s).fill(0).map((f, _) => _ * l),
    h = {};
  ["position", "quaternion", "scale"].forEach(f => {
    const _ = e.attributes[f].array,
      x = e.attributes[f].itemSize,
      b = x === 4 ? scope._q0$4 : scope._v0$k;
    for (let T = 0; T < a; T++) {
      const M = `bone_${T}.${f}`;
      h[M] = {
        size: x,
        arr: []
      };
      const w = T * x;
      for (let D = 0; D < s; D++) b.fromArray(_, D * a * x + w), x === 4 && b.normalize(), h[M].arr.push(...b.toArray());
    }
  });
  const d = [];
  return Object.keys(h).forEach(f => {
    const _ = h[f].size === 4 ? scope.QuaternionKeyframeTrack : scope.VectorKeyframeTrack;
    d.push(new _(f, c, h[f].arr, scope.InterpolateLinear));
  }), new scope.AnimationClip(r, o, d);
};
}
