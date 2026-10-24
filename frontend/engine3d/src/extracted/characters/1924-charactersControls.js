/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1413792:1423337.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1924(scope) {
scope.charactersControls = class charactersControls {
  constructor(e, i) {
    scope.oe(this, scope.vs, new scope.Vector3());
    scope.oe(this, scope.$t, new scope.Vector3());
    scope.oe(this, scope.ca, new scope.Vector2());
    scope.oe(this, scope.ar, new scope.Vector2());
    this._characters = e, this._moveKeysPressed = [!1, !1, !1, !1], this._sprintEnabled = i.sprintEnabled || !1, this._sprintSpeed = typeof i.sprintSpeed == "number" ? i.sprintSpeed : 1.5, this._sprintPreventsJump = i.sprintPreventsJump || !1, this.__sprintPressed = !1, this._jumpRequestTimeout = null, this._jumpKeyLocked = !1, this._gamepadRequestJump = !1, this._gamepadMovingCamera = !1, this._isLeftMousePressed = !1, this._canTouch = scope.client$1.capabilities.touch, this._touchMovingFinger = -1, this._touchCameraFinger = -1, this._touchMovingStart = new scope.Vector2(), this._touchMovingDelta = new scope.Vector2(), this._mouseToggleCb = i.mouseToggleCb || !1, this._mouseRightButtonTime = 0, this._controlTouchAmount = typeof i.controlTouchAmount == "number" ? i.controlTouchAmount : 75, this._controlTouchMarginLeft = typeof i.controlTouchMarginLeft == "number" ? i.controlTouchMarginLeft : 20, this._controlTouchMarginBottom = typeof i.controlTouchMarginBottom == "number" ? i.controlTouchMarginBottom : 25, this._controlTouchManualMultiplier = typeof i.controlTouchManualMultiplier == "number" ? i.controlTouchManualMultiplier : .75, this._controlMouseAmount = typeof i.controlMouseAmount == "number" ? i.controlMouseAmount : 200, this._circles = new scope.controlsCirlces(this), this._boundMouseRightDown = this._mouseRightDown.bind(this), this._boundMouseRightUp = this._mouseRightUp.bind(this), this._enabled = !1;
  }
  get _sprintPressed() {
    return this.__sprintPressed;
  }
  set _sprintPressed(e) {
    e !== this.__sprintPressed && (this.__sprintPressed = e, scope.events$1.emit("character_controls_shift_pressed", e));
  }
  _automaticMovingCirclePosition11() {
    return {
      x: this._touchMovingStart.x / scope.client$1.screen.width * 2 - 1,
      y: this._touchMovingStart.y / scope.client$1.screen.height * -2 + 1,
      z: 0
    };
  }
  _manualMovingCirclePosition() {
    return {
      x: this._controlTouchAmount + this._controlTouchMarginLeft,
      y: scope.client$1.screen.height - this._controlTouchAmount - this._controlTouchMarginBottom,
      z: 0
    };
  }
  _manualMovingCirclePosition11() {
    return {
      x: (this._controlTouchAmount + this._controlTouchMarginLeft) / scope.client$1.screen.width * 2 - 1,
      y: (this._controlTouchAmount + this._controlTouchMarginBottom) / scope.client$1.screen.height * 2 - 1,
      z: 0
    };
  }
  _onActiveChange() {
    (!scope.client$1.visible || !scope.client$1.focused) && this._endInteraction();
  }
  _onKey(e) {
    const i = e.type === "keydown",
      s = this._sprintEnabled && this._sprintPreventsJump && this._sprintPressed;
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        this._moveKeysPressed[0] = i;
        break;
      case "KeyS":
      case "ArrowDown":
        this._moveKeysPressed[1] = i;
        break;
      case "KeyA":
      case "ArrowLeft":
        this._moveKeysPressed[2] = i;
        break;
      case "KeyD":
      case "ArrowRight":
        this._moveKeysPressed[3] = i;
        break;
      case "Space":
        s || this._requestJump(i);
        break;
      case "ShiftLeft":
      case "ShiftRight":
        this._sprintEnabled && (this._sprintPressed = i);
        break;
    }
  }
  _requestJump(e = !1) {
    e ? this._jumpKeyLocked || (this._jumpKeyLocked = !0, this._characters._collisionPhysics._jumpRequested = !0, scope.__lifecycle.clearTimeout(this._jumpRequestTimeout), this._jumpRequestTimeout = scope.__lifecycle.setTimeout(() => {
      this._characters._collisionPhysics._jumpRequested = !1;
    }, 75)) : this._jumpKeyLocked = !1;
  }
  _onTouchStart(e) {
    if (e.input === "mouse") !this._isLeftMousePressed && e.button === 0 && (this._isLeftMousePressed = !0, this._mouseToggleCb && this._mouseToggleCb(!0), this._onTouchDrag(e));else if (this._characters._controlMode === "automatic") this._touchMovingFinger === -1 && e.finger === 0 && (this._touchMovingFinger = e.finger, this._touchMovingStart.copy(e.position), this._onTouchDrag(e));else {
      const i = this._controlTouchAmount * this._controlTouchManualMultiplier;
      scope.L(this, scope.ca).copy(e.position).distanceTo(scope.L(this, scope.ar).copy(this._manualMovingCirclePosition())) < i && this._touchMovingFinger === -1 ? (this._touchMovingFinger = e.finger, this._touchMovingStart.copy(scope.L(this, scope.ar)), this._onTouchDrag(e)) : this._touchCameraFinger === -1 && (this._touchCameraFinger = e.finger, this._onTouchDrag(e));
    }
  }
  _rotateCharactersCamera(e = 0, i = 0) {
    this._characters._camera.isFollowCamera && (this._characters._camera._sphericalTarget.phi += i * (this._characters._camera._sphericalVerticalMaxLimit - this._characters._camera._sphericalVerticalMinLimit), this._characters._camera._sphericalTarget.theta -= e * scope.math.TWO_PI);
  }
  _onTouchDrag(e) {
    if (e.input === "mouse") {
      if (this._isLeftMousePressed) if (this._characters._controlMode === "automatic") {
        scope.L(this, scope.vs).copy(this._characters._localObject.position), this._characters._collisionPhysics && scope.L(this, scope.vs).addScaledVector(this._characters._localObject.up, this._characters._collisionPhysics._charactersCapsule.segment.end.y * .5);
        const i = scope.utils.planeInteraction.setCamera(this._characters._camera).getPointPositionOnScreen(scope.L(this, scope.vs));
        this._touchMovingDelta.set(i.x, i.y).sub(e.position), this._touchMovingDelta.divideScalar(this._controlMouseAmount).clampLength(-1, 1);
      } else this._rotateCharactersCamera(e.delta11.x, e.delta11.y);
    } else if (e.finger === this._touchMovingFinger) {
      const i = this._characters._controlMode === "automatic" ? 1 : this._controlTouchManualMultiplier;
      this._touchMovingDelta.copy(this._touchMovingStart).sub(e.position).divideScalar(this._controlTouchAmount * i).clampLength(-1, 1);
    } else e.finger === this._touchCameraFinger && this._rotateCharactersCamera(e.delta11.x, e.delta11.y);
  }
  _onTouchEnd(e) {
    e.input === "mouse" ? (this._isLeftMousePressed = !1, this._touchMovingDelta.setScalar(0), this._mouseToggleCb && this._mouseToggleCb(!1)) : e.finger === this._touchMovingFinger ? (this._touchMovingFinger = -1, this._touchMovingDelta.setScalar(0)) : e.finger === this._touchCameraFinger && (this._touchCameraFinger = -1);
  }
  _onTouchClick(e) {
    e.input !== "mouse" && (this._requestJump(!0), this._requestJump(!1), e.finger !== this._touchMovingFinger && this._circles._animateJump(e));
  }
  _onTouchSprint(e = !1) {
    this._onKey({
      type: e === !0 ? "keydown" : "keyup",
      code: "ShiftLeft"
    });
  }
  _mouseRightDown(e) {
    e.button === 2 && (this._mouseRightButtonTime = scope.renderInfo.time);
  }
  _mouseRightUp(e) {
    e.button === 2 && scope.renderInfo.time - this._mouseRightButtonTime < .5 && (this._requestJump(!0), this._requestJump(!1));
  }
  _update() {
    if (this._circles._update(), scope.L(this, scope.$t).setScalar(0), !scope.client$1.visible) return scope.L(this, scope.$t);
    if (this._moveKeysPressed.includes(!0) && (this._moveKeysPressed[0] && (scope.L(this, scope.$t).z += 1), this._moveKeysPressed[1] && (scope.L(this, scope.$t).z -= 1), this._moveKeysPressed[2] && (scope.L(this, scope.$t).x += 1), this._moveKeysPressed[3] && (scope.L(this, scope.$t).x -= 1), scope.L(this, scope.$t).normalize()), scope.L(this, scope.$t).x += this._touchMovingDelta.x, scope.L(this, scope.$t).z += this._touchMovingDelta.y, this._enabled) {
      if (scope.L(this, scope.$t).x -= scope.gamepad$1.stick1.x, scope.L(this, scope.$t).z -= scope.gamepad$1.stick1.y, this._characters._controlMode === "manual") {
        const e = scope.math.lerpCoefFPS(.1),
          i = scope.gamepad$1.stick2.x * -.1 * e,
          s = scope.gamepad$1.stick2.y * .1 * e;
        this._rotateCharactersCamera(i, s), this._gamepadMovingCamera = Math.abs(i) > 0 || Math.abs(s) > 0;
      }
      scope.gamepad$1.buttons[0] === !0 ? (this._gamepadRequestJump = !0, this._requestJump(!0)) : this._gamepadRequestJump && (this._gamepadRequestJump = !1, this._requestJump(!1));
    }
    return scope.L(this, scope.$t).clampLength(-1, 1), this._sprintPressed && scope.L(this, scope.$t).multiplyScalar(this._sprintSpeed), scope.L(this, scope.$t);
  }
  _endInteraction() {
    for (let e = 0; e < this._moveKeysPressed.length; e++) this._moveKeysPressed[e] = !1;
    this._requestJump(!1), this._sprintPressed = !1, this._gamepadRequestJump = !1, this._isLeftMousePressed = !1, this._touchMovingFinger = -1, this._touchMovingDelta.setScalar(0), this._touchCameraFinger = -1, this._mouseToggleCb && this._mouseToggleCb(!1);
  }
  cancelJump() {
    this._characters._collisionPhysics._jumpRequested = !1, scope.__lifecycle.setTimeout(() => {
      this._characters._collisionPhysics._jumpRequested = !1;
    }, 0);
  }
  enable() {
    this._enabled || (this._enabled = !0, scope.events$1.on("keydown", this._onKey, this), scope.events$1.on("keyup", this._onKey, this), scope.events$1.on("touch_start", this._onTouchStart, this), scope.events$1.on("touch_drag", this._onTouchDrag, this), scope.events$1.on("touch_end", this._onTouchEnd, this), scope.events$1.on("touch_click", this._onTouchClick, this), scope.events$1.on("touch2_start", this._onTouchStart, this), scope.events$1.on("touch2_drag", this._onTouchDrag, this), scope.events$1.on("touch2_end", this._onTouchEnd, this), scope.events$1.on("touch2_click", this._onTouchClick, this), scope.events$1.on("character_controls_shift_press", this._onTouchSprint, this), scope.events$1.on("visibility_change", this._onActiveChange, this), scope.events$1.on("focus_change", this._onActiveChange, this), scope.__lifecycle.listen(scope.global$1.interactionNode, "mousedown", this._boundMouseRightDown), scope.__lifecycle.listen(scope.global$1.interactionNode, "mouseup", this._boundMouseRightUp), scope.__lifecycle.listen(scope.global$1.interactionNode, "mouseout", this._boundMouseRightUp));
  }
  disable() {
    this._enabled && (this._enabled = !1, scope.events$1.off("keydown", this._onKey, this), scope.events$1.off("keyup", this._onKey, this), scope.events$1.off("touch_start", this._onTouchStart, this), scope.events$1.off("touch_drag", this._onTouchDrag, this), scope.events$1.off("touch_end", this._onTouchEnd, this), scope.events$1.off("touch_click", this._onTouchClick, this), scope.events$1.off("touch2_start", this._onTouchStart, this), scope.events$1.off("touch2_drag", this._onTouchDrag, this), scope.events$1.off("touch2_end", this._onTouchEnd, this), scope.events$1.off("touch2_click", this._onTouchClick, this), scope.events$1.off("character_controls_shift_press", this._onTouchSprint, this), scope.events$1.off("visibility_change", this._onActiveChange, this), scope.events$1.off("focus_change", this._onActiveChange, this), scope.__lifecycle.unlisten(scope.global$1.interactionNode, "mousedown", this._boundMouseRightDown), scope.__lifecycle.unlisten(scope.global$1.interactionNode, "mouseup", this._boundMouseRightUp), scope.__lifecycle.unlisten(scope.global$1.interactionNode, "mouseout", this._boundMouseRightUp), this._endInteraction());
  }
  dispose() {
    this.disable(), this._circles.traverse(e => {
      var i, s, a, o, l;
      e.material && (e.material.uniforms && Object.values(e.material.uniforms).forEach(c => {
        var h, d, p;
        (h = c.value) != null && h._loaded && ((p = (d = c.value).dispose) == null || p.call(d));
      }), (s = (i = e.material).dispose) == null || s.call(i)), (o = (a = e.geometry) == null ? void 0 : a.dispose) == null || o.call(a), (l = e.dispose) == null || l.call(e);
    }), this._characters = null, this._circles = null;
  }
};
}
