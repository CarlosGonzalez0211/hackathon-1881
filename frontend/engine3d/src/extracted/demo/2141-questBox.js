/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1855804:1857457.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2141(scope) {
scope.questBox = class questBox {
  constructor(e) {
    this.scene = e, this.globalUI = e.globalUI, this.ready = scope.miscutils.deferred(), this.shown = !1, this.displayed = !1, this.timeout = null, this.init();
  }
  async init() {
    this.questCnt = new scope.Group(), this.questCnt.name = "quest box", this.questCnt.matrixAutoUpdate = !1, this.scene.add(this.questCnt), this.textBox = new scope.textbox(this), this.titleBox = new scope.titlebox(this), await Promise.all([this.textBox.ready, this.titleBox.ready]), this.generateTexts(), scope.events$1.on("character_change_traits_shown", this.hide, this), scope.events$1.on("npc_dialog_shown", this.hide, this), scope.events$1.on("ui_emojis_toggle", this.hide, this), scope.events$1.on("end_screen_show", this.hide, this), scope.events$1.on("quest_box_display_after_step", this.display, this), this.ready.resolve();
  }
  display(e, i, s, a, o = !1) {
    this.shown && this.hide(), scope.__lifecycle.clearTimeout(this.timeout), this.timeout = scope.__lifecycle.setTimeout(() => {
      this.show(e, i, s, a, o);
    }, 500);
  }
  show(e, i, s, a, o) {
    this.shown = !0;
    const l = `${e || "next up"}`,
      c = s || "No quest text provided",
      h = i || "ui/sidebuttons/poo.icon",
      d = a || "#f5fdff";
    this.generateTexts(l, h, c).then(() => {
      if (!this.shown) return;
      this.displayed = !0;
      const p = o ? d : !1;
      this.titleBox.show(0, d, l), this.textBox.show(.1, p, c), this.globalUI.playBoxAudio(.5), scope.__lifecycle.clearTimeout(this.timeout), this.timeout = scope.__lifecycle.setTimeout(() => {
        this.hide();
      }, 6 * 1e3);
    });
  }
  hide(e) {
    this.shown && (scope.__lifecycle.clearTimeout(this.timeout), this.shown = !1, this.displayed = !1, this.textBox.hide(0), this.titleBox.hide(0), this.globalUI.playBoxAudio(.1));
  }
  async generateTexts(e = "next up", i = "ui/sidebuttons/poo.icon", s = "GO BACK TO THE MAN IN THE CAVE AND DELIVER THE CLOTHES") {
    await this.textBox.update(s, i), await Promise.all([this.titleBox.update(e)]);
  }
  resize() {
    this.textBox.resize().then(() => {
      this.titleBox.resize();
    });
  }
};
}
