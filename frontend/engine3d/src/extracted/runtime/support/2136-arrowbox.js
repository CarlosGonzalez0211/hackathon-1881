/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1824802:1832514.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2136(scope) {
scope.arrowbox = class arrowbox {
  constructor(e) {
    this.dialog = e, this.ready = scope.miscutils.deferred(), this.defaultColor = new scope.Color("#66BDE6"), this.color = this.defaultColor.clone(), this.anims = {
      hover: 0,
      scaleHover: 0
    }, this.font = "UglyDave-Alternates-optimized.font", this.init();
  }
  async init() {
    const e = this.dialog.scene.squareGeo2;
    this.bg = new scope.Mesh(e, new scope.ShaderMaterial({
      userData: {
        hotReload: "arrowbox-bg"
      },
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        uColor: {
          value: new scope.Color("#F8F8F8")
        },
        uColorShadow: {
          value: new scope.Color("#647A87")
        },
        uSeed: {
          value: Math.random()
        },
        uShow: {
          value: scope.client$1.devScene ? 1 : 0
        },
        uShadowOffset: {
          value: 5.5
        },
        uScaleHover: {
          value: 1
        }
      },
      vertexShader: `
                attribute int side;
                attribute int vertid;

                ${scope.globalUBO_default}
                ${scope.matrixutils_default}
                ${scope.falloff_default}

                uniform float uSeed;
                uniform float uShow;
                uniform float uShadowOffset;
                uniform vec3 uColor;
                uniform vec3 uColorShadow;
                uniform float uScaleHover;

                varying vec2 vUv;
                flat varying vec3 vColor;

                void main() {
                    vUv = uv;
                    vColor = uColor;

                    vec3 localPos = position;

                    float steps = 4.0;
                    float scaleShowStepped = floor(uShow * steps) / steps;

                    float vertSeed = fract(uSeed * 533.32 + float(vertid) * 210.67644 + scaleShowStepped * 34.5435);
                    float offset = (vertSeed * 2.0 - 1.0) * 0.065;
                    vec3 dir = normalize(vec3(position.xy, 0.0));
                    localPos += dir * offset;

                    localPos.xy *= uScaleHover * scaleShowStepped;
                    localPos = (modelMatrix * vec4(localPos, 1.0)).xyz;

                    if (scaleShowStepped > 0.0) {
                        if (side == 1) { // backdrop shadow
                            float offsetScale = uScaleHover == 1.0 ? 1.0 : 0.4;
                            localPos.xy += uShadowOffset * vec2(1.0, -1.0) * offsetScale;
                            vColor = uColorShadow;
                        }
                    }

                    gl_Position = projectionMatrix * viewMatrix * vec4(localPos, 1.0);
                }
            `,
      fragmentShader: `
                varying vec2 vUv;
                flat varying vec3 vColor;

                void main() {
                    gl_FragColor = vec4(vColor, 2.0);
                }
            `,
      depthWrite: !1,
      depthTest: !1
    })), this.bg.name = "arrow bg", this.bg.frustumCulled = !1, this.bg.renderOrder = -10, this.bg.visible = !1, this.bg.matrixAutoUpdate = !1;
    const [i, s, a] = await Promise.all([scope.glyphLoader.loadTexture("ui/arrow.icon", "band"), scope.glyphLoader.loadTexture("ui/arrow.icon", "curve"), scope.glyphLoader.loadGeometry("ui/arrow.icon", {
      size: 1
    })]);
    this.arrow = new scope.Mesh(a, new scope.ShaderMaterial({
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        tCurve: {
          value: s
        },
        tBand: {
          value: i
        },
        uHover: {
          value: 1
        },
        uShow: {
          value: scope.client$1.devScene ? 1 : 0
        },
        uColor: {
          value: this.defaultColor.clone()
        }
      },
      vertexShader: `
                uniform float uHover;
                uniform float uShow;

                ${scope.globalUBO_default}
                ${scope.falloff_default}
                ${scope.slugvs_default}

                varying vec2 vUv;

                void main() {
                    vUv = uv;

                    float showStepped = floor(uShow * 2.0) / 2.0;
                    vec3 pos = SlugVS() * vec3(vec2(uHover), 1.0) * showStepped;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
      fragmentShader: `
                varying vec2 vUv;

                ${scope.slugfs_default}

                uniform sampler2D tCurve;
                uniform usampler2D tBand;
                uniform vec3 uColor;

                void main() {
                    vec4 color = RenderSlug(tCurve, tBand, vTexCoord, vColor, vBanding, vGlyph);

                    if (color.w * vColor.w < 0.001) discard;

                    gl_FragColor = vec4(uColor, 1.0);
                }
            `,
      depthWrite: !1,
      depthTest: !1,
      transparent: !1
    })), this.arrow.name = "arrow icon", this.arrow.frustumCulled = !1, this.arrow.renderOrder = -5, this.arrow.visible = !1, this.arrow.matrixAutoUpdate = !1, this.domEl = document.createElement("div"), this.domEl.className = "dialog-button", this.domEl.style.cssText = "position: absolute;user-select: none;touch-action: none;", this.dialog.scene.globalUI.domContainer.appendChild(this.domEl), this.interaction = new scope.domInteraction({
      nodes: [this.domEl],
      hoverCursor: !0,
      onHover: this.hover.bind(this),
      onTouch: this.touch.bind(this),
      onClick: this.click.bind(this)
    }), this.dialog.dialogCnt.add(this.bg), this.dialog.dialogCnt.add(this.arrow), this.updateColors(), this.ready.resolve();
  }
  updateColors(e = null) {
    e ? this.color.setStyle(e) : this.color.copy(this.defaultColor), scope._c0$1.copy(this.color).offsetHSL(0, -.3, -.2), this.arrow.material.uniforms.uColor.value.copy(this.color);
  }
  hover(e) {
    if (e.action !== "hover_in") return;
    const i = Math.random() * 22.34,
      s = Math.random() * 3.34;
    scope.createTween(this.anims, {
      from: {
        hover: 0
      },
      to: {
        hover: 1
      },
      duration: .07,
      ease: "none",
      onStart: () => {
        this.bg.material.uniforms.uSeed.value = i, this.arrow.material.uniforms.uHover.value = .935;
      },
      onComplete: () => {
        this.bg.material.uniforms.uSeed.value = s, this.arrow.material.uniforms.uHover.value = 1;
      }
    }), scope.createTween(this.anims, {
      from: {
        scaleHover: 0
      },
      to: {
        scaleHover: 1
      },
      duration: .07,
      ease: "none",
      onStart: () => {
        this.bg.material.uniforms.uScaleHover.value = 1.1;
      },
      onComplete: () => {
        this.bg.material.uniforms.uScaleHover.value = 1;
      }
    }), scope.events$1.emit("webgl_play_audio", "hover2");
  }
  touch(e) {
    const i = e.action === "touch_start";
    scope.createTween(this.anims, {
      to: {
        scaleHover: 1
      },
      duration: 0,
      ease: "none",
      onComplete: () => {
        this.bg.material.uniforms.uScaleHover.value = i ? .925 : 1, this.arrow.material.uniforms.uHover.value = i ? .9 : 1;
      }
    }), scope.createTween(this.anims, {
      to: {
        hover: 1
      },
      duration: 0,
      ease: "none",
      onComplete: () => {
        this.bg.material.uniforms.uSeed.value = Math.random() * 43.23;
      }
    }), scope.events$1.emit("webgl_play_audio", `click${i ? 2 : 3}`);
  }
  click() {
    this.dialog.npcIDShowing !== null && this.dialog.clickArrow();
  }
  show(e = 0, i = null) {
    this.bg.visible = !1, this.arrow.visible = !1, this.updateColors(i), this.bg.material.uniforms.uScaleHover.value = 1, this.arrow.material.uniforms.uHover.value = 1, this.bg.material.uniforms.uSeed.value = Math.random(), scope.createTween(this.bg.material.uniforms.uShow, {
      from: {
        value: 0
      },
      to: {
        value: 1
      },
      duration: .3,
      ease: "none",
      delay: e,
      onStart: () => {
        this.bg.visible = !0;
      },
      onComplete: () => {
        this.interaction.enable();
      }
    }), scope.createTween(this.arrow.material.uniforms.uShow, {
      from: {
        value: 0
      },
      to: {
        value: 1
      },
      duration: .2,
      ease: "none",
      delay: e + .05,
      onStart: () => {
        this.arrow.visible = !0;
      }
    });
  }
  hide(e = 0) {
    this.interaction.disable(), scope.createTween(this.arrow.material.uniforms.uShow, {
      to: {
        value: 0
      },
      duration: .05,
      ease: "none",
      delay: e,
      onComplete: () => {
        this.arrow.visible = !1;
      }
    }), scope.createTween(this.bg.material.uniforms.uShow, {
      from: {
        value: 1
      },
      to: {
        value: 0
      },
      duration: .1,
      ease: "none",
      delay: e,
      onComplete: () => {
        this.bg.visible = !1;
      }
    });
  }
  update() {
    this.resize();
  }
  resize() {
    const e = this.dialog.scene,
      i = this.dialog.textBox,
      s = e.mobile ? 25 : e.small ? 20 : 30,
      a = e.mobile ? 30 : e.small ? 40 : 50,
      o = e.mobile ? 50 : e.small ? 65 : 80;
    this.bg.scale.set(o, o, 1), this.bg.position.set(i.bg.position.x + i.bg.scale.x * .5 - o * .5 + s, i.bg.position.y - i.bg.scale.y * .5 + o * .5 - a, 0);
    const l = this.domEl.style;
    l.width = `${this.bg.scale.x}px`, l.height = `${this.bg.scale.y}px`, l.left = `${this.bg.position.x - .5 * this.bg.scale.x}px`, l.top = `${Math.abs(this.bg.position.y) - .5 * this.bg.scale.y}px`, this.arrow.scale.set(o * .6, o * .6, 1), this.arrow.position.copy(this.bg.position), this.arrow.position.x += this.arrow.scale.x * .075, this.bg.updateMatrix(), this.arrow.updateMatrix();
  }
};
}
