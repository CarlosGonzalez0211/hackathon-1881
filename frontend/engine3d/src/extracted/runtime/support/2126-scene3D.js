/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1784888:1785736.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2126(scope) {
scope.scene3D = class scene3D extends scope.scene {
  constructor(e = {}) {
    super(), this.controller = e.mainController, this.globalUI = e.globalUI, this.aspect = 1, this.controller ? this.init() : this.isReady();
  }
  async init() {
    this.cameraOptions(), await Promise.all([this.createTraitArrows()]), this.resize(), scope.events$1.on("resize", this.resize, this), scope.client$1.devScene && this.debug(), this.isReady();
  }
  cameraOptions() {
    this.camera.lerpPosition = 0, this.camera.lerpTarget = 0, this.camera.lerpRotation = 0, this.beforeRenderCbs.push(() => {
      var e;
      (e = this.controller) != null && e.planetScene && (this.camera.copy(this.controller.planetScene.camera, !1), this.camera.updateMatrixWorld(), this.camera.updateProjectionMatrix());
    });
  }
  async createTraitArrows() {
    this.traitArrows = new scope.traitarrows(this), await this.traitArrows.ready;
  }
  resize() {
    this.aspect = scope.client$1.screen.w / scope.client$1.screen.h, [this.traitArrows].forEach(e => {
      e.resize();
    });
  }
};
}
