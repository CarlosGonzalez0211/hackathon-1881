/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1885749:1892923.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2147(scope) {
scope.endScreen = class endScreen {
  constructor(e) {
    this.scene = e, this.ready = scope.miscutils.deferred(), this.font = "UglyDave-Alternates-optimized.font", this.color = new scope.Color("#ffffff"), this.shadowColor = new scope.Color("#030303"), this.volumes = {
      dialogue: 0
    }, this.shown = !1, this.init();
  }
  async init() {
    const [e, i] = await Promise.all([scope.glyphLoader.loadTexture(this.font, "band"), scope.glyphLoader.loadTexture(this.font, "curve")]);
    this.text = new scope.meshText({
      font: this.font,
      small: !1,
      text: "placeholder".toUpperCase(),
      size: 1,
      width: 10,
      letterSpacing: -.05,
      lineHeight: 1.1,
      color: `#${this.color.getHexString()}`,
      align: "center",
      shadow: !0,
      shadowColor: `#${this.shadowColor.getHexString()}`,
      shadowX: .06,
      shadowY: .06
    }, scope.createMaterial(i, e)), this.text.name = "End Screen Text", this.text.frustumCulled = !1, this.text.rederOrder = 20, this.text.visible = !1, this.text.matrixAutoUpdate = !1, this.textContinue = new scope.meshText({
      font: this.font,
      small: !1,
      text: "continue".toUpperCase(),
      size: 1,
      width: 10,
      letterSpacing: -.05,
      lineHeight: 1.1,
      color: `#${this.color.getHexString()}`,
      align: "center",
      shadow: !0,
      shadowColor: `#${this.shadowColor.getHexString()}`,
      shadowX: .06,
      shadowY: .06
    }, scope.createMaterial(i, e)), this.textContinue.name = "End Screen Text Continue", this.textContinue.frustumCulled = !1, this.textContinue.rederOrder = 20, this.textContinue.visible = !1, this.textContinue.matrixAutoUpdate = !1, this.underline = new scope.Mesh(this.scene.squareGeo2.clone(), new scope.ShaderMaterial({
      uniforms: {
        uShow: {
          value: scope.client$1.devScene ? 1 : 0
        },
        uHide: {
          value: 0
        },
        uHover: {
          value: 0
        },
        uColor1: {
          value: this.color
        },
        uColor2: {
          value: this.shadowColor
        }
      },
      vertexShader: `
                uniform float uHover;

                attribute int side;
                flat varying int vSide;
                varying vec2 vUv;

                void main() {
                    vSide = side;
                    vUv = uv;

                    vec4 wPos = modelMatrix * vec4(position, 1.0);
                    if (side == 1) wPos.xy += vec2(2.0, -2.0);
                    wPos.y -= uHover * 3.0;
                    gl_Position = projectionMatrix * viewMatrix * wPos;
                }
            `,
      fragmentShader: `
                uniform float uShow;
                uniform float uHide;
                uniform vec3 uColor1;
                uniform vec3 uColor2;

                flat varying int vSide;
                varying vec2 vUv;

                ${scope.fit_default}

                void main() {
                    vec3 color = vSide == 0 ? uColor1 : uColor2;

                    float showAmount = step(vUv.x, uShow);
                    float hideAmount = step(uHide, vUv.x);

                    // float hoverOut = step(fit(uHover, 0.0, 0.5, 0.0, 1.0), vUv.x);
                    // float hoverIn = 1.0 - step(fit(uHover, 0.5, 1.0, 0.0, 1.0), vUv.x);

                    float show = showAmount * hideAmount /* * max(hoverIn, hoverOut) */;
                    if (show < 0.0001) discard;

                    gl_FragColor = vec4(-color, 1.0);
                }
            `
    })), this.underline.name = "End Screen Underline", this.underline.frustumCulled = !1, this.underline.renderOrder = 20, this.underline.visible = !1, this.underline.matrixAutoUpdate = !1, await Promise.all([this.text.ready, this.textContinue.ready]), this.domButton = document.createElement("div"), this.domButton.className = "continue-button", this.domButton.style.cssText = "position: absolute;user-select: none;touch-action: none;pointer-events: none;", this.scene.globalUI.domContainer.appendChild(this.domButton), this.interaction = new scope.domInteraction({
      nodes: [this.domButton],
      onHover: this.hoverButton,
      onClick: this.clickButton,
      ctx: this,
      hoverCursor: !0
    }), this.scene.add(this.text), this.scene.add(this.textContinue), this.scene.add(this.underline), scope.events$1.on("end_screen_show", this.show, this), scope.events$1.on("end_screen_hide", this.hide, this), this.ready.resolve();
  }
  show(e = 0) {
    var s, a;
    if (this.shown) return;
    this.shown = !0, this.interaction.enable(), [this.text, this.textContinue, this.underline].forEach((o, l) => {
      o.visible = !1, o.visible = !1, o.visible = !1;
      const c = l === 0 ? 1.5 : .65,
        h = (l === 0 ? 0 : 1.5) + (l === 2 ? .1 : 0) + .1;
      scope.createTween(o.material.uniforms.uHide, {
        to: {
          value: 0
        }
      }), scope.createTween(o.material.uniforms.uShow, {
        from: {
          value: 0
        },
        to: {
          value: 1
        },
        duration: c,
        ease: "none",
        delay: e + h,
        onStart: () => {
          o.visible = !0, l === 0 ? this.playDialogue(!0) : l === 1 && scope.events$1.emit("webgl_play_audio", "customize");
        },
        onComplete: () => {
          l === 0 && this.playDialogue(!1);
        }
      });
    }), scope.events$1.emit("overlay", !0);
    const i = (a = (s = this.scene.globalUI.controller) == null ? void 0 : s.planetScene) == null ? void 0 : a.characters;
    i && (i.mesh.interactingElement = null, i.unlockCamera(), i.disable());
  }
  playDialogue(e = !0) {
    scope.createTween(this.volumes, {
      to: {
        dialogue: e ? 1 : 0
      },
      duration: .25,
      onUpdate: () => {
        scope.events$1.emit("webgl_set_audio_volume", "dialogue-quest", this.volumes.dialogue * .075);
      }
    });
  }
  hide(e = 0) {
    var s, a;
    if (!this.shown) return;
    this.shown = !1, this.playDialogue(!1), scope.events$1.emit("webgl_play_audio", "zoom-off"), this.interaction.disable(), [this.text, this.textContinue, this.underline].forEach((o, l) => {
      scope.createTween(o.material.uniforms.uHide, {
        to: {
          value: 1
        },
        duration: .1,
        ease: "none",
        delay: 0,
        onComplete: () => {
          o.visible = !1;
        }
      });
    }), scope.events$1.emit("overlay", !1);
    const i = (a = (s = this.scene.globalUI.controller) == null ? void 0 : s.planetScene) == null ? void 0 : a.characters;
    i && i.enable();
  }
  hoverButton(e) {
    e.action !== "hover_out" && (scope.createTween(this.underline.material.uniforms.uHover, {
      to: {
        value: 1
      },
      duration: 0,
      ease: "none",
      onComplete: () => {
        scope.createTween(this.underline.material.uniforms.uHover, {
          to: {
            value: 0
          },
          duration: 0,
          delay: .1,
          ease: "none"
        });
      }
    }), scope.createTween(this.textContinue.material.uniforms.uScale, {
      to: {
        value: 1.05
      },
      duration: 0,
      ease: "none",
      onComplete: () => {
        scope.createTween(this.textContinue.material.uniforms.uScale, {
          to: {
            value: 1
          },
          duration: 0,
          delay: .1,
          ease: "none"
        });
      }
    }), scope.events$1.emit("webgl_play_audio", "hover2"));
  }
  clickButton(e) {
    scope.events$1.emit("end_screen_hide");
  }
  buildText(e = 20) {
    let i = "";
    i += `{#size(${(e * 2).toFixed(2)})} YOU MADE IT! {#size(${e.toFixed(2)})}


`, i += `YOU FINISHED ALL THE DELIVERIES!
`, i += `STAY AND EXPLORE THE WORLD, OR REFRESH YOUR BROWSER TO START AGAIN.

`, i += `CREATED IN 2025 BY VICENTE LUCENDO AND MICHAEL SUNGAILA. MUSIC BY KEVIN COLOMBIN.

`, i += "HI@ABETO.CO", this.text.setText(i), this.textContinue.setText(">CONTINUE");
  }
  async resize() {
    const e = this.scene,
      i = e.mobile ? 20 : e.small ? 24 : 30;
    this.buildText(i);
    const s = e.mobile ? 30 : 40,
      a = Math.min(scope.client$1.screen.w, 850) - s * 2,
      o = -.01;
    await Promise.all([this.text.update({
      size: i,
      width: a,
      letterSpacing: o
    }), this.textContinue.update({
      size: i * 1.1,
      width: a,
      letterSpacing: o
    })]);
    const l = this.text.bboxSize.y,
      c = i * 2,
      h = this.textContinue.bboxSize.y,
      d = 10,
      p = 3,
      f = l + c + h + d + p;
    this.text.position.set(scope.client$1.screen.width * .5, -scope.client$1.screen.height * .5 - this.text.topAlign + f * .5 * .95, 0), this.textContinue.position.set(this.text.position.x, this.text.position.y - l + this.text.topAlign - c, 0), this.underline.scale.set(this.textContinue.bboxSize.x, p, 1), this.underline.position.set(this.textContinue.position.x, this.textContinue.position.y - d, 0);
    const _ = this.domButton.style,
      x = this.textContinue.bboxSize.x + 40,
      b = this.textContinue.bboxSize.y + 40;
    _.width = `${x}px`, _.height = `${b}px`, _.left = `${this.textContinue.position.x - x * .5}px`, _.top = `${Math.abs(this.textContinue.position.y) - b * .6}px`, this.text.updateMatrix(), this.textContinue.updateMatrix(), this.underline.updateMatrix();
  }
};
}
