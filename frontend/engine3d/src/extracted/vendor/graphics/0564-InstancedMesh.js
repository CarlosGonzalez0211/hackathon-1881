/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 183639:186701.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0564(scope) {
scope.InstancedMesh = class InstancedMesh extends scope.Mesh {
  constructor(e, i, s) {
    super(e, i), this.isInstancedMesh = !0, this.instanceMatrix = new scope.InstancedBufferAttribute(new Float32Array(s * 16), 16), this.instanceColor = null, this.morphTexture = null, this.count = s, this.boundingBox = null, this.boundingSphere = null;
    for (let a = 0; a < s; a++) this.setMatrixAt(a, scope._identity);
  }
  computeBoundingBox() {
    const e = this.geometry,
      i = this.count;
    this.boundingBox === null && (this.boundingBox = new scope.Box3()), e.boundingBox === null && e.computeBoundingBox(), this.boundingBox.makeEmpty();
    for (let s = 0; s < i; s++) this.getMatrixAt(s, scope._instanceLocalMatrix), scope._box3.copy(e.boundingBox).applyMatrix4(scope._instanceLocalMatrix), this.boundingBox.union(scope._box3);
  }
  computeBoundingSphere() {
    const e = this.geometry,
      i = this.count;
    this.boundingSphere === null && (this.boundingSphere = new scope.Sphere()), e.boundingSphere === null && e.computeBoundingSphere(), this.boundingSphere.makeEmpty();
    for (let s = 0; s < i; s++) this.getMatrixAt(s, scope._instanceLocalMatrix), scope._sphere$4.copy(e.boundingSphere).applyMatrix4(scope._instanceLocalMatrix), this.boundingSphere.union(scope._sphere$4);
  }
  copy(e, i) {
    return super.copy(e, i), this.instanceMatrix.copy(e.instanceMatrix), e.morphTexture !== null && (this.morphTexture = e.morphTexture.clone()), e.instanceColor !== null && (this.instanceColor = e.instanceColor.clone()), this.count = e.count, e.boundingBox !== null && (this.boundingBox = e.boundingBox.clone()), e.boundingSphere !== null && (this.boundingSphere = e.boundingSphere.clone()), this;
  }
  getColorAt(e, i) {
    i.fromArray(this.instanceColor.array, e * 3);
  }
  getMatrixAt(e, i) {
    i.fromArray(this.instanceMatrix.array, e * 16);
  }
  getMorphAt(e, i) {
    const s = i.morphTargetInfluences,
      a = this.morphTexture.source.data.data,
      o = s.length + 1,
      l = e * o + 1;
    for (let c = 0; c < s.length; c++) s[c] = a[l + c];
  }
  raycast(e, i) {
    const s = this.matrixWorld,
      a = this.count;
    if (scope._mesh$1.geometry = this.geometry, scope._mesh$1.material = this.material, scope._mesh$1.material !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), scope._sphere$4.copy(this.boundingSphere), scope._sphere$4.applyMatrix4(s), e.ray.intersectsSphere(scope._sphere$4) !== !1)) for (let o = 0; o < a; o++) {
      this.getMatrixAt(o, scope._instanceLocalMatrix), scope._instanceWorldMatrix.multiplyMatrices(s, scope._instanceLocalMatrix), scope._mesh$1.matrixWorld = scope._instanceWorldMatrix, scope._mesh$1.raycast(e, scope._instanceIntersects);
      for (let l = 0, c = scope._instanceIntersects.length; l < c; l++) {
        const h = scope._instanceIntersects[l];
        h.instanceId = o, h.object = this, i.push(h);
      }
      scope._instanceIntersects.length = 0;
    }
  }
  setColorAt(e, i) {
    this.instanceColor === null && (this.instanceColor = new scope.InstancedBufferAttribute(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3)), i.toArray(this.instanceColor.array, e * 3);
  }
  setMatrixAt(e, i) {
    i.toArray(this.instanceMatrix.array, e * 16);
  }
  setMorphAt(e, i) {
    const s = i.morphTargetInfluences,
      a = s.length + 1;
    this.morphTexture === null && (this.morphTexture = new scope.DataTexture(new Float32Array(a * this.count), a, this.count, scope.RedFormat, scope.FloatType));
    const o = this.morphTexture.source.data.data;
    let l = 0;
    for (let d = 0; d < s.length; d++) l += s[d];
    const c = this.geometry.morphTargetsRelative ? 1 : 1 - l,
      h = a * e;
    o[h] = c, o.set(s, h + 1);
  }
  updateMorphTargets() {}
  dispose() {
    this.dispatchEvent({
      type: "dispose"
    }), this.morphTexture !== null && (this.morphTexture.dispose(), this.morphTexture = null);
  }
};
}
