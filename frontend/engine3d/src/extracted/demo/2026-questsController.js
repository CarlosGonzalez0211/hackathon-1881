/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1586938:1588558.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2026(scope) {
scope.questsController = class questsController {
  constructor(e) {
    this.scene = e, this.npcs = e.npcs, this.secrets = e.secrets, scope.events$1.on("quest_enable_id", this.onQuestEnable, this), scope.events$1.on("quest_disable_id", this.onQuestDisable, this), scope.events$1.on("quest_step_completed", this.onQuestStepCompleted, this), scope.events$1.on("quest_completed", this.onQuestCompleted, this), this.init();
  }
  init() {
    this.quests = [], scope.questData.quests.forEach((e, i) => {
      const s = new scope.quest({
        id: e.id,
        steps: e.steps
      });
      this.quests.push(s), !s._isQuestCompleted() && s._steps.forEach(a => {
        var o, l;
        if (a.completed) {
          if (a.texts !== !1 && (o = this.npcs) != null && o.length) {
            const c = this.npcs.find(h => h.mesh._id === a.id);
            c && c.mesh.setTexts(a.texts, a.texts.length - 1);
          } else if (a.text !== !1 && (l = this.secrets) != null && l.length) {
            const c = this.secrets.find(h => h._id === a.id && !h._discovered);
            c && c._triggerDiscovery(!1);
          }
        }
      });
    });
  }
  onQuestEnable(e) {
    const i = this.npcs.find(s => s.mesh._id === e);
    i && i.disableBubbles();
  }
  onQuestDisable(e) {
    const i = this.npcs.find(s => s.mesh._id === e);
    i && i.enableBubbles();
  }
  onQuestStepCompleted(e, i, s, a) {
    if (!scope.QUESTINFO[e]) return console.warn(`Quest ${e} not found!`);
    scope.QUESTINFO[e].steps[s] = !0, scope.progress[e][s] = !0;
    const o = s === scope.QUESTINFO[e].steps.length - 1,
      l = s === 0 || o,
      c = scope.areAllQuestsCompleted();
    scope.events$1.emit("quest_info_checklist_update", l, c), scope.save(), c ? scope.miscutils.wait(1).then(() => {
      scope.events$1.emit("end_screen_show");
    }) : a && a.uiTitle && a.uiIcon && a.uiText && a.uiColor && scope.events$1.emit("quest_box_display_after_step", a.uiTitle, a.uiIcon, a.uiText, a.uiColor, o), a && a.receiveModel && scope.events$1.emit("quest_receive_model", a.receiveModel), o && scope.miscutils.wait(.9).then(() => {
      scope.events$1.emit("webgl_play_audio", "quest-complete");
    });
  }
  onQuestCompleted(e) {}
};
}
