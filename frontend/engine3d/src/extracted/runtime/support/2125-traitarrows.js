/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1771380:1784888.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2125(scope) {
scope.traitarrows = class traitarrows {
  constructor(e) {
    this.scene = e, this.shown = !1, this.lastTouched = 0, this.offsetX = .5, this.offsetXArrow = .5075, this.baseY = .1, this.offsetY = .46, this.closeY = 1.9, this.ready = scope.miscutils.deferred(), this.init();
  }
  async init() {
    const e = new scope.InstancedBufferGeometry();
    e.instanceCount = 9;
    for (const _ in scope.baseGeo.attributes) e.setAttribute(_, scope.baseGeo.attributes[_]);
    e.setIndex(scope.baseGeo.index), e.setAttribute("hover", new scope.InstancedBufferAttribute(new Float32Array(e.instanceCount).fill(0), 1)), e.setAttribute("scaleHover", new scope.InstancedBufferAttribute(new Float32Array(e.instanceCount).fill(1), 1)), e._animObjs = [];
    for (let _ = 0; _ < e.instanceCount; _++) e._animObjs.push({
      hover: 0,
      scaleHover: 1
    });
    const i = new scope.ShaderMaterial({
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
          value: 0
        },
        uShadowOffset: {
          value: .01175
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
                    float offset = (instanceSeed * 2.0 - 1.0) * 0.0125;
                    vec3 dir = normalize(vec3(position.xy, 0.0));
                    localPos += dir * offset;

                    float scaleShow = falloff(insID, 0.0, ${e.instanceCount.toFixed(1)}, 5.0, uShow);
                    float steps = floor(2.0 + fract(uSeed * 4.35452 + insID * 23.546) * 3.0);
                    float scaleShowStepped = floor(scaleShow * steps) / steps;

                    localPos.xy *= scaleHover * scaleShowStepped;

                    if (side == 1) {
                        float offsetScale = scaleHover == 1.0 ? 1.0 : 0.4;
                        localPos.xy += uShadowOffset * vec2(1.0, -1.0) * offsetScale;
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
    this.geo = e, this.mesh = new scope.InstancedMesh(e, i, e.instanceCount), this.mesh.name = "trait squares", this.mesh.frustumCulled = !1, this.mesh.visible = !1, this.mesh.renderOrder = -10;
    const [s, a, o, l, c, h] = await Promise.all([scope.glyphLoader.loadTexture("ui/cross.icon", "band"), scope.glyphLoader.loadTexture("ui/cross.icon", "curve"), scope.glyphLoader.loadTexture("ui/arrow.icon", "band"), scope.glyphLoader.loadTexture("ui/arrow.icon", "curve"), scope.glyphLoader.loadGeometry("ui/cross.icon", {
        size: .115
      }), scope.glyphLoader.loadGeometry("ui/arrow.icon", {
        size: .115
      })]),
      d = new scope.ShaderMaterial({
        uniformsGroups: [scope.global$1.UBO],
        uniforms: {
          tCurve: {
            value: a
          },
          tBand: {
            value: s
          },
          uPosY: {
            value: this.closeY
          },
          uScale: {
            value: 1
          },
          uHover: {
            value: 1
          },
          uShow: {
            value: 0
          }
        },
        vertexShader: `
                uniform float uHover;
                uniform float uPosY;
                uniform float uShow;
                uniform float uScale;

                ${scope.globalUBO_default}
                ${scope.falloff_default}
                ${scope.slugvs_default}

                varying vec2 vUv;

                void main() {
                    vUv = uv;

                    float last = ${e.instanceCount.toFixed(1)};
                    float scaleShow = falloff(last, 0.0, last, 5.0, uShow);
                    float scaleShowStepped = floor(scaleShow * 3.0) / 3.0;

                    vec3 pos = SlugVS() * 0.95 * uScale * vec3(vec2(uHover), 1.0) * scaleShowStepped + vec3(0.0, uPosY, 0.0);

                    // apply scale and
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);;
                }
            `,
        fragmentShader: `
                varying vec2 vUv;

                ${scope.slugfs_default}

                uniform sampler2D tCurve;
                uniform usampler2D tBand;

                void main() {
                    vec4 color = RenderSlug(tCurve, tBand, vTexCoord, vColor, vBanding, vGlyph);

                    if (color.w * vColor.w < 0.001) discard;
                    gl_FragColor = vec4(color.xyz, 1.0);
                }
            `,
        depthWrite: !1,
        depthTest: !1
      });
    this.meshClose = new scope.Mesh(c, d), this.meshClose.name = "trait close", this.meshClose.frustumCulled = !1, this.meshClose.visible = !1, this.meshClose.renderOrder = -5;
    const p = new scope.InstancedBufferGeometry();
    p.instanceCount = 8;
    for (const _ in h.attributes) p.setAttribute(_, h.attributes[_]);
    p.setIndex(h.index), p.setAttribute("hover", new scope.InstancedBufferAttribute(new Float32Array(e.instanceCount).fill(1), 1)), this.arrowGeo = p;
    const f = new scope.ShaderMaterial({
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        tCurve: {
          value: l
        },
        tBand: {
          value: o
        },
        uSeed: {
          value: Math.random()
        },
        uShow: {
          value: 0
        }
      },
      vertexShader: `
                attribute float hover;

                uniform float uSeed;
                uniform float uShow;

                ${scope.globalUBO_default}
                ${scope.rotate_default}
                ${scope.falloff_default}
                ${scope.slugvs_default}

                varying vec2 vUv;

                void main() {
                    vUv = uv;

                    mat4 imvpMatrix = projectionMatrix * modelViewMatrix * instanceMatrix;
                    vec3 pos = SlugVS(imvpMatrix) * vec3(vec2(hover), 1.0);
                    if (gl_InstanceID % 2 == 0) pos *= rotateZ(3.1416);

                    float insID = float(gl_InstanceID);
                    float scaleShow = falloff(insID, 0.0, ${e.instanceCount.toFixed(1)}, 5.0, uShow);
                    float steps = floor(2.0 + fract(uSeed * 45.35452 + insID * 2.546) * 3.0);
                    float scaleShowStepped = floor(scaleShow * steps) / steps;
                    pos *= scaleShowStepped;

                    gl_Position = imvpMatrix * vec4(pos, 1.0);;
                }
            `,
      fragmentShader: `
                varying vec2 vUv;

                ${scope.slugfs_default}

                uniform sampler2D tCurve;
                uniform usampler2D tBand;

                void main() {
                    vec4 color = RenderSlug(tCurve, tBand, vTexCoord, vColor, vBanding, vGlyph);

                    if (color.w * vColor.w < 0.001) discard;
                    gl_FragColor = vec4(color.xyz, 1.0);
                }
            `,
      depthWrite: !1,
      depthTest: !1
    });
    this.meshArrow = new scope.InstancedMesh(p, f, p.instanceCount), this.meshArrow.name = "trait arrows", this.meshArrow.frustumCulled = !1, this.meshArrow.visible = !1, this.meshArrow.renderOrder = -5, this.resize(), this.scene.beforeRenderCbs.push(() => {
      var x, b, T;
      const _ = (T = (b = (x = this.scene.controller) == null ? void 0 : x.planetScene) == null ? void 0 : b.characters) == null ? void 0 : T.mesh;
      _ && (this.mesh.position.copy(_._localObject.position), this.mesh.quaternion.copy(this.scene.camera.quaternion), this.meshArrow.position.copy(_._localObject.position), this.meshArrow.quaternion.copy(this.scene.camera.quaternion), this.meshClose.position.copy(_._localObject.position), this.meshClose.quaternion.copy(this.scene.camera.quaternion));
    }), this.interaction = new scope.meshInteraction({
      camera: this.scene.camera,
      meshes: [this.mesh],
      hoverCursor: !0,
      onHover: this.hover.bind(this),
      onTouch: this.touch.bind(this),
      onClick: this.click.bind(this)
    }), scope.events$1.on("character_change_traits_show", this.show, this), scope.events$1.on("character_change_traits_hide", this.hide, this), scope.events$1.on("end_screen_show", () => {
      this.hide(!1);
    }), scope.events$1.on("keydown", this.onKey, this), this.scene.add(this.mesh), this.scene.add(this.meshClose), this.scene.add(this.meshArrow), this.ready.resolve();
  }
  show() {
    var e, i, s;
    this.shown || !((s = (i = (e = this.scene.controller) == null ? void 0 : e.planetScene) == null ? void 0 : i.characters) != null && s.mesh) || this.scene.controller.planetScene.characters.isCameraLockingInteractingElement() || this.scene.controller.planetScene.characters.mesh._collisionPhysics._isOnFloor === !1 || this.scene.controller.planetScene.camera.overwriteAmount > 0 || (this.shown = !0, this.scene.controller.planetScene.characters.mesh.interactingElement = "self", this.mesh.material.uniforms.uSeed.value = Math.random(), scope.createTween(this.mesh.material.uniforms.uShow, {
      to: {
        value: 1
      },
      duration: .55,
      delay: .25,
      ease: "none",
      onStart: () => {
        this.mesh.visible = !0, this.meshClose.visible = !0, this.meshArrow.visible = !0;
      },
      onUpdate: () => {
        this.meshClose.material.uniforms.uShow.value = this.mesh.material.uniforms.uShow.value, this.meshArrow.material.uniforms.uShow.value = this.mesh.material.uniforms.uShow.value;
      }
    }), this.interaction.enable(), scope.events$1.emit("webgl_play_audio", "customize"), scope.events$1.emit("character_change_traits_shown"));
  }
  hide(e = !0) {
    this.shown && (this.shown = !1, this.scene.controller.planetScene.characters.mesh.interactingElement = null, scope.createTween(this.mesh.material.uniforms.uShow, {
      to: {
        value: 0
      },
      duration: .5,
      delay: 0,
      ease: "none",
      onUpdate: () => {
        this.meshClose.material.uniforms.uShow.value = this.mesh.material.uniforms.uShow.value, this.meshArrow.material.uniforms.uShow.value = this.mesh.material.uniforms.uShow.value;
      },
      onComplete: () => {
        this.mesh.visible = !1, this.meshClose.visible = !1, this.meshArrow.visible = !1;
      }
    }), this.interaction.disable(), scope.events$1.emit("webgl_stop_audio", "customize"), e && scope.events$1.emit("character_change_traits_hiddden"));
  }
  hover(e) {
    if (e.action !== "hover_in") return;
    const i = e.interactions[0].instanceId,
      s = this.mesh.geometry._animObjs[i],
      a = Math.random() * 22.34,
      o = Math.random() * 3.34;
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
        this.mesh.geometry.attributes.hover.setX(i, a), this.mesh.geometry.attributes.hover.needsUpdate = !0, i === this.geo.instanceCount - 1 ? this.meshClose.material.uniforms.uHover.value = .935 : (this.meshArrow.geometry.attributes.hover.setX(i, .935), this.meshArrow.geometry.attributes.hover.needsUpdate = !0);
      },
      onComplete: () => {
        this.mesh.geometry.attributes.hover.setX(i, o), this.mesh.geometry.attributes.hover.needsUpdate = !0, i === this.geo.instanceCount - 1 ? this.meshClose.material.uniforms.uHover.value = 1 : (this.meshArrow.geometry.attributes.hover.setX(i, 1), this.meshArrow.geometry.attributes.hover.needsUpdate = !0);
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
    var a;
    (a = e.interactions) != null && a.length && (this.lastTouched = e.interactions[0].instanceId);
    const i = e.action === "touch_start",
      s = this.mesh.geometry._animObjs[this.lastTouched];
    scope.createTween(s, {
      to: {
        scaleHover: 1
      },
      duration: 0,
      ease: "none",
      onComplete: () => {
        this.mesh.geometry.attributes.scaleHover.setX(this.lastTouched, i ? .925 : 1), this.mesh.geometry.attributes.scaleHover.needsUpdate = !0, this.lastTouched === this.geo.instanceCount - 1 ? this.meshClose.material.uniforms.uHover.value = i ? .9 : 1 : (this.meshArrow.geometry.attributes.hover.setX(this.lastTouched, i ? .9 : 1), this.meshArrow.geometry.attributes.hover.needsUpdate = !0);
      }
    }), scope.createTween(s, {
      to: {
        hover: 1
      },
      duration: 0,
      ease: "none",
      onComplete: () => {
        this.mesh.geometry.attributes.hover.setX(this.lastTouched, Math.random() * 43.23), this.mesh.geometry.attributes.hover.needsUpdate = !0;
      }
    }), scope.events$1.emit("webgl_play_audio", `click${i ? 2 : 3}`);
  }
  click(e) {
    const i = e.interactions[0].instanceId;
    if (i === this.geo.instanceCount - 1) return this.hide();
    const {
        accessory: s,
        action: a
      } = scope.mapping[i],
      o = Object.keys(scope.ACCESSORIES),
      l = [...scope.client$1.localStorage.modelFiles],
      c = o.indexOf(s),
      h = l[c],
      d = scope.ACCESSORIES[s].indexOf(h);
    if (d === -1) return;
    let p = d + a;
    p < 0 ? p = scope.ACCESSORIES[s].length - 1 : p = p % scope.ACCESSORIES[s].length, l[c] = scope.ACCESSORIES[s][p], this.scene.controller.planetScene.characters.setAccessories(l.filter(f => f !== "base"));
  }
  onKey(e) {
    e.code === "KeyL" ? this[this.shown ? "hide" : "show"]() : e.code === "Escape" && this.hide();
  }
  resize() {
    const e = this.scene.aspect > 1,
      i = e ? this.offsetX : this.offsetX * .875,
      s = e ? this.offsetXArrow : this.offsetXArrow * .875,
      a = scope.math.lerp(1, 1300 / scope.client$1.screen.h, .3),
      o = 9;
    for (let l = 0; l < o; l++) l === o - 1 ? (scope._obj$1.position.set(0, this.closeY, 0), scope._obj$1.scale.setScalar(1.15 * a)) : (scope._obj$1.position.set(i * (l % 2 === 0 ? -1 : 1), this.baseY + Math.floor(l / 2) * this.offsetY, 0), scope._obj$1.scale.setScalar(1 * a), scope._obj2.position.set(s * (l % 2 === 0 ? -1 : 1), this.baseY + Math.floor(l / 2) * this.offsetY, 0), scope._obj2.scale.setScalar(1 * a)), scope._obj$1.updateMatrix(), scope._obj2.updateMatrix(), this.mesh.setMatrixAt(l, scope._obj$1.matrix), l < o - 1 && this.meshArrow.setMatrixAt(l, scope._obj2.matrix);
    this.meshClose.material.uniforms.uScale.value = a, this.mesh.material.uniforms.uShadowOffset.value = .01175 * a, this.mesh.computeBoundingBox(), this.mesh.computeBoundingSphere(), this.mesh.instanceMatrix.needsUpdate = !0, this.meshArrow.instanceMatrix.needsUpdate = !0;
  }
};
}
