/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 902026:910455.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1491(scope) {
scope.orbitCamera = function orbitCamera(r) {
  return class extends r {
    constructor() {
      super(), this.isOrbitCamera = !0, this.displacement.position.setScalar(0), this.displacement.target.setScalar(0), this.displacement.rotation = 0, this.lerpPosition = 1, this.lerpTarget = 1, this.lerpRotation = 1, this.buttons = {
        ROTATE: 0,
        ZOOM: 1,
        PAN: 2
      }, this.touches = {
        ONE: scope.TOUCH_ACTIONS.ROTATE,
        TWO: scope.TOUCH_ACTIONS.ZOOM_PAN
      }, this.lerpRotate = .075, this.lerpZoom = .1, this.lerpPan = .1, this.enableRotate = !0, this.rotateSpeed = 1, this.enableZoom = !0, this.enableMouseZoom = !1, this.zoomToCursor = !1, this.zoomSpeed = 1, this.zoomSpeedWheel = .25, this.enablePan = !0, this.panSpeed = 1, this.autoRotate = !1, this.autoRotateSpeed = 1, this.touchResetPan = !1, this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.minPanPosition = new scope.Vector3().setScalar(-1 / 0), this.maxPanPosition = new scope.Vector3().setScalar(1 / 0), this._spherical = new scope.Spherical(), this._sphericalDelta = new scope.Spherical(), this._sphericalTarget = new scope.Spherical(), this._panDelta = new scope.Vector3(), this._panTarget = new scope.Vector3(), this._multiTouchDistance = 0, this._multiTouchPosition = new scope.Vector2(), this._zoomCursorPosition = new scope.Vector2(), this._zoomDelta = 1, this._zoomTarget = 1, this._zoomPrev = 1, this._state = scope.STATE.NONE, this._enabled = !1, this._firstOrbitUpdate = !0, this.enable();
    }
    _fromPositionTarget() {
      this._sphericalTarget.setFromVector3(scope._v0$i.copy(this.basePosition).sub(this.baseTarget));
    }
    _update(e = !1) {
      if (this._firstOrbitUpdate && this._fromPositionTarget(), (e || this._firstOrbitUpdate) && (this._spherical.copy(this._sphericalTarget), this._sphericalDelta.set(1, 0, 0), this._panTarget.copy(this.baseTarget), this._panDelta.setScalar(0), this._zoomTarget = this.zoom, this._zoomDelta = 1), this.autoRotate && (this._sphericalDelta.theta -= 2 * Math.PI / 60 / 60 * this.autoRotateSpeed * scope.math.deltaRatio()), this.zoomToCursor) {
        const o = this.isOrthographicCamera ? this._zoomDelta - 1 : 1 - this._sphericalDelta.radius;
        o !== 0 && (scope._v1$c.set(this._zoomCursorPosition.x / scope.client$1.screen.w, 1 - this._zoomCursorPosition.y / scope.client$1.screen.h).multiplyScalar(2).subScalar(1), this._panDelta.add(scope._v0$i.subVectors(scope._pi.setCamera(this).unprojectPoint(scope._v1$c), this._panTarget).multiplyScalar(o)));
      }
      this._sphericalTarget.theta += this._sphericalDelta.theta, this._sphericalTarget.phi += this._sphericalDelta.phi, this._sphericalTarget.radius *= this._sphericalDelta.radius, this._panTarget.add(this._panDelta), this._sphericalDelta.set(1, 0, 0), this._panDelta.setScalar(0), this._sphericalTarget.theta = scope.math.clamp(this._sphericalTarget.theta, this.minAzimuthAngle, this.maxAzimuthAngle), this._sphericalTarget.phi = scope.math.clamp(this._sphericalTarget.phi, this.minPolarAngle, this.maxPolarAngle), this._sphericalTarget.phi = scope.math.clamp(this._sphericalTarget.phi, scope.EPS, Math.PI - scope.EPS), this._sphericalTarget.radius = scope.math.clamp(this._sphericalTarget.radius, this.minDistance, this.maxDistance), this._panTarget.clamp(this.minPanPosition, this.maxPanPosition);
      const i = scope.math.lerpCoefFPS(this.lerpRotate),
        s = scope.math.lerpCoefFPS(this.lerpZoom),
        a = scope.math.lerpCoefFPS(this.lerpPan);
      this._spherical.theta = scope.math.lerp(this._spherical.theta, this._sphericalTarget.theta, i), this._spherical.phi = scope.math.lerp(this._spherical.phi, this._sphericalTarget.phi, i), this._spherical.radius = scope.math.lerp(this._spherical.radius, this._sphericalTarget.radius, s), this.baseTarget.lerp(this._panTarget, a), scope._v0$i.setFromSpherical(this._spherical), this.basePosition.copy(this.baseTarget).add(scope._v0$i), this.isOrthographicCamera && (this._zoomTarget *= this._zoomDelta, this._zoomDelta = 1, this._zoomTarget = scope.math.clamp(this._zoomTarget, this.minZoom, this.maxZoom), this.zoom = scope.math.lerp(this.zoom, this._zoomTarget, s), this.zoom !== this._zoomPrev && (this._zoomPrev = this.zoom, this.updateProjectionMatrix())), this._firstOrbitUpdate = !1, super._update(e);
    }
    _handleRotateMove(e) {
      scope._v1$c.copy(e.delta).multiplyScalar(this.rotateSpeed), this._sphericalDelta.theta -= 2 * Math.PI * scope._v1$c.x / scope.client$1.screen.h, this._sphericalDelta.phi -= 2 * Math.PI * scope._v1$c.y / scope.client$1.screen.h;
    }
    _handleZoomMove(e) {
      const i = e.isPinching !== void 0;
      this._zoomCursorPosition.copy(e.isMultiTouchZoom ? this._multiTouchPosition : scope.touches$1.get(0).position);
      let s = e.delta.y;
      i ? s *= scope.MAGIC_NUMBER_ZOOM_MULTIPLIER * this.zoomSpeedWheel * (e.isPinching ? 10 : 1) : s /= scope.MAGIC_NUMBER_ZOOM_MULTIPLIER * scope.client$1.screen.h;
      const a = Math.pow(.95, this.zoomSpeed * Math.abs(s));
      this.isPerspectiveCamera ? s < 0 ? this._sphericalDelta.radius *= a : s > 0 && (this._sphericalDelta.radius /= a) : s < 0 ? this._zoomDelta /= a : s > 0 && (this._zoomDelta *= a);
    }
    _handlePanMove(e) {
      if (scope._v1$c.copy(e.delta).multiplyScalar(this.panSpeed), this.isPerspectiveCamera) {
        scope._v0$i.copy(this.basePosition).sub(this.baseTarget);
        let i = scope._v0$i.length();
        i *= Math.tan(this.fov / 2 * Math.PI / 180), this._panLeft(2 * scope._v1$c.x * i / scope.client$1.screen.h, this.matrix), this._panUp(2 * scope._v1$c.y * i / scope.client$1.screen.h, this.matrix);
      } else this._panLeft(scope._v1$c.x * (this.right - this.left) / this.zoom / scope.client$1.screen.w, this.matrix), this._panUp(scope._v1$c.y * (this.top - this.bottom) / this.zoom / scope.client$1.screen.h, this.matrix);
    }
    _panLeft(e, i) {
      scope._v0$i.setFromMatrixColumn(i, 0), scope._v0$i.multiplyScalar(-e), this._panDelta.add(scope._v0$i);
    }
    _panUp(e, i) {
      scope._v0$i.setFromMatrixColumn(i, 1), scope._v0$i.multiplyScalar(e), this._panDelta.add(scope._v0$i);
    }
    _getTouchesDistance() {
      return scope._v1$c.subVectors(scope.touches$1.get(0).position, scope.touches$1.get(1).position).length();
    }
    _getTouchesMiddle() {
      return scope._v1$c.addVectors(scope.touches$1.get(0).position, scope.touches$1.get(1).position).multiplyScalar(.5);
    }
    _handleMultitouchMove() {
      if (!(scope.touches$1.getActive().length < 2)) {
        if (scope._v2$3.copy(this._multiTouchPosition), this._multiTouchPosition.copy(this._getTouchesMiddle()), this.enableZoom) {
          const i = this._multiTouchDistance;
          this._multiTouchDistance = this._getTouchesDistance(), this._handleZoomMove({
            delta: {
              y: i - this._multiTouchDistance
            },
            isMultiTouchZoom: !0
          });
        }
        this.enablePan && this._state === scope.STATE.ZOOM_PAN ? this._handlePanMove({
          delta: scope._v1$c.subVectors(this._multiTouchPosition, scope._v2$3)
        }) : this.enableRotate && this._state === scope.STATE.ZOOM_ROTATE && this._handleRotateMove({
          delta: scope._v1$c.subVectors(this._multiTouchPosition, scope._v2$3)
        });
      }
    }
    _wheel(e) {
      this.enableZoom && (this._state !== scope.STATE.NONE && this._state !== scope.STATE.ROTATE || this._handleZoomMove(e));
    }
    _touchStart(e) {
      if (e.input === "mouse") switch (e.button) {
        case this.buttons.ROTATE:
          if (!this.enableRotate) return;
          this._state = scope.STATE.ROTATE;
          break;
        case this.buttons.ZOOM:
        case this.buttons.PAN:
          if (!this.enablePan) return;
          this._state = scope.STATE.PAN;
          break;
      } else switch (scope.touches$1.getActive().length) {
        case 1:
          switch (this.touches.ONE) {
            case scope.TOUCH_ACTIONS.ROTATE:
              if (!this.enableRotate) return;
              this._state = scope.STATE.ROTATE;
              break;
            case scope.TOUCH_ACTIONS.PAN:
              if (!this.enablePan) return;
              this._state = scope.STATE.PAN;
              break;
            default:
              this._state = scope.STATE.NONE;
          }
          break;
        case 2:
          switch (this.touches.TWO) {
            case scope.TOUCH_ACTIONS.ZOOM_PAN:
              if (!this.enableZoom && !this.enablePan) return;
              this._state = scope.STATE.ZOOM_PAN, this._multiTouchDistance = this._getTouchesDistance(), this._multiTouchPosition.copy(this._getTouchesMiddle());
              break;
            case scope.TOUCH_ACTIONS.ZOOM_ROTATE:
              if (!this.enableZoom && !this.enableRotate) return;
              this._state = scope.STATE.ZOOM_ROTATE, this._multiTouchDistance = this._getTouchesDistance(), this._multiTouchPosition.copy(this._getTouchesMiddle());
              break;
            default:
              this._state = scope.STATE.NONE;
          }
          break;
        default:
          this._state = scope.STATE.NONE;
      }
    }
    _touchDrag(e) {
      switch (this._state) {
        case scope.STATE.ROTATE:
          if (!this.enableRotate) return;
          this._handleRotateMove(e);
          break;
        case scope.STATE.ZOOM:
          if (!this.enableZoom) return;
          this._handleZoomMove(e);
          break;
        case scope.STATE.PAN:
          if (!this.enablePan) return;
          this._handlePanMove(e);
          break;
        case scope.STATE.ZOOM_PAN:
          if (!this.enableZoom && !this.enablePan) return;
          this._handleMultitouchMove();
          break;
        case scope.STATE.ZOOM_ROTATE:
          if (!this.enableZoom && !this.enableRotate) return;
          this._handleMultitouchMove();
          break;
      }
    }
    _touchEnd(e) {
      this.touchResetPan ? this._state = scope.STATE.NONE : e.input === "mouse" ? this._state = scope.STATE.NONE : this._touchStart(e);
    }
    enable() {
      this._enabled || (this._enabled = !0, scope.events$1.on("touch_start", this._touchStart, this), scope.events$1.on("touch_drag", this._touchDrag, this), scope.events$1.on("touch_end", this._touchEnd, this), scope.events$1.on("touch2_start", this._touchStart, this), scope.events$1.on("touch2_drag", this._touchDrag, this), scope.events$1.on("touch2_end", this._touchEnd, this), scope.events$1.on("wheel", this._wheel, this));
    }
    disable() {
      this._enabled && (this._enabled = !1, this._state = scope.STATE.NONE, scope.events$1.off("touch_start", this._touchStart, this), scope.events$1.off("touch_drag", this._touchDrag, this), scope.events$1.off("touch_end", this._touchEnd, this), scope.events$1.off("touch2_start", this._touchStart, this), scope.events$1.off("touch2_drag", this._touchDrag, this), scope.events$1.off("touch2_end", this._touchEnd, this), scope.events$1.off("wheel", this._wheel, this));
    }
    dispose() {
      this.disable();
    }
  };
};
}
