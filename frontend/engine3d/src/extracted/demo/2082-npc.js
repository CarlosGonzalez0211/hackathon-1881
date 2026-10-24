/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1671274:1676016.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2082(scope) {
scope.npc = class npc {
  constructor(e, i = {}) {
    var s, a;
    this.scene = e, this.ready = scope.miscutils.deferred(), this.options = {
      id: `${scope.math.uid()}`,
      modelURL: null,
      bonesURL: null,
      animations: [],
      curve: null,
      curveSpeed: 1,
      curveProgress: 0,
      curveSpeedAnimationWeight: 1,
      alwaysFaceCharacter: !0,
      talkEnabled: !0,
      talkFacingPlayer: !0,
      talkDistance: 2.5,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      visibilityThreshold: 30,
      texts: ["hello there", "how are you?"],
      textsBubbles: !0,
      textsBubblesOffset: [0, 0, 0],
      textsBubblesOptions: {
        bubbleMaterialGenerator: scope.bubbleMaterialGenerator(),
        textMaterialGenerator: scope.textMaterialGenerator(),
        textMaterialGeneratorArgs: {},
        textOptions: {
          font: "UglyDave-Alternates-optimized.font",
          size: .12,
          color: "#1f1f1f",
          align: "left",
          width: 1.25,
          letterSpacing: -.02,
          lineHeight: 1
        },
        marginX: .125,
        marginY: .09
      },
      textsRepeatLast: !0,
      textsReset: !0,
      textsAutoClose: !0,
      textsSpeed: 35,
      textsCloseTime: .3,
      clickInteraction: !0,
      hoverCursor: !0,
      hitboxOffset: .2,
      icon: !1,
      iconFiles: ["ui/npc-icons/inactive.icon", "ui/npc-icons/active.icon"],
      iconOptions: {
        sizeActive: .28,
        sizeInactive: .12,
        color2: ((s = i.extraData) == null ? void 0 : s.color) || "#75B9B5",
        colorHighlight: ((a = i.extraData) == null ? void 0 : a.color) || "#75B9B5",
        materialGenerator: scope.createIconMaterial
      },
      iconOffset: [0, .1, 0],
      extraData: {
        name: "Unnamed NPC"
      },
      lookatOffset: [0, 0, 0],
      ...i
    }, this.options.talkEnabled || (this.options.talkFacingPlayer = !1, this.options.alwaysFaceCharacter = !1, this.options.texts = [""], this.options.textsBubbles = !1, this.options.clickInteraction = !1), this.init();
  }
  async init() {
    const [e, i, s, a, o] = await Promise.all([scope.geometryLoader.skin(this.options.modelURL, this.options.bonesURL), Promise.all(this.options.animations.map(h => scope.geometryLoader.skinAnimation(h))), this.options.curve ? scope.geometryLoader.curves(this.options.curve) : null, scope.glyphLoader.loadTexture(this.options.textsBubblesOptions.textOptions.font, "curve"), scope.glyphLoader.loadTexture(this.options.textsBubblesOptions.textOptions.font, "band")]);
    this.options.textsBubblesOptions.textMaterialGeneratorArgs.curveTexture = a, this.options.textsBubblesOptions.textMaterialGeneratorArgs.bandTexture = o;
    const l = scope.baseMaterial({
      isNPC: !0,
      NPC_DISTANCE: this.options.visibilityThreshold
    });
    this.mesh = new scope.NPC({
      id: this.options.id,
      skin: e,
      material: l,
      scene: this.scene,
      talkEnabled: this.options.talkEnabled,
      talkDistance: this.options.talkDistance,
      talkFacingPlayer: this.options.talkFacingPlayer,
      animations: i,
      animationsOptions: this.options.animationsOptions,
      curve: s || null,
      curveSpeed: this.options.curveSpeed,
      curveProgress: this.options.curveProgress,
      curveSpeedAnimationWeight: this.options.curveSpeedAnimationWeight,
      visibilityThreshold: this.options.visibilityThreshold,
      textsBubbles: this.options.textsBubbles,
      textsBubblesOffset: this.options.textsBubblesOffset,
      textsBubblesOptions: this.options.textsBubblesOptions,
      texts: this.options.texts.map(h => h.toUpperCase()),
      textsRepeatLast: this.options.textsRepeatLast,
      textsReset: this.options.textsReset,
      textsAutoClose: this.options.textsAutoClose,
      textsSpeed: this.options.textsSpeed,
      textsCloseTime: this.options.textsCloseTime,
      alwaysFaceCharacter: this.options.alwaysFaceCharacter,
      clickInteraction: this.options.clickInteraction,
      clickInteractionCamera: this.scene.camera,
      hoverCursor: this.options.hoverCursor,
      hitboxOffset: this.options.hitboxOffset,
      extraData: this.options.extraData,
      icon: this.options.icon,
      iconFiles: this.options.iconFiles,
      iconOptions: {
        ...this.options.iconOptions,
        offset: this.options.iconOffset
      }
    }), this.mesh.position.fromArray(this.options.position), this.mesh.rotation.fromArray(this.options.rotation), this.mesh.castShadow = !0, this.mesh.receiveShadow = !0, this.mesh.__wrapper = this;
    const c = () => {
      this.mesh.up.copy(this.mesh.position).normalize();
    };
    c(), this.scene.beforeRenderCbs.push(c), this.enableBubbles(), scope.events$1.on("npc_talk_update", this.talkUpdate, this), this.scene.add(this.mesh), await this.mesh.ready, this.ready.resolve();
  }
  enableBubbles() {
    this.mesh && (this.mesh._textsBubbles && this.mesh.enableBubbles(), this.mesh._clickInteraction && this.mesh.disableClickInteraction(), this.mesh._forceCloseDialog(this.mesh._id), this.mesh._textsAutoClose = !0, this.mesh._textsReset = !0, this.mesh._talkingDone = !0, this.scene.characters.mesh.interactingElement === this.mesh && (this.scene.characters.mesh.interactingElement = null, this.scene.characters.unlockCamera()), this.mesh._textsSpeed = 1 / 15, this.mesh._textsCloseTime = .4, this.mesh._icon && (this.mesh._icon._active = !1));
  }
  disableBubbles() {
    this.mesh && (this.mesh._textsBubbles && this.mesh.disableBubbles(), this.mesh._clickInteraction && this.mesh.enableClickInteraction(), this.mesh._forceCloseDialog(this.mesh._id), this.mesh._textsAutoClose = !1, this.mesh._textsReset = !1, this.mesh._talkingDone = !0, this.mesh._textsSpeed = 1 / 35, this.mesh._textsCloseTime = .3, this.mesh._icon && (this.mesh._icon._active = !0));
  }
  talkUpdate({
    id: e,
    talking: i
  }) {
    this.mesh._id === e && (this.mesh.material.uniforms.uIsTalking.value = i ? 1 : 0);
  }
};
}
