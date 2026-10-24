/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 285811:287654.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0774(scope) {
scope.AudioListener = class AudioListener extends scope.Object3D {
  constructor() {
    super(), this.type = "AudioListener", this.context = scope.AudioContext.getContext(), this.gain = this.context.createGain(), this.gain.connect(this.context.destination), this.filter = null, this.timeDelta = 0, this._clock = new scope.Clock();
  }
  getInput() {
    return this.gain;
  }
  removeFilter() {
    return this.filter !== null && (this.gain.disconnect(this.filter), this.filter.disconnect(this.context.destination), this.gain.connect(this.context.destination), this.filter = null), this;
  }
  getFilter() {
    return this.filter;
  }
  setFilter(e) {
    return this.filter !== null ? (this.gain.disconnect(this.filter), this.filter.disconnect(this.context.destination)) : this.gain.disconnect(this.context.destination), this.filter = e, this.gain.connect(this.filter), this.filter.connect(this.context.destination), this;
  }
  getMasterVolume() {
    return this.gain.gain.value;
  }
  setMasterVolume(e) {
    return this.gain.gain.setTargetAtTime(e, this.context.currentTime, .01), this;
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e);
    const i = this.context.listener;
    if (this.timeDelta = this._clock.getDelta(), this.matrixWorld.decompose(scope._position$1, scope._quaternion$1, scope._scale$1), scope._forward$2.set(0, 0, -1).applyQuaternion(scope._quaternion$1), scope._up$1.set(0, 1, 0).applyQuaternion(scope._quaternion$1), i.positionX) {
      const s = this.context.currentTime + this.timeDelta;
      i.positionX.linearRampToValueAtTime(scope._position$1.x, s), i.positionY.linearRampToValueAtTime(scope._position$1.y, s), i.positionZ.linearRampToValueAtTime(scope._position$1.z, s), i.forwardX.linearRampToValueAtTime(scope._forward$2.x, s), i.forwardY.linearRampToValueAtTime(scope._forward$2.y, s), i.forwardZ.linearRampToValueAtTime(scope._forward$2.z, s), i.upX.linearRampToValueAtTime(scope._up$1.x, s), i.upY.linearRampToValueAtTime(scope._up$1.y, s), i.upZ.linearRampToValueAtTime(scope._up$1.z, s);
    } else i.setPosition(scope._position$1.x, scope._position$1.y, scope._position$1.z), i.setOrientation(scope._forward$2.x, scope._forward$2.y, scope._forward$2.z, scope._up$1.x, scope._up$1.y, scope._up$1.z);
  }
};
}
