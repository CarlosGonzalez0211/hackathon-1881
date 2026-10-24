/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1873953:1882965.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2145(scope) {
scope.emojiList = class emojiList {
  constructor(e) {
    this.scene = e, this.ready = scope.miscutils.deferred(), this.shown = !1, this.lastSize = 1, this.init();
  }
  async init() {
    const e = this.scene.squareGeo2.clone();
    e.translate(-.5, .5, 0), this.bg = new scope.Mesh(e, new scope.ShaderMaterial({
      userData: {
        hotReload: "emojilist-bg"
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
                    ${scope.rotate_default}
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

                        localPos.xy += vec2(0.5, -0.5);
                        vec3 dir = normalize(vec3(localPos.xy, 0.0));
                        localPos += dir * offset;
                        localPos.xy -= vec2(0.5, -0.5);

                        vec4 pos = vec4(localPos * scaleShowStepped, 1.0);
                        vec4 wPos = modelMatrix * pos;

                        vUv = uv;
                        vColor = uColor;

                        if (scaleShowStepped > 0.0) {
                            if (side == 1) { // backdrop shadow
                                wPos.xy += uShadowOffset * vec2(1.0, -1.0);
                                vColor = uColorShadow;
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
    })), this.bg.name = "emojilist bg", this.bg.frustumCulled = !1, this.bg.renderOrder = -10, this.bg.visible = !1, this.bg.matrixAutoUpdate = !1;
    const i = [];
    for (let c = 0; c < 10; c++) i.push(Promise.all([scope.glyphLoader.loadTexture(`ui/emojis/${c}.icon`, "band"), scope.glyphLoader.loadTexture(`ui/emojis/${c}.icon`, "curve"), scope.glyphLoader.loadGeometry(`ui/emojis/${c}.icon`, {
      size: 1
    })]));
    const s = await Promise.all(i),
      a = s.map(c => c[2]),
      o = a.slice(0, 5),
      l = a.slice(5, 10);
    this.meshIconsBottom = scope.getBatchedIcons(o.length, o.reduce((c, h) => c + h.attributes.position.count, 0), o.reduce((c, h) => c + h.index.count, 0)), this.meshIconsBottom.name = "emojis icons Bottom", this.meshIconsTop = scope.getBatchedIcons(o.length, l.reduce((c, h) => c + h.attributes.position.count, 0), l.reduce((c, h) => c + h.index.count, 0)), this.meshIconsTop.name = "emojis icons Top";
    for (let c = 0; c < 10; c++) c < 5 ? (this.meshIconsBottom.material.uniforms[`tBands${c + 1}`].value = s[c][0], this.meshIconsBottom.material.uniforms[`tCurves${c + 1}`].value = s[c][1]) : (this.meshIconsTop.material.uniforms[`tBands${c - 4}`].value = s[c][0], this.meshIconsTop.material.uniforms[`tCurves${c - 4}`].value = s[c][1]);
    this._animObjs = [];
    for (let c = 0; c < 10; c++) this._animObjs.push({
      hover: 0,
      scaleHover: 1
    });
    this.meshIconsBottom.__objs = [], this.meshIconsTop.__objs = [], a.forEach((c, h) => {
      h < 5 ? (this.meshIconsBottom.addInstance(this.meshIconsBottom.addGeometry(c)), this.meshIconsBottom.__objs.push(new scope.Object3D())) : (this.meshIconsTop.addInstance(this.meshIconsTop.addGeometry(c)), this.meshIconsTop.__objs.push(new scope.Object3D()));
    }), this.domBg = document.createElement("div"), this.domBg.className = "emoji-bg", this.domEmojis = [];
    for (let c = 0; c < 10; c++) this.domEmojis.push(document.createElement("div"));
    [this.domBg, ...this.domEmojis].forEach((c, h) => {
      c.style.cssText = "position: absolute;user-select: none;touch-action: none;pointer-events: none;", (h === 0 ? this.scene.globalUI.domContainer : this.domBg).appendChild(c);
    }), this.scene.add(this.bg), this.scene.add(this.meshIconsBottom), this.scene.add(this.meshIconsTop), this.resize(), this.interaction = new scope.domInteraction({
      nodes: [...this.domEmojis],
      onHover: this.hover,
      onTouch: this.touch,
      onClick: this.click,
      ctx: this,
      hoverCursor: !0
    }), scope.events$1.on("ui_emojis_toggle", this.toggle, this), scope.events$1.on("character_change_traits_shown", this.hide, this), scope.events$1.on("npc_dialog_shown", this.hide, this), scope.events$1.on("ui_quest_log_toggle", this.hide, this), scope.events$1.on("touch_click", this.hide, this), scope.events$1.on("end_screen_show", this.hide, this), this.ready.resolve();
  }
  toggle() {
    this.shown ? this.hide() : this.show();
  }
  hover(e) {
    if (e.action === "hover_out") return;
    const i = e.nodeIndex,
      s = this._animObjs[i],
      a = i < 5 ? this.meshIconsBottom : this.meshIconsTop,
      o = a.__objs;
    scope.createTween(s, {
      from: {
        hover: 0
      },
      to: {
        hover: 1
      },
      duration: .07,
      ease: "none",
      onStart: () => {
        const l = i % 5;
        o[l].scale.set(this.lastSize, this.lastSize, 1).multiplyScalar(.95), o[l].updateMatrix(), a.setMatrixAt(l, o[l].matrix);
      },
      onComplete: () => {
        const l = i % 5;
        o[l].scale.set(this.lastSize, this.lastSize, 1), o[l].updateMatrix(), a.setMatrixAt(l, o[l].matrix);
      }
    });
  }
  touch(e) {
    const i = e.nodeIndex,
      s = this._animObjs[i],
      a = i < 5 ? this.meshIconsBottom : this.meshIconsTop,
      o = a.__objs,
      l = e.action === "touch_start";
    this.bg.material.uniforms.uSeed.value = Math.random(), [this.meshIconsBottom, this.meshIconsTop].forEach(c => {
      c.material.uniforms.uSeed.value = Math.random();
    }), scope.createTween(s, {
      to: {
        scaleHover: 1
      },
      duration: 0,
      ease: "none",
      onComplete: () => {
        const c = i % 5;
        o[c].scale.set(this.lastSize, this.lastSize, 1).multiplyScalar(l ? .875 : 1), o[c].updateMatrix(), a.setMatrixAt(c, o[c].matrix);
      }
    });
  }
  click(e) {
    typeof scope.EMOJI_MAP[e.nodeIndex] == "number" && scope.events$1.emit("character_emoji_display", scope.EMOJI_MAP[(e.nodeIndex + 1) % 10]);
  }
  show(e = 0) {
    this.shown || (this.shown = !0, this.bg.visible = !1, this.meshIconsBottom.visible = !1, this.meshIconsTop.visible = !1, this.bg.material.uniforms.uSeed.value = Math.random(), scope.createTween(this.bg.material.uniforms.uShow, {
      from: {
        value: 0
      },
      to: {
        value: 1
      },
      duration: .15,
      ease: "none",
      delay: e,
      onStart: () => {
        this.bg.visible = !0, this.domBg.style.pointerEvents = "";
      },
      onComplete: () => {
        this.interaction.enable();
      }
    }), [this.meshIconsBottom, this.meshIconsTop].forEach((i, s) => {
      scope.createTween(i.material.uniforms.uShow, {
        from: {
          value: 0
        },
        to: {
          value: 1
        },
        duration: .15,
        ease: "none",
        delay: e + .15 + s * .075,
        onStart: () => {
          i.visible = !0;
        }
      });
    }), scope.events$1.emit("webgl_play_audio", "open-box2"), scope.events$1.emit("webgl_play_audio", "open-box-emote"));
  }
  hide() {
    this.shown && (this.shown = !1, this.interaction.disable(), [this.meshIconsTop, this.meshIconsBottom].forEach((e, i) => {
      scope.createTween(e.material.uniforms.uShow, {
        from: {
          value: 1
        },
        to: {
          value: 0
        },
        duration: .05,
        ease: "none",
        delay: 0,
        onComplete: () => {
          e.visible = !1;
        }
      });
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
  resize() {
    const e = this.scene,
      i = e.marginTop,
      s = e.marginLeft,
      a = this.scene.mobile ? 45 : this.scene.small ? 65 : 70,
      o = this.scene.mobile ? 15 : 20,
      l = e.mobile ? 30 : 40,
      c = e.mobile ? 12 : this.scene.small ? 15 : 20,
      h = e.mobile || this.scene.small ? 15 : 20,
      d = h,
      p = this.scene.mobile ? 375 : this.scene.small ? 475 : 550,
      f = Math.min(scope.client$1.screen.w, p) - c * 2 - s - a - o - l,
      _ = this.scene.mobile ? 13 : this.scene.small ? 17 : 20,
      x = this.scene.mobile ? 10 : this.scene.small ? 15 : 20,
      b = (f - _ * 4) / 5,
      T = b * 2 + x,
      M = f + c * 2,
      w = T + h + d,
      D = -scope.client$1.screen.height + i,
      R = scope.client$1.screen.width - s - a - o;
    this.lastSize = b, this.bg.scale.set(M, w, 1), this.bg.position.set(R, D, 0);
    const P = this.domBg.style;
    P.width = `${this.bg.scale.x}px`, P.height = `${this.bg.scale.y}px`, P.left = `${this.bg.position.x - this.bg.scale.x}px`, P.top = `${Math.abs(this.bg.position.y) - this.bg.scale.y}px`, this.domEmojis.forEach((O, N) => {
      O.style.width = `${b}px`, O.style.height = `${b}px`;
      const H = this.bg.scale.x - c - b - (_ + b) * (N % 5);
      O.style.left = `${H}px`;
      const F = this.bg.scale.y - d - b - (N < 5 ? 0 : x + b);
      O.style.top = `${F}px`;
    });
    let U = [1, 1, 1, 1, 1];
    for (let O = 0; O < 5; O++) {
      const N = O,
        H = R - c - b * .5 - (_ + b) * N,
        F = D + d + b * .5;
      this.meshIconsBottom.__objs[N].position.set(H, F, 0), this.meshIconsBottom.__objs[N].scale.set(b, b, 1).multiplyScalar(U[N]), this.meshIconsBottom.__objs[N].updateMatrix(), this.meshIconsBottom.setMatrixAt(N, this.meshIconsBottom.__objs[N].matrix);
    }
    U = [1, 1, 1, 1, 1];
    for (let O = 5; O < 10; O++) {
      const N = O - 5,
        H = R - c - b * .5 - (_ + b) * N,
        F = D + d + b + x + b * .5;
      this.meshIconsTop.__objs[N].position.set(H, F, 0), this.meshIconsTop.__objs[N].scale.set(b, b, 1).multiplyScalar(U[N]), this.meshIconsTop.__objs[N].updateMatrix(), this.meshIconsTop.setMatrixAt(N, this.meshIconsTop.__objs[N].matrix);
    }
    this.bg.updateMatrix(), this.meshIconsBottom.updateMatrix(), this.meshIconsTop.updateMatrix();
  }
};
}
