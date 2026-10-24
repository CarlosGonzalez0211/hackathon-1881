/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1640048:1649777.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2068(scope) {
scope.characters = class characters {
  constructor(e, i) {
    this.scene = e, this.options = i, this.ready = new Promise(s => {
      this.isReady = s;
    }), this.isCameraLocked = !1, this.init();
  }
  async init() {
    var a, o, l, c;
    this.maintainUnlockRotation = !0;
    const e = ((o = (a = this.scene.mainController) == null ? void 0 : a.state) == null ? void 0 : o.control) === "manual",
      i = "";
    scope.DEFAULT_FILES.modelFiles = scope.validateAndSaveAccessories(scope.client$1.localStorage.modelFiles || scope.getRandomAccessories()).map(h => `avatar/${h}`), this.mesh = new scope.characters$1({
      scene: this.scene,
      material: scope.baseMaterial({
        isCharacters: !0
      }),
      customDepthMaterial: scope.depthCharsMaterial(),
      initialData: {
        ...scope.DEFAULT_FILES,
        tag: ((c = (l = this.scene.mainController) == null ? void 0 : l.state) == null ? void 0 : c.tag) || "Unnamed"
      },
      initialDataTypes: {},
      animationOptions: [{
        speed: 1
      }, {
        speed: 1.1
      }, {
        speed: 1.1
      }, {
        speed: 1
      }, {
        speed: 1
      }],
      animationSprintLerp: .05,
      inactiveAnimations: [4, 5, 6],
      inactiveTime: 30,
      colliderGeometry: this.scene.characterInitialOptions.collider,
      capsuleRadiusPercentage: .2,
      floorDetectInclination: .7,
      jumpForce: .15,
      positionForce: .005,
      gravity: -.00981,
      damp: .92,
      dampIdle: .65,
      autoStep: !0,
      sprintEnabled: !0,
      sprintSpeed: 1.3,
      interactKeyEnabled: !1,
      initialPosition: this.scene.characterInitialOptions.initialPosition,
      initialRotation: this.scene.characterInitialOptions.initialRotation,
      initialRadius: this.scene.characterInitialOptions.initialRadius,
      initialUp: scope._v0$8.fromArray(this.scene.characterInitialOptions.initialPosition).normalize().toArray(),
      controlMode: e ? "manual" : "automatic",
      relativeCameraPosition: this.scene.characterInitialOptions.relativeCameraPosition,
      relativeCameraOffset: this.scene.characterInitialOptions.relativeCameraOffset,
      offline: !0,
      autoConnect: !1,
      servers: ["wss://multiplayer-server-76608060529.us-central1.run.app"],
      roomPrefix: this.scene.characterInitialOptions.roomPrefix,
      roomRequested: i,
      tags: !1,
      tagsFont: "REM-Medium",
      trails: !0,
      trailsFootSpacing: .1,
      customAttribUpdate: ({
        object: h,
        index: d,
        id: p,
        lerp: f
      } = {}) => {},
      onRoomJoined: h => {},
      onConnect: () => {},
      onDisconnect: () => {},
      onData: h => {
        console.log("data received:", h);
      }
    });
    const s = [];
    Object.keys(scope.ACCESSORIES).forEach(h => {
      scope.ACCESSORIES[h].forEach(p => s.push(scope.geometryLoader.load(`avatar/accessories/${p}.drc`, !0)));
    }), await Promise.all([this.mesh.ready, Promise.all(s)]), this.give = new scope.emojis({
      scene: this.scene,
      characters: this.mesh
    }), this.emojis = new scope.emojis$1({
      scene: this.scene,
      characters: this.mesh
    }), await Promise.all([this.give.ready, this.emojis.ready]), this.scene.beforeRenderCbs.push(() => {
      this.mesh._localObject.position.lengthSq() < 1e-4 ? this.mesh._localObject.up.set(0, 1, 0) : this.mesh._localObject.up.copy(this.mesh._localObject.position).normalize(), this.mesh._interactingElementChanged && (this.isCameraLockingInteractingElement() ? this.lockCameraObject() : this.unlockCamera()), this.mesh._update(), scope.events$1.emit("character_broadcast_position", this.mesh._localObject.position.toArray());
      const h = this.mesh._localObject.position.length(),
        d = Math.max(0, 22 - h),
        p = this.mesh.material.uniforms.uWetHeight;
      p.value < d ? p.value = d : p.value = Math.max(0, p.value - 2e-4 * scope.renderInfo.ratio);
    }), this.audio = new scope.audio({
      scene: this.scene,
      characters: this.mesh
    }), this.scene.add(this.mesh), this.scene.ready.then(() => {
      var h;
      (h = this.scene.__controlsPass) == null || h.scene.add(this.mesh._controls._circles);
    }), scope.events$1.on("character_accessories_set", this.setAccessories, this), this.isReady();
  }
  isCameraLockingInteractingElement() {
    const e = this.mesh.interactingElement;
    let i = !1;
    return e && (e === "intro" || e === "self" || e.isWorldNPC && !e._textsBubblesEnabled) && (i = !0), i;
  }
  setAccessories(e = []) {
    if (!e.length) throw new Error("No files provided to set accessories");
    const i = scope.validateAndSaveAccessories(["base", ...e]);
    this.mesh.setModels({
      modelFiles: i
    }), scope.events$1.emit("webgl_play_audio", "clothes");
  }
  enableControls(e) {
    e ? this.mesh._controls.enable() : this.mesh._controls.disable(), this.mesh._localObject.userData.animation = 0;
  }
  enable() {
    this.isCameraLockingInteractingElement() || this.enableControls(!0);
  }
  disable() {
    this.enableControls(!1);
  }
  lockCameraObject() {
    if (!this.mesh._camera.isFollowCamera) return;
    this.isCameraLocked = !0, this.maintainUnlockRotation = !0, this.enableControls(!1);
    const e = this.mesh.interactingElement === "intro",
      i = this.mesh.interactingElement === "self",
      s = this.mesh.interactingElement.isWorldNPC,
      a = e || i ? this.mesh._localObject : this.mesh.interactingElement,
      o = this.mesh._localObject.position.toArray(),
      l = this.mesh._localObject.rotationHorizontal,
      c = this.mesh._localObject.up.toArray();
    this.mesh._collisionPhysics._snap(o, l, c, !0);
    let h = [0, 0, 0],
      d = 2,
      p = Math.PI / 2,
      f = 0,
      _ = l;
    const x = this.mesh._camera.touchAmount;
    if (e) {
      this.maintainUnlockRotation = !1, a.getWorldPosition(scope._v0$8), scope._v0$8.addScaledVector(a.up, 1.15), h = scope._v0$8.toArray(), d = 2.5, p = Math.PI * .475, f = scope.math.getShortestRotationAngle(l, l - Math.PI * .9);
      const b = .15;
      this.mesh._camera.setFollowOverwrite({
        target: h,
        radius: d,
        phi: p,
        theta: f
      }), scope.createTween(this.mesh._camera, {
        to: {
          overwriteAmount: 1
        },
        duration: 2.5,
        ease: "inOut1",
        onUpdate: () => {
          this.mesh.interactingElement && (this.mesh._camera.touchAmount = scope.math.lerp(x, b, this.mesh._camera.overwriteAmount), this.mesh._collisionPhysics._snap(o, l, c, !0));
        }
      });
    } else if (i) {
      a.getWorldPosition(scope._v0$8), scope._v0$8.addScaledVector(this.mesh._localObject.up, 1), h = scope._v0$8.toArray(), d = 3.5, p = Math.PI * .5;
      const b = 8,
        T = Math.PI * 2 / b,
        M = d * 1.25,
        w = .15;
      let D = 0;
      for (let P = 0; P < b; P++) {
        const U = P * T - Math.PI * w;
        scope._v1$5.set(0, 0, 1).applyQuaternion(this.mesh._localObject.quaternion), scope._v1$5.applyAxisAngle(this.mesh._localObject.up, U), this.mesh._collisionPhysics._rayCaster.set(scope._v0$8, scope._v1$5);
        const O = this.mesh._collisionPhysics._rayCaster.intersectObject(this.mesh._collisionPhysics._collider);
        if (O.length === 0 || O[0].distance > M) {
          D = U;
          break;
        }
      }
      D > 0 ? (f = scope.math.getShortestRotationAngle(l, l + Math.PI + D), _ = scope.math.getShortestRotationAngle(_, f - Math.PI * (1 - w))) : (f = scope.math.getShortestRotationAngle(l, l + Math.PI * (1 - w)), _ = l);
      const R = .35;
      this.mesh._camera.setFollowOverwrite({
        target: h,
        radius: d,
        phi: p,
        theta: f
      }), scope.createTween(this.mesh._camera, {
        to: {
          overwriteAmount: 1
        },
        duration: 1.5,
        ease: "inOut1",
        onUpdate: () => {
          this.mesh.interactingElement && (this.mesh._camera.touchAmount = scope.math.lerp(x, R, this.mesh._camera.overwriteAmount), this.mesh._collisionPhysics._snap(o, scope.math.lerp(l, _, this.mesh._camera.overwriteAmount), c, !0));
        }
      });
    } else if (s) {
      scope._v0$8.copy(a._targetPosition), scope._v0$8.addScaledVector(a.up, a.geometry.boundingSphere.radius * 2 - .5), scope._v1$5.fromArray(a.__wrapper.options.lookatOffset), scope._v1$5.applyQuaternion(a._targetQuaternion), scope._v0$8.add(scope._v1$5), h = scope._v0$8.toArray(), d = 2.5, p = Math.PI * .45, scope._v0$8.subVectors(a._targetPosition, this.mesh._localObject.position);
      const b = scope._v0$8.length();
      scope._v0$8.normalize();
      const T = this.mesh._collisionPhysics._charactersCapsule.radius * 1.1,
        M = .7 + T,
        w = Math.max(M, 1.25 - T);
      let D = o;
      if (b < M || b > w) {
        scope._v0$8.negate(), scope._v1$5.fromArray(h), this.mesh._collisionPhysics._rayCaster.set(scope._v1$5, scope._v0$8);
        const O = this.mesh._collisionPhysics._rayCaster.intersectObject(this.mesh._collisionPhysics._collider);
        if (O.length > 0 && O[0].distance < w) {
          const H = scope._v0$8.copy(O[0].point).sub(scope._v1$5).length();
          scope._v1$5.addScaledVector(scope._v0$8.normalize(), Math.max(0, H - T));
        } else scope._v1$5.addScaledVector(scope._v0$8, scope.math.clamp(b, M, w));
        this.mesh._collisionPhysics._rayCaster.set(scope._v1$5, scope._v0$8.copy(scope._v1$5).normalize().negate());
        const N = this.mesh._collisionPhysics._rayCaster.intersectObject(this.mesh._collisionPhysics._collider);
        N.length > 0 && (D = N[0].point.toArray(), scope._v0$8.subVectors(a._targetPosition, N[0].point).normalize());
      }
      scope._v0$8.applyAxisAngle(this.mesh._localObject.up, this.mesh._localObject.rotationHorizontal), scope._v0$8.applyQuaternion(scope._q0$1.copy(this.mesh._localObject.quaternion).invert());
      const R = scope._s0.setFromVector3(scope._v0$8).theta;
      _ = scope.math.getShortestRotationAngle(l, R);
      const P = .4;
      if (a._talkFacingPlayer) f = scope.math.getShortestRotationAngle(this.mesh._camera._sphericalTarget.theta, R + P);else {
        scope._v0$8.set(0, 0, -1).applyQuaternion(a._targetQuaternion), scope._v0$8.applyAxisAngle(this.mesh._localObject.up, this.mesh._localObject.rotationHorizontal), scope._v0$8.applyQuaternion(scope._q0$1.copy(this.mesh._localObject.quaternion).invert());
        const O = scope._s0.setFromVector3(scope._v0$8).theta;
        f = scope.math.getShortestRotationAngle(this.mesh._camera._sphericalTarget.theta, O + P);
        const N = scope.math.makeAnglePositive(_),
          H = scope.math.getShortestRotationAngle(N, f);
        Math.abs(N - H) < .6 && (f = scope.math.getShortestRotationAngle(f, f - P * 2));
      }
      const U = .1;
      this.mesh._camera.setFollowOverwrite({
        target: h,
        radius: d,
        phi: p,
        theta: f
      }), scope.createTween(this.mesh._camera, {
        duration: 1.3,
        ease: "inOut1",
        to: {
          overwriteAmount: 1
        },
        onStart: () => {},
        onUpdate: () => {
          if (!this.mesh.interactingElement) return;
          this.mesh._camera.touchAmount = scope.math.lerp(x, U, this.mesh._camera.overwriteAmount);
          const O = scope._v0$8.fromArray(o).lerp(scope._v1$5.fromArray(D), this.mesh._camera.overwriteAmount).toArray(),
            N = scope._v0$8.fromArray(O).normalize().toArray(),
            H = scope.math.lerp(l, _, this.mesh._camera.overwriteAmount);
          this.mesh._collisionPhysics._snap(O, H, N, !0), scope._o0.position.copy(this.mesh._localObject.position), scope._o0.quaternion.copy(this.mesh._localObject.quaternion), scope._o0.scale.copy(this.mesh._localObject.scale), scope._o0.up.copy(this.mesh._localObject.up);
          for (let F = 0, k = 2; F < k; F++) this.mesh._collisionPhysics._performShapecast(scope._o0, 1 / k);
          this.mesh._collisionPhysics._snap(scope._o0.position.toArray(), H, scope._v0$8.copy(scope._o0.position).normalize().toArray(), !0);
        }
      });
    }
    scope.events$1.emit("webgl_play_audio", "zoom-in");
  }
  unlockCamera() {
    if (!this.mesh._camera.isFollowCamera || !this.isCameraLocked) return;
    this.isCameraLocked = !1, this.mesh.visible = !0, this.maintainUnlockRotation && this.mesh._camera.overwriteAmount === 1 && (this.scene.camera._sphericalTarget.theta = this.scene.camera.overwriteSpherical.theta, this.scene.camera._spherical.theta = this.scene.camera._sphericalTarget.theta), this.enableControls(!0);
    const e = this.maintainUnlockRotation ? 1.25 : 2.25;
    scope.createTween(this.mesh._camera, {
      to: {
        overwriteAmount: 0,
        touchAmount: 1
      },
      duration: e,
      ease: "inOut1"
    }), scope.events$1.emit("webgl_play_audio", "zoom-off");
  }
  dispose() {
    var e, i;
    this.disable(), (e = this.give) == null || e.dispose(), (i = this.emojis) == null || i.dispose(), scope.events$1.off("character_accessories_set", this.setAccessories, this);
  }
};
}
