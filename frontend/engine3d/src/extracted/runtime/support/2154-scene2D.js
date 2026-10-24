/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1893486:1895770.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2154(scope) {
scope.scene2D = class scene2D extends scope.scene {
  constructor(e = {}) {
    super({
      cameraType: "orthographic"
    }), this.controller = e.mainController, this.globalUI = e.globalUI, this.squareGeo2 = scope.squareGeo2, this.squareGeo3 = scope.squareGeo3, this.gridSize = 50, this.gridSizeLow = 30, this.gridSizeMobile = 20, this.topMargin = 80, this.topMarginLow = 50, this.topMarginMobile = 30, this.breakpointW = 1600, this.breakpointH = 800, this.breakPointMobile = 640, this.small = !1, this.mobile = !1, this.marginLeft = 0, this.marginTop = 0, this.init();
  }
  async init() {
    this.cameraOptions(), await Promise.all([this.createSideButtons(), this.createZoneTitles(), this.createDialogBox(), this.createQuestBox(), this.createCheckList(), this.createEmojiList(), this.createEndScreen()]), this.resize(), scope.events$1.on("resize", this.resize, this), this.beforeRenderCbs.push(this.update.bind(this)), scope.client$1.devScene && this.debug(), this.isReady();
  }
  cameraOptions() {
    this.camera.lerpPosition = 0, this.camera.lerpTarget = 0, this.camera.lerpRotation = 0;
  }
  async createSideButtons() {
    this.sideButtons = new scope.sideButtons(this), await this.sideButtons.ready;
  }
  async createZoneTitles() {
    this.zoneTitles = new scope.zoneTitles(this), await this.zoneTitles.ready;
  }
  async createDialogBox() {
    this.dialogBox = new scope.dialogBox(this), await this.dialogBox.ready;
  }
  async createQuestBox() {
    this.questBox = new scope.questBox(this), await this.questBox.ready;
  }
  async createCheckList() {
    this.checkList = new scope.checkList(this), await this.checkList.ready;
  }
  async createEmojiList() {
    this.emojiList = new scope.emojiList(this), await this.emojiList.ready;
  }
  async createEndScreen() {
    this.endScreen = new scope.endScreen(this), await this.endScreen.ready;
  }
  update() {}
  resize() {
    this.camera.basePosition.set(scope.client$1.screen.w * .5, -scope.client$1.screen.h * .5, this.camera.basePosition.z), this.camera.baseTarget.set(this.camera.basePosition.x, this.camera.basePosition.y, 0), this.camera.updateProjectionMatrix(), this.small = scope.client$1.screen.width < this.breakpointW || scope.client$1.screen.height < this.breakpointH, this.mobile = scope.client$1.screen.width < this.breakPointMobile || scope.client$1.screen.height < this.breakPointMobile, this.marginLeft = this.mobile ? this.gridSizeMobile : this.small ? this.gridSizeLow : this.gridSize, this.marginTop = this.mobile ? this.topMarginMobile : this.small ? this.topMarginLow : this.topMargin, [this.sideButtons, this.zoneTitles, this.dialogBox, this.questBox, this.checkList, this.emojiList, this.endScreen].forEach(e => {
      e.resize();
    });
  }
};
}
