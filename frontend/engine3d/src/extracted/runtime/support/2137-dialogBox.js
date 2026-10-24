/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1832514:1835434.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2137(scope) {
scope.dialogBox = class dialogBox {
  constructor(e) {
    this.scene = e, this.globalUI = e.globalUI, this.ready = scope.miscutils.deferred(), this.shown = !1, this.displayed = !1, this.npcIDShowing = null, this.npcIDLast = null, this.isKeyTouching = !1, this.init();
  }
  async init() {
    this.dialogCnt = new scope.Group(), this.dialogCnt.name = "dialog box", this.dialogCnt.matrixAutoUpdate = !1, this.scene.add(this.dialogCnt), this.textBox = new scope.textbox$1(this), this.titleBox = new scope.titlebox$1(this), this.arrowBox = new scope.arrowbox(this), await Promise.all([this.textBox.ready, this.titleBox.ready, this.arrowBox.ready]), this.generateTexts(), scope.events$1.on("npc_dialog_open", this.show, this), scope.events$1.on("npc_dialog_close", this.hide, this), scope.events$1.on("keydown", this.onKey, this), scope.events$1.on("keyup", this.onKey, this), scope.events$1.on("npc_dialog_finished", this.hideFinal, this), scope.events$1.on("npc_dialog_interrupted", this.hideFinal, this), this.ready.resolve();
  }
  show(e, i, s, a) {
    if (a.bubblesEnabled) return;
    this.shown = !0, this.npcIDShowing = e, this.npcIDLast = e;
    const o = `${(s == null ? void 0 : s.name) || "Unnamed NPC"}`,
      l = i || "No dialog text provided",
      c = (s == null ? void 0 : s.color) || "#ffffff",
      h = (s == null ? void 0 : s.voice) || "male1";
    this.generateTexts(o, l).then(() => {
      this.shown && (this.displayed = !0, this.titleBox.show(0, c, o), this.textBox.show(.1, c, l, h), this.arrowBox.show(.3, c, l), this.globalUI.playBoxAudio(.3));
    }), scope.events$1.emit("npc_dialog_shown", e);
  }
  hide(e) {
    !this.shown || this.npcIDShowing !== e || (this.arrowBox.hide(0), this.textBox.hide(0), this.titleBox.hide(0), this.globalUI.playBoxAudio(.1), this.shown = !1, this.displayed = !1, this.npcIDShowing = null, this.isKeyTouching = !1);
  }
  hideFinal(e) {
    this.npcIDLast === e && (this.npcIDLast = null, scope.events$1.emit("npc_dialog_hidden", e));
  }
  async generateTexts(e = "placeholder title", i = "hi, how are you doing? i was wondering if you would mind delivering this letter to my brother.") {
    await this.textBox.update(i), await Promise.all([this.titleBox.update(e), this.arrowBox.update()]);
  }
  onKey(e) {
    if (!this.displayed || !this.shown || this.npcIDShowing === null) return;
    const i = e.code === "Escape",
      s = e.code === "Space" || e.code === "KeyE";
    if (!(!i && !s)) if (e.type === "keydown") {
      if (i) scope.events$1.emit("npc_force_close_dialog", this.npcIDShowing);else if (s) {
        if (this.textBox.bg.material.uniforms.uShow.value < .8 || !this.textBox.text.visible || this.textBox.text.material.uniforms.uHide.value > 0) return;
        this.textBox.text.material.uniforms.uShow.value < 1 ? this.forceEndText() : this.isKeyTouching || (this.isKeyTouching = !0, this.arrowBox.touch({
          action: "touch_start"
        }));
      }
    } else s && this.isKeyTouching && (this.arrowBox.touch({
      action: "touch_end"
    }), this.arrowBox.click());
  }
  forceEndText() {
    scope.createTween(this.textBox.text.material.uniforms.uShow, {
      to: {
        value: 1
      },
      duration: 0,
      onStart: () => {
        this.textBox.text.visible = !0;
      },
      onComplete: () => {
        this.textBox.playDialogue(!1);
      }
    });
  }
  clickArrow() {
    this.textBox.text.material.uniforms.uShow.value < 1 ? this.forceEndText() : scope.events$1.emit("npc_force_next_dialog", this.npcIDShowing);
  }
  resize() {
    this.textBox.resize().then(() => {
      this.titleBox.resize(), this.arrowBox.resize();
    });
  }
};
}
