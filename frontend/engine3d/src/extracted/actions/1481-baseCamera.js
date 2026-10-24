/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 896528:901706.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1481(scope) {
scope.baseCamera = function baseCamera(r) {
  const e = scope.CAMERA_TYPE[r.toUpperCase()],
    i = e === scope.CAMERA_TYPE.PERSPECTIVE ? scope.PerspectiveCamera : scope.OrthographicCamera;
  return class extends i {
    constructor() {
      e === scope.CAMERA_TYPE.PERSPECTIVE ? super(45, scope.client$1.screen.w / scope.client$1.screen.h, scope.BASE_NEAR, scope.BASE_FAR) : super(scope.client$1.screen.w * -.5, scope.client$1.screen.w * .5, scope.client$1.screen.h * .5, scope.client$1.screen.h * -.5, scope.BASE_NEAR, scope.BASE_FAR), this.isBaseCamera = !0, this._sizing = scope.CAMERA_SIZING.SCREEN, this._size = new scope.Vector2(scope.client$1.screen.w, scope.client$1.screen.h), this._prevSize = this._size.clone(), this._prevPosition = new scope.Vector3(), this._prevTarget = new scope.Vector3(), this._prevUp = new scope.Vector3(), this._additionalSphericalPosition = new scope.Spherical(), this._additionalSphericalTarget = new scope.Spherical(), this._additionalRotationUp = 0, this._touchPosition = new scope.Vector2(), this._touchVelocity = new scope.Vector2(), this.target = new scope.Vector3(), this.basePosition = new scope.Vector3(0, 0, scope.BASE_Z), this.baseTarget = new scope.Vector3(), this.baseUp = new scope.Vector3(0, 1, 0), this.displacement = {
        position: new scope.Vector2(),
        target: new scope.Vector2(),
        rotation: 0
      }, this.lerpPosition = .05, this.lerpTarget = .05, this.lerpRotation = .05, this.shake = new scope.Vector3(), this.shakeSpeed = new scope.Vector3(1, 1, 1), this.touchAmount = 1, this.resetOnTouch = !0;
    }
    _update(s = !1) {
      const a = scope.touches$1.get(0),
        o = this.resetOnTouch && a.input === "touch" && a.touchID === !1,
        l = o ? .5 : 1,
        c = o ? 0 : scope.math.fit(a.position11.x, -1, 1, -scope.HALF_PI, scope.HALF_PI),
        h = o ? 0 : scope.math.fit(a.position11.y, 1, -1, -scope.HALF_PI, scope.HALF_PI),
        d = this._touchPosition.x,
        p = this._touchPosition.y,
        f = s ? 1 : scope.math.lerpCoefFPS(.1);
      this._touchPosition.x = scope.math.lerp(this._touchPosition.x, c, f), this._touchPosition.y = scope.math.lerp(this._touchPosition.y, h, f), this._touchVelocity.x += this._touchPosition.x - d, this._touchVelocity.y += this._touchPosition.y - p, this._touchVelocity.multiplyScalar(scope.math.frictionFPS(.95)), (this._touchVelocity.lengthSq() < 1e-4 || s) && this._touchVelocity.set(0, 0);
      const _ = scope.math.lerp(0, this._touchPosition.x, this.touchAmount),
        x = scope.math.lerp(0, this._touchPosition.y, this.touchAmount),
        b = scope.math.lerp(0, this._touchVelocity.x, this.touchAmount);
      if (scope._forward.subVectors(this.basePosition, this.baseTarget), scope._forward.lengthSq() === 0 && (scope._forward.z = 1), scope._forward.normalize(), scope._right.crossVectors(this.baseUp, scope._forward), scope._right.lengthSq() === 0 && (Math.abs(this.baseUp.z) === 1 ? scope._forward.x += 1e-4 : scope._forward.z += 1e-4, scope._forward.normalize(), scope._right.crossVectors(this.baseUp, scope._forward)), scope._right.normalize(), scope._up.crossVectors(scope._forward, scope._right), this.displacement.position.equals(scope.ZERO_V2)) this.position.copy(this.basePosition), this._additionalSphericalPosition.set(1, 0, 0);else {
        const T = s ? 1 : scope.math.lerpCoefFPS(this.lerpPosition * l),
          M = _ * this.displacement.position.x,
          w = x * this.displacement.position.y;
        this._additionalSphericalPosition.theta = scope.math.lerp(this._additionalSphericalPosition.theta, M, T), this._additionalSphericalPosition.phi = scope.math.lerp(this._additionalSphericalPosition.phi, w, T), scope._v0$j.subVectors(this.basePosition, this.baseTarget), scope._v0$j.applyAxisAngle(scope._right, this._additionalSphericalPosition.phi).applyAxisAngle(scope._up, this._additionalSphericalPosition.theta), this.position.copy(this.baseTarget).add(scope._v0$j);
      }
      if (this.displacement.target.equals(scope.ZERO_V2) && this.shake.x === 0 && this.shake.y === 0) this.target.copy(this.baseTarget), this._additionalSphericalTarget.set(1, 0, 0);else {
        const T = s ? 1 : scope.math.lerpCoefFPS(this.lerpTarget * l),
          M = _ * this.displacement.target.x,
          w = x * this.displacement.target.y;
        this._additionalSphericalTarget.theta = scope.math.lerp(this._additionalSphericalTarget.theta, M, T), this._additionalSphericalTarget.phi = scope.math.lerp(this._additionalSphericalTarget.phi, w, T);
        const D = this.shake.x === 0 ? 0 : scope.noises.sineNoise1(12.23, 3.44, -3.234 + scope.renderInfo.time * this.shakeSpeed.x) * this.shake.x * this.touchAmount,
          R = this.shake.y === 0 ? 0 : scope.noises.sineNoise1(-2.45, 4.789, 7.343 + scope.renderInfo.time * this.shakeSpeed.y) * this.shake.y * this.touchAmount;
        scope._v0$j.subVectors(this.baseTarget, this.basePosition), scope._v0$j.applyAxisAngle(scope._right, this._additionalSphericalTarget.phi + R).applyAxisAngle(scope._up, this._additionalSphericalTarget.theta + D), this.target.copy(this.basePosition).add(scope._v0$j);
      }
      if (this.displacement.rotation === 0 && this.shake.z === 0) this.up.copy(this.baseUp), this._additionalRotationUp = 0;else {
        const T = s ? 1 : scope.math.lerpCoefFPS(this.lerpRotation * l),
          M = b * this.displacement.rotation * this.touchAmount;
        this._additionalRotationUp = scope.math.lerp(this._additionalRotationUp, M, T);
        const w = this.shake.z === 0 ? 0 : scope.noises.sineNoise1(23.434, -1.565, 8.454 + scope.renderInfo.time * this.shakeSpeed.z) * this.shake.z * this.touchAmount;
        scope._v0$j.subVectors(this.position, this.target).normalize(), this.up.copy(this.baseUp).applyAxisAngle(scope._v0$j, this._additionalRotationUp + w);
      }
      (!this.position.equals(this._prevPosition) || !this.target.equals(this._prevTarget) || !this.up.equals(this._prevUp)) && (this._prevPosition.copy(this.position), this._prevTarget.copy(this.target), this._prevUp.copy(this.up), this.quaternion.setFromRotationMatrix(scope._m0$4.lookAt(this.position, this.target, this.up)));
    }
    _resize() {
      if (this._sizing === scope.CAMERA_SIZING.SCREEN && this._size.set(scope.client$1.screen.w, scope.client$1.screen.h), !this._prevSize.equals(this._size)) {
        if (this._prevSize.copy(this._size), this.isPerspectiveCamera) this.aspect = this._size.x / this._size.y;else {
          const s = this._size.x * .5,
            a = this._size.y * .5;
          this.left = -s, this.right = s, this.top = a, this.bottom = -a;
        }
        this.updateProjectionMatrix();
      }
    }
    setCustomSize(s, a) {
      this._sizing = scope.CAMERA_SIZING.CUSTOM, this._size.set(s, a);
    }
  };
};
}
