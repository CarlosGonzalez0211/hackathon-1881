/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1550238:1552545.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1997(scope) {
scope.NPCSkinnedMesh = class NPCSkinnedMesh extends scope.SkinnedMesh {
  static createAction({
    mixer: e,
    animation: i,
    options: s = {},
    enabled: a = !1
  } = {}) {
    const o = e.clipAction(i.clone());
    return o.setEffectiveTimeScale(s.speed || 1), o.setEffectiveWeight(a ? 1 : 0), o.weight = 1, a ? o.play() : o.enabled = !1, o;
  }
  constructor({
    skin: e,
    material: i,
    depthMaterial: s,
    animations: a = [],
    animationsOptions: o = []
  } = {}) {
    const l = scope.clone(e);
    super(l.geometry, i), this.customDepthMaterial = s, l.skeleton._originalUpdate = l.skeleton.update, l.skeleton.update = () => {}, l.children.forEach(c => this.add(c)), this.bind(l.skeleton), this.skeleton.computeBoneTexture(), this._mixer = new scope.AnimationMixer(this), this._mixerOffset = Math.random() * 100, this._actions = {}, this._activeAction = null, this._lastUpdate = -Math.random(), ["idle", "talk", "idleTalk", "walk"].forEach((c, h) => {
      if (!a[h]) return;
      const d = !this._activeAction;
      this._actions[c] = scope.NPCSkinnedMesh.createAction({
        mixer: this._mixer,
        animation: a[h],
        options: o[h] || {},
        enabled: d
      }), d && (this._activeAction = this._actions[c]);
    }), this._mixer.setTime(scope.renderInfo.time + this._mixerOffset), this.updateMatrixWorld();
  }
  updateMatrixWorld() {
    if (!this._actions.idle || !this._actions.talk) return;
    let e = this._activeAction;
    if (this._talking ? this._talkAnimationPlaying ? e = this._actions.talk : e = this._actions.idleTalk : this._isClose && (this._alwaysFaceCharacter || this._characters.interactingElement === this) ? e = this._actions.idle : this._curve ? e = this._actions.walk : e = this._actions.idle, this._activeAction !== e) {
      let i = .5;
      (this._activeAction === this._actions.talk || e === this._actions.talk) && (i = 1), this._activeAction._scheduleFading(i * 2, this._activeAction.getEffectiveWeight(), 0), e.enabled = !0, e._scheduleFading(i, e.getEffectiveWeight(), 1).play(), this._activeAction = e;
    }
    this.updateMatrix(), this.matrixWorld.copy(this.matrix), this.children.forEach(i => {
      i.isBone || i.updateMatrixWorld();
    });
  }
  onBeforeRender() {
    if (scope.miscutils.hasRunThisFrame(this.skeleton)) return;
    const e = scope.math.fit(this._distanceToCharacter, scope.characterBatchedSkinnedMesh.UPDATE_DISTANCE * .1, scope.characterBatchedSkinnedMesh.UPDATE_DISTANCE, 0, scope.characterBatchedSkinnedMesh.UPDATE_DISTANCE_MULT);
    scope.renderInfo.time - this._lastUpdate < e || (this._lastUpdate = scope.renderInfo.time, this._mixer.setTime(scope.renderInfo.time + this._mixerOffset), this.children.forEach(i => {
      i.isBone && i.updateMatrixWorld();
    }), this.bindMatrixInverse.copy(this.matrixWorld).invert(), this.skeleton._originalUpdate());
  }
};
}
