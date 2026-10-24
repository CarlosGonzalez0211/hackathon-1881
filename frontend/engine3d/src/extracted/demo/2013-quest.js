/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1577063:1579618.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2013(scope) {
scope.quest = class quest {
  constructor({
    id: e = "quest_0",
    steps: i = [],
    finalEvents: s = [],
    recreateNPCBubbles: a = !1
  } = {}) {
    if (!i || !i.length) throw new Error("Quests must have at least one step");
    this._id = e, this._steps = i.map((o, l) => ({
      id: o.id || `${this._id}_${l}`,
      optional: o.optional || !1,
      ordered: o.ordered || !1,
      minimumTimeSinceLastStep: o.minimumTimeSinceLastStep || -1,
      completed: o.completed || !1,
      text: o.text || !1,
      texts: o.texts || !1,
      extraData: o.extraData || {},
      _enabled: !1
    })), this._finalEvents = s, this._recreateNPCBubbles = a, this._lastTimeUpdateStep = 0, this._isQuestCompleted() ? this._finishQuest(!1) : (this._ensureElementsEnabled(), scope.events$1.on("quest_step_texts_check", this._onQuestTexts, this), scope.events$1.on("quest_step_check", this._onQuestStep, this)), this._initialized = !0;
  }
  _isQuestCompleted(e = this._steps.length) {
    const i = e === this._steps.length ? !0 : this._steps[e].ordered;
    let s = !0;
    for (let a = 0; a < e; a++) if (!(this._steps[a].completed || this._steps[a].optional) && (this._steps[a].ordered || i)) {
      s = !1;
      break;
    }
    return s;
  }
  _enableStep(e) {
    e._enabled || (e._enabled = !0, scope.events$1.emit("quest_enable_id", e.id, e.extraData));
  }
  _ensureElementsEnabled() {
    let e = !1;
    for (let i = 0; i < this._steps.length; i++) {
      const s = this._steps[i];
      if (s.completed || s.optional && !s.ordered) {
        this._enableStep(s);
        continue;
      }
      if (!e && (this._enableStep(s), !s.optional)) {
        if (s.ordered) e = !0;else for (let a = i + 1; a < this._steps.length; a++) if (!this._steps[a].completed) {
          this._steps[a].ordered && (e = !0);
          break;
        }
      }
    }
  }
  _onQuestStep(e) {
    const i = typeof e == "string" ? e : e._id;
    for (let s = 0; s < this._steps.length; s++) {
      const a = this._steps[s];
      if (i === a.id && !a.completed) {
        scope.renderInfo.time - this._lastTimeUpdateStep > a.minimumTimeSinceLastStep && (a.optional && !a.ordered || this._isQuestCompleted(s)) && (this._lastTimeUpdateStep = scope.renderInfo.time, a.completed = !0, scope.events$1.emit("quest_step_completed", this._id, i, s, a.extraData));
        break;
      }
    }
    this._isQuestCompleted() ? this._finishQuest() : this._ensureElementsEnabled();
  }
  _finishQuest(e = !0) {
    this._steps.forEach(i => {
      scope.events$1.emit("quest_disable_id", i.id, i.extraData);
    }), this.dispose(), e && scope.events$1.emit("quest_completed", this._id), this._finalEvents.forEach(i => {
      i && scope.events$1.emit(i);
    });
  }
  _onQuestTexts(e) {
    for (let i = 0; i < this._steps.length; i++) {
      const s = this._steps[i];
      if (e._id === s.id && !s.completed) {
        this._isQuestCompleted(i) && (e.isWorldSecret && s.text && s.text.length > 0 ? e._textRef = s.text : e.isWorldNPC && (s.texts && s.texts.length > 0 && e.setTexts(s.texts, 0, !1, this._recreateNPCBubbles), s.extraData && (e._questStepExtraData = s.extraData)));
        break;
      }
    }
  }
  dispose() {
    this._steps = [], scope.events$1.off("quest_step_texts_check", this._onQuestTexts, this), scope.events$1.off("quest_step_check", this._onQuestStep, this);
  }
};
}
