/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1312757:1321167.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1738(scope) {
scope.followCamera = function followCamera(r) {
  var e, i, s, a, o, l, ws, Ha, Qa, p;
  return p = class extends r {
    constructor() {
      super();
      scope.oe(this, l);
      scope.oe(this, e, new scope.Vector3());
      scope.oe(this, i, new scope.Vector3());
      scope.oe(this, s, new scope.Vector3());
      scope.oe(this, a, new scope.Spherical());
      scope.oe(this, o, new scope.Spherical());
      this.isFollowCamera = !0, this.displacement.position.set(-.075, -.05), this._sphericalCameraPosition = new scope.Spherical(), this._spherical = new scope.Spherical(), this._sphericalTarget = new scope.Spherical(), this._sphericalVerticalMinLimit = Math.PI * .25, this._sphericalVerticalMaxLimit = Math.PI * .75, this._followedMesh = void 0, this._followedMeshPhi = Math.PI * .5, this._followedMeshDistance = 1, this._followedMeshOffset = new scope.Vector3(), this._followedMeshOffsetDistance = 0, this._followedMeshOffsetTarget = new scope.Vector3(), this._followedMeshTarget = new scope.Vector3(), this._cameraCollisions = !0, this._cameraCollisionsMinDistance = .75, this._cameraCollisionsIncrement = .05, this._cameraCollisionsMaxIterations = 10, this._cameraTargetLocalLerp = .0125, this._cameraTargetWorldLerp = .175, this._cameraRotationLerp = .03, this._cameraSphericalRotationLerp = .075, this._cameraSphericalRotationFastLerp = .3, this._cameraSphericalRadiusLerp = .035, this._cameraSphericalRadiusCollisionsLerp = .35, this._cameraAutomaticCenteringActiveLerp = .1, this._cameraAutomaticCenteringInactiveLerp = .0125, this._disableAutomaticCentering = !1, this._automaticCenteringAmount = 1, this._cameraInactiveMultiplier = .025, this.additionalSpherical = new scope.Spherical(0, 0, 0), this.overwriteSpherical = new scope.Spherical(1, Math.PI * .5, 0), this.overwriteTarget = new scope.Vector3(), this.overwriteAmount = 0;
    }
    follow({
      mesh: _ = null,
      relativeCameraPosition: x = new scope.Vector3(0, 2, 5.75),
      relativeCameraOffset: b = new scope.Vector3(0, 1, .5)
    } = {}) {
      if (!_ || !_._localObject) throw new Error("follow camera needs a mesh character");
      this._followedMesh = _, this.setOffset(b.toArray()), scope.L(this, a).setFromVector3(x), scope.L(this, a).phi = scope.math.clamp(scope.L(this, a).phi, this._sphericalVerticalMinLimit, this._sphericalVerticalMaxLimit), this._followedMeshPhi = scope.L(this, a).phi, this._followedMeshDistance = scope.L(this, a).radius, this._spherical.copy(scope.L(this, a)), this._spherical.theta = scope.math.getShortestRotationAngle(this._spherical.theta, this._followedMesh._localObject.rotationHorizontal), this._sphericalTarget.copy(this._spherical), scope.Ee(this, l, ws).call(this, {
        local: this._followedMesh._localObject,
        spherical: this._spherical,
        position: this.baseTarget,
        temp: scope.L(this, e),
        target: this.basePosition
      }), this.baseUp.copy(this._followedMesh._localObject.up);
    }
    _update() {
      if (this._followedMesh) {
        const _ = this._followedMesh._localObject,
          x = this._followedMesh._collisionPhysics,
          b = scope.math.lerpCoefFPS(this._cameraTargetLocalLerp),
          T = scope.math.lerpCoefFPS(this._cameraTargetWorldLerp);
        scope.Ee(this, l, Ha).call(this, scope.L(this, e)), scope.L(this, e).add(_.position), scope.L(this, i).copy(this._followedMeshOffset).applyQuaternion(_.quaternion), x._rayCaster.set(scope.L(this, e), scope.L(this, s).copy(scope.L(this, i)).normalize());
        const M = x._rayCaster.intersectObject(x._collider)[0];
        M && M.distance < this._followedMeshOffsetDistance && scope.L(this, i).set(0, 0, 0), this._sphericalTarget.radius < this._followedMeshDistance * .75 && scope.L(this, i).set(0, 0, 0), this._followedMeshOffsetTarget.lerp(scope.L(this, i), b), this._followedMeshTarget.lerp(scope.L(this, e).add(this._followedMeshOffsetTarget), T), this.baseTarget.lerpVectors(this._followedMeshTarget, this.overwriteTarget, this.overwriteAmount), scope.L(this, e).setFromSpherical(this._spherical).setY(0).normalize(), scope.L(this, i).set(0, 0, -1).applyAxisAngle(scope.L(this, s).set(0, 1, 0), _.rotationHorizontal);
        const w = scope.math.fit(scope.L(this, e).dot(scope.L(this, i)), 1, 0, 0, 1),
          D = x._isMoving ? w : this._cameraInactiveMultiplier,
          R = scope.math.getShortestRotationAngle(this._sphericalTarget.theta, _.rotationHorizontal);
        let P = 1,
          U = 1;
        if (this._followedMesh._controlMode !== "automatic") {
          const F = this._followedMesh._controls,
            k = F._isLeftMousePressed === !1 && F._touchCameraFinger === -1 && F._gamepadMovingCamera === !1;
          P = k ? this._followedMesh._controlAutomaticInfluence : 0, U = k ? this._cameraAutomaticCenteringInactiveLerp : this._cameraAutomaticCenteringActiveLerp;
        }
        this._automaticCenteringAmount = this._disableAutomaticCentering ? 0 : scope.math.lerp(this._automaticCenteringAmount, P, scope.math.lerpCoefFPS(U)), this._sphericalTarget.theta = scope.math.lerp(this._sphericalTarget.theta, R, scope.math.lerpCoefFPS(this._cameraRotationLerp * D * this._automaticCenteringAmount)), this._sphericalTarget.phi = scope.math.lerp(this._sphericalTarget.phi, this._followedMeshPhi, scope.math.lerpCoefFPS(this._cameraRotationLerp * this._automaticCenteringAmount));
        let O = this._sphericalTarget.radius;
        if (this._cameraCollisions && x._collider) {
          let F = !1;
          scope.Ee(this, l, ws).call(this, {
            local: _,
            spherical: this._sphericalTarget,
            position: this.baseTarget,
            temp: scope.L(this, e),
            target: scope.L(this, i)
          });
          const k = this._sphericalTarget.radius - scope.L(this, i).distanceTo(_.position);
          scope.L(this, a).copy(this._sphericalTarget), x._rayCaster.set(this.baseTarget, scope.L(this, s).subVectors(scope.L(this, i), this.baseTarget).normalize());
          const W = x._rayCaster.intersectObject(x._collider);
          W.length > 0 && W[0].distance < this._followedMeshDistance && W[0].distance > k && !scope.Ee(this, l, Qa).call(this, W[0]) && (scope.L(this, a).radius = Math.max(this._followedMeshOffsetDistance, W[0].distance * .9), F = !0);
          const $ = this._followedMeshDistance * this._cameraCollisionsIncrement;
          let Z = 0;
          for (; scope.L(this, a).radius > this._followedMeshOffsetDistance && Z < this._cameraCollisionsMaxIterations;) {
            scope.Ee(this, l, ws).call(this, {
              local: _,
              spherical: scope.L(this, a),
              position: this.baseTarget,
              temp: scope.L(this, e),
              target: scope.L(this, i)
            });
            const J = x._geometry.boundsTree.closestPointToPoint(scope.L(this, i), void 0, 0, this._cameraCollisionsMinDistance);
            if (J && J.distance < this._cameraCollisionsMinDistance && !scope.Ee(this, l, Qa).call(this, J)) scope.L(this, a).radius = Math.max(this._followedMeshOffsetDistance, scope.L(this, a).radius - $), Z++, F = !0;else break;
          }
          F ? O = scope.L(this, a).radius : O = Math.min(this._followedMeshDistance, scope.L(this, a).radius + $ * scope.renderInfo.ratio);
        } else O = this._followedMeshDistance;
        this._sphericalTarget.radius = scope.math.lerpFPS(this._sphericalTarget.radius, O, this._cameraSphericalRadiusCollisionsLerp), scope.L(this, a).radius = this._sphericalTarget.radius + this.additionalSpherical.radius, scope.L(this, a).phi = this._sphericalTarget.phi + this.additionalSpherical.phi, scope.L(this, a).theta = this._sphericalTarget.theta + this.additionalSpherical.theta, scope.L(this, a).makeSafe();
        const N = scope.math.lerpCoefFPS(this._followedMesh._controlMode === "automatic" ? this._cameraSphericalRotationLerp : this._cameraSphericalRotationFastLerp),
          H = scope.math.lerpCoefFPS(this._cameraSphericalRadiusLerp);
        this._spherical.phi = scope.math.lerp(this._spherical.phi, scope.L(this, a).phi, N), this._spherical.theta = scope.math.lerp(this._spherical.theta, scope.L(this, a).theta, N), this._spherical.radius = scope.math.lerp(this._spherical.radius, scope.L(this, a).radius, H), scope.L(this, o).radius = scope.math.lerp(this._spherical.radius, this.overwriteSpherical.radius, this.overwriteAmount), scope.L(this, o).phi = scope.math.lerp(this._spherical.phi, this.overwriteSpherical.phi, this.overwriteAmount), scope.L(this, o).theta = scope.math.lerp(this._spherical.theta, this.overwriteSpherical.theta, this.overwriteAmount), scope.L(this, o).makeSafe(), scope.Ee(this, l, ws).call(this, {
          local: _,
          spherical: scope.L(this, o),
          position: this.baseTarget,
          temp: scope.L(this, e),
          target: this.basePosition
        }), this.baseUp.copy(_.up);
      }
      super._update();
    }
    setOffset(_ = [0, 0, 0], x = !0) {
      scope.Ee(this, l, Ha).call(this, scope.L(this, e)), scope.L(this, e).add(this._followedMesh._localObject.position), this._followedMeshOffset.fromArray(_), this._followedMeshOffsetDistance = this._followedMeshOffset.length(), x && (this._followedMeshOffsetTarget.copy(this._followedMeshOffset).applyQuaternion(this._followedMesh._localObject.quaternion), this._followedMeshTarget.copy(this._followedMeshOffsetTarget).add(scope.L(this, e)), this.baseTarget.copy(this._followedMeshTarget));
    }
    setFollowOverwrite({
      phi: _ = Math.PI * .5,
      theta: x = 0,
      radius: b = 1,
      target: T = [0, 0, 0]
    } = {}) {
      this.overwriteSpherical.set(b, _, scope.math.getShortestRotationAngle(this._spherical.theta, x)), this.overwriteTarget.fromArray(T);
    }
  }, e = new WeakMap(), i = new WeakMap(), s = new WeakMap(), a = new WeakMap(), o = new WeakMap(), l = new WeakSet(), ws = function ({
    local: _,
    spherical: x,
    position: b,
    temp: T,
    target: M
  } = {}) {
    T.setFromSpherical(x).applyQuaternion(_.quaternion), T.applyAxisAngle(_.up, Math.PI - _.rotationHorizontal), M.copy(b).add(T);
  }, Ha = function (_) {
    _.copy(this._followedMesh._collisionPhysics._charactersCapsule.segment.end), _.y += this._followedMesh._collisionPhysics._charactersCapsule.radius, _.applyQuaternion(this._followedMesh._localObject.quaternion);
  }, Qa = function (_) {
    var D;
    if (!_ || typeof _.faceIndex != "number") return !1;
    const x = (D = this._followedMesh) == null ? void 0 : D._collisionPhysics;
    if (!x || !x._collider || !x._colliderMesh) return !1;
    const b = x._collider.geometry,
      T = x._colliderMesh.geometry;
    if (!T.attributes.skipcollision) return !1;
    const M = b.getIndex(),
      w = M ? M.array[_.faceIndex * 3] : _.faceIndex * 3;
    return T.attributes.skipcollision.array[w] > 0;
  }, p;
};
}
