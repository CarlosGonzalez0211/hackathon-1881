/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1785760:1800761.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2128(scope) {
scope.sideButtons = class sideButtons {
  constructor(e) {
    this.scene = e, this.ready = scope.miscutils.deferred(), this.lastSize = 2, this.sizeIcons = [.475, .675, .675, .525, .65], this.shown = !1, this.init();
  }
  async init() {
    const e = this.scene.squareGeo2.clone(),
      i = new scope.InstancedBufferGeometry();
    i.instanceCount = 4;
    for (const T in e.attributes) i.setAttribute(T, e.attributes[T]);
    i.setIndex(e.index), i.setAttribute("hover", new scope.InstancedBufferAttribute(new Float32Array(i.instanceCount).fill(0), 1)), i.setAttribute("scaleHover", new scope.InstancedBufferAttribute(new Float32Array(i.instanceCount).fill(1), 1)), i._animObjs = [];
    for (let T = 0; T < i.instanceCount; T++) i._animObjs.push({
      hover: 0,
      scaleHover: 1
    });
    const s = new scope.DataTexture(new Float32Array(4 * 4), 4, 1, scope.RGBAFormat, scope.FloatType);
    s.needsUpdate = !0;
    const a = new scope.ShaderMaterial({
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        uColor: {
          value: new scope.Color("#F8F8F8")
        },
        uColorShadow: {
          value: new scope.Color("#647A87")
        },
        tBatchedInfo: {
          value: s
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
                attribute float hover;
                attribute float scaleHover;
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
                    vUv = uv;
                    vColor = uColor;

                    vec3 localPos = position;

                    float insID = float(gl_InstanceID);
                    float instanceSeed = fract((uSeed + hover) * 54.32 + insID * 45.54352 + float(vertid) * 31.2344);
                    float offset = (instanceSeed * 2.0 - 1.0) * 0.065;
                    vec3 dir = normalize(vec3(position.xy, 0.0));
                    localPos += dir * offset;

                    float scaleShow = falloff(insID, 0.0, ${i.instanceCount.toFixed(1)}, 1.0, uShow);
                    float steps = floor(2.0 + fract(uSeed * 4.35452 + insID * 23.546) * 3.0);
                    float scaleShowStepped = floor(scaleShow * steps) / steps;

                    localPos.xy *= scaleHover * scaleShowStepped;

                    if (side == 1) {
                        vec3 scale = getMatrixScale(instanceMatrix);
                        float offsetScale = scaleHover == 1.0 ? 1.0 : 0.4;
                        localPos.xy += (uShadowOffset / scale.x) * vec2(1.0, -1.0) * offsetScale;
                        vColor = uColorShadow;
                    }

                    vec4 pos = instanceMatrix * vec4(localPos, 1.0);
                    gl_Position = projectionMatrix * modelViewMatrix * pos;
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
    });
    this.geo = i, this.mesh = new scope.InstancedMesh(i, a, i.instanceCount), this.mesh.name = "sidebutton squares", this.mesh.frustumCulled = !1, this.mesh.visible = !!scope.client$1.devScene, this.mesh.renderOrder = 0, this.mesh.matrixAutoUpdate = !1;
    const o = [];
    ["list", "sound", "sound-muted", "t-shirt", "poo"].forEach((T, M) => {
      o.push(Promise.all([scope.glyphLoader.loadTexture(`ui/sidebuttons/${T}.icon`, "band"), scope.glyphLoader.loadTexture(`ui/sidebuttons/${T}.icon`, "curve"), scope.glyphLoader.loadGeometry(`ui/sidebuttons/${T}.icon`, {
        size: 1
      })]));
    });
    const [c, h, d, p, f] = await Promise.all(o),
      _ = [c[2], h[2], d[2], p[2], f[2]],
      x = _.reduce((T, M) => T + M.attributes.position.count, 0),
      b = _.reduce((T, M) => T + M.index.count, 0);
    this.meshIcons = new scope.BatchedMesh(_.length, x, b, new scope.ShaderMaterial({
      name: "side-icons",
      userData: {
        hotReload: "side-icons"
      },
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        uShow: {
          value: scope.client$1.devScene ? 1 : 0
        },
        uSeed: {
          value: Math.random()
        },
        tBands1: {
          value: c[0]
        },
        tCurves1: {
          value: c[1]
        },
        tBands2: {
          value: h[0]
        },
        tCurves2: {
          value: h[1]
        },
        tBands3: {
          value: d[0]
        },
        tCurves3: {
          value: d[1]
        },
        tBands4: {
          value: p[0]
        },
        tCurves4: {
          value: p[1]
        },
        tBands5: {
          value: f[0]
        },
        tCurves5: {
          value: f[1]
        }
      },
      vertexShader: `
                /* BATCHING */
                #if ! defined(GL_ANGLE_multi_draw)
                    #define gl_DrawID _gl_DrawID
                    uniform int _gl_DrawID;
                #endif
                uniform highp sampler2D batchingTexture;
                uniform highp usampler2D batchingIdTexture;

                mat4 getBatchingMatrix(const in int i) {
                    int size = textureSize(batchingTexture, 0).x;
                    int j = i * 4;
                    int x = j % size;
                    int y = j / size;
                    vec4 v1 = texelFetch(batchingTexture, ivec2(x, y), 0);
                    vec4 v2 = texelFetch(batchingTexture, ivec2(x + 1, y), 0);
                    vec4 v3 = texelFetch(batchingTexture, ivec2(x + 2, y), 0);
                    vec4 v4 = texelFetch(batchingTexture, ivec2(x + 3, y), 0);
                    return mat4(v1, v2, v3, v4);
                }

                float getIndirectIndex(const in int i) {
                    int size = textureSize(batchingIdTexture, 0).x;
                    int x = i % size;
                    int y = i / size;
                    return float(texelFetch(batchingIdTexture, ivec2(x, y), 0).r);
                }

                uniform float uShow;
                uniform float uSeed;

                varying vec2 vUv;
                flat varying int vBatchID;

                ${scope.globalUBO_default}
                ${scope.slugvs_default}
                ${scope.falloff_default}

                void main() {
                    vUv = uv;

                    float batchID = getIndirectIndex(gl_DrawID);
                    vBatchID = int(batchID);
                    mat4 batchingMatrix = getBatchingMatrix(vBatchID);

                    mat4 bmvpMatrix = projectionMatrix * modelViewMatrix * batchingMatrix;
                    vec3 pos = SlugVS(bmvpMatrix);

                    float scaleShow = falloff(batchID, 0.0, ${_.length.toFixed(1)}, 5.0, uShow);
                    float steps = floor(2.0 + fract(uSeed * 45.35452 + batchID * 2.546) * 3.0);
                    float scaleShowStepped = floor(scaleShow * steps) / steps;
                    pos *= scaleShowStepped;

                    gl_Position = bmvpMatrix * vec4(pos, 1.0);
                }
            `,
      fragmentShader: `

                // thanks android
                uniform sampler2D tCurves1;
                uniform usampler2D tBands1;
                uniform sampler2D tCurves2;
                uniform usampler2D tBands2;
                uniform sampler2D tCurves3;
                uniform usampler2D tBands3;
                uniform sampler2D tCurves4;
                uniform usampler2D tBands4;
                uniform sampler2D tCurves5;
                uniform usampler2D tBands5;

                ${scope.slugfs_default}

                varying vec2 vUv;
                flat varying int vBatchID;

                void main() {
                    vec4 color;

                    if (vBatchID == 0) {
                        color = RenderSlug(tCurves1, tBands1, vTexCoord, vColor, vBanding, vGlyph);
                    } else if (vBatchID == 1) {
                        color = RenderSlug(tCurves2, tBands2, vTexCoord, vColor, vBanding, vGlyph);
                    } else if (vBatchID == 2) {
                        color = RenderSlug(tCurves3, tBands3, vTexCoord, vColor, vBanding, vGlyph);
                    } else if (vBatchID == 3) {
                        color = RenderSlug(tCurves4, tBands4, vTexCoord, vColor, vBanding, vGlyph);
                    } else if (vBatchID == 4) {
                        color = RenderSlug(tCurves5, tBands5, vTexCoord, vColor, vBanding, vGlyph);
                    }

                    if (color.w * vColor.w < 0.001) discard;

                    gl_FragColor = vec4(color.rgb, 1.0);
                }
            `
    })), this.meshIcons.name = "sidebutton icons", this.meshIcons.sortObjects = !1, this.meshIcons.receiveShadow = !1, this.meshIcons.castShadow = !1, this.meshIcons.frustumCulled = !1, this.meshIcons.perObjectFrustumCulled = !1, this.meshIcons.visible = !!scope.client$1.devScene, this.meshIcons.renderOrder = 1, this.meshIcons.matrixAutoUpdate = !1, this.meshIcons.__objs = [], _.forEach((T, M) => {
      this.meshIcons.addInstance(this.meshIcons.addGeometry(T)), this.meshIcons.__objs.push(new scope.Object3D());
    }), this.domEls = [document.createElement("div"), document.createElement("div"), document.createElement("div"), document.createElement("div")], this.domEls.forEach((T, M) => {
      T.className = "side-button", T.style.cssText = "position: absolute;user-select: none;touch-action: none;", this.scene.globalUI.domContainer.appendChild(T);
    }), this.scene.add(this.mesh), this.scene.add(this.meshIcons), this.resize(), this.interaction = new scope.domInteraction({
      nodes: [...this.domEls],
      onHover: this.hover,
      onTouch: this.touch,
      onClick: this.click,
      ctx: this,
      hoverCursor: !0
    }), scope.events$1.on("ui_show_sideicons", this.show, this), scope.events$1.on("ui_hide_sideicons", this.hide, this), scope.events$1.on("character_change_traits_shown", this.hide, this), scope.events$1.on("character_change_traits_hiddden", () => {
      this.show(.2);
    }), scope.events$1.on("npc_dialog_shown", () => {
      this.hide();
    }, this), scope.events$1.on("npc_dialog_hidden", () => {
      this.show(.2);
    }), scope.events$1.on("end_screen_show", this.hide, this), scope.events$1.on("end_screen_hide", () => {
      this.show(.2);
    }), scope.events$1.on("audio_update_mute", this.setMuteState, this), this.setMuteState(), this.ready.resolve();
  }
  setMuteState(e) {
    (typeof e == "boolean" ? e : this.scene.controller.audioController.muted) ? (this.meshIcons.setVisibleAt(1, !1), this.meshIcons.setVisibleAt(2, !0)) : (this.meshIcons.setVisibleAt(1, !0), this.meshIcons.setVisibleAt(2, !1));
  }
  show(e = 0) {
    if (this.shown) return;
    this.shown = !0, this.mesh.material.uniforms.uSeed.value = Math.random(), this.meshIcons.material.uniforms.uSeed.value = Math.random();
    let i = !1;
    scope.createTween(this.mesh.material.uniforms.uShow, {
      to: {
        value: 1
      },
      duration: .5,
      delay: e,
      ease: "none",
      onStart: () => {
        this.mesh.visible = !0;
      },
      onUpdate: () => {
        !i && this.mesh.material.uniforms.uShow.value > .2 && (i = !0, scope.events$1.emit("webgl_play_audio", "buttons"));
      },
      onComplete: () => {
        this.interaction.enable();
      }
    }), scope.createTween(this.meshIcons.material.uniforms.uShow, {
      to: {
        value: 1
      },
      duration: .55,
      delay: e,
      ease: "none",
      onStart: () => {
        this.meshIcons.visible = !0;
      }
    }), scope.events$1.emit("ui_sideicons_shown");
  }
  hide(e = 0) {
    this.shown && (this.shown = !1, this.interaction.disable(), scope.createTween(this.meshIcons.material.uniforms.uShow, {
      to: {
        value: 0
      },
      duration: .3,
      delay: e,
      ease: "none",
      onComplete: () => {
        this.meshIcons.visible = !1;
      }
    }), scope.createTween(this.mesh.material.uniforms.uShow, {
      to: {
        value: 0
      },
      duration: .35,
      delay: e,
      ease: "none",
      onComplete: () => {
        this.mesh.visible = !1;
      }
    }), scope.events$1.emit("ui_sideicons_hidden"));
  }
  hover(e) {
    if (e.action === "hover_out") return;
    const i = e.nodeIndex,
      s = this.mesh.geometry._animObjs[i],
      a = Math.random() * 22.34,
      o = Math.random() * 3.34,
      l = [];
    i === 0 ? l.push(0) : i === 1 ? l.push(1, 2) : l.push(i + 1), scope.createTween(s, {
      from: {
        hover: 0
      },
      to: {
        hover: 1
      },
      duration: .07,
      ease: "none",
      onStart: () => {
        this.mesh.geometry.attributes.hover.setX(i, a), this.mesh.geometry.attributes.hover.needsUpdate = !0, l.forEach(c => {
          this.meshIcons.__objs[c].scale.set(this.lastSize, this.lastSize, 1).multiplyScalar(this.sizeIcons[c]).multiplyScalar(.935), this.meshIcons.__objs[c].updateMatrix(), this.meshIcons.setMatrixAt(c, this.meshIcons.__objs[c].matrix);
        });
      },
      onComplete: () => {
        this.mesh.geometry.attributes.hover.setX(i, o), this.mesh.geometry.attributes.hover.needsUpdate = !0, l.forEach(c => {
          this.meshIcons.__objs[c].scale.set(this.lastSize, this.lastSize, 1).multiplyScalar(this.sizeIcons[c]), this.meshIcons.__objs[c].updateMatrix(), this.meshIcons.setMatrixAt(c, this.meshIcons.__objs[c].matrix);
        });
      }
    }), scope.createTween(s, {
      from: {
        scaleHover: 0
      },
      to: {
        scaleHover: 1
      },
      duration: .07,
      ease: "none",
      onStart: () => {
        this.mesh.geometry.attributes.scaleHover.setX(i, 1.1), this.mesh.geometry.attributes.scaleHover.needsUpdate = !0;
      },
      onComplete: () => {
        this.mesh.geometry.attributes.scaleHover.setX(i, 1), this.mesh.geometry.attributes.scaleHover.needsUpdate = !0;
      }
    }), scope.events$1.emit("webgl_play_audio", "hover2");
  }
  touch(e) {
    const i = e.nodeIndex,
      s = e.action === "touch_start",
      a = [];
    i === 0 ? a.push(0) : i === 1 ? a.push(1, 2) : a.push(i + 1);
    const o = this.mesh.geometry._animObjs[i];
    scope.createTween(o, {
      to: {
        scaleHover: 1
      },
      duration: 0,
      ease: "none",
      onComplete: () => {
        const l = s;
        this.mesh.geometry.attributes.scaleHover.setX(i, l ? .925 : 1), this.mesh.geometry.attributes.scaleHover.needsUpdate = !0, a.forEach(c => {
          this.meshIcons.__objs[c].scale.set(this.lastSize, this.lastSize, 1).multiplyScalar(this.sizeIcons[c]).multiplyScalar(l ? .9 : 1), this.meshIcons.__objs[c].updateMatrix(), this.meshIcons.setMatrixAt(c, this.meshIcons.__objs[c].matrix);
        });
      }
    }), scope.createTween(o, {
      to: {
        hover: 1
      },
      duration: 0,
      ease: "none",
      onComplete: () => {
        this.mesh.geometry.attributes.hover.setX(i, Math.random() * 43.23), this.mesh.geometry.attributes.hover.needsUpdate = !0;
      }
    }), scope.events$1.emit("webgl_play_audio", `click${s ? 2 : 3}`);
  }
  click(e) {
    const i = e.nodeIndex;
    i === 0 ? scope.events$1.emit("ui_quest_log_toggle") : i === 1 ? scope.events$1.emit("audio_mute_toggle") : i === 2 ? scope.events$1.emit("character_change_traits_show") : i === 3 && scope.events$1.emit("ui_emojis_toggle");
  }
  resize() {
    const e = this.scene.mobile ? 45 : this.scene.small ? 65 : 70,
      i = scope.client$1.screen.w - this.scene.marginLeft - .5 * e,
      s = this.scene.mobile ? 40 : this.scene.small ? 50 : 60;
    this.lastSize = e, scope._obj.position.set(i, -this.scene.marginTop - e * .5, 0), scope._obj.scale.set(e, e, 1), scope._obj.updateMatrix(), this.mesh.setMatrixAt(0, scope._obj.matrix);
    let a = this.domEls[0].style;
    a.width = `${scope._obj.scale.x}px`, a.height = `${scope._obj.scale.y}px`, a.left = `${scope._obj.position.x - .5 * scope._obj.scale.x}px`, a.top = `${Math.abs(scope._obj.position.y) - .5 * scope._obj.scale.y}px`, this.meshIcons.__objs[0].position.copy(scope._obj.position), this.meshIcons.__objs[0].scale.copy(scope._obj.scale).multiplyScalar(this.sizeIcons[0]), this.meshIcons.__objs[0].updateMatrix(), this.meshIcons.setMatrixAt(0, this.meshIcons.__objs[0].matrix);
    const o = -scope.client$1.screen.h + this.scene.marginTop;
    for (let l = 1; l < this.geo.instanceCount; l++) {
      const c = 3 - l;
      scope._obj.position.set(i, o + e * .5 + (e * .5 + s) * c, 0), scope._obj.scale.set(e, e, 1), scope._obj.updateMatrix(), this.mesh.setMatrixAt(l, scope._obj.matrix), a = this.domEls[l].style, a.left = `${scope._obj.position.x - .5 * scope._obj.scale.x}px`, a.top = `${Math.abs(scope._obj.position.y) - .5 * scope._obj.scale.y}px`, a.width = `${scope._obj.scale.x}px`, a.height = `${scope._obj.scale.y}px`;
    }
    for (let l = 1; l < this.meshIcons._instanceInfo.length; l++) {
      const c = Math.min(2, 4 - l);
      this.meshIcons.__objs[l].position.set(i, o + e * .5 + (e * .5 + s) * c, 0), this.meshIcons.__objs[l].scale.set(e, e, 1).multiplyScalar(this.sizeIcons[l]), this.meshIcons.__objs[l].updateMatrix(), this.meshIcons.setMatrixAt(l, this.meshIcons.__objs[l].matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = !0, this.meshIcons._matricesTexture.needsUpdate = !0, this.mesh.updateMatrix(), this.mesh.computeBoundingBox(), this.mesh.computeBoundingSphere(), this.meshIcons.updateMatrix();
  }
};
}
