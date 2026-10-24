/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 180672:183129.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0555(scope) {
scope.Skeleton = class Skeleton {
  constructor(e = [], i = []) {
    this.uuid = scope.generateUUID(), this.bones = e.slice(0), this.boneInverses = i, this.boneMatrices = null, this.boneTexture = null, this.init();
  }
  init() {
    const e = this.bones,
      i = this.boneInverses;
    if (this.boneMatrices = new Float32Array(e.length * 16), i.length === 0) this.calculateInverses();else if (e.length !== i.length) {
      console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."), this.boneInverses = [];
      for (let s = 0, a = this.bones.length; s < a; s++) this.boneInverses.push(new scope.Matrix4());
    }
  }
  calculateInverses() {
    this.boneInverses.length = 0;
    for (let e = 0, i = this.bones.length; e < i; e++) {
      const s = new scope.Matrix4();
      this.bones[e] && s.copy(this.bones[e].matrixWorld).invert(), this.boneInverses.push(s);
    }
  }
  pose() {
    for (let e = 0, i = this.bones.length; e < i; e++) {
      const s = this.bones[e];
      s && s.matrixWorld.copy(this.boneInverses[e]).invert();
    }
    for (let e = 0, i = this.bones.length; e < i; e++) {
      const s = this.bones[e];
      s && (s.parent && s.parent.isBone ? (s.matrix.copy(s.parent.matrixWorld).invert(), s.matrix.multiply(s.matrixWorld)) : s.matrix.copy(s.matrixWorld), s.matrix.decompose(s.position, s.quaternion, s.scale));
    }
  }
  update() {
    const e = this.bones,
      i = this.boneInverses,
      s = this.boneMatrices,
      a = this.boneTexture;
    for (let o = 0, l = e.length; o < l; o++) {
      const c = e[o] ? e[o].matrixWorld : scope._identityMatrix$1;
      scope._offsetMatrix.multiplyMatrices(c, i[o]), scope._offsetMatrix.toArray(s, o * 16);
    }
    a !== null && (a.needsUpdate = !0);
  }
  clone() {
    return new scope.Skeleton(this.bones, this.boneInverses);
  }
  computeBoneTexture() {
    let e = Math.sqrt(this.bones.length * 4);
    e = Math.ceil(e / 4) * 4, e = Math.max(e, 4);
    const i = new Float32Array(e * e * 4);
    i.set(this.boneMatrices);
    const s = new scope.DataTexture(i, e, e, scope.RGBAFormat, scope.FloatType);
    return s.needsUpdate = !0, this.boneMatrices = i, this.boneTexture = s, this;
  }
  getBoneByName(e) {
    for (let i = 0, s = this.bones.length; i < s; i++) {
      const a = this.bones[i];
      if (a.name === e) return a;
    }
  }
  dispose() {
    this.boneTexture !== null && (this.boneTexture.dispose(), this.boneTexture = null);
  }
  fromJSON(e, i) {
    this.uuid = e.uuid;
    for (let s = 0, a = e.bones.length; s < a; s++) {
      const o = e.bones[s];
      let l = i[o];
      l === void 0 && (console.warn("THREE.Skeleton: No bone found with UUID:", o), l = new scope.Bone()), this.bones.push(l), this.boneInverses.push(new scope.Matrix4().fromArray(e.boneInverses[s]));
    }
    return this.init(), this;
  }
  toJSON() {
    const e = {
      metadata: {
        version: 4.7,
        type: "Skeleton",
        generator: "Skeleton.toJSON"
      },
      bones: [],
      boneInverses: []
    };
    e.uuid = this.uuid;
    const i = this.bones,
      s = this.boneInverses;
    for (let a = 0, o = i.length; a < o; a++) {
      const l = i[a];
      e.bones.push(l.uuid);
      const c = s[a];
      e.boneInverses.push(c.toArray());
    }
    return e;
  }
};
}
