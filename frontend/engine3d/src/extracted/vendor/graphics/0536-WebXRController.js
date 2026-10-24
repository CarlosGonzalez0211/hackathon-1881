/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 166719:170053.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0536(scope) {
scope.WebXRController = class WebXRController {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new scope.Group(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = {
      pinching: !1
    }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new scope.Group(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new scope.Vector3(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new scope.Vector3()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new scope.Group(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new scope.Vector3(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new scope.Vector3()), this._grip;
  }
  dispatchEvent(e) {
    return this._targetRay !== null && this._targetRay.dispatchEvent(e), this._grip !== null && this._grip.dispatchEvent(e), this._hand !== null && this._hand.dispatchEvent(e), this;
  }
  connect(e) {
    if (e && e.hand) {
      const i = this._hand;
      if (i) for (const s of e.hand.values()) this._getHandJoint(i, s);
    }
    return this.dispatchEvent({
      type: "connected",
      data: e
    }), this;
  }
  disconnect(e) {
    return this.dispatchEvent({
      type: "disconnected",
      data: e
    }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this;
  }
  update(e, i, s) {
    let a = null,
      o = null,
      l = null;
    const c = this._targetRay,
      h = this._grip,
      d = this._hand;
    if (e && i.session.visibilityState !== "visible-blurred") {
      if (d && e.hand) {
        l = !0;
        for (const T of e.hand.values()) {
          const M = i.getJointPose(T, s),
            w = this._getHandJoint(d, T);
          M !== null && (w.matrix.fromArray(M.transform.matrix), w.matrix.decompose(w.position, w.rotation, w.scale), w.matrixWorldNeedsUpdate = !0, w.jointRadius = M.radius), w.visible = M !== null;
        }
        const p = d.joints["index-finger-tip"],
          f = d.joints["thumb-tip"],
          _ = p.position.distanceTo(f.position),
          x = .02,
          b = .005;
        d.inputState.pinching && _ > x + b ? (d.inputState.pinching = !1, this.dispatchEvent({
          type: "pinchend",
          handedness: e.handedness,
          target: this
        })) : !d.inputState.pinching && _ <= x - b && (d.inputState.pinching = !0, this.dispatchEvent({
          type: "pinchstart",
          handedness: e.handedness,
          target: this
        }));
      } else h !== null && e.gripSpace && (o = i.getPose(e.gripSpace, s), o !== null && (h.matrix.fromArray(o.transform.matrix), h.matrix.decompose(h.position, h.rotation, h.scale), h.matrixWorldNeedsUpdate = !0, o.linearVelocity ? (h.hasLinearVelocity = !0, h.linearVelocity.copy(o.linearVelocity)) : h.hasLinearVelocity = !1, o.angularVelocity ? (h.hasAngularVelocity = !0, h.angularVelocity.copy(o.angularVelocity)) : h.hasAngularVelocity = !1));
      c !== null && (a = i.getPose(e.targetRaySpace, s), a === null && o !== null && (a = o), a !== null && (c.matrix.fromArray(a.transform.matrix), c.matrix.decompose(c.position, c.rotation, c.scale), c.matrixWorldNeedsUpdate = !0, a.linearVelocity ? (c.hasLinearVelocity = !0, c.linearVelocity.copy(a.linearVelocity)) : c.hasLinearVelocity = !1, a.angularVelocity ? (c.hasAngularVelocity = !0, c.angularVelocity.copy(a.angularVelocity)) : c.hasAngularVelocity = !1, this.dispatchEvent(scope._moveEvent)));
    }
    return c !== null && (c.visible = a !== null), h !== null && (h.visible = o !== null), d !== null && (d.visible = l !== null), this;
  }
  _getHandJoint(e, i) {
    if (e.joints[i.jointName] === void 0) {
      const s = new scope.Group();
      s.matrixAutoUpdate = !1, s.visible = !1, e.joints[i.jointName] = s, e.add(s);
    }
    return e.joints[i.jointName];
  }
};
}
