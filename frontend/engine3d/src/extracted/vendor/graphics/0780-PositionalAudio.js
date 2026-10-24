/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 292513:294169.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0780(scope) {
scope.PositionalAudio = class PositionalAudio extends scope.Audio {
  constructor(e) {
    super(e), this.panner = this.context.createPanner(), this.panner.panningModel = "HRTF", this.panner.connect(this.gain);
  }
  connect() {
    return super.connect(), this.panner.connect(this.gain), this;
  }
  disconnect() {
    return super.disconnect(), this.panner.disconnect(this.gain), this;
  }
  getOutput() {
    return this.panner;
  }
  getRefDistance() {
    return this.panner.refDistance;
  }
  setRefDistance(e) {
    return this.panner.refDistance = e, this;
  }
  getRolloffFactor() {
    return this.panner.rolloffFactor;
  }
  setRolloffFactor(e) {
    return this.panner.rolloffFactor = e, this;
  }
  getDistanceModel() {
    return this.panner.distanceModel;
  }
  setDistanceModel(e) {
    return this.panner.distanceModel = e, this;
  }
  getMaxDistance() {
    return this.panner.maxDistance;
  }
  setMaxDistance(e) {
    return this.panner.maxDistance = e, this;
  }
  setDirectionalCone(e, i, s) {
    return this.panner.coneInnerAngle = e, this.panner.coneOuterAngle = i, this.panner.coneOuterGain = s, this;
  }
  updateMatrixWorld(e) {
    if (super.updateMatrixWorld(e), this.hasPlaybackControl === !0 && this.isPlaying === !1) return;
    this.matrixWorld.decompose(scope._position, scope._quaternion$5, scope._scale), scope._orientation.set(0, 0, 1).applyQuaternion(scope._quaternion$5);
    const i = this.panner;
    if (i.positionX) {
      const s = this.context.currentTime + this.listener.timeDelta;
      i.positionX.linearRampToValueAtTime(scope._position.x, s), i.positionY.linearRampToValueAtTime(scope._position.y, s), i.positionZ.linearRampToValueAtTime(scope._position.z, s), i.orientationX.linearRampToValueAtTime(scope._orientation.x, s), i.orientationY.linearRampToValueAtTime(scope._orientation.y, s), i.orientationZ.linearRampToValueAtTime(scope._orientation.z, s);
    } else i.setPosition(scope._position.x, scope._position.y, scope._position.z), i.setOrientation(scope._orientation.x, scope._orientation.y, scope._orientation.z);
  }
};
}
