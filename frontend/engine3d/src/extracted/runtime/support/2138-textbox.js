/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1835434:1847623.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2138(scope) {
scope.textbox = class textbox {
  constructor(e) {
    this.dialog = e, this.ready = scope.miscutils.deferred(), this.volumes = {
      dialogue: 0
    }, this.font = "UglyDave-Alternates-optimized.font", this.icon = "ui/cross.icon", this.iconAspect = 1, this.init();
  }
  async init() {
    const e = this.dialog.scene.squareGeo3;
    this.bg = new scope.Mesh(e, new scope.ShaderMaterial({
      userData: {
        hotReload: "questbox-bg"
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
        uTextAdjust: {
          value: new scope.Vector4()
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
                uniform vec4 uTextAdjust;

                varying vec2 vUv;
                flat varying vec3 vColor;

                void main() {
                    vec3 localPos = position;

                    float steps = 4.0;
                    float scaleShowStepped = floor(uShow * steps) / steps;

                    float vertSeed = fract(uSeed * 533.32 + float(vertid) * 210.67644 + scaleShowStepped * 34.5435);
                    float offset = (vertSeed * 2.0 - 1.0) * 0.02;
                    vec3 dir = normalize(vec3(position.xy, 0.0));
                    localPos += dir * offset;

                    vec4 pos = vec4(localPos * scaleShowStepped, 1.0);
                    vec4 wPos = modelMatrix * pos;

                    vUv = uv;
                    vColor = uColor;

                    if (scaleShowStepped > 0.0) {
                        if (side == 1) { // backdrop shadow
                            wPos.xy += uShadowOffset * vec2(1.0, -1.0);
                            vColor = uColorShadow;
                        } else if (side == 2) { // inside to prevent outlines due to color changes
                            vec4 uAdjust = uTextAdjust * uShow;

                            if (uv.x < 0.5) wPos.x += uAdjust.x;
                            else wPos.x -= uAdjust.y;
                            if (uv.y < 0.5) wPos.y += uAdjust.z;
                            else wPos.y -= uAdjust.w;
                            wPos.y -= 6.0;

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
    })), this.bg.name = "text bg", this.bg.frustumCulled = !1, this.bg.renderOrder = -10, this.bg.visible = !!scope.client$1.devScene, this.bg.matrixAutoUpdate = !1;
    const [i, s, a, o, l] = await Promise.all([scope.glyphLoader.loadTexture(this.font, "band"), scope.glyphLoader.loadTexture(this.font, "curve"), scope.glyphLoader.loadTexture(this.icon, "band"), scope.glyphLoader.loadTexture(this.icon, "curve"), scope.glyphLoader.loadGeometry(this.icon, {
      size: 1
    })]);
    this.text = new scope.meshText({
      font: this.font,
      small: !1,
      text: "GO BACK TO THE MAN IN THE CAVE AND DELIVER THE CLOTHES".toUpperCase(),
      size: 1,
      width: 27,
      letterSpacing: -.05,
      lineHeight: 1.1,
      color: "#0f0f0f",
      align: "left"
    }, new scope.ShaderMaterial({
      name: "textbox text",
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
    })), this.text.name = "Textbox Text", this.text.frustumCulled = !1, this.text.rederOrder = -5, this.text.visible = !!scope.client$1.devScene, this.text.matrixAutoUpdate = !1, await this.text.ready, this.iconMesh = new scope.Mesh(l, new scope.ShaderMaterial({
      name: "quest-icon",
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        uShow: {
          value: scope.client$1.devScene ? 1 : 0
        },
        uSeed: {
          value: Math.random()
        },
        uColor: {
          value: new scope.Color("#FFFFFF")
        },
        uOverwriteColor: {
          value: !1
        },
        tBand: {
          value: a
        },
        tCurve: {
          value: o
        }
      },
      vertexShader: `
                uniform float uShow;
                uniform float uSeed;
                uniform vec3 uColor;
                uniform bool uOverwriteColor;

                varying vec2 vUv;

                ${scope.globalUBO_default}
                ${scope.slugvs_default}
                ${scope.falloff_default}
                ${scope.rotate_default}

                float hash11(float p) {
                    p = fract(p * .1031);
                    p *= p + 33.33;
                    p *= p + p;
                    return fract(p);
                }

                void main() {
                    vUv = uv;
                    vec3 pos = SlugVS();

                    float rot = floor((time * 0.5 + uSeed * 34.23) * 7.0) / 7.0;
                    float angle = 0.03;
                    pos *= rotateZ(mix(-angle, angle, hash11(rot)));

                    float scaleShow = uShow;
                    float steps = floor(2.0 + fract(uSeed * 54.35452) * 3.0);
                    float scaleShowStepped = floor(scaleShow * steps) / steps;
                    pos *= scaleShowStepped;

                    if (uOverwriteColor) vColor.rgb = uColor;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
      fragmentShader: `
                uniform sampler2D tCurve;
                uniform usampler2D tBand;

                ${scope.slugfs_default}

                varying vec2 vUv;

                void main() {
                    vec4 color = RenderSlug(tCurve, tBand, vTexCoord, vColor, vBanding, vGlyph);

                    if (color.w * vColor.w < 0.001) discard;

                    gl_FragColor = vec4(color.rgb, 1.0);
                }
            `
    })), this.iconMesh.name = "quest icon", this.iconMesh.frustumCulled = !1, this.iconMesh.visible = !!scope.client$1.devScene, this.iconMesh.renderOrder = -4, this.iconMesh.matrixAutoUpdate = !1, this.dialog.questCnt.add(this.bg), this.dialog.questCnt.add(this.text), this.dialog.questCnt.add(this.iconMesh), this.ready.resolve();
  }
  async update(e = "placeholder text", i = "ui/cross.icon") {
    this.text.setText(e.toUpperCase(), !1), this.icon = i;
    const [s, a, o] = await Promise.all([scope.glyphLoader.loadTexture(this.icon, "band"), scope.glyphLoader.loadTexture(this.icon, "curve"), scope.glyphLoader.loadGeometry(this.icon, {
      size: 1
    })]);
    this.iconMesh.geometry.dispose(), this.iconMesh.geometry = o, this.iconAspect = Math.abs(o.boundingBox.max.x - o.boundingBox.min.x) / Math.abs(o.boundingBox.max.y - o.boundingBox.min.y), this.iconMesh.material.uniforms.tBand.value = s, this.iconMesh.material.uniforms.tCurve.value = a, await this.resize();
  }
  show(e = 0, i = !1, s) {
    this.bg.visible = !1, this.text.visible = !1, this.iconMesh.visible = !1;
    const a = typeof i == "string";
    this.iconMesh.material.uniforms.uOverwriteColor.value = a, a && this.iconMesh.material.uniforms.uColor.value.setStyle(i), this.bg.material.uniforms.uSeed.value = Math.random(), scope.createTween(this.bg.material.uniforms.uShow, {
      from: {
        value: 0
      },
      to: {
        value: 1
      },
      duration: .35,
      ease: "none",
      delay: e,
      onStart: () => {
        this.bg.visible = !0;
      }
    });
    const o = scope.meshText.getTextWithoutTags(s).length * (1 / 45);
    scope.createTween(this.text.material.uniforms.uHide, {
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
      duration: o,
      ease: "none",
      delay: e + .35,
      onStart: () => {
        this.text.visible = !0, this.playDialogue(!0);
      },
      onComplete: () => {
        this.playDialogue(!1);
      }
    }), this.iconMesh.material.uniforms.uSeed.value = Math.random(), scope.createTween(this.iconMesh.material.uniforms.uShow, {
      from: {
        value: 0
      },
      to: {
        value: 1
      },
      duration: .2,
      ease: "none",
      delay: e + .35,
      onStart: () => {
        this.iconMesh.visible = !0;
      }
    });
  }
  hide() {
    scope.createTween(this.text.material.uniforms.uHide, {
      to: {
        value: 1
      },
      duration: .05,
      ease: "none",
      delay: 0,
      onComplete: () => {
        this.text.visible = !1;
      }
    }), scope.createTween(this.iconMesh.material.uniforms.uShow, {
      to: {
        value: 0
      },
      duration: .05,
      ease: "none",
      delay: 0,
      onStart: () => {
        this.iconMesh.visible = !1;
      }
    }), scope.createTween(this.bg.material.uniforms.uShow, {
      to: {
        value: 0
      },
      duration: .15,
      ease: "none",
      delay: .05,
      onComplete: () => {
        this.bg.visible = !1;
      }
    }), this.playDialogue(!1);
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
  async resize() {
    const e = this.dialog.scene,
      i = e.marginTop * 1.25,
      s = e.mobile ? 25 : 30,
      a = e.mobile ? 20 : 25,
      o = (e.mobile, 40),
      l = e.mobile ? 20 : 25,
      c = e.mobile ? 45 : e.small ? 65 : 70,
      d = Math.min(450, scope.client$1.screen.width - s * 2 - e.marginLeft - c),
      p = e.mobile ? 15 : 25,
      f = d - a * 2 - p,
      _ = f * .25,
      x = f - _,
      b = e.mobile ? 17 : e.small ? 23 : 25,
      T = e.mobile ? -.02 : -.05;
    await this.text.update({
      size: b,
      width: x,
      letterSpacing: T
    });
    const M = scope.client$1.screen.width * .5 - e.marginLeft - c - s,
      w = Math.max(0, d * .5 - M),
      D = Math.max(this.text.size.y, _),
      R = D + o + l,
      P = -scope.client$1.screen.height + i;
    this.bg.scale.set(d, R, 1), this.bg.position.set(scope.client$1.screen.width * .5 - w, P + R * .5, 0);
    const U = this.iconAspect > 1 ? _ / this.iconAspect : _;
    this.iconMesh.scale.set(U, U, 1), this.iconMesh.position.set(this.bg.position.x - d * .5 + a + _ * .5, this.bg.position.y, 0), this.text.position.set(this.iconMesh.position.x + _ * .5 + p, P + R - o - (D - this.text.size.y) * .5, 0), this.bg.material.uniforms.uTextAdjust.value.set(a + _ + p * .5, a, l, o - this.text.topAlign), this.bg.updateMatrix(), this.text.updateMatrix(), this.iconMesh.updateMatrix();
  }
};
}
