/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 761945:763762.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1270(scope) {
scope.pointAnimation = class pointAnimation {
  constructor(e) {
    const i = e.userData;
    this._frames = i.frames, this._fps = i.fps, this._duration = this._frames / this._fps, this._attribs = e.attributes, this._camTargetDistance = 1, this._object = null, this._animationVar = 0, this._animation = scope.createTween(this, {
      to: {
        _animationVar: 1
      },
      duration: this._duration,
      ease: "none",
      paused: !0,
      onUpdate: this._onUpdate.bind(this)
    });
  }
  _onUpdate() {
    if (!this._object) return;
    const e = this._frames - 1,
      i = scope.math.clamp(e * this._animationVar, 0, e),
      s = Math.floor(i),
      a = Math.ceil(i),
      o = Math.abs(i - s);
    this._object.isCamera && scope._qCam.identity(), scope.animationAttributes.forEach(l => {
      const c = this._attribs[l];
      if (!(!c || !this._object[l]) && !(this._object.isCamera && l === "scale")) switch (l) {
        case "scale":
          c.itemSize === 1 ? this._object.scale.setScalar(scope.math.lerp(c.array[s], c.array[a], o)) : this._object.scale.fromArray(c.array, s * 3).lerp(scope._v1$d.fromArray(c.array, a * 3), o);
          break;
        case "quaternion":
          scope._q1$1.fromArray(c.array, s * 4).normalize(), scope._q2.fromArray(c.array, a * 4).normalize(), scope._q1$1.slerp(scope._q2, o), this._object.isCamera ? scope._qCam.copy(scope._q1$1) : this._object.quaternion.copy(scope._q1$1);
          break;
        case "position":
          this._object[this._object.isCamera ? "basePosition" : "position"].fromArray(c.array, s * 3).lerp(scope._v1$d.fromArray(c.array, a * 3), o);
          break;
      }
    }), this._object.isCamera && !scope._qCam.equals(scope._qIdentity) && (this._object.baseTarget.set(0, 0, -this._camTargetDistance).applyQuaternion(scope._qCam).add(this._object.basePosition), this._object.baseUp.set(0, 1, 0).applyQuaternion(scope._qCam));
  }
  use(e, i = !0) {
    return this._object = e, this._object.isCamera && i && (this._camTargetDistance = scope._v1$d.copy(this._object.baseTarget).sub(this._object.basePosition).length()), this.progress(0);
  }
  play() {
    return this._animation.play();
  }
  pause() {
    return this._animation.pause();
  }
  progress(e = 0) {
    return this._animation.progress(e);
  }
  restart() {
    return this._animation.restart();
  }
  dispose() {
    this._animation.kill(), this._object = null;
  }
};
}
