/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1565485:1576997.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2010(scope) {
scope.Lt = class Lt extends scope.NPCSkinnedMesh {
  static calculateDirection(e, i, s) {
    Lt.vDir0.copy(i), Lt.vDir0.lengthSq() === 0 && (Lt.vDir0.z = 1), Lt.vDir0.normalize(), Lt.vDir1.crossVectors(e.up, Lt.vDir0), Lt.vDir1.lengthSq() === 0 && (Math.abs(e.up.z) === 1 ? Lt.vDir0.x += 1e-4 : Lt.vDir0.z += 1e-4, Lt.vDir0.normalize(), Lt.vDir1.crossVectors(e.up, Lt.vDir0)), Lt.vDir0.crossVectors(Lt.vDir1, e.up), scope._m0$2.set(Lt.vDir1.x, e.up.x, Lt.vDir0.x, 0, Lt.vDir1.y, e.up.y, Lt.vDir0.y, 0, Lt.vDir1.z, e.up.z, Lt.vDir0.z, 0, 0, 0, 0, 1), s.setFromRotationMatrix(scope._m0$2);
  }
  constructor({
    id: e = "npc_0",
    scene: i,
    skin: s,
    material: a,
    depthMaterial: o = new scope.MeshDepthMaterial({
      depthPacking: scope.RGBADepthPacking
    }),
    animations: l = [],
    animationsOptions: c = [],
    visibilityThreshold: h = 50,
    talkEnabled: d = !0,
    talkDistance: p = 3,
    talkFacingPlayer: f = !0,
    alwaysFaceCharacter: _ = !1,
    texts: x = ["Hello, I am a NPC.", "I am talking to you right now."],
    textsBubbles: b = !1,
    textsBubblesOptions: T = {},
    textsBubblesOffset: M = [0, 0, 0],
    textsReset: w = !1,
    textsRepeatLast: D = !0,
    textsSpeed: R = 10,
    textsOpenTime: P = .75,
    textsCloseTime: U = .75,
    textsAutoClose: O = !0,
    clickInteraction: N = !1,
    hitboxOffset: H = .75,
    hoverCursor: F = !1,
    icon: k = !1,
    iconFiles: W = [],
    iconOptions: $ = {},
    curve: Z = null,
    curveSpeed: J = 1,
    curveProgress: se = 0,
    curveSpeedAnimationWeight: re = 1,
    extraData: he = {}
  } = {}) {
    var ee, Ie, Te;
    if (!i || !s || !a) throw new Error("NPCs require a scene, skin and material");
    if (super({
      skin: s,
      material: a,
      depthMaterial: o,
      animations: l,
      animationsOptions: c
    }), this.isWorldNPC = !0, this.name = `NPC-${e}`, this._id = e, this._scene = i, this._characters = null, this._scene.uploaded.then(() => {
      this._scene.traverse(Ue => {
        Ue.isWorldCharacters && (this._characters = Ue, this._originalQuaternion.copy(this.quaternion), this._targetQuaternion.copy(this.quaternion), this._targetPosition.copy(this.position));
      });
    }), this._visibilityThreshold = h, this._talkEnabled = d, this._talkDistance = p, this._talkFacingPlayer = f, this._alwaysFaceCharacter = _, this._talking = !1, this._talkNeedsToStart = !0, this._talkingDone = !1, this._hasUpdatedOnce = !1, this._talkAnimationPlaying = !1, this._curve = Z && Z.length ? Z[0] : null, this._curveProgress = se % 1, this._curveProgressMultiplier = 1 / (((Te = (Ie = (ee = this._curve) == null ? void 0 : ee.curve) == null ? void 0 : Ie.getLength) == null ? void 0 : Te.call(Ie)) || 1) * .001575, this._curveSpeed = J, this._curveSpeedAnimationWeight = 1 / re * .11, this._targetPosition = new scope.Vector3(), this._distanceToCharacter = 1 / 0, this._isClose = !1, this._originalQuaternion = new scope.Quaternion(), this._targetQuaternion = new scope.Quaternion(), this.geometry.computeBoundingBox(), this.geometry.computeBoundingSphere(), this.computeBoundingBox(), this.computeBoundingSphere(), this.boundingSphere.radius += H, this._texts = [...x], this._textsCurrent = 0, this._textsObjectRef = this._texts, this._extraData = he, this._textsBubbles = b, this._textsBubblesEnabled = this._textsBubbles, this._textsBubblesShown = !1, this._textsBubblesOptions = T, this._textsBubbleGroup = new scope.Group(), this._textsBubbleGroup.name = "Text Bubbles Cnt", this._textsBubbleGroupOffset = new scope.Vector3().fromArray(M), this.add(this._textsBubbleGroup), this._textsStart = -1, this._textsEnd = -1, this._textsSpeed = 1 / R, this._textsOpenTime = P, this._textsCloseTime = U, this._textsCloseRequested = !1, this._textsReset = w, this._textsRepeatLast = D, this._textsAutoClose = O, this._questEnabled = !1, this._questTextPreviousCurrent = 0, this._questStepExtraData = {}, this._icon = k ? new scope.topIcon({
      object: this,
      iconFiles: W,
      ...$
    }) : null, this._clickInteractionEnabled = !1, this._clickInteraction = null, this._clickInteracted = !1, N) {
      const Ue = nt => {
        if (nt.event.input === "mouse") {
          if (nt.action !== "touch_start") return;
        } else if (nt.action !== "click") return;
        this._characters && this._characters._canInteract && (this._characters._camera.isFollowCamera && this._characters._camera.overwriteAmount > 0 || (this._clickInteracted = !0, this._characters._controls.cancelJump()));
      };
      this._clickInteraction = new scope.meshInteraction({
        meshes: [this],
        camera: this._scene.camera,
        performant: !0,
        performantMode: "bounding_sphere",
        hoverCursor: F,
        onHover: nt => {
          !this._icon || nt.action !== "hover_in" || this._icon.pulse();
        },
        onTouch: Ue,
        onClick: Ue
      }), this._clickInteractionEnabled = !0;
    }
    this.ready = scope.miscutils.deferred(), this.setTexts(this._texts, this._textsCurrent, !1, !0), scope.events$1.on("quest_enable_id", this._onQuestEnable, this), scope.events$1.on("quest_disable_id", this._onQuestDisable, this), scope.events$1.on("npc_force_next_dialog", this._forceNextDialog, this), scope.events$1.on("npc_force_close_dialog", this._forceCloseDialog, this);
  }
  updateMatrixWorld() {
    const e = this._characters,
      i = e == null ? void 0 : e._localObject;
    if (!(e != null && e._charactersUpdate) || scope.miscutils.hasRunThisFrame(this)) return;
    this._distanceToCharacter = i.position.distanceTo(this.position), this._isClose = this._distanceToCharacter < this._talkDistance && this._textsObjectRef.length > 0, this._clickInteractionEnabled && (this._isClose ? e._controls._enabled ? this._clickInteraction.enable() : this._clickInteraction.disable() : (this._clickInteraction.disable(), this._clickInteracted = !1)), this._isClose && (this._alwaysFaceCharacter || e.interactingElement === this) ? this._talkFacingPlayer && Lt.calculateDirection(this, scope._v0$d.subVectors(i.position, this.position), this._targetQuaternion) : this._curve ? (scope._v0$d.copy(this._targetPosition), this._curveProgress = (this._curveProgress + scope.renderInfo.delta * this._curveProgressMultiplier * this._curveSpeed) % 1, this._curve.curve.getPointAt(this._curveProgress, this._targetPosition), Lt.calculateDirection(this, scope._v1$8.subVectors(this._targetPosition, scope._v0$d), this._targetQuaternion)) : this._targetQuaternion.copy(this._originalQuaternion), this._hasUpdatedOnce ? (this.position.lerp(this._targetPosition, scope.math.lerpCoefFPS(.1)), this.quaternion.slerp(this._targetQuaternion, scope.math.lerpCoefFPS(.04))) : (this._hasUpdatedOnce = !0, this.position.copy(this._targetPosition), this.quaternion.copy(this._targetQuaternion)), this.visible = this._distanceToCharacter < this._visibilityThreshold, this._clickInteractionEnabled && (this._talkingDone || e.interactingElement !== null && e.interactingElement !== this) && (this._clickInteracted = !1), this._resetTalkingDone();
    let s = this._talkEnabled && this.visible && this._isClose && !this._talkingDone;
    if (s && this._clickInteractionEnabled && !this._clickInteracted && (s = !1), s ? e.interactingElement || (e.interactingElement = this) : e.interactingElement === this && !this._textsBubblesShown && (e.interactingElement = null), this._talking = s && e.interactingElement === this, this._talking) {
      if (this._textsStart === -1) this._textsEnd === -1 && (this._talkNeedsToStart && (this._talkNeedsToStart = !1, scope.events$1.emit("quest_step_texts_check", this), (this._textsCurrent < this._textsObjectRef.length - 1 || this._textsReset) && (this._textsCurrent = 0)), this._textsCloseRequested = !1, this._openText(), this._updateTalkAnimation(!0));else {
        const a = this._textsObjectRef[this._textsCurrent];
        let o = -1 / 0;
        typeof a == "string" && (o = scope.meshText.getTextWithoutTags(a).length * this._textsSpeed, o = Math.max(1, o));
        const l = scope.renderInfo.time - this._textsStart - this._textsOpenTime;
        l > o && this._updateTalkAnimation(!1);
        let c = 1 / 0;
        this._textsCloseRequested ? c = -1 / 0 : this._textsAutoClose && (c = o), l > c && (this._textsEnd === -1 ? (this._closeText(), this._textsCurrent === this._textsObjectRef.length - 1 ? (this._talkingDone = !0, scope.events$1.emit("npc_dialog_finished", this._id), scope.events$1.emit("quest_step_check", this)) : this._textsCurrent++) : this._textsEnd + this._textsCloseTime < scope.renderInfo.time && (this._textsStart = -1, this._textsEnd = -1));
      }
    } else this._closeTextIfNeeded(), this._talkNeedsToStart = !0;
    this._updateBubblesState(), this.visible && super.updateMatrixWorld();
  }
  _resetTalkingDone() {
    this._talkingDone && (!this._textsRepeatLast && !this._textsReset || (!this._isClose || this._clickInteractionEnabled) && (this._talkingDone = !1));
  }
  _onQuestEnable(e) {
    e === this._id && (this._questEnabled = !0, this._texts === this._textsObjectRef && (this._questTextPreviousCurrent = this._textsCurrent), this._textsObjectRef.length === 0 && this.setTexts(["-"]), this._icon && this._icon._colorTarget.copy(this._icon._colorHighlight));
  }
  _onQuestDisable(e) {
    e === this._id && (this._questEnabled = !1, this._textsObjectRef !== this._texts && this.setTexts(this._texts, this._questTextPreviousCurrent), this._questTextPreviousCurrent = 0, this._questStepExtraData = {}, this._icon && this._icon._colorTarget.copy(this._icon._color2));
  }
  _forceNextDialog(e) {
    e !== this._id || !this._characters || (this._textsCloseRequested = !0);
  }
  _forceCloseDialog(e) {
    e !== this._id || !this._characters || (this._textsCurrent === this._textsObjectRef.length - 1 ? this._forceNextDialog(e) : this._talkingDone = !0);
  }
  _closeText() {
    this._textsCloseRequested = !0, this._textsEnd = scope.renderInfo.time, scope.events$1.emit("npc_dialog_close", this._id), this._updateTalkAnimation(!1);
  }
  _closeTextIfNeeded() {
    this._textsStart !== -1 && this._textsEnd === -1 && (this._closeText(), scope.events$1.emit("npc_dialog_interrupted", this._id));
  }
  _openText() {
    this._textsStart = scope.renderInfo.time, scope.events$1.emit("npc_dialog_open", this._id, this._textsObjectRef[this._textsCurrent], this._extraData, {
      currentText: this._textsCurrent,
      totalTexts: this._textsObjectRef.length,
      bubblesEnabled: this._textsBubblesEnabled,
      stepExtraData: this._questStepExtraData
    });
  }
  _updateTalkAnimation(e = !1) {
    this._talkAnimationPlaying !== e && (this._talkAnimationPlaying = e, scope.events$1.emit("npc_talk_update", {
      id: this._id,
      object: this,
      talking: e
    }));
  }
  _disposeTextsBubbles() {
    this._textsBubbleGroup.children.forEach(e => {
      var i;
      return (i = e.dispose) == null ? void 0 : i.call(e);
    }), this._textsBubbleGroup.clear(), this._textsBubblesShown = !1;
  }
  _createBubbles() {
    if (!this._textsBubbles) return;
    const e = [];
    return this._textsObjectRef.forEach((i, s) => {
      const a = typeof i == "string" ? new scope.bubble({
        npc: this,
        text: i,
        options: this._textsBubblesOptions,
        index: s
      }) : new scope.Group();
      a.visible = !1, this._textsBubbleGroup.add(a), e.push(a._textMesh.ready);
    }), Promise.all(e);
  }
  _updateBubblesState() {
    !this._textsBubbles || !this._textsBubblesEnabled || (this._textsBubbleGroup.position.set(0, this.boundingSphere.radius + .2, 0).add(this._textsBubbleGroupOffset), this._textsBubblesShown = !1, this._textsBubbleGroup.children.forEach((e, i) => {
      var s, a;
      i === this._textsCurrent && this._textsStart !== -1 && this._textsEnd === -1 ? (s = e.show) == null || s.call(e, this._textsSpeed) : (a = e.hide) == null || a.call(e), e.visible && (this._textsBubblesShown = !0);
    }));
  }
  async setTexts(e, i = 0, s = !1, a = !1) {
    this._textsObjectRef = e, this._textsCurrent = i, s && (this._texts = e);
    const o = [];
    this._textsBubbles && a && (this._disposeTextsBubbles(), o.push(this._createBubbles())), this._icon && o.push(this._icon.ready), await Promise.all(o), this.ready.resolve();
  }
  disableBubbles() {
    if (!this._textsBubbles) throw new Error("Create the NPC with bubbles to be able to disable them");
    this._textsBubblesEnabled = !1, this._textsBubblesShown = !1, this._textsBubbleGroup.children.forEach((e, i) => {
      var s;
      return (s = e.hide) == null ? void 0 : s.call(e, !0);
    });
  }
  enableBubbles() {
    if (!this._textsBubbles) throw new Error("Create the NPC with bubbles to be able to enable them");
    this._textsBubblesEnabled = !0;
  }
  disableClickInteraction() {
    if (!this._clickInteraction) throw new Error("Create the NPC with click interaction to be able to disable it");
    this._resetTalkingDone(), this._clickInteraction.disable(), this._clickInteracted = !1, this._clickInteractionEnabled = !1;
  }
  enableClickInteraction() {
    if (!this._clickInteraction) throw new Error("Create the NPC with click interaction to be able to enable it");
    this._resetTalkingDone(), this._clickInteraction.enable(), this._clickInteracted = !1, this._clickInteractionEnabled = !0;
  }
  dispose() {
    var e, i, s, a, o;
    scope.events$1.off("quest_enable_id", this._onQuestEnable, this), scope.events$1.off("quest_disable_id", this._onQuestDisable, this), scope.events$1.off("npc_force_next_dialog", this._forceNextDialog, this), scope.events$1.off("npc_force_close_dialog", this._forceCloseDialog, this), this._closeTextIfNeeded(), this._disposeTextsBubbles(), (i = (e = this._clickInteraction) == null ? void 0 : e.dispose) == null || i.call(e), (o = (a = (s = this._curve) == null ? void 0 : s.geometry) == null ? void 0 : a.dispose) == null || o.call(a), this.skeleton.dispose();
  }
};
}
