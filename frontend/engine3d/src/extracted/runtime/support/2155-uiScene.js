/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1895770:1901499.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2155(scope) {
scope.uiScene = class uiScene extends scope.scene {
  constructor(e = {}) {
    super({
      cameraType: "orthographic"
    }), this.controller = e.mainController, this.outlineColor = "#455762", this.boxVolume = {
      value: 0
    }, this.init();
  }
  async init() {
    this.cameraOptions(), this.domContainer = document.createElement("div"), this.domContainer.id = "global-ui", this.domContainer.style.cssText = "position: absolute; top: 0; left: 0; width: 0; height: 0;", document.querySelector("#webgl").appendChild(this.domContainer), this.scene2D = new scope.scene2D({
      mainController: this.controller,
      globalUI: this
    }), this.scene3D = new scope.scene3D({
      mainController: this.controller,
      globalUI: this
    }), await Promise.all([this.scene2D.uploaded, this.scene3D.uploaded]), this.createProcessing(), this.beforeRenderCbs.push(this.update.bind(this)), scope.client$1.devScene && this.debug(), this.isReady();
  }
  cameraOptions() {
    this.camera.lerpPosition = 0, this.camera.lerpTarget = 0, this.camera.lerpRotation = 0;
  }
  createProcessing() {
    this.composer = new scope.effectComposerExtended({
      scene: this.scene3D
    }), this.pass2D = new scope.RenderPass$1(this.scene2D, this.scene2D.camera, void 0, !1, !1), this.pass2D.clear = !1, this.composer.addPass(this.pass2D), this.blendMesh = new scope.Mesh(scope.utils.triangle, new scope.ShaderMaterial({
      uniformsGroups: [scope.global$1.UBO],
      name: "globalUI",
      uniforms: {
        tMap: {
          value: null
        },
        uOutlineColor: {
          value: new scope.Color(this.outlineColor)
        },
        uSmoothMargin: {
          value: .05
        },
        uThreshold: {
          value: .01
        }
      },
      vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
      fragmentShader: `
                ${scope.globalUBO_default}
                ${scope.fit_default}

                uniform sampler2D tMap;
                uniform float uSmoothMargin;
                uniform vec3 uOutlineColor;
                uniform float uThreshold;

                varying vec2 vUv;

                const vec2 dirs[5] = vec2[5](vec2(0, 0), vec2(-1, 0), vec2(1, 0), vec2(0, -1), vec2(0, 1)); // center, left, right, bottom, top

                void main() {
                    float scale = 1.0; // important

                    vec2 offset = 1.0 / vec2(textureSize(tMap, 0)) * scale;
                    vec4 colors[5];

                    // keep track of alphas and minimum color value to skip computations or outlines entirely
                    float maxAlpha = 0.0;
                    float minColorValue = 0.0;
                    vec4 tcolor;

                    #pragma unroll_loop_start
                    for (int i = 0; i < 5; i++) {
                        tcolor = texture(tMap, vUv + offset * dirs[i]);
                        colors[i] = abs(tcolor);
                        maxAlpha = max(maxAlpha, colors[i].a);
                        minColorValue = min(minColorValue, min(tcolor.r, min(tcolor.g, tcolor.b)));
                    }
                    #pragma unroll_loop_end

                    // early out: no alpha changes
                    if (maxAlpha == 0.0) discard;

                    // no outline if color is negative and alpha is equal or lower than 1. pure black is not valid
                    if (minColorValue < 0.0 && maxAlpha <= 1.0) {
                        gl_FragColor = colors[0];
                        return;
                    }

                    vec3 centerColor = colors[0].rgb;
                    vec3 variationLeft = abs(colors[1].rgb - centerColor);
                    vec3 variationRight = abs(colors[2].rgb - centerColor);
                    vec3 variationBottom = abs(colors[3].rgb - centerColor);
                    vec3 variationTop = abs(colors[4].rgb - centerColor);

                    // clamp differences in alpha since values can range from 0 to 2, so the smoothing is normalized
                    float centerAlpha = colors[0].a;
                    float variationLeftAlpha = clamp(abs(colors[1].a - centerAlpha), 0.0, 1.0);
                    float variationRightAlpha = clamp(abs(colors[2].a - centerAlpha), 0.0, 1.0);
                    float variationBottomAlpha = clamp(abs(colors[3].a - centerAlpha), 0.0, 1.0);
                    float variationTopAlpha = clamp(abs(colors[4].a - centerAlpha), 0.0, 1.0);

                    vec4 delta;
                    delta.x = max(max(max(variationLeft.r, variationLeft.g), variationLeft.b), variationLeftAlpha);
                    delta.y = max(max(max(variationTop.r, variationTop.g), variationTop.b), variationTopAlpha);
                    delta.z = max(max(max(variationRight.r, variationRight.g), variationRight.b), variationRightAlpha);
                    delta.w = max(max(max(variationBottom.r, variationBottom.g), variationBottom.b), variationBottomAlpha);

                    vec2 maxDelta = max(delta.xy, delta.zw);
                    float maxDeltaValue = max(maxDelta.x, maxDelta.y);

                    vec3 color = mix(centerColor, uOutlineColor, smoothstep(uThreshold, uThreshold + uSmoothMargin, maxDeltaValue));

                    gl_FragColor = vec4(color, 1.0);
                }
            `,
      transparent: !0
    })), this.blendMesh.name = "Global UI Blend Mesh", this.blendMesh.frustumCulled = !1, this.blendMesh.matrixAutoUpdate = !1, this.blendMesh.matrixWorldAutoUpdate = !1, this.add(this.blendMesh);
  }
  update() {
    this.composer.render(), this.blendMesh.material.uniforms.tMap.value = this.composer.readBuffer.texture;
  }
  playBoxAudio(e = .5) {
    scope.createTween(this.boxVolume, {
      to: {
        value: 1
      },
      duration: e * .05,
      onUpdate: () => {
        scope.events$1.emit("webgl_set_audio_volume", "paper4", this.boxVolume.value * .4);
      }
    }), scope.createTween(this.boxVolume, {
      from: {
        value: 1
      },
      to: {
        value: 0
      },
      overwrite: !1,
      delay: e * (1 - .05),
      duration: e * .05 + .2,
      onUpdate: () => {
        scope.events$1.emit("webgl_set_audio_volume", "paper4", this.boxVolume.value * .4);
      }
    });
  }
};
}
