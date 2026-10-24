/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1800761:1805884.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2129(scope) {
scope.title = class title {
  constructor(e, i) {
    this.titles = e, this.scene = e.scene, this.globalUI = e.globalUI, this.data = i, this.font = "planet.font", this.ready = scope.miscutils.deferred(), this.shown = !1, this.init();
  }
  async init() {
    const [e, i] = await Promise.all([scope.glyphLoader.loadTexture(this.font, "band"), scope.glyphLoader.loadTexture(this.font, "curve")]);
    this.mesh = new scope.meshText({
      font: this.font,
      small: !1,
      text: this.data.text.toUpperCase(),
      size: 1,
      width: 5,
      letterSpacing: -.05,
      lineHeight: .8,
      color: "#F8F8F8",
      align: "left",
      shadow: !0,
      shadowX: .04,
      shadowY: .04,
      shadowColor: "#647A87"
    }, new scope.ShaderMaterial({
      name: "zone",
      defines: {},
      userData: {
        hotReload: "titles"
      },
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        tCurve: {
          value: i
        },
        tBand: {
          value: e
        },
        uSeed: {
          value: Math.random()
        },
        tNoise: {
          value: scope.textureLoader.load("noise-simplex-layered-pixellated-highq.ktx2", "linearfilter-repeat")
        },
        uShow: {
          value: scope.client$1.devScene ? 1 : 0
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
                ${scope.rotate_default}
                ${scope.slugvs_default}

                float hash11(float p) {
                    p = fract(p * .1031);
                    p *= p + 33.33;
                    p *= p + p;
                    return fract(p);
                }

                float hash13(vec3 p3) {
                    p3  = fract(p3 * .1031);
                    p3 += dot(p3, p3.zyx + 31.32);
                    return fract((p3.x + p3.y) * p3.z);
                }

                void main() {
                    vCentr = centr;
                    vec3 pos = SlugVS();

                    pos -= centr;
                    float rotSeed = hash11(centr.x + centr.y);
                    pos = rotateZ((rotSeed * 2.0 - 1.0) * 0.075) * pos;
                    pos += centr;

                    // animation
                    if (uShow < 1.0 || uHide > 0.0) {
                        float seed = fract(hash13(centr));
                        float steps = floor(2.0 + seed * 2.0);
                        pos -= centr;

                        // scale
                        float trShow = floor(pow(falloff(textWeights.x, 0.0, 1.0, 0.5, uShow), 2.0) * steps) / steps;
                        float trHide = 1.0 - floor(uHide * (steps + 1.0)) / (steps + 1.0);
                        pos *= trShow;
                        pos *= trHide;

                        // rotate doesn't fit very well the style

                        pos += centr;
                    }

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
      fragmentShader: `
                uniform sampler2D tCurve;
                uniform usampler2D tBand;
                uniform sampler2D tNoise;
                uniform float uSeed;

                flat varying vec3 vCentr;

                ${scope.globalUBO_default}
                ${scope.slugfs_default}
                ${scope.transformUV_default}

                void main() {
                    // animation
                    float seed = uSeed + vCentr.x;

                    vec2 uv = vTexCoord;

                    float steppedTime = floor(time * 7.0 * 0.45 * mix(fract(seed), 0.8, 1.0) + seed * 15.3423) / 7.0;
                    vec2 noiseUv = rotateUV(uv * 0.15, steppedTime);
                    vec2 n0 = texture(tNoise, noiseUv).rg * 2.0 - 1.0;
                    uv += n0 * 0.02;

                    vec4 color = RenderSlug(tCurve, tBand, uv, vColor, vBanding, vGlyph);

                    if (color.w * vColor.w < 0.0001) discard;

                    gl_FragColor = vec4(color.xyz, 1.0);
                }
            `,
      depthWrite: !1
    })), this.mesh.name = `Title: ${this.data.text}`, this.mesh.frustumCulled = !1, this.mesh.visible = !1, this.mesh.renderOrder = -50, this.mesh.matrixAutoUpdate = !1, this.mesh.rotation.z = .05, await this.mesh.ready, this.titles.titlesCnt.add(this.mesh), this.ready.resolve();
  }
  show(e = 0) {
    this.shown = !0, scope.createTween(this.mesh.material.uniforms.uHide, {
      to: {
        value: 0
      }
    }), scope.createTween(this.mesh.material.uniforms.uShow, {
      from: {
        value: 0
      },
      to: {
        value: 1
      },
      duration: 1.5,
      ease: "none",
      delay: e,
      onStart: () => {
        scope.events$1.emit("webgl_play_audio", "title"), this.mesh.visible = !0;
      },
      onComplete: () => {
        this.hide(4);
      }
    });
  }
  hide(e = 0) {
    this.shown && (scope.createTween(this.mesh.material.uniforms.uShow, {
      to: {
        value: 1
      }
    }), scope.createTween(this.mesh.material.uniforms.uHide, {
      to: {
        value: 1
      },
      duration: .35,
      ease: "none",
      delay: e,
      onStart: () => {},
      onComplete: () => {
        this.shown = !1, this.mesh.visible = !1;
      }
    }));
  }
  async resize() {
    const e = this.scene.mobile ? 55 : this.scene.small ? 85 : 110,
      i = this.scene.mobile ? 45 : this.scene.small ? 65 : 70,
      s = this.scene.mobile ? 20 : 40,
      a = this.scene.mobile ? 375 : this.scene.small ? 600 : 750,
      o = Math.min(scope.client$1.screen.w, a) - this.scene.marginLeft * 2 - i - s;
    await this.mesh.update({
      size: e,
      width: o
    }), this.mesh.position.set(this.scene.marginLeft, -scope.client$1.screen.height + this.mesh.size.y + this.scene.marginTop * 1.5, 0), this.mesh.updateMatrix();
  }
};
}
