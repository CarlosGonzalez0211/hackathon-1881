/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1286228:1288648.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1726(scope) {
scope.atmosphere = class atmosphere {
  constructor(e, i = {}) {
    this.scene = e, this.options = i, this.ready = new Promise(s => {
      this.isReady = s;
    }), this.init();
  }
  init() {
    this.mesh = new scope.Mesh(new scope.SphereGeometry(38, 32, 32), new scope.ShaderMaterial({
      userData: {
        hotReload: "Atmosphere"
      },
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        uColor1: {
          value: new scope.Color("#568f66")
        },
        tCloudNoise: {
          value: scope.textureLoader.load("clouds_noise_64.ktx2", "srgb-repeat")
        },
        uShow: {
          value: 0
        }
      },
      vertexShader: `
                varying vec2 vHighPrecisionZW;
                varying vec3 vNormal;
                varying vec3 vPos;
                varying vec3 vMvPos;

                void main() {
                    vPos = position;
                    vMvPos = vec3(modelViewMatrix * vec4(position, 1.0));
                    gl_Position = projectionMatrix * vec4(vMvPos, 1.0);
                    vHighPrecisionZW = gl_Position.zw;
                    vNormal = normalize(normalMatrix * normal);
                }
            `,
      fragmentShader: `
                ${scope.globalUBO_default}
                ${scope.triplanar_default}

                layout(location = 1) out highp vec4 gInfo;

                varying vec2 vHighPrecisionZW;
                varying vec3 vNormal;
                varying vec3 vMvPos;
                varying vec3 vPos;

                uniform sampler2D tCloudNoise;
                uniform vec3 uColor1;
                uniform float uShow;

                void main() {
                    float fresnel = dot(normalize(vNormal), normalize(vMvPos.xyz));
                    fresnel = abs(fresnel);

                    // main cloud shape
                    float noise = triplanar(tCloudNoise, vNormal, vPos, 0.015).x;
                    noise *= 1.0 - pow(1.0 - fresnel, 2.0);
                    noise *= uShow;

                    if (noise < 0.3) discard;

                    gl_FragColor = vec4(uColor1, 0.434532);
                    gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec2(0.0), 0.0);
                }
            `,
      side: scope.BackSide,
      transparent: !0,
      blending: scope.CustomBlending,
      blendSrc: scope.SrcAlphaFactor,
      blendSrcAlpha: scope.ZeroFactor,
      blendDst: scope.OneFactor,
      blendDstAlpha: scope.OneFactor
    })), this.mesh.name = "Atmosphere", this.mesh.renderOrder = 5, this.scene.add(this.mesh), this.isReady();
  }
  playInAnimation(e = 0) {
    scope.createTween(this.mesh.material.uniforms.uShow, {
      from: {
        value: 0
      },
      to: {
        value: 1
      },
      duration: 2.5,
      delay: e,
      ease: "sine.out"
    });
  }
};
}
