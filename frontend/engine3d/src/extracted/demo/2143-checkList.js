/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1859234:1869060.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2143(scope) {
scope.checkList = class checkList {
  constructor(e) {
    this.scene = e, this.ready = scope.miscutils.deferred(), this.font = "UglyDave-Alternates-optimized.font", this.currentSize = 1, this.shown = !1, this.enabledColor = new scope.Color("#0f0f0f"), this.disabledColor = new scope.Color("#6D6D6D"), this.init();
  }
  async init() {
    this.dot = new scope.dot(this.scene);
    const e = this.scene.squareGeo3;
    this.bg = new scope.Mesh(e, new scope.ShaderMaterial({
      userData: {
        hotReload: "checklist-bg"
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

                varying vec2 vUv;
                flat varying vec3 vColor;

                void main() {
                    vec3 localPos = position;

                    float steps = 4.0;
                    float scaleShowStepped = floor(uShow * steps) / steps;

                    float vertSeed = fract(uSeed * 54.32 + float(vertid) * 12.645 + scaleShowStepped * 34.5435);
                    float offset = (vertSeed * 2.0 - 1.0) * 0.02;
                    vec3 dir = normalize(vec3(position.xy, 0.0));
                    localPos += dir * offset;
                    localPos.xy -= 0.5;

                    vec4 pos = vec4(localPos * scaleShowStepped, 1.0);
                    vec4 wPos = modelMatrix * pos;

                    vUv = uv;
                    vColor = uColor;

                    if (scaleShowStepped > 0.0) {
                        if (side == 1) { // backdrop shadow
                            wPos.xy += uShadowOffset * vec2(1.0, -1.0);
                            vColor = uColorShadow;
                        } else if (side == 2) { // inside to prevent outlines due to color changes
                            wPos.xy -= (uv * 2.0 - 1.0) * step(0.01, uShow) * vec2(10.0, 10.0); // px inward
                            vColor = -uColor;
                            // vColor = uColor * 0.3; // debug
                        }
                    }

                    gl_Position = projectionMatrix * viewMatrix * wPos;
                }
            `,
      fragmentShader: `
                varying vec2 vUv;
                flat varying vec3 vColor;

                void main() {
                    gl_FragColor = vec4(vColor, 1.0);
                }
            `,
      depthWrite: !1,
      depthTest: !1
    })), this.bg.name = "checklist bg", this.bg.frustumCulled = !1, this.bg.renderOrder = -10, this.bg.visible = !1, this.bg.matrixAutoUpdate = !1;
    const [i, s] = await Promise.all([scope.glyphLoader.loadTexture(this.font, "band"), scope.glyphLoader.loadTexture(this.font, "curve")]);
    this.text = new scope.meshText({
      font: this.font,
      small: !1,
      text: "placeholder".toUpperCase(),
      size: 1,
      width: 27,
      letterSpacing: -.05,
      lineHeight: 1.1,
      color: `#${this.enabledColor.getHexString()}`,
      align: "left"
    }, new scope.ShaderMaterial({
      name: "checklist-text",
      defines: {
        SLUG_WEIGHT: 1
      },
      userData: {
        hotReload: "texbox text"
      },
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        tCurve: {
          value: s
        },
        tBand: {
          value: i
        },
        uSeed: {
          value: Math.random()
        },
        uShow: {
          value: 1
        },
        uHide: {
          value: 0
        }
      },
      vertexShader: `
                attribute vec3 centr;
                attribute vec2 textWeights;

                uniform float uShow;
                uniform float uHide;

                flat varying vec3 vCentr;

                ${scope.globalUBO_default}
                ${scope.falloff_default}
                ${scope.slugvs_default}
                ${scope.eases_default}

                float hash13(vec3 p3) {
                    p3  = fract(p3 * .1031);
                    p3 += dot(p3, p3.zyx + 31.32);
                    return fract((p3.x + p3.y) * p3.z);
                }

                vec2 hash23(vec3 p3) {
                    p3 = fract(p3 * vec3(.1031, .1030, .0973));
                    p3 += dot(p3, p3.yzx+33.33);
                    return fract((p3.xx+p3.yz)*p3.zy);
                }

                void main() {
                    vCentr = centr;
                    vec3 pos = SlugVS();

                    float seed = fract(hash13(centr));

                    // animation
                    if (uShow < 1.0 || uHide > 0.0) {
                        // show
                        float stepsShow = floor(3.0 + seed * 2.0);
                        float trShow = floor(falloff(textWeights.y, 0.0, 1.0, 0.1, uShow) * stepsShow) / stepsShow;
                        vTexCoord += vec2(0.0, 1.0) * (1.0 - trShow);

                        // hide
                        float stepsHide = floor(2.0 + seed * 2.0);
                        float trHide = 1.0 - floor(uHide * (stepsHide + 1.0)) / (stepsHide + 1.0);
                        pos -= centr;
                        pos *= trHide;
                        pos += centr;
                    }

                    // wiggle
                    float steppedTime = floor(time * 1.6 * mix(fract(seed), 0.8, 1.0) + seed * 15.3423) / 7.0;
                    vec2 offset = (hash23(centr + vec3(steppedTime, 0.0, 0.0)) * 2.0 - 1.0) * 0.5;
                    pos.xy += offset;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
      fragmentShader: `
                uniform sampler2D tCurve;
                uniform usampler2D tBand;

                flat varying vec3 vCentr;

                ${scope.globalUBO_default}
                ${scope.slugfs_default}
                ${scope.transformUV_default}

                void main() {
                    vec2 uv = vTexCoord;
                    vec4 color = RenderSlug(tCurve, tBand, uv, vColor, vBanding, vGlyph);

                    // skip outline
                    gl_FragColor = vec4(-color.xyz, color.w * vColor.w);
                }
            `,
      transparent: !0,
      depthWrite: !1
    })), this.text.name = "Checklist Text", this.text.frustumCulled = !1, this.text.rederOrder = -5, this.text.visible = !1, this.text.matrixAutoUpdate = !1, await this.text.ready, this.buildText(), this.domBg = document.createElement("div"), this.domBg.className = "checklist-bg", this.domBg.style.cssText = "position: absolute;user-select: none;touch-action: none;pointer-events: none;", this.scene.globalUI.domContainer.appendChild(this.domBg), this.scene.add(this.bg), this.scene.add(this.text), scope.events$1.on("ui_quest_log_toggle", this.toggle, this), scope.events$1.on("character_change_traits_shown", this.hide, this), scope.events$1.on("npc_dialog_shown", this.hide, this), scope.events$1.on("ui_emojis_toggle", this.hide, this), scope.events$1.on("touch_click", this.hide, this), scope.events$1.on("end_screen_show", this.hide, this), scope.events$1.on("quest_info_checklist_update", this.update, this), this.ready.resolve();
  }
  toggle() {
    this.shown ? this.hide() : (this.show(), this.dot.hide());
  }
  show(e = 0) {
    this.shown || (this.shown = !0, this.bg.visible = !1, this.text.visible = !1, this.bg.material.uniforms.uSeed.value = Math.random(), scope.createTween(this.bg.material.uniforms.uShow, {
      from: {
        value: 0
      },
      to: {
        value: 1
      },
      duration: .2,
      ease: "none",
      delay: e,
      onStart: () => {
        this.bg.visible = !0, this.domBg.style.pointerEvents = "";
      }
    }), scope.createTween(this.text.material.uniforms.uHide, {
      to: {
        value: 0
      }
    }), scope.createTween(this.text.material.uniforms.uShow, {
      from: {
        value: 0
      },
      to: {
        value: 1
      },
      duration: .2,
      ease: "none",
      delay: e + .2,
      onStart: () => {
        this.text.visible = !0;
      }
    }), scope.events$1.emit("webgl_play_audio", "open-box2"), scope.events$1.emit("webgl_play_audio", "open-box-checklist"));
  }
  hide() {
    this.shown && (this.shown = !1, scope.createTween(this.text.material.uniforms.uHide, {
      to: {
        value: 1
      },
      duration: .05,
      ease: "none",
      delay: 0,
      onComplete: () => {
        this.text.visible = !1;
      }
    }), scope.createTween(this.bg.material.uniforms.uShow, {
      from: {
        value: 1
      },
      to: {
        value: 0
      },
      duration: .15,
      ease: "none",
      delay: .05,
      onComplete: () => {
        this.bg.visible = !1, this.domBg.style.pointerEvents = "none";
      }
    }), scope.events$1.emit("webgl_play_audio", "open-box1"));
  }
  update(e = !1, i = !1) {
    i ? this.dot.hide() : e && this.dot.show(), this.buildText(), this.resize();
  }
  buildText() {
    const e = Object.keys(scope.QUESTINFO).every(s => scope.QUESTINFO[s].steps.every(o => o === !1));
    let i = `CHECKLIST:

`;
    Object.keys(scope.QUESTINFO).forEach((s, a) => {
      const o = scope.QUESTINFO[s],
        l = o.steps.reduce((f, _) => f + (_ === !0 ? 1 : 0), 0),
        c = l > 0,
        h = l === o.steps.length;
      let d = "",
        p = "";
      !e && (!c || h) && (d += "{#", p += "{#", c || (d += `colorf(${this.disabledColor.r},${this.disabledColor.g},${this.disabledColor.b},1);`, p += `colorf(${this.enabledColor.r},${this.enabledColor.g},${this.enabledColor.b},1);`), h && (d += "strike(true);", p += "strike(false);"), d += "}", p += "}"), i += `${d}${a + 1}. ${o.text} (${l}/${o.steps.length})${p}`, a < Object.keys(scope.QUESTINFO).length - 1 && (i += `{#size(${(this.currentSize * .75).toFixed(2)})}

{#size(${this.currentSize.toFixed(2)})}`);
    }), this.text.setText(i);
  }
  async resize() {
    const e = this.scene,
      i = e.marginTop,
      s = e.marginLeft,
      a = this.scene.mobile ? 45 : this.scene.small ? 65 : 70,
      o = this.scene.mobile ? 15 : 20,
      l = e.mobile ? 30 : 40,
      c = e.mobile ? 12 : 20,
      h = e.mobile ? 35 : 50,
      d = e.mobile ? 10 : 20,
      p = e.mobile ? 20 : e.small ? 24 : 26,
      f = Math.min(scope.client$1.screen.w, 550) - c * 2 - s - a - o - l,
      _ = -.01;
    this.currentSize = p, this.buildText(), await this.text.update({
      size: p,
      width: f,
      letterSpacing: _
    });
    const x = f + c * 2,
      b = this.text.bboxSize.y + h + d,
      T = -i,
      M = scope.client$1.screen.width - s - a - o;
    this.bg.scale.set(x, b, 1), this.bg.position.set(M, T, 0);
    const w = this.domBg.style;
    w.width = `${this.bg.scale.x}px`, w.height = `${this.bg.scale.y}px`, w.left = `${this.bg.position.x - this.bg.scale.x}px`, w.top = `${Math.abs(this.bg.position.y)}px`, this.text.position.set(M - x + c, T - h, 0), this.dot.mesh.scale.setScalar(this.scene.mobile ? 15 : 20), this.dot.mesh.position.set(scope.client$1.screen.width - s, T, 0), this.bg.updateMatrix(), this.text.updateMatrix(), this.dot.mesh.updateMatrix();
  }
};
}
