/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1536726:1549750.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1994(scope) {
scope.characters$1 = (scope.zi = class extends scope.characterBatchedSkinnedMesh {
  constructor(i = {}) {
    super(i);
    scope.oe(this, scope.vi, new scope.Vector3());
    scope.oe(this, scope.yr, new scope.Vector3());
    scope.oe(this, scope.br, new scope.Vector3());
    scope.oe(this, scope.da, new scope.Euler());
    scope.oe(this, scope.Wn, new scope.Quaternion());
    scope.oe(this, scope.wr, new scope.Frustum());
    scope.oe(this, scope.Sr, new scope.Matrix4());
    scope.Ye(this, "LOCAL_ID", "local");
    scope.Ye(this, "requestInteraction", scope.miscutils.debounce(() => {
      if (this._interactingElement !== null) return;
      const i = [];
      this._scene.traverse(s => {
        !s.isWorldSecret && !s.isWorldNPC && !s.isCustomInteraction || !s._isClose || !s._clickInteraction || i.push(s);
      }), i.sort((s, a) => s._distanceToCharacter - a._distanceToCharacter), i.length > 0 && (i[0]._clickInteracted = !0);
    }, 100));
    this.isWorldCharacters = !0, this.name = "Characters", this._scene = i.scene, this._camera = this._scene.camera, this._localObject = new scope.Object3D();
    const s = JSON.parse(JSON.stringify({
      ...scope.zi.INITIAL_DATA,
      ...(i.initialData || {})
    }));
    Object.assign(this._localObject, {
      batchedIndex: 0,
      boundingSphere: new scope.Sphere(),
      rotationHorizontal: 0,
      velocity: new scope.Vector3(),
      velocityHorizontal: 0,
      modelsID: "",
      animationProps: {
        offset: Math.random() * 100,
        weights: new Array(s.animationFiles.length).fill(0).map((a, o) => o === 0 ? 1 : 0),
        mixer: null,
        actions: [],
        lastUpdate: 0
      },
      networkEvents: [],
      userData: s
    }), Object.defineProperty(this._localObject.userData, "networkEvent", {
      enumerable: !0,
      get: () => "",
      set: () => {}
    }), this._charactersObjects = new Map(), this._charactersObjects.set(this.LOCAL_ID, this._localObject), this._initialPosition = new scope.Vector3(), this._initialRotation = 0, this._initialUp = new scope.Vector3(), this._canInteract = !0, this._interactingElement = null, this._interactingElementLast = null, this._interactingElementChanged = !1, this._positionCharLerp = typeof i.positionCharLerp == "number" ? i.positionCharLerp : .4, this._rotationCharLerp = typeof i.rotationCharLerp == "number" ? i.rotationCharLerp : .4, this._animationCharLerp = typeof i.animationCharLerp == "number" ? i.animationCharLerp : .1, this._animationSprintLerp = typeof i.animationSprintLerp == "number" ? i.animationSprintLerp : .25, this._velocityCharDamp = typeof i.velocityDamp == "number" ? i.velocityDamp : .7, this._positionDeltaLimitSnap = typeof i.positionDeltaLimitSnap == "number" ? i.positionDeltaLimitSnap : 10, this._customDataUpdate = i.customDataUpdate, this._customAttribUpdate = i.customAttribUpdate, this._inactive = !1, this._inactiveTime = (typeof i.inactiveTime == "number" ? i.inactiveTime : 60) * 1e3, this._inactiveMilliseconds = 0, this._controls = new scope.charactersControls(this, i), this._controlMode = i.controlMode || "automatic", this._controlAutomaticInfluence = typeof i.controlAutomaticInfluence == "number" ? i.controlAutomaticInfluence : .5, this._collisionPhysics = new scope.collisionPhysics(this, {
      ...i
    }), this._tags = i.tags ? new scope.tags(this, i) : null, this._trails = i.trails ? new scope.trails(this, i) : null, this.ready = new Promise(a => {
      this._isReady = a;
    }), Promise.all([this._localModelReady, this._collisionPhysics.ready]).then(() => {
      this.setInitialPosition(i.initialPosition, i.initialRadius, i.initialRotation, i.initialUp), this._camera.isFollowCamera && this._camera.follow({
        mesh: this,
        ...i
      }), i.offline || (this._connection = new scope.MicroRealmConnection({
        data: {
          ...JSON.parse(JSON.stringify(this._localObject.userData)),
          p: this._localObject.position.toArray(),
          r: this._localObject.rotation.toArray().slice(0, 3),
          networkEvent: ""
        },
        dataTypes: {
          p: "float",
          r: "float",
          medium: "uint32",
          animation: "uint32",
          bonesFile: "string",
          modelFiles: "string",
          animationFiles: "string",
          tag: "string",
          networkEvent: "string",
          ...(i.initialDataTypes || {})
        },
        servers: ["ws://localhost:3005"],
        ...i,
        clientsLimit: scope.characterBatchedSkinnedMesh.MAX_CHARS - 1,
        addClient: (a, o) => {
          this._addCharacter(a, o);
        },
        removeClient: a => {
          this._removeCharacter(a);
        },
        removeAllClients: () => {
          this._removeAllCharacters();
        }
      }), Object.defineProperty(this._connection._data, "networkEvent", {
        enumerable: !0,
        get: () => "",
        set: () => {}
      })), this._isReady();
    }), this._charactersUpdate = !1, Promise.all([this._scene.uploaded, this.ready]).then(() => {
      this._charactersUpdate = !0, ["material", "customDepthMaterial", "customDistanceMaterial"].forEach(a => {
        var o, l, c, h, d, p;
        (l = (o = this[a]) == null ? void 0 : o.uniforms) != null && l.batchingTexture && (this[a].uniforms.batchingTexture.value = this._matricesTexture), (h = (c = this[a]) == null ? void 0 : c.uniforms) != null && h.batchingIdTexture && (this[a].uniforms.batchingIdTexture.value = this._indirectTexture), (p = (d = this[a]) == null ? void 0 : d.uniforms) != null && p.boneTexture && (this[a].uniforms.boneTexture.value = this._boneTexture);
      });
    }), this._initBatchedMeshes();
  }
  get interactingElement() {
    return this._interactingElement;
  }
  set interactingElement(i = null) {
    this._interactingElement !== i && (this._interactingElementLast = this._interactingElement, this._interactingElement = i, this._interactingElementChanged = !0);
  }
  get MEDIUMS() {
    return scope.zi.MEDIUMS;
  }
  getModelsID(i) {
    return JSON.stringify(i.userData.bonesFile) + JSON.stringify(i.userData.modelFiles) + JSON.stringify(i.userData.animationFiles);
  }
  _setInactive() {
    this._inactive || (this._inactive = !0, this._inactiveAnimation = this._inactiveAnimations[Math.floor(Math.random() * this._inactiveAnimations.length)], this._localObject.userData.animation = this._inactiveAnimation);
  }
  _setActive() {
    this._inactiveMilliseconds = 0, this._inactive && (this._inactive = !1, this._localObject.userData.animation = 0);
  }
  _update() {
    var x, b;
    if (!this._charactersUpdate) return;
    const i = scope.renderInfo.delta,
      s = scope.math.deltaRatio(),
      a = scope.math.lerpCoefFPS(this._positionCharLerp),
      o = scope.math.lerpCoefFPS(this._rotationCharLerp),
      l = scope.math.lerpCoefFPS(this._animationCharLerp),
      c = scope.math.lerpCoefFPS(this._animationSprintLerp);
    this._collisionPhysics._update(this._controls._update(), s), this._localObject.velocity.manhattanLength() < 1e-5 && this._interactingElement === null ? (this._inactiveMilliseconds += i, this._inactiveMilliseconds > this._inactiveTime && this._localObject.userData.animation === 0 && this._setInactive()) : this._setActive(), this._connection && (this._connection._data.p = this._localObject.position.toArray().map(T => +Number(T).toFixed(2)), this._connection._data.r = this._localObject.rotation.toArray().slice(0, 3).map(T => +Number(T).toFixed(2)), Object.keys(this._localObject.userData).forEach(T => this._connection._data[T] = this._localObject.userData[T]), this._customDataUpdate && this._customDataUpdate(this._localObject.userData, this._connection._data));
    const h = i > 2e3,
      d = h ? 0 : 1,
      p = h ? 1 : a,
      f = h ? 1 : o;
    this._camera.isPerspectiveCamera && (scope.L(this, scope.Sr).multiplyMatrices(this._camera.projectionMatrix, this._camera.matrixWorldInverse), scope.L(this, scope.wr).setFromProjectionMatrix(scope.L(this, scope.Sr)));
    for (let T = 0; T < this.maxInstanceCount; T++) this._instanceInfo[T].active = !1, this._instanceInfo[T].visible = !1;
    let _ = !1;
    this._charactersObjects.forEach((T, M) => {
      var D, R;
      const w = T.batchedIndex;
      if (this._instanceInfo[w].active = !0, w > 0) {
        const P = (D = this._connection) == null ? void 0 : D._clients.get(M);
        let U = !1;
        if (P) {
          let H = this._collisionPhysics._deltaRatioAccumulatorSteps;
          for (; H > 0;) H--, Object.keys(P).forEach(F => {
            if (F === "p") {
              if (P[F].length !== 3) return;
              T.prevPosition.copy(T.nextPosition), T.nextPosition.fromArray(P[F]), U = U || T.nextPosition.distanceTo(T.prevPosition) > this._positionDeltaLimitSnap, T.velocity.add(scope.L(this, scope.br).subVectors(T.nextPosition, T.prevPosition)), T.velocity.multiplyScalar(this._velocityCharDamp), T.velocity.multiplyScalar(d * (U ? 0 : 1));
              const k = T.velocity.length(),
                W = k < .001,
                $ = W ? 1 : 1 - Math.abs(scope.L(this, scope.vi).copy(T.velocity).normalize().dot(T.up)),
                Z = k * d * $;
              T.velocityHorizontal = W ? Z : scope.math.lerp(T.velocityHorizontal, Z, .125);
            } else if (F === "r") {
              if (P[F].length !== 3) return;
              T.prevRotation.copy(T.nextRotation), T.nextRotation.setFromEuler(scope.L(this, scope.da).fromArray(P[F]));
            } else H === 0 && (T.userData[F] = P[F]);
          });
        }
        scope.L(this, scope.vi).lerpVectors(T.prevPosition, T.nextPosition, this._collisionPhysics._deltaRatioAccumulator), scope.L(this, scope.Wn).slerpQuaternions(T.prevRotation, T.nextRotation, this._collisionPhysics._deltaRatioAccumulator);
        const O = U ? 1 : p,
          N = U ? 1 : f;
        T.targetPosition.lerp(scope.L(this, scope.vi), O), T.position.lerp(T.targetPosition, O), T.targetRotation.slerp(scope.L(this, scope.Wn), N), T.quaternion.slerp(T.targetRotation, N), T.up.set(0, 1, 0).applyQuaternion(T.quaternion);
      }
      for (T.updateMatrixWorld(), T.boundingSphere.copy(this._geometryInfo[w].boundingSphere).applyMatrix4(T.matrix), T._inFrustumOfLocalCharacter = w === 0 || scope.L(this, scope.wr).intersectsSphere(T.boundingSphere), T._distanceToLocalCharacter = w === 0 ? 0 : T.position.distanceTo(this._localObject.position), this._updateAnimations(T, l, c), T._inFrustumOfLocalCharacter && (this._instanceInfo[w].visible = !0, !_ && T._distanceToLocalCharacter < scope.characterBatchedSkinnedMesh.UPDATE_DISTANCE && T.modelsID !== this.getModelsID(T) && (_ = !0, this._loadBatchedGeometries(T)), (R = this._customAttribUpdate) == null || R.call(this, {
        object: T,
        index: w,
        id: M,
        lerp: l,
        lerp2: c
      }), T.matrix.toArray(this._matricesTexture.image.data, w * 16)); T.networkEvents.length > 0;) scope.events$1.emit("character_network_event", {
        object: T,
        index: w,
        id: M,
        event: T.networkEvents.shift()
      });
    }), this._uploadBuffersPerFrame(), this._updateMultiDrawAndTextures(), this._interactingElementChanged = !1, (x = this._tags) == null || x._update(), (b = this._trails) == null || b.update();
  }
  _addCharacter(i, s) {
    const a = new Set();
    this._charactersObjects.forEach(h => {
      a.add(h.batchedIndex);
    });
    let o = -1;
    for (let h = 1; h < this.maxInstanceCount; h++) if (!a.has(h)) {
      o = h;
      break;
    }
    if (o === -1) return;
    const l = new scope.Object3D();
    Object.assign(l, {
      batchedIndex: o,
      boundingSphere: new scope.Sphere(),
      prevPosition: new scope.Vector3(),
      nextPosition: new scope.Vector3(),
      targetPosition: new scope.Vector3(),
      prevRotation: new scope.Quaternion(),
      nextRotation: new scope.Quaternion(),
      targetRotation: new scope.Quaternion(),
      velocity: new scope.Vector3(),
      velocityHorizontal: 0,
      isBeingRemoved: !1,
      modelsID: "",
      animationProps: {
        offset: Math.random() * 100,
        weights: [],
        mixer: null,
        actions: [],
        lastUpdate: 0
      },
      networkEvents: []
    });
    const c = s.networkEvent || "";
    Object.defineProperty(l.userData, "networkEvent", {
      enumerable: !0,
      get: () => "",
      set: () => {}
    }), Object.defineProperty(s, "networkEvent", {
      enumerable: !0,
      get: () => "",
      set: h => {
        !h || typeof h != "string" || l.networkEvents.push(h);
      }
    }), s.networkEvent = c, Object.keys(s).forEach(h => {
      if (h === "p") {
        if (s[h].length !== 3) return;
        l.position.fromArray(s.p), l.prevPosition.copy(l.position), l.nextPosition.copy(l.position), l.targetPosition.copy(l.position);
      } else if (h === "r") {
        if (s[h].length !== 3) return;
        l.rotation.fromArray(s.r), l.prevRotation.copy(l.quaternion), l.nextRotation.copy(l.quaternion), l.targetRotation.copy(l.quaternion), l.up.set(0, 1, 0).applyQuaternion(l.quaternion);
      } else l.userData[h] = s[h];
    }), l.animationProps.weights = new Array(l.userData.animationFiles.length).fill(0).map((h, d) => d === 0 ? 1 : 0), l.scale.setScalar(0), this._charactersObjects.set(i, l);
  }
  _removeCharacter(i) {
    if (!this._charactersObjects.has(i)) return;
    const s = this._charactersObjects.get(i),
      a = `${i}-removing`;
    this._charactersObjects.delete(i), this._charactersObjects.set(a, s), s.userData.tag && (s.userData.tag = ""), s.isBeingRemoved = !0, scope.createTween(s.scale, {
      to: {
        x: 0,
        y: 0,
        z: 0
      },
      ease: "power2.out",
      duration: .15,
      onComplete: () => {
        this._charactersObjects.delete(a);
      }
    });
  }
  _removeAllCharacters() {
    this._charactersObjects.clear(), this._charactersObjects.set(this.LOCAL_ID, this._localObject);
  }
  _emitNetworkEvent(i = "") {
    var s;
    !i || typeof i != "string" || (this._localObject.networkEvents.push(i), (s = this._connection) != null && s._connected && this._connection._sendRelayedData({
      networkEvent: i
    }));
  }
  setInitialPosition(i = [0, 0, 0], s = 2, a = 0, o = [0, 1, 0]) {
    if (!this._collisionPhysics._collider) return;
    this._initialUp.fromArray(o).normalize();
    const l = Math.random() * s,
      c = Math.random() * Math.PI * 2;
    scope.L(this, scope.Wn).setFromUnitVectors(scope.L(this, scope.vi).set(0, 1, 0), this._initialUp), scope.L(this, scope.vi).set(l * Math.cos(c), 0, l * Math.sin(c)).applyQuaternion(scope.L(this, scope.Wn)), scope.L(this, scope.yr).fromArray(i).add(scope.L(this, scope.vi));
    const h = Math.max(.5, this._collisionPhysics._charactersCapsule.segment.end.y + this._collisionPhysics._charactersCapsule.radius * 2);
    scope.L(this, scope.vi).copy(scope.L(this, scope.yr)).addScaledVector(this._initialUp, h), this._collisionPhysics._rayCaster.set(scope.L(this, scope.vi), scope.L(this, scope.br).copy(this._initialUp).negate());
    const d = this._collisionPhysics._rayCaster.intersectObject(this._collisionPhysics._collider)[0];
    if (d) this._initialPosition.copy(d.point);else {
      const p = this._collisionPhysics._geometry.boundsTree.closestPointToPoint(scope.L(this, scope.vi).fromArray(i));
      this._initialPosition.copy(p.point);
    }
    this._initialRotation = a, this._collisionPhysics._snap(this._initialPosition.toArray(), this._initialRotation, this._initialUp.toArray(), !0);
  }
  setControlMode(i) {
    i !== this._controlMode && (this._controlMode = i, this._camera.isFollowCamera && this._camera._sphericalTarget.copy(this._camera._spherical));
  }
  setModels({
    bonesFile: i = "",
    modelFiles: s = [],
    animationFiles: a = []
  }) {
    i && (this._localObject.userData.bonesFile = `avatar/${i}`), s.length > 0 && (this._localObject.userData.modelFiles = s.map(o => `avatar/${o}`)), a.length > 0 && (this._localObject.userData.animationFiles = a.map(o => `avatar/${o}`));
  }
  dispose() {
    var i;
    (i = this._connection) == null || i.dispose(), this._connection = null, this._controls.dispose(), this._controls = null, this._collisionPhysics.geometry && (this._collisionPhysics.geometry.boundsTree = null, this._collisionPhysics.geometry.dispose()), super.dispose(), this._camera = null, this._scene = null, this.geometry = null;
  }
}, scope.vi = new WeakMap(), scope.yr = new WeakMap(), scope.br = new WeakMap(), scope.da = new WeakMap(), scope.Wn = new WeakMap(), scope.wr = new WeakMap(), scope.Sr = new WeakMap(), scope.Ye(scope.zi, "MEDIUMS", {
  GROUND: 0,
  AIR: 1,
  WATER: 2
}), scope.Ye(scope.zi, "INITIAL_DATA", {
  medium: scope.zi.MEDIUMS.GROUND,
  animation: 0,
  bonesFile: "avatar/avatar-bones",
  modelFiles: ["avatar/avatar"],
  animationFiles: ["avatar/avatar-idle", "avatar/avatar-walk", "avatar/avatar-run", "avatar/avatar-air", "avatar/avatar-afk"],
  tag: "",
  networkEvent: ""
}), scope.zi);
}
