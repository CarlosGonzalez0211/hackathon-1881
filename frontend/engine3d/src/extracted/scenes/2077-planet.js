/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1655133:1660768.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2077(scope) {
scope.planet = class planet extends scope.scene {
  constructor(e, i = {}) {
    super({
      customCamera: scope.followCamera$1
    }), this.mainController = e, this.terrainOptions = {
      terrain: i.terrain || "present",
      chunks: 10
    }, this.characterInitialOptions = {
      initialPosition: i.charPosition || [-10, 36, 14],
      initialRotation: i.charRotation || 0,
      initialRadius: i.charRadius || 2,
      relativeCameraPosition: new scope.Vector3(0, 1, 5),
      relativeCameraOffset: new scope.Vector3(-.65, 0, 1),
      collider: null,
      roomPrefix: i.roomPrefix || "planets-default"
    }, this.lightOptions = {
      cmsOptions: i.cmsOptions || ["#ffffff", 3],
      csmPositionOffset: i.csmPositionOffset || new scope.Spherical(100, Math.PI * .2, Math.PI * -.25),
      csmForwardOffset: i.csmForwardOffset || 6
    }, this._planetID = i.planet, this.quests = [], this._init();
  }
  async _init() {
    await Promise.all([this.loadHitMesh(), this.setupCamera(), this.setupPostProcessing()]);
    const e = [["characters", scope.characters, this.characterInitialOptions], ["terrain", scope.terrain, this.terrainOptions]];
    await Promise.all(e.map(i => (this[i[0]] = new i[1](this, i[2]), this[i[0]].ready))), await Promise.all([this.init(), this.camera.isFollowCamera ? await scope.miscutils.wait(this.camera, "_followedMesh") : Promise.resolve()]), this.setupLights(), this.waterScene && scope.global$1.renderer.webgl.compileAsync(this.waterScene, this.waterScene.camera), this._resize(), scope.events$1.on("resize", this._resize, this), scope.events$1.on("topicon_change", this.playIconSound, this), scope.events$1.on("npc_bubble_text_starts", this.npcBubbleStarts, this), scope.events$1.on("npc_bubble_text_ends", this.npcBubbleEnds, this), scope.events$1.on("npc_bubble_show", this.npcBubbleShow, this), scope.events$1.on("npc_bubble_hide", this.npcBubbleHide, this), this.initQuests(), scope.client$1.devScene && (this.playInAnimation(), this.debug(), window._scene = this, window._camera = this.camera, window._characters = this.characters), this.isReady();
  }
  async loadHitMesh() {
    const i = Array.from({
        length: 5
      }, (a, o) => o),
      s = await Promise.all(i.map(a => scope.geometryLoader.load(`planets/present/hitmesh_${a}.drc`)));
    this.characterInitialOptions.collider = scope.mergeGeometries(s);
  }
  setupCamera() {
    this.camera.shake.set(.07, .07, .02), this.camera.shakeSpeed.setScalar(.2), this.camera.near = .2, this.camera.far = 175, this.camera.updateProjectionMatrix();
  }
  setupPostProcessing() {
    return new Promise(e => {
      scope.__lifecycle.setTimeout(() => {
        scope.addPostProcessing(this, this.composer), e();
      }, 0);
    });
  }
  setupLights() {
    const e = new scope.followCSM({
      csm: !1,
      scene: this,
      castShadow: !0,
      shadowMapSize: scope.client$1.iphone ? 1024 : 2400,
      shadowSize: 24,
      color: this.lightOptions.cmsOptions[0],
      intensity: this.lightOptions.cmsOptions[1],
      positionOffset: this.lightOptions.csmPositionOffset,
      forwardOffset: this.lightOptions.csmForwardOffset
    });
    e.shadow.normalBias = .07, e.shadow.bias = -1e-4, this.directionalLight = e, this.add(e);
  }
  async init() {}
  async initQuests() {}
  async playInAnimation() {
    if (this.camera.isFollowCamera) {
      const e = this.camera._cameraCollisions,
        i = this.camera.touchAmount;
      this.camera._cameraCollisions = !1, this.camera.touchAmount = 0, this.birds && (this.birds.mesh.material.uniforms.uShow.value = 0), this.birds2 && (this.birds2.mesh.material.uniforms.uShow.value = 0);
      const s = !this.anyStepInitiated,
        a = {
          value: 1
        },
        c = scope.createTween(a, {
          to: {
            value: 0
          },
          ease: s ? "power1.out" : "inOut1",
          duration: s ? 2 : 3.25,
          onStart: () => {
            this.camera.overwriteAmount = 1;
          },
          onUpdate: () => {
            scope._v0$6.copy(this.camera._followedMeshTarget).normalize(), this.camera.overwriteTarget.copy(this.camera._followedMeshTarget).addScaledVector(scope._v0$6, 2 * a.value), this.camera.overwriteSpherical.radius = scope.math.mix(this.camera._spherical.radius, 12, a.value), this.camera.overwriteSpherical.phi = this.camera._spherical.phi, this.camera.overwriteSpherical.theta = this.camera._spherical.theta;
          },
          onComplete: () => {
            this.camera.overwriteAmount = 0, this.camera._cameraCollisions = e, this.birds && scope.createTween(this.birds.mesh.material.uniforms.uShow, {
              to: {
                value: 1
              },
              duration: 2
            }), this.birds2 && scope.createTween(this.birds2.mesh.material.uniforms.uShow, {
              to: {
                value: 1
              },
              duration: 2
            });
          }
        });
      scope.createDelayedCall(.3, () => {
        scope.events$1.emit("webgl_play_audio", "whoosh");
      }), s && !scope.client$1.devScene ? (await c, this.characters.mesh.interactingElement = "intro", await scope.miscutils.wait(1), await scope.introDialogue(), this.characters.mesh.interactingElement = null, this.characters.mesh._connection?._createSocket()) : (scope.createTween(this.camera, {
        to: {
          touchAmount: i
        },
        duration: 4
      }), this.characters.mesh._connection?._createSocket(), await scope.createDelayedCall(2, () => {
        this.characters.enable();
      }), scope.events$1.emit("ui_show_sideicons"));
    }
  }
  _resize() {
    this.camera._followedMesh && (scope.client$1.screen.w > scope.client$1.screen.h ? (this.camera.setOffset([-.65, 0, 1], !1), this.camera._cameraTargetLocalLerp = .0125, this.camera.displacement.position.set(-.075, -.05), this.camera.zoom = scope.client$1.iphone ? scope.client$1.screen.aspectRatio : 1) : (this.camera.setOffset([-.25, 0, .5], !1), this.camera._cameraTargetLocalLerp = .03, this.camera.displacement.position.set(0, 0), this.camera.zoom = 1), this.camera.updateProjectionMatrix());
  }
  playIconSound({
    object: e,
    visible: i,
    isClose: s
  }) {
    !(e != null && e.isWorldNPC) || !i || (s ? scope.events$1.emit("webgl_play_positional", "bubble-starts", e, .1, .2, !0) : scope.events$1.emit("webgl_play_positional", "bubble-ends", e, .1, .1, !0));
  }
  npcBubbleShow({
    object: e
  }) {
    e != null && e.isWorldNPC && scope.events$1.emit("webgl_play_positional", "bubble-starts", e, .1, 0, !0);
  }
  npcBubbleHide({
    object: e
  }) {
    e != null && e.isWorldNPC && (scope.events$1.emit("webgl_play_positional", "bubble-ends", e, .1, .1, !0), this.npcBubbleEnds({
      object: e
    }));
  }
  npcBubbleStarts({
    object: e
  }) {
    var o;
    if (!(e != null && e.isWorldNPC) || !e.__wrapper) return;
    const i = e.__wrapper,
      a = `dialogue-${((o = i.options.extraData) == null ? void 0 : o.voice) || "male1"}`;
    scope.events$1.emit("webgl_play_positional", a, i.mesh);
  }
  npcBubbleEnds({
    object: e
  }) {
    var o;
    if (!(e != null && e.isWorldNPC) || !e.__wrapper) return;
    const i = e.__wrapper,
      a = `dialogue-${((o = i.options.extraData) == null ? void 0 : o.voice) || "male1"}`;
    scope.events$1.emit("webgl_stop_positional", a, i.mesh);
  }
  playOutAnimation() {
    this.characters.dispose();
  }
};
}
