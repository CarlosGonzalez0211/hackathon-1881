/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1439622:1441090.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1929(scope) {
scope.ki = new WeakMap(), scope.lr = new WeakMap(), scope.cr = new WeakMap(), scope.ur = new WeakMap(), scope.wi = new WeakMap(), scope.Ei = new WeakMap(), scope.hr = new WeakMap(), scope.dr = new WeakMap(), scope.fr = new WeakMap(), scope.Hn = new WeakMap(), scope.pr = new WeakMap(), scope.mr = new WeakMap(), scope.gr = new WeakMap(), scope.vr = new WeakMap(), scope.Ar = new WeakMap(), scope.xr = new WeakMap(), scope.Qn = new WeakMap(), scope.$n = new WeakSet(), scope.Wa = function (e, i = 1, s = scope.L(this, scope.wi).DEFAULT) {
  const a = e._trailsData;
  if (Math.random() > scope.L(this, scope.mr)) {
    a.lastBirth = scope.renderInfo.time;
    return;
  }
  scope.L(this, scope.lr).set(1, 0, 0).applyQuaternion(e.quaternion), scope.L(this, scope.cr).set(0, 0, 1).applyQuaternion(e.quaternion), scope.L(this, scope.ur).set(0, 0, -1).applyQuaternion(e.quaternion);
  const o = scope.L(this, scope.Ar) * (s === scope.L(this, scope.wi).DEFAULT ? 1 : -1.25),
    l = scope.L(this, scope.xr) * (s === scope.L(this, scope.wi).DEFAULT ? 1 : 1.5),
    c = s === scope.L(this, scope.wi).LAND ? -.05 : scope.math.efit(e.velocityHorizontal, .025, .1, 0, .5),
    h = s === scope.L(this, scope.wi).DEFAULT ? scope.math.fit(Math.random(), 0, 1, .4, .6) : .1,
    d = (s === scope.L(this, scope.wi).DEFAULT ? .1 : .025) * scope.math.fit(e.velocityHorizontal, 0, .15, .1, 1),
    p = e.up;
  for (let f = 0; f < i; f++) {
    scope.L(this, scope.ki).copy(e.position).addScaledVector(e.up, o);
    const _ = a.lastSide * -1;
    scope.L(this, scope.ki).addScaledVector(scope.L(this, scope.lr), l * _), scope.L(this, scope.ki).addScaledVector(scope.L(this, scope.cr), c);
    const x = scope.L(this, scope.ki).toArray();
    scope.L(this, scope.ki).lerpVectors(p, scope.L(this, scope.ur), h).normalize(), scope.L(this, scope.ki).multiplyScalar(d);
    const b = scope.L(this, scope.ki).toArray();
    a.particleCnt += 1, a.lastBirth = scope.renderInfo.time, a.lastSide = _;
    const T = this.particles.spawn({
      expiration: scope.L(this, scope.vr),
      data: [x, 1, b, Math.random(), p.toArray(), 0]
    });
    scope.L(this, scope.Qn).set(T, a);
  }
}, scope.Bo = function (e) {
  if (!scope.L(this, scope.Qn).has(e)) return;
  const i = scope.L(this, scope.Qn).get(e);
  i.particleCnt -= 1, scope.L(this, scope.Qn).delete(e);
};
}
