/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1816648:1824780.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2134(scope) {
scope.titlebox$1 = class titlebox$1 {
  constructor(e) {
    this.dialog = e, this.ready = scope.miscutils.deferred(), this.defaultColor = new scope.Color("#66BDE6"), this.color = this.defaultColor.clone(), this.font = "heading.font", this.init();
  }
  async init() {
    const e = this.dialog.scene.squareGeo3;
    this.bg = new scope.Mesh(e, new scope.ShaderMaterial({
      userData: {
        hotReload: "titlebox-bg"
      },
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        uColor: {
          value: new scope.Color("#66BDE6")
        },
        uColorShadow: {
          value: new scope.Color("#488BAA")
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

                    float vertSeed = fract(uSeed * 72.32 + float(vertid) * 36.223 + scaleShowStepped * 62.543);
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
                            wPos.xy -= (uv * 2.0 - 1.0) * step(0.01, uShow) * 5.0; // px inward
                            vColor = -uColor;
                            //vColor = uColor * 0.3; // debug
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
    })), this.bg.name = "title bg", this.bg.frustumCulled = !1, this.bg.renderOrder = -2, this.bg.visible = !1, this.bg.matrixAutoUpdate = !1;
    const [i, s] = await Promise.all([scope.glyphLoader.loadTexture(this.font, "band"), scope.glyphLoader.loadTexture(this.font, "curve")]);
    this.text = new scope.meshText({
      font: this.font,
      small: !1,
      text: "office worker".toUpperCase(),
      size: 1,
      width: 20,
      letterSpacing: 0,
      lineHeight: 1.1,
      color: "#ffffff",
      align: "left",
      shadow: !0,
      shadowX: .08,
      shadowY: .08,
      shadowColor: "#0f0f0f"
    }, new scope.ShaderMaterial({
      name: "title text",
      defines: {},
      userData: {
        hotReload: "title text"
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
                        float trShow = floor(falloff(textWeights.y, 0.0, 1.0, 1.5, uShow) * stepsShow) / stepsShow;
                        vTexCoord += vec2(0.0, 1.0) * (1.0 - trShow);

                        // hide
                        float stepsHide = floor(2.0 + seed * 2.0);
                        float trHide = 1.0 - floor(uHide * (stepsHide + 1.0)) / (stepsHide + 1.0);
                        pos -= centr;
                        pos *= trShow;
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
                    // animation

                    vec2 uv = vTexCoord;
                    vec4 color = RenderSlug(tCurve, tBand, uv, vColor, vBanding, vGlyph);

                    // skip outline
                    gl_FragColor = vec4(-color.xyz, color.w * vColor.w);
                }
            `,
      transparent: !0,
      depthWrite: !1
    })), this.text.name = "title text", this.text.frustumCulled = !1, this.text.rederOrder = -1, this.text.visible = !1, this.text.matrixAutoUpdate = !1, await this.text.ready, this.dialog.dialogCnt.add(this.bg), this.dialog.dialogCnt.add(this.text), this.updateColors(), this.ready.resolve();
  }
  updateColors(e = null) {
    e ? this.color.setStyle(e) : this.color.copy(this.defaultColor), scope._c0$2.copy(this.color).offsetHSL(0, -.3, -.2), this.bg.material.uniforms.uColor.value.copy(this.color), this.bg.material.uniforms.uColorShadow.value.copy(scope._c0$2);
  }
  show(e = 0, i = null, s) {
    this.bg.visible = !1, this.text.visible = !1, this.updateColors(i), this.bg.material.uniforms.uSeed.value = Math.random(), scope.createTween(this.bg.material.uniforms.uShow, {
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
      duration: .35,
      ease: "none",
      delay: e + .25,
      onStart: () => {
        this.text.visible = !0;
      }
    });
  }
  hide(e = 0) {
    scope.createTween(this.text.material.uniforms.uHide, {
      to: {
        value: 1
      },
      duration: .05,
      ease: "none",
      delay: e,
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
      duration: .1,
      ease: "none",
      delay: e + .05,
      onComplete: () => {
        this.bg.visible = !1;
      }
    });
  }
  async update(e = "placeholder title") {
    this.text.setText(e.toUpperCase(), !1), await this.resize();
  }
  async resize() {
    const e = this.dialog.scene,
      i = this.dialog.textBox,
      s = e.mobile ? 15 : 25,
      a = e.mobile ? 20 : 30,
      o = e.mobile ? 18 : 22,
      l = e.mobile ? 20 : 25,
      c = e.mobile ? 25 : e.small ? 30 : 35,
      h = i.bg.scale.x - a * 2 + s,
      d = e.mobile ? -.005 : -.01;
    await this.text.update({
      size: c,
      width: h,
      letterSpacing: d
    });
    const p = this.text.size.x + a * 2,
      f = this.text.size.y + this.text.topAlign + o + l;
    this.bg.scale.set(p, f, 1), this.bg.position.set(i.bg.position.x - i.bg.scale.x * .5 + p * .5 - s, i.bg.position.y + i.bg.scale.y * .5 + f * .5 - 10, 0), this.text.position.set(this.bg.position.x - this.bg.scale.x * .5 + a, this.bg.position.y - this.bg.scale.y * .5 + this.text.size.y + l, 0), this.bg.updateMatrix(), this.text.updateMatrix();
  }
};
}
