/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1599932:1604479.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2035(scope) {
scope.button = class button {
  constructor(e) {
    this.scene = e, this.ready = scope.miscutils.deferred(), this.font = "heading.font", this.baseOffset = 0, this.hoverRotation = 0, this.rotation = {
      value: 0
    }, this.animRotation = {
      value: 0
    }, this.finalRotation = {
      value: 0
    }, this.baseScale = 1, this.scaleMultiplier = {
      value: 1
    }, this.updateCamPosition = !0, this.camPosition = new scope.Vector3(), this.init();
  }
  async init() {
    const [e, i, s] = await Promise.all([scope.geometryLoader.load("planets/present/intro/button.drc"), scope.glyphLoader.loadTexture(this.font, "band"), scope.glyphLoader.loadTexture(this.font, "curve")]);
    this.mesh = new scope.Mesh(e, scope.material({})), this.mesh.name = "Button", this.mesh.frustumCulled = !1, this.text = new scope.meshText({
      font: this.font,
      small: !1,
      text: scope.anyStepInitiated ? "ENTER " : "BEGIN",
      size: 1,
      width: 20,
      letterSpacing: .01,
      lineHeight: 1.1,
      color: "#F8F8F8",
      align: "center",
      shadow: !0,
      shadowX: .06,
      shadowY: .06,
      shadowColor: "#7A5E0D"
    }, scope.textMaterial({
      bandTexture: i,
      curveTexture: s
    })), this.text.name = "Button text", this.text.frustumCulled = !1, await this.text.ready, this.groupAnim = new scope.Group(), this.groupAnim.name = "Button Animation Group", this.groupAnim.add(this.mesh), this.groupAnim.add(this.text), this.group = new scope.Group(), this.group.name = "Button Group", this.group.add(this.groupAnim), this.scene.add(this.group), this.scene.beforeRenderCbs.push(this.update.bind(this)), this.interaction = new scope.meshInteraction({
      meshes: [this.mesh],
      camera: this.scene.camera,
      onHover: this.hover,
      onTouch: this.touch,
      onClick: this.click,
      hoverCursor: !0,
      ctx: this
    }), this.ready.resolve();
  }
  hover(e) {
    if (e.action === "hover_in") {
      if (this.mesh.material.uniforms.uSeed.value = Math.random(), e.event.input !== "mouse") return;
      scope.createTween(this.mesh.material.uniforms.uHover, {
        to: {
          value: 1
        },
        duration: .07,
        ease: "none",
        onComplete: () => {
          this.mesh.material.uniforms.uSeed.value = Math.random(), scope.createTween(this.mesh.material.uniforms.uHover, {
            to: {
              value: 0
            }
          });
        }
      }), scope.createTween(this.text.material.uniforms.uHover, {
        to: {
          value: 1
        },
        duration: .07,
        ease: "none",
        onComplete: () => {
          scope.createTween(this.text.material.uniforms.uHover, {
            to: {
              value: 0
            }
          });
        }
      }), scope.events$1.emit("webgl_play_audio", "hover2");
      return;
    }
    const i = Math.sign(e.event.delta11.y);
    i !== 0 && (this.hoverRotation -= Math.PI * .5 * i, scope.createTween(this.rotation, {
      to: {
        value: this.hoverRotation
      },
      duration: 1.5,
      ease: "elastic.out(1, 0.9)"
    }), scope.createTween(this.text.material.uniforms.uShow, {
      to: {
        value: 1
      }
    }), scope.createTween(this.text.material.uniforms.uHide, {
      to: {
        value: 1
      },
      duration: .05,
      ease: "none",
      onComplete: () => {
        scope.createTween(this.text.material.uniforms.uHide, {
          to: {
            value: 0
          },
          delay: .14
        }), scope.createTween(this.text.material.uniforms.uShow, {
          from: {
            value: 0
          },
          to: {
            value: 1
          },
          delay: .14,
          duration: .2,
          ease: "none"
        });
      }
    }), scope.events$1.emit("webgl_play_audio", "button-turn"));
  }
  touch(e) {
    const i = e.action === "touch_start";
    i ? scope.createTween(this.scaleMultiplier, {
      to: {
        value: .95
      },
      duration: .02,
      ease: "none"
    }) : scope.createTween(this.scaleMultiplier, {
      to: {
        value: 1
      },
      duration: .02,
      ease: "none"
    }), scope.events$1.emit("webgl_play_audio", `click${i ? 2 : 3}`);
  }
  click(e) {
    scope.events$1.emit("switch_to_present_scene");
  }
  update() {
    if (this.scene.___disposed) return;
    const e = this.scene.camera;
    this.updateCamPosition && this.camPosition.copy(e.position), scope._v0$c.copy(e.target).sub(this.camPosition).normalize(), scope._v1$7.copy(this.camPosition).addScaledVector(scope._v0$c, 45), this.group.position.copy(scope._v1$7), scope._v0$c.subVectors(this.camPosition, e.target), scope._v0$c.lengthSq() === 0 && (scope._v0$c.z = 1), scope._v0$c.normalize(), scope._v1$7.crossVectors(e.up, scope._v0$c), scope._v1$7.lengthSq() === 0 && (Math.abs(e.up.z) === 1 ? scope._v0$c.x += 1e-4 : scope._v0$c.z += 1e-4, scope._v0$c.normalize(), scope._v1$7.crossVectors(e.up, scope._v0$c)), scope._v1$7.normalize(), scope._v2$1.crossVectors(scope._v0$c, scope._v1$7), this.finalRotation.value = this.rotation.value + this.animRotation.value, this.mesh.rotation.set(this.finalRotation.value, 0, 0);
    const i = this.baseScale * this.scaleMultiplier.value;
    this.group.scale.setScalar(i), this.group.position.addScaledVector(scope._v2$1, this.baseOffset), this.group.quaternion.setFromRotationMatrix(scope._m0$1.lookAt(this.camPosition, e.target, scope._v0$c.set(0, 1, 0))), this.group.updateMatrixWorld();
  }
  playInAnimation(e = 0) {
    this.groupAnim.scale.setScalar(0), scope.createTween(this.groupAnim.scale, {
      to: {
        x: 1,
        y: 1,
        z: 1
      },
      duration: 3.25,
      delay: e,
      ease: "elastic.out(1, 0.9)"
    }), this.groupAnim.rotation.x = Math.PI * -1, scope.createTween(this.groupAnim.rotation, {
      to: {
        x: 0
      },
      duration: 3.25,
      delay: e,
      ease: "elastic.out(1, 0.5)"
    });
  }
  spinOut() {
    scope.createTween(this.groupAnim.rotation, {
      to: {
        x: this.groupAnim.rotation.x + Math.PI * -2
      },
      duration: 1.5,
      delay: 0,
      ease: "inOut1"
    }), scope.createDelayedCall(.3, () => {
      scope.events$1.emit("webgl_play_audio", "button-out");
    });
  }
  playOutAnimation(e = 0) {
    this.updateCamPosition = !1;
  }
  resize() {
    this.text.scale.setScalar(1.4), this.text.position.set(0, -.25 * 1.4, 1.2), this.baseScale = this.scene.mobileLayout ? 1.5 : 1, this.baseOffset = this.scene.mobileLayout ? -16 : -13.5;
  }
};
}
