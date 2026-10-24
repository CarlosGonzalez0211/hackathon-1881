/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 675692:678083.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1142(scope) {
scope.math = {
  TWO_PI: Math.PI * 2,
  HALF_PI: Math.PI * .5,
  DEG2RAD: Math.PI / 180,
  RAD2DEG: 180 / Math.PI,
  degrees(r) {
    return r * this.RAD2DEG;
  },
  radians(r) {
    return r * this.DEG2RAD;
  },
  clamp(r, e = 0, i = 1) {
    return Math.max(e, Math.min(i, r));
  },
  lerp(r, e, i) {
    return (1 - i) * r + i * e;
  },
  mix(r, e, i) {
    return this.lerp(r, e, i);
  },
  deltaRatio() {
    return scope.renderInfo.ratio;
  },
  lerpCoefFPS(r) {
    return this.damp(r, scope.renderInfo.ratio);
  },
  lerpFPS(r, e, i) {
    return this.lerp(r, e, this.lerpCoefFPS(i));
  },
  lerpFPSLimited(r, e, i, s = 1 / 0) {
    const a = this.lerpFPS(r, e, i),
      o = s * scope.renderInfo.ratio,
      l = this.clamp(a - r, -o, o);
    return r + l;
  },
  damp(r, e) {
    return 1 - Math.exp(Math.log(1 - r) * e);
  },
  frictionFPS(r) {
    return this.friction(r, scope.renderInfo.ratio);
  },
  friction(r, e) {
    return Math.exp(Math.log(r) * e);
  },
  efit(r, e, i, s, a) {
    return s + (r - e) * (a - s) / (i - e);
  },
  fit(r, e, i, s, a) {
    return this.efit(this.clamp(r, Math.min(e, i), Math.max(e, i)), e, i, s, a);
  },
  fit01(r, e, i) {
    return this.fit(r, 0, 1, e, i);
  },
  fit10(r, e, i) {
    return this.fit(r, 1, 0, e, i);
  },
  fit11(r, e, i) {
    return this.fit(r, -1, 1, e, i);
  },
  step(r, e) {
    return e < r ? 0 : 1;
  },
  linearstep(r, e, i) {
    return this.clamp((i - r) / (e - r), 0, 1);
  },
  smoothstep(r, e, i) {
    const s = this.linearstep(r, e, i);
    return s * s * (3 - 2 * s);
  },
  smootherstep(r, e, i) {
    const s = this.linearstep(r, e, i);
    return s * s * s * (s * (s * 6 - 15) + 10);
  },
  parabola(r, e) {
    return Math.pow(4 * r * (1 - r), e);
  },
  pcurve(r, e, i) {
    return Math.pow(e + i, e + i) / (Math.pow(e, e) * Math.pow(i, i)) * Math.pow(r, e) * Math.pow(1 - r, i);
  },
  falloff(r, e, i, s, a) {
    const o = s * Math.sign(i - e),
      l = this.mix(e - o, i, a);
    return this.linearstep(l + o, l, r);
  },
  falloffsmooth(r, e, i, s, a) {
    const o = s * Math.sign(i - e),
      l = this.mix(e - o, i, a);
    return this.smoothstep(l + o, l, r);
  },
  round(r, e = 0) {
    const i = Math.pow(10, e);
    return Math.round(r * i) / i;
  },
  isPowerOfTwo(r) {
    return (r & r - 1) === 0 && r !== 0;
  },
  ceilPowerOfTwo(r) {
    return Math.pow(2, Math.ceil(Math.log(r) / Math.LN2));
  },
  floorPowerOfTwo(r) {
    return Math.pow(2, Math.floor(Math.log(r) / Math.LN2));
  },
  makeAnglePositive(r) {
    const e = r % this.TWO_PI;
    return e < 0 ? this.TWO_PI + e : e;
  },
  getShortestRotationAngle(r, e) {
    const i = this.makeAnglePositive(r);
    let s = this.makeAnglePositive(e);
    return Math.abs(s - i) > Math.PI && (s > i ? s -= this.TWO_PI : s += this.TWO_PI), r + s - i;
  },
  latLonTo3D(r, e, i) {
    const s = this.HALF_PI - this.radians(r),
      a = this.radians(e);
    return {
      x: i * Math.sin(s) * Math.sin(a),
      y: i * Math.cos(s),
      z: i * Math.sin(s) * Math.cos(a)
    };
  },
  getTextureSizeParticles(r = 4, e = 1) {
    return Math.max(Math.ceil(Math.sqrt(r * e) / e) * e, e);
  },
  uidAlphabet: "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict",
  uid(r = 21) {
    let e = "",
      i = r | 0;
    for (; i--;) e += this.uidAlphabet[Math.random() * 64 | 0];
    return e;
  }
};
}
