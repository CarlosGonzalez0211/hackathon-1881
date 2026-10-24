/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1604540:1609752.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2039(scope) {
scope.introScene = class introScene extends scope.scene {
  constructor(e, i = {}) {
    super({
      orbit: !0
    }), this.mainController = e, this.mobileLayout = !1, this._init();
  }
  async _init() {
    await Promise.all([this.setupCamera(), this.setupPostProcessing()]), this.planetGroup = new scope.Group(), this.planetGroup.name = "Planet Group", this.add(this.planetGroup), await Promise.all([{
      objClass: scope.planet$1,
      name: "planet"
    }, {
      objClass: scope.sky$1,
      name: "sky"
    }, {
      objClass: scope.birds,
      name: "birds",
      options: {
        count: 15,
        groups: 5,
        curve: "birds/curve-1.drc",
        bird: "birds/1.drc"
      }
    }, {
      objClass: scope.cables$1,
      name: "cables"
    }, {
      objClass: scope.waterfall,
      name: "waterfall"
    }, {
      objClass: scope.atmosphere,
      name: "atmosphere"
    }, {
      objClass: scope.title$1,
      name: "title"
    }, {
      objClass: scope.particles,
      name: "particles"
    }, {
      objClass: scope.galaxies,
      name: "galaxies"
    }, {
      objClass: scope.button,
      name: "button"
    }].map(({
      objClass: e,
      name: i,
      options: s = {}
    }) => (this[i] = new e(this, s), this[i].ready))), this.setupLights(), this._resize(), scope.events$1.on("resize", this._resize, this), this.beforeRenderCbs.push(this.update.bind(this)), scope.client$1.devScene && (this.playInAnimation(), this.debug(), window._scene = this, window._camera = this.camera), this.isReady();
  }
  setupCamera() {
    this.camera.basePosition.set(0, 0, -120), this.camera.baseTarget.set(0, -2.5, 0), this.camera.lerpRotate = 1, this.camera.lerpZoom = 1, this.camera.lerpPan = 1, this._outRotation = {
      value: 0
    }, this.camera.displacement.position.set(0, 0), this.camera.displacement.target.set(-.01, -.0075), this.camera.displacement.rotation = .01, this.camera.lerpPosition = 1, this.camera.lerpTarget = .02, this.camera.lerpRotation = .05, this.camera.autoRotate = !0, scope.client$1.devScene || (this.camera.enablePan = !1, this.camera.enableZoom = !1, this.camera.enableRotate = !1), this.camera.near = 2, this.camera.far = 1e3, this.camera.updateProjectionMatrix();
  }
  setupPostProcessing() {
    return new Promise(e => {
      scope.__lifecycle.setTimeout(() => {
        scope.addPostProcessing$1(this, this.composer), e();
      }, 0);
    });
  }
  setupLights() {
    this.light = new scope.DirectionalLight(16777215, 1), this.light.position.set(100, 100, 0), this.light._originalPosition = this.light.position.clone(), this.light.castShadow = !0, this.light.shadow.mapSize.width = 1024, this.light.shadow.mapSize.height = 1024, this.light.shadow.camera.near = 50, this.light.shadow.camera.far = 180, this.light.shadow.bias = .002, this.light.shadow.normalBias = .3;
    const e = 100;
    this.light.shadow.camera.left = -100, this.light.shadow.camera.right = e, this.light.shadow.camera.top = e, this.light.shadow.camera.bottom = -100, this.light.shadow.camera.zoom = 3.25, this.light.shadow.camera.updateProjectionMatrix(), this.add(this.light);
  }
  _resize() {
    this.___disposed || (this.mobileLayout = scope.client$1.screen.w < scope.client$1.screen.h && scope.client$1.screen.w < 700, this.camera.zoom = this.mobileLayout ? .8 : 1, this.camera.updateProjectionMatrix(), [this.button, this.title].forEach(e => e.resize()));
  }
  update() {
    this.___disposed || (this.camera.quaternion.setFromRotationMatrix(scope._m0.lookAt(this.camera.position, this.camera.target, this.camera.up)), scope._q0$3.setFromAxisAngle(scope._v0$b.subVectors(this.camera.position, this.camera.target).normalize(), this._outRotation.value), this.camera.quaternion.premultiply(scope._q0$3), this.camera.updateMatrixWorld());
  }
  async playInAnimation() {
    this.planetGroup.position.y = -80, scope.createTween(this.planetGroup.position, {
      to: {
        x: 0,
        y: 0,
        z: 0
      },
      duration: 2.25,
      delay: .2,
      ease: "inOut1",
      onUpdate: () => {
        this.light.position.copy(this.light._originalPosition), this.light.position.y += this.planetGroup.position.y, this.light.target.position.y = this.planetGroup.position.y, this.light.target.updateMatrixWorld();
      }
    }), this.planetGroup.scale.setScalar(.3), scope.createTween(this.planetGroup.scale, {
      to: {
        x: 1,
        y: 1,
        z: 1
      },
      duration: 6.3,
      delay: .2,
      ease: "inOut3"
    });
    const i = Math.PI * .35;
    this.planetGroup.rotation.y = i - Math.PI * 1.5, scope.createTween(this.planetGroup.rotation, {
      to: {
        y: i
      },
      delay: .2 + .15,
      duration: 5.65,
      ease: "inOut3"
    }), scope.createTween(this.planetGroup.rotation, {
      from: {
        x: -Math.PI * 1
      },
      to: {
        x: 0
      },
      delay: .2,
      duration: 2,
      ease: "inOut1"
    }), this.atmosphere.playInAnimation(.2 + 1.25), this.birds.playInAnimation(.2 + 2.5), this.title.playInAnimation(.2 + 2.15), this.particles.playInAnimation(.2 + .3), this.galaxies.playInAnimation(.2 + 2), this.button.playInAnimation(.2 + 3.1), scope.createDelayedCall(.16, () => {
      scope.events$1.emit("webgl_play_audio", "whoosh");
    }), scope.createDelayedCall(1.8, () => {
      scope.events$1.emit("webgl_play_audio", "whoosh");
    }), scope.createDelayedCall(2.5, () => {
      scope.events$1.emit("webgl_play_audio", "intro-letters");
    }), scope.createDelayedCall(3.45, () => {
      scope.events$1.emit("webgl_play_audio", "button-turn");
    }), await scope.miscutils.wait(3), this.title.interaction.enable(), this.title.hoveredObj = null, this.button.interaction.enable();
  }
  async playOutAnimation() {
    this.button.interaction.disable(), this.title.interaction.disable(), this.button.spinOut(0), await scope.miscutils.wait(.2), scope.createTween(this.camera, {
      to: {
        autoRotateSpeed: 0
      },
      duration: 1,
      ease: "power2.inOut",
      onUpdate: () => {
        this.___disposed || (this.camera.touchAmount = this.camera.autoRotateSpeed);
      }
    }), scope.createTween(this.camera._sphericalTarget, {
      to: {
        theta: this.camera._sphericalTarget.theta - Math.PI * .25,
        phi: 1.7
      },
      duration: 2.5,
      ease: "tweaked"
    }), scope.createTween(this.camera._sphericalTarget, {
      to: {
        radius: 40
      },
      duration: 2.75,
      delay: .4,
      ease: "inOut1"
    }), scope.createTween(this._outRotation, {
      to: {
        value: Math.PI * -.25
      },
      duration: 3.35,
      delay: .2,
      ease: "inOut1"
    }), this.button.playOutAnimation(0), this.title.playOutAnimation(0), scope.createDelayedCall(1, () => {
      scope.events$1.emit("webgl_play_audio", "whoosh");
    });
  }
  dispose() {
    this.___disposed = !0, scope.events$1.off("resize", this._resize, this), super.dispose();
  }
};
}
