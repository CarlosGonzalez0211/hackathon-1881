/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 177379:180268.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0550(scope) {
scope.SkinnedMesh = class SkinnedMesh extends scope.Mesh {
  constructor(e, i) {
    super(e, i), this.isSkinnedMesh = !0, this.type = "SkinnedMesh", this.bindMode = scope.AttachedBindMode, this.bindMatrix = new scope.Matrix4(), this.bindMatrixInverse = new scope.Matrix4(), this.boundingBox = null, this.boundingSphere = null;
  }
  computeBoundingBox() {
    const e = this.geometry;
    this.boundingBox === null && (this.boundingBox = new scope.Box3()), this.boundingBox.makeEmpty();
    const i = e.getAttribute("position");
    for (let s = 0; s < i.count; s++) this.getVertexPosition(s, scope._vertex), this.boundingBox.expandByPoint(scope._vertex);
  }
  computeBoundingSphere() {
    const e = this.geometry;
    this.boundingSphere === null && (this.boundingSphere = new scope.Sphere()), this.boundingSphere.makeEmpty();
    const i = e.getAttribute("position");
    for (let s = 0; s < i.count; s++) this.getVertexPosition(s, scope._vertex), this.boundingSphere.expandByPoint(scope._vertex);
  }
  copy(e, i) {
    return super.copy(e, i), this.bindMode = e.bindMode, this.bindMatrix.copy(e.bindMatrix), this.bindMatrixInverse.copy(e.bindMatrixInverse), this.skeleton = e.skeleton, e.boundingBox !== null && (this.boundingBox = e.boundingBox.clone()), e.boundingSphere !== null && (this.boundingSphere = e.boundingSphere.clone()), this;
  }
  raycast(e, i) {
    const s = this.material,
      a = this.matrixWorld;
    s !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), scope._sphere$5.copy(this.boundingSphere), scope._sphere$5.applyMatrix4(a), e.ray.intersectsSphere(scope._sphere$5) !== !1 && (scope._inverseMatrix$2.copy(a).invert(), scope._ray$2.copy(e.ray).applyMatrix4(scope._inverseMatrix$2), !(this.boundingBox !== null && scope._ray$2.intersectsBox(this.boundingBox) === !1) && this._computeIntersections(e, i, scope._ray$2)));
  }
  getVertexPosition(e, i) {
    return super.getVertexPosition(e, i), this.applyBoneTransform(e, i), i;
  }
  bind(e, i) {
    this.skeleton = e, i === void 0 && (this.updateMatrixWorld(!0), this.skeleton.calculateInverses(), i = this.matrixWorld), this.bindMatrix.copy(i), this.bindMatrixInverse.copy(i).invert();
  }
  pose() {
    this.skeleton.pose();
  }
  normalizeSkinWeights() {
    const e = new scope.Vector4(),
      i = this.geometry.attributes.skinWeight;
    for (let s = 0, a = i.count; s < a; s++) {
      e.fromBufferAttribute(i, s);
      const o = 1 / e.manhattanLength();
      o !== 1 / 0 ? e.multiplyScalar(o) : e.set(1, 0, 0, 0), i.setXYZW(s, e.x, e.y, e.z, e.w);
    }
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.bindMode === scope.AttachedBindMode ? this.bindMatrixInverse.copy(this.matrixWorld).invert() : this.bindMode === scope.DetachedBindMode ? this.bindMatrixInverse.copy(this.bindMatrix).invert() : console.warn("THREE.SkinnedMesh: Unrecognized bindMode: " + this.bindMode);
  }
  applyBoneTransform(e, i) {
    const s = this.skeleton,
      a = this.geometry;
    scope._skinIndex.fromBufferAttribute(a.attributes.skinIndex, e), scope._skinWeight.fromBufferAttribute(a.attributes.skinWeight, e), scope._basePosition.copy(i).applyMatrix4(this.bindMatrix), i.set(0, 0, 0);
    for (let o = 0; o < 4; o++) {
      const l = scope._skinWeight.getComponent(o);
      if (l !== 0) {
        const c = scope._skinIndex.getComponent(o);
        scope._matrix4.multiplyMatrices(s.bones[c].matrixWorld, s.boneInverses[c]), i.addScaledVector(scope._vector3.copy(scope._basePosition).applyMatrix4(scope._matrix4), l);
      }
    }
    return i.applyMatrix4(this.bindMatrixInverse);
  }
};
}
