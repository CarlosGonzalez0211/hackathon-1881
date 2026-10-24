/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1631590:1633791.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2056(scope) {
scope.emojis = class emojis {
  constructor({
    scene: e,
    characters: i
  } = {}) {
    this.scene = e, this.characters = i, this.giveModels = {}, this.animation = {
      value: 0
    }, this.ready = scope.miscutils.deferred(), this.init();
  }
  async init() {
    const e = new Set();
    scope.questData.quests.forEach(i => {
      i.steps.forEach(s => {
        var a, o, l, c;
        (a = s.extraData) != null && a.giveModel && e.add((o = s.extraData) == null ? void 0 : o.giveModel), (l = s.extraData) != null && l.receiveModel && e.add((c = s.extraData) == null ? void 0 : c.receiveModel);
      });
    }), await Promise.all(Array.from(e).map(i => scope.geometryLoader.load(i).then(s => {
      this.giveModels[i] = s;
    }))), this.mesh = new scope.Mesh(this.giveModels[Object.keys(this.giveModels)[0]], new scope.baseMaterial({
      isGive: !0
    })), this.mesh.frustumCulled = !1, this.mesh.name = "Give Object", this.mesh.visible = !1, this.mesh.castShadow = !0, this.mesh.receiveShadow = !0, this.mesh.matrixAutoUpdate = !1, scope.events$1.on("quest_receive_model", this.receive, this), scope.events$1.on("quest_give_model", this.give, this), this.scene.add(this.mesh), this.ready.resolve();
  }
  receive(e) {
    this.show(e, "receive");
  }
  give(e) {
    this.show(e, "give");
  }
  show(e, i = "receive") {
    if (!this.giveModels[e]) return;
    this.mesh.geometry = this.giveModels[e];
    const s = this.characters._localObject;
    scope._v1$6.copy(s.position), scope._v1$6.addScaledVector(s.up, 1), scope._v1$6.add(scope._v2.set(-.1, 0, .9).applyQuaternion(s.quaternion));
    const a = scope._v1$6.toArray();
    scope.createTween(this.animation, {
      from: {
        value: 0
      },
      to: {
        value: 1
      },
      duration: i === "give" ? .5 : 1.15,
      ease: "sine.inOut",
      onStart: () => {
        this.mesh.visible = !0;
      },
      onUpdate: () => {
        scope._v0$9.copy(s.position), scope._v0$9.addScaledVector(s.up, .8), scope._v0$9.add(scope._v1$6.set(-.1, 0, .1).applyQuaternion(s.quaternion)), scope._v1$6.fromArray(a), i === "receive" ? this.mesh.position.lerpVectors(scope._v1$6, scope._v0$9, this.animation.value) : this.mesh.position.lerpVectors(scope._v0$9, scope._v1$6, this.animation.value);
        const o = scope.math.parabola(this.animation.value, 1) * .15;
        this.mesh.position.addScaledVector(s.up, o);
        const l = scope.math.fit(this.animation.value, 0, .1, 0, 1) * scope.math.fit(this.animation.value, .9, 1, 1, 0);
        this.mesh.scale.setScalar(l), this.mesh.quaternion.copy(s.quaternion), this.mesh.quaternion.premultiply(scope._q0$2.setFromAxisAngle(s.up, scope.renderInfo.time * 3)), this.mesh.updateMatrix();
      },
      onComplete: () => {
        this.mesh.visible = !1;
      }
    });
  }
  dispose() {
    scope.events$1.off("quest_receive_model", this.receive, this), scope.events$1.off("quest_give_model", this.give, this);
  }
};
}
