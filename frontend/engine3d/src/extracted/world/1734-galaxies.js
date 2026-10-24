/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1303839:1307643.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1734(scope) {
scope.galaxies = class galaxies {
  constructor(e, i = {}) {
    this.scene = e, this.options = i, this.ready = new Promise(s => {
      this.isReady = s;
    }), this.init();
  }
  async init() {
    const e = await scope.geometryLoader.load("planets/present/intro/galaxies.drc");
    this.mesh = new scope.Mesh(e, new scope.ShaderMaterial({
      userData: {
        hotReload: "Galaxies"
      },
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        uColor1: {
          value: new scope.Color("#4f755a")
        },
        uColor2: {
          value: new scope.Color("#3a726b")
        },
        uColor3: {
          value: new scope.Color("#4b5766")
        },
        tCloudNoise: {
          value: scope.textureLoader.load("clouds_noise_64.ktx2", "srgb-repeat")
        },
        tGalaxy: {
          value: scope.textureLoader.load("galaxy.ktx2", "srgb-repeat")
        },
        uShow: {
          value: 0
        }
      },
      vertexShader: `
                attribute float surfaceId;

                varying vec2 vHighPrecisionZW;
                varying vec2 vUv;
                varying float vSurfaceId;

                void main() {
                    vSurfaceId = surfaceId;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    vHighPrecisionZW = gl_Position.zw;
                }
            `,
      fragmentShader: `
                ${scope.globalUBO_default}
                ${scope.triplanar_default}
                ${scope.colorutils_default}

                layout(location = 1) out highp vec4 gInfo;

                varying vec2 vHighPrecisionZW;
                varying vec2 vUv;
                varying float vSurfaceId;

                uniform sampler2D tCloudNoise;
                uniform sampler2D tGalaxy;
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform vec3 uColor3;
                uniform float uShow;

                mat2 rotation2D(float angle) {
                    float s = sin(angle);
                    float c = cos(angle);
                    return mat2(c, s, -s, c);
                }

                void main() {
                    float spinDir = vSurfaceId > 0.5 ? 1.0 : -1.0;
                    vec2 uv = vUv;
                    uv -= 0.5;
                    uv = rotation2D(floor(time * 2.0 + vSurfaceId * 100.0) * 0.06 * spinDir) * uv;
                    uv *= 1.5;
                    uv += 0.5;

                    float noise = texture2D(tCloudNoise, uv).x;

                    vec2 galaxyUv = vUv;

                    if (fract(vSurfaceId + 0.75) > 0.5) {
                        galaxyUv.x = 1.0 - galaxyUv.x;
                    }

                    float value = texture2D(tGalaxy, galaxyUv).r;
                    value = 1.0 - pow(1.0 - value, 5.0);

                    // make some planet shaped
                    if (fract(vSurfaceId + 0.2) > 0.5) {
                        value = 1.0 - clamp(length(vUv - 0.5) * 8.0, 0.0, 1.0);
                    }

                    value -= noise * mix(0.1, 0.95, fract(vSurfaceId + 0.873));

                    float alpha = step(0.25, value * uShow);

                    if (alpha < 0.9) discard;

                    float colorid = floor(vSurfaceId * 3.0);
                    vec3 color = mix(uColor1, uColor2, clamp(colorid, 0.0, 1.0));
                    color = mix(color, uColor3, clamp(colorid - 1.0, 0.0, 1.0));

                    gl_FragColor = vec4(color, alpha * mix(0.3, 0.4, vSurfaceId));
                    gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec2(0.0), 0.0);
                }
            `,
      transparent: !0,
      blending: scope.CustomBlending,
      blendSrc: scope.SrcAlphaFactor,
      blendSrcAlpha: scope.ZeroFactor,
      blendDst: scope.OneFactor,
      blendDstAlpha: scope.OneFactor
    })), this.mesh.name = "Galaxies", this.mesh.renderOrder = 5, this.scene.add(this.mesh), this.mesh.scale.setScalar(3), this.isReady();
  }
  playInAnimation(e = 0) {
    scope.createTween(this.mesh.material.uniforms.uShow, {
      from: {
        value: 0
      },
      to: {
        value: 1
      },
      duration: 3,
      delay: e,
      ease: "none"
    });
  }
};
}
