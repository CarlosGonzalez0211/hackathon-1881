/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1901552:1904715.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2157(scope) {
scope.mainController = class mainController {
  constructor(e) {
    this.options = e, this.ready = scope.miscutils.deferred(), this.state = null, this.sceneComposers = {}, this.currentScene = null, this.planetScene = null, this.init();
  }
  async init() {
    this.initGlobalPlane(), this.audioController = new scope.audioController(this), this.initUI(), await this.initIntro(), scope.events$1.once("switch_to_present_scene", this.switchToPresent, this), scope.__lifecycle.listen(document, "keydown", e => {
      if (e.code === "Enter" && this.state === "intro" && !this._localStarting) {
        this._localStarting = true;
        scope.events$1.emit("switch_to_present_scene");
      }
    }), await this.uiScene.uploaded, scope.global$1.renderPass.scene.beforeRenderCbs.push(() => {
      this.render();
    }), scope.events$1.on("overlay", this.overlayAnimation, this), this.sceneComposers[this.state].render(), this.ready.resolve();
  }
  initGlobalPlane() {
    const e = scope.utils.triangle;
    this.material = new scope.baseShader(), this.mainMesh = new scope.Mesh(e, this.material), this.mainMesh.frustumCulled = !1, this.mainMesh.name = "Main triangle mesh", scope.global$1.renderPass.scene.add(this.mainMesh), this.mainMesh.material = this.material, scope.global$1.renderPass.scene._upload(), this.mainMesh.material = this.material;
  }
  initUI() {
    this.uiScene = new scope.uiScene({
      mainController: this
    }), this.uiPass = new scope.RenderPass$1(this.uiScene, this.uiScene.camera, void 0, !1, !1), this.uiPass.clear = !1, scope.global$1.composer.addPass(this.uiPass);
  }
  async switchToPresent() {
    if (!this.sceneComposers.intro) {
      console.warn("No intro scene to switch from");
      return;
    }
    scope.createDelayedCall(1.5, () => {
      scope.events$1.emit("toggle_loader", !0);
    }), scope.createTween(this.material.uniforms.uFlash, {
      to: {
        value: 1
      },
      duration: 1,
      delay: 1,
      ease: "power2.inOut"
    }), await Promise.all([this.currentScene.playOutAnimation(), scope.createTween(this.material.uniforms.uWipe2, {
      to: {
        value: 1
      },
      duration: 1.15,
      delay: .85,
      ease: "power2.inOut"
    })]), this.sceneComposers.intro.dispose(), delete this.sceneComposers.intro, scope.client$1.lowMemoryDevice && (await scope.createDelayedCall(.35)), this.material.uniforms.uWipe1.value = 1, this.material.uniforms.uWipe2.value = 0, scope.global$1.adaptiveDPR.stop(), await this.initPresent(), scope.global$1.adaptiveDPR.start(), scope.createTween(this.material.uniforms.uFlash, {
      to: {
        value: 0
      },
      duration: 1,
      ease: "power2.inOut"
    }), scope.events$1.emit("toggle_loader", !1), await Promise.all([this.currentScene.playInAnimation(), scope.createTween(this.material.uniforms.uWipe1, {
      to: {
        value: 0
      },
      duration: 2,
      ease: "inOut1"
    })]);
  }
  async initIntro() {
    const e = new scope.scenes.intro(this);
    this.sceneComposers.intro = new scope.effectComposerExtended({
      scene: e
    }), await e.uploaded, this.currentScene = e, this.state = "intro";
  }
  async initPresent() {
    const e = new scope.scenes.present(this);
    this.sceneComposers.present = new scope.effectComposerExtended({
      scene: e
    }), await e.uploaded, this.planetScene = e, this.audioController.camera = this.planetScene.camera, this.currentScene = e, this.state = "present";
  }
  render() {
    !this.state || !this.sceneComposers[this.state] || (this.sceneComposers[this.state].render(), this.material.uniforms.tScene.value = this.sceneComposers[this.state].readBuffer.texture);
  }
  overlayAnimation(e = !1) {
    scope.createTween(this.material.uniforms.uOverlay, {
      to: {
        value: e ? 1 : 0
      },
      duration: e ? .6 : .3,
      delay: e ? 0 : .2
    });
  }
  resize() {}
  start() {
    scope.events$1.emit("render_active", !0), scope.createTween(this.material.uniforms.uWipe1, {
      to: {
        value: 0
      },
      delay: 0,
      duration: 2,
      ease: "inOut1"
    }), this.currentScene.playInAnimation().then(() => {});
  }
};
}
