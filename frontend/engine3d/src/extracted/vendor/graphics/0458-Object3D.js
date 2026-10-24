/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 98606:109626.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0458(scope) {
scope.Object3D = class Object3D extends scope.EventDispatcher {
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", {
      value: scope._object3DId++
    }), this.uuid = scope.generateUUID(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = scope.Object3D.DEFAULT_UP.clone();
    const e = new scope.Vector3(),
      i = new scope.Euler(),
      s = new scope.Quaternion(),
      a = new scope.Vector3(1, 1, 1);
    function o() {
      s.setFromEuler(i, !1);
    }
    function l() {
      i.setFromQuaternion(s, void 0, !1);
    }
    i._onChange(o), s._onChange(l), Object.defineProperties(this, {
      position: {
        configurable: !0,
        enumerable: !0,
        value: e
      },
      rotation: {
        configurable: !0,
        enumerable: !0,
        value: i
      },
      quaternion: {
        configurable: !0,
        enumerable: !0,
        value: s
      },
      scale: {
        configurable: !0,
        enumerable: !0,
        value: a
      },
      modelViewMatrix: {
        value: new scope.Matrix4()
      },
      normalMatrix: {
        value: new scope.Matrix3()
      }
    }), this.matrix = new scope.Matrix4(), this.matrixWorld = new scope.Matrix4(), this.matrixAutoUpdate = scope.Object3D.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = scope.Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new scope.Layers(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.customDepthMaterial = void 0, this.customDistanceMaterial = void 0, this.userData = {};
  }
  onBeforeShadow() {}
  onAfterShadow() {}
  onBeforeRender() {}
  onAfterRender() {}
  applyMatrix4(e) {
    this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(e), this.matrix.decompose(this.position, this.quaternion, this.scale);
  }
  applyQuaternion(e) {
    return this.quaternion.premultiply(e), this;
  }
  setRotationFromAxisAngle(e, i) {
    this.quaternion.setFromAxisAngle(e, i);
  }
  setRotationFromEuler(e) {
    this.quaternion.setFromEuler(e, !0);
  }
  setRotationFromMatrix(e) {
    this.quaternion.setFromRotationMatrix(e);
  }
  setRotationFromQuaternion(e) {
    this.quaternion.copy(e);
  }
  rotateOnAxis(e, i) {
    return scope._q1$2.setFromAxisAngle(e, i), this.quaternion.multiply(scope._q1$2), this;
  }
  rotateOnWorldAxis(e, i) {
    return scope._q1$2.setFromAxisAngle(e, i), this.quaternion.premultiply(scope._q1$2), this;
  }
  rotateX(e) {
    return this.rotateOnAxis(scope._xAxis, e);
  }
  rotateY(e) {
    return this.rotateOnAxis(scope._yAxis, e);
  }
  rotateZ(e) {
    return this.rotateOnAxis(scope._zAxis, e);
  }
  translateOnAxis(e, i) {
    return scope._v1$4$1.copy(e).applyQuaternion(this.quaternion), this.position.add(scope._v1$4$1.multiplyScalar(i)), this;
  }
  translateX(e) {
    return this.translateOnAxis(scope._xAxis, e);
  }
  translateY(e) {
    return this.translateOnAxis(scope._yAxis, e);
  }
  translateZ(e) {
    return this.translateOnAxis(scope._zAxis, e);
  }
  localToWorld(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(scope._m1$1$1.copy(this.matrixWorld).invert());
  }
  lookAt(e, i, s) {
    e.isVector3 ? scope._target.copy(e) : scope._target.set(e, i, s);
    const a = this.parent;
    this.updateWorldMatrix(!0, !1), scope._position$3.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? scope._m1$1$1.lookAt(scope._position$3, scope._target, this.up) : scope._m1$1$1.lookAt(scope._target, scope._position$3, this.up), this.quaternion.setFromRotationMatrix(scope._m1$1$1), a && (scope._m1$1$1.extractRotation(a.matrixWorld), scope._q1$2.setFromRotationMatrix(scope._m1$1$1), this.quaternion.premultiply(scope._q1$2.invert()));
  }
  add(e) {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) this.add(arguments[i]);
      return this;
    }
    return e === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.removeFromParent(), e.parent = this, this.children.push(e), e.dispatchEvent(scope._addedEvent), scope._childaddedEvent.child = e, this.dispatchEvent(scope._childaddedEvent), scope._childaddedEvent.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", e), this);
  }
  remove(e) {
    if (arguments.length > 1) {
      for (let s = 0; s < arguments.length; s++) this.remove(arguments[s]);
      return this;
    }
    const i = this.children.indexOf(e);
    return i !== -1 && (e.parent = null, this.children.splice(i, 1), e.dispatchEvent(scope._removedEvent), scope._childremovedEvent.child = e, this.dispatchEvent(scope._childremovedEvent), scope._childremovedEvent.child = null), this;
  }
  removeFromParent() {
    const e = this.parent;
    return e !== null && e.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(e) {
    return this.updateWorldMatrix(!0, !1), scope._m1$1$1.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), scope._m1$1$1.multiply(e.parent.matrixWorld)), e.applyMatrix4(scope._m1$1$1), e.removeFromParent(), e.parent = this, this.children.push(e), e.updateWorldMatrix(!1, !0), e.dispatchEvent(scope._addedEvent), scope._childaddedEvent.child = e, this.dispatchEvent(scope._childaddedEvent), scope._childaddedEvent.child = null, this;
  }
  getObjectById(e) {
    return this.getObjectByProperty("id", e);
  }
  getObjectByName(e) {
    return this.getObjectByProperty("name", e);
  }
  getObjectByProperty(e, i) {
    if (this[e] === i) return this;
    for (let s = 0, a = this.children.length; s < a; s++) {
      const l = this.children[s].getObjectByProperty(e, i);
      if (l !== void 0) return l;
    }
  }
  getObjectsByProperty(e, i, s = []) {
    this[e] === i && s.push(this);
    const a = this.children;
    for (let o = 0, l = a.length; o < l; o++) a[o].getObjectsByProperty(e, i, s);
    return s;
  }
  getWorldPosition(e) {
    return this.updateWorldMatrix(!0, !1), e.setFromMatrixPosition(this.matrixWorld);
  }
  getWorldQuaternion(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(scope._position$3, e, scope._scale$2), e;
  }
  getWorldScale(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(scope._position$3, scope._quaternion$2, e), e;
  }
  getWorldDirection(e) {
    this.updateWorldMatrix(!0, !1);
    const i = this.matrixWorld.elements;
    return e.set(i[8], i[9], i[10]).normalize();
  }
  raycast() {}
  traverse(e) {
    e(this);
    const i = this.children;
    for (let s = 0, a = i.length; s < a; s++) i[s].traverse(e);
  }
  traverseVisible(e) {
    if (this.visible === !1) return;
    e(this);
    const i = this.children;
    for (let s = 0, a = i.length; s < a; s++) i[s].traverseVisible(e);
  }
  traverseAncestors(e) {
    const i = this.parent;
    i !== null && (e(i), i.traverseAncestors(e));
  }
  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
  }
  updateMatrixWorld(e) {
    this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || e) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, e = !0);
    const i = this.children;
    for (let s = 0, a = i.length; s < a; s++) i[s].updateMatrixWorld(e);
  }
  updateWorldMatrix(e, i) {
    const s = this.parent;
    if (e === !0 && s !== null && s.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), i === !0) {
      const a = this.children;
      for (let o = 0, l = a.length; o < l; o++) a[o].updateWorldMatrix(!1, !0);
    }
  }
  toJSON(e) {
    const i = e === void 0 || typeof e == "string",
      s = {};
    i && (e = {
      geometries: {},
      materials: {},
      textures: {},
      images: {},
      shapes: {},
      skeletons: {},
      animations: {},
      nodes: {}
    }, s.metadata = {
      version: 4.7,
      type: "Object",
      generator: "Object3D.toJSON"
    });
    const a = {};
    a.uuid = this.uuid, a.type = this.type, this.name !== "" && (a.name = this.name), this.castShadow === !0 && (a.castShadow = !0), this.receiveShadow === !0 && (a.receiveShadow = !0), this.visible === !1 && (a.visible = !1), this.frustumCulled === !1 && (a.frustumCulled = !1), this.renderOrder !== 0 && (a.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (a.userData = this.userData), a.layers = this.layers.mask, a.matrix = this.matrix.toArray(), a.up = this.up.toArray(), this.matrixAutoUpdate === !1 && (a.matrixAutoUpdate = !1), this.isInstancedMesh && (a.type = "InstancedMesh", a.count = this.count, a.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (a.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (a.type = "BatchedMesh", a.perObjectFrustumCulled = this.perObjectFrustumCulled, a.sortObjects = this.sortObjects, a.drawRanges = this._drawRanges, a.reservedRanges = this._reservedRanges, a.geometryInfo = this._geometryInfo.map(c => ({
      ...c,
      boundingBox: c.boundingBox ? c.boundingBox.toJSON() : void 0,
      boundingSphere: c.boundingSphere ? c.boundingSphere.toJSON() : void 0
    })), a.instanceInfo = this._instanceInfo.map(c => ({
      ...c
    })), a.availableInstanceIds = this._availableInstanceIds.slice(), a.availableGeometryIds = this._availableGeometryIds.slice(), a.nextIndexStart = this._nextIndexStart, a.nextVertexStart = this._nextVertexStart, a.geometryCount = this._geometryCount, a.maxInstanceCount = this._maxInstanceCount, a.maxVertexCount = this._maxVertexCount, a.maxIndexCount = this._maxIndexCount, a.geometryInitialized = this._geometryInitialized, a.matricesTexture = this._matricesTexture.toJSON(e), a.indirectTexture = this._indirectTexture.toJSON(e), this._colorsTexture !== null && (a.colorsTexture = this._colorsTexture.toJSON(e)), this.boundingSphere !== null && (a.boundingSphere = this.boundingSphere.toJSON()), this.boundingBox !== null && (a.boundingBox = this.boundingBox.toJSON()));
    function o(c, h) {
      return c[h.uuid] === void 0 && (c[h.uuid] = h.toJSON(e)), h.uuid;
    }
    if (this.isScene) this.background && (this.background.isColor ? a.background = this.background.toJSON() : this.background.isTexture && (a.background = this.background.toJSON(e).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (a.environment = this.environment.toJSON(e).uuid);else if (this.isMesh || this.isLine || this.isPoints) {
      a.geometry = o(e.geometries, this.geometry);
      const c = this.geometry.parameters;
      if (c !== void 0 && c.shapes !== void 0) {
        const h = c.shapes;
        if (Array.isArray(h)) for (let d = 0, p = h.length; d < p; d++) {
          const f = h[d];
          o(e.shapes, f);
        } else o(e.shapes, h);
      }
    }
    if (this.isSkinnedMesh && (a.bindMode = this.bindMode, a.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (o(e.skeletons, this.skeleton), a.skeleton = this.skeleton.uuid)), this.material !== void 0) if (Array.isArray(this.material)) {
      const c = [];
      for (let h = 0, d = this.material.length; h < d; h++) c.push(o(e.materials, this.material[h]));
      a.material = c;
    } else a.material = o(e.materials, this.material);
    if (this.children.length > 0) {
      a.children = [];
      for (let c = 0; c < this.children.length; c++) a.children.push(this.children[c].toJSON(e).object);
    }
    if (this.animations.length > 0) {
      a.animations = [];
      for (let c = 0; c < this.animations.length; c++) {
        const h = this.animations[c];
        a.animations.push(o(e.animations, h));
      }
    }
    if (i) {
      const c = l(e.geometries),
        h = l(e.materials),
        d = l(e.textures),
        p = l(e.images),
        f = l(e.shapes),
        _ = l(e.skeletons),
        x = l(e.animations),
        b = l(e.nodes);
      c.length > 0 && (s.geometries = c), h.length > 0 && (s.materials = h), d.length > 0 && (s.textures = d), p.length > 0 && (s.images = p), f.length > 0 && (s.shapes = f), _.length > 0 && (s.skeletons = _), x.length > 0 && (s.animations = x), b.length > 0 && (s.nodes = b);
    }
    return s.object = a, s;
    function l(c) {
      const h = [];
      for (const d in c) {
        const p = c[d];
        delete p.metadata, h.push(p);
      }
      return h;
    }
  }
  clone(e) {
    return new this.constructor().copy(this, e);
  }
  copy(e, i = !0) {
    if (this.name = e.name, this.up.copy(e.up), this.position.copy(e.position), this.rotation.order = e.rotation.order, this.quaternion.copy(e.quaternion), this.scale.copy(e.scale), this.matrix.copy(e.matrix), this.matrixWorld.copy(e.matrixWorld), this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrixWorldAutoUpdate = e.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate, this.layers.mask = e.layers.mask, this.visible = e.visible, this.castShadow = e.castShadow, this.receiveShadow = e.receiveShadow, this.frustumCulled = e.frustumCulled, this.renderOrder = e.renderOrder, this.animations = e.animations.slice(), this.userData = JSON.parse(JSON.stringify(e.userData)), i === !0) for (let s = 0; s < e.children.length; s++) {
      const a = e.children[s];
      this.add(a.clone());
    }
    return this;
  }
};
}
